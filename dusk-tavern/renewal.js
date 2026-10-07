(function(root){
'use strict';
function apply(D,I){
 const set=(id,fields,rule)=>Object.assign(D.byId[id],fields,{text:rule(1),goldenText:rule(2)});
 const mirror=D.byId.mirrorRecruit;mirror.retired=true;D.spells=D.spells.filter(c=>c.id!==mirror.id);D.retiredSpells.push(mirror);
 D.functionalSpellIds=D.functionalSpellIds.filter(id=>id!==mirror.id);D.neutralSpellExpansionIds=D.neutralSpellExpansionIds.filter(id=>id!==mirror.id);
 Object.assign(D.byId.mining,{cost:3,text:'金币上限 +1，从下回合起每回合多获得 1 金币。'});
 Object.assign(D.byId.mine,{text:'倒数 2。金币上限 +2，从下回合起每回合多获得 2 金币。'});
 set('neutral18',{effect:'treasureWages'},m=>`备战结束：若本回合消费过至少 8 金币，获得 ${m} 张铸币。`);
 D.byId.neutral18.related=[{id:'coin',count:1,scaleCount:true,when:'消费达到 8 金币'}];
 set('rune20',{},m=>`入场曲：发现 ${m} 张 4～6 星酒馆法术。`);D.byId.rune20.related=[{pool:'functionalDiscover',when:'发现 4～6 星法术'}];
 set('rune21',{effect:'spellReserve'},m=>`备战结束：获得 ${m} 张随机 1 星酒馆法术。本回合每使用过一种不同名法术，星级 +1（最高 6 星）。`);
 D.byId.rune21.related=[{pool:'spell',minTier:1,maxTier:6,when:'按本回合不同名法术数量决定星级'}];
 set('forest22',{},m=>`开战：自身获得「本局打出卡牌总数」×${m} 攻击与生命（仅本场）。`);
 set('forest23',{},m=>`开战：其他友方随从获得「本局打出卡牌总数」×${m} 攻击与生命（仅本场）。`);
 set('blood7',{},m=>`开战：所有友方随从获得「本局累计自伤」×${2*m} 攻击与生命（仅本场）。`);
 set('artifact7',{},m=>`开战：所有友方随从获得「残骸 ×（1 + 残骸÷20）」×${m} 攻击与生命（向下取整，仅本场）。`);
 const rows=[
  ['seekSpell','neutral',3,2,'discoverSpell','spell','发现一张不高于酒馆星级的酒馆法术。'],
  ['seekMajority','neutral',3,4,'discoverSpell','majority','发现一个你场上数量最多的种族的随从，最高为当前酒馆星级。并列时合并这些种族。'],
  ['discardEcho','dragon',3,1,'discardEcho',null,'本回合手牌的被弃效果额外触发一次。重复施放不叠加。']
 ];
 for(const [id,tribe,tier,cost,effect,discoverKind,text]of rows){const d={...I.cards[id],id,type:'spell',tribe,tier,cost,effect,discoverKind,text,attack:0,health:0,keywords:[],target:false};if(discoverKind)d.related=[{pool:'functionalDiscover',when:discoverKind==='spell'?'发现酒馆法术':'发现场上最多的种族'}];D.spells.push(d);D.byId[id]=d;}
 D.functionalSpellIds.push('seekMajority','seekSpell');D.discoverLabels.spell='酒馆法术';D.discoverLabels.majority='优势种族随从';D.discoverLabels.minion='同星随从';
 D.discoverTier=s=>Math.min(6,s.tier);
 D.majorityTribes=s=>{const counts=Object.fromEntries(D.tribeIds.map(t=>[t,0]));for(const c of s.board||[])for(const t of D.tribesOf(c))if(t in counts)counts[t]++;const max=Math.max(0,...Object.values(counts));return max?D.tribeIds.filter(t=>counts[t]===max):[];};
 const oldPool=D.discoveryPool;
 D.discoveryPool=(s,d)=>{
  const active=s.activeTribes||D.tribeIds,available=c=>!c.retired&&(c.tribe==='neutral'||D.tribesOf(c).some(t=>active.includes(t))),top=D.discoverTier(s);
  if(d.discoverKind==='spell')return D.spells.filter(c=>available(c)&&c.tier<=s.tier&&c.id!==d.id);
  if(d.discoverKind==='highSpell')return D.spells.filter(c=>available(c)&&c.tier>=4&&c.tier<=6);
  if(d.discoverKind==='majority'){const tribes=D.majorityTribes(s);return D.cards.filter(c=>available(c)&&c.tier<=top&&D.tribesOf(c).some(t=>tribes.includes(t)));}
  if(d.discoverKind==='graveDiscovery')return D.cards.filter(c=>available(c)&&c.tier<=top&&D.abilityIds.lastWords.includes(c.id));
  if(d.discoverKind==='royal')return D.cards.filter(c=>c.id!==d.id&&available(c)&&c.tier<=top&&D.isTribe(c,'royal'));
  if(['fanfare','lastWords','endRecruit'].includes(d.discoverKind))return D.cards.filter(c=>available(c)&&c.tier<=top&&D.abilityIds[d.discoverKind].includes(c.id));
  if(d.discoverKind==='minion'&&!d.fixedTier)return D.cards.filter(c=>available(c)&&c.tier===top);
  return oldPool(s,d);
 };
 for(const id of ['seekCry','seekLast','seekEnd'])D.byId[id].text='发现一个拥有'+D.discoverLabels[D.byId[id].discoverKind].replace('随从','')+'的随从，最高为当前酒馆星级。';
 D.byId.seekCry.tier=4;D.byId.seekLast.tier=4;
 D.byId.seekRecruit.text='发现一个恰好等于当前酒馆星级的随从。';
 set('night11',{},m=>`入场曲：消耗 3 墓场，发现 ${m} 个谢幕曲随从，最高为当前酒馆星级。`);
 set('royal21',{tier:4},m=>`入场曲：发现 ${m} 个其他皇家随从，最高为当前酒馆星级。`);
 // Remove redundant pool-language in player-facing card text and generated previews.
 const clean=t=>typeof t==='string'?t.replace(/来自本局牌池[，,]?/g,'').replace(/本局牌池中的?/g,'').replace(/从本局牌池中/g,'').replace(/本局牌池/g,'').replace(/本局牌组/g,''):t;
 for(const d of [...D.cards,...D.spells,...D.amulets,...D.tokens,...D.heroes]){d.text=clean(d.text);if(d.goldenText)d.goldenText=clean(d.goldenText);for(const r of d.related||[])r.when=clean(r.when);}
 for(const id of ['ceres','windgod']){const h=D.heroes.find(h=>h.id===id);h.text=h.text.replace('最高不超过酒馆星级','最高为当前酒馆星级').replace('不高于酒馆星级','最高为当前酒馆星级');}
 D.endRecruitEffects=D.endRecruitEffects.filter(e=>e!=='miner');D.endRecruitEffects.push('treasureWages');D.abilityIds.endRecruit=D.cards.filter(c=>D.endRecruitEffects.includes(c.effect)).map(c=>c.id);
 D.archetypes.forest.support+=' 香风执行者将整局出牌数直接转化为全队开战属性。';
 D.archetypes.artifact.support+=' 埃亚隆支配者把残骸成长转化为全队攻击与生命。';
 Object.assign(D.heroes.find(h=>h.id==='olivia'),{power:'秘法重奏',text:'本回合你的下一张法术施放两次。',subtitle:'本回合你的下一张法术施放两次。'});
 D.byId.night5.tier=5;
 D.byId.night10.tier=4;
 D.byId.night24.tier=5;
 set('dragon11',{effect:'marketMealGift'},m=>`入场曲：获得 ${m} 张霸食帝的厨技。`);
 D.byId.dragon11.related=[{id:'marketMeal',count:1,scaleCount:true,when:'入场曲加入手牌'}];
 Object.assign(D.byId.marketMeal,{cost:1,attack:2,health:2,text:'使当前商店中的所有随从 +2/+2。'});
 Object.assign(D.byId.marketLegacy,{attack:1,health:1,buffRepeats:2,text:'使本局当前与未来商店随从永久 +1/+1，重复 2 次。'});
 set('haven23',{tier:6},m=>`入场曲：选择一个友方随从，将其攻击与生命永久提高至两者中较高值${m===2?'的两倍':''}。`);
 set('haven8',{tier:3,attack:3,health:5,effect:'combatMemory'},m=>`永久保留自身在战斗中获得的临时属性增益${m===2?'的两倍':''}。`);
 set('haven20',{tier:5,attack:4,health:8,effect:'memoryAura'},m=>`相邻友方随从永久保留其在战斗中获得的临时属性增益${m===2?'的两倍':''}。`);
 set('haven3',{},m=>`每当其他友方守护受到攻击前，使其获得「3 + 本随从入场生命÷8」×${m} 攻击，以及两倍该数值的生命（向下取整，仅本场）。`);
 set('haven12',{},m=>`每当你放置护符，使最左侧其他友方随从永久 +${5*m} 生命，并赋予守护。`);
 set('haven24',{},m=>`备战结束：使所有友方守护随从永久获得「友方最高生命÷3」×${m} 生命（向下取整，触发时统一计算）。`);
 set('neutral4',{tier:5,attack:6,health:8,effect:'massCry'},m=>`入场曲：其他友方随从永久 +${6*m}/+${6*m}。`);
 const angel={...I.cards.neutral21,id:'neutral21',type:'minion',tribe:'neutral',tier:4,attack:4,health:5,cost:3,keywords:[],effect:'shieldLast',text:'谢幕曲：使 1 个随机友方随从获得屏障，优先没有屏障者。',goldenText:'谢幕曲：使 2 个随机友方随从获得屏障，优先没有屏障者。'};
 D.cards.push(angel);D.byId.neutral21=angel;
 set('neutral12',{tier:4,attack:3,health:5,effect:'spellLast'},m=>`谢幕曲：战后获得 ${m} 张不高于酒馆星级的随机酒馆法术。`);
 D.byId.neutral4.related=[];D.byId.neutral12.related=[{pool:'spell',when:'谢幕曲：战后加入手牌'}];
 const priest={...I.cards.haven25,id:'haven25',type:'minion',tribe:'haven',tier:5,attack:4,health:8,cost:3,keywords:[],effect:'amuletCapacity',text:'在场时，你拥有 1 个额外的护符位。',goldenText:'在场时，你拥有 2 个额外的护符位。'};
 D.cards.push(priest);D.byId.haven25=priest;
 D.byId.mine.tier=5;
 set('royal10',{},m=>`每当其他友方触发入场曲，全体友方皇家永久获得「2 + 本局强化次数÷20」× ${m} 攻击与生命（向下取整）。`);
 set('royal3',{},m=>`每当你打出其他皇家随从，使其永久获得「6 + 本局强化次数÷10」× ${m} 攻击与生命（向下取整）。`);
 set('royal9',{},m=>`守护。开战：本局每完成 3 次属性强化，自身获得 +${m}/+${m}（仅本场）。`);
 set('royal7',{},m=>`屏障。开战：其他友方皇家获得「8 + 本局强化次数÷10」×${m} 攻击与生命；相邻友方皇家获得 ${m} 层屏障（向下取整）。`);
 const half=(t,m=1)=>t?.replace(/((?:法术研习|护符培育)(?:永久)?\s*\+)(\d+)/g,(_,a,n)=>a+Math.ceil(Number(n)/m/2)*m);
 for(const d of [...D.cards,...D.amulets,...D.tokens]){d.text=half(d.text);if(d.goldenText)d.goldenText=half(d.goldenText,2);}
 set('rune19',{},m=>`启动（1 金币，每回合一次）：法术研习永久 +${2*m}。`);
 D.byId.forest14.tier=4;
 set('forest7',{},m=>`守护。开战：其他友方随从获得「友方妖精族数量 × 8 + 妖精军团 × 2」×${m} 攻击与生命（仅本场）。`);
 set('night12',{legionCry:1},m=>`入场曲：本局死灵军势永久 +${m} 攻击。复生：首次死亡后，以 1 生命重新入场。`);
 if(!D.fanfareIds.includes('night12'))D.fanfareIds.push('night12');
 D.fanfareIds=D.fanfareIds.filter(id=>id!=='neutral12');
 if(!D.fanfareIds.includes('neutral4'))D.fanfareIds.push('neutral4');
 D.lastWordEffects.push('shieldLast','spellLast');
 D.endRecruitEffects=D.endRecruitEffects.filter(e=>e!=='amuletAccelerator');D.abilityIds.endRecruit=D.cards.filter(c=>D.endRecruitEffects.includes(c.effect)).map(c=>c.id);
 D.abilityIds.fanfare=[...D.fanfareIds];D.abilityIds.lastWords=D.cards.filter(c=>D.lastWordEffects.includes(c.effect)||c.id==='dragon1').map(c=>c.id);
 D.archetypes.haven.support='守护受击成长与生命养成；兔耳治愈师保留自身战内属性，萝蕾娜帮助相邻友方保留属性，可配合圣女贞德与勒碧丝的传承。';
 set('artifact10',{},m=>`每当其他友方造物死亡，武装研习进度永久 +${6*m}（每 3 点使武装品质 +1/+1）。`);
 set('forest18',{},m=>`备战结束：本回合每打出一张牌，自身与最左侧其他友方随从永久 +${2*m}/+${2*m}。`);
 D.byId.rune13.tier=3;
 set('haven18',{},m=>`每当己方护符倒数归零，使迦楼罗以外的友方主教永久获得「本随从生命 × ${m}」生命。`);
 D.byId.rune24.tier=4;
 D.byId.haven10.tier=5;
 for(const d of D.amulets.filter(c=>c.tier<=3&&c.count===1)){d.count=2;d.text=d.text.replace('倒数 1','倒数 2');}
 Object.assign(D.heroes.find(h=>h.id==='night'),{armor:6});
 Object.assign(D.heroes.find(h=>h.id==='dragon'),{text:'本回合下次刷新免费，最左侧随从替换为高于酒馆 1 星的随机随从（最高 6 星）。',subtitle:'免费刷新，寻找更高星级的随从。'});
 D.byId.artifact24.tier=4;
 D.byId.haven7.keywords=D.byId.haven7.keywords.filter(k=>k!=='taunt');
 D.byId.haven7.text=D.byId.haven7.text.replace('守护。','');D.byId.haven7.goldenText=D.byId.haven7.goldenText.replace('守护。','');
 set('dragon21',{},m=>`每当你弃掉一张手牌，全体友方龙族永久获得「2 + 本局弃牌数」× ${m} 攻击，以及「3 + 本局弃牌数」× ${m} 生命。`);
 set('blood13',{},m=>`每次招募自伤成功后，本局酒馆随从永久 +${m}/+${2*m}。`);
 set('blood9',{effect:'feastBanquet',signature:'绯红盛宴'},m=>`备战结束：依次吞噬攻击最高的两个商店随从，自身永久获得其 ${m} 倍攻击与生命。`);
 set('blood24',{effect:'painFeast',signature:'嗜血暴食'},m=>`每次招募自伤成功后，吞噬攻击最高的一个商店随从，自身永久获得其 ${m} 倍攻击与生命。`);
 D.abilityIds.endRecruit=D.cards.filter(c=>D.endRecruitEffects.includes(c.effect)).map(c=>c.id);
 const yuwan=D.heroes.find(h=>h.id==='bahamut');yuwan.cost=0;yuwan.subtitle=yuwan.text;
 const hero=(id,fields)=>{const h=D.heroes.find(h=>h.id===id);Object.assign(h,fields);h.subtitle=h.text;};
 hero('forte',{cost:0,armor:4,text:'使一个友方在下一场战斗获得连击与一层屏障。连击不与已有连击叠加。'});
 hero('snow',{cost:0,armor:5});
 hero('forest',{armor:4});
 hero('night',{cost:1,armor:12,target:true,power:'谢幕回响',text:'选择一个具有谢幕曲的友方随从：下一场战斗中，其首次谢幕曲额外触发一次。',related:[]});
 hero('blood',{cost:1,armor:8,power:'嗜血追猎',text:'自伤 1，获得本回合两次免费刷新。',related:[]});
 hero('aria',{cost:0,armor:10,target:true,power:'林间回返',text:'将一个友方随从收回手牌，保留其附加属性。',related:[]});
 for(const [id,leaderId,name,power,cost,armor,text]of [
  ['filene','804','菲琳','冰封宝藏',1,12,'选择一个商店随从，将其移出商店。两个回合开始后获得该随从，并使其永久 +4/+4。'],
  ['erasmus','103','艾拉斯姆斯','秘法集市',1,10,'将整个商店刷新为不高于酒馆星级的随机酒馆法术。'],
  ['albert','402','阿尔贝尔','悬赏征集',0,12,'本回合接下来出售 3 个不同名随从后，下回合额外获得 3 金币。']
 ])D.heroes.push({id,leaderId,name,power,cost,armor,text,subtitle:text,tribe:'neutral',target:false,art:'dusk-tavern/assets/leader-'+leaderId+'.webp',sourceUrl:'https://svgdb.me/leaders/'+leaderId,imageSource:'https://svgdb.me/assets/leader/class_'+leaderId+'_profile.png',sourceName:({filene:'Filene',erasmus:'Erasmus',albert:'Albert'})[id],related:[]});
 set('forest7',{effect:'fairyBulwark'},m=>`守护。每当你召唤一个妖精，自身与最左侧其他友方随从永久获得「妖精军团 × ${m}」的攻击与生命。`);
 D.archetypes.forest.support='妖精军团由魔法精灵公主与莉莎培育；远古树精将每次妖精召唤转化为自身与最左侧其他友方的永久成长。';
 set('forest6',{},m=>`每当友方衍生随从攻击前，使其本场获得「3 + 本回合打牌数÷3」× ${m} 的攻击与生命；妖精军团永久获得「1 + 本回合打牌数÷9」× ${m} 的攻击与生命（均向下取整）。`);
 set('dragon16',{effect:'deathPulse'},m=>`谢幕曲：对所有随从造成 1 点伤害，重复 ${2*m} 次。`);
 D.lastWordEffects.push('deathPulse');
 D.abilityIds.lastWords=D.cards.filter(c=>D.lastWordEffects.includes(c.effect)||c.id==='dragon1').map(c=>c.id);
 D.archetypes.dragon.routes[0][1]=D.archetypes.dragon.routes[0][1].replace('龙技达人攻击后持续刺激相邻龙族','龙技达人谢幕时连续震击全场，触发友方受伤收益并破除敌方屏障');
 set('haven5',{tier:3,effect:'amuletReserve',signature:'圣物储备'},m=>`备战结束：获得 ${m} 张随机护符。`);
 D.byId.haven5.related=[{pool:'amulet',when:'备战结束获得'}];
 D.endRecruitEffects.push('amuletReserve');D.abilityIds.endRecruit=D.cards.filter(c=>D.endRecruitEffects.includes(c.effect)).map(c=>c.id);
 set('haven18',{},m=>`每当己方护符倒数归零，使迦楼罗以外的友方主教永久获得「本随从生命÷3」×${m} 生命（向下取整）。`);
 // Broaden the opening spell pool without adding duplicate stat spells.
 Object.assign(D.byId.mana,{token:true,cost:0});
 D.spells=D.spells.filter(c=>c.id!=='mana');
 if(!D.tokens.some(c=>c.id==='mana'))D.tokens.push(D.byId.mana);
 for(const id of ['growth','guard','marketMeal','rest'])Object.assign(D.byId[id],{tier:1,cost:1,tribe:'neutral',poolTribe:'neutral'});
 Object.assign(D.byId.rich,{tier:2,cost:1});
 Object.assign(D.byId.coin,{tier:1,cost:1,token:false,poolTribe:'neutral'});
 D.tokens=D.tokens.filter(c=>c.id!=='coin');
 if(!D.spells.some(c=>c.id==='coin'))D.spells.push(D.byId.coin);
 Object.assign(D.byId.guard,{attack:0,health:3,text:'使一个友方随从永久 +3 生命，并赋予守护。'});
 set('dragon15',{},m=>`每当你打出一个龙族随从（包括自身），本局酒馆随从永久 +${m}/+${m}，然后使本随从此效果的增益永久提高 +${m}/+${m}。`);
 for(const [id,name,sourceId,tier,attack,health,effect] of [
  ['dragon25','水龙神巫女',104441010,4,4,6,'discardTavern'],
  ['dragon26','育龙者·玛蒂达',106411010,4,3,4,'tavernSupply']
 ]){const c={id,name,sourceName:name,sourceId,sourceUrl:'https://svgdb.me/cards/'+sourceId,imageSource:'https://svgdb.me/assets/fullart/'+sourceId+'0.png',art:'dusk-tavern/assets/'+sourceId+'.webp',originalType:1,originalClan:4,type:'minion',tribe:'dragon',tier,cost:3,attack,health,effect,synergy:true,keywords:[]};D.cards.push(c);D.byId[id]=c;}
 set('dragon25',{signature:'弃牌育龙'},m=>`每当你弃掉一张手牌，本局酒馆随从永久 +${2*m}/+${2*m}。`);
 set('dragon26',{signature:'龙巢启示',related:[{id:'dragon',count:1,scaleCount:true,when:'备战结束加入手牌'}]},m=>`备战结束：获得 ${m} 张龙之启示。`);
 D.abilityIds.endRecruit=D.cards.filter(c=>D.endRecruitEffects.includes(c.effect)).map(c=>c.id);
 D.archetypes.dragon.routes[1]=['酒馆成长与吞噬','织术师随打出龙族不断提高酒馆增益，玛蒂达补充龙之启示；水龙神巫女把弃牌转为酒馆成长，贾巴沃克贡献自身八分之一身材。元祖驭龙使与培冬把酒馆属性传给战场。',['dragon15','dragon26','dragon25','dragon10','dragon17','dragon24','dragon21','dragon12']];
 D.tuning.dragonHurtHealth=2;D.tuning.dragonTrainer=5;D.tuning.serpentAttack=4;D.tuning.serpentHealth=6;
 set('dragon2',{},m=>`守护。受到伤害且存活时，永久 +${D.tuning.dragonHurt*m}/+${D.tuning.dragonHurtHealth*m}。`);
 set('dragon4',{},m=>`友方龙族受到伤害且存活时，另一个随机友方龙族永久 +${D.tuning.dragonTrainer*m}/+${D.tuning.dragonTrainer*m}。`);
 set('dragon13',{},m=>`每当自身受到伤害并存活，本局酒馆随从永久 +${D.tuning.serpentAttack*m}/+${D.tuning.serpentHealth*m}。`);
 set('haven4',{},m=>`备战结束：使天狐以外的友方主教永久获得「2 + 自身生命÷4」×${m} 生命（向下取整）。`);
 set('haven24',{},m=>`备战结束：使所有友方守护随从永久获得「备战结束前友方最高生命÷3」×${m} 生命（向下取整；本轮额外触发使用相同基数）。`);
 const challengePortrait=(root.TavernLeaderPortraits||(typeof require!=='undefined'?require('./leader-portraits.js'):null)).portraits.challenge;
 D.heroes.push({...challengePortrait,id:'challenge',tribe:'neutral',power:'不朽试炼',armor:0,cost:0,target:false,passive:true,challenge:true,upgradeTax:1,text:'被动：升本价格始终 +1 金币。',subtitle:'挑战主战者'});
 set('haven16',{},m=>`守护。开战：获得等同自身当时生命 ×${m} 的攻击力（仅本场）。`);
 set('blood21',{keywords:['stealth']},m=>`潜行。战斗开始时及你在战斗中召唤新的丛林蝙蝠时，使其额外获得 ${m} 次复生。`);
 set('blood8',{related:[{id:'bat',attack:3,health:2,count:2,scale:true,when:'谢幕曲召唤'}]},m=>`谢幕曲：召唤两个 ${3*m}/${2*m} 丛林蝙蝠。`);
 D.byId.blood16.brood.count=2;
 D.byId.blood16.related[0].count=2;
 set('blood16',{},m=>`守护。谢幕曲：召唤 2 个 ${2*m}/${m} 丛林蝙蝠，额外继承本体一半最大生命（向下取整）。`);
 set('blood17',{},m=>`每当友方蝙蝠死亡，全体友方吸血鬼永久 +${3*m}/+${3*m}。`);
 Object.assign(D.byId.bloodImmunity,{text:'本回合你的自伤不扣除生命，然后自伤 1。仍累计自伤并触发自伤效果，免伤持续至备战结束结算完毕。'});
 Object.assign(D.byId.bloodContract,{purchaseSelfHarmRepeats:2,text:'购买时：自伤 1，重复两次（最低保留 1 生命）。使用时：获得两张鲜血的吻唇。'});
 Object.assign(D.byId.bloodGarden,{text:'倒数 2：自伤 1，重复两次；成功自伤后，使全体友方随从永久 +3/+3，并获得一张丛林蝙蝠。共鸣。'});
 set('blood3',{},m=>`入场曲：自伤 1，重复两次；成功自伤后，下回合额外获得 ${3*m} 金币。`);
 const shelter={id:'blood25',name:'终幕吸血鬼·尤里亚斯',sourceName:'终幕吸血鬼·尤里亚斯',sourceId:121641030,sourceUrl:'https://svgdb.me/cards/121641030',imageSource:'https://svgdb.me/assets/fullart/1216410300.png',art:'dusk-tavern/assets/121641030.webp',originalType:1,originalClan:6,type:'minion',tribe:'blood',tier:3,cost:3,attack:3,health:5,effect:'immunitySupply',synergy:true,keywords:[]};
 D.cards.push(shelter);D.byId[shelter.id]=shelter;
 set('blood25',{related:[{id:'bloodImmunity',count:1,scaleCount:true,when:'本回合施放至少两张法术，备战结束加入手牌'}]},m=>`备战结束：若本回合施放过至少两张法术，获得 ${m} 张悚惧气息。`);
 D.endRecruitEffects.push('immunitySupply');D.abilityIds.endRecruit=D.cards.filter(c=>D.endRecruitEffects.includes(c.effect)).map(c=>c.id);
 D.fairySpendCost=5;
 set('forest11',{related:[{id:'growth',count:1,scaleCount:true,when:'每花费 5 金币加入手牌'}]},m=>`在场时每花费 5 金币，获得 ${m} 张大自然的导引；消费进度跨回合保留。`);
 set('artifact5',{effect:'artifactAvenger',related:[{id:'spinariaArtifact',count:1,scale:true,dynamic:'weapon',when:'复仇（5）召唤，获得武装品质加成并立即攻击'}]},m=>`复仇（5）：召唤一个 ${m}/${3*m} 丝碧涅的创造物，使其获得当前武装品质 ×${m} 的属性加成，并立即攻击。`);
 set('artifact15',{},m=>`备战结束：武装研习 +${m}。每次对本随从使用武装，此效果的收益永久 +${m}。`);
 D.byId.blood10.tier=4;
 D.byId.magicField.cost=1;
 D.byId.dragon20.tier=3;
 set('artifact9',{windfury:true},m=>`连击。攻击时无视守护，优先攻击可被选中的攻击力最低的敌方。开战：获得「本局残骸 × ${m}」攻击（仅本场）。`);
 D.archetypes.artifact.routes[1][1]='机械犬与史学家提供战斗召唤，诺伦强化不同造物的连携，丝碧涅通过复仇召唤武装造物并立即攻击；伊卡洛斯与遗物承接残骸，纱妃拉连击切入低攻击目标。';
 D.rulesVersion='28.15';
}
root.TavernRenewal={apply};if(typeof module!=='undefined')module.exports={apply};
})(typeof globalThis!=='undefined'?globalThis:this);
