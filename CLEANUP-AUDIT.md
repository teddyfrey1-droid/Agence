# Audit de nettoyage V1

## Ce qui a été vérifié
- recherche de doublons de fichiers par empreinte de contenu
- vérification du graphe d'import local
- contrôle des fichiers orphelins côté `src/`
- passage de compilation TypeScript pour détecter les erreurs de syntaxe évidentes

## Résultat
- **aucun doublon de fichier** détecté dans le projet
- **un seul fichier orphelin** détecté dans `src/` : `src/lib/env.ts`
- **une erreur de syntaxe réelle** détectée et corrigée dans `src/lib/uploads.ts`

## Nettoyage appliqué
- suppression de `src/lib/env.ts` qui n'était référencé nulle part
- correction de la normalisation de chemin dans `src/lib/uploads.ts`

## Remarque
Cet audit supprime les éléments clairement inutiles ou cassés.
Il ne remplace pas encore un passage final complet de build et de lancement avec toutes les dépendances installées et l'environnement configuré.

- Deuxième passage: suppression de `tsconfig.tsbuildinfo`, ajout d'une vraie déconnexion, durcissement de la session via cookie signé, vérification des pages new/edit avec filtres `agencyId`.

- Troisième passage: branchement de la vraie carte Mapbox, remplacement du placeholder de `/app/carte`, ajout du composant client `AgencyMap`, nettoyage léger de la documentation de lancement.


## Passage stockage objet
- ajout de `src/lib/storage.ts`
- remplacement du stockage strictement local par une abstraction `local | s3`
- `src/lib/uploads.ts` allégé pour éviter les doublons de logique
- aucun fichier legacy du précédent stockage local conservé en doublon

## Passage cohérence leads entrants
- ajout de `src/lib/inbound.ts` pour centraliser la récupération de l'agence, l'utilisateur de fallback et l'upsert de contact entrant
- suppression de la création systématique de doublons de contacts sur les formulaires publics
- ajout d'une interaction automatique pour chaque lead entrant public
- ajout d'une tâche de suivi automatique pour chaque lead entrant public
- déclenchement du recalcul de matching après création d'une demande publique
- suppression d'imports inutilisés dans les routes publiques

## Vérification structurelle complémentaire
- nouveau passage par empreinte SHA-256 sur les fichiers projet : **aucun doublon de contenu détecté**
- nouveau passage sur le graphe d'import de `src/` depuis les routes/layouts/middleware : **aucun fichier source orphelin détecté**


## Runtime / UX pass complémentaire
- Contrôle des repositories critiques : correction des `findById` qui ignoraient `agencyId` sur certains domaines.
- Vérification manuelle des fichiers de détail et des routes dashboard exposées.
- Ajout de fichiers de gestion d'état (`loading`, `error`, `not-found`) pour les segments dashboard/public.
- Aucun nouveau doublon de fichier détecté pendant ce passage.

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


## Pass build/runtime supplémentaire

- suppression des imports runtime `@prisma/client` dans les composants client
- centralisation des valeurs d'énumération front dans `src/lib/client-options.ts`
- ajout de `scripts/client-boundary-audit.mjs`
- ajout de `scripts/ts-syntax-audit.mjs`
- audits relancés : project / routes / client boundaries / ts syntax / preflight

- Passage package/dependencies : ajout de `scripts/dependency-audit.mjs`, déplacement de `tailwindcss`, `postcss` et `autoprefixer` en `devDependencies`, ajout de `engines` et `.node-version`.

- Dernier sweep: suppression des derniers `any` explicites dans les écrans d'édition, correction des types client sur les formulaires `Terrain` et `Interactions`, ajout d'un audit `no-explicit-any`.
