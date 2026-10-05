'use strict';
const A=require('node:assert/strict'),D=require('./data'),E=require('./engine'),AI=require('./ai');
const state=(hero='dragon')=>E.create(hero,1771,'hard',['dragon','haven','night','rune']);
for(let tier=1;tier<=6;tier++)for(const doubled of [false,true]){
 const s=state();s.tier=tier;s.hand=[E.make(s,'seekRecruit')];s.heroSpellCopy=doubled;
 A(E.act(s,'play',{uid:s.hand[0].uid}).ok);A.equal(s.discover.length,doubled?2:1);
 for(const q of s.discover)A(q.options.length&&q.options.every(id=>D.byId[id].tier===tier));
}
{
 const s=state();s.tier=4;delete s.discoveryRulesVersion;
 s.discover=[{type:'minion',source:'spell',spell:'seekRecruit',title:'旧奖励',text:'高一星',options:['neutral4']}];
 A(E.validate(s));E.normalize(s);A(s.discover[0].options.every(id=>D.byId[id].tier===4));A(E.validate(s));
 A(!E.act(s,'choose',{id:'neutral4'}).ok);
}
console.log('PASS 冒险之梦六个星级、双重施放与旧奖励均只能获得同星随从');
A.equal(state('night').armor,12);
for(let tier=1;tier<=6;tier++){
 const s=state();s.tier=tier;s.gold=1;
 A(E.act(s,'power').ok);A.equal(s.gold,0);A.equal(E.refreshCost(s),0);
 const restored=E.normalize(JSON.parse(JSON.stringify(s)));A(E.validate(restored));
 A(E.act(restored,'refresh').ok);A.equal(restored.gold,0);A.equal(restored.goldSpentThisRound,1);
 A.equal(D.byId[restored.shop[0].id].tier,Math.min(6,tier+1));A.equal(E.refreshCost(restored),1);
 A(!E.act(restored,'refresh').ok);restored.gold=1;A(E.act(restored,'refresh').ok);A.equal(restored.gold,0);
}
{
 const s=state();A(E.act(s,'power').ok);s.round++;E.startRound(s);A.equal(E.refreshCost(s),1);
}
console.log('PASS 露娜 12 甲；罗文一次免费刷新、零金币使用、存档与到期');
for(const d of D.amulets.filter(c=>c.tier<=3)){
 A.equal(d.count,2,d.id);const s=state();s.hand=[E.make(s,d.id)];A(E.act(s,'play',{uid:s.hand[0].uid}).ok);
 A.equal(s.amulets[0].count,2);E.endRecruit(s);A.equal(s.amulets[0].count,1);
 s.recruitEnded=false;E.endRecruit(s);A.equal(s.amulets.length,0,d.id);
}
A.deepEqual(D.amulets.filter(d=>d.count===1).map(d=>d.id),['hourglass','boneRing','summit']);
console.log('PASS 前期护符实际放置为吟唱 2、两次自然结算归零；三张高星护符保留吟唱 1');
{
 const s=state(),o=s.opponents[0];s.round=4;
 Object.assign(o,{hero:'dragon',tribe:'dragon',tier:3,gold:1,powerUsed:false,board:[],hand:[],shop:[],amulets:[],discover:[],progress:{}});
 AI.prepare(s,o,E,{started:true,bonusGold:false,deferEnd:true});
 A(o.powerUsed);A.equal(o.aiSummary.goldSpent,1);A.equal(o.aiSummary.refreshes,1);A.equal(o.gold,0);A.equal(D.byId[o.shop[0].id].tier,4);
}
console.log('PASS 固定罗文招募场景正确消费 1 金币技能并免费刷新；未模拟完整 AI 对局');
