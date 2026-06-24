'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { and, eq, asc, max, count } from 'drizzle-orm';
import { db, courses, lessons, users, resources, courseResources, aiPlans, instructors } from '@/lib/db';
import { enrollments } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') throw new Error('Not authorized');
  return user;
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'course';
}

async function uniqueSlug(base: string, ignoreId?: string) {
  let slug = base;
  let i = 1;
  while (true) {
    const existing = await db.query.courses.findFirst({ where: (c, { eq }) => eq(c.slug, slug) });
    if (!existing || existing.id === ignoreId) return slug;
    slug = `${base}-${++i}`;
  }
}

function priceFields(raw: string) {
  const v = raw.trim();
  const free = v === '' || /^(free|0|\$0)$/i.test(v);
  return { price: free ? 'Free' : (v.startsWith('$') ? v : `$${v}`), isFree: free };
}

function lines(raw: FormDataEntryValue | null): string[] {
  return String(raw || '').split('\n').map((s) => s.trim()).filter(Boolean);
}

async function recountLessons(courseId: string) {
  const rows = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.courseId, courseId));
  await db.update(courses).set({ lessonCount: rows.length }).where(eq(courses.id, courseId));
}

async function recountInstructorCourses(instructorId: string | null | undefined) {
  if (!instructorId) return;
  const [row] = await db.select({ n: count() }).from(courses).where(eq(courses.instructorId, instructorId));
  await db.update(instructors).set({ courseCount: row?.n ?? 0 }).where(eq(instructors.id, instructorId));
}

/* ───────── Courses ───────── */
export async function createCourseAction(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get('title') || '').trim();
  if (!title) throw new Error('Title is required.');
  const { price, isFree } = priceFields(String(formData.get('price') || ''));
  const langs = String(formData.get('langs') || 'en').split(',').map((s) => s.trim()).filter(Boolean);
  const slug = await uniqueSlug(slugify(title));

  const instructorId = (formData.get('instructorId') as string) || null;
  await db.insert(courses).values({
    slug,
    title,
    track: String(formData.get('track') || 'vibe-coding') as 'vibe-coding',
    level: String(formData.get('level') || 'beginner') as 'beginner',
    instructorId,
    duration: String(formData.get('duration') || ''),
    hours: Number(formData.get('hours') || 0),
    price,
    isFree,
    langs: langs.length ? langs : ['en'],
    description: String(formData.get('description') || ''),
    learnPoints: lines(formData.get('learnPoints')),
    requirements: lines(formData.get('requirements')),
    thumbnailUrl: (formData.get('thumbnailUrl') as string) || null,
  });

  await recountInstructorCourses(instructorId);
  revalidatePath('/admin/courses');
  revalidatePath('/courses');
  redirect(`/admin/courses/${slug}`);
}

export async function updateCourseAction(courseSlug: string, formData: FormData) {
  await requireAdmin();
  const course = await db.query.courses.findFirst({ where: (c, { eq }) => eq(c.slug, courseSlug) });
  if (!course) throw new Error('Course not found.');

  const title = String(formData.get('title') || '').trim();
  const { price, isFree } = priceFields(String(formData.get('price') || ''));
  const langs = String(formData.get('langs') || 'en').split(',').map((s) => s.trim()).filter(Boolean);
  const newSlug = title !== course.title ? await uniqueSlug(slugify(title), course.id) : course.slug;

  const newInstructorId = (formData.get('instructorId') as string) || null;
  await db.update(courses).set({
    slug: newSlug,
    title,
    track: String(formData.get('track') || course.track) as 'vibe-coding',
    level: String(formData.get('level') || course.level) as 'beginner',
    instructorId: newInstructorId,
    duration: String(formData.get('duration') || ''),
    hours: Number(formData.get('hours') || 0),
    price,
    isFree,
    langs: langs.length ? langs : ['en'],
    description: String(formData.get('description') || ''),
    learnPoints: lines(formData.get('learnPoints')),
    requirements: lines(formData.get('requirements')),
    thumbnailUrl: (formData.get('thumbnailUrl') as string) || null,
  }).where(eq(courses.id, course.id));

  // Recount both old and new instructor in case instructor changed
  await recountInstructorCourses(course.instructorId);
  if (newInstructorId !== course.instructorId) await recountInstructorCourses(newInstructorId);
  revalidatePath('/admin/courses');
  revalidatePath(`/courses/${newSlug}`);
  redirect(`/admin/courses/${newSlug}`);
}

export async function deleteCourseAction(courseSlug: string) {
  await requireAdmin();
  const course = await db.query.courses.findFirst({ where: (c, { eq }) => eq(c.slug, courseSlug) });
  await db.delete(courses).where(eq(courses.slug, courseSlug));
  if (course?.instructorId) await recountInstructorCourses(course.instructorId);
  revalidatePath('/admin/courses');
  revalidatePath('/courses');
  redirect('/admin/courses');
}

/* ───────── Lessons ───────── */
export async function createLessonAction(courseSlug: string, formData: FormData) {
  await requireAdmin();
  const course = await db.query.courses.findFirst({ where: (c, { eq }) => eq(c.slug, courseSlug) });
  if (!course) throw new Error('Course not found.');
  const title = String(formData.get('title') || '').trim();
  if (!title) throw new Error('Lesson title is required.');

  const [{ value: maxOrder } = { value: null }] = await db
    .select({ value: max(lessons.orderIndex) }).from(lessons).where(eq(lessons.courseId, course.id));

  await db.insert(lessons).values({
    courseId: course.id,
    section: String(formData.get('section') || 'Lessons').trim() || 'Lessons',
    title,
    duration: String(formData.get('duration') || ''),
    videoUrl: String(formData.get('videoUrl') || '') || null,
    isFree: formData.get('isFree') === 'on',
    orderIndex: (maxOrder ?? 0) + 1,
  });

  await recountLessons(course.id);
  revalidatePath(`/admin/courses/${courseSlug}`);
}

export async function updateLessonAction(lessonId: string, courseSlug: string, formData: FormData) {
  await requireAdmin();
  await db.update(lessons).set({
    section: String(formData.get('section') || 'Lessons').trim() || 'Lessons',
    title: String(formData.get('title') || '').trim(),
    duration: String(formData.get('duration') || ''),
    videoUrl: String(formData.get('videoUrl') || '') || null,
    isFree: formData.get('isFree') === 'on',
  }).where(eq(lessons.id, lessonId));
  revalidatePath(`/admin/courses/${courseSlug}`);
}

export async function deleteLessonAction(lessonId: string, courseSlug: string) {
  await requireAdmin();
  const lesson = await db.query.lessons.findFirst({ where: (l, { eq }) => eq(l.id, lessonId) });
  await db.delete(lessons).where(eq(lessons.id, lessonId));
  if (lesson) await recountLessons(lesson.courseId);
  revalidatePath(`/admin/courses/${courseSlug}`);
}

/* ───────── Course files (downloadable, enrolled-only) ───────── */
export async function addCourseResourceAction(courseSlug: string, formData: FormData) {
  await requireAdmin();
  const course = await db.query.courses.findFirst({ where: (c, { eq }) => eq(c.slug, courseSlug) });
  if (!course) throw new Error('Course not found.');
  const title = String(formData.get('title') || '').trim();
  if (!title) throw new Error('File title is required.');
  const [{ value: maxOrder } = { value: null }] = await db
    .select({ value: max(courseResources.orderIndex) }).from(courseResources).where(eq(courseResources.courseId, course.id));
  await db.insert(courseResources).values({
    courseId: course.id,
    title,
    fileLabel: String(formData.get('fileLabel') || ''),
    filePath: String(formData.get('filePath') || '') || null,
    fileName: String(formData.get('fileName') || '') || null,
    fileSize: formData.get('fileSize') ? Number(formData.get('fileSize')) : null,
    fileUrl: String(formData.get('fileUrl') || '') || null,
    orderIndex: (maxOrder ?? 0) + 1,
  });
  revalidatePath(`/admin/courses/${courseSlug}`);
  revalidatePath(`/courses/${courseSlug}`);
}

export async function deleteCourseResourceAction(id: string, courseSlug: string) {
  await requireAdmin();
  await db.delete(courseResources).where(eq(courseResources.id, id));
  revalidatePath(`/admin/courses/${courseSlug}`);
  revalidatePath(`/courses/${courseSlug}`);
}

/* ───────── Users ───────── */
export async function deleteUserAction(userId: string) {
  const admin = await requireAdmin();
  if (admin.id === userId) throw new Error('You cannot delete your own admin account.');
  await db.delete(users).where(eq(users.id, userId));
  revalidatePath('/admin/users');
}

export async function setUserRoleAction(userId: string, role: 'student' | 'instructor' | 'admin') {
  await requireAdmin();
  await db.update(users).set({ role }).where(eq(users.id, userId));
  revalidatePath('/admin/users');
}

/* ───────── Resources ───────── */
type ResType = 'prd' | 'prompt' | 'system' | 'ebook' | 'template' | 'notion' | 'other';

async function uniqueResourceSlug(base: string, ignoreId?: string) {
  let slug = base; let i = 1;
  while (true) {
    const existing = await db.query.resources.findFirst({ where: (r, { eq }) => eq(r.slug, slug) });
    if (!existing || existing.id === ignoreId) return slug;
    slug = `${base}-${++i}`;
  }
}

function resourceValues(formData: FormData) {
  const { price, isFree } = priceFields(String(formData.get('price') || ''));
  let images: string[] = [];
  try {
    const parsed = JSON.parse(String(formData.get('images') || '[]'));
    if (Array.isArray(parsed)) images = parsed.filter((x) => typeof x === 'string');
  } catch { images = []; }
  const fileSizeRaw = String(formData.get('fileSize') || '');
  return {
    title: String(formData.get('title') || '').trim(),
    type: (String(formData.get('type') || 'other')) as ResType,
    description: String(formData.get('description') || ''),
    highlights: lines(formData.get('highlights')),
    price, isFree,
    images,
    imageUrl: images[0] ?? null,
    fileUrl: String(formData.get('fileUrl') || '') || null,
    filePath: String(formData.get('filePath') || '') || null,
    fileName: String(formData.get('fileName') || '') || null,
    fileSize: fileSizeRaw ? Number(fileSizeRaw) : null,
    fileLabel: String(formData.get('fileLabel') || ''),
    demoUser: String(formData.get('demoUser') || '').trim() || null,
    demoPass: String(formData.get('demoPass') || '').trim() || null,
  };
}

export async function createResourceAction(formData: FormData) {
  await requireAdmin();
  const v = resourceValues(formData);
  if (!v.title) throw new Error('Title is required.');
  const slug = await uniqueResourceSlug(slugify(v.title));
  await db.insert(resources).values({ ...v, slug });
  revalidatePath('/admin/resources');
  revalidatePath('/resources');
  redirect(`/admin/resources/${slug}`);
}

export async function updateResourceAction(resourceSlug: string, formData: FormData) {
  await requireAdmin();
  const resource = await db.query.resources.findFirst({ where: (r, { eq }) => eq(r.slug, resourceSlug) });
  if (!resource) throw new Error('Resource not found.');
  const v = resourceValues(formData);
  const newSlug = v.title !== resource.title ? await uniqueResourceSlug(slugify(v.title), resource.id) : resource.slug;
  await db.update(resources).set({ ...v, slug: newSlug }).where(eq(resources.id, resource.id));
  revalidatePath('/admin/resources');
  revalidatePath(`/resources/${newSlug}`);
  redirect(`/admin/resources/${newSlug}`);
}

export async function deleteResourceAction(resourceSlug: string) {
  await requireAdmin();
  await db.delete(resources).where(eq(resources.slug, resourceSlug));
  revalidatePath('/admin/resources');
  revalidatePath('/resources');
  redirect('/admin/resources');
}

/* ───────── AI plans ───────── */
function aiPlanValues(formData: FormData) {
  const v = String(formData.get('credits') || '').trim().toLowerCase();
  const credits = (v === '-1' || v === 'unlimited' || v === '∞') ? -1 : Math.max(0, parseInt(v, 10) || 0);
  const { price } = priceFields(String(formData.get('price') || ''));
  return {
    name: String(formData.get('name') || '').trim(),
    price: price === 'Free' ? '$0' : price,
    credits,
    description: String(formData.get('description') || ''),
    active: formData.get('active') !== 'off',
  };
}

export async function createAiPlanAction(formData: FormData) {
  await requireAdmin();
  const v = aiPlanValues(formData);
  if (!v.name) throw new Error('Plan name is required.');
  let slug = slugify(v.name); let i = 1;
  while (await db.query.aiPlans.findFirst({ where: (p, { eq }) => eq(p.slug, slug) })) slug = `${slugify(v.name)}-${++i}`;
  await db.insert(aiPlans).values({ ...v, slug });
  revalidatePath('/admin/ai-plans');
  revalidatePath('/ai');
  redirect('/admin/ai-plans');
}

export async function updateAiPlanAction(slug: string, formData: FormData) {
  await requireAdmin();
  await db.update(aiPlans).set(aiPlanValues(formData)).where(eq(aiPlans.slug, slug));
  revalidatePath('/admin/ai-plans');
  revalidatePath('/ai');
  redirect('/admin/ai-plans');
}

export async function deleteAiPlanAction(slug: string) {
  await requireAdmin();
  await db.delete(aiPlans).where(eq(aiPlans.slug, slug));
  revalidatePath('/admin/ai-plans');
  revalidatePath('/ai');
}

/* ───────── Instructors ───────── */
function instructorSlug(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'instructor';
}

export async function createInstructor(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get('name') || '').trim();
  const title = String(formData.get('title') || '').trim();
  const bio = String(formData.get('bio') || '').trim();
  const rating = Math.min(5, Math.max(0, parseFloat(String(formData.get('rating') || '0')) || 0));
  const students = Math.max(0, parseInt(String(formData.get('students') || '0'), 10) || 0);
  let slug = instructorSlug(name);
  let i = 1;
  while (await db.query.instructors.findFirst({ where: (r, { eq }) => eq(r.slug, slug) })) {
    slug = `${instructorSlug(name)}-${++i}`;
  }
  await db.insert(instructors).values({ slug, name, title, bio, rating, students, courseCount: 0 });
  revalidatePath('/admin/instructors');
}

export async function updateInstructor(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') || '');
  const name = String(formData.get('name') || '').trim();
  const title = String(formData.get('title') || '').trim();
  const bio = String(formData.get('bio') || '').trim();
  const rating = Math.min(5, Math.max(0, parseFloat(String(formData.get('rating') || '0')) || 0));
  const students = Math.max(0, parseInt(String(formData.get('students') || '0'), 10) || 0);
  await db.update(instructors).set({ name, title, bio, rating, students }).where(eq(instructors.id, id));
  revalidatePath('/admin/instructors');
}

export async function deleteInstructor(id: string) {
  await requireAdmin();
  await db.delete(instructors).where(eq(instructors.id, id));
  revalidatePath('/admin/instructors');
}

/* ───────── Admin manual enrollment ───────── */
export async function adminEnrollUserAction(userId: string, courseId: string) {
  await requireAdmin();
  await db.insert(enrollments)
    .values({ userId, courseId })
    .onConflictDoNothing({ target: [enrollments.userId, enrollments.courseId] });
  revalidatePath('/admin/users');
}

export async function adminUnenrollUserAction(userId: string, courseId: string) {
  await requireAdmin();
  await db.delete(enrollments)
    .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)));
  revalidatePath('/admin/users');
}

export async function getUserEnrollmentIds(userId: string): Promise<string[]> {
  await requireAdmin();
  const rows = await db
    .select({ courseId: enrollments.courseId })
    .from(enrollments)
    .where(eq(enrollments.userId, userId));
  return rows.map(r => r.courseId);
}
