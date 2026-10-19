import type { Metadata } from "next";
import { NextFixture, PageHead } from "@/components/Page";
import ScanSlot from "@/components/scan/ScanSlot";

export const metadata: Metadata = { title: "Scan test" };

const MODES = [
  ["var(--go)", "Scan & Play", "The light shows up while the ball is coming in, then goes out. Play it to where the green was."],
  ["var(--chalk)", "Two-Touch Rondo", "Control, then pass, before the light changes. Builds a first touch that sets up the next pass."],
  ["var(--stop)", "Man On", "A red panel means pressure from that side. Turn away from it and play out the other way."],
  ["var(--flood)", "Coach Call", "The coach lights panels from the remote to match the session plan."],
];

export default function ScanTest() {
  return (
    <div className="page">
      <div className="wrap">
        <PageHead minute="45'" crumb="Half-time challenge" photo="/mood/scan.jpg" photoPos="center 30%" title="The scan test." lede="The ball comes in from a teammate (amber). A panel flashes green while it travels, and red ones try to fool you. When it arrives, play it to where the green was. Ten balls." />
        <div className="block"><ScanSlot /></div>
        <div className="block" style={{ display: "grid", gap: 0 }}>
          {MODES.map(([c, h, p]) => (
            <div key={h} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, padding: "16px 0", borderTop: "1px solid var(--line)" }}>
              <span style={{ width: 12, height: 12, borderRadius: "50%", marginTop: 8, background: c }} />
              <div><strong>{h}</strong><p className="muted" style={{ fontSize: 15 }}>{p}</p></div>
            </div>
          ))}
        </div>
        <NextFixture href="/line-up" minute="60'" title="The line-up" />
      </div>
    </div>
  );
}
