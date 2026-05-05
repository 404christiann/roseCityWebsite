"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navLogos = [
  { src: "/images/logo/rosecityLogo-Photoroom.png", alt: "Rose City FC",  size: 96, scrolledSrc: null },
  { src: "/images/logo/us_new_image.png",            alt: "USA Soccer",    size: 42, scrolledSrc: null },
  {
    src: "/images/logo/fifa_logo_white2.png",
    alt: "FIFA",
    size: 42,
    scrolledSrc: "https://nsgtkwqkbyxkiwrhzsje.supabase.co/storage/v1/object/public/logos/fifa_logo_transparent_v2.png",
  },
  {
    src: "/images/logo/us_cup.png",
    alt: "U.S. Open Cup",
    size: 42,
    scrolledSrc: "https://nsgtkwqkbyxkiwrhzsje.supabase.co/storage/v1/object/public/logos/U.S._Open_Cup_logo_red_color%20(1).png",
  },
];

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Roster", href: "/roster" },
  { label: "Schedule", href: "/schedule" },
  { label: "Shop", href: "/shop" },
];

export default function Nav() {
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

  const isDarkHeroPage = pathname === "/" || (pathname === "/shop" && !isMobile);
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
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-28">
        {/* Logo row */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0" aria-label="Rose City FC Home">
          {/* Rose City crest — primary */}
          <div className="relative flex-shrink-0" style={{ width: 116, height: 116 }}>
            <Image
              src="/images/logo/rosecityLogo-Photoroom.png"
              alt="Rose City FC"
              fill
              className="object-contain transition-all duration-300"
              priority
            />
          </div>

          {/* Divider */}
          <div
            className="flex-shrink-0"
            style={{ width: "1px", height: "28px", backgroundColor: isHero ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.15)" }}
          />

          {/* Affiliation logos — tighter cluster */}
          <div className="flex items-center gap-2">
            {navLogos.slice(1).map((logo) => {
              const activeSrc = (!isHero && logo.scrolledSrc) ? logo.scrolledSrc : logo.src;
              return (
                <div key={logo.alt} className="relative flex-shrink-0" style={{ width: logo.size, height: logo.size }}>
                  <Image
                    src={activeSrc}
                    alt={logo.alt}
                    fill
                    className="object-contain transition-all duration-300"
                    priority
                  />
                </div>
              );
            })}
          </div>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-display text-sm font-semibold tracking-widest uppercase transition-colors duration-300 relative group"
                  style={{
                    color: isActive
                      ? isHero
                        ? "#ffffff"
                        : "var(--color-green)"
                      : isHero
                      ? "rgba(255,255,255,0.85)"
                      : "var(--color-black)",
                  }}
                >
                  {link.label}
                  {/* Active / hover underline */}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-[var(--color-red)] transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
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
                  className={`font-display text-lg font-semibold tracking-widest uppercase block py-1 ${
                    isActive
                      ? "text-[var(--color-green)]"
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
