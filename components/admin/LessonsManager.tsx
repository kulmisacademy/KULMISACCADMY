'use client';
import { useState } from 'react';
import { Plus, Trash2, Pencil, X, Play, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createLessonAction, updateLessonAction, deleteLessonAction } from '@/app/actions/admin';

type Lesson = { id: string; section: string; title: string; duration: string; videoUrl: string | null; isFree: boolean };

const inputCls = 'h-9 px-3 rounded-md text-[13px] outline-none';
const inputStyle = { background: 'var(--surface-page)', border: '1px solid var(--border-default)', color: 'var(--text-strong)' } as const;

export function LessonsManager({ courseSlug, lessons }: { courseSlug: string; lessons: Lesson[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-[var(--text-strong)] m-0" style={{ fontFamily: 'var(--font-display)' }}>Lessons ({lessons.length})</h2>
        <Button variant="secondary" size="sm" iconLeft={<Plus size={14} />} onClick={() => { setAdding((a) => !a); setEditing(null); }}>Add lesson</Button>
      </div>

      {adding && (
        <form action={(fd) => { createLessonAction(courseSlug, fd); setAdding(false); }} className="flex flex-col gap-2.5 p-4 rounded-lg" style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-subtle)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input name="section" placeholder="Section name (e.g. Introduction, Lesson 1)" className={inputCls} style={inputStyle} />
            <input name="title" required placeholder="Lesson title" className={inputCls} style={inputStyle} />
            <input name="duration" placeholder="Duration (e.g. 8:30)" className={inputCls} style={inputStyle} />
            <input name="videoUrl" placeholder="YouTube or Vimeo URL" className={inputCls} style={inputStyle} />
          </div>
          <label className="flex items-center gap-2 text-[13px] text-[var(--text-body)]"><input type="checkbox" name="isFree" /> Free preview</label>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" type="submit">Add lesson</Button>
            <button type="button" onClick={() => setAdding(false)} className="text-[13px] text-[var(--text-muted)] px-3">Cancel</button>
          </div>
        </form>
      )}

      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
        {lessons.length === 0 && <div className="p-6 text-center text-[13px] text-[var(--text-muted)]">No lessons yet. Add your first lesson above.</div>}
        {lessons.map((l, i) => (
          editing === l.id ? (
            <form key={l.id} action={(fd) => { updateLessonAction(l.id, courseSlug, fd); setEditing(null); }} className="flex flex-col gap-2.5 p-4" style={{ borderTop: i ? '1px solid var(--border-subtle)' : 'none', background: 'var(--surface-raised)' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input name="section" defaultValue={l.section} placeholder="Section" className={inputCls} style={inputStyle} />
                <input name="title" required defaultValue={l.title} placeholder="Lesson title" className={inputCls} style={inputStyle} />
                <input name="duration" defaultValue={l.duration} placeholder="Duration" className={inputCls} style={inputStyle} />
                <input name="videoUrl" defaultValue={l.videoUrl ?? ''} placeholder="YouTube or Vimeo URL" className={inputCls} style={inputStyle} />
              </div>
              <label className="flex items-center gap-2 text-[13px] text-[var(--text-body)]"><input type="checkbox" name="isFree" defaultChecked={l.isFree} /> Free preview</label>
              <div className="flex gap-2">
                <Button variant="primary" size="sm" type="submit" iconLeft={<Check size={13} />}>Save</Button>
                <button type="button" onClick={() => setEditing(null)} className="text-[13px] text-[var(--text-muted)] px-3 flex items-center gap-1"><X size={13} /> Cancel</button>
              </div>
            </form>
          ) : (
            <div key={l.id} className="flex items-center gap-3 px-4 py-3 text-[13px]" style={{ borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
              <Play size={13} color="var(--text-muted)" className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[var(--text-body)] truncate">{l.title}</div>
                <div className="text-[11px] text-[var(--text-muted)]">{l.section}{l.duration ? ` · ${l.duration}` : ''}{l.isFree ? ' · FREE' : ''}{l.videoUrl ? '' : ' · ⚠ no video'}</div>
              </div>
              <button onClick={() => { setEditing(l.id); setAdding(false); }} className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-[var(--surface-raised)]" style={{ color: 'var(--text-muted)' }} aria-label="Edit lesson"><Pencil size={14} /></button>
              <form action={deleteLessonAction.bind(null, l.id, courseSlug)}>
                <button type="submit" className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-[var(--surface-raised)]" style={{ color: '#F87171' }} aria-label="Delete lesson"><Trash2 size={14} /></button>
              </form>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
