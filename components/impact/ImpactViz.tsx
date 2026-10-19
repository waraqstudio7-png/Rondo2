"use client";

import { useState } from "react";

/**
 * Impact preview. Pick a cause, drag the slider, watch the mesh ball bag (10 balls) or the bottle fill.
 * The pledge is not set yet, so every number here is an example and labelled as one.
 */
const BAG = 10;

function Ball({ x, y, r, i }: { x: number; y: number; r: number; i: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${(i * 47) % 360})`}>
      <circle r={r} fill="#efede6" stroke="#0b0e10" strokeWidth="1.2" />
      <path d={`M0 ${-r * 0.42} l${r * 0.4} ${r * 0.29} l${-r * 0.15} ${r * 0.47} h${-r * 0.5} l${-r * 0.15} ${-r * 0.47} z`} fill="#1d1f20" />
    </g>
  );
}

function BagSvg({ n }: { n: number }) {
  // Balls settle bottom-up in rows of 4, 3, 2, 1 inside a tapered mesh bag.
  const rows = [4, 3, 2, 1], r = 17, pos: [number, number][] = [];
  let y = 238;
  rows.forEach((k) => { for (let j = 0; j < k; j++) pos.push([150 + (j - (k - 1) / 2) * r * 2.05, y]); y -= r * 1.75; });
  return (
    <svg viewBox="0 0 300 300" className="impact-svg" aria-hidden="true">
      <defs>
        <pattern id="mesh" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0 L0 12 M0 0 L12 0" stroke="rgba(243,241,234,.32)" strokeWidth="1.2" />
        </pattern>
      </defs>
      {pos.slice(0, n).map(([x, yy], i) => <Ball key={i} x={x} y={yy} r={r} i={i} />)}
      <path d="M78 96 Q150 82 222 96 L240 250 Q150 282 60 250 Z" fill="url(#mesh)" stroke="rgba(243,241,234,.5)" strokeWidth="2" />
      <path d="M78 96 Q150 82 222 96" fill="none" stroke="var(--flood)" strokeWidth="3" />
      <path d="M150 88 C140 60 120 52 104 46 M150 88 C160 60 180 52 196 46" fill="none" stroke="var(--flood)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function BottleSvg({ f }: { f: number }) {
  const top = 92, bottom = 268, h = (bottom - top) * f;
  return (
    <svg viewBox="0 0 300 300" className="impact-svg" aria-hidden="true">
      <defs>
        <clipPath id="btl"><path d="M128 40 h44 v28 q34 18 34 52 v138 q0 14 -14 14 h-84 q-14 0 -14 -14 v-138 q0 -34 34 -52 z" /></clipPath>
        <linearGradient id="wtr" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#7fd3ff" /><stop offset="1" stopColor="#1f7fb8" /></linearGradient>
      </defs>
      <g clipPath="url(#btl)">
        <rect x="80" y={bottom - h + 4} width="140" height={h + 10} fill="url(#wtr)" opacity=".85" />
        <path d={`M80 ${bottom - h + 4} q35 -8 70 0 t70 0 v8 h-140 z`} fill="#b7e6ff" opacity=".7" />
      </g>
      <path d="M128 40 h44 v28 q34 18 34 52 v138 q0 14 -14 14 h-84 q-14 0 -14 -14 v-138 q0 -34 34 -52 z" fill="none" stroke="rgba(243,241,234,.6)" strokeWidth="2.5" />
      <rect x="124" y="26" width="52" height="16" rx="4" fill="var(--flood)" />
    </svg>
  );
}

export default function ImpactViz() {
  const [cause, setCause] = useState<"ball" | "water">("ball");
  const [rings, setRings] = useState(37);
  const balls = rings; // example rule: one ball per ring sold
  const bags = Math.floor(balls / BAG), inBag = balls % BAG || (balls ? BAG : 0);
  const fill = (rings % 50) / 50 || (rings ? 1 : 0); // example: 50 rings fill one bottle-goal
  return (
    <div className="impact face">
      <div className="impact-stage">{cause === "ball" ? <BagSvg n={inBag} /> : <BottleSvg f={fill} />}</div>
      <div className="impact-side">
        <div className="seg" role="group" aria-label="Cause">
          <span className="seg-k">Cause</span>
          <button aria-pressed={cause === "ball"} onClick={() => setCause("ball")}>Ball bag</button>
          <button aria-pressed={cause === "water"} onClick={() => setCause("water")}>Clean water</button>
        </div>
        <label className="impact-range">
          <span className="mono muted">Rings sold</span>
          <input type="range" min={0} max={500} value={rings} onChange={(e) => setRings(Number(e.target.value))} />
          <b className="h2">{rings}</b>
        </label>
        <div className="figs2">
          {cause === "ball" ? (
            <>
              <div><div className="v">{balls}</div><div className="k mono">Balls given</div></div>
              <div><div className="v">{bags}</div><div className="k mono">Full bags of 10</div></div>
            </>
          ) : (
            <>
              <div><div className="v">{Math.floor(rings / 50)}</div><div className="k mono">Goals reached</div></div>
              <div><div className="v">{Math.round(fill * 100)}<small>%</small></div><div className="k mono">Toward the next</div></div>
            </>
          )}
        </div>
        <p className="note">Example only. The real pledge, partner club or water charity, and amounts are confirmed before launch and shown here with receipts.</p>
      </div>
    </div>
  );
}
