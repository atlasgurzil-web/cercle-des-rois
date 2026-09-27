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
      <div className="pointer-events-auto flex items-center justify-between gap-3 sm:gap-6 md:gap-8 px-4 py-2 bg-[oklch(17%_0.016_265_/_0.80)] backdrop-blur-xl border border-[var(--color-rule)] rounded-full max-w-[calc(100vw-2rem)] shadow-[0_12px_32px_-16px_oklch(0%_0_0_/_0.55)]">
        
        {/* Wordmark & Official Royal Logo */}
        <Link href="/" className="inline-flex items-center gap-2 group pl-1" aria-label="Le Cercle des Rois">
          <div className="relative w-6 h-6 rounded-full overflow-hidden border border-[var(--color-accent)] bg-[oklch(17%_0.016_265)] shadow-[0_0_12px_var(--color-glow)] flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Logo CDR"
              fill
              className="object-contain p-0.5"
            />
          </div>
          <span className="font-serif text-lg sm:text-xl font-normal text-[var(--color-ink)] tracking-[-0.02em] whitespace-nowrap">
            Cercle des Rois
          </span>
        </Link>

        {/* Primary Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-xs sm:text-sm font-medium tracking-normal" aria-label="Navigation principale">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors duration-150 whitespace-nowrap ${
                  active
                    ? 'text-[var(--color-accent)] font-semibold'
                    : 'text-[var(--color-ink-2)] hover:text-[var(--color-ink)]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/admin"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors px-2 py-1"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span className="font-mono text-[11px] tracking-wider uppercase">PIN</span>
          </Link>

          <Link
            href="/tournois"
            className="btn btn--accent text-xs sm:text-sm py-1.5 px-3.5 sm:px-4 rounded-full"
          >
            S'inscrire
          </Link>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-[var(--color-ink-2)] hover:text-[var(--color-ink)]"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto fixed top-20 left-4 right-4 bg-[oklch(17%_0.016_265_/_0.95)] backdrop-blur-2xl border border-[var(--color-rule-2)] rounded-2xl p-5 shadow-2xl flex flex-col gap-3 md:hidden animate-in fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`py-2 px-3 rounded-lg text-sm transition-colors ${
                isActive(link.href)
                  ? 'bg-[oklch(22%_0.018_263)] text-[var(--color-accent)] font-semibold'
                  : 'text-[var(--color-ink-2)] hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-[var(--color-rule)] flex justify-between items-center text-xs">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[var(--color-muted)] hover:text-[var(--color-ink)] flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-[var(--color-accent)]" />
              <span>Console Organisateur</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
