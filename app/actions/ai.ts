'use server';
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { db, aiUsage, aiConversations, aiMessages } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';
import { callAI, engineerPrompt, estimateTokens, type AiMode, type PromptOptions } from '@/lib/ai';
import { AI_FREE_LIMIT, AI_LONG_THRESHOLD } from '@/lib/queries';

export type AiResult =
  | { ok: true; output: string; engine: string; freeLeft: number; credits: number; unlimited: boolean }
  | { ok: false; error: string; needPlan?: boolean };

/* ─── quota helper ─── */
async function checkAndDeductQuota(
  userId: string,
  inputLength: number,
): Promise<
  | { ok: true; spendCredit: boolean; freeLeft: number; credits: number; unlimited: boolean; used: number }
  | { ok: false; error: string; needPlan?: boolean }
> {
  let row = await db.query.aiUsage.findFirst({ where: (u, { eq }) => eq(u.userId, userId) });
  if (!row) {
    await db.insert(aiUsage).values({ userId }).onConflictDoNothing({ target: aiUsage.userId });
    row = await db.query.aiUsage.findFirst({ where: (u, { eq }) => eq(u.userId, userId) });
  }
  const used = row?.used ?? 0;
  const credits = row?.credits ?? 0;
  const unlimited = credits === -1;
  const isLong = inputLength > AI_LONG_THRESHOLD;
  const freeLeft = Math.max(0, AI_FREE_LIMIT - used);

  if (!unlimited) {
    if (isLong) {
      if (credits > 0) return { ok: true, spendCredit: true, freeLeft, credits, unlimited, used };
      return { ok: false, needPlan: true, error: 'Long prompts use 1 credit — buy an AI plan to continue.' };
    } else if (freeLeft > 0) {
      return { ok: true, spendCredit: false, freeLeft, credits, unlimited, used };
    } else if (credits > 0) {
      return { ok: true, spendCredit: true, freeLeft, credits, unlimited, used };
    } else {
      return { ok: false, needPlan: true, error: "You've used your free generations. Buy an AI plan to keep going." };
    }
  }
  return { ok: true, spendCredit: false, freeLeft, credits, unlimited, used };
}

/* ─── Legacy: single-shot prompt generator (kept for backwards compat) ─── */
export async function generatePromptAction(input: string, opts: PromptOptions): Promise<AiResult> {
  const userId = await getSessionUserId();
  if (!userId) return { ok: false, error: 'Please sign in to use the AI Studio.' };

  const text = (input || '').trim();
  if (!text) return { ok: false, error: 'Type what you want help with first.' };
  if (text.length > 4000) return { ok: false, error: 'That input is too long (max 4000 characters).' };

  const quota = await checkAndDeductQuota(userId, text.length);
  if (!quota.ok) return quota;

  const { output, engine } = await engineerPrompt(text, opts);

  await db.update(aiUsage).set({
    used: sql`${aiUsage.used} + 1`,
    credits: quota.spendCredit ? sql`${aiUsage.credits} - 1` : quota.credits,
    updatedAt: new Date(),
  }).where(eq(aiUsage.userId, userId));

  const newUsed = quota.used + 1;
  const newCredits = quota.unlimited ? -1 : (quota.spendCredit ? quota.credits - 1 : quota.credits);
  return { ok: true, output, engine, freeLeft: Math.max(0, AI_FREE_LIMIT - newUsed), credits: newCredits, unlimited: quota.unlimited };
}

/* ─── Create conversation ─── */
export async function createConversationAction(mode: string): Promise<{ id: string } | { error: string }> {
  const userId = await getSessionUserId();
  if (!userId) return { error: 'Sign in required.' };
  const [row] = await db.insert(aiConversations)
    .values({ userId, mode, title: 'New conversation' })
    .returning({ id: aiConversations.id });
  return { id: row.id };
}

/* ─── Send message in a conversation ─── */
export type ChatResult =
  | { ok: true; convId: string; aiContent: string; engine: string; freeLeft: number; credits: number; unlimited: boolean; tokens: number }
  | { ok: false; error: string; needPlan?: boolean };

export async function sendMessageAction(
  convId: string | null,
  message: string,
  mode: AiMode,
  history: { role: 'user' | 'assistant'; content: string }[],
): Promise<ChatResult> {
  const userId = await getSessionUserId();
  if (!userId) return { ok: false, error: 'Please sign in.' };

  const text = message.trim();
  if (!text) return { ok: false, error: 'Message cannot be empty.' };
  if (text.length > 6000) return { ok: false, error: 'Message too long (max 6000 chars).' };

  // Ensure schema migrations have run
  const { ensureSchema } = await import('@/lib/db/migrate');
  await ensureSchema();

  const quota = await checkAndDeductQuota(userId, text.length);
  if (!quota.ok) return quota;

  // Create or verify conversation
  let actualConvId = convId;
  if (!actualConvId) {
    const [newConv] = await db.insert(aiConversations)
      .values({ userId, mode, title: text.slice(0, 60) })
      .returning({ id: aiConversations.id });
    actualConvId = newConv.id;
  } else {
    // Verify ownership
    const conv = await db.query.aiConversations.findFirst({
      where: (c, { and, eq }) => and(eq(c.id, actualConvId!), eq(c.userId, userId)),
    });
    if (!conv) return { ok: false, error: 'Conversation not found.' };
    // Auto-update title from first message
    if (conv.title === 'New conversation') {
      await db.update(aiConversations)
        .set({ title: text.slice(0, 60), updatedAt: new Date() })
        .where(eq(aiConversations.id, actualConvId));
    }
  }

  // Save user message
  const userTokens = estimateTokens(text);
  await db.insert(aiMessages).values({ conversationId: actualConvId, role: 'user', content: text, tokens: userTokens });

  // Build message history for AI (last 10 turns = 20 messages max)
  const recentHistory = history.slice(-20);
  const aiMessages_ = [...recentHistory, { role: 'user' as const, content: text }];

  // Call AI
  const { output, engine } = await callAI(mode, aiMessages_);
  const aiTokens = estimateTokens(output);

  // Save AI message
  await db.insert(aiMessages).values({ conversationId: actualConvId, role: 'assistant', content: output, tokens: aiTokens });

  // Update conversation timestamp
  await db.update(aiConversations)
    .set({ updatedAt: new Date() })
    .where(eq(aiConversations.id, actualConvId));

  // Deduct quota
  await db.update(aiUsage).set({
    used: sql`${aiUsage.used} + 1`,
    credits: quota.spendCredit ? sql`${aiUsage.credits} - 1` : quota.credits,
    updatedAt: new Date(),
  }).where(eq(aiUsage.userId, userId));

  const newUsed = quota.used + 1;
  const newCredits = quota.unlimited ? -1 : (quota.spendCredit ? quota.credits - 1 : quota.credits);

  return {
    ok: true,
    convId: actualConvId,
    aiContent: output,
    engine,
    tokens: aiTokens,
    freeLeft: Math.max(0, AI_FREE_LIMIT - newUsed),
    credits: newCredits,
    unlimited: quota.unlimited,
  };
}

/* ─── Load messages for a conversation ─── */
export type ConvMessage = { id: string; role: string; content: string; tokens: number; time: string };

export async function loadConversationAction(convId: string): Promise<{ messages: ConvMessage[]; mode: string } | { error: string }> {
  const userId = await getSessionUserId();
  if (!userId) return { error: 'Sign in required.' };
  const conv = await db.query.aiConversations.findFirst({
    where: (c, { and, eq }) => and(eq(c.id, convId), eq(c.userId, userId)),
  });
  if (!conv) return { error: 'Not found.' };
  const msgs = await db.select().from(aiMessages)
    .where(eq(aiMessages.conversationId, convId))
    .orderBy(asc(aiMessages.createdAt));
  return {
    mode: conv.mode,
    messages: msgs.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      tokens: m.tokens,
      time: new Date(m.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    })),
  };
}

/* ─── Delete conversation ─── */
export async function deleteConversationAction(convId: string): Promise<void> {
  const userId = await getSessionUserId();
  if (!userId) return;
  await db.delete(aiConversations).where(
    and(eq(aiConversations.id, convId), eq(aiConversations.userId, userId)),
  );
}

/* ─── List conversations ─── */
export type ConvSummary = { id: string; title: string; mode: string; updatedAt: string };

export async function listConversationsAction(): Promise<ConvSummary[]> {
  const userId = await getSessionUserId();
  if (!userId) return [];
  const rows = await db.select({
    id: aiConversations.id,
    title: aiConversations.title,
    mode: aiConversations.mode,
    updatedAt: aiConversations.updatedAt,
  }).from(aiConversations)
    .where(eq(aiConversations.userId, userId))
    .orderBy(desc(aiConversations.updatedAt))
    .limit(50);
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    mode: r.mode,
    updatedAt: new Date(r.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));
}
