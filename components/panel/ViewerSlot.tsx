"use client";

import dynamic from "next/dynamic";

const StationViewer = dynamic(() => import("./StationViewer"), {
  ssr: false,
  loading: () => <div className="viewer" aria-hidden="true" />,
});

export default function ViewerSlot() {
  return <StationViewer />;
}
