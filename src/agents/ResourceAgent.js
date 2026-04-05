/**
 * Resource Agent
 * PlanAgent의 리소스 요청서를 받아 Stable Diffusion API로 게임 에셋을 생성한다.
 * STABILITY_API_KEY가 없으면 placeholder SVG를 생성한다.
 */

import { useAgentStore } from '../store/agentStore';

const DEV_API = 'http://localhost:3100/api';

export class ResourceAgent {
  log(message) {
    useAgentStore.getState().addAgentLog('resource', message);
  }

  async generateResources(planResult) {
    const resourceRequest = planResult.resourceRequest || [];

    if (!resourceRequest.length) {
      this.log('리소스 요청 없음 — 건너뜀');
      return { gameId: null, resources: [] };
    }

    this.log(`리소스 제작 시작: ${resourceRequest.length}개 에셋`);

    try {
      const hasSD = Boolean(window.__STABILITY_KEY);
      this.log(hasSD ? '(Stable Diffusion으로 생성 중...)' : '(Claude AI로 게임 아트 생성 중 — 에셋당 3~8초 소요)');

      const res = await fetch(`${DEV_API}/generate-resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resources: resourceRequest,
          context: {
            genre: planResult.genreName || planResult.genre,
            gameTitle: planResult.gameTitle,
            theme: planResult.contentDesign?.theme,
            colorPalette: planResult.contentDesign?.colorPalette,
          },
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      const sdCount = data.resources.filter(r => r.status === 'sd-generated').length;
      const aiCount = data.resources.filter(r => r.status === 'ai-generated').length;
      const phCount = data.resources.filter(r => r.status === 'placeholder').length;

      const parts = [];
      if (sdCount) parts.push(`SD ${sdCount}`);
      if (aiCount) parts.push(`AI아트 ${aiCount}`);
      if (phCount) parts.push(`placeholder ${phCount}`);
      this.log(`리소스 제작 완료: ${parts.join(', ')}개`);

      data.resources.forEach(r => {
        const icon = r.status === 'sd-generated' ? '🎨' : r.status === 'ai-generated' ? '🖌️' : '📦';
        this.log(`  ${icon} ${r.id} (${r.category})`);
      });

      return data;
    } catch (error) {
      this.log(`리소스 생성 실패: ${error.message}`);
      return { gameId: null, resources: [] };
    }
  }
}
