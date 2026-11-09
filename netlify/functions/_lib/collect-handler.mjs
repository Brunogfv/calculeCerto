import { deriveAttribution } from './attribution.mjs';
import { readConfig } from './config.mjs';
import { withTransaction } from './db.mjs';
import {
    emptyResponse,
    getClientIp,
    getCountry,
    getUserAgent,
    jsonResponse,
    lerJson,
    origemPermitida
} from './http.mjs';
import { checkRateLimits } from './rate-limit.mjs';
import { parseUserAgent } from './user-agent.mjs';
import { parseCollectPayload } from './validation.mjs';

const BOT_INICIAL = 'INDETERMINADO';

export function createCollectHandler({ getPool, env = process.env, now = () => new Date() }) {
    const config = readConfig(env);

    return async function handler(request) {
        if (!config.ingestEnabled) {
            return emptyResponse(204, { 'X-Analytics-Status': 'disabled' });
        }

        if (!config.hmacSecret) {
            return jsonResponse(503, { error: 'analytics_not_configured' });
        }

        if (request.method !== 'POST') {
            return jsonResponse(405, { error: 'method_not_allowed' }, { Allow: 'POST' });
        }

        if (!origemPermitida(request, config.allowedOrigins)) {
            return jsonResponse(403, { error: 'origin_not_allowed' });
        }

        const corpo = await lerJson(request, config.maxBodyBytes);
        if (!corpo.ok) {
            return jsonResponse(corpo.status, { error: corpo.motivo });
        }

        const validado = parseCollectPayload(corpo.value);
        if (!validado.ok) {
            return jsonResponse(400, { error: validado.motivo });
        }

        if (!validado.consent) {
            return emptyResponse(204, { 'X-Analytics-Status': 'consent_required' });
        }

        const payload = validado.value;
        const ocorridoEm = new Date(payload.ts);
        const recebidoEm = now();
        const ua = getUserAgent(request);
        const uaInfo = parseUserAgent(ua);
        const ip = getClientIp(request);
        const isTest = payload.context?.is_test === true || uaInfo.isHeadless;
        const country = getCountry(request, config.countryHeader);
        const attribution = deriveAttribution(payload.page.utm || {}, payload.page.referrer || null);

        let pool;
        try {
            pool = getPool();
        } catch {
            return jsonResponse(503, { error: 'analytics_unavailable' });
        }

        try {
            const rate = await checkRateLimits({
                pool,
                ip,
                sessionId: payload.session_id,
                visitorId: payload.visitor_id,
                limits: config.rateLimits,
                now: recebidoEm,
                hmacSecret: config.hmacSecret
            });

            if (!rate.permitido) {
                return jsonResponse(
                    429,
                    { error: 'rate_limited' },
                    { 'Retry-After': String(rate.retryAfterSeconds || 60) }
                );
            }

            await withTransaction(pool, async (client) => {
                await client.query(
                    `INSERT INTO visitors (visitor_id, first_seen_at, last_seen_at)
                     VALUES ($1, $2, $2)
                     ON CONFLICT (visitor_id)
                     DO UPDATE SET last_seen_at = GREATEST(visitors.last_seen_at, EXCLUDED.last_seen_at)`,
                    [payload.visitor_id, ocorridoEm]
                );

                const endedAt = payload.event === 'session_end' ? ocorridoEm : null;
                const exitPath = payload.event === 'pageview' || payload.event === 'session_end'
                    ? payload.page.path
                    : null;

                await client.query(
                    `INSERT INTO sessions (
                        session_id, visitor_id, started_at, last_seen_at, ended_at,
                        landing_path, exit_path, referrer, referrer_host, source, medium, campaign,
                        utm_source, utm_medium, utm_campaign, utm_term, utm_content,
                        device_type, browser, os, screen_width, screen_height, language,
                        country_code, user_agent, is_test, consent_version, updated_at
                    ) VALUES (
                        $1, $2, $3, $3, $4,
                        $5, $6, $7, $8, $9, $10, $11,
                        $12, $13, $14, $15, $16,
                        $17, $18, $19, $20, $21, $22,
                        $23, $24, $25, $26, now()
                    )
                    ON CONFLICT (session_id) DO UPDATE SET
                        last_seen_at = GREATEST(sessions.last_seen_at, EXCLUDED.last_seen_at),
                        ended_at = COALESCE(EXCLUDED.ended_at, sessions.ended_at),
                        exit_path = COALESCE(EXCLUDED.exit_path, sessions.exit_path),
                        is_test = sessions.is_test OR EXCLUDED.is_test,
                        consent_version = COALESCE(EXCLUDED.consent_version, sessions.consent_version),
                        updated_at = now()`,
                    [
                        payload.session_id,
                        payload.visitor_id,
                        ocorridoEm,
                        endedAt,
                        payload.page.path,
                        exitPath,
                        attribution.referrer,
                        attribution.referrerHost,
                        attribution.source,
                        attribution.medium,
                        attribution.campaign,
                        attribution.utmSource,
                        attribution.utmMedium,
                        attribution.utmCampaign,
                        attribution.utmTerm,
                        attribution.utmContent,
                        uaInfo.deviceType,
                        uaInfo.browser,
                        uaInfo.os,
                        payload.context?.screen?.width || null,
                        payload.context?.screen?.height || null,
                        payload.context?.language || null,
                        country,
                        ua,
                        isTest,
                        payload.consent.version || null
                    ]
                );

                if (payload.event === 'pageview') {
                    const inserido = await client.query(
                        `INSERT INTO pageviews (
                            event_id, session_id, visitor_id, path, title, referrer, referrer_host,
                            occurred_at, received_at, bot_class, is_test
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                        ON CONFLICT (event_id) DO NOTHING
                        RETURNING event_id`,
                        [
                            payload.event_id,
                            payload.session_id,
                            payload.visitor_id,
                            payload.page.path,
                            payload.page.title || null,
                            attribution.referrer,
                            attribution.referrerHost,
                            ocorridoEm,
                            recebidoEm,
                            BOT_INICIAL,
                            isTest
                        ]
                    );

                    if (inserido.rowCount > 0) {
                        await client.query(
                            `UPDATE sessions
                             SET pageview_count = pageview_count + 1,
                                 exit_path = $2,
                                 last_seen_at = GREATEST(last_seen_at, $3),
                                 updated_at = now()
                             WHERE session_id = $1`,
                            [payload.session_id, payload.page.path, ocorridoEm]
                        );
                    }
                    return;
                }

                const dados = payload.data || {};
                const target = dados.calculator || dados.product || null;
                const inserido = await client.query(
                    `INSERT INTO events (
                        event_id, session_id, visitor_id, name, page_path, target, metadata,
                        occurred_at, received_at, bot_class, is_test
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11)
                    ON CONFLICT (event_id) DO NOTHING
                    RETURNING event_id`,
                    [
                        payload.event_id,
                        payload.session_id,
                        payload.visitor_id,
                        payload.event,
                        payload.page.path,
                        target,
                        JSON.stringify(dados),
                        ocorridoEm,
                        recebidoEm,
                        BOT_INICIAL,
                        isTest
                    ]
                );

                if (inserido.rowCount === 0) return;

                await client.query(
                    `UPDATE sessions
                     SET event_count = event_count + 1,
                         engagement_ms = GREATEST(engagement_ms, $2),
                         ended_at = CASE WHEN $3::timestamptz IS NULL THEN ended_at ELSE $3 END,
                         exit_path = CASE WHEN $4::text IS NULL THEN exit_path ELSE $4 END,
                         last_seen_at = GREATEST(last_seen_at, $5),
                         updated_at = now()
                     WHERE session_id = $1`,
                    [
                        payload.session_id,
                        Number(dados.engagement_ms || 0),
                        payload.event === 'session_end' ? ocorridoEm : null,
                        payload.event === 'session_end' ? payload.page.path : null,
                        ocorridoEm
                    ]
                );

                if (payload.event === 'affiliate_click') {
                    await client.query(
                        `INSERT INTO affiliate_clicks (
                            event_id, session_id, visitor_id, product, category, slot,
                            page_path, occurred_at, received_at, is_test
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                        ON CONFLICT (event_id) DO NOTHING`,
                        [
                            payload.event_id,
                            payload.session_id,
                            payload.visitor_id,
                            dados.product,
                            dados.category || null,
                            dados.slot,
                            payload.page.path,
                            ocorridoEm,
                            recebidoEm,
                            isTest
                        ]
                    );
                }
            });

            return jsonResponse(202, { ok: true });
        } catch (erro) {
            console.error('analytics_collect_error', erro?.code || 'unknown');
            return jsonResponse(503, { error: 'analytics_unavailable' });
        }
    };
}
