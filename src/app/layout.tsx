import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { THEME_BOOT_SCRIPT } from "@/contexts/ThemeContext";
import Providers from "@/components/Providers";
import "./globals.css";

const rational = localFont({
  src: [
    { path: "../../public/font/rational/RationalText-Light.ttf", weight: "300", style: "normal" },
    { path: "../../public/font/rational/RationalText-LightItalic.ttf", weight: "300", style: "italic" },
    { path: "../../public/font/rational/RationalText-Book.ttf", weight: "400", style: "normal" },
    { path: "../../public/font/rational/RationalText-BookItalic.ttf", weight: "400", style: "italic" },
    { path: "../../public/font/rational/RationalText-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/font/rational/RationalText-MediumItalic.ttf", weight: "500", style: "italic" },
    { path: "../../public/font/rational/RationalText-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../public/font/rational/RationalText-SemiBoldItalic.ttf", weight: "600", style: "italic" },
    { path: "../../public/font/rational/RationalText-Bold.ttf", weight: "700", style: "normal" },
    { path: "../../public/font/rational/RationalText-BoldItalic.ttf", weight: "700", style: "italic" },
  ],
  variable: "--font-rational",
});

export const metadata: Metadata = {
  title: { default: "Andinoh — Book verified hotels across Nigeria", template: "%s · Andinoh" },
  description: "Find and book verified hotels across Nigeria, and manage every stay in one place.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Andinoh" },
  icons: { icon: "/logos/ANDINOH-FAV.jpg" },
};

export const viewport: Viewport = {
  themeColor: "#0F75BD",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // data-theme is set by the boot script before React hydrates, so the server's markup differs on purpose.
    <html lang="en" data-theme="light" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className={`${rational.variable} ${rational.className} antialiased`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
