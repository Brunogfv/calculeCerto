function normalizarNumero(valor) {
    return parseFloat(valor.replace(",", "."));
}

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
        <h3>Resultado (${tipo === "simples" ? "Juros Simples" : "Juros Compostos"})</h3>
        <p>Capital Inicial: <strong>R$ ${capital.toFixed(2)}</strong></p>
        <p>Juros: <strong> R$ ${juros.toFixed(2)}</strong></p>
        <p>Montante Final: <strong>R$ ${montante.toFixed(2)}</strong></p>
        <small>
            ${tipo === "simples" ? "Nos juros simples, os juros não se acumulam." : "Nos juros compostos, os juros se acumulam mês a mês."}
        </small>
    `;
}
function limparCampos() {
    document.getElementById("capital").value = "";
    document.getElementById("taxa").value = "";
    document.getElementById("tempo").value = "";
    document.getElementById("resultado-juros").innerHTML = "";
}
