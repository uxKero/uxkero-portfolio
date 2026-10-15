import { AGUA, CIELO, ESCOLLERA, OPTICA, ROCA_LOBO } from './glsl';

// ─────────────────────────────────────────────────────────────────────────────
// Los shaders de la escena, uno por pieza.
// ─────────────────────────────────────────────────────────────────────────────

const f = (n: number) => n.toFixed(4);

const LENTE_GLSL = /* glsl */ `
uniform float uLente;
uniform vec3 uFrente;
// Punto del domo por donde entra la luz que llega por la dirección d.
vec3 puntoDomo(vec3 d) { return uCam + d * (uLente / max(dot(d, uFrente), 0.2)); }
`;

const RECORTE_GLSL = /* glsl */ `
// Cada mitad de la toma empieza en el domo: lo que queda entre la cámara y el
// domo no existe para ese lado.
void recortarLente(vec3 p) {
  vec3 d = p - uCam;
  float alDomo = uLente / max(dot(normalize(d), uFrente), 0.2);
  if (length(d) < alDomo) discard;
}
`;

export const PARED_GLSL = /* glsl */ `
float ruidoPared(vec3 p) {
  return sin(p.x * 1.7 + sin(p.y * 1.3)) * sin(p.z * 1.9 + sin(p.x * 0.7)) * sin(p.y * 2.3 + p.z * 0.5);
}
float frentePared(float a) {
  float d = abs(mod(a + 1.5707963 + 3.1415926, 6.2831853) - 3.1415926);
  return smoothstep(1.05, 0.7, d);
}
vec3 paredEn(float a, float y) {
  vec2 dir = vec2(cos(a), sin(a));
  float r = 1.0 - bordePozo(a);
  vec2 borde = POZO_C + POZO_R * dir * r;
  float capa = y / 1.45;
  float escalon = smoothstep(0.35, 0.65, fract(capa)) + floor(capa);
  float salida = 0.22 * sin(escalon * 2.7 + a * 3.0) + 0.16 * ruidoPared(vec3(a * 4.0, y * 0.9, a * 2.0));
  salida = mix(-0.04, salida - 0.12, smoothstep(-1.8, -3.2, y));
  salida *= mix(1.0, 0.06, frentePared(a));
  // Los salientes van solo hacia adentro: el corte del terreno queda siempre
  // detrás de la roca.
  salida = min(salida, 0.0) - 0.02;
  vec2 xz = borde + dir * salida;
  return vec3(xz.x, y, xz.y);
}
`;

export const LUZ_GLSL = /* glsl */ `
uniform vec3 uLuzCaustica;
uniform vec3 uLinternaPos;
uniform vec3 uLinternaDir;
uniform float uLinterna;
float conoLinterna(vec3 p) {
  vec3 l = normalize(p - uLinternaPos);
  return smoothstep(0.88, 0.985, dot(l, uLinternaDir));
}
vec3 iluminar(vec3 p, vec3 n, vec3 alb, float c, float metal) {
  float h = alturaAgua(p.xz) - p.y;
  vec3 bajada = exp(-uSigma * h / max(-uLuzCaustica.y, 0.3));
  bajada = mix(bajada, vec3(dot(bajada, vec3(0.3333))), 0.45);
  vec3 sol = uSolColor * 0.0052 * bajada * max(dot(n, -uLuzCaustica), 0.0) * c;
  vec3 amb = dispersion(vec3(0.0, 1.0, 0.0), h) * 2.1 * (0.55 + 0.45 * max(n.y, 0.0));
  vec3 aL = uLinternaPos - p;
  float d = length(aL);
  vec3 l = aL / d;
  vec3 haz = vec3(1.0, 0.94, 0.82) * uLinterna * conoLinterna(p) / (1.0 + d * d * 0.22) * exp(-uSigma * d * 0.6);
  vec3 col = alb * (sol + amb + haz * 3.2 * max(dot(n, l), 0.0));
  // El metal devuelve el brillo de la linterna.
  float espejo = pow(max(dot(reflect(-l, n), l), 0.0), 36.0);
  col += haz * espejo * metal * 2.4;
  return col;
}
`;

// La espuma: donde el agua golpea la escollera y la roca del lobo se arma
// una franja blanca que va y viene, más ancha cuando pasa una cresta; en mar
// abierto, solo las crestas que rompen.
const ESPUMA_GLSL = /* glsl */ `
float espumaEn(vec3 p) {
  float dRoca = min(segmento(p.xz, vec2(${f(ESCOLLERA.ax)}, ${f(ESCOLLERA.az)}), vec2(${f(ESCOLLERA.bx)}, ${f(ESCOLLERA.bz)})) - 1.0,
                    length(p.xz - vec2(${f(ROCA_LOBO.x)}, ${f(ROCA_LOBO.z)})) - 2.2);
  vec2 q = p.xz * 2.2 + vec2(uTiempo * 0.15, -uTiempo * 0.1);
  float trama = sin(q.x + sin(q.y * 1.7)) * sin(q.y * 1.3 + sin(q.x * 0.9)) * 0.5 + 0.5;
  float trama2 = sin(q.x * 3.1 - uTiempo * 0.6) * sin(q.y * 2.7 + uTiempo * 0.4) * 0.5 + 0.5;
  float fina = sin(p.x * 9.0 + sin(p.z * 7.0 + uTiempo)) * sin(p.z * 8.0 - uTiempo * 0.7) * 0.5 + 0.5;
  float golpe = clamp((p.y - uH0) * 4.0 + 0.7, 0.0, 1.2);
  float ancho = 1.1 + golpe * 1.4;
  float franja = smoothstep(ancho, 0.0, dRoca);
  float contacto = franja * smoothstep(0.25, 0.7, trama * 0.6 + trama2 * 0.4 + fina * 0.3) * (0.6 + golpe);
  float rompe = smoothstep(0.1, 0.28, p.y - uH0) * smoothstep(0.45, 0.7, trama2);
  return clamp(max(contacto, rompe * 0.7), 0.0, 1.0);
}
`;

export const VERT_SUPERFICIE = /* glsl */ `
${AGUA}
varying vec3 vPos;
void main() {
  vec3 p = position;
  p.y = alturaAgua(p.xz);
  vPos = p;
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}
`;

export const FRAG_SUPERFICIE_ARRIBA = /* glsl */ `
${AGUA}
${CIELO}
${OPTICA}
${LENTE_GLSL}
${RECORTE_GLSL}
${ESPUMA_GLSL}
uniform samplerCube uArriba;
varying vec3 vPos;
void main() {
  recortarLente(vPos);
  vec3 n = normalAgua(vPos.xz);
  vec3 v = normalize(vPos - uCam);
  if (dot(v, n) > 0.0) n = -n;
  float cosi = clamp(dot(-v, n), 0.0, 1.0);
  float F = 0.02 + 0.98 * pow(1.0 - cosi, 5.0);
  vec3 r = reflect(v, n);
  r.y = max(r.y, 0.004);
  vec3 refl = textureCube(uArriba, r).rgb;

  // Lo que sube desde adentro: verde oscuro, y la cresta a trasluz se enciende.
  vec3 dentro = uColorAgua * 0.42;
  vec2 haciaSol = normalize(uSolDir.xz);
  float trasluz = pow(max(dot(normalize(v.xz), haciaSol), 0.0), 4.0);
  float cresta = clamp((vPos.y - uH0) * 3.0 + 0.3, 0.0, 1.5);
  dentro += uSolColor * vec3(0.30, 0.85, 0.55) * 0.010 * trasluz * cresta;

  vec3 col = mix(dentro, refl, F);
  float brillo = pow(max(dot(r, uSolDir), 0.0), 1400.0);
  col += uSolColor * brillo * 2.5;

  float pend = 1.0 - n.y;
  float espuma = max(smoothstep(0.22, 0.42, pend), espumaEn(vPos));
  col = mix(col, vec3(0.92, 0.9, 0.86) * uExposicion * 1.15, espuma * 0.9);
  gl_FragColor = vec4(col, 1.0);
}
`;

export const FRAG_SUPERFICIE_ABAJO = /* glsl */ `
${AGUA}
${CIELO}
${OPTICA}
${LENTE_GLSL}
${RECORTE_GLSL}
${ESPUMA_GLSL}
uniform samplerCube uArriba;
varying vec3 vPos;

vec3 aire(vec3 t) {
  float hay = step(1e-5, dot(t, t));
  return textureCube(uArriba, t + (1.0 - hay) * vec3(0.0, 1.0, 0.0)).rgb * hay;
}

void main() {
  recortarLente(vPos);
  vec3 n = normalAgua(vPos.xz);
  vec3 v = normalize(vPos - uCam);
  vec3 N = dot(v, n) > 0.0 ? -n : n;
  vec3 r = reflect(v, N);
  // Lo que se refleja abajo de la superficie es más agua, más honda.
  // El espejo de abajo se ve plateado: devuelve el agua iluminada de enfrente.
  vec3 espejo = dispersion(vec3(r.x, abs(r.y) * 0.35, r.z), uH0 - vPos.y + 0.6) * 1.25;

  vec3 tR = refract(v, N, 1.331);
  vec3 tG = refract(v, N, 1.334);
  vec3 tB = refract(v, N, 1.340);
  vec3 afuera = vec3(aire(tR).r, aire(tG).g, aire(tB).b);

  float sale = step(1e-5, dot(tG, tG));
  float cost = abs(tG.y);
  float F = mix(1.0, 0.02 + 0.98 * pow(1.0 - cost, 5.0), sale);
  vec3 col = afuera * (1.0 - F) + espejo * F;
  // Más allá del ángulo crítico el mar real es espejo. Acá se lo deja un poco
  // translúcido: se adivina el cielo y la silueta de lo que está afuera,
  // deformados por las olas.
  vec3 afueraRasante = textureCube(uArriba, normalize(vec3(v.x, 0.12 + abs(v.y) * 0.6, v.z) + (n - vec3(0.0, 1.0, 0.0)) * 0.9)).rgb;
  col = mix(col, afueraRasante * 0.55 + espejo * 0.3, (1.0 - sale) * 0.42);
  // Desde abajo la espuma se ve como manchas claras en el techo del agua,
  // donde el mar golpea la piedra.
  float espuma = espumaEn(vPos);
  col = mix(col, vec3(0.62, 0.78, 0.72) * (0.8 + 0.4 * afuera.g), espuma * 0.75);
  gl_FragColor = vec4(col, 1.0);
}
`;

export const VERT_SIMPLE = /* glsl */ `
varying vec3 vPos;
void main() {
  vec4 p = modelMatrix * vec4(position, 1.0);
  vPos = p.xyz;
  gl_Position = projectionMatrix * viewMatrix * p;
}
`;

export const FRAG_CIELO = /* glsl */ `
${CIELO}
varying vec3 vPos;
uniform vec3 uCentro;
void main() {
  gl_FragColor = vec4(cielo(vPos - uCentro), 1.0);
}
`;

export const VERT_ARENA = /* glsl */ `
${AGUA}
varying vec3 vPos;
void main() {
  vec4 p = modelMatrix * vec4(position, 1.0);
  p.y = fondoMar(p.xz);
  vPos = p.xyz;
  gl_Position = projectionMatrix * viewMatrix * p;
}
`;

export const CAUSTICA_MUESTRA = /* glsl */ `
uniform sampler2D uCaustica;
uniform sampler2D uMosaico;
uniform float uLadoMosaico;
uniform vec4 uCajaCaustica;
// La red fina de luz la arman las ondas chicas; las olas grandes de la
// simulación solo deciden dónde se junta más y dónde menos.
float causticaFina(vec2 xz, float nivel) {
  // Cuatro lecturas en rombo: de cerca el borde de cada hilo de luz no se
  // escalona.
  vec2 uv = xz / uLadoMosaico;
  vec2 d = vec2(1.7 / 512.0, 0.0);
  return 0.25 * (texture2D(uMosaico, uv + d.xy, nivel).r + texture2D(uMosaico, uv - d.xy, nivel).r
               + texture2D(uMosaico, uv + d.yx, nivel).r + texture2D(uMosaico, uv - d.yx, nivel).r);
}
float causticaEn(vec2 xz) {
  vec2 cuv = vec2((xz.x - uCajaCaustica.x) / (uCajaCaustica.y - uCajaCaustica.x),
                  (xz.y - uCajaCaustica.z) / (uCajaCaustica.w - uCajaCaustica.z));
  float c = texture2D(uCaustica, cuv).r;
  vec2 fuera = max(vec2(0.0), abs(cuv - 0.5) - 0.5);
  return mix(1.0, c, exp(-length(fuera) * 30.0));
}
// Lejos del fondo la luz enfocada todavía no se juntó: se lee más difusa.
float causticaDifusa(vec2 xz, float nivel) {
  vec2 cuv = vec2((xz.x - uCajaCaustica.x) / (uCajaCaustica.y - uCajaCaustica.x),
                  (xz.y - uCajaCaustica.z) / (uCajaCaustica.w - uCajaCaustica.z));
  float c = texture2D(uCaustica, cuv, nivel).r;
  vec2 fuera = max(vec2(0.0), abs(cuv - 0.5) - 0.5);
  return mix(1.0, c, exp(-length(fuera) * 30.0));
}
`;

export const FRAG_ARENA = /* glsl */ `
${AGUA}
${OPTICA}
${CAUSTICA_MUESTRA}
${LUZ_GLSL}
uniform sampler2D uArena;
uniform sampler2D uArenaNor;
uniform sampler2D uRoca;
uniform sampler2D uRocaNor;
varying vec3 vPos;

vec3 triplanar(sampler2D t, vec3 p, vec3 n, float escala) {
  vec3 w = pow(abs(n), vec3(4.0));
  w /= w.x + w.y + w.z;
  return texture2D(t, p.zy * escala).rgb * w.x + texture2D(t, p.xz * escala).rgb * w.y + texture2D(t, p.xy * escala).rgb * w.z;
}

void main() {
  vec2 xz = vPos.xz;
  vec3 nGeo = normalize(cross(dFdx(vPos), dFdy(vPos)));
  if (nGeo.y < 0.0) nGeo = -nGeo;

  // Arena donde es plano; piedra en el talud, en la pared del pozo y donde
  // el relieve de piedra sale por encima del banco.
  float esPiedra = max(smoothstep(0.82, 0.55, nGeo.y), smoothstep(0.05, 0.3, piedraBajo(xz) - bancoMar(xz)));
  vec2 tuv = xz * 0.42;
  vec3 arena = texture2D(uArena, tuv).rgb;
  vec3 nmA = texture2D(uArenaNor, tuv).rgb * 2.0 - 1.0;
  vec3 roca = triplanar(uRoca, vPos, nGeo, 0.45) * 0.8;
  vec3 nmR = triplanar(uRocaNor, vPos, nGeo, 0.45) * 2.0 - 1.0;
  vec3 alb = mix(arena, roca, esPiedra);
  vec3 n = normalize(nGeo + mix(vec3(nmA.x, 0.0, nmA.y) * 0.7, nmR * 0.5, esPiedra));

  float grande = causticaDifusa(xz, 1.0);
  float c = mix(0.35, 1.0, causticaFina(xz, 1.2)) * mix(1.0, grande, 0.7);
  gl_FragColor = vec4(iluminar(vPos, n, alb, c, 0.0), 1.0);
}
`;

export const VERT_CAUSTICA = /* glsl */ `
${AGUA}
uniform vec3 uLuzCaustica;
uniform vec3 uLuzAire;
uniform vec4 uCajaCaustica;
varying vec3 vViejo;
varying vec3 vNuevo;
// El mapa de luz se arma contra el banco de arena: el pozo no lo cambia.
vec3 alFondo(vec3 P, vec3 L) {
  float t = (P.y - bancoMar(P.xz)) / -L.y;
  vec3 q = P + L * t;
  t = (P.y - bancoMar(q.xz)) / -L.y;
  return P + L * t;
}
void main() {
  vec2 xz = vec2((position.x - 0.5) * DOM.x, Z0 - position.y * DOM.y);
  vec3 n = normalAgua(xz);
  vec3 L = refract(uLuzAire, n, 1.0 / 1.333);
  vec3 P = vec3(xz.x, alturaAgua(xz), xz.y);
  vec3 P0 = vec3(xz.x, uH0, xz.y);
  vNuevo = alFondo(P, L);
  vViejo = alFondo(P0, uLuzCaustica);
  vec2 cuv = vec2((vNuevo.x - uCajaCaustica.x) / (uCajaCaustica.y - uCajaCaustica.x),
                  (vNuevo.z - uCajaCaustica.z) / (uCajaCaustica.w - uCajaCaustica.z));
  gl_Position = vec4(cuv * 2.0 - 1.0, 0.0, 1.0);
}
`;

export const FRAG_CAUSTICA = /* glsl */ `
varying vec3 vViejo;
varying vec3 vNuevo;
void main() {
  float viejo = length(dFdx(vViejo)) * length(dFdy(vViejo));
  float nuevo = length(dFdx(vNuevo)) * length(dFdy(vNuevo));
  gl_FragColor = vec4(vec3(min(viejo / max(nuevo, 1e-9), 14.0)), 1.0);
}
`;

export const VERT_PANTALLA = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// Partículas en suspensión y burbujas. Viven solo bajo el agua: se apagan si
// el domo por donde se las vería está en el aire, o si quedan detrás de algo.
export const VERT_PARTICULA = /* glsl */ `
${AGUA}
${LENTE_GLSL}
attribute float aTam;
attribute float aTipo;
uniform float uEscala;
uniform vec3 uCaja;
uniform vec3 uOrigen;
varying float vDist;
varying float vTipo;
varying float vVisible;
void main() {
  vec3 p = position;
  if (aTipo < 0.5) {
    // Nieve marina: deriva con la corriente, se envuelve alrededor de la
    // cámara y la mece el agua que pasa.
    p += vec3(0.035, -0.006, 0.02) * uTiempo + 0.05 * sin(uTiempo * 0.7 + position.zxy * 3.0);
    p = uOrigen + mod(p - uOrigen + uCaja * 0.5, uCaja) - uCaja * 0.5;
    vec4 s = texture2D(uAltura, clamp(uvDominio(p.xz), 0.0, 1.0));
    p.xz += s.gb * 0.35;
  }
  vec3 d = normalize(p - uCam);
  vec3 domo = puntoDomo(d);
  float bajo = step(domo.y, alturaAgua(domo.xz));
  float debajo = step(p.y, alturaAgua(p.xz));
  vVisible = bajo * debajo;
  vec4 mv = viewMatrix * vec4(p, 1.0);
  vDist = -mv.z;
  vTipo = aTipo;
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aTam * uEscala / max(-mv.z, 0.05);
}
`;

export const FRAG_PARTICULA = /* glsl */ `
${OPTICA}
uniform sampler2D uProfAbajo;
uniform vec2 uResolucion;
uniform float uCerca;
uniform float uLejos;
uniform float uProfCam;
varying float vDist;
varying float vTipo;
varying float vVisible;
void main() {
  if (vVisible < 0.5) discard;
  float z = texture2D(uProfAbajo, gl_FragCoord.xy / uResolucion).r;
  float vz = (uCerca * uLejos) / ((uLejos - uCerca) * z - uLejos);
  if (vDist > -vz + 0.05) discard;

  vec2 q = gl_PointCoord * 2.0 - 1.0;
  float r = length(q);
  if (r > 1.0) discard;
  vec3 T = exp(-uSigma * vDist);
  vec3 luz = dispersion(vec3(0.0, 1.0, 0.0), uProfCam) * 2.2;
  vec3 col;
  float a;
  if (vTipo < 0.5) {
    a = (1.0 - smoothstep(0.2, 1.0, r)) * 0.55;
    col = luz * 1.4;
  } else {
    // Burbuja: borde que refleja y un punto de luz arriba a la izquierda.
    float borde = smoothstep(0.62, 0.92, r) * (1.0 - smoothstep(0.92, 1.0, r));
    float punto = 1.0 - smoothstep(0.0, 0.28, length(q - vec2(-0.35, 0.38)));
    a = clamp(borde * 0.9 + punto + 0.06, 0.0, 1.0);
    col = mix(luz * 2.5, uSolColor * 0.006, punto);
  }
  gl_FragColor = vec4(col * T * a, 0.0);
}
`;

export const FRAG_COMPOSICION = /* glsl */ `
${AGUA}
${OPTICA}
${CAUSTICA_MUESTRA}
uniform sampler2D uImgArriba;
uniform sampler2D uImgAbajo;
uniform sampler2D uImgParticulas;
uniform sampler2D uImgRayos;
uniform sampler2D uProfAbajo;
uniform mat4 uInvProy;
uniform mat4 uCamMundo;
uniform float uCerca;
uniform float uLejos;
uniform float uLente;
uniform vec3 uLuzCaustica;
uniform float uRayos;
uniform float uFoco;
uniform sampler2D uTitulo;
uniform float uTituloOn;
uniform float uTituloSube;
varying vec2 vUv;

vec3 aces(vec3 x) {
  x *= 0.6;
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

float azar(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  vec4 ndc = vec4(vUv * 2.0 - 1.0, 1.0, 1.0);
  vec4 vista = uInvProy * ndc;
  vec3 dirVista = normalize(vista.xyz / vista.w);
  vec3 dir = normalize((uCamMundo * vec4(dirVista, 0.0)).xyz);
  vec3 frente = normalize((uCamMundo * vec4(0.0, 0.0, -1.0, 0.0)).xyz);

  // De qué lado del agua cae este punto del domo.
  vec3 P = uCam + dir * (uLente / max(dot(dir, frente), 0.2));
  float s = P.y - alturaAgua(P.xz);

  float z = texture2D(uProfAbajo, vUv).r;
  float vz = (uCerca * uLejos) / ((uLejos - uCerca) * z - uLejos);
  float dist = -vz / max(-dirVista.z, 1e-3);
  vec3 abajo = texture2D(uImgAbajo, vUv).rgb;
  vec3 T = exp(-uSigma * dist);
  float prof = max(uH0 - uCam.y, 0.0);
  abajo = abajo * T + dispersion(dir, prof) * (1.0 - T);

  // Los rayos vienen a media resolución con ruido repartido: se funden acá.
  vec2 px = 1.0 / vec2(textureSize(uImgRayos, 0));
  vec3 rayos = texture2D(uImgRayos, vUv).rgb * 0.28;
  rayos += texture2D(uImgRayos, vUv + px * vec2(1.3, 0.4)).rgb * 0.18;
  rayos += texture2D(uImgRayos, vUv + px * vec2(-1.3, -0.4)).rgb * 0.18;
  rayos += texture2D(uImgRayos, vUv + px * vec2(-0.4, 1.3)).rgb * 0.18;
  rayos += texture2D(uImgRayos, vUv + px * vec2(0.4, -1.3)).rgb * 0.18;
  abajo += rayos * uRayos;
  abajo += texture2D(uImgParticulas, vUv).rgb;
  // Con una placa en la mano, lo de atrás se apaga.
  abajo *= 1.0 - uFoco * 0.7 * smoothstep(1.5, 2.4, dist);

  vec3 arriba = texture2D(uImgArriba, vUv).rgb;
  float bajoAgua = 1.0 - smoothstep(-fwidth(s), fwidth(s), s);
  vec3 col = mix(arriba, abajo, bajoAgua);

  // El menisco: donde el agua toca el domo, una franja que tuerce la luz.
  float franja = 1.0 - smoothstep(0.0, 3.5 * fwidth(s), abs(s));
  col = mix(col, col * 0.35 + uColorAgua * 0.25, franja * 0.85);

  col = aces(col);
  col = pow(col, vec3(1.0 / 2.2));

  // El título vive en la línea del agua: la mitad de arriba en el aire,
  // nítida; la de abajo vista a través del agua, refractada por las olas
  // reales y teñida de verde. El agua lo corta por donde pasa.
  if (uTituloOn > 0.0) {
    vec2 desvio = vec2(0.0);
    if (bajoAgua > 0.5) {
      vec3 nw = normalAgua(P.xz);
      desvio = nw.xz * vec2(0.03, -0.045) + vec2(sin(vUv.y * 90.0 + uTiempo * 2.3) * 0.0015, 0.004);
    }
    vec2 tuv = vUv - vec2(0.0, uTituloSube);
    float tR = texture2D(uTitulo, tuv + desvio * 1.06).r;
    vec4 tt = texture2D(uTitulo, tuv + desvio);
    float tB = texture2D(uTitulo, tuv + desvio * 0.94).r;
    vec3 letra = mix(vec3(tR, tt.r, tB), vec3(tt.r), 1.0 - bajoAgua);
    col = mix(col, col * 0.55, tt.g * 0.55 * uTituloOn * (1.0 - bajoAgua));
    vec3 tinta = mix(vec3(0.97, 0.96, 0.93), vec3(0.6, 0.86, 0.78), bajoAgua);
    col = mix(col, tinta, letra * mix(1.0, 0.82, bajoAgua) * uTituloOn);
  }
  // Grano fino, para que los degradés del agua no se escalonen.
  col += (azar(gl_FragCoord.xy * 1.37 + fract(uTiempo)) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`;

// Rayos de luz, a media resolución: se marcha el rayo de vista y en cada punto
// se pregunta cuánta luz enfocada le llega, siguiendo la luz del sol hasta el
// fondo. Lejos del fondo la luz todavía no se juntó y se lee difusa.
export const FRAG_RAYOS = /* glsl */ `
${AGUA}
${OPTICA}
${CAUSTICA_MUESTRA}
${LUZ_GLSL}
uniform sampler2D uProfAbajo;
uniform mat4 uInvProy;
uniform mat4 uCamMundo;
uniform float uCerca;
uniform float uLejos;
uniform float uLente;
uniform sampler2D uPrevio;
uniform float uCuadro;
uniform float uMezcla;
varying vec2 vUv;
void main() {
  vec4 vista = uInvProy * vec4(vUv * 2.0 - 1.0, 1.0, 1.0);
  vec3 dirVista = normalize(vista.xyz / vista.w);
  vec3 dir = normalize((uCamMundo * vec4(dirVista, 0.0)).xyz);
  float z = texture2D(uProfAbajo, vUv).r;
  float vz = (uCerca * uLejos) / ((uLejos - uCerca) * z - uLejos);
  float dist = -vz / max(-dirVista.z, 1e-3);

  float largo = clamp(dist - uLente, 0.0, 12.0);
  const int N = 14;
  float paso = largo / float(N);
  float ign = fract(52.9829189 * fract(dot(gl_FragCoord.xy + 5.588238 * mod(uCuadro, 64.0), vec2(0.06711056, 0.00583715))));
  vec3 suma = vec3(0.0);
  float haz = 0.0;
  for (int i = 0; i < N; i++) {
    float t = paso * (float(i) + ign);
    vec3 q = uCam + dir * (uLente + t);
    float hq = alturaSim(q.xz);
    float hondo = hq - q.y;
    if (hondo < 0.0) continue;
    // El haz de la linterna también se ve en el agua: la luz que rebota en
    // lo que flota.
    float dl = length(q - uLinternaPos);
    haz += conoLinterna(q) * exp(-uSigma.g * (t + uLente + dl)) / (1.0 + dl * dl * 0.25) * paso;
    float aFondo = max(q.y - bancoMar(q.xz), 0.0) / -uLuzCaustica.y;
    vec3 f = q + uLuzCaustica * aFondo;
    // Los rayos son anchos: la luz que va a formar la red todavía no se juntó.
    float c = causticaDifusa(f.xz, 1.5);
    float foco = pow(max(c, 0.0), 2.6) * smoothstep(0.0, 0.8, hondo);
    suma += exp(-uSigma * (t + uLente + hondo)) * foco * paso;
  }
  float fase = 0.25 + 2.0 * pow(max(dot(dir, -uLuzCaustica), 0.0), 4.0);
  float profCam = max(uH0 - uCam.y, 0.0);
  vec3 col = suma * uSolColor * vec3(0.34, 0.70, 0.58) * 0.00011 * fase * exp(-0.035 * profCam);
  // Cada cuadro marcha con otro desfasaje y se funde con los anteriores: el
  // ruido se promedia y queda luz lisa.
  col += vec3(0.55, 0.62, 0.55) * haz * uLinterna * 0.09;
  vec3 previo = texture2D(uPrevio, vUv).rgb;
  gl_FragColor = vec4(mix(previo, col, uMezcla), 1.0);
}
`;

// La pared del pozo: un tubo que baja del labio hasta el fondo. El radio
// sigue el contorno del pozo y se rompe en estratos horizontales, como las
// restingas de cuarcita de la costa: salientes suaves, nunca colgantes. El
// frente, donde está escrito el portfolio, es una cara cortada y lisa.

// La luz de todo lo que está bajo el agua: el sol que baja enfocado por las
// olas, la que se dispersa en el agua y la linterna del buzo, que es el mouse.

const TRIPLANAR = /* glsl */ `
vec3 triplanar(sampler2D t, vec3 p, vec3 n, float escala) {
  vec3 w = pow(abs(n), vec3(4.0));
  w /= w.x + w.y + w.z;
  return texture2D(t, p.zy * escala).rgb * w.x + texture2D(t, p.xz * escala).rgb * w.y + texture2D(t, p.xy * escala).rgb * w.z;
}
`;

// La roca del pozo bajo el agua: dos escalas de textura para que no se lea
// repetida, manchas de incrustaciones, algas en lo que mira hacia arriba,
// puntos de cirripedios y la sombra de cada estrato en su grieta.
const ROCA_GLSL = /* glsl */ `
float hashR(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float ruidoR(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hashR(i), hashR(i + vec3(1, 0, 0)), f.x), mix(hashR(i + vec3(0, 1, 0)), hashR(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(hashR(i + vec3(0, 0, 1)), hashR(i + vec3(1, 0, 1)), f.x), mix(hashR(i + vec3(0, 1, 1)), hashR(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
vec3 rocaMarina(vec3 p, inout vec3 n, sampler2D roca, sampler2D rocaNor) {
  vec3 alb = triplanar(roca, p, n, 0.32) * 0.6 + triplanar(roca, p, n, 1.15) * 0.45;
  vec3 nm = (triplanar(rocaNor, p, n, 0.32) * 2.0 - 1.0) * 0.5 + (triplanar(rocaNor, p, n, 1.15) * 2.0 - 1.0) * 0.45;
  float m = ruidoR(p * 0.9) * 0.6 + ruidoR(p * 3.1) * 0.4;
  alb *= 0.7 + 0.6 * m;
  // Algas y limo en lo que mira hacia arriba.
  float arriba = smoothstep(0.2, 0.7, n.y) * smoothstep(0.35, 0.65, ruidoR(p * 1.7));
  alb = mix(alb, vec3(0.16, 0.2, 0.08) * (0.7 + 0.6 * m), arriba * 0.8);
  // Cirripedios: puntitos claros y redondos, escasos.
  vec3 celda = p * 26.0;
  float hay = step(0.992, hashR(floor(celda)));
  float punto = hay * (1.0 - smoothstep(0.12, 0.22, length(fract(celda) - 0.5)));
  alb = mix(alb, vec3(0.58, 0.56, 0.5), punto * (1.0 - arriba) * 0.6);
  // La grieta de cada estrato: más oscura.
  float g = abs(fract(p.y / 1.45 + 0.5) - 0.5);
  alb *= mix(0.45, 1.0, smoothstep(0.0, 0.08, g));
  n = normalize(n + nm * 0.75);
  return alb;
}
`;

export const VERT_POZO = /* glsl */ `
${AGUA}
${PARED_GLSL}
attribute vec2 aParam;
varying vec3 vPos;
void main() {
  vec3 p = paredEn(aParam.x, aParam.y);
  vPos = p;
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}
`;

export const FRAG_POZO = /* glsl */ `
${AGUA}
${OPTICA}
${CAUSTICA_MUESTRA}
${LUZ_GLSL}
${TRIPLANAR}
${ROCA_GLSL}
uniform sampler2D uRoca;
uniform sampler2D uRocaNor;
varying vec3 vPos;
void main() {
  vec3 n = normalize(cross(dFdx(vPos), dFdy(vPos)));
  vec3 haciaCentro = vec3(POZO_C.x - vPos.x, 0.0, POZO_C.y - vPos.z);
  if (dot(n, haciaCentro) < 0.0) n = -n;
  vec3 alb = rocaMarina(vPos, n, uRoca, uRocaNor);
  float h = alturaAgua(vPos.xz) - vPos.y;
  float c = mix(1.0, causticaFina(vPos.xz + vPos.y * 0.3, 1.5), exp(-h * 0.12));
  gl_FragColor = vec4(iluminar(vPos, n, alb, c, 0.0) + dispersion(vec3(0.0, 1.0, 0.0), h) * alb * 0.7, 1.0);
}
`;

// Lo tallado en la roca: un parche que copia la pared y la hunde donde hay
// letras. El canal rojo es la letra; el verde, la misma letra difusa, de donde
// sale el bisel.
export const VERT_TALLA = /* glsl */ `
${AGUA}
${PARED_GLSL}
uniform vec4 uRango;
varying vec3 vPos;
varying vec2 vUv;
void main() {
  // El mismo ángulo con que se arma la pared, entre 0 y 2 pi: si no, el
  // relieve de la roca no coincide y la tapa.
  float a = mod(mix(uRango.x, uRango.y, uv.x), 6.2831853);
  float y = mix(uRango.w, uRango.z, uv.y);
  vec3 p = paredEn(a, y);
  vec3 adentro = normalize(vec3(POZO_C.x - p.x, 0.0, POZO_C.y - p.z));
  p += adentro * 0.004;
  vPos = p;
  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}
`;

export const FRAG_TALLA = /* glsl */ `
${AGUA}
${OPTICA}
${CAUSTICA_MUESTRA}
${LUZ_GLSL}
${TRIPLANAR}
${ROCA_GLSL}
uniform sampler2D uRoca;
uniform sampler2D uRocaNor;
uniform sampler2D uTexto;
varying vec3 vPos;
varying vec2 vUv;
void main() {
  vec4 t = texture2D(uTexto, vUv);
  if (t.g < 0.02) discard;
  vec3 n = normalize(cross(dFdx(vPos), dFdy(vPos)));
  vec3 haciaCentro = vec3(POZO_C.x - vPos.x, 0.0, POZO_C.y - vPos.z);
  if (dot(n, haciaCentro) < 0.0) n = -n;
  // El bisel: la pendiente de la letra difusa inclina la normal hacia adentro.
  vec2 g = vec2(dFdx(t.g), dFdy(t.g)) * 40.0;
  vec3 tx = normalize(dFdx(vPos));
  vec3 ty = normalize(dFdy(vPos));
  n = normalize(n - (tx * g.x + ty * g.y) * 0.9);
  vec3 alb = rocaMarina(vPos, n, uRoca, uRocaNor);
  // Adentro de la letra la roca está más limpia y en sombra.
  alb = mix(alb, alb * vec3(0.55, 0.6, 0.6), t.r);
  float h = alturaAgua(vPos.xz) - vPos.y;
  float c = mix(1.0, causticaFina(vPos.xz + vPos.y * 0.3, 1.5), exp(-h * 0.12));
  vec3 col = iluminar(vPos, n, alb, c, 0.0) + dispersion(vec3(0.0, 1.0, 0.0), h) * alb * 0.7;
  gl_FragColor = vec4(col, 1.0);
}
`;

// Las placas de bronce: campo con pátina verde y letras en relieve, que se
// pulen con el roce del agua y brillan con la linterna.
export const VERT_PLACA = /* glsl */ `
varying vec3 vPos;
varying vec3 vNormal2;
varying vec2 vUv;
varying float vFrente;
varying float vDorso;
void main() {
  vec4 p = modelMatrix * vec4(position, 1.0);
  vPos = p.xyz;
  vNormal2 = normalize(mat3(modelMatrix) * normal);
  vUv = uv;
  vFrente = step(0.5, normal.z);
  vDorso = step(0.5, -normal.z);
  gl_Position = projectionMatrix * viewMatrix * p;
}
`;

export const FRAG_PLACA = /* glsl */ `
${AGUA}
${OPTICA}
${CAUSTICA_MUESTRA}
${LUZ_GLSL}
uniform sampler2D uTexto;
uniform sampler2D uDorso;
uniform float uTieneDorso;
uniform float uEncendida;
uniform float uInspeccion;
varying vec3 vPos;
varying vec3 vNormal2;
varying vec2 vUv;
varying float vFrente;
varying float vDorso;

float ruido2(vec2 p) { return fract(sin(dot(floor(p), vec2(12.9898, 78.233))) * 43758.5453); }
float manchas(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(ruido2(i), ruido2(i + vec2(1, 0)), f.x), mix(ruido2(i + vec2(0, 1)), ruido2(i + vec2(1, 1)), f.x), f.y);
}

void main() {
  vec3 n = normalize(vNormal2);
  vec3 bronce = vec3(0.78, 0.55, 0.3);
  // Bronce oscuro con verdín: el verde aparece en manchas, no parejo.
  vec2 q = vUv * vec2(6.0, 4.0);
  float m = manchas(q * 1.3) * 0.55 + manchas(q * 4.1) * 0.3 + manchas(q * 11.0) * 0.15;
  float verdin = smoothstep(0.25, 0.95, m) * 0.55;
  vec3 campo = mix(vec3(0.1, 0.11, 0.085), vec3(0.17, 0.27, 0.23), verdin);
  vec3 alb = bronce;
  float metal = 0.8;
  bool dorso = vDorso > 0.5 && uTieneDorso > 0.5;
  if (vDorso > 0.5 && uTieneDorso < 0.5) alb = campo;
  if (vFrente > 0.5 || dorso) {
    vec4 t = dorso ? texture2D(uDorso, vUv) : texture2D(uTexto, vUv);
    vec2 g = vec2(dFdx(t.g), dFdy(t.g)) * 14.0;
    vec3 tx = normalize(dFdx(vPos));
    vec3 ty = normalize(dFdy(vPos));
    n = normalize(n + (tx * g.x + ty * g.y) * 0.5);
    float letra = smoothstep(0.35, 0.65, t.r);
    // Metal fundido: poros finos en el campo y desgaste que deja ver el bronce
    // en el filo de las letras y del marco.
    float poro = manchas(vUv * vec2(260.0, 170.0));
    vec2 gp = vec2(dFdx(poro), dFdy(poro));
    n = normalize(n - (tx * gp.x + ty * gp.y) * 0.35 * (1.0 - letra));
    float filo = smoothstep(0.05, 0.25, t.g) * (1.0 - letra);
    alb = mix(campo, bronce * (0.9 + 0.2 * m), letra);
    alb = mix(alb, bronce * 0.6, filo * 0.5);
    t.r = letra;
    metal = mix(0.15 + filo * 0.3, 1.0, t.r);
  }
  float h = alturaAgua(vPos.xz) - vPos.y;
  float c = mix(1.0, causticaFina(vPos.xz + vPos.y * 0.3, 1.2), exp(-h * 0.12));
  vec3 col = iluminar(vPos, n, alb, c, metal) + dispersion(vec3(0.0, 1.0, 0.0), h) * alb * 0.9;
  // Al pasar la linterna encima, la placa se ilumina un poco más: es lo que se puede tocar.
  col *= 1.0 + uEncendida * 0.35;
  // En la mano: la luz de la linterna de frente, para leerla de cerca.
  if (uInspeccion > 0.0) {
    vec3 aCam = normalize(uCam - vPos);
    vec3 luz = normalize(aCam + vec3(0.25, 0.35, 0.0));
    float dif = max(dot(n, luz), 0.0);
    float brillo = pow(max(dot(reflect(-luz, n), aCam), 0.0), 28.0);
    vec3 enMano = alb * (0.18 + dif * 1.25) + vec3(1.0, 0.9, 0.75) * brillo * metal * 0.9;
    col = mix(col, enMano, uInspeccion);
  }
  gl_FragColor = vec4(col, 1.0);
}
`;
