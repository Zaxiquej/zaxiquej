(function(root){
 'use strict';
 const has=(a,...ids)=>(a.ids||[]).some(id=>ids.includes(id));
 const modal=a=>a.kind==='mode'||a.mode||a.modeBranches||a.kind==='alternate';
 const order={'入场曲':0,'进化时':1,'超进化时':2,'攻击时':3,'交战时':3,'自己的回合结束时':4,'谢幕曲':5};
 const earlier=(a,b)=>order[a.trigger]!=null&&order[b.trigger]!=null&&order[a.trigger]<order[b.trigger];
 const text=a=>a.bodyText||a.text||'';
 const hand=a=>has(a,'tokenHand','commonSupply','treasureSupply','coinSupply','crystalHandSupply','experimentSupply','fusionArtifactHand','artifact','coreSupply','corePair')&&/加入手牌/.test(text(a));
 const board=a=>has(a,'summon','tokenSummon','mixedSummon','crystalHandSummon','experimentSummon','fusionArtifactSummon','artifactCopy','reanimate','recruit')&&/召唤/.test(text(a));
 const artifact=t=>t.type!=='amulet'&&(t.tribe==='创造物'||t.tribeId===14||/创造物/.test(t.name||''));
 function links(a,b){
  if(modal(a)||modal(b))return [];
  const result=new Set();
  function directed(source,payoff){
   const trigger=payoff.trigger||'',tokens=source.tokens||[];
   if(hand(source)&&tokens.some(t=>t.cost<=1)&&payoff.condition==='combo'&&earlier(source,payoff))result.add('cheapCardsCombo');
   if(has(source,'bounce')&&payoff.condition==='combo'&&earlier(source,payoff))result.add('returnCombo');
   if(hand(source)&&tokens.some(t=>t.type==='spell')&&(trigger==='魔力增幅时'||has(payoff,'spellboostDiscount','spellboostGrowth')))result.add('spellSupplyBoost');
   if(has(source,'heal')&&/^自己的主战者(?:回复|恢复)/.test(trigger))result.add('healingEngine');
   if(has(source,'allyPing','allBoardDamage')&&/^(?:本随从|自己的随从)受到伤害且没被破坏时/.test(trigger))result.add('damageSurvival');
   if(has(source,'earth')&&payoff.condition==='earth'&&earlier(source,payoff))result.add('earthReserve');
   if(has(source,'grave')&&payoff.condition==='necromancy'&&earlier(source,payoff))result.add('graveReserve');
   if(hand(source)&&tokens.some(artifact)&&has(payoff,'artifactCopy')&&earlier(source,payoff))result.add('handArtifactDeploy');
   if(board(source)&&has(payoff,'teamBuff')&&earlier(source,payoff))result.add('armyThenBuff');
   if(board(source)&&/自己的.*进入战场时/.test(trigger)){
    const named=trigger.match(/『([^』]+)』/);
    const matched=named?tokens.some(t=>t.name===named[1]):trigger.includes('创造物')?tokens.some(artifact):trigger.includes('士兵')?tokens.some(t=>t.tribeId===2):trigger.includes('海洋')?tokens.some(t=>t.tribeId===17):trigger.includes('巨像')?tokens.some(t=>t.tribeId===12):trigger.includes('亡者')?tokens.some(t=>t.tribeId===6):/自己的(?:其他)?随从进入战场时/.test(trigger);
    if(matched)result.add('matchingEntryEngine');
   }
  }
  directed(a,b);directed(b,a);return [...result];
 }
 function weight(abilities,candidate){
  // Preference only: no extra abilities, no price reduction or guaranteed pair.
  let best=1;
  for(const a of abilities)if(links(a,candidate).length)best=Math.max(best,2.4);
  return best;
 }
 const api={links,weight};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SVWBCombinations=api;
})(typeof globalThis!=='undefined'?globalThis:this);
