import { TrendingUp, Users, BookOpen, DollarSign, Award, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import { getAnalytics } from '@/lib/queries';
import { TRACK_META } from '@/lib/data';
import { db, paymentLogs, users } from '@/lib/db';
import { desc, eq } from 'drizzle-orm';
import { ensureSchema } from '@/lib/db/migrate';

export const dynamic = 'force-dynamic';

const fmt = (n: number) => n.toLocaleString();

export default async function AnalyticsPage() {
  await ensureSchema();
  const a = await getAnalytics();

  // Payment logs (last 50)
  let payments: { id: string; reference: string; type: string; targetId: string | null; phone: string; amount: number; status: string; transactionId: string | null; errorMsg: string | null; createdAt: Date; userName: string }[] = [];
  try {
    const rows = await db.select({
      id: paymentLogs.id,
      reference: paymentLogs.reference,
      type: paymentLogs.type,
      targetId: paymentLogs.targetId,
      phone: paymentLogs.phone,
      amount: paymentLogs.amount,
      status: paymentLogs.status,
      transactionId: paymentLogs.transactionId,
      errorMsg: paymentLogs.errorMsg,
      createdAt: paymentLogs.createdAt,
      userName: users.name,
    }).from(paymentLogs)
      .leftJoin(users, eq(paymentLogs.userId, users.id))
      .orderBy(desc(paymentLogs.createdAt))
      .limit(50);
    payments = rows.map((r) => ({ ...r, userName: r.userName ?? 'Unknown' }));
  } catch { /* table not yet created — first load */ }
  const maxMonth = Math.max(1, ...a.months.map((m) => m.count));
  const maxTrack = Math.max(1, ...Object.values(a.byTrack));
  const maxCourse = Math.max(1, ...a.topCourses.map((c) => c.count));

  const cards = [
    { label: 'Revenue (est.)', value: `$${fmt(a.revenue)}`, icon: DollarSign, fg: '#10B981', bg: 'rgba(16,185,129,0.12)' },
    { label: 'Total enrollments', value: fmt(a.totalEnrollments), icon: BookOpen, fg: '#818CF8', bg: 'rgba(99,102,241,0.12)' },
    { label: 'Completions', value: fmt(a.completions), icon: Award, fg: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
    { label: 'Pro members', value: `${fmt(a.proUsers)} / ${fmt(a.users)}`, icon: Users, fg: '#22D3EE', bg: 'rgba(34,211,238,0.12)' },
  ];

  return (
    <div className="p-4 sm:p-7 flex flex-col gap-7" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div>
        <h1 className="text-[26px] font-bold text-[var(--text-strong)] m-0 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Analytics</h1>
        <p className="text-[13px] text-[var(--text-muted)] mt-1 m-0">Platform performance at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="flex items-center gap-3.5 p-5 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
            <span className="w-11 h-11 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: c.bg, color: c.fg }}><c.icon size={20} /></span>
            <div>
              <div className="text-[22px] font-bold leading-none text-[var(--text-strong)]" style={{ fontFamily: 'var(--font-display)' }}>{c.value}</div>
              <div className="text-[11px] text-[var(--text-subtle)] mt-1.5">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Signups chart */}
        <div className="p-6 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 className="text-[15px] font-bold text-[var(--text-strong)] m-0 mb-5 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}><TrendingUp size={16} color="#818CF8" /> Signups (last 6 months)</h2>
          <div className="flex items-end justify-between gap-3" style={{ height: 160 }}>
            {a.months.map((m) => (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[11px] font-mono font-bold text-[var(--text-muted)]">{m.count}</span>
                <div className="w-full rounded-t-md transition-all" style={{ height: `${(m.count / maxMonth) * 100}%`, minHeight: 4, background: 'linear-gradient(180deg, #818CF8, #6366F1)' }} />
                <span className="text-[11px] text-[var(--text-subtle)]">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Enrollments by track */}
        <div className="p-6 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 className="text-[15px] font-bold text-[var(--text-strong)] m-0 mb-5" style={{ fontFamily: 'var(--font-display)' }}>Enrollments by track</h2>
          <div className="flex flex-col gap-3.5">
            {Object.entries(a.byTrack).map(([track, count]) => {
              const meta = TRACK_META[track as keyof typeof TRACK_META];
              return (
                <div key={track} className="flex items-center gap-3">
                  <span className="text-[12px] text-[var(--text-body)] w-32 flex-shrink-0 capitalize">{meta?.label ?? track}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-[var(--neutral-200)] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(count / maxTrack) * 100}%`, background: meta?.color ?? '#6366F1' }} />
                  </div>
                  <span className="text-[12px] font-mono font-bold text-[var(--text-muted)] w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top courses */}
      <div className="p-6 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
        <h2 className="text-[15px] font-bold text-[var(--text-strong)] m-0 mb-5" style={{ fontFamily: 'var(--font-display)' }}>Top courses by enrollments</h2>
        {a.topCourses.length === 0 && <p className="text-[13px] text-[var(--text-muted)] m-0">No enrollments yet.</p>}
        <div className="flex flex-col gap-3.5">
          {a.topCourses.map((c, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-[12px] font-mono font-bold text-[var(--text-subtle)] w-5 flex-shrink-0">{i + 1}</span>
              <span className="text-[12px] text-[var(--text-body)] flex-1 min-w-0 truncate">{c.title}</span>
              <div className="w-40 h-2.5 rounded-full bg-[var(--neutral-200)] overflow-hidden">
                <div className="h-full rounded-full bg-[#6366F1]" style={{ width: `${(c.count / maxCourse) * 100}%` }} />
              </div>
              <span className="text-[12px] font-mono font-bold text-[var(--text-muted)] w-8 text-right">{c.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment transactions */}
      <div className="p-6 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
        <h2 className="text-[15px] font-bold text-[var(--text-strong)] m-0 mb-1 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
          <ShieldCheck size={16} color="#10B981" /> Payment Transactions
        </h2>
        <p className="text-[12px] text-[var(--text-muted)] m-0 mb-5">All WaafiPay attempts — approved and failed (last 50)</p>

        {payments.length === 0 ? (
          <p className="text-[13px] text-[var(--text-muted)] m-0">No payments recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {['Status', 'User', 'Type', 'Target', 'Phone', 'Amount', 'Reference', 'Time'].map((h) => (
                    <th key={h} className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td className="py-2.5 px-3">
                      {p.status === 'approved'
                        ? <span className="flex items-center gap-1 font-bold" style={{ color: '#10B981' }}><CheckCircle2 size={12} /> OK</span>
                        : <span className="flex items-center gap-1 font-bold" style={{ color: '#F87171' }}><XCircle size={12} /> Failed</span>}
                    </td>
                    <td className="py-2.5 px-3 text-[var(--text-body)] max-w-[120px] truncate">{p.userName}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full font-semibold text-[10px]" style={{
                        background: p.type === 'course' ? 'rgba(99,102,241,0.12)' : p.type === 'resource' ? 'rgba(16,185,129,0.12)' : p.type === 'ai_plan' ? 'rgba(34,211,238,0.12)' : 'rgba(245,158,11,0.12)',
                        color: p.type === 'course' ? '#818CF8' : p.type === 'resource' ? '#10B981' : p.type === 'ai_plan' ? '#22D3EE' : '#F59E0B',
                      }}>{p.type}</span>
                    </td>
                    <td className="py-2.5 px-3 text-[var(--text-muted)] max-w-[100px] truncate">{p.targetId ?? '—'}</td>
                    <td className="py-2.5 px-3 font-mono text-[var(--text-body)]">{p.phone}</td>
                    <td className="py-2.5 px-3 font-mono font-bold" style={{ color: '#10B981' }}>${p.amount.toFixed(2)}</td>
                    <td className="py-2.5 px-3 font-mono text-[var(--text-subtle)] max-w-[140px] truncate" title={p.transactionId ?? p.errorMsg ?? ''}>
                      {p.transactionId ? p.transactionId.slice(0, 14) + '…' : (p.errorMsg ? p.errorMsg.slice(0, 18) + '…' : '—')}
                    </td>
                    <td className="py-2.5 px-3 text-[var(--text-subtle)] whitespace-nowrap">{new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
