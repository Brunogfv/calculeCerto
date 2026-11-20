export const EDGE_SIGNATURE_VERSION = 'edge-v1';

export function montarMensagemAssinada({ keyId, timestamp, nonce, corpo }) {
    return [
        EDGE_SIGNATURE_VERSION,
        String(keyId ?? ''),
        String(timestamp ?? ''),
        String(nonce ?? ''),
        String(corpo ?? '')
    ].join('\n');
}
