'use client';
import { useState } from 'react';
import { Sparkles, Code2, Wand2, Bot, Play, BookOpen, Clock } from 'lucide-react';
import { CategoryPill } from './ui/CategoryPill';
import { Badge } from './ui/Badge';
import { StarRating } from './ui/StarRating';
import { Avatar } from './ui/Avatar';
import type { Course } from '@/lib/types';
import { TRACK_META } from '@/lib/data';

const TrackIcons = { 'vibe-coding': Sparkles, 'traditional-coding': Code2, 'ai-tools': Wand2, 'ai-agents': Bot };

interface CourseCardProps {
  course: Course;
  onClick?: () => void;
  enrolled?: boolean;
  progress?: number;
}

export function CourseCard({ course, onClick, enrolled, progress }: CourseCardProps) {
  const [hovered, setHovered] = useState(false);
  const meta = TRACK_META[course.track];
  const Icon = TrackIcons[course.track];
  const isFree = course.price === 'Free';

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col rounded-lg border overflow-hidden cursor-pointer transition-all duration-200"
      style={{
        background: 'var(--surface-card)',
        borderColor: hovered ? 'rgba(99,102,241,0.4)' : 'var(--border-subtle)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? 'var(--shadow-xl), 0 0 0 1px rgba(99,102,241,0.15)' : 'var(--shadow-sm)',
      }}
    >
      {/* Thumbnail */}
      <div
        className="relative aspect-video flex items-center justify-center overflow-hidden"
        style={{ background: meta.bg }}
      >
        {course.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={course.thumbnailUrl} alt={course.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <>
            <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.15), transparent 60%)' }} />
            <div className="relative w-14 h-14 rounded-xl flex items-center justify-center bg-white/15 backdrop-blur-sm">
              <Icon size={28} color="#fff" />
            </div>
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <button
          className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          onClick={onClick}
          aria-label="Preview course"
        >
          <span className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Play size={20} fill="white" color="white" />
          </span>
        </button>
        {enrolled && (
          <div className="absolute top-3 right-3 bg-[#10B981] text-white text-[10px] font-bold px-2 py-0.5 rounded-pill uppercase tracking-wide font-mono">
            Enrolled
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryPill track={course.track} size="sm" />
          <Badge variant={course.level as 'beginner' | 'intermediate' | 'advanced' | 'all'}>
            {course.level}
          </Badge>
        </div>

        <h3
          className="text-[15px] font-semibold leading-snug text-[var(--text-strong)] line-clamp-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {course.title}
        </h3>

        <div className="flex items-center gap-2">
          <Avatar name={course.instructor.name} size={22} />
          <span className="text-[12px] text-[var(--text-muted)] truncate">{course.instructor.name}</span>
        </div>

        {progress !== undefined ? (
          <div className="mt-auto">
            <div className="h-1.5 rounded-full bg-[var(--neutral-200)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#6366F1] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[11px] text-[var(--text-muted)] mt-1 block font-mono">{progress}% complete</span>
          </div>
        ) : (
          <div className="mt-auto flex items-center justify-between gap-3 pt-2 border-t border-[var(--border-subtle)]">
            <StarRating rating={course.rating} reviewCount={course.reviews} />
            <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
              <span className="flex items-center gap-1"><Clock size={11} />{course.duration}</span>
              <span className="flex items-center gap-1"><BookOpen size={11} />{course.lessons}</span>
            </div>
            {isFree ? (
              <Badge variant="free">Free</Badge>
            ) : (
              <span className="text-[14px] font-bold text-[var(--text-strong)] font-mono">{course.price}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
