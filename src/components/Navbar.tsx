'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/tournois', label: 'Tournois' },
    { href: '/archives', label: 'Palmarès' },
    { href: '/annuaire', label: 'Annuaire' },
    { href: '/histoire', label: 'Histoire' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="fixed top-4 left-0 right-0 z-50 flex justify-center pointer-events-none px-4" role="banner">
      <div className="pointer-events-auto flex items-center justify-between gap-3 sm:gap-6 md:gap-8 px-4 py-2 bg-noir-900/90 backdrop-blur-xl border border-white/10 rounded-full max-w-[calc(100vw-2rem)] shadow-2xl">
        
        {/* Logo & Nom */}
        <Link href="/" className="inline-flex items-center gap-2 group pl-1" aria-label="Le Cercle des Rois">
          <div className="relative w-6 h-6 rounded-full overflow-hidden border border-gold-500 bg-noir-850 flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Logo CDR"
              fill
              className="object-cover"
            />
          </div>
          <span className="font-serif text-lg sm:text-xl font-normal text-white tracking-tight whitespace-nowrap">
            Cercle des Rois
          </span>
        </Link>

        {/* Liens Desktop */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-xs sm:text-sm font-medium tracking-normal" aria-label="Navigation principale">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors duration-150 whitespace-nowrap ${
                  active
                    ? 'text-gold-400 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions à droite */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/admin"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-2 py-1"
            title="Console Organisateur"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
            <span className="font-mono text-[11px] tracking-wider uppercase">PIN</span>
          </Link>

          <Link
            href="/inscription"
            className="btn-gold !py-1.5 !px-3.5 sm:!px-4 !text-xs sm:!text-sm"
          >
            S'inscrire
          </Link>

          {/* Bouton mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-300 hover:text-white"
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div id="mobile-navigation" className="pointer-events-auto fixed top-20 left-4 right-4 bg-noir-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-3 md:hidden animate-in fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`py-2 px-3 rounded-lg text-sm transition-colors ${
                isActive(link.href)
                  ? 'bg-gold-500/10 text-gold-400 font-semibold border border-gold-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-white/10 flex justify-between items-center text-xs">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-400 hover:text-white flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-gold-400" />
              <span>Console Organisateur</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
