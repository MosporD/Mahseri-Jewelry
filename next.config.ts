import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co"
      },
      {
        protocol: "https",
        hostname: "mahserijewellery.com"
      }
    ]
  },
  async redirects() {
    const permanent = [
      ["/index.html", "/"],
      ["/shop.html", "/shop"],
      ["/shop-gold.html", "/shop/gold"],
      ["/shop-silver.html", "/shop/silver"],
      ["/shop-gems.html", "/shop/gems"],
      ["/about.html", "/about"],
      ["/contact.html", "/contact"],
      ["/cart.html", "/cart"],
      ["/admin.html", "/admin"]
    ];
    return [
      ...permanent.map(([source, destination]) => ({
        source,
        destination,
        permanent: true
      })),
      { source: "/product.html", destination: "/product", permanent: false }
    ];
  }
};

export default nextConfig;
