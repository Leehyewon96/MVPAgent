

> LLM 기반 멀티 에이전트 시스템  
> 게임 트렌드 분석 → 기획서 자동 작성 → 게임 자동 구현 → 실시간 유저 지표 수집

---

## 1. 프로젝트 개요

### 한 줄 정의
> **"버튼 하나로 트렌드를 분석하고, 기획서를 쓰고, 게임을 만들고, 전 세계 유저 플레이 데이터를 실시간으로 수집하는 Agentic AI 서비스"**

### 배경 및 목적

기존 게임 개발 프로세스는 시장조사 → 기획 → 구현 → 출시 → 데이터 수집까지 수일~수주가 소요됩니다.  
MVP Agent는 이 전 과정을 **4개의 LLM Agent가 연쇄적으로 실행되는 파이프라인**으로 자동화합니다.

| 기존 방식 | MVP Agent |
|-----------|-----------|
| 트렌드 조사: 수시간 (수작업) | 트렌드 분석: **~30초** (TrendAgent) |
| 기획서 작성: 수일 | 기획서 생성: **~1분** (PlanAgent) |
| 프로토타입 구현: 수주 | 게임 코드 생성: **~2분** (DevAgent) |
| 품질 판단: 주관적 | Go/No-Go 평가: **~30초** (JudgeAgent) |
| 분석 인프라 구축 필요 | 실시간 유저 추적: **자동 주입** |

### 개발 기간

- 최초 세팅 ~ 전체 기능 완성: **약 2일** (2026-03-30 ~ 2026-04-01)
- AI 에이전트(Cursor) 보조 개발 방식 적용

---

## 2. 기술 스택

### Frontend

| 기술 | 버전 | 역할 |
|------|------|------|
| React | 18.x | 컴포넌트 기반 UI |
| Vite | 5.x | 빌드 도구 (HMR, 포트 3000) |
| Tailwind CSS | 3.x | 유틸리티 기반 스타일링 (커스텀 dark/primary 컬러) |
| Zustand | 4.x | 전역 상태 관리 (authStore / gameStore / agentStore) |
| React Query | 5.x | 서버 상태 캐싱 및 Firestore 데이터 페칭 |
| Framer Motion | 11.x | 파이프라인 진행 상태 애니메이션 |
| React Router | 6.x | SPA 클라이언트 라우팅 |
| Recharts | 2.x | 차트 시각화 (영역/바/라인/레이더) |

### Backend / 인프라

| 기술 | 역할 |
|------|------|
| Express.js | 로컬 API 서버 + 실시간 플레이 추적 서버 (포트 3100) |
| Anthropic Claude API | LLM 호출 (claude-sonnet, max 8192 tokens) |
| Firebase Authentication | Google 소셜 로그인, 세션 관리 |
| Firebase Cloud Functions | 서버 사이드 로직 (트렌드 분석, 게임 엔진, 지표 수집) |
| Vercel | 프론트엔드 배포 (GitHub push 자동 배포, SPA rewrite) |

### Database

| 기술 | 역할 |
|------|------|
| Firestore | 유저·게임·에이전트 로그 영속화 (`users/{uid}/games`) |
| Firebase Realtime DB | 실시간 데이터 (지표 업데이트, 랭킹) |
| 파일 기반 스토어 | `data/games.json`, `data/events.json` — 서버 재시작 시 자동 복원 |

### 실시간 통신

| 기술 | 역할 |
|------|------|
| SSE (Server-Sent Events) | 서버 → 클라이언트 실시간 이벤트 스트림 (`/api/play-stream`) |
| navigator.sendBeacon | 게임 종료 시에도 플레이 이벤트 전송 보장 |

---

## 3. 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                      Agent Pipeline                             │
│                                                                 │
│  OrchestratorAgent                                              │
│    │                                                            │
│    ├─ Phase 1: TrendAgent  ──── trend-agent.md ──► Claude API  │
│    │           ↓ (트렌드 3개 + 스코어)                           │
│    ├─ Phase 2: PlanAgent   ──── plan-agent.md  ──► Claude API  │
│    │           ↓ (시스템/콘텐츠 기획서 + 밸런스 수치)            │
│    ├─ Phase 3: DevAgent    ──── dev-agent.md   ──► Claude API  │
│    │           ↓ (HTML5 Canvas 게임 단일 파일)                   │
│    └─ Phase 4: JudgeAgent  ──── judge-agent.md ──► Claude API  │
│                ↓ (4개 항목 점수 + Go/No-Go 판정)                │
└─────────────────────────────────────────────────────────────────┘
                 │                          │
                 ▼                          ▼
   ┌─────────────────────┐    ┌───────────────────────────┐
   │   React Frontend    │    │     Express Dev Server     │
   │   (Vite, :3000)     │    │     (:3100)                │
   │                     │    │                            │
   │  - Dashboard        │◄───┤  GET  /play/:gameId        │
   │  - AgentPipeline    │    │  POST /api/games           │
   │  - GameLibrary      │SSE │  POST /api/play-events     │
   │  - Reports          │◄───┤  GET  /api/play-stream     │
   └─────────────────────┘    │  GET  /api/game-stats      │
                 │            └───────────────────────────┘
                 ▼
   ┌─────────────────────┐
   │      Firebase       │
   │  - Auth (Google)    │
   │  - Firestore DB     │
   │  - Realtime DB      │
   └─────────────────────┘
```

---

## 4. 주요 기능

### 4-1. 멀티 에이전트 파이프라인

버튼 하나로 4개 Agent가 순차 실행되며, 각 Agent의 출력이 다음 Agent의 입력으로 자동 전달됩니다.

```
[TrendAgent]  → 현재 핫한 게임 트렌드 3개 분석, 스코어 산출
      ↓
[PlanAgent]   → 최고 스코어 트렌드 기반 기획서 자동 작성
               (시스템 기획서: HP/속도/쿨다운 등 구체적 수치 포함)
               (콘텐츠 기획서: 적/아이템/색상 팔레트 포함)
      ↓
[DevAgent]    → 기획서 수치를 그대로 반영한 HTML5 게임 코드 생성
               (단일 HTML 파일, Canvas 800×600, 순수 JS)
      ↓
[JudgeAgent]  → 게임플레이/비주얼/리플레이/시장적합 4개 항목 점수 평가
               + Go/No-Go 판정 + 구체적 개선 제안
```

**Agent별 지시 파일 분리** (`src/agents/prompts/*.md`)
- 각 Agent는 자신의 MD 파일을 System Prompt로 사용
- MD 파일만 수정하면 서버 재시작 없이 다음 실행부터 즉시 반영

---

### 4-2. 실시간 유저 플레이 추적 시스템

생성된 게임 HTML에 **경량 트래킹 스크립트를 자동 주입**하여 공유 링크로 서빙합니다.

**수집 이벤트:**

| 이벤트 | 수집 시점 |
|--------|-----------|
| `session_start` | 게임 링크 접속 시 |
| `heartbeat` | 15초 간격 (활성 세션 판별) |
| `pause` / `resume` | 탭 전환 감지 |
| `session_end` | 페이지 종료 (`sendBeacon` 사용) |
| `game_event` | 게임 코드 내 커스텀 이벤트 (`window._mvpTrack()`) |

**실시간 전달 흐름:**
```
유저 플레이 → sendBeacon → Express 서버 → SSE 스트림
                                              ↓
                              React 대시보드 실시간 반영
```

---

### 4-3. 개발자 대시보드 & 분석 리포트

**Dashboard (메인)**
- 전체 게임 수, GO 판정률, 평균 점수 통계 카드
- 실시간 플레이어 수 / 세션 수 / 현재 접속자
- 게임별 공유 링크 + 실시간 접속자 뱃지

**Reports (분석)**

| 탭 | 내용 |
|----|------|
| 개요 | 통계 카드 (생성 수, 평균 점수, GO 판정률) |
| 게임별 점수 | 4개 항목 점수 비교 프로그레스 바 |
| 장르별 비교 | 장르별 평균 점수 레이더 차트 + 강점/약점 |
| 유저 분석 | 전체 방문자/세션/플레이시간 + 게임별 유저 테이블 |

모든 데이터는 실제 파이프라인 실행 결과 기반 (하드코딩 데모 없음)

---

### 4-4. 게임 라이브러리

파이프라인에서 생성된 게임 목록을 카드 형태로 관리합니다.

각 게임 카드 4개 탭:
- **주제** — 트렌드 키워드, 출처, 스코어 바, 게임 아이디어
- **기획서** — 시스템/콘텐츠 기획서 전체 + MD/JSON 다운로드
- **게임** — 빌드 정보, 점수, 게임 플레이 링크 + HTML 다운로드
- **유저 지표** — 방문자 수, 세션 수, 평균 플레이 시간, 일별 추이 그래프

---

### 4-5. 데이터 영속화

| 환경 | 저장 방식 |
|------|-----------|
| Firebase 연결 시 | Firestore `users/{uid}/games` 컬렉션 |
| Dev Mode (Firebase 미연결) | `localStorage` 유저별 키 |
| 서버 재시작 시 | `data/games.json` + `data/events.json` 자동 복원 |

- `useGameSync` 훅이 로그인 상태를 감시하여 유저 전환 시 자동 동기화
- localStorage → Firestore 자동 마이그레이션 지원

---

## 5. 파일 구조

```
/MVPAgent
  ├── /src
  │   ├── /agents
  │   │   ├── OrchestratorAgent.js   # 파이프라인 전체 흐름 제어
  │   │   ├── TrendAgent.js          # 트렌드 분석
  │   │   ├── PlanAgent.js           # 기획서 자동 작성
  │   │   ├── DevAgent.js            # 게임 코드 자동 생성
  │   │   ├── JudgeAgent.js          # Go/No-Go 평가
  │   │   └── /prompts               # Agent별 System Prompt MD 파일
  │   │       ├── trend-agent.md
  │   │       ├── plan-agent.md
  │   │       ├── dev-agent.md
  │   │       └── judge-agent.md
  │   ├── /pages
  │   │   ├── Dashboard.jsx          # 메인 대시보드
  │   │   ├── AgentPipeline.jsx      # 파이프라인 실행 UI
  │   │   ├── GameLibrary.jsx        # 게임 목록 관리
  │   │   └── Reports.jsx            # 지표 분석
  │   ├── /hooks
  │   │   ├── useAgentPipeline.js    # 파이프라인 실행 훅
  │   │   ├── usePlayMetrics.js      # SSE 실시간 지표 수신
  │   │   ├── useRealMetrics.js      # 실제 데이터 기반 지표 계산
  │   │   └── useGameSync.js         # 유저별 게임 데이터 동기화
  │   └── /store
  │       ├── authStore.js           # 인증 상태
  │       ├── gameStore.js           # 게임 데이터 + 영속화
  │       └── agentStore.js          # Agent 상태/로그/결과
  ├── /server
  │   └── dev-server.js              # Express 서버 (LLM API + 플레이 추적)
  └── /functions                     # Firebase Cloud Functions
```

---

## 6. 개발 이력 요약

| 일자 | 주요 작업 |
|------|-----------|
| 2026-03-30 13:16 | 프로젝트 초기 세팅 (Vite, React, Firebase, Zustand, 폴더 구조) |
| 2026-03-30 13:35 | 파이프라인 훅 연결, Recharts 차트 4종, Dashboard/Reports 고도화 |
| 2026-03-30 13:57 | Firebase 미연결 시 Dev Mode 추가, 흰 화면 이슈 해결 |
| 2026-03-30 14:55 | Claude API 실연동 (Express 서버 구축, 4개 Agent LLM 호출) |
| 2026-03-30 15:33 | Agent 결과 UI 패널 구현 (결과 상세 보기 + MD/JSON/HTML 다운로드) |
| 2026-03-30 15:44 | 게임 라이브러리 페이지 생성 (주제/기획서/게임 탭) |
| 2026-03-30 15:50 | 게임 데이터 계정별 영속화 (Firestore + localStorage 이중 백업) |
| 2026-03-30 16:00 | 전체 데모 데이터 → 실제 데이터 교체 |
| 2026-03-30 16:15 | 실시간 유저 플레이 추적 시스템 구축 (SSE + sendBeacon) |
| 2026-03-30 16:45 | 공유 링크 버그 수정, 서버 데이터 영속화, SSE 중복 등록 방지 |
| 2026-04-01 | Agent별 지시 MD 파일 분리 (`prompts/`), 발표 자료 정리 |

---

## 7. 기술적 의사결정 포인트

### Q. 왜 멀티 에이전트로 설계했나?
단일 LLM 호출로 "트렌드 분석 + 기획서 작성 + 게임 구현"을 한 번에 요청하면 각 단계의 품질과 제어가 어렵습니다. 역할을 분리하면 각 Agent가 특화된 System Prompt를 가지고, 이전 단계 결과를 컨텍스트로 받아 더 정확한 출력을 생성합니다.

### Q. Agent 지시를 코드가 아닌 MD 파일로 분리한 이유?
비개발자도 Agent의 행동을 수정할 수 있어야 하고, 코드 배포 없이 즉시 반영이 필요했습니다. MD 파일을 매 요청마다 읽어 System Prompt로 주입하는 방식으로 **런타임 행동 수정**이 가능합니다.

### Q. 실시간 유저 추적에 SSE를 선택한 이유?
WebSocket은 양방향 통신이 필요하지만, 이 시스템은 서버 → 클라이언트 단방향 스트림만 필요합니다. SSE는 HTTP 기반으로 방화벽 이슈가 적고, 자동 재연결이 내장되어 있습니다.

### Q. sendBeacon을 사용한 이유?
유저가 브라우저 탭을 닫거나 페이지를 떠날 때 `fetch`는 취소됩니다. `sendBeacon`은 페이지 언로드 시에도 데이터 전송을 OS 레벨에서 보장합니다.

---

## 8. 실행 방법

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정 (.env.local)
ANTHROPIC_API_KEY=sk-ant-...
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_DATABASE_URL=https://...

# 3. 개발 서버 시작 (Vite :3000 + Express :3100 동시 실행)
npm run dev

# 4. 브라우저 접속
http://localhost:3000
```
