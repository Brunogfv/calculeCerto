import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    criarPacote,
    validarPacote,
    digestArtefato,
    criarManifestoIntegridade
} from './artifact.mjs';
import { congelarPacote } from './deploy-b1.mjs';
import { B1_TARGET } from './deploy-target.mjs';

const B1 = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destino = process.argv[2] ? path.resolve(process.argv[2]) : null;
const integridadePath = process.argv[3] ? path.resolve(process.argv[3]) : null;
const runtimeDeps = process.argv[4] ? path.resolve(process.argv[4]) : null;

if (!destino || !integridadePath || !runtimeDeps) {
    console.error('Uso: node scripts/freeze-artifact-runtime.mjs <destino> <integridade> <runtime-deps>');
    process.exit(2);
}
if (fs.existsSync(destino)) {
    console.error(`Destino ja existe; escolha um diretorio exclusivo: ${destino}`);
    process.exit(2);
}
if (!fs.existsSync(runtimeDeps)) {
    console.error('Diretorio de dependencias de runtime ausente.');
    process.exit(2);
}

const { dir, manifest } = criarPacote({
    destino,
    sourceRoot: B1,
    runtimeDeps
});
validarPacote(dir);
congelarPacote(dir);
validarPacote(dir);
const digest = digestArtefato(dir);
if (digestArtefato(dir) !== digest) {
    throw new Error('Artefato mudou durante o congelamento.');
}
const integrity = criarManifestoIntegridade({
    dir,
    digest,
    siteId: B1_TARGET.siteId,
    status: 'validated_only'
});
fs.writeFileSync(integridadePath, `${JSON.stringify(integrity, null, 2)}\n`, 'utf8');

console.log(JSON.stringify({
    package_dir: dir,
    integrity_file: integridadePath,
    artifact_sha256: digest,
    package_manifest_sha256: integrity.package.package_manifest_sha256,
    config_sha256: integrity.package.config_sha256,
    static_files: Object.keys(manifest.static).length,
    source_functions: Object.keys(manifest.functions).length,
    bundled_functions: 0,
    edge_functions: Object.keys(manifest.edge_functions).length,
    total_files: integrity.package.total_files,
    total_bytes: integrity.package.total_bytes,
    redirects: 0,
    frozen: true
}, null, 2));



