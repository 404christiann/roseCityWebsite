const PLACEHOLDER_LOGO_ASSETS = [
  "/images/logo/rosecityLogo",
  "1777665003666-qlw6vgfl3m.jpg",
  "1777664973762-9yqfdcsscmt.jpg",
  "1777666285744-ktas1t7udgj.jpg",
  "1777686443621-860xqedznt2.jpg",
  "1777667735062-zwpbfxx20ad.jpg",
  "1777665514019-a41fo6c2wlv.jpg",
  "1777664941496-t2p40gs7bff.jpg",
  "1777664961949-pqbtxgs01ql.jpg",
  "1777667861918-jdea5upg1k.jpg",
];

export function isRosterPlaceholderLogo(src: string): boolean {
  return PLACEHOLDER_LOGO_ASSETS.some((asset) => src.includes(asset));
}
