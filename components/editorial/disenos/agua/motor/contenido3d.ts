import * as THREE from 'three';
import { DOMINIO } from './simulacion';
import { POZO, bordePozo } from './glsl';
import { FRAG_PLACA, FRAG_TALLA, VERT_PLACA, VERT_TALLA } from './shaders';
import type { Accion, Placa, Plan } from '../contenido';

// ─────────────────────────────────────────────────────────────────────────────
// El plan del contenido hecho escena: las tallas son parches que copian la
// pared y se hunden donde hay letra; las placas, bronce abulonado a la roca.
// Todo se ubica sobre el frente del pozo, a su profundidad.
// ─────────────────────────────────────────────────────────────────────────────

const H0 = DOMINIO.profundidad;
/** Cuántos píxeles de textura por metro de placa. */
const PX_METRO = 820;
const SEPARA = 0.13;

/** Ángulo del contorno del pozo que cae en una x, del lado de enfrente. */
function anguloEn(x: number) {
  let a = -Math.acos(THREE.MathUtils.clamp((x - POZO.cx) / POZO.rx, -1, 1));
  for (let i = 0; i < 3; i++) {
    const r = 1 - bordePozo(a);
    a = -Math.acos(THREE.MathUtils.clamp((x - POZO.cx) / (POZO.rx * r), -1, 1));
  }
  return a;
}

/** Punto de la pared y la dirección hacia adentro del pozo. */
function enPared(x: number, y: number) {
  const a = anguloEn(x);
  const r = 1 - bordePozo(a);
  const p = new THREE.Vector3(POZO.cx + Math.cos(a) * POZO.rx * r, y, POZO.cz + Math.sin(a) * POZO.rz * r);
  const adentro = new THREE.Vector3(-Math.cos(a) / POZO.rx, 0, -Math.sin(a) / POZO.rz).normalize();
  return { a, p, adentro };
}

/** Letras blancas sobre negro: rojo la letra nítida, verde la difusa del bisel. */
function textura(ancho: number, alto: number, dibujar: (c: CanvasRenderingContext2D, w: number, h: number) => void, bisel: number) {
  const k = Math.min(1, 2048 / Math.max(ancho, alto));
  const w = Math.round(ancho * k);
  const h = Math.round(alto * k);
  const nitido = document.createElement('canvas');
  nitido.width = w;
  nitido.height = h;
  const c = nitido.getContext('2d')!;
  c.fillStyle = '#000';
  c.fillRect(0, 0, w, h);
  dibujar(c, w, h);
  const difuso = document.createElement('canvas');
  difuso.width = w;
  difuso.height = h;
  const d = difuso.getContext('2d')!;
  d.filter = `blur(${bisel}px)`;
  d.drawImage(nitido, 0, 0);
  const a = c.getImageData(0, 0, w, h);
  const b = d.getImageData(0, 0, w, h);
  for (let i = 0; i < a.data.length; i += 4) {
    a.data[i + 1] = b.data[i];
    a.data[i + 2] = 0;
    a.data[i + 3] = 255;
  }
  c.putImageData(a, 0, 0);
  const t = new THREE.CanvasTexture(nitido);
  t.anisotropy = 8;
  t.colorSpace = THREE.NoColorSpace;
  return t;
}

export interface Clicable {
  malla: THREE.Mesh;
  pieza: Placa;
  accion?: Accion;
  /** Dónde estaba en la pared, para devolverla. */
  origen: { pos: THREE.Vector3; rot: THREE.Quaternion };
}

export function crearContenido(
  escena: THREE.Scene,
  U: Record<string, THREE.IUniform>,
  roca: { value: THREE.Texture | null },
  rocaNor: { value: THREE.Texture | null },
) {
  const grupo = new THREE.Group();
  escena.add(grupo);
  let clicables: Clicable[] = [];
  const recursos: { dispose: () => void }[] = [];
  const tornillos = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.016, 10, 6),
    new THREE.MeshStandardMaterial({ color: 0x6b4a26, roughness: 0.45, metalness: 0.8 }),
    400,
  );
  tornillos.count = 0;
  escena.add(tornillos);

  function vaciar() {
    for (const r of recursos) r.dispose();
    recursos.length = 0;
    grupo.clear();
    clicables = [];
    tornillos.count = 0;
  }

  function armar(plan: Plan) {
    vaciar();
    const medidor = document.createElement('canvas').getContext('2d')!;
    let nTornillos = 0;
    const m4 = new THREE.Matrix4();

    for (const pieza of plan.piezas) {
      const y = H0 - pieza.prof;

      if (pieza.tipo === 'talla') {
        // El ancho de la talla sale de medir el texto con la tipografía real.
        const px = 300;
        medidor.font = `${pieza.italica ? 'italic ' : ''}400 ${px}px 'Instrument Serif', Georgia, serif`;
        const anchoPx = Math.max(...pieza.lineas.map((l) => medidor.measureText(l).width));
        const escala = pieza.alto / (px * 0.7);
        const anchoM = anchoPx * escala + 0.4;
        const altoM = pieza.lineas.length * pieza.alto * 1.45 + 0.3;
        const tex = textura(
          anchoM * 400,
          altoM * 400,
          (c, w, h) => {
            c.fillStyle = '#fff';
            c.textAlign = 'center';
            c.textBaseline = 'middle';
            const fuente = (h / altoM) * (pieza.alto / 0.7);
            c.font = `${pieza.italica ? 'italic ' : ''}400 ${fuente}px 'Instrument Serif', Georgia, serif`;
            const paso = (h - 0.3 * (h / altoM)) / pieza.lineas.length;
            pieza.lineas.forEach((l, i) => c.fillText(l, w / 2, 0.15 * (h / altoM) + paso * (i + 0.5)));
          },
          5,
        );
        const a0 = anguloEn(pieza.x - anchoM / 2);
        const a1 = anguloEn(pieza.x + anchoM / 2);
        const geo = new THREE.PlaneGeometry(1, 1, 48, 12);
        const mat = new THREE.ShaderMaterial({
          vertexShader: VERT_TALLA,
          fragmentShader: FRAG_TALLA,
          uniforms: {
            ...U,
            uRoca: roca,
            uRocaNor: rocaNor,
            uTexto: { value: tex },
            uRango: { value: new THREE.Vector4(a0, a1, y + altoM / 2, y - altoM / 2) },
          },
          side: THREE.DoubleSide,
        });
        const malla = new THREE.Mesh(geo, mat);
        malla.frustumCulled = false;
        grupo.add(malla);
        recursos.push(geo, mat, tex);
        continue;
      }

      const { p, adentro } = enPared(pieza.x, y);
      const tex = textura(pieza.ancho * PX_METRO, pieza.alto * PX_METRO, pieza.dibujar, 1.6);
      const dorso = pieza.dorso ? textura(pieza.ancho * PX_METRO, pieza.alto * PX_METRO, pieza.dorso, 1.6) : null;
      const geo = new THREE.BoxGeometry(pieza.ancho, pieza.alto, 0.022);
      const mat = new THREE.ShaderMaterial({
        vertexShader: VERT_PLACA,
        fragmentShader: FRAG_PLACA,
        uniforms: {
          ...U,
          uTexto: { value: tex },
          uDorso: { value: dorso ?? tex },
          uTieneDorso: { value: dorso ? 1 : 0 },
          uEncendida: { value: 0 },
          uInspeccion: { value: 0 },
        },
      });
      if (dorso) recursos.push(dorso);
      const malla = new THREE.Mesh(geo, mat);
      malla.position.copy(p).addScaledVector(adentro, SEPARA);
      malla.rotation.y = Math.atan2(adentro.x, adentro.z);
      malla.updateMatrixWorld();
      grupo.add(malla);
      recursos.push(geo, mat, tex);
      // Todas las placas se pueden sacar de la pared y mirar de cerca.
      clicables.push({ malla, pieza, accion: pieza.accion, origen: { pos: malla.position.clone(), rot: malla.quaternion.clone() } });

      // Cuatro bulones en las esquinas, contra la roca.
      const mx = pieza.ancho / 2 - Math.min(0.05, pieza.ancho * 0.08);
      const my = pieza.alto / 2 - Math.min(0.05, pieza.alto * 0.12);
      for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        if (nTornillos >= 400) break;
        const local = new THREE.Vector3(sx * mx, sy * my, 0.012);
        m4.makeTranslation(local.applyMatrix4(malla.matrixWorld));
        tornillos.setMatrixAt(nTornillos++, m4);
      }
    }
    tornillos.count = nTornillos;
    tornillos.instanceMatrix.needsUpdate = true;
  }

  /**
   * Para mirarla en la mano, la placa se redibuja al doble de resolución.
   * Devuelve cómo dejarla como estaba.
   */
  function nitida(c: Clicable) {
    const mat = c.malla.material as THREE.ShaderMaterial;
    const antes = { frente: mat.uniforms.uTexto.value, dorso: mat.uniforms.uDorso.value };
    const frente = textura(c.pieza.ancho * PX_METRO * 2, c.pieza.alto * PX_METRO * 2, c.pieza.dibujar, 2.4);
    const dorso = c.pieza.dorso ? textura(c.pieza.ancho * PX_METRO * 2, c.pieza.alto * PX_METRO * 2, c.pieza.dorso, 2.4) : frente;
    mat.uniforms.uTexto.value = frente;
    mat.uniforms.uDorso.value = dorso;
    return () => {
      mat.uniforms.uTexto.value = antes.frente;
      mat.uniforms.uDorso.value = antes.dorso;
      frente.dispose();
      if (dorso !== frente) dorso.dispose();
    };
  }

  return {
    armar,
    nitida,
    get clicables() {
      return clicables;
    },
    soltar() {
      vaciar();
      tornillos.geometry.dispose();
      (tornillos.material as THREE.Material).dispose();
      escena.remove(grupo, tornillos);
    },
  };
}
