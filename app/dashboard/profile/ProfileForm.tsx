'use client';
import { useState, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Camera, Loader2, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { updateProfileAction } from '@/app/actions/community';

const labelCls = 'text-[12px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-1.5 block';
const inputCls = 'w-full h-10 px-3 rounded-md text-[14px] outline-none';
const inputStyle = { background: 'var(--surface-card)', border: '1px solid var(--border-default)', color: 'var(--text-strong)' } as const;

function SaveButton() {
  const { pending } = useFormStatus();
  return <Button variant="primary" size="md" type="submit" loading={pending}>Save profile</Button>;
}

export function ProfileForm({ user }: { user: { id: string; name: string; headline: string; bio: string; avatarUrl: string | null } }) {
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? '');
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState(user.name);
  const [state, formAction] = useFormState(updateProfileAction, {} as { ok?: boolean; error?: string });
  const inputRef = useRef<HTMLInputElement>(null);

  async function onImage(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const r = await (await fetch('/api/community/upload', { method: 'POST', body: fd })).json();
      if (r.url) setAvatarUrl(r.url);
    } catch { /* ignore */ }
    setUploading(false);
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="avatarUrl" value={avatarUrl} />

      <div className="flex items-center gap-4">
        <div className="relative">
          {avatarUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={avatarUrl} alt="" className="rounded-full object-cover" style={{ width: 72, height: 72 }} />
            : <Avatar name={name || user.name} size={72} />}
          <button type="button" onClick={() => inputRef.current?.click()} className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-2" style={{ background: '#6366F1', color: '#fff', borderColor: 'var(--surface-card)' }} aria-label="Change photo">
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
          </button>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onImage(e.target.files?.[0])} />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-[var(--text-strong)]">Profile photo</div>
          <div className="text-[12px] text-[var(--text-muted)]">PNG or JPG, up to 12 MB</div>
          <Link href={`/u/${user.id}`} className="text-[12px] font-semibold no-underline inline-flex items-center gap-1 mt-1" style={{ color: 'var(--text-link)' }}>View public profile <ExternalLink size={11} /></Link>
        </div>
      </div>

      <div>
        <label className={labelCls}>Full name</label>
        <input name="name" required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} style={inputStyle} />
      </div>
      <div>
        <label className={labelCls}>Headline</label>
        <input name="headline" defaultValue={user.headline} placeholder="e.g. Vibe coder · Building with AI" className={inputCls} style={inputStyle} />
      </div>
      <div>
        <label className={labelCls}>Bio</label>
        <textarea name="bio" defaultValue={user.bio} rows={4} placeholder="Tell the community about yourself…" className="w-full p-3 rounded-md text-[14px] outline-none resize-y" style={inputStyle} />
      </div>

      {state.error && <div className="text-[13px] px-3.5 py-2.5 rounded-md" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171' }}>{state.error}</div>}
      {state.ok && <div className="text-[13px] px-3.5 py-2.5 rounded-md inline-flex items-center gap-2" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981' }}><Check size={14} /> Profile saved</div>}

      <div><SaveButton /></div>
    </form>
  );
}
