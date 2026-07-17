"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useClubBranding } from "@/components/ClubBrandingProvider";
import { SHOW_SHOP_HERO } from "@/lib/site-flags";

const LOGO_BASE =
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/logos_v2`;

const affiliationLogos = [
  {
    colorSrc: `${LOGO_BASE}/US%20Soccer%20logo%20color.png`,
    whiteSrc: `${LOGO_BASE}/US%20Soccer%20logo%20white.png`,
    alt: "US Soccer",
    className: "h-7 w-7 sm:h-10 sm:w-10",
    sizes: "(max-width: 639px) 28px, 40px",
  },
  {
    colorSrc: `${LOGO_BASE}/FIFA%20logo%20color.png`,
    whiteSrc: `${LOGO_BASE}/FIFA%20logo%20white.png`,
    alt: "FIFA",
    className: "h-7 w-11 sm:h-10 sm:w-16",
    sizes: "(max-width: 639px) 44px, 64px",
  },
  {
    colorSrc: `${LOGO_BASE}/Lamar%20Hunt%20U.S.%20Open%20Cup%20color.png`,
    whiteSrc: `${LOGO_BASE}/Lamar%20Hunt%20U.S.%20Open%20Cup%20white.png`,
    alt: "Lamar Hunt U.S. Open Cup",
    className: "h-7 w-7 sm:h-10 sm:w-10",
    sizes: "(max-width: 639px) 28px, 40px",
  },
  {
    colorSrc: `${LOGO_BASE}/UPSL%20logo%20color.png`,
    whiteSrc: `${LOGO_BASE}/UPSL%20logo%20white.png`,
    alt: "UPSL",
    className: "h-7 w-7 sm:h-10 sm:w-10",
    sizes: "(max-width: 639px) 28px, 40px",
  },
];

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Roster", href: "/roster" },
  { label: "Schedule", href: "/schedule" },
  { label: "Shop", href: "/shop" },
];

export default function Nav() {
  const { clubLogoUrl } = useClubBranding();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Transparent nav only on desktop for shop (mobile shop hero is compact, not full-bleed)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const isDarkHeroPage = pathname === "/" || (pathname === "/shop" && SHOW_SHOP_HERO && !isMobile);
  const isHero = isDarkHeroPage && !scrolled;

  return (
    <header
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isHero
          ? "bg-transparent"
          : "bg-white/95 backdrop-blur-sm shadow-sm"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-24 sm:h-28">
        {/* Logo row */}
        <div className="flex min-w-0 flex-shrink-0 items-center gap-2 sm:gap-3">
          {/* Rose City crest — primary */}
          <Link href="/" className="relative h-16 w-16 flex-shrink-0 sm:h-24 sm:w-24" aria-label="Rose City FC Home">
            <Image
              src={clubLogoUrl}
              alt="Rose City FC"
              fill
              className="object-contain transition-all duration-300"
              sizes="(max-width: 639px) 64px, 96px"
              priority
            />
          </Link>

          {/* Divider */}
          <div
            className="flex-shrink-0"
            style={{ width: "1px", height: "28px", backgroundColor: isHero ? "rgba(255,255,255,0.3)" : "rgba(20,20,20,0.15)" }}
          />

          {/* Affiliation logos — tighter cluster */}
          <div className="flex items-center gap-1 sm:gap-2">
            {affiliationLogos.map((logo) => (
              <div key={logo.alt} className={`relative flex-shrink-0 ${logo.className}`}>
                <Image
                  src={isHero ? logo.whiteSrc : logo.colorSrc}
                  alt={logo.alt}
                  fill
                  className="object-contain transition-all duration-300"
                  sizes={logo.sizes}
                  priority
                />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-body text-sm font-semibold tracking-widest uppercase transition-colors duration-300 relative group"
                  style={{
                    color: isActive
                      ? isHero
                        ? "#ffffff"
                        : "var(--color-red)"
                      : isHero
                      ? "rgba(255,255,255,0.85)"
                      : "var(--color-black)",
                  }}
                >
                  {link.label}
                  {/* Active / hover underline */}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                    style={{ backgroundColor: isHero ? "var(--color-red)" : "var(--color-black)" }}
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
            style={{ backgroundColor: isHero ? "#ffffff" : "var(--color-black)" }} />
          <span className={`block w-6 h-0.5 transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`}
            style={{ backgroundColor: isHero ? "#ffffff" : "var(--color-black)" }} />
          <span className={`block w-6 h-0.5 transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            style={{ backgroundColor: isHero ? "#ffffff" : "var(--color-black)" }} />
        </button>
      </nav>

      {/* Mobile Menu Drawer */}
      <div
        className={`md:hidden bg-white border-t border-gray-100 overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col px-8 py-6 gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`font-body text-lg font-semibold tracking-widest uppercase block py-1 ${
                    isActive
                      ? "text-[var(--color-red)]"
                      : "text-[var(--color-black)]"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </header>
  );
}
