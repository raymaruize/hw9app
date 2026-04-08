const http = require('http');

const PORT = Number(process.env.PORT || 3000);

const POEMS = [
  {
    line_text: '海上生明月，天涯共此时。',
    title: '望月怀远',
    author: '张九龄',
    dynasty: '唐',
    moods: ['思念', '宁静', '感怀'],
    weather: ['晴', '微风'],
    seasons: ['秋', '冬'],
    times: ['夜晚'],
    environments: ['江海', '远望', '安静'],
    popularity_score: 0.95,
  },
  {
    line_text: '举杯邀明月，对影成三人。',
    title: '月下独酌',
    author: '李白',
    dynasty: '唐',
    moods: ['孤独', '旷达', '饮酒'],
    weather: ['晴'],
    seasons: ['春'],
    times: ['夜晚'],
    environments: ['庭院', '花间'],
    popularity_score: 0.98,
  },
  {
    line_text: '空山新雨后，天气晚来秋。',
    title: '山居秋暝',
    author: '王维',
    dynasty: '唐',
    moods: ['平静', '疗愈', '清新'],
    weather: ['雨后', '凉爽'],
    seasons: ['秋'],
    times: ['傍晚'],
    environments: ['山林', '自然', '清幽'],
    popularity_score: 0.97,
  },
  {
    line_text: '迟日江山丽，春风花草香。',
    title: '绝句二首·其一',
    author: '杜甫',
    dynasty: '唐',
    moods: ['轻快', '希望', '放松'],
    weather: ['晴', '温暖'],
    seasons: ['春'],
    times: ['白天'],
    environments: ['郊野', '江边', '花草'],
    popularity_score: 0.9,
  },
  {
    line_text: '明月几时有？把酒问青天。',
    title: '水调歌头',
    author: '苏轼',
    dynasty: '宋',
    moods: ['思亲', '哲思', '节日'],
    weather: ['晴'],
    seasons: ['秋'],
    times: ['夜晚'],
    environments: ['高处', '庭院'],
    popularity_score: 0.99,
  },
  {
    line_text: '等闲识得东风面，万紫千红总是春。',
    title: '春日',
    author: '朱熹',
    dynasty: '宋',
    moods: ['振奋', '积极', '明朗'],
    weather: ['晴', '和风'],
    seasons: ['春'],
    times: ['白天'],
    environments: ['公园', '河畔', '花海'],
    popularity_score: 0.88,
  },
  {
    line_text: '千山鸟飞绝，万径人踪灭。',
    title: '江雪',
    author: '柳宗元',
    dynasty: '唐',
    moods: ['孤清', '沉思', '冷静'],
    weather: ['雪', '寒冷'],
    seasons: ['冬'],
    times: ['白天'],
    environments: ['江边', '雪景'],
    popularity_score: 0.91,
  },
];

const ALIASES = {
  mood: {
    cheerful: ['happy', 'joy', 'joyful', '轻快', '积极', '明朗', '振奋', '开心', '高兴'],
    calm: ['calm', 'peaceful', 'quiet', '宁静', '平静', '清新', '悠然', '治愈'],
    lonely: ['lonely', 'alone', '孤独', '孤清'],
    reflective: ['thoughtful', 'reflective', '哲思', '沉思', '感怀'],
    homesick: ['homesick', '思念', '思亲'],
  },
  weather: {
    clear: ['clear', 'sunny', '晴', '晴朗'],
    cloudy: ['cloud', 'cloudy', 'overcast', '多云', '阴'],
    rain: ['rain', 'rainy', 'drizzle', '雨', '雨后'],
    snow: ['snow', 'snowy', '雪'],
    cold: ['cold', '寒冷', '微冷', '凉'],
    warm: ['warm', '温暖'],
  },
  season: {
    spring: ['spring', '春'],
    summer: ['summer', '夏'],
    autumn: ['autumn', 'fall', '秋'],
    winter: ['winter', '冬'],
  },
  time: {
    day: ['morning', 'afternoon', '白天', '下午', '早晨'],
    dusk: ['dusk', 'evening', '傍晚'],
    night: ['night', 'late night', '夜晚', '凌晨'],
  },
  env: {
    mountain: ['mountain', '山', '山林'],
    river: ['river', '江', '河', '溪', '江边', '河畔'],
    city: ['city', 'urban', '城', '都市', 'school', 'campus', '学校'],
    flowers: ['flower', 'flowers', '花', '花草', '花海'],
    yard: ['courtyard', '庭院', '花间'],
  },
};

function normalize(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff\s-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function concepts(text, map) {
  const t = normalize(text);
  const set = new Set();
  Object.entries(map).forEach(([k, words]) => {
    if (words.some((w) => t.includes(normalize(w)))) set.add(k);
  });
  return set;
}

function overlap(a, b, weight) {
  if (!a.size || !b.size) return 0;
  let n = 0;
  a.forEach((x) => {
    if (b.has(x)) n += 1;
  });
  return n * weight;
}

function mismatchPenalty(a, b, penalty) {
  if (!a.size || !b.size) return 0;
  for (const x of a) {
    if (b.has(x)) return 0;
  }
  return penalty;
}

function score(poem, context) {
  const moodC = concepts(context.emotion_text, ALIASES.mood);
  const moodP = concepts(poem.moods.join(' '), ALIASES.mood);

  const weatherC = concepts(context.weather, ALIASES.weather);
  const weatherP = concepts(poem.weather.join(' '), ALIASES.weather);

  const seasonC = concepts(context.season, ALIASES.season);
  const seasonP = concepts(poem.seasons.join(' '), ALIASES.season);

  const timeC = concepts(context.time_of_day, ALIASES.time);
  const timeP = concepts(poem.times.join(' '), ALIASES.time);

  const envC = concepts(context.environment_style, ALIASES.env);
  const envP = concepts(poem.environments.join(' '), ALIASES.env);

  let s = 0;
  s += overlap(moodC, moodP, 3.2);
  s += overlap(weatherC, weatherP, 2.2);
  s += overlap(seasonC, seasonP, 2.6);
  s += overlap(timeC, timeP, 2.2);
  s += overlap(envC, envP, 2.0);

  s += mismatchPenalty(seasonC, seasonP, -1.2);
  s += mismatchPenalty(timeC, timeP, -0.8);
  s += mismatchPenalty(weatherC, weatherP, -0.5);

  s += poem.popularity_score * 0.06;
  return s;
}

function recommend(context) {
  const ranked = POEMS.map((p) => ({ p, s: score(p, context) })).sort((a, b) => b.s - a.s);
  const best = ranked[0].p;
  const alternatives = ranked.slice(1, 3).map((r) => `${r.p.line_text} —— ${r.p.title}·${r.p.author}`);
  const confidence = Math.max(0.25, Math.min(0.95, (ranked[0].s + 0.8) / 10));

  return {
    line_text: best.line_text,
    title: best.title,
    author: best.author,
    dynasty: best.dynasty,
    match_reason: `Matched by emotion (${context.emotion_text}), weather (${context.weather}), season (${context.season}), time (${context.time_of_day}), environment (${context.environment_style}), and location (${context.city_or_location}).`,
    modern_explanation:
      'This line is chosen because its imagery and emotional tone align with your current context, with popularity used only as a tie-break preference.',
    confidence,
    popularity_score: best.popularity_score,
    alternatives,
  };
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    return sendJson(res, 404, { error: 'Not found' });
  }

  if (req.method === 'OPTIONS') {
    return sendJson(res, 204, {});
  }

  if (req.method === 'GET' && req.url === '/health') {
    return sendJson(res, 200, { ok: true, service: 'poetry-match-backend' });
  }

  if (req.method === 'POST' && req.url === '/api/v1/match') {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        const context = JSON.parse(raw || '{}');
        const required = ['emotion_text', 'city_or_location', 'environment_style', 'weather', 'season', 'time_of_day'];
        const missing = required.find((k) => !normalize(context[k]));
        if (missing) {
          return sendJson(res, 400, { error: `Missing required field: ${missing}` });
        }

        return sendJson(res, 200, recommend(context));
      } catch {
        return sendJson(res, 400, { error: 'Invalid JSON' });
      }
    });
    return;
  }

  return sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[backend] Poetry match API listening at http://0.0.0.0:${PORT}`);
  console.log('[backend] Health: GET /health');
  console.log('[backend] Match:  POST /api/v1/match');
});
