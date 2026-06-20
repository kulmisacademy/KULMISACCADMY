'use client';
import { useT } from '@/lib/i18n/context';
import type { TranslationKey } from '@/lib/i18n/translations';

/**
 * Renders a translated string inline. Lets server components show translated
 * text without becoming client components — only this leaf is client-side.
 * Optional `vars` replaces {placeholders} in the translated string.
 */
export function Tr({ k, vars }: { k: TranslationKey; vars?: Record<string, string | number> }) {
  const { t } = useT();
  let s = t(k);
  if (vars) for (const [key, val] of Object.entries(vars)) s = s.replaceAll(`{${key}}`, String(val));
  return <>{s}</>;
}
