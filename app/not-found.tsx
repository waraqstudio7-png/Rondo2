import { TLink } from "@/components/TLink";

export default function NotFound() {
  return (
    <div className="page"><div className="wrap">
      <header className="pagehead face red" data-morph>
        <span className="mono muted">Offside</span>
        <h1 className="h2">That page is out of play.</h1>
        <p className="lede">The link may be old. Head back to the centre circle and pick a panel.</p>
        <div><TLink href="/" morph="head" className="btn primary">Back to the centre circle</TLink></div>
      </header>
    </div></div>
  );
}
