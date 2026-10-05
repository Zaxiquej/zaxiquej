(function(root){
'use strict';
const E=root.TavernEngine||(typeof require!=='undefined'?require('./engine'):null),D=root.TavernData||(typeof require!=='undefined'?require('./data'):null),AI=root.TavernAI||(typeof require!=='undefined'?require('./ai'):null);
const copy=E.copy;
function shuffle(s,list){const out=[...list];for(let i=out.length-1;i>0;i--){const j=Math.floor(E.rand(s)*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
function snapshot(p){const fields=['id','name','hero','tribe','hp','armor','tier','board','hand','shop','amulets','progress','grave','scrap','spells','played','bloodDamage','gold','stats','aiSummary','wins','losses','draws','rank','eliminatedRound','ghosts'];return copy(Object.fromEntries(fields.filter(k=>p[k]!==undefined).map(k=>[k,p[k]])));}
function create(options={}){
 const seed=Number(options.seed??Date.now())>>>0,s={seed:seed||1,uid:0,round:0,activeTribes:options.tribes?[...options.tribes]:E.rollTribes(seed),opponents:[]};
 if(s.activeTribes.length!==4||new Set(s.activeTribes).size!==4||!s.activeTribes.every(t=>D.tribeIds.includes(t)))throw Error('需要四个不同的有效种族');
 const heroes=shuffle(s,D.heroes.filter(h=>!h.challenge&&E.heroAvailable(h,s.activeTribes))).slice(0,8);
 s.opponents=heroes.map((h,id)=>({id,name:h.name,hero:h.id,tribe:h.tribe==='neutral'?s.activeTribes[id%4]:h.tribe,hp:40,maxHp:40,armor:h.armor,tier:1,board:[],grave:0,spells:0,bloodDamage:0,scrap:0,progress:E.scaling.read(),wins:0,losses:0,draws:0,ghosts:0}));
 return {format:'sv-tavern-selfplay-v1',version:D.rulesVersion,seed,mode:options.mode==='challenge'?'challenge':'fair',maxRounds:Math.max(1,Math.min(100,Math.floor(options.maxRounds)||60)),state:s,history:[],status:'running',warnings:[]};
}
function pair(s,alive,history){
 let pool=shuffle(s,alive),ghostPair=null;
 if(pool.length%2){const p=[...pool].sort((a,b)=>a.ghosts-b.ghosts)[0];pool=pool.filter(x=>x!==p);const dead=s.opponents.filter(x=>x.hp<=0).sort((a,b)=>b.eliminatedRound-a.eliminatedRound);const ghost=dead.find(x=>x.id!==p.lastOpponent)||dead[0];if(ghost){const record=[...history].reverse().flatMap(r=>r.players).find(x=>x.id===ghost.id);ghostPair=[p,{...copy(record||ghost),ghost:true}];p.ghosts++;}}
 function solve(list){if(!list.length)return {cost:0,pairs:[]};const a=list[0];let best=null;for(let i=1;i<list.length;i++){const b=list[i],rest=solve(list.slice(1).filter(x=>x!==b)),cost=rest.cost+(a.lastOpponent===b.id||b.lastOpponent===a.id?1:0);if(!best||cost<best.cost)best={cost,pairs:[[a,b],...rest.pairs]};}return best;}
 return [...solve(pool).pairs,...(ghostPair?[ghostPair]:[])];
}
function settle(s,p,r,side){
 p.grave=r.grave[side];p.scrap=r.scrap[side];p.discount=(p.discount||0)+r.discount[side];E.settleProgress(p,r.progress[side]);
 for(const c of p.board){const g=r.permanent[side][c.uid];if(g){c.attack+=g.attack;c.health+=g.health;}}
 E.battleCards(s,p,r.generated[side]);
}
function step(run){
 if(run.status!=='running')return null;const s=run.state;s.round++;const alive=s.opponents.filter(p=>p.hp>0);
 for(const p of alive){const ctx={...s,opponents:s.opponents.filter(x=>x.id!==p.id)};AI.prepare(ctx,p,E,{trace:true,bonusGold:run.mode==='challenge',shopLuck:run.mode==='challenge'});s.seed=ctx.seed;s.uid=ctx.uid;
  if(![p.hp,...p.board.flatMap(c=>[c.attack,c.health])].every(Number.isSafeInteger))throw Error('数值超出安全整数范围：'+p.name+'，第 '+s.round+' 回合');
 }
 const row={round:s.round,damageCap:alive.length>4?15:null,players:alive.map(snapshot),battles:[]};
 for(const [a,b] of pair(s,alive,run.history)){
  const r=E.combat(s,a.board,b.board,a,b,{damageCap:row.damageCap,record:false});settle(s,a,r,0);if(!b.ghost)settle(s,b,r,1);
  if(r.winner===0){a.wins++;if(!b.ghost){b.losses++;E.heroDamage(b,r.damage);}}else if(r.winner===1){a.losses++;E.heroDamage(a,r.damage);if(!b.ghost)b.wins++;}else{a.draws++;if(!b.ghost)b.draws++;}
  a.lastOpponent=b.id;if(!b.ghost)b.lastOpponent=a.id;
  row.battles.push({a:a.id,b:b.id,ghost:!!b.ghost,winner:r.winner<0?null:r.winner===0?a.id:b.id,damage:r.damage,steps:r.steps,limited:r.steps>=160&&r.winner<0});
 }
 const survivors=alive.filter(p=>p.hp>0);for(const p of alive){const entry=row.players.find(x=>x.id===p.id);entry.hpAfter=p.hp;entry.armorAfter=p.armor;if(p.hp<=0){p.rank=survivors.length+1;p.eliminatedRound=s.round;}}
 run.history.push(row);
 if(survivors.length<=1){if(survivors[0])survivors[0].rank=1;run.status='complete';}else if(s.round>=run.maxRounds)run.status='round-limit';
 return row;
}
function report(run){return {format:run.format,version:run.version,seed:run.seed,mode:run.mode,maxRounds:run.maxRounds,tribes:run.state.activeTribes,status:run.status,rounds:run.state.round,players:run.state.opponents.map(snapshot).sort((a,b)=>(a.rank||0)-(b.rank||0)||b.hp-a.hp),history:copy(run.history),warnings:run.history.flatMap(r=>r.battles.filter(b=>b.limited).map(b=>'第 '+r.round+' 回合：'+(b.a+1)+'号与'+(b.b+1)+'号达到战斗步数限制，按平局处理'))};}
function run(options={},onRound=()=>{}){const s=create(options);while(s.status==='running'){const r=step(s);onRound(r,s);}return report(s);}
function aggregate(reports){const groups=new Map();for(const r of reports.filter(r=>r.status==='complete'))for(const p of r.players){const name=p.aiSummary?.buildName||p.tribe,g=groups.get(name)||{name,games:0,wins:0,top4:0,rankTotal:0,playedTotal:0};g.games++;g.wins+=p.rank===1?1:0;g.top4+=p.rank<=4?1:0;g.rankTotal+=p.rank;g.playedTotal+=r.history.reduce((n,h)=>n+(h.players.find(x=>x.id===p.id)?.played||0),0);groups.set(name,g);}return [...groups.values()].map(g=>({...g,averageRank:g.rankTotal/g.games})).sort((a,b)=>a.averageRank-b.averageRank);}
const api={create,step,report,run,aggregate,pair};root.TavernSelfplay=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
