#!/usr/bin/env python3
"""
Servidor local de desarrollo y CMS para jrr.petciclo.cl.
Sirve los archivos estáticos y expone endpoints para guardar páginas y subir imágenes.
"""
import json
import mimetypes
import re
import time
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

ROOT = Path(__file__).parent
UPLOAD_DIR = ROOT / "public" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

EDITABLE = [
    "home.html",
    "bio.html",
    "curriculum.html",
    "blog.html",
    "tools.html",
    "newsletter.html",
    "contacto.html",
    "menu.html",
    "top.html",
    "footer.html",
]


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        print(f"[{self.log_date_time_string()}] {fmt % args}")

    def send_json(self, data, status=200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/api/pages":
            self.send_json({"pages": EDITABLE})
            return
        if self.path == "/":
            self.path = "/index.html"
        return super().do_GET()

    def do_POST(self):
        if self.path == "/api/save":
            self.handle_save()
        elif self.path == "/api/upload":
            self.handle_upload()
        else:
            self.send_error(404)

    def handle_save(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            filename = payload.get("file", "")
            body_html = payload.get("body", "")

            if filename not in EDITABLE:
                self.send_json({"error": "archivo no editable"}, 400)
                return

            path = ROOT / filename
            if not path.exists():
                self.send_json({"error": "archivo no existe"}, 404)
                return

            text = path.read_text(encoding="utf-8")
            new_text = re.sub(
                r"(<body[^>]*>).*?(</body>)",
                r"\1\n" + body_html + r"\n\2",
                text,
                count=1,
                flags=re.DOTALL | re.IGNORECASE,
            )
            path.write_text(new_text, encoding="utf-8")
            self.send_json({"ok": True})
        except Exception as e:
            self.send_json({"error": str(e)}, 500)

    def handle_upload(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            content_type = self.headers.get("Content-Type", "application/octet-stream")
            data = self.rfile.read(length)

            if not data:
                self.send_json({"error": "no data"}, 400)
                return

            ext = mimetypes.guess_extension(content_type) or ".bin"
            if ext == ".bin":
                ext = ".png"
            name = f"{int(time.time() * 1000)}{ext}"
            filepath = UPLOAD_DIR / name
            filepath.write_bytes(data)
            url = f"public/uploads/{name}"
            self.send_json({"url": url})
        except Exception as e:
            self.send_json({"error": str(e)}, 500)


if __name__ == "__main__":
    port = 8931
    server = HTTPServer(("0.0.0.0", port), Handler)
    print(f"Servidor en http://localhost:{port}")
    print("Presiona Ctrl+C para detener.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nDeteniendo...")
