'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CourseCard } from '@/components/CourseCard';
import { Button } from '@/components/ui/Button';
import { TRACK_META } from '@/lib/data';
import type { CourseView } from '@/lib/queries';
import type { Track, Level } from '@/lib/types';
import { useT } from '@/lib/i18n/context';

const TRACKS = ['vibe-coding', 'traditional-coding', 'ai-tools', 'ai-agents'] as Track[];
const LEVELS: ('beginner' | 'intermediate' | 'advanced')[] = ['beginner', 'intermediate', 'advanced'];

export function CatalogClient({ courses }: { courses: CourseView[] }) {
  const { t } = useT();
  const SORT_OPTIONS = [
    { value: 'popular', label: t('sort_popular') },
    { value: 'newest', label: t('sort_newest') },
    { value: 'rating', label: t('sort_rating') },
    { value: 'price-asc', label: t('sort_price_asc') },
  ];
  const LEVEL_LABELS: Record<'beginner' | 'intermediate' | 'advanced', string> = {
    beginner: t('level_beginner'), intermediate: t('level_intermediate'), advanced: t('level_advanced'),
  };
  const PRICE_LABELS: Record<'all' | 'free' | 'paid', string> = {
    all: t('price_all'), free: t('price_free'), paid: t('price_paid'),
  };
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [sort, setSort] = useState('popular');
  const [mobileFilters, setMobileFilters] = useState(false);

  const toggleTrack = (t: Track) => setTracks(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const toggleLevel = (l: Level) => setLevels(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);

  const filtered = useMemo(() => {
    let list = [...courses];
    if (query) list = list.filter(c => c.title.toLowerCase().includes(query.toLowerCase()) || c.instructor.name.toLowerCase().includes(query.toLowerCase()));
    if (tracks.length) list = list.filter(c => tracks.includes(c.track));
    if (levels.length) list = list.filter(c => levels.includes(c.level as Level));
    if (priceFilter === 'free') list = list.filter(c => c.price === 'Free');
    if (priceFilter === 'paid') list = list.filter(c => c.price !== 'Free');
    if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === 'price-asc') list = [...list].sort((a, b) => (a.price === 'Free' ? 0 : parseFloat(a.price.slice(1))) - (b.price === 'Free' ? 0 : parseFloat(b.price.slice(1))));
    return list;
  }, [courses, query, tracks, levels, priceFilter, sort]);

  const hasFilters = tracks.length || levels.length || priceFilter !== 'all' || query;

  const FilterPanel = () => (
    <div className="flex flex-col gap-7">
      {hasFilters && (
        <button onClick={() => { setTracks([]); setLevels([]); setPriceFilter('all'); setQuery(''); }} className="text-[13px] font-semibold cursor-pointer border-none bg-transparent text-left" style={{ color: '#818CF8' }}>
          {t('catalog_clear')}
        </button>
      )}

      <div>
        <div className="text-[12px] font-bold uppercase tracking-[0.10em] mb-3" style={{ color: 'var(--text-muted)' }}>{t('catalog_track')}</div>
        <div className="flex flex-col gap-2">
          {TRACKS.map(t => {
            const meta = TRACK_META[t];
            const on = tracks.includes(t);
            return (
              <label key={t} className="flex items-center gap-2.5 cursor-pointer">
                <span onClick={() => toggleTrack(t)} className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border cursor-pointer transition-colors" style={{ background: on ? meta.color : 'transparent', borderColor: on ? meta.color : 'var(--border-default)' }}>
                  {on && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>}
                </span>
                <span className="text-[13px] text-[var(--text-body)] font-medium">{meta.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-[12px] font-bold uppercase tracking-[0.10em] mb-3" style={{ color: 'var(--text-muted)' }}>{t('catalog_level')}</div>
        <div className="flex flex-col gap-2">
          {LEVELS.map(l => {
            const on = levels.includes(l);
            return (
              <label key={l} className="flex items-center gap-2.5 cursor-pointer">
                <span onClick={() => toggleLevel(l)} className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border cursor-pointer transition-colors" style={{ background: on ? '#6366F1' : 'transparent', borderColor: on ? '#6366F1' : 'var(--border-default)' }}>
                  {on && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>}
                </span>
                <span className="text-[13px] text-[var(--text-body)] font-medium">{LEVEL_LABELS[l]}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-[12px] font-bold uppercase tracking-[0.10em] mb-3" style={{ color: 'var(--text-muted)' }}>{t('catalog_price')}</div>
        <div className="flex gap-2">
          {(['all', 'free', 'paid'] as const).map(p => (
            <button key={p} onClick={() => setPriceFilter(p)} className="px-3 py-1.5 rounded-pill text-[12px] font-semibold cursor-pointer transition-all border" style={{ background: priceFilter === p ? '#6366F1' : 'transparent', color: priceFilter === p ? '#fff' : 'var(--text-muted)', borderColor: priceFilter === p ? '#6366F1' : 'var(--border-default)' }}>
              {PRICE_LABELS[p]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background: 'var(--surface-page)', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="mx-auto px-5 sm:px-8 py-10" style={{ maxWidth: 'var(--container-max)' }}>
          <h1 className="text-[32px] font-bold text-[var(--text-strong)] m-0 mb-2" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            {t('catalog_title')}
          </h1>
          <p className="text-[15px] text-[var(--text-muted)] m-0">{t('catalog_subtitle').replace('{count}', String(courses.length))}</p>

          <div className="flex items-center gap-3 mt-5 max-w-xl">
            <div className="flex-1 flex items-center gap-2.5 h-11 px-4 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}>
              <Search size={16} color="var(--text-muted)" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t('catalog_search_placeholder')} className="flex-1 bg-transparent border-none outline-none text-[14px] text-[var(--text-strong)] placeholder:text-[var(--text-muted)]" />
              {query && (
                <button onClick={() => setQuery('')} className="text-[var(--text-muted)] hover:text-[var(--text-body)] cursor-pointer bg-transparent border-none"><X size={14} /></button>
              )}
            </div>
            <Button variant="secondary" size="sm" iconLeft={<SlidersHorizontal size={14} />} className="md:hidden" onClick={() => setMobileFilters(true)}>
              {t('catalog_filters')} {hasFilters ? `(${tracks.length + levels.length + (priceFilter !== 'all' ? 1 : 0)})` : ''}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto px-5 sm:px-8 py-10" style={{ maxWidth: 'var(--container-max)' }}>
        <div className="flex gap-6 lg:gap-8 items-start">
          <div className="hidden md:block flex-shrink-0 sticky top-20" style={{ width: 240 }}>
            <div className="p-5 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
              <FilterPanel />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <span className="text-[13px] text-[var(--text-muted)]">
                <strong className="text-[var(--text-strong)]">{filtered.length}</strong> {t('catalog_found')}
              </span>
              <select value={sort} onChange={e => setSort(e.target.value)} className="h-9 px-3 rounded-lg text-[13px] font-semibold border cursor-pointer" style={{ background: 'var(--surface-card)', color: 'var(--text-body)', borderColor: 'var(--border-default)', outline: 'none' }}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <div className="text-[18px] font-semibold text-[var(--text-strong)] mb-2">{t('catalog_empty_title')}</div>
                <div className="text-[14px] text-[var(--text-muted)] mb-5">{t('catalog_empty_desc')}</div>
                <Button variant="secondary" size="sm" onClick={() => { setTracks([]); setLevels([]); setPriceFilter('all'); setQuery(''); }}>{t('catalog_clear')}</Button>
              </div>
            ) : (
              <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {filtered.map(course => (
                  <Link key={course.id} href={`/courses/${course.id}`} className="no-underline">
                    <CourseCard course={course} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileFilters && (
        <div className="fixed inset-0 z-50 flex" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setMobileFilters(false)}>
          <div className="mt-auto w-full rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <span className="text-[16px] font-bold text-[var(--text-strong)]">{t('catalog_filters')}</span>
              <button onClick={() => setMobileFilters(false)} className="text-[var(--text-muted)] cursor-pointer bg-transparent border-none"><X size={20} /></button>
            </div>
            <FilterPanel />
            <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <Button variant="primary" size="md" fullWidth onClick={() => setMobileFilters(false)}>{t('catalog_show').replace('{count}', String(filtered.length))}</Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
