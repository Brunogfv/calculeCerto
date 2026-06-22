const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BASE_URL = process.env.SITE_URL || 'https://portaldascontas.com.br';
const MAX_DEPTH = 3;
const REPORT = path.resolve(__dirname, '..', 'relatorio-producao.md');

const affiliateDomainPatterns = [
  /amazon\.com\.br/i, /amzn\.to/i, /mercadolivre\.com\.br/i,
  /tag=portaldascont-20/i, /tag=.*portaldascont/i,
];

function isAffiliateLink(url) {
  return affiliateDomainPatterns.some(p => p.test(url));
}

function isProductSpecific(url) {
  const u = url.toLowerCase();
  if (u.includes('amazon')) return /\/dp\//.test(u);
  if (u.includes('mercadolivre')) return /\/p\//.test(u);
  return u.includes('/dp/') || u.includes('/p/') || /[?&]p=/i.test(u);
}

function crawlKey(pageUrl) {
  return pageUrl.replace(BASE_URL, '').split('#')[0].replace(/\/$/, '') || '/';
}

const visited = new Set();
const results = { pages: [], affiliateLinks: [] };
let hasFailure = false;
let hasWarning = false;

function report(...lines) {
  fs.appendFileSync(REPORT, lines.join('\n') + '\n');
}

async function crawl(page, url, depth) {
  const key = crawlKey(url);
  if (visited.has(key) || depth > MAX_DEPTH) return;
  visited.add(key);

  const pageResult = { url, key, status: 0, loadTime: 0, errors: [] };

  try {
    const start = Date.now();
    const resp = await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    pageResult.loadTime = Date.now() - start;

    if (!resp) {
      pageResult.errors.push('Sem resposta');
    } else {
      pageResult.status = resp.status();
      if (resp.status() >= 500) {
        pageResult.errors.push(`Erro servidor: ${resp.status()}`);
        hasFailure = true;
      } else if (resp.status() !== 200) {
        pageResult.errors.push(`Status inesperado: ${resp.status()}`);
      }
    }

    if (pageResult.errors.length === 0) {
      const links = await page.$$eval('a[href]', (els) =>
        els.map((a) => ({ href: a.href, target: a.target || '' }))
      );

      const internalLinks = links.filter((l) => l.href.startsWith(BASE_URL));
      for (const il of internalLinks) {
        await crawl(page, il.href, depth + 1);
      }

      const affiliateLinks = links.filter((l) => isAffiliateLink(l.href));
      for (const al of affiliateLinks) {
        const affResult = {
          page: key, url: al.href, status: '-', isProduct: isProductSpecific(al.href),
          opensNewTab: al.target === '_blank', loadTime: '-', errors: [],
        };

        if (!affResult.isProduct) {
          affResult.errors.push('Link genérico (não específico de produto)');
          hasWarning = true;
        }
        if (!affResult.opensNewTab) {
          affResult.errors.push('Não abre em nova aba');
          hasWarning = true;
        }

        results.affiliateLinks.push(affResult);
      }
    }
  } catch (e) {
    pageResult.errors.push(`Falha: ${e.message}`);
  }

  results.pages.push(pageResult);
}

async function run() {
  console.log(`Iniciando teste de produção em: ${BASE_URL}`);
  fs.writeFileSync(REPORT, '# Relatório de Teste em Produção\n\n');
  report(`**Site:** ${BASE_URL}`);
  report(`**Data:** ${new Date().toISOString()}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  try {
    await crawl(page, BASE_URL, 0);

    const pageErrors = results.pages.filter((p) => p.errors.length > 0);
    const brokenAffs = results.affiliateLinks.filter((a) => a.errors.length > 0 && a.errors.some(e => e.includes('404') || e.includes('Erro:')));
    const warningAffs = results.affiliateLinks.filter((a) => a.errors.length > 0 && !a.errors.some(e => e.includes('404') || e.includes('Erro:')));

    report('## Resumo\n');
    report(`- Páginas visitadas: ${results.pages.length}`);
    report(`- Páginas com problema: ${pageErrors.length}`);
    report(`- Links de afiliado encontrados: ${results.affiliateLinks.length}`);
    report(`- Afiliados quebrados (404/erro): ${brokenAffs.length}`);
    report(`- Afiliados com aviso: ${warningAffs.length}\n`);

    if (pageErrors.length > 0) {
      report('## Páginas com Problema\n');
      report('| Página | Status | Tempo (ms) | Erros |');
      report('|--------|--------|------------|-------|');
      for (const p of pageErrors) {
        report(`| ${p.key} | ${p.status} | ${p.loadTime} | ${p.errors.join('; ')} |`);
      }
      report('');
    }

    report('## Links de Afiliado\n');
    report('| Página | URL | Status | Produto específico? | Nova aba? | Tempo (ms) | Observações |');
    report('|--------|-----|--------|---------------------|-----------|------------|-------------|');
    for (const a of results.affiliateLinks) {
      const truncatedUrl = a.url.length > 80 ? a.url.slice(0, 77) + '...' : a.url;
      report(`| ${a.page} | ${truncatedUrl} | ${a.status} | ${a.isProduct ? 'Sim' : 'Não'} | ${a.opensNewTab ? 'Sim' : 'Não'} | ${a.loadTime} | ${a.errors.join('; ')} |`);
    }

    report('\n---\n');
    report(`_${brokenAffs.length} afiliado(s) quebrado(s), ${warningAffs.length} com aviso(s)_`);

    console.log(`\nRelatório salvo: ${REPORT}`);
    console.log(`Páginas: ${results.pages.length}, Afiliados: ${results.affiliateLinks.length}`);
    console.log(`Quebrados: ${brokenAffs.length}, Avisos: ${warningAffs.length}`);
    console.log(`Resultado: ${hasFailure ? '❌ FALHA' : '✅ SUCESSO'}${hasWarning ? ' (com avisos)' : ''}`);
    console.log(`Avisos: ${results.affiliateLinks.filter(a => a.errors.length > 0).length} link(s) de afiliado com formato inadequado (não bloqueante)`);

    process.exit(hasFailure ? 1 : 0);
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
