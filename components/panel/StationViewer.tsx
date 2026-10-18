"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Suspense, use, useRef, useState } from "react";
import { Color, MeshBasicMaterial } from "three";
import { Station } from "../three/Station";
import { Ball } from "../three/Ball";

const studio = typeof window !== "undefined" ? import("@pmndrs/assets/hdri/studio.exr") : null;
function Env() {
  const m = use(studio!);
  return <Environment files={m.default} environmentIntensity={0.4} />;
}

const STATES = [
  { k: "go", label: "Green · play it", c: new Color("#22e070").multiplyScalar(5) },
  { k: "stop", label: "Red · closed (pulses)", c: new Color("#ff4a3d").multiplyScalar(5) },
  { k: "off", label: "Off", c: new Color("#26302c") },
] as const;

function Lit({ state }: { state: number }) {
  const mat = useRef<MeshBasicMaterial | null>(null);
  useFrame(() => {
    const s = STATES[state];
    if (!mat.current) return;
    mat.current.color.copy(s.c);
    if (s.k === "stop") mat.current.color.multiplyScalar(0.55 + 0.45 * Math.sin(performance.now() / 160));
  });
  return (
    <>
      <Station position={[0, 0, 0]} lightRef={(m) => (mat.current = m)} />
      <Ball position={[0.36, 0.11, 0.42]} />
    </>
  );
}

/** Rotatable rev D station (CAD dimensions), studio light. Drag to orbit, scroll or pinch to zoom. */
export default function StationViewer() {
  const [state, setState] = useState(0);
  return (
    <div className="viewer">
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 30, position: [1.25, 0.75, 2.05] }} gl={{ antialias: false }}>
        <color attach="background" args={["#111518"]} />
        <Suspense fallback={null}>
          <Env />
        </Suspense>
        <directionalLight position={[2, 3, 2]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
        <Lit state={state} />
        <ContactShadows position={[0, 0.001, 0]} opacity={0.6} scale={3} blur={2.4} far={1} />
        <OrbitControls target={[0, 0.22, 0]} enablePan={false} minDistance={0.7} maxDistance={3} maxPolarAngle={Math.PI / 2 - 0.05} autoRotate autoRotateSpeed={0.6} />
        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur intensity={0.8} luminanceThreshold={1.4} />
        </EffectComposer>
      </Canvas>
      <div className="viewer-ui" role="group" aria-label="Light state">
        {STATES.map((s, i) => (
          <button key={s.k} className="chip" aria-pressed={state === i} onClick={() => setState(i)}>
            {s.label}
          </button>
        ))}
      </div>
      <p className="viewer-note mono">Rev D station · 1000 × 400 mm face · drag to turn</p>
    </div>
  );
}
