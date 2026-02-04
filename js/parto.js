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

// --- FUNÇÕES DO PARTO ---

function calcularParto() {
    const dateInput = document.getElementById("data-menstruacao").value;
    const cycleLength = parseInt(document.getElementById("ciclo").value);
    const resultadoArea = document.getElementById("resultado-area");

    if (!dateInput) {
        alert("Por favor, selecione a data da última menstruação.");
        return;
    }

    // Lógica:
    // Padrão médico: 280 dias (40 semanas) desde a LMP.
    // Ajuste do ciclo: Se ciclo for 28, ovula dia 14. Se ciclo 30, ovula dia 16.
    // Logo, o nascimento é "dias extras" depois do padrão.
    const baseDays = 280;
    const extraDays = cycleLength - 28;
    const totalDays = baseDays + extraDays;

    const lmp = new Date(dateInput);
    const dueDate = new Date(lmp.getTime() + (totalDays * 24 * 60 * 60 * 1000));

    // Calcular semana atual
    const today = new Date();
    const diffTime = today - lmp;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    let currentWeek = Math.floor(diffDays / 7);

    // Validação (Se a data for no futuro, semana 0)
    if (currentWeek < 0) currentWeek = 0;
    if (currentWeek > 42) currentWeek = 42; // Cap para visualização

    // Formatar data
    const day = String(dueDate.getDate()).padStart(2, '0');
    const month = String(dueDate.getMonth() + 1).padStart(2, '0');
    const year = dueDate.getFullYear();
    const dateString = `${day}/${month}/${year}`;

    // Determinar Trimestre Atual
    let trimestreInfo = "";
    let triCard1 = document.getElementsByClassName("tri-card")[0];
    let triCard2 = document.getElementsByClassName("tri-card")[1];
    let triCard3 = document.getElementsByClassName("tri-card")[2];

    // Reset classes
    triCard1.classList.remove("active");
    triCard2.classList.remove("active");
    triCard3.classList.remove("active");

    if (currentWeek <= 13) {
        triCard1.classList.add("active");
        trimestreInfo = "1º Trimestre";
    } else if (currentWeek <= 27) {
        triCard2.classList.add("active");
        trimestreInfo = "2º Trimestre";
    } else {
        triCard3.classList.add("active");
        trimestreInfo = "3º Trimestre";
    }

    // Progress Bar
    const progress = (currentWeek / 40) * 100;
    document.getElementById("progress-bar").style.width = progress + "%";

    // Exibir
    resultadoArea.style.display = "block";
    document.getElementById("data-parto").textContent = dateString;
    document.getElementById("semana-atual").textContent = currentWeek;

    // Scroll
    if (window.innerWidth < 600) {
        resultadoArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}