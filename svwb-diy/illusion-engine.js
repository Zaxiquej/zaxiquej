(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./illusion-data.js'));else root.SVIllusion=factory(root.SVIData);})(typeof globalThis!=='undefined'?globalThis:this,function(Data){
'use strict';
const VERSION='1.2.0',SEED_VERSION='1.0.0';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function rng(seed){let h=2166136261;for(const c of seed){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
const pick=(r,a)=>a[Math.floor(r()*a.length)];
function weighted(r,a){let x=r()*a.reduce((s,v)=>s+v[1],0);for(const [v,w] of a){x-=w;if(x<0)return v;}return a.at(-1)[0];}
const CLASS=Object.fromEntries(Data.classes.map(c=>[c.id,c]));
const race=cls=>({neutral:'中立',forest:'精灵',royal:'皇家',dragon:'龙族',nightmare:'梦魇'})[cls];
const TOKENS={
forest:[{name:'妖精',star:1,attack:1,health:1,pre:[],post:[]},{name:'新绿的妖精',star:2,attack:1,health:1,autoEvolve:true,pre:['本随从进入战场时，进化。','【守护】'],post:['【守护】']}],
royal:[{name:'骑士',star:1,attack:1,health:1,pre:[],post:[]},{name:'安静的女仆·诺嘉',star:2,attack:2,health:2,pre:['【守护】','【开战时】若自己的战场上有『假日中的王女·普莉姆』，则获得最左侧该随从攻击力与生命值的一半。'],post:['【守护】','【开战时】若自己的战场上有『假日中的王女·普莉姆』，则获得最左侧该随从的攻击力与生命值。']}],
dragon:[{name:'炽炎幼龙',star:1,attack:1,health:1,pre:['【屏障】'],post:['【屏障】']},{name:'霸道之金龙',star:4,attack:4,health:5,pre:['【守护】'],post:['【守护】']},{name:'霸道之银龙',star:4,attack:5,health:4,pre:[],post:[]}],
nightmare:[{name:'蝙蝠',star:1,attack:1,health:1,pre:[],post:[]},{name:'守卫犬的右腕·米米',star:1,attack:2,health:1,pre:['【谢幕曲】对对手的战场上的随机1个随从造成X点伤害。X为本随从的攻击力。'],post:['【谢幕曲】对对手的战场上的随机2个随从造成X点伤害。X为本随从的攻击力。']},{name:'守卫犬的左腕·可可',star:1,attack:1,health:2,pre:['【守护】','【谢幕曲】使自己的战场上的随机1个梦魇·随从+X/+X。X为本随从的攻击力。'],post:['【守护】','【谢幕曲】使自己的战场上的随机2个梦魇·随从+X/+X。X为本随从的攻击力。']}]
};
// Token star is not its producer's unlock tier: Mimi/Coco are one-star
// tokens of a five-star engine, not rewards for any one-star follower.
for(const list of Object.values(TOKENS))for(const t of list)t.minSourceTier=
 t.name==='新绿的妖精'?2:/米米|可可/.test(t.name)?5:/霸道之/.test(t.name)?6:t.name==='安静的女仆·诺嘉'?4:1;
// Select a coherent theme, then independently assemble trigger / target / payload / scaling.
const themes=[
{id:'ward',cls:['neutral'],min:1,weight:4,events:['prepare','wardHit','fanfare'],effects:['buff','grant'],target:'ward'},
{id:'small',cls:['neutral'],min:1,weight:4,events:['smallPlay','fanfare','last'],effects:['buff','recruit','legacy'],target:'small'},
{id:'evolution',cls:['neutral','forest'],min:2,weight:4,events:['evolve','prepare','fanfare'],effects:['buff','recruit','evolve'],target:'evolved'},
{id:'menagerie',cls:['neutral'],min:4,weight:2,events:['prepare','fanfare'],effects:['buff','grant'],target:'tribes'},
{id:'swarm',cls:['forest','royal','nightmare'],min:1,weight:4,events:['last','fanfare','enter'],effects:['summon','buff'],target:'tribe'},
{id:'forestLegacy',cls:['forest'],min:2,weight:4,events:['last','echo','fanfare'],effects:['legacy','summon'],target:'tribe'},
{id:'forestEcho',cls:['forest'],min:3,weight:4,events:['echo','last'],effects:['damage','summon','buff'],target:'tribe'},
{id:'forestEvolution',cls:['forest'],min:3,weight:3,events:['evolve','prepare'],effects:['buff','summon','recruit'],target:'tribe'},
{id:'shield',cls:['royal'],min:1,weight:4,events:['shieldLost','enter','prepare','fanfare'],effects:['buff','grant'],target:'tribe'},
{id:'royalFanfare',cls:['royal'],min:2,weight:4,events:['fanfarePlay','prepare','fanfare'],effects:['buff','recruit','summon'],target:'tribe'},
{id:'royalFormation',cls:['royal'],min:3,weight:3,events:['prepare','fanfare'],effects:['buff','grant','recruit'],target:'adjacent'},
{id:'dragonWound',cls:['dragon'],min:1,weight:6,events:['hurt','fanfare','start'],effects:['buff','wound','damage','recruit'],target:'tribe'},
{id:'dragonEconomy',cls:['dragon'],min:1,weight:3,events:['fanfare','purchase','round','hurt'],effects:['discount','coin','recruit'],target:'tribe'},
{id:'dragonPurchase',cls:['dragon'],min:3,weight:3,events:['purchase','fanfare','prepare'],effects:['buff','coin','summon'],target:'tribe'},
{id:'death',cls:['nightmare'],min:1,weight:5,events:['death','last','echo'],effects:['summon','buff','damage'],target:'tribe'},
{id:'nightmareAttack',cls:['nightmare'],min:2,weight:3,events:['attack','clash','echo'],effects:['buff','damage','summon','grant'],target:'tribe'},
{id:'resurrection',cls:['nightmare','royal','forest'],min:3,weight:2,events:['last','start'],effects:['revive','bequeath'],target:'tribe'}
];
const EVENT={
fanfare:{min:1,frequency:1,manual:true,label:'【入场曲】'},last:{min:1,frequency:1,label:'【谢幕曲】'},
prepare:{min:2,frequency:1.6,label:'【备战】'},start:{min:1,frequency:1,label:'【开战时】'},
round:{min:3,frequency:1.7,label:'【回合开始时】'},echo:{min:3,frequency:2,label:'【残响_{threshold}】'},
hurt:{min:2,frequency:2,label:'本随从受到伤害且没被破坏时，'},
purchase:{min:3,frequency:2,label:'每购买{threshold}个{race}·随从，'},
enter:{min:1,frequency:3,label:'自己的其他{race}·随从进入战场时，'},
death:{min:1,frequency:3,label:'战斗阶段中，自己的其他{race}·随从被破坏时，'},
evolve:{min:2,frequency:2,label:'自己的其他随从进化时，'},
smallPlay:{min:1,frequency:3,label:'自己使用等级3或以下的随从时，'},
fanfarePlay:{min:2,frequency:3,label:'自己使用拥有【入场曲】的随从时，'},
shieldLost:{min:5,frequency:2,label:'自己的随从失去【屏障】时，'},
wardHit:{min:2,frequency:2,label:'战斗阶段中，自己的拥有【守护】的随从被攻击时，'},
attack:{min:2,frequency:2,label:'【攻击时】'},clash:{min:2,frequency:2.5,label:'【交战时】'},
aura:{min:6,frequency:1,label:''}
};
const TIER_RULES=[null,
 {role:'基础与过渡',single:1,group:0,superChance:0},
 {role:'单体成长与配合',single:1,group:0,superChance:0},
 {role:'体系衔接',single:2,group:1,superChance:0},
 {role:'稳定支援',single:3,group:2,superChance:0},
 {role:'阵容核心',single:4,group:4,superChance:.32},
 {role:'体系放大与终局',single:6,group:5,superChance:.42}
];
const THEME_TAGS={ward:['守护'],small:['低星','获取低星'],evolution:['进化'],menagerie:['混合兵种'],swarm:['召唤','进场'],forestLegacy:['永久'],forestEcho:['残响'],forestEvolution:['进化'],shield:['屏障'],royalFanfare:['入场'],royalFormation:['相邻','群体'],dragonWound:['受伤','自伤'],dragonEconomy:['金币','折扣','获取'],dragonPurchase:['购买'],death:['破坏','谢幕'],nightmareAttack:['攻击','交战','连打','毁灭'],resurrection:['复活','继承','传递']};
function themeWeight(theme,peers){
 const matches=peers.filter(c=>c.tags.some(tag=>THEME_TAGS[theme.id].some(word=>tag.includes(word)))).length;
 return theme.weight*(.25+matches/peers.length*3);
}
const ECONOMIC=new Set(['recruit','coin','discount']);
function legalEffect(id,event,star){
 if(id==='legacy')return star>=2&&['fanfare','last','echo'].includes(event);
 if(id==='evolve')return star>=4&&(event==='fanfare'||star>=6&&event==='prepare');
 if(id==='grant')return star>=2&&event==='fanfare'||star>=5&&['prepare','start'].includes(event);
 if(id==='wound')return star>=4&&['fanfare','start'].includes(event);
 if(id==='revive')return event==='last';
 if(id==='bequeath')return event==='start'&&star>=6;
 if(id==='coin')return star>=3&&['round','purchase','hurt'].includes(event);
 if(id==='discount')return ['fanfare','hurt'].includes(event);
 if(id==='recruit')return star>=2&&(['fanfare','last'].includes(event)||star>=4&&event==='prepare'||star>=5&&['round','purchase','hurt'].includes(event));
 if(id==='shopGrowth')return star>=4&&['fanfare','prepare','purchase'].includes(event);
 if(id==='inherit')return star>=6&&event==='enter';
 if(id==='amplify')return star>=6&&event==='aura';
 if(id==='summon')return ['fanfare','last','echo','prepare','start'].includes(event);
 if(id==='damage')return ['last','echo','start','attack','clash'].includes(event);
 return true;
}
function header(name){
 const r=rng('illusion-header|'+SEED_VERSION+'|'+name+'|follower');
 const cls=weighted(r,Data.classes.map(c=>[c.id,Data.cards.filter(x=>x.cls===c.id&&!x.token).length]));
 const ref=pick(r,Data.cards.filter(x=>x.cls===cls&&!x.token));
 return {kind:'follower',cls,star:ref.star};
}
function targetText(c,many,manual){
 const k=c.theme.target;
 if(k==='adjacent')return '与本随从相邻的随从';
 if(k==='tribes')return `自己的战场上每个兵种中的随机1个其他随从`;
 const filter=k==='ward'?'拥有【守护】的':k==='small'?'等级3或以下的':k==='evolved'?'进化后的':`${race(c.cls)}·`;
 return `自己的战场上的${many?'其他所有':manual?'1个其他':'随机1个其他'}${filter}随从`;
}
function atom(c,event,id,r){
 const star=c.star,frequency=EVENT[event].frequency;
 const rules=TIER_RULES[star],group=id==='buff'&&star>=3&&r()<(star>=5?.7:.38);
 // Unconditional Fanfare self-stats merely hide part of the printed body.
 // Keep self-growth for meaningful repeatable or combat triggers instead.
 const self=id==='buff'&&!group&&(star<=2||r()<.38)&&!['last','fanfare'].includes(event)&&!['adjacent','tribes'].includes(c.theme.target);
 const threshold=event==='echo'?pick(r,[2,3,4]):2;
 const magnitude=id==='buff'?(group?rules.group:rules.single):clamp(star,1,6);
 const p={id,event,threshold,magnitude,group,self,target:targetText(c,group,EVENT[event].manual),a:magnitude,b:pick(r,[0,Math.max(1,magnitude-1),magnitude,magnitude+1]),frequency};
 if(id==='buff'&&star<=2)p.b=star===1&&self?0:pick(r,[0,1]);
 if(id==='buff'&&star<=4&&group&&frequency>=2)p.b=pick(r,[0,0,1]);
 if(id==='summon'){
   const pool=TOKENS[c.cls]||TOKENS.forest;
   // No partner-dependent maid as an isolated reward; no expensive dragons in low tiers.
   p.token=pick(r,pool.filter(t=>t.name!=='安静的女仆·诺嘉'&&t.minSourceTier<=star));
   const bonus=p.token.pre.length?1:0;
   p.count=clamp(Math.floor((star+(event==='last'?1:0))/(p.token.star+bonus+1)),1,3);
   if(event==='prepare'||event==='echo')p.count=Math.min(p.count,2);
   if(star<=2)p.count=1;
   if(star>=5){p.inherit=pick(r,['attack','health']);p.inheritFraction=star===5?.5:1;}
 }
 if(id==='damage'){p.damage=clamp(star+(event==='last'?1:0)-(frequency>2?1:0),1,7);p.area=star>=4&&r()<.27;if(p.area)p.damage=Math.max(1,Math.floor(p.damage/2));}
 if(id==='grant')p.keyword=star>=5&&c.cls==='nightmare'&&r()<.3?'毁灭':star>=5&&['shield','royalFormation'].includes(c.theme.id)?'屏障':c.cls==='nightmare'||star>=4?pick(r,['守护','2连打']):'守护';
 if(id==='grant'&&star>=5&&p.keyword==='守护')p.extraKeyword='屏障';
 if(id==='recruit'){p.maxTier=star>=5?star:Math.min(star-1,3);p.count=star===6?2:1;}
 if(id==='legacy'){p.a=star>=5?pick(r,[2,3]):1;p.b=star<=3?0:pick(r,[1,2]);}
 if(id==='wound'){p.a=star>=5?2:1;p.b=p.a+1;}
 if(id==='revive'){p.transfer=pick(r,['attack','health']);p.bothStats=star>=6;}
 if(id==='bequeath')p.token=(TOKENS[c.cls]||TOKENS.forest)[0];
 if(id==='shopGrowth'){p.a=star>=5?3:2;p.b=pick(r,[p.a-1,p.a]);}
 if(id==='inherit')p.transfer=pick(r,['attack','health']);
 if(id==='amplify')p.amplifies=['royalFanfare','royalFormation'].includes(c.theme.id)?pick(r,['入场曲','备战']):['forestLegacy','forestEcho','death','resurrection'].includes(c.theme.id)?'谢幕曲':'备战';
 if(star>=4&&id==='buff'&&r()<(star>=5?.65:.18))p.scaling=pick(r,c.cls==='royal'?['allies','preparations']:c.cls==='forest'||c.theme.id==='evolution'?['evolutions','allies']:['entries','allies']);
 if(star>=5&&id==='damage')p.damageScaling=c.cls==='forest'?'evolutions':'attack';
 if(star>=5&&id==='damage'&&event==='last')p.area=true;
 if(star>=6&&id==='buff'&&event==='fanfare'&&!group){p.group=true;p.self=false;p.target=targetText(c,true,false);p.a=rules.group;p.b=rules.group;p.scaling=p.scaling||'allies';}
 return p;
}
function atomValue(p){
 const values={buff:(p.a+p.b+(p.scaling?3:0))*(p.group?3:1)*(p.self?.9:1),summon:p.token?(p.token.attack+p.token.health+p.token.pre.length*1.8+(p.inherit?6:0))*p.count:0,damage:((p.damage||0)+(p.damageScaling?4:0))*(p.area?2.5:1),grant:(p.keyword==='毁灭'?9:p.keyword==='屏障'?5:3)+(p.extraKeyword?5:0),recruit:3*p.count+p.maxTier,discount:2,coin:3,legacy:(p.a+p.b)*4,wound:(p.a+p.b-1)*2.5,revive:p.bothStats?12:6,bequeath:14,evolve:6,shopGrowth:(p.a+p.b)*3,inherit:18,amplify:32};
 return values[p.id]*p.frequency;
}
function summonReward(token,count,evolved){
 // Entering evolved is not an upgrade for a token that evolves on entry.
 // Use the quantity route for it, just as for the small vanilla tokens.
 const evolvedToken=evolved&&token.star>=2&&!token.autoEvolve;
 return `召唤${evolved&&!evolvedToken?Math.min(6,count*2):count}个${evolvedToken?'进化后的':''}『${token.name}』`;
}
function ability(p,c,evolved=false){
 const m=evolved?2:1;
 let label=EVENT[p.event].label.replace('{threshold}',p.threshold).replace('{race}',race(c.cls));
 if(evolved&&p.event==='fanfare')label='【三连进化入场曲】';
 const target=p.self?'本随从':p.target;
 let text='';
 const countSource={evolutions:'本局游戏中自己的随从进化次数的一半（向下取整）',allies:`自己的战场上的其他${race(c.cls)}·随从数量`,preparations:'自己的战场上拥有【备战】的随从数量',entries:`本局游戏中进入自己的战场的${race(c.cls)}·随从数量的四分之一（向下取整）`};
 switch(p.id){
 case 'buff':text=p.scaling?`${p.self?'':'使'}${target}+X/+${p.b*m}。X为${p.a*m}加上「${countSource[p.scaling]}」${evolved?'的2倍':''}。`:`${p.self?'':'使'}${target}+${p.a*m}/+${p.b*m}。`;break;
 case 'summon':text=summonReward(p.token,p.count,evolved)+'。';if(p.inherit){const stat=p.inherit==='attack'?'攻击力':'生命值',factor=p.inheritFraction*m;text+=`使这些随从的${stat}变为本随从的${stat}${factor===.5?'的一半（向下取整）':factor===2?'的2倍':''}。`;}break;
 case 'damage':text=`对${p.area?'对手的战场上的所有随从':'对手的战场上的随机1个随从'}造成${p.damageScaling?'X':p.damage*m}点伤害。`;if(p.damageScaling)text+=`X为${p.damage*m}加上${p.damageScaling==='attack'?'本随从的攻击力':'本局游戏中自己的随从进化次数'}${evolved?'的2倍':''}。`;break;
 case 'grant':text=`使${p.target}获得【${p.keyword}】${p.extraKeyword?`和【${p.extraKeyword}】`:''}。${evolved?`使其+${Math.max(1,c.star-2)}/+${Math.max(1,c.star-2)}。`:''}`;break;
 case 'recruit':text=`将随机${m*p.count}张等级${p.maxTier}或以下的${race(c.cls)}·随从加入手牌。`;break;
 case 'discount':text=`使自己提升等级所需的幻境金币-${m}。`;break;
 case 'coin':text=`获得${m}幻境金币。`;break;
 case 'legacy':text=`本局游戏中，自己的${c.theme.target==='small'?'等级3或以下的':race(c.cls)+'·'}随从进入战场时，使其+${p.a*m}/+${p.b*m}。`;break;
 case 'wound':text=`使自己的战场上的其他龙族·随从+${p.a*m}/+${p.b*m}。对其造成${m}点伤害。`;break;
 case 'revive':text=`召唤1个${evolved?'进化后的':''}与本随从同名的随从，使其失去【谢幕曲】，并使其${p.bothStats?'攻击力与生命值分别':p.transfer==='attack'?'攻击力':'生命值'}变为本随从的${p.bothStats?'攻击力与生命值':p.transfer==='attack'?'攻击力':'生命值'}。`;break;
 case 'bequeath':text=`使自己的战场上的其他${race(c.cls)}·随从获得「【谢幕曲】${summonReward(p.token,1,evolved)}」。`;break;
 case 'evolve':text=`使自己的战场上的随机${m}个等级${Math.min(3,c.star-2)}或以下的随从进化。`;break;
 case 'shopGrowth':text=`使幻境中的所有${c.theme.target==='tribes'?'':race(c.cls)+'·'}随从+${p.a*m}/+${p.b*m}。`;break;
 case 'inherit':text=`使其${p.transfer==='attack'?'攻击力':'生命值'}+X。X为本随从的${p.transfer==='attack'?'攻击力':'生命值'}${evolved?'':'的一半（向下取整）'}。`;break;
 case 'amplify':text=`自己的其他随从的【${p.amplifies}】能力额外发动${m}次。（同名能力不重复叠加）`;break;
 }
 if(ECONOMIC.has(p.id)&&p.event==='hurt')label+=`自己的每回合可触发${m}次，`;
 // Prepare-phase targets can be chosen; automatic/combat effects always resolve themselves.
 if(EVENT[p.event].manual&&!p.self&&['buff','grant'].includes(p.id)&&!p.group&&!['adjacent','tribes'].includes(c.theme.target))text=text.replace('使'+p.target,'选择'+p.target+'，使其');
 return label+text;
}
function superEvolutionPlan(c,r){
 const options=[],ids=c.atoms.map(p=>p.id),tribe=race(c.cls),n=c.star>=5?3:2;
 const add=(id,parts,tokens=[])=>options.push({id,parts,tokens,text:'【超进化时】'+parts.map(p=>p.text).join('')});
 // These unlock a persistent engine or a battle-changing payoff. They reuse
 // the card's theme and actual token, rather than attaching an unrelated bonus.
 if(c.theme.id==='shield'||c.theme.id==='royalFormation')add('barrierFormation',[
  {id:'grantBarrier',text:'使自己的战场上的所有皇家·随从获得【屏障】。'},
  {id:'battleBarrier',text:'获得「【开战时】使与本随从相邻的随从获得【屏障】」。'}
 ]);
 if(c.theme.id==='dragonWound')add('woundEngine',[
  {id:'woundGrowth',text:`获得「【备战】使自己的战场上的所有龙族·随从+${c.star}/+${c.star+2}。对其造成1点伤害」。`}
 ]);
 if(['dragonEconomy','dragonPurchase'].includes(c.theme.id))add('dragonSupply',[
  {id:'supply',text:`将随机${n}张等级不高于当前幻境等级的龙族·随从加入手牌。`},
  {id:'roundSupply',text:'获得「【回合开始时】将随机2张等级不高于当前幻境等级的龙族·随从加入手牌」。'}
 ]);
 if(['evolution','forestEvolution'].includes(c.theme.id))add('evolutionChain',[
  {id:'evolve',text:`使自己的战场上的随机${n}个等级3或以下的进化前随从进化。`},
  {id:'prepareEvolve',text:'获得「【备战】使自己的战场上的随机2个等级3或以下的进化前随从进化」。'}
 ]);
 const summon=c.atoms.find(p=>p.id==='summon');
 if(summon){
  const token=summon.token,share=pick(r,['攻击力','生命值']),event=pick(r,['last','echo']);
  add('inheritedArmy',[
   {id:'summonInheritance',event,token:token.name,share,text:`获得「${event==='last'?'【谢幕曲】':'【残响_2】'}召唤${n}个${token.autoEvolve?'':'进化后的'}『${token.name}』，使这些随从的${share}变为本随从的${share}」。`}
  ],[token]);
 }
 const damage=c.atoms.find(p=>p.id==='damage');
 if(damage){
  const event=damage.event==='clash'?'attack':damage.event;
  const label=EVENT[event].label.replace('{threshold}','2');
  add('scalingBarrage',[
   {id:'areaDamage',event,scale:'attack',text:`获得「${label}对对手的战场上的所有随从造成X点伤害。X为本随从的攻击力」。`}
  ]);
 }
 if(c.theme.id==='nightmareAttack')add('destructionAssault',[
  {id:'grantDestruction',text:`使自己的战场上的随机${n}个其他梦魇·随从获得【毁灭】。`},
  {id:'doubleAttack',text:'本随从获得【2连打】。'}
 ]);
 if(['death','resurrection','forestLegacy'].includes(c.theme.id))add('revivalFormation',[
  {id:'grantRevival',text:`获得「【开战时】使自己的战场上的其他${tribe}·随从获得『【谢幕曲】召唤1个与本随从同名的进化后随从，使其失去【谢幕曲】』」。`}
 ]);
 // A numerical route is deliberately a large formation-wide engine. Even a
 // three-star host spends a scarce super-evolution opportunity to unlock it.
 if(ids.some(id=>['buff','grant','legacy','bequeath'].includes(id))||!options.length){
  const a=c.star+pick(r,[1,2]),b=c.star+pick(r,[1,2]);
  add('formationGrowth',[{id:'groupGrowth',attack:a,health:b,target:c.theme.target,
   text:`获得「【备战】使${targetText(c,true,false)}+${a}/+${b}」。`}]);
 }
 return pick(r,options);
}
function generateFollower(name){
 const c={...header(name),name,version:VERSION};const r=rng('illusion-card|'+SEED_VERSION+'|'+name);
 const peers=Data.cards.filter(x=>!x.token&&x.cls===c.cls&&x.star===c.star);
 c.theme=weighted(r,themes.filter(t=>t.cls.includes(c.cls)&&c.star>=t.min).map(t=>[t,themeWeight(t,peers)]));
 const choices=c.theme.events.flatMap(event=>c.star>=EVENT[event].min?c.theme.effects.filter(id=>legalEffect(id,event,c.star)).map(id=>({event,id})):[]);
 if(c.star>=4&&['dragonEconomy','dragonPurchase','menagerie'].includes(c.theme.id))choices.push({event:'prepare',id:'shopGrowth'});
 if(c.star>=6&&['swarm','forestEvolution','death','dragonWound'].includes(c.theme.id))choices.push({event:'enter',id:'inherit'});
 if(c.star>=6&&!['dragonEconomy','dragonPurchase','nightmareAttack'].includes(c.theme.id))choices.push({event:'aura',id:'amplify'});
 // Upgrade discounts are early economy, not a six-star card's main payoff.
 const fitting=choices.filter(x=>c.star<5||!['discount','coin'].includes(x.id));
 const first=weighted(r,fitting.map(x=>[x,c.star>=5&&['inherit','amplify','shopGrowth','bequeath','evolve'].includes(x.id)?3:1]));c.atoms=[atom(c,first.event,first.id,r)];
 const needSupply=(first.id==='buff'&&['enter','death','echo'].includes(first.event))||c.theme.id==='forestLegacy';
 if(c.star>=3&&needSupply&&TOKENS[c.cls])c.atoms.push(atom(c,pick(r,['fanfare','last']),'summon',r));
 else if(c.star>=4&&c.theme.id==='dragonWound'&&first.event==='hurt'&&r()<.65)c.atoms.push(atom(c,'start','wound',r));
 else if(c.star>=3&&first.id==='summon'&&r()<.55)c.atoms.push(atom(c,'enter','buff',r));
 else if(c.star>=4&&r()<.35){const next=choices.filter(x=>x.id!==first.id&&x.event!==first.event&&!ECONOMIC.has(x.id));if(next.length){const x=pick(r,next);c.atoms.push(atom(c,x.event,x.id,r));}}
 c.keywords=[];
 if(c.theme.id==='ward'||(c.theme.id==='shield'&&r()<.68))c.keywords.push(c.theme.id==='ward'?'守护':'屏障');
 else if(r()<(c.cls==='nightmare'?.23:.13))c.keywords.push('守护');
 if(c.star>=4&&first.event==='attack'&&r()<.25)c.keywords.push('2连打');
 // Empirical base bodies from the preview corpus; high tiers are engines, not mana costs.
 const ref=pick(r,peers);let total=ref.attack+ref.health;
 const value=c.atoms.reduce((s,p)=>s+atomValue(p),0)+(c.keywords.includes('屏障')?3:0);
 const allowance=[0,4,8,18,32,64,100][c.star];
 // Tavern access, rather than mana paid on play, gates the strong engines.
 // Don't erase a high-tier engine's body to fit a constructed-style budget.
 const bodyPenalty=Math.min(c.star>=5?2:3,Math.max(0,Math.round((value-allowance)/6)));
 total=clamp(total+pick(r,[-1,0,0,1])-bodyPenalty,c.star<=2?2:Math.max(4,c.star),Math.max(c.star*2+2,ref.attack+ref.health));
 let attack=clamp(Math.round(total*pick(r,[.36,.44,.5,.5,.58,.64])),1,total-1);
 if(c.star<=3&&first.id==='recruit'&&r()<.15)attack=0;
 c.attack=attack;c.health=total-attack;
 c.pre=[...c.keywords.map(k=>`【${k}】`),...c.atoms.map(p=>ability(p,c))];
 c.post=[...c.keywords.map(k=>`【${k}】`),...c.atoms.map(p=>ability(p,c,true))];
 c.evolution=[];c.superEvolution=[];
 const fan=c.atoms.find(p=>p.event==='fanfare');
 if(fan&&r()<.32)c.evolution.push('【进化时】发动与【入场曲】相同的能力。');
 else if(c.star>=3&&r()<.23){const support=atom(c,'fanfare',TOKENS[c.cls]?'summon':'buff',r);support.self=false;c.evolution.push(ability(support,c).replace('【入场曲】','【进化时】'));c.atomsSupport=[support];}
 if(r()<TIER_RULES[c.star].superChance){
   c.superEvolutionDesign=superEvolutionPlan(c,r);
   c.superEvolution.push(c.superEvolutionDesign.text);
 }
 c.tokens=[...new Map([...c.atoms,...(c.atomsSupport||[])].filter(p=>p.token).map(p=>[p.token.name,{...p.token,cls:c.cls}]).concat((c.superEvolutionDesign?.tokens||[]).map(t=>[t.name,{...t,cls:c.cls}]))).values()];
 c.design={theme:c.theme.id,tierRole:TIER_RULES[c.star].role,estimatedEngineValue:Math.round(value*10)/10,referenceTier:c.star,referenceCards:peers.map(x=>x.name)};
 delete c.theme;return c;
}
function generate(name){name=String(name||'设计师您辛苦了').trim().normalize('NFC').slice(0,48);return generateFollower(name);}
function matches(h,filters){return (!filters.cls||h.cls===filters.cls)&&(!filters.star||h.star===Number(filters.star));}
function toText(c){
 let text=`${c.name}\n影之幻境 · ${CLASS[c.cls].name} · ${c.star}星 · ${c.attack}/${c.health}\n\n进化前技能\n${c.pre.join('\n')}\n\n进化后技能\n${c.post.join('\n')}`;
 if(c.evolution?.length)text+='\n\n'+c.evolution.join('\n');if(c.superEvolution?.length)text+='\n\n'+c.superEvolution.join('\n');
 for(const t of c.tokens)text+=`\n\n${t.name} · 衍生物 · ${t.star}星 · ${t.attack}/${t.health}\n进化前：${t.pre.join(' ')||'无能力'}\n进化后：${t.post.join(' ')||'无能力'}`;
 return text;
}
return {VERSION,Data,header,generate,matches,toText,themes,events:EVENT,tierRules:TIER_RULES};
});
