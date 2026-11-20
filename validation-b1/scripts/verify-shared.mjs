import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { COMPARTILHADOS, MANIFEST_VERSION } from './shared-files.mjs';

export function hashFile(arquivo) {
    return crypto.createHash('sha256').update(fs.readFileSync(arquivo)).digest('hex');
}

function validarRelativo(relativo) {
    if (typeof relativo !== 'string' || !relativo) throw new Error('Caminho compartilhado inválido');
    if (path.isAbsolute(relativo) || relativo.includes('\\') || relativo.split('/').includes('..')) {
        throw new Error(`Caminho compartilhado inválido: ${relativo}`);
    }
}

function lerManifesto(manifestPath) {
    if (!fs.existsSync(manifestPath)) throw new Error(`Manifesto ausente: ${manifestPath}`);
    let manifesto;
    try {
        manifesto = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch {
        throw new Error('Manifesto inválido: JSON malformado');
    }

    if (manifesto?.version !== MANIFEST_VERSION || !manifesto.files || typeof manifesto.files !== 'object') {
        throw new Error('Manifesto inválido: versão ou estrutura incorreta');
    }
    return manifesto;
}

export function verifyShared({
    b1Root,
    canonicalRoot,
    expected = COMPARTILHADOS,
    manifestPath = path.join(b1Root, 'shared-manifest.json')
}) {
    if (!b1Root || !canonicalRoot) throw new Error('Raízes B1/canônica ausentes');

    for (const relativo of expected) validarRelativo(relativo);

    const manifesto = lerManifesto(manifestPath);
    const esperados = [...expected].sort();
    const encontrados = Object.keys(manifesto.files).sort();

    if (esperados.length !== encontrados.length || esperados.some((item, indice) => item !== encontrados[indice])) {
        const faltando = esperados.filter((item) => !encontrados.includes(item));
        const extras = encontrados.filter((item) => !esperados.includes(item));
        throw new Error(`Manifesto não corresponde à lista esperada (faltando: ${faltando.join(', ') || 'nenhum'}; extras: ${extras.join(', ') || 'nenhum'})`);
    }

    for (const relativo of expected) {
        const entrada = manifesto.files[relativo];
        if (!entrada || !/^[0-9a-f]{64}$/i.test(entrada.source_sha256 || '') || !/^[0-9a-f]{64}$/i.test(entrada.copied_sha256 || '')) {
            throw new Error(`Manifesto inválido para ${relativo}: hashes ausentes ou malformados`);
        }

        const origem = path.join(canonicalRoot, relativo);
        const copia = path.join(b1Root, relativo);
        if (!fs.existsSync(origem)) throw new Error(`Arquivo canônico ausente: ${relativo}`);
        if (!fs.existsSync(copia)) throw new Error(`Cópia B1 ausente: ${relativo}`);

        const origemHash = hashFile(origem);
        const copiaHash = hashFile(copia);
        if (origemHash !== entrada.source_sha256) {
            throw new Error(`Arquivo canônico divergente desde o sync: ${relativo}`);
        }
        if (copiaHash !== entrada.copied_sha256) {
            throw new Error(`Cópia B1 divergente do manifesto: ${relativo}`);
        }
        if (origemHash !== copiaHash) {
            throw new Error(`Cópia B1 não sincronizada com o canônico: ${relativo}`);
        }
    }

    return { files: expected.length };
}
