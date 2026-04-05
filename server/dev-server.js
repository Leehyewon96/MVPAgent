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
  const html = cleanCode.replace('</body>', `${tracking}</body>`);

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
//  LLM Pipeline APIs (unchanged)
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

위 지시서의 핵심 원칙과 출력 형식을 반드시 따라 시스템 기획서와 콘텐츠 기획서를 작성하세요.`,
      4096,
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
    const { plan } = req.body;
    const sys = plan.systemDesign;
    const content = plan.contentDesign;
    const promptMd = loadPrompt('dev-agent.md');

    const planSummary = `제목: ${sys.title}
장르: ${sys.genre}
핵심 루프: ${sys.coreLoop}
조작: ${sys.controls}
메카닉: ${sys.mechanics.join(', ')}
승리/게임오버 조건: ${sys.winCondition}
난이도: ${sys.difficulty}
밸런스: ${JSON.stringify(sys.balance || {}, null, 2)}
테마: ${content.theme}
적: ${JSON.stringify(content.enemies, null, 2)}
아이템: ${JSON.stringify(content.items, null, 2)}
색상: ${content.colorScheme}`;

    const response = await ask(
      promptMd || `당신은 HTML5 게임 개발 전문가입니다.`,
      `다음 기획서를 기반으로 완전한 HTML5 게임을 만들어주세요. 위 지시서의 기술 규칙과 수치 반영 원칙을 반드시 따르세요.

${planSummary}

완전한 HTML 코드를 \`\`\`html 블록으로 반환하세요.`,
      16384,
    );
    const gameCode = extractHTML(response.content[0].text);
    res.json({
      gameId: `game_${Date.now()}`,
      title: sys.title,
      genre: sys.genre,
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
    const { gameId, title, genre, plan } = req.body;
    const promptMd = loadPrompt('judge-agent.md');
    const response = await ask(
      promptMd || `당신은 게임 QA 및 시장 분석 전문가입니다.`,
      `다음 게임을 평가해주세요. 위 지시서의 평가 항목, 판정 기준, 출력 형식을 반드시 따르세요.

- 제목: ${title}
- 장르: ${genre}
- 기획 요약: ${JSON.stringify(plan?.systemDesign || {}, null, 2)}`,
      1024,
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
