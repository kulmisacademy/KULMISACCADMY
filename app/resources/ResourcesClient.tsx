'use client';
import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ResourceCard, RESOURCE_TYPES } from '@/components/ResourceCard';
import type { ResourceView } from '@/lib/queries';

const FILTERS = [
  { v: 'all', l: 'All' },
  { v: 'free', l: 'Free' },
  { v: 'paid', l: 'Paid' },
  ...Object.entries(RESOURCE_TYPES).map(([v, m]) => ({ v, l: m.label })),
];

export function ResourcesClient({ resources }: { resources: ResourceView[] }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      if (query && !r.title.toLowerCase().includes(query.toLowerCase()) && !r.description.toLowerCase().includes(query.toLowerCase())) return false;
      if (filter === 'free') return r.isFree;
      if (filter === 'paid') return !r.isFree;
      if (filter !== 'all') return r.type === filter;
      return true;
    });
  }, [resources, query, filter]);

  return (
    <div style={{ background: 'var(--surface-page)', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="mx-auto px-5 sm:px-8 py-12" style={{ maxWidth: 'var(--container-max)' }}>
          <div className="text-[12px] font-bold uppercase tracking-[0.10em] mb-2.5" style={{ color: '#818CF8' }}>Resources</div>
          <h1 className="text-[34px] font-bold text-[var(--text-strong)] m-0 mb-2" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            Templates, prompts &amp; downloads
          </h1>
          <p className="text-[15px] text-[var(--text-muted)] m-0 max-w-2xl">PRDs, ready-made prompt packs, system prompts, eBooks and Notion kits — download free ones instantly, unlock premium ones with WaafiPay.</p>

          <div className="flex items-center gap-3 mt-6 max-w-xl">
            <div className="flex-1 flex items-center gap-2.5 h-11 px-4 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}>
              <Search size={16} color="var(--text-muted)" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search resources..." className="flex-1 bg-transparent border-none outline-none text-[14px] text-[var(--text-strong)] placeholder:text-[var(--text-muted)]" />
              {query && <button onClick={() => setQuery('')} className="text-[var(--text-muted)] bg-transparent border-none cursor-pointer"><X size={14} /></button>}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {FILTERS.map((f) => (
              <button key={f.v} onClick={() => setFilter(f.v)} className="px-3 py-1.5 rounded-pill text-[12px] font-semibold cursor-pointer transition-all border"
                style={{ background: filter === f.v ? '#6366F1' : 'transparent', color: filter === f.v ? '#fff' : 'var(--text-muted)', borderColor: filter === f.v ? '#6366F1' : 'var(--border-default)' }}>
                {f.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto px-5 sm:px-8 py-10" style={{ maxWidth: 'var(--container-max)' }}>
        <div className="text-[13px] text-[var(--text-muted)] mb-5"><strong className="text-[var(--text-strong)]">{filtered.length}</strong> resources</div>
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📦</div>
            <div className="text-[18px] font-semibold text-[var(--text-strong)] mb-2">No resources found</div>
            <div className="text-[14px] text-[var(--text-muted)]">Try a different search or filter</div>
          </div>
        ) : (
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {filtered.map((r) => <ResourceCard key={r.id} resource={r} />)}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
