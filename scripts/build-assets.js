const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { minify } = require('terser');
const CleanCSS = require('clean-css');

const ROOT = path.resolve(__dirname, '..');
const HASHED_RE = /\.min\.[0-9a-f]{8}\.(js|css)$/i;

const MODULES = new Set([
    'js/pagefind.js',
    'js/gerar-header.js',
    'js/busca.js'
]);



const IGNORAR_HTML = /(^|[\\/])(node_modules|scratch|pagefind|\.git|Coverage)([\\/]|$)/i;

function rel(...parts) {
    return path.join(...parts).replace(/\\/g, '/');
}

function read(relPath) {
    return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function write(relPath, content) {
    const full = path.join(ROOT, relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, 'utf8');
}

function hash(content) {
    return crypto.createHash('sha256').update(content).digest('hex').slice(0, 8);
}

function listar(dir) {
    return fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })
        .filter(e => e.isFile())
        .map(e => e.name)
        .filter(name => !HASHED_RE.test(name));
}

function walkHtml(dir) {
    let out = [];
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, e.name);
        if (IGNORAR_HTML.test(full)) continue;
        if (e.isDirectory()) out = out.concat(walkHtml(full));
        else if (e.name.endsWith('.html')) out.push(full);
    }
    return out;
}

async function buildJs(sourceRel, options = {}) {
    const source = options.source || read(sourceRel);
    const isModule = MODULES.has(sourceRel);
    const result = await minify(source, {
        compress: true,
        mangle: true,
        module: isModule,
        format: { comments: false }
    });
    if (!result.code) throw new Error(`Falha ao minificar ${sourceRel}`);
    const h = hash(result.code);
    const outputRel = sourceRel.replace(/\.js$/, `.min.${h}.js`);
    write(outputRel, result.code);
    return { source: '/' + sourceRel, output: '/' + outputRel };
}

function buildCss(sourceRel) {
    const result = new CleanCSS({ level: 2, rebase: false }).minify(read(sourceRel));
    if (result.errors.length) {
        throw new Error(`Falha ao minificar ${sourceRel}: ${result.errors.join('; ')}`);
    }
    const h = hash(result.styles);
    const outputRel = sourceRel.replace(/\.css$/, `.min.${h}.css`);
    write(outputRel, result.styles);
    return { source: '/' + sourceRel, output: '/' + outputRel };
}

async function main() {
    // Remove versões antigas geradas.
    for (const dir of ['css', 'artigos/css', 'js']) {
        for (const name of fs.readdirSync(path.join(ROOT, dir))) {
            if (HASHED_RE.test(name)) fs.unlinkSync(path.join(ROOT, dir, name));
        }
    }

    const mapa = new Map();
    const manifest = {};

    function registrar(item) {
        mapa.set(item.source, item.output);
        manifest[item.source] = item.output;
    }

    // Dependências dinâmicas do header.
    const deps = ['js/utils-calculadoras.js', 'js/usuario.js', 'js/favoritos-auto.js'];
    for (const dep of deps) registrar(await buildJs(dep));

    // Header usa os hashes das dependências.
    let headerSource = read('js/gerar-header.js');
    for (const dep of deps) {
        const hashed = manifest['/' + dep].replace(/^\//, '');
        headerSource = headerSource.split(dep).join(hashed);
    }
    registrar(await buildJs('js/gerar-header.js', { source: headerSource }));

    // Demais JS.
    const jsSources = listar('js')
        .filter(name => name.endsWith('.js'))
        .map(name => 'js/' + name)
        .filter(relPath => !deps.includes(relPath) && relPath !== 'js/gerar-header.js');

    for (const source of jsSources) registrar(await buildJs(source));

    // CSS.
    const cssSources = [
        ...listar('css').filter(name => name.endsWith('.css')).map(name => 'css/' + name),
        ...listar('artigos/css').filter(name => name.endsWith('.css')).map(name => 'artigos/css/' + name)
    ];
    for (const source of cssSources) registrar(buildCss(source));

    // Reescreve as referências no HTML.
    let htmlAtualizados = 0;
    for (const file of walkHtml(ROOT)) {
        let html = fs.readFileSync(file, 'utf8');
        const before = html;
        const htmlRel = '/' + path.relative(ROOT, file).replace(/\\/g, '/');
        const dirUrl = path.posix.dirname(htmlRel);

        html = html.replace(/\b(href|src)=(["'])([^"']+)\2/gi, (match, attr, quote, value) => {
            if (!/\.(css|js)(?:[?#].*)?$/i.test(value)) return match;
            if (/^(?:https?:)?\/\//i.test(value) || /^(?:data|javascript):/i.test(value)) return match;

            const suffixIndex = value.search(/[?#]/);
            const pathPart = suffixIndex === -1 ? value : value.slice(0, suffixIndex);
            const suffix = suffixIndex === -1 ? '' : value.slice(suffixIndex);

            const resolved = pathPart.startsWith('/')
                ? path.posix.normalize(pathPart)
                : path.posix.resolve(dirUrl, pathPart);

            const sourcePath = resolved.replace(/\.min\.[0-9a-f]{8}\.(js|css)$/i, '.$1');
            const output = mapa.get(sourcePath);
            if (!output) return match;

            return `${attr}=${quote}${output}${suffix}${quote}`;
        });

        if (html !== before) {
            fs.writeFileSync(file, html, 'utf8');
            htmlAtualizados++;
        }
    }

    write('asset-manifest.json', JSON.stringify(manifest, null, 2) + '\n');

    console.log(`JS versionados: ${jsSources.length + deps.length + 1}`);
    console.log(`CSS versionados: ${cssSources.length}`);
    console.log(`HTML com referências atualizadas: ${htmlAtualizados}`);
    console.log('Manifesto: asset-manifest.json');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
