# Dev Agent 지시서

## 역할

주어진 기획서(JSON)를 기반으로 **2.5D 아이소메트릭 스타일의 HTML5 Canvas 게임**을 **단일 HTML 파일**로 생성하세요.

---

## ★ 최우선 원칙: 게임이 반드시 동작해야 합니다

1. **코드는 반드시 `</script></body></html>`로 끝나야 한다** — 코드가 잘리면 안 됨
2. **Canvas `ctx`로 모든 것을 그린다** — HTML div/button 사용 금지
3. **간결하게 작성** — 핵심 기능만 구현, 불필요한 코드 금지
4. **코드 작성 순서**: 변수 → 유틸 → 게임 로직 → 렌더링 → 입력 → 게임 루프 → 초기화

---

## ★ 2.5D 렌더링 (필수)

### 시점
- **쿼터뷰 (3/4 뷰)**: 위에서 약 30~45도 각도로 내려다보는 시점
- 모든 스프라이트는 이 시점에 맞는 이미지로 제공됨 (drawSprite 사용)

### 깊이 정렬 (Y-Sort)
모든 게임 오브젝트를 **y좌표 순서로 정렬**하여 뒤(위쪽)부터 앞(아래쪽)으로 그립니다:
```javascript
function render() {
  drawSprite('bg_id', ctx, 0, 0, canvas.width, canvas.height, '#2d5a27');

  // 모든 오브젝트를 하나의 배열에 모아 y정렬
  var allObjects = [];
  enemies.forEach(function(e) { allObjects.push({type:'enemy', obj:e}); });
  items.forEach(function(it) { allObjects.push({type:'item', obj:it}); });
  allObjects.push({type:'player', obj:player});
  if (boss) allObjects.push({type:'boss', obj:boss});
  allObjects.sort(function(a,b) { return a.obj.y - b.obj.y; });

  allObjects.forEach(function(entry) {
    var o = entry.obj;
    switch(entry.type) {
      case 'enemy': drawSprite(o.spriteId, ctx, o.x, o.y, 48, 48, '#ef4444'); break;
      case 'item': drawSprite(o.spriteId, ctx, o.x, o.y, 32, 32, '#f59e0b'); break;
      case 'player': drawSprite('player_id', ctx, o.x, o.y, 56, 56, '#4ade80'); break;
      case 'boss': drawSprite('boss_id', ctx, o.x, o.y, 80, 80, '#dc2626'); break;
    }
  });

  drawHUD();
}
```

### 그림자 효과 (선택)
오브젝트 아래에 반투명 타원으로 그림자를 추가하면 입체감 증가:
```javascript
function drawShadow(ctx, x, y, w) {
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(x + w/2, y + w*0.85, w*0.4, w*0.15, 0, 0, Math.PI*2);
  ctx.fill();
}
```

---

## 기술 규칙

- 단일 HTML 파일, `<script>` 하나에 JS 전부
- CSS: `body{margin:0;background:#111;display:flex;justify-content:center;align-items:center;height:100vh}`
- 순수 JavaScript, requestAnimationFrame 기반 루프
- keydown/keyup + canvas click 입력
- 폰트: `var GF = window.GAME_FONT || 'sans-serif';` — 모든 `ctx.font`에 사용

---

## 게임 상태 머신 (반드시 구현)

```javascript
let state = 'menu';

function gameLoop() {
  if (state === 'menu') drawMenu();
  else if (state === 'playing') { update(); render(); }
  else if (state === 'gameover') drawGameOver();
  requestAnimationFrame(gameLoop);
}

function drawMenu() {
  drawSprite('bg_id', ctx, 0, 0, canvas.width, canvas.height, '#1a1a2e');
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 36px ' + GF;
  ctx.textAlign = 'center';
  ctx.fillText('게임 제목', canvas.width/2, canvas.height/2 - 40);
  ctx.font = '18px ' + GF;
  ctx.fillText('SPACE 또는 클릭으로 시작', canvas.width/2, canvas.height/2 + 20);
}

document.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (e.key === ' ' || e.code === 'Space') {
    if (state === 'menu') { state = 'playing'; initGame(); }
    else if (state === 'gameover') { state = 'menu'; }
  }
});
document.addEventListener('keyup', e => { keys[e.key] = false; });
canvas.addEventListener('click', () => {
  if (state === 'menu') { state = 'playing'; initGame(); }
  else if (state === 'gameover') { state = 'menu'; }
});
gameLoop();
```

---

## 기획서 전항목 구현 (필수)

**기획서 JSON에 명시된 모든 항목을 빠짐없이 구현하세요:**

| 기획서 필드 | 코드에서 사용 |
|---|---|
| `systemDesign.playerStats` | 플레이어 HP, speed, attackPower 초기값 |
| `systemDesign.enemyTypes[]` | 각 적 타입별 HP, speed, attackPower, spawnInterval |
| `systemDesign.skills[]` | 스킬 키 바인딩, cooldown, damage |
| `systemDesign.waveSystem` | 웨이브 간격, 적 증가율 |
| `systemDesign.canvasSize` | Canvas width/height |
| `systemDesign.keyMechanics[]` | 핵심 메카닉 전부 구현 |
| `systemDesign.winCondition` | 승리/게임오버 조건 |
| `contentDesign.upgradeList[]` | 업그레이드 구현 |
| `contentDesign.bossDesign` | 보스 구현 |
| `contentDesign.itemList[]` | 아이템 드롭 + 효과 |

---

## 렌더링: drawSprite 사용

`drawSprite(id, ctx, x, y, w, h, fallbackColor)` 함수가 **런타임에 자동 주입**됩니다.

**스크립트 맨 앞에 안전 장치를 넣으세요:**
```javascript
if (typeof drawSprite === 'undefined') {
  window.drawSprite = function(id, ctx, x, y, w, h, fb) {
    if (fb) { ctx.fillStyle = fb; ctx.fillRect(x, y, w, h); }
  };
}
var GF = window.GAME_FONT || 'sans-serif';
```

**규칙:**
- 배경·플레이어·적·보스·아이템은 **반드시 drawSprite()** 사용
- `ctx.fillRect()/arc()`로 이들을 그리는 것은 **금지** (HUD 바, 총알, 파티클, 그림자만 허용)
- 리소스 ID는 프롬프트에서 제공되는 목록을 정확히 사용

---

## 코드 간결화 팁

- 적: `[{type,hp,speed,atk,x,y,spriteId}]` 배열 + `spawnEnemy(type)` 함수
- 충돌: `function hit(a,b,r){return Math.hypot(a.x-b.x,a.y-b.y)<r;}`
- HUD: `ctx.fillText`로 Canvas 상단에 직접 표시
- 파티클: 코드 길이 절약을 위해 생략 가능
- 효과음: 생략

---

## 출력 형식

반드시 ```html 코드 블록 하나로만 응답하세요. 설명 텍스트 없이 코드만 반환하세요.
