'use client';
import { useState } from 'react';
import { UserCheck, Plus, Pencil, Trash2, X, Star, Users, BookOpen } from 'lucide-react';
import { createInstructor, updateInstructor, deleteInstructor } from '@/app/actions/admin';

type Instructor = { id: string; slug: string; name: string; title: string; bio: string; rating: number; students: number; courseCount: number };

const inputCls = 'w-full h-10 px-3 rounded-lg text-[13px] outline-none';
const inputStyle = { background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', color: 'var(--text-strong)' };
const labelCls = 'block text-[11px] font-bold uppercase tracking-wide mb-1.5 text-[var(--text-muted)]';

function InstructorForm({ defaults, onClose, action }: {
  defaults?: Partial<Instructor>;
  onClose: () => void;
  action: (fd: FormData) => Promise<void>;
}) {
  const [pending, setPending] = useState(false);
  async function submit(fd: FormData) {
    setPending(true);
    await action(fd);
    setPending(false);
    onClose();
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-lg rounded-2xl p-6 flex flex-col gap-4" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-[var(--text-strong)]">{defaults?.id ? 'Edit Instructor' : 'New Instructor'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: 'var(--text-muted)', background: 'var(--surface-page)' }}><X size={16} /></button>
        </div>
        <form action={submit} className="flex flex-col gap-4">
          {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Full Name *</label>
              <input name="name" required defaultValue={defaults?.name} placeholder="e.g. Amina Yusuf" className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className={labelCls}>Title *</label>
              <input name="title" required defaultValue={defaults?.title} placeholder="e.g. Senior Engineer" className={inputCls} style={inputStyle} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Bio</label>
            <textarea name="bio" defaultValue={defaults?.bio} rows={3} placeholder="Short description about the instructor…" className="w-full p-3 rounded-lg text-[13px] outline-none resize-y" style={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Rating (0–5)</label>
              <input name="rating" type="number" min="0" max="5" step="0.1" defaultValue={defaults?.rating ?? 0} className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className={labelCls}>Total Students</label>
              <input name="students" type="number" min="0" defaultValue={defaults?.students ?? 0} className={inputCls} style={inputStyle} />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-semibold" style={{ background: 'var(--surface-page)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>Cancel</button>
            <button type="submit" disabled={pending} className="px-5 py-2 rounded-lg text-[13px] font-bold text-white" style={{ background: pending ? 'rgba(99,102,241,0.5)' : '#6366F1' }}>
              {pending ? 'Saving…' : (defaults?.id ? 'Save changes' : 'Create instructor')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminInstructorsClient({ instructors }: { instructors: Instructor[] }) {
  const [list, setList] = useState<Instructor[]>(instructors);
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState<Instructor | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleCreate(fd: FormData) {
    await createInstructor(fd);
    window.location.reload();
  }

  async function handleUpdate(fd: FormData) {
    await updateInstructor(fd);
    window.location.reload();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    await deleteInstructor(id);
    setList(l => l.filter(i => i.id !== id));
    setDeleting(null);
  }

  return (
    <div className="p-4 sm:p-7" style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-bold text-[var(--text-strong)] m-0" style={{ fontFamily: 'var(--font-display)' }}>Instructors</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-1 mb-0">{list.length} instructor{list.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold text-white" style={{ background: 'linear-gradient(135deg,#4338CA,#6366F1)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>
          <Plus size={15} /> Add Instructor
        </button>
      </div>

      {/* Empty state */}
      {list.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl" style={{ border: '2px dashed var(--border-subtle)' }}>
          <UserCheck size={40} style={{ color: 'var(--text-subtle)', marginBottom: 14 }} />
          <p className="text-[15px] font-semibold text-[var(--text-muted)] m-0">No instructors yet</p>
          <p className="text-[13px] text-[var(--text-subtle)] mt-1 mb-4">Add your first instructor to assign them to courses.</p>
          <button onClick={() => setShowNew(true)} className="px-4 py-2 rounded-xl text-[13px] font-bold text-white" style={{ background: '#6366F1' }}>
            <Plus size={14} className="inline mr-1" />Add Instructor
          </button>
        </div>
      )}

      {/* List */}
      <div className="flex flex-col gap-3">
        {list.map(ins => (
          <div key={ins.id} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-[16px] font-bold text-white" style={{ background: 'linear-gradient(135deg,#4338CA,#6366F1)' }}>
              {ins.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-bold text-[var(--text-strong)] truncate">{ins.name}</div>
              <div className="text-[12px] text-[var(--text-muted)] truncate">{ins.title}</div>
              {ins.bio && <div className="text-[11px] text-[var(--text-subtle)] truncate mt-0.5">{ins.bio}</div>}
            </div>
            {/* Stats */}
            <div className="hidden sm:flex items-center gap-5 flex-shrink-0">
              <div className="text-center">
                <div className="flex items-center gap-1 text-[12px] font-bold text-[var(--text-strong)]"><Star size={11} className="text-yellow-400" />{ins.rating.toFixed(1)}</div>
                <div className="text-[10px] text-[var(--text-muted)]">rating</div>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-[12px] font-bold text-[var(--text-strong)]"><Users size={11} />{ins.students.toLocaleString()}</div>
                <div className="text-[10px] text-[var(--text-muted)]">students</div>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-[12px] font-bold text-[var(--text-strong)]"><BookOpen size={11} />{ins.courseCount}</div>
                <div className="text-[10px] text-[var(--text-muted)]">courses</div>
              </div>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => setEditing(ins)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ background: 'var(--surface-page)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }} title="Edit">
                <Pencil size={14} />
              </button>
              <button onClick={() => handleDelete(ins.id, ins.name)} disabled={deleting === ins.id} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ background: 'rgba(239,68,68,0.08)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }} title="Delete">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {showNew && <InstructorForm action={handleCreate} onClose={() => setShowNew(false)} />}
      {editing && <InstructorForm defaults={editing} action={handleUpdate} onClose={() => setEditing(null)} />}
    </div>
  );
}
