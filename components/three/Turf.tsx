"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  type WebGLProgramParametersWithUniforms,
} from "three";
import { pitchTexture, rng } from "./textures";

const SIZE = 26; // metres of pitch drawn

/** One tapered blade, 5 vertices. Normals point up so the turf takes floodlight like a lawn, not like paper. */
function bladeGeometry() {
  const g = new BufferGeometry();
  const w = 0.006, h = 1;
  const pos = new Float32Array([-w, 0, 0, w, 0, 0, -w * 0.7, h * 0.5, 0, w * 0.7, h * 0.5, 0, 0, h, 0]);
  const nrm = new Float32Array(15);
  for (let i = 0; i < 5; i++) nrm[i * 3 + 1] = 1;
  const ty = new Float32Array([0, 0, 0.5, 0.5, 1]);
  g.setAttribute("position", new BufferAttribute(pos, 3));
  g.setAttribute("normal", new BufferAttribute(nrm, 3));
  g.setAttribute("tip", new BufferAttribute(ty, 1));
  g.setIndex([0, 1, 2, 1, 3, 2, 2, 3, 4]);
  return g;
}

/**
 * Real-looking turf: a mown-stripe pitch texture underneath, and tens of thousands of instanced grass blades
 * on top that sway slightly. Blades on the painted lines (centre circle, halfway line) are white.
 * Count drops on phones.
 */
export function Turf({ count = 70000, radius = 7.5 }: { count?: number; radius?: number }) {
  const mesh = useRef<InstancedMesh>(null);
  const shader = useRef<WebGLProgramParametersWithUniforms | null>(null);
  const geo = useMemo(bladeGeometry, []);
  const mat = useMemo(() => {
    const m = new MeshStandardMaterial({ roughness: 0.85, metalness: 0, vertexColors: false });
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = { value: 0 };
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nattribute float tip;\nuniform float uTime;\nvarying float vTip;")
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
           vTip = tip;
           vec3 ip = vec3(instanceMatrix[3][0], 0.0, instanceMatrix[3][2]);
           float sway = sin(uTime * 1.3 + ip.x * 0.8 + ip.z * 0.6) * 0.5 + sin(uTime * 2.1 + ip.x * 2.3) * 0.25;
           transformed.x += sway * 0.18 * tip * tip;
           transformed.z += sway * 0.08 * tip * tip;`,
        );
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", "#include <common>\nvarying float vTip;")
        .replace("#include <color_fragment>", "#include <color_fragment>\n diffuseColor.rgb *= mix(0.42, 1.12, vTip);");
      shader.current = sh;
    };
    return m;
  }, []);
  const ground = useMemo(() => pitchTexture(SIZE), []);

  // place blades once (deterministic), as instance attributes so colours exist before the shader compiles
  const { matrices, colors } = useMemo(() => {
    const matrices = new Float32Array(count * 16), colors = new Float32Array(count * 3);
    const R = rng(42), o = new Object3D(), c = new Color();
    const base = [new Color("#2f6a3a"), new Color("#3a7a40"), new Color("#2a5f35"), new Color("#447f3f")];
    for (let i = 0; i < count; i++) {
      const r = Math.sqrt(R()) * radius, a = R() * Math.PI * 2;
      const x = r * Math.cos(a), z = r * Math.sin(a);
      o.position.set(x, 0, z);
      const onLine = Math.abs(Math.hypot(x, z) - 9.15) < 0.06 || Math.abs(z) < 0.06;
      o.rotation.set((R() - 0.5) * 0.7, R() * Math.PI, (R() - 0.5) * 0.7);
      // pitch-length turf (~30 mm); painted blades are flattened so lines read as paint, not hair
      o.scale.set(1 + R() * 0.6, onLine ? 0.012 : 0.026 + R() * 0.03, 1);
      o.updateMatrix();
      o.matrix.toArray(matrices, i * 16);
      if (onLine) c.set("#e9eee6");
      else {
        c.copy(base[Math.floor(R() * base.length)]);
        const stripe = Math.floor((x + SIZE / 2) / 5) % 2 ? 0.88 : 1.06; // mown stripes
        c.multiplyScalar(stripe * (0.85 + R() * 0.3));
      }
      c.toArray(colors, i * 3);
    }
    return { matrices, colors };
  }, [count, radius]);

  useFrame((s) => {
    if (shader.current) (shader.current.uniforms.uTime as { value: number }).value = s.clock.elapsedTime;
  });

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[SIZE, SIZE]} />
        <meshStandardMaterial map={ground} roughness={0.95} />
      </mesh>
      <instancedMesh ref={mesh} args={[geo, mat, count]} frustumCulled={false}>
        <instancedBufferAttribute attach="instanceMatrix" args={[matrices, 16]} />
        <instancedBufferAttribute attach="instanceColor" args={[colors, 3]} />
      </instancedMesh>
    </group>
  );
}
