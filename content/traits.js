// Vocabulario común de la biblioteca: zonas, subgrupos y rasgos.
// Lo usan las fichas (content/species/*.js, content/rocks.js), el buscador por rasgos y «Pregúntale a Otero».
// Si añades un valor nuevo, añádelo aquí: el buscador solo ofrece lo que está en esta lista.
//
// FORMATO DE UNA FICHA DE ESPECIE
// {
//   id: 'haya',                    // único en toda la biblioteca, minúsculas sin tildes, guiones
//   g: 'arb',                      // grupo (GROUPS en content/species.js)
//   sub: 'caducifolio',            // subgrupo (SUBS[g])
//   em: '🌳',                      // emoji
//   n: 'Haya',                     // nombre común en castellano (otros nombres en «alt_n»)
//   alt_n: ['Fau (cat.)', 'Fago (arag.)'],   // opcional: otros nombres comunes o regionales
//   sci: 'Fagus sylvatica',        // nombre científico aceptado
//   r: ['pirineo', 'cantabrica'],  // zonas de España donde vive de forma natural (ZONAS)
//   alt: [400, 1800],              // altitud habitual en España (m)
//   mes: [4, 5, 6],                // opcional: meses en que se ve/florece/vuela/canta (1-12)
//   t: { hoja: ['simple', 'entera'], follaje: ['caduco'], otono: ['naranja', 'pardo'], hab: ['bosque-caducifolio', 'umbria'] },
//   hab: 'Dónde vive (texto).', idf: 'Cómo reconocerlo (texto).', beh: 'Comportamiento / ecología (opcional).',
//   cur: 'Curiosidad (opcional).', tec: 'Datos: medidas, longevidad… (opcional).',
//   sim: 'Con qué se confunde y cómo distinguirlo (opcional, muy útil).',
//   prot: 'Estado de protección o amenaza, si es relevante (opcional).',
//   tox: 'mortal' | 'toxica' | 'comestible-precaucion' | 'no-comestible',   // solo hongos y plantas peligrosas
//   trk: {…}, scat: {…},           // solo mamíferos (y alguna ave): ver TRACK_TYPES/SCAT_TYPES en species.js
// }

// Zonas naturales de España (para r: [...]). Las cajas de las sierras concretas están en content/sierras.js.
export const ZONAS = {
  pirineo: 'Pirineo y Prepirineo',
  cantabrica: 'Cordillera Cantábrica y Picos de Europa',
  galaico: 'Macizo Galaico-Leonés (Ancares, Courel, Sanabria)',
  vasco: 'Montes Vascos y Navarra atlántica',
  iberico: 'Sistema Ibérico (Moncayo, Demanda, Albarracín, Gúdar, Javalambre, Cuenca)',
  central: 'Sistema Central (Gredos, Guadarrama, Ayllón, Béjar, Gata)',
  toledo: 'Montes de Toledo y Villuercas',
  morena: 'Sierra Morena',
  betica: 'Cordilleras Béticas (Sierra Nevada, Cazorla, Grazalema…)',
  catalanides: 'Sistemas Costeros Catalanes (Montseny, Montserrat, Ports)',
  meseta: 'Mesetas, parameras y depresiones del interior',
  litoral: 'Costa y litoral',
  baleares: 'Islas Baleares (Serra de Tramuntana)',
  canarias: 'Islas Canarias',
};

// Subgrupos por grupo (para «sub»)
export const SUBS = {
  mam: { ungulado: 'Ungulados (ciervos, cabras, jabalí…)', carnivoro: 'Carnívoros', roedor: 'Roedores', insectivoro: 'Insectívoros (erizos, musarañas, topos, desmán)', murcielago: 'Murciélagos', lagomorfo: 'Conejos y liebres' },
  ave: { rapaz: 'Rapaces de día', nocturna: 'Rapaces nocturnas', carroñera: 'Buitres y carroñeras', paseriforme: 'Pájaros (paseriformes)', corvido: 'Córvidos', pico: 'Pájaros carpinteros', acuatica: 'Acuáticas y de ribera', galliforme: 'Perdices, urogallos y similares', alpina: 'Especialistas de alta montaña', otra: 'Otras (palomas, cucos, abubillas…)' },
  arb: { conifera: 'Coníferas', quercinea: 'Robles, encinas y alcornoques', caducifolio: 'Otros árboles de hoja caduca', ribera: 'Árboles de ribera', perennifolio: 'Otros de hoja perenne', frutal: 'Frutales silvestres y arbolillos', arbusto: 'Arbustos', aromatica: 'Matas aromáticas', trepadora: 'Trepadoras' },
  pla: { flor: 'Flores de monte', orquidea: 'Orquídeas', alpina: 'Flora de alta montaña', endemica: 'Endemismos', medicinal: 'Medicinales y aromáticas', acuatica: 'De agua y turbera', helecho: 'Helechos', musgo: 'Musgos', bulbosa: 'Bulbosas', carnivora: 'Carnívoras' },
  rep: { serpiente: 'Serpientes', lagarto: 'Lagartos y lagartijas', eslizon: 'Eslizones y lución', salamanquesa: 'Salamanquesas', tortuga: 'Tortugas', anfisbena: 'Culebrilla ciega' },
  anf: { rana: 'Ranas', sapo: 'Sapos', salamandra: 'Salamandras', triton: 'Tritones' },
  ins: { mariposa: 'Mariposas', polilla: 'Polillas', escarabajo: 'Escarabajos', libelula: 'Libélulas y caballitos', ortoptero: 'Saltamontes, grillos y mantis', himenoptero: 'Abejas, avispas y hormigas', chinche: 'Chinches y cigarras', mosca: 'Moscas y mosquitos', aracnido: 'Arañas, escorpiones y ácaros', otro: 'Otros invertebrados (caracoles, ciempiés…)' },
  hon: { laminas: 'Setas con láminas', poros: 'Setas con poros (boletos)', otras: 'Otras formas (copas, corales, bolas, ménsulas)', liquen: 'Líquenes' },
  roc: { ignea: 'Rocas ígneas (de magma)', sedimentaria: 'Rocas sedimentarias', metamorfica: 'Rocas metamórficas', mineral: 'Minerales', fosil: 'Fósiles' },
};

// Hábitats (t.hab), comunes a todos los grupos
export const HABITATS = {
  'bosque-caducifolio': 'Bosque de hoja caduca (hayedo, robledal)', 'bosque-mediterraneo': 'Bosque mediterráneo (encinar, alcornocal)',
  pinar: 'Pinar', 'bosque-mixto': 'Bosque mixto', ribera: 'Ribera y sotos', matorral: 'Matorral', pastizal: 'Prados y pastos',
  'alta-montana': 'Alta montaña (por encima del bosque)', roquedo: 'Roquedos y cortados', canchal: 'Canchales y pedreras',
  cueva: 'Cuevas y simas', humedal: 'Humedales y turberas', 'agua-dulce': 'Ríos, lagos y charcas', cultivo: 'Campos y cultivos',
  pueblo: 'Pueblos y edificios', costa: 'Costa, acantilados y dunas', estepa: 'Estepas y parameras', umbria: 'Umbrías y barrancos húmedos',
  solana: 'Solanas secas', nieve: 'Neveros y zonas con nieve', madera: 'Madera muerta y troncos', caliza: 'Suelos calizos', silicea: 'Suelos silíceos (granito, pizarra)', yeso: 'Yesos',
};

// Rasgos por grupo: t: { clave: [valores] }. Pon todos los valores que encajen (por ejemplo dos colores).
const COLOR = { blanco: 'Blanco', negro: 'Negro', gris: 'Gris', pardo: 'Pardo / marrón', rojo: 'Rojo', naranja: 'Naranja', amarillo: 'Amarillo', verde: 'Verde', azul: 'Azul', morado: 'Morado / violeta', rosa: 'Rosa', metalico: 'Brillo metálico' };
const PATRON = { liso: 'Liso', manchas: 'Manchas o motas', rayas: 'Rayas', bandas: 'Bandas', ocelos: 'Ojos (ocelos)', reticulado: 'Reticulado' };
const ACT = { diurno: 'De día', nocturno: 'De noche', crepuscular: 'Al amanecer y anochecer' };

export const TRAITS = {
  arb: {
    porte: { label: 'Porte', opts: { arbol: 'Árbol', arbolillo: 'Arbolillo', arbusto: 'Arbusto', mata: 'Mata baja', trepadora: 'Trepadora', rastrera: 'Rastrera' } },
    hoja: { label: 'Hoja', opts: { aguja: 'Agujas', escama: 'Escamas', simple: 'Simple', compuesta: 'Compuesta (folíolos)', lobulada: 'Lobulada', palmeada: 'En forma de mano', dentada: 'Borde dentado', entera: 'Borde liso', espinosa: 'Con pinchos', acorazonada: 'En forma de corazón', estrecha: 'Estrecha o lineal', tomentosa: 'Con pelos (envés blanquecino)', sin_hojas: 'Casi sin hojas' } },
    follaje: { label: 'Follaje', opts: { perenne: 'Perenne', caduco: 'Caduco', marcescente: 'Marcescente (hojas secas en invierno)' } },
    otono: { label: 'Color en otoño', opts: { amarillo: 'Amarillo', naranja: 'Naranja', rojo: 'Rojo / rojizo', pardo: 'Pardo' } },
    flor: { label: 'Flor', opts: { blanca: 'Blanca', amarilla: 'Amarilla', rosa: 'Rosa', roja: 'Roja', morada: 'Morada', azul: 'Azul', verde: 'Verdosa o poco vistosa', amento: 'Amentos (candelillas)' } },
    fruto: { label: 'Fruto', opts: { bellota: 'Bellota', pina: 'Piña', galbula: 'Gálbula (bolita de enebro o sabina)', baya_roja: 'Baya o fruto rojo', baya_negra: 'Baya negra o azulada', baya_naranja: 'Baya naranja o amarilla', drupa: 'Carnoso con hueso', nuez: 'Nuez, avellana o castaña', samara: 'Con ala (sámara)', vaina: 'Vaina (legumbre)', capsula: 'Cápsula seca', vilano: 'Con pelusa o vilano', aquenio: 'Fruto seco pequeño' } },
    corteza: { label: 'Corteza', opts: { lisa: 'Lisa', agrietada: 'Agrietada', escamosa: 'En placas o escamas', blanca: 'Blanquecina', rojiza: 'Rojiza o anaranjada', corcho: 'Corcho', fibrosa: 'Fibrosa, en tiras' } },
    olor: { label: 'Olor', opts: { aromatica: 'Aromática al frotar', resina: 'Huele a resina' } },
  },
  pla: {
    forma: { label: 'Forma', opts: { hierba: 'Hierba', almohadilla: 'Almohadilla o cojín', roseta: 'Roseta de hojas', trepadora: 'Trepadora', helecho: 'Helecho', musgo: 'Musgo', bulbo: 'Con bulbo', acuatica: 'Acuática', cardo: 'Cardo o espinosa' } },
    flor: { label: 'Color de la flor', opts: { blanca: 'Blanca', amarilla: 'Amarilla', naranja: 'Naranja', rosa: 'Rosa', roja: 'Roja', morada: 'Morada', azul: 'Azul', verde: 'Verdosa', sin_flor: 'Sin flor' } },
    flor_forma: { label: 'Forma de la flor', opts: { estrella: 'Estrella (pétalos sueltos)', campana: 'Campana o tubo', labiada: 'Con labios', mariposa: 'Mariposa (como el guisante)', margarita: 'Margarita (cabezuela)', espiga: 'Espiga o racimo', umbela: 'Paraguas (umbela)', orquidea: 'Orquídea', bola: 'Bola o pompón' } },
    hoja: { label: 'Hoja', opts: { simple: 'Simple', dividida: 'Muy dividida', estrecha: 'Estrecha', carnosa: 'Carnosa', peluda: 'Peluda o lanosa', espinosa: 'Con pinchos', pegajosa: 'Pegajosa', aromatica: 'Aromática al frotar' } },
    altura: { label: 'Altura', opts: { muy_baja: 'Menos de 10 cm', baja: '10-40 cm', media: '40-100 cm', alta: 'Más de 1 m' } },
  },
  mam: {
    tamano: { label: 'Tamaño', opts: { diminuto: 'Como un ratón', pequeno: 'Como un conejo o una ardilla', mediano: 'Como un zorro o un perro', grande: 'Como un ciervo o más' } },
    color: { label: 'Color', opts: COLOR }, patron: { label: 'Dibujo', opts: PATRON },
    actividad: { label: 'Cuándo se ve', opts: ACT },
    senal: { label: 'Señales que deja', opts: { huella: 'Huellas', excremento: 'Excrementos', hozadura: 'Tierra levantada', roeduras: 'Piñas o frutos roídos', madriguera: 'Madrigueras o toperas', sonido: 'Sonidos', corteza: 'Corteza pelada o rascada', nido: 'Nidos o encamaderos' } },
    dieta: { label: 'Alimentación', opts: { herbivoro: 'Herbívoro', carnivoro: 'Carnívoro', omnivoro: 'Omnívoro', insectivoro: 'Insectívoro' } },
  },
  ave: {
    tamano: { label: 'Tamaño', opts: { gorrion: 'Como un gorrión o menos', mirlo: 'Como un mirlo', paloma: 'Como una paloma', cuervo: 'Como un cuervo o una gallina', grande: 'Grande (águila, buitre, garza)' } },
    color: { label: 'Color', opts: COLOR }, patron: { label: 'Dibujo', opts: PATRON },
    pico: { label: 'Pico', opts: { corto: 'Corto y fuerte (de semillas)', fino: 'Fino (de insectos)', ganchudo: 'Ganchudo', largo: 'Largo', recto_fuerte: 'Recto y fuerte (carpintero)' } },
    vuelo: { label: 'Vuelo', opts: { planea: 'Planea en círculos', cernido: 'Se queda quieto en el aire', ondulado: 'Ondulado', rapido: 'Rápido y directo', trepa: 'Trepa por troncos o rocas' } },
    presencia: { label: 'Cuándo está', opts: { residente: 'Todo el año', estival: 'Primavera y verano', invernante: 'Invierno', paso: 'En migración' } },
    senal: { label: 'Señales', opts: { canto: 'Canto llamativo', tamborileo: 'Tamborileo', egagropila: 'Egagrópilas', nido: 'Nido visible', plumas: 'Plumas' } },
  },
  rep: {
    forma: { label: 'Forma', opts: { serpiente: 'Sin patas (serpiente)', lagarto: 'Con patas (lagarto)', tortuga: 'Con caparazón', gusano: 'Como un gusano' } },
    color: { label: 'Color', opts: COLOR }, patron: { label: 'Dibujo', opts: PATRON },
    tamano: { label: 'Longitud', opts: { pequeno: 'Menos de 20 cm', mediano: '20-60 cm', grande: 'Más de 60 cm' } },
    pupila: { label: 'Pupila (serpientes)', opts: { redonda: 'Redonda', vertical: 'Vertical (víboras y culebras nocturnas)' } },
    peligro: { label: 'Peligro', opts: { venenosa: 'Venenosa (veneno peligroso)', inofensiva: 'Inofensiva' } },
  },
  anf: {
    forma: { label: 'Forma', opts: { rana: 'Rana (piel lisa, salta)', sapo: 'Sapo (piel rugosa)', salamandra: 'Con cola, terrestre', triton: 'Con cola, en el agua' } },
    color: { label: 'Color', opts: COLOR }, patron: { label: 'Dibujo', opts: PATRON },
    tamano: { label: 'Tamaño', opts: { pequeno: 'Menos de 5 cm', mediano: '5-10 cm', grande: 'Más de 10 cm' } },
    canto: { label: 'Canto', opts: { croar: 'Croa en coro', silbido: 'Silba o pita', aflautado: 'Nota aflautada repetida', ninguno: 'No canta' } },
  },
  ins: {
    tipo: { label: 'Tipo', opts: { mariposa: 'Mariposa de día', polilla: 'Polilla', escarabajo: 'Escarabajo', libelula: 'Libélula', saltamontes: 'Saltamontes o grillo', mantis: 'Mantis', abeja: 'Abeja o abejorro', avispa: 'Avispa', hormiga: 'Hormiga', chinche: 'Chinche', cigarra: 'Cigarra', mosca: 'Mosca o mosquito', arana: 'Araña', escorpion: 'Escorpión', oruga: 'Oruga o larva', caracol: 'Caracol o babosa', otro: 'Otro' } },
    color: { label: 'Color', opts: COLOR }, patron: { label: 'Dibujo', opts: PATRON },
    tamano: { label: 'Tamaño', opts: { diminuto: 'Menos de 1 cm', pequeno: '1-3 cm', mediano: '3-6 cm', grande: 'Más de 6 cm' } },
    peligro: { label: 'Precaución', opts: { pica: 'Pica o muerde', urticante: 'Pelos urticantes', inofensivo: 'Inofensivo' } },
  },
  hon: {
    forma: { label: 'Forma', opts: { laminas: 'Sombrero con láminas', poros: 'Sombrero con poros (esponja)', aguijones: 'Sombrero con pinchitos', coral: 'Coral o ramitas', copa: 'Copa u oreja', bola: 'Bola o pedo de lobo', mensula: 'Repisa en un tronco', gelatinosa: 'Gelatinosa', liquen_costra: 'Liquen en costra', liquen_hoja: 'Liquen en hojitas', liquen_barba: 'Liquen colgante (barbas)' } },
    color: { label: 'Color', opts: COLOR },
    sustrato: { label: 'Dónde sale', opts: { suelo: 'En el suelo', madera: 'En madera o tocones', arbol_vivo: 'En árboles vivos', estiercol: 'En estiércol', roca: 'Sobre roca', musgo: 'Entre musgo' } },
    pie: { label: 'Pie', opts: { anillo: 'Con anillo', volva: 'Con volva (bolsa en la base)', sin_pie: 'Sin pie' } },
    estacion: { label: 'Época', opts: { primavera: 'Primavera', verano: 'Verano', otono: 'Otoño', invierno: 'Invierno' } },
  },
  roc: {
    color: { label: 'Color', opts: COLOR },
    textura: { label: 'Aspecto', opts: { granos: 'Granos o cristales visibles', fina: 'Grano muy fino, sin granos visibles', capas: 'En capas o estratos', lajas: 'Se rompe en lajas', bandas: 'Bandas o vetas onduladas', vesiculas: 'Con agujeritos (burbujas)', cantos: 'Con cantos redondeados pegados', fosiles: 'Con fósiles', brillo: 'Brillo de mineral', cristal: 'Cristales con caras planas', vitrea: 'Aspecto de vidrio' } },
    dureza: { label: 'Dureza', opts: { blanda: 'Se raya con la uña', media: 'Se raya con una navaja', dura: 'Raya el vidrio' } },
    acido: { label: 'Con vinagre', opts: { burbujea: 'Hace burbujas', no: 'No reacciona' } },
    peso: { label: 'Peso', opts: { ligera: 'Ligera', normal: 'Normal', pesada: 'Muy pesada' } },
  },
};
