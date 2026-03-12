// --- TEMA & MENU ---
// function alternarTema() {
//     const body = document.body;
//     const themeIcon = document.getElementById('theme-icon');
//     const currentTheme = body.getAttribute('data-theme');

//     if (currentTheme === 'light') {
//         body.setAttribute('data-theme', 'dark');
//         themeIcon.textContent = '☀️';
//         localStorage.setItem('theme', 'dark');
//     } else {
//         body.setAttribute('data-theme', 'light');
//         themeIcon.textContent = '🌙';
//         localStorage.setItem('theme', 'light');
//     }
// }

// if (localStorage.getItem('theme')) {
//     document.body.setAttribute('data-theme', localStorage.getItem('theme'));
//     document.getElementById('theme-icon').textContent = localStorage.getItem('theme') === 'light' ? '🌙' : '☀️';
// }

function toggleMenu() {
    document.getElementById('nav-menu').classList.toggle('active');
    document.querySelector('.overlay').classList.toggle('active');
}

// --- FUNÇÕES DA ÁGUA ---

function calcularAgua() {
    const peso = window.converterParaNumero(document.getElementById("peso").value);
    const atividade = window.converterParaNumero(document.getElementById("atividade").value);
    const clima = parseInt(document.getElementById("clima").value); // 0 ou 500ml

    const resultadoArea = document.getElementById("resultado-area");
    const visualCopos = document.getElementById("copos-visual");

    // Validação
    if (isNaN(peso) || peso <= 0) {
        alert("Por favor, informe seu peso corretamente.");
        return;
    }

    // Regra geral: 35ml por kg
    let baseMl = peso * 35;

    // Ajustes
    let atividadeBonus = (baseMl * (atividade - 1)); // 0, 20%, 40%, 60% a mais
    let climaBonus = clima;

    let totalMl = baseMl + atividadeBonus + climaBonus;
    let totalLitros = totalMl / 1000;

    // Quantos copos de 300ml?
    const copos = Math.round(totalMl / 300);

    // Atualizar DOM
    resultadoArea.style.display = "block";

    document.getElementById("valor-agua").textContent = totalLitros.toFixed(2) + " Litros";
    document.getElementById("valor-ml").textContent = Math.round(totalMl);
    document.getElementById("qtd-copos").textContent = copos;

    // Gerar Visual dos Copos (Limitado a 15 para não quebrar o layout)
    visualCopos.innerHTML = "";
    const maxDisplay = Math.min(copos, 15);

    for (let i = 0; i < maxDisplay; i++) {
        const icon = document.createElement("span");
        icon.textContent = "🥤";
        icon.className = "cup-icon active";
        visualCopos.appendChild(icon);
    }

    if (copos > 15) {
        const more = document.createElement("span");
        more.textContent = "+";
        more.style.alignSelf = "center";
        more.style.fontWeight = "bold";
        more.style.color = "var(--cor-primaria)";
        visualCopos.appendChild(more);
    }

    // Scroll suave
    if (window.innerWidth < 600) {
        resultadoArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}