"use client";

import dynamic from "next/dynamic";

const Waitlist = dynamic(() => import("./Waitlist"), { ssr: false, loading: () => <div className="wl face" style={{ minHeight: 320 }} /> });

export default function WaitlistSlot() {
  return <Waitlist />;
}
