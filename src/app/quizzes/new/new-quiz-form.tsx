'use client';

import { useState } from 'react';

export function NewQuizForm() {
  const [prompt, setPrompt] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setSubmitted(true);
    // TODO: envoyer le prompt à l'IA
  };

  if (submitted) {
    return (
      <div className="bg-bg-elev border border-line-2 rounded-[22px] p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-[conic-gradient(from_0deg,var(--color-accent),oklch(75%_0.2_320),oklch(80%_0.15_200),var(--color-accent))] animate-[spin_4s_linear_infinite] shadow-[0_0_40px_oklch(70%_0.2_280_/_0.4)] mx-auto mb-6" />
        <h3 className="text-[22px] font-semibold tracking-[-0.018em] mb-2">Génération en cours…</h3>
        <p className="text-muted text-[15px] max-w-[400px] mx-auto">
          L&apos;intelligence artificielle prépare votre quiz à partir de votre prompt. Cela peut prendre quelques instants.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-bg-elev border border-line-2 rounded-[22px] p-8 max-w-[680px]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="prompt" className="text-[13px] font-medium text-ink-2">
            Votre prompt
          </label>
          <textarea
            id="prompt"
            name="prompt"
            rows={5}
            placeholder="Exemple : Crée un quiz de 10 questions sur la Renaissance italienne, avec des questions à choix multiples sur l'art, l'architecture et les figures historiques de cette période."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="bg-bg-elev border border-line rounded-xl py-3.5 px-4 text-base outline-none focus:border-ink focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] transition w-full resize-none"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-[13px] text-muted">{prompt.length} caractères</p>
          <button
            type="submit"
            disabled={!prompt.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-ink text-white text-base font-medium hover:-translate-y-px hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Générer le quiz
            <span className="font-normal">→</span>
          </button>
        </div>
      </form>
    </div>
  );
}
