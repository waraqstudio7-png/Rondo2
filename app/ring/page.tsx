import type { Metadata } from "next";
import { NextFixture, PageHead } from "@/components/Page";
import RingSlot from "@/components/ring/RingSlot";

export const metadata: Metadata = { title: "Build your ring", description: "Turn the ring, change the station count, and see the size, footprint and mass of 4, 6, 12, 16 or 20 stations." };

const RULES = [
  ["The ball never leaves.", "In a closed ring a miss comes back off the next face. No retrieval, so far more reps per minute than an open arc."],
  ["Cost and mass scale with the count.", "16 stations is about 2.7 times the hardware of 6. Lighting every other station halves the electronics: the passive ones are plain walls."],
  ["Power gets serious.", "16 stations carry about 15 m of light line, so each station takes its own feed from a 24 V bus."],
  ["Getting in is a design problem.", "The spine sits 436 mm off the floor. In a closed ring one station becomes a gate that swings on its knuckle post."],
];

export default function RingPage() {
  return (
    <div className="page">
      <div className="wrap">
        <PageHead minute="62'" crumb="Build your ring" title="Build your ring." lede="Pick a size, turn it around, light it up. 4 and 6 stations run as an open arc for the garden; 12, 16 and 20 lock into a closed ring with no gaps." />
        <div className="block"><RingSlot /></div>
        <div className="block rules2">
          <span className="mono muted">What closing the ring changes</span>
          {RULES.map(([h, p], i) => (
            <div key={h} className="rule"><span className="mono minute">0{i + 1}</span><div><strong>{h}</strong> <span className="muted">{p}</span></div></div>
          ))}
        </div>
        <NextFixture href="/line-up" minute="60'" title="The line-up" />
      </div>
    </div>
  );
}
