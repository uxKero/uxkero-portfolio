import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// Aguas someras con tuberías virtuales (O'Brien y Hodgins; Mei, Decaudin y Hu).
// Cada celda guarda su altura de agua y cuatro flujos de salida hacia sus
// vecinas. A diferencia de la ecuación de onda, esto mueve masa: el agua se
// apila, rompe contra sí misma y vuelve, y el volumen se conserva exacto.
//
// El mar es abierto. No hay paredes a la vista: el borde del dominio es una
// esponja que se come las olas, así nunca vuelven rebotadas desde un límite.
// El tirón de la ventana empuja el agua alrededor de la lente, como una mano
// que mueve la cámara dentro del mar, y las olas que arma se van.
// ─────────────────────────────────────────────────────────────────────────────

export const DOMINIO = {
  ancho: 26,
  fondo: 22,
  /** z donde arranca el dominio, detrás de la cámara. */
  z0: 5,
  profundidad: 2.4,
  nx: 320,
  nz: 272,
};

const G = 9.81;
const PASO = 1 / 300;
const PASOS_MAX = 7;
/** Segundos en que la energía de una ola cae a 1/e. */
const VIDA_OLA = 7;
/** Radio del empuje alrededor de la lente, en metros. */
const RADIO_EMPUJE = 2.6;

const vertice = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const MUNDO = /* glsl */ `
vec2 aMundo(vec2 uv) {
  return vec2((uv.x - 0.5) * ${DOMINIO.ancho.toFixed(3)}, ${DOMINIO.z0.toFixed(3)} - uv.y * ${DOMINIO.fondo.toFixed(3)});
}
// 0 adentro, 1 en el borde: la franja donde el mar se calma solo.
float esponja(vec2 uv) {
  vec2 d = min(uv, 1.0 - uv) * vec2(${DOMINIO.ancho.toFixed(3)}, ${DOMINIO.fondo.toFixed(3)});
  float m = min(d.x, d.y);
  return 1.0 - smoothstep(0.0, 4.0, m);
}
`;

const pasadaFlujo = /* glsl */ `
precision highp float;
uniform sampler2D uEstado;
uniform sampler2D uFlujo;
uniform vec2 uTexel;
uniform float uDt;
uniform float uL;
uniform float uG;
uniform vec2 uFuerza;
uniform vec2 uCentro;
uniform float uFreno;
uniform vec3 uPuntero;
varying vec2 vUv;
${MUNDO}

float altura(vec2 uv) { return texture2D(uEstado, uv).r; }

void main() {
  vec4 f = texture2D(uFlujo, vUv);
  float h = altura(vUv);
  float hL = altura(vUv - vec2(uTexel.x, 0.0));
  float hR = altura(vUv + vec2(uTexel.x, 0.0));
  float hA = altura(vUv - vec2(0.0, uTexel.y));
  float hB = altura(vUv + vec2(0.0, uTexel.y));

  vec2 p = aMundo(vUv);
  // El tirón actúa alrededor de la lente; el puntero, en su franja.
  float cerca = exp(-dot(p - uCentro, p - uCentro) / ${(RADIO_EMPUJE * RADIO_EMPUJE).toFixed(3)});
  float franja = exp(-pow((p.x - uPuntero.x) / 0.9, 2.0)) * exp(-max(uCentro.y - p.y, 0.0) / 2.5) * step(p.y, uCentro.y + 1.0);
  vec2 fuerza = uFuerza * cerca + vec2(uPuntero.z * franja, 0.0);

  // r: izquierda, g: derecha, b: hacia la cámara (+z), a: hacia el fondo (-z).
  vec4 empuje = vec4(
    uG * (h - hL) - fuerza.x * uL,
    uG * (h - hR) + fuerza.x * uL,
    uG * (h - hA) + fuerza.y * uL,
    uG * (h - hB) - fuerza.y * uL
  );
  float freno = mix(uFreno, 0.97, esponja(vUv));
  f = max(vec4(0.0), f * freno + uDt * uL * empuje);

  if (vUv.x < uTexel.x) f.r = 0.0;
  if (vUv.x > 1.0 - uTexel.x) f.g = 0.0;
  if (vUv.y < uTexel.y) f.b = 0.0;
  if (vUv.y > 1.0 - uTexel.y) f.a = 0.0;

  // No puede salir más agua de la que hay.
  float salida = (f.r + f.g + f.b + f.a) * uDt;
  float hay = h * uL * uL;
  if (salida > hay) f *= hay / salida;

  gl_FragColor = f;
}
`;

const pasadaAltura = /* glsl */ `
precision highp float;
uniform sampler2D uEstado;
uniform sampler2D uFlujo;
uniform vec2 uTexel;
uniform float uDt;
uniform float uL;
uniform float uH0;
varying vec2 vUv;
${MUNDO}

void main() {
  vec4 s = texture2D(uEstado, vUv);
  vec4 f = texture2D(uFlujo, vUv);
  vec4 fL = texture2D(uFlujo, vUv - vec2(uTexel.x, 0.0));
  vec4 fR = texture2D(uFlujo, vUv + vec2(uTexel.x, 0.0));
  vec4 fA = texture2D(uFlujo, vUv - vec2(0.0, uTexel.y));
  vec4 fB = texture2D(uFlujo, vUv + vec2(0.0, uTexel.y));

  float entra = fL.g + fR.r + fA.a + fB.b;
  float sale = f.r + f.g + f.b + f.a;
  float h0 = s.r;
  float h = max(0.0, h0 + uDt * (entra - sale) / (uL * uL));
  // En la esponja el nivel vuelve al del mar abierto.
  h = mix(h, uH0, esponja(vUv) * uDt * 6.0);

  float hm = max(0.05, 0.5 * (h0 + h));
  float vx = (fL.g - f.r + f.g - fR.r) * 0.5 / (uL * hm);
  float vz = -(fA.a - f.b + f.a - fB.b) * 0.5 / (uL * hm);

  gl_FragColor = vec4(h, vx, vz, 1.0);
}
`;

export function crearSimulacion(renderer: THREE.WebGLRenderer) {
  const { nx, nz, ancho, profundidad } = DOMINIO;
  const usaFloat = renderer.extensions.has('EXT_color_buffer_float');
  const tipo = usaFloat ? THREE.FloatType : THREE.HalfFloatType;

  const nuevoObjetivo = (filtro: THREE.MagnificationTextureFilter = THREE.NearestFilter) =>
    new THREE.WebGLRenderTarget(nx, nz, {
      type: tipo,
      format: THREE.RGBAFormat,
      minFilter: filtro,
      magFilter: filtro,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      depthBuffer: false,
    });

  let estado = [nuevoObjetivo(), nuevoObjetivo()];
  let flujo = [nuevoObjetivo(), nuevoObjetivo()];
  // Una copia con filtro lineal para que la superficie se lea suave.
  const lectura = nuevoObjetivo(THREE.LinearFilter);

  const l = ancho / nx;
  const texel = new THREE.Vector2(1 / nx, 1 / nz);
  const camara = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const escena = new THREE.Scene();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
  quad.frustumCulled = false;
  escena.add(quad);

  const matFlujo = new THREE.ShaderMaterial({
    vertexShader: vertice,
    fragmentShader: pasadaFlujo,
    uniforms: {
      uEstado: { value: null },
      uFlujo: { value: null },
      uTexel: { value: texel },
      uDt: { value: PASO },
      uL: { value: l },
      uG: { value: G },
      uFuerza: { value: new THREE.Vector2() },
      uCentro: { value: new THREE.Vector2(0, -1.5) },
      uFreno: { value: Math.exp(-PASO / VIDA_OLA) },
      uPuntero: { value: new THREE.Vector3(0, 0, 0) },
    },
  });
  const matAltura = new THREE.ShaderMaterial({
    vertexShader: vertice,
    fragmentShader: pasadaAltura,
    uniforms: {
      uEstado: { value: null },
      uFlujo: { value: null },
      uTexel: { value: texel },
      uDt: { value: PASO },
      uL: { value: l },
      uH0: { value: profundidad },
    },
  });
  const matCopia = new THREE.ShaderMaterial({
    vertexShader: vertice,
    fragmentShader: /* glsl */ `
      uniform sampler2D uFuente;
      varying vec2 vUv;
      void main() { gl_FragColor = texture2D(uFuente, vUv); }
    `,
    uniforms: { uFuente: { value: null } },
  });
  const matInicio = new THREE.ShaderMaterial({
    vertexShader: vertice,
    fragmentShader: /* glsl */ `
      uniform float uH;
      void main() { gl_FragColor = vec4(uH, 0.0, 0.0, 1.0); }
    `,
    uniforms: { uH: { value: profundidad } },
  });
  const matCero = new THREE.ShaderMaterial({
    vertexShader: vertice,
    fragmentShader: `void main() { gl_FragColor = vec4(0.0); }`,
  });

  const dibujar = (mat: THREE.Material, destino: THREE.WebGLRenderTarget) => {
    quad.material = mat;
    renderer.setRenderTarget(destino);
    renderer.render(escena, camara);
  };

  for (const e of estado) dibujar(matInicio, e);
  for (const f of flujo) dibujar(matCero, f);
  dibujar(matInicio, lectura);
  renderer.setRenderTarget(null);

  let acumulado = 0;

  // Lectura de vuelta de una fila corta de alturas, para que la cámara flote.
  // Es asíncrona: esperar a la placa en cada cuadro corta el ritmo a la mitad.
  // Llega con un cuadro de atraso, que la boya no nota.
  const muestra = { ancho: 0, datos: new Float32Array(0), lista: false };
  let leyendo = false;
  const leerFila = (centro: THREE.Vector2, mitad: number) => {
    if (!usaFloat || leyendo) return muestra;
    const u0 = Math.max(0, Math.floor(((centro.x - mitad) / ancho + 0.5) * nx));
    const u1 = Math.min(nx - 1, Math.ceil(((centro.x + mitad) / ancho + 0.5) * nx));
    const v = Math.round(((DOMINIO.z0 - centro.y) / DOMINIO.fondo) * nz);
    const w = u1 - u0 + 1;
    const destino = new Float32Array(w * 4);
    leyendo = true;
    renderer
      .readRenderTargetPixelsAsync(lectura, u0, v, w, 1, destino)
      .then(() => {
        muestra.datos = destino;
        muestra.ancho = w;
        muestra.lista = true;
      })
      .catch(() => undefined)
      .finally(() => {
        leyendo = false;
      });
    return muestra;
  };

  /**
   * Avanza la simulación lo que haya pasado desde el último cuadro, en pasos
   * fijos: el agua se comporta igual a 60 que a 144 Hz.
   */
  function avanzar(dt: number, fuerza: { x: number; y: number; z: number }, centro: THREE.Vector2, puntero: THREE.Vector3) {
    const previo = renderer.getRenderTarget();
    acumulado = Math.min(acumulado + dt, PASO * PASOS_MAX);
    // La variación vertical cambia cuánto pesa el agua, nunca la deja sin peso.
    matFlujo.uniforms.uG.value = Math.max(G * 0.25, G + fuerza.y);
    matFlujo.uniforms.uFuerza.value.set(fuerza.x, fuerza.z);
    matFlujo.uniforms.uCentro.value.copy(centro);
    matFlujo.uniforms.uPuntero.value.copy(puntero);

    while (acumulado >= PASO) {
      acumulado -= PASO;
      matFlujo.uniforms.uEstado.value = estado[0].texture;
      matFlujo.uniforms.uFlujo.value = flujo[0].texture;
      dibujar(matFlujo, flujo[1]);
      flujo = [flujo[1], flujo[0]];

      matAltura.uniforms.uEstado.value = estado[0].texture;
      matAltura.uniforms.uFlujo.value = flujo[0].texture;
      dibujar(matAltura, estado[1]);
      estado = [estado[1], estado[0]];
    }

    matCopia.uniforms.uFuente.value = estado[0].texture;
    dibujar(matCopia, lectura);
    renderer.setRenderTarget(previo);
  }

  function soltar() {
    for (const o of [...estado, ...flujo, lectura]) o.dispose();
    for (const m of [matFlujo, matAltura, matCopia, matInicio, matCero]) m.dispose();
    quad.geometry.dispose();
  }

  return {
    textura: lectura.texture,
    puedeLeer: usaFloat,
    leerFila,
    avanzar,
    soltar,
  };
}
