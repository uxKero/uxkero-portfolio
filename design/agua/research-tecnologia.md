# Agua: research de tecnología

Escena: pantalla completa, cámara bajo el agua mirando hacia arriba a través de la superficie, con física que reacciona cuando el usuario arrastra la ventana del navegador por el escritorio (velocidad de `window.screenX/screenY` convertida en aceleración sobre el fluido, como un vaso que se mueve). Objetivo: lo más realista posible, 60 fps en una laptop decente, con fallback.

Fecha del research: 15/10/2026.

Nota sobre el proyecto: este repo (`uxkero-portfolio`) hoy es **Vite + React 19 + R3F 9.7 + three 0.185 (r185)**, no Next.js. Todo lo de abajo aplica igual; en Next solo cambia que el `<Canvas>` va en un componente cliente con `dynamic(..., { ssr: false })`. La última release de three es r186 (24/09/2026).

---

## 1. Opciones de simulación del fluido

| Opción | Qué simula | Slosh de un cuerpo de agua en un contenedor | Vista desde abajo | WebGL2 fallback | Licencia | Reusable |
|---|---|---|---|---|---|---|
| three.js `webgpu_compute_water` | Heightfield, ecuación de onda discreta (promedio de 4 vecinos menos altura previa, por viscosidad). Grid 128x128, TSL compute con `instancedArray` ping-pong | No. Solo ondas; no hay transporte de masa, así que la aceleración lateral no apila agua de un lado | Sí, es una malla desplazada: se puede ver por debajo | Parcial (lee storage buffer en vertex stage; en WebGL2 no hay random access a buffers) | MIT | Sí, patrón de kernels TSL directo |
| three.js `webgl_gpgpu_water` | Mismo heightfield con `GPUComputationRenderer` (render targets ping-pong) | No (igual que arriba) | Sí | Es WebGL | MIT | Sí, es la base natural del fallback |
| Evan Wallace WebGL Water ([demo](https://madebyevan.com/webgl-water/), [repo](https://github.com/evanw/webgl-water)) | Heightfield de ondas + esfera que empuja agua + caustics + pileta raytraced | No hay slosh global; sí desplazamiento local por objeto | **Sí, y es la mejor referencia**: dibuja la superficie dos veces, la segunda desde abajo con normal invertida, `refract(ray, n, 1.333/1.0)`, reflexión total interna cuando `refract` devuelve 0, Fresnel con piso 0.5 bajo agua | Es WebGL1 | MIT (header de `renderer.js`, Evan Wallace 2011) | Sí: shaders de superficie, caustics y paredes se portan casi tal cual |
| Shallow Water Equations (SWE) 2D en GPU | Altura + velocidad horizontal por celda; conserva masa; acepta fuerza de cuerpo | **Sí, es exactamente el modelo físico del slosh en un tanque** (el agua corre hacia un lado, rebota en la pared, oscila en sus modos propios) | Sí, sigue siendo un heightfield | Sí (render targets) | Implementación propia; referencias: [Celeris-WebGPU](https://github.com/cwedk/celeris) (Boussinesq, MIT, costero), [Brodtkorb 2011](https://hgpu.org/?p=6665) (esquema well-balanced con zonas secas) | Celeris sirve como referencia de WebGPU; el solver de tanque hay que escribirlo (es chico) |
| FFT ocean (Tessendorf) | Espectro de olas de mar abierto, periódico | No: es estadístico, no responde a fuerzas ni a paredes | Sí | Sí | three `webgl_shaders_ocean` (Ocean.js, FFT, MIT); [Tidewater](https://ilikekillnerds.com/2026/05/21/i-built-tidewater-threejs-ocean-kit/) (comercial, USD 75, r184, TSL, WebGPU con fallback WebGL2) | Solo como capa de detalle de alta frecuencia; no como motor del slosh |
| three `Water`/`Water2`, `webgpu_water`, `webgpu_ocean` (`WaterMesh`) | Normal maps animados + reflexión/refracción planar | No | No pensado para eso (`webgpu_ocean` limita la cámara arriba del agua) | Sí | MIT | No para esto |
| [jbouny/ocean](https://github.com/jbouny/ocean) | Espejo plano + normal maps (no es FFT), three r71 | No | No | WebGL | MIT | No, viejo |
| MLS-MPM 3D en WebGPU: [WebGPU-Ocean](https://github.com/matsuoka-601/WebGPU-Ocean) ([demo](https://webgpu-ocean.netlify.app)), [Splash](https://github.com/matsuoka-601/Splash) ([demo](https://splash-fluid.netlify.app)), [WaterBall](https://github.com/matsuoka-601/WaterBall) | Partículas + grid (MLS-MPM, Tait EOS); ~100k partículas en GPU integrada, ~300k en GPU decente; Splash `million` llega a ~1.6M | **Sí, el más realista**: olas que rompen, salpicaduras, agua que trepa la pared. Cambiar gravedad o sumar aceleración del contenedor es trivial | Difícil. Renderizan con screen-space fluid rendering (profundidad suavizada con narrow-range filter), pensado para ver el líquido desde afuera. Desde adentro mirando arriba no hay superficie "frontal" limpia | **No**: P2G usa atomics, que el backend WebGL2 de three no emula | MIT las tres | Sí, pero WebGPU crudo (TypeScript + Vite), no three |
| three `webgpu_compute_particles_fluid` | Port de WebGPU-Ocean a TSL: MLS-MPM, 32k partículas por defecto, máx 131k, grid 64³, 5 kernels (clear, p2g1, p2g2, grid update, g2p). Gravedad es un uniform | Sí (cambiando el uniform de gravedad o sumando aceleración); caja fija con bordes redondeados | Renderiza cada partícula como icosaedro; no hay superficie | No (atomics) | MIT | **Sí, es MPM ya en TSL dentro de three**: la base si se quiere modo "premium" |
| [holtsetio/flow](https://github.com/holtsetio/flow) ([demo](https://holtsetio.com/lab/flow/)) | MLS-MPM en three WebGPURenderer, derivado de WebGPU-Ocean, estética Refik Anadol | Sí | No (estética de partículas) | No | MIT | Sí como ejemplo de MPM con three |
| [kishimisu/WebGPU-Fluid-Simulation](https://github.com/kishimisu/WebGPU-Fluid-Simulation) | Stable Fluids de Jos Stam (Euleriano, humo/tinta 2D/3D), no agua con superficie libre | No | No | No | No declarada en la página | No para esto. El "Splash" que suele atribuirse a kishimisu es en realidad de matsuoka-601 |
| Yakuno, [AOI-01](https://works.utsubo.com/labs/aoi-01) | MLS-MPM con three + WebGPU (pasó de SPH a MPM por el límite de ~100k en SPH) | Sí | No consta | No | Sin repo publicado | No |

Conclusión de la sección: **lo que produce slosh real es SWE (2D) o MPM (3D)**. La ecuación de onda de los ejemplos de three hace ondas lindas pero no mueve masa: si sacudís la ventana, aparecen rulos, no se inclina el agua. Para ver la escena desde abajo, el heightfield (SWE) se renderiza perfecto; MPM exige reconstruir una superficie, cosa cara y que no tiene fallback.

---

## 2. Demos donde el líquido reacciona a mover la ventana

- No encontré una demo viral concreta y verificable de "agua que se mueve al arrastrar la ventana". Lo más cercano y famoso es [bgstaal/multipleWindow3dScene](https://github.com/bgstaal/multipleWindow3dScene) (Bjørn Staal, MIT), que sincroniza una escena three entre ventanas usando la posición de cada una.
- Cómo lee la posición: `WindowManager.js` arma `{x: window.screenLeft, y: window.screenTop, w: innerWidth, h: innerHeight}` y lo compara campo por campo en `update()`, que el loop de render llama **cada frame** (no hay evento de "window move"; se hace polling en `requestAnimationFrame`). Es el mismo patrón que el ejemplo de [MDN screenX](https://developer.mozilla.org/docs/Web/API/Window/screenX), que redibuja un círculo fijo en el espacio físico de la pantalla mientras movés la ventana.
- **No existe evento `move`**. Hay que hacer polling en rAF. `screenX`/`screenLeft` son alias, en px CSS (dividir por nada; si cambia el zoom cambia la escala), pueden ser negativos en multi-monitor.
- Polling rate: el de rAF (60, 120, 144 Hz según el monitor). La posición que reporta el navegador se actualiza cuando el SO le avisa al proceso del navegador (en Windows, `WM_MOVE`/`WM_WINDOWPOSCHANGED`), así que llega muestreada con jitter: hay que derivar con filtro.
- **Chrome en Windows durante el drag**: Windows mete un modal move loop mientras se arrastra la barra de título. Chromium bombea su message loop anidado y el render sigue en el proceso GPU/renderer, y la demo de Staal se ve funcionando en vivo en los videos. Además depende de "Mostrar el contenido de la ventana mientras se arrastra" (activado por defecto en Windows). **No lo medí en esta máquina**; antes de construir encima hay que verificarlo con el snippet de abajo en Chrome, Edge y Firefox de Windows. Riesgo conocido: algún build puede entregar `screenX` en saltos (cada 2 o 3 frames) y eso genera picos de aceleración, por eso el filtro.
- **Firefox**: actualiza en vivo en Windows y macOS. Con `privacy.resistFingerprinting` activado devuelve siempre 0,0 ([Mozilla](https://support.mozilla.org/en-US/kb/resist-fingerprinting)). En Linux Wayland el cliente no conoce su posición global, por lo que también suele quedar fijo.
- **Safari (macOS)**: reporta posición; no encontré documentación sobre su frecuencia durante el drag. Verificar.
- **Mobile y tablets**: la ventana no se mueve. Ahí el input equivalente es `DeviceMotionEvent` (acelerómetro; en iOS pide `DeviceMotionEvent.requestPermission()` tras un gesto).
- Ventana maximizada o en pantalla completa: no hay drag. El fallback tiene que existir siempre.

Snippet para medir (pegar en la consola o en una página vacía y arrastrar la ventana):

```js
let last = performance.now(), lx = screenX, n = 0, changes = 0;
(function tick(t){
  n++; if (screenX !== lx) { changes++; lx = screenX; }
  if (t - last > 1000) { console.log('frames', n, 'cambios de screenX', changes); n = changes = 0; last = t; }
  requestAnimationFrame(tick);
})(last);
```

Si "cambios" está cerca de "frames" mientras arrastrás, el input sirve directo. Si es mucho menor, hay que interpolar.

Conversión a fuerza (recomendada):

```
pos   = (screenX + innerWidth/2, screenY + innerHeight/2)   // centro de la ventana, px CSS
vel   = EMA(dpos/dt, ~0.35)        // dt real de rAF, ignorar dt > 50 ms (pestaña dormida)
acc   = EMA(dvel/dt, ~0.5)
acc   = clamp(acc, ±amax)          // amax para que un tirón no rompa la simulación
fuerza en el marco de la ventana = -acc * k   // pseudo-fuerza inercial: si la ventana acelera a la derecha, el agua se va a la izquierda
```

El signo importa: la escena vive dentro de la ventana (el "vaso"), así que la aceleración del vaso aparece como fuerza ficticia opuesta sobre el agua. También conviene tratar `resize` (cambio de `innerWidth` mientras se arrastra un borde) para no inyectar picos falsos.

---

## 3. Realismo bajo el agua

- **Ventana de Snell y reflexión total interna.** Ángulo crítico agua a aire: asin(1/1.333) ≈ 48.6°. Por dentro de ese cono se ve el cielo/mundo de arriba comprimido; por fuera, la superficie es un espejo del fondo. Implementación de referencia: `renderer.js` de Evan Wallace (pasada desde abajo, `refract(incomingRay, normal, IOR_WATER/IOR_AIR)`, mezcla `mix(reflected, refracted, (1-fresnel)*length(refractedRay))`). Función mínima en GLSL: [Snell's Window, godotshaders](https://godotshaders.com/shader/snells-window/) (CC0). Con superficie animada, el borde de la ventana se arruga y titila, que es lo que vende el efecto.
- **Aberración cromática de la refracción.** Refractar tres veces con IOR por canal (≈1.331 R, 1.333 G, 1.337 B) y muestrear el entorno por canal. Mismo truco que usa `webgpu_volume_caustics`.
- **Ver objetos arriba de la superficie, distorsionados.** Dos caminos: (a) un cubemap del mundo de arriba (`CubeCamera` a baja frecuencia, o estático) muestreado con el rayo refractado, barato y correcto para objetos lejanos; (b) para objetos cercanos, render a textura desde una cámara arriba y muestreo proyectando el rayo refractado contra un plano a altura h. Para un portfolio: (a) con cielo + 2 o 3 elementos (sol, nubes, logo) alcanza.
- **Caustics.** Técnica de Evan Wallace: vertex shader refracta la luz en cada vértice de la superficie, proyecta posición vieja y nueva al fondo; el fragment compara áreas con `dFdx/dFdy` (`oldArea/newArea`) y escribe brillo a una textura 1024² que después se muestrea en piso y objetos. [martinRenou/threejs-caustics](https://github.com/martinRenou/threejs-caustics) ([demo](https://martinrenou.github.io/threejs-caustics), BSD-3-Clause) es el port a three con environment map desde la luz, útil como guía de integración. `webgpu_caustics` de three **no** sirve para esto: usa una textura estática y refracta el rayo de vista.
- **God rays / haces de luz.** Opciones de menor a mayor costo: (1) `webgpu_postprocessing_godrays` (screen-space, radial); (2) raymarch volumétrico con la textura de caustics como "cookie" de la luz: los haces se mueven con las ondas, que es lo realista; three lo tiene armado en `webgpu_volume_caustics` (`VolumeNodeMaterial`, 20 pasos, dithering Bayer, pasada a media resolución + bloom). Esa combinación es la indicada.
- **Absorción (Beer-Lambert).** `color *= exp(-sigma * d)` con sigma por canal (aprox. R 0.45, G 0.07, B 0.03 por metro para agua clara) y un in-scattering hacia el color del agua. Aplicarlo también a lo que se ve por la ventana de Snell según la distancia recorrida bajo agua.
- **Marine snow.** Partículas instanciadas (unos miles), tamaño por profundidad, movidas por el campo de velocidad del SWE muestreado (así también "se van" con el slosh). Referencia de look: [WaterThreeJS](https://gitee.com/theyn/WaterThreeJS) (MIT, WebGL2, Gerstner + Snell + god rays + caustics + marine snow), y [Deep Abyss](https://underwater-threejs.netlify.app/) (WebGPU/TSL, junio 2026, sin repo).
- **Burbujas.** Sprites instanciados con borde brillante y reflejo total en el contorno (una burbuja vista desde el agua es un espejo en el borde); spawn cuando la aceleración supera un umbral o cuando una ola "rompe" (altura supera la cámara o gradiente alto). Subida con `v ≈ 0.2 m/s` + bamboleo.

---

## 4. WebGPU en three r17x+ y fallback a WebGL2

- `WebGPURenderer` (import desde `three/webgpu`, TSL desde `three/tsl`) usa WebGPU si está y cae solo a un backend WebGL2; `forceWebGL: true` para probar el fallback. Con R3F 9: `<Canvas gl={async (props) => { const r = new WebGPURenderer(props); await r.init(); return r; }}>`.
- No soporta `ShaderMaterial`/`RawShaderMaterial` ni `onBeforeCompile`: todo va en TSL/node materials. Los shaders de Evan Wallace hay que reescribirlos en TSL (son cortos).
- En el backend WebGL2, **compute no es completo**: no hay atomics ni indirect draw ([discourse](https://discourse.threejs.org/t/tsl-and-webgl2-vs-webgpu/87974)). Ergo MLS-MPM no tiene fallback. Un SWE escrito como pasadas de textura (render-to-texture ping-pong) sí corre en ambos.
- Soporte de WebGPU hoy ([web.dev](https://web.dev/blog/webgpu-supported-major-browsers)): Chrome/Edge desktop desde 113, Android 121+; Safari 26 (macOS, iOS, iPadOS); Firefox 141 en Windows, 145 en Mac Apple Silicon; Linux sigue irregular.

---

## 5. Recomendación: arquitectura concreta

**Motor del slosh: Shallow Water Equations 2D en GPU + modos de tanque, no MPM.**

1. **Input** (`useWindowMotion`): polling de `screenX/screenY` en rAF, velocidad y aceleración con EMA y clamp, pseudo-fuerza `-a`. Fallbacks en cascada: `DeviceMotionEvent` en mobile, drag con el puntero dentro del canvas (el mismo vector, como "agarrar el vaso"), y un "respiro" idle (oscilación chica) para que nunca quede quieto. Detectar "screenX no cambia nunca" y pasar a modo puntero sin avisar.
2. **Simulación** (256x256, o 192x192 en GPU floja), dos capas:
   - **SWE** (altura `h` + velocidad `u,v`) con esquema semi-lagrangiano o MacCormack, paredes reflectivas en el borde del viewport (el viewport *es* el vaso), fuerza de cuerpo = pseudo-fuerza de la ventana, amortiguamiento bajo para que el slosh dure 3 a 6 s. Esto da el apilamiento lateral, el rebote y los modos propios que se sienten "vaso".
   - **Ondas de detalle**: el heightfield de `webgpu_compute_water` (o 2 a 3 octavas de FFT/Gerstner chicas) sumado solo para el render, con amplitud proporcional a la velocidad del SWE (la superficie se encrespa cuando se mueve).
   - Implementación: kernels TSL con `instancedArray` (WebGPU) y, para fallback, la misma lógica como pasadas sobre render targets float (patrón de `webgl_gpgpu_water`/`GPUComputationRenderer`, o TSL sobre texturas, que corre en ambos backends). Lo más simple: escribirlo directamente como pasadas de textura en TSL y tener **un solo camino** para WebGPU y WebGL2.
3. **Render de la superficie desde abajo**: malla 256² desplazada por `h`, vista desde abajo, material TSL con: refracción agua a aire (IOR por canal), reflexión total interna fuera de la ventana de Snell, Fresnel (Evan Wallace), muestreo de un cubemap del mundo de arriba (cielo + sol + elementos del portfolio), y Beer-Lambert por distancia. Si el slosh es tan fuerte que la superficie baja hasta la cámara, conviene raymarchear el heightfield en un fullscreen pass en vez de la malla (16 a 32 pasos), así la línea de agua que cruza la pantalla queda bien.
4. **Caustics**: pasada de Evan Wallace (área proyectada con derivadas) a 512² o 1024², proyectada sobre el fondo/objetos submarinos y usada como cookie de la luz.
5. **Luz volumétrica**: `VolumeNodeMaterial` a media resolución con la textura de caustics como modulación + bloom (receta de `webgpu_volume_caustics`).
6. **Partículas**: marine snow advectado por la velocidad del SWE + burbujas en eventos de alta aceleración.
7. **Post**: bloom suave, ligera aberración cromática y viñeta azul; tonemapping ACES.

**Modo premium opcional (solo WebGPU, desktop con GPU dedicada)**: MLS-MPM basado en `webgpu_compute_particles_fluid` (ya está en TSL dentro de three) con la aceleración de la ventana sumada a la gravedad, y su superficie convertida a heightfield (máximo de partículas por columna, suavizado) para reutilizar todo el render de arriba. Da rompientes y salpicaduras reales, pero cuesta más y no tiene fallback; no lo haría primero.

**Escalones de calidad** (elegidos por FPS medido los primeros 2 s): Alto 256² + caustics 1024 + volumétrico; Medio 192² + caustics 512 + godrays screen-space; Bajo (WebGL2 o GPU integrada floja) 128² sin volumétrico; Reducido (`prefers-reduced-motion`) superficie lenta sin impulsos.

**Qué tomar de dónde**

| De | Qué | Licencia |
|---|---|---|
| [evanw/webgl-water](https://github.com/evanw/webgl-water) | Shader de superficie desde abajo (refract, TIR, Fresnel), caustics por área, sombreado de paredes con caustics | MIT |
| three `webgpu_compute_water` / `webgl_gpgpu_water` | Estructura de kernels TSL ping-pong y normales por diferencias; interacción por puntero | MIT |
| three `webgpu_volume_caustics` | Volumétrico con `VolumeNodeMaterial`, half-res + bloom, dithering | MIT |
| three `webgpu_compute_particles_fluid` | MLS-MPM en TSL para el modo premium | MIT |
| [matsuoka-601/Splash](https://github.com/matsuoka-601/Splash), [WebGPU-Ocean](https://github.com/matsuoka-601/WebGPU-Ocean) | Parámetros de MPM (Tait, substeps), shadows por densidad | MIT |
| [martinRenou/threejs-caustics](https://github.com/martinRenou/threejs-caustics) | Integración de caustics en three | BSD-3-Clause (mantener aviso) |
| [Snell's Window (godotshaders)](https://godotshaders.com/shader/snells-window/) | Función de ventana de Snell | CC0 |
| [WaterThreeJS](https://gitee.com/theyn/WaterThreeJS) | Referencia de look submarino completo (marine snow, god rays) | MIT |
| [bgstaal/multipleWindow3dScene](https://github.com/bgstaal/multipleWindow3dScene) | Patrón de polling de posición de ventana | MIT |

Lo que falta verificar antes de construir: que `screenX` se actualice cuadro a cuadro durante el drag en Chrome/Edge/Firefox de Windows (snippet de la sección 2).
