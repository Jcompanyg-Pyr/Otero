# Instrucciones comunes para ampliar la biblioteca de Otero

Otero es una app personal (PWA en español) para entender la naturaleza en la montaña española: qué árbol, animal,
roca o fenómeno tienes delante y por qué está ahí. El usuario quiere un catálogo AMPLIO de especies reales de todas
las sierras de España, no solo Teruel y Pirineo, con fichas que se puedan buscar por rasgos («hoja rojiza»,
«fruto rojo», «junto al río», «serpiente con pupila vertical»...).

Raíz del proyecto: el directorio que contiene este archivo en tools/ (rutas relativas a esa raíz).

## Reglas de calidad (obligatorias)
- Solo datos que sepas con seguridad. Nada inventado. Cifras con «unos», «hasta», rangos. Si dudas, omite el campo.
- Especies reales presentes en España de forma natural (o naturalizadas muy comunes: indícalo en «hab»).
- Nombre científico aceptado actual. Nombre común en castellano habitual en España; otros nombres en «alt_n»
  (puedes indicar idioma: «(cat.)», «(gall.)», «(eusk.)», «(arag.)», «(ast.)»).
- Zonas «r» y altitudes «alt» realistas para España. Las zonas se comprueban con GBIF: ver abajo.
- Texto divulgativo y preciso, en español de España, sin tecnicismos innecesarios, tono como las fichas existentes.
  Cada ficha: «idf» (cómo reconocerlo, 2-4 frases con los rasgos clave), «hab» (dónde vive, 1-2 frases),
  «cur» (una curiosidad cierta y llamativa), y cuando aporte: «beh», «tec», «sim» (con qué se confunde y cómo
  distinguirlo: MUY útil), «prot» (protección/amenaza solo si estás seguro).
- Rasgos «t»: usa EXCLUSIVAMENTE claves y valores de content/traits.js (TRAITS del grupo y HABITATS en t.hab).
  Pon todos los valores que encajen. Son la base del buscador por rasgos: sé generoso y preciso.
- «sub» de SUBS en content/traits.js. «mes»: meses (1-12) en que se ve/florece/vuela/canta, si tiene sentido.
- ids únicos en toda la biblioteca: minúsculas sin tildes con guiones, descriptivos (p. ej. «pino-silvestre»).
  Mira los ids existentes en content/species/*.js antes de inventar uno.
- Formato: literal JavaScript igual que las fichas existentes, comillas simples; si un texto lleva apóstrofo,
  escápalo (\') o usa comillas dobles. Sin HTML dentro de las fichas de especies.
- NO toques archivos de otros grupos ni de código (js/). Solo los archivos que te asignen.

## Comprobación (obligatoria antes de terminar)
  ruby -Eutf-8:utf-8 tools/validar.rb <tu-archivo>            → formato, vocabulario, ids
  ruby -Eutf-8:utf-8 tools/validar.rb <tu-archivo> --gbif     → además GBIF: nombre aceptado y registros por zona
(python/node/git no funcionan en este Mac; ruby y curl sí. Ejecuta los comandos desde la raíz del proyecto, con
 LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8.)
Con --gbif tarda (unos segundos por ficha): puedes pasarlo por tandas con --solo-nuevas id1,id2,...
Corrige TODO lo que salga: si una zona da 0 registros en GBIF, quítala salvo que estés completamente seguro (y
entonces explícalo en tu informe). «meseta» y «litoral» no se comprueban: úsalas con cuidado. Si GBIF dice que el
nombre es sinónimo, usa el aceptado salvo que el usado en España sea claramente otro (dilo en el informe).

## Informe final (breve, en español)
Cuántas fichas había, cuántas añadidas, cuántas existentes mejoradas, resultado final del validador con --gbif,
y cualquier duda o dato que no hayas podido comprobar.
