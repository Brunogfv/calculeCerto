/**
 * Automação do Botão Favoritar — Portal das Contas
 * Este script procura automaticamente por containers de favorito e os inicializa.
 * 
 * Uso: <div id="btn-favorito-container" data-nome="Nome" data-url="/link.html"></div>
 */

(function() {
    function inicializarAutoFavorito() {
        const container = document.getElementById('btn-favorito-container');
        if (!container) return;

        // Tenta pegar os dados dos atributos data-nome e data-url (ou dataset)
        // Sanitiza para evitar problemas com espaços ou nulos
        const nomeAttr = container.getAttribute('data-nome') || container.dataset.nome;
        const urlAttr = container.getAttribute('data-url') || container.dataset.url;
        
        const nome = (nomeAttr && nomeAttr.trim()) || document.title.split('|')[0].trim();
        const url = (urlAttr && urlAttr.trim()) || window.location.pathname;

        // Aguarda a função renderizarBotaoFavorito (que está no usuario.js) estar disponível
        const checkFuncao = setInterval(() => {
            if (typeof window.renderizarBotaoFavorito === 'function') {
                window.renderizarBotaoFavorito('btn-favorito-container', nome, url);
                clearInterval(checkFuncao);
            }
        }, 80);

        // Timer de segurança (3 segundos)
        setTimeout(() => clearInterval(checkFuncao), 3000);
    }

    // Executa quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarAutoFavorito);
    } else {
        inicializarAutoFavorito();
    }
})();
