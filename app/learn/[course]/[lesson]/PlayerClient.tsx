'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronDown, ChevronRight, Check, CheckCircle2, Play, Lock,
  Sparkles, Send, FileText, HelpCircle, Code, Menu, X,
  ArrowLeft, BookOpen, Download, FolderOpen, ExternalLink,
  Maximize2, Minimize2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { completeLessonAction } from '@/app/actions/learning';
import { useT } from '@/lib/i18n/context';

type LessonItem  = { id: string; t: string; d: string; s: 'completed' | 'active' | 'default'; free: boolean };
type Section     = { section: string; lessons: LessonItem[] };
type Message     = { role: 'user' | 'assistant'; content: string };
type CourseFile  = { id: string; title: string; fileLabel: string; fileName: string | null; fileUrl: string | null };

function getEmbed(raw: string | null): { src: string; allow: string } | null {
  if (!raw) return null;

  // Accept full Vimeo/YouTube embed HTML — extract the iframe src
  const iframeSrc = raw.match(/<iframe[^>]+src=["']([^"']+)["']/i)?.[1];
  const url = iframeSrc ?? raw.trim();

  // YouTube
  const yt = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
  if (yt) return {
    src: `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`,
    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
  };

  // Vimeo — handles vimeo.com/123, player.vimeo.com/video/123, full embed HTML
  const vm = url.match(/vimeo\.com(?:\/(?:video|channels\/[^/]+|groups\/[^/]+\/videos))?\/(\d+)/);
  if (vm) return {
    src: `https://player.vimeo.com/video/${vm[1]}?badge=0&autopause=0&dnt=1&title=0&byline=0&portrait=0`,
    allow: 'autoplay; fullscreen; picture-in-picture',
  };

  return null;
}

/* ══════════════════════════════════════════
   LEFT SIDEBAR — Course Curriculum
══════════════════════════════════════════ */
function CurriculumSidebar({
  sections, courseSlug, courseTitle, doneCount, totalLessons, onClose,
}: {
  sections: Section[]; courseSlug: string; courseTitle: string;
  doneCount: number; totalLessons: number; onClose?: () => void;
}) {
  const { t } = useT();
  const pct = totalLessons > 0 ? Math.round((doneCount / totalLessons) * 100) : 0;
  const [openSecs, setOpenSecs] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    sections.forEach((s, i) => { init[i] = s.lessons.some((l) => l.s === 'active') || i === 0; });
    return init;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0F0F18', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
      {/* header */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0D0D15', flexShrink: 0 }}>
        {onClose && (
          <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', fontSize: 12, padding: 0 }}>
            <X size={13}/> {t('player_close')}
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <BookOpen size={14} style={{ color: '#6366F1', flexShrink: 0 }}/>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{courseTitle}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: 'linear-gradient(90deg,#6366F1,#10B981)', transition: 'width 0.5s' }}/>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: pct === 100 ? '#10B981' : 'rgba(255,255,255,0.4)', flexShrink: 0 }}>{pct}%</span>
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', marginTop: 4 }}>{t('player_lessons_complete').replace('{done}', String(doneCount)).replace('{total}', String(totalLessons))}</div>
      </div>

      {/* lesson list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {sections.map((sec, si) => {
          const secDone  = sec.lessons.filter((l) => l.s === 'completed').length;
          const secTotal = sec.lessons.length;
          const isOpen   = openSecs[si];
          return (
            <div key={si}>
              {/* section toggle */}
              <button
                onClick={() => setOpenSecs((p) => ({ ...p, [si]: !p[si] }))}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(255,255,255,0.02)', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', textAlign: 'left' }}>
                {isOpen
                  ? <ChevronDown size={12} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}/>
                  : <ChevronRight size={12} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}/>}
                <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{sec.section}</span>
                <span style={{ fontSize: 10, color: secDone === secTotal && secTotal > 0 ? '#10B981' : 'rgba(255,255,255,0.25)', flexShrink: 0 }}>{secDone}/{secTotal}</span>
              </button>

              {/* lessons */}
              {isOpen && sec.lessons.map((lesson) => {
                const isDone   = lesson.s === 'completed';
                const isActive = lesson.s === 'active';
                return (
                  <Link key={lesson.id} href={`/learn/${courseSlug}/${lesson.id}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                      textDecoration: 'none',
                      background: isActive ? 'rgba(99,102,241,0.08)' : 'transparent',
                      borderLeft: `3px solid ${isActive ? '#6366F1' : 'transparent'}`,
                      borderBottom: '1px solid rgba(255,255,255,0.02)',
                    }}>
                    {/* checkbox */}
                    <div style={{
                      width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isDone ? '#10B981' : 'transparent',
                      border: `2px solid ${isDone ? '#10B981' : isActive ? '#6366F1' : 'rgba(255,255,255,0.18)'}`,
                    }}>
                      {isDone && <Check size={10} color="#fff" strokeWidth={3}/>}
                      {isActive && !isDone && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#818CF8' }}/>}
                      {!isDone && !isActive && !lesson.free && <Lock size={8} color="rgba(255,255,255,0.2)"/>}
                    </div>

                    <span style={{
                      flex: 1, fontSize: 12, lineHeight: 1.4,
                      color: isDone ? '#10B981' : isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                      fontWeight: isActive ? 600 : 400,
                      textDecoration: isDone ? 'line-through' : 'none',
                      textDecorationColor: 'rgba(16,185,129,0.4)',
                      overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>{lesson.t}</span>

                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>{lesson.d}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   RIGHT PANEL — AI Tutor
══════════════════════════════════════════ */
function AiTutorPanel({ lessonTitle }: { lessonTitle: string }) {
  const { t } = useT();
  const QUICK_PROMPTS = [t('player_qp_1'), t('player_qp_2'), t('player_qp_3')];
  const [msgs, setMsgs]   = useState<Message[]>([
    { role: 'assistant', content: `Salaan! Waxaan ahay AI Tutor-kaaga. Wax kasta oo ku saabsan "${lessonTitle}" i weydii — ama isticmaal mid ka mid ah prompts hoose.` },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy]   = useState(false);
  const scrollRef         = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, busy]);

  async function send(text?: string) {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    setInput('');
    setMsgs((m) => [...m, { role: 'user', content: q }]);
    setBusy(true);
    await new Promise((r) => setTimeout(r, 900));
    setMsgs((m) => [...m, {
      role: 'assistant',
      content: `Su'aal fiican! "${q}" — "${lessonTitle}" casharka: Fikradda muhiimka ah geli maskaxdaada, ku tijaabi Code tab-ka, markaasna Casharka Dhamee si aad u sii wadato.`,
    }]);
    setBusy(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0D0D15' }}>
      {/* header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, borderLeft: '3px solid #22D3EE', background: 'rgba(34,211,238,0.03)' }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#06B6D4,#0891B2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Sparkles size={14} color="#fff"/>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>AI Tutor</div>
          <div style={{ fontSize: 10, color: '#22D3EE', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: 180 }}>{lessonTitle}</div>
        </div>
      </div>

      {/* messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, flexDirection: m.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
            {m.role === 'assistant'
              ? <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#06B6D4,#0891B2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Sparkles size={12} color="#fff"/></div>
              : <Avatar name="You" size={26} className="flex-shrink-0"/>}
            <div style={{
              maxWidth: '80%', padding: '9px 13px', fontSize: 12, lineHeight: 1.6,
              background: m.role === 'user' ? 'linear-gradient(135deg,#6366F1,#8B5CF6)' : 'rgba(255,255,255,0.05)',
              color: '#fff',
              borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              borderLeft: m.role === 'assistant' ? '2px solid rgba(34,211,238,0.3)' : 'none',
            }}>{m.content}</div>
          </div>
        ))}
        {busy && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#06B6D4,#0891B2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Sparkles size={12} color="#fff"/></div>
            <div style={{ padding: '10px 14px', borderRadius: '16px 16px 16px 4px', background: 'rgba(255,255,255,0.05)', display: 'flex', gap: 4 }}>
              {[0,1,2].map((i) => <div key={i} className="animate-bounce" style={{ width: 6, height: 6, borderRadius: '50%', background: '#22D3EE', animationDelay: `${i*0.15}s` }}/>)}
            </div>
          </div>
        )}
      </div>

      {/* quick prompts */}
      <div style={{ padding: '8px 12px 6px', display: 'flex', flexWrap: 'wrap', gap: 6, flexShrink: 0 }}>
        {QUICK_PROMPTS.map((p) => (
          <button key={p} onClick={() => send(p)}
            style={{ padding: '5px 10px', borderRadius: 99, fontSize: 10, fontWeight: 600, background: 'rgba(34,211,238,0.07)', color: '#22D3EE', border: '1px solid rgba(34,211,238,0.18)', cursor: 'pointer' }}>
            {p}
          </button>
        ))}
      </div>

      {/* input */}
      <div style={{ padding: '6px 12px 14px', display: 'flex', gap: 8, flexShrink: 0 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); send(); } }}
          placeholder={t('player_ask_ph')}
          style={{ flex: 1, height: 38, padding: '0 12px', borderRadius: 10, fontSize: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: '#fff', outline: 'none' }}/>
        <button onClick={() => send()} disabled={busy || !input.trim()}
          style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: busy || !input.trim() ? 0.4 : 1 }}>
          <Send size={14} color="#fff"/>
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   TABS — Notes / Quiz / Code
══════════════════════════════════════════ */
function NotesTab({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useT();
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={t('player_notes_ph')}
      style={{ width: '100%', minHeight: 'clamp(140px, 30vh, 280px)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16, fontSize: 14, color: '#fff', resize: 'vertical', outline: 'none', fontFamily: 'var(--font-sans)', lineHeight: 1.7, boxSizing: 'border-box' }}/>
  );
}

function QuizTab({ isAdmin }: { isAdmin: boolean }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const correct = 1;
  const opts = ['Store data as a flat JSON object', 'Model real-world nouns as tables with relationships', 'Put everything in one big table', 'Use arrays to store all data'];

  if (!isAdmin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '48px 20px', color: 'rgba(255,255,255,0.2)' }}>
        <HelpCircle size={36} strokeWidth={1.2} />
        <p style={{ margin: 0, fontSize: 13, textAlign: 'center' }}>No quiz available for this lesson yet.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>What is the best approach to data modeling?</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {opts.map((opt, i) => {
          const isSel = selected === i, isCorr = submitted && i === correct, isWrong = submitted && isSel && i !== correct;
          return (
            <button key={i} onClick={() => !submitted && setSelected(i)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, textAlign: 'left', fontSize: 13, cursor: submitted ? 'default' : 'pointer', background: isCorr ? 'rgba(16,185,129,0.09)' : isWrong ? 'rgba(239,68,68,0.07)' : isSel ? 'rgba(99,102,241,0.09)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isCorr ? '#10B981' : isWrong ? '#EF4444' : isSel ? '#6366F1' : 'rgba(255,255,255,0.07)'}`, color: '#fff' }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, background: isSel ? '#6366F1' : 'rgba(255,255,255,0.07)', color: isSel ? '#fff' : 'rgba(255,255,255,0.45)' }}>{String.fromCharCode(65+i)}</span>
              <span style={{ flex: 1 }}>{opt}</span>
              {isCorr && <Check size={14} color="#10B981"/>}
            </button>
          );
        })}
      </div>
      {!submitted
        ? <Button variant="primary" size="sm" disabled={selected === null} onClick={() => setSubmitted(true)}>Submit answer</Button>
        : <div style={{ padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600, background: selected === correct ? 'rgba(16,185,129,0.09)' : 'rgba(239,68,68,0.07)', color: selected === correct ? '#10B981' : '#F87171', border: `1px solid ${selected === correct ? 'rgba(16,185,129,0.28)' : 'rgba(239,68,68,0.22)'}` }}>
            {selected === correct ? '✓ Correct! Well done.' : '✗ Not quite — correct answer is B.'}
          </div>
      }
    </div>
  );
}

function CodeTab({ isAdmin }: { isAdmin: boolean }) {
  const { t } = useT();
  const [code, setCode]     = useState(isAdmin ? '// Try it!\nconst greet = (name) => `Hello, ${name}!`;\nconsole.log(greet("World"));' : '');
  const [output, setOutput] = useState('');
  function run() {
    try {
      const logs: string[] = [];
      new Function('console', code)({ log: (...a: unknown[]) => logs.push(a.map(String).join(' ')) });
      setOutput(logs.join('\n') || '(no output)');
    } catch (e: unknown) { setOutput(`Error: ${e instanceof Error ? e.message : String(e)}`); }
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>JavaScript</span>
        <Button variant="mint" size="sm" iconLeft={<Play size={12}/>} onClick={run}>{t('player_run')}</Button>
      </div>
      <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} rows={9}
        style={{ width: '100%', padding: 16, borderRadius: 12, fontSize: 13, fontFamily: 'var(--font-mono)', background: '#07070C', border: '1px solid rgba(255,255,255,0.07)', color: '#E2E8F0', resize: 'none', outline: 'none', boxSizing: 'border-box' }}/>
      {output && (
        <div style={{ padding: '12px 16px', borderRadius: 12, fontSize: 13, fontFamily: 'var(--font-mono)', background: '#07070C', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981', whiteSpace: 'pre-wrap' }}>{output}</div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   RESOURCES TAB
══════════════════════════════════════════ */
function ResourcesTab({ files, courseSlug }: { files: CourseFile[]; courseSlug: string }) {
  const { t } = useT();
  if (files.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '40px 20px', color: 'rgba(255,255,255,0.25)' }}>
        <FolderOpen size={36} strokeWidth={1.2} />
        <p style={{ margin: 0, fontSize: 13, textAlign: 'center' }}>{t('player_no_resources')}</p>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <p style={{ margin: '0 0 4px', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
        {t('player_files_avail').replace('{count}', String(files.length))}
      </p>
      {files.map((f) => {
        const href = f.fileUrl ?? `/api/courses/${courseSlug}/files/${f.id}`;
        const isExternal = !!f.fileUrl;
        return (
          <a
            key={f.id}
            href={href}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            download={!isExternal ? (f.fileName ?? true) : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px', borderRadius: 12, textDecoration: 'none',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.08)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.3)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
            }}
          >
            {/* icon */}
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileText size={17} color="#818CF8" />
            </div>

            {/* info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.title}</div>
              {f.fileLabel && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{f.fileLabel}</div>}
            </div>

            {/* action badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 8, background: 'rgba(99,102,241,0.1)', color: '#818CF8', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
              {isExternal ? <ExternalLink size={11} /> : <Download size={11} />}
              {isExternal ? t('player_open') : t('player_download')}
            </div>
          </a>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════ */
export function PlayerClient({
  courseSlug, courseTitle, current, sections, lessonNumber, totalLessons, doneCount, nextId, files, isAdmin,
}: {
  courseSlug: string; courseTitle: string;
  current: { id: string; title: string; videoUrl: string | null; completed: boolean };
  sections: Section[]; lessonNumber: number; totalLessons: number;
  doneCount: number; nextId: string | null; enrolled: boolean;
  files: CourseFile[]; isAdmin: boolean;
}) {
  const { t } = useT();
  const [tab,      setTab]    = useState<'notes'|'quiz'|'code'|'resources'>('notes');
  const [notes,    setNotes]  = useState('');
  const [currOpen, setCurr]   = useState(false);
  const [isFS,     setIsFS]   = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const embed = getEmbed(current.videoUrl);

  useEffect(() => {
    const onFSChange = () => setIsFS(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFSChange);
    return () => document.removeEventListener('fullscreenchange', onFSChange);
  }, []);

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      // requestFullscreen on the iframe itself — the player fills the screen natively
      iframeRef.current?.requestFullscreen?.();
    }
  }

  const TABS = [
    { id: 'notes'     as const, label: t('player_notes'),     icon: <FileText   size={13}/> },
    { id: 'quiz'      as const, label: t('player_quiz'),      icon: <HelpCircle size={13}/> },
    { id: 'code'      as const, label: t('player_code'),      icon: <Code       size={13}/> },
    { id: 'resources' as const, label: `${t('player_resources')}${files.length > 0 ? ` (${files.length})` : ''}`, icon: <Download size={13}/> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0A0A0F', overflow: 'hidden' }}>

      {/* ─── TOP BAR ─── */}
      <header style={{ height: 56, background: '#0D0D15', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, flexShrink: 0, zIndex: 20 }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
          <ArrowLeft size={15}/> <span className="hidden sm:inline">{t('player_back')}</span>
        </Link>
        <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }}/>
        <span className="hidden sm:block" style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{courseTitle}</span>
        <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11, fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{lessonNumber} / {totalLessons}</span>

        {/* Complete & Continue */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {current.completed ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: 'rgba(16,185,129,0.1)', color: '#10B981', fontSize: 12, fontWeight: 700, border: '1px solid rgba(16,185,129,0.22)' }}>
              <CheckCircle2 size={13}/> {t('player_completed')}
            </span>
          ) : (
            <form action={completeLessonAction.bind(null, courseSlug, current.id)}>
              <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: '#10B981', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <Check size={12}/> <span className="hidden sm:inline">{t('player_complete')}</span><span className="sm:hidden">{t('player_complete_short')}</span>
              </button>
            </form>
          )}
          {nextId && (
            <Link href={`/learn/${courseSlug}/${nextId}`} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.07)', whiteSpace: 'nowrap' }}>
              {t('player_next')} <ChevronRight size={13}/>
            </Link>
          )}
        </div>

        {/* mobile: curriculum toggle */}
        <button className="lg:hidden" onClick={() => setCurr(true)}
          style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>
          <Menu size={15}/>
        </button>
      </header>

      {/* ─── 3-COLUMN BODY ─── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* LEFT — Curriculum (desktop) */}
        <aside className="hidden lg:block" style={{ width: 260, flexShrink: 0, overflow: 'hidden' }}>
          <CurriculumSidebar sections={sections} courseSlug={courseSlug} courseTitle={courseTitle} doneCount={doneCount} totalLessons={totalLessons}/>
        </aside>

        {/* Mobile curriculum drawer */}
        {currOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.65)', display: 'flex' }} onClick={() => setCurr(false)}>
            <aside style={{ width: 280, height: '100%', overflow: 'hidden', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
              <CurriculumSidebar sections={sections} courseSlug={courseSlug} courseTitle={courseTitle} doneCount={doneCount} totalLessons={totalLessons} onClose={() => setCurr(false)}/>
            </aside>
          </div>
        )}

        {/* CENTER — Video + tabs */}
        <main style={{ flex: 1, overflowY: 'auto', minWidth: 0, borderRight: '1px solid rgba(255,255,255,0.05)' }}>

          {/* video */}
          <div style={{ padding: '20px 20px 0', maxWidth: 800, margin: '0 auto' }}>
            <div style={{ borderRadius: 14, overflow: 'hidden', background: '#000', boxShadow: '0 20px 60px rgba(0,0,0,0.65)', position: 'relative' }}>
              {embed
                ? <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
                    <iframe
                      ref={iframeRef}
                      src={embed.src}
                      title={current.title}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                      allow={embed.allow}
                      allowFullScreen
                    />
                  </div>
                : <div style={{ aspectRatio: '16/9', width: '100%', background: 'linear-gradient(150deg,#1A1040,#090618)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Play size={28} color="#fff"/>
                    </div>
                  </div>
              }


              {/* Fullscreen button — expands the iframe itself, not the container */}
              {embed && (
                <button
                  onClick={toggleFullscreen}
                  title={isFS ? 'Exit fullscreen' : 'Fullscreen (F)'}
                  style={{
                    position: 'absolute', bottom: 10, right: 70,
                    width: 34, height: 34, borderRadius: 8,
                    background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    color: '#fff', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0.7, transition: 'opacity 0.15s',
                    zIndex: 5,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
                >
                  {isFS ? <Minimize2 size={15}/> : <Maximize2 size={15}/>}
                </button>
              )}
            </div>
          </div>

          {/* lesson title */}
          <div style={{ padding: '16px 20px 0', maxWidth: 800, margin: '0 auto' }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0, fontFamily: 'var(--font-display)' }}>{current.title}</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: '5px 0 0' }}>{t('player_lesson')} {lessonNumber} {t('player_of')} {totalLessons}</p>
          </div>

          {/* Notes / Quiz / Code tabs */}
          <div style={{ padding: '14px 20px 0', maxWidth: 800, margin: '0 auto', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex' }}>
              {TABS.map((t) => {
                const act = tab === t.id;
                return (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', background: 'transparent', color: act ? '#818CF8' : 'rgba(255,255,255,0.38)', borderBottom: `2px solid ${act ? '#6366F1' : 'transparent'}`, marginBottom: -1, whiteSpace: 'nowrap' }}>
                    {t.icon} {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ padding: '20px', maxWidth: 800, margin: '0 auto' }}>
            {tab === 'notes'     && <NotesTab value={notes} onChange={setNotes}/>}
            {tab === 'quiz'      && <QuizTab isAdmin={isAdmin}/>}
            {tab === 'code'      && <CodeTab isAdmin={isAdmin}/>}
            {tab === 'resources' && <ResourcesTab files={files} courseSlug={courseSlug}/>}
          </div>
        </main>

        {/* RIGHT — AI Tutor (desktop always visible) */}
        <aside className="hidden lg:flex" style={{ width: 300, flexShrink: 0, flexDirection: 'column', overflow: 'hidden' }}>
          <AiTutorPanel lessonTitle={current.title}/>
        </aside>

      </div>

      {/* Mobile: AI Tutor fixed bottom button → could expand, for now visible as tab */}
      <div className="lg:hidden" style={{ background: '#0D0D15', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '10px 16px' }}>
        <details style={{ all: 'unset', display: 'block' }}>
          <summary style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#22D3EE', fontSize: 13, fontWeight: 700, listStyle: 'none' }}>
            <Sparkles size={15}/> {t('player_tutor_tap')}
          </summary>
          <div style={{ marginTop: 12, height: 380, overflow: 'hidden', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)' }}>
            <AiTutorPanel lessonTitle={current.title}/>
          </div>
        </details>
      </div>

    </div>
  );
}
