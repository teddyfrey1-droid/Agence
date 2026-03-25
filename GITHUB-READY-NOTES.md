# GitHub-ready notes

Cette version est préparée pour être déposée telle quelle à la racine d’un dépôt GitHub.

Structure attendue à la racine :
- `app/`
- `components/`
- `lib/`
- `modules/`
- `prisma/`
- `scripts/`
- `public/`
- `middleware.ts`
- `package.json`
- `tsconfig.json`

Correctifs inclus :
- alias TypeScript `@/*` compatible racine (`./*`) et ancien mode `src/`
- correction Zod sur les schémas publics (`z.string().email(...)`)
- `@types/bcryptjs` ajouté
- `next.config.mjs` mis à jour (`typedRoutes`)

Avant déploiement Vercel :
1. pousser tout le contenu du projet, pas seulement quelques dossiers
2. configurer les variables d’environnement
3. lancer un déploiement sans cache
