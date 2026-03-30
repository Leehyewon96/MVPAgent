# AGENTS.md — MVP Agent 프로젝트 AI 지침

> AI 에이전트가 이 프로젝트에서 작업할 때 반드시 따라야 하는 규칙 모음입니다.

---

## 1. 프롬프트 로그 규칙

- 사용자가 **"이 프롬프트 저장해줘"** 라고 요청하면 해당 프롬프트를 `project_prompt_log.md`에 순차적으로 기록한다.
- 로그 항목에는 반드시 아래 항목을 포함한다:
  - 입력 시간 (실제 시스템 시간 참조)
  - 프롬프트 원문
  - 수행 내용 요약
  - 소요 시간

---

## 2. 폴더·파일 구조 동기화 규칙 ⚠️

**파일이나 폴더를 추가·삭제·이동할 때마다 반드시 `structure.md`를 업데이트해야 한다.**

### 적용 범위

- 새 파일 생성 → `structure.md`에 해당 항목 추가
- 파일 삭제 → `structure.md`에서 해당 항목 제거
- 파일/폴더 이동 또는 이름 변경 → `structure.md`에서 경로 수정
- 새 폴더 생성 → `structure.md`에 폴더 블록 추가

### 제외 항목 (structure.md에 기록하지 않아도 되는 것)

- `node_modules/`
- `dist/`, `dist-ssr/`
- `.git/`
- `*.local` 파일
- 빌드 산출물

### structure.md 작성 형식

```
/폴더명
  ├── 파일명.확장자         # 간단한 설명
  ├── /하위폴더
  │   └── 파일명.확장자     # 간단한 설명
```

---

## 3. 코드 작성 원칙

- 모든 컴포넌트는 **함수형 컴포넌트 + React Hooks** 사용
- 전역 상태는 **Zustand**만 사용 (Redux, Context API 사용 금지)
- 서버 로직은 **Firebase Cloud Functions**에만 작성
- LLM 호출은 **Cloud Functions** 내에서만 수행 (클라이언트 직접 호출 금지)
- API 키·시크릿은 반드시 **환경변수**로 관리, `.env.local`은 커밋 금지
- 커밋 메시지: `feat:`, `fix:`, `docs:`, `refactor:` 접두어 사용

---

## 4. 기술 스택 (고정 — 임의 변경 금지)

| 영역 | 기술 |
|------|------|
| Frontend | React 18, Vite 5, Tailwind CSS 3, Zustand 4, Framer Motion 11, React Router 6, React Query 5 |
| Backend | Firebase Cloud Functions |
| Database | Firestore, Firebase Realtime Database |
| Auth | Firebase Authentication (Google 로그인) |
| 배포 | Vercel |

---

## 5. 참고 문서

| 문서 | 역할 |
|------|------|
| `structure.md` | 프로젝트 전체 파일·폴더 구조 (항상 최신 상태 유지) |
| `project_prompt_log.md` | 사용자 프롬프트 이력 |
| `docs/MVP_Agent_propos.md` | 시스템 요구사항 및 Agent 설계 원본 |
| `docs/project_rules.md` | 프로젝트 운영 규칙 |
