import Link from 'next/link';
import { Download, FileText, ArrowRight } from 'lucide-react';
import type { ResourceView } from '@/lib/queries';

export const RESOURCE_TYPES: Record<string, { label: string; color: string }> = {
  prd: { label: 'PRD', color: '#6366F1' },
  prompt: { label: 'Prompt Pack', color: '#22D3EE' },
  system: { label: 'System Prompt', color: '#10B981' },
  ebook: { label: 'eBook', color: '#F59E0B' },
  template: { label: 'Template', color: '#A855F7' },
  notion: { label: 'Notion Kit', color: '#EC4899' },
  other: { label: 'Resource', color: '#818CF8' },
};

export function ResourceCard({ resource }: { resource: ResourceView }) {
  const meta = RESOURCE_TYPES[resource.type] ?? RESOURCE_TYPES.other;
  return (
    <Link href={`/resources/${resource.id}`} className="group flex flex-col rounded-xl overflow-hidden no-underline transition-all duration-200"
      style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden" style={{ background: `linear-gradient(135deg, ${meta.color}22, ${meta.color}05)` }}>
        {resource.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resource.imageUrl} alt={resource.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><FileText size={40} color={meta.color} /></div>
        )}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-pill text-[11px] font-bold" style={{ background: 'rgba(0,0,0,0.55)', color: '#fff', backdropFilter: 'blur(4px)' }}>{meta.label}</span>
        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-pill text-[12px] font-bold" style={{ background: resource.isFree ? '#10B981' : '#fff', color: resource.isFree ? '#fff' : '#0F0F1A' }}>
          {resource.price}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-2">
        <h3 className="text-[15px] font-bold text-[var(--text-strong)] m-0 leading-snug" style={{ fontFamily: 'var(--font-display)' }}>{resource.title}</h3>
        <p className="text-[13px] text-[var(--text-muted)] leading-relaxed m-0 flex-1 line-clamp-2">{resource.description}</p>
        <div className="flex items-center justify-between mt-1 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <span className="flex items-center gap-1.5 text-[11px] text-[var(--text-subtle)] font-mono">
            <Download size={12} /> {resource.fileLabel || 'Download'}
          </span>
          <span className="flex items-center gap-1 text-[12px] font-semibold transition-colors" style={{ color: meta.color }}>
            {resource.isFree ? 'Get it free' : 'View'} <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
