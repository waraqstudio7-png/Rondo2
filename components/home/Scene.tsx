"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  Fog,
  Group,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  SRGBColorSpace,
  Sprite,
  Vector3,
} from "three";
import { N, NAV_IDX, PANEL_H, PANEL_W, R, panelAngle, poseCamera, ringState } from "@/lib/ring";

const GO = new Color("#3cf09c");
const STOP = new Color("#ff4f60");
const IDLE = new Color("#5d7468");
const OFF = new Color("#2a4136");
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

function canvasTex(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, srgb = true) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  draw(cv.getContext("2d")!);
  const t = new CanvasTexture(cv);
  if (srgb) t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Night pitch: mowing stripes, the real 9.15 m centre circle, halfway line, centre spot. 1 unit = 1 m. */
function Pitch() {
  const tex = useMemo(() => {
    const S = 26, PX = 1024, k = PX / S;
    return canvasTex(PX, PX, (c) => {
      for (let x = 0, i = 0; x < PX; x += 2 * k, i++) {
        c.fillStyle = i % 2 ? "#0b1c15" : "#08160f";
        c.fillRect(x, 0, 2 * k, PX);
      }
      c.strokeStyle = "rgba(237,243,238,.32)";
      c.lineWidth = 0.12 * k;
      c.beginPath(); c.arc(PX / 2, PX / 2, 9.15 * k, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.moveTo(0, PX / 2); c.lineTo(PX, PX / 2); c.stroke();
      c.fillStyle = "rgba(237,243,238,.5)";
      c.beginPath(); c.arc(PX / 2, PX / 2, 0.12 * k, 0, Math.PI * 2); c.fill();
    });
  }, []);
  return (
    <mesh rotation-x={-Math.PI / 2}>
      <planeGeometry args={[26, 26]} />
      <meshStandardMaterial map={tex} roughness={0.95} metalness={0} />
    </mesh>
  );
}

type PanelRefs = { strip: MeshBasicMaterial | null; glow: Sprite | null; cur: Color };

/** The 12 stations: 1000 x 400 face (Hex Focus skin, aim window, strike line), spine with light strip, 3 shoes. */
function Ring({ refs }: { refs: React.MutableRefObject<PanelRefs[]> }) {
  const { faceTex, glowTex } = useMemo(() => {
    const faceTex = canvasTex(500, 200, (c) => {
      const h = 200, r = 9;
      c.fillStyle = "#10241b"; c.fillRect(0, 0, 500, h);
      c.strokeStyle = "rgba(237,243,238,.12)"; c.lineWidth = 1.2;
      for (let row = 0; row < 16; row++)
        for (let col = 0; col < 34; col++) {
          const x = col * r * 1.732 + (row % 2 ? r * 0.866 : 0), y = row * r * 1.5;
          c.beginPath();
          for (let q = 0; q < 6; q++) { const a = Math.PI / 6 + (q * Math.PI) / 3; c.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)); }
          c.closePath(); c.stroke();
        }
      // aim window 200 x 140 mm centred on the strike line, 110 mm above the floor (100 mm above the face bottom)
      c.fillStyle = "#10241b"; c.strokeStyle = "rgba(237,243,238,.85)"; c.lineWidth = 1.6;
      c.beginPath(); c.rect(200, h - 50 - 35, 100, 70); c.fill(); c.stroke();
      c.beginPath();
      c.moveTo(209, h - 50); c.lineTo(246, h - 50); c.moveTo(254, h - 50); c.lineTo(291, h - 50);
      c.moveTo(250, h - 54); c.lineTo(250, h - 46); c.stroke();
    });
    const glowTex = canvasTex(128, 64, (c) => {
      const g = c.createRadialGradient(64, 32, 0, 64, 32, 64);
      g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.35, "rgba(255,255,255,.35)"); g.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = g; c.fillRect(0, 0, 128, 64);
    }, false);
    return { faceTex, glowTex };
  }, []);

  return (
    <>
      {Array.from({ length: N }, (_, i) => {
        const a = panelAngle(i);
        refs.current[i] ??= { strip: null, glow: null, cur: OFF.clone() };
        return (
          <group
            key={i}
            position={[R * Math.cos(a), 0, R * Math.sin(a)]}
            ref={(g: Group | null) => g?.lookAt(0, 0, 0)}
          >
            <mesh position-y={0.21}>
              <boxGeometry args={[PANEL_W, PANEL_H, 0.06]} />
              <meshStandardMaterial color="#13291f" roughness={0.55} metalness={0.25} />
            </mesh>
            <mesh position={[0, 0.21, 0.031]}>
              <planeGeometry args={[PANEL_W, PANEL_H]} />
              <meshStandardMaterial map={faceTex} roughness={0.7} />
            </mesh>
            <mesh position-y={0.43}>
              <boxGeometry args={[1.02, 0.052, 0.09]} />
              <meshStandardMaterial color="#1d362a" roughness={0.35} metalness={0.55} />
            </mesh>
            <mesh position={[0, 0.457, 0.03]}>
              <boxGeometry args={[0.94, 0.014, 0.02]} />
              <meshBasicMaterial color={OFF} ref={(m: MeshBasicMaterial | null) => { refs.current[i].strip = m; }} />
            </mesh>
            <sprite position={[0, 0.47, 0.06]} scale={[1.7, 0.5, 1]} ref={(s: Sprite | null) => { refs.current[i].glow = s; }}>
              <spriteMaterial map={glowTex} color={GO} transparent opacity={0} blending={AdditiveBlending} depthWrite={false} />
            </sprite>
            {[-0.43, 0, 0.43].map((x) => (
              <mesh key={x} position={[x, 0.04, -0.1]}>
                <boxGeometry args={[0.11, 0.08, 0.26]} />
                <meshStandardMaterial color="#1d362a" roughness={0.35} metalness={0.55} />
              </mesh>
            ))}
          </group>
        );
      })}
    </>
  );
}

function Rig({ labels, onArrive }: { labels: React.RefObject<(HTMLAnchorElement | null)[]>; onArrive: (k: number) => void }) {
  const { camera, size, scene } = useThree();
  const panels = useRef<PanelRefs[]>([]);
  const player = useRef<Group>(null);
  const cone = useRef<Group>(null);
  const ball = useRef<Mesh>(null);
  const facing = useRef(-Math.PI / 2);
  const from = useRef(new Vector3());
  const tmp = useMemo(() => new Vector3(), []);
  const reduce = useMemo(() => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  const ballTex = useMemo(
    () =>
      canvasTex(256, 128, (c) => {
        c.fillStyle = "#f2f5f2"; c.fillRect(0, 0, 256, 128); c.fillStyle = "#16241d";
        [[32, 30], [96, 30], [160, 30], [224, 30], [0, 98], [64, 98], [128, 98], [192, 98], [256, 98], [64, 64], [192, 64]].forEach(([x, y]) => {
          c.beginPath();
          for (let q = 0; q < 5; q++) { const a = -Math.PI / 2 + (q * 2 * Math.PI) / 5; c.lineTo(x + 13 * Math.cos(a), y + 13 * Math.sin(a)); }
          c.closePath(); c.fill();
        });
      }),
    [],
  );

  useFrame((_, dtRaw) => {
    const dt = Math.min(0.05, dtRaw), now = performance.now();
    const cam = camera as PerspectiveCamera;
    if (!reduce && !ringState.passing) ringState.theta += dt * 0.035;
    const D = poseCamera(cam, size.width, size.height);
    if (scene.fog instanceof Fog) { scene.fog.near = D - 4; scene.fog.far = D + 9; }

    const p = ringState.passing;
    const target = ringState.hover >= 0 ? NAV_IDX[ringState.hover] : p ? NAV_IDX[p.k] : Math.floor(now / 2200) % N;
    let d = panelAngle(target) - facing.current;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    facing.current += d * Math.min(1, dt * 6);
    if (player.current) player.current.rotation.y = -facing.current + Math.PI / 2;
    if (cone.current) cone.current.rotation.y = -facing.current;

    // lights: the target is green; a few red decoys tick round; nav panels sit at a dim idle
    const idle = Math.floor(now / 2200);
    panels.current.forEach((pr, i) => {
      const isNav = NAV_IDX.includes(i);
      let col = OFF, glow = 0;
      if (i === target) { col = GO; glow = 0.9; }
      else if (!isNav && (i * 7 + idle) % 5 === 0) { col = STOP; glow = 0.6; }
      else if (isNav) col = IDLE;
      pr.cur.lerp(col, Math.min(1, dt * 10));
      pr.strip?.color.copy(pr.cur);
      if (pr.glow) {
        const m = pr.glow.material;
        m.color.copy(pr.cur);
        m.opacity += (glow - m.opacity) * Math.min(1, dt * 8);
      }
    });

    // ball: rests at the player's feet, or rolls along the ground to the chosen panel
    const b = ball.current;
    if (b) {
      if (p) {
        if (!from.current.lengthSq()) from.current.copy(b.position);
        const k = Math.min(1, (now - p.t0) / 520), a = panelAngle(NAV_IDX[p.k]);
        tmp.set(Math.cos(a) * (R - 0.16), 0.11, Math.sin(a) * (R - 0.16));
        b.position.lerpVectors(from.current, tmp, ease(k));
        b.rotation.x += dt * 18;
        if (k >= 1) {
          ringState.passing = null;
          from.current.set(0, 0, 0);
          onArrive(p.k);
        }
      } else {
        tmp.set(Math.cos(facing.current) * 0.32, 0.11, Math.sin(facing.current) * 0.32);
        b.position.lerp(tmp, Math.min(1, dt * 4));
      }
    }

    // DOM labels follow their panels
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
      <fog attach="fog" args={["#06110d", 8, 19]} />
      <hemisphereLight args={["#dfeee6", "#06110d", 1.4]} />
      <directionalLight position={[4, 9, 6]} intensity={2.2} color="#ffe7b3" />
      <directionalLight position={[-6, 3, -5]} intensity={0.5} color="#3cf09c" />
      <Pitch />
      <Ring refs={panels} />
      <group ref={player}>
        <mesh position-y={0.62}>
          <cylinderGeometry args={[0.13, 0.1, 0.78, 20]} />
          <meshStandardMaterial color="#e9efe9" roughness={0.45} />
        </mesh>
        <mesh position-y={1.1}>
          <sphereGeometry args={[0.1, 20, 16]} />
          <meshStandardMaterial color="#e9efe9" roughness={0.45} />
        </mesh>
        <mesh position-y={0.17}>
          <cylinderGeometry args={[0.09, 0.07, 0.3, 16]} />
          <meshStandardMaterial color="#1d362a" />
        </mesh>
      </group>
      <group ref={cone}>
        <mesh rotation-x={-Math.PI / 2} position-y={0.006}>
          <circleGeometry args={[1.9, 32, -0.42, 0.84]} />
          <meshBasicMaterial color={GO} transparent opacity={0.1} depthWrite={false} />
        </mesh>
      </group>
      <mesh ref={ball} position={[0.3, 0.11, 0]}>
        <sphereGeometry args={[0.11, 32, 24]} />
        <meshStandardMaterial map={ballTex} roughness={0.4} />
      </mesh>
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
      flat
      dpr={[1, 2]}
      camera={{ fov: 36, near: 0.1, far: 80, position: [0, 4, 8] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onPointerMove={(e) => {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        ringState.px = (e.clientX - r.left) / r.width - 0.5;
        ringState.py = (e.clientY - r.top) / r.height - 0.5;
      }}
      aria-hidden="true"
    >
      <Rig labels={labels} onArrive={onArrive} />
    </Canvas>
  );
}
