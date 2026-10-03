(function(root){
'use strict';
function apply(D,I){
 const set=(id,fields,rule)=>Object.assign(D.byId[id],fields,{text:rule(1),goldenText:rule(2)});
 const mirror=D.byId.mirrorRecruit;mirror.retired=true;D.spells=D.spells.filter(c=>c.id!==mirror.id);D.retiredSpells.push(mirror);
 D.functionalSpellIds=D.functionalSpellIds.filter(id=>id!==mirror.id);D.neutralSpellExpansionIds=D.neutralSpellExpansionIds.filter(id=>id!==mirror.id);
 Object.assign(D.byId.mining,{cost:3,text:'金币上限 +1，从下回合起每回合多获得 1 金币。'});
 Object.assign(D.byId.mine,{text:'倒数 2。金币上限 +2，从下回合起每回合多获得 2 金币。'});
 set('neutral18',{effect:'treasureWages'},m=>`备战结束：若本回合消费过至少 8 金币，获得 ${m} 张铸币。`);
 D.byId.neutral18.related=[{id:'coin',count:1,scaleCount:true,when:'消费达到 8 金币'}];
 set('rune20',{},m=>`入场曲：发现 ${m} 张 4～6 星酒馆法术。`);D.byId.rune20.related=[{pool:'functionalDiscover',when:'发现 4～6 星法术'}];
 set('rune21',{effect:'spellReserve'},m=>`备战结束：获得 ${m} 张随机 1 星酒馆法术。本回合每使用过一种不同名法术，星级 +1（最高 6 星）。`);
 D.byId.rune21.related=[{pool:'spell',minTier:1,maxTier:6,when:'按本回合不同名法术数量决定星级'}];
 set('forest22',{},m=>`开战：自身获得「本局打出卡牌总数」×${m} 攻击与生命（仅本场）。`);
 set('forest23',{},m=>`开战：其他友方随从获得「本局打出卡牌总数」×${m} 攻击与生命（仅本场）。`);
 set('blood7',{},m=>`开战：所有友方随从获得「本局累计自伤」×${2*m} 攻击与生命（仅本场）。`);
 set('artifact7',{},m=>`开战：所有友方随从获得「残骸 ×（1 + 残骸÷20）」×${m} 攻击与生命（向下取整，仅本场）。`);
 const rows=[
  ['seekMajority','neutral',3,3,'discoverSpell','majority','发现一个你场上数量最多的种族的随从，最高为酒馆星级 +1。并列时合并这些种族。'],
  ['discardEcho','dragon',3,1,'discardEcho',null,'本回合手牌的被弃效果额外触发一次。重复施放不叠加。']
 ];
 for(const [id,tribe,tier,cost,effect,discoverKind,text]of rows){const d={...I.cards[id],id,type:'spell',tribe,tier,cost,effect,discoverKind,text,attack:0,health:0,keywords:[],target:false};if(discoverKind)d.related=[{pool:'functionalDiscover',when:'发现场上最多的种族'}];D.spells.push(d);D.byId[id]=d;}
 D.functionalSpellIds.push('seekMajority');D.discoverLabels.majority='优势种族随从';D.discoverLabels.minion='高一星随从';
 D.discoverTier=s=>Math.min(6,s.tier+1);
 D.majorityTribes=s=>{const counts=Object.fromEntries(D.tribeIds.map(t=>[t,0]));for(const c of s.board||[])for(const t of D.tribesOf(c))if(t in counts)counts[t]++;const max=Math.max(0,...Object.values(counts));return max?D.tribeIds.filter(t=>counts[t]===max):[];};
 const oldPool=D.discoveryPool;
 D.discoveryPool=(s,d)=>{
  const active=s.activeTribes||D.tribeIds,available=c=>!c.retired&&(c.tribe==='neutral'||D.tribesOf(c).some(t=>active.includes(t))),top=D.discoverTier(s);
  if(d.discoverKind==='highSpell')return D.spells.filter(c=>available(c)&&c.tier>=4&&c.tier<=6);
  if(d.discoverKind==='majority'){const tribes=D.majorityTribes(s);return D.cards.filter(c=>available(c)&&c.tier<=top&&D.tribesOf(c).some(t=>tribes.includes(t)));}
  if(d.discoverKind==='graveDiscovery')return D.cards.filter(c=>available(c)&&c.tier<=top&&D.abilityIds.lastWords.includes(c.id));
  if(d.discoverKind==='royal')return D.cards.filter(c=>available(c)&&c.tier<=top&&D.isTribe(c,'royal'));
  if(['fanfare','lastWords','endRecruit'].includes(d.discoverKind))return D.cards.filter(c=>available(c)&&c.tier<=top&&D.abilityIds[d.discoverKind].includes(c.id));
  if(d.discoverKind==='minion'&&!d.fixedTier)return D.cards.filter(c=>available(c)&&c.tier===top);
  return oldPool(s,d);
 };
 for(const id of ['seekCry','seekLast','seekEnd'])D.byId[id].text='发现一个拥有'+D.discoverLabels[D.byId[id].discoverKind].replace('随从','')+'的随从，最高为酒馆星级 +1。';
 D.byId.seekRecruit.text='发现一个比酒馆高 1 星的随从（最高 6 星）。';
 set('night11',{},m=>`入场曲：消耗 3 墓场，发现 ${m} 个谢幕曲随从，最高为酒馆星级 +1。`);
 set('royal21',{},m=>`入场曲：发现 ${m} 个皇家随从，最高为酒馆星级 +1。`);
 // Remove redundant pool-language in player-facing card text and generated previews.
 const clean=t=>typeof t==='string'?t.replace(/来自本局牌池[，,]?/g,'').replace(/本局牌池中的?/g,'').replace(/从本局牌池中/g,'').replace(/本局牌池/g,'').replace(/本局牌组/g,''):t;
 for(const d of [...D.cards,...D.spells,...D.amulets,...D.tokens,...D.heroes]){d.text=clean(d.text);if(d.goldenText)d.goldenText=clean(d.goldenText);for(const r of d.related||[])r.when=clean(r.when);}
 for(const id of ['ceres','windgod']){const h=D.heroes.find(h=>h.id===id);h.text=h.text.replace('最高不超过酒馆星级','最高为酒馆星级 +1').replace('不高于酒馆星级','最高为酒馆星级 +1');}
 D.endRecruitEffects=D.endRecruitEffects.filter(e=>e!=='miner');D.endRecruitEffects.push('treasureWages');D.abilityIds.endRecruit=D.cards.filter(c=>D.endRecruitEffects.includes(c.effect)).map(c=>c.id);
 D.archetypes.forest.support+=' 香风执行者将整局出牌数直接转化为全队开战属性。';
 D.archetypes.artifact.support+=' 埃亚隆支配者把残骸成长转化为全队攻击与生命。';
 D.rulesVersion='25.0';
}
root.TavernRenewal={apply};if(typeof module!=='undefined')module.exports={apply};
})(typeof globalThis!=='undefined'?globalThis:this);
