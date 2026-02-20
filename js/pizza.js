function calcularPizza() {

    const d1 = parseFloat(document.getElementById("diametro1").value);
    const preco1 = parseFloat(document.getElementById("preco1").value);
    const d2 = parseFloat(document.getElementById("diametro2").value);
    const preco2 = parseFloat(document.getElementById("preco2").value);

    // Validação correta
    if (isNaN(d1) || isNaN(preco1) || isNaN(d2) || isNaN(preco2)) {
        alert("Preencha todos os campos corretamente.");
        return;
    }

    // Cálculo da área
    const area1 = Math.PI * Math.pow(d1 / 2, 2);
    const area2 = Math.PI * Math.pow(d2 / 2, 2);

    // Custo por cm²
    const custo1 = preco1 / area1;
    const custo2 = preco2 / area2;

    const resultado = document.getElementById("resultado");
    const cards = document.querySelectorAll(".pizza-card");

    // Reset visual
    cards[0].style.borderColor = "#e2e8f0";
    cards[1].style.borderColor = "#e2e8f0";

    let textoFinal = "";

    if (custo1 < custo2) {
        cards[0].style.borderColor = "#10b981";
        textoFinal = "🍕 Pizza 1 é a melhor opção!";
    } else if (custo2 < custo1) {
        cards[1].style.borderColor = "#10b981";
        textoFinal = "🍕 Pizza 2 é a melhor opção!";
    } else {
        textoFinal = "🤝 Empate técnico! Ambas têm o mesmo custo por cm².";
    }

    textoFinal += `
        <br><br>
        📐 Área Pizza 1: ${area1.toFixed(2)} cm²  
        <br>💰 Custo/cm² Pizza 1: R$ ${custo1.toFixed(4)}
        <br><br>
        📐 Área Pizza 2: ${area2.toFixed(2)} cm²  
        <br>💰 Custo/cm² Pizza 2: R$ ${custo2.toFixed(4)}
    `;

    resultado.innerHTML = textoFinal;
    resultado.style.display = "block";
}
