'use client';
import { useState, useTransition } from 'react';
import { UserPlus, Trash2, BookOpen, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import {
  deleteUserAction, setUserRoleAction,
  adminEnrollUserAction, adminUnenrollUserAction, getUserEnrollmentIds,
} from '@/app/actions/admin';

type AdminUser = { id: string; name: string; email: string; role: string; plan: string; joined: string };
type Course    = { id: string; title: string; price: string };

export function AdminUsersClient({ users, courses }: { users: AdminUser[]; courses: Course[] }) {
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [, startTransition]         = useTransition();

  // Enrollment modal state
  const [modalUser, setModalUser]         = useState<AdminUser | null>(null);
  const [enrolledIds, setEnrolledIds]     = useState<string[]>([]);
  const [modalLoading, setModalLoading]   = useState(false);
  const [toggling, setToggling]           = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      && (roleFilter === 'all' || u.role === roleFilter);
  });

  async function openModal(user: AdminUser) {
    setModalUser(user);
    setModalLoading(true);
    const ids = await getUserEnrollmentIds(user.id);
    setEnrolledIds(ids);
    setModalLoading(false);
  }

  async function toggleEnroll(courseId: string) {
    if (!modalUser || toggling) return;
    setToggling(courseId);
    const enrolled = enrolledIds.includes(courseId);
    // Optimistic update — respond immediately, confirm with server after
    if (enrolled) {
      setEnrolledIds(prev => prev.filter(id => id !== courseId));
      await adminUnenrollUserAction(modalUser.id, courseId);
    } else {
      setEnrolledIds(prev => [...prev, courseId]);
      await adminEnrollUserAction(modalUser.id, courseId);
    }
    setToggling(null);
  }

  return (
    <div className="p-4 sm:p-7 flex flex-col gap-6" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-[26px] font-bold text-[var(--text-strong)] m-0 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Users</h1>
            <p className="text-[13px] text-[var(--text-muted)] mt-1 m-0">{users.length} users registered</p>
          </div>
          <Button variant="primary" size="sm" iconLeft={<UserPlus size={14} />} className="ml-auto flex-shrink-0">Invite user</Button>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex rounded-md overflow-x-auto" style={{ border: '1px solid var(--border-subtle)' }}>
            {['all', 'student', 'instructor', 'admin'].map((r) => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className="px-3 py-1.5 text-[12px] font-semibold cursor-pointer border-none capitalize transition-colors flex-shrink-0"
                style={{ background: roleFilter === r ? '#6366F1' : 'var(--surface-card)', color: roleFilter === r ? '#fff' : 'var(--text-muted)' }}>
                {r}
              </button>
            ))}
          </div>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="h-9 px-3 rounded-md text-[13px] outline-none sm:w-48 sm:ml-auto"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-body)' }} />
        </div>
      </div>

      <div className="rounded-lg overflow-x-auto" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
        <table className="w-full text-[13px]" style={{ borderCollapse: 'collapse', minWidth: 720 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-default)', background: 'var(--surface-raised)' }}>
              {['User', 'Role', 'Plan', 'Joined', 'Courses', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-subtle)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={u.id} className="transition-colors hover:bg-[var(--surface-raised)]"
                style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} size={34} status={u.plan === 'pro' ? 'online' : undefined} />
                    <div>
                      <div className="font-semibold text-[var(--text-body)]">{u.name}</div>
                      <div className="text-[11px] text-[var(--text-muted)]">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <select defaultValue={u.role}
                    onChange={(e) => { const role = e.target.value as 'student'|'instructor'|'admin'; startTransition(() => { setUserRoleAction(u.id, role); }); }}
                    className="h-8 px-2 rounded-md text-[12px] font-semibold capitalize cursor-pointer outline-none"
                    style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-subtle)', color: 'var(--text-body)' }}>
                    <option value="student">student</option>
                    <option value="instructor">instructor</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="px-4 py-3.5"><Badge variant={u.plan === 'pro' ? 'pro' : 'free'}>{u.plan}</Badge></td>
                <td className="px-4 py-3.5 text-[var(--text-muted)]">{u.joined}</td>
                <td className="px-4 py-3.5">
                  <button onClick={() => openModal(u)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
                    style={{ background: 'rgba(99,102,241,0.1)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.2)' }}
                    title="Manage course access">
                    <BookOpen size={13} /> Manage
                  </button>
                </td>
                <td className="px-4 py-3.5">
                  <form action={deleteUserAction.bind(null, u.id)}>
                    <button type="submit" className="w-8 h-8 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--surface-raised)]" style={{ color: '#F87171' }} title="Remove user"><Trash2 size={15} /></button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-[var(--text-muted)] text-[13px]">No users found</div>}
      </div>

      {/* ── Enrollment modal ── */}
      {modalUser && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
          style={{ background: 'rgba(2,2,8,0.45)', backdropFilter: 'blur(8px)' }}
          onClick={() => setModalUser(null)}>
          <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-2xl)', maxHeight: '85vh' }}
            onClick={e => e.stopPropagation()}>

            {/* Drag handle (mobile) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
              <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border-default)' }} />
            </div>

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
              <Avatar name={modalUser.name} size={36} />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[var(--text-strong)] text-[14px] truncate">{modalUser.name}</div>
                <div className="text-[11px] text-[var(--text-muted)] truncate">{modalUser.email}</div>
              </div>
              <button onClick={() => setModalUser(null)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--surface-raised)]" style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            {/* Sub-heading */}
            <div className="px-5 py-2.5" style={{ borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
              <p className="text-[12px] text-[var(--text-muted)] m-0">
                Tap a course to grant or revoke access instantly.
              </p>
            </div>

            {/* Course list */}
            <div className="overflow-y-auto flex-1">
              {modalLoading ? (
                <div className="flex items-center justify-center py-12 gap-2 text-[13px] text-[var(--text-muted)]">
                  <Loader2 size={16} className="animate-spin" /> Loading…
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-10 text-[13px] text-[var(--text-muted)]">No courses yet</div>
              ) : (
                courses.map((c, i) => {
                  const enrolled = enrolledIds.includes(c.id);
                  return (
                    <button key={c.id} onClick={() => toggleEnroll(c.id)}
                      className="w-full flex items-center gap-3 px-5 py-4 text-left transition-all"
                      style={{ borderTop: i ? '1px solid var(--border-subtle)' : 'none', background: enrolled ? 'rgba(16,185,129,0.05)' : 'transparent', border: 'none', cursor: 'pointer' }}
                      onMouseEnter={e => !enrolled && ((e.currentTarget as HTMLElement).style.background = 'var(--surface-raised)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = enrolled ? 'rgba(16,185,129,0.05)' : 'transparent')}>
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                        style={{ background: enrolled ? '#10B981' : 'var(--surface-raised)', border: enrolled ? '2px solid #10B981' : '2px solid var(--border-default)' }}>
                        {enrolled && <Check size={13} color="#fff" strokeWidth={3} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-[var(--text-body)] truncate">{c.title}</div>
                        <div className="text-[11px] font-semibold mt-0.5" style={{ color: enrolled ? '#10B981' : 'var(--text-muted)' }}>
                          {enrolled ? '✓ Access granted' : c.price}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 flex justify-end" style={{ borderTop: '1px solid var(--border-subtle)', flexShrink: 0 }}>
              <button onClick={() => setModalUser(null)}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors hover:bg-[var(--surface-raised)]"
                style={{ color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', background: 'transparent', cursor: 'pointer' }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
