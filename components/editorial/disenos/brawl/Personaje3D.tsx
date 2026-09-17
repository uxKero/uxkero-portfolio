import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

// ─────────────────────────────────────────────────────────────────────────────
// El personaje del lobby, en 3D de verdad. Se gira arrastrando, con inercia;
// quieto, sigue apenas al puntero con el cuerpo y respira. Un clic sin arrastre
// lo hace saltar. La sombra vive dentro de la escena, apoyada en el piso y
// debajo del modelo: nunca puede quedar encima de los pies. Mientras baja el
// modelo se ve la imagen plana.
// ─────────────────────────────────────────────────────────────────────────────

const MODELO = '/brawl/alan-brawler.glb';
const ALTO = 2;
// Tripo entrega el modelo mirando hacia un costado: medido, el frente está a -90°.
const FRENTE = -Math.PI / 2;
// En reposo queda apenas girado, como en la ilustración.
const REPOSO = FRENTE + 0.32;

interface Control {
  angulo: number;
  velocidad: number;
  arrastrando: boolean;
  ultimoArrastre: number;
  punteroX: number;
  salto: number;
}

/**
 * Sombra de mancha, la de los juegos del género: un óvalo difuminado en el piso.
 * Se dibuja antes que el modelo y sin escribir profundidad, así que nunca tapa
 * los pies. Cuando salta, se achica y se aclara.
 */
const Sombra: React.FC<{ control: React.MutableRefObject<Control> }> = ({ control }) => {
  const malla = useRef<THREE.Mesh>(null);
  const textura = useMemo(() => {
    const lienzo = document.createElement('canvas');
    lienzo.width = lienzo.height = 128;
    const ctx = lienzo.getContext('2d')!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(1,30,74,0.75)');
    g.addColorStop(0.55, 'rgba(1,30,74,0.45)');
    g.addColorStop(1, 'rgba(1,30,74,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(lienzo);
  }, []);

  useFrame(() => {
    const m = malla.current;
    if (!m) return;
    const altura = Math.sin(control.current.salto * Math.PI);
    const k = 1 - altura * 0.35;
    m.scale.set(k, k, 1);
    (m.material as THREE.MeshBasicMaterial).opacity = 1 - altura * 0.5;
  });

  return (
    <mesh ref={malla} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} renderOrder={-1}>
      <planeGeometry args={[1.5, 0.95]} />
      <meshBasicMaterial map={textura} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
};

const Modelo: React.FC<{ control: React.MutableRefObject<Control> }> = ({ control }) => {
  const { scene } = useGLTF(MODELO, false, true);
  const grupo = useRef<THREE.Group>(null);

  // Se normaliza cualquier malla: alto fijo, centrada y con los pies en el piso.
  const pieza = useMemo(() => {
    const copia = scene.clone(true);
    const caja = new THREE.Box3().setFromObject(copia);
    const tam = caja.getSize(new THREE.Vector3());
    const escala = ALTO / Math.max(tam.y, 0.0001);
    copia.scale.setScalar(escala);
    const caja2 = new THREE.Box3().setFromObject(copia);
    const centro = caja2.getCenter(new THREE.Vector3());
    copia.position.x -= centro.x;
    copia.position.z -= centro.z;
    copia.position.y -= caja2.min.y;
    copia.traverse((o) => {
      const malla = o as THREE.Mesh;
      if (malla.isMesh) {
        malla.castShadow = false;
        malla.receiveShadow = false;
      }
    });
    return copia;
  }, [scene]);

  useFrame((estado, dt) => {
    const g = grupo.current;
    if (!g) return;
    const c = control.current;
    const paso = Math.min(dt, 0.05);

    if (!c.arrastrando) {
      c.angulo += c.velocidad * paso;
      c.velocidad *= Math.pow(0.04, paso);
      // Un rato después de soltarlo vuelve a mirar hacia el puntero.
      if (performance.now() / 1000 - c.ultimoArrastre > 2.2 && Math.abs(c.velocidad) < 0.2) {
        const vueltas = Math.round((c.angulo - REPOSO) / (Math.PI * 2)) * Math.PI * 2;
        const objetivo = vueltas + REPOSO + c.punteroX * 0.5;
        c.angulo += (objetivo - c.angulo) * Math.min(1, paso * 2.5);
      }
    }

    c.salto = Math.max(0, c.salto - paso * 2.4);
    const s = c.salto;
    const alturaSalto = Math.sin(s * Math.PI) * 0.45;
    const t = estado.clock.elapsedTime;
    const respiro = Math.sin(t * 2.2) * 0.012;

    g.rotation.y = c.angulo;
    g.position.y = alturaSalto;
    // Aplastar y estirar: el salto arranca agachado y cae con rebote.
    const estiron = s > 0 ? 1 + Math.sin(s * Math.PI * 2) * 0.06 : 1 + respiro;
    g.scale.set(1 / Math.sqrt(estiron), estiron, 1 / Math.sqrt(estiron));
  });

  return (
    <group ref={grupo}>
      <primitive object={pieza} />
    </group>
  );
};

const Personaje3D: React.FC<{ reemplazo: React.ReactNode }> = ({ reemplazo }) => {
  const caja = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [listo, setListo] = useState(false);
  const control = useRef<Control>({
    angulo: REPOSO,
    velocidad: 0,
    arrastrando: false,
    ultimoArrastre: -10,
    punteroX: 0,
    salto: 0,
  });

  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);

    const alMover = (ev: PointerEvent) => {
      control.current.punteroX = (ev.clientX / window.innerWidth) * 2 - 1;
    };
    window.addEventListener('pointermove', alMover, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('pointermove', alMover);
    };
  }, []);

  // Arrastre horizontal para girar. El vertical se deja al scroll de la página.
  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    let x0 = 0;
    let xPrevio = 0;
    let tPrevio = 0;
    let movido = 0;

    const bajar = (ev: PointerEvent) => {
      x0 = xPrevio = ev.clientX;
      tPrevio = performance.now();
      movido = 0;
      control.current.arrastrando = true;
      control.current.velocidad = 0;
      el.setPointerCapture(ev.pointerId);
      el.classList.add('is-agarrado');
    };
    const mover = (ev: PointerEvent) => {
      if (!control.current.arrastrando) return;
      const ahora = performance.now();
      const dx = ev.clientX - xPrevio;
      movido = Math.max(movido, Math.abs(ev.clientX - x0));
      control.current.angulo += dx * 0.012;
      const dtt = Math.max(1, ahora - tPrevio) / 1000;
      control.current.velocidad = (dx * 0.012) / dtt;
      xPrevio = ev.clientX;
      tPrevio = ahora;
    };
    const soltar = (ev: PointerEvent) => {
      if (!control.current.arrastrando) return;
      control.current.arrastrando = false;
      control.current.ultimoArrastre = performance.now() / 1000;
      el.classList.remove('is-agarrado');
      if (el.hasPointerCapture(ev.pointerId)) el.releasePointerCapture(ev.pointerId);
      if (movido < 5) {
        control.current.velocidad = 0;
        if (control.current.salto === 0) control.current.salto = 1;
      }
    };

    el.addEventListener('pointerdown', bajar);
    el.addEventListener('pointermove', mover);
    el.addEventListener('pointerup', soltar);
    el.addEventListener('pointercancel', soltar);
    return () => {
      el.removeEventListener('pointerdown', bajar);
      el.removeEventListener('pointermove', mover);
      el.removeEventListener('pointerup', soltar);
      el.removeEventListener('pointercancel', soltar);
    };
  }, []);

  return (
    <div
      ref={caja}
      className={`bw-personaje3d${listo ? ' is-listo' : ''}`}
      role="img"
      aria-label="Alan Ponce, personaje 3D"
    >
      {!listo && <div className="bw-personaje3d__reemplazo">{reemplazo}</div>}
      <Canvas
        className="bw-personaje3d__lienzo"
        frameloop={visible ? 'always' : 'never'}
        dpr={[1, 2]}
        // Cámara apenas desde arriba: de frente, el piso se ve de canto y la sombra desaparece.
        camera={{ position: [0, 2.05, 5.1], fov: 25 }}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ camera }) => camera.lookAt(0, 0.92, 0)}
      >
        <ambientLight intensity={1.35} />
        <hemisphereLight args={['#bff6ff', '#0249bb', 0.9]} />
        <directionalLight position={[3, 5, 4]} intensity={2.2} />
        <directionalLight position={[-4, 3, -3]} intensity={1.6} color="#3cf2ff" />
        <Suspense fallback={null}>
          <Modelo control={control} />
          <Avisar alCargar={() => setListo(true)} />
        </Suspense>
        {/* La sombra va en el piso de la escena, debajo del modelo. */}
        <Sombra control={control} />
      </Canvas>
    </div>
  );
};

/** Avisa cuando el modelo terminó de montarse dentro del Suspense. */
const Avisar: React.FC<{ alCargar: () => void }> = ({ alCargar }) => {
  useEffect(() => {
    alCargar();
  }, [alCargar]);
  return null;
};

export default Personaje3D;
