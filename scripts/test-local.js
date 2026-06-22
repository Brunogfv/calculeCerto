const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const PORT = 3679;
const ROOT = path.resolve(__dirname, '..');
const REPORT = path.join(ROOT, 'relatorio-local.md');

const mime = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.xml': 'application/xml',
};

function startServer() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      let fp = req.url === '/' ? path.join(ROOT, 'index.html')
               : path.join(ROOT, req.url.split('?')[0]);
      if (!path.extname(fp)) {
        const withHtml = fp + '.html';
        if (fs.existsSync(withHtml)) fp = withHtml;
        else if (fs.existsSync(fp) && fs.statSync(fp).isDirectory()) {
          const idx = path.join(fp, 'index.html');
          if (fs.existsSync(idx)) fp = idx;
        }
      }
      try {
        if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) throw new Error();
        res.writeHead(200, { 'Content-Type': mime[path.extname(fp)] || 'application/octet-stream' });
        res.end(fs.readFileSync(fp));
      } catch {
        res.writeHead(404);
        res.end('Not found');
      }
    });
    srv.listen(PORT, () => resolve(srv));
  });
}

function collectHtmlFiles(dir) {
  const result = [];
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(ROOT, full).replace(/\\/g, '/');
      if (entry.isDirectory()) {
        if (['node_modules', '.git', '.vscode', 'scratch', 'pagefind', '.github'].includes(entry.name)) continue;
        result.push(...collectHtmlFiles(full));
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        result.push(rel);
      }
    }
  } catch {}
  return result;
}

function extractInternalLinks(html) {
  const links = [];
  const hrefRegex = /<a[^>]+href\s*=\s*"([^"]*)"/gi;
  let m;
  while ((m = hrefRegex.exec(html)) !== null) {
    let href = m[1];
    if (!href.startsWith('/')) continue;
    href = href.split('#')[0].replace(/\/$/, '');
    if (!href || href.startsWith('http')) continue;
    const resolved = path.posix.resolve('/', href).slice(1);
    if (resolved) links.push(resolved);
  }
  return [...new Set(links)];
}

function isCalculator(relPath) {
  return relPath.startsWith('calculadoras/') && relPath !== 'calculadoras/index.html';
}

const converterPages = new Set([
  'calculadoras/conversor-unidades.html',
  'calculadoras/kmh-ms.html',
  'calculadoras/temperatura.html',
]);

async function fillInputs(page) {
  const inputs = await page.$$('input[type="number"], input:not([type])');
  for (const input of inputs) {
    try {
      const val = await input.inputValue();
      if (!val || val === '0') await input.fill('100');
    } catch {}
  }
  const selects = await page.$$('select');
  for (const sel of selects) {
    try {
      const opts = await sel.$$('option:not([value=""]):not([disabled])');
      if (opts.length > 0) await opts[0].click();
    } catch {}
  }
}

const resultSelectors = [
  '.result-area', '.resultado-area', '.result-container', '.result-box',
  '#resultado', '#resultado-area',
];

async function testCalculatorPage(page) {
  const buttonSelectors = ['.btn-calc', '.btn-primary', '.btn-calcular'];
  for (const sel of buttonSelectors) {
    const btn = await page.$(sel);
    if (btn) {
      await fillInputs(page);
      await btn.click();
      // Try each result selector
      for (const rsel of resultSelectors) {
        try {
          await page.waitForSelector(rsel, { state: 'visible', timeout: 2000 });
          return 'ok';
        } catch {
          try {
            const hasResult = await page.waitForFunction((sel) => {
              const el = document.querySelector(sel);
              return el && el.innerHTML.trim().length > 20;
            }, rsel, { timeout: 1000 });
            if (hasResult) return 'ok';
          } catch {}
        }
      }
      return 'no-result';
    }
  }
  return 'no-button';
}

const results = { pages: {}, brokenLinks: [], jsErrors: [], calcErrors: [] };
let hasFailure = false;

function report(...lines) {
  fs.appendFileSync(REPORT, lines.join('\n') + '\n');
}

async function runTest(relPath, browser) {
  const url = `http://localhost:${PORT}/${relPath}`;
  const page = await browser.newPage();
  const errors = [];
  let calcResult = null;

  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto(url, { waitUntil: 'load', timeout: 15000 }).catch(() => {});

  const realErrors = errors.filter(e =>
    !e.includes('ERR_BLOCKED_BY_CLIENT') && !e.includes('Failed to load') &&
    !e.includes('ERR_CONNECTION_REFUSED') && !e.includes('ERR_NAME_NOT_RESOLVED') &&
    !e.includes('404') && !e.includes('ERR_ABORTED')
  );
  if (realErrors.length > 0) {
    results.pages[relPath] = 'erro-js';
    hasFailure = true;
    for (const e of realErrors) results.jsErrors.push({ page: relPath, error: e });
  }

  if (isCalculator(relPath)) {
    if (converterPages.has(relPath)) {
      calcResult = 'converter';
    } else {
      calcResult = await testCalculatorPage(page);
      if (calcResult === 'no-button') {
        if (!results.pages[relPath]) results.pages[relPath] = 'calc-no-button';
      } else if (calcResult !== 'ok') {
        results.calcErrors.push({ page: relPath, result: calcResult });
        if (!results.pages[relPath]) results.pages[relPath] = 'calc-fail';
        hasFailure = true;
      }
    }
  }

  const html = await page.content();
  const internalLinks = extractInternalLinks(html);
  for (const link of internalLinks) {
    const linkFile = path.join(ROOT, link + (path.extname(link) ? '' : '.html'));
    if (!fs.existsSync(linkFile)) {
      const dirIndex = path.join(ROOT, link, 'index.html');
      if (!fs.existsSync(dirIndex)) {
        results.brokenLinks.push({ page: relPath, link: `/${link}` });
        hasFailure = true;
      }
    }
  }

  const finalStatus = results.pages[relPath] || 'ok';
  const icon = finalStatus === 'ok' ? '✅' : (calcResult === 'converter' ? '⚡' : '❌');
  report(`### ${icon} ${relPath}`);
  if (finalStatus === 'ok') report('- OK');
  if (finalStatus !== 'ok') report(`- **Status:** ${finalStatus}`);
  if (realErrors.length > 0) {
    report('- **Erros de JS:**');
    for (const e of realErrors) report(`  - \`${e}\``);
  }
  if (calcResult) {
    const label = calcResult === 'ok' ? '✅ funcionou'
      : calcResult === 'converter' ? '⚡ conversor automático'
      : `❌ ${calcResult}`;
    report(`- **Calculadora:** ${label}`);
  }
  const pageBroken = results.brokenLinks.filter(b => b.page === relPath);
  if (pageBroken.length > 0) {
    report(`- **Links quebrados (${pageBroken.length}):**`);
    for (const b of pageBroken) report(`  - \`${b.link}\``);
  }
  report('');

  await page.close();
}

async function run() {
  console.log('Iniciando servidor local...');
  const server = await startServer();
  console.log(`Servidor rodando em http://localhost:${PORT}`);

  const allHtml = collectHtmlFiles(ROOT);
  console.log(`Encontrados ${allHtml.length} arquivos HTML`);

  fs.writeFileSync(REPORT, '# Relatório de Validação Local\n\n');
  report(`**Data:** ${new Date().toISOString()}`);
  report(`**Total de páginas:** ${allHtml.length}\n`);
  report('## Resultados por Página\n');

  const browser = await chromium.launch({ headless: true });

  try {
    const batchSize = 5;
    for (let i = 0; i < allHtml.length; i += batchSize) {
      const batch = allHtml.slice(i, i + batchSize);
      await Promise.allSettled(batch.map(relPath => runTest(relPath, browser)));
      console.log(`Progresso: ${Math.min(i + batchSize, allHtml.length)}/${allHtml.length}`);
    }
  } finally {
    await browser.close();
    server.close();
  }

  report('---\n');
  report('## Resumo\n');
  const erroCount = Object.keys(results.pages).length;
  const okPages = allHtml.length - erroCount;
  report(`- ✅ Páginas OK: ${okPages}/${allHtml.length}`);
  report(`- ❌ Páginas com erro: ${erroCount}`);
  report(`- 🔗 Links internos quebrados: ${results.brokenLinks.length}`);
  report(`- 🐛 Erros de JavaScript: ${results.jsErrors.length}`);
  report(`- 🧮 Problemas em calculadoras: ${results.calcErrors.length}`);

  if (results.brokenLinks.length > 0) {
    report('\n### Links Internos Quebrados\n');
    report('| Página | Link |');
    report('|--------|------|');
    for (const b of results.brokenLinks) report(`| ${b.page} | \`${b.link}\` |`);
  }

  if (results.jsErrors.length > 0) {
    report('\n### Erros de JavaScript\n');
    report('| Página | Erro |');
    report('|--------|------|');
    for (const e of results.jsErrors) report(`| ${e.page} | \`${e.error}\` |`);
  }

  if (results.calcErrors.length > 0) {
    report('\n### Problemas em Calculadoras\n');
    report('| Página | Resultado |');
    report('|--------|-----------|');
    for (const c of results.calcErrors) report(`| ${c.page} | ${c.result} |`);
  }

  console.log(`\nRelatório salvo em: ${REPORT}`);
  console.log(`Resultado: ${hasFailure ? '❌ FALHA' : '✅ SUCESSO'}`);
  process.exit(hasFailure ? 1 : 0);
}

run().catch((err) => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
