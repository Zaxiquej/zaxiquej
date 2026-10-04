(function(root){
'use strict';
const D=root.TavernData||(typeof require!=='undefined'?require('./data.js'):null);
const S=root.TavernScaling||(typeof require!=='undefined'?require('./scaling.js'):null);
// Each list contains an engine, its payoffs, and useful supporting pieces.
// These preferences change decisions; they never grant cards or hidden stats.
const plans={
 forest:[['forest4','forest16','forest1','forest2','forest3','forest11','forest15','forest8','forest12','forest18','forest14','forest7'],['forest6','forest17','forest5','forest10','forest19','forest13','forest9','forest0','forest7','forest2']],
 royal:[['royal15','royal6','royal2','royal12','royal16','royal7','royal5','royal17','royal0','royal4'],['royal14','royal10','royal21','royal3','royal18','royal20','royal9','royal19','royal11','royal8','royal13','royal1']],
 dragon:[['dragon4','dragon18','dragon13','dragon3','dragon2','dragon5','dragon16','dragon19','dragon9','dragon15'],['dragon15','dragon17','dragon12','dragon6','dragon7','dragon14','dragon1','dragon10','dragon11','dragon9']],
 night:[['night17','night13','night5','night4','night18','night14','night2','night12','night15','night0','night3'],['night7','night16','night9','night10','night8','night15','night4','night12','night6','night1','night13']],
 rune:[['rune6','rune11','rune3','rune1','rune0','rune8','rune4','rune7','rune14','rune16','rune2'],['rune15','rune18','rune13','rune17','rune5','rune12','rune11','rune14','rune20','rune16','rune10','rune2']],
 haven:[['haven5','haven25','haven13','haven17','haven18','haven15','haven14','haven1','haven0','haven11','haven3'],['haven24','haven20','haven23','haven4','haven16','haven7','haven8','haven9','haven6','haven10','haven3','haven2','haven12','haven14','haven11']],
 blood:[['blood4','blood18','blood9','blood11','blood15','blood1','blood7','blood13','blood14','blood3','blood5'],['blood6','blood2','blood17','blood19','blood16','blood8','blood5','blood1','blood7','blood0']],
 artifact:[['artifact6','artifact17','artifact13','artifact15','artifact3','artifact12','artifact2','artifact0','artifact10'],['artifact4','artifact18','artifact7','artifact9','artifact5','artifact14','artifact16','artifact1','artifact8','artifact11','artifact17']]
};
for(const [tribe,route,ids] of [['forest',0,['neutral14']],['forest',1,['neutral15']],['royal',1,['neutral14']],['dragon',1,['neutral16']],['night',0,['neutral15']],['night',1,['neutral15']],['rune',0,['neutral14','neutral16']],['haven',0,['neutral17','neutral16']],['haven',1,['neutral16']],['blood',0,['neutral16']],['blood',1,['neutral15']],['artifact',1,['neutral15']]])plans[tribe][route].push(...ids);
plans.royal[0].push('neutral21');plans.royal[1].push('neutral4');plans.night[0].push('neutral21','neutral12');plans.night[1].push('neutral21','neutral12');
for(const [tribe,route,ids]of [['forest',1,['forest21']],['royal',0,['royal22','royal13']],['royal',1,['royal23','royal24']],['rune',0,['rune21']],['night',0,['night19','night21']],['night',1,['night20']],['haven',0,['haven25']],['haven',1,['haven19','haven21']],['blood',0,['blood20']],['blood',1,['blood21']],['artifact',0,['artifact21']],['artifact',1,['artifact20']]])plans[tribe][route].push(...ids);
for(const [t,r,ids]of [['forest',0,['forest22','forest23','forest24']],['dragon',1,['dragon20','dragon21','dragon22','dragon23','dragon24']],['night',0,['night22','night23','night24','night25']],['rune',0,['rune22','rune23','rune24']],['haven',1,['haven22','haven23','haven24']],['blood',0,['blood22','blood23','blood24']],['artifact',1,['artifact22','artifact23','artifact24']]])plans[t][r].push(...ids);
for(const routes of Object.values(plans))for(let i=0;i<routes.length;i++)routes[i]=routes[i].filter(id=>!D.byId[id].retired);
plans.dragon[0].push('forest21');plans.dragon[1].push('dragon8','dragon12');plans.night[1].push('night11','night21');plans.artifact[0].push('artifact19');
const def=c=>D.byId[c.id],mul=c=>c.golden?2:1;
// A build describes a working engine, complementary pieces and expendable fuel.
// Decisions use owned cards and the visible shop, never future rolls or combat results.
const builds={
 forest:[['combo','连携养成',0,['forest4','forest18','forest1'],['forest2','forest15','forest24','forest23','neutral14'],'cycle'],['fairies','妖精召唤',1,['forest6','forest10','forest19'],['forest5','forest17','forest7','forest2','neutral15'],'summon']],
 royal:[['barriers','屏障军团',0,['royal6','royal22','royal15'],['royal2','royal7','royal17','royal5','neutral21'],'combat'],['rally','入场曲军团',1,['royal10','royal18','royal24'],['royal3','royal14','royal21','royal23','neutral14'],'cycle']],
 dragon:[['injury','受伤养成',0,['dragon18','dragon13','dragon3'],['dragon4','dragon16','dragon9','forest21'],'combat'],['tavern','酒馆吞噬',1,['dragon24','dragon17','dragon10'],['dragon15','dragon6','dragon7','dragon13','neutral16'],'cycle'],['discard','弃牌养成',1,['dragon21','dragon12','dragon20'],['dragon8','dragon22','dragon23','dragon24','neutral16'],'cycle']],
 night:[['march','入场军势',0,['night17','night24','night25'],['night5','night18','night4','night15','neutral15'],'summon'],['revival','谢幕复活',1,['night7','night16','night4'],['night10','night15','night21','neutral15','neutral21'],'summon']],
 rune:[['casting','施法成长',0,['rune6','rune7','rune3'],['rune11','rune5','rune10','rune16','neutral14'],'cycle'],['study','研习增幅',1,['rune18','rune17','rune15'],['rune13','rune19','rune3','rune5','neutral16'],'cycle']],
 haven:[['prayer','护符共鸣',0,['haven5','haven18','haven17'],['haven25','haven13','haven14','haven10','neutral17'],'amulet'],['vitality','守护与生命',1,['haven24','haven20','haven16'],['haven3','haven21','haven7','haven8','haven23','neutral16'],'combat']],
 blood:[['pain','自伤养成',0,['blood11','blood18','blood7'],['blood4','blood1','blood9','blood15','neutral16'],'cycle'],['bats','蝙蝠复生',1,['blood6','blood19','blood21'],['blood2','blood17','blood7','blood16','neutral15'],'summon'],['feast','酒馆吞噬',0,['blood24','blood23','blood9'],['blood11','blood22','dragon24','neutral16'],'combat']],
 artifact:[['modules','武装养成',0,['artifact17','artifact6','artifact13'],['artifact3','artifact21','artifact15','artifact23','artifact10'],'cycle'],['relics','造物连携',1,['artifact24','artifact7','artifact18'],['artifact4','artifact16','artifact22','artifact23','neutral15'],'summon']]
};
for(const [tribe,rows]of Object.entries(builds))builds[tribe]=rows.map(([id,name,route,core,support,style])=>({id:tribe+'-'+id,name,route,core,support,style}));
const buildFor=a=>(builds[a.tribe]||[]).find(b=>b.id===a.buildId);
const allowedPiece=(a,id)=>D.byId[id]&&!D.byId[id].retired&&(D.byId[id].tribe==='neutral'||D.tribesOf(id).some(t=>(a.activeTribes||D.tribeIds).includes(t)));
function buildEvidence(a,b){
 const owned=[...a.board,...a.hand];let n=0;
 for(const id of b.core){const cs=owned.filter(c=>c.id===id);if(cs.length)n+=12+Math.min(8,cs.reduce((v,c)=>v+(c.golden?5:2),0));}
 for(const id of b.support)if(owned.some(c=>c.id===id))n+=4;
 // Accumulated resources are evidence of an investment, not free combat stats.
 const p=S.read(a);
 if(b.id==='forest-combo')n+=Math.min(10,p.totalPlayed/12);
 if(b.id==='forest-fairies')n+=Math.min(10,p.fairy/10);
 if(b.id==='dragon-tavern'||b.id==='blood-feast')n+=Math.min(10,(p.tavernAttack+p.tavernHealth)/15);
 if(b.id==='dragon-discard')n+=Math.min(10,(a.stats?.discards||0)/2);
 if(b.id==='rune-study')n+=Math.min(10,p.spellcraft/4);
 if(b.id==='rune-casting')n+=Math.min(10,(a.spells||0)/8);
 if(b.id==='haven-prayer')n+=Math.min(10,p.prayers+a.amulets.length*2);
 if(b.id==='night-march')n+=Math.min(10,p.battleEntries/8);
 if(b.id==='artifact-modules')n+=Math.min(10,p.arms/10);
 if(b.id==='artifact-relics')n+=Math.min(10,(a.scrap||0)/8+p.constructTypes.length);
 if(b.id==='blood-pain'||b.id==='blood-bats')n+=Math.min(8,(a.bloodDamage||0)/8);
 return n;
}
function selectBuild(a){
 const candidates=builds[a.tribe]||[],old=buildFor(a);
 const ranked=candidates.map(b=>({b,score:buildEvidence(a,b)+(b.route===a.route?1:0)+a.shop.filter(c=>b.core.includes(c.id)&&def(c).cost<=a.gold&&!a.board.some(x=>x.id===c.id)).length*2})).sort((x,y)=>y.score-x.score);
 let best=ranked[0]?.b;if(old&&best&&best!==old&&ranked[0].score<buildEvidence(a,old)+8)best=old;
 if(best){a.buildId=best.id;a.route=best.route;}return best;
}
function currentPlan(a){const b=buildFor(a);return b?[...new Set([...b.core,...b.support,...plans[a.tribe][b.route]])].filter(id=>allowedPiece(a,id)):plans[a.tribe][a.route];}
const buildPhase=a=>{const b=buildFor(a);return b&&b.core.every(id=>a.board.some(c=>c.id===id))?'operate':'assemble';};
function formationValue(a){
 const b=buildFor(a);if(!b)return 0;const core=b.core.filter(id=>a.board.some(c=>c.id===id)),support=b.support.filter(id=>a.board.some(c=>c.id===id));
 const pairs=core.length*(core.length-1)/2;
 // Reward assembling complementary pieces over collecting duplicates of one role.
 let n=core.length*18+pairs*38+Math.min(4,support.length)*core.length*8;
 if(b.style==='cycle'&&core.length>=2&&a.board.length===6)n+=20;
 if(b.style==='summon'&&a.board.some(c=>D.abilityIds.lastWords.includes(c.id)))n+=core.length*12;
 return n*Math.min(1,Math.max(.2,(a.round-3)/6));
}
function openingCardValue(a,c){
 const d=def(c);
 if(d.type==='minion'){let v=power(c);if(D.fanfareIds.includes(c.id))v+=Math.min(8,Math.max(0,canCycle(a,c))*.2);if(normalCopies(a,c.id)>=2)v+=15;return v;}
 if(d.type!=='spell')return 0;
 if(d.effect==='randomRecruit'){const pool=D.discoveryPool(a,d);return pool.length?pool.reduce((n,x)=>n+power({...x,golden:false}),0)/pool.length+2:0;}
 if(d.effect==='pilfer'){const pool=a.shop.filter(x=>def(x).type==='minion');return pool.length?pool.reduce((n,x)=>n+power(x),0)/pool.length:0;}
 return Math.max(0,spellValue(a,d))*.65;
}
function openingPlan(a,E){
 if(a.round!==2||a.tier!==1||!a.board.length||E.upgradeCost(a)>a.gold)return null;
 const offers=a.shop.filter(c=>def(c).cost>0&&def(c).cost<=a.gold&&['minion','spell'].includes(def(c).type)),h=D.heroes.find(h=>h.id===a.hero);let best={value:0,buys:[],power:false};
 function visit(i,cost,items,value){
  const left=a.gold-cost;let score=value+left*.6,power=false;
  if(a.hero==='olivia'&&!a.powerUsed&&!a.heroSpellCopy&&left>=h.cost){const spells=items.filter(c=>def(c).type==='spell'&&!['coin','deferGold','bloodImmunity'].includes(def(c).effect));const extra=Math.max(0,...spells.map(c=>openingCardValue(a,c)));if(extra>h.cost*.6){score+=extra-h.cost*.6;power=true;}}
  if(score>best.value)best={value:score,buys:items.map(c=>c.uid),power};
  if(items.length>=3)return;for(let j=i;j<offers.length;j++){const c=offers[j];if(cost+def(c).cost<=a.gold)visit(j+1,cost+def(c).cost,[...items,c],value+openingCardValue(a,c));}
 }
 visit(0,0,[],0);const upgradeValue=14+(a.gold-E.upgradeCost(a))*.6;
 return {...best,upgrade:best.value<=upgradeValue,upgradeValue};
}
const normalCopies=(a,id)=>[...a.board,...a.hand].filter(c=>c.id===id&&!c.golden).length;
const count=(a,id)=>a.board.filter(c=>c.id===id).reduce((n,c)=>n+mul(c),0);
const tribeCount=(a,t)=>a.board.filter(c=>D.isTribe(c,t)).length;
function selfHarmOpportunities(a){return a.board.filter(c=>['bloodGrow','pactEnd','smallFeast','bloodFeast'].includes(def(c).effect)).length+a.shop.filter(c=>def(c).purchaseSelfHarm&&def(c).cost<=a.gold).length+a.hand.filter(c=>['bloodGold','chosenFeast','bloodGift','pactPainGift','bloodShelter'].includes(def(c).effect)).length+(['blood','medusa'].includes(a.hero)&&!a.powerUsed?1:0)+a.amulets.reduce((n,c)=>n+(def(c).effect==='bloodMoon'?3:def(c).effect==='bloodGarden'?1:0),0);}
function painFeastValue(a){if(a.hp<=1&&!S.selfHarmImmune(a))return 0;const foods=a.shop.filter(c=>def(c).type==='minion').sort((x,y)=>y.attack-x.attack||y.health-x.health),kings=a.board.filter(c=>def(c).effect==='painFeast');return kings.reduce((n,c,i)=>n+(foods[i]?(foods[i].attack+foods[i].health)*mul(c):0),0);}
function pendingSelfHarm(a){if(S.selfHarmImmune(a))return 0;const end=1+S.echoCount(a,'endEcho'),amulet=1+S.echoCount(a,'prayerEcho');return a.board.filter(c=>['bloodGrow','pactEnd'].includes(def(c).effect)).length*end+(a.amulets.filter(c=>def(c).effect==='bloodGarden'&&c.count<=1).length*2+a.amulets.filter(c=>def(c).effect==='bloodMoon'&&c.count<=1).length*3)*amulet+a.board.reduce((n,c)=>n+(def(c).effect==='bloodFeast'?2:def(c).effect==='smallFeast'?1:0),0)*end;}
function bloodReserve(a){return 6+pendingSelfHarm(a);}
function canPayBattlecry(a,c){if(S.selfHarmImmune(a))return true;const n=['bloodGold','chosenFeast'].includes(def(c).effect)?2:['bloodGift','pactPainGift'].includes(def(c).effect)?1:0;if(!n)return true;return a.hp-n*(1+S.echoCount(a,'fanfareEcho')+(a.heroCry?1:0))>=bloodReserve(a);}
function carry(c){if(c.keywords.includes('cannotAttack'))return .45;return def(c).effect==='cleave'?3:c.heroWindfury||def(c).effect==='double'||['forest1','forest3','royal5','dragon9'].includes(c.id)?1.8:1;}
function power(c){return Math.sqrt(Math.max(1,c.attack)*Math.max(1,c.health))*1.8*Math.sqrt(carry(c))+Math.sqrt(S.shieldCount(c))*Math.min(30,c.attack*.5+c.health*.15)+(c.keywords.includes('taunt')?1:0)+(def(c).effect==='reborn'||def(c).reborn?5:0)+(c.keywords.includes('destruction')?35:0)+(c.keywords.includes('stealth')?6:0);}
const army=a=>a.progress?.fairy||0;
const expectedPlays=a=>Math.max(a.played||0,Math.min(24,a.previousPlayed||3));
const forestSummons=a=>a.board.reduce((n,c)=>n+(def(c).brood?.id==='fairy'?def(c).brood.count:c.id==='forest0'?1:c.id==='forest5'?2:c.id==='forest19'?3:0),0);
function comboValue(a){
 const forest=tribeCount(a,'forest'),strength=army(a);
 // Amortize one three-card sequence; generated cards can complete it for little gold.
 return ((a.hero==='forest'?a.board.length*2:0)+a.board.filter(c=>c.id==='forest1').reduce((n,c)=>n+S.comboPower(a,c,(Math.floor((a.played||0)/3)+1)*3)*2,0)+a.board.filter(c=>c.id==='forest4').reduce((n,c)=>n+S.comboPower(a,c,(Math.floor((a.played||0)/3)+1)*3)*2,0)*Math.max(0,forest-1))/3;
}
function protectedForestPiece(a,c){
 if(a.board.some(x=>x.uid!==c.uid&&x.id===c.id))return false;
 if(plans[a.tribe]?.[a.route]?.slice(0,3).includes(c.id)&&tribeCount(a,a.tribe)>=2)return true;
 if(a.tribe==='royal'&&tribeCount(a,'royal')>=2&&(a.route===0?['royal15','royal7']:['royal3','royal10','royal14']).includes(c.id))return true;
 if(a.tribe==='dragon'&&a.route===0){if(c.id==='dragon3')return a.board.some(x=>['dragon4','dragon13','dragon18'].includes(x.id));if(['dragon2','dragon13'].includes(c.id)&&a.board.some(x=>x.id==='dragon3')&&a.board.filter(x=>['dragon2','dragon13'].includes(x.id)).length===1)return true;}
 if(a.tribe!=='forest')return false;
 if(c.id==='forest4')return a.route===0;
 const build=buildFor(a);if(build?.core.includes(c.id)&&a.board.some(x=>x.uid!==c.uid&&build.core.includes(x.id)))return true;
 if(c.id==='forest3')return a.route===0&&army(a)>=8&&count(a,'forest4')>0;
 if(c.id==='forest6')return forestSummons(a)>=1;
 if(c.id==='forest5')return count(a,'forest6')>0||army(a)>=8;
 if(c.id==='forest7')return army(a)>=8&&tribeCount(a,'forest')>=3;
 return (c.id==='forest0'||def(c).brood?.id==='fairy')&&a.route===1&&count(a,'forest6')>0&&forestSummons(a)<=2;
}
function cycleBudget(a,gain){return gain*(a.tribe==='royal'&&(S.echoCount(a,'fanfareEcho')||count(a,'royal10'))?3:a.tribe==='forest'&&count(a,'forest4')?2:1.2);}
function resurrectionValue(a,source){let grave=a.grave,value=0;for(const c of a.board.filter(x=>x.id!=='night7'&&!def(x).token).sort((x,y)=>power(y)-power(x))){if(grave<3)continue;grave-=3;value+=power(c)*.85;}return value*(a.board.some(c=>c.uid!==source.uid&&c.id==='night7')?.15:1);}
function graveReserve(a){return (count(a,'night16')?6*(1+S.echoCount(a,'lastWordsEcho')):0)+(count(a,'night21')?4:0)+(count(a,'night7')?a.board.filter(c=>c.id!=='night7'&&!def(c).token).reduce(n=>n+3,0):0);}
function synergyValue(a,c){
 const effect=def(c).effect;
 if(effect==='fanfareEcho'){const cries=a.board.filter(x=>D.fanfareIds.includes(x.id)).length+a.hand.filter(x=>D.fanfareIds.includes(x.id)).length;return cries?Math.max(2,expectedPlays(a))*cries*7*mul(c):0;}
 if(effect==='lastWordsEcho')return a.board.filter(x=>x.uid!==c.uid&&D.abilityIds.lastWords.includes(x.id)).reduce((n,x)=>n+12+power(x)*.4,0)*mul(c);
 if(effect==='endEcho')return a.board.filter(x=>x.uid!==c.uid&&def(x).effect!=='endEcho'&&D.endRecruitEffects.includes(def(x).effect)).reduce((n,x)=>n+Math.max(4,synergyValue(a,x)),0)*mul(c);

 const utility={bellLast:4*mul(c),vitalityCry:Math.min(2,a.board.length)*3*mul(c),amuletGift:a.amulets.length<S.amuletCapacity(a)?14*mul(c):3,smallSpellGift:8*mul(c)+comboValue(a),clockCry:a.amulets.reduce((n,x)=>n+(x.count<=mul(c)?15:5),0),ambushSupport:Math.min(2,a.board.filter(x=>x.uid!==c.uid&&!x.keywords.includes('cannotAttack')&&x.attack>0).length)*12*mul(c)};if(Object.hasOwn(utility,def(c).effect))return utility[def(c).effect];
 const m=mul(c),all=a.board.length,tribe=tribeCount(a,def(c).tribe),shields=a.board.filter(x=>x.keywords.includes('shield')).length;
 const strength=army(a),summons=forestSummons(a),plays=expectedPlays(a),forest=tribeCount(a,'forest'),spellPlays=Math.max(2,a.previousSpellsThisRound||2);
 const summonedBonus=0,tokenBase=(c.id==='forest5'?3:1)*m+strength+summonedBonus;
 // Discount summon value for board space and losing its support before the deathrattle.
 const fairyBody=c.id==='forest5'?Math.sqrt((tokenBase+Math.floor(c.attack/2))*(tokenBase+Math.floor(c.health/2)))*1.8:tokenBase*1.8;
 const batArmy=S.bat(a),batAttack=2*m+Math.floor(c.attack/2)+batArmy+summonedBonus,batHealth=m+Math.floor(c.health/2)+batArmy+summonedBonus;
 const batVolley=a.board.filter(x=>x.id==='blood2').reduce((n,x)=>n+2*(2*mul(x)+Math.floor(x.attack/2)+batArmy+summonedBonus),0);
 const values={forest11:5+comboValue(a),forest2:plays*2+forestSummons(a)*4,blood11:20+(a.hp<=10?15:0)+a.board.filter(c=>['bloodGrow','smallFeast','bloodFeast','pactEnd'].includes(def(c).effect)).length*8,forest8:2+comboValue(a)*2,forest9:0,forest10:summons*c.attack,royal8:Math.min(2,all-1)*4,royal9:Math.floor(S.read(a).buffs/3)*1.8,royal10:tribe*20,dragon8:c.health>=10&&tribe>1?10:2,dragon9:(2+Math.floor(c.health/10))*5,dragon10:(Math.floor(c.attack/4)+Math.floor(c.health/4))*2.5,night8:count(a,'night7')*8+count(a,'night9')*5,night9:a.grave>=3?tribe*8:0,night10:power(c)*.8,rune8:spellPlays*(D.tuning.owlAttack+1),rune9:spellPlays*5,rune10:(1+Math.floor(a.spells/3))*spellPlays*2,haven8:0,haven4:Math.max(0,tribe-1)*(2+Math.floor(c.health/4))*1.5,haven9:power(c)*.2,haven10:a.amulets.length*(6+S.prayer(a))*3,blood8:(2+batArmy)*2+(1+batArmy)*2,blood9:foodBody(a,'bloodFeast')*2,blood10:20+a.round*3,artifact8:tribe*3,artifact9:a.scrap,artifact10:Math.max(0,tribe-1)*16,forest0:fairyBody*.7/m,forest1:3*Math.max(1,Math.floor(plays/3))*(Math.max(1,Math.floor(plays/3))+1)*.8,
  forest3:(power({...c,attack:c.attack+strength*m})-power(c))/m,
  forest4:(6+1.5*(Math.max(1,Math.floor(plays/3))+1))*Math.max(0,all-1)*2*Math.max(1,Math.floor(plays/3))*1.25,
  forest5:fairyBody*2*.8/m,
  forest6:summons*3*(Math.max(2,summons)*2+2)*.75,
  forest7:(forest*8+strength*2)*Math.max(0,all-1)*1.4,
  royal1:plays*tribe/Math.max(1,all)*2*D.tuning.royalRecruit,royal3:plays*(6+Math.floor(S.read(a).buffs/10))*2*tribe/Math.max(1,all),royal6:(shields+count(a,'royal15')*3+count(a,'royal7')*2)*tribe*4,royal7:tribe*(a.tribe==='royal'&&a.route===0?16:8)+Math.min(2,Math.max(0,tribe-1))*(a.tribe==='royal'&&a.route===0?28+count(a,'royal6')*10:10),night4:a.board.filter(x=>x.uid!==c.uid&&(def(x).effect==='reborn'||x.heroReborn||['night5','night7','night15'].includes(x.id))).length*Math.max(1,tribe)*6,night7:resurrectionValue(a,c),
  dragon7:c.attack*Math.min(7,2*m)*.8,rune3:3*Math.max(0,spellValue(a,D.byId.mana)),rune4:2*(2+Math.floor(a.spells/4))*.55,
  rune5:Math.min(2,Math.max(0,all-1))*4*spellPlays,rune6:all*4*spellPlays,rune7:a.spells*1.3*Math.max(1,a.board.filter(x=>x.attack>0&&!x.keywords.includes('cannotAttack')).length),
  haven5:a.amulets.length?16+(a.progress?.prayers||0)*1.5:0,haven7:a.board.filter(x=>x.uid!==c.uid).reduce((n,x)=>n+power(x),0)*.35,
  blood4:2*tribe*Math.max(1,count(a,'blood1'))*2,
  blood2:Math.sqrt(batAttack*batHealth)*1.8*2*.75/m,blood6:batVolley*.8,blood7:(a.bloodDamage||0)*all*2.6,
  artifact3:(S.weapon(a).attack+S.weapon(a).health)*2*1.5,artifact4:S.artifactBody(a)*1.8*m*.75,artifact5:tribe*4,artifact7:a.scrap*all*1.6};
 const march=S.read(a).battleEntries,legion=S.read(a).legionAttack;
 values.night2=march*.8+legion;values.night12=4+legion*.6;values.night5=28+legion*2;
 const study=S.spell(a),resonance=S.prayer(a),scrap=a.scrap||0,grave=a.grave||0;
 const extra={amuletCapacity:12+a.amulets.length*8+count(a,'haven5')*12,massCry:Math.max(0,all-1)*12,combatMemory:12+a.board.filter(x=>['forestStart','havenStart','vowAura','careerChorus','royalStart','bloodEmpress','artifactLord'].includes(def(x).effect)).length*35,memoryAura:20+a.board.filter(x=>['forestStart','havenStart','vowAura','healthAvatar','careerChorus','bloodEmpress','artifactLord'].includes(def(x).effect)).length*50,shieldLast:20,spellLast:12+a.tier*3,activeDiscard:10+count(a,'dragon21')*10,destinySupply:16+count(a,'dragon21')*8,graveNourish:a.grave>=4?(3+Math.floor(march/5))*4:3,graveDiscovery:a.grave>=3?14:2,smallFeast:foodBody(a,'bloodFeast')*.75,relicSalvage:8+count(a,'artifact21')*3,entryCannon:march*Math.max(1,Math.floor((all-1+summons)/2))*.6,treasureWages:(a.goldSpentThisRound||0)>=8?6:Math.min(6,a.gold||0),venomOnce:22,venom:30,odinRevenge:40,careerVanguard:S.read(a).totalPlayed*1.6,careerChorus:S.read(a).totalPlayed*Math.max(0,all-1)*1.6,comboReserve:Math.floor(plays/6)*8,discardWing:4,discardMarket:6,pydon:32+(S.read(a).tavernAttack+S.read(a).tavernHealth)*2,discoverLowSpell:12,spellGuard:spellPlays*3,spellUpgradeEnd:20,boneAvenger:summons*3,rebornSkeleton:12+legion*2,legionHealth:(6+2*legion)*summons,guardNest:22,healthToAttack:Math.max(0,...a.board.map(x=>Math.abs(x.health-x.attack))),guardVitals:a.board.filter(x=>x.keywords.includes('taunt')).length*Math.max(0,...a.board.map(x=>x.health))/3,chosenFeast:a.board.some(x=>x.uid!==c.uid)?foodBody(a,'bloodFeast'):0,feastBroker:(count(a,'blood9')+count(a,'dragon17')+1)*12,feastBanquet:foodBody(a,'bloodFeast')*2,painFeast:foodBody(a,'bloodFeast')*Math.min(4,selfHarmOpportunities(a)),constructCache:14,constructSpectrum:expectedPlays(a)*3,constructUnity:S.read(a).constructTypes.length*(1+Math.floor(S.read(a).arms/6))*summons*3,shieldAura:shields*6+count(a,'royal13')*18,buffWitness:all*4,buffConductor:all*8,shieldSupply:18+shields*2,fairyGuardian:(forestSummons(a)+a.board.filter(x=>x.uid!==c.uid&&(D.isTribe(x,'forest')||D.isTribe(x,'dragon'))).reduce((n,x)=>n+(x.heroWindfury||def(x).effect==='double'||['forest1','dragon6','dragon9'].includes(x.id)?2:1),0))*5,spellReserve:8+Math.min(5,(a.spellNamesThisRound||[]).length)*5,graveKeeper:summons*3,rebornChoir:summons*all*2,graveWorkshop:a.grave>=6?14:3,healthGift:6,prayerStrike:a.amulets.length*Math.max(0,...a.board.map(c=>c.health))/4,guardRetribution:c.health*1.2,bloodShelter:Math.max(0,all-1)*2,batRebirth:(a.board.filter(x=>x.id==='bat').length+count(a,'blood8')*2+count(a,'blood2')*2+count(a,'blood16')+count(a,'blood19')*3)*(8+count(a,'blood6')*(2+batArmy)+count(a,'blood17')*tribe*3),tokenForge:summons*(2+Math.floor(a.scrap/3))*2,scrapArmament:spellPlays*S.growthAmount(a,'scrapArmament')*2,discoverHighSpell:20+study*4,discoverRoyal:16+count(a,'royal14')*8+count(a,'royal10')*10,coinGift:5,constructPair:20+count(a,'artifact5')*10,replicaGift:5,radiantLast:c.attack, researchLast:9,fairyGift:4,forestTrade:7,comboStudy:plays*3,fairyEnd:12,fairyRally:Math.min(2,Math.max(0,all-1))*8,fairyMemorial:summons*forest*4,comboHarvest:plays*4*Math.min(2,all),fairyCrown:(c.attack+c.health/2+strength*2)*1.2,
 layeredGuard:10+count(a,'royal15')*12+count(a,'royal7')*6,shieldMentor:shields*8,shieldChampion:(shields+count(a,'royal15')*2)*8,shieldResearch:(shields+count(a,'royal15'))*10,knightGift:4,guardCry:8,guardSupply:10+S.spell(a)*2,cryChampion:plays*8,shieldRelay:Math.max(0,Math.min(2,tribe-1))*(16+count(a,'royal6')*tribe*4),royalStudy:18,shieldMarshal:a.board.reduce((n,c)=>n+S.shieldCount(c),0)*tribe*4,buffCommander:(4+Math.floor(S.read(a).buffs/10))*all*2,cryAcademy:plays*3,
 marketMealGift:Math.max(5,spellValue(a,D.byId.marketMeal)),shopCry:a.shop.filter(c=>def(c).type==='minion').length*2,tavernCry:24,tavernLast:14,tavernSupply:18+study*3,tavernFury:45+count(a,'dragon3')*20,tavernPlay:expectedPlays(a)*12,dragonFeast:foodBody(a,'dragonFeast')*Math.min(2,Math.max(0,tribe-1))*1.5,dragonDrill:18,dragonVitality:(6+a.board.filter(c=>D.isTribe(c,'dragon')).reduce((n,c)=>n+c.health,0)/Math.max(1,tribe)/10)*tribe*7,
 legionLast:Math.max(2,tribe)*9,legionEngine:Math.max(2,count(a,'night5')*4+count(a,'night14')*2+count(a,'night12'))*Math.max(2,tribe)*2,rebornGrant:Math.max(0,...a.board.filter(x=>x.uid!==c.uid&&def(x).effect!=='reborn'&&!x.heroReborn).map(x=>power(x)+legion))*0.8,marchArmy:Math.max(1,march)*3+legion, skeletonGift:4,graveEnd:8,deathStudy:18,graveSupply:grave>=3?10:0,graveStudy:grave>=6?25:4,graveLegacy:grave>=6?24*tribe:0,graveLord:grave>=6?(3+Math.floor((grave-6)/5))*tribe*3:0,graveArmy:(c.attack+c.health+grave*4)*.9,
 spellTrade:Math.max(1,Math.floor(plays/3))*Math.max(0,spellValue(a,D.byId.mana)),studyCry:6,thirdStudy:spellPlays*3.5,growthSupply:2*Math.max(0,spellValue(a,D.byId.growth)),studyEcho:Math.ceil(study/2)*spellPlays*4,manaBundle:16+study*4,studyEnd:24,studyRally:Math.max(study,3)*all*spellPlays*.8,
 bellGift:5,guardNurse:tribe>1?a.amulets.length*6+count(a,'haven3')*5:0,prayerStudy:a.amulets.length*9,clockSupply:a.amulets.length*12,prayerCry:17,prayerGiant:resonance*4,healthAvatar:c.health*2,guardWitness:a.board.filter(x=>x.uid!==c.uid&&x.keywords.includes('taunt')).length*15,bloodEdge:8,prayerChoir:(4+resonance)*tribe*a.amulets.length*2,prayerEcho:a.amulets.length*(15+resonance*all*2),healthReliquary:a.amulets.length*c.health*a.board.filter(x=>D.isTribe(x,'haven')&&def(x).effect!=='healthReliquary').length,
 wingGift:Math.max(0,spellValue(a,D.byId.dragonWing)),pactPainGift:6+count(a,'blood4')*tribeCount(a,'blood')*4,pactGift:6,bloodTavern:Math.max(1,selfHarmOpportunities(a))*30,bloodBud:count(a,'blood1')*4+3,pactEnd:8+study*2,bloodStudy:Math.max(1,count(a,'blood1'))*16,batSupply:batArmy*4+10,batMemorial:tribe*Math.max(1,count(a,'blood2')*2+count(a,'blood19')*3)*5,bloodVein:tribe*(2+Math.floor((a.bloodDamage||0)/5))*Math.max(1,count(a,'blood1')),batAvenge:(S.batAvengeBody(a,m)+batArmy)*Math.max(1,Math.floor((all-1)/2))*1.4/m,
 analyzerGift:4,moduleBundle:(S.weapon(a).attack+S.weapon(a).health+study*2)*2,moduleStudy:spellPlays*8,scrapVeteran:(2+Math.floor(scrap/5))*tribe*3,forgeEnd:32,scrapCry:tribe*6,moduleRally:4*tribe*spellPlays*2,scrapCrown:(c.attack+c.health+scrap*4)*.9};
 if(def(c).brood){const b=def(c).brood,n=b.id==='fairy'?strength:b.id==='bat'?batArmy:0,atk=b.attack*m+n+(D.isTribe(b,'night')?legion:0),hp=b.health*m+n+(b.inheritHealth?Math.floor(c.health/2):0);return Math.sqrt(atk*hp)*1.8*b.count*.8+(b.id==='fairy'?count(a,'forest6')*b.count*6+count(a,'forest10')*b.count*10:b.id==='bat'?count(a,'blood6')*atk*b.count:count(a,'artifact5')*b.count*6);}
 const e=def(c).effect,base={summonBuff:3,shieldBuff:2,rallyCry:5,legionEngine:1,graveLegacy:12,spellHealth:2,guardWitness:3,batQueen:1,moduleRally:4,artifactLord:Math.max(1,a.scrap||0)}[e];
 return (values[c.id]||extra[e]||0)*(base?S.growthAmount(a,e,c)/base:1)*m;
}
function unitValue(a,c,plan){
 const d=def(c),rank=plan.indexOf(c.id),same=D.isTribe(d,a.tribe);
 // A foreign engine has less reliable support in a fixed-route shopping plan.
 let value=power(D.isTribe(d,'night')?{...c,attack:c.attack+S.read(a).legionAttack}:c)+d.tier*2+(same?4:0)+synergyValue(a,c)*(same||D.isTribe(d,'neutral')?1:.85);
 if(d.effect==='activeForge')value+=12+count(a,'dragon21')*tribeCount(a,'dragon')*5;
 if(d.effect==='activeResearch')value+=same?18:6;
 if(d.effect==='discardRally')value+=tribeCount(a,'dragon')*(count(a,'dragon20')+1)*(S.growthAmount(a,'discardRally')*2+1)*mul(c);
 if(d.effect==='modalCry')value+=Math.max(4,tribeCount(a,d.tribe)*(c.id==='forest20'?4:6))*mul(c);
 if(rank>=0)value+=(rank<3?45:25)*(a.round<5?.55:1);
 const build=buildFor(a);if(build?.core.includes(c.id))value+=a.board.some(x=>x.uid!==c.uid&&build.core.includes(x.id))?25:10;
 if(c.golden)value+=12;
 // A second engine is valuable, but diversifying into its payoff is better.
 const others=a.board.filter(x=>x.uid!==c.uid&&x.id===c.id);
 if(others.length)value-=others.some(x=>x.golden)?15:others.length*5;
 if(d.token)value-=7;
 return value;
}
// Compare complete formations so small engines get credit for improving existing allies.
const growthEffects=new Set(['combatMemory','memoryAura','guardVitals','studyEcho','studyRally','spellHealth','studyEnd','thirdStudy','prayerStudy','prayerChoir','healthReliquary','buffCommander','royalDrill','cryChampion','cryAcademy','rallyCry','combo','summonBuff','fairyRally','bloodTavern','bloodVein','bloodStudy','moduleRally','forgeEnd','constructSpectrum','painFeast','discardRally','pydon','graveNourish','tavernFury']);
function boardValue(a,plan){return formationValue(a)+a.board.reduce((n,c)=>n+unitValue(a,c,plan)+(growthEffects.has(def(c).effect)?synergyValue(a,c)*(a.hp+(a.armor||0)<=10?1:2):0),0);}
function replacement(a,c,plan){const before=boardValue(a,plan);let best=null;for(const old of a.board){const board=a.board.map(x=>x.uid===old.uid?c:x),after=boardValue({...a,board},plan),gain=after-before;if(!best||gain>best.gain)best={old,gain};}return best;}
function weakest(a,plan){const replaceable=a.board.filter(c=>!protectedForestPiece(a,c));return [...(replaceable.length?replaceable:a.board)].sort((x,y)=>unitValue(a,x,plan)-unitValue(a,y,plan))[0];}
function cycleSlot(a,plan){return a.board.filter(c=>!protectedForestPiece(a,c)&&!plan.slice(0,3).includes(c.id)).sort((x,y)=>unitValue(a,x,plan)-unitValue(a,y,plan))[0];}
function canCycle(a,c){
 if(c.golden)return 0;
 let gain=0;
 if(def(c).effect==='modalCry')gain=Math.max(4,tribeCount(a,def(c).tribe)*(c.id==='forest20'?4:6));
 if((def(c).synergy||['vitalityCry','amuletGift','smallSpellGift','clockCry'].includes(def(c).effect))&&D.fanfareIds.includes(c.id))gain=synergyValue(a,c);
 if(def(c).legionCry)gain=def(c).legionCry*(tribeCount(a,'night')+a.board.filter(x=>D.abilityIds.lastWords.includes(x.id)||def(x).effect==='reborn').length*2);
 if(c.id==='forest8')gain=4;
 if(c.id==='royal8')gain=Math.min(2,a.board.length)*4;
 if(c.id==='artifact8')gain=5+count(a,'artifact5')*3;
 if(c.id==='rune9')gain=2*(8+count(a,'rune6')*a.board.length*S.growthAmount(a,'spellHealth')*2+count(a,'rune10')*(1+Math.floor(a.spells/3))*2);
 if(def(c).effect==='massCry')gain=a.board.length*12;
 if(c.id==='neutral1')gain=Math.min(2,a.board.length)*2*D.tuning.neutralEntry;
 
 if(c.id==='rune1')gain=4+count(a,'rune6')*a.board.length*8+count(a,'rune5')*8;
 if(c.id==='artifact0')gain=Math.max(0,spellValue(a,D.byId.module));
 if(def(c).token)gain+=count(a,'forest2')*2;
 if(c.id==='forest0')gain=2;
 if(c.id==='haven1')gain=3+(a.amulets.length?7+count(a,'haven5')*5:0);
 if(c.id==='blood3'&&a.hp>bloodReserve(a)+2)gain=5+count(a,'blood4')*tribeCount(a,'blood')*4;
 if(c.id==='blood0'&&a.hp>10)gain=count(a,'blood4')*8;
 if(['bloodGold','chosenFeast','bloodGift','pactPainGift','bloodShelter'].includes(def(c).effect)&&canPayBattlecry(a,c))gain+=painFeastValue(a);
 
 if(D.isTribe(c,'royal'))gain+=a.board.filter(x=>x.id==='royal1'&&x.uid!==c.uid).reduce((n,x)=>n+mul(x),0)*2*D.tuning.royalRecruit;
 if(c.id==='night1')gain=count(a,'night7')*3;
 const fuel=c.id==='forest8'?3:['forest0','royal11','blood0'].includes(c.id)?2:c.id==='rune1'?3:1;
 gain+=comboValue(a)*fuel;
 if(D.fanfareIds.includes(c.id)){gain+=count(a,'royal10')*tribeCount(a,'royal')*10;gain*=1+S.echoCount(a,'fanfareEcho');}
 gain+=a.board.filter(x=>x.uid!==c.uid&&def(x).effect==='spellTrade').reduce((n,x)=>n+mul(x),0)*Math.max(0,spellValue(a,D.byId.mana));
 return gain;
}
function guardRemovalValue(a,c){if(!c.keywords.includes('taunt'))return -100;const protectedEffect=['healthChoir','prayerBastion','prayerChoir','prayerEcho','amuletEnd','dragonVitality','spellHealth','studyEcho','studyRally','summonBuff','fairyMentor','fairyMemorial','batMemorial','legionEngine','nightStart','havenStart'].includes(def(c).effect),anotherGuard=a.board.some(x=>x.uid!==c.uid&&x.keywords.includes('taunt'));return protectedEffect?18+(anotherGuard?10:0):carry(c)>1&&anotherGuard?10:-100;}
function spellTarget(a,d){
 let targets=a.board;
 if(d.effect==='removeGuard')targets=targets.filter(c=>guardRemovalValue(a,c)>0);
 if(d.effect==='dragonWing')targets=targets.filter(c=>c.health+2+S.spell(a)>(c.dragonPings||0)+3||D.isTribe(c,'dragon')&&(count(a,'dragon18')||c.id==='dragon2'));
 if(d.effect==='module')targets=targets.filter(c=>D.isTribe(c,'artifact'));
 if(d.effect==='shield')targets=targets.filter(c=>S.canStackShield(c)||!c.keywords.includes('shield'));
 if(!targets.length)return null;
 return [...targets].sort((x,y)=>targetValue(a,y,d)-targetValue(a,x,d))[0];
}
function targetValue(a,c,d){
 if(d.effect==='removeGuard')return guardRemovalValue(a,c);
 if(d.effect==='copyRecruit')return (normalCopies(a,c.id)>=2?100:0)+def(c).tier*10+(plans[a.tribe]?.[a.route]?.includes(c.id)?30:0);
 let n=power(c)*.12+carry(c)*8;
 if(d.effect==='module')n+=c.id==='artifact6'?24:c.id==='artifact2'?18:0;
 if(['forest5','night5','blood2','forest19'].includes(c.id))n+=12;
 if(c.id==='forest10')n+=forestSummons(a)*12;
 if(c.id==='dragon7')n+=24;
 if(c.id==='rune7')n+=(a.spells||0)*.15;
 if(d.effect==='guard')n+=c.keywords.includes('taunt')?12:c.health*.1;
 if(d.effect==='shield')n+=(c.attack*.45+carry(c)*8)/(1+S.shieldCount(c))+(D.isTribe(c,'royal')?count(a,'royal17')*8+count(a,'royal6')*5:0);
 if(d.effect==='dragon'&&D.isTribe(c,'dragon'))n+=10;
 if(d.effect==='dragonWing'){n+=D.isTribe(c,'dragon')?count(a,'dragon4')*20+count(a,'dragon18')*35:0;n+=c.id==='dragon13'?65:c.id==='dragon2'?18:0;n-=S.shieldCount(c)*12+(c.dragonPings||0)*2;}
 if(d.effect==='bloodPact'&&c.id==='blood5')n+=6;
 if(count(a,'rune5')){const i=a.board.indexOf(c);n+=(a.board[i-1]?6+carry(a.board[i-1]):0)+(a.board[i+1]?6+carry(a.board[i+1]):0);}
 return n;
}
function spellValue(a,d){if(d.effect==='bloodImmunity'){if(S.selfHarmImmune(a))return -100;const exposure=pendingSelfHarm(a)+a.shop.filter(c=>def(c).purchaseSelfHarm).reduce((n,c)=>n+def(c).purchaseSelfHarm,0)+a.hand.filter(c=>['bloodGold','chosenFeast','bloodGift','pactPainGift','bloodShelter'].includes(def(c).effect)).length*2+(['blood','medusa'].includes(a.hero)&&!a.powerUsed?1:0);return exposure?10+exposure*4+(a.hp<=6?15:0):-10;}if(d.effect==='discardEcho')return a.discardEcho?-100:a.hand.filter(c=>['discardWing','discardMarket','discardScrap'].includes(def(c).effect)).length*18-2;if(d.effect==='mining')return Math.max(-10,(15-a.round)*1.5);
 if(d.target&&!spellTarget(a,d))return -100;
 if(d.effect==='removeGuard')return guardRemovalValue(a,spellTarget(a,d));
 if(d.effect==='modalSpell')return Math.max((3+S.spell(a))*6,tribeCount(a,'dragon')*(6+S.spell(a)));
 if(d.effect==='discardExchange')return a.hand.some(c=>c.id!==d.id)||a.hand.filter(c=>c.id===d.id).length>1?8+count(a,'dragon21')*tribeCount(a,'dragon')*5:-100;
 
 if(d.effect==='randomRecruit'){const pool=D.discoveryPool(a,d);return pool.length?pool.reduce((n,c)=>n+handValue(a,{...c,uid:-1,golden:false},plans[a.tribe][a.route]),0)/pool.length*.4+comboValue(a):-100;}
 if(d.effect==='copyRecruit'){const c=spellTarget(a,d);return handValue(a,{...def(c),uid:-1,golden:false},plans[a.tribe][a.route])*.6+(normalCopies(a,c.id)>=2?60:0)+comboValue(a);}
 if(d.effect==='marketBuff'){const n=a.shop.filter(c=>def(c).type==='minion').length;return n?(d.attack+d.health+S.spell(a)*2)*Math.min(3,n)+comboValue(a):-100;}
 if(d.effect==='pilfer'){const offers=a.shop.filter(c=>def(c).type==='minion');return offers.length&&a.hand.length<10?offers.reduce((n,c)=>n+unitValue(a,c,plans[a.tribe][a.route]),0)/offers.length*.45+comboValue(a):-100;}
 if(d.effect==='discoverSpell'){const pool=D.discoveryPool(a,d);if(!pool.length||a.hand.length>=10)return -100;const ranked=pool.map(c=>handValue(a,{...c,uid:-1,golden:false},plans[a.tribe][a.route])).sort((x,y)=>y-x);return ranked.slice(0,Math.max(1,Math.ceil(ranked.length/3))).reduce((n,v)=>n+v,0)/Math.max(1,Math.ceil(ranked.length/3))*.5+comboValue(a);}
 if(d.effect==='bloodContract')return a.hand.length>=9?-100:2*Math.max(0,spellValue(a,D.byId.bloodPact))+comboValue(a);
 if(d.effect==='tavernSpell')return ((d.attack||2)+(d.health||2)+S.spell(a)*2)*(d.buffRepeats||1)*(2+count(a,'dragon17')*2+count(a,'blood9'))+comboValue(a);
 if(d.effect==='coin')return 5+comboValue(a);
 if(d.effect==='deferGold')return a.round<16?4+comboValue(a):0;
 if(d.effect==='clock'&&!a.amulets.length)return -100;
 if(d.effect==='ritual'&&(!a.grave||(graveReserve(a)&&a.grave<Math.max(12,graveReserve(a))*3)))return -100;
 if(d.effect==='bones'&&!tribeCount(a,'night'))return -100;
 const engine=count(a,'rune6')*a.board.length*S.growthAmount(a,'spellHealth')*2+count(a,'rune0')*2*D.tuning.starterSpell;
 let effect=d.attack+d.health;
 if(d.effect==='tierBuff')effect=(a.tier+S.spell(a))*2;
 if(d.effect==='teamBuff')effect=a.board.length*((d.attack?d.attack+S.spell(a):0)+(d.health?d.health+S.spell(a):0));
 if(d.effect==='menagerieBuff')effect=new Set(a.board.flatMap(c=>D.tribesOf(c)).filter(t=>t!=='neutral')).size*(d.attack+d.health+S.spell(a)*2);
 if(d.effect==='team'||d.effect==='fortify')effect=a.board.length*(d.effect==='team'?4:3);
 if(d.effect==='shield')effect=8+power(spellTarget(a,d))*.2;
 if(d.effect==='guard')effect=6;
 if(d.effect==='dragon')effect=10;
 if(d.effect==='ritual')effect=a.grave*2;
 if(d.effect==='bones')effect=2+count(a,'night7')*(a.grave<graveReserve(a)?12:3);
 if(d.effect==='clock')effect=5+a.amulets.filter(c=>c.count===1).length*6+count(a,'haven5')*5;
 if(d.effect==='bloodPact')effect=6;
 if(d.effect==='dragonWing'){const c=spellTarget(a,d);effect=1+(c.id==='dragon13'?36:0)+(c.id==='dragon2'?6:0)+(D.isTribe(c,'dragon')?count(a,'dragon4')*24+count(a,'dragon18')*60:0);}
 if(d.effect==='module'){effect=S.weapon(a).attack+S.weapon(a).health;const target=spellTarget(a,d);if(target?.id==='artifact2')effect+=2*D.tuning.moduleBonus*mul(target);if(target?.id==='artifact6'){const i=a.board.indexOf(target),adj=[a.board[i-1],a.board[i+1]].filter(c=>c&&D.isTribe(c,'artifact')).length;effect*=1+adj*mul(target);}}
 if(['buff','guard','dragon','ritual','bloodPact','dragonWing','module','fortify','team'].includes(d.effect))effect+=S.spell(a)*(d.effect==='buff'?(d.attack>0?1:0)+(d.health>0?1:0):2);
 if(d.effect==='buff')effect*=d.buffRepeats||1;
 if(d.target)effect*=1+Math.min(2,Math.max(0,a.board.length-1))*count(a,'rune5');
 return effect+engine+comboValue(a);
}
function amuletValue(a,d){if(d.effect==='mine')return Math.max(-10,(13-a.round)*3);
 if(a.amulets.length>=S.amuletCapacity(a))return -100;
 if(['bloodGarden','bloodMoon'].includes(d.effect)&&!S.selfHarmImmune(a)&&a.hp<=bloodReserve(a)+3)return -100;
 let n=5+a.board.length*1.2;
 if(D.isTribe(d,a.tribe))n+=8;
 if(a.tribe==='haven')n+=8+count(a,'haven5')*8+count(a,'haven0')*4;
 if(d.effect==='library')n+=8+count(a,'rune6')*8+count(a,'rune5')*4;
 if(d.effect==='accelerator')n+=count(a,'artifact3')*5;
 if(d.effect==='bell')n+=a.board.length*2;
 const p=S.read(a),amp=S.prayer(a),t=tribeCount(a,d.tribe);
 if(d.effect==='egg')n+=24+count(a,'dragon15')*10+count(a,'blood9')*8;
 if(d.effect==='temple')n+=18+a.board.length*4;
 if(d.effect==='discardRite')n+=count(a,'dragon20')*10+count(a,'dragon21')*6;
 if(d.effect==='fairyGlade')n+=comboValue(a)*2+count(a,'forest16')*8;
 if(d.effect==='fairyRealm')n+=forestSummons(a)*12;
 if(d.effect==='coinVault')n+=15;
 if(d.effect==='frontline')n+=a.board.length*6+(count(a,'royal9')+count(a,'royal16'))*6;
 if(d.effect==='magicField')n+=Math.min(2,a.board.length)*(12+p.spellcraft+Math.floor(p.spellcraft/2))*.7;
 if(d.effect==='dragonCanyon')n+=tribeCount(a,'dragon')*12;
 if(d.effect==='deathBanquet')n+=tribeCount(a,'night')*8+(count(a,'night5')+count(a,'night18')+count(a,'night0'))*12;
 if(d.effect==='boneRing')n+=a.board.length?Math.floor(p.battleEntries/2)*1.5:0;
 if(d.effect==='bloodMoon')n+=(a.hp>1||S.selfHarmImmune(a))?(count(a,'blood4')*tribeCount(a,'blood')*10+count(a,'blood1')*6+count(a,'blood11')*4+painFeastValue(a)*3):0;
 if(d.effect==='ancientAmplifier')n+=t*(3+Math.floor(a.scrap/2));
 if(d.effect==='summit'){const c=a.board[0];n+=c?c.health*.9:0;}
 if(['dragonCanyon','ancientAmplifier'].includes(d.effect)&&!t)return -30;
 return (n+amp*a.board.length*1.5+count(a,'haven18')*12+count(a,'haven13')*8)/(1+(d.count-1)*.2);
}
function handPriority(a,c,plan){const d=def(c);if(d.effect==='bloodImmunity'||d.effect==='discardEcho')return spellValue(a,d)>0?1e8:-1e8;if(d.type==='minion'&&growthEffects.has(d.effect))return 1e6+unitValue(a,c,plan);if(d.type==='spell')return 1e4+spellValue(a,d);return handValue(a,c,plan);}
function handValue(a,c,plan){const d=def(c);if(d.type==='spell')return spellValue(a,d);if(d.type==='amulet')return amuletValue(a,d);return unitValue(a,c,plan)+(normalCopies(a,c.id)>=2?25:0);}
function modeChoice(a,q,E){return E.modeOptions(a,q).map(m=>{let score=0;if(m.kind==='gift')score=a.hand.length>=10?-100:Math.min(m.count,10-a.hand.length)*(m.card==='fairy'?4+comboValue(a):5);if(m.kind==='tribeBuff')score=tribeCount(a,m.tribe)*(m.attack+m.health);if(m.kind==='tavern')score=(m.attack+m.health)*3;return {id:m.id,score};}).sort((x,y)=>y.score-x.score)[0].id;}
function discardScore(a,c,plan){const d=def(c);return ['discardScrap','discardWing','discardMarket'].includes(d.effect)?-30:d.token?0:d.type==='minion'?power(c)+(plan.includes(c.id)?25:0)+(normalCopies(a,c.id)>=2?30:0):d.tier*3+d.cost*2;}
function discardChoice(a,plan,options=a.hand.map(c=>String(c.uid))){return [...a.hand].filter(c=>options.includes(String(c.uid))).sort((x,y)=>discardScore(a,x,plan)-discardScore(a,y,plan))[0];}
function activationArgs(a,c,plan){const d=def(c);if(!d.activation||c.activatedRound===a.round||a.gold<d.activation.cost)return null;if(d.activation.grave&&(a.grave<d.activation.grave||a.hand.length>8))return null;if(d.activation.discard){const fuel=discardChoice(a,plan);return fuel&&(discardScore(a,fuel,plan)<14||a.hand.length>=8)?{uid:c.uid,discardUid:fuel.uid}:null;}return a.board.length>=3||a.gold>=4?{uid:c.uid}:null;}
function foodOffer(a,e){const key=e==='dragonFeast'?'health':'attack',other=key==='health'?'attack':'health';return [...a.shop].filter(c=>def(c).type==='minion').sort((x,y)=>y[key]-x[key]||y[other]-x[other]||x.uid-y.uid)[0];}
function foodBody(a,e){const c=foodOffer(a,e),b=S.tavern(a);return c?c.attack+c.health:6+b.attack+b.health;}
function reserveFood(a,c,plan){if(def(c).type!=='minion'||normalCopies(a,c.id)>=2||(plan.slice(0,3).includes(c.id)&&!a.board.some(x=>x.id===c.id)))return false;const temp={...a,shop:[...a.shop]};for(const x of a.board){const e=def(x).effect;if(e==='feastBanquet'||e==='painFeast'&&selfHarmOpportunities(a)>0||['bloodFeast','smallFeast'].includes(e)&&(a.hp>1||S.selfHarmImmune(a))||e==='dragonFeast'&&tribeCount(a,'dragon')>1){for(let i=0;i<(e==='feastBanquet'?2:1);i++){const food=foodOffer(temp,e);if(food?.uid===c.uid)return true;if(food)temp.shop=temp.shop.filter(y=>y.uid!==food.uid);}}}return false;}
function shopValue(a,c,plan){
 const d=def(c);if(d.cost>a.gold||a.hand.length>=10)return -100;
 if(d.purchaseSelfHarm&&!S.selfHarmImmune(a)&&a.hp<=1)return -100;if(d.purchaseSelfHarm&&!S.selfHarmImmune(a)&&a.hp-d.purchaseSelfHarm<bloodReserve(a))return -100;
 if(d.type==='spell'){const value=spellValue(a,d),echo=a.hero==='olivia'&&!a.powerUsed&&!a.heroSpellCopy&&a.gold>=d.cost+1&&!['coin','deferGold','bloodImmunity','discardEcho'].includes(d.effect)&&value>5;return value*(echo?2:1)/Math.max(1,d.cost+(echo?1:0))+(d.purchaseSelfHarm?(count(a,'blood4')*tribeCount(a,'blood')*2+painFeastValue(a)):0);}
 if(d.type==='amulet')return amuletValue(a,d)/Math.max(1,d.cost);
 if(!canPayBattlecry(a,c))return -100;
 if(reserveFood(a,c,plan))return -100;const copies=normalCopies(a,c.id),v=unitValue(a,c,plan);
 if(copies>=2)return 65+v*.25;
 const operating=buildPhase(a)==='operate',build=buildFor(a),fuel=operating&&['cycle','amulet'].includes(build.style)&&!build.core.includes(c.id)?canCycle(a,c):0;
 const slot=a.board.length>=7?cycleSlot(a,plan):null;
 const fuelScore=fuel>0&&(a.board.length<7||(slot&&power(slot)<cycleBudget(a,fuel)))?12+fuel*.5/Math.max(1,d.cost-1):0;
 if(a.board.length<7)return Math.max(16+v*.4+(copies?7:0),fuelScore);
 const choice=replacement(a,c,plan),improvement=choice?.gain||0;
 if(copies===1&&plan.includes(c.id)&&!a.board.some(x=>x.id===c.id&&x.golden))return 12+v*.16;
 if(improvement>3)return 12+improvement*.4;
 if(fuelScore>0)return fuelScore;
 const cycle=canCycle(a,c);
 if(cycle>0&&(a.board.length<7||(slot&&power(slot)<cycleBudget(a,cycle))))return 4+cycle*.35;
 return -100;
}
function arrange(a,plan,E,doAct){
 // Front-load attackers/deathrattles and protect the engines that must survive.
 const engineIds=new Set(['rune7','forest6','forest7','royal6','royal7','night4','night7','blood6','artifact5','artifact7','haven7','forest10','royal10','artifact10','neutral14','neutral15','neutral16','neutral17']);
 for(const c of D.cards.filter(c=>c.synergy&&!D.fanfareIds.includes(c.id)&&!['constructPair','battleBrood','undyingHounds','legionLast','marchArmy','fairyCrown','graveLegacy','graveArmy','batCrown','scrapCrown','dragonDrill'].includes(c.effect)))engineIds.add(c.id);
 const score=c=>(c.keywords.includes('cannotAttack')?-35:c.keywords.includes('stealth')?-25:0)+carry(c)*12+(c.keywords.includes('shield')?5:0)+(def(c).effect.toLowerCase().includes('death')||['battleBrood','constructPair','undyingHounds','legionLast','marchArmy'].includes(def(c).effect)||['night5','night6','forest0','forest5'].includes(c.id)?15:0)-(engineIds.has(c.id)?40:0);
 const order=[...a.board].sort((x,y)=>score(y)-score(x));
 const swapInto=(id,position)=>{const i=order.findIndex(c=>c.id===id);if(i>=0){const [c]=order.splice(i,1);order.splice(Math.min(position,order.length),0,c);}};
 if(order.some(c=>c.id==='dragon3')){swapInto('dragon3',1);swapInto('dragon2',0);swapInto('dragon4',2);}
 if(order.some(c=>c.id==='dragon3')&&order.some(c=>c.id==='dragon13'))swapInto('dragon13',0);
 if(order.some(c=>c.id==='dragon16'))swapInto('dragon16',Math.min(1,order.length-1));
 const feeder=order.find(c=>c.id==='dragon17');if(feeder){const receivers=order.filter(c=>D.isTribe(c,'dragon')&&c.uid!==feeder.uid&&c.id!=='dragon17').sort((x,y)=>carry(y)*power(y)-carry(x)*power(x)).slice(0,2);const pack=receivers.length?[receivers[0],feeder,...receivers.slice(1)]:[feeder];order.splice(0,order.length,...pack,...order.filter(c=>!pack.includes(c)));}
 const packAround=(source,eligible,rank)=>{if(!source)return;const receivers=order.filter(c=>c!==source&&eligible(c)).sort((x,y)=>rank(y)-rank(x)).slice(0,2);if(!receivers.length)return;const pack=[receivers[0],source,...receivers.slice(1)];order.splice(0,order.length,...pack,...order.filter(c=>!pack.includes(c)));};
 packAround(order.find(c=>c.id==='rune15'),()=>true,c=>power(c)*carry(c));
 packAround(order.find(c=>c.id==='artifact6'),c=>D.isTribe(c,'artifact'),c=>power(c)*carry(c));
 if(order.some(c=>c.id==='neutral9'))swapInto('neutral9',Math.max(1,order.length-2));
 if(order.some(c=>c.id==='royal2'))swapInto('royal2',Math.min(1,order.length-1));
 if(order.some(c=>c.id==='haven6'))swapInto('haven6',Math.min(1,order.length-1));
 if(order.some(c=>c.id==='haven7')&&order.length>1){const receiver=[...order].filter(c=>c.id!=='haven7').sort((x,y)=>carry(y)-carry(x)||power(y)-power(x))[0];order.splice(order.indexOf(receiver),1);order.push(receiver);}
 const memory=order.find(c=>def(c).effect==='memoryAura');
 packAround(memory,c=>def(c).effect!=='combatMemory'&&def(c).effect!=='memoryAura',c=>(def(c).effect==='healthAvatar'?c.health*2:0)+power(c)*carry(c));
 for(let i=0;i<order.length;i++)if(a.board[i]?.uid!==order[i].uid)doAct('moveTo',{uid:order[i].uid,index:i});
}
// Upgrade from a viable board; leave rebuilding money when behind.
function shouldUpgrade(a,E){
 const desired=[1,2,5,7,9,11].filter(r=>r<=a.round).length,cost=E.upgradeCost(a);
 if(a.tier>=desired||!a.board.length||cost>a.gold)return false;
 if(a.round===2&&a.tier===1)return openingPlan(a,E)?.upgrade??true;
 const thin=a.board.length<Math.min(5,a.round-1),critical=a.hp+(a.armor||0)<=12;
 const reserve=critical?6:thin?3:0;
 return cost<=a.gold-reserve;
}
// Only AI refreshes call this aid; offers still require normal purchases and plays.
function lateShopLuck(a,E){
 if(a.round<8||a.tier<4||a.gold<1||a.hand.length>=10||!buildFor(a))return null;
 if(E.rand(a)>=(a.round>=12?.65:.4))return null;
 const b=buildFor(a),plan=currentPlan(a),operating=buildPhase(a)==='operate',owned=[...a.board,...a.hand],market=S.tavern(a);
 const old=a.shop.map((c,index)=>({c,index,value:shopValue(a,c,plan)}));
 const candidates=[];
 for(const d of E.pool(a,[...D.cards,...D.spells,...D.amulets])){
  if(d.tier>a.tier||d.cost>a.gold||a.shop.some(c=>c.id===d.id))continue;
  const c={...d,uid:-1,golden:false,attack:d.attack+(d.type==='minion'?market.attack:0),health:d.health+(d.type==='minion'?market.health:0)};
  let weight=0;
  if(d.type==='minion'){
   if(b.core.includes(d.id)&&!owned.some(x=>x.id===d.id))weight=24;
   else if(normalCopies(a,d.id)>=2&&plan.includes(d.id))weight=16;
   else if(b.support.includes(d.id)&&!owned.some(x=>x.id===d.id))weight=7;
   const fuel=canCycle(a,c);if(fuel>0&&!b.core.includes(d.id))weight=Math.max(weight,(operating?10:3)+Math.min(8,Math.log2(1+fuel)));
  }else{
   const value=d.type==='spell'?spellValue(a,d):amuletValue(a,d);if(value>0)weight=(operating&&(d.type==='spell'&&b.style==='cycle'||d.type==='amulet'&&b.style==='amulet')?12:4)+Math.min(8,Math.log2(1+value));
  }
  if(weight>0)candidates.push({c,weight});
 }
 // Bound expensive board-replacement evaluations; weight still leaves variety.
 const useful=[];
 for(const item of candidates.sort((x,y)=>y.weight-x.weight).slice(0,16)){
  const value=shopValue(a,item.c,plan);if(value<=0)continue;
  const slot=old.filter(x=>def(x.c).type===def(item.c).type&&def(x.c).tier<=a.tier&&!(b.core.includes(x.c.id)&&!owned.some(c=>c.id===x.c.id))&&normalCopies(a,x.c.id)<2).sort((x,y)=>x.value-y.value)[0];
  if(slot&&value>slot.value+2)useful.push({...item,slot});
 }
 let roll=E.rand(a)*useful.reduce((n,x)=>n+x.weight,0);
 for(const item of useful){roll-=item.weight;if(roll<0){a.shop[item.slot.index]=E.offer(a,item.c.id);return item.c.id;}}
 return null;
}
function prepare(s,o,E,options={}){
 if(o.hp<=0)return;
 if(s.activeTribes&&!s.activeTribes.includes(o.tribe)){o.tribe=s.activeTribes[(Number.isInteger(o.id)?o.id:0)%4];}
 if(!D.heroes.some(h=>h.id===(o.hero||o.tribe)&&(h.tribe==='neutral'||h.tribe===o.tribe)))o.hero=o.tribe;
 if(o.route!==0&&o.route!==1)o.route=Math.floor(o.id/4)%2;
 let plan=plans[o.tribe][o.route];const previousStats=o.stats||{triples:0,spells:0};
 const a={version:1,seed:s.seed,uid:s.uid,hero:o.hero||o.tribe,tribe:o.tribe,route:o.route,buildId:o.buildId,difficulty:'hard',phase:'recruit',round:s.round,
  hp:o.hp,armor:o.armor||0,maxHp:40,tier:o.tier||1,discount:o.discount??-1,grave:o.grave||0,spells:o.spells||0,spellsThisRound:o.spellsThisRound||0,bloodDamage:o.bloodDamage||0,scrap:o.scrap||0,
  spellNamesThisRound:o.spellNamesThisRound||[],goldSpentThisRound:o.goldSpentThisRound||0,discardEcho:o.discardEcho||false,bloodImmunity:o.bloodImmunity||false,heroProspect:o.heroProspect||false,heroSalvage:o.heroSalvage||false,heroSpellCopy:o.heroSpellCopy||false,constructsThisRound:o.constructsThisRound||[],lastOpponent:o.lastOpponent??s.lastOpponent,progress:o.progress||{},board:o.board||[],hand:o.hand||[],shop:o.shop||[],amulets:o.amulets||[],trinkets:[],discover:(o.discover||[]).filter(q=>['minion','amulet','spell','mode','discard','targetChoice'].includes(q.type)),pendingGold:o.pendingGold||0,pendingFairies:o.pendingFairies||0,
  activeTribes:s.activeTribes,opponents:s.opponents,log:[],stats:previousStats,frozen:o.frozen||false,powerUsed:o.powerUsed||false,heroCry:o.heroCry||false,constructIndex:o.constructIndex||0,played:o.played||0,previousPlayed:o.played||0,previousSpellsThisRound:o.spellsThisRound||0,gold:o.gold||0,wins:0,losses:0};
 const previousSpells=a.spells,previousTriples=a.stats.triples||0;
 if(!options.started)E.startRound(a);
 // Fixed, visible late-game economy; all opponents use the same rules.
 const bonus=options.bonusGold===false?0:s.round>=7?4:0;a.gold+=bonus;
 selectBuild(a);plan=currentPlan(a);
 const summary={routeName:D.archetypes[o.tribe].routes[o.route][0],budget:a.gold,bonusGold:bonus,goldSpent:0,cardsBought:0,spellsCast:0,triples:0,turns:s.round,actions:0,upgraded:false,bought:[],luckyRefreshes:0};
 const doAct=(type,arg={})=>{const card=type==='buy'?a.shop.find(c=>c.uid===arg.uid):null;const cost=type==='buy'?def(card).cost:type==='refresh'?E.refreshCost(a):type==='upgrade'?E.upgradeCost(a):type==='power'?D.heroes.find(h=>h.id===a.hero).cost:type==='activate'?def(a.board.find(c=>c.uid===arg.uid)).activation.cost:0;const r=E.act(a,type,arg);if(r.ok){summary.actions++;summary.goldSpent+=cost;if(card){summary.cardsBought++;summary.bought.push(card.id);}if(type==='upgrade')summary.upgraded=true;if(type==='refresh'&&options.shopLuck!==false&&lateShopLuck(a,E))summary.luckyRefreshes++;}return r.ok;};
 const chooseRewards=()=>{while(a.discover.length){const q=a.discover[0];if(q.type==='targetChoice'){const c=E.targetCards(a,q).sort((x,y)=>q.kind==='health'?(Math.max(y.health,y.attack)*2*q.scale-y.health-y.attack)-(Math.max(x.health,x.attack)*2*q.scale-x.health-x.attack):q.kind==='shift'?power(x)-power(y):(y.attack+y.health)-(x.attack+x.health))[0];if(!c||!doAct('choose',{id:String(c.uid)}))break;continue;}if(q.type==='mode'){if(!doAct('choose',{id:modeChoice(a,q,E)}))break;continue;}if(q.type==='discard'){const c=discardChoice(a,plan,q.options);if(!c||!doAct('choose',{id:String(c.uid)}))break;continue;}if(a.hand.length>=10){const c=[...a.hand].sort((x,y)=>handValue(a,x,plan)-handValue(a,y,plan))[0];if(!doAct('discard',{uid:c.uid}))break;}const id=[...q.options].sort((x,y)=>handValue(a,{...D.byId[y],uid:-2,golden:false},plan)-handValue(a,{...D.byId[x],uid:-1,golden:false},plan))[0];if(!doAct('choose',{id}))break;}};
 const flushHand=()=>{let changed=false,passes=0;while(passes++<30){chooseRewards();let did=false;for(const c of [...a.hand].sort((x,y)=>handPriority(a,y,plan)-handPriority(a,x,plan))){const d=def(c);if(d.type==='spell'){if(spellValue(a,d)<0)continue;if(d.target)arrange(a,plan,E,doAct);if(a.hero==='olivia'&&!a.powerUsed&&!a.heroSpellCopy&&a.gold>=D.heroes.find(h=>h.id==='olivia').cost&&!['coin','deferGold','bloodImmunity','discardEcho'].includes(d.effect)&&spellValue(a,d)>5)doAct('power');const t=d.target?spellTarget(a,d):null;if(doAct('play',{uid:c.uid,target:t?.uid})){did=changed=true;break;}}
   if(d.type==='amulet'){if(amuletValue(a,d)<0)continue;if(doAct('play',{uid:c.uid})){did=changed=true;break;}}
   if(d.type==='minion'){if(!canPayBattlecry(a,c))continue;let cycle=false;if(a.board.length>=7){const choice=replacement(a,c,plan),improvement=choice?.gain||0,benefit=canCycle(a,c),slot=cycleSlot(a,plan);if(improvement>2){if(!doAct('sell',{uid:choice.old.uid}))continue;}else if(benefit>0&&slot&&power(slot)<cycleBudget(a,benefit)){if(!doAct('sell',{uid:slot.uid}))continue;cycle=true;}else continue;}
    // A generated token is useful fuel once the six permanent pieces are in place.
    if(a.board.length===6&&((d.token&&a.tribe==='forest')||(D.fanfareIds.includes(c.id)&&canCycle(a,c)>0&&power(c)<35&&!plan.slice(0,3).includes(c.id)&&s.round>=7)))cycle=true;
    if(a.hero==='royal'&&!a.powerUsed&&!a.heroCry&&a.gold>=1&&D.fanfareIds.includes(c.id)&&canCycle(a,c)>8)doAct('power');
    if(doAct('play',{uid:c.uid,index:c.id==='neutral1'?Math.min(1,a.board.length):a.board.length})){did=changed=true;if(cycle&&a.board.some(x=>x.uid===c.uid)&&(a.gold>=2||a.hand.some(x=>def(x).type==='minion')||a.discover.length))doAct('sell',{uid:c.uid});break;}}
  }if(!did)break;}return changed;};
 const useActivations=()=>{chooseRewards();for(const c of [...a.board]){const args=activationArgs(a,c,plan);if(args)doAct('activate',args);}};
 chooseRewards();flushHand();
 const opening=openingPlan(a,E);summary.openingDecision=opening?(opening.upgrade?'upgrade':'shop-combo'):null;
 if(shouldUpgrade(a,E))doAct('upgrade');
 else if(opening&&!opening.upgrade){const buys=opening.buys.map(uid=>a.shop.find(c=>c.uid===uid)).filter(Boolean).sort((x,y)=>opening.power?(def(y).type==='spell'?openingCardValue(a,y):0)-(def(x).type==='spell'?openingCardValue(a,x):0):0);for(const c of buys){if(opening.power&&def(c).type==='spell'&&!a.powerUsed)doAct('power');if(doAct('buy',{uid:c.uid}))flushHand();}}
 useActivations();flushHand();
 const powerTarget=()=>{let pool=a.board;if(a.hero==='aria')pool=pool.filter(c=>def(c).token);if(a.hero==='athena')pool=pool.filter(c=>S.shieldCount(c)&&a.board.length>1);if(a.hero==='forte')pool=pool.filter(c=>!c.keywords.includes('cannotAttack')&&!c.heroWindfury&&def(c).effect!=='double'&&!['forest1','dragon6','dragon9'].includes(c.id));if(a.hero==='snow')pool=pool.filter(c=>!c.heroReborn&&def(c).effect!=='reborn');return spellTarget({...a,board:pool},{effect:'buff'});};
 const usePower=()=>{if(a.powerUsed||a.hero==='olivia')return;const h=D.heroes.find(h=>h.id===a.hero);if(a.gold<h.cost)return;if(['blood','medusa'].includes(a.hero)&&!S.selfHarmImmune(a)&&a.hp<=bloodReserve(a)+3)return;if(['windgod','ceres'].includes(a.hero)&&!E.heroPool(a,a.hero).length)return;if(a.hero==='aria'&&a.hand.length>8)return;if(a.hero==='bahamut'&&!a.hand.some(c=>def(c).type==='minion'&&!c.golden))return;if(a.hero==='roland'&&!a.board.some(c=>def(c).tier>=3))return;if(a.hero==='goblin'&&a.hp+a.armor<=5)return;if(a.hero==='ceres'&&a.grave<3)return;if(a.hero==='dorothy'&&a.hand.length>8)return;const target=powerTarget();if(h.target&&!target)return;if(a.hero==='royal'&&!a.hand.some(c=>D.fanfareIds.includes(c.id))&&!a.shop.some(c=>D.fanfareIds.includes(c.id)&&a.gold>=D.byId[c.id].cost+h.cost))return;
 if(a.hero==='deus'&&a.hand.length>=10)return;if(a.hero==='artifact'&&!tribeCount(a,'artifact'))return;if(['forest','night','blood'].includes(a.hero)&&a.board.length>=7&&a.hand.length>=6)return;if(doAct('power',{target:target?.uid}))flushHand();};
 // Hero powers start after the opening purchases so one-gold spells do not delay a first unit.
 if(s.round>=4)usePower();
 let loops=0,refreshes=0;const limit=100;
 while(loops++<limit){selectBuild(a);plan=currentPlan(a);chooseRewards();useActivations();flushHand();if(a.gold<=0&&E.refreshCost(a)>0)break;
  if(a.hand.length>=9){const blocked=[...a.hand].sort((x,y)=>handValue(a,x,plan)-handValue(a,y,plan))[0];if(blocked)doAct('discard',{uid:blocked.uid});}
  const offers=a.shop.map(c=>({c,value:shopValue(a,c,plan)})).sort((x,y)=>y.value-x.value);
  const build=buildFor(a),missing=build?.core.filter(id=>D.byId[id].tier<=a.tier&&!a.board.some(c=>c.id===id)).length||0;
  // When a reachable core is missing, spend weak filler money on searching instead.
  const worthwhile=({c,value})=>{const d=def(c);if(value<=0)return false;if(a.round<7||!missing||a.board.length<5||normalCopies(a,c.id)>=2||build?.core.includes(c.id)||['coin','deferGold'].includes(d.effect))return true;return value>=5+Math.min(2,missing)*2;};
  const top=offers.find(worthwhile);if(top){if(doAct('buy',{uid:top.c.uid}))continue;}
  if(a.gold>=E.refreshCost(a)&&a.hand.length<10){if(doAct('refresh')){refreshes++;continue;}}break;
 }
 chooseRewards();flushHand();
 // Close the cycling slot before combat if a remaining real card can fill it.
 while(a.board.length<7){const c=a.hand.filter(c=>def(c).type==='minion'&&canPayBattlecry(a,c)).sort((x,y)=>unitValue(a,y,plan)-unitValue(a,x,plan))[0];if(!c||!doAct('play',{uid:c.uid}))break;chooseRewards();}
 usePower();if(a.heroProspect&&doAct('refresh'))refreshes++;useActivations();flushHand();
 // Preserve a promising unaffordable offer rather than paying to lose it next turn.
 if(!a.frozen&&a.shop.some(c=>def(c).type==='minion'&&(normalCopies(a,c.id)>=2||(plan.slice(0,3).includes(c.id)&&!a.board.some(x=>x.id===c.id)))))doAct('freeze');
 arrange(a,plan,E,doAct);
 for(const c of [...a.amulets])if(['bloodGarden','bloodMoon'].includes(def(c).effect)&&c.count<=1&&!S.selfHarmImmune(a)&&a.hp-pendingSelfHarm(a)<6)doAct('removeAmulet',{uid:c.uid});
 arrange(a,plan,E,doAct);
 if(!options.deferEnd)E.endRecruit(a);
 summary.spellsCast=a.spells-previousSpells;summary.triples=(a.stats.triples||0)-previousTriples;summary.played=a.played;summary.goldLeft=a.gold;
 const build=buildFor(a);summary.buildId=build?.id;summary.buildName=build?.name;summary.buildPhase=buildPhase(a);summary.targetCore=build?.core||[];summary.missingCore=(build?.core||[]).filter(id=>!a.board.some(c=>c.id===id));summary.routeName=D.archetypes[a.tribe].routes[a.route][0];
 summary.coreCount=a.board.filter(c=>plan.includes(c.id)).length;summary.tier=a.tier;summary.refreshes=refreshes;summary.boardPower=Math.round(a.board.reduce((n,c)=>n+c.attack+c.health,0));
 // Persist generated cards from end-of-turn effects for the next recruitment.
 for(const key of ['buildId','route','board','hand','shop','amulets','trinkets','discover','tier','discount','grave','spells','spellsThisRound','spellNamesThisRound','goldSpentThisRound','discardEcho','bloodDamage','bloodImmunity','scrap','progress','stats','hp','maxHp','armor','frozen','gold','pendingGold','pendingFairies','played','powerUsed','heroCry','heroProspect','heroSalvage','heroSpellCopy','constructsThisRound','lastOpponent','constructIndex','feasts','deferTriples','recruitEnded'])o[key]=a[key];
 o.aiSummary=summary;s.seed=a.seed;s.uid=a.uid;
}
const AI={lateShopLuck,builds,buildPhase,selectBuild,currentPlan,formationValue,openingPlan,boardValue,replacement,shopValue,canCycle,synergyValue,shouldUpgrade,spellTarget,spellValue,prepare,plans,amuletValue,modeChoice,discardChoice,activationArgs};root.TavernAI=AI;if(typeof module!=='undefined')module.exports=AI;
})(typeof globalThis!=='undefined'?globalThis:this);
