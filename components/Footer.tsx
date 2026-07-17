"use client";

import Image from "next/image";
import Link from "next/link";
import { useClubBranding } from "@/components/ClubBrandingProvider";

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/rosecityfutbolclub/",
    icon: "/images/logo/instagramLogo.svg",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/search/top?q=rose%20city%20futbol%20club",
    icon: "/images/logo/facebookLogo.svg",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@rosecityfc",
    icon: "/images/logo/tiktokLogo.svg",
  },
  {
    label: "X",
    href: "https://x.com/RoseCityFutbol",
    icon: "/images/logo/xLogo.svg",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@RoseCityFC",
    icon: "/images/logo/youtubeLogo.svg",
  },
];

const SPONSOR_BASE =
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sponsors`;

function sponsorLogo(filename: string) {
  return `${SPONSOR_BASE}/${encodeURIComponent(filename)}`;
}

const partners = [
  { name: "Chronic Tacos", src: sponsorLogo("Rose City FC 2027 Official Sponsor Chronic Tacos Logo Website.png") },
  { name: "Modern Woodmen", src: sponsorLogo("Rose City FC 2027 Official Sponsor Modern Woodmen Logo Website white.png") },
  { name: "Niky's Sports", src: sponsorLogo("Rose City FC 2027 Official Sponsor Niky's Sports Logo Website white & blue.png") },
  { name: "Planted Beauty Rx", src: sponsorLogo("Rose City FC 2027 Official Sponsor Planted Beauty Logo Website green.png") },
  { name: "Tepito Coffee", src: "/images/partners/tepitoSponsor.png", invert: true },
  { name: "The Pack Shot Agency", src: sponsorLogo("Rose City FC 2027 Official Sponsor The Packshot Agency Logo Website white.png") },
];

export default function Footer() {
  const { clubLogoUrl } = useClubBranding();
  return (
    <footer
      className="border-t border-gray-200"
      style={{ backgroundColor: "var(--color-black)" }}
    >
      {/* Partner Strip */}
      <div className="border-b border-white/10 py-8 px-6 lg:px-10 overflow-hidden">
        <p
          className="font-display text-xs tracking-widest uppercase text-center mb-6"
          style={{ color: "var(--color-gray-mid)" }}
        >
          Proud Partners
        </p>
        <div className="flex items-center justify-center flex-wrap gap-8 md:gap-12">
          {partners.map((partner) => (
            <div key={partner.name} className="relative h-12 w-32 opacity-100 md:h-14 md:w-36">
              <Image
                src={partner.src}
                alt={partner.name}
                fill
                className={`object-contain ${partner.invert ? "filter brightness-0 invert" : ""}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo + Tagline */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="relative w-10 h-10">
            <Image
              src={clubLogoUrl}
              alt="Rose City FC"
              fill
              className="object-contain"
            />
          </div>
          <p
            className="font-display text-base font-bold tracking-widest uppercase"
            style={{ color: "var(--color-white)" }}
          >
            Rose City FC
          </p>
          <p
            className="font-body text-xs"
            style={{ color: "var(--color-gray-mid)" }}
          >
            Pasadena, CA
          </p>
        </div>

        {/* Nav Links */}
        <ul className="flex items-center gap-6">
          {[
            { label: "Home", href: "/" },
            { label: "Roster", href: "/roster" },
            { label: "Schedule", href: "/schedule" },
            { label: "Shop", href: "/shop" },
          ].map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="font-display text-xs tracking-widest uppercase transition-colors duration-200 text-[#9A9A9A] hover:text-white"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Social Icons */}
        <div className="flex items-center gap-4">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="group relative w-6 h-6 opacity-50 hover:opacity-100 transition-opacity duration-200"
            >
              <Image
                src={social.icon}
                alt={social.label}
                fill
                className="object-contain filter brightness-0 invert"
              />
            </a>
          ))}
        </div>
      </div>

      {/* Copyright */}
      <div
        className="text-center pb-6 px-6"
        style={{ color: "var(--color-gray-mid)" }}
      >
        <p className="font-body text-xs">
          © {new Date().getFullYear()} Rose City Futbol Club. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
