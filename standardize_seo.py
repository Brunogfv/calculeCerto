import os
import re

DOMAIN = "https://portaldascontas.com.br"
NOINDEX_PAGES = {"busca.html", "meus-calculos.html"}

def standardize_url(url):
    # Ignore external links, mailto, tel, anchors
    if url.startswith(('http', 'mailto:', 'tel:', '#')):
        if DOMAIN in url or "www.portaldascontas.com.br" in url:
            url = url.replace("http://", "https://").replace("www.", "")
        else:
            return url
    
    # Internal links
    if url == "/index.html" or url == "index.html":
        return "/"
    
    if url.endswith("/index.html"):
        url = url.replace("/index.html", "/")
    
    # Ensure .html extension for subpages (if not a directory or root)
    # Don't touch if it already has .html or is just /
    if url != "/" and not url.endswith("/") and not url.endswith(".html"):
        # Very basic check for files like .png, .css, etc.
        if not re.search(r'\.[a-zA-Z0-9]{2,4}(\?.*)?$', url):
            url += ".html"
            
    return url

def process_file(file_path):
    relative_path = os.path.relpath(file_path, ".").replace("\\", "/")
    
    # Determine canonical path
    if relative_path == "index.html":
        canonical_path = "/"
    else:
        # If it was in a subfolder, it's /folder/file.html
        canonical_path = "/" + relative_path
        
    canonical_url = f"{DOMAIN}{canonical_path}"
    
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Remove existing canonical tags
    content = re.sub(r'<link rel=["\']canonical["\'] href=["\'][^"\']*["\']\s*/?>', '', content, flags=re.I)
    
    # 2. Inject new canonical tag
    canonical_tag = f'<link rel="canonical" href="{canonical_url}">'
    if re.search(r'<head>', content, re.I):
        content = re.sub(r'(<head>)', r'\1\n    ' + canonical_tag, content, count=1, flags=re.I)
    elif re.search(r'</head>', content, re.I):
        content = re.sub(r'(</head>)', r'    ' + canonical_tag + r'\n\1', content, count=1, flags=re.I)

    # 3. Remove seo-helper.js script
    content = re.sub(r'<script [^>]*src=["\'][^"\']*seo-helper\.js["\'][^>]*></script>', '', content, flags=re.I)
    
    # 4. Handle internal/search pages robots (noindex)
    if any(page in relative_path for page in NOINDEX_PAGES):
        if not re.search(r'meta name=["\']robots["\']', content, re.I):
            noindex_tag = '<meta name="robots" content="noindex, follow">'
            content = re.sub(r'(<head>)', r'\1\n    ' + noindex_tag, content, count=1, flags=re.I)
        else:
            content = re.sub(r'(<meta name=["\']robots["\'] content=["\'])[^"\']*(["\'])', r'\1noindex, follow\2', content, flags=re.I)

    # 5. Standardize Internal Links (a href)
    def link_replacer(match):
        prefix = match.group(1)
        url = match.group(2)
        suffix = match.group(3)
        return f'{prefix}{standardize_url(url)}{suffix}'

    content = re.sub(r'(href=["\'])([^"\']+)(["\'])', link_replacer, content)

    # 6. Standardize src (scripts, images) - remove www and http
    def src_replacer(match):
        prefix = match.group(1)
        url = match.group(2)
        suffix = match.group(3)
        if DOMAIN in url or "www.portaldascontas.com.br" in url:
             url = url.replace("http://", "https://").replace("www.", "")
        return f'{prefix}{url}{suffix}'

    content = re.sub(r'(src=["\'])([^"\']+)(["\'])', src_replacer, content)

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    
    print(f"Processed: {file_path}")

def main():
    skip_dirs = [".git", "node_modules", "pagefind", "js", "css", "imgs"]
    for root, dirs, files in os.walk("."):
        dirs[:] = [d for d in dirs if d not in skip_dirs]
        for file in files:
            if file.endswith(".html"):
                process_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
