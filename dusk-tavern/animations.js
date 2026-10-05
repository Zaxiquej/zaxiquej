(function(root){
'use strict';
const shieldCount=c=>root.TavernScaling.shieldCount(c);
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const cards=()=>[...document.querySelectorAll('.card[data-card]:not(.fx-ghost)')];
const key=el=>el.dataset.area+':'+el.dataset.card;
function captureDOM(){return new Map(cards().map(el=>[key(el),{rect:el.getBoundingClientRect(),node:el.cloneNode(true)}]));}
function capture(s){return {dom:captureDOM(),units:new Map([...s.board,...s.hand,...s.shop,...(s.pendingTriples||[]).map(x=>x.card)].map(c=>[c.uid,{...c}])),feasts:s.feasts?.length||0,discards:s.stats?.discards||0,amulets:new Map(s.amulets.map(c=>[c.uid,{...c}])),prayers:s.progress?.prayers||0,shop:new Map(s.shop.map(c=>[c.uid,{...c}])),board:new Map(s.board.map(c=>[c.uid,{...c,keywords:[...c.keywords]}])),hand:new Set(s.hand.map(c=>c.uid)),gold:s.gold,hp:s.hp,blood:s.bloodDamage||0};}
function motion(el,frames,duration=460){if(!el||reduced())return;el.animate(frames,{duration,easing:'cubic-bezier(.2,.7,.3,1)'});}
function float(el,text,kind='gain',duration=650){if(!el||!text)return;const tag=document.createElement('span');tag.className='fx-number '+kind;tag.textContent=text;el.append(tag);if(!reduced())tag.animate([{opacity:0,transform:'translate(-50%,8px) scale(.85)'},{opacity:1,transform:'translate(-50%,-10px) scale(1.08)',offset:.25},{opacity:0,transform:'translate(-50%,-38px) scale(1)'}],{duration,easing:'ease-out'});setTimeout(()=>tag.remove(),duration);}
const sign=n=>(n>0?'+':'')+n;
function recruit(before,s,type,args){
 if(type==='fight')return;
 for(const el of cards()){
  const area=el.dataset.area,uid=+el.dataset.card,prior=before.dom.get(key(el))||before.dom.get('shop:'+uid)||before.dom.get('hand:'+uid),rect=el.getBoundingClientRect();
  if(prior&&['hand','board'].includes(area)){const dx=prior.rect.x-rect.x,dy=prior.rect.y-rect.y;if(Math.abs(dx)+Math.abs(dy)>4)motion(el,[{transform:`translate(${dx}px,${dy}px) scale(.86)`,opacity:.6},{transform:'translate(0,0) scale(1)',opacity:1}],380);}
  if(area==='shop'){const c=s.shop.find(c=>c.uid===uid),old=before.shop.get(uid);if(old){const a=c.attack-old.attack,h=c.health-old.health;if(a||h){float(el,`${sign(a)} / ${sign(h)}`);el.classList.add('empowered');}}}
  if(area==='board'){const c=s.board.find(c=>c.uid===uid),old=before.board.get(uid);if(old){const a=c.attack-old.attack,h=c.health-old.health;if(a||h){float(el,`${sign(a)} / ${sign(h)}`);el.classList.add('empowered');}if(old.keywords.includes('taunt')&&!c.keywords.includes('taunt'))float(el,'移除守护','resource',1000);const pings=(c.dragonPings||0)-(old.dragonPings||0);if(pings>0)float(el,'翼击 +'+pings,'resource',950);const layers=shieldCount(c)-shieldCount(old);if(layers>0){float(el,'屏障 +'+layers,'shield');el.classList.add('shield-pulse');}}else{el.classList.add('summoned');float(el,'入场','gain');}}
  if(area==='hand'&&!before.hand.has(uid)){if(!prior)el.classList.add('summoned');float(el,type==='buy'&&uid===args.uid?'购入':before.shop.has(uid)?'偷取':'获得','resource');}
 }
 if(s.gold!==before.gold)float(document.querySelector('.hud-gold'),sign(s.gold-before.gold)+' ◈','resource');
 if(type==='activate')float(document.querySelector(`.card[data-area="board"][data-card="${args.uid}"]`),'启动','resource',1000);
 if((s.stats?.discards||0)>before.discards)float(document.querySelector('.hand-area'),'弃牌 ×'+((s.stats.discards||0)-before.discards),'resource',1000);
 for(const c of s.amulets){const old=before.amulets.get(c.uid),el=document.querySelector(`.amulet-item[data-card="${c.uid}"]`);if(!old){motion(el,[{opacity:0,transform:'scale(.8)'},{opacity:1,transform:'scale(1)'}]);float(el,'放置','resource');}else if(c.count<old.count)float(el,'倒数 −'+(old.count-c.count),'resource');}
 const expired=(s.progress?.prayers||0)-before.prayers;
 if(expired)float(document.querySelector('.amulet-rack'),'倒数完成 ×'+expired,'resource',1100);
 const loss=(s.bloodDamage||0)-before.blood,heal=s.hp-before.hp+loss;
 if(loss)float(document.querySelector('.hud-health'),`自伤 ${loss}${heal>0?' · 回复 '+heal:''}`,'blood',950);
 else if(s.hp!==before.hp)float(document.querySelector('.hud-health'),sign(s.hp-before.hp)+' ♥',s.hp<before.hp?'loss':'gain');
}
let previous=null;
const departures=new Set();
function reset(){
 previous=null;
 for(const ghost of departures){for(const animation of ghost.getAnimations())animation.cancel();ghost.remove();}
 departures.clear();
}
function battle(event,oldDOM,speed){
 if(previous===event)return;const prior=previous;previous=event;const duration=Math.max(110,Math.round(520/speed)),query=id=>document.querySelector(`.card[data-area="combat"][data-card="${id}"]`);
 const from=query(event.from),to=query(event.to);
 if(event.kind==='attack'&&from&&to){const a=from.getBoundingClientRect(),b=to.getBoundingClientRect(),dx=(b.x-a.x)*.35,dy=(b.y-a.y)*.35;motion(from,[{transform:'translate(0,0)'},{transform:`translate(${dx}px,${dy}px) scale(1.08)`,offset:.42},{transform:'translate(0,0)'}],duration);}
 if(event.kind==='spell'&&from&&to&&!reduced()){const a=from.getBoundingClientRect(),b=to.getBoundingClientRect(),dot=document.createElement('i');dot.className='fx-projectile';dot.style.left=a.x+a.width/2+'px';dot.style.top=a.y+a.height/2+'px';document.body.append(dot);dot.animate([{transform:'translate(0,0) scale(.5)',opacity:1},{transform:`translate(${b.x+b.width/2-a.x-a.width/2}px,${b.y+b.height/2-a.y-a.height/2}px) scale(1.6)`,opacity:0}],{duration:duration*.7,easing:'ease-in'});setTimeout(()=>dot.remove(),duration);}
 if(event.kind==='destroy')float(to,'毁灭','loss',Math.max(450,duration));
 if(event.kind==='reborn')float(to,'获得复生','resource',duration);
 if(event.kind==='reveal')float(to,'解除潜行','resource',duration);
 if(event.kind==='feast'){float(to,'吞噬成长','gain',duration);const food=document.querySelector('.feast-preview');if(food)motion(food,[{opacity:0,transform:'scale(.8)'},{opacity:1,transform:'scale(1)'}],duration);}
 if(!prior)return;const old=new Map(prior.boards.flat().map(c=>[c.battleId,c]));
 const hits=new Map();
 for(const hit of event.impacts||[]){const list=hits.get(hit.target)||[];list.push(hit);hits.set(hit.target,list);}
 for(const c of event.boards.flat()){
  const p=old.get(c.battleId),el=query(c.battleId);old.delete(c.battleId);const impacts=hits.get(c.battleId)||[];
  if(impacts.length){const landed=impacts.filter(x=>!x.blocked),blocked=impacts.filter(x=>x.blocked);
   if(landed.length){float(el,landed.map(x=>'−'+x.amount).join(' '),'loss damage-hit',Math.max(320,duration));motion(el,[{filter:'brightness(2) saturate(.5)'},{filter:'brightness(1)'}],duration*.6);}
   if(blocked.length)float(el,'格挡 · 余'+shieldCount(c)+'层','shield',Math.max(320,duration));
  }
  if(!p){float(el,'召唤','gain',duration);continue;}
  const da=c.attack-p.attack,dh=c.health-p.health,damage=impacts.reduce((n,x)=>n+(x.blocked?0:x.amount),0),gainH=impacts.some(x=>x.destroyed)?0:dh+damage;
  if(da||gainH)float(el,da?`${sign(da)} / ${sign(gainH)}`:sign(gainH),gainH<0?'loss':'gain',duration);
  if(p.keywords.includes('shield')&&!c.keywords.includes('shield')&&!impacts.some(x=>x.blocked))float(el,'破盾','shield',duration);
 }
 for(const [id]of old){
  const saved=oldDOM.get('combat:'+id);if(!saved||reduced())continue;
  const ghost=saved.node;
  // A departure is visual only: never replay the old hit or treat it as a live card.
  ghost.classList.remove('attacking','damaged','casting','summoned','empowered','shield-pulse','echoing','shattering','spell-struck');
  ghost.querySelectorAll('.fx-number').forEach(el=>el.remove());
  ghost.removeAttribute('data-card');ghost.removeAttribute('data-area');ghost.removeAttribute('draggable');
  ghost.setAttribute('aria-hidden','true');ghost.inert=true;ghost.classList.add('fx-ghost');
  Object.assign(ghost.style,{left:saved.rect.x+'px',top:saved.rect.y+'px',width:saved.rect.width+'px',height:saved.rect.height+'px',opacity:'0',animation:'none',transition:'none'});
  document.body.append(ghost);departures.add(ghost);
  const animation=ghost.animate([{opacity:.7,transform:'scale(1)'},{opacity:0,transform:'scale(.7) translateY(20px)',filter:'grayscale(1)'}],{duration:duration*.8,fill:'both'});
  animation.onfinish=()=>{departures.delete(ghost);ghost.remove();};
 }
}
function mergedCards(before,s){return [...s.hand,...(s.pendingTriples||[]).map(x=>x.card)].filter(c=>c.golden&&!before.units.has(c.uid)&&[...before.units.values()].some(x=>x.id===c.id&&!x.golden));}
const hasTriple=(before,s)=>mergedCards(before,s).length>0;
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function fly(saved,target,duration=560){
 if(!saved||!target||reduced())return;
 const rect=target.getBoundingClientRect(),ghost=saved.node;
 ghost.querySelectorAll('.fx-number').forEach(x=>x.remove());ghost.removeAttribute('data-card');ghost.removeAttribute('data-area');ghost.inert=true;ghost.setAttribute('aria-hidden','true');ghost.classList.add('fx-ghost');
 Object.assign(ghost.style,{position:'fixed',left:saved.rect.x+'px',top:saved.rect.y+'px',width:saved.rect.width+'px',height:saved.rect.height+'px',opacity:'0',animation:'none',transition:'none',zIndex:35});document.body.append(ghost);departures.add(ghost);
 const animation=ghost.animate([{opacity:.9,transform:'translate(0,0) scale(1)'},{opacity:0,transform:`translate(${rect.x+rect.width/2-saved.rect.x-saved.rect.width/2}px,${rect.y+rect.height/2-saved.rect.y-saved.rect.height/2}px) scale(.2)`}],{duration,easing:'ease-in',fill:'both'});
 animation.onfinish=()=>{departures.delete(ghost);ghost.remove();};
}
async function triples(before,s){
 for(const c of mergedCards(before,s)){const target=document.querySelector(`.card[data-area="hand"][data-card="${c.uid}"]`)||document.querySelector(`[data-pending-triple="${c.uid}"]`);const current=new Set([...s.hand,...s.board,...s.shop].map(c=>c.uid));let count=0;
 for(const [key,saved] of before.dom){const old=before.units.get(+key.split(':')[1]);if(old?.id===c.id&&!old.golden&&!current.has(old.uid)&&count++<3)fly(saved,target);}
 motion(target,[{filter:'brightness(2)',transform:'scale(.85)'},{filter:'brightness(1.7)',transform:'scale(1.12)',offset:.7},{filter:'brightness(1)',transform:'scale(1)'}],680);float(target,s.hand.some(x=>x.uid===c.uid)?'三连 · 金色回手':'三连 · 暂存','resource',800);}
 await pause(reduced()?120:720);
}
async function endStep(before,s,frame){
 const source=document.querySelector(`.card[data-area="board"][data-card="${frame.source}"]`);if(source)motion(source,[{filter:'brightness(1)'},{filter:'brightness(1.8)',offset:.4},{filter:'brightness(1)'}],500);
 for(const f of (s.feasts||[]).slice(before.feasts)){const target=document.querySelector(`.card[data-area="board"][data-card="${f.source}"]`);fly(before.dom.get('shop:'+f.food.uid),target,620);float(target,'吞噬','gain',700);}
 await pause(reduced()?100:760);
}
root.TavernFX={capture,captureDOM,recruit,battle,reset,hasTriple,triples,endStep};
})(window);
