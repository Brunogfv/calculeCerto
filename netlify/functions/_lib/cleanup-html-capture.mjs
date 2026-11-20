import { limparRetencao } from './cleanup-retention.mjs';

export async function limparHtmlCapture(pool, opcoes = {}) {
    return limparRetencao(pool, opcoes);
}
