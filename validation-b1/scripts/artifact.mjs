import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const B1 = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTRACT_PATH = path.join(B1, 'artifact-contract.json');
const CONTRACT_KEYS = ['version', 'static', 'functions', 'edge_functions', 'config_sha256', 'redirects'];
const MANIFEST_KEYS = ['version', 'static', 'functions', 'edge_functions', 'config_sha256'];

export const STATIC_ALLOWLIST = Object.freeze([
    'index.html',
    'validacao-encerrada.html',
    'robots.txt',
    '_headers',
    'b1-consent.js',
    'b1.css',
    'build-manifest.json'
]);

export const FUNCTION_ALLOWLIST = Object.freeze([
    'capture-html.mjs',
    'cleanup-html-capture.mjs',
    'collect.mjs',
    '_lib/attribution.mjs',
    '_lib/capture-config.mjs',
    '_lib/capture-handler.mjs',
    '_lib/capture-validation.mjs',
    '_lib/cleanup-html-capture.mjs',
    '_lib/cleanup-retention.mjs',
    '_lib/collect-handler.mjs',
    '_lib/config.mjs',
    '_lib/db.mjs',
    '_lib/http.mjs',
    '_lib/rate-limit.mjs',
    '_lib/user-agent.mjs',
    '_lib/validation.mjs'
]);

export const BUNDLED_FUNCTIONS_DIR = 'netlify/functions-bundled';

export const BUNDLED_FUNCTION_ALLOWLIST = Object.freeze([
    'capture-html.zip',
    'cleanup-html-capture.zip',
    'collect.zip'
]);

export const EDGE_ALLOWLIST = Object.freeze([
    'html-capture.js',
    '_lib/capture-limits.mjs',
    '_lib/capture-policy.mjs',
    '_lib/capture-signature.mjs',
    '_lib/classifier.mjs',
    '_lib/edge-capture.mjs',
    '_lib/edge-env.mjs'
]);

const FORBIDDEN_STATIC = Object.freeze([
    '_redirects'
]);

const FORBIDDEN_FUNCTION = Object.freeze([]);

const SECRET_PATTERNS = Object.freeze([
    'postgresql://',
    'DATABASE_URL',
    'CLEANUP_DATABASE_URL',
    'MIGRATION_DATABASE_URL',
    'EDGE_INGEST_SECRET',
    'RATE_LIMIT_HMAC_SECRET',
    'BEGIN PRIVATE KEY',
    'sk_live_',
    'nfp_'
]);

const SECRET_LITERALS = Object.freeze([
    'postgresql://',
    'BEGIN PRIVATE KEY',
    'sk_live_',
    'nfp_'
]);

function validarCaminhoRelativo(relativo, rotulo = 'arquivo') {
    if (typeof relativo !== 'string' || !relativo || relativo.includes('\\')) {
        throw new Error(`${rotulo} com caminho invalido: ${relativo}`);
    }
    if (path.posix.isAbsolute(relativo) || /^[A-Za-z]:/.test(relativo)) {
        throw new Error(`${rotulo} com caminho absoluto: ${relativo}`);
    }
    const partes = relativo.split('/');
    if (partes.some((parte) => !parte || parte === '.' || parte === '..')) {
        throw new Error(`${rotulo} com traversal ou componente invalido: ${relativo}`);
    }
}

function arquivosRelativos(dir) {
    if (!fs.existsSync(dir)) throw new Error(`Diretorio ausente: ${dir}`);
    return fs.readdirSync(dir, { withFileTypes: true })
        .flatMap((entry) => {
            const full = path.join(dir, entry.name);
            if (entry.isSymbolicLink()) {
                throw new Error(`Symlink proibido no artefato: ${entry.name}`);
            }
            if (entry.isDirectory()) {
                return arquivosRelativos(full).map((item) => path.join(entry.name, item));
            }
            return [entry.name];
        })
        .map((item) => item.split(path.sep).join('/'))
        .sort();
}

function hashArquivo(arquivo) {
    return crypto.createHash('sha256').update(fs.readFileSync(arquivo)).digest('hex');
}

function hashValido(valor) {
    return typeof valor === 'string' && /^[a-f0-9]{64}$/i.test(valor);
}

function detectarChavesDuplicadas(texto, rotulo) {
    const vistas = new Set();
    const re = /"((?:\\.|[^"\\])*)"\s*:/g;
    let match;
    while ((match = re.exec(texto))) {
        const chave = match[1];
        if (vistas.has(chave)) throw new Error(`${rotulo} com chave duplicada: ${chave}`);
        vistas.add(chave);
    }
}

function mapaValido(mapa, rotulo) {
    if (!mapa || typeof mapa !== 'object' || Array.isArray(mapa)) {
        throw new Error(`${rotulo} deve ser um objeto.`);
    }
    for (const [relativo, hash] of Object.entries(mapa)) {
        validarCaminhoRelativo(relativo, rotulo);
        if (!hashValido(hash)) throw new Error(`${rotulo} com hash invalido: ${relativo}`);
    }
    return mapa;
}

export function carregarContrato(arquivo = CONTRACT_PATH) {
    const texto = fs.readFileSync(arquivo, 'utf8');
    detectarChavesDuplicadas(texto, 'Contrato');
    const contrato = JSON.parse(texto);
    const chaves = Object.keys(contrato).sort();
    if (JSON.stringify(chaves) !== JSON.stringify([...CONTRACT_KEYS].sort())) {
        throw new Error('Contrato com campos desconhecidos ou ausentes.');
    }
    if (contrato.version !== 1) throw new Error('Versao de contrato nao suportada.');
    if (contrato.redirects !== 0) throw new Error('Contrato autoriza redirects nao permitidos.');
    mapaValido(contrato.static, 'Contrato static');
    mapaValido(contrato.functions, 'Contrato functions');
    mapaValido(contrato.edge_functions, 'Contrato edge_functions');
    if (!hashValido(contrato.config_sha256)) throw new Error('Contrato com config_sha256 invalido.');
    return contrato;
}

function carregarManifesto(pacoteRoot) {
    const arquivo = path.join(pacoteRoot, 'package-manifest.json');
    if (!fs.existsSync(arquivo)) throw new Error('package-manifest.json ausente.');
    let manifesto;
    try {
        const texto = fs.readFileSync(arquivo, 'utf8');
        detectarChavesDuplicadas(texto, 'Manifesto');
        manifesto = JSON.parse(texto);
    } catch {
        throw new Error('package-manifest.json invalido.');
    }
    const chaves = Object.keys(manifesto).sort();
    if (JSON.stringify(chaves) !== JSON.stringify([...MANIFEST_KEYS].sort())) {
        throw new Error('Manifesto com campos desconhecidos ou ausentes.');
    }
    if (manifesto.version !== 1) throw new Error('Versao de manifesto nao suportada.');
    mapaValido(manifesto.static, 'Manifesto static');
    mapaValido(manifesto.functions, 'Manifesto functions');
    mapaValido(manifesto.edge_functions, 'Manifesto edge_functions');
    if (!hashValido(manifesto.config_sha256)) throw new Error('Manifesto com config_sha256 invalido.');
    return manifesto;
}

function compararMapas(esperado, atual, rotulo) {
    const esperadoKeys = Object.keys(esperado).sort();
    const atualKeys = Object.keys(atual).sort();
    if (JSON.stringify(esperadoKeys) !== JSON.stringify(atualKeys)) {
        throw new Error(`${rotulo} com lista de arquivos divergente.`);
    }
    for (const chave of esperadoKeys) {
        if (esperado[chave] !== atual[chave]) {
            throw new Error(`${rotulo} com hash divergente: ${chave}`);
        }
    }
}

function mapaDeArquivos(dir, arquivos) {
    return Object.fromEntries(arquivos.map((relativo) => [
        relativo,
        hashArquivo(path.join(dir, relativo))
    ]));
}

function conjunto(valores) {
    return new Set(valores);
}

function diferencaEsperada(esperado, atual, rotulo) {
    const faltando = esperado.filter((item) => !atual.includes(item));
    const extras = atual.filter((item) => !esperado.includes(item));
    if (faltando.length || extras.length) {
        throw new Error(`${rotulo} divergente; faltando=[${faltando.join(', ')}] extras=[${extras.join(', ')}]`);
    }
}

function validarToml(arquivo) {
    const texto = fs.readFileSync(arquivo, 'utf8');
    for (const esperado of [
        'publish = "dist"',
        'directory = "netlify/functions"',
        'edge_functions = "netlify/edge-functions"'
    ]) {
        if (!texto.includes(esperado)) throw new Error(`netlify.toml sem ${esperado}`);
    }
    if (/[A-Za-z]:\\|^base\s*=|absolute/i.test(texto)) {
        throw new Error('netlify.toml contem caminho absoluto ou base');
    }
}

function validarArquivosDeConteudo(dir, patterns = SECRET_LITERALS) {
    const arquivos = arquivosRelativos(dir);
    for (const relativo of arquivos) {
        const texto = fs.readFileSync(path.join(dir, relativo), 'utf8');
        for (const proibido of patterns) {
            if (texto.includes(proibido)) {
                throw new Error(`Conteudo proibido (${proibido}) em ${relativo}`);
            }
        }
    }
}

export function validarFontesB1(sourceRoot = B1) {
    const contrato = carregarContrato();
    const funcoes = arquivosRelativos(path.join(sourceRoot, 'netlify', 'functions'));
    const edge = arquivosRelativos(path.join(sourceRoot, 'netlify', 'edge-functions'));
    const publico = arquivosRelativos(path.join(sourceRoot, 'public'));
    const estaticosOrigem = Object.keys(contrato.static).filter((arquivo) => arquivo !== 'build-manifest.json');

    diferencaEsperada(Object.keys(contrato.functions).sort(), funcoes, 'Functions B1');
    diferencaEsperada(Object.keys(contrato.edge_functions).sort(), edge, 'Edge Functions B1');
    diferencaEsperada(estaticosOrigem.sort(), publico, 'Static B1');
    for (const proibido of FORBIDDEN_FUNCTION) {
        if (funcoes.includes(proibido)) throw new Error(`Function proibida no B1: ${proibido}`);
    }
    for (const proibido of FORBIDDEN_STATIC) {
        if (publico.includes(proibido)) throw new Error(`Static proibido no B1: ${proibido}`);
    }
    for (const [arquivo, hash] of Object.entries(contrato.static)) {
        if (arquivo === 'build-manifest.json') continue;
        if (hashArquivo(path.join(sourceRoot, 'public', arquivo)) !== hash) {
            throw new Error(`Conteudo de origem divergente do contrato: ${arquivo}`);
        }
    }
    for (const [arquivo, hash] of Object.entries(contrato.functions)) {
        if (hashArquivo(path.join(sourceRoot, 'netlify', 'functions', arquivo)) !== hash) {
            throw new Error(`Function de origem divergente do contrato: ${arquivo}`);
        }
    }
    for (const [arquivo, hash] of Object.entries(contrato.edge_functions)) {
        if (hashArquivo(path.join(sourceRoot, 'netlify', 'edge-functions', arquivo)) !== hash) {
            throw new Error(`Edge de origem divergente do contrato: ${arquivo}`);
        }
    }
    validarToml(path.join(sourceRoot, 'netlify.toml'));
    validarArquivosDeConteudo(path.join(sourceRoot, 'netlify'), SECRET_LITERALS);
    validarArquivosDeConteudo(path.join(sourceRoot, 'public'), SECRET_PATTERNS);

    return { funcoes, edge, publico };
}

export function validarBundledFunctions(pacoteRoot) {
    const bundleDir = path.join(pacoteRoot, BUNDLED_FUNCTIONS_DIR);
    if (!fs.existsSync(bundleDir)) throw new Error('Pacote de Functions empacotadas ausente.');
    const arquivos = arquivosRelativos(bundleDir);
    diferencaEsperada([...BUNDLED_FUNCTION_ALLOWLIST].sort(), arquivos, 'Functions empacotadas');
    return arquivos;
}

function runtimeArquivos(pacoteRoot) {
    const entradas = [];
    for (const nome of ['package.json', 'package-lock.json']) {
        const arquivo = path.join(pacoteRoot, nome);
        if (fs.existsSync(arquivo)) entradas.push({ relativo: nome, raiz: pacoteRoot });
    }
    const nodeModules = path.join(pacoteRoot, 'node_modules');
    if (fs.existsSync(nodeModules)) {
        for (const relativo of arquivosRelativos(nodeModules)) {
            entradas.push({ relativo: path.posix.join('node_modules', relativo), raiz: pacoteRoot });
        }
    }
    return entradas;
}

export function digestArtefato(pacoteRoot) {
    const fontes = [
        ['dist', path.join(pacoteRoot, 'dist')],
        ['functions', path.join(pacoteRoot, 'netlify', 'functions')],
        ['edge_functions', path.join(pacoteRoot, 'netlify', 'edge-functions')]
    ];
    const bundleDir = path.join(pacoteRoot, BUNDLED_FUNCTIONS_DIR);
    if (fs.existsSync(bundleDir)) {
        fontes.push(['bundled_functions', bundleDir]);
    }
    const entradas = [];
    for (const [categoria, raiz] of fontes) {
        for (const relativo of arquivosRelativos(raiz)) {
            entradas.push(`${categoria}/${relativo}\u0000${hashArquivo(path.join(raiz, relativo))}`);
        }
    }
    for (const item of runtimeArquivos(pacoteRoot)) {
        entradas.push(`runtime/${item.relativo}\u0000${hashArquivo(path.join(item.raiz, item.relativo))}`);
    }
    entradas.push(`config\u0000${hashArquivo(path.join(pacoteRoot, 'netlify.toml'))}`);
    return crypto.createHash('sha256').update(`${entradas.sort().join('\n')}\n`).digest('hex');
}

export function validarHandoff({ dir, digest }) {
    if (!hashValido(digest)) throw new Error('Digest do artefato ausente ou invalido.');
    validarPacote(dir);
    const atual = digestArtefato(dir);
    if (atual !== digest) throw new Error('Artefato divergente do digest validado.');
    return atual;
}

export function criarManifestoIntegridade({
    dir,
    digest,
    siteId,
    status = 'validated_only',
    executionId = crypto.randomUUID(),
    now = new Date(),
    nodeVersion = process.version,
    netlifyCliVersion = '27.20.0'
} = {}) {
    if (!hashValido(digest)) throw new Error('Digest do artefato ausente ou invalido.');
    validarPacote(dir);
    if (digestArtefato(dir) !== digest) throw new Error('Artefato divergente ao gerar o manifesto.');
    const fontes = [
        ['static', path.join(dir, 'dist')],
        ['functions', path.join(dir, 'netlify', 'functions')],
        ['edge_functions', path.join(dir, 'netlify', 'edge-functions')]
    ];
    const bundleDir = path.join(dir, BUNDLED_FUNCTIONS_DIR);
    if (fs.existsSync(bundleDir)) {
        fontes.push(['bundled_functions', bundleDir]);
    }
    const files = [];
    const counts = {};
    let totalBytes = 0;
    for (const [categoria, raiz] of fontes) {
        const relativos = arquivosRelativos(raiz);
        counts[categoria] = relativos.length;
        for (const relativo of relativos) {
            const arquivo = path.join(raiz, relativo);
            const bytes = fs.statSync(arquivo).size;
            totalBytes += bytes;
            files.push({
                category: categoria,
                path: `${categoria === 'static'
                    ? 'dist'
                    : categoria === 'functions'
                        ? 'netlify/functions'
                        : categoria === 'edge_functions'
                            ? 'netlify/edge-functions'
                            : BUNDLED_FUNCTIONS_DIR}/${relativo}`,
                bytes,
                sha256: hashArquivo(arquivo)
            });
        }
    }
    const runtime = runtimeArquivos(dir);
    if (runtime.length) {
        counts.runtime = runtime.length;
        for (const item of runtime) {
            const arquivo = path.join(item.raiz, item.relativo);
            const bytes = fs.statSync(arquivo).size;
            totalBytes += bytes;
            files.push({
                category: 'runtime',
                path: item.relativo,
                bytes,
                sha256: hashArquivo(arquivo)
            });
        }
    }
    const config = path.join(dir, 'netlify.toml');
    const manifest = path.join(dir, 'package-manifest.json');
    const adicionar = (category, nome, arquivo) => {
        const bytes = fs.statSync(arquivo).size;
        totalBytes += bytes;
        files.push({ category, path: nome, bytes, sha256: hashArquivo(arquivo) });
    };
    adicionar('config', 'netlify.toml', config);
    adicionar('metadata', 'package-manifest.json', manifest);
    counts.config = 1;
    counts.metadata = 1;
    files.sort((a, b) => a.path.localeCompare(b.path));
    return {
        schema_version: 1,
        execution_id: executionId,
        validated_at: now.toISOString(),
        scope: 'B1-local-pre-publication',
        site: {
            id: siteId || null,
            name: 'portal-contas-validation-b1'
        },
        package: {
            contract_version: 1,
            artifact_sha256: digest,
            package_manifest_sha256: hashArquivo(manifest),
            config_sha256: hashArquivo(config),
            counts,
            total_files: files.length,
            total_bytes: totalBytes,
            files
        },
        tooling: {
            node: nodeVersion,
            netlify_cli: netlifyCliVersion,
            platform: process.platform
        },
        gate: {
            status
        },
        limitations: [
            'Integridade local nao prova sozinha o conteudo publicado no Netlify.',
            'A verificacao pos-upload deve comparar os arquivos publicados ou seus hashes.',
            'O manifesto nao contem valores de variaveis, secrets ou credenciais.'
        ]
    };
}

export function validarPacote(pacoteRoot, contractPath = CONTRACT_PATH) {
    const contrato = carregarContrato(contractPath);
    const manifesto = carregarManifesto(pacoteRoot);
    const dist = path.join(pacoteRoot, 'dist');
    const functions = path.join(pacoteRoot, 'netlify', 'functions');
    const edge = path.join(pacoteRoot, 'netlify', 'edge-functions');
    const estaticos = arquivosRelativos(dist);
    const funcoes = arquivosRelativos(functions);
    const edgeArquivos = arquivosRelativos(edge);

    diferencaEsperada(Object.keys(contrato.static).sort(), estaticos, 'Static B1');
    diferencaEsperada(Object.keys(contrato.functions).sort(), funcoes, 'Functions B1');
    diferencaEsperada(Object.keys(contrato.edge_functions).sort(), edgeArquivos, 'Edge Functions B1');
    for (const proibido of FORBIDDEN_STATIC) {
        if (estaticos.includes(proibido)) throw new Error(`Static proibido no pacote: ${proibido}`);
    }
    for (const proibido of FORBIDDEN_FUNCTION) {
        if (funcoes.includes(proibido)) throw new Error(`Function proibida no pacote: ${proibido}`);
    }
    validarToml(path.join(pacoteRoot, 'netlify.toml'));
    validarArquivosDeConteudo(dist, SECRET_PATTERNS);
    validarArquivosDeConteudo(functions, SECRET_LITERALS);
    validarArquivosDeConteudo(edge, SECRET_LITERALS);

    const estaticosReais = mapaDeArquivos(dist, estaticos);
    const funcoesReais = mapaDeArquivos(functions, funcoes);
    const edgeReais = mapaDeArquivos(edge, edgeArquivos);
    compararMapas(contrato.static, estaticosReais, 'Static do contrato');
    compararMapas(contrato.functions, funcoesReais, 'Functions do contrato');
    compararMapas(contrato.edge_functions, edgeReais, 'Edge do contrato');
    compararMapas(estaticosReais, manifesto.static, 'Manifesto static');
    compararMapas(funcoesReais, manifesto.functions, 'Manifesto functions');
    compararMapas(edgeReais, manifesto.edge_functions, 'Manifesto edge');

    const configHash = hashArquivo(path.join(pacoteRoot, 'netlify.toml'));
    if (configHash !== contrato.config_sha256) throw new Error('netlify.toml diverge do contrato.');
    if (configHash !== manifesto.config_sha256) throw new Error('netlify.toml diverge do manifesto.');

    return { estaticos, funcoes, edge: edgeArquivos };
}

export function criarPacote({ destino, sourceRoot = B1, bundledFunctions = null, runtimeDeps = null } = {}) {
    if (!destino) throw new Error('Destino do pacote ausente');
    const stage = path.resolve(destino);
    fs.rmSync(stage, { recursive: true, force: true });
    fs.mkdirSync(stage, { recursive: true });

    fs.cpSync(path.join(sourceRoot, 'dist'), path.join(stage, 'dist'), { recursive: true });
    fs.cpSync(
        path.join(sourceRoot, 'netlify', 'functions'),
        path.join(stage, 'netlify', 'functions'),
        { recursive: true }
    );
    fs.cpSync(
        path.join(sourceRoot, 'netlify', 'edge-functions'),
        path.join(stage, 'netlify', 'edge-functions'),
        { recursive: true }
    );
    if (bundledFunctions) {
        fs.cpSync(bundledFunctions, path.join(stage, BUNDLED_FUNCTIONS_DIR), { recursive: true });
    }
    if (runtimeDeps) {
        for (const nome of ['package.json', 'package-lock.json']) {
            const origem = path.join(runtimeDeps, nome);
            if (fs.existsSync(origem)) fs.cpSync(origem, path.join(stage, nome));
        }
        const nodeModules = path.join(runtimeDeps, 'node_modules');
        if (fs.existsSync(nodeModules)) {
            fs.cpSync(nodeModules, path.join(stage, 'node_modules'), { recursive: true });
        }
    }

    fs.writeFileSync(path.join(stage, 'netlify.toml'), [
        '[build]',
        '  publish = "dist"',
        '  edge_functions = "netlify/edge-functions"',
        '',
        '[build.environment]',
        '  NODE_VERSION = "22"',
        '',
        '[functions]',
        '  directory = "netlify/functions"',
        ''
    ].join('\n'));

    const dist = path.join(stage, 'dist');
    const functions = path.join(stage, 'netlify', 'functions');
    const edge = path.join(stage, 'netlify', 'edge-functions');
    const manifest = {
        version: 1,
        static: mapaDeArquivos(dist, arquivosRelativos(dist)),
        functions: mapaDeArquivos(functions, arquivosRelativos(functions)),
        edge_functions: mapaDeArquivos(edge, arquivosRelativos(edge)),
        config_sha256: hashArquivo(path.join(stage, 'netlify.toml'))
    };
    fs.writeFileSync(
        path.join(stage, 'package-manifest.json'),
        `${JSON.stringify(manifest, null, 2)}\n`,
        'utf8'
    );

    validarPacote(stage);
    if (bundledFunctions) validarBundledFunctions(stage);
    return { dir: stage, manifest };
}

export { B1 };


