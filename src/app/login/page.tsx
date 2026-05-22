'use client';

import { useState, useActionState } from 'react';
import Link from 'next/link';
import { signIn, signUp } from '@/lib/auth/actions';

const COPY = {
  login: {
    eyebrow: 'Bon retour',
    title: 'Connexion à votre compte.',
    lede: "Une adresse, un mot de passe — c'est tout ce qu'il faut.",
    submit: 'Se connecter',
    switchQ: 'Pas encore de compte ?',
    switchLabel: 'Créer un compte →',
  },
  signup: {
    eyebrow: 'Bienvenue',
    title: 'Créez votre compte.',
    lede: 'Trente secondes. Pas de pubs.',
    submit: 'Créer mon compte',
    switchQ: 'Déjà inscrit·e ?',
    switchLabel: 'Se connecter →',
  },
};

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPwd, setShowPwd] = useState(false);
  const [loginState, loginAction, loginPending] = useActionState(signIn, null);
  const [signupState, signupAction, signupPending] = useActionState(signUp, null);

  const c = COPY[mode];
  const isPending = mode === 'login' ? loginPending : signupPending;
  const state = mode === 'login' ? loginState : signupState;

  return (
    <main className="min-h-[calc(100vh-56px)] grid grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      {/* Brand Panel */}
      <aside className="relative bg-[#0e0e10] text-white py-16 px-14 flex flex-col justify-between overflow-hidden isolate max-lg:min-h-[320px] max-lg:py-12 max-lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_80%_20%,oklch(60%_0.22_280_/_0.5),transparent_70%),radial-gradient(40%_50%_at_10%_90%,oklch(70%_0.18_200_/_0.35),transparent_70%)] z-[-1]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.04)_1px,transparent_0)] bg-[size:24px_24px] z-[-1] [mask:radial-gradient(ellipse_80%_70%_at_50%_50%,black,transparent)]" />

        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-lg bg-ink relative overflow-hidden after:absolute after:inset-1 after:rounded-[3px] after:bg-[linear-gradient(135deg,var(--color-accent),oklch(70%_0.2_320))]" />
          <span className="text-[19px] font-semibold tracking-[-0.02em]">Quizia</span>
        </div>

        <div className="max-w-[480px] my-auto max-lg:my-6">
          <div className="font-mono text-xs font-medium tracking-[0.06em] uppercase text-white/55 mb-6">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[oklch(75%_0.2_280)] mr-2 align-middle" />
            Pour les créateurs
          </div>
          <h1 className="text-[clamp(40px,4.4vw,60px)] font-semibold tracking-[-0.035em] leading-[1.02] mb-7">
            Créez. Publiez.{' '}
            <span className="bg-[linear-gradient(120deg,oklch(75%_0.2_280),oklch(80%_0.18_200))] bg-clip-text text-transparent">
              {mode === 'login' ? 'Mesurez.' : 'Démarrez.'}
            </span>
          </h1>
          <p className="text-white/70 text-[17px] leading-[1.55]">
            {mode === 'login'
              ? "Connectez-vous pour générer vos propres quiz avec l'IA, suivre vos performances et publier en un clic."
              : 'Décrivez votre sujet, choisissez le nombre de questions, laissez l\'IA composer. Vous gardez le contrôle, toujours.'}
          </p>

          <div className="flex flex-wrap gap-2 mt-8">
            {['Génération IA', 'Édition libre', 'Stats temps réel'].map((label) => (
              <span
                key={label}
                className="bg-white/5 border border-white/10 py-2 px-3.5 rounded-full text-[13px] text-white/85 backdrop-blur-xl inline-flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[oklch(75%_0.2_280)]" />
                {label}
              </span>
            ))}
          </div>

          <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl max-lg:hidden">
            <p className="text-base leading-relaxed text-white">
              « J&apos;ai créé un quiz pour ma classe de 28 élèves en trois minutes. Le plus long, c&apos;était de choisir le thème. »
            </p>
            <div className="text-[13px] text-white/55 font-mono mt-3">Léa M. — Professeure d&apos;histoire-géo</div>
          </div>
        </div>
      </aside>

      {/* Form Panel */}
      <section className="bg-bg flex items-center justify-center py-16 px-14 max-lg:py-12 max-lg:px-6">
        <div className="w-full max-w-[420px]">
          <div className="font-mono text-xs font-medium tracking-[0.06em] uppercase text-muted mb-3.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent mr-2 align-middle" />
            {c.eyebrow}
          </div>
          <h1 className="text-[clamp(32px,3.4vw,40px)] font-semibold tracking-[-0.035em] leading-[1.05] mb-3">
            {c.title}
          </h1>
          <p className="text-base text-muted mb-9">{c.lede}</p>

          {/* Segmented control */}
          <div className="grid grid-cols-2 bg-bg-soft p-1 rounded-full mb-7 relative">
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-transform duration-300 ${
                mode === 'signup' ? 'translate-x-[calc(100%+0px)]' : ''
              }`}
            />
            <button
              onClick={() => setMode('login')}
              className={`relative z-10 py-2.5 px-4 rounded-full text-sm font-medium transition-colors ${
                mode === 'login' ? 'text-ink' : 'text-muted'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`relative z-10 py-2.5 px-4 rounded-full text-sm font-medium transition-colors ${
                mode === 'signup' ? 'text-ink' : 'text-muted'
              }`}
            >
              Inscription
            </button>
          </div>

          <form action={mode === 'login' ? loginAction : signupAction} className="flex flex-col gap-[18px]">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-[13px] font-medium text-ink-2">
                Adresse e-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="vous@exemple.fr"
                required
                className="bg-bg-elev border border-line rounded-xl py-3.5 px-4 text-base outline-none focus:border-ink focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] transition w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-[13px] font-medium text-ink-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••••"
                  required
                  minLength={mode === 'signup' ? 6 : 1}
                  className="bg-bg-elev border border-line rounded-xl py-3.5 px-4 text-base outline-none focus:border-ink focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] transition w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted font-mono py-1.5 px-2.5 rounded-lg hover:bg-bg-soft hover:text-ink transition"
                >
                  {showPwd ? 'Cacher' : 'Voir'}
                </button>
              </div>
            </div>

            {state?.error && (
              <p className="text-sm text-bad">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-full bg-ink text-white text-base font-medium hover:-translate-y-px hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? (mode === 'login' ? 'Connexion…' : 'Création…') : c.submit}{' '}
              <span>→</span>
            </button>
          </form>

          <div className="flex items-center gap-3 my-1 text-[11px] font-mono text-muted-2 uppercase tracking-[0.08em]">
            <span className="flex-1 h-px bg-line-2" />
            ou continuer avec
            <span className="flex-1 h-px bg-line-2" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="bg-white border border-line rounded-xl py-3 px-3.5 text-sm font-medium text-ink flex items-center justify-center gap-2 hover:border-ink hover:bg-bg-soft transition"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4c-.2 1.3-.9 2.3-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.5l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.9-1.8-5.7-4.2H3v2.6C4.7 19.7 8.1 22 12 22z"/><path fill="#FBBC05" d="M6.3 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.6H3C2.4 8.9 2 10.4 2 12s.4 3.1 1 4.4l3.3-2.6z"/><path fill="#EA4335" d="M12 5.8c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 2.9 14.7 2 12 2 8.1 2 4.7 4.3 3 7.6l3.3 2.6c.8-2.4 3.1-4.2 5.7-4.2z"/></svg>
              Google
            </button>
            <button
              type="button"
              className="bg-white border border-line rounded-xl py-3 px-3.5 text-sm font-medium text-ink flex items-center justify-center gap-2 hover:border-ink hover:bg-bg-soft transition"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M16.4 1c.1 1-.3 2-.9 2.7-.7.8-1.7 1.4-2.7 1.3-.1-1 .3-2 .9-2.7C14.5 1.6 15.5 1 16.4 1zM20 17.3c-.4.9-.9 1.7-1.4 2.5-.8 1-1.4 1.7-1.9 2.1-.7.6-1.5 1-2.3 1-.6 0-1.3-.2-2.2-.5s-1.7-.5-2.4-.5c-.7 0-1.5.2-2.4.5s-1.6.5-2.1.5c-.9 0-1.7-.4-2.5-1.1-.5-.4-1.2-1.2-2-2.2-.9-1.1-1.6-2.4-2.2-3.8C.9 14.2.5 12.7.5 11.2c0-1.7.4-3.2 1.1-4.4.6-1 1.4-1.7 2.4-2.3 1-.5 2.1-.8 3.2-.9.6 0 1.4.2 2.5.6 1 .4 1.7.6 2 .6.2 0 1-.2 2.3-.7 1.3-.4 2.3-.6 3.2-.5 2.3.2 4 1.1 5.2 2.8-2 1.2-3 2.9-3 5.1 0 1.7.6 3.2 1.9 4.3.6.5 1.2.9 1.9 1.2-.2.4-.3.9-.6 1.3z"/></svg>
              Apple
            </button>
          </div>

          <p className="mt-7 text-sm text-muted text-center">
            {c.switchQ}{' '}
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-ink font-medium hover:underline underline-offset-[3px]"
            >
              {c.switchLabel}
            </button>
          </p>

          <p className="text-center mt-4 text-[13px]">
            <Link href="/#bibliotheque" className="text-accent-ink hover:underline underline-offset-[3px]">
              Continuer sans compte
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
