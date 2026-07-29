# landing-jrr — Landing personal (jrr.petciclo.cl)

Landing personal de Javier R. Sitio **estático, sin build**: `index.html` +
`styles.css` vanilla. Sin dependencias, sin frameworks.

## Estructura

```
index.html   # contenido (una sola página: hero, sobre mí, proyectos, contacto)
styles.css   # tema oscuro con acento verde PETCiclo
CNAME        # dominio custom para GitHub Pages
```

## Desarrollo local

```bash
python3 -m http.server 8080
# http://localhost:8080
```

## Deploy (GitHub Pages)

1. Push a `github.com/jrrpet/landing-jrr` (repo público o Pro).
2. Settings → Pages → source: `main` / root. El archivo `CNAME` apunta a
   `jrr.petciclo.cl` (GitHub lo toma automáticamente).
3. En el DNS de `petciclo.cl` (Google Domains/Squarespace): crear registro
   `CNAME jrr → jrrpet.github.io`.
4. Activar "Enforce HTTPS" en Pages una vez propagado el DNS.

## Reglas

- Contenido en español.
- Marcar con `<!-- TODO: ... -->` los datos pendientes de confirmar
  (nombre completo, LinkedIn).
- Nada de secretos ni credenciales en el repo.
