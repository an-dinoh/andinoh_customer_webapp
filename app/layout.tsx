import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ClientLayout from "@/components/common/ClientLayout";

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
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
