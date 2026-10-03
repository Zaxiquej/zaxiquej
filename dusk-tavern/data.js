(function(root){
'use strict';
const tribes={forest:{name:'妖精',color:'#84d6a6',icon:'❧',motto:'连击 · 衍生 · 生长',dir:'arisa'},royal:{name:'皇家',color:'#e5c478',icon:'⚜',motto:'号令 · 屏障 · 军团',dir:'erika'},dragon:{name:'龙族',color:'#ec9869',icon:'♜',motto:'溢出 · 成长 · 吐息',dir:'rowen'},night:{name:'死灵',color:'#bc9de5',icon:'☾',motto:'墓场 · 亡语 · 复生',dir:'luna'},rune:{name:'巫师',color:'#8fbfea',icon:'✧',motto:'增幅 · 法术 · 奥秘',dir:'mysterian'},haven:{name:'圣域',color:'#e4dbb1',icon:'♢',motto:'护符 · 倒数 · 守护',dir:'eris'},neutral:{name:'中立',color:'#acb8c5',icon:'◇',motto:'万象共鸣',dir:'orchis'}};
// Original tavern rules and names; the illustrations are existing local Shadowverse assets.
// tier, name, attack, health, effect, rules, keywords
const rows={
forest:[
[1,'迷途的小妖精',2,2,'fairy','谢幕曲：召唤一个 1/1 妖精。'],
[1,'林间引路人',1,3,'combo','每回合打出第 3 张牌时，永久获得 +2/+2。'],
[2,'花冠的使者',3,3,'gift','入场曲：获得一张「自然的馈赠」。'],
[3,'月下游侠',5,3,'cleave','攻击时，对目标相邻随从造成等同攻击力的伤害。'],
[3,'翠叶的守望者',3,6,'forestEnd','备战结束：其他妖精永久获得 +1/+1。','taunt'],
[4,'双生花精',5,5,'fairy2','谢幕曲：召唤两个 3/3 妖精。'],
[5,'森之女王',5,8,'summonBuff','战斗中你召唤的随从获得 +3/+3。'],
[6,'永绿的古神',8,10,'forestStart','开战：每有一个友方妖精，使全体友方获得 +2/+2。','taunt']],
royal:[
[1,'银翼新兵',2,2,'','屏障。','shield'],
[1,'边境的旗手',2,3,'knightGift','入场曲：获得一个 1/1 皇家侍从。'],
[2,'铁壁近卫',2,6,'','守护。','taunt'],
[3,'白银战术家',4,4,'royalBuff','入场曲：其他皇家永久获得 +2 攻击力。'],
[3,'誓约骑士',4,5,'reborn','复生：首次死亡后以 1 生命复活。','taunt'],
[4,'黎明的剑姬',6,5,'double','连击：每次行动连续攻击两次。','shield'],
[5,'不落的军旗',5,8,'shieldBuff','友方屏障被打破时，所有友方获得 +2/+1（仅本场）。'],
[6,'王国的光辉',8,9,'royalStart','开战：给予其他皇家屏障与 +4/+4。','shield']],
dragon:[
[1,'焰鳞幼龙',3,2,'dragonGrow','备战结束：若酒馆达到 4 星，永久获得 +2/+2。'],
[1,'寻宝的龙人',2,3,'discount','入场曲：本次酒馆升级费用减少 1。'],
[2,'灼热的守门龙',3,5,'rage','受到伤害且存活：获得 +3 攻击力（仅本场）。','taunt'],
[3,'雷鸣翼龙',5,5,'blast','开战：对一个随机敌方造成 4 点伤害。'],
[3,'赤鳞训导师',4,6,'dragonEnd','备战结束：一个随机其他龙族永久获得 +3/+3。'],
[4,'熔火地龙',7,8,'rage','受到伤害且存活：获得 +3 攻击力（仅本场）。','taunt'],
[5,'苍穹的风暴',9,7,'cleave','攻击时，对目标相邻随从造成等同攻击力的伤害。'],
[6,'终焉龙皇',12,12,'dragonStart','开战：对全体敌方造成等同你酒馆星级的伤害。']],
night:[
[1,'白骨的低语',2,2,'skeleton','谢幕曲：召唤一个 2/1 骷髅。'],
[1,'冥河摆渡人',1,4,'graveGift','入场曲：获得 3 点墓场。'],
[2,'不眠的尸兵',3,4,'reborn','复生：首次死亡后以 1 生命复活。'],
[3,'幽夜的收割者',5,4,'deathGrow','其他友方死亡时，获得 +2/+2（仅本场）。'],
[3,'灵魂编织者',3,6,'necro','备战结束：死灵术 3，消耗 3 墓场，使全体死灵永久 +1/+2。'],
[4,'双面地狱犬',6,6,'hounds','谢幕曲：召唤两个 4/3 地狱犬。'],
[5,'冥府的执政官',7,8,'deathBlast','谢幕曲：对所有敌方造成 5 点伤害。','taunt'],
[6,'永夜女王',8,10,'nightStart','开战：消耗至多 10 墓场，每点使全体友方获得 +1/+1。']],
rune:[
[1,'星屑学徒',2,3,'spellGrow','每施放一个法术，永久获得 +1/+1。'],
[1,'魔力猫头鹰',3,2,'spellGift','入场曲：获得一张「魔力注入」。'],
[2,'水晶魔像',2,7,'','守护。','taunt'],
[3,'苍蓝的炼金师',4,5,'spellEnd','备战结束：获得一张「魔力注入」。'],
[3,'符文炮手',5,4,'spellBlast','开战：对随机敌方造成 2 + 本局施法数（至多 20）点伤害。'],
[4,'镜界魔导师',6,6,'spellTeam','每施放一个法术，其他友方永久获得 +1 攻击力。'],
[5,'奥术观测者',5,9,'spellHealth','每施放一个法术，全体友方永久获得 +1/+2。'],
[6,'星辰的终结者',9,9,'runeStart','开战：全体友方获得等同本局施法数的攻击力（至多 20）。']],
haven:[
[1,'烛光的祈祷者',1,4,'amuletGrow','己方护符倒数归零时，永久获得 +2/+2。'],
[1,'巡礼的小翼',2,3,'havenGift','入场曲：获得一张「祝福」。'],
[2,'圣堂守护者',2,6,'','守护。屏障。','taunt shield'],
[3,'白羽的司祭',3,6,'havenEnd','备战结束：全体拥有守护的友方永久获得 +1/+1。'],
[3,'晨星独角兽',4,5,'heal','备战结束：你的英雄恢复 2 点生命。'],
[4,'辉光执事',5,7,'amuletEnd','备战结束：若有护符，全体友方永久获得 +1/+2。'],
[5,'翼光的裁决者',7,8,'holyDeath','谢幕曲：给予一个随机友方屏障与 +5/+5。','taunt'],
[6,'圣域的炽天使',8,12,'havenStart','开战：拥有守护的友方获得 +6/+6 与屏障。','taunt']],
neutral:[
[1,'旅店小帮手',2,3,'','没有特殊效果。'],
[2,'流浪的铸甲师',3,4,'armorGift','入场曲：一个随机其他友方永久获得 +3 生命。'],
[3,'万象收藏家',4,5,'menagerie','备战结束：每种兵种各一个随机友方永久获得 +1/+1。'],
[4,'黄昏守门人',4,10,'','守护。屏障。','taunt shield'],
[5,'天幕的见证者',6,8,'rally','入场曲：其他友方永久 +2/+2。备战结束：相邻友方永久 +2/+2。'],
[6,'无垠的旅人',10,10,'menagerieStart','开战：每有一种不同兵种，全体友方获得 +2/+2。']]
};
const cards=[];
Object.entries(rows).forEach(([tribe,rs])=>rs.forEach((r,i)=>cards.push({id:`${tribe}${i}`,type:'minion',tribe,tier:r[0],name:r[1],attack:r[2],health:r[3],effect:r[4],text:r[5],keywords:(r[6]||'').split(' ').filter(Boolean),art:`${tribes[tribe].dir}/image/creature${i+1}.png`,cost:3})));
const spells=[
['growth','自然的馈赠',1,1,'buff',2,2,'使一个友方永久获得 +2/+2。','forest',true],
['mana','魔力注入',1,1,'buff',2,0,'使一个友方永久获得 +2 攻击力。','rune',true],
['bless','祝福',1,1,'buff',0,3,'使一个友方永久获得 +3 生命。','haven',true],
['guard','守护之誓',2,2,'guard',1,3,'使一个友方永久获得 +1/+3 与守护。','royal',true],
['shield','光之屏障',3,2,'shield',0,0,'给予一个友方屏障。','haven',true],
['evo','光明之路',3,3,'fortify',1,2,'全体友方永久获得 +1/+2。','neutral',false],
['team','森罗祝祷',4,3,'team',2,2,'所有友方永久获得 +2/+2。','forest',false],
['bones','灵魂契约',2,1,'bones',0,0,'获得 5 点墓场。','night',false],
['ritual','亡者的赠礼',3,2,'ritual',0,0,'消耗至多 8 墓场，使一个友方获得等量 +攻击/+生命。','night',true],
['dragon','龙之觉醒',4,3,'dragon',4,4,'使一个友方永久 +4/+4；若是龙族，再 +2/+2。','dragon',true],
['clock','命运加速',2,1,'clock',0,0,'所有护符倒数减少 1；归零时立即触发。','haven',false],
['rich','黄金之约',5,0,'rich',0,0,'本回合获得 2 金币。','neutral',false]
].map((r,i)=>({id:r[0],name:r[1],tier:r[2],cost:r[3],effect:r[4],attack:r[5],health:r[6],text:r[7],tribe:r[8],target:r[9],type:'spell',art:`${tribes[r[8]].dir}/image/creature${i%8+9}.png`}));
const amulets=[
['garden','妖精的庭院',1,2,2,'garden','倒数 2：所有友方永久 +2/+2；妖精额外 +1/+1。','forest'],
['tomb','冥府的回廊',1,1,2,'tomb','倒数 2：获得 6 墓场与一个 3/3 骷髅侍卫。','night'],
['banner','王家战旗',2,2,2,'banner','倒数 2：所有友方永久 +3 攻击力，随机友方获得屏障。','royal'],
['egg','古龙的卵',3,3,3,'egg','倒数 3：获得一个 12/12、拥有守护的古龙。','dragon'],
['library','星见书库',2,2,2,'library','倒数 2：获得三张随机法术（至多 4 星）。','rune'],
['bell','圣愿之钟',2,2,2,'bell','倒数 2：英雄恢复 5 生命，全体友方永久 +2 生命。','haven'],
['temple','白翼圣殿',4,3,3,'temple','倒数 3：全体友方永久 +3/+5，并获得守护。','haven'],
['hourglass','永恒沙漏',5,3,2,'hourglass','倒数 2：获得一个高于酒馆 1 星的随机随从（最高 6 星）。','neutral']
].map((r,i)=>({id:r[0],name:r[1],tier:r[2],cost:r[3],count:r[4],effect:r[5],text:r[6],tribe:r[7],type:'amulet',art:`${tribes[r[7]].dir}/image/creature${i+10}.png`}));
const trinkets=[
['seed','初生之种','small','❧','每次打出随从，使其永久获得 +1/+1。'],
['purse','旅人的钱袋','small','◈','每回合额外获得 1 金币。'],
['bone','白骨吊坠','small','☾','每回合额外获得 3 墓场。'],
['quill','星辉羽笔','small','✧','每回合获得一张「魔力注入」。'],
['bud','时之花蕾','small','❀','你的新护符初始倒数减少 1（最低 1）。'],
['crest','近卫徽章','small','⚜','备战结束：最左侧随从永久获得 +2/+2。'],
['worldtree','世界树之心','large','❧','战斗中召唤的友方获得 +5/+5。'],
['crown','苍穹王冠','large','♛','开战：全体友方获得 +5/+5。'],
['mirror','真理魔镜','large','✧','每施放法术，全体友方永久获得 +1/+1。'],
['relic','遗忘的圣遗物','large','♢','护符倒数归零时，其效果触发两次。'],
['moon','永夜之月','large','☾','开战：最左侧随从获得复生与屏障。'],
['prism','万色棱晶','large','◇','备战结束：每种不同兵种使一个随机友方永久获得 +2/+2。']
].map(r=>({id:r[0],name:r[1],size:r[2],icon:r[3],text:r[4],type:'trinket'}));
const heroes=[
{id:'forest',name:'森语使者',subtitle:'让渺小的生命，汇成森林。',power:'翠绿的赠礼',cost:1,text:'主动：获得一个 1/1 妖精。被动：每回合每打出第 3 张牌，全体友方永久 +1/+1。',art:'arisa/image/creature201.png'},
{id:'royal',name:'白银指挥官',subtitle:'你的剑锋，即是黎明。',power:'骑士的誓约',cost:2,target:true,text:'使一个友方永久获得 +1/+2 与屏障。',art:'erika/image/creature201.png'},
{id:'dragon',name:'苍炎龙使',subtitle:'在烈焰中，迎接觉醒。',power:'龙之财宝',cost:1,text:'本次酒馆升级费用减少 2；随机友方永久 +1/+1。',art:'rowen/image/creature201.png'},
{id:'night',name:'幽夜引魂者',subtitle:'死亡，是另一段旅程。',power:'灵魂回响',cost:1,text:'获得 4 墓场，并获得一个 2/1 骷髅。',art:'luna/image/creature201.png'},
{id:'rune',name:'星辉魔导师',subtitle:'将命运，写入星辰。',power:'魔力研习',cost:1,text:'获得一张随机法术（不高于酒馆星级）。',art:'mysterian/image/creature201.png'},
{id:'haven',name:'圣白巡礼者',subtitle:'长夜尽头，仍有光。',power:'祈愿之刻',cost:1,text:'所有护符倒数减少 1；若没有护符，获得「圣愿之钟」。',art:'eris/image/creature201.png'}];
const tokens=[{id:'fairy',name:'妖精',tribe:'forest',attack:1,health:1},{id:'knight',name:'皇家侍从',tribe:'royal',attack:1,health:1},{id:'skeleton',name:'骷髅',tribe:'night',attack:2,health:1},{id:'hound',name:'地狱犬',tribe:'night',attack:4,health:3},{id:'ancient',name:'破壳的古龙',tribe:'dragon',attack:12,health:12,keywords:['taunt']}].map((x,i)=>({...x,type:'minion',tier:1,cost:3,effect:'',text:'衍生随从。',token:true,keywords:x.keywords||[],art:`${tribes[x.tribe].dir}/image/creature${i+12}.png`}));
tokens.push({id:'coco',name:'可可',tribe:'night',attack:1,health:2,type:'minion',tier:1,cost:3,effect:'coco',text:'谢幕曲：使一个随机友方获得 +2/+2（仅本场）。',token:true,keywords:[]});
const I=root.TavernIdentity||(typeof require!=='undefined'?require('./identity.js'):null);
if(!I)throw Error('Shadowverse card identity map is missing.');
const renamed=[];
for(const c of [...cards,...spells,...amulets,...tokens]){const r=I.cards[c.id];if(!r)throw Error('Missing identity: '+c.id);renamed.push([c.name,r.name]);Object.assign(c,r);}
for(const c of trinkets){renamed.push([c.name,I.trinkets[c.id].name]);Object.assign(c,I.trinkets[c.id]);}
for(const h of heroes)Object.assign(h,I.heroes[h.id]);
for(const c of [...cards,...spells,...amulets,...trinkets,...heroes])for(const [oldName,newName] of renamed.sort((a,b)=>b[0].length-a[0].length))c.text=c.text.split('「'+oldName+'」').join('「'+newName+'」');
tribes.royal.name='皇家护卫';tribes.haven.name='主教';
const all=[...cards,...spells,...amulets,...tokens],byId=Object.fromEntries(all.map(c=>[c.id,c]));
byId.knight.text='衍生随从，没有特殊效果。';byId.fairy.text='衍生随从，没有特殊效果。';byId.skeleton.text='衍生随从，没有特殊效果。';byId.ancient.text='守护。敌方必须优先攻击拥有守护的随从。';
Object.assign(byId.hound,{attack:2,health:1,effect:'mimi',text:'谢幕曲：对一个随机敌方造成 2 点伤害。'});
byId.night5.text='谢幕曲：召唤一个 2/1 的守卫犬的右腕·米米和一个 1/2 的守卫犬的左腕·可可。';
byId.royal1.text='入场曲：获得一个 1/1 骑士。';byId.night0.text='谢幕曲：召唤一个 2/1 骷髅士兵。';
byId.tomb.text='倒数 2：获得 6 墓场与一个 3/3 骷髅士兵。';byId.egg.text='倒数 3：获得一个 12/12、拥有守护的圣翼的白龙。';
heroes.find(h=>h.id==='night').text='获得 4 墓场，并获得一个 2/1 骷髅士兵。';
// Generated cards are explicit data, so the inspector, codex and battle replay can show their real effects.
byId.forest0.related=[{id:'fairy',attack:1,health:1,count:1,when:'谢幕曲召唤',scale:true}];
byId.forest2.related=[{id:'growth',count:1,when:'加入手牌',scaleCount:true}];
byId.forest5.related=[{id:'fairy',attack:3,health:3,count:2,when:'谢幕曲召唤',scale:true}];
byId.royal1.related=[{id:'knight',attack:1,health:1,count:1,when:'加入手牌',scaleCount:true}];
byId.night0.related=[{id:'skeleton',attack:2,health:1,count:1,when:'谢幕曲召唤',scale:true}];
byId.night5.related=[{id:'hound',attack:2,health:1,count:1,when:'谢幕曲召唤',scale:true},{id:'coco',attack:1,health:2,count:1,when:'谢幕曲召唤',scale:true}];
byId.rune1.related=[{id:'mana',count:1,when:'加入手牌',scaleCount:true}];byId.rune3.related=[{id:'mana',count:1,when:'备战结束加入手牌',scaleCount:true}];byId.haven1.related=[{id:'bless',count:1,when:'加入手牌',scaleCount:true}];
byId.tomb.related=[{id:'skeleton',attack:3,health:3,count:1,when:'倒数归零加入手牌'}];byId.egg.related=[{id:'ancient',attack:12,health:12,count:1,when:'倒数归零加入手牌'}];
byId.library.related=[{pool:'spell',maxTier:4,when:'随机获得三张法术'}];byId.hourglass.related=[{pool:'discover',when:'随机获得高于酒馆 1 星的随从'}];
heroes.find(h=>h.id==='forest').related=[{id:'fairy',count:1,when:'主动技能加入手牌'}];heroes.find(h=>h.id==='night').related=[{id:'skeleton',count:1,when:'主动技能加入手牌'}];heroes.find(h=>h.id==='haven').related=[{id:'bell',count:1,when:'没有护符时加入手牌'}];heroes.find(h=>h.id==='rune').related=[{pool:'spell',when:'随机获得不高于酒馆星级的法术'}];
trinkets.find(t=>t.id==='quill').related=[{id:'mana',count:1,when:'每回合加入手牌'}];
const opponentNames=['亚里莎','艾莉卡','罗文','露娜','伊莎贝尔','伊莉丝','巴哈姆特'];
const D={tribes,cards,spells,amulets,trinkets,heroes,tokens,byId,opponentNames};
(root.TavernEffects||(typeof require!=='undefined'?require('./effects.js'):null)).apply(D);
(root.TavernExpansion||(typeof require!=='undefined'?require('./expansion.js'):null)).apply(D,I);
(root.TavernBalance||(typeof require!=='undefined'?require('./balance.js'):null)).apply(D);
(root.TavernDiversity||(typeof require!=='undefined'?require('./diversity.js'):null)).apply(D,I);
(root.TavernSynergies||(typeof require!=='undefined'?require('./synergies.js'):null)).apply(D,I);
(root.TavernHeroes||(typeof require!=='undefined'?require('./heroes.js'):null)).apply(D,I);
(root.TavernTuning||(typeof require!=='undefined'?require('./tuning.js'):null)).apply(D);
(root.TavernArchetypes||(typeof require!=='undefined'?require('./archetypes.js'):null)).apply(D);
(root.TavernConstructs||(typeof require!=='undefined'?require('./constructs.js'):null)).apply(D,I);
(root.TavernRoyal||(typeof require!=='undefined'?require('./royal.js'):null)).apply(D);
(root.TavernMarket||(typeof require!=='undefined'?require('./market.js'):null)).apply(D);
(root.TavernInjury||(typeof require!=='undefined'?require('./injury.js'):null)).apply(D,I);
(root.TavernUtility||(typeof require!=='undefined'?require('./utility.js'):null)).apply(D,I);
(root.TavernNecromancy||(typeof require!=='undefined'?require('./necromancy.js'):null)).apply(D);
(root.TavernFunctional||(typeof require!=='undefined'?require('./functional.js'):null)).apply(D,I);
(root.TavernAmuletExpansion||(typeof require!=='undefined'?require('./amulet-expansion.js'):null)).apply(D,I);
(root.TavernDecisions||(typeof require!=='undefined'?require('./decisions.js'):null)).apply(D,I);
(root.TavernVitality||(typeof require!=='undefined'?require('./vitality.js'):null)).apply(D);
(root.TavernResonance||(typeof require!=='undefined'?require('./resonance.js'):null)).apply(D);
(root.TavernBarriers||(typeof require!=='undefined'?require('./barriers.js'):null)).apply(D);
(root.TavernDistinctive||(typeof require!=='undefined'?require('./distinctive.js'):null)).apply(D);
(root.TavernNeutralEchoes||(typeof require!=='undefined'?require('./neutral-echoes.js'):null)).apply(D,I);
(root.TavernNeutralSpells||(typeof require!=='undefined'?require('./neutral-spells.js'):null)).apply(D,I);
(root.TavernCommerce||(typeof require!=='undefined'?require('./commerce.js'):null)).apply(D,I);
(root.TavernAscension||(typeof require!=='undefined'?require('./ascension.js'):null)).apply(D);
(root.TavernLeaderPortraits||(typeof require!=='undefined'?require('./leader-portraits.js'):null)).apply(D);
(root.TavernArcana||(typeof require!=='undefined'?require('./arcana.js'):null)).apply(D,I);
(root.TavernReinforcements||(typeof require!=='undefined'?require('./reinforcements.js'):null)).apply(D,I);
(root.TavernExpedition||(typeof require!=='undefined'?require('./expedition.js'):null)).apply(D,I);
(root.TavernReforged||(typeof require!=='undefined'?require('./reforged.js'):null)).apply(D);
(root.TavernRenewal||(typeof require!=='undefined'?require('./renewal.js'):null)).apply(D,I);
root.TavernData=D;if(typeof module!=='undefined')module.exports=D;
})(typeof globalThis!=='undefined'?globalThis:this);
