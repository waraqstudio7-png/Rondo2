"use client";

import { CanvasTexture, ClampToEdgeWrapping, RepeatWrapping, SRGBColorSpace, Texture } from "three";
import { HEX } from "@/lib/station";

function make(w: number, h: number, draw: (c: CanvasRenderingContext2D, w: number, h: number) => void, srgb = true): Texture {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  draw(cv.getContext("2d")!, w, h);
  const t = new CanvasTexture(cv);
  if (srgb) t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

const cache = new Map<string, Texture>();
const once = (k: string, f: () => Texture) => {
  let t = cache.get(k);
  if (!t) cache.set(k, (t = f()));
  return t;
};

/** Small deterministic PRNG so textures look the same on every load. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/**
 * The "Hex Focus" veneer exactly as specified in veneer_revD.py: charcoal body, black hex lattice whose lines
 * thin from 2.2 mm at the ends to 0.9 mm near the target, a 200 x 140 mm R18 aim window centred 100 mm up,
 * a split strike line with a centre tick, and the brick-bond tile seams. 2 px per mm.
 */
export function hexFocusTexture() {
  return once("hex", () =>
    make(2000, 800, (c, W, H) => {
      const P = 2;
      const X = (u: number) => (u + 500) * P;
      const Y = (v: number) => H - v * P;
      c.fillStyle = "#24292b";
      c.fillRect(0, 0, W, H);
      // subtle print texture: fine horizontal layer lines from FDM printing
      c.globalAlpha = 0.05;
      c.fillStyle = "#000";
      for (let y = 0; y < H; y += 2 * P * 0.2 * 5) c.fillRect(0, y, W, 1);
      c.globalAlpha = 1;
      const win = { x0: -100, x1: 100, y0: HEX.strikeV - 70, y1: HEX.strikeV + 70 };
      const distWin = (u: number, v: number) => {
        const dx = Math.max(win.x0 - u, 0, u - win.x1), dy = Math.max(win.y0 - v, 0, v - win.y1);
        return Math.hypot(dx, dy);
      };
      const r = HEX.r, apo = (r * Math.sqrt(3)) / 2;
      c.strokeStyle = "#0c0e0f";
      c.lineJoin = "round";
      for (let row = -12; row <= 12; row++) {
        const cy = 200 + row * 1.5 * r;
        const off = row % 2 ? apo : 0;
        for (let col = -14; col <= 14; col++) {
          const cx = col * 2 * apo + off;
          const d = distWin(cx, cy);
          if (d < r * 0.6) continue; // the aim window stays clean
          const k = Math.min(1, d / 380);
          const lw = HEX.lineMin + (HEX.lineMax - HEX.lineMin) * Math.pow(k, 0.8);
          c.lineWidth = lw * P;
          c.beginPath();
          for (let q = 0; q < 6; q++) {
            const a = Math.PI / 6 + (q * Math.PI) / 3;
            c.lineTo(X(cx + r * Math.cos(a)), Y(cy + r * Math.sin(a)));
          }
          c.closePath();
          c.stroke();
        }
      }
      // aim window, strike line, centre tick (white inlay)
      c.fillStyle = "#24292b";
      c.strokeStyle = "#e9ece8";
      c.lineWidth = 1.6 * P;
      c.beginPath();
      c.roundRect(X(win.x0), Y(win.y1), 200 * P, 140 * P, 18 * P);
      c.fill();
      c.stroke();
      c.lineWidth = 1.4 * P;
      c.beginPath();
      c.moveTo(X(-82), Y(HEX.strikeV)); c.lineTo(X(-8), Y(HEX.strikeV));
      c.moveTo(X(8), Y(HEX.strikeV)); c.lineTo(X(82), Y(HEX.strikeV));
      c.moveTo(X(0), Y(HEX.strikeV - 7)); c.lineTo(X(0), Y(HEX.strikeV + 7));
      c.stroke();
      // brick-bond tile seams (0.3 mm), barely visible as deliberate panel lines
      c.strokeStyle = "rgba(0,0,0,.55)";
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(0, Y(200)); c.lineTo(W, Y(200));
      for (const u of HEX.tilesTop) { c.moveTo(X(u), Y(400)); c.lineTo(X(u), Y(200)); }
      for (const u of HEX.tilesBottom) { c.moveTo(X(u), Y(200)); c.lineTo(X(u), Y(0)); }
      c.stroke();
    }),
  );
}

/** Raw birch back of the plywood face: pale wood with soft grain. */
export function birchTexture() {
  return once("birch", () =>
    make(1024, 512, (c, W, H) => {
      const R = rng(7);
      const g = c.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#d9c39c");
      g.addColorStop(1, "#cfb68c");
      c.fillStyle = g;
      c.fillRect(0, 0, W, H);
      for (let i = 0; i < 140; i++) {
        const y = R() * H, a = 0.03 + R() * 0.06;
        c.strokeStyle = `rgba(120,85,45,${a})`;
        c.lineWidth = 0.6 + R() * 2.2;
        c.beginPath();
        c.moveTo(0, y);
        for (let x = 0; x <= W; x += 32) c.lineTo(x, y + Math.sin(x / (60 + R() * 40) + i) * (2 + R() * 3));
        c.stroke();
      }
    }),
  );
}

/** Plywood edge: 13 birch plies plus the 2 mm charcoal veneer on the player side (left of the texture). */
export function plyEdgeTexture() {
  return once("ply", () => {
    const t = make(200, 16, (c, W, H) => {
      const vene = W * 0.1;
      c.fillStyle = "#24292b";
      c.fillRect(0, 0, vene, H);
      const n = 13, pw = (W - vene) / n;
      for (let i = 0; i < n; i++) {
        c.fillStyle = i % 2 ? "#d4bc92" : "#c6a97b";
        c.fillRect(vene + i * pw, 0, pw, H);
        c.fillStyle = "rgba(90,60,30,.35)";
        c.fillRect(vene + i * pw, 0, 1, H);
      }
    });
    t.wrapS = ClampToEdgeWrapping;
    return t;
  });
}

/**
 * A real match ball: the 32-panel truncated icosahedron (12 black pentagons, 20 white hexagons) is exactly the
 * spherical Voronoi diagram of the 12 icosahedron vertices plus the 20 face centres. Each texel finds its nearest
 * two centres; the gap between them draws the stitched seam. Returns colour map and a bump map for the seams.
 */
export type BallStyle = "leather" | "pentagon" | "bonded8" | "winter" | "rondo";
export const BALL_STYLES: { id: BallStyle; name: string; note: string }[] = [
  { id: "leather", name: "Laced leather", note: "1950s · 18 panels" },
  { id: "pentagon", name: "Black pentagons", note: "1970s · 32 panels" },
  { id: "bonded8", name: "Bonded 8", note: "2010s · 8 panels" },
  { id: "winter", name: "Hi-vis winter", note: "Snow and fog" },
  { id: "rondo", name: "RONDO training", note: "Ours" },
];

const ballCache: Partial<Record<BallStyle, { map: CanvasTexture; bumpMap: CanvasTexture; roughnessMap: CanvasTexture }>> = {};

/**
 * Size 5 ball skins, all unbranded and era-inspired (no maker marks or signature graphics).
 * Equirectangular colour, bump and roughness maps with scuffs, grass and mud so the ball reads as used, not new.
 */
export function ballTextures(style: BallStyle = "pentagon") {
  if (ballCache[style]) return ballCache[style]!;
  const p = (1 + Math.sqrt(5)) / 2;
  const V: [number, number, number][] = [
    [-1, p, 0], [1, p, 0], [-1, -p, 0], [1, -p, 0], [0, -1, p], [0, 1, p],
    [0, -1, -p], [0, 1, -p], [p, 0, -1], [p, 0, 1], [-p, 0, -1], [-p, 0, 1],
  ];
  const F = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];
  const norm = (v: number[]) => { const l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; };
  const centres = [
    ...V.map((v) => ({ v: norm(v), pent: true })),
    ...F.map(([a, b, c]) => ({ v: norm([V[a][0] + V[b][0] + V[c][0], V[a][1] + V[b][1] + V[c][1], V[a][2] + V[b][2] + V[c][2]]), pent: false })),
  ];
  const W = 1024, H = 512;
  const col = document.createElement("canvas"), bump = document.createElement("canvas"), rough = document.createElement("canvas");
  col.width = bump.width = rough.width = W;
  col.height = bump.height = rough.height = H;
  const ci = col.getContext("2d")!.createImageData(W, H), bi = bump.getContext("2d")!.createImageData(W, H), ri = rough.getContext("2d")!.createImageData(W, H);
  const R = rng(style.length * 97 + 7);
  // Low-frequency wear field: a few scuff blobs and grass/mud smears on the sphere.
  const marks = Array.from({ length: style === "leather" ? 26 : 16 }, () => {
    const v = norm([R() * 2 - 1, R() * 2 - 1, R() * 2 - 1]);
    return { v, r: 0.04 + R() * 0.16, kind: R() < 0.45 ? 0 : R() < 0.6 ? 1 : 2, a: 0.25 + R() * 0.5 };
  });
  for (let y = 0; y < H; y++) {
    const lat = (0.5 - (y + 0.5) / H) * Math.PI, cl = Math.cos(lat), sl = Math.sin(lat);
    for (let x = 0; x < W; x++) {
      const lon = ((x + 0.5) / W) * 2 * Math.PI - Math.PI;
      const d = [cl * Math.cos(lon), sl, -cl * Math.sin(lon)];
      let rC = 0, gC = 0, bC = 0, seam = 1, rgh = 0.45;
      if (style === "leather") {
        // 6 groups of 3 parallel strips (cube faces), like pre-1960s balls.
        const ax = [Math.abs(d[0]), Math.abs(d[1]), Math.abs(d[2])];
        const m = ax[0] > ax[1] ? (ax[0] > ax[2] ? 0 : 2) : ax[1] > ax[2] ? 1 : 2;
        const u = d[(m + 1) % 3] / ax[m], w = d[(m + 2) % 3] / ax[m];
        const sAxis = m % 2 === 0 ? u : w; // alternate strip direction per face
        const strip = Math.floor((sAxis + 1) * 1.5);
        const f = Math.abs(((sAxis + 1) * 1.5) % 1 - 0.5);
        const edge = 1 - Math.max(Math.abs(u), Math.abs(w));
        seam = Math.min(1, Math.min((0.5 - f) / 0.04, edge / 0.02));
        const tone = [0.0, 0.06, -0.04][strip % 3] + (m % 3) * 0.02;
        rC = 128 * (1 + tone); gC = 78 * (1 + tone); bC = 44 * (1 + tone);
        // Lace slit on the +y face centre strip.
        if (m === 1 && d[1] > 0 && Math.abs(u) < 0.05 && Math.abs(w) < 0.33) {
          const zig = Math.abs(((w * 30) % 1 + 1) % 1 - 0.5);
          if (zig < 0.28) { rC = 205; gC = 175; bC = 120; seam = 0.7; }
          else { rC = 40; gC = 22; bC = 12; seam = 0.2; }
        }
        rgh = 0.62;
      } else if (style === "bonded8") {
        // 8 thermally bonded panels: octants with seams bent into S-curves (no stitching, no maker graphics).
        const wx = d[0] + 0.22 * Math.sin(2.6 * d[1]), wy = d[1] + 0.22 * Math.sin(2.6 * d[2]), wz = d[2] + 0.22 * Math.sin(2.6 * d[0]);
        const mn = Math.min(Math.abs(wx), Math.abs(wy), Math.abs(wz));
        seam = Math.min(1, mn / 0.02);
        const oct = (wx > 0 ? 1 : 0) + (wy > 0 ? 2 : 0) + (wz > 0 ? 4 : 0);
        [rC, gC, bC] = [242, 241, 236];
        // Our accent: a thin graphite swirl line inside each panel, alternating with a chalk-green one.
        const swirl = Math.abs(mn - 0.16);
        if (swirl < 0.012) [rC, gC, bC] = oct % 2 ? [44, 50, 54] : [43, 190, 120];
        rgh = 0.36;
      } else {
        let b1 = -2, b2 = -2, i1 = 0;
        for (let i = 0; i < 32; i++) {
          const v = centres[i].v, dot = d[0] * v[0] + d[1] * v[1] + d[2] * v[2];
          if (dot > b1) { b2 = b1; b1 = dot; i1 = i; } else if (dot > b2) b2 = dot;
        }
        seam = Math.min(1, (b1 - b2) / 0.012);
        const pent = centres[i1].pent;
        if (style === "pentagon") {
          [rC, gC, bC] = pent ? [24, 24, 26] : [236, 233, 222];
        } else if (style === "winter") {
          [rC, gC, bC] = pent ? [22, 30, 58] : [255, 238, 34];
        } else {
          // RONDO training ball: chalk white, graphite pentagons with a green ring, one green great-circle band.
          const dotC = centres[i1].v, dd = d[0] * dotC[0] + d[1] * dotC[1] + d[2] * dotC[2];
          if (pent) [rC, gC, bC] = dd > 0.955 ? [32, 36, 38] : [43, 216, 131];
          else [rC, gC, bC] = [240, 239, 233];
          if (!pent && Math.abs(d[1] * 0.8 + d[0] * 0.6) < 0.012) [rC, gC, bC] = [43, 216, 131];
        }
        rgh = 0.4;
      }
      // Wear: scuffs lighten and roughen, grass tints green, mud darkens.
      for (const mk of marks) {
        const dot = d[0] * mk.v[0] + d[1] * mk.v[1] + d[2] * mk.v[2];
        const t = (dot - (1 - mk.r)) / mk.r;
        if (t <= 0) continue;
        const n = R() * 0.5 + 0.5, a = Math.min(1, t * 1.6) * mk.a * n;
        if (mk.kind === 0) { rC += (200 - rC) * a * 0.35; gC += (195 - gC) * a * 0.35; bC += (185 - bC) * a * 0.35; rgh += a * 0.25; }
        else if (mk.kind === 1) { rC += (70 - rC) * a * 0.4; gC += (105 - gC) * a * 0.4; bC += (45 - bC) * a * 0.4; }
        else { rC += (60 - rC) * a * 0.45; gC += (46 - gC) * a * 0.45; bC += (32 - bC) * a * 0.45; rgh += a * 0.2; }
      }
      const grain = 1 + (R() - 0.5) * (style === "leather" ? 0.16 : 0.05);
      const sh = (0.5 + 0.5 * seam) * grain;
      const k = (y * W + x) * 4;
      ci.data[k] = Math.min(255, rC * sh); ci.data[k + 1] = Math.min(255, gC * sh); ci.data[k + 2] = Math.min(255, bC * sh); ci.data[k + 3] = 255;
      const bv = Math.round(255 * Math.pow(seam, 0.5) * (style === "leather" ? 0.92 + R() * 0.08 : 1));
      bi.data[k] = bi.data[k + 1] = bi.data[k + 2] = bv; bi.data[k + 3] = 255;
      const rv = Math.round(255 * Math.min(1, rgh + (1 - seam) * 0.3));
      ri.data[k] = ri.data[k + 1] = ri.data[k + 2] = rv; ri.data[k + 3] = 255;
    }
  }
  col.getContext("2d")!.putImageData(ci, 0, 0);
  bump.getContext("2d")!.putImageData(bi, 0, 0);
  rough.getContext("2d")!.putImageData(ri, 0, 0);
  const map = new CanvasTexture(col), bumpMap = new CanvasTexture(bump), roughnessMap = new CanvasTexture(rough);
  map.colorSpace = SRGBColorSpace;
  map.anisotropy = bumpMap.anisotropy = roughnessMap.anisotropy = 8;
  return (ballCache[style] = { map, bumpMap, roughnessMap });
}

/**
 * Pitch base under the grass blades: mowing stripes, fine turf noise, painted lines (9.15 m centre circle,
 * halfway line, centre spot). size = metres covered.
 */
export function pitchTexture(size: number) {
  return once(`pitch${size}`, () => {
    const t = make(2048, 2048, (c, W, H) => {
      const k = W / size, R = rng(11);
      const stripe = 5; // mown stripes ~5 m wide
      for (let x = 0, i = 0; x < W; x += stripe * k, i++) {
        c.fillStyle = i % 2 ? "#33601b" : "#3c6c1f";
        c.fillRect(x - ((size / 2) % stripe) * k, 0, stripe * k, H);
      }
      for (let n = 0; n < 90000; n++) {
        const a = R() * 0.12;
        c.fillStyle = R() > 0.5 ? `rgba(10,30,14,${a})` : `rgba(120,170,100,${a * 0.7})`;
        c.fillRect(R() * W, R() * H, 1 + R() * 2, 1 + R() * 3);
      }
      c.strokeStyle = "rgba(225,230,220,.62)";
      c.lineWidth = 0.12 * k;
      c.beginPath(); c.arc(W / 2, H / 2, 9.15 * k, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.moveTo(0, H / 2); c.lineTo(W, H / 2); c.stroke();
      c.fillStyle = "rgba(240,244,236,.9)";
      c.beginPath(); c.arc(W / 2, H / 2, 0.11 * k, 0, Math.PI * 2); c.fill();
    });
    t.wrapS = t.wrapT = RepeatWrapping;
    return t;
  });
}

/** Soft radial sprite for light bloom halos. */
export function glowTexture() {
  return once("glow", () =>
    make(128, 64, (c) => {
      const g = c.createRadialGradient(64, 32, 0, 64, 32, 64);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.3, "rgba(255,255,255,.3)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = g;
      c.fillRect(0, 0, 128, 64);
    }, false),
  );
}

/** Radial alpha so the near-field pitch melts into the stadium backdrop instead of ending at a hard edge. */
export function radialFadeTexture(inner = 0.6, outer = 1) {
  return once(`fade${inner}`, () =>
    make(512, 512, (c, W) => {
      const g = c.createRadialGradient(W / 2, W / 2, (W / 2) * inner, W / 2, W / 2, (W / 2) * outer);
      g.addColorStop(0, "#fff");
      g.addColorStop(1, "#000");
      c.fillStyle = g;
      c.fillRect(0, 0, W, W);
    }, false),
  );
}

/**
 * Engine Bay hex finish: satin charcoal laminate with matte etched grooves (21 mm cells, <= 0.3 mm relief).
 * withTarget adds the Hex Focus aim window and strike line (player side). Returns colour + roughness maps,
 * so the pattern reads from a distance as a change in sheen, the way an etched face catches floodlight.
 */
export function hexFinishTextures(withTarget: boolean) {
  const key = withTarget ? "hexT" : "hexB";
  const W = 2000, H = 800, P = 2;
  const draw = (rough: boolean) => (c: CanvasRenderingContext2D) => {
    const X = (u: number) => (u + 500) * P, Y = (v: number) => H - v * P;
    c.fillStyle = rough ? "#5a5a5a" : "#2e3236"; // satin cells
    c.fillRect(0, 0, W, H);
    const win = { x0: -100, x1: 100, y0: HEX.strikeV - 70, y1: HEX.strikeV + 70 };
    const distWin = (u: number, v: number) => Math.hypot(Math.max(win.x0 - u, 0, u - win.x1), Math.max(win.y0 - v, 0, v - win.y1));
    const r = HEX.r, apo = (r * Math.sqrt(3)) / 2;
    c.strokeStyle = rough ? "#f2f2f2" : "#0b0c0d"; // matte grooves
    for (let row = -12; row <= 12; row++) {
      const cy = 200 + row * 1.5 * r, off = row % 2 ? apo : 0;
      for (let col = -14; col <= 14; col++) {
        const cx = col * 2 * apo + off;
        let lw = 2.6; // rear face: uniform etched hex, bold enough to read across the ring
        if (withTarget) {
          const d = distWin(cx, cy);
          if (d < r * 0.6) continue;
          lw = HEX.lineMin + (HEX.lineMax - HEX.lineMin) * Math.pow(Math.min(1, d / 380), 0.8);
        }
        c.lineWidth = lw * P;
        c.beginPath();
        for (let q = 0; q < 6; q++) {
          const a = Math.PI / 6 + (q * Math.PI) / 3;
          c.lineTo(X(cx + r * Math.cos(a)), Y(cy + r * Math.sin(a)));
        }
        c.closePath();
        c.stroke();
      }
    }
    if (withTarget) {
      c.fillStyle = rough ? "#3a3a3a" : "#2e3236";
      c.strokeStyle = rough ? "#808080" : "#eef0ec";
      c.lineWidth = 1.6 * P;
      c.beginPath();
      c.roundRect(X(win.x0), Y(win.y1), 200 * P, 140 * P, 18 * P);
      c.fill();
      c.stroke();
      c.lineWidth = 1.4 * P;
      c.beginPath();
      c.moveTo(X(-82), Y(HEX.strikeV)); c.lineTo(X(-8), Y(HEX.strikeV));
      c.moveTo(X(8), Y(HEX.strikeV)); c.lineTo(X(82), Y(HEX.strikeV));
      c.moveTo(X(0), Y(HEX.strikeV - 7)); c.lineTo(X(0), Y(HEX.strikeV + 7));
      c.stroke();
    }
  };
  const map = once(key + "c", () => make(W, H, draw(false)));
  const roughnessMap = once(key + "r", () => make(W, H, draw(true), false));
  return { map, roughnessMap };
}
