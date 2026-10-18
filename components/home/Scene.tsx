"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Suspense, useMemo, useRef } from "react";
import { Color, Group, Mesh, MeshBasicMaterial, PerspectiveCamera, Vector3 } from "three";
import { N, NAV_IDX, R, panelAngle, poseCamera, ringState } from "@/lib/ring";
import { Station } from "../three/Station";
import { Turf } from "../three/Turf";
import { Ball } from "../three/Ball";
import { KnucklePost } from "../three/KnucklePost";
import { StadiumEnv } from "../three/StadiumEnv";
import { closedRing } from "@/lib/layout";

const RING = closedRing(12);

// Light states. Values above 1 feed the bloom pass, like a real LED line seen at night.
const GO = new Color("#22e070").multiplyScalar(6);
const STOP = new Color("#ff4a3d").multiplyScalar(5.5);
const IDLE = new Color("#e8efe9").multiplyScalar(0.9);
const OFF = new Color("#26302c");
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

function Rig({ labels, onArrive }: { labels: React.RefObject<(HTMLAnchorElement | null)[]>; onArrive: (k: number) => void }) {
  const { camera, size } = useThree();
  const lights = useRef<(MeshBasicMaterial | null)[]>([]);
  const cur = useMemo(() => Array.from({ length: N }, () => OFF.clone()), []);
  const cone = useRef<Group>(null);
  const ball = useRef<Mesh>(null);
  const facing = useRef(-Math.PI / 2);
  const from = useRef<Vector3 | null>(null);
  const prev = useRef(new Vector3());
  const tmp = useMemo(() => new Vector3(), []);
  const axis = useMemo(() => new Vector3(), []);
  const reduce = useMemo(() => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const blades = size.width < 700 ? 28000 : 70000;

  useFrame((_, dtRaw) => {
    const dt = Math.min(0.05, dtRaw), now = performance.now();
    const cam = camera as PerspectiveCamera;
    if (!reduce && !ringState.passing) ringState.theta += dt * 0.03;
    poseCamera(cam, size.width, size.height);

    const p = ringState.passing;
    const target = ringState.hover >= 0 ? NAV_IDX[ringState.hover] : p ? NAV_IDX[p.k] : Math.floor(now / 2400) % N;
    let d = panelAngle(target) - facing.current;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    facing.current += d * Math.min(1, dt * 5);
    if (cone.current) cone.current.rotation.y = -facing.current;

    // Green = play it (steady). Red = closed (pulsing, so it reads without colour vision too). Nav panels idle soft white.
    const tick = Math.floor(now / 2400);
    const pulse = 0.55 + 0.45 * Math.sin(now / 160);
    for (let i = 0; i < N; i++) {
      const isNav = NAV_IDX.includes(i);
      let col = OFF, k = 1;
      if (i === target) col = GO;
      else if (!isNav && (i * 7 + tick) % 5 === 0) { col = STOP; k = pulse; }
      else if (isNav) col = IDLE;
      cur[i].lerp(col, Math.min(1, dt * 9));
      lights.current[i]?.color.copy(cur[i]).multiplyScalar(k);
    }

    // ball: rests on the centre spot, or rolls along the turf to the chosen panel (rotation matches distance)
    const b = ball.current;
    if (b) {
      prev.current.copy(b.position);
      if (p) {
        from.current ??= b.position.clone();
        const k = Math.min(1, (now - p.t0) / 560), a = panelAngle(NAV_IDX[p.k]);
        tmp.set(Math.cos(a) * (R - 0.13), 0.11, Math.sin(a) * (R - 0.13));
        b.position.lerpVectors(from.current, tmp, ease(k));
        if (k >= 1) {
          ringState.passing = null;
          from.current = null;
          onArrive(p.k);
        }
      } else {
        tmp.set(Math.cos(facing.current) * 0.28, 0.11, Math.sin(facing.current) * 0.28);
        b.position.lerp(tmp, Math.min(1, dt * 3));
      }
      const dx = b.position.x - prev.current.x, dz = b.position.z - prev.current.z, dist = Math.hypot(dx, dz);
      if (dist > 1e-5) {
        axis.set(dz, 0, -dx).normalize();
        b.rotateOnWorldAxis(axis, dist / 0.11);
      }
    }

    // DOM labels ride above their panels
    NAV_IDX.forEach((i, k) => {
      const el = labels.current?.[k];
      if (!el) return;
      const a = panelAngle(i);
      tmp.set(R * Math.cos(a), 0.62, R * Math.sin(a)).project(cam);
      const x = (tmp.x * 0.5 + 0.5) * size.width, y = (-tmp.y * 0.5 + 0.5) * size.height;
      el.style.transform = `translate(${x}px,${y}px) translate(-50%,-100%)`;
      el.style.opacity = tmp.z < 0.985 ? "1" : "0.55";
      el.style.zIndex = String(Math.round((1 - tmp.z) * 1e4));
    });
  });

  return (
    <>
      <hemisphereLight args={["#cfd8d4", "#1c2a1e", 0.25]} />
      {/* floodlights: a warm key that casts shadows, a cooler fill from the far stand */}
      <directionalLight
        position={[5, 10, 4]}
        intensity={1.9}
        color="#fff1dc"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-4.5}
        shadow-camera-right={4.5}
        shadow-camera-top={4.5}
        shadow-camera-bottom={-4.5}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-6, 7, -5]} intensity={0.9} color="#dbe6ff" />
      <Turf key={blades} count={blades} />
      {Array.from({ length: N }, (_, i) => {
        const a = panelAngle(i);
        return (
          <Station
            key={i}
            position={[R * Math.cos(a), 0, R * Math.sin(a)]}
            ref={(g: Group | null) => g?.lookAt(0, 0, 0)}
            lightRef={(m) => (lights.current[i] = m)}
          />
        );
      })}
      {/* closed ring: knuckle posts fill every joint, so the faces read as one continuous wall */}
      {RING.posts.map((p, i) => (
        <KnucklePost key={i} x={p.x} z={p.z} />
      ))}
      {/* scan cone and centre spot */}
      <group ref={cone}>
        <mesh rotation-x={-Math.PI / 2} position-y={0.03}>
          <circleGeometry args={[1.75, 40, -0.4, 0.8]} />
          <meshBasicMaterial color="#2bd883" transparent opacity={0.07} depthWrite={false} />
        </mesh>
      </group>
      <Ball ref={ball} position={[0.28, 0.11, 0]} />
    </>
  );
}

export default function Scene({
  labels,
  onArrive,
}: {
  labels: React.RefObject<(HTMLAnchorElement | null)[]>;
  onArrive: (k: number) => void;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ fov: 36, near: 0.1, far: 80, position: [0, 4, 8] }}
      gl={{ antialias: false, powerPreference: "high-performance", toneMappingExposure: 0.78 }}
      onPointerMove={(e) => {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        ringState.px = (e.clientX - r.left) / r.width - 0.5;
        ringState.py = (e.clientY - r.top) / r.height - 0.5;
      }}
      aria-hidden="true"
    >
      <Suspense fallback={null}>
        <StadiumEnv />
      </Suspense>
      <Rig labels={labels} onArrive={onArrive} />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={1.25} luminanceThreshold={1.3} luminanceSmoothing={0.15} radius={0.7} />
        <Vignette offset={0.28} darkness={0.62} />
      </EffectComposer>
    </Canvas>
  );
}
