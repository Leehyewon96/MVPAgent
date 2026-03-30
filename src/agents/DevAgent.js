/**
 * Dev Agent
 * 기획 문서를 입력으로 받아 실행 가능한 HTML5 웹 게임을 생성한다.
 * Dev Server 연결 시 Claude API가 실제 게임 코드를 생성한다.
 */

import { useAgentStore } from '../store/agentStore';

const DEV_API = 'http://localhost:3100/api';

export class DevAgent {
  log(message) {
    useAgentStore.getState().addAgentLog('dev', message);
  }

  async develop(planData) {
    this.log('게임 개발 시작');
    this.log(`장르: ${planData.systemDesign?.genre}`);
    this.log(`제목: ${planData.systemDesign?.title}`);

    try {
      this.log('Claude API를 통한 게임 코드 생성 요청 중...');
      this.log('(HTML5 Canvas 게임 생성 중 — 30초~1분 소요)');

      const res = await fetch(`${DEV_API}/generate-game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planData }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      this.log(`게임 코드 생성 완료: ${data.title}`);
      this.log(`  코드 크기: ${(data.code.length / 1024).toFixed(1)}KB`);
      this.log(`  빌드 상태: ${data.buildStatus}`);

      return {
        ...data,
        plan: planData,
      };
    } catch (error) {
      this.log(`API 연결 실패 — 기본 게임 반환 (${error.message})`);
      return this.getFallbackGame(planData);
    }
  }

  getFallbackGame(planData) {
    const title = planData.systemDesign?.title || 'Demo Game';
    return {
      gameId: `game_${Date.now()}`,
      title,
      genre: planData.systemDesign?.genre || 'Unknown',
      code: this.getDefaultGameCode(title),
      buildStatus: 'fallback',
      plan: planData,
      createdAt: Date.now(),
    };
  }

  getDefaultGameCode(title) {
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title>
<style>*{margin:0;padding:0}body{background:#111;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif}
canvas{border:2px solid #333;border-radius:8px}</style></head><body>
<canvas id="c" width="800" height="600"></canvas>
<script>
const c=document.getElementById('c'),x=c.getContext('2d');
let score=0,px=400,py=500,bullets=[],enemies=[],frame=0,gameOver=false;
const keys={};
document.addEventListener('keydown',e=>{keys[e.key]=true;if(gameOver&&e.key===' '){gameOver=false;score=0;enemies=[];bullets=[];px=400;py=500;}});
document.addEventListener('keyup',e=>keys[e.key]=false);
function loop(){x.fillStyle='#111';x.fillRect(0,0,800,600);
if(gameOver){x.fillStyle='#f44';x.font='bold 48px sans-serif';x.textAlign='center';
x.fillText('GAME OVER',400,280);x.fillStyle='#fff';x.font='24px sans-serif';
x.fillText('Score: '+score,400,330);x.fillText('Press SPACE to restart',400,380);
requestAnimationFrame(loop);return;}
if(keys['ArrowLeft'])px=Math.max(20,px-5);if(keys['ArrowRight'])px=Math.min(780,px+5);
if(keys[' ']&&frame%8===0)bullets.push({x:px,y:py-15});
bullets=bullets.filter(b=>{b.y-=8;return b.y>0;});
if(frame%60===0)enemies.push({x:Math.random()*760+20,y:-20,speed:1+Math.random()*2});
enemies=enemies.filter(e=>{e.y+=e.speed;if(e.y>620)return false;
if(Math.abs(e.x-px)<25&&Math.abs(e.y-py)<25){gameOver=true;return false;}return true;});
bullets.forEach(b=>{enemies=enemies.filter(e=>{if(Math.abs(b.x-e.x)<20&&Math.abs(b.y-e.y)<20){score+=10;return false;}return true;});});
x.fillStyle='#4f8';x.beginPath();x.moveTo(px,py-15);x.lineTo(px-12,py+10);x.lineTo(px+12,py+10);x.fill();
x.fillStyle='#ff0';bullets.forEach(b=>{x.fillRect(b.x-2,b.y-6,4,12);});
x.fillStyle='#f44';enemies.forEach(e=>{x.beginPath();x.arc(e.x,e.y,12,0,Math.PI*2);x.fill();});
x.fillStyle='#fff';x.font='18px sans-serif';x.textAlign='left';x.fillText('Score: '+score,20,30);
frame++;requestAnimationFrame(loop);}loop();
</script></body></html>`;
  }
}
