(function(root){
'use strict';
function apply(D){
 const set=(id,fields,rule)=>Object.assign(D.byId[id],fields,{text:rule(1),goldenText:rule(2)});
 set('blood11',{effect:'selfHarmAura',signature:'恶夜庇护'},()=> '只要本随从在场，你的自伤不扣除生命，仍累计自伤并触发自伤效果。');
 set('dragon7',{},m=>`开战：对 ${2*m} 个不同的随机敌方随从分别造成等同自身攻击的伤害。`);
 Object.assign(D.byId.shield,{tier:6,cost:4,tribe:'royal',poolTribes:['royal'],token:false,retired:false});D.tokens=D.tokens.filter(c=>c.id!=='shield');if(!D.spells.some(c=>c.id==='shield'))D.spells.push(D.byId.shield);
 set('forest21',{},m=>`守护。每当其他友方妖精或龙族随从攻击，自身永久 +${2*m}/+${3*m}。`);
 set('night4',{tier:4,attack:3,health:6},m=>`每当其他友方随从在战斗中成功复生或复活，本局死灵军势永久 +${3*m} 攻击。`);
 set('night20',{tier:3,attack:3,health:4},m=>`每当友方复生或复活，使其他友方随从永久 +${m}/+${2*m}。`);
 set('night8',{attack:2,health:2,reborn:true},m=>`复生。谢幕曲：获得 ${3*m} 墓场。`);
 D.byId.night8.graveYield=3;
 set('night15',{},m=>`开战：使最左侧 ${2*m} 名其他未拥有复生的友方随从获得复生。`);
 set('night24',{},m=>`每当其他友方死灵在战斗中被召唤、复生或复活，使其获得「6 + 死灵军势 × 2」×${m} 生命（仅本场）。`);
 set('night7',{},m=>`其他非衍生友方死亡时，消耗 3 墓场，在其复生与谢幕曲之前，以 ${m} 倍最大生命复活它。每个本体每场限一次。`);
 set('night21',{tier:4,attack:4,health:6,effect:'graveNourish',signature:'噬魂供养'},m=>`备战结束：消耗 4 墓场，使相邻随从永久获得「3 + 本局战斗入场次数÷5」×${m} 攻击与生命（向下取整）。`);
 delete D.byId.night21.activation;delete D.byId.night21.related;
 set('night11',{tier:2,attack:2,health:4,effect:'graveDiscovery',signature:'唤魂'},m=>`入场曲：消耗 3 墓场，发现 ${m} 个不高于酒馆星级的谢幕曲随从。`);
 D.byId.night11.related=[{pool:'graveDiscovery',when:'消耗墓场后发现'}];
 // Low-tier enablers, with once-per-turn activation instead of unrestricted resource loops.
 set('dragon8',{tier:2,attack:2,health:4,effect:'activeDiscard',signature:'铁鳞换血',activation:{cost:0,discard:true}},m=>`启动（0 金币，每回合一次）：弃掉一张手牌，使自身永久 +${3*m}/+${3*m}。`);
 set('dragon12',{tier:3,attack:3,health:4,effect:'destinySupply',signature:'游龙命运'},m=>`备战结束：获得 ${m} 张崭新的命运。`);
 D.byId.dragon12.related=[{id:'newDestiny',count:1,scaleCount:true,when:'备战结束加入手牌'}];
 set('dragon22',{},m=>`出售时：获得 ${m} 张龙之翼击；被弃掉时改为获得 ${2*m} 张。`);
 D.byId.dragon22.related=[{id:'dragonWing',count:1,scaleCount:true,when:'出售获得；被弃掉时数量翻倍'}];
 set('dragon23',{},m=>`出售时：使本局酒馆永久 +${2*m}/+${2*m}；被弃掉时效果翻倍。`);
 set('dragon24',{effect:'pydon',signature:'龙王领地'},m=>`备战结束：使本局酒馆永久 +${4*m}/+${4*m}，再使相邻随从分别永久获得「当前酒馆的攻击与生命加成」×${m}。`);
 set('royal23',{tier:2,attack:2,health:3},m=>`每当其他友方随从获得属性强化，自身永久 +${m} 生命。联动强化不再次触发此类效果。`);
 set('rune21',{tier:3},m=>`备战结束：若本回合施放过至少 3 个法术，获得 ${2*m} 张随机 3～5 星酒馆法术。`);
 D.byId.rune21.related=[{pool:'spell',minTier:3,maxTier:5,when:'满足施法条件时获得两张'}];
 D.byId.rune23.retired=true;D.retiredCards=[D.byId.rune23];D.cards=D.cards.filter(c=>c.id!=='rune23');D.expeditionIds=D.expeditionIds.filter(id=>id!=='rune23');
 // Add one small consumer, and give the high-tier feast engine its own supply consumption.
 set('blood21',{tier:5,attack:4,health:7,effect:'batRebirth',signature:'不息血脉'},m=>`战斗开始时及你在战斗中召唤新的丛林蝙蝠时，使其额外获得 ${m} 次复生。`);
 set('blood5',{tier:3,attack:2,health:3,effect:'smallFeast',signature:'试餐'},m=>`备战结束：自伤 1，吞噬攻击最高的商店随从，自身永久获得其一半攻击与生命 ×${m}（向上取整）。`);
 set('blood24',{tier:6,attack:7,health:9,effect:'feastBanquet',signature:'暴食盛宴'},m=>`备战结束：依次吞噬攻击最高的两个商店随从，自身永久获得其 ${m} 倍攻击与生命。`);
 set('artifact19',{tier:2,attack:2,health:4,effect:'relicSalvage',signature:'遗迹回收',keywords:['taunt']},m=>`守护。谢幕曲：残骸永久 +${2*m}，武装研习永久 +${m}。`);
 const pairs={forest24:['forest','rune'],blood23:['blood','dragon']};
 for(const id of ['royal22','dragon19']){delete D.byId[id].tribes;delete D.byId[id].poolTribes;}
 for(const [id,tribes]of Object.entries(pairs))Object.assign(D.byId[id],{tribes,poolTribes:tribes});
 D.fanfareIds=D.fanfareIds.filter(id=>D.byId[id]&&!D.byId[id].retired);
 D.lastWordEffects.push('relicSalvage');D.endRecruitEffects.push('graveNourish','destinySupply','pydon','smallFeast','feastBanquet');
 D.abilityIds.fanfare=[...D.fanfareIds];D.abilityIds.lastWords=D.cards.filter(c=>D.lastWordEffects.includes(c.effect)).map(c=>c.id);D.abilityIds.endRecruit=D.cards.filter(c=>D.endRecruitEffects.includes(c.effect)).map(c=>c.id);
 const oldPool=D.discoveryPool;D.discoveryPool=(s,d)=>d.discoverKind==='graveDiscovery'?D.cards.filter(c=>c.tier<=s.tier&&D.abilityIds.lastWords.includes(c.id)&&(c.tribe==='neutral'||D.tribesOf(c).some(t=>(s.activeTribes||D.tribeIds).includes(t)))):oldPool(s,d);
 D.byId.night11.discoverKind='graveDiscovery';
 for(const a of Object.values(D.archetypes))for(const route of a.routes)route[2]=route[2].filter(id=>!D.byId[id].retired);
 D.archetypes.dragon.routes[1][2]=[...new Set([...D.archetypes.dragon.routes[1][2].filter(id=>id!=='dragon24'),'dragon8','dragon12'])];
 D.archetypes.dragon.routes[0][2].push('dragon24');
 D.archetypes.dragon.support='铁鳞龙人低本指定弃牌，游龙少女提供崭新的命运；龙少女与玛利翁出售获得奖励，弃掉则双倍；半龙人魔法师入场获得龙之翼击。培冬持续放大酒馆成长并培养相邻随从。';
 D.archetypes.night.routes[1][2].push('night11','night21','night20');
 D.archetypes.night.support='命忒与骸骨的代言者分别强化复生军势与队伍；安德雷斐斯自带复生。灵魂指挥者消耗少量墓场发现谢幕曲，食魂者持续消耗墓场培养相邻随从，奈芙蒂斯固定消耗 3 墓场优先复活本体。';
 D.archetypes.blood.routes[0][2].push('blood5');
 D.archetypes.blood.routes[0][2]=D.archetypes.blood.routes[0][2].filter(id=>id!=='blood21');D.archetypes.blood.routes[1][2].push('blood21');D.archetypes.blood.support+=' 血脉之王为蝙蝠增加复生次数，配合女王死亡炮击、瓦妮亚死亡养成和斑比复仇召唤。';
 D.rulesVersion='24.0';
}
root.TavernReforged={apply};if(typeof module!=='undefined')module.exports={apply};
})(typeof globalThis!=='undefined'?globalThis:this);
