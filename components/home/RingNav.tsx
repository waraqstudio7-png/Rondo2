"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "../TransitionProvider";
import { NAV } from "@/lib/routes";
import { makePanelProxy, ringState } from "@/lib/ring";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

function webglOK() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Home navigation: six page labels ride on six panels of the 3D ring.
 * Click a label: the player plays a ground pass to that panel, then the panel face morphs into the page header.
 * Labels are real links, so keyboard, screen readers and crawlers get a normal menu.
 */
export default function RingNav() {
  const navigate = useNavigate();
  const labels = useRef<(HTMLAnchorElement | null)[]>([]);
  const [gl, setGl] = useState<boolean | null>(null);

  useEffect(() => setGl(webglOK()), []);

  const arrive = (k: number) => navigate(NAV[k].href, makePanelProxy(k));

  const onClick = (k: number) => (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!gl || reduce) return arrive(k);
    if (ringState.passing) return;
    const t0 = performance.now();
    ringState.passing = { k, t0 };
    // safety net: if frames stall (slow GPU, background tab), still open the page
    setTimeout(() => {
      if (ringState.passing?.t0 === t0) {
        ringState.passing = null;
        arrive(k);
      }
    }, 1400);
  };

  return (
    <>
      {gl ? <Scene labels={labels} onArrive={arrive} /> : null}
      <nav className={gl === false ? "flatnav" : "labels"} aria-label="Pages, arranged as panels around the ring">
        {NAV.map((n, k) => (
          <a
            key={n.id}
            href={n.href}
            className="plabel"
            ref={(el) => {
              labels.current[k] = el;
            }}
            style={gl === false ? { position: "static", background: "rgba(11,14,16,.6)" } : { opacity: 0 }}
            aria-label={`${n.title}. Play the pass to open this page`}
            onClick={onClick(k)}
            onPointerEnter={() => (ringState.hover = k)}
            onPointerLeave={() => (ringState.hover = -1)}
            onFocus={() => (ringState.hover = k)}
            onBlur={() => (ringState.hover = -1)}
          >
            <span className="n">
              {String(k + 1).padStart(2, "0")} · {n.minute}&apos;
            </span>
            <span className="t">{n.title}</span>
          </a>
        ))}
      </nav>
    </>
  );
}
