import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { criarPacote } from './artifact.mjs';

const destino = process.argv[2]
    ? path.resolve(process.argv[2])
    : fs.mkdtempSync(path.join(os.tmpdir(), 'portal-contas-b1-deploy-'));

const { dir, manifest } = criarPacote({ destino });
console.log(JSON.stringify({
    package_dir: dir,
    static_files: Object.keys(manifest.static).length,
    functions: Object.keys(manifest.functions).length,
    edge_functions: Object.keys(manifest.edge_functions).length,
    redirects: 0,
    config_sha256: manifest.config_sha256
}, null, 2));
