function toggleMenu() {
    document.getElementById('nav-menu').classList.toggle('active');
    document.querySelector('.overlay').classList.toggle('active');
}

function calcularPiso() {
    const comp = parseFloat(document.getElementById("comprimento").value);
    const larg = parseFloat(document.getElementById("largura").value);
    const pLarg = parseFloat(document.getElementById("piso-largura").value) / 100; // cm para m
    const pAlt = parseFloat(document.getElementById("piso-altura").value) / 100; // cm para m
    const m2Caixa = parseFloat(document.getElementById("conteudo-caixa").value);
    const residuo = parseFloat(document.getElementById("residuo").value);

    const resultadoArea = document.getElementById("resultado-area");

    if (isNaN(comp) || isNaN(larg) || isNaN(pLarg) || isNaN(pAlt) || isNaN(m2Caixa)) {
        alert("Por favor, preencha todos os campos corretamente.");
        return;
    }

    // 1. Área do Ambiente
    const areaAmbiente = comp * larg;
    const areaComResiduo = areaAmbiente * (1 + residuo);

    // 2. Área de uma Peça
    const areaPeca = pLarg * pAlt;

    // 3. Quantidade de Peças
    const totalPecas = Math.ceil(areaComResiduo / areaPeca);

    // 4. Quantidade de Caixas
    const totalCaixas = Math.ceil(areaComResiduo / m2Caixa);

    // Exibir
    resultadoArea.style.display = "block";
    document.getElementById("area-total").textContent = areaAmbiente.toFixed(2);
    document.getElementById("pecas-total").textContent = totalPecas;
    document.getElementById("caixas-total").textContent = totalCaixas;

    // Scroll
    if (window.innerWidth < 600) {
        resultadoArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // --- SALVAR NO HISTÓRICO ---
    if (typeof window.salvarCalculo === 'function') {
        window.salvarCalculo(
            'Calculadora de Piso',
            `Ambiente: ${comp}x${larg}m | Piso: ${pLarg*100}x${pAlt*100}cm`,
            `Área: ${areaAmbiente.toFixed(2)}m² | Peças: ${totalPecas} | Caixas: ${totalCaixas}`
        );
    }
}
