// Regiones naturales con una explicación de su paisaje. Se eligen por coordenadas (aproximadas).
export const REGIONS = [
  {
    id: 'gudar', name: 'Sierra de Gúdar', group: 'iberico', box: { s: 40.18, n: 40.56, w: -0.92, e: -0.33 },
    summary: 'Macizo del Sistema Ibérico turolense que culmina en Peñarroya, algo por encima de los 2.000 m. Calizas y margas del Jurásico y Cretácico, plegadas con suavidad y arrasadas por una erosión muy larga: por eso predominan las muelas, lomas amplias y altiplanos, cortados por barrancos profundos (Valbona, Linares, Alcalá…).',
    climate: 'Clima mediterráneo de montaña muy continental: inviernos largos y fríos, heladas casi seguras de octubre a mayo en las partes altas y frecuentes inversiones térmicas en los fondos de valle y hoyas.',
    veg: 'Carrascales y quejigares abajo; pinares de pino negral (laricio) en las laderas medias; pino silvestre, sabina rastrera y enebro en las partes altas. En barrancos umbríos aparecen acebos, tejos y serbales.',
    articles: ['picos-lomas', 'pisos', 'inversion', 'continentalidad', 'karst'],
  },
  {
    id: 'javalambre', name: 'Sierra de Javalambre', group: 'iberico', box: { s: 39.92, n: 40.18, w: -1.2, e: -0.72 },
    summary: 'El otro gran macizo del sur de Teruel, con el pico Javalambre en torno a los 2.000 m. Domina la caliza jurásica en grandes superficies casi planas en las cumbres (la «muela»), con dolinas y formas de karst, y laderas con canchales formados por el hielo.',
    climate: 'Uno de los puntos más fríos del Sistema Ibérico. En las cumbres hay fenómenos periglaciares: el hielo rompe la roca y ordena los derrubios, pero no hubo glaciares que excavaran circos.',
    veg: 'Sabinares rastreros y pinares de pino silvestre en las cumbres; pino negral, sabina albar y carrasca en las partes bajas y parameras.',
    articles: ['picos-lomas', 'karst', 'glaciares', 'pisos', 'continentalidad'],
  },
  {
    id: 'maestrazgo', name: 'Maestrazgo', group: 'iberico', box: { s: 40.4, n: 40.95, w: -0.6, e: 0.25 },
    summary: 'Relieve de muelas y cañones excavados en calizas del Cretácico, con pliegues muy visibles en los cortados (es una de las mejores zonas de la península para «ver» la geología a simple vista).',
    climate: 'Mediterráneo de montaña, algo más suavizado hacia el este por la influencia marina.',
    veg: 'Pinares de pino negral y silvestre, carrascales y quejigares; sabinares en las parameras.',
    articles: ['pliegues', 'picos-lomas', 'colores'],
  },
  {
    id: 'albarracin', name: 'Sierra de Albarracín y Montes Universales', group: 'iberico', box: { s: 40.2, n: 40.65, w: -1.85, e: -1.25 },
    summary: 'Mezcla de calizas y de areniscas rojas del Triásico (el «rodeno»), que forman los pinares y abrigos rojizos tan característicos. Nacimiento del Tajo, Júcar, Cabriel y Guadalaviar muy cerca.',
    climate: 'Muy frío y continental; de las zonas con más días de helada de España.',
    veg: 'Pino rodeno (resinero) sobre arenisca, pino silvestre y negral sobre caliza, sabinares en las parameras.',
    articles: ['colores', 'continentalidad', 'pisos'],
  },
  {
    id: 'pirineo', name: 'Pirineo', group: 'pirineo', box: { s: 42.1, n: 43.25, w: -1.95, e: 3.25 },
    summary: 'Cordillera joven levantada por el choque de la placa ibérica contra la europea. En el eje (la «zona axial») afloran las rocas más antiguas: granitos, pizarras y esquistos de más de 250 millones de años. A los lados, las calizas de las Sierras Interiores y Exteriores, plegadas y cabalgadas unas sobre otras. Los glaciares del Cuaternario afilaron las cumbres y excavaron circos, ibones y valles en U.',
    climate: 'Atlántico al oeste y norte, más mediterráneo y seco hacia el este y el sur. La nieve dura de noviembre a mayo por encima de unos 1.800 m, según el año.',
    veg: 'Pisos muy marcados: robles y carrascas abajo, hayedos y abetales en las umbrías montanas, pino negro en el subalpino (hasta el límite del bosque, hacia los 2.200-2.400 m) y pastos alpinos por encima.',
    articles: ['picos-lomas', 'glaciares', 'pliegues', 'pisos', 'colores'],
  },
  {
    id: 'iberico', name: 'Sistema Ibérico', group: 'iberico', box: { s: 39.5, n: 42.2, w: -3.2, e: 0.6 },
    summary: 'Cordillera de relieve maduro, formada sobre todo por rocas sedimentarias del Mesozoico (calizas, margas, areniscas), plegadas con menos violencia que el Pirineo y muy erosionadas: muelas, parameras y sierras alargadas.',
    climate: 'Mediterráneo continentalizado: grandes contrastes entre día y noche y entre invierno y verano.',
    veg: 'Carrascales, quejigares, sabinares y pinares; en las cumbres más altas, pino silvestre y matorrales rastreros.',
    articles: ['picos-lomas', 'pisos', 'continentalidad'],
  },
];

export function regionAt(lat, lon) {
  return REGIONS.find(r => lat >= r.box.s && lat <= r.box.n && lon >= r.box.w && lon <= r.box.e) || null;
}
