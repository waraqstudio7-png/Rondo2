"use client";

import dynamic from "next/dynamic";

const RingBuilder = dynamic(() => import("./RingBuilder"), {
  ssr: false,
  loading: () => <div className="builder-stage" aria-hidden="true" />,
});

export default function RingSlot() {
  return <RingBuilder />;
}
