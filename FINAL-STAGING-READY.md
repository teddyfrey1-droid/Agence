# FINAL STAGING READY

Ce ZIP est la version de référence la plus récente du projet.

Statut recommandé : **staging / préproduction ready**.

Avant une mise en production réelle, vérifier sur environnement réel :
- variables d'environnement complètes
- connexion base PostgreSQL
- build Next.js complet
- stockage objet S3/R2/compatible S3
- token Mapbox réel
- test manuel login / CRUD / uploads / formulaires publics / carte

Checklist rapide :
1. copier `.env.example` en `.env`
2. renseigner `DATABASE_URL`
3. renseigner `SESSION_SECRET` ou `NEXTAUTH_SECRET`
4. renseigner `NEXT_PUBLIC_MAPBOX_TOKEN`
5. choisir `STORAGE_DRIVER=local` ou `STORAGE_DRIVER=s3`
6. lancer `npm install`
7. lancer `npm run prisma:push` ou la stratégie Prisma choisie
8. lancer `npm run db:seed`
9. lancer `npm run check`
10. lancer `npm run dev` ou un build de staging
