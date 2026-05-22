'use client';

import { useState } from 'react';
import { ManualForm } from './manual-form';
import { PromptForm } from './prompt-form';

type Mode = 'manual' | 'prompt';

export function CreationSwitcher() {
  const [mode, setMode] = useState<Mode>('manual');

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 bg-bg-soft p-1 rounded-full max-w-[320px] relative">
        <div
          className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-transform duration-300 ${
            mode === 'prompt' ? 'translate-x-[calc(100%+0px)]' : ''
          }`}
        />
        <button
          onClick={() => setMode('manual')}
          className={`relative z-10 py-2.5 px-4 rounded-full text-sm font-medium transition-colors ${
            mode === 'manual' ? 'text-ink' : 'text-muted'
          }`}
        >
          Manuel
        </button>
        <button
          onClick={() => setMode('prompt')}
          className={`relative z-10 py-2.5 px-4 rounded-full text-sm font-medium transition-colors ${
            mode === 'prompt' ? 'text-ink' : 'text-muted'
          }`}
        >
          Par IA
        </button>
      </div>

      {mode === 'manual' ? <ManualForm /> : <PromptForm />}
    </div>
  );
}
