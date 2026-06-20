'use client';
import { Button } from '@/components/ui/Button';
import { ImageGalleryUploader, ResourceFileUploader } from '@/components/admin/FileUploader';

type Defaults = {
  title?: string; type?: string; price?: string; fileLabel?: string;
  imageUrl?: string | null; images?: string[]; fileUrl?: string | null;
  filePath?: string | null; fileName?: string | null; fileSize?: number | null;
  description?: string; highlights?: string[];
  demoUser?: string | null; demoPass?: string | null;
};

const TYPES = [
  { v: 'prd', l: 'PRD' }, { v: 'prompt', l: 'Prompt Pack' }, { v: 'system', l: 'System Prompt' },
  { v: 'ebook', l: 'eBook' }, { v: 'template', l: 'Template' }, { v: 'notion', l: 'Notion Kit' }, { v: 'other', l: 'Other' },
];

const labelCls = 'text-[12px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-1.5 block';
const inputCls = 'w-full h-10 px-3 rounded-md text-[14px] outline-none';
const inputStyle = { background: 'var(--surface-card)', border: '1px solid var(--border-default)', color: 'var(--text-strong)' } as const;

export function ResourceForm({ action, defaults = {}, submitLabel }: { action: (fd: FormData) => void; defaults?: Defaults; submitLabel: string }) {
  return (
    <form action={action} className="flex flex-col gap-5">
      <div>
        <label className={labelCls}>Title</label>
        <input name="title" required defaultValue={defaults.title} placeholder="e.g. SaaS PRD Template" className={inputCls} style={inputStyle} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>Type</label>
          <select name="type" defaultValue={defaults.type ?? 'other'} className={inputCls} style={inputStyle}>
            {TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Price</label>
          <input name="price" defaultValue={defaults.price === 'Free' ? '' : defaults.price} placeholder="Free or $12" className={inputCls} style={inputStyle} />
        </div>
      </div>

      <ImageGalleryUploader name="images" defaultImages={defaults.images ?? []} />

      <ResourceFileUploader defaults={{ filePath: defaults.filePath, fileName: defaults.fileName, fileSize: defaults.fileSize, fileLabel: defaults.fileLabel, fileUrl: defaults.fileUrl }} />

      <div>
        <label className={labelCls}>Description</label>
        <textarea name="description" defaultValue={defaults.description} rows={4} placeholder="What this resource is and who it's for..." className="w-full p-3 rounded-md text-[14px] outline-none resize-y" style={inputStyle} />
      </div>

      <div>
        <label className={labelCls}>What&apos;s inside <span className="normal-case font-normal text-[var(--text-subtle)]">(one per line)</span></label>
        <textarea name="highlights" defaultValue={(defaults.highlights ?? []).join('\n')} rows={4} placeholder={'120 categorized prompts\nLifetime updates'} className="w-full p-3 rounded-md text-[14px] outline-none resize-y" style={inputStyle} />
      </div>

      {/* Demo credentials — optional */}
      <div className="rounded-lg p-4 flex flex-col gap-4" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div>
          <div className="text-[13px] font-bold mb-0.5" style={{ color: '#818CF8' }}>Demo Credentials <span className="font-normal text-[var(--text-subtle)]">(optional)</span></div>
          <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>If set, users will see a &quot;Try Demo&quot; button that reveals these credentials. Leave blank to hide.</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Demo Username / Email</label>
            <input name="demoUser" defaultValue={defaults.demoUser ?? ''} placeholder="demo@example.com" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls}>Demo Password</label>
            <input name="demoPass" defaultValue={defaults.demoPass ?? ''} placeholder="demo1234" className={inputCls} style={inputStyle} />
          </div>
        </div>
      </div>

      <div><Button variant="primary" size="md" type="submit">{submitLabel}</Button></div>
    </form>
  );
}
