"use client";

import dynamic from "next/dynamic";

const RingBuilder = dynamic(() => import("./RingBuilder"), {
  ssr: false,
  loading: () => <div className="builder-stage" aria-hidden="true" />,
});

export default function RingSlot(props: { initial?: number; litCount?: number; compact?: boolean }) {
  return <RingBuilder {...props} />;
}
