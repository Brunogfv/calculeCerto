import { z } from 'zod';
import { caminhoPermitido } from '../../edge-functions/_lib/capture-policy.mjs';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HASH_RE = /^[0-9a-f]{64}$/i;
const PAIS_RE = /^[A-Z]{2}$/;
const CLASSE_CONFIANCA = {
    automation: [80, 95],
    preview_or_monitoring: [80, 95],
    likely_bot: [60, 84],
    likely_human: [55, 80],
    unknown: [0, 54]
};

const texto = (max) => z.string().max(max);
const textoOuNulo = (max) => z.string().max(max).nullable();

const clientHintsSchema = z.object({
    ua: textoOuNulo(256),
    mobile: textoOuNulo(10),
    platform: textoOuNulo(40)
}).strict();

const fetchMetadataSchema = z.object({
    accept: textoOuNulo(200),
    mode: textoOuNulo(20),
    dest: textoOuNulo(20),
    site: textoOuNulo(20)
}).strict();

export const capturePayloadSchema = z.object({
    schema_version: z.literal(1),
    request_id: z.string().regex(UUID_RE, 'request_id inválido'),
    nonce: z.string().regex(UUID_RE, 'nonce inválido'),
    captured_at: z.string().max(40).refine((valor) => !Number.isNaN(Date.parse(valor)), 'captured_at inválido'),
    purpose: z.literal('analytics'),
    method: z.literal('GET'),
    path: z.string().min(1).max(512).refine(caminhoPermitido, 'caminho fora do escopo'),
    status_code: z.number().int().min(100).max(599),
    country_code: z.string().regex(PAIS_RE).nullable(),
    accept_language: textoOuNulo(35),
    referrer_host: textoOuNulo(120),
    ua_family: textoOuNulo(64),
    ua_version: textoOuNulo(32),
    client_hints: clientHintsSchema,
    fetch_metadata: fetchMetadataSchema,
    traffic_class: z.enum(['likely_human', 'likely_bot', 'automation', 'preview_or_monitoring', 'unknown']),
    bot_family: textoOuNulo(32),
    confidence: z.number().int().min(0).max(100),
    signals: z.array(z.string().max(64)).min(1).max(20),
    classifier_version: z.string().min(1).max(32),
    rate_key: z.string().regex(HASH_RE, 'rate_key inválido'),
    sample_rate: z.number().min(0.0001).max(1),
    sampling_method: z.literal('request_id_day_v1'),
    is_estimate: z.boolean()
}).strict().superRefine((valor, contexto) => {
    const faixa = CLASSE_CONFIANCA[valor.traffic_class];
    if (valor.confidence < faixa[0] || valor.confidence > faixa[1]) {
        contexto.addIssue({ code: z.ZodIssueCode.custom, path: ['confidence'], message: 'confiança fora da faixa da classe' });
    }

    if (valor.traffic_class !== 'unknown' && new Set(valor.signals).size < 2) {
        contexto.addIssue({ code: z.ZodIssueCode.custom, path: ['signals'], message: 'classe exige dois sinais independentes' });
    }

    if (valor.is_estimate !== (valor.sample_rate < 1)) {
        contexto.addIssue({ code: z.ZodIssueCode.custom, path: ['is_estimate'], message: 'is_estimate incompatível com sample_rate' });
    }

    if (valor.purpose === 'analytics' && valor.method !== 'GET') {
        contexto.addIssue({ code: z.ZodIssueCode.custom, path: ['method'], message: 'método inválido' });
    }

    if (valor.path.includes('?') || valor.path.includes('#')) {
        contexto.addIssue({ code: z.ZodIssueCode.custom, path: ['path'], message: 'path não pode conter query/fragmento' });
    }
});

export function parseCapturePayload(payload) {
    const resultado = capturePayloadSchema.safeParse(payload);
    if (!resultado.success) return { ok: false, motivo: 'invalid_payload' };
    return { ok: true, value: resultado.data };
}

export function timestampValido(valor, agora = Date.now(), janelaSegundos = 60) {
    const texto = String(valor || '').trim();
    if (!/^\d+$/.test(texto)) return false;
    const timestamp = Number(texto);
    if (!Number.isSafeInteger(timestamp)) return false;
    return Math.abs(Math.floor(agora / 1000) - timestamp) <= janelaSegundos;
}

export { CLASSE_CONFIANCA };
