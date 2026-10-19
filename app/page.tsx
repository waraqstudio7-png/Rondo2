import RingNav from "@/components/home/RingNav";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { TLink } from "@/components/TLink";

const ROOTS = [
  { img: "jumpers", h: "Jumpers for goalposts", p: "Two tops on the grass and the whole park is a stadium.", alt: "Two jumpers as goalposts on a muddy park pitch at dusk" },
  { img: "cage", h: "The cage", p: "One streetlight, a chain-link fence and a ball that comes back off anything.", alt: "Empty street football cage under a sodium streetlight" },
  { img: "leather", h: "Laced leather", p: "Heavy when wet. You learned a clean first touch or you felt it.", alt: "Old laced leather football on a changing-room bench" },
];

/** The strip only renders once its photos are in /public/mood (they are exported from Canva). */
const hasRoots = ["jumpers", "cage", "leather"].every((f) => existsSync(join(process.cwd(), "public", "mood", `${f}.jpg`)));

export default function Home() {
  return (
    <div className="page" style={{ paddingBottom: 110 }}>
      <section className="stage" id="stage">
        <div className="home-copy">
          <div className="wrap">
            <span className="mono muted">
              <b className="minute">0&apos;</b> Kick-off · Prototype in testing · Ontario
            </span>
            <h1 className="h1">Every pass starts with a look.</h1>
            <p className="lede">
              A ring of rebound panels that light green and red. This page works like the real thing: pick a panel and play the pass.
            </p>
            <TLink href="/ring" morph="self" className="btn home-cta">Build your ring →</TLink>
          </div>
        </div>
        <RingNav />
        <div className="hint mono">
          Tap a panel to <b>play the pass</b>
        </div>
      </section>
      <div className="wrap">
        <div className="specs">
          <div className="spec"><span className="v">1000 × 400</span><span className="k mono">Club panel face, mm</span></div>
          <div className="spec"><span className="v">110 mm</span><span className="k mono">Strike line, ball centre</span></div>
          <div className="spec"><span className="v">≤ 2 mm</span><span className="k mono">Face flex target at 2 kN</span></div>
          <div className="spec"><span className="v">Size 5</span><span className="k mono">68-70 cm · 410-450 g</span></div>
        </div>
        {hasRoots ? (<section className="roots block" aria-labelledby="roots-h">
          <div className="roots-head">
            <span className="mono muted"><b className="minute">0&apos;</b> Before kick-off</span>
            <h2 className="h2" id="roots-h">Every player started somewhere.</h2>
            <p className="lede">Jumpers for goalposts. A cage under a streetlight. A wall that never passed back properly. RONDO is for the hours you put in on your own.</p>
          </div>
          <div className="roots-grid">
            {ROOTS.map((r, i) => (
              <figure className="root rise" style={{ ["--i" as string]: i }} key={r.img}>
                <div className="root-img" style={{ backgroundImage: `url(/mood/${r.img}.jpg)` }} role="img" aria-label={r.alt} />
                <figcaption><span className="h3">{r.h}</span><span className="muted">{r.p}</span></figcaption>
              </figure>
            ))}
          </div>
          <TLink href="/ring" morph="self" className="btn">Try the old balls in the ring builder →</TLink>
        </section>) : null}
      </div>
    </div>
  );
}
