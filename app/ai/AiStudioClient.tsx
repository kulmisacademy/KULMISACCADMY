'use client';
import { useState, useRef, useEffect, useTransition } from 'react';
import Link from 'next/link';
import {
  Wand2, FileText, MessageSquare, Send, Copy, Check, Download,
  Trash2, Plus, Sparkles, Zap, Lock, Loader2, Menu, X, CreditCard,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { WaafiCheckout } from '@/components/WaafiCheckout';
import {
  sendMessageAction, deleteConversationAction, loadConversationAction,
  type ConvSummary, type ChatResult,
} from '@/app/actions/ai';
import { payAiPlanAction } from '@/app/actions/payment';
import { buildZip } from '@/lib/zip';
import type { AiStatus, AiPlanView } from '@/lib/queries';

type Msg  = { id: string; role: string; content: string; tokens: number };
type Mode = 'prompt' | 'prd' | 'chat';

const MODES = [
  { id: 'prompt' as Mode, label: 'Prompt Engineer', short: 'Prompt', icon: <Wand2 size={14}/>,      color: '#818CF8', border: 'rgba(99,102,241,0.35)',  bg: 'rgba(99,102,241,0.1)'  },
  { id: 'prd'    as Mode, label: 'PRD Writer',      short: 'PRD',    icon: <FileText size={14}/>,   color: '#10B981', border: 'rgba(16,185,129,0.35)',  bg: 'rgba(16,185,129,0.1)'  },
  { id: 'chat'   as Mode, label: 'AI Chat',         short: 'Chat',   icon: <MessageSquare size={14}/>, color: '#F59E0B', border: 'rgba(245,158,11,0.35)', bg: 'rgba(245,158,11,0.1)' },
];

const HINTS: Record<Mode,string> = {
  prompt: 'Ku qor fikradaada — waxaan kuu samaynaa prompt aad u xoogan oo English ah…',
  prd:    'Sharax feature-ka — waxaan kuu qornaa PRD buuxa oo faahfaahsan…',
  chat:   'Weydiiso waxa rabtid — AI-ga kula hadlayaa…',
};

const CHIPS: Record<Mode, string[]> = {
  prompt: ['Build a chatbot for my website', 'Write a cold email to investors', 'Summarize this PDF for me'],
  prd:    ['User authentication system', 'AI-powered search feature', 'Payment checkout flow'],
  chat:   ['How do I start learning AI?', 'Maxaan bartaa marka hore?', 'Explain vibe coding simply'],
};

function estimateTokens(t: string) { return Math.ceil(t.length / 3.5); }

/* ─── inline markdown parser ─── */
function parseInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**'))
      return <strong key={i} className="font-semibold" style={{ color: 'var(--text-strong)' }}>{p.slice(2, -2)}</strong>;
    if (p.startsWith('`') && p.endsWith('`'))
      return <code key={i} className="px-1.5 py-0.5 rounded-md text-[12px]" style={{ background: 'rgba(0,0,0,0.35)', color: '#86EFAC', fontFamily: 'var(--font-mono)' }}>{p.slice(1, -1)}</code>;
    if (p.startsWith('*') && p.endsWith('*'))
      return <em key={i}>{p.slice(1, -1)}</em>;
    return p;
  });
}

/* ─── markdown block renderer ─── */
function MdContent({ text }: { text: string }) {
  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trimEnd();

    /* headings */
    if (/^#{1,3}\s/.test(line)) {
      const lvl = line.match(/^(#+)/)?.[1].length ?? 1;
      const content = line.replace(/^#+\s/, '');
      const sz = lvl === 1 ? 'text-[17px]' : lvl === 2 ? 'text-[15px]' : 'text-[14px]';
      blocks.push(
        <div key={i} className={`${sz} font-bold mt-4 mb-1.5 first:mt-0`} style={{ color: 'var(--text-strong)', fontFamily: 'var(--font-display)' }}>
          {parseInline(content)}
        </div>
      );
      i++; continue;
    }

    /* code block */
    if (line.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) { codeLines.push(lines[i]); i++; }
      blocks.push(
        <pre key={`cb-${i}`} className="my-2 p-3.5 rounded-xl overflow-x-auto text-[12.5px] leading-relaxed" style={{ background: 'rgba(0,0,0,0.45)', color: '#86EFAC', fontFamily: 'var(--font-mono)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      i++; continue;
    }

    /* bullet list group */
    if (/^[-*]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s/, ''));
        i++;
      }
      blocks.push(
        <ul key={`ul-${i}`} className="my-1.5 flex flex-col gap-1" style={{ paddingLeft: '1.25rem' }}>
          {items.map((it, idx) => (
            <li key={idx} className="text-[14px] leading-relaxed" style={{ color: 'var(--text-body)', listStyleType: 'disc' }}>
              {parseInline(it)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    /* numbered list group */
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      blocks.push(
        <ol key={`ol-${i}`} className="my-1.5 flex flex-col gap-1" style={{ paddingLeft: '1.5rem' }}>
          {items.map((it, idx) => (
            <li key={idx} className="text-[14px] leading-relaxed" style={{ color: 'var(--text-body)', listStyleType: 'decimal' }}>
              {parseInline(it)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    /* table */
    if (line.startsWith('|') && line.endsWith('|')) {
      const tableRows: string[][] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        const cells = lines[i].split('|').slice(1, -1).map((c) => c.trim());
        if (!cells.every((c) => /^[-:\s]+$/.test(c))) tableRows.push(cells);
        i++;
      }
      blocks.push(
        <div key={`tbl-${i}`} className="my-3 overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border-subtle)' }}>
          <table className="w-full text-left border-collapse">
            <thead style={{ background: 'rgba(255,255,255,0.04)' }}>
              <tr>{tableRows[0]?.map((c, ci) => <th key={ci} className="px-4 py-2.5 text-[12px] font-bold" style={{ color: 'var(--text-strong)', borderBottom: '1px solid var(--border-subtle)' }}>{c}</th>)}</tr>
            </thead>
            <tbody>
              {tableRows.slice(1).map((row, ri) => (
                <tr key={ri} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {row.map((c, ci) => <td key={ci} className="px-4 py-2 text-[13px]" style={{ color: 'var(--text-body)' }}>{parseInline(c)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    /* horizontal rule */
    if (/^---+$/.test(line.trim())) {
      blocks.push(<hr key={i} className="my-3" style={{ borderColor: 'var(--border-subtle)' }} />);
      i++; continue;
    }

    /* blank line */
    if (line.trim() === '') { blocks.push(<div key={`sp-${i}`} className="h-2" />); i++; continue; }

    /* paragraph */
    blocks.push(
      <p key={i} className="text-[14px] leading-relaxed" style={{ color: 'var(--text-body)' }}>
        {parseInline(line)}
      </p>
    );
    i++;
  }

  return <div className="flex flex-col gap-0.5">{blocks}</div>;
}

/* ─── message bubble ─── */
function MsgBubble({ msg, mode }: { msg: Msg; mode: Mode }) {
  const [copied, setCopied] = useState(false);
  const m = MODES.find((x) => x.id === mode)!;
  const isUser = msg.role === 'user';

  function copy() { navigator.clipboard.writeText(msg.content); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  function downloadMd() {
    const slug = msg.content.slice(0, 40).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/, '') || 'output';
    const blob = new Blob([msg.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${slug}.md`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[72%] px-4 py-3 rounded-2xl rounded-tr-sm text-[14px] leading-relaxed" style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color:'#fff', wordBreak:'break-word' }}>
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 mb-5 items-start">
      {/* avatar */}
      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: m.bg, border: `1px solid ${m.border}` }}>
        <span style={{ color: m.color, display:'flex' }}>{m.icon}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-semibold mb-1.5" style={{ color: m.color }}>{m.label} <span style={{ color:'var(--text-subtle)', fontWeight:400 }}>· ~{msg.tokens} tokens</span></div>

        {/* content card */}
        <div className="rounded-2xl rounded-tl-sm p-4" style={{ background:'var(--surface-card)', border:'1px solid var(--border-subtle)', boxShadow:'var(--shadow-sm)' }}>
          <MdContent text={msg.content} />
        </div>

        {/* action bar */}
        <div className="flex items-center gap-1.5 mt-2">
          <button onClick={copy} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors hover:bg-[var(--surface-raised)]" style={{ color: copied ? '#10B981' : 'var(--text-muted)' }}>
            {copied ? <Check size={12}/> : <Copy size={12}/>} {copied ? 'Copied' : 'Copy'}
          </button>
          <button onClick={downloadMd} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors hover:bg-[var(--surface-raised)]" style={{ color:'var(--text-muted)' }}>
            <Download size={12}/> .md
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── sidebar ─── */
function ConvSidebar({ convs, activeId, mode, onSelect, onDelete, onNew, onClose }: {
  convs: ConvSummary[]; activeId: string|null; mode: Mode;
  onSelect:(id:string,m:string)=>void; onDelete:(id:string)=>void; onNew:()=>void; onClose?:()=>void;
}) {
  const m = MODES.find((x) => x.id === mode)!;
  const modeIcon = (md: string) => {
    if (md === 'prd')  return <FileText size={12} style={{ color:'#10B981' }}/>;
    if (md === 'chat') return <MessageSquare size={12} style={{ color:'#F59E0B' }}/>;
    return <Wand2 size={12} style={{ color:'#818CF8' }}/>;
  };

  return (
    <div className="flex flex-col h-full" style={{ background:'var(--surface-card)', borderRight:'1px solid var(--border-subtle)' }}>
      <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom:'1px solid var(--border-subtle)' }}>
        <span className="text-[13px] font-bold" style={{ color:'var(--text-strong)' }}>History</span>
        <div className="flex items-center gap-1">
          <button onClick={onNew} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--surface-raised)]" style={{ color: m.color }} title="New chat"><Plus size={15}/></button>
          {onClose && <button onClick={onClose} className="lg:hidden w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[var(--surface-raised)]" style={{ color:'var(--text-muted)' }}><X size={15}/></button>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 px-2">
        {convs.length === 0
          ? <div className="text-center py-10 text-[12px]" style={{ color:'var(--text-muted)' }}>No chats yet</div>
          : convs.map((c) => {
              const active = c.id === activeId;
              return (
                <div key={c.id} onClick={() => onSelect(c.id, c.mode)}
                  className="group flex items-center gap-2 px-3 py-2.5 rounded-xl mb-1 cursor-pointer transition-all"
                  style={{ background: active ? m.bg : 'transparent', border: `1px solid ${active ? m.border : 'transparent'}` }}>
                  <span className="flex-shrink-0">{modeIcon(c.mode)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold truncate" style={{ color:'var(--text-strong)' }}>{c.title}</div>
                    <div className="text-[10px]" style={{ color:'var(--text-muted)' }}>{c.updatedAt}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                    className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center transition-opacity"
                    style={{ color:'#F87171' }}>
                    <Trash2 size={11}/>
                  </button>
                </div>
              );
            })
        }
      </div>
    </div>
  );
}

/* ─── credits chip with dropdown plans ─── */
function CreditsChip({ status, plans }: { status: AiStatus; plans: AiPlanView[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function close(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const label = status.unlimited ? '∞ Unlimited' : status.credits > 0 ? `${status.credits} credits` : `${status.freeLeft} free left`;
  const low = !status.unlimited && status.credits === 0 && status.freeLeft <= 1;

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors hover:opacity-80"
        style={{ background: low ? 'rgba(245,158,11,0.12)' : 'var(--surface-raised)', color: low ? '#F59E0B' : 'var(--text-muted)', border: `1px solid ${low ? 'rgba(245,158,11,0.3)' : 'var(--border-subtle)'}` }}>
        <Zap size={12} style={{ color: status.unlimited ? '#10B981' : low ? '#F59E0B' : '#10B981' }} />
        {label}
      </button>

      {open && plans.length > 0 && (
        <div className="absolute right-0 top-full mt-2 z-50 rounded-2xl p-4 flex flex-col gap-3"
          style={{ width:260, background:'var(--surface-card)', border:'1px solid var(--border-subtle)', boxShadow:'var(--shadow-lg)' }}>
          <div className="text-[12px] font-bold uppercase tracking-wide" style={{ color:'var(--text-muted)' }}>AI Plans</div>
          {plans.map((p) => (
            <div key={p.id} className="rounded-xl p-3" style={{ background:'var(--surface-raised)', border:'1px solid var(--border-subtle)' }}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[13px] font-bold" style={{ color:'var(--text-strong)' }}>{p.name}</span>
                <span className="text-[14px] font-bold" style={{ color:'#818CF8' }}>{p.price}</span>
              </div>
              <div className="text-[11px] mb-2.5" style={{ color:'#10B981' }}>{p.credits === -1 ? 'Unlimited generations' : `${p.credits} generations`}</div>
              <WaafiCheckout action={payAiPlanAction.bind(null, p.id)} amount={p.price} triggerLabel={`Buy ${p.name}`} triggerVariant="primary" title={`Get ${p.name}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── main export ─── */
export function AiStudioClient({ isLoggedIn, status, plans, conversations: initConvs, initialConvId, initialMessages, initialMode }: {
  isLoggedIn: boolean; status: AiStatus|null; plans: AiPlanView[];
  conversations: ConvSummary[]; initialConvId: string|null;
  initialMessages: Msg[]; initialMode: string;
}) {
  const [convs, setConvs]           = useState<ConvSummary[]>(initConvs);
  const [activeConvId, setActConv]  = useState<string|null>(initialConvId);
  const [messages, setMessages]     = useState<Msg[]>(initialMessages);
  const [mode, setMode]             = useState<Mode>((initialMode as Mode) || 'prompt');
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [curStatus, setCurStatus]   = useState(status);
  const [needPlan, setNeedPlan]     = useState(false);
  const [sidebarOpen, setSidebar]   = useState(false);
  const [, start] = useTransition();
  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const tokens = estimateTokens(input);
  const isLong = input.length > 600;
  const curMode = MODES.find((m) => m.id === mode)!;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, loading]);

  function autoResize() {
    const t = textareaRef.current;
    if (!t) return;
    t.style.height = 'auto';
    t.style.height = Math.min(t.scrollHeight, 180) + 'px';
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput(''); if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setNeedPlan(false);
    const tmpId = `t${Date.now()}`;
    setMessages((p) => [...p, { id: tmpId, role:'user', content: text, tokens: estimateTokens(text) }]);
    setLoading(true);

    const history = messages.map((m) => ({ role: m.role as 'user'|'assistant', content: m.content }));
    const res: ChatResult = await sendMessageAction(activeConvId, text, mode, history);

    if (res.ok) {
      setMessages((p) => [...p, { id:`a${Date.now()}`, role:'assistant', content: res.aiContent, tokens: res.tokens }]);
      setCurStatus((s) => s ? { ...s, freeLeft: res.freeLeft, credits: res.credits, unlimited: res.unlimited } : s);
      if (res.convId !== activeConvId) {
        setActConv(res.convId);
        setConvs((p) => [{ id:res.convId, title: text.slice(0,60), mode, updatedAt:'just now' }, ...p]);
      } else {
        setConvs((p) => p.map((c) => c.id === res.convId ? { ...c, updatedAt:'just now' } : c));
      }
    } else {
      setMessages((p) => p.filter((m) => m.id !== tmpId));
      if (res.needPlan) setNeedPlan(true); else alert(res.error);
    }
    setLoading(false);
  }

  async function selectConv(id: string, cm: string) {
    setSidebar(false); setActConv(id); setMode(cm as Mode); setMessages([]); setNeedPlan(false); setLoading(true);
    const r = await loadConversationAction(id);
    if ('messages' in r) { setMessages(r.messages.map((m) => ({ id:m.id, role:m.role, content:m.content, tokens:m.tokens }))); setMode(r.mode as Mode); }
    setLoading(false);
  }

  function newChat() { setActConv(null); setMessages([]); setNeedPlan(false); setSidebar(false); }

  function deleteConv(id: string) {
    start(async () => {
      await deleteConversationAction(id);
      setConvs((p) => p.filter((c) => c.id !== id));
      if (activeConvId === id) { setActConv(null); setMessages([]); }
    });
  }

  function exportZip() {
    const outs = messages.filter((m) => m.role === 'assistant');
    if (!outs.length) return;
    const files = [
      ...outs.map((m, i) => ({ name:`output-${i+1}.md`, content: m.content })),
      { name:'conversation.md', content: messages.map((m) => `## ${m.role==='user'?'You':'AI'}\n\n${m.content}`).join('\n\n---\n\n') },
    ];
    const zip = buildZip(files);
    const url = URL.createObjectURL(zip);
    const a = document.createElement('a'); a.href = url; a.download = 'kulmis-ai.zip';
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  /* not logged in */
  if (!isLoggedIn) return (
    <div style={{ background:'var(--surface-page)', minHeight:'100vh' }}>
      <Navbar />
      <div className="flex flex-col items-center justify-center py-24 px-5 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background:'rgba(129,140,248,0.12)', border:'1px solid rgba(129,140,248,0.25)' }}>
          <Sparkles size={28} style={{ color:'#818CF8' }}/>
        </div>
        <h1 className="text-[26px] font-bold text-[var(--text-strong)] mb-2" style={{ fontFamily:'var(--font-display)' }}>Kulmis AI Studio</h1>
        <p className="text-[14px] max-w-md mb-6" style={{ color:'var(--text-muted)' }}>
          Engineer prompts, write PRDs, chat with AI — history saved, ZIP export. First {status?.freeLimit ?? 5} generations free.
        </p>
        <Link href="/sign-up?next=/ai"><Button variant="primary" size="md">Create free account</Button></Link>
      </div>
    </div>
  );

  return (
    <div style={{ background:'var(--surface-page)', height:'100vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <Navbar />

      <div style={{ flex:1, display:'flex', overflow:'hidden', position:'relative' }}>

        {/* mobile overlay */}
        {sidebarOpen && <div className="lg:hidden fixed inset-0 z-40" style={{ background:'rgba(0,0,0,0.5)' }} onClick={() => setSidebar(false)}/>}

        {/* mobile sidebar drawer */}
        <div className="lg:hidden fixed left-0 top-0 h-full z-50 transition-transform duration-200" style={{ width:260, transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
          <ConvSidebar convs={convs} activeId={activeConvId} mode={mode} onSelect={selectConv} onDelete={deleteConv} onNew={newChat} onClose={() => setSidebar(false)}/>
        </div>

        {/* desktop sidebar */}
        <div className="hidden lg:block flex-shrink-0" style={{ width:248, borderRight:'1px solid var(--border-subtle)' }}>
          <ConvSidebar convs={convs} activeId={activeConvId} mode={mode} onSelect={selectConv} onDelete={deleteConv} onNew={newChat}/>
        </div>

        {/* main */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* top bar */}
          <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5" style={{ background:'var(--surface-card)', borderBottom:'1px solid var(--border-subtle)' }}>
            <button className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center" style={{ color:'var(--text-muted)', background:'var(--surface-raised)' }} onClick={() => setSidebar(true)}>
              <Menu size={17}/>
            </button>

            {/* mode tabs */}
            <div className="flex items-center gap-1 flex-1 overflow-x-auto">
              {MODES.map((m) => {
                const act = mode === m.id;
                return (
                  <button key={m.id} onClick={() => { setMode(m.id); newChat(); }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap flex-shrink-0"
                    style={{ background: act ? m.bg : 'transparent', color: act ? m.color : 'var(--text-muted)', border:`1.5px solid ${act ? m.border : 'transparent'}` }}>
                    {m.icon}
                    <span className="hidden sm:inline">{m.label}</span>
                    <span className="sm:hidden">{m.short}</span>
                  </button>
                );
              })}
            </div>

            {/* right actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {curStatus && <CreditsChip status={curStatus} plans={plans}/>}
              {messages.some((m) => m.role === 'assistant') && (
                <button onClick={exportZip} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold hover:opacity-80 transition-opacity"
                  style={{ background:'var(--surface-raised)', color:'var(--text-muted)', border:'1px solid var(--border-subtle)' }}>
                  <Download size={13}/> ZIP
                </button>
              )}
            </div>
          </div>

          {/* messages */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 sm:px-8 py-6 mx-auto" style={{ maxWidth:780 }}>

              {/* empty state */}
              {messages.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center text-center" style={{ minHeight:380 }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: curMode.bg, border:`1px solid ${curMode.border}` }}>
                    <span style={{ color: curMode.color, transform:'scale(1.4)', display:'flex' }}>{curMode.icon}</span>
                  </div>
                  <h2 className="text-[20px] font-bold mb-2" style={{ color:'var(--text-strong)', fontFamily:'var(--font-display)' }}>{curMode.label}</h2>
                  <p className="text-[14px] max-w-xs" style={{ color:'var(--text-muted)' }}>{HINTS[mode]}</p>
                  <div className="flex flex-wrap gap-2 justify-center mt-5">
                    {CHIPS[mode].map((chip) => (
                      <button key={chip} onClick={() => { setInput(chip); setTimeout(() => textareaRef.current?.focus(), 50); }}
                        className="px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-colors hover:opacity-80"
                        style={{ background:'var(--surface-card)', border:'1px solid var(--border-subtle)', color:'var(--text-body)' }}>
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) => <MsgBubble key={m.id} msg={m} mode={mode}/>)}

              {/* typing indicator */}
              {loading && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: curMode.bg, border:`1px solid ${curMode.border}` }}>
                    <Loader2 size={13} className="animate-spin" style={{ color: curMode.color }}/>
                  </div>
                  <div className="flex gap-1.5 px-4 py-3 rounded-2xl" style={{ background:'var(--surface-card)', border:'1px solid var(--border-subtle)' }}>
                    {[0,1,2].map((i) => (
                      <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: curMode.color, opacity:0.7, animationDelay:`${i*0.18}s` }}/>
                    ))}
                  </div>
                </div>
              )}

              {/* needs plan */}
              {needPlan && (
                <div className="rounded-2xl p-5 text-center mb-4" style={{ background:'var(--surface-card)', border:'1px solid rgba(245,158,11,0.3)' }}>
                  <Lock size={22} className="mx-auto mb-2" style={{ color:'#F59E0B' }}/>
                  <div className="text-[14px] font-bold text-[var(--text-strong)] mb-1">Credits needed</div>
                  <div className="text-[13px] mb-4" style={{ color:'var(--text-muted)' }}>Buy an AI plan to keep generating.</div>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {plans.map((p) => (
                      <WaafiCheckout key={p.id} action={payAiPlanAction.bind(null, p.id)} amount={p.price} triggerLabel={`${p.name} · ${p.price}`} triggerVariant="primary" title={`Get ${p.name}`}/>
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef}/>
            </div>
          </div>

          {/* input bar */}
          <div className="flex-shrink-0 px-4 sm:px-8 pb-5 pt-3" style={{ background:'var(--surface-page)' }}>
            <div style={{ maxWidth:780, margin:'0 auto' }}>
              <div className="rounded-2xl overflow-hidden transition-all duration-200"
                style={{ background:'var(--surface-card)', border:`1.5px solid ${input ? curMode.color+'55' : 'var(--border-subtle)'}`, boxShadow:'var(--shadow-md)' }}>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => { setInput(e.target.value); autoResize(); }}
                  onKeyDown={(e) => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder={HINTS[mode]}
                  rows={2}
                  disabled={loading}
                  className="w-full px-4 pt-4 pb-2 text-[14px] outline-none resize-none"
                  style={{ background:'transparent', color:'var(--text-strong)', maxHeight:180, lineHeight:1.6, fontFamily:'var(--font-sans)' }}
                />
                <div className="flex items-center justify-between px-4 pb-3">
                  <div className="flex items-center gap-3 text-[11px]" style={{ color:'var(--text-subtle)' }}>
                    <span style={{ color: isLong ? '#F59E0B' : 'inherit' }}>
                      ~{tokens} tokens{isLong && <span className="ml-1 font-semibold" style={{ color:'#F59E0B' }}>· uses 1 credit</span>}
                    </span>
                    <span className="hidden sm:inline">Enter ↵ send · Shift+Enter newline</span>
                  </div>
                  <button
                    onClick={send}
                    disabled={loading || !input.trim()}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                    style={{
                      background: input.trim() ? `linear-gradient(135deg,${curMode.color},${mode==='prompt'?'#8B5CF6':mode==='prd'?'#059669':'#D97706'})` : 'var(--surface-raised)',
                      color: input.trim() ? '#fff' : 'var(--text-subtle)',
                      border:'none', cursor: input.trim() ? 'pointer' : 'default',
                    }}>
                    {loading ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>}
                  </button>
                </div>
              </div>
              <div className="text-center mt-2 text-[10px]" style={{ color:'var(--text-subtle)' }}>
                Somali input supported · Output always in English
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
