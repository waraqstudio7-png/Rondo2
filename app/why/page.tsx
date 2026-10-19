import type { Metadata } from "next";
import { NextFixture, PageHead } from "@/components/Page";

export const metadata: Metadata = { title: "Why it works" };

const SHOUTS = ["Check your shoulder", "Man on", "Time", "Open your body", "Back foot", "Zip on it", "Switch it", "Play the way you face"];

export default function Why() {
  return (
    <div className="page">
      <div className="wrap">
        <PageHead minute="15'" crumb="Why it works" photo="/mood/touch.jpg" photoPos="70% 60%" title="The wall gives the ball back. It never asks a question." lede="A rebound board trains your feet. The ring trains the picture in your head before the ball arrives." />
      </div>
      <div className="shouts block" aria-hidden="true">
        <div className="track">
          {[...SHOUTS, ...SHOUTS].map((s, i) => (
            <span key={i} style={{ display: "contents" }}>
              <span style={{ color: i % 4 === 0 ? "var(--chalk)" : undefined }}>{s}</span>
              <i>●</i>
            </span>
          ))}
        </div>
      </div>
      <div className="wrap">
        <div className="block pillars">
          {[
            ["Scan", "The green light shows up behind you or out wide while the ball is still travelling. Look, or miss it."],
            ["Open body", "Receive half-turned on the back foot, so you can play forward without stopping first."],
            ["First touch", "Take it out of your feet and into the next pass. The rebound stays the same, so your touch is the variable."],
            ["Weight of pass", "Ping it and it comes back fast. Under-hit it and you'll be chasing it."],
          ].map(([h, p], i) => (
            <div className="pillar rise" style={{ ["--i" as string]: i }} key={h}>
              <span className="h3">{h}</span>
              <p>{p}</p>
            </div>
          ))}
        </div>
        <div className="block quote">
          <div className="barv" aria-hidden="true" />
          <div>
            <p>
              Match studies of elite midfielders link scanning more often before receiving with completing more passes, especially forward ones. Most players never practise it on their own.
            </p>
            <p className="mono muted" style={{ marginTop: 12 }}>Research basis: Jordet et al., 2013, Premier League match analysis</p>
          </div>
        </div>
        <div className="block compare">
          <div className="cmp"><span className="mono muted">The wall</span><span className="h3">Free. Honest. Silent.</span><ul><li>Returns depend on the brickwork</li><li>Always in front of you</li><li>No scanning, no decisions</li></ul></div>
          <div className="cmp"><span className="mono muted">Reaction lights</span><span className="h3">Fast hands, no ball.</span><ul><li>Tap pods on cones</li><li>Great for reactions</li><li>Nothing to pass to</li></ul></div>
          <div className="cmp us"><span className="mono go">RONDO</span><span className="h3">Look, then pass.</span><ul><li>Engineered, consistent returns</li><li>Cues behind you and out wide</li><li>Scored on the pass, not a tap</li></ul></div>
        </div>
        <NextFixture href="/panel" minute="30'" title="The panel" />
      </div>
    </div>
  );
}
