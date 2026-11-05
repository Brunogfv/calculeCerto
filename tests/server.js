const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = process.env.SITE_ROOT
    ? path.resolve(process.env.SITE_ROOT)
    : path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 8765);

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.pagefind': 'application/wasm',
    '.pf_meta': 'application/octet-stream',
    '.pf_index': 'application/octet-stream',
    '.pf_fragment': 'application/octet-stream'
};

function parseHeaders() {
    const file = path.join(ROOT, '_headers');
    if (!fs.existsSync(file)) return [];

    const rules = [];
    let current = null;

    for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
        if (!line.trim() || line.trim().startsWith('#')) continue;

        if (!/^\s/.test(line)) {
            current = { pattern: line.trim(), headers: {} };
            rules.push(current);
        } else if (current) {
            const m = line.match(/^\s+([A-Za-z0-9-]+):\s*(.+)$/);
            if (m) current.headers[m[1]] = m[2];
        }
    }

    return rules;
}

const HEADER_RULES = parseHeaders();

function matches(pattern, pathname) {
    const regex = new RegExp('^' + pattern
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*') + '$');
    return regex.test(pathname);
}

function headersFor(pathname) {
    const headers = {};
    for (const rule of HEADER_RULES) {
        if (matches(rule.pattern, pathname)) Object.assign(headers, rule.headers);
    }
    return headers;
}

function resolverArquivo(pathname) {
    let clean = decodeURIComponent(pathname.split('?')[0]);
    if (clean === '/') clean = '/index.html';
    else if (clean.endsWith('/')) clean += 'index.html';

    let full = path.join(ROOT, clean);

    if (path.extname(full) === '' && !fs.existsSync(full)) {
        if (fs.existsSync(full + '.html')) return full + '.html';
        if (fs.existsSync(full) && fs.statSync(full).isDirectory()) {
            const index = path.join(full, 'index.html');
            if (fs.existsSync(index)) return index;
        }
    }

    if (!fs.existsSync(full) && fs.existsSync(full + '.html')) return full + '.html';
    return full;
}

const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(req.url.split('?')[0]);
    const file = resolverArquivo(pathname);

    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('Not found');
        return;
    }

    for (const [name, value] of Object.entries(headersFor(pathname))) {
        res.setHeader(name, value);
    }

    const ext = path.extname(file).toLowerCase();
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');

    if (req.method === 'HEAD') {
        res.end();
        return;
    }

    fs.createReadStream(file).pipe(res);
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`Test server: http://127.0.0.1:${PORT}`);
});
