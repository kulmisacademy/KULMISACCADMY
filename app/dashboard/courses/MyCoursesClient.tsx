'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Play, Check, BookOpen, Award } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CategoryPill } from '@/components/ui/CategoryPill';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CourseCard } from '@/components/CourseCard';
import type { CourseView } from '@/lib/queries';
import { useT } from '@/lib/i18n/context';

type Enr = { course: CourseView; progress: number; completed: boolean; completedDate?: string };

function ProgressCard({ enr, tab }: { enr: Enr; tab: string }) {
  const { t } = useT();
  const course = enr.course;
  return (
    <div className="flex gap-4 p-4 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
      <div className="w-28 flex-shrink-0 rounded-md flex items-center justify-center min-h-[86px]" style={{ background: 'linear-gradient(135deg, #2F1D78, #836FFF)' }}>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.18)' }}>
          <BookOpen size={20} color="white" />
        </div>
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div><CategoryPill track={course.track} size="sm" /></div>
        <h3 className="text-[15px] font-bold text-[var(--text-strong)] m-0 truncate" style={{ fontFamily: 'var(--font-display)' }}>{course.title}</h3>
        {tab === 'completed' ? (
          <div className="flex items-center gap-3 flex-wrap mt-auto">
            <span className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: '#10B981' }}><Check size={14} /> {t('mc_completed_on')} {enr.completedDate}</span>
            <Link href="/dashboard/certificates"><Button variant="secondary" size="sm" iconLeft={<Award size={13} />}>{t('mc_view_cert')}</Button></Link>
          </div>
        ) : (
          <>
            <ProgressBar value={enr.progress} showLabel />
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-[var(--text-muted)]">{course.lessons} {t('courses_lessons')}</span>
              <Link href={`/learn/${course.id}/start`} className="ml-auto"><Button variant="mint" size="sm" iconLeft={<Play size={13} />}>{t('mc_resume')}</Button></Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon, text, sub, cta, href }: { icon: string; text: string; sub: string; cta: string; href: string }) {
  return (
    <div className="text-center py-20 flex flex-col items-center gap-3">
      <span className="text-5xl">{icon}</span>
      <div className="text-[17px] font-semibold text-[var(--text-strong)]">{text}</div>
      <div className="text-[13px] text-[var(--text-muted)]">{sub}</div>
      <Link href={href}><Button variant="primary" size="sm" className="mt-2">{cta}</Button></Link>
    </div>
  );
}

export function MyCoursesClient({ inProgress, completed, bookmarked }: { inProgress: Enr[]; completed: Enr[]; bookmarked: CourseView[] }) {
  const { t } = useT();
  const [tab, setTab] = useState('inprogress');
  const TABS = [
    { id: 'inprogress', label: t('mc_tab_inprogress') },
    { id: 'completed', label: t('mc_tab_completed') },
    { id: 'bookmarked', label: t('mc_tab_bookmarked') },
  ];

  return (
    <div className="p-4 sm:p-7" style={{ maxWidth: 980, margin: '0 auto' }}>
      <div className="flex gap-1 mb-6 overflow-x-auto" style={{ borderBottom: '1px solid var(--border-default)' }}>
        {TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)} className="px-4 py-2.5 text-[14px] font-semibold cursor-pointer border-none bg-transparent transition-colors flex-shrink-0 whitespace-nowrap"
            style={{ color: tab === id ? '#818CF8' : 'var(--text-muted)', borderBottom: tab === id ? '2.5px solid #6366F1' : '2.5px solid transparent', marginBottom: -1 }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'inprogress' && (
        inProgress.length
          ? <div className="flex flex-col gap-4">{inProgress.map((e) => <ProgressCard key={e.course.id} enr={e} tab="inprogress" />)}</div>
          : <EmptyState icon="📚" text={t('mc_empty_inprogress')} sub={t('mc_empty_inprogress_sub')} cta={t('mc_empty_inprogress_cta')} href="/courses" />
      )}

      {tab === 'completed' && (
        completed.length
          ? <div className="flex flex-col gap-4">{completed.map((e) => <ProgressCard key={e.course.id} enr={e} tab="completed" />)}</div>
          : <EmptyState icon="🏆" text={t('mc_empty_completed')} sub={t('mc_empty_completed_sub')} cta={t('mc_empty_completed_cta')} href="/dashboard" />
      )}

      {tab === 'bookmarked' && (
        bookmarked.length
          ? <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
              {bookmarked.map((c) => <Link key={c.id} href={`/courses/${c.id}`} className="no-underline"><CourseCard course={c} /></Link>)}
            </div>
          : <EmptyState icon="🔖" text={t('mc_empty_bookmarked')} sub={t('mc_empty_bookmarked_sub')} cta={t('mc_empty_bookmarked_cta')} href="/courses" />
      )}
    </div>
  );
}
