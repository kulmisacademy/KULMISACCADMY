'use client';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const stored = (localStorage.getItem('kulmis-theme') as 'dark' | 'light') ?? 'dark';
    setTheme(stored);
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('kulmis-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  }

  return (
    <button
      onClick={toggle}
      className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
      style={{
        background: 'var(--neutral-100)',
        color: 'var(--text-muted)',
        border: '1px solid var(--border-subtle)',
      }}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
