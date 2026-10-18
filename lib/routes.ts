// Pages on the ring, in ring order. The minute is the "match clock" shown in the header.
export type NavItem = { id: string; href: string; title: string; short: string; minute: number };

export const NAV: NavItem[] = [
  { id: "why", href: "/why", title: "Why it works", short: "Why", minute: 15 },
  { id: "panel", href: "/panel", title: "The panel", short: "Panel", minute: 30 },
  { id: "scan-test", href: "/scan-test", title: "Scan test", short: "Scan test", minute: 45 },
  { id: "line-up", href: "/line-up", title: "Line-up", short: "Line-up", minute: 60 },
  { id: "impact", href: "/impact", title: "Impact", short: "Impact", minute: 75 },
  { id: "reserve", href: "/reserve", title: "Reserve", short: "Reserve", minute: 90 },
];

export const HOME = { href: "/", title: "Centre circle", minute: 0 };

/** Which ring page a path belongs to (tier pages belong to the line-up). */
export function navIndexFor(path: string): number {
  const p = path.replace(/\/$/, "") || "/";
  return NAV.findIndex((n) => p === n.href || p.startsWith(n.href + "/"));
}

export function routeMeta(path: string): { minute: number; title: string } {
  const i = navIndexFor(path);
  if (i < 0) return HOME;
  const n = NAV[i];
  const sub = path.replace(/\/$/, "").slice(n.href.length + 1);
  return { minute: n.minute, title: sub ? `${n.title} / ${sub.replace(/-/g, " ")}` : n.title };
}
