import { useEffect, type RefObject } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Escala de lectura. Toda imagen térmica lleva al costado su barra de color.
// Mientras se recorre la página se mide cuánto tiempo pasa cada sección en
// pantalla; al llegar a la zona clara del contacto el riel se vuelve esa barra
// y cada tramo toma el color de su tiempo. El contacto sigue calentándose en
// vivo mientras se está ahí. El dibujo es CSS; acá solo se miden y se pasan
// valores al riel por variables y atributos.
// ─────────────────────────────────────────────────────────────────────────────

const RAMPA = [
  [0x55, 0x30, 0x09],
  [0x97, 0x4c, 0x10],
  [0xff, 0x45, 0x00],
  [0xff, 0x8d, 0x04],
  [0xff, 0x9c, 0x00],
  [0xff, 0xe1, 0x94],
  [0xff, 0xff, 0xd6],
];

const colorDe = (v: number) => {
  const t = Math.min(0.9999, Math.max(0, v)) * (RAMPA.length - 1);
  const i = Math.floor(t);
  const f = t - i;
  const c = RAMPA[i].map((a, k) => Math.round(a + (RAMPA[i + 1][k] - a) * f));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
};

const segundos = (ms: number) => (ms < 10000 ? (ms / 1000).toFixed(1) : String(Math.round(ms / 1000)));

export const useEscalaDeLectura = (ancla: RefObject<Element | null>) => {
  useEffect(() => {
    const raiz = ancla.current?.parentElement;
    const riel = document.querySelector<HTMLElement>('.ed-riel');
    if (!raiz || !riel) return;

    const items = Array.from(riel.querySelectorAll<HTMLAnchorElement>('.ed-riel__item'));
    const lista = riel.querySelector<HTMLElement>('.ed-riel__lista');
    const ids = items.map((a) => a.getAttribute('href')?.slice(1) ?? '');
    const tiempo = new Map<string, number>(ids.map((id) => [id, 0]));
    let previo = performance.now();

    const tick = () => {
      const ahora = performance.now();
      const paso = Math.min(1000, ahora - previo);
      previo = ahora;
      if (document.hidden) return;

      // La sección que se está leyendo es la que cruza el 40% de la pantalla.
      const linea = window.innerHeight * 0.4;
      let actual = ids[0];
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= linea) actual = id;
      });
      tiempo.set(actual, (tiempo.get(actual) ?? 0) + paso);

      const maximo = Math.max(1, ...tiempo.values());
      items.forEach((a, i) => {
        const ms = tiempo.get(ids[i]) ?? 0;
        const v = ms / maximo;
        a.style.setProperty('--calor', v.toFixed(3));
        a.style.setProperty('--calor-color', ms > 0 ? colorDe(0.08 + v * 0.92) : '#e8e2d8');
        a.style.setProperty('--i', String(i));
        a.dataset.lectura = `${segundos(ms)}s`;
      });
      if (lista) {
        lista.dataset.max = `MAX ${segundos(maximo)}s`;
        lista.dataset.min = 'MIN 0.0s';
      }
    };

    tick();
    const reloj = window.setInterval(tick, 200);
    return () => {
      window.clearInterval(reloj);
      items.forEach((a) => {
        a.style.removeProperty('--calor');
        a.style.removeProperty('--calor-color');
        a.style.removeProperty('--i');
        delete a.dataset.lectura;
      });
      if (lista) {
        delete lista.dataset.max;
        delete lista.dataset.min;
      }
    };
  }, [ancla]);
};
