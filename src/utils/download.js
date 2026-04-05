/**
 * 파일 다운로드 유틸리티
 */

export function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadMarkdown(content, filename) {
  downloadFile(content, filename, 'text/markdown');
}

export function downloadJSON(data, filename) {
  downloadFile(JSON.stringify(data, null, 2), filename, 'application/json');
}

export function downloadHTML(content, filename) {
  downloadFile(content, filename, 'text/html');
}

export function trendResultToMarkdown(result) {
  const lines = [
    '# 시장조사 트렌드 분석 리포트',
    '',
    `> 분석 일시: ${new Date(result.analyzedAt).toLocaleString('ko-KR')}`,
    '',
    '---',
    '',
  ];

  result.topics?.forEach((t, i) => {
    lines.push(`## ${i + 1}. ${t.keyword}`);
    lines.push('');
    lines.push(`| 항목 | 내용 |`);
    lines.push(`|------|------|`);
    lines.push(`| 출처 | ${t.source} |`);
    lines.push(`| 스코어 | ${t.score} |`);
    lines.push(`| 설명 | ${t.description} |`);
    if (t.gameIdea) lines.push(`| 게임 아이디어 | ${t.gameIdea} |`);
    lines.push('');
  });

  return lines.join('\n');
}

export function planResultToMarkdown(result) {
  const sys = result.systemDesign || {};
  const con = result.contentDesign || {};
  const title = result.gameTitle || sys.title || '게임 기획서';
  const genre = result.genreName || sys.genre || '-';
  const mechanics = sys.keyMechanics || sys.mechanics || [];
  const enemies = con.enemyList || con.enemies || [];
  const items = con.itemList || con.items || [];
  const stages = con.stageCount || con.stages || '-';

  const lines = [
    `# ${title}`,
    '',
    `> 작성 일시: ${new Date(result.createdAt).toLocaleString('ko-KR')}`,
    '',
    '---',
    '',
    '## Part 1: 시스템 기획서',
    '',
    `| 항목 | 내용 |`,
    `|------|------|`,
    `| 장르 | ${genre} |`,
    `| 코어 루프 | ${sys.coreLoop || '-'} |`,
    `| 조작 방법 | ${sys.controls || '-'} |`,
    `| 승리/게임오버 | ${sys.winCondition || '-'} |`,
    `| 난이도 | ${sys.difficulty || '-'} |`,
    '',
  ];

  if (sys.playerStats) {
    lines.push('### 플레이어 스탯', '');
    Object.entries(sys.playerStats).forEach(([k, v]) => lines.push(`- **${k}**: ${v}`));
    lines.push('');
  }

  if (mechanics.length) {
    lines.push('### 핵심 메카닉', '');
    mechanics.forEach((m) => lines.push(`- ${m}`));
    lines.push('');
  }

  if (sys.enemyTypes?.length) {
    lines.push('### 적 상세 스탯', '');
    sys.enemyTypes.forEach((e) => {
      lines.push(`- **${e.name}** — HP: ${e.hp}, 속도: ${e.speed}, 공격력: ${e.attackPower}, 스폰간격: ${e.spawnInterval}s, 골드: ${e.rewardGold}`);
    });
    lines.push('');
  }

  if (sys.skills?.length) {
    lines.push('### 스킬', '');
    sys.skills.forEach((s) => {
      lines.push(`- **${s.name}** (${s.key}) — 쿨다운: ${s.cooldown}s, 데미지: ${s.damage}, ${s.description}`);
    });
    lines.push('');
  }

  if (sys.waveSystem) {
    lines.push('### 웨이브 시스템', '');
    Object.entries(sys.waveSystem).forEach(([k, v]) => lines.push(`- **${k}**: ${v}`));
    lines.push('');
  }

  lines.push('---', '', '## Part 2: 콘텐츠 기획서', '');
  lines.push(`| 항목 | 내용 |`);
  lines.push(`|------|------|`);
  lines.push(`| 테마 | ${con.theme || '-'} |`);
  lines.push(`| 스테이지 수 | ${stages} |`);
  if (con.colorPalette) {
    lines.push(`| 색상 팔레트 | ${Object.entries(con.colorPalette).map(([k, v]) => `${k}: ${v}`).join(', ')} |`);
  }
  lines.push('');

  if (enemies.length) {
    lines.push('### 적 목록', '');
    enemies.forEach((e) => lines.push(`- ${typeof e === 'object' ? e.name : e}`));
    lines.push('');
  }

  if (items.length) {
    lines.push('### 아이템 목록', '');
    items.forEach((it) => lines.push(`- ${typeof it === 'object' ? it.name : it}`));
    lines.push('');
  }

  if (con.upgradeList?.length) {
    lines.push('### 업그레이드', '');
    con.upgradeList.forEach((u) => {
      lines.push(`- **${u.name}** — 비용: ${u.cost}, 효과: ${u.effect}, 최대 레벨: ${u.maxLevel}`);
    });
    lines.push('');
  }

  if (con.bossDesign?.name) {
    lines.push('### 보스', '');
    lines.push(`- **${con.bossDesign.name}** — HP: ${con.bossDesign.hp}`);
    con.bossDesign.phases?.forEach((p, i) => lines.push(`  - 페이즈 ${i + 1}: ${p}`));
    lines.push('');
  }

  return lines.join('\n');
}
