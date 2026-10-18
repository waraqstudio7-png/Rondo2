import type { Metadata } from "next";
import { Formation, NextFixture, PageHead } from "@/components/Page";
import { TLink } from "@/components/TLink";
import { TIERS } from "@/lib/tiers";

export const metadata: Metadata = { title: "Line-up" };

export default function LineUp() {
  const cards = TIERS.filter((t) => t.slug !== "smart-clip");
  const clip = TIERS.find((t) => t.slug === "smart-clip")!;
  return (
    <div className="page">
      <div className="wrap">
        <PageHead minute="60'" crumb="The line-up" title="Pick your squad." lede="One panel family, from the back garden to a full academy. Start small, add panels, and clip on lights when you're ready. Open any card for the full spec." />
        <div className="tiers">
          {cards.map((t, i) => (
            <TLink key={t.slug} href={`/line-up/${t.slug}`} morph="self" data-card={t.slug} className={`tier face rise ${t.flood ? "flood" : ""}`} style={{ ["--i" as string]: i }}>
              {t.tag ? <span className="tag">{t.tag}</span> : null}
              <div className="top-row"><span className="h3">{t.name}</span><span className="who mono">{t.who}</span></div>
              <Formation {...t.ring} />
              <ul className="ul">{t.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
              <div className="open"><div className="price">{t.price}<small>CAD</small></div><span className="mono go">Open →</span></div>
            </TLink>
          ))}
        </div>
        <TLink href="/line-up/smart-clip" morph="self" data-card="smart-clip" className="wide face rise" style={{ ["--i" as string]: 3 }}>
          <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true"><rect x="6" y="24" width="52" height="16" rx="5" fill="#1b2226" stroke="rgba(243,241,234,.4)" /><rect x="12" y="29" width="40" height="5" rx="2.5" fill="#2bd883" /><path d="M14 40 v10 M50 40 v10" stroke="rgba(243,241,234,.4)" strokeWidth="3" strokeLinecap="round" /></svg>
          <span><span className="h3">{clip.name}</span><p className="muted" style={{ fontSize: 15 }}>Light bar and hit sensor that clips onto any Street or Club panel.</p></span>
          <span className="price">{clip.price}</span>
        </TLink>
        <p className="note">Prices are target pre-order prices in CAD and may change before launch. Panels are in prototype testing.</p>
        <NextFixture href="/impact" minute="75'" title="Impact" />
      </div>
    </div>
  );
}
