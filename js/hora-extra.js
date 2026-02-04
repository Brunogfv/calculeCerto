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

// --- Lógica do Select de Horas ---
document.getElementById("horas-mes").addEventListener("change", function () {
    const customDiv = document.getElementById("group-custom-horas");
    if (this.value === 'custom') {
        customDiv.style.display = 'block';
        document.getElementById("custom-horas").setAttribute('required', 'required');
    } else {
        customDiv.style.display = 'none';
        document.getElementById("custom-horas").removeAttribute('required');
    }
});

// --- FUNÇÕES DA HORA EXTRA ---

const formatadorBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function calcularHoraExtra() {
    const salario = parseFloat(document.getElementById("salario").value);
    const selectHoras = document.getElementById("horas-mes").value;
    const horasCustom = parseFloat(document.getElementById("custom-horas").value);
    const horasExtra = parseFloat(document.getElementById("horas-extra").value);
    const percentual = parseFloat(document.getElementById("percentual").value);
    const resultadoArea = document.getElementById("resultado-area");

    // Determinar horas mensais
    let horasMensal = 0;
    if (selectHoras === 'custom') {
        if (isNaN(horasCustom) || horasCustom <= 0) {
            alert("Preencha o valor de horas mensais.");
            return;
        }
        horasMensal = horasCustom;
    } else {
        horasMensal = parseFloat(selectHoras);
    }

    // Validações
    if (isNaN(salario) || salario <= 0 || isNaN(horasExtra) || horasExtra < 0) {
        alert("Por favor, preencha o salário e as horas extra corretamente.");
        return;
    }

    // Cálculo da Hora Normal: (Salário * 12) / 52 / Horas Mensais
    // Essa fórmula é padrão para CLT para encontrar o valor da hora base
    const valorHoraNormal = ((salario * 12) / 52) / horasMensal;

    // Cálculo da Hora Extra
    const valorHoraExtra = valorHoraNormal * (1 + (percentual / 100));

    // Total a receber
    const totalExtra = valorHoraExtra * horasExtra;

    // Exibir
    resultadoArea.style.display = "block";

    document.getElementById("valor-hora-normal").textContent = formatadorBRL.format(valorHoraNormal);
    document.getElementById("valor-hora-extra").textContent = formatadorBRL.format(valorHoraExtra);
    document.getElementById("valor-extra").textContent = formatadorBRL.format(totalExtra);

    // Scroll suave
    if (window.innerWidth < 600) {
        resultadoArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}