import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Rose City FC — Pasadena's Club",
  description:
    "Rose City Futbol Club — 2024 UPSL Champions. Semi-professional soccer based in Pasadena, CA.",
  icons: {
    icon: "/images/logo/rosecityLogo.jpeg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
