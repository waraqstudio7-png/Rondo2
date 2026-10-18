"use client";

import { forwardRef, useMemo } from "react";
import type { ThreeElements } from "@react-three/fiber";
import type { Mesh } from "three";
import { ballTextures } from "./textures";

let tex: ReturnType<typeof ballTextures> | null = null;

/** Size 5 match ball: 220 mm diameter (68-70 cm circumference), stitched 32-panel pattern, satin clear coat. */
export const Ball = forwardRef<Mesh, ThreeElements["mesh"]>(function Ball(props, ref) {
  const t = useMemo(() => (tex ??= ballTextures()), []);
  return (
    <mesh ref={ref} castShadow {...props}>
      <sphereGeometry args={[0.11, 64, 48]} />
      <meshPhysicalMaterial map={t.map} bumpMap={t.bumpMap} bumpScale={1.2} roughness={0.42} clearcoat={0.7} clearcoatRoughness={0.35} />
    </mesh>
  );
});
