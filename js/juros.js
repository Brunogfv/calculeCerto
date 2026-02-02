function normalizarNumero(valor) {
    return parseFloat(valor.replace(",", "."));
}

let graficoJuros = null;

function calcularJuros() {
    const capital = normalizarNumero(document.getElementById("capital").value);
    const taxa = normalizarNumero(document.getElementById("taxa").value);
    const tempo = parseFloat(document.getElementById("tempo").value);
    const tipo = document.getElementById("tipo").value;

    const resultado = document.getElementById("resultado-juros");
    resultado.className = "";

    if (
        isNaN(capital) || capital <= 0 ||
        isNaN(taxa) || taxa <= 0 ||
        isNaN(tempo) || tempo <= 0
    ) {
        resultado.textContent = "Preencha todos os campos corretamente.";
        return;
    }

    const taxaDecimal = taxa / 100;
    let juros = 0;
    let montante = 0;

    if (tipo === "simples") {
        juros = capital * (taxa / 100) * tempo;
        montante = capital + juros;
    }else{
        montante = capital * Math.pow(1 + taxaDecimal, tempo);
        juros = montante - capital;
    }

    // const juros = capital * (taxa / 100) * tempo;
    // const montante = capital + juros;

    resultado.innerHTML = `
        <div class="resultado-card">
            <h2>Resultado da Simulação</h2>

            <div class="resultado-principal">
                <span>Montante Final</span>
                <strong id="valor-final">R$ ${montante.toFixed(2)}</strong>
            </div>

            <div class="resultado-detalhes">
                <p>💰 Capital inicial: <strong>R$ ${capital.toFixed(2)}</strong></p>
                <p>📈 Juros ganhos: <strong class="positivo">R$ ${juros.toFixed(2)}</strong></p>
                <p>⏱️ Tempo: <strong>${tempo} meses</strong></p>
                <p>📊 Tipo: <strong>${tipo === "simples" ? "Juros Simples" : "Juros Compostos"}</strong></p>
            </div>

            <small>
                ${tipo === "simples" ? "Nos juros simples, os juros não se acumulam." : "Nos juros compostos, os juros se acumulam mês a mês."}
            </small>
        </div>
    `;

    // Gráfico
    const labels = [];
    const valores = [];

    for (let i = 1; i <= tempo; i++) {
        labels.push(`Mês ${i}`);

        if (tipo === "simples") {
            valores.push(capital + (capital *taxaDecimal * i));
        }else{
            valores.push(capital * Math.pow(1 + taxaDecimal, i));
        }
    }

    const ctx = document.getElementById("graficoJuros").getContext("2d");

    // Destrói gráfico anterior
    if (graficoJuros) {
        graficoJuros.destroy();
    }

    graficoJuros = new Chart (ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Evolução do Montante (R$)",
                data: valores,
                borderWidth: 2,
                fill: false,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
    
    document.getElementById("grafico-container").style.display = "block";
}
function limparCampos() {
    document.getElementById("capital").value = "";
    document.getElementById("taxa").value = "";
    document.getElementById("tempo").value = "";
    document.getElementById("resultado-juros").innerHTML = "";
    
    if (graficoJuros) {
        graficoJuros.destroy();
        graficoJuros = null;
    }
    document.getElementById("grafico-container").style.display = "none";
}
