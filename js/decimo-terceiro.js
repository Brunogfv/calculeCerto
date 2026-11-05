if (localStorage.getItem('theme')) {
    document.body.setAttribute('data-theme', localStorage.getItem('theme'));
    document.getElementById('theme-icon').textContent = localStorage.getItem('theme') === 'light' ? '🌙' : '☀️';
}

// --- MENU MOBILE ---
function toggleMenu() {
    const menu = document.getElementById('nav-menu');
    const overlay = document.querySelector('.overlay');
    menu.classList.toggle('active');
    overlay.classList.toggle('active');
}

// --- FUNÇÕES DA CALCULADORA ---

// Formata dinheiro enquanto digita (ex: 1.250,00)
function formatarMoeda(input) {
    let valor = input.value.replace(/\D/g, ""); // Remove não números
    valor = (valor / 100).toFixed(2) + ""; // Divide por 100 para ter centavos
    valor = valor.replace(".", ","); // Troca ponto por vírgula
    valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1."); // Adiciona pontos de milhar
    input.value = valor;
}

// Normaliza número aceitando tanto "1.250,00" quanto "1250.00"
// (o input de salário é type="number", então o valor já vem com ponto decimal)
function normalizarNumero(valorTexto) {
    if (valorTexto === null || valorTexto === undefined) return 0;
    if (typeof valorTexto === 'number') return isFinite(valorTexto) ? valorTexto : 0;

    const texto = String(valorTexto).trim();
    if (!texto) return 0;
    if (texto.includes(',')) {
        return parseFloat(texto.replace(/\./g, "").replace(",", ".")) || 0;
    }
    return parseFloat(texto) || 0;
}

// Formatador de saída BRL
const formatadorBRL = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
});

function calcularDecimoTerceiro() {
    const salarioInput = document.getElementById("salario-bruto").value;
    const mesesInput = document.getElementById("meses-trabalhados").value;
    const dependentesInput = document.getElementById("dependentes");
    const resultBox = document.getElementById("resultado-area");

    // Elementos de saída
    const elLiquido = document.getElementById("res-liquido");
    const elBruto = document.getElementById("res-bruto");
    const elInss = document.getElementById("res-inss");
    const elIrrf = document.getElementById("res-irrf");
    const elP1 = document.getElementById("res-parcela1");
    const elP2 = document.getElementById("res-parcela2");

    const salario = normalizarNumero(salarioInput);
    const meses = parseInt(mesesInput, 10);
    const dependentes = dependentesInput
        ? Math.max(0, parseInt(dependentesInput.value, 10) || 0)
        : 0;

    // Validação
    if (isNaN(salario) || salario <= 0) {
        alert("Por favor, preencha o salário corretamente.");
        return;
    }
    if (isNaN(meses) || meses < 1 || meses > 12) {
        alert("Informe de 1 a 12 meses trabalhados no ano.");
        return;
    }

    // Cálculos
    const decimoBruto = (salario / 12) * meses;
    const primeiraParcela = decimoBruto / 2;

    const deducaoDependente = (window.TabelasFiscais2026 && TabelasFiscais2026.DEDUCAO_DEPENDENTE) || 189.59;

    // INSS 2026: tabela progressiva aplicada sobre o 13º bruto
    const inss = typeof calcularINSS2026 === 'function'
        ? calcularINSS2026(decimoBruto)
        : decimoBruto * 0.08;

    // IRRF 2026: tabela progressiva + desconto simplificado + redutor da Lei 15.270/2025
    const irrf = typeof calcularIRRF2026 === 'function'
        ? calcularIRRF2026(decimoBruto, inss + (dependentes * deducaoDependente)).imposto
        : 0;

    const segundaParcela = decimoBruto - primeiraParcela - inss - irrf;
    const totalLiquido = decimoBruto - inss - irrf;

    // Exibir Resultados
    resultBox.style.display = "block";

    // Atualiza o HTML com valores formatados
    elBruto.textContent = formatadorBRL.format(decimoBruto);
    elInss.textContent = "- " + formatadorBRL.format(inss);
    if (elIrrf) elIrrf.textContent = "- " + formatadorBRL.format(irrf);
    elP1.textContent = formatadorBRL.format(primeiraParcela);
    elP2.textContent = formatadorBRL.format(segundaParcela);
    elLiquido.textContent = formatadorBRL.format(totalLiquido);

    // --- SALVAR NO HISTÓRICO (Sistema Local) ---
    if (typeof window.salvarCalculo === 'function') {
        window.salvarCalculo(
            'Calculadora de 13º Salário',
            `Salário: ${formatadorBRL.format(salario)} | Meses: ${meses}`,
            `Líquido: ${formatadorBRL.format(totalLiquido)} (P1: ${formatadorBRL.format(primeiraParcela)} | P2: ${formatadorBRL.format(segundaParcela)})`
        );
    }
}

function limparCampos() {
    const salario = document.getElementById("salario-bruto");
    const meses = document.getElementById("meses-trabalhados");
    const dependentes = document.getElementById("dependentes");
    const resultado = document.getElementById("resultado-area");

    if (salario) salario.value = "";
    if (meses) meses.value = "12";
    if (dependentes) dependentes.value = "";
    if (resultado) resultado.style.display = "none";
}