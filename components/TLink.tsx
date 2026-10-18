"use client";

import Link from "next/link";
import { useNavigate } from "./TransitionProvider";

type Props = React.ComponentProps<typeof Link> & {
  href: string;
  /** "self" morphs this element; "head" morphs the current page header; a selector morphs a child; omit for a plain fade. */
  morph?: "self" | "head" | string;
};

/** A real <a> link (crawlable, opens in a new tab with modifier keys) that runs a shared-element transition on click. */
export function TLink({ href, morph, onClick, children, ...rest }: Props) {
  const navigate = useNavigate();
  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        const el = e.currentTarget as HTMLElement;
        let src: HTMLElement | null = null;
        if (morph === "self") src = el;
        else if (morph === "head") src = document.querySelector<HTMLElement>("main [data-morph]");
        else if (morph) src = el.querySelector<HTMLElement>(morph);
        navigate(href, src);
      }}
    >
      {children}
    </Link>
  );
}
