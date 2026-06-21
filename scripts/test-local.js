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

const BLOCKED_DOMAINS = [
  'google-analytics.com', 'googletagmanager.com', 'googlesyndication.com',
  'googleadservices.com', 'doubleclick.net', 'lomadee.com', 'amazon.com.br',
  'mercadolivre.com.br', 'amzn.to',
];

function startServer() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      let fp = req.url === '/' ? path.join(ROOT, 'index.html')
               : path.join(ROOT, req.url.split('?')[0]);
      if (!path.extname(fp)) {
        const withHtml = fp + '.html';
        if (fs.existsSync(withHtml)) {
          fp = withHtml;
        } else if (fs.existsSync(fp) && fs.statSync(fp).isDirectory()) {
          const idx = path.join(fp, 'index.html');
          if (fs.existsSync(idx)) fp = idx;
        }
      }
      try {
        if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) throw new Error('not found');
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

async function testCalculatorPage(page) {
  const buttonSelectors = ['.btn-calc', '.btn-primary'];
  for (const sel of buttonSelectors) {
    const btn = await page.$(sel);
    if (btn) {
      await btn.click();
      try {
        await page.waitForSelector('.result-area', { state: 'visible', timeout: 4000 });
        return 'ok';
      } catch {
        try {
          await page.waitForFunction(() => {
            const el = document.querySelector('.result-area');
            return el && el.innerHTML.trim().length > 20;
          }, { timeout: 2000 });
          return 'ok';
        } catch {}
        return 'no-result';
      }
    }
  }
  return 'no-button';
}

const results = { pages: {}, brokenLinks: [], jsErrors: [], calcErrors: [] };
let hasFailure = false;

function report(...lines) {
  fs.appendFileSync(REPORT, lines.join('\n') + '\n');
}

async function testPage(browser, relPath) {
  const url = `http://localhost:${PORT}/${relPath}`;
  const ctx = await browser.newContext({
    block: BLOCKED_DOMAINS.map(d => `**://*.${d}/*`),
  });
  const page = await ctx.newPage();
  const errors = [];
  let calcResult = null;

  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  try {
    await page.goto(url, { waitUntil: 'load', timeout: 20000 });
  } catch (e) {
    results.pages[relPath] = 'erro-carregamento';
    hasFailure = true;
    results.jsErrors.push({ page: relPath, error: `Falha ao carregar: ${e.message}` });
    await ctx.close();
    return;
  }

  if (errors.length > 0) {
    // Ignore CORS/fetch errors from blocked domains, only count real JS errors
    const realErrors = errors.filter(e =>
      !e.includes('net::ERR_BLOCKED_BY_CLIENT') &&
      !e.includes('Failed to load resource') &&
      !e.includes('ERR_CONNECTION_REFUSED') &&
      !e.includes('ERR_NAME_NOT_RESOLVED') &&
      !e.includes('404') &&
      !e.includes('ERR_ABORTED')
    );
    if (realErrors.length > 0) {
      results.pages[relPath] = 'erro-js';
      hasFailure = true;
      for (const e of realErrors) results.jsErrors.push({ page: relPath, error: e });
    }
  }

  if (isCalculator(relPath)) {
    calcResult = await testCalculatorPage(page);
    if (calcResult !== 'ok') {
      results.calcErrors.push({ page: relPath, result: calcResult });
      if (calcResult === 'no-button') {
        if (!results.pages[relPath]) results.pages[relPath] = 'calc-no-button';
      } else {
        hasFailure = true;
        results.pages[relPath] = 'calc-fail';
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

  const status = results.pages[relPath] || 'ok';
  const icon = status === 'ok' ? '✅' : '❌';
  report(`### ${icon} ${relPath}`);
  if (status === 'ok') report('- OK');
  if (status !== 'ok') report(`- **Status:** ${status}`);
  if (errors.length > 0) {
    const shown = errors.filter(e => !e.includes('ERR_BLOCKED_BY_CLIENT'));
    if (shown.length > 0) {
      report('- **Log de erros:**');
      for (const e of shown) report(`  - \`${e}\``);
    }
  }
  if (calcResult) {
    report(`- **Calculadora:** ${calcResult === 'ok' ? '✅ funcionou' : `❌ ${calcResult}`}`);
  }
  const pageBroken = results.brokenLinks.filter(b => b.page === relPath);
  if (pageBroken.length > 0) {
    report(`- **Links quebrados (${pageBroken.length}):**`);
    for (const b of pageBroken) report(`  - \`${b.link}\``);
  }
  report('');

  await ctx.close();
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
      await Promise.all(batch.map(relPath => testPage(browser, relPath)));
      console.log(`Progresso: ${Math.min(i + batchSize, allHtml.length)}/${allHtml.length}`);
    }
  } finally {
    await browser.close();
    server.close();
  }

  report('---\n');
  report('## Resumo\n');
  const erroCount = new Set(Object.keys(results.pages)).size;
  const okCount = allHtml.length - erroCount + Object.values(results.pages).filter(v => v === 'ok').length;
  report(`- ✅ Páginas OK: ${okCount}/${allHtml.length}`);
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
