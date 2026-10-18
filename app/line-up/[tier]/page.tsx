import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Formation, PageHead } from "@/components/Page";
import { TLink } from "@/components/TLink";
import { TIERS, tierBySlug } from "@/lib/tiers";

type Props = { params: Promise<{ tier: string }> };

export function generateStaticParams() {
  return TIERS.map((t) => ({ tier: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = tierBySlug((await params).tier);
  return { title: t ? t.name : "Line-up", description: t?.lede };
}

export default async function TierPage({ params }: Props) {
  const t = tierBySlug((await params).tier);
  if (!t) notFound();
  return (
    <div className="page">
      <div className="wrap">
        <PageHead minute="60'" crumb={t.name} title={t.name} lede={t.lede} back={{ href: "/line-up", label: "Line-up" }} tone={t.flood ? "flood" : undefined} />
        <div className="block td">
          <div className="rise"><Formation {...t.ring} /></div>
          <div>
            <dl className="kv rise" style={{ ["--i" as string]: 1 }}>
              {t.specs.map(([k, v]) => (
                <div key={k} style={{ display: "contents" }}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
            <ul className="ul rise" style={{ ["--i" as string]: 2, marginTop: 24 }}>
              <li><strong style={{ color: "var(--chalk)" }}>In the box</strong></li>
              {t.box.map((b) => <li key={b}>{b}</li>)}
            </ul>
            <div className="buy rise" style={{ ["--i" as string]: 3 }}>
              <div className="price">{t.price}<small>{t.priceNote}</small></div>
              <TLink href="/reserve" morph="self" className="btn primary">{t.cta}</TLink>
            </div>
            <p className="note">Specs are design targets for the production version and may change after testing.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
