'use client';

import { useActionState } from 'react';
import { createQuizAction } from '@/lib/quiz/actions';

const initialState = { error: '', fieldErrors: undefined as Record<string, string[]> | undefined };

export function ManualForm() {
  const [state, formAction, pending] = useActionState(createQuizAction, initialState);

  return (
    <div className="bg-bg-elev border border-line-2 rounded-[22px] p-8 max-w-[680px]">
      <form action={formAction} className="flex flex-col gap-[18px]">
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="text-[13px] font-medium text-ink-2">
            Titre du quiz *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Ex : Les grandes découvertes scientifiques"
            className="bg-bg-elev border border-line rounded-xl py-3.5 px-4 text-base outline-none focus:border-ink focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] transition w-full"
          />
          {state.fieldErrors?.title && (
            <p className="text-sm text-bad">{state.fieldErrors.title[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="theme" className="text-[13px] font-medium text-ink-2">
            Thème *
          </label>
          <input
            id="theme"
            name="theme"
            type="text"
            placeholder="Ex : Sciences, Histoire, Géographie…"
            className="bg-bg-elev border border-line rounded-xl py-3.5 px-4 text-base outline-none focus:border-ink focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] transition w-full"
          />
          {state.fieldErrors?.theme && (
            <p className="text-sm text-bad">{state.fieldErrors.theme[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="question_count" className="text-[13px] font-medium text-ink-2">
            Nombre de questions *
          </label>
          <input
            id="question_count"
            name="question_count"
            type="number"
            min={5}
            max={30}
            placeholder="Entre 5 et 30"
            className="bg-bg-elev border border-line rounded-xl py-3.5 px-4 text-base outline-none focus:border-ink focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] transition w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          {state.fieldErrors?.question_count && (
            <p className="text-sm text-bad">{state.fieldErrors.question_count[0]}</p>
          )}
        </div>

        {state.error && !state.fieldErrors && (
          <div className="bg-[oklch(96%_0.05_25)] border border-bad/20 rounded-xl px-4 py-3">
            <p className="text-sm text-bad">{state.error}</p>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-ink text-white text-base font-medium hover:-translate-y-px hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending ? 'Création…' : 'Créer le quiz'}
            <span className="font-normal">→</span>
          </button>
        </div>
      </form>
    </div>
  );
}
