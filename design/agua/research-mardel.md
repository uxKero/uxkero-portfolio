# Mar del Plata vista desde abajo del agua: investigación de assets

Fecha: 15/10/2026. Escena: three.js realista, cámara bajo la superficie mirando hacia arriba y afuera; un hito de la costa asoma sobre el agua, deformado por la superficie (ventana de Snell y refracción).

Licencias aptas para un portfolio comercial: CC0, CC-BY (con crédito) o creación propia. Todo lo de abajo se verificó contra la API de Sketchfab, la API de Poly Haven, la API de ambientCG y la API de Wikimedia Commons. No se descargó nada pesado.

---

## 1. Recomendación

**El hito: el Lobo Marino de la Rambla, a contraluz al atardecer.** Visto desde abajo del agua es la silueta que mejor se lee. Es una masa compacta y vertical, con el cuello y el hocico apuntando al cielo, y se reconoce aunque la superficie la deforme. La foto "Lobo imponente" de Commons (sección 4) lo muestra: a contraluz, recortado contra el sol, es Mar del Plata sin necesidad de texto.

El problema es legal, no técnico:

- La escultura es de José Fioravanti (1940) y él murió en 1977. En Argentina el derecho de autor dura la vida del autor más 70 años, así que **la obra está protegida hasta fines de 2047**.
- Argentina **no tiene libertad de panorama para escultura** (Commons: Freedom of panorama marca Argentina "3D artwork: Not OK" y "Buildings: OK").
- Por eso no hay ningún modelo libre de la estatua real, y una réplica fiel hecha por nosotros sería una obra derivada.

**Lo que conviene hacer:**

1. **Opción A (recomendada): un lobo marino de creación propia, sobre una roca de la escollera, a contraluz.** La pose es la del monumento, sentado y con el pecho y el hocico arriba, porque esa es la pose natural de *Otaria flavescens* y no le pertenece a nadie. La talla estilizada de Fioravanti no se copia. Base: el modelo realista de Tripo (CC-BY, abajo) o un modelado propio en Blender, puesto sobre las rocas costeras de Poly Haven (CC0). A contraluz casi no se ve la superficie: lo que se lee es el contorno, y el contorno de un lobo sentado es genérico.
2. **Opción B (la más segura en lo legal): el Torreón del Monje.** Es un edificio de 1904 y para edificios la libertad de panorama sí vale. Está construido sobre las rocas, literalmente encima del mar, así que su base rocosa entra al agua y la torre con almenas asoma sobre la superficie. No hay modelo 3D: habría que hacerlo en Blender con primitivas (torre cilíndrica, almenas, arco del puente). Su silueta es más complicada y se lee peor deformada.
3. **Sumar lobos de verdad nadando bajo el agua.** Es lo que más fuerza tiene y no tiene ningún problema legal: uno o dos lobos marinos que cruzan cerca de la cámara mientras el hito queda arriba, deformado.

**Descartados como hito principal:**
- **Faro Punta Mogotes:** está en tierra, sobre una loma, lejos de la línea del agua. Desde abajo de la superficie no se ve.
- **Casino y Hotel Provincial:** son de Bustillo (murió en 1982). Como edificio la libertad de panorama sirve, pero desde el agua es un bloque horizontal ancho y deformado se lee como cualquier edificio.
- **Banquina con los barcos naranjas:** el naranja se ve bien desde abajo, pero hacen falta varios barcos y no hay modelos libres. Queda como una segunda escena posible.

---

## 2. Modelos 3D encontrados (Sketchfab, todos descargables)

### Mar del Plata en concreto
| Modelo | Autor | Licencia | Caras | Nota |
|---|---|---|---|---|
| [Lobo marino de Mar del Plata](https://sketchfab.com/3d-models/lobo-marino-de-mar-del-plata-bcca655cfce440df94922a7b77281315) | Anahí Espósito (@anahiesposito) | CC-BY | 276.738 | Fotogrametría con 3DF Zephyr Free, 49 fotos. Según la miniatura es una **figura chica o souvenir**, rosada y con la melena tallada en surcos, no la estatua de la Rambla. Además hereda el problema de derecho de autor de la obra original. No sirve. |
| [Lobo Marino Malvinas](https://sketchfab.com/3d-models/lobo-marino-malvinas-25f47285b96d479d8a279543037246a2) | @3rotaemaus | CC-BY | 11.482 | Modelo de estudiantes; probablemente el lobo de Pallarols (2019, también protegido). Poco útil. |
| [Museo Mar Del Plata](https://sketchfab.com/3d-models/museo-mar-del-plata-7badf845e25041509c4ca673a054ab4c) | @micalu.2005 | CC-BY | 30.107 | El MAR; no es costero. |
| [Mardel](https://sketchfab.com/3d-models/mardel-26d6ffbbe0124f7c834832e580864d7c) | @lunakorenman | CC-BY | 1,1 M | Fotogrametría rota. No sirve. |
| [Arroyo Corrientes, Mar del Plata](https://sketchfab.com/3d-models/none-cf798990c2144b8ebd775d5800d2c4d9) | | CC-BY | 724.802 | Escaneo de terreno o rocas, sirve como referencia para el fondo. Revisar. |

**No hay modelos** del Torreón del Monje, del Casino o Rambla, del Faro Punta Mogotes ni de la banquina en Sketchfab (búsquedas: "torreon del monje", "rambla mar del plata", "casino mar del plata", "punta mogotes", "hotel provincial", "fioravanti", "banquina"). Tampoco en Polycam, Thingiverse ni Printables según la búsqueda web. El faro más cercano con modelo es el [Faro de Punta del Este](https://sketchfab.com/3d-models/faro-de-punta-del-este-1860-958327ad913a485a8eabfddc9875a28a) (CIPAC, CC-BY, fotogrametría con drone), que no es el nuestro.

### Lobo marino como animal
| Modelo | Autor | Licencia | Rig y animación | Caras | Comentario |
|---|---|---|---|---|---|
| [sea lion 3d model](https://sketchfab.com/3d-models/sea-lion-3d-model-97931d75f2154463920aa63d5a8c2388) | grodan (@zhaoqinzzq) | CC-BY | no | 1,32 M | **El más realista.** Hecho con Tripo; lobo adulto sentado, con textura. Hay que decimarlo (a unas 30k caras) y es estático. Sirve para el lobo sobre la roca (opción A). Nadando necesitaría otra pose o un rig. |
| [Sea Lion (Pro Scan)](https://sketchfab.com/3d-models/sea-lion-pro-scan-f6d4322fc0374e11832254d2581a3ac3) | Lindy | CC-BY | no | 451k | Escaneo de un objeto (figura), archivado. |
| [Sea Lion](https://sketchfab.com/3d-models/sea-lion-546b270488c74a09acd99d9a15b86ec8) | ehelfant | CC-BY | no | 350k | Malla sin textura, pose de "nado", estilo de juguete. |
| [Sea Lion_v2 v1](https://sketchfab.com/3d-models/sea-lion-v2-v1-ed37ed3af4be435e89bc9aa355e58a8e) | @andreysouzanascimento692 | CC-BY | no | 59.568 | Sentado, simple. |
| [California Sea Lion](https://sketchfab.com/3d-models/california-sea-lion-1dea2a5cfe9c4ff09a3a8af46913b8ce) | mismo autor | CC-BY | no | 1.984 | Low-poly. |
| [Sea lion statue, Marina, San Francisco](https://sketchfab.com/3d-models/sea-lion-statue-marina-san-francisco-1-65fe1034b180420bbf2eb00e87092ad5) | Emm (@edemaistre) | CC-BY | no | 114k | Escaneo con Scaniverse de **otra** estatua de lobo marino. Sirve como silueta de "monumento de lobo" sin ser Fioravanti, pero tiene sus propios derechos de escultura en EE.UU. Usar con criterio. |
| [Aniamted Seal](https://sketchfab.com/3d-models/aniamted-seal-28d9c15e455b4bbca3843ca1a3629b76) | @igor-lir | CC-BY | 1 animación | 12.280 | Realista, pero es una **foca** (manchada, sin orejas). No es *Otaria*. |
| [Seal](https://sketchfab.com/3d-models/seal-0616281841b44983b1c113b578c0f0ce) | @rkuhlf | CC-BY | **riggeado: nado, desplazamiento en tierra, idle** | 610 | Low-poly con sombreado plano. El único rig libre con ciclo de nado. Sirve como **esqueleto y animación** para pasar a la malla realista (retarget en Blender), no como malla final. |
| Seal - Animated Low Poly | | CC-BY-**NC** | 9 animaciones | 616 | **No sirve (NC).** |
| Model 85/86 California Sea Lion | | CC-BY-**NC** | | | **No sirven (NC).** |
| [Sea Lion (toro ardido)](https://sketchfab.com/3d-models/sea-lion-8a5e5cdf4115474399fcbe5636b46bb4) | | CC-BY | 2 animaciones | 264 | Ripeado de Final Fantasy III: **propiedad intelectual de terceros. Descartado.** |

Pagos (no CC): el lobo riggeado de Nyilonelycompany (Fab) y el "animated seal sea lion" de madecg en RenderHub.
Smithsonian 3D (CC0): no tiene lobo marino.

**Para el lobo nadando conviene animar por shader, no con rig:** la malla estática realista se orienta horizontal y se dobla en un vertex shader con una onda senoidal sobre el eje del cuerpo, con las aletas delanteras como remos. Para algo que cruza en 3 o 4 segundos dentro del agua turbia, alcanza y sobra. Si hace falta más, se hace un retarget del rig de @rkuhlf en Blender.

### Algas (para el fondo)
| Modelo | Autor | Licencia | Nota |
|---|---|---|---|
| [Animated Kelp](https://sketchfab.com/3d-models/animated-kelp-74c400fd4d81469199268ac27451d03f) | JosephWPugsley | CC-BY | 7.120 caras, rig y 3 loops, más de 400 hojas con shape keys. Es el mejor. |
| [Kelp with animation](https://sketchfab.com/3d-models/kelp-with-animation-22f71d83535c41c1bfa12b2d3e64af0e) | cswindley | CC-BY | 49k caras, opacity maps de Substance. |
| [Laguna Beach Kelp - Photoscan](https://sketchfab.com/3d-models/laguna-beach-kelp-photoscan-31ee8745476b4d1db8f9030f5afa793d) / [Large](https://sketchfab.com/3d-models/laguna-kelp-large-photoscan-ca3aa19fc70e42bf9b8809771903cc14) | JWjodoin1 | CC-BY | Algas tiradas en la arena, para el fondo. |
| [Scan of Kelp and Seaweed on sand beach](https://sketchfab.com/3d-models/scan-of-kelp-and-seaweed-on-sand-beach-c9b5ef07047a4b7a90a4ffd6930ec22c) | sterlingcrispin | CC-BY (la descripción dice cc0) | Escaneo de iPhone. |

Nota de realismo: en Mar del Plata no hay bosques de kelp gigante. El fondo real es arena, plataforma de "tosca" (loess cementado) y bloques de la escollera con mejillines y algas cortas. **Conviene poner pocas algas y bajas**; una alga tipo cinta suelta ondeando alcanza.

---

## 3. HDRI, cielo y texturas (todo CC0)

### HDRI de Poly Haven (golden hour sobre el océano)
- **[the_sky_is_on_fire](https://polyhaven.com/a/the_sky_is_on_fire)**: atardecer, rambla con baranda, océano y olas. Es casi una rambla. **Primera opción.**
- [umhlanga_sunrise](https://polyhaven.com/a/umhlanga_sunrise): amanecer sobre una playa con olas. En Mar del Plata el sol sale del mar, así que este es el más fiel a la geografía (el atardecer real cae del lado de tierra).
- [blouberg_sunrise_1](https://polyhaven.com/a/blouberg_sunrise_1) y [blouberg_sunrise_2](https://polyhaven.com/a/blouberg_sunrise_2): amanecer en playa con edificios; contraste bajo.
- [fish_hoek_beach](https://polyhaven.com/a/fish_hoek_beach): nublado y suave.
- [cape_hill](https://polyhaven.com/a/cape_hill): sol sobre el océano con contraste alto, bueno para un contraluz.
- Cielos puros, sin suelo (para que el horizonte sea solo mar): [qwantani_dusk_2_puresky](https://polyhaven.com/a/qwantani_dusk_2_puresky), [qwantani_sunrise_puresky](https://polyhaven.com/a/qwantani_sunrise_puresky), [belfast_sunset_puresky](https://polyhaven.com/a/belfast_sunset_puresky), [kloppenheim_06_puresky](https://polyhaven.com/a/kloppenheim_06_puresky).
- Para la web alcanza la versión **1k o 2k en .hdr**. Mejor todavía, se convierte a KTX2 o a PMREM precalculado. Una de 4k pesa más de 20 MB.

Detalle físico clave: desde abajo del agua, el cielo solo se ve dentro de un cono de unos 97° (la ventana de Snell). Afuera de ese cono hay reflexión interna total, o sea el fondo reflejado. El HDRI se muestrea solo adentro de esa ventana y con la deformación de la superficie.

### Texturas PBR para el fondo y las rocas
Poly Haven (CC0):
- Arena: [damp_beach_sand](https://polyhaven.com/a/damp_beach_sand), [damp_sand](https://polyhaven.com/a/damp_sand), [coast_sand_01](https://polyhaven.com/a/coast_sand_01) a [coast_sand_05](https://polyhaven.com/a/coast_sand_05), [dense_sand](https://polyhaven.com/a/dense_sand).
- Roca costera y fondo: [low_tide_rocks](https://polyhaven.com/a/low_tide_rocks) (**la mejor para la base de la escollera**), [coast_sand_rocks_02](https://polyhaven.com/a/coast_sand_rocks_02), [cliff_side](https://polyhaven.com/a/cliff_side), [clean_pebbles](https://polyhaven.com/a/clean_pebbles).
- Modelos de roca (CC0, colección Smuggler's Cove): [coast_rocks_01](https://polyhaven.com/a/coast_rocks_01), [coast_rocks_02](https://polyhaven.com/a/coast_rocks_02), [coast_rocks_03](https://polyhaven.com/a/coast_rocks_03), [coast_rocks_05](https://polyhaven.com/a/coast_rocks_05), [coast_land_rocks_02](https://polyhaven.com/a/coast_land_rocks_02) a [_04](https://polyhaven.com/a/coast_land_rocks_04), [coastal_cliff_01](https://polyhaven.com/a/coastal_cliff_01). Sirven para armar la escollera y la base del lobo o del Torreón.
- Barcos (por si se hace la banquina): [dutch_ship_medium](https://polyhaven.com/a/dutch_ship_medium); son barcos de época, no pesqueros. No sirven tal cual.

ambientCG (CC0), materiales más populares:
- Arena y suelo: [Ground054](https://ambientcg.com/view?id=Ground054), [Ground080](https://ambientcg.com/view?id=Ground080), [Ground093C](https://ambientcg.com/view?id=Ground093C), [Ground078](https://ambientcg.com/view?id=Ground078).
- Roca: [Rock064](https://ambientcg.com/view?id=Rock064), [Rock063](https://ambientcg.com/view?id=Rock063), [Rock058](https://ambientcg.com/view?id=Rock058), [Rock051](https://ambientcg.com/view?id=Rock051), [Rock030](https://ambientcg.com/view?id=Rock030), [Rock020](https://ambientcg.com/view?id=Rock020).
- ambientCG no tiene material de algas.

Cáusticas: se generan procedurales en el shader (Voronoi animado o dos capas de ruido). No hace falta un asset.

---

## 4. Fotos de referencia (Wikimedia Commons)

Ojo: las fotos CC-BY-SA sirven para **mirar y modelar**. No conviene **meterlas tal cual** en el portfolio: SA obliga a compartir igual, y además fotografían una escultura protegida.

### Lobo Marino de la Rambla ([Category:Monumento al Lobo Marino](https://commons.wikimedia.org/wiki/Category:Monumento_al_Lobo_Marino))
- [Lobo imponente.jpg](https://commons.wikimedia.org/wiki/File:Lobo_imponente.jpg): CC BY-SA 3.0, 2048x1536. **Silueta a contraluz al atardecer: la referencia exacta del plano.**
- [Edificio Havanna y Lobo Marino.JPG](https://commons.wikimedia.org/wiki/File:Edificio_Havanna_y_Lobo_Marino.JPG): CC BY-SA 4.0, 2048x3072. Vista de perfil y tres cuartos con la Rambla de fondo.
- [Lobo marino Rambla Mar del Plata 2026.jpg](https://commons.wikimedia.org/wiki/File:Lobo_marino_Rambla_Mar_del_Plata_2026.jpg): CC BY-SA 4.0, 720x1600.
- [Buenos Aires - Mar del Plata - Hotel Provincial y Casino.jpg](https://commons.wikimedia.org/wiki/File:Buenos_Aires_-_Mar_del_Plata_-_Hotel_Provincial_y_Casino.jpg): CC BY-SA 3.0.
- [Gran Hotel Provincial MDQ (ca. 1950).jpg](https://commons.wikimedia.org/wiki/File:Gran_Hotel_Provincial_MDQ_(ca._1950).jpg): dominio público (la foto).

### Torreón del Monje
- [TorreondelMonje-MDP-ene2015.jpg](https://commons.wikimedia.org/wiki/File:TorreondelMonje-MDP-ene2015.jpg): CC BY-SA 3.0, 4521x3082.
- [VistadelTorreondelMonje.jpg](https://commons.wikimedia.org/wiki/File:VistadelTorreondelMonje.jpg): CC BY-SA 3.0, 4608x3456.
- [PlayaTorreondelMonjeMDP-feb2020.jpg](https://commons.wikimedia.org/wiki/File:PlayaTorreondelMonjeMDP-feb2020.jpg): CC BY-SA 4.0, panorámica 5756x2280.
- [TORREON DEL MONJE DE MAR DEL PLATA.jpg](https://commons.wikimedia.org/wiki/File:TORREON_DEL_MONJE_DE_MAR_DEL_PLATA.jpg): CC BY-SA 4.0.
- Históricas en dominio público: [1915](https://commons.wikimedia.org/wiki/File:Torreon_del_monje_mdp_1915.jpg), [1918](https://commons.wikimedia.org/wiki/File:Torreon_del_monje_en_1918.jpg), [ca. 1910](https://commons.wikimedia.org/wiki/File:Torre%C3%B3n_del_Monje_(ca._1910).png).

### Faro Punta Mogotes
- [Faro de Punta Mogotes.JPG](https://commons.wikimedia.org/wiki/File:Faro_de_Punta_Mogotes.JPG): CC BY-SA 4.0. [FaroMDP-0005.jpg](https://commons.wikimedia.org/wiki/File:FaroMDP-0005.jpg): CC BY-SA 4.0, 3590x5311. [Faro Punta Mogotes 2020.jpg](https://commons.wikimedia.org/wiki/File:Faro_Punta_Mogotes_2020.jpg): CC BY-SA 4.0.
- [AGN, 1890 aprox, Faro en Punta Mogotes](https://commons.wikimedia.org/wiki/File:Archivo_General_de_la_Naci%C3%B3n_Argentina_1890_aprox_Mar_del_Plata,_Faro_en_Punta_Mogotes.jpg): dominio público.

### Lobos marinos vivos (*Otaria flavescens*)
- [Reserva Lobos Marinos.JPG](https://commons.wikimedia.org/wiki/File:Reserva_Lobos_Marinos.JPG): CC BY-SA 4.0, 3998x2888. Es la colonia del puerto.
- [Patagonian sea lion (4707536102).jpg](https://commons.wikimedia.org/wiki/File:Patagonian_sea_lion_(4707536102).jpg): **CC BY 2.0**, 4000x3000.
- [Otaria flavescens, Lobo Marino Chusco o de un pelo.jpg](https://commons.wikimedia.org/wiki/File:Otaria_flavescens,_Lobo_Marino_Chusco_o_de_un_pelo.jpg): CC BY-SA 4.0.
- Bajo el agua: [Dive with sea lions - panoramio.jpg](https://commons.wikimedia.org/wiki/File:Dive_with_sea_lions_-_panoramio.jpg) (CC BY-SA 3.0, chica), [Zoo de Vincennes - À la nage](https://commons.wikimedia.org/wiki/File:Zoo_de_Vincennes,_Avril_2014_-_%C3%80_la_nage.jpg) (CC BY-SA 2.0, 6016x4000), [Lions de mer Amnéville 01](https://commons.wikimedia.org/wiki/File:Lions_de_mer_Amn%C3%A9ville_01.jpg) (dominio público).

---

## 5. Crear el modelo: qué tan viable es

### Blender (instalado)
- **Blender 4.5** en `C:\Program Files\Blender Foundation\Blender 4.5\blender.exe`. **No está en el PATH**: se llama con la ruta completa (`& "C:\Program Files\Blender Foundation\Blender 4.5\blender.exe" -b -P script.py`).
- Con eso se puede, sin interfaz: decimar el lobo de Tripo de 1,3 M a unas 30k caras, hornear las normales, exportar a GLB con Draco o meshopt, y armar el Torreón con primitivas desde un script de Python.

### Imagen a 3D
| Herramienta | Licencia de lo que genera | Comentario |
|---|---|---|
| **Tripo** | Gratis: público y CC-BY 4.0; sobre si permite uso comercial, las páginas de la propia Tripo **se contradicen**. Pago: uso comercial y privado. | El lobo realista de Sketchfab ya salió de Tripo. Alan está en el programa de ambassadors de Tripo. Usar el plan pago para la versión final. |
| **Microsoft TRELLIS** | Código y pesos MIT; la salida es nuestra | Corre local con GPU de 16 GB o más, o en un Space de Hugging Face. Buena geometría; las texturas son medianas. |
| **Hunyuan3D 2.x** (Tencent) | Tencent Hunyuan Community License: **excluye la UE, el Reino Unido y Corea del Sur**; para Argentina la salida es nuestra | La mejor calidad de textura de las abiertas. |
| **Meshy** | Gratis: CC-BY; pago: privado y comercial | Bien; con créditos. |
| **Higgsfield** (ya tiene CLI y cuenta) | Según el plan | La skill `higgsfield-generate` puede generar GLB. |

**Cómo usarlas bien:** no subir una foto del monumento de Fioravanti (sería una copia de la obra protegida). Hay que generar el lobo **desde la foto de un lobo vivo** (por ejemplo la CC BY 2.0 "Patagonian sea lion") o desde una imagen generada de "lobo marino sudamericano macho sentado en una roca, perfil, cuello arriba". Con eso la pose evoca el monumento y la obra es propia. Para el plano a contraluz importa la silueta: la textura casi no se ve.

---

## 6. Plan de assets propuesto (opción A)

1. Cielo: `the_sky_is_on_fire` o `qwantani_dusk_2_puresky` en 2k, como PMREM. Sol bajo detrás del lobo.
2. Hito: un lobo propio (Tripo pago o TRELLIS, desde la foto CC BY 2.0), decimado en Blender a unas 30k caras, sentado sobre `coast_rocks_0x` (CC0) con `low_tide_rocks` (CC0). Material oscuro y mojado; a contraluz es casi negro.
3. Superficie: un plano con normales Gerstner o FFT, visto desde abajo. Ventana de Snell, reflexión interna total afuera y refracción del cielo y del lobo adentro.
4. Fondo: arena `damp_beach_sand` o `Ground054`, algunas rocas, una o dos algas `Animated Kelp` (CC-BY) cortas.
5. Vida: uno o dos lobos nadando (la misma malla, ondulada por vertex shader) que cruzan entre la cámara y la superficie.
6. Agua: niebla exponencial verde azulada (las aguas de Mar del Plata son turbias, de color verde oliva y marrón, no azul caribe), cáusticas procedurales en el fondo, partículas en suspensión y god rays desde la ventana.

Créditos que hay que poner (CC-BY): el autor del lobo de Sketchfab o Tripo (si se usa ese), JosephWPugsley (algas) y el autor de cualquier rig que se use. Poly Haven y ambientCG no piden crédito (CC0).

---

## Fuentes
- API de Sketchfab: `api.sketchfab.com/v3/search` y `/v3/models/{uid}` (licencias leídas de la API).
- API de Poly Haven: `api.polyhaven.com/assets`
- API de ambientCG: `ambientcg.com/api/v2/full_json`
- Wikimedia Commons: [Commons:Freedom of panorama](https://commons.wikimedia.org/wiki/Commons:Freedom_of_panorama), [Category:Monumento al Lobo Marino](https://commons.wikimedia.org/wiki/Category:Monumento_al_Lobo_Marino)
- Licencia de Tripo: [blog de Tripo sobre uso comercial](https://www.tripo3d.ai/blog/commercial-use-ai-3d-models), [Tripo, licencias para game dev](https://www.tripo3d.ai/game-development/3d-assets-license-game-development), [Costbench](https://costbench.com/software/ai-3d-generation/tripo-ai/)
- Lobos de pago: [RenderHub, madecg](https://www.renderhub.com/madecg/animated-seal-sea-lion), [RenderHub, Nyilonelycompany](https://www.renderhub.com/nyilonelycompany/sea-lion-seal)
