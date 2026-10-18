import type { Metadata, Viewport } from "next";
import "@fontsource/big-shoulders-display/800";
import "@fontsource/big-shoulders-display/900";
import "@fontsource/hanken-grotesk/400.css";
import "@fontsource/hanken-grotesk/600.css";
import "@fontsource/hanken-grotesk/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";
import { TransitionProvider } from "@/components/TransitionProvider";
import { Dock, Header } from "@/components/Chrome";

export const metadata: Metadata = {
  title: { default: "RONDO · Every pass starts with a look", template: "%s · RONDO" },
  description:
    "A ring of rebound panels that light green and red, so you scan before you pass. Built around a size 5 ball. Prototype in testing, Ontario.",
};

export const viewport: Viewport = {
  themeColor: "#06110d",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA">
      <body>
        <TransitionProvider>
          <Header />
          <main>{children}</main>
          <Dock />
        </TransitionProvider>
      </body>
    </html>
  );
}
