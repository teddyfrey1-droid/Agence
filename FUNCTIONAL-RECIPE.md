# Functional recipe sweep

Date: 2026-03-25

## Scope checked
- dashboard routes and detail pages
- public pages and inbound forms
- static links (`href`) and API calls (`fetch`)
- structural audit (imports, orphans, duplicate content)

## Results
- project audit: clean
- route audit: clean
- no broken static page links found
- no broken static API calls found

## Fixes applied in this pass
- dashboard `terrain/new` page now enforces `requireUser()` server-side for consistency with the other protected pages
- added `scripts/route-audit.mjs`
- added `npm run audit:routes`
- strengthened `npm run check` so it includes route validation

## Remaining items before final launch sign-off
- full install/build verification in a real environment (`npm install`, `prisma generate`, `prisma db push`, `next build`)
- bucket-backed media/documents validation with real credentials
- manual end-to-end test of critical flows:
  - login / logout
  - create / edit property
  - create / edit contact
  - create / edit search request
  - create / edit deal
  - create / edit task
  - create / edit interaction
  - create / convert field spotting
  - public search request form
  - public property submission form
  - public contact form
  - map markers and detail links

## Current status
The codebase is cleaner and safer than before, but this pass is still a **recipe/audit pass**, not a final production sign-off.

## Dernier passage build/runtime
- ajout d'un script `npm run preflight`
- support `SESSION_SECRET` en plus de `NEXTAUTH_SECRET`
- ajout de `GET /api/health` pour vérifier base/config rapidement
- ajout de `.nvmrc` (Node 22)


## Public flow quality pass
- added shared Zod validation for public inbound forms
- added lightweight honeypot support on public routes
- improved public success/error UX and form framing
- added dedicated public `not-found` page


## Contrôles statiques complémentaires

- `audit:ts-syntax` : 0 erreur de syntaxe
- `audit:client-boundaries` : 0 import serveur interdit dans les composants client

## Additional consistency pass
- dependency/package audit added (`npm run audit:deps`)
- Node version pinned with `.nvmrc` and `.node-version`
- build tooling packages moved to `devDependencies`

- Dernier sweep: suppression des derniers `any` explicites dans les écrans d'édition, correction des types client sur les formulaires `Terrain` et `Interactions`, ajout d'un audit `no-explicit-any`.
