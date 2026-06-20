import { asc, desc, eq } from 'drizzle-orm';
import { getSessionUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import { aiConversations, aiMessages } from '@/lib/db/schema';
import { getAiStatus, getAiPlans, AI_FREE_LIMIT } from '@/lib/queries';
import { ensureSchema } from '@/lib/db/migrate';
import { AiStudioClient } from './AiStudioClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'AI Studio — Kulmis Academy',
  description: 'Engineer prompts, write PRDs, and chat with AI. Professional results in seconds.',
};

export default async function AiStudioPage() {
  await ensureSchema();

  const userId = await getSessionUserId();
  const status = userId
    ? await getAiStatus(userId)
    : { used: 0, freeLeft: AI_FREE_LIMIT, credits: 0, unlimited: false, freeLimit: AI_FREE_LIMIT };
  const plans = await getAiPlans();

  let conversations: { id: string; title: string; mode: string; updatedAt: string }[] = [];
  let initialMessages: { id: string; role: string; content: string; tokens: number }[] = [];
  let initialMode = 'prompt';

  if (userId) {
    const convRows = await db.select({
      id: aiConversations.id,
      title: aiConversations.title,
      mode: aiConversations.mode,
      updatedAt: aiConversations.updatedAt,
    })
      .from(aiConversations)
      .where(eq(aiConversations.userId, userId))
      .orderBy(desc(aiConversations.updatedAt))
      .limit(50);

    conversations = convRows.map((r) => ({
      id: r.id,
      title: r.title,
      mode: r.mode,
      updatedAt: new Date(r.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));

    // Load messages for the most recent conversation
    if (convRows[0]) {
      initialMode = convRows[0].mode;
      const msgs = await db.select().from(aiMessages)
        .where(eq(aiMessages.conversationId, convRows[0].id))
        .orderBy(asc(aiMessages.createdAt));
      initialMessages = msgs.map((m) => ({ id: m.id, role: m.role, content: m.content, tokens: m.tokens }));
    }
  }

  return (
    <AiStudioClient
      isLoggedIn={!!userId}
      status={status}
      plans={plans}
      conversations={conversations}
      initialConvId={conversations[0]?.id ?? null}
      initialMessages={initialMessages}
      initialMode={initialMode}
    />
  );
}
