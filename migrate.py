import os
import re

def update_html(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return

    original_content = content

    # 1. Add gerar-header.js to <head> if not present
    if '/js/gerar-header.js' not in content:
        script_tag = '    <script type="module" src="/js/gerar-header.js"></script>\n'
        content = content.replace('</head>', f'{script_tag}</head>')

    # 2. Replace overlay and header
    # Remove overlay
    content = re.sub(r'<!-- Overlay Mobile -->\s*<div[^>]*class="overlay"[^>]*></div>', '', content, flags=re.IGNORECASE | re.DOTALL)
    content = re.sub(r'<div[^>]*class="overlay"[^>]*></div>', '', content, flags=re.IGNORECASE | re.DOTALL)
    
    # Replace header block
    # Pattern: <header ... class="header topo" ...> ... </header>
    header_pattern = re.compile(r'<!-- HEADER PADRÃO[^>]*-->\s*<header[^>]*class="header topo"[^>]*>.*?</header>', re.DOTALL | re.IGNORECASE)
    if header_pattern.search(content):
        content = header_pattern.sub('<div id="header-container"></div>', content)
    else:
        # Fallback to just the header tag if no comment
        content = re.sub(r'<header[^>]*class="header topo"[^>]*>.*?</header>', '<div id="header-container"></div>', content, flags=re.DOTALL | re.IGNORECASE)

    # 3. Remove redundant scripts
    scripts_to_remove = [
        r'<script[^>]*src=["\'][^"\']*/js/theme.js["\'][^>]*></script>',
        r'<script[^>]*src=["\'][^"\']*/js/dropdown.js["\'][^>]*></script>',
        r'<script[^>]*src=["\'][^"\']*/js/menu.js["\'][^>]*></script>'
    ]
    
    for script_p in scripts_to_remove:
        content = re.sub(script_p, '', content, flags=re.IGNORECASE)

    if content != original_content:
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Successfully updated: {filepath}")
        except Exception as e:
            print(f"Error writing {filepath}: {e}")
    else:
        print(f"No changes needed for: {filepath}")

def main():
    # Use current directory
    base_dir = os.getcwd()
    print(f"Working in: {base_dir}")
    
    # Calculadoras
    calc_dir = os.path.join(base_dir, 'calculadoras')
    if os.path.exists(calc_dir):
        for filename in os.listdir(calc_dir):
            if filename.endswith('.html'):
                update_html(os.path.join(calc_dir, filename))
            
    # Artigos Saude
    saude_dir = os.path.join(base_dir, 'artigos', 'saude')
    if os.path.exists(saude_dir):
        for filename in os.listdir(saude_dir):
            if filename.endswith('.html'):
                update_html(os.path.join(saude_dir, filename))

if __name__ == '__main__':
    main()
