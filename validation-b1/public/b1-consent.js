(function () {
    'use strict';

    const VERSAO = '2026-11';
    const CONSENT_KEY = 'pca_consent_v1';
    const EDGE_CONSENT_COOKIE = 'pca_edge_consent';
    const MAX_AGE = 15552000;

    const DNT = navigator.doNotTrack === '1' || window.doNotTrack === '1';
    const GPC = navigator.globalPrivacyControl === true || window.globalPrivacyControl === true;
    const PRIVACIDADE = DNT || GPC;

    const elementos = {
        status: document.getElementById('b1-status'),
        cookie: document.getElementById('b1-cookie'),
        storage: document.getElementById('b1-storage'),
        privacy: document.getElementById('b1-privacy'),
        accept: document.getElementById('b1-accept'),
        reject: document.getElementById('b1-reject'),
        withdraw: document.getElementById('b1-withdraw'),
        reload: document.getElementById('b1-reload')
    };

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

    function gravarCookie(analytics, ads, maxAge) {
        document.cookie = `${EDGE_CONSENT_COOKIE}=v=${VERSAO}&analytics=${analytics ? '1' : '0'}&ads=${ads ? '1' : '0'}; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
    }

    function salvar(analytics, ads) {
        const valor = { version: VERSAO, analytics: !!analytics, ads: !!ads };
        try {
            localStorage.setItem(CONSENT_KEY, JSON.stringify(valor));
        } catch {}
        gravarCookie(!!analytics, !!ads, MAX_AGE);
        atualizarDiagnostico();
        definirStatus(
            analytics
                ? 'Analytics aceito. Use “Recarregar para testar” para gerar uma nova navegação com consentimento.'
                : 'Analytics recusado. Nenhuma captura deve ocorrer.'
        );
    }

    function retirar() {
        try {
            localStorage.removeItem(CONSENT_KEY);
        } catch {}
        gravarCookie(false, false, 0);
        atualizarDiagnostico();
        definirStatus('Consentimento retirado. Nenhuma captura deve ocorrer.');
    }

    function lerCookie() {
        const partes = document.cookie ? document.cookie.split(';') : [];
        for (const parte of partes) {
            const separador = parte.indexOf('=');
            if (separador === -1) continue;
            const nome = parte.slice(0, separador).trim();
            if (nome === EDGE_CONSENT_COOKIE) return parte.slice(separador + 1).trim();
        }
        return 'ausente';
    }

    function atualizarDiagnostico() {
        if (elementos.cookie) elementos.cookie.textContent = lerCookie();
        if (elementos.storage) {
            const valor = lerConsentimento();
            elementos.storage.textContent = valor
                ? `versão ${valor.version}; analytics=${valor.analytics ? '1' : '0'}; ads=${valor.ads ? '1' : '0'}`
                : 'ausente ou inválida';
        }
        if (elementos.privacy) {
            elementos.privacy.textContent = PRIVACIDADE
                ? `DNT=${DNT ? '1' : '0'}; GPC=${GPC ? '1' : '0'}; captura desativada`
                : `DNT=${DNT ? '1' : '0'}; GPC=${GPC ? '1' : '0'}`;
        }
    }

    function definirStatus(texto) {
        if (elementos.status) elementos.status.textContent = texto;
    }

    function iniciar() {
        if (elementos.accept) {
            elementos.accept.addEventListener('click', () => {
                if (PRIVACIDADE) {
                    definirStatus('DNT/GPC ativo: analytics não pode ser aceito neste navegador.');
                    return;
                }
                salvar(true, false);
            });
        }
        if (elementos.reject) {
            elementos.reject.addEventListener('click', () => salvar(false, false));
        }
        if (elementos.withdraw) {
            elementos.withdraw.addEventListener('click', retirar);
        }
        if (elementos.reload) {
            elementos.reload.addEventListener('click', () => window.location.reload());
        }

        if (PRIVACIDADE) {
            gravarCookie(false, false, 0);
            if (elementos.accept) elementos.accept.disabled = true;
            definirStatus('DNT/GPC detectado. Analytics desativado e cookie positivo removido.');
            atualizarDiagnostico();
            return;
        }

        const salvo = lerConsentimento();
        if (salvo) {
            gravarCookie(salvo.analytics, salvo.ads, MAX_AGE);
            definirStatus(
                salvo.analytics
                    ? 'Preferência anterior: analytics aceito.'
                    : 'Preferência anterior: analytics recusado.'
            );
        } else {
            gravarCookie(false, false, 0);
            definirStatus('Sem consentimento local válido. Analytics desativado.');
        }
        atualizarDiagnostico();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar, { once: true });
    } else {
        iniciar();
    }
})();
