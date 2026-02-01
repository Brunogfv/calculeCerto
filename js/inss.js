function normalizarNumero(valor) {
    return parseFloat(valor.replace(",", "."));
}
let graficoINSS = null;

function calcularINSS() {
    const salario = normalizarNumero(document.getElementById("salario").value);
    const resultado = document.getElementById("resultado-juros");
    resultado.innerHTML = "";

    if (isNaN(salario) || salario <= 0) {
        resultado.textContent = "Informe um salário válido."
        return;
    }

    let inss = 0;
    const teto = 8745.55;

    const s1 = Math.min(salario, 1621.00);
    const s2 = Math.min(salario, 2902.84);
    const s3 = Math.min(salario, 4354.27);
    const s4 = Math.min(salario, teto);

    // Faixas INSS em 2026
    if (salario > 0) {
        inss += s1 * 0.075;
    }

    if (salario > 1621.00) {
        inss += (s2 - 1612.00) * 0.09;
    }

    if (salario > 2902.84) {
        inss += (s3 - 2902.84) * 0.12;
    }

    if (salario > 4354.27) {
        inss += (s4 - 4354.27) * 0.14;
    }


    // depois de calcular as partes de cada faixa
    const data = {
        labels: ["Faixa 1", "Faixa 2", "Faixa 3", "Faixa 4"],
        datasets: [{
            label: "Contribuição por faixa (R$)",
            data: [s1, s2, s3, s4],
            backgroundColor: [
                "rgba(59, 130, 246, 0.6)",
                "rgba(16, 163, 74, 0.6)",
                "rgba(245, 158, 11, 0.6)",
                "rgba(239, 68, 68, 0.6)"
            ]
        }]
    };

    if (graficoINSS) {
        graficoINSS.destroy();
    }

    document.querySelector(".grafico-container").style.display = "block";

    const canvas = document.getElementById("graficoINSS");
    canvas.style.display = "block";

    graficoINSS = new Chart(canvas, {
        type: "bar",
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });



    const salarioLiquido = salario - inss;

    resultado.innerHTML = `
        <strong>Resultado do Cálculo:</strong><br><br>
        Salário bruto: R$${salario.toFixed(2)}<br>
        Desconto INSS: <strong>R$ ${inss.toFixed(2)}</strong><br>
        Salário líquido: <strong>R$ ${salarioLiquido.toFixed(2)}</strong>
    `;
}

function limparCampos() {
    document.getElementById("salario").value = "";
    document.getElementById("resultado-juros").innerHTML = "";

    const canvas = document.getElementById("graficoINSS");

    if (graficoINSS) {
        graficoINSS.destroy();
        graficoINSS = null;
    }

    document.querySelector(".grafico-container").style.display = "none";
}
