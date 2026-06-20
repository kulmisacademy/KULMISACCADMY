'use client';
import { useEffect, useRef } from 'react';

export function NeuralMesh() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    const COLORS = ['#6366F1', '#22D3EE'];

    interface Node {
      x: number; y: number; vx: number; vy: number; r: number; c: string;
    }
    let nodes: Node[] = [];

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas!.width = w * dpr; canvas!.height = h * dpr;
      canvas!.style.width = w + 'px'; canvas!.style.height = h + 'px';
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(38, Math.min(64, Math.round(w * h / 22000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.32, vy: (Math.random() - 0.5) * 0.32,
        r: 1.4 + Math.random() * 1.8, c: COLORS[Math.random() < 0.5 ? 0 : 1],
      }));
    }

    function frame() {
      ctx!.clearRect(0, 0, w, h);
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < 120) {
            ctx!.strokeStyle = a.c;
            ctx!.globalAlpha = 0.15 * (1 - d / 120);
            ctx!.lineWidth = 1;
            ctx!.beginPath(); ctx!.moveTo(a.x, a.y); ctx!.lineTo(b.x, b.y); ctx!.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx!.globalAlpha = 0.85; ctx!.fillStyle = n.c;
        ctx!.beginPath(); ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx!.fill();
        ctx!.globalAlpha = 0.18;
        ctx!.beginPath(); ctx!.arc(n.x, n.y, n.r * 3.4, 0, Math.PI * 2); ctx!.fill();
      }
      ctx!.globalAlpha = 1;
      if (!reduce) raf = requestAnimationFrame(frame);
    }

    resize();
    frame();

    const ro = new ResizeObserver(() => { resize(); if (reduce) frame(); });
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
