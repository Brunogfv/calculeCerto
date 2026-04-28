from pathlib import Path

from refactor_urls import generate_sitemap, iter_html_files


if __name__ == "__main__":
    html_files = sorted(iter_html_files(), key=lambda path: path.as_posix())
    Path("sitemap.xml").write_text(generate_sitemap(html_files), encoding="utf-8")
    print("Sitemap regenerado com URLs canônicas limpas.")
