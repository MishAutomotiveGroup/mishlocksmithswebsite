import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mish Auto Locksmiths",
  description:
    "Mobile vehicle locksmith services across Guildford and Surrey.",
  other: {
    "codex-preview": "development",
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
