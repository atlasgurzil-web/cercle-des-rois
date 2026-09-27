# PRD — Le Cercle des Rois

## Problème

À Annaba, les clubs d'échecs historiques (notamment Hamra Annaba et l'AUCA) ont quasiment tous disparu, et aucune ligue officielle n'a pu voir le jour dans la ville. Malgré la disparition de ces structures formelles, une communauté de joueurs fidèles refuse de ranger les échiquiers et maintient vivante une tradition locale : des tournois réguliers et conviviaux, organisés généralement le premier jeudi du mois, après la prière d'Isha.

Cependant, l'organisation de ces rendez-vous repose jusqu'ici sur des canaux informels et fragmentés (bouche-à-oreille, messages disparates), sans vitrine claire, sans outil centralisé pour diffuser les annonces de tournois, sans suivi propre des inscriptions selon la capacité du lieu d'accueil (tel que le Café Dardara), et sans mémoire pérenne pour valoriser le palmarès des éditions disputées. Les organisateurs ont besoin d'un espace dédié, propre et digne pour rassembler cette famille de joueurs de 7 à 77 ans, sans la lourdeur d'un système fédéral.

## Solution

Une plateforme officielle et sur-mesure pour « Le Cercle des Rois » permettant de :
- Transmettre l'histoire, la mémoire et l'esprit fraternel de la communauté échiquéenne d'Annaba.
- Créer et publier des fiches de tournois officielles partageables instantanément par lien direct, WhatsApp et QR code.
- Offrir aux participants un formulaire d'inscription mobile ultra-rapide (nom, prénom, ID FIDE, date de naissance, téléphone, email, club) sans création de compte ni mot de passe obligatoire.
- Réguler la capacité d'accueil de la salle grâce à une jauge en direct et une liste d'attente automatique dès que le quota est atteint.
- Conserver et mettre en valeur les archives des éditions passées avec podiums d'honneur, statistiques et grilles de classements complets.
- Permettre à l'organisateur, via un code d'accès simple (12081988), de pointer les présences sur place le jour J, d'exporter la liste des inscrits pour les logiciels d'arbitrage (format tableur / Papi) et de gérer un annuaire centralisé des membres.

## Utilisateur cible

- **L'Organisateur (ex: Hamza)** : Responsable bénévole qui organise les tournois mensuels au Café Dardara. Il veut publier une annonce soignée, envoyer un lien sur WhatsApp, suivre le nombre d'inscrits en direct, pointer les joueurs à l'arrivée et disposer d'un fichier prêt pour le tirage au sort.
- **Le Joueur d'échecs d'Annaba (de 7 à 77 ans)** : Vétéran issu des anciens clubs (Hamra, AUCA) ou jeune talent en pleine découverte du jeu. Il reçoit un lien d'inscription sur son smartphone, remplit ses informations en 30 secondes sans mot de passe, vérifie sa présence sur la liste publique et consulte son historique de tournois.
- **Le Passionné régional** : Joueur d'Annaba ou des villes environnantes (Makomades, Tébessa, Biskra) qui souhaite découvrir les activités du Cercle des Rois, lire l'histoire du groupe et rejoindre les futurs événements.

## User Stories

- **US-1** : En tant que visiteur, je veux lire l'histoire et les valeurs du Cercle des Rois, afin de comprendre l'héritage d'Annaba (Hamra Annaba, AUCA) et l'esprit amical des tournois.
- **US-2** : En tant que joueur, je veux consulter la fiche complète du prochain tournoi (date, horaire après Isha, lieu, cadence, formule, frais éventuels sur place), afin de planifier ma participation.
- **US-3** : En tant que joueur, je veux m'inscrire via un formulaire simple sur mobile (nom, prénom, téléphone, date de naissance, ID FIDE optionnel, email optionnel, club), afin de réserver ma place sans mot de passe.
- **US-4** : En tant que joueur, je veux savoir immédiatement si mon inscription est confirmée ou si je suis placé sur liste d'attente en cas de jauge atteinte, afin de savoir si ma place assise est garantie.
- **US-5** : En tant que joueur, je veux voir la liste publique des participants (nom, prénom, club, ID FIDE/Elo), afin de connaître les forces en présence tout en ayant l'assurance que mon téléphone et mon email restent strictement confidentiels.
- **US-6** : En tant que joueur ou organisateur, je veux partager la fiche du tournoi en 1 clic sur WhatsApp avec un message pré-rempli, afin d'inviter rapidement mes contacts et groupes d'échecs.
- **US-7** : En tant qu'organisateur, je veux afficher et télécharger un QR code de la fiche d'inscription, afin de l'imprimer sur affiche ou le mettre à disposition au café.
- **US-8** : En tant que joueur ou passionné, je veux consulter les archives des éditions passées, afin de revoir les podiums d'honneur et les vainqueurs historiques.
- **US-9** : En tant que joueur, je veux accéder aux grilles de classements détaillées des anciens tournois (points, départages Buchholz et Sonneborn-Berger, liens officiels Chess-Results), afin de vérifier les résultats officiels.
- **US-10** : En tant que membre de la communauté, je veux consulter l'annuaire public des joueurs pour voir les membres répertoriés, leurs clubs et leur assiduité aux tournois.
- **US-11** : En tant qu'organisateur, je veux déverrouiller l'espace d'administration à l'aide de mon code secret (12081988), afin d'accéder aux fonctions de gestion et aux coordonnées complètes sans compte complexe.
- **US-12** : En tant qu'organisateur, je veux marquer d'un clic les joueurs présents à leur arrivée sur le lieu du tournoi (pointage), afin de préparer la liste réelle avant la ronde 1.
- **US-13** : En tant qu'organisateur, je veux exporter la liste des joueurs inscrits au format tableur (CSV / compatible Papi), afin de l'injecter immédiatement dans le logiciel d'arbitrage.
- **US-14** : En tant qu'organisateur, je veux clôturer un tournoi terminé en renseignant le podium pour qu'il soit versé automatiquement dans les archives officielles du site.

## Critères de succès

- Formulaire d'inscription rempli et validé en moins de 30 secondes depuis un smartphone.
- Bouton de partage WhatsApp ouvrant l'application avec message pré-formaté et lien direct opérationnel.
- Attribution automatique du statut « Validé » ou « Liste d'attente » selon le plafond de participants configuré.
- Fichier d'export CSV généré en 1 clic contenant les colonnes nécessaires au logiciel d'arbitrage (Nom, Prénom, FIDE, Club, Date de naissance, Présence).
- Déverrouillage immédiat des informations privées et des outils de gestion lors de la saisie du code PIN 12081988.
- Absence totale de numéros de téléphone et d'emails sur les vues publiques non authentifiées.

## Hors périmètre

- Paiement en ligne obligatoire par carte bancaire en V1 (les tournois sont gratuits ou avec frais réglés sur place).
- Moteur d'appariement suisse intégré complexe calculant les rondes en direct sur le web (le tirage reste effectué par les arbitres via les logiciels dédiés comme Papi, la plateforme assure l'amont et l'aval).
- Plateforme multi-organisateurs SaaS ouverte à des clubs tiers ou d'autres villes en V1 (le site est dédié à 100% au Cercle des Rois d'Annaba).
- Photos de profil individuelles obligatoires pour chaque joueur.
- Comptes utilisateurs individuels avec identifiant et mot de passe à mémoriser pour les joueurs.

## Décisions d'implémentation

- Accès organisateur sécurisé par un code PIN direct (12081988) avec mémorisation de session.
- Formulaire d'inscription conçu en priorité pour une utilisation mobile rapide.
- Protection stricte des données personnelles : téléphone, email et date de naissance masqués par défaut aux visiteurs.
- Traitement de l'annuaire initial avec réconciliation des noms inversés et suppression des doublons entre l'ancien club et les archives.
- Univers graphique sombre et or impérial inspiré du sceau officiel du Cercle des Rois d'Annaba.

## Notes complémentaires

- Données d'amorçage : intégration des 3 premières éditions (CDR I, CDR II, CDR III) extraites de Chess-Results et de l'annuaire consolidé de 53 joueurs réels.
- Dépendance : fonctionnement du partage tributaire de l'application WhatsApp sur le terminal de l'utilisateur.
