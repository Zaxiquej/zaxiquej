(function(root){
'use strict';
const D=root.TavernData||(typeof require!=='undefined'?require('./data.js'):null);
const S=root.TavernScaling||(typeof require!=='undefined'?require('./scaling.js'):null);
const copy=x=>JSON.parse(JSON.stringify(x));
// Compatibility cleanup keeps existing stats, including buffs from older saves.
function normalize(s){
 if(!s.expeditionRulesVersion){for(const p of [s,...s.opponents||[]])for(const c of [...p.board||[],...p.hand||[],...p.shop||[]]){if(c.id==='rune3'&&!S.shieldCount(c))S.addShield(c);if(c.id==='neutral10')c.keywords=c.keywords.filter(k=>k!=='destruction');}s.expeditionRulesVersion=1;}
 s.difficulty='hard';const previousMax=s.maxHp||30;for(const p of [s,...s.opponents||[]]){const oldMax=p.maxHp||previousMax;if(p.hp>0)p.hp=Math.min(40,p.hp+Math.max(0,40-oldMax));p.maxHp=40;}
 for(const o of s.opponents||[]){const h=D.heroes.find(h=>h.id===o.hero);if(h)o.name=h.name;}
 s.armor=s.armor??0;for(const o of s.opponents||[])o.armor=o.armor??0;
 s.trinkets=[];s.discover=s.discover.filter(q=>q.type!=='trinket');for(const o of s.opponents||[]){if(o.trinkets)o.trinkets=[];if(o.discover)o.discover=o.discover.filter(q=>q.type!=='trinket');}
 for(const p of [s,...s.opponents||[]])if(p.stats)p.stats.discards=p.stats.discards||0;
 s.pendingGold=s.pendingGold||0;s.pendingFairies=s.pendingFairies||0;
 s.shop=s.shop.filter(c=>!def(c).retired);
 for(const p of [s,...s.opponents||[]]){if(p.shop)p.shop=p.shop.filter(c=>!def(c).retired);S.syncShieldAura(p.board||[]);}
 for(const p of [s,...s.opponents||[]])for(const c of [...p.board||[],...p.hand||[],...p.shop||[]])if(['haven16','artifact19'].includes(c.id)&&!c.guardRemoved&&!c.keywords.includes('taunt'))c.keywords.push('taunt');

 for(const p of [s,...s.opponents||[]])for(const c of [...p.board||[],...p.hand||[],...p.shop||[]]){if(!s.barrierRulesVersion&&c.id==='royal2'&&!c.keywords.includes('shield'))S.addShield(c);if(c.keywords.includes('shield'))c.shieldLayers=S.shieldCount(c);else if(c.shieldLayers!==undefined)c.shieldLayers=0;}s.barrierRulesVersion=1;
 s.progress=Object.assign(s.progress||{},S.read(s));for(const o of s.opponents||[])o.progress=S.read(o);
 delete s.evo;if(s.stats)delete s.stats.evolutions;
 const clean=cards=>{if(Array.isArray(cards))for(const c of cards)if(c&&typeof c==='object')delete c.evolved;};
 for(const key of ['board','hand','shop','amulets'])clean(s[key]);
 for(const o of s.opponents||[])clean(o.board);
 for(const event of s.result?.events||[])for(const board of event.boards||[])clean(board);
 if(Array.isArray(s.result?.survivors))s.result.survivors.forEach(clean);
 return s;
}
function rand(s){let x=s.seed|0;x^=x<<13;x^=x>>>17;x^=x<<5;s.seed=x>>>0;return s.seed/4294967296;}
const pick=(s,a)=>a.length?a[Math.floor(rand(s)*a.length)]:null;
function sample(s,a,n){const pool=[...a],out=[];while(pool.length&&out.length<n){out.push(pool.splice(Math.floor(rand(s)*pool.length),1)[0]);}return out;}
function rollTribes(seed){return sample({seed:(seed>>>0)||12345},D.tribeIds,4);}
function heroAvailable(h,tribes){return h.tribe==='neutral'||tribes.includes(h.tribe);}
function rollHeroes(seed,tribes=rollTribes(seed)){return sample({seed:((seed^0x6d2b79f5)>>>0)||12345},D.heroes.filter(h=>heroAvailable(h,tribes)),4).map(h=>h.id);}
function heroDamage(player,amount){const armorDamage=Math.min(player.armor||0,amount);player.armor=(player.armor||0)-armorDamage;player.hp-=amount-armorDamage;return {armor:armorDamage,health:amount-armorDamage};}
function activeTribes(s){return s?.activeTribes||D.tribeIds.slice(0,6);}
function available(s,c){const tribe=c.poolTribe||c.tribe;return !c.retired&&(c.poolTribes?c.poolTribes.some(t=>activeTribes(s).includes(t)):tribe==='neutral'||activeTribes(s).includes(tribe));}
function eligiblePool(s,list){return list.filter(c=>available(s,c));}
function selfHarm(s,n){const immune=S.selfHarmImmune(s),lost=immune?n:Math.min(Math.max(0,s.hp-1),n);if(!lost||s.hp<=0)return 0;if(!immune)s.hp-=lost;s.bloodDamage=(s.bloodDamage||0)+lost;for(const c of s.board){const m=mul(c);if(c.id==='blood1')buff(s,c,D.tuning.bloodStarter*m,D.tuning.bloodStarter*m);if(c.id==='blood4')s.board.filter(x=>D.isTribe(x,'blood')).forEach(x=>{const n=2*m;buff(s,x,n,n);});}synergies(s,'hurt');log(s,(immune?'自伤免伤 ':'自伤 ')+lost+' · 本局累计自伤 '+s.bloodDamage);return lost;}
const def=c=>D.byId[c.id];
const heroDef=s=>D.heroes.find(h=>h.id===s.hero);
const mul=c=>c.golden?2:1;
function spend(s,n,alreadyPaid=false){if(!alreadyPaid)s.gold-=n;if(n<=0)return;for(const c of s.board.filter(c=>c.id==='forest11')){const total=(c.spentGold||0)+n,times=Math.floor(total/D.fairySpendCost);c.spentGold=total%D.fairySpendCost;if(times){s.pendingFairies=(s.pendingFairies||0)+times*mul(c);log(s,def(c).name+' · 下回合预存 '+(times*mul(c))+' 张妖精。');}}}

function log(s,text){s.log.unshift(text);s.log=s.log.slice(0,60);}
function buff(s,c,a,h,react=true){if(!c)return;if(s&&(a>0||h>0)){s.progress=s.progress||S.read();s.progress.buffs=(s.progress.buffs||0)+1;}c.attack=Math.max(0,c.attack+a);c.health=Math.max(1,c.health+h);if(react&&s&&(a>0||h>0)&&s.board.some(x=>x.uid===c.uid)){for(const x of [...s.board]){if(x.uid!==c.uid&&def(x).effect==='buffWitness')buff(s,x,0,mul(x),false);if(x.uid===c.uid&&def(x).effect==='buffConductor')for(const y of [...s.board])if(y.uid!==x.uid)buff(s,y,mul(x),mul(x),false);}}}

function neighbors(board,c){const i=board.findIndex(x=>x.uid===c.uid);return i<0?[]:[board[i-1],board[i+1]].filter(Boolean);}
function shield(c,s){if(s)S.syncShieldAura(s.board);S.addShield(c);}
function make(s,id,extra={}){const d=D.byId[id];if(!d)throw Error('Unknown card '+id);return {id,uid:++s.uid,attack:d.attack||0,health:d.health||0,keywords:[...(d.keywords||[])],...(d.initialShields?{shieldLayers:d.initialShields*(extra.golden?2:1)}:{}),golden:false,...extra};}
function give(s,c){if(s.hand.length>=10){log(s,'手牌已满：'+def(c).name+' 未能加入。');return false;}s.hand.push(c);triples(s);return true;}
function mining(s,n){s.progress=S.read(s);const before=S.goldCap(s);s.progress.mining+=n;log(s,'采掘 +'+n+' · 累计 '+s.progress.mining+' · 基础金币上限 '+S.goldCap(s)+(S.goldCap(s)>before?'（下回合起增加收入）':''));}
function recruitSummon(s,c){if(c.id==='fairy'){for(const x of [...s.board]){if(x.id==='forest2'){s.progress=S.read(s);s.progress.fairy+=mul(x);}if(def(x).effect==='fairyRally')neighbors(s.board,x).forEach(y=>buff(s,y,2*mul(x),2*mul(x)));}}}
function targetCards(s,q){const list=q.kind==='feast'?s.shop.filter(c=>def(c).type==='minion'):q.kind==='health'?s.board:s.hand.filter(c=>def(c).type==='minion'&&!c.golden&&eligiblePool(s,D.cards).some(d=>d.tier===def(c).tier&&d.id!==c.id));return list.filter(c=>q.options.includes(String(c.uid)));}
function queueTarget(s,kind,source,scale=1){const share=kind==='feast'&&source&&def(source).effect==='chosenFeast';if(share&&!s.board.some(c=>c.uid!==source.uid))return;const list=kind==='feast'?s.shop.filter(c=>def(c).type==='minion'):kind==='health'?s.board:s.hand.filter(c=>def(c).type==='minion'&&!c.golden&&eligiblePool(s,D.cards).some(d=>d.tier===def(c).tier&&d.id!==c.id));if(!list.length)return;const titles={feast:'选择吞噬的商店随从',health:'选择生命转攻击的随从',shift:'选择重构的手牌随从'};s.discover.push({type:'targetChoice',source:'ability',kind,owner:source?.uid||null,card:source?.id||null,hero:source?null:s.hero,scale,title:titles[kind],text:kind==='feast'?(share?'自伤 2，使随机一名其他友方吞噬所选随从，永久获得其 '+scale+' 倍攻击与生命。':'自伤 2，吞噬所选随从并获得其属性。'):kind==='health'?'攻击永久提高至至少生命值的 '+scale+' 倍。':'变为同星级的另一随从，保留附加攻击与生命。',options:list.map(c=>String(c.uid))});}
function heroPool(s,id){if(id==='ceres')return eligiblePool(s,D.cards).filter(d=>d.tier<=s.tier&&D.abilityIds.lastWords.includes(d.id));if(id==='windgod')return [...new Set((s.opponents.find(o=>o.id===s.lastOpponent)?.board||[]).filter(c=>!def(c).token&&def(c).tier<=s.tier&&available(s,def(c))).map(c=>c.id))].map(id=>D.byId[id]);return [];}
function removeShield(s,c){c.shieldLayers=S.shieldCount(c)-1;if(!c.shieldLayers)c.keywords=c.keywords.filter(k=>k!=='shield');if(c.id==='royal0')buff(s,c,mul(c),mul(c));for(const x of [...s.board]){const e=def(x).effect,m=mul(x);if(x.id==='royal6'){const n=S.growthAmount(s,'shieldBuff')*m;s.board.filter(y=>D.isTribe(y,'royal')).forEach(y=>buff(s,y,n,n));}if(e==='shieldMentor'&&x.uid!==c.uid)buff(s,c,2*m,2*m);if(e==='shieldResearch')s.progress.spellcraft+=2*m;if(x.id==='neutral3')neighbors(s.board,c).forEach(y=>buff(s,y,2*m,2*m));}}
function chosenFeast(s,c,food,m,share=false){if(!c||!food||!s.shop.includes(food)||(s.hp<=1&&!S.selfHarmImmune(s)))return;const target=share?pick(s,s.board.filter(x=>x.uid!==c.uid)):c;if(!target||!selfHarm(s,2))return;s.shop.splice(s.shop.indexOf(food),1);buff(s,target,food.attack*m,food.health*m);synergies(s,'feast',food);const text=(share?def(c).name+' 使 ':'')+def(target).name+' 吞噬 '+def(food).name+'，永久 +'+food.attack*m+'/+'+food.health*m+'。';log(s,text);(s.feasts||(s.feasts=[])).push({text,source:c.uid,targets:[target.uid],food:{id:food.id,uid:food.uid,attack:food.attack,health:food.health}});}
function refreshTargetQueues(s){s.discover=s.discover.filter(q=>{if(q.type!=='targetChoice')return true;q.options=targetCards(s,q).map(c=>String(c.uid));return q.options.length&&(q.kind!=='feast'||(s.hp>1||S.selfHarmImmune(s))&&(q.owner?s.board.some(c=>c.uid===q.owner)&&(D.byId[q.card]?.effect!=='chosenFeast'||s.board.some(c=>c.uid!==q.owner)):s.board.length));});}
function departureReward(s,c,discard=false){const m=mul(c)*(discard?2:1),e=def(c).effect;
 if(e==='discardWing')for(let n=0;n<m;n++)give(s,make(s,'dragonWing'));
 if(e==='discardMarket')growTavern(s,2*m,2*m);
}
function discardCard(s,uid){
 const i=s.hand.findIndex(c=>c.uid===uid);if(i<0)return false;
 const c=s.hand.splice(i,1)[0];s.stats.discards=(s.stats.discards||0)+1;
 departureReward(s,c,true);
 if(def(c).effect==='discardScrap')s.scrap=(s.scrap||0)+3*mul(c);
 for(const x of [...s.board])if(def(x).effect==='discardRally'){const n=S.growthAmount(s,'discardRally')*mul(x);s.board.filter(y=>D.isTribe(y,'dragon')).forEach(y=>buff(s,y,n,n+mul(x)));}
 for(const a of s.amulets)if(def(a).effect==='discardRite')growTavern(s,1,1);
 refreshTargetQueues(s);log(s,'弃牌：'+def(c).name+'。');return true;
}
function queueMode(s,d,scale=1){s.discover.push({type:'mode',source:'ability',card:d.id,scale,title:d.name+' · 抉择',text:'选择一种效果。每次抉择只结算所选项。',options:d.modes.map(m=>m.id)});}
function modeOptions(s,q){return D.byId[q.card].modes.filter(m=>q.options.includes(m.id)).map(m=>{const scale=q.scale,amp=m.spellAmp?S.spell(s):0,attack=(m.attack||0)*scale+(m.attack?amp:0),health=(m.health||0)*scale+(m.health?amp:0),count=(m.count||0)*scale;let text='';
 if(m.kind==='gift')text=`获得 ${count} 张${D.byId[m.card].name}。`;
 if(m.kind==='tribeBuff')text=`使所有友方${D.tribes[m.tribe].name}永久 ${attack?'+'+attack+'/+'+health:'+'+health+' 生命'}。`;
 if(m.kind==='tavern')text=`使本局当前与未来商店随从永久 +${attack}/+${health}。`;

 return {...m,attack,health,count,text};});}
function resolveMode(s,q,id){const m=modeOptions(s,q).find(m=>m.id===id);if(m.kind==='gift')for(let i=0;i<m.count;i++)give(s,make(s,m.card));if(m.kind==='tribeBuff')s.board.filter(c=>D.isTribe(c,m.tribe)).forEach(c=>buff(s,c,m.attack,m.health));if(m.kind==='tavern')growTavern(s,m.attack,m.health);log(s,D.byId[q.card].name+' · '+m.name+'：'+m.text);}
// A tavern bonus belongs to offers, never to general card creation or discoveries.
function boostOffers(s,a,h){for(const c of s.shop||[])if(def(c).type==='minion')buff(s,c,a,h);}
function growTavern(s,a,h){s.progress=Object.assign(s.progress||{},S.read(s));s.progress.tavernAttack+=a;s.progress.tavernHealth+=h;boostOffers(s,a,h);}
function offer(s,id){const c=make(s,id),b=S.tavern(s);if(def(c).type==='minion')buff(null,c,b.attack,b.health);return c;}
function settleProgress(s,p){const before=S.tavern(s);s.progress=copy(p);boostOffers(s,s.progress.tavernAttack-before.attack,s.progress.tavernHealth-before.health);}
function feastTarget(s,kind){const key=kind==='dragonFeast'?'health':'attack',other=key==='health'?'attack':'health';return [...(s.shop||[])].filter(c=>def(c).type==='minion').sort((a,b)=>b[key]-a[key]||b[other]-a[other]||a.uid-b.uid)[0];}
function feast(s,c){const e=def(c).effect,targets=e==='dragonFeast'?neighbors(s.board,c).filter(x=>D.isTribe(x,'dragon')):[c];if(!targets.length||!feastTarget(s,e))return;
 if(['bloodFeast','smallFeast'].includes(e)&&!selfHarm(s,e==='smallFeast'?1:2))return;const food=feastTarget(s,e);if(!food)return;const m=mul(c),a=(e==='smallFeast'?Math.ceil(food.attack/2):food.attack)*m,h=(e==='smallFeast'?Math.ceil(food.health/2):food.health)*m;s.shop.splice(s.shop.indexOf(food),1);for(const x of targets)buff(s,x,a,h);
 synergies(s,'feast',food);const text=def(c).name+' 吞噬 '+def(food).name+'（'+food.attack+'/'+food.health+'），'+targets.map(x=>def(x).name).join('、')+' 永久 +'+a+'/+'+h+'。';log(s,text);(s.feasts||(s.feasts=[])).push({text,source:c.uid,targets:targets.map(x=>x.uid),food:{id:food.id,uid:food.uid,attack:food.attack,health:food.health}});
}
function choices(s,tier){return sample(s,eligiblePool(s,D.cards).filter(c=>c.tier===Math.min(6,tier)),3).map(c=>c.id);}
function triples(s){
 if(s.deferTriples)return;S.syncShieldAura(s.board);
 for(const d of [...D.cards,...(D.retiredCards||[]),...D.tokens].filter(d=>d.type==='minion')){let matches=[...s.board,...s.hand].filter(c=>c.id===d.id&&!c.golden);while(matches.length>=3){
  const group=[...matches].sort((a,b)=>Number(s.hand.includes(b))-Number(s.hand.includes(a))).slice(0,3),ids=group.map(c=>c.uid);if(s.hand.length-group.filter(c=>s.hand.includes(c)).length>=10)break;
  s.board=s.board.filter(c=>!ids.includes(c.uid));s.hand=s.hand.filter(c=>!ids.includes(c.uid));
  const c=make(s,d.id,{golden:true,guardRemoved:group.some(x=>x.guardRemoved)&&!group.some(x=>x.keywords.includes('taunt')),activatedRound:Math.max(0,...group.map(x=>x.activatedRound||0)),attack:d.attack*2+group.reduce((n,x)=>n+x.attack-d.attack,0),health:d.health*2+group.reduce((n,x)=>n+x.health-d.health,0),shieldLayers:group.some(c=>S.canStackShield(c)||S.shieldCount(c)>1)?group.reduce((n,c)=>n+S.shieldCount(c),0):Math.max(...group.map(S.shieldCount)),heroWindfury:group.some(x=>x.heroWindfury),heroReborn:group.some(x=>x.heroReborn),dragonPings:group.reduce((n,x)=>n+(x.dragonPings||0),0),keywords:[...new Set(group.flatMap(x=>x.keywords))]});
  s.hand.push(c);S.syncShieldAura(s.board);
  s.discover.push({type:'minion',title:'三连奖励',text:'金色随从已收回手牌，保留附加增益。发现一个高 1 星的随从。',options:choices(s,s.tier+1)});
  log(s,'三连！'+d.name+' 化为金色。');matches=[...s.board,...s.hand].filter(c=>c.id===d.id&&!c.golden);
 }}
}
function prospect(s){if(!s.heroProspect)return;s.heroProspect=false;const d=pick(s,eligiblePool(s,D.cards).filter(d=>d.tier===Math.min(6,s.tier+1)));if(d)s.shop[0]=offer(s,d.id);}
function shop(s){const pool=eligiblePool(s,D.cards).filter(c=>c.tier<=s.tier);s.shop=[];for(let i=0;i<Math.min(6,3+Math.floor(s.tier/2));i++)s.shop.push(offer(s,pick(s,pool).id));s.shop.push(make(s,pick(s,eligiblePool(s,D.spells).filter(c=>c.tier<=s.tier)).id));s.shop.push(make(s,pick(s,eligiblePool(s,D.amulets).filter(c=>c.tier<=s.tier)).id));}
function upgradeCost(s){return s.tier>=6?0:Math.max(0,[0,5,7,8,9,10][s.tier]-s.discount);}
function startRound(s){
 s.phase='recruit';s.bloodImmunity=false;s.deferTriples=false;s.recruitEnded=false;s.feasts=[];triples(s);s.gold=Math.min(10,s.round+2)+S.goldCap(s)-10+(s.pendingGold||0);s.pendingGold=0;s.played=0;s.spellsThisRound=0;s.powerUsed=false;s.heroCry=false;s.heroProspect=false;s.heroSalvage=false;s.heroSpellCopy=false;s.constructsThisRound=[];s.discount++;for(const c of [...s.board,...s.hand]){delete c.heroWindfury;delete c.heroReborn;delete c.dragonPings;}
 if(!s.frozen)shop(s);else{s.frozen=false;while(s.shop.length<Math.min(6,3+Math.floor(s.tier/2))+2){s.shop.push(offer(s,pick(s,eligiblePool(s,D.cards).filter(c=>c.tier<=s.tier)).id));}}
 const alive=s.opponents.filter(o=>o.hp>0);let candidates=alive.filter(o=>o.id!==s.lastOpponent);if(!candidates.length)candidates=alive;s.opponent=pick(s,candidates)?.id;
 const fairies=s.pendingFairies||0;s.pendingFairies=0;let received=0;while(received<fairies&&give(s,make(s,'fairy')))received++;if(fairies)log(s,'消费预存发放：获得 '+received+' 张妖精。'+(received<fairies?'其余 '+(fairies-received)+' 张因手牌已满未能加入。':''));
 log(s,'第 '+s.round+' 回合 · 获得 '+s.gold+' 金币。');
}
function create(hero='forest',seed=Date.now(),difficulty='hard',tribes=null){
 const s={version:1,expeditionRulesVersion:1,barrierRulesVersion:1,seed:(seed>>>0)||12345,uid:0,hero,difficulty:'hard',phase:'recruit',round:1,hp:40,maxHp:40,tier:1,gold:3,discount:-1,grave:0,spells:0,played:0,board:[],hand:[],shop:[],amulets:[],trinkets:[],discover:[],log:[],frozen:false,powerUsed:false,wins:0,losses:0,opponents:[],lastOpponent:null,stats:{triples:0,spells:0,discards:0}};
 const leader=heroDef(s);if(!leader)throw Error('无效主战者。');const heroTribe=leader.tribe;
 s.activeTribes=tribes?[...tribes]:heroTribe==='neutral'?sample(s,D.tribeIds,4):[heroTribe,...sample(s,D.tribeIds.filter(t=>t!==heroTribe),3)];
 s.armor=leader.armor;
 if(s.activeTribes.length!==4||new Set(s.activeTribes).size!==4||!s.activeTribes.every(t=>D.tribeIds.includes(t))||!heroAvailable(leader,s.activeTribes))throw Error('每局需要四个有效种族，并包含所选主战者。');
 s.bloodDamage=0;s.scrap=0;s.progress=Object.assign(s.progress||{},S.read(s));
 const usedHeroes=new Set([hero]);
 for(let i=0;i<7;i++){const tribe=s.activeTribes[i%4],candidates=D.heroes.filter(h=>!usedHeroes.has(h.id)&&(h.tribe===tribe||h.tribe==='neutral')),h=pick(s,candidates);usedHeroes.add(h.id);s.opponents.push({id:i,name:h.name,tribe,hero:h.id,hp:40,maxHp:40,armor:h.armor,tier:1,board:[],grave:0,spells:0,bloodDamage:0,scrap:0,progress:S.read()});}
 startRound(s);return s;
}
function amuletEffect(s,a){
 const e=def(a).effect;if(e==='mine')mining(s,6);
 if(e==='temple')s.progress.devotion+=3;
 const amp=S.prayer(s),power=S.amuletPower(s,def(a)),boost=(c,a,h)=>buff(s,c,a?a+amp:0,h?h+amp:0),tribe=t=>s.board.filter(c=>D.isTribe(c,t));
 if(e==='bloodGarden'&&selfHarm(s,2)){s.board.forEach(c=>boost(c,3,3));give(s,make(s,'bat',{attack:D.byId.bat.attack+amp,health:D.byId.bat.health+amp}));}
 if(e==='accelerator'){for(let i=0;i<2;i++)give(s,make(s,'module'));s.board.filter(c=>D.isTribe(c,'artifact')).forEach(c=>boost(c,1,2));}
 if(e==='garden')s.board.forEach(c=>boost(c,D.isTribe(c,'forest')?3:2,D.isTribe(c,'forest')?3:2));
 if(e==='tomb'){s.grave+=6;give(s,make(s,'skeleton',{attack:3+amp,health:3+amp}));}
 if(e==='banner')s.board.forEach(c=>boost(c,3,3));
 if(e==='egg')growTavern(s,6+amp,6+amp);
 if(e==='library'){s.progress.spellcraft+=4;for(let i=0;i<2;i++)give(s,make(s,'mana'));}
 if(e==='bell')s.board.forEach(c=>boost(c,0,3));
 if(e==='temple')s.board.forEach(c=>boost(c,4,6));
 if(e==='hourglass')give(s,make(s,pick(s,eligiblePool(s,D.cards).filter(d=>d.tier===Math.min(6,s.tier+1))).id));
 if(e==='fairyGlade')for(let i=0;i<2;i++)give(s,make(s,'fairy',{attack:D.byId.fairy.attack+amp,health:D.byId.fairy.health+amp}));
 if(e==='fairyRealm')s.progress.fairy+=6;
 if(e==='frontline')for(const c of s.board)for(let i=0;i<2;i++)boost(c,1,2);
 if(e==='magicField')[...s.board].sort((a,b)=>a.attack-b.attack).slice(0,2).forEach(c=>boost(c,power,4+Math.floor(S.read(s).spellcraft/2)));
 if(e==='dragonCanyon'&&power)growTavern(s,power+amp,power+amp);
 if(e==='deathBanquet'){s.grave+=6;s.progress.legionAttack+=6;}
 if(e==='coinVault')for(let i=0;i<3;i++)give(s,make(s,'coin'));
 if(e==='boneRing')boost(s.board[0],power,power);
 if(e==='bloodMoon')for(let i=0;i<3;i++)if(selfHarm(s,1))boost([...s.board].sort((a,b)=>a.health-b.health)[0],0,4);
 if(e==='ancientAmplifier')tribe('artifact').forEach(c=>boost(c,power,power));
 if(e==='summit'){const c=s.board[0];if(c)boost(c,c.health,0);}
 if(e==='discardRite')give(s,make(s,'dragonResolve'));
}
function expire(s){const expired=s.amulets.filter(a=>a.count<=0);s.amulets=s.amulets.filter(a=>a.count>0);for(const a of expired){s.progress=Object.assign(s.progress||{},S.read(s));s.progress.prayers++;log(s,def(a).name+' 的倒数归零 · 护符共鸣 +'+S.prayer(s)+'。');amuletEffect(s,a);for(const x of [...s.board].filter(x=>def(x).effect==='prayerEcho'))for(let i=0;i<mul(x);i++)amuletEffect(s,a);synergies(s,'expire',a);for(const c of [...s.board]){const m=mul(c);if(c.id==='haven10'){const n=(6+S.prayer(s))*m;buff(s,[...s.board].sort((a,b)=>b.health-a.health)[0],n,2*n);};if(c.id==='haven5')for(let i=0;i<m;i++)give(s,make(s,a.id));}}}
function tick(s){s.amulets.forEach(a=>a.count--);expire(s);}
function playCount(s){s.progress=S.read(s);s.progress.totalPlayed++;s.played++;if(s.played%3===0){s.board.filter(c=>def(c).effect==='combo').forEach(c=>{const n=S.comboPower(s,c);buff(s,c,n,n);});for(const c of s.board.filter(c=>c.id==='forest4')){const n=S.comboPower(s,c);s.board.filter(x=>x.uid!==c.uid).forEach(x=>buff(s,x,n,n));}if(s.hero==='forest')s.board.forEach(c=>buff(s,c,1,1));synergies(s,'combo');}}
function battlecry(s,c){const e=def(c).effect,m=mul(c);
 if(e==='graveDiscovery'&&s.grave>=3){const pool=D.discoveryPool(s,def(c));if(pool.length){s.grave-=3;for(let i=0;i<m;i++)s.discover.push({type:'minion',source:'fanfare',card:c.id,title:'唤魂 · 发现谢幕曲',text:'选择不高于酒馆星级的谢幕曲随从。',options:sample(s,pool,3).map(d=>d.id)});}}
 if(e==='chosenFeast'&&(s.hp>1||S.selfHarmImmune(s)))queueTarget(s,'feast',c,m);
 if(e==='healthToAttack')queueTarget(s,'health',c,m);
 if(e==='constructCache')for(let i=0;i<m;i++)give(s,make(s,pick(s,D.constructCycle)));
 if(e==='discoverLowSpell'){const pool=D.discoveryPool(s,def(c));for(let i=0;i<m&&pool.length;i++)s.discover.push({type:'spell',source:'fanfare',card:c.id,title:'发现低星法术',text:'选择一张最高 2 星的酒馆法术。',options:sample(s,pool,3).map(d=>d.id)});}
 if(e==='modalCry')queueMode(s,def(c),m);
 if(e==='discoverHighSpell'){const pool=D.discoveryPool(s,def(c));for(let i=0;i<m&&pool.length;i++)s.discover.push({type:'spell',source:'fanfare',card:c.id,title:'发现高星法术',text:'选择一张 5～6 星酒馆法术加入手牌',options:sample(s,pool,3).map(d=>d.id)});}
 if(e==='discoverRoyal'){const pool=D.discoveryPool(s,def(c));for(let i=0;i<m&&pool.length;i++)s.discover.push({type:'minion',source:'fanfare',card:c.id,title:'发现皇家随从',text:'选择一个皇家随从 · 最高 '+s.tier+' 星',options:sample(s,pool,3).map(d=>d.id)});}
 s.progress=Object.assign(s.progress||{},S.read(s));
 if(e==='healthGift')buff(s,s.board.filter(x=>x.uid!==c.uid).sort((a,b)=>a.health-b.health)[0],0,6*m);
 if(e==='bloodShelter'&&selfHarm(s,1))s.board.filter(x=>x.uid!==c.uid).forEach(x=>buff(s,x,0,2*m));
 const bundle={coinGift:['coin',1],replicaGift:['bifurcatingArtifact',1],fairyGift:['fairy',1],skeletonGift:['skeleton',1],manaBundle:['mana',4],bellGift:['bell',1],pactGift:['bloodPact',1],analyzerGift:['analyzer',1],moduleBundle:['module',2]};
 if(bundle[e])for(let i=0;i<bundle[e][1]*m;i++)give(s,make(s,bundle[e][0]));
 if(e==='guardCry')neighbors(s.board,c).forEach(x=>buff(s,x,0,4*m));
 if(e==='royalStudy'||e==='studyCry')s.progress.spellcraft+=(e==='royalStudy'?2:1)*m;
 if(e==='shopCry')boostOffers(s,m,m);if(e==='tavernCry')growTavern(s,2*m,2*m);
 if(e==='graveSupply'&&s.grave>=3){s.grave-=3;for(let i=0;i<2*m;i++)give(s,make(s,'bones'));}
 if(e==='prayerCry')s.progress.devotion+=3*m;if(e==='scrapCry')s.scrap+=6*m;
 if(D.fanfareIds.includes(c.id))synergies(s,'cry',c);
 if(e==='fairySummon')for(let i=0;i<2*m&&s.board.length<7;i++){const fairy=make(s,'fairy');s.board.splice(s.board.indexOf(c)+1+i,0,fairy);S.syncShieldAura(s.board);recruitSummon(s,fairy);} 
 if(e==='ancientCombo')buff(s,c,s.played*3*m,s.played*3*m);
 if(e==='cavalryCry')neighbors(s.board,c).forEach(x=>buff(s,x,4*m,0));
 if(e==='salvageGift')s.scrap+=3*m;
 if(e==='spellBundle')for(let i=0;i<2*m;i++)give(s,make(s,pick(s,eligiblePool(s,D.spells).filter(x=>x.tier<=s.tier)).id));
 if(D.fanfareIds.includes(c.id))for(const x of s.board.filter(x=>x.id==='royal10'&&x.uid!==c.uid)){const n=S.growthAmount(s,'rallyCry')*mul(x);s.board.filter(y=>D.isTribe(y,'royal')).forEach(y=>buff(s,y,n,n));}
 if(e==='vitalityCry')neighbors(s.board,c).forEach(x=>buff(s,x,0,3*m));
 if(e==='clockCry')for(let i=0;i<m;i++)tick(s);
 if(e==='amuletGift'||e==='smallSpellGift'){const pool=eligiblePool(s,e==='amuletGift'?D.amulets:D.spells).filter(x=>x.tier<=(e==='amuletGift'?s.tier:Math.min(2,s.tier)));for(let i=0;i<m&&pool.length;i++)give(s,make(s,pick(s,pool).id));}
 if(e==='wingGift')for(let i=0;i<m;i++)give(s,make(s,'dragonWing'));
 if(e==='pactPainGift'&&selfHarm(s,1))for(let i=0;i<m;i++)give(s,make(s,'bloodPact'));
 if(e==='bloodGift'&&selfHarm(s,1))for(let i=0;i<m;i++)give(s,make(s,'bat'));
 if(e==='bloodGold'&&selfHarm(s,2)){s.pendingGold=(s.pendingGold||0)+3*m;log(s,'下回合金币已预存：'+s.pendingGold+'。');}
 for(let n=0;n<m;n++){
 if(e==='moduleGift')give(s,make(s,'module'));
 if(e==='gift')give(s,make(s,'growth'));if(e==='knightGift')give(s,make(s,'knight'));if(e==='spellGift')give(s,make(s,'mana'));if(e==='havenGift')give(s,make(s,'bless'));if(e==='discount')s.discount++;if(e==='graveGift')s.grave+=D.tuning.graveEntry;
 if(c.id==='neutral1')neighbors(s.board,c).forEach(x=>buff(s,x,D.tuning.neutralEntry,D.tuning.neutralEntry));if(c.id==='neutral4')s.board.filter(x=>x.uid!==c.uid).forEach(x=>buff(s,x,D.tuning.neutralMass,D.tuning.neutralMass));
}
 if(c.id==='haven1'&&s.amulets.length){const a=[...s.amulets].sort((a,b)=>a.count-b.count)[0];a.count-=m;expire(s);}
}
function cast(s,d,target){
 if(d.effect==='bloodImmunity'){s.bloodImmunity=true;log(s,'悚惧气息：本回合自伤免伤。');}
 if(d.effect==='mining')mining(s,3);
 if(d.effect==='modalSpell')queueMode(s,d);
 if(d.effect==='discardExchange')s.discover.push({type:'discard',source:'spell',spell:d.id,title:'崭新的命运 · 选择弃牌',text:'弃掉一张手牌后，获得两张本局牌池中最高 2 星的随机法术。',options:s.hand.map(c=>String(c.uid))});
 if(d.effect==='randomRecruit')give(s,make(s,pick(s,D.discoveryPool(s,d)).id));
 if(d.effect==='pilfer'){const stolen=pick(s,s.shop.filter(c=>def(c).type==='minion'));s.shop.splice(s.shop.indexOf(stolen),1);give(s,stolen);log(s,'偷取 '+def(stolen).name+'，保留商店中的强化。');}
 if(d.effect==='discoverSpell'){const options=sample(s,D.discoveryPool(s,d),3).map(c=>c.id);s.discover.push({type:d.discoverKind==='amulet'?'amulet':'minion',source:'spell',spell:d.id,title:'发现'+D.discoverLabels[d.discoverKind],text:'选择一张加入手牌 · 本局牌池 · '+(d.exactTier?'恰好 ':'最高 ')+s.tier+' 星',options});}
 const weapon=d.effect==='module'?S.weapon(s):null;
 const amp=S.spell(s),boost=(c,a,h)=>buff(s,c,a?a+amp:0,h?h+amp:0);
 const before=target?{attack:target.attack,health:target.health,keywords:[...target.keywords]}:null;
 if(d.effect==='bloodPact')boost(target,3,3);
 if(d.effect==='dragonWing'){boost(target,2,2);target.dragonPings=(target.dragonPings||0)+3;}
 if(d.effect==='bloodContract')for(let i=0;i<2;i++)give(s,make(s,'bloodPact'));
 if(d.effect==='module'){boost(target,weapon.attack,weapon.health);s.progress=Object.assign(s.progress||{},S.read(s));s.progress.arms++;}
 if(d.effect==='buff')for(let i=0;i<(d.buffRepeats||1);i++)boost(target,d.attack,d.health);
 if(d.effect==='tierBuff')boost(target,s.tier,s.tier);
 if(d.effect==='teamBuff')s.board.forEach(c=>boost(c,d.attack,d.health));
 if(d.effect==='menagerieBuff')for(const tribe of D.tribeIds){const c=pick(s,s.board.filter(x=>D.isTribe(x,tribe)));if(c)boost(c,d.attack,d.health);}
 if(d.effect==='marketBuff')boostOffers(s,d.attack?d.attack+amp:0,d.health?d.health+amp:0);
 if(d.effect==='removeGuard'){target.keywords=target.keywords.filter(k=>k!=='taunt');target.guardRemoved=true;log(s,def(target).name+' 的守护已移除。');}
 if(d.effect==='guard'){delete target.guardRemoved;boost(target,1,3);if(!target.keywords.includes('taunt'))target.keywords.push('taunt');}
 if(d.effect==='shield')shield(target,s);

 if(d.effect==='fortify')s.board.forEach(c=>boost(c,1,2));
 if(d.effect==='team')s.board.forEach(c=>boost(c,2,2));
 if(d.effect==='bones')s.grave+=5;
 if(d.effect==='ritual'){const n=s.grave;s.grave=0;boost(target,n,n);}
 if(d.effect==='tavernSpell')growTavern(s,(d.attack||2)+amp,(d.health||2)+amp);
 if(d.effect==='clock')tick(s);
 if(d.effect==='coin'){s.gold+=1;log(s,'铸币：获得 1 金币。');}
 if(d.effect==='deferGold'){s.pendingGold=(s.pendingGold||0)+2;log(s,'下回合金币已预存：'+s.pendingGold+'。');}
 s.spells++;s.spellsThisRound=(s.spellsThisRound||0)+1;s.stats.spells++;
 if(target&&before){for(const c of s.board.filter(c=>def(c).effect==='spellGuard'))buff(s,target,target.keywords.includes('taunt')?2*mul(c):0,2*mul(c));for(const c of s.board.filter(c=>c.id==='rune10')){const n=(1+Math.floor(s.spells/3))*mul(c);buff(s,target,n,n);}const a=target.attack-before.attack,h=target.health-before.health;for(const c of s.board.filter(c=>c.id==='rune5')){neighbors(s.board,target).forEach(x=>{buff(s,x,a*mul(c),h*mul(c));});log(s,def(c).name+' 的咒文共鸣扩散了强化。');}}
 for(const c of s.board){const e=def(c).effect,m=mul(c);if(e==='owlStudy')buff(s,[...s.board].filter(x=>x.uid!==c.uid).sort((a,b)=>a.attack-b.attack)[0],D.tuning.owlAttack*m,m);if(e==='spellGrow')buff(s,c,D.tuning.starterSpell*m,D.tuning.starterSpell*m);if(e==='spellHealth'){const n=S.growthAmount(s,e)*m;s.board.forEach(x=>buff(s,x,n,n));}if(c.id==='rune2'){buff(s,c,0,D.tuning.golemHealth*m);shield(c,s);}}
 if(d.effect==='module'){
  if(target.id==='artifact2')buff(s,target,D.tuning.moduleBonus*mul(target),D.tuning.moduleBonus*mul(target));
  if(target.id==='artifact6')neighbors(s.board,target).filter(c=>D.isTribe(c,'artifact')).forEach(c=>buff(s,c,(weapon.attack+amp)*mul(target),(weapon.health+amp)*mul(target)));
  log(s,def(target).name+' 完成武装强化。');
 }
 synergies(s,'spell',d);
 if(d.effect==='copyRecruit')give(s,make(s,target.id));
 if(s.heroSpellCopy){s.heroSpellCopy=false;give(s,make(s,d.id));}
}
function synergies(s,event,source=null,only=null){
 s.progress=Object.assign(s.progress||{},S.read(s));const p=s.progress;
 for(const c of [...s.board]){if((only!==null&&c.uid!==only)||!s.board.some(x=>x.uid===c.uid))continue;const e=def(c).effect,m=mul(c),own=source?.uid===c.uid;
  const team=(tribe,a,h,other=false)=>s.board.filter(x=>D.isTribe(x,tribe)&&(!other||x.uid!==c.uid)).forEach(x=>buff(s,x,a,h));
  const gifts=(id,n)=>{for(let i=0;i<n;i++)give(s,make(s,id));};
  if(event==='sell'&&!own&&e==='spellTrade'){const before=s.hand.length;gifts('mana',m);const gained=s.hand.length-before;if(gained)log(s,def(c).name+' · 魔法交换：获得 '+gained+' 张智慧之光。');}
  if(event==='cry'&&!own){if(e==='cryChampion')buff(s,c,4*m,4*m);if(e==='cryAcademy')p.spellcraft+=2*m;}
  if(event==='combo'&&e==='comboStudy')p.spellcraft+=m;
  if(event==='constructNovel'&&e==='constructSpectrum')p.arms+=2*m;
 if(event==='feast'&&e==='feastBroker')growTavern(s,2*m,2*m);
  if(event==='place'&&e==='guardNurse'){const x=s.board.find(x=>x.uid!==c.uid&&D.isTribe(x,'haven'));if(x){delete x.guardRemoved;buff(s,x,0,3*m);if(!x.keywords.includes('taunt'))x.keywords.push('taunt');}}
  if(event==='expire'&&e==='prayerStrike'){const target=[...s.board].sort((a,b)=>b.health-a.health)[0];if(target)buff(s,target,Math.floor(target.health/4)*m,0);}
  if(event==='expire'){if(e==='healthReliquary')team('haven',0,c.health*m,true);if(e==='prayerStudy')p.devotion+=2*m;if(e==='prayerChoir'){const n=(4+S.prayer(s))*m;team('haven',n,n);}}
  if(event==='minion'&&!own&&D.isTribe(source,'royal')&&e==='royalDrill'){const n=(4+Math.floor(p.buffs/10))*m;buff(s,source,n,n);}
  if(event==='minion'&&D.isTribe(source,'dragon')&&e==='tavernPlay')growTavern(s,2*m,2*m);
  if(event==='hurt'){if(e==='bloodTavern')growTavern(s,m,m);if(e==='bloodBud')buff(s,c,m,2*m);if(e==='bloodStudy')p.spellcraft+=m;if(e==='bloodVein')team('blood',0,(2+Math.floor(s.bloodDamage/5))*m);}
  if(event==='spell'){
   if(e==='thirdStudy'||e==='studyRally'){c.spellTicks=(c.spellTicks||0)+1;if(c.spellTicks>=3){c.spellTicks-=3;if(e==='thirdStudy')p.spellcraft+=2*m;else s.board.forEach(x=>buff(s,x,p.spellcraft*m,p.spellcraft*m));}}
   if(e==='studyEcho')neighbors(s.board,c).forEach(x=>buff(s,x,Math.ceil(p.spellcraft/2)*m,Math.ceil(p.spellcraft/2)*m));
   if(source?.effect==='module'&&e==='scrapArmament'){const n=S.growthAmount(s,e)*m;buff(s,c,n,n);}
   if(source?.effect==='module'){if(e==='moduleStudy')p.arms+=2*m;if(e==='moduleRally'){const n=S.growthAmount(s,e)*m;team('artifact',n,n,true);}}
  }
  if(event==='end'){
   if(e==='miner')mining(s,m);
   if(e==='destinySupply')gifts('newDestiny',m);
   if(e==='graveNourish'&&s.grave>=4&&neighbors(s.board,c).length){s.grave-=4;const n=(3+Math.floor(p.battleEntries/5))*m;neighbors(s.board,c).forEach(x=>buff(s,x,n,n));}
   if(e==='pydon'){const n=4*m;growTavern(s,n,n);const b=S.tavern(s);neighbors(s.board,c).forEach(x=>buff(s,x,b.attack*m,b.health*m));}
   if(e==='smallFeast')feast(s,c);
   if(e==='feastBanquet')for(let i=0;i<2;i++)feast(s,c);
   if(e==='comboReserve')gifts('growth',Math.floor(s.played/6)*m);
   if(e==='guardVitals')buff(s,s.board.filter(x=>x.keywords.includes('taunt')).sort((a,b)=>a.health-b.health)[0],0,Math.floor(Math.max(0,...s.board.map(x=>x.health))/3)*m);
   if(e==='spellUpgradeEnd'){const pool=eligiblePool(s,D.spells).filter(d=>d.tier>=5),targets=s.hand.filter(x=>def(x).type==='spell').sort((a,b)=>def(a).tier-def(b).tier).slice(0,m);for(const x of targets)if(pool.length)s.hand[s.hand.indexOf(x)]=make(s,pick(s,pool).id);}
   if(e==='spellReserve'&&(s.spellsThisRound||0)>=3){const pool=eligiblePool(s,D.spells).filter(d=>d.tier>=3&&d.tier<=5);for(let i=0;i<2*m&&pool.length;i++)give(s,make(s,pick(s,pool).id));}
   if(e==='fairyEnd')gifts('fairy',2*m);if(e==='comboHarvest')buff(s,c,s.played*2*m,s.played*2*m);
   if(e==='buffCommander'){const n=(4+Math.floor(p.buffs/10))*m;s.board.forEach(x=>buff(s,x,n,n));}
   if(e==='guardSupply')gifts('guard',m);if(e==='shieldSupply')gifts('shield',m);if(e==='shieldMarshal'){const n=s.board.reduce((n,x)=>n+S.shieldCount(x),0)*2*m;team('royal',n,n);}
   if(e==='tavernSupply')gifts('dragon',m);
   if(e==='dragonFeast'||e==='bloodFeast')feast(s,c);
   
   if(e==='graveEnd')s.grave+=4*m;if(e==='graveStudy'&&s.grave>=6){s.grave-=6;p.spellcraft+=4*m;}
   if(e==='graveLord'&&s.grave>=6){s.grave-=6;const n=(3+Math.floor(s.grave/5))*m;team('night',n,n);}
   if(e==='growthSupply')gifts('growth',2*m);if(e==='studyEnd')p.spellcraft+=6*m;
   if(e==='clockSupply')gifts('clock',m);if(e==='prayerGiant'){const n=S.prayer(s)*2*m;buff(s,c,n,n);}
   if(e==='pactEnd'&&selfHarm(s,1))gifts('bloodPact',m);if(e==='batSupply')gifts('bat',2*m);if(e==='forgeEnd')p.arms+=6*m;
  }
 }
}
function endEffect(s,c){
 synergies(s,'end',null,c.uid);const e=def(c).effect,m=mul(c);
  if(e==='bloodGrow')selfHarm(s,1);
  if(e==='bodyVitality'&&c.health>=10)buff(s,s.board.find(x=>x.uid!==c.uid&&D.isTribe(x,'dragon')),2*m,4*m);
  if(e==='graveFeast'&&s.grave>=3){s.grave-=3;s.board.filter(x=>D.isTribe(x,'night')).forEach(x=>buff(s,x,4*m,4*m));}
  if(e==='blessingSupply')for(let i=0;i<m;i++)give(s,make(s,'bless'));
  if(e==='moduleSmith')for(let i=0;i<2*m;i++)give(s,make(s,'module'));
  if(e==='dragonGrow')buff(s,c,m,m);
  if(e==='spellEnd')for(let i=0;i<3*m;i++)give(s,make(s,'mana'));
  if(e==='lifeNurse')buff(s,s.board.filter(x=>x.uid!==c.uid&&D.isTribe(x,'haven')).sort((a,b)=>a.health-b.health)[0],0,3*m);
  if(e==='healthChoir'){const n=(2+Math.floor(c.health/4))*m;s.board.filter(x=>x.uid!==c.uid&&D.isTribe(x,'haven')).forEach(x=>buff(s,x,0,n));}
  if(e==='menagerie')for(const tribe of D.tribeIds)buff(s,pick(s,s.board.filter(x=>D.isTribe(x,tribe))),3*m,3*m);
}
function endRecruit(s,record=false){
 if(s.recruitEnded)return [];s.deferTriples=true;s.feasts=[];const frames=[],view=()=>copy(Object.fromEntries(['board','hand','shop','amulets','progress','grave','scrap','hp','gold','log','feasts','bloodDamage','bloodImmunity'].map(k=>[k,s[k]]))),push=(label,source=null)=>{if(record)frames.push({label,source,state:view()});};
 push('备战结束');const board=[...s.board];
 for(const c of board){if(!D.endRecruitEffects.includes(def(c).effect))continue;const repeats=1+S.echoCount(s,'endEcho',c.uid);for(let i=0;i<repeats;i++){if(!s.board.some(x=>x.uid===c.uid))break;endEffect(s,c);if(i)log(s,def(c).name+' 的备战结束效果额外结算。');push(def(c).name+' · 备战结束',c.uid);}}
 const hadAmulets=s.amulets.length;tick(s);if(hadAmulets)push('护符倒数结算');s.bloodImmunity=false;s.recruitEnded=true;return frames;
}
// Combat copies the permanent formation and returns an explicit permanent-growth ledger.
function battleDamageCap(s){return Array.isArray(s.opponents)&&s.opponents.filter(o=>o.hp>0).length+(s.hp>0?1:0)<=4?null:15;}
function combat(s,left,right,metaL={},metaR={},{damageCap=battleDamageCap(s)}={}){return (root.TavernCombat||(typeof require!=='undefined'?require('./combat.js'):null)).run(s,left,right,metaL,metaR,{copy,make,pick,rand,damageCap});}
function applyBattleGrowth(board,result,side){for(const c of board){const gain=result.permanent?.[side]?.[c.uid];if(gain)buff(null,c,gain.attack,gain.health);}}
function aiPrepare(s,o){return (root.TavernAI||(typeof require!=='undefined'?require('./ai.js'):null)).prepare(s,o,E);}
function battleCards(s,p,ids){p.hand=p.hand||[];p.discover=p.discover||[];p.log=p.log||[];p.deferTriples=true;for(const id of ids||[]){const c=make(s,id);if(give(p,c))log(p,'战后获得 '+def(c).name+'。');}}
function fight(s){
 // Every pairing uses the population at combat start, before any eliminations.
 const rules={damageCap:battleDamageCap(s)};
 endRecruit(s);s.opponents.filter(o=>o.hp>0).forEach(o=>aiPrepare(s,o));const o=s.opponents.find(o=>o.id===s.opponent);
 if(!o){s.phase='finished';s.rank=1;return;}
 const meta={tier:s.tier,grave:s.grave,spells:s.spells,played:s.played,bloodDamage:s.bloodDamage||0,scrap:s.scrap||0,progress:S.read(s),trinkets:s.trinkets};const result=combat(s,s.board,o.board,meta,o,rules);s.grave=result.grave[0];o.grave=result.grave[1];applyBattleGrowth(s.board,result,0);applyBattleGrowth(o.board,result,1);settleProgress(s,result.progress[0]);settleProgress(o,result.progress[1]);s.discount+=result.discount[0];o.discount=(o.discount||0)+result.discount[1];s.scrap=result.scrap[0];o.scrap=result.scrap[1];
 battleCards(s,s,result.generated[0]);battleCards(s,o,result.generated[1]);const first=result.events[0];result.events.unshift(...[o].flatMap((p,side)=>(p.feasts||[]).map(f=>({...copy(first),kind:'feast',text:'敌方 · '+f.text,food:f.food,from:first.boards[1].find(x=>x.uid===f.source)?.battleId??null,to:first.boards[1].find(x=>f.targets.includes(x.uid))?.battleId??null}))));
 const totalGrowth=Object.values(result.permanent[0]).reduce((n,g)=>n+g.attack+g.health,0);if(totalGrowth)log(s,'本场永久养成已结算：合计增加 '+totalGrowth+' 点攻击与生命。');
 result.heroDamage={armor:0,health:0};if(result.winner===0){result.heroDamage=heroDamage(o,result.damage);s.wins++;}if(result.winner===1){result.heroDamage=heroDamage(s,result.damage);s.losses++;}s.lastOpponent=o.id;
 const others=sample(s,s.opponents.filter(x=>x.id!==o.id&&x.hp>0),7);
 for(let i=0;i+1<others.length;i+=2){const a=others[i],b=others[i+1],r=combat(s,a.board,b.board,a,b,rules);battleCards(s,a,r.generated[0]);battleCards(s,b,r.generated[1]);a.grave=r.grave[0];b.grave=r.grave[1];a.scrap=r.scrap[0];b.scrap=r.scrap[1];settleProgress(a,r.progress[0]);settleProgress(b,r.progress[1]);a.discount=(a.discount||0)+r.discount[0];b.discount=(b.discount||0)+r.discount[1];applyBattleGrowth(a.board,r,0);applyBattleGrowth(b.board,r,1);if(r.winner===0)heroDamage(b,r.damage);if(r.winner===1)heroDamage(a,r.damage);}
 let fatigue=0;if(s.round>=16){fatigue=(s.round-15)*2;s.hp-=fatigue;s.opponents.filter(x=>x.hp>0).forEach(x=>x.hp-=fatigue);}
 const alive=s.opponents.filter(x=>x.hp>0).length;
 s.result={...result,opponent:o.name,fatigue,round:s.round};s.phase='result';
 if(s.hp<=0)s.rank=Math.max(1,alive+1);else if(!alive)s.rank=1;
 log(s,(result.winner===0?'战斗胜利':result.winner===1?'战斗失利':'势均力敌')+' · '+(result.winner===1?'受到': '造成')+' '+result.damage+' 伤害。');
}
function error(msg){return {ok:false,message:msg};}
function spellError(s,d,source,targetUid){if(d.effect==='randomRecruit'&&!D.discoveryPool(s,d).length)return '当前没有可获得的随从。';if(d.effect==='marketBuff'&&!s.shop.some(c=>def(c).type==='minion'))return '商店中没有可以强化的随从。';if(d.effect==='removeGuard'&&!s.board.find(c=>c.uid===targetUid)?.keywords.includes('taunt'))return '只能对具有守护的友方随从使用。';if(d.effect==='discardExchange'&&!s.hand.some(c=>c.uid!==source?.uid))return '需要另一张手牌作为弃牌。';if(d.effect==='pilfer'&&!s.shop.some(c=>def(c).type==='minion'))return '商店中没有可以偷取的随从。';if(d.effect==='discoverSpell'&&!D.discoveryPool(s,d).length)return '当前牌池与星级中没有符合条件的卡牌。';return null;}
function act(s,type,arg={}){
 if(type==='continue'){if(s.phase!=='result')return error('当前没有待结算的战斗。');if(s.rank){s.phase='finished';return {ok:true};}s.round++;delete s.result;startRound(s);return {ok:true};}
 if(s.phase!=='recruit')return error('请在招募阶段操作。');
 if(s.recruitEnded&&!['fight'].includes(type))return error('备战结算已完成，请进入战斗。');
 if(s.discover.length&&!['choose','discard'].includes(type))return error('请先选择发现奖励。');
 if(type==='discard'&&s.discover[0]?.type==='discard')return error('请在选择框中指定要弃掉的手牌。');
 if(type==='prepareBattle')return {ok:true,frames:endRecruit(s,true)};
 if(type==='choose'){
  const pending=s.discover[0];
  if(pending?.type==='targetChoice'){const c=targetCards(s,pending).find(c=>String(c.uid)===arg.id);if(!c)return error('请选择有效目标。');const q=pending;s.discover.shift();if(q.kind==='feast')chosenFeast(s,q.owner?s.board.find(x=>x.uid===q.owner):s.board.at(-1),c,q.scale,!!q.owner&&D.byId[q.card]?.effect==='chosenFeast');if(q.kind==='health')buff(s,c,Math.max(0,c.health*q.scale-c.attack),0);if(q.kind==='shift'){const d=pick(s,eligiblePool(s,D.cards).filter(d=>d.tier===def(c).tier&&d.id!==c.id));s.hand[s.hand.indexOf(c)]=make(s,d.id,{attack:Math.max(0,d.attack+c.attack-def(c).attack),health:Math.max(1,d.health+c.health-def(c).health)});}refreshTargetQueues(s);triples(s);return {ok:true};}
  if(pending?.type==='mode'){if(!pending.options.includes(arg.id))return error('请选择有效模式。');const m=modeOptions(s,pending).find(m=>m.id===arg.id);if(m.kind==='gift'&&s.hand.length>=10)return error('手牌已满，请选择其他模式。');s.discover.shift();resolveMode(s,pending,arg.id);return {ok:true};}
  if(pending?.type==='discard'){if(!pending.options.includes(arg.id)||!s.hand.some(c=>String(c.uid)===arg.id))return error('请选择有效的弃牌。');s.discover.shift();discardCard(s,Number(arg.id));const pool=eligiblePool(s,D.spells).filter(d=>d.tier<=2);for(let i=0;i<2;i++)give(s,make(s,pick(s,pool).id));return {ok:true};}
  const q=s.discover[0];if(q?.type==='trinket')return error('饰品已移除，请重新载入存档。');if(!q||!q.options.includes(arg.id))return error('请选择有效奖励。');if(['minion','amulet','spell'].includes(q.type)&&s.hand.length>=10)return error('手牌已满。');s.discover.shift();
  if(q.source===undefined)s.stats.triples++;give(s,make(s,arg.id));return {ok:true};
 }
 if(type==='activate'){
  const c=s.board.find(c=>c.uid===arg.uid),d=c&&def(c);if(!d?.activation)return error('该随从没有启动能力。');
  if(c.activatedRound===s.round)return error('该随从本回合已经启动。');if(s.gold<d.activation.cost)return error('启动所需金币不足。');
  if(d.activation.grave&&s.grave<d.activation.grave)return error('需要 '+d.activation.grave+' 墓场。');
  if(d.activation.discard&&!s.hand.some(x=>x.uid===arg.discardUid))return error('请选择一张手牌作为启动代价。');
  c.activatedRound=s.round;spend(s,d.activation.cost);s.progress=Object.assign(s.progress||{},S.read(s));
  if(d.activation.discard)discardCard(s,arg.discardUid);
  if(d.effect==='graveWorkshop'){s.grave-=d.activation.grave;for(let i=0;i<2*mul(c);i++)give(s,make(s,'skeleton'));}
  if(d.effect==='activeDiscard')buff(s,c,3*mul(c),3*mul(c));
  if(d.effect==='activeForge')growTavern(s,3*mul(c),3*mul(c));
  if(d.effect==='activeResearch')s.progress.spellcraft+=2*mul(c);
  log(s,'启动 '+d.name+'。');return {ok:true};
 }
 if(type==='buyPlay'){
  const c=s.shop.find(c=>c.uid===arg.uid);if(!c)return error('这张卡牌已不在商店中。');const d=def(c);
  if(s.gold<d.cost)return error('金币不足。');if(d.purchaseSelfHarm&&s.hp<=1&&!S.selfHarmImmune(s))return error('生命不足，无法支付购买自伤。');if(s.hand.length>=10)return error('手牌已满（最多 10 张）。');
  if(d.type==='minion'&&s.board.length>=7)return error('战场已满，请先出售随从。');if(d.type==='amulet'&&s.amulets.length>=2)return error('护符位已满。');if(d.target&&!s.board.some(x=>x.uid===arg.target))return error('请拖到一个己方随从上。');if(d.effect==='module'&&!D.isTribe(s.board.find(x=>x.uid===arg.target),'artifact'))return error('武装只能用于造物。');
  const invalidSpell=spellError(s,d,c,arg.target);if(invalidSpell)return error(invalidSpell);
  const bought=act(s,'buy',{uid:c.uid});if(!bought.ok)return bought;
  if(s.discover.length||!s.hand.some(x=>x.uid===c.uid))return {ok:true};return act(s,'play',arg);
 }else if(type==='buy'){
  const i=s.shop.findIndex(c=>c.uid===arg.uid),c=s.shop[i];if(!c)return error('这张卡牌已不在商店中。');const d=def(c);if(s.gold<d.cost)return error('金币不足。');if(s.hand.length>=10)return error('手牌已满（最多 10 张）。');if(d.purchaseSelfHarm&&s.hp<=1&&!S.selfHarmImmune(s))return error('生命不足，无法支付购买自伤。');s.gold-=d.cost;s.shop.splice(i,1);if(d.purchaseSelfHarm)selfHarm(s,d.purchaseSelfHarm);if(d.type==='minion')for(const x of s.board.filter(x=>def(x).effect==='marketSurvey'))buff(s,c,0,S.tavern(s).health*mul(x));give(s,c);spend(s,d.cost,true);log(s,'购入 '+d.name+'。');
 }else if(type==='refresh'){if(s.gold<1)return error('刷新需要 1 金币。');spend(s,1);s.frozen=false;shop(s);prospect(s);
 }else if(type==='freeze'){s.frozen=!s.frozen;
 }else if(type==='upgrade'){if(s.tier>=6)return error('酒馆已达到最高星级。');const cost=upgradeCost(s);if(s.gold<cost)return error('升级需要 '+cost+' 金币。');spend(s,cost);s.tier++;s.discount=0;log(s,'酒馆升至 '+s.tier+' 星！');
 }else if(type==='play'){
  const i=s.hand.findIndex(c=>c.uid===arg.uid),c=s.hand[i];if(!c)return error('手牌不存在。');const d=def(c),target=d.target?s.board.find(x=>x.uid===arg.target):undefined;
  if(d.type==='minion'&&s.board.length>=7)return error('战场已满，请先出售随从（最多 7 个）。');
  if(d.type==='amulet'&&s.amulets.length>=2)return error('护符位已满（最多 2 个），可在详情中拆除。');
  if(d.target&&!target)return error('请选择一个己方随从作为目标。');
  if(d.effect==='module'&&!D.isTribe(target,'artifact'))return error('武装只能用于造物。');
  const invalidSpell=spellError(s,d,c,arg.target);if(invalidSpell)return error(invalidSpell);
  s.hand.splice(i,1);
  if(d.type==='minion'){const index=Number.isInteger(arg.index)?Math.max(0,Math.min(s.board.length,arg.index)):s.board.length;s.board.splice(index,0,c);S.syncShieldAura(s.board);battlecry(s,c);
   if(s.heroCry&&D.fanfareIds.includes(c.id)){s.heroCry=false;battlecry(s,c);log(s,'战术重奏：再次触发 '+d.name+' 的入场曲。');}
   for(const x of [...s.board]){const m=mul(x);if(x.id==='royal1'&&x.uid!==c.uid&&D.isTribe(d,'royal'))buff(s,x,D.tuning.royalRecruit*m,D.tuning.royalRecruit*m);if(def(x).effect==='fanfareEcho'&&x.uid!==c.uid&&D.fanfareIds.includes(c.id)){for(let k=0;k<m;k++)battlecry(s,c);log(s,def(x).name+' 再次触发 '+d.name+' 的入场曲。');}}
  }
  if(d.type==='amulet'){s.amulets.push({...c,count:Math.max(1,(c.initialCount||d.count))});s.board.filter(x=>x.id==='haven0').forEach(x=>buff(s,x,2*mul(x),2*mul(x)));}
  if(d.type==='spell')cast(s,d,target);
  if(d.type==='minion'){recruitSummon(s,c);if(d.token&&D.isTribe(d,'artifact')){s.progress=S.read(s);if(!s.progress.constructTypes.includes(c.id))s.progress.constructTypes.push(c.id);s.constructsThisRound=s.constructsThisRound||[];if(!s.constructsThisRound.includes(c.id)){s.constructsThisRound.push(c.id);synergies(s,'constructNovel',c);}}synergies(s,'minion',c);}
  if(d.type==='minion'&&d.token)synergies(s,'token',c);if(d.type==='amulet')synergies(s,'place',c);
  playCount(s);triples(s);log(s,'使用 '+d.name+'。');
 }else if(type==='sell'){
  const i=s.board.findIndex(c=>c.uid===arg.uid);if(i<0)return error('随从不存在。');const c=s.board.splice(i,1)[0],gain=Math.max(1+(c.id==='neutral0'?mul(c):0),s.heroSalvage?def(c).tier:0);s.heroSalvage=false;s.gold+=gain;departureReward(s,c);if(c.id==='forest0'||c.id==='rune1')for(let j=0;j<mul(c);j++)give(s,make(s,c.id==='forest0'?'fairy':'mana'));if(def(c).effect==='forestTrade')for(let j=0;j<2*mul(c);j++)give(s,make(s,'growth'));S.syncShieldAura(s.board);synergies(s,'sell',c);triples(s);log(s,'出售 '+def(c).name+'，获得 '+gain+' 金币。');
 }else if(type==='discard'){
  if(!discardCard(s,arg.uid))return error('手牌不存在。');triples(s);
 }else if(type==='removeAmulet'){
  const i=s.amulets.findIndex(c=>c.uid===arg.uid);if(i<0)return error('护符不存在。');s.amulets.splice(i,1);log(s,'拆除护符，没有触发倒数效果。');
 }else if(type==='moveTo'){
  const i=s.board.findIndex(c=>c.uid===arg.uid);if(i<0||!Number.isInteger(arg.index)||arg.index<0||arg.index>s.board.length)return error('无效的放置位置。');const [c]=s.board.splice(i,1);s.board.splice(arg.index>i?arg.index-1:arg.index,0,c);
 }else if(type==='move'){
  const i=s.board.findIndex(c=>c.uid===arg.uid),j=i+arg.direction;if(i<0||j<0||j>=s.board.length)return error('无法继续移动。');[s.board[i],s.board[j]]=[s.board[j],s.board[i]];
 }else if(type==='power'){
  const h=D.heroes.find(h=>h.id===s.hero);if(s.powerUsed)return error('本回合已使用英雄技能。');if(s.gold<h.cost)return error('金币不足。');const target=s.board.find(c=>c.uid===arg.target);if(h.target&&!target)return error('请选择友方随从。');
  if(['blood','medusa'].includes(s.hero)&&s.hp<=1&&!S.selfHarmImmune(s))return error('生命不足，无法支付自伤。');
  if(s.hero==='forte'&&(target.heroWindfury||def(target).effect==='double'||['forest1','dragon6','dragon9'].includes(target.id)))return error('该随从已拥有连击。');
  if(s.hero==='snow'&&(target.heroReborn||def(target).effect==='reborn'))return error('该随从已拥有复生。');
  if(s.hero==='ceres'&&s.grave<3)return error('需要 3 墓场。');
  if(s.hero==='dorothy'&&s.hand.length>8)return error('需要两个空余手牌位置。');
  if(['forest','night','rune','blood','artifact','deus'].includes(s.hero)&&s.hand.length>=10)return error('手牌已满。');if(s.hero==='haven'&&!s.amulets.length&&s.hand.length>=10)return error('手牌已满。');
  if(['ceres','windgod'].includes(s.hero)&&(!heroPool(s,s.hero).length||s.hand.length>=10))return error('没有可发现的随从或手牌已满。');
  if(s.hero==='aria'&&(!def(target).token||s.hand.length>8))return error('请选择衍生随从，并留下两个手牌空位。');
  if(s.hero==='athena'&&(!S.shieldCount(target)||!neighbors(s.board,target).length))return error('请选择具有屏障且有相邻随从的目标。');
  if(s.hero==='medusa'&&(!s.board.length||!s.shop.some(c=>def(c).type==='minion')))return error('需要己方随从和商店随从。');
  if(s.hero==='bahamut'&&!s.hand.some(c=>def(c).type==='minion'&&!c.golden))return error('需要非金色随从手牌。');
  spend(s,h.cost);s.powerUsed=true;
  s.progress=Object.assign(s.progress||{},S.read(s));
  if(s.hero==='goblin')s.pendingGold=(s.pendingGold||0)+2;
  if(s.hero==='angel')buff(s,target,1,5);
  if(['windgod','ceres'].includes(s.hero)){if(s.hero==='ceres')s.grave-=3;s.discover.push({type:'minion',source:'hero',hero:s.hero,title:h.power,text:'选择一个随从的普通基础复制。',options:sample(s,heroPool(s,s.hero),3).map(d=>d.id)});}
  if(s.hero==='athena'){removeShield(s,target);neighbors(s.board,target).forEach(c=>shield(c,s));}
  if(s.hero==='olivia')s.heroSpellCopy=true;
  if(s.hero==='bahamut')queueTarget(s,'shift');
  if(s.hero==='aria'){s.board.splice(s.board.indexOf(target),1);S.syncShieldAura(s.board);give(s,target);give(s,make(s,target.id));}
  if(s.hero==='roland')s.heroSalvage=true;
  if(s.hero==='forte')target.heroWindfury=true;
  
  if(s.hero==='dorothy')for(let i=0;i<2;i++)give(s,make(s,'mana'));
  if(s.hero==='snow')target.heroReborn=true;
  if(s.hero==='medusa')queueTarget(s,'feast');
  if(s.hero==='deus'){const i=s.constructIndex||0;give(s,make(s,D.constructCycle[i]));s.constructIndex=(i+1)%D.constructCycle.length;}
  if(s.hero==='forest')give(s,make(s,'fairy'));
  if(s.hero==='blood'&&selfHarm(s,1))give(s,make(s,'bat'));
  if(s.hero==='artifact')give(s,make(s,'module'));
  if(s.hero==='royal')s.heroCry=true;
  if(s.hero==='dragon')s.heroProspect=true;
  if(s.hero==='night'){s.grave+=4;give(s,make(s,'skeleton'));}
  if(s.hero==='rune')give(s,make(s,pick(s,eligiblePool(s,D.spells).filter(c=>c.tier<=s.tier)).id));
  if(s.hero==='haven'){if(s.amulets.length)tick(s);else give(s,make(s,'bell'));}log(s,'使用 '+h.power+'。');
 }else if(type==='fight'){fight(s);
 }else return error('未知操作。');
 return {ok:true};
}
function validate(s){
 try{
  const num=n=>Number.isSafeInteger(n)&&Math.abs(n)<1e12;
  const progress=p=>p===undefined||(p&&typeof p==='object'&&!Array.isArray(p)&&['mining','totalPlayed','fairy','arms','prayers','spellcraft','devotion','buffs','battleEntries','legionAttack','tavernAttack','tavernHealth'].every(k=>p[k]===undefined||(num(p[k])&&p[k]>=0)));
  const card=c=>c&&D.byId[c.id]&&num(c.uid)&&num(c.attack)&&num(c.health)&&c.attack>=0&&Array.isArray(c.keywords)&&c.keywords.every(k=>['taunt','shield','stealth','destruction','cannotAttack'].includes(k))&&typeof c.golden==='boolean'&&(c.guardRemoved===undefined||typeof c.guardRemoved==='boolean')&&(c.activatedRound===undefined||(num(c.activatedRound)&&c.activatedRound>=0&&c.activatedRound<=s.round))&&(c.shieldLayers===undefined||(num(c.shieldLayers)&&c.shieldLayers>=0&&(c.shieldLayers>0)===c.keywords.includes('shield')))&&(c.heroWindfury===undefined||typeof c.heroWindfury==='boolean')&&(c.heroReborn===undefined||typeof c.heroReborn==='boolean')&&(c.dragonPings===undefined||(num(c.dragonPings)&&c.dragonPings>=0))&&(c.spellTicks===undefined||(num(c.spellTicks)&&c.spellTicks>=0&&c.spellTicks<3))&&(c.spentGold===undefined||(num(c.spentGold)&&c.spentGold>=0&&c.spentGold<D.fairySpendCost));
  if(!s||s.version!==1||!D.heroes.some(h=>h.id===s.hero)||!['easy','normal','hard'].includes(s.difficulty)||!['recruit','result','finished'].includes(s.phase))return false;
  if(!['board','hand','shop','amulets','opponents','trinkets','discover','log'].every(k=>Array.isArray(s[k])))return false;
  if(!['seed','uid','round','hp','maxHp','tier','gold','discount','grave','spells','played','wins','losses'].every(k=>num(s[k]))||s.gold<0||s.grave<0||s.round<1||s.round>100||s.tier<1||s.tier>6||s.maxHp<1)return false;
  if(s.activeTribes!==undefined&&(!Array.isArray(s.activeTribes)||s.activeTribes.length!==4||new Set(s.activeTribes).size!==4||!s.activeTribes.every(t=>D.tribeIds.includes(t))||!heroAvailable(heroDef(s),s.activeTribes)))return false;
  if([s,...s.opponents].some(o=>o.bloodImmunity!==undefined&&typeof o.bloodImmunity!=='boolean'))return false;
  if([s,...s.opponents].some(o=>o.armor!==undefined&&(!num(o.armor)||o.armor<0)))return false;
  if([s,...s.opponents].some(o=>['pendingGold','pendingFairies'].some(k=>o[k]!==undefined&&(!num(o[k])||o[k]<0))))return false;
  if(['deferTriples','recruitEnded'].some(k=>s[k]!==undefined&&typeof s[k]!=='boolean'))return false;
  if(['bloodDamage','scrap'].some(k=>s[k]!==undefined&&(!num(s[k])||s[k]<0)))return false;
  if([s,...s.opponents].some(o=>(o.heroCry!==undefined&&typeof o.heroCry!=='boolean')||(o.constructIndex!==undefined&&(!num(o.constructIndex)||o.constructIndex<0||o.constructIndex>=D.constructCycle.length))))return false;
  if([s,...s.opponents].some(p=>p.feasts!==undefined&&(!Array.isArray(p.feasts)||p.feasts.length>1000||!p.feasts.every(f=>f&&typeof f.text==='string'&&num(f.source)&&Array.isArray(f.targets)&&f.targets.every(num)&&f.food&&D.byId[f.food.id]?.type==='minion'&&num(f.food.attack)&&f.food.attack>=0&&num(f.food.health)&&f.food.health>0))))return false;
  if(!progress(s.progress)||s.opponents.some(o=>!progress(o.progress)))return false;
  for(const p of [s,...s.opponents]){for(const values of [p.progress?.constructTypes,p.constructsThisRound])if(values!==undefined&&(!Array.isArray(values)||new Set(values).size!==values.length||!values.every(id=>D.constructCycle.includes(id))))return false;if(['heroProspect','heroSalvage','heroSpellCopy'].some(k=>p[k]!==undefined&&typeof p[k]!=='boolean'))return false;}
  if(!s.stats||!['triples','spells'].every(k=>num(s.stats[k]))||(s.stats.discards!==undefined&&(!num(s.stats.discards)||s.stats.discards<0)))return false;
  if(typeof s.powerUsed!=='boolean'||typeof s.frozen!=='boolean'||!s.log.every(x=>typeof x==='string')||s.log.length>100)return false;
  if(s.board.length>7||s.hand.length>10||s.shop.length>8||s.amulets.length>2||s.opponents.length!==7)return false;
  if(![...s.board,...s.hand,...s.shop,...s.amulets].every(card)||!s.board.every(c=>def(c).type==='minion')||!s.amulets.every(c=>def(c).type==='amulet'&&num(c.count)&&c.count>0))return false;
  if(s.opponents.some(o=>o.hero!==undefined&&!D.heroes.some(h=>h.id===o.hero&&(h.tribe==='neutral'||h.tribe===o.tribe))))return false;
  if(!s.opponents.every(o=>num(o.id)&&o.id>=0&&o.id<7&&typeof o.name==='string'&&D.tribes[o.tribe]&&num(o.hp)&&num(o.tier)&&o.tier>=1&&o.tier<=6&&num(o.grave)&&num(o.spells)&&Array.isArray(o.board)&&o.board.length<=7&&o.board.every(c=>card(c)&&def(c).type==='minion')))return false;
  if(!s.opponents.some(o=>o.id===s.opponent)||new Set(s.opponents.map(o=>o.id)).size!==7)return false;
  if(s.trinkets.length>2||!s.trinkets.every(id=>D.legacyTrinkets.some(t=>t.id===id)))return false;
  if(!s.discover.every(q=>{
   if(!q||typeof q.title!=='string'||typeof q.text!=='string'||!Array.isArray(q.options)||!q.options.length||new Set(q.options).size!==q.options.length)return false;
   if(q.type==='mode')return q.source==='ability'&&[1,2].includes(q.scale)&&Array.isArray(D.byId[q.card]?.modes)&&q.options.length===D.byId[q.card].modes.length&&q.options.every(id=>D.byId[q.card].modes.some(m=>m.id===id));
   if(q.type==='discard')return q.source==='spell'&&D.byId[q.spell]?.effect==='discardExchange'&&q.options.every(uid=>typeof uid==='string'&&s.hand.some(c=>String(c.uid)===uid));
   if(q.type==='targetChoice')return q.source==='ability'&&[1,2].includes(q.scale)&&['feast','health','shift'].includes(q.kind)&&((q.kind==='feast'&&(q.hero==='medusa'||D.byId[q.card]?.effect==='chosenFeast'))||(q.kind==='health'&&D.byId[q.card]?.effect==='healthToAttack')||(q.kind==='shift'&&q.hero==='bahamut'))&&q.options.every(uid=>targetCards(s,q).some(c=>String(c.uid)===uid));
   if(q.source==='hero')return q.type==='minion'&&['ceres','windgod'].includes(q.hero)&&q.options.every(id=>heroPool(s,q.hero).some(d=>d.id===id));
   if(q.source==='fanfare'){const d=D.byId[q.card];return ((q.type==='minion'&&['discoverRoyal','graveDiscovery'].includes(d?.effect))||(q.type==='spell'&&['discoverHighSpell','discoverLowSpell'].includes(d?.effect)))&&q.options.every(id=>D.discoveryPool(s,d).some(c=>c.id===id));}
   return ['trinket','minion','amulet'].includes(q.type)&&(q.source===undefined||q.source==='spell')&&(q.source!=='spell'||D.byId[q.spell]?.effect==='discoverSpell')&&q.options.every(id=>q.type==='trinket'?D.legacyTrinkets.some(t=>t.id===id):q.type==='amulet'?D.amulets.some(c=>c.id===id):[...D.cards,...(D.retiredCards||[])].some(c=>c.id===id));
  }))return false;
  if(s.rank!=null&&(!num(s.rank)||s.rank<1||s.rank>8))return false;
  if(s.phase==='finished'&&!s.rank)return false;
  if(s.phase==='result'){
   const r=s.result;if(!r||![-1,0,1].includes(r.winner)||!num(r.damage)||!num(r.fatigue)||typeof r.opponent!=='string'||!Array.isArray(r.deadCount)||r.deadCount.length!==2||!r.deadCount.every(num)||!Array.isArray(r.events)||r.events.length<1||r.events.length>1000)return false;
   if(r.damageCap!==undefined&&r.damageCap!==null&&r.damageCap!==15)return false;
   if(r.damageCap===15&&r.damage>15)return false;
   if(r.heroDamage!==undefined&&(!r.heroDamage||!num(r.heroDamage.armor)||r.heroDamage.armor<0||!num(r.heroDamage.health)||r.heroDamage.health<0||r.heroDamage.armor+r.heroDamage.health!==r.damage))return false;
   if(!r.events.every(e=>typeof e.text==='string'&&(e.food===undefined||(e.food&&D.byId[e.food.id]?.type==='minion'&&num(e.food.attack)&&e.food.attack>=0&&num(e.food.health)&&e.food.health>0))&&(e.impacts===undefined||(Array.isArray(e.impacts)&&e.impacts.every(i=>num(i.target)&&num(i.amount)&&i.amount>=0&&typeof i.blocked==='boolean'&&(i.destroyed===undefined||typeof i.destroyed==='boolean'))))&&Array.isArray(e.boards)&&e.boards.length===2&&e.boards.every(b=>Array.isArray(b)&&b.length<=7&&b.every(card))))return false;
  }
  return true;
 }catch{return false;}
}
const E={targetCards,heroPool,damageCap:battleDamageCap,modeOptions,settleProgress,feastTarget,create,act,normalize,rollTribes,rollHeroes,heroAvailable,heroDamage,activeTribes,available,pool:eligiblePool,combat,make,copy,rand,pick,def,upgradeCost,validate,aiPrepare,triples,startRound,endRecruit,scaling:S};root.TavernEngine=E;if(typeof module!=='undefined')module.exports=E;
})(typeof globalThis!=='undefined'?globalThis:this);
