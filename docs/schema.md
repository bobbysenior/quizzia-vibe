# Schéma de base de données — App Quizz

## Vue d'ensemble

Le projet utilise **Supabase** (PostgreSQL 15) avec authentification intégrée. Les utilisateurs sont gérés par `auth.users` (table Supabase interne). Les tables applicatives sont dans le schéma `public`.

## Diagramme des relations

```
auth.users (Supabase)
    │
    └──1:N── quizzes (créés par)
    │
    └──1:N── quiz_attempts (tentatives)

quizzes
    │
    └──1:N── questions
                │
                └──1:N── choices

quiz_attempts
    │
    └──1:N── user_answers
                │
                └──N:1── choices (réponse sélectionnée)
```

---

## Tables

### 1. `quizzes`

Stocke les quizz créés par les utilisateurs. Un quizz peut être en brouillon, publié ou archivé.

| Colonne        | Type                     | Contrainte              | Description                                   | US          |
|----------------|--------------------------|-------------------------|-----------------------------------------------|-------------|
| `id`           | `uuid`                   | PK, DEFAULT gen_random_uuid() | Identifiant unique                      | —           |
| `creator_id`   | `uuid`                   | NOT NULL, FK → auth.users(id) | Créateur du quizz                       | US-07       |
| `title`        | `text`                   | NOT NULL                | Titre du quizz                                | US-02       |
| `theme`        | `text`                   | NOT NULL                | Thème ou sujet                                | US-02, US-07|
| `question_count`| `integer`               | NOT NULL, CHECK (5..30) | Nombre de questions souhaité                  | US-08       |
| `status`       | `text`                   | NOT NULL, DEFAULT 'draft', CHECK (draft, published, archived) | État du quizz | US-11, US-12 |
| `created_at`   | `timestamptz`            | NOT NULL, DEFAULT now() | Date de création                              | —           |
| `updated_at`   | `timestamptz`            | NOT NULL, DEFAULT now() | Date de dernière modification                 | —           |

**Index :**
- `idx_quizzes_creator_id` sur `creator_id`
- `idx_quizzes_status` sur `status` WHERE `status = 'published'` (index partiel pour US-01)

**RLS :**
- `SELECT` : tout le monde peut voir les quizz publiés (`status = 'published'`) — US-01, US-02
- `SELECT` : le créateur peut voir tous ses quizz quel que soit le statut — US-12, US-13, US-15, US-16
- `INSERT` : utilisateur authentifié uniquement — US-07, US-08, US-09
- `UPDATE` : le créateur uniquement — US-10, US-11, US-12
- `DELETE` : le créateur uniquement — US-13

---

### 2. `questions`

Questions d'un quizz, générées par l'IA. Chaque question appartient à un quizz.

| Colonne        | Type                     | Contrainte              | Description                                   | US          |
|----------------|--------------------------|-------------------------|-----------------------------------------------|-------------|
| `id`           | `uuid`                   | PK, DEFAULT gen_random_uuid() | Identifiant unique                      | —           |
| `quiz_id`      | `uuid`                   | NOT NULL, FK → quizzes(id) ON DELETE CASCADE | Quizz parent           | —           |
| `question_text`| `text`                   | NOT NULL                | Texte de la question                          | US-03, US-09|
| `order_index`  | `integer`                | NOT NULL, DEFAULT 0     | Ordre dans le quizz                           | US-03       |
| `created_at`   | `timestamptz`            | NOT NULL, DEFAULT now() | Date de création                              | —           |

**Index :**
- `idx_questions_quiz_id` sur `quiz_id`

**RLS :**
- `SELECT` : même visibilité que le quizz parent (public → publié ; ou créateur)
- `INSERT / UPDATE / DELETE` : créateur du quizz parent uniquement — US-09, US-10

---

### 3. `choices`

Choix de réponse pour chaque question. Une seule réponse est correcte par question.

| Colonne        | Type                     | Contrainte              | Description                                   | US          |
|----------------|--------------------------|-------------------------|-----------------------------------------------|-------------|
| `id`           | `uuid`                   | PK, DEFAULT gen_random_uuid() | Identifiant unique                      | —           |
| `question_id`  | `uuid`                   | NOT NULL, FK → questions(id) ON DELETE CASCADE | Question parent       | —           |
| `choice_text`  | `text`                   | NOT NULL                | Texte du choix                                | US-03, US-09|
| `is_correct`   | `boolean`                | NOT NULL, DEFAULT false | Vrai si c'est la bonne réponse                | US-09       |
| `order_index`  | `integer`                | NOT NULL, DEFAULT 0     | Ordre d'affichage                             | —           |

**Index :**
- `idx_choices_question_id` sur `question_id`

**Contrainte métier :** Une seule réponse correcte par question (gérée au niveau applicatif ou par trigger).

**RLS :**
- `SELECT` : même visibilité que le quizz parent (mais `is_correct` masqué pour les utilisateurs non créateurs pendant une tentative)
- `INSERT / UPDATE / DELETE` : créateur du quizz parent uniquement

---

### 4. `quiz_attempts`

Tentative d'un utilisateur (connecté ou anonyme) sur un quizz. Une tentative est créée au début du quizz et mise à jour à la fin avec le score.

| Colonne        | Type                     | Contrainte              | Description                                   | US          |
|----------------|--------------------------|-------------------------|-----------------------------------------------|-------------|
| `id`           | `uuid`                   | PK, DEFAULT gen_random_uuid() | Identifiant unique                      | —           |
| `user_id`      | `uuid`                   | NULLABLE, FK → auth.users(id) | Utilisateur (NULL si anonyme)            | US-05       |
| `quiz_id`      | `uuid`                   | NOT NULL, FK → quizzes(id) | Quizz tenté                                  | US-03       |
| `status`       | `text`                   | NOT NULL, DEFAULT 'in_progress', CHECK (in_progress, completed) | État | —    |
| `score`        | `integer`                | NULLABLE                | Nombre de bonnes réponses (rempli à la fin)   | US-04       |
| `total_questions`| `integer`              | NOT NULL                | Nombre total de questions dans le quizz       | US-04       |
| `started_at`   | `timestamptz`            | NOT NULL, DEFAULT now() | Début de la tentative                         | —           |
| `completed_at` | `timestamptz`            | NULLABLE                | Fin de la tentative (quand score est calculé) | US-04       |

**Index :**
- `idx_attempts_user_id` sur `user_id`
- `idx_attempts_quiz_id` sur `quiz_id`

**RLS :**
- `SELECT` : l'utilisateur propriétaire de la tentative voit ses propres tentatives — US-14, US-17, US-18
- `INSERT` : tout le monde (y compris anonyme) peut créer une tentative sur un quizz publié — US-03
- `UPDATE` : l'utilisateur propriétaire uniquement (mise à jour du score)

---

### 5. `user_answers`

Réponses individuelles données par l'utilisateur pendant une tentative. Une ligne par question répondue.

| Colonne        | Type                     | Contrainte              | Description                                   | US          |
|----------------|--------------------------|-------------------------|-----------------------------------------------|-------------|
| `id`           | `uuid`                   | PK, DEFAULT gen_random_uuid() | Identifiant unique                      | —           |
| `attempt_id`   | `uuid`                   | NOT NULL, FK → quiz_attempts(id) ON DELETE CASCADE | Tentative parent    | —           |
| `question_id`  | `uuid`                   | NOT NULL, FK → questions(id) | Question répondue                         | US-03       |
| `selected_choice_id`| `uuid`              | NOT NULL, FK → choices(id) | Réponse choisie                            | US-03       |
| `is_correct`   | `boolean`                | NOT NULL                | Si la réponse est correcte                    | US-04       |
| `answered_at`  | `timestamptz`            | NOT NULL, DEFAULT now() | Horodatage de la réponse                      | —           |

**Index :**
- `idx_user_answers_attempt_id` sur `attempt_id`
- `uq_user_answers_attempt_question` UNIQUE sur `(attempt_id, question_id)` (une seule réponse par question par tentative)

**RLS :**
- `SELECT` : propriétaire de la tentative parent
- `INSERT` : propriétaire de la tentative parent (ou anonyme pendant la tentative)
- Pas d'UPDATE ni DELETE (réponse figée une fois donnée)

---

## Récapitulatif par User Story

| US | Description | Tables impliquées | Requête type |
|----|-------------|-------------------|--------------|
| US-01 | Liste des quizz disponibles | `quizzes` | `SELECT * FROM quizzes WHERE status = 'published'` |
| US-02 | Voir infos d'un quizz | `quizzes`, `questions` | `SELECT q.*, COUNT(qu.id) FROM quizzes q LEFT JOIN questions qu ON q.id = qu.quiz_id WHERE q.id = $1` |
| US-03 | Répondre question par question | `questions`, `choices`, `user_answers`, `quiz_attempts` | INSERT dans `quiz_attempts` puis `user_answers` |
| US-04 | Voir score final | `quiz_attempts`, `user_answers` | Mettre à jour `quiz_attempts.score`, `quiz_attempts.completed_at` |
| US-05 | Créer un compte | `auth.users` (Supabase) | `supabase.auth.signUp()` |
| US-06 | Se connecter | `auth.users` (Supabase) | `supabase.auth.signInWithPassword()` |
| US-07 | Créer un quizz | `quizzes` | `INSERT INTO quizzes (creator_id, title, theme, status) VALUES (...)` |
| US-08 | Choisir nombre de questions | `quizzes` | `UPDATE quizzes SET question_count = $1 WHERE id = $2` |
| US-09 | IA génère questions | `questions`, `choices` | INSERT multiple dans `questions` et `choices` |
| US-10 | Modifier avant publication | `questions`, `choices` | UPDATE sur `questions` et `choices` |
| US-11 | Publier un quizz | `quizzes` | `UPDATE quizzes SET status = 'published' WHERE id = $1` |
| US-12 | Archiver un quizz | `quizzes` | `UPDATE quizzes SET status = 'archived' WHERE id = $1` |
| US-13 | Supprimer un quizz | `quizzes` | `DELETE FROM quizzes WHERE id = $1` (CASCADE) |
| US-14 | Nombre de quizz complétés | `quiz_attempts` | `SELECT COUNT(*) FROM quiz_attempts WHERE user_id = $1 AND status = 'completed'` |
| US-15 | Nombre de quizz créés | `quizzes` | `SELECT COUNT(*) FROM quizzes WHERE creator_id = $1` |
| US-16 | Nombre de quizz archivés | `quizzes` | `SELECT COUNT(*) FROM quizzes WHERE creator_id = $1 AND status = 'archived'` |
| US-17 | Score moyen | `quiz_attempts` | `SELECT AVG(score::float / total_questions * 100) FROM quiz_attempts WHERE user_id = $1 AND status = 'completed'` |
| US-18 | Historique des quizz passés | `quiz_attempts`, `quizzes` | `SELECT qa.*, q.title FROM quiz_attempts qa JOIN quizzes q ON qa.quiz_id = q.id WHERE qa.user_id = $1 AND qa.status = 'completed' ORDER BY qa.completed_at DESC` |
| US-19 | Déconnexion | `auth.users` (Supabase) | `supabase.auth.signOut()` |

---

## Remarques

- **Anonymes vs connectés :** `quiz_attempts.user_id` est nullable pour permettre les tentatives anonymes (US-01 à US-04). Le dashboard (US-14 à US-18) ne comptabilise que les tentatives avec `user_id` non nul.
- **Cascade :** La suppression d'un quizz (US-13) supprime en cascade questions, choices, et tentative/answers associées.
- **Index partiel sur `status`** : accélère US-01 (liste des quizz publiés) sans alourdir les écritures sur les brouillons.
- **Génération IA (US-09)** : traitée au niveau applicatif — le schéma stocke simplement les questions et choices générées.
