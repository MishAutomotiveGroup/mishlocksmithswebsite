import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://mishlocksmiths.co.uk"),
  title: "Mish Auto Locksmiths",
  description:
    "Mobile vehicle locksmith services across Guildford and Surrey.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Mish Auto Locksmiths",
    description: "Mobile vehicle locksmith services across Guildford and Surrey.",
    url: "https://mishlocksmiths.co.uk",
    siteName: "Mish Auto Locksmiths",
    locale: "en_GB",
    type: "website",
  },
  icons: {
    icon: "/logo-mark.svg",
    shortcut: "/logo-mark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
