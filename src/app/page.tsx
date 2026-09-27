/* Hallmark · macrostructure: Marquee Hero with Apparatus · theme: Lumen (Night Foundry)
 * drop: Night Foundry · paper: oklch(13% 0.014 265) · accent: oklch(76% 0.17 50) + oklch(68% 0.16 18)
 * display: Instrument Serif 400 · body: Geist Sans · labels: JetBrains Mono all-caps
 * axes: dark / classical-serif / warm-brass · nav: N5 floating pill · footer: Ft5 statement
 * reference: https://www.usehallmark.com/examples/lumen-01/
 */

import React from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  ChevronRight, 
  Flame, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { getUpcomingTournaments, getArchivedTournaments, getAllPlayers } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const upcomingTournaments = getUpcomingTournaments();
  const archivedTournaments = getArchivedTournaments();
  const allPlayers = getAllPlayers();
  const activeTournament = upcomingTournaments[0];

  const confirmedPlayers = activeTournament?.registeredPlayers?.filter(p => p.status === 'confirmed') || [];
  const spotsLeft = activeTournament ? Math.max(0, activeTournament.maxParticipants - confirmedPlayers.length) : 0;
  const fillPercentage = activeTournament ? Math.min(100, Math.round((confirmedPlayers.length / activeTournament.maxParticipants) * 100)) : 0;

  return (
    <div className="space-y-0">

      {/* ─── Hero — Marquee Hero with filament-chamber apparatus ─── */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__grid" aria-hidden="true" />
        <div className="hero__emit" aria-hidden="true" />

        <div className="hero__inner">
          <div className="hero__copy">
            <p className="eyebrow">
              <span className="ord">00</span>
              <span className="dot-mid">·</span>
              Échiquier d'Annaba
            </p>
            <h1 className="hero__title" id="hero-title">
              Le Cercle des&nbsp;<em>Rois</em>.
            </h1>
            <p className="hero__lede">
              La plateforme indépendante des passionnés d'échecs d'Annaba.
              Préservée par les anciens du Hamra et de l'AUCA : des tournois amicaux
              le premier jeudi de chaque mois au Café Dardara, après la prière d'Isha.
            </p>
            <div className="hero__cta">
              {activeTournament ? (
                <Link className="btn btn--accent" href={`/tournoi/${activeTournament.slug}`}>
                  S'inscrire à l'Édition #{activeTournament.edition}
                </Link>
              ) : (
                <Link className="btn btn--accent" href="/tournois">
                  Voir les Tournois
                </Link>
              )}
              <Link className="btn btn--ghost" href="/archives">
                Consulter les Archives →
              </Link>
            </div>
            
            {/* Runtime Specification block */}
            <dl className="hero__spec" aria-label="Spécifications du tournoi">
              <div className="hero__spec-pair">
                <dt>Lieu</dt>
                <dd>Café Dardara, Annaba</dd>
              </div>
              <div className="hero__spec-pair">
                <dt>Horaire</dt>
                <dd>Chaque 1ᵉʳ jeudi du mois · 20:30 (après Isha)</dd>
              </div>
              <div className="hero__spec-pair">
                <dt>Cadence</dt>
                <dd>Blitz 5 min + 3 sec · Système suisse 7 rondes</dd>
              </div>
              <div className="hero__spec-pair">
                <dt>Jauge</dt>
                <dd>32 participants · Frais d'entrée : Gratuit</dd>
              </div>
            </dl>
          </div>

          {/* Apparatus — vertical royal filament chamber, annotated */}
          <figure className="apparatus" aria-hidden="true">
            <div className="chamber">
              <span className="chamber__cap chamber__cap--top" />
              <span className="chamber__cap chamber__cap--bottom" />
              <span className="chamber__electrode" style={{ '--y': '20%' } as React.CSSProperties} />
              <span className="chamber__electrode" style={{ '--y': '40%' } as React.CSSProperties} />
              <span className="chamber__electrode" style={{ '--y': '60%' } as React.CSSProperties} />
              <span className="chamber__electrode" style={{ '--y': '80%' } as React.CSSProperties} />
              <span className="chamber__halo" />
              <span className="chamber__filament" />
              <span className="chamber__bloom" />
              <p className="chamber__stencil">CDR-26</p>
            </div>

            <ul className="callouts">
              <li className="callout callout--left" style={{ '--y': '18%' } as React.CSSProperties}>
                <span>Édition #IV · Inscriptions</span>
              </li>
              <li className="callout callout--right" style={{ '--y': '36%' } as React.CSSProperties}>
                <span>Jauge · 32 Joueurs</span>
              </li>
              <li className="callout callout--left" style={{ '--y': '58%' } as React.CSSProperties}>
                <span>Cadence · 5'+3" Suisse</span>
              </li>
              <li className="callout callout--right" style={{ '--y': '78%' } as React.CSSProperties}>
                <span>Café Dardara · Annaba</span>
              </li>
            </ul>
          </figure>
        </div>
      </section>

      {/* ─── Meter strip — signature move 5 ─── */}
      <aside className="meter" aria-label="Statut en direct de la jauge">
        <p className="meter__label meter__label--left">
          <span className="meter__dot" aria-hidden="true" />
          Échiquier Annaba · Pointage en direct
        </p>
        <div className="meter__bars" aria-hidden="true">
          {/* 60 vertical bars driven by sine envelope */}
          {[28, 34, 42, 50, 62, 74, 86, 94, 100, 92, 80, 68, 54, 42, 34, 28, 22, 28, 36, 48, 64, 78, 90, 96, 90, 78, 62, 48, 36, 26, 22, 28, 40, 56, 72, 86, 92, 88, 76, 60, 46, 34, 26, 22, 30, 44, 60, 76, 88, 94, 88, 74, 58, 44, 32, 26, 22, 26, 32, 40].map((h, i) => (
            <span key={i} style={{ '--h': `${h}%` } as React.CSSProperties} />
          ))}
        </div>
        <p className="meter__label meter__label--right">
          {confirmedPlayers.length} / {activeTournament?.maxParticipants || 32} inscrits · {spotsLeft} places restantes
        </p>
      </aside>

      {/* ─── Stat row — Instrument Serif numerals, tabular-nums ─── */}
      <section className="stats" aria-label="Statistiques du club">
        <dl className="stats__grid">
          <div className="stat">
            <dt className="stat__label">Joueurs répertoriés</dt>
            <dd className="stat__value">
              <span className="stat__num">{allPlayers.length}</span>
              <span className="stat__unit">membres</span>
            </dd>
          </div>
          <div className="stat">
            <dt className="stat__label">Éditions officielles</dt>
            <dd className="stat__value">
              <span className="stat__num">{archivedTournaments.length}</span>
              <span className="stat__unit">tournois</span>
            </dd>
          </div>
          <div className="stat">
            <dt className="stat__label">Capacité par tournoi</dt>
            <dd className="stat__value">
              <span className="stat__num">32</span>
              <span className="stat__unit">échiquiers</span>
            </dd>
          </div>
        </dl>
        <p className="stats__note">
          Données historiques vérifiées issues des fichiers Chess-Results (CDR I, CDR II, CDR III) 
          et de l'annuaire des anciens joueurs d'Annaba.
        </p>
      </section>

      {/* ─── Piliers / Runtime cards — hairline + inner emission ─── */}
      <section className="section" id="tradition" aria-labelledby="tradition-title">
        <header className="section__head">
          <p className="eyebrow">
            <span className="ord">01</span>
            <span className="dot-mid">·</span>
            Tradition
          </p>
          <h2 className="section__title" id="tradition-title">
            Garder vivante une <em>flamme</em> échiquéenne.
          </h2>
          <p className="section__lede">
            Même sans club formel, même sans ligue locale. Le Cercle des Rois s'appuie 
            sur la fidélité de ses membres pour réunir toutes les générations autour des 64 cases.
          </p>
        </header>

        <div className="cards">
          <article className="card-lumen">
            <p className="card__eyebrow">a · mémoire</p>
            <h3 className="card__title text-white font-medium text-lg mt-1 mb-2">Héritage du Hamra & AUCA</h3>
            <p className="card__body text-sm text-[var(--color-ink-2)] leading-relaxed">
              La plupart des joueurs d'Annaba sont les héritiers des grands clubs de la ville. 
              Le Cercle perpétue cette mémoire vivante en maintenant le niveau et l'esprit du jeu.
            </p>
          </article>
          <article className="card-lumen">
            <p className="card__eyebrow">b · convivialité</p>
            <h3 className="card__title text-white font-medium text-lg mt-1 mb-2">Le rendez-vous d'Isha</h3>
            <p className="card__body text-sm text-[var(--color-ink-2)] leading-relaxed">
              Pas d'arbitres rigides, pas d'enjeu financier. Le premier jeudi du mois, 
              on pose les pendules au Café Dardara pour le plaisir pur de la compétition fraternelle.
            </p>
          </article>
          <article className="card-lumen">
            <p className="card__eyebrow">c · transmission</p>
            <h3 className="card__title text-white font-medium text-lg mt-1 mb-2">De 7 à 77 ans</h3>
            <p className="card__body text-sm text-[var(--color-ink-2)] leading-relaxed">
              Les maîtres chevronnés affrontent la jeune relève. Les pendules électroniques 
              et les jeux complets sont fournis bénévolement par les organisateurs du Cercle.
            </p>
          </article>
        </div>
      </section>

      {/* ─── Tournament Workbench — Lumen Code Block Style ─── */}
      <section className="section section--code" id="prochain" aria-labelledby="prochain-title">
        <header className="section__head">
          <p className="eyebrow">
            <span className="ord">02</span>
            <span className="dot-mid">·</span>
            Prochaine Édition
          </p>
          <h2 className="section__title" id="prochain-title">
            Fiche technique du <em>Tournoi</em>.
          </h2>
          <p className="section__lede">
            Pointage le jour J sur place. Inscription en ligne immédiate avec confirmation instantanée 
            et placement prioritaire sur liste d'attente.
          </p>
        </header>

        <div className="code">
          <div className="code__head">
            <p className="code__path">cercle-des-rois/annaba/edition-04.json</p>
            <p className="code__sha">jauge {confirmedPlayers.length}/32</p>
          </div>
          <div className="code__tabs" role="tablist">
            <button className="code__tab is-active" role="tab" aria-selected="true">tournoi.json</button>
            <button className="code__tab" role="tab" aria-selected="false">reglement.md</button>
            <button className="code__tab" role="tab" aria-selected="false">inscrits.csv</button>
          </div>
          <pre className="code__body"><code><span className="ln">01</span> <span className="tok-kw">"edition"</span>: <span className="tok-num">4</span>,
<span className="ln">02</span> <span className="tok-kw">"titre"</span>: <span className="tok-str">"{activeTournament?.title || 'Le Cercle des Rois IV'}"</span>,
<span className="ln">03</span> <span className="tok-kw">"date"</span>: <span className="tok-str">"{activeTournament?.dateFormatted || 'Premier jeudi du mois'}"</span>,
<span className="ln">04</span> <span className="tok-kw">"horaire"</span>: <span className="tok-str">"{activeTournament?.time || '20:30 (Après la prière d\'Isha)'}"</span>,
<span className="ln">05</span> <span className="tok-kw">"lieu"</span>: <span className="tok-str">"{activeTournament?.location || 'Café Dardara, Annaba'}"</span>,
<span className="ln">06</span> <span className="tok-kw">"cadence"</span>: <span className="tok-str">"{activeTournament?.cadence || 'Blitz 5 min + 3 sec'}"</span>,
<span className="ln">07</span> <span className="tok-kw">"systeme"</span>: <span className="tok-str">"Suisse en 7 rondes homologué FIDE départages (DE, Buchholz)"</span>,
<span className="ln">08</span> <span className="tok-kw">"jauge_max"</span>: <span className="tok-num">32</span>,
<span className="ln">09</span> <span className="tok-kw">"places_restantes"</span>: <span className="tok-num">{spotsLeft}</span></code></pre>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          {activeTournament && (
            <Link
              href={`/tournoi/${activeTournament.slug}`}
              className="btn btn--accent"
            >
              Rejoindre la table des inscriptions →
            </Link>
          )}
          <Link
            href="/annuaire"
            className="btn btn--ghost"
          >
            Consulter l'annuaire des 53 joueurs
          </Link>
        </div>
      </section>

      {/* ─── Palmarès / Changelog ─── */}
      <section className="section section--changelog" id="palmares" aria-labelledby="palmares-title">
        <header className="section__head">
          <p className="eyebrow">
            <span className="ord">03</span>
            <span className="dot-mid">·</span>
            Palmarès
          </p>
          <h2 className="section__title" id="palmares-title">
            Historique des <em>champions</em>.
          </h2>
        </header>

        <ol className="log">
          <li className="log__entry">
            <time className="log__date" dateTime="2024-05">CDR III · Mai 2024</time>
            <div className="log__text">
              <strong className="text-[var(--color-accent)] font-semibold">Champion : BENLAID Lakhdar</strong> (6.0 pts / 7 rondes).
              2ᵉ place : TOUIL Achref (5.5 pts), 3ᵉ place : KOUDRI Samir (5.0 pts). 22 participants au Café Dardara.
            </div>
          </li>
          <li className="log__entry">
            <time className="log__date" dateTime="2024-04">CDR II · Avril 2024</time>
            <div className="log__text">
              <strong className="text-[var(--color-accent)] font-semibold">Champion : TOUIL Achref</strong> (5.5 pts / 7 rondes).
              2ᵉ place : BENLAID Lakhdar (5.5 pts), 3ᵉ place : AMARA Oussama (5.0 pts). Départage Buchholz Cut 1.
            </div>
          </li>
          <li className="log__entry">
            <time className="log__date" dateTime="2024-03">CDR I · Mars 2024</time>
            <div className="log__text">
              <strong className="text-[var(--color-accent)] font-semibold">Champion : KOUDRI Samir</strong> (6.5 pts / 7 rondes).
              Édition inaugurale réunissant 24 anciens sociétaires de la wilaya d'Annaba.
            </div>
          </li>
        </ol>

        <div className="mt-8">
          <Link href="/archives" className="btn btn--ghost text-xs">
            Voir les grilles américaines complètes et départages FIDE →
          </Link>
        </div>
      </section>

    </div>
  );
}
