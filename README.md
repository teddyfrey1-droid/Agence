# Premium Retail V1

Scaffold V1 généré dans la conversation.

## Inclus dans cette archive
- Schéma Prisma V1 simplifié
- Auth simple par cookie
- Layout dashboard premium
- Module **Biens V1**
- Module **Demandes V1**
- Module **Terrain V1**
- Module **Dossiers V1**
- Module **Tâches V1**
- Module **Matching V1**
  - recalcul automatique après création / mise à jour d’un bien
  - recalcul automatique après création / mise à jour d’une demande
  - endpoint manuel `POST /api/matches/recompute`
- Polish UI
  - setup Tailwind CSS
  - composants premium partagés (`PageHeader`, `StatCard`, `SectionCard`, `StatusPill`, `EntityHeader`, `DetailItem`)
  - sidebar active
  - topbar enrichie
  - accueil, biens et demandes visuellement retravaillés
  - pages détail uniformisées : biens, demandes, dossiers, terrain, tâches
  - pages **new** uniformisées : biens, demandes, dossiers, terrain, tâches
- Pages **edit** V1 :
  - biens
  - demandes
  - dossiers
  - terrain
  - tâches
- Site public premium V1 :
  - accueil
  - agence
  - biens publiés
  - fiche bien publique
  - formulaire “recherche local”
  - formulaire “proposer un bien”
  - contact

## Compte seed
- Email : `admin@premium-retail.fr`
- Mot de passe : `password123`

## Remarques
- Module **Contacts V1** complètement branché : liste, création, détail, édition, API.
- Les pages publiques utilisent les listings `PUBLISHED` avec visibilité `PUBLIC`.
- Les formulaires publics créent des entrées dans la base pour alimenter le backoffice.

## Commandes
```bash
pnpm install
pnpm prisma generate
pnpm prisma migrate dev --name init
pnpm prisma:seed
pnpm dev
```


## Module Interactions V1

Ajout du module Interactions avec :
- création / édition / lecture d'interactions
- rattachement à un contact, un bien, une demande ou un dossier
- routes API `/api/interactions` et `/api/interactions/[id]`
- pages dashboard `/app/interactions`
- intégration des interactions dans les fiches contact, bien, demande et dossier


## Fichiers de préparation au lancement
- `.env.example`
- `.gitignore`
- `LAUNCH-READINESS.md`

## Démarrage propre
1. Copier `.env.example` vers `.env`
2. Renseigner `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
3. Lancer :
```bash
pnpm install
pnpm prisma generate
pnpm prisma migrate dev --name init
pnpm prisma:seed
pnpm dev
```


## Médias & documents V1

Ajout d'un premier système de gestion de fichiers :
- upload d'images sur les fiches **Biens**
- upload de documents sur les fiches **Biens**, **Demandes**, **Contacts**, **Dossiers** et **Terrain**
- stockage local dans `public/uploads/...` pour le développement
- routes API internes :
  - `/api/uploads/property-media`
  - `/api/uploads/documents`

> Important : ce stockage local est volontairement simple pour continuer à construire proprement la V1. Avant lancement public final, il faudra brancher un vrai stockage objet (S3, R2, Supabase Storage...).


## Auth
- Connexion: `POST /api/auth/login`
- Déconnexion: `POST /api/auth/logout`
- Cookie de session signé côté serveur

## Carte Mapbox V1
- Carte interactive réelle dans `/app/carte`
- Affichage des **biens** et **repérages terrain** géolocalisés
- Recentre automatiquement les marqueurs disponibles
- Popups avec lien direct vers les fiches
- Nécessite `NEXT_PUBLIC_MAPBOX_TOKEN` pour l’affichage réel


## Stockage objet compatible S3
Le projet sait maintenant stocker les médias et documents de deux façons :

- `STORAGE_DRIVER="local"` : stockage local dans `public/uploads` pour le développement
- `STORAGE_DRIVER="s3"` : stockage objet compatible **S3 / R2 / MinIO / Supabase Storage**

Variables à renseigner pour le mode `s3` :
- `STORAGE_BUCKET`
- `STORAGE_REGION`
- `STORAGE_ENDPOINT`
- `STORAGE_ACCESS_KEY`
- `STORAGE_SECRET_KEY`
- `STORAGE_PUBLIC_URL`
- `STORAGE_FORCE_PATH_STYLE`

En l’absence d’une configuration S3 complète, le projet retombe automatiquement sur le stockage local.

## Flows publics
- Dé-duplication des leads entrants par email/téléphone
- Création automatique d'une interaction et d'une tâche de suivi sur les formulaires publics

## Audit projet
- Script disponible : `npm run audit:project`
- Vérifie les imports locaux manquants, fichiers source orphelins et doublons de contenu
- Vérification complète : `npm run check`

## Sweep final UX/runtime
- Préremplissage des créations de tâches depuis les fiches Bien / Demande / Dossier / Contact / Terrain
- Sidebar dashboard avec état actif réel
- Navigation d’action plus cohérente pour les relances et interactions

## Latest pass
- Added `scripts/route-audit.mjs` to validate static page links and API calls.
- Added `npm run audit:routes` and included it in `npm run check`.
- Enforced `requireUser()` on `terrain/new` server page for consistency.
- Added `FUNCTIONAL-RECIPE.md` to track the functional recipe sweep.

## Dernier passage build/runtime
- ajout d'un script `npm run preflight`
- support `SESSION_SECRET` en plus de `NEXTAUTH_SECRET`
- ajout de `GET /api/health` pour vérifier base/config rapidement
- ajout de `.nvmrc` (Node 22)


## Qualité des formulaires publics

Améliorations ajoutées sur les flows publics :
- validation partagée front/back via Zod
- messages d’erreur plus propres
- succès de soumission plus explicite
- microcopy et résumés plus premium
- honeypot anti-spam léger (`company`) sur les formulaires :
  - recherche local
  - proposer un bien
  - contact
- page `not-found` publique dédiée


## Audits utiles

- `npm run audit:project` : imports manquants, orphelins, doublons de contenu
- `npm run audit:routes` : liens et fetch statiques cassés
- `npm run audit:client-boundaries` : imports serveur interdits dans les composants client
- `npm run audit:ts-syntax` : contrôle de syntaxe TS/TSX sans build complet
- `npm run check` : préflight + audits + typecheck

## Audit dépendances / cohérence package
- `npm run audit:deps` vérifie les imports externes réellement utilisés contre `package.json`
- les dépendances de build (`tailwindcss`, `postcss`, `autoprefixer`) ont été replacées en `devDependencies`
- `package.json` inclut maintenant `engines` et `.node-version` pour figer l’environnement Node

- Dernier sweep: suppression des derniers `any` explicites dans les écrans d'édition, correction des types client sur les formulaires `Terrain` et `Interactions`, ajout d'un audit `no-explicit-any`.
