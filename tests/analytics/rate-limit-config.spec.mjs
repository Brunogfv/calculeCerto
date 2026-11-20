import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

test('Edge e Function possuem rateLimit code-based independentes', async () => {
    globalThis.Netlify = { env: { get: () => undefined } };
    const edge = await import(pathToFileURL(path.join(ROOT, 'netlify', 'edge-functions', 'html-capture.js')).href);
    const fn = await import(pathToFileURL(path.join(ROOT, 'netlify', 'functions', 'capture-html.mjs')).href);

    assert.deepEqual(edge.config.rateLimit, {
        windowLimit: 120,
        windowSize: 60,
        aggregateBy: ['ip', 'domain']
    });
    assert.deepEqual(fn.config.rateLimit, {
        windowLimit: 60,
        windowSize: 60,
        aggregateBy: ['ip', 'domain']
    });
    assert.equal(edge.config.path, '/*');
    assert.equal(fn.config.path, '/api/capture-html');
});
