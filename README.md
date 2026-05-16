# Quizz App

Application de quizz générés par IA. Créez, partagez et répondez à des quizz sur n'importe quel thème.

## Stack

- **Frontend** : Next.js 16, TypeScript, Tailwind CSS v4
- **Backend** : Supabase (PostgreSQL 15, Auth, REST API)
- **Infra** : Docker (Supabase self-hosted)

## Prérequis

- [Docker](https://docs.docker.com/get-docker/) et Docker Compose
- [Node.js](https://nodejs.org/) ≥ 20

## Installation

```bash
# 1. Cloner le projet
git clone <repo-url>
cd tp1_quizz

# 2. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env pour définir des secrets forts (POSTGRES_PASSWORD, JWT_SECRET, etc.)
# Générer des clés : ./utils/generate-keys.sh

# 3. Démarrer Supabase (base de données, auth, API)
docker compose up -d
# Attendre que tous les conteneurs soient healthy (~30s)

# 4. Appliquer la migration initiale
# La migration est dans supabase/migrations/
# Via Supabase CLI :
supabase db push --local
# Ou manuellement via le Studio : http://localhost:8000 > SQL Editor

# 5. Installer les dépendances frontend
npm install

# 6. Remplir la base de données (données de démo)
npm run seed

# 7. Démarrer l'application
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

## Comptes de démo

| Email | Mot de passe |
|---|---|
| `demo@quizz.app` | `demo123456` |

## Commandes

| Commande | Description |
|---|---|
| `npm run dev` | Lancer le serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Démarrer en production |
| `npm run seed` | Remplir la base avec des données fictives |
| `npm run lint` | Vérifier le code avec ESLint |

## Services

| Service | URL |
|---|---|
| App Next.js | http://localhost:3000 |
| Supabase Studio | http://localhost:8000 |
| Supabase API | http://localhost:8000 |

## Structure

```
├── src/
│   ├── app/              # Pages et routes Next.js (App Router)
│   │   └── auth/         # Callback OAuth/email
│   ├── lib/
│   │   ├── auth/         # Server Actions (signUp, signIn, signOut)
│   │   ├── services/     # Couche métier (quizzes.service)
│   │   └── supabase/     # Clients Supabase (navigateur, serveur, proxy)
│   └── proxy.ts          # Session refresh
├── supabase/
│   └── migrations/       # Migrations SQL
├── scripts/
│   └── seed.mjs          # Script de seeding
├── docs/                 # Documentation
└── PR/                   # Pull requests
```

## Documentation

- [Guide API Auth & Quizz](docs/api-guide.md) — pour les développeurs frontend
- [Schéma de base de données](docs/schema.md)
- [Backlog (User Stories)](backlog.md)
