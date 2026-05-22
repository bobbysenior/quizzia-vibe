# Rapport de Fonctionnement — Quizia

## Résumé exécutif

**Quizia** est une application web permettant aux utilisateurs de **créer, partager et jouer à des quiz** sur n'importe quel thème. Son principal atout réside dans une **génération par intelligence artificielle** : il suffit à l'utilisateur de décrire un sujet pour que l'application produise automatiquement un quiz complet, avec ses questions et ses réponses. Cette approche élimine le principal frein à la création de contenu  le temps nécessaire à l'écriture manuelle  tout en offrant un contrôle éditorial total via un système de brouillon.

---

## Public cible et cas d'usage

Quizia s'adresse à :
*   **Les enseignants** souhaitant créer rapidement des exercices interactifs.
*   **Les animateurs de communautés** recherchant des formats ludiques pour animer un groupe.
*   **Les particuliers** curieux de tester leurs connaissances ou de créer des jeux entre amis.

---

## Parcours utilisateur principal

### 1. Accueil et découverte
L'utilisateur arrive sur une page d'introduction mettant en valeur l'application. Il peut parcourir les quiz déjà publiés sans avoir besoin de se connecter.

### 2. Création d'un compte (facultative)
Bien qu'il soit possible de jouer sans compte, la création de quiz nécessite une authentification. L'inscription se fait via une adresse email et un mot de passe.

### 3. Création de quiz
L'utilisateur peut choisir entre deux modes :
*   **Génération par IA** (mode par défaut) : il tape une phrase comme *"Crée-moi un quiz sur l'histoire de la musique classique avec 10 questions"*. L'IA génère le quiz en quelques secondes.
*   **Création manuelle** : l'utilisateur remplit un par un le titre, le thème et le contenu de chaque question.

Dans les deux cas, la création aboutit à un **brouillon**.

### 4. Édition et publication
Dans l'éditeur intégré, l'utilisateur peut :
*   Relire chaque question et chaque réponse proposée.
*   Corriger des fautes ou des erreurs factuelles.
*   Demander à l'IA de **relire et corriger** l'ensemble du quiz.
*   Ajouter ou supprimer des questions.
*   Choisir laquelle des propositions est la bonne réponse.

Une fois satisfait, il clique sur **Publier** : le quiz devient visible publiquement sur le catalogue.

### 4. Gestion du cycle de vie des quiz
Sur la page « Mes quiz », l'utilisateur retrouve tous ses quiz classés selon leur statut :
*   **Brouillon** : modifiable et supprimable.
*   **Publié** : visible par tous. Seul l'archivage est possible (empêche les modifications qui désorienteraient les joueurs ayant déjà passé le quiz).
*   **Archivé** : masqué du catalogue. Peut être republié ou supprimé.

### 5. Jeu et résultats
Un visiteur (connecté ou anonyme) peut :
1.  Choisir un quiz dans le catalogue ou via le bouton « Quiz aléatoire ».
2.  Répondre aux questions une par une. Après chaque réponse, il reçoit un feedback visuel (vert si juste, rouge si faux).
3.  Consulter son score à la fin et partager son résultat via un lien.

### 6. Tableau de bord personnel
Les utilisateurs authentifiés disposent d'un tableau de bord résumant :
*   Le nombre de quiz complétés.
*   Le nombre de quiz créés.
*   Le score moyen sur les quiz joués.
*   L'historique détaillé des parties avec les scores obtenus.

---

## Fonctionnalités publiques (sans compte)

| Fonctionnalité | Description |
| --------------- | ----------- |
| Catalogue | Liste publique de tous les quiz publiés. Recherche par texte et filtres par thème. |
| Détails d'un quiz | Page descriptive d'un quiz : titre, thème, nombre de questions. |
| Jouer | Passage d'un quiz question par question. Score calculé automatiquement. |
| Résultats | Affichage du score final, message adaptatif et lien de partage. |
| Quiz anonyme | Possibilité de jouer sans avoir de compte utilisateur. |
| Partage | Copie du lien de la page courante dans le presse-papiers. |

---

## Fonctionnalités réservées aux utilisateurs connectés

| Fonctionnalité | Description |
| --------------- | ----------- |
| Création de quiz | Via IA ou manuel, avec entre 5 et 30 questions. |
| Édition de brouillon | Modifier, corriger, réorganiser un quiz avant publication. |
| Publication / Archivage / Suppression | Gestion du cycle de vie complet. |
| Corriger par IA | Envoi du brouillon à l'IA pour vérification factuelle et orthographique. |
| Tableau de bord | Vue d'ensemble des statistiques personnelles. |
| Historique de parties | Tableau détaillé avec scores et dates. |

---

## Technologies utilisées et justifications

### Next.js 16 + React 19
**Pourquoi ?** L'architecture moderne du App Router de Next.js permet de tirer parti des **Server Components** par défaut. Cela signifie que les pages sont rendues côté serveur, ce qui améliore le temps de chargement initial (SEO, performances) et réduit la quantité de JavaScript envoyée au navigateur. React 19 apporte des améliorations internes sur la gestion des états et des formulaires. Ce choix garantit une évolutivité à long terme.

### TypeScript
**Pourquoi ?** TypeScript apporte un typage statique à JavaScript. Cela élimine une grande partie des bugs classiques (propriétés inexistantes, types incorrects) dès l'écriture du code, en particulier dans un contexte de données structurées comme des quiz avec leurs questions et leurs réponses. Il améliore considérablement la fiabilité et la maintenabilité du projet.

### Tailwind CSS v4
**Pourquoi ?** Tailwind permet de styliser l'interface directement dans le code des composants via des classes utilitaires pré-définies. Cela accélère considérablement le développement de maquettes, garantit une cohérence visuelle totale sur toutes les pages et évite la prolifération de fichiers CSS personnalisés. La v4 du framework apporte des performances de compilation accrues.

### Supabase (PostgreSQL + Auth)
**Pourquoi ?** Supabase offre une solution **cloud (SaaS)** open-source équivalente à Firebase. Elle fournit immédiatement une base de données relationnelle PostgreSQL, un système d'authentification sécurisé et une API REST auto-générée. L'utilisation du cloud supprime la charge de maintenance de l'infrastructure (mises à jour, sauvegardes, disponibilité) tout en conservant la souveraineté via les RLS et la possibilité de migration vers une version self-hosted si besoin.

### Cerebras Cloud SDK (Intelligence Artificielle)
**Pourquoi ?** Cerebras propose un modèle de langage (LLM) accessible via API à des coûts compétitifs. Quizia utilise ce modèle pour générer du contenu pédagogique structuré au format JSON. Le choix s'est porté sur un modèle robuste (`gpt-oss-120b`) capable de produire en français des questions factuelles avec une bonne cohérence et en respectant un schéma JSON strict.

### Zod
**Pourquoi ?** Zod est une bibliothèque de validation de schémas. Elle est utilisée pour vérifier que les données saisies dans les formulaires (email, mot de passe, nombre de questions) sont valides. Elle est également cruciale pour valider la réponse de l'IA : on s'assure que le JSON renvoyé contient bien toutes les propriétés attendues (titre, questions, choix, réponse correcte) avant de l'insérer dans la base. C'est une double sécurité côté client et serveur.

---

## Modèle économique et déploiement

Le projet est actuellement à vocation pédagogique (Hackathon). L'infrastructure repose sur Docker en local, ce qui permet un déploiement rapide sur n'importe quelle machine ou serveur sans dépendance à un cloud propriétaire.

---

## Principes de conception UX/UI

L'interface est pensée selon une philosophie inspirée des standards modernes :
*   **Cards et coins arrondis** (`22px`) : mise en page claire et aérée.
*   **Animations subtiles** : transitions sur les cartes, feedback immédiat lors des clics.
*   **Typographie lisible** : double police (Geist pour le contenu, Geist Mono pour les données techniques), tailles responsives.
*   **Couleurs sémantiques** : vert pour les actions positives (publier), orange pour l'alerte (archiver), rouge pour la suppression.
*   **Feedback visuel** : barre de progression, couleurs vives après chaque réponse, messages adaptatifs selon le score (de *"À réviser"* à *"Excellente maîtrise !"*).
*