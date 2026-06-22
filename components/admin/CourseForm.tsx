'use client';
import { Button } from '@/components/ui/Button';
import { CourseThumbnailUploader } from '@/components/admin/FileUploader';

type Instructor = { id: string; name: string };
type Defaults = {
  title?: string; track?: string; level?: string; instructorId?: string | null;
  price?: string; duration?: string; hours?: number; langs?: string[]; description?: string;
  learnPoints?: string[]; requirements?: string[]; thumbnailUrl?: string | null;
};

const TRACKS = [
  { v: 'vibe-coding', l: 'Vibe Coding' },
  { v: 'traditional-coding', l: 'Traditional Coding' },
  { v: 'ai-tools', l: 'AI Tools' },
  { v: 'ai-agents', l: 'AI Agents' },
];
const LEVELS = ['beginner', 'intermediate', 'advanced', 'all'];

const labelCls = 'text-[12px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-1.5 block';
const inputCls = 'w-full h-10 px-3 rounded-md text-[14px] outline-none';
const inputStyle = { background: 'var(--surface-card)', border: '1px solid var(--border-default)', color: 'var(--text-strong)' } as const;

export function CourseForm({ action, defaults = {}, instructors, submitLabel }: {
  action: (fd: FormData) => void; defaults?: Defaults; instructors: Instructor[]; submitLabel: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-5">
      <CourseThumbnailUploader defaultUrl={defaults.thumbnailUrl ?? ''} />

      <div>
        <label className={labelCls}>Course title</label>
        <input name="title" required defaultValue={defaults.title} placeholder="e.g. Build AI Apps with Next.js" className={inputCls} style={inputStyle} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>Track</label>
          <select name="track" defaultValue={defaults.track ?? 'vibe-coding'} className={inputCls} style={inputStyle}>
            {TRACKS.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Level</label>
          <select name="level" defaultValue={defaults.level ?? 'beginner'} className={`${inputCls} capitalize`} style={inputStyle}>
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>Instructor</label>
          <select name="instructorId" defaultValue={defaults.instructorId ?? ''} className={inputCls} style={inputStyle}>
            <option value="">— None —</option>
            {instructors.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Price</label>
          <input name="price" defaultValue={defaults.price === 'Free' ? '' : defaults.price} placeholder="Free or $39" className={inputCls} style={inputStyle} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div>
          <label className={labelCls}>Duration</label>
          <input name="duration" defaultValue={defaults.duration} placeholder="3h 20m" className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className={labelCls}>Hours</label>
          <input name="hours" type="number" step="0.1" defaultValue={defaults.hours ?? 0} className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className={labelCls}>Languages</label>
          <input name="langs" defaultValue={(defaults.langs ?? ['en']).join(', ')} placeholder="en, so, ar" className={inputCls} style={inputStyle} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea name="description" defaultValue={defaults.description} rows={4} placeholder="Full course description shown on the course page..." className="w-full p-3 rounded-md text-[14px] outline-none resize-y" style={inputStyle} />
      </div>

      <div>
        <label className={labelCls}>What you&apos;ll learn <span className="normal-case font-normal text-[var(--text-subtle)]">(one per line)</span></label>
        <textarea name="learnPoints" defaultValue={(defaults.learnPoints ?? []).join('\n')} rows={5} placeholder={'Turn an idea into a working app\nDesign clean data models\nDebug with AI'} className="w-full p-3 rounded-md text-[14px] outline-none resize-y" style={inputStyle} />
      </div>

      <div>
        <label className={labelCls}>Requirements <span className="normal-case font-normal text-[var(--text-subtle)]">(one per line)</span></label>
        <textarea name="requirements" defaultValue={(defaults.requirements ?? []).join('\n')} rows={3} placeholder={'No prior experience needed\nA computer with internet'} className="w-full p-3 rounded-md text-[14px] outline-none resize-y" style={inputStyle} />
      </div>

      <div className="flex gap-3">
        <Button variant="primary" size="md" type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
