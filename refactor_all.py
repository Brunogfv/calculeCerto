import os
import re
from pathlib import Path

# Configurações
DOMAIN = "https://portaldascontas.com.br"
ROOT = Path(".")
SKIP_DIRS = {".git", ".vscode", "node_modules", "pagefind", "imgs"}

# Mapeamento de Slugs conflitantes ou especiais
SLUG_REWRITES = {
    "/artigos/financas/hora-extra": "/artigos/financas/como-calcular-hora-extra",
    "/index": "/",
    "/index.html": "/",
}

def clean_url(url):
    # Remove o domínio se estiver presente para normalizar
    if url.startswith(DOMAIN):
        url = url[len(DOMAIN):]
    elif url.startswith("https://www.portaldascontas.com.br"):
        url = url[len("https://www.portaldascontas.com.br"):]
    elif url.startswith("http://portaldascontas.com.br"):
        url = url[len("http://portaldascontas.com.br"):]
    elif url.startswith("http://www.portaldascontas.com.br"):
        url = url[len("http://www.portaldascontas.com.br"):]

    # Divide em path, query e fragment
    match = re.match(r"^([^?#]*)(\?[^#]*)?(#.*)?$", url)
    path = match.group(1) if match else url
    query = match.group(2) if match and match.group(2) else ""
    fragment = match.group(3) if match and match.group(3) else ""

    # Normaliza o path
    if path.endswith(".html"):
        path = path[:-5]
    
    if path.endswith("/index"):
        path = path[:-5]
    
    if path == "/index":
        path = "/"

    # Aplica rewrites de slugs
    if path in SLUG_REWRITES:
        path = SLUG_REWRITES[path]
    
    # Remove barra final se não for a root
    if path != "/" and path.endswith("/"):
        path = path[:-1]
    
    return f"{path}{query}{fragment}"

def update_file_content(content):
    # 1. Atualizar href em <a> e outros atributos
    def replace_href(match):
        attr = match.group(1)
        url = match.group(2)
        if url.startswith("/") or DOMAIN in url or "portaldascontas.com.br" in url:
            new_url = clean_url(url)
            return f'{attr}="{new_url}"'
        return match.group(0)

    content = re.sub(r'(href|src|data-url)="(?!http|#|mailto|tel|javascript)([^"]+)"', replace_href, content)
    # Tratar links absolutos do domínio
    content = re.sub(rf'(href|src|data-url)="(https?://(?:www\.)?portaldascontas\.com\.br)(/[^"]*)"', 
                    lambda m: f'{m.group(1)}="{DOMAIN}{clean_url(m.group(3))}"', content)

    # 2. Atualizar Canonical
    content = re.sub(r'(<link rel="canonical" href=")([^"]+)(">)', 
                    lambda m: f'{m.group(1)}{DOMAIN}{clean_url(m.group(2))}{m.group(3)}', content)

    # 3. Atualizar Metatags (og:url, twitter:url)
    content = re.sub(r'(<meta property="og:url" content=")([^"]+)(">)', 
                    lambda m: f'{m.group(1)}{DOMAIN}{clean_url(m.group(2))}{m.group(3)}', content)
    content = re.sub(r'(<meta name="twitter:url" content=")([^"]+)(">)', 
                    lambda m: f'{m.group(1)}{DOMAIN}{clean_url(m.group(2))}{m.group(3)}', content)

    # 4. Atualizar JSON-LD
    def replace_json_url(match):
        key = match.group(1)
        url = match.group(2)
        if url.startswith("/") or DOMAIN in url or "portaldascontas.com.br" in url:
            new_url = clean_url(url)
            if new_url.startswith("/"):
                new_url = DOMAIN + new_url
            return f'"{key}": "{new_url}"'
        return match.group(0)

    content = re.sub(r'"(@id|url|item|mainEntityOfPage)":\s*"([^"]+)"', replace_json_url, content)
    
    return content

def main():
    updated_count = 0
    html_files = []
    for root, dirs, files in os.walk("."):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for file in files:
            if file.endswith(".html"):
                html_files.append(Path(root) / file)

    for path in html_files:
        print(f"Processando: {path}")
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                original = f.read()
            
            updated = update_file_content(original)
            
            if updated != original:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(updated)
                updated_count += 1
                print(f"  [OK] Atualizado")
        except Exception as e:
            print(f"  [ERRO] {e}")

    print(f"\nConcluído! {updated_count} arquivos atualizados.")

if __name__ == "__main__":
    main()
