import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPT = path.join(ROOT, 'scripts', 'cleanup-retention.mjs');

test('invocação manual exige confirmação explícita', () => {
    const result = spawnSync(process.execPath, [SCRIPT], {
        env: { ...process.env, CLEANUP_DATABASE_URL: 'postgresql://invalid' },
        encoding: 'utf8'
    });
    assert.equal(result.status, 2);
    assert.match(result.stderr, /CLEANUP_CONFIRM/);
});

test('invocação manual não usa DATABASE_URL como fallback', () => {
    const result = spawnSync(process.execPath, [SCRIPT], {
        env: {
            ...process.env,
            CLEANUP_CONFIRM: 'APPLY_RETENTION_B1',
            DATABASE_URL: 'postgresql://invalid',
            CLEANUP_DATABASE_URL: ''
        },
        encoding: 'utf8'
    });
    assert.equal(result.status, 2);
    assert.match(result.stderr, /CLEANUP_DATABASE_URL ausente/);
});

import { runScheduledCleanup } from '../../netlify/functions/cleanup-html-capture.mjs';

test('Scheduled cleanup não inicia sem CLEANUP_DATABASE_URL', async () => {
    const result = await runScheduledCleanup({
        env: { HTML_CAPTURE_CLEANUP_ENABLED: 'true' }
    });
    assert.deepEqual(result, { enabled: false, status: 'missing_cleanup_url' });
});
