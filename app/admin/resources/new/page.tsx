import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createResourceAction } from '@/app/actions/admin';
import { ResourceForm } from '@/components/admin/ResourceForm';

export const dynamic = 'force-dynamic';

export default function NewResourcePage() {
  return (
    <div className="p-4 sm:p-7 flex flex-col gap-6" style={{ maxWidth: 760, margin: '0 auto' }}>
      <div>
        <Link href="/admin/resources" className="inline-flex items-center gap-1.5 text-[13px] font-semibold no-underline mb-3" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={14} /> Back to resources
        </Link>
        <h1 className="text-[26px] font-bold text-[var(--text-strong)] m-0 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>New resource</h1>
        <p className="text-[13px] text-[var(--text-muted)] mt-1 m-0">Upload a PRD, prompt pack, eBook, template or Notion kit — free or paid.</p>
      </div>
      <div className="p-6 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
        <ResourceForm action={createResourceAction} submitLabel="Create resource" />
      </div>
    </div>
  );
}
