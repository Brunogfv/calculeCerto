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

// --- FUNÇÕES DO CIMENTO ---

let tipoAtual = 'contrapiso';

function alternarTipo() {
    const radios = document.getElementsByName('obra');
    for (let r of radios) {
        if (r.checked) tipoAtual = r.value;
    }

    const labelAltura = document.getElementById("label-altura");
    const inputAltura = document.getElementById("altura");
    const cardBrita = document.getElementById("card-brita");

    if (tipoAtual === 'contrapiso') {
        labelAltura.textContent = "Altura (cm)";
        inputAltura.placeholder = "Ex: 3"; // Altura padrão de contrapiso 3cm
        cardBrita.style.display = "none"; // Esconde brita
        document.getElementById("info-tipo").innerHTML = "Calculado para <strong>Contrapiso</strong> (Apenas Cimento e Areia).";
    } else {
        labelAltura.textContent = "Altura (m)";
        inputAltura.placeholder = "Ex: 2.5"; // Altura padrão pilar
        cardBrita.style.display = "block"; // Mostra brita
        document.getElementById("info-tipo").innerHTML = "Calculado para <strong>Concreto</strong> (Traço 1:2:4).";
    }
}

function calcularCimento() {
    const comp = parseFloat(document.getElementById("comprimento").value);
    const larg = parseFloat(document.getElementById("largura").value);
    const alt = parseFloat(document.getElementById("altura").value);
    const resultadoArea = document.getElementById("resultado-area");

    if (isNaN(comp) || isNaN(larg) || isNaN(alt) || comp <= 0 || larg <= 0 || alt <= 0) {
        alert("Por favor, preencha comprimento, largura e altura.");
        return;
    }

    let volumeM3 = 0;

    if (tipoAtual === 'contrapiso') {
        // Contrapiso: Altura em cm. Converter para m
        volumeM3 = comp * larg * (alt / 100);
    } else {
        // Concreto: Altura em m
        volumeM3 = comp * larg * alt;
    }

    // Adicionar 10% de margem de segurança
    const volumeTotal = volumeM3 * 1.10;

    let sacos = 0;
    let areia = 0;
    let brita = 0;

    if (tipoAtual === 'contrapiso') {
        // Estimativa Diário de Obra 1:3:6 (aprox 5 sacos por m³ ou 6 para traço 1:4)
        // Usaremos 6 sacos para garantir firmeza ou 5.5 para médio.
        sacos = Math.ceil(volumeTotal * 5.5);
        // Areia geralmente 1 m³ por m³ de contrapiso (secas)
        areia = volumeTotal;
        brita = 0; // Não usa brita
    } else {
        // Concreto Estrutural (1:2:4) ~ 7 sacos por m³
        sacos = Math.ceil(volumeTotal * 7);
        // Areia ~ 0.5 m³ por m³
        areia = volumeTotal * 0.5;
        // Brita ~ 0.9 m³ por m³
        brita = volumeTotal * 0.9;
    }

    // Exibir
    resultadoArea.style.display = "block";
    document.getElementById("res-cimento").textContent = sacos + "x";
    document.getElementById("res-areia").textContent = areia.toFixed(2);
    document.getElementById("res-brita").textContent = brita.toFixed(2);

    // Scroll
    if (window.innerWidth < 600) {
        resultadoArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}