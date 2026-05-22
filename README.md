# Quizia — Quiz générés par IA

Application de quiz générés par intelligence artificielle. Créez, partagez et répondez à des quiz sur n'importe quel thème, en quelques secondes.

---

## Stack

| Couche | Technologie |
|--------|-------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| **Backend** | Supabase (PostgreSQL 15, Auth, REST API) |
| **IA** | Cerebras Cloud SDK (génération de questions) |
| **Infra** | Docker (Supabase self-hosted) |

---

## Prérequis

- [Node.js](https://nodejs.org/) ≥ 20
- Optionnel : [Supabase CLI](https://supabase.com/docs/guides/cli)

---

## Installation

```bash
# 1. Cloner le projet
git clone <repo-url>
cd tp1_quizz

# 2. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env pour définir des secrets forts (POSTGRES_PASSWORD, JWT_SECRET, etc.)

Générer des clés : 
./utils/generate-keys.sh

# 5. Installer les dépendances frontend
npm install

# 6. Remplir la base avec des données de démonstration
npm run seed

# 7. Démarrer l'application
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

---

## Comptes de démo

| Email | Mot de passe |
|---|---|
| `demo@quizz.app` | `demo123456` |

---

## Commandes

| Commande | Description |
|---|---|
| `npm run dev` | Lancer le serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Démarrer en production |
| `npm run seed` | Remplir la base avec des données fictives |
| `npm run lint` | Vérifier le code avec ESLint |

---

## Services

| Service | URL |
|---|---|
| App Next.js | http://localhost:3000 |
| Supabase Studio | http://localhost:8000 |
| Supabase API | http://localhost:8000 |

---

## Routes principales

| Route | Description | Accès |
|---|---|---|
| `/` | Page d'accueil — hero + catalogue public | Tous |
| `/quizzes` | **Catalogue** — liste des quiz publiés avec recherche et filtres | Tous |
| `/quizzes/[id]` | Détail d'un quiz — informations + bouton "Commencer" | Tous |
| `/quizzes/[id]/play` | Jouer au quiz — question par question | Tous |
| `/quizzes/[id]/results` | Résultats — score, message + bouton partager | Tous |
| `/quizzes/new` | **Créer un quiz** — IA (défaut) ou manuel | Connecté |
| `/quizzes/[id]/edit` | **Éditer un quiz** — modifier questions/réponses | Connecté (créateur) |
| `/dashboard` | **Tableau de bord** — stats, historique, résumé mes quiz | Connecté |
| `/my-quizzes` | **Mes quiz** — gestion complète (brouillons, publiés, archivés) | Connecté |
| `/login` | Connexion / Inscription | Non connecté |
| `/mentions-legales` | Mentions légales | Tous |

---

## Fonctionnalités

### Création de quiz
- **Par IA** (mode par défaut) — décrivez un sujet, l'IA génère automatiquement les questions et réponses
- **Manuel** — créez votre quiz question par question
- Nombre de questions : **5 à 30** (sélecteur déroulant)
- Édition avant publication — relisez et modifiez chaque question

### Gestion des quiz (Mes quiz)
- **Brouillons** — modifier, publier, supprimer
- **Publiés** — uniquement archiver (pas de modification ni suppression)
- **Archivés** — republier ou supprimer

### Catalogue
- **Recherche texte** — par titre ou thème
- **Filtres thème** — multi-sélection, badges cliquables
- **Quiz aléatoire** — lancer un quiz au hasard

### Jeu
- Questions une par une, sans limite de temps
- Score affiché à la fin avec message personnalisé
- Bouton **Partager** — copie le lien du quiz dans le presse-papiers

### Authentification
- Inscription / connexion par email
- Déconnexion depuis la navigation
- Redirection automatique vers le tableau de bord après connexion

---

## Structure

```
├── src/
│   ├── app/                    # Routes Next.js (App Router)
│   │   ├── page.tsx            # Accueil (landing page)
│   │   ├── layout.tsx          # Layout global + nav + footer
│   │   ├── login/              # Connexion / Inscription
│   │   ├── dashboard/          # Tableau de bord (stats, historique)
│   │   ├── my-quizzes/         # Gestion des quiz créés
│   │   ├── mentions-legales/   # Mentions légales
│   │   ├── quizzes/
│   │   │   ├── page.tsx        # Catalogue public (avec filtres)
│   │   │   ├── [id]/           # Détail + jeu + résultats
│   │   │   └── new/            # Création (IA ou manuel)
│   │   └── api/
│   │       └── quizzes/generate/  # Route API Cerebras
│   ├── components/
│   │   ├── nav.tsx             # Navigation principale
│   │   └── share-button.tsx    # Bouton partager (clipboard)
│   ├── lib/
│   │   ├── ai/                 # SDK Cerebras + génération
│   │   ├── auth/actions.ts     # Server Actions auth
│   │   ├── quiz/actions.ts     # Server Actions quiz
│   │   ├── services/           # Couche métier (CRUD)
│   │   └── supabase/           # Clients Supabase
│   └── proxy.ts                # Middleware session
├── supabase/
│   └── migrations/             # Migrations SQL
├── PR/                         # Pull requests (historique)
├── docs/                       # Documentation projet
└── scripts/                    # Seed + tests
```

---

## Documentation

- [Guide API Auth & Quizz](docs/api-guide.md) — pour les développeurs
- [Schéma de base de données](docs/schema.md) — tables, RLS, relations
- [Backlog/User Stories](docs/backlog.md) — spécifications fonctionnelles

---

## Licence

Projet pédagogique — Hackathon edition.
