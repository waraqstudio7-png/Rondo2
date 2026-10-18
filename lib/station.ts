/**
 * Rev D station geometry, copied from the CAD (station_revD.py, veneer_revD.py). Units: mm.
 * CAD frame: X along the face, Y toward the REAR, Z up. The player is on the -Y side.
 * Scene frame used by the 3D components: metres, x = X, y = Z, z = -Y (so +z faces the player).
 */
export const FACE = { w: 1000, h: 400, t: 20, floorGap: 10 };
export const SLOT_HALF = 10.2;
export const TOPZ = 436;

/** Spine cross-section (Y, Z) with the 45 degree light chamfer on the player side. */
export const SPINE_PROFILE: [number, number][] = [
  [-16.2, 384], [-16.2, 420], [-0.2, 436], [34.2, 436], [40.2, 430],
  [40.2, 370], [10.2, 370], [10.2, 410.2], [-10.2, 410.2], [-10.2, 384],
];
/** Light line: centre of the chamfer face, and its width along the chamfer. */
export const CHAMFER_MID: [number, number] = [-8.2, 428];
export const DIFFUSER = { len: 960, width: 11.8 };
export const SPINE_JOINTS = [-310, -120, 120, 310];
export const SPINE_SCREWS_X = [-455, -355, -265, -165, -70, 70, 165, 265, 355, 455];
export const SCREW_Z = 392;

/** Plinth (shoe + ballast tank) side profile, with the face slot and the 32 mm toe lip. */
export const PLINTH_PROFILE: [number, number][] = [
  [-18.2, 0], [329, 0], [329, 56], [49, 120], [10.2, 120], [10.2, 10], [-10.2, 10], [-10.2, 32], [-18.2, 32],
];
export const PLINTH_X = [-430, 0, 430];
export const PLINTH_W = 140;
export const SHOE_TANK_JOINT_Y = 79;
/** Fill port (orange cap) on the tank. */
export const PORT = { y: 259, seatTop: 78, r: 22 };

/** Hex Focus veneer pattern. */
export const HEX = {
  r: 21,
  lineMax: 2.2,
  lineMin: 0.9,
  strikeV: 100, // above the face bottom (ball centre ~110 mm above the floor)
  win: { w: 200, h: 140, r: 18 },
  tilesTop: [-250, 0, 250],
  tilesBottom: [-375, -125, 125, 375],
};

export const mm = (v: number) => v / 1000;
