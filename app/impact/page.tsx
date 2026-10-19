import type { Metadata } from "next";
import { NextFixture, PageHead } from "@/components/Page";
import ImpactSlot from "@/components/impact/ImpactSlot";

export const metadata: Metadata = { title: "Impact" };

export default function Impact() {
  return (
    <div className="page">
      <div className="wrap">
        <PageHead minute="75'" crumb="Impact" photo="/mood/jumpers.jpg" photoPos="center 60%" title="Fill the bag." lede="Plenty of kids learn on a flat ball, or no ball at all. We plan to give part of every ring sold to a ball bag for a community club, or to clean water for families who need it. You choose which. Partners and amounts are confirmed before launch." />
        <div className="block"><ImpactSlot /></div>
        <NextFixture href="/reserve" minute="90'" title="Reserve" />
      </div>
    </div>
  );
}
