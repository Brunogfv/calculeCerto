const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const PORT = 3680;
const ROOT = path.resolve(__dirname, '..');

function startServer() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      let fp = req.url === '/' ? path.join(ROOT, 'index.html') : path.join(ROOT, req.url.split('?')[0]);
      if (!path.extname(fp)) {
        const withHtml = fp + '.html';
        if (fs.existsSync(withHtml)) fp = withHtml;
      }
      try {
        if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) throw 404;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(fs.readFileSync(fp));
      } catch { res.writeHead(404); res.end(''); }
    });
    srv.listen(PORT, () => resolve(srv));
  });
}

const suspectPages = [
  'calculadoras/aluguel-vs-compra.html',
  'calculadoras/amortizacao.html',
  'calculadoras/decimo-terceiro.html',
  'calculadoras/pet-idade.html',
  'calculadoras/pj-vs-clt.html',
];

async function test() {
  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  for (const page of suspectPages) {
    const start = Date.now();
    try {
      const ctx = await browser.newContext();
      const p = await ctx.newPage();
      await p.goto(`http://localhost:${PORT}/${page}`, { waitUntil: 'load', timeout: 15000 });
      // fill inputs
      const inputs = await p.$$('input[type="number"], input:not([type])');
      for (const i of inputs) {
        const v = await i.inputValue();
        if (!v || v === '0') try { await i.fill('100'); } catch {}
      }
      const selects = await p.$$('select');
      for (const s of selects) {
        const opts = await s.$$('option:not([value=""]):not([disabled])');
        if (opts.length > 0) try { await opts[0].click(); } catch {}
      }
      const btn = await p.$('.btn-calc');
      if (btn) {
        await btn.click();
        try { await p.waitForSelector('.result-area', { timeout: 3000 }); console.log(`${page}: OK`); }
        catch { console.log(`${page}: no result (${Date.now()-start}ms)`); }
      } else {
        console.log(`${page}: no button`);
      }
      await ctx.close();
    } catch (e) {
      console.log(`${page}: ERROR ${e.message}`);
    }
    console.log(`  time: ${Date.now()-start}ms`);
  }
  await browser.close();
  server.close();
}
test();
