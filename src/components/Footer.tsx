import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Crown, Heart, MapPin, Calendar, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-noir-950 border-t border-gold-500/20 pt-16 pb-12 mt-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-chess-pattern opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gold-500/40 shadow-gold-glow">
                <Image
                  src="/logo.png"
                  alt="Le Cercle des Rois Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-gold-gradient tracking-wider">
                  LE CERCLE DES ROIS
                </h3>
                <p className="text-xs text-slate-400 uppercase tracking-widest">
                  Tournois d'échecs indépendants — Annaba
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-400 max-w-md leading-relaxed italic">
              « Garder vivante une tradition, un espace, une famille de joueurs — même sans club, même sans ligue, même avec une mémoire qui parfois nous joue des tours. De 7 à 77 ans autour du même échiquier. »
            </p>

            <div className="flex items-center gap-4 text-xs text-gold-400/80 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gold-500" />
                1ᵉʳ jeudi du mois après Isha
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gold-500" />
                Café Dardara & Annaba
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-gold-400">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/tournois" className="hover:text-gold-300 transition-colors">
                  Prochain Tournoi & Inscriptions
                </Link>
              </li>
              <li>
                <Link href="/archives" className="hover:text-gold-300 transition-colors">
                  Archives & Palmarès officiel
                </Link>
              </li>
              <li>
                <Link href="/annuaire" className="hover:text-gold-300 transition-colors">
                  Annuaire des 50+ Joueurs
                </Link>
              </li>
              <li>
                <Link href="/histoire" className="hover:text-gold-300 transition-colors">
                  L'Histoire du Cercle des Rois
                </Link>
              </li>
            </ul>
          </div>

          {/* Administration & Heritage */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-gold-400">
              Héritage & Club
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              En hommage aux anciens du <strong>Hamra Annaba</strong> et de l'<strong>AUCA</strong>, et à tous les fidèles qui font vivre le noble jeu sur 64 cases à Annaba.
            </p>
            <div className="pt-2">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-gold-400 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
                <span>Accès Organisateur / PIN</span>
              </Link>
            </div>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Le Cercle des Rois. Tous droits réservés.</p>
          <p className="flex items-center gap-1">
            Fait avec passion pour la communauté échiquéenne d'Annaba
          </p>
        </div>
      </div>
    </footer>
  );
};
