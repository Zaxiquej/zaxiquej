(function(root){
'use strict';
const read=s=>({goldCapBonus:s?.progress?.goldCapBonus??Math.floor((s?.progress?.mining||0)/3),totalPlayed:s?.progress?.totalPlayed??Math.max(s?.played||0,s?.spells||0),constructTypes:[...(s?.progress?.constructTypes||[])],fairy:s?.progress?.fairy||0,arms:s?.progress?.arms||0,prayers:s?.progress?.prayers||0,spellcraft:s?.progress?.spellcraft||0,devotion:s?.progress?.devotion||0,buffs:s?.progress?.buffs||0,battleEntries:s?.progress?.battleEntries||0,legionAttack:s?.progress?.legionAttack||0,tavernAttack:s?.progress?.tavernAttack||0,tavernHealth:s?.progress?.tavernHealth||0});
const selfHarmImmune=s=>!!s?.bloodImmunity||(s?.board||[]).some(c=>c.id==='blood11');
const goldCap=s=>10+read(s).goldCapBonus;
const tavern=s=>({attack:read(s).tavernAttack,health:read(s).tavernHealth});
const fairy=s=>read(s).fairy,bat=s=>Math.floor((s?.bloodDamage||0)/2);
const weapon=s=>{const n=Math.floor(read(s).arms/3);return {attack:1+n,health:2+n};};
const batAvengeBody=(s,m=1)=>(4+(s?.bloodDamage||0))*m;
const artifactBody=(s,m=1)=>(3+(s?.scrap||0))*m;
function powerGain(p,key,n,m=1){p[key]=(p[key]||0)+Math.ceil(n/2)*m;}
const prayer=s=>Math.floor(read(s).prayers/4)+read(s).devotion;
const spell=s=>read(s).spellcraft;
const echoCount=(s,e,except=null)=>(s?.board||[]).filter(c=>c.uid!==except&&(root.TavernData||(typeof require!=='undefined'?require('./data.js'):null)).byId[c.id]?.effect===e).reduce((n,c)=>n+(c.golden?2:1),0);
const comboPower=(s,c,played=s.played||0)=>(played+(c.id==='forest4'?6:0))*(c.golden?2:1);
// Legacy cards with only the keyword have one layer; no keyword always means zero.
const canStackShield=c=>!!c&&(c.shieldAura||(root.TavernData||(typeof require!=='undefined'?require('./data.js'):null))?.byId[c.id]?.stackShield===true);
const shieldCount=c=>c?.keywords?.includes('shield')?Math.max(1,c.shieldLayers??((c.initialShields||1)*(c.golden&&c.initialShields?2:1))):0;
function syncShieldAura(board){const D=root.TavernData||(typeof require!=='undefined'?require('./data.js'):null),active=board.some(c=>D.byId[c.id]?.effect==='shieldAura');for(const c of board){if(active)c.shieldAura=true;else delete c.shieldAura;}}
function addShield(c,temporary=false){if(!c)return;const before=shieldCount(c);c.shieldLayers=canStackShield(c)?before+1:Math.max(1,before);if(!c.keywords.includes('shield'))c.keywords.push('shield');if(temporary){const added=c.shieldLayers-before;if(added)c.temporaryShields=(c.temporaryShields||0)+added;}else if(!canStackShield(c)&&c.temporaryShields)delete c.temporaryShields;}
function removeShieldLayer(c,all=false){const n=shieldCount(c);if(!n)return;c.shieldLayers=all?0:n-1;if(c.temporaryShields){c.temporaryShields=all?0:Math.max(0,c.temporaryShields-1);if(!c.temporaryShields)delete c.temporaryShields;}if(!c.shieldLayers)c.keywords=c.keywords.filter(k=>k!=='shield');}
function expireShields(c){if(!c.temporaryShields)return;c.shieldLayers=Math.max(0,shieldCount(c)-c.temporaryShields);delete c.temporaryShields;if(!c.shieldLayers)c.keywords=c.keywords.filter(k=>k!=='shield');}
function summary(s){const p=read(s),w=weapon(s);return [
 {tribe:'neutral',label:'金币上限',value:String(goldCap(s)),detail:'上限加成 +'+p.goldCapBonus+'，每回合收入同时增加。铸币与出售收入可超过上限。'},
 {tribe:'forest',label:'整局出牌',value:p.totalPlayed+'张',detail:'实际从手牌打出的随从、法术、护符各计一次；召唤与重复入场曲不计。'},
 {tribe:'artifact',label:'造物图谱',value:p.constructTypes.length+'种',detail:'本局实际打出过的不同造物衍生随从。'},
 {tribe:'forest',label:'妖精军团',value:'+'+p.fairy+'/+'+p.fairy,detail:'妖精衍生物开战及召唤时获得军团身材。魔法精灵公主通过召唤妖精、莉莎通过衍生随从攻击推进军团；辛西亚通过连携强化队伍，维尔达与远古树精负责军团收益。'},
 {tribe:'royal',label:'皇家强化',value:p.buffs+'次 · 屏障'+(s?.board||[]).reduce((n,c)=>n+shieldCount(c),0)+'层',detail:'每使一名随从的攻击或生命增加计1次；群体效果按受益人数计算，战斗强化也计入。守护骑士可自行叠盾；光耀导引在场时，所有友方均可叠盾。光环离场后已获得的层数保留，但普通随从不能继续叠加；每次伤害消耗1层；备战获得的层数跨回合保留，战斗中补盾仅限当场。'},
 {tribe:'dragon',label:'酒馆成长',value:'+'+p.tavernAttack+'/+'+p.tavernHealth,detail:'永久增加当前与未来刷新的商店随从属性，对所有种族生效。发现、生成牌与战斗召唤不享受酒馆加成。'},
 {tribe:'night',label:'亡者行军',value:p.battleEntries+'次 · 军势 +'+p.legionAttack+'攻击',detail:'战斗中每次友方实际召唤、复生或复活入场累计1次，不限种族；初始阵容与满场失败不计。骨之贵公子、死骸勋爵永久提高死灵军势，作用于当前与以后进入战斗的所有友方死灵。'},
 {tribe:'night',label:'墓场',value:String(s?.grave||0),detail:'每次友方战斗死亡积累墓场；赛蕾丝和暮光女皇消耗墓场养成阵容，食魂者消耗 4 墓场培养相邻随从，奈芙蒂斯消耗 3 墓场复活，冥府神的契约消耗全部墓场强化单体。'},
 {tribe:'rune',label:'法术研习',value:'+'+p.spellcraft+' · '+(s?.spells||0)+'次施法',detail:'法术研习 '+p.spellcraft+'：后续法术的非零属性增益各额外增加此值；不增加金币、资源数量或关键词。每次施法持续累积。雷光射手固定发射两束雷光，施法数提高单束伤害，秘银巨像在每个己方随从攻击前按施法总数轰击。'},
 {tribe:'haven',label:'护符共鸣',value:'+'+prayer(s),detail:'护符培育 '+p.devotion+'，已完成 '+p.prayers+' 次倒数。共鸣 = 培育 + 倒数次数÷4（向下取整）；增加护符非零属性增益与衍生物身材，不增加资源张数。'},
 {tribe:'blood',label:'血翼军团',value:'+'+bat(s)+'/+'+bat(s),detail:'累计自伤'+(s?.bloodDamage||0)+'；每2点自伤强化所有蝙蝠的开战与召唤身材。女王按蝙蝠完整攻击炮击，女帝按累计自伤强化全队。'},
 {tribe:'artifact',label:'武装 / 残骸',value:'+'+w.attack+'/+'+w.health+' · '+(s?.scrap||0),detail:'武装研习'+p.arms+'点，每3点提高后续武装基础身材；施放武装与机械降神均可积累。残骸'+(s?.scrap||0)+'：重构造物为'+artifactBody(s)+'/'+artifactBody(s)+'，创造主开战加成+'+growthAmount(s,'artifactLord')+'/+'+growthAmount(s,'artifactLord')+'。'}
];}
// Recruitment spell previews share the same nonzero-stat amplification rule as cast().
function spellView(s,d){
 const amp=spell(s),plus=(a,h)=>a&&h?`+${a}/+${h}`:a?`+${a} 攻击`:`+${h} 生命`;
 let a=0,h=0,text=d.text,short='';
 if(d.effect==='buff'){a=d.attack;h=d.health;}
 if(d.effect==='tierBuff')a=h=s?.tier||1;
 if(d.effect==='guard'){a=d.attack;h=d.health;}
 if(d.effect==='bloodPact'){a=3;h=3;}
 if(d.effect==='dragonWing'){a=2;h=2;}
 if(d.effect==='module'){const w=weapon(s);a=w.attack;h=w.health;}
 if(d.effect==='ritual')a=h=s?.grave||0;
 if(['buff','tierBuff','guard','bloodPact','dragonWing','module','ritual'].includes(d.effect)){
  if(a)a+=amp;if(h)h+=amp;short=plus(a,h);
  text=`使一个友方${d.effect==='module'?'造物':''}永久 ${short}。`;
  if(d.effect==='guard'){text+='并赋予守护。';short+=' · 守护';}
  if(d.effect==='bloodPact'){text='购买时自伤 1。'+text;short+=' · 购入自伤1';}
  if(d.effect==='dragonWing'){text+='下场开战：受到三次 1 点伤害，多张可累积。';short+=' · 开战受伤1×3';}
  if(d.effect==='module'){text+='武装研习 +1。';short+=' · 武装研习+1';}
  if(d.effect==='ritual'){text=`消耗全部 ${s?.grave||0} 墓场。`+text;short+=' · 耗尽墓场';}
 }
 if(d.effect==='buff'&&d.buffRepeats){const each=plus(a,h);a*=d.buffRepeats;h*=d.buffRepeats;short=each+' ×'+d.buffRepeats;text=`使一个友方随从永久 ${each}，重复 ${d.buffRepeats} 次（合计 ${plus(a,h)}）。`;}
 if(d.effect==='tavernSpell'){a=(d.attack||2)+amp;h=(d.health||2)+amp;short=`酒馆 +${a}/+${h}`;text=`使本局当前与未来商店随从永久 +${a}/+${h}。`;}
 if(d.effect==='tavernSpell'&&d.buffRepeats){const each=plus(a,h);a*=d.buffRepeats;h*=d.buffRepeats;short='酒馆 '+each+' ×'+d.buffRepeats;text=`使本局当前与未来商店随从永久 ${each}，重复 ${d.buffRepeats} 次（合计 ${plus(a,h)}）。`;}
 if(['teamBuff','menagerieBuff','marketBuff'].includes(d.effect)){a=d.attack?d.attack+amp:0;h=d.health?d.health+amp:0;const label={teamBuff:'全队',menagerieBuff:'每族一名',marketBuff:'当前商店'}[d.effect];short=label+' '+plus(a,h);text=d.effect==='teamBuff'?'使所有友方随从永久 '+plus(a,h)+'。':d.effect==='menagerieBuff'?'每个非中立种族随机一名友方随从永久 '+plus(a,h)+'。':'使当前商店中的所有随从 '+plus(a,h)+'。';}
 if(d.effect==='randomRecruit')short='随机 1 星随从 ×1';
 if(d.effect==='copyRecruit')short='复制友方 · 普通基础卡';
 if(d.effect==='pilfer')short='随机偷取随从 ×1';
 if(d.effect==='discardEcho')short=s?.discardEcho?'本回合被弃效果双倍 · 已生效':'本回合被弃效果双倍';
 if(d.effect==='discoverSpell'){const cap=['amulet','spell'].includes(d.discoverKind)?Math.min(6,s?.tier||1):(root.TavernData||require('./data.js')).discoverTier({tier:s?.tier||1}),label={fanfare:'入场曲随从',lastWords:'谢幕曲随从',endRecruit:'备战结束随从',amulet:'护符',spell:'酒馆法术',minion:'随从',majority:'优势种族随从'}[d.discoverKind]||'随从';short='发现'+label+' · '+(d.exactTier?'':'≤')+cap+'★';text=d.discoverKind==='majority'?'发现一个你场上数量最多的种族的随从，最高 '+cap+' 星。并列时合并这些种族。':'发现一'+(['amulet','spell'].includes(d.discoverKind)?'张':'个')+label+'，'+(d.exactTier?'恰好 ':'最高 ')+cap+' 星。';}
 if(d.effect==='bones')short='墓场 +5';
 if(d.effect==='removeGuard')short='移除守护 · 指定友方';
 if(d.effect==='clock')short='所有护符倒数 −1';
 if(d.effect==='bloodImmunity')short='本回合自伤免伤 → 自伤1';
 if(d.effect==='mining')short='金币上限 +1';
 if(d.effect==='coin')short='金币 +1';
 if(d.effect==='deferGold')short='下回合金币 +2';
 if(d.effect==='bloodContract')short='购入自伤1×2 · 获得吻唇×2';
 if(d.effect==='modalSpell'){short=`抉择：酒馆 +${3+amp}/+${3+amp} / 龙族 +${6+amp} 生命`;text=`抉择：使本局酒馆永久 +${3+amp}/+${3+amp}；或使所有友方龙族永久 +${6+amp} 生命。`;}
 if(d.effect==='discardExchange'){short='弃一张手牌 → 随机法术 ×2';text=d.text;}
 return {attack:a,health:h,text,short:short||text};
}
// Payload values use the current resolution state; previews include the next expiry.
function amuletPower(s,d){
 const p=read(s),board=s.board||[];
 if(d.effect==='magicField')return 8+p.spellcraft;
 if(d.effect==='dragonCanyon')return 3*board.filter(c=>(root.TavernData||(typeof require!=='undefined'?require('./data.js'):null)).isTribe(c,'dragon')).length;
 if(d.effect==='boneRing')return Math.max(1,Math.floor(p.battleEntries/2));
 if(d.effect==='ancientAmplifier')return 3+Math.floor((s.scrap||0)/2);
 return 0;
}
function amuletView(s,d){
 const p=read(s),context={...s,progress:{...p,prayers:p.prayers+1,devotion:p.devotion+(d.effect==='temple'?2:0)}},amp=prayer(context),power=amuletPower(context,d),body=n=>n+amp;
 const values={
 garden:`全体 +${body(2)}/+${body(2)}；妖精 +${body(3)}/+${body(3)}`,
 tomb:`墓场 +6；获得 ${body(3)}/${body(3)} 骷髅士兵 ×1`,
 banner:`全体 +${body(3)}/+${body(3)}`,
 egg:`酒馆永久 +${body(6)}/+${body(6)}`,
 library:'法术研习 +2；智慧之光 ×2',
 bell:`全体随从 +${body(3)} 生命`,
 temple:`培育 +2；全体 +${body(4)}/+${body(6)}`,
 hourglass:`随机获得 ${Math.min(6,(s.tier||1)+1)} 星随从 ×1`,
 bloodGarden:`自伤 1×2；全体 +${body(3)}/+${body(3)}；${body(1)}/${body(1)} 蝙蝠 ×1`,
 accelerator:`武装 ×2；造物 +${body(1)}/+${body(2)}`,
 fairyGlade:`获得 ${body(1)}/${body(1)} 妖精 ×2`,
 fairyRealm:'妖精军团永久 +6/+6',
 frontline:`全体各强化两次 +${body(1)}/+${body(2)}`,
 magicField:`攻击最低两名 +${body(power)}/+${body(4+Math.floor(p.spellcraft/2))}`,
 dragonCanyon:power?`酒馆永久 +${body(power)}/+${body(power)}`:'没有龙族：无酒馆增益',
 deathBanquet:'墓场 +6；死灵军势永久 +6 攻击',
 coinVault:'获得铸币 ×3',mine:'金币上限 +2',
 boneRing:`最左侧随从 +${body(power)}/+${body(power)}`,
 bloodMoon:`自伤 1 → 最低生命随从 +${body(4)} 生命，三次`,
 discardRite:'在场弃牌：酒馆 +1/+1；归零获得龙之斗气',
 ancientAmplifier:`造物 +${body(power)}/+${body(power)}`
 };
 const D=root.TavernData||(typeof require!=='undefined'?require('./data.js'):null),target=(s.board||[])[0];
 values.summit=target?`最左侧随从 +${target.health+amp} 攻击`:'最左侧随从：生命转为额外攻击';
 return {amp,short:values[d.effect]||d.text,text:values[d.effect]||d.text};
}
// Read-only annotations use the viewed side's state, never mutate card rules.
function formulaText(s,c,text){
 if(c.catalog)return text;
 const D=root.TavernData||(typeof require!=='undefined'?require('./data.js'):null),d=D.byId[c.id];if(!d)return text;
 const p=read(s),m=(c.golden?2:1)*(c.effectScale||1),a=c.attack??(d.attack||0)*(c.golden?2:1),h=c.health??(d.health||0)*(c.golden?2:1),max=c.maxHealth??h,board=s.board||[],e=d.effect;
 const pair=(a,h=a)=>`+${a} 攻击 / +${h} 生命`,body=(a,h=a)=>`${a}/${h}`,same=x=>x===c||(c.battleId!=null?x.battleId===c.battleId:c.uid!=null&&x.uid===c.uid),tribe=t=>board.filter(x=>D.isTribe(x,t)&&x.health>0);
 let value='',label='当前',anchor=/「[^」]+」(?:\s*×\s*\d+)?/;
 if(['forest1','forest4'].includes(c.id)){const next=(Math.floor((s.played||0)/3)+1)*3;value=pair(comboPower(s,c,next)*(c.effectScale||1));label=`下次第 ${next} 张`;if(c.id==='forest1')anchor=/本回合已打出牌数\s*×\s*\d+/;}
 if(c.id==='forest3')value=`+${p.fairy*m} 攻击`;
 if(e==='fairyBulwark')value=pair(p.fairy*m);
 if(e==='forestStart')value=pair((tribe('forest').length*8+p.fairy*2)*m);
 if(['careerVanguard','careerChorus'].includes(e))value=pair(p.totalPlayed*m);
 if(e==='constructUnity')value=pair(p.constructTypes.length*(1+Math.floor(p.arms/6))*m);
 if(e==='pydon'){value=pair((p.tavernAttack+4*m)*m,(p.tavernHealth+4*m)*m);label='下次结算相邻增益';}
 if(e==='graveNourish')value=pair((3+Math.floor(p.battleEntries/5))*m);
 if(e==='spellReserve'){value='获得 '+m+' 张 '+Math.min(6,1+(s.spellNamesThisRound||[]).length)+' 星法术';label='本回合已使用 '+(s.spellNamesThisRound||[]).length+' 种';}
 if(e==='entryCannon')value=`${p.battleEntries*m} 点伤害`;
 if(e==='legionHealth')value='+'+(6+2*p.legionAttack)*m+' 生命';
 if(e==='guardVitals')value='+'+Math.floor((s.guardVitalsBaseHealth??Math.max(0,...board.map(x=>x.health)))/3)*m+' 生命';
 if(e==='royalDrill')value=pair((6+Math.floor(p.buffs/10))*m);
 if(e==='healthReliquary')value=`+${Math.floor(h/3)*m} 生命`;
 if(e==='healthChoir')value=`+${(2+Math.floor(h/4))*m} 生命`;
 if(e==='royalStart')value=pair((8+Math.floor(p.buffs/10))*m);
 if(e==='healthAvatar'){value='+'+h*m+' 攻击';anchor=/自身当时生命\s*×\s*\d+/;}
 if(c.id==='night2')value=`+${p.battleEntries*m} 生命`;
 if(e==='prayerBastion'){const n=(6+prayer(s))*m;value=pair(n,2*n);}
 if(e==='prayerChoir')value=pair((4+prayer(s))*m);
 if(e==='dragonRaid')value=`+${(2+Math.floor((c.startHealth??h)/10))*m} 攻击`;
 if(e==='dragonVitality'){value=tribe('dragon').map(x=>{const n=(6+Math.floor((x.startHealth??x.health)/10))*m;return D.byId[x.id].name+' '+pair(n,2*n);}).join('；')||'暂无在场龙族';label='按各自入场生命';}
 if(['buffVanguard','buffCommander'].includes(e))value=pair((e==='buffVanguard'?Math.floor(p.buffs/3):4+Math.floor(p.buffs/10))*m);
 if(e==='spellBlast')value=`每束 ${ (2+Math.floor((s.spells||0)/4))*m} 点伤害`;
 if(e==='runeStart')value=`${(s.spells||0)*m} 点伤害`;
 if(e==='dimensionBoost'){value=pair((1+Math.floor(((s.spells||0)+1)/3))*m);label='下次施法';}
 if(e==='studyEcho')value=pair(Math.ceil(p.spellcraft/2)*m);
 if(e==='studyRally')value=pair(p.spellcraft*m);
 if(e==='prayerStrike')value=`+${Math.floor(Math.max(0,...board.map(x=>x.health))/4)*m} 攻击`;
 if(e==='guardRetribution')value=`${Math.max(1,Math.floor(h/5))*m} 点伤害`;
 if(e==='tokenForge')value=pair((2+Math.floor((s.scrap||0)/3))*m);
 if(e==='scrapArmament'){const n=growthAmount(s,e)*m;value=pair(n,n);}
 if(e==='shieldMarshal')value=pair(board.reduce((n,x)=>n+shieldCount(x),0)*2*m);
 if(e==='comboHarvest')value=pair((s.played||0)*2*m);
 if(e==='bloodVein')value=`+${(2+Math.floor((s.bloodDamage||0)/5))*m} 生命`;
 if(e==='bloodEmpress')value=pair((s.bloodDamage||0)*2*m);
 if(e==='artifactLord')value=pair(growthAmount(s,e,c)*m);
 if(c.id==='artifact9')value=`+${(s.scrap||0)*m} 攻击`;
 if(e==='scrapVeteran')value=pair((2+Math.floor((s.scrap||0)/5))*m);
 if(['dragonStart','radiantLast'].includes(e)){value=`${e==='dragonStart'?a:a*m} 点伤害`;if(e==='radiantLast')anchor=/自身攻击\s*×\s*\d+/;}
 if(e==='fairyMentor'){value=pair(Math.floor(a/2)*m);anchor=/本随从一半攻击(?:\s*×\s*\d+)?/;}
 if(e==='artifactDeath')value=body(artifactBody(s,m));
 if(e==='marchArmy'){value=body(Math.max(1,p.battleEntries*m));label='基础身材';}
 if(['fairyCrown','batCrown','scrapCrown','graveArmy'].includes(e)){const bonus=e==='scrapCrown'?(s.scrap||0):e==='graveArmy'?(s.grave||0):0;value=body((Math.floor(a/(e==='fairyCrown'?1:2))+bonus)*m,Math.max(1,(Math.floor(max/2)+bonus)*m));label='按当前值的基础身材';}
 if(['fairy2','batDeath'].includes(e)){value=body((e==='fairy2'?3:2)*m+Math.floor(a/2),(e==='fairy2'?3:1)*m+Math.floor(max/2));label='基础身材';}
 if(e==='battleBrood'&&d.brood?.inheritHealth){value=body(d.brood.attack*m,d.brood.health*m+Math.floor(max/2));label='基础身材';}
 if(e==='tavernLegacy')value=pair(Math.floor(a/8)*m,Math.floor(max/8)*m);
 if(e==='forgeEnd'){value='武装研习 +'+((1+(c.forgeUpgrades||0))*m);label='备战结束';}
 if(e==='artifactAvenger'){const w=weapon(s);value='召唤 '+((1+w.attack)*m)+'/'+((3+w.health)*m)+' 并立即攻击';label='当前';}
 if(e==='tavernPlay'){value=pair((1+(c.tavernWeaves||0))*m);label='下次酒馆增益';}
 if(e==='batAvenge'){value=body(batAvengeBody(s,m)+bat(s));label='含军团的召唤身材';}
 if(['summonBuff','shieldBuff','rallyCry','legionEngine','graveLegacy','spellHealth','guardWitness','batQueen','moduleRally','discardRally'].includes(e)){
  const context=e==='spellHealth'?{...s,spells:(s.spells||0)+1}:e==='legionEngine'?{...s,progress:{...p,battleEntries:p.battleEntries+1}}:e==='moduleRally'?{...s,progress:{...p,arms:p.arms+1}}:e==='discardRally'?{...s,stats:{...s.stats,discards:(s.stats?.discards||0)+1}}:s,n=growthAmount(context,e,c)*m;
  value=e==='summonBuff'?pair(n)+'；军团 '+pair(Math.floor(n/(3*m))*m):e==='batQueen'?'蝙蝠攻击 × '+n:e==='legionEngine'?'军势 +'+n+' 攻击':pair(n,e==='guardWitness'?2*n:e==='discardRally'?n+m:n);label=['spellHealth','moduleRally','discardRally','legionEngine'].includes(e)?'下次触发':'当前';
 }
 if(c.id==='royal4'){value=`${Math.max(1,Math.ceil(max/2))} 生命`;anchor=/一半最大生命/;}
 if(e==='menagerieStart')value=pair(new Set(board.filter(x=>x.health>0).map(x=>D.byId[x.id].tribe).filter(t=>t!=='neutral')).size*4*m);
 if(['dragonFeast','bloodFeast','painFeast'].includes(e)){const key=e==='dragonFeast'?'health':'attack',other=key==='health'?'attack':'health',food=[...(s.shop||[])].filter(x=>D.byId[x.id].type==='minion').sort((a,b)=>b[key]-a[key]||b[other]-a[other]||a.uid-b.uid)[0];value=food?pair(food.attack*m,food.health*m):'暂无可吞噬随从';label='当前吞噬候选';}
 if(e==='vowAura'){const i=board.findIndex(same);value=(i<0?[]:[board[i-1],board[i+1]]).filter(x=>x&&x.health>0).map(x=>D.byId[x.id].name+' '+pair(Math.floor(x.attack/2)*m,Math.floor((x.maxHealth??x.health)/2)*m)).join('；')||'暂无相邻随从';label='当前遗愿';}
 if(e==='havenStart'){value=board.filter(x=>!same(x)&&x.health>0).map(x=>D.byId[x.id].name+' '+pair(Math.floor(x.attack*m/2),Math.floor((x.maxHealth??x.health)*m/2))).join('；')||'暂无其他随从';label='各随从当前传承';}
 if(d.type==='amulet'){value=amuletView(s,d).short;label='下次结算';anchor=/$/;}
 if(!value)return text;
 const annotation=`（${label}：${value}）`;
 return anchor.test(text)?text.replace(anchor,match=>match+annotation):text.replace(/。|$/,match=>annotation+match);
}
function growthAmount(s,e,c={}){const p=read(s);switch(e){
 case 'bloodFocus':return 2+Math.floor((s.bloodDamage||0)/5);
 case 'scrapArmament':return 1+(s.scrap||0);
 case 'summonBuff':return 3+Math.floor((s.played||0)/3);
 case 'shieldBuff':return 2+Math.floor(p.buffs/30);
 case 'rallyCry':return 2+Math.floor(p.buffs/20);
 case 'legionEngine':return 1+Math.floor(p.battleEntries/12);
 case 'graveLegacy':return 12+Math.floor((s.grave||0)/2);
 case 'spellHealth':return 2+Math.floor((s.spells||0)/6);
 case 'guardWitness':return 3+Math.floor((c.startHealth??c.health??0)/8);
 case 'batQueen':return 1+Math.floor((s.bloodDamage||0)/20);
 case 'moduleRally':return 4+Math.floor(p.arms/3);
 case 'artifactLord':return (s.scrap||0)*(1+Math.floor((s.scrap||0)/20));
 case 'discardRally':return 2+(s.stats?.discards||0);
 default:return 0;}}
const amuletCapacity=s=>2+(s.board||[]).filter(c=>(root.TavernData||require('./data')).byId[c.id]?.effect==='amuletCapacity').reduce((n,c)=>n+(c.golden?2:1),0);
const S={expireShields,removeShieldLayer,amuletCapacity,powerGain,selfHarmImmune,goldCap,growthAmount,echoCount,batAvengeBody,canStackShield,syncShieldAura,formulaText,comboPower,amuletPower,amuletView,spellView,tavern,shieldCount,addShield,read,fairy,bat,weapon,artifactBody,prayer,spell,summary};root.TavernScaling=S;if(typeof module!=='undefined')module.exports=S;
})(typeof globalThis!=='undefined'?globalThis:this);
