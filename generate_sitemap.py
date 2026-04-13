import os
from datetime import datetime

DOMAIN = "https://portaldascontas.com.br"

def clean_url_path(path):
    path = path.replace("\\", "/")
    if path.endswith("index.html"):
        path = path[:-10]
    if path.endswith(".html"):
        path = path[:-5]
    if not path.startswith("/"):
        path = "/" + path
    if len(path) > 1 and path.endswith("/"):
        path = path[:-1]
    return path

def generate_sitemap():
    skip_dirs = [".git", "node_modules", "pagefind", "js", "css", "imgs", ".vscode"]
    sitemap_entries = []
    
    # Priority rules
    # Root: 1.0
    # articles index: 0.9
    # calculadoras/artigos: 0.8 / 0.7
    
    for root, dirs, files in os.walk("."):
        dirs[:] = [d for d in dirs if d not in skip_dirs]
        for file in files:
            if file.endswith(".html") and "404" not in file and "busca" not in file:
                path = os.path.join(root, file)
                rel_path = os.path.relpath(path, ".").replace("\\", "/")
                clean_path = clean_url_path(rel_path)
                
                url = f"{DOMAIN}{clean_path}"
                
                # Assign priority
                priority = "0.6"
                if clean_path == "/":
                    priority = "1.0"
                elif clean_path == "/artigos":
                    priority = "0.9"
                elif clean_path.startswith("/calculadoras"):
                    priority = "0.8"
                elif clean_path.startswith("/artigos"):
                    priority = "0.7"
                
                lastmod = datetime.fromtimestamp(os.path.getmtime(path)).strftime('%Y-%m-%d')
                
                entry = f"""    <url>
        <loc>{url}</loc>
        <lastmod>{lastmod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>{priority}</priority>
    </url>"""
                sitemap_entries.append(entry)

    sitemap_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{os.linesep.join(sitemap_entries)}
</urlset>"""

    with open("sitemap.xml", "w", encoding="utf-8") as f:
        f.write(sitemap_content)
    
    print(f"Sitemap generated with {len(sitemap_entries)} entries.")

if __name__ == "__main__":
    generate_sitemap()
