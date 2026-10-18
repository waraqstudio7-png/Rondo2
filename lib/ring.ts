import { Object3D, PerspectiveCamera, Vector3 } from "three";

/** Real-scale ring: 12 panels (1.0 m x 0.4 m) on a 2.4 m radius, centred on the centre spot. */
export const N = 12;
/** Closed 12-station ring: apothem from 1000 mm faces + 14 mm knuckle posts (inside diameter ~3.78 m). */
export const R = 1.014 / (2 * Math.tan(Math.PI / 12));
export const PANEL_W = 1.0;
export const PANEL_H = 0.4;
/** Panels that carry a page, in NAV order. */
export const NAV_IDX = [0, 2, 4, 6, 8, 10];
export const FOV = 36;

export const panelAngle = (i: number, n = N) => -Math.PI / 2 + (i * 2 * Math.PI) / n;

/** Mutable state shared between the 3D scene, the DOM labels and the router (no React re-renders per frame). */
export const ringState = {
  theta: 0.35,
  px: 0,
  py: 0,
  hover: -1,
  passing: null as null | { k: number; t0: number },
};

/** Camera framing. Wide screens put the ring on the right (headline on the left); tall screens put it low. */
export function poseCamera(cam: PerspectiveCamera, w: number, h: number) {
  const asp = w / Math.max(1, h);
  const wide = asp > 1.15;
  // Render a sub-window of a larger virtual frame: wide screens push the ring right, tall screens push it down.
  // The camera aspect must match that full frame, or the image distorts.
  const fw = wide ? w * 1.28 : w, fh = wide ? h : h * 1.45;
  const fov = asp < 1 ? 46 : FOV;
  // Pull back until the 4.8 m ring (plus labels) fits the frame width.
  const fitD = 2.45 / (Math.tan((fov * Math.PI) / 360) * (fw / fh));
  const D = Math.max(wide ? 6.9 : 5.4, fitD);
  const H = wide ? 3.3 : D * 0.6;
  const th = ringState.theta + ringState.px * 0.25;
  cam.fov = fov;
  cam.aspect = fw / fh;
  cam.position.set(Math.sin(th) * D, H - ringState.py * 0.6, Math.cos(th) * D);
  cam.lookAt(0, 0.15, wide ? 0.4 : 0);
  cam.setViewOffset(fw, fh, 0, 0, w, h);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld();
  return D;
}

/** Panel group transform: on the circle, facing the centre (+z toward the player). */
export function panelObject(i: number) {
  const a = panelAngle(i);
  const o = new Object3D();
  o.position.set(R * Math.cos(a), 0, R * Math.sin(a));
  o.lookAt(0, 0, 0);
  o.updateMatrixWorld();
  return o;
}

/** Screen rectangle (stage-relative px) covering a panel's face, used for the shared-element morph. */
export function panelScreenRect(i: number, w: number, h: number, cam?: PerspectiveCamera) {
  const c = cam ?? new PerspectiveCamera(FOV, w / h, 0.1, 80);
  if (!cam) poseCamera(c, w, h);
  const o = panelObject(i);
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [u, v] of [[-0.5, 0], [0.5, 0], [-0.5, 0.46], [0.5, 0.46]]) {
    const p = new Vector3(u, v, 0.04).applyMatrix4(o.matrixWorld).project(c);
    const sx = (p.x * 0.5 + 0.5) * w, sy = (-p.y * 0.5 + 0.5) * h;
    x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy);
  }
  return { x0, y0, x1, y1 };
}

/** A fixed DOM rectangle styled as a panel face, placed over panel k; it morphs into (or out of) a page header. */
export function makePanelProxy(k: number): HTMLElement | null {
  const stage = document.getElementById("stage");
  if (!stage) return null;
  const sr = stage.getBoundingClientRect();
  const r = panelScreenRect(NAV_IDX[k], sr.width, sr.height);
  const el = document.createElement("div");
  el.className = "proxy face";
  el.dataset.proxy = "1";
  Object.assign(el.style, {
    left: `${sr.left + r.x0}px`,
    top: `${sr.top + r.y0}px`,
    width: `${Math.max(24, r.x1 - r.x0)}px`,
    height: `${Math.max(14, r.y1 - r.y0)}px`,
  });
  document.body.appendChild(el);
  return el;
}
