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
  if(d.discoverKind==='royal')return D.cards.filter(c=>available(c)&&c.tier<=top&&D.isTribe(c,'royal'));
  if(['fanfare','lastWords','endRecruit'].includes(d.discoverKind))return D.cards.filter(c=>available(c)&&c.tier<=top&&D.abilityIds[d.discoverKind].includes(c.id));
  if(d.discoverKind==='minion'&&!d.fixedTier)return D.cards.filter(c=>available(c)&&c.tier===top);
  return oldPool(s,d);
 };
 for(const id of ['seekCry','seekLast','seekEnd'])D.byId[id].text='发现一个拥有'+D.discoverLabels[D.byId[id].discoverKind].replace('随从','')+'的随从，最高为当前酒馆星级。';
 D.byId.seekCry.tier=4;D.byId.seekLast.tier=4;
 D.byId.seekRecruit.text='发现一个恰好等于当前酒馆星级的随从。';
 set('night11',{},m=>`入场曲：消耗 3 墓场，发现 ${m} 个谢幕曲随从，最高为当前酒馆星级。`);
 set('royal21',{},m=>`入场曲：发现 ${m} 个皇家随从，最高为当前酒馆星级。`);
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
 set('haven3',{},m=>`每当其他友方守护受到攻击前，使其永久获得「3 + 本随从入场生命÷8」×${m} 攻击，以及两倍该数值的生命（向下取整）。`);
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
 D.rulesVersion='27.3';
}
root.TavernRenewal={apply};if(typeof module!=='undefined')module.exports={apply};
})(typeof globalThis!=='undefined'?globalThis:this);
