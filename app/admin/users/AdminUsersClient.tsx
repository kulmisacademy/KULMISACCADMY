'use client';
import { useState, useTransition } from 'react';
import { UserPlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { deleteUserAction, setUserRoleAction } from '@/app/actions/admin';

type AdminUser = { id: string; name: string; email: string; role: string; plan: string; joined: string };

export function AdminUsersClient({ users }: { users: AdminUser[] }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [, startTransition] = useTransition();

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

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
              <button key={r} onClick={() => setRoleFilter(r)} className="px-3 py-1.5 text-[12px] font-semibold cursor-pointer border-none capitalize transition-colors flex-shrink-0" style={{ background: roleFilter === r ? '#6366F1' : 'var(--surface-card)', color: roleFilter === r ? '#fff' : 'var(--text-muted)' }}>
                {r}
              </button>
            ))}
          </div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="h-9 px-3 rounded-md text-[13px] outline-none sm:w-48 sm:ml-auto" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-body)' }} />
        </div>
      </div>

      <div className="rounded-lg overflow-x-auto" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
        <table className="w-full text-[13px]" style={{ borderCollapse: 'collapse', minWidth: 680 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-default)', background: 'var(--surface-raised)' }}>
              {['User', 'Role', 'Plan', 'Joined', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-subtle)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={u.id} className="transition-colors hover:bg-[var(--surface-raised)]" style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
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
                  <select
                    defaultValue={u.role}
                    onChange={(e) => { const role = e.target.value as 'student' | 'instructor' | 'admin'; startTransition(() => { setUserRoleAction(u.id, role); }); }}
                    className="h-8 px-2 rounded-md text-[12px] font-semibold capitalize cursor-pointer outline-none"
                    style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-subtle)', color: 'var(--text-body)' }}
                  >
                    <option value="student">student</option>
                    <option value="instructor">instructor</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="px-4 py-3.5"><Badge variant={u.plan === 'pro' ? 'pro' : 'free'}>{u.plan}</Badge></td>
                <td className="px-4 py-3.5 text-[var(--text-muted)]">{u.joined}</td>
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
    </div>
  );
}
