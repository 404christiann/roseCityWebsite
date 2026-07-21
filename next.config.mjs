/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["nsgtkwqkbyxkiwrhzsje.supabase.co"],
    loader: "custom",
    loaderFile: "./supabase-image-loader.js",
    // Supabase's Image Transformation API caps width at 2500px, so drop the
    // default 3840 breakpoint to avoid requesting a size it will reject.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
  },
};

export default nextConfig;
