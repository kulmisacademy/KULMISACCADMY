'use client';
import { useState, useRef } from 'react';
import { ImagePlus, X, UploadCloud, FileArchive, Loader2, Star } from 'lucide-react';

async function upload(file: File, kind: 'image' | 'resource') {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('kind', kind);
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Upload failed');
  return json;
}

const labelCls = 'text-[12px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-1.5 block';

/* ───── Gallery (multiple images, drag to reorder via move buttons) ───── */
export function ImageGalleryUploader({ name, defaultImages = [] }: { name: string; defaultImages?: string[] }) {
  const [images, setImages] = useState<string[]>(defaultImages);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setErr(''); setBusy(true);
    try {
      for (const f of Array.from(files)) {
        const { url } = await upload(f, 'image');
        setImages((prev) => [...prev, url]);
      }
    } catch (e) { setErr(e instanceof Error ? e.message : 'Upload failed'); }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  const move = (i: number, dir: -1 | 1) => setImages((prev) => {
    const next = [...prev]; const j = i + dir;
    if (j < 0 || j >= next.length) return prev;
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  });
  const remove = (i: number) => setImages((prev) => prev.filter((_, k) => k !== i));

  return (
    <div>
      <label className={labelCls}>Preview images <span className="normal-case font-normal text-[var(--text-subtle)]">(slideshow — first is the cover)</span></label>
      <input type="hidden" name={name} value={JSON.stringify(images)} />
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {images.map((url, i) => (
          <div key={url + i} className="relative group rounded-lg overflow-hidden aspect-[4/3]" style={{ border: '1px solid var(--border-subtle)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover" />
            {i === 0 && <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold text-white flex items-center gap-0.5" style={{ background: '#6366F1' }}><Star size={9} /> Cover</span>}
            <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.5)' }}>
              <button type="button" onClick={() => move(i, -1)} className="w-7 h-7 rounded-md bg-white/90 text-black text-[12px] font-bold" title="Move left">←</button>
              <button type="button" onClick={() => remove(i)} className="w-7 h-7 rounded-md flex items-center justify-center bg-[#EF4444] text-white" title="Remove"><X size={14} /></button>
              <button type="button" onClick={() => move(i, 1)} className="w-7 h-7 rounded-md bg-white/90 text-black text-[12px] font-bold" title="Move right">→</button>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => inputRef.current?.click()} className="aspect-[4/3] rounded-lg flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors" style={{ border: '1.5px dashed var(--border-default)', color: 'var(--text-muted)' }}>
          {busy ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
          <span className="text-[11px] font-semibold">{busy ? 'Uploading…' : 'Add images'}</span>
        </button>
      </div>
      {err && <p className="text-[12px] mt-2 m-0" style={{ color: '#F87171' }}>{err}</p>}
    </div>
  );
}

/* ───── Resource file (zip/psd/ai/pdf...) → private gated storage ───── */
export function ResourceFileUploader({ defaults }: { defaults?: { filePath?: string | null; fileName?: string | null; fileSize?: number | null; fileLabel?: string; fileUrl?: string | null } }) {
  const [path, setPath] = useState(defaults?.filePath ?? '');
  const [fname, setFname] = useState(defaults?.fileName ?? '');
  const [size, setSize] = useState<number | ''>(defaults?.fileSize ?? '');
  const [label, setLabel] = useState(defaults?.fileLabel ?? '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setErr(''); setBusy(true);
    try {
      const r = await upload(file, 'resource');
      setPath(r.path); setFname(r.name); setSize(r.size); setLabel(r.label);
    } catch (e) { setErr(e instanceof Error ? e.message : 'Upload failed'); }
    setBusy(false);
  }

  return (
    <div>
      <label className={labelCls}>Downloadable file <span className="normal-case font-normal text-[var(--text-subtle)]">(ZIP, PSD, AI, PDF… — gated for paid)</span></label>
      <input type="hidden" name="filePath" value={path} />
      <input type="hidden" name="fileName" value={fname} />
      <input type="hidden" name="fileSize" value={size} />
      <input ref={inputRef} type="file" className="hidden" accept=".zip,.rar,.7z,.psd,.ai,.pdf,.fig,.sketch,.xd,.epub,.docx,.pptx,.xlsx,.txt,.json,.csv,.mp4,.mp3" onChange={(e) => onFile(e.target.files?.[0])} />

      {path ? (
        <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-subtle)' }}>
          <span className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}><FileArchive size={18} /></span>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-[var(--text-body)] truncate">{fname}</div>
            <div className="text-[11px] text-[var(--text-muted)] font-mono">{label}</div>
          </div>
          <button type="button" onClick={() => inputRef.current?.click()} className="text-[12px] font-semibold px-3 py-1.5 rounded-md" style={{ color: '#818CF8' }}>Replace</button>
          <button type="button" onClick={() => { setPath(''); setFname(''); setSize(''); setLabel(''); }} className="w-8 h-8 rounded-md flex items-center justify-center" style={{ color: '#F87171' }}><X size={15} /></button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} className="w-full flex flex-col items-center justify-center gap-2 py-7 rounded-lg cursor-pointer transition-colors" style={{ border: '1.5px dashed var(--border-default)', color: 'var(--text-muted)' }}>
          {busy ? <Loader2 size={22} className="animate-spin" /> : <UploadCloud size={22} />}
          <span className="text-[13px] font-semibold">{busy ? 'Uploading…' : 'Click to upload a file'}</span>
          <span className="text-[11px]">ZIP · PSD · AI · PDF · up to 80 MB</span>
        </button>
      )}
      {err && <p className="text-[12px] mt-2 m-0" style={{ color: '#F87171' }}>{err}</p>}

      <div className="mt-3">
        <label className={labelCls}>File label <span className="normal-case font-normal text-[var(--text-subtle)]">(auto-filled; editable)</span></label>
        <input name="fileLabel" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="ZIP · 4.2 MB" className="w-full h-10 px-3 rounded-md text-[14px] outline-none" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', color: 'var(--text-strong)' }} />
      </div>

      <div className="mt-3">
        <label className={labelCls}>…or external link <span className="normal-case font-normal text-[var(--text-subtle)]">(optional — used if no file uploaded)</span></label>
        <input name="fileUrl" defaultValue={defaults?.fileUrl ?? ''} placeholder="https://drive.google.com/…" className="w-full h-10 px-3 rounded-md text-[14px] outline-none" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', color: 'var(--text-strong)' }} />
      </div>
    </div>
  );
}
