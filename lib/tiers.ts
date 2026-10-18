// Product line. Prices are target pre-order prices in CAD; specs are design targets (see Project docs).
export type Tier = {
  slug: string;
  name: string;
  who: string;
  lede: string;
  price: string;
  priceNote?: string;
  bullets: string[];
  specs: [string, string][];
  box: string[];
  cta: string;
  ring: { panels: number; lit: number; open?: boolean };
  flood?: boolean;
  tag?: string;
};

export const TIERS: Tier[] = [
  {
    slug: "street",
    name: "Street",
    who: "Home · Ages 8+",
    lede: "The back-garden ring. Four light, fillable panels that pack flat and are low enough to step over, built for daily reps.",
    price: "$239",
    priceNote: "CAD · 4-ring · single panel $69",
    bullets: ["4 moulded panels, 300 mm tall", "Ships empty, fill with water or sand", "Smart Clip ready"],
    specs: [
      ["Panel height", "300 mm"],
      ["Panels", "4, open ring"],
      ["Ballast", "Water or sand, you fill it"],
      ["Electronics", "None. Smart Clip ready"],
      ["Use", "Indoor first"],
    ],
    box: ["4 Street panels", "Fill caps and anti-slip feet", "Drill card: 12 sessions, easy to hard"],
    cta: "Reserve CA$25",
    ring: { panels: 4, lit: 0, open: true },
  },
  {
    slug: "club",
    name: "Club Pack",
    who: "Teams",
    lede: "Training night, sorted. Twelve durable panels, four lit, one coach in control. Run three stations or one big rondo ring.",
    price: "$1,990",
    priceNote: "CAD",
    bullets: ["12 durable 400 mm panels", "4 Smart Clips and a coach remote", "Rolling cart storage"],
    specs: [
      ["Panel height", "400 mm, for driven passes"],
      ["Panels", "12"],
      ["Smart Clips", "4, plus coach remote"],
      ["Storage", "Rolling cart"],
      ["Setup", "Target: under 10 minutes"],
      ["Parts", "Every part replaceable"],
    ],
    box: ["12 Club panels", "4 Smart Clips and hub", "Coach remote", "Rolling cart", "Session plans by age group"],
    cta: "Reserve CA$25",
    ring: { panels: 12, lit: 4 },
    tag: "Most clubs",
  },
  {
    slug: "arena",
    name: "Arena",
    who: "Flagship",
    lede: "The full ring. Every panel lit, every pass counted, and a display the whole squad can read from the halfway line.",
    price: "$5,900",
    priceNote: "CAD · built to order",
    bullets: ["12 smart panels, all lit and sensing", "Aluminium spine and coach display", "Built to order"],
    specs: [
      ["Panels", "12 smart panels"],
      ["Spine", "Custom extruded aluminium"],
      ["Sensing", "Hit detection on every panel"],
      ["Display", "Coach screen: scores, streaks, decision time"],
      ["Library", "Routines from U10 to first team"],
    ],
    box: ["12 Arena panels", "Hub and coach display", "Install and session demo", "Priority parts support"],
    cta: "Book a demo",
    ring: { panels: 12, lit: 12 },
    flood: true,
  },
  {
    slug: "smart-clip",
    name: "Smart Clip",
    who: "Upgrade",
    lede: "Lights on. A light bar and hit sensor that clips onto any Street or Club panel. One hub runs the ring. Start with one and add more later.",
    price: "$119",
    priceNote: "CAD",
    bullets: ["Fits Street and Club panels", "Green and red, full width", "Feels the strike through the face"],
    specs: [
      ["Fits", "Street and Club panels"],
      ["Lights", "Green and red, full width"],
      ["Sensor", "Feels the strike through the face"],
      ["Control", "One hub or phone per ring"],
      ["Power", "Rechargeable (target)"],
    ],
    box: ["1 Smart Clip", "Charging cable", "Quick-start drill card"],
    cta: "Reserve CA$25",
    ring: { panels: 4, lit: 4, open: true },
  },
];

export const tierBySlug = (s: string) => TIERS.find((t) => t.slug === s);
