// ─────────────────────────────────────────────────────────────────────────────
// La ventana del navegador es la carcasa de la cámara. No hay evento de
// "ventana movida": se lee screenX/screenY en cada cuadro y se compara. La
// posición llega a saltos (el sistema la publica cuando quiere), así que no se
// deriva dos veces el dato crudo: un seguidor de resorte críticamente
// amortiguado persigue la posición real y su aceleración es la del vaso.
//
// En el celular la ventana no se mueve: manda el acelerómetro.
// ─────────────────────────────────────────────────────────────────────────────

const OMEGA = 20;
const ACEL_MAX = 80;

export interface Tiron {
  /** Aceleración de la carcasa en m/s², +x a la derecha. */
  x: number;
  /** Aceleración de la carcasa en m/s², +y hacia arriba. */
  y: number;
  /** Velocidad de la carcasa en m/s. */
  vx: number;
  vy: number;
}

export function crearSensorVentana(metrosPorPixel: () => number) {
  let objetivoX = window.screenX;
  let objetivoY = window.screenY;
  let posX = objetivoX;
  let posY = objetivoY;
  let velX = 0;
  let velY = 0;
  let movilX = 0;
  let movilY = 0;
  let movilActivo = false;

  const alMovimiento = (e: DeviceMotionEvent) => {
    const a = e.acceleration;
    if (!a || a.x == null || a.y == null) return;
    movilActivo = true;
    const giro = (screen.orientation?.angle ?? 0) * (Math.PI / 180);
    const ax = a.x * Math.cos(giro) + a.y * Math.sin(giro);
    const ay = -a.x * Math.sin(giro) + a.y * Math.cos(giro);
    movilX += (ax - movilX) * 0.35;
    movilY += (ay - movilY) * 0.35;
  };
  window.addEventListener('devicemotion', alMovimiento);

  const tiron: Tiron = { x: 0, y: 0, vx: 0, vy: 0 };

  function muestrear(dt: number): Tiron {
    const nx = window.screenX;
    const ny = window.screenY;
    // Un salto enorme es otro monitor o una restauración de la ventana, no un tirón.
    if (Math.abs(nx - objetivoX) > 3000 || Math.abs(ny - objetivoY) > 3000) {
      posX = nx;
      posY = ny;
      velX = velY = 0;
    }
    objetivoX = nx;
    objetivoY = ny;

    const paso = Math.min(dt, 1 / 30);
    const k = OMEGA * OMEGA;
    const c = 2 * OMEGA;
    const ax = k * (objetivoX - posX) - c * velX;
    const ay = k * (objetivoY - posY) - c * velY;
    velX += ax * paso;
    velY += ay * paso;
    posX += velX * paso;
    posY += velY * paso;

    const m = metrosPorPixel();
    const limitar = (v: number) => Math.max(-ACEL_MAX, Math.min(ACEL_MAX, v));
    // La pantalla crece hacia abajo; el mundo, hacia arriba.
    tiron.x = limitar(ax * m);
    tiron.y = limitar(-ay * m);
    tiron.vx = velX * m;
    tiron.vy = -velY * m;

    if (movilActivo) {
      tiron.x += movilX * 1.5;
      tiron.y += movilY * 1.5;
    }
    return tiron;
  }

  function soltar() {
    window.removeEventListener('devicemotion', alMovimiento);
  }

  return { muestrear, soltar };
}
