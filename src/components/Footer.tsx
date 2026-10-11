import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, MapPin, Calendar, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-noir-950 text-slate-400 text-xs mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        
        {/* En-tête / Citation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-12 border-b border-white/10">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gold-500/50 flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="Logo Le Cercle des Rois"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-serif text-xl font-bold text-white tracking-tight">
                Le Cercle des Rois
              </span>
            </div>
            <p className="text-sm text-slate-300 font-serif italic">
              « Les échecs, comme à l'époque. Garder vivante une tradition et une famille de joueurs — même sans club, même sans ligue. »
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-gold-400" />
              Annaba, Algérie
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-gold-400" />
              1ᵉʳ jeudi du mois (après Isha)
            </span>
          </div>
        </div>

        {/* Colonnes de liens */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="space-y-3">
            <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Compétitions</span>
            <ul className="space-y-2">
              <li>
                <Link href="/tournois" className="hover:text-gold-400 transition-colors">
                  Prochains Tournois
                </Link>
              </li>
              <li>
                <Link href="/inscription" className="hover:text-gold-400 transition-colors">
                  Inscription en ligne
                </Link>
              </li>
              <li>
                <Link href="/archives" className="hover:text-gold-400 transition-colors">
                  Palmarès & Résultats
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Communauté</span>
            <ul className="space-y-2">
              <li>
                <Link href="/annuaire" className="hover:text-gold-400 transition-colors">
                  Annuaire des 53 Joueurs
                </Link>
              </li>
              <li>
                <Link href="/histoire" className="hover:text-gold-400 transition-colors">
                  Mémoire Hamra & AUCA
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Organisation</span>
            <ul className="space-y-2">
              <li>
                <Link href="/admin" className="text-gold-400 hover:text-gold-300 font-semibold flex items-center gap-1 transition-colors">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Console Organisateur</span>
                </Link>
              </li>
              <li>
                <span className="text-slate-500">Café Dardara & selon l'édition</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Règlement</span>
            <p className="text-xs text-slate-400 leading-relaxed">
              Système suisse en 7 rondes. Cadence Blitz 5m + 3s d'incrément. Fair-play et convivialité.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <span>
            © {new Date().getFullYear()} Le Cercle des Rois — Tous droits réservés. Échiquier d'Annaba.
          </span>
          <span className="font-mono text-slate-600">
            annaba · blitz · cdr 2026
          </span>
        </div>

      </div>
    </footer>
  );
};
