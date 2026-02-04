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

// --- FUNÇÕES DE TEMPERATURA ---

function converterTemperatura() {
    const unidade = document.getElementById("unidade-entrada").value;
    const valor = parseFloat(document.getElementById("temp-entrada").value);

    let c, f, k = 0;

    if (isNaN(valor)) {
        document.getElementById("val-c").textContent = "-";
        document.getElementById("val-f").textContent = "-";
        document.getElementById("val-k").textContent = "-";
        return;
    }

    // Converter entrada para Celsius primeiro (ponto médio)
    if (unidade === 'C') {
        c = valor;
    } else if (unidade === 'F') {
        c = (valor - 32) * 5 / 9;
    } else if (unidade === 'K') {
        c = valor - 273.15;
    }

    // Calcular outras a partir de Celsius
    f = (c * 9 / 5) + 32;
    k = c + 273.15;

    // Exibir
    document.getElementById("val-c").textContent = c.toFixed(1).replace(".", ",") + "°C";
    document.getElementById("val-f").textContent = f.toFixed(1).replace(".", ",") + "°F";
    document.getElementById("val-k").textContent = k.toFixed(1).replace(".", ",") + "K";
}