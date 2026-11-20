import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { COMPARTILHADOS, MANIFEST_VERSION } from './shared-files.mjs';
import { hashFile } from './verify-shared.mjs';

const B1 = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.resolve(B1, '..');

const manifesto = { version: MANIFEST_VERSION, files: {} };

for (const relativo of COMPARTILHADOS) {
    const origem = path.join(ROOT, relativo);
    const destino = path.join(B1, relativo);
    if (!fs.existsSync(origem)) throw new Error(`Arquivo canônico ausente: ${relativo}`);

    fs.mkdirSync(path.dirname(destino), { recursive: true });
    const origemHash = hashFile(origem);
    const destinoHash = fs.existsSync(destino) ? hashFile(destino) : null;

    if (destinoHash !== origemHash) {
        fs.copyFileSync(origem, destino);
        console.log(`sincronizado: ${relativo}`);
    }

    manifesto.files[relativo] = {
        source_sha256: origemHash,
        copied_sha256: hashFile(destino)
    };
}

const manifestoPath = path.join(B1, 'shared-manifest.json');
fs.writeFileSync(manifestoPath, `${JSON.stringify(manifesto, null, 2)}\n`, 'utf8');
console.log(`shared-manifest.json gerado com ${COMPARTILHADOS.length} arquivos.`);
