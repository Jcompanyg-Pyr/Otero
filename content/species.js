// Biblioteca de especies. Cada grupo vive en su propio archivo (content/species/<grupo>.js).
// Campos y vocabulario de rasgos: ver content/traits.js. Zonas (r): ver ZONAS en content/traits.js.
// Textos redactados para Otero; contrasta las identificaciones dudosas con una guía de campo.
import mam from './species/mam.js';
import ave from './species/ave.js';
import arb from './species/arb.js';
import pla from './species/pla.js';
import rep from './species/rep.js';
import anf from './species/anf.js';
import ins from './species/ins.js';
import hon from './species/hon.js';

export const GROUPS = { mam: 'Mamíferos', ave: 'Aves', arb: 'Árboles y arbustos', pla: 'Plantas y helechos', rep: 'Reptiles', anf: 'Anfibios', ins: 'Insectos y otros invertebrados', hon: 'Hongos y líquenes' };

export const SPECIES = [...mam, ...ave, ...arb, ...pla, ...rep, ...anf, ...ins, ...hon];

export const TRACK_TYPES = {
  hoof: { n: 'Pezuña (dos mitades)', d: 'Dos pesuñas, como un corazón partido' },
  paw4: { n: '4 dedos', d: 'Almohadilla y cuatro dedos' },
  paw5: { n: '5 dedos', d: 'Almohadilla y cinco dedos' },
  hare: { n: 'Saltos (2 largas + 2 pequeñas)', d: 'Grupos de 4 huellas' },
};
export const SCAT_TYPES = {
  pellets: { n: 'Bolitas', d: 'Cagarrutas sueltas o en montón' },
  twisted: { n: 'Retorcido, en punta', d: 'Con pelos, huesecillos o semillas' },
  cylinder: { n: 'Cilindro', d: 'Alargado, sin punta retorcida' },
  clumps: { n: 'Masa grande', d: 'Bolas apelmazadas, grueso' },
  latrine: { n: 'En letrina', d: 'Muchos juntos en un hoyo o sitio fijo' },
};
