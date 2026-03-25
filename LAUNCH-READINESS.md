# Launch readiness

## État actuel
Le projet est une **base V1 sérieuse**, mais pas encore au niveau “déploiement public final” sans dernier nettoyage.

## Déjà en place
- Carte Mapbox branchée (token requis côté environnement)
- Auth simple par cookie
- Backoffice structuré
- Modules :
  - Biens
  - Demandes
  - Contacts
  - Terrain
  - Dossiers
  - Tâches
  - Interactions
  - Matching V1
- Site public V1
- Schéma Prisma + seed
- UI premium cohérente

## À finaliser avant lancement public propre
### Critique
- brancher une vraie auth robuste (session + sécurité renforcée)
- vérifier toutes les pages `edit` et toutes les mutations
- valider tous les flux publics de bout en bout
- tester chaque route API avec vraie base distante

### Important
- configurer et tester le mode stockage objet S3-compatible en environnement distant (le code est prêt, reste la recette sur vrai bucket)
- compléter la gestion fichiers/documents (suppression, réordonnancement, cover, permissions fines)
- finaliser Performance
- améliorer les empty states et loading states
- renforcer la gestion des doublons contacts

### Pré-prod
- `.env` production
- base PostgreSQL hébergée
- déploiement Vercel
- données de démonstration
- tests manuels complets

## Quand je considérerai le projet “prêt à lancer”
Quand les points suivants seront validés :
1. build Next.js propre
2. migrations Prisma propres
3. auth stable
4. flux public → backoffice testés
5. édition complète sur tous les modules
6. Carte branchée
7. médias branchés
8. tests manuels desktop + mobile terrain


## Audit de nettoyage
- voir `CLEANUP-AUDIT.md` pour le dernier passage sur les doublons, fichiers orphelins et erreurs de syntaxe évidentes.

- Session: cookie signé en place (version simple mais plus sûre que le stockage brut de l'ID utilisateur).


## Stockage
Le code de stockage sait maintenant :
- fonctionner en **local** pour le développement
- fonctionner en **S3-compatible** pour la préproduction / production

Ce point n'est plus un bloc de développement, mais un bloc de **configuration + recette**.

## Flows publics
- Dé-duplication des leads entrants par email/téléphone
- Création automatique d'une interaction et d'une tâche de suivi sur les formulaires publics


## Dernier passage runtime / UX
- Renforcement du scoping `agencyId` sur les repositories critiques (`properties`, `search requests`, `contacts`, `field spottings`, `deals`).
- Ajout de `loading.tsx`, `error.tsx` et `not-found.tsx` sur le dashboard pour fiabiliser les flows en cas d'erreur serveur.
- Ajout de `loading.tsx` et `error.tsx` côté public pour éviter les pages blanches et améliorer la perception produit.
- Suppression de `tsconfig.tsbuildinfo` du ZIP distribué.

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


### Qualité publique déjà renforcée
- validations partagées front/back sur les 3 formulaires publics
- success/error states plus propres
- honeypot anti-spam léger côté formulaires et routes
- page `not-found` publique dédiée


## Vérifications statiques supplémentaires

Avant un vrai go, exécuter aussi :

```bash
npm run audit:ts-syntax
npm run audit:client-boundaries
```

Ces scripts permettent de sécuriser le projet même avant un build complet, notamment sur les composants client et les erreurs de syntaxe TS/TSX.

### Cohérence package / build
- `package.json` nettoyé avec séparation plus saine entre `dependencies` et `devDependencies`
- `audit:deps` ajouté pour vérifier les imports externes et les oublis de dépendances
- `engines` Node/NPM ajoutés + `.node-version`

- Dernier sweep: suppression des derniers `any` explicites dans les écrans d'édition, correction des types client sur les formulaires `Terrain` et `Interactions`, ajout d'un audit `no-explicit-any`.
