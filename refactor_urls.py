import hashlib
import json
import os
import posixpath
import re
from pathlib import Path, PurePosixPath

DOMAIN = "https://portaldascontas.com.br"
ROOT = Path(".")
SKIP_DIRS = {".git", ".vscode", "node_modules", "pagefind", "imgs"}
HTML_GLOBS = ["*.html", "artigos/**/*.html", "calculadoras/**/*.html", "paginas/**/*.html"]
ARTICLE_CATEGORIES = ["financas", "saude", "comparacao", "calculaveis", "utilitarios"]
NOINDEX_PATHS = {"/busca", "/meus-calculos"}


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
    if not path:
        return "/"
    path = path.replace("\\", "/")
    if not path.startswith("/"):
        path = "/" + path
    path = posixpath.normpath(path)
    if not path.startswith("/"):
        path = "/" + path
    return path


def is_external(url: str) -> bool:
    return bool(re.match(r"^(?:[a-z]+:)?//", url, re.I)) and DOMAIN not in url and "portaldascontas.com.br" not in url


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
    path = path.replace("/calculadoras/calculadoras/", "/calculadoras/")
    match = re.match(r"^/artigos/[^/]+/calculadoras/([^/]+?)(?:\.html)?$", path)
    if match:
        return f"/calculadoras/{match.group(1)}"
    return clean_site_path(path)


def normalize_site_url(raw_url: str, current_file: Path) -> str:
    raw_url = raw_url.strip()
    if not raw_url or raw_url.startswith(("#", "mailto:", "tel:", "javascript:")):
        return raw_url
    if is_external(raw_url):
        return raw_url

    query_fragment = ""
    if DOMAIN in raw_url or "portaldascontas.com.br" in raw_url:
        absolute = raw_url.replace("http://", "https://").replace("https://www.", "https://").replace("http://www.", "https://")
        path = absolute.split("portaldascontas.com.br", 1)[1] or "/"
        path, query, fragment = split_url(path)
        query_fragment = f"{query}{fragment}"
        return f"{DOMAIN}{normalize_known_legacy_path(path)}{query_fragment}"

    path, query, fragment = split_url(raw_url)
    current_dir = "/" + rel_posix(current_file.parent)
    resolved = normalize_path(posixpath.join(current_dir, path))
    normalized = normalize_known_legacy_path(resolved)

    # Keep local asset references if they clearly target static files.
    ext = PurePosixPath(path).suffix.lower()
    if ext and ext not in {".html"}:
        return f"{normalize_path(resolved)}{query}{fragment}"

    return f"{normalized}{query}{fragment}"


def replace_attr_urls(content: str, attr_names, current_file: Path) -> str:
    attrs = "|".join(re.escape(attr) for attr in attr_names)
    pattern = re.compile(rf'((?:{attrs})\s*=\s*)(["\'])([^"\']+)(\2)', re.I)

    def repl(match):
        prefix, quote, url, _ = match.groups()
        return f"{prefix}{quote}{normalize_site_url(url, current_file)}{quote}"

    return pattern.sub(repl, content)


def replace_meta_url_content(content: str, current_file: Path) -> str:
    pattern = re.compile(
        r'(<meta[^>]+(?:property|name)=["\'](?:og:url|twitter:url)["\'][^>]+content=["\'])([^"\']+)(["\'][^>]*>)',
        re.I,
    )

    def repl(match):
        prefix, url, suffix = match.groups()
        return f"{prefix}{normalize_site_url(url, current_file)}{suffix}"

    return pattern.sub(repl, content)


def replace_json_ld_urls(content: str, current_file: Path) -> str:
    pattern = re.compile(r'("(?:(?:@id)|url|item|contentUrl|mainEntityOfPage)"\s*:\s*")([^"]+)(")')

    def repl(match):
        prefix, url, suffix = match.groups()
        return f"{prefix}{normalize_site_url(url, current_file)}{suffix}"

    return pattern.sub(repl, content)


def normalize_canonical_and_robots(content: str, canonical_url: str, is_search_page: bool) -> str:
    content = re.sub(r'\s*<link[^>]+rel=["\']canonical["\'][^>]*>\s*', "\n", content, flags=re.I)
    content = re.sub(r'(<head[^>]*>)', rf'\1{os.linesep}    <link rel="canonical" href="{canonical_url}">', content, count=1, flags=re.I)

    robots_value = "noindex, follow" if is_search_page else "index, follow"
    if re.search(r'<meta[^>]+name=["\']robots["\']', content, re.I):
        content = re.sub(
            r'(<meta[^>]+name=["\']robots["\'][^>]+content=["\'])([^"\']*)(["\'][^>]*>)',
            rf'\1{robots_value}\3',
            content,
            flags=re.I,
        )
    else:
        content = re.sub(r'(<head[^>]*>)', rf'\1{os.linesep}    <meta name="robots" content="{robots_value}">', content, count=1, flags=re.I)
    return content


def file_signature(path: Path) -> str:
    text = path.read_text(encoding="utf-8", errors="ignore")
    body = re.sub(r"\s+", " ", re.sub(r"<head[\s\S]*?</head>", "", text, flags=re.I)).strip()
    return hashlib.sha1(body.encode("utf-8", errors="ignore")).hexdigest()


def build_redirects(files):
    redirects = [
        "# Canonical redirects generated by refactor_urls.py",
        "http://www.portaldascontas.com.br/* https://portaldascontas.com.br/:splat 301!",
        "https://www.portaldascontas.com.br/* https://portaldascontas.com.br/:splat 301!",
        "http://portaldascontas.com.br/* https://portaldascontas.com.br/:splat 301!",
        "/index.html / 301",
        "/calculadoras/calc-juros /calculadoras/juros 301",
        "/calculadoras/calc-juros.html /calculadoras/juros 301",
    ]
    seen = set()

    def add(source: str, target: str):
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

        if clean != "/" and clean.endswith("/index"):
            add(clean, clean[:-6] or "/")

        if path.parts and path.parts[0] == "calculadoras":
            slug = path.stem
            add(f"/calculadoras/calculadoras/{slug}.html", clean)
            add(f"/calculadoras/calculadoras/{slug}", clean)
            for category in ARTICLE_CATEGORIES:
                add(f"/artigos/{category}/calculadoras/{slug}.html", clean)
                add(f"/artigos/{category}/calculadoras/{slug}", clean)

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

        lastmod = path.stat().st_mtime
        entries.append(
            "    <url>\n"
            f"        <loc>{DOMAIN}{public_path}</loc>\n"
            f"        <lastmod>{__import__('datetime').datetime.fromtimestamp(lastmod).strftime('%Y-%m-%d')}</lastmod>\n"
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


def main():
    html_files = sorted(iter_html_files(), key=lambda p: rel_posix(p))
    report = {
        "updated_files": [],
        "url_mappings": {},
        "legacy_redirect_examples": [],
        "duplicate_signatures": {},
    }

    signatures = {}
    for path in html_files:
        rel = rel_posix(path)
        public_path = public_path_for_file(path)
        canonical_url = f"{DOMAIN}{public_path}"
        original = path.read_text(encoding="utf-8", errors="ignore")
        updated = original
        updated = normalize_canonical_and_robots(updated, canonical_url, public_path in NOINDEX_PATHS)
        updated = replace_attr_urls(updated, ["href", "data-url"], path)
        updated = replace_meta_url_content(updated, path)
        updated = replace_json_ld_urls(updated, path)
        updated = updated.replace("http://portaldascontas.com.br", DOMAIN)
        updated = updated.replace("https://www.portaldascontas.com.br", DOMAIN)
        updated = updated.replace("http://www.portaldascontas.com.br", DOMAIN)

        if updated != original:
            path.write_text(updated, encoding="utf-8")
            report["updated_files"].append(rel)

        report["url_mappings"]["/" + rel] = public_path
        signatures.setdefault(file_signature(path), []).append(rel)

    Path("_redirects").write_text(build_redirects(html_files), encoding="utf-8")
    Path("sitemap.xml").write_text(generate_sitemap(html_files), encoding="utf-8")
    report["updated_files"].extend(["_redirects", "sitemap.xml"])

    report["legacy_redirect_examples"] = [
        ["/artigos/financas/calculadoras/juros.html", "/calculadoras/juros"],
        ["/artigos/saude/calculadoras/juros.html", "/calculadoras/juros"],
        ["/calculadoras/calculadoras/salario.html", "/calculadoras/salario"],
    ]
    report["duplicate_signatures"] = {
        sig: files for sig, files in signatures.items() if len(files) > 1
    }

    Path("seo-url-refactor-report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    md_lines = [
        "# Relatorio de Refatoracao de URLs",
        "",
        "## Alteracoes realizadas",
        "",
        f"- HTMLs processados: {len(html_files)}",
        f"- Arquivos atualizados: {len(report['updated_files'])}",
        f"- URLs antigas mapeadas: {len(report['url_mappings'])}",
        "- Redirecionamentos 301 gerados em `_redirects` para todas as URLs `.html` e legados de calculadoras.",
        "- Canonical absoluta aplicada para a URL final sem `.html`.",
        "- Sitemap regenerado somente com URLs finais.",
        "",
        "## Exemplos de redirecionamento",
        "",
    ]
    for source, target in report["legacy_redirect_examples"]:
        md_lines.append(f"- `{source}` -> `{target}`")
    md_lines.extend([
        "",
        "## Problemas encontrados",
        "",
        "- Canonicals divergentes entre páginas reais e URLs antigas.",
        "- Referências internas para `.html` e caminhos legados de calculadoras.",
        "- Padrões históricos de duplicação em `/artigos/{categoria}/calculadoras/{slug}` e `/calculadoras/calculadoras/{slug}`.",
        "",
        "## Arquivos modificados",
        "",
    ])
    for file_path in report["updated_files"]:
        md_lines.append(f"- `{file_path}`")
    Path("seo-url-refactor-report.md").write_text("\n".join(md_lines) + "\n", encoding="utf-8")
    print(f"Processed {len(html_files)} HTML files.")


if __name__ == "__main__":
    main()
