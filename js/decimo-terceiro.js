function normalizarNumero (valor) {
    return parseFloat(valor.replace(",", "."));
}

function calcularDecimoTerceiro () {
    const salario = normalizarNumero(document.getElementById("salario").value);
    const meses = parseInt(document.getElementById("meses").value);

    const resultado = document.getElementById("resultado-juros");
    resultado.className = "";

    if (isNaN(salario) || salario <= 0 || isNaN(meses) || meses < 1 || meses > 12) {
        resultado.textContent = "Preencha os dados corretamente.";
        return;
    }

    const decimoBruto = (salario / 12) * meses;
    const primeiraParcela = decimoBruto / 2;
    
    let inss = decimoBruto * 0.08;
    const segundaParcela = decimoBruto - primeiraParcela - inss;
    
    resultado.innerHTML = `
        <strong> Resultado 13º salário:</strong><br><br>
        Valor Bruto: <strong>R$ ${decimoBruto.toFixed(2)}</strong><br>
        1ª parcela: R$ ${primeiraParcela.toFixed(2)}</strong><br>
        Desconto INSS (estimado): R$ ${inss.toFixed(2)}<br>
        2ª parcela: <strong> R$ ${segundaParcela.toFixed(2)}</strong>
    `;
}


function limparCampos () {
    document.getElementById("salario").value = "";
    document.getElementById("meses").value = "";
    document.getElementById("resultado-juros").innerHTML = "";
}