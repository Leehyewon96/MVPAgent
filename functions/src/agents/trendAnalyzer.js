/**
 * 서버 사이드 트렌드 분석 모듈
 * 외부 API를 통해 트렌드 데이터를 수집하고 LLM으로 분석한다.
 */

class TrendAnalyzer {
  constructor(config = {}) {
    this.sources = config.sources || ['youtube', 'community', 'ott'];
  }

  async fetchFromYouTube() {
    // TODO: YouTube Data API v3 연동
    return [];
  }

  async fetchFromCommunity() {
    // TODO: 게임 커뮤니티 크롤링/API 연동
    return [];
  }

  async fetchFromOTT() {
    // TODO: OTT 트렌드 API 연동
    return [];
  }

  async analyze() {
    const results = await Promise.allSettled([
      this.fetchFromYouTube(),
      this.fetchFromCommunity(),
      this.fetchFromOTT(),
    ]);

    const allData = results
      .filter((r) => r.status === 'fulfilled')
      .flatMap((r) => r.value);

    // TODO: LLM을 통해 수집된 데이터에서 게임 소재 후보 추출
    return {
      rawData: allData,
      topics: [],
      analyzedAt: Date.now(),
    };
  }
}

module.exports = { TrendAnalyzer };
