"use client";

import { useEffect, useState } from "react";

/**
 * Free waitlist. Posts to Klaviyo's client subscriptions endpoint (public company key only, safe in the browser).
 * List "RONDO waitlist" uses double opt-in, so Klaviyo emails a confirmation link: that is the CASL consent record.
 */
const COMPANY = "RKPqSg";
const LIST = "WYRRRW";
const ROLES = ["Player", "Parent", "Coach", "Club or academy"] as const;
const TIERS = ["Street", "Smart Clip", "Club Pack", "Arena", "Not sure yet"] as const;

type State = "idle" | "sending" | "done" | "error";

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("Player");
  const [tier, setTier] = useState<string>("Not sure yet");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<State>("idle");
  const [msg, setMsg] = useState("");

  // Pre-select the tier when arriving from a Line-up card (/reserve?tier=club).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("tier");
    const map: Record<string, string> = { street: "Street", "smart-clip": "Smart Clip", club: "Club Pack", arena: "Arena" };
    if (q && map[q]) setTier(map[q]);
  }, []);

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) && consent;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || state === "sending") return;
    setState("sending");
    setMsg("");
    try {
      const res = await fetch(`https://a.klaviyo.com/client/subscriptions?company_id=${COMPANY}`, {
        method: "POST",
        headers: { "content-type": "application/vnd.api+json", revision: "2025-07-15" },
        body: JSON.stringify({
          data: {
            type: "subscription",
            attributes: {
              custom_source: "RONDO website waitlist",
              profile: {
                data: {
                  type: "profile",
                  attributes: {
                    email: email.trim(),
                    properties: { rondo_role: role, rondo_interest: tier, rondo_consent_text: "Email me RONDO updates. Unsubscribe any time." },
                    subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } },
                  },
                },
              },
            },
            relationships: { list: { data: { type: "list", id: LIST } } },
          },
        }),
      });
      if (res.status === 202 || res.ok) {
        setState("done");
      } else {
        setState("error");
        setMsg("That didn't go through. Check the address and try again.");
      }
    } catch {
      setState("error");
      setMsg("No connection. Try again in a moment.");
    }
  }

  if (state === "done") {
    return (
      <div className="wl face" role="status">
        <span className="mono go">You&apos;re on the team sheet</span>
        <span className="h2">Check your inbox.</span>
        <p className="muted">We&apos;ve sent a confirmation link to {email}. Tap it and you&apos;re in: first news from prototype testing, first access to the production run, and the founding price. If it isn&apos;t there in a few minutes, look in spam or promotions.</p>
      </div>
    );
  }

  return (
    <form className="wl face" onSubmit={submit} noValidate>
      <span className="mono muted">Free · No payment · Unsubscribe any time</span>
      <label className="wl-field">
        <span className="mono muted">Email</span>
        <input type="email" inputMode="email" autoComplete="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <div className="wl-row">
        <div className="seg" role="radiogroup" aria-label="I am a">
          <span className="seg-k">I&apos;m a</span>
          {ROLES.map((r) => <button type="button" key={r} aria-pressed={role === r} onClick={() => setRole(r)}>{r}</button>)}
        </div>
        <div className="seg" role="radiogroup" aria-label="Most interested in">
          <span className="seg-k">Interested in</span>
          {TIERS.map((t) => <button type="button" key={t} aria-pressed={tier === t} onClick={() => setTier(t)}>{t}</button>)}
        </div>
      </div>
      <label className="wl-consent">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>Email me RONDO updates: prototype tests, launch date and early pricing. I can unsubscribe any time. We&apos;ll send a link to confirm.</span>
      </label>
      <button className="btn primary big" type="submit" disabled={!valid || state === "sending"}>
        {state === "sending" ? "Sending…" : "Join the waitlist"}
      </button>
      {msg ? <p className="wl-err" role="alert">{msg}</p> : null}
      <p className="note">Your email is used only for RONDO updates and is never sold. Sent from Waraq Studio, Ontario, Canada. <a href="/privacy">Privacy</a></p>
    </form>
  );
}
