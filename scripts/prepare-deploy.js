const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

const RAIZ = [
    'index.html',
    'busca.html',
    'meus-calculos.html',
    '_headers',
    '_redirects',
    'sitemap.xml',
    'robots.txt',
    'ads.txt',
    '.nojekyll',
    'favicon.ico',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'apple-touch-icon.png'
];

const DIRETORIOS = [
    'calculadoras',
    'artigos',
    'paginas',
    'css',
    'js',
    'imgs',
    'pagefind'
];

const HAS_CSS = /\.min\.[0-9a-f]{8}\.css$/i;
const HAS_JS = /\.min\.[0-9a-f]{8}\.js$/i;

function prune(dir, keepFile, keepDirs = []) {
    if (!fs.existsSync(dir)) return;

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            if (keepDirs.includes(entry.name)) continue;
            prune(full, keepFile, keepDirs);
            if (fs.readdirSync(full).length === 0) fs.rmdirSync(full);
        } else if (!keepFile.test(entry.name)) {
            fs.unlinkSync(full);
        }
    }
}

function contarArquivos(dir) {
    let count = 0;
    let bytes = 0;

    function percorrer(atual) {
        for (const entry of fs.readdirSync(atual, { withFileTypes: true })) {
            const full = path.join(atual, entry.name);
            if (entry.isDirectory()) percorrer(full);
            else {
                count++;
                bytes += fs.statSync(full).size;
            }
        }
    }

    percorrer(dir);
    return { count, bytes };
}

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

for (const file of RAIZ) {
    const source = path.join(ROOT, file);
    if (fs.existsSync(source)) fs.copyFileSync(source, path.join(DIST, file));
}

for (const dir of DIRETORIOS) {
    const source = path.join(ROOT, dir);
    if (fs.existsSync(source)) fs.cpSync(source, path.join(DIST, dir), { recursive: true });
}

// Publica apenas os assets com hash; fontes ficam fora do deploy.
prune(path.join(DIST, 'css'), HAS_CSS);
prune(path.join(DIST, 'artigos', 'css'), HAS_CSS);
prune(path.join(DIST, 'js'), HAS_JS, ['vendor']);

const obrigatorios = [
    'index.html',
    'busca.html',
    'meus-calculos.html',
    '_headers',
    '_redirects',
    'sitemap.xml',
    'robots.txt',
    'ads.txt',
    'js/vendor/chart-4.6.1.umd.min.js',
    'imgs/og-portal-das-contas.jpg',
    'pagefind/pagefind.js'
];

for (const item of obrigatorios) {
    if (!fs.existsSync(path.join(DIST, item))) {
        throw new Error(`Arquivo obrigatório ausente no dist: ${item}`);
    }
}

const resumo = contarArquivos(DIST);

console.log(`Deploy preparado em dist/`);
console.log(`Arquivos: ${resumo.count} | Tamanho: ${(resumo.bytes / 1024 / 1024).toFixed(1)} MB`);
