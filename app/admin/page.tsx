import { Users, BookOpen, Award, GraduationCap } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { getAdminStats, getAdminCourses, getAdminUsers, getInstructors } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [stats, courses, users, instructors] = await Promise.all([
    getAdminStats(), getAdminCourses(), getAdminUsers(), getInstructors(),
  ]);

  const STATS = [
    { label: 'Total users', value: stats.users.toLocaleString(), icon: Users, bg: 'rgba(99,102,241,0.12)', fg: '#818CF8' },
    { label: 'Active courses', value: String(stats.courses), icon: BookOpen, bg: 'rgba(34,211,238,0.10)', fg: '#22D3EE' },
    { label: 'Certificates', value: String(stats.certificates), icon: Award, bg: 'rgba(16,185,129,0.10)', fg: '#10B981' },
    { label: 'Instructors', value: String(instructors.length), icon: GraduationCap, bg: 'rgba(245,158,11,0.10)', fg: '#F59E0B' },
  ];

  const topCourses = courses.slice(0, 5);
  const recentUsers = users.slice(0, 5);
  const maxReviews = Math.max(1, ...topCourses.map((c) => c.reviews));

  return (
    <div className="p-4 sm:p-7 flex flex-col gap-7" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div>
        <h1 className="text-[26px] font-bold text-[var(--text-strong)] m-0 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Admin Dashboard</h1>
        <p className="text-[13px] text-[var(--text-muted)] mt-1 m-0">Overview of Kulmis Academy performance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="flex items-center gap-3.5 p-5 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
            <span className="w-11 h-11 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: s.bg, color: s.fg }}><s.icon size={20} /></span>
            <div>
              <div className="text-[24px] font-bold leading-none text-[var(--text-strong)]" style={{ fontFamily: 'var(--font-display)' }}>{s.value}</div>
              <div className="text-[11px] text-[var(--text-subtle)] mt-1.5">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_340px]">
        <div className="p-6 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 className="text-[16px] font-bold text-[var(--text-strong)] m-0 mb-5" style={{ fontFamily: 'var(--font-display)' }}>Top courses by reviews</h2>
          <div className="flex flex-col">
            {topCourses.map((c, i) => (
              <div key={c.id} className="flex items-center gap-4 py-3.5" style={{ borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
                <span className="text-[12px] font-mono font-bold text-[var(--text-subtle)] w-5 flex-shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-[var(--text-body)] truncate">{c.title}</div>
                  <div className="text-[11px] text-[var(--text-muted)] capitalize">{c.track}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 rounded-full bg-[var(--neutral-200)] overflow-hidden">
                    <div className="h-full rounded-full bg-[#6366F1]" style={{ width: `${(c.reviews / maxReviews) * 100}%` }} />
                  </div>
                  <span className="text-[12px] font-mono font-bold text-[var(--text-muted)] w-10 text-right">{c.reviews}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 className="text-[16px] font-bold text-[var(--text-strong)] m-0 mb-5" style={{ fontFamily: 'var(--font-display)' }}>Recent signups</h2>
          <div className="flex flex-col">
            {recentUsers.map((u, i) => (
              <div key={u.id} className="flex items-center gap-3 py-3" style={{ borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
                <Avatar name={u.name} size={32} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-[var(--text-body)] truncate">{u.name}</div>
                  <div className="text-[11px] text-[var(--text-muted)] truncate">{u.email}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={u.plan === 'pro' ? 'pro' : 'free'}>{u.plan}</Badge>
                  <span className="text-[10px] font-mono text-[var(--text-subtle)]">{u.joined}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
        <h2 className="text-[16px] font-bold text-[var(--text-strong)] m-0 mb-5" style={{ fontFamily: 'var(--font-display)' }}>Instructors</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]" style={{ borderCollapse: 'collapse', minWidth: 520 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                {['Instructor', 'Students', 'Courses', 'Rating', 'Status'].map((h) => (
                  <th key={h} className="pb-2.5 text-left font-semibold text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-subtle)', paddingRight: 16 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {instructors.map((ins, i) => (
                <tr key={ins.id} style={{ borderBottom: i < instructors.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <td className="py-3.5" style={{ paddingRight: 16 }}>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={ins.name} size={32} />
                      <div>
                        <div className="font-semibold text-[var(--text-body)]">{ins.name}</div>
                        <div className="text-[11px] text-[var(--text-muted)]">{ins.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 font-mono text-[var(--text-body)]" style={{ paddingRight: 16 }}>{ins.students.toLocaleString()}</td>
                  <td className="py-3.5 font-mono text-[var(--text-muted)]" style={{ paddingRight: 16 }}>{ins.courseCount}</td>
                  <td className="py-3.5 font-mono text-[#F59E0B]" style={{ paddingRight: 16 }}>★ {ins.rating}</td>
                  <td className="py-3.5"><Badge variant="success">Active</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
