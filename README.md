# Rose City FC Website

Concept rebuild of the Rose City Futbol Club website for a semi-pro UPSL team based in Pasadena, CA.

Built with:
- `Next.js 14` App Router
- `TypeScript`
- `Tailwind CSS`
- `GSAP`

## What This Project Includes

The site currently includes:
- a cinematic homepage
- roster and staff pages
- fixture / schedule page
- a shop page with a custom hero and product flow
- footer social and partner links

## Design Direction

The visual language is intentionally:
- dark, editorial, and premium
- heavy on bold condensed typography
- sharp-cornered UI, not rounded
- black / white / red / green brand palette

Main fonts:
- display: `Barlow Condensed`
- body: `DM Sans`

## Shop Page Notes

The `/shop` page was built with separate behaviors for desktop and mobile.

### Shop hero
- Desktop uses a peek-style carousel with a reduced seam so adjacent slides feel cleaner.
- Mobile uses a simplified full-width banner treatment so the hero fits naturally below the fixed nav.

### Product split section
- Left side: jersey slideshow using `rosecityshirt1–6`
- Right side: product information, included items, store note, and CTA
- Mobile layout was adjusted so the slideshow has its own defined frame and transitions cleanly into the text section

### Purchase section
The lower section was refocused from a Niky’s gallery into a more useful `Purchase Details` block:
- what’s included
- customization
- where to buy
- purchase options

## Social Links

Footer links currently point to:
- Instagram: `https://www.instagram.com/rosecityfutbolclub/`
- Facebook: `https://www.facebook.com/search/top?q=rose%20city%20futbol%20club`
- TikTok: `https://www.tiktok.com/@rosecityfc`
- X: `https://x.com/RoseCityFutbol`
- YouTube: `https://www.youtube.com/@RoseCityFC`

## Project Structure

Key folders:
- [app](/Users/christianalcala/Downloads/roseCityWebsite/app) — route-level pages
- [components](/Users/christianalcala/Downloads/roseCityWebsite/components) — reusable UI sections
- [lib](/Users/christianalcala/Downloads/roseCityWebsite/lib) — static data
- [public](/Users/christianalcala/Downloads/roseCityWebsite/public) — images and brand assets
- [styles](/Users/christianalcala/Downloads/roseCityWebsite/styles) — global styling

Important files:
- [app/page.tsx](/Users/christianalcala/Downloads/roseCityWebsite/app/page.tsx) — homepage composition
- [app/shop/page.tsx](/Users/christianalcala/Downloads/roseCityWebsite/app/shop/page.tsx) — shop page composition
- [components/ShopHero.tsx](/Users/christianalcala/Downloads/roseCityWebsite/components/ShopHero.tsx) — custom shop hero
- [components/ShopSlideshow.tsx](/Users/christianalcala/Downloads/roseCityWebsite/components/ShopSlideshow.tsx) — jersey/product slideshow
- [components/Footer.tsx](/Users/christianalcala/Downloads/roseCityWebsite/components/Footer.tsx) — footer and social links
- [lib/data.ts](/Users/christianalcala/Downloads/roseCityWebsite/lib/data.ts) — product and content data

## Local Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Recommended Git Ignore

If this repo is being pushed to GitHub, make sure these are ignored:

```gitignore
node_modules/
.next/
.DS_Store
```

## Summary

This project is a polished RCFC site concept with the strongest work currently centered around the shop experience: custom responsive hero behavior, product-focused slideshow treatment, and a cleaner purchase-information flow.
