'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Quiz } from '@/lib/types';
import { publishQuizAction, archiveQuizAction, deleteQuizAction } from '@/lib/quiz/actions';

interface Props {
  quizzes: Quiz[];
}

export function QuizListClient({ quizzes }: Props) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleAction(
    action: (id: string) => Promise<{ success?: boolean; error?: string }>,
    id: string,
    confirmation?: string
  ) {
    if (confirmation && !confirm(confirmation)) return;
    setPendingId(id);
    const res = await action(id);
    setPendingId(null);
    if (!res?.error) {
      router.refresh();
    }
  }

  const published = quizzes.filter((q) => q.status === 'published');
  const drafts = quizzes.filter((q) => q.status === 'draft');
  const archived = quizzes.filter((q) => q.status === 'archived');

  const statusConfig: Record<
    string,
    { label: string; classes: string }
  > = {
    draft: {
      label: 'Brouillon',
      classes: 'bg-bg-soft text-muted border border-line',
    },
    published: {
      label: 'Publié',
      classes: 'bg-good/10 text-good border border-good/20',
    },
    archived: {
      label: 'Archivé',
      classes: 'bg-warn/10 text-warn border border-warn/20',
    },
  };

  function QuizCard({ quiz }: { quiz: Quiz }) {
    const status = statusConfig[quiz.status] ?? statusConfig.draft;
    const isPending = pendingId === quiz.id;

    return (
      <div
        className={`bg-bg-elev border border-line-2 rounded-[22px] p-6 flex flex-col sm:flex-row sm:items-center gap-4 transition ${
          isPending ? 'opacity-60' : ''
        }`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-[17px] font-semibold tracking-[-0.02em] truncate">
              {quiz.title}
            </h3>
            <span
              className={`text-[11px] font-mono font-medium uppercase tracking-[0.04em] px-2 py-0.5 rounded-full ${status.classes}`}
            >
              {status.label}
            </span>
          </div>
          <p className="text-sm text-muted">
            {quiz.theme} · {quiz.question_count} questions
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {quiz.status !== 'published' && (
            <Link
              href={`/quizzes/${quiz.id}/edit`}
              className="text-sm px-3 py-2 rounded-full border border-line hover:border-ink hover:bg-bg-soft transition"
            >
              Modifier
            </Link>
          )}

          {quiz.status === 'draft' && (
            <button
              onClick={() => handleAction(publishQuizAction, quiz.id)}
              disabled={isPending}
              className="text-sm px-3 py-2 rounded-full bg-good/10 text-good border border-good/20 hover:bg-good/20 transition disabled:opacity-50"
            >
              Publier
            </button>
          )}

          {quiz.status === 'published' && (
            <button
              onClick={() => handleAction(archiveQuizAction, quiz.id)}
              disabled={isPending}
              className="text-sm px-3 py-2 rounded-full bg-warn/10 text-warn border border-warn/20 hover:bg-warn/20 transition disabled:opacity-50"
            >
              Archiver
            </button>
          )}

          {quiz.status === 'archived' && (
            <button
              onClick={() => handleAction(publishQuizAction, quiz.id)}
              disabled={isPending}
              className="text-sm px-3 py-2 rounded-full bg-good/10 text-good border border-good/20 hover:bg-good/20 transition disabled:opacity-50"
            >
              Republier
            </button>
          )}

          {quiz.status !== 'published' && (
            <button
              onClick={() =>
                handleAction(
                  deleteQuizAction,
                  quiz.id,
                  'Supprimer ce quiz définitivement ?'
                )
              }
              disabled={isPending}
              className="text-sm px-3 py-2 rounded-full bg-[oklch(96%_0.05_25)] text-bad border border-bad/20 hover:bg-[oklch(94%_0.06_25)] transition disabled:opacity-50"
            >
              Supprimer
            </button>
          )}
        </div>
      </div>
    );
  }

  function Section({
    title,
    iconColor,
    count,
    emptyText,
    children,
  }: {
    title: string;
    iconColor: string;
    count: number;
    emptyText: string;
    children: React.ReactNode;
  }) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2.5 mb-1">
          <span className={`w-2.5 h-2.5 rounded-full ${iconColor}`} />
          <h2 className="text-[17px] font-semibold tracking-[-0.02em]">{title}</h2>
          <span className="text-[13px] font-mono text-muted">{count}</span>
        </div>
        {count === 0 ? (
          <p className="text-sm text-muted py-4">{emptyText}</p>
        ) : (
          children
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <Section
        title="Brouillons"
        iconColor="bg-muted"
        count={drafts.length}
        emptyText="Aucun quiz en brouillon."
      >
        <div className="flex flex-col gap-3">
          {drafts.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      </Section>

      <Section
        title="Publiés"
        iconColor="bg-good"
        count={published.length}
        emptyText="Aucun quiz publié."
      >
        <div className="flex flex-col gap-3">
          {published.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      </Section>

      <Section
        title="Archivés"
        iconColor="bg-warn"
        count={archived.length}
        emptyText="Aucun quiz archivé."
      >
        <div className="flex flex-col gap-3">
          {archived.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      </Section>
    </div>
  );
}
