import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// Las olas finas de viento, en una textura que se repite sin costura. Se
// calculan una vez por cuadro (altura y pendiente exactas) en lugar de en cada
// píxel, y sus mipmaps hacen el resto: lejos, las olas se promedian como las ve
// el ojo y la superficie no brilla en dientes de sierra.
// ─────────────────────────────────────────────────────────────────────────────

export const LADO_OLEAJE = 12.8;
const RES = 512;

const f = (n: number) => n.toFixed(5);

const TERMINOS = Array.from({ length: 14 }, (_, i) => {
  const ang = 0.35 + i * 2.39996;
  const largo = 3 * Math.pow(32 / 3, i / 13);
  const nx = Math.round(Math.cos(ang) * largo) || 1;
  const nz = Math.round(Math.sin(ang) * largo);
  const kx = (2 * Math.PI * nx) / LADO_OLEAJE;
  const kz = (2 * Math.PI * nz) / LADO_OLEAJE;
  const k = Math.hypot(kx, kz);
  const a = 0.03 * Math.pow(1.47 / k, 1.15);
  const w = Math.sqrt(9.81 * k);
  return `{ float ph = dot(p, vec2(${f(kx)}, ${f(kz)})) + uTiempo * ${f(w)} + ${f(i * 1.7)};
    h += ${f(a)} * sin(ph);
    g += ${f(a)} * cos(ph) * vec2(${f(kx)}, ${f(kz)}); }`;
}).join('\n    ');

const FRAG = /* glsl */ `
uniform float uTiempo;
varying vec2 vUv;
void main() {
  vec2 p = vUv * ${f(LADO_OLEAJE)};
  float h = 0.0;
  vec2 g = vec2(0.0);
  ${TERMINOS}
  gl_FragColor = vec4(h, g, 1.0);
}
`;

export function crearOleaje(renderer: THREE.WebGLRenderer, tiempo: { value: number }) {
  const rt = new THREE.WebGLRenderTarget(RES, RES, {
    type: THREE.HalfFloatType,
    wrapS: THREE.RepeatWrapping,
    wrapT: THREE.RepeatWrapping,
    minFilter: THREE.LinearMipmapLinearFilter,
    magFilter: THREE.LinearFilter,
    generateMipmaps: true,
    depthBuffer: false,
  });
  const mat = new THREE.ShaderMaterial({
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
    `,
    fragmentShader: FRAG,
    uniforms: { uTiempo: tiempo },
    depthTest: false,
    depthWrite: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  quad.frustumCulled = false;
  const escena = new THREE.Scene();
  escena.add(quad);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  return {
    textura: rt.texture,
    dibujar() {
      renderer.setRenderTarget(rt);
      renderer.render(escena, cam);
    },
    soltar() {
      rt.dispose();
      mat.dispose();
      quad.geometry.dispose();
    },
  };
}
