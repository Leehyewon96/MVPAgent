/MVPAgent
  ├── index.html                  # 엔트리 HTML
  ├── package.json                # 의존성 (React, Firebase, Zustand, etc.)
  ├── vite.config.js              # Vite 설정 (포트 3000, alias @)
  ├── tailwind.config.js          # Tailwind CSS (커스텀 primary/dark 컬러)
  ├── postcss.config.js           # PostCSS 설정
  ├── firebase.json               # Firebase 프로젝트 설정
  ├── firestore.rules             # Firestore 보안 규칙
  ├── firestore.indexes.json      # Firestore 인덱스
  ├── database.rules.json         # Realtime DB 보안 규칙
  ├── vercel.json                 # Vercel 배포 설정 (SPA rewrite)
  ├── .gitignore                  # Git 무시 파일 (.env, node_modules 등)
  ├── AGENTS.md                   # AI 에이전트 프로젝트 지침 (규칙 포함)
  ├── structure.md                # 프로젝트 파일·폴더 구조 (항상 최신 유지)
  ├── project_prompt_log.md       # 프롬프트 로그
  │
  ├── /docs
  │   ├── MVP_Agent_propos.md     # 시스템 요구사항 및 Agent 설계 원본
  │   ├── project_rules.md        # 프로젝트 운영 규칙
  │   ├── portfolio.md            # 포트폴리오 문서 (취업·지원용)
  │   └── presentation.md         # 프로젝트 발표 자료 (스펙/기술스택/아키텍처 정리)
  │
  ├── /public
  │   └── vite.svg                # 파비콘 SVG
  │
  ├── /.cursor
  │   └── /rules
  │       └── update-structure.mdc  # structure.md 동기화 Cursor 규칙
  │
  ├── /src
  │   ├── main.jsx                # React 엔트리 (QueryClient, Router)
  │   ├── App.jsx                 # 라우팅 + ErrorBoundary 래핑
  │   ├── index.css               # Tailwind + 커스텀 컴포넌트 스타일
  │   │
  │   ├── /firebase
  │   │   ├── config.js           # Firebase 초기화 (Auth, Firestore, RTDB, Functions)
  │   │   └── queries.js          # Firestore/RTDB CRUD 헬퍼 함수
  │   │
  │   ├── /store
  │   │   ├── authStore.js        # 인증 스토어 (Google 로그인, 상태 감지)
  │   │   ├── gameStore.js        # 게임/플레이 세션 스토어
  │   │   └── agentStore.js       # Agent 상태/로그/결과 스토어
  │   │
  │   ├── /hooks
  │   │   ├── useAuth.js          # 인증 커스텀 훅
  │   │   ├── useGameSession.js   # 게임 세션 관리 훅
  │   │   ├── useAgentPipeline.js # 파이프라인 실행·제어 훅
  │   │   ├── useGameSync.js      # 유저별 게임 데이터 자동 동기화 훅
  │   │   ├── useRealMetrics.js   # 실제 게임 데이터 기반 지표 계산 훅
  │   │   ├── usePlayMetrics.js   # 실시간 유저 플레이 지표 수신 훅 (SSE + polling)
  │   │   └── useFirestoreQuery.js # React Query 기반 Firestore 데이터 페칭 훅
  │   │
  │   ├── /components
  │   │   ├── Layout.jsx          # 사이드바 + 네비게이션 레이아웃
  │   │   ├── Navbar.jsx          # 상단 네비게이션 바
  │   │   ├── Sidebar.jsx         # 사이드바 메뉴
  │   │   ├── ProtectedRoute.jsx  # 인증 가드
  │   │   ├── ErrorBoundary.jsx   # 에러 바운더리 (전역 에러 처리)
  │   │   ├── StatusBadge.jsx     # Agent 상태 뱃지 (idle/running/completed/error)
  │   │   └── /charts
  │   │       ├── DauChart.jsx          # DAU 영역 차트 (Recharts)
  │   │       ├── SessionChart.jsx      # 세션 수 바 차트 (Recharts)
  │   │       ├── RetentionChart.jsx    # 리텐션 곡선 라인 차트 (Recharts)
  │   │       └── GenreComparisonChart.jsx # 장르별 레이더 차트 (Recharts)
  │   │
  │   ├── /pages
  │   │   ├── Login.jsx           # Google 로그인 페이지
  │   │   ├── Dashboard.jsx       # 메인 대시보드 (통계, 차트, Agent 상태, 게임 목록)
  │   │   ├── GamePlayer.jsx      # 게임 플레이어 (세션 추적)
  │   │   ├── Reports.jsx         # 지표 분석 (탭: 개요/리텐션/장르 비교)
  │   │   ├── AgentPipeline.jsx   # Agent 파이프라인 실행·결과 관리 UI
  │   │   └── GameLibrary.jsx     # 게임 라이브러리 (주제/기획서/게임 탭)
  │   │
  │   ├── /agents
  │   │   ├── OrchestratorAgent.js  # 전체 파이프라인 흐름 제어
  │   │   ├── TrendAgent.js         # 트렌드 분석 (Claude API → 실제 분석)
  │   │   ├── PlanAgent.js          # 기획 문서 자동 작성 (Claude API → 실제 기획서)
  │   │   ├── ResourceAgent.js      # 리소스 제작 (Stable Diffusion API → 게임 에셋 생성)
  │   │   ├── DevAgent.js           # HTML5 게임 자동 구현 (Claude API → 실제 코드 생성)
  │   │   ├── JudgeAgent.js         # Go/No-Go 판단 (Claude API → 실제 평가)
  │   │   └── /prompts
  │   │       ├── trend-agent.md    # TrendAgent 지시서 (분석 기준, 출력 형식)
  │   │       ├── plan-agent.md     # PlanAgent 지시서 (장르별 가이드, 기획서+리소스 요청서 스키마)
  │   │       ├── resource-agent.md # ResourceAgent 지시서 (SD API 설정, 리소스 저장 규칙)
  │   │       ├── dev-agent.md      # DevAgent 지시서 (기술 규칙, 리소스 활용, 코드 품질 기준)
  │   │       └── judge-agent.md    # JudgeAgent 지시서 (평가 항목, 판정 기준)
  │   │
  │   └── /utils
  │       ├── analytics.js        # 리텐션, DAU, 세션 분석 유틸
  │       ├── download.js         # 파일 다운로드 유틸 (MD/JSON/HTML + 트렌드·기획서 변환)
  │       └── logger.js           # 로그 관리 (레벨별, Firebase 연동)
  │
  ├── /server
  │   └── dev-server.js             # 로컬 API 서버 (Express + Anthropic Claude)
  │
  └── /functions
      ├── package.json            # Cloud Functions 의존성
      └── /src
          ├── index.js            # Functions 엔트리 (5개 API)
          ├── /agents
          │   └── trendAnalyzer.js  # 서버 사이드 트렌드 분석
          ├── /game
          │   └── gameEngine.js     # 서버 사이드 게임 엔진
          └── /analytics
              └── metricsCollector.js  # 지표 수집·분석
