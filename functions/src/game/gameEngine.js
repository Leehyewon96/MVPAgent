/**
 * 서버 사이드 게임 로직 엔진
 * 게임 계산, 검증, 점수 처리 등의 서버 로직을 담당한다.
 */

class GameEngine {
  constructor(gameConfig) {
    this.config = gameConfig;
  }

  validateAction(action, gameState) {
    // TODO: 액션 유효성 검증
    return { valid: true };
  }

  calculateScore(events) {
    // TODO: 이벤트 기반 점수 계산
    return events.reduce((total, e) => total + (e.score || 0), 0);
  }

  processRound(gameState, playerAction) {
    const validation = this.validateAction(playerAction, gameState);
    if (!validation.valid) {
      return { error: validation.reason };
    }

    // TODO: 라운드 처리 로직
    return {
      newState: gameState,
      events: [],
    };
  }
}

module.exports = { GameEngine };
