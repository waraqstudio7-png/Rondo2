"use client";

import { forwardRef, useMemo } from "react";
import type { ThreeElements } from "@react-three/fiber";
import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Shape,
} from "three";
import {
  CHAMFER_MID, DIFFUSER, FACE, PLINTH_PROFILE, PLINTH_W, PLINTH_X, PORT, SCREW_Z, SPINE_JOINTS,
  SPINE_PROFILE, SPINE_SCREWS_X, mm,
} from "@/lib/station";
import { hexFinishTextures, plyEdgeTexture } from "./textures";

/** Extrude a CAD (Y, Z) profile along X, centred, into scene space (x = X, y = Z, z = -Y). */
function extrudeProfile(pts: [number, number][], length: number) {
  const s = new Shape();
  pts.forEach(([Y, Z], i) => (i ? s.lineTo(-mm(Y), mm(Z)) : s.moveTo(-mm(Y), mm(Z))));
  s.closePath();
  const g = new ExtrudeGeometry(s, { depth: length, bevelEnabled: true, bevelThickness: 0.0012, bevelSize: 0.0008, bevelSegments: 2 });
  g.rotateY(-Math.PI / 2);
  g.translate(length / 2, 0, 0);
  g.computeVertexNormals();
  return g;
}

let shared: ReturnType<typeof build> | null = null;
function build() {
  const faceGeo = new BoxGeometry(mm(FACE.w), mm(FACE.h), mm(FACE.t));
  const edge = plyEdgeTexture();
  const edgeMat = new MeshStandardMaterial({ map: edge, roughness: 0.8 });
  // Engine Bay finish: black laminate both sides, satin hex cells and matte etched grooves (sheen carries the pattern)
  const front = hexFinishTextures(true), back = hexFinishTextures(false);
  const faceFront = new MeshPhysicalMaterial({ map: front.map, roughnessMap: front.roughnessMap, roughness: 1, metalness: 0.05, clearcoat: 0.35, clearcoatRoughness: 0.45 });
  const faceBack = new MeshPhysicalMaterial({ map: back.map, roughnessMap: back.roughnessMap, roughness: 1, metalness: 0.05, clearcoat: 0.35, clearcoatRoughness: 0.45 });
  // BoxGeometry material order: +x, -x, +y, -y, +z (player side), -z (rear)
  const faceMats = [edgeMat, edgeMat, edgeMat, edgeMat, faceFront, faceBack];
  const spineGeo = extrudeProfile(SPINE_PROFILE, mm(FACE.w));
  const spineMat = new MeshPhysicalMaterial({ color: "#a7acb2", metalness: 0.8, roughness: 0.48, envMapIntensity: 0.7 }); // bead-blasted anodised aluminium
  const plinthGeo = extrudeProfile(PLINTH_PROFILE, mm(PLINTH_W));
  const plinthMat = new MeshStandardMaterial({ color: "#1e2022", roughness: 0.7, metalness: 0.05 });
  const soleGeo = new BoxGeometry(mm(PLINTH_W + 2), mm(3), mm(349));
  const soleMat = new MeshStandardMaterial({ color: "#070707", roughness: 0.9 });
  const pcbGeo = new BoxGeometry(mm(190), mm(32), mm(1.6));
  const pcbMat = new MeshStandardMaterial({ color: "#0c5a2d", roughness: 0.6 });
  const seatGeo = new CylinderGeometry(mm(PORT.r), mm(PORT.r), mm(8), 32);
  const capGeo = new CylinderGeometry(mm(PORT.r), mm(PORT.r - 1), mm(5), 32);
  const capMat = new MeshStandardMaterial({ color: "#ff6a1a", roughness: 0.45 });
  const diffGeo = new BoxGeometry(mm(DIFFUSER.len), mm(DIFFUSER.width), mm(3));
  const jointGeo = new BoxGeometry(mm(1.2), mm(3), mm(58));
  const jointMat = new MeshStandardMaterial({ color: "#121416", roughness: 0.9 });
  const screwGeo = new CylinderGeometry(mm(4.8), mm(4.8), mm(3), 16);
  const screwMat = new MeshStandardMaterial({ color: "#c9cdd1", metalness: 1, roughness: 0.3 });
  const coverGeo = new BoxGeometry(mm(236), mm(52), mm(3));
  const coverMat = new MeshPhysicalMaterial({ color: "#191a1e", roughness: 0.12, metalness: 0.1, opacity: 0.55, transparent: true, clearcoat: 1 }); // smoked PC
  return { faceGeo, faceMats, spineGeo, spineMat, plinthGeo, plinthMat, soleGeo, soleMat, pcbGeo, pcbMat, seatGeo, capGeo, capMat, diffGeo, jointGeo, jointMat, screwGeo, screwMat, coverGeo, coverMat };
}

export type StationProps = ThreeElements["group"] & {
  /** receives this station's light-line material so the caller can set its colour each frame */
  lightRef?: (m: MeshBasicMaterial | null) => void;
  initialLight?: string;
  shadows?: boolean;
};

/**
 * Rev D station from the CAD dimensions, in the Engine Bay finish: 1000 x 400 x 20 mm face with the hex finish on both
 * sides (Hex Focus aim window on the player side), plywood edges, the aluminium spine with its 45 degree light chamfer, segment joints and rear
 * screws, the smoked electronics-bay cover, and three plinths (shoe + ballast tank) with orange fill caps.
 * Origin: floor level, face centre. +z faces the player.
 */
export const Station = forwardRef<Group, StationProps>(function Station({ lightRef, initialLight = "#3a4a44", shadows = true, ...rest }, ref) {
  const s = useMemo(() => (shared ??= build()), []);
  const lightMat = useMemo(() => {
    const m = new MeshBasicMaterial({ color: new Color(initialLight), toneMapped: false });
    return m;
  }, [initialLight]);
  const cy = mm(CHAMFER_MID[1]), cz = -mm(CHAMFER_MID[0]);
  return (
    <group ref={ref} {...rest}>
      <mesh geometry={s.faceGeo} material={s.faceMats} position={[0, mm(FACE.floorGap + FACE.h / 2), 0]} castShadow={shadows} receiveShadow={shadows} />
      <mesh geometry={s.spineGeo} material={s.spineMat} castShadow={shadows} receiveShadow={shadows} />
      {/* light line on the chamfer: opal diffuser lit by the LED strip */}
      <mesh
        geometry={s.diffGeo}
        position={[0, cy + 0.0012, cz + 0.0012]}
        rotation-x={-Math.PI / 4}
        material={lightMat}
        ref={(m) => lightRef?.(m ? lightMat : null)}
      />
      {SPINE_JOINTS.map((x) => (
        <mesh key={x} geometry={s.jointGeo} material={s.jointMat} position={[mm(x), mm(436.4), mm(-12)]} />
      ))}
      {SPINE_SCREWS_X.map((x) => (
        <mesh key={x} geometry={s.screwGeo} material={s.screwMat} position={[mm(x), mm(SCREW_Z), -mm(40.2) - 0.0015]} rotation-x={Math.PI / 2} />
      ))}
      <mesh geometry={s.pcbGeo} material={s.pcbMat} position={[0, mm(398), -mm(40.2) - 0.001]} />
      <mesh geometry={s.coverGeo} material={s.coverMat} position={[0, mm(400), -mm(40.2) - 0.0035]} />
      {PLINTH_X.map((x) => (
        <group key={x} position={[mm(x), 0, 0]}>
          <mesh geometry={s.plinthGeo} material={s.plinthMat} castShadow={shadows} receiveShadow={shadows} />
          <mesh geometry={s.soleGeo} material={s.soleMat} position={[0, mm(1.5), -mm(155)]} />
          <mesh geometry={s.seatGeo} material={s.plinthMat} position={[0, mm(PORT.seatTop - 4), -mm(PORT.y)]} />
          <mesh geometry={s.capGeo} material={s.capMat} position={[0, mm(PORT.seatTop + 2.5), -mm(PORT.y)]} />
        </group>
      ))}
    </group>
  );
});
