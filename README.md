# CESS NITAP website (dynamic 3D version)

Official site of the Civil Engineering Student Society, NIT Arunachal Pradesh.
Same sections as the earlier site (hero, about, mission, messages, team, gallery), now driven by data and with 3D.

## What changed
- **3D hero:** a Three.js truss bridge assembles itself on load. Drag to turn it; it also follows the mouse and the page scroll.
- **Dynamic content:** every section is rendered from `data/site.json`. Add a member, event or photo by editing that file. No HTML changes needed.
- **Events filter** by type, **animated counters**, **3D tilt** on cards, **3D rotating gallery** ring.
- Respects reduced-motion settings and falls back gracefully if WebGL is unavailable.

## Structure
```
index.html
css/style.css
js/main.js      content rendering, gallery, filters, tilt
js/scene.js     Three.js bridge
data/site.json  ALL editable content
photos/         copy the photos folder from the old repo (same file names)
.htaccess       Apache config for the college server
```

## Setup
1. Copy the `photos/` folder (and `CESS_logo.png`, `NIT_AP_logo.jpg`) from the old repo into this one.
2. Run locally (must use a server, not double-click):
   `python3 -m http.server 8000` then open http://localhost:8000
3. Paste the full Director, HOD, Advisor and President messages into `data/site.json` if you want the complete text (the file holds shortened versions).

## Hosting on the NIT AP server
Upload everything to the web root (or a subfolder) over SFTP/cPanel. It is a plain static site: no Node or build step. `.htaccess` assumes Apache; for Nginx, ask the server admin to enable gzip and serve `.json` as `application/json`.

**If the server blocks external CDNs:** download `https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js` to `vendor/three.module.js` and change the import map in `index.html` to `"three": "./vendor/three.module.js"`. Fonts then fall back to system fonts, or download them too.

## Updating via Git
```
git add . && git commit -m "Update events" && git push
```


## Futuristic visual upgrade
The existing HTML/CSS/JavaScript architecture has been preserved. The updated stylesheet adds a dark navy/cyan engineering theme, glassy navigation, grid backgrounds, refined event/team cards, and responsive layouts. `js/scene.js` keeps the interactive Three.js bridge and recolors it to cyan/steel with a technical ground grid. `data/site.json` remains the source for public content.

**Note:** This is a data-driven static website, not yet a PHP/MongoDB-backed CMS. The ZIP originally supplied did not include the actual photographs under `photos/`; restore those image files to show real society photos. A visual placeholder appears when a referenced photo is missing. Admin login and database editing require a separate backend implementation.
