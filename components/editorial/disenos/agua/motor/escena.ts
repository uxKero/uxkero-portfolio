import * as THREE from 'three';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { crearSimulacion, DOMINIO } from './simulacion';
import { crearSensorVentana } from './ventana';
import { crearMosaico, LADO_MOSAICO } from './mosaico';

import { crearOleaje } from './oleaje';
import { FONDO_POZO, POZO, bordePozo, fondoEn } from './glsl';
import { crearContenido } from './contenido3d';
import { crearPeces } from './peces';
import type { Accion, Plan } from '../contenido';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import {
  FRAG_ARENA,
  FRAG_CAUSTICA,
  FRAG_CIELO,
  FRAG_COMPOSICION,
  FRAG_PARTICULA,
  FRAG_POZO,
  VERT_POZO,
  FRAG_RAYOS,
  FRAG_SUPERFICIE_ABAJO,
  FRAG_SUPERFICIE_ARRIBA,
  VERT_ARENA,
  VERT_CAUSTICA,
  VERT_PANTALLA,
  VERT_PARTICULA,
  VERT_SIMPLE,
  VERT_SUPERFICIE,
} from './shaders';

// ─────────────────────────────────────────────────────────────────────────────
// La toma es la de una cámara con domo que flota a ras del agua: arriba el
// aire, abajo el mar, y la línea que los separa es la superficie real de la
// simulación cortando la lente. Se dibujan dos mundos por cuadro y se componen
// píxel a píxel según de qué lado del agua cae cada punto del domo.
//
// La cámara es una boya: sigue el nivel del agua con su propia inercia y se
// inclina con la pendiente. Un tirón la hunde o la saca, pero siempre vuelve a
// asomar.
// ─────────────────────────────────────────────────────────────────────────────

const { ancho: W, fondo: D, z0: Z0, profundidad: H0 } = DOMINIO;

/** Radio del domo de la lente: cuánto agua cabe en la toma. */
const LENTE = 1.15;
/** Cuántos metros de agua equivalen al ancho de la pantalla cuando se arrastra la ventana. */
const METROS_PANTALLA = 3.2;
/** Dónde flota la lente, en el plano del agua. */
const CENTRO_LENTE = new THREE.Vector2(0, -1.4);

/** Dónde está el sol en el HDR (medido sobre el archivo) y dónde lo queremos. */
const SOL_U = 0.6045;
const SOL_V = 0.4883;
const BANDA_K = 3.12;
const SOL_AZIMUT = THREE.MathUtils.degToRad(-52);
const SOL_ELEVACION = (0.5 - SOL_V) * Math.PI;
const ROT_U = ((SOL_U - 0.5) * 2 * Math.PI - SOL_AZIMUT) / (2 * Math.PI);

/** El sol, ya refractado: la luz que arma cáusticas y rayos es la del mismo sol. */
const SOL = (() => {
  const e = SOL_ELEVACION;
  return new THREE.Vector3(Math.cos(SOL_AZIMUT) * Math.cos(e), Math.sin(e), Math.sin(SOL_AZIMUT) * Math.cos(e)).normalize();
})();
// Abajo del agua la luz manda por la dirección del sol, pero con la de un sol
// más alto: a 2 grados de elevación todo entraría a 48 y las cáusticas se
// estirarían hasta deformarse. Bajo la superficie nadie ve dónde está el sol.
const ELEVACION_LUZ = THREE.MathUtils.degToRad(40);
const LUZ_AIRE = new THREE.Vector3(
  -Math.cos(SOL_AZIMUT) * Math.cos(ELEVACION_LUZ),
  -Math.sin(ELEVACION_LUZ),
  -Math.sin(SOL_AZIMUT) * Math.cos(ELEVACION_LUZ),
);
const LUZ_CAUSTICA = (() => {
  // Snell: al entrar al agua lo horizontal se achica por el índice.
  const tx = LUZ_AIRE.x / 1.333;
  const tz = LUZ_AIRE.z / 1.333;
  return new THREE.Vector3(tx, -Math.sqrt(Math.max(1 - tx * tx - tz * tz, 0)), tz);
})();
const CAUSTICA_CAJA = new THREE.Vector4(-W / 2 - 0.5, W / 2 + 0.5, Z0 + 1.5, Z0 - D - 0.5);

const NIEVE = 3500;
/** Hasta dónde baja la cámara por el pozo, en metros. */
export const PROFUNDIDAD_MAX = 34;
const BURBUJAS = 420;

/** El título de la portada: un renglón con partes en itálica y un antetítulo. */
export interface Titulo {
  partes: { texto: string; italica?: boolean }[];
  arriba: string;
  /** La bajada: va bajo el agua, debajo del título, refractada con él. */
  abajo: string;
}

export interface OpcionesMotor {
  titulo: Titulo;
  /** Metros bajo la superficie a los que tiene que estar la cámara. */
  profundidad: () => number;
  plan: Plan;
  /** La linterna pasa por encima de algo que se puede tocar. */
  alPasar: (hay: boolean) => void;
  /** Cuánto de la escena ya cargó, de 0 a 1. */
  alProgreso?: (p: number) => void;
  /** Todo cargado y dibujado: ya se puede mostrar. */
  alListo?: () => void;
  /** Una placa salió de la pared y está en la mano (o volvió, con null). */
  alInspeccionar: (info: { accion?: Accion; tieneDorso: boolean } | null) => void;
}

export interface Motor {
  cambiarPlan: (plan: Plan) => void;
  cambiarTitulo: (titulo: Titulo) => void;
  /** Devuelve a la pared la placa que está en la mano. */
  soltarPlaca: () => void;
  /** Da vuelta la placa que está en la mano. */
  girarPlaca: () => void;
  soltar: () => void;
}

/** Ejes de una grilla densa en el dominio y que se abre hacia el horizonte. */
function eje(a: number, b: number, n: number, extra: number, lejos: number) {
  const celda = (b - a) / n;
  const s = Math.sign(celda);
  const v: number[] = [];
  for (let k = extra; k >= 1; k--) v.push(a - s * (Math.abs(celda) * k + lejos * Math.pow(k / extra, 3)));
  for (let i = 0; i <= n; i++) v.push(a + celda * i);
  for (let k = 1; k <= extra; k++) v.push(b + s * (Math.abs(celda) * k + lejos * Math.pow(k / extra, 3)));
  return v;
}

function geometriaSuperficie() {
  const xs = eje(-W / 2, W / 2, DOMINIO.nx, 40, 2500);
  const zs = eje(Z0, Z0 - D, DOMINIO.nz, 56, 4000).filter((z) => z < Z0 + 30);
  const pos = new Float32Array(xs.length * zs.length * 3);
  let k = 0;
  for (const z of zs) for (const x of xs) {
    pos[k++] = x;
    pos[k++] = 0;
    pos[k++] = z;
  }
  const idx: number[] = [];
  const fila = xs.length;
  for (let j = 0; j < zs.length - 1; j++) {
    for (let i = 0; i < fila - 1; i++) {
      const a = j * fila + i;
      idx.push(a, a + fila, a + 1, a + 1, a + fila, a + fila + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
}

/** El fondo: denso donde está la cámara y el pozo, abierto hacia lejos. */
function geometriaFondo() {
  const xs = eje(-14, 14, 280, 26, 110);
  const zs = eje(4, -22, 260, 30, 200);
  const pos = new Float32Array(xs.length * zs.length * 3);
  let k = 0;
  for (const z of zs) for (const x of xs) {
    pos[k++] = x;
    pos[k++] = 0;
    pos[k++] = z;
  }
  const idx: number[] = [];
  const fila = xs.length;
  for (let j = 0; j < zs.length - 1; j++) {
    for (let i = 0; i < fila - 1; i++) {
      const a = j * fila + i;
      // Las filas avanzan hacia -z: este orden deja las caras mirando arriba.
      idx.push(a, a + 1, a + fila, a + 1, a + fila + 1, a + fila);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
}

/** La pared del pozo, en parámetros: ángulo alrededor y altura. */
function geometriaPozo() {
  const na = 420;
  const ny = 280;
  const tope = -1.75;
  const param = new Float32Array((na + 1) * (ny + 1) * 2);
  let k = 0;
  for (let j = 0; j <= ny; j++) {
    // Más densa arriba, donde se mira de cerca.
    const y = tope - Math.pow(j / ny, 1.5) * (tope - FONDO_POZO + 0.5);
    for (let i = 0; i <= na; i++) {
      param[k++] = (i / na) * Math.PI * 2;
      param[k++] = y;
    }
  }
  const idx: number[] = [];
  for (let j = 0; j < ny; j++) for (let i = 0; i < na; i++) {
    const a = j * (na + 1) + i;
    idx.push(a, a + 1, a + na + 1, a + 1, a + na + 2, a + na + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('aParam', new THREE.BufferAttribute(param, 2));
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array((na + 1) * (ny + 1) * 3), 3));
  g.setIndex(idx);
  return g;
}

function grillaCaustica(nx: number, nz: number) {
  const pos = new Float32Array((nx + 1) * (nz + 1) * 3);
  let k = 0;
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
    pos[k++] = i / nx;
    pos[k++] = j / nz;
    pos[k++] = 0;
  }
  const idx: number[] = [];
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const a = j * (nx + 1) + i;
    idx.push(a, a + nx + 1, a + 1, a + 1, a + nx + 1, a + nx + 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
}

/** Resorte amortiguado de un grado de libertad. */
function resorte(omega: number, amortiguacion: number) {
  return {
    x: 0,
    v: 0,
    paso(objetivo: number, dt: number, impulso = 0) {
      const a = omega * omega * (objetivo - this.x) - 2 * amortiguacion * omega * this.v + impulso;
      this.v += a * dt;
      this.x += this.v * dt;
      return this.x;
    },
  };
}

export function crearMotor(canvas: HTMLCanvasElement, opciones: OpcionesMotor): Motor {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

  const sim = crearSimulacion(renderer);
  const sensor = crearSensorVentana(() => METROS_PANTALLA / Math.max(window.innerWidth, 1));

  const camara = new THREE.PerspectiveCamera(52, 1, 0.05, 6000);
  camara.rotation.order = 'YXZ';
  camara.position.set(CENTRO_LENTE.x, H0, CENTRO_LENTE.y + LENTE);
  const solDir = SOL;
  const solAgua = LUZ_CAUSTICA;

  const vacia = new THREE.DataTexture(new Float32Array([0, 0, 0, 1]), 1, 1, THREE.RGBAFormat, THREE.FloatType);
  vacia.needsUpdate = true;

  const U = {
    uAltura: { value: sim.textura as THREE.Texture },
    uH0: { value: H0 },
    uTiempo: { value: 0 },
    uCam: { value: camara.position },
    uCieloHdr: { value: vacia as THREE.Texture },
    uCieloBanda: { value: vacia as THREE.Texture },
    uRotU: { value: ROT_U },
    uBandaK: { value: BANDA_K },
    uExposicion: { value: 0.62 },
    uSigma: { value: new THREE.Vector3(0.32, 0.1, 0.092) },
    uColorAgua: { value: new THREE.Vector3(0.042, 0.142, 0.15) },
    uSolDir: { value: solDir },
    uSolAgua: { value: solAgua },
    uSolColor: { value: new THREE.Vector3(255, 175, 110) },
    uLente: { value: LENTE },
    uFrente: { value: new THREE.Vector3(0, 0, -1) },
    uLuzCaustica: { value: LUZ_CAUSTICA },
    uCajaCaustica: { value: CAUSTICA_CAJA },
    uMosaico: { value: vacia as THREE.Texture },
    uLinternaPos: { value: new THREE.Vector3() },
    uLinternaDir: { value: new THREE.Vector3(0, 0, -1) },
    uLinterna: { value: 0 },
    uOleaje: { value: vacia as THREE.Texture },
    uLadoMosaico: { value: LADO_MOSAICO },
  };
  const mosaico = crearMosaico(renderer, LUZ_AIRE, LUZ_CAUSTICA, U.uTiempo);
  const oleaje = crearOleaje(renderer, U.uTiempo);
  U.uOleaje.value = oleaje.textura;
  U.uMosaico.value = mosaico.textura;

  // ── Mundo de arriba ────────────────────────────────────────────────────────
  const escenaArriba = new THREE.Scene();
  const cieloMat = new THREE.ShaderMaterial({
    vertexShader: VERT_SIMPLE,
    fragmentShader: FRAG_CIELO,
    uniforms: { ...U, uCentro: { value: new THREE.Vector3() } },
    side: THREE.BackSide,
    depthWrite: false,
  });
  const cieloMalla = new THREE.Mesh(new THREE.SphereGeometry(5000, 64, 32), cieloMat);
  cieloMalla.frustumCulled = false;
  cieloMalla.renderOrder = -1;
  escenaArriba.add(cieloMalla);

  const sol = new THREE.DirectionalLight(new THREE.Color(1.0, 0.56, 0.27), 6.5);
  sol.position.copy(solDir).multiplyScalar(50);
  escenaArriba.add(sol);
  escenaArriba.add(new THREE.HemisphereLight(0x8a96b8, 0x2a2c36, 0.22));

  const superficie = geometriaSuperficie();
  const cubo = new THREE.WebGLCubeRenderTarget(512, {
    type: THREE.HalfFloatType,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
  });
  const camCubo = new THREE.CubeCamera(0.1, 6000, cubo);
  camCubo.position.set(0, H0 + 0.6, -3);

  const supArriba = new THREE.Mesh(
    superficie,
    new THREE.ShaderMaterial({
      vertexShader: VERT_SUPERFICIE,
      fragmentShader: FRAG_SUPERFICIE_ARRIBA,
      uniforms: { ...U, uArriba: { value: cubo.texture } },
      side: THREE.DoubleSide,
    }),
  );
  supArriba.frustumCulled = false;
  escenaArriba.add(supArriba);

  // ── Mundo de abajo ─────────────────────────────────────────────────────────
  const escenaAbajo = new THREE.Scene();
  escenaAbajo.background = new THREE.Color(0, 0, 0);
  const supAbajo = new THREE.Mesh(
    superficie,
    new THREE.ShaderMaterial({
      vertexShader: VERT_SUPERFICIE,
      fragmentShader: FRAG_SUPERFICIE_ABAJO,
      uniforms: { ...U, uArriba: { value: cubo.texture } },
      side: THREE.DoubleSide,
    }),
  );
  supAbajo.frustumCulled = false;
  escenaAbajo.add(supAbajo);

  const caustica = new THREE.WebGLRenderTarget(256, 224, {
    type: THREE.HalfFloatType,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: false,
  });
  const arenaMat = new THREE.ShaderMaterial({
    vertexShader: VERT_ARENA,
    fragmentShader: FRAG_ARENA,
    uniforms: {
      ...U,
      uArena: { value: vacia },
      uArenaNor: { value: vacia },
      uRoca: { value: vacia },
      uRocaNor: { value: vacia },
      uCaustica: { value: caustica.texture },
    },
  });
  const arena = new THREE.Mesh(geometriaFondo(), arenaMat);
  arena.frustumCulled = false;
  escenaAbajo.add(arena);

  const paredMat = new THREE.ShaderMaterial({
    vertexShader: VERT_POZO,
    fragmentShader: FRAG_POZO,
    uniforms: { ...U, uRoca: { value: vacia }, uRocaNor: { value: vacia }, uCaustica: { value: caustica.texture } },
    side: THREE.DoubleSide,
  });
  const pared = new THREE.Mesh(geometriaPozo(), paredMat);
  pared.frustumCulled = false;
  escenaAbajo.add(pared);

  // El portfolio, tallado y abulonado en la pared. Se arma cuando las
  // tipografías están listas: las letras se miden con las reales.
  const contenido = crearContenido(escenaAbajo, U as unknown as Record<string, THREE.IUniform>, paredMat.uniforms.uRoca, paredMat.uniforms.uRocaNor);
  let planActual = opciones.plan;
  let contenidoListo = false;
  document.fonts.ready.then(() => {
    if (!vivoContenido) return;
    contenido.armar(planActual);
    contenidoListo = true;
  });
  let vivoContenido = true;
  // Se avisa que está listo recién después de unos cuadros completos: los
  // shaders ya compilaron y no hay tirones al destapar.
  let cuadrosListos = 0;
  let avisado = false;

  escenaAbajo.add(new THREE.HemisphereLight(0x3f8f80, 0x0a1a18, 1.4));
  const solAbajo = new THREE.DirectionalLight(0x9fe0c8, 1.1);
  solAbajo.position.copy(LUZ_CAUSTICA).multiplyScalar(-30);
  escenaAbajo.add(solAbajo);

  // ── Cáusticas ──────────────────────────────────────────────────────────────
  const escenaCaustica = new THREE.Scene();
  const causticaMalla = new THREE.Mesh(
    grillaCaustica(200, 170),
    new THREE.ShaderMaterial({
      vertexShader: VERT_CAUSTICA,
      fragmentShader: FRAG_CAUSTICA,
      uniforms: { ...U, uLuzAire: { value: LUZ_AIRE } },
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true,
      side: THREE.DoubleSide,
    }),
  );
  causticaMalla.frustumCulled = false;
  escenaCaustica.add(causticaMalla);
  const camOrto = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // ── Destinos y composición ─────────────────────────────────────────────────
  const prof = new THREE.DepthTexture(1, 1);
  const rtAbajo = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthTexture: prof });
  const rtArriba = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType });
  // La composición sale ya en pantalla (sRGB) y el suavizado de bordes la lee.
  const rtFinal = new THREE.WebGLRenderTarget(1, 1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false });
  const fxaaMat = new THREE.ShaderMaterial({
    vertexShader: FXAAShader.vertexShader,
    fragmentShader: FXAAShader.fragmentShader,
    uniforms: THREE.UniformsUtils.clone(FXAAShader.uniforms),
    depthTest: false,
    depthWrite: false,
  });
  fxaaMat.uniforms.tDiffuse.value = rtFinal.texture;
  const escenaFxaa = new THREE.Scene();
  const fxaaQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), fxaaMat);
  fxaaQuad.frustumCulled = false;
  escenaFxaa.add(fxaaQuad);
  const rtParticulas = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthBuffer: false });
  let rtRayos = [0, 1].map(() => new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthBuffer: false }));
  let cuadroN = 0;
  const resolucion = new THREE.Vector2(1, 1);

  // ── Nieve marina y burbujas ────────────────────────────────────────────────
  const total = NIEVE + BURBUJAS;
  const posP = new Float32Array(total * 3);
  const tamP = new Float32Array(total);
  const tipoP = new Float32Array(total);
  const caja = new THREE.Vector3(16, 10, 18);
  for (let i = 0; i < NIEVE; i++) {
    posP[i * 3] = (Math.random() - 0.5) * caja.x;
    posP[i * 3 + 1] = -6 + Math.random() * (H0 + 6);
    posP[i * 3 + 2] = -Math.random() * caja.z;
    tamP[i] = 0.006 + Math.pow(Math.random(), 4) * 0.03;
  }
  const burbujas = Array.from({ length: BURBUJAS }, () => ({ vivo: false, x: 0, y: 0, z: 0, r: 0, fase: 0 }));
  for (let i = NIEVE; i < total; i++) {
    tipoP[i] = 1;
    posP[i * 3 + 1] = -100;
  }
  const geoP = new THREE.BufferGeometry();
  geoP.setAttribute('position', new THREE.BufferAttribute(posP, 3));
  geoP.setAttribute('aTam', new THREE.BufferAttribute(tamP, 1));
  geoP.setAttribute('aTipo', new THREE.BufferAttribute(tipoP, 1));
  const matP = new THREE.ShaderMaterial({
    vertexShader: VERT_PARTICULA,
    fragmentShader: FRAG_PARTICULA,
    uniforms: {
      ...U,
      uEscala: { value: 1 },
      uCaja: { value: caja },
      uOrigen: { value: new THREE.Vector3() },
      uProfAbajo: { value: prof },
      uResolucion: { value: resolucion },
      uCerca: { value: camara.near },
      uLejos: { value: camara.far },
      uProfCam: { value: 0 },
    },
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
    transparent: true,
  });
  const puntos = new THREE.Points(geoP, matP);
  puntos.frustumCulled = false;
  const escenaParticulas = new THREE.Scene();
  escenaParticulas.add(puntos);

  let proxima = 0;
  function soltarBurbujas(n: number, cerca: boolean) {
    for (let k = 0; k < n; k++) {
      const b = burbujas[proxima];
      proxima = (proxima + 1) % BURBUJAS;
      b.vivo = true;
      const ang = Math.random() * Math.PI * 2;
      const rad = cerca ? 0.1 + Math.random() * 0.9 : Math.random() * 4;
      b.x = camara.position.x + Math.cos(ang) * rad;
      b.z = camara.position.z - LENTE - 0.2 - Math.random() * (cerca ? 1.2 : 6);
      b.y = camara.position.y - 0.1 - Math.random() * (cerca ? 0.7 : 1.5);
      b.r = 0.004 + Math.pow(Math.random(), 3) * 0.03;
      b.fase = Math.random() * 10;
    }
  }
  /** Una burbuja al pie de la escollera, justo bajo la superficie. */
  function soltarEnRoca() {
    const b = burbujas[proxima];
    proxima = (proxima + 1) % BURBUJAS;
    const k = Math.random();
    const enLobo = Math.random() < 0.3;
    const ex = enLobo ? -1.9 + (Math.random() - 0.5) * 3 : THREE.MathUtils.lerp(-7.5, -3.1, k);
    const ez = enLobo ? -9.5 + (Math.random() - 0.5) * 3 : THREE.MathUtils.lerp(-1.5, -8, k);
    const lado = (Math.random() < 0.5 ? -1 : 1) * (0.9 + Math.random() * 0.6);
    b.vivo = true;
    b.x = ex + lado * 0.8;
    b.z = ez + lado * 0.4;
    b.y = H0 - 0.15 - Math.random() * 0.9;
    b.r = 0.004 + Math.pow(Math.random(), 2) * 0.02;
    b.fase = Math.random() * 10;
  }

  function moverBurbujas(dt: number, t: number) {
    for (let k = 0; k < BURBUJAS; k++) {
      const b = burbujas[k];
      const i = NIEVE + k;
      if (!b.vivo) {
        posP[i * 3 + 1] = -100;
        continue;
      }
      // Las chicas suben lento y derecho; las grandes, rápido y bamboleando.
      const sube = 0.18 + b.r * 9;
      b.y += sube * dt;
      b.x += Math.sin(t * 7 + b.fase) * b.r * 2.2 * dt * 10;
      b.z += Math.cos(t * 5.3 + b.fase) * b.r * 1.4 * dt * 10;
      if (b.y > H0 + 0.4) b.vivo = false;
      posP[i * 3] = b.x;
      posP[i * 3 + 1] = b.y;
      posP[i * 3 + 2] = b.z;
      tamP[i] = b.r * 2;
    }
    geoP.attributes.position.needsUpdate = true;
    geoP.attributes.aTam.needsUpdate = true;
  }

  const compMat = new THREE.ShaderMaterial({
    vertexShader: VERT_PANTALLA,
    fragmentShader: FRAG_COMPOSICION,
    uniforms: {
      ...U,
      uImgArriba: { value: rtArriba.texture },
      uImgAbajo: { value: rtAbajo.texture },
      uImgParticulas: { value: rtParticulas.texture },
      uImgRayos: { value: rtRayos[0].texture },
      uProfAbajo: { value: prof },
      uCaustica: { value: caustica.texture },
      uInvProy: { value: camara.projectionMatrixInverse },
      uCamMundo: { value: camara.matrixWorld },
      uCerca: { value: camara.near },
      uLejos: { value: camara.far },
      uRayos: { value: 1 },
      uFoco: { value: 0 },
      uTitulo: { value: vacia as THREE.Texture },
      uTituloOn: { value: 0 },
      uTituloSube: { value: 0 },
    },
    depthTest: false,
    depthWrite: false,
  });
  const rayosMat = new THREE.ShaderMaterial({
    vertexShader: VERT_PANTALLA,
    fragmentShader: FRAG_RAYOS,
    uniforms: {
      ...U,
      uProfAbajo: { value: prof },
      uCaustica: { value: caustica.texture },
      uInvProy: { value: camara.projectionMatrixInverse },
      uCamMundo: { value: camara.matrixWorld },
      uCerca: { value: camara.near },
      uLejos: { value: camara.far },
      uPrevio: { value: null },
      uCuadro: { value: 0 },
      uMezcla: { value: 0.18 },
    },
    depthTest: false,
    depthWrite: false,
  });
  const escenaRayos = new THREE.Scene();
  const rayosQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), rayosMat);
  rayosQuad.frustumCulled = false;
  escenaRayos.add(rayosQuad);

  const escenaComp = new THREE.Scene();
  const compQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), compMat);
  compQuad.frustumCulled = false;
  escenaComp.add(compQuad);

  // ── Carga ──────────────────────────────────────────────────────────────────
  let cuboListo = false;
  let vivo = true;
  const pendientes: Promise<unknown>[] = [];

  pendientes.push(
    new HDRLoader()
      .setDataType(THREE.HalfFloatType)
      .loadAsync('/agua/cielo.hdr')
      .then((t) => {
        t.wrapS = THREE.RepeatWrapping;
        t.minFilter = THREE.LinearFilter;
        t.generateMipmaps = false;
        t.needsUpdate = true;
        U.uCieloHdr.value = t;
      }),
  );
  const tex = new THREE.TextureLoader();
  pendientes.push(
    tex.loadAsync('/agua/cielo_banda.jpg').then((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = THREE.RepeatWrapping;
      t.minFilter = THREE.LinearFilter;
      t.generateMipmaps = false;
      U.uCieloBanda.value = t;
    }),
  );
  for (const [archivo, clave, srgb] of [
    ['/agua/arena.jpg', 'uArena', true],
    ['/agua/arena_nor.jpg', 'uArenaNor', false],
    ['/agua/roca.jpg', 'uRoca', true],
    ['/agua/roca_nor.jpg', 'uRocaNor', false],
  ] as const) {
    pendientes.push(
      tex.loadAsync(archivo).then((t) => {
        if (srgb) t.colorSpace = THREE.SRGBColorSpace;
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.anisotropy = 8;
        arenaMat.uniforms[clave].value = t;
        if (clave in paredMat.uniforms) paredMat.uniforms[clave].value = t;
      }),
    );
  }

  const gltf = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const peces = crearPeces(escenaAbajo, gltf);
  const loboCargado = gltf.loadAsync('/agua/lobo.glb').catch(() => null);
  pendientes.push(
    Promise.all([gltf.loadAsync('/agua/rock_09.glb'), gltf.loadAsync('/agua/coast_rocks_05.glb')])
      .then(([roca, bloque]) => armarEscollera(roca.scene, bloque.scene))
      .then(() => loboCargado)
      .then((lobo) => {
        if (lobo) ponerLobo(lobo.scene);
      }),
  );

  function normalizar(obj: THREE.Object3D, tamano: number) {
    const caja0 = new THREE.Box3().setFromObject(obj);
    const t = caja0.getSize(new THREE.Vector3());
    obj.scale.setScalar(tamano / Math.max(t.x, t.y, t.z));
    const c = new THREE.Box3().setFromObject(obj);
    obj.position.y -= c.min.y;
    obj.position.x -= (c.min.x + c.max.x) / 2;
    obj.position.z -= (c.min.z + c.max.z) / 2;
    const g = new THREE.Group();
    g.add(obj);
    return g;
  }

  /** Donde se sienta el lobo: la punta de la escollera, a contraluz. */
  const asientoLobo = new THREE.Vector3(-1.9, H0 + 0.95, -9.5);
  const GIRO_ROCA_LOBO = 1.6;

  // Las piedras se dibujan por instancias: cientos de bloques en un puñado de
  // llamadas a la placa.
  const lotes = new Map<string, { proto: THREE.Group; escena: THREE.Scene; matrices: THREE.Matrix4[] }>();
  function poner(proto: THREE.Group, escena: THREE.Scene, pos: THREE.Vector3, rot: THREE.Euler, esc: number) {
    const clave = `${proto.uuid}:${escena.uuid}`;
    if (!lotes.has(clave)) lotes.set(clave, { proto, escena, matrices: [] });
    const m = new THREE.Matrix4().compose(pos, new THREE.Quaternion().setFromEuler(rot), new THREE.Vector3(esc, esc, esc));
    lotes.get(clave)!.matrices.push(m);
  }
  function instanciar() {
    for (const { proto, escena, matrices } of lotes.values()) {
      proto.updateMatrixWorld(true);
      proto.traverse((o) => {
        const malla = o as THREE.Mesh;
        if (!malla.isMesh) return;
        let mat = malla.material as THREE.MeshStandardMaterial;
        if (escena === escenaAbajo) {
          mat = mat.clone();
          mat.color.multiplyScalar(0.75);
        }
        const inst = new THREE.InstancedMesh(malla.geometry, mat, matrices.length);
        matrices.forEach((m, i) => inst.setMatrixAt(i, m.clone().multiply(malla.matrixWorld)));
        inst.instanceMatrix.needsUpdate = true;
        inst.computeBoundingSphere();
        escena.add(inst);
      });
    }
  }

  function armarEscollera(roca: THREE.Object3D, bloque: THREE.Object3D) {
    // La piedra de Poly Haven es una laja: se la compacta para que sea un
    // bloque de escollera, más alto que ancho, sin aristas que salgan en punta.
    roca.scale.multiply(new THREE.Vector3(0.62, 1.9, 0.72));
    const base = normalizar(roca, 1);
    const grande = normalizar(bloque, 1);
    const altoDe = (g: THREE.Group) => new THREE.Box3().setFromObject(g).getSize(new THREE.Vector3()).y;
    const altoBase = altoDe(base);
    const altoGrande = altoDe(grande);
    let semilla = 11;
    const azar = () => {
      semilla = (semilla * 16807) % 2147483647;
      return semilla / 2147483647;
    };

    // Un bloque asoma 'sobra' metros sobre el agua. La misma piedra va a los
    // dos mundos y abajo se apilan otras, cada vez más anchas, hasta la arena.
    const bloqueEn = (proto: THREE.Group, alto: number, x: number, z: number, t: number, sobra: number, giro: number, plano = false) => {
      const rot = plano ? new THREE.Euler(0, giro, 0) : new THREE.Euler((azar() - 0.5) * 0.3, giro, (azar() - 0.5) * 0.3);
      const pos = new THREE.Vector3(x, H0 + sobra - alto * t, z);
      poner(proto, escenaArriba, pos, rot, t);
      // Bajo el agua la piedra es el talud del fondo, que solo sube y nunca
      // tiene salientes; de los bloques baja solo la parte que asoma cerca de
      // la superficie.
      if (proto === base) poner(proto, escenaAbajo, pos, rot, t);
    };

    // La escollera: una sola línea que entra desde la izquierda y termina en la
    // roca del lobo. Bloques parejos, apenas desalineados, como los pone una grúa.
    const desde = new THREE.Vector2(-7.5, -1.5);
    const hasta = new THREE.Vector2(asientoLobo.x - 1.2, asientoLobo.z + 1.5);
    const largo = desde.distanceTo(hasta);
    const n = Math.round(largo / 1.9);
    const giroLinea = Math.atan2(hasta.y - desde.y, hasta.x - desde.x);
    for (let i = 0; i <= n; i++) {
      const k = i / n;
      const x = THREE.MathUtils.lerp(desde.x, hasta.x, k) + (azar() - 0.5) * 0.35;
      const z = THREE.MathUtils.lerp(desde.y, hasta.y, k) + (azar() - 0.5) * 0.35;
      const t = 2.1 + azar() * 0.5;
      bloqueEn(base, altoBase, x, z, t, 0.55 + azar() * 0.35, -giroLinea + (azar() - 0.5) * 0.5);
      // Debajo, un bloque más ancho metido en el agua: ninguno queda en el aire.
      bloqueEn(base, altoBase, x + (azar() - 0.5) * 0.3, z + (azar() - 0.5) * 0.3, t * 1.35, 0.05 + azar() * 0.15, azar() * Math.PI * 2);
      // El talud del lado del mar: bloques más bajos que el agua tapa y destapa.
      if (i % 2 === 0) {
        bloqueEn(base, altoBase, x + 1.3, z + 0.4, t * 0.85, -0.05 + azar() * 0.2, azar() * Math.PI * 2);
      }
    }
    bloqueEn(grande, altoGrande, asientoLobo.x, asientoLobo.z, 5.4, asientoLobo.y - H0, GIRO_ROCA_LOBO, true);
    // Piedras sueltas al filo del pozo, medio enterradas en la arena.
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + azar() * 0.35;
      const r = 1.04 + azar() * 0.12 - bordePozo(a);
      const x = POZO.cx + Math.cos(a) * POZO.rx * r;
      const z = POZO.cz + Math.sin(a) * POZO.rz * r;
      const tr = 0.35 + azar() * 0.55;
      poner(
        base,
        escenaAbajo,
        new THREE.Vector3(x, fondoEn(x, z) - 0.45 - altoBase * tr * 0.4, z),
        new THREE.Euler(azar() * Math.PI * 2, azar() * Math.PI * 2, azar() * Math.PI * 2),
        tr,
      );
    }
    instanciar();
    const ultima = lotes.get(`${grande.uuid}:${escenaArriba.uuid}`);
    if (ultima) {
      const r = grande.clone(true);
      r.applyMatrix4(ultima.matrices[ultima.matrices.length - 1]);
      r.updateMatrixWorld(true);
      // Una laja chata encima de la roca: el asiento del lobo, como las
      // piedras planas que coronan una escollera.
      const cima = mapaDeCima([r]);
      const centro = new THREE.Vector2(asientoLobo.x, asientoLobo.z);
      const alturaCima = cima.mediana(centro, 0.9);
      const losa = base.clone(true);
      const altoLosa = 0.42;
      losa.scale.set(1.7, altoLosa / altoBase, 1.5);
      losa.position.set(asientoLobo.x, alturaCima - altoLosa * 0.45, asientoLobo.z);
      losa.rotation.set(0, GIRO_ROCA_LOBO + 0.4, 0);
      escenaArriba.add(losa);
      losa.updateMatrixWorld(true);
      rocaLobo = losa;
      cimaLobo = mapaDeCima([r, losa]);
    }
  }

  /**
   * Alturas de la cima de unos objetos, en una grilla de 8 cm: el máximo de
   * los vértices que caen en cada celda. Es instantáneo y no traba la página
   * como tirar rayos contra una malla de cien mil triángulos.
   */
  function mapaDeCima(objetos: THREE.Object3D[]) {
    const celda = 0.08;
    const mapa = new Map<string, number>();
    const v = new THREE.Vector3();
    for (const obj of objetos) {
      obj.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        const pos = m.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld);
          const k = `${Math.floor(v.x / celda)}:${Math.floor(v.z / celda)}`;
          const h = mapa.get(k);
          if (h === undefined || v.y > h) mapa.set(k, v.y);
        }
      });
    }
    const en = (x: number, z: number) => {
      const i = Math.floor(x / celda);
      const j = Math.floor(z / celda);
      let h = -Infinity;
      for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) {
        const c = mapa.get(`${i + a}:${j + b}`);
        if (c !== undefined && c > h) h = c;
      }
      return h;
    };
    const mediana = (c: THREE.Vector2, radio: number) => {
      const hs: number[] = [];
      for (let x = -radio; x <= radio; x += celda) for (let z = -radio; z <= radio; z += celda) {
        const h = en(c.x + x, c.y + z);
        if (Number.isFinite(h)) hs.push(h);
      }
      hs.sort((a, b) => a - b);
      return hs.length ? hs[Math.floor(hs.length / 2)] : asientoLobo.y;
    };
    return { en, mediana };
  }
  let cimaLobo: ReturnType<typeof mapaDeCima> | null = null;

  // El lobo es de piedra: una talla propia, gastada por el agua y la sal, con
  // la pose de los lobos de la Rambla. Del modelo se queda la forma y el
  // relieve; el color lo pone la piedra.
  /** La roca del lobo, para apoyarlo sobre su superficie real. */
  let rocaLobo: THREE.Object3D | null = null;

  function ponerLobo(lobo: THREE.Object3D) {
    const g = normalizar(lobo, 1);
    const alto = new THREE.Box3().setFromObject(g).getSize(new THREE.Vector3()).y;
    // Más grande que un lobo de verdad, como un monumento.
    g.scale.setScalar(1.85 / Math.max(alto, 1e-3));
    g.rotation.y = -Math.PI / 2 + 0.25;
    g.position.set(asientoLobo.x, 0, asientoLobo.z);
    g.updateMatrixWorld(true);

    // Los puntos de apoyo: los vértices más bajos del modelo (las cuatro aletas
    // y la panza). Se busca sobre la roca el lugar donde todos caen sobre
    // piedra y con la menor diferencia de altura; ahí se baja hasta que el
    // primero toca. Lo demás queda apenas hundido, nunca en el aire.
    const caja = new THREE.Box3().setFromObject(g);
    const apoyos: THREE.Vector3[] = [];
    const v = new THREE.Vector3();
    g.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const pos = m.geometry.attributes.position;
      const paso = Math.max(1, Math.floor(pos.count / 6000));
      for (let i = 0; i < pos.count; i += paso) {
        v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld);
        if (v.y < caja.min.y + (caja.max.y - caja.min.y) * 0.05) apoyos.push(v.clone());
      }
    });
    let mejor = { dx: 0, dz: 0, alza: asientoLobo.y - caja.min.y, puntaje: Infinity };
    if (cimaLobo && apoyos.length) {
      for (let dx = -0.8; dx <= 0.8; dx += 0.1) for (let dz = -0.8; dz <= 0.8; dz += 0.1) {
        let min = Infinity;
        let max = -Infinity;
        let falta = false;
        for (const p of apoyos) {
          const h = cimaLobo.en(p.x + dx, p.z + dz);
          if (!Number.isFinite(h)) {
            falta = true;
            break;
          }
          min = Math.min(min, h - p.y);
          max = Math.max(max, h - p.y);
        }
        if (falta) continue;
        const puntaje = max - min + Math.hypot(dx, dz) * 0.05;
        if (puntaje < mejor.puntaje) mejor = { dx, dz, alza: min, puntaje };
      }
    }
    g.position.x += mejor.dx;
    g.position.z += mejor.dz;
    g.position.y = mejor.alza - 0.015;

    const piedra = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.52, 0.42, 0.31),
      roughness: 0.78,
      metalness: 0,
      envMapIntensity: 0.55,
    });
    g.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const original = m.material as THREE.MeshStandardMaterial;
      const mat = piedra.clone();
      mat.normalMap = original.normalMap ?? null;
      mat.aoMap = original.aoMap ?? null;
      if (mat.normalMap) mat.normalScale.set(0.7, 0.7);
      m.material = mat;
    });
    escenaArriba.add(g);
  }

  const pmrem = new THREE.PMREMGenerator(renderer);
  function prepararAmbiente() {
    const escenaCielo = new THREE.Scene();
    escenaCielo.add(new THREE.Mesh(new THREE.SphereGeometry(100, 64, 32), cieloMat));
    escenaArriba.environment = pmrem.fromScene(escenaCielo, 0.02).texture;
    escenaArriba.environmentIntensity = 0.45;
  }

  // La carga avisa cuánto lleva: cada pieza que llega suma.
  let hechos = 0;
  const totalCarga = pendientes.length + 1;
  for (const p of pendientes) {
    p.then(() => {
      hechos++;
      if (vivo) opciones.alProgreso?.(hechos / totalCarga);
    });
  }
  Promise.all(pendientes)
    .then(() => {
      if (!vivo) return;
      prepararAmbiente();
      supArriba.visible = false;
      camCubo.update(renderer, escenaArriba);
      supArriba.visible = true;
      cuboListo = true;
    })
    .catch((e) => console.error('[agua] carga', e));

  // ── Puntero: el mouse también empuja el agua cerca de la cámara ───────────
  const puntero = new THREE.Vector3();
  let ultimoX = 0;
  let ultimoT = 0;
  const alPuntero = (e: PointerEvent) => {
    const ahora = performance.now();
    const dt = Math.max((ahora - ultimoT) / 1000, 1 / 240);
    const vx = ultimoT ? (e.clientX - ultimoX) / dt : 0;
    ultimoX = e.clientX;
    ultimoT = ahora;
    puntero.x = CENTRO_LENTE.x + (e.clientX / window.innerWidth - 0.5) * 2.2;
    const empuje = THREE.MathUtils.clamp(vx * (METROS_PANTALLA / window.innerWidth) * 4, -18, 18);
    puntero.z = THREE.MathUtils.lerp(puntero.z, empuje, 0.5);
  };
  window.addEventListener('pointermove', alPuntero, { passive: true });

  // La linterna apunta adonde está el mouse; lo que ilumina se puede tocar.
  const raton = new THREE.Vector2(0, -0.1);
  const rayo = new THREE.Raycaster();
  let encima: ReturnType<typeof elegible> = null;
  let bajoX = 0;
  let bajoY = 0;
  const alMoverRaton = (e: PointerEvent) => {
    raton.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  };
  function elegible() {
    rayo.setFromCamera(raton, camara);
    const lista = contenido.clicables;
    const toque = rayo.intersectObjects(lista.map((c) => c.malla), false)[0];
    return toque ? lista.find((c) => c.malla === toque.object) ?? null : null;
  }
  const alBajar = (e: PointerEvent) => {
    bajoX = e.clientX;
    bajoY = e.clientY;
  };
  const alSoltar = (e: PointerEvent) => {
    if (Math.hypot(e.clientX - bajoX, e.clientY - bajoY) > 6) return;
    const destino = e.target as HTMLElement | null;
    if (destino && destino.closest('a, button, input, textarea, [role="dialog"]')) return;
    if (enMano) return;
    alMoverRaton(e);
    const c = elegible();
    if (c) tomarPlaca(c);
  };

  // ── La placa en la mano ────────────────────────────────────────────────────
  // Se suelta de la pared en un arco, viene al frente de la cámara y queda
  // del tamaño justo para leerla; el fondo se apaga. Al soltarla vuelve a su
  // lugar por el mismo camino.
  type EnMano = { c: (typeof contenido.clicables)[number]; t: number; abre: boolean; giro: number; girada: boolean; restaurar: () => void };
  let enMano: EnMano | null = null;
  const destinoPos = new THREE.Vector3();
  const destinoRot = new THREE.Quaternion();
  const vuelta = new THREE.Quaternion();
  const ejeY = new THREE.Vector3(0, 1, 0);

  function tomarPlaca(c: (typeof contenido.clicables)[number]) {
    if (encima) (encima.malla.material as THREE.ShaderMaterial).uniforms.uEncendida.value = 0;
    encima = null;
    opciones.alPasar(false);
    enMano = { c, t: 0, abre: true, giro: 0, girada: false, restaurar: contenido.nitida(c) };
    c.malla.renderOrder = 10;
    opciones.alInspeccionar({ accion: c.accion, tieneDorso: !!c.pieza.dorso });
  }

  function moverPlaca(dt: number) {
    if (!enMano) return;
    const m = enMano;
    m.t = THREE.MathUtils.clamp(m.t + (m.abre ? dt : -dt) / 0.75, 0, 1);
    m.giro += ((m.girada ? 1 : 0) - m.giro) * (1 - Math.exp(-dt * 7));
    const e = m.t * m.t * (3 - 2 * m.t);
    const { pieza, malla, origen } = m.c;
    // A qué distancia entra entera en pantalla, con aire alrededor.
    const tanV = Math.tan(THREE.MathUtils.degToRad(camara.fov / 2));
    const lejos = Math.max(pieza.alto / (2 * tanV * 0.62), pieza.ancho / (2 * tanV * camara.aspect * 0.78), 0.55);
    const frente = new THREE.Vector3(0, 0, -1).applyQuaternion(camara.quaternion);
    destinoPos.copy(camara.position).addScaledVector(frente, lejos);
    destinoRot.copy(camara.quaternion).multiply(vuelta.setFromAxisAngle(ejeY, Math.PI * m.giro));
    // El arco: primero se despega de la roca hacia el agua, después viene.
    const despega = new THREE.Vector3(0, 0, 1).applyQuaternion(origen.rot).multiplyScalar(Math.sin(Math.PI * e) * 0.5);
    malla.position.lerpVectors(origen.pos, destinoPos, e).add(despega);
    malla.quaternion.slerpQuaternions(origen.rot, destinoRot, e);
    // Un leve vaivén, como algo sostenido bajo el agua.
    malla.position.y += Math.sin(performance.now() / 900) * 0.008 * e;
    malla.updateMatrixWorld();
    const mat = malla.material as THREE.ShaderMaterial;
    mat.uniforms.uInspeccion.value = e;
    compMat.uniforms.uFoco.value = e;
    if (!m.abre && m.t <= 0) {
      malla.position.copy(origen.pos);
      malla.quaternion.copy(origen.rot);
      malla.updateMatrixWorld();
      malla.renderOrder = 0;
      mat.uniforms.uInspeccion.value = 0;
      compMat.uniforms.uFoco.value = 0;
      m.restaurar();
      enMano = null;
      opciones.alInspeccionar(null);
    }
  }
  window.addEventListener('pointermove', alMoverRaton, { passive: true });
  window.addEventListener('pointerdown', alBajar, { passive: true });
  window.addEventListener('pointerup', alSoltar);

  // ── El título sobre la línea del agua ─────────────────────────────────────
  // Se dibuja a la medida de la pantalla: rojo es la letra, verde su sombra.
  let titulo = opciones.titulo;
  let texTitulo: THREE.CanvasTexture | null = null;
  function dibujarTitulo() {
    const w = Math.min(3200, Math.round(canvas.clientWidth * Math.max(2, window.devicePixelRatio || 1)));
    const h = Math.round(w * (canvas.clientHeight / Math.max(canvas.clientWidth, 1)));
    if (w < 2 || h < 2) return;
    const letra = document.createElement('canvas');
    letra.width = w;
    letra.height = h;
    const c = letra.getContext('2d')!;
    // La línea del agua con la cámara quieta, apenas arriba del centro.
    const linea = h * (0.5 - (0.06 / Math.tan(THREE.MathUtils.degToRad(camara.fov / 2))) * 0.5) - h * 0.012;
    const fuenteDe = (italica: boolean | undefined, px: number) =>
      (italica ? 'italic ' : '') + '400 ' + px + "px 'Instrument Serif', Georgia, serif";
    let px = h * 0.2;
    const medir = () =>
      titulo.partes.reduce((a, p, i) => {
        c.font = fuenteDe(p.italica, px);
        return a + c.measureText(p.texto + (i < titulo.partes.length - 1 ? ' ' : '')).width;
      }, 0);
    while (medir() > w * 0.86 && px > 10) px *= 0.96;
    const total = medir();
    c.fillStyle = '#fff';
    c.textBaseline = 'middle';
    let x = (w - total) / 2;
    for (let i = 0; i < titulo.partes.length; i++) {
      const p = titulo.partes[i];
      c.font = fuenteDe(p.italica, px);
      const t = p.texto + (i < titulo.partes.length - 1 ? ' ' : '');
      c.fillText(t, x, linea + px * 0.08);
      x += c.measureText(t).width;
    }
    if (titulo.abajo) {
      c.font = '500 ' + Math.max(14, Math.round(px * 0.17)) + "px 'Instrument Sans', system-ui, sans-serif";
      c.textAlign = 'center';
      c.fillText(titulo.abajo, w / 2, linea + px * 0.95);
      c.textAlign = 'start';
    }
    // El antetítulo lo pone la página en HTML, siempre nítido: acá solo se
    // le dice dónde va, en píxeles de pantalla.
    const k = canvas.clientHeight / h;
    const raiz = canvas.parentElement;
    raiz?.style.setProperty('--ag-ante-y', Math.round((linea - px * 0.95) * k) + 'px');
    raiz?.style.setProperty('--ag-ante-tam', Math.max(12, Math.round(px * 0.13 * k)) + 'px');
    const sombra = document.createElement('canvas');
    sombra.width = w;
    sombra.height = h;
    const d = sombra.getContext('2d')!;
    d.filter = 'blur(' + Math.round(px * 0.12) + 'px)';
    d.drawImage(letra, 0, 0);
    const a = c.getImageData(0, 0, w, h);
    const b = d.getImageData(0, 0, w, h);
    for (let i = 0; i < a.data.length; i += 4) {
      a.data[i] = a.data[i + 3];
      a.data[i + 1] = b.data[i + 3];
      a.data[i + 2] = 0;
      a.data[i + 3] = 255;
    }
    c.putImageData(a, 0, 0);
    texTitulo?.dispose();
    texTitulo = new THREE.CanvasTexture(letra);
    texTitulo.colorSpace = THREE.NoColorSpace;
    texTitulo.minFilter = THREE.LinearFilter;
    texTitulo.generateMipmaps = false;
    compMat.uniforms.uTitulo.value = texTitulo;
  }
  document.fonts.ready.then(() => vivo && dibujarTitulo());

  // ── Tamaño ─────────────────────────────────────────────────────────────────
  // La nitidez se ajusta sola para sostener el ritmo: una placa integrada
  // dibuja con menos píxeles, una dedicada llega hasta 1,5 por píxel de CSS.
  let escala = Math.min(window.devicePixelRatio || 1, 1.25);
  const ESCALA_MIN = 0.72;
  const ESCALA_MAX = Math.min(window.devicePixelRatio || 1, 1.5);
  let cuadros = 0;
  let ventanaMedida = 0;

  function medir() {
    const dpr = escala;
    const w = Math.max(1, canvas.clientWidth);
    const h = Math.max(1, canvas.clientHeight);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camara.aspect = w / h;
    camara.fov = camara.aspect < 1 ? 70 : 52;
    camara.updateProjectionMatrix();
    const pw = Math.round(w * dpr);
    const ph = Math.round(h * dpr);
    for (const rt of [rtAbajo, rtArriba, rtParticulas, rtFinal]) rt.setSize(pw, ph);
    fxaaMat.uniforms.resolution.value.set(1 / pw, 1 / ph);
    for (const rt of rtRayos) rt.setSize(Math.max(1, Math.round(pw / 3)), Math.max(1, Math.round(ph / 3)));
    resolucion.set(pw, ph);
    if (texTitulo) dibujarTitulo();
    matP.uniforms.uEscala.value = ph / (2 * Math.tan(THREE.MathUtils.degToRad(camara.fov / 2)));
  }
  medir();
  const ro = new ResizeObserver(medir);
  ro.observe(canvas);

  // ── La boya ────────────────────────────────────────────────────────────────
  const nivel = resorte(5.5, 0.55);
  const balanceo = resorte(4.2, 0.4);
  nivel.x = H0;
  let nivelAgua = H0;
  let pendiente = 0;

  function leerAgua() {
    if (!sim.puedeLeer) return;
    const fila = sim.leerFila(CENTRO_LENTE, 0.9);
    if (!fila.lista) return;
    const d = fila.datos;
    const n = fila.ancho;
    let suma = 0;
    let sx = 0;
    let sxy = 0;
    let sxx = 0;
    for (let i = 0; i < n; i++) {
      const h = d[i * 4];
      const x = i - (n - 1) / 2;
      suma += h;
      sx += x;
      sxy += x * h;
      sxx += x * x;
    }
    nivelAgua = suma / Math.max(n, 1);
    const b = (sxy - (sx * suma) / n) / Math.max(sxx - (sx * sx) / n, 1e-6);
    pendiente = b / (W / DOMINIO.nx);
  }

  // ── Bucle ──────────────────────────────────────────────────────────────────
  let anterior = performance.now();
  let raf = 0;
  const reloj0 = anterior;
  let ambiental = 0;
  let rompiente = 0;
  let hondoSuave = 0;
  let hondoPrevio = 0;

  function cuadro() {
    raf = requestAnimationFrame(cuadro);
    const ahora = performance.now();
    const dt = Math.min((ahora - anterior) / 1000, 0.1);
    anterior = ahora;
    const t = (ahora - reloj0) / 1000;
    U.uTiempo.value = t;

    // La nitidez se calibra en los primeros segundos. Después solo baja si el
    // ritmo cae de forma sostenida: cambiarla rearma las imágenes intermedias
    // y eso se siente como un tirón en medio del scroll.
    cuadros++;
    ventanaMedida += dt;
    const calibrando = t < 6;
    if (ventanaMedida > (calibrando ? 1.0 : 3.0)) {
      const fps = cuadros / ventanaMedida;
      const previa = escala;
      if (calibrando) {
        if (fps < 52) escala = Math.max(ESCALA_MIN, escala * (fps < 35 ? 0.8 : 0.9));
        else if (fps > 58.5 && escala < ESCALA_MAX) escala = Math.min(ESCALA_MAX, escala * 1.08);
      } else if (fps < 42) {
        escala = Math.max(ESCALA_MIN, escala * 0.9);
      }
      if (Math.abs(escala - previa) > 0.01) medir();
      cuadros = 0;
      ventanaMedida = 0;
    }

    const tiron = sensor.muestrear(dt);
    // El agua siente lo contrario que la carcasa. El mar nunca está quieto: un
    // vaivén leve de fondo.
    const vaiven = 0.35 * Math.sin(t * 0.9) + 0.2 * Math.sin(t * 1.73 + 1.3);
    puntero.z *= Math.exp(-dt * 6);
    sim.avanzar(
      dt,
      { x: -tiron.x * 1.6 + vaiven, y: 0, z: 0.25 * Math.sin(t * 0.61) },
      CENTRO_LENTE,
      puntero,
    );
    leerAgua();

    // La profundidad la manda el scroll, en metros. Cerca de la superficie la
    // cámara flota; a medida que baja, deja de seguir al agua.
    // La rueda del mouse salta de a escalones: la cámara los sigue con una
    // curva corta, sin quedarse atrás de la página.
    const objetivoHondo = Math.max(0, opciones.profundidad());
    hondoSuave += (objetivoHondo - hondoSuave) * (1 - Math.exp(-dt * 14));
    if (Math.abs(objetivoHondo - hondoSuave) < 0.002) hondoSuave = objetivoHondo;
    const hondo = hondoSuave;
    // Con la cámara quieta los rayos se funden entre cuadros y quedan lisos;
    // si se mueve, se recalculan enteros para no arrastrar la imagen vieja.
    const velCam = Math.abs(hondo - hondoPrevio) / Math.max(dt, 1e-3);
    hondoPrevio = hondo;
    rayosMat.uniforms.uMezcla.value = THREE.MathUtils.clamp(0.18 + velCam * 0.6, 0.18, 1);
    const flota = 1 - THREE.MathUtils.smoothstep(hondo, 0, 1.4);
    // La boya: sigue al agua con inercia; un tirón vertical la hunde o la saca.
    const y = nivel.paso(nivelAgua, dt, tiron.y * 0.9 * flota);
    const desvio = THREE.MathUtils.clamp(y - nivelAgua, -0.42, 0.3);
    const roll = balanceo.paso(Math.atan(pendiente) * 0.55, dt, -tiron.x * 0.05);
    const base = THREE.MathUtils.lerp(H0, nivelAgua + desvio, flota);
    camara.position.set(CENTRO_LENTE.x, base - 0.03 - hondo, CENTRO_LENTE.y + LENTE);
    camara.rotation.set(-0.06, 0, THREE.MathUtils.clamp(roll, -0.35, 0.35) * flota);
    camara.updateMatrixWorld();
    U.uFrente.value.set(0, 0, -1).transformDirection(camara.matrixWorld);
    // El título está clavado en la superficie: al bajar, sube con la línea
    // del agua tal como se ve en el domo, y sale de cuadro.
    const tanV = Math.tan(THREE.MathUtils.degToRad(camara.fov / 2));
    compMat.uniforms.uTituloSube.value = (hondo / LENTE / tanV) * 0.5;
    canvas.parentElement?.style.setProperty('--ag-ante-sube', Math.round(compMat.uniforms.uTituloSube.value * canvas.clientHeight) + 'px');
    compMat.uniforms.uTituloOn.value = 1 - THREE.MathUtils.smoothstep(hondo, 1.4, 2.2);

    // La linterna va en la mano, un poco abajo a la derecha de la cámara, y
    // pesa más cuanto más hondo: arriba manda el sol.
    rayo.setFromCamera(raton, camara);
    U.uLinternaPos.value.set(0.22, -0.18, 0).applyMatrix4(camara.matrixWorld);
    U.uLinternaDir.value.lerp(rayo.ray.direction, 1 - Math.exp(-dt * 12)).normalize();
    U.uLinterna.value = THREE.MathUtils.lerp(0.25, 1.4, THREE.MathUtils.smoothstep(hondo, 1.5, 14));
    moverPlaca(dt);
    const ahoraEncima = hondo > 1 && !enMano ? elegible() : null;
    if (ahoraEncima !== encima) {
      if (encima) (encima.malla.material as THREE.ShaderMaterial).uniforms.uEncendida.value = 0;
      if (ahoraEncima) (ahoraEncima.malla.material as THREE.ShaderMaterial).uniforms.uEncendida.value = 1;
      encima = ahoraEncima;
      opciones.alPasar(!!ahoraEncima);
    }
    cieloMat.uniforms.uCentro.value.copy(camara.position);
    cieloMalla.position.copy(camara.position);

    // Burbujas: un tirón fuerte o la cámara hundiéndose las arrastra; si no,
    // de vez en cuando sube alguna del fondo.
    const fuerza = Math.hypot(tiron.x, tiron.y);
    if (fuerza > 6) soltarBurbujas(Math.min(18, Math.floor(fuerza / 4)), true);
    if (nivel.v < -0.6) soltarBurbujas(3, true);
    ambiental += dt;
    if (ambiental > 0.45) {
      ambiental = 0;
      soltarBurbujas(1, false);
    }
    // Donde el agua rompe contra la escollera nacen burbujas todo el tiempo.
    rompiente += dt;
    if (hondo < 6 && rompiente > 0.08) {
      rompiente = 0;
      soltarEnRoca();
    }
    moverBurbujas(dt, t);
    peces.actualizar(dt, t, camara.position, Math.min(1, fuerza / 15));
    matP.uniforms.uOrigen.value.set(camara.position.x, camara.position.y, camara.position.z - caja.z / 2);
    matP.uniforms.uProfCam.value = Math.max(H0 - camara.position.y, 0);

    oleaje.dibujar();
    mosaico.dibujar();
    renderer.setRenderTarget(caustica);
    renderer.setClearColor(0x000000, 1);
    renderer.clear();
    renderer.render(escenaCaustica, camOrto);

    const conAire = camara.position.y + LENTE * 0.75 > H0 - 0.9;
    if (conAire && cuboListo) {
      renderer.setRenderTarget(rtArriba);
      renderer.render(escenaArriba, camara);
    }
    renderer.setRenderTarget(rtAbajo);
    renderer.render(escenaAbajo, camara);
    rayosMat.uniforms.uPrevio.value = rtRayos[0].texture;
    rayosMat.uniforms.uCuadro.value = cuadroN++;
    renderer.setRenderTarget(rtRayos[1]);
    renderer.render(escenaRayos, camOrto);
    rtRayos = [rtRayos[1], rtRayos[0]];
    compMat.uniforms.uImgRayos.value = rtRayos[0].texture;
    renderer.setRenderTarget(rtParticulas);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.render(escenaParticulas, camara);

    if (!avisado && cuboListo && contenidoListo && ++cuadrosListos > 4) {
      avisado = true;
      opciones.alProgreso?.(1);
      opciones.alListo?.();
    }

    renderer.setRenderTarget(rtFinal);
    renderer.render(escenaComp, camOrto);
    renderer.setRenderTarget(null);
    renderer.render(escenaFxaa, camOrto);
  }
  raf = requestAnimationFrame(cuadro);

  return {
    soltarPlaca() {
      if (enMano) enMano.abre = false;
    },
    girarPlaca() {
      if (enMano) enMano.girada = !enMano.girada;
    },
    cambiarTitulo(t: Titulo) {
      titulo = t;
      document.fonts.ready.then(() => vivo && dibujarTitulo());
    },
    cambiarPlan(plan: Plan) {
      planActual = plan;
      document.fonts.ready.then(() => {
        if (vivoContenido) contenido.armar(planActual);
      });
    },
    soltar() {
      vivo = false;
      vivoContenido = false;
      contenido.soltar();
      peces.soltar();
      texTitulo?.dispose();
      window.removeEventListener('pointermove', alMoverRaton);
      window.removeEventListener('pointerdown', alBajar);
      window.removeEventListener('pointerup', alSoltar);
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', alPuntero);
      sensor.soltar();
      sim.soltar();
      mosaico.soltar();
      oleaje.soltar();
      pmrem.dispose();
      for (const r of [cubo, caustica, rtAbajo, rtArriba, rtParticulas, ...rtRayos, rtFinal]) r.dispose();
      for (const e of [escenaArriba, escenaAbajo, escenaCaustica, escenaParticulas, escenaRayos, escenaComp]) {
        e.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh || (o as THREE.Points).isPoints) {
            m.geometry.dispose();
            const mats = Array.isArray(m.material) ? m.material : [m.material];
            mats.forEach((x) => x.dispose());
          }
        });
      }
      renderer.dispose();
    },
  };
}
