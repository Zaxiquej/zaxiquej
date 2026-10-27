(function(root){
  'use strict';
  const source='https://shadowverse-wb.com/chs/cards/pack/deicide-in-nacreheim/';
  // Confirmed against the complete official Portal snapshot, 2026-10-27.
  // Keep the module/global name for existing browser and inspector consumers.
  const evidence={id:90001210,name:'神域的物证',class:0,type:'amulet',cost:1,attack:0,health:0,tribe:'证据',text:'【证据】\n费用1【启动】抽取1张卡牌。使自己的战场上的证据-1。'};
  const rabbit={id:90061140,name:'地害之兔',class:6,type:'follower',cost:2,attack:1,health:1,text:'本随从进入战场时，使自己的手牌中的随机1张费用最小的卡牌消失。本随从进化。\n【谢幕曲】对对手的主战者造成2点伤害。',previewValue:{hand:3,summon:6.4},entryStats:6,entryAttack:3,entryHealth:3,entryEvolves:true};
  const tokens=[evidence,rabbit];
  const effects=[
    {id:'evidenceHand',price:1.3,weight:3,classes:[],max:2,text:n=>`将${n}张『${evidence.name}』加入手牌。`},
    {id:'evidenceSummon',price:2.2,weight:3,classes:[],max:2,text:n=>`召唤${n}张『${evidence.name}』。`},
    {id:'rabbitSummon',price:6.4,weight:3,classes:[6],exclusive:true,max:3,text:n=>`召唤${n}个『${rabbit.name}』。`},
    {id:'rabbitHand',price:3,weight:2,classes:[6],exclusive:true,max:2,text:n=>`将${n}张『${rabbit.name}』加入手牌。`}
  ];
  effects.push({id:'ghostSummon',price:3.6,weight:2,classes:[5],exclusive:true,max:3,text:n=>`召唤${n}个『怨灵』。`});
  const swap=(attack,health,gain=0)=>({attack:health+gain,health:attack});
  function projections(attack,health,gain,activations=3){
    const states=[{attack,health}];
    for(let i=0;i<activations;i++)states.push(swap(states[i].attack,states[i].health,gain));
    return states;
  }
  function quality(card){
    // Swapping a zero attack into health is not a usable hand-growth design.
    return !card.abilities.some(a=>a.evidenceSwap)||card.attack>0;
  }
  function affinity(abilities,ids,emblems=[]){
    const prior=[...abilities.flatMap(a=>a.ids||[]),...emblems.flatMap(e=>[e.eventId,...(e.supportTags||[]),...(e.effects||[]).map(p=>p.id)])];
    if(ids.includes('evidenceHand')&&prior.some(id=>/^rabbit/.test(id)))return 4;
    if(ids.some(id=>['evidenceHand','evidenceSummon'].includes(id))&&prior.some(id=>['evidenceSwap','evidenceLink','ownBanish','activate','amuletFusion','evidenceDiscard','oneCostBoard'].includes(id)))return 3;
    if(ids.some(id=>/^rabbit/.test(id))&&prior.some(id=>/^rabbit|^evidenceHand/.test(id)))return 2.2;
    return 1;
  }
  evidence.previewValue={hand:1.3,summon:2.2};
  // Events, targets and payloads are independent: these are not fixed card suites.
  const events={
    3:{id:'activate',text:'自己【启动】护符时',expected:2.4,allowed:['damage','heal','allyBuff','boost','earth','draw']},
    7:{id:'amuletFusion',text:'自己【融合】护符时',expected:2,allowed:['damage','aoe','destroy','heal','grave']}
  };
  function gate(cls,roll,trigger){
    if(!['入场曲','法术','进化时','超进化时'].includes(trigger))return null;
    if(cls===1){const n=roll<.65?2:3;return {id:'oneCostBoard',requirement:n,text:`若自己的战场上的${trigger==='法术'?'':'其他'}原始费用为1的卡牌的张数为${n}张或以上，则`,factor:n===2?.74:.6,extra:0,minRaw:2};}
    if(cls===2||cls===3)return {id:'activationHistory',text:`若本回合中自己【启动】过${cls===2?'证据·':''}护符，则`,factor:.78,extra:0,minRaw:2};
    return null;
  }
  const api={source,evidence,rabbit,tokens,effects,events,gate,swap,projections,quality,affinity};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SVWBPreview=api;
})(typeof globalThis!=='undefined'?globalThis:this);
