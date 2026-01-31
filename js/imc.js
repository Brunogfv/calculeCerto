function normalizarNumero (valor) {
    return parseFloat(valor.replace(",", "."));
}

function calcularIMC() {
    const peso = normalizarNumero(document.getElementById("peso").value);
    const altura = normalizarNumero(document.getElementById("altura").value);
    const resultado = document.getElementById("resultado");

    resultado.style.display = "block";
    resultado.className = ""; // Limpar classes antigas

    if (isNaN(peso) || isNaN(altura) || peso <= 0 || altura <= 0) {
        resultado.textContent = "Preencha corretamente os campos. Exemplo: 70,5 e 1,75";
        resultado.classList.add("resultado-baixo");
        return;
    }

    const imc = peso / (altura * altura);
    let classificacao = "";
    let classe = "";

    if (imc < 18.5) {
        classificacao = "Abaixo do peso";
        classe = "resultado-baixo";
    }else if (imc < 25) {
        classificacao = "Peso normal";
        classe = "resultado-normal";
    }else if (imc < 30) {
        classificacao = "Sobrepeso";
        classe = "resultado-sobrepeso";
    }else {
        classificacao = "Obesidade";
        classe = "resultado-obesidade";
    }

    resultado.classList.add(classe);
    resultado.innerHTML = `
        Seu IMC é <strong>${imc.toFixed(2)}</strong><br>
        <small>${classificacao}</small>
    `;
}


