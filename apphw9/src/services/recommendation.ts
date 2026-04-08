import type { AppSettings, ContextProfile, MatchResult, RecommendationResult } from '../types/models';
import { requestBackendMatch } from './api';
import { getLocalRecommendation } from './localMatcher';

function normalizeErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) {
    return fallback;
  }

  const message = error.message?.trim();
  return message ? message : fallback;
}

function parseAiStructuredContent(text: string): MatchResult {
  const trimmed = text.trim();
  const jsonText = trimmed.startsWith('{') ? trimmed : trimmed.slice(trimmed.indexOf('{'));
  const parsed = JSON.parse(jsonText) as Partial<MatchResult>;

  if (
    !parsed.line_text ||
    !parsed.title ||
    !parsed.author ||
    !parsed.dynasty ||
    !parsed.match_reason ||
    !parsed.modern_explanation ||
    typeof parsed.confidence !== 'number' ||
    typeof parsed.popularity_score !== 'number'
  ) {
    throw new Error('AI response missing required fields.');
  }

  return {
    line_text: parsed.line_text,
    title: parsed.title,
    author: parsed.author,
    dynasty: parsed.dynasty,
    match_reason: parsed.match_reason,
    modern_explanation: parsed.modern_explanation,
    confidence: parsed.confidence,
    popularity_score: parsed.popularity_score,
    alternatives: Array.isArray(parsed.alternatives) ? parsed.alternatives.filter((x): x is string => typeof x === 'string') : [],
  };
}

async function requestAIRecommendation(context: ContextProfile, settings: AppSettings): Promise<MatchResult> {
  const { base_url, model_name, api_key, is_enabled } = settings.ai_provider;
  if (!is_enabled) {
    throw new Error('AI disabled.');
  }
  if (!base_url.trim() || !model_name.trim() || !api_key.trim()) {
    throw new Error('AI settings incomplete.');
  }

  const endpoint = `${base_url.trim().replace(/\/+$/, '')}/chat/completions`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const prompt = `You are a classical Chinese poem recommendation engine. Return JSON only with fields: line_text,title,author,dynasty,match_reason,modern_explanation,confidence,popularity_score,alternatives(2 items). Do not fabricate poems. Context: ${JSON.stringify(
      context,
    )}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${api_key}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: model_name,
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'Recommend only real classical Chinese poems.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI request failed (${response.status}).`);
    }

    const json = (await response.json()) as Record<string, unknown>;
    const content =
      (json.choices as Array<{ message?: { content?: string } }> | undefined)?.[0]?.message?.content ?? '';

    if (!content) {
      throw new Error('AI returned empty content.');
    }
    return parseAiStructuredContent(content);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('AI request timed out.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function getRecommendation(context: ContextProfile, settings: AppSettings): Promise<RecommendationResult> {
  let aiFailureMessage: string | undefined;

  if (settings.ai_provider.is_enabled) {
    try {
      const aiMatch = await requestAIRecommendation(context, settings);
      return { match: aiMatch, source: 'ai' };
    } catch (error) {
      aiFailureMessage = normalizeErrorMessage(error, 'AI recommendation failed.');
    }
  }

  try {
    const backendMatch = await requestBackendMatch(settings.backend_base_url, context);
    return {
      match: backendMatch,
      source: 'backend',
      warning: aiFailureMessage ? `${aiFailureMessage} Falling back to backend matching.` : undefined,
    };
  } catch (error) {
    const backendFailureMessage = normalizeErrorMessage(error, 'Backend matching failed.');
    const local = getLocalRecommendation(context);

    const warningParts: string[] = [];
    if (aiFailureMessage) {
      warningParts.push(aiFailureMessage);
    }
    warningParts.push(backendFailureMessage);
    warningParts.push('Showing local offline recommendation. Your input is kept for retry.');

    return {
      match: local,
      source: 'local',
      warning: warningParts.join(' '),
    };
  }
}