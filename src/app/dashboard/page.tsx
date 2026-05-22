import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserStats, getUserAttempts, getUserQuizzes } from '@/lib/services/quizzes.service';
import Link from 'next/link';

const themeGradients = [
  'bg-[linear-gradient(135deg,oklch(75%_0.18_280),oklch(85%_0.14_240))]',
  'bg-[linear-gradient(135deg,oklch(80%_0.16_60),oklch(85%_0.16_30))]',
  'bg-[linear-gradient(135deg,oklch(78%_0.14_150),oklch(85%_0.12_180))]',
  'bg-[linear-gradient(135deg,oklch(72%_0.2_340),oklch(80%_0.18_20))]',
  'bg-[linear-gradient(135deg,oklch(75%_0.14_220),oklch(85%_0.1_260))]',
  'bg-[linear-gradient(135deg,oklch(78%_0.15_110),oklch(85%_0.12_80))]',
];

function KPI({
  label,
  value,
  unit,
  delta,
  deltaLabel,
}: {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  deltaLabel?: string;
}) {
  const isUp = delta?.startsWith('+');
  const isDown = delta?.startsWith('-');
  const deltaBg = isUp
    ? 'bg-[oklch(96%_0.06_150)] text-[oklch(45%_0.18_150)]'
    : isDown
      ? 'bg-[oklch(96%_0.05_25)] text-[oklch(45%_0.2_25)]'
      : 'bg-bg-soft text-muted';

  return (
    <div className="bg-bg-elev border border-line-2 rounded-[22px] p-6 relative overflow-hidden transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)] hover:border-line">
      <div className="flex justify-between items-center text-[13px] text-muted font-medium mb-4">{label}</div>
      <div className="text-[44px] font-semibold tracking-[-0.035em] leading-none mb-3">
        {value}
        {unit && <span className="text-[22px] text-muted ml-0.5 font-medium">{unit}</span>}
      </div>
      {delta && (
        <div className="flex items-center gap-2 text-[13px]">
          <span className={`font-mono font-medium text-xs py-0.5 px-2 rounded-md ${deltaBg}`}>{delta}</span>
          <span className="text-xs text-muted">{deltaLabel}</span>
        </div>
      )}
    </div>
  );
}

function ScoreBar({ score, total }: { score: number; total: number }) {
  const pct = (score / total) * 100;
  const color = pct >= 80 ? 'bg-good' : pct >= 60 ? 'bg-warn' : 'bg-bad';
  return (
    <span className="inline-flex items-center gap-2.5 font-mono font-medium text-[13px]">
      {Math.round(pct)}%
      <span className="w-[60px] h-1.5 bg-line-2 rounded-full overflow-hidden">
        <span className={`block h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </span>
    </span>
  );
}

function getInitials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default async function StatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const stats = await getUserStats();
  const attempts = await getUserAttempts(6);
  const myQuizzes = await getUserQuizzes();

  const published = myQuizzes.filter((q) => q.status === 'published');
  const drafts = myQuizzes.filter((q) => q.status === 'draft');
  const archived = myQuizzes.filter((q) => q.status === 'archived');

  return (
    <main className="py-12 px-8 max-w-[1200px] mx-auto max-sm:py-8 max-sm:px-5">
      {/* Page header */}
      <div className="flex justify-between items-end flex-wrap gap-6 mb-10">
        <div>
          <div className="font-mono text-xs font-medium tracking-[0.06em] uppercase text-muted mb-3.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent mr-2 align-middle" />
            Tableau de bord
          </div>
          <h1 className="text-[clamp(36px,4.4vw,56px)] font-semibold tracking-[-0.035em] leading-[1.05] mb-3">
            Bonjour {user.email?.split('@')[0]}.
          </h1>
          <p className="text-[17px] text-muted">
            Votre activité, vos quiz, vos résultats — d&apos;un seul coup d&apos;œil.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-bg-elev border border-line-2 py-2 px-3 rounded-full">
            <div className="w-9 h-9 rounded-full bg-[linear-gradient(135deg,oklch(75%_0.2_280),oklch(80%_0.18_200))] text-white flex items-center justify-center font-semibold text-sm">
              {getInitials(user.email ?? '?')}
            </div>
            <div>
              <div className="text-sm font-medium">{user.email}</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPI label="Quiz complétés" value={String(stats?.completedCount ?? 0)} />
        <KPI label="Quiz créés" value={String(stats?.createdCount ?? 0)} />
        <KPI label="Quiz archivés" value={String(stats?.archivedCount ?? 0)} />
        <KPI label="Score moyen" value={stats?.averageScore != null ? String(stats.averageScore) : '—'} unit={stats?.averageScore != null ? '%' : undefined} />
      </div>

      {/* History + My Quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mb-6">
        {/* History */}
        <div className="bg-bg-elev border border-line-2 rounded-[22px] p-7">
          <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
            <div>
              <h3 className="text-[19px] font-semibold tracking-[-0.018em]">Historique récent</h3>
              <p className="text-sm text-muted mt-1">Vos derniers quiz complétés</p>
            </div>
          </div>

          {attempts.length === 0 ? (
            <p className="text-muted text-sm">Aucune tentative complétée pour le moment.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left font-mono text-[11px] font-medium text-muted uppercase tracking-[0.06em] py-3 px-4 border-b border-line-2">
                    Quiz
                  </th>
                  <th className="text-right font-mono text-[11px] font-medium text-muted uppercase tracking-[0.06em] py-3 px-4 border-b border-line-2">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a, i) => (
                  <tr key={a.id} className="transition hover:bg-bg-soft">
                    <td className="py-4 px-4 border-b border-line-2">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-9 h-9 rounded-[10px] shrink-0 ${themeGradients[i % themeGradients.length]}`} />
                        <div>
                          <div className="text-sm font-medium tracking-[-0.01em]">
                            {a.quizzes?.title ?? 'Quiz supprimé'}
                          </div>
                          <div className="text-xs text-muted font-mono uppercase tracking-[0.04em] mt-0.5">
                            {a.quizzes?.theme ?? ''} · {a.total_questions} Q
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 border-b border-line-2 text-right">
                      <ScoreBar score={a.score} total={a.total_questions} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* My Quizzes summary */}
        <div className="bg-bg-elev border border-line-2 rounded-[22px] p-7">
          <div className="mb-6">
            <h3 className="text-[19px] font-semibold tracking-[-0.018em]">Mes quiz</h3>
            <p className="text-sm text-muted mt-1">Créés, publiés, archivés</p>
          </div>

          <div className="flex flex-col gap-4">
            {[
              { label: 'Publiés', count: published.length, color: 'bg-good' },
              { label: 'Brouillons', count: drafts.length, color: 'bg-muted' },
              { label: 'Archivés', count: archived.length, color: 'bg-warn' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-ink-2">
                  <span className={`w-2.5 h-2.5 rounded-[3px] ${item.color}`} />
                  {item.label}
                </div>
                <span className="font-mono text-muted text-[13px]">{item.count}</span>
              </div>
            ))}
          </div>

          {myQuizzes.length === 0 && (
            <p className="text-muted text-sm mt-4">Vous n&apos;avez pas encore créé de quiz.</p>
          )}

          <Link
            href="/my-quizzes"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full border border-line text-sm font-medium text-ink hover:bg-bg-soft hover:border-ink transition"
          >
            Voir mes quiz →
          </Link>
        </div>
      </div>
    </main>
  );
}
