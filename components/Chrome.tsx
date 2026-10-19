"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { TLink } from "./TLink";
import { EXTRA, NAV, navIndexFor, routeMeta } from "@/lib/routes";

function Mark() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <g fill="none" strokeWidth="3" strokeLinecap="round">
        <path d="M16 3a13 13 0 0 1 11.3 6.5" stroke="var(--go)" />
        <path d="M29 16a13 13 0 0 1-6.5 11.3" stroke="var(--chalk)" opacity=".55" />
        <path d="M16 29a13 13 0 0 1-11.3-6.5" stroke="var(--stop)" />
        <path d="M3 16A13 13 0 0 1 9.5 4.7" stroke="var(--chalk)" opacity=".55" />
      </g>
      <circle cx="16" cy="16" r="3.2" fill="var(--chalk)" />
    </svg>
  );
}

/** Sticky header: brand, match clock (minute + page), reserve CTA, per-page scroll progress. */
export function Header() {
  const path = usePathname();
  const { minute, title } = routeMeta(path);
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      setP(max > 0 ? scrollY / max : 0);
    };
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, [path]);
  return (
    <header className="top">
      <div className="wrap bar">
        <TLink href="/" morph="head" className="brand" aria-label="RONDO, back to the centre circle">
          <Mark />
          RONDO
        </TLink>
        <div className="where" aria-live="polite">
          <span className="live" aria-hidden="true" />
          <b>{minute}&apos;</b>
          <span className="t">{title}</span>
        </div>
        <TLink href="/reserve" morph="self" className="btn sm primary">
          Join the waitlist
        </TLink>
      </div>
      <div className="prog" style={{ width: `${p * 100}%` }} />
    </header>
  );
}

/** Floating dock: centre-circle home plus one panel glyph per page. The glyph morphs into the page header. */
export function Dock() {
  const path = usePathname();
  const cur = EXTRA.some((x) => x.href === path) ? -2 : navIndexFor(path);
  return (
    <nav className="dock" aria-label="Main">
      <TLink href="/" morph="head" className="home" aria-label="Centre circle" aria-current={cur === -1 ? "page" : undefined}>
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="10" cy="10" r="1.8" fill="currentColor" />
          <path d="M2 10h16" stroke="currentColor" strokeWidth="1.2" opacity=".5" />
        </svg>
      </TLink>
      {NAV.map((n, i) => (
        <TLink key={n.id} href={n.href} morph=".glyph" aria-current={cur === i ? "page" : undefined}>
          <span className="glyph" />
          <span className="lb">{n.short}</span>
        </TLink>
      )).flatMap((el, i) =>
        NAV[i].id === "line-up"
          ? [el, ...EXTRA.map((x) => (
              <TLink key={x.id} href={x.href} morph=".glyph" aria-current={path === x.href ? "page" : undefined}>
                <span className="glyph ring" />
                <span className="lb">{x.short}</span>
              </TLink>
            ))]
          : [el],
      )}
    </nav>
  );
}
