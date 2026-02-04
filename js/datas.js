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

function toggleMobileDropdown(element) {
    if (window.innerWidth <= 768) {
        const menu = element.nextElementSibling;
        menu.classList.toggle('mobile-open');
    }
}

// --- FUNÇÕES DE DATAS ---

function calcularDiferenca() {
    const inicioVal = document.getElementById("data-inicio").value;
    const fimVal = document.getElementById("data-fim").value;
    const resultadoArea = document.getElementById("resultado-area");

    if (!inicioVal || !fimVal) {
        alert("Por favor, selecione as duas datas.");
        return;
    }

    const d1 = new Date(inicioVal);
    const d2 = new Date(fimVal);

    // Zerar horário para calcular apenas dias
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Cálculo aproximado de Anos e Meses (apenas informativo)
    let anos = Math.floor(diffDays / 365);
    let diasRestantes = diffDays % 365;
    let meses = Math.floor(diasRestantes / 30);

    // Exibir
    resultadoArea.style.display = "block";
    document.getElementById("valor-dias").textContent = diffDays;

    let textoBreakdown = `${diffDays} Dias`;
    if (diffDays >= 365) {
        textoBreakdown = `${anos} Anos, ${meses} Meses`;
    }

    document.getElementById("valor-anos").textContent = textoBreakdown;
    document.getElementById("valor-meses").textContent = ""; // Limpa meses se não for longo prazo

    // Scroll
    if (window.innerWidth < 600) {
        resultadoArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}