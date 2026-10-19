"use client";

import { forwardRef, useMemo } from "react";
import type { ThreeElements } from "@react-three/fiber";
import type { Mesh } from "three";
import { ballTextures, type BallStyle } from "./textures";

/** Size 5 match ball: 220 mm diameter (68-70 cm circumference), unbranded era skins with honest wear. */
export const Ball = forwardRef<Mesh, ThreeElements["mesh"] & { ballStyle?: BallStyle }>(function Ball({ ballStyle = "pentagon", ...props }, ref) {
  const t = useMemo(() => ballTextures(ballStyle), [ballStyle]);
  const leather = ballStyle === "leather";
  return (
    <mesh ref={ref} castShadow {...props}>
      <sphereGeometry args={[0.11, 96, 64]} />
      <meshPhysicalMaterial
        key={ballStyle}
        map={t.map}
        bumpMap={t.bumpMap}
        bumpScale={leather ? 2.2 : 1.4}
        roughnessMap={t.roughnessMap}
        roughness={1}
        clearcoat={leather ? 0.15 : 0.55}
        clearcoatRoughness={leather ? 0.7 : 0.4}
        sheen={leather ? 0.3 : 0}
        sheenColor="#6b4a2b"
      />
    </mesh>
  );
});
