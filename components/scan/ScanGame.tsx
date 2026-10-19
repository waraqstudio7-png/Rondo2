"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Playable scan test. Top-down ring of 8 panels, player in the middle.
 * A teammate (amber panel) plays the ball in. While it travels, one panel flashes green and, from level 2,
 * red decoys pulse. When the ball arrives, tap the panel where the green was. Ten balls; we score accuracy
 * and decision time (arrival to tap). Green is steady, red pulses, so the cue never relies on colour alone.
 */
const N = 8, CX = 200, CY = 200, R = 150;
const LEVELS = [
  { name: "Academy", travel: 1700, flash: 700, decoys: 0 },
  { name: "Reserves", travel: 1350, flash: 500, decoys: 1 },
  { name: "First team", travel: 1050, flash: 340, decoys: 2 },
] as const;
const BALLS = 10;

type Phase = "idle" | "travel" | "decide" | "feedback" | "done";
type Ball = { from: number; go: number; reds: number[]; t0: number };
type Result = { ok: boolean; ms: number };

const ang = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / N;
const pick = (n: number, not: number[]) => {
  let k;
  do k = Math.floor(Math.random() * n); while (not.includes(k));
  return k;
};

function newBall(level: number): Ball {
  const from = Math.floor(Math.random() * N);
  const go = pick(N, [from]);
  const reds: number[] = [];
  for (let d = 0; d < LEVELS[level].decoys; d++) reds.push(pick(N, [from, go, ...reds]));
  return { from, go, reds, t0: performance.now() };
}

export default function ScanGame() {
  const [level, setLevel] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [ball, setBall] = useState<Ball | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [tapped, setTapped] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [, force] = useState(0);
  const arriveAt = useRef(0);
  const raf = useRef(0);

  // Animation clock: only re-render while the ball is moving or a cue is live.
  useEffect(() => {
    if (phase !== "travel") return;
    const tick = () => {
      force((x) => x + 1);
      if (ball && performance.now() - ball.t0 >= LEVELS[level].travel) {
        arriveAt.current = performance.now();
        setPhase("decide");
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [phase, ball, level]);

  const start = useCallback(() => {
    setResults([]);
    setTapped(null);
    setCopied(false);
    setBall(newBall(level));
    setPhase("travel");
  }, [level]);

  const answer = useCallback(
    (i: number) => {
      if (phase !== "decide" || !ball) return;
      const r = { ok: i === ball.go, ms: Math.round(performance.now() - arriveAt.current) };
      const next = [...results, r];
      setResults(next);
      setTapped(i);
      setPhase("feedback");
      setTimeout(() => {
        setTapped(null);
        if (next.length >= BALLS) setPhase("done");
        else {
          setBall(newBall(level));
          setPhase("travel");
        }
      }, 650);
    },
    [phase, ball, results, level],
  );

  // Keys 1 to 8 pick panels clockwise from the top.
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const k = Number(e.key);
      if (k >= 1 && k <= N) answer(k - 1);
      if ((e.key === "Enter" || e.key === " ") && (phase === "idle" || phase === "done")) { e.preventDefault(); start(); }
    };
    addEventListener("keydown", on);
    return () => removeEventListener("keydown", on);
  }, [answer, start, phase]);

  const L = LEVELS[level];
  const now = performance.now();
  const el = ball ? now - ball.t0 : 0;
  const cueOn = phase === "travel" && el > L.travel * 0.22 && el < L.travel * 0.22 + L.flash;
  const prog = phase === "travel" ? Math.min(1, el / L.travel) : phase === "idle" || phase === "done" ? 0 : 1;
  const a0 = ball ? ang(ball.from) : 0;
  const bx = CX + Math.cos(a0) * (R - 22) * (1 - prog);
  const by = CY + Math.sin(a0) * (R - 22) * (1 - prog);
  const hits = results.filter((r) => r.ok);
  const avg = hits.length ? Math.round(hits.reduce((s, r) => s + r.ms, 0) / hits.length) : 0;
  const grade = hits.length >= 9 && avg < 600 ? "Elite scanner" : hits.length >= 7 ? "Head up" : hits.length >= 4 ? "Getting there" : "Ball watcher";

  const share = async () => {
    const txt = `RONDO scan test, ${L.name}: ${hits.length}/${BALLS}, ${avg} ms average decision. ${grade}.`;
    try { await navigator.clipboard.writeText(txt); setCopied(true); } catch { setCopied(false); }
  };

  return (
    <div className="scan">
      <div className="scan-stage face flood">
        <svg viewBox="0 0 400 400" role="group" aria-label="Scan test ring, eight panels">
          <circle cx={CX} cy={CY} r={R + 26} fill="none" stroke="rgba(243,241,234,.06)" />
          <circle cx={CX} cy={CY} r={46} fill="none" stroke="rgba(243,241,234,.1)" strokeDasharray="3 5" />
          {Array.from({ length: N }, (_, i) => {
            const a = ang(i), half = Math.PI / N - 0.07;
            const x1 = CX + R * Math.cos(a - half), y1 = CY + R * Math.sin(a - half);
            const x2 = CX + R * Math.cos(a + half), y2 = CY + R * Math.sin(a + half);
            const isFrom = ball && i === ball.from && phase !== "idle" && phase !== "done";
            const isGo = cueOn && ball && i === ball.go;
            const isRed = cueOn && ball && ball.reds.includes(i);
            const reveal = phase === "feedback" && ball && i === ball.go;
            const wrong = phase === "feedback" && tapped === i && ball && i !== ball.go;
            const col = isGo || reveal ? "var(--go)" : isRed || wrong ? "var(--stop)" : isFrom ? "var(--flood)" : "rgba(243,241,234,.28)";
            return (
              <g key={i}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth={isGo || isRed || reveal ? 12 : 9} strokeLinecap="round"
                  className={isRed ? "pulse" : undefined} style={isGo || reveal ? { filter: "drop-shadow(0 0 8px var(--go))" } : undefined} />
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={46} strokeLinecap="round"
                  style={{ cursor: phase === "decide" ? "pointer" : "default" }} onPointerDown={() => answer(i)}>
                  <title>Panel {i + 1}</title>
                </line>
                <text x={CX + (R + 22) * Math.cos(a)} y={CY + (R + 22) * Math.sin(a) + 4} textAnchor="middle" className="scan-n">{i + 1}</text>
              </g>
            );
          })}
          <circle cx={CX} cy={CY} r={12} fill="var(--chalk)" />
          <path d={`M${CX} ${CY - 22} l7 10 h-14 z`} fill="var(--chalk)" opacity=".5"
            transform={ball && phase !== "idle" ? `rotate(${(a0 * 180) / Math.PI + 90} ${CX} ${CY})` : undefined} />
          {phase !== "idle" && phase !== "done" ? <circle cx={bx} cy={by} r={8} fill="#f6f6f2" stroke="#0b0e10" strokeWidth="2" /> : null}
        </svg>
        <div className="scan-hud mono" aria-live="polite">
          {phase === "idle" && "Press start. Watch the green, not the ball."}
          {phase === "travel" && `Ball ${results.length + 1} of ${BALLS}`}
          {phase === "decide" && "Play it. Tap where the green was."}
          {phase === "feedback" && (results[results.length - 1]?.ok ? `Good ball · ${results[results.length - 1].ms} ms` : "Wrong pass")}
          {phase === "done" && `${hits.length}/${BALLS} · ${avg} ms`}
        </div>
      </div>

      <div className="scan-side">
        <div className="seg" role="group" aria-label="Level">
          <span className="seg-k">Level</span>
          {LEVELS.map((l, i) => (
            <button key={l.name} aria-pressed={level === i} disabled={phase === "travel" || phase === "decide" || phase === "feedback"} onClick={() => setLevel(i)}>{l.name}</button>
          ))}
        </div>
        {phase === "done" ? (
          <div className="scan-card face">
            <span className="mono muted">Full time · {L.name}</span>
            <span className="h2">{grade}</span>
            <div className="figs2">
              <div><div className="v">{hits.length}<small>/{BALLS}</small></div><div className="k mono">Correct passes</div></div>
              <div><div className="v">{avg}<small> ms</small></div><div className="k mono">Average decision</div></div>
            </div>
            <div className="row">
              <button className="btn primary" onClick={start}>Play again</button>
              <button className="btn" onClick={share}>{copied ? "Copied" : "Copy result"}</button>
            </div>
          </div>
        ) : (
          <button className="btn primary big" onClick={start} disabled={phase !== "idle"}>
            {phase === "idle" ? "Start · 10 balls" : "In play"}
          </button>
        )}
        <p className="muted small">
          Tap or press keys 1 to 8. Green is steady, red pulses, so you can tell them apart without colour. On the real ring the cue
          is a lit panel and you play the ball with your feet.
        </p>
      </div>
    </div>
  );
}
