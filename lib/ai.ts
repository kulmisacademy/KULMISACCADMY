import 'server-only';

export type AiMode = 'prompt' | 'prd' | 'chat';
export type AiEngine = 'openai' | 'claude' | 'builtin';

// Legacy — kept for backwards compat
export type PromptOptions = {
  role?: string;
  tone?: string;
  format?: string;
  audience?: string;
};

/* ─── system prompts per mode ─── */
const MODE_SYSTEMS: Record<AiMode, string> = {
  prompt: `You are a world-class prompt engineer. The user may write in Somali or English.
Always output the engineered prompt in professional English.
Transform their rough request into a highly structured, effective AI prompt using these exact Markdown sections:
# Role
# Task
# Context
# Requirements
# Output format
Output ONLY the final prompt — no preamble, no commentary, no explanation before or after.`,

  prd: `You are a senior product manager and technical writer. The user may write in Somali or English.
Always output the PRD in professional English.
Create a comprehensive Product Requirements Document with these sections:
# Overview
# Problem Statement
# Goals & Success Metrics
# User Stories
# Functional Requirements
# Non-Functional Requirements
# Technical Constraints
# Timeline & Milestones
# Out of Scope
Be detailed and specific. Use tables and bullet points where appropriate.
Output ONLY the PRD document — no preamble.`,

  chat: `You are a helpful AI assistant for Kulmis Academy, an AI & coding education platform.
The user may write in Somali or English. Respond in English.
For technical content (code, prompts, documents) always use English.
Be concise, practical, and encouraging.`,
};

/* ─── heuristic fallback (no API key) ─── */
const ROLE_MAP: Record<string, string> = {
  developer: 'a senior software engineer and pair-programmer',
  writer: 'an expert content writer and editor',
  marketer: 'a senior growth marketer and copywriter',
  teacher: 'a patient expert teacher who explains step by step',
  analyst: 'a meticulous data analyst',
  designer: 'a product designer with strong UX judgment',
  general: 'an expert assistant',
};

function heuristicEngineer(input: string, opts: PromptOptions): string {
  const role = ROLE_MAP[opts.role || 'general'] || opts.role || 'an expert assistant';
  const tone = opts.tone || 'clear, precise, and professional';
  const format = opts.format || 'Respond in clean Markdown with headings, short paragraphs, and bullet points where useful.';
  const audience = opts.audience?.trim();

  return `# Role
You are ${role}. Think step by step and reason carefully before answering.

# Task
${input.trim()}

# Context${audience ? `\n- Audience: ${audience}` : ''}
- Goal: produce a complete, high-quality result the user can use immediately.
- If any detail is missing, make sensible assumptions and state them briefly.

# Requirements
- Tone: ${tone}.
- Be specific and actionable — avoid vague or generic statements.
- Prefer concrete examples over abstract description.
- If the task involves code, return runnable, well-commented code.
- Do not invent facts; if unsure, say so.

# Output format
${format}

# Before you finish
- Double-check the answer fully addresses the task.
- Remove filler and repetition.`;
}

function heuristicPrd(input: string): string {
  return `# Overview
**Feature / Product:** ${input.trim().slice(0, 120)}

# Problem Statement
[Define the specific problem this feature solves for users.]

# Goals & Success Metrics
- **Primary goal:** [Main outcome]
- **Metric 1:** [e.g. 20% increase in X]
- **Metric 2:** [e.g. Reduce Y by Z%]

# User Stories
| As a... | I want to... | So that... |
|---------|-------------|------------|
| [User type] | [action] | [benefit] |

# Functional Requirements
1. [Requirement 1]
2. [Requirement 2]
3. [Requirement 3]

# Non-Functional Requirements
- **Performance:** [e.g. Page loads in < 2s]
- **Security:** [e.g. All endpoints require auth]
- **Accessibility:** [e.g. WCAG 2.1 AA]

# Technical Constraints
- [Constraint 1]
- [Constraint 2]

# Timeline & Milestones
| Milestone | Target date |
|-----------|-------------|
| Design complete | Week 1 |
| Dev complete | Week 3 |
| QA complete | Week 4 |

# Out of Scope
- [Thing not included]`;
}

/* ─── OpenAI call ─── */
async function callOpenAI(
  mode: AiMode,
  messages: { role: 'user' | 'assistant'; content: string }[],
): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const maxTokens = mode === 'prd' ? 2500 : 1500;
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'system', content: MODE_SYSTEMS[mode] }, ...messages],
    }),
    cache: 'no-store',
  });
  const json = await res.json();
  const text = json?.choices?.[0]?.message?.content;
  return text ? String(text).trim() : null;
}

/* ─── Anthropic call ─── */
async function callAnthropic(
  mode: AiMode,
  messages: { role: 'user' | 'assistant'; content: string }[],
): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model,
      max_tokens: mode === 'prd' ? 2500 : 1500,
      system: MODE_SYSTEMS[mode],
      messages,
    }),
    cache: 'no-store',
  });
  const json = await res.json();
  const text = json?.content?.[0]?.text;
  return text ? String(text).trim() : null;
}

/* ─── Main entry: try OpenAI → Anthropic → heuristic ─── */
export async function callAI(
  mode: AiMode,
  messages: { role: 'user' | 'assistant'; content: string }[],
): Promise<{ output: string; engine: AiEngine }> {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';

  try {
    const oa = await callOpenAI(mode, messages);
    if (oa) return { output: oa, engine: 'openai' };
  } catch { /* fall through */ }

  try {
    const an = await callAnthropic(mode, messages);
    if (an) return { output: an, engine: 'claude' };
  } catch { /* fall through */ }

  // heuristic fallback
  if (mode === 'prd') return { output: heuristicPrd(lastUserMsg), engine: 'builtin' };
  return { output: heuristicEngineer(lastUserMsg, {}), engine: 'builtin' };
}

/* ─── Legacy wrapper (used by old generatePromptAction) ─── */
export async function engineerPrompt(input: string, opts: PromptOptions): Promise<{ output: string; engine: AiEngine }> {
  const userContent = `Rough request: """${input.trim()}"""\n\nPreferences: role=${opts.role || 'auto'}, tone=${opts.tone || 'professional'}, format=${opts.format || 'markdown'}, audience=${opts.audience || 'general'}.`;
  return callAI('prompt', [{ role: 'user', content: userContent }]);
}

/* ─── Token estimation ─── */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.5);
}
