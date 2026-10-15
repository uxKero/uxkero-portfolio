import * as THREE from 'three';
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { POZO, fondoEn } from './glsl';

// ─────────────────────────────────────────────────────────────────────────────
// Peces de verdad: escaneos de una lisa (Mugil cephalus, de la costa de Mar
// del Plata) para el cardumen y de una corvina para los grandes, los dos CC0.
//
// Varios grupos chicos y algunos sueltos, cada uno con su rumbo: eligen un
// destino al azar (sobre el banco cerca de la superficie, bajando al pozo o
// adentro, a cualquier profundidad), van hacia él con giros suaves y, al
// llegar, eligen otro. Un par de grupos andan cerca de la profundidad de la
// cámara, para que siempre haya alguno a la vista. Un tirón de la ventana los
// espanta. El nado es una onda que recorre el cuerpo, más fuerte en la cola.
// ─────────────────────────────────────────────────────────────────────────────

/** Tamaño de cada grupo: los de 1 son peces sueltos. */
const GRUPOS = [6, 5, 4, 4, 3, 3, 1, 1, 1];
const N = GRUPOS.reduce((a, b) => a + b, 0);
const GRANDES = 2;
const H0 = 2.4;

interface Pez {
  p: THREE.Vector3;
  v: THREE.Vector3;
  fase: number;
  tam: number;
  grupo: number;
  /** Lugar del pez dentro de su grupo. */
  lugar: THREE.Vector3;
}

interface Grupo {
  c: THREE.Vector3;
  v: THREE.Vector3;
  destino: THREE.Vector3;
  reloj: number;
  /** Anda cerca de la profundidad de la cámara. */
  cerca: boolean;
  rapidez: number;
}

/** Un lugar al azar donde un pez puede querer ir. */
function destinoAlAzar(destino: THREE.Vector3, camaraY: number, cerca: boolean) {
  const r = Math.random();
  if (!cerca && r < 0.35) {
    // Sobre el banco de arena, cerca de la superficie.
    const x = -6 + Math.random() * 12;
    const z = -12 + Math.random() * 7;
    const piso = fondoEn(x, z) + 0.5;
    destino.set(x, piso + Math.random() * Math.max(0.2, H0 - 0.5 - piso), z);
    return destino;
  }
  // En el pozo: un punto de la elipse, con margen de la pared.
  const ang = Math.random() * Math.PI * 2;
  const rad = Math.sqrt(Math.random()) * 0.72;
  const y = cerca ? camaraY + (Math.random() - 0.5) * 7 : 1.5 - Math.random() * 38;
  destino.set(POZO.cx + Math.cos(ang) * POZO.rx * rad, Math.min(y, H0 - 0.5), POZO.cz + Math.sin(ang) * POZO.rz * rad);
  return destino;
}

/** Agrega la onda de nado al material estándar: la cola (−z) es la que más se mueve. */
function nadador(mat: THREE.MeshStandardMaterial, tiempo: { value: number }, amplitud: number) {
  mat.onBeforeCompile = (s) => {
    s.uniforms.uTiempo = tiempo;
    s.vertexShader = s.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uTiempo;
        attribute float aFase;
        attribute float aFrec;`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float cola = smoothstep(0.35, -0.5, transformed.z);
        transformed.x += sin(transformed.z * 7.0 - uTiempo * aFrec + aFase) * ${amplitud.toFixed(3)} * (0.15 + cola);`,
      );
  };
}

export function crearPeces(escena: THREE.Scene, gltf: GLTFLoader) {
  const tiempo = { value: 0 };
  let cardumen: THREE.InstancedMesh | null = null;
  const grandes: { malla: THREE.Group; ang: number; radio: number; prof: number; vel: number }[] = [];
  const peces: Pez[] = [];
  const grupos: Grupo[] = [];
  let vivo = true;

  const primeraMalla = (o: THREE.Object3D) => {
    let m: THREE.Mesh | null = null;
    o.traverse((x) => {
      if (!m && (x as THREE.Mesh).isMesh) m = x as THREE.Mesh;
    });
    return m as THREE.Mesh | null;
  };

  gltf.loadAsync('/agua/peces/lisa.glb').then((g) => {
    if (!vivo) return;
    const fuente = primeraMalla(g.scene);
    if (!fuente) return;
    fuente.updateMatrixWorld(true);
    const geo = fuente.geometry.clone().applyMatrix4(fuente.matrixWorld);
    // Cada pez con su ritmo de cola: nadan juntos pero no iguales.
    const fases = new Float32Array(N);
    const frecs = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      fases[i] = Math.random() * Math.PI * 2;
      frecs[i] = 6.5 + Math.random() * 5;
    }
    geo.setAttribute('aFase', new THREE.InstancedBufferAttribute(fases, 1));
    geo.setAttribute('aFrec', new THREE.InstancedBufferAttribute(frecs, 1));
    const mat = (fuente.material as THREE.MeshStandardMaterial).clone();
    mat.metalness = 0.35;
    mat.roughness = 0.4;
    nadador(mat, tiempo, 0.05);
    cardumen = new THREE.InstancedMesh(geo, mat, N);
    cardumen.frustumCulled = false;
    let k = 0;
    GRUPOS.forEach((n, gi) => {
      const g: Grupo = {
        c: destinoAlAzar(new THREE.Vector3(), 0, gi < 2),
        v: new THREE.Vector3(),
        destino: new THREE.Vector3(),
        reloj: 0,
        cerca: gi < 2,
        rapidez: 0.35 + Math.random() * 0.3,
      };
      destinoAlAzar(g.destino, 0, g.cerca);
      grupos.push(g);
      for (let j = 0; j < n; j++, k++) {
        const lugar = new THREE.Vector3((Math.random() - 0.5) * 1.1, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 1.1);
        peces.push({
          p: g.c.clone().add(lugar),
          v: new THREE.Vector3(),
          fase: fases[k],
          tam: n === 1 ? 0.34 + Math.random() * 0.08 : 0.24 + Math.random() * 0.08,
          grupo: gi,
          lugar,
        });
      }
    });
    escena.add(cardumen);
  });

  gltf.loadAsync('/agua/peces/corvina.glb').then((g) => {
    if (!vivo) return;
    for (let i = 0; i < GRANDES; i++) {
      const pez = g.scene.clone(true);
      pez.traverse((x) => {
        const m = x as THREE.Mesh;
        if (m.isMesh) {
          const mat = (m.material as THREE.MeshStandardMaterial).clone();
          mat.metalness = 0.3;
          nadador(mat, tiempo, 0.07);
          m.material = mat;
          m.geometry = m.geometry.clone();
          const n = m.geometry.attributes.position.count;
          m.geometry.setAttribute('aFase', new THREE.BufferAttribute(new Float32Array(n).fill(i * 2.1), 1));
          m.geometry.setAttribute('aFrec', new THREE.BufferAttribute(new Float32Array(n).fill(5 + i), 1));
        }
      });
      const caja = new THREE.Group();
      caja.add(pez);
      caja.scale.setScalar(0.55 + i * 0.15);
      escena.add(caja);
      grandes.push({ malla: caja, ang: i * Math.PI, radio: 3.2 + i * 1.1, prof: 0, vel: 0.13 + i * 0.04 });
    }
  });

  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const adelante = new THREE.Vector3(0, 0, 1);
  const tmp = new THREE.Vector3();
  const sep = new THREE.Vector3();
  const ali = new THREE.Vector3();
  const coh = new THREE.Vector3();
  const escala = new THREE.Vector3();
  const rumbos = Array.from({ length: N }, () => new THREE.Quaternion());

  /** Mantiene un punto adentro del pozo, con margen. */
  function adentro(p: THREE.Vector3, margen: number) {
    const dx = (p.x - POZO.cx) / (POZO.rx - margen);
    const dz = (p.z - POZO.cz) / (POZO.rz - margen);
    const r = Math.hypot(dx, dz);
    return r;
  }

  function actualizar(dt: number, t: number, camara: THREE.Vector3, susto: number) {
    tiempo.value = t;
    const paso = Math.min(dt, 1 / 30);

    // Cada grupo va hacia su destino con giros suaves; al llegar, elige otro.
    for (const g of grupos) {
      g.reloj += paso;
      if (g.c.distanceTo(g.destino) < 0.8 || g.reloj > 14 + Math.random() * 10) {
        destinoAlAzar(g.destino, camara.y, g.cerca);
        g.reloj = 0;
      }
      // Los que andan cerca de la cámara cambian de rumbo si ella se aleja mucho.
      if (g.cerca && Math.abs(g.destino.y - camara.y) > 6) destinoAlAzar(g.destino, camara.y, true);
      const quiere = tmp.subVectors(g.destino, g.c);
      const rapidez = g.rapidez * (1 + susto * 2) * (g.cerca ? 1 + Math.min(Math.abs(g.c.y - camara.y) / 6, 2) : 1);
      quiere.setLength(rapidez);
      g.v.lerp(quiere, 1 - Math.exp(-paso * 0.6));
      g.c.addScaledVector(g.v, paso);
    }

    if (cardumen) {
      for (let i = 0; i < peces.length; i++) {
        const a = peces[i];
        const g = grupos[a.grupo];
        sep.set(0, 0, 0);
        for (let j = 0; j < peces.length; j++) {
          if (i === j) continue;
          const d = a.p.distanceTo(peces[j].p);
          if (d < 0.35) sep.add(tmp.subVectors(a.p, peces[j].p).multiplyScalar(1 / Math.max(d * d, 0.02)));
        }
        // Cada pez busca su lugar en el grupo, pero ese lugar le va cambiando
        // solo a él: se adelanta, se atrasa, sube y baja a su ritmo.
        coh.copy(a.lugar);
        coh.x += Math.sin(t * (0.37 + a.fase * 0.05) + a.fase * 3.1) * 0.35;
        coh.y += Math.sin(t * (0.29 + a.fase * 0.04) + a.fase * 1.7) * 0.18;
        coh.z += Math.cos(t * (0.33 + a.fase * 0.06) + a.fase * 2.3) * 0.4;
        coh.add(g.c);
        const acel = new THREE.Vector3().subVectors(coh, a.p).multiplyScalar(1.2);
        acel.addScaledVector(tmp.subVectors(g.v, a.v), 0.8);
        acel.addScaledVector(sep, 0.04);
        // Nunca contra la pared del pozo cuando están adentro.
        if (a.p.y < -1.6 && adentro(a.p, 1.0) > 1) acel.addScaledVector(tmp.set(POZO.cx - a.p.x, 0, POZO.cz - a.p.z).normalize(), 2.5);
        const aCam = tmp.subVectors(a.p, camara);
        const dCam = aCam.length();
        if (dCam < 1.3) acel.addScaledVector(aCam.normalize(), (1.3 - dCam) * 3 + susto * 4);
        a.v.addScaledVector(acel, paso);
        const vel = a.v.length();
        const max = g.v.length() * 1.6 + 0.3 + susto * 1.5;
        if (vel > max) a.v.multiplyScalar(max / vel);
        a.p.addScaledVector(a.v, paso);
        // Fuera del pozo hay arena: nunca la atraviesan, ni salen del agua.
        const dx = (a.p.x - POZO.cx) / POZO.rx;
        const dz = (a.p.z - POZO.cz) / POZO.rz;
        if (Math.hypot(dx, dz) > 0.98) {
          const piso = fondoEn(a.p.x, a.p.z) + 0.25 + a.tam * 0.4;
          if (a.p.y < piso) {
            a.p.y = piso;
            if (a.v.y < 0) a.v.y *= -0.3;
          }
        }
        if (a.p.y > H0 - 0.25) {
          a.p.y = H0 - 0.25;
          if (a.v.y > 0) a.v.y = 0;
        }

        // El cuerpo mira hacia donde va, sin girar de golpe.
        if (a.v.lengthSq() > 1e-4) {
          q.setFromUnitVectors(adelante, ali.copy(a.v).normalize());
          rumbos[i].slerp(q, 1 - Math.exp(-paso * 4));
        }
        escala.setScalar(a.tam);
        m4.compose(a.p, rumbos[i], escala);
        cardumen.setMatrixAt(i, m4);
      }
      cardumen.instanceMatrix.needsUpdate = true;
    }

    // Los grandes dan vueltas lentas alrededor del pozo, más abajo que la cámara.
    for (const g of grandes) {
      g.ang += g.vel * paso;
      const x = POZO.cx + Math.cos(g.ang) * g.radio;
      const z = POZO.cz - 2.2 + Math.sin(g.ang) * g.radio * 0.55;
      const y = camara.y - 1.2 - g.radio * 0.2 + Math.sin(t * 0.3 + g.ang) * 0.3;
      const antes = g.malla.position.clone();
      g.malla.position.set(x, y, z);
      if (antes.lengthSq() > 0) {
        const dir = tmp.subVectors(g.malla.position, antes);
        if (dir.lengthSq() > 1e-8) g.malla.quaternion.setFromUnitVectors(adelante, dir.normalize());
      }
    }
  }

  function soltar() {
    vivo = false;
    if (cardumen) {
      escena.remove(cardumen);
      cardumen.geometry.dispose();
      (cardumen.material as THREE.Material).dispose();
    }
    for (const g of grandes) escena.remove(g.malla);
  }

  return { actualizar, soltar };
}
