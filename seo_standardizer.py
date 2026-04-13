import os
import re

DOMAIN = "https://portaldascontas.com.br"

def clean_url_path(path):
    path = path.replace("\\", "/")
    if path.endswith("index.html"):
        path = path[:-10]
    elif path.endswith(".html"):
        path = path[:-5]
    
    if not path.startswith("/"):
        path = "/" + path
    
    if len(path) > 1 and path.endswith("/"):
        path = path[:-1]
        
    return path

def standardize_url(url):
    # Ignore external, mailto, tel, anchors
    if url.startswith(('mailto:', 'tel:', '#', 'javascript:')):
        return url
    
    if url.startswith('http'):
        if DOMAIN in url or "www.portaldascontas.com.br" in url:
            # Standardize domain
            url = url.replace("http://", "https://").replace("www.", "")
            # Standardize path
            parts = url.split(DOMAIN)
            if len(parts) > 1:
                url = DOMAIN + clean_url_path(parts[1])
        return url
    
    # Internal paths
    return clean_url_path(url)

def process_file(file_path):
    rel_from_root = os.path.relpath(file_path, ".").replace("\\", "/")
    public_path = clean_url_path(rel_from_root)
    canonical_url = f"{DOMAIN}{public_path}"
    
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Canonical
    content = re.sub(r'<link rel=["\']canonical["\'] href=["\'][^"\']*["\']\s*/?>', '', content, flags=re.I)
    canonical_tag = f'<link rel="canonical" href="{canonical_url}">'
    if re.search(r'<head>', content, re.I):
        content = re.sub(r'(<head>)', r'\1\n    ' + canonical_tag, content, count=1, flags=re.I)
    elif re.search(r'</head>', content, re.I):
        content = re.sub(r'(</head>)', r'    ' + canonical_tag + r'\n\1', content, count=1, flags=re.I)

    # 2. General href replacement (a, link)
    def href_replacer(match):
        attr = match.group(1)
        url = match.group(2).strip()
        quote = match.group(3)
        return f'{attr}{standardize_url(url)}{quote}'

    # Target href, og:url, data-url, and schema.org @id/url
    content = re.sub(r'(href=["\'])([^"\']+)(["\'])', href_replacer, content)
    content = re.sub(r'(property=["\']og:url["\'] content=["\'])([^"\']+)(["\'])', href_replacer, content)
    content = re.sub(r'(data-url=["\'])([^"\']+)(["\'])', href_replacer, content)
    
    # 3. JSON-LD / Schema.org
    def json_url_replacer(match):
        key = match.group(1)
        url = match.group(2).strip()
        return f'{key}{standardize_url(url)}'
    
    content = re.sub(r'("@id":\s*")([^"]+)"', json_url_replacer, content)
    content = re.sub(r'("url":\s*")([^"]+)"', json_url_replacer, content)
    content = re.sub(r'("item":\s*")([^"]+)"', json_url_replacer, content)

    # 4. HTTPS and non-www cleanup
    content = content.replace("http://portaldascontas.com.br", DOMAIN)
    content = content.replace("https://www.portaldascontas.com.br", DOMAIN)
    content = content.replace("http://www.portaldascontas.com.br", DOMAIN)
    
    # 5. robots
    if not re.search(r'<meta name=["\']robots["\']', content, re.I) and "busca.html" not in file_path:
         content = re.sub(r'(<head>)', r'\1\n    <meta name="robots" content="index, follow">', content, count=1, flags=re.I)

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

def main():
    skip_dirs = [".git", "node_modules", "pagefind", "js", "css", "imgs", ".vscode"]
    for root, dirs, files in os.walk("."):
        dirs = [d for d in dirs if d not in skip_dirs]
        for file in files:
            if file.endswith(".html"):
                process_file(os.path.join(root, file))
    print("SEO Standardization Complete (V2).")

if __name__ == "__main__":
    main()
