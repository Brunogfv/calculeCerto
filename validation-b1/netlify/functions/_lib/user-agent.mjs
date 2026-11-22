import { UAParser } from 'ua-parser-js';
import { pareceHeadless } from './http.mjs';

export function parseUserAgent(userAgent) {
    const ua = String(userAgent || '').slice(0, 512);
    const resultado = new UAParser(ua).getResult();
    const tipoDispositivo = resultado.device.type === 'mobile'
        ? 'mobile'
        : resultado.device.type === 'tablet'
            ? 'tablet'
            : ua
                ? 'desktop'
                : 'unknown';

    return {
        deviceType: tipoDispositivo,
        browser: resultado.browser.name || 'unknown',
        os: resultado.os.name || 'unknown',
        isHeadless: pareceHeadless(ua)
    };
}
