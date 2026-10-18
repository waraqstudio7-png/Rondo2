import RingNav from "@/components/home/RingNav";
import { TLink } from "@/components/TLink";

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
      </div>
    </div>
  );
}
