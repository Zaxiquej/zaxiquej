// Compile auditable priors from the downloaded official snapshot, not generated cards.
const fs=require('node:fs');
const reference=require('./reference.json');
const keywords=['守护','突进','疾驰','毁灭','虹吸','潜行','威慑','灵气','屏障'];
const triggers=['入场曲','进化时','超进化时','谢幕曲','攻击时','爆能强化','启动'];
const patterns={draw:/抽取(\d+)张(?:卡牌|随从|法术|护符)/g,heal:/回复自己的主战者(\d+)点生命值/g,buff:/本随从\+(\d+)\/\+\d+/g,allyBuff:/使其\+(\d+)\/\+\d+/g,boost:/发动(\d+)次魔力增幅/g,earth:/土之印\+(\d+)/g,grave:/墓场\+(\d+)/g,tokenHand:/将(\d+)张『/g,tokenSummon:/召唤(\d+)个『/g,reanimate:/【亡者召还 (\d+)】/g,combo:/【连击 (\d+)】/g,necromancy:/【唤灵 (\d+)】/g};
const band=c=>c<=3?0:c<=6?1:2;
const followers=reference.cards.filter(c=>c.type===1&&!c.token);
// Include enabling spells/amulets in the audit, not just follower keywords.
const mechanismRules={ward:[6,/拥有【守护】/],amulet:[6,/护符|吟唱/],artifactCopy:[7,/手牌中的.*创造物.*复制随从/],artifact:[7,/创造物/],lowHealth:[5,/生命值为\d+或以下/],selfDamage:[5,/对自己的主战者造成/],rally:[2,/【协作/],spellboost:[3,/魔力增幅/],earth:[3,/土之/],ramp:[4,/能量点最大值\+\d/]};
const mechanisms=Object.fromEntries(Object.entries(mechanismRules).map(([id,[cls,re]])=>{
 const cards=reference.cards.filter(c=>!c.token&&c.class===cls&&re.test(c.text));
 return [id,{class:cls,followers:cards.filter(c=>c.type===1).length,cards:cards.map(c=>({id:c.id,name:c.name,type:c.type,cost:c.cost,text:c.text,url:`https://shadowverse-wb.com/chs/deck/cardslist/card/?card_id=${c.id}`}))}];
}));
const allRows=reference.cards.filter(c=>!c.token).map(c=>{
 const lines=c.text.split(/\n+/),ks=keywords.filter(k=>lines.some(line=>/^(?:【(?:守护|突进|疾驰|毁灭|虹吸|潜行|威慑|灵气|屏障)】\s*)+$/.test(line)&&line.includes(`【${k}】`)));
 const ts=triggers.filter(t=>new RegExp('(?:^|\\n)(?:费用\\d+)?【'+t).test(c.text));
 const values=[];
 let trigger='其他',effectCost=c.cost;
 const add=(kind,n,trigger)=>{n=Number(n);if(n>=1&&n<=30)values.push({kind,n,trigger,cost:effectCost});};
 for(const line of lines){
  const header=line.replace(/^费用\d+/,'').match(/^【(入场曲|进化时|超进化时|谢幕曲|攻击时|爆能强化|启动)/);
  if(header){trigger=header[1];effectCost=Number(line.match(/^【爆能强化 (\d+)】/)?.[1]||c.cost);}
  for(const [kind,re]of Object.entries(patterns))for(const m of line.matchAll(re))add(kind,m[1],trigger);
  for(const m of line.matchAll(/([^。\n]*?)造成(\d+)点伤害/g)){
   const scope=m[1];if(/自己的主战者/.test(scope)&&!/对手/.test(scope))continue;
   const kind=/所有随从/.test(scope)?'aoe':/对手的主战者/.test(scope)&&!/随从/.test(scope)?'face':'damage';add(kind,m[2],trigger);
  }
 }
 const effects=new Set(values.map(v=>v.kind));
 for(const m of c.text.matchAll(/(?:选择自己的|使自己的(?:随机)?)(\d+)张手牌[^。]*返回牌组。抽取(\d+)张卡牌/g))effects.add(Number(m[2])>Number(m[1])?'handRefill':'handCycle');
 if(/返回牌组。抽取\d+张(?:法术|护符|[^。]*·随从)/.test(c.text))effects.add('handCycleTutor');
 if(/所有手牌返回牌组。抽取X张卡牌/.test(c.text))effects.add('handRefresh');
 if(c.type===1&&new RegExp('召唤\\d+个『'+c.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'』').test(c.text))effects.add('selfCopy');
 for(const [id,re]of Object.entries({splitDamage:/分配\d+点伤害/,grantRush:/使其获得【突进】/,grantWard:/使其获得【守护】/,grantBarrier:/使其获得【屏障】/,recruit:/召唤.*牌组.*随从/,boardWipe:/破坏战场上的所有随从/}))if(re.test(c.text))effects.add(id);
 const systemEffects={wardSearch:/抽取.*守护|牌组.*守护/,wardBuff:/拥有【守护】.*\+/,amuletSearch:/抽取\d+张护符/,amuletRecruit:/召唤.*牌组.*护符/,amuletRevive:/召唤.*被破坏.*护符/,amuletBreak:/破坏自己的.*护符/,artifactCopy:/手牌中的.*创造物.*复制随从/,artifactBuff:/所有创造物.*\+/,bloodDraw:/抽取.*对自己的主战者造成/,missingHealthDamage:/生命值为\d+或以下/};
 for(const [id,re]of Object.entries(systemEffects))if(re.test(c.text))effects.add(id);
 for(const [kind,re]of Object.entries({destroy:/选择对手[^。\n]*随从[^。\n]*破坏|破坏对手[^。\n]*随从/,banish:/对手[^。\n]*随从[^。\n]*消失/,keywordSearch:/从自己的牌组[^。\n]*拥有【|抽取\d+张拥有【/,typeSearch:/抽取\d+张(?:随从|法术|护符)/,teamBuff:/所有随从\+\d/,bounce:/自己的[^。\n]*返回手牌/,enemyBounce:/对手的[^。\n]*返回手牌/,ramp:/能量点最大值\+\d/,amulet:/倒计数-\d/,artifact:/『解析的创造物』[^。\n]*加入手牌/,crystalHandSummon:/召唤\d+个『天晶魔手』/,crystalHandSupply:/将\d+张『天晶魔手』加入手牌/,crystalHandBuff:/所有『天晶魔手』\+\d/}))if(re.test(c.text))effects.add(kind);
 return {id:c.id,type:c.type===1?'follower':c.type===4?'spell':'amulet',cost:c.cost,band:band(c.cost),class:c.class,rarity:c.rarity-1,keywords:ks,triggers:ts,values,effects:[...effects]};
});
const rows=allRows.filter(c=>c.type==='follower');
const rate=(rs,test)=>rs.filter(test).length/Math.max(1,rs.length);
function compileProfiles(rows){
const profiles={};
for(let b=0;b<3;b++)for(let cls=0;cls<8;cls++)for(let rarity=0;rarity<4;rarity++){
 const br=rows.filter(c=>c.band===b),cr=br.filter(c=>c.class===cls),rr=br.filter(c=>c.rarity===rarity);
 const estimate=test=>{
  const base=(br.filter(test).length+rate(rows,test)*8)/(br.length+8);
  return +(base*.45+(cr.filter(test).length+base*12)/(cr.length+12)*.35+(rr.filter(test).length+base*18)/(rr.length+18)*.2).toFixed(5);
 };
 const keywordCounts=Array.from({length:4},(_,n)=>estimate(c=>Math.min(3,c.keywords.length)===n));
 const effectKinds=[...new Set(rows.flatMap(c=>c.effects))];
 profiles[`${b}:${cls}:${rarity}`]={keywordCounts,keywords:Object.fromEntries(keywords.map(k=>[k,estimate(c=>c.keywords.includes(k))])),triggers:Object.fromEntries(triggers.map(t=>[t,estimate(c=>c.triggers.includes(t))])),effects:Object.fromEntries(effectKinds.map(k=>[k,estimate(c=>c.effects.includes(k))]))};
}
return profiles;
}
const profiles=compileProfiles(rows);
// Printed-cost priors exclude tokens and costs outside the engine's 0–10 range.
const costPriors=Object.fromEntries(['follower','spell','amulet'].map(type=>{
 const histogram=Array(11).fill(0);
 allRows.filter(c=>c.type===type&&c.cost<=10).forEach(c=>histogram[c.cost]++);
 return [type,histogram];
}));
const excludedCosts=allRows.filter(c=>c.cost>10).map(c=>({id:c.id,type:c.type,cost:c.cost}));
// Nearby printed costs and matching timings dominate; other costs provide a small
// prior when examples are sparse. Counts describe literal effects, not arbitrary numbers.
const kinds=[...Object.keys(patterns),'damage','face','aoe'];
function compileQuantities(rows){
const quantities={};
for(const kind of kinds){
 quantities[kind]={};
 const samples=rows.flatMap(c=>c.values.filter(v=>v.kind===kind));
 for(let cost=1;cost<=10;cost++){
  quantities[kind][cost]={};
  for(const trigger of [...triggers,'其他']){
   const hist=Array(31).fill(.04);
   for(const s of samples){const distance=Math.abs(Math.min(10,s.cost)-cost);hist[s.n]+=Math.exp(-distance/1.6)*(s.trigger===trigger?1:.3);}
   quantities[kind][cost][trigger]=hist.map(x=>+x.toFixed(4));
  }
 }
}
return quantities;
}
const quantities=compileQuantities(rows);
const typeProfiles=Object.fromEntries(['spell','amulet'].map(t=>[t,compileProfiles(allRows.filter(c=>c.type===t))]));
const typeQuantities=Object.fromEntries(['spell','amulet'].map(t=>[t,compileQuantities(allRows.filter(c=>c.type===t))]));
const amulets=reference.cards.filter(c=>!c.token&&[2,3].includes(c.type));
const faithIds=[...new Set(reference.specialEffects.filter(e=>e.type===4).flatMap(e=>e.sourceCardIds))].filter(id=>followers.some(c=>c.id===id));
const typeAudit={source:reference.source,retrieved:reference.retrieved,counts:Object.fromEntries(['follower','spell','amulet'].map(t=>[t,allRows.filter(c=>c.type===t).length])),faithFollowerIds:faithIds,selfCopyIds:rows.filter(c=>c.effects.includes('selfCopy')).map(c=>c.id),stormFollowerIds:rows.filter(c=>c.keywords.includes('疾驰')).map(c=>c.id),amulets:{countdown:amulets.filter(c=>c.type===3).length,activation:amulets.filter(c=>c.text.includes('【启动】')).length,selfDestruct:amulets.filter(c=>/【启动】破坏本卡牌/.test(c.text)).length},cards:reference.cards.filter(c=>!c.token&&c.type!==1).map(c=>({id:c.id,name:c.name,class:c.class,cost:c.cost,type:c.type,text:c.text}))};
fs.writeFileSync(__dirname+'/card-types-audit.json',JSON.stringify(typeAudit,null,2));
const data={source:reference.source,retrieved:reference.retrieved,followers:rows.length,costPriors,excludedCosts,profiles,quantities,mechanisms:Object.fromEntries(Object.entries(mechanisms).map(([id,m])=>[id,{class:m.class,followers:m.followers,cards:m.cards.length}]))};
Object.assign(data,{typeProfiles,typeQuantities,typeStats:{counts:typeAudit.counts,faithFollowers:faithIds.length,selfCopyFollowers:typeAudit.selfCopyIds.length,amulets:typeAudit.amulets}});
fs.writeFileSync(__dirname+'/mechanisms-audit.json',JSON.stringify({source:reference.source,retrieved:reference.retrieved,mechanisms},null,2));
fs.writeFileSync(__dirname+'/calibration.js',`// Generated by calibrate.cjs from reference.json.\n(function(root){const data=${JSON.stringify(data)};if(typeof module!=='undefined'&&module.exports)module.exports=data;else root.SVWBCalibration=data;})(typeof globalThis!=='undefined'?globalThis:this);\n`);
const report={source:reference.source,retrieved:reference.retrieved,followers:rows.length,bands:[0,1,2].map(b=>{const rs=rows.filter(c=>c.band===b);return {band:['0-3','4-6','7+'][b],cards:rs.length,keywords:Object.fromEntries(keywords.map(k=>[k,rs.filter(c=>c.keywords.includes(k)).length])),anyKeyword:rs.filter(c=>c.keywords.length).length,triggers:Object.fromEntries(triggers.map(t=>[t,rs.filter(c=>c.triggers.includes(t)).length]))};}),numericSamples:Object.fromEntries(kinds.map(k=>[k,rows.reduce((sum,c)=>sum+c.values.filter(v=>v.kind===k).length,0)]))};
fs.writeFileSync(__dirname+'/calibration-report.json',JSON.stringify(report,null,2));
console.log('Calibrated',rows.length,'followers,',Object.keys(profiles).length,'class/rarity/cost profiles;',report.numericSamples);
