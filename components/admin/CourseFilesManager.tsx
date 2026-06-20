'use client';
import { useState } from 'react';
import { Plus, Trash2, FileArchive } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ResourceFileUploader } from '@/components/admin/FileUploader';
import { addCourseResourceAction, deleteCourseResourceAction } from '@/app/actions/admin';

type CFile = { id: string; title: string; fileLabel: string };

export function CourseFilesManager({ courseSlug, files }: { courseSlug: string; files: CFile[] }) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-bold text-[var(--text-strong)] m-0" style={{ fontFamily: 'var(--font-display)' }}>Course files ({files.length})</h2>
          <p className="text-[12px] text-[var(--text-muted)] m-0 mt-0.5">Attached files enrolled students can download (ZIP, PDF, starter projects…).</p>
        </div>
        <Button variant="secondary" size="sm" iconLeft={<Plus size={14} />} onClick={() => setAdding((a) => !a)} className="flex-shrink-0">Add file</Button>
      </div>

      {adding && (
        <form action={(fd) => { addCourseResourceAction(courseSlug, fd); setAdding(false); }} className="flex flex-col gap-3 p-4 rounded-lg" style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-subtle)' }}>
          <div>
            <label className="text-[12px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-1.5 block">File title</label>
            <input name="title" required placeholder="e.g. Starter project (ZIP)" className="w-full h-10 px-3 rounded-md text-[14px] outline-none" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', color: 'var(--text-strong)' }} />
          </div>
          <ResourceFileUploader />
          <div className="flex gap-2">
            <Button variant="primary" size="sm" type="submit">Add file</Button>
            <button type="button" onClick={() => setAdding(false)} className="text-[13px] text-[var(--text-muted)] px-3">Cancel</button>
          </div>
        </form>
      )}

      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
        {files.length === 0 && <div className="p-6 text-center text-[13px] text-[var(--text-muted)]">No files yet. Add ZIPs, PDFs or starter projects students get on enrollment.</div>}
        {files.map((f, i) => (
          <div key={f.id} className="flex items-center gap-3 px-4 py-3 text-[13px]" style={{ borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
            <span className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}><FileArchive size={16} /></span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[var(--text-body)] truncate">{f.title}</div>
              <div className="text-[11px] text-[var(--text-muted)] font-mono">{f.fileLabel || '—'}</div>
            </div>
            <form action={deleteCourseResourceAction.bind(null, f.id, courseSlug)}>
              <button type="submit" className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-[var(--surface-raised)]" style={{ color: '#F87171' }} aria-label="Delete file"><Trash2 size={14} /></button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
