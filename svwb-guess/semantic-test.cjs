const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const S=require('./semantics.js'),E=require('./engine.js');
let id=0;const make=(text,extra={})=>({id:++id,name:'测试',class:1,type:1,cost:4,attack:3,health:3,rarity:3,tribes:[],text,evolvedText:text,effects:[],...extra});
const samples={
  bounce:make('【超进化时】选择对手的战场上的1个随从，使其返回手牌。'),
  destroy:make('【超进化时】选择对手的战场上的1个随从，破坏该随从。'),
  banish:make('【超进化时】选择对手的战场上的1个随从，使其消失。'),
  shuffle:make('【超进化时】选择对手的战场上的1个随从，使其返回牌组。'),
  selfBounce:make('【超进化时】选择自己的战场上的1个随从，使其返回手牌。'),
  aoe:make('【超进化时】使对手的战场上的所有随从消失。'),
  ordinary:make('【进化时】选择对手的战场上的1个随从，使其消失。'),
  enter:make('【入场曲】选择对手的战场上的1个随从，使其消失。'),
  spellBanish:make('选择对手的战场上的1个随从，使其消失。',{type:4}),
  deathBanish:make('【谢幕曲】选择对手的战场上的1个随从，使其消失。'),
  superCopy:make('【超进化时】选择对手的战场上的1个随从，使其消失。'),
  damage:make('【超进化时】选择对手的战场上的1个随从，对其造成4点伤害。'),
  aoeDamage:make('【超进化时】对对手的战场上的所有随从造成4点伤害。'),
  multiDamage:make('【超进化时】选择对手的战场上的2个随从，对其造成4点伤害。'),
  conditionalDamage:make('【超进化时】若自己的战场上有超进化后的随从，则选择对手的战场上的1个随从，对其造成4点伤害。'),
  damageCopy:make('【超进化时】选择对手的战场上的1个随从，对其造成4点伤害。'),
  damageOne:make('【超进化时】选择对手的战场上的1个随从，对其造成1点伤害。'),
  damageTwo:make('【超进化时】选择对手的战场上的1个随从，对其造成2点伤害。'),
  damageThree:make('【超进化时】选择对手的战场上的1个随从，对其造成3点伤害。'),
  upgrade:make('【超进化时】选择对手的战场上的1个随从，对其造成4点伤害。【连击 3】改为对对手的战场上的所有随从造成4点伤害。'),
  unconditionalBoth:make('【超进化时】选择对手的战场上的1个随从，对其造成4点伤害。对对手的战场上的所有随从造成4点伤害。'),
  repeat:make('【入场曲】抽取2张卡牌。\n\n【进化时】发动与【入场曲】相同的能力。'),
  expanded:make('【入场曲】抽取2张卡牌。\n\n【进化时】抽取2张卡牌。'),
  repeatDamage:make('【入场曲】对对手的主战者造成2点伤害。\n\n【进化时】发动与【入场曲】相同的能力。'),
  expandedDamage:make('【入场曲】对对手的主战者造成2点伤害。\n\n【进化时】对对手的主战者造成2点伤害。'),
  selfBuff:make('【入场曲】使本随从+2/+2。'),
  allyBuff:make('【入场曲】选择自己的战场上的1个随从，使其+2/+2。'),
  handBuff:make('【入场曲】使自己的所有随从手牌+2/+2。'),
  boardBuff:make('【入场曲】使自己的战场上的所有随从+2/+2。'),
  faceDamage:make('【超进化时】对对手的主战者造成4点伤害。'),
  handBanish:make('【超进化时】选择对手的1张手牌，使其消失。'),
  draw:make('【超进化时】抽取2张卡牌。'),
  tutor:make('【超进化时】抽取2张拥有【守护】的随从。'),
  generate:make('【超进化时】将2张『妖精』加入手牌。'),
  summon:make('【超进化时】召唤2个『妖精』。'),
  reanimate:make('【超进化时】发动【亡者召还 2】。'),
  ramp:make('【入场曲】使自己的能量点最大值+1。'),
  restore:make('【入场曲】回复自己1点能量点。'),
  discount:make('【入场曲】使自己的所有手牌费用-1。'),
  heal:make('【入场曲】回复自己的主战者3点生命值。'),
  shield:make('【入场曲】使自己的主战者获得【屏障】。'),
  storm:make('【疾驰】'),rush:make('【突进】'),
  selfStorm:make('【入场曲】本随从获得【疾驰】。'),
  conditionalStorm:make('【入场曲】【解放奥义】本随从获得【疾驰】。'),
  allyStorm:make('【入场曲】选择自己的战场上的1个随从，使其获得【疾驰】。'),
  immune:make('本随从不会被能力破坏。'),passive:make('自己的随从被破坏时，抽取1张卡牌。'),
  removeWard:make('使对手的随从失去【守护】。')
};
const sem=Object.fromEntries(Object.entries(samples).map(([k,c])=>[k,S.extract(c)]));
const related=(a,b)=>S.similarity(sem[a],sem[b]);
assert.equal(S.numberSimilarity(4,4),1);
assert(S.numberSimilarity(3,4)>S.numberSimilarity(2,4));
assert(S.numberSimilarity(2,4)>S.numberSimilarity(1,4));
assert(S.numberSimilarity(10,13)>S.numberSimilarity(1,4),'The same absolute gap is larger proportionally at low amounts');
for(const a of [0,1,4,10,'X'])for(const b of [0,1,4,10,'X']){
  const score=S.numberSimilarity(a,b);assert(score>=0&&score<=1);assert.equal(score,S.numberSimilarity(b,a));
}
assert(related('bounce','banish')>.5);assert(related('destroy','banish')>related('bounce','banish'));
assert(related('bounce','shuffle')>related('bounce','banish'));
assert(related('bounce','selfBounce')>0,'Same movement retains a weaker cross-side association');
assert(related('bounce','banish')>related('bounce','selfBounce'),'Same-purpose enemy removal should be closer than self recycling');
assert.equal(related('banish','handBanish'),0,'Battlefield and hand removal are distinct');
assert.equal(related('banish','faceDamage'),0,'Face damage is not follower removal');
assert(related('destroy','damage')>0);assert(related('bounce','banish')>related('bounce','aoe'));
assert(related('damage','multiDamage')>related('damage','aoeDamage'));
assert(related('damage','damageCopy')>related('damage','conditionalDamage'));
assert(related('damage','upgrade')>related('damage','unconditionalBoth'));
assert(related('repeat','expanded')>.9,'Expanded actual effects remain the primary association');
assert(related('repeat','repeatDamage')>related('repeat','expandedDamage'),'Repeating the same trigger retains its own weaker association');
assert(related('repeat','expanded')>related('repeat','repeatDamage'),'Actual effect similarity outweighs the shared repeat wrapper');
assert.deepEqual(sem.repeat.filter(e=>e.action!=='重复触发'),sem.expanded);
assert.equal(sem.multiDamage[0].scope,'多体');assert.equal(sem.aoeDamage[0].scope,'全体');
assert.equal(sem.selfBuff[0].recipient,'本体');assert.equal(sem.allyBuff[0].recipient,'对象');
assert.equal(related('handBuff','boardBuff'),0);
assert(related('bounce','banish')>related('bounce','ordinary'));
assert(related('banish','superCopy')>related('banish','ordinary'));
assert(related('banish','ordinary')>related('banish','enter'));
assert.equal(sem.spellBanish[0].timing,'使用时');
assert.equal(sem.storm[0].timing,'常驻');
assert.equal(related('spellBanish','enter'),.9);
assert(related('spellBanish','enter')>related('spellBanish','deathBanish'));
assert(related('enter','enter')>related('spellBanish','enter'));
assert.equal(S.extract(make('',{effects:[{type:3,text:'抽取1张卡牌。'}]}))[0].timing,'使用时');
assert.equal(S.extract(make('',{type:4,effects:[{type:1,text:'自己的回合结束时，抽取1张卡牌。'}]}))[0].timing,'常驻');
assert(related('draw','tutor')>related('draw','generate'));assert(related('generate','summon')>0);
assert(related('summon','reanimate')>related('generate','summon'));
assert(related('ramp','restore')>0);assert(related('restore','discount')>0);
assert(related('heal','shield')>0);assert(related('storm','rush')>0);
assert.equal(related('storm','selfStorm'),.85,'Innate versus self-gained keywords retain a modest acquisition difference');
assert(related('storm','conditionalStorm')<related('storm','selfStorm'),'Keyword acquisition affinity must not erase unlock requirements');
assert(related('storm','conditionalStorm')>related('storm','rush'));
assert(related('storm','selfStorm')>related('storm','allyStorm'));
assert(!sem.immune.some(e=>e.action==='破坏'));assert(!sem.passive.some(e=>e.action==='破坏'));
assert(!sem.removeWard.some(e=>e.action==='守护'));
assert.equal(sem.bounce[0].object,'随从');assert.equal(sem.bounce[0].zone,'战场');
// A single operation must not be counted repeatedly against several effects.
assert(S.similarity(sem.destroy,[...sem.banish,...sem.shuffle])<Math.max(related('destroy','banish'),related('destroy','shuffle')));
for(const a of Object.values(sem))for(const b of Object.values(sem)){
  const x=S.similarity(a,b);assert(x>=0&&x<=1);assert(Math.abs(x-S.similarity(b,a))<1e-9);
  assert(Math.abs(x-S.similarity([...a].reverse(),[...b].reverse()))<1e-9);
}
const engine=E.createEngine(Object.values(samples));
assert(engine.compare(samples.storm,samples.selfStorm).skill>engine.compare(samples.storm,samples.allyStorm).skill,'Self-gained keywords are closer to innate abilities than granting them to another card');
assert(engine.compare(samples.storm,samples.selfStorm).skill>engine.compare(samples.storm,samples.conditionalStorm).skill,'Conditions must still distinguish otherwise identical self abilities');
assert(engine.compare(samples.storm,samples.storm).skill>engine.compare(samples.storm,samples.selfStorm).skill);
const drawExtra=make('【超进化时】抽取2张卡牌。回复自己的主战者2点生命值。');
const drawExtraTwo=make('【超进化时】抽取2张卡牌。回复自己的主战者2点生命值。使自己的能量点最大值+1。');
const overlapEngine=E.createEngine([samples.draw,drawExtra,drawExtraTwo]);
assert(overlapEngine.compare(samples.draw,drawExtra).skill>overlapEngine.compare(samples.draw,drawExtraTwo).skill,'Additional unrelated effects still reduce similarity');
for(const a of Object.values(samples))for(const b of Object.values(samples)){
  const x=engine.compare(a,b).score;assert(x>=0&&x<=100);assert(Math.abs(x-engine.compare(b,a).score)<1e-9);
}
const damageScores=['damageCopy','damageThree','damageTwo','damageOne'].map(key=>engine.compare(samples.damage,samples[key]));
for(let i=1;i<damageScores.length;i++){
  assert(damageScores[i-1].score>damageScores[i].score);
  assert(damageScores[i-1].skill>damageScores[i].skill);
}
assert(damageScores[0].text>damageScores[3].text,'Text matching must retain actual numeric differences');
const purpose='本体:目的:敌方解场:随从:单体';
const purposeOf=c=>new Map([[purpose,E.features(c).get(purpose)]]);
assert(E.featureSimilarity(purposeOf(samples.damage),purposeOf(samples.damageOne))<.3,'Shared removal purpose must not erase the damage amount');
assert(E.featureSimilarity(purposeOf(samples.damage),purposeOf(samples.banish))>0,'Damage amount must not be compared to a nonexistent banish amount');
assert(engine.compare(samples.bounce,samples.banish).score>engine.compare(samples.bounce,samples.draw).score);
assert(engine.compare(samples.bounce,samples.banish).score>engine.compare(samples.bounce,samples.selfBounce).score);
assert(engine.compare(samples.banish,samples.superCopy).score>engine.compare(samples.banish,samples.ordinary).score);
assert(engine.compare(samples.banish,samples.ordinary).score>engine.compare(samples.banish,samples.enter).score);
assert(engine.compare(samples.spellBanish,samples.enter).skill>engine.compare(samples.spellBanish,samples.deathBanish).skill);
assert(engine.compare(samples.damage,samples.multiDamage).score>engine.compare(samples.damage,samples.aoeDamage).score);
assert(engine.compare(samples.damage,samples.damageCopy).score>engine.compare(samples.damage,samples.conditionalDamage).score);
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(__dirname+'/data.js','utf8'),ctx);
const cards=JSON.parse(JSON.stringify(ctx.window.SVWB_GUESS_DATA.cards)),real=E.createEngine(cards),pool=E.poolFor(cards);
const bubble=cards.find(c=>c.name==='泡沫鬼姬'),bubbleRanks=real.rank(bubble,pool);
const infinite=bubbleRanks.find(r=>r.card.name==='淳朴的钢铁之躯·无限');
assert(infinite.rank<=5,'Matching storm plus two-target destruction should remain near the top alongside rare self-damage matches');
for(const name of ['人马骑士','魔狼首领','咆哮狼人'])assert(infinite.rank<bubbleRanks.find(r=>r.card.name===name).rank,'The shared removal/storm structure should beat a lone storm keyword');
console.log('Bubble princess regression:',{infiniteRank:infinite.rank,infiniteScore:infinite.score.toFixed(2)});
const cat=bubbleRanks.find(r=>r.card.name==='猫人水手'),general=bubbleRanks.find(r=>r.card.name==='夜曲将军·艾瑟拉');
assert(general.rank<cat.rank,'Storm plus rare self-damage should outrank health-1-only mass removal');
assert.equal(S.extract(cat.card).find(e=>e.action==='破坏').targetRestriction,'生命值=1');
assert(real.rarityFor('效果:自伤').multiplier>real.rarityFor('效果:伤害').multiplier);
console.log('Self-damage / restricted removal regression:',{general:general.score.toFixed(2),cat:cat.score.toFixed(2),selfDamageCards:real.rarityFor('效果:自伤').count});
const restrictions=[
  make('【入场曲】破坏对手的战场上的所有生命值为1的随从。'),
  make('【入场曲】破坏对手的战场上的所有生命值为2的随从。'),
  make('【入场曲】破坏对手的战场上的所有随从。'),
  make('【入场曲】选择对手的战场上的2个随从，破坏这些随从。')
];
const restricted=restrictions.map(S.extract),restrictedEngine=E.createEngine(restrictions);
assert(S.similarity(restricted[0],restricted[1])>S.similarity(restricted[0],restricted[2]));
assert(S.similarity(restricted[0],restricted[2])>S.similarity(restricted[0],restricted[3]));
assert(restrictedEngine.compare(restrictions[2],restrictions[0]).skill<restrictedEngine.compare(restrictions[2],restrictions[2]).skill);
assert.equal(S.targetRestrictionOf('选择对手的战场上的1个攻击力为4或以下的随从，使其消失。','消失'),'攻击力<=4');
assert.equal(S.targetRestrictionOf('选择对手的战场上的1个原始费用为5或以上的随从，使其返回手牌。','回手'),'原始费用>=5');
assert.equal(S.targetRestrictionOf('若自己的战场上有原始费用为1的随从，则破坏对手的战场上的所有随从。','破坏'),'');
assert.equal(S.targetRestrictionOf('对自己的主战者造成4点伤害。','伤害'),'');
const selfDamages=[1,2,4].map(n=>make(`【入场曲】对自己的主战者造成${n}点伤害。`)),selfEngine=E.createEngine(selfDamages);
assert(S.similarity(S.extract(selfDamages[1]),S.extract(selfDamages[2]))>.8);
assert(selfEngine.compare(selfDamages[1],selfDamages[2]).skill>80);
assert(selfEngine.compare(selfDamages[1],selfDamages[2]).skill<100);
assert(selfEngine.compare(selfDamages[0],selfDamages[2]).skill<selfEngine.compare(selfDamages[1],selfDamages[2]).skill);
assert.equal(S.effectFamily(S.extract(samples.faceDamage)[0]),'效果:伤害');
assert.equal(S.effectFamily(S.extract(selfDamages[0])[0]),'效果:自伤');
const erin=cards.find(c=>c.name==='霜寒冰晶·艾琳'),solitude=cards.find(c=>c.name==='宁静的孤独'),gatekeeper=cards.find(c=>c.name==='豪龙守门人');
const solitudeScore=real.compare(erin,solitude).score,gatekeeperScore=real.compare(erin,gatekeeper).score;
assert(solitudeScore>65&&Math.abs(gatekeeperScore-solitudeScore)<5,'The identical spell payload must not suffer the former 22-point timing gap');
assert.equal(S.extract(solitude)[0].timing,'使用时');
console.log('Erin regression:',{solitude:solitudeScore.toFixed(2),gatekeeper:gatekeeperScore.toFixed(2)});
const selwyn=cards.find(c=>c.name==='音速射手·塞尔文');assert(selwyn);
const alf=cards.find(c=>c.name==='激动的欢喜·阿尔菲德');
const alfRanks=real.rank(alf,pool),lookup=name=>alfRanks.find(r=>r.card.name===name);
assert(lookup('烟管的罪人·曲千代').rank<lookup('双刀哥布林').rank);
assert(lookup('烟管的罪人·曲千代').rank<lookup('报仇的占卜师·艾塞克莱因').rank);
assert(lookup('命运黄昏·奥丁').rank<lookup('迸发的光明·阿波罗').rank);
assert(lookup('烈焰火蜥蜴').score<40,'1-damage single removal should no longer receive the previous 49-point match');
assert.equal(S.extract(cards.find(c=>c.name==='命运黄昏·奥丁')).find(e=>e.action==='疾驰').timing,'常驻');
console.log('Alfheid regression:',alfRanks.filter(r=>/曲千代|双刀哥布林|艾塞克莱因|阿波罗|奥丁/.test(r.card.name)).map(r=>({name:r.card.name,rank:r.rank,score:+r.score.toFixed(2)})));
const results=real.rank(selwyn,pool);
const removalExamples=results.filter(r=>S.extract(r.card).some(e=>e.side==='敌'&&e.zone==='战场'&&['消失','破坏','回手','回牌组'].includes(e.action)));
console.log('PASS: removal families, targeting/zones, timings, scopes, resource gain, mana, defense, keyword negation, one-to-one matching and symmetry.');
console.log('Selwyn removal neighbours:',removalExamples.slice(0,12).map(r=>({name:r.card.name,rank:r.rank,score:+r.score.toFixed(2)})));
