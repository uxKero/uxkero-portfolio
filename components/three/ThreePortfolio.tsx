import React, { Suspense, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { ScrollControls, Text, useGLTF, useScroll } from '@react-three/drei';
import { identity, channels, type Language } from '../../utils/hud-data';
import { useSEO } from '../../utils/useSEO';

// ─────────────────────────────────────────────────────────────────────────────
// 3D showcase — the models ARE the site. Real colors (vertex colors / texture).
// Scrolling orbits the current model a full turn, then hands over to the next.
// Copy is reduced to a signature and a contact line. White void + fog.
// ─────────────────────────────────────────────────────────────────────────────

const PAPER = '#FAF9F6';
const INK = '#1C1B1A';
const MUTED = '#8A8782';
const ACCENT = '#B4540A';

interface ShowcaseEntry {
  url: string;
  /** Extra yaw so the model faces the camera at rest. */
  facing: number;
  /** Normalized target size in world units. */
  fit: number;
  y: number;
}

const MODELS: ShowcaseEntry[] = [
  { url: '/models/dragon.glb', facing: 0, fit: 4.6, y: 0 },
  { url: '/models/akaoni.glb', facing: 0, fit: 4.2, y: -0.2 },
];
const N = MODELS.length;

const smoothstep = (x: number, a: number, b: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// ── One model on stage: scroll segment drives entrance, orbit and exit ───────
const ShowcaseModel: React.FC<{ entry: ShowcaseEntry; index: number }> = ({ entry, index }) => {
  const { scene } = useGLTF(entry.url);
  const scroll = useScroll();
  const group = useRef<THREE.Group>(null);

  const { object, scale } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    scene.position.sub(center);
    return { object: scene, scale: entry.fit / Math.max(size.x, size.y, size.z) };
  }, [scene, entry.fit]);

  useFrame(() => {
    if (!group.current) return;
    const seg = scroll.range(index / N, 1 / N);
    const isLast = index === N - 1;
    // Fade/scale in at segment start, out at the end (last one stays)
    const presence =
      smoothstep(seg, 0, 0.18) * (isLast ? 1 : 1 - smoothstep(seg, 0.82, 1));
    group.current.visible = presence > 0.001;
    group.current.scale.setScalar(scale * (0.75 + 0.25 * presence) * (presence > 0 ? 1 : 0));
    // The scroll IS the turntable: one full revolution across the segment
    group.current.rotation.y = entry.facing - 0.5 + seg * Math.PI * 2;
    group.current.position.y = entry.y + (1 - presence) * -0.6;
  });

  return (
    <group ref={group} visible={false}>
      <primitive object={object} />
    </group>
  );
};

// ── Captions that belong to a scroll segment ─────────────────────────────────
const SegmentGroup: React.FC<{
  index: number;
  children: React.ReactNode;
  from?: number;
  to?: number;
}> = ({ index, children, from = 0.04, to = 0.96 }) => {
  const scroll = useScroll();
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!group.current) return;
    const seg = scroll.range(index / N, 1 / N);
    group.current.visible = index === N - 1 ? seg > from : seg > from && seg < to;
  });
  return (
    <group ref={group} visible={index === 0}>
      {children}
    </group>
  );
};

interface LinkTextProps {
  children: string;
  position: [number, number, number];
  fontSize: number;
  color?: string;
  onActivate: () => void;
  anchorX?: 'left' | 'center' | 'right';
}

const LinkText: React.FC<LinkTextProps> = ({ children, position, fontSize, color = INK, onActivate, anchorX = 'center' }) => {
  const [hover, setHover] = useState(false);
  return (
    <Text
      position={position}
      fontSize={fontSize}
      color={hover ? ACCENT : color}
      anchorX={anchorX}
      anchorY="middle"
      onClick={(e) => {
        e.stopPropagation();
        onActivate();
      }}
      onPointerOver={() => {
        setHover(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {children}
    </Text>
  );
};

// ── Camera: gentle pointer parallax only (models rotate, camera stays) ───────
const Rig: React.FC = () => {
  const target = useMemo(() => new THREE.Vector3(), []);
  useFrame((state) => {
    target.set(state.pointer.x * 0.55, 0.2 + state.pointer.y * 0.35, 7);
    state.camera.position.lerp(target, 0.06);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
};

const Particles: React.FC = () => {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(900 * 3);
    for (let i = 0; i < 900; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 22;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 2] = -2 - Math.random() * 14;
    }
    return arr;
  }, []);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.008;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={INK} size={0.02} sizeAttenuation transparent opacity={0.25} depthWrite={false} />
    </points>
  );
};

const ThreePortfolio: React.FC = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language>('en');
  const L = language;
  const email = channels.find((c) => c.ch === '01')!;
  const open = (url: string) => window.open(url, '_blank', 'noopener');

  useSEO({
    title: 'Alan Ponce | AI Experience Designer & Product Lead | UXKERO',
    description: 'AI Experience Designer & Product Lead — 3D showcase.',
    url: typeof window !== 'undefined' ? window.location.origin : '',
    type: 'website',
  });

  return (
    <div className="h-screen w-full" style={{ background: PAPER }}>
      <Canvas camera={{ position: [0, 0.2, 7], fov: 45 }} dpr={[1, 2]}>
        <color attach="background" args={[PAPER]} />
        <fog attach="fog" args={[PAPER, 10, 22]} />
        <ambientLight intensity={1.4} />
        <directionalLight position={[4, 7, 4]} intensity={1.6} />
        <directionalLight position={[-6, 3, -3]} intensity={0.5} />

        <ScrollControls pages={N * 1.6} damping={0.22}>
          <Rig />

          <Suspense fallback={null}>
            {MODELS.map((m, i) => (
              <ShowcaseModel key={m.url} entry={m} index={i} />
            ))}
          </Suspense>

          {/* Segment 0 — signature */}
          <SegmentGroup index={0}>
            <Text position={[0, -2.75, 2]} fontSize={0.34} color={INK} anchorX="center" letterSpacing={-0.02}>
              {identity.name}
            </Text>
            <Text position={[0, -3.2, 2]} fontSize={0.12} color={MUTED} anchorX="center" letterSpacing={0.24}>
              {identity.role.toUpperCase()}
            </Text>
            <Text position={[0, 3.1, 2]} fontSize={0.11} color={ACCENT} anchorX="center">
              {L === 'en' ? 'scroll to turn ↓' : 'deslizá para girar ↓'}
            </Text>
          </SegmentGroup>

          {/* Segment 1 — contact */}
          <SegmentGroup index={1} from={0.35}>
            <LinkText position={[0, -2.75, 2]} fontSize={0.3} onActivate={() => open(email.href)}>
              {email.value}
            </LinkText>
            <LinkText
              position={[-1.35, -3.25, 2]}
              fontSize={0.12}
              color={MUTED}
              onActivate={() => open('https://www.linkedin.com/in/ab-alanponce/')}
            >
              LinkedIn
            </LinkText>
            <LinkText
              position={[-0.45, -3.25, 2]}
              fontSize={0.12}
              color={MUTED}
              onActivate={() => open('https://twitter.com/uxKero')}
            >
              X
            </LinkText>
            <LinkText
              position={[0.35, -3.25, 2]}
              fontSize={0.12}
              color={MUTED}
              onActivate={() => open('/alan-ponce-cv%20(may-2026).pdf')}
            >
              CV
            </LinkText>
            <LinkText
              position={[1.45, -3.25, 2]}
              fontSize={0.12}
              color={MUTED}
              onActivate={() => navigate('/guides')}
            >
              {L === 'en' ? 'Guides' : 'Guías'}
            </LinkText>
          </SegmentGroup>
        </ScrollControls>

        <Particles />

        {/* Language toggle, fixed top-right of the stage */}
        <group position={[5.2, 3.3, 0]}>
          <Text
            fontSize={0.14}
            color={MUTED}
            anchorX="right"
            onClick={(e) => {
              e.stopPropagation();
              setLanguage((p) => (p === 'en' ? 'es' : 'en'));
            }}
            onPointerOver={() => (document.body.style.cursor = 'pointer')}
            onPointerOut={() => (document.body.style.cursor = 'auto')}
          >
            {language === 'en' ? 'ES' : 'EN'}
          </Text>
        </group>
      </Canvas>
    </div>
  );
};

useGLTF.preload('/models/dragon.glb');
useGLTF.preload('/models/akaoni.glb');

export default ThreePortfolio;
