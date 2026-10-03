'use strict';
// Development-only route benchmark. Each opponent actually recruits through E.aiPrepare.
// PvP combat damage is omitted to keep all routes alive to round 16; self-harm and
// healing still apply. Combat resources and permanent ledgers settle once per match.
const fs=require('node:fs'),path=require('node:path'),E=require('./engine.js'),D=require('./data.js'),AI=require('./ai.js');
const seeds=Math.max(1,Math.min(50,Number(process.argv[2])||8));
const round2=x=>Math.round(x*100)/100,totals={},samples=[],thresholds={12:[30,50,70],16:[45,75,110]};
const sum=(a,key)=>a.reduce((n,x)=>n+(x[key]||0),0);
function settle(o,r,side){
 o.grave=r.grave[side];o.scrap=r.scrap[side];E.settleProgress(o,r.progress[side]);o.discount=(o.discount||0)+r.discount[side];o.hp=Math.min(40,o.hp+r.healing[side]);
 for(const c of o.board){const g=r.permanent[side][c.uid];if(g){c.attack+=g.attack;c.health+=g.health;}}
}
function neutralProbe(s,o,round,body){
 const x=E.copy(s),left=E.copy(o),enemy=Array.from({length:7},(_,i)=>E.make(x,'neutral0',{attack:body,health:body,keywords:i===0?['shield','taunt']:i===3?['shield']:i===4?['taunt']:[]}));
 return E.combat(x,left.board,enemy,left,{tier:6}).winner===0?1:0;
}
function lateMatchups(entries){
 entries.forEach(e=>e.late={wins:0,draws:0,games:0});
 for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++){
  const a=entries[i],b=entries[j],r=E.combat(E.copy(a.s),a.o.board,b.o.board,a.o,b.o);a.late.games++;b.late.games++;
  if(r.winner===0)a.late.wins++;else if(r.winner===1)b.late.wins++;else{a.late.draws++;b.late.draws++;}
 }
}
function capture(entry,round){
 const {s,o}=entry,key=o.tribe+':'+o.route,probe=thresholds[round].map(body=>neutralProbe(s,o,round,body)),row={seed:entry.seed,round,tribe:o.tribe,route:o.route,routeName:D.archetypes[o.tribe].routes[o.route][0],tier:o.tier,cardTier:sum(o.board.map(c=>D.byId[c.id]),'tier')/Math.max(1,o.board.length),boardSize:o.board.length,body:sum(o.board,'attack')+sum(o.board,'health'),golden:o.board.filter(c=>c.golden).length,core:o.board.filter(c=>AI.plans[o.tribe][o.route].slice(0,3).includes(c.id)).length,spells:o.spells,played:o.played,grave:o.grave,scrap:o.scrap,bloodDamage:o.bloodDamage,progress:E.scaling.read(o),pvpWins:entry.wins,pvpGames:entry.games,lateWins:entry.late.wins,lateDraws:entry.late.draws,lateGames:entry.late.games,probes:probe,board:o.board.map(c=>({id:c.id,attack:c.attack,health:c.health,golden:c.golden})),hand:o.hand.map(c=>c.id),trinkets:o.trinkets,aiSummary:o.aiSummary};
 samples.push(row);const k=round+':'+key;if(!totals[k])totals[k]={n:0,round,tribe:o.tribe,route:o.route,routeName:row.routeName,tier:0,cardTier:0,boardSize:0,body:0,golden:0,core:0,spells:0,played:0,grave:0,scrap:0,bloodDamage:0,fairy:0,arms:0,prayers:0,pvpWins:0,pvpGames:0,lateWins:0,lateDraws:0,lateGames:0,probes:[0,0,0]};const t=totals[k];t.n++;for(const p of ['tier','cardTier','boardSize','body','golden','core','spells','played','grave','scrap','bloodDamage','pvpWins','pvpGames','lateWins','lateDraws','lateGames'])t[p]+=row[p];for(const p of ['fairy','arms','prayers'])t[p]+=row.progress[p];probe.forEach((v,i)=>t.probes[i]+=v);
}
for(let seed=0;seed<seeds;seed++){
 const entries=[];
 for(let ti=0;ti<D.tribeIds.length;ti++)for(let route=0;route<2;route++){
  const tribe=D.tribeIds[ti],offset=seed%7+1,pool=[tribe];for(let j=0;pool.length<4;j++){const t=D.tribeIds[(ti+offset+j)%8];if(!pool.includes(t))pool.push(t);}
  const s=E.create(tribe,917931+seed*7919+ti*181,'normal',pool),o=s.opponents[0];o.hero=tribe;o.armor=D.heroes.find(h=>h.id===tribe).armor;o.route=route;entries.push({s,o,seed,wins:0,games:0});
 }
 let order=entries.map((_,i)=>i);
 for(let round=1;round<=16;round++){
  for(const entry of entries){entry.s.round=round;E.aiPrepare(entry.s,entry.o);}
  for(let i=0;i<8;i++){
   const a=entries[order[i]],b=entries[order[15-i]],driver=E.copy(a.s),r=E.combat(driver,a.o.board,b.o.board,a.o,b.o);
   settle(a.o,r,0);settle(b.o,r,1);a.games++;b.games++;if(r.winner===0)a.wins++;else if(r.winner===1)b.wins++;
  }
  if(thresholds[round]){lateMatchups(entries);entries.forEach(e=>capture(e,round));}order=[order[0],order.at(-1),...order.slice(1,-1)];
 }
 console.log('Completed seed '+(seed+1)+'/'+seeds);
}
const aggregate=Object.values(totals).map(t=>{const out={...t};for(const key of ['tier','cardTier','boardSize','body','golden','core','spells','played','grave','scrap','bloodDamage','fairy','arms','prayers'])out[key]=round2(t[key]/t.n);out.pvpWinRate=round2(t.pvpWins/t.pvpGames);out.latePvpWinRate=round2(t.lateWins/t.lateGames);out.lateDrawRate=round2(t.lateDraws/t.lateGames);out.lateScore=round2((t.lateWins+t.lateDraws/2)/t.lateGames);out.probes=t.probes.map(n=>round2(n/t.n));return out;});
const report={rulesVersion:D.rulesVersion,method:'16 routes with a fixed base hero for each tribe, normal AI recruitment, rotating round-robin fights for 16 rounds. No PvP damage/elimination; actual self-harm/healing and combat resources/permanent growth persist. Neutral probes are separate copies with seven equal-body minions, two shields and two guards. Not a live-game win-rate claim.',seeds,thresholds,aggregate,samples};
const output=path.join(__dirname,'qa',process.argv[3]||'growth-benchmark.json');fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));
console.table(aggregate.filter(x=>x.round===16).map(x=>({tribe:x.tribe,route:x.route,tier:x.tier,cardTier:x.cardTier,body:x.body,golden:x.golden,core:x.core,spells:x.spells,army:x.fairy,arms:x.arms,prayers:x.prayers,blood:x.bloodDamage,scrap:x.scrap,pvp:x.pvpWinRate,late:x.lateScore,draw:x.lateDrawRate,probes:x.probes.join('/')})));
console.log('Saved '+output);
