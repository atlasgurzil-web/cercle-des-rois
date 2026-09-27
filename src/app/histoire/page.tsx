import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Crown, BookOpen, Heart, Calendar, MapPin, Sparkles, ChevronRight } from 'lucide-react';
import { CDR_HISTORY } from '@/data/history';

export default function HistoirePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
      
      {/* Editorial Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Histoire & Mémoire d'Annaba</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight">
          L'Histoire de <span className="text-gold-gradient">nos Tournois</span>
        </h1>
        <p className="font-serif italic text-base sm:text-xl text-gold-300/90 max-w-2xl mx-auto font-light">
          « Ce que nous recherchons, ce n'est pas la médaille. C'est de garder vivante une tradition, un espace, une famille de joueurs. »
        </p>
      </div>

      {/* Central Visual Sceal */}
      <div className="flex justify-center">
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full border-2 border-gold-400 shadow-gold-glow-lg overflow-hidden">
          <Image
            src="/logo.png"
            alt="Sceau Le Cercle des Rois"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* The Authentic Story Blocks */}
      <div className="card-royal p-8 sm:p-14 rounded-3xl border-2 border-gold-500/30 space-y-8 text-slate-200 text-base sm:text-lg leading-relaxed font-light">
        
        <p className="first-letter:font-serif first-letter:text-5xl first-letter:font-bold first-letter:text-gold-400 first-letter:mr-3 first-letter:float-left">
          {CDR_HISTORY.fullText[0]}
        </p>

        <p className="border-l-2 border-gold-500/60 pl-6 italic text-gold-200/90 text-lg sm:text-xl font-serif py-1">
          « {CDR_HISTORY.fullText[1]} »
        </p>

        <p>
          {CDR_HISTORY.fullText[2]}
        </p>

        <p>
          {CDR_HISTORY.fullText[3]}
        </p>

        <div className="p-6 rounded-2xl bg-noir-850/80 border border-slate-800 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-gold-400 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <span>Le Cœur du Rendez-Vous</span>
          </div>
          <p className="text-sm sm:text-base text-slate-300">
            {CDR_HISTORY.fullText[4]}
          </p>
        </div>

        <p className="font-serif text-xl sm:text-2xl text-white font-semibold pt-4 text-center">
          {CDR_HISTORY.fullText[5]}
        </p>

      </div>

      {/* Heritage Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl card-royal border border-gold-500/20 text-center space-y-3">
          <Crown className="w-8 h-8 text-gold-400 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-white">Hamra Annaba & AUCA</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Les berceaux historiques du jeu dans notre cité. Le Cercle des Rois en recueille la mémoire et la fraternité.
          </p>
        </div>

        <div className="p-6 rounded-2xl card-royal border border-gold-500/20 text-center space-y-3">
          <Calendar className="w-8 h-8 text-gold-400 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-white">Le 1ᵉʳ Jeudi après Isha</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Une date sacrée dans l'agenda des joueurs. On partage le thé, on allume les pendules et le silence studieux s'installe.
          </p>
        </div>

        <div className="p-6 rounded-2xl card-royal border border-gold-500/20 text-center space-y-3">
          <MapPin className="w-8 h-8 text-gold-400 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-white">Café Dardara</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            L'arène conviviale où résonne le bruit sec des pièces en bois et le cliquetis familier des pendules.
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center pt-6 space-y-4">
        <p className="text-sm text-slate-400">
          Vous voulez prendre part à cette aventure humaine et échiquéenne ?
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/tournois"
            className="px-8 py-3.5 rounded-xl font-bold bg-gold-500 text-noir-950 hover:bg-gold-400 shadow-gold-glow transition-all"
          >
            Participer au Prochain Tournoi
          </Link>
          <Link
            href="/annuaire"
            className="px-7 py-3.5 rounded-xl font-semibold bg-noir-850 text-slate-300 border border-slate-700 hover:border-gold-500/50 transition-colors"
          >
            Découvrir les Joueurs
          </Link>
        </div>
      </div>

    </div>
  );
}
