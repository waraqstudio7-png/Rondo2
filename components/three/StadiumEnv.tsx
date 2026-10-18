"use client";

import { useLoader } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { useMemo } from "react";
import { EquirectangularReflectionMapping, SRGBColorSpace, TextureLoader } from "three";
import { GroundedSkybox } from "three/examples/jsm/objects/GroundedSkybox.js";

const ROT = 1.9;

/**
 * Real stadium (Poly Haven "stadium_01", CC0). The panorama is projected onto a ground plane (GroundedSkybox), so the
 * photographed pitch and stands are one continuous image under our turf, graded by the same exposure as the scene:
 * backdrop and pitch always match. The 1k HDR of the same capture lights and reflects the models.
 */
export function StadiumEnv({ intensity = 0.32, height = 1.6, radius = 60 }: { intensity?: number; height?: number; radius?: number }) {
  const tex = useLoader(TextureLoader, "/hdri/stadium_01_bg.jpg");
  const sky = useMemo(() => {
    tex.mapping = EquirectangularReflectionMapping;
    tex.colorSpace = SRGBColorSpace;
    const s = new GroundedSkybox(tex, height, radius, 96);
    s.position.y = height - 0.01;
    s.rotation.y = ROT;
    return s;
  }, [tex, height, radius]);
  return (
    <>
      <primitive object={sky} />
      <Environment files="/hdri/stadium_01_1k.hdr" environmentIntensity={intensity} environmentRotation={[0, ROT, 0]} />
    </>
  );
}
