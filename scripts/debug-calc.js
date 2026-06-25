const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const PORT = 3681;
const ROOT = path.resolve(__dirname, '..');

const server = http.createServer((req, res) => {
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
server.listen(PORT, async () => {
  console.log(`Server on :${PORT}`);
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(`http://localhost:${PORT}/calculadoras/imc.html`, { waitUntil: 'load', timeout: 15000 });
  console.log('Loaded!');
  const btn = await page.$('.btn-calc');
  console.log('Button found:', !!btn);
  if (btn) {
    await btn.click();
    console.log('Clicked!');
    const result = await page.waitForSelector('.result-area', { state: 'visible', timeout: 5000 });
    console.log('Result found:', !!result);
    const text = await page.evaluate(() => document.querySelector('.result-area')?.innerText?.slice(0, 100));
    console.log('Result text:', text);
  }
  await browser.close();
  server.close();
});
