import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserQuizzes } from '@/lib/services/quizzes.service';
import { QuizListClient } from './quiz-list-client';

export default async function MyQuizzesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const quizzes = await getUserQuizzes();

  return (
    <main className="py-12 px-8 max-w-[1200px] mx-auto max-sm:py-8 max-sm:px-5">
      <div className="mb-10">
        <div className="font-mono text-xs font-medium tracking-[0.06em] uppercase text-muted mb-3.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent mr-2 align-middle" />
          Gestion
        </div>
        <h1 className="text-[clamp(32px,4.4vw,48px)] font-semibold tracking-[-0.035em] leading-[1.05] mb-3">
          Mes quiz
        </h1>
        <p className="text-muted text-[17px] max-w-[560px]">
          Retrouvez tous les quiz que vous avez créés. Modifiez-les, publiez-les ou archivez-les.
        </p>
      </div>

      <QuizListClient quizzes={quizzes} />
    </main>
  );
}
