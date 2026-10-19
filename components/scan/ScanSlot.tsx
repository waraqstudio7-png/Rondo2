"use client";

import dynamic from "next/dynamic";

const ScanGame = dynamic(() => import("./ScanGame"), { ssr: false, loading: () => <div className="scan-stage face" style={{ minHeight: 420 }} /> });

export default function ScanSlot() {
  return <ScanGame />;
}
