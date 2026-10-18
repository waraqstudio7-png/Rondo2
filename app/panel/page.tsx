import type { Metadata } from "next";
import Anatomy from "@/components/panel/Anatomy";
import ViewerSlot from "@/components/panel/ViewerSlot";
import { NextFixture, PageHead } from "@/components/Page";

export const metadata: Metadata = { title: "The panel" };

export default function PanelPage() {
  return (
    <div className="page">
      <div className="wrap">
        <PageHead minute="30'" crumb="The panel" title="Engineered like an engine bay." lede="One panel, built to take a driven pass and give the same return every time. Turn the station, switch the light, then tap a part to see what it does." />
        <div className="block"><ViewerSlot /></div>
        <Anatomy />
        <div className="block numbers">
          <div><div className="v">~1 mm</div><div className="mono muted">Face flex at 2 kN, model</div></div>
          <div><div className="v">150 Hz</div><div className="mono muted">First mode, model</div></div>
          <div><div className="v">3</div><div className="mono muted">Shoes per panel</div></div>
          <div><div className="v">20 mm</div><div className="mono muted">Face, ply + PETG skin</div></div>
        </div>
        <p className="note">Model figures are estimates from the engineering model. Physical testing is under way.</p>
        <NextFixture href="/scan-test" minute="45'" title="The scan test" />
      </div>
    </div>
  );
}
