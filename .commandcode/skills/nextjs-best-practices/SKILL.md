---
name: nextjs-best-practices
description: Next.js, TypeScript, React, UI et conventions pour ce dépôt (App Router, performance, validation).
alwaysApply: true
---

Tu es un expert en TypeScript, Node.js, Next.js App Router, React, Shadcn UI, Radix UI et Tailwind.

**Important :** Ce dépôt utilise une version Next.js avec des changements par rapport aux docs publiques classiques. Lire le guide pertinent sous `node_modules/next/dist/docs/` avant d’écrire du code et respecter les dépréciations.

## Style et structure

- Code TypeScript concis et technique, exemples corrects.
- Style fonctionnel et déclaratif ; éviter les classes.
- Préférer l’itération et la modularisation à la duplication.
- Noms explicites avec verbes auxiliaires (ex. `isLoading`, `hasError`).
- Structure des fichiers : composant exporté, sous-composants, helpers, contenu statique, types.

## Conventions de nommage

- Répertoires en minuscules avec tirets (ex. `components/auth-wizard`).
- Exports nommés pour les composants.

## TypeScript

- TypeScript partout ; préférer les `interface` aux `type` pour les objets publics.
- Éviter les enums ; préférer des maps ou const objects typés.
- Composants fonctionnels avec interfaces TypeScript.

## Syntaxe et formatage

- Mot-clé `function` pour les fonctions pures.
- Éviter les accolades inutiles sur les conditionnels simples.
- JSX déclaratif.

## UI et styling

- Shadcn UI, Radix et Tailwind pour les composants et le style.
- Design responsive, approche mobile-first.

## Performance

- Minimiser `use client`, `useEffect` et `setState` ; privilégier les React Server Components.
- Envelopper les composants client dans `Suspense` avec un fallback.
- `dynamic` pour les morceaux non critiques.
- Images : WebP quand c’est pertinent, dimensions, lazy loading.

## Conventions projet

- `nuqs` pour l’état des paramètres d’URL.
- Optimiser les Web Vitals (LCP, CLS, INP).
- Limiter `use client` : préférer le rendu serveur ; client surtout pour les APIs navigateur dans de petits composants ; éviter le client pour le data fetching lourd — déléguer à TanStack Query selon la règle dédiée `tanstack-query-rules`.

## Supabase (si utilisé dans le projet)

- Client Supabase pour la base et le temps réel.
- Supabase Auth pour l’authentification.
- État de session partagé (contexte ou hook) pour limiter les `getUser()` redondants.
- Ne jamais se fier seulement aux filtres côté client pour l’autorisation : **RLS et policies** obligatoires.
- Les filtres client (ex. `.eq('created_by', userId)`) : UX / perf ; la sécurité vient du serveur.
- Genql ou patterns équivalents pour les gros jeux de données si applicable.

## Validation et docs

- Toujours utiliser **Zod** pour la validation des données (schémas, parsing d’entrées).
- Suivre la doc Next.js officielle du **runtime installé** pour le data fetching, le rendu et le routing.

## TanStack Query

- Suivre la règle Cursor **`tanstack-query-rules`** (clés de requête, mutations, invalidation, cache).
