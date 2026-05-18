/**
 * Sistema de Usuário Local — Portal das Contas
 * Gerencia histórico de cálculos e calculadoras favoritas via localStorage.
 * Compatível com qualquer calculadora do site.
 * 
 * Chaves no localStorage:
 *   - "historicoCalculos"      → Array de objetos de cálculo (máx. 20)
 *   - "calculadorasFavoritas"  → Array de objetos de favoritos
 */

function normalizarUrlInterna(url) {
    if (!url) return '/';

    let normalized = String(url).trim();
    if (normalized.includes('${')) return '/';
    normalized = normalized.replace(/^https?:\/\/(?:www\.)?portaldascontas\.com\.br/i, '');
    
    // Remove query strings e fragmentos para normalização
    normalized = normalized.split('?')[0].split('#')[0];
    
    if (!normalized.startsWith('/')) normalized = `/${normalized.replace(/^\/+/, '')}`;

    // Remove .html e index.html se vierem de fontes externas ou caches
    if (normalized === '/index.html') return '/';
    if (normalized.endsWith('/index.html')) normalized = normalized.slice(0, -11) || '/';
    if (normalized.endsWith('.html')) normalized = normalized.slice(0, -5) || '/';
    
    // Remove barra final
    if (normalized.length > 1 && normalized.endsWith('/')) normalized = normalized.slice(0, -1);

    return normalized || '/';
}

// ========================================================
// HISTÓRICO DE CÁLCULOS
// ========================================================

/**
 * Salva um cálculo no histórico (localStorage).
 * Mantém no máximo 20 registros (os mais recentes).
 *
 * @param {string} calculadora - Nome da calculadora (ex: "Calculadora de IMC")
 * @param {string} valores     - Valores usados no cálculo (ex: "Peso: 72kg | Altura: 1.75m")
 * @param {string} resultado   - Resultado obtido (ex: "IMC: 23.5")
 */
window.salvarCalculo = function (calculadora, valores, resultado) {
    const MAX_HISTORICO = 20;

    // Monta o objeto do cálculo
    const agora = new Date();
    const dataFormatada = agora.getFullYear() + '-'
        + String(agora.getMonth() + 1).padStart(2, '0') + '-'
        + String(agora.getDate()).padStart(2, '0') + ' '
        + String(agora.getHours()).padStart(2, '0') + ':'
        + String(agora.getMinutes()).padStart(2, '0');

    const calculo = {
        calculadora: calculadora,
        valores: valores,
        resultado: resultado,
        data: dataFormatada
    };

    // Recupera o histórico existente
    const historico = window.obterHistorico();

    // Adiciona o novo cálculo no início (mais recente primeiro)
    historico.unshift(calculo);

    // Limita a 20 registros
    if (historico.length > MAX_HISTORICO) {
        historico.length = MAX_HISTORICO;
    }

    // Salva no localStorage
    try {
        localStorage.setItem('historicoCalculos', JSON.stringify(historico));
    } catch (e) {
        console.warn('Erro ao salvar histórico no localStorage:', e);
    }
};

/**
 * Retorna o array de cálculos salvos (últimos 20).
 * @returns {Array} Lista de objetos de cálculo
 */
window.obterHistorico = function () {
    try {
        const dados = localStorage.getItem('historicoCalculos');
        return dados ? JSON.parse(dados) : [];
    } catch (e) {
        console.warn('Erro ao ler histórico do localStorage:', e);
        return [];
    }
};

/**
 * Limpa todo o histórico de cálculos.
 */
window.limparHistorico = function () {
    localStorage.removeItem('historicoCalculos');
};


// ========================================================
// CALCULADORAS FAVORITAS
// ========================================================

/**
 * Adiciona uma calculadora aos favoritos.
 * Impede favoritos duplicados (comparação por URL).
 *
 * @param {string} nome - Nome da calculadora (ex: "Calculadora de Juros Compostos")
 * @param {string} url  - URL relativa da calculadora (ex: "/calculadoras/juros")
 */
window.adicionarFavorito = function (nome, url) {
    const favoritos = window.listarFavoritos();
    const normalizedUrl = normalizarUrlInterna(url);

    // Busca se já existe (comparação por URL)
    const index = favoritos.findIndex(fav => fav.url === normalizedUrl);
    
    if (index >= 0) {
        // Se já existe, atualizamos o nome (caso tenha mudado no HTML)
        favoritos[index].nome = nome;
    } else {
        // Se não existe, adicionamos novo
        favoritos.push({ nome: nome, url: normalizedUrl });
    }

    try {
        localStorage.setItem('calculadorasFavoritas', JSON.stringify(favoritos));
    } catch (e) {
        console.warn('Erro ao salvar favorito no localStorage:', e);
    }
};

/**
 * Retorna o array de calculadoras favoritas.
 * @returns {Array} Lista de objetos { nome, url }
 */
window.listarFavoritos = function () {
    try {
        const dados = localStorage.getItem('calculadorasFavoritas');
        const favoritos = dados ? JSON.parse(dados) : [];
        return favoritos
            .filter(fav => fav && !String(fav.url || '').includes('${'))
            .map(fav => ({
                ...fav,
                url: normalizarUrlInterna(fav.url)
            }));
    } catch (e) {
        console.warn('Erro ao ler favoritos do localStorage:', e);
        return [];
    }
};

/**
 * Remove uma calculadora dos favoritos pela URL.
 * @param {string} url - URL da calculadora a remover
 */
window.removerFavorito = function (url) {
    const normalizedUrl = normalizarUrlInterna(url);
    let favoritos = window.listarFavoritos();
    favoritos = favoritos.filter(fav => fav.url !== normalizedUrl);
    localStorage.setItem('calculadorasFavoritas', JSON.stringify(favoritos));
};

/**
 * Verifica se uma calculadora já está nos favoritos.
 * @param {string} url - URL para verificar
 * @returns {boolean} true se já estiver favoritada
 */
window.isFavorito = function (url) {
    const normalizedUrl = normalizarUrlInterna(url);
    return window.listarFavoritos().some(fav => fav.url === normalizedUrl);
};


// ========================================================
// BOTÃO ⭐ FAVORITAR (renderização dinâmica)
// ========================================================

/**
 * Renderiza o botão de favoritar dentro de um container na página da calculadora.
 * Gerencia o estado de favorito/não-favorito automaticamente.
 *
 * @param {string} containerId - ID do elemento HTML container (ex: "btn-favorito-container")
 * @param {string} nome        - Nome da calculadora
 * @param {string} url         - URL relativa da calculadora
 */
window.renderizarBotaoFavorito = function (containerId, nome, url) {
    const container = document.getElementById(containerId);
    if (!container) return;

    function atualizar() {
        const favoritado = window.isFavorito(url);

        container.innerHTML = `
            <button class="btn-favorito ${favoritado ? 'favoritado' : ''}" id="btn-fav-toggle" title="${favoritado ? 'Remover dos favoritos' : 'Favoritar esta calculadora'}">
                ${favoritado ? '★ Favoritada' : '☆ Favoritar calculadora'}
            </button>
        `;

        document.getElementById('btn-fav-toggle').addEventListener('click', () => {
            if (window.isFavorito(url)) {
                window.removerFavorito(url);
            } else {
                window.adicionarFavorito(nome, url);
            }
            atualizar(); // Re-renderiza com novo estado
        });
    }

    atualizar();
};
