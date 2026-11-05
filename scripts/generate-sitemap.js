const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://portaldascontas.com.br';
const IGNORAR = /(^|[\\/])(node_modules|scratch|pagefind|\.git|Coverage)([\\/]|$)/i;

function walk(dir) {
    let out = [];
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, e.name);
        if (IGNORAR.test(full)) continue;
        if (e.isDirectory()) out = out.concat(walk(full));
        else if (e.name.endsWith('.html')) out.push(full);
    }
    return out;
}

function dataArquivo(file) {
    return fs.statSync(file).mtime.toISOString().slice(0, 10);
}

function dataModified(file) {
    const html = fs.readFileSync(file, 'utf8');
    const m = html.match(/"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})"/i);
    return m ? m[1] : dataArquivo(file);
}

const urls = [];
const vistos = new Set();

function adicionar(loc, lastmod, grupo) {
    if (vistos.has(loc)) return;
    vistos.add(loc);
    urls.push({ loc, lastmod, grupo });
}

adicionar(`${SITE}/`, dataArquivo(path.join(ROOT, 'index.html')), 0);
adicionar(`${SITE}/artigos/`, dataArquivo(path.join(ROOT, 'artigos', 'index.html')), 1);

for (const file of walk(path.join(ROOT, 'artigos'))) {
    const rel = path.relative(path.join(ROOT, 'artigos'), file).replace(/\\/g, '/');
    if (rel === 'index.html') continue;
    adicionar(`${SITE}/artigos/${rel.replace(/\.html$/, '')}`, dataModified(file), 2);
}

for (const file of walk(path.join(ROOT, 'calculadoras'))) {
    const rel = path.relative(path.join(ROOT, 'calculadoras'), file).replace(/\\/g, '/');
    adicionar(`${SITE}/calculadoras/${rel.replace(/\.html$/, '')}`, dataArquivo(file), 3);
}

for (const file of walk(path.join(ROOT, 'paginas'))) {
    const rel = path.relative(path.join(ROOT, 'paginas'), file).replace(/\\/g, '/');
    adicionar(`${SITE}/paginas/${rel.replace(/\.html$/, '')}`, dataArquivo(file), 4);
}

urls.sort((a, b) => a.grupo - b.grupo || a.loc.localeCompare(b.loc));

const linhas = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
];

for (const u of urls) {
    linhas.push(
        '    <url>',
        `        <loc>${u.loc}</loc>`,
        `        <lastmod>${u.lastmod}</lastmod>`,
        '    </url>'
    );
}

linhas.push('</urlset>', '');
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), linhas.join('\n'), 'utf8');

console.log(`Sitemap gerado: ${urls.length} URLs`);
console.log(`Artigos: ${urls.filter(u => u.grupo === 2).length} | Calculadoras: ${urls.filter(u => u.grupo === 3).length} | Páginas: ${urls.filter(u => u.grupo === 4).length}`);
