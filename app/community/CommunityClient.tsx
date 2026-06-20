'use client';
import { useState, useRef, useEffect, useTransition, useCallback } from 'react';
import Link from 'next/link';
import {
  Heart, Link2, ImagePlus, X, Loader2, Trash2, Send, Sparkles,
  ExternalLink, Globe, Users, MessageCircle, Camera, Plus, CornerDownRight,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { createPostAction, toggleLikeAction, deletePostAction, loadCommentsAction, addCommentAction, deleteCommentAction } from '@/app/actions/community';
import type { CommentView, ReplyView } from '@/app/actions/community';
import type { PostView } from '@/lib/queries';

/* ─── helpers ─── */
export function ProfilePic({ name, avatarUrl, size }: { name: string; avatarUrl: string | null; size: number }) {
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={avatarUrl} alt={name} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  }
  return <Avatar name={name} size={size} />;
}

/* ─── multi-image grid ─── */
function ImageGrid({ images }: { images: string[] }) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  if (!images.length) return null;

  const imgCls = 'w-full h-full object-cover cursor-zoom-in transition-transform hover:scale-[1.02]';

  return (
    <>
      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-xl object-contain" style={{ maxHeight: '90vh' }} />
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
            <X size={20} />
          </button>
        </div>
      )}

      {images.length === 1 && (
        <div className="overflow-hidden" style={{ maxHeight: 480 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[0]} alt="" className={imgCls} style={{ width: '100%', height: '100%', maxHeight: 480 }} onClick={() => setLightbox(images[0])} />
        </div>
      )}

      {images.length === 2 && (
        <div className="grid gap-0.5" style={{ gridTemplateColumns: '1fr 1fr', height: 280 }}>
          {images.map((img, i) => (
            <div key={i} className="overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className={imgCls} onClick={() => setLightbox(img)} />
            </div>
          ))}
        </div>
      )}

      {images.length === 3 && (
        <div className="grid gap-0.5" style={{ gridTemplateColumns: '2fr 1fr', height: 360 }}>
          <div className="overflow-hidden row-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[0]} alt="" className={imgCls} onClick={() => setLightbox(images[0])} />
          </div>
          {images.slice(1).map((img, i) => (
            <div key={i} className="overflow-hidden" style={{ height: '50%' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className={imgCls} onClick={() => setLightbox(img)} />
            </div>
          ))}
        </div>
      )}

      {images.length >= 4 && (
        <div className="grid gap-0.5" style={{ gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', height: 400 }}>
          {images.slice(0, 4).map((img, i) => (
            <div key={i} className="overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className={imgCls} onClick={() => setLightbox(img)} />
              {i === 3 && images.length > 4 && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-[22px] font-bold" style={{ background: 'rgba(0,0,0,0.5)' }}>
                  +{images.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ─── composer ─── */
function Composer({ me }: { me: { name: string; avatarUrl: string | null } }) {
  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLink, setShowLink] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const [pending, start] = useTransition();
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addImages = useCallback(async (files: File[]) => {
    if (images.length >= 4) return;
    setErr(''); setUploading(true);
    const toUpload = files.slice(0, 4 - images.length);
    const results: string[] = [];
    for (const file of toUpload) {
      try {
        const fd = new FormData(); fd.append('file', file);
        const r = await (await fetch('/api/community/upload', { method: 'POST', body: fd })).json();
        if (r.url) results.push(r.url); else setErr(r.error || 'Upload failed');
      } catch { setErr('Upload failed'); }
    }
    setImages((prev) => [...prev, ...results].slice(0, 4));
    setUploading(false);
  }, [images.length]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) addImages(files);
    e.target.value = '';
  };

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (files.length) addImages(files);
  }

  function share() {
    if (!text.trim() && images.length === 0) { setErr('Write something or add a photo.'); return; }
    const fd = new FormData();
    fd.append('text', text);
    fd.append('images', JSON.stringify(images));
    fd.append('linkUrl', linkUrl);
    start(async () => {
      const r = await createPostAction({}, fd);
      if (r.error) { setErr(r.error); }
      else { setText(''); setImages([]); setLinkUrl(''); setShowLink(false); setErr(''); setExpanded(false); }
    });
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}
    >
      {/* composer header */}
      <div className="flex items-center gap-3 p-4">
        <ProfilePic name={me.name} avatarUrl={me.avatarUrl} size={44} />
        <button
          className="flex-1 text-left px-4 py-2.5 rounded-full text-[14px] transition-colors"
          style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
          onClick={() => setExpanded(true)}
        >
          Maxaad dhisaysaa maanta? (What are you building today?)
        </button>
      </div>

      {/* divider */}
      <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* quick actions */}
      {!expanded && (
        <div className="flex items-center px-4 py-2 gap-1">
          <button
            onClick={() => { setExpanded(true); setTimeout(() => inputRef.current?.click(), 100); }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-colors hover:bg-[var(--surface-raised)]"
            style={{ color: '#10B981' }}
          >
            <Camera size={18} /> Sawiro (Photos)
          </button>
          <button
            onClick={() => { setExpanded(true); setShowLink(true); }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-colors hover:bg-[var(--surface-raised)]"
            style={{ color: '#818CF8' }}
          >
            <Link2 size={18} /> Link
          </button>
          <button
            onClick={() => setExpanded(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-colors hover:bg-[var(--surface-raised)]"
            style={{ color: '#F59E0B' }}
          >
            <Sparkles size={18} /> Post
          </button>
        </div>
      )}

      {/* expanded editor */}
      {expanded && (
        <div className="px-4 pb-4">
          <div className="flex gap-3 mb-3">
            <ProfilePic name={me.name} avatarUrl={me.avatarUrl} size={40} />
            <div className="flex-1">
              <div className="text-[13px] font-bold text-[var(--text-strong)] mb-0.5">{me.name}</div>
              <div className="text-[11px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1" style={{ background: 'var(--surface-raised)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                <Globe size={10} /> Public
              </div>
            </div>
            <button onClick={() => setExpanded(false)} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
          </div>

          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Maxaad dhisaysaa? Qoraalka, mashaariicda, guulaha la wadaag…"
            className="w-full p-3 rounded-xl text-[15px] outline-none resize-none"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-strong)', fontSize: 15 }}
          />

          {/* image previews */}
          {images.length > 0 && (
            <div
              className="mt-3 rounded-xl overflow-hidden relative"
              style={{ border: '1.5px dashed var(--border-subtle)' }}
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <ImageGrid images={images} />
              {/* remove / add buttons overlay */}
              <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImages((prev) => prev.filter((__, j) => j !== i))}
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.65)', color: '#fff' }}
                  >
                    <X size={13} />
                  </button>
                ))}
              </div>
              {images.length < 4 && (
                <button
                  onClick={() => inputRef.current?.click()}
                  className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
                  style={{ background: 'rgba(0,0,0,0.65)', color: '#fff' }}
                >
                  <Plus size={13} /> Sawir ku dar
                </button>
              )}
            </div>
          )}

          {/* drop zone when no images */}
          {images.length === 0 && (
            <div
              className="mt-3 rounded-xl flex flex-col items-center justify-center py-8 gap-2 cursor-pointer transition-colors hover:bg-[var(--surface-raised)]"
              style={{ border: '1.5px dashed var(--border-subtle)' }}
              onClick={() => inputRef.current?.click()}
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {uploading
                ? <Loader2 size={24} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
                : <ImagePlus size={24} style={{ color: 'var(--text-muted)' }} />}
              <div className="text-[13px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                {uploading ? 'Uploading…' : 'Sawiro ku dar / Add Photos (up to 4)'}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--text-subtle)' }}>PNG, JPG, WebP, GIF · max 12 MB each</div>
            </div>
          )}

          {uploading && images.length > 0 && (
            <div className="flex items-center gap-2 mt-2 text-[12px]" style={{ color: 'var(--text-muted)' }}>
              <Loader2 size={13} className="animate-spin" /> Uploading…
            </div>
          )}

          {showLink && (
            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://mashruucaaga.com"
              className="w-full mt-3 h-10 px-3 rounded-lg text-[13px] outline-none"
              style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-subtle)', color: 'var(--text-strong)' }}
            />
          )}

          {err && <p className="text-[12px] mt-2 m-0" style={{ color: '#F87171' }}>{err}</p>}

          <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 12, paddingTop: 12 }}>
            <div className="flex items-center gap-2 flex-wrap">
              <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFileChange} />
              <button
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors hover:bg-[var(--surface-raised)]"
                style={{ color: '#10B981' }}
                disabled={images.length >= 4}
              >
                <Camera size={15} /> Sawiro {images.length > 0 ? `(${images.length}/4)` : ''}
              </button>
              <button
                onClick={() => setShowLink((s) => !s)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors hover:bg-[var(--surface-raised)]"
                style={{ color: showLink ? '#818CF8' : 'var(--text-muted)' }}
              >
                <Link2 size={15} /> Link
              </button>
              <div className="ml-auto">
                <Button variant="primary" size="sm" onClick={share} loading={pending} iconLeft={pending ? undefined : <Send size={14} />}>
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── WhatsApp-style comment bubble ─── */
function Bubble({
  item, mine, onDelete, onReply, isReply = false,
}: {
  item: CommentView | ReplyView; mine: boolean;
  onDelete: () => void; onReply?: () => void; isReply?: boolean;
}) {
  return (
    <div className={`flex gap-2 ${mine ? 'flex-row-reverse' : ''} ${isReply ? 'pl-8' : ''}`}>
      {!mine && (
        <div className="flex-shrink-0 mt-1">
          <ProfilePic name={item.author.name} avatarUrl={item.author.avatarUrl} size={isReply ? 24 : 30}/>
        </div>
      )}
      <div className={`max-w-[78%] ${mine ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
        {!mine && (
          <span className="text-[11px] font-semibold px-1" style={{ color: '#818CF8' }}>{item.author.name}</span>
        )}
        <div className="relative group">
          <div className="px-3.5 py-2 text-[13px] leading-relaxed"
            style={{
              background: mine ? 'linear-gradient(135deg,#6366F1,#8B5CF6)' : 'var(--surface-raised)',
              color: mine ? '#fff' : 'var(--text-body)',
              borderRadius: mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              border: mine ? 'none' : '1px solid var(--border-subtle)',
            }}>
            {item.content}
          </div>
          {/* action row */}
          <div className={`flex items-center gap-2 mt-1 px-1 ${mine ? 'justify-end' : ''}`}>
            <span className="text-[10px]" style={{ color: 'var(--text-subtle)' }}>{item.time}</span>
            {!isReply && onReply && (
              <button onClick={onReply} className="text-[10px] font-semibold transition-colors hover:opacity-80"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3, padding: 0 }}>
                <CornerDownRight size={10}/> Reply
              </button>
            )}
            {mine && (
              <button onClick={onDelete} className="text-[10px] transition-colors hover:opacity-80"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F87171', padding: 0 }}>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── WhatsApp-style comments section ─── */
function CommentsSection({ postId, me }: { postId: string; me: { id: string; name: string; avatarUrl: string | null } | null }) {
  const [comments, setComments]   = useState<CommentView[]>([]);
  const [loaded,   setLoaded]     = useState(false);
  const [loading,  setLoading]    = useState(false);
  const [input,    setInput]      = useState('');
  const [replyTo,  setReplyTo]    = useState<{ id: string; name: string } | null>(null);
  const [sending,  setSending]    = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function load() {
    if (loaded) return;
    setLoading(true);
    const data = await loadCommentsAction(postId);
    setComments(data);
    setLoaded(true);
    setLoading(false);
  }

  async function send() {
    const text = input.trim();
    if (!text || sending || !me) return;
    setSending(true);
    setInput('');
    const result = await addCommentAction(postId, text, replyTo?.id);
    if ('error' in result) { setSending(false); return; }
    if (replyTo) {
      setComments((prev) => prev.map((c) =>
        c.id === replyTo.id ? { ...c, replies: [...c.replies, result as ReplyView] } : c,
      ));
    } else {
      setComments((prev) => [...prev, result as CommentView]);
    }
    setReplyTo(null);
    setSending(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }

  async function removeComment(commentId: string) {
    await deleteCommentAction(commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  async function removeReply(commentId: string, replyId: string) {
    await deleteCommentAction(replyId);
    setComments((prev) => prev.map((c) =>
      c.id === commentId ? { ...c, replies: c.replies.filter((r) => r.id !== replyId) } : c,
    ));
  }

  function startReply(id: string, name: string) {
    setReplyTo({ id, name });
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  // Load comments on mount
  useEffect(() => { load(); }, []);

  const total = comments.reduce((n, c) => n + 1 + c.replies.length, 0);

  return (
    <div style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-page)' }}>
      {loading && (
        <div className="flex items-center justify-center py-4" style={{ color: 'var(--text-muted)' }}>
          <Loader2 size={16} className="animate-spin"/>
        </div>
      )}

      {/* comment list */}
      {loaded && (
        <div className="flex flex-col gap-3 px-4 py-3" style={{ maxHeight: 400, overflowY: 'auto' }}>
          {comments.length === 0 && (
            <div className="text-center py-4 text-[12px]" style={{ color: 'var(--text-subtle)' }}>
              Hore u comment qor — kii ugu horeeyay noqo!
            </div>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex flex-col gap-2">
              <Bubble item={c} mine={c.mine} onDelete={() => removeComment(c.id)} onReply={() => startReply(c.id, c.author.name)}/>
              {c.replies.map((r) => (
                <Bubble key={r.id} item={r} mine={r.mine} isReply onDelete={() => removeReply(c.id, r.id)}/>
              ))}
            </div>
          ))}
          <div ref={bottomRef}/>
        </div>
      )}

      {/* input bar — WhatsApp style */}
      {me ? (
        <div className="px-3 py-2.5 flex flex-col gap-1.5" style={{ borderTop: loaded && comments.length > 0 ? '1px solid var(--border-subtle)' : 'none' }}>
          {replyTo && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px]" style={{ background: 'rgba(99,102,241,0.1)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.2)' }}>
              <CornerDownRight size={11}/>
              <span className="flex-1">Replying to <strong>{replyTo.name}</strong></span>
              <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818CF8', padding: 0, lineHeight: 1 }}>
                <X size={12}/>
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <ProfilePic name={me.name} avatarUrl={me.avatarUrl} size={30}/>
            <div className="flex-1 flex items-center gap-2 pl-3 pr-1 rounded-full"
              style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-subtle)', height: 38 }}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={replyTo ? `Reply to ${replyTo.name}…` : 'Qoraal comment…'}
                className="flex-1 bg-transparent outline-none text-[13px]"
                style={{ color: 'var(--text-body)', border: 'none' }}
              />
              <button
                onClick={send}
                disabled={!input.trim() || sending}
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-opacity"
                style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', border: 'none', cursor: 'pointer' }}>
                {sending ? <Loader2 size={13} color="#fff" className="animate-spin"/> : <Send size={13} color="#fff"/>}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 text-center text-[12px]" style={{ color: 'var(--text-muted)' }}>
          <Link href="/sign-in?next=/community" className="font-semibold" style={{ color: '#818CF8' }}>Sign in</Link> to comment
        </div>
      )}
    </div>
  );
}

/* ─── post card ─── */
export function PostCard({ post, me }: { post: PostView; me: { id: string; name: string; avatarUrl: string | null } | null }) {
  const [liked, setLiked]         = useState(post.likedByMe);
  const [count, setCount]         = useState(post.likes);
  const [showComments, setShowC]  = useState(false);
  const [likePending, startLike]  = useTransition();

  function handleLike() {
    setLiked((p) => !p);
    setCount((p) => liked ? p - 1 : p + 1);
    startLike(async () => { await toggleLikeAction(post.id); });
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}
    >
      {/* header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <Link href={`/u/${post.author.id}`} className="no-underline flex-shrink-0">
          <ProfilePic name={post.author.name} avatarUrl={post.author.avatarUrl} size={46} />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/u/${post.author.id}`} className="text-[15px] font-bold text-[var(--text-strong)] no-underline hover:underline truncate block leading-tight">
            {post.author.name}
          </Link>
          <div className="flex items-center gap-1.5 text-[12px] flex-wrap" style={{ color: 'var(--text-muted)' }}>
            <span className="truncate">{post.author.headline || 'Kulmis learner'}</span>
            <span>·</span>
            <span>{post.time}</span>
            <span>·</span>
            <Globe size={11} />
          </div>
        </div>
        {post.mine && (
          <form action={deletePostAction.bind(null, post.id)}>
            <button
              type="submit"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-red-50"
              style={{ color: 'var(--text-subtle)' }}
              aria-label="Delete post"
            >
              <Trash2 size={16} />
            </button>
          </form>
        )}
      </div>

      {/* text */}
      {post.text && (
        <p className="px-5 pb-3 text-[15px] leading-relaxed text-[var(--text-body)] m-0 whitespace-pre-line">
          {post.text}
        </p>
      )}

      {/* image grid */}
      {post.images.length > 0 && <ImageGrid images={post.images} />}

      {/* link preview */}
      {post.linkUrl && (
        <div className="px-5 pb-3 mt-1">
          <a
            href={post.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-semibold no-underline transition-colors hover:opacity-80"
            style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-subtle)', color: '#818CF8' }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(99,102,241,0.12)' }}>
              <ExternalLink size={15} style={{ color: '#818CF8' }} />
            </div>
            <div className="min-w-0">
              <div className="truncate font-semibold">{post.linkUrl.replace(/^https?:\/\//, '')}</div>
              <div className="text-[11px] font-normal" style={{ color: 'var(--text-muted)' }}>Link · Click to open</div>
            </div>
          </a>
        </div>
      )}

      {/* reaction bar */}
      {count > 0 && (
        <div className="flex items-center gap-1 px-5 py-1.5" style={{ borderTop: '0px' }}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#EC4899' }}>
            <Heart size={11} fill="#fff" color="#fff" />
          </div>
          <span className="text-[13px]" style={{ color: 'var(--text-muted)' }}>{count}</span>
        </div>
      )}

      <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

      <div className="flex items-center px-2 py-1">
        <button
          onClick={handleLike}
          disabled={likePending}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
          style={{ color: liked ? '#EC4899' : 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <Heart size={18} fill={liked ? '#EC4899' : 'transparent'} color={liked ? '#EC4899' : 'currentColor'} />
          {liked ? 'Liked' : 'Like'}
        </button>
        <button
          onClick={() => setShowC((s) => !s)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-colors hover:bg-[var(--surface-raised)]"
          style={{ color: showComments ? '#818CF8' : 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <MessageCircle size={18} fill={showComments ? 'rgba(129,140,248,0.15)' : 'transparent'}/> Comment
        </button>
      </div>

      {showComments && <CommentsSection postId={post.id} me={me}/>}
    </div>
  );
}

/* ─── sidebar ─── */
function GroupSidebar({ memberCount }: { memberCount: number }) {
  return (
    <div className="flex flex-col gap-4">
      {/* about */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
        <div className="text-[15px] font-bold text-[var(--text-strong)] mb-4">Kulmis Community</div>
        <p className="text-[13px] leading-relaxed m-0 mb-4" style={{ color: 'var(--text-body)' }}>
          Ardayda AI &amp; coding ee Kulmis Academy. Wadaag mashruucaaga, su&apos;aalaha weydi, guulahana la xaajiis!
        </p>
        <div className="flex flex-col gap-3 text-[13px]">
          <div className="flex items-center gap-2.5" style={{ color: 'var(--text-body)' }}>
            <Globe size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span><strong>Public</strong> · Anyone can see</span>
          </div>
          <div className="flex items-center gap-2.5" style={{ color: 'var(--text-body)' }}>
            <Users size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span><strong>{memberCount.toLocaleString()}</strong> members</span>
          </div>
          <div className="flex items-center gap-2.5" style={{ color: 'var(--text-body)' }}>
            <Sparkles size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span>AI · Coding · Vibe coding</span>
          </div>
        </div>
      </div>

      {/* rules */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
        <div className="text-[15px] font-bold text-[var(--text-strong)] mb-3">Xeerarka Kooxda</div>
        {[
          ['1.', 'Respect everyone — wax wanaagsan ku hadal'],
          ['2.', 'Share what you build — sawiro, links, code'],
          ['3.', 'No spam or ads without permission'],
          ['4.', 'Help each other grow — isu gargaara'],
        ].map(([num, rule]) => (
          <div key={num} className="flex gap-2.5 mb-2.5 last:mb-0">
            <span className="font-bold text-[13px] flex-shrink-0" style={{ color: '#818CF8' }}>{num}</span>
            <span className="text-[13px]" style={{ color: 'var(--text-body)' }}>{rule}</span>
          </div>
        ))}
      </div>

      {/* invite */}
      <div
        className="rounded-2xl p-5 text-white"
        style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}
      >
        <div className="text-[14px] font-bold mb-1">Invite Friends</div>
        <p className="text-[12px] mb-3 m-0 leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
          Saaxiibadaada u soo dir si ay ula biiraan community-ga.
        </p>
        <a
          href="https://wa.me/252613609678"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold no-underline transition-opacity hover:opacity-90"
          style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
        >
          <MessageCircle size={15} /> WhatsApp la wadaag
        </a>
      </div>
    </div>
  );
}

type Member = { id: string; name: string; headline: string; avatarUrl: string | null; plan: string; role: string; joined: string };

/* ─── members grid ─── */
function MembersGrid({ members }: { members: Member[] }) {
  return (
    <div>
      <div className="text-[13px] font-semibold mb-4" style={{ color: 'var(--text-muted)' }}>
        {members.length} members
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {members.map((m) => (
          <Link
            key={m.id}
            href={`/u/${m.id}`}
            className="no-underline flex items-center gap-3 p-4 rounded-2xl transition-colors"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}
          >
            <ProfilePic name={m.name} avatarUrl={m.avatarUrl} size={48} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[14px] font-bold text-[var(--text-strong)] truncate">{m.name}</span>
                {m.role === 'admin' && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.15)', color: '#818CF8' }}>admin</span>
                )}
                {m.plan === 'pro' && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>pro</span>
                )}
              </div>
              <div className="text-[12px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {m.headline || 'Kulmis learner'}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-subtle)' }}>Joined {m.joined}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─── about tab ─── */
function AboutTab({ memberCount }: { memberCount: number }) {
  return (
    <div className="flex flex-col gap-5" style={{ maxWidth: 680 }}>
      {/* mission */}
      <div className="rounded-2xl p-6" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
        <div className="text-[17px] font-bold text-[var(--text-strong)] mb-3">About this group</div>
        <p className="text-[14px] leading-relaxed m-0 mb-5" style={{ color: 'var(--text-body)' }}>
          Kulmis Community waa meel ardayda AI &amp; coding ee Kulmis Academy ay ku kulmaan, wax walba ku wadaagaan —
          mashruucyada, guulaha, su&apos;aalaha, iyo waxbarashadooda. Hal mar oo aad code ku qortaa, halkan soo dhig!
        </p>
        <div className="grid gap-3 text-[14px]" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {[
            { icon: <Globe size={16} />, label: 'Public group', sub: 'Anyone can see posts' },
            { icon: <Users size={16} />, label: `${memberCount.toLocaleString()} members`, sub: 'Active learners' },
            { icon: <Sparkles size={16} />, label: 'AI & Vibe Coding', sub: 'Main topics' },
            { icon: <MessageCircle size={16} />, label: 'Est. 2024', sub: 'Kulmis Academy' },
          ].map(({ icon, label, sub }) => (
            <div key={label} className="flex items-start gap-3 p-3.5 rounded-xl" style={{ background: 'var(--surface-raised)' }}>
              <div className="mt-0.5 flex-shrink-0" style={{ color: '#818CF8' }}>{icon}</div>
              <div>
                <div className="font-semibold text-[var(--text-strong)]">{label}</div>
                <div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* topics */}
      <div className="rounded-2xl p-6" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
        <div className="text-[16px] font-bold text-[var(--text-strong)] mb-4">Topics</div>
        <div className="flex flex-wrap gap-2">
          {['Vibe Coding', 'AI Tools', 'AI Agents', 'Traditional Coding', 'Projects', 'Career', 'Resources', 'Wins'].map((t) => (
            <span key={t} className="px-3 py-1.5 rounded-full text-[13px] font-semibold" style={{ background: 'var(--surface-raised)', color: 'var(--text-body)', border: '1px solid var(--border-subtle)' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* rules */}
      <div className="rounded-2xl p-6" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
        <div className="text-[16px] font-bold text-[var(--text-strong)] mb-4">Xeerarka Kooxda (Group Rules)</div>
        {[
          ['Respect everyone', 'Wax wanaagsan ku hadal. Qof kastaa waa la ixtiiraami doonaa.'],
          ['Share what you build', 'Sawiro, links, code, iyo mashruucyada wadaag si kooxdu uga barato.'],
          ['No spam', 'Xayeysiisyada iyo spam-ka lagama ogola qayb hore oo oggolaansho la\'aaan.'],
          ['Help each other', 'Su\'aalo weydii, jawaab u sii — waxbarashada waa shaqo koox.'],
        ].map(([title, desc], i) => (
          <div key={title} className="flex gap-4 py-4" style={{ borderBottom: i < 3 ? '1px solid var(--border-subtle)' : 'none' }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[13px] font-bold"
              style={{ background: 'rgba(99,102,241,0.12)', color: '#818CF8' }}
            >
              {i + 1}
            </div>
            <div>
              <div className="text-[14px] font-bold text-[var(--text-strong)] mb-0.5">{title}</div>
              <div className="text-[13px]" style={{ color: 'var(--text-muted)' }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* contact */}
      <div
        className="rounded-2xl p-6 text-white"
        style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}
      >
        <div className="text-[16px] font-bold mb-2">Su&apos;aal ma qabtaa?</div>
        <p className="text-[13px] m-0 mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>
          Admin-ka la xiriir WhatsApp-ka — waxaan kuu caawineynaa.
        </p>
        <a
          href="https://wa.me/252613609678"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold no-underline"
          style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
        >
          <MessageCircle size={16} /> +252 61 360 9678
        </a>
      </div>
    </div>
  );
}

/* ─── main export ─── */
export function CommunityClient({
  me,
  posts,
  memberCount,
  members,
}: {
  me: { id: string; name: string; avatarUrl: string | null } | null;
  posts: PostView[];
  memberCount: number;
  members: Member[];
}) {
  const [activeTab, setActiveTab] = useState<'Posts' | 'Members' | 'About'>('Posts');
  const TABS = ['Posts', 'Members', 'About'] as const;

  return (
    <div style={{ background: 'var(--surface-page)', minHeight: '100vh' }}>
      <Navbar />

      {/* cover banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F0F1A 0%, #1E1B4B 40%, #312E81 70%, #4C1D95 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: 100, width: 200, height: 200, borderRadius: '50%', background: 'rgba(139,92,246,0.2)', filter: 'blur(50px)', pointerEvents: 'none' }} />

        <div className="mx-auto px-5 sm:px-8 py-10 sm:py-14" style={{ maxWidth: 1100, position: 'relative' }}>
          <div className="flex items-end gap-5 flex-wrap">
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(99,102,241,0.25)', border: '3px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
            >
              <Sparkles size={36} color="#A5B4FC" />
            </div>

            <div className="flex-1 min-w-0 text-white">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold mb-2" style={{ background: 'rgba(99,102,241,0.3)', color: '#A5B4FC', border: '1px solid rgba(99,102,241,0.4)' }}>
                <Globe size={11} /> Public group
              </div>
              <h1 className="text-[26px] sm:text-[34px] font-bold m-0 mb-1 leading-tight" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                Kulmis Community
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-[13px]" style={{ color: 'rgba(255,255,255,0.75)' }}>
                <span className="flex items-center gap-1.5"><Users size={14} /> {memberCount.toLocaleString()} members</span>
                <span className="flex items-center gap-1.5"><Sparkles size={14} /> AI &amp; Coding</span>
                <span className="flex items-center gap-1.5"><MessageCircle size={14} /> {posts.length} posts</span>
              </div>
            </div>

            {!me && (
              <Link href="/sign-up?next=/community" className="no-underline flex-shrink-0">
                <Button variant="mint" size="md">
                  <Plus size={16} /> Join Group
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* tabs bar */}
      <div
        className="sticky top-16 z-30"
        style={{ background: 'var(--surface-card)', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="mx-auto px-5 sm:px-8 flex gap-1" style={{ maxWidth: 1100 }}>
          {TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-5 py-3.5 text-[14px] font-semibold transition-colors"
                style={{
                  color: active ? '#818CF8' : 'var(--text-muted)',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: active ? '3px solid #818CF8' : '3px solid transparent',
                  cursor: 'pointer',
                }}
              >
                {tab}
                {tab === 'Members' && (
                  <span className="ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full" style={{ background: active ? 'rgba(99,102,241,0.15)' : 'var(--surface-raised)', color: active ? '#818CF8' : 'var(--text-subtle)' }}>
                    {memberCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* content */}
      <div className="mx-auto px-5 sm:px-8 py-6" style={{ maxWidth: 1100 }}>

        {/* ── Posts tab ── */}
        {activeTab === 'Posts' && (
          <div className="flex gap-6 items-start">
            {/* sidebar — desktop only */}
            <div className="hidden lg:block flex-shrink-0" style={{ width: 320 }}>
              <GroupSidebar memberCount={memberCount} />
            </div>

            {/* feed */}
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              {me ? (
                <Composer me={me} />
              ) : (
                <div className="rounded-2xl p-6 text-center" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--surface-raised)' }}>
                    <Users size={22} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div className="text-[16px] font-bold text-[var(--text-strong)] mb-1">Join the conversation</div>
                  <div className="text-[13px] mb-4" style={{ color: 'var(--text-muted)' }}>Create a free account to post, like, and share.</div>
                  <Link href="/sign-up?next=/community"><Button variant="primary" size="md">Create free account</Button></Link>
                </div>
              )}
              {posts.length === 0 ? (
                <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
                  <Sparkles size={32} className="mx-auto mb-3" />
                  <div className="text-[15px] font-semibold mb-1">No posts yet</div>
                  <div className="text-[13px]">Adiga ka bilow — first post-ga qor!</div>
                </div>
              ) : (
                posts.map((p) => <PostCard key={p.id} post={p} me={me}/>)
              )}
            </div>
          </div>
        )}

        {/* ── Members tab ── */}
        {activeTab === 'Members' && <MembersGrid members={members} />}

        {/* ── About tab ── */}
        {activeTab === 'About' && <AboutTab memberCount={memberCount} />}

      </div>

      {/* mobile sidebar shown only on Posts tab */}
      {activeTab === 'Posts' && (
        <div className="lg:hidden px-5 sm:px-8 pb-8" style={{ maxWidth: 680, margin: '0 auto' }}>
          <GroupSidebar memberCount={memberCount} />
        </div>
      )}

      <Footer />
    </div>
  );
}
