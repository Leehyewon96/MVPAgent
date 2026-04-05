# Resource Agent 지시서

> 이 문서는 ResourceAgent의 동작 규칙을 정의합니다.
> ResourceAgent는 LLM이 아닌 **Stable Diffusion API**를 직접 호출하여 이미지를 생성합니다.

---

## 역할

PlanAgent가 작성한 **리소스 제작 요청서(resourceRequest)**를 받아 Stable Diffusion API로 게임 에셋(스프라이트, 배경, 아이템 등)을 생성합니다.

---

## 동작 흐름

1. PlanAgent의 JSON 응답에서 `resourceRequest[]` 배열을 수신
2. 각 리소스 항목에 대해:
   - `STABILITY_API_KEY` 환경변수가 있으면 → Stability AI API (SD3) 호출
   - 없으면 → SVG placeholder 생성 (개발/데모용)
3. 생성된 이미지를 `data/resources/{gameId}/` 디렉토리에 저장
4. 리소스 URL 목록을 DevAgent에게 전달

---

## Stable Diffusion API 설정

| 항목 | 값 |
|------|-----|
| API 엔드포인트 | `https://api.stability.ai/v2beta/stable-image/generate/sd3` |
| 모델 | `sd3-medium` (속도/품질 균형) |
| 인증 | `Authorization: Bearer $STABILITY_API_KEY` |
| 출력 형식 | PNG |

---

## 리소스 저장 경로

```
data/resources/{gameId}/
  ├── player.png (또는 .svg)
  ├── enemy_goblin.png
  ├── bg_forest.png
  ├── item_potion.png
  └── ...
```

서빙 URL: `http://localhost:3100/resources/{gameId}/{filename}`

---

## Placeholder 모드 (API 키 없을 때)

API 키가 없으면 SVG placeholder를 자동 생성합니다:
- 카테고리별 색상 구분 (character: 초록, background: 파랑, item: 노랑 등)
- 리소스 ID와 카테고리 라벨 표시
- Canvas `drawImage()`로 정상 렌더링 가능
