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
