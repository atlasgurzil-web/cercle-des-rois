import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Crown, MapPin, Calendar, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-noir-950 border-t border-gold-500/20 pt-16 pb-12 mt-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Ft5 Statement Archetype — Big authoritative club statement */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-400">
            <Crown className="w-3.5 h-3.5" />
            <span>Le Cercle des Rois • Annaba</span>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-white leading-snug">
            « Garder vivante une tradition, un espace, une famille de joueurs — même sans club, même sans ligue. »
          </p>
          <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
            Tournois amicaux le premier jeudi de chaque mois après la prière d'Isha au Café Dardara. De 7 à 77 ans, en mémoire des anciens du Hamra Annaba et de l'AUCA.
          </p>
        </div>

        {/* Minimal Navigation & Direct Links Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-wrap items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/tournois" className="hover:text-gold-400 transition-colors">
              Prochains Tournois
            </Link>
            <Link href="/archives" className="hover:text-gold-400 transition-colors">
              Palmarès & Résultats
            </Link>
            <Link href="/annuaire" className="hover:text-gold-400 transition-colors">
              Annuaire des 53 Joueurs
            </Link>
            <Link href="/histoire" className="hover:text-gold-400 transition-colors">
              Histoire du Club
            </Link>
            <Link href="/admin" className="hover:text-gold-400 transition-colors flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-gold-500" />
              <span>Accès Organisateur</span>
            </Link>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>Café Dardara, Annaba</span>
            <span>•</span>
            <span>© {new Date().getFullYear()} Le Cercle des Rois</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
