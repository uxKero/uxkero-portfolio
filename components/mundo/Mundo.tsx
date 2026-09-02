import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera, PerspectiveCamera, PointerLockControls } from '@react-three/drei';
import { CONTENIDO, PROYECTOS, LOGROS, IDENTIDAD, type Ficha } from './mundo-data';

// ─────────────────────────────────────────────────────────────────────────────
// El mundo, en dos modos: mapa isométrico y primera persona.
//
// La geometría NO vive acá: la genera design/mundo/construir_mundo.py y se carga
// desde /mundo/mundo.json. Ese script saca las texturas reales de Minecraft y las
// construcciones oficiales de Mojang del jar del juego, arma la isla con costa de
// ruido y relieve, y descarta los bloques que nadie puede ver.
// ─────────────────────────────────────────────────────────────────────────────

interface Material { id: string; tex: [string, string, string]; }
interface MundoData {
  lado: number;
  materiales: Material[];
  bloques: [number, number, number, number, number][];
  cajas: Record<string, [number, number, number, number, number, number]>;
  spawn: [number, number, number];
}

const TRANSPARENTES = new Set(['agua', 'vidrio', 'hojas', 'hojas_cerezo', 'farol']);
const BRILLAN = new Set(['farol', 'oro']);
const CAIDA = 30;
const DUR = 0.45;
const suave = (t: number) => 1 - Math.pow(1 - t, 3);

const usarTextura = (nombre: string) => {
  const tex = useLoader(THREE.TextureLoader, `/mundo/${nombre}.png`);
  return useMemo(() => {
    const t = tex.clone();
    t.magFilter = THREE.NearestFilter;                 // un pixel se ve como un pixel
    t.minFilter = THREE.NearestMipmapNearestFilter;
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.needsUpdate = true;
    return t;
  }, [tex]);
};

// ── Un material = una malla instanciada ────────────────────────────────────
const Grupo: React.FC<{
  mat: Material;
  items: MundoData['bloques'];
  reloj: { t: number };
}> = ({ mat, items, reloj }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const listo = useRef(false);

  const arriba = usarTextura(mat.tex[0]);
  const lado = usarTextura(mat.tex[1]);
  const abajo = usarTextura(mat.tex[2]);

  const transparente = TRANSPARENTES.has(mat.id);
  const agua = mat.id === 'agua';

  const materiales = useMemo(() => {
    const hacer = (map: THREE.Texture) =>
      new THREE.MeshLambertMaterial({
        map,
        transparent: transparente,
        opacity: agua ? 0.82 : 1,
        alphaTest: transparente && !agua ? 0.4 : 0,
        depthWrite: !agua,
        emissive: new THREE.Color(BRILLAN.has(mat.id) ? '#6b5314' : '#000000'),
        emissiveIntensity: BRILLAN.has(mat.id) ? 0.9 : 0,
      });
    return [hacer(lado), hacer(lado), hacer(arriba), hacer(abajo), hacer(lado), hacer(lado)];
  }, [arriba, lado, abajo, mat.id, transparente, agua]);

  const retrasos = useMemo(
    () => items.map((b) => Math.max(0, b[1]) * 0.045 + (((b[0] * 7 + b[2] * 13) % 40) / 90)),
    [items],
  );

  useEffect(() => {
    // sin esto desaparecen pedazos al girar: la esfera de descarte se calcula una vez,
    // al crear la malla, y acá las posiciones se escriben por instancia
    if (ref.current) ref.current.frustumCulled = false;
  }, []);

  useFrame((state) => {
    const mesh = ref.current;
    if (mesh && !listo.current) {
      let quedan = false;
      for (let i = 0; i < items.length; i++) {
        const b = items[i];
        const f = b[4];
        const p = Math.min(1, Math.max(0, (reloj.t - retrasos[i]) / DUR));
        if (p < 1) quedan = true;
        const alto = f ? 0.5 : 1;
        const dy = f === 1 ? -0.25 : f === 2 ? 0.25 : 0;
        dummy.position.set(b[0], b[1] + dy + (1 - suave(p)) * CAIDA, b[2]);
        if (p <= 0) dummy.scale.setScalar(0.0001);
        else dummy.scale.set(1, alto, 1);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (!quedan) listo.current = true;
    }
    if (agua) {
      const o = state.clock.elapsedTime * 0.05;
      [arriba, lado, abajo].forEach((t) => t.offset.set(0, o));
    }
  });

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, items.length]}
      material={materiales}
      castShadow={!transparente}
      receiveShadow={!agua}
    >
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  );
};

const Bloques: React.FC<{ mundo: MundoData; reloj: { t: number } }> = ({ mundo, reloj }) => {
  const grupos = useMemo(() => {
    const m = new Map<number, MundoData['bloques']>();
    mundo.bloques.forEach((b) => {
      if (!m.has(b[3])) m.set(b[3], []);
      m.get(b[3])!.push(b);
    });
    return Array.from(m.entries()).sort((a, b) => a[0] - b[0]);
  }, [mundo]);
  return (
    <>
      {grupos.map(([i, items]) => (
        <Grupo key={i} mat={mundo.materiales[i]} items={items} reloj={reloj} />
      ))}
    </>
  );
};

const Nubes: React.FC<{ lado: number }> = ({ lado }) => {
  const ref = useRef<THREE.Group>(null);
  const nubes = useMemo(
    () => [...Array(12)].map((_, i) => ({
      x: -70 + i * 16 + (i % 3) * 6,
      y: 34 + (i % 3) * 4,
      z: -30 + ((i * 17) % (lado + 60)),
      sx: 9 + (i % 4) * 5,
      sz: 5 + (i % 2) * 4,
    })),
    [lado],
  );
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.position.x += dt * 0.4;
    if (ref.current.position.x > lado + 80) ref.current.position.x = -80;
  });
  return (
    <group ref={ref}>
      {nubes.map((n, i) => (
        <mesh key={i} position={[n.x, n.y, n.z]}>
          <boxGeometry args={[n.sx, 1, n.sz]} />
          <meshLambertMaterial color="#f2f5fa" transparent opacity={0.42} />
        </mesh>
      ))}
    </group>
  );
};

const Zona: React.FC<{
  caja: [number, number, number, number, number, number];
  onPick: () => void;
}> = ({ caja, onPick }) => {
  const [hover, setHover] = useState(false);
  const [x0, y0, z0, sx, sy, sz] = caja;
  useEffect(() => {
    document.body.style.cursor = hover ? 'pointer' : 'auto';
    return () => { document.body.style.cursor = 'auto'; };
  }, [hover]);
  return (
    <mesh
      position={[x0 + sx / 2 - 0.5, y0 + sy / 2, z0 + sz / 2 - 0.5]}
      onClick={(e) => { e.stopPropagation(); onPick(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
      onPointerOut={() => setHover(false)}
    >
      <boxGeometry args={[sx + 1, sy + 1, sz + 1]} />
      <meshBasicMaterial color="#ffe9a8" transparent opacity={hover ? 0.13 : 0} depthWrite={false} />
    </mesh>
  );
};

// ── Modo jugar ─────────────────────────────────────────────────────────────
const ANCHO = 0.3, ALTO = 1.75, OJO = 1.62, G = 26, VEL = 5.6, SALTO = 8.4;

const Jugador: React.FC<{
  solidos: Set<string>;
  spawn: [number, number, number];
  onSalir: () => void;
}> = ({ solidos, spawn, onSalir }) => {
  const { camera } = useThree();
  const pos = useRef(new THREE.Vector3(...spawn));
  const vel = useRef(new THREE.Vector3());
  const teclas = useRef<Record<string, boolean>>({});
  const enSuelo = useRef(false);

  const choca = useMemo(() => {
    const solido = (x: number, y: number, z: number) =>
      solidos.has(`${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`);
    return (p: THREE.Vector3) => {
      for (const dx of [-ANCHO, ANCHO])
        for (const dz of [-ANCHO, ANCHO])
          for (const dy of [0.05, ALTO / 2, ALTO - 0.05])
            if (solido(p.x + dx, p.y + dy, p.z + dz)) return true;
      return false;
    };
  }, [solidos]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      teclas.current[e.code] = true;
      if (e.code === 'Escape') onSalir();
    };
    const up = (e: KeyboardEvent) => { teclas.current[e.code] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [onSalir]);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const t = teclas.current;
    const frente = new THREE.Vector3();
    camera.getWorldDirection(frente);
    frente.y = 0;
    frente.normalize();
    const der = new THREE.Vector3().crossVectors(frente, new THREE.Vector3(0, 1, 0));

    const mov = new THREE.Vector3();
    if (t['KeyW'] || t['ArrowUp']) mov.add(frente);
    if (t['KeyS'] || t['ArrowDown']) mov.sub(frente);
    if (t['KeyD'] || t['ArrowRight']) mov.add(der);
    if (t['KeyA'] || t['ArrowLeft']) mov.sub(der);
    if (mov.lengthSq() > 0) mov.normalize().multiplyScalar(VEL * (t['ShiftLeft'] ? 1.7 : 1));

    if (t['Space'] && enSuelo.current) { vel.current.y = SALTO; enSuelo.current = false; }
    vel.current.y -= G * dt;

    // eje por eje: así se desliza contra las paredes en vez de trabarse
    const p = pos.current;
    const paso = new THREE.Vector3(mov.x * dt, 0, 0);
    p.add(paso); if (choca(p)) p.sub(paso);
    paso.set(0, 0, mov.z * dt);
    p.add(paso); if (choca(p)) p.sub(paso);
    paso.set(0, vel.current.y * dt, 0);
    p.add(paso);
    if (choca(p)) {
      p.sub(paso);
      if (vel.current.y < 0) enSuelo.current = true;
      vel.current.y = 0;
    } else if (vel.current.y < -0.2) {
      enSuelo.current = false;
    }
    if (p.y < -14) { p.set(...spawn); vel.current.set(0, 0, 0); }

    camera.position.set(p.x, p.y + OJO, p.z);
  });
  return null;
};

const Escena: React.FC<{
  mundo: MundoData;
  modo: 'mapa' | 'jugar';
  onPick: (id: string) => void;
  onSalir: () => void;
  reloj: { t: number };
  pausado: boolean;
}> = ({ mundo, modo, onPick, onSalir, reloj, pausado }) => {
  const { size } = useThree();
  const [listo, setListo] = useState(false);
  useFrame((_, dt) => {
    reloj.t += dt;
    if (!listo && reloj.t > 1.6) setListo(true);
  });

  const centro = useMemo(() => new THREE.Vector3(mundo.lado / 2, 3, mundo.lado / 2), [mundo.lado]);
  const solidos = useMemo(() => {
    const s = new Set<string>();
    mundo.bloques.forEach((b) => {
      if (mundo.materiales[b[3]].id !== 'agua') s.add(`${b[0]},${b[1]},${b[2]}`);
    });
    return s;
  }, [mundo]);

  return (
    <>
      {modo === 'mapa' ? (
        <OrthographicCamera
          makeDefault
          position={[mundo.lado * 0.95, mundo.lado * 0.78, mundo.lado * 0.95]}
          zoom={Math.min(size.width, size.height) / 58}
          near={-500}
          far={900}
          onUpdate={(c) => c.lookAt(centro)}
        />
      ) : (
        <PerspectiveCamera makeDefault fov={75} near={0.1} far={400} position={mundo.spawn} />
      )}

      <hemisphereLight args={['#cfe0ff', '#54603f', 0.95]} />
      <directionalLight
        position={[mundo.lado * 0.7, 70, mundo.lado * 0.35]}
        intensity={1.35}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.06}
        shadow-camera-left={-46}
        shadow-camera-right={46}
        shadow-camera-top={46}
        shadow-camera-bottom={-46}
        shadow-camera-far={200}
      />
      <Bloques mundo={mundo} reloj={reloj} />
      <Nubes lado={mundo.lado} />

      {modo === 'mapa' && listo &&
        Object.entries(mundo.cajas).map(([id, caja]) => (
          <Zona key={id} caja={caja} onPick={() => onPick(id)} />
        ))}

      {modo === 'mapa' ? (
        <OrbitControls
          target={centro}
          enablePan={false}
          minPolarAngle={Math.PI / 5}
          maxPolarAngle={Math.PI / 2.7}
          minZoom={8}
          maxZoom={90}
          enableDamping
          dampingFactor={0.08}
          autoRotate={!pausado}
          autoRotateSpeed={0.16}
        />
      ) : (
        <>
          <PointerLockControls onUnlock={onSalir} />
          <Jugador solidos={solidos} spawn={mundo.spawn} onSalir={onSalir} />
        </>
      )}
    </>
  );
};

const Panel: React.FC<{ f: Ficha; onClose: () => void }> = ({ f, onClose }) => (
  <div className="mundo-panel">
    <button className="mundo-cerrar" onClick={onClose} aria-label="Cerrar">✕</button>
    <div className="mundo-estado">{f.estado}</div>
    <h2>{f.nombre}</h2>
    <p className="mundo-rol">{f.rol}</p>
    <p className="mundo-texto">{f.texto}</p>
    {f.id === 'base' && (
      <>
        <h3>Sala de proyectos</h3>
        <div className="mundo-marcos">
          {PROYECTOS.map((p) => (
            <div key={p.nombre} className={'mundo-marco' + (p.brillo ? ' brilla' : '')}>
              <span className="mundo-marco-nombre">{p.nombre}</span>
              <span className="mundo-marco-que">{p.que}</span>
            </div>
          ))}
        </div>
      </>
    )}
    {f.id === 'logros' && (
      <div className="mundo-logros">
        {LOGROS.map((l) => (
          <div key={l.nombre} className="mundo-logro">
            <span className="mundo-logro-nombre">{l.nombre}</span>
            <span className="mundo-logro-de">{l.de} · {l.anio}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const Mundo: React.FC = () => {
  const [mundo, setMundo] = useState<MundoData | null>(null);
  const [abierta, setAbierta] = useState<string | null>(null);
  const [modo, setModo] = useState<'mapa' | 'jugar'>('mapa');
  const [fase, setFase] = useState(0);
  const reloj = useRef({ t: 0 }).current;

  useEffect(() => {
    fetch('/mundo/mundo.json').then((r) => r.json()).then(setMundo).catch(() => setMundo(null));
  }, []);

  useEffect(() => {
    if (!mundo) return;
    const a = setTimeout(() => setFase(1), 250);
    const b = setTimeout(() => setFase(2), 2900);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [mundo]);

  const ficha = abierta ? CONTENIDO.find((c) => c.id === abierta) : null;
  const jugando = modo === 'jugar';

  return (
    <div className={'mundo-raiz' + (jugando ? ' jugando' : '')}>
      {mundo && (
        <Canvas
          shadows
          dpr={[1, 1.5]}
          gl={{ antialias: true }}
          onPointerMissed={() => setAbierta(null)}
        >
          <color attach="background" args={['#0E1018']} />
          <fog attach="fog" args={['#0E1018', 110, 260]} />
          <React.Suspense fallback={null}>
            <Escena
              mundo={mundo}
              modo={modo}
              reloj={reloj}
              pausado={!!abierta}
              onPick={setAbierta}
              onSalir={() => setModo('mapa')}
            />
          </React.Suspense>
        </Canvas>
      )}

      {!mundo && <div className="mundo-cargando">generando el mundo…</div>}

      {!jugando && mundo && (
        <div className={'mundo-intro fase-' + fase}>
          <h1>{IDENTIDAD.nombre}</h1>
          <p>{IDENTIDAD.rol}</p>
          <span>{IDENTIDAD.lugar}</span>
        </div>
      )}

      {!jugando && fase >= 2 && !abierta && (
        <div className="mundo-pista">
          Arrastrá para girar. Tocá una construcción.
          <button className="mundo-play" onClick={() => setModo('jugar')}>▶ PLAY</button>
        </div>
      )}

      {jugando && (
        <>
          <div className="mundo-mira" />
          <div className="mundo-hud">
            <b>W A S D</b> caminar · <b>Espacio</b> saltar · <b>Shift</b> correr · <b>Esc</b> volver al mapa
          </div>
        </>
      )}

      {!jugando && ficha && <Panel f={ficha} onClose={() => setAbierta(null)} />}
    </div>
  );
};

export default Mundo;
