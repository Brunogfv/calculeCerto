// function normalizarNumero(valor) {
//     return parseFloat(valor.replace(",", "."));
// }
// let graficoINSS = null;

// function calcularINSS() {
//     const salario = normalizarNumero(document.getElementById("salario").value);
//     const resultado = document.getElementById("resultado-juros");
//     resultado.innerHTML = "";

//     if (isNaN(salario) || salario <= 0) {
//         resultado.textContent = "Informe um salário válido."
//         return;
//     }

//     let inss = 0;
//     const teto = 8745.55;

//     const s1 = Math.min(salario, 1621.00);
//     const s2 = Math.min(salario, 2902.84);
//     const s3 = Math.min(salario, 4354.27);
//     const s4 = Math.min(salario, teto);

//     // Faixas INSS em 2026
//     if (salario > 0) {
//         inss += s1 * 0.075;
//     }

//     if (salario > 1621.00) {
//         inss += (s2 - 1612.00) * 0.09;
//     }

//     if (salario > 2902.84) {
//         inss += (s3 - 2902.84) * 0.12;
//     }

//     if (salario > 4354.27) {
//         inss += (s4 - 4354.27) * 0.14;
//     }


//     // depois de calcular as partes de cada faixa
//     const data = {
//         labels: ["Faixa 1", "Faixa 2", "Faixa 3", "Faixa 4"],
//         datasets: [{
//             label: "Contribuição por faixa (R$)",
//             data: [s1, s2, s3, s4],
//             backgroundColor: [
//                 "rgba(59, 130, 246, 0.6)",
//                 "rgba(16, 163, 74, 0.6)",
//                 "rgba(245, 158, 11, 0.6)",
//                 "rgba(239, 68, 68, 0.6)"
//             ]
//         }]
//     };

//     if (graficoINSS) {
//         graficoINSS.destroy();
//     }

//     document.querySelector(".grafico-container").style.display = "block";

//     const canvas = document.getElementById("graficoINSS");
//     canvas.style.display = "block";

//     graficoINSS = new Chart(canvas, {
//         type: "bar",
//         data: data,
//         options: {
//             responsive: true,
//             maintainAspectRatio: false
//         }
//     });



//     const salarioLiquido = salario - inss;

//     resultado.innerHTML = `
//         <strong>Resultado do Cálculo:</strong><br><br>
//         Salário bruto: R$${salario.toFixed(2)}<br>
//         Desconto INSS: <strong>R$ ${inss.toFixed(2)}</strong><br>
//         Salário líquido: <strong>R$ ${salarioLiquido.toFixed(2)}</strong>
//     `;
// }

// function limparCampos() {
//     document.getElementById("salario").value = "";
//     document.getElementById("resultado-juros").innerHTML = "";

//     const canvas = document.getElementById("graficoINSS");

//     if (graficoINSS) {
//         graficoINSS.destroy();
//         graficoINSS = null;
//     }

//     document.querySelector(".grafico-container").style.display = "none";
// }

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

// --- FUNÇÕES DO INSS ---

function normalizarNumero(valorTexto) {
    if (!valorTexto) return 0;
    return parseFloat(valorTexto.replace(/\./g, "").replace(",", "."));
}

// Formata dinheiro enquanto digita
function formatarMoeda(input) {
    let valor = input.value.replace(/\D/g, "");
    valor = (valor / 100).toFixed(2) + "";
    valor = valor.replace(".", ",");
    valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    input.value = valor;
}

const formatadorBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

let graficoINSS = null;

function calcularINSS() {
    const salario = normalizarNumero(document.getElementById("salario").value);
    const resultado = document.getElementById("resultado-juros");
    const elBruto = document.getElementById("valor-bruto");
    const elInss = document.getElementById("valor-inss");
    const elLiquido = document.getElementById("valor-liquido");
    const elTaxaEfetiva = document.getElementById("taxa-efetiva");

    resultado.style.display = "none";

    if (isNaN(salario) || salario <= 0) {
        alert("Por favor, preencha o salário corretamente.");
        return;
    }

    // Definição das Faixas (2026)
    const faixas = [
        { teto: 1621.00, aliquota: 0.075, nome: "7,5%" },
        { teto: 2902.84, aliquota: 0.09, nome: "9%" },
        { teto: 4354.27, aliquota: 0.12, nome: "12%" },
        { teto: 8475.55, aliquota: 0.14, nome: "14%" }
    ];

    let inssTotal = 0;
    let baseAnterior = 0;
    let impostoPorFaixa = [0, 0, 0, 0]; // Para o gráfico
    let salarioCalculado = Math.min(salario, faixas[3].teto); // Limita ao teto

    // Cálculo Progressivo
    faixas.forEach((faixa, index) => {
        let base = Math.min(salarioCalculado, faixa.teto);
        let valorNaFaixa = base - baseAnterior;

        if (valorNaFaixa > 0) {
            let imposto = valorNaFaixa * faixa.aliquota;
            inssTotal += imposto;
            impostoPorFaixa[index] = imposto;
        }
        baseAnterior = faixa.teto;
    });

    const salarioLiquido = salario - inssTotal;

    // Cálculo da Alíquota Efetiva (quanto % do salário real foi embora)
    let taxaEfetiva = (inssTotal / salario) * 100;

    // Atualizar DOM
    resultado.style.display = "block";
    elBruto.textContent = formatadorBRL.format(salario);
    elInss.textContent = "- " + formatadorBRL.format(inssTotal);
    elLiquido.textContent = formatadorBRL.format(salarioLiquido);
    elTaxaEfetiva.textContent = `Alíquota efetiva: ${taxaEfetiva.toFixed(2)}%`;

    // Atualizar Gráfico
    atualizarGrafico(impostoPorFaixa);

    // Scroll suave
    if (window.innerWidth < 600) {
        resultado.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function atualizarGrafico(dados) {
    const ctx = document.getElementById('graficoINSS').getContext('2d');

    if (graficoINSS) {
        graficoINSS.destroy();
    }

    // Cores das faixas
    const cores = [
        'rgba(59, 130, 246, 0.7)', // Azul
        'rgba(16, 163, 74, 0.7)',  // Verde
        'rgba(245, 158, 11, 0.7)', // Amarelo
        'rgba(239, 68, 68, 0.7)'   // Vermelho
    ];

    graficoINSS = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Faixa 7,5%', 'Faixa 9%', 'Faixa 12%', 'Faixa 14%'],
            datasets: [{
                label: 'Imposto Pago (R$)',
                data: dados,
                backgroundColor: cores,
                borderColor: cores.map(c => c.replace('0.7', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return ' Desconto: ' + formatadorBRL.format(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return 'R$ ' + value;
                        }
                    }
                }
            }
        }
    });
}

function limparCampos() {
    document.getElementById("salario").value = "";
    document.getElementById("resultado-juros").style.display = "none";
    if (graficoINSS) {
        graficoINSS.destroy();
        graficoINSS = null;
    }
}