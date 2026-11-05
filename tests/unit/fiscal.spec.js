const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { test, expect } = require('@playwright/test');

const ROOT = path.resolve(__dirname, '../..');

function carregarFiscal() {
    const code = fs.readFileSync(path.join(ROOT, 'js/fiscal-2026.js'), 'utf8');
    const context = { window: {}, globalThis: {} };
    vm.createContext(context);
    vm.runInContext(code, context);
    return context.window;
}

test.describe('Tabelas fiscais 2026', () => {
    test('INSS progressivo', () => {
        const { calcularINSS2026 } = carregarFiscal();
        expect(calcularINSS2026(1621.00)).toBeCloseTo(121.58, 2);
        expect(calcularINSS2026(3000.00)).toBeCloseTo(248.60, 2);
        expect(calcularINSS2026(5000.00)).toBeCloseTo(501.51, 2);
        expect(calcularINSS2026(8475.55)).toBeCloseTo(988.09, 2);
        expect(calcularINSS2026(10000.00)).toBeCloseTo(988.09, 2);
    });

    test('IRRF com redutor da Lei 15.270/2025', () => {
        const { calcularIRRF2026 } = carregarFiscal();

        const exemplo1 = calcularIRRF2026(3036.00, 257.73);
        expect(exemplo1.baseCalculo).toBeCloseTo(2428.80, 2);
        expect(exemplo1.imposto).toBeCloseTo(0.00, 2);

        const exemplo2 = calcularIRRF2026(4000.00, 373.41);
        expect(exemplo2.baseCalculo).toBeCloseTo(3392.80, 2);
        expect(exemplo2.impostoBruto).toBeCloseTo(114.76, 2);
        expect(exemplo2.imposto).toBeCloseTo(0.00, 2);

        const exemplo3 = calcularIRRF2026(5000.00, 509.60);
        expect(exemplo3.baseCalculo).toBeCloseTo(4392.80, 2);
        expect(exemplo3.impostoBruto).toBeCloseTo(312.89, 2);
        expect(exemplo3.imposto).toBeCloseTo(0.00, 2);

        const acima = calcularIRRF2026(6000.00, 641.51);
        expect(acima.imposto).toBeCloseTo(385.10, 2);
    });

    test('13º salário com INSS progressivo e IRRF', () => {
        const { calcularINSS2026, calcularIRRF2026 } = carregarFiscal();
        const bruto = 5000;
        const inss = calcularINSS2026(bruto);
        const irrf = calcularIRRF2026(bruto, inss).imposto;
        expect(inss).toBeCloseTo(501.51, 2);
        expect(irrf).toBeCloseTo(0.00, 2);
        expect(bruto - inss - irrf).toBeCloseTo(4498.49, 2);
    });
});
