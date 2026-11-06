// gerar-header.js (ESM)
// Injeta o header (e overlay do menu mobile) em todas as paginas.
// Nao depende de caminhos absolutos: resolve tudo a partir do proprio script.

const SITE_BASE_URL = new URL('../', import.meta.url); // .../<base>/
const SITE_BASE_PATH = SITE_BASE_URL.pathname; // .../<base>/

function sitePath(relPath) {
    let clean = String(relPath || '').replace(/^\/+/, '');
    
    // Se for vazio (home), retorna apenas o SITE_BASE_PATH
    if (!clean) return SITE_BASE_PATH;

    // Se for um link interno (#) ou ja tiver extensao (que nao seja .html), nao faz nada
    if ((clean.includes('.') && !clean.endsWith('.html')) || clean.includes('#') || clean.includes('?')) {
        return SITE_BASE_PATH + clean;
    }

    // Remove .html se existir no final da string de entrada
    if (clean.endsWith('.html')) {
        clean = clean.slice(0, -5);
    }

    // Retorna o caminho limpo sem .html
    return SITE_BASE_PATH + clean;
}

function siteUrl(relPath) {
    const clean = String(relPath || '').replace(/^\/+/, '');
    return new URL(clean, SITE_BASE_URL).toString();
}

function ensureOverlay() {
    let overlay = document.querySelector('.overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'overlay';
        const skip = document.querySelector('.skip-link');
        if (skip && skip.parentNode === document.body) skip.after(overlay);
        else document.body.prepend(overlay);
    }

    overlay.setAttribute('aria-hidden', 'true');
    overlay.removeAttribute('onclick');
    overlay.onclick = () => setMenuOpen(false);

    return overlay;
}

function buildHeaderHTML() {
    const href = sitePath;

    // Evita problemas de encoding usando HTML entities nos acentos/simbolos.
    return `
<header class="header topo">
    <div class="header-container">
        <div class="logo">
            <a href="${href('')}">
                <svg style="width:24px;height:24px;margin-right:8px;fill:currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-6 14h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z" />
                </svg>
                Portal das Contas
            </a>
        </div>

        <button type="button" class="mobile-menu-btn" aria-label="Abrir menu" aria-controls="nav-menu" aria-expanded="false"><span aria-hidden="true" data-pagefind-ignore>&#9776;</span></button>

        <nav class="menu" id="nav-menu" aria-label="Menu principal">
            <div class="menu-item">
                <button type="button" class="menu-trigger" aria-expanded="false" aria-controls="submenu-1" aria-haspopup="true">Finan&ccedil;as &amp; Trabalho<span class="menu-chevron" aria-hidden="true" data-pagefind-ignore>&#9662;</span></button>
                <div class="dropdown-menu columns-2" id="submenu-1">
                    <a href="${href('calculadoras/juros')}">Juros &amp; Investimentos</a>
                    <a href="${href('calculadoras/investimento')}">Simulador de Investimentos</a>
                    <a href="${href('calculadoras/inflacao')}">Infla&ccedil;&atilde;o (IPCA/IGP-M)</a>
                    <a href="${href('calculadoras/poupanca-vs-investimento')}">Poupan&ccedil;a vs Investimentos</a>
                    <a href="${href('calculadoras/inss')}">INSS</a>
                    <a href="${href('calculadoras/salario')}">Sal&aacute;rio L&iacute;quido</a>
                    <a href="${href('calculadoras/decimo-terceiro')}">13&ordm; Sal&aacute;rio</a>
                    <a href="${href('calculadoras/pj-vs-clt')}">PJ vs CLT (Qual Ã© Melhor?)</a>
                    <a href="${href('calculadoras/hora-extra')}">Hora Extra</a>
                    <a href="${href('calculadoras/porcentagem')}">Porcentagem</a>
                    <a href="${href('calculadoras/porcentagem-reversa')}">Porcentagem Reversa</a>
                    <a href="${href('calculadoras/cdb')}">CDB &amp; Renda Fixa</a>
                    <a href="${href('calculadoras/lca-vs-cdb')}">LCA vs CDB</a>
                    <a href="${href('calculadoras/lci-vs-cdb')}">LCI vs CDB</a>
                    <a href="${href('calculadoras/ir-investimentos')}">IR Investimentos</a>
                    <a href="${href('calculadoras/tesouro-direto')}">Tesouro Direto</a>
                    <a href="${href('calculadoras/price-sac')}">Price e SAC</a>
                    <a href="${href('calculadoras/imposto-renda')}">Imposto de Renda</a>
                    <a href="${href('calculadoras/dividendos')}">Dividendos (FIIs)</a>
                </div>
            </div>

            <div class="menu-item">
                <button type="button" class="menu-trigger" aria-expanded="false" aria-controls="submenu-2" aria-haspopup="true">Sa&uacute;de &amp; Pets<span class="menu-chevron" aria-hidden="true" data-pagefind-ignore>&#9662;</span></button>
                <div class="dropdown-menu" id="submenu-2">
                    <a href="${href('calculadoras/imc')}">IMC (Peso Ideal)</a>
                    <a href="${href('calculadoras/tmb')}">Metabolismo (TMB)</a>
                    <a href="${href('calculadoras/tdee')}">Gasto Cal&oacute;rico (TDEE)</a>
                    <a href="${href('calculadoras/gasto-calorico')}">Queima de Exerc&iacute;cios</a>
                    <a href="${href('calculadoras/agua')}">&Aacute;gua Di&aacute;ria</a>
                    <a href="${href('calculadoras/pet-idade')}">Idade Pet (Nova!)</a>
                    <a href="${href('calculadoras/parto')}">Data de Parto</a>
                </div>
            </div>

            <div class="menu-item">
                <button type="button" class="menu-trigger" aria-expanded="false" aria-controls="submenu-3" aria-haspopup="true">Im&oacute;veis &amp; Reforma<span class="menu-chevron" aria-hidden="true" data-pagefind-ignore>&#9662;</span></button>
                <div class="dropdown-menu" id="submenu-3">
                    <a href="${href('calculadoras/tinta')}">Pintura (Tinta)</a>
                    <a href="${href('calculadoras/piso')}">Piso &amp; Azulejo</a>
                    <a href="${href('calculadoras/cimento')}">Cimento &amp; Obra</a>
                    <a href="${href('calculadoras/aluguel-vs-compra')}">Aluguel vs Compra (Novo!)</a>
                    <a href="${href('calculadoras/amortizacao')}">Amortiza&ccedil;&atilde;o (Novo!)</a>
                    <a href="${href('calculadoras/energia')}">Consumo de Energia</a>
                </div>
            </div>

            <div class="menu-item">
                <button type="button" class="menu-trigger" aria-expanded="false" aria-controls="submenu-4" aria-haspopup="true">Educa&ccedil;&atilde;o &amp; Ci&ecirc;ncia<span class="menu-chevron" aria-hidden="true" data-pagefind-ignore>&#9662;</span></button>
                <div class="dropdown-menu columns-2" id="submenu-4">
                    <a href="${href('calculadoras/medias')}">M&eacute;dias Escolares</a>
                    <a href="${href('calculadoras/media-final')}">Nota para Passar (M&eacute;dia)</a>
                    <a href="${href('calculadoras/cr')}">Coeficiente (CR)</a>
                    <a href="${href('calculadoras/regra-de-tres')}">Regra de Tr&ecirc;s</a>
                    <a href="${href('calculadoras/bhaskara')}">Bhaskara &amp; Fun&ccedil;&otilde;es</a>
                    <a href="${href('calculadoras/equacao-primeiro-grau')}">Equa&ccedil;&atilde;o 1&ordm; Grau</a>
                    <a href="${href('calculadoras/mmc-mdc')}">MMC e MDC</a>
                    <a href="${href('calculadoras/conversor-unidades')}">Conversor de Medidas</a>
                    <a href="${href('calculadoras/velocidade-media')}">Velocidade M&eacute;dia</a>
                    <a href="${href('calculadoras/forca')}">For&ccedil;a (F=ma)</a>
                    <a href="${href('calculadoras/kmh-ms')}">km/h para m/s</a>
                    <a href="${href('calculadoras/temperatura')}">Temperaturas</a>
                    <a href="${href('calculadoras/datas')}">Diferen&ccedil;a de Datas</a>
                </div>
            </div>

            <div class="menu-item">
                <button type="button" class="menu-trigger" aria-expanded="false" aria-controls="submenu-5" aria-haspopup="true">Estilo de Vida<span class="menu-chevron" aria-hidden="true" data-pagefind-ignore>&#9662;</span></button>
                <div class="dropdown-menu" id="submenu-5">
                    <a href="${href('calculadoras/combustivel')}">Combust&iacute;vel</a>
                    <a href="${href('calculadoras/pneus')}">Pneus &amp; Aro</a>
                    <a href="${href('calculadoras/churrasco')}">Calculador de Churrasco</a>
                    <a href="${href('calculadoras/festa')}">C&aacute;lculo de Festa</a>
                    <a href="${href('calculadoras/pizza')}">Comparador de Pizza</a>
                    <a href="${href('calculadoras/medidas-culinarias')}">Cozinha (Medidas)</a>
                </div>
            </div>

            <a href="${href('artigos')}">Aprenda</a>

            <a href="${href('paginas/sobre')}">Sobre</a>
            <a href="${href('paginas/contato')}">Contato</a>
            <a href="${href('meus-calculos')}" style="display:flex;align-items:center;gap:4px"><span aria-hidden="true" data-pagefind-ignore>&#128203;</span> Meus C&aacute;lculos</a>
        </nav>

        <div class="search-wrapper" role="search">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="search" class="search-input" id="site-search" placeholder="Busque..." autocomplete="off" aria-label="Buscar no site" aria-controls="search-results-list">
            <div class="search-results" id="search-results-list" role="status" aria-live="polite" aria-label="Resultados da busca"></div>
        </div>

        <button type="button" class="toggle-theme" aria-label="Alternar tema">
            <span id="theme-icon" aria-hidden="true" data-pagefind-ignore>&#127769;</span>
        </button>
    </div>
</header>
`.trim();
}

function injectGlobalScripts() {
    const sc = document.createElement('script');
    sc.src = siteUrl('js/utils-calculadoras.js');
    document.head.appendChild(sc);

    // Carrega o sistema de usuÃ¡rio (histÃ³rico e favoritos)
    const scUsuario = document.createElement('script');
    scUsuario.src = siteUrl('js/usuario.js');
    document.head.appendChild(scUsuario);

    // Carrega o inicializador automÃ¡tico de favoritos
    const scAutoFav = document.createElement('script');
    scAutoFav.src = siteUrl('js/favoritos-auto.js');
    document.head.appendChild(scAutoFav);

}

function injectHeader() {
    injectGlobalScripts();

    // Header prÃ©-renderizado no HTML: sÃ³ inicializa comportamento.
    if (document.querySelector('header.header.topo')) {
        return;
    }

    const headerHTML = buildHeaderHTML();
    const wrapper = document.createElement('div');
    wrapper.innerHTML = headerHTML;
    const newHeader = wrapper.firstElementChild;
    if (!newHeader) return;

    const placeholder = document.getElementById('header-container');
    if (placeholder) {
        placeholder.appendChild(newHeader);
        return;
    }

    // Fallback: injeta depois do overlay/skip link quando existirem.
    const overlay = document.querySelector('.overlay');
    if (overlay) {
        overlay.after(newHeader);
    } else {
        const skip = document.querySelector('.skip-link');
        if (skip) skip.after(newHeader);
        else document.body.prepend(newHeader);
    }
}

// --- ESTADO E AJUDANTES DE ACESSIBILIDADE ---
let menuReturnFocus = null;

function getHeader() {
    return document.querySelector('header.header.topo');
}

function getMenu() {
    const header = getHeader();
    return header ? header.querySelector('#nav-menu') : document.getElementById('nav-menu');
}

function getOverlay() {
    return document.querySelector('.overlay');
}

function getHamburger() {
    const header = getHeader();
    return header ? header.querySelector('.mobile-menu-btn') : document.querySelector('.mobile-menu-btn');
}

function isMobileNav() {
    return window.matchMedia('(max-width: 1250px)').matches;
}

function normalizarCaminho(caminho) {
    let valor = String(caminho || '/').replace(/\/index\.html$/i, '/').replace(/\.html$/i, '');
    if (valor.length > 1) valor = valor.replace(/\/+$/, '');
    return valor || '/';
}

function isVisible(elemento) {
    if (!elemento) return false;
    const estilo = window.getComputedStyle(elemento);
    return estilo.visibility !== 'hidden' && estilo.display !== 'none' && elemento.getClientRects().length > 0;
}

function ensureSkipLink() {
    const main = document.querySelector('main');
    if (main) {
        if (!main.id) main.id = 'conteudo-principal';
        if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
    }

    let skip = document.querySelector('.skip-link');
    if (!skip) {
        skip = document.createElement('a');
        skip.className = 'skip-link';
        skip.textContent = 'Pular para o conteÃºdo principal';
        skip.setAttribute('data-pagefind-ignore', '');
        document.body.prepend(skip);
    }

    if (main) skip.setAttribute('href', '#' + main.id);
}

function marcarPaginaAtual() {
    const header = getHeader();
    if (!header) return;

    const atual = normalizarCaminho(window.location.pathname);
    header.querySelectorAll('nav a[href]').forEach((link) => {
        link.removeAttribute('aria-current');
        try {
            const url = new URL(link.getAttribute('href'), window.location.origin);
            if (url.origin === window.location.origin && normalizarCaminho(url.pathname) === atual) {
                link.setAttribute('aria-current', 'page');
            }
        } catch (error) {
            // Link invÃ¡lido: ignora.
        }
    });
}

function isMenuOpen() {
    const menu = getMenu();
    return !!menu && menu.classList.contains('active');
}

function setMenuOpen(open) {
    const menu = getMenu();
    const overlay = getOverlay();
    const hamburger = getHamburger();
    if (!menu) return;

    const mobile = isMobileNav();
    menu.classList.toggle('active', open);

    if (overlay) {
        overlay.classList.toggle('active', open);
        overlay.setAttribute('aria-hidden', String(!open));
    }

    if (hamburger) {
        hamburger.setAttribute('aria-expanded', String(open));
        hamburger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
        const glyph = hamburger.querySelector('[aria-hidden="true"]');
        if (glyph) glyph.textContent = open ? '\u2715' : '\u2630';
    }

    if (open) {
        closeAllDropdowns();
        if (mobile) {
            document.body.classList.add('menu-open');
            menuReturnFocus = hamburger || document.activeElement;
            const first = menu.querySelector('a, button');
            if (first) requestAnimationFrame(() => first.focus());
        }
    } else {
        document.body.classList.remove('menu-open');
        if (mobile && menuReturnFocus && menuReturnFocus.isConnected) {
            menuReturnFocus.focus();
        }
        menuReturnFocus = null;
    }
}

function getMenuFocusables() {
    const menu = getMenu();
    if (!menu) return [];
    const hamburger = getHamburger();
    return [hamburger, ...menu.querySelectorAll('a, button')].filter(isVisible);
}

function trapMenuFocus(event) {
    const nodes = getMenuFocusables();
    if (!nodes.length) return;

    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const ativo = document.activeElement;

    if (event.shiftKey && (ativo === first || !nodes.includes(ativo))) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && (ativo === last || !nodes.includes(ativo))) {
        event.preventDefault();
        first.focus();
    }
}

function handleGlobalKeydown(event) {
    if (event.key === 'Escape') {
        const header = getHeader();
        const aberto = header ? header.querySelector('.menu-trigger[aria-expanded="true"]') : null;

        if (aberto) {
            event.preventDefault();
            setDropdown(aberto, false);
            aberto.focus();
            return;
        }

        if (isMenuOpen()) {
            event.preventDefault();
            setMenuOpen(false);
            return;
        }

        closeAllDropdowns();
    }

    if (event.key === 'Tab' && isMenuOpen() && isMobileNav()) {
        trapMenuFocus(event);
    }
}

function setDropdown(trigger, open) {
    if (!trigger) return;
    const header = getHeader();

    if (header) {
        header.querySelectorAll('.menu-trigger').forEach((outro) => {
            if (outro === trigger) return;
            outro.setAttribute('aria-expanded', 'false');
            const menu = document.getElementById(outro.getAttribute('aria-controls')) || outro.nextElementSibling;
            if (menu) menu.classList.remove('mobile-open');
        });
    }

    trigger.setAttribute('aria-expanded', String(open));
    const menu = document.getElementById(trigger.getAttribute('aria-controls')) || trigger.nextElementSibling;
    if (menu) menu.classList.toggle('mobile-open', open);
}

function closeAllDropdowns() {
    const header = getHeader();
    if (!header) return;
    header.querySelectorAll('.menu-trigger').forEach((trigger) => {
        trigger.setAttribute('aria-expanded', 'false');
        const menu = document.getElementById(trigger.getAttribute('aria-controls')) || trigger.nextElementSibling;
        if (menu) menu.classList.remove('mobile-open');
    });
}

function configurarMenuMobile() {
    const hamburger = getHamburger();
    const menu = getMenu();

    if (hamburger) {
        hamburger.addEventListener('click', () => setMenuOpen(!isMenuOpen()));
    }

    if (menu) {
        menu.addEventListener('click', (event) => {
            if (event.target.closest('a') && isMenuOpen()) setMenuOpen(false);
        });
    }

    document.addEventListener('keydown', handleGlobalKeydown);

    window.addEventListener('resize', () => {
        if (!isMobileNav()) setMenuOpen(false);
        closeAllDropdowns();
    });
}

function configurarDropdowns(header) {
    const triggers = [...header.querySelectorAll('.menu-trigger')];

    triggers.forEach((trigger, index) => {
        let menu = document.getElementById(trigger.getAttribute('aria-controls'));
        if (!menu) menu = trigger.nextElementSibling;
        if (!menu) return;

        if (!menu.id) menu.id = trigger.getAttribute('aria-controls') || `submenu-${index + 1}`;
        trigger.setAttribute('aria-controls', menu.id);
        if (!trigger.getAttribute('aria-haspopup')) trigger.setAttribute('aria-haspopup', 'true');
        if (!trigger.getAttribute('aria-expanded')) trigger.setAttribute('aria-expanded', 'false');

        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            setDropdown(trigger, trigger.getAttribute('aria-expanded') !== 'true');
        });

        trigger.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                setDropdown(trigger, true);
                const links = [...menu.querySelectorAll('a')];
                if (links.length) (event.key === 'ArrowDown' ? links[0] : links[links.length - 1]).focus();
            } else if (event.key === 'Escape' && trigger.getAttribute('aria-expanded') === 'true') {
                event.preventDefault();
                event.stopPropagation();
                setDropdown(trigger, false);
                trigger.focus();
            }
        });

        menu.addEventListener('keydown', (event) => {
            const links = [...menu.querySelectorAll('a')];
            const atual = links.indexOf(document.activeElement);

            if (event.key === 'ArrowDown' && links.length) {
                event.preventDefault();
                links[(atual + 1) % links.length].focus();
            } else if (event.key === 'ArrowUp' && links.length) {
                event.preventDefault();
                links[(atual - 1 + links.length) % links.length].focus();
            } else if (event.key === 'Home' && links.length) {
                event.preventDefault();
                links[0].focus();
            } else if (event.key === 'End' && links.length) {
                event.preventDefault();
                links[links.length - 1].focus();
            } else if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                setDropdown(trigger, false);
                trigger.focus();
            }
        });

        const item = trigger.closest('.menu-item');
        if (item) {
            item.addEventListener('focusout', (event) => {
                if (!item.contains(event.relatedTarget)) setDropdown(trigger, false);
            });
        }
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.menu-item')) closeAllDropdowns();
    });
}

function configurarTema(header) {
    const btn = header.querySelector('.toggle-theme');
    if (!btn) return;

    if (!btn.getAttribute('type')) btn.setAttribute('type', 'button');
    if (!btn.getAttribute('aria-label')) btn.setAttribute('aria-label', 'Alternar tema');
    btn.addEventListener('click', alternarTemaLocal);
    atualizarRotuloTema();
}

function configurarBuscaA11y() {
    const input = document.getElementById('site-search');
    const results = document.getElementById('search-results-list');

    if (input) {
        if (input.type !== 'search') input.type = 'search';
        if (!input.getAttribute('aria-label')) input.setAttribute('aria-label', 'Buscar no site');
        input.setAttribute('aria-controls', 'search-results-list');
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && results) {
                results.classList.remove('active');
                results.innerHTML = '';
            }
        });
    }

    if (results) {
        if (!results.getAttribute('role')) results.setAttribute('role', 'status');
        if (!results.getAttribute('aria-live')) results.setAttribute('aria-live', 'polite');
        if (!results.getAttribute('aria-label')) results.setAttribute('aria-label', 'Resultados da busca');
    }
}

function enhanceHeader() {
    const header = getHeader();
    if (!header) return;

    const overlay = ensureOverlay();
    header.querySelectorAll('[onclick]').forEach((elemento) => elemento.removeAttribute('onclick'));
    overlay.removeAttribute('onclick');

    // Fallback para HTML antigo: converte gatilhos em botÃµes acessÃ­veis.
    header.querySelectorAll('.menu-item > a[href="javascript:void(0)"]').forEach((anchor, index) => {
        const menu = anchor.nextElementSibling;
        if (!menu || !menu.classList.contains('dropdown-menu')) return;

        const id = menu.id || `submenu-${index + 1}`;
        menu.id = id;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'menu-trigger';
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-controls', id);
        button.setAttribute('aria-haspopup', 'true');
        button.innerHTML = `${anchor.innerHTML}<span class="menu-chevron" aria-hidden="true" data-pagefind-ignore>\u25BE</span>`;
        anchor.replaceWith(button);
    });

    const hamburger = getHamburger();
    if (hamburger) {
        if (!hamburger.getAttribute('type')) hamburger.setAttribute('type', 'button');
        hamburger.setAttribute('aria-controls', 'nav-menu');
        hamburger.setAttribute('aria-expanded', String(isMenuOpen()));
        if (!hamburger.getAttribute('aria-label')) hamburger.setAttribute('aria-label', 'Abrir menu');
    }

    const nav = header.querySelector('nav.menu');
    if (nav && !nav.getAttribute('aria-label')) nav.setAttribute('aria-label', 'Menu principal');

    header.querySelectorAll('.logo svg, .search-icon').forEach((svg) => {
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
    });

    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) themeIcon.setAttribute('aria-hidden', 'true');

    const themeButton = header.querySelector('.toggle-theme');
    if (themeButton) {
        if (!themeButton.getAttribute('type')) themeButton.setAttribute('type', 'button');
        if (!themeButton.getAttribute('aria-label')) themeButton.setAttribute('aria-label', 'Alternar tema');
    }

    configurarMenuMobile();
    configurarDropdowns(header);
    configurarTema(header);
    configurarBuscaA11y();
    marcarPaginaAtual();
}

// --- TEMA ---
function atualizarRotuloTema() {
    const btn = document.querySelector('.toggle-theme');
    if (!btn) return;
    const escuro = document.body.getAttribute('data-theme') === 'dark';
    btn.setAttribute('aria-label', escuro ? 'Ativar tema claro' : 'Ativar tema escuro');
}

function inicializarTema() {
    const icon = document.getElementById('theme-icon');
    const body = document.body;
    const savedTheme = localStorage.getItem('theme');
    const tema = savedTheme === 'dark' ? 'dark' : 'light';

    body.setAttribute('data-theme', tema);
    if (icon) icon.textContent = tema === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19';
    atualizarRotuloTema();
}

function alternarTemaLocal() {
    const body = document.body;
    const icon = document.getElementById('theme-icon');
    const atual = body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const novo = atual === 'light' ? 'dark' : 'light';

    body.setAttribute('data-theme', novo);
    localStorage.setItem('theme', novo);

    if (icon) icon.textContent = novo === 'light' ? '\uD83C\uDF19' : '\u2600\uFE0F';
    atualizarRotuloTema();
}

window.toggleMenu = function (force) {
    setMenuOpen(typeof force === 'boolean' ? force : !isMenuOpen());
};

window.toggleMobileDropdown = function (element) {
    const trigger = element && element.classList && element.classList.contains('menu-trigger')
        ? element
        : element && element.closest && element.closest('.menu-item')?.querySelector('.menu-trigger');
    if (trigger) setDropdown(trigger, trigger.getAttribute('aria-expanded') !== 'true');
};

window.alternarTema = alternarTemaLocal;

// --- BUSCA (PAGEFIND) ---
let pagefindSearch = null;

function resolveResultUrl(rawUrl) {
    if (!rawUrl) return null;
    const url = String(rawUrl);

    if (/^https?:\/\//i.test(url)) return url;

    // Pagefind costuma devolver caminhos com / no inicio; em hospedagem em subpasta isso quebra.
    const clean = url.replace(/^\/+/, '').replace(/index\.html$/i, '').replace(/\.html$/i, '');
    return siteUrl(clean);
}

async function carregarEIniciarBusca() {
    const searchInput = document.getElementById('site-search');
    const resultsList = document.getElementById('search-results-list');

    if (!searchInput || !resultsList) return;

    try {
        const pagefind = await import(siteUrl('pagefind/pagefind.js'));
        pagefindSearch = pagefind.search;
        ativarBusca(searchInput, resultsList);
    } catch (error) {
        console.error('Falha ao carregar Pagefind:', error);
        searchInput.placeholder = 'Busca indisponivel';
    }
}

function configurarRedirecionamento() {
    const input = document.getElementById('site-search');
    if (!input) {
        console.warn('Input de busca nao encontrado para configurar redirecionamento');
        return;
    }

    console.log('Configurando redirecionamento de busca...');
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const query = input.value.trim();
            console.log('Enter pressionado. Busca:', query);
            if (query) {
                const target = sitePath(`busca?q=${encodeURIComponent(query)}`);
                console.log('Redirecionando para:', target);
                window.location.href = target;
            }
        }
    });
}

function ativarBusca(input, container) {
    let debounceTimer;

    input.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();

        debounceTimer = setTimeout(async () => {
            container.innerHTML = '';

            if (!query || query.length < 1) {
                container.classList.remove('active');
                return;
            }

            try {
                const results = await pagefindSearch(query);

                if (results.results.length > 0) {
                    for (const result of results.results) {
                        const data = await result.data();
                        const resolvedUrl = resolveResultUrl(data.url || result.url);
                        if (!resolvedUrl) continue;

                        const title = (data.meta && data.meta.title) ? data.meta.title : 'Resultado';
                        const excerpt = data.excerpt || 'Clique para acessar esta pagina.';

                        const link = document.createElement('a');
                        link.className = 'search-item';
                        link.href = resolvedUrl;
                        link.innerHTML = `
<span class="search-category">Resultado</span>
<h4>${title}</h4>
<p>${excerpt}</p>
`.trim();
                        container.appendChild(link);
                    }
                    container.classList.add('active');
                } else {
                    container.innerHTML = '<div class="no-results">Nenhum resultado encontrado.</div>';
                    container.classList.add('active');
                }
            } catch (error) {
                console.error('Erro na busca Pagefind:', error);
                container.innerHTML = '<div class="no-results">Erro ao buscar.</div>';
                container.classList.add('active');
            }
        }, 300);
    });

    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !container.contains(e.target)) {
            container.classList.remove('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    ensureSkipLink();
    ensureOverlay();
    injectHeader();
    ensureSkipLink();
    enhanceHeader();
    inicializarTema();
    configurarRedirecionamento();
    carregarEIniciarBusca();
});