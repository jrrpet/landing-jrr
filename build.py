#!/usr/bin/env python3
"""
Generador del sitio plano para jrr.petciclo.cl.
Lee los fragmentos HTML de origen y produce dist/index.html (HTML simple, sin iframes).
"""
import re
from pathlib import Path

ROOT = Path(__file__).parent
DIST = ROOT / "dist"
DIST.mkdir(exist_ok=True)


def body_content(path: Path) -> str:
    text = path.read_text(encoding="utf-8")
    m = re.search(r"<body[^>]*>(.*)</body>", text, re.DOTALL | re.IGNORECASE)
    if not m:
        return text
    return m.group(1).strip()


def clean_for_dist(html: str) -> str:
    # Quita scripts de edición y zoom del HTML final
    html = re.sub(r'<script[^>]*src="(?:edit|zoom)\.js"[^>]*>\s*</script>\s*', "", html)
    # Quita el outline de modo edición si quedara
    html = re.sub(r'\s*style="outline:[^"]*"', "", html)
    return html


def build():
    header = clean_for_dist(body_content(ROOT / "top.html"))
    nav = clean_for_dist(body_content(ROOT / "menu.html"))
    footer = clean_for_dist(body_content(ROOT / "footer.html"))

    sections = [
        ("inicio", clean_for_dist(body_content(ROOT / "home.html"))),
        ("sobre mí", clean_for_dist(body_content(ROOT / "bio.html"))),
        ("currículum", clean_for_dist(body_content(ROOT / "curriculum.html"))),
        ("blog", clean_for_dist(body_content(ROOT / "blog.html"))),
        ("tools", clean_for_dist(body_content(ROOT / "tools.html"))),
        ("newsletter", clean_for_dist(body_content(ROOT / "newsletter.html"))),
        ("contactos", clean_for_dist(body_content(ROOT / "contacto.html"))),
    ]

    main_parts = []
    for title, content in sections:
        # Envuelve cada sección en un <section id="...">
        slug = title.replace(" ", "-")
        main_parts.append(f'<section id="{slug}">\n{content}\n</section>')

    main_html = "\n<hr>\n".join(main_parts)

    dist_html = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>jrr — Javier Rodríguez Ruiz</title>
  <meta name="description" content="Javier Rodríguez Ruiz — ingeniero, inventor, usuario Debian. Fundador de PETCiclo. Santiago de Chile.">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="site-header">
{header}
  </header>

  <nav class="site-nav">
{nav}
  </nav>

  <main class="site-main">
{main_html}
  </main>

  <footer class="site-footer">
{footer}
  </footer>
</body>
</html>
"""

    dist_css = """/* jrr.petciclo.cl — versión plana generada */
* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  background: #333;
  font-family: "Courier New", Courier, monospace;
  font-size: 15px;
  line-height: 1.4;
  color: #000;
}

body {
  display: grid;
  grid-template-columns: 190px 1fr;
  grid-template-rows: 96px 1fr 30px;
  grid-template-areas:
    "header header"
    "nav main"
    "footer footer";
}

.site-header {
  grid-area: header;
  background: #000;
  color: #fff;
  overflow: hidden;
}

.site-header a { color: #fff; }
.site-header a:hover { background: #fff; color: #000; }

.site-nav {
  grid-area: nav;
  background: #fff;
  border-right: 1px solid #000;
  padding: 12px;
  overflow: hidden;
}

.site-main {
  grid-area: main;
  background: #fff;
  padding: 12px;
  overflow: auto;
}

.site-footer {
  grid-area: footer;
  background: #ccc;
  border-top: 1px solid #000;
  overflow: hidden;
}

a {
  color: #000;
  text-decoration: none;
}

a:hover {
  background: #000;
  color: #fff;
}

h1 { font-size: 22px; margin: 0 0 8px; }
h2 { font-size: 17px; margin: 0 0 8px; border-bottom: 1px solid #000; padding-bottom: 3px; }
h3 { font-size: 15px; margin: 8px 0 4px; }
p { margin: 0 0 6px; }
ul { margin: 0; padding-left: 18px; }
li { margin-bottom: 3px; }

table {
  border-collapse: collapse;
  width: 100%;
  font-size: 13px;
}

th, td {
  border: 1px solid #000;
  padding: 3px 5px;
  text-align: left;
  vertical-align: top;
}

th { background: #ccc; }

blockquote {
  border-left: 2px solid #000;
  margin: 8px 0;
  padding-left: 10px;
  color: #333;
}

hr {
  border: none;
  border-top: 1px solid #000;
  margin: 12px 0;
}

@media (max-width: 700px) {
  body {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr auto;
    grid-template-areas:
      "header"
      "nav"
      "main"
      "footer";
  }
  .site-nav { border-right: none; border-bottom: 1px solid #000; }
}
"""

    (DIST / "index.html").write_text(dist_html, encoding="utf-8")
    (DIST / "styles.css").write_text(dist_css, encoding="utf-8")
    print(f"Generado: {DIST}/index.html")
    print(f"Generado: {DIST}/styles.css")


if __name__ == "__main__":
    build()
