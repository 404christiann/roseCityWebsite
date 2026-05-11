import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Rose City FC — Pasadena's Club",
  description:
    "Rose City Futbol Club — 2024 UPSL Champions. Semi-professional soccer based in Pasadena, CA.",
  icons: {
    icon: "/images/logo/rosecityLogo.jpeg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
          {children}
          <Analytics />
        </body>
    </html>
  );
}
