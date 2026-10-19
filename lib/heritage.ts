/**
 * Kit room: how the ball and the boot changed. Editorial history only. Product names are trademarks of their
 * owners and are mentioned for historical reference; RONDO is not affiliated with or endorsed by them.
 * Sources: soccerway.com "A history of World Cup balls" (2022); Wikipedia "Football boot"; adidas news (2022 connected ball); FIFA semi-automated offside page.
 */
export type Era = { year: string; name: string; fact: string; ball?: "leather" | "pentagon" | "bonded8" | "rondo" };

export const BALLS: Era[] = [
  { year: "1930", name: "Two balls, one final", fact: "As the story goes, Argentina and Uruguay each brought their own laced leather ball, and one was used each half.", ball: "leather" },
  { year: "1950", name: "The valve arrives", fact: "The first World Cup ball with a valve instead of laces, so every ball could hold the same pressure.", ball: "leather" },
  { year: "1970", name: "Black and white for TV", fact: "12 black pentagons and 20 white hexagons, so viewers could follow it on black-and-white sets. The shape everyone still draws.", ball: "pentagon" },
  { year: "1986", name: "Fully synthetic", fact: "The first all-synthetic World Cup ball. It stopped soaking up water and getting heavier in the rain.", ball: "pentagon" },
  { year: "2006", name: "Fewer panels, rounder ball", fact: "14 thermally bonded panels and almost no stitching. Truer flight, fewer seams to grip the air.", ball: "bonded8" },
  { year: "2010", name: "The knuckle ball", fact: "Eight 3D-shaped bonded panels. Keepers complained it moved in the air. Every free-kick taker loved it.", ball: "bonded8" },
  { year: "2022", name: "A ball with a sensor", fact: "An inertial sensor inside reported every touch, helping officials with offside calls.", ball: "rondo" },
];

export const BOOTS: Era[] = [
  { year: "1900s", name: "Work boots", fact: "High ankles, hard toe caps and nailed leather studs. About half a kilo each, dry." },
  { year: "1954", name: "Screw-in studs", fact: "Studs you could change for the conditions. West Germany wore them in a rain-soaked World Cup final." },
  { year: "1970s-80s", name: "Soft leather, long tongue", fact: "Lighter kangaroo and calf leather, and the fold-over tongue that covered the laces." },
  { year: "2000s", name: "Synthetics and blades", fact: "Lighter synthetic uppers and bladed soles for grip. Some clubs banned blades after foot injuries." },
  { year: "2010s-now", name: "Knit and laceless", fact: "Knitted uppers, sock collars, and boots with no laces at all. Built to feel like a second skin." },
];
