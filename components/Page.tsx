import { TLink } from "./TLink";

/** Page header drawn as a panel face (hex skin + light strip). It is the shared-element destination. */
export function PageHead({
  minute,
  crumb,
  title,
  lede,
  back = { href: "/", label: "Centre circle" },
  tone,
}: {
  minute: string;
  crumb: string;
  title: string;
  lede?: string;
  back?: { href: string; label: string };
  tone?: "flood" | "red";
}) {
  return (
    <header className={`pagehead face ${tone ?? ""}`} data-morph>
      <div className="crumbs mono">
        <TLink href={back.href} morph="head" className="back">
          ← {back.label}
        </TLink>
        <span>/</span>
        <b>{minute}</b>
        <span>{crumb}</span>
      </div>
      <h1 className="h2">{title}</h1>
      {lede ? <p className="lede">{lede}</p> : null}
    </header>
  );
}

/** "Next fixture" tile at the foot of each page; it grows into the next page's header. */
export function NextFixture({ href, minute, title }: { href: string; minute: string; title: string }) {
  return (
    <TLink href={href} morph="self" className="next face">
      <span>
        <span className="k mono">Next fixture · {minute}</span>
        <span className="h3 big">{title}</span>
      </span>
      <span className="arrow" aria-hidden="true">
        →
      </span>
    </TLink>
  );
}

/** Small top-down ring diagram used on product cards. */
export function Formation({ panels, lit, open }: { panels: number; lit: number; open?: boolean }) {
  const cx = 150, cy = 75, R = 60;
  const lines = Array.from({ length: panels }, (_, i) => {
    const a = open ? -Math.PI / 2 + (i - (panels - 1) / 2) * 0.9 : -Math.PI / 2 + (i * 2 * Math.PI) / panels;
    const half = open ? 0.33 : (Math.PI / panels) * 0.78;
    const on = lit >= panels || (lit > 0 && i % Math.round(panels / lit) === 0);
    const col = on ? (i % 4 === 2 ? "var(--stop)" : "var(--go)") : "rgba(237,243,238,.35)";
    return (
      <line
        key={i}
        x1={cx + R * Math.cos(a - half)}
        y1={cy + R * Math.sin(a - half)}
        x2={cx + R * Math.cos(a + half)}
        y2={cy + R * Math.sin(a + half)}
        stroke={col}
        strokeWidth={open ? 7 : 6}
        strokeLinecap="round"
      />
    );
  });
  return (
    <svg className="form-svg" viewBox="0 0 300 150" aria-hidden="true">
      {lines}
      <circle cx={cx} cy={cy} r={5} fill="var(--chalk)" />
    </svg>
  );
}
