import { getCurrentUser } from '@/lib/auth';
import { getAdminStats } from '@/lib/queries';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Globe, CreditCard, Bell, Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
      <span className="text-[13px] text-[var(--text-muted)]">{label}</span>
      <span className="text-[13px] font-semibold text-[var(--text-body)]">{value}</span>
    </div>
  );
}

function Card({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="p-6 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
      <h2 className="text-[15px] font-bold text-[var(--text-strong)] m-0 mb-2 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}><Icon size={16} color="#818CF8" /> {title}</h2>
      {children}
    </div>
  );
}

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const stats = await getAdminStats();

  return (
    <div className="p-4 sm:p-7 flex flex-col gap-6" style={{ maxWidth: 820, margin: '0 auto' }}>
      <div>
        <h1 className="text-[26px] font-bold text-[var(--text-strong)] m-0 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Settings</h1>
        <p className="text-[13px] text-[var(--text-muted)] mt-1 m-0">Manage your account and platform configuration</p>
      </div>

      <Card title="Account" icon={Shield}>
        <div className="flex items-center gap-3.5 py-3">
          <Avatar name={user?.name ?? 'Admin'} size={48} status="online" />
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-bold text-[var(--text-strong)]">{user?.name}</div>
            <div className="text-[12px] text-[var(--text-muted)]">{user?.email}</div>
          </div>
          <Badge variant="ai">{user?.role}</Badge>
        </div>
      </Card>

      <Card title="Platform" icon={Globe}>
        <Row label="Site name" value="Kulmis Academy" />
        <Row label="Default language" value="English (EN)" />
        <Row label="Supported languages" value="EN · SO · AR" />
        <Row label="Total courses" value={stats.courses} />
        <Row label="Registered users" value={stats.users} />
      </Card>

      <Card title="Payments" icon={CreditCard}>
        <Row label="Provider" value="WaafiPay" />
        <Row label="Methods" value="EVC Plus · WaafiPay Wallet" />
        <Row label="Currency" value="USD" />
        <Row label="Status" value={<Badge variant="success">Connected</Badge>} />
      </Card>

      <Card title="Notifications" icon={Bell}>
        <Row label="New signups" value={<Badge variant="success">On</Badge>} />
        <Row label="Course completions" value={<Badge variant="success">On</Badge>} />
        <Row label="Weekly report email" value={<Badge variant="default">Off</Badge>} />
      </Card>
    </div>
  );
}
