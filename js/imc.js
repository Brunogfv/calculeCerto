// function normalizarNumero (valor) {
//     return parseFloat(valor.replace(",", "."));
// }

// function calcularIMC() {
//     const peso = normalizarNumero(document.getElementById("peso").value);
//     const altura = normalizarNumero(document.getElementById("altura").value);
//     const resultado = document.getElementById("resultado");

//     resultado.style.display = "block";
//     resultado.className = ""; // Limpar classes antigas

//     if (isNaN(peso) || isNaN(altura) || peso <= 0 || altura <= 0) {
//         resultado.textContent = "Preencha corretamente os campos. Exemplo: 70,5 e 1,75";
//         resultado.classList.add("resultado-baixo");
//         return;
//     }

//     const imc = peso / (altura * altura);
//     let classificacao = "";
//     let classe = "";

//     if (imc < 18.5) {
//         classificacao = "Abaixo do peso";
//         classe = "resultado-baixo";
//     }else if (imc < 25) {
//         classificacao = "Peso normal";
//         classe = "resultado-normal";
//     }else if (imc < 30) {
//         classificacao = "Sobrepeso";
//         classe = "resultado-sobrepeso";
//     }else {
//         classificacao = "Obesidade";
//         classe = "resultado-obesidade";
//     }

//     resultado.classList.add(classe);
//     resultado.innerHTML = `
//         Seu IMC é <strong>${imc.toFixed(2)}</strong><br>
//         <small>${classificacao}</small>
//     `;
// }


// --- TEMA & MENU (Padrão) ---
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

// --- LÓGICA DO IMC ---
function normalizarNumero(valor) {
    // Remove pontos de milhar e troca vírgula por ponto
    if (!valor) return 0;
    return parseFloat(valor.replace(/\./g, "").replace(",", "."));
}

function calcularIMC() {
    const peso = normalizarNumero(document.getElementById("peso").value);
    const altura = normalizarNumero(document.getElementById("altura").value);
    const resultContainer = document.getElementById("resultado-container");
    const resultCard = document.getElementById("resultado-card");
    const valorEl = document.getElementById("imc-valor");
    const textoEl = document.getElementById("imc-texto");
    const barEl = document.getElementById("imc-bar");

    // Reset classes
    resultCard.classList.remove("azul", "verde", "amarelo", "vermelho");

    if (isNaN(peso) || isNaN(altura) || peso <= 0 || altura <= 0) {
        alert("Por favor, preencha o peso e a altura corretamente.\nExemplo: 70,5 e 1,75");
        return;
    }

    const imc = peso / (altura * altura);
    const imcFormatado = imc.toFixed(1);

    let classificacao = "";
    let classeCor = "";
    let corBarra = "";
    let porcentagemBarra = 0;

    // Lógica de Classificação e Cores
    if (imc < 18.5) {
        classificacao = "Abaixo do peso";
        classeCor = "azul";
        corBarra = "var(--imc-azul)";
        // Barra (aprox 0% a 45%)
        porcentagemBarra = (imc / 18.5) * 45;
    } else if (imc < 25) {
        classificacao = "Peso normal";
        classeCor = "verde";
        corBarra = "var(--imc-verde)";
        // Barra (45% a 62%)
        porcentagemBarra = 45 + ((imc - 18.5) / (25 - 18.5)) * 17;
    } else if (imc < 30) {
        classificacao = "Sobrepeso";
        classeCor = "amarelo";
        corBarra = "var(--imc-amarelo)";
        // Barra (62% a 75%)
        porcentagemBarra = 62 + ((imc - 25) / (30 - 25)) * 13;
    } else if (imc < 40) {
        classificacao = "Obesidade";
        classeCor = "vermelho";
        corBarra = "var(--imc-vermelho)";
        // Barra (75% a 100%)
        porcentagemBarra = 75 + ((imc - 30) / (40 - 30)) * 25;
    } else {
        classificacao = "Obesidade Grave";
        classeCor = "vermelho";
        corBarra = "var(--imc-vermelho)";
        porcentagemBarra = 100;
    }

    // Limitar barra a 100%
    if (porcentagemBarra > 100) porcentagemBarra = 100;

    // Atualizar UI
    resultContainer.style.display = "block";
    resultCard.classList.add(classeCor);
    valorEl.textContent = imcFormatado.replace(".", ",");
    textoEl.textContent = classificacao;

    // Animar barra
    barEl.style.width = "0%";
    setTimeout(() => {
        barEl.style.width = porcentagemBarra + "%";
        barEl.style.backgroundColor = corBarra;
    }, 100);

    // Scroll suave até o resultado em telas pequenas
    if (window.innerWidth < 600) {
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}