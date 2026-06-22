import {
  pgTable, pgEnum, uuid, text, integer, real, boolean, timestamp, unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/* ───────────── Enums ───────────── */
export const trackEnum = pgEnum('track', ['vibe-coding', 'traditional-coding', 'ai-tools', 'ai-agents']);
export const levelEnum = pgEnum('level', ['beginner', 'intermediate', 'advanced', 'all']);
export const roleEnum = pgEnum('role', ['student', 'instructor', 'admin']);
export const planEnum = pgEnum('plan', ['free', 'pro']);

/* ───────────── Tables ───────────── */
export const instructors = pgTable('instructors', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  title: text('title').notNull(),
  bio: text('bio').notNull().default(''),
  rating: real('rating').notNull().default(0),
  students: integer('students').notNull().default(0),
  courseCount: integer('course_count').notNull().default(0),
});

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: roleEnum('role').notNull().default('student'),
  plan: planEnum('plan').notNull().default('free'),
  headline: text('headline').notNull().default(''),  // e.g. "Vibe coder · Building with AI"
  bio: text('bio').notNull().default(''),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const courses = pgTable('courses', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  track: trackEnum('track').notNull(),
  instructorId: uuid('instructor_id').references(() => instructors.id, { onDelete: 'set null' }),
  level: levelEnum('level').notNull().default('beginner'),
  duration: text('duration').notNull().default(''),
  hours: real('hours').notNull().default(0),
  rating: real('rating').notNull().default(0),
  reviewsCount: integer('reviews_count').notNull().default(0),
  lessonCount: integer('lesson_count').notNull().default(0),
  price: text('price').notNull().default('Free'),
  isFree: boolean('is_free').notNull().default(true),
  langs: text('langs').array().notNull().default(['en']),
  description: text('description').notNull().default(''),
  learnPoints: text('learn_points').array().notNull().default([]),
  requirements: text('requirements').array().notNull().default([]),
  thumbnailUrl: text('thumbnail_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const lessons = pgTable('lessons', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  section: text('section').notNull(),
  title: text('title').notNull(),
  orderIndex: integer('order_index').notNull().default(0),
  duration: text('duration').notNull().default(''),
  videoUrl: text('video_url'),
  isFree: boolean('is_free').notNull().default(false),
});

export const enrollments = pgTable('enrollments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  progress: integer('progress').notNull().default(0),
  currentLessonId: uuid('current_lesson_id').references(() => lessons.id, { onDelete: 'set null' }),
  completed: boolean('completed').notNull().default(false),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({ uniqUserCourse: unique().on(t.userId, t.courseId) }));

export const lessonProgress = pgTable('lesson_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  lessonId: uuid('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  completed: boolean('completed').notNull().default(true),
  completedAt: timestamp('completed_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({ uniqUserLesson: unique().on(t.userId, t.lessonId) }));

export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  authorName: text('author_name').notNull(),
  rating: integer('rating').notNull().default(5),
  text: text('text').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const bookmarks = pgTable('bookmarks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({ uniqUserCourse: unique().on(t.userId, t.courseId) }));

export const certificates = pgTable('certificates', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  issuedAt: timestamp('issued_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({ uniqUserCourse: unique().on(t.userId, t.courseId) }));

/* ───────────── Resources marketplace ───────────── */
export const resourceTypeEnum = pgEnum('resource_type', ['prd', 'prompt', 'system', 'ebook', 'template', 'notion', 'other']);

export const resources = pgTable('resources', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  type: resourceTypeEnum('type').notNull().default('other'),
  description: text('description').notNull().default(''),
  highlights: text('highlights').array().notNull().default([]),
  price: text('price').notNull().default('Free'),
  isFree: boolean('is_free').notNull().default(true),
  imageUrl: text('image_url'),                          // cover (= images[0])
  images: text('images').array().notNull().default([]), // gallery / slideshow (public preview URLs)
  fileUrl: text('file_url'),                            // external download link (fallback)
  filePath: text('file_path'),                          // privately-stored uploaded file name (gated)
  fileName: text('file_name'),                          // original filename for the download
  fileSize: integer('file_size'),                       // bytes
  fileLabel: text('file_label').notNull().default(''),  // e.g. "ZIP · 4.2 MB"
  downloads: integer('downloads').notNull().default(0),
  demoUser: text('demo_user'),   // optional demo credentials shown to users
  demoPass: text('demo_pass'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const resourcePurchases = pgTable('resource_purchases', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  resourceId: uuid('resource_id').notNull().references(() => resources.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({ uniqUserResource: unique().on(t.userId, t.resourceId) }));

/* ───────────── Course files (attached, enrolled-only download) ───────────── */
export const courseResources = pgTable('course_resources', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  fileLabel: text('file_label').notNull().default(''),
  filePath: text('file_path'),   // private uploaded file (gated by enrollment)
  fileName: text('file_name'),
  fileSize: integer('file_size'),
  fileUrl: text('file_url'),      // external link fallback
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/* ───────────── AI Prompt Studio ───────────── */
export const aiPlans = pgTable('ai_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  price: text('price').notNull().default('$5'),
  credits: integer('credits').notNull().default(50), // -1 = unlimited
  description: text('description').notNull().default(''),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// per-user AI usage: `used` counts toward the free quota; `credits` = paid balance (-1 unlimited)
export const aiUsage = pgTable('ai_usage', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  used: integer('used').notNull().default(0),
  credits: integer('credits').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/* ───────────── Community feed ───────────── */
export const communityPosts = pgTable('community_posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  text: text('text').notNull().default(''),
  imageUrl: text('image_url'),
  images: text('images').array().notNull().default([]),
  linkUrl: text('link_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const postLikes = pgTable('post_likes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: uuid('post_id').notNull().references(() => communityPosts.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({ uniqUserPost: unique().on(t.userId, t.postId) }));

/* ───────────── Payment audit log ───────────── */
export const paymentLogs = pgTable('payment_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  reference: text('reference').notNull().unique(),     // our internal ref (CRS-/RES-/AI-/PRO-)
  type: text('type').notNull(),                        // 'course' | 'resource' | 'ai_plan' | 'pro'
  targetId: text('target_id'),                         // course slug / resource slug / plan slug
  phone: text('phone').notNull(),
  amount: real('amount').notNull(),
  status: text('status').notNull().default('pending'), // 'pending' | 'approved' | 'failed'
  transactionId: text('transaction_id'),               // WaafiPay transactionId on success
  errorMsg: text('error_msg'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/* ───────────── Relations ───────────── */
export const courseResourcesRelations = relations(courseResources, ({ one }) => ({
  course: one(courses, { fields: [courseResources.courseId], references: [courses.id] }),
}));

export const communityPostsRelations = relations(communityPosts, ({ one, many }) => ({
  user: one(users, { fields: [communityPosts.userId], references: [users.id] }),
  likes: many(postLikes),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  user: one(users, { fields: [postLikes.userId], references: [users.id] }),
  post: one(communityPosts, { fields: [postLikes.postId], references: [communityPosts.id] }),
}));
export const coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(instructors, { fields: [courses.instructorId], references: [instructors.id] }),
  lessons: many(lessons),
  reviews: many(reviews),
}));

export const lessonsRelations = relations(lessons, ({ one }) => ({
  course: one(courses, { fields: [lessons.courseId], references: [courses.id] }),
}));

/* ───────────── Post Comments ───────────── */
export const postComments = pgTable('post_comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  postId: uuid('post_id').notNull().references(() => communityPosts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  parentId: uuid('parent_id'), // null = top-level, set = reply
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const postCommentsRelations = relations(postComments, ({ one, many }) => ({
  post:   one(communityPosts, { fields: [postComments.postId],   references: [communityPosts.id] }),
  user:   one(users,          { fields: [postComments.userId],   references: [users.id] }),
  replies: many(postComments, { relationName: 'replies' }),
  parent:  one(postComments,  { fields: [postComments.parentId], references: [postComments.id], relationName: 'replies' }),
}));

/* ───────────── AI Conversations + Messages ───────────── */
export const aiConversations = pgTable('ai_conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull().default('New conversation'),
  mode: text('mode').notNull().default('prompt'), // 'prompt' | 'prd' | 'chat'
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const aiMessages = pgTable('ai_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').notNull().references(() => aiConversations.id, { onDelete: 'cascade' }),
  role: text('role').notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  tokens: integer('tokens').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const aiConversationsRelations = relations(aiConversations, ({ one, many }) => ({
  user: one(users, { fields: [aiConversations.userId], references: [users.id] }),
  messages: many(aiMessages),
}));

export const aiMessagesRelations = relations(aiMessages, ({ one }) => ({
  conversation: one(aiConversations, { fields: [aiMessages.conversationId], references: [aiConversations.id] }),
}));

export const instructorsRelations = relations(instructors, ({ many }) => ({
  courses: many(courses),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, { fields: [enrollments.userId], references: [users.id] }),
  course: one(courses, { fields: [enrollments.courseId], references: [courses.id] }),
}));

export const resourcePurchasesRelations = relations(resourcePurchases, ({ one }) => ({
  user: one(users, { fields: [resourcePurchases.userId], references: [users.id] }),
  resource: one(resources, { fields: [resourcePurchases.resourceId], references: [resources.id] }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, { fields: [bookmarks.userId], references: [users.id] }),
  course: one(courses, { fields: [bookmarks.courseId], references: [courses.id] }),
}));

/* ───────────── Inferred types ───────────── */
export type DbCourse = typeof courses.$inferSelect;
export type DbLesson = typeof lessons.$inferSelect;
export type DbInstructor = typeof instructors.$inferSelect;
export type DbUser = typeof users.$inferSelect;
export type DbEnrollment = typeof enrollments.$inferSelect;
export type DbReview = typeof reviews.$inferSelect;
