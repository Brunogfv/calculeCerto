const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const IGNORAR = /(^|[\\/])(node_modules|dist|pagefind|playwright-report|test-results|validation-b1|docs|tests|scripts|scratch|Coverage|\.git)([\\/]|$)/i;
const INICIO = '<!-- pca-analytics:start -->';
const FIM = '<!-- pca-analytics:end -->';

const BLOCO = `${INICIO}
<link rel="stylesheet" href="/css/analytics.css" data-pca-analytics-css>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
});
</script>
<script src="/js/analytics.js" defer data-pca-analytics-js></script>
${FIM}`;

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

function removerBloco(html) {
    const escapadoInicio = INICIO.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapadoFim = FIM.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return html.replace(new RegExp(`${escapadoInicio}[\\s\\S]*?${escapadoFim}\\s*`, 'gi'), '');
}

function posicaoInsercao(html) {
    const marcadores = [
        /<script\b[^>]*\bsrc=["'][^"']*(?:googletagmanager|google-analytics|googlesyndication|doubleclick)[^"']*["'][^>]*>/i,
        /<script\b[^>]*>[\s\S]*?gtag\(\s*['"]config['"]/i
    ];

    let indice = -1;
    for (const marcador of marcadores) {
        const encontrado = html.match(marcador);
        if (encontrado && (indice === -1 || encontrado.index < indice)) {
            indice = encontrado.index;
        }
    }

    if (indice !== -1) return { indice, motivo: 'tag-google' };

    const head = html.search(/<\/head>/i);
    if (head !== -1) return { indice: head, motivo: 'fim-head' };

    const body = html.search(/<\/body>/i);
    if (body !== -1) return { indice: body, motivo: 'fim-body' };

    return null;
}

const arquivos = walk(ROOT);
let atualizados = 0;
let semHead = 0;

for (const arquivo of arquivos) {
    const original = fs.readFileSync(arquivo, 'utf8');
    let html = removerBloco(original);
    const posicao = posicaoInsercao(html);

    if (!posicao) {
        semHead++;
        continue;
    }

    html = `${html.slice(0, posicao.indice)}${BLOCO}\n${html.slice(posicao.indice)}`;

    if (html !== original) {
        fs.writeFileSync(arquivo, html, 'utf8');
        atualizados++;
    }
}

console.log(`Analytics aplicado em ${atualizados} HTML`);
if (semHead) console.log(`HTML sem head/body para inserção: ${semHead}`);
