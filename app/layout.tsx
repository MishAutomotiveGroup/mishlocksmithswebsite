import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mish Car Keys",
  description:
    "Mobile vehicle locksmith services, copied from the existing business site ready for rebranding.",
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
