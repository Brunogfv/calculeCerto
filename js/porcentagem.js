// function calcularPorcentagem () {
//     const tipo = document.getElementById("tipo").value;
//     const percentual = parseFloat(document.getElementById("percentual").value);
//     const valor = parseFloat(document.getElementById("valor").value);
//     const resultado = document.getElementById("resultado");

//     resultado.style.display = "block";
//     resultado.className = "";

//     if (isNaN(percentual) || isNaN(valor)) {
//         resultado.textContent = "Preencha os dois campos corretamente."
//         resultado.classList.add("resultado-baixo");
//         return;
//     }

//     let calculo = 0;
//     let texto = "";

//     if (tipo === "parte") {
//         calculo = (percentual / 100) * valor;
//         texto = `${percentual}% de ${valor} é`;
//     }

//     if (tipo === "aumento") {
//         calculo = valor + (percentual / 100) * valor;
//         texto = `${valor} com aumento de ${percentual}% é `;
//     }

//     if (tipo === "desconto") {
//         calculo = valor - (percentual / 100) * valor;
//         texto = `${valor} com desconto de ${percentual}% é `;
//     }

//     resultado.classList.add("resultado-normal");
//     resultado.innerHTML = `
//         ${texto}<br>
//         <strong>${calculo.toFixed(2)}</strong>
//     `;
// }

// function atualizarTextoBotao () {
//         const tipo = document.getElementById("tipo").value;
//         const botao = document.getElementById("btnCalcular");

//         if (tipo === "parte") botao.textContent = "Calcular porcentagem";
//         if (tipo === "aumento") botao.textContent = "Calcular aumento";
//         if (tipo === "desconto") botao.textContent = "Calcular desconto";
//     }

// function limparCampos () {
//         document.getElementById("percentual").value = "";
//         document.getElementById("valor").value = "";

//         const resultado = document.getElementById("resultado");
//         resultado.style.display ="none";
//         resultado.textContent = "";
//     }

// --- TEMA & MENU ---
function alternarTema() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    const currentTheme = body.getAttribute('data-theme');

    if (currentTheme === 'light') {
        body.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    } else {
        body.setAttribute('data-theme', 'light');
        themeIcon.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    }
}

if (localStorage.getItem('theme')) {
    document.body.setAttribute('data-theme', localStorage.getItem('theme'));
    document.getElementById('theme-icon').textContent = localStorage.getItem('theme') === 'light' ? '🌙' : '☀️';
}

function toggleMenu() {
    document.getElementById('nav-menu').classList.toggle('active');
    document.querySelector('.overlay').classList.toggle('active');
}

// --- FUNÇÕES DE PORCENTAGEM ---

function atualizarTextoBotao() {
    const tipo = document.getElementById("tipo").value;
    const botao = document.getElementById("btnCalcular");

    if (tipo === "parte") botao.textContent = "Calcular Porcentagem";
    if (tipo === "aumento") botao.textContent = "Calcular Aumento";
    if (tipo === "desconto") botao.textContent = "Calcular Desconto";
}

function calcularPorcentagem() {
    const tipo = document.getElementById("tipo").value;
    const percentual = parseFloat(document.getElementById("percentual").value);
    const valor = parseFloat(document.getElementById("valor").value);

    const resultArea = document.getElementById("resultado-area");
    const resultValue = document.getElementById("result-value");
    const resultDesc = document.getElementById("result-desc-text");
    const stepsText = document.getElementById("steps-text");

    resultArea.style.display = "none";

    if (isNaN(percentual) || isNaN(valor)) {
        alert("Por favor, preencha a porcentagem e o valor corretamente.");
        return;
    }

    let resultado = 0;
    let textoDesc = "";
    let textoPassos = "";

    // Formatadores
    const fmtVal = (v) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    if (tipo === "parte") {
        resultado = (percentual / 100) * valor;
        textoDesc = `${percentual}% de ${fmtVal(valor)} é:`;
        textoPassos = `
                    <strong>Cálculo:</strong><br>
                    (Valor × %) / 100<br>
                    (${fmtVal(valor)} × ${percentual}) / 100<br>
                    = <strong>${fmtVal(resultado)}</strong>
                `;
    } else if (tipo === "aumento") {
        resultado = valor + (percentual / 100) * valor;
        textoDesc = `${fmtVal(valor)} com aumento de ${percentual}% fica:`;
        textoPassos = `
                    <strong>Cálculo:</strong><br>
                    Valor × (1 + %/100)<br>
                    ${fmtVal(valor)} × (1 + ${percentual}/100)<br>
                    = <strong>${fmtVal(resultado)}</strong>
                `;
    } else if (tipo === "desconto") {
        resultado = valor - (percentual / 100) * valor;
        textoDesc = `${fmtVal(valor)} com desconto de ${percentual}% fica:`;
        textoPassos = `
                    <strong>Cálculo:</strong><br>
                    Valor × (1 - %/100)<br>
                    ${fmtVal(valor)} × (1 - ${percentual}/100)<br>
                    = <strong>${fmtVal(resultado)}</strong>
                `;
    }

    // Exibir resultados
    resultArea.style.display = "block";
    resultValue.textContent = fmtVal(resultado);
    resultDesc.textContent = textoDesc;
    stepsText.innerHTML = textoPassos;

    // --- SALVAR NO HISTÓRICO (Sistema Local) ---
    if (typeof window.salvarCalculo === 'function') {
        const calculoNome = tipo === 'parte' ? 'Porcentagem' : (tipo === 'aumento' ? 'Aumento %' : 'Desconto %');
        window.salvarCalculo(
            `Calculadora de ${calculoNome}`,
            `Valor: ${fmtVal(valor)} | %: ${percentual}%`,
            `Resultado: ${fmtVal(resultado)}`
        );
    }
}

function limparCampos() {
    document.getElementById("percentual").value = "";
    document.getElementById("valor").value = "";
    document.getElementById("resultado-area").style.display = "none";
}