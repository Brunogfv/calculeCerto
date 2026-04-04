import xml.etree.ElementTree as ET
import os

def regenerate_sitemap(sitemap_path):
    # Base URL preferred by user
    base_url = "https://portaldascontas.com.br/"
    
    # Namespaces
    ET.register_namespace('', "http://www.sitemaps.org/schemas/sitemap/0.9")
    
    tree = ET.parse(sitemap_path)
    root = tree.getroot()
    
    ns = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    
    urls_seen = set()
    to_remove = []
    
    for url in root.findall('ns:url', ns):
        loc = url.find('ns:loc', ns)
        if loc is not None:
            original = loc.text
            # Standardize URL
            clean = original.replace("www.", "").strip()
            
            # Ensure it starts with the correct base
            if not clean.startswith(base_url):
                clean = base_url + clean.split("/", 3)[-1]
            
            # Ensure .html for everything except root or directory-like paths
            path = clean.replace(base_url, "")
            if path and not path.endswith("/") and not path.endswith(".html"):
                clean += ".html"
            
            # Special case for core articles/calculators that might have been indexed without .html
            # (already covered by the above)
            
            # Handle root/index.html
            if clean.endswith("/index.html"):
                clean = clean.replace("index.html", "")
            
            if clean in urls_seen:
                to_remove.append(url)
            else:
                loc.text = clean
                urls_seen.add(clean)
                
    for url in to_remove:
        root.remove(url)
        
    tree.write(sitemap_path, encoding='UTF-8', xml_declaration=True)
    print(f"Sitemap regenerado com {len(urls_seen)} URLs.")

if __name__ == "__main__":
    regenerate_sitemap("sitemap.xml")
