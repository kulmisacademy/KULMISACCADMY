import { notFound, redirect } from 'next/navigation';
import { getLessonPlayer } from '@/lib/queries';
import { getSessionUserId } from '@/lib/auth';
import { PlayerClient } from './PlayerClient';

export const dynamic = 'force-dynamic';

export default async function PlayerPage({ params }: { params: { course: string; lesson: string } }) {
  const userId = await getSessionUserId();

  // Must be logged in to access any lesson
  if (!userId) redirect(`/sign-in?next=/learn/${params.course}/${params.lesson}`);

  const data = await getLessonPlayer(params.course, userId);
  if (!data) notFound();

  const allLessons = data.sections.flatMap((s) => s.lessons);
  let lessonId = params.lesson;
  if (lessonId === 'start' || !allLessons.find((l) => l.id === lessonId)) {
    lessonId = data.currentLessonId ?? allLessons[0]?.id;
  }
  const idx = allLessons.findIndex((l) => l.id === lessonId);
  const current = allLessons[idx];
  if (!current) notFound();

  // Security: non-free lessons require enrollment (paid or enrolled)
  if (!current.free && !data.enrolled) {
    redirect(`/courses/${params.course}?mustpay=1`);
  }

  return (
    <PlayerClient
      courseSlug={params.course}
      courseTitle={data.course.title}
      current={{ id: current.id, title: current.t, videoUrl: current.videoUrl, completed: current.s === 'completed' }}
      sections={data.sections.map((s) => ({
        section: s.section,
        lessons: s.lessons.map((l) => ({ id: l.id, t: l.t, d: l.d, s: l.id === current.id ? 'active' : l.s, free: l.free })),
      }))}
      lessonNumber={idx + 1}
      totalLessons={allLessons.length}
      doneCount={data.doneCount}
      nextId={allLessons[idx + 1]?.id ?? null}
      enrolled={data.enrolled}
      files={data.files}
    />
  );
}
