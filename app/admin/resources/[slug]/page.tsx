import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Trash2 } from 'lucide-react';
import { db } from '@/lib/db';
import { updateResourceAction, deleteResourceAction } from '@/app/actions/admin';
import { ResourceForm } from '@/components/admin/ResourceForm';

export const dynamic = 'force-dynamic';

export default async function EditResourcePage({ params }: { params: { slug: string } }) {
  const resource = await db.query.resources.findFirst({ where: (r, { eq }) => eq(r.slug, params.slug) });
  if (!resource) notFound();

  return (
    <div className="p-4 sm:p-7 flex flex-col gap-6" style={{ maxWidth: 760, margin: '0 auto' }}>
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex-1 min-w-0">
          <Link href="/admin/resources" className="inline-flex items-center gap-1.5 text-[13px] font-semibold no-underline mb-3" style={{ color: 'var(--text-muted)' }}>
            <ArrowLeft size={14} /> Back to resources
          </Link>
          <h1 className="text-[26px] font-bold text-[var(--text-strong)] m-0 tracking-tight truncate" style={{ fontFamily: 'var(--font-display)' }}>{resource.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/resources/${resource.slug}`} target="_blank" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-[13px] font-semibold no-underline" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-body)' }}>
            <ExternalLink size={14} /> View
          </Link>
          <form action={deleteResourceAction.bind(null, resource.slug)}>
            <button type="submit" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-[13px] font-semibold" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171' }}>
              <Trash2 size={14} /> Delete
            </button>
          </form>
        </div>
      </div>

      <div className="p-6 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
        <ResourceForm
          action={updateResourceAction.bind(null, resource.slug)}
          defaults={{
            title: resource.title, type: resource.type, price: resource.price, fileLabel: resource.fileLabel,
            imageUrl: resource.imageUrl, images: resource.images, fileUrl: resource.fileUrl,
            filePath: resource.filePath, fileName: resource.fileName, fileSize: resource.fileSize,
            description: resource.description, highlights: resource.highlights,
          demoUser: resource.demoUser, demoPass: resource.demoPass,
          }}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
