(function(root){
'use strict';
function apply(D,I){
 const set=(id,fields,rule)=>Object.assign(D.byId[id],fields,{text:rule(1),goldenText:rule(2)});
 set('forest8',{effect:'fairySummon'},m=>`入场曲：召唤 ${2*m} 个 1/1 的妖精。`);
 D.byId.forest8.related=[{id:'fairy',count:2,scaleCount:true,when:'入场曲召唤到战场'}];
 set('royal2',{initialShields:3},m=>`守护。屏障 ×${3*m}。自身可以具有多层屏障。`);
 set('royal13',{tier:5,attack:5,health:7,effect:'shieldSupply'},m=>`备战结束：获得 ${m} 张守护之力。`);
 D.byId.royal13.related=[{id:'shield',count:1,scaleCount:true,when:'备战结束加入手牌'}];
 Object.assign(D.byId.shield,{token:true,retired:false,cost:0,effect:'shield',target:true,attack:0,health:0,text:'使一个友方随从获得 1 层屏障。',signature:'屏障'});
 D.functionalSpellIds.push('shield');D.rulesVersion='22.0';
 D.spells=D.spells.filter(c=>c.id!=='shield');D.retiredSpells=(D.retiredSpells||[]).filter(c=>c.id!=='shield');if(!D.tokens.some(c=>c.id==='shield'))D.tokens.push(D.byId.shield);
 set('royal18',{},m=>`备战结束：使所有友方随从永久获得「4 + 本局强化次数÷10」× ${m} 攻击与生命（向下取整，触发时统一计算）。`);
 const rows=[
 ['forest21','forest',4,3,8,'fairyGuardian',m=>`守护。每当友方妖精衍生物攻击，自身永久 +${2*m}/+${3*m}。`,['taunt']],
 ['royal22','royal',6,8,10,'shieldAura',()=> '屏障。只要本随从在场，所有友方随从都可以具有多层屏障。',['shield']],
 ['royal23','royal',3,3,5,'buffWitness',m=>`每当其他友方随从获得属性强化，自身永久 +${m} 生命。联动强化不再次触发此类效果。`],
 ['royal24','royal',5,4,7,'buffConductor',m=>`每当自身获得属性强化，使所有其他友方随从永久 +${m}/+${m}。联动强化不再次触发此类效果。`],
 ['rune21','rune',3,3,5,'spellReserve',m=>`备战结束：若本回合施放过至少 3 个法术，获得 ${m} 张最高 3 星的随机酒馆法术。`],
 ['night19','night',2,2,4,'graveKeeper',m=>`每当其他友方随从死亡，额外获得 ${m} 墓场。`],
 ['night20','night',4,4,5,'rebornChoir',m=>`每当友方复生或复活，使其他友方随从永久 +${m}/+${2*m}。`],
 ['night21','night',5,5,7,'graveWorkshop',m=>`启动（1 金币，消耗 6 墓场，每回合一次）：获得 ${2*m} 张骷髅士兵。`],
 ['haven19','haven',2,2,5,'healthGift',m=>`守护。入场曲：使生命最低的其他友方随从永久 +${6*m} 生命。`,['taunt']],
 ['haven20','haven',4,3,7,'prayerStrike',m=>`每当护符倒数归零，使生命最高的友方随从永久获得「其生命值÷4」× ${m} 攻击（向下取整）。`],
 ['haven21','haven',6,6,12,'guardRetribution',m=>`守护。每当友方守护随从受到攻击，对攻击者造成「本随从生命值÷5」× ${m} 伤害（向下取整，至少 1）。`,['taunt']],
 ['blood20','blood',2,1,5,'bloodShelter',m=>`守护。入场曲：自伤 1，使其他友方随从永久 +${2*m} 生命。`,['taunt']],
 ['blood21','blood',5,5,6,'bloodFocus',m=>`每次招募自伤成功后，使攻击最低的友方随从永久获得「2 + 累计自伤÷5」× ${m} 攻击，以及该数值两倍的生命（向下取整）。`],
 ['artifact20','artifact',3,3,5,'tokenForge',m=>`谢幕曲：使所有友方衍生随从获得「2 + 残骸÷3」× ${m} 攻击与生命（向下取整，仅本场）。`],
 ['artifact21','artifact',5,5,8,'scrapArmament',m=>`每当你施放武装，自身永久获得「1 + 本局残骸」× ${m} 攻击与生命。`]
 ];
 for(const [id,tribe,tier,attack,health,effect,rule,keywords=[]]of rows){const c={...I.cards[id],id,type:'minion',tribe,tier,cost:3,attack,health,effect,keywords,synergy:true,text:rule(1),goldenText:rule(2)};D.cards.push(c);D.byId[id]=c;}
 D.byId.night21.activation={cost:1,grave:6};D.byId.night21.related=[{id:'skeleton',count:2,scaleCount:true,when:'启动时加入手牌'}];
 D.byId.rune21.related=[{pool:'spell',maxTier:3,when:'满足施法条件时加入手牌'}];
 D.fanfareIds.push('haven19','blood20');D.endRecruitEffects.push('shieldSupply','spellReserve');D.lastWordEffects.push('tokenForge');
 D.abilityIds.fanfare=[...D.fanfareIds];D.abilityIds.endRecruit=D.cards.filter(c=>D.endRecruitEffects.includes(c.effect)).map(c=>c.id);D.abilityIds.lastWords=D.cards.filter(c=>D.lastWordEffects.includes(c.effect)||c.id==='dragon1').map(c=>c.id);
 D.archetypes.royal.support='守护骑士自带三层屏障；光耀导引在场时，其他种族也可叠盾。勇战的旗手提供屏障法术。不屈的士兵与格尔德推进强化次数，联动强化不重复触发此类效果。';
 D.archetypes.royal.routes[0][2].push('royal13','royal22');D.archetypes.royal.routes[1][2].push('royal23','royal24');
 D.reinforcementIds=rows.map(r=>r[0]);
}
root.TavernReinforcements={apply};if(typeof module!=='undefined')module.exports={apply};
})(typeof globalThis!=='undefined'?globalThis:this);
