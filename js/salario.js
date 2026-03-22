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

// --- FUNÇÕES DO SALÁRIO ---

const formatadorBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function calcularSalario() {
    const salario = parseFloat(document.getElementById("salario").value);
    const horasSemana = parseFloat(document.getElementById("horas").value);
    const temDecimo = document.getElementById("decimo").checked;

    const resultadoArea = document.getElementById("resultado-area");

    // Validação
    if (isNaN(salario) || salario <= 0) {
        alert("Por favor, preencha o salário mensal corretamente.");
        return;
    }

    // Cálculos
    // Hora: (Salário Mensal * 12) / 52 / Horas Semanais
    const salarioAnualBase = salario * 12;
    const salarioSemanal = salarioAnualBase / 52;
    const salarioHora = salarioSemanal / horasSemana;

    // Quinzena
    const salarioQuinzena = salario / 2;

    // Anual (com 13º e 1/3 férias)
    // Simplificado: 12 Salários + 1/13º + 1/3 do salário (representando as férias)
    let adicionalFerias = salario / 3;
    let salarioAnualTotal = salarioAnualBase + (temDecimo ? salario : 0) + adicionalFerias;

    // Atualizar UI
    resultadoArea.style.display = "block";

    document.getElementById("valor-hora").textContent = formatadorBRL.format(salarioHora);
    document.getElementById("valor-semana").textContent = formatadorBRL.format(salarioSemanal);
    document.getElementById("valor-quinzena").textContent = formatadorBRL.format(salarioQuinzena);
    document.getElementById("valor-ano").textContent = formatadorBRL.format(salarioAnualTotal);

    // Scroll suave
    if (window.innerWidth < 600) {
        resultadoArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // --- SALVAR NO HISTÓRICO ---
    if (typeof window.salvarCalculo === 'function') {
        window.salvarCalculo(
            'Conversor de Salário',
            `Salário: ${formatadorBRL.format(salario)} | ${horasSemana}h semanais`,
            `Valor Hora: ${document.getElementById("valor-hora").textContent} | Anual: ${document.getElementById("valor-ano").textContent}`
        );
    }
}