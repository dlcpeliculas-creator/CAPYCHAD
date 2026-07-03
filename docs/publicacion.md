# Publicar CAPYCHAD — guía en llano (una sola vez, ~30 minutos)

Tres piezas: el **repo** (código + CI), los **Releases** (el instalador que descarga la gente)
y **Pages** (la landing). Todo gratis en GitHub.

## 1. Crear el repo y subir el código

1. En github.com (logueado como **TRUEGOTDF**): botón **New** → nombre `capychad` → **Private** por ahora (lo abrís cuando quieras; la licencia FSL ya contempla "código visible") → Create.
2. En tu PC, en la carpeta `CAPYCHAD 2.0` (PowerShell):
   ```powershell
   git init
   git add .
   git commit -m "CAPYCHAD 2.0 — base del test de validación"
   git branch -M main
   git remote add origin https://github.com/TRUEGOTDF/capychad.git
   git push -u origin main
   ```
   Si `git` no está instalado: [git-scm.com](https://git-scm.com/download/win), instalación por defecto.
3. Antes del primer `git add .`, creá un `.gitignore` con estas líneas (para no subir 200 MB):
   ```
   node_modules/
   dist/
   apps/desktop/capy.bundle.js
   apps/web/capy.bundle.js
   packages/core/vendor-v1/
   ```
   (El vendor no se sube: se regenera con `npm run sync`. Quien clone corre `sync` + `build:web`.)

> ⚠️ **OneDrive y git no se llevan bien** (ya lo sufrimos en esta sesión). Al subir a GitHub,
> lo sano es MOVER la carpeta fuera de OneDrive (p. ej. `C:\dev\capychad`) — GitHub pasa a ser
> tu respaldo real y OneDrive deja de pelear con `node_modules` y archivos a medio sincronizar.

## 2. El instalador en Releases

1. `npm run dist` → queda `dist/CAPYCHAD-Setup-0.1.0.exe` (+ zip y checksums si corrés el script).
2. En GitHub: **Releases → Draft a new release** → tag `v0.1.0` → título "CAPYCHAD 0.1.0 — release de validación" → arrastrá el Setup y el zip → **Publish**.
3. El link "Descargar para Windows" de la landing (bloque CONFIG) apunta a:
   `https://github.com/TRUEGOTDF/capychad/releases/latest`
4. El auto-update ya está configurado hacia este repo (package.json → build.publish).

## 3. La landing en GitHub Pages

1. Repo → **Settings → Pages** → Source: "Deploy from a branch" → Branch `main`, carpeta `/landing`… si no aparece la opción de subcarpeta `landing`, alternativa de 2 minutos: [Netlify Drop](https://app.netlify.com/drop) — arrastrás la carpeta `landing` y te da URL pública al instante.
2. Antes de publicar, completá el bloque **CONFIG** de `landing/index.html`: los 3 links de MercadoPago, tu email y el link de Releases del paso 2.
3. Pegá la URL final en los mensajes de outreach (`docs/test/mensajes-outreach.md`).

## 4. Después del push (automático)

- Cada push corre el CI cuando lo agreguemos al repo 2.0 (el workflow de la v1 sirve de molde — pedímelo y lo adapto en 5 minutos).
- SmartScreen va a avisar "aplicación desconocida" en las primeras descargas: las instrucciones para el usuario están en `docs/lanzador.md` § SmartScreen (y el plan de firma al validar).
