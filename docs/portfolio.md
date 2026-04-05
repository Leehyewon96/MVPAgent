# MVP Agent — 포트폴리오

> LLM 기반 멀티 에이전트 시스템: 게임 트렌드 분석부터 플레이 가능한 게임 자동 생성·배포·유저 지표 수집까지 전 과정 자동화

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | MVP Agent |
| 개발 기간 | 2026년 3월 |
| 개발 형태 | 개인 프로젝트 (AI 에이전트 보조 개발) |
| 배포 환경 | Vercel (프론트엔드) + Express 로컬 서버 |
| 핵심 기술 | Multi-Agent Pipeline, LLM(Claude API), React, Firebase |

### 한 줄 요약
> **"주제 입력 없이 버튼 하나로 트렌드를 분석하고, 기획서를 쓰고, 게임을 만들고, 전 세계 유저 플레이 데이터를 실시간으로 수집하는 Agentic AI 서비스"**

---

## 2. 해결한 문제 (Problem Statement)

기존 게임 개발 프로세스는 다음과 같은 병목 구간이 존재한다:

- **시장조사**: 개발자가 직접 커뮤니티·유튜브·트렌드를 수작업으로 탐색
- **기획 문서 작성**: 시스템 기획서·콘텐츠 기획서를 수일에 걸쳐 작성
- **프로토타입 구현**: 기획 → 실제 플레이 가능한 코드까지 수주 소요
- **Go/No-Go 판단**: 정성적 판단에 의존, 데이터 기반 의사결정 부재
- **유저 지표 수집**: 별도 분석 도구·인프라 구축 필요

MVP Agent는 이 전 과정을 **4개 LLM Agent의 연쇄 파이프라인**으로 자동화하여 수일~수주 걸리던 작업을 수 분 내에 완결한다.

---

## 3. 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                   Agent Pipeline                        │
│                                                         │
│  [OrchestratorAgent]                                    │
│       │                                                 │
│       ├── Phase 1: [TrendAgent]                         │
│       │     Claude API → 트렌드 키워드 분석·스코어링     │
│       │                                                 │
│       ├── Phase 2: [PlanAgent]                          │
│       │     Claude API → 시스템/콘텐츠 기획서 자동 생성  │
│       │                                                 │
│       ├── Phase 3: [DevAgent]                           │
│       │     Claude API → HTML5 Canvas 게임 코드 생성    │
│       │                                                 │
│       └── Phase 4: [JudgeAgent]                         │
│             Claude API → 4개 항목 품질 평가 + Go/No-Go  │
│                                                         │
└─────────────────────────────────────────────────────────┘
          │                              │
          ▼                              ▼
┌──────────────────┐         ┌──────────────────────┐
│  React Frontend  │         │   Express Dev Server  │
│  (Vite + Vercel) │         │   (플레이 트래킹)      │
│                  │         │                        │
│ - Dashboard      │◄──SSE──►│ - /play/:gameId        │
│ - AgentPipeline  │         │ - /api/play-events     │
│ - GameLibrary    │         │ - /api/game-stats      │
│ - Reports        │         │ - /api/play-stream     │
└──────────────────┘         └──────────────────────┘
          │
          ▼
┌──────────────────┐
│    Firebase      │
│ - Auth (Google)  │
│ - Firestore DB   │
│ - Realtime DB    │
└──────────────────┘
```

---

## 4. 기술 스택

| 영역 | 기술 | 선택 이유 |
|------|------|-----------|
| LLM | Anthropic Claude API | 긴 컨텍스트 처리·코드 생성 품질 |
| Frontend | React 18 + Vite 5 | 빠른 빌드, HMR 개발 환경 |
| 스타일링 | Tailwind CSS 3 | 유틸리티 기반 빠른 UI 구성 |
| 전역 상태 | Zustand 4 | 경량·단순한 클라이언트 상태 관리 |
| 데이터 페칭 | React Query 5 | 서버 상태 캐싱·동기화 |
| 애니메이션 | Framer Motion 11 | 파이프라인 진행 상태 시각화 |
| 차트 | Recharts | DAU/세션/리텐션/장르 비교 차트 |
| Backend | Express.js | 로컬 API 서버 + 트래킹 서버 |
| 실시간 통신 | SSE (Server-Sent Events) | 유저 플레이 이벤트 실시간 스트림 |
| DB | Firestore + Realtime DB | 게임/유저 데이터 영속화 |
| 인증 | Firebase Auth (Google) | 소셜 로그인, 계정별 게임 데이터 분리 |
| 배포 | Vercel | GitHub push 시 자동 배포 |

---

## 5. 핵심 기능 상세

### 5.1 멀티 에이전트 파이프라인 (Agentic AI)

`OrchestratorAgent`가 전체 흐름을 조율하고, 각 전문 Agent가 특화된 작업을 수행한다.

```
버튼 클릭
    ↓
TrendAgent  → Claude에게 "지금 게임 커뮤니티에서 핫한 트렌드 3개 분석해줘"
              → 키워드, 출처, 스코어, 게임 아이디어 반환
    ↓
PlanAgent   → Claude에게 "이 트렌드 기반으로 시스템/콘텐츠 기획서 작성해줘"
              → 장르, 코어 루프, 조작법, 적/아이템, 색상 팔레트 반환
    ↓
DevAgent    → Claude에게 "이 기획서 기반으로 HTML5 Canvas 게임 코드 구현해줘"
              → 단일 HTML 파일(플레이 가능한 게임) 반환
    ↓
JudgeAgent  → Claude에게 "이 게임을 게임플레이/비주얼/리플레이/시장적합 4개 항목으로 평가해줘"
              → 점수(0~100) + Go/No-Go 판정 + 개선 제안 반환
```

- 각 Agent 결과는 **다음 Agent의 입력으로 자동 전달** (체이닝)
- Agent별 실행 상태(`idle` / `running` / `completed` / `error`)를 Zustand로 실시간 관리
- 결과물은 **MD / JSON / HTML 파일로 다운로드** 가능

---

### 5.2 실시간 유저 플레이 추적 시스템

생성된 게임 HTML에 **트래킹 스크립트를 자동 주입**하여 공유 링크(`/play/:gameId`)로 배포한다. 전 세계 어디서든 이 링크로 접속한 유저의 행동을 실시간으로 수집한다.

**수집 이벤트 종류:**

| 이벤트 | 수집 시점 |
|--------|-----------|
| `session_start` | 게임 링크 접속 시 |
| `heartbeat` | 15초 간격 (활성 세션 판별) |
| `pause` / `resume` | 탭 전환 감지 |
| `session_end` | 페이지 종료 시 (`sendBeacon` 사용) |
| `game_event` | 게임 내 커스텀 이벤트 (`window._mvpTrack()`) |

**실시간 전달 방식:**
- 서버: SSE(Server-Sent Events)로 이벤트 스트림 push
- 클라이언트: `usePlayMetrics` 훅이 SSE 구독 + 30초 폴링 fallback
- 대시보드에 **현재 접속자 수, 세션 수, 평균 플레이 시간** 실시간 반영

---

### 5.3 개발자 대시보드 & 분석 리포트

**Dashboard 페이지:**
- 전체 통계 카드 (총 게임 수, GO 판정률, 평균 점수)
- 실시간 유저 지표 (전체 플레이어 / 세션 / 현재 접속자)
- 게임별 공유 링크 + 실시간 접속자 수

**Reports 페이지 (3개 탭):**

| 탭 | 내용 |
|----|------|
| 개요 | 생성 게임 수, 평균 점수, GO 판정률 통계 카드 |
| 게임별 점수 | 게임별 4개 항목 점수 비교 (프로그레스 바) |
| 장르별 비교 | 장르별 평균 점수 레이더 차트 + 강점/약점 분석 |
| 유저 분석 | 전체 방문자/세션/플레이시간 + 게임별 유저 지표 테이블 |

모든 차트·지표는 **실제 파이프라인 실행 결과 데이터**를 기반으로 동적 계산한다 (하드코딩 데모 데이터 없음).

---

### 5.4 계정별 데이터 영속화

- Firebase 연결 시: Firestore `users/{uid}/games` 컬렉션에 저장
- Dev Mode(Firebase 미연결): `localStorage`에 유저별 키로 저장
- 로컬→Firestore 자동 마이그레이션 지원
- `useGameSync` 훅이 로그인 상태를 감시하여 자동 동기화

---

## 6. 기술적 도전과 해결

### 도전 1: 파이프라인 안정성 — Firebase 미연결 시 전체 앱 크래시

**문제**: Firebase 초기화 실패 시 `top-level await`가 모듈 로드를 막아 앱이 흰 화면으로 중단됨

**해결**:
- Firebase 초기화를 정적 import + `try-catch` 방어로 전환
- 모든 Agent를 Firebase 미연결 상태에서도 mock 데이터로 안전 동작하도록 설계
- Auth 상태 감지에 3초 타임아웃 fallback 추가 → 네트워크 지연과 무관하게 UI 렌더링 보장

---

### 도전 2: 실시간 유저 추적 — `sendBeacon` + SSE 데이터 파이프라인

**문제**:
1. 브라우저가 페이지를 닫을 때 `fetch`는 전송이 취소됨
2. SSE 재연결 시마다 게임이 서버에 중복 등록됨
3. Express가 `sendBeacon`의 `text/plain` body를 파싱하지 못함

**해결**:
1. `navigator.sendBeacon` API 사용 → 페이지 언로드 직전에도 데이터 전송 보장
2. `syncedRef` + Zustand `subscribe` 패턴으로 SSE 재연결 시 중복 등록 방지
3. `express.text()` 미들웨어 추가로 `text/plain` body 파싱 처리

---

### 도전 3: 서버 재시작 시 게임 데이터 유실

**문제**: 게임 HTML과 이벤트 데이터가 서버 메모리에만 존재하여 재시작 시 사라짐

**해결**: `data/games.json` + `data/events.json`에 자동 영속화. 서버 시작 시 파일에서 자동 복원 (`Loaded N games from disk`)

---

### 도전 4: 멀티 Agent 상태 동기화

**문제**: 4개 Agent가 순차 실행되는 동안 UI가 각 Agent의 상태(idle/running/completed/error)를 정확히 반영해야 함

**해결**: Zustand `agentStore`에 Agent별 독립 상태 슬롯 설계. Orchestrator가 각 Phase 전환 시 직접 store를 업데이트하여 UI가 즉시 반응

---

## 7. 프로젝트 성과 및 의의

- **개발 자동화 속도**: 트렌드 분석 → 플레이 가능한 게임 생성까지 **약 2~5분** 이내 완결
- **Agentic AI 실증**: 단일 LLM 호출이 아닌, 역할이 분리된 멀티 Agent의 **체이닝 파이프라인** 설계·구현
- **실시간 분석 루프**: 생성된 게임의 유저 반응을 즉시 수집하여 다음 게임 주제 선정에 피드백 가능한 **데이터 루프** 완성
- **확장 가능한 구조**: Agent 추가 시 `OrchestratorAgent`의 파이프라인에 Phase만 삽입하면 되는 모듈형 설계

---

## 8. 공고 요구사항 대응 요약

| 공고 요구사항 | 이 프로젝트에서의 경험 |
|--------------|----------------------|
| LLM 기반 AI Agent 서비스 개발 | Claude API 기반 4-Agent 파이프라인 설계·구현 |
| Agentic AI 기반 업무 자동화 | 트렌드분석→기획→개발→판단 전 과정 자동화 |
| 시장/게임 데이터 분석 Agent | TrendAgent (게임 트렌드 분석·스코어링) |
| Agent AI 기술 연구 및 상용화 | SSE 실시간 유저 추적 + Go/No-Go 자동 판단 루프 |
| 이슈에 논리적·주도적으로 접근 | Firebase 크래시, sendBeacon 파싱, SSE 중복 등록 등 실환경 버그 직접 진단·해결 |

---

## 9. 관련 링크 / 산출물

- **GitHub**: (저장소 URL)
- **배포 URL**: (Vercel URL)
- **주요 소스**: `src/agents/`, `server/dev-server.js`, `src/hooks/usePlayMetrics.js`
