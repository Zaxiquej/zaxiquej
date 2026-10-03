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
 function targetFollowups(base,ctx){
  // One selection, several operations on that exact follower. Keep the chain
  // in one sentence so display sorting cannot separate a pronoun from its target.
  const {cls,rarity,trigger,effectCost,maxPrice,minRaw=0,maxAtoms=Infinity,simple=false,available=()=>true}=ctx;
  if(simple||rarity<2||base.ids.length!==1||maxAtoms<2||
   !['入场曲','法术','进化时','超进化时','爆能强化','启动'].includes(trigger)||
   !base.text.startsWith('选择对手的战场上的1个随从，'))return [];
  const variants=[];
  function offer(id,tail,extraRaw,detail={}){
   if(!available(id))return;
   const raw=base.raw+extraRaw;
   if(raw>maxPrice+1e-8||raw<minRaw)return;
   variants.push({...base,ids:[...base.ids,id],raw,text:base.text.replace(/。$/,'，')+tail,
    components:[{id:base.ids[0],text:base.text,raw:base.raw},{id,text:tail,raw:extraRaw}],
    targetChain:{baseId:base.ids[0],followupId:id,baseRaw:base.raw,extraRaw,targetCount:1,...detail}});
  }
  if(base.ids[0]==='destroy'&&cls===5){
   // A chosen, visible card is more valuable than a random hidden copy.
   offer('capturedCopy','将1张与该随从同名的卡牌加入自己的手牌。',3.4);
   const discount=effectCost>=7?2:effectCost>=5?1:0;
   if(discount&&maxAtoms>=3&&available('acquisitionDiscount')){
    const before=variants.length;
    offer('capturedCopy',`将1张与该随从同名的卡牌加入自己的手牌，并使其费用-${discount}。`,3.4+discount*1.25,{discount});
    if(variants.length>before){
     const v=variants[variants.length-1];v.ids.push('acquisitionDiscount');
     v.acquisitionDiscount={source:'obtain',count:1,discount,condition:'none',factor:1,baseRaw:base.raw+3.4,extraRaw:discount*1.25};
     v.components[1]={id:'capturedCopy',text:'将1张与该随从同名的卡牌加入自己的手牌。',raw:3.4};
     v.components.push({id:'acquisitionDiscount',text:`使其费用-${discount}。`,raw:discount*1.25});
    }
   }
  }
  if(base.ids[0]==='silence'&&[3,7].includes(cls)){
   const evolved=['进化时','超进化时'].includes(trigger);
   const cap=Math.min(10,effectCost+1+(evolved?1:0),Math.floor((maxPrice-base.raw-.6)/1.25));
   const floor=evolved?Math.max(2,Math.min(8,effectCost+1)):effectCost>=7?4:effectCost>=4?3:2;
   // The premium pays for bypassing defensive text before resolving damage.
   for(const damage of [...new Set([floor,Math.min(cap,floor+2),cap])])
    if(damage>=floor&&damage<=cap)offer('damage',`对其造成${damage}点伤害。`,damage*1.25+.6,{damage,interactionPremium:.6});
  }
  return variants;
 }
 const api={links,weight,targetFollowups};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SVWBCombinations=api;
})(typeof globalThis!=='undefined'?globalThis:this);
