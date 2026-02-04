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

function toggleMobileDropdown(element) {
    if (window.innerWidth <= 768) {
        const menu = element.nextElementSibling;
        menu.classList.toggle('mobile-open');
    }
}

// --- FUNÇÕES DA TINTA ---

function adicionarParede() {
    const lista = document.getElementById("lista-paredes");
    const novaLinha = document.createElement("div");
    novaLinha.className = "list-row";
    novaLinha.innerHTML = `
                <input type="text" placeholder="Nome (Opcional)" class="input-nome">
                <input type="number" step="0.01" placeholder="Largura (m)" class="input-largura">
                <input type="number" step="0.01" placeholder="Altura (m)" class="input-altura">
                <button class="btn-remove" onclick="removerLinha(this)" title="Remover">✖</button>
            `;
    lista.appendChild(novaLinha);
}

function adicionarAbertura() {
    const lista = document.getElementById("lista-aberturas");
    const novaLinha = document.createElement("div");
    novaLinha.className = "list-row";
    novaLinha.innerHTML = `
                <input type="text" placeholder="Ex: Janela Sala" class="input-nome">
                <input type="number" step="0.01" placeholder="Largura (m)" class="input-largura">
                <input type="number" step="0.01" placeholder="Altura (m)" class="input-altura">
                <button class="btn-remove" onclick="removerLinha(this)" title="Remover">✖</button>
            `;
    lista.appendChild(novaLinha);
}

function removerLinha(btn) {
    btn.parentElement.remove();
}

function calcularTinta() {
    const rendimento = parseFloat(document.getElementById("rendimento").value);
    const maos = parseInt(document.getElementById("maos").value);

    const larguras = document.querySelectorAll("#lista-paredes .input-largura");
    const alturas = document.querySelectorAll("#lista-paredes .input-altura");

    const aberturasLarg = document.querySelectorAll("#lista-aberturas .input-largura");
    const aberturasAlt = document.querySelectorAll("#lista-aberturas .input-altura");

    const resultadoArea = document.getElementById("resultado-area");

    // 1. Calcular Área Total das Paredes
    let areaParedes = 0;
    for (let i = 0; i < larguras.length; i++) {
        const l = parseFloat(larguras[i].value);
        const a = parseFloat(alturas[i].value);
        if (!isNaN(l) && !isNaN(a) && l > 0 && a > 0) {
            areaParedes += (l * a);
        }
    }

    // 2. Calcular Área Total das Aberturas
    let areaAberturas = 0;
    for (let i = 0; i < aberturasLarg.length; i++) {
        const l = parseFloat(aberturasLarg[i].value);
        const a = parseFloat(aberturasAlt[i].value);
        if (!isNaN(l) && !isNaN(a) && l > 0 && a > 0) {
            areaAberturas += (l * a);
        }
    }

    if (areaParedes <= 0) {
        alert("Por favor, preencha pelo menos as dimensões de uma parede.");
        return;
    }

    // 3. Área Líquida e Aplicação
    const areaLiquida = Math.max(0, areaParedes - areaAberturas);
    const areaTotalPintar = areaLiquida * maos;

    // 4. Litros Necessários (Com 10% de desperdício)
    const litros = (areaTotalPintar / rendimento) * 1.10;

    // 5. Calcular Latas (Algoritmo Otimizado: Maximiza 18L, depois 3.6L, depois 0.9L)
    let latas18 = 0;
    let latas36 = 0;
    let latas09 = 0;

    let resto = litros;

    // Tenta 18L
    latas18 = Math.floor(resto / 18);
    resto = resto % 18;

    // Tenta 3.6L
    latas36 = Math.floor(resto / 3.6);
    resto = resto % 3.6;

    // O resto vai em galões de 0.9L (Arredonda pra cima sempre)
    latas09 = Math.ceil(resto / 0.9);

    // Exibir Resultados
    resultadoArea.style.display = "block";

    document.getElementById("valor-litros").textContent = litros.toFixed(1).replace(".", ",") + " Litros";

    document.getElementById("lata-18").textContent = latas18 + "x";
    document.getElementById("lata-36").textContent = latas36 + "x";
    document.getElementById("lata-09").textContent = latas09 + "x";

    // Scroll
    if (window.innerWidth < 600) {
        resultadoArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}