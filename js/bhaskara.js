function atualizarVisual() {
    const a = document.getElementById('coef-a').value || 1;
    const b = document.getElementById('coef-b').value || 0;
    const c = document.getElementById('coef-c').value || 0;

    const container = document.getElementById('equation-visual');

    let html = "";
    const valA = parseFloat(a);
    const valB = parseFloat(b);
    const valC = parseFloat(c);

    // Termo Ax²
    if (valA === 1) html += `<span class="var-x">x</span><span class="sup-2">2</span>`;
    else if (valA === -1) html += `-<span class="var-x">x</span><span class="sup-2">2</span>`;
    else html += `${valA}<span class="var-x">x</span><span class="sup-2">2</span>`;

    // Termo Bx
    if (valB > 0) {
        html += ` + `;
        if (valB !== 1) html += `${valB}`;
        html += `<span class="var-x">x</span>`;
    } else if (valB < 0) {
        html += ` - `;
        if (Math.abs(valB) !== 1) html += `${Math.abs(valB)}`;
        html += `<span class="var-x">x</span>`;
    }

    // Termo C
    if (valC > 0) {
        html += ` + ${valC}`;
    } else if (valC < 0) {
        html += ` - ${Math.abs(valC)}`;
    }

    html += ` = 0`;
    container.innerHTML = html;
}

function resolverBhaskara() {
    const a = parseFloat(document.getElementById('coef-a').value);
    const b = parseFloat(document.getElementById('coef-b').value);
    const c = parseFloat(document.getElementById('coef-c').value);

    // Validação
    if (isNaN(a) || isNaN(b) || isNaN(c)) {
        alert("Por favor, preencha todos os coeficientes.");
        return;
    }

    if (a === 0) {
        alert("O coeficiente 'a' não pode ser zero em uma equação do 2º grau. Use a calculadora de Equação do 1º Grau.");
        return;
    }

    // 1. Calcular Delta
    const delta = (b * b) - (4 * a * c);
    const deltaStr = Number.isInteger(delta) ? delta : delta.toFixed(2);

    document.getElementById('valor-delta').innerText = deltaStr;

    // Texto e Cor do Delta
    const deltaDesc = document.getElementById('delta-desc');
    const cardX1 = document.getElementById('card-x1');
    const cardX2 = document.getElementById('card-x2');
    const valX1 = document.getElementById('valor-x1');
    const valX2 = document.getElementById('valor-x2');

    // Resetar classes
    cardX1.className = 'root-card';
    cardX2.className = 'root-card';

    // Passo 1 Visual
    document.getElementById('passo-delta').innerHTML = `&Delta; = b² - 4ac <br> &Delta; = (${b})² - 4(${a})(${c}) <br> &Delta; = ${b * b} - ${4 * a * c} <br> <strong>&Delta; = ${deltaStr}</strong>`;

    // 2. Calcular Raízes
    if (delta > 0) {
        // Duas raízes reais distintas
        deltaDesc.innerText = "Delta Positivo: Duas raízes reais diferentes.";
        deltaDesc.style.color = "#15803d";

        const x1 = (-b + Math.sqrt(delta)) / (2 * a);
        const x2 = (-b - Math.sqrt(delta)) / (2 * a);

        valX1.innerText = Number.isInteger(x1) ? x1 : x1.toFixed(3);
        valX2.innerText = Number.isInteger(x2) ? x2 : x2.toFixed(3);

        // Passo 2 Visual
        const raizDelta = Math.sqrt(delta).toFixed(3).replace(/\.?0+$/, "");
        document.getElementById('passo-formula').innerHTML = `
                    x = (-b &plusmn; &radic;&Delta;) / 2a <br>
                    x = (${-b} &plusmn; ${raizDelta}) / ${2 * a} <br>
                    <strong>x' = ${valX1.innerText}</strong><br>
                    <strong>x'' = ${valX2.innerText}</strong>
                `;

    } else if (delta === 0) {
        // Uma raiz real dupla
        deltaDesc.innerText = "Delta Zero: Apenas uma raiz real (duas iguais).";
        deltaDesc.style.color = "#b45309";

        const x = -b / (2 * a);
        const xStr = Number.isInteger(x) ? x : x.toFixed(3);

        valX1.innerText = xStr;
        valX2.innerText = xStr;

        // Passo 2 Visual
        document.getElementById('passo-formula').innerHTML = `
                    x = (-b) / 2a <br>
                    x = (${-b}) / ${2 * a} <br>
                    <strong>x = ${xStr}</strong>
                `;

    } else {
        // Raízes Complexas
        deltaDesc.innerText = "Delta Negativo: Raízes complexas (não reais).";
        deltaDesc.style.color = "#b91c1c";

        cardX1.classList.add('complex');
        cardX2.classList.add('complex');

        const parteReal = (-b / (2 * a)).toFixed(3).replace(/\.?0+$/, "");
        const parteImag = (Math.sqrt(Math.abs(delta)) / (2 * a)).toFixed(3).replace(/\.?0+$/, "");

        valX1.innerText = `${parteReal} + ${parteImag}i`;
        valX2.innerText = `${parteReal} - ${parteImag}i`;

        // Passo 2 Visual (Complexo)
        document.getElementById('passo-formula').innerHTML = `
                    x = (-b &plusmn; &radic;${delta}) / 2a <br>
                    &radic;${delta} = ${parteImag}i <br>
                    x = (${-b} &plusmn; ${parteImag}i) / ${2 * a} <br>
                    <strong>x = ${parteReal} &plusmn; ${parteImag}i</strong>
                `;
    }

    document.getElementById('resultado-area').style.display = 'block';

    // Scroll
    if (window.innerWidth < 600) {
        document.getElementById('resultado-area').scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}

// Inicializar visual
atualizarVisual();