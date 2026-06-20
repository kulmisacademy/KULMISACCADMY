'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Download, Check, ArrowLeft, FileText, ShieldCheck, Lock, ChevronLeft, ChevronRight, X, Copy, Eye, EyeOff, FlaskConical } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { WaafiCheckout } from '@/components/WaafiCheckout';
import { RESOURCE_TYPES } from '@/components/ResourceCard';
import { payForResourceAction } from '@/app/actions/payment';
import type { ResourceView } from '@/lib/queries';
import { useT } from '@/lib/i18n/context';

function DemoModal({ user, pass, onClose }: { user: string | null; pass: string | null; onClose: () => void }) {
  const { t } = useT();
  const [showPass, setShowPass] = useState(false);
  const [copiedUser, setCopiedUser] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  function copy(text: string, setDone: (v: boolean) => void) {
    navigator.clipboard.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 2000); });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full rounded-xl overflow-hidden" style={{ maxWidth: 400, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xl)' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(99,102,241,0.08)' }}>
          <div className="flex items-center gap-2.5">
            <FlaskConical size={18} color="#818CF8" />
            <span className="text-[15px] font-bold" style={{ color: 'var(--text-strong)' }}>{t('rd_demo_title')}</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <p className="text-[12px] m-0" style={{ color: 'var(--text-muted)' }}>
            {t('rd_demo_desc')}
          </p>

          {user && (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--text-muted)' }}>{t('rd_demo_user')}</label>
              <div className="flex items-center gap-2 px-3 rounded-md h-10" style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border-default)' }}>
                <span className="flex-1 text-[14px] font-mono truncate" style={{ color: 'var(--text-strong)' }}>{user}</span>
                <button onClick={() => copy(user, setCopiedUser)} className="flex-shrink-0 flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded" style={{ color: copiedUser ? '#10B981' : 'var(--text-muted)' }}>
                  <Copy size={12} />{copiedUser ? t('rd_copied') : t('rd_copy')}
                </button>
              </div>
            </div>
          )}

          {pass && (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--text-muted)' }}>{t('rd_demo_pass')}</label>
              <div className="flex items-center gap-2 px-3 rounded-md h-10" style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border-default)' }}>
                <span className="flex-1 text-[14px] font-mono truncate" style={{ color: 'var(--text-strong)' }}>{showPass ? pass : '••••••••'}</span>
                <button onClick={() => setShowPass((v) => !v)} className="flex-shrink-0 px-1.5 py-1 rounded" style={{ color: 'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={() => copy(pass, setCopiedPass)} className="flex-shrink-0 flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded" style={{ color: copiedPass ? '#10B981' : 'var(--text-muted)' }}>
                  <Copy size={12} />{copiedPass ? t('rd_copied') : t('rd_copy')}
                </button>
              </div>
            </div>
          )}

          <button onClick={onClose} className="w-full h-10 rounded-md text-[14px] font-semibold mt-1" style={{ background: 'rgba(99,102,241,0.12)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.25)' }}>
            {t('btn_close')}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ResourceDetailClient({ resource, isLoggedIn, purchased }: { resource: ResourceView; isLoggedIn: boolean; purchased: boolean }) {
  const { t } = useT();
  const meta = RESOURCE_TYPES[resource.type] ?? RESOURCE_TYPES.other;
  const downloadHref = `/api/resources/${resource.id}/download`;
  const canDownload = resource.isFree || purchased;
  const gallery = resource.images.length ? resource.images : (resource.imageUrl ? [resource.imageUrl] : []);
  const [active, setActive] = useState(0);
  const [showDemo, setShowDemo] = useState(false);
  const go = (d: number) => setActive((a) => (a + d + gallery.length) % gallery.length);
  const hasDemo = !!(resource.demoUser || resource.demoPass);

  return (
    <div style={{ background: 'var(--surface-page)', minHeight: '100vh' }}>
      <Navbar />

      {showDemo && <DemoModal user={resource.demoUser} pass={resource.demoPass} onClose={() => setShowDemo(false)} />}

      <div style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-subtle)' }}>
        <div className="mx-auto px-5 sm:px-8 py-3 flex items-center gap-2 text-[12px]" style={{ maxWidth: 'var(--container-max)', color: 'var(--text-muted)' }}>
          <Link href="/resources" className="hover:text-[var(--text-body)] flex items-center gap-1.5"><ArrowLeft size={13} /> {t('nav_resources')}</Link>
          <span>/</span>
          <span style={{ color: meta.color }}>{meta.label}</span>
        </div>
      </div>

      <div className="mx-auto px-5 sm:px-8 py-10" style={{ maxWidth: 'var(--container-max)' }}>
        <div className="grid gap-8 lg:gap-10 items-start grid-cols-1 lg:grid-cols-[1fr_360px]">
          {/* Left */}
          <div>
            <div className="mb-6">
              <div className="relative rounded-xl overflow-hidden aspect-[16/9] group" style={{ border: '1px solid var(--border-subtle)', background: `linear-gradient(135deg, ${meta.color}18, ${meta.color}05)` }}>
                {gallery.length ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={gallery[active]} alt={resource.title} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><FileText size={56} color={meta.color} /></div>
                )}
                {gallery.length > 1 && (
                  <>
                    <button onClick={() => go(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }} aria-label="Previous"><ChevronLeft size={18} /></button>
                    <button onClick={() => go(1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }} aria-label="Next"><ChevronRight size={18} /></button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {gallery.map((_, i) => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full transition-all" style={{ background: i === active ? '#fff' : 'rgba(255,255,255,0.45)', width: i === active ? 16 : 6 }} />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {gallery.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {gallery.map((img, i) => (
                    <button key={i} onClick={() => setActive(i)} className="flex-shrink-0 rounded-lg overflow-hidden transition-all" style={{ border: i === active ? `2px solid ${meta.color}` : '2px solid var(--border-subtle)', opacity: i === active ? 1 : 0.7 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="w-20 h-14 object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-pill text-[11px] font-bold text-white" style={{ background: meta.color }}>{meta.label}</span>
              <span className="text-[12px] text-[var(--text-muted)] font-mono">{resource.fileLabel}</span>
            </div>
            <h1 className="text-[30px] font-bold text-[var(--text-strong)] mb-4 leading-tight" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{resource.title}</h1>

            {resource.description && (
              <p className="text-[15px] text-[var(--text-body)] leading-relaxed mb-7 whitespace-pre-line">{resource.description}</p>
            )}

            {resource.highlights.length > 0 && (
              <div>
                <h3 className="text-[17px] font-bold text-[var(--text-strong)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>{t('rd_whats_inside')}</h3>
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                  {resource.highlights.map((h) => (
                    <div key={h} className="flex items-start gap-3 text-[13px] text-[var(--text-body)]"><Check size={16} color="#10B981" className="mt-0.5 flex-shrink-0" />{h}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — download/buy card */}
          <div className="rounded-xl overflow-hidden lg:sticky lg:top-24 order-first lg:order-none" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-baseline gap-2">
                {resource.isFree
                  ? <span className="text-[30px] font-bold text-[#10B981]" style={{ fontFamily: 'var(--font-display)' }}>{t('pricing_free_title')}</span>
                  : <span className="text-[30px] font-bold text-[var(--text-strong)]" style={{ fontFamily: 'var(--font-display)' }}>{resource.price}</span>}
                {purchased && !resource.isFree && <span className="text-[12px] font-semibold text-[#10B981]">· {t('rd_purchased')}</span>}
              </div>

              {canDownload ? (
                <a href={downloadHref} target="_blank" rel="noopener noreferrer">
                  <Button variant="mint" size="lg" fullWidth iconLeft={<Download size={16} />}>{t('rd_download_now')}</Button>
                </a>
              ) : !isLoggedIn ? (
                <>
                  <Link href={`/sign-up?next=/resources/${resource.id}`}>
                    <Button variant="primary" size="lg" fullWidth>{t('rd_create_buy')}</Button>
                  </Link>
                  <p className="text-[12px] text-center text-[var(--text-muted)] m-0">
                    {t('rd_already')}{' '}
                    <Link href={`/sign-in?next=/resources/${resource.id}`} className="font-semibold no-underline" style={{ color: 'var(--text-link)' }}>{t('rd_signin')}</Link>
                  </p>
                </>
              ) : (
                <WaafiCheckout
                  action={payForResourceAction.bind(null, resource.id)}
                  amount={resource.price}
                  triggerLabel={`${t('rd_buy_now')} · ${resource.price}`}
                  title={t('rd_buy_unlock_title').replace('{title}', resource.title)}
                />
              )}

              {!canDownload && !resource.isFree && (
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-subtle)]"><Lock size={12} /> {t('rd_unlock_after')}</div>
              )}

              {hasDemo && (
                <button
                  onClick={() => setShowDemo(true)}
                  className="w-full h-10 rounded-md text-[14px] font-semibold flex items-center justify-center gap-2"
                  style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#818CF8' }}
                >
                  <FlaskConical size={15} /> {t('rd_try_demo')}
                </button>
              )}

              <div className="flex flex-col gap-2.5 pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center gap-2.5 text-[13px] text-[var(--text-body)]"><FileText size={15} color="var(--text-muted)" /> {resource.fileLabel || t('rd_digital')}</div>
                <div className="flex items-center gap-2.5 text-[13px] text-[var(--text-body)]"><Download size={15} color="var(--text-muted)" /> {resource.downloads} {t('rd_downloads')}</div>
                <div className="flex items-center gap-2.5 text-[13px] text-[var(--text-body)]"><ShieldCheck size={15} color="var(--text-muted)" /> {t('rd_secure')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
