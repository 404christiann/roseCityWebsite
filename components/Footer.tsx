import Image from "next/image";
import Link from "next/link";

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

const partners = [
  { name: "Chronic Tacos", src: "/images/partners/chronicTacosSponsor.png" },
  { name: "Modern Woodmen", src: "/images/partners/modernWoodward_sponsor.png" },
  { name: "Niky's Sports", src: "/images/partners/nickySports_sponsor.png" },
  { name: "Planted Beauty Rx", src: "/images/partners/plantedBeautySponsor.png" },
  { name: "Tepito Coffee", src: "/images/partners/tepitoSponsor.png" },
  { name: "The Pack Shot Agency", src: "/images/partners/tpaSponsor.png" },
];

export default function Footer() {
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
            <div key={partner.name} className="relative h-10 w-28 opacity-60 hover:opacity-100 transition-opacity duration-200">
              <Image
                src={partner.src}
                alt={partner.name}
                fill
                className="object-contain filter brightness-0 invert"
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
              src="/images/logo/rosecityLogo-Photoroom.png"
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
