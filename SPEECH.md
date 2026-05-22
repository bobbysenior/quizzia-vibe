# Speech — Présentation Quizia (Brède-chouchou)

Durée totale : 16 min (8 + 8). Démo live dans la 1ère partie, slides/explications dans la 2ème.

---

## Partie 1 — Produit (8 min)

**But** : montrer ce que l'app permet de faire, en direct. Pas de slides théoriques.

### Pitch d'ouverture (30 s)
- Quizia = créer des quiz en 30 secondes au lieu d'une heure.
- Cibles : profs, formateurs, animateurs.
- "Vous décrivez un sujet, l'IA compose, vous gardez la main."

### Démo live (6 min)

1. **Page d'accueil** (30 s)
   - Catalogue de quiz publiés, jouables sans compte.
   - Joue un quiz en mode anonyme → afficher le score à la fin.

2. **Création de compte** (1 min)
   - Signup en 2 champs, autoconfirm en dev.
   - Redirection vers le dashboard.

3. **Génération par IA** (2 min) — le clou du spectacle
   - Page "Nouveau quiz" → décrire un sujet ("Capitales européennes, 5 questions").
   - Bouton Générer → spinner → l'éditeur s'ouvre avec un quiz pré-rempli.
   - Montrer le titre, le thème, les questions, les choix, la bonne réponse mise en évidence.

4. **Édition manuelle + ✨ Corriger** (1 min 30)
   - Volontairement glisser une faute ou une mauvaise bonne réponse.
   - Cliquer ✨ Corriger → le LLM relit, corrige typo + factualité, remet la bonne réponse au bon endroit.
   - "Le LLM se relit lui-même."

5. **Publication + jeu** (1 min)
   - Passer le quiz en `published`.
   - Le partager (URL), ouvrir en navigation privée → un anonyme peut jouer.
   - Revenir sur le dashboard du créateur → la tentative apparaît dans les stats.

### Différenciation & valeur (1 min 30)
- **Vitesse** : 30 s vs 1 h à la main.
- **Contrôle** : l'humain valide chaque question — pas de boîte noire.
- **Accessibilité** : jouable sans compte → maximise la diffusion.
- **Mesure** : stats temps réel, score moyen, tentatives.

---

## Partie 2 — Technique (8 min)

**But** : prouver qu'on maîtrise les briques. Aller du concret (notre code) au théorique.

### Stack en une phrase (30 s)
- Frontend : Next.js 16 (App Router, Server Components, Server Actions).
- Backend : Supabase (Postgres + Auth + RLS) en self-host Docker, prod sur Supabase Cloud.
- IA : Cerebras (gpt-oss-120b) pour génération + correction.
- Tâches async : Trigger.dev pour découpler la génération longue de la requête HTTP.

### Qu'est-ce que Supabase ? (1 min)
- Backend-as-a-Service open-source, alternative à Firebase.
- Stack : Postgres + GoTrue (auth) + PostgREST (API auto-générée depuis le schéma) + Realtime + Storage.
- **Pourquoi Supabase ?**
  - Postgres "vrai" → on garde nos SQL, nos migrations, nos jointures.
  - Auth livrée prête à l'emploi (email, OAuth, magic link).
  - Self-hostable → pas de vendor lock-in.
  - SDK JS officiel avec types TypeScript générés depuis le schéma.

### Auth — comment on l'a mise en place (1 min 30)
- Sign up / sign in : **Server Actions** Next.js (`src/lib/auth/actions.ts`) qui appellent `supabase.auth.signUp` / `signInWithPassword`.
- Validation côté serveur avec Zod.
- Stockage de session : **cookies HTTP-only** signés par Supabase (via `@supabase/ssr`).
- Récupération de l'utilisateur côté serveur : `supabase.auth.getUser()` lit le cookie → renvoie le user (ou null).
- Pas de bearer token côté client : les Server Actions et routes API authentifient via cookie.

### Middleware — c'est quoi, pourquoi ? (1 min 30)
- **Définition** : code qui s'exécute entre la requête HTTP et le handler de la route. Idéal pour : auth, logs, redirections, headers.
- **Le nôtre** : `src/proxy.ts` (équivalent Next 16 du `middleware.ts`).
  - À chaque requête, il appelle `updateSession()` qui :
    1. Lit le cookie de session.
    2. Vérifie/rafraîchit le token Supabase (les access tokens expirent en 1h).
    3. Réécrit le cookie côté réponse.
- **Pourquoi** : sans ça, l'utilisateur serait déconnecté toutes les heures. Le middleware le maintient connecté en silence.
- Matcher exclut les assets statiques pour ne pas pénaliser les perfs.

### RLS — c'est quoi, pourquoi ? (2 min)
- **RLS = Row-Level Security**. Politique de sécurité **au niveau de la ligne**, directement dans Postgres.
- Chaque table sensible : `ENABLE ROW LEVEL SECURITY` → toutes les requêtes sont **refusées par défaut**.
- On déclare ensuite des **policies** (SQL) qui définissent qui peut faire quoi.

**Exemple concret** (montrer ce code) :
```sql
CREATE POLICY "quizzes_select_published" ON public.quizzes
  FOR SELECT USING (status = 'published');

CREATE POLICY "quizzes_update_own" ON public.quizzes
  FOR UPDATE USING (auth.uid() = creator_id);
```
- N'importe qui peut **lire** les quiz publiés.
- Seul le créateur peut **modifier** son quiz.
- `auth.uid()` est injecté par Supabase à partir du JWT dans le cookie.

**Pourquoi c'est puissant** :
- La sécurité est **dans la base**, pas dans le code applicatif → impossible de la bypasser depuis le frontend.
- Même si quelqu'un vole notre clé anonyme publique, il ne peut rien faire que la policy n'autorise.
- On peut exposer directement Postgres au web via PostgREST sans risque.

**Notre cas particulier** : joueurs anonymes.
- L'insertion d'une tentative est ouverte si le quiz est `published`.
- L'UUID de la tentative tient lieu de jeton de session pour rejouer / soumettre des réponses.
- Migration dédiée pour permettre `SELECT/UPDATE` sur `user_id IS NULL`.

### Bonus — Trigger.dev (30 s)
- La génération IA peut prendre 10-30 s → mauvais en HTTP synchrone.
- Trigger.dev externalise la tâche, l'utilisateur a un retour immédiat, le worker écrit en BDD quand c'est prêt.

---

## Notes de présentation

- **Toujours** parler en montrant l'écran (démo > slides).
- Avoir un quiz publié prêt à l'avance pour la démo anonyme.
- Avoir un prompt "qui marche bien" préparé (ex. capitales européennes, événements scientifiques).
- Garder une fenêtre Supabase Studio ouverte pour montrer le schéma SQL et les policies en live.
- Si question piège sur la sécu : "on a RLS + cookies HTTP-only + service-role key jamais exposée au frontend".
