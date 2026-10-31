// Explicaciones: meteorología y física aplicada al tiempo y al frío.
export default [
{
  id: 'atmosfera-altura', em: '🏔️', kicker: 'Física', title: 'Por qué hace más frío al subir',
  lead: 'Las cumbres están más cerca del sol y, sin embargo, son más frías. No es una paradoja: el aire no se calienta con el sol que lo atraviesa, sino con el suelo que tiene debajo, y además se enfría solo al subir porque se expande. Entender esto explica la nieve en las cimas, los pisos de vegetación y por qué la regla de «tantos grados cada cien metros» a veces falla.',
  body: `
<h3>El aire se calienta desde abajo</h3>
<p>La luz del sol atraviesa la atmósfera calentándola muy poco: el aire es casi transparente a esa radiación. Quien se calienta de verdad es el <b>suelo</b>, y el suelo calienta después el aire que está en contacto con él, como un fogón calienta el agua de la olla desde el fondo. Por eso la fuente de calor de la atmósfera está abajo, y cuanto más te alejas de esa fuente, menos calor llega.</p>
<p>Hay un segundo factor: el aire de arriba tiene menos vapor de agua y menos gases que retengan el calor que el suelo emite hacia el cielo. En altura el «efecto invernadero» local es más débil y las noches son más frías.</p>

<h3>El aire que sube se enfría solo</h3>
<p>La presión del aire es el peso de toda la columna de aire que tienes encima. Al nivel del mar ronda los <b>1.013 hectopascales</b> (hPa); a unos 1.500 m es de unos 850 hPa, y a unos 5.500 m ya es aproximadamente la mitad. Cuando una masa de aire sube (empujada por una montaña, por un frente o porque está más caliente que su entorno), encuentra menos presión alrededor y <b>se expande</b>. Para expandirse «gasta» energía de sus propias moléculas, y eso es exactamente lo que medimos como bajada de temperatura. Al revés, el aire que baja se comprime y se calienta. Es el mismo fenómeno por el que un bote de espray se enfría al vaciarlo y una bomba de bicicleta se calienta al inflar.</p>
<p>Los meteorólogos llaman a este enfriamiento sin intercambio de calor con el entorno <b>adiabático</b>, y tiene dos velocidades:</p>
<ul>
<li><b>Gradiente adiabático seco:</b> mientras el aire no está saturado (no se forman nubes), se enfría casi exactamente <b>1 °C por cada 100 m</b> que sube.</li>
<li><b>Gradiente adiabático húmedo o saturado:</b> cuando el vapor empieza a condensarse en gotitas (es decir, cuando se forma la nube), la condensación libera calor y frena el enfriamiento. Entonces el aire se enfría <b>unos 0,5 °C por cada 100 m</b>, aunque varía: algo menos en aire cálido y muy húmedo, algo más en aire muy frío, que lleva poco vapor.</li>
</ul>
<div class="box tech"><b>Dato técnico</b>La «atmósfera estándar» que se usa en aviación supone un descenso medio de 6,5 °C por kilómetro (0,65 °C por cada 100 m) hasta unos 11 km de altura. Es un promedio útil, no una ley: el gradiente real de cada día puede ir desde valores negativos (inversión) hasta casi 1 °C por cada 100 m en las tardes soleadas de verano cerca del suelo.</div>

<h3>La regla práctica: unos 0,6-0,7 °C cada 100 m</h3>
<p>En un día cualquiera, la diferencia de temperatura entre un pueblo y una cumbre cercana suele estar alrededor de <b>0,6-0,7 °C por cada 100 m</b> de desnivel. Con esa regla puedes hacer cuentas útiles:</p>
<ul>
<li>Si en Benasque (unos 1.150 m) hay 12 °C, en la cima del Aneto (3.404 m), unos 2.250 m más arriba, cabe esperar del orden de 12 − 14 = <b>unos −2 °C</b>, sin contar el viento.</li>
<li>Si en Teruel capital (unos 900 m) marcan 20 °C, en el pico Javalambre (unos 2.020 m) puede haber del orden de 13 °C.</li>
<li>Subir 1.000 m equivale, en temperatura media, a desplazarse muchos cientos de kilómetros hacia el norte. Por eso Sierra Nevada, a la latitud de Granada, guarda en sus cumbres un clima y unas plantas que recuerdan al Ártico.</li>
</ul>

<h3>Por qué la regla no siempre se cumple</h3>
<p>La cifra media esconde mucha variación. Los casos en que más te puede engañar son:</p>
<ul>
<li><b>Inversión térmica.</b> En noches despejadas y sin viento, el aire frío y denso resbala ladera abajo y se encharca en los fondos. Entonces hace más frío abajo que a media ladera: el gradiente se invierte. En invierno, con anticiclón, puede durar días (ver «Inversión térmica: cuando el frío se encharca»).</li>
<li><b>Tardes soleadas de verano.</b> El suelo muy caliente calienta mucho el aire de las capas bajas y el gradiente se acerca al seco, de casi 1 °C por cada 100 m. Es cuando más se nota el alivio al subir a la sierra.</li>
<li><b>Dentro de la nube.</b> Si subes con niebla o con la nube pegada a la ladera, el aire está saturado y el descenso es más suave, unos 0,5 °C por cada 100 m.</li>
<li><b>Orientación y viento.</b> Una solana resguardada puede estar más templada que un collado más bajo pero expuesto al cierzo. El termómetro marca la temperatura del aire; lo que sientes depende también del viento y del sol (ver «Viento, humedad y sensación térmica»).</li>
<li><b>Masas de aire distintas.</b> A veces una montaña separa dos tipos de aire: al cruzar un puerto puedes pasar de un aire húmedo y fresco a otro seco y templado. El efecto foehn es el caso extremo.</li>
</ul>

<h3>El sol pica más arriba</h3>
<p>Que el aire esté más frío no quiere decir que la radiación sea más débil. Al contrario: por encima de ti hay menos aire, menos vapor y menos partículas que filtren el sol. La radiación ultravioleta aumenta con la altitud (las cifras que suelen darse son del orden de un 10 % más por cada 1.000 m) y se suma a la que refleja la nieve, que puede devolver la mayor parte de la luz que recibe. Por eso en alta montaña puedes quemarte la piel con frío, y por eso las gafas de sol con buena protección no son un lujo en un nevero.</p>
<p>También por eso al sol se está bien y a la sombra se pasa frío: en altura, la diferencia entre estar al sol o no es mucho mayor que en el llano.</p>

<h3>Consecuencias que ves en el campo</h3>
<ul>
<li><b>La nieve aparece y desaparece por cotas.</b> La línea a partir de la cual se mantiene la nieve sube en primavera y baja en otoño, y está más baja en las umbrías.</li>
<li><b>Los árboles cambian en pisos</b> (ver «Por qué los árboles cambian al subir»).</li>
<li><b>La base de las nubes de buen tiempo es plana.</b> Los cúmulos de un día de verano tienen todos la base a la misma altura: es la altura a la que el aire que sube se ha enfriado hasta saturarse. Cuanto más seco está el aire en superficie, más alta queda esa base.</li>
<li><b>El agua hierve antes.</b> A 2.000 m el agua hierve a unos 93 °C, así que la pasta tarda más en cocerse.</li>
</ul>
<div class="box"><b>En el campo</b>Antes de una salida, mira la temperatura prevista en el pueblo de partida y réstale unos 6-7 °C por cada 1.000 m que vayas a subir. Después añade el efecto del viento. Con ese número decide la ropa, no con el que marca el coche en el aparcamiento.</div>`,
  tags: ['frío', 'altitud', 'altura', 'temperatura', 'gradiente', 'gradiente adiabático', 'adiabático', 'presión atmosférica', 'subir', 'cumbre', 'ultravioleta', 'radiación', 'expansión del aire', 'cota'],
  refs: ['AEMET: Glosario y materiales divulgativos de meteorología', 'Organización de Aviación Civil Internacional: atmósfera estándar internacional', 'Manuales generales de meteorología de montaña (p. ej., publicados por federaciones de montañismo)', 'Organización Mundial de la Salud: Índice UV solar mundial, guía práctica']
},
{
  id: 'presion-borrascas', em: '🌀', kicker: 'Meteorología', title: 'Borrascas y anticiclones: el mapa del tiempo',
  lead: 'Las líneas curvas del mapa del tiempo son el resumen más útil de lo que va a pasar en los próximos días. Unen puntos con la misma presión y, sabiendo leerlas, te dicen de dónde soplará el viento, con qué fuerza y si toca cielo limpio, nieblas o temporal.',
  body: `
<h3>Qué es la presión</h3>
<p>El aire pesa. La presión atmosférica es el peso de la columna de aire que hay sobre cada punto, y se mide en <b>hectopascales</b> (hPa, iguales a los antiguos milibares). Al nivel del mar el valor medio ronda los 1.013 hPa. Como la presión baja mucho con la altura, para comparar sitios los mapas usan la <b>presión reducida al nivel del mar</b>: así una estación en Navacerrada y otra en Valencia se pueden poner en el mismo mapa.</p>
<p>En un mapa de superficie las <b>isobaras</b> son las líneas que unen puntos con la misma presión, trazadas normalmente cada 4 o 5 hPa. Donde se cierran en torno a un mínimo hay una <b>borrasca</b> (B, o L en inglés); en torno a un máximo, un <b>anticiclón</b> (A, o H).</p>

<h3>Por qué el aire gira en vez de ir en línea recta</h3>
<p>Lo lógico sería que el aire fuera directamente de la alta a la baja presión, como el agua que baja una cuesta. Pero la Tierra gira bajo el aire en movimiento, y eso desvía su trayectoria (es la llamada <b>fuerza de Coriolis</b>, que en el hemisferio norte desvía hacia la derecha). El resultado, a escala de miles de kilómetros:</p>
<ul>
<li>En el hemisferio norte, el viento gira alrededor de las borrascas <b>en sentido contrario a las agujas del reloj</b> y alrededor de los anticiclones <b>en el sentido de las agujas</b>.</li>
<li>En altura, lejos del rozamiento del suelo, el viento sopla casi paralelo a las isobaras. Cerca del suelo, el rozamiento lo frena y lo hace cruzarlas un poco hacia la baja presión: el aire converge hacia las borrascas y diverge desde los anticiclones.</li>
<li><b>Cuanto más juntas están las isobaras, más fuerte es el viento.</b> Un mapa con muchas líneas apretadas sobre Galicia es un mapa de temporal.</li>
</ul>
<div class="box tech"><b>Regla de Buys Ballot</b>En el hemisferio norte, si te pones de espaldas al viento, la baja presión queda a tu izquierda (algo adelantada) y la alta a tu derecha. Es una regla de marinos del siglo XIX que sigue funcionando en campo abierto; en un valle de montaña el relieve canaliza el viento y la engaña.</div>
<p>Esto no tiene nada que ver con el sentido en que gira el agua al vaciar un lavabo: en algo tan pequeño, el efecto de la rotación terrestre es despreciable frente a la forma del lavabo.</p>

<h3>Anticiclón: aire que baja</h3>
<p>En un anticiclón el aire de las capas altas desciende lentamente. Al bajar se comprime y se calienta, y eso <b>seca el aire e impide que se formen nubes</b> de desarrollo. El tiempo típico:</p>
<ul>
<li><b>En verano:</b> cielos despejados, calor y, en el interior, tormentas de tarde si hay humedad y frío en altura. El anticiclón de las Azores, cuando se extiende hacia la península, es el gran responsable del verano seco mediterráneo.</li>
<li><b>En invierno:</b> noches largas y despejadas, heladas fuertes, <b>inversiones térmicas</b> y nieblas persistentes en los valles y depresiones (la del Ebro o la del Duero pueden pasar días bajo la niebla mientras las sierras están al sol). Los anticiclones invernales sobre Europa pueden traer además aire muy frío y seco del nordeste.</li>
<li><b>Viento flojo</b> en el centro del anticiclón: es cuando mandan las brisas locales de valle y de ladera.</li>
</ul>
<p>Los valores habituales de un anticiclón rondan los 1.020-1.035 hPa; en invierno pueden superar los 1.040 hPa.</p>

<h3>Borrasca: aire que sube</h3>
<p>En una borrasca el aire converge en superficie y <b>asciende</b>. Al subir se enfría, el vapor se condensa y se forman nubes y precipitación. Las borrascas de nuestras latitudes (llamadas extratropicales) nacen en el choque entre el aire frío polar y el templado subtropical, y suelen llevar asociados <b>frentes</b> (ver «Frentes: cuando cambia el aire»). Traen:</p>
<ul>
<li>Nubosidad extensa, lluvia o nieve, sobre todo en las laderas expuestas al viento (barlovento).</li>
<li>Viento fuerte, con rachas muy intensas en cumbres y collados.</li>
<li>Cambios bruscos de temperatura al paso de los frentes.</li>
</ul>
<p>Una borrasca atlántica moderada puede tener un centro de unos 990-1.000 hPa; las muy profundas bajan de 970 hPa. Cuando la presión cae muy rápido (más de 24 hPa en 24 horas, corregido por latitud) se habla de <b>ciclogénesis explosiva</b>.</p>

<h3>Por dónde entran y qué hacen en España</h3>
<ul>
<li><b>Borrascas atlánticas con viento del oeste o suroeste:</b> descargan sobre todo en Galicia, el oeste peninsular y las caras sur y oeste del Sistema Central (Gredos recibe mucha lluvia con estos flujos) y de las sierras béticas occidentales (Grazalema es uno de los lugares más lluviosos de España). El Mediterráneo queda a sotavento y apenas recibe agua.</li>
<li><b>Flujo del norte o noroeste:</b> llueve y nieva en la cornisa cantábrica, Picos de Europa y la vertiente norte del Pirineo; en el valle del Ebro sopla el cierzo, seco y frío.</li>
<li><b>Bajas en el Mediterráneo o al sur de la península con viento de levante:</b> son las que dan agua a la costa mediterránea y al sureste, a veces de forma torrencial (ver «DANA y gota fría»).</li>
<li><b>Baja térmica en verano:</b> el interior peninsular, muy recalentado, forma una baja presión poco profunda que no trae lluvia general, pero favorece la entrada de brisas y las tormentas de tarde.</li>
</ul>

<h3>El mapa en altura</h3>
<p>Los meteorólogos miran también mapas de lo que pasa a 5.000 m (el nivel de 500 hPa). Ahí se ven las ondas de la <b>corriente en chorro</b>, el río de viento fuerte que separa el aire polar del subtropical. Las «vaguadas» (lenguas de aire frío hacia el sur) favorecen el mal tiempo; las «dorsales» (lenguas de aire cálido hacia el norte), el buen tiempo. Cuando una vaguada se estrangula y queda aislada, nace una DANA.</p>
<div class="box"><b>En el campo</b>Con viento flojo, cielo azul profundo y mucha visibilidad por la tarde, mandas tú: el anticiclón está firme. Si la presión baja de forma sostenida, el viento gira y aparecen velos altos que avanzan desde el oeste, se acerca una borrasca. Un altímetro de reloj sirve de barómetro: si estás quieto en el refugio y de noche la altitud que marca «sube» unas decenas de metros, es que la presión ha bajado (aproximadamente 1 hPa por cada 8 m).</div>`,
  tags: ['presión', 'borrasca', 'anticiclón', 'isobaras', 'mapa del tiempo', 'hectopascales', 'baja presión', 'alta presión', 'coriolis', 'corriente en chorro', 'vaguada', 'dorsal', 'ciclogénesis explosiva', 'Azores', 'barómetro'],
  refs: ['AEMET: Interpretación de mapas meteorológicos y glosario', 'Organización Meteorológica Mundial: Atlas Internacional de Nubes y glosario', 'Manuales generales de meteorología (p. ej., Ahrens, Meteorology Today)']
},
{
  id: 'frentes', em: '🌥️', kicker: 'Meteorología', title: 'Frentes: cuando cambia el aire',
  lead: 'Un frente es la frontera entre dos masas de aire de distinta temperatura y humedad. Cuando una empuja a la otra, el aire se ve obligado a subir y aparecen nubes y precipitación. Lo bueno es que muchos frentes avisan con horas, a veces un día, de antelación: basta saber mirar el cielo.',
  body: `
<h3>Masas de aire y fronteras</h3>
<p>Una masa de aire es un volumen enorme, de cientos o miles de kilómetros, con temperatura y humedad bastante parecidas porque se ha formado sobre una misma región: el Atlántico norte, el interior de Europa, el norte de África. Cuando dos masas distintas se encuentran no se mezclan enseguida, igual que el agua fría y la caliente en una bañera: el aire frío, más denso, tiende a meterse por debajo y el cálido, más ligero, a subir por encima. La zona de contacto, inclinada, es el <b>frente</b>. En los mapas aparece como una línea con símbolos: triángulos (frío), semicírculos (cálido) o ambos alternados (ocluido).</p>

<h3>Frente cálido: el aviso largo</h3>
<p>Cuando el aire cálido avanza sobre el frío, sube por encima de él por una rampa muy suave (del orden de 1 m de subida por cada 100-200 m de avance). Como la rampa es tan larga, las primeras nubes aparecen en lo alto <b>muchas horas antes</b> de que el frente llegue al suelo. La secuencia clásica es:</p>
<ol>
<li><b>Cirros</b>: filamentos blancos y finos, como pinceladas o «colas de caballo», muy altos. Por sí solos no anuncian nada seguro, pero si van en aumento y avanzan desde el oeste, son la avanzadilla.</li>
<li><b>Cirrostratos</b>: un velo blanquecino que cubre el cielo y hace que el sol o la luna tengan un <b>halo</b>, un anillo luminoso alrededor. El halo es una de las señales de cambio más conocidas.</li>
<li><b>Altostratos</b>: capa gris que se engrosa; el sol se ve como a través de un cristal esmerilado y deja de dar sombras.</li>
<li><b>Nimbostratos</b>: nubes bajas, grises oscuras y uniformes, con <b>lluvia o nieve continua</b> y de intensidad moderada durante horas.</li>
</ol>
<p>Al pasar el frente cálido la temperatura sube, el viento suele girar y el cielo puede quedar cubierto de nubes bajas, con lloviznas o nieblas en las laderas. Ese espacio entre el frente cálido y el frío se llama <b>sector cálido</b>.</p>

<h3>Frente frío: el aviso corto</h3>
<p>Cuando el aire frío avanza, se mete como una cuña bajo el cálido y lo levanta con una pendiente mucho más fuerte. El ascenso es brusco y genera <b>nubes de desarrollo vertical</b>: cúmulos grandes y cumulonimbos. Por eso el paso de un frente frío suele ser:</p>
<ul>
<li><b>Rápido</b>: el mal tiempo dura poco, a veces una o dos horas.</li>
<li><b>Intenso</b>: chubascos fuertes, a veces tormenta, granizo o nieve granulada, y rachas de viento.</li>
<li>Con un <b>cambio claro</b>: bajada de temperatura, el viento rola (en la península es típico que pase del suroeste al oeste o noroeste) y la presión, que bajaba, empieza a subir.</li>
<li>Seguido de un cielo muy limpio, aire transparente y chubascos dispersos, sobre todo en las laderas expuestas al nuevo viento.</li>
</ul>
<p>Visto desde lejos, un frente frío activo puede aparecer como una muralla de nubes oscuras en el horizonte, a veces con una línea de nubes bajas y deshilachadas en su base.</p>

<h3>Frente ocluido</h3>
<p>Los frentes fríos avanzan más rápido que los cálidos. Con el tiempo, el frío alcanza al cálido y levanta del suelo todo el aire del sector cálido: el frente queda <b>ocluido</b>. Es señal de que la borrasca está madura y empieza a debilitarse. El tiempo que trae mezcla rasgos de los dos: nubosidad extensa y precipitación continua, a veces con chubascos más fuertes. Muchos de los frentes que llegan a la península lo hacen ya ocluidos y debilitados, sobre todo cuando alcanzan el interior y el Mediterráneo.</p>
<div class="box tech"><b>Dato técnico</b>La precipitación de un frente no se reparte por igual. Las montañas obligan al aire a subir aún más y «exprimen» el frente en sus laderas de barlovento. Por eso, con un mismo frente, la vertiente gallega o cantábrica de una sierra puede recibir varias veces más lluvia que el valle al otro lado.</div>

<h3>Los frentes en las montañas españolas</h3>
<ul>
<li><b>Galicia, cornisa cantábrica y Pirineo occidental</b> reciben los frentes atlánticos con toda su fuerza. Es frecuente que un frente que deja temporal en Picos de Europa llegue al Ebro como una franja de nubes sin apenas lluvia.</li>
<li><b>Con frentes fríos del noroeste</b>, la vertiente norte del Pirineo y la Cantábrica acumulan nieve («nevadas de norte»), mientras la vertiente sur del Pirineo y el valle del Ebro reciben sobre todo viento.</li>
<li><b>Con frentes que entran por el suroeste</b>, Gredos, la sierra de Guadarrama, las sierras de Cádiz y Málaga o Sierra Nevada en su cara occidental reciben buena parte de la precipitación.</li>
<li><b>En el Mediterráneo</b> los frentes atlánticos llegan muy desgastados. Allí la lluvia importante depende más de los vientos de levante y de las borrascas mediterráneas.</li>
</ul>

<h3>Cómo verlo llegar desde la montaña</h3>
<ul>
<li>Cirros que espesan y avanzan desde el oeste, seguidos de halo: lluvia o nieve probable en las próximas 12-24 horas, aunque no siempre.</li>
<li>Estelas de los aviones que no se deshacen y se ensanchan: el aire de arriba está húmedo, a menudo antes de un frente.</li>
<li>Viento que se refuerza y gira hacia el sur o el sudoeste en la península, con temperaturas suaves: entrada de aire cálido por delante del frente.</li>
<li>Nubes que se pegan a las cumbres de barlovento y van bajando.</li>
<li>La presión (o la altitud del reloj, que se mueve al revés) cambiando de forma sostenida durante horas.</li>
</ul>
<div class="box"><b>En el campo</b>Ante un frente cálido tienes tiempo: puedes acortar la ruta con calma. Ante un frente frío con nubes de tormenta, el margen se mide en minutos o en una hora: si ves la muralla oscura acercarse, aléjate de cumbres y crestas antes de que llegue. Tras su paso, espera frío, viento y quizá nieve en cotas que horas antes estaban templadas.</div>`,
  tags: ['frente', 'frente frío', 'frente cálido', 'frente ocluido', 'oclusión', 'masa de aire', 'halo', 'cirros', 'cirrostratos', 'altostratos', 'nimbostratos', 'sector cálido', 'cambio de tiempo', 'chubascos', 'barlovento'],
  refs: ['AEMET: Glosario y guías divulgativas sobre frentes y masas de aire', 'Organización Meteorológica Mundial: Atlas Internacional de Nubes', 'Manuales generales de meteorología de montaña']
},
{
  id: 'dana', em: '⛈️', kicker: 'Meteorología', title: 'DANA y gota fría: la lluvia que no avisa',
  lead: 'Casi todos los otoños, en algún punto de la costa mediterránea caen en pocas horas lluvias equivalentes a las de varios meses. Detrás suele haber una DANA: una bolsa de aire frío en las alturas que se encuentra con un mar todavía caliente. Entender el mecanismo ayuda a tomarse en serio los avisos, también en la montaña.',
  body: `
<h3>Qué es una DANA</h3>
<p>DANA son las siglas de <b>Depresión Aislada en Niveles Altos</b>. Es una bolsa de aire frío, de cientos de kilómetros, que se ha desprendido de la corriente en chorro (el gran río de viento que separa el aire polar del subtropical) y queda <b>aislada y girando</b> a varios kilómetros de altura, del orden de 5.000 a 9.000 m. A diferencia de las borrascas atlánticas, no siempre se nota en el mapa de presión de superficie: puede haber presiones casi normales abajo mientras arriba hay un núcleo muy frío. Por eso a veces llega con poca «cara» de temporal.</p>
<p><b>Gota fría</b> es el nombre tradicional, traducido del alemán, para fenómenos parecidos. Hoy los meteorólogos prefieren «DANA», porque «gota fría» se usó durante años para cualquier lluvia torrencial, la causara lo que la causara.</p>
<div class="box tech"><b>Dato técnico</b>Lo que hace peligrosa a una DANA no es el aire frío en sí, sino la diferencia de temperatura entre arriba y abajo. Con aire muy frío en altura y aire cálido y húmedo en superficie, la atmósfera se vuelve <b>inestable</b>: cualquier burbuja de aire que empiece a subir lo hace cada vez más rápido, como un corcho bajo el agua. Las DANA, además, se mueven despacio o de forma errática, y pueden quedarse sobre una misma zona uno o varios días.</div>

<h3>Por qué en otoño y en el Mediterráneo</h3>
<p>El Mediterráneo es un mar casi cerrado, poco renovado y que se calienta mucho durante el verano. A finales de verano y en otoño su superficie suele estar del orden de 24-28 °C cerca de las costas españolas, y el aire en contacto con ella se carga de vapor de agua. Al mismo tiempo, en otoño empiezan a bajar las primeras irrupciones de aire frío en altura. Esa coincidencia es la receta:</p>
<ol>
<li><b>Combustible:</b> aire cálido y muy húmedo sobre el mar.</li>
<li><b>Transporte:</b> vientos de levante (del este o nordeste) que empujan ese aire hacia la costa, a menudo alimentados por una baja en superficie al sur o al este de la DANA.</li>
<li><b>Disparador:</b> el relieve. Las sierras que hay muy cerca del mar en Valencia, Alicante, Murcia, Cataluña o Almería obligan al aire a subir de golpe.</li>
<li><b>Aire frío arriba:</b> la DANA hace que ese ascenso no se frene, y se forman nubes de tormenta que se regeneran una y otra vez en el mismo sitio.</li>
</ol>
<p>Cuando las tormentas se forman y descargan una detrás de otra sobre la misma comarca (lo que se llama un sistema «estacionario» o «en tren»), la lluvia acumulada puede ser enorme. Algunos ejemplos documentados: en <b>Oliva</b> (Valencia) se registraron en noviembre de 1987 más de 800 l/m² en un día; en la DANA de <b>octubre de 2024</b>, en Turís (Valencia) se superaron los 700 l/m² en un día y se midieron cantidades del orden de 180 l/m² en una sola hora. En ese episodio murieron más de doscientas personas, la mayoría por la crecida de barrancos y ramblas aguas abajo de donde más llovía.</p>

<h3>No toda DANA trae diluvios</h3>
<p>Las DANA pueden aparecer en cualquier época y en cualquier zona. Según dónde se sitúen y qué aire encuentren, traen:</p>
<ul>
<li>Tormentas de tarde con granizo en el interior en primavera y verano (Teruel, Cuenca, la Meseta).</li>
<li>Nevadas en cotas bajas en invierno si el aire de superficie es frío.</li>
<li>Días de inestabilidad sin grandes acumulados.</li>
</ul>
<p>Lo que las hace especialmente peligrosas en otoño en la vertiente mediterránea es la combinación con el mar caliente y el relieve costero. La previsión del lugar exacto donde caerá la tromba sigue siendo difícil, aunque se sepa con días de antelación que habrá riesgo.</p>

<h3>Por qué el agua baja tan violenta</h3>
<p>Buena parte del este y sureste peninsular tiene suelos poco profundos, laderas desnudas y cuencas cortas y empinadas. Cuando caen decenas de litros en poco tiempo, el suelo no absorbe y el agua corre por la superficie. Los cauces que pasan secos casi todo el año —<b>ramblas, barrancos, ríos secos</b>— se convierten en minutos en torrentes que arrastran barro, piedras, árboles y coches. Lo más traicionero es que la riada puede llegar a un lugar donde no está lloviendo, porque el agua viene de la cabecera, kilómetros arriba.</p>

<h3>Seguridad: lo que conviene saber</h3>
<ul>
<li><b>Consulta los avisos de AEMET</b> (sistema Meteoalerta: amarillo, naranja y rojo) y los de protección civil de tu comunidad. Un aviso naranja o rojo por lluvia en la vertiente mediterránea no es para salir al monte.</li>
<li><b>No acampes ni aparques en ramblas, cauces secos o barrancos</b>, aunque haga sol. Tampoco en conos de deyección (los abanicos de piedras donde un barranco sale al llano).</li>
<li><b>No cruces vados ni carreteras inundadas</b>, ni a pie ni en coche: unas pocas decenas de centímetros de agua en movimiento bastan para arrastrar un coche, y no sabes si el firme sigue debajo.</li>
<li>Si estás en un barranco y el agua sube, se enturbia o arrastra ramas, o escuchas un rugido aguas arriba, <b>sube a terreno alto por la ladera</b>, no corras cauce abajo.</li>
<li>En plena tormenta, los collados y crestas tienen el peligro de los rayos; los fondos, el de las crecidas. Lo ideal es no estar allí.</li>
</ul>
<div class="box"><b>En el campo</b>En septiembre, octubre y noviembre, si vas a sierras próximas al Mediterráneo (Montgó, Aitana, Mariola, Espadán, Calderona, Ports, Prades, Cazorla, Espuña…), mira la previsión de ese mismo día y de las horas siguientes, no solo la de la víspera. Planifica rutas con escapatorias que no obliguen a cruzar cauces.</div>`,
  tags: ['DANA', 'gota fría', 'depresión aislada en niveles altos', 'lluvia torrencial', 'tromba', 'inundación', 'riada', 'rambla', 'barranco', 'otoño', 'Mediterráneo', 'levante', 'avisos', 'Meteoalerta', 'inestabilidad'],
  refs: ['AEMET: Notas técnicas y divulgativas sobre DANA', 'AEMET: Plan Meteoalerta', 'Protección Civil: recomendaciones ante inundaciones', 'Manuales generales de meteorología mediterránea']
},
{
  id: 'leer-nubes', em: '☁️', kicker: 'Meteorología', title: 'Nubes que avisan',
  lead: 'Cada nube es el dibujo visible de lo que el aire está haciendo: subir, ondular, chocar con una montaña o hervir en vertical. No hace falta aprender las diez familias de memoria; basta con reconocer unas pocas que, en la montaña, conviene no ignorar.',
  body: `
<h3>Cómo se forma una nube</h3>
<p>El aire siempre lleva vapor de agua invisible. Cuando sube, se enfría (ver «Por qué hace más frío al subir») hasta que ya no puede mantener todo ese vapor y una parte se condensa en gotitas o cristales de hielo minúsculos alrededor de partículas de polvo, sal o humo. Eso es una nube. Su forma depende de <b>cómo</b> sube el aire: si lo hace en burbujas que suben con fuerza, salen nubes de algodón, en montón (cúmulos); si sube despacio y en capas extensas, salen nubes en lámina (estratos); a gran altura, donde todo es hielo, salen filamentos (cirros).</p>
<p>Las nubes se clasifican por altura: <b>altas</b> (cirros, cirrocúmulos, cirrostratos, por encima de unos 5-6 km en nuestras latitudes), <b>medias</b> (altocúmulos, altostratos), <b>bajas</b> (estratos, estratocúmulos, nimbostratos) y de <b>desarrollo vertical</b> (cúmulos y cumulonimbos), que pueden ir desde abajo hasta la parte alta de la troposfera.</p>

<h3>Cirros: los mensajeros</h3>
<p>Son filamentos blancos, sedosos, a veces con ganchos o en forma de «cola de caballo». Están hechos de cristales de hielo y viajan con los vientos de altura. Pocos cirros aislados en un cielo que no cambia no significan gran cosa. Pero si <b>aumentan, se ordenan en bandas desde el oeste y acaban formando un velo con halo</b>, es la avanzadilla clásica de un frente: lluvia o nieve probable en uno o dos días. Lo mismo con el cielo «empedrado» o «aborregado» de cirrocúmulos y altocúmulos en aumento, que dio pie al refrán «cielo empedrado, suelo mojado»: acierta a veces, falla otras; vale como indicio, no como certeza.</p>

<h3>Lenticulares: el viento que no ves</h3>
<p>Los <b>altocúmulos lenticulares</b> tienen forma de lenteja, de platillo volante o de pila de platos, con bordes lisos. Aparecen a sotavento de las montañas cuando un viento fuerte y bastante estable las cruza: el aire, al pasar la cresta, forma <b>ondas</b> como el agua detrás de una piedra en un río. En la cresta de cada onda el aire sube, se enfría y forma la nube; en el valle de la onda baja y la nube se evapora. Por eso el lenticular parece quieto aunque por dentro pase un viento muy fuerte.</p>
<ul>
<li>Indican <b>viento fuerte en altura</b> y, a menudo, turbulencias. En cumbres y crestas habrá rachas violentas.</li>
<li>Con frecuencia preceden a la llegada de un frente o acompañan al efecto foehn.</li>
<li>Se ven bien sobre Sierra Nevada, el Moncayo, el Pirineo o las sierras del Sistema Central con viento fuerte.</li>
</ul>

<h3>Nubes de estancamiento y «gorros»</h3>
<p>Cuando el viento empuja aire húmedo contra una sierra, el aire sube por la ladera de barlovento y forma una nube pegada a la montaña que no se mueve aunque sople fuerte: la <b>nube de estancamiento</b>. Vista desde el otro lado, a sotavento, se ve como un <b>muro</b> de nubes que cubre las cumbres y se deshace al bajar, como una cascada que se evapora. Es la imagen típica del Pirineo visto desde Aragón con viento del norte, o del Cantábrico visto desde la Meseta.</p>
<p>Las cumbres aisladas se ponen a veces una <b>nube de capuchón</b> o «gorro» (en muchos pueblos se dice que el monte «tiene montera» o «se pone el capirote»). Significa que en la cima el aire está húmedo y casi saturado y, a menudo, que el viento es intenso. Muchos refranes locales relacionan el gorro del pico de su comarca con lluvia próxima: tienen fundamento (más humedad y viento suelen preceder al mal tiempo), pero dependen mucho de qué viento lo provoca.</p>
<p>Distinto es el <b>pileus</b>: un casquete liso y efímero encima de un cúmulo que crece rápido. Indica que la nube está subiendo con fuerza y puede acabar en tormenta.</p>

<h3>Cúmulos que crecen: el reloj de la tormenta</h3>
<p>Los <b>cúmulos de buen tiempo</b> (planos por abajo, poco altos, separados) se forman por la mañana con el calor del sol y suelen desaparecer al atardecer. Lo que hay que vigilar es su <b>desarrollo vertical</b>:</p>
<ol>
<li>Cúmulos pequeños a media mañana: normal.</li>
<li>Cúmulos que <b>crecen hacia arriba antes del mediodía</b> y forman torres con aspecto de coliflor (cúmulos congestos): la atmósfera está inestable; tormenta probable por la tarde.</li>
<li>La cima de la torre deja de verse dura y se vuelve fibrosa, deshilachada, y se extiende en forma de <b>yunque</b>: ya es un <b>cumulonimbo</b>, la nube de tormenta. Rayos, granizo, chubascos fuertes y rachas.</li>
</ol>
<p>Bajo el yunque de algunos cumulonimbos aparecen <b>mammatus</b>, bolsas colgantes como ubres. Son espectaculares y suelen verse en tormentas fuertes o en su parte final.</p>

<h3>Mar de nubes</h3>
<p>Desde una cumbre puedes ver los valles cubiertos por una capa de nubes blanca y plana, como un mar, con las sierras saliendo como islas. Es la señal de una <b>inversión térmica</b>: el aire frío y húmedo queda atrapado abajo, bajo una capa de aire más cálido y seco que actúa de tapadera. Suele ir con anticiclón y tiempo estable. Es muy típico en invierno sobre el valle del Ebro (visto desde el Moncayo o el Prepirineo), sobre la meseta o en los valles pirenaicos, y casi permanente en el norte de las islas Canarias más altas, donde los alisios lo forman a media ladera.</p>
<div class="box"><b>Arriba y abajo</b>En el mar de nubes, el tiempo es muy distinto según estés arriba o abajo: sol y calorcito arriba, niebla, humedad y frío abajo. Si bajas, cuenta con entrar en niebla densa.</div>

<h3>Otras señales útiles</h3>
<ul>
<li><b>Estelas de avión persistentes</b> que se ensanchan: aire húmedo en altura, a menudo antes de un frente. Si desaparecen enseguida, el aire de arriba está seco.</li>
<li><b>Banderas de nube</b> en una cumbre (una nube alargada que sale de un lado de la cima): viento fuerte en la cumbre.</li>
<li><b>Nubes bajas que se deshilachan y corren rápido</b> por debajo de otras más altas: viento fuerte y cambio en marcha.</li>
<li><b>Nubes que se pegan a las cumbres y bajan</b> a lo largo del día: aire cada vez más húmedo; posible niebla y precipitación.</li>
</ul>
<div class="box"><b>En el campo</b>Mira el cielo cada hora, no solo al salir. Las nubes no se juzgan por una foto fija, sino por su <b>tendencia</b>: si crecen, se espesan o bajan, el tiempo empeora; si se deshacen y suben, mejora. En verano, el momento clave es entre las once y la una: lo que veas crecer entonces suele decidir la tarde.</div>`,
  tags: ['nubes', 'cirros', 'lenticular', 'altocúmulo lenticular', 'cumulonimbo', 'cúmulo', 'yunque', 'mammatus', 'mar de nubes', 'nube de estancamiento', 'gorro', 'montera', 'capuchón', 'pileus', 'estelas', 'bandera de nube', 'cielo empedrado', 'aborregado'],
  refs: ['Organización Meteorológica Mundial: Atlas Internacional de Nubes', 'AEMET: Atlas de nubes y meteoros y materiales divulgativos', 'Manuales generales de meteorología de montaña']
},
{
  id: 'tormentas-montana', em: '🌩️', kicker: 'Seguridad', title: 'Tormentas de verano y rayos en la montaña',
  lead: 'Las tormentas de tarde son el peligro meteorológico más frecuente en la montaña española en verano. Se forman casi a diario en el Pirineo, en el Sistema Ibérico o en Gredos cuando hay calor y humedad, y suelen seguir un horario bastante previsible. Saber cómo nacen y qué hacer cuando te pillan puede salvarte la vida.',
  body: `
<h3>Cómo nace una tormenta de verano</h3>
<p>Una tormenta es una nube, el <b>cumulonimbo</b>, que ha crecido tanto en vertical que llega a la parte alta de la troposfera, a menudo a más de 10 km de altura en verano. La receta tiene tres ingredientes:</p>
<ol>
<li><b>Humedad</b> en las capas bajas.</li>
<li><b>Inestabilidad</b>: aire caliente abajo y relativamente frío arriba, de modo que el aire que empieza a subir siga haciéndolo solo.</li>
<li><b>Un disparador</b>: algo que empuje el aire hacia arriba. En verano es el propio sol calentando el suelo (<b>convección</b>), ayudado por las montañas: las laderas soleadas se calientan mucho y generan corrientes ascendentes, y las brisas de valle convergen en las cumbres.</li>
</ol>
<p>Por eso el horario típico es: cielo limpio por la mañana, primeros cúmulos hacia media mañana sobre las cumbres, torres que crecen a mediodía y tormenta entre <b>primera hora de la tarde y el anochecer</b>. Con una DANA o un frente cerca, el horario se adelanta o puede haber tormentas a cualquier hora, incluso de noche.</p>

<h3>Rayos y truenos</h3>
<p>Dentro del cumulonimbo hay corrientes de aire que suben y bajan con mucha fuerza. Granizo blando, cristales de hielo y gotas subenfriadas chocan entre sí y se cargan eléctricamente: la parte alta de la nube queda, en general, con carga positiva y la parte media y baja con carga negativa. Cuando la diferencia es enorme, salta una descarga: dentro de la nube, entre nubes o hacia el suelo. El <b>rayo</b> calienta el aire de su canal a decenas de miles de grados en una fracción de segundo; el aire se expande de golpe y produce el <b>trueno</b>.</p>
<p>La luz llega casi al instante y el sonido viaja a unos 340 m por segundo. Por eso, <b>contando los segundos entre el relámpago y el trueno y dividiendo entre tres</b>, tienes la distancia aproximada en kilómetros.</p>
<div class="box tech"><b>Dato técnico</b>Los rayos pueden caer a más de 10 km del núcleo de la tormenta, incluso con cielo despejado sobre tu cabeza. Por eso la regla práctica es: <b>si oyes truenos, estás al alcance de un rayo</b>. En las cumbres el riesgo es mayor porque eres el punto más alto y la nube puede estar a muy poca distancia.</div>

<h3>La regla 30/30</h3>
<ul>
<li><b>30 segundos:</b> si entre relámpago y trueno pasan menos de unos 30 segundos (unos 10 km), la tormenta está lo bastante cerca para alcanzarte. Ponte a salvo ya.</li>
<li><b>30 minutos:</b> espera al menos unos 30 minutos desde el último trueno antes de volver a terreno expuesto. La parte final de una tormenta también da rayos.</li>
</ul>
<p>En la práctica de montaña, lo más importante es <b>no llegar a tener que aplicarla</b>: madrugar, estar fuera de cumbres y crestas a primera hora de la tarde en días de tormenta prevista, y darse la vuelta cuando las torres crecen pronto.</p>

<h3>Qué hacer si la tormenta te pilla</h3>
<p>Ningún lugar al aire libre es seguro durante una tormenta. Lo que sí se puede hacer es reducir mucho el riesgo:</p>
<ul>
<li><b>Baja de cumbres, crestas y collados</b>. Aléjate de los puntos altos y de las aristas. Un hombro de ladera o una vaguada amplia es mejor que una cresta.</li>
<li><b>Evita árboles aislados</b>, postes, torres y vallas metálicas, y el agua (lagos, ibones, arroyos).</li>
<li>En una vía ferrata o junto a cables y cadenas metálicas, <b>abandona la zona equipada</b> en cuanto sea posible: el metal conduce la corriente.</li>
<li>Pon los objetos metálicos largos (bastones, piolet) lejos de ti, no los lleves sobresaliendo de la mochila.</li>
<li>No te refugies en la boca de una cueva poco profunda ni bajo un extraplomo: la corriente puede saltar por el aire de la entrada y atravesarte. Una cueva sí es buena si es amplia y puedes alejarte de paredes y entrada.</li>
<li>Un <b>coche con carrocería metálica</b> cerrado o un edificio sólido son buenos refugios. Un refugio de montaña, también. Una tienda de campaña o una caseta pequeña sin protección, no.</li>
<li>En grupo, <b>separaos varios metros</b> unos de otros (muchas guías hablan de unos 15 m o más), para que un rayo no afecte a todos y quede alguien para ayudar.</li>
<li>Si no hay más remedio y la tormenta está encima, como último recurso <b>agáchate en cuclillas con los pies juntos</b>, sobre la mochila o una esterilla si no llevan metal, sin tumbarte en el suelo. Reduces tu altura y el contacto con el suelo, por donde también se propaga la corriente.</li>
</ul>
<div class="box"><b>Señales de alarma inmediata</b>Si notas el pelo erizado, un hormigueo en la piel, un zumbido o chisporroteo en objetos metálicos o ves pequeños destellos azulados en puntas y bastones (efecto corona, el «fuego de San Telmo»), la descarga puede ser inminente: aléjate de ese punto enseguida, ladera abajo.</div>

<h3>Los otros peligros de la tormenta</h3>
<ul>
<li><b>Granizo:</b> puede ser grueso y hacer daño; protege la cabeza con la mochila.</li>
<li><b>Bajada brusca de temperatura y rachas</b> de viento descendente que pueden superar con creces el viento previsto. Con ropa mojada, el riesgo de hipotermia aparece incluso en verano.</li>
<li><b>Crecidas en barrancos</b>: el agua que cae en la cabecera puede llegar en minutos a donde tú estás aunque allí no llueva. En agosto de 1996 una tormenta en el barranco de Arás provocó la riada que arrasó el camping de Biescas (Huesca), con 87 muertos. No acampes en cauces ni en abanicos de piedras al pie de barrancos.</li>
<li><b>Pérdida de visibilidad</b> y caminos convertidos en arroyos o en barro resbaladizo.</li>
</ul>

<h3>Si alguien recibe un rayo</h3>
<p>Una persona alcanzada por un rayo <b>no queda cargada</b>: se la puede tocar sin peligro. Llama al <b>112</b> cuanto antes indicando el lugar exacto. Muchas víctimas sobreviven si se actúa rápido: si no respira, quien sepa debe iniciar la reanimación cardiopulmonar siguiendo las indicaciones del servicio de emergencias. Mantén a la persona abrigada y aislada del suelo mientras llega la ayuda.</p>

<div class="box"><b>En el campo</b>En días de calor húmedo con aviso de tormentas: sal temprano, fija una hora límite para estar fuera de terreno expuesto (en verano en el Pirineo, a menudo hacia las 13-14 h) y respétala aunque el cielo parezca tranquilo. Vigila las torres que crecen a tu barlovento: las que están detrás de ti cuando subes son las que no ves.</div>`,
  tags: ['tormenta', 'rayo', 'relámpago', 'trueno', 'cumulonimbo', 'convección', 'regla 30/30', 'granizo', 'seguridad', 'vía ferrata', 'fuego de San Telmo', 'crecida', 'Biescas', 'verano', 'electricidad'],
  refs: ['AEMET: Recomendaciones ante tormentas y avisos', 'Protección Civil: consejos ante tormentas y rayos', 'Federación Española de Deportes de Montaña y Escalada: materiales de seguridad', 'NOAA National Weather Service: Lightning Safety']
},
{
  id: 'foehn', em: '🔥', kicker: 'Meteorología', title: 'Efecto foehn: el viento que baja seco y caliente',
  lead: 'A un lado de la montaña llueve sin parar y hace fresco; al otro lado, a la misma altitud, el cielo está despejado, el aire es seco y la temperatura sube varios grados. No es casualidad: es el efecto foehn, que explica desde los días de más de 20 °C en Bilbao en pleno invierno hasta el poniente abrasador de Valencia.',
  body: `
<h3>El nombre</h3>
<p>Foehn (o föhn) es el nombre que se da en los Alpes a un viento cálido y seco que baja por los valles de sotavento. En meteorología se usa para cualquier viento de ese tipo en cualquier cordillera. De ahí viene también el nombre del secador de pelo en alemán.</p>

<h3>La explicación clásica, paso a paso</h3>
<p>Imagina un viento húmedo que llega a una sierra y la cruza:</p>
<ol>
<li><b>Sube por barlovento</b> (la ladera que recibe el viento). Al subir se expande y se enfría a <b>unos 1 °C por cada 100 m</b> (gradiente seco).</li>
<li>A cierta altura se satura y <b>se forma la nube</b>. Desde ahí sigue subiendo, pero ahora se enfría solo <b>unos 0,5 °C por cada 100 m</b>, porque la condensación libera calor.</li>
<li>Si la nube <b>descarga lluvia o nieve</b> en la ladera de barlovento, el aire pierde agua por el camino.</li>
<li>Al cruzar la cresta, el aire <b>baja por sotavento</b>. Como ya no tiene tanta agua, la poca nube que queda se evapora enseguida y el aire baja casi todo el recorrido sin nubes, <b>calentándose a 1 °C por cada 100 m</b> al comprimirse.</li>
<li>Resultado: llega al valle de sotavento <b>más caliente y mucho más seco</b> que estaba a la misma altura en barlovento.</li>
</ol>
<div class="box tech"><b>Un ejemplo con números redondos</b>Aire a 15 °C a 0 m sube y se satura a 1.000 m (allí está a 5 °C). Sigue subiendo con nube hasta la cresta, a 2.000 m: allí está a unos 0 °C. Baja por el otro lado, seco, 2.000 m hasta el nivel del mar: gana unos 20 °C. Llega a unos 20 °C, cinco grados más que al principio, y con una humedad relativa muy baja.</div>
<p>Esta explicación «termodinámica» es la de los libros de texto y funciona en muchos casos. Hoy se sabe que no es la única: a menudo, cuando la montaña bloquea el aire de las capas bajas, lo que baja por sotavento es aire de capas más altas, que ya era más seco y que se calienta mucho al descender, aunque no haya llovido en barlovento. Ambos mecanismos pueden actuar a la vez. Lo esencial no cambia: <b>el aire que baja una montaña se comprime y se calienta</b>.</p>

<h3>Cómo se reconoce</h3>
<ul>
<li>Viento racheado que baja de las montañas, más templado de lo esperable para la época.</li>
<li>Humedad relativa muy baja; la piel y los labios se resecan, la visibilidad es extraordinaria.</li>
<li>Desde el lado de sotavento se ve el <b>muro de foehn</b>: una pared de nubes que cubre las cumbres y se deshace al bajar, como si se evaporara en el aire. Delante, cielo azul.</li>
<li>A veces aparecen <b>nubes lenticulares</b> sobre el valle, señal de ondas en el aire.</li>
<li>Subidas bruscas de temperatura, incluso de noche: con foehn las noches pueden ser muy templadas porque el viento no deja formarse el lago de aire frío.</li>
</ul>

<h3>Ejemplos en España</h3>
<ul>
<li><b>Cornisa cantábrica con viento sur.</b> Cuando entra viento del sur que cruza la Cordillera Cantábrica, en Bilbao, Santander, Oviedo o San Sebastián se pueden superar los 20 °C en pleno invierno, con un cielo limpísimo. Allí lo llaman simplemente «viento sur». Es un viento racheado, que reseca la vegetación y que ha avivado incendios forestales en Asturias y Cantabria fuera de la temporada de verano.</li>
<li><b>Pirineo.</b> Con viento del norte, la nieve y la niebla se quedan en la vertiente francesa y en el Valle de Arán; en la vertiente aragonesa y catalana baja un viento seco y frío pero relativamente más templado y despejado. Con viento del sur ocurre al revés: el foehn baja hacia Francia.</li>
<li><b>Poniente en la costa valenciana y murciana.</b> El viento del oeste cruza la Meseta y los sistemas Ibérico y Bético, pierde humedad y baja hacia el Mediterráneo comprimiéndose. En verano, el poniente lleva a Valencia, Murcia o Alicante temperaturas de más de 40 °C y humedades muy bajas.</li>
<li><b>Terral de Málaga.</b> Viento del norte o noroeste que baja de los montes de Málaga hacia la costa, cálido y seco en verano. Rompe el alivio habitual de la brisa marina.</li>
<li><b>Canarias.</b> Las vertientes sur de las islas altas están a sotavento de los alisios y son más secas y soleadas en parte por un efecto parecido.</li>
</ul>

<h3>Consecuencias en la montaña</h3>
<ul>
<li><b>Fusión rápida de la nieve.</b> El aire cálido y seco, y sobre todo el viento, aceleran la fusión y la sublimación. En primavera, un episodio de foehn puede aumentar el peligro de <b>aludes de nieve húmeda</b> y las crecidas de los ríos.</li>
<li><b>Riesgo de incendio.</b> Viento, sequedad y temperaturas altas son el triángulo del fuego. Muchas jornadas de alto riesgo coinciden con vientos de foehn.</li>
<li><b>Contraste entre vertientes.</b> Puedes salir de un valle con cielo azul y encontrarte en la cresta con viento helado y niebla: estás entrando en la nube de estancamiento del otro lado.</li>
<li><b>Turbulencias y rachas fuertes</b> a sotavento de crestas y collados.</li>
</ul>
<p>Hay quien relaciona el foehn con dolores de cabeza, irritabilidad o malestar. Es una creencia muy extendida en los Alpes y en el norte de España, pero los estudios no han dado resultados concluyentes.</p>
<div class="box"><b>En el campo</b>Si en invierno ves un muro de nubes inmóvil sobre la cresta y a tu lado sopla un viento templado, piensa que al otro lado puede estar nevando y que en la cresta el viento será fuerte y frío. No cuentes con el buen tiempo del valle para cruzar al otro lado.</div>`,
  tags: ['foehn', 'föhn', 'viento cálido', 'viento seco', 'sotavento', 'barlovento', 'muro de foehn', 'viento sur', 'poniente', 'terral', 'incendios', 'fusión de la nieve', 'compresión', 'adiabático'],
  refs: ['AEMET: Glosario y notas divulgativas sobre el efecto foehn y el viento sur en el Cantábrico', 'Organización Meteorológica Mundial: Vocabulario Meteorológico Internacional', 'Manuales generales de meteorología de montaña']
},
{
  id: 'vientos-montana', em: '🍃', kicker: 'Meteorología', title: 'Brisas de valle y de ladera',
  lead: 'En días tranquilos, la montaña genera su propio viento. Por la mañana el aire sube por las laderas y los valles; por la noche baja. Ese ritmo explica por qué el viento cambia a media mañana, por qué el humo de una hoguera sube o baja según la hora y por qué los animales te huelen.',
  body: `
<h3>El motor: el sol calienta las laderas</h3>
<p>Cuando no hay grandes borrascas ni anticiclones que impongan un viento general, lo que manda son las diferencias de temperatura locales. Por el día, el sol calienta las laderas, y el aire en contacto con ellas se calienta más que el aire que está a la misma altura pero en mitad del valle, lejos del suelo. Ese aire más cálido es más ligero y <b>sube pegado a la ladera</b>. De noche ocurre lo contrario: la ladera se enfría por radiación, enfría el aire que toca, y ese aire, más denso, <b>resbala hacia abajo</b>.</p>

<h3>Brisas de ladera</h3>
<ul>
<li><b>Anabática (ascendente):</b> empieza poco después de que el sol dé en la ladera. Es lo primero que se pone en marcha por la mañana. Se nota más en las laderas soleadas: las orientadas al este por la mañana, al sur a mediodía, al oeste por la tarde.</li>
<li><b>Catabática (descendente):</b> empieza al atardecer, cuando la ladera queda en sombra, y dura toda la noche. Es suave, de pocos kilómetros por hora, pero helada. Es la que alimenta los lagos de aire frío en los fondos de valle (ver «Inversión térmica: cuando el frío se encharca»).</li>
</ul>

<h3>Brisas de valle y de montaña</h3>
<p>A una escala mayor, todo el valle funciona igual:</p>
<ul>
<li><b>Viento de valle (diurno):</b> sopla <b>valle arriba</b>, desde la llanura hacia la cabecera. Se instala más tarde que la brisa de ladera, hacia media mañana, y alcanza su máximo a primera hora de la tarde. Puede ser de unos 10-20 km/h o más en valles grandes.</li>
<li><b>Viento de montaña (nocturno):</b> sopla <b>valle abajo</b>, desde la cabecera hacia la llanura. Empieza tras el anochecer y es más fuerte en la segunda mitad de la noche y al amanecer.</li>
</ul>
<p>Entre uno y otro hay ratos de calma o de viento flojo y variable: a media mañana y al anochecer.</p>
<div class="box tech"><b>Dato técnico</b>Estos vientos son típicos de días con <b>cielo despejado y viento general flojo</b>, sobre todo en verano y en situaciones anticiclónicas. Si hay un viento general fuerte (cierzo, poniente, un temporal del oeste), el viento local queda tapado. En días nublados apenas se desarrollan porque el sol no calienta las laderas.</div>

<h3>Por qué cambia el viento a mediodía</h3>
<p>Muchos montañeros notan que el viento «se gira» hacia el mediodía. Es el relevo: el aire frío de la noche, que bajaba, deja de hacerlo; las laderas soleadas ya han calentado el aire; y el viento de valle, que necesita que se caliente todo el valle, se instala. Al mismo tiempo empieza la <b>convección</b>: burbujas de aire caliente suben, se forman cúmulos sobre las cumbres y el viento se vuelve racheado e irregular. Cerca de la costa se suma la <b>brisa marina</b>, que entra desde el mar por la tarde y puede remontar muchos kilómetros por los valles (en sierras como la Tramuntana mallorquina, el Montseny o las sierras de Málaga y Alicante se nota bien).</p>
<p>Además, las brisas de valle convergen en las cumbres y las crestas: el aire de las dos vertientes sube hacia la cresta. Por eso las primeras nubes del día se forman justo encima de las cumbres y por eso las tormentas de verano nacen ahí.</p>

<h3>Vientos catabáticos: cuando el frío cae</h3>
<p>Catabático significa «que baja». En sentido amplio, cualquier viento de aire frío que cae por gravedad por una ladera es catabático. En la montaña española son los vientos de drenaje nocturno, suaves pero constantes, que bajan por barrancos y vaguadas y se notan al anochecer como un soplo frío en la cara. En glaciares y grandes mantos de hielo (Groenlandia, la Antártida) pueden ser violentos. En España, sobre neveros grandes y en los valles más encajados del Pirineo, se nota a veces un aire helado que baja incluso de día, enfriado por la nieve.</p>

<h3>Para qué te sirve saberlo</h3>
<ul>
<li><b>Vivac y acampada:</b> no plantes la tienda en el fondo de una vaguada o en un collado estrecho por el que baja el aire frío. Un pequeño rellano a media ladera, algo resguardado, suele estar varios grados más templado.</li>
<li><b>Hogueras y humo:</b> donde estén permitidas, ten en cuenta que de día el humo y las pavesas subirán ladera arriba, hacia el monte. Las brisas ascendentes de mediodía y de la tarde son parte de lo que hace tan rápidos los incendios en ladera.</li>
<li><b>Observar fauna:</b> los animales detectan tu olor. Por la mañana temprano el aire todavía baja hacia el valle: si te acercas desde abajo, tu olor no les llega. A partir de media mañana el aire sube, y quien camina ladera arriba hacia un rebaño de sarrios o cabras montesas les lleva el olor por delante. Los cazadores y fotógrafos de fauna conocen bien este ritmo.</li>
<li><b>Vuelo libre:</b> parapentistas y aves planeadoras (buitres, águilas) aprovechan las ascendencias de ladera y las térmicas de las solanas. Ver a los buitres ganar altura sin batir las alas te dice que las térmicas ya están funcionando.</li>
<li><b>Tormentas:</b> si a media mañana el viento ya sube con fuerza y los cúmulos crecen sobre la cresta, la convección es intensa y conviene adelantar el regreso.</li>
</ul>
<div class="box"><b>En el campo</b>Prueba a soltar un poco de hierba seca o a mirar el humo de una chimenea a distintas horas. A primera hora irá valle abajo; hacia las once, se quedará casi quieto; a primera hora de la tarde subirá decidido valle arriba. Es el reloj del aire de la montaña.</div>`,
  tags: ['brisa', 'brisa de valle', 'brisa de ladera', 'viento anabático', 'viento catabático', 'viento de montaña', 'viento local', 'térmicas', 'convección', 'brisa marina', 'acampada', 'vivac', 'olor', 'fauna', 'parapente'],
  refs: ['AEMET: Glosario y materiales divulgativos sobre vientos locales', 'Whiteman, C. D.: Mountain Meteorology: Fundamentals and Applications', 'Manuales generales de meteorología de montaña']
},
{
  id: 'vientos-regionales', em: '🧭', kicker: 'Meteorología', title: 'Cierzo, tramontana, levante y compañía',
  lead: 'Muchos vientos de España tienen nombre propio porque se repiten siempre por los mismos sitios y con el mismo carácter. No son caprichos locales: los fabrica la combinación de un mapa de presiones concreto y un relieve que los canaliza. Conocerlos es entender el clima de cada comarca.',
  body: `
<h3>La idea común: presión más embudo</h3>
<p>Casi todos estos vientos aparecen cuando hay una diferencia de presión a ambos lados de una barrera montañosa y el aire encuentra un <b>pasillo</b> por donde colarse: un valle largo entre dos cordilleras, un estrecho entre dos continentes, un collado. Al estrecharse el paso, el aire se acelera, igual que el agua de un río en un desfiladero. Por eso estos vientos son mucho más fuertes en unos puntos concretos que en las comarcas de alrededor.</p>
<p>El nombre de un viento indica, por tradición, <b>de dónde viene</b>: el viento del norte viene del norte y sopla hacia el sur.</p>

<h3>Cierzo</h3>
<p>Viento del <b>noroeste</b> que recorre el <b>valle del Ebro</b> (La Rioja, Navarra, Aragón) hasta su desembocadura. Aparece cuando hay altas presiones en el Atlántico o el Cantábrico y bajas en el Mediterráneo occidental. El valle, encajado entre el Pirineo y el Sistema Ibérico, hace de embudo. Es <b>seco</b>, frío en invierno y fresco en verano, y limpia el cielo y la contaminación. En Zaragoza puede durar varios días seguidos y sus rachas superan a veces los 100 km/h. Al llegar al delta del Ebro lo llaman <i>mestral</i>. En las sierras ibéricas que lo reciben de cara (Moncayo, sierras de Teruel) aumenta mucho la sensación de frío. Su contrario en Aragón es el <b>bochorno</b>, viento del sureste, cálido y a menudo húmedo en verano.</p>

<h3>Tramontana y mistral</h3>
<p>Son primos. Ambos nacen cuando hay altas presiones sobre el golfo de Vizcaya o Francia y una borrasca en el golfo de Génova o el de León. El aire frío del norte se cuela por dos pasillos:</p>
<ul>
<li><b>Mistral</b>: baja por el valle del Ródano, entre los Alpes y el Macizo Central francés, y sale al golfo de León. Puede llegar con fuerza a Menorca y a la costa catalana.</li>
<li><b>Tramontana</b>: entra por el paso entre el Pirineo y el Macizo Central y cae sobre el <b>Rosellón y el Ampurdán</b>. En el cabo de Creus y en Figueres es legendaria: seca, fría, con rachas que pueden superar los 100 km/h y durar varios días. En Mallorca da nombre a la sierra que recibe ese viento de frente, la serra de Tramuntana.</li>
</ul>
<p>La tramontana deja cielos muy limpios y gran visibilidad, pero también mar muy picado y riesgo de incendio en verano si coincide con sequía.</p>

<h3>Levante</h3>
<p>Viento del <b>este</b>, con dos personalidades muy distintas:</p>
<ul>
<li><b>En el estrecho de Gibraltar</b>, el levante se canaliza entre las montañas de la península y las de Marruecos y sopla con mucha fuerza durante días. En Tarifa es la delicia de los deportes de viento y el tormento de los bañistas. En Cádiz y su campiña suele ser seco y cálido en verano. Sobre el Peñón de Gibraltar forma una nube característica pegada a la roca.</li>
<li><b>En la costa mediterránea</b> (Cataluña, Valencia, Murcia, Almería), el levante viene del mar: es <b>húmedo</b> y es el viento que trae la lluvia a esa costa. Los temporales de levante, sobre todo en otoño e invierno, dan lluvias abundantes, a veces torrenciales, y nevadas en las sierras del interior cercano.</li>
</ul>

<h3>Poniente</h3>
<p>Viento del <b>oeste</b>, también con dos caras:</p>
<ul>
<li><b>En el estrecho</b>, es el viento atlántico: fresco y húmedo.</li>
<li><b>En la costa mediterránea</b>, llega después de cruzar toda la península: es <b>seco y cálido</b>, se calienta al bajar a la costa (efecto foehn) y en verano dispara las temperaturas en Valencia, Murcia o Alicante por encima de 40 °C. Es temido por el riesgo de incendios.</li>
</ul>

<h3>Ábrego</h3>
<p>Viento del <b>suroeste</b>, el viento de las borrascas atlánticas para buena parte de la Meseta y Andalucía occidental. Es templado y húmedo y trae las <b>lluvias</b> de otoño, invierno y primavera a Castilla, Extremadura o Madrid. En las sierras del Sistema Central, el ábrego descarga sobre todo en las vertientes sur y oeste. Su nombre viene del latín <i>africus</i>, el viento de África.</p>

<h3>Terral</h3>
<p>En la costa de <b>Málaga</b>, el terral es un viento del norte o noroeste que baja desde los montes hacia el mar. En verano llega recalentado y muy seco, y sustituye a la brisa marina que habitualmente refresca la costa: son los días en que Málaga capital puede superar los 40 °C. En otras costas, «terral» es simplemente el viento que viene de tierra.</p>

<h3>Siroco y calima</h3>
<p>El <b>siroco</b> (<i>xaloc</i> en catalán) es un viento del <b>sureste</b> que viene del norte de África. Es cálido y en origen muy seco, aunque al cruzar el Mediterráneo se humedece. Muchas veces arrastra <b>polvo del Sáhara</b>: el cielo se vuelve blanquecino o anaranjado, cae «lluvia de barro» que mancha coches y tejados, y la nieve de Sierra Nevada o incluso del Pirineo puede quedar teñida de ocre. En <b>Canarias</b>, los episodios de aire del este o sureste con polvo africano (el «tiempo sur» con calima) traen calor extremo y visibilidad muy reducida.</p>

<h3>Galerna</h3>
<p>La galerna es un fenómeno propio de la <b>costa cantábrica</b>, sobre todo en primavera y verano. Suele llegar tras uno o varios días de viento sur cálido: de repente, a menudo por la tarde, el viento <b>gira bruscamente al noroeste</b>, sopla con rachas fuertes y la temperatura puede caer más de 10 °C en menos de una hora. A veces el día está despejado y el cambio llega casi sin aviso visual, con una línea de nubes bajas desde el oeste. Ha causado grandes tragedias entre los pescadores: la galerna del Sábado de Gloria de 1878 costó la vida a cientos de marineros vascos y cántabros.</p>
<p>En la montaña cantábrica (Picos de Europa, macizos vascos), la entrada de la galerna puede suponer niebla repentina, frío y viento después de una mañana calurosa.</p>

<h3>Otros nombres que oirás</h3>
<ul>
<li><b>Solano</b>: viento del este en el interior sur (La Mancha, Andalucía interior), cálido y seco en verano.</li>
<li><b>Gallego</b>: viento del noroeste en Castilla, frío, que «viene de Galicia».</li>
<li><b>Moncaíno</b>: el viento frío del noroeste que baja del Moncayo hacia las tierras de su entorno.</li>
</ul>
<p>Los nombres cambian de un valle a otro y un mismo nombre puede designar vientos distintos en dos comarcas. Si llegas a un sitio nuevo, pregunta: el nombre local de un viento suele llevar incluida su descripción.</p>
<div class="box"><b>En el campo</b>Cuando la previsión anuncie cierzo, tramontana o poniente fuerte, piensa en el pasillo por el que entra: los collados, crestas y valles orientados en esa dirección tendrán rachas mucho más fuertes que lo que marca la previsión general. Con cierzo o tramontana, el cielo limpio engaña: la sensación térmica en una cresta puede estar muchos grados por debajo de la temperatura del aire.</div>`,
  tags: ['viento', 'cierzo', 'tramontana', 'mistral', 'levante', 'poniente', 'ábrego', 'terral', 'siroco', 'xaloc', 'galerna', 'bochorno', 'solano', 'calima', 'polvo sahariano', 'mestral', 'vientos regionales'],
  refs: ['AEMET: Glosario y materiales divulgativos sobre vientos regionales de España', 'AEMET: Atlas climático ibérico', 'Manuales generales de climatología de España']
},
{
  id: 'sensacion-termica', em: '🌬️', kicker: 'Seguridad', title: 'Viento, humedad y sensación térmica',
  lead: 'El termómetro mide la temperatura del aire, pero tu cuerpo no siente temperaturas: siente pérdidas de calor. El viento, la humedad y la ropa mojada pueden hacer que 5 °C sean más peligrosos que −5 °C en calma. Entender cómo se pierde el calor es la mejor prevención contra la hipotermia y la congelación.',
  body: `
<h3>Cómo pierde calor el cuerpo</h3>
<p>Tu cuerpo produce calor continuamente y lo pierde por varias vías:</p>
<ul>
<li><b>Convección:</b> el aire que te rodea se calienta con tu piel y se va; si hay viento, se renueva constantemente y te roba calor muy deprisa.</li>
<li><b>Conducción:</b> al tocar algo frío (el suelo, una roca, la nieve). El agua conduce el calor unas 25 veces mejor que el aire: la ropa mojada o sentarse en la nieve enfría muchísimo.</li>
<li><b>Radiación:</b> tu cuerpo emite calor hacia el entorno, sobre todo en noches despejadas.</li>
<li><b>Evaporación:</b> el sudor que se evapora se lleva calor. En verano es lo que te refresca; en invierno, si sudas al subir y paras en un collado ventoso, es lo que te hiela.</li>
<li><b>Respiración:</b> calientas y humedeces el aire que respiras y lo expulsas.</li>
</ul>

<h3>Viento: el índice de enfriamiento</h3>
<p>Alrededor de la piel hay siempre una fina capa de aire templado que te aísla. El viento la arrastra. Por eso, con la misma temperatura, sientes mucho más frío si sopla. La <b>sensación térmica por viento</b> (o índice de enfriamiento) expresa a qué temperatura en calma sentirías la misma pérdida de calor en la piel expuesta. Es la que usan AEMET y otros servicios meteorológicos en invierno.</p>
<div class="box tech"><b>Algunos ejemplos aproximados</b>Con 0 °C y viento de 50 km/h, la sensación térmica es de unos −8 °C. Con −5 °C y viento de 30 km/h, de unos −13 °C. Con −10 °C y viento de 50 km/h, de unos −22 °C. A partir de sensaciones de unos −25 a −30 °C, la piel expuesta puede congelarse en pocos minutos.</div>
<p>Un detalle importante: el índice no hace que los objetos bajen de la temperatura del aire. Si hay 2 °C con viento fuerte, el agua no se congelará aunque la sensación sea de −5 °C. Lo que cambia es la <b>velocidad</b> con que te enfrías tú.</p>

<h3>Humedad: frío húmedo y calor húmedo</h3>
<p>En invierno, el frío húmedo cala más por varias razones: la ropa absorbe humedad y aísla peor, y el aire húmedo suele ir con niebla, llovizna o nieve que te mojan. Es muy típico en las sierras atlánticas y cantábricas y en los valles con niebla. En verano ocurre lo contrario: con mucha humedad el sudor no se evapora bien y el cuerpo no logra refrescarse, por lo que el calor húmedo agota más que el seco. Para eso existe otro índice, el de calor.</p>

<h3>Hipotermia: cuando el cuerpo pierde la batalla</h3>
<p>Hay hipotermia cuando la temperatura interna del cuerpo baja de unos 35 °C. No hace falta un frío extremo: muchas hipotermias en montaña se producen con temperaturas de varios grados sobre cero, <b>lluvia, viento y cansancio</b>. Afecta más a quien está agotado, mal alimentado, mojado, inmóvil por una lesión, a niños y a personas mayores.</p>
<p>Señales de alerta, de menos a más grave:</p>
<ul>
<li>Escalofríos intensos, manos torpes, dificultad para abrocharse o abrir la mochila.</li>
<li>Andar tropezando, hablar arrastrando las palabras, quedarse atrás, apatía («déjame aquí, estoy bien»).</li>
<li>Confusión, decisiones absurdas. Que alguien deje de tiritar sin haber entrado en calor es un mal signo, no una mejoría.</li>
</ul>
<p>Qué hacer, en general:</p>
<ul>
<li><b>Detén la pérdida de calor</b>: busca resguardo del viento, aísla a la persona del suelo (mochila, esterilla), cambia la ropa mojada por seca si es posible, añade capas, gorro y guantes, y envuelve con una manta térmica o un saco.</li>
<li>Si está consciente y traga bien, puede tomar <b>bebidas templadas y azucaradas</b> y algo de comida. Nunca alcohol: da sensación de calor pero aumenta la pérdida.</li>
<li>Maneja a la persona con suavidad, sin frotarla ni hacerla caminar si está muy afectada.</li>
<li>Ante cualquier síntoma de confusión o somnolencia, <b>llama al 112</b>. La hipotermia grave requiere atención sanitaria.</li>
</ul>

<h3>Congelación</h3>
<p>Es la lesión de los tejidos por frío, sobre todo en <b>dedos de manos y pies, nariz, orejas y mejillas</b>. Al principio la piel se pone pálida o blanquecina, fría y adormecida; después, dura e insensible. Lo favorecen el viento, la humedad, el calzado y los guantes apretados, el tabaco, el agotamiento y no comer ni beber.</p>
<ul>
<li>Ante los primeros síntomas (piel blanca e insensible en una zona pequeña), resguárdate y calienta esa zona con el propio cuerpo: manos en las axilas, la mano sobre la cara.</li>
<li><b>No frotes</b> la piel, y menos con nieve, ni la acerques a una fuente de calor intensa (fuego, hornillo): puedes quemar una piel que no siente.</li>
<li>Si la congelación es más que superficial o hay ampollas, protege la zona y busca asistencia sanitaria. El recalentamiento de una congelación profunda debe hacerse con criterio médico, sobre todo porque si se vuelve a congelar el daño es mucho mayor.</li>
</ul>

<h3>Prevención: lo que de verdad funciona</h3>
<ul>
<li><b>Sistema de capas</b>: una capa que aleje el sudor de la piel (no algodón, que se empapa y no seca), una capa aislante (forro polar, plumífero) y una capa exterior contra viento y agua. Quita capas antes de sudar al subir y póntelas antes de enfriarte al parar.</li>
<li>Lleva siempre <b>gorro, guantes</b> y una capa de abrigo extra, aunque salgas con sol. En montaña, en cualquier estación.</li>
<li><b>Come y bebe</b> con regularidad: el cuerpo necesita combustible para producir calor.</li>
<li>Evita estar parado en collados y crestas ventosas; busca el resguardo de una roca para las paradas.</li>
<li>Vigila a tus compañeros: la persona con hipotermia es la última en darse cuenta.</li>
<li>Usa calzado que no apriete con los calcetines gordos: el pie necesita circulación.</li>
</ul>
<div class="box"><b>En el campo</b>Si la previsión da 5 °C, lluvia y viento de 40 km/h en la cresta, prepárate como si fuera un día de helada. Muchos rescates por hipotermia en las sierras españolas ocurren en primavera y otoño, no en pleno invierno, porque la gente sale con ropa de entretiempo.</div>`,
  tags: ['sensación térmica', 'viento', 'humedad', 'frío', 'hipotermia', 'congelación', 'enfriamiento', 'índice de enfriamiento', 'wind chill', 'ropa', 'capas', 'calor húmedo', 'seguridad', 'primeros auxilios'],
  refs: ['AEMET: Sensación térmica (índice de enfriamiento por viento e índice de calor)', 'Comisión Médica de la UIAA: recomendaciones sobre hipotermia y congelación', 'Federación Española de Deportes de Montaña y Escalada: materiales de seguridad', 'Servicio Meteorológico de Canadá: índice de enfriamiento por viento']
},
{
  id: 'solana-umbria', em: '☀️', kicker: 'Física', title: 'Solana y umbría: el sol de lado',
  lead: 'Dos laderas del mismo barranco, a la misma altitud, pueden tener climas tan distintos como dos pueblos separados por cientos de kilómetros. La causa es geométrica: el ángulo con el que llegan los rayos del sol. Con un poco de trigonometría de andar por casa se entiende por qué la nieve dura en una ladera y se va en la otra.',
  body: `
<h3>El sol de frente calienta más</h3>
<p>Un haz de rayos de sol transporta una cantidad de energía fija. Si cae perpendicular a una superficie, toda esa energía se concentra en poca área. Si cae inclinado, se reparte en una superficie mayor y cada metro cuadrado recibe menos. Es lo mismo que pasa con una linterna: apuntando de frente a la pared hace un círculo pequeño y brillante; ladeada, una mancha alargada y más tenue.</p>
<p>Por eso el sol de mediodía calienta más que el de la mañana, el de verano más que el de invierno, y una ladera inclinada hacia el sol recibe más energía que el llano.</p>

<h3>La altura del sol en España</h3>
<p>A mediodía solar, el sol alcanza en el centro de la península (unos 40° de latitud) una altura sobre el horizonte de aproximadamente:</p>
<ul>
<li><b>Unos 73°</b> en el solsticio de verano (21 de junio).</li>
<li><b>Unos 50°</b> en los equinoccios (marzo y septiembre).</li>
<li><b>Unos 27°</b> en el solsticio de invierno (21 de diciembre).</li>
</ul>
<p>En invierno, por tanto, el sol va muy bajo y siempre por el sur. Ahí es donde la orientación de la ladera lo cambia todo.</p>
<div class="box tech"><b>Un cálculo sencillo</b>En pleno invierno, a mediodía, el sol está a unos 27° sobre el horizonte. Una ladera orientada al norte con una pendiente de 30° está «inclinada hacia atrás» más de lo que sube el sol: <b>no recibe sol directo ni siquiera a mediodía</b>. Una ladera orientada al sur con la misma pendiente recibe los rayos con un ángulo de casi 57°, y a esa hora llega a cada metro cuadrado de su superficie casi el doble de energía que al terreno llano. Entre las dos laderas hay, en diciembre, una diferencia enorme de energía recibida.</div>

<h3>Solana, umbría y sus nombres</h3>
<p>La <b>solana</b> es la ladera orientada al sur (en sentido amplio, del sureste al suroeste). La <b>umbría</b>, la orientada al norte. En distintas zonas reciben otros nombres: <b>paco</b> o <b>ubago</b> en partes de Aragón, Castilla y Murcia; <b>avesedo</b> o <b>abesedo</b> en el Pirineo aragonés; <i>obaga</i> y <i>solana</i> o <i>solà</i> en catalán; <i>adret</i> y <i>ubac</i> en francés. Muchos topónimos llevan estas palabras: te dicen cómo es el sitio antes de llegar.</p>
<p>Las laderas que miran al <b>este</b> reciben el sol por la mañana, cuando el aire aún está fresco y a veces hay rocío; las que miran al <b>oeste</b> lo reciben por la tarde, cuando el aire ya está caliente y seco. Por eso las laderas al suroeste suelen ser las más cálidas y secas, más incluso que las orientadas exactamente al sur.</p>

<h3>Efectos en la temperatura</h3>
<ul>
<li>De día, la solana se calienta antes y más; la umbría se queda fresca. La diferencia es máxima en invierno y en días despejados, y casi desaparece en días nublados.</li>
<li>De noche las dos pierden calor por radiación. Pero la umbría parte de más frío y su suelo, más húmedo y a menudo nevado, almacena menos calor.</li>
<li>La diferencia, en promedio, es comparable a varios cientos de metros de altitud: los pisos de vegetación suben en las solanas y bajan en las umbrías.</li>
</ul>

<h3>Efectos en la nieve y el hielo</h3>
<ul>
<li><b>La nieve dura mucho más en las umbrías</b>: semanas o meses. Los neveros que llegan al verano están casi siempre en caras norte y en hondonadas protegidas.</li>
<li>En las <b>solanas</b>, la nieve se transforma rápido: se ablanda al sol, se vuelve a helar de noche y forma costras. En primavera, a mediodía, las solanas son las primeras en soltar <b>aludes de nieve húmeda</b>; por eso se recomienda recorrerlas temprano.</li>
<li>En las <b>umbrías</b> la nieve se mantiene fría y polvo más tiempo, pero también conserva más tiempo las capas débiles internas, y en los caminos el <b>hielo</b> persiste días después de que la solana esté seca.</li>
</ul>

<h3>Efectos en la vegetación y la vida</h3>
<ul>
<li>En un mismo barranco del Sistema Ibérico verás <b>carrascas, sabinas, aliagas y romero</b> en la solana, y <b>pino silvestre, quejigo, acebo, tejo o boj</b> en la umbría.</li>
<li>En el Pirineo, los <b>hayedos y abetales</b> ocupan las umbrías húmedas y los pinares y prados secos, las solanas.</li>
<li>En Sierra Nevada o en las sierras béticas, las umbrías guardan especies de climas más frescos que en la solana de enfrente no podrían vivir.</li>
<li>Los <b>reptiles</b> y muchos insectos buscan las solanas para calentarse; en invierno, rebecos, cabras montesas y ciervos frecuentan las solanas donde hay menos nieve y brota antes la hierba. En verano, muchos animales hacen lo contrario.</li>
<li>Los <b>pueblos tradicionales</b> de montaña se construyen en la solana: más horas de sol, menos hielo, cultivos más tempranos. La umbría se dejaba para el bosque y la leña.</li>
</ul>

<h3>Cómo lo calcula Otero</h3>
<p>Para el punto que consultas, Otero mira la altitud del terreno a su alrededor (en anillos a unos 150 y 400 m) y ajusta un plano: así estima la <b>pendiente</b> y hacia dónde <b>mira</b> la ladera, es decir, hacia dónde baja. Si el terreno es casi llano (menos de unos 5° de pendiente), no tiene sentido hablar de solana o umbría y no lo indica. Si la ladera mira entre el sureste y el suroeste, la clasifica como <b>solana</b>; entre el noroeste y el nordeste, como <b>umbría</b>; si mira al este o al oeste, te dice si es ladera de <b>levante</b> (sol de mañana) o de <b>poniente</b> (sol de tarde).</p>
<div class="box"><b>En el campo</b>Con la brújula del móvil o mirando dónde está el sol a mediodía, identifica la solana y la umbría del valle. En invierno, planea el regreso por la solana si temes hielo en el camino, y en primavera, si hay nieve, cruza las solanas empinadas temprano, antes de que el sol ablande la nieve. Fíjate también en lo que crece en cada lado: las plantas son un registro de muchos años de sol y sombra.</div>`,
  tags: ['solana', 'umbría', 'paco', 'ubago', 'obaga', 'orientación', 'ladera', 'sol', 'radiación solar', 'ángulo del sol', 'pendiente', 'exposición', 'nieve', 'vegetación', 'levante', 'poniente', 'microclima'],
  refs: ['AEMET: materiales divulgativos sobre radiación solar', 'Manuales generales de climatología y geografía física', 'Manuales de nivología y aludes (efecto de la orientación en la nieve)']
},
{
  id: 'heladas', em: '❄️', kicker: 'Meteorología', title: 'Heladas, escarcha y cencellada',
  lead: 'No todas las heladas son iguales. Unas llegan en noches despejadas y tranquilas y se quedan en los fondos de valle; otras las trae un viento helado y alcanzan las cumbres. Y el hielo que forman puede ser de agujas, de plumas, de cristal invisible sobre el asfalto. Conocerlas ayuda a prever dónde patinarás mañana.',
  body: `
<h3>Qué es una helada</h3>
<p>Hay helada cuando la temperatura del aire baja de 0 °C. Las estaciones meteorológicas la miden a 1,5 m del suelo, a la sombra. Pero junto al suelo, en una noche despejada, puede hacer varios grados menos: por eso a veces hay escarcha en la hierba y el coche aunque la estación marque 2 o 3 °C. Los agricultores llaman a eso <b>helada de suelo</b>.</p>

<h3>Helada de radiación</h3>
<p>Es la más frecuente en el interior peninsular. Se produce en <b>noches despejadas, con poco viento y aire seco</b>: el suelo pierde calor hacia el cielo, enfría el aire que toca y ese aire frío se acumula en las partes bajas.</p>
<ul>
<li>Es más intensa en <b>fondos de valle, hoyas, dolinas y navas</b> que en las laderas y lomas cercanas.</li>
<li>Es típica de situaciones de anticiclón, en otoño, invierno y primavera.</li>
<li>Se combate con nubes (que hacen de manta) o con viento (que mezcla el aire).</li>
<li>Las <b>heladas tardías</b> de primavera, en noches serenas tras días templados, son las que dañan brotes y flores.</li>
</ul>
<p>Es la helada de la inversión térmica (ver «Inversión térmica: cuando el frío se encharca»).</p>

<h3>Helada de advección</h3>
<p>Aquí el frío no se fabrica en el sitio: llega <b>con una masa de aire</b> muy fría, generalmente con viento del norte o del nordeste en las olas de frío.</p>
<ul>
<li>Afecta a todo el relieve, <b>también a lomas y cumbres</b>, y suele ser peor cuanto más alto estás.</li>
<li>Puede helar a cualquier hora del día y aunque esté nublado.</li>
<li>Con viento, la sensación térmica es mucho más baja que la temperatura.</li>
</ul>
<p>En las grandes olas de frío se combinan las dos: el aire frío llega por advección y, cuando el viento cae, las noches despejadas lo enfrían aún más por radiación.</p>

<h3>Escarcha</h3>
<p>Es el hielo que se forma cuando el <b>vapor de agua del aire pasa directamente a hielo</b> sobre una superficie que está bajo cero, sin pasar por líquido. Forma cristales en agujas, plumas, hojitas y helechos sobre la hierba, los coches, las hojas o la nieve. Es el equivalente helado del rocío y se forma en las mismas condiciones: noches despejadas y en calma. Cuando la escarcha se forma sobre la superficie de la nieve y luego queda enterrada por una nevada, puede convertirse en una <b>capa débil</b> peligrosa para los aludes.</p>

<h3>Cencellada</h3>
<p>Con <b>niebla</b> y temperaturas bajo cero, las gotitas de la niebla pueden seguir siendo líquidas (se dice que están <b>subenfriadas</b>). Al chocar con un objeto se congelan al instante y forman una capa de hielo blanco y opaco: la <b>cencellada</b> (en catalán, <i>galaverna</i>; en Aragón se llama «dorondón» a la niebla helada que la produce). Cubre árboles, vallas y cables con un manto blanco que puede ser muy grueso.</p>
<ul>
<li>A diferencia de la escarcha, la cencellada <b>crece hacia el viento</b>: forma «banderas» o crestas de hielo apuntando hacia donde viene la niebla. Es una veleta natural.</li>
<li>Es frecuente en las cumbres y en los valles con niebla persistente: Moncayo, Montseny, sierras de Teruel y de Soria, páramos castellanos, la depresión del Ebro.</li>
<li>Su peso puede romper ramas y tumbar tendidos eléctricos.</li>
</ul>

<h3>Lluvia engelante y hielo transparente</h3>
<p>A veces cae lluvia líquida a temperaturas bajo cero en el suelo (porque en altura hay una capa más cálida). Al tocar el suelo, las ramas o el asfalto, se congela formando una capa de <b>hielo liso y transparente</b>, extremadamente resbaladiza. En España es poco frecuente pero ocurre en el interior y en valles pirenaicos.</p>

<h3>Helada negra: dos sentidos</h3>
<ul>
<li>Para los agricultores, una <b>helada negra</b> es una helada con aire tan seco que no se forma escarcha. No se ve blanco, pero las plantas se congelan por dentro y después ennegrecen. Suele ser más dañina que la helada blanca, en parte porque la escarcha, al formarse, libera algo de calor.</li>
<li>En carretera y caminos se llama «hielo negro» a una <b>película fina y transparente de hielo</b> sobre el asfalto o la roca, que deja ver el color oscuro del firme y parece simplemente mojado. Es el más traicionero.</li>
</ul>

<h3>Hielo en caminos de montaña: dónde esperarlo</h3>
<ul>
<li>En las <b>umbrías</b> y tramos de bosque cerrado, donde el sol no llega en invierno.</li>
<li>Donde <b>rezuma agua</b>: pies de cortados, fuentes, surgencias, losas de roca por las que escurre el deshielo.</li>
<li>En caminos con nieve pisada que se funde de día y se vuelve a helar de noche: a primera hora están como una pista de patinaje.</li>
<li>En <b>puentes y pasarelas</b>, que se enfrían por arriba y por abajo.</li>
<li>Tras una noche despejada siguiente a un día de deshielo o de lluvia.</li>
</ul>
<p>También verás <b>agujas de hielo</b> que levantan la tierra y pequeñas piedras en los taludes y caminos de suelo húmedo: el agua del suelo se congela en columnas que crecen desde abajo. Es una de las formas en que el hielo remueve el suelo de la montaña.</p>
<div class="box"><b>En el campo</b>En invierno, no te fíes de que el camino estaba seco al subir: si el regreso es de tarde por una umbría, puede estar helado. Unos microcrampones ligeros o unos crampones, según el terreno, pesan poco y evitan muchas caídas. Si ves cencellada en los árboles, fíjate hacia dónde apuntan las crestas de hielo: te dicen de dónde soplaba el viento húmedo.</div>`,
  tags: ['helada', 'helada de radiación', 'helada de advección', 'escarcha', 'cencellada', 'dorondón', 'galaverna', 'helada negra', 'hielo negro', 'lluvia engelante', 'hielo', 'caminos helados', 'agujas de hielo', 'frío', 'ola de frío'],
  refs: ['AEMET: Glosario (helada, escarcha, cencellada)', 'Organización Meteorológica Mundial: Atlas Internacional de Nubes (sección de hidrometeoros)', 'Manuales generales de agrometeorología']
},
{
  id: 'nieblas', em: '🌫️', kicker: 'Meteorología', title: 'Nieblas: nubes a ras de suelo',
  lead: 'Una niebla es una nube que toca el suelo. Pero no todas se forman igual: unas nacen en noches frías en el fondo de los valles, otras llegan del mar, otras suben pegadas a las laderas. Saber de qué tipo es te dice cuánto durará, hasta qué altura llega y si saldrás de ella subiendo.',
  body: `
<h3>Qué es la niebla</h3>
<p>En meteorología se habla de <b>niebla</b> cuando las gotitas de agua en suspensión reducen la visibilidad a menos de 1 km; si la visibilidad es mayor, es <b>neblina</b>. Para que se forme, el aire tiene que enfriarse hasta su punto de rocío (la temperatura a la que se satura) o recibir tanta humedad que se sature. Según cómo ocurra, hay varios tipos.</p>

<h3>Niebla de radiación</h3>
<p>Es la niebla del interior en invierno. En noches largas, despejadas y sin viento, el suelo se enfría por radiación, enfría el aire que tiene encima y, si ese aire tiene humedad suficiente, se condensa. Como el aire frío baja y se acumula en las partes bajas, la niebla se forma <b>en los fondos de valle, vegas y depresiones</b>.</p>
<ul>
<li>Es típica con <b>anticiclón</b> en otoño e invierno.</li>
<li>Suele tener techo bajo: decenas o pocos cientos de metros. Por encima, cielo despejado.</li>
<li>En días cortos de invierno puede no levantarse en todo el día y durar semanas: es la «niebla persistente» de la <b>depresión del Ebro</b> (la <i>boira</i> de Lleida), la <b>cuenca del Duero</b> o los valles de Castilla, Navarra y Aragón.</li>
<li>Va con <b>inversión térmica</b>: dentro de la niebla hace frío y humedad; por encima, mucho más templado.</li>
</ul>

<h3>Niebla de advección</h3>
<p>Se forma cuando <b>aire cálido y húmedo se desplaza sobre una superficie más fría</b> (mar frío, tierra fría o nieve) y se enfría por abajo. Es la niebla de las costas atlánticas: en <b>Galicia</b> (la <i>brétema</i>), en verano, cuando el agua de las rías y de la costa está fría por el afloramiento de aguas profundas, y en la cornisa cantábrica. Puede entrar tierra adentro por los valles y subir por las laderas. A diferencia de la de radiación, puede formarse con viento y a cualquier hora.</p>

<h3>Niebla de ladera u orográfica</h3>
<p>Cuando el viento empuja aire húmedo contra una montaña, el aire sube, se enfría y se condensa. Desde el valle se ve como una nube pegada a la sierra; desde dentro, es niebla. Es la niebla de las <b>sierras atlánticas y cantábricas</b> con viento del norte o del oeste, y la que forma la <b>nube de estancamiento</b> a barlovento de las cordilleras. Puede ser muy persistente mientras dure el viento y suele traer llovizna.</p>
<p>En las <b>Canarias</b> occidentales y centrales, los alisios húmedos del nordeste chocan con las laderas norte de las islas altas y forman un mar de nubes casi permanente a media altura. Los árboles de la <b>laurisilva</b> (Garajonay en La Gomera, Anaga en Tenerife) capturan en sus hojas el agua de esa niebla, que gotea al suelo: es la «lluvia horizontal», una aportación de agua muy importante para esos bosques.</p>

<h3>Niebla de evaporación</h3>
<p>Cuando aire muy frío pasa sobre agua más templada (un río, un embalse, un lago), el agua se evapora y el vapor se condensa enseguida en el aire frío: parece que el agua «humea». Se ve en mañanas heladas de otoño e invierno sobre ríos y embalses de montaña. Suele ser poco espesa y desaparece al calentar el sol.</p>

<h3>El mar de nubes</h3>
<p>Si subes desde un valle cubierto de niebla de radiación, en algún momento atraviesas su techo y sales al sol: a tus pies queda un <b>mar de nubes</b> plano, del que asoman las sierras. Ese techo es el de la capa de inversión: el aire frío y húmedo está debajo; el aire cálido y seco, encima. Es un espectáculo frecuente en invierno desde el Moncayo, el Montsec, el Montseny, la sierra de Guara, las sierras de Teruel, la de Guadarrama o los Picos de Europa.</p>
<div class="box tech"><b>Dato técnico</b>La niebla de radiación se disipa «desde abajo»: el sol calienta el suelo a través de la niebla, el aire de abajo se calienta y las gotitas se evaporan. A menudo, antes de desaparecer, se levanta y se convierte en una capa de nubes bajas (estratos). Cuanto más espesa es la niebla y más corto el día, más difícil es que se disipe: por eso en diciembre y enero algunas nieblas aguantan todo el día.</div>

<h3>Peligros en la montaña</h3>
<ul>
<li><b>Desorientación</b>: en niebla densa se pierden las referencias y es fácil salir del camino, sobre todo en zonas llanas y amplias (parameras, cumbres redondeadas, pastos alpinos) y en terreno nevado. Lleva el recorrido preparado, mapa y brújula o GPS con la batería cargada, y no te fíes de la intuición.</li>
<li><b>Cencellada y hielo</b>: con temperaturas bajo cero, la niebla forma hielo en rocas, cadenas y caminos.</li>
<li><b>Frío húmedo</b>: dentro de la niebla la ropa se empapa sin que llueva.</li>
<li><b>Cornisas y bordes</b>: en una cumbre con niebla y nieve se confunden el suelo y el cielo («luz plana»). Aléjate de los bordes de los cortados.</li>
</ul>
<div class="box"><b>En el campo</b>En invierno con anticiclón, si en tu valle hay niebla, mira las webcams o la previsión de nubosidad: es muy posible que unos cientos de metros más arriba haga sol y más temperatura. Si bajas de la montaña hacia una niebla, cuenta con que el frío y la humedad aumentarán al entrar en ella, y con que la carretera del fondo puede estar helada.</div>`,
  tags: ['niebla', 'neblina', 'niebla de radiación', 'niebla de advección', 'niebla de ladera', 'niebla orográfica', 'niebla de evaporación', 'boira', 'brétema', 'mar de nubes', 'inversión térmica', 'lluvia horizontal', 'laurisilva', 'visibilidad', 'orientación'],
  refs: ['AEMET: Glosario y notas divulgativas sobre nieblas', 'Organización Meteorológica Mundial: Atlas Internacional de Nubes', 'Manuales generales de meteorología y climatología de Canarias']
},
{
  id: 'nieve-aludes', em: '🌨️', kicker: 'Nieve', title: 'La nieve por dentro y el peligro de aludes',
  lead: 'Un copo de nieve es un cristal de hielo crecido en el aire, y un manto de nieve es un material vivo que cambia cada día con el frío, el sol y el viento. De esos cambios depende que la nieve esté bien asentada o que una ladera entera pueda deslizarse. Este artículo da nociones para entenderlo; para moverse por terreno de aludes hace falta formación específica.',
  body: `
<h3>Cómo nace un copo</h3>
<p>Dentro de una nube a temperaturas bajo cero conviven gotitas de agua líquida subenfriada y algunos cristales de hielo. El vapor de agua tiende a depositarse sobre el hielo antes que sobre el agua líquida, así que los cristales crecen a costa de las gotitas. El cristal se forma sobre un núcleo diminuto (polvo, partículas minerales o biológicas) y, por la estructura de la molécula de agua, crece con <b>simetría hexagonal</b>: seis puntas o seis caras.</p>
<p>Su forma depende sobre todo de la <b>temperatura</b> y de la <b>humedad</b> de la nube donde crece:</p>
<ul>
<li>Cerca de 0 °C a unos −3 °C: placas finas.</li>
<li>Alrededor de −5 °C: agujas y columnas.</li>
<li>De unos −10 °C a −20 °C: placas y, con mucha humedad, las <b>estrellas ramificadas (dendritas)</b>, las del dibujo clásico, que crecen mejor hacia los −15 °C.</li>
<li>Más frío: columnas y placas pequeñas.</li>
</ul>
<p>Cuando los cristales chocan con gotitas subenfriadas se recubren de hielo granuloso y, si el proceso sigue, se convierten en bolitas blancas y blandas: la <b>nieve granulada</b> o granizo blando, típica de chubascos y tormentas de primavera. Con temperaturas cercanas a 0 °C, los cristales se enganchan unos con otros y caen <b>copos grandes</b>, de varios centímetros: nieve muy húmeda y pesada.</p>
<div class="box tech"><b>Dato técnico</b>La nieve recién caída es sobre todo aire. Como orden de magnitud, 1 cm de nieve nueva equivale a 1 mm de agua (1 l/m²), pero la proporción varía mucho: la nieve polvo muy fría puede ser bastante más ligera y la nieve húmeda varias veces más densa. Una nevada de 30 cm de nieve húmeda pesa mucho más sobre un tejado o una ladera que 30 cm de nieve polvo.</div>

<h3>La nieve en el suelo cambia</h3>
<p>Una vez en el suelo, los cristales empiezan a transformarse (los nivólogos lo llaman <b>metamorfismo</b>). Lo que ocurre depende de la diferencia de temperatura dentro del manto: abajo, en contacto con el suelo, la nieve está cerca de 0 °C; arriba, en contacto con el aire, puede estar mucho más fría.</p>
<ul>
<li><b>Redondeo (gradiente débil):</b> con mantos gruesos y temperaturas suaves, las puntas de los cristales se pierden y los granos se redondean y se unen entre sí. La nieve se <b>asienta</b> y gana cohesión. Es la evolución «buena».</li>
<li><b>Facetado (gradiente fuerte):</b> con mantos finos y frío intenso (muy típico en noches despejadas de principio de temporada), el vapor sube por el manto y forma granos con caras planas y, en casos extremos, cristales huecos en forma de vaso o pirámide: la <b>escarcha de profundidad</b> o cubiletes. Es una nieve sin cohesión, como azúcar, y forma <b>capas débiles</b> que pueden durar semanas.</li>
<li><b>Fusión y rehielo:</b> el sol o el aire cálido funden los granos, que de noche se vuelven a helar. Se forman granos gruesos y <b>costras</b>. En primavera da la nieve «transformada», dura por la mañana y blanda al mediodía.</li>
<li><b>Viento:</b> rompe los cristales y los transporta. Donde el viento pierde fuerza, a sotavento de crestas y en canales y hondonadas, deposita nieve compacta en <b>placas de viento</b> y construye <b>cornisas</b> sobre las crestas.</li>
<li><b>Escarcha de superficie:</b> en noches frías y despejadas se forman sobre la nieve cristales de escarcha en forma de plumas. Muy bonita… y muy peligrosa si una nevada la entierra, porque se convierte en una capa débil.</li>
</ul>

<h3>Qué es un alud</h3>
<p>Un alud es una masa de nieve que se desliza rápidamente por una pendiente. Los principales tipos:</p>
<ul>
<li><b>Alud de nieve suelta:</b> empieza en un punto y se va ensanchando en forma de pera. Suele ser de nieve reciente o de nieve húmeda.</li>
<li><b>Alud de placa:</b> una capa de nieve cohesionada se rompe a lo largo de una línea de fractura y se desliza de golpe sobre una capa débil. Son los responsables de la mayoría de los accidentes graves, y en la mayoría de esos accidentes la placa la desencadena la propia víctima o su grupo.</li>
<li><b>Alud de nieve húmeda o de fusión:</b> frecuentes en primavera o tras lluvia o subida brusca de temperatura, a menudo a partir del mediodía en las solanas.</li>
<li><b>Deslizamiento basal:</b> todo el manto desliza sobre el suelo (hierba, losas de roca), a veces tras abrir grietas visibles días antes.</li>
</ul>
<p>La mayoría de las placas se desencadenan en pendientes de <b>unos 30° a 45°</b>. Por debajo de unos 30° es raro que salgan, pero un alud puede llegar desde una ladera más empinada situada encima.</p>

<h3>Señales de alarma</h3>
<ul>
<li>Aludes recientes en laderas parecidas a la tuya.</li>
<li>Ruidos sordos («¡uuuf!») al pisar y <b>grietas que se propagan</b> desde tus esquís o raquetas: el manto está colapsando sobre una capa débil.</li>
<li>Nevada importante reciente o lluvia sobre la nieve.</li>
<li>Viento fuerte que transporta nieve (se ven «humos» de nieve en las crestas).</li>
<li>Subida rápida de la temperatura o mucha radiación sobre nieve reciente.</li>
</ul>

<h3>El boletín de peligro de aludes</h3>
<p>En Europa se usa una <b>escala común de peligro de 5 niveles</b>. En España, AEMET publica durante la temporada boletines para macizos como el Pirineo; en Cataluña los elabora el Institut Cartogràfic i Geològic de Catalunya, y en Arán su propio servicio. Los niveles son:</p>
<ol>
<li><b>Débil:</b> manto en general bien asentado; desencadenamiento posible sobre todo con sobrecargas fuertes en pocas pendientes muy inclinadas.</li>
<li><b>Limitado:</b> en algunas pendientes empinadas, el manto está moderadamente estabilizado. Requiere elegir bien el terreno.</li>
<li><b>Notable:</b> en muchas pendientes empinadas el manto está poco estabilizado; un solo esquiador puede desencadenar aludes. Es el nivel en el que se producen muchos de los accidentes mortales: el peligro es real pero no siempre visible.</li>
<li><b>Fuerte:</b> aludes probables en muchas pendientes empinadas, incluso con poca sobrecarga, y salidas espontáneas frecuentes.</li>
<li><b>Muy fuerte:</b> grandes aludes espontáneos, incluso en terreno moderadamente inclinado; pueden alcanzar fondos de valle y carreteras.</li>
</ol>
<p>Además del nivel, el boletín indica las <b>orientaciones y altitudes</b> más peligrosas y el <b>tipo de problema</b> (nieve reciente, nieve venteada, capas débiles persistentes, nieve húmeda, deslizamientos). Esa información es tan importante como el número.</p>
<div class="box"><b>Importante</b>Estas nociones no sustituyen a un curso de nivología y autorrescate. Si vas a moverte por terreno nevado con pendientes de más de 30° (raquetas, esquí de travesía, alpinismo invernal), fórmate, consulta el boletín cada día, lleva el equipo de rescate (detector de víctimas de aludes, pala y sonda) y practica su uso. Las probabilidades de sobrevivir a un enterramiento caen rápidamente pasados unos 15 minutos: el rescate depende sobre todo de tus compañeros.</div>
<div class="box"><b>En el campo</b>Aunque solo hagas rutas sencillas con raquetas, fíjate en lo que tienes por encima: un camino llano al pie de una ladera empinada cargada de nieve está en la zona de llegada de los aludes. En los días posteriores a una gran nevada, elige itinerarios por bosque denso, lomas amplias y pendientes suaves sin laderas empinadas encima.</div>`,
  tags: ['nieve', 'copo', 'cristal de nieve', 'dendrita', 'nieve granulada', 'manto nivoso', 'metamorfismo', 'escarcha de profundidad', 'placa de viento', 'cornisa', 'alud', 'avalancha', 'peligro de aludes', 'boletín de aludes', 'escala europea', 'nivología', 'ARVA', 'DVA'],
  refs: ['AEMET: Boletín de peligro de aludes y guía de interpretación', 'European Avalanche Warning Services (EAWS): escala europea de peligro de aludes y problemas típicos', 'Institut Cartogràfic i Geològic de Catalunya: materiales de predicción de aludes', 'Manuales de nivología y prevención de aludes (federaciones de montaña)']
},
{
  id: 'climas-espana', em: '🌍', kicker: 'Clima', title: 'Los climas de España',
  lead: 'En un país del tamaño de España caben inviernos con hielo durante meses y costas donde nunca hiela, montañas que reciben más de 2.000 litros por metro cuadrado al año y desiertos que no llegan a 200. La razón está en la latitud, en la forma de la península y, sobre todo, en sus montañas.',
  body: `
<h3>Un país en la frontera</h3>
<p>La península ibérica está entre unos 36° y 44° de latitud norte: justo en la zona de transición entre dos grandes sistemas atmosféricos.</p>
<ul>
<li>Al norte, la franja de los <b>vientos del oeste</b>, por la que circulan las borrascas atlánticas con sus frentes.</li>
<li>Al sur, el dominio de las <b>altas presiones subtropicales</b>, con el anticiclón de las Azores como protagonista, que trae estabilidad y sequía.</li>
</ul>
<p>Esta frontera se desplaza con las estaciones. En invierno baja hacia el sur y las borrascas atlánticas entran en la península; en verano sube hacia el norte, el anticiclón se extiende y casi toda España queda seca. Ese ritmo de <b>verano seco y lluvias en la estación fría</b> es la definición del clima mediterráneo, y lo comparte la mayor parte del país.</p>

<h3>La forma de la península</h3>
<ul>
<li><b>Una gran meseta elevada.</b> España tiene una de las altitudes medias más altas de Europa, del orden de 650 m, por la Meseta central.</li>
<li><b>Rodeada de montañas.</b> Cordillera Cantábrica, Sistema Ibérico, Sierra Morena y las Béticas rodean la Meseta y frenan la influencia del mar. El interior queda «aislado» y es continental pese a estar a pocos cientos de kilómetros de la costa.</li>
<li><b>Sierras orientadas de oeste a este</b> (Sistema Central, Montes de Toledo, Sierra Morena) que dejan entrar por el oeste los frentes atlánticos hacia el interior, mientras el Mediterráneo queda a sotavento.</li>
<li><b>Dos mares muy distintos:</b> el Atlántico, más fresco y origen de la mayoría de las borrascas, y el Mediterráneo, cálido y casi cerrado, que alimenta los episodios de lluvias torrenciales de otoño.</li>
</ul>

<h3>Los grandes tipos de clima</h3>
<p>Hay dos formas de clasificarlos: la escolar, por regiones, y la internacional de <b>Köppen</b>, que usa letras según temperaturas y lluvias. Según el Atlas Climático Ibérico de AEMET, el tipo más extendido en España es el mediterráneo de verano caluroso (Csa).</p>

<h3>Oceánico o atlántico</h3>
<p>Galicia, Asturias, Cantabria, el País Vasco y el norte de Navarra. Lluvias abundantes y repartidas todo el año, sin un verano realmente seco; temperaturas suaves, con inviernos poco fríos en la costa y veranos templados. Debe su carácter a los vientos del oeste y del noroeste cargados de humedad atlántica y a la Cordillera Cantábrica, que los obliga a descargar. En la clasificación de Köppen es mayoritariamente Cfb, con zonas de transición. Paisaje: prados siempre verdes, robledales, hayedos, castaños.</p>

<h3>Mediterráneo y sus variantes</h3>
<ul>
<li><b>Mediterráneo litoral</b> (costa catalana, valenciana, Baleares, costa andaluza): inviernos suaves, veranos calurosos y húmedos, lluvias de otoño a menudo intensas. El mar suaviza las temperaturas.</li>
<li><b>Mediterráneo continentalizado</b> (Meseta, valle del Ebro, gran parte del interior): inviernos fríos con heladas frecuentes y veranos muy calurosos; grandes contrastes entre día y noche; lluvias moderadas, con máximos a menudo en primavera y otoño. El mar queda lejos o tapado por las montañas. Es el clima de Madrid, Valladolid, Zaragoza o Teruel, con matices propios (ver «Por qué Teruel es tan frío»).</li>
<li><b>Mediterráneo seco o semiárido</b> (sureste: Murcia, Almería, sur de Alicante; partes del valle del Ebro como los Monegros o las Bardenas): lluvias escasas, del orden de 200-350 l/m² al año, muy irregulares. Estas zonas están a sotavento de los vientos húmedos por todos lados: del Atlántico las separan las sierras béticas y la Meseta; y los temporales de levante, que podrían traerles agua, son relativamente poco frecuentes. En el Cabo de Gata y el desierto de Tabernas (Almería) se alcanzan los valores más bajos de la península, en torno a 200 l/m² o menos: es lo más parecido a un desierto en la Europa continental.</li>
</ul>

<h3>Clima de montaña</h3>
<p>Por encima de unos 1.000-1.500 m, según la zona, el clima de cualquier región se transforma: <b>más frío</b> (unos 0,65 °C menos por cada 100 m de media), <b>más precipitación</b> (las montañas obligan al aire a subir y descargar) y una parte importante de esa precipitación en forma de <b>nieve</b>. Los inviernos son largos y los veranos cortos y frescos, a menudo con tormentas. El Pirineo, la Cordillera Cantábrica, el Sistema Central, el Sistema Ibérico y Sierra Nevada tienen climas de montaña con matices: atlántico y húmedo en el Pirineo occidental y Picos de Europa, mucho más seco y soleado en Sierra Nevada. En las cumbres más altas del Pirineo y de Sierra Nevada se dan climas propios de tundra alpina.</p>
<p>Las montañas también crean <b>islas de lluvia</b> en zonas secas: la sierra de Grazalema, entre Cádiz y Málaga, es la primera barrera que encuentran los temporales atlánticos del suroeste y está entre los lugares más lluviosos de España, con medias de más de 2.000 l/m² al año.</p>

<h3>Clima subtropical canario</h3>
<p>Las Canarias están a unos 28° de latitud, frente a la costa del Sáhara. Sin embargo, su clima es muy suave, con temperaturas medias en la costa de unos 18-24 °C y muy poca diferencia entre invierno y verano. Las razones:</p>
<ul>
<li>Los <b>vientos alisios</b>, frescos y húmedos, que soplan del nordeste casi todo el año.</li>
<li>La <b>corriente de Canarias</b>, relativamente fría para la latitud, que refresca el mar.</li>
<li>Una <b>inversión térmica</b> a media altura que mantiene el famoso mar de nubes en las vertientes norte.</li>
</ul>
<p>Por eso cada isla alta tiene dos climas: una <b>vertiente norte</b> húmeda y nublada, con laurisilva y pinar, y una <b>vertiente sur</b> seca, soleada y casi desértica. Las islas más bajas y cercanas a África (Lanzarote, Fuerteventura) son áridas. Y en el Teide, por encima de las nubes, hay clima de alta montaña, con heladas y nieve en invierno.</p>
<div class="box tech"><b>Para situarte</b>Las precipitaciones medias anuales en España van desde menos de unos 200 l/m² en el sureste almeriense hasta más de 2.000 l/m² en algunas sierras gallegas, cantábricas, pirenaicas y en Grazalema. Las temperaturas medias anuales, desde más de 20 °C en la costa canaria hasta valores bajo cero en las cumbres más altas del Pirineo.</div>
<div class="box"><b>En el campo</b>El clima de un lugar se lee en sus plantas. Encinas y coscojas indican veranos secos; hayas y abedules, humedad todo el año; esparto, albardín y tomillos, aridez; pinos negros y prados alpinos, inviernos largos. Cuando viajes de una región a otra, fíjate en dónde cambia el paisaje: suele coincidir con una sierra que hace de frontera climática.</div>`,
  tags: ['clima', 'climas de España', 'oceánico', 'atlántico', 'mediterráneo', 'continental', 'continentalizado', 'semiárido', 'árido', 'desierto', 'clima de montaña', 'subtropical', 'Canarias', 'alisios', 'Köppen', 'precipitación', 'Grazalema', 'Tabernas'],
  refs: ['AEMET e Instituto de Meteorología de Portugal: Atlas Climático Ibérico (2011)', 'AEMET: Valores climatológicos normales', 'Manuales generales de geografía física de España']
},
{
  id: 'continentalidad-agua', em: '🌊', kicker: 'Física', title: 'El agua como termostato',
  lead: 'Las costas tienen inviernos templados y veranos suaves; el interior, inviernos helados y veranos tórridos. Detrás está una propiedad física del agua: cuesta mucho calentarla y enfriarla. Este artículo explica la física de ese «termostato» y cómo se nota, desde el mar hasta un embalse de montaña.',
  body: `
<h3>Calentar agua cuesta mucho</h3>
<p>El <b>calor específico</b> es la energía necesaria para subir un grado la temperatura de un kilo de una sustancia. El del agua es de los más altos que existen: unos 4,2 kilojulios por kilo y grado. El de las rocas y la tierra seca es del orden de 0,8: el agua necesita <b>unas cinco veces más energía</b> por kilo para calentarse lo mismo. Si lo comparamos por volumen (las rocas son más densas), la diferencia es menor, de unas dos veces. Eso indica que el calor específico es importante, pero no explica él solo todo el efecto. Hay otras tres razones, igual de importantes.</p>

<h3>Las otras tres razones</h3>
<ul>
<li><b>El agua se mezcla.</b> El viento, las olas y las corrientes reparten el calor del sol por una capa de decenas de metros de espesor. En tierra, el calor del día apenas penetra unos decímetros en el suelo; la variación anual, unos pocos metros. Es decir: en el mar, el calor se reparte en una masa enorme; en tierra, se concentra en la superficie.</li>
<li><b>El agua es transparente.</b> La luz del sol penetra varios metros antes de convertirse en calor. En tierra, se absorbe toda en el primer milímetro.</li>
<li><b>El agua se evapora.</b> Evaporar agua consume muchísima energía. Una parte del calor que llega al mar, o a un suelo húmedo, se gasta en evaporar en lugar de en subir la temperatura.</li>
</ul>
<p>Resultado: la superficie del mar cambia de temperatura despacio y poco. En las costas españolas, la temperatura del mar varía a lo largo del año del orden de 10 °C (por ejemplo, de unos 13-14 °C en invierno a 25 °C o más a finales de verano en el Mediterráneo), mientras que el aire del interior puede pasar de varios grados bajo cero a cerca de 40 °C.</p>

<h3>Cómo pasa ese efecto al aire</h3>
<p>El aire que está sobre el mar toma su temperatura. Si el viento lleva ese aire a tierra, lleva consigo el «termostato». Además, el aire marítimo es húmedo, y el vapor de agua y las nubes frenan la pérdida de calor nocturna. Por eso en la costa:</p>
<ul>
<li>Las <b>noches son templadas</b> y la diferencia entre el día y la noche es pequeña: unos pocos grados, frente a los 15-20 °C de muchos días en el interior.</li>
<li>La <b>diferencia entre el verano y el invierno</b> es menor. En A Coruña, entre la temperatura media del mes más frío y la del más cálido hay unos 9-10 °C; en Madrid, unos 19 °C.</li>
<li>Las <b>estaciones van con retraso</b>: el mar alcanza su máxima temperatura a finales de agosto o en septiembre, y en muchas costas el mes más cálido es agosto, mientras en el interior suele ser julio. El otoño costero es templado y la primavera, más fresca.</li>
<li>Las <b>heladas son raras</b> en la costa mediterránea y la atlántica, y en la canaria prácticamente inexistentes al nivel del mar.</li>
</ul>

<h3>Brisas: el termostato en movimiento</h3>
<p>En días soleados, la tierra se calienta mucho más que el mar. El aire sobre tierra sube y lo reemplaza aire fresco del mar: la <b>brisa marina</b>, que entra desde media mañana y puede penetrar decenas de kilómetros tierra adentro por los valles. De noche ocurre lo contrario y se forma un <b>terral</b> o brisa de tierra, más débil. Si alguna vez has subido en verano a una sierra cercana a la costa (Montgó, Collserola, la Tramuntana, los montes de Málaga) habrás notado cómo a mediodía llega un aire húmedo y fresco desde el mar.</p>

<h3>No todos los mares son iguales</h3>
<ul>
<li><b>El Mediterráneo</b> es cálido, casi cerrado y se calienta mucho en verano. Su calor acumulado en otoño es combustible para las lluvias torrenciales (ver «DANA y gota fría»).</li>
<li><b>El Atlántico</b> frente a Galicia y Portugal es más fresco. En verano, el viento del norte aparta el agua superficial de la costa y hace subir agua profunda fría (el <b>afloramiento</b>). Por eso el agua de las rías gallegas está fría incluso en agosto y son frecuentes las nieblas de verano.</li>
<li><b>Las aguas canarias</b> son más frescas de lo que les correspondería por latitud, por la corriente de Canarias, y eso contribuye a su clima suave.</li>
</ul>

<h3>El agua en el interior y en la montaña</h3>
<p>Los lagos y embalses también moderan su entorno, pero a escala mucho menor: unos cientos de metros o pocos kilómetros. Lo que más se nota son las <b>nieblas</b> de evaporación sobre el agua en mañanas frías y un ambiente algo más húmedo en sus orillas. Los ibones pirenaicos, en cambio, pasan meses helados: su masa de agua es pequeña y el frío del invierno la vence.</p>
<p>El mismo principio funciona con el <b>suelo</b>: un suelo húmedo se calienta y se enfría más despacio que uno seco, porque el agua aumenta su capacidad de almacenar calor y parte de la energía se gasta en evaporar. Por eso un prado húmedo de fondo de valle está más fresco a mediodía que un arenal o un pedregal secos, y por eso un suelo reseco por la sequía deja subir más la temperatura en verano.</p>
<p>Y la <b>nieve</b>, aunque es agua, funciona al revés que un mar: refleja buena parte del sol, emite muy bien calor de noche y aísla el suelo. Una superficie nevada favorece noches muy frías en el aire que tiene encima.</p>
<div class="box tech"><b>Para relacionar</b>La continentalidad de un lugar no depende solo de la distancia al mar, sino de si el aire marino puede llegar. Una montaña que bloquee los vientos del mar hace «continental» un sitio que está cerca de la costa, como explica el caso de Teruel en «Por qué Teruel es tan frío». Y al revés: un valle abierto al mar lleva su influencia muy hacia dentro.</div>
<div class="box"><b>En el campo</b>Compara en Otero la previsión de mínima y máxima de un punto en la costa y otro a la misma altitud 50 km tierra adentro tras una sierra. La diferencia entre día y noche te dará una idea directa de cuánto pesa el termostato del mar en cada sitio.</div>`,
  tags: ['continentalidad', 'calor específico', 'agua', 'mar', 'oceanidad', 'amplitud térmica', 'oscilación térmica', 'brisa marina', 'terral', 'afloramiento', 'Mediterráneo', 'Atlántico', 'clima costero', 'interior', 'evaporación'],
  refs: ['AEMET: Valores climatológicos normales', 'Puertos del Estado: datos de temperatura del agua del mar', 'Manuales generales de física y climatología']
},
{
  id: 'prever-tiempo', em: '🔭', kicker: 'Meteorología', title: 'Prever el tiempo en el campo',
  lead: 'Antes de las apps, pastores y montañeros miraban el cielo, el viento y los animales para adivinar el tiempo. Algunas de esas señales tienen base física y funcionan razonablemente a pocas horas vista; otras son folclore. Y hoy, la mejor señal es una buena previsión de montaña bien leída. Aquí se separa lo fiable de lo pintoresco.',
  body: `
<h3>Lo que funciona: señales con base física</h3>
<p>Son útiles para las próximas horas, no para los próximos días. Ninguna es infalible por separado; varias juntas dan bastante confianza.</p>
<ul>
<li><b>Cirros que aumentan desde el oeste, velo y halo alrededor del sol o la luna:</b> frente probable en las próximas 12-36 horas. Es de las señales más fiables (ver «Frentes: cuando cambia el aire»).</li>
<li><b>Cúmulos que crecen en vertical antes del mediodía:</b> tormenta probable por la tarde.</li>
<li><b>Lenticulares y banderas de nube en las cumbres:</b> viento fuerte en altura, a menudo antes de un cambio.</li>
<li><b>Rocío o escarcha abundante al amanecer:</b> la noche fue despejada y en calma, típica de anticiclón; suele seguir un día estable. Si tras una noche que parecía despejada no hay rocío, puede que se levantara viento o entraran nubes: posible cambio.</li>
<li><b>Viento que se refuerza y gira:</b> en la península, el viento que gira hacia el sur o el suroeste y se vuelve templado y racheado anuncia a menudo la llegada de una borrasca; el giro al noroeste con bajada de temperatura indica que el frente ya ha pasado.</li>
<li><b>Presión que baja de forma sostenida:</b> una bajada de unos 3 hPa o más en 3 horas suele indicar empeoramiento claro. El altímetro del reloj o del móvil sirve: si estás parado y la altitud que marca «sube», la presión está bajando (más o menos 8 m por cada hPa).</li>
<li><b>Visibilidad excepcional</b> y montañas lejanas «muy cerca»: aire limpio, a menudo tras un frente frío o con viento del norte; también con viento sur en el Cantábrico, antes de un cambio.</li>
<li><b>Humo que sube recto y luego se aplana:</b> aire estable, inversión; tiempo tranquilo pero posible niebla o helada en los fondos.</li>
</ul>

<h3>Lo dudoso: refranes con algo de verdad</h3>
<ul>
<li><b>«Cielo rojo al atardecer, buen tiempo; rojo al amanecer, agua.»</b> En latitudes con vientos del oeste tiene cierta lógica: un ocaso rojo indica cielo limpio hacia el oeste, de donde viene el tiempo. Pero falla con frecuencia y depende mucho del tipo de nubes.</li>
<li><b>«Cielo empedrado, suelo mojado»</b> (o «aborregado»): los altocúmulos y cirrocúmulos a veces preceden a un frente, otras veces se deshacen sin más.</li>
<li><b>Golondrinas y vencejos volando bajo:</b> siguen a los insectos, que con aire más húmedo y menos corrientes ascendentes vuelan más cerca del suelo. Puede coincidir con la llegada de mal tiempo, pero también ocurre en días tranquilos.</li>
<li><b>Oír más lejos de lo normal campanas o trenes:</b> puede deberse a una inversión térmica o a que el viento ha girado y trae el sonido. Es un indicio muy débil.</li>
</ul>

<h3>Lo que no tiene base demostrada</h3>
<ul>
<li>Vacas tumbadas, ovejas agrupadas, hormigas que acarrean, ranas que croan más o gatos que se lavan las orejas: los animales reaccionan a cambios inmediatos (viento, humedad, temperatura), pero no hay pruebas de que predigan el tiempo de mañana.</li>
<li>Las <b>cabañuelas</b> y las previsiones anuales basadas en los primeros días de agosto o de enero no han mostrado capacidad de acierto cuando se han comparado con los datos.</li>
<li>Los dolores articulares o de cicatrices con el cambio de tiempo: hay personas que lo notan y algunos estudios han encontrado asociaciones débiles, otros no. En ningún caso sirven como previsión.</li>
</ul>
<p>Estas tradiciones forman parte de la cultura del campo y merece la pena conocerlas, pero para decidir si subes a una cresta, usa la previsión.</p>

<h3>Cómo leer una previsión de montaña</h3>
<p>AEMET publica predicciones específicas para varios macizos montañosos, y muchas aplicaciones ofrecen la previsión de un punto concreto. Otero toma la suya de Open-Meteo para el lugar que consultas. Las claves para leerlas:</p>
<ul>
<li><b>Temperatura en altitud:</b> asegúrate de a qué altitud se refiere. La de un pueblo no es la de la cumbre (resta unos 6-7 °C por cada 1.000 m).</li>
<li><b>Isocero o nivel de congelación:</b> la altitud a la que el aire está a 0 °C. Por encima, lo que caiga será nieve y el agua de los charcos estará helada.</li>
<li><b>Cota de nieve:</b> la altitud a partir de la cual la precipitación llega al suelo como nieve. Suele estar unos 300-400 m por debajo del isocero, porque los copos tardan en fundirse al bajar. Con precipitación intensa puede bajar más de lo previsto.</li>
<li><b>Viento medio y rachas:</b> el viento medio es el promedio; la <b>racha</b> es el golpe máximo de unos segundos. Para mantener el equilibrio en una cresta importa la racha. Y el viento en cumbres y collados suele ser bastante mayor que en el valle.</li>
<li><b>Sensación térmica:</b> combina temperatura y viento. Es la que decide la ropa.</li>
<li><b>Precipitación en l/m²</b> (igual a mm): 1 l/m² es un chubasco débil; 10 l/m² ya mojan de verdad; más de 30-40 l/m² en una hora es una tromba. En nieve, como orden de magnitud, 1 l/m² son unos 1 cm de nieve.</li>
<li><b>Probabilidad de precipitación:</b> un 40 % no significa que lloverá el 40 % del día, sino que, en situaciones parecidas, llueve en esa zona aproximadamente 4 de cada 10 veces. En tormentas de verano, el sí o el no dependen de dónde se formen.</li>
<li><b>Horario:</b> mira la evolución hora a hora, no solo el icono del día. Un icono de tormenta puede referirse a dos horas de la tarde.</li>
</ul>
<div class="box tech"><b>Los límites de la previsión</b>Los modelos meteorológicos trabajan con cuadrículas de varios kilómetros y un relieve suavizado: el fondo de un barranco y la cresta de al lado pueden caer en la misma celda. Por eso fallan especialmente en las inversiones nocturnas, en el viento canalizado por collados y en la ubicación exacta de las tormentas. Compara varias fuentes, mira la tendencia de los últimos días y revisa la previsión el mismo día por la mañana.</div>
<div class="box"><b>En el campo</b>Combina las dos herramientas: la previsión decide si sales y por dónde; el cielo, el viento y tu altímetro deciden si sigues o te das la vuelta. Si lo que ves no coincide con lo previsto, cree a lo que ves.</div>`,
  tags: ['previsión', 'predicción', 'pronóstico', 'señales del tiempo', 'refranes', 'cabañuelas', 'folclore', 'barómetro', 'altímetro', 'presión', 'isocero', 'nivel de congelación', 'cota de nieve', 'rachas', 'probabilidad de precipitación', 'previsión de montaña', 'halo', 'rocío'],
  refs: ['AEMET: Predicción para montaña y guía de interpretación', 'AEMET: Glosario (cota de nieve, isocero, racha)', 'Open-Meteo: documentación de variables de previsión', 'Manuales generales de meteorología de montaña']
},
{
  id: 'microclimas', em: '🦎', kicker: 'Clima', title: 'Microclimas: el tiempo a escala de lagartija',
  lead: 'La estación meteorológica mide el aire a metro y medio del suelo, en un prado abierto. Pero una planta vive a ras de suelo, una lagartija en una grieta y un murciélago en una cueva. A esa escala, el clima puede cambiar por completo en pocos metros, y muchos seres vivos sobreviven gracias a esas diferencias.',
  body: `
<h3>Qué es un microclima</h3>
<p>Un microclima es el clima particular de un espacio pequeño (de centímetros a cientos de metros) que difiere del clima general de la zona. Lo crean el relieve, la orientación, la vegetación, el agua, el tipo de suelo o de roca. Los seres vivos no viven en «el clima de la comarca»: viven en su microclima.</p>

<h3>Barrancos y hoces</h3>
<p>En un barranco profundo y estrecho llega menos sol, el viento entra poco y suele correr o rezumar agua. El aire es más húmedo y fresco en verano que en las parameras de arriba. Por eso los barrancos de las sierras mediterráneas funcionan como <b>refugios</b> para especies propias de climas más húmedos y frescos: <b>tejos, acebos, avellanos, tilos, arces, musgos y helechos</b> que en el resto del paisaje no podrían vivir. Muchos de ellos son reliquias de épocas más frías y húmedas que han sobrevivido en esos rincones. Ejemplos de este tipo de barrancos hay en el Maestrazgo, en la sierra de Cazorla, en las hoces del Sistema Ibérico o en los Montes de Toledo.</p>

<h3>Fondos de valle y hoyas</h3>
<p>De día pueden ser cálidos y abrigados, pero en noches despejadas acumulan el aire frío que baja de las laderas (ver «Inversión térmica: cuando el frío se encharca»). Allí las <b>heladas son más frecuentes y más tardías</b>, la niebla dura más y la temporada sin heladas es más corta. En algunas dolinas y hoyas cerradas del Sistema Ibérico o de los macizos calizos se produce una <b>inversión de la vegetación</b>: especies de clima frío o sin árboles en el fondo y bosque a media ladera. Los agricultores lo saben desde siempre: los frutales se plantaban a media ladera, no en el fondo.</p>

<h3>Bosques</h3>
<p>Un bosque cerrado es como una casa: las copas amortiguan el sol de día y frenan la pérdida de calor de noche, y cortan el viento. Dentro de un hayedo o de un pinar denso, en verano, la temperatura máxima puede ser varios grados más baja que en el prado de al lado, la humedad más alta y la diferencia entre día y noche menor. En invierno, el bosque protege del viento y de las heladas más fuertes. Por eso muchos animales usan el bosque como refugio térmico: los ciervos y corzos se esconden en él en las horas de calor y los pájaros pasan allí las noches de frío. Los <b>claros</b> son lo contrario: sol, calor y vida de insectos y flores que necesitan luz.</p>

<h3>Cuevas y simas</h3>
<p>Unos metros dentro de la roca, las oscilaciones del exterior desaparecen. En una cueva profunda, la temperatura se mantiene casi constante todo el año, cercana a la <b>temperatura media anual</b> del lugar, y la humedad del aire roza la saturación. Por eso las cuevas parecen frescas en verano y templadas en invierno. Ese ambiente estable es esencial para los <b>murciélagos</b>, que eligen unas cuevas para hibernar (frías y estables) y otras para criar (más cálidas), y para una fauna de invertebrados adaptada a la oscuridad. Algunas cuevas y simas de alta montaña atrapan aire frío y guardan hielo todo el año, como la gruta helada de Casteret, en el macizo de Monte Perdido. Por esa razón está prohibido molestar a los murciélagos durante la hibernación: cada despertar les cuesta reservas que no pueden reponer.</p>

<h3>Cumbres y crestas</h3>
<p>Las cumbres están expuestas: viento casi constante, radiación solar intensa, noches muy frías y suelos pobres. A escala de centímetros, sin embargo, también allí hay refugios:</p>
<ul>
<li>Las <b>plantas en almohadilla o cojín</b> (como el erizón del Pirineo y el Ibérico, o las de las cumbres de Sierra Nevada) crecen pegadas al suelo y compactas: dentro del cojín el aire está más quieto y más templado que fuera, y la planta pierde menos agua.</li>
<li>En los <b>ventisqueros y neveros</b>, la nieve que dura hasta el verano protege el suelo del frío extremo en invierno pero acorta la temporada de crecimiento. Allí vive una flora especializada que florece a toda prisa en cuanto se funde la nieve.</li>
<li><b>Bajo la nieve</b>, junto al suelo, la temperatura se mantiene cerca de 0 °C aunque fuera haga −20 °C. Los topillos nivales y otros pequeños mamíferos viven todo el invierno en ese espacio, y la perdiz nival se entierra en la nieve para pasar la noche.</li>
</ul>

<h3>Roquedos, pedreras y muros</h3>
<p>La roca desnuda al sol se calienta mucho más que el aire, sobre todo la oscura, y conserva calor al atardecer. Debajo de las piedras y en las grietas, en cambio, hay sombra, humedad y temperaturas suaves. Los <b>reptiles</b> aprovechan ambas cosas: por la mañana se ponen al sol sobre la piedra para calentarse, y en las horas de más calor se meten en las grietas. Las <b>mariposas</b> se posan con las alas abiertas al sol en lugares resguardados. Los muros de piedra seca de bancales y parideras crean el mismo mosaico: en la cara sur, lagartijas y plantas termófilas; en la cara norte, musgos y helechos.</p>

<h3>Junto al agua</h3>
<p>Riberas, fuentes, turberas y prados húmedos son más frescos y húmedos en verano. Las riberas forman pasillos de árboles de hoja caduca (chopos, sauces, fresnos, alisos) que cruzan paisajes secos, y sirven de corredor y refugio para muchos animales.</p>
<div class="box tech"><b>Microrrefugios</b>Los ecólogos llaman microrrefugios a esos lugares donde el microclima permite a una especie sobrevivir fuera de su clima general. Se estudian como posibles refugios frente al calentamiento: los barrancos umbríos, las caras norte y los fondos frescos pueden ayudar a conservar especies que en el resto del paisaje lo tendrán cada vez más difícil.</div>
<div class="box"><b>En el campo</b>Lleva un termómetro pequeño y mide en una misma salida: al sol sobre una roca, a la sombra de un bosque, junto a un arroyo, en la entrada de una cueva y en una loma ventosa. Guarda las lecturas en «Mediciones» de Otero con su lugar y hora. En pocas salidas tendrás tu propio mapa de microclimas, y entenderás por qué cada planta y cada animal está donde está.</div>`,
  tags: ['microclima', 'microclimas', 'barranco', 'hoz', 'fondo de valle', 'hoya', 'dolina', 'bosque', 'cueva', 'sima', 'murciélagos', 'cumbre', 'almohadilla', 'nevero', 'ventisquero', 'espacio subnival', 'reptiles', 'roquedo', 'refugio', 'microrrefugio', 'reliquia'],
  refs: ['Manuales generales de ecología y biogeografía', 'Geiger, R.: The Climate Near the Ground', 'Ministerio para la Transición Ecológica: materiales sobre conservación de murciélagos y refugios', 'AEMET: materiales divulgativos de climatología']
},
];
