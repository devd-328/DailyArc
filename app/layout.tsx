import type { Metadata, Viewport } from "next";
import { Dela_Gothic_One, Zen_Kaku_Gothic_New } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Display font: watcher type names, levels, big numbers, screen titles.
const dela = Dela_Gothic_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dela",
});

// Body and UI font.
const zen = Zen_Kaku_Gothic_New({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-zen",
});

// Katakana for sound-effect lettering only (ドン, ゴ). The Google font metadata in
// next/font does not list a Japanese subset, so this is a self-hosted subset of
// Dela Gothic One that contains just these characters. Add characters here when a
// new sound effect is introduced.
const sfx = localFont({
  src: "./fonts/dela-gothic-one-sfx.woff2",
  weight: "400",
  variable: "--font-sfx-face",
});

export const metadata: Metadata = {
  title: "DailyArc",
  description: "Level up your real life like an anime protagonist, then share your anime identity card.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#eef2f6",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${dela.variable} ${zen.variable} ${sfx.variable}`}>
      <body className="min-h-dvh bg-paper font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
