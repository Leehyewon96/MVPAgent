import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const GAMES_FILE = join(DATA_DIR, 'games.json');
const EVENTS_FILE = join(DATA_DIR, 'events.json');
const PROMPTS_DIR = join(__dirname, '..', 'src', 'agents', 'prompts');
const RESOURCES_DIR = join(DATA_DIR, 'resources');

function loadPrompt(filename) {
  const filepath = join(PROMPTS_DIR, filename);
  try {
    return readFileSync(filepath, 'utf-8');
  } catch (e) {
    console.warn(`[Prompt] Failed to load ${filename}:`, e.message);
    return '';
  }
}

const app = express();
const PORT = 3100;

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.text({ type: 'text/plain', limit: '1mb' }));
if (!existsSync(RESOURCES_DIR)) mkdirSync(RESOURCES_DIR, { recursive: true });
app.use('/resources', express.static(RESOURCES_DIR));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ═══════════════════════════════════════════════════
//  Persistent stores (file-backed)
// ═══════════════════════════════════════════════════
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

function loadJSON(filepath, fallback) {
  try {
    if (existsSync(filepath)) return JSON.parse(readFileSync(filepath, 'utf-8'));
  } catch (e) {
    console.warn(`Failed to load ${filepath}:`, e.message);
  }
  return fallback;
}

function saveGames() {
  try {
    const obj = {};
    for (const [k, v] of gamesStore) obj[k] = v;
    writeFileSync(GAMES_FILE, JSON.stringify(obj), 'utf-8');
  } catch (e) {
    console.warn('Failed to save games:', e.message);
  }
}

function saveEvents() {
  try {
    const obj = {};
    for (const [k, v] of playEvents) obj[k] = v;
    writeFileSync(EVENTS_FILE, JSON.stringify(obj), 'utf-8');
  } catch (e) {
    console.warn('Failed to save events:', e.message);
  }
}

const gamesRaw = loadJSON(GAMES_FILE, {});
const eventsRaw = loadJSON(EVENTS_FILE, {});
const gamesStore = new Map(Object.entries(gamesRaw));
const playEvents = new Map(Object.entries(eventsRaw));
const sseClients = new Set();

let sanitized = 0;
for (const [id, game] of gamesStore) {
  if (game.code && /^```/.test(game.code.trim())) {
    game.code = ensureValidHTML(game.code);
    sanitized++;
  }
}
if (sanitized > 0) { saveGames(); console.log(`  Sanitized ${sanitized} game(s) with markdown wrappers`); }
console.log(`  Loaded ${gamesStore.size} games, ${playEvents.size} event groups from disk`);

function broadcast(event, data) {
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of sseClients) {
    res.write(msg);
  }
}

// ═══════════════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════════════
function ask(systemPrompt, userPrompt, maxTokens = 4096) {
  return client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });
}

function extractJSON(text) {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) return JSON.parse(match[1].trim());
  try { return JSON.parse(text); } catch { return null; }
}

function stripMarkdownWrapper(text) {
  let code = text.trim();
  code = code.replace(/^```(?:html)?\s*\n?/, '');
  code = code.replace(/\n?```\s*$/, '');
  return code.trim();
}

function extractHTML(text) {
  const match = text.match(/```html\s*\n([\s\S]+?)\n```\s*$/);
  if (match) return match[1].trim();
  return stripMarkdownWrapper(text);
}

function ensureValidHTML(code) {
  let html = stripMarkdownWrapper(code);
  if (!html.includes('</script>')) {
    html += '\n</script>';
  }
  if (!html.includes('</body>')) {
    html += '\n</body>';
  }
  if (!html.includes('</html>')) {
    html += '\n</html>';
  }
  return html;
}

// ═══════════════════════════════════════════════════
//  Stable Diffusion resource generation
// ═══════════════════════════════════════════════════
function aspectToSize(ar) {
  const m = { '1:1': [256,256], '16:9': [512,288], '9:16': [288,512], '4:5': [256,320], '5:4': [320,256], '3:2': [384,256], '2:3': [256,384] };
  return m[ar] || [256,256];
}

function buildPlaceholderSVG(id, category, w, h) {
  const colors = { character:'#4ade80', background:'#3b82f6', item:'#f59e0b', boss:'#ef4444', effect:'#a855f7', ui:'#6b7280' };
  const c = colors[category] || '#888';
  const label = id.replace(/_/g, ' ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<rect width="${w}" height="${h}" fill="${c}" opacity="0.15" rx="8"/>
<rect x="2" y="2" width="${w-4}" height="${h-4}" fill="none" stroke="${c}" stroke-width="2" stroke-dasharray="8 4" rx="6"/>
<text x="${w/2}" y="${h/2-8}" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="14" fill="${c}" font-weight="bold">${label}</text>
<text x="${w/2}" y="${h/2+12}" text-anchor="middle" font-family="sans-serif" font-size="11" fill="${c}" opacity="0.7">[${category}]</text>
</svg>`;
}

async function generateSVGWithClaude(resource, context) {
  const [w, h] = aspectToSize(resource.aspectRatio || '1:1');
  const { id, category, prompt } = resource;
  const genre = context?.genre || 'action';
  const theme = context?.theme || 'fantasy';
  const palette = context?.colorPalette;

  const categoryGuide = {
    character: 'Create a cute, expressive game character with visible face (eyes, mouth). Use a clear silhouette. Add small details like accessories, hair, or armor pieces. Character should face the viewer.',
    boss: 'Create a large, imposing boss monster. Make it intimidating with glowing eyes, spikes, or dark aura. Should feel powerful and dangerous. 2-3x more detailed than normal characters.',
    background: 'Create an atmospheric game background with depth. Include 2-3 visual layers (floor/terrain, middle objects, sky/ceiling). Fill the entire canvas. Add subtle details like cracks, grass, clouds, or particles.',
    item: 'Create a clear, iconic game item/pickup with a subtle glow effect. Make it instantly recognizable. Add a small shine or sparkle highlight. Should stand out against any background.',
    effect: 'Create a visual effect like explosion, magic burst, or energy wave. Use radial gradients and translucent shapes. Should feel dynamic and energetic.',
    ui: 'Create a clean UI element with sharp edges, good contrast, and readable layout. Use the game theme colors.',
  };

  try {
    const response = await ask(
      `You are an expert game pixel artist. Generate ONLY a valid SVG tag. No markdown fences, no explanation, no backticks. Just the raw <svg>...</svg> code.`,
      `Create a ${w}×${h} SVG game asset.

Game: "${context?.gameTitle || 'Untitled'}" (${genre})
Theme: ${theme}
Asset: [${category}] ${id} — "${prompt}"
${palette ? `Color palette: background=${palette.background}, player=${palette.player}, enemy=${palette.enemy}, ui=${palette.ui}, accent=${palette.accent}` : ''}

Style: ${categoryGuide[category] || 'Game-appropriate vector art with vibrant colors.'}

Technical rules:
- Start with <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
- Use <defs> for gradients/filters if needed
- Build with basic shapes: rect, circle, ellipse, polygon, path, line
- ${category !== 'background' ? 'Use transparent/dark background so it overlays well on game canvas' : 'Fill the entire canvas with the scene'}
- Keep total SVG under 4000 characters
- NO <text> elements, NO external fonts, NO <image> tags
- Make it visually rich — use 10+ shapes minimum`,
      3072,
    );

    let svg = response.content[0].text.trim();
    svg = svg.replace(/^```(?:svg|xml|html)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    const match = svg.match(/<svg[\s\S]*<\/svg>/);
    if (match) return match[0];
    return null;
  } catch (e) {
    console.warn(`[AI-SVG] Failed for ${id}: ${e.message}`);
    return null;
  }
}

async function generateStableImage(prompt, aspectRatio, outputPath) {
  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey) return false;
  try {
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('output_format', 'png');
    formData.append('model', 'sd3-medium');
    if (aspectRatio) formData.append('aspect_ratio', aspectRatio);

    const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, Accept: 'image/*' },
      body: formData,
    });
    if (!response.ok) {
      console.warn(`[SD] API error ${response.status}: ${(await response.text()).slice(0, 200)}`);
      return false;
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    writeFileSync(outputPath, buffer);
    return true;
  } catch (e) {
    console.warn(`[SD] Failed: ${e.message}`);
    return false;
  }
}

function buildTrackingScript(gameId, serverOrigin) {
  return `
<script>
(function(){
  var GID='${gameId}',API='${serverOrigin}/api/play-events';
  var vid=localStorage.getItem('_mvp_vid');
  if(!vid){vid='v_'+Math.random().toString(36).slice(2)+Date.now().toString(36);localStorage.setItem('_mvp_vid',vid);}
  var sid='s_'+Math.random().toString(36).slice(2)+Date.now().toString(36);
  var start=Date.now(),lastActive=Date.now(),totalActive=0,paused=false;
  function send(type,extra){
    var d={gameId:GID,visitorId:vid,sessionId:sid,type:type,ts:Date.now(),duration:Math.round((Date.now()-start)/1000)};
    if(extra)Object.assign(d,extra);
    try{navigator.sendBeacon?navigator.sendBeacon(API,JSON.stringify(d)):
      fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d),keepalive:true});}catch(e){}
  }
  send('session_start');
  setInterval(function(){if(!paused)send('heartbeat');},15000);
  document.addEventListener('visibilitychange',function(){
    if(document.hidden){paused=true;send('pause');}
    else{paused=false;send('resume');}
  });
  ['keydown','mousedown','touchstart'].forEach(function(e){
    document.addEventListener(e,function(){lastActive=Date.now();},{passive:true});
  });
  window.addEventListener('beforeunload',function(){send('session_end');});
  window._mvpTrack=function(eventName,data){send('game_event',{eventName:eventName,eventData:data});};
})();
</script>`;
}

function computeGameStats(gameId) {
  const events = playEvents.get(gameId) || [];
  if (!events.length) return { gameId, totalSessions: 0, uniqueVisitors: 0, avgDuration: 0, activeSessions: 0, totalPlayTime: 0, peakConcurrent: 0, dailyStats: [] };

  const visitors = new Set();
  const sessions = {};
  let activeSessions = 0;
  const now = Date.now();
  const dailyMap = {};

  for (const ev of events) {
    visitors.add(ev.visitorId);
    if (!sessions[ev.sessionId]) sessions[ev.sessionId] = { start: ev.ts, duration: 0, visitor: ev.visitorId };
    const sess = sessions[ev.sessionId];
    if (ev.duration) sess.duration = Math.max(sess.duration, ev.duration);

    const dayKey = new Date(ev.ts).toISOString().slice(0, 10);
    if (!dailyMap[dayKey]) dailyMap[dayKey] = { date: dayKey, sessions: new Set(), visitors: new Set(), totalDuration: 0 };
    dailyMap[dayKey].sessions.add(ev.sessionId);
    dailyMap[dayKey].visitors.add(ev.visitorId);

    if (ev.type === 'heartbeat' && now - ev.ts < 30000) activeSessions++;
  }

  const sessionList = Object.values(sessions);
  const totalPlayTime = sessionList.reduce((s, ss) => s + ss.duration, 0);
  const avgDuration = sessionList.length ? Math.round(totalPlayTime / sessionList.length) : 0;

  const dailyStats = Object.values(dailyMap)
    .map((d) => ({ date: d.date, sessions: d.sessions.size, visitors: d.visitors.size, avgDuration: 0 }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14);

  return {
    gameId,
    totalSessions: sessionList.length,
    uniqueVisitors: visitors.size,
    avgDuration,
    activeSessions,
    totalPlayTime,
    peakConcurrent: activeSessions,
    dailyStats,
  };
}

function computeAllStats() {
  const result = {};
  for (const [gameId] of gamesStore) {
    result[gameId] = computeGameStats(gameId);
  }

  const allEvents = [...playEvents.values()].flat();
  const allVisitors = new Set(allEvents.map((e) => e.visitorId));
  const allSessions = new Set(allEvents.map((e) => e.sessionId));

  result._global = {
    totalGames: gamesStore.size,
    totalSessions: allSessions.size,
    uniqueVisitors: allVisitors.size,
    totalPlayTime: Object.values(result).reduce((s, r) => s + (r.totalPlayTime || 0), 0),
  };

  return result;
}

// ═══════════════════════════════════════════════════
//  Game registration & serving
// ═══════════════════════════════════════════════════
app.post('/api/games', (req, res) => {
  const game = req.body;
  const id = game.id || game.gameId;
  if (!id || !game.code) return res.status(400).json({ error: 'id and code required' });

  game.code = ensureValidHTML(game.code);
  gamesStore.set(id, game);
  if (!playEvents.has(id)) playEvents.set(id, []);
  saveGames();
  console.log(`[Games] Registered: ${game.title} (${id})`);
  broadcast('game_registered', { gameId: id, title: game.title });
  res.json({ ok: true, playUrl: `/play/${id}` });
});

app.get('/play/:gameId', (req, res) => {
  const game = gamesStore.get(req.params.gameId);
  if (!game || !game.code) return res.status(404).send('<h1>Game not found</h1>');

  const cleanCode = ensureValidHTML(game.code);
  const origin = `${req.protocol}://${req.get('host')}`;
  const tracking = buildTrackingScript(req.params.gameId, origin);

  const resources = game.resources || [];
  const spriteBootstrap = `<script>
(function(){
var GI=window.GAME_IMAGES={};
${resources.length ? `window.GAME_RESOURCES=${JSON.stringify(resources)};
window.GAME_RESOURCES.forEach(function(r){var img=new Image();img.crossOrigin='anonymous';img.onload=img.onerror=function(){};img.src=r.url;GI[r.id]=img;});` : ''}
window.drawSprite=function(id,ctx,x,y,w,h,fb){
var img=GI[id];
if(img&&img.complete&&img.naturalWidth>0){try{ctx.drawImage(img,x,y,w,h);return;}catch(e){}}
if(fb){ctx.fillStyle=fb;ctx.fillRect(x,y,w,h);}
};
window.onerror=function(msg,src,line){console.error('[Game Error] '+msg+' at line '+line);return true;};
})();
</script>
`;

  let html = cleanCode;
  if (html.includes('</head>')) {
    html = html.replace('</head>', spriteBootstrap + '</head>');
  } else if (html.includes('<body')) {
    html = html.replace(/<body[^>]*>/, '$&' + spriteBootstrap);
  } else {
    html = spriteBootstrap + html;
  }

  if (html.includes('</body>')) {
    html = html.replace('</body>', tracking + '</body>');
  } else {
    html += tracking;
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// ═══════════════════════════════════════════════════
//  Play event collection
// ═══════════════════════════════════════════════════
app.post('/api/play-events', (req, res) => {
  let event;
  try {
    if (typeof req.body === 'string') {
      event = JSON.parse(req.body);
    } else if (req.body && typeof req.body === 'object') {
      event = req.body;
    } else {
      return res.status(400).end();
    }
  } catch {
    return res.status(400).end();
  }

  if (!event?.gameId) return res.status(400).end();

  if (!playEvents.has(event.gameId)) playEvents.set(event.gameId, []);
  playEvents.get(event.gameId).push(event);

  if (event.type === 'session_start' || event.type === 'session_end') {
    const stats = computeGameStats(event.gameId);
    console.log(`[Play] ${event.type} | game=${event.gameId} | visitor=${event.visitorId} | visitors=${stats.uniqueVisitors} sessions=${stats.totalSessions}`);
    saveEvents();
  }

  broadcast('play_event', {
    gameId: event.gameId,
    type: event.type,
    visitorId: event.visitorId,
    duration: event.duration,
    ts: event.ts,
  });

  res.status(204).end();
});

// ═══════════════════════════════════════════════════
//  Stats APIs
// ═══════════════════════════════════════════════════
app.get('/api/game-stats', (req, res) => {
  res.json(computeAllStats());
});

app.get('/api/game-stats/:gameId', (req, res) => {
  res.json(computeGameStats(req.params.gameId));
});

// ═══════════════════════════════════════════════════
//  SSE real-time stream
// ═══════════════════════════════════════════════════
app.get('/api/play-stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  sseClients.add(res);
  res.write(`data: ${JSON.stringify({ type: 'connected', ts: Date.now() })}\n\n`);

  req.on('close', () => { sseClients.delete(res); });
});

// ═══════════════════════════════════════════════════
//  Resource Generation (Stable Diffusion)
// ═══════════════════════════════════════════════════
app.post('/api/generate-resources', async (req, res) => {
  try {
    const { resources, context } = req.body;
    if (!resources?.length) return res.json({ gameId: null, resources: [], total: 0, generated: 0 });

    const gameId = `game_${Date.now()}`;
    const gameResDir = join(RESOURCES_DIR, gameId);
    mkdirSync(gameResDir, { recursive: true });

    const results = [];
    for (let i = 0; i < resources.length; i++) {
      const r = resources[i];
      let status = 'placeholder';
      let ext = 'svg';

      console.log(`[Resources] (${i + 1}/${resources.length}) Generating ${r.id}...`);

      if (process.env.STABILITY_API_KEY) {
        ext = 'png';
        const ok = await generateStableImage(r.prompt, r.aspectRatio, join(gameResDir, `${r.id}.png`));
        if (ok) status = 'sd-generated';
      }

      if (status === 'placeholder') {
        const svg = await generateSVGWithClaude(r, context || {});
        if (svg) {
          writeFileSync(join(gameResDir, `${r.id}.svg`), svg);
          status = 'ai-generated';
          ext = 'svg';
        }
      }

      if (status === 'placeholder') {
        const [w, h] = aspectToSize(r.aspectRatio || '1:1');
        writeFileSync(join(gameResDir, `${r.id}.svg`), buildPlaceholderSVG(r.id, r.category, w, h));
      }

      results.push({ id: r.id, category: r.category, url: `/resources/${gameId}/${r.id}.${ext}`, prompt: r.prompt, status });
    }

    const counts = { sd: results.filter(r => r.status === 'sd-generated').length, ai: results.filter(r => r.status === 'ai-generated').length, ph: results.filter(r => r.status === 'placeholder').length };
    console.log(`[Resources] Done: ${results.length} assets for ${gameId} (SD:${counts.sd} AI:${counts.ai} placeholder:${counts.ph})`);
    res.json({ gameId, resources: results, total: resources.length, generated: counts.sd + counts.ai });
  } catch (error) {
    console.error('Resource generation error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════
//  LLM Pipeline APIs
// ═══════════════════════════════════════════════════

app.post('/api/analyze-trends', async (req, res) => {
  try {
    const promptMd = loadPrompt('trend-agent.md');
    const response = await ask(
      promptMd || `당신은 게임 시장 트렌드 분석 전문가입니다.`,
      `현재 인기 있는 게임 트렌드 3가지를 분석해주세요. 위 지시서의 분석 기준과 출력 형식을 반드시 따르세요.`,
      2048,
    );
    const data = extractJSON(response.content[0].text);
    if (!data) throw new Error('JSON 파싱 실패');
    res.json({ ...data, analyzedAt: Date.now() });
  } catch (error) {
    console.error('Trend analysis error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate-plan', async (req, res) => {
  try {
    const { topic } = req.body;
    const promptMd = loadPrompt('plan-agent.md');
    const response = await ask(
      promptMd || `당신은 게임 기획 전문가입니다.`,
      `트렌드 주제: ${topic.keyword}
설명: ${topic.description}
게임 아이디어: ${topic.gameIdea || '자유'}

위 지시서의 Step 1~4를 따라 장르를 선택하고, 해당 장르의 구현 가이드에 맞게 기획서와 리소스 요청서를 작성하세요. 출력 형식의 JSON 스키마를 정확히 따르세요.`,
      8192,
    );
    const data = extractJSON(response.content[0].text);
    if (!data) throw new Error('JSON 파싱 실패');
    res.json({ topic, ...data, createdAt: Date.now() });
  } catch (error) {
    console.error('Plan generation error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate-game', async (req, res) => {
  try {
    const { plan, gameId: providedGameId, resources } = req.body;
    const promptMd = loadPrompt('dev-agent.md');
    const gameId = providedGameId || `game_${Date.now()}`;
    const title = plan.gameTitle || plan.systemDesign?.title || 'Untitled';
    const genre = plan.genreName || plan.systemDesign?.genre || 'Unknown';

    let resourceSection = '';
    if (resources?.length) {
      resourceSection = `\n\n## 렌더링 — drawSprite 사용
drawSprite(id, ctx, x, y, w, h, fallbackColor) 함수가 자동 제공됩니다.
이미지 로드 실패 시 fallbackColor 사각형으로 대체됩니다.
사용 가능한 리소스: ${resources.map(r => `${r.id}(${r.category})`).join(', ')}
배경·플레이어·적·보스·아이템을 drawSprite()로 그리세요. HUD·총알·파티클은 fillRect/arc OK.`;
    }

    const response = await ask(
      promptMd || `당신은 HTML5 게임 개발 전문가입니다.`,
      `기획서 JSON의 모든 항목을 빠짐없이 구현하는 완전한 HTML5 Canvas 게임을 만드세요.

중요: 1) 게임이 반드시 동작해야 합니다. 2) 상태 머신(menu→playing→gameover)을 반드시 구현하세요. 3) 모든 적 종류, 스킬, 보스, 아이템을 구현하세요.
${resourceSection}

\`\`\`json
${JSON.stringify(plan, null, 2)}
\`\`\`

완전한 HTML 코드를 \`\`\`html 블록으로 반환하세요.`,
      16384,
    );
    const gameCode = extractHTML(response.content[0].text);
    res.json({
      gameId,
      title,
      genre,
      code: gameCode,
      buildStatus: 'success',
      createdAt: Date.now(),
    });
  } catch (error) {
    console.error('Game generation error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/evaluate-game', async (req, res) => {
  try {
    const { gameId, title, genre, plan, code } = req.body;
    const promptMd = loadPrompt('judge-agent.md');
    const codeSnippet = code ? code.substring(0, 20000) : '(코드 없음)';
    const response = await ask(
      promptMd || `당신은 게임 QA 및 시장 분석 전문가입니다.`,
      `다음 게임을 평가해주세요. 위 지시서의 평가 항목, 판정 기준, 출력 형식을 반드시 따르세요.

- 제목: ${title}
- 장르: ${genre}

## 기획서
${JSON.stringify(plan || {}, null, 2)}

## 실제 구현 코드 (HTML)
\`\`\`html
${codeSnippet}
\`\`\``,
      2048,
    );
    const data = extractJSON(response.content[0].text);
    if (!data) throw new Error('JSON 파싱 실패');
    res.json({ gameId, ...data, evaluatedAt: Date.now() });
  } catch (error) {
    console.error('Evaluation error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const server = app.listen(PORT, () => {
  console.log(`\n  MVP Agent Dev Server running at http://localhost:${PORT}`);
  console.log(`  Anthropic API: ${process.env.ANTHROPIC_API_KEY ? '✓ Connected' : '✗ Missing key'}`);
  console.log(`  Stability AI:  ${process.env.STABILITY_API_KEY ? '✓ Connected' : '⚠ No key (placeholder mode)'}`);
  console.log(`  Game play URL: http://localhost:${PORT}/play/:gameId\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`  Port ${PORT} is already in use. Kill the existing process and retry.`);
  } else {
    console.error('  Server error:', err);
  }
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});
