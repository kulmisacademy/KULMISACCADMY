'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Plus, Edit3, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RESOURCE_TYPES } from '@/components/ResourceCard';
import { deleteResourceAction } from '@/app/actions/admin';
import type { ResourceView } from '@/lib/queries';

export function AdminResourcesClient({ resources }: { resources: ResourceView[] }) {
  const [search, setSearch] = useState('');
  const filtered = resources.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 sm:p-7 flex flex-col gap-6" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-[var(--text-strong)] m-0 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Resources</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-1 m-0">{resources.length} resources · sell PRDs, prompts, eBooks &amp; more</p>
        </div>
        <div className="sm:ml-auto flex items-center gap-3">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search resources..." className="h-9 px-3 rounded-md text-[13px] outline-none flex-1 sm:w-52 sm:flex-none min-w-0" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-body)' }} />
          <Link href="/admin/resources/new" className="flex-shrink-0"><Button variant="primary" size="sm" iconLeft={<Plus size={14} />}>New resource</Button></Link>
        </div>
      </div>

      <div className="rounded-lg overflow-x-auto" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
        <table className="w-full text-[13px]" style={{ borderCollapse: 'collapse', minWidth: 680 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-default)', background: 'var(--surface-raised)' }}>
              {['Resource', 'Type', 'Price', 'Downloads', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const meta = RESOURCE_TYPES[r.type] ?? RESOURCE_TYPES.other;
              return (
                <tr key={r.id} className="transition-colors hover:bg-[var(--surface-raised)]" style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <td className="px-4 py-3.5">
                    <Link href={`/admin/resources/${r.id}`} className="font-semibold text-[var(--text-body)] max-w-[300px] truncate block no-underline hover:text-[#818CF8]">{r.title}</Link>
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{r.fileLabel || '—'}</div>
                  </td>
                  <td className="px-4 py-3.5"><span className="px-2 py-0.5 rounded-pill text-[11px] font-bold text-white" style={{ background: meta.color }}>{meta.label}</span></td>
                  <td className="px-4 py-3.5 font-mono font-bold text-[var(--text-body)]">{r.isFree ? <Badge variant="free">Free</Badge> : r.price}</td>
                  <td className="px-4 py-3.5 font-mono text-[var(--text-muted)]">{r.downloads}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <Link href={`/resources/${r.id}`} target="_blank" className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-[var(--surface-raised)]" style={{ color: 'var(--text-muted)' }} title="View"><Eye size={15} /></Link>
                      <Link href={`/admin/resources/${r.id}`} className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-[var(--surface-raised)]" style={{ color: '#818CF8' }} title="Edit"><Edit3 size={15} /></Link>
                      <form action={deleteResourceAction.bind(null, r.id)}>
                        <button type="submit" className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-[var(--surface-raised)]" style={{ color: '#F87171' }} title="Delete"><Trash2 size={15} /></button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-[var(--text-muted)] text-[13px]">No resources found</div>}
      </div>
    </div>
  );
}
