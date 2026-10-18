"use client";

import { useState } from "react";

const PARTS = [
  { t: "Light spine", d: "A full-length LED bar along the top edge, set back so a lifted ball hits the face, not the lights. Green means play it. Red means it's closed.", at: [300, 60] },
  { t: "Hex Focus face", d: "A 20 mm stiff face: birch core, printed skin. The hex lattice gets finer toward the target, pulling your eye to where the pass should land.", at: [220, 230] },
  { t: "Strike line at 110 mm", d: "Half the diameter of a size 5. A ground pass meets the face at this height, so the aim window sits right there.", at: [550, 320] },
  { t: "Three shoes and ballast", d: "Ends and centre. On two shoes the face would bend about 13 mm and kill the bounce; on three it's about 1 mm (model estimate, in testing). Filled with sand or water, with rubber pads to stop sliding.", at: [550, 434] },
  { t: "Hit sensor", d: "Feels the strike through the face, so the panel knows a ball arrived. Clips on for Street panels.", at: [900, 60] },
] as const;

/** Front view of one panel with dimensions; hotspots and the list select the same part. (3D exploded view lands in build step 4.) */
export default function Anatomy() {
  const [on, setOn] = useState(0);
  return (
    <div className="block anat">
      <div className="diagram rise">
        <svg viewBox="0 0 1100 560" role="img" aria-label="Front view of one panel with dimensions">
          <defs>
            <pattern id="hex" width="36.4" height="63" patternUnits="userSpaceOnUse" patternTransform="scale(.9)">
              <path d="M18.2 0 L36.4 10.5 L36.4 31.5 L18.2 42 L0 31.5 L0 10.5 Z M18.2 42 L18.2 63" fill="none" stroke="rgba(237,243,238,.14)" strokeWidth="1.6" />
            </pattern>
            <linearGradient id="spineG" x1="0" x2="1">
              <stop offset="0" stopColor="#ff4f60" />
              <stop offset=".5" stopColor="#3cf09c" />
              <stop offset="1" stopColor="#3cf09c" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-200%" width="140%" height="500%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>
          <line x1="20" y1="470" x2="1080" y2="470" stroke="rgba(237,243,238,.35)" strokeWidth="2" />
          <g fill="#13291f" stroke="rgba(237,243,238,.3)" strokeWidth="1.5">
            <rect x="88" y="398" width="96" height="72" rx="12" />
            <rect x="502" y="398" width="96" height="72" rx="12" />
            <rect x="916" y="398" width="96" height="72" rx="12" />
          </g>
          <rect x="50" y="62" width="1000" height="400" rx="8" fill="#0d1d17" stroke="rgba(237,243,238,.4)" strokeWidth="1.5" />
          <rect x="50" y="62" width="1000" height="400" rx="8" fill="url(#hex)" />
          <rect x="450" y="290" width="200" height="140" rx="18" fill="#0d1d17" stroke="#edf3ee" strokeWidth="1.6" />
          <path d="M468 360 H542 M558 360 H632 M550 353 V367" stroke="#edf3ee" strokeWidth="2" />
          <rect x="44" y="40" width="1012" height="40" rx="10" fill="#1a3227" stroke="rgba(237,243,238,.35)" strokeWidth="1.5" />
          <rect x="70" y="47" width="960" height="8" rx="4" fill="url(#spineG)" filter="url(#glow)" opacity=".9" />
          <rect x="70" y="47" width="960" height="8" rx="4" fill="url(#spineG)" />
          <circle cx="820" cy="360" r="110" fill="none" stroke="rgba(237,243,238,.35)" strokeDasharray="6 7" strokeWidth="1.5" />
          <g stroke="rgba(237,243,238,.45)" strokeWidth="1" fill="none">
            <path d="M50 512 L1050 512 M50 504 L50 520 M1050 504 L1050 520" />
            <path d="M1076 62 L1076 470 M1068 62 L1084 62 M1068 470 L1084 470" />
            <path d="M700 360 L700 470 M692 360 L708 360" />
          </g>
          <g fontFamily="IBM Plex Mono, monospace" fontSize="15" fill="#8ea397">
            <text x="550" y="540" textAnchor="middle">1000 mm</text>
            <text x="1062" y="270" textAnchor="end" transform="rotate(-90 1062 270)">400 mm face</text>
            <text x="712" y="425">110</text>
            <text x="820" y="235" textAnchor="middle">size 5, ⌀ 216-223</text>
          </g>
          {PARTS.map((p, i) => (
            <g key={p.t} transform={`translate(${p.at[0]} ${p.at[1]})`} style={{ cursor: "pointer" }} onClick={() => setOn(i)}>
              <circle r={i === on ? 15 : 11} fill="#3cf09c" opacity={i === on ? 1 : 0.85} />
              <text y="5" textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="13" fill="#04100b">{i + 1}</text>
            </g>
          ))}
        </svg>
      </div>
      <div className="parts">
        {PARTS.map((p, i) => (
          <button key={p.t} className={`part rise ${i === on ? "on" : ""}`} style={{ ["--i" as string]: i + 1 }} onClick={() => setOn(i)} aria-expanded={i === on}>
            <span className="n">0{i + 1}</span>
            <span>
              <strong>{p.t}</strong>
              <span className="d">{p.d}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
