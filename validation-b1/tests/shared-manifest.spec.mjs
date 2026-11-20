import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { hashFile, verifyShared } from '../scripts/verify-shared.mjs';

const REL = 'netlify/edge-functions/html-capture.js';

function fixture({ origem = 'export const config = {};\n', copia = origem, manifesto } = {}) {
    const base = fs.mkdtempSync(path.join(os.tmpdir(), 'b1-shared-'));
    const root = path.join(base, 'root');
    const b1 = path.join(base, 'b1');
    const origemPath = path.join(root, REL);
    const copiaPath = path.join(b1, REL);
    const manifestPath = path.join(b1, 'shared-manifest.json');

    fs.mkdirSync(path.dirname(origemPath), { recursive: true });
    fs.mkdirSync(path.dirname(copiaPath), { recursive: true });
    fs.writeFileSync(origemPath, origem, 'utf8');
    fs.writeFileSync(copiaPath, copia, 'utf8');
    fs.writeFileSync(manifestPath, JSON.stringify(manifesto ?? {
        version: 1,
        files: {
            [REL]: {
                source_sha256: hashFile(origemPath),
                copied_sha256: hashFile(copiaPath)
            }
        }
    }), 'utf8');

    return { base, root, b1, manifestPath, origemPath, copiaPath };
}

function verificar(ctx, expected = [REL]) {
    return verifyShared({
        b1Root: ctx.b1,
        canonicalRoot: ctx.root,
        expected,
        manifestPath: ctx.manifestPath
    });
}

test('manifesto válido e cópias idênticas passam', () => {
    const ctx = fixture();
    try {
        assert.deepEqual(verificar(ctx), { files: 1 });
    } finally {
        fs.rmSync(ctx.base, { recursive: true, force: true });
    }
});

test('divergência na cópia B1 falha', () => {
    const ctx = fixture();
    try {
        fs.writeFileSync(ctx.copiaPath, 'alterado\n', 'utf8');
        assert.throws(() => verificar(ctx), /Cópia B1 divergente/);
    } finally {
        fs.rmSync(ctx.base, { recursive: true, force: true });
    }
});

test('divergência no canônico falha', () => {
    const ctx = fixture();
    try {
        fs.writeFileSync(ctx.origemPath, 'alterado\n', 'utf8');
        assert.throws(() => verificar(ctx), /canônico divergente/);
    } finally {
        fs.rmSync(ctx.base, { recursive: true, force: true });
    }
});

test('arquivo ausente falha', () => {
    const ctx = fixture();
    try {
        fs.rmSync(ctx.copiaPath);
        assert.throws(() => verificar(ctx), /Cópia B1 ausente/);
    } finally {
        fs.rmSync(ctx.base, { recursive: true, force: true });
    }
});

test('arquivo canônico ausente falha', () => {
    const ctx = fixture();
    try {
        fs.rmSync(ctx.origemPath);
        assert.throws(() => verificar(ctx), /Arquivo canônico ausente/);
    } finally {
        fs.rmSync(ctx.base, { recursive: true, force: true });
    }
});

test('manifesto ausente, inválido ou com versão errada falha', () => {
    const ctx = fixture();
    try {
        fs.rmSync(ctx.manifestPath);
        assert.throws(() => verificar(ctx), /Manifesto ausente/);

        fs.writeFileSync(ctx.manifestPath, '{', 'utf8');
        assert.throws(() => verificar(ctx), /Manifesto inválido/);

        fs.writeFileSync(ctx.manifestPath, JSON.stringify({ version: 2, files: {} }), 'utf8');
        assert.throws(() => verificar(ctx), /versão ou estrutura/);
    } finally {
        fs.rmSync(ctx.base, { recursive: true, force: true });
    }
});

test('lista de arquivos divergente e caminho inválido falham', () => {
    const ctx = fixture();
    try {
        assert.throws(() => verificar(ctx, [REL, 'netlify/outro.mjs']), /Manifesto não corresponde/);
        assert.throws(() => verificar(ctx, ['../escape']), /Caminho compartilhado inválido/);
    } finally {
        fs.rmSync(ctx.base, { recursive: true, force: true });
    }
});

test('entrada extra no manifesto falha', () => {
    const ctx = fixture();
    try {
        fs.writeFileSync(ctx.manifestPath, JSON.stringify({
            version: 1,
            files: {
                [REL]: {
                    source_sha256: hashFile(ctx.origemPath),
                    copied_sha256: hashFile(ctx.copiaPath)
                },
                'netlify/extra.mjs': {
                    source_sha256: 'a'.repeat(64),
                    copied_sha256: 'a'.repeat(64)
                }
            }
        }), 'utf8');
        assert.throws(() => verificar(ctx), /Manifesto não corresponde.*extras: netlify\/extra\.mjs/);
    } finally {
        fs.rmSync(ctx.base, { recursive: true, force: true });
    }
});
