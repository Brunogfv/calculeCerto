/**
 * Tabelas fiscais 2026 - Portal das Contas
 *
 * Fontes:
 * - INSS: Portaria Interministerial MPS/MF nº 13, de 09/01/2026.
 * - IRPF: Lei nº 15.191/2025 (tabela progressiva) e Lei nº 15.270/2025 (redutor).
 *
 * Este arquivo não depende do DOM e pode ser usado por qualquer calculadora.
 */
(function (global) {
    'use strict';

    const TABELA_INSS_2026 = [
        { teto: 1621.00, aliquota: 0.075 },
        { teto: 2902.84, aliquota: 0.09 },
        { teto: 4354.27, aliquota: 0.12 },
        { teto: 8475.55, aliquota: 0.14 }
    ];

    const TABELA_IR_2026 = [
        { teto: 2428.80, aliquota: 0, deducao: 0 },
        { teto: 2826.65, aliquota: 0.075, deducao: 182.16 },
        { teto: 3751.05, aliquota: 0.15, deducao: 394.16 },
        { teto: 4664.68, aliquota: 0.225, deducao: 675.49 },
        { teto: Infinity, aliquota: 0.275, deducao: 908.73 }
    ];

    const DEDUCAO_DEPENDENTE_2026 = 189.59;
    const DESCONTO_SIMPLIFICADO_MENSAL_2026 = 607.20;
    const REDUTOR_MAXIMO_2026 = 312.89;

    function paraNumero(valor) {
        if (typeof valor === 'number') return isFinite(valor) ? valor : 0;
        const texto = String(valor == null ? '' : valor).trim();
        if (!texto) return 0;
        if (texto.includes(',')) {
            return parseFloat(texto.replace(/\./g, '').replace(',', '.')) || 0;
        }
        return parseFloat(texto) || 0;
    }

    // Arredonda para centavos evitando ruído de ponto flutuante (ex.: 1569.54524...).
    function arredondarCentavos(valor) {
        const centavos = Number((valor * 100).toFixed(6));
        return Math.round(centavos) / 100;
    }

    function calcularINSS2026(salarioBruto) {
        const salario = Math.max(0, paraNumero(salarioBruto));
        const teto = TABELA_INSS_2026[TABELA_INSS_2026.length - 1].teto;
        const base = Math.min(salario, teto);

        let inss = 0;
        let pisoAnterior = 0;

        for (const faixa of TABELA_INSS_2026) {
            const trecho = Math.max(0, Math.min(base, faixa.teto) - pisoAnterior);
            inss += trecho * faixa.aliquota;
            pisoAnterior = faixa.teto;
        }

        return arredondarCentavos(inss);
    }

    function calcularImpostoTabela2026(baseCalculo) {
        const base = Math.max(0, paraNumero(baseCalculo));
        const faixa = TABELA_IR_2026.find(function (item) {
            return base <= item.teto;
        }) || TABELA_IR_2026[TABELA_IR_2026.length - 1];

        return {
            aliquota: faixa.aliquota,
            deducao: faixa.deducao,
            impostoBruto: arredondarCentavos(Math.max(0, (base * faixa.aliquota) - faixa.deducao))
        };
    }

    function calcularRedutorIR2026(rendimentoBruto, impostoBruto) {
        const renda = Math.max(0, paraNumero(rendimentoBruto));
        const imposto = Math.max(0, paraNumero(impostoBruto));

        let reducao = 0;
        if (renda <= 5000) {
            reducao = Math.min(imposto, REDUTOR_MAXIMO_2026);
        } else if (renda <= 7350) {
            reducao = Math.max(0, 978.62 - (0.133145 * renda));
        }

        return arredondarCentavos(Math.min(imposto, reducao));
    }

    /**
     * IRRF mensal 2026.
     * @param {number|string} rendimentoBruto renda tributável do mês.
     * @param {number|string} deducoesLegais soma de INSS, dependentes e outras deduções.
     * @param {{usarDescontoSimplificado?: boolean}} [opcoes]
     */
    function calcularIRRF2026(rendimentoBruto, deducoesLegais, opcoes) {
        const renda = Math.max(0, paraNumero(rendimentoBruto));
        const deducoes = Math.max(0, paraNumero(deducoesLegais));
        const config = opcoes || {};

        const baseLegal = Math.max(0, renda - deducoes);
        const baseSimplificada = Math.max(0, renda - DESCONTO_SIMPLIFICADO_MENSAL_2026);
        const usarSimplificado = config.usarDescontoSimplificado !== false;
        const baseCalculo = usarSimplificado
            ? Math.min(baseLegal, baseSimplificada)
            : baseLegal;

        const tabela = calcularImpostoTabela2026(baseCalculo);
        const reducao = calcularRedutorIR2026(renda, tabela.impostoBruto);
        const imposto = arredondarCentavos(Math.max(0, tabela.impostoBruto - reducao));

        return {
            rendimentoBruto: renda,
            deducoes: deducoes,
            baseLegal: baseLegal,
            baseSimplificada: baseSimplificada,
            baseCalculo: baseCalculo,
            aliquota: tabela.aliquota,
            deducao: tabela.deducao,
            impostoBruto: tabela.impostoBruto,
            reducao: reducao,
            imposto: imposto
        };
    }

    global.TabelasFiscais2026 = {
        INSS: TABELA_INSS_2026,
        IR: TABELA_IR_2026,
        DEDUCAO_DEPENDENTE: DEDUCAO_DEPENDENTE_2026,
        DESCONTO_SIMPLIFICADO_MENSAL: DESCONTO_SIMPLIFICADO_MENSAL_2026,
        REDUTOR_MAXIMO: REDUTOR_MAXIMO_2026,
        paraNumero: paraNumero,
        calcularINSS2026: calcularINSS2026,
        calcularIRRF2026: calcularIRRF2026
    };

    global.calcularINSS2026 = calcularINSS2026;
    global.calcularIRRF2026 = calcularIRRF2026;
})(typeof window !== 'undefined' ? window : globalThis);
