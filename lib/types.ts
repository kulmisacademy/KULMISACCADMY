export type Track = 'vibe-coding' | 'traditional-coding' | 'ai-tools' | 'ai-agents';
export type Level = 'beginner' | 'intermediate' | 'advanced' | 'all';

export interface Instructor {
  name: string;
  title: string;
  rating: number;
  students: number;
  courses: number;
  bio: string;
}

export interface Course {
  id: string;
  title: string;
  track: Track;
  instructor: Instructor;
  lessons: number;
  duration: string;
  level: Level;
  rating: number;
  reviews: number;
  price: string;
  langs: string[];
  hours: number;
}

export interface Enrollment {
  id: string;
  progress: number;
  lesson: number;
  completed: boolean;
  completedDate?: string;
}

export interface LessonItem {
  t: string;
  d: string;
  s: 'completed' | 'active' | 'default' | 'locked';
  free?: boolean;
}

export interface CurriculumSection {
  section: string;
  lessons: LessonItem[];
}

export interface Review {
  name: string;
  date: string;
  rating: number;
  text: string;
}

export interface ActivityItem {
  icon: string;
  text: string;
  time: string;
  tone: 'mint' | 'purple' | 'indigo' | 'amber';
}

export interface AdminUser {
  name: string;
  email: string;
  role: string;
  plan: string;
  joined: string;
}
