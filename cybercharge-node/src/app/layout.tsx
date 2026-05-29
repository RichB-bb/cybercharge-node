import type { Metadata } from "next";
import "@rainbow-me/rainbowkit/styles.css";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "CyberCharge Node",
  description:
    "Invest in shared EV charging infrastructure with crypto payment access.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white text-zinc-950 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
