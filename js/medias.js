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

// --- FUNÇÕES DA MÉDIA ---

function adicionarNota() {
    const lista = document.getElementById("lista-notas");
    const novaLinha = document.createElement("div");
    novaLinha.className = "nota-row";

    // Gerar HTML da linha
    novaLinha.innerHTML = `
                <input type="text" placeholder="Nome (Opcional)" class="input-nome">
                <input type="number" step="0.1" max="10" placeholder="Nota" class="input-nota">
                <input type="number" step="1" placeholder="Peso" class="input-peso" value="1">
                <button class="btn-remove" onclick="removerNota(this)" title="Remover linha">✖</button>
            `;

    lista.appendChild(novaLinha);
}

function removerNota(btn) {
    const linha = btn.parentElement;
    // Verifica se é a primeira linha (tem um div invisível ao invés de botão)
    // Se não tiver botão de remover, é a primeira, então não remove (ou remove se for a segunda em diante)
    if (linha.querySelector('.btn-remove')) {
        linha.remove();
    }
}

function calcularMedia() {
    const notasElements = document.querySelectorAll(".input-nota");
    const pesosElements = document.querySelectorAll(".input-peso");
    const notaCorte = parseFloat(document.getElementById("nota-corte").value);
    const resultadoArea = document.getElementById("resultado-area");

    let somaNotas = 0;
    let somaPesos = 0;
    let preenchidos = 0;

    // Limpar classes de erro
    document.querySelectorAll(".input-nota").forEach(el => el.style.borderColor = "");

    for (let i = 0; i < notasElements.length; i++) {
        const nota = parseFloat(notasElements[i].value);
        let peso = parseFloat(pesosElements[i].value);

        // Validação
        if (!isNaN(nota)) {
            if (nota < 0 || nota > 10) {
                alert("As notas devem estar entre 0 e 10.");
                notasElements[i].style.borderColor = "var(--cor-danger)";
                return;
            }

            // Se peso vazio, assume 1
            if (isNaN(peso)) peso = 1;
            if (peso <= 0) peso = 1; // Evita peso 0

            somaNotas += (nota * peso);
            somaPesos += peso;
            preenchidos++;
        }
    }

    if (preenchidos === 0) {
        alert("Preencha pelo menos uma nota.");
        return;
    }

    const mediaFinal = somaNotas / somaPesos;

    // Exibir Resultado
    resultadoArea.style.display = "block";
    const mediaEl = document.getElementById("valor-media");
    const statusEl = document.getElementById("status-badge");

    mediaEl.textContent = mediaFinal.toFixed(1).replace(".", ",");

    // Status
    if (mediaFinal >= notaCorte) {
        statusEl.textContent = "APROVADO ✅";
        statusEl.className = "status-badge status-aprovado";
        mediaEl.className = "media-value aprovado";
    } else {
        statusEl.textContent = "REPROVADO ❌";
        statusEl.className = "status-badge status-reprovado";
        mediaEl.className = "media-value reprovado";
    }

    // Scroll
    if (window.innerWidth < 600) {
        resultadoArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}