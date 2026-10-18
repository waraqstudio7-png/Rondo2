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
export function ballTextures() {
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
  const col = document.createElement("canvas"), bump = document.createElement("canvas");
  col.width = bump.width = W;
  col.height = bump.height = H;
  const ci = col.getContext("2d")!.createImageData(W, H), bi = bump.getContext("2d")!.createImageData(W, H);
  for (let y = 0; y < H; y++) {
    const lat = (0.5 - (y + 0.5) / H) * Math.PI, cl = Math.cos(lat), sl = Math.sin(lat);
    for (let x = 0; x < W; x++) {
      const lon = ((x + 0.5) / W) * 2 * Math.PI - Math.PI;
      const d = [cl * Math.cos(lon), sl, -cl * Math.sin(lon)];
      let b1 = -2, b2 = -2, i1 = 0;
      for (let i = 0; i < 32; i++) {
        const v = centres[i].v, dot = d[0] * v[0] + d[1] * v[1] + d[2] * v[2];
        if (dot > b1) { b2 = b1; b1 = dot; i1 = i; } else if (dot > b2) b2 = dot;
      }
      const seam = Math.min(1, (b1 - b2) / 0.012); // 0 on the seam, 1 inside a panel
      const pent = centres[i1].pent;
      const base = pent ? 22 : 238;
      const shade = Math.round(base * (0.55 + 0.45 * seam));
      const k = (y * W + x) * 4;
      ci.data[k] = shade; ci.data[k + 1] = shade; ci.data[k + 2] = pent ? shade + 2 : shade - 4; ci.data[k + 3] = 255;
      const bv = Math.round(255 * Math.pow(seam, 0.5));
      bi.data[k] = bi.data[k + 1] = bi.data[k + 2] = bv; bi.data[k + 3] = 255;
    }
  }
  col.getContext("2d")!.putImageData(ci, 0, 0);
  bump.getContext("2d")!.putImageData(bi, 0, 0);
  const map = new CanvasTexture(col), bumpMap = new CanvasTexture(bump);
  map.colorSpace = SRGBColorSpace;
  map.anisotropy = bumpMap.anisotropy = 8;
  return { map, bumpMap };
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
        c.fillStyle = i % 2 ? "#285a26" : "#31692d";
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
