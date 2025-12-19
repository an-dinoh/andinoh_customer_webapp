import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/common/Navbar";

const rational = localFont({
  src: [
    {
      path: "../public/font/rational/RationalText-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/font/rational/RationalText-LightItalic.ttf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../public/font/rational/RationalText-Book.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/font/rational/RationalText-BookItalic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/font/rational/RationalText-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/font/rational/RationalText-MediumItalic.ttf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../public/font/rational/RationalText-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/font/rational/RationalText-SemiBoldItalic.ttf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../public/font/rational/RationalText-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/font/rational/RationalText-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../public/font/rational/RationalText-Black.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../public/font/rational/RationalText-BlackItalic.ttf",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-rational",
});

export const metadata: Metadata = {
  title: "Andinoh - Book Hotels, Flights & Event Spaces",
  description: "Discover and book hotels, flights, and event spaces with Andinoh. Your ultimate travel booking platform.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Andinoh",
  },
  icons: {
    icon: "/logos/ANDINOH-FAV.jpg",
  },
};

export const viewport = {
  themeColor: "#0F75BD",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logos/ANDINOH-FAV.jpg" />
      </head>
      <body className={`${rational.variable} ${rational.className} antialiased`}>
        <Navbar />
        <main className="min-h-screen bg-[#FAFAFB]">
          {children}
        </main>
        <footer className="bg-white border-t border-[#E5E7EB] py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-[#5C5B59] text-sm">
              <p>© 2024 Andinoh. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
