import type { Metadata } from "next";
import { PageHead } from "@/components/Page";
import WaitlistSlot from "@/components/reserve/WaitlistSlot";

export const metadata: Metadata = { title: "Join the waitlist", description: "Get first news from RONDO prototype testing and first access to the production run. Free." };

const FAQ = [
  ["Does it work with a size 4 ball?", "The ring is designed around size 5, and size 4 is on the test list. A size 4 sits about 7 mm lower on the face, so the default tilt may change."],
  ["Indoor or outdoor?", "Indoor first: gyms, garages, indoor turf. An outdoor version with UV-stable materials and sealed electronics is planned, not promised yet."],
  ["Is it loud?", "A rigid face makes a firm thud, like a wall pass. Rubber feet and the filled base cut the rattle. Noise is one of the things we're measuring."],
  ["Is it safe for kids?", "All adult testing happens before any child uses it. Low-voltage electronics only, rounded edges, no exposed wiring, and open rings for younger players."],
  ["How does it store?", "Street panels empty out and stack. The Club Pack rolls away on its cart."],
];

export default function Reserve() {
  return (
    <div className="page">
      <div className="wrap">
        <PageHead minute="90'" crumb="Final whistle" photo="/mood/tunnel.jpg" photoPos="center 45%" title="Get on the team sheet." lede="Join the free waitlist. You'll hear first when prototype testing results land, get first access to the production run, and lock in the founding price. No payment, no spam." />
        <div className="block" style={{ maxWidth: 860 }}><WaitlistSlot /></div>
        <div className="block" style={{ maxWidth: 860 }}>
          <div className="mono muted" style={{ marginBottom: 18 }}><b className="minute">90+2&apos;</b> Stoppage-time questions</div>
          {FAQ.map(([q, a]) => (
            <details key={q} style={{ borderTop: "1px solid var(--line)", padding: "18px 0" }}>
              <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: 18 }}>{q}</summary>
              <p className="muted" style={{ marginTop: 10 }}>{a}</p>
            </details>
          ))}
        </div>
        <footer style={{ borderTop: "2px solid var(--line)", marginTop: 80, paddingTop: 40, color: "var(--mist)", fontSize: 14 }}>
          <div className="mono" style={{ marginBottom: 12 }}><span className="go">FT</span> · RONDO is a working name · Ontario, Canada</div>
          <div>Product visuals are 3D concept renders, not photos of a finished product. Mood photos are AI-generated illustrations.</div>
        </footer>
      </div>
    </div>
  );
}
