import type { Metadata } from "next";
import { PageHead } from "@/components/Page";

export const metadata: Metadata = { title: "Privacy", description: "How RONDO handles waitlist emails and site visits." };

const S: [string, string][] = [
  ["Who we are", "RONDO is a working name for a football training product being developed by Waraq Studio in Ontario, Canada. Contact: waraqstudio7@gmail.com."],
  ["What we collect", "If you join the waitlist: your email address, whether you're a player, parent, coach or club, and which product you're interested in. Nothing else. We don't ask for your name, age or location."],
  ["Why", "To send you RONDO updates you asked for: prototype test results, the launch date and early pricing, and to understand which product people want most."],
  ["Consent", "You opt in by ticking the box and confirming through the link in our email. You can unsubscribe from any email with one click, or email us to be removed."],
  ["Who processes it", "Emails are stored and sent with Klaviyo, our email provider, which may store data outside Canada. The site is hosted on Vercel, which counts page visits without cookies or personal identifiers."],
  ["What we don't do", "We don't sell or rent your email, and we don't use it for anything other than RONDO updates."],
  ["Your rights", "You can ask what we hold about you, ask us to correct it, or ask us to delete it. Email waraqstudio7@gmail.com and we'll reply within 30 days."],
];

export default function Privacy() {
  return (
    <div className="page">
      <div className="wrap">
        <PageHead minute="90+3'" crumb="Privacy" title="Privacy, in plain words." lede="Last updated 19 October 2026." back={{ href: "/reserve", label: "Waitlist" }} />
        <div className="block" style={{ maxWidth: 760, display: "grid", gap: 22 }}>
          {S.map(([h, p]) => (
            <div key={h}><h2 className="h3">{h}</h2><p className="muted" style={{ marginTop: 6 }}>{p}</p></div>
          ))}
        </div>
      </div>
    </div>
  );
}
