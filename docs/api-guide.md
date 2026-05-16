# Documentation — API Auth & Quizz

Cette doc explique comment utiliser la couche API depuis les composants React (pages login, signup, quizz).

---

## Authentification

### Importer les actions

```tsx
import { signUp, signIn, signOut } from '@/lib/auth/actions';
```

### Page Login — Formulaire

```tsx
'use client';

import { useActionState } from 'react';
import { signIn } from '@/lib/auth/actions';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signIn, null);

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-sm mx-auto">
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Mot de passe" required />
      {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  );
}
```

### Page Signup — Formulaire

```tsx
'use client';

import { useActionState } from 'react';
import { signUp } from '@/lib/auth/actions';

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signUp, null);

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-sm mx-auto">
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Mot de passe" required />
      {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Création...' : 'Créer un compte'}
      </button>
    </form>
  );
}
```

### Déconnexion

N'importe où, bouton qui appelle `signOut()` :

```tsx
import { signOut } from '@/lib/auth/actions';

<button onClick={() => signOut()}>Déconnexion</button>
```

### Vérifier l'état de connexion côté serveur

```tsx
import { createClient } from '@/lib/supabase/server';

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <p>Vous devez être connecté.</p>;
  }

  return <p>Bienvenue {user.email}</p>;
}
```

---

## Service Quizz

### Importer les fonctions

```tsx
import { listQuizzes, getQuizById, createQuiz } from '@/lib/services/quizzes.service';
```

### Lister les quizz publiés (Server Component)

```tsx
export default async function QuizzesPage() {
  const quizzes = await listQuizzes();

  return (
    <ul>
      {quizzes.map((q) => (
        <li key={q.id}>
          <a href={`/quizzes/${q.id}`}>{q.title}</a>
          <span>{q.theme}</span>
        </li>
      ))}
    </ul>
  );
}
```

### Voir un quizz (Server Component)

```tsx
export default async function QuizPage({ params }: { params: { id: string } }) {
  const quiz = await getQuizById(params.id);

  if (!quiz) return <p>Quizz introuvable.</p>;

  return (
    <div>
      <h1>{quiz.title}</h1>
      <p>{quiz.theme} — {quiz.actual_question_count} questions</p>
    </div>
  );
}
```

### Créer un quizz (Server Action ou Server Component)

Via une Server Action dédiée ou en appelant `createQuiz` directement depuis un Server Component protégé :

```tsx
import { createClient } from '@/lib/supabase/server';
import { createQuiz } from '@/lib/services/quizzes.service';

export default async function CreateQuizPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <form action={async (formData) => {
      'use server';
      const title = formData.get('title') as string;
      const theme = formData.get('theme') as string;
      const question_count = parseInt(formData.get('question_count') as string);
      await createQuiz({ title, theme, question_count });
      redirect('/quizzes');
    }}>
      <input name="title" placeholder="Titre" required />
      <input name="theme" placeholder="Thème" required />
      <input name="question_count" type="number" min={5} max={30} required />
      <button type="submit">Créer</button>
    </form>
  );
}
```

---

## Types disponibles

```tsx
import type { Quiz, QuizWithCount, QuizStatus } from '@/lib/types';
```

| Type | Champs |
|---|---|
| `Quiz` | `id`, `creator_id`, `title`, `theme`, `question_count`, `status`, `created_at`, `updated_at` |
| `QuizWithCount` | `Quiz` + `actual_question_count` |
| `QuizStatus` | `'draft'` \| `'published'` \| `'archived'` |

---

## Routes existantes

| Route | Description |
|---|---|
| `GET /auth/callback` | Échange le code email/OAuth contre une session |

---

## Helpers Supabase côté serveur

```tsx
import { createClient } from '@/lib/supabase/server';   // Server Components / Server Actions
```

```tsx
'use client';
import { createClient } from '@/lib/supabase/client';    // Client Components (navigateur)
```
