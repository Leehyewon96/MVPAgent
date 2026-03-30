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

  const lines = [
    `# ${sys.title || '게임 기획서'}`,
    '',
    `> 작성 일시: ${new Date(result.createdAt).toLocaleString('ko-KR')}`,
    '',
    '---',
    '',
    '## Part 1: 시스템 기획서',
    '',
    `| 항목 | 내용 |`,
    `|------|------|`,
    `| 장르 | ${sys.genre || '-'} |`,
    `| 코어 루프 | ${sys.coreLoop || '-'} |`,
    `| 조작 방법 | ${sys.controls || '-'} |`,
    `| 승리/게임오버 | ${sys.winCondition || '-'} |`,
    `| 난이도 | ${sys.difficulty || '-'} |`,
    '',
    '### 핵심 메카닉',
    '',
  ];

  (sys.mechanics || []).forEach((m) => lines.push(`- ${m}`));

  lines.push('', '---', '', '## Part 2: 콘텐츠 기획서', '');
  lines.push(`| 항목 | 내용 |`);
  lines.push(`|------|------|`);
  lines.push(`| 테마 | ${con.theme || '-'} |`);
  lines.push(`| 스테이지 수 | ${con.stages || '-'} |`);
  lines.push(`| 색상 팔레트 | ${con.colorScheme || '-'} |`);
  lines.push('');

  if (con.enemies?.length) {
    lines.push('### 적 목록', '');
    con.enemies.forEach((e) => lines.push(`- ${e}`));
    lines.push('');
  }

  if (con.items?.length) {
    lines.push('### 아이템 목록', '');
    con.items.forEach((it) => lines.push(`- ${it}`));
    lines.push('');
  }

  return lines.join('\n');
}
