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
  > .env.local 값을 채우고 [http://localhost:3000에](http://localhost:3000에) 접속하면 첨부한 이미지처럼 배경만 뜨는데?
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
  > [http://localhost:3000](http://localhost:3000) 이 페이지의 각 Agent 파이프라인에서 만들어진 결과물을 개발자가 볼 수 있게 해줘. 시장조사 Agent는 본인이 찾은 트렌드 내용을 정리한걸 보여주고 기획 Agent는 본인이 작성한 기획서를 보여주도록해 자료를 각각 다운받을 수도 있게 해줘
- **수행 내용**:
  1. **download.js 유틸리티** 생성 — MD/JSON/HTML 다운로드 함수 + 트렌드 결과→마크다운, 기획서→마크다운 변환 함수
  2. **AgentPipeline.jsx 전면 개편** — 각 Agent별 상세 결과 패널 구현:
    - **시장조사**: 트렌드 카드(키워드, 출처, 스코어 바, 설명, 게임 아이디어) + MD/JSON 다운로드
    - **기획**: 시스템 기획서(장르, 코어 루프, 조작법, 메카닉 태그) + 콘텐츠 기획서(테마, 적/아이템 태그, 색상) + MD/JSON 다운로드
    - **개발**: 빌드 정보 + HTML 게임 코드 다운로드 + 게임 플레이 링크
    - **판단**: Go/No-Go 판정 + 4개 항목 점수 프로그레스 바 애니메이션 + 개선 제안 태그 + JSON 다운로드
  3. 접기/펼치기 토글 + AnimatePresence 애니메이션 적용
- **소요 시간**: 약 2분 (15:33 ~ 15:35)

---

## #9

- **시간**: 2026-03-30 15:44
- **프롬프트**:
  > [http://localhost:3000](http://localhost:3000) 이 페이지에 만들었던 게임을 게임별로 주제, 기획서, 게임링크를 볼 수 있는 탭을 만들어줘
- **수행 내용**:
  1. **GameLibrary.jsx 페이지 생성** — 파이프라인에서 생성된 게임 목록을 카드 형태로 표시. 각 카드에 3개 탭 제공:
    - **주제 탭**: 게임 트렌드 키워드, 출처, 설명, 게임 아이디어, 트렌드 스코어 바 + JSON 다운로드
    - **기획서 탭**: 시스템 기획서(장르, 코어 루프, 조작, 메카닉) + 콘텐츠 기획서(테마, 적, 아이템, 색상) + MD/JSON 다운로드
    - **게임 탭**: 빌드 정보, 평가 점수 프로그레스 바, 게임 플레이 링크 + HTML 다운로드
  2. **라우터 등록** — `App.jsx`에 `/games` 라우트 추가
  3. **사이드바 메뉴 추가** — `Sidebar.jsx`에 "게임 라이브러리 🎮" 메뉴 항목 추가
  4. `structure.md` 업데이트
- **소요 시간**: 약 2분 (15:44 ~ 15:46)

---

## #10
- **시간**: 2026-03-30 15:50
- **프롬프트**:
  > http://localhost:3000 이 창 새로 열면 만들었던 게임관련 정보가 다 없는데 이거 계정별로 다 저장해서 유지되게 해줘
- **수행 내용**:
  1. **gameStore.js 영속화 구현** — 게임 데이터를 계정(uid)별로 자동 저장·로드:
     - Firebase 연결 시: Firestore `users/{uid}/games` 컬렉션에 게임별 문서로 저장/조회
     - Dev Mode: `localStorage`에 유저별 키(`mvpagent_games_{uid}`)로 저장/조회
     - localStorage에만 데이터가 있을 경우 Firestore로 자동 마이그레이션
     - `addGame` 시 Firestore + localStorage 동시 저장 (이중 백업)
     - `removeGame` 기능 추가 (Firestore + localStorage 동기 삭제)
  2. **useGameSync.js 훅 생성** — `useAuthStore`의 유저 상태를 감시, 로그인/로그아웃 시 `gameStore.setUid(uid)` 호출하여 게임 데이터 자동 동기화
  3. **App.jsx에 useGameSync 연결** — 앱 최상위에서 유저-게임 데이터 동기화 실행
  4. **GameLibrary.jsx 로딩 상태 추가** — 데이터 로드 완료 전 로딩 스피너 표시
  5. `structure.md`, `project_prompt_log.md` 업데이트
- **소요 시간**: 약 3분 (15:50 ~ 15:53)

---

## #11
- **시간**: 2026-03-30 16:00
- **프롬프트**:
  > 데모 데이터로 되어있는부분 실제 데이터로 바꿔줘
- **수행 내용**:
  1. **useRealMetrics.js 훅 생성** — gameStore의 실제 게임 데이터로부터 모든 지표를 계산:
     - 통계 카드: 총 게임 수, GO 판정률, 평균 점수, 항목별 평균, 최다 장르
     - DAU 차트 → 일별 게임 생성 수 (최근 7일)
     - 세션 차트 → 일별 생성 현황 + 평균 점수
     - 게임 점수 비교 → 게임별 4개 항목(게임플레이/비주얼/리플레이/시장적합) 비교
     - 장르 레이더 → 장르별 평균 점수 레이더 차트 + 강점/약점 분석
  2. **차트 4종 DEMO_DATA 제거** — DauChart, SessionChart, RetentionChart, GenreComparisonChart에서 하드코딩된 데모 데이터 삭제. 데이터가 없으면 빈 상태 메시지 표시
  3. **Dashboard.jsx 실제 데이터 연결** — "데모 데이터" 라벨 제거, useRealMetrics 연결, 차트 제목을 실제 의미("일별 게임 생성 수")로 변경, 게임 목록에 평균 점수 표시
  4. **Reports.jsx 전면 개편**:
     - 하드코딩된 metricCards 제거 → 실제 계산된 statCards 사용
     - "리텐션 분석" 탭 → "게임별 점수" 탭으로 변경 (실제 게임 평가 점수 비교 + 카드형 상세 점수)
     - "장르별 비교" 탭 → 실제 장르별 평균 점수 레이더 + 동적 강점/약점 요약
     - 데이터 없을 시 안내 메시지 + 파이프라인 링크 표시
     - "현재 표시된 데이터는 데모 데이터입니다" 문구 완전 제거
  5. `structure.md`, `project_prompt_log.md` 업데이트
- **소요 시간**: 약 5분 (16:00 ~ 16:05)

---

## #12
- **시간**: 2026-03-30 16:15
- **프롬프트**:
  > 게임별로 전세계 유저들이 HTML링크에서 한 플레이 정보를 실시간으로 받아서 게임별 유저 지표를 표시하도록 해줘
- **수행 내용**:
  1. **dev-server.js 대폭 확장** — 유저 플레이 추적 시스템 구축:
     - `POST /api/games`: 게임 HTML을 서버에 등록
     - `GET /play/:gameId`: 트래킹 스크립트가 주입된 게임 HTML 서빙 (공유 가능한 외부 링크)
     - `POST /api/play-events`: 유저 플레이 이벤트 수집 (session_start/heartbeat/pause/resume/session_end/game_event)
     - `GET /api/game-stats`: 전체 게임 통합 통계
     - `GET /api/game-stats/:gameId`: 게임별 상세 통계
     - `GET /api/play-stream`: SSE(Server-Sent Events) 실시간 이벤트 스트림
  2. **트래킹 스크립트 자동 주입** — 게임 HTML `</body>` 앞에 경량 트래킹 JS 삽입:
     - 익명 방문자 ID 자동 생성 (localStorage 기반)
     - 세션 시작/종료 자동 감지
     - 15초 간격 heartbeat (활성 세션 판별)
     - 탭 전환 감지 (pause/resume)
     - `navigator.sendBeacon` 사용 (페이지 종료 시에도 데이터 전송 보장)
     - `window._mvpTrack(name, data)` 글로벌 함수 (게임 코드에서 커스텀 이벤트 전송 가능)
  3. **gameStore.js 서버 동기화** — `addGame` + `setUid` 로드 시 모든 게임을 자동으로 dev-server에 등록 (`POST /api/games`)
  4. **usePlayMetrics.js 훅 생성** — SSE 실시간 연결 + 30초 폴링 fallback. 게임별 stats/공유 URL 조회 기능
  5. **Dashboard.jsx 실시간 유저 지표** — 상단 통계: 전체 플레이어/세션/플레이시간. 실시간 연결 상태 표시. 게임별 방문자/세션/평균시간/현재접속 + 공유 링크
  6. **GameLibrary.jsx 유저 지표 탭 추가** — 4번째 "유저 지표" 탭:
     - Quick Stats (방문자/세션/평균플레이/현재접속)
     - 일별 유저 추이 막대 그래프
     - 공유 링크 (복사 버튼)
     - 각 카드 헤더에 실시간 접속자 수 표시
  7. **Reports.jsx "유저 분석" 탭 추가** — 전체 고유 방문자/세션/플레이시간/등록게임 통계 카드 + 게임별 유저 지표 테이블 (방문자/세션/평균플레이/현재접속)
  8. `structure.md`, `project_prompt_log.md` 업데이트
- **소요 시간**: 약 8분 (16:15 ~ 16:23)

---

## #13
- **시간**: 2026-03-30 16:45
- **프롬프트**:
  > 공유링크 접속하면 Cannot GET 에러 / 접속자 수가 0으로 나옴
- **수행 내용**:
  1. **sendBeacon text/plain 파싱 수정** — `express.text()` 미들웨어 추가. 트래킹 스크립트가 `navigator.sendBeacon`으로 보내는 `text/plain` body를 서버가 파싱하지 못하던 버그 수정
  2. **서버 게임 데이터 파일 영속화** — `data/games.json`, `data/events.json`에 게임/이벤트 저장. 서버 재시작 시 자동 복원 (`Loaded 2 games from disk`)
  3. **서버 에러 핸들링 강화** — `server.on('error')`, `uncaughtException`, `unhandledRejection` 핸들러 추가
  4. **프론트엔드 무한 반복 등록 수정** — `usePlayMetrics` 훅에서 SSE reconnect마다 게임을 중복 등록하던 문제 해결 (syncedRef + Zustand subscribe 패턴)
  5. `.gitignore`에 `data/` 추가
- **소요 시간**: 약 5분 (16:45 ~ 16:50)

---

## #14
- **시간**: 2026-04-01
- **프롬프트**:
  > http://localhost:3000 여기 들어가면 이미지처럼 뜨는데 뭐해야해?
- **수행 내용**: 개발 서버가 실행되지 않고 있음을 확인. `npm run dev` 명령으로 Vite(:3000) + Express(:3100) 동시 시작 및 정상 기동 확인
- **소요 시간**: 약 1분

---

## #15
- **시간**: 2026-04-01
- **프롬프트**:
  > 저 사이트 들어갈때 서버 키는법 내가 직접하는 절차를 알려줘
- **수행 내용**: 개발 서버 수동 시작 절차 안내 (터미널 열기 → 경로 확인 → `npm run dev` → 접속 확인 → 종료)
- **소요 시간**: 약 1분

---

## #16
- **시간**: 2026-04-01
- **프롬프트**:
  > 첨부한 이미지의 공고(AI 연구 및 서비스 개발 AI에이전트/HCI)에 지원할때 이 프로젝트를 포트폴리오로 내려고 하는데 이 프로젝트 기반으로 포트폴리오 만들수있게 내용 정리해서 md 파일로 줘
- **수행 내용**:
  1. `docs/portfolio.md` 생성 — 프로젝트 개요, 아키텍처, 기술 스택, 핵심 기능 5가지, 기술적 도전·해결 4가지, 공고 요구사항 매핑표 포함
  2. `structure.md`에 `portfolio.md` 항목 추가
- **소요 시간**: 약 3분

---

## #17
- **시간**: 2026-04-01
- **프롬프트**:
  > PlanAgent에서 createPlan할때 "모든 게임 요소에 구체적인 수치를 포함해서 작성해. 개발자가 수치 판단을 하지 않아도 되도록." 지시가 항상 반영되도록 기획 에이전트가 보는 md 파일에 반영해줘
- **수행 내용**:
  1. `server/dev-server.js`의 `/api/generate-plan` 엔드포인트 프롬프트 수정:
     - 시스템 프롬프트에 "모든 게임 요소에 구체적 수치 필수" 핵심 원칙 추가 (HP, 속도, 쿨다운, 확률, px 단위 등)
     - JSON 스키마에 `balance` 필드 추가 (player 스탯, canvas 크기, 점수 테이블, 난이도 스케일링 배열)
     - `enemies`/`items` 배열을 문자열 → 오브젝트(수치 포함)로 변경
     - max_tokens 2048 → 4096 확대 (수치 상세 기술을 위한 여유)
  2. 서버 재시작하여 변경사항 적용
- **소요 시간**: 약 2분

---

## #18
- **시간**: 2026-04-01
- **프롬프트**:
  > @src/agents/ 이 하위에 있는 Agent 들이 각각 실행될때 각각 참고할 md 파일 agent 별로 만들어서 항상 md파일 참고해서 실행하도록 해줘
- **수행 내용**:
  1. **Agent별 지시 MD 파일 4개 생성** (`src/agents/prompts/`):
     - `trend-agent.md` — 분석 기준(대중 관심도/게임화 적합성/시의성), 출력 JSON 스키마
     - `plan-agent.md` — 구체적 수치 필수 원칙, 밸런스/적/아이템 오브젝트 스키마
     - `dev-agent.md` — 기술 규칙 8가지, 기획서 수치 반영 원칙, 코드 품질 기준
     - `judge-agent.md` — 4개 평가 항목 상세 기준, Go/No-Go 판정 기준, 평가 원칙 5가지
  2. **dev-server.js 수정** — `loadPrompt()` 함수 추가. 4개 API 엔드포인트가 매 요청마다 해당 MD 파일을 읽어 system prompt로 사용하도록 변경 (MD 파일 수정 시 서버 재시작 없이 즉시 반영)
  3. `structure.md`에 `prompts/` 폴더 및 4개 파일 추가
  4. 서버 재시작하여 정상 동작 확인
- **소요 시간**: 약 4분

---

## #19
- **시간**: 2026-04-01
- **프롬프트**:
  > 파이프라인 시작 버튼 누르니까 "Objects are not valid as a React child (found: object with keys {name, effect, dropChance, duration})" 에러 발생
- **수행 내용**:
  1. **원인**: plan-agent.md에서 enemies/items를 오브젝트 배열로 변경했으나, UI 컴포넌트에서 문자열로 직접 렌더링하고 있었음
  2. **AgentPipeline.jsx** — enemies/items 렌더링 시 `typeof === 'object'` 분기 추가 (오브젝트면 `.name`, 문자열이면 그대로)
  3. **GameLibrary.jsx** — 동일 수정
  4. **download.js** — MD 다운로드 시 오브젝트면 수치 포함 상세 포맷, 문자열이면 기존 방식 유지
- **소요 시간**: 약 2분

---

## #20
- **시간**: 2026-04-01
- **프롬프트**:
  > 지금 이 프로젝트 진행된 스펙과 기술스택 등을 발표해야해서 내용좀 정리해서 md 파일로 저장해줘
- **수행 내용**:
  1. `docs/presentation.md` 생성 — 발표용 프로젝트 정리 문서:
     - 프로젝트 개요 및 기존 방식 대비 속도 비교표
     - 기술 스택 전체 (Frontend/Backend/DB/실시간 통신)
     - 시스템 아키텍처 다이어그램 (텍스트)
     - 주요 기능 5가지 상세 설명
     - 파일 구조 요약
     - 개발 이력 타임라인
     - 기술적 의사결정 포인트 4개 (멀티 에이전트/MD 분리/SSE/sendBeacon)
     - 실행 방법
  2. `structure.md`에 `presentation.md` 항목 추가
- **소요 시간**: 약 3분

---

## #21
- **시간**: 2026-04-01
- **프롬프트**:
  > 지금 생성된 게임들 들어가서 해보면 start button 눌러도 아무 반응이 없어 해결해줘
- **수행 내용**:
  1. **원인 진단**: 일부 게임 HTML 코드가 ` ```html ` 마크다운 래퍼로 시작하여 브라우저가 HTML을 제대로 파싱하지 못함
  2. **`extractHTML()` 함수 강화** (`dev-server.js`) — 기존 단순 regex 대신 다단계 정리 로직 (```html 시작/끝 제거, <!DOCTYPE 매칭 등)
  3. **기존 게임 데이터 일괄 수정** — `data/games.json`에서 3개 게임(팰 서바이벌, Zombie Nightfall Defense, Zombie Horde Survival)의 코드에서 마크다운 래퍼 제거
  4. 서버 재시작하여 수정 반영
- **소요 시간**: 약 3분

---

## #22
- **시간**: 2026-04-01
- **프롬프트**:
  > 여전히 첫 화면에서 startbutton 클릭해도 반응이 없어 고쳐줘
- **수행 내용**:
  1. **원인 재확인**: 이전 수정이 실제 파일에 반영되지 않음. 3개 게임이 여전히 ` ```html `로 시작하고 일부는 코드가 잘려있었음 (max_tokens 부족)
  2. **`stripMarkdownWrapper()` 함수 추가** — regex 기반 마크다운 래퍼 제거
  3. **`ensureValidHTML()` 함수 추가** — 잘린 코드에 `</script>`, `</body>`, `</html>` 자동 보완
  4. **서버 시작 시 자동 정리** — `gamesStore` 로드 직후 모든 게임 코드를 검사하여 ` ``` ` 래퍼 자동 제거 + `saveGames()`로 영구 반영
  5. **`/play/:gameId` 서빙 시 `ensureValidHTML` 적용** — 런타임에서도 항상 정리된 HTML 서빙
  6. **`POST /api/games` 등록 시에도 `ensureValidHTML` 적용** — 앞으로 저장되는 게임도 자동 정리
  7. 서버 재시작 후 `Sanitized 3 game(s)` 확인, 전체 7개 게임 모두 `<!DOCTYPE html>` 시작 + `</html>` 종료 검증 완료
- **소요 시간**: 약 3분

---

## #23
- **시간**: 2026-04-01
- **프롬프트**:
  > 여전히 start button 클릭해도 반응이 없어 그리고 판단 Agent 쪽 메세지에 기획서의 기능이 구현이 안된 것도 있다는데 기획서에 있는 모든 내용은 반드시 구현되어야해
- **수행 내용**:
  1. **근본 원인 진단**: max_tokens(8192) 부족으로 게임 코드가 잘려서 Start 버튼 이벤트 핸들러/게임 루프 호출 코드가 누락됨. 또한 HTML DOM 기반 UI가 복잡하여 코드량이 과다해짐
  2. **dev-server.js** — `max_tokens` 8192 → **16384**로 증가
  3. **dev-agent.md 전면 개편**:
     - ★ 최우선 원칙 "코드 완결성" 추가: 15,000자 제한, Canvas에 모든 UI 직접 그리기 (HTML div/button 사용 금지)
     - 게임 상태 머신 필수 구현: `menu → playing → gameover` (모두 Canvas ctx 위에 렌더링)
     - 코드 작성 순서 명시: 변수 → 유틸 → 로직 → 렌더링 → 입력 → 루프 → 초기화
     - "기획서 전항목 구현 원칙" 섹션 추가: mechanics[], enemies[], items[] 전체 구현 필수
     - 코드 간결화 팁 추가 (효과음 생략, 파티클 최소화 등)
  4. **plan-agent.md 범위 조정**:
     - "구현 가능한 범위로 설계" 원칙 추가: 적 2~3종, 아이템 2~3종, 웨이브 3~5개, 메카닉 3가지
     - 금지 항목 명시: 복잡한 맵, 인벤토리 UI, NPC 대화, 외부 리소스, 멀티플레이어
     - enemies/items에 color, radius 렌더링 정보 포함하도록 스키마 확장
  5. 서버 재시작
- **소요 시간**: 약 5분

---

## #24
- **시간**: 2026-04-01
- **프롬프트**:
  > 포트 3000번이랑 3001번이 각각 다른 게임이 뜨고있고 강제로 재시작하면 3000번으로 들어가지는데 포트를 하나로 통일해줘
- **수행 내용**:
  1. **원인**: 이전 서버 프로세스가 완전히 종료되지 않아 포트 3000을 점유 → Vite가 자동으로 3001로 올림 → 3000(구 서버)과 3001(신 서버) 두 개가 동시에 실행됨
  2. **`vite.config.js` 수정** — `strictPort: true` 추가. 포트가 사용 중이면 다른 포트로 올라가지 않고 에러로 종료 → 중복 실행 원천 방지
  3. 기존 3000/3001/3100 포트의 모든 프로세스 종료 후 깨끗하게 재시작
- **소요 시간**: 약 2분

---

## #25
- **시간**: 2026-04-05 14:22
- **프롬프트**:
  > plan-agent.md 내용을 변경했는데 기획서 내용대로 dev-agent가 구현을 다 못하고 있다는 로그가 있어 해결해줘 모든 내용 다 구현할 수 있도록
- **수행 내용**:
  1. **근본 원인**: `plan-agent.md`의 JSON 스키마가 전면 변경됨 (`mechanics→keyMechanics`, `enemies→enemyList`, `items→itemList`, `stages→stageCount`, `colorScheme→colorPalette`, `balance→playerStats/enemyTypes/skills/waveSystem` 등) → DevAgent·서버·UI가 옛 필드를 참조하여 기획서 내용을 인식하지 못함
  2. **dev-agent.md 전면 개편** — 새 스키마 필드명 매핑 테이블 작성 (playerStats, enemyTypes[], skills[], waveSystem, colorPalette, upgradeList[], bossDesign 등)
  3. **dev-server.js `/api/generate-game`** — planSummary 필드별 조립 → `JSON.stringify(plan)` 전체 전달로 변경
  4. **dev-server.js `/api/generate-plan`** — max_tokens 4096→8192
  5. **dev-server.js `/api/evaluate-game`** — systemDesign만 전달 → plan 전체 전달 + max_tokens 1024→2048
  6. **PlanAgent.js** — `data.systemDesign.title` → `data.gameTitle || data.systemDesign?.title` 호환
  7. **AgentPipeline.jsx / GameLibrary.jsx** — 새 필드명 호환 레이어 추가
  8. **download.js** — planResultToMarkdown 함수에 새 필드 전부 반영
- **소요 시간**: 약 5분

---

## #26
- **시간**: 2026-04-05 14:36
- **프롬프트**:
  > 파이프라인을 시작해서 게임이 생성되었는데 판단 Agent에 구현 코드가 없어서 판단할 수 없다는 로그가 있어 게임은 잘 되긴해 해결해줘
- **수행 내용**:
  1. **근본 원인**: JudgeAgent가 기획서(plan JSON)만 Claude에게 전달하고 실제 생성된 게임 코드(HTML)를 전달하지 않음 → Claude가 "구현 코드가 없어 평가 불가" 판정
  2. **JudgeAgent.js** — `devResult.code`를 요청 body에 추가
  3. **dev-server.js `/api/evaluate-game`** — `code`를 수신하여 Claude 프롬프트에 `## 실제 구현 코드 (HTML)` 섹션으로 포함 (최대 12,000자)
  4. **judge-agent.md** — "코드 분석 필수" 원칙 추가, 기획서 대비 코드 구현 충실도·수치 반영·상태 머신·버그 리스크 등 코드 기반 평가 지시 강화
- **소요 시간**: 약 3분

---

## #27
- **시간**: 2026-04-05 15:02
- **프롬프트**:
  > stable diffusion으로 필요한 리소스를 제작하는 Agent 추가해줘. plan-agent가 리소스 제작 요청서도 작성하도록 만들어줘. 리소스 제작 agent가 필요한 리소스를 제작하면 dev-agent가 기획서들과 제작된 리소스를 이용해서 게임을 제작하게 수정해줘. 각 리소스는 게임별로 저장되게 해줘
- **수행 내용**:
  1. **ResourceAgent 신규 생성** (`src/agents/ResourceAgent.js`) — Stable Diffusion API(Stability AI SD3)를 호출하여 게임 에셋을 생성하는 Agent. API 키가 없으면 SVG placeholder 자동 생성
  2. **resource-agent.md 신규 생성** (`src/agents/prompts/resource-agent.md`) — ResourceAgent 동작 규칙, API 설정, 저장 경로 문서
  3. **plan-agent.md 확장** — Step 3 "리소스 제작 요청서 가이드" 섹션 추가. `resourceRequest[]` 배열을 JSON 출력 스키마에 포함 (id, category, prompt, aspectRatio). 카테고리별 가이드, SD 프롬프트 작성 예시 포함
  4. **dev-server.js 대규모 변경**:
     - `RESOURCES_DIR` 상수 + `/resources` 정적 서빙 추가
     - `POST /api/generate-resources` 엔드포인트 — 각 리소스마다 Stability AI API 호출 또는 placeholder SVG 생성, `data/resources/{gameId}/` 디렉토리에 게임별 저장
     - `generateStableImage()` — SD3 API 호출 헬퍼
     - `buildPlaceholderSVG()` — 카테고리별 색상 SVG 생성
     - `/api/generate-game` — `gameId`, `resources` 수신, 리소스 URL 목록을 Claude 프롬프트에 포함
     - `/play/:gameId` — `window.GAME_RESOURCES` 매니페스트를 HTML에 자동 주입
     - 서버 시작 시 Stability AI 연결 상태 표시
  5. **OrchestratorAgent.js** — 5단계 파이프라인으로 확장: Trend → Plan → **Resource** → Dev → Judge
  6. **agentStore.js** — `resource` agent 상태 추가
  7. **DevAgent.js** — `develop(planData, resourceResult)` 시그니처 변경, gameId/resources를 서버에 전달
  8. **dev-agent.md** — 리소스 활용 규칙 섹션 추가 (프리로드 패턴, drawImage 렌더링, 폴백 처리)
  9. **useAgentPipeline.js** — game 저장 시 `resources` 필드 포함
  10. **AgentPipeline.jsx** — 리소스 Agent 패널 추가 (에셋 그리드 미리보기, SD/placeholder 상태 표시)
  11. **structure.md** — ResourceAgent.js, resource-agent.md 항목 추가
- **소요 시간**: 약 10분

---

## #28
- **시간**: 2026-04-05 15:20
- **프롬프트**:
  > 리소스 제작할때 그냥 색상 있는 사각형들로만 만들어진것같은데 이렇게 단순하게 말고 게임 장르에 맞게 귀엽거나 무섭거나 이런 리소스를 제작하도록 해줘
- **수행 내용**:
  1. **Claude AI SVG 아트 생성 추가** — Stability AI 키가 없을 때 기존 단순 placeholder 대신 Claude API로 게임 장르·테마에 맞는 실제 SVG 게임 아트를 자동 생성하도록 변경
  2. **dev-server.js `generateSVGWithClaude()` 함수** — 카테고리별 전문 가이드 적용 (character: 표정 있는 캐릭터, boss: 위압감 있는 보스, background: 깊이감 있는 배경, item: 빛나는 아이콘 등). 게임 제목·장르·테마·색상 팔레트를 컨텍스트로 전달
  3. **리소스 생성 우선순위**: Stability AI SD3 → Claude AI SVG 아트 → 단순 placeholder (3단계 폴백)
  4. **ResourceAgent.js** — plan의 컨텍스트(genre, theme, colorPalette, gameTitle)를 서버에 함께 전달
  5. **AgentPipeline.jsx** — 상태 표시 개선 (SD/AI아트/placeholder 3종류 구분)
- **소요 시간**: 약 5분

---

## #29
- **시간**: 2026-04-05 15:35
- **프롬프트**:
  > 완성된 게임에 제작된 리소스가 하나도 표시가 안되는데? 제작된 리소스 사용하도록 해줘
- **수행 내용**:
  1. **근본 원인**: DevAgent가 생성한 게임 코드가 리소스 이미지를 실제로 사용하지 않고, 단순 fillRect/arc로 도형만 그림
  2. **서버 사이드 자동 주입** (`/play/:gameId`) — `drawSprite(id, ctx, x, y, w, h, fallbackColor)` 헬퍼 함수 + `window.GAME_IMAGES` 이미지 프리로더를 게임 HTML에 자동 주입. LLM이 코드를 잘못 생성해도 함수 자체는 항상 존재
  3. **DevAgent 프롬프트 강화** (`/api/generate-game`) — 리소스 목록을 프롬프트 상단에 ★★★ 필수로 배치. 각 리소스 ID별 `drawSprite()` 호출 예시를 구체적으로 제공. `ctx.fillRect()`/`ctx.arc()`로 캐릭터/적/배경을 그리는 것을 명시적으로 금지
  4. **dev-agent.md 간소화** — 불필요한 프리로드 코드 제거 (서버가 자동 주입하므로). `drawSprite()` 사용법만 명확하게 정리. 적용 대상별 예시 코드 + 엄격한 금지 규칙 추가
- **소요 시간**: 약 5분

---

## #17
- **시간**: 2026-04-05 15:38
- **프롬프트**:
  > 리소스 제작이 된건 확인했는데 실제 게임에 저렇게 하늘색 화면만 나오고 아무것도 렌더링이 안되고 있어. 그리고 판단 Agent 내용에 구현이 안된 코드가 있다는 로그도 있어 개발 Agent에서 기획서의 내용을 반드시 모두 구현 완료되게 수정해줘
- **수행 내용**:
  1. **근본 원인 3가지 파악**: (1) drawSprite가 리소스 있을 때만 주입되어 리소스 누락 시 게임 크래시, (2) 리소스 지시가 너무 과도하여 Claude가 게임 로직보다 이미지 사용에 집중 → 미완성 게임, (3) JudgeAgent가 drawSprite를 undefined로 오판
  2. **dev-server.js** — drawSprite를 리소스 유무와 관계없이 항상 주입. 주입 위치도 `</head>`/`<body>` 등 폴백 포인트 추가. `window.onerror` 핸들러 추가. 게임 생성 프롬프트 구조 개선: 기획서 JSON 먼저 배치, 리소스 정보 간소화
  3. **dev-agent.md 전면 개선** — "외부 리소스 금지" 모순 삭제. drawSprite 안전 스텁(`typeof drawSprite === 'undefined'` 체크) 추가. 게임 상태 머신(menu→playing→gameover) 구체적 코드 예시 추가. 게임 동작 최우선 원칙 강조
  4. **judge-agent.md** — "drawSprite는 런타임 자동 주입" 안내 추가, drawSprite 미정의를 감점 대상에서 제외
  5. JudgeAgent 코드 스니펫 길이 12000→20000자로 확대
- **소요 시간**: 2026-04-05 15:38 ~ 15:44 (약 6분)

---

## #18
- **시간**: 2026-04-05 15:50
- **프롬프트**:
  > 방금 파이프라인 실행해서 게임 완성되었는데 제작된 리소스가 게임 화면에 하나도 없어 제작된 리소스를 사용해서 게임화면에 렌더링하도록 해줘
- **수행 내용**:
  1. **근본 원인 발견**: `GamePlayer.jsx`가 게임 코드를 Blob URL로 렌더링하고 있어, 서버의 drawSprite 주입(`/play/:gameId`)이 전혀 적용되지 않았음. Blob 컨텍스트에서 `/resources/...` 경로도 해석 불가
  2. **확인한 사실**: 게임 코드에는 drawSprite 호출이 7회 있고, SVG 리소스 파일 8개가 서버에 정상 존재하며 서빙도 가능. 문제는 순전히 Blob URL 렌더링 방식
  3. **GamePlayer.jsx 수정** — Blob URL 대신 서버의 `/play/:gameId` URL을 iframe src로 직접 사용하도록 변경. 서버가 drawSprite 부트스트랩 + 이미지 프리로더 + 트래킹 스크립트를 자동 주입
- **소요 시간**: 2026-04-05 15:50 ~ 15:57 (약 7분)

---

## #19
- **시간**: 2026-04-05 16:00
- **프롬프트**:
  > @src/agents/ 이 에이전트들을 단계별로 각각 실행할 수 있게 수정해줘. 예를 들어 기획 Agent만 실행할 수 있도록 해줘 그리고 각 Agent별 결과물은 저장해놨다가 다음 단계 Agent 실행할때 사용할 수 있게 해주고
- **수행 내용**:
  1. **agentStore.js** — `resetAgent(agentType)` 개별 리셋 함수, `runningStep` 상태 추가
  2. **useAgentPipeline.js** — 개별 실행 `runStep(stepKey)`, 이후 전체 실행 `runFrom(stepKey)` 함수 추가. 의존성 검증 (`STEP_DEPS`: trend→plan→resource→dev→judge). 결과물은 agentStore에 저장되어 다음 단계에서 자동 사용
  3. **AgentPipeline.jsx** — 각 Agent 카드에 `▶ 실행` / `재실행` 버튼 + `⏩ 이후 전체` 버튼 추가. 선행 단계 미완료 시 의존성 안내 텍스트 표시. 기존 `전체 파이프라인 시작` 버튼도 유지
- **소요 시간**: 2026-04-05 16:00 ~ 16:12 (약 12분)

---

## #20
- **시간**: 2026-04-05 16:18
- **프롬프트**:
  > stable diffusion api 요금이 전혀 소모되지 않고 있는데 리소스 제작하는거 무조건 stable diffusion 으로 제작하게 해줘. SD 스프라이트 연결, 도형 기반 그래픽 문제, 배경 단색 문제, 캐릭터 원시적 도형 문제, UI 폰트 기본 시스템 폰트 문제 해결
- **수행 내용**:
  1. **근본 원인**: `dotenv/config`가 `.env` 파일만 로드하고 `.env.local`을 무시 → `STABILITY_API_KEY`가 서버에 전달되지 않아 SD API가 호출되지 않음. 서버 로그에도 `Stability AI: ⚠ No key` 표시
  2. **`.env.local` 로딩 수정** — `import 'dotenv/config'`를 `dotenv.config({ path: '.env' }) + dotenv.config({ path: '.env.local', override: true })`로 변경. 이제 서버 로그에 `Stability AI: ✓ Connected` 표시
  3. **SD 프롬프트 품질 강화** — `enhancePrompt()` 함수 추가: 카테고리별(character, boss, background, item, effect) 스타일 수식어를 프롬프트 뒤에 자동 추가. negative_prompt도 추가
  4. **게임 HTML 웹폰트 주입** — 게임 서빙 시 Google Fonts의 `Noto Sans KR` 자동 주입. `window.GAME_FONT` 전역 변수로 접근 가능
  5. **drawSprite 개선** — PNG 이미지 로딩 안정성 향상 (crossOrigin 속성 제거로 same-origin 충돌 방지). 로드 진행률 추적(`window.spritesReady()`)
  6. **dev-agent.md** — `window.GAME_FONT` 사용 지시 추가, 모든 `ctx.font`에 웹폰트 적용 안내
- **소요 시간**: 2026-04-05 16:18 ~ 16:31 (약 13분)

