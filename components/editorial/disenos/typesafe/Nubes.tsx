import React, { useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Las nubes del hero: una lectura térmica de cúmulos en píxel finísimo. Entran
// desde los dos costados, se sostienen un par de segundos y se deshacen, en
// loop. Es la misma familia que el campo térmico de Amber, con la rampa en
// magenta y la celda mucho más chica.
//
// Tres cosas hacen que lea como nube y no como ruido teñido:
//
// 1. Dominio deformado. Un fBm suelto da una mancha pareja. Acá el campo se
//    muestrea a sí mismo dos veces antes del valor final, y eso es lo que
//    genera los bordes enrollados y los huecos de un cúmulo.
// 2. La máscara sesga el umbral, no multiplica al campo. Multiplicar aplasta
//    todo contra el corte y la nube sale rala; sesgando, el interior queda
//    macizo y lo que se deshilacha es el borde.
// 3. Volumen. La segunda vuelta del deformado se guarda aparte y se usa como
//    luz: sube o baja el nivel térmico de ese pedazo de masa. Sin eso la nube
//    queda de un solo tono y parece una silueta recortada.
//
// Cómo se dibuja. La celda es de 3px, así que a 1440 de ancho son 144.000 por
// cuadro: con un fillRect por celda no entra en tiempo. Se escribe un
// ImageData de baja resolución, una celda por píxel, y se estira al lienzo con
// el suavizado apagado. Eso deja el píxel duro y cuesta una sola copia.
//
// El campo de ruido es caro y se calcula una vez por vuelta; por cuadro no hay
// una sola llamada al ruido, solo lecturas del campo ya armado.
// ─────────────────────────────────────────────────────────────────────────────

const CELDA = 3; // lado del píxel térmico, en píxeles de CSS
const CICLO = 11000; // una vuelta completa, en ms
const CAMPO_W = 256;
const CAMPO_H = 128;

// La rampa térmica, del aire apenas teñido al corazón de la masa.
const RAMPA = ['#ffe8fe', '#ffc6fd', '#ff9dfb', '#ff6bfd', '#ff52fc', '#f92bf0', '#e81fdf'];
const PASOS = 12;

// Trama ordenada de Bayer 4x4. Con doce niveles sueltos el degradado se corta
// en bandas lisas; la trama rompe cada borde en píxeles y es lo que hace que se
// vea la lectura térmica en vez de un aerógrafo.
const BAYER = new Float32Array(
  [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => v / 16 - 0.5),
);

const suave = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const limitar = (v: number, min: number, max: number) => (v < min ? min : v > max ? max : v);

// La rampa se interpola en OKLab: en RGB aparecen bandas turbias.
const aLineal = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const aSrgb = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

const hexAOklab = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const r = aLineal(((n >> 16) & 255) / 255);
  const g = aLineal(((n >> 8) & 255) / 255);
  const b = aLineal((n & 255) / 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
};

const oklabARgb = ([L, a, b]: number[]) => {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return [r, g, bb].map((c) => Math.round(Math.min(1, Math.max(0, aSrgb(c))) * 255));
};

/** Los niveles ya empaquetados como ABGR, que es como los espera el ImageData. */
const NIVELES = (() => {
  const labs = RAMPA.map(hexAOklab);
  const salida = new Uint32Array(PASOS);
  for (let k = 0; k < PASOS; k++) {
    const t = (k / (PASOS - 1)) * (labs.length - 1);
    const i = Math.min(labs.length - 2, Math.floor(t));
    const f = t - i;
    const lab = labs[i].map((v, j) => v + (labs[i + 1][j] - v) * f);
    const [r, g, b] = oklabARgb(lab);
    // El borde entra translúcido y el corazón llega opaco: esa es la costura
    // entre la nube y el cielo, y sin ella el contorno queda recortado.
    const a = Math.round(255 * limitar(0.3 + 1.5 * (k / (PASOS - 1)), 0, 1));
    salida[k] = (a << 24) | (b << 16) | (g << 8) | r;
  }
  return salida;
})();

/** Ruido de valor con interpolación suave. */
const hacerRuido = (semilla: number) => {
  const azar = (x: number, y: number) => {
    const n = Math.sin(x * 127.1 + y * 311.7 + semilla * 13.77) * 43758.5453;
    return n - Math.floor(n);
  };
  return (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = suave(x - xi);
    const yf = suave(y - yi);
    const a = azar(xi, yi);
    const b = azar(xi + 1, yi);
    const c = azar(xi, yi + 1);
    const d = azar(xi + 1, yi + 1);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  };
};

interface Campo {
  masa: Float32Array;
  luz: Float32Array;
}

/**
 * El campo de nubes, con el dominio deformado dos veces. `masa` es la densidad
 * y `luz` es la segunda vuelta del deformado, que se reusa como volumen.
 */
const construirCampo = (semilla: number): Campo => {
  const ruido = hacerRuido(semilla);

  const fbm = (x: number, y: number) => {
    let suma = 0;
    let amp = 0.5;
    let frec = 1;
    for (let o = 0; o < 6; o++) {
      suma += amp * ruido(x * frec, y * frec);
      frec *= 2.03;
      amp *= 0.5;
    }
    return suma / 0.984375;
  };

  const masa = new Float32Array(CAMPO_W * CAMPO_H);
  const luz = new Float32Array(CAMPO_W * CAMPO_H);

  for (let f = 0; f < CAMPO_H; f++) {
    for (let c = 0; c < CAMPO_W; c++) {
      // Pocas formas y grandes: un cúmulo ocupa media pantalla. El eje
      // vertical va comprimido porque las nubes son más anchas que altas.
      const x = (c / CAMPO_W) * 3.2;
      const y = (f / CAMPO_H) * 1.75;

      const qx = fbm(x, y);
      const qy = fbm(x + 5.2, y + 1.3);
      const rx = fbm(x + 3.6 * qx + 1.7, y + 3.6 * qy + 9.2);
      const ry = fbm(x + 3.6 * qx + 8.3, y + 3.6 * qy + 2.8);

      const i = f * CAMPO_W + c;
      masa[i] = fbm(x + 3.2 * rx, y + 3.2 * ry);
      luz[i] = rx;
    }
  }
  return { masa, luz };
};

/**
 * Muestreo bilineal del campo. Los dos ejes se limitan, no se envuelven: el
 * campo no es periódico, así que envolver en X abría una costura vertical, y
 * la deriva la iba paseando de un lado al otro. Ese era el corte con el que
 * aparecían acumulaciones macizas de golpe.
 */
const muestrear = (datos: Float32Array, x: number, y: number) => {
  const fx = limitar(x, 0, 0.999) * CAMPO_W;
  const fy = limitar(y, 0, 0.999) * CAMPO_H;
  const xi = Math.floor(fx);
  const yi = Math.floor(fy);
  const tx = fx - xi;
  const ty = fy - yi;
  const x0 = Math.min(xi, CAMPO_W - 1);
  const x1 = Math.min(x0 + 1, CAMPO_W - 1);
  const y0 = Math.min(yi, CAMPO_H - 1);
  const y1 = Math.min(y0 + 1, CAMPO_H - 1);
  const a = datos[y0 * CAMPO_W + x0];
  const b = datos[y0 * CAMPO_W + x1];
  const c = datos[y1 * CAMPO_W + x0];
  const d = datos[y1 * CAMPO_W + x1];
  return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
};

/**
 * El pulso de una vuelta: 0 con el cielo limpio, 1 con los cúmulos formados.
 * Entran, se quedan un par de segundos y se van.
 */
const pulso = (f: number) => {
  if (f < 0.22) return suave(f / 0.22);
  if (f < 0.6) return 1;
  if (f < 0.88) return 1 - suave((f - 0.6) / 0.28);
  return 0;
};

const Nubes: React.FC = () => {
  const lienzo = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = lienzo.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const buffer = document.createElement('canvas');
    const bctx = buffer.getContext('2d');
    if (!bctx) return;

    let campo = construirCampo(1);
    let vuelta = -1;
    let ancho = 0;
    let alto = 0;
    let columnas = 0;
    let filas = 0;
    let imagen: ImageData | null = null;
    let pixeles: Uint32Array | null = null;
    let pedido = 0;
    let visible = true;
    let ultimo = 0;

    const medir = () => {
      const r = cv.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ancho = Math.max(1, Math.round(r.width));
      alto = Math.max(1, Math.round(r.height));
      cv.width = Math.round(ancho * dpr);
      cv.height = Math.round(alto * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;

      columnas = Math.max(1, Math.ceil(ancho / CELDA));
      filas = Math.max(1, Math.ceil(alto / CELDA));
      buffer.width = columnas;
      buffer.height = filas;
      imagen = bctx.createImageData(columnas, filas);
      pixeles = new Uint32Array(imagen.data.buffer);
    };

    const dibujar = (t: number) => {
      if (!imagen || !pixeles) return;

      const fase = quieto ? 0.4 : (t % CICLO) / CICLO;
      const v = quieto ? 0 : Math.floor(t / CICLO);
      // Cada vuelta estrena campo: la nube que se va no es la que vuelve.
      if (v !== vuelta) {
        vuelta = v;
        campo = construirCampo(v + 1);
      }

      const cobertura = pulso(fase);
      ctx.clearRect(0, 0, ancho, alto);
      if (cobertura <= 0.002) return;

      pixeles.fill(0);

      // El campo va normalizado a 0..1 y la máscara le resta: arriba de 0,92
      // no pasa una sola celda y el cielo queda limpio; en 0,14 los cúmulos
      // están formados.
      const umbral = lerp(0.92, 0.14, cobertura);
      const deriva = quieto ? 0 : fase * 0.03;

      // La masa no solo se desplaza: se expande. El campo se muestrea cada vez
      // más de cerca a medida que la nube se forma, así los cúmulos crecen
      // desde adentro en lugar de aparecer enteros. Es lo que le da el empuje
      // de algo que revienta hacia afuera.
      const escala = lerp(1.22, 0.92, cobertura);
      // Y un vaivén lento encima, para que la masa siga viva mientras sostiene.
      const vaiven = quieto ? 0 : Math.sin((t / CICLO) * Math.PI * 2) * 0.012;
      // Dónde arranca el frente: contra el borde con el cielo limpio, casi en
      // el centro con los cúmulos formados.
      const borde = lerp(0.95, -0.12, cobertura);
      const rango = 1 - umbral;

      for (let f = 0; f < filas; f++) {
        const ny = f / filas;
        // La nube cubre el hero entero y pasa por detrás del titular, pero
        // hacia abajo se abre y se enfría: queda lectura suelta, que deja leer
        // la tinta encima.
        // Arriba la masa se sostiene entera y recién después de la mitad se
        // abre: una caída pareja desde el borde superior deja hilachas en vez
        // de cúmulos.
        const g = suave(limitar((ny - 0.4) / 0.52, 0, 1));
        const vertical = 1 - 0.86 * g;
        const techo = Math.round(lerp(PASOS - 1, 2, g));
        const fila = f * columnas;
        const bayerFila = (f & 3) * 4;

        for (let c = 0; c < columnas; c++) {
          const nx = c / columnas;

          // El frente entra desde los dos costados y avanza hacia el centro.
          const orilla = Math.abs(nx - 0.5) * 2;
          const costados = suave(limitar((orilla - borde) / 0.36, 0, 1));
          if (costados <= 0) continue;

          // El claro donde vive el cartel de novedades.
          const dx = (nx - 0.5) / 0.3;
          const dy = (ny - 0.25) / 0.34;
          const hueco = suave(limitar(Math.sqrt(dx * dx + dy * dy) - 0.42, 0, 1));

          const mascara = costados * hueco * vertical;
          if (mascara <= 0.02) continue;

          // La expansión sale del centro del cúmulo de cada costado, no del
          // borde del lienzo: si sale del borde, la nube se estira en vez de
          // crecer.
          const foco = nx < 0.5 ? 0.16 : 0.84;
          const mx = limitar(foco + (nx - foco) * escala, 0, 1) * 0.96 + deriva;
          const my = limitar(0.34 + (ny - 0.34) * escala, 0, 1) * 0.9 + vaiven;
          // El campo nace entre 0,25 y 0,75: se lleva a 0..1 antes de sesgar.
          const m = limitar((muestrear(campo.masa, mx, my) - 0.25) * 2, 0, 1);

          // El volumen: la luz sube o baja el nivel térmico de esa masa.
          const luz = muestrear(campo.luz, mx, my);
          const densidad = m + (luz - 0.5) * 0.34 - (1 - mascara) * 0.86 - umbral;
          if (densidad <= 0) continue;

          const crudo = (densidad / rango) * (PASOS - 1) * 1.4 + BAYER[bayerFila + (c & 3)];
          const nivel = Math.min(Math.floor(crudo), techo);
          if (nivel <= 0) continue;
          pixeles[fila + c] = NIVELES[nivel];
        }
      }

      bctx.putImageData(imagen, 0, 0);
      ctx.drawImage(buffer, 0, 0, columnas, filas, 0, 0, columnas * CELDA, filas * CELDA);
    };

    const cuadro = (t: number) => {
      pedido = window.requestAnimationFrame(cuadro);
      if (!visible) return;
      // A 30 cuadros alcanza: la nube se mueve lento y así queda la mitad del
      // costo, que es lo que permite la celda fina.
      if (t - ultimo < 33) return;
      ultimo = t;
      dibujar(t);
    };

    medir();
    const obs = new ResizeObserver(medir);
    obs.observe(cv);

    // Con el hero fuera de pantalla no se dibuja nada.
    const vista = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    vista.observe(cv);

    if (quieto) {
      dibujar(CICLO * 0.4);
    } else {
      pedido = window.requestAnimationFrame(cuadro);
    }

    return () => {
      if (pedido) window.cancelAnimationFrame(pedido);
      obs.disconnect();
      vista.disconnect();
    };
  }, []);

  return <canvas className="ts-nube" ref={lienzo} aria-hidden="true" />;
};

export default Nubes;
