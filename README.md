# RONDO website

Marketing and pre-order site for RONDO (working name), a ring of light-up rebound panels for football passing training. Ontario, Canada.

Built from `website-master-prompt.md` (Football Training Product Lab project). **Status: build steps 1 and 2 complete** (scaffold, design system, routes, 3D ring navigation with pass-to-navigate and shared-element page transitions). Steps 3 to 8 are listed below.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

Node 20 or 22. Deploys to Vercel with zero config (framework: Next.js).

## How the navigation works

- `/` is the centre circle: a real-scale 3D ring (React Three Fiber) of 12 panels, 2.4 m radius, on a night pitch with the 9.15 m centre circle. Six panels carry page labels (`lib/routes.ts`).
- Clicking a label plays a ground pass to that panel. On arrival, a DOM rectangle is placed over the panel's projected face (`lib/ring.ts → makePanelProxy`) and morphs into the next page's header using the View Transitions API (`components/TransitionProvider.tsx`).
- Every page header (`[data-morph]`) is drawn as a panel face. Cards, dock glyphs and "Next fixture" tiles morph into it via `TLink` (`morph="self" | "head" | selector`).
- Fallbacks: no View Transitions or reduced motion → normal navigation; no WebGL → a flat row of links.

## Layout

```
app/                 routes (/, /why, /panel, /scan-test, /line-up, /line-up/[tier], /impact, /reserve)
components/          Chrome (header, dock), Page (PageHead, NextFixture, Formation), TLink, TransitionProvider
components/home/     RingNav (labels + pass), Scene (3D)
components/panel/    Anatomy (front view + parts)
lib/                 routes, tiers (prices, specs), ring (geometry, camera, proxy)
```

## Content rules

No em dashes. Estimates labelled. Prices are target pre-order prices in CAD. No testimonials, logos or partner names until real. No "moving target chase" mode (IP review pending).

## Next build steps

3. Card-to-page polish and per-tier visuals
4. Exploded 3D panel on `/panel` (GLB from the CAD)
5. Scan test port
6. Impact vessel (ball bag / water)
7. Reserve with a Stripe Payment Link
8. Performance, accessibility, SEO (OG images, sitemap, structured data), analytics events
