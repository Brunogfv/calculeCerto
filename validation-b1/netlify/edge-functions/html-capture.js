import { executarCaptura } from './_lib/edge-capture.mjs';
import { lerEnv } from './_lib/edge-env.mjs';

export const config = {
    path: '/*',
    rateLimit: {
        windowLimit: 120,
        windowSize: 60,
        aggregateBy: ['ip', 'domain']
    },
    excludedPath: [
        '/api/*',
        '/.netlify/*',
        '/css/*',
        '/js/*',
        '/imgs/*',
        '/fonts/*',
        '/pagefind/*',
        '/vendor/*',
        '/_*',
        '/*.css',
        '/*.js',
        '/*.json',
        '/*.xml',
        '/*.txt',
        '/*.pdf',
        '/*.png',
        '/*.jpg',
        '/*.jpeg',
        '/*.webp',
        '/*.svg',
        '/*.ico',
        '/*.woff',
        '/*.woff2',
        '/busca',
        '/busca.html',
        '/meus-calculos',
        '/meus-calculos.html',
        '/obrigado',
        '/obrigado.html'
    ],
    onError: 'bypass'
};

export default async function handler(request, context) {
    return executarCaptura({ request, context, env: lerEnv() });
}
