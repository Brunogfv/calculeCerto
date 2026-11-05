function alternarTema() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    const currentTheme = body.getAttribute('data-theme');

    if (currentTheme === 'light') {
        body.setAttribute('data-theme', 'dark');
        if (themeIcon) themeIcon.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    } else {
        body.setAttribute('data-theme', 'light');
        if (themeIcon) themeIcon.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    }
}

if (localStorage.getItem('theme')) {
    document.body.setAttribute('data-theme', localStorage.getItem('theme'));
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.textContent = localStorage.getItem('theme') === 'light' ? '🌙' : '☀️';
    }
}

function toggleMenu() {
    document.getElementById('nav-menu').classList.toggle('active');
    document.querySelector('.overlay').classList.toggle('active');
}

// --- FUNÇÕES DE JUROS ---

let graficoJuros = null;

function normalizarNumero(valorTexto) {
    if (!valorTexto) return 0;
    return parseFloat(valorTexto.replace(/\./g, "").replace(",", "."));
}

function formatarMoeda(input) {
    let valor = input.value.replace(/\D/g, "");
    if (valor === "") return;

    // Converte para número e formata com separadores de milhar e decimal
    // Se o valor for muito pequeno (menos de 3 dígitos), formata como centavos
    // Se for maior, mantém a lógica de máscara financeira padrão
    valor = (valor / 100).toFixed(2);
    input.value = valor.replace(".", ",").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
}

const formatadorBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function calcularJuros() {
    const capital = window.converterParaNumero(document.getElementById("capital").value);
    const taxa = window.converterParaNumero(document.getElementById("taxa").value);
    const tempo = window.converterParaNumero(document.getElementById("tempo").value);
    const tipo = document.getElementById("tipo").value;

    const resultadoArea = document.getElementById("resultado-juros");

    if (isNaN(capital) || capital <= 0 || isNaN(taxa) || isNaN(tempo) || tempo <= 0) {
        alert("Por favor, preencha todos os campos corretamente.");
        return;
    }

    const taxaDecimal = taxa / 100;
    let montante = 0;
    let jurosTotais = 0;

    // Cálculo Matemático
    if (tipo === "simples") {
        jurosTotais = capital * taxaDecimal * tempo;
        montante = capital + jurosTotais;
    } else {
        montante = capital * Math.pow(1 + taxaDecimal, tempo);
        jurosTotais = montante - capital;
    }

    // Atualizar DOM Resultados
    resultadoArea.style.display = "block";
    document.getElementById("valor-final").textContent = formatadorBRL.format(montante);
    document.getElementById("capital-inicial").textContent = formatadorBRL.format(capital);
    document.getElementById("total-juros").textContent = "+" + formatadorBRL.format(jurosTotais);
    document.getElementById("resumo-tempo").textContent = tempo + " meses";

    // Taxa Efetiva (Quanto % o dinheiro rendeu em relação ao inicial)
    const rentabilidade = ((montante - capital) / capital) * 100;
    document.getElementById("taxa-efetiva").textContent = rentabilidade.toFixed(2) + "%";

    // Gerar Gráfico
    gerarGrafico(capital, taxaDecimal, tempo, tipo);

    // Gerar Comparador
    calcularComparador(capital, tempo);

    // Salvar no Histórico (Sistema Local)
    const valoresSalvar = `Cap: ${formatadorBRL.format(capital)} | Tax: ${taxa}% (${tipo === 'simples' ? 'Sim' : 'Com'}) | Tmp: ${tempo} m`;
    const resultadoSalvar = `Final: ${formatadorBRL.format(montante)}`;

    if (typeof window.salvarCalculo === 'function') {
        window.salvarCalculo('Calculadora de Juros', valoresSalvar, resultadoSalvar);
    }

    // Scroll suave
    if (window.innerWidth < 600) {
        resultadoArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function gerarGrafico(capital, taxa, tempo, tipo) {
    const ctx = document.getElementById("graficoJuros").getContext("2d");

    if (graficoJuros) {
        graficoJuros.destroy();
    }

    // Preparar dados
    const labels = [];
    const valores = [];
    const jurosAcumulados = [];

    for (let i = 1; i <= tempo; i++) {
        labels.push(`Mês ${i}`);
        let m = 0;
        if (tipo === "simples") {
            m = capital + (capital * taxa * i);
        } else {
            m = capital * Math.pow(1 + taxa, i);
        }
        valores.push(m);
        jurosAcumulados.push(m - capital); // Para preencher área abaixo se quisesse
    }

    // Cores dinâmicas
    const corLinha = tipo === 'simples' ? '#2563eb' : '#16a34a'; // Azul para simples, Verde para composto

    graficoJuros = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Montante (R$)",
                data: valores,
                borderColor: corLinha,
                backgroundColor: tipo === 'composto' ? 'rgba(22, 163, 74, 0.1)' : 'rgba(37, 99, 235, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index',
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return ' Total: ' + formatadorBRL.format(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function (value) {
                            if (value >= 1000) return 'R$ ' + value / 1000 + 'k';
                            return 'R$ ' + value;
                        }
                    }
                }
            }
        }
    });
}

function calcularComparador(capital, tempo) {
    // Simula cenários de oportunidade de custo
    const cenarios = [
        { nome: "🛑 Dinheiro Parado", taxa: 0, cor: "#94a3b8" },
        { nome: "🐷 Poupança (Estimativa 0,5%)", taxa: 0.005, cor: "#f59e0b" },
        { nome: "🚀 Investimento Moderado (1%)", taxa: 0.01, cor: "#16a34a" }
    ];

    const div = document.getElementById("comparador");
    let html = `<h4 style="margin-top:0; color:#92400e; margin-bottom:15px;">Comparativo: Onde seu capital estaria em ${tempo} meses?</h4>`;

    let maior = 0;
    let menor = Infinity;
    const valores = [];

    cenarios.forEach(c => {
        const m = capital * Math.pow(1 + c.taxa, tempo);
        valores.push(m);
        if (m > maior) maior = m;
        if (m < menor) menor = m;
    });

    cenarios.forEach((c, index) => {
        html += `
                    <div class="comparador-item">
                        <span class="cenario-nome" style="color:${c.cor}">${c.nome}</span>
                        <span class="cenario-valor" style="color:${c.cor}">${formatadorBRL.format(valores[index])}</span>
                    </div>
                `;
    });

    const diferenca = maior - menor;
    html += `
                <div class="diff-alert">
                    Diferença entre o pior e o melhor cenário: <strong>${formatadorBRL.format(diferenca)}</strong>
                </div>
            `;

    div.innerHTML = html;
}

function limparCampos() {
    document.getElementById("capital").value = "";
    document.getElementById("taxa").value = "";
    document.getElementById("tempo").value = "";
    document.getElementById("resultado-juros").style.display = "none";

    if (graficoJuros) {
        graficoJuros.destroy();
        graficoJuros = null;
    }
}