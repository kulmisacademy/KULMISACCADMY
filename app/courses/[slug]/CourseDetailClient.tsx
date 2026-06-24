'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Play, Check, Star, Clock, BookOpen, Globe, Award, ChevronRight, ArrowLeft, Download, Lock, FileArchive } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CategoryPill } from '@/components/ui/CategoryPill';
import { Avatar } from '@/components/ui/Avatar';
import { StarRating } from '@/components/ui/StarRating';
import { TRACK_META } from '@/lib/data';
import { enrollAction } from '@/app/actions/learning';
import { payAndEnrollAction } from '@/app/actions/payment';
import { WaafiCheckout } from '@/components/WaafiCheckout';
import type { CourseView } from '@/lib/queries';
import { useT } from '@/lib/i18n/context';

type Detail = {
  course: CourseView;
  curriculum: { section: string; lessons: { id: string; t: string; d: string; free: boolean }[] }[];
  reviews: { name: string; date: string; rating: number; text: string }[];
  files: { id: string; title: string; fileLabel: string }[];
};

export function CourseDetailClient({ detail, enrolled, isLoggedIn }: { detail: Detail; enrolled: boolean; isLoggedIn: boolean }) {
  const { t } = useT();
  const { course, curriculum, reviews, files } = detail;
  const learnPoints = course.learnPoints ?? [];
  const requirements = course.requirements ?? [];
  const TAB_LABELS: Record<string, string> = {
    Overview: t('cd_tab_overview'), Curriculum: t('cd_tab_curriculum'), Files: t('cd_tab_files'),
    Reviews: t('cd_tab_reviews'), Instructor: t('cd_tab_instructor'),
  };
  const TABS = ['Overview', 'Curriculum', ...(files.length ? ['Files'] : []), 'Reviews', 'Instructor'];
  const [tab, setTab] = useState('Overview');
  // All sections expanded by default so students see every lesson immediately
  const [expanded, setExpanded] = useState<number[]>(() => curriculum.map((_, i) => i));
  const meta = TRACK_META[course.track];
  const toggleSection = (i: number) => setExpanded(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  // First free-preview lesson across all sections
  const freeLesson = curriculum.flatMap(s => s.lessons).find(l => l.free) ?? null;

  return (
    <div style={{ background: 'var(--surface-page)', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-subtle)' }}>
        <div className="mx-auto px-5 sm:px-8 py-3 flex items-center gap-2 text-[12px]" style={{ maxWidth: 'var(--container-max)', color: 'var(--text-muted)' }}>
          <Link href="/courses" className="hover:text-[var(--text-body)] transition-colors flex items-center gap-1.5"><ArrowLeft size={13} /> {t('nav_courses')}</Link>
          <span>/</span>
          <span className="capitalize" style={{ color: meta.color }}>{meta.label}</span>
          <span>/</span>
          <span className="text-[var(--text-body)] truncate">{course.title}</span>
        </div>
      </div>

      <div className="mx-auto px-5 sm:px-8 py-10" style={{ maxWidth: 'var(--container-max)' }}>
        <div className="grid gap-8 lg:gap-10 items-start grid-cols-1 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <CategoryPill track={course.track} />
              <Badge variant={course.level as 'beginner' | 'intermediate' | 'advanced' | 'all'}>{(['beginner','intermediate','advanced'].includes(course.level) ? t(`level_${course.level}` as 'level_beginner') : course.level)}</Badge>
            </div>
            <h1 className="text-[32px] font-bold text-[var(--text-strong)] mb-4 leading-tight" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{course.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-[13px] text-[var(--text-muted)] mb-6">
              <StarRating rating={course.rating} reviewCount={course.reviews} size="md" />
              <span className="flex items-center gap-1.5"><Avatar name={course.instructor.name} size={20} />{course.instructor.name}</span>
              <span className="flex items-center gap-1.5"><BookOpen size={14} />{course.lessons} {t('courses_lessons')}</span>
              <span className="flex items-center gap-1.5"><Clock size={14} />{course.duration}</span>
              <span className="flex items-center gap-1.5"><Globe size={14} />{course.langs.join(', ').toUpperCase()}</span>
            </div>

            <div className="flex gap-1 mb-8 overflow-x-auto" style={{ borderBottom: '1px solid var(--border-default)' }}>
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)} className="px-4 py-2.5 text-[14px] font-semibold cursor-pointer border-none bg-transparent transition-colors flex-shrink-0 whitespace-nowrap"
                  style={{ color: tab === t ? '#818CF8' : 'var(--text-muted)', borderBottom: tab === t ? '2.5px solid #6366F1' : '2.5px solid transparent', marginBottom: -1 }}>
                  {TAB_LABELS[t]}
                </button>
              ))}
            </div>

            {tab === 'Overview' && (
              <div className="flex flex-col gap-7">
                {learnPoints.length > 0 && (
                  <div>
                    <h3 className="text-[18px] font-bold text-[var(--text-strong)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>{t('cd_learn')}</h3>
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                      {learnPoints.map((p) => (
                        <div key={p} className="flex items-start gap-3 text-[13px] text-[var(--text-body)]"><Check size={16} color="#10B981" className="mt-0.5 flex-shrink-0" />{p}</div>
                      ))}
                    </div>
                  </div>
                )}
                {requirements.length > 0 && (
                  <div>
                    <h3 className="text-[18px] font-bold text-[var(--text-strong)] mb-3" style={{ fontFamily: 'var(--font-display)' }}>{t('cd_requirements')}</h3>
                    <ul className="text-[13px] text-[var(--text-body)] flex flex-col gap-2 pl-4 list-disc">
                      {requirements.map((r) => <li key={r}>{r}</li>)}
                    </ul>
                  </div>
                )}
                {course.description && (
                  <div>
                    <h3 className="text-[18px] font-bold text-[var(--text-strong)] mb-3" style={{ fontFamily: 'var(--font-display)' }}>{t('cd_description')}</h3>
                    <p className="text-[14px] text-[var(--text-body)] leading-relaxed m-0 whitespace-pre-line">{course.description}</p>
                  </div>
                )}
              </div>
            )}

            {tab === 'Curriculum' && (
              <div className="flex flex-col gap-4">
                {curriculum.map((sec, si) => (
                  <div key={si} className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
                    <button onClick={() => toggleSection(si)} className="w-full flex items-center gap-3 px-5 py-4 text-left cursor-pointer border-none transition-colors" style={{ background: 'var(--surface-card)' }}>
                      <ChevronRight size={16} color="var(--text-muted)" className="transition-transform flex-shrink-0" style={{ transform: expanded.includes(si) ? 'rotate(90deg)' : 'rotate(0)' }} />
                      <span className="font-semibold text-[14px] text-[var(--text-strong)] flex-1">{sec.section}</span>
                      <span className="text-[12px] text-[var(--text-muted)]">{sec.lessons.length} {t('courses_lessons')}</span>
                    </button>
                    {expanded.includes(si) && (
                      <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        {sec.lessons.map((lesson, li) => {
                          const accessible = lesson.free || enrolled;
                          const row = (
                            <div className="flex items-center gap-3 px-5 py-3.5 text-[13px]" style={{ borderTop: li ? '1px solid var(--border-subtle)' : 'none', opacity: accessible ? 1 : 0.55 }}>
                              {accessible
                                ? <Play size={14} color={lesson.free ? '#10B981' : 'var(--text-muted)'} className="flex-shrink-0" />
                                : <Lock size={14} color="var(--text-muted)" className="flex-shrink-0" />}
                              <span className="flex-1 text-[var(--text-body)]">{lesson.t}</span>
                              {lesson.free && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-pill font-mono" style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}>{t('cd_free_badge')}</span>}
                              {!accessible && <Lock size={12} color="var(--text-subtle)" className="flex-shrink-0"/>}
                              <span className="text-[var(--text-muted)] font-mono text-[11px]">{lesson.d}</span>
                            </div>
                          );
                          return accessible
                            ? <Link key={lesson.id} href={`/learn/${course.id}/${lesson.id}`} className="block no-underline hover:bg-[var(--surface-raised)] transition-colors">{row}</Link>
                            : <div key={lesson.id}>{row}</div>;
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {tab === 'Files' && (
              <div className="flex flex-col gap-3">
                <p className="text-[13px] text-[var(--text-muted)] m-0">
                  {enrolled ? t('cd_files_enrolled') : t('cd_files_locked')}
                </p>
                {files.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 p-4 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
                    <span className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(99,102,241,0.12)', color: '#818CF8' }}><FileArchive size={18} /></span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold text-[var(--text-strong)] truncate">{f.title}</div>
                      <div className="text-[11px] text-[var(--text-muted)] font-mono">{f.fileLabel || t('cd_course_file')}</div>
                    </div>
                    {enrolled ? (
                      <a href={`/api/courses/${course.id}/files/${f.id}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="secondary" size="sm" iconLeft={<Download size={14} />}>{t('cd_download')}</Button>
                      </a>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--text-subtle)]"><Lock size={13} /> {t('cd_locked')}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {tab === 'Reviews' && (
              <div className="flex flex-col gap-6">
                {reviews.length === 0 && <p className="text-[14px] text-[var(--text-muted)]">{t('cd_no_reviews')}</p>}
                {reviews.map((r, i) => (
                  <div key={i} className="flex gap-4 p-5 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
                    <Avatar name={r.name} size={40} className="flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-[13px] text-[var(--text-strong)]">{r.name}</span>
                        <span className="text-[11px] text-[var(--text-muted)]">{r.date}</span>
                      </div>
                      <div className="flex gap-0.5 mb-2">
                        {Array.from({ length: 5 }, (_, k) => <Star key={k} size={12} fill={k < r.rating ? '#F59E0B' : 'transparent'} color={k < r.rating ? '#F59E0B' : 'var(--neutral-300)'} />)}
                      </div>
                      <p className="text-[13px] text-[var(--text-body)] leading-relaxed m-0">{r.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'Instructor' && (
              <div className="p-6 rounded-lg flex gap-5" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
                <Avatar name={course.instructor.name} size={80} className="flex-shrink-0" />
                <div>
                  <h3 className="text-[20px] font-bold text-[var(--text-strong)] mb-1" style={{ fontFamily: 'var(--font-display)' }}>{course.instructor.name}</h3>
                  <div className="text-[13px] text-[var(--text-muted)] mb-3">{course.instructor.title}</div>
                  <div className="flex flex-wrap gap-5 text-[13px] text-[var(--text-muted)] mb-4">
                    <span>⭐ {course.instructor.rating} {t('cd_rating')}</span>
                    <span>👥 {course.instructor.students.toLocaleString()} {t('cd_students')}</span>
                    <span>📚 {course.instructor.courses} {t('cd_courses')}</span>
                  </div>
                  <p className="text-[14px] text-[var(--text-body)] leading-relaxed m-0">{course.instructor.bio}</p>
                </div>
              </div>
            )}
          </div>

          {/* Enroll card */}
          <div className="rounded-xl overflow-hidden lg:sticky lg:top-24 order-first lg:order-none" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)' }}>
            {/* Thumbnail / preview area */}
            <div className="relative aspect-video flex items-center justify-center overflow-hidden" style={{ background: meta.bg }}>
              {course.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={course.thumbnailUrl} alt={course.title} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-white/15">
                  <Play size={28} fill="white" color="white" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              {/* Free preview play button overlay */}
              {freeLesson && (
                <a href={`/learn/${course.id}/${freeLesson.id}`}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 no-underline group">
                  <span className="w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: '2px solid rgba(255,255,255,0.35)' }}>
                    <Play size={28} fill="white" color="white" />
                  </span>
                  <span className="text-white text-[12px] font-bold px-3 py-1 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
                    Watch free preview
                  </span>
                </a>
              )}
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                {course.price === 'Free'
                  ? <span className="text-[28px] font-bold text-[#10B981]" style={{ fontFamily: 'var(--font-display)' }}>{t('pricing_free_title')}</span>
                  : <span className="text-[28px] font-bold text-[var(--text-strong)]" style={{ fontFamily: 'var(--font-display)' }}>{course.price}</span>}
              </div>

              {enrolled ? (
                <Link href={`/learn/${course.id}/start`}>
                  <Button variant="mint" size="lg" fullWidth iconLeft={<Play size={15} />}>{t('cd_continue')}</Button>
                </Link>
              ) : !isLoggedIn ? (
                <>
                  <Link href={`/sign-up?next=/courses/${course.id}`}>
                    <Button variant={course.price === 'Free' ? 'mint' : 'primary'} size="lg" fullWidth>
                      {course.price === 'Free' ? t('cd_signup_enroll') : t('cd_signup_buy')}
                    </Button>
                  </Link>
                  <p className="text-[12px] text-center text-[var(--text-muted)] m-0">
                    {t('cd_already')}{' '}
                    <Link href={`/sign-in?next=/courses/${course.id}`} className="font-semibold no-underline" style={{ color: 'var(--text-link)' }}>{t('cd_signin')}</Link>
                  </p>
                </>
              ) : course.price === 'Free' ? (
                <form action={enrollAction.bind(null, course.id)}>
                  <Button variant="mint" size="lg" fullWidth type="submit">{t('cd_enroll_free')}</Button>
                </form>
              ) : (
                <WaafiCheckout
                  action={payAndEnrollAction.bind(null, course.id)}
                  amount={course.price}
                  triggerLabel={`${t('cd_buy_now')} · ${course.price}`}
                  title={t('cd_buy_title').replace('{title}', course.title).replace('{count}', String(course.lessons))}
                />
              )}

              {course.price !== 'Free' && !enrolled && isLoggedIn && <p className="text-[11px] text-center text-[var(--text-muted)] m-0">{t('cd_guarantee')}</p>}

              <div className="flex flex-col gap-2.5 pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <div className="text-[12px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-1">{t('cd_includes')}</div>
                {[
                  { icon: Play, label: `${course.lessons} ${t('cd_video_lessons')}` },
                  { icon: Clock, label: `${course.duration} ${t('cd_total_length')}` },
                  { icon: Award, label: t('cd_certificate') },
                  { icon: Globe, label: course.langs.map(l => l.toUpperCase()).join(', ') + ' ' + t('cd_available') },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 text-[13px] text-[var(--text-body)]"><Icon size={15} color="var(--text-muted)" className="flex-shrink-0" />{label}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
