(function(root){
'use strict';
function apply(D,I){
 // These are actual engine triggers, not keyword matches in translated prose.
 D.lastWordEffects=['legionLast','undyingHounds','marchArmy','bellLast','tavernLast','constructPair','radiantLast','researchLast','battleBrood','fairy','skeleton','fairy2','hounds','mimi','coco','deathBlast','batDeath','analyzerDeath','artifactDeath','analyzerLast','graveLast','dragonLegacy','batNest','fairyCrown','graveLegacy','graveArmy','batCrown','scrapCrown'];
 D.endRecruitEffects=['fairyEnd','comboHarvest','buffCommander','guardSupply','shieldMarshal','tavernSupply','dragonFeast','bloodFeast','graveEnd','graveStudy','graveLord','growthSupply','studyEnd','clockSupply','prayerGiant','pactEnd','batSupply','forgeEnd','bloodGrow','bodyMend','graveFeast','blessingSupply','moduleSmith','dragonGrow','spellEnd','heroMend','prayerHealer','menagerie'];
 D.abilityIds={fanfare:[...D.fanfareIds],lastWords:D.cards.filter(c=>D.lastWordEffects.includes(c.effect)||c.id==='dragon1').map(c=>c.id),endRecruit:D.cards.filter(c=>D.endRecruitEffects.includes(c.effect)).map(c=>c.id)};
 D.discoverLabels={fanfare:'入场曲随从',lastWords:'谢幕曲随从',endRecruit:'备战结束随从',amulet:'护符'};
 D.discoveryPool=(s,d)=>{const tribes=s.activeTribes||D.tribeIds.slice(0,6),pool=d.discoverKind==='amulet'?D.amulets:D.cards;return pool.filter(c=>!c.retired&&c.tier<=s.tier&&(c.poolTribes?c.poolTribes.some(t=>tribes.includes(t)):(c.poolTribe||c.tribe)==='neutral'||tribes.includes(c.poolTribe||c.tribe))&&(d.discoverKind==='amulet'||D.abilityIds[d.discoverKind]?.includes(c.id)));};
 const rows=[
  ['pilfer',2,2,'pilfer',null,'随机偷取商店中的一个随从，保留其属性与关键词，加入手牌。商店中没有随从时不能使用。'],
  ['seekCry',3,3,'discoverSpell','fanfare','发现一个拥有入场曲的随从。来自本局牌池，不高于当前酒馆星级。'],
  ['seekLast',3,3,'discoverSpell','lastWords','发现一个拥有谢幕曲的随从。来自本局牌池，不高于当前酒馆星级。'],
  ['seekEnd',4,3,'discoverSpell','endRecruit','发现一个拥有备战结束效果的随从。来自本局牌池，不高于当前酒馆星级。'],
  ['seekAmulet',2,2,'discoverSpell','amulet','发现一张护符。来自本局牌池，不高于当前酒馆星级。'],
  ['rest',2,1,'rest',null,'为你的英雄恢复 5 生命，不超过生命上限。不恢复护甲。'],
  ['unguard',2,1,'removeGuard',null,'永久移除一个友方随从的守护。保留其属性、屏障与其他能力；之后仍可重新获得守护。只能指定具有守护的随从。']
 ];
 for(const [id,tier,cost,effect,discoverKind,text]of rows){const d={...I.cards[id],id,type:'spell',tribe:'neutral',poolTribe:'neutral',tier,cost,effect,discoverKind,text,attack:0,health:0,keywords:[],target:effect==='removeGuard'};if(discoverKind)d.related=[{pool:'functionalDiscover',when:'从以下牌池发现一张'}];D.spells.push(d);D.byId[id]=d;}
 D.functionalSpellIds=rows.map(r=>r[0]);D.rulesVersion='15.0';return D;
}
root.TavernFunctional={apply};if(typeof module!=='undefined')module.exports={apply};
})(typeof globalThis!=='undefined'?globalThis:this);
