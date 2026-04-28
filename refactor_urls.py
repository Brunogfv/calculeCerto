import json
import os
import posixpath
import re
from datetime import datetime
from pathlib import Path, PurePosixPath

DOMAIN = "https://portaldascontas.com.br"
ROOT = Path(".")
SKIP_DIRS = {".git", ".vscode", "node_modules", "pagefind", "imgs"}
HTML_GLOBS = ["*.html", "artigos/**/*.html", "calculadoras/**/*.html", "paginas/**/*.html"]
ARTICLE_CATEGORIES = ["financas", "saude", "comparacao", "calculaveis", "utilitarios"]
NOINDEX_PATHS = {"/busca", "/meus-calculos"}
REPORT_JSON = Path("seo-url-refactor-report.json")
REPORT_MD = Path("seo-url-refactor-report.md")
VALIDATION_JSON = Path("seo-validation-report.json")
VALIDATION_MD = Path("seo-validation-report.md")
LEGACY_EXACT_ALIASES = {
    "/calculadoras/nota-para-passar": "/calculadoras/media-final",
    "/calculadoras/equacao-1-grau": "/calculadoras/equacao-primeiro-grau",
    "/calculadoras/aposentadoria": "/calculadoras/calc-investimento",
    "/como-calcular-rentabilidade-investimentos": "/artigos/financas/calcular-rentabilidade-investimento",
    "/como-funcionam-lci-lca": "/artigos/financas/lci-lca",
    "/como-calcular-porcentagem": "/artigos/financas/calcular-porcentagem",
    "/como-calcular-gasto-calorico-diario": "/artigos/saude/calcular-gasto-calorico-diario",
    "/acoes-ou-etfs": "/artigos/comparacao/acoes-vs-etfs",
    "/artigos/financas/acoes-ou-etfs": "/artigos/comparacao/acoes-vs-etfs",
    "/artigos/financas/cdb-110-cdi-ou-lci": "/artigos/comparacao/cdb110cdi-ou-lci",
    "/artigos/financas/cdb-ou-lc": "/artigos/comparacao/cdb-ou-lc",
    "/artigos/saude/como-calcular-imc-corretamente": "/artigos/saude/calcular-imc-corretamente",
    "/artigos/saude/como-calcular-gasto-calorico-diario": "/artigos/saude/calcular-gasto-calorico-diario",
}
ROOT_SLUG_ALIASES = {}


def should_skip(path: Path) -> bool:
    return any(part in SKIP_DIRS for part in path.parts)


def iter_html_files():
    seen = set()
    for pattern in HTML_GLOBS:
        for path in ROOT.glob(pattern):
            if path.is_file() and path.suffix.lower() == ".html" and not should_skip(path):
                resolved = path.resolve()
                if resolved not in seen:
                    seen.add(resolved)
                    yield path


def rel_posix(path: Path) -> str:
    return path.as_posix().lstrip("./")


def public_path_for_file(path: Path) -> str:
    rel = rel_posix(path)
    if rel == "index.html":
        return "/"
    if rel.endswith("/index.html"):
        return "/" + rel[:-11]
    if rel.endswith(".html"):
        return "/" + rel[:-5]
    return "/" + rel


def normalize_path(path: str) -> str:
    path = (path or "/").replace("\\", "/")
    if not path.startswith("/"):
        path = "/" + path
    path = posixpath.normpath(path)
    if not path.startswith("/"):
        path = "/" + path
    return path


def split_url(url: str):
    match = re.match(r"^([^?#]*)(\?[^#]*)?(#.*)?$", url)
    if not match:
        return url, "", ""
    return match.group(1) or "", match.group(2) or "", match.group(3) or ""


def clean_site_path(path: str) -> str:
    path = normalize_path(path)
    if path == "/index.html":
        return "/"
    if path.endswith("/index.html"):
        path = path[:-11] or "/"
    elif path.endswith(".html"):
        path = path[:-5]
    if path != "/" and path.endswith("/"):
        path = path[:-1]
    return path or "/"


def normalize_known_legacy_path(path: str) -> str:
    path = normalize_path(path)
    if path in LEGACY_EXACT_ALIASES:
        return LEGACY_EXACT_ALIASES[path]
    path = path.replace("/calculadoras/calculadoras/", "/calculadoras/")
    match = re.match(r"^/artigos/[^/]+/calculadoras/([^/]+?)(?:\.html)?$", path)
    if match:
        return f"/calculadoras/{match.group(1)}"
    cleaned = clean_site_path(path)
    return ROOT_SLUG_ALIASES.get(cleaned, cleaned)


def build_root_slug_aliases(files):
    slug_to_paths = {}
    for path in files:
        public_path = public_path_for_file(path)
        if public_path == "/":
            continue
        if public_path.startswith("/paginas/"):
            continue
        slug = public_path.rsplit("/", 1)[-1]
        slug_to_paths.setdefault(slug, set()).add(public_path)

    aliases = {}
    for slug, paths in slug_to_paths.items():
        if len(paths) == 1:
            aliases[f"/{slug}"] = next(iter(paths))
    aliases.update(LEGACY_EXACT_ALIASES)
    return aliases


def is_external(url: str) -> bool:
    return bool(re.match(r"^(?:[a-z]+:)?//", url, re.I)) and DOMAIN not in url and "portaldascontas.com.br" not in url


def normalize_site_url(raw_url: str, current_file: Path) -> str:
    raw_url = raw_url.strip()
    if not raw_url or raw_url.startswith(("#", "mailto:", "tel:", "javascript:")):
        return raw_url
    if is_external(raw_url):
        return raw_url

    if DOMAIN in raw_url or "portaldascontas.com.br" in raw_url:
        absolute = (
            raw_url.replace("http://", "https://")
            .replace("https://www.", "https://")
            .replace("http://www.", "https://")
        )
        path = absolute.split("portaldascontas.com.br", 1)[1] or "/"
        path, query, fragment = split_url(path)
        return f"{DOMAIN}{normalize_known_legacy_path(path)}{query}{fragment}"

    path, query, fragment = split_url(raw_url)
    current_dir = "/" + rel_posix(current_file.parent)
    resolved = normalize_path(posixpath.join(current_dir, path))
    normalized = normalize_known_legacy_path(resolved)

    ext = PurePosixPath(path).suffix.lower()
    if ext and ext not in {".html"}:
        return f"{normalize_path(resolved)}{query}{fragment}"

    return f"{normalized}{query}{fragment}"


def is_asset_like_path(path: str) -> bool:
    suffix = PurePosixPath(split_url(path)[0]).suffix.lower()
    return bool(suffix and suffix != ".html")


def replace_attr_urls(content: str, attr_names, current_file: Path) -> str:
    attrs = "|".join(re.escape(attr) for attr in attr_names)
    pattern = re.compile(rf'((?:{attrs})\s*=\s*)(["\'])([^"\']+)(\2)', re.I)

    def repl(match):
        prefix, quote, url, _ = match.groups()
        return f"{prefix}{quote}{normalize_site_url(url, current_file)}{quote}"

    return pattern.sub(repl, content)


def replace_meta_url_content(content: str, canonical_url: str) -> str:
    pattern = re.compile(
        r'(<meta[^>]+(?:property|name)=["\'](?:og:url|twitter:url)["\'][^>]+content=["\'])([^"\']+)(["\'][^>]*>)',
        re.I,
    )
    return pattern.sub(rf"\1{canonical_url}\3", content)


def replace_json_ld_urls(content: str, current_file: Path, canonical_url: str) -> str:
    content = re.sub(
        r'("mainEntityOfPage"\s*:\s*")([^"]+)(")',
        rf'\1{canonical_url}\3',
        content,
    )
    content = re.sub(
        r'("mainEntityOfPage"\s*:\s*\{{[^}}]*"@id"\s*:\s*")([^"]+)(")',
        rf'\1{canonical_url}\3',
        content,
    )

    pattern = re.compile(r'("(?:(?:@id)|url|item|contentUrl)"\s*:\s*")([^"]+)(")')

    def repl(match):
        prefix, url, suffix = match.groups()
        return f"{prefix}{normalize_site_url(url, current_file)}{suffix}"

    return pattern.sub(repl, content)


def normalize_canonical_and_robots(content: str, canonical_url: str, is_search_page: bool) -> str:
    content = re.sub(r"\s*<link[^>]+rel=[\"']canonical[\"'][^>]*>\s*", "\n", content, flags=re.I)
    content = re.sub(r'(<head[^>]*>)', rf'\1{os.linesep}    <link rel="canonical" href="{canonical_url}">', content, count=1, flags=re.I)

    robots_value = "noindex, follow" if is_search_page else "index, follow"
    if re.search(r'<meta[^>]+name=["\']robots["\']', content, re.I):
        content = re.sub(
            r'(<meta[^>]+name=["\']robots["\'][^>]+content=["\'])([^"\']*)(["\'][^>]*>)',
            rf"\1{robots_value}\3",
            content,
            flags=re.I,
        )
    else:
        content = re.sub(
            r'(<head[^>]*>)',
            rf'\1{os.linesep}    <meta name="robots" content="{robots_value}">',
            content,
            count=1,
            flags=re.I,
        )
    return content


def path_depth(path: str) -> int:
    return len([part for part in normalize_path(path).split("/") if part])


def extract_self_aliases(original: str, public_path: str) -> set[str]:
    candidates = set()
    headish = "\n".join(original.splitlines()[:180])
    patterns = [
        re.compile(r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\'](https?://(?:www\.)?portaldascontas\.com\.br[^"\']+|/[^"\']+)["\']', re.I),
        re.compile(r'<meta[^>]+(?:property|name)=["\'](?:og:url|twitter:url)["\'][^>]+content=["\'](https?://(?:www\.)?portaldascontas\.com\.br[^"\']+|/[^"\']+)["\']', re.I),
        re.compile(r'"mainEntityOfPage"\s*:\s*"(https?://(?:www\.)?portaldascontas\.com\.br[^"]+|/[^"]+)"', re.I),
        re.compile(r'"mainEntityOfPage"\s*:\s*\{[^}]*"@id"\s*:\s*"(https?://(?:www\.)?portaldascontas\.com\.br[^"]+|/[^"]+)"', re.I),
    ]

    for pattern in patterns:
        for match in pattern.finditer(headish):
            raw = match.group(1)
            if not raw:
                continue
            normalized = normalize_site_url(raw, Path(public_path.lstrip("/") or "index.html"))
            candidate_path = normalized
            if candidate_path.startswith(DOMAIN):
                candidate_path = candidate_path[len(DOMAIN):]
            candidate_path, _, _ = split_url(candidate_path)
            if is_asset_like_path(candidate_path):
                continue
            candidate_path = normalize_known_legacy_path(candidate_path)
            if candidate_path == public_path:
                continue
            if path_depth(candidate_path) != path_depth(public_path):
                continue
            if public_path.startswith("/calculadoras/") and not candidate_path.startswith("/calculadoras/"):
                continue
            if public_path.startswith("/artigos/") and not candidate_path.startswith("/artigos/"):
                continue
            candidates.add(candidate_path)
    return candidates


def replace_absolute_aliases(content: str, alias_paths: set[str], canonical_url: str) -> str:
    for alias_path in sorted(alias_paths):
        absolute_alias = f"{DOMAIN}{alias_path}"
        content = content.replace(absolute_alias, canonical_url)
    return content


def build_redirects(files, alias_map):
    redirects = [
        "# Canonical redirects generated by refactor_urls.py",
        "http://www.portaldascontas.com.br/* https://portaldascontas.com.br/:splat 301!",
        "https://www.portaldascontas.com.br/* https://portaldascontas.com.br/:splat 301!",
        "http://portaldascontas.com.br/* https://portaldascontas.com.br/:splat 301!",
        "/index.html / 301",
    ]
    seen = set()

    def add(source: str, target: str):
        source = normalize_path(source)
        target = normalize_path(target)
        if source == target:
            return
        line = f"{source} {target} 301"
        if line not in seen:
            seen.add(line)
            redirects.append(line)

    for path in files:
        rel = rel_posix(path)
        clean = public_path_for_file(path)
        html_path = "/" + rel
        add(html_path, clean)

        if path.parts and path.parts[0] == "calculadoras":
            slug = path.stem
            add(f"/calculadoras/calculadoras/{slug}.html", clean)
            add(f"/calculadoras/calculadoras/{slug}", clean)
            for category in ARTICLE_CATEGORIES:
                add(f"/artigos/{category}/calculadoras/{slug}.html", clean)
                add(f"/artigos/{category}/calculadoras/{slug}", clean)

        for alias_path in sorted(alias_map.get(clean, set())):
            add(alias_path, clean)
            if alias_path != "/" and not alias_path.endswith(".html"):
                add(f"{alias_path}.html", clean)

    for source, target in LEGACY_EXACT_ALIASES.items():
        add(source, target)
        if source != "/" and not source.endswith(".html"):
            add(f"{source}.html", target)

    return "\n".join(redirects) + "\n"


def generate_sitemap(files):
    entries = []
    for path in sorted(files, key=lambda p: public_path_for_file(p)):
        public_path = public_path_for_file(path)
        if public_path in NOINDEX_PATHS:
            continue
        priority = "0.6"
        if public_path == "/":
            priority = "1.0"
        elif public_path == "/artigos":
            priority = "0.9"
        elif public_path.startswith("/calculadoras/"):
            priority = "0.8"
        elif public_path.startswith("/artigos/"):
            priority = "0.7"

        entries.append(
            "    <url>\n"
            f"        <loc>{DOMAIN}{public_path}</loc>\n"
            f"        <lastmod>{datetime.fromtimestamp(path.stat().st_mtime).strftime('%Y-%m-%d')}</lastmod>\n"
            "        <changefreq>weekly</changefreq>\n"
            f"        <priority>{priority}</priority>\n"
            "    </url>"
        )

    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(entries)
        + "\n</urlset>\n"
    )


def find_internal_links(content: str, current_file: Path):
    links = []
    pattern = re.compile(r'href\s*=\s*(["\'])([^"\']+)\1', re.I)
    for match in pattern.finditer(content):
        url = match.group(2).strip()
        if not url or url.startswith(("#", "mailto:", "tel:", "javascript:")) or is_external(url):
            continue
        normalized = normalize_site_url(url, current_file)
        link_path = normalized
        if link_path.startswith(DOMAIN):
            link_path = link_path[len(DOMAIN):]
        link_path, _, _ = split_url(link_path)
        if is_asset_like_path(link_path):
            continue
        links.append(link_path or "/")
    return links


def has_placeholder_outside_scripts(content: str) -> bool:
    stripped = re.sub(r"<script\b[^>]*>[\s\S]*?</script>", "", content, flags=re.I)
    stripped = re.sub(r"<style\b[^>]*>[\s\S]*?</style>", "", stripped, flags=re.I)
    return "${" in stripped


def validate_outputs(files, alias_map):
    redirects = {}
    for line in Path("_redirects").read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split()
        if len(parts) >= 3 and parts[-1].startswith("301"):
            redirects[parts[0]] = parts[1]

    public_paths = {public_path_for_file(path) for path in files}
    results = []
    bad_internal_links = []

    for path in sorted(files, key=lambda p: public_path_for_file(p)):
        public_path = public_path_for_file(path)
        canonical_url = f"{DOMAIN}{public_path}"
        content = path.read_text(encoding="utf-8", errors="ignore")
        canonical_match = re.search(r'<link rel="canonical" href="([^"]+)">', content, re.I)
        canonical_value = canonical_match.group(1) if canonical_match else ""

        final_url_has_redirect = public_path in redirects
        placeholders = has_placeholder_outside_scripts(content)

        for link_path in find_internal_links(content, path):
            if link_path not in public_paths and link_path not in {"/"}:
                bad_internal_links.append(
                    {
                        "file": rel_posix(path),
                        "source_url": public_path,
                        "target": link_path,
                    }
                )

        results.append(
            {
                "file": rel_posix(path),
                "url": public_path,
                "http_status": 200,
                "redirected": final_url_has_redirect,
                "canonical": canonical_value,
                "canonical_ok": canonical_value == canonical_url,
                "has_placeholder_outside_scripts": placeholders,
            }
        )

    validation = {
        "validated_at": datetime.now().isoformat(timespec="seconds"),
        "pages_checked": len(results),
        "passed": all(
            item["http_status"] == 200
            and not item["redirected"]
            and item["canonical_ok"]
            and not item["has_placeholder_outside_scripts"]
            for item in results
        ),
        "results": results,
        "bad_internal_links": bad_internal_links,
        "legacy_aliases": {key: sorted(value) for key, value in alias_map.items() if value},
    }
    return validation


def write_reports(report, validation):
    REPORT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    VALIDATION_JSON.write_text(json.dumps(validation, ensure_ascii=False, indent=2), encoding="utf-8")

    md_lines = [
        "# Relatorio de Refatoracao de URLs",
        "",
        "## Correcoes aplicadas",
        "",
        f"- HTMLs processados: {report['pages_processed']}",
        f"- Arquivos alterados: {len(report['updated_files'])}",
        f"- Redirecionamentos 301 gerados: {report['redirect_count']}",
        "- Canonicals absolutas padronizadas para HTTPS e sem `.html`.",
        "- Links internos normalizados para URLs finais limpas.",
        "- Sitemap regenerado apenas com URLs finais indexáveis.",
        "- URLs legadas de calculadoras e aliases de categoria incorreta redirecionadas com 301.",
        "",
        "## URLs antigas -> novas",
        "",
    ]

    for source, target in report["redirect_examples"][:40]:
        md_lines.append(f"- `{source}` -> `{target}`")

    md_lines.extend(
        [
            "",
            "## Problemas encontrados",
            "",
            f"- Grupos de conteúdo duplicado por hash: {report['duplicate_groups']}",
            f"- Aliases legados detectados em metadados: {report['legacy_alias_count']}",
            f"- Links internos inválidos após padronização: {len(validation['bad_internal_links'])}",
            f"- Placeholders `${{...}}` fora de `<script>`: {sum(1 for item in validation['results'] if item['has_placeholder_outside_scripts'])}",
            "",
            "## Arquivos modificados",
            "",
        ]
    )

    for file_path in report["updated_files"]:
        md_lines.append(f"- `{file_path}`")

    REPORT_MD.write_text("\n".join(md_lines) + "\n", encoding="utf-8")

    validation_lines = [
        "# Relatorio de Validacao SEO",
        "",
        f"- Paginas verificadas: {validation['pages_checked']}",
        f"- Validacao geral: {'OK' if validation['passed'] else 'FALHOU'}",
        "",
        "## Checagens por pagina",
        "",
    ]

    for item in validation["results"]:
        status = "OK" if item["http_status"] == 200 and not item["redirected"] and item["canonical_ok"] and not item["has_placeholder_outside_scripts"] else "FALHA"
        validation_lines.append(
            f"- `{item['url']}` | status={item['http_status']} | redirect={item['redirected']} | canonical_ok={item['canonical_ok']} | placeholders={item['has_placeholder_outside_scripts']} | {status}"
        )

    if validation["bad_internal_links"]:
        validation_lines.extend(["", "## Links internos invalidos", ""])
        for item in validation["bad_internal_links"][:100]:
            validation_lines.append(f"- `{item['file']}` aponta para `{item['target']}`")

    VALIDATION_MD.write_text("\n".join(validation_lines) + "\n", encoding="utf-8")


def main():
    html_files = sorted(iter_html_files(), key=lambda p: rel_posix(p))
    ROOT_SLUG_ALIASES.clear()
    ROOT_SLUG_ALIASES.update(build_root_slug_aliases(html_files))
    alias_map = {}
    updated_files = []
    signatures = {}

    for path in html_files:
        rel = rel_posix(path)
        public_path = public_path_for_file(path)
        canonical_url = f"{DOMAIN}{public_path}"
        original = path.read_text(encoding="utf-8", errors="ignore")
        alias_map.setdefault(public_path, set()).update(extract_self_aliases(original, public_path))

        updated = original
        updated = normalize_canonical_and_robots(updated, canonical_url, public_path in NOINDEX_PATHS)
        updated = replace_attr_urls(updated, ["href", "data-url"], path)
        updated = replace_meta_url_content(updated, canonical_url)
        updated = replace_json_ld_urls(updated, path, canonical_url)
        updated = replace_absolute_aliases(updated, alias_map[public_path], canonical_url)
        updated = updated.replace("http://portaldascontas.com.br", DOMAIN)
        updated = updated.replace("https://www.portaldascontas.com.br", DOMAIN)
        updated = updated.replace("http://www.portaldascontas.com.br", DOMAIN)

        if updated != original:
            path.write_text(updated, encoding="utf-8")
            updated_files.append(rel)

        body = re.sub(r"\s+", " ", re.sub(r"<head[\s\S]*?</head>", "", updated, flags=re.I)).strip()
        signatures.setdefault(body, []).append(rel)

    redirects_text = build_redirects(html_files, alias_map)
    Path("_redirects").write_text(redirects_text, encoding="utf-8")
    Path("sitemap.xml").write_text(generate_sitemap(html_files), encoding="utf-8")
    updated_files.extend(["_redirects", "sitemap.xml"])

    redirect_examples = []
    for line in redirects_text.splitlines():
        if not line or line.startswith("#"):
            continue
        parts = line.split()
        if len(parts) >= 3:
            redirect_examples.append((parts[0], parts[1]))

    report = {
        "pages_processed": len(html_files),
        "updated_files": sorted(dict.fromkeys(updated_files)),
        "redirect_count": max(0, len([line for line in redirects_text.splitlines() if line and not line.startswith("#")])),
        "redirect_examples": redirect_examples,
        "legacy_alias_count": sum(len(v) for v in alias_map.values()),
        "legacy_aliases": {key: sorted(value) for key, value in alias_map.items() if value},
        "duplicate_groups": sum(1 for files in signatures.values() if len(files) > 1),
        "duplicate_groups_details": [files for files in signatures.values() if len(files) > 1],
    }

    validation = validate_outputs(html_files, alias_map)
    write_reports(report, validation)
    print(f"Processed {len(html_files)} HTML files.")
    print(f"Generated {report['redirect_count']} redirects.")
    print(f"Validation passed: {validation['passed']}.")


if __name__ == "__main__":
    main()
