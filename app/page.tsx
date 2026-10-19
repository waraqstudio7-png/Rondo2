import RingNav from "@/components/home/RingNav";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { TLink } from "@/components/TLink";
import { BALLS, BOOTS } from "@/lib/heritage";

const ROOTS = [
  { img: "jumpers", h: "Jumpers for goalposts", p: "Two tops on the grass and the whole park is a stadium.", alt: "Two jumpers as goalposts on a muddy park pitch at dusk" },
  { img: "cage", h: "The cage", p: "One streetlight, a chain-link fence and a ball that comes back off anything.", alt: "Empty street football cage under a sodium streetlight" },
  { img: "leather", h: "Laced leather", p: "Heavy when wet. You learned a clean first touch or you felt it.", alt: "Old laced leather football on a changing-room bench" },
];

/** The strip only renders once its photos are in /public/mood (they are exported from Canva). */
const hasBoots = existsSync(join(process.cwd(), "public", "mood", "boots.jpg"));
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
        <section className="kit block" aria-labelledby="kit-h">
          <div className="roots-head">
            <span className="mono muted"><b className="minute">0&apos;</b> The kit room</span>
            <h2 className="h2" id="kit-h">The ball and the boot, a century apart.</h2>
            <p className="lede">Every change to the ball changed how it moved off your foot. Every change to the boot changed how it felt. Tap a ball to roll it into the ring.</p>
          </div>
          <ol className="kit-balls" aria-label="How the match ball changed">
            {BALLS.map((b) => (
              <li key={b.year}>
                <TLink href={`/ring?ball=${b.ball}`} morph="self" className="kit-card">
                  <span className={`kit-ball ${b.ball}`} aria-hidden="true" />
                  <span className="kit-year">{b.year}</span>
                  <span className="h3">{b.name}</span>
                  <span className="muted">{b.fact}</span>
                </TLink>
              </li>
            ))}
          </ol>
          {hasBoots ? (
            <figure className="kit-boots">
              <div className="kit-boots-img" role="img" aria-label="Five football boots showing a century of design, from high-ankle leather to knitted laceless" />
              <ol>
                {BOOTS.map((b) => (
                  <li key={b.year}><span className="kit-year">{b.year}</span><span className="h3">{b.name}</span><span className="muted">{b.fact}</span></li>
                ))}
              </ol>
            </figure>
          ) : null}
          <p className="note">History for reference. Ball and boot names belong to their makers; RONDO is not affiliated with them. Photos are AI-generated illustrations.</p>
        </section>
      </div>
    </div>
  );
}
