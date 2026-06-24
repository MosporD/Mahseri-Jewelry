import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CartProvider } from "@/components/cart-provider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://mahserijewellery.com"),
  title: {
    default: "Mahseri Jewellery",
    template: "%s | Mahseri Jewellery"
  },
  description: "Family atelier crafting fine gold and silver jewellery in Amman since 1989.",
  openGraph: {
    siteName: "Mahseri Jewellery",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <SiteHeader />
          <main className="next-page">{children}</main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
