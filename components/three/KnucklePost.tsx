"use client";

import { useMemo } from "react";
import { CylinderGeometry, MeshPhysicalMaterial, MeshStandardMaterial } from "three";

let shared: { post: CylinderGeometry; latch: CylinderGeometry; metal: MeshPhysicalMaterial; orange: MeshStandardMaterial } | null = null;

/** 14 mm knuckle post that fills the joint between stations and locks the spines, with the orange quick-release latch. */
export function KnucklePost({ x, z }: { x: number; z: number }) {
  const s = useMemo(
    () =>
      (shared ??= {
        post: new CylinderGeometry(0.007, 0.007, 0.43, 20),
        latch: new CylinderGeometry(0.0095, 0.0095, 0.012, 20),
        metal: new MeshPhysicalMaterial({ color: "#a3a8ae", metalness: 0.9, roughness: 0.4 }),
        orange: new MeshStandardMaterial({ color: "#ff6a1a", roughness: 0.45 }),
      }),
    [],
  );
  return (
    <group position={[x, 0, z]}>
      <mesh geometry={s.post} material={s.metal} position-y={0.217} castShadow />
      <mesh geometry={s.latch} material={s.orange} position-y={0.44} />
    </group>
  );
}
