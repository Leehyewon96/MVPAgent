/**
 * 지표 수집·분석 모듈
 * 유저 플레이 로그를 수집하고 리텐션, DAU, 장르별 비교 등을 계산한다.
 */

const { getFirestore } = require('firebase-admin/firestore');

class MetricsCollector {
  constructor() {
    this.db = getFirestore();
  }

  async collectPlayLogs(gameId, options = {}) {
    const { startDate, endDate, limit: maxResults = 1000 } = options;

    let query = this.db.collection('playLogs').where('gameId', '==', gameId);

    if (startDate) {
      query = query.where('startedAt', '>=', startDate);
    }
    if (endDate) {
      query = query.where('startedAt', '<=', endDate);
    }

    const snap = await query.limit(maxResults).get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async calculateDAU(gameId, date = new Date()) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const logs = await this.collectPlayLogs(gameId, {
      startDate: dayStart.getTime(),
      endDate: dayEnd.getTime(),
    });

    const uniqueUsers = new Set(logs.map((l) => l.userId));
    return uniqueUsers.size;
  }

  async calculateRetention(gameId, day) {
    // TODO: D1, D7, D30 리텐션 계산
    return 0;
  }

  async generateReport(gameId) {
    const dau = await this.calculateDAU(gameId);
    const d1 = await this.calculateRetention(gameId, 1);
    const d7 = await this.calculateRetention(gameId, 7);

    return {
      gameId,
      dau,
      retention: { d1, d7 },
      generatedAt: Date.now(),
    };
  }
}

module.exports = { MetricsCollector };
