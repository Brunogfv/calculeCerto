const fs = require('fs');
const os = require('os');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { collectHtmlFiles, isExcludedPath } = require('../../scripts/test-local.js');

const ROOT = path.resolve(__dirname, '../..');

test('test-local exclui validation-b1 e preserva paginas canonicas', () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'pca-test-local-scope-'));
  try {
    const files = [
      'index.html',
      'calculadoras/exemplo.html',
      'paginas/sobre.html',
      'validation-b1/public/index.html',
      'validation-b1/public/validacao-encerrada.html'
    ];
    for (const relative of files) {
      const absolute = path.join(base, relative);
      fs.mkdirSync(path.dirname(absolute), { recursive: true });
      fs.writeFileSync(absolute, '<!doctype html><html><body>ok</body></html>');
    }

    const collected = collectHtmlFiles(base, base).sort();

    expect(collected).toContain('index.html');
    expect(collected).toContain('calculadoras/exemplo.html');
    expect(collected).toContain('paginas/sobre.html');
    expect(collected.some((item) => item.startsWith('validation-b1/'))).toBe(false);
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
});

test('exclusao de validation-b1 funciona com / e \\', () => {
  expect(isExcludedPath('validation-b1/public/index.html')).toBe(true);
  expect(isExcludedPath('validation-b1\\public\\index.html')).toBe(true);
  expect(isExcludedPath('paginas/validation-b1.html')).toBe(false);
  expect(isExcludedPath('calculadoras/validation-b1-demo.html')).toBe(false);
});

test('conjunto canonico real tem 162 paginas e nao contem validation-b1', () => {
  const collected = collectHtmlFiles(ROOT);
  expect(collected).toHaveLength(162);
  expect(collected.some((item) => item.startsWith('validation-b1/'))).toBe(false);
});
