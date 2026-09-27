import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
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
    <html lang="fr" className="dark scroll-smooth">
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
