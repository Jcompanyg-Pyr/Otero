// Explicaciones del paisaje. Nivel: divulgación seria, sin dar nada por sabido.
// Los bloques <div data-int="..."> se convierten en esquemas interactivos (ver library.js).
export const ARTICLES = [
{
  id: 'picos-lomas', em: '⛰️', kicker: 'Relieve', title: 'Por qué el Pirineo tiene picos y Teruel tiene muelas',
  lead: 'Las dos cordilleras nacieron en el mismo empujón de placas, más o menos a la vez. Y sin embargo una parece una sierra de dientes y la otra una mesa gigante. La diferencia está en dónde les tocó el golpe, de qué roca están hechas y qué herramienta las ha esculpido después.',
  body: `
<h3>1. El mismo choque, distinta distancia</h3>
<p>Hace entre unos 80 y 20 millones de años, la placa africana empujó hacia el norte y la península ibérica —que entonces era casi un microcontinente con algo de independencia— chocó contra Europa. El <b>Pirineo es la costura de ese choque</b>: ahí la corteza se arrugó, se apiló en láminas que montaron unas encima de otras y se engrosó tanto que se levantó varios kilómetros. Es como empujar una alfombra contra la pared: el pliegue gordo se forma justo en el borde.</p>
<p>El <b>Sistema Ibérico</b> está en mitad de la placa, lejos de esa costura. Le llegó el empujón amortiguado. Lo que había allí eran cuencas donde, durante el Jurásico y el Cretácico, se habían acumulado cientos de metros de sedimentos marinos. El empujón las comprimió y las «exprimió» hacia arriba, pero con mucha menos violencia: pliegues amplios, algunas fallas, y capas que en muchas zonas siguen casi horizontales.</p>
<div data-int="perfil"></div>

<h3>2. Rocas que se rompen y rocas que se rebanan</h3>
<p>En el eje del Pirineo afloran <b>granitos, pizarras y esquistos</b> de más de 250 millones de años: rocas duras pero muy fracturadas, que se rompen en bloques y agujas. Por eso las crestas son dentadas.</p>
<p>En Gúdar, Javalambre o el Maestrazgo dominan las <b>calizas y margas en capas</b>, como un pastel de milhojas. Cuando la erosión corta un paquete de capas casi horizontal en el que arriba hay una capa dura (caliza) y debajo otras blandas (margas, arcillas), la capa dura hace de tapadera: protege lo de abajo, y el resultado es una montaña con la cima plana y los bordes en cortado. Eso es una <b>muela</b>. Si la tapadera se va desmantelando, quedan cerros testigo y lomas.</p>
<div class="box"><b>En el campo</b>Si ves una montaña con la cumbre plana y un escalón de roca clara justo debajo del borde, estás viendo la «tapadera» de caliza. Debajo suele haber una ladera más suave de material blando.</div>

<h3>3. Millones de años de lima… y un ascensor</h3>
<p>Cuando el Sistema Ibérico dejó de crecer, empezó un periodo larguísimo en el que la erosión fue <b>arrasando el relieve hasta dejarlo casi plano</b>: lo que los geomorfólogos llaman superficies de erosión o de aplanamiento. Después, en los últimos millones de años, todo el bloque volvió a subir en conjunto. Esas llanuras viejas quedaron colgadas a 1.400-2.000 m: son las <b>parameras y altiplanos</b> por los que hoy pasa la carretera de Valdelinares o de Javalambre. Los ríos, al subir el terreno, encajaron sus cauces y abrieron los barrancos profundos que las cortan.</p>
<p>El Pirineo también se ha erosionado muchísimo, pero es más alto, siguió levantándose y, sobre todo, tuvo un escultor que el Ibérico del sur no tuvo.</p>

<h3>4. El cincel del hielo</h3>
<p>Durante las glaciaciones del Cuaternario, el Pirineo se cubrió de <b>glaciares</b> que bajaban por los valles. El hielo arranca roca de las paredes y del fondo, y donde varios glaciares «muerden» una montaña por distintos lados dejan aristas finas y picos piramidales. Por eso las cumbres pirenaicas parecen talladas: lo están.</p>
<p>Gúdar y Javalambre, con algo más de 2.000 m y mucho más al sur y más secos, se quedaron por debajo del nivel en el que la nieve se acumulaba de un año para otro. No hubo glaciares, solo <b>hielo en el suelo</b> (periglaciarismo): el agua que se congela en las grietas rompe la roca y forma canchales y pedreras, pero no talla picos. Las formas siguieron siendo redondeadas.</p>
<div class="box tech"><b>Dato técnico</b>Las cimas ibéricas que sí tuvieron pequeños glaciares (Moncayo, Urbión, la Demanda) están más al norte y por encima de los 2.000 m, y sus circos son modestos comparados con los pirenaicos.</div>

<h3>Resumen para llevar</h3>
<ul>
<li><b>Pirineo:</b> borde de placa → mucho levantamiento → rocas antiguas fracturadas → glaciares → picos y aristas.</li>
<li><b>Teruel:</b> interior de placa → pliegues suaves en capas → erosión larguísima y nuevo levantamiento → sin glaciares → muelas, lomas y parameras cortadas por barrancos.</li>
</ul>`
},
{
  id: 'colores', em: '🎨', kicker: 'Geología', title: 'Leer los colores de las rocas',
  lead: 'El color de una roca es casi siempre química: qué minerales tiene, en qué ambiente se formó y qué le ha pasado después. Con cuatro pistas puedes «leer» un cortado desde el coche.',
  body: `
<div class="swatch"><i style="background:#a7442d"></i><div><b>Rojo intenso: hierro oxidado</b><br>Areniscas y arcillas teñidas por óxido de hierro (hematites), como el óxido de una herramienta. Se forman en ambientes continentales —ríos, llanuras secas— donde el sedimento estaba en contacto con el aire. En Teruel es el <b>rodeno</b> del Triásico (Albarracín, Espadán), con su pino rodeno; en el Pirineo, las areniscas y conglomerados rojos de algunos valles.</div></div>
<div class="swatch"><i style="background:#dcd8ce"></i><div><b>Gris claro y blanco: calizas y dolomías</b><br>Carbonato cálcico (o cálcico-magnésico) formado en mares cálidos y someros, muchas veces a partir de conchas y esqueletos. Es la roca de casi toda Gúdar, Javalambre y las Sierras Interiores del Pirineo (Ordesa, Monte Perdido). Si buscas bien, aparecen fósiles: ammonites, erizos, conchas.</div></div>
<div class="swatch"><i style="background:#d9b569"></i><div><b>Amarillo y ocre: hierro hidratado o arenas</b><br>Óxidos de hierro con agua (limonita, goethita) dan tonos amarillos y pardos a margas, dolomías y arenas. Las <b>arenas de Utrillas</b>, del Cretácico, blanquecinas y amarillentas, aparecen en muchos puntos de Teruel y se explotaron por su caolín y su sílice.</div></div>
<div class="swatch"><i style="background:#8a9a7c"></i><div><b>Verde grisáceo: hierro sin oxígeno</b><br>Cuando el hierro queda en un ambiente sin oxígeno (fondos de lagunas, sedimentos encharcados) toma tonos verdes y grises. En las arcillas del <b>Keuper</b> (Triásico superior) se alternan capas rojas, verdes y moradas, con yesos: suelen formar laderas blandas, de colores, donde las carreteras se hunden.</div></div>
<div class="swatch"><i style="background:#3b3d3e"></i><div><b>Negro y gris oscuro: carbono o pizarras</b><br>Pizarras y esquistos del Paleozoico en el eje del Pirineo, ricos en materia orgánica antigua. En Teruel, el negro de las capas de <b>lignito</b> (carbón joven) de Utrillas o Escucha.</div></div>
<div class="swatch"><i style="background:linear-gradient(90deg,#dcd8ce 0 30%,#2f3130 30% 40%,#dcd8ce 40% 62%,#2f3130 62% 70%,#dcd8ce 70%)"></i><div><b>Rayas negras verticales en paredes claras</b><br>No es la roca: son <b>cianobacterias, algas y líquenes</b> que crecen por donde escurre el agua cuando llueve. Marcan los «canalones» naturales de la pared.</div></div>
<div class="swatch"><i style="background:#e28c2a"></i><div><b>Manchas naranja vivo sobre piedras</b><br>Líquenes (como <i>Xanthoria</i>), que abundan donde hay nitrógeno: en los posaderos de aves, cerca de corrales y parideras. Un líquen naranja en lo alto de una roca suele indicar que ahí se posa una rapaz o un cuervo.</div></div>
<h3>El truco de la gota</h3>
<p>La caliza reacciona con el ácido: con una gota de vinagre fuerte (o mejor, de ácido clorhídrico diluido, como hacen los geólogos) burbujea. La dolomía apenas lo hace, salvo si la rayas y pruebas sobre el polvo. La arenisca no burbujea y raspa como lija.</p>
<div class="box"><b>En Otero</b>En la ficha de cualquier punto, «Roca bajo tus pies» te dice qué formación marca el mapa geológico del IGME en ese sitio. Combínalo con el color que ves.</div>`
},
{
  id: 'pliegues', em: '〰️', kicker: 'Geología', title: 'Pliegues y fallas: el paisaje como un libro doblado',
  lead: 'Las rocas sedimentarias se forman en capas horizontales, como las páginas de un libro tumbado. Todo lo que no sea horizontal te está contando que algo las empujó, las dobló o las rompió.',
  body: `
<div data-int="pliegue"></div>
<h3>Anticlinales y sinclinales</h3>
<p>Si empujas por los dos lados un paquete de capas, se dobla en ondas. La cresta de la onda es un <b>anticlinal</b> (capas en forma de A, las más antiguas en el centro) y el valle es un <b>sinclinal</b> (forma de U, las más jóvenes en el centro). En los cortados del Maestrazgo y en los barrancos de Gúdar se ven perfectamente: líneas de capas que suben y bajan a lo largo de la pared.</p>
<h3>Cuando el relieve se da la vuelta</h3>
<p>Lo intuitivo sería que los anticlinales formaran montes y los sinclinales valles. Al principio es así, pero en la cresta de un anticlinal las capas están estiradas y llenas de grietas, y la erosión entra por ahí. Con el tiempo, el anticlinal se vacía y se convierte en valle (un <b>anticlinal desventrado</b>, a veces con forma de «ojal» alargado), mientras que el sinclinal, con las capas comprimidas y más resistentes, queda en alto: un <b>sinclinal colgado</b>. La Peña Oroel, junto a Jaca, es el ejemplo clásico pirenaico.</p>
<h3>Fallas: cuando la roca se rompe</h3>
<p>Si la deformación es demasiado rápida o la roca demasiado rígida, en vez de doblarse se rompe. Una <b>falla</b> es una fractura donde un bloque se ha movido respecto al otro. En el paisaje se nota como un escalón recto y largo, un cambio brusco de roca o un barranco que sigue una línea extrañamente recta. Las <b>fosas</b> de Teruel y del Jiloca son bloques hundidos entre fallas, rellenos después de sedimentos rojizos y blanquecinos.</p>
<h3>Cabalgamientos: el Pirineo apilado</h3>
<p>En el Pirineo el empuje fue tan fuerte que láminas enteras de roca, de kilómetros de espesor, se despegaron y <b>montaron encima de otras</b>, desplazándose decenas de kilómetros. Por eso a veces encuentras rocas antiguas encima de rocas más jóvenes, al revés de lo normal. Las Sierras Interiores (Collarada, Monte Perdido, Cotiella) son grandes láminas de caliza cabalgantes.</p>
<div class="box"><b>En el campo</b>Busca una pared con capas visibles. ¿Son horizontales? Zona tranquila. ¿Inclinadas todas hacia el mismo lado? Estás en el flanco de un pliegue. ¿Verticales o en arco? Estás cerca del núcleo. ¿Cortadas de golpe? Hay una falla.</div>`
},
{
  id: 'glaciares', em: '🧊', kicker: 'Relieve', title: 'Los glaciares que ya no están',
  lead: 'Hace unas decenas de miles de años, lenguas de hielo de varios cientos de metros de espesor bajaban por los valles del Pirineo. Se fueron, pero dejaron su firma por todas partes. Una vez que aprendes a verla, no la dejas de ver.',
  body: `
<h3>Cómo trabaja un glaciar</h3>
<p>Un glaciar es nieve que se acumula año tras año hasta compactarse en hielo y empieza a fluir ladera abajo, muy despacio (metros al año), por su propio peso. En su base lleva piedras incrustadas que funcionan como una lija gigante, y además arranca bloques de roca al congelarse el agua en sus grietas. Erosiona por <b>abrasión</b> (lija) y por <b>arranque</b>.</p>
<h3>Las formas que deja</h3>
<ul>
<li><b>Circo:</b> el anfiteatro en la cabecera donde nacía el glaciar. Muchas veces guarda un lago: un <b>ibón</b> (aragonés) o <i>estany</i> (catalán).</li>
<li><b>Valle en U:</b> fondo ancho y plano con paredes muy empinadas. Un río solo excava en V; el glaciar ensancha. Ordesa, Pineta o Benasque son U de libro.</li>
<li><b>Aristas y horns:</b> crestas afiladas y picos piramidales donde varios circos se comieron la montaña desde distintos lados.</li>
<li><b>Valles colgados:</b> valles laterales que acaban en un salto sobre el principal, porque su glaciar era pequeño y excavó menos. Por eso tantas cascadas pirenaicas caen desde lo alto de una pared.</li>
<li><b>Morrenas:</b> lomas de piedras y barro de todos los tamaños mezclados, que el glaciar empujó y dejó en sus bordes y en su frente. Muchas cierran ibones como presas naturales.</li>
<li><b>Rocas aborregadas:</b> lomos de roca pulida y estriada, suaves por el lado de donde venía el hielo y rotos por el otro.</li>
<li><b>Bloques erráticos:</b> rocas sueltas de un tipo que no tiene nada que ver con el suelo donde están: las trajo el hielo.</li>
</ul>
<div class="box tech"><b>Dato técnico</b>En el Pirineo, el máximo avance de los glaciares fue anterior al gran máximo global de hace unos 20.000 años. Algunas lenguas llegaron a superar los 30-40 km de longitud y bajaron hasta unos 800-1.000 m de altitud.</div>
<h3>Los últimos</h3>
<p>Hoy quedan pequeños glaciares en las caras norte de los macizos más altos (Aneto, Monte Perdido, Posets, Balaitús…), muy menguados. Han perdido la mayor parte de su superficie desde finales del siglo XIX y los estudios prevén que la mayoría desaparezca en las próximas décadas.</p>
<h3>¿Y en Teruel?</h3>
<p>En Gúdar y Javalambre no hubo glaciares, pero sí un clima <b>periglaciar</b>: el suelo se helaba y deshelaba constantemente. Eso dejó canchales y pedreras (piedras angulosas rotas por el hielo), coladas de derrubios y, en las cumbres de Javalambre, suelos con piedras ordenadas en círculos o franjas. Son formas más discretas, pero cuentan la misma historia de frío.</p>`
},
{
  id: 'karst', em: '🕳️', kicker: 'Geología', title: 'El karst: montañas que se disuelven',
  lead: 'La caliza tiene un punto débil: el agua de lluvia, ligeramente ácida, la disuelve. Con tiempo suficiente, una sierra caliza se convierte en un queso gruyer, y buena parte de su agua viaja por dentro, no por fuera.',
  body: `
<h3>La química (en una frase)</h3>
<p>El agua de lluvia recoge dióxido de carbono del aire y, sobre todo, del suelo (donde respiran raíces y microbios), y se vuelve un ácido muy débil. Ese ácido convierte el carbonato cálcico, insoluble, en bicarbonato, que sí se disuelve y se va con el agua. Cuando el agua sale a una cueva y pierde ese CO₂, el carbonato vuelve a precipitar: así crecen estalactitas y estalagmitas.</p>
<h3>Lo que verás por fuera</h3>
<ul>
<li><b>Lapiaz (lenar):</b> superficies de roca con surcos, canales y aristas cortantes, como si la hubieran rallado. Típico de las cumbres calizas.</li>
<li><b>Dolinas:</b> hoyos redondos de unos metros a cientos de metros donde el terreno se hunde porque el agua se escapa por debajo. En las parameras de Javalambre y Gúdar hay muchas; a veces tienen el fondo cultivado porque acumulan la tierra buena.</li>
<li><b>Simas:</b> pozos verticales que comunican con cuevas.</li>
<li><b>Ríos que desaparecen:</b> cauces secos casi todo el año, o ríos que se meten en un sumidero y salen kilómetros más allá en una surgencia o «fuente» potente.</li>
</ul>
<div class="box"><b>Historia</b>El agua del glaciar del Aneto se mete por el Forau d'Aigualluts, en el valle de Benasque, y no sale por el Ésera hacia el Mediterráneo: reaparece en el valle de Arán, en los Uelhs deth Joèu, y acaba en el Garona y el Atlántico. Lo demostró el espeleólogo Norbert Casteret en 1931 tiñendo el agua con colorante.</div>
<h3>Por qué importa en la montaña</h3>
<p>Las sierras kársticas son secas por arriba aunque llueva mucho: el agua se cuela enseguida. Por eso en las muelas de Teruel apenas hay arroyos en las cumbres, y las fuentes aparecen abajo, al pie de los cortados, donde la caliza se apoya sobre una capa impermeable (margas o arcillas). Las masías tradicionales suelen estar justo en esa línea de fuentes.</p>
<p>Y otra consecuencia: las dolinas y hoyas cerradas son <b>trampas de aire frío</b>. Al no tener salida, por la noche se llenan de aire helado y registran temperaturas muy por debajo de su entorno.</p>`
},
{
  id: 'pisos', em: '🌲', kicker: 'Vegetación', title: 'Por qué los árboles cambian al subir',
  lead: 'Subir una montaña es como viajar hacia el norte a toda velocidad. Cada pocos cientos de metros cambian los árboles, y no es casualidad: cada especie tiene su rango de frío, de agua y de duración del verano.',
  body: `
<h3>La regla básica</h3>
<p>El aire se enfría unos <b>0,6-0,7 °C por cada 100 m</b> que subes, porque se expande al haber menos presión encima. Subir 1.000 m es bajar unos 6 °C la media. En términos de clima, subir 100 m se parece a desplazarte unos 100-150 km hacia el norte. Por eso en una sola ladera puedes pasar de un carrascal mediterráneo a un pinar «de Escandinavia».</p>
<div data-int="pisos"></div>
<h3>Qué decide dónde vive cada árbol</h3>
<ul>
<li><b>Frío invernal:</b> qué temperatura mínima aguanta sin que se le congelen los tejidos.</li>
<li><b>Duración del verano:</b> cuántas semanas tiene para formar madera nueva. Es lo que marca el <b>límite del bosque</b>: por encima, el periodo cálido es demasiado corto.</li>
<li><b>Agua en verano:</b> el haya y el abeto necesitan humedad (nieblas, lluvias de verano); la carrasca y la sabina aguantan meses de sequía.</li>
<li><b>Suelo:</b> sobre caliza crecen unas especies (carrasca, quejigo, sabina, boj); sobre roca ácida (granito, arenisca, rodeno) otras (rebollo, pino rodeno, brezos, jaras, rododendro).</li>
</ul>
<h3>Solana y umbría: la montaña tiene dos climas</h3>
<p>En nuestras latitudes, una ladera orientada al sur (<b>solana</b>) recibe mucha más radiación que una orientada al norte (<b>umbría</b>, «paco» en buena parte de Aragón). La diferencia equivale a varios cientos de metros de altitud. Por eso en un mismo barranco ves carrascas en la solana y pinos silvestres, acebos o tejos en la umbría, y la nieve dura semanas más en el lado norte.</p>
<h3>Cuando los pisos se invierten</h3>
<p>En los valles con inversión térmica frecuente (ver «Cuando el frío se encharca») puedes encontrar especies de clima frío en el fondo y otras más «templadas» a media ladera, al revés de lo esperado. Es una de las cosas más bonitas de observar en las sierras de Teruel.</p>
<div class="box"><b>En Otero</b>La ficha de cada punto te dice en qué región estás y qué especies son más probables a esa altitud. Si un árbol no encaja con el piso, fíjate en la orientación y en si estás en una hondonada.</div>`
},
{
  id: 'inversion', em: '🌡️', kicker: 'Clima', title: 'Inversión térmica: cuando el frío se encharca',
  lead: 'Lo normal es que haga más frío cuanto más subes. Pero en muchas noches de invierno pasa lo contrario: el fondo del valle está helado y a media ladera se está bastante mejor. Es la inversión térmica, y en las sierras de Teruel es casi el clima de cada noche despejada.',
  body: `
<div data-int="inversion"></div>
<h3>Qué pasa, paso a paso</h3>
<p><b>1. El suelo pierde calor hacia el cielo.</b> De noche, todo cuerpo emite calor en forma de radiación infrarroja. Si el cielo está despejado y el aire es seco, ese calor se escapa al espacio sin que nada lo devuelva. Las nubes funcionan como una manta: por eso las noches nubladas son más templadas.</p>
<p><b>2. El aire en contacto con el suelo se enfría.</b> Y el aire frío es más denso, pesa más.</p>
<p><b>3. Ese aire frío resbala ladera abajo</b>, como un líquido lento. Es el «viento catabático» o de drenaje: una brisa suave y helada que baja por barrancos y vaguadas, a veces perceptible en la cara al anochecer.</p>
<p><b>4. Se acumula en las partes bajas</b>: fondos de valle, hoyas, dolinas, navas y llanos cerrados. Allí se forma un «lago» de aire frío que puede tener decenas o cientos de metros de espesor.</p>
<p><b>5. A media ladera queda una franja más templada</b>, por encima del lago frío pero por debajo de las cumbres: el <b>cinturón térmico</b>. Es donde tradicionalmente se ponían los frutales y donde menos hiela.</p>
<h3>Qué necesita para formarse</h3>
<ul>
<li>Cielo despejado (sin manta de nubes).</li>
<li>Viento flojo (el viento mezcla el aire y deshace el lago frío).</li>
<li>Noches largas (otoño e invierno): más horas perdiendo calor.</li>
<li>Aire seco y, si hay, nieve en el suelo, que irradia muchísimo y aísla del calor de la tierra.</li>
<li>Relieve cóncavo: un sitio al que el aire frío llegue y del que no pueda salir.</li>
</ul>
<h3>Cómo detectarla</h3>
<ul>
<li>Escarcha o niebla en el fondo y laderas limpias por encima.</li>
<li>El humo de las chimeneas sube y de repente se aplana en una capa horizontal: ahí está el techo de la inversión.</li>
<li>Un <b>mar de nubes</b> visto desde arriba.</li>
<li>Con un termómetro de mano: mide a la misma hora en el fondo y a media ladera. En noches de manual se encuentran diferencias de varios grados —a veces más de 10 °C— en pocos kilómetros y unos cientos de metros de desnivel.</li>
</ul>
<div class="box tech"><b>Por qué la previsión no lo ve</b>Los modelos meteorológicos trabajan con cuadrículas de varios kilómetros y un relieve suavizado. El fondo de un barranco y la loma de al lado caen en la misma celda, así que la previsión «promedia» ambos sitios. En noches de inversión, el fondo suele quedar bastante por debajo de lo previsto y las lomas, por encima.</div>
<h3>Cómo lo calcula Otero</h3>
<p>Para cada punto, Otero compara su altitud con la del terreno en dos anillos alrededor (a 1 y a 2,5 km). Si estás claramente por debajo, estás en una zona donde se acumula el frío. Después mira la previsión de la noche: nubosidad y viento. Con las dos cosas da un riesgo orientativo. Y en «Mediciones» puedes ir guardando tus propias lecturas de temperatura con su sitio y hora, para comprobar en tu terreno dónde se forma el lago frío.</p>`
},
{
  id: 'continentalidad', em: '🥶', kicker: 'Clima', title: 'Por qué Teruel es tan frío',
  lead: 'Teruel no está más al norte que Madrid ni es más alto que muchas sierras. Y sin embargo tiene algunos de los inviernos más duros de la península. La clave está en una palabra: continentalidad.',
  body: `
<h3>Lejos del mar, aunque esté cerca</h3>
<p>El mar es un gran termostato: se calienta y se enfría muy despacio y suaviza las temperaturas de las costas. Teruel está a poco más de 100 km del Mediterráneo en línea recta, pero entre medias hay sierras que frenan la llegada del aire marino. A efectos de clima, está «tierra adentro».</p>
<h3>Altura de partida</h3>
<p>Buena parte de la provincia está por encima de los 900-1.000 m. No hay que subir a una cumbre para tener frío: ya vives en altura.</p>
<h3>Aire seco y cielos limpios</h3>
<p>El aire seco y los cielos despejados dejan escapar el calor de noche (y entrar el sol de día). Resultado: <b>enormes diferencias entre el día y la noche</b>, de 15-20 °C en muchas jornadas, que son la marca de la continentalidad.</p>
<h3>Altiplanos y hoyas</h3>
<p>El relieve de parameras con depresiones (la fosa del Jiloca, la de Teruel, hoyas y navas) favorece que el aire frío se acumule y se quede: es la inversión térmica a gran escala. El llamado «triángulo del frío» entre Calamocha, Molina de Aragón y Teruel es famoso por las temperaturas más bajas registradas en estaciones habitadas de la península.</p>
<h3>Y el viento del norte</h3>
<p>Las olas de frío llegan con aire del norte o del nordeste que entra por el valle del Ebro y sube a las parameras. En las sierras, ese viento se canaliza por los barrancos y collados, y se nota mucho más en algunos sitios que en otros según cómo esté orientado el relieve.</p>
<div class="box"><b>Para comparar</b>Una buena forma de entender tu zona es mirar en la ficha de Otero la previsión de un punto en el fondo del valle y otro en una loma cercana, y después contrastarlo con lo que mides tú: las diferencias te dirán cómo se comporta el aire en ese relieve concreto.</div>`
},
{
  id: 'toponimia', em: '🗺️', kicker: 'Nombres', title: 'Diccionario de nombres de montaña',
  lead: 'Los nombres de los mapas son descripciones antiguas del terreno. Saber qué significan te dice qué esperar antes de llegar: si un sitio es umbrío, si tiene agua, si es una hondonada helada o una cima plana.',
  body: `<div data-int="toponimia"></div>`
},
];

export const articleById = id => ARTICLES.find(a => a.id === id);
