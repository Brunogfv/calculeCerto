export const CAPTURE_MAX_BODY_BYTES = 8192;
export const DEFAULT_CAPTURE_TIMEOUT_MS = 2000;
export const MIN_CAPTURE_TIMEOUT_MS = 250;
export const MAX_CAPTURE_TIMEOUT_MS = 5000;

export function lerTimeoutCaptura(valor, padrao = DEFAULT_CAPTURE_TIMEOUT_MS) {
    const texto = String(valor ?? '').trim();
    if (!/^\d+$/.test(texto)) return padrao;
    const numero = Number(texto);
    if (!Number.isSafeInteger(numero)) return padrao;
    return Math.min(MAX_CAPTURE_TIMEOUT_MS, Math.max(MIN_CAPTURE_TIMEOUT_MS, numero));
}

export function tamanhoBytesUtf8(texto) {
    return new TextEncoder().encode(String(texto ?? '')).length;
}

export function excedeLimiteCorpo(texto) {
    return tamanhoBytesUtf8(texto) > CAPTURE_MAX_BODY_BYTES;
}
