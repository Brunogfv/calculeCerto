const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ARQUIVO = path.join(ROOT, '_redirects');
const IGNORAR = /(^|[\\/])(node_modules|scratch|pagefind|\.git|Coverage|dist|tests|scripts|docs|playwright-report|test-results)([\\/]|$)/i;
const BEGIN = '# BEGIN HTML REDIRECTS (gerado por scripts/generate-html-redirects.js)';
const END = '# END HTML REDIRECTS';

function walk(dir) {
    let out = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (IGNORAR.test(full)) continue;
        if (entry.isDirectory()) out = out.concat(walk(full));
        else if (entry.name.endsWith('.html')) out.push(full);
    }
    return out;
}

const regras = [];

for (const file of walk(ROOT)) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    if (rel === 'index.html' || rel.endsWith('/index.html')) continue;

    const origem = '/' + rel;
    const destino = '/' + rel.replace(/\.html$/, '');
    regras.push(`${origem} ${destino} 301!`);
}

regras.sort();

let conteudo = fs.readFileSync(ARQUIVO, 'utf8');
const inicio = conteudo.indexOf(BEGIN);
const fim = conteudo.indexOf(END);

if (inicio !== -1 && fim !== -1) {
    conteudo = conteudo.slice(0, inicio)
        + BEGIN + '\n'
        + regras.join('\n') + '\n'
        + conteudo.slice(fim);
} else {
    conteudo = conteudo.trimEnd() + '\n\n'
        + BEGIN + '\n'
        + regras.join('\n') + '\n'
        + END + '\n';
}

fs.writeFileSync(ARQUIVO, conteudo, 'utf8');
console.log(`Redirects .html gerados: ${regras.length}`);
