(function (root) {
  'use strict';
  const VERSION = '4.98';
  const TRIBAL_SYNERGY = 3; // Selection preference only; never discounts the payoff.
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
  const REPEATABLE_EFFECTS=new Set(('damage face aoe splitDamage draw heal buff allyBuff teamBuff handBuff boost earth grave tokenHand tokenSummon summon tutor keywordSearch typeSearch wardSearch amuletSearch activeAmuletSearch activeAmuletRecruit amuletRecruit amuletRevive reanimate artifact artifactCopy artifactBuff wardBuff experimentSupply experimentSummon experimentBuff experimentGrant crystalHandSupply crystalHandSummon crystalHandBuff coreSupply corePair fusionArtifactHand fusionArtifactSummon tribeSupply tribeBuff tribeCountDamage treasureSupply coinSupply flagSummon flagAdvance bounce enemyBounce attackLock statDebuff massDebuff setHealth destroy banish smallDestroy silence handCycle handRefill handCycleTutor').split(' '));
  const effectIds=a=>a.fusionEvent?.effects||a.ids||[];
  REPEATABLE_EFFECTS.add('commonSupply');
  REPEATABLE_EFFECTS.add('recoverFollower');
  REPEATABLE_EFFECTS.add('artifactRecover');
  for(const id of ['mixedStats','amuletReviveHighest','enemySupply'])REPEATABLE_EFFECTS.add(id);
  const discountFrequency=cost=>cost<=2?.2:cost===3?.35:cost===4?.6:cost===5?.8:1;
  function immediateBoardValue(card){
    const boardIds=['summon','summonGrowth','tokenSummon','fusionArtifactSummon','crystalHandSummon','experimentSummon','allyBuff','teamBuff','wardBuff','artifactBuff','tribeBuff','crystalHandBuff','experimentBuff','experimentGrant','selfCopy','reanimate','artifactCopy','recruit'];
    return card.abilities.filter(a=>a.trigger==='入场曲'&&!['singleton','lowHealth'].includes(a.condition)).reduce((sum,a)=>{
      const components=(a.components||[]).filter(p=>boardIds.includes(p.id)||(p.ids||[]).some(id=>boardIds.includes(id))).reduce((n,p)=>n+p.raw,0);
      let value=a.boardValue??(components||((a.ids||[]).some(id=>boardIds.includes(id))?a.raw:0));
      if(a.ids?.includes('selfCopy')&&card.attack!=null){
        const copies=[...(a.text||'').matchAll(/召唤([1-3])个『([^』]+)』/g)].filter(m=>m[2]===card.name).reduce((n,m)=>n+Number(m[1]),0)||1;
        value=Math.min(value,copies*((card.attack+card.health)*.85+3));
      }
      return sum+value*Math.min(1,a.raw>0?a.price/a.raw:0);
    },0);
  }
  // Readiness is separate from the purchase price: death/evolution payoffs
  // cannot defend the turn a full-price late-game follower is played.
  function highCostReadiness(card){
    const body=card.attack!=null?card.attack+card.health:card.bodyAllowance;
    let score=0;
    for(const a of card.abilities){
      if(a.kind==='cost'||a.kind==='alternate')continue;
      if(a.kind==='keyword'){
        if(a.ids.includes('突进'))score+=body*.35;
        if(a.ids.includes('守护'))score+=body*.12;
        continue;
      }
      if(['在手牌中发动','在牌组中发动','魔力增幅时','本卡牌被舍弃时','与本卡牌融合时','爆能强化'].includes(a.trigger))continue;
      const timing=a.trigger==='入场曲'?1:a.trigger==='谢幕曲'?.3:['进化时','超进化时'].includes(a.trigger)?.45:.65;
      const resources=a.ids.every(id=>['coreAnchor','coreSupport','recoverFollower','artifactRecover','draw','tutor','tokenHand','keywordSearch','typeSearch','boost','earth','grave'].includes(id));
      score+=Math.max(0,a.raw||0)*timing*(resources?.35:1)*(a.condition&&a.condition!=='none'?.65:1);
    }
    return score;
  }
  function continuityWeight(abilities,ids,trigger){
    if(!trigger)return 1;
    const families=[['damage','aoe','splitDamage','statDebuff','massDebuff','setHealth','destroy','banish','smallDestroy'],['recoverFollower','artifactRecover','draw','tutor','keywordSearch','typeSearch','handCycle','handRefill','handCycleTutor'],['heal','wardBuff','wardSearch'],['boost','earth'],['experimentSupply','experimentSummon','experimentBuff','experimentGrant'],['crystalHandSupply','crystalHandSummon','crystalHandBuff'],['artifact','artifactCopy','artifactBuff','coreSupply','corePair','fusionArtifactHand','fusionArtifactSummon'],['treasureSupply','coinSupply','flagSummon','flagAdvance']];
    let weight=1;
    for(const a of abilities){
      if(a.trigger===trigger||a.kind==='alternate')continue;
      const prior=effectIds(a);
      if(ids.some(id=>REPEATABLE_EFFECTS.has(id)&&prior.includes(id)))weight=Math.max(weight,2.2);
      else if(families.some(f=>f.some(id=>ids.includes(id))&&f.some(id=>prior.includes(id))))weight=Math.max(weight,1.6);
    }
    return weight;
  }
  // Prefer compatible setup/payoff pairs, irrespective of which is sampled first.
  // This affects selection only: neither half receives a budget discount.
  function interactionWeight(abilities,candidate) {
    const evolve=a=>['进化时','超进化时'].includes(a.trigger);
    const damage=a=>a.ids.some(id=>['damage','aoe','splitDamage'].includes(id));
    const setup=a=>a.trigger==='入场曲'&&a.ids.includes('setHealth');
    const activation=a=>a.trigger?.includes('自己【启动】护符')||a.activationPayoff===true;
    const supply=a=>a.ids.some(id=>['activeAmuletRecruit','activeAmuletSearch'].includes(id));
    let weight=1;
    for(const a of abilities){
      // Modes are alternatives, so don't treat their two branches as a combo.
      if(a.kind==='mode'||candidate.kind==='mode')continue;
      if(setup(a)&&evolve(candidate)&&damage(candidate)||setup(candidate)&&evolve(a)&&damage(a))weight=Math.max(weight,3);
      if(activation(a)&&supply(candidate)||activation(candidate)&&supply(a))weight=Math.max(weight,4);
    }
    return weight;
  }
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
  function initialRoll(input, {chaos=false}={}) {
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
    const rarity=weighted(r,chaos?[[0,12],[1,22],[2,32],[3,34]]:[[0,38],[1,30],[2,21],[3,11]]);
    const type=weighted(r,[['follower',6],['spell',2],['amulet',2]]);
    // Preserve the requested 6:2:2 type mix, then sample official printed costs.
    // The snapshot's only supported 8+ PP spell is a spellboost-discount spell.
    // Concentrate that rare weight in Witch instead of creating unplayable copies.
    const cost=weighted(r,CALIBRATION.costPriors[type].map((weight,n)=>[n,weight*(type==='spell'&&n>=8?(cls===3?7.8:0):1)]).filter(([,weight])=>weight>0));
    return {name,seed,r,cls,rarity,cost,type};
  }
  function randomMatchingName(filters={}, {variantOf,excludeName,random=Math.random,chaos=false}={}) {
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
      const c=initialRoll(name,{chaos});
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
    {id:90051140,name:'腐臭的僵尸',class:5,cost:3,attack:2,health:2,text:'【谢幕曲】召唤1个『腐臭的僵尸』，使其失去【谢幕曲】。'},
    {id:90043110,name:'乙姬近卫队',class:4,cost:3,attack:2,health:2,text:'【疾驰】\n【守护】'},
    {"id":10931110,"name":"沉溺的实验体","class":3,"cost":2,"attack":2,"health":2,"text":"本随从进入战场时，若本次对战中进入战场的自己的其他『沉溺的实验体』的张数为5张或以上，则本随从+3/+3。\n\n【突进】"}
  ];
  TOKENS.push({"id":90072110,"name":"攻击创造物","class":7,"cost":3,"attack":5,"health":1,"text":"【融合】创造物·卡牌\n根据与本卡牌【融合】的卡牌的费用的合计而变身。\n1⇒『毁灭创造物α』\n2⇒『毁灭创造物β』\n3或以上⇒『毁灭创造物γ』\n\n【突进】","tribe":"创造物","tribeId":14},{"id":90072120,"name":"城堡创造物","class":7,"cost":3,"attack":1,"health":5,"text":"【融合】创造物·卡牌\n根据与本卡牌【融合】的卡牌的费用的合计而变身。\n1⇒『毁灭创造物α』\n2⇒『毁灭创造物β』\n3或以上⇒『毁灭创造物γ』\n\n【守护】","tribe":"创造物","tribeId":14});
  const RELATED_CARDS = [{"id":90073110,"name":"毁灭创造物α","class":7,"cost":5,"attack":3,"health":5,"text":"【融合】『毁灭创造物β』或『毁灭创造物γ』\n与本卡牌【融合】时，若与本卡牌【融合】的种类为2，则本卡牌变身为『卓越创造物Ω』。\n\n自己的回合结束时，回复自己的主战者3点生命值。","tribe":"创造物","tribeId":14},{"id":90074110,"name":"卓越创造物Ω","class":7,"cost":10,"attack":10,"health":10,"text":"【入场曲】对对手的战场上的所有随从造成5点伤害。回复自己的主战者5点生命值。\n\n【疾驰】\n【守护】\n【灵气】","tribe":"创造物","tribeId":14}];
  const SUPPORT_CARDS = [{"id":90021310,"name":"黄金短剑","class":2,"type":"spell","cost":1,"attack":0,"health":0,"text":"选择对手的战场上的1个随从或对手的主战者，对其造成1点伤害。","tribe":"财宝"},{"id":90021320,"name":"黄金之杯","class":2,"type":"spell","cost":1,"attack":0,"health":0,"text":"回复自己的主战者2点生命值。","tribe":"财宝"},{"id":90021330,"name":"黄金之靴","class":2,"type":"spell","cost":1,"attack":0,"health":0,"text":"选择自己的战场上的1个随从，使其+1/+0且获得【突进】。","tribe":"财宝"},{"id":90021340,"name":"黄金项链","class":2,"type":"spell","cost":1,"attack":0,"health":0,"text":"选择自己的战场上的1个随从，使其+0/+1且获得【守护】。","tribe":"财宝"},{"id":90021350,"name":"闪耀的金币","class":2,"type":"spell","cost":0,"attack":0,"health":0,"text":"【模式】选择1个能力发动。\n（1）抽取1张卡牌。\n（2）对对手的战场上的随机1个随从造成2点伤害。"},{"id":90021210,"name":"令人战栗的海盗旗","class":2,"type":"amulet","cost":1,"attack":0,"health":0,"text":"【吟唱 7】\n自己使用法术时，本护符的倒计数-1。\n【谢幕曲】对对手的主战者造成2点伤害。"}];
  SUPPORT_CARDS.push({"id":90071210,"name":"未来核心","class":7,"cost":1,"attack":0,"health":0,"text":"【融合】创造物·护符\n与本卡牌【融合】时，本卡牌变身为『攻击创造物』。\n\n无法使用。","type":"amulet","tribe":"创造物","tribeId":14},{"id":90071220,"name":"过往核心","class":7,"cost":1,"attack":0,"health":0,"text":"【融合】创造物·护符\n与本卡牌【融合】时，本卡牌变身为『城堡创造物』。\n\n无法使用。","type":"amulet","tribe":"创造物","tribeId":14});
  SUPPORT_CARDS.push({"id":90014310,"name":"蔷薇之闪击","class":1,"cost":1,"attack":0,"health":0,"text":"选择对手的战场上的1个随从或对手的主战者，对其造成3点伤害。","type":"spell"},{"id":90034310,"name":"绝尽的伪证","class":3,"cost":4,"attack":0,"health":0,"text":"使自己的手牌中的所有随从的费用+1。破坏对手的战场上的所有随从。","type":"spell"});
  TOKENS.push({id:90041110,name:'炽炎幼龙',class:4,cost:1,attack:1,health:1,text:'【威慑】'},
    {id:90061120,name:'圣炎猛虎',class:6,cost:4,attack:4,health:4,text:'【突进】'},
    {id:10061120,name:'纯洁白狐',class:6,cost:2,attack:1,health:3,text:'【守护】'});
  // Independently usable official rewards from the 2026-09-18 token audit.
  TOKENS.push(...[{"id":90011120,"name":"新绿的妖精","class":1,"cost":2,"attack":1,"health":1,"text":"【守护】\n自己的回合结束时，本随从进化。","poolWeight":1.2},{"id":90031130,"name":"式神·小纸人","class":3,"cost":2,"attack":2,"health":1,"text":"【突进】\n【谢幕曲】使自己的所有手牌发动1次魔力增幅。","tribe":"式神","tribeId":13,"poolWeight":1},{"id":90031140,"name":"式神·暴鬼","class":3,"cost":3,"attack":3,"health":3,"text":"【突进】\n【谢幕曲】使自己的所有手牌发动1次魔力增幅。","tribe":"式神","tribeId":13,"poolWeight":0.8},{"id":90032110,"name":"洋葱军团兵","class":3,"cost":1,"attack":1,"health":1,"text":"【突进】\n【攻击时】使自己的所有手牌发动1次魔力增幅。","poolWeight":0.3},{"id":90034130,"name":"安的巨大英灵","class":3,"cost":3,"attack":5,"health":5,"text":"【突进】\n【守护】\n对手的回合结束时，破坏本卡牌。","poolWeight":0.25},{"id":90054110,"name":"守卫犬的右腕·米米","class":5,"cost":1,"attack":2,"health":1,"text":"【突进】\n【谢幕曲】对对手的主战者造成2点伤害。","poolWeight":0.35},{"id":90054120,"name":"守卫犬的左腕·可可","class":5,"cost":1,"attack":1,"health":2,"text":"【突进】\n【谢幕曲】回复自己的主战者2点生命值。","poolWeight":0.35},{"id":90074120,"name":"洛伊德","class":7,"cost":3,"attack":1,"health":6,"text":"【守护】\n对手能力只能选择本卡牌。","tribe":"人偶","tribeId":15,"poolWeight":0.3},{"id":90074130,"name":"维多利亚","class":7,"cost":3,"attack":6,"health":1,"text":"【突进】\n【攻击时】若攻击随从，则对交战对手造成X点伤害。X为本随从的攻击力。","tribe":"人偶","tribeId":15,"poolWeight":0.3},{"id":90074140,"name":"伊鞠的小鬼","class":7,"cost":2,"attack":3,"health":3,"text":"【突进】","poolWeight":0.6}]);
  SUPPORT_CARDS.push(...[{"id":90011310,"name":"森林的奥秘","class":1,"cost":0,"attack":0,"health":0,"text":"回复自己的主战者1点生命值。","type":"spell","commonSupply":true},{"id":90031210,"name":"大地之魔片","class":3,"cost":1,"attack":0,"health":0,"text":"【土之印】\n\n费用1【启动】使自己的战场上的土之印+1。","type":"amulet","commonSupply":true},{"id":90031310,"name":"玛纳利亚魔弹","class":3,"cost":1,"attack":0,"health":0,"text":"对对手的战场上的随机1个随从造成3点伤害。","type":"spell","commonSupply":true}]);
  const SUMMON_FIRST=new Set([90041120,90061110,90061130]);
  const TRIBES={2:{name:'士兵',id:2,tokens:[90021110,90021120]},3:{name:'巨像',id:12,tokens:[90031110,90031120]},4:{name:'海洋',id:17,tokens:[90041130,90043110]},5:{name:'亡者',id:6,tokens:[90051110,90051130,90051140]}};
  for(const t of TOKENS){const tribe=Object.values(TRIBES).find(v=>v.tokens.includes(t.id));if(tribe){t.tribe=tribe.name;t.tribeId=tribe.id;}}
  // Ward and Rush are free. Body and effect allowances grow separately with cost;
  // delayed/paid effects buy more payoff than an unconditional Fanfare.
  const BODY = [0,2,4,6,9,10,12,14,16,18,20];
  const ABILITY = [0,1.7,4.2,6,8.5,12,17,20,23,27,31];
  const RAMP_VALUE = 9; // About a full 3-PP spell, before timing/resource discounts.
  const drawValue=(cost,n)=>cost<=2?2.8*n+1.5*n*(n-1):cost===3?2.8*n+.5*n*(n-1):2.2*n;
  function keywordPrice(k,attack,health,context={}) {
    const attacks=context.attacks||1;
    return ({'守护':0,'突进':0,'疾驰':(.2+attack*.35+Math.max(0,attack-2)**2*.12)*attacks,
      '毁灭':Math.max(.1,1.1-attack*.16)*(context.rush?1.4:1),
      '虹吸':(.1+attack*.13)*attacks,'潜行':(.35+attack*.2+Math.max(0,attack-2)**2*.065)*attacks,
      '威慑':context.storm?.55:0,'灵气':context.protected?2.5:context.engine?.6:0,
      '屏障':1.8+Math.max(0,attack)*.12+(context.ward?.5:0)+Math.max(0,attacks-1)*.8})[k];
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
  function ambushCardValue(attack,health,abilities){
    const attacks=abilities.some(a=>a.ids.includes('tripleAttack'))?3:abilities.some(a=>a.ids.includes('doubleAttack'))?2:1;
    // Official 5-PP 4/5 Ninja Master is a nearly full-price Ambush body.
    // Potential face damage is delayed, but protection and multiple attacks
    // still make large attack disproportionately valuable. Evolution is gated.
    const effectValue=abilities.filter(a=>a.kind!=='keyword'&&a.kind!=='alternate').reduce((sum,a)=>sum+Math.max(0,a.price)*(['进化时','超进化时','爆能强化'].includes(a.trigger)?.3:1),0)/3;
    const protection=abilities.filter(a=>a.kind==='keyword'&&!a.ids.includes('潜行')).reduce((sum,a)=>sum+Math.max(0,a.price),0)/3;
    const pressure=(attack*.7+Math.max(0,attack-2)**2*.04)*(1+(attacks-1)*.65);
    return {value:.2+pressure+health*.36+effectValue+protection,effectValue,protection,attacks};
  }
  function invocationValue(card,mode){
    const excluded=['入场曲','爆能强化','进化时','超进化时','本随从进化时','魔力增幅时','在手牌中发动','在牌组中发动','本卡牌被舍弃时'];
    const arrival=a=>a.trigger==='本卡牌被【瞬念召唤】时'||/^本(?:随从|卡牌)进入战场时/.test(a.trigger||'');
    const retained=card.abilities.filter(a=>a.kind!=='alternate'&&!excluded.includes(a.trigger)&&(mode==='stay'||arrival(a)));
    const body=mode==='stay'?(card.attack+card.health)*.8:0,cardAccess=mode==='return'?2.2:0;
    const effects=retained.reduce((n,a)=>n+Math.max(a.raw,a.price),0);
    return {body,cardAccess,effects,delivered:body+cardAccess+effects,retainedIds:retained.flatMap(a=>a.ids)};
  }
  const TOKEN_VALUES = {
    90011120:[1.7,4.6],90031130:[1.8,3.8],90031140:[2,6.2],90032110:[2.2,3.8],
    90034130:[3.2,7.5],90054110:[3.2,5.4],90054120:[2,3.8],
    90074120:[2.8,8.5],90074130:[3.5,9],90074140:[2.2,4.8],
    90011310:[1.6,1.6],90031210:[1.6,2.8],90031310:[1.8,1.8],
    90041110:[1,1.7],90061120:[1.8,7],10061120:[1.2,3.2],
    90072110:[2.1,5],90072120:[1.9,4.8],
    10931110:[2,4.8], // Includes the expected payoff of the fifth-other-entry growth threshold.
    90051140:[1.8,5.3], // 2/2 now plus a discounted delayed 2/2; hand delivery still costs 3 PP.
    90021120:[1.5,3.2],90043110:[2,5.2],
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
    ['highestLeaderDamage',2,3,[4,5],n=>`对生命值最大的所有主战者造成${n}点伤害。`,4,'exclusive'],
    ['lowestLeaderDamage',2.2,3,[4,5],n=>`对生命值最小的所有主战者造成${n}点伤害。`,4,'exclusive'],
    ['draw',2.2,8,[],n=>`抽取${n}张卡牌。`,3],
    ['recoverFollower',2.8,4,[0,7],n=>n===1?'将随机1张与本次对战中被破坏的自己的随从同名的卡牌以非公开形式加入手牌。':`将随机${n}种与本次对战中被破坏的自己的随从同名的卡牌各1张以非公开形式加入手牌。`,2,'exclusive'],
    ['artifactRecover',2.2,5,[7],n=>n===1?'将随机1张与本次对战中被破坏的自己的创造物·随从同名的卡牌以非公开形式加入手牌。':`将随机${n}种与本次对战中被破坏的自己的创造物·随从同名的卡牌各1张以非公开形式加入手牌。`,2,'exclusive'],
    ['pp',3.5,2,[0,2,4,5],n=>`回复自己${n}点能量点。`,3,'exclusive'],
    ['restoreEP',5.5,3,[],()=> '回复自己1点进化点。',1],
    ['restoreSEP',10,1,[],n=>`回复自己${n}点超进化点。`,2],
    ['handCycle',.7,5,[],n=>`选择自己的${n}张手牌，使其返回牌组。抽取${n}张卡牌。`,2],
    ['handRefill',2.2,4,[],n=>`选择自己的1张手牌，使其返回牌组。抽取${n+1}张卡牌。`,2],
    ['handCycleTutor',1.3,4,[],()=> '选择自己的1张手牌，使其返回牌组。从自己的牌组中随机将1张$SEARCH加入手牌。',1],
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
    ['handCostUp',0,6,[3],()=> '选择自己的手牌中的1张随从，使其费用+1。',1,'exclusive'],
    ['allyPing',.6,5,[4],()=> '选择自己的战场上的1个随从，对其造成1点伤害。',1,'exclusive'],
    ['allBoardDamage',3.2,5,[4],n=>`对战场上的所有随从造成${n}点伤害。`,5,'exclusive'],
    ['boost',2,6,[3],n=>`使自己的所有手牌发动${n}次魔力增幅。`,2,'exclusive'],
    ['earth',1.6,5,[3],n=>`使自己的战场上的土之印+${n}。`,2,'exclusive'],
    ['ramp',RAMP_VALUE,3,[4],()=> '使自己的能量点最大值+1。',1,'exclusive'],
    ['grave',0.7,5,[5],n=>`使自己的墓场+${n}。`,4,'exclusive'],
    ['reanimate',4.5,3,[5],n=> `发动【亡者召还 ${n+1}】。`,5,'exclusive'],
    ['amulet',1.7,5,[6],n=>`使自己的战场上的所有拥有【吟唱】的护符的倒计数-${n}。`,2,'exclusive'],
    ['coreSupply',1.1,6,[7],n=>`将${n}张『$CORE』加入手牌。`,2,'exclusive'],
    ['corePair',2.1,4,[7],()=> '将1张『未来核心』和1张『过往核心』加入手牌。',1,'exclusive'],
    ['fusionArtifactHand',2,4,[7],n=>`将${n}张『$FUSIONARTIFACT』加入手牌。`,2,'exclusive'],
    ['fusionArtifactSummon',5,4,[7],n=>`召唤${n}个『$FUSIONARTIFACT』。`,3,'exclusive'],
    ['artifact',2.6,5,[7],()=> '将1张『$ARTIFACT』加入手牌。',1,'exclusive'],
    ['artifactCopy',7,5,[7],n=>`召唤自己的手牌中的随机${n}张费用为5或以下的创造物·随从的复制随从。`,2,'exclusive'],
    ['artifactBuff',4,3,[7],n=>`使自己的战场上的所有创造物·随从+${n}/+${n}。`,2,'exclusive'],
    ['wardSearch',2.5,4,[6],n=>`从自己的牌组中随机将${n}张拥有【守护】的随从加入手牌。`,2,'exclusive'],
    ['wardBuff',3.5,3,[6],n=>`使自己的战场上的拥有【守护】的其他随从全部+${n}/+${n}。`,2,'exclusive'],
    ['amuletSearch',2.5,5,[6],n=>`抽取${n}张护符。`,2,'exclusive'],
    ['amuletRecruit',5,4,[6],n=>`从自己的牌组中随机召唤${n}张费用为2或以下的护符。`,2,'exclusive'],
    ['activeAmuletRecruit',5.5,2,[6],n=>`从自己的牌组中随机召唤${n}张费用为2或以下且拥有【启动】的护符。`,1,'exclusive'],
    ['activeAmuletSearch',3.2,2,[6],n=>`从自己的牌组中随机将${n}张拥有【启动】的护符加入手牌。`,1,'exclusive'],
    ['amuletRevive',5.5,4,[6],()=> '召唤随机1张与本次对战中被破坏的「原始费用为2或以下的拥有【谢幕曲】的自己的护符」同名的护符。',1,'exclusive'],
    ['amuletReviveHighest',10,5,[6],()=> '召唤随机1张与本次对战中被破坏的原始费用最大的自己的护符同名的护符。',1,'exclusive'],
    ['mixedStats',2.1,5,[0],n=>`选择战场上的1个其他随从，使其+${n}/-${n}。`,4,'exclusive'],
    ['enemySupply',1,6,[2],n=>`在对手的战场上召唤${n}个『骑士』。`,2,'exclusive'],
    ['amuletBreak',2.5,3,[6],()=> '破坏自己的战场上的随机1张护符。若因本能力破坏了护符，则抽取1张卡牌。',1,'exclusive'],
    ['bloodDraw',1.6,4,[5],n=>`对自己的主战者造成${n}点伤害。抽取${n}张卡牌。`,2,'exclusive'],
    ['missingHealthDamage',1,3,[5],n=>`对对手的战场上的随机1个随从造成X点伤害。X为自己的主战者已损失的生命值（上限${n}）。`,10,'exclusive'],
    ['experimentSupply',2,4,[3],n=>`将${n}张『沉溺的实验体』加入手牌。`,3,'exclusive'],
    ['experimentSummon',4.8,5,[3],n=>`召唤${n}个『沉溺的实验体』。`,3,'exclusive'],
    ['experimentBuff',3.5,2,[3],n=>`选择自己的战场上的1个『沉溺的实验体』，使其+${n}/+${n}。`,3,'exclusive'],
    ['experimentGrant',3,2,[3],()=> '选择自己的战场上的1个『沉溺的实验体』，使其获得【$EXPERIMENTKEYWORD】。',1,'exclusive'],
    ['crystalHandSupply',1,4,[3],n=>`将${n}张『天晶魔手』加入手牌。`,3,'exclusive'],
    ['crystalHandSummon',1.8,5,[3],n=>`召唤${n}个『天晶魔手』。`,3,'exclusive'],
    ['crystalHandBuff',4.5,3,[3],n=>`使自己的战场上的所有『天晶魔手』+${n}/+${n}。`,2,'exclusive'],
    ['tokenHand',1.6,8,[1,7],n=>`将${n}张『$TOKEN』加入手牌。`,2],
    ['tokenSummon',3,7,[2,5],n=>`召唤${n}个『$TOKEN』。`,2]
  ].map(([id,price,weight,classes,text,max,exclusive])=>({id,price,weight,classes,text,max,exclusive}));
  effects.push(
    {id:'transformAlly',price:6,weight:6,classes:[3],exclusive:true,max:1,text:()=> '选择自己的战场上的1个其他随从，使其变身为『$TRANSFORM』。'},
    {id:'transformEnemy',price:5.5,weight:5,classes:[1,3],exclusive:true,max:1,text:()=> '选择对手的战场上的1个随从，使其变身为『$TRANSFORM』。'},
    {id:'transformEither',price:7,weight:4,classes:[3],exclusive:true,max:1,text:()=> '选择战场上的1个其他随从，使其变身为『$TRANSFORM』。'},
    {id:'handTransform',price:2.8,weight:4,classes:[1],exclusive:true,max:3,text:n=>`使自己的手牌中的随机${n}张费用为2或以下的随从变身为『蔷薇之闪击』。`},
    {id:'truthTransform',price:4.5,weight:3,classes:[3],exclusive:true,max:1,text:()=> '使自己的手牌中的随机1张法术变身为『绝尽的伪证』。'},
    {id:'silence',price:3.8,weight:6,classes:[3,7],exclusive:true,max:1,text:()=> '选择对手的战场上的1个随从，使其失去所有能力。'},
    {id:'setHealth',price:4.5,weight:4,classes:[1,6],exclusive:true,max:1,text:()=> '选择对手的战场上的1个随从，使其生命值变为1。'},
    {id:'leaderVulnerability',price:12,weight:5,classes:[7],exclusive:true,max:1,text:()=> '使对手的主战者获得「受到的伤害+1」。'},
    {id:'clearEmblems',price:11,weight:5,classes:[0],exclusive:true,max:1,text:()=> '使所有纹章消失。'},
    {id:'clearAmulets',price:9,weight:4,classes:[0,6],exclusive:true,max:1,text:()=> '使战场上的所有护符消失。'},
    {id:'emblemExtend',price:5,weight:4,classes:[4,6],exclusive:true,max:2,text:n=>`使自己的『$OWNCREST』的倒计数+${n}。`},
    {id:'attackLock',price:2.4,weight:6,classes:[],max:1,text:()=> '选择对手的战场上的1个随从，对手的回合结束前，使其获得「无法攻击随从或主战者」。'},
    {id:'statDebuff',price:2.2,weight:5,classes:[],max:6,text:n=>`选择对手的战场上的1个随从，使其-${Math.max(0,n-1)}/-${n}。`},
    {id:'massDebuff',price:4.5,weight:3,classes:[1,4,5,6],exclusive:true,max:4,text:n=>`使对手的战场上的所有随从-${Math.max(0,n-1)}/-${n}。`},
    {id:'treasureSupply',price:1.7,weight:7,classes:[2],exclusive:true,max:2,text:n=>`将${n}张『$TREASURE』加入手牌。`},
    {id:'commonSupply',price:1.6,weight:7,classes:[1,3],exclusive:true,max:2,text:n=>`将${n}张『$SUPPORT』加入手牌。`},
    {id:'coinSupply',price:3.2,weight:6,classes:[2],exclusive:true,max:2,text:n=>`将${n}张『闪耀的金币』加入手牌。`},
    {id:'flagSummon',price:4,weight:6,classes:[2],exclusive:true,max:2,text:n=>`召唤${n}张『令人战栗的海盗旗』。`},
    {id:'flagAdvance',price:1.8,weight:3,classes:[2],exclusive:true,max:4,text:n=>`使自己的战场上的所有『令人战栗的海盗旗』的倒计数-${n}。`},
    {id:'chargeGauge',price:2.8,weight:3,classes:[],max:2,text:n=>`使自己的所有手牌的奥义槽+${n}。`},
    {id:'deckDiscount',price:14,weight:2,classes:[3],exclusive:true,max:1,text:()=> '使自己的牌组中的所有随从的费用-2。'},
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
    {id:'selfEvolve',price:6,weight:5,classes:[],max:1,types:['follower'],text:()=> '本随从进化。'},
    {id:'allyEvolve',price:6,weight:3,classes:[],max:1,text:()=> '选择自己的战场上的1个进化前的其他随从，使其进化。'},
    {id:'teamEvolve',price:16,weight:1.5,classes:[],max:1,text:()=> '使自己的战场上的所有进化前的随从进化。'},
    {id:'selfSuperEvolve',price:14,weight:1,classes:[],max:1,types:['follower'],text:()=> '本随从超进化。'}
  );
  function strategyTags(card) {
    const tags=new Set(),families={
      experiment:/^experiment/,crystalHands:/^crystalHand/,
      earth:/^(earth|earthRites)$/,spellboost:/^(boost|spells|spellboost|costReduction)/,
      truth:/^(handCostUp|costChanged|truthTransform)/,
      forest:/^(combo|forestHistory|bounce|fairy|return)$/,
      army:/^(rally|tribeEngine|tribeSupply|tribeBuff|tribeEvolve|tribeCountDamage)/,
      treasure:/^(treasure|coin|flag)/,discard:/^discard/,hurt:/^(hurt|allyPing|allBoardDamage)/,
      blood:/^(blood|selfDamage|lowHealth|missingHealth)/,
      grave:/^(grave|necromancy|reanimate)/,ward:/^ward/,amulet:/^(amulet|activate)/,
      artifact:/^(artifact|coreSupply|corePair|fusionArtifact)/
    };
    function tag(id){for(const [family,pattern] of Object.entries(families))if(pattern.test(id||''))tags.add(family);}
    for(const a of card.abilities||[]){
      if(a.kind==='alternate')continue;
      (a.ids||[]).forEach(tag);(a.fusionEvent?.effects||[]).forEach(tag);tag(a.condition);
      for(const t of a.tokens||[]){
        if(t.id===10931110)tags.add('experiment');
        if(t.id===10631110)tags.add('crystalHands');
        if(t.id===90011310||t.id===90011120)tags.add('forest');
        if(t.id===90031210)tags.add('earth');
        if([90031130,90031140,90032110,90031310].includes(t.id))tags.add('spellboost');
        if(t.tribe==='创造物')tags.add('artifact');
        if(t.tribe==='财宝')tags.add('treasure');
      }
    }
    for(const e of card.emblems||[]){tag(e.engine);tag(e.eventId);(e.supportTags||[]).forEach(tag);}
    for(const f of card.faiths||[])for(const g of f.gainRules||[])tag(g.eventId);
    if(card.handTrigger)tag(card.handTrigger.eventId);
    return [...tags].sort();
  }
  function strategyAffinity(context,candidate,alternate=false){
    if(!context.length||!candidate.length)return 1;
    const related=(a,b)=>[['earth','spellboost'],['truth','spellboost']].some(pair=>pair.includes(a)&&pair.includes(b));
    const disconnected=candidate.filter(tag=>!context.includes(tag)&&!context.some(other=>related(tag,other)));
    // Named token engines require separate deck support; common utility remains available.
    if(disconnected.some(tag=>tag==='experiment'&&context.includes('crystalHands')||tag==='crystalHands'&&context.includes('experiment')))return alternate?.02:.12;
    if(disconnected.length)return alternate?.16:context.length>=2?.15:.5;
    return candidate.some(tag=>context.includes(tag))?2:1.4;
  }
  function generate(input,options={}) {
    const card=generateCard(input,null,options);
    const definitions=new Map([...TOKENS,...SUPPORT_CARDS,...RELATED_CARDS].map(t=>[t.name,t]));
    // Definitions reached through fusion are reference material, not free rewards.
    function complete(tokens){
      const seen=new Set(tokens.map(t=>t.id));
      for(let i=0;i<tokens.length;i++)for(const m of tokens[i].text.matchAll(/『([^』]+)』/g)){
        const t=definitions.get(m[1]);if(t&&!seen.has(t.id)){seen.add(t.id);tokens.push({...t,related:true});}
      }
    }
    complete(card.tokens);for(const f of card.alternateForms)if(f.tokens)complete(f.tokens);
    return card;
  }
  function generateCard(input,alternateConfig=null,options={},skipProgression=false) {
    const roll=initialRoll(input,options);
    const chaos=options.chaos===true;
    if(chaos)roll.r=rng(hash(roll.seed+'|ultimate-chaos'));
    if(alternateConfig)Object.assign(roll,{type:'spell',cost:alternateConfig.cost,cls:alternateConfig.cls,rarity:alternateConfig.rarity,r:rng(hash(roll.seed+'|accelerate|'+alternateConfig.cost))});
    const {name,seed,r,cls,rarity,cost,type}=roll,pick=a=>a[Math.floor(r()*a.length)];

    const highRole=type==='follower'&&cost>=7?weighted(rng(hash(seed+'|high-role')),[['offense',cls===4?54:43],['defense',cls===6?54:43],['flexible',14]]):null;
    const highCostBonus=highRole?1+(cost-6)*.8:0;
    const simpleDesign=!chaos&&type==='follower'&&rarity===0&&cost>=6;
    // All self-evolution entry points share this rare unconditional allowance.
    // A second pool cannot independently roll past the restriction.
    const unconditionalSelfEvolution=cost>=5&&rng(hash(seed+'|unconditional-self-evolution'))()<(cost>=7?.12:.035);
    const tribe=TRIBES[cls],tribal=!!tribe&&rng(hash(seed+'|tribal-theme'))()<.08;
    const tribeToken=tribal?weighted(r,TOKENS.filter(t=>t.tribeId===tribe.id).map(t=>[t,t.cost<=1?3:1])):null;
    const profile=(type==='follower'?CALIBRATION.profiles:CALIBRATION.typeProfiles[type])[`${cost<=3?0:cost<=6?1:2}:${cls}:${rarity}`];
    let keywordQuota=weighted(r,profile.keywordCounts.map((weight,n)=>[n,weight]));
    const oversized=type==='follower'&&cost>=7&&cls===4&&r()<.23;
    // Raise the upper body range without raising every card or its effect budget.
    const bodyHeadroom=type==='follower'&&cost>=4&&!oversized?weighted(rng(hash(seed+'|body-headroom')),cost<=6?[[0,55],[1,30],[2,15]]:[[0,40],[1,20],[2,25],[3,15]]):0;
    let floor=type==='follower'?(oversized?2*(cost+3):BODY[cost])+bodyHeadroom:0;
    const chaosBody=chaos&&type==='follower'&&cost>=2?1+Math.floor(cost/5):0;
    const chaosPower=chaos&&!alternateConfig?1.18:1;
    // Small power variation is independent of rarity; rarity governs structure.
    const powerVariation=rng(hash(seed+'|power-variation'))()*(type==='follower'?2.4:1.2);
    const baseBudget=alternateConfig?cost*2.4+.4:type==='follower'?floor+ABILITY[cost]+powerVariation+highCostBonus:(cost===0?.9:cost*2.8+.6+Math.max(0,cost-5)**1.3*.7)+powerVariation;
    let budget=type==='follower'?floor+chaosBody+(baseBudget-floor)*chaosPower:baseBudget*chaosPower;
    floor+=chaosBody;
    const card={version:VERSION,name,seed,type,class:cls,rarity,cost,attack:type==='follower'?0:null,health:type==='follower'?0:null,abilities:[],tokens:[],emblems:[],faiths:[],alternateForms:[],budget,spent:0,bodyAllowance:floor,theme:THEMES[cls]};
    if(highRole){card.highRole=highRole;card.highCostBonus=highCostBonus;}
    if(bodyHeadroom)card.bodyHeadroom=bodyHeadroom;
    if(chaos){card.chaos=true;card.chaosPower={baseBudget,bodyBonus:chaosBody,effectMultiplier:chaosPower};}
    if(tribal)card.tribalTheme=tribe.name;
    if(simpleDesign)card.simpleDesign=true;
    const sampledAttackBias=pick(cost===2?[-.25,-.25,-.25,0,0,.25,.25,.25]:cost===3?[-.25,-.17,-.1,0,.1,.17,.25]:[-.2,-.1,0,0,0,.1,.2]);
    const attackBias=Math.max(-.3,Math.min(.3,sampledAttackBias+(highRole==='offense'?.08:highRole==='defense'?-.08:0)));
    const searchKeyword=pick(['守护','突进','疾驰','谢幕曲','入场曲']);
    const searchType=pick(cls===3?['法术','费用为3或以下的随从']:cls===6?['护符','原始费用为6或以上的卡牌']:cls===7?['原始费用为5或以上的随从','原始费用为5或以上的卡牌']:['费用为3或以下的随从','费用为5或以上的随从']);
    // Keep the former three reward rolls so unrelated cards retain their stream.
    weighted(r,cost>=7?[[1,5],[2,3],[3,1]]:cost>=4?[[1,4],[2,1]]:[[1,1]]);
    // Hand and summon delivery share one independently composed reward definition.
    pick(['使魔','侍从','造物']);pick(['守护','突进','谢幕曲']);
    const generatedToken=createReward(name,seed,cls,cost);
    const classTokens=TOKENS.filter(t=>t.class===cls);
    const sampledToken=r()<[.006,.018,.045,.065][rarity]?generatedToken:weighted(r,classTokens.map(t=>[t,t.poolWeight??(t.id===TOKENS[cls].id?4:t.id===90021120&&cls===2?3:1)]));
    let token=alternateConfig?.token||(tribal&&r()<.7?tribeToken:sampledToken);
    function handDelivery(t){
      if(!SUMMON_FIRST.has(t.id))return {discount:0,unitPrice:tokenValue(t,'hand'),text:n=>`将${n}张『${t.name}』加入手牌。`};
      const hr=rng(hash(seed+'|discounted-token|'+t.id));
      if(hr()>=.16)return null;
      const discount=t.cost===3?1:1+Math.floor(hr()*2);
      return {discount,unitPrice:tokenValue(t,'hand')+discount*1.4,text:n=>`将${n}张『${t.name}』加入手牌，使这些卡牌的费用-${discount}。`};
    }
    const transformToken=cls===1?TOKENS[1]:weighted(rng(hash(seed+'|transform-token')),[[TOKENS[14],4],[TOKENS[9],2]]);
    const enemyTransformToken=cls===1?TOKENS[1]:TOKENS[3];
    const artifactToken=cls===7?weighted(r,TOKENS.filter(t=>t.class===7&&t.name.includes('创造物')).map(t=>[t,t.cost===1?5:t.cost===3?3:1])):TOKENS[8];
    const used=new Set();
    const blockedEffects=new Set();
    function withBlocked(ids,fn){
      const saved=new Set(used),prior=new Set(blockedEffects);
      ids.forEach(id=>{used.add(id);blockedEffects.add(id);});
      try{return fn();}finally{used.clear();saved.forEach(id=>used.add(id));blockedEffects.clear();prior.forEach(id=>blockedEffects.add(id));}
    }
    function effectAvailable(id,trigger){
      if(blockedEffects.has(id))return false;
      if(!used.has(id))return true;
      if(!REPEATABLE_EFFECTS.has(id))return false;
      const sources=card.abilities.filter(a=>a.ids.includes(id));
      return sources.length>0&&sources.every(a=>a.trigger!==trigger);
    }
    function refreshUsed(){used.clear();card.abilities.forEach(a=>a.ids.forEach(id=>used.add(id)));}
    const core=SUPPORT_CARDS[6+Math.floor(rng(hash(seed+'|core'))()*2)];
    const fusionArtifact=TOKENS.find(t=>t.id===(rng(hash(seed+'|fusion-artifact'))()<.5?90072110:90072120));
    const experimentKeyword=weighted(rng(hash(seed+'|experiment-keyword')),[['守护',4],['虹吸',3],['毁灭',2]]);
    const treasure=SUPPORT_CARDS[Math.floor(rng(hash(seed+'|treasure'))()*4)];
    const commonSupplies=SUPPORT_CARDS.filter(t=>t.commonSupply&&t.class===cls);
    const commonSupply=commonSupplies.length?weighted(rng(hash(seed+'|common-supply')),commonSupplies.map(t=>[t,1])):null;
    function growth(n,key){
      const g=rng(hash(seed+'|growth|'+key+'|'+n));
      return weighted(g,[[[n,n],3],[[n+1,Math.max(0,n-1)],2],[[Math.max(0,n-1),n+1],2],[[n,Math.max(0,n-1)],1],[[Math.max(0,n-1),n],1]]);
    }
    const triggerWeight=trigger=>(profile.triggers[trigger]||0)*(trigger==='谢幕曲'?(cls===5?2.55:1.5):1)*(['进化时','超进化时'].includes(trigger)&&card.abilities.some(a=>a.trigger==='入场曲'&&a.ids.includes('setHealth'))?1.7:1);
    const requiresChoice=text=>/选择(?:(?:自己|对手)的(?:(?:战场上|手牌中)的)?|战场上的)[1-9][个张]/.test(text);
    // Choosing a card from hand is not a battlefield target.
    const targeted=text=>requiresChoice(text.replace(/选择(?:自己|对手)的(?:手牌中的[1-9]张[^，。]*|[1-9]张手牌)/g,''));
    const EXTRA_TARGET_WEIGHT=.18;
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
    const searchIds=new Set(['handCycleTutor','keywordSearch','typeSearch','wardSearch','amuletSearch','activeAmuletSearch','tutor']);
    const copyIds=new Set(['opponentHandCopy','opponentDeckCopy']);
    const copyValue=(id,n)=>n*(id==='opponentHandCopy'?2.5:2.4)+.5*n*(n-1);
    const searchValue=(id,n)=>n*(id==='handCycleTutor'?2.2:id==='amuletSearch'?2.7:id==='typeSearch'?3:3.2)+.6*n*(n-1);
    function searchCap(trigger,effectCost=cost){
      if(!['入场曲','进化时','超进化时','谢幕曲','爆能强化','法术','启动'].includes(trigger))return 1;
      return effectCost>=7?3:effectCost>=4||['进化时','超进化时'].includes(trigger)?2:1;
    }
    function searchCount(text){
      const count=s=>[...s.matchAll(/从自己的牌组中随机将([1-9])张|抽取([1-9])张护符/g)].reduce((n,m)=>n+Number(m[1]||m[2]),0);
      const branches=text.split(/\n（\d+）/);
      return branches.length>1?count(branches[0])+Math.max(...branches.slice(1).map(count)):count(text);
    }
    function roleWeight(id){
      if(!highRole||highRole==='flexible')return 1;
      if(['recoverFollower','artifactRecover','draw','tutor','keywordSearch','typeSearch','tokenHand','handCycle','coreSupply','corePair'].includes(id))return .45;
      if(highRole==='offense')return ['damage','face','splitDamage','疾驰','威慑','summonStorm'].includes(id)?2.4:['heal','守护'].includes(id)?.6:1;
      return ['heal','aoe','banish','destroy','守护','屏障','damageCap','reduceDamage'].includes(id)?2.5:['face','疾驰'].includes(id)?.4:1;
    }
    // PP recovery was absent from the older effect classifier; without a
    // separate prior it would receive only the near-zero unknown-effect weight.
    const ppPrior=cls===0?.06:[2,4,5].includes(cls)?.03:0;
    const effectPriorAlias={activeAmuletRecruit:'amuletRecruit',activeAmuletSearch:'amuletSearch',commonSupply:'tokenHand',recoverFollower:'draw',artifactRecover:'artifact',mixedStats:'damage',amuletReviveHighest:'amuletRevive',enemySupply:'tokenSummon'};
    function effectWeight(id,fallback=3){return roleWeight(id)*Math.max(.001,(profile.effects[id]||profile.effects[effectPriorAlias[id]]*.5||(id==='pp'?ppPrior:0))*.85+fallback/150*.15)*(id==='ramp'?(cost<=6?5:cost<=8?2:.5):id==='bounce'?(cost<=3?2:1.2):id==='tokenSummon'&&cls===2?2.5:id.startsWith('tribe')?30:['treasureSupply','coinSupply','flagSummon'].includes(id)?3:id==='flagAdvance'?5:1);}
    function quantityWeight(id,n,trigger='其他',effectCost=cost) {
      const aliases={recoverFollower:'draw',artifactRecover:'tokenHand',coreSupply:'tokenHand',corePair:'tokenHand',fusionArtifactHand:'tokenHand',fusionArtifactSummon:'tokenSummon',handCycle:'draw',handRefill:'draw',tribeSupply:'draw',tribeBuff:'allyBuff',wardSearch:'draw',amuletSearch:'draw',bloodDraw:'draw',missingHealthDamage:'damage',artifactCopy:'tokenSummon',amuletRecruit:'tokenSummon',wardBuff:'allyBuff',artifactBuff:'allyBuff'};
      const kind=aliases[id]||(['keywordSearch','typeSearch'].includes(id)?'draw':id.startsWith('experiment')?(id==='experimentSupply'?'tokenHand':id==='experimentSummon'?'tokenSummon':'allyBuff'):id.startsWith('crystalHand')?(id==='crystalHandSupply'?'tokenHand':id==='crystalHandSummon'?'tokenSummon':'allyBuff'):id);
      const actual=id==='reanimate'||id==='handRefill'?n+1:n;
      const tables=type==='follower'?CALIBRATION.quantities:CALIBRATION.typeQuantities[type];
      const hist=tables[kind]?.[Math.max(1,effectCost)]?.[trigger]||tables[kind]?.[Math.max(1,effectCost)]?.['其他'];
      const prior=hist?.[actual]||.08;
      // A small cost-dependent prior keeps large outcomes possible, not equally
      // common on a cheap evolve card and an expensive finisher.
      let weight=prior*Math.exp(-Math.max(0,actual-(1+effectCost*.7))*.4);
      if(searchIds.has(id))weight*=n===1?1:n===2?(effectCost<=3?.12:effectCost<=6?.35:.7):(effectCost<7?.02:.25);
      if(['recoverFollower','artifactRecover'].includes(id)&&n>1)weight*=.25;
      if(copyIds.has(id))weight*=n===1?1:n===2?.3:.08;
      if(['damage','face','aoe','splitDamage'].includes(kind)&&effectCost>=4){
        const burst=['入场曲','进化时','超进化时','谢幕曲','爆能强化','法术','本随从进化时','本卡牌被舍弃时'].includes(trigger);
        const target=1+effectCost*({damage:.7,face:.28,aoe:.32,splitDamage:.9})[kind];
        // Suppress cheap chip damage on expensive cards without making every
        // roll hit its cap. Repeated damage keeps a gentler cost relationship.
        weight*=Math.exp(-Math.max(0,target-actual)*(burst?.9:.25));
      }
      return weight;
    }
    function rollAmount(id,min,max,trigger='其他',effectCost=cost){return weighted(r,Array.from({length:max-min+1},(_,i)=>[min+i,quantityWeight(id,min+i,trigger,effectCost)]));}
    function add(a) {card.abilities.push(a);card.spent+=a.price;a.ids.forEach(id=>used.add(id));(a.tokens||[]).forEach(t=>{if(!card.tokens.some(v=>v.id===t.id))card.tokens.push({...t});});}
    function hasTribePayoff(){return tribal&&(['tribeEngine','tribeBuff','tribeEvolve','tribeCountDamage'].some(id=>used.has(id))||card.emblems.some(e=>['tribeEnter','tribeAttack'].includes(e.eventId)));}
    function alignTribeToken(){
      // An actual tribal payoff attracts a matching producer. The tribe theme
      // alone, or merely listing a related token, does not trigger this preference.
      if(TRIBAL_SYNERGY>1&&!alternateConfig&&hasTribePayoff()&&token.tribeId!==tribe.id&&rng(hash(seed+'|tribal-producer'))()<.8)token=tribeToken;
    }
    // A modest preference, not a guaranteed combo. Read actual ability payloads:
    // listing an emblem's related token alone does not mean it summons that token.
    function synergyWeight(ids,tokens=[],trigger='') {
      const context=[...new Set([...(alternateConfig?.strategyContext||[]),...strategyTags(card)])];
      const affinity=strategyAffinity(context,strategyTags({abilities:[{ids,tokens}]}),!!alternateConfig);
      const continuity=continuityWeight(card.abilities,ids,trigger);
      if(used.has('drawLuckEmblem')&&ids.some(id=>['draw','handCycle','handRefresh','handRefill'].includes(id)))return Math.max(1.8,continuity)*affinity;
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
      const handSupport=card.handTrigger&&({leave:['bounce'],combo:['tokenHand','bounce'],play:['tokenHand'],enhance:['enhance'],earth:['earth'],crystalHands:['crystalHandSupply','crystalHandSummon'],hurt:['allyPing','allBoardDamage'],lowHealth:['bloodDraw'],activate:['amulet'],amuletDeath:['amuletRecruit','amuletBreak'],highCostEnter:['artifact','artifactCopy'],fusion:['coreSupply','corePair','fusionArtifactHand']}[card.handTrigger.eventId]||[]).some(id=>ids.includes(id));
      const portalSupport=cls===7&&((used.has('artifactCopy')||used.has('artifactLink')||used.has('artifactBuff')||crestTag('artifact')||hasCondition('artifactKinds')||card.fusion?.material==='创造物·卡牌')&&is('coreSupply','corePair','fusionArtifactHand','fusionArtifactSummon')||(used.has('coreSupply')||used.has('corePair')||used.has('fusionArtifactHand'))&&is('artifactCopy','artifactBuff'));
      const experimentProducer=is('experimentSupply','experimentSummon')||provides(10931110);
      const experimentLink=cls===3&&(used.has('experimentFusion')&&is('experimentSupply','experimentSummon','experimentBuff','experimentGrant')||(crestTag('experiment')||hasCondition('experimentHistory')||used.has('experimentBuff')||used.has('experimentGrant'))&&experimentProducer||(used.has('experimentSummon')||used.has('experimentSupply')||alreadyProvides(10931110))&&is('experimentBuff','experimentGrant'));
      const royalLink=cls===2&&(used.has('treasureLink')&&is('treasureSupply')||(used.has('spellLink')||used.has('flagSummon'))&&is('coinSupply','treasureSupply')||used.has('flagSummon')&&is('flagAdvance'));
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
        (used.has('bloodDraw')||hasCondition('selfDamage'))&&is('missingHealthDamage')||
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
        card.abilities.some(a=>a.trigger==='攻击时')&&is('突进','doubleAttack')||
        card.abilities.some(a=>a.trigger==='交战时'&&a.ids.includes('boost'))&&is('守护','突进');
      const tribalProducer=hasTribePayoff()&&tokens.some(t=>t.tribeId===tribe.id);
      if(tribalProducer&&is('summon','tokenSummon'))return Math.max(match?1.4:1,TRIBAL_SYNERGY)*affinity;
      if(tribalProducer&&is('tokenHand','tribeSupply'))return Math.max(match?1.4:1,Math.sqrt(TRIBAL_SYNERGY))*affinity;
      return Math.max(continuity,handSupport?1.8:portalSupport?2.4:experimentLink?2.4:royalLink?2.8:match?1.4:1)*(ids.some(id=>roleWeight(id)>1)?1.35:1)*affinity;
    }
    function enhanceSummons(candidate,t,count,limit,effectiveCost,complexity=null){
      const slots=complexity?complexity.maxAtoms-candidate.ids.length:rarity>=2&&effectiveCost>=7?2:1;
      if(slots<1||r()>(cls===5?.48:.32))return candidate;
      const increase=candidate.text.match(/使这些随从\+(\d+)\/\+(\d+)/);
      const attack=(t.id===10931110&&effectiveCost>=5?5:t.attack)+(increase?Number(increase[1]):0);
      const health=t.health+(increase?Number(increase[2]):0);
      const attacks=t.design?.parts.some(p=>p.id==='doubleAttack')?2:1;
      const grants=[];
      const offer=(id,text,raw,weight)=>grants.push({id,text,raw:raw*count,weight});
      if(!t.text.includes('【突进】')&&!t.text.includes('【疾驰】'))offer('summonRush','【突进】',0,5);
      if(!t.text.includes('【守护】'))offer('summonWard','【守护】',0,5);
      if(rarity>=1){
        if(!t.text.includes('【毁灭】'))offer('summonBane','【毁灭】',keywordPrice('毁灭',attack,health,{rush:true}),2);
        if(!t.text.includes('【虹吸】'))offer('summonDrain','【虹吸】',keywordPrice('虹吸',attack,health,{attacks})+attack*attacks*.25,cls===5?3:1);
        if(effectiveCost>=5&&count*attack*attacks<=effectiveCost*(chaos?1.2:1)&&!t.text.includes('【疾驰】'))offer('summonStorm','【疾驰】',keywordPrice('疾驰',attack,health,{attacks})+attack*attacks*.75,2);
        if(effectiveCost>=3){
          offer('summonDeathDraw','「【谢幕曲】抽取1张卡牌。」',drawValue(effectiveCost,1)*.7,cls===5?4:1);
          offer('summonDeathHeal','「【谢幕曲】回复自己的主战者2点生命值。」',1,cls===6?3:1);
          offer('summonDeathDamage','「【谢幕曲】对对手的战场上的随机1个随从造成2点伤害。」',1.8,2);
          if(cls===5)offer('summonDeathGrave','「【谢幕曲】使自己的墓场+2。」',1,3);
        }
      }
      const selected=[];let extra=0;
      for(let i=0;i<Math.min(2,slots);i++){
        if(i&&r()>.22)break;
        const pool=grants.filter(g=>!used.has(g.id)&&!selected.some(v=>v.id===g.id)&&g.raw+extra+candidate.raw<=limit&&!(g.id==='summonStorm'&&selected.some(g=>g.id==='summonRush')||g.id==='summonRush'&&selected.some(g=>g.id==='summonStorm')));
        if(!pool.length)break;
        const g=weighted(r,pool.map(g=>[g,g.weight]));selected.push(g);extra+=g.raw;
      }
      if(!selected.length)return candidate;
      const text='使这些随从获得'+selected.map(g=>g.text).join('和')+'。';
      return {...candidate,text:candidate.text+text,raw:candidate.raw+extra,boardValue:(candidate.boardValue||candidate.raw)+extra,
        ids:[...candidate.ids,...selected.map(g=>g.id)],
        components:[...(candidate.components||[{id:candidate.ids[0],text:candidate.text,raw:candidate.raw}]),...selected.map(g=>({id:g.id,text:g.text,raw:g.raw}))],
        summonGrants:{tokenId:t.id,count,attack,health,attacks,effectiveCost,extra,grants:selected.map(g=>({id:g.id,raw:g.raw}))}};
    }
    const attackCount=()=>used.has('tripleAttack')?3:used.has('doubleAttack')?2:1;
    function keyword(k) {const a=Math.max(1,Math.min(Math.round(floor*(.5+attackBias)),Math.max(1,floor-1),k==='疾驰'||used.has('疾驰')?Math.max(1,cost-1):Infinity));const p=keywordPrice(k,a,floor-a,{rush:used.has('突进'),storm:used.has('疾驰'),ward:used.has('守护'),engine:card.emblems.length>0,protected:used.has('abilityDestructionImmune'),attacks:attackCount()});return {kind:'keyword',trigger:'',condition:'none',text:`【${k}】`,price:p,raw:p,ids:[k]};}
    function modularAtom(kind,automatic=true,trigger='入场曲') {
  automatic=automatic||!canChooseTarget(trigger);
  const n=rollAmount('damage',Math.max(3,Math.floor(cost*(highRole==='offense'?.75:.5))),Math.min(10,cost+1),trigger);
  const target=automatic?'对对手的战场上的随机1个随从':'选择对手的战场上的1个随从，对其';
  const atom=(text,raw,tokens=[])=>({kind,ids:[kind],text,raw,tokens,components:[{id:kind,text,raw}]});
  switch(kind) {
    case 'damage':return atom(`${target}造成${n}点伤害。`,n*1.25);
    case 'destroy':return atom(automatic?'破坏对手的战场上的随机1个随从。':'选择对手的战场上的1个随从，破坏该随从。',7);
    case 'aoe':{const x=rollAmount('aoe',2,Math.min(5,Math.max(3,Math.floor(cost/2))),trigger);return atom(`对对手的战场上的所有随从造成${x}点伤害。`,x*3.8);}
    case 'draw':{const x=rollAmount('draw',1,3,trigger);return atom(`抽取${x}张卡牌。`,drawValue(cost,x));}
    case 'heal':{const x=rollAmount('heal',Math.max(3,Math.floor(cost*(highRole==='defense'?.8:.4))),Math.min(10,cost+1),trigger);return atom(`回复自己的主战者${x}点生命值。`,x*.65);}
    case 'face':{const x=rollAmount('face',2,Math.min(5,Math.floor(cost/2)),trigger);return atom(`对对手的主战者造成${x}点伤害。`,x*2.7);}
    case 'pp':{
      const max=cost>=8?3:cost>=5?2:1;
      const amount=weighted(r,Array.from({length:max},(_,i)=>[i+1,i===1?5:i===0?3:1]));
      return {...atom(`回复自己${amount}点能量点。`,amount*3.5),ppRecovery:amount};
    }
    case 'boost':{const x=rollAmount('boost',1,2,trigger);return atom(`使自己的所有手牌发动${x}次魔力增幅。`,x*2);}
    case 'earth':{const x=rollAmount('earth',1,2,trigger);return atom(`使自己的战场上的土之印+${x}。`,x*1.6);}
    case 'reanimate':{const x=Math.min(5,cost-3);return atom(`发动【亡者召还 ${x}】。`,x*3);}
    case 'teamBuff':return atom('使自己的战场上的其他所有随从+2/+1。',6);
    case 'tutor':{const x=rollAmount('tutor',1,searchCap(trigger),trigger);return atom(`从自己的牌组中随机将${x}张拥有【${searchKeyword}】的随从加入手牌。`,searchValue('tutor',x));}
    case 'summon':{
      alignTribeToken();
      const t=TRIBAL_SYNERGY>1&&hasTribePayoff()?tribeToken:cls===4?TOKENS[10]:cls===3?TOKENS[9]:cls===6?pick([TOKENS[6],TOKENS[13],TOKENS[14]]):token;
      const count=t.attack>=4?1:rollAmount('tokenSummon',1,Math.min(3,Math.max(1,Math.floor(10/tokenValue(t)))),trigger);
      // Small armies may get an upgrade as part of the summon, never an unbound aura.
      const upgrade=(t.attack===1||cls===2&&t.tribeId===2)&&r()<.65;
      const [a,h]=growth(cost>=8?2:1,'core-summon');
      const result=atom(`召唤${count}个『${t.name}』。`+(upgrade?`使这些随从+${a}/+${h}。`:''),count*tokenValue(t)+(upgrade?count*(a+h)*.9:0),[t]);
      if(upgrade)result.components=[{id:'summon',text:`召唤${count}个『${t.name}』。`,raw:count*tokenValue(t)},{id:'summonGrowth',text:`使这些随从+${a}/+${h}。`,raw:count*(a+h)*.9}];
      return enhanceSummons(result,t,count,Infinity,cost);
    }
  }
}
function pickAtom(limit,exclude=[],automatic=true,minRaw=0,trigger='入场曲') {
  const entries=[['damage',3],['destroy',1],['aoe',[3,4].includes(cls)?4:1],['draw',3],['heal',cls===6?5:1],['tutor',2],['summon',[1,2,7].includes(cls)?5:2]];
  if([0,4,5].includes(cls))entries.push(['face',2]);
  // Olivia establishes neutral PP recovery. Restoring spendable PP is not
  // raising the maximum; restrict it to deliberate own-turn resolution.
  if([0,2,4,5].includes(cls)&&['入场曲','进化时','超进化时','法术','爆能强化'].includes(trigger))entries.push(['pp',cls===0?2:3]);
  if(cls===3)entries.push(['boost',4],['earth',3]);
  if(cls===5)entries.push(['reanimate',4]);
  if([1,2].includes(cls))entries.push(['teamBuff',4]);
  const atoms=entries.filter(([k])=>!exclude.includes(k)&&effectAvailable(k,trigger)).map(([k,w])=>[modularAtom(k,automatic,trigger),w]);
  const eligible=atoms.filter(([a])=>a.raw<=limit&&a.raw>=minRaw).map(([a,w])=>[a,w,1]);
  // Earth and spellboost are separate atoms, eligible alone or with any other atom.
  if(cls===3)for(let i=0;i<atoms.length;i++)for(let j=i+1;j<atoms.length;j++){
    const [a,aw]=atoms[i],[b,bw]=atoms[j],raw=a.raw+b.raw;
    if(![a.kind,b.kind].some(k=>k==='earth'||k==='boost')||raw<minRaw||raw>limit)continue;
    eligible.push([{kind:a.kind,ids:[...a.ids,...b.ids],text:a.text+b.text,raw,tokens:[...a.tokens,...b.tokens],components:[...a.components,...b.components]},Math.sqrt(aw*bw),.2]);
  }
  return eligible.length?weighted(r,eligible.map(([a,w,scale])=>[a,scale*effectWeight(a.kind==='summon'?'tokenSummon':a.kind==='tutor'?'keywordSearch':a.kind,w)*synergyWeight(a.ids,a.tokens,trigger)*(phaseHasTarget(trigger)&&targeted(a.text)?EXTRA_TARGET_WEIGHT:1)])):null;
}
    function signatureCore() {
  if(['疾驰','exhaustibleCycle','handTrigger','invocation','deckDiscount','enemyEmblem','drawLuckEmblem','handLuck','treasureLink','spellLink','discardSelfSummon','enemyEntry','amuletReviveHighest'].some(id=>used.has(id)))return false;
  if((chaos?rarity<1:rarity!==3)||cost<7||r()>Math.min(.9,(.14+(cost-7)*.13)*(chaos?2.3:1)))return false;
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
      const classEvents={1:[['fairy','自己使用『妖精』时',5]],2:[['enhance','自己通过【爆能强化】使用卡牌时',5]],3:[['experiment','自己的『沉溺的实验体』进入战场时',3],['crystalHands','自己的『天晶魔手』进入战场时',3],['earth','自己发动【土之秘术】时',3],['costChanged','自己使用费用发生变化的随从时',3]],4:[['dragonEvolve','自己的随从进化时',3],['hurt','自己的随从受到伤害且没被破坏时',3]],5:[['death','自己的随从被破坏时',5]],6:[['heal','自己的主战者回复时',3],['amulet','自己的护符被破坏时',3],['ward','自己的拥有【守护】的随从被破坏时',2]],7:[['artifact','自己的创造物·随从进入战场时',5]]};
      events.push(...(classEvents[cls]||[]));
      if(tribal)events.push(['tribeEnter',`自己的${tribe.name}·随从进入战场时`,6],['tribeAttack',`自己的${tribe.name}·随从攻击时`,2]);
      const [eventId,eventText]=weighted(r,events.filter(e=>!simple||['start','end'].includes(e[0])).map(e=>[e,e[2]]));
      const conditions=[['none','',1,8],['hand',`若自己的手牌的张数为${pick([3,4,5])}张或以下，则`,.8,.4],['board',`若自己的战场上有至少${pick([2,3])}个随从，则`,.8,1]];
      const themeConditions={1:['fairy','若本次对战中自己已使用至少5张『妖精』，则',.7],2:['rally',`【协作 ${pick([10,20])}】`,.65],3:['earth','若自己的战场上的土之印数为2或以上，则',.75],4:['overflow','若为【觉醒】，则',.75],5:['lowHealth','若自己的主战者的生命值为12或以下，则',.7],6:['amulet','若自己的战场上有护符，则',.8],7:['artifact','若本次对战中进入战场的自己的创造物·随从的种类为3种或以上，则',.65]};
      if(themeConditions[cls])conditions.push([...themeConditions[cls],3]);
      if(cls===4)conditions.push(['lowHealth','若自己的主战者的生命值为12或以下，则',.7,1]);
      const [conditionId,conditionText,conditionFactor]=weighted(r,conditions.filter(c=>!simple||c[0]==='none').map(c=>[c,c[3]]));
      const clockEvent=['start','end'].includes(eventId);
      const small=permanent?Math.min(2,1+Math.floor(cost/6)):Math.min(4,1+Math.floor(cost/3));
      const amount=id=>rollAmount(id,1,small,eventText);
      const pool=[];
      const part=(id,text,raw,weight=3,tokens=[],produces=[])=>pool.push({id,text,raw,weight,tokens,produces});
      const damageMax=clockEvent?Math.min(permanent?6:8,Math.max(1,Math.ceil(cost*.7))):small;
      const heal=amount('heal'),damage=rollAmount('damage',clockEvent&&cost>=7?2:1,damageMax,eventText);
      part('draw',`抽取${!permanent&&cost>=7&&r()<.2?2:1}张卡牌。`,drawValue(cost,1),3);
      if(pool[0].text.includes('2张'))pool[0].raw=4.4;
      if(eventId!=='heal')part('heal',`回复自己的主战者${heal}点生命值。`,heal*.65,cls===6?5:3,[],['heal']);
      part('damage',`对对手的战场上的随机1个随从造成${damage}点伤害。`,damage*1.25,3);
      // Once-per-turn clocks can carry a larger independent damage payload.
      // Rapid class events retain their smaller payloads and feedback guards.
      if(clockEvent&&cost>=4){
        const split=rollAmount('splitDamage',2,Math.min(12,cost+2),eventText);
        const aoe=rollAmount('aoe',1,cost>=8?3:cost>=6?2:1,eventText);
        part('splitDamage',`对对手的战场上的所有随从分配${split}点伤害。`,split*1.1,2);
        part('aoe',`对对手的战场上的所有随从造成${aoe}点伤害。`,aoe*3.8,1.5);
      }
      const buffSize=cost>=6?2:1,[buffAttack,buffHealth]=growth(buffSize,'emblem');
      part('buff',`使自己的战场上的随机1个随从+${buffAttack}/+${buffHealth}。`,buffSize*2,cls===1||cls===2?4:2);
      if(cost>=5&&!permanent)part('teamBuff','使自己的战场上的所有随从+1/+1。',5,2);
      if([0,4,5].includes(cls)&&cost>=4)part('face',`对对手的主战者造成${permanent?1:Math.min(2,small)}点伤害。`,permanent?2.7:Math.min(2,small)*2.7,2);
      const supply=eventId==='experiment'?TOKENS[25]:tribal?tribeToken:cls===7?artifactToken:cls===3?TOKENS[16]:TOKENS[cls];
      part('supply',`将1张『${supply.name}』加入手牌。`,tokenValue(supply,'hand'),cls===0?1:4,[supply]);
      // Enter triggers cannot summon their own next event, even with a quota.
      if(!['artifact','crystalHands','experiment','tribeEnter'].includes(eventId)&&supply.cost<=1)part('summon',`召唤1个『${supply.name}』。`,tokenValue(supply),2,[supply],['enter']);
      if(eventId==='experiment'){part('experimentWard','使其获得【守护】。',1.5,3);part('experimentDrain','使其获得【虹吸】。',3,2);part('experimentGrowth','使其+1/+2。',3,3);if(cost>=6)part('experimentStorm','使其获得【疾驰】。',3.8,2);}
      if(eventId==='tribeEnter'){part('tribeRush','使其获得【突进】。',1.5,3);part('tribeWard','使其获得【守护】。',1.2,3);part('tribeGrowth','使其+1/+1。',2,3);}
      if(cls===3){part('earth','使自己的战场上的土之印+1。',1.6,4);part('boost','使自己的所有手牌发动1次魔力增幅。',2,4);}
      if(cls===5)part('grave',`使自己的墓场+${small}。`,small*.7,4);
      if(cls===6)part('countdown','使自己的战场上的随机1张拥有【吟唱】的护符的倒计数-1。',1.7,4);
      const cap=clockEvent&&cost>=4?(permanent?3.5+cost*.65:3.8+cost*.9):(permanent?3.5+cost*.08:3.8+cost*.35);
      const eligible=pool.filter(p=>p.raw<=cap);
      const first=weighted(r,eligible.map(p=>[p,p.weight]));
      const parts=[first],room=cap-first.raw;
      if(!simple&&cost>=4&&r()<(permanent?.16:.4)){
        const extras=eligible.filter(p=>p.id!==first.id&&p.raw<=room);
        if(extras.length)parts.push(weighted(r,extras.map(p=>[p,p.weight])));
      }
      const payoff=parts.reduce((s,p)=>s+p.raw,0);
      const feedback=parts.some(p=>p.id==='supply'&&['fairy','crystalHands','experiment','artifact','tribeEnter'].includes(eventId)||p.id==='summon'&&['death','ward'].includes(eventId)||p.id==='earth'&&eventId==='earth');
      const limit=clockEvent?null:feedback||payoff>=3.5?1:weighted(r,[[null,55],[2,30],[1,15]]);
      const quota=limit===null?'':`每回合最多发动${limit}次，`;
      const enablers={experiment:{text:'将1张『沉溺的实验体』加入手牌。',raw:2,tokens:[TOKENS[25]]},fairy:{text:'将1张『妖精』加入手牌。',raw:1,tokens:[TOKENS[1]]},crystalHands:{text:'将1张『天晶魔手』加入手牌。',raw:1,tokens:[TOKENS[16]]},artifact:{text:'将1张『解析的创造物』加入手牌。',raw:1.7,tokens:[TOKENS[8]]},heal:{text:'回复自己的主战者2点生命值。',raw:1.3,tokens:[]},earth:{text:'使自己的战场上的土之印+1。',raw:1.6,tokens:[]}};
      enablers.costChanged={text:'使自己的手牌中的随机1张随从的费用+1。',raw:-.35,tokens:[]};
      const enabler=['tribeEnter','tribeAttack'].includes(eventId)?{text:`将1张『${tribeToken.name}』加入手牌。`,raw:tokenValue(tribeToken,'hand'),tokens:[tribeToken]}:enablers[eventId]||{text:'',raw:0,tokens:[]};
      const eventRate=clockEvent?1:limit===1?1.1:limit===2?1.8:['evolve','dragonEvolve','enhance'].includes(eventId)?2:3;
      const raw=Math.max(5,3+payoff*2.2*conditionFactor*eventRate);
      const tokens=[...new Map([...parts.flatMap(p=>p.tokens),...enabler.tokens].map(t=>[t.id,t])).values()];
      return {text:`${eventText}，${eventId==='hurt'?'若为自己的回合，则':''}${quota}${conditionText}${parts.map(p=>p.text).join('')}`,eventText,conditionText,payoffText:parts.map(p=>p.text).join(''),raw,tokens,enabler,eventId,conditionId,limit,effects:parts.map(p=>({id:p.id,raw:p.raw,produces:p.produces})),supportTags:[...new Set([eventId,conditionId])],engine:['crystalHands','experiment'].includes(eventId)?eventId:undefined};
    }
    function addEmblem() {
      if(card.abilities.length>=5)return;
      if(card.signature||rarity===0||cost<2||r()>[0,.1,.28,.42][rarity]*synergyWeight(['emblem'+cls])*(chaos?1.5:1))return;
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
  if(card.abilities.length>=5){
    card.corePower=card.abilities.reduce((sum,a)=>sum+a.raw,0);
    if(!card.abilities.some(a=>a.major))card.abilities.reduce((a,b)=>a.raw>=b.raw?a:b).major=true;
    return;
  }
  const capacity=budget-floor-card.spent;
  if(simpleDesign){
    const trigger=weighted(r,[['入场曲',4],['谢幕曲',cls===5?3:1]]),timing=trigger==='谢幕曲'?.65:1;
    const kinds=['damage','destroy','aoe','summon'];
    if([0,4,5].includes(cls))kinds.push('face');
    const atoms=kinds.filter(k=>effectAvailable(k,trigger)).map(k=>modularAtom(k,trigger==='谢幕曲',trigger));
    const fitting=atoms.filter(a=>a.raw<=capacity/timing);
    const strong=fitting.filter(a=>a.raw>=6+Math.max(0,cost-6)*.8);
    const main=strong.length?strong:fitting.filter(a=>a.raw===Math.max(...fitting.map(a=>a.raw)));
    if(main.length){
      const a=weighted(r,main.map(a=>[a,effectWeight(a.kind==='summon'?'tokenSummon':a.kind,3)]));
      const put=(atom,id)=>add({kind:'core',trigger,condition:'none',text:`【${trigger}】${atom.text}`,bodyText:atom.text,raw:atom.raw,price:atom.raw*timing,ids:[id,...atom.ids],components:atom.components,tokens:atom.tokens,major:true});
      put(a,'coreAnchor');
      if(card.abilities.length<5&&(a.raw<8||cost>=8&&a.raw<10)){
        const extras=['draw','heal'].filter(id=>effectAvailable(id,trigger)).map(id=>modularAtom(id,true,trigger)).filter(e=>a.raw+e.raw>=8&&e.raw*timing<=budget-floor-card.spent);
        if(extras.length)put(pick(extras),'coreSupport');
      }
    }
    if(oversized&&!used.has('守护')&&card.abilities.length<5)add(keyword('守护'));
    card.archetype=oversized?'colossalRemoval':'simpleHighCost';
    card.corePower=card.abilities.reduce((s,a)=>s+a.raw,0);
    if(card.corePower>=8&&!card.abilities.some(a=>a.major))card.abilities.reduce((a,b)=>a.raw>=b.raw?a:b).major=true;
    return;
  }
  const autoEvolution=used.has('selfEvolve')||used.has('selfSuperEvolve');
  const mainTrigger=oversized||autoEvolution?'入场曲':weighted(r,['入场曲','进化时','超进化时','谢幕曲'].map(t=>[t,triggerWeight(t)]));
  const mainTiming=['进化时','超进化时'].includes(mainTrigger)?evolutionTiming(mainTrigger):mainTrigger==='谢幕曲'?.65:1;
  const main=oversized&&capacity>=7&&!used.has('destroy')?modularAtom('destroy',false):pickAtom(Math.min(capacity/mainTiming,Math.max(5.5,capacity*.72/mainTiming)),['draw','heal','tutor','pp','boost'],mainTrigger==='谢幕曲',5.5,mainTrigger)||pickAtom(capacity/mainTiming,[],mainTrigger==='谢幕曲',0,mainTrigger);
  const put=(id,a,trigger,price)=>add({kind:'core',trigger,condition:'none',text:`【${trigger}】${a.text}`,bodyText:a.text,price,raw:a.raw,ids:[id,...a.ids],components:a.components,tokens:a.tokens,major:true});
  if(main)put('coreAnchor',main,mainTrigger,main.raw*mainTiming);
  if(oversized&&!used.has('守护')&&card.abilities.length<5)add(keyword('守护'));
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
  if(cls===3&&cost>=8&&!used.has('handDiscount')&&!used.has('spellboostDiscount')&&card.abilities.length<5&&budget-floor-card.spent>=5&&r()<.3)add({kind:'static',trigger:'魔力增幅时',condition:'none',text:'【魔力增幅时】使本卡牌的费用-1。',price:5,raw:9,ids:['costReduction']});
  card.archetype=oversized?'colossalRemoval':'modularCore';
  card.corePower=card.abilities.reduce((s,a)=>s+a.raw,0);
  if(card.corePower>=8&&!card.abilities.some(a=>a.major))card.abilities.reduce((a,b)=>a.raw>=b.raw?a:b).major=true;
}
    function addCrystalHandLink() {
      if(cls!==3||card.signature||vanilla||rarity===0||cost<3||card.abilities.length>3||r()>.28)return;
      const links=[
        {trigger:'自己的『天晶魔手』进入战场时',text:'自己的『天晶魔手』进入战场时，回复自己的主战者1点生命值。',raw:2.5},
        {trigger:'自己的『天晶魔手』攻击时',text:'自己的『天晶魔手』攻击时，使其+1/+0。',raw:3}
      ];
      if(cost>=7&&!used.has('costReduction')&&!used.has('handDiscount'))links.push({trigger:'在手牌中发动',text:'在手牌中发动。自己的『天晶魔手』进入战场时，使本卡牌的费用-1。',raw:4,discount:true});
      const link=pick(links),count=weighted(r,[[1,2],[2,4],[3,cost>=6?3:1]]),summon=r()<.65;
      const id=summon?'crystalHandSummon':'crystalHandSupply',price=tokenValue(TOKENS[16],summon?'summon':'hand')*count;
      if(used.has(id)||price+link.raw>budget-floor-card.spent)return;
      const text=summon?`召唤${count}个『天晶魔手』。`:`将${count}张『天晶魔手』加入手牌。`;
      add({kind:'effect',trigger:'入场曲',condition:'none',text:'【入场曲】'+text,bodyText:text,raw:price,price,boardValue:summon?price:0,ids:[id],tokens:[TOKENS[16]]});
      add({kind:'static',trigger:link.trigger,condition:'none',text:link.text,bodyText:link.text,raw:link.raw,price:link.raw,ids:['crystalHandLink',...(link.discount?['crystalHandCostReduction']:[])],tokens:[TOKENS[16]]});
    }
    function tradeBodyForPower() {
      if(card.sacrificeDesign)return;
      if(floor<4||card.discardSummonTrade||card.bodyTrade||used.has('疾驰'))return;
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
    function addSacrificeDesign(){
      if(cost<2||cost>9||oversized||vanilla||card.abilities.some(a=>a.kind!=='keyword')||used.has('疾驰'))return false;
      const sr=rng(hash(seed+'|sacrifice-design'));
      if(sr()>[.025,.04,.065,.085][rarity]*(chaos?1.35:1)*(cost===2?.25:1))return false;
      const discard=cost>=5&&rarity>=2&&sr()<.5;
      if(discard){
        // Empty-hand play still resolves: credit only a modest expected loss,
        // never pretend nine discarded cards are guaranteed to be paid.
        const credit=Math.min(5,1.2+cost*.4),room=budget-floor-card.spent;
        const limit=Math.min(36,room+credit),minimum=Math.max(12,Math.min(limit*.8,cost*2.6));
        const allowed=['aoe','face','draw','tokenSummon','restoreSEP','artifactCopy','reanimate'];
        let payoff=makeEffect(limit,'入场曲','discardAll',minimum,true,Math.min(10,cost+2),false,{maxAtoms:3},sr()<.5?['draw']:allowed);
        if(!payoff)return false;
        const price=Math.max(.4,payoff.raw-credit);if(price>room)return false;
        const text='舍弃自己的所有手牌。'+payoff.text;
        add({...payoff,kind:'sacrificePayoff',trigger:'入场曲',condition:'discardAll',orderedEffects:true,text:'【入场曲】'+text,bodyText:text,price,ids:['discardAllCost',...payoff.ids],components:[{id:'discardAllCost',text:'舍弃自己的所有手牌。',raw:-credit},...(payoff.components||[{id:payoff.ids[0],text:payoff.text,raw:payoff.raw}])],major:true});
        card.discardAllTrade={credit,payoffRaw:payoff.raw,price};
      }else{
        const target=cost<=3?2:cost<=6?4:6,loss=floor-target;if(loss<2)return false;
        const trigger=cost>=4&&sr()<.28?'超进化时':'进化时',timing=trigger==='进化时'?.38:.25;
        const limit=Math.min(28,(budget-target-card.spent)/timing,loss*2+cost*1.5+5),minimum=Math.max(8,loss*1.2+4);
        const gains=growth(Math.min(10,loss+3),'sacrificed-evolution'),raw=gains[0]+gains[1];
        const growthPayoff={text:`本随从+${gains[0]}/+${gains[1]}。`,raw,ids:['buff'],tokens:[]};
        // Self-copy is valued against the current body. It cannot finance a
        // trade that will immediately shrink the copied body after valuation.
        const modular=()=>withBlocked(['selfCopy'],()=>makeEffect(limit,trigger,'none',minimum,true,Math.min(10,cost+Math.ceil(loss/2)),false,{maxAtoms:rarity===0?1:3}));
        const payoff=sr()<.5&&raw>=minimum&&raw<=limit?growthPayoff:modular()||(raw>=minimum&&raw<=limit?growthPayoff:null);
        if(!payoff)return false;
        const paidValue=payoff.raw*timing,baseAllowance=budget-floor-card.spent;
        // Losing printed stats is immediate; compare against timing-adjusted
        // payoff value, not the inflated raw number of an evolution effect.
        // A high-cost card must not sacrifice its body for an ordinary effect
        // that already fits the full-body allowance. Fall back to its normal core.
        if(paidValue<loss||cost>=6&&paidValue<=baseAllowance)return false;
        floor=target;card.bodyAllowance=floor;
        add({...payoff,kind:'evolutionSacrifice',trigger,condition:'none',text:`【${trigger}】`+payoff.text,bodyText:payoff.text,price:payoff.raw*timing,ids:['evolutionSacrifice',...payoff.ids],major:true});
        card.evolutionBodyTrade={lost:loss,target,trigger,payoffRaw:payoff.raw,timing,paidValue,baseAllowance};
      }
      card.sacrificeDesign=discard?'discardAll':'evolution';
      // Stop optional additions from spending the rest on unrelated payoffs.
      // Preserve the original maximum budget for auditing this reduced design.
      budget=floor+card.spent;
      return true;
    }
    function addSpecialMechanic() {
      if(card.fusion||card.signature||vanilla||rarity===0||card.abilities.length>=4)return;
      const remaining=budget-floor-card.spent;
      if(cost>=3&&remaining>=3.5&&r()<(chaos?.3:.13)) {
        const material=cls===2?'财宝·卡牌':cls===3?'法术':cls===6?'护符':cls===7?'创造物·卡牌':'随从';
        const scaled=r()<.55;
        const threshold=scaled?1:weighted(r,[[1,6],[2,3],[3,cost>=6?2:1]]),factor=.65,credit=threshold*.7;
        const limit=Math.min(24,(remaining+credit)/factor);
        let payload=null,spec=null,prefix='';
        if(scaled){
          // Reuse numeric effect atoms, token valuations and class restrictions.
          // The cap prices the strongest result; X counts cards, not fusion actions.
          const scalable=['damage','draw','buff','heal','tokenHand','tokenSummon','boost','earth','grave','crystalHandSupply','crystalHandSummon','experimentSupply','experimentSummon'];
          const choices=[];
          for(const e of effects.filter(e=>scalable.includes(e.id)&&effectAvailable(e.id,'入场曲')&&(!e.exclusive||e.classes.includes(cls)))){
            const ts=e.id.startsWith('token')?[token]:e.id.startsWith('crystalHand')?[TOKENS[16]]:e.id.startsWith('experiment')?[TOKENS[25]]:[];
            const handOffer=e.id==='tokenHand'?handDelivery(token):null;
            if(e.id==='tokenHand'&&!handOffer)continue;
            const unit=handOffer?handOffer.unitPrice:ts.length?tokenValue(ts[0],e.id.endsWith('Summon')?'summon':'hand'):e.price;
            const capLimit=['damage','heal'].includes(e.id)?Math.min(10,cost+2):e.id==='buff'?Math.min(5,Math.ceil(cost/2)):Math.min(e.max,cost>=6?3:2);
            const cap=Math.min(capLimit,Math.floor(limit/unit));if(cap<2)continue;
            const multiplier=['damage','heal','buff'].includes(e.id)&&cap>=4&&r()<.45?2:1;
            const atomText=handOffer?handOffer.text('X'):e.id==='damage'?'对对手的战场上的随机1个随从造成X点伤害。':e.text('X').replace('$TOKEN',token.name);
            const raw=unit*cap;
            choices.push([{ids:[e.id],raw,boardValue:['buff','tokenSummon','fusionArtifactSummon','crystalHandSummon','experimentSummon'].includes(e.id)?raw:0,tokens:ts,text:atomText,cap,multiplier},effectWeight(e.id,e.weight)*synergyWeight([e.id],ts)]);
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
            const other=withBlocked(payload.ids,()=>makeEffect(limit-payload.raw,'入场曲','fusion',1.3,true,cost,targeted(payload.text)));
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
      const triggerReserve=card.abilities.some(a=>a.trigger&&a.kind!=='alternate')?0:.65;
      if(flexibility+triggerReserve>remaining+1e-8)return;
      if(crystallize) {
        // The amulet summons the follower: it does not play it or trigger Fanfare.
        form.countdown=Math.max(2,cost-fee-1);
        form.text=`【吟唱 ${form.countdown}】\n【谢幕曲】召唤1个『${name}』。`;
      }
      card.alternateForms.push(form);
      add({kind:'alternate',trigger:kind,condition:'alternate',text:`【${kind} ${fee}】以${form.type}形态使用，能力见下方。`,bodyText:'',raw:flexibility,price:flexibility,ids:[crystallize?'crystallize':'accelerate'],tokens:form.tokens||[],emblemIds:form.emblemIds||[]});
    }
    function unlockGate(id,trigger,effectiveCost=cost){
      const superUnlock=id==='superUnlocked';
      // These are turn gates, not remaining EP/SEP or evolution-history tests.
      // Deliberate evolution already implies its own unlock; effect evolution
      // (本随从进化时) does not. Expensive plays get no automatic timing rebate.
      if(trigger==='超进化时'||!superUnlock&&trigger==='进化时')return null;
      const delay=(superUnlock?6:4)-effectiveCost;
      if(delay<=0)return null;
      const repeats=card.abilities.filter(a=>a.condition===id||a.acquisitionDiscount?.condition===id||id==='evolutionUnlocked'&&(a.condition==='superUnlocked'||a.acquisitionDiscount?.condition==='superUnlocked')).length;
      const base=Math.max(.5,1-delay*.11);
      return {id,text:`若为${superUnlock?'超进化':'进化'}已解禁的回合，则`,factor:1-(1-base)/(1+repeats),extra:0,minRaw:2};
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
      const healthRoll=rng(hash(seed+'|leader-health-compare|'+trigger+'|'+card.abilities.length));
      if([4,5].includes(cls)&&healthRoll()<.13){
        const ahead=healthRoll()<.5,id=ahead?'leaderHealthAhead':'leaderHealthBehind';
        const repeats=card.abilities.filter(a=>a.condition===id).length,base=ahead?.7:.6;
        return {id,text:`若自己的主战者的生命值${ahead?'大于':'小于'}对手的主战者的生命值，则`,factor:1-(1-base)/(1+repeats),extra:0,minRaw:2.5,effectBoost:cost<=2?1:0};
      }
      const boardRoll=rng(hash(seed+'|evolution-board|'+trigger+'|'+card.abilities.length));
      if(boardRoll()<(cost<=2?.16:.055)){
        const superBoard=boardRoll()<.45,id=superBoard?'superEvolvedBoard':'evolvedBoard';
        // A follower must rely on another body, even if a Fanfare is replayed
        // after evolving. Thus its own evolution never makes the gate free.
        const other=type==='follower'&&trigger!=='谢幕曲'?'其他':'';
        const base=superBoard?(cost<=2?.42:cost<=5?.58:.74):(cost<=2?.62:cost<=5?.75:.87);
        const repeats=card.abilities.filter(a=>a.condition===id||!superBoard&&a.condition==='superEvolvedBoard').length;
        return {id,text:`若自己的战场上有${other}${superBoard?'超进化':'进化'}后的随从，则`,factor:1-(1-base)/(1+repeats),extra:0,minRaw:superBoard?3.5:2.5,effectBoost:cost<=2?(superBoard?2:1):0};
      }
      const unlockRoll=rng(hash(seed+'|unlock-gate|'+trigger+'|'+card.abilities.length));
      if(unlockRoll()<[.045,.075,.09,.12][rarity]){
        const choices=[['superUnlocked',4],['evolutionUnlocked',1]].map(([id,w])=>[unlockGate(id,trigger),w]).filter(([g])=>g);
        if(choices.length)return weighted(unlockRoll,choices);
      }
      const gaugeRoll=rng(hash(seed+'|gauge|'+trigger+'|'+card.abilities.length));
      if(rarity>=1&&['入场曲','法术'].includes(trigger)&&gaugeRoll()<.1){
        const liberated=gaugeRoll()<.4;
        const id=liberated?'liberatedArt':'secretArt',repeats=card.abilities.filter(a=>a.condition===id).length;
        return {id,text:liberated?'【解放奥义】':'【奥义】',requirement:liberated?15:10,factor:1-(1-(liberated?.55:.72))/(1+repeats),extra:0,minRaw:liberated?5:3,difficult:true,effectBoost:liberated?3:1};
      }
      if(r()>(cost<=2?[.34,.48,.60,.70]:[.2,.33,.45,.55])[rarity])return {id:'none',text:'',factor:1,extra:0};
      const fallback=[0,7].includes(cls)?{id:'singleton',text:'若自己的牌组中没有重复随从，则',factor:.38,extra:3,minRaw:6,effectBoost:2,difficult:true}:{id:'none',text:'',factor:1};
      const lowHealth=()=>{const threshold=pick([10,12]);return {id:'lowHealth',text:`若自己的主战者的生命值为${threshold}或以下，则`,threshold,factor:threshold===10?.32:.42,extra:threshold===10?3:2,minRaw:threshold===10?7:5.5,effectBoost:threshold===10?2:1,difficult:true};};
      const discard=()=>{const amount=weighted(r,[[1,8],[2,cost>=4?2:0]]),manual=trigger==='入场曲',credit=amount*(manual?.7:.9);return {id:'discard',text:manual?`选择自己的${amount}张手牌，将其舍弃。`:`随机舍弃自己的${amount}张手牌。`,factor:1,amount,difficult:false,extra:credit,minRaw:2+credit,effectBoost:0};};
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
      if(cls===3&&rng(hash(seed+'|experiment-gate|'+trigger+'|'+card.abilities.length))()<(used.has('experimentSummon')||used.has('experimentSupply')?.3:.12))special[3]={id:'experimentHistory',text:'若本次对战中进入战场的自己的『沉溺的实验体』的张数为5张或以上，则',requirement:5,factor:.65,extra:0,minRaw:3};
      if(cls===3&&r()<(used.has('handCostUp')?.38:.2))special[3]={id:'costChanged',text:`若本卡牌的费用不为${cost}，则`,factor:.65,extra:1,minRaw:2};
      let selected={extra:0,...(special[cls]&&r()<.84?special[cls]:fallback)};
      const thresholdRoll=rng(hash(seed+'|cost-archetype|'+trigger+'|'+card.abilities.length));
      if([6,7].includes(cls)&&thresholdRoll()<.35){
        const threshold=cls===7?5:6,subject=cls===7?'随从':'卡牌';
        // A played permanent already on the board can itself satisfy this check.
        const selfSatisfies=cost>=threshold&&(cls===6?type!=='spell':type==='follower')&&['入场曲','进化时','超进化时','攻击时','交战时','启动','爆能强化'].includes(trigger);
        selected=selfSatisfies?{id:'none',text:'',factor:1,extra:0}:{id:cls===7?'portalHighCost':'havenHighCost',text:`若自己的战场上有原始费用为${threshold}或以上的${subject}，则`,factor:.72,extra:0,minRaw:2};
      }

      // Match-wide evolution history is a reusable gate, not a fixed card package.
      if(rarity>=1&&rng(hash(seed+'|evolution-history|'+trigger+'|'+card.abilities.length))()<.13){
        const n=weighted(r,[[3,4],[5,4],[7,cost>=5?2:1]]);
        selected={id:'evolutionHistory',text:`若本次对战中自己的随从的进化次数为${n}次或以上，则`,requirement:n,factor:n===3?.75:n===5?.6:.48,extra:0,minRaw:n===3?2:n===5?4:6};
      }
      // Self-damage buys a modest, capped amount of extra payoff. It is paid
      // once on deliberate play/evolution, not multiplied by a passive loop.
      if(cls===5&&['入场曲','法术','进化时','超进化时'].includes(trigger)&&!card.abilities.some(a=>a.condition==='selfDamage')){
        const painRoll=rng(hash(seed+'|self-damage|'+trigger+'|'+card.abilities.length));
        if(painRoll()<.38){
          const amount=weighted(painRoll,[[1,4],[2,5],[3,cost>=4?2:0]]),credit=amount*.8;
          selected={id:'selfDamage',text:`对自己的主战者造成${amount}点伤害。然后，`,amount,factor:1,extra:credit,minRaw:credit+1.4,difficult:true};
        }
      }
      // Last Words and generic board events can resolve during either player's
      // turn. Only explicitly own-turn timings may spend a combo condition.
      const ownTurn=['入场曲','法术','进化时','超进化时','攻击时','启动','自己的回合开始时','自己的回合结束时'];
      if(selected.id==='combo'&&!ownTurn.includes(trigger))return {id:'none',text:'',factor:1,extra:0};
      // Meeting a persistent condition once enables every matching clause;
      // unlike paid soil/graves/discards, it is not another resource payment.
      if(['experimentHistory','portalHighCost','havenHighCost','evolutionHistory','singleton','lowHealth','overflow','board','rally','spells','costChanged','forestHistory','amulet','amuletHistory','wardBoard','artifact','artifactKinds','ppFull','combo'].includes(selected.id)){
        const repeats=card.abilities.filter(a=>a.condition===selected.id).length;
        selected.factor=1-(1-selected.factor)/(1+repeats);
        selected.extra/=1+repeats;
      }
      return selected;
    }
    function makeEffect(maxPrice,trigger,condition,minRaw=0,allowResourceSupport=true,effectCost=cost,blockTarget=false,complexity=null,allowedIds=null) {
      alignTribeToken();
      const handOffer=handDelivery(token);
      const extendable=card.emblems.find(e=>e.owner!=='opponent'&&e.duration!=null&&e.eventId!=='lastWords');
      const resourceIds=['recoverFollower','artifactRecover','draw','handCycle','handRefill','handCycleTutor','handRefresh','keywordSearch','typeSearch','tribeSupply','wardSearch','amuletSearch','activeAmuletSearch','bloodDraw','opponentHandCopy','opponentDeckCopy','opponentCopyTransform'];
      const repeating=!['入场曲','进化时','超进化时','谢幕曲','爆能强化','法术','启动'].includes(trigger);
      const isAutomatic=!canChooseTarget(trigger);
      const additionalTarget=!isAutomatic&&(blockTarget||phaseHasTarget(trigger));
      const evolutionCost=trigger==='爆能强化'?effectCost:cost;
      const noGate=condition==='none'||condition==='discard';
      const cheapBase=effectCost<=3&&noGate&&['入场曲','谢幕曲','法术'].includes(trigger);
      const advantageIds=['recoverFollower','artifactRecover','handCycle','handCycleTutor','coinSupply','draw','handRefill','keywordSearch','typeSearch','wardSearch','amuletSearch','activeAmuletSearch','tutor','bloodDraw','opponentHandCopy','opponentDeckCopy'];
      // Count granted emblems as part of the card's resource package, too.
      const hasAdvantage=cheapBase&&card.abilities.some(a=>(a.condition==='none'||a.condition==='discard')&&['入场曲','谢幕曲','法术'].includes(a.trigger)&&(
        a.ids.some(id=>advantageIds.includes(id))||a.emblemIds?.some(id=>card.emblems.find(e=>e.id===id)?.effects.some(e=>['draw','tutor','supply'].includes(e.id)))
      ));
      const pool=effects.filter(e=>(!allowedIds||allowedIds.includes(e.id))&&effectAvailable(e.id,trigger)&&(!e.types||e.types.includes(type))&&(!e.exclusive||e.classes.includes(cls))&&
        !(e.id==='amuletReviveHighest'&&(effectCost<5||repeating||type==='amulet'&&trigger==='谢幕曲'))&&
        !(e.id==='mixedStats'&&(effectCost<2||rarity===0))&&
        !(e.id==='enemySupply'&&(!card.enemyEntry||repeating||trigger==='谢幕曲'))&&
        !(condition==='leaderHealthAhead'&&e.id==='highestLeaderDamage')&&
        !(condition==='leaderHealthBehind'&&e.id==='lowestLeaderDamage')&&
        !(e.id==='tokenHand'&&!handOffer)&&!(e.id==='commonSupply'&&!commonSupply)&&
        !(['transformAlly','transformEnemy','transformEither'].includes(e.id)&&(effectCost<3||rarity<1||repeating))&&
        !(e.id==='transformEither'&&isAutomatic)&&
        !(['handTransform','truthTransform'].includes(e.id)&&(effectCost<6||rarity<2||repeating))&&
        !(e.id==='clearEmblems'&&card.emblems.length>0)&&
        !(e.id==='clearAmulets'&&(type==='amulet'||used.has('amuletRecruit')||used.has('activeAmuletRecruit')||used.has('flagSummon')))&&
        !(e.id==='emblemExtend'&&(!extendable||repeating||rarity<2))&&
        !(['clearEmblems','clearAmulets'].includes(e.id)&&(effectCost<(e.id==='clearEmblems'?8:6)||rarity<2||repeating))&&
        !(e.id==='leaderVulnerability'&&(effectCost<8||rarity<2||repeating))&&
        !(e.id==='setHealth'&&(effectCost<2||repeating))&&
        !(e.id==='silence'&&effectCost<2)&&
        !(e.id==='deckDiscount'&&(effectCost<8||rarity<2||!['入场曲','法术','爆能强化'].includes(trigger)))&&
        !(e.id==='chargeGauge'&&(!['入场曲','法术','进化时','超进化时'].includes(trigger)||rarity===0))&&
        !(e.id==='flagAdvance'&&!used.has('flagSummon'))&&
        !(e.id==='flagSummon'&&(effectCost<2||repeating))&&
        !(e.id==='coinSupply'&&hasAdvantage)&&
        !(hasAdvantage&&advantageIds.includes(e.id))&&
        (!complexity?.simple||['recoverFollower','artifactRecover','restoreEP','commonSupply','coreSupply','corePair','fusionArtifactHand','fusionArtifactSummon','attackLock','statDebuff','massDebuff','treasureSupply','coinSupply','flagSummon','experimentSupply','experimentSummon','experimentBuff','experimentGrant','draw','damage','heal','allyBuff','face','aoe','destroy','banish','smallDestroy','teamBuff','bounce','enemyBounce','boost','earth','ramp','grave','amulet','tokenHand','tokenSummon','handBuff','allBoardDamage','splitDamage','grantRush','grantWard','grantBarrier'].includes(e.id))&&
        !(complexity?.simple&&e.id.startsWith('token')&&token.custom)&&
        !(trigger.includes('受到伤害')&&['allyPing','allBoardDamage'].includes(e.id))&&
        !(['restoreEP','restoreSEP'].includes(e.id)&&(!['入场曲','法术','爆能强化'].includes(trigger)||effectCost<(e.id==='restoreEP'?3:7)||(e.id==='restoreSEP'&&rarity<2)))&&
        !(e.id==='pp'&&(effectCost<3||!['入场曲','进化时','超进化时','法术','爆能强化'].includes(trigger)))&&
        !(e.id==='handRefresh'&&effectCost<3)&&
        !(e.id.startsWith('tribe')&&!tribal)&&
        !(e.id==='tribeEvolve'&&(effectCost<3||trigger.includes('随从进化时')))&&
        !(type!=='follower'&&e.id==='buff')&&
        !(['selfEvolve','selfSuperEvolve'].includes(e.id)&&(!['入场曲','爆能强化','自己的回合结束时'].includes(trigger)||evolutionCost<(trigger==='爆能强化'?4:2)||(noGate&&cost<5)))&&
        !(['selfEvolve','selfSuperEvolve'].includes(e.id)&&noGate&&!unconditionalSelfEvolution)&&
        !(['selfEvolve','selfSuperEvolve'].includes(e.id)&&condition==='selfDamage'&&cost<4)&&
        !(['selfEvolve','selfSuperEvolve'].includes(e.id)&&(used.has('selfEvolve')||used.has('selfSuperEvolve')))&&
        !(['selfEvolve','selfSuperEvolve'].includes(e.id)&&card.abilities.some(a=>['进化时','超进化时'].includes(a.trigger)))&&
        !(e.id==='selfSuperEvolve'&&(evolutionCost<7||rarity<3))&&
        !(e.id==='allyEvolve'&&(effectCost<3||trigger==='本随从进化时'||trigger.includes('随从进化时')))&&
        !(e.id==='teamEvolve'&&(effectCost<7||rarity<2||!['入场曲','法术','爆能强化','启动'].includes(trigger)))&&
        !(e.id==='boardWipe'&&card.abilities.some(a=>(a.trigger===trigger||(trigger==='爆能强化'&&['法术','入场曲'].includes(a.trigger)))&&a.ids.some(id=>['tokenSummon','fusionArtifactSummon','crystalHandSummon','experimentSummon','reanimate','recruit','artifactCopy','allyBuff','teamBuff','wardBuff','artifactBuff','crystalHandBuff','grantRush','grantWard','grantBarrier'].includes(id))))&&
        !(e.id==='selfCopy'&&(repeating||card.signature||cost<2))&&
        !(trigger.includes('进入战场时')&&['tokenSummon','fusionArtifactSummon','crystalHandSummon','experimentSummon','reanimate'].includes(e.id))&&
        (allowResourceSupport||!resourceIds.includes(e.id))&&
        !(condition==='earth'&&e.id==='earth')&&!(condition==='necromancy'&&e.id==='grave')&&
        !(condition==='selfDamage'&&['heal','bloodDraw'].includes(e.id))&&
        !(trigger==='本卡牌被舍弃时'&&['buff','handCycle','handRefill','handCycleTutor','handRefresh','selfCopy'].includes(e.id))&&
        !(trigger==='入场曲'&&condition==='none'&&e.id==='buff')&&
        !(trigger==='谢幕曲'&&['buff','allyBuff','teamBuff','bounce'].includes(e.id))&&
        !(repeating&&['ramp','artifactCopy','amuletRecruit','activeAmuletRecruit','amuletRevive'].includes(e.id))&&
        !(condition==='ppFull'&&e.id==='ramp')&&
        !(effectCost<4&&['artifactCopy','amuletRecruit','activeAmuletRecruit','amuletRevive'].includes(e.id)&&!['进化时','超进化时'].includes(trigger))&&
        !(effectCost<4&&['destroy','banish','reanimate'].includes(e.id)&&condition!=='necromancy'&&!['进化时','超进化时'].includes(trigger))&&
        !(e.id==='ramp'&&(effectCost<3||(cost<3&&trigger!=='爆能强化'))));
      const options=[];
      for(const e of pool) {
        if(e.id==='handCostUp'){
          // A drawback buys a real payoff; it is never offered alone as a reward.
          if(complexity&&complexity.maxAtoms<2)continue;
          const linked=condition==='costChanged'||used.has('costChangedLink')||used.has('handDiscount')||card.emblems.some(e=>e.supportTags.includes('costChanged'));
          const credit=linked?.35:repeating?.45:isAutomatic?1:.8;
          const payment=isAutomatic?'使自己的手牌中的随机1张随从的费用+1。':e.text(1);
          const choices=[],cap=maxPrice+credit,minimum=Math.max(minRaw+credit,credit+1.3);
          if(!used.has('handBuff')){
            const amount=Math.min(3,Math.max(1,Math.ceil(effectCost/3)),Math.floor(cap/1.3)),value=amount*1.3;
            if(value>=minimum)choices.push({ids:['handBuff'],text:payment.replace('费用+1。','费用+1，使其+'+amount+'/+'+amount+'。'),raw:value,boardValue:0,tokens:[],sameCard:true});
          }
          const payoff=withBlocked(['handCostUp'],()=>makeEffect(cap,trigger,condition,minimum,allowResourceSupport,effectCost,blockTarget,complexity?{...complexity,maxAtoms:complexity.maxAtoms-1}:null));
          if(payoff)choices.push(payoff);
          if(!choices.length)continue;
          const reward=choices[Math.floor(r()*choices.length)];
          const candidate={...reward,ids:['handCostUp',...reward.ids],text:reward.sameCard?reward.text:payment+reward.text,raw:reward.raw-credit,
            drawback:{id:'handCostUp',credit,payoffRaw:reward.raw,linked},
            components:[{id:'handCostUp',text:payment,raw:-credit},...(reward.components||[{id:reward.ids[0],text:reward.text,raw:reward.raw}])]};
          options.push([candidate,(additionalTarget&&targeted(candidate.text)?EXTRA_TARGET_WEIGHT:1)*effectWeight(e.id,e.weight)*synergyWeight(candidate.ids,candidate.tokens,trigger)*interactionWeight(card.abilities,{...candidate,trigger})]);
          continue;
        }
        let price=e.price,tokens=[];
        if(e.id==='enemySupply'){
          tokens=[TOKENS.find(t=>t.id===90021110)];
          // Opposing bodies are a drawback, but the supplied entry triggers
          // are real extra payoffs. Neither side is free or counted as our army.
          price=Math.max(.6,card.enemyEntry.raw-tokenValue(tokens[0])*.5);
        }
        if(e.id==='emblemExtend')price=Math.max(3,extendable.effects.reduce((s,e)=>s+e.raw,0)*1.4);
        if(e.id==='draw')price=drawValue(effectCost,1);
        const search=searchIds.has(e.id);
        if(search)price=searchValue(e.id,1);
        if(e.id==='selfCopy')price=floor*.85+3+card.abilities.filter(a=>a.kind==='static'||a.trigger==='自己的回合结束时').reduce((s,a)=>s+a.raw,0)*.35+card.abilities.filter(a=>a.ids.includes('疾驰')).reduce((s,a)=>s+a.price,0);
        if(e.id.startsWith('token')) {
          tokens=[token];
          price=e.id==='tokenHand'?handOffer.unitPrice:tokenValue(token,'summon');
        }
        if(['transformAlly','transformEnemy','transformEither'].includes(e.id)){
          const t=e.id==='transformEnemy'?enemyTransformToken:transformToken;
          tokens=[{...t,transformationOnly:true}];
          price=e.id==='transformEnemy'?5.5:Math.max(2.5,tokenValue(t)-1.3)+(e.id==='transformEither'?.8:0);
        }
        if(e.id==='handTransform')tokens=[SUPPORT_CARDS[8]];
        if(e.id==='truthTransform')tokens=[SUPPORT_CARDS[9]];
        if(e.id==='coreSupply')tokens=[core];
        if(e.id==='commonSupply'){tokens=[commonSupply];price=tokenValue(commonSupply,'hand');}
        if(e.id==='corePair')tokens=SUPPORT_CARDS.slice(6,8);
        if(['fusionArtifactHand','fusionArtifactSummon'].includes(e.id)){tokens=[fusionArtifact];price=tokenValue(fusionArtifact,e.id==='fusionArtifactHand'?'hand':'summon');}
        if(e.id==='artifact'){tokens=[artifactToken];price=tokenValue(artifactToken,'hand');}
        if(e.id==='treasureSupply')tokens=[treasure];
        if(e.id==='coinSupply')tokens=[SUPPORT_CARDS[4]];
        if(['flagSummon','flagAdvance'].includes(e.id))tokens=[SUPPORT_CARDS[5]];
        if(e.id==='tribeSupply'){tokens=[tribeToken];price=tokenValue(tribeToken,'hand');}
        if(e.id.startsWith('crystalHand'))tokens=[TOKENS[16]];
        if(e.id.startsWith('experiment'))tokens=[TOKENS[25]];
        if(e.id==='experimentGrant')price=experimentKeyword==='守护'?1.5:experimentKeyword==='虹吸'?3:4;
        // A one-PP immediate summon cannot add a full second body for free.
        // Price the token together with the delivery card, not as an isolated atom.
        const cheapSummon=cost===1&&effectCost===1&&condition==='none'&&['tokenSummon','fusionArtifactSummon','crystalHandSummon','experimentSummon'].includes(e.id);
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
        // Cheap immediate board development has a tempo premium beyond the
        // normal linear token value. Delayed/evolution rewards keep their timing
        // valuation; gated rewards pay this raw price before their condition rebate.
        const summonTempo=effectCost>=2&&effectCost<=3&&['入场曲','法术'].includes(trigger)&&
          ['tokenSummon','fusionArtifactSummon','crystalHandSummon','experimentSummon'].includes(e.id);
        const previousBoard=summonTempo?card.abilities.filter(a=>phase(a.trigger)===phase(trigger)).reduce((sum,a)=>sum+(a.summonBoard?.stats||0),0):0;
        const tokenStats=summonTempo?tokens[0].attack+tokens[0].health:0;
        const summonPremium=n=>summonTempo?.9*(Math.max(0,previousBoard+n*tokenStats-2*effectCost)-Math.max(0,previousBoard-2*effectCost)):0;
        const summonCost=n=>price*n+summonPremium(n);
        const cycleValue=n=>Math.max(.8,drawValue(effectCost,n+(e.id==='handRefill'?1:0))-(e.id==='handRefill'&&effectCost<=2?2.8:.8*(e.id==='handCycle'?n:1)));
        const handCycle=['handCycle','handRefill'].includes(e.id);
        if(handCycle)price=cycleValue(1);
        const overhead=0;
        if(price+overhead>maxPrice)continue;
        const evolved=trigger==='进化时'||trigger==='超进化时';
        const buffCap=trigger==='爆能强化'?Math.floor(effectCost/2)+1:Math.ceil(effectCost/3)+(evolved?1:0);
        const numericCaps={coreSupply:effectCost<=3?1:2,fusionArtifactHand:effectCost<=3?1:2,fusionArtifactSummon:effectCost<=3?1:effectCost<=6?2:3,experimentSupply:effectCost<=3?1:effectCost<=6?2:3,experimentSummon:effectCost<=3?1:effectCost<=6?2:3,experimentBuff:buffCap,coinSupply:effectCost<=3?1:2,treasureSupply:effectCost<=3?1:2,flagSummon:effectCost<6?1:2,statDebuff:Math.max(1,Math.ceil(effectCost/2))+(evolved?1:0),massDebuff:Math.max(1,Math.floor(effectCost/3))+(evolved?1:0),damage:type==='follower'?effectCost+1+(evolved?1:0)+(condition!=='none'?1:0):2*effectCost+1,splitDamage:effectCost*2+2,selfCopy:effectCost>=6?2:1,missingHealthDamage:effectCost+2,artifactCopy:effectCost>=7?2:1,amuletRecruit:effectCost>=7?2:1,face:Math.max(1,Math.ceil(effectCost/2))+(evolved?1:0),aoe:Math.max(1,Math.ceil(effectCost/2))+(evolved?1:0),heal:effectCost+2+(evolved?1:0),buff:buffCap,allyBuff:buffCap};
        const maximum=e.id==='draw'&&condition==='discardAll'?Math.min(8,effectCost):e.id==='tokenSummon'&&cls===2?Math.min(4,Math.max(1,Math.floor(effectCost/2))):type!=='follower'&&e.id==='tokenSummon'?Math.min(5,Math.floor(effectCost/2)+1):e.max;
        let max=Math.min(maximum,numericCaps[e.id]||Infinity,Math.floor((maxPrice-overhead)/price));
        if(e.id==='commonSupply')max=Math.min(max,effectCost<=3?1:2);
        if(['recoverFollower','artifactRecover'].includes(e.id)){max=Math.min(max,repeating||effectCost<=3?1:2);while(max>0&&price*max+.6*max*(max-1)>maxPrice)max--;}
        if(e.id==='pp')max=Math.min(max,effectCost>=8?3:effectCost>=5?2:1);
        if(e.id==='mixedStats')max=Math.min(max,Math.max(1,Math.ceil(effectCost/2)));
        if(e.id==='enemySupply')max=Math.min(max,effectCost>=6?2:1);
        if(summonTempo)while(max>0&&summonCost(max)>maxPrice)max--;
        if(['highestLeaderDamage','lowestLeaderDamage'].includes(e.id))max=Math.min(max,Math.min(5,effectCost+1));
        if(handCycle){max=Math.min(max,2);while(max>0&&cycleValue(max)>maxPrice)max--;}
        if(e.id==='draw')while(max>0&&drawValue(effectCost,max)>maxPrice)max--;
        if(search){
          const already=card.abilities.filter(a=>phase(a.trigger)===phase(trigger)).reduce((s,a)=>s+searchCount(a.text),0);
          max=Math.min(max,searchCap(trigger,effectCost)-already);
          while(max>0&&searchValue(e.id,max)>maxPrice)max--;
        }
        if(copyIds.has(e.id)){
          // Hidden random copies are resources, with cost-based quantity caps.
          max=Math.min(max,repeating?1:effectCost>=7?(highRole?Math.floor(effectCost*.65):3):effectCost>=4?2:1);
          while(max>0&&copyValue(e.id,max)>maxPrice)max--;
        }
        const resource=resourceIds.includes(e.id);
        const enhanceEvolution=trigger==='爆能强化'&&['selfEvolve','selfSuperEvolve'].includes(e.id);
        const burst=['入场曲','进化时','超进化时','谢幕曲','爆能强化','法术','本随从进化时'].includes(trigger);
        const damageFloor=!burst?1:['damage','splitDamage'].includes(e.id)?(effectCost>=7?3:effectCost>=4?2:1):['face','aoe'].includes(e.id)&&effectCost>=6?2:1;
        const min=resource||enhanceEvolution?1:Math.max(damageFloor,Math.ceil(minRaw/price));
        if(min>max)continue;
        const n=e.id==='draw'&&condition==='discardAll'?weighted(r,Array.from({length:max-min+1},(_,i)=>[min+i,min+i===1?.15:1])):rollAmount(e.id,min,max,trigger,effectCost);
        const automatic={
          mixedStats:`使战场上的随机1个其他随从+${n}/-${n}。`,
          silence:'使对手的战场上的随机1个随从失去所有能力。',
          setHealth:'使对手的战场上的随机1个随从的生命值变为1。',
          attackLock:'对手的回合结束前，使对手的战场上的随机1个随从获得「无法攻击随从或主战者」。',
          statDebuff:`使对手的战场上的随机1个随从-${Math.max(0,n-1)}/-${n}。`,
          handBuff:`使自己的手牌中的随机1张随从+${n}/+${n}。`,
          handCostUp:'使自己的手牌中的随机1张随从的费用+1。',
          allyPing:'对自己的战场上的随机1个随从造成1点伤害。',
          opponentCopyTransform:'使自己的随机1张手牌变身为对手的牌组中的随机1张卡牌的复制卡牌。',
          handCycle:`使自己的随机${n}张手牌返回牌组。抽取${n}张卡牌。`,
          handRefill:`使自己的随机1张手牌返回牌组。抽取${n+1}张卡牌。`,
          handCycleTutor:'使自己的随机1张手牌返回牌组。从自己的牌组中随机将1张$SEARCH加入手牌。',
          damage:`对对手的战场上的随机1个随从造成${n}点伤害。`,
          destroy:'破坏对手的战场上的随机1个随从。',
          banish:'使对手的战场上的随机1个随从消失。',
          smallDestroy:'破坏对手的战场上的随机1个费用为3或以下的随从。',
          enemyBounce:'使对手的战场上的随机1个随从返回手牌。'
        };
        if(trigger==='交战时'){automatic.damage=`对交战对手造成${n}点伤害。`;automatic.destroy='破坏交战对手。';}
        automatic.experimentBuff=`使自己的战场上的随机1个『沉溺的实验体』+${n}/+${n}。`;
        automatic.experimentGrant=`使自己的战场上的随机1个『沉溺的实验体』获得【${experimentKeyword}】。`;
        automatic.allyBuff=`使自己的战场上的随机1个其他随从+${n}/+${n}。`;
        automatic.transformAlly=`使自己的战场上的随机1个其他随从变身为『${transformToken.name}』。`;
        automatic.transformEnemy=`使对手的战场上的随机1个随从变身为『${enemyTransformToken.name}』。`;
        automatic.transformEither=`使战场上的随机1个其他随从变身为『${transformToken.name}』。`;
        automatic.bounce='使自己的战场上的随机1张其他卡牌返回手牌。';
        automatic.allyEvolve=`使自己的战场上的随机1个进化前的${trigger==='谢幕曲'?'':'其他'}随从进化。`;
        automatic.tribeEvolve=`使自己的战场上的随机1个进化前的${tribe?.name}·随从进化。`;
        Object.assign(automatic,{grantRush:'使自己的战场上的随机1个随从获得【突进】。',grantWard:'使自己的战场上的随机1个随从获得【守护】。',grantBarrier:'使自己的战场上的随机1个随从获得【屏障】。'});
        let text=isAutomatic&&automatic[e.id]?automatic[e.id]:e.text(n).replace('$TOKEN',token.name).replace('$SELF',name).replace('$ARTIFACT',artifactToken.name).replace('$KEYWORD',searchKeyword).replace('$SEARCH',searchType);
        text=text.replace('$OWNCREST',extendable?.name||'');
        text=text.replace('$TRANSFORM',(e.id==='transformEnemy'?enemyTransformToken:transformToken).name);
        if(e.id==='tokenHand')text=handOffer.text(n);
        text=text.replace('$CORE',core.name).replace('$FUSIONARTIFACT',fusionArtifact.name);
        text=text.replace('$SUPPORT',commonSupply?.name||'');
        text=text.replace('$EXPERIMENTKEYWORD',experimentKeyword);
        text=text.replace('$TRIBETOKEN',tribeToken?.name||'').replace('$TRIBE',tribe?.name||'').replace('$SEARCH',searchType).replace('$TREASURE',treasure.name);
        if(/Buff$|^buff$/.test(e.id)){
          const [a,h]=growth(n,e.id+'|'+trigger);
          text=text.replaceAll(`+${n}/+${n}`,`+${a}/+${h}`);
        }
        // New targeted atoms must supply an automatic variant before joining this pool.
        if(isAutomatic&&requiresChoice(text))continue;
        if(e.id==='selfCopy'&&trigger==='谢幕曲')text+='使召唤的随从失去【谢幕曲】。';
        if(type!=='follower'){
          text=text.replaceAll('其他所有随从','所有随从').replaceAll('其他随从','随从');
          if(type==='spell')text=text.replaceAll('1张其他卡牌','1张卡牌');
          // Own countdown acceleration is separately priced by the amulet builder.
          if(type==='amulet'&&e.id==='amulet')text=text.replace('所有拥有','其他所有拥有');
          if(type==='amulet'&&e.id==='amuletBreak')text=text.replace('随机1张护符','随机1张其他护符');
        }
        const developsBoard=['tokenSummon','fusionArtifactSummon','crystalHandSummon','experimentSummon','allyBuff','teamBuff','wardBuff','artifactBuff','tribeBuff','crystalHandBuff','experimentBuff','experimentGrant','selfCopy','reanimate','artifactCopy','recruit'].includes(e.id);
        let candidate={ids:[e.id],raw:['recoverFollower','artifactRecover'].includes(e.id)?price*n+.6*n*(n-1):handCycle?cycleValue(n):e.id==='draw'?drawValue(effectCost,n):search?searchValue(e.id,n):copyIds.has(e.id)?copyValue(e.id,n):summonCost(n)+overhead,boardValue:developsBoard?summonCost(n):0,text,tokens};
        if(e.id==='mixedStats')candidate.statChange={attack:n,health:-n,side:'either'};
        if(e.id==='enemySupply')candidate.enemySupply={count:n,entryRaw:card.enemyEntry.raw,opponentBodyCredit:tokenValue(tokens[0])*.5,unitPrice:price};
        if(summonTempo)candidate.summonBoard={tokenId:tokens[0].id,count:n,stats:n*tokenStats,previousStats:previousBoard,effectiveCost:effectCost,baseRaw:price*n,premium:summonPremium(n)};
        if(['tokenSummon','fusionArtifactSummon','crystalHandSummon','experimentSummon'].includes(e.id))candidate.summonDelivery={tokenId:tokens[0].id,count:n,stats:n*(tokens[0].attack+tokens[0].health)};
        if(e.id==='tokenHand')candidate.tokenDelivery={tokenId:token.id,delivery:'hand',count:n,discount:handOffer.discount,unitPrice:handOffer.unitPrice};
        const canDiscount=['draw','handCycle','handRefill','handCycleTutor','keywordSearch','typeSearch','wardSearch','amuletSearch','activeAmuletSearch','tutor','opponentHandCopy','opponentDeckCopy','tokenHand','tribeSupply','artifact','experimentSupply','crystalHandSupply'].includes(e.id);
        if(canDiscount&&!used.has('acquisitionDiscount')&&!candidate.tokenDelivery?.discount&&(!tokens.length||tokens.every(t=>t.cost>0))&&(!complexity||complexity.maxAtoms>=2)){
          const dr=rng(hash(seed+'|acquisition-discount|'+e.id+'|'+trigger+'|'+card.abilities.length));
          const copies=e.id==='handRefill'?n+1:e.id==='handCycleTutor'?1:n;
          const discount=Math.min(weighted(dr,[[1,8],[2,effectCost>=4?3:0],[3,effectCost>=7?1:0],[Math.min(8,effectCost),condition==='discardAll'?8:0]]),...(tokens.length?tokens.map(t=>t.cost):[condition==='discardAll'?8:3]));
          const drawn=['draw','handCycle','handRefill'].includes(e.id),source=drawn?'draw':'obtain';
          const tail=`使以此${drawn?'抽取':'加入手牌'}的卡牌的费用-${discount}。`;
          const gates=['superUnlocked','evolutionUnlocked'].map(id=>unlockGate(id,trigger,effectCost)).filter(Boolean);
          if(cls===4)gates.push({id:'overflow',text:'若为【觉醒】，则',factor:.55});
          if([4,5].includes(cls))gates.push({id:'lowHealth',text:'若自己的主战者的生命值为12或以下，则',factor:.45});
          if([0,7].includes(cls))gates.push({id:'singleton',text:'若自己的牌组中没有重复随从，则',factor:.5});
          const eligibleGates=gates.filter(g=>g.id!==condition&&!(condition==='superUnlocked'&&g.id==='evolutionUnlocked')&&
            !(condition==='superEvolvedBoard'&&['superUnlocked','evolutionUnlocked'].includes(g.id))&&
            !(condition==='evolvedBoard'&&g.id==='evolutionUnlocked'));
          const gated=eligibleGates.length?weighted(dr,eligibleGates.map(g=>[g,g.id==='superUnlocked'?4:1])):null;
          for(const g of [{id:'none',text:'',factor:1},...(gated?[gated]:[])]){
            const extraRaw=copies*discount*1.25*g.factor,raw=candidate.raw+extraRaw;
            if(raw>maxPrice||raw<minRaw)continue;
            const bonusText=g.text+tail;
            const variant={...candidate,ids:[...candidate.ids,'acquisitionDiscount'],raw,text:candidate.text+bonusText,components:[{id:e.id,text:candidate.text,raw:candidate.raw},{id:'acquisitionDiscount',text:bonusText,raw:extraRaw}],acquisitionDiscount:{source,count:copies,discount,condition:g.id,factor:g.factor,baseRaw:candidate.raw,extraRaw}};
            const modifierWeight=condition==='discardAll'?2:g.id==='none'?.16:cls===5&&e.id==='handRefill'?.65:.32;
            options.push([variant,effectWeight(e.id,e.weight)*synergyWeight(variant.ids,tokens,trigger)*interactionWeight(card.abilities,{...variant,trigger})*modifierWeight]);
          }
        }
        if(e.id.startsWith('transform')&&tokens.length)candidate.transformation={side:e.id.slice(9).toLowerCase(),tokenId:tokens[0].id};
        if(e.id==='tokenSummon'&&cls===2&&token.tribeId===2&&effectCost>=3&&rarity>=1&&r()<.5){
          const [a,h]=growth(effectCost>=7?2:1,'royal-summon|'+trigger),extra=(a+h)*.9*n;
          if(candidate.raw+extra<=maxPrice){
            candidate.text+=`使这些随从+${a}/+${h}。`;
            candidate.components=[{id:e.id,raw:candidate.raw,text},{id:'summonGrowth',raw:extra,text:`使这些随从+${a}/+${h}。`}];
            candidate.raw+=extra;candidate.boardValue+=extra;candidate.ids.push('summonGrowth');
          }
        }
        if(['tokenSummon','fusionArtifactSummon','crystalHandSummon','experimentSummon'].includes(e.id))candidate=enhanceSummons(candidate,tokens[0],n,maxPrice,effectCost,complexity);
        // Keep strong evolution payoffs without forcing every resource effect to draw three.
        if((resource||enhanceEvolution)&&candidate.raw<minRaw) {
          if(cheapBase)continue;
          const support=withBlocked([e.id],()=>makeEffect(maxPrice-candidate.raw,trigger,condition,minRaw-candidate.raw,false,effectCost,blockTarget||targeted(text),complexity));
          if(!support)continue;
          candidate={ids:[e.id,...support.ids],raw:candidate.raw+support.raw,boardValue:candidate.boardValue+(support.boardValue||0),text:text+support.text,tokens:[...tokens,...support.tokens]};
        }
        if(complexity&&candidate.ids.length>complexity.maxAtoms)continue;
        options.push([candidate,(additionalTarget&&targeted(candidate.text)?EXTRA_TARGET_WEIGHT:1)*effectWeight(e.id,e.weight)*synergyWeight(candidate.ids,candidate.tokens,trigger)*interactionWeight(card.abilities,{...candidate,trigger})*(enhanceEvolution?3:1)*(trigger==='交战时'&&e.id==='boost'?6:1)]);
      }
      return options.length?weighted(r,options):null;
    }
    function addSpellboostEngine(){
      if(card.abilities.length>=5)return;
      if(used.has('handDiscount')||simpleDesign||cls!==3||cost<3||vanilla||card.signature||r()>[.1,.16,.23,.3][rarity])return;
      const discount=cost>=5&&r()<(cost>=7?.8:cost===6?.6:.3),price=discount?4:3;
      if(price>budget-floor-card.spent)return;
      const text=discount?'使本卡牌的费用-1。':'本随从+1/+1。';
      add({kind:'static',trigger:'魔力增幅时',condition:'none',text:'【魔力增幅时】'+text,bodyText:text,raw:discount?7:5,price,ids:[discount?'spellboostDiscount':'spellboostGrowth']});
    }
    function addHighIdentity(){
      if(!highRole||highRole==='flexible'||signature||card.abilities.length>=3)return;
      const hr=rng(hash(seed+'|high-impact'));if(hr()>.82)return;
      const keywordId=highRole==='defense'?'守护':hr()<.6?'威慑':'突进';
      const hasOffense=used.has('疾驰')||used.has('handStorm');
      if(card.abilities.filter(a=>a.kind==='keyword').length<keywordQuota&&!(highRole==='offense'&&hasOffense)&&!used.has(keywordId)&&!(keywordId==='突进'&&used.has('疾驰'))&&!used.has('潜行')){
        const k=keyword(keywordId);if(k.price<=budget-floor-card.spent)add(k);
      }
      if(card.abilities.length>=4)return;
      if(simpleDesign)return;
      const kinds=highRole==='defense'?['heal','aoe','destroy']:['damage','aoe',...([0,4,5].includes(cls)?['face']:[])];
      const room=budget-floor-card.spent;
      const options=kinds.filter(k=>effectAvailable(k,'入场曲')).map(k=>modularAtom(k,false,'入场曲')).filter(a=>a.raw<=room&&a.raw>=(highRole==='defense'?3.5:5));
      if(options.length){
        const a=weighted(hr,options.map(a=>[a,a.kind==='heal'?4:2]));
        add({...a,kind:'core',trigger:'入场曲',condition:'none',text:'【入场曲】'+a.text,bodyText:a.text,price:a.raw,ids:['highImpact',...a.ids],major:true});
      }
    }
    function addRareCombatModules(){
      if(simpleDesign||signature||cost<3||rarity<2)return;
      const roll=rng(hash(seed+'|rare-combat|'+chaos));
      if(roll()>(highRole==='defense'?(rarity===3?.7:.5):rarity===3?.24:.07)*(chaos?1.7:1))return;
      // Each selection is one independently priced component, never a named card package.
      for(let pass=0;pass<2&&card.abilities.length<4;pass++){
        if(pass&&roll()>.16)break;
        const protectedBody=['abilityDestructionImmune','damageCap','reduceDamage'].some(id=>used.has(id));
        const choices=[];
        const offer=(id,text,raw,trigger='',factor=1,ids=[id])=>{
          const price=raw*factor;
          if(!used.has(id)&&price<=budget-floor-card.spent)choices.push({kind:trigger?'effect':'static',trigger,condition:'none',bodyText:text,text:(trigger?`【${trigger}】`:'')+text,raw,price,ids,tokens:[]});
        };
        const durabilityPremium=used.has('combatDestroy')?2:0;
        if(!protectedBody){
          offer('abilityDestructionImmune','不会被能力破坏。',4.5+floor*.2+durabilityPremium+(used.has('灵气')?2.5:0));
          if(cost>=5){
            offer('damageCap','本随从受到的超过3的伤害变为3。',4+floor*.2+durabilityPremium);
            const reduction=cost>=8&&roll()<.3?2:1;
            offer('reduceDamage',`本随从受到的伤害-${reduction}。`,3+floor*.3+4*(reduction-1)+durabilityPremium);
          }
        }
        if(cls===4&&cost>=7&&highRole!=='defense')offer('ignoreWard','可以无视【守护】进行攻击。',4+floor*.15);
        if(cost>=5&&!used.has('destroy'))offer('combatDestroy','破坏交战对手。',7+(protectedBody?2:0),'交战时',1.6*attackCount(),['destroy','combatDestroy']);
        if(highRole!=='defense'&&cost>=7&&rarity===3&&!used.has('疾驰')&&!used.has('handStorm')&&!used.has('doubleAttack')&&!used.has('selfEvolve')&&!used.has('selfSuperEvolve')){
          const repeatValue=card.abilities.filter(a=>['攻击时','交战时'].includes(a.trigger)).reduce((sum,a)=>sum+a.price,0)*2;
          // Persistent extra attacks also multiply future combat payoffs and Drain.
          // Charge existing repeat engines in full, rather than discounting them again.
          offer('tripleAttack','本随从获得「1回合可以攻击3次」。',8+floor*.45+repeatValue*2,'超进化时',.5);
        }
        if(!choices.length)break;
        add(choices[Math.floor(roll()*choices.length)]);
      }
    }
    function addHandCostAndDiscard(){
      const roll=rng(hash(seed+'|hand-cost-and-discard'));
      if(!vanilla&&type==='follower'&&cost>=3&&roll()<(cls===4?.14:.035)){
        const discard=cls===4&&roll()<.75,id=discard?'discardCost':'shuffleCost';
        // Unconditional loss has less value than a guaranteed, paid conditional reward.
        // Credit is spent entirely on the printed body, never a free extra draw.
        const credit=cost>=5?2:1;
        const text=discard?'选择自己的1张手牌，将其舍弃。':'选择自己的1张手牌，使其返回牌组。';
        floor+=credit;budget+=credit;card.budget=budget;card.bodyAllowance=floor;
        card.handCostTrade={kind:id,bodyBonus:credit,baseBudget:budget-credit};
        add({kind:'cost',trigger:'入场曲',condition:'none',text:'【入场曲】'+text,bodyText:text,raw:0,price:0,ids:[id],tokens:[]});
      }
      if(cls!==4||type==='amulet'||vanilla||rarity===0||cost<2||roll()>.18)return;
      const room=budget-floor-card.spent;
      // Discarding does not pay the printed PP cost, so keep a separate bounded
      // reward budget, but allow larger cards more than a low-cost chip effect.
      if(type==='follower'&&cost<=4&&roll()<.35&&room+2>=4){
        floor-=2;card.bodyAllowance=floor;
        const text=`召唤1个『${name}』。`;
        add({kind:'discardEvent',trigger:'本卡牌被舍弃时',condition:'none',text:'本卡牌被舍弃时，'+text,bodyText:text,raw:4,price:4,ids:['discardTrigger','discardSelfSummon'],tokens:[]});
        card.discardSummonTrade={bodyLost:2};
      }else if(type==='spell'&&cost>=3&&roll()<.3&&room>=5){
        const text=`若本卡牌的费用为${cost}，则将1张『${name}』加入手牌，使其费用变为${cost-2}。`;
        add({kind:'discardEvent',trigger:'本卡牌被舍弃时',condition:'printedCost',text:'本卡牌被舍弃时，'+text,bodyText:text,raw:5,price:5,ids:['discardTrigger','discardReturn'],tokens:[]});
      }else{
        const e=makeEffect(Math.min(3.5,room/1.25),'本卡牌被舍弃时','none',.8,false,Math.min(3,cost));
        if(e)add({...e,kind:'discardEvent',trigger:'本卡牌被舍弃时',condition:'none',text:'本卡牌被舍弃时，'+e.text,bodyText:e.text,price:e.raw*1.25,ids:['discardTrigger',...e.ids]});
      }
    }
    function addProgressTransform(){
      if(skipProgression||alternateConfig||type==='amulet'||cost<2||cost>7||rarity===0||card.abilities.length>=5||card.alternateForms.length||card.emblems.length||card.faiths.length||card.fusion||card.handTrigger)return;
      if(card.abilities.some(a=>/X|Y|本卡牌的费用/.test(a.text)||a.ids.some(id=>['疾驰','selfCopy','discardSelfSummon','invocation','evolutionSacrifice'].includes(id))))return;
      const pr=rng(hash(seed+'|progress-transform'));
      if(pr()>(cls===3?.16:.055)*(chaos?1.4:1))return;
      const atoms=card.abilities.reduce((sum,a)=>sum+(a.kind==='keyword'?0:a.ids.length),0);
      if(type==='spell'&&atoms+1>(card.effectLimit||5))return;
      const events={
        0:[['evolutions','自己的随从进化时',2]],
        1:[['play','自己使用卡牌时',5]],
        2:[['rally','自己的随从进入战场时',5],['enhance','自己通过【爆能强化】使用卡牌时',2]],
        3:[['spellboost','【魔力增幅时】',5],['spellboost','【魔力增幅时】',5],['earth','自己发动【土之秘术】时',2]],
        4:[['hurt','自己的随从受到伤害且没被破坏时',3],['discard','自己舍弃其他卡牌时',3]],
        5:[['leaderHurt','自己的主战者受到伤害时',3],['deaths','自己的随从被破坏时',4]],
        6:[['amuletDeath','自己的护符被破坏时',2]],
        7:[['artifacts','自己的创造物·随从进入战场时',4],['fusion','自己进行【融合】时',2]]
      };
      const [eventId,event,baseThreshold]=events[cls][Math.floor(pr()*events[cls].length)];
      const threshold=Math.max(2,baseThreshold+(pr()<.22?1:0));
      const room=card.budget-card.spent-(type==='follower'?card.attack+card.health:0),factor=.5;
      const discount=cost>=3&&rarity>=2&&pr()<.25&&room>=3.3?2:1,discountRaw=discount*2.4;
      const replayMultiplier=1+card.abilities.filter(a=>a.ids.includes('replay')).reduce((sum,a)=>sum+(a.trigger==='超进化时'?.25:.38),0);
      const ceiling=Math.min(5,(room/factor-discountRaw)/replayMultiplier);if(ceiling<1.8)return;
      // Retain the base card's entire playable effect, then add a separately
      // priced reward. A transformation is not a second copy of the base card.
      const trigger=type==='spell'?'法术':'入场曲';
      const bonus=makeEffect(ceiling,trigger,'none',1.8,true,cost,false,{simple:true,maxAtoms:1},['damage','heal','draw','tokenSummon','tokenHand','boost','earth','grave']);
      if(!bonus)return;
      const raw=discountRaw+bonus.raw*replayMultiplier,price=raw*factor;if(price>room)return;
      if(used.has('潜行')&&cost>=4&&card.ambushPackageTrade&&ambushCardValue(card.attack,card.health,card.abilities).value+price/3>card.ambushPackageTrade.limit+1e-8)return;
      const baseText=card.abilities.map(a=>a.text).join('\n\n');
      const upgraded={id:'upgrade-'+seed,name:name+'·完成形',class:cls,type,cost:cost-discount,attack:card.attack||0,health:card.health||0,custom:true,upgrade:true,
        text:baseText+'\n\n'+(type==='spell'?'':'【入场曲】')+bonus.text,
        abilities:[...card.abilities.map(a=>({...a})),{...bonus,kind:'effect',trigger,condition:'none',text:(type==='spell'?'':'【入场曲】')+bonus.text,bodyText:bonus.text}]};
      const counter=`使本卡牌的X+1。之后，若X为${threshold}或以上，则本卡牌变身为『${upgraded.name}』。`;
      const text='X起始为0。\n'+(eventId==='spellboost'?event:'在手牌中发动。'+event+'，')+counter;
      const progression={eventId,threshold,targetId:upgraded.id,discount,discountRaw,bonusRaw:bonus.raw,replayMultiplier,price,factor,baseText};
      add({kind:'progressTransform',trigger:eventId==='spellboost'?'魔力增幅时':'在手牌中发动',condition:'progression',text,bodyText:text,raw,price,ids:['progressTransform'],progression,tokens:[upgraded,...bonus.tokens]});
      card.progressTransform=progression;
    }
    function addHandTrigger(){
      if(vanilla||alternateConfig||cost<2||card.abilities.length>=3)return;
      const hr=rng(hash(seed+'|hand-trigger')),room=budget-floor-card.spent;
      if(hr()>[.025,.08,.15,.22][rarity]*(chaos?1.3:1)*(cost>=6?1.35:1))return;
      const events=[{id:'ownSuper',text:'自己的随从超进化时',expected:1.4}];
      const themed={
        0:[{id:'opponentSuper',text:'对手的随从超进化时',expected:1.2}],
        1:[{id:'leave',text:'自己的随从离开战场时',expected:3},{id:'combo',text:'自己的回合结束时，【连击 3】',expected:2},{id:'play',text:'自己使用卡牌时',expected:3,temporary:true}],
        2:[{id:'enhance',text:'自己通过【爆能强化】使用卡牌时',expected:2}],
        3:[{id:'earth',text:'自己发动【土之秘术】时',expected:2.5},{id:'crystalHands',text:'自己的『天晶魔手』进入战场时',expected:3}],
        4:[{id:'hurt',text:'自己的随从受到伤害且没被破坏时',expected:2.5}],
        5:[{id:'lowHealth',text:'自己的回合结束时，若自己的主战者的生命值为12或以下，则',expected:2}],
        6:[{id:'activate',text:'自己【启动】护符时',expected:2},{id:'amuletDeath',text:'自己的护符被破坏时',expected:2.5}],
        7:[{id:'highCostEnter',text:'自己的原始费用为5或以上的随从进入战场时',expected:2,temporary:true},{id:'fusion',text:'自己进行【融合】时',expected:2}]
      };
      const choices=[...events,...(themed[cls]||[])];
      const event=weighted(hr,choices.map(e=>[e,e.id==='ownSuper'?1:3]));
      const keyword=type==='follower'&&event.id==='opponentSuper'&&hr()<.8?(cost<=5&&hr()<.65?'疾驰':'毁灭'):null;
      const growing=type==='follower'&&!keyword&&rarity>=1&&hr()<.22;
      const amount=event.id==='ownSuper'&&cost>=6?3:1;
      const setCost=!keyword&&!growing&&event.id==='ownSuper'&&cost<=4;
      const temporary=!!event.temporary;
      // Repeated reductions can reach zero PP; only "set to 1" stops at one.
      const expectedDiscount=setCost?cost-1:Math.min(cost,event.expected*amount);
      // A cheap card held until an end-step condition or super-evolution
      // has little cost left to save. Rapid same-turn zero-cost engines do not
      // receive this rebate; expensive discount payoffs retain their value.
      const slowDiscount=['lowHealth','combo','ownSuper','opponentSuper'].includes(event.id);
      const discountValueFactor=slowDiscount?(cost<=2?.35:cost===3?.5:cost<=6?.75:1):1;
      let raw,price,payload,payoff;
      if(keyword){
        raw=keywordPrice(keyword,Math.max(1,Math.round(floor*(.5+attackBias))),Math.ceil(floor/2));
        price=Math.max(1,raw*.65);payload='本随从获得【'+keyword+'】。';payoff='keyword';
      }else if(growing){
        raw=2;price=Math.min(5,raw*event.expected*.8);payload='本随从+1/+1。';payoff='growth';
      }else{
        if(rng(hash(seed+'|discount-cost-frequency'))()>discountFrequency(cost))return;
        raw=expectedDiscount*2*discountValueFactor;price=(.8+expectedDiscount*(temporary?1.55:1.8)+(expectedDiscount===cost?.7:0))*discountValueFactor;
        payload=(temporary?'回合结束前，':'')+(setCost?'使本卡牌的费用变为1。':'使本卡牌的费用-'+amount+'。');payoff='discount';
      }
      if(price>room)return;
      // Repeated growth needs a quota; repeated reductions are bounded by zero PP.
      const quota=growing&&!['lowHealth','combo'].includes(event.id)?'每回合最多发动1次，':'';
      const separator=/[，】则]$/.test(event.text)?'':'，';
      const text='在手牌中发动。'+event.text+separator+quota+payload;
      const spec={eventId:event.id,payoff,keyword,temporary,amount:payoff==='discount'?amount:1,setCost:setCost?1:null,expectedDiscount:payoff==='discount'?expectedDiscount:0,discountValueFactor:payoff==='discount'?discountValueFactor:1,oncePerTurn:!!quota};
      if(type==='spell'&&!card.abilities.some(a=>a.trigger==='法术')){
        const atoms=card.abilities.reduce((n,a)=>n+(a.kind==='handTrigger'?1:a.ids.filter(id=>id!=='discardTrigger').length),0);
        if(atoms+1>=[2,3,4,5][rarity]||room-price<Math.min(4,cost*1.1))return;
      }
      add({kind:'handTrigger',trigger:'在手牌中发动',condition:'none',text,bodyText:text,raw,price,ids:['handTrigger',payoff==='discount'?'handDiscount':keyword==='疾驰'?'handStorm':keyword?'handKeyword':'handGrowth'],handSpec:spec,tokens:[]});
      card.handTrigger=spec;
    }
    function addDrawLuck(){
      if(alternateConfig||vanilla||rarity<2||cost<4||![5,6].includes(cls)||card.abilities.length>=3)return;
      const lr=rng(hash(seed+'|draw-luck'));
      if(lr()>(rarity===3?.26:.12)*(chaos?1.3:1))return;
      const trigger=type==='spell'?'法术':weighted(lr,[['入场曲',6],['进化时',type==='follower'?2:0],['超进化时',type==='follower'?2:0]]);
      const timing=['进化时','超进化时'].includes(trigger)?evolutionTiming(trigger):1;
      const room=(budget-floor-card.spent)/timing;
      if(cls===5){
        if(cost<6||used.has('handRefresh'))return;
        const rounds=cost>=8&&lr()<.45?2:1,threshold=lr()<.5?3:4;
        const same=lr()<.75,success=same?(threshold===4?.38:.55):.75;
        const limit=Math.min(12,(room/rounds-1.4)/success);
        const payoff=makeEffect(limit,'谢幕曲','handCostPattern',3,false,cost,false,null,['damage','aoe','face','heal','tokenSummon','massDebuff']);
        if(!payoff)return;
        const raw=rounds*(1.4+payoff.raw),price=rounds*(1.4+payoff.raw*success)*timing;
        if(price>budget-floor-card.spent)return;
        if(type!=='follower'){
          const atoms=1+payoff.ids.length,limit=[2,3,4,5][rarity];
          if(atoms>limit||(atoms===limit&&price<budget*.55))return;
        }
        const requirement=same?`${threshold}张或以上费用相同的卡牌`:`至少${threshold}种不同费用的卡牌`;
        const body=`使自己的所有手牌返回牌组。抽取X张卡牌。X为因本能力返回牌组的张数。之后，若自己的手牌中有${requirement}，则${payoff.text}`;
        const text=rounds===1?body:`发动${rounds}次「${body}」。`;
        add({...payoff,kind:'handLuck',trigger,condition:'handCostPattern',raw,price,text:(trigger==='法术'?'':`【${trigger}】`)+text,bodyText:text,ids:['handLuck','handRefresh',...payoff.ids],major:raw>=8,
          luck:{kind:'handCostPattern',pattern:same?'same':'distinct',threshold,rounds,successWeight:success,payoffRaw:payoff.raw,reshuffle:true}});
      }else{
        const safeIds=['damage','heal','tokenSummon','aoe','splitDamage'];
        const safe=p=>p&&!p.tokens.some(t=>/本随从进入战场时[^\n]*抽取/.test(t.text));
        const payoff=makeEffect(Math.min(6,room),'谢幕曲','drawCost',2,false,cost,false,null,safeIds);
        if(!safe(payoff))return;
        const universe=Array.from({length:11},(_,i)=>i),rule=weighted(lr,[['set',3],['parity',2],['threshold',3],['range',2]]);
        let predicate,hitLabel,missLabel,ruleSpec={kind:rule};
        if(rule==='set'){
          const values=[],remaining=[...universe],count=weighted(lr,[[1,2],[2,4],[3,3],[4,1]]);
          for(let i=0;i<count;i++)values.push(remaining.splice(Math.floor(lr()*remaining.length),1)[0]);values.sort((a,b)=>a-b);
          predicate=n=>values.includes(n);hitLabel='为'+values.join('、');missLabel='不为'+values.join('、');ruleSpec.values=values;
        }else if(rule==='parity'){
          const parity=lr()<.5?0:1;predicate=n=>n%2===parity;hitLabel='为'+(parity?'奇数':'偶数');missLabel='为'+(parity?'偶数':'奇数');ruleSpec.parity=parity;
        }else if(rule==='threshold'){
          const threshold=2+Math.floor(lr()*4),above=lr()<.5;predicate=n=>above?n>=threshold:n<=threshold;
          hitLabel='为'+threshold+'或'+(above?'以上':'以下');missLabel='为'+(above?threshold-1:threshold+1)+'或'+(above?'以下':'以上');Object.assign(ruleSpec,{threshold,above});
        }else{
          const low=1+Math.floor(lr()*4),high=low+1+Math.floor(lr()*3);predicate=n=>n>=low&&n<=high;
          hitLabel='在'+low+'到'+high+'之间（含两端）';missLabel='不在'+low+'到'+high+'之间（含两端）';Object.assign(ruleSpec,{low,high});
        }
        const hit=universe.filter(predicate),remaining=universe.filter(n=>!predicate(n));
        const weights=universe.map(n=>Object.values(CALIBRATION.costPriors).reduce((sum,a)=>sum+(a[n]||0),0));
        const probability=Math.max(.18,Math.min(.82,hit.reduce((sum,n)=>sum+weights[n],0)/weights.reduce((a,b)=>a+b,0)));
        const duration=weighted(lr,[[null,2],[2,4],[3,4]]),expectedDraws=duration===null?8:duration*1.8;
        let missKind=weighted(lr,[['none',5],['own',3],['downside',2]]),missText='',missRaw=0,downsideValue=0,tokens=[...payoff.tokens],missEffect=null;
        if(missKind==='own'){
          missEffect=withBlocked(payoff.ids,()=>makeEffect(Math.min(3,payoff.raw*.8),'谢幕曲','drawCost',.65,false,cost,false,null,safeIds));
          if(safe(missEffect)){missText=missEffect.text;missRaw=missEffect.raw;tokens.push(...missEffect.tokens);}else{missKind='none';missEffect=null;}
        }else if(missKind==='downside'){
          const drawback=weighted(lr,[['summon',3],['selfDamage',4],['enemyHeal',3]]);
          if(drawback==='summon'){
            const tokenId=lr()<.5?10061120:90061110,t=TOKENS.find(t=>t.id===tokenId);tokens.push(t);
            missText='在对手的战场上召唤1个『'+t.name+'』。';downsideValue=tokenValue(t);
          }else if(drawback==='selfDamage'){
            const n=1+Math.floor(lr()*2);missText='对自己的主战者造成'+n+'点伤害。';downsideValue=n*.8;
          }else{const n=2+Math.floor(lr()*2);missText='回复对手的主战者'+n+'点生命值。';downsideValue=n*.55;}
          ruleSpec.drawback=drawback;
        }
        // Cost predicates have unequal probabilities; price both branches.
        // Conservative probability bounds account for deck construction/control.
        const raw=Math.max(payoff.raw*.3,payoff.raw*probability+missRaw*(1-probability)-downsideValue*(1-probability)*.4)*expectedDraws;
        const price=raw*timing;if(price>budget-floor-card.spent)return;
        const id='draw-luck-emblem',crestName='纹章：'+name+'的花签';
        const line=(label,body)=>'自己抽取卡牌时，若为自己的回合且该卡牌的费用'+label+'，则'+body;
        const text=(duration===null?'':'【吟唱 '+duration+'】\n')+line(hitLabel,payoff.text)+(missText?'\n'+line(missLabel,missText):'');
        const luck={kind:'drawCost',rule:ruleSpec,hitCosts:hit,missCosts:remaining,drawOnly:true,payoffRaw:payoff.raw,missKind,missRaw,probability,downsideValue,expectedDraws};
        card.emblems.push({id,name:crestName,kind:'emblem',class:cls,custom:true,duration,eventId:'draw',conditionId:'drawCost',limit:null,supportTags:['drawLuck'],effects:[{id:payoff.ids[0],raw:payoff.raw,produces:[]},...(missEffect?[{id:missEffect.ids[0],raw:missEffect.raw,produces:[]}]:[])],text,luck});
        const body='使自己获得『'+crestName+'』。';
        add({kind:'emblem',trigger,condition:'none',text:(trigger==='法术'?'':'【'+trigger+'】')+body,bodyText:body,raw,price,ids:['drawLuckEmblem'],tokens,emblemIds:[id],luck,major:raw>=8});
      }
    }
    function addRareInteraction(extensionOnly=false){
      if(alternateConfig||simpleDesign||rarity<2||card.abilities.length>=4)return;
      const roll=rng(hash(seed+'|rare-interaction'+extensionOnly));
      if(roll()>(extensionOnly?.18:chaos?.25:.16))return;
      const ids=extensionOnly?['emblemExtend']:['silence','setHealth','leaderVulnerability','clearEmblems','clearAmulets','handTransform','truthTransform','transformAlly','transformEnemy','transformEither'];
      const trigger=type==='spell'?'法术':weighted(roll,[['入场曲',6],['进化时',type==='follower'?2:0],['超进化时',type==='follower'?1:0]]);
      const timing=['进化时','超进化时'].includes(trigger)?evolutionTiming(trigger):1;
      const e=makeEffect((budget-floor-card.spent)/timing,trigger,'none',0,true,cost,false,null,ids);
      if(e)add({...e,kind:'effect',trigger,condition:'none',text:(trigger==='法术'?'':`【${trigger}】`)+e.text,bodyText:e.text,price:e.raw*timing,major:e.raw>=8});
    }
    function addAmuletHistoryCore(){
      if(alternateConfig||cls!==6||type!=='follower'||rarity<1||cost<6||card.abilities.length>2)return;
      const ar=rng(hash(seed+'|amulet-history-core'));if(ar()>(chaos?.15:.075))return;
      // Reserve room before the generic high-cost core consumes it. Merely
      // listing this atom in late filler made its Last Words route unreachable.
      const trigger=weighted(ar,[['谢幕曲',5],['入场曲',3],['进化时',2]]);
      const timing=trigger==='谢幕曲'?.65:trigger==='入场曲'?1:evolutionTiming(trigger);
      const e=makeEffect((budget-floor-card.spent)/timing,trigger,'none',0,true,cost,false,null,['amuletReviveHighest']);
      if(e)add({...e,kind:'effect',trigger,condition:'none',text:`【${trigger}】`+e.text,bodyText:e.text,price:e.raw*timing,major:true});
    }
    function addEnemyEntryEngine(){
      if(alternateConfig||cls!==2||type!=='follower'||rarity<2||cost<4||card.abilities.length>2)return;
      const er=rng(hash(seed+'|enemy-entry'));if(er()>(chaos?.2:.11))return;
      const trigger='对手的随从进入战场时',room=budget-floor-card.spent;
      const amount=cost>=7&&er()<.3?2:1;
      const pool=[
        {id:'entryFace',text:`对对手的主战者造成${amount}点伤害。`,raw:amount*2.7},
        {id:'entryHeal',text:`回复自己的主战者${amount+1}点生命值。`,raw:(amount+1)*.65},
        {id:'entryDamage',text:`对该随从造成${amount+1}点伤害。`,raw:(amount+1)*1.25},
        {id:'entryLock',text:'对手的回合结束前，使该随从获得「无法攻击随从或主战者」。',raw:2.4}
      ];
      const chosen=[],cap=Math.min(6,room/3.2);
      for(let i=0;i<(rarity===3&&er()<.45?2:1);i++){
        const fits=pool.filter(p=>!chosen.includes(p)&&p.raw+chosen.reduce((n,p)=>n+p.raw,0)<=cap);
        if(!fits.length)break;chosen.push(fits[Math.floor(er()*fits.length)]);
      }
      if(!chosen.length)return;
      const raw=chosen.reduce((n,p)=>n+p.raw,0),body=chosen.map(p=>p.text).join('');
      add({kind:'static',trigger,condition:'none',text:trigger+'，'+body,bodyText:body,raw:raw*3.2,occurrenceRaw:raw,price:raw*3.2,major:cost>=6&&raw*3.2>=8,ids:['enemyEntry',...chosen.map(p=>p.id)],components:chosen,tokens:[]});
      card.enemyEntry={raw,multiplier:3.2,effects:chosen.map(p=>p.id)};
      // Provision and the reaction are separate atoms, not a copied card suite.
      // Natural opposing plays still trigger the engine when no supply fits.
      if(er()<.8){
        const e=makeEffect(budget-floor-card.spent,'入场曲','none',0,true,cost,false,null,['enemySupply']);
        if(e)add({...e,kind:'effect',trigger:'入场曲',condition:'none',text:'【入场曲】'+e.text,bodyText:e.text,price:e.raw});
      }
    }
    function addStationaryDesign(){
      if(type!=='follower'||vanilla||signature||card.sacrificeDesign||![2,3,6].includes(cls)||rarity<1||cost<3||cost>7||card.attack<1||card.abilities.length>3)return;
      const incompatible=['疾驰','突进','威慑','潜行','虹吸','doubleAttack','tripleAttack','handStorm','selfCopy','invocation','discardSelfSummon','selfEvolve','selfSuperEvolve'];
      if(card.abilities.some(a=>['攻击时','交战时'].includes(a.trigger)||a.ids.some(id=>incompatible.includes(id))))return;
      const sr=rng(hash(seed+'|stationary-design'));if(sr()>(chaos?.19:.1))return;
      // Lost attacking freedom buys a capped allowance, never equal to the
      // entire attack stat: counterattacks and Ward still use that attack.
      const credit=Math.min(5,1.5+card.attack*.55),before=card.attack+card.health;
      const trigger=sr()<.5?'自己的回合开始时':'自己的回合结束时';
      const multiplier=2.2,bodyBonus=sr()<.5?0:1;
      const spare=Math.max(0,card.budget-card.spent-before);
      const payoff=makeEffect(Math.min(5,(credit+spare-bodyBonus)/multiplier),trigger,'none',1.3,true,cost,false,{maxAtoms:1},['tokenSummon','heal','boost','earth','damage','teamBuff']);
      if(!payoff)return;
      add({kind:'static',trigger:'',condition:'none',text:'无法攻击随从或主战者。',price:0,raw:0,ids:['cannotAttack']});
      add({...payoff,kind:'static',trigger,condition:'none',text:trigger+'，'+payoff.text,bodyText:payoff.text,price:payoff.raw*multiplier});
      card.health+=bodyBonus;card.bodyAllowance=card.attack+card.health;
      card.budget+=credit;budget=card.budget;
      card.stationaryDesign={credit,beforeBody:before,bodyBonus,payoffRaw:payoff.raw,multiplier,spare};
    }
    function addExhaustibleCycle(){
      if(vanilla||alternateConfig||rarity<2||cost<4||type==='spell'||card.abilities.length>=3)return;
      const cr=rng(hash(seed+'|exhaustible-cycle'));if(cr()>(chaos?.09:.045))return;
      const limit=Math.min(7,(budget-floor-card.spent)/2.4),parts=[];
      for(let i=0;i<3;i++){
        const p=withBlocked(parts.flatMap(p=>p.ids),()=>pickAtom(limit,['pp','teamBuff','reanimate'],true,1.5,'自己的回合开始时'));
        if(!p)break;parts.push(p);
      }
      if(parts.length!==3)return;
      const raw=parts.reduce((s,p)=>s+p.raw,0),price=raw*.8;
      if(price>budget-floor-card.spent)return;
      if(type==='amulet'){
        const atoms=parts.reduce((n,p)=>n+p.ids.length,0),limit=[2,3,4,5][rarity];
        if(atoms>limit||(atoms===limit&&price<budget*.55))return;
      }
      const text='自己的回合开始时，从以下未发动的能力中随机发动1个能力。\n'+parts.map((p,i)=>'（'+(i+1)+'）'+p.text).join('\n');
      add({kind:'cycle',trigger:'自己的回合开始时',condition:'none',text,bodyText:text,raw,price,ids:['exhaustibleCycle',...parts.flatMap(p=>p.ids)],tokens:parts.flatMap(p=>p.tokens),cycle:{withoutReplacement:true,reset:false,branches:parts.map(p=>({text:p.text,raw:p.raw,ids:p.ids}))}});
    }
    function addFusionEvent(){
      if(card.fusion||type!=='follower'||rarity<1||cost<3||card.abilities.length>3)return;
      const fr=rng(hash(seed+'|experiment-fusion'));
      if(fr()>(cls===3?.1:.035)*(chaos?1.3:1))return;
      const room=budget-floor-card.spent;if(room<4)return;
      const ppCost=weighted(fr,[[0,3],[1,4],[2,3]]),repeats=2.2,materialCredit=.5,flexibility=1;
      const priceOf=raw=>flexibility+Math.max(.7,raw-ppCost*2.2-materialCredit)*repeats;
      // Reserve room for a played-card partner if the hand effect makes experiments.
      const allowance=room-(cls===3?2:0);
      // Fusion is usable while this card stays in hand. Its own PP payment,
      // not the follower's printed cost, limits the early-game payoff.
      const ceiling=Math.min(ppCost*2.4+1.1+materialCredit,Math.max(0,(allowance-flexibility)/repeats+ppCost*2.2+materialCredit));
      const allowed=['damage','heal','draw','tokenHand','tokenSummon','handBuff','boost','earth','grave','experimentSupply','experimentSummon','crystalHandSupply','crystalHandSummon','coreSupply','fusionArtifactHand','treasureSupply','coinSupply'];
      let payload=makeEffect(ceiling,'与本卡牌融合时','none',1.3,true,ppCost,false,{maxAtoms:1},allowed);
      const boardCap=[2,3,5][ppCost],boardValueCap=[1.8,2.8,5.5][ppCost];
      if(payload?.summonDelivery&&(payload.summonDelivery.stats>boardCap||payload.boardValue>boardValueCap)){
        payload=withBlocked(payload.ids,()=>makeEffect(ceiling,'与本卡牌融合时','none',1.3,true,ppCost,false,{maxAtoms:1},allowed));
      }
      if(!payload)return;
      if(payload.summonDelivery&&(payload.summonDelivery.stats>boardCap||payload.boardValue>boardValueCap))return;
      const price=priceOf(payload.raw);if(price>allowance)return;
      const experiment=cls===3&&(payload.ids.some(id=>id.startsWith('experiment'))||payload.tokens.some(t=>t.id===10931110));
      let partner=null,trigger=null,timing=null;
      if(experiment){
        trigger=fr()<.55?'入场曲':'进化时';timing=trigger==='进化时'?evolutionTiming(trigger):1;
        partner=makeEffect(Math.min(8,(room-price)/timing),trigger,'none',trigger==='进化时'?3.5:2,false,cost,false,{maxAtoms:1},['experimentSupply','experimentSummon','experimentBuff','experimentGrant']);
        if(!partner||partner.raw*timing>room-price)return;
      }
      const material=cls===2?'财宝·卡牌':weighted(fr,[[cls===3?'法术':cls===6?'护符':cls===7?'创造物·卡牌':'随从',3],['卡牌',2]]);
      const text='与本卡牌【融合】时，'+(ppCost?`若自己的剩余能量点为${ppCost}或以上，则消耗${ppCost}点能量点，`:'')+payload.text;
      const spec={effects:[...payload.ids],ppCost,repeats,materialCredit,flexibility,payoffRaw:payload.raw,experiment,ceiling,boardCap,boardValueCap,summon:payload.summonDelivery||null};
      card.fusion={material,count:'cards',oncePerTurn:true,mode:'event',...spec};
      // Namespaced ids allow the body to use the same effect at a different timing.
      add({...payload,kind:'fusion',trigger:'与本卡牌融合时',condition:ppCost?'fusionPP':'none',text:`【融合】${material}\n`+text,bodyText:text,price,fusionEvent:spec,ids:['fusionEvent',...(experiment?['experimentFusion']:[]),...payload.ids.map(id=>'fusionEvent:'+id)]});
      if(partner){
        const price=partner.raw*timing;
        add({...partner,kind:'effect',trigger,condition:'none',text:`【${trigger}】`+partner.text,bodyText:partner.text,price,fusionPartner:true});
        card.fusion.partner={trigger,effects:[...partner.ids],price};
      }
    }
    function addExpandedSystems(){
      if(vanilla||alternateConfig)return;
      const roll=rng(hash(seed+'|expanded-systems'));
      addFusionEvent();
      // Preserve the system roll without offering whole-deck replacement.
      if(cost>=8&&rarity===3)roll();
      if([1,4,5,7].includes(cls)&&cost>=4&&rarity>=2&&card.abilities.length<3&&roll()<.16){
        const duration=pick([2,3]),event=pick(['start','end','enter']),amount=cost>=7&&roll()<.4?2:1;
        const poison=roll()<.5;
        const payload=poison?`对自己的主战者造成${amount}点伤害。`:event==='enter'?`使其-0/-${amount}。`:`使自己的战场上的随机1个随从-${amount}/-${amount}。`;
        const trigger=event==='start'?'自己的回合开始时':event==='end'?'自己的回合结束时':'自己的随从进入战场时';
        const raw=(poison?2.7:2.2)*amount,price=raw*(event==='enter'?3:duration);
        if(price<=budget-floor-card.spent){
          const emblem={id:'enemy-emblem',name:`纹章：${name}的咒缚`,class:cls,kind:'emblem',custom:true,owner:'opponent',duration,eventId:event,conditionId:'none',limit:null,supportTags:[],effects:[{id:poison?'leaderDamage':'statDebuff',raw,produces:[]}],text:`【吟唱 ${duration}】\n${trigger}，${payload}`};
          const text=`使对手获得『${emblem.name}』。`;
          add({kind:'emblem',trigger:type==='spell'?'法术':'入场曲',condition:'none',text:(type==='spell'?'':'【入场曲】')+text,bodyText:text,raw:price,price,ids:['enemyEmblem'],emblemIds:[emblem.id],tokens:[]});
          card.emblems.push(emblem);
        }
      }
      if(cls===3&&cost>=8&&rarity>=2&&roll()<.22){
        const amount=pick([1,2,3]),price=amount*7;
        if(price<=budget-floor-card.spent){
          const text=`使自己的牌组中的所有随从的费用-${amount}。`;
          add({kind:'effect',trigger:type==='spell'?'法术':'入场曲',condition:'none',text:(type==='spell'?'':'【入场曲】')+text,bodyText:text,raw:price,price,ids:['deckDiscount'],tokens:[],major:true});
        }
      }
      if(cls===2&&type==='follower'&&rarity>=1&&cost>=3&&card.abilities.length<3&&roll()<.22){
        const treasureEvent=roll()<.6,trigger=treasureEvent?'自己使用财宝·卡牌时，或者自己【融合】财宝·卡牌时':'自己使用法术时';
        const e=makeEffect(Math.min(3.2,(budget-floor-card.spent)/2),trigger,'none',1,false,cost);
        if(e)add({...e,kind:'static',trigger,condition:'none',text:trigger+'，自己的每回合中可触发1次，'+e.text,bodyText:e.text,price:e.raw*2,ids:[treasureEvent?'treasureLink':'spellLink',...e.ids]});
      }
    }
    const vanilla=!chaos&&type==='follower'&&rarity===0&&cost<=4&&r()<.022;
    if(!alternateConfig)addHandCostAndDiscard();
    addExpandedSystems();
    addAmuletHistoryCore();
    addEnemyEntryEngine();
    addDrawLuck();
    addExhaustibleCycle();
    addHandTrigger();
    if(type!=='follower'){
      // Expensive Witch spells need their discount priced before a rare core
      // consumes the allowance; adding it afterward can exceed the budget.
      if(type==='spell'&&!alternateConfig&&cls===3&&cost>=8&&!used.has('handDiscount')&&!used.has('spellboostDiscount')&&budget-card.spent>=3){
        add({kind:'static',trigger:'魔力增幅时',condition:'none',text:'【魔力增幅时】使本卡牌的费用-1。',raw:5,price:3,ids:['spellboostDiscount']});
      }
      addRareInteraction();
    }
    if(type!=='follower'){
      const reserveProgress=!skipProgression&&!alternateConfig&&type==='spell'&&cls===3&&cost>=3&&cost<=7&&rarity>=1&&!card.handTrigger&&budget-card.spent>=5&&rng(hash(seed+'|progress-transform'))()<.16*(chaos?1.4:1)?2.2:0;
      NONFOLLOWERS.build({card,cost,cls,rarity,r,pick,weighted,profile,makeEffect,gate,composeEmblem,add,used,withBlocked,tokenValue,canChooseTarget,calibration:CALIBRATION,alternate:!!alternateConfig,reserveProgress});
      addProgressTransform();
      if(reserveProgress&&!card.progressTransform)return generateCard(input,alternateConfig,options,true);
      card.spent=+card.spent.toFixed(2);return card;
    }
    if(cost>=3&&rarity>=2&&card.abilities.length<=3&&rng(hash(seed+'|invocation'))()<(rarity===3?.07:.025)){
      const mode=cost<6||rng(hash(seed+'|invocation-mode'))()<.45?'return':'stay';
      const price=mode==='return'?1.6:4+(cost-6)*.7;
      const slots=mode==='return'?2:1;
      if(card.abilities.length+slots<=5&&price<=budget-floor-card.spent){
        add({kind:'invocation',trigger:'在牌组中发动',condition:'invocationHistory',text:'',bodyText:'',raw:price,price,ids:['invocation'],tokens:[],invocationMode:mode});
        const e=card.abilities.length<5&&r()<.4?makeEffect(Math.min(5,budget-floor-card.spent),'本卡牌被【瞬念召唤】时','none',1,true,cost,false,null,['damage','heal','draw','tokenHand','tokenSummon','boost','earth','grave']):null;
        if(e||mode==='return'){
          const body=(e?.text||'')+(mode==='return'?'本卡牌返回手牌。':'');
          add({...(e||{}),kind:'invocationArrival',trigger:'本卡牌被【瞬念召唤】时',condition:'none',text:'本卡牌被【瞬念召唤】时，'+body,bodyText:body,raw:e?.raw||0,price:e?.raw||0,ids:[...(e?.ids||[]),...(mode==='return'?['invocationReturn']:[])],tokens:e?.tokens||[]});
        }
      }
    }
    if(!used.has('handStorm')&&!vanilla&&keywordQuota>0&&r()<Math.min(.75,(highRole==='offense'?1:highRole==='defense'?.4:1)*profile.keywords['疾驰']/Math.max(.05,1-profile.keywordCounts[0])*1.9)){
      const planned=highRole==='offense'&&!oversized?[weighted(r,[[3,2],[Math.floor(cost*.58),5],[cost-1,3]]),Math.max(3,cost-3)]:null;
      const storm=keyword('疾驰');if(cost>=6)storm.major=true;
      if(planned)storm.raw=storm.price=keywordPrice('疾驰',...planned);
      if(card.abilities.length<5&&storm.price<=budget-floor-card.spent-.65){
        add(storm);keywordQuota=Math.max(1,keywordQuota);
        if(planned){
          const [a,h]=planned;
          const bodyValue=stormCardValue(a,h,[]).value;
          const effectAllowance=Math.max(.65,(cost*(chaos?1.15:1)-bodyValue)*3);
          const cap=floor+storm.price+Math.max(card.spent-storm.price,effectAllowance);
          budget=Math.min(budget,cap);card.budget=budget;card.printedBody=[a,h];
          card.stormPlan={attack:a,health:h,effectAllowance};
        }
      }
    }
    const signature=addSacrificeDesign()||signatureCore();
    if(highRole&&!signature&&!used.has('疾驰'))tradeBodyForPower();
    if(!signature)addRareInteraction();
    addHighIdentity();
    // Reserve rare automatic super-evolution before the high-cost core spends its budget.
    if(!signature&&card.abilities.length<5&&cost>=7&&rarity===3&&r()<.06){
      const g=gate('入场曲'),raw=14,price=Math.max(.4,(raw-g.extra)*g.factor);
      if(((g.id!=='none'&&(g.id!=='selfDamage'||cost>=4))||unconditionalSelfEvolution)&&price<=budget-floor-card.spent&&raw>=(g.minRaw||0))add({kind:'effect',trigger:'入场曲',condition:g.id,resourceCost:g.amount||0,conditionAmount:g.requirement||g.amount||0,minPayoff:g.minRaw||0,text:'【入场曲】'+g.text+'本随从超进化。',bodyText:g.text+'本随从超进化。',raw,price,ids:['selfSuperEvolve'],tokens:[]});
    }
    if(!simpleDesign&&!signature&&!vanilla&&card.abilities.length<5&&!used.has('selfSuperEvolve')&&cost>=2&&rng(hash(seed+'|automatic-evolution'))()<.055){
      const g=gate('入场曲'),raw=6,price=Math.max(.4,(raw-g.extra)*g.factor);
      if(((g.id!=='none'&&(g.id!=='selfDamage'||cost>=4))||unconditionalSelfEvolution)&&raw>=(g.minRaw||0)&&price<=budget-floor-card.spent)add({kind:'effect',trigger:'入场曲',condition:g.id,resourceCost:g.amount||0,conditionAmount:g.requirement||g.amount||0,minPayoff:g.minRaw||0,text:'【入场曲】'+g.text+'本随从进化。',bodyText:g.text+'本随从进化。',raw,price,ids:['selfEvolve'],tokens:[]});
    }
    addRareCombatModules();
    addFaith();
    if(!vanilla)addEmblem();
    addRareInteraction(true);
    addSpellboostEngine();
    if(!simpleDesign&&tribal&&!vanilla&&cost>=2&&card.abilities.length<4&&r()<.65){
      const amount=cost>=7&&r()<.35?2:1;
      const choices=[['rush','使其获得【突进】。',3],['ward','使其获得【守护】。',3],['growth',`使其+${amount}/+${amount}。`,amount*4],['heal',`回复自己的主战者${amount}点生命值。`,2+amount],['draw','每回合最多发动1次，抽取1张卡牌。',4.5]];
      if(cost>=5&&rarity>=1&&rng(hash(seed+'|tribal-multiple-grants'))()<.4){
        const first=pick(choices.slice(0,3)),second=pick(choices.slice(0,3).filter(c=>c!==first));
        choices.push([first[0]+'+'+second[0],first[1]+second[1],first[2]+second[2]]);
      }
      if(cost>=4&&rarity>=1)choices.push(['aoe','对对手的战场上的所有随从造成1点伤害。',8]);
      const affordable=choices.filter(e=>e[2]<=budget-floor-card.spent);
      if(affordable.length){const [effect,text,price]=pick(affordable),trigger=`自己的其他${tribe.name}·随从进入战场时`;add({kind:'static',trigger,condition:'none',text:trigger+'，'+text,bodyText:text,raw:price,price,ids:['tribeEngine'],tribe:tribe.name,tribeEffect:effect,tokens:[]});}
    }
    // Ramp competes in the ordinary effect pool. Do not inject an inexpensive
    // unconditional ramp and then force its body into the 0/1 boundary case.
    if(cost>=6&&!signature)highCore();
    addCrystalHandLink();
    tradeBodyForPower();
    addSpecialMechanic();
    const plannedCount=signature||simpleDesign?card.abilities.length:vanilla?0:(cost>=6?Math.min(5,Math.max(card.abilities.length,2)+(rarity>=1?1:0)+(cost>=8?1:0)+(rarity===3?1:0)):Math.max(card.abilities.length,Math.min(4,1+(r()<.55+rarity*.12?1:0)+(cost>=4&&r()<.4+rarity*.12?1:0))));
    const count=Math.max(card.abilities.length,plannedCount-Math.max(0,keywordQuota-card.abilities.filter(a=>a.kind==='keyword').length));
    for(let i=card.abilities.length;i<count;i++) {
      const remaining=budget-floor-card.spent;
      if(remaining<.55)break;
      let limit=Math.min(remaining,Math.max(1,(budget-floor)*(.46+rarity*.06)));
      const doubleAttackPrice=5+card.abilities.filter(a=>['攻击时','交战时'].includes(a.trigger)).reduce((sum,a)=>sum+a.price,0);
      if(cost>=6&&limit>=doubleAttackPrice&&!used.has('疾驰')&&!used.has('handStorm')&&!used.has('doubleAttack')&&!used.has('tripleAttack')&&r()<.10*synergyWeight(['doubleAttack'])) {
        add({kind:'static',trigger:'',condition:'none',text:'1回合可以攻击2次。',price:doubleAttackPrice,raw:doubleAttackPrice,ids:['doubleAttack']});continue;
      }
      const links=cls===6?[["自己的原始费用为6或以上的其他卡牌进入战场时",.035],['自己的拥有【守护】的其他随从被破坏时',.035],['自己【启动】护符时',.055*(used.has('activeAmuletRecruit')||used.has('activeAmuletSearch')?3:1)],['自己的护符被破坏时',.03]]:cls===7?[["自己的原始费用为5或以上的其他随从进入战场时",.05],['自己的其他创造物·随从进入战场时',.055]]:cls===2?[['自己的其他随从进入战场时',.025]]:cls===3?[['自己使用费用发生变化的随从时',.05]]:cls===4&&floor>=4?[['本随从受到伤害且没被破坏时',used.has('allyPing')||used.has('allBoardDamage')?.14:.07]]:[];
      const combatWeight=cost<2?0:(cls===3)&&cost>=3?.05:.012;
      let trigger=weighted(r,[...['入场曲','进化时','超进化时','谢幕曲','攻击时'].map(t=>[t,triggerWeight(t)]),['交战时',combatWeight],...links,['自己的回合结束时',.025],['爆能强化',cost<10?profile.triggers['爆能强化']*synergyWeight(['enhance']):0]]);
      if((used.has('selfEvolve')||used.has('selfSuperEvolve'))&&['进化时','超进化时'].includes(trigger))trigger='入场曲';
      if(trigger==='爆能强化'&&used.has('enhance'))trigger='入场曲';
      const g=gate(trigger),evolved=['进化时','超进化时'].includes(trigger);
      if(cost<=2&&g.id!=='none'&&['入场曲','谢幕曲'].includes(trigger)&&!card.abilities.some(a=>a.kind!=='keyword')){
        // Spend the existing allowance on one meaningful gated payoff rather
        // than split a cheap card into several weak, unrelated clauses.
        limit=Math.min(remaining,Math.max(limit,(budget-floor)*.78));
      }
      const timing=evolved?evolutionTiming(trigger):({'入场曲':1,'谢幕曲':.65,'攻击时':1.15,'交战时':1.6,'自己的回合结束时':1.25,'爆能强化':1})[trigger]??2.2;
      // Evolution and conditions still reward investment, without multiplying
      // two large discounts into almost-free effects.
      const factor=(evolved?Math.max(timing*g.factor,timing*.8):timing*g.factor)*(['攻击时','交战时'].includes(trigger)?attackCount():1);
      const evolutionPayoff=trigger==='进化时'?3.5+cost*.2:trigger==='超进化时'?5.5+cost*.35:0;
      // Evolution and a difficult resource/sequence requirement are separate investments.
      const minRaw=g.difficult?(g.minRaw||0)+evolutionPayoff:Math.max(g.minRaw||0,evolutionPayoff);
      const effectCost=g.fee||Math.min(10,cost+(g.effectBoost||0));
      const rawLimit=Math.min(limit/factor+g.extra,2*effectCost+9+(g.amount||0),28);
      const effect=(maximum,minimum,resources=true,blockTarget=false)=>makeEffect(maximum,trigger,g.id,minimum,resources,effectCost,blockTarget,cost<=2&&rarity===0?{simple:true,maxAtoms:1}:null);
      let e=effect(rawLimit,minRaw);
      // Hard conditions can buy several effects when one numeric atom is too small.
      if(!(cost<=2&&rarity===0)&&(g.difficult&&g.minRaw>=6||g.fee>=7)&&(!e||r()<(g.fee ? .72 : .55))) {
        const first=effect(rawLimit*.62,minRaw*.4);
        if(first) {
          const second=withBlocked(first.ids,()=>effect(rawLimit-first.raw,Math.max(0,minRaw-first.raw),true,targeted(first.text)));
          if(second)e={ids:[...first.ids,...second.ids],raw:first.raw+second.raw,boardValue:(first.boardValue||0)+(second.boardValue||0),text:first.text+second.text,tokens:[...first.tokens,...second.tokens]};
        }
      }
      if(!e)continue;
      let kind='effect';
      // Modes pay for the stronger branch, plus a flexibility premium, never sum both branches.
      if(e.ids.length===1&&rarity>=1&&r()<[0,.12,.22,.32][rarity]*synergyWeight(['mode'])&&trigger!=='爆能强化'&&canChooseTarget(trigger)) {
        const other=withBlocked(e.ids,()=>effect(Math.max(0,rawLimit-.65),minRaw));
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
      const entries=Object.entries(profile.keywords).filter(([k])=>k!=='疾驰'&&k!==card.handTrigger?.keyword&&!used.has(k)&&keyword(k).price<=remaining&&
        !(k==='疾驰'&&(used.has('selfCopy')||used.has('突进')||used.has('doubleAttack')||used.has('潜行')))&&!(k==='突进'&&used.has('疾驰'))&&
        !(k==='潜行'&&(used.has('守护')||used.has('疾驰')))&&!(k==='守护'&&used.has('潜行')));
      if(!entries.length)break;
      add(keyword(weighted(r,entries.map(([k,w])=>[k,w*synergyWeight([k])]))));
    }
    // Preserve the rare vanilla roll, but every other follower gets a real triggered ability.
    // Pay for it from spare budget; if necessary replace a keyword rather than inflate a cheap body.
    if(!vanilla&&!card.abilities.some(a=>a.trigger&&a.kind!=='alternate')) {
      while((budget-floor-card.spent<.65-1e-8||card.abilities.length>=5)&&card.abilities.length) {
        const removed=card.abilities.pop();
        if(removed){
          card.spent-=removed.price;refreshUsed();
          if(removed.kind==='alternate'){
            card.alternateForms=[];
            card.emblems=card.emblems.filter(e=>!removed.emblemIds?.includes(e.id));
          }
        }
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
    if(!signature&&!used.has('selfEvolve')&&!used.has('selfSuperEvolve')&&replaySearch<=searchCap('进化时')&&rarity>=1&&replayRaw>=(cost<=3?3:3.5+cost*.2)&&fanfares.some(a=>!a.emblemIds)&&card.abilities.length<5&&r()<.55*(fanfares.some(a=>targeted(a.text))&&phaseHasTarget('进化时')?EXTRA_TARGET_WEIGHT:1)&&replayPrice<=budget-floor-card.spent) {
      const exception=card.abilities.some(a=>a.trigger==='爆能强化')?'（【爆能强化】除外）':'';
      add({kind:'replay',trigger:'进化时',condition:'none',text:`【进化时】发动与【入场曲】相同的能力${exception}。`,price:replayPrice,raw:fanfares.reduce((s,a)=>s+a.raw,0),timingFactor:replayTiming,ids:['replay']});
    }
    // Evolution-only cards wait for EP/SEP to do anything. Reserve their extra
    // allowance for a meaningful payoff, especially when no printed keyword helps.
    const evolutions=card.abilities.filter(a=>['进化时','超进化时'].includes(a.trigger));
    const hasOtherPayoff=card.abilities.some(a=>a.kind!=='keyword'&&a.kind!=='alternate'&&!['进化时','超进化时'].includes(a.trigger));
    if(evolutions.length&&!hasOtherPayoff&&!card.evolutionBodyTrade) {
      const target=evolutions.reduce((a,b)=>a.raw>=b.raw?a:b),timing=target.trigger==='超进化时'?.25:.38;
      const naked=card.abilities.every(a=>['进化时','超进化时'].includes(a.trigger));
      const allowance=naked?1.5+cost*.16:1+cost*.1;
      const limit=Math.min(cost<=3?5:cost<=6?7:9,allowance/timing);
      const min=Math.min(limit,(naked?2.6:1.8)+cost*.2);
      const bonus=makeEffect(limit,target.trigger,target.condition,min);
      if(bonus){
        const price=bonus.raw*timing;
        target.bodyText=bonus.text+(target.bodyText||target.text.replace(/^【[^】]+】/,''));
        target.text=`【${target.trigger}】`+target.bodyText;target.raw+=bonus.raw;target.price+=price;target.ids.push(...bonus.ids);
        if(target.components)target.components.unshift({ids:bonus.ids,text:bonus.text,raw:bonus.raw});
        target.tokens=[...(target.tokens||[]),...bonus.tokens];bonus.tokens.forEach(t=>{if(!card.tokens.some(v=>v.id===t.id))card.tokens.push({...t});});
        // Credit only the chosen payoff; unused compensation cannot fund another effect.
        card.spent+=price;card.budget+=price;card.evolutionFocusBonus={trigger:target.trigger,raw:bonus.raw,price,naked,allowance};
      }
    }
    if(cost>=6&&card.abilities.length<5&&card.abilities.length&&card.abilities.every(a=>['进化时','超进化时'].includes(a.trigger))){
      add(keyword(weighted(r,[['守护',Math.max(.01,profile.keywords['守护'])],['突进',Math.max(.01,profile.keywords['突进'])]])));
    }
    // Scale discard rewards after assembling the played card, so raising a
    // reward doesn't reroll its unrelated abilities or erase its simple design.
    for(const a of card.abilities.filter(a=>cost>=4&&a.kind==='discardEvent'&&!a.ids.some(id=>['discardSelfSummon','discardReturn'].includes(id)))){
      const room=budget-floor-card.spent+a.price,ceiling=Math.min(7,2+cost*.7,room/1.25);
      const minimum=Math.max(a.raw,cost>=7?3.75:2.5),ids=a.ids.filter(id=>id!=='discardTrigger');
      ids.forEach(id=>used.delete(id));
      const e=makeEffect(ceiling,'本卡牌被舍弃时','none',minimum,false,cost,false,null,[ids[0]]);
      ids.forEach(id=>used.add(id));
      if(e&&e.raw>a.raw){
        const before=a.raw;card.spent+=e.raw*1.25-a.price;
        const replacement={...e,kind:a.kind,trigger:a.trigger,condition:a.condition,ids:['discardTrigger',...e.ids],text:'本卡牌被舍弃时，'+e.text,bodyText:e.text,price:e.raw*1.25,discardScaling:{before,after:e.raw,ceiling}};
        card.abilities[card.abilities.indexOf(a)]=replacement;
        refreshUsed();for(const t of e.tokens)if(!card.tokens.some(v=>v.id===t.id))card.tokens.push({...t});
      }
    }
    // A cheap delayed payload must not satisfy the full-price late-game floor.
    // Keep bronze cards simple by replacing their core, not adding filler draws.
    if(cost>=7&&!signature&&!used.has('疾驰')&&!used.has('handStorm')&&
      !['handDiscount','spellboostDiscount','costReduction','invocation','discardSelfSummon'].some(id=>used.has(id))){
      const target=5+(cost-7)*2;
      const before=highCostReadiness({...card,attack:null,bodyAllowance:floor});
      if(before<target){
        const removed=simpleDesign?card.abilities.filter(a=>a.kind==='core'&&a.ids.some(id=>['coreAnchor','coreSupport'].includes(id))):[];
        const saved=[...card.abilities],spent=card.spent;
        card.abilities=card.abilities.filter(a=>!removed.includes(a));card.spent-=removed.reduce((s,a)=>s+a.price,0);refreshUsed();
        const remaining=Math.max(simpleDesign?8:0,target-highCostReadiness({...card,attack:null,bodyAllowance:floor}));
        const room=budget-floor-card.spent;
        const kinds=['damage','aoe','destroy','summon',...(highRole==='defense'?['heal']:[])];
        const options=card.abilities.length<5?kinds.filter(id=>effectAvailable(id,'入场曲')).map(id=>modularAtom(id,false,'入场曲')).filter(a=>a.raw>=remaining&&a.raw<=room):[];
        if(!options.length&&card.abilities.length<5){
          const fallback=makeEffect(Math.min(room,cost*2),'入场曲','none',remaining,false,cost,false,{simple:true,maxAtoms:1},['damage','aoe','destroy','heal','tokenSummon']);
          if(fallback)options.push(fallback);
        }
        if(options.length){
          const a=weighted(r,options.map(a=>[a,effectWeight(a.kind==='summon'?'tokenSummon':a.kind||a.ids[0],1)]));
          add({...a,kind:'core',trigger:'入场曲',condition:'none',bodyText:a.text,text:'【入场曲】'+a.text,price:a.raw,ids:['highCostFloor',...(simpleDesign?['coreAnchor']:[]),...a.ids],major:true});
          card.highCostFloor={before,target,after:highCostReadiness({...card,attack:null,bodyAllowance:floor}),replaced:removed.map(a=>a.text)};
          const removedTokenIds=new Set(removed.flatMap(a=>(a.tokens||[]).map(t=>t.id)));
          card.tokens=card.tokens.filter(t=>!removedTokenIds.has(t.id)||card.abilities.some(a=>(a.tokens||[]).some(v=>v.id===t.id)));
        }else{card.abilities=saved;card.spent=spent;refreshUsed();}
      }
    }
    let printedFloor=card.signature?Math.max(8,BODY[cost]-(card.bodyCompensation||0)):floor;
    if(vanilla){printedFloor=[0,3,5,9,10][cost];card.bodyAllowance=printedFloor;}
    const discardOnly=cost>=4&&!card.signature&&!card.sacrificeDesign&&card.abilities.some(a=>a.trigger==='本卡牌被舍弃时')&&
      !used.has('discardSelfSummon')&&card.abilities.every(a=>a.trigger==='本卡牌被舍弃时'||a.kind==='keyword'&&a.ids.every(id=>['突进','守护'].includes(id)));
    if(discardOnly){
      // Playing and discarding are alternative uses of the same card. When
      // playing delivers no other payoff, spend spare budget on a real body.
      const target=BODY[cost]+Math.ceil(cost*.75)-(used.has('突进')?2:0);
      const bonus=Math.max(0,Math.min(target-printedFloor,Math.floor(budget-card.spent-printedFloor)));
      if(bonus){card.discardBodyReserve={before:printedFloor,target,bonus};printedFloor+=bonus;card.bodyAllowance=printedFloor;}
    }
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
      const resourceIds=['recoverFollower','artifactRecover','handCycle','handRefill','handCycleTutor','coinSupply','draw','keywordSearch','typeSearch','wardSearch','amuletSearch','activeAmuletSearch','tutor','opponentHandCopy','opponentDeckCopy'];
      const resources=card.abilities.filter(a=>['入场曲','谢幕曲'].includes(a.trigger)&&a.condition==='none'&&a.ids.some(id=>resourceIds.includes(id)));
      const count=text=>[...text.matchAll(/将([1-9])张『闪耀的金币』|抽取([1-9])张(?:卡牌|护符)|从自己的牌组中随机将([1-9])张|将对手的(?:手牌|牌组)中的随机([1-9])张卡牌的复制卡牌|将随机([1-9])[张种]与本次对战中被破坏/g)].reduce((s,m)=>s+Number(m[1]||m[2]||m[3]||m[4]||m[5]),0);
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
      const summons=card.abilities.filter(a=>['入场曲','谢幕曲'].includes(a.trigger)&&a.condition==='none'&&a.ids.some(id=>['tokenSummon','fusionArtifactSummon','crystalHandSummon','experimentSummon'].includes(id)));
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
    let total=used.has('costReduction')||used.has('crystalHandCostReduction')||used.has('spellboostDiscount')?Math.min(10,printedFloor):printedFloor;
    if(used.has('handDiscount')||used.has('costReduction')||used.has('crystalHandCostReduction')||used.has('spellboostDiscount')){
      const spec=card.handTrigger,expected=spec?.payoff==='discount'?spec.expectedDiscount:Math.min(cost,3);
      const delayed=spec?.eventId==='ownSuper'||spec?.eventId==='opponentSuper';
      const valueFactor=spec?.discountValueFactor??1;
      const bodyValue=expected*(cost<=3?1:cost<=6?.85:.65)*(delayed?.65:1)*valueFactor;
      const targetLoss=valueFactor<1?Math.floor(bodyValue+.25):Math.ceil(bodyValue);
      const baseBody=(oversized?2*(cost+3):BODY[cost])+bodyHeadroom+chaosBody;
      const current=card.printedBody?Math.min(total,card.printedBody[0]+card.printedBody[1]):total;
      const alreadyPaid=Math.max(0,baseBody-current);
      const lost=Math.max(0,Math.min(current-(cost>=6?4:2),targetLoss-alreadyPaid));
      total-=lost;
      if(card.printedBody&&lost){
        const hLoss=Math.min(card.printedBody[1]-1,lost);card.printedBody[1]-=hLoss;card.printedBody[0]-=lost-hLoss;
      }
      card.discountBodyTrade={expected,valueFactor,targetLoss,alreadyPaid,lost};
      card.bodyAllowance=total;
    }
    card.attack=Math.max(1,Math.min(Math.max(1,total-1),Math.round(total*(.5+attackBias))));
    card.health=Math.max(1,total-card.attack);
    if(vanilla){card.attack=Math.floor(total/2);card.health=total-card.attack;}
    if(cost===1&&total===1&&card.boardBodyTrade){card.attack=0;card.health=1;card.zeroAttackTrade={lost:1,reason:'cheapSummon'};}
    if(immediateRamp&&total===1){card.attack=0;card.health=1;card.zeroAttackTrade={lost:1,reason:'ramp'};}
    const unmodifiedBody=[card.attack,card.health];
    if(card.printedBody)[card.attack,card.health]=card.printedBody;
    const aggressive=card.abilities.some(a=>['攻击时','交战时'].includes(a.trigger)||a.ids.some(id=>['疾驰','突进','威慑','潜行','虹吸','handStorm','doubleAttack','tripleAttack','ignoreWard','selfEvolve','selfSuperEvolve'].includes(id)));
    if(!aggressive&&card.attack>=card.health*1.6&&card.attack-card.health>=2){
      const br=rng(hash(seed+'|unsupported-high-attack'));
      if(br()<.85){
        const before=[card.attack,card.health],sum=card.attack+card.health;
        card.attack=Math.max(1,Math.round(sum*(.46+br()*.1)));card.health=sum-card.attack;
        card.bodyBalance={before,after:[card.attack,card.health]};
      }
    }
    if(used.has('hurtLink')&&card.health===1&&card.attack>1){card.attack--;card.health++;}
    if(used.has('handStorm')){
      const beforeAttack=card.attack,beforeHealth=card.health;
      card.attack=Math.min(card.attack,3);
      card.health=Math.max(1,card.health-Math.ceil(card.attack*.4));
      card.handStormTrade={attackLost:beforeAttack-card.attack,healthLost:beforeHealth-card.health};
      card.bodyAllowance=card.attack+card.health;
    }
    if(used.has('疾驰')&&card.attack>0){
      const beforeAttack=card.attack,beforeHealth=card.health;
      card.attack=Math.min(card.attack,Math.max(1,cost-1));
      // Capped attack is a real loss, not converted into extra health. The
      // remaining body payment grows with attack; existing body trades count.
      const targetLoss=Math.floor(Math.max(0,card.attack-1)*.4+Math.max(0,card.attack-3)**2*.06);
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
      const stormLimit=cost*(chaos?1.15:1);
      let assessment=stormCardValue(card.attack,card.health,card.abilities);
      while(assessment.value>stormLimit+1e-8&&card.attack>1){card.attack--;assessment=stormCardValue(card.attack,card.health,card.abilities);}
      while(assessment.value>stormLimit+1e-8&&card.health>1){card.health--;assessment=stormCardValue(card.attack,card.health,card.abilities);}
      if(assessment.value>stormLimit+1e-8||card.attack<Math.max(2,Math.floor(cost*.4))){
        // The effects alone leave no room for Storm. Choose Rush and restore
        // the body from before either Storm-specific trade, keeping prior trades.
        card.attack=beforeAttack+(card.stormBodyTrade?.attackLost||0);
        card.health=beforeHealth+(card.stormBodyTrade?.healthLost||0);
        if(card.stormPlan)[card.attack,card.health]=unmodifiedBody;
        const storm=card.abilities.find(a=>a.kind==='keyword'&&a.ids.includes('疾驰'));
        card.abilities=card.abilities.filter(a=>a!==storm);card.spent-=storm.price;used.delete('疾驰');
        delete card.stormBodyTrade;
        if(!used.has('突进'))add(keyword('突进'));
        card.stormRejected=true;
      }else{
        const attackLost=beforeAttack-card.attack,healthLost=beforeHealth-card.health;
        card.stormPackageTrade={beforeAttack,beforeHealth,attackLost,healthLost,...assessment,limit:stormLimit};
        card.stormBodyTrade.attackLost+=attackLost;card.stormBodyTrade.healthLost+=healthLost;card.stormBodyTrade.extraLoss+=attackLost+healthLost;
      }
      card.bodyAllowance=card.attack+card.health;
    }
    const hasAttackTrigger=card.abilities.some(a=>a.trigger==='攻击时');
    // Rare cheap defensive bodies exchange attack for paid utility keywords.
    // Keep their existing trigger; this is not a keyword-only replacement card.
    if(cost<=3&&!vanilla&&!card.signature&&!card.sacrificeDesign&&!card.supportBody&&card.attack>0&&
      !card.abilities.some(a=>a.trigger==='交战时'||a.ids.some(id=>['疾驰','虹吸','潜行','handStorm','handDiscount','spellboostDiscount','selfEvolve','selfSuperEvolve','doubleAttack','tripleAttack'].includes(id)))){
      const dr=rng(hash(seed+'|defensive-body'));
      if(dr()<(used.has('屏障')||used.has('毁灭')?.18:hasAttackTrigger?.10:[0,.06,.035,.008][cost])){
        const choices=[];
        // Zero attack is a niche utility design, increasingly rare with cost.
        // Most defensive rolls keep one attack instead of losing all pressure.
        const zeroWeight=[0,1.5,1,.35][cost];
        const designs=[['bane',0,['毁灭'],zeroWeight],['barrier',1,['屏障'],4],['barrierWard',0,['屏障','守护'],zeroWeight]];
        if(hasAttackTrigger)designs.push(['attackEngine',0,[],zeroWeight*2]);
        for(const [design,attack,keys,weight]of designs){
          const missing=keys.filter(k=>!used.has(k));
          if(card.abilities.length+missing.length>5)continue;
          const a=Math.min(attack,card.attack),ward=used.has('守护')||keys.includes('守护')||a===0;
          const priced=[...new Set([...keys,...['毁灭','屏障'].filter(k=>used.has(k))])].map(k=>({k,price:keywordPrice(k,a,card.health,{ward,rush:used.has('突进')&&(a>0||hasAttackTrigger||used.has('毁灭')||keys.includes('毁灭'))})}));
          const delta=priced.reduce((sum,p)=>sum+p.price-(card.abilities.find(v=>v.kind==='keyword'&&v.ids.includes(p.k))?.price||0),0);
          if(a+card.health+card.spent+delta<=card.budget)choices.push([{design,attack:a,priced},weight]);
        }
        if(choices.length){
          const choice=weighted(dr,choices),before=[card.attack,card.health];card.attack=choice.attack;
          for(const {k,price}of choice.priced){
            const existing=card.abilities.find(a=>a.kind==='keyword'&&a.ids.includes(k));
            if(existing){card.spent+=price-existing.price;existing.raw=existing.price=price;}
            else add({kind:'keyword',trigger:'',condition:'none',text:`【${k}】`,raw:price,price,ids:[k]});
          }
          card.defensiveBody={design:choice.design,before,attackLost:before[0]-card.attack};
          if(card.attack===0)card.zeroAttackTrade={lost:before[0],reason:'defensiveKeywords'};
          card.bodyAllowance=card.attack+card.health;
        }
      }
    }
    // A cheap support engine may give up attacking to survive at 0/2 or 0/3.
    // Reallocate its body, paying any extra health from genuinely unused budget.
    const supportEngine=cost===1&&card.abilities.some(a=>
      /^自己的.+(?:进入战场时|被破坏时)$/.test(a.trigger)||a.trigger==='自己【启动】护符时');
    if(supportEngine&&!card.defensiveBody&&!card.abilities.some(a=>['入场曲','谢幕曲','攻击时','交战时'].includes(a.trigger))&&
      !card.abilities.some(a=>a.ids.some(id=>['疾驰','屏障','虹吸','handStorm','selfEvolve','selfSuperEvolve','handDiscount','spellboostDiscount'].includes(id)))&&
      !card.boardBodyTrade&&!card.resourceBodyTrade&&!card.rampBodyTrade){
      const ar=rng(hash(seed+'|support-body'));
      if(ar()<.8){
        const room=Math.floor(card.budget-card.spent),health=room>=3&&ar()<.65?3:2;
        if(room>=health){
          const before=[card.attack,card.health];card.attack=0;card.health=health;
          card.supportBody={before,health};card.zeroAttackTrade={lost:before[0],reason:'supportEngine'};
          card.bodyAllowance=health;
        }
      }
    }
    if(used.has('屏障')){
      // A low-cost shield cannot keep a full curve body. Other paid body losses
      // count toward this cap; the shield still consumes effect budget separately.
      const earlyPayoff=card.abilities.filter(a=>a.kind!=='keyword'&&a.kind!=='alternate'&&!['进化时','超进化时','爆能强化'].includes(a.trigger)).reduce((sum,a)=>sum+a.price,0);
      const extra=cost<=3&&earlyPayoff>=1.5?1:0;
      const baseBody=(oversized?2*(cost+3):BODY[cost])+bodyHeadroom+chaosBody;
      const cap=Math.max(cost===1?1:2,(cost<=3?BODY[cost]:baseBody)-1-extra);
      const before=[card.attack,card.health],loss=Math.max(0,card.attack+card.health-cap);
      const healthLoss=Math.min(card.health-1,loss);card.health-=healthLoss;card.attack-=loss-healthLoss;
      card.barrierBodyTrade={cap,extra,lost:loss,before};card.bodyAllowance=card.attack+card.health;
      if(card.attack===0&&!card.zeroAttackTrade)card.zeroAttackTrade={lost:before[0],reason:'barrier'};
    }
    if(cost>=4&&cost<=6){
      let boardValue=immediateBoardValue(card);
      if(boardValue>0){
        const drawbackCredit=card.handCostTrade?.bodyBonus||0;
        const combinedCap=3*cost-1+drawbackCredit+(chaos?cost*.45:0);
        const before=card.attack+card.health;
        let cap=before;
        // Re-evaluate copies with their reduced printed body instead of charging
        // for copies of a large body that no longer exists.
        while(cap>4&&cap+immediateBoardValue({...card,attack:cap-1,health:1})>combinedCap)cap--;
        boardValue=immediateBoardValue({...card,attack:cap-1,health:1});
        const lost=Math.max(0,before-cap);
        if(lost){
          const a=Math.min(card.attack-1,Math.ceil(lost/2));card.attack-=a;
          const h=Math.min(card.health-1,lost-a);card.health-=h;
          card.attack-=lost-a-h;card.bodyAllowance=card.attack+card.health;
        }
        card.midBoardTrade={boardValue,combinedCap,cap,before,lost,drawbackCredit};
      }
    }
    const finalStorm=card.abilities.find(a=>a.kind==='keyword'&&a.ids.includes('疾驰'));
    if(finalStorm){
      const price=keywordPrice('疾驰',card.attack,card.health,{attacks:attackCount()});
      card.spent+=price-finalStorm.price;finalStorm.price=price;finalStorm.raw=price;
    }
    if(cost>=6){
      // Fusion events can fire repeatedly while in hand; their paid engine
      // value, not just one activation's payload, is a meaningful high-cost core.
      card.corePower=card.abilities.reduce((sum,a)=>sum+(a.fusionEvent?Math.max(a.raw,a.price):a.raw),0);
      if(card.corePower>=8&&!card.abilities.some(a=>a.major))card.abilities.reduce((a,b)=>a.raw>=b.raw?a:b).major=true;
    }
    // Zero attack pays for cheap utility; Bane still works at zero damage.
    const utility=card.abilities.filter(a=>['入场曲','谢幕曲'].includes(a.trigger)&&a.condition==='none');
    const oneCostResource=cost===1&&utility.some(a=>a.ids.some(id=>['draw','keywordSearch','typeSearch','wardSearch','amuletSearch','activeAmuletSearch','opponentHandCopy','opponentDeckCopy'].includes(id)));
    const combatEngine=card.abilities.some(a=>a.trigger==='攻击时'||a.ids.some(id=>['doubleAttack','tripleAttack','selfEvolve','selfSuperEvolve'].includes(id)));
    const rareUtility=cost<=3&&card.attack===1&&!card.bodyTrade&&!card.boardBodyTrade&&!card.resourceBodyTrade&&!used.has('handStorm')&&!used.has('疾驰')&&!used.has('虹吸')&&!used.has('毁灭')&&utility.reduce((s,a)=>s+a.price,0)>=cost*1.9&&rng(hash(seed+'|zero-attack-utility'))()<.1;
    if(!vanilla&&!combatEngine&&(oneCostResource||rareUtility)){
      const lost=Math.max(card.attack,card.zeroAttackTrade?.lost||0);card.attack=0;
      card.zeroAttackTrade={lost,reason:oneCostResource?'cheapCardAdvantage':'strongUtility'};
    }
    if(card.attack===0){
      // Attack triggers don't require positive combat damage. Rush can deliver
      // an attack trigger or Bane immediately, even on a zero-attack body.
      const usefulRush=hasAttackTrigger||used.has('毁灭')||card.abilities.some(a=>a.trigger==='交战时');
      const removed=card.abilities.filter(a=>a.kind==='keyword'&&a.ids.some(id=>['疾驰','虹吸','潜行'].includes(id)||id==='突进'&&!usefulRush));
      for(const a of removed){card.spent-=a.price;a.ids.forEach(id=>used.delete(id));}
      card.abilities=card.abilities.filter(a=>!removed.includes(a));
      refreshUsed();
      if(!card.supportBody&&!card.rampBodyTrade&&!used.has('守护')&&card.abilities.length<5)add(keyword('守护'));
      card.bodyAllowance=card.attack+card.health;
    }
    // Charge the final low-attack body and Ward combination, not the old roll.
    if(card.attack===0||card.defensiveBody){
      for(const a of card.abilities.filter(a=>a.kind==='keyword'&&a.ids.some(id=>['毁灭','屏障'].includes(id)))){
        const price=keywordPrice(a.ids[0],card.attack,card.health,{ward:used.has('守护'),rush:used.has('突进')});
        if(card.attack+card.health+card.spent+price-a.price>card.budget+1e-8){
          // Ramp/summon trades can already reach 0/1 before final keyword
          // pricing. Do not keep a keyword whose true zero-attack price won't fit.
          card.abilities=card.abilities.filter(v=>v!==a);card.spent-=a.price;
          if(card.attack===0&&a.ids.includes('毁灭')&&!card.abilities.some(v=>['攻击时','交战时'].includes(v.trigger))){
            const rush=card.abilities.find(v=>v.kind==='keyword'&&v.ids.includes('突进'));
            if(rush){card.spent-=rush.price;card.abilities=card.abilities.filter(v=>v!==rush);}
          }
          refreshUsed();continue;
        }
        card.spent+=price-a.price;a.raw=a.price=price;
      }
    }
    addStationaryDesign();
    const discardedSummon=card.abilities.find(a=>a.ids.includes('discardSelfSummon'));
    if(discardedSummon){
      const retained=card.abilities.filter(a=>a!==discardedSummon&&a.kind!=='alternate'&&!['入场曲','爆能强化','本卡牌被舍弃时','在手牌中发动','魔力增幅时'].includes(a.trigger));
      const price=(card.attack+card.health)*.8+retained.reduce((sum,a)=>sum+a.price,0)*.7+1;
      const available=card.budget-card.attack-card.health-card.spent+discardedSummon.price;
      if(price<=available){
        card.spent+=price-discardedSummon.price;discardedSummon.price=price;discardedSummon.raw=price;
        discardedSummon.valuation={body:(card.attack+card.health)*.8,retained:retained.reduce((sum,a)=>sum+a.price,0)*.7};
      }else{
        card.abilities=card.abilities.filter(a=>a!==discardedSummon);card.spent-=discardedSummon.price;
        refreshUsed();
        const restore=Math.min(2,Math.floor(card.budget-card.spent-card.attack-card.health));card.health+=restore;card.bodyAllowance=card.attack+card.health;
        delete card.discardSummonTrade;
      }
    }
    const ambush=card.abilities.find(a=>a.kind==='keyword'&&a.ids.includes('潜行'));
    if(ambush){
      const before=[card.attack,card.health],originalPrice=ambush.price;
      const limit=cost*(chaos?1.15:1)+(card.handCostTrade?.bodyBonus||0)*.3;
      let assessment=ambushCardValue(card.attack,card.health,card.abilities);
      // Small utility bodies already pay through the ordinary effect budget.
      // The extra package check targets medium/high-cost protected threats.
      if(cost>=4){
        while(assessment.value>limit+1e-8&&(card.attack>1||card.health>1)){
          if(card.attack>1&&(card.attack>=card.health||card.health===1))card.attack--;
          else card.health--;
          assessment=ambushCardValue(card.attack,card.health,card.abilities);
        }
      }
      const price=keywordPrice('潜行',card.attack,card.health,{attacks:attackCount()});
      if(cost>=4&&(assessment.value>limit+1e-8||card.attack<Math.max(2,Math.floor(cost*.4)))){
        // Keep the effect-led card rather than leaving a costly 1-attack ambusher.
        [card.attack,card.health]=before;card.spent-=ambush.price;
        card.abilities=card.abilities.filter(a=>a!==ambush);refreshUsed();
        card.ambushRejected=true;
      }else{
        card.spent+=price-originalPrice;ambush.price=ambush.raw=price;
        while(card.attack+card.health+card.spent>card.budget+1e-8&&card.health>1)card.health--;
        card.ambushPackageTrade={before,attackLost:before[0]-card.attack,healthLost:before[1]-card.health,limit,...ambushCardValue(card.attack,card.health,card.abilities)};
      }
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
      const mode=invocation.invocationMode,value=invocationValue(card,mode),delivered=value.delivered;
      const targetPrice=Math.max(invocation.price,mode==='return'?1.4+delivered*.1:4+delivered*.15);
      const ambushRoom=used.has('潜行')&&cost>=4?Math.max(0,(card.ambushPackageTrade.limit-ambushCardValue(card.attack,card.health,card.abilities).value)*3):Infinity;
      const extra=Math.min(targetPrice-invocation.price,ambushRoom,used.has('疾驰')?0:Math.max(0,card.budget-card.spent-card.attack-card.health));
      invocation.price+=extra;invocation.raw=invocation.price;card.spent+=extra;
      const shortfall=targetPrice-invocation.price,difficulty=delivered+shortfall*4;
      const ir=rng(hash(seed+'|invocation-condition')),options=[];
      const offer=(id,base,scale,unit,label,weight=1)=>{const n=base+Math.ceil(difficulty*scale);options.push([{id,n,text:`若${label}${n}${unit}或以上`},weight]);};
      offer('evolutions',2,.17,'次','本次对战中自己的随从的进化次数为');
      offer('playedCards',5,.5,'张','本次对战中自己使用的卡牌张数为');
      offer('drawnCards',5,.45,'张','本次对战中自己抽取的卡牌张数为');
      offer('destroyedFollowers',4,.35,'个','本次对战中被破坏的自己的随从数量为');
      offer('turn',4,.17,'','自己的回合数为');
      if(difficulty<=28)offer('playedCosts',2,.15,'种','本次对战中自己使用的卡牌的原始费用种类为');
      if(cls===1)offer('fairies',4,.4,'张','本次对战中自己使用的『妖精』张数为',3);
      if(cls===2)offer('rally',7,.6,'个','本次对战中进入战场的自己的随从数量为',3);
      if(cls===3){offer('spells',4,.35,'张','本次对战中自己使用的法术张数为',2);offer('earthRites',2,.23,'次','本次对战中自己发动【土之秘术】的次数为',2);}
      if(cls===4)offer('discardedCards',2,.3,'张','本次对战中自己舍弃的卡牌张数为',3);
      if(cls===5)offer('graveyard',8,.7,'','自己的墓场为',3);
      if(cls===6)offer('amuletDeaths',2,.25,'张','本次对战中被破坏的自己的护符张数为',3);
      if(cls===7)offer('artifactEntries',3,.35,'个','本次对战中进入战场的自己的创造物·随从数量为',3);
      const chosen=weighted(ir,options),trigger=ir()<.65?'自己的回合开始时':'自己的回合结束时',condition=chosen.text;
      invocation.text=`在牌组中发动。${trigger}，${condition}，则【瞬念召唤】本卡牌。`;
      invocation.bodyText=invocation.text;
      invocation.valuation={...value,mode,threshold:chosen.n,history:chosen.id,difficulty,targetPrice,shortfall,trigger};
    }
    // Compose alternate play after the complete follower is known, including
    // late evolution, faith and emblem engines. Its PP budget stays independent.
    for(const form of card.alternateForms.filter(f=>f.kind==='激奏')){
      const context=strategyTags(card);
      const spell=generateCard(name,{cost:form.cost,cls,rarity,token,strategyContext:context},options);
      Object.assign(form,{text:spell.abilities.map(a=>a.text).join('\n\n'),abilities:spell.abilities,budget:spell.budget,spent:spell.spent,tokens:spell.tokens,emblemIds:spell.emblems.map(e=>e.id),strategyContext:context});
      card.emblems.push(...spell.emblems);
      const ability=card.abilities.find(a=>a.kind==='alternate'&&a.ids.includes('accelerate'));
      if(ability){ability.tokens=spell.tokens;ability.emblemIds=form.emblemIds;}
      for(const t of spell.tokens)if(!card.tokens.some(v=>v.id===t.id))card.tokens.push({...t});
    }
    addProgressTransform();
    card.spent=+card.spent.toFixed(2);
    card.vanilla=card.abilities.length===0;
    return card;
  }
  const api={generate,nextVariant,randomName,randomMatchingName,tokenValue,keywordPrice,stormCardValue,ambushCardValue,invocationValue,strategyTags,strategyAffinity,interactionWeight,continuityWeight,highCostReadiness,immediateBoardValue,discountFrequency,CLASSES,RARITIES,THEMES,TOKENS,SUPPORT_CARDS,RELATED_CARDS,TYPES,VERSION};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.SVWB=api;
})(typeof globalThis!=='undefined'?globalThis:this);
