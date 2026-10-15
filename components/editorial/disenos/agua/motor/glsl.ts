import { DOMINIO } from './simulacion';
import { LADO_OLEAJE } from './oleaje';

/** Altura del banco de arena que se ve desde la superficie. */
export const FONDO_CERCA = -1.4;
/** El fondo del pozo que se abre bajo la cámara. */
export const FONDO_POZO = -44;
/** La escollera bajo el agua, de la orilla a la roca del lobo. */
export const ESCOLLERA = { ax: -7.5, az: -1.5, bx: -3.1, bz: -8.0 };
export const ROCA_LOBO = { x: -1.9, z: -9.5, radio: 1.7 };
/** El pozo bajo la cámara: elipse en planta, con el contorno irregular. */
export const POZO = { cx: 0.6, cz: 2.4, rx: 6.8, rz: 5.6 };
export const bordePozo = (a: number) => 0.05 * Math.sin(a * 5) + 0.03 * Math.sin(a * 11 + 1);

/** El banco de arena del lado de JavaScript, para apoyar lo que va sobre él. */
export function fondoEn(x: number, z: number) {
  const lejos = Math.max(0, -z - 2);
  const y = FONDO_CERCA - 0.05 * lejos - 0.0015 * lejos * lejos + 0.12 * Math.sin(x * 0.55 + z * 0.21) * Math.sin(z * 0.37 - x * 0.13);
  return Math.max(y, -12);
}

// ─────────────────────────────────────────────────────────────────────────────
// Piezas de GLSL compartidas. La altura del agua es una sola función para
// todos: la malla, las normales, las cáusticas y la línea de la lente leen lo
// mismo, así nada se despega de nada.
// ─────────────────────────────────────────────────────────────────────────────

const f = (n: number) => n.toFixed(4);

export const AGUA = /* glsl */ `
uniform sampler2D uAltura;
uniform float uH0;
uniform float uTiempo;
uniform vec3 uCam;

const vec2 DOM = vec2(${f(DOMINIO.ancho)}, ${f(DOMINIO.fondo)});
const float Z0 = ${f(DOMINIO.z0)};
const vec2 CELDAS = vec2(${f(DOMINIO.nx)}, ${f(DOMINIO.nz)});

vec2 uvDominio(vec2 xz) { return vec2(xz.x / DOM.x + 0.5, (Z0 - xz.y) / DOM.y); }

uniform sampler2D uOleaje;
// Altura y pendiente de las olas finas, de la textura que se repite.
vec3 oleaje(vec2 p) { return texture2D(uOleaje, p / ${f(LADO_OLEAJE)}).rgb; }

float alturaSim(vec2 xz) {
  vec2 uv = uvDominio(xz);
  vec2 borde = 0.5 / CELDAS;
  float h = texture2D(uAltura, clamp(uv, borde, 1.0 - borde)).r;
  vec2 fuera = max(vec2(0.0), abs(uv - 0.5) - 0.5) * DOM;
  return mix(uH0, h, exp(-length(fuera) / 3.0));
}

float alturaAgua(vec2 xz) {
  return alturaSim(xz) + oleaje(xz).r;
}

vec3 normalAgua(vec2 xz) {
  float e = 0.06;
  float hx = alturaSim(xz - vec2(e, 0.0)) - alturaSim(xz + vec2(e, 0.0));
  float hz = alturaSim(xz - vec2(0.0, e)) - alturaSim(xz + vec2(0.0, e));
  vec2 g = oleaje(xz).gb;
  return normalize(vec3(hx / (2.0 * e) - g.x, 1.0, hz / (2.0 * e) - g.y));
}

// Celdas de Worley: bloques redondeados, como piedras apiladas.
float bloques(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float d = 8.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 g = vec2(float(x), float(y));
    vec2 o = fract(sin(vec2(dot(i + g, vec2(127.1, 311.7)), dot(i + g, vec2(269.5, 183.3)))) * 43758.5453);
    d = min(d, length(g + o - f));
  }
  return d;
}

float segmento(vec2 p, vec2 a, vec2 b) {
  vec2 ab = b - a;
  float t = clamp(dot(p - a, ab) / dot(ab, ab), 0.0, 1.0);
  return length(p - a - ab * t);
}

// La piedra bajo el agua es un relieve que solo sube: un talud de bloques
// que nunca puede tener salientes.
float piedraBajo(vec2 xz) {
  float top = uH0 - 0.3;
  float d = segmento(xz, vec2(${f(ESCOLLERA.ax)}, ${f(ESCOLLERA.az)}), vec2(${f(ESCOLLERA.bx)}, ${f(ESCOLLERA.bz)}));
  float esc = top - 1.35 * max(0.0, d - 0.9);
  float dl = length(xz - vec2(${f(ROCA_LOBO.x)}, ${f(ROCA_LOBO.z)}));
  float lobo = top - 1.35 * max(0.0, dl - ${f(ROCA_LOBO.radio)});
  float h = max(esc, lobo);
  float b = bloques(xz * 1.1);
  return h + 0.55 * (0.6 - b) - 0.15;
}

// El fondo: el banco de arena que se ve desde la superficie, con médanos
// bajos, y bajo la cámara un pozo hondo que desde arriba no se ve.
float bancoMar(vec2 xz) {
  float lejos = max(0.0, -xz.y - 2.0);
  float y = ${f(FONDO_CERCA)} - 0.05 * lejos - 0.0015 * lejos * lejos;
  y += 0.12 * sin(xz.x * 0.55 + xz.y * 0.21) * sin(xz.y * 0.37 - xz.x * 0.13);
  return max(y, -12.0);
}

// El pozo: un hueco en el centro, rodeado de arena, donde el mar sigue hacia
// abajo. La escollera queda afuera, apoyada en el banco de la izquierda.
const vec2 POZO_C = vec2(${f(POZO.cx)}, ${f(POZO.cz)});
const vec2 POZO_R = vec2(${f(POZO.rx)}, ${f(POZO.rz)});
// Irregularidad del contorno: la misma en JavaScript arma la pared.
float bordePozo(float a) { return 0.05 * sin(a * 5.0) + 0.03 * sin(a * 11.0 + 1.0); }
// Radio normalizado: menos de 1 es adentro del pozo.
float radioPozo(vec2 xz) {
  vec2 q = (xz - POZO_C) / POZO_R;
  return length(q) + bordePozo(atan(q.y, q.x));
}

float fondoMar(vec2 xz) {
  float r = radioPozo(xz);
  // El labio: la arena se redondea hacia el borde, gastada por la corriente.
  float banco = bancoMar(xz) - 0.45 * smoothstep(1.35, 1.0, r);
  float y = mix(banco, ${f(FONDO_POZO)}, 1.0 - smoothstep(1.035, 1.05, r));
  return max(y, mix(piedraBajo(xz), -100.0, 1.0 - smoothstep(1.0, 1.25, r)));
}
`;

// El cielo: la banda nítida donde mira la cámara y el HDR para el resto. El
// sol sale del HDR, que es el único que guarda su energía de verdad.
export const CIELO = /* glsl */ `
uniform sampler2D uCieloHdr;
uniform sampler2D uCieloBanda;
uniform float uRotU;
uniform float uBandaK;
uniform float uExposicion;

vec3 cielo(vec3 d) {
  d = normalize(d);
  float u = atan(d.z, d.x) * 0.15915494 + 0.5 + uRotU;
  float vImg = 0.5 - asin(clamp(d.y, -1.0, 1.0)) * 0.31830989;
  vec3 hdr = texture2D(uCieloHdr, vec2(u, 1.0 - vImg)).rgb;
  float t = (vImg - 0.15552) / (0.52222 - 0.15552);
  vec3 banda = texture2D(uCieloBanda, vec2(u, 1.0 - clamp(t, 0.0, 1.0))).rgb;
  float w = smoothstep(0.0, 0.05, t) * smoothstep(1.0, 0.95, t);
  vec3 c = mix(hdr, banda * uBandaK + max(hdr - vec3(6.0), vec3(0.0)), w);
  return c * uExposicion;
}
`;

// Lo que el agua de Mar del Plata le hace a la luz: verde, turbia, y el rojo
// es lo primero que se pierde.
export const OPTICA = /* glsl */ `
uniform vec3 uSigma;
uniform vec3 uColorAgua;
uniform vec3 uSolDir;
uniform vec3 uSolAgua;
uniform vec3 uSolColor;

vec3 dispersion(vec3 dir, float profundidad) {
  float arriba = smoothstep(-0.7, 0.9, dir.y);
  vec3 base = uColorAgua * (0.22 + 0.78 * arriba);
  float halo = pow(max(dot(dir, -uSolAgua), 0.0), 6.0);
  base += uSolColor * vec3(0.55, 0.80, 0.62) * 0.0004 * halo;
  // Cerca de la superficie, la luz de siempre; más abajo se apaga más
  // despacio y se vuelve azul, para que lo hondo siga siendo mar.
  float d = max(profundidad, 0.0);
  float cerca = min(d, 4.0);
  float lejos = max(d - 4.0, 0.0);
  return base * exp(-0.16 * cerca) * exp(-0.045 * lejos) * exp(-vec3(0.04, 0.01, 0.003) * lejos);
}
`;
