import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Play, Flame, Clock, BookOpen, Award } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/Button';
import { CategoryPill } from '@/components/ui/CategoryPill';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CourseCard } from '@/components/CourseCard';
import { getCurrentUser } from '@/lib/auth';
import { getDashboard } from '@/lib/queries';

export const dynamic = 'force-dynamic';

function StatCard({ icon: Icon, label, value, bg, fg }: { icon: React.ElementType; label: string; value: string; bg: string; fg: string }) {
  return (
    <div className="flex-1 min-w-[150px] flex items-center gap-3.5 p-5 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
      <span className="w-11 h-11 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: bg, color: fg }}><Icon size={21} /></span>
      <div>
        <div className="text-[24px] font-bold leading-none text-[var(--text-strong)]" style={{ fontFamily: 'var(--font-display)' }}>{value}</div>
        <div className="text-[12px] text-[var(--text-muted)] mt-1">{label}</div>
      </div>
    </div>
  );
}

function ProgressRing({ value, max, size = 92 }: { value: number; max: number; size?: number }) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const pct = max ? value / max : 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--neutral-200)" strokeWidth="10" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#6366F1" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-display)" fontWeight="700" fontSize="20" fill="var(--text-strong)">{value}/{max}</text>
    </svg>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');
  const data = await getDashboard(user.id);
  const firstName = user.name.split(' ')[0];

  const cont = data.enrollments.find((e) => !e.completed);
  const weeklyDone = Math.min(5, data.stats.lessonsCompleted);

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--surface-page)' }}>
      <TopBar title="Dashboard" />
      <div className="p-4 sm:p-7 flex flex-col gap-7" style={{ maxWidth: 1180, margin: '0 auto' }}>

        <div>
          <h2 className="text-[28px] font-bold text-[var(--text-strong)] m-0 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Good morning, {firstName} 👋
          </h2>
          <p className="text-[14px] text-[var(--text-muted)] mt-1.5 m-0">
            {cont ? `You have ${data.stats.inProgress} course${data.stats.inProgress === 1 ? '' : 's'} in progress. Keep it going!` : 'Browse the catalog and start your first course.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <StatCard icon={Flame} label="Lessons completed" value={String(data.stats.lessonsCompleted)} bg="rgba(245,158,11,0.12)" fg="#F59E0B" />
          <StatCard icon={Clock} label="Hours watched" value={`${data.stats.hoursWatched}h`} bg="rgba(99,102,241,0.12)" fg="#818CF8" />
          <StatCard icon={BookOpen} label="In progress" value={String(data.stats.inProgress)} bg="rgba(99,102,241,0.10)" fg="#6366F1" />
          <StatCard icon={Award} label="Certificates" value={String(data.stats.certificates)} bg="rgba(16,185,129,0.12)" fg="#10B981" />
        </div>

        {cont && (
          <div className="grid overflow-hidden rounded-2xl text-white grid-cols-1 sm:grid-cols-[300px_1fr]" style={{ background: 'var(--indigo-700)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="relative flex items-center justify-center min-h-[160px] sm:min-h-[200px]" style={{ background: 'linear-gradient(140deg, #432AA8, #836FFF)' }}>
              <Link href={`/learn/${cont.course.id}/${cont.currentLessonId ?? 'start'}`}>
                <button className="w-16 h-16 rounded-full flex items-center justify-center border-none cursor-pointer transition-transform hover:scale-105" style={{ background: '#10B981', boxShadow: 'var(--glow-mint)' }}>
                  <Play size={26} fill="#0B0723" color="#0B0723" />
                </button>
              </Link>
            </div>
            <div className="p-5 sm:p-8 flex flex-col justify-center gap-3">
              <div className="flex items-center gap-2.5">
                <CategoryPill track={cont.course.track} size="sm" solid />
                <span className="text-[11px] uppercase tracking-[0.08em] font-bold" style={{ color: 'var(--indigo-100)' }}>Continue learning</span>
              </div>
              <h2 className="text-[22px] font-bold m-0 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{cont.course.title}</h2>
              <p className="text-[13px] m-0" style={{ color: 'var(--indigo-100)' }}>{cont.course.lessons} lessons · {cont.course.instructor.name}</p>
              <div className="max-w-[420px]"><ProgressBar value={cont.progress} showLabel /></div>
              <div>
                <Link href={`/learn/${cont.course.id}/${cont.currentLessonId ?? 'start'}`}>
                  <Button variant="mint" iconLeft={<Play size={15} />}>Resume lesson</Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 items-start grid-cols-1 lg:grid-cols-[1fr_280px]">
          <div>
            <div className="flex items-center mb-4">
              <h3 className="text-[20px] font-bold text-[var(--text-strong)] m-0" style={{ fontFamily: 'var(--font-display)' }}>Recommended for you</h3>
              <Link href="/courses" className="ml-auto text-[13px] font-semibold no-underline flex items-center gap-1" style={{ color: 'var(--text-link)' }}>Browse catalog →</Link>
            </div>
            <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
              {data.recommended.slice(0, 2).map((c) => (
                <Link key={c.id} href={`/courses/${c.id}`} className="no-underline"><CourseCard course={c} /></Link>
              ))}
            </div>
          </div>

          <div className="rounded-lg p-6 text-center" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 className="text-[15px] font-bold text-[var(--text-strong)] m-0 mb-4" style={{ fontFamily: 'var(--font-display)' }}>Weekly goal</h3>
            <div className="flex justify-center"><ProgressRing value={weeklyDone} max={5} /></div>
            <p className="text-[13px] text-[var(--text-muted)] mt-3.5 m-0">{weeklyDone} / 5 lessons this week</p>
            <div className="mt-4 h-1.5 rounded-full bg-[var(--neutral-200)] overflow-hidden">
              <div className="h-full rounded-full bg-[#6366F1] transition-all" style={{ width: `${(weeklyDone / 5) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
