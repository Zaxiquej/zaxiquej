(function (root) {
  'use strict';
  const VERSION = '4.43';
  const SEED_VERSION = '4.5'; // Keep existing cards stable while correcting low-cost bodies.
  const CALIBRATION=typeof module!=='undefined'&&module.exports?require('./calibration.js'):root.SVWBCalibration;
  const NONFOLLOWERS=typeof module!=='undefined'&&module.exports?require('./nonfollowers.js'):root.SVWBNonfollowers;
  const TYPES={follower:'随从',spell:'法术',amulet:'护符'};
  const CLASSES = ['中立','妖精','皇家护卫','巫师','龙族','梦魇','主教','超越者'];
  const RARITIES = ['铜卡','银卡','金卡','虹卡'];
  const THEMES = ['旅人 · 均衡与支援','森语 · 连击与回手','王旗 · 铺场与爆能','秘法 · 增幅与土印','龙鸣 · 觉醒与成长','幽夜 · 唤灵与谢幕','圣祷 · 回复与护符','机巧 · 傀儡与创造物'];
  function hash(text) { let h=2166136261; for(const c of text) {h^=c.codePointAt(0);h=Math.imul(h,16777619);} return h>>>0; }
  function rng(seed) {let a=seed; return ()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
  function weighted(r, pairs) {let n=r()*pairs.reduce((s,p)=>s+p[1],0);for(const [v,w]of pairs){n-=w;if(n<0)return v;}return pairs.at(-1)[0];}
  const trimName=(value,limit=48)=>String(value).normalize('NFC').trim().slice(0,limit).replace(/[\uD800-\uDBFF]$/,'');
  function nextVariant(input,random=Math.random) {
    const name=String(input).normalize('NFC').trim()||'设计师您辛苦了';
    const digits=/^随机卡牌(?:#\d+)?$/.test(name)?8:6,range=10**digits;
    const suffix=name.match(/#(\d+)$/);
    const previous=suffix&&Number(suffix[1])<range?Number(suffix[1]):-1;
    // Draw from all other suffixes, so repeated clicks always change the seed.
    let n=Math.floor(random()*(previous>=0?range-1:range));
    if(previous>=0&&n>=previous)n++;
    return trimName(name.replace(/#\d+$/,''),47-digits)+'#'+String(n).padStart(digits,'0');
  }
  function randomName(random=Math.random) {
    return '随机卡牌#'+String(Math.floor(random()*100000000)).padStart(8,'0');
  }
  const COST_BANDS={'0-3':[0,3],'4-6':[4,6],'7+':[7,Infinity]};
  function initialRoll(input) {
    const name=trimName(input);
    if(!name)throw Error('请输入随从名称。');
    const seed=hash(SEED_VERSION+'|'+name),r=rng(seed);
    let cls=Math.floor(r()*8);
    // Neutral : each craft = 0.8 : 1. Only redistribute some former neutral
    // rolls; preserve all existing craft rolls and the remaining random stream.
    if(cls===0){
      const classRoll=rng(hash(seed+'|neutral-weight'));
      if(classRoll()<1-8*.8/7.8)cls=1+Math.floor(classRoll()*7);
    }
    const rarity=weighted(r,[[0,38],[1,30],[2,21],[3,11]]);
    const type=weighted(r,[['follower',6],['spell',2],['amulet',2]]);
    // Preserve the requested 6:2:2 type mix, then sample official printed costs.
    // The snapshot's only supported 8+ PP spell is a spellboost-discount spell.
    // Concentrate that rare weight in Witch instead of creating unplayable copies.
    const cost=weighted(r,CALIBRATION.costPriors[type].map((weight,n)=>[n,weight*(type==='spell'&&n>=8?(cls===3?7.8:0):1)]).filter(([,weight])=>weight>0));
    return {name,seed,r,cls,rarity,cost,type};
  }
  function randomMatchingName(filters={}, {variantOf,excludeName,random=Math.random}={}) {
    if(filters.class!=null&&(!Number.isInteger(filters.class)||filters.class<0||filters.class>=CLASSES.length))throw Error('职业筛选无效。');
    if(filters.rarity!=null&&(!Number.isInteger(filters.rarity)||filters.rarity<0||filters.rarity>=RARITIES.length))throw Error('稀有度筛选无效。');
    if(filters.costBand!=null&&!Object.hasOwn(COST_BANDS,filters.costBand))throw Error('费用筛选无效。');
    if(filters.type!=null&&!Object.hasOwn(TYPES,filters.type))throw Error('卡牌类型筛选无效。');
    const original=variantOf==null?null:trimName(variantOf)||'设计师您辛苦了';
    const digits=original===null||/^随机卡牌(?:#\d+)?$/.test(original)?8:6,range=10**digits;
    const base=original===null?'随机卡牌':trimName(original.replace(/#\d+$/,''),47-digits);
    const bounds=COST_BANDS[filters.costBand]||[0,Infinity];
    const start=Math.floor(random()*range);
    // A coprime random step visits each suffix at most once, even with a fixed RNG.
    let step=2*Math.floor(random()*(range/2))+1;
    if(step%5===0)step+=2;
    for(let i=0;i<range;i++) {
      const name=base+'#'+String((start+i*step)%range).padStart(digits,'0');
      if(name===original||name===excludeName)continue;
      const c=initialRoll(name);
      if((filters.type==null||c.type===filters.type)&&(filters.class==null||c.cls===filters.class)&&(filters.rarity==null||c.rarity===filters.rarity)&&c.cost>=bounds[0]&&c.cost<=bounds[1])return name;
    }
    throw Error('这个名称的数字后缀中没有符合条件的结果，请放宽筛选或点击随机生成。');
  }
  const TOKENS = [
    {id:90001110,name:'哥布林',class:0,cost:1,attack:1,health:2,text:''},
    {id:90011110,name:'妖精',class:1,cost:1,attack:1,health:1,text:'【突进】'},
    {id:90021110,name:'骑士',class:2,cost:0,attack:1,health:1,text:''},
    {id:90031110,name:'泥尘巨像',class:3,cost:1,attack:2,health:2,text:''},
    {id:90041130,name:'大海虎鲸',class:4,cost:2,attack:2,health:2,text:'【突进】'},
    {id:90051120,name:'蝙蝠',class:5,cost:1,attack:1,health:1,text:'【虹吸】'},
    {id:90064110,name:'圣骑兵',class:6,cost:1,attack:1,health:2,text:'【守护】'},
    {id:90071110,name:'悬丝傀儡',class:7,cost:0,attack:1,health:1,text:'【突进】\n对手的回合结束时，破坏本卡牌。'},
    {id:90071130,name:'解析的创造物',class:7,cost:1,attack:1,health:1,text:'本随从进入战场时，抽取1张卡牌。'},
    {id:90031120,name:'守护者巨像',class:3,cost:3,attack:3,health:3,text:'【守护】'},
    {id:90041120,name:'巨翼飞龙',class:4,cost:5,attack:5,health:5,text:'【威慑】'},
    {id:90051110,name:'骸骨士兵',class:5,cost:0,attack:1,health:1,text:''},
    {id:90051130,name:'怨灵',class:5,cost:1,attack:1,health:1,text:'【疾驰】\n离场时，使本随从消失。\n自己的回合结束时，使本随从消失。'},
    {id:90061110,name:'神圣猎鹰',class:6,cost:3,attack:2,health:2,text:'【疾驰】'},
    {id:90061130,name:'壮丽大神隼',class:6,cost:6,attack:4,health:4,text:'【疾驰】'},
    {id:90071120,name:'改良型·悬丝傀儡',class:7,cost:1,attack:3,health:3,text:'【突进】\n对手的回合结束时，破坏本卡牌。'},
    {id:10631110,name:'天晶魔手',class:3,cost:1,attack:1,health:1,text:'【突进】'},
    {id:90071140,name:'古老的创造物',class:7,cost:1,attack:3,health:1,text:'【突进】'},
    {id:90071150,name:'神秘的创造物',class:7,cost:3,attack:4,health:5,text:'【守护】'},
    {id:90071160,name:'绚烂的创造物',class:7,cost:3,attack:2,health:2,text:'【疾驰】'},
    {id:90073120,name:'毁灭创造物β',class:7,cost:5,attack:4,health:4,text:'自己的回合结束时，对对手的主战者造成3点伤害。'},
    {id:90073130,name:'毁灭创造物γ',class:7,cost:5,attack:5,health:3,text:'自己的回合结束时，对对手的战场上的所有随从造成3点伤害。'},
    {id:90021120,name:'铁甲骑士',class:2,cost:1,attack:2,health:2,text:''},
    {id:90051140,name:'腐臭的僵尸',class:5,cost:3,attack:2,health:2,text:'【谢幕曲】召唤1个『腐臭的僵尸』，使其失去【谢幕曲】。'}
  ];
  const TRIBES={2:{name:'士兵',id:2,tokens:[90021110,90021120]},3:{name:'巨像',id:12,tokens:[90031110,90031120]},4:{name:'海洋',id:17,tokens:[90041130]},5:{name:'亡者',id:6,tokens:[90051110,90051130,90051140]}};
  for(const t of TOKENS){const tribe=Object.values(TRIBES).find(v=>v.tokens.includes(t.id));if(tribe){t.tribe=tribe.name;t.tribeId=tribe.id;}}
  // Ward and Rush are free. Body and effect allowances grow separately with cost;
  // delayed/paid effects buy more payoff than an unconditional Fanfare.
  const BODY = [0,2,4,6,8,9,12,14,16,18,20];
  const ABILITY = [0,1.7,4.2,6,8.5,12,17,20,23,27,31];
  const RAMP_VALUE = 9; // About a full 3-PP spell, before timing/resource discounts.
  const drawValue=(cost,n)=>cost<=3?2.8*n+.5*n*(n-1):2.2*n;
  function keywordPrice(k,attack,health,context={}) {
    const attacks=context.attacks||1;
    return ({'守护':0,'突进':0,'疾驰':(.55+attack*.5+Math.max(0,attack-2)**2*.1)*attacks,
      '毁灭':Math.max(.1,1.1-attack*.16)*(context.rush?1.4:1),
      '虹吸':(.1+attack*.13)*attacks,'潜行':.2+attack*.1,
      '威慑':context.storm?.55:0,'灵气':context.engine?.6:0,
      '屏障':context.ward||attacks>1?.6:0})[k];
  }
  function stormCardValue(attack,health,abilities){
    const extras=abilities.filter(a=>!a.ids.includes('疾驰'));
    const effectValue=extras.reduce((s,a)=>s+a.price,0)/3;
    const faceDamage=extras.filter(a=>a.trigger==='入场曲'&&a.condition==='none').reduce((s,a)=>s+[...a.text.matchAll(/对对手的主战者造成(\d+)点伤害/g)].reduce((n,m)=>n+Number(m[1]),0),0);
    // PP-equivalent anchor: a 7/5 Storm body alone exhausts 8 PP.
    // Damage delivered immediately by both body and Fanfare shares one limit.
    const value=.3+attack*.65+Math.max(0,attack-2)**2*.07+health*.28+effectValue+Math.max(0,attack-3)*faceDamage*.12;
    return {value,effectValue,faceDamage};
  }
  const TOKEN_VALUES = {
    90051140:[1.8,5.3], // 2/2 now plus a discounted delayed 2/2; hand delivery still costs 3 PP.
    90021120:[1.5,3.2],
    90001110:[1.1,2.2],90011110:[1,1.8],90021110:[1.2,1.4],90031110:[1.5,3.2],
    90041130:[1.4,3.8],90051120:[1,1.7],90064110:[1.2,2.5],90071110:[1.4,1.7],
    90071130:[1.7,3.8],90031120:[1.7,5.8],90041120:[1.8,10.5],90051110:[1.2,1.4],
    90051130:[2,3.3],90061110:[2,5.2],90061130:[2.4,9.8],90071120:[3.5,4.8],10631110:[1,1.8],
    90071140:[1.8,3.4],90071150:[2.8,7.2],90071160:[2.4,5.2],90073120:[3.5,12],90073130:[3.8,14]
  };
  function tokenValue(token,delivery='summon') {
    const listed=TOKEN_VALUES[token.id];
    if(listed)return listed[delivery==='hand'?0:1];
    if(token.custom&&token.design){
      const {temporary,parts}=token.design;
      const body=(token.attack+token.health)*(temporary?.6:.8);
      const abilities=parts.reduce((sum,p)=>sum+(p.id==='doubleAttack'?token.attack*1.25:p.value),0);
      const value=body+abilities;
      return delivery==='hand'?Math.max(1.5,value-token.cost*1.25):value;
    }
    const body=(token.attack+token.health)*.8;
    const ability=token.text.includes('谢幕曲')?1.4:token.text.includes('突进')?.6:token.text.includes('守护')?.4:0;
    return delivery==='hand'?Math.max(1,body+ability-token.cost*1.25):body+ability;
  }
  function createReward(name,seed,cls,sourceCost){
    const r=rng(hash(seed+'|custom-reward')),pick=a=>a[Math.floor(r()*a.length)];
    const fee=weighted(r,sourceCost<=3?[[1,2],[2,5],[3,2]]:[[2,4],[3,5],[4,2]]);
    const temporary=r()<.22;
    const total=fee*2+pick([1,2,3])+(temporary?3:0);
    const role=pick(['intercept','doubleAttack','reduceDamage','damageCap','engine','engine']);
    let attack=role==='intercept'?pick([1,2]):Math.max(1,Math.round(total*pick([.3,.4,.5,.65])));
    let health=total-attack;
    const parts=[],keywords=new Set();
    const part=(id,text,value)=>parts.push({id,text,value});
    if(role==='intercept'){keywords.add('守护');part(role,'对手能力只能选择本卡牌。',3.5);}
    if(role==='doubleAttack'){keywords.add('突进');part(role,'本随从在1回合中可进行2次攻击。',attack*1.25);}
    if(role==='reduceDamage'){keywords.add(pick(['守护','突进']));part(role,'本随从受到的伤害-1。',Math.max(2,health*.55));}
    if(role==='damageCap'){keywords.add('守护');part(role,'本随从受到的超过3的伤害变为3。',Math.max(1.5,health*.4));}
    if(role==='engine'||r()<.35){
      const event=pick(['enter','attack','end','lastWords']);
      const amount=fee>=3?pick([2,3]):pick([1,2]);
      const payoffs=[['damage',`对对手的战场上的随机1个随从造成${amount+1}点伤害。`,(amount+1)*1.25],['draw','抽取1张卡牌。',2.2],['heal',`回复自己的主战者${amount+1}点生命值。`,(amount+1)*.65]];
      if(event!=='lastWords')payoffs.push(['grow',`本随从+${amount}/+${amount}。`,amount*2]);
      if([1,2,6].includes(cls))payoffs.push(['support','使自己的其他所有随从+1/+1。',5]);
      if(cls===3)payoffs.push(['boost',`使自己的所有手牌发动${amount}次魔力增幅。`,amount*1.8],['earth',`使自己的战场上的土之印+${amount}。`,amount*1.6]);
      if(cls===5)payoffs.push(['grave',`使自己的墓场+${amount+2}。`,(amount+2)*.55]);
      const [id,text,raw]=pick(payoffs);
      const eventText={enter:'本随从进入战场时，',attack:'【攻击时】',end:'自己的回合结束时，',lastWords:'【谢幕曲】'}[event];
      if(event==='attack')keywords.add('突进');
      const repeats=event==='attack'?(role==='doubleAttack'?3:1.6):event==='end'?(temporary?1:1.8):event==='lastWords'?.75:1;
      part(event+':'+id,eventText+text,raw*repeats);
    }
    if(temporary)keywords.add('突进');
    if(!keywords.size&&r()<.6)keywords.add('守护');
    const suffix=pick([['灵卫','契灵'],['森灵','花冠使者'],['近卫','旗卫'],['秘法英灵','幻魔'],['海渊龙灵','焰鳞兽'],['冥界侍从','亡魂'],['圣域使者','祷告化身'],['机巧护卫','异界造物']][cls]);
    const text=[...[...keywords].map(k=>`【${k}】`),...parts.map(p=>p.text),...(temporary?['对手的回合结束时，破坏本卡牌。']:[])].join('\n');
    return {id:'custom',name:`${name}的${suffix}`,class:cls,cost:fee,attack,health,text,custom:true,design:{temporary,parts}};
  }
  const effects = [
    ['draw',2.2,8,[],n=>`抽取${n}张卡牌。`,3],
    ['restoreEP',5.5,3,[],()=> '回复自己1点进化点。',1],
    ['restoreSEP',10,1,[],n=>`回复自己${n}点超进化点。`,2],
    ['handCycle',.7,5,[],n=>`选择自己的${n}张手牌，使其返回牌组。抽取${n}张卡牌。`,2],
    ['handRefill',2.2,4,[],n=>`选择自己的1张手牌，使其返回牌组。若以此使卡牌返回了牌组，则抽取${n+1}张卡牌。`,2],
    ['handCycleTutor',1.3,4,[],()=> '选择自己的1张手牌，使其返回牌组。若以此使卡牌返回了牌组，则从自己的牌组中随机将1张$SEARCH加入手牌。',1],
    ['handRefresh',1.4,2,[],()=> '使自己的所有手牌返回牌组。抽取X张卡牌。X为因本能力返回牌组的张数。',1],
    ['opponentHandCopy',2.5,6,[0,1],n=>`将对手的手牌中的随机${n}张卡牌的复制卡牌各1张以非公开形式加入自己的手牌。`,3,'exclusive'],
    ['opponentDeckCopy',2.4,5,[0,1],n=>`将对手的牌组中的随机${n}张卡牌的复制卡牌各1张以非公开形式加入自己的手牌。`,3,'exclusive'],
    ['opponentCopyTransform',1.2,3,[0,1],()=> '选择自己的1张手牌，使其变身为对手的牌组中的随机1张卡牌的复制卡牌。',1,'exclusive'],
    ['keywordSearch',2.7,5,[],n=>`从自己的牌组中随机将${n}张拥有【$KEYWORD】的随从加入手牌。`,3],
    ['typeSearch',2.5,5,[],n=>`从自己的牌组中随机将${n}张$SEARCH加入手牌。`,3],
    ['damage',1.25,10,[3,4,7],n=>`选择对手的战场上的1个随从，对其造成${n}点伤害。`,10],
    ['heal',0.65,6,[6,5],n=>`回复自己的主战者${n}点生命值。`,10],
    ['buff',2,7,[2,1],n=>`本随从+${n}/+${n}。`,5],
    ['allyBuff',1.8,6,[2,6],n=>`选择自己的战场上的1个其他随从，使其+${n}/+${n}。`,5],
    ['face',2.7,3,[4,5],n=>`对对手的主战者造成${n}点伤害。`,5],
    ['aoe',3.8,3,[3,4],n=>`对对手的战场上的所有随从造成${n}点伤害。`,5],
    ['destroy',7,2,[5,7],()=> '选择对手的战场上的1个随从，破坏该随从。',1],
    ['banish',8,1,[6,7],()=> '选择对手的战场上的1个随从，使其消失。',1],
    ['smallDestroy',3.5,4,[5],()=> '选择对手的战场上的1个费用为3或以下的随从，破坏该随从。',1],
    ['teamBuff',5,2,[2],()=> '使自己的战场上的其他所有随从+1/+1。',1],
    ['bounce',1,6,[1],()=> '选择自己的战场上的1张其他卡牌，使其返回手牌。',1,'exclusive'],
    ['enemyBounce',5,3,[1,7],()=> '选择对手的战场上的1个随从，使其返回手牌。',1,'exclusive'],
    ['handBuff',1.3,6,[3,4],n=>`选择自己的手牌中的1张随从，使其+${n}/+${n}。`,4,'exclusive'],
    ['handCostUp',.6,6,[3],()=> '选择自己的手牌中的1张随从，使其费用+1。',1,'exclusive'],
    ['allyPing',.6,5,[4],()=> '选择自己的战场上的1个随从，对其造成1点伤害。',1,'exclusive'],
    ['allBoardDamage',3.2,5,[4],n=>`对战场上的所有随从造成${n}点伤害。`,5,'exclusive'],
    ['boost',2,6,[3],n=>`使自己的所有手牌发动${n}次魔力增幅。`,2,'exclusive'],
    ['earth',1.6,5,[3],n=>`使自己的战场上的土之印+${n}。`,2,'exclusive'],
    ['ramp',RAMP_VALUE,3,[4],()=> '使自己的能量点最大值+1。',1,'exclusive'],
    ['grave',0.7,5,[5],n=>`使自己的墓场+${n}。`,4,'exclusive'],
    ['reanimate',4.5,3,[5],n=> `发动【亡者召还 ${n+1}】。`,5,'exclusive'],
    ['amulet',1.7,5,[6],n=>`使自己的战场上的所有拥有【吟唱】的护符的倒计数-${n}。`,2,'exclusive'],
    ['artifact',2.6,5,[7],()=> '将1张『$ARTIFACT』加入手牌。',1,'exclusive'],
    ['artifactCopy',7,5,[7],n=>`召唤自己的手牌中的随机${n}张费用为5或以下的创造物·随从的复制随从。`,2,'exclusive'],
    ['artifactBuff',4,3,[7],n=>`使自己的战场上的所有创造物·随从+${n}/+${n}。`,2,'exclusive'],
    ['wardSearch',2.5,4,[6],n=>`从自己的牌组中随机将${n}张拥有【守护】的随从加入手牌。`,2,'exclusive'],
    ['wardBuff',3.5,3,[6],n=>`使自己的战场上的拥有【守护】的其他随从全部+${n}/+${n}。`,2,'exclusive'],
    ['amuletSearch',2.5,5,[6],n=>`抽取${n}张护符。`,2,'exclusive'],
    ['amuletRecruit',5,4,[6],n=>`从自己的牌组中随机召唤${n}张费用为2或以下的护符。`,2,'exclusive'],
    ['amuletRevive',5.5,4,[6],()=> '召唤随机1张与本次对战中被破坏的「原始费用为2或以下的拥有【谢幕曲】的自己的护符」同名的护符。',1,'exclusive'],
    ['amuletBreak',2.5,3,[6],()=> '破坏自己的战场上的随机1张护符。若因本能力破坏了护符，则抽取1张卡牌。',1,'exclusive'],
    ['bloodDraw',1.6,4,[5],n=>`对自己的主战者造成${n}点伤害。抽取${n}张卡牌。`,2,'exclusive'],
    ['missingHealthDamage',1,3,[5],n=>`对对手的战场上的随机1个随从造成X点伤害。X为自己的主战者已损失的生命值（上限${n}）。`,10,'exclusive'],
    ['crystalHandSupply',1,4,[3],n=>`将${n}张『天晶魔手』加入手牌。`,3,'exclusive'],
    ['crystalHandSummon',1.8,5,[3],n=>`召唤${n}个『天晶魔手』。`,3,'exclusive'],
    ['crystalHandBuff',4.5,3,[3],n=>`使自己的战场上的所有『天晶魔手』+${n}/+${n}。`,2,'exclusive'],
    ['tokenHand',1.6,8,[1,7],n=>`将${n}张『$TOKEN』加入手牌。`,2],
    ['tokenSummon',3,7,[2,5],n=>`召唤${n}个『$TOKEN』。`,2]
  ].map(([id,price,weight,classes,text,max,exclusive])=>({id,price,weight,classes,text,max,exclusive}));
  effects.push(
    {id:'tribeSupply',price:2.5,weight:4,classes:[2,3,4,5],exclusive:true,max:2,text:n=>`将${n}张『$TRIBETOKEN』加入手牌。`},
    {id:'tribeBuff',price:3.2,weight:4,classes:[2,3,4,5],exclusive:true,max:2,text:n=>`使自己的战场上的所有$TRIBE·随从+${n}/+${n}。`},
    {id:'tribeEvolve',price:5,weight:2,classes:[2,3,4,5],exclusive:true,max:1,text:()=> '选择自己的战场上的1个进化前的$TRIBE·随从，使其进化。'},
    {id:'tribeCountDamage',price:7.6,weight:2,classes:[2,3,4,5],exclusive:true,max:1,text:()=> '对对手的战场上的所有随从造成X点伤害。X为自己的战场上的$TRIBE·随从的张数。'},
    {id:'selfCopy',price:6,weight:7,classes:[],max:2,types:['follower'],text:n=>`召唤${n}个『$SELF』。`},
    {id:'splitDamage',price:1.1,weight:5,classes:[],max:16,types:['spell','amulet'],text:n=>`对对手的战场上的所有随从分配${n}点伤害。`},
    ...[['grantRush','突进',1.5],['grantWard','守护',1.2],['grantBarrier','屏障',2.5]].map(([id,k,price])=>({id,price,weight:3,classes:[],max:1,types:['spell','amulet'],text:()=>`选择自己的战场上的1个随从，使其获得【${k}】。`})),
    {id:'recruit',price:4.8,weight:3,classes:[],max:3,types:['spell','amulet'],text:n=>`从自己的牌组中随机召唤${n}张费用为2或以下的随从。`},
    {id:'boardWipe',price:14,weight:2,classes:[],max:1,types:['spell','amulet'],text:()=> '破坏战场上的所有随从。'}
  );
  effects.push(
    {id:'selfEvolve',price:6,weight:5,classes:[],max:1,types:['follower'],text:()=> '若本随从为进化前，则本随从进化。'},
    {id:'allyEvolve',price:6,weight:3,classes:[],max:1,text:()=> '选择自己的战场上的1个进化前的其他随从，使其进化。'},
    {id:'teamEvolve',price:16,weight:1.5,classes:[],max:1,text:()=> '使自己的战场上的所有进化前的随从进化。'},
    {id:'selfSuperEvolve',price:14,weight:1,classes:[],max:1,types:['follower'],text:()=> '若本随从为进化前，则本随从超进化。'}
  );
  function generate(input) {return generateCard(input);}
  function generateCard(input,alternateConfig=null) {
    const roll=initialRoll(input);
    if(alternateConfig)Object.assign(roll,{type:'spell',cost:alternateConfig.cost,cls:alternateConfig.cls,rarity:alternateConfig.rarity,r:rng(hash(roll.seed+'|accelerate|'+alternateConfig.cost))});
    const {name,seed,r,cls,rarity,cost,type}=roll,pick=a=>a[Math.floor(r()*a.length)];
    const simpleDesign=type==='follower'&&rarity===0&&cost>=6&&rng(hash(seed+'|simple-design'))()<.7;
    // All self-evolution entry points share this rare unconditional allowance.
    // A second pool cannot independently roll past the restriction.
    const unconditionalSelfEvolution=cost>=5&&rng(hash(seed+'|unconditional-self-evolution'))()<(cost>=7?.12:.035);
    const tribe=TRIBES[cls],tribal=!!tribe&&rng(hash(seed+'|tribal-theme'))()<.08;
    const tribeToken=tribal?weighted(r,TOKENS.filter(t=>t.tribeId===tribe.id).map(t=>[t,t.cost<=1?3:1])):null;
    const profile=(type==='follower'?CALIBRATION.profiles:CALIBRATION.typeProfiles[type])[`${cost<=3?0:cost<=6?1:2}:${cls}:${rarity}`];
    let keywordQuota=weighted(r,profile.keywordCounts.map((weight,n)=>[n,weight]));
    const oversized=type==='follower'&&cost>=7&&cls===4&&r()<.23;
    let floor=type==='follower'?(oversized?2*(cost+3):BODY[cost]):0;
    // Small power variation is independent of rarity; rarity governs structure.
    const powerVariation=rng(hash(seed+'|power-variation'))()*(type==='follower'?2.4:1.2);
    const budget=type==='follower'?floor+ABILITY[cost]+powerVariation:(cost===0?.9:cost*2.8+.6+Math.max(0,cost-5)**1.3*.7)+powerVariation;
    const card={version:VERSION,name,seed,type,class:cls,rarity,cost,attack:type==='follower'?0:null,health:type==='follower'?0:null,abilities:[],tokens:[],emblems:[],faiths:[],alternateForms:[],budget,spent:0,bodyAllowance:floor,theme:THEMES[cls]};
    if(tribal)card.tribalTheme=tribe.name;
    if(simpleDesign)card.simpleDesign=true;
    const attackBias=pick(cost===2?[-.25,-.25,-.25,0,0,0,0,.25,.25,.25]:[-.2,-.1,0,0,0,.1,.2]);
    const searchKeyword=pick(['守护','突进','疾驰','谢幕曲','入场曲']);
    const searchType=pick(cls===3?['法术','费用为3或以下的随从']:cls===6?['护符','拥有【吟唱】的护符']:['费用为3或以下的随从','费用为5或以上的随从']);
    // Keep the former three reward rolls so unrelated cards retain their stream.
    weighted(r,cost>=7?[[1,5],[2,3],[3,1]]:cost>=4?[[1,4],[2,1]]:[[1,1]]);
    // Hand and summon delivery share one independently composed reward definition.
    pick(['使魔','侍从','造物']);pick(['守护','突进','谢幕曲']);
    const generatedToken=createReward(name,seed,cls,cost);
    const classTokens=TOKENS.filter(t=>t.class===cls);
    const sampledToken=r()<[.006,.018,.045,.065][rarity]?generatedToken:weighted(r,classTokens.map(t=>[t,t.id===TOKENS[cls].id?4:1]));
    const token=alternateConfig?.token||(tribal&&r()<.7?tribeToken:sampledToken);
    const artifactToken=cls===7?weighted(r,TOKENS.filter(t=>t.class===7&&t.name.includes('创造物')).map(t=>[t,t.cost===1?5:t.cost===3?3:1])):TOKENS[8];
    const used=new Set();
    const triggerWeight=trigger=>(profile.triggers[trigger]||0)*(trigger==='谢幕曲'?(cls===5?2.55:1.5):1);
    const targeted=text=>/选择(?:自己|对手)的(?:(?:战场上|手牌中)的)?[1-9][个张]/.test(text);
    // Only explicit play/evolve/activate actions may request player choices.
    // Automatic events (including attacks and own-turn events) use random objects.
    const canChooseTarget=trigger=>['入场曲','进化时','超进化时','爆能强化','法术','启动'].includes(trigger);
    function evolutionTiming(trigger){
      const base=trigger==='进化时'?.38:.25;
      const existing=card.abilities.filter(a=>['进化时','超进化时'].includes(a.trigger)).reduce((s,a)=>s+a.raw,0);
      return Math.min(1,base+Math.min(.65,existing/(8+cost)*.6));
    }
    const phase=trigger=>['入场曲','法术','爆能强化'].includes(trigger)?'play':['进化时','超进化时'].includes(trigger)?'evolve':trigger;
    const phaseHasTarget=trigger=>card.abilities.some(a=>phase(a.trigger)===phase(trigger)&&(targeted(a.text)||a.ids.some(id=>['replay','activationReplay'].includes(id))&&card.abilities.some(f=>f.trigger==='入场曲'&&targeted(f.text))));
    const searchIds=new Set(['keywordSearch','typeSearch','wardSearch','amuletSearch','tutor']);
    const copyIds=new Set(['opponentHandCopy','opponentDeckCopy']);
    const copyValue=(id,n)=>n*(id==='opponentHandCopy'?2.5:2.4)+.5*n*(n-1);
    const searchValue=(id,n)=>n*(id==='amuletSearch'?2.7:id==='typeSearch'?3:3.2)+.6*n*(n-1);
    function searchCap(trigger,effectCost=cost){
      if(!['入场曲','进化时','超进化时','谢幕曲','爆能强化','法术','启动'].includes(trigger))return 1;
      return effectCost>=7?3:effectCost>=4||['进化时','超进化时'].includes(trigger)?2:1;
    }
    function searchCount(text){
      const count=s=>[...s.matchAll(/从自己的牌组中随机将([1-9])张|抽取([1-9])张护符/g)].reduce((n,m)=>n+Number(m[1]||m[2]),0);
      const branches=text.split(/\n（\d+）/);
      return branches.length>1?count(branches[0])+Math.max(...branches.slice(1).map(count)):count(text);
    }
    function effectWeight(id,fallback=3){return Math.max(.001,(profile.effects[id]||0)*.85+fallback/150*.15)*(id==='ramp'?(cost<=6?5:cost<=8?2:.5):id==='bounce'?(cost<=3?2:1.2):id.startsWith('tribe')?30:1);}
    function quantityWeight(id,n,trigger='其他',effectCost=cost) {
      const aliases={handCycle:'draw',handRefill:'draw',tribeSupply:'draw',tribeBuff:'allyBuff',wardSearch:'draw',amuletSearch:'draw',bloodDraw:'draw',missingHealthDamage:'damage',artifactCopy:'tokenSummon',amuletRecruit:'tokenSummon',wardBuff:'allyBuff',artifactBuff:'allyBuff'};
      const kind=aliases[id]||(['keywordSearch','typeSearch'].includes(id)?'draw':id.startsWith('crystalHand')?(id==='crystalHandSupply'?'tokenHand':id==='crystalHandSummon'?'tokenSummon':'allyBuff'):id);
      const actual=id==='reanimate'||id==='handRefill'?n+1:n;
      const tables=type==='follower'?CALIBRATION.quantities:CALIBRATION.typeQuantities[type];
      const hist=tables[kind]?.[Math.max(1,effectCost)]?.[trigger]||tables[kind]?.[Math.max(1,effectCost)]?.['其他'];
      const prior=hist?.[actual]||.08;
      // A small cost-dependent prior keeps large outcomes possible, not equally
      // common on a cheap evolve card and an expensive finisher.
      let weight=prior*Math.exp(-Math.max(0,actual-(1+effectCost*.7))*.4);
      if(searchIds.has(id))weight*=n===1?1:n===2?(effectCost<=3?.12:effectCost<=6?.35:.7):(effectCost<7?.02:.25);
      if(copyIds.has(id))weight*=n===1?1:n===2?.3:.08;
      if(['damage','face','aoe','splitDamage'].includes(kind)&&effectCost>=4){
        const burst=['入场曲','进化时','超进化时','谢幕曲','爆能强化','法术','本随从进化时'].includes(trigger);
        const target=1+effectCost*({damage:.7,face:.28,aoe:.32,splitDamage:.9})[kind];
        // Suppress cheap chip damage on expensive cards without making every
        // roll hit its cap. Repeated damage keeps a gentler cost relationship.
        weight*=Math.exp(-Math.max(0,target-actual)*(burst?.9:.25));
      }
      return weight;
    }
    function rollAmount(id,min,max,trigger='其他',effectCost=cost){return weighted(r,Array.from({length:max-min+1},(_,i)=>[min+i,quantityWeight(id,min+i,trigger,effectCost)]));}
    function add(a) {card.abilities.push(a);card.spent+=a.price;a.ids.forEach(id=>used.add(id));(a.tokens||[]).forEach(t=>{if(!card.tokens.some(v=>v.id===t.id))card.tokens.push({...t});});}
    // A modest preference, not a guaranteed combo. Read actual ability payloads:
    // listing an emblem's related token alone does not mean it summons that token.
    function synergyWeight(ids,tokens=[]) {
      const is=(...keys)=>keys.some(k=>ids.includes(k));
      const supplies=(keys,ts,tokenId)=>keys.some(k=>['artifact','summon','tokenHand','tokenSummon'].includes(k))&&ts.some(t=>t.id===tokenId);
      const provides=id=>supplies(ids,tokens,id);
      const alreadyProvides=id=>card.abilities.some(a=>supplies(a.ids,a.tokens||[],id));
      const crest=cls=>card.emblems.some(e=>e.supportTags.includes(({1:'fairy',2:'enhance',5:'death',6:'heal',7:'artifact'})[cls]));
      const crestTag=tag=>card.emblems.some(e=>e.supportTags.includes(tag));
      const faithEvent=event=>card.faiths.some(f=>f.gainRules.some(g=>g.eventId===event));
      const hasCondition=id=>card.abilities.some(a=>a.condition===id);
      const army=used.has('summon')||used.has('tokenSummon');
      const makesArmy=is('summon','tokenSummon','reanimate');
      const match=
        cls===3&&(hasCondition('costChanged')||used.has('costChangedLink')||crestTag('costChanged'))&&is('handCostUp','handBuff')||
        cls===3&&used.has('handCostUp')&&is('handBuff')||
        cls===4&&(used.has('hurtLink')||crestTag('hurt'))&&is('allyPing','allBoardDamage')||
        cls===1&&(hasCondition('combo')||alreadyProvides(TOKENS[1].id))&&is('bounce')||
        cls===1&&used.has('bounce')&&provides(TOKENS[1].id)||
        tribal&&(used.has('tribeEngine')||used.has('tribeSupply')||card.emblems.some(e=>['tribeEnter','tribeAttack'].includes(e.eventId)))&&tokens.some(t=>t.tribeId===tribe.id)||
        crestTag('ward')&&is('wardSearch','wardBuff','守护')||
        crestTag('amulet')&&is('amuletSearch','amuletRecruit','amuletRevive','amuletBreak','amulet')||
        crestTag('earth')&&is('earth')||crestTag('rally')&&makesArmy||crestTag('lowHealth')&&is('bloodDraw')||
        (hasCondition('rally')||used.has('rallyLink'))&&makesArmy||
        (used.has('wardLink')||hasCondition('wardBoard'))&&is('wardSearch','wardBuff','守护')||
        used.has('wardSearch')&&is('wardBuff')||
        (used.has('amuletLink')||hasCondition('amulet')||hasCondition('amuletHistory'))&&is('amuletSearch','amuletRecruit','amuletRevive','amuletBreak','amulet')||
        (used.has('amuletRecruit')||used.has('amuletRevive'))&&is('amulet','amuletBreak')||
        (used.has('artifactCopy')||used.has('artifactLink')||hasCondition('artifactKinds'))&&is('artifact')||
        used.has('artifact')&&is('artifactCopy','artifactBuff')||
        (used.has('missingHealthDamage')||hasCondition('lowHealth'))&&is('bloodDraw')||
        used.has('bloodDraw')&&is('missingHealthDamage')||
        (used.has('spellboostGrowth')||used.has('spellboostDiscount'))&&is('boost')||
        hasCondition('ppFull')&&is('ramp')||
        (faithEvent('crystalHands')||card.emblems.some(e=>e.engine==='crystalHands')||used.has('crystalHandLink'))&&is('crystalHandSupply','crystalHandSummon','crystalHandBuff')||
        faithEvent('enhance')&&is('enhance')||faithEvent('mode')&&is('mode')||
        faithEvent('earth')&&is('earth')||faithEvent('fairy')&&provides(TOKENS[1].id)||
        faithEvent('heal')&&is('heal')||faithEvent('selfDamage')&&is('bloodDraw')||
        faithEvent('amuletDeath')&&is('amuletRecruit','amuletRevive','amuletBreak')||
        faithEvent('draw')&&is('draw','bloodDraw')||faithEvent('return')&&is('bounce')||
        (faithEvent('death')||faithEvent('enter'))&&makesArmy||
        (crest(7)||hasCondition('artifact')||card.fusion?.material==='创造物·卡牌')&&(is('artifact','artifactCopy')||provides(TOKENS[8].id))||
        is('emblem7')&&alreadyProvides(TOKENS[8].id)||
        crest(6)&&is('heal')||is('emblem6')&&used.has('heal')||
        (crest(1)||hasCondition('combo')||hasCondition('forestHistory'))&&provides(TOKENS[1].id)||
        is('emblem1')&&alreadyProvides(TOKENS[1].id)||
        crest(5)&&makesArmy||is('emblem5')&&army||
        crest(2)&&is('enhance')||is('emblem2')&&used.has('enhance')||
        (hasCondition('earth')&&is('earth'))||(used.has('costReduction')&&is('boost'))||
        hasCondition('necromancy')&&is('grave')||
        army&&is('allyBuff','teamBuff')||used.has('teamBuff')&&makesArmy||
        card.abilities.some(a=>a.trigger==='攻击时')&&is('突进','doubleAttack');
      return match?1.4:1;
    }
    function keyword(k) {const a=Math.max(1,Math.min(Math.round(floor*(.5+attackBias)),Math.max(1,floor-1),k==='疾驰'||used.has('疾驰')?Math.max(1,cost-1):Infinity));const p=keywordPrice(k,a,floor-a,{rush:used.has('突进'),storm:used.has('疾驰'),ward:used.has('守护'),engine:card.emblems.length>0,attacks:used.has('doubleAttack')?2:1});return {kind:'keyword',trigger:'',condition:'none',text:`【${k}】`,price:p,raw:p,ids:[k]};}
    function modularAtom(kind,automatic=true,trigger='入场曲') {
  automatic=automatic||!canChooseTarget(trigger)||phaseHasTarget(trigger);
  const n=rollAmount('damage',Math.max(3,Math.floor(cost*.5)),Math.min(10,cost+1),trigger);
  const target=automatic?'对对手的战场上的随机1个随从':'选择对手的战场上的1个随从，对其';
  const atom=(text,raw,tokens=[])=>({kind,ids:[kind],text,raw,tokens,components:[{id:kind,text,raw}]});
  switch(kind) {
    case 'damage':return atom(`${target}造成${n}点伤害。`,n*1.25);
    case 'destroy':return atom(automatic?'破坏对手的战场上的随机1个随从。':'选择对手的战场上的1个随从，破坏该随从。',7);
    case 'aoe':{const x=rollAmount('aoe',2,Math.min(5,Math.max(3,Math.floor(cost/2))),trigger);return atom(`对对手的战场上的所有随从造成${x}点伤害。`,x*3.8);}
    case 'draw':{const x=rollAmount('draw',1,3,trigger);return atom(`抽取${x}张卡牌。`,drawValue(cost,x));}
    case 'heal':{const x=rollAmount('heal',Math.max(3,Math.floor(cost*.4)),Math.min(10,cost+1),trigger);return atom(`回复自己的主战者${x}点生命值。`,x*.65);}
    case 'face':{const x=rollAmount('face',2,Math.min(5,Math.floor(cost/2)),trigger);return atom(`对对手的主战者造成${x}点伤害。`,x*2.7);}
    case 'pp':return atom('回复自己2点能量点。',7);
    case 'boost':{const x=rollAmount('boost',1,2,trigger);return atom(`使自己的所有手牌发动${x}次魔力增幅。`,x*2);}
    case 'earth':{const x=rollAmount('earth',1,2,trigger);return atom(`使自己的战场上的土之印+${x}。`,x*1.6);}
    case 'reanimate':{const x=Math.min(5,cost-3);return atom(`发动【亡者召还 ${x}】。`,x*3);}
    case 'teamBuff':return atom('使自己的战场上的其他所有随从+2/+1。',6);
    case 'tutor':{const x=rollAmount('tutor',1,searchCap(trigger),trigger);return atom(`从自己的牌组中随机将${x}张拥有【${searchKeyword}】的随从加入手牌。`,searchValue('tutor',x));}
    case 'summon':{
      const t=cls===4?TOKENS[10]:cls===3?TOKENS[9]:cls===6?pick([TOKENS[6],TOKENS[13],TOKENS[14]]):token;
      const count=t.attack>=4?1:rollAmount('tokenSummon',1,Math.min(3,Math.max(1,Math.floor(10/tokenValue(t)))),trigger);
      // Small armies may get an upgrade as part of the summon, never an unbound aura.
      const upgrade=t.attack===1&&r()<.65;
      return atom(`召唤${count}个『${t.name}』。`+(upgrade?'使这些随从+1/+1。':''),count*tokenValue(t)+(upgrade?count*1.2:0),[t]);
    }
  }
}
function pickAtom(limit,exclude=[],automatic=true,minRaw=0,trigger='入场曲') {
  const entries=[['damage',3],['destroy',1],['aoe',[3,4].includes(cls)?4:1],['draw',3],['heal',cls===6?5:1],['tutor',2],['summon',[1,2,7].includes(cls)?5:2]];
  if([0,4,5].includes(cls))entries.push(['face',2]);
  if(cls===4)entries.push(['pp',3]);
  if(cls===3)entries.push(['boost',4],['earth',3]);
  if(cls===5)entries.push(['reanimate',4]);
  if([1,2].includes(cls))entries.push(['teamBuff',4]);
  const atoms=entries.filter(([k])=>!exclude.includes(k)&&!used.has(k)).map(([k,w])=>[modularAtom(k,automatic,trigger),w]);
  const eligible=atoms.filter(([a])=>a.raw<=limit&&a.raw>=minRaw).map(([a,w])=>[a,w,1]);
  // Earth and spellboost are separate atoms, eligible alone or with any other atom.
  if(cls===3)for(let i=0;i<atoms.length;i++)for(let j=i+1;j<atoms.length;j++){
    const [a,aw]=atoms[i],[b,bw]=atoms[j],raw=a.raw+b.raw;
    if(![a.kind,b.kind].some(k=>k==='earth'||k==='boost')||raw<minRaw||raw>limit)continue;
    eligible.push([{kind:a.kind,ids:[...a.ids,...b.ids],text:a.text+b.text,raw,tokens:[...a.tokens,...b.tokens],components:[...a.components,...b.components]},Math.sqrt(aw*bw),.2]);
  }
  return eligible.length?weighted(r,eligible.map(([a,w,scale])=>[a,scale*effectWeight(a.kind==='summon'?'tokenSummon':a.kind==='tutor'?'keywordSearch':a.kind,w)*synergyWeight(a.ids,a.tokens)])):null;
}
    function signatureCore() {
  if(used.has('invocation'))return false;
  if(rarity!==3||cost<7||r()>.14+(cost-7)*.13)return false;
  const capacity=budget-floor;
  const wrapper=weighted(r,[['phase',cls===4?7:2],['cascade',cls===0?7:2],['volley',cls===2?7:2],['transmute',cls===7?7:1],['return',cls===5?7:1]]);
  const put=(id,trigger,text,raw,price,tokens=[])=>add({kind:'signature',trigger,condition:'none',text:trigger.includes('回合')?`${trigger}，${text}`:`【${trigger}】${text}`,bodyText:text,raw,price,ids:[id],tokens,major:true});
  if(wrapper==='phase') {
    const before=pickAtom(Math.min(12,capacity*.62),[],true,5);
    const after=pickAtom(Math.min(14,capacity*.62),before.ids,true,5);
    put('phaseSwitch','自己的回合结束时',`若本随从为进化前，则${before.text}若为进化后，则${after.text}`,Math.max(before.raw,after.raw),Math.max(before.raw,after.raw)*1.1,[...before.tokens,...after.tokens]);
    const timing=evolutionTiming('进化时'),bonusLimit=Math.min(12,(capacity-card.spent)/timing),bonusMinimum=3.5+cost*.2;
    const bonus=pickAtom(bonusLimit,[...before.ids,...after.ids],true,bonusMinimum)||makeEffect(bonusLimit,'进化时','none',bonusMinimum);
    if(bonus)put('phaseEvolve','进化时',bonus.text,bonus.raw,bonus.raw*timing,bonus.tokens);
  } else if(wrapper==='cascade') {
    const parts=[];
    for(let i=0;i<3;i++)parts.push(pickAtom(10,parts.flatMap(a=>a.ids)));
    const repeat=r()<.65;
    const growth=pick([2,3]);
    const tail=repeat?`本随从+${growth}/+${growth}。再次发动本随从的【入场曲】。`:`回复自己的主战者${cost}点生命值。本随从获得【屏障】。`;
    // Two of four outcomes resolve per roll; the repeat branch is drawn half
    // the time. Include every permitted continuation in expected value.
    const tailRaw=repeat?growth*2:cost*.65+2.5;
    const chainFactor=repeat?(cost>=9?1.75:1.5):1;
    const raw=(parts.reduce((s,a)=>s+a.raw,0)+tailRaw)*.5*chainFactor;
    if(raw>capacity-card.spent)return false;
    card.bodyCompensation=repeat?6:2;
    const text=`从以下能力中随机发动2个不同的能力。\n${parts.map((a,i)=>`（${i+1}）${a.text}`).join('\n')}\n（4）${tail}`+(repeat?`\n此次连锁最多额外发动${cost>=9?2:1}次入场曲。`:'');
    put('randomAssembly','入场曲',text,raw,raw,parts.flatMap(a=>a.tokens));
    const timing=evolutionTiming('超进化时'),bonus=pickAtom((capacity-card.spent)/timing);
    if(bonus)put('cascadeSuper','超进化时',bonus.text,bonus.raw,bonus.raw*timing,bonus.tokens);
  } else if(wrapper==='volley') {
    const repeats=cost>=9&&r()<.55?3:2;
    const a=pickAtom(capacity*.7/repeats,[],true,Math.max(8,5.5+cost*.35)/repeats);
    if(!a)return false;
    const trigger=pick(['超进化时','自己的回合结束时']);
    const timing=trigger==='超进化时'?.3:.85;
    const gamble=a.ids.length===1&&a.kind==='damage'&&r()<.5;
    const shot=gamble?`随机对战场上的1个其他随从或任意一方的主战者造成${Math.min(8,cost-1)}点伤害。`:a.text;
    put('repeatPayload',trigger,`发动${repeats}次“${shot}”`,a.raw*repeats,a.raw*repeats*timing,a.tokens);
    const b=pickAtom(capacity-card.spent,a.ids,false);
    if(b)put('volleyOpening','入场曲',b.text,b.raw,b.raw,b.tokens);
  } else if(wrapper==='transmute') {
    const base={id:'assembly-base',name:`${name}的胚芽`,class:cls,cost:1,attack:1,health:1,text:pick(['【突进】','【谢幕曲】抽取1张卡牌。']),custom:true};
    const size=pick([3,4]);
    const evolved={id:'assembly-evolved',name:`${name}的化身`,class:cls,cost:size,attack:size,health:size,text:pick(['【守护】【虹吸】','【突进】【毁灭】','【屏障】']),custom:true};
    const count=pick([2,3]),trigger=pick(['进化时','超进化时']);
    put('createBase','入场曲',`召唤${count}个『${base.name}』。`,count*2,count*2,[base]);
    put('transformBound',trigger,`使自己的战场上的所有『${base.name}』变身为『${evolved.name}』。`,count*size*1.6,count*size*1.6*(trigger==='进化时'?.38:.25),[base,evolved]);
    card.dependencies=[{ability:'transformBound',requires:'createBase'}];
  } else {
    const payload=pickAtom(12,[],false);
    const size=pick([3,4,5]);
    const tokenBody=pickAtom(7,['summon','pp','reanimate','teamBuff']);
    const t={id:'assembly-return',name:`${name}的余响`,class:cls,cost:size,attack:size,health:size,text:pick(['【守护】','【突进】'])+`\n【谢幕曲】${tokenBody.text}`,custom:true};
    put('openingPayload','入场曲',payload.text,payload.raw,payload.raw,payload.tokens);
    put('deathPayload','谢幕曲',`召唤1个『${t.name}』。`,size*1.6+tokenBody.raw,(size*1.6+tokenBody.raw)*.5,[t]);
  }
  card.signature=true;card.archetype='assembled-'+wrapper;
  card.corePower=card.abilities.reduce((s,a)=>s+a.raw,0);
  return true;
}
    function composeEmblem(duration,allowLastWords=false,simple=false) {
      const permanent=duration===null;
      // Crest expiration is a one-shot event, distinct from another follower's
      // death. Only finite crests can enter this pool; passive amulet engines
      // and faith engines keep their own existing lifecycle rules.
      if(allowLastWords&&!permanent&&r()<.24){
        const cap=Math.min(18,4+cost*1.1+duration*.7);
        const excluded=['pp','teamBuff',...(cost<4?['face','reanimate']:[])];
        const first=pickAtom(cap,excluded,true,2.2,'谢幕曲');
        if(first){
          const parts=[first];
          if(first.ids.length===1&&cost>=5&&r()<.25){
            const second=pickAtom(cap-first.raw,[...excluded,...first.ids],true,1.3,'谢幕曲');
            if(second&&second.ids.length===1)parts.push(second);
          }
          const payoffText=parts.map(p=>p.text).join('');
          const tokens=[...new Map(parts.flatMap(p=>p.tokens).map(t=>[t.id,t])).values()];
          return {text:'【谢幕曲】'+payoffText,eventText:'【谢幕曲】',conditionText:'',payoffText,raw:parts.reduce((s,p)=>s+p.raw,0),tokens,enabler:{text:'',raw:0,tokens:[]},eventId:'lastWords',conditionId:'none',limit:null,oneShot:true,effects:parts.flatMap(p=>p.components.map(c=>({id:c.id,raw:c.raw,produces:c.id==='summon'?['enter']:[]}))),supportTags:['lastWords']};
        }
      }
      const events=[['start','自己的回合开始时',3],['end','自己的回合结束时',4],['evolve','自己的随从进化时',1]];
      const classEvents={1:[['fairy','自己使用『妖精』时',5]],2:[['enhance','自己通过【爆能强化】使用卡牌时',5]],3:[['crystalHands','自己的『天晶魔手』进入战场时',3],['earth','自己发动【土之秘术】时',3],['costChanged','自己使用费用发生变化的随从时',3]],4:[['dragonEvolve','自己的随从进化时',3],['hurt','自己的随从受到伤害且没被破坏时',3]],5:[['death','自己的随从被破坏时',5]],6:[['heal','自己的主战者回复时',3],['amulet','自己的护符被破坏时',3],['ward','自己的拥有【守护】的随从被破坏时',2]],7:[['artifact','自己的创造物·随从进入战场时',5]]};
      events.push(...(classEvents[cls]||[]));
      if(tribal)events.push(['tribeEnter',`自己的${tribe.name}·随从进入战场时`,6],['tribeAttack',`自己的${tribe.name}·随从攻击时`,2]);
      const [eventId,eventText]=weighted(r,events.filter(e=>!simple||['start','end'].includes(e[0])).map(e=>[e,e[2]]));
      const conditions=[['none','',1,6],['hand',`若自己的手牌的张数为${pick([3,4,5])}张或以下，则`,.8,2],['board',`若自己的战场上有至少${pick([2,3])}个随从，则`,.8,1]];
      const themeConditions={1:['fairy','若本次对战中自己已使用至少5张『妖精』，则',.7],2:['rally',`【协作 ${pick([10,20])}】`,.65],3:['earth','若自己的战场上的土之印数为2或以上，则',.75],4:['overflow','若为【觉醒】，则',.75],5:['lowHealth','若自己的主战者的生命值为12或以下，则',.7],6:['amulet','若自己的战场上有护符，则',.8],7:['artifact','若本次对战中进入战场的自己的创造物·随从的种类为3种或以上，则',.65]};
      if(themeConditions[cls])conditions.push([...themeConditions[cls],3]);
      if(cls===4)conditions.push(['lowHealth','若自己的主战者的生命值为12或以下，则',.7,1]);
      const [conditionId,conditionText,conditionFactor]=weighted(r,conditions.filter(c=>!simple||c[0]==='none').map(c=>[c,c[3]]));
      const small=permanent?Math.min(2,1+Math.floor(cost/6)):Math.min(4,1+Math.floor(cost/3));
      const amount=id=>rollAmount(id,1,small,eventText);
      const pool=[];
      const part=(id,text,raw,weight=3,tokens=[],produces=[])=>pool.push({id,text,raw,weight,tokens,produces});
      const heal=amount('heal'),damage=amount('damage');
      part('draw',`抽取${!permanent&&cost>=7&&r()<.2?2:1}张卡牌。`,drawValue(cost,1),3);
      if(pool[0].text.includes('2张'))pool[0].raw=4.4;
      if(eventId!=='heal')part('heal',`回复自己的主战者${heal}点生命值。`,heal*.65,cls===6?5:3,[],['heal']);
      part('damage',`对对手的战场上的随机1个随从造成${damage}点伤害。`,damage*1.25,3);
      part('buff','使自己的战场上的随机1个随从+1/+1。',2,cls===1||cls===2?4:2);
      if([0,4,5].includes(cls)&&cost>=4)part('face',`对对手的主战者造成${permanent?1:Math.min(2,small)}点伤害。`,permanent?2.7:Math.min(2,small)*2.7,2);
      const supply=tribal?tribeToken:cls===7?artifactToken:cls===3?TOKENS[16]:TOKENS[cls];
      part('supply',`将1张『${supply.name}』加入手牌。`,tokenValue(supply,'hand'),cls===0?1:4,[supply]);
      // Enter triggers cannot summon their own next event, even with a quota.
      if(!['artifact','crystalHands','tribeEnter'].includes(eventId)&&supply.cost<=1)part('summon',`召唤1个『${supply.name}』。`,tokenValue(supply),2,[supply],['enter']);
      if(eventId==='tribeEnter'){part('tribeRush','使其获得【突进】。',1.5,3);part('tribeWard','使其获得【守护】。',1.2,3);part('tribeGrowth','使其+1/+1。',2,3);}
      if(cls===3){part('earth','使自己的战场上的土之印+1。',1.6,4);part('boost','使自己的所有手牌发动1次魔力增幅。',2,4);}
      if(cls===5)part('grave',`使自己的墓场+${small}。`,small*.7,4);
      if(cls===6)part('countdown','使自己的战场上的随机1张拥有【吟唱】的护符的倒计数-1。',1.7,4);
      const cap=permanent?3.5+cost*.08:3.8+cost*.35;
      const eligible=pool.filter(p=>p.raw<=cap);
      const first=weighted(r,eligible.map(p=>[p,p.weight]));
      const parts=[first],room=cap-first.raw;
      if(!simple&&cost>=4&&r()<(permanent?.16:.4)){
        const extras=eligible.filter(p=>p.id!==first.id&&p.raw<=room);
        if(extras.length)parts.push(weighted(r,extras.map(p=>[p,p.weight])));
      }
      const clockEvent=['start','end'].includes(eventId);
      const payoff=parts.reduce((s,p)=>s+p.raw,0);
      const feedback=parts.some(p=>p.id==='supply'&&['fairy','crystalHands','artifact','tribeEnter'].includes(eventId)||p.id==='summon'&&['death','ward'].includes(eventId)||p.id==='earth'&&eventId==='earth');
      const limit=clockEvent?null:feedback||payoff>=3.5?1:weighted(r,[[null,55],[2,30],[1,15]]);
      const quota=limit===null?'':`每回合最多发动${limit}次，`;
      const enablers={fairy:{text:'将1张『妖精』加入手牌。',raw:1,tokens:[TOKENS[1]]},crystalHands:{text:'将1张『天晶魔手』加入手牌。',raw:1,tokens:[TOKENS[16]]},artifact:{text:'将1张『解析的创造物』加入手牌。',raw:1.7,tokens:[TOKENS[8]]},heal:{text:'回复自己的主战者2点生命值。',raw:1.3,tokens:[]},earth:{text:'使自己的战场上的土之印+1。',raw:1.6,tokens:[]}};
      enablers.costChanged={text:'使自己的手牌中的随机1张随从的费用+1。',raw:.6,tokens:[]};
      const enabler=['tribeEnter','tribeAttack'].includes(eventId)?{text:`将1张『${tribeToken.name}』加入手牌。`,raw:tokenValue(tribeToken,'hand'),tokens:[tribeToken]}:enablers[eventId]||{text:'',raw:0,tokens:[]};
      const eventRate=clockEvent?1:limit===1?1.1:limit===2?1.8:['evolve','dragonEvolve','enhance'].includes(eventId)?2:3;
      const raw=Math.max(5,3+payoff*2.2*conditionFactor*eventRate);
      const tokens=[...new Map([...parts.flatMap(p=>p.tokens),...enabler.tokens].map(t=>[t.id,t])).values()];
      return {text:`${eventText}，${eventId==='hurt'?'若为自己的回合，则':''}${quota}${conditionText}${parts.map(p=>p.text).join('')}`,eventText,conditionText,payoffText:parts.map(p=>p.text).join(''),raw,tokens,enabler,eventId,conditionId,limit,effects:parts.map(p=>({id:p.id,raw:p.raw,produces:p.produces})),supportTags:[...new Set([eventId,conditionId])],engine:eventId==='crystalHands'?'crystalHands':undefined};
    }
    function addEmblem() {
      if(card.abilities.length>=5)return;
      if(card.signature||rarity===0||cost<2||r()>[0,.1,.28,.42][rarity]*synergyWeight(['emblem'+cls]))return;
      const duration=weighted(r,[[null,rarity===3?45:rarity===2?35:22],[2,22],[3,22],[4,12],[5,6]]);
      const config=composeEmblem(duration,true);
      const lifetimeValue=config.oneShot?1/(1+duration*.18):duration===null?1.4:({2:.82,3:1,4:1.12,5:1.22})[duration];
      const raw=config.raw*lifetimeValue+config.enabler.raw;
      const timings=[['入场曲',cost>=4?48:24,1],['进化时',36,evolutionTiming('进化时')],['超进化时',16,evolutionTiming('超进化时')]];
      if(config.oneShot)timings.push(['谢幕曲',cls===5?36:20,.65]);
      const affordable=timings.filter(([t,,factor])=>(!(used.has('selfEvolve')||used.has('selfSuperEvolve'))||t==='入场曲')&&raw*factor<=budget-floor-card.spent);
      if(!affordable.length)return;
      const [trigger,,factor]=weighted(r,affordable.map(t=>[t,t[1]]));
      const emblem={id:'emblem-'+cls,name:`纹章：${name}`,kind:'emblem',class:cls,custom:true,duration,engine:config.engine,eventId:config.eventId,conditionId:config.conditionId,limit:config.limit,effects:config.effects,supportTags:config.supportTags,text:(duration===null?'':`【吟唱 ${duration}】\n`)+config.text};
      // First obtain the emblem, then provide its matching enabler. This also makes
      // Haven healing / Portal artifacts useful immediately instead of a stranded aura.
      const enabler=config.enabler.text;
      const price=raw*factor;
      if(price>budget-floor-card.spent)return;
      const text=`使自己获得『${emblem.name}』。${enabler}`;
      add({kind:'emblem',trigger,condition:'none',text:`【${trigger}】${text}`,bodyText:text,raw,price,ids:['emblemGrant'],emblemIds:[emblem.id],tokens:config.tokens,major:cost>=6});
      card.emblems.push(emblem);
    }
    function addFaith() {
      if(card.abilities.length>=5)return;
      if(card.signature||used.has('selfEvolve')||used.has('selfSuperEvolve')||vanilla||rarity!==3||cost<2||![1,2,3,5,6].includes(cls)||r()>.055)return;
      // Acquisition events and conversion rewards are independent, including original rules.
      const events=[['evolve','自己的随从进化',3],['attack','自己的随从攻击',3],['spell','自己使用法术',3],['death','自己的随从被破坏',3],['play','自己使用卡牌',2],['draw','自己抽取卡牌',2]];
      const themed={1:[['fairy','自己使用『妖精』',5],['return','自己的卡牌从战场返回手牌',4]],2:[['enhance','自己通过【爆能强化】使用卡牌',5],['enter','自己的随从进入战场',4]],3:[['crystalHands','自己的『天晶魔手』进入战场',5],['earth','自己发动【土之秘术】',4]],5:[['mode','自己选择【模式】',5],['selfDamage','自己的主战者受到伤害',4]],6:[['amuletDeath','自己的护符被破坏',5],['activate','自己【启动】护符',4],['heal','自己的主战者回复生命值',4]]};
      events.push(...themed[cls]);
      const gainRules=[];
      for(let i=0,n=r()<.18?2:1;i<n;i++){
        const [eventId,eventText]=weighted(r,events.filter(e=>!gainRules.some(g=>g.eventId===e[0])).map(e=>[e,e[2]]));
        const every=pick(eventId==='play'||eventId==='draw'||eventId==='enter'?[2,3,4]:[1,2,3]);
        gainRules.push({eventId,every,amount:1,text:`本次对战中，每当「${eventText}」累计发生${every}次，信仰值+1。`});
      }
      const faith={id:'faith-'+cls,name:`信仰：${name}`,kind:'faith',initial:0,start:'battle',counter:gainRules[0].eventId,gainRules,maxValue:null};
      faith.text='信仰值起始为0。\n'+gainRules.map(g=>g.text).join('\n');
      const trigger=weighted(r,[['入场曲',4],['进化时',4],['超进化时',2]]);
      const minPayoff=trigger==='进化时'?3.5+cost*.2:trigger==='超进化时'?5.5+cost*.35:0;
      const timing=trigger==='入场曲'?1:evolutionTiming(trigger);
      let text,raw,tokens=[],emblem=null,spend;
      if(r()<.58){
        const c=composeEmblem(null),unlock=pick([2,3,4]),fee=Math.max(1,Math.ceil(c.effects.reduce((s,e)=>s+e.raw,0)/1.5));
        const quota=c.limit===null?'':`每回合最多发动${c.limit}次，`;
        emblem={id:'faith-emblem-'+cls,name:`纹章：${name}的祈愿`,kind:'emblem',class:cls,custom:true,duration:null,engine:c.engine,eventId:c.eventId,conditionId:c.conditionId,limit:c.limit,effects:c.effects,supportTags:c.supportTags,faithIds:[faith.id],faithCost:fee,
          text:`${c.eventText}，${quota}${c.conditionText}若自己的『${faith.name}』的信仰值为${fee}或以上，则消耗其中${fee}点信仰值，并${c.payoffText}`};
        raw=c.raw*1.4;tokens=c.tokens.filter(t=>emblem.text.includes(`『${t.name}』`));
        text=`若自己的『${faith.name}』的信仰值为${unlock}或以上，则消耗其中${unlock}点信仰值，并使自己获得『${emblem.name}』。`;
        spend={kind:'emblem',amount:unlock,upkeep:fee,unbounded:true};
      }else{
        const t=cls===3?TOKENS[16]:cls===1?TOKENS[1]:cls===2?TOKENS[2]:cls===5?TOKENS[5]:TOKENS[6];
        const reward=weighted(r,[['growth',cls===3?55:25],['hand',cls===3?30:55],['summon',20]]);
        const summon=reward!=='hand',unitRaw=tokenValue(t,summon?'summon':'hand');
        const fee=Math.max(2,Math.ceil(unitRaw/1.4)+pick([0,1]));
        raw=reward==='growth'?unitRaw+(cost>=6?3:2)*2:unitRaw*(cost>=6?3:2);tokens=[t];
        // Snapshot and pay first: tokens that earn faith cannot extend this resolution.
        text=`X为发动此能力前自己的『${faith.name}』的信仰值除以${fee}并向下取整后的值。若X大于0，则消耗其中X×${fee}点信仰值，并`+(reward==='growth'?`召唤1个『${t.name}』，使其+X/+X。`:summon?`召唤X个『${t.name}』。`:`将X张『${t.name}』加入手牌。`);
        spend={kind:reward,amount:fee,snapshot:true,unbounded:true,tokenId:t.id};
      }
      if(raw<minPayoff){const n=Math.ceil((minPayoff-raw)/2.2);text=`抽取${n}张卡牌。`+text;raw+=n*2.2;}
      const faithFactor=emblem?.48:.6;
      const price=raw*(trigger==='入场曲'?faithFactor:Math.max(faithFactor*timing,timing*.8));
      if(price>budget-floor-card.spent)return;
      add({kind:'faithPayoff',trigger,condition:'faith',text:`【${trigger}】${text}`,bodyText:text,raw,price,minPayoff,ids:['faithPayoff'],faithIds:[faith.id],faithSpend:spend,emblemIds:emblem?[emblem.id]:[],tokens,major:cost>=6});
      if(emblem)card.emblems.push(emblem);
      card.faiths.push(faith);
    }
    function highCore() {
  if(card.abilities.length>=5)return;
  const capacity=budget-floor-card.spent;
  if(simpleDesign){
    const trigger=weighted(r,[['入场曲',4],['谢幕曲',cls===5?3:1]]),timing=trigger==='谢幕曲'?.65:1;
    const kinds=['damage','destroy','aoe','summon'];
    if([0,4,5].includes(cls))kinds.push('face');
    const atoms=kinds.filter(k=>!used.has(k)).map(k=>modularAtom(k,trigger==='谢幕曲',trigger));
    const fitting=atoms.filter(a=>a.raw<=capacity/timing);
    const strong=fitting.filter(a=>a.raw>=6+Math.max(0,cost-6)*.8);
    const main=(strong.length?strong:fitting);
    if(main.length){
      const a=weighted(r,main.map(a=>[a,effectWeight(a.kind==='summon'?'tokenSummon':a.kind,3)]));
      const put=(atom,id)=>add({kind:'core',trigger,condition:'none',text:`【${trigger}】${atom.text}`,bodyText:atom.text,raw:atom.raw,price:atom.raw*timing,ids:[id,...atom.ids],components:atom.components,tokens:atom.tokens,major:true});
      put(a,'coreAnchor');
      if(a.raw<8||cost>=8&&a.raw<10){
        const extras=['draw','heal'].filter(id=>!used.has(id)).map(id=>modularAtom(id,true,trigger)).filter(e=>a.raw+e.raw>=8&&e.raw*timing<=budget-floor-card.spent);
        if(extras.length)put(pick(extras),'coreSupport');
      }
    }
    if(oversized&&!used.has('守护'))add(keyword('守护'));
    card.archetype=oversized?'colossalRemoval':'simpleHighCost';
    card.corePower=card.abilities.reduce((s,a)=>s+a.raw,0);
    return;
  }
  const autoEvolution=used.has('selfEvolve')||used.has('selfSuperEvolve');
  const mainTrigger=oversized||autoEvolution?'入场曲':weighted(r,['入场曲','进化时','超进化时','谢幕曲'].map(t=>[t,triggerWeight(t)]));
  const mainTiming=['进化时','超进化时'].includes(mainTrigger)?evolutionTiming(mainTrigger):mainTrigger==='谢幕曲'?.65:1;
  const main=oversized&&capacity>=7?modularAtom('destroy',false):pickAtom(Math.min(capacity/mainTiming,Math.max(5.5,capacity*.72/mainTiming)),['draw','heal','tutor','pp','boost'],mainTrigger==='谢幕曲',5.5,mainTrigger)||pickAtom(capacity/mainTiming,[],mainTrigger==='谢幕曲',0,mainTrigger);
  const put=(id,a,trigger,price)=>add({kind:'core',trigger,condition:'none',text:`【${trigger}】${a.text}`,bodyText:a.text,price,raw:a.raw,ids:[id,...a.ids],components:a.components,tokens:a.tokens,major:true});
  if(main)put('coreAnchor',main,mainTrigger,main.raw*mainTiming);
  if(oversized)add(keyword('守护'));
  const trigger=autoEvolution?'入场曲':weighted(r,['入场曲','进化时','超进化时'].map(t=>[t,profile.triggers[t]]));
  const timing=trigger==='入场曲'?1:evolutionTiming(trigger);
  const minimum=Math.max(8-card.abilities.reduce((s,a)=>s+a.raw,0),trigger==='进化时'?3.5+cost*.2:trigger==='超进化时'?5.5+cost*.35:0);
  const support=card.abilities.length<5?pickAtom(Math.min(16,(budget-floor-card.spent)/timing),main?main.ids:[],trigger!=='入场曲',minimum,trigger):null;
  if(support)put('coreSupport',support,trigger,support.raw*timing);
  else if(card.abilities.length<5&&card.abilities.reduce((s,a)=>s+a.raw,0)<8) {
    // A sampled evolution payload may not fit; preserve the core payoff with
    // a smaller immediate effect instead of leaving only a weak anchor.
    const extra=pickAtom(budget-floor-card.spent,main?main.ids:[],false,8-card.abilities.reduce((s,a)=>s+a.raw,0));
    if(extra)put('coreSupport',extra,'入场曲',extra.raw);
  }
  if(cls===3&&cost>=8&&!used.has('spellboostDiscount')&&card.abilities.length<5&&budget-floor-card.spent>=5&&r()<.3)add({kind:'static',trigger:'魔力增幅时',condition:'none',text:'【魔力增幅时】使本卡牌的费用-1。',price:5,raw:9,ids:['costReduction']});
  card.archetype=oversized?'colossalRemoval':'modularCore';
  card.corePower=card.abilities.reduce((s,a)=>s+a.raw,0);
}
    function addCrystalHandLink() {
      if(cls!==3||card.signature||vanilla||rarity===0||cost<3||card.abilities.length>3||r()>.28)return;
      const links=[
        {trigger:'自己的『天晶魔手』进入战场时',text:'自己的『天晶魔手』进入战场时，回复自己的主战者1点生命值。',raw:2.5},
        {trigger:'自己的『天晶魔手』攻击时',text:'自己的『天晶魔手』攻击时，使其+1/+0。',raw:3}
      ];
      if(cost>=7&&!used.has('costReduction'))links.push({trigger:'在手牌中发动',text:'在手牌中发动。自己的『天晶魔手』进入战场时，使本卡牌的费用-1。',raw:4,discount:true});
      const link=pick(links),count=weighted(r,[[1,2],[2,4],[3,cost>=6?3:1]]),summon=r()<.65;
      const id=summon?'crystalHandSummon':'crystalHandSupply',price=tokenValue(TOKENS[16],summon?'summon':'hand')*count;
      if(used.has(id)||price+link.raw>budget-floor-card.spent)return;
      const text=summon?`召唤${count}个『天晶魔手』。`:`将${count}张『天晶魔手』加入手牌。`;
      add({kind:'effect',trigger:'入场曲',condition:'none',text:'【入场曲】'+text,bodyText:text,raw:price,price,boardValue:summon?price:0,ids:[id],tokens:[TOKENS[16]]});
      add({kind:'static',trigger:link.trigger,condition:'none',text:link.text,bodyText:link.text,raw:link.raw,price:link.raw,ids:['crystalHandLink',...(link.discount?['crystalHandCostReduction']:[])],tokens:[TOKENS[16]]});
    }
    function tradeBodyForPower() {
      if(simpleDesign||card.signature||vanilla||oversized||card.rampBodyTrade||cost<2||card.abilities.length>=4||r()>[.10,.18,.27,.34][rarity])return;
      const loss=Math.min(floor-(cost>=6?4:2),pick(cost>=6?[4,6,8]:[2,3,4]));
      const available=budget-floor-card.spent+loss;
      // A cheap body trade buys one meaningful effect, not a resource atom
      // padded with another effect just to reach an arbitrary minimum.
      const payoff=makeEffect(Math.min(available,loss+6),'入场曲','none',cost<=3?Math.max(1.3,loss):loss+2,true,cost,false,cost<=3?{maxAtoms:1}:null);
      if(!payoff)return;
      floor-=loss;card.bodyAllowance=floor;
      card.bodyTrade={lost:loss,payoffRaw:payoff.raw};
      add({...payoff,kind:'bodyPayoff',trigger:'入场曲',condition:'none',text:'【入场曲】'+payoff.text,bodyText:payoff.text,price:payoff.raw,ids:['bodyPayoff',...payoff.ids],major:true});
      card.corePower=(card.corePower||0)+payoff.raw;
    }
    function addSpecialMechanic() {
      if(card.signature||vanilla||rarity===0||card.abilities.length>=4)return;
      const remaining=budget-floor-card.spent;
      if(cost>=3&&remaining>=3.5&&r()<.13) {
        const material=cls===3?'法术':cls===6?'护符':cls===7?'创造物·卡牌':'随从';
        const scaled=r()<.55;
        const threshold=scaled?1:weighted(r,[[1,6],[2,3],[3,cost>=6?2:1]]),factor=.65,credit=threshold*.7;
        const limit=Math.min(24,(remaining+credit)/factor);
        let payload=null,spec=null,prefix='';
        if(scaled){
          // Reuse numeric effect atoms, token valuations and class restrictions.
          // The cap prices the strongest result; X counts cards, not fusion actions.
          const scalable=['damage','draw','buff','heal','tokenHand','tokenSummon','boost','earth','grave','crystalHandSupply','crystalHandSummon'];
          const choices=[];
          for(const e of effects.filter(e=>scalable.includes(e.id)&&!used.has(e.id)&&(!e.exclusive||e.classes.includes(cls)))){
            const ts=e.id.startsWith('token')?[token]:e.id.startsWith('crystalHand')?[TOKENS[16]]:[];
            const unit=ts.length?tokenValue(ts[0],e.id.endsWith('Summon')?'summon':'hand'):e.price;
            const capLimit=['damage','heal'].includes(e.id)?Math.min(10,cost+2):e.id==='buff'?Math.min(5,Math.ceil(cost/2)):Math.min(e.max,cost>=6?3:2);
            const cap=Math.min(capLimit,Math.floor(limit/unit));if(cap<2)continue;
            const multiplier=['damage','heal','buff'].includes(e.id)&&cap>=4&&r()<.45?2:1;
            const atomText=e.id==='damage'?'对对手的战场上的随机1个随从造成X点伤害。':e.text('X').replace('$TOKEN',token.name);
            const raw=unit*cap;
            choices.push([{ids:[e.id],raw,boardValue:['buff','tokenSummon','crystalHandSummon'].includes(e.id)?raw:0,tokens:ts,text:atomText,cap,multiplier},effectWeight(e.id,e.weight)*synergyWeight([e.id],ts)]);
          }
          if(choices.length){
            payload=weighted(r,choices);
            spec={mode:'count',cap:payload.cap,multiplier:payload.multiplier};
            payload.text+=`X为与本卡牌融合的卡牌张数${payload.multiplier===1?'':`的${payload.multiplier}倍`}（上限${payload.cap}）。`;
            prefix='若已与本卡牌【融合】，则';
          }
        }
        if(!payload){
          const minimum=2+threshold*1.2;
          payload=makeEffect(limit,'入场曲','fusion',minimum,true,Math.min(10,cost+threshold-1));
          if(payload&&r()<.35){
            const saved=new Set(used);payload.ids.forEach(id=>used.add(id));
            const other=makeEffect(limit-payload.raw,'入场曲','fusion',1.3,true,cost,targeted(payload.text));
            used.clear();saved.forEach(id=>used.add(id));
            if(other)payload={ids:[...payload.ids,...other.ids],text:payload.text+other.text,raw:payload.raw+other.raw,boardValue:(payload.boardValue||0)+(other.boardValue||0),tokens:[...payload.tokens,...other.tokens]};
          }
          spec={mode:'threshold',threshold};
          prefix=threshold===1?'若已与本卡牌【融合】，则':`若与本卡牌融合的卡牌张数为${threshold}或以上，则`;
        }
        if(payload){
          const text=prefix+payload.text,price=Math.max(.8,payload.raw*factor-credit);
          card.fusion={material,count:'cards',oncePerTurn:true,...spec,effects:[...payload.ids]};
          add({...payload,kind:'fusion',trigger:'入场曲',condition:'fusion',text:`【融合】${material}\n【入场曲】${text}`,bodyText:text,price,ids:['fusionPayoff',...payload.ids]});
          return;
        }
      }
      if(cost<5||remaining<1.2||r()>.23)return;
      const crystallize=r()<(cls===6?.7:.3);
      const fee=crystallize?pick([1,2,3]):weighted(r,[[1,22],[2,30],[3,25],[4,15],[5,8]].filter(([n])=>n<cost));
      const kind=crystallize?'结晶':'激奏';
      const form={id:'alternate',kind,cost:fee,type:crystallize?'护符':'法术'};
      const flexibility=crystallize?1.2:1.2+fee*.2;
      if(flexibility>remaining)return;
      if(crystallize) {
        // The amulet summons the follower: it does not play it or trigger Fanfare.
        form.countdown=Math.max(2,cost-fee-1);
        form.text=`【吟唱 ${form.countdown}】\n【谢幕曲】召唤1个『${name}』。`;
      } else {
        const spell=generateCard(name,{cost:fee,cls,rarity,token});
        Object.assign(form,{text:spell.abilities.map(a=>a.text).join('\n\n'),abilities:spell.abilities,budget:spell.budget,spent:spell.spent,tokens:spell.tokens,emblemIds:spell.emblems.map(e=>e.id)});
        card.emblems.push(...spell.emblems);
      }
      card.alternateForms.push(form);
      add({kind:'alternate',trigger:kind,condition:'alternate',text:`【${kind} ${fee}】以${form.type}形态使用，能力见下方。`,bodyText:'',raw:flexibility,price:flexibility,ids:[crystallize?'crystallize':'accelerate'],tokens:form.tokens||[],emblemIds:form.emblemIds||[]});
    }
    function gate(trigger) {
      if(trigger==='爆能强化'){
        const fee=Math.min(10,cost+2+Math.floor(r()*2));
        // The original body and abilities still resolve. Buy only incremental
        // value, with a larger premium for committing a high total PP cost.
        const extra=(ABILITY[fee]-ABILITY[cost])*.8+(fee-cost)*1.2+Math.max(0,fee-6)*.75;
        const minRaw=Math.max(5,extra*.8,fee>=7?6+(fee-6)*2:0);
        return {id:'enhance',fee,text:`【爆能强化 ${fee}】`,factor:1,extra,minRaw};
      }
      if(r()>[.2,.33,.45,.55][rarity])return {id:'none',text:'',factor:1,extra:0};
      const fallback=[0,7].includes(cls)?{id:'singleton',text:'若自己的牌组中没有重复随从，则',factor:.38,extra:3,minRaw:6,effectBoost:2,difficult:true}:{id:'none',text:'',factor:1};
      const lowHealth=()=>{const threshold=pick([10,12]);return {id:'lowHealth',text:`若自己的主战者的生命值为${threshold}或以下，则`,threshold,factor:threshold===10?.32:.42,extra:threshold===10?3:2,minRaw:threshold===10?7:5.5,effectBoost:threshold===10?2:1,difficult:true};};
      const discard=()=>{const amount=weighted(r,[[1,8],[2,cost>=4?2:0]]);return {id:'discard',text:`随机舍弃自己的${amount}张手牌。若以此舍弃了${amount}张卡牌，则`,factor:1,amount,difficult:true,extra:amount*2.5,minRaw:amount*3+1,effectBoost:amount};};
      const systemWeight=id=>Math.max(1,Math.sqrt(CALIBRATION.mechanisms[id].followers));
      const special={
        1:cost<=5?(()=>{const n=pick(cost<=3?[3,4,5]:[2,3]);return {id:'combo',text:`【连击 ${n}】`,requirement:n,difficult:true,factor:({2:.76,3:.64,4:.52,5:.42})[n],extra:({2:0,3:1,4:2.5,5:4})[n],minRaw:({2:2,3:4,4:6.5,5:9})[n],effectBoost:Math.max(0,n-3)};})():{id:'forestHistory',text:'若本次对战中自己已使用至少5张『妖精』，则',factor:.72},
        2:weighted(r,[[{id:'board',text:'若自己的战场上有至少3个其他随从，则',factor:.7},3],[(()=>{const n=weighted(r,[[10,4],[20,cost>=5?3:1]]);return {id:'rally',text:`【协作 ${n}】`,factor:n===20?.5:.7,minRaw:n===20?7:3};})(),systemWeight('rally')]]),
        3:weighted(r,[[(()=>{const n=weighted(r,[[1,6],[2,3],[3,cost>=4?1:0]]);return {id:'earth',text:`【土之秘术 ${n}】`,amount:n,difficult:true,factor:({1:.8,2:.68,3:.58})[n],extra:({1:1.2,2:3,3:5.5})[n],minRaw:n*3+(n===3?.5:0),effectBoost:n-1};})(),systemWeight('earth')],[{id:'spells',text:'若本次对战中自己已使用至少5张法术，则',factor:.65},2]]),
        4:weighted(r,[[{id:'overflow',text:'若为【觉醒】，则',factor:.68},5],[{id:'ppFull',text:'若自己的能量点最大值为10，则',factor:.6,minRaw:4},2],[lowHealth(),2],[discard(),5]]),
        5:weighted(r,[[(()=>{const weights=cost<=3?[32,46,16,4,2]:cost<=6?[20,46,25,6,3]:[10,42,30,13,5];const amount=weighted(r,[2,4,6,8,10].map((n,i)=>[n,weights[i]]));return {id:'necromancy',text:`【唤灵 ${amount}】`,factor:1,amount,difficult:true,extra:amount*1.2-1,minRaw:amount*1.2,effectBoost:Math.max(0,Math.floor((amount-4)/2))};})(),6],[lowHealth(),systemWeight('lowHealth')+1]]),
        6:weighted(r,[[{id:'amulet',text:'若自己的战场上有至少2张护符，则',factor:.68},systemWeight('amulet')],[{id:'amuletHistory',text:'若本次对战中已有至少3张自己的护符被破坏，则',factor:.65},2],[{id:'wardBoard',text:'若自己的战场上有其他拥有【守护】的随从，则',factor:.72},systemWeight('ward')]]),
        7:weighted(r,[[{id:'artifact',text:'若本次对战中自己已有至少3个创造物·随从被破坏，则',factor:.65},2],[{id:'artifactKinds',text:'若本次对战中进入战场的自己的创造物·随从的种类为3种或以上，则',factor:.6,minRaw:4},systemWeight('artifact')]])
      };
      if(cls===3&&r()<(used.has('handCostUp')?.38:.2))special[3]={id:'costChanged',text:`若本卡牌的费用不为${cost}，则`,factor:.65,extra:1,minRaw:2};
      let selected={extra:0,...(special[cls]&&r()<.84?special[cls]:fallback)};
      // Match-wide evolution history is a reusable gate, not a fixed card package.
      if(rarity>=1&&rng(hash(seed+'|evolution-history|'+trigger+'|'+card.abilities.length))()<.13){
        const n=weighted(r,[[3,4],[5,4],[7,cost>=5?2:1]]);
        selected={id:'evolutionHistory',text:`若本次对战中自己的随从的进化次数为${n}次或以上，则`,requirement:n,factor:n===3?.75:n===5?.6:.48,extra:0,minRaw:n===3?2:n===5?4:6};
      }
      // Last Words and generic board events can resolve during either player's
      // turn. Only explicitly own-turn timings may spend a combo condition.
      const ownTurn=['入场曲','法术','进化时','超进化时','攻击时','启动','自己的回合开始时','自己的回合结束时'];
      if(selected.id==='combo'&&!ownTurn.includes(trigger))return {id:'none',text:'',factor:1,extra:0};
      // Meeting a persistent condition once enables every matching clause;
      // unlike paid soil/graves/discards, it is not another resource payment.
      if(['evolutionHistory','singleton','lowHealth','overflow','board','rally','spells','costChanged','forestHistory','amulet','amuletHistory','wardBoard','artifact','artifactKinds','ppFull','combo'].includes(selected.id)){
        const repeats=card.abilities.filter(a=>a.condition===selected.id).length;
        selected.factor=1-(1-selected.factor)/(1+repeats);
        selected.extra/=1+repeats;
      }
      return selected;
    }
    function makeEffect(maxPrice,trigger,condition,minRaw=0,allowResourceSupport=true,effectCost=cost,blockTarget=false,complexity=null) {
      const resourceIds=['draw','handCycle','handRefill','handCycleTutor','handRefresh','keywordSearch','typeSearch','tribeSupply','wardSearch','amuletSearch','bloodDraw','opponentHandCopy','opponentDeckCopy','opponentCopyTransform'];
      const repeating=!['入场曲','进化时','超进化时','谢幕曲','爆能强化','法术','启动'].includes(trigger);
      const isAutomatic=!canChooseTarget(trigger);
      const targetBlocked=!isAutomatic&&(blockTarget||phaseHasTarget(trigger));
      const cheapBase=effectCost<=3&&condition==='none'&&['入场曲','谢幕曲','法术'].includes(trigger);
      const advantageIds=['draw','handRefill','keywordSearch','typeSearch','wardSearch','amuletSearch','tutor','bloodDraw','opponentHandCopy','opponentDeckCopy'];
      // Count granted emblems as part of the card's resource package, too.
      const hasAdvantage=cheapBase&&card.abilities.some(a=>a.condition==='none'&&['入场曲','谢幕曲','法术'].includes(a.trigger)&&(
        a.ids.some(id=>advantageIds.includes(id))||a.emblemIds?.some(id=>card.emblems.find(e=>e.id===id)?.effects.some(e=>['draw','tutor','supply'].includes(e.id)))
      ));
      const pool=effects.filter(e=>!used.has(e.id)&&(!e.types||e.types.includes(type))&&(!e.exclusive||e.classes.includes(cls))&&
        !(hasAdvantage&&advantageIds.includes(e.id))&&
        (!complexity?.simple||['draw','damage','heal','allyBuff','face','aoe','destroy','banish','smallDestroy','teamBuff','bounce','enemyBounce','boost','earth','ramp','grave','amulet','tokenHand','tokenSummon','handBuff','allBoardDamage','splitDamage','grantRush','grantWard','grantBarrier'].includes(e.id))&&
        !(complexity?.simple&&e.id.startsWith('token')&&token.custom)&&
        !(trigger.includes('受到伤害')&&['allyPing','allBoardDamage'].includes(e.id))&&
        !(['restoreEP','restoreSEP'].includes(e.id)&&(!['入场曲','法术','爆能强化'].includes(trigger)||effectCost<(e.id==='restoreEP'?3:7)||(e.id==='restoreSEP'&&rarity<2)))&&
        !(e.id==='handRefresh'&&effectCost<3)&&
        !(e.id.startsWith('tribe')&&!tribal)&&
        !(e.id==='tribeEvolve'&&(effectCost<3||trigger.includes('随从进化时')))&&
        !(targetBlocked&&targeted(e.text(1)))&&
        !(type!=='follower'&&e.id==='buff')&&
        !(['selfEvolve','selfSuperEvolve'].includes(e.id)&&(!['入场曲','爆能强化','自己的回合结束时'].includes(trigger)||cost<2||(condition==='none'&&cost<5)))&&
        !(['selfEvolve','selfSuperEvolve'].includes(e.id)&&condition==='none'&&!unconditionalSelfEvolution)&&
        !(['selfEvolve','selfSuperEvolve'].includes(e.id)&&(used.has('selfEvolve')||used.has('selfSuperEvolve')))&&
        !(['selfEvolve','selfSuperEvolve'].includes(e.id)&&card.abilities.some(a=>['进化时','超进化时'].includes(a.trigger)))&&
        !(e.id==='selfSuperEvolve'&&(cost<7||rarity<3))&&
        !(e.id==='allyEvolve'&&(effectCost<3||trigger==='本随从进化时'||trigger.includes('随从进化时')))&&
        !(e.id==='teamEvolve'&&(effectCost<7||rarity<2||!['入场曲','法术','爆能强化','启动'].includes(trigger)))&&
        !(e.id==='boardWipe'&&card.abilities.some(a=>(a.trigger===trigger||(trigger==='爆能强化'&&['法术','入场曲'].includes(a.trigger)))&&a.ids.some(id=>['tokenSummon','crystalHandSummon','reanimate','recruit','artifactCopy','allyBuff','teamBuff','wardBuff','artifactBuff','crystalHandBuff','grantRush','grantWard','grantBarrier'].includes(id))))&&
        !(e.id==='selfCopy'&&(repeating||card.signature||cost<2))&&
        !(trigger.includes('进入战场时')&&['tokenSummon','crystalHandSummon','reanimate'].includes(e.id))&&
        (allowResourceSupport||!resourceIds.includes(e.id))&&
        !(condition==='earth'&&e.id==='earth')&&!(condition==='necromancy'&&e.id==='grave')&&
        !(trigger==='入场曲'&&condition==='none'&&e.id==='buff')&&
        !(trigger==='谢幕曲'&&['buff','allyBuff','teamBuff','bounce'].includes(e.id))&&
        !(repeating&&['ramp','artifactCopy','amuletRecruit','amuletRevive'].includes(e.id))&&
        !(condition==='ppFull'&&e.id==='ramp')&&
        !(effectCost<4&&['artifactCopy','amuletRecruit','amuletRevive'].includes(e.id)&&!['进化时','超进化时'].includes(trigger))&&
        !(effectCost<4&&['destroy','banish','reanimate'].includes(e.id)&&condition!=='necromancy'&&!['进化时','超进化时'].includes(trigger))&&
        !(e.id==='ramp'&&(effectCost<3||(cost<3&&trigger!=='爆能强化'))));
      const options=[];
      for(const e of pool) {
        let price=e.price,tokens=[];
        if(e.id==='draw')price=drawValue(effectCost,1);
        const search=searchIds.has(e.id);
        if(search)price=searchValue(e.id,1);
        if(e.id==='selfCopy')price=floor*.85+3+card.abilities.filter(a=>a.kind==='static'||a.trigger==='自己的回合结束时').reduce((s,a)=>s+a.raw,0)*.35+card.abilities.filter(a=>a.ids.includes('疾驰')).reduce((s,a)=>s+a.price,0);
        if(e.id.startsWith('token')) {
          tokens=[token];
          price=tokenValue(token,e.id==='tokenSummon'?'summon':'hand');
        }
        if(e.id==='artifact'){tokens=[artifactToken];price=tokenValue(artifactToken,'hand');}
        if(e.id==='tribeSupply'){tokens=[tribeToken];price=tokenValue(tribeToken,'hand');}
        if(e.id.startsWith('crystalHand'))tokens=[TOKENS[16]];
        // A one-PP immediate summon cannot add a full second body for free.
        // Price the token together with the delivery card, not as an isolated atom.
        const cheapSummon=cost===1&&effectCost===1&&condition==='none'&&['tokenSummon','crystalHandSummon'].includes(e.id);
        if(cheapSummon&&['入场曲','法术'].includes(trigger)){
          const t=tokens[0],stats=t.attack+t.health;
          if(type==='follower'&&(stats>2||price>1.8))continue;
          if(type!=='follower'){
            if(stats>3||price>2.5)continue;
            // Even a smaller summon uses most of a one-cost spell's allowance;
            // a 1/2 consumes all of it, including the random power variation.
            price=Math.max(price,card.budget*(stats>=3?1:.85));
          }
        }
        const overhead=e.id==='handRefill'?.7:0;
        if(price+overhead>maxPrice)continue;
        const evolved=trigger==='进化时'||trigger==='超进化时';
        const buffCap=trigger==='爆能强化'?Math.floor(effectCost/2)+1:Math.ceil(effectCost/3)+(evolved?1:0);
        const numericCaps={damage:type==='follower'?effectCost+1+(evolved?1:0)+(condition!=='none'?1:0):2*effectCost+1,splitDamage:effectCost*2+2,selfCopy:effectCost>=6?2:1,missingHealthDamage:effectCost+2,artifactCopy:effectCost>=7?2:1,amuletRecruit:effectCost>=7?2:1,face:Math.max(1,Math.ceil(effectCost/2))+(evolved?1:0),aoe:Math.max(1,Math.ceil(effectCost/2))+(evolved?1:0),heal:effectCost+2+(evolved?1:0),buff:buffCap,allyBuff:buffCap};
        const maximum=type!=='follower'&&e.id==='tokenSummon'?Math.min(5,Math.floor(effectCost/2)+1):e.max;
        let max=Math.min(maximum,numericCaps[e.id]||Infinity,Math.floor((maxPrice-overhead)/price));
        if(e.id==='draw')while(max>0&&drawValue(effectCost,max)>maxPrice)max--;
        if(search){
          const already=card.abilities.filter(a=>phase(a.trigger)===phase(trigger)).reduce((s,a)=>s+searchCount(a.text),0);
          max=Math.min(max,searchCap(trigger,effectCost)-already);
          while(max>0&&searchValue(e.id,max)>maxPrice)max--;
        }
        if(copyIds.has(e.id)){
          // Hidden random copies are resources, with cost-based quantity caps.
          max=Math.min(max,repeating?1:effectCost>=7?3:effectCost>=4?2:1);
          while(max>0&&copyValue(e.id,max)>maxPrice)max--;
        }
        const resource=resourceIds.includes(e.id);
        const burst=['入场曲','进化时','超进化时','谢幕曲','爆能强化','法术','本随从进化时'].includes(trigger);
        const damageFloor=!burst?1:['damage','splitDamage'].includes(e.id)?(effectCost>=7?3:effectCost>=4?2:1):['face','aoe'].includes(e.id)&&effectCost>=6?2:1;
        const min=resource?1:Math.max(damageFloor,Math.ceil(minRaw/price));
        if(min>max)continue;
        const n=rollAmount(e.id,min,max,trigger,effectCost);
        const automatic={
          handBuff:`使自己的手牌中的随机1张随从+${n}/+${n}。`,
          handCostUp:'使自己的手牌中的随机1张随从的费用+1。',
          allyPing:'对自己的战场上的随机1个随从造成1点伤害。',
          opponentCopyTransform:'使自己的随机1张手牌变身为对手的牌组中的随机1张卡牌的复制卡牌。',
          handCycle:`使自己的随机${n}张手牌返回牌组。抽取${n}张卡牌。`,
          handRefill:`使自己的随机1张手牌返回牌组。若以此使卡牌返回了牌组，则抽取${n+1}张卡牌。`,
          handCycleTutor:'使自己的随机1张手牌返回牌组。若以此使卡牌返回了牌组，则从自己的牌组中随机将1张$SEARCH加入手牌。',
          damage:`对对手的战场上的随机1个随从造成${n}点伤害。`,
          destroy:'破坏对手的战场上的随机1个随从。',
          banish:'使对手的战场上的随机1个随从消失。',
          smallDestroy:'破坏对手的战场上的随机1个费用为3或以下的随从。',
          enemyBounce:'使对手的战场上的随机1个随从返回手牌。'
        };
        if(trigger==='交战时'){automatic.damage=`对交战对手造成${n}点伤害。`;automatic.destroy='破坏交战对手。';}
        automatic.allyBuff=`使自己的战场上的随机1个其他随从+${n}/+${n}。`;
        automatic.bounce='使自己的战场上的随机1张其他卡牌返回手牌。';
        automatic.allyEvolve=`使自己的战场上的随机1个进化前的${trigger==='谢幕曲'?'':'其他'}随从进化。`;
        automatic.tribeEvolve=`使自己的战场上的随机1个进化前的${tribe?.name}·随从进化。`;
        Object.assign(automatic,{grantRush:'使自己的战场上的随机1个随从获得【突进】。',grantWard:'使自己的战场上的随机1个随从获得【守护】。',grantBarrier:'使自己的战场上的随机1个随从获得【屏障】。'});
        let text=isAutomatic&&automatic[e.id]?automatic[e.id]:e.text(n).replace('$TOKEN',token.name).replace('$SELF',name).replace('$ARTIFACT',artifactToken.name).replace('$KEYWORD',searchKeyword).replace('$SEARCH',searchType);
        text=text.replace('$TRIBETOKEN',tribeToken?.name||'').replace('$TRIBE',tribe?.name||'').replace('$SEARCH',searchType);
        // New targeted atoms must supply an automatic variant before joining this pool.
        if(isAutomatic&&targeted(text))continue;
        if(e.id==='selfCopy'&&trigger==='谢幕曲')text+='使召唤的随从失去【谢幕曲】。';
        if(type!=='follower'){
          text=text.replaceAll('其他所有随从','所有随从').replaceAll('其他随从','随从');
          if(type==='spell')text=text.replaceAll('1张其他卡牌','1张卡牌');
          // Own countdown acceleration is separately priced by the amulet builder.
          if(type==='amulet'&&e.id==='amulet')text=text.replace('所有拥有','其他所有拥有');
          if(type==='amulet'&&e.id==='amuletBreak')text=text.replace('随机1张护符','随机1张其他护符');
        }
        const developsBoard=['tokenSummon','crystalHandSummon','allyBuff','teamBuff','wardBuff','artifactBuff','tribeBuff','crystalHandBuff','selfCopy','reanimate','artifactCopy','recruit'].includes(e.id);
        let candidate={ids:[e.id],raw:e.id==='draw'?drawValue(effectCost,n):search?searchValue(e.id,n):copyIds.has(e.id)?copyValue(e.id,n):price*n+overhead,boardValue:developsBoard?price*n:0,text,tokens};
        if(e.id==='handCostUp'&&!used.has('handBuff')&&maxPrice>=1.9&&rng(hash(seed+'|truth-modifier|'+trigger))()<.5){
          const amount=Math.min(2,Math.max(1,Math.floor(effectCost/3)),Math.floor((maxPrice-.6)/1.3));
          candidate.text=text.replace('费用+1。',`费用+1，使其+${amount}/+${amount}。`);
          candidate.raw=.6+amount*1.3;candidate.ids.push('handBuff');
          candidate.components=[{id:'handCostUp',text:'费用+1',raw:.6},{id:'handBuff',text:`+${amount}/+${amount}`,raw:amount*1.3}];
        }
        // Keep strong evolution payoffs without forcing every resource effect to draw three.
        if(resource&&candidate.raw<minRaw) {
          if(cheapBase)continue;
          const support=makeEffect(maxPrice-candidate.raw,trigger,condition,minRaw-candidate.raw,false,effectCost,blockTarget||targeted(text),complexity);
          if(!support)continue;
          candidate={ids:[e.id,...support.ids],raw:candidate.raw+support.raw,boardValue:candidate.boardValue+(support.boardValue||0),text:text+support.text,tokens:[...tokens,...support.tokens]};
        }
        if(complexity&&candidate.ids.length>complexity.maxAtoms)continue;
        options.push([candidate,effectWeight(e.id,e.weight)*synergyWeight(candidate.ids,candidate.tokens)]);
      }
      return options.length?weighted(r,options):null;
    }
    function addSpellboostEngine(){
      if(card.abilities.length>=5)return;
      if(simpleDesign||cls!==3||cost<3||vanilla||card.signature||r()>[.1,.16,.23,.3][rarity])return;
      const discount=cost>=5&&r()<.6,price=discount?4:3;
      if(price>budget-floor-card.spent)return;
      const text=discount?'使本卡牌的费用-1。':'本随从+1/+1。';
      add({kind:'static',trigger:'魔力增幅时',condition:'none',text:'【魔力增幅时】'+text,bodyText:text,raw:discount?7:5,price,ids:[discount?'spellboostDiscount':'spellboostGrowth']});
    }
    const vanilla=type==='follower'&&rarity===0&&cost<=4&&r()<.022;
    if(type!=='follower')return NONFOLLOWERS.build({card,cost,cls,rarity,r,pick,weighted,profile,makeEffect,gate,composeEmblem,add,used,tokenValue,canChooseTarget,calibration:CALIBRATION,alternate:!!alternateConfig});
    if(cost>=6&&rarity>=2&&rng(hash(seed+'|invocation'))()<(rarity===3?.045:.012)){
      const price=4+(cost-6)*.7;
      // Reserve its flexibility cost before other abilities consume the budget.
      // The history threshold is finalized against the actual delivered body.
      add({kind:'invocation',trigger:'在牌组中发动',condition:'invocationHistory',text:'',bodyText:'',raw:price,price,ids:['invocation'],tokens:[]});
      if(r()<.4){
        const e=makeEffect(Math.min(5,budget-floor-card.spent),'本卡牌被【瞬念召唤】时','none',1);
        if(e)add({...e,kind:'effect',trigger:'本卡牌被【瞬念召唤】时',condition:'none',text:'本卡牌被【瞬念召唤】时，'+e.text,bodyText:e.text,price:e.raw});
      }
    }
    if(!vanilla&&keywordQuota>0&&r()<Math.min(.6,profile.keywords['疾驰']/Math.max(.05,1-profile.keywordCounts[0])*1.35)){
      const storm=keyword('疾驰');if(storm.price<=budget-floor-.65){add(storm);keywordQuota=Math.max(1,keywordQuota);}
    }
    const signature=signatureCore();
    // Reserve rare automatic super-evolution before the high-cost core spends its budget.
    if(!signature&&cost>=7&&rarity===3&&r()<.06){
      const g=gate('入场曲'),raw=14,price=Math.max(.4,(raw-g.extra)*g.factor);
      if((g.id!=='none'||unconditionalSelfEvolution)&&price<=budget-floor-card.spent&&raw>=(g.minRaw||0))add({kind:'effect',trigger:'入场曲',condition:g.id,resourceCost:g.amount||0,conditionAmount:g.requirement||g.amount||0,minPayoff:g.minRaw||0,text:'【入场曲】'+g.text+'若本随从为进化前，则本随从超进化。',bodyText:g.text+'若本随从为进化前，则本随从超进化。',raw,price,ids:['selfSuperEvolve'],tokens:[]});
    }
    if(!simpleDesign&&!signature&&!vanilla&&!used.has('selfSuperEvolve')&&cost>=2&&rng(hash(seed+'|automatic-evolution'))()<.055){
      const g=gate('入场曲'),raw=6,price=Math.max(.4,(raw-g.extra)*g.factor);
      if((g.id!=='none'||unconditionalSelfEvolution)&&raw>=(g.minRaw||0)&&price<=budget-floor-card.spent)add({kind:'effect',trigger:'入场曲',condition:g.id,resourceCost:g.amount||0,conditionAmount:g.requirement||g.amount||0,minPayoff:g.minRaw||0,text:'【入场曲】'+g.text+'若本随从为进化前，则本随从进化。',bodyText:g.text+'若本随从为进化前，则本随从进化。',raw,price,ids:['selfEvolve'],tokens:[]});
    }
    addFaith();
    if(!vanilla)addEmblem();
    addSpellboostEngine();
    if(!simpleDesign&&tribal&&!vanilla&&cost>=2&&card.abilities.length<4&&r()<.65){
      const amount=cost>=7&&r()<.35?2:1;
      const choices=[['rush','使其获得【突进】。',3],['ward','使其获得【守护】。',3],['growth',`使其+${amount}/+${amount}。`,amount*4],['heal',`回复自己的主战者${amount}点生命值。`,2+amount],['draw','每回合最多发动1次，抽取1张卡牌。',4.5]];
      const affordable=choices.filter(e=>e[2]<=budget-floor-card.spent);
      if(affordable.length){const [effect,text,price]=pick(affordable),trigger=`自己的其他${tribe.name}·随从进入战场时`;add({kind:'static',trigger,condition:'none',text:trigger+'，'+text,bodyText:text,raw:price,price,ids:['tribeEngine'],tribe:tribe.name,tribeEffect:effect,tokens:[]});}
    }
    // An immediate ramp pays for roughly three PP before buying its body.
    const rampFloor=cost<=5?Math.min(floor,Math.max(1,BODY[Math.max(0,cost-3)])):floor;
    if(cls===4&&cost>=3&&cost<=6&&!vanilla&&!used.has('ramp')&&card.abilities.length<4&&rng(hash(seed+'|dragon-ramp'))()<(cost===3?.25:.12)&&budget-rampFloor-card.spent>=RAMP_VALUE){
      if(rampFloor<floor){card.rampBodyTrade={lost:floor-rampFloor};floor=rampFloor;card.bodyAllowance=floor;}
      add({kind:'effect',trigger:'入场曲',condition:'none',text:'【入场曲】使自己的能量点最大值+1。',bodyText:'使自己的能量点最大值+1。',raw:RAMP_VALUE,price:RAMP_VALUE,ids:['ramp'],tokens:[]});
    }
    if(cost>=6&&!signature)highCore();
    addCrystalHandLink();
    tradeBodyForPower();
    addSpecialMechanic();
    const plannedCount=signature||simpleDesign?card.abilities.length:vanilla?0:(cost>=6?Math.min(5,Math.max(card.abilities.length,2)+(rarity>=1?1:0)+(cost>=8?1:0)+(rarity===3?1:0)):Math.max(card.abilities.length,Math.min(4,1+(r()<.55+rarity*.12?1:0)+(cost>=4&&r()<.4+rarity*.12?1:0))));
    const count=Math.max(card.abilities.length,plannedCount-Math.max(0,keywordQuota-card.abilities.filter(a=>a.kind==='keyword').length));
    for(let i=card.abilities.length;i<count;i++) {
      const remaining=budget-floor-card.spent;
      if(remaining<.55)break;
      const limit=Math.min(remaining,Math.max(1,(budget-floor)*(.46+rarity*.06)));
      const doubleAttackPrice=5+card.abilities.filter(a=>['攻击时','交战时'].includes(a.trigger)).reduce((sum,a)=>sum+a.price,0);
      if(cost>=6&&limit>=doubleAttackPrice&&!used.has('疾驰')&&!used.has('doubleAttack')&&r()<.10*synergyWeight(['doubleAttack'])) {
        add({kind:'static',trigger:'',condition:'none',text:'1回合可以攻击2次。',price:doubleAttackPrice,raw:doubleAttackPrice,ids:['doubleAttack']});continue;
      }
      const links=cls===6?[['自己的拥有【守护】的其他随从被破坏时',.035],['自己【启动】护符时',.055],['自己的护符被破坏时',.03]]:cls===7?[['自己的其他创造物·随从进入战场时',.055]]:cls===2?[['自己的其他随从进入战场时',.025]]:cls===3?[['自己使用费用发生变化的随从时',.05]]:cls===4&&floor>=4?[['本随从受到伤害且没被破坏时',used.has('allyPing')||used.has('allBoardDamage')?.14:.07]]:[];
      let trigger=weighted(r,[...['入场曲','进化时','超进化时','谢幕曲','攻击时'].map(t=>[t,triggerWeight(t)]),['交战时',cost>=2?.012:0],...links,['自己的回合结束时',.025],['爆能强化',cost<10?profile.triggers['爆能强化']*synergyWeight(['enhance']):0]]);
      if((used.has('selfEvolve')||used.has('selfSuperEvolve'))&&['进化时','超进化时'].includes(trigger))trigger='入场曲';
      if(trigger==='爆能强化'&&used.has('enhance'))trigger='入场曲';
      const g=gate(trigger),evolved=['进化时','超进化时'].includes(trigger);
      const timing=evolved?evolutionTiming(trigger):({'入场曲':1,'谢幕曲':.65,'攻击时':1.15,'交战时':1.6,'自己的回合结束时':1.25,'爆能强化':1})[trigger]??2.2;
      // Evolution and conditions still reward investment, without multiplying
      // two large discounts into almost-free effects.
      const factor=(evolved?Math.max(timing*g.factor,timing*.8):timing*g.factor)*(['攻击时','交战时'].includes(trigger)&&used.has('doubleAttack')?2:1);
      const evolutionPayoff=trigger==='进化时'?3.5+cost*.2:trigger==='超进化时'?5.5+cost*.35:0;
      // Evolution and a difficult resource/sequence requirement are separate investments.
      const minRaw=g.difficult?(g.minRaw||0)+evolutionPayoff:Math.max(g.minRaw||0,evolutionPayoff);
      const effectCost=g.fee||Math.min(10,cost+(g.effectBoost||0));
      const rawLimit=Math.min(limit/factor+g.extra,2*effectCost+9+(g.amount||0),28);
      const effect=(maximum,minimum,resources=true,blockTarget=false)=>makeEffect(maximum,trigger,g.id,minimum,resources,effectCost,blockTarget);
      let e=effect(rawLimit,minRaw);
      // Hard conditions can buy several effects when one numeric atom is too small.
      if((g.difficult&&g.minRaw>=6||g.fee>=7)&&(!e||r()<(g.fee ? .72 : .55))) {
        const first=effect(rawLimit*.62,minRaw*.4);
        if(first) {
          first.ids.forEach(id=>used.add(id));
          const second=effect(rawLimit-first.raw,Math.max(0,minRaw-first.raw),true,targeted(first.text));
          first.ids.forEach(id=>used.delete(id));
          if(second)e={ids:[...first.ids,...second.ids],raw:first.raw+second.raw,boardValue:(first.boardValue||0)+(second.boardValue||0),text:first.text+second.text,tokens:[...first.tokens,...second.tokens]};
        }
      }
      if(!e)continue;
      let kind='effect';
      // Modes pay for the stronger branch, plus a flexibility premium, never sum both branches.
      if(e.ids.length===1&&rarity>=1&&r()<[0,.12,.22,.32][rarity]*synergyWeight(['mode'])&&trigger!=='爆能强化'&&canChooseTarget(trigger)) {
        used.add(e.ids[0]);const other=effect(Math.max(0,rawLimit-.65),minRaw);used.delete(e.ids[0]);
        if(other&&Math.max(e.raw,other.raw)+.65<=rawLimit) {
          e={ids:[...e.ids,...other.ids],raw:Math.max(e.raw,other.raw)+.65,boardValue:Math.max(e.boardValue||0,other.boardValue||0),text:`【模式】选择1个能力发动。\n（1）${e.text}\n（2）${other.text}`,tokens:[...e.tokens,...other.tokens]};kind='mode';
        }
      }
      const price=Math.max(.4,(e.raw-g.extra)*factor);
      if(price>remaining)continue;
      const prefix=trigger==='爆能强化'?g.text:(['入场曲','进化时','超进化时','谢幕曲','攻击时','交战时'].includes(trigger)?`【${trigger}】`:`${trigger}，${trigger.includes('受到伤害')?'若为自己的回合，则':''}`)+g.text;
      const linkId=trigger.includes('受到伤害')?'hurtLink':trigger.includes('费用发生变化')?'costChangedLink':trigger.includes('拥有【守护】')?'wardLink':trigger.includes('护符')?'amuletLink':trigger.includes('创造物')?'artifactLink':trigger==='自己的其他随从进入战场时'?'rallyLink':null;
      if(linkId&&used.has(linkId))continue;
      add({...e,kind,trigger,condition:g.id,resourceCost:g.amount||0,conditionAmount:g.requirement||g.amount||0,enhanceCost:g.fee||0,minPayoff:minRaw,text:prefix+e.text,bodyText:g.text+e.text,price,ids:[...e.ids,...(trigger==='爆能强化'?['enhance']:[]),...(linkId?[linkId]:[])]});
    }
    // Effect evolution does not activate the EP/SEP keyword. A distinct event can respond.
    if((used.has('selfEvolve')||used.has('selfSuperEvolve'))&&card.abilities.length<4&&r()<.65){
      const room=budget-floor-card.spent;
      const e=makeEffect(Math.min(12,room/.7),'本随从进化时','none',2.2);
      if(e)add({...e,kind:'evolutionEvent',trigger:'本随从进化时',condition:'none',text:'本随从进化时，'+e.text,bodyText:e.text,price:e.raw*.7,ids:['evolutionEvent',...e.ids]});
    }
    // Draw the number and identity of printed keywords from official cohorts.
    // Granted abilities in a Fanfare/token are deliberately not counted here.
    while(!vanilla&&card.abilities.length<5&&card.abilities.filter(a=>a.kind==='keyword').length<keywordQuota) {
      const remaining=budget-floor-card.spent;
      const entries=Object.entries(profile.keywords).filter(([k])=>k!=='疾驰'&&!used.has(k)&&keyword(k).price<=remaining&&
        !(k==='疾驰'&&(used.has('selfCopy')||used.has('突进')||used.has('doubleAttack')||used.has('潜行')))&&!(k==='突进'&&used.has('疾驰'))&&
        !(k==='潜行'&&(used.has('守护')||used.has('疾驰')))&&!(k==='守护'&&used.has('潜行')));
      if(!entries.length)break;
      add(keyword(weighted(r,entries.map(([k,w])=>[k,w*synergyWeight([k])]))));
    }
    // Preserve the rare vanilla roll, but every other follower gets a real triggered ability.
    // Pay for it from spare budget; if necessary replace a keyword rather than inflate a cheap body.
    if(!vanilla&&!card.abilities.some(a=>a.trigger&&a.kind!=='alternate')) {
      if(budget-floor-card.spent<.65) {
        const removed=card.abilities.pop();
        if(removed){card.spent-=removed.price;removed.ids.forEach(id=>used.delete(id));}
      }
      const drawRaw=drawValue(cost,1),drawPrice=drawRaw*.75;
      const draw=budget-floor-card.spent>=drawPrice;
      const text=draw?'抽取1张卡牌。':'回复自己的主战者2点生命值。';
      add({kind:'effect',trigger:'谢幕曲',condition:'none',text:'【谢幕曲】'+text,bodyText:text,price:draw?drawPrice:.65,raw:draw?drawRaw:1.3,ids:[draw?'draw':'heal'],tokens:[]});
    }
    // Replay is generated only after a real Fanfare, preserving all original conditions and modes.
    const fanfares=card.abilities.filter(a=>a.trigger==='入场曲');
    const replayTiming=evolutionTiming('进化时');
    const replayPrice=fanfares.reduce((s,a)=>s+a.price,0)*replayTiming;
    const replayRaw=fanfares.reduce((s,a)=>s+a.raw,0);
    const replaySearch=fanfares.reduce((s,a)=>s+searchCount(a.text),0)+card.abilities.filter(a=>phase(a.trigger)==='evolve').reduce((s,a)=>s+searchCount(a.text),0);
    if(!signature&&!used.has('selfEvolve')&&!used.has('selfSuperEvolve')&&replaySearch<=searchCap('进化时')&&!(fanfares.some(a=>targeted(a.text))&&phaseHasTarget('进化时'))&&rarity>=1&&replayRaw>=(cost<=3?3:3.5+cost*.2)&&fanfares.some(a=>!a.emblemIds)&&card.abilities.length<5&&r()<.55&&replayPrice<=budget-floor-card.spent) {
      const exception=card.abilities.some(a=>a.trigger==='爆能强化')?'（【爆能强化】除外）':'';
      add({kind:'replay',trigger:'进化时',condition:'none',text:`【进化时】发动与【入场曲】相同的能力${exception}。`,price:replayPrice,raw:fanfares.reduce((s,a)=>s+a.raw,0),timingFactor:replayTiming,ids:['replay']});
    }
    // If evolution is the only source of non-keyword value, grant a small, explicit
    // extra payoff. Prefix it before any original condition/mode so scope is clear.
    const evolutions=card.abilities.filter(a=>['进化时','超进化时'].includes(a.trigger));
    const hasOtherPayoff=card.abilities.some(a=>a.kind!=='keyword'&&a.kind!=='alternate'&&!['进化时','超进化时'].includes(a.trigger));
    if(evolutions.length&&!hasOtherPayoff) {
      const target=evolutions.reduce((a,b)=>a.raw>=b.raw?a:b),timing=target.trigger==='超进化时'?.25:.38;
      const allowance=.8+cost*.08,min=Math.max(1.3,target.raw*.12),limit=Math.min(4.4,Math.max(2.2,target.raw*.25),(budget-floor-card.spent+allowance)/timing);
      const bonus=makeEffect(limit,target.trigger,target.condition,Math.min(min,limit))||makeEffect(limit,target.trigger,target.condition,.65);
      if(bonus){
        const price=bonus.raw*timing;
        target.bodyText=bonus.text+(target.bodyText||target.text.replace(/^【[^】]+】/,''));
        target.text=`【${target.trigger}】`+target.bodyText;target.raw+=bonus.raw;target.price+=price;target.ids.push(...bonus.ids);
        if(target.components)target.components.unshift({ids:bonus.ids,text:bonus.text,raw:bonus.raw});
        target.tokens=[...(target.tokens||[]),...bonus.tokens];bonus.tokens.forEach(t=>{if(!card.tokens.some(v=>v.id===t.id))card.tokens.push({...t});});
        card.spent+=price;card.budget+=allowance;card.evolutionFocusBonus={trigger:target.trigger,raw:bonus.raw,price};
      }
    }
    if(cost>=6&&card.abilities.length<5&&card.abilities.length&&card.abilities.every(a=>['进化时','超进化时'].includes(a.trigger))){
      add(keyword(weighted(r,[['守护',Math.max(.01,profile.keywords['守护'])],['突进',Math.max(.01,profile.keywords['突进'])]])));
    }
    let printedFloor=card.signature?Math.max(8,BODY[cost]-(card.bodyCompensation||0)):floor;
    const immediateRamp=cost<=5&&card.abilities.some(a=>a.trigger==='入场曲'&&a.condition==='none'&&a.ids.includes('ramp'));
    if(immediateRamp){
      const cap=Math.max(1,BODY[Math.max(0,cost-3)]),lost=Math.max(0,printedFloor-cap);
      printedFloor-=lost;card.bodyAllowance=printedFloor;
      card.rampBodyTrade={lost:(card.rampBodyTrade?.lost||0)+lost};
    }
    if(cost===2){
      // Delayed card advantage still consumes a cheap body's allowance.
      // Count the best mode, not all mutually exclusive branches; actual paid
      // conditions and evolution effects keep their existing compensation.
      const resourceIds=['draw','keywordSearch','typeSearch','wardSearch','amuletSearch','tutor','opponentHandCopy','opponentDeckCopy'];
      const resources=card.abilities.filter(a=>['入场曲','谢幕曲'].includes(a.trigger)&&a.condition==='none'&&a.ids.some(id=>resourceIds.includes(id)));
      const count=text=>[...text.matchAll(/抽取([1-9])张(?:卡牌|护符)|从自己的牌组中随机将([1-9])张|将对手的(?:手牌|牌组)中的随机([1-9])张卡牌的复制卡牌/g)].reduce((s,m)=>s+Number(m[1]||m[2]||m[3]),0);
      const cards=resources.reduce((s,a)=>{
        const branches=a.text.split(/\n（\d+）/);
        return s+(branches.length>1?count(branches[0])+Math.max(...branches.slice(1).map(count)):count(a.text));
      },0);
      const targetLoss=Math.min(2,cards),alreadyPaid=Math.max(0,BODY[cost]-printedFloor);
      const lost=Math.max(0,Math.min(printedFloor-2,targetLoss-alreadyPaid));
      if(lost){printedFloor-=lost;card.resourceBodyTrade={cards,lost};card.bodyAllowance=printedFloor;}
    }
    if(cost===1){
      // Immediate 1/1 tokens and delayed larger tokens still replace part of
      // the printed body. Hard paid conditions and evolution remain separate.
      const summons=card.abilities.filter(a=>['入场曲','谢幕曲'].includes(a.trigger)&&a.condition==='none'&&a.ids.some(id=>['tokenSummon','crystalHandSummon'].includes(id)));
      if(summons.length){
        const lost=Math.max(0,printedFloor-1);printedFloor=1;
        card.boardBodyTrade={lost,boardValue:summons.reduce((s,a)=>s+(a.boardValue||0),0)};
        card.bodyAllowance=1;
      }
    }
    if(cost>=2&&cost<=4){
      // Immediate board development shares the low-cost body allowance. Conditions
      // discount the trade; evolution, Last Words and alternate forms do not pay it.
      const boardValue=card.abilities.filter(a=>a.trigger==='入场曲'&&!['singleton','lowHealth'].includes(a.condition)).reduce((s,a)=>s+(a.boardValue||0)*Math.min(1,a.raw>0?a.price/a.raw:0),0);
      const targetLoss=Math.min(cost===4?1:2,Math.round(boardValue*({2:.55,3:.35,4:.18})[cost]));
      const alreadyPaid=Math.max(0,BODY[cost]-printedFloor);
      const lost=Math.max(0,Math.min(printedFloor-2,targetLoss-alreadyPaid));
      if(lost){printedFloor-=lost;card.boardBodyTrade={boardValue:+boardValue.toFixed(3),lost};card.bodyAllowance=printedFloor;}
    }
    const total=used.has('costReduction')||used.has('crystalHandCostReduction')||used.has('spellboostDiscount')?Math.min(10,printedFloor):printedFloor;
    card.attack=Math.max(1,Math.min(Math.max(1,total-1),Math.round(total*(.5+attackBias))));
    card.health=Math.max(1,total-card.attack);
    if(cost===1&&total===1&&card.boardBodyTrade){card.attack=0;card.health=1;card.zeroAttackTrade={lost:1,reason:'cheapSummon'};}
    if(immediateRamp&&total===1){card.attack=0;card.health=1;card.zeroAttackTrade={lost:1,reason:'ramp'};}
    if(card.printedBody)[card.attack,card.health]=card.printedBody;
    if(used.has('hurtLink')&&card.health===1&&card.attack>1){card.attack--;card.health++;}
    if(used.has('疾驰')&&card.attack>0){
      const beforeAttack=card.attack,beforeHealth=card.health;
      card.attack=Math.min(card.attack,Math.max(1,cost-1));
      // Capped attack is a real loss, not converted into extra health. The
      // remaining body payment grows with attack; existing body trades count.
      const targetLoss=Math.ceil(card.attack*.3+Math.max(0,card.attack-3)**2*.06);
      const preexistingLoss=Math.max(0,BODY[cost]-beforeAttack-beforeHealth);
      const capLoss=beforeAttack-card.attack;
      const remainingLoss=Math.max(0,targetLoss-preexistingLoss-capLoss);
      const healthLoss=Math.min(card.health-1,remainingLoss);
      card.health-=healthLoss;
      const attackLoss=Math.min(card.attack-1,remainingLoss-healthLoss);
      card.attack-=attackLoss;
      card.stormBodyTrade={targetLoss,preexistingLoss,capLoss,extraLoss:healthLoss+attackLoss,attackLost:capLoss+attackLoss,healthLost:healthLoss};
      card.bodyAllowance=card.attack+card.health;
    }
    if(cost>=5&&used.has('疾驰')&&card.attack>0){
      const beforeAttack=card.attack,beforeHealth=card.health;
      let assessment=stormCardValue(card.attack,card.health,card.abilities);
      while(assessment.value>cost+1e-8&&card.attack>1){card.attack--;assessment=stormCardValue(card.attack,card.health,card.abilities);}
      while(assessment.value>cost+1e-8&&card.health>1){card.health--;assessment=stormCardValue(card.attack,card.health,card.abilities);}
      if(assessment.value>cost+1e-8){
        // The effects alone leave no room for Storm. Choose Rush and restore
        // the body from before either Storm-specific trade, keeping prior trades.
        card.attack=beforeAttack+(card.stormBodyTrade?.attackLost||0);
        card.health=beforeHealth+(card.stormBodyTrade?.healthLost||0);
        const storm=card.abilities.find(a=>a.kind==='keyword'&&a.ids.includes('疾驰'));
        card.abilities=card.abilities.filter(a=>a!==storm);card.spent-=storm.price;used.delete('疾驰');
        delete card.stormBodyTrade;
        if(!used.has('突进'))add(keyword('突进'));
        card.stormRejected=true;
      }else{
        const attackLost=beforeAttack-card.attack,healthLost=beforeHealth-card.health;
        card.stormPackageTrade={beforeAttack,beforeHealth,attackLost,healthLost,...assessment,limit:cost};
        card.stormBodyTrade.attackLost+=attackLost;card.stormBodyTrade.healthLost+=healthLost;card.stormBodyTrade.extraLoss+=attackLost+healthLost;
      }
      card.bodyAllowance=card.attack+card.health;
    }
    // Zero attack is a payment for a cheap utility body, never an ordinary
    // body roll. Do not return the removed attack as extra health.
    const utility=card.abilities.filter(a=>['入场曲','谢幕曲'].includes(a.trigger)&&a.condition==='none');
    const oneCostResource=cost===1&&utility.some(a=>a.ids.some(id=>['draw','keywordSearch','typeSearch','wardSearch','amuletSearch','opponentHandCopy','opponentDeckCopy'].includes(id)));
    const combatEngine=card.abilities.some(a=>a.trigger==='攻击时'||a.ids.some(id=>['doubleAttack','selfEvolve','selfSuperEvolve'].includes(id)));
    const rareUtility=cost<=3&&card.attack===1&&!card.bodyTrade&&!card.boardBodyTrade&&!card.resourceBodyTrade&&!used.has('疾驰')&&!used.has('虹吸')&&!used.has('毁灭')&&utility.reduce((s,a)=>s+a.price,0)>=cost*1.9&&rng(hash(seed+'|zero-attack-utility'))()<.1;
    if(!vanilla&&!combatEngine&&(oneCostResource||rareUtility)){
      const lost=card.attack;card.attack=0;
      card.zeroAttackTrade={lost,reason:oneCostResource?'cheapCardAdvantage':'strongUtility'};
    }
    if(card.attack===0){
      // Attack-based keywords cannot compensate a body that cannot deal damage.
      const removed=card.abilities.filter(a=>a.trigger==='攻击时'||a.kind==='keyword'&&a.ids.some(id=>['疾驰','突进','虹吸','毁灭','潜行'].includes(id)));
      for(const a of removed){card.spent-=a.price;a.ids.forEach(id=>used.delete(id));}
      card.abilities=card.abilities.filter(a=>!removed.includes(a));
      if(!used.has('守护')&&card.abilities.length<5)add(keyword('守护'));
      card.bodyAllowance=card.attack+card.health;
    }
    // Evaluate the delayed summon after the final body and abilities are known.
    // Fanfare and alternate-use flexibility are not delivered by summoning.
    for(const form of card.alternateForms.filter(f=>f.kind==='结晶')){
      const retained=card.abilities.filter(a=>a.trigger!=='入场曲'&&a.kind!=='alternate'&&!['魔力增幅时','在手牌中发动','在牌组中发动','本卡牌被【瞬念召唤】时'].includes(a.trigger));
      const bodyValue=(card.attack+card.health)*.8;
      const abilityValue=retained.reduce((s,a)=>s+a.price,0);
      const summonValue=bodyValue+abilityValue;
      const baseCountdown=form.countdown;
      form.countdown=Math.max(baseCountdown,Math.ceil((summonValue-form.cost*2.8)/3.5));
      form.valuation={bodyValue,abilityValue,summonValue,baseCountdown,delayAdded:form.countdown-baseCountdown};
      form.text=`【吟唱 ${form.countdown}】\n【谢幕曲】召唤1个『${name}』。`;
    }
    const invocation=card.abilities.find(a=>a.kind==='invocation');
    if(invocation){
      // Summoning does not play Fanfare, Enhance or EP/SEP evolution abilities.
      const excluded=['入场曲','爆能强化','进化时','超进化时','魔力增幅时','在手牌中发动','在牌组中发动'];
      const retained=card.abilities.filter(a=>a.kind!=='alternate'&&!excluded.includes(a.trigger));
      const delivered=(card.attack+card.health)*.8+retained.reduce((s,a)=>s+Math.max(a.raw,a.price),0);
      const threshold=6+Math.max(0,Math.ceil((delivered-16)/8));
      const costHistory=delivered<=24&&rng(hash(seed+'|invocation-condition'))()<.4;
      const trigger=costHistory?'自己的回合结束时':'自己的回合开始时';
      const condition=costHistory?'若本次对战中自己使用的卡牌的原始费用包含1到8所有数值':`若本次对战中自己的随从的进化次数为${threshold}次或以上`;
      invocation.text=`在牌组中发动。${trigger}，${condition}，则【瞬念召唤】本卡牌。`;
      invocation.bodyText=invocation.text;
      invocation.valuation={delivered,threshold:costHistory?8:threshold,history:costHistory?'playedCosts':'evolutions',retainedIds:retained.flatMap(a=>a.ids)};
    }
    card.spent=+card.spent.toFixed(2);
    card.vanilla=card.abilities.length===0;
    return card;
  }
  const api={generate,nextVariant,randomName,randomMatchingName,tokenValue,keywordPrice,stormCardValue,CLASSES,RARITIES,THEMES,TOKENS,TYPES,VERSION};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.SVWB=api;
})(typeof globalThis!=='undefined'?globalThis:this);
