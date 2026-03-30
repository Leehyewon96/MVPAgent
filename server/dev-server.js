import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
const PORT = 3100;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

function extractHTML(text) {
  const match = text.match(/```(?:html)?\s*([\s\S]*?)```/);
  return match ? match[1].trim() : text;
}

// ─── 1. 트렌드 분석 ───
app.post('/api/analyze-trends', async (req, res) => {
  try {
    const response = await ask(
      `당신은 게임 시장 트렌드 분석 전문가입니다. 현재 게임 커뮤니티, 유튜브, OTT에서 핫한 주제를 분석하여 웹 게임 소재로 적합한 트렌드를 찾아주세요.`,
      `현재 인기 있는 게임 트렌드 3가지를 분석해주세요. 각 트렌드는 간단한 웹 브라우저 게임(HTML5/Canvas)으로 만들 수 있어야 합니다.

다음 JSON 형식으로 응답하세요:
\`\`\`json
{
  "topics": [
    {
      "keyword": "트렌드 키워드",
      "source": "출처 (YouTube/게임 커뮤니티/OTT 중 택1)",
      "score": 0.0~1.0 사이 점수,
      "description": "왜 이 트렌드가 게임 소재로 적합한지 한 줄 설명",
      "gameIdea": "이 트렌드를 활용한 간단한 웹 게임 아이디어 한 줄"
    }
  ]
}
\`\`\``,
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

// ─── 2. 기획서 생성 ───
app.post('/api/generate-plan', async (req, res) => {
  try {
    const { topic } = req.body;

    const response = await ask(
      `당신은 게임 기획 전문가입니다. 주어진 트렌드 주제를 기반으로 간단한 HTML5 웹 게임의 시스템 기획서와 콘텐츠 기획서를 작성해주세요. 게임은 마우스/키보드로 조작하는 브라우저 게임이어야 합니다.`,
      `트렌드 주제: ${topic.keyword}
설명: ${topic.description}
게임 아이디어: ${topic.gameIdea || '자유'}

다음 JSON 형식으로 시스템 기획서와 콘텐츠 기획서를 작성하세요:
\`\`\`json
{
  "systemDesign": {
    "title": "게임 제목",
    "genre": "장르",
    "coreLoop": "핵심 게임 루프 한 줄 설명",
    "controls": "조작 방법 설명",
    "mechanics": ["메카닉1", "메카닉2", "메카닉3"],
    "winCondition": "승리/게임오버 조건",
    "difficulty": "난이도 진행 방식"
  },
  "contentDesign": {
    "title": "콘텐츠 기획서 제목",
    "theme": "시각적 테마/분위기",
    "stages": 3,
    "enemies": ["적1", "적2", "적3"],
    "items": ["아이템1", "아이템2"],
    "colorScheme": "주요 색상 팔레트 설명"
  }
}
\`\`\``,
      2048,
    );

    const data = extractJSON(response.content[0].text);
    if (!data) throw new Error('JSON 파싱 실패');

    res.json({ topic, ...data, createdAt: Date.now() });
  } catch (error) {
    console.error('Plan generation error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── 3. 게임 코드 생성 ───
app.post('/api/generate-game', async (req, res) => {
  try {
    const { plan } = req.body;
    const sys = plan.systemDesign;
    const content = plan.contentDesign;

    const response = await ask(
      `당신은 HTML5 게임 개발 전문가입니다. 주어진 기획서를 기반으로 완전히 동작하는 HTML5 Canvas 게임을 단일 HTML 파일로 생성하세요.

중요 규칙:
- 단일 HTML 파일에 CSS와 JavaScript를 모두 포함
- HTML5 Canvas 사용 (800x600 크기)
- 외부 라이브러리 없이 순수 JavaScript만 사용
- 게임 루프(requestAnimationFrame) 기반
- 키보드/마우스 입력 처리
- 점수 시스템 포함
- 게임 오버 시 재시작 가능
- 시각적으로 깔끔하고 플레이 가능한 게임
- 반드시 재미있어야 함`,
      `다음 기획서를 기반으로 완전한 HTML5 게임을 만들어주세요.

제목: ${sys.title}
장르: ${sys.genre}
핵심 루프: ${sys.coreLoop}
조작: ${sys.controls}
메카닉: ${sys.mechanics.join(', ')}
승리/게임오버 조건: ${sys.winCondition}
테마: ${content.theme}
적: ${content.enemies.join(', ')}
아이템: ${content.items.join(', ')}
색상: ${content.colorScheme}

완전한 HTML 코드를 \`\`\`html 블록으로 반환하세요.`,
      8192,
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

// ─── 4. 게임 평가 ───
app.post('/api/evaluate-game', async (req, res) => {
  try {
    const { gameId, title, genre, plan } = req.body;

    const response = await ask(
      `당신은 게임 QA 및 시장 분석 전문가입니다. 생성된 게임의 품질과 시장성을 평가해주세요.`,
      `다음 게임을 평가해주세요:
- 제목: ${title}
- 장르: ${genre}
- 기획 요약: ${JSON.stringify(plan?.systemDesign || {}, null, 2)}

다음 JSON 형식으로 평가 결과를 작성하세요:
\`\`\`json
{
  "decision": "go 또는 nogo",
  "reasoning": "판정 이유 2~3줄",
  "scores": {
    "gameplay": 0~100,
    "visual": 0~100,
    "replayability": 0~100,
    "marketFit": 0~100
  },
  "suggestions": ["개선 제안1", "개선 제안2"]
}
\`\`\``,
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

app.listen(PORT, () => {
  console.log(`\n  MVP Agent Dev Server running at http://localhost:${PORT}`);
  console.log(`  Anthropic API: ${process.env.ANTHROPIC_API_KEY ? '✓ Connected' : '✗ Missing key'}\n`);
});
