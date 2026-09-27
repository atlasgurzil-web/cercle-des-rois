import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="footer relative overflow-hidden">
      <div className="footer__inner">
        <p className="footer__statement">
          <em>Les échecs</em>, comme à l'époque.<br />
          Garder vivante une tradition et une famille de joueurs — même sans club, même sans ligue.
        </p>
        <div className="footer__meta">
          <span className="footer__mark" aria-hidden="true" />
          <div className="footer__col">
            <span className="text-[var(--color-ink)] font-semibold">Le Cercle des Rois</span>
            <span>Annaba, Algérie · Lieux selon édition</span>
            <span>Chaque 1er jeudi du mois · après Isha</span>
          </div>
          <div className="footer__col">
            <Link href="/tournois">Prochains Tournois</Link>
            <Link href="/archives">Palmarès & Archives</Link>
            <Link href="/annuaire">Annuaire des 53 Joueurs</Link>
            <Link href="/histoire">Mémoire du Hamra & AUCA</Link>
          </div>
          <div className="footer__col footer__copy">
            <Link href="/admin" className="text-[var(--color-accent)] font-semibold">
              Console Organisateur (PIN)
            </Link>
            <span>© {new Date().getFullYear()} Le Cercle des Rois</span>
            <span className="footer__hash">annaba · cdr · edition v4</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
