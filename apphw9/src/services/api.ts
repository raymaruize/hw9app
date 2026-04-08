import type { ContextProfile, MatchResult } from '../types/models';

function assertValidMatchResult(payload: unknown): MatchResult {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid match response shape.');
  }
  const obj = payload as Record<string, unknown>;

  const requiredStrings = ['line_text', 'title', 'author', 'dynasty', 'match_reason', 'modern_explanation'];
  for (const key of requiredStrings) {
    if (typeof obj[key] !== 'string' || !(obj[key] as string).trim()) {
      throw new Error(`Response field ${key} is missing.`);
    }
  }

  if (typeof obj.confidence !== 'number' || Number.isNaN(obj.confidence)) {
    throw new Error('Response field confidence is invalid.');
  }

  if (typeof obj.popularity_score !== 'number' || Number.isNaN(obj.popularity_score)) {
    throw new Error('Response field popularity_score is invalid.');
  }

  const alternatives = Array.isArray(obj.alternatives) ? obj.alternatives.filter((x) => typeof x === 'string') : [];

  return {
    line_text: obj.line_text as string,
    title: obj.title as string,
    author: obj.author as string,
    dynasty: obj.dynasty as string,
    match_reason: obj.match_reason as string,
    modern_explanation: obj.modern_explanation as string,
    confidence: obj.confidence as number,
    popularity_score: obj.popularity_score as number,
    alternatives,
  };
}

export async function requestBackendMatch(baseUrl: string, context: ContextProfile): Promise<MatchResult> {
  const normalized = baseUrl.trim().replace(/\/+$/, '');
  if (!normalized) {
    throw new Error('Backend base URL is empty.');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${normalized}/api/v1/match`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(context),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Backend request failed (${response.status}).`);
    }

    const json = (await response.json()) as unknown;
    return assertValidMatchResult(json);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Backend request timed out.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}