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

// --- FUNÇÕES DA TMB ---

function calcularTMB() {
    const sexo = document.querySelector('input[name="sexo"]:checked').value;
    const idade = window.converterParaNumero(document.getElementById("idade").value);
    const peso = window.converterParaNumero(document.getElementById("peso").value);
    const altura = window.converterParaNumero(document.getElementById("altura").value);
    const fatorAtividade = window.converterParaNumero(document.getElementById("atividade").value);

    const resultadoArea = document.getElementById("resultado-area");

    // Validação
    if (isNaN(idade) || isNaN(peso) || isNaN(altura) || idade <= 0 || peso <= 0 || altura <= 0) {
        alert("Por favor, preencha idade, peso e altura corretamente.");
        return;
    }

    // Fórmula de Mifflin-St Jeor
    let tmb = 0;
    if (sexo === "masculino") {
        tmb = (10 * peso) + (6.25 * altura) - (5 * idade) + 5;
    } else {
        tmb = (10 * peso) + (6.25 * altura) - (5 * idade) - 161;
    }

    // TDEE (Gasto Total)
    const tdee = tmb * fatorAtividade;

    // Metas
    const caloriasPerder = tdee - 500;
    const caloriasManter = tdee;
    const caloriasGanhar = tdee + 500;

    // Atualizar UI
    resultadoArea.style.display = "block";

    // TMB
    document.getElementById("valor-tmb").textContent = Math.round(tmb) + " kcal";

    // Metas
    document.getElementById("cal-perder").textContent = Math.round(caloriasPerder) + " kcal";
    document.getElementById("cal-manter").textContent = Math.round(caloriasManter) + " kcal";
    document.getElementById("cal-ganhar").textContent = Math.round(caloriasGanhar) + " kcal";

    // Scroll suave
    if (window.innerWidth < 600) {
        resultadoArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // --- SALVAR NO HISTÓRICO (Sistema Local) ---
    if (typeof window.salvarCalculo === 'function') {
        window.salvarCalculo(
            'Calculadora de TMB',
            `Idade: ${idade} | Peso: ${peso}kg | Atividade: ${fatorAtividade}`,
            `TMB: ${Math.round(tmb)} kcal | Manter: ${Math.round(caloriasManter)} kcal`
        );
    }
}