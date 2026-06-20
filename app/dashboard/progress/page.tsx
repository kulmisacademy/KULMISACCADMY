import { redirect } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { getCurrentUser } from '@/lib/auth';
import { getProgress, getActivity } from '@/lib/queries';
import { CheckCircle, Play, Award, BookOpen } from 'lucide-react';
import { Tr } from '@/components/Tr';

export const dynamic = 'force-dynamic';

const ICON_MAP: Record<string, React.ElementType> = { 'check-circle': CheckCircle, play: Play, award: Award, 'book-open': BookOpen };
const TONE_COLORS: Record<string, [string, string]> = {
  mint: ['rgba(16,185,129,0.12)', '#10B981'],
  purple: ['rgba(99,102,241,0.12)', '#818CF8'],
  indigo: ['rgba(99,102,241,0.10)', '#6366F1'],
  amber: ['rgba(245,158,11,0.12)', '#F59E0B'],
};

function Heatmap() {
  const weeks = 20;
  const days = 7;
  const active = new Set([3,4,5,10,11,12,17,18,19,24,25,32,33,38,39,40,46,47,48,54,55,56,62,63,68,69,76,82,83,96,97,103,110,111,117,118,124,125,126,131,132,133]);
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1" style={{ minWidth: weeks * 14 }}>
        {Array.from({ length: weeks }, (_, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {Array.from({ length: days }, (_, di) => {
              const idx = wi * 7 + di;
              const on = active.has(idx);
              return (
                <div key={di} className="w-3 h-3 rounded-[2px] transition-colors cursor-default"
                  title={on ? `${di + 1} lessons` : 'No activity'}
                  style={{ background: on ? '#6366F1' : 'var(--neutral-100)' }} />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function ProgressPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');
  const [data, activity] = await Promise.all([getProgress(user.id), getActivity(user.id)]);
  const stats: { k: 'prog_total_hours' | 'prog_lessons_completed' | 'prog_certificates' | 'prog_courses_enrolled'; value: string }[] = [
    { k: 'prog_total_hours', value: `${data.stats.hours}h` },
    { k: 'prog_lessons_completed', value: String(data.stats.lessonsCompleted) },
    { k: 'prog_certificates', value: String(data.stats.certificates) },
    { k: 'prog_courses_enrolled', value: String(data.courses.length) },
  ];

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--surface-page)' }}>
      <TopBar titleKey="dash_progress" />
      <div className="p-4 sm:p-7 flex flex-col gap-7" style={{ maxWidth: 980, margin: '0 auto' }}>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.k} className="p-5 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
              <div className="text-[26px] font-bold text-[var(--text-strong)] leading-none" style={{ fontFamily: 'var(--font-display)' }}>{s.value}</div>
              <div className="text-[12px] text-[var(--text-muted)] mt-1.5"><Tr k={s.k} /></div>
            </div>
          ))}
        </div>

        {/* Activity heatmap */}
        <div className="p-6 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="text-[16px] font-bold text-[var(--text-strong)] m-0 mb-4" style={{ fontFamily: 'var(--font-display)' }}><Tr k="prog_learning_activity" /></h3>
          <Heatmap />
          <div className="flex items-center gap-3 mt-3 text-[11px] text-[var(--text-muted)]">
            <span><Tr k="prog_less" /></span>
            {['var(--neutral-100)', 'rgba(99,102,241,0.3)', 'rgba(99,102,241,0.6)', '#6366F1'].map((bg, i) => (
              <div key={i} className="w-3 h-3 rounded-[2px]" style={{ background: bg }} />
            ))}
            <span><Tr k="prog_more" /></span>
          </div>
        </div>

        {/* Progress by course */}
        <div className="p-6 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="text-[16px] font-bold text-[var(--text-strong)] m-0 mb-5" style={{ fontFamily: 'var(--font-display)' }}><Tr k="prog_by_course" /></h3>
          <div className="flex flex-col gap-4">
            {data.courses.length === 0 && <p className="text-[13px] text-[var(--text-muted)] m-0"><Tr k="prog_no_courses" /></p>}
            {data.courses.map((c, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="text-[13px] font-medium text-[var(--text-body)] truncate" style={{ width: 200, flexShrink: 0 }}>{c.title}</div>
                <div className="flex-1 h-2 rounded-full bg-[var(--neutral-200)] overflow-hidden">
                  <div className="h-full rounded-full bg-[#6366F1] transition-all" style={{ width: `${c.progress}%` }} />
                </div>
                <span className="text-[12px] font-bold font-mono text-[var(--text-muted)] w-10 text-right">{c.progress}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="p-6 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="text-[16px] font-bold text-[var(--text-strong)] m-0 mb-5" style={{ fontFamily: 'var(--font-display)' }}><Tr k="prog_recent" /></h3>
          <div className="flex flex-col">
            {activity.length === 0 && <p className="text-[13px] text-[var(--text-muted)] m-0"><Tr k="prog_no_activity" /></p>}
          {activity.map((a, i) => {
              const Icon = ICON_MAP[a.icon] || CheckCircle;
              const [bg, fg] = TONE_COLORS[a.tone];
              return (
                <div key={i} className="flex items-center gap-4 py-3.5" style={{ borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: bg, color: fg }}>
                    <Icon size={17} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-[var(--text-body)] truncate">{a.text}</div>
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)] font-mono flex-shrink-0">{a.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
