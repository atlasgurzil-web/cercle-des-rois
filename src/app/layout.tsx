import type { Metadata } from "next";
import { Instrument_Serif, JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const fontSans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://cercledesrois.dz'),
  title: "Le Cercle des Rois | Tournois d'échecs indépendants — Annaba",
  description: "Plateforme officielle du Cercle des Rois à Annaba. Inscription en ligne aux tournois, archives des éditions passées, palmarès et annuaire de la communauté échiquéenne.",
  keywords: ["échecs", "Annaba", "Le Cercle des Rois", "tournoi d'échecs", "Hamra Annaba", "AUCA", "blitz", "échecs Algérie"],
  authors: [{ name: "Le Cercle des Rois" }],
  openGraph: {
    title: "Le Cercle des Rois | Tournois d'échecs à Annaba",
    description: "Rejoignez notre rendez-vous mensuel d'échecs après Isha. Inscriptions ouvertes et archives complètes.",
    url: "https://cercledesrois.dz",
    siteName: "Le Cercle des Rois",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "Logo Le Cercle des Rois - Annaba",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="fr" 
      data-theme="lumen" 
      className={`dark scroll-smooth ${instrumentSerif.variable} ${fontSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen flex flex-col justify-between selection:bg-gold-500/30 selection:text-gold-200">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
