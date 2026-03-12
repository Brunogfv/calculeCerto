document.addEventListener("DOMContentLoaded", function () {

    // HTML DO HEADER
    const headerHTML = `
    <header class="header topo">
        <div class="header-container">
            <div class="logo">
                <a href="/index.html">
                    <svg style="width:24px;height:24px;margin-right:8px;fill:currentColor" viewBox="0 0 24 24">
                        <path
                            d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-6 14h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z" />
                    </svg>
                    Portal das Contas
                </a>
            </div>

            <button class="mobile-menu-btn" onclick="toggleMenu()" aria-label="Abrir menu">
                ☰
            </button>

            <nav class="menu" id="nav-menu">
                <a href="/index.html" onclick="toggleMenu()">Início</a>

                <!-- Categoria Finanças -->
                <div class="menu-item">
                    <a href="javascript:void(0)" onclick="toggleMobileDropdown(this)">Finanças</a>
                    <div class="dropdown-menu">
                        <a href="/calculadoras/juros.html" onclick="toggleMenu()">Juros</a>
                        <a href="/calculadoras/inss.html" onclick="toggleMenu()">INSS</a>
                        <a href="/calculadoras/decimo-terceiro.html" onclick="toggleMenu()">13º Salário</a>
                        <a href="/calculadoras/porcentagem.html" onclick="toggleMenu()">Porcentagem</a>
                        <a href="/calculadoras/porcentagem-reversa.html" onclick="toggleMenu()">Porcentagem Reversa</a>
                        <a href="/calculadoras/salario.html" onclick="toggleMenu()">Conversor de Salário</a>
                        <a href="/calculadoras/hora-extra.html" onclick="toggleMenu()">Hora Extra</a>
                        <!-- NOVAS CALCULADORAS FINANCEIRAS -->
                        <a href="/calculadoras/calc-investimento.html" onclick="toggleMenu()">Investimentos</a>
                        <a href="/calculadoras/dividendos.html" onclick="toggleMenu()">Dividendos</a>
                        <a href="/calculadoras/calc-inflacao.html" onclick="toggleMenu()">Inflação</a>
                        <a href="/calculadoras/calc-cdb.html" onclick="toggleMenu()">CDB</a>
                        <a href="/calculadoras/calc-ir-investimentos.html" onclick="toggleMenu()">IR Investimentos</a>
                        <a href="/calculadoras/calc-tesouro-direto.html" onclick="toggleMenu()">Tesouro Direto</a>
                        <a href="/calculadoras/calc-price-sac.html" onclick="toggleMenu()">Price e SAC</a>
                        <a href="/calculadoras/calc-poupanca-vs-investimento.html" onclick="toggleMenu()">Poupança vs.
                            Outros</a>
                        <a href="/calculadoras/calc-imposto-renda.html" onclick="toggleMenu()">Imposto de Renda</a>
                        <a href="/calculadoras/calc-lca-vs-cdb.html" onclick="toggleMenu()">LCA vs CDB</a>
                        <a href="/calculadoras/calc-lci-vs-cdb.html" onclick="toggleMenu()">LCI vs CDB</a>
                    </div>
                </div>

                <!-- Categoria Saúde -->
                <div class="menu-item">
                    <a href="javascript:void(0)" onclick="toggleMobileDropdown(this)">Saúde</a>
                    <div class="dropdown-menu">
                        <a href="/calculadoras/imc.html" onclick="toggleMenu()">IMC</a>
                        <a href="/calculadoras/tmb.html" onclick="toggleMenu()">TMB</a>
                        <a href="/calculadoras/agua.html" onclick="toggleMenu()">Água</a>
                        <a href="/calculadoras/gasto-calorico.html" onclick="toggleMenu()">Gasto Calórico</a>
                        <a href="/calculadoras/tdee.html" onclick="toggleMenu()">TDEE</a>
                        <a href="/calculadoras/parto.html" onclick="toggleMenu()">Data de Parto</a>
                    </div>
                </div>

                <!-- Categoria Auto -->
                <div class="menu-item">
                    <a href="javascript:void(0)" onclick="toggleMobileDropdown(this)">Auto</a>
                    <div class="dropdown-menu">
                        <a href="/calculadoras/combustivel.html" onclick="toggleMenu()">Combustível</a>
                        <a href="/calculadoras/pneus.html" onclick="toggleMenu()">Troca de Pneus/Aro</a>
                    </div>
                </div>

                <!-- Categoria Educação -->
                <div class="menu-item">
                    <a href="javascript:void(0)" onclick="toggleMobileDropdown(this)">Educação</a>
                    <div class="dropdown-menu">
                        <a href="/calculadoras/medias.html" onclick="toggleMenu()">Média Escolar</a>
                        <a href="/calculadoras/regra-de-tres.html" onclick="toggleMenu()">Regra de Três</a>
                        <a href="/calculadoras/media-final.html" onclick="toggleMenu()">Nota para Passar</a>
                        <a href="/calculadoras/cr.html" onclick="toggleMenu()">CR Universitário</a>
                        <a href="/calculadoras/mmc-mdc.html" onclick="toggleMenu()">MMC e MDC</a>
                        <a href="/calculadoras/equacao-primeiro-grau.html" onclick="toggleMenu()">Equação 1º Grau</a>
                        <a href="/calculadoras/bhaskara.html" onclick="toggleMenu()">Bhaskara (2º Grau)</a>
                        <!-- NOVA CALCULADORA EDUCAÇÃO -->
                        <a href="/calculadoras/forca.html" onclick="toggleMenu()">Força (Física)</a>
                    </div>
                </div>

                <!-- Categoria Casa & Reforma -->
                <div class="menu-item">
                    <a href="javascript:void(0)" onclick="toggleMobileDropdown(this)">Casa & Reforma</a>
                    <div class="dropdown-menu">
                        <a href="/calculadoras/tinta.html" onclick="toggleMenu()">Calculadora de Tinta</a>
                        <a href="/calculadoras/piso.html" onclick="toggleMenu()">Calculadora de Piso</a>
                        <a href="/calculadoras/cimento.html" onclick="toggleMenu()">Calculadora de Cimento</a>
                        <a href="/calculadoras/medidas-culinarias.html" onclick="toggleMenu()">Medidas Culinárias</a>
                        <a href="/calculadoras/churrasco.html" onclick="toggleMenu()">Churrasco</a>
                        <a href="/calculadoras/pizza.html" onclick="toggleMenu()">Comparador de Pizza</a>
                        <a href="/calculadoras/energia.html" onclick="toggleMenu()">Consumo de Energia</a>
                        <a href="/calculadoras/festa.html" class="active" onclick="toggleMenu()">Calculadora de
                            Festa</a>
                    </div>
                </div>

                <!-- Categoria Utilitários -->
                <div class="menu-item">
                    <a href="javascript:void(0)" onclick="toggleMobileDropdown(this)">Utilitários</a>
                    <div class="dropdown-menu">
                        <a href="/calculadoras/datas.html" onclick="toggleMenu()">Diferença de Datas</a>
                        <a href="/calculadoras/temperatura.html" onclick="toggleMenu()">Conversor de Temperatura</a>
                        <a href="/calculadoras/conversor-unidades.html" onclick="toggleMenu()">Conversor de Unidades</a>
                        <a href="/calculadoras/velocidade-media.html" onclick="toggleMenu()">Velocidade Média</a>
                        <a href="/calculadoras/kmh-ms.html" onclick="toggleMenu()">km/h para m/s</a>
                    </div>
                </div>

                <div class="menu-item">
                    <a href="/artigos/index.html" onclick="toggleMenu()">Aprenda</a>
                </div>


                <a href="/paginas/sobre.html" onclick="toggleMenu()">Sobre</a>
                <a href="/paginas/contato.html" onclick="toggleMenu()">Contato</a>
            </nav>

                <!-- BARRA DE BUSCA -->
                <div class="search-wrapper">
                    <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input type="text" class="search-input" id="site-search" placeholder="Busque..." autocomplete="off">
                    <div class="search-results" id="search-results-list"></div>
                </div>

                <button class="toggle-theme" onclick="alternarTema()" aria-label="Alternar tema">
                    <span id="theme-icon">🌙</span>
                </button>
            </nav>
        </div>
    </header>
    `;

    // 1. Injetar o Header
    const container = document.getElementById("header-container");
    if (container) {
        container.outerHTML = headerHTML;
    }

    // 2. Inicializar Tema
    inicializarTema();

    // 3. Carregar Índice e Iniciar Busca
    carregarEIniciarBusca();
});

// --- LÓGICA DO TEMA (Mantida igual) ---
function inicializarTema() {
    const icon = document.getElementById("theme-icon");
    const body = document.body;
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
        body.setAttribute("data-theme", "dark");
        if (icon) icon.textContent = "☀️";
    } else {
        body.setAttribute("data-theme", "light");
        if (icon) icon.textContent = "🌙";
    }
}

window.alternarTema = function () {
    const body = document.body;
    const icon = document.getElementById("theme-icon");
    const currentTheme = body.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";

    body.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    if (icon) {
        icon.textContent = newTheme === "light" ? "🌙" : "☀️";
    }
};

// --- LÓGICA DE BUSCA COM PAGEFIND ---
let pagefindSearch = null; // Referência à função search do Pagefind

async function carregarEIniciarBusca() {
    const searchInput = document.getElementById("site-search");
    const resultsList = document.getElementById("search-results-list");

    if (!searchInput || !resultsList) {
        console.error("Elementos de busca não encontrados no DOM.");
        return;
    }

    try {
        // Importa o Pagefind dinamicamente (depois que o header já foi injetado)
        const pagefind = await import('/pagefind/pagefind.js');
        pagefindSearch = pagefind.search;
        console.log("Pagefind carregado com sucesso.");

        // Após carregar, ativa o evento de digitação
        ativarBusca(searchInput, resultsList);

    } catch (error) {
        console.error("Falha ao carregar Pagefind:", error);
        searchInput.placeholder = "Busca indisponível";
    }
}

function ativarBusca(input, container) {
    let debounceTimer;

    input.addEventListener("input", (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();

        debounceTimer = setTimeout(async () => {
            container.innerHTML = "";

            if (!query || query.length < 1) {
                container.classList.remove("active");
                return;
            }

            try {
                const results = await pagefindSearch(query);

                if (results.results.length > 0) {
                    for (const result of results.results) {
                        const data = await result.data();
                        let url = data.url || result.url;

                        if (!url) continue;

                        // Garante URL absoluta para funcionar em qualquer subpasta
                        if (!url.startsWith('/') && !url.startsWith('http')) {
                            url = '/' + url;
                        }

                        let title = "Página sem título";
                        if (data.meta && data.meta.title) {
                            title = data.meta.title;
                        } else {
                            const urlParts = url.split('/');
                            let fileName = urlParts[urlParts.length - 1] || "Home";
                            fileName = fileName.replace('.html', '').replace(/-/g, ' ');
                            title = fileName.charAt(0).toUpperCase() + fileName.slice(1);
                        }

                        const excerpt = data.excerpt || "Clique para acessar esta página.";

                        const link = document.createElement("a");
                        link.className = "search-item";
                        link.href = url;
                        link.innerHTML = `
                            <span class="search-category">Resultado</span>
                            <h4>${title}</h4>
                            <p>${excerpt}</p>
                        `;
                        container.appendChild(link);
                    }
                    container.classList.add("active");
                } else {
                    container.innerHTML = '<div class="no-results">Nenhum resultado encontrado.</div>';
                    container.classList.add("active");
                }
            } catch (error) {
                console.error("Erro na busca Pagefind:", error);
                container.innerHTML = '<div class="no-results">Erro ao buscar.</div>';
                container.classList.add("active");
            }
        }, 300); // debounce de 300ms
    });

    // Fechar ao clicar fora
    document.addEventListener("click", (e) => {
        if (!input.contains(e.target) && !container.contains(e.target)) {
            container.classList.remove("active");
        }
    });
}

// --- LÓGICA DO DROPDOWN MOBILE ---
window.toggleMobileDropdown = function (element) {
    if (window.innerWidth <= 768) {
        const menu = element.nextElementSibling;
        menu.classList.toggle('mobile-open');
    }
};