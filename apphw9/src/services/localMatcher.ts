import { POEMS, type PoemRecord } from '../data/poems';
import type { ContextProfile, MatchInformation, MatchResult } from '../types/models';

const CHINA_MARKERS = ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '西安', '武汉', '苏州', 'china', '中国'];

const MOOD_ALIASES: Record<string, string[]> = {
  cheerful: ['happy', 'joy', 'joyful', 'uplift', '轻快', '积极', '明朗', '振奋', '开心', '高兴'],
  calm: ['calm', 'peaceful', 'quiet', '宁静', '平静', '清新', '悠然', '治愈'],
  lonely: ['lonely', 'alone', '孤独', '孤清'],
  reflective: ['thoughtful', 'reflective', '哲思', '沉思', '感怀'],
  homesick: ['homesick', 'missing', '思念', '思亲'],
  broad: ['open', 'vast', 'grand', '壮阔', '苍茫', '开阔'],
  festive: ['festival', 'holiday', '节日'],
};

const WEATHER_ALIASES: Record<string, string[]> = {
  clear: ['clear', 'sunny', '晴', '晴朗'],
  cloudy: ['cloud', 'cloudy', 'overcast', '多云', '阴', '阴天'],
  rain: ['rain', 'rainy', 'drizzle', '雨', '下雨', '雨后'],
  snow: ['snow', 'snowy', '雪', '下雪'],
  fog: ['fog', 'foggy', '雾'],
  windy: ['wind', 'windy', '风', '春风', '和风'],
  cold: ['cold', '寒冷', '微冷', '凉'],
  warm: ['warm', '温暖'],
};

const SEASON_ALIASES: Record<string, string[]> = {
  spring: ['spring', '春'],
  summer: ['summer', '夏'],
  autumn: ['autumn', 'fall', '秋'],
  winter: ['winter', '冬'],
};

const TIME_ALIASES: Record<string, string[]> = {
  morning: ['morning', '早晨', '清晨'],
  afternoon: ['afternoon', 'noon', '白天', '下午'],
  dusk: ['dusk', 'evening', '傍晚'],
  night: ['night', 'late night', '夜晚', '凌晨'],
};

const ENV_ALIASES: Record<string, string[]> = {
  mountain: ['mountain', '山', '山林', '山路', '庐山'],
  river: ['river', '江', '河', '溪', '江边', '河畔'],
  sea: ['sea', 'ocean', 'coast', '海', '江海'],
  city: ['city', 'urban', '城', '都市'],
  forest: ['forest', 'woods', '林', '枫林'],
  courtyard: ['courtyard', 'yard', '庭院', '花间'],
  flowers: ['flower', 'flowers', '花', '花草', '花海'],
  desert: ['desert', '荒野', '边塞', '大漠'],
  travel: ['travel', 'trip', 'journey', '远行', '旅行'],
  school: ['school', 'campus', 'classroom', '课堂', '学校'],
};

function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff\s-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function extractConcepts(text: string, aliases: Record<string, string[]>): Set<string> {
  const normalized = normalize(text);
  const set = new Set<string>();
  for (const [concept, words] of Object.entries(aliases)) {
    if (words.some((word) => normalized.includes(normalize(word)))) {
      set.add(concept);
    }
  }
  return set;
}

function overlapScore(a: Set<string>, b: Set<string>, weight: number): number {
  if (a.size === 0 || b.size === 0) {
    return 0;
  }
  let common = 0;
  for (const item of a) {
    if (b.has(item)) {
      common += 1;
    }
  }
  return common * weight;
}

function mismatchPenalty(a: Set<string>, b: Set<string>, penalty: number): number {
  if (a.size === 0 || b.size === 0) {
    return 0;
  }
  for (const item of a) {
    if (b.has(item)) {
      return 0;
    }
  }
  return penalty;
}

function deriveMatchInformation(location: string, environment: string): MatchInformation {
  const normalizedLocation = normalize(location);
  const normalizedEnv = normalize(environment);
  const isChina = CHINA_MARKERS.some((m) => normalizedLocation.includes(m));

  const geo_mode = isChina ? 'china_region' : 'global_landscape';
  const nearby_regions = isChina ? ['华东', '华北', '华南', '西南', '西北'] : [];

  const landscapes: string[] = [];
  if (normalizedEnv.includes('山') || normalizedEnv.includes('mountain')) landscapes.push('mountain');
  if (normalizedEnv.includes('海') || normalizedEnv.includes('coast') || normalizedEnv.includes('ocean')) landscapes.push('sea');
  if (normalizedEnv.includes('江') || normalizedEnv.includes('河') || normalizedEnv.includes('river')) landscapes.push('river');
  if (normalizedEnv.includes('雪') || normalizedEnv.includes('snow')) landscapes.push('snow');
  if (normalizedEnv.includes('雨') || normalizedEnv.includes('rain')) landscapes.push('rain');
  if (normalizedEnv.includes('城') || normalizedEnv.includes('city')) landscapes.push('city');

  return {
    geo_mode,
    nearby_regions,
    landscapes,
    popularity_weight: 0.06,
  };
}

function scorePoem(poem: PoemRecord, context: ContextProfile, info: MatchInformation): number {
  let score = 0;

  const moodContext = extractConcepts(context.emotion_text, MOOD_ALIASES);
  const moodPoem = extractConcepts(poem.tags.moods.join(' '), MOOD_ALIASES);

  const weatherContext = extractConcepts(context.weather, WEATHER_ALIASES);
  const weatherPoem = extractConcepts(poem.tags.weather.join(' '), WEATHER_ALIASES);

  const seasonContext = extractConcepts(context.season, SEASON_ALIASES);
  const seasonPoem = extractConcepts(poem.tags.seasons.join(' '), SEASON_ALIASES);

  const timeContext = extractConcepts(context.time_of_day, TIME_ALIASES);
  const timePoem = extractConcepts(poem.tags.times.join(' '), TIME_ALIASES);

  const envContext = extractConcepts(context.environment_style, ENV_ALIASES);
  const envPoem = extractConcepts(`${poem.tags.environments.join(' ')} ${poem.tags.landscapes.join(' ')}`, ENV_ALIASES);

  score += overlapScore(moodContext, moodPoem, 3.2);
  score += overlapScore(weatherContext, weatherPoem, 2.2);
  score += overlapScore(seasonContext, seasonPoem, 2.6);
  score += overlapScore(timeContext, timePoem, 2.2);
  score += overlapScore(envContext, envPoem, 2.0);

  score += mismatchPenalty(seasonContext, seasonPoem, -1.2);
  score += mismatchPenalty(timeContext, timePoem, -0.8);
  score += mismatchPenalty(weatherContext, weatherPoem, -0.5);

  if (info.geo_mode === 'china_region') {
    if (poem.tags.regions.some((r) => info.nearby_regions.includes(r))) {
      score += 1.5;
    }
  } else if (info.landscapes.length > 0 && poem.tags.landscapes.some((l) => info.landscapes.includes(l))) {
    score += 1.5;
  }

  score += poem.popularity_score * info.popularity_weight;

  return score;
}

export function getLocalRecommendation(context: ContextProfile): MatchResult {
  const info = deriveMatchInformation(context.city_or_location, context.environment_style);
  const fallbackPoem = POEMS[0];
  if (!fallbackPoem) {
    throw new Error('No poem data available for local matching.');
  }

  const ranked = POEMS
    .map((poem) => ({ poem, score: scorePoem(poem, context, info) }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0]?.poem ?? fallbackPoem;
  const second = ranked[1]?.poem;
  const third = ranked[2]?.poem;
  const topScore = ranked[0]?.score ?? 0;

  const confidence = Math.max(0.25, Math.min(0.95, (topScore + 0.8) / 10));

  const matchedAspects: string[] = [];
  const hasMood = overlapScore(extractConcepts(context.emotion_text, MOOD_ALIASES), extractConcepts(best.tags.moods.join(' '), MOOD_ALIASES), 1) > 0;
  const hasWeather = overlapScore(extractConcepts(context.weather, WEATHER_ALIASES), extractConcepts(best.tags.weather.join(' '), WEATHER_ALIASES), 1) > 0;
  const hasSeason = overlapScore(extractConcepts(context.season, SEASON_ALIASES), extractConcepts(best.tags.seasons.join(' '), SEASON_ALIASES), 1) > 0;
  const hasTime = overlapScore(extractConcepts(context.time_of_day, TIME_ALIASES), extractConcepts(best.tags.times.join(' '), TIME_ALIASES), 1) > 0;
  const hasEnvironment = overlapScore(
    extractConcepts(context.environment_style, ENV_ALIASES),
    extractConcepts(`${best.tags.environments.join(' ')} ${best.tags.landscapes.join(' ')}`, ENV_ALIASES),
    1,
  ) > 0;

  if (hasMood) matchedAspects.push(`emotion (${context.emotion_text})`);
  if (hasWeather) matchedAspects.push(`weather (${context.weather})`);
  if (hasSeason) matchedAspects.push(`season (${context.season})`);
  if (hasTime) matchedAspects.push(`time (${context.time_of_day})`);
  if (hasEnvironment) matchedAspects.push(`environment (${context.environment_style})`);
  if (context.city_or_location.trim()) matchedAspects.push(`location (${context.city_or_location})`);

  const reasonBody = matchedAspects.length > 0 ? matchedAspects.join(', ') : 'overall semantic context and imagery';

  return {
    line_text: best.line_text,
    title: best.title,
    author: best.author,
    dynasty: best.dynasty,
    match_reason: `Matched by ${reasonBody}, with popularity used only as a tie-breaker.`,
    modern_explanation: 'This line is chosen because its imagery and emotional tone align with your current context, with popularity used only as a tie-break preference.',
    confidence,
    popularity_score: best.popularity_score,
    alternatives: [second, third]
      .filter((item): item is PoemRecord => Boolean(item))
      .map((item) => `${item.line_text} —— ${item.title}·${item.author}`),
  };
}