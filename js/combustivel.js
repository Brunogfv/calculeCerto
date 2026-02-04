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

// --- FUNÇÕES DE COMBUSTÍVEL ---

const formatadorBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function calcularCombustivel() {
    const km = parseFloat(document.getElementById("km").value);
    const litros = parseFloat(document.getElementById("litros").value);
    const preco = parseFloat(document.getElementById("preco").value);

    const resultadoArea = document.getElementById("resultado-area");

    // Validação
    if (isNaN(km) || isNaN(litros) || km <= 0 || litros <= 0) {
        alert("Por favor, preencha a distância e os litros corretamente.");
        return;
    }

    // Cálculo Base (Consumo)
    const kml = km / litros;

    // Cálculos Financeiros (Se preço informado)
    let custoKm = 0;
    let custoTotal = 0;

    if (!isNaN(preco) && preco > 0) {
        custoTotal = litros * preco;
        custoKm = custoTotal / km;
    }

    // Atualizar UI
    resultadoArea.style.display = "block";

    document.getElementById("valor-kml").textContent = kml.toFixed(1).replace(".", ",") + " Km/L";
    document.getElementById("custo-km").textContent = !isNaN(preco) ? formatadorBRL.format(custoKm) : "-";
    document.getElementById("custo-total").textContent = !isNaN(preco) ? formatadorBRL.format(custoTotal) : "-";

    // Scroll suave
    if (window.innerWidth < 600) {
        resultadoArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}