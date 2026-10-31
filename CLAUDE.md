# Otero — notas para quien modifique la app

PWA sin compilación (HTML + módulos ES + Leaflet), publicada con GitHub Pages desde la rama `main`.
El usuario no programa: explícale solo lo que necesite decidir o hacer, en palabras sencillas.

## Reglas al publicar
- **Sube `VERSION` en `sw.js` en cada publicación** (formato `AAAA.MM.DD-n`). Sin eso el iPhone no detecta la versión nueva.
- Si añades un archivo que la app necesita sin conexión, añádelo a `SHELL` en `sw.js` (`tests.html` lo comprueba).
- Abre `tests.html` (en local o publicado) y comprueba que todas las pruebas pasan antes de publicar.
- Nunca pongas claves ni secretos en el repositorio: es público. La clave de Pl@ntNet la mete el usuario y vive solo en su móvil.

## Datos del usuario
- IndexedDB `otero` (`js/db.js`): `panels`, `diary`, `measures`, `zones`, `kv` (favoritos en `kv/favorites`).
- Para cambiar la estructura: sube `VERSION` en `db.js` y añade una migración en `MIGRATIONS` que solo añada, nunca borre.
- La copia de seguridad (`settings.js`, `buildBackup`) exporta todos los almacenes salvo la clave de Pl@ntNet.

## Posiciones (no mezclarlas)
- `state.me`: posición GPS real, con `acc` (m) y `t`. La obtiene `locate()` en `js/location.js`.
- `state.lastPoint`: último lugar consultado (`src`: `gps` | `map` | `search`). No es la posición del usuario.
- El centro del mapa nunca se usa como posición.

## Fuentes de datos (gratuitas, sin clave salvo Pl@ntNet)
OpenStreetMap vía Overpass (varios servidores con relevo, `overpass()` en `sources.js`), Wikidata (picos de respaldo),
Photon y Open-Meteo Geocoding (búsqueda, municipio de respaldo), Open-Meteo (tiempo y altitud), IGME (geología España),
Macrostrat (geología fuera de España, orientativa), iNaturalist (especies observadas), IGN/IGN-F/OpenTopoMap (mapas).
Toda petición debe tener tiempo máximo y distinguir «sin datos» de «no se pudo consultar».

## Biblioteca («Saber»)
- Fichas: `content/species/<grupo>.js` (mam, ave, arb, pla, rep, anf, ins, hon) y `content/rocks.js`; formato y vocabulario de
  rasgos en `content/traits.js` (ZONAS, SUBS, TRAITS, HABITATS). Instrucciones para ampliarla: `tools/INSTRUCCIONES-CONTENIDO.md`.
- Comprobar fichas: `LANG=en_US.UTF-8 ruby -Eutf-8:utf-8 tools/validar.rb content/species/arb.js [--gbif] [--solo-nuevas id1,id2]`
  (formato, vocabulario, ids; con --gbif, nombre aceptado y registros por zona en GBIF).
- Sierras: `content/sierras.js` (la app elige la caja más pequeña que contiene el punto, `content/regions.js`).
- Explicaciones: `content/articles.js` + `content/articles/*.js`. Nombres de lugares: `content/toponimia.js`.
- «Pregúntale a Otero» (`js/catalog.js`): búsqueda sin conexión con sinónimos, rasgos, sierras, altitud e intención. No es una IA
  generativa: nunca debe inventar respuestas, solo mostrar fichas y explicaciones que encajan.
- Cuaderno de salida (`js/cuaderno.js`): Wikipedia, rutas (Waymarked Trails + API de OpenStreetMap), rocas (IGME/Macrostrat),
  especies (iNaturalist) guardados en la zona (`zone.cuaderno`).
- Sin node: para comprobar que un archivo JS es válido, `osascript -l JavaScript` sobre una copia con `export` cambiado por `var`.
