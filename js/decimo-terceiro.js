// function normalizarNumero (valor) {
//     return parseFloat(valor.replace(",", "."));
// }

// function calcularDecimoTerceiro () {
//     const salario = normalizarNumero(document.getElementById("salario").value);
//     const meses = parseInt(document.getElementById("meses").value);

//     const resultado = document.getElementById("resultado-juros");
//     resultado.className = "";

//     if (isNaN(salario) || salario <= 0 || isNaN(meses) || meses < 1 || meses > 12) {
//         resultado.textContent = "Preencha os dados corretamente.";
//         return;
//     }

//     const decimoBruto = (salario / 12) * meses;
//     const primeiraParcela = decimoBruto / 2;

//     let inss = decimoBruto * 0.08;
//     const segundaParcela = decimoBruto - primeiraParcela - inss;

//     resultado.innerHTML = `
//         <strong> Resultado 13º salário:</strong><br><br>
//         Valor Bruto: <strong>R$ ${decimoBruto.toFixed(2)}</strong><br>
//         1ª parcela: R$ ${primeiraParcela.toFixed(2)}</strong><br>
//         Desconto INSS (estimado): R$ ${inss.toFixed(2)}<br>
//         2ª parcela: <strong> R$ ${segundaParcela.toFixed(2)}</strong>
//     `;
// }


// function limparCampos () {
//     document.getElementById("salario").value = "";
//     document.getElementById("meses").value = "";
//     document.getElementById("resultado-juros").innerHTML = "";
// }

// Carregar tema salvo
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

// Normaliza número (de "1.250,00" para 1250.00 float)
function normalizarNumero(valorTexto) {
    if (!valorTexto) return 0;
    return parseFloat(valorTexto.replace(/\./g, "").replace(",", "."));
}

// Formatador de saída BRL
const formatadorBRL = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
});

function calcularDecimoTerceiro() {
    const salarioInput = document.getElementById("salario").value;
    const mesesInput = document.getElementById("meses").value;
    const resultBox = document.getElementById("resultado-juros");

    // Elementos de saída
    const elLiquido = document.getElementById("valor-liquido");
    const elBruto = document.getElementById("valor-bruto");
    const elInss = document.getElementById("valor-inss");
    const elP1 = document.getElementById("valor-parcela1");
    const elP2 = document.getElementById("valor-parcela2");

    const salario = normalizarNumero(salarioInput);
    const meses = parseInt(mesesInput);

    // Validação
    if (isNaN(salario) || salario <= 0 || isNaN(meses)) {
        // Pequena animação de erro (opcional, apenas mostra)
        alert("Por favor, preencha o salário corretamente.");
        return;
    }

    // Cálculos (Mantendo sua lógica original de 8% INSS)
    const decimoBruto = (salario / 12) * meses;
    const primeiraParcela = decimoBruto / 2;

    // Estimativa simples de INSS (8% sobre o total do 13º)
    // Nota: O INSS real é progressivo, mas mantendo simplificado conforme seu código original
    const inss = decimoBruto * 0.08;

    const segundaParcela = decimoBruto - primeiraParcela - inss;
    const totalLiquido = decimoBruto - inss;

    // Exibir Resultados
    resultBox.style.display = "block";

    // Atualiza o HTML com valores formatados
    elBruto.textContent = formatadorBRL.format(decimoBruto);
    elInss.textContent = "- " + formatadorBRL.format(inss);
    elP1.textContent = formatadorBRL.format(primeiraParcela);
    elP2.textContent = formatadorBRL.format(segundaParcela);
    elLiquido.textContent = formatadorBRL.format(totalLiquido);
}

function limparCampos() {
    document.getElementById("salario").value = "";
    document.getElementById("meses").value = "12";
    document.getElementById("resultado-juros").style.display = "none";
}