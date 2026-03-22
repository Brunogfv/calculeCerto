// function normalizarNumero(valor) {
//     return parseFloat(valor.replace(",", "."));
// }

// let graficoJuros = null;

// function calcularJuros() {
//     const capital = normalizarNumero(document.getElementById("capital").value);
//     const taxa = normalizarNumero(document.getElementById("taxa").value);
//     const tempo = parseFloat(document.getElementById("tempo").value);
//     const tipo = document.getElementById("tipo").value;

//     const resultado = document.getElementById("resultado-juros");
//     resultado.className = "";

//     if (
//         isNaN(capital) || capital <= 0 ||
//         isNaN(taxa) || taxa <= 0 ||
//         isNaN(tempo) || tempo <= 0
//     ) {
//         resultado.textContent = "Preencha todos os campos corretamente.";
//         return;
//     }

//     const taxaDecimal = taxa / 100;
//     let juros = 0;
//     let montante = 0;

//     if (tipo === "simples") {
//         juros = capital * (taxa / 100) * tempo;
//         montante = capital + juros;
//     }else{
//         montante = capital * Math.pow(1 + taxaDecimal, tempo);
//         juros = montante - capital;
//     }

//     // const juros = capital * (taxa / 100) * tempo;
//     // const montante = capital + juros;

//     resultado.innerHTML = `
//         <div class="resultado-card">
//             <h2>Resultado da Simulação</h2>

//             <div class="resultado-principal">
//                 <span>Montante Final</span>
//                 <strong id="valor-final">R$ ${montante.toFixed(2)}</strong>
//             </div>

//             <div class="resultado-detalhes">
//                 <p>💰 Capital inicial: <strong>R$ ${capital.toFixed(2)}</strong></p>
//                 <p>📈 Juros ganhos: <strong class="positivo">R$ ${juros.toFixed(2)}</strong></p>
//                 <p>⏱️ Tempo: <strong>${tempo} meses</strong></p>
//                 <p>📊 Tipo: <strong>${tipo === "simples" ? "Juros Simples" : "Juros Compostos"}</strong></p>
//             </div>

//             <small>
//                 ${tipo === "simples" ? "Nos juros simples, os juros não se acumulam." : "Nos juros compostos, os juros se acumulam mês a mês."}
//             </small>
//         </div>
//     `;

//     // Gráfico
//     const labels = [];
//     const valores = [];

//     for (let i = 1; i <= tempo; i++) {
//         labels.push(`Mês ${i}`);

//         if (tipo === "simples") {
//             valores.push(capital + (capital *taxaDecimal * i));
//         }else{
//             valores.push(capital * Math.pow(1 + taxaDecimal, i));
//         }
//     }

//     const ctx = document.getElementById("graficoJuros").getContext("2d");

//     // Destrói gráfico anterior
//     if (graficoJuros) {
//         graficoJuros.destroy();
//     }

//     graficoJuros = new Chart (ctx, {
//         type: "line",
//         data: {
//             labels: labels,
//             datasets: [{
//                 label: "Evolução do Montante (R$)",
//                 data: valores,
//                 borderWidth: 2,
//                 fill: false,
//                 tension: 0.3
//             }]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false
//         }
//     });

//     document.getElementById("grafico-container").style.display = "block";
//     calcularComparador(capital, tempo);
// }
// function limparCampos() {
//     document.getElementById("capital").value = "";
//     document.getElementById("taxa").value = "";
//     document.getElementById("tempo").value = "";
//     document.getElementById("resultado-juros").innerHTML = "";

//     if (graficoJuros) {
//         graficoJuros.destroy();
//         graficoJuros = null;
//     }
//     document.getElementById("grafico-container").style.display = "none";
// }

// function calcularComparador (capital, tempo) {
//     const cenarios = [
//         { nome: "Dinheiro parado", taxa: 0 },
//         { nome: "Poupança", taxa: 0.005 },
//         { nome: "Investimento", taxa: 0.01 }
//     ];

//     let html = `<h3>Comparação de Cenários (${tempo} meses)</h3>`;

//     let menor = Infinity;
//     let maior = 0;

//     cenarios.forEach(c => {
//         const montante = capital * Math.pow(1 + c.taxa, tempo);

//         menor = Math.min(menor, montante);
//         maior = Math.max(maior, montante);

//         html += `
//             <p>
//                 <strong>${c.nome}: </strong>
//                 R$ ${montante.toFixed(2)}
//             </p>
//         `;
//     });

//     html += `
//         <p style="margin-top: 10px; font-weight: bold;">
//             Diferença entre o pior e o melhor cenário:
//             R$ ${(maior - menor).toFixed(2)}
//         </p>
//     `;

//     document.getElementById("comparador").innerHTML = html;
// }

// --- TEMA & MENU ---
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