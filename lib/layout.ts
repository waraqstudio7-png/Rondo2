import { mm } from "./station";

/** Ring layouts. Faces are 1000 mm; a closed ring joins neighbours with 14 mm knuckle posts, so there are no gaps. */
export const FACE_W = 1.0;
export const POST_W = 0.014;
export const PLINTH_DEPTH = mm(329);
export const MASS_FILLED_KG = 22; // rev D estimate
export const OPEN_RADIUS = 2.5;   // brief: 2.5 m passing radius

export type Slot = { x: number; z: number; yaw: number; angle: number };
export type Layout = { slots: Slot[]; posts: { x: number; z: number }[]; closed: boolean; radius: number };

const slot = (r: number, a: number): Slot => ({ x: r * Math.cos(a), z: r * Math.sin(a), yaw: -a - Math.PI / 2, angle: a });

/** Closed regular polygon: the apothem is set by the side length (face + post), so the count fixes the size. */
export function closedRing(n: number): Layout {
  const side = FACE_W + POST_W, apo = side / (2 * Math.tan(Math.PI / n)), vr = apo / Math.cos(Math.PI / n);
  const slots: Slot[] = [], posts: { x: number; z: number }[] = [];
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    slots.push(slot(apo, a));
    const pa = a + Math.PI / n;
    posts.push({ x: vr * Math.cos(pa), z: vr * Math.sin(pa) });
  }
  return { slots, posts, closed: true, radius: apo };
}

/** Open arc at the 2.5 m passing radius (Street sets), centred on the far side, 0.3 m between faces. */
export function openArc(n: number, r = OPEN_RADIUS): Layout {
  const step = (FACE_W + 0.3) / r;
  const slots = Array.from({ length: n }, (_, i) => slot(r, -Math.PI / 2 + (i - (n - 1) / 2) * step));
  return { slots, posts: [], closed: false, radius: r };
}

export const layoutFor = (n: number) => (n <= 6 ? openArc(n) : closedRing(n));

export function ringStats(n: number) {
  const L = layoutFor(n);
  const inside = 2 * L.radius;
  const footprint = L.closed ? 2 * (L.radius / Math.cos(Math.PI / n) + PLINTH_DEPTH) : 2 * (L.radius + PLINTH_DEPTH);
  return {
    closed: L.closed,
    inside,
    playerToFace: L.radius,
    footprint,
    mass: n * MASS_FILLED_KG,
    lightLine: n * 0.96,
  };
}
