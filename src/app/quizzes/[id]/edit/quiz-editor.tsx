'use client';

import { useState, useActionState } from 'react';
import type { Quiz } from '@/lib/types';
import type { QuizQuestionWithChoices } from '@/lib/services/quizzes.service';
import {
  updateQuizTitle,
  saveQuestionAction,
  deleteQuestionAction,
  saveChoiceAction,
  deleteChoiceAction,
  setCorrectChoiceAction,
} from '@/lib/quiz/actions';
import Link from 'next/link';

interface Props {
  quiz: Quiz;
  questions: QuizQuestionWithChoices[];
}

export function QuizEditor({ quiz, questions: initialQuestions }: Props) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [titleState, titleAction] = useActionState(
    updateQuizTitle.bind(null, quiz.id),
    null
  );

  const addQuestion = () => {
    const maxOrder = questions.reduce((m, q) => Math.max(m, q.order_index), 0);
    setQuestions((prev) => [
      ...prev,
      {
        id: '',
        question_text: '',
        order_index: maxOrder + 1,
        choices: [
          { id: '', choice_text: '', is_correct: false, order_index: 0 },
          { id: '', choice_text: '', is_correct: false, order_index: 1 },
        ],
      },
    ]);
  };

  const removeQuestionLocal = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateQuestionText = (idx: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, question_text: text } : q))
    );
  };

  const addChoice = (qIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const maxOrder = q.choices.reduce((m, c) => Math.max(m, c.order_index), 0);
        return {
          ...q,
          choices: [...q.choices, { id: '', choice_text: '', is_correct: false, order_index: maxOrder + 1 }],
        };
      })
    );
  };

  const updateChoiceText = (qIdx: number, cIdx: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        return {
          ...q,
          choices: q.choices.map((c, j) => (j === cIdx ? { ...c, choice_text: text } : c)),
        };
      })
    );
  };

  const setCorrect = (qIdx: number, cIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        return {
          ...q,
          choices: q.choices.map((c, j) => ({ ...c, is_correct: j === cIdx })),
        };
      })
    );
  };

  const removeChoiceLocal = (qIdx: number, cIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        return { ...q, choices: q.choices.filter((_, j) => j !== cIdx) };
      })
    );
  };

  return (
    <main className="py-12 px-8 max-w-[1200px] mx-auto max-sm:py-8 max-sm:px-5">
      <Link
        href={`/quizzes/${quiz.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-8"
      >
        ← Retour au quiz
      </Link>

      <div className="mb-10">
        <div className="font-mono text-xs font-medium tracking-[0.06em] uppercase text-muted mb-3.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent mr-2 align-middle" />
          Édition
        </div>
        <h1 className="text-[clamp(32px,4.4vw,48px)] font-semibold tracking-[-0.035em] leading-[1.05] mb-6">
          Modifier le quiz
        </h1>

        <form action={titleAction} className="flex flex-col sm:flex-row gap-3 max-w-[680px]">
          <input
            name="title"
            defaultValue={quiz.title}
            className="flex-1 bg-bg-elev border border-line rounded-xl py-3 px-4 text-base outline-none focus:border-ink focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] transition"
          />
          <input
            name="theme"
            defaultValue={quiz.theme}
            className="w-[180px] bg-bg-elev border border-line rounded-xl py-3 px-4 text-base outline-none focus:border-ink focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] transition"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-line text-sm font-medium text-ink hover:bg-bg-soft hover:border-ink transition"
          >
            Enregistrer
          </button>
          {titleState?.error && <p className="text-sm text-bad">{titleState.error}</p>}
          {titleState?.success && <p className="text-sm text-good">Enregistré.</p>}
        </form>
      </div>

      <div className="flex flex-col gap-6">
        {questions.map((q, qIdx) => (
          <QuestionEditor
            key={q.id || `new-${qIdx}`}
            question={q}
            qIdx={qIdx}
            quizId={quiz.id}
            onRemove={() => removeQuestionLocal(qIdx)}
            onTextChange={(text) => updateQuestionText(qIdx, text)}
            onAddChoice={() => addChoice(qIdx)}
            onChoiceTextChange={(cIdx, text) => updateChoiceText(qIdx, cIdx, text)}
            onSetCorrect={(cIdx) => setCorrect(qIdx, cIdx)}
            onRemoveChoice={(cIdx) => removeChoiceLocal(qIdx, cIdx)}
          />
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={addQuestion}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-line text-base font-medium text-ink hover:bg-bg-soft hover:border-ink transition"
        >
          + Ajouter une question
        </button>
      </div>
    </main>
  );
}

interface QuestionEditorProps {
  question: QuizQuestionWithChoices & { id: string };
  qIdx: number;
  quizId: string;
  onRemove: () => void;
  onTextChange: (text: string) => void;
  onAddChoice: () => void;
  onChoiceTextChange: (cIdx: number, text: string) => void;
  onSetCorrect: (cIdx: number) => void;
  onRemoveChoice: (cIdx: number) => void;
}

function QuestionEditor({
  question,
  qIdx,
  quizId,
  onRemove,
  onTextChange,
  onAddChoice,
  onChoiceTextChange,
  onSetCorrect,
  onRemoveChoice,
}: QuestionEditorProps) {
  const [qState, qAction] = useActionState(saveQuestionAction.bind(null, quizId), null);
  const [deleteState, deleteAction] = useActionState(deleteQuestionAction, null);

  return (
    <div className="bg-bg-elev border border-line-2 rounded-[22px] p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="font-mono text-xs font-medium text-muted w-6 h-6 rounded-full bg-bg-soft flex items-center justify-center">
          {qIdx + 1}
        </span>
        <span className="text-[13px] font-medium text-ink-2">Question</span>
        <div className="ml-auto flex gap-2">
          {question.id && (
            <form action={deleteAction}>
              <input type="hidden" name="id" value={question.id} />
              <button
                type="submit"
                className="text-xs text-muted font-mono px-2.5 py-1.5 rounded-lg hover:bg-[oklch(96%_0.05_25)] hover:text-bad transition"
              >
                Supprimer
              </button>
            </form>
          )}
        </div>
      </div>

      <form action={qAction} className="flex flex-col gap-4">
        <input type="hidden" name="order_index" value={question.order_index} />
        {question.id && <input type="hidden" name="id" value={question.id} />}
        <input
          name="question_text"
          value={question.question_text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Écrivez la question…"
          className="bg-bg-elev border border-line rounded-xl py-3 px-4 text-base outline-none focus:border-ink focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] transition w-full"
        />
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="text-xs font-medium text-accent-ink hover:underline underline-offset-[3px]"
          >
            Enregistrer la question
          </button>
          {qState?.error && <p className="text-sm text-bad">{qState.error}</p>}
        </div>
      </form>

      <div className="mt-5 pt-5 border-t border-line-2">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[13px] font-medium text-ink-2">Choix</span>
          <span className="text-[11px] text-muted font-mono">
            {question.choices.filter((c) => c.is_correct).length} correct(s)
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {question.choices.map((c, cIdx) => (
            <ChoiceRow
              key={c.id || `newc-${cIdx}`}
              choice={c}
              questionId={question.id}
              questionIdx={qIdx}
              choiceIdx={cIdx}
              onTextChange={(text) => onChoiceTextChange(cIdx, text)}
              onSetCorrect={() => onSetCorrect(cIdx)}
              onRemove={() => onRemoveChoice(cIdx)}
            />
          ))}
        </div>
        <button
          onClick={onAddChoice}
          className="mt-3 text-xs font-medium text-accent-ink hover:underline underline-offset-[3px]"
        >
          + Ajouter un choix
        </button>
      </div>
    </div>
  );
}

interface ChoiceRowProps {
  choice: { id: string; choice_text: string; is_correct: boolean; order_index: number };
  questionId: string;
  questionIdx: number;
  choiceIdx: number;
  onTextChange: (text: string) => void;
  onSetCorrect: () => void;
  onRemove: () => void;
}

function ChoiceRow({
  choice,
  questionId,
  questionIdx,
  choiceIdx,
  onTextChange,
  onSetCorrect,
  onRemove,
}: ChoiceRowProps) {
  const [cState, cAction] = useActionState(saveChoiceAction.bind(null, questionId), null);
  const [deleteState, deleteAction] = useActionState(deleteChoiceAction, null);
  const [correctState, correctAction] = useActionState(setCorrectChoiceAction, null);

  const letter = String.fromCharCode(65 + choiceIdx);

  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`w-[26px] h-[26px] rounded-lg flex items-center justify-center font-mono text-xs font-medium shrink-0 transition ${
          choice.is_correct ? 'bg-ink text-white' : 'bg-bg-soft text-muted'
        }`}
      >
        {letter}
      </span>
      <form action={cAction} className="flex-1 flex items-center gap-2">
        <input type="hidden" name="order_index" value={choice.order_index} />
        {choice.id && <input type="hidden" name="id" value={choice.id} />}
        <input
          name="choice_text"
          value={choice.choice_text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Texte du choix…"
          className="flex-1 bg-transparent border-b border-line-2 py-1.5 px-1 text-[15px] outline-none focus:border-ink transition"
        />
        <button
          type="submit"
          className="text-[11px] font-mono text-muted hover:text-ink transition shrink-0"
        >
          ✓
        </button>
      </form>
      {choice.id && (
        <form action={correctAction}>
          <input type="hidden" name="question_id" value={questionId} />
          <input type="hidden" name="choice_id" value={choice.id} />
          <button
            type="submit"
            className={`text-[11px] font-mono px-2 py-1 rounded-md transition shrink-0 ${
              choice.is_correct
                ? 'bg-good/10 text-good'
                : 'text-muted hover:bg-bg-soft hover:text-ink'
            }`}
          >
            {choice.is_correct ? 'Correct' : 'Marquer correct'}
          </button>
        </form>
      )}
      {choice.id && (
        <form action={deleteAction}>
          <input type="hidden" name="id" value={choice.id} />
          <button
            type="submit"
            className="text-[11px] font-mono text-muted hover:text-bad transition shrink-0 px-1"
          >
            ✕
          </button>
        </form>
      )}
    </div>
  );
}
