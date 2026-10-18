"use client";

import { createContext, useCallback, useContext, useLayoutEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { makePanelProxy } from "@/lib/ring";
import { navIndexFor } from "@/lib/routes";

type Navigate = (href: string, src?: HTMLElement | null) => void;
const Ctx = createContext<Navigate>(() => {});
export const useNavigate = () => useContext(Ctx);

const clean = (p: string) => p.replace(/\/$/, "") || "/";

/** Find the element in the NEW page that the clicked element should morph into. */
function morphDestination(to: string, from: string): HTMLElement | null {
  if (to === "/") {
    const k = navIndexFor(from);
    return k >= 0 ? makePanelProxy(k) : null;
  }
  // Tier page back to the line-up: the header shrinks back into its card
  const m = from.match(/^\/line-up\/([^/]+)$/);
  if (to === "/line-up" && m) return document.querySelector<HTMLElement>(`[data-card="${m[1]}"]`);
  return document.querySelector<HTMLElement>("main [data-morph]");
}

/**
 * Shared-element page transitions on top of the App Router, using the View Transitions API.
 * The clicked element (a ring panel, a card, a dock glyph) gets view-transition-name "morph";
 * after the route commits, the destination header takes the same name, so the browser animates one into the other.
 * Without the API (or with reduced motion) it falls back to a normal navigation.
 */
export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const waiters = useRef<(() => void)[]>([]);
  const busy = useRef(false);

  useLayoutEffect(() => {
    const w = waiters.current;
    waiters.current = [];
    w.forEach((f) => f());
  }, [pathname]);

  const navigate = useCallback<Navigate>(
    (href, src) => {
      const from = clean(pathname);
      const to = clean(href);
      if (to === from || busy.current) {
        if (src?.dataset.proxy) src.remove();
        return;
      }
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const doc = document as Document & { startViewTransition?: (cb: () => Promise<void> | void) => { finished: Promise<void> } };
      if (!doc.startViewTransition || reduce) {
        if (src?.dataset.proxy) src.remove();
        router.push(href);
        return;
      }
      busy.current = true;
      let dest: HTMLElement | null = null;
      if (src) src.style.viewTransitionName = "morph";
      const vt = doc.startViewTransition(async () => {
        if (src) {
          src.style.viewTransitionName = "";
          if (src.dataset.proxy) src.remove();
        }
        const committed = new Promise<void>((res) => waiters.current.push(res));
        router.push(href);
        await Promise.race([committed, new Promise((r) => setTimeout(r, 1500))]);
        dest = morphDestination(to, from);
        if (dest) dest.style.viewTransitionName = "morph";
      });
      vt.finished.finally(() => {
        const d = dest as HTMLElement | null;
        if (d) {
          d.style.viewTransitionName = "";
          if (d.dataset.proxy) {
            d.classList.add("fade");
            setTimeout(() => d.remove(), 400);
          }
        }
        busy.current = false;
      });
    },
    [pathname, router],
  );

  return <Ctx.Provider value={navigate}>{children}</Ctx.Provider>;
}
