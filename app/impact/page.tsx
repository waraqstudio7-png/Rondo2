import type { Metadata } from "next";
import { NextFixture, PageHead } from "@/components/Page";

export const metadata: Metadata = { title: "Impact" };

export default function Impact() {
  return (
    <div className="page">
      <div className="wrap">
        <PageHead minute="75'" crumb="Impact" title="Fill the bag." lede="Plenty of kids learn on a flat ball, or no ball at all. Every ring sold helps fill a ball bag for a community club, or funds clean water for families who need it. You choose which." />
        <div className="block soon">
          <span className="pill">Build step 6 · demo numbers</span>
          <p className="muted">The animated ball bag and water bottle are ported from the demo in a later build step. Pledge and partners are to be confirmed before launch.</p>
        </div>
        <NextFixture href="/reserve" minute="90'" title="Reserve" />
      </div>
    </div>
  );
}
