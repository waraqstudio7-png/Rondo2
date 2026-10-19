"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Color, MeshBasicMaterial, Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Station } from "../three/Station";
import { KnucklePost } from "../three/KnucklePost";
import { Ball } from "../three/Ball";
import { Turf } from "../three/Turf";
import { StadiumEnv } from "../three/StadiumEnv";
import { layoutFor, ringStats } from "@/lib/layout";

const SIZES = [4, 6, 12, 16, 20] as const;
type Lit = "all" | "alt";
type LightMode = "drill" | "go" | "stop" | "off";
type View = "over" | "player" | "bay";

const GO = new Color("#22e070").multiplyScalar(6);
const STOP = new Color("#ff4a3d").multiplyScalar(5.5);
const OFF = new Color("#26302c");

const READ: Record<number, string> = {
  4: "Back-garden Street set. Open arc, ball comes back to your feet.",
  6: "Open arc at a 2.5 m radius. The home and small-group setup.",
  12: "Closed and compact. Fast reps, a good club or academy size.",
  16: "Closed, matches the 2.5 m passing radius in the brief.",
  20: "Closed and big. Long, weighted passes. Facility installs.",
};

function Ring({ n, lit, mode, step = 2 }: { n: number; lit: Lit; mode: LightMode; step?: number }) {
  const L = useMemo(() => layoutFor(n), [n]);
  const mats = useRef<(MeshBasicMaterial | null)[]>([]);
  const target = useRef(0);
  const last = useRef(0);
  useFrame(() => {
    const now = performance.now();
    if (now - last.current > 1500) {
      last.current = now;
      target.current = Math.floor(Math.random() * n);
    }
    const pulse = 0.55 + 0.45 * Math.sin(now / 160);
    for (let i = 0; i < n; i++) {
      const m = mats.current[i];
      if (!m) continue;
      const active = lit === "all" || i % step === 0;
      if (!active || mode === "off") { m.color.copy(OFF); continue; }
      if (mode === "go") m.color.copy(GO);
      else if (mode === "stop") m.color.copy(STOP).multiplyScalar(pulse);
      else if (i === target.current) m.color.copy(GO);
      else if ((i * 5 + Math.floor(now / 1500)) % 4 === 0) m.color.copy(STOP).multiplyScalar(pulse);
      else m.color.copy(OFF);
    }
  });
  return (
    <>
      {L.slots.map((s, i) => (
        <Station key={`${n}-${i}`} position={[s.x, 0, s.z]} rotation-y={s.yaw} lightRef={(m) => (mats.current[i] = m)} />
      ))}
      {L.posts.map((p, i) => (
        <KnucklePost key={`p${n}-${i}`} x={p.x} z={p.z} />
      ))}
    </>
  );
}

/** Eases the camera to a preset; any drag by the viewer cancels the ease. */
function CameraRig({ n, view, controls }: { n: number; view: View; controls: React.RefObject<OrbitControlsImpl | null> }) {
  const { camera, size } = useThree();
  const tall = size.width / Math.max(1, size.height) < 1;
  const goal = useRef<{ pos: Vector3; tgt: Vector3 } | null>(null);
  useEffect(() => {
    const L = layoutFor(n), st = ringStats(n);
    const d = Math.max(4.5, st.footprint * 1.05 + 1.5) * (tall ? 1.7 : 1);
    if (view === "over") goal.current = { pos: new Vector3(d * 0.62, d * 0.55, d * 0.62), tgt: new Vector3(0, 0.2, L.closed ? 0 : -L.radius * 0.6) };
    else if (view === "player") goal.current = { pos: new Vector3(0, 1.55, L.closed ? L.radius * 0.35 : 0.4), tgt: new Vector3(0, 0.3, -L.radius) };
    else {
      const s = L.slots[0];
      const out = new Vector3(s.x, 0, s.z).normalize();
      goal.current = { pos: new Vector3(s.x + out.x * 1.2 + 0.5, 0.75, s.z + out.z * 1.2), tgt: new Vector3(s.x, 0.32, s.z) };
    }
  }, [n, view, tall]);
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const stop = () => (goal.current = null);
    c.addEventListener("start", stop);
    return () => c.removeEventListener("start", stop);
  }, [controls]);
  useFrame((_, dt) => {
    const g = goal.current, c = controls.current;
    if (!g || !c) return;
    const k = Math.min(1, dt * 3);
    camera.position.lerp(g.pos, k);
    c.target.lerp(g.tgt, k);
    c.update();
    if (camera.position.distanceTo(g.pos) < 0.01) goal.current = null;
  });
  return null;
}

function Seg<T extends string | number>({ label, value, options, onChange, render }: {
  label: string; value: T; options: readonly T[]; onChange: (v: T) => void; render?: (v: T) => React.ReactNode;
}) {
  return (
    <div className="seg" role="group" aria-label={label}>
      <span className="seg-k">{label}</span>
      {options.map((o) => (
        <button key={String(o)} aria-pressed={value === o} onClick={() => onChange(o)}>
          {render ? render(o) : String(o)}
        </button>
      ))}
    </div>
  );
}

export default function RingBuilder({ initial = 12, litCount, compact = false }: { initial?: number; litCount?: number; compact?: boolean } = {}) {
  const [n, setN] = useState<number>(initial);
  const [lit, setLit] = useState<Lit>(litCount !== undefined && litCount < initial ? "alt" : "all");
  const step = litCount && litCount < n ? Math.max(1, Math.round(n / litCount)) : 2;
  const [mode, setMode] = useState<LightMode>(litCount === 0 ? "off" : "drill");
  const [view, setView] = useState<View>("over");
  const controls = useRef<OrbitControlsImpl | null>(null);
  const st = ringStats(n);
  const litN = lit === "all" ? n : Math.ceil(n / step);
  const blades = typeof window !== "undefined" && window.innerWidth < 700 ? 22000 : 50000;

  return (
    <div className={compact ? "builder compact" : "builder"}>
      <div className="builder-stage">
        <Canvas shadows dpr={[1, 1.75]} camera={{ fov: 38, position: [7, 6, 7], near: 0.05, far: 200 }} gl={{ antialias: false, toneMappingExposure: 0.8 }}>
          <Suspense fallback={null}>
            <StadiumEnv />
          </Suspense>
          <hemisphereLight args={["#cfd8d4", "#1c2a1e", 0.25]} />
          <directionalLight position={[6, 10, 5]} intensity={1.9} color="#fff1dc" castShadow shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} shadow-bias={-0.0004} shadow-normalBias={0.02} />
          <Turf count={blades} radius={8} />
          <Ring n={n} lit={lit} mode={mode} step={step} />
          <Ball position={[0.25, 0.11, 0.15]} />
          <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.08} target={[0, 0.2, 0]}
            minDistance={0.8} maxDistance={22} maxPolarAngle={Math.PI / 2 - 0.04} autoRotate={view === "over"} autoRotateSpeed={0.35} />
          <CameraRig n={n} view={view} controls={controls} />
          <EffectComposer multisampling={4}>
            <Bloom mipmapBlur intensity={1.2} luminanceThreshold={1.3} radius={0.7} />
            <Vignette offset={0.3} darkness={0.55} />
          </EffectComposer>
        </Canvas>
        <p className="builder-tag mono">Drag to orbit · scroll or pinch to zoom</p>
        <div className="builder-hud">
          {compact ? null : <Seg label="Stations" value={n} options={SIZES} onChange={setN} />}
          {compact ? null : <Seg label="Lit" value={lit} options={["all", "alt"] as const} onChange={setLit} render={(v) => (v === "all" ? "All" : "Every other")} />}
          <Seg label="Light" value={mode} options={["drill", "go", "stop", "off"] as const} onChange={setMode}
            render={(v) => ({ drill: "Drill", go: "Green", stop: "Red", off: "Off" })[v]} />
          <Seg label="View" value={view} options={["over", "player", "bay"] as const} onChange={setView}
            render={(v) => ({ over: "Overview", player: "Player eye", bay: "Engine bay" })[v]} />
        </div>
      </div>

      {compact ? null : (<>
      <div className="figs4" aria-live="polite">
        <div><div className="v">{n}</div><div className="k mono">{st.closed ? "Stations, closed ring" : "Stations, open arc"} · {litN} lit</div></div>
        <div><div className="v">{st.inside.toFixed(2)}<small> m</small></div><div className="k mono">{st.closed ? "Inside diameter" : "Arc diameter"}</div></div>
        <div><div className="v">{st.footprint.toFixed(2)}<small> m</small></div><div className="k mono">Footprint</div></div>
        <div><div className="v">{st.mass}<small> kg</small></div><div className="k mono">Mass, filled (est.)</div></div>
      </div>

      <div className="tblwrap">
        <table className="ringtbl">
          <thead>
            <tr><th>Stations</th><th>Layout</th><th>Inside</th><th>Player to face</th><th>Footprint</th><th>Mass, filled</th><th>Read</th></tr>
          </thead>
          <tbody>
            {SIZES.map((k) => {
              const s = ringStats(k);
              return (
                <tr key={k} className={k === n ? "sel" : ""} onClick={() => setN(k)}>
                  <td>{k}</td><td>{s.closed ? "Closed" : "Open arc"}</td><td>{s.inside.toFixed(2)} m</td><td>{s.playerToFace.toFixed(2)} m</td>
                  <td>{s.footprint.toFixed(2)} m</td><td>{s.mass} kg</td><td>{READ[k]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="note">
        Closed rings use 1000 mm faces joined by 14 mm knuckle posts, so the count fixes the size. 4 and 6 stations are too tight to close
        (about 1.0 m and 1.7 m across), so they run as an open arc at the 2.5 m passing radius. Mass uses the rev D estimate of 22 kg per filled station.
      </p>
      </>)}
    </div>
  );
}
