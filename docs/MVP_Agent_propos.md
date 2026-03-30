# MVP Agent — Claude Code 초기 지시 문서

> 이 문서는 Claude Code가 MVP Agent 프로젝트를 처음 세팅할 때 읽고 따라야 할 지시 파일입니다.

---

## 1. 프로젝트 개요

**MVP Agent**는 트렌드 분석 → 게임 기획 → 게임 구현 → 유저 지표 수집·분석까지의 전 과정을 자동화하는 멀티 에이전트 시스템이다.

### 핵심 목표
- 게임 커뮤니티·유튜브·OTT 등에서 핫한 주제를 자동 탐지하여 게임 소재로 활용
- LLM 기반으로 게임 시스템 기획서(md) 및 콘텐츠 기획서(md) 자동 작성
- 작성된 기획 문서를 기반으로 게임 자동 구현·배포
- 유저 플레이 로그·리텐션·사용자 수 등 지표 수집 및 장르별 비교 분석

### 시스템 액터
| 액터 | 역할 |
|------|------|
| 플레이어 | 게임을 직접 플레이하는 유저 |
| 개발자 | 유저 지표 수치를 모니터링하는 운영자 |

---

## 2. 기술 스택 (반드시 준수)

> ⚠️ 아래 기술 스택은 고정이다. 임의로 변경하지 말 것.

### Frontend
| 기술 | 버전 | 비고 |
|------|------|------|
| React | 18.x | 컴포넌트 기반 UI |
| Vite | 5.x | 빠른 빌드 |
| Tailwind CSS | 3.x | 반응형 스타일링 |
| Zustand | 4.x | 전역 상태 관리 |
| Framer Motion | 11.x | 애니메이션 |
| React Router | 6.x | SPA 라우팅 |
| React Query | 5.x | 데이터 캐싱·동기화 |

### Backend / 인프라
| 기술 | 역할 |
|------|------|
| Firebase Authentication | 소셜 로그인·세션 관리 |
| Firebase Cloud Functions | 서버 로직 (LLM 호출, 게임 계산, 검증 등) |
| Vercel | 프론트엔드 배포 (GitHub push 자동 배포) |

### Database
| 기술 | 역할 |
|------|------|
| Firestore | 메인 DB (유저, 게임, 에이전트 로그 등) |
| Firebase Realtime Database | 실시간 데이터 (지표 업데이트, 랭킹 등) |

> **DB 스키마(컬렉션 구조)는 이 문서에서 지정하지 않는다.**  
> 구현 단계에서 기능 요구사항에 맞게 설계할 것.

---

## 3. 시스템 아키텍처

### 계층 구조
```
Presentation Tier   →  React + Vite (Vercel 배포)
                           ↕
Application Tier    →  Firebase Cloud Functions (LLM 기반 로직, 게임 서버)
                           ↕
Data Tier           →  Firestore + Realtime DB
```

### Agent 단계별 구성
| Phase | Agent 역할 |
|-------|-----------|
| 시장조사 | 트렌드 분석, 경쟁 게임 분석, 장르 결정 |
| 기획 | 콘텐츠 기획, 시스템 기획, 기술 스택 검토 |
| 개발 | 클라이언트, 서버, DBA, 에셋 생성, QA/테스트, 보안/어뷰징, 빌드 |
| 출시 | 스토어 출시, UA/마케팅 |
| 판단 | 지표 수집, Go/No-Go 판단 |
| 횡단 | **Orchestrator** (전체 조율) |

---

## 4. 핵심 기능 명세

### 4.1 게임 주제 선정 자동화
- 게임 커뮤니티, 유튜브, OTT 등 외부 소스에서 핫한 키워드·주제 탐지
- 탐지 결과를 게임 소재 후보 목록으로 정리

### 4.2 기획 문서 자동 작성
- 선정된 주제 기반으로 **게임 시스템 기획서** 및 **게임 콘텐츠 기획서** 작성
- 출력 형식: `.md` 파일

### 4.3 게임 구현 자동화
- 기획 문서를 입력으로 받아 실행 가능한 웹 게임 구현
- 게임 제작 생애주기: `주제 선정 → 기획 문서 작성 → 구현 → 버그 테스트 → 버그 수정 → 배포`

### 4.4 유저 플레이 로그 수집
- 게임 플레이 생애주기: `게임 플레이 → 게임 종료 → 로그 기록`
- 수집 항목: 플레이 시간, 게임 종료 사유, 세션 정보 등

### 4.5 유저 지표 분석 대시보드
- 개발자 전용 뷰: 사용자 수, 리텐션, 장르별 유저 반응 비교
- 장르별·주제별 데이터 수치화 및 시각화

---

## 5. 프로젝트 초기 세팅 절차

Claude Code는 아래 순서대로 프로젝트를 세팅한다.

```bash
# 1. 프로젝트 생성
npm create vite@latest mvp-agent -- --template react

# 2. 의존성 설치
cd mvp-agent
npm install firebase zustand @tanstack/react-query framer-motion react-router-dom

# 3. Tailwind CSS 설치 및 초기화
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 4. Firebase 초기화 (Firestore, Functions, Hosting, Realtime Database 선택)
firebase init

# 5. 개발 서버 실행 확인
npm run dev
```

### 환경변수 (.env.local)
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_DATABASE_URL=
```

> 값은 Firebase 콘솔에서 발급 후 채울 것. `.env.local`은 절대 커밋하지 말 것.

---

## 6. 폴더 구조 (초안)

```
/src
  /agents          # Agent별 로직 (TrendAgent, PlanAgent, DevAgent, JudgeAgent 등)
  /components      # 공통 UI 컴포넌트
  /pages           # 라우트별 페이지 (Dashboard, GamePlayer, Reports 등)
  /store           # Zustand 스토어
  /firebase        # Firebase 초기화 및 쿼리 함수
  /hooks           # 커스텀 훅
  /utils           # 유틸 함수 (지표 계산, 로그 처리 등)
/functions         # Firebase Cloud Functions
  /src
    /agents        # 서버 사이드 Agent 함수
    /game          # 게임 로직 함수
    /analytics     # 지표 수집·분석 함수
```

---

## 7. Claude Skills 활용 지침

이 프로젝트에서는 **Claude Skills**를 적극 활용한다.

| 작업 | 사용할 Skill |
|------|-------------|
| 기획 문서(md → docx) 출력 필요 시 | `docx` skill |
| 스프레드시트 형태 지표 출력 시 | `xlsx` skill |
| UI 컴포넌트·페이지 구현 시 | `frontend-design` skill |
| PDF 보고서 생성 시 | `pdf` skill |

> Skill 사용 전 반드시 해당 `SKILL.md` 파일을 먼저 읽고 지침을 따를 것.

---

## 8. 개발 우선순위 (MVP 기준)

1. **Firebase 프로젝트 세팅 및 Auth 연동** (구글 로그인)
2. **Orchestrator Agent 뼈대 구현** (전체 파이프라인 흐름 제어)
3. **트렌드 분석 Agent 구현** (외부 소스 탐색 → 주제 후보 반환)
4. **기획 문서 자동 작성 Agent 구현** (LLM → md 파일 생성)
5. **게임 플레이어 화면 구현** (Presentation Tier)
6. **유저 로그 수집 로직 구현** (플레이 시작·종료 이벤트)
7. **개발자 대시보드 구현** (지표 시각화)
8. **Vercel 배포 설정** (GitHub Actions 연동)

---

## 9. 코드 작성 원칙

- 모든 컴포넌트는 **함수형 컴포넌트 + React Hooks** 사용
- 전역 상태는 **Zustand**만 사용 (Redux, Context API 사용 금지)
- 서버 로직은 **Firebase Cloud Functions**에만 작성 (클라이언트에 민감 로직 노출 금지)
- API 키, 시크릿은 반드시 **환경변수**로 관리
- LLM 호출은 **Cloud Functions** 내에서만 수행 (클라이언트에서 직접 호출 금지)
- 타입 안정성을 위해 **JSDoc** 또는 **TypeScript** 사용 권장
- 커밋 메시지: `feat:`, `fix:`, `docs:`, `refactor:` 접두어 사용

---

## 10. 참고 문서

| 문서 | 내용 |
|------|------|
| `MVP_Agent.pdf` | 시스템 요구사항, 액터 설계, 유스케이스, Agent 목록 |
| `03_기술스택문서.docx` | 기술 스택 상세, Firebase 구성, 배포 설정 참고 |

> 구현 전 반드시 두 문서를 모두 읽을 것.
