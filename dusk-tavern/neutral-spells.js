(function(root){
'use strict';
function apply(D,I){
 const rows=[
  ['smallWard',1,1,'buff',true,1,2,'使一个友方随从永久 +1/+2。'],
  ['tierBlessing',2,2,'tierBuff',true,0,0,'使一个友方随从永久获得等同当前酒馆星级的攻击与生命。'],
  ['grandBlessing',6,4,'buff',true,4,4,'使一个友方随从永久 +4/+4，重复 5 次。'],
  ['battleChorus',2,1,'teamBuff',false,2,0,'使所有友方随从永久 +2 攻击。'],
  ['teamFeast',4,3,'teamBuff',false,3,3,'使所有友方随从永久 +3/+3。'],
  ['menagerieBlessing',5,4,'menagerieBuff',false,12,12,'每个非中立种族随机选择一个友方随从，使其永久 +12/+12。'],
  ['marketMeal',3,2,'marketBuff',false,4,4,'使当前商店中的所有随从 +4/+4。'],
  ['marketLegacy',5,3,'tavernSpell',false,3,3,'本局当前与未来商店随从永久 +3/+3。'],
  ['recruitNovice',1,2,'randomRecruit',false,0,0,'获得一个本局牌池中的随机 1 星随从。'],
  ['seekRecruit',4,3,'discoverSpell',false,0,0,'发现一个恰好等于当前酒馆星级的随从。'],
  ['mirrorRecruit',5,4,'copyRecruit',true,0,0,'获得一个友方随从的普通基础复制。']
 ];
 for(const [id,tier,cost,effect,target,attack,health,text]of rows){const c={...I.cards[id],id,type:'spell',tribe:'neutral',poolTribe:'neutral',tier,cost,effect,target,attack,health,text,keywords:[]};D.spells.push(c);D.byId[id]=c;}
 for(const id of ['recruitNovice','seekRecruit'])Object.assign(D.byId[id],{discoverKind:'minion',exactTier:true,related:[{pool:'functionalDiscover',when:id==='seekRecruit'?'从以下同星随从中发现':'从以下 1 星随从中随机获得'}]});
 D.byId.recruitNovice.fixedTier=1;D.byId.grandBlessing.buffRepeats=5;
 const previousPool=D.discoveryPool;D.discoveryPool=(s,d)=>d.discoverKind==='minion'?D.cards.filter(c=>!c.retired&&c.tier===(d.fixedTier||s.tier)&&(c.tribe==='neutral'||(s.activeTribes||D.tribeIds.slice(0,6)).includes(c.poolTribe||c.tribe))):previousPool(s,d);
 D.discoverLabels.minion='同星随从';D.neutralSpellExpansionIds=rows.map(r=>r[0]);D.functionalSpellIds.push('recruitNovice','seekRecruit','mirrorRecruit');
 return D;
}
root.TavernNeutralSpells={apply};if(typeof module!=='undefined')module.exports={apply};
})(typeof globalThis!=='undefined'?globalThis:this);
