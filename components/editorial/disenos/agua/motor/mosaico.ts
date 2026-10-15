import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// La red de cáusticas. La arman las ondas chicas de la superficie, de 30 cm a
// un metro: cada una es una lente débil que junta la luz a un par de metros de
// profundidad, y su suma dibuja la red de hilos que se ve en la arena.
//
// Se calcula en un mosaico de 3,2 m que se repite sin costura: todas las ondas
// tienen un número entero de crestas por lado. La luz se refracta de verdad en
// cada punto y se mide cuánto se achica o se agranda cada triángulo al llegar
// al fondo (el método de Evan Wallace).
// ─────────────────────────────────────────────────────────────────────────────

export const LADO_MOSAICO = 3.2;
const PROFUNDIDAD = 2.6;

// Celdas de casi un metro: las ondas de 40 cm a 1,1 m mandan. Las más cortas
// dibujan hilos con puntas, que en el mar de verdad casi no se ven.
const ONDAS: [number, number][] = [
  [3, 1], [-2, 3], [1, -4], [4, 2], [-4, -3], [5, -1], [2, 5], [-6, 2], [6, 3],
];

const f = (n: number) => n.toFixed(5);

const TERMINOS = ONDAS.map(([n, m], i) => {
  const kx = (2 * Math.PI * n) / LADO_MOSAICO;
  const kz = (2 * Math.PI * m) / LADO_MOSAICO;
  const k = Math.hypot(kx, kz);
  // Cada onda enfoca bastante más allá del fondo: la luz llega juntándose,
  // en bandas anchas y suaves, sin llegar a la punta del foco.
  const a = 0.62 / (k * k);
  // Gravedad y tensión superficial: las chicas corren más rápido.
  const w = Math.sqrt(9.81 * k + (0.074 / 1000) * k * k * k) * 0.55;
  const fase = i * 2.17;
  return `{ float ph = dot(p, vec2(${f(kx)}, ${f(kz)})) + uTiempo * ${f(w)} + ${f(fase)};
    g += ${f(a)} * cos(ph) * vec2(${f(kx)}, ${f(kz)}); }`;
}).join('\n    ');

const VERT = /* glsl */ `
uniform float uTiempo;
uniform vec3 uLuzAire;
uniform vec3 uLuzAgua;
varying vec3 vViejo;
varying vec3 vNuevo;
void main() {
  // La grilla cubre el mosaico y un margen: la luz que se desvía desde el
  // vecino también cae adentro.
  vec2 p = (position.xy * 1.5 - 0.25) * ${f(LADO_MOSAICO)};
  vec2 g = vec2(0.0);
  ${TERMINOS}
  vec3 n = normalize(vec3(-g.x, 1.0, -g.y));
  vec3 L = refract(uLuzAire, n, 1.0 / 1.333);
  vec3 P = vec3(p.x, 0.0, p.y);
  vec3 recto = uLuzAgua * (${f(PROFUNDIDAD)} / -uLuzAgua.y);
  vNuevo = P + L * (${f(PROFUNDIDAD)} / -L.y) - recto;
  vViejo = P;
  vec2 uv = vNuevo.xz / ${f(LADO_MOSAICO)};
  gl_Position = vec4(uv * 2.0 - 1.0, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
varying vec3 vViejo;
varying vec3 vNuevo;
void main() {
  float viejo = length(dFdx(vViejo)) * length(dFdy(vViejo));
  float nuevo = length(dFdx(vNuevo)) * length(dFdy(vNuevo));
  gl_FragColor = vec4(vec3(min(viejo / max(nuevo, 1e-10), 7.0)), 1.0);
}
`;

export function crearMosaico(renderer: THREE.WebGLRenderer, luzAire: THREE.Vector3, luzAgua: THREE.Vector3, tiempo: { value: number }) {
  const rt = new THREE.WebGLRenderTarget(512, 512, {
    type: THREE.HalfFloatType,
    wrapS: THREE.RepeatWrapping,
    wrapT: THREE.RepeatWrapping,
    minFilter: THREE.LinearMipmapLinearFilter,
    magFilter: THREE.LinearFilter,
    generateMipmaps: true,
    depthBuffer: false,
  });

  const n = 280;
  const pos = new Float32Array((n + 1) * (n + 1) * 3);
  let k = 0;
  for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) {
    pos[k++] = i / n;
    pos[k++] = j / n;
    pos[k++] = 0;
  }
  const idx: number[] = [];
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const a = j * (n + 1) + i;
    idx.push(a, a + n + 1, a + 1, a + 1, a + n + 1, a + n + 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setIndex(idx);

  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: { uTiempo: tiempo, uLuzAire: { value: luzAire }, uLuzAgua: { value: luzAgua } },
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const malla = new THREE.Mesh(geo, mat);
  malla.frustumCulled = false;
  const escena = new THREE.Scene();
  escena.add(malla);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  function dibujar() {
    renderer.setRenderTarget(rt);
    renderer.setClearColor(0x000000, 1);
    renderer.clear();
    renderer.render(escena, cam);
  }

  function soltar() {
    rt.dispose();
    geo.dispose();
    mat.dispose();
  }

  return { textura: rt.texture, dibujar, soltar };
}
