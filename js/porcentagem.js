function calcularPorcentagem () {
    const tipo = document.getElementById("tipo").value;
    const percentual = parseFloat(document.getElementById("percentual").value);
    const valor = parseFloat(document.getElementById("valor").value);
    const resultado = document.getElementById("resultado");

    resultado.style.display = "block";
    resultado.className = "";

    if (isNaN(percentual) || isNaN(valor)) {
        resultado.textContent = "Preencha os dois campos corretamente."
        resultado.classList.add("resultado-baixo");
        return;
    }

    let calculo = 0;
    let texto = "";

    if (tipo === "parte") {
        calculo = (percentual / 100) * valor;
        texto = `${percentual}% de ${valor} é`;
    }

    if (tipo === "aumento") {
        calculo = valor + (percentual / 100) * valor;
        texto = `${valor} com aumento de ${percentual}% é `;
    }

    if (tipo === "desconto") {
        calculo = valor - (percentual / 100) * valor;
        texto = `${valor} com desconto de ${percentual}% é `;
    }

    resultado.classList.add("resultado-normal");
    resultado.innerHTML = `
        ${texto}<br>
        <strong>${calculo.toFixed(2)}</strong>
    `;
}

function atualizarTextoBotao () {
        const tipo = document.getElementById("tipo").value;
        const botao = document.getElementById("btnCalcular");

        if (tipo === "parte") botao.textContent = "Calcular porcentagem";
        if (tipo === "aumento") botao.textContent = "Calcular aumento";
        if (tipo === "desconto") botao.textContent = "Calcular desconto";
    }

function limparCampos () {
        document.getElementById("percentual").value = "";
        document.getElementById("valor").value = "";

        const resultado = document.getElementById("resultado");
        resultado.style.display ="none";
        resultado.textContent = "";
    }