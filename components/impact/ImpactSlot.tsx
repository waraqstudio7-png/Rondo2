"use client";

import dynamic from "next/dynamic";

const ImpactViz = dynamic(() => import("./ImpactViz"), { ssr: false, loading: () => <div className="impact face" style={{ minHeight: 360 }} /> });

export default function ImpactSlot() {
  return <ImpactViz />;
}
