export const EDGE_ENV_ALLOWLIST = Object.freeze([
    'EDGE_CAPTURE_ENABLED',
    'EDGE_ANALYTICS_ENABLED',
    'EDGE_INGEST_SECRET',
    'EDGE_INGEST_KEY_ID',
    'EDGE_ANALYTICS_SAMPLE_RATE',
    'EDGE_CAPTURE_TIMEOUT_MS'
]);

export function selecionarEnvEdge(fonte = {}) {
    const destino = {};
    if (!fonte || typeof fonte !== 'object') return destino;
    for (const nome of EDGE_ENV_ALLOWLIST) {
        const valor = fonte[nome];
        if (valor !== undefined && valor !== null) destino[nome] = String(valor);
    }
    return destino;
}

export function lerEnv(envApi) {
    const api = envApi ?? (typeof Netlify !== 'undefined' ? Netlify?.env : null);
    if (!api || typeof api.get !== 'function') return {};

    const fonte = {};
    for (const nome of EDGE_ENV_ALLOWLIST) {
        const valor = api.get(nome);
        if (valor !== undefined && valor !== null) fonte[nome] = valor;
    }
    return selecionarEnvEdge(fonte);
}
