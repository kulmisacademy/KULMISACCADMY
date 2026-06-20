'use client';
import { useState } from 'react';
import { Plus, Trash2, Pencil, X, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { createAiPlanAction, updateAiPlanAction, deleteAiPlanAction } from '@/app/actions/admin';

type Plan = { id: string; name: string; price: string; credits: number; description: string; active: boolean };

const inputCls = 'h-9 px-3 rounded-md text-[13px] outline-none w-full';
const inputStyle = { background: 'var(--surface-page)', border: '1px solid var(--border-default)', color: 'var(--text-strong)' } as const;

function PlanFields({ p }: { p?: Plan }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <input name="name" required defaultValue={p?.name} placeholder="Plan name (e.g. Pro Pack)" className={inputCls} style={inputStyle} />
        <input name="price" defaultValue={p ? p.price : ''} placeholder="$15" className={inputCls} style={inputStyle} />
        <input name="credits" defaultValue={p ? String(p.credits) : ''} placeholder="500 or -1 for unlimited" className={inputCls} style={inputStyle} />
      </div>
      <input name="description" defaultValue={p?.description} placeholder="Short description" className={inputCls} style={inputStyle} />
      <label className="flex items-center gap-2 text-[13px] text-[var(--text-body)]"><input type="checkbox" name="active" defaultChecked={p ? p.active : true} /> Active (visible to users)</label>
    </>
  );
}

export function AdminAiPlansClient({ plans }: { plans: Plan[] }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <div className="p-4 sm:p-7 flex flex-col gap-6" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-[var(--text-strong)] m-0 tracking-tight flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}><Sparkles size={22} color="#22D3EE" /> AI Plans</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-1 m-0">Set the credit packs and pricing for the AI Prompt Studio. Users get {5} free generations.</p>
        </div>
        <Button variant="primary" size="sm" iconLeft={<Plus size={14} />} onClick={() => { setAdding((a) => !a); setEditing(null); }} className="sm:ml-auto flex-shrink-0">New plan</Button>
      </div>

      {adding && (
        <form action={(fd) => { createAiPlanAction(fd); setAdding(false); }} className="flex flex-col gap-2.5 p-4 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
          <PlanFields />
          <div className="flex gap-2"><Button variant="primary" size="sm" type="submit">Create plan</Button><button type="button" onClick={() => setAdding(false)} className="text-[13px] text-[var(--text-muted)] px-3">Cancel</button></div>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {plans.length === 0 && <div className="p-8 text-center text-[13px] text-[var(--text-muted)] rounded-lg" style={{ border: '1px solid var(--border-subtle)' }}>No AI plans yet. Add one so users can top up.</div>}
        {plans.map((p) => (
          editing === p.id ? (
            <form key={p.id} action={(fd) => { updateAiPlanAction(p.id, fd); setEditing(null); }} className="flex flex-col gap-2.5 p-4 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
              <PlanFields p={p} />
              <div className="flex gap-2"><Button variant="primary" size="sm" type="submit" iconLeft={<Check size={13} />}>Save</Button><button type="button" onClick={() => setEditing(null)} className="text-[13px] text-[var(--text-muted)] px-3 flex items-center gap-1"><X size={13} /> Cancel</button></div>
            </form>
          ) : (
            <div key={p.id} className="flex items-center gap-4 p-4 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><span className="text-[15px] font-bold text-[var(--text-strong)]">{p.name}</span>{!p.active && <Badge variant="default">hidden</Badge>}</div>
                <div className="text-[12px] text-[var(--text-muted)] mt-0.5">{p.price} · {p.credits === -1 ? 'unlimited' : `${p.credits} generations`}{p.description ? ` · ${p.description}` : ''}</div>
              </div>
              <button onClick={() => { setEditing(p.id); setAdding(false); }} className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-[var(--surface-raised)]" style={{ color: 'var(--text-muted)' }} aria-label="Edit"><Pencil size={14} /></button>
              <form action={deleteAiPlanAction.bind(null, p.id)}><button type="submit" className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-[var(--surface-raised)]" style={{ color: '#F87171' }} aria-label="Delete"><Trash2 size={14} /></button></form>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
