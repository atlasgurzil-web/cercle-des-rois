/* Hallmark · macrostructure: Editorial Broadside · theme: Studio/Royal · genre: editorial
 * pre-emit critique: P5 H5 E5 S5 R5 V5
 * slop: pass (1-58) · contrast: pass (40-41) · nav: N5 · footer: Ft5
 */

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Crown, BookOpen, MapPin, Calendar, ChevronRight } from 'lucide-react';
import { CDR_HISTORY } from '@/data/history';

export default function HistoirePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-16">
      
      {/* Editorial Header */}
      <div className="space-y-4 border-b border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-noir-900 border border-gold-500/30 text-gold-400 text-xs font-semibold uppercase tracking-widest">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Histoire & Mémoire d'Annaba</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
          L'Histoire de nos Tournois
        </h1>
        <p className="font-serif text-lg sm:text-xl text-gold-400 max-w-2xl font-normal">
          « Ce que nous recherchons, ce n'est pas la médaille. C'est de garder vivante une tradition, un espace, une famille de joueurs. »
        </p>
      </div>

      {/* Sceal & Club Context Diptych */}
      <div className="p-8 rounded-2xl card-royal border border-gold-500/30 flex flex-col sm:flex-row items-center gap-8">
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-gold-400 overflow-hidden flex-shrink-0">
          <Image
            src="/logo.png"
            alt="Sceau Le Cercle des Rois"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="space-y-2 text-sm text-slate-300">
          <div className="text-xs uppercase tracking-widest text-gold-400 font-bold">Le Cercle des Rois</div>
          <p className="leading-relaxed">
            Né de la volonté d'anciens sociétaires du <strong>Hamra Annaba</strong> et de l'<strong>AUCA</strong>, le Cercle des Rois est un sanctuaire d'échecs indépendant. Sans ligue officielle et sans subventions, mais avec la passion intacte de plusieurs générations.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-gold-500" />
              1ᵉʳ jeudi du mois après Isha
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-gold-500" />
              Café Dardara, Annaba
            </span>
          </div>
        </div>
      </div>

      {/* Authentic Prose Blocks */}
      <div className="space-y-8 text-slate-300 text-base sm:text-lg leading-relaxed font-light">
        
        <p className="first-letter:font-serif first-letter:text-5xl first-letter:font-bold first-letter:text-gold-400 first-letter:mr-3 first-letter:float-left">
          {CDR_HISTORY.fullText[0]}
        </p>

        <blockquote className="border-l-2 border-gold-500 pl-6 py-2 my-6 font-serif text-lg sm:text-xl text-white font-normal bg-noir-900/60 rounded-r-xl">
          « {CDR_HISTORY.fullText[1]} »
        </blockquote>

        <p>
          {CDR_HISTORY.fullText[2]}
        </p>

        <p>
          {CDR_HISTORY.fullText[3]}
        </p>

        <div className="p-6 rounded-xl bg-noir-900 border border-slate-800 space-y-2 text-sm sm:text-base">
          <div className="text-xs font-bold uppercase tracking-wider text-gold-400">
            De 7 à 77 ans autour du même échiquier
          </div>
          <p className="text-slate-300 leading-relaxed">
            {CDR_HISTORY.fullText[4]}
          </p>
        </div>

        <p className="font-serif text-xl sm:text-2xl text-white font-semibold pt-4 text-center">
          {CDR_HISTORY.fullText[5]}
        </p>

      </div>

      {/* Call to action */}
      <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400">
          Envie de partager une partie au prochain rendez-vous ?
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/tournois"
            className="px-6 py-3 rounded-xl font-bold bg-gold-500 text-noir-950 hover:bg-gold-400 transition-colors text-xs uppercase tracking-wider"
          >
            Rejoindre un Tournoi
          </Link>
          <Link
            href="/annuaire"
            className="px-5 py-3 rounded-xl font-semibold bg-noir-850 text-slate-300 border border-slate-700 hover:border-gold-500/50 transition-colors text-xs"
          >
            L'Annuaire des Joueurs
          </Link>
        </div>
      </div>

    </div>
  );
}
