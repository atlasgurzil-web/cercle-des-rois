'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Trophy, Users, BookOpen, Calendar, ShieldCheck, Menu, X, Crown } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Accueil', icon: Crown },
    { href: '/tournois', label: 'Tournois', icon: Calendar },
    { href: '/archives', label: 'Palmarès', icon: Trophy },
    { href: '/annuaire', label: 'Annuaire', icon: Users },
    { href: '/histoire', label: 'Histoire', icon: BookOpen },
  ];

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-noir-950/90 border-b border-gold-500/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border border-gold-500/50 shadow-sm">
              <Image
                src="/logo.png"
                alt="Logo Le Cercle des Rois"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-base sm:text-lg font-bold tracking-wider text-white group-hover:text-gold-400 transition-colors">
                LE CERCLE DES ROIS
              </span>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-slate-400">
                <span>Annaba</span>
                <span className="text-gold-500">•</span>
                <span>Tournois Indépendants</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links — Floating Pill Archetype (N5) */}
          <nav className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-full bg-noir-900 border border-slate-800">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors ${
                    active
                      ? 'text-noir-950 bg-gold-500 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-noir-800'
                  }`}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Admin CTA Button & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider bg-noir-900 text-gold-400 border border-gold-500/30 hover:border-gold-400 hover:bg-gold-500/10 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
              <span>Organisateur</span>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-gold-400 hover:bg-noir-800 focus:outline-none"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-noir-900 border-b border-gold-500/20 px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'text-gold-400 bg-gold-500/15 border border-gold-500/30'
                    : 'text-slate-300 hover:bg-noir-800 hover:text-gold-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-gold-400' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-800">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-gold-500 text-noir-950 hover:bg-gold-400 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Espace Organisateur (Code PIN)</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
