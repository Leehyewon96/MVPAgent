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
