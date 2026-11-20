(function () {
    'use strict';

    const VERSAO = '2026-11';
    const CONSENT_KEY = 'pca_consent_v1';
    const EDGE_CONSENT_COOKIE = 'pca_edge_consent';
    const VISITOR_KEY = 'pca_vid';
    const SESSION_KEY = 'pca_sid';
    const ENDPOINT = '/api/collect';
    const SESSION_MS = 30 * 60 * 1000;
    const DNT_ATIVO = navigator.doNotTrack === '1' || window.doNotTrack === '1';
    const GPC_ATIVO = navigator.globalPrivacyControl === true || window.globalPrivacyControl === true;
    const BLOQUEADO_POR_NAVEGADOR = DNT_ATIVO || GPC_ATIVO;

    let consentimento = null;
    let ativo = false;
    let visitante = null;
    let sessao = null;
    let timerSessao = null;
    let pageStart = Date.now();
    let listenersInstalados = false;
    let calculoIniciado = false;
    let banner = null;
    let hookTimer = null;
    let focoRetorno = null;

    function uuid() {
        return window.crypto.randomUUID();
    }

    function lerConsentimento() {
        try {
            const bruto = localStorage.getItem(CONSENT_KEY);
            if (!bruto) return null;
            const valor = JSON.parse(bruto);
            if (!valor || valor.version !== VERSAO) return null;
            if (typeof valor.analytics !== 'boolean' || typeof valor.ads !== 'boolean') return null;
            return valor;
        } catch {
            return null;
        }
    }

    function salvarConsentimento(analytics, ads) {
        consentimento = {
            version: VERSAO,
            analytics: !!analytics,
            ads: !!ads
        };
        try {
            localStorage.setItem(CONSENT_KEY, JSON.stringify(consentimento));
        } catch {}
        sincronizarCookie(!!analytics, !!ads);
        aplicarConsentimento();
    }

    function sincronizarCookie(analytics, ads, maxAge = 15552000) {
        try {
            document.cookie = `${EDGE_CONSENT_COOKIE}=v=${VERSAO}&analytics=${analytics ? '1' : '0'}&ads=${ads ? '1' : '0'}; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
        } catch {}
    }

    function atualizarGoogleConsent(analytics, ads) {
        const dl = window.dataLayer = window.dataLayer || [];
        dl.push(['consent', 'update', {
            analytics_storage: analytics ? 'granted' : 'denied',
            ad_storage: ads ? 'granted' : 'denied',
            ad_user_data: ads ? 'granted' : 'denied',
            ad_personalization: ads ? 'granted' : 'denied'
        }]);
    }

    function aplicarConsentimento() {
        const analytics = !!consentimento?.analytics && !BLOQUEADO_POR_NAVEGADOR;
        const ads = !!consentimento?.ads && !BLOQUEADO_POR_NAVEGADOR;
        atualizarGoogleConsent(analytics, ads);
        if (analytics) iniciarColeta();
        else pararColeta();
    }

    function garantirVisitante() {
        if (visitante) return visitante;
        try {
            visitante = localStorage.getItem(VISITOR_KEY);
            if (!visitante) {
                visitante = 'v_' + uuid();
                localStorage.setItem(VISITOR_KEY, visitante);
            }
        } catch {
            visitante = 'v_' + uuid();
        }
        return visitante;
    }

    function prepararSessao() {
        const agora = Date.now();
        let atual = null;
        try {
            atual = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
        } catch {
            atual = null;
        }

        const nova = !atual || !atual.id || agora - Number(atual.last || 0) > SESSION_MS;
        if (nova) {
            atual = { id: uuid(), startedAt: agora, last: agora };
        } else {
            atual.last = agora;
        }

        try {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(atual));
        } catch {}

        sessao = atual;
        clearTimeout(timerSessao);
        timerSessao = setTimeout(finalizarSessao, SESSION_MS);
        return { sessao: atual, nova };
    }

    function finalizarSessao() {
        if (!ativo || !sessao) return;
        const atual = sessao;
        const retencao = Math.min(Date.now() - Number(atual.startedAt || Date.now()), 86400000);
        enviarPayload(criarPayload('session_end', { engagement_ms: retencao }, atual));
        sessao = null;
        try {
            sessionStorage.removeItem(SESSION_KEY);
        } catch {}
        timerSessao = null;
    }

    function nomeCalculadora() {
        const titulo = document.querySelector('.calc-header h1, main h1');
        const nome = titulo ? titulo.textContent : document.title;
        return String(nome || '').trim().replace(/\s+/g, ' ').slice(0, 120);
    }

    function categoriaPagina() {
        const partes = window.location.pathname.split('/').filter(Boolean);
        return partes.length ? partes[partes.length - 1].replace(/\.html$/i, '').slice(0, 80) : 'home';
    }

    function criarPayload(tipo, dados, sessaoAtual) {
        const payload = {
            event_id: uuid(),
            session_id: sessaoAtual.id,
            visitor_id: visitante,
            event: tipo,
            ts: new Date().toISOString(),
            consent: { analytics: true, version: VERSAO },
            page: {
                path: window.location.pathname
            }
        };
        if (dados !== undefined) payload.data = dados;
        return payload;
    }

    function enviarPayload(evento) {
        if (!ativo) return;
        const corpo = JSON.stringify(evento);
        try {
            if (navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, new Blob([corpo], { type: 'application/json' }))) return;
        } catch {}

        try {
            fetch(ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: corpo,
                keepalive: true,
                credentials: 'omit'
            }).catch(() => {});
        } catch {}
    }

    function enviar(tipo, dados) {
        if (!ativo || !consentimento?.analytics || BLOQUEADO_POR_NAVEGADOR) return;
        garantirVisitante();
        const { sessao: atual, nova } = prepararSessao();
        if (nova) enviarPayload(criarPayload('session_start', undefined, atual));
        enviarPayload(criarPayload(tipo, dados, atual));
    }

    function iniciarColeta() {
        if (ativo || BLOQUEADO_POR_NAVEGADOR) return;
        ativo = true;
        calculoIniciado = false;
        pageStart = Date.now();
        garantirVisitante();
        instalarListeners();
        enviar('pageview');
    }

    function pararColeta() {
        ativo = false;
        clearTimeout(timerSessao);
        clearInterval(hookTimer);
        timerSessao = null;
        hookTimer = null;
        sessao = null;
        visitante = null;
        calculoIniciado = false;
        try {
            localStorage.removeItem(VISITOR_KEY);
            sessionStorage.removeItem(SESSION_KEY);
        } catch {}
    }

    function enviarEngajamento() {
        if (!ativo) return;
        const engajamento = Math.min(Date.now() - pageStart, 86400000);
        enviar('engagement', { engagement_ms: engajamento });
    }

    function instalarHookCalculo() {
        if (typeof window.salvarCalculo !== 'function' || window.salvarCalculo.__pca) return;
        const original = window.salvarCalculo;
        const envolvido = function (...args) {
            const retorno = original.apply(this, args);
            if (ativo) {
                const nome = String(args[0] || nomeCalculadora()).slice(0, 120);
                enviar('calculator_complete', { calculator: nome });
            }
            return retorno;
        };
        envolvido.__pca = true;
        window.salvarCalculo = envolvido;
    }

    function registrarCliqueAfiliado(evento) {
        if (!ativo) return;
        const alvo = evento.target;
        if (!(alvo instanceof Element)) return;
        const card = alvo.closest('.oferta-card');
        const link = alvo.closest('a');
        if (!card || !link) return;

        let host = null;
        try {
            host = new URL(link.href, window.location.origin).hostname;
        } catch {}

        const produto = card.querySelector('.oferta-titulo')?.textContent?.trim().slice(0, 200);
        if (!produto) return;

        enviar('affiliate_click', {
            product: produto,
            category: categoriaPagina(),
            slot: card.dataset.slot || 'other',
            destination_host: host || undefined
        });
    }

    function instalarListeners() {
        instalarHookCalculo();
        if (listenersInstalados) return;
        listenersInstalados = true;

        document.addEventListener('input', (evento) => {
            if (calculoIniciado || !ativo) return;
            const alvo = evento.target;
            if (!(alvo instanceof Element)) return;
            if (!alvo.closest('.calc-card, .calc-container, .calculator-wrapper')) return;
            if (!alvo.matches('input, select, textarea')) return;
            calculoIniciado = true;
            enviar('calculator_start', { calculator: nomeCalculadora() });
        }, true);

        document.addEventListener('click', registrarCliqueAfiliado, true);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') enviarEngajamento();
        });

        hookTimer = setInterval(instalarHookCalculo, 250);
        setTimeout(() => {
            clearInterval(hookTimer);
            hookTimer = null;
        }, 15000);
    }

    function adicionarLinkPreferencias() {
        const footer = document.querySelector('footer');
        if (!footer || footer.querySelector('.pca-prefs-link')) return;
        const link = document.createElement('button');
        link.type = 'button';
        link.className = 'pca-prefs-link';
        link.textContent = 'Preferências de privacidade';
        link.addEventListener('click', () => {
            focoRetorno = link;
            mostrarBanner();
            const alvo = banner?.querySelector('[data-pca-aceitar]') || banner?.querySelector('.pca-consent__texto a');
            alvo?.focus();
        });
        footer.appendChild(link);
    }

    function estadoCaixas() {
        const painel = banner?.querySelector('[data-pca-painel]');
        if (!painel) return;
        const analytics = painel.querySelector('[data-pca-analytics]');
        const ads = painel.querySelector('[data-pca-ads]');
        if (analytics) analytics.checked = !!consentimento?.analytics;
        if (ads) ads.checked = !!consentimento?.ads;
    }

    function criarBanner() {
        if (banner) return banner;
        banner = document.createElement('div');
        banner.className = 'pca-consent';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-labelledby', 'pca-consent-title');
        banner.innerHTML = `
            <div class="pca-consent__box">
                <h2 class="pca-consent__titulo" id="pca-consent-title">Preferências de privacidade</h2>
                <div class="pca-consent__texto">
                    <p>Usamos analytics e publicidade. Você escolhe o que permitir.</p>
                    <p class="pca-consent__aviso">Sem consentimento, anúncios podem ser limitados. Saiba mais na <a href="/paginas/privacidade">Política de Privacidade</a>.</p>
                </div>
                <div class="pca-consent__acoes" data-pca-acoes>
                    <button type="button" class="pca-btn pca-btn--primario" data-pca-aceitar>Aceitar tudo</button>
                    <button type="button" class="pca-btn pca-btn--secundario" data-pca-recusar>Recusar opções não essenciais</button>
                    <button type="button" class="pca-btn pca-btn--texto" data-pca-personalizar>Personalizar</button>
                </div>
                <div class="pca-consent__painel" data-pca-painel hidden>
                    <label class="pca-consent__opcao">
                        <input type="checkbox" data-pca-analytics>
                        <span><strong>Analytics</strong><span>Mede visitas e uso, sem valores ou resultados.</span></span>
                    </label>
                    <label class="pca-consent__opcao">
                        <input type="checkbox" data-pca-ads>
                        <span><strong>Publicidade</strong><span>Permite anúncios personalizados. Anúncios limitados podem aparecer sem esta opção.</span></span>
                    </label>
                    <div class="pca-consent__acoes">
                        <button type="button" class="pca-btn pca-btn--primario" data-pca-salvar>Salvar preferências</button>
                        <button type="button" class="pca-btn pca-btn--secundario" data-pca-cancelar>Cancelar</button>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(banner);

        const acoes = banner.querySelector('[data-pca-acoes]');
        const painel = banner.querySelector('[data-pca-painel]');
        const analytics = banner.querySelector('[data-pca-analytics]');
        const ads = banner.querySelector('[data-pca-ads]');

        banner.querySelector('[data-pca-aceitar]').addEventListener('click', () => {
            salvarConsentimento(true, true);
            esconderBanner();
        });
        banner.querySelector('[data-pca-recusar]').addEventListener('click', () => {
            salvarConsentimento(false, false);
            esconderBanner();
        });
        banner.querySelector('[data-pca-personalizar]').addEventListener('click', () => {
            estadoCaixas();
            acoes.hidden = true;
            painel.hidden = false;
            analytics.focus();
        });
        banner.querySelector('[data-pca-salvar]').addEventListener('click', () => {
            salvarConsentimento(analytics.checked, ads.checked);
            esconderBanner();
        });
        banner.querySelector('[data-pca-cancelar]').addEventListener('click', () => {
            painel.hidden = true;
            acoes.hidden = false;
        });

        return banner;
    }

    function mostrarBanner() {
        const container = criarBanner();
        const texto = container.querySelector('.pca-consent__texto');
        const acoes = container.querySelector('[data-pca-acoes]');
        const painel = container.querySelector('[data-pca-painel]');

        if (BLOQUEADO_POR_NAVEGADOR) {
            texto.innerHTML = '<p><strong>Analytics e publicidade personalizada estão desativados.</strong></p><p>Seu navegador sinalizou DNT ou GPC. Saiba mais na <a href="/paginas/privacidade">Política de Privacidade</a>.</p>';
            acoes.hidden = true;
            painel.hidden = true;
            container.classList.add('pca-consent--visivel');
            return;
        }

        estadoCaixas();
        painel.hidden = true;
        acoes.hidden = false;
        container.classList.add('pca-consent--visivel');
    }

    function esconderBanner() {
        if (!banner) return;
        banner.classList.remove('pca-consent--visivel');

        if (focoRetorno && document.contains(focoRetorno)) {
            focoRetorno.focus();
            focoRetorno = null;
            return;
        }

        const principal = document.querySelector('main');
        if (principal && typeof principal.focus === 'function') {
            principal.focus({ preventScroll: true });
        }
    }

    function iniciarAplicacao() {
        adicionarLinkPreferencias();

        if (BLOQUEADO_POR_NAVEGADOR) {
            pararColeta();
            sincronizarCookie(false, false, 0);
            atualizarGoogleConsent(false, false);
            mostrarBanner();
            return;
        }

        const salvo = lerConsentimento();
        if (salvo) {
            consentimento = salvo;
            sincronizarCookie(salvo.analytics, salvo.ads);
            aplicarConsentimento();
            return;
        }

        sincronizarCookie(false, false, 0);
        mostrarBanner();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciarAplicacao, { once: true });
    } else {
        iniciarAplicacao();
    }
})();
