// Estado compartido de la app.
export const state = {
  map: null,          // mapa Leaflet
  me: null,           // última posición GPS {lat, lon, acc, alt, t}
  lastPoint: null,    // último punto consultado {lat, lon, ele, label}
  lastZone: null,     // zona preparada que contiene el último punto
  lastInfo: null,     // datos del último punto (para «Preguntar a Claude»)
  libTab: null,
};
