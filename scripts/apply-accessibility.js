const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const IGNORAR = /(^|[\\/])(node_modules|dist|pagefind|playwright-report|test-results|docs|tests|scripts|\.git)([\\/]|$)/i;
const SKIP_TEXT = 'Pular para o conteúdo principal';
const MAIN_ID = 'conteudo-principal';

function walk(dir) {
    let out = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (IGNORAR.test(full)) continue;
        if (entry.isDirectory()) out = out.concat(walk(full));
        else if (entry.name.endsWith('.html')) out.push(full);
    }
    return out;
}

function transformar(html) {
    const stats = { skip: false, main: false, header: false, triggers: 0, onclicks: 0, overlay: false };
    let out = html;

    if (!/class=["']skip-link["']/i.test(out)) {
        out = out.replace(/(<body\b[^>]*>)/i, (body) =>
            `${body}\n    <a class="skip-link" href="#${MAIN_ID}" data-pagefind-ignore>${SKIP_TEXT}</a>`
        );
        stats.skip = true;
    }

    const mainTag = out.match(/<main\b[^>]*>/i);
    let mainId = MAIN_ID;
    if (mainTag) {
        const tag = mainTag[0];
        const idMatch = tag.match(/\bid=["']([^"']+)["']/i);
        mainId = idMatch ? idMatch[1] : MAIN_ID;
        let novo = tag;
        if (!idMatch) novo = novo.replace(/^<main\b/i, `<main id="${MAIN_ID}"`);
        if (!/\btabindex=/i.test(novo)) novo = novo.replace(/\s*>$/, ' tabindex="-1">');
        if (novo !== tag) {
            out = out.replace(tag, () => novo);
            stats.main = true;
        }
    }

    if (mainId !== MAIN_ID) {
        out = out.replace(/(<a\s+class=["']skip-link["'][^>]*href=")#[^"]*(")/i, `$1#${mainId}$2`);
    }

    const headerMatch = out.match(/<header\s+class=["']header topo["'][\s\S]*?<\/header>/i);
    if (headerMatch) {
        let header = headerMatch[0];
        const antes = header;

        header = header.replace(
            /<a\s+href=["']javascript:void\(0\)["']\s+onclick=["']toggleMobileDropdown\(this\)["']>([\s\S]*?)<\/a>\s*(<div\s+class=["']dropdown-menu([^"']*)["']\s*>)/gi,
            (match, label, divOpen) => {
                stats.triggers++;
                let div = divOpen;
                const idMatch = div.match(/\bid=["']([^"']+)["']/i);
                const menuId = idMatch ? idMatch[1] : `submenu-${stats.triggers}`;
                if (!idMatch) div = div.replace(/\s*>$/, ` id="${menuId}">`);
                const texto = label.replace(/\s+$/, '');
                return `<button type="button" class="menu-trigger" aria-expanded="false" aria-controls="${menuId}" aria-haspopup="true">${texto}<span class="menu-chevron" aria-hidden="true">▾</span></button>\n                ${div}`;
            }
        );

        const antesOnclicks = (header.match(/\bonclick\s*=/gi) || []).length;
        header = header.replace(/\s+onclick=["'](?:toggleMenu\(\)|toggleMobileDropdown\(this\)|alternarTema\(\))["']/gi, '');
        stats.onclicks += antesOnclicks - ((header.match(/\bonclick\s*=/gi) || []).length);

        header = header.replace(/<button\s+class=["']mobile-menu-btn["']([^>]*)>/gi, (match, attrs) => {
            let a = attrs;
            if (!/\btype=/i.test(a)) a += ' type="button"';
            if (!/\baria-controls=/i.test(a)) a += ' aria-controls="nav-menu"';
            if (!/\baria-expanded=/i.test(a)) a += ' aria-expanded="false"';
            if (!/\baria-label=/i.test(a)) a += ' aria-label="Abrir menu"';
            return `<button class="mobile-menu-btn"${a}>`;
        });

        header = header.replace(
            /(<button\s+class=["']mobile-menu-btn["'][^>]*>)\s*(☰|&#9776;)\s*<\/button>/gi,
            '$1<span aria-hidden="true">$2</span></button>'
        );

        header = header.replace(/<nav\b([^>]*)>/gi, (match, attrs) => {
            if (!/\bclass=["'][^"']*\bmenu\b/i.test(attrs) || !/\bid=["']nav-menu["']/i.test(attrs)) return match;
            let a = attrs;
            if (!/\baria-label=/i.test(a)) a += ' aria-label="Menu principal"';
            return `<nav${a}>`;
        });

        header = header.replace(/<button\s+class=["']toggle-theme["']([^>]*)>/gi, (match, attrs) => {
            let a = attrs;
            if (!/\btype=/i.test(a)) a += ' type="button"';
            if (!/\baria-label=/i.test(a)) a += ' aria-label="Alternar tema"';
            return `<button class="toggle-theme"${a}>`;
        });

        header = header.replace(/<span\s+id=["']theme-icon["']\s*>/gi, (match) =>
            /aria-hidden/i.test(match) ? match : '<span id="theme-icon" aria-hidden="true">'
        );

        header = header.replace(/<svg\b([^>]*)>/gi, (match, attrs) => {
            let a = attrs;
            if (!/\baria-hidden=/i.test(a)) a += ' aria-hidden="true"';
            if (!/\bfocusable=/i.test(a)) a += ' focusable="false"';
            return `<svg${a}>`;
        });

        header = header.replace(/>\s*📋\s*Meus Cálculos</g, '><span aria-hidden="true">📋</span> Meus Cálculos<');
        header = header.replace(/>\s*&#128203;\s*Meus C&aacute;lculos</g, '><span aria-hidden="true">&#128203;</span> Meus C&aacute;lculos<');

        header = header.replace(/<div\s+class=["']search-wrapper["'](\s*)>/gi, (match) =>
            /\brole=/i.test(match) ? match : '<div class="search-wrapper" role="search">'
        );

        header = header.replace(/<input\b([^>]*\bclass=["'][^"']*\bsearch-input\b[^"']*["'][^>]*)>/gi, (match, attrs) => {
            let a = attrs;
            if (!/\baria-label=/i.test(a)) a += ' aria-label="Buscar no site"';
            if (!/\baria-controls=/i.test(a)) a += ' aria-controls="search-results-list"';
            if (!/\btype=["']search["']/i.test(a)) a = a.replace(/\btype=["']text["']/i, 'type="search"');
            return `<input${a}>`;
        });

        header = header.replace(
            /<div\s+class=["']search-results["']\s+id=["']search-results-list["']([^>]*)>/gi,
            (match, attrs) => {
                let a = attrs;
                if (!/\brole=/i.test(a)) a += ' role="status"';
                if (!/\baria-live=/i.test(a)) a += ' aria-live="polite"';
                if (!/\baria-label=/i.test(a)) a += ' aria-label="Resultados da busca"';
                return `<div class="search-results" id="search-results-list"${a}>`;
            }
        );

        header = header.replace(/<span\s+class=["']menu-chevron["']([^>]*)>/gi, (match, attrs) => {
            if (/data-pagefind-ignore/i.test(attrs)) return match;
            return `<span class="menu-chevron"${attrs} data-pagefind-ignore>`;
        });

        header = header.replace(/<span\b([^>]*\baria-hidden=["']true["'][^>]*)>/gi, (match, attrs) => {
            if (/data-pagefind-ignore/i.test(attrs)) return match;
            return `<span${attrs} data-pagefind-ignore>`;
        });

        if (header !== antes) {
            out = out.replace(headerMatch[0], () => header);
            stats.header = true;
        }
    }

    out = out.replace(/<div\s+class=["']overlay["']([^>]*)>/gi, (match, attrs) => {
        let a = attrs.replace(/\s+onclick=["']toggleMenu\(\)["']/gi, '');
        if (!/\baria-hidden=/i.test(a)) a += ' aria-hidden="true"';
        stats.overlay = true;
        return `<div class="overlay"${a}>`;
    });

    out = out.replace(/<button\s+class=["']btn-remover-cr["']([^>]*)>/gi, (match, attrs) => {
        if (/\baria-label=|\btitle=/i.test(attrs)) return match;
        return `<button class="btn-remover-cr"${attrs} aria-label="Remover linha">`;
    });

    return { html: out, stats };
}

const files = walk(ROOT);
const problemas = [];
const resumo = { arquivos: files.length, skip: 0, main: 0, header: 0, triggers: 0, onclicks: 0 };

for (const file of files) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    const antes = fs.readFileSync(file, 'utf8');
    const { html, stats } = transformar(antes);

    if (html !== antes) fs.writeFileSync(file, html, 'utf8');

    resumo.skip += stats.skip ? 1 : 0;
    resumo.main += stats.main ? 1 : 0;
    resumo.header += stats.header ? 1 : 0;
    resumo.triggers += stats.triggers;
    resumo.onclicks += stats.onclicks;

    const header = html.match(/<header\s+class=["']header topo["'][\s\S]*?<\/header>/i);
    if (!header) {
        problemas.push(`${rel}: header ausente`);
        continue;
    }
    if (/toggleMobileDropdown\(this\)/.test(header[0])) {
        problemas.push(`${rel}: gatilho de dropdown não convertido`);
    }
    if (/<header\b[\s\S]*?\bonclick\s*=/i.test(header[0])) {
        problemas.push(`${rel}: onclick remanescente no header`);
    }
}

console.log(`HTML processados: ${resumo.arquivos}`);
console.log(`Skip links adicionados: ${resumo.skip}`);
console.log(`Main com id/tabindex: ${resumo.main}`);
console.log(`Headers atualizados: ${resumo.header}`);
console.log(`Gatilhos convertidos em botões: ${resumo.triggers}`);
console.log(`onclick removidos do header: ${resumo.onclicks}`);

if (problemas.length) {
    console.error('\nProblemas encontrados:');
    for (const p of problemas.slice(0, 20)) console.error('- ' + p);
    if (problemas.length > 20) console.error(`... e mais ${problemas.length - 20}`);
    process.exit(1);
}
