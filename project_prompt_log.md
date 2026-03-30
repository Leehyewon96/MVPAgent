# Project Prompt Log

---

## #1
- **시간**: 2026-03-30 13:16
- **프롬프트**:
  > @docs/project_rules.md 를 따르도록 해 project_prompt_log.md가 없으면 만들어
  > @docs/MVP_Agent_propos.md 을 읽고 개발을진행해줄래? 파일 추가 및 폴더 생성 등등 개발과 관련된 모든 권한은 너에게 줄게 이 프롬프트 저장해줘
- **수행 내용**: MVP Agent 프로젝트 초기 세팅 (Vite + React, Tailwind CSS, Firebase, Zustand, 폴더 구조 생성, 핵심 컴포넌트/페이지/Agent 뼈대 구현)
- **소요 시간**: 약 6분 (13:16 ~ 13:22)

---

## #2
- **시간**: 2026-03-30 13:35
- **프롬프트**:
  > 이제 다음 단계들 진행해줘 이 프롬프트 저장해줘
- **수행 내용**: 파이프라인 실행 연결 (useAgentPipeline 훅), Recharts 차트 4종 구현 (DAU, 세션, 리텐션, 장르 레이더), Dashboard/Reports 페이지 고도화, React Query Firestore 훅, ErrorBoundary, Vercel 배포 설정
- **소요 시간**: 약 4분 (13:35 ~ 13:39)

---

## #3
- **시간**: 2026-03-30 13:57
- **프롬프트**:
  > 작동 테스트를 내가 직접 해보고 싶어
- **수행 내용**: Firebase 미연결 시 하얀 화면 이슈 해결. firebase/config.js를 조건부 초기화로 변경, authStore에 Dev Mode 추가 (테스트 계정 로그인), 모든 Agent를 Firebase 미연결 시 목업 데이터로 안전 동작하도록 수정, queries.js 전면 리팩터링, 개발 서버 실행 (localhost:3000)
- **소요 시간**: 약 6분 (13:57 ~ 14:03)

---

## #4
- **시간**: 2026-03-30 14:03
- **프롬프트**:
  > 방금 이작업 @project_prompt_log.md 에 저장해줘
- **수행 내용**: #3, #4 프롬프트 로그 기록
- **소요 시간**: 약 1분

---

## #5
- **시간**: 2026-03-30 14:10
- **프롬프트**:
  > .env.local 값을 채우고 http://localhost:3000에 접속하면 첨부한 이미지처럼 배경만 뜨는데?
  > 흰색 화면만 나와 지금 이거 유효하게 잘 작동하는지 테스트 해줘
- **수행 내용**: Firebase 초기화 흰 화면 이슈 2차 수정. (1) firebase/config.js에서 top-level await 제거 → 정적 import로 전환, initializeApp을 try-catch로 감싸 에러 방어. (2) VITE_FIREBASE_DATABASE_URL 값이 Google Analytics ID로 잘못 입력된 것 발견 → URL 검증 로직 추가 (https:// 접두사 확인). (3) authStore에 3초 타임아웃 fallback 추가, onAuthStateChanged를 정적 import로 변경. (4) queries.js 정적 import 복원. (5) 모든 Agent 정적 import 통일. (6) App.jsx 로딩 스피너 가시성 개선. (7) 포트 충돌 해결 후 서버 재시작.
- **소요 시간**: 약 10분 (14:10 ~ 14:20)

---

## #6
- **시간**: 2026-03-30 14:37
- **프롬프트**:
  > 이 내용 @project_prompt_log.md 에 넣어주고 앞으로 너가 작업을 할때마다 너가 한 작업들에 대한 내용을 정리해서 @project_prompt_log.md 에 넣어줘 따로 내가 프롬프트 추가해달라고 안해도. 이 규칙도 @.cursor/rules/update-structure.mdc 랑 @AGENTS.md 에 반영해서 수정해줘
- **수행 내용**: 자동 로깅 규칙 적용 — AGENTS.md, .cursor/rules Cursor 규칙, project_prompt_log.md 업데이트. 이후 모든 작업은 자동으로 로그에 기록됨.
- **소요 시간**: 약 1분

---

## #7
- **시간**: 2026-03-30 14:55
- **프롬프트**:
  > 이거 실제로 파이프라인 시작 버튼 누르면 실제로 시장조사-기획-개발 까지 실제로 실행되게 해줘
- **수행 내용**:
  1. **로컬 API 서버 구축** (`server/dev-server.js`) — Express + Anthropic Claude SDK 기반. 4개 엔드포인트: 트렌드 분석, 기획서 생성, 게임 코드 생성, 게임 평가
  2. **TrendAgent 실연동** — Claude API로 실제 게임 트렌드 3개를 분석·반환
  3. **PlanAgent 실연동** — Claude API로 실제 시스템/콘텐츠 기획서 자동 생성
  4. **DevAgent 실연동** — Claude API로 실제 플레이 가능한 HTML5 Canvas 게임 코드 생성 (단일 HTML 파일). API 실패 시 기본 슈팅 게임 fallback 포함
  5. **JudgeAgent 실연동** — Claude API로 게임 품질 4개 항목 점수 평가 + Go/No-Go 판정
  6. **GamePlayer iframe 렌더링** — 생성된 HTML 게임 코드를 Blob URL로 변환하여 iframe에서 실제 플레이 가능하도록 구현
  7. **gameStore 확장** — `addGame`, `getGameById` 추가. 게임 코드(code) 필드 저장
  8. **useAgentPipeline 훅 수정** — 파이프라인 완료 시 게임 코드 포함하여 store에 저장
  9. **npm scripts** — `npm run dev`로 Vite + API 서버 동시 실행 (concurrently)
  10. 의존성 추가: `@anthropic-ai/sdk`, `express`, `cors`, `dotenv`, `concurrently`
- **소요 시간**: 약 4분 (14:55 ~ 14:59)

---

## #8
- **시간**: 2026-03-30 15:33
- **프롬프트**:
  > http://localhost:3000 이 페이지의 각 Agent 파이프라인에서 만들어진 결과물을 개발자가 볼 수 있게 해줘. 시장조사 Agent는 본인이 찾은 트렌드 내용을 정리한걸 보여주고 기획 Agent는 본인이 작성한 기획서를 보여주도록해 자료를 각각 다운받을 수도 있게 해줘
- **수행 내용**:
  1. **download.js 유틸리티** 생성 — MD/JSON/HTML 다운로드 함수 + 트렌드 결과→마크다운, 기획서→마크다운 변환 함수
  2. **AgentPipeline.jsx 전면 개편** — 각 Agent별 상세 결과 패널 구현:
     - **시장조사**: 트렌드 카드(키워드, 출처, 스코어 바, 설명, 게임 아이디어) + MD/JSON 다운로드
     - **기획**: 시스템 기획서(장르, 코어 루프, 조작법, 메카닉 태그) + 콘텐츠 기획서(테마, 적/아이템 태그, 색상) + MD/JSON 다운로드
     - **개발**: 빌드 정보 + HTML 게임 코드 다운로드 + 게임 플레이 링크
     - **판단**: Go/No-Go 판정 + 4개 항목 점수 프로그레스 바 애니메이션 + 개선 제안 태그 + JSON 다운로드
  3. 접기/펼치기 토글 + AnimatePresence 애니메이션 적용
- **소요 시간**: 약 2분 (15:33 ~ 15:35)
