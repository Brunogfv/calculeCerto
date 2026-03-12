/**
 * Utilitários Globais para Calculadoras - Portal das Contas
 * Melhora a experiência do usuário com separadores decimais (ponto vs vírgula)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Intercepta a digitação em campos de entrada para converter ponto em vírgula
    // em campos que aceitam decimais (evitando os formatados como moeda que já tem lógica própria)
    document.addEventListener('input', (e) => {
        const el = e.target;
        
        // Verifica se é um input de texto ou número
        if (el.tagName === 'INPUT' && (el.type === 'text' || el.type === 'number')) {
            
            // Não interfere se o input já tiver lógica de formatação de moeda (ex: capital em juros.html)
            if (el.hasAttribute('oninput') && el.getAttribute('oninput').includes('formatarMoeda')) {
                return;
            }

            // Se o usuário digitou um ponto, trocamos por vírgula para manter o padrão PT-BR
            // mas apenas se o campo for destinado a números (baseado no ID ou placeholder)
            const isNumericField = el.id.match(/peso|altura|taxa|tempo|percent|valor|medida|tamanho|quantidade/i) || 
                                 el.placeholder.toLowerCase().includes('ex:') ||
                                 el.type === 'number';

            if (isNumericField && el.value.includes('.')) {
                // Salva a posição do cursor
                const start = el.selectionStart;
                const end = el.selectionEnd;
                
                el.value = el.value.replace(/\./g, ',');
                
                // Restaura a posição do cursor
                if (el.type === 'text') {
                    el.setSelectionRange(start, end);
                }
            }
        }
    });
});

/**
 * Função global robusta para converter string de input em número real para cálculos
 */
window.converterParaNumero = function(valor) {
    if (!valor) return 0;
    
    // Se tiver vírgula, tratamos como padrão brasileiro (ponto é milhar, vírgula é decimal)
    if (valor.includes(',')) {
        return parseFloat(valor.replace(/\./g, '').replace(',', '.'));
    }
    
    // Se não tiver vírgula mas tiver ponto, verificamos se é milhar ou decimal
    // Em calculadoras de saúde (altura, peso), valores com ponto único como 1.75 são decimais.
    // Em valores financeiros grandes como 1.000, é milhar.
    // Como regra geral para este site: se houver apenas UM ponto e ele estiver a 1 ou 2 casas do fim, é decimal.
    const partes = valor.split('.');
    if (partes.length === 2 && partes[1].length <= 2) {
        return parseFloat(valor); // Já é decimal no padrão JS
    }
    
    // Caso contrário, removemos o ponto (milhar)
    return parseFloat(valor.replace(/\./g, ''));
};
