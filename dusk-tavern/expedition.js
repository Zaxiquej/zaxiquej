(function(root){
'use strict';
function apply(D,I){
 D.tokens=D.tokens.filter(c=>c.id!=='doubleGrowth');D.byId.doubleGrowth.retired=true;D.retiredSpells.push(D.byId.doubleGrowth);
 const set=(id,fields,rule)=>Object.assign(D.byId[id],fields,{text:rule(1),goldenText:rule(2)});
 set('rune14',{},m=>`备战结束：获得 ${2*m} 张大自然的导引。`);D.byId.rune14.related=[{id:'growth',count:2,scaleCount:true,when:'备战结束加入手牌'}];
 set('rune3',{tier:4,keywords:['shield']},m=>`屏障。备战结束：获得 ${3*m} 张智慧之光。`);D.byId.rune16.tier=5;
 set('forest2',{},m=>`每当你召唤一个妖精，妖精军团永久 +${m}/+${m}。`);
 set('forest16',{},m=>`每当你召唤一个妖精，使相邻随从永久 +${2*m}/+${2*m}。`);
 set('neutral10',{tier:5,attack:6,health:2,keywords:[],effect:'odinRevenge'},()=> '谢幕曲：若被敌方随从攻击而死亡，摧毁该攻击者。');
 const rows=[
 ['forest22','forest',3,3,4,'careerVanguard',m=>`战斗开始：自身获得「本局打出卡牌总数÷3」×${m} 攻击与生命（向下取整，仅本场）。`],
 ['forest23','forest',6,5,7,'careerChorus',m=>`战斗开始：其他友方随从获得「本局打出卡牌总数÷6」×${m} 攻击与生命（向下取整，仅本场）。`],
 ['forest24','forest',5,4,6,'comboReserve',m=>`备战结束：本回合每打出 6 张牌，获得 ${m} 张大自然的导引。`],
 ['dragon22','dragon',2,3,2,'discardWing',m=>`被弃掉时：获得 ${2*m} 张龙之翼击。`],
 ['dragon23','dragon',3,3,5,'discardMarket',m=>`被弃掉时：使本局酒馆永久 +${4*m}/+${4*m}。`],
 ['dragon24','dragon',6,7,9,'pydon',m=>`每当你弃牌，使本局酒馆永久获得「2 + 本局弃牌次数÷3」×${m} 攻击与生命；并使最左侧其他友方随从获得此增益（向下取整）。`],
 ['rune22','rune',2,2,3,'discoverLowSpell',m=>`入场曲：发现 ${m} 张最高 2 星的酒馆法术。`],
 ['rune23','rune',3,3,5,'spellGuard',m=>`每当你对随从施放法术，使目标永久 +${2*m} 生命；若其具有守护，再 +${2*m} 攻击。`],
 ['rune24','rune',6,7,9,'spellUpgradeEnd',m=>`备战结束：将手牌中星级最低的 ${m} 张法术分别变为随机 5～6 星酒馆法术。`],
 ['night22','night',2,2,4,'boneAvenger',m=>`复仇（3）：自身永久 +${5*m}/+${5*m}。`],
 ['night23','night',3,3,4,'rebornSkeleton',m=>`谢幕曲：召唤一个 ${2*m}/${m} 且具有复生的骷髅士兵。`],
 ['night25','night',5,4,7,'entryCannon',m=>`复仇（2）：对一个随机敌方随从造成「本局战斗入场次数」×${m} 的伤害。`],
 ['night24','night',6,6,10,'legionHealth',m=>`每当其他友方死灵在战斗中被召唤、复生或复活，使其获得等同「死灵军势」×${m} 的生命（仅本场）。`],
 ['haven22','haven',3,2,5,'guardNest',m=>`守护。谢幕曲：召唤一个 ${2*m}/${6*m} 的圣骑兵；其谢幕曲召唤圣盾天狮。`,['taunt']],
 ['haven23','haven',5,4,7,'healthToAttack',m=>`入场曲：选择一个友方随从，将其攻击永久提高至至少其生命值的 ${m} 倍。`],
 ['haven24','haven',5,4,10,'guardVitals',m=>`备战结束：使生命最低的友方守护随从永久获得「友方最高生命÷3」×${m} 生命（向下取整）。`],
 ['blood22','blood',2,3,4,'chosenFeast',m=>`入场曲：选择一个商店随从，自伤 2，使随机一名其他友方随从吞噬它，永久获得其 ${m} 倍攻击与生命。`],
 ['blood23','blood',5,4,7,'feastBroker',m=>`每当你吞噬一个商店随从，使本局酒馆永久 +${2*m}/+${2*m}。`],
 ['blood24','blood',6,7,9,'feastBanquet',m=>`每当你吞噬一个商店随从，使其他友方随从永久获得被吞噬者三分之一的攻击与生命 ×${m}（向下取整）。`],
 ['artifact22','artifact',4,3,5,'constructCache',m=>`入场曲与谢幕曲：获得 ${m} 个随机造物衍生随从。战斗中获得的卡牌在战后加入手牌。`],
 ['artifact23','artifact',3,3,5,'constructSpectrum',m=>`每回合首次打出每种不同的造物衍生随从时，武装研习 +${2*m}。`],
 ['artifact24','artifact',6,6,9,'constructUnity',m=>`每当友方造物衍生物在战斗中被召唤，使其与最左侧其他友方随从永久获得「本局打出过的造物衍生物种类 ×（1 + 武装研习÷6）」×${m} 攻击与生命（向下取整）。`],
 ['neutral18','neutral',4,4,6,'miner',m=>`备战结束：采掘 ${m}。每累计采掘 3 点，基础金币上限 +1，下回合起每回合多获得 1 金币。`],
 ['neutral19','neutral',3,1,1,'venomOnce',()=> '剧毒：本场首次造成未被屏障阻挡的攻击或反击伤害时，摧毁目标。'],
 ['neutral20','neutral',4,1,2,'venom',()=> '毁灭：造成未被屏障阻挡的攻击或反击伤害时，摧毁目标。',['destruction']]
 ];
 for(const [id,tribe,tier,attack,health,effect,rule,keywords=[]]of rows){const c={...I.cards[id],id,type:'minion',tribe,tier,cost:3,attack,health,effect,keywords,synergy:true,text:rule(1),goldenText:rule(2)};D.cards.push(c);D.byId[id]=c;}
 for(const [id,attack,health,effect,text]of [['holyGuardian',2,6,'guardWisp','守护。谢幕曲：召唤一个 1/3 且具有守护的圣盾天狮。'],['holyWisp',1,3,'','守护。']]){const c={...I.cards[id],id,type:'minion',token:true,tribe:'haven',tier:1,cost:0,attack,health,effect,keywords:['taunt'],text,goldenText:id==='holyGuardian'?'守护。谢幕曲：召唤一个 2/6 且具有守护的圣盾天狮。':text};D.tokens.push(c);D.byId[id]=c;}
 const mining={...I.cards.mining,id:'mining',type:'spell',tribe:'neutral',tier:3,cost:2,effect:'mining',text:'采掘 3：基础金币上限 +1，下回合起每回合多获得 1 金币。'};D.spells.push(mining);D.byId.mining=mining;
 const protection={...I.cards.bloodImmunity,id:'bloodImmunity',type:'spell',tribe:'blood',tier:2,cost:1,attack:0,health:0,target:false,keywords:[],effect:'bloodImmunity',text:'本回合你的自伤不扣除生命，仍累计自伤并触发自伤效果。持续至备战结束结算完毕。'};D.spells.push(protection);D.byId.bloodImmunity=protection;
 const mine={...I.cards.mine,id:'mine',type:'amulet',tribe:'neutral',tier:3,cost:3,count:2,effect:'mine',text:'倒数 2。采掘 6：基础金币上限 +2，从随后一回合起增加收入。'};D.amulets.push(mine);D.byId.mine=mine;
 D.byId.haven22.related=[{id:'holyGuardian',count:1,attack:2,health:6,scaleStats:true,when:'谢幕曲召唤'}];D.byId.holyGuardian.related=[{id:'holyWisp',count:1,attack:1,health:3,scaleStats:true,when:'谢幕曲召唤'}];
 D.byId.night23.related=[{id:'skeleton',count:1,attack:2,health:1,scaleStats:true,reborn:true,when:'谢幕曲召唤'}];
 D.byId.dragon22.related=[{id:'dragonWing',count:2,scaleCount:true,when:'被弃掉时加入手牌'}];
 D.byId.artifact22.related=D.constructCycle.map(id=>({id,count:1,scaleCount:true,when:'随机获得其中一种'}));
 D.byId.forest24.related=[{id:'growth',count:1,when:'每打出六张牌的备战奖励'}];
 D.byId.rune22.discoverKind='lowSpell';D.byId.rune22.related=[{pool:'functionalDiscover',when:'发现低星法术'}];
 const oldPool=D.discoveryPool;D.discoveryPool=(s,d)=>d.discoverKind==='lowSpell'?D.spells.filter(x=>x.tier<=2&&(x.tribe==='neutral'||(s.activeTribes||D.tribeIds).includes(x.tribe))):oldPool(s,d);
 // Move support pieces away from the overcrowded fourth tier.
 for(const [id,tier,attack,health]of [['forest16',3,3,4],['forest18',5,5,7],['royal19',3,3,4],['royal21',3,3,3],['dragon15',5,5,7],['night9',3,3,5],['night13',3,3,3],['night20',5,5,7],['rune19',3,3,4],['haven15',3,3,4],['blood5',3,3,4],['artifact15',5,5,7]])Object.assign(D.byId[id],{tier,attack,health});
 const pairs={forest14:['forest','rune'],forest21:['forest','dragon'],forest24:['forest','haven'],royal16:['royal','rune'],royal4:['royal','night'],royal22:['royal','artifact'],dragon19:['dragon','blood'],dragon20:['dragon','artifact'],night20:['night','haven'],night22:['night','blood'],haven23:['haven','rune'],blood23:['blood','artifact']};
 for(const [id,tribes]of Object.entries(pairs))Object.assign(D.byId[id],{tribes,poolTribes:tribes});
 D.tribesOf=c=>{const d=typeof c==='string'?D.byId[c]:c?.tribe?c:D.byId[c?.id]||c;return d?.tribes||[d?.tribe].filter(Boolean);};D.isTribe=(c,t)=>D.tribesOf(c).includes(t);D.tribeLabel=c=>D.tribesOf(c).map(t=>D.tribes[t].name).join(' / ');
 const hero=(id,cost,armor,target,power,text)=>Object.assign(D.heroes.find(h=>h.id===id),{cost,armor,target,power,text,related:[]});
 hero('dragon',1,10,false,'龙之远征','本回合下次刷新：最左侧随从替换为高于酒馆 1 星的随机随从（最高 6 星）。');
 hero('aria',1,8,true,'妖精回响','将一个友方衍生随从收回手牌，再获得一张其普通基础复制。需要两个空余手牌位置。');
 hero('roland',1,10,false,'佣兵契约','本回合下次出售随从，获得的金币至少等于其星级。');
 hero('ceres',1,12,false,'冥府寻踪','消耗 3 墓场，发现一个最高不超过酒馆星级的谢幕曲随从。');
 hero('medusa',1,8,false,'蛇宴','选择一个商店随从，自伤 2 并吞噬它，将其攻击与生命赋予最右侧友方随从。');
 hero('windgod',2,14,false,'追猎战利品','从上一位对手的公开阵容中，发现一个不高于酒馆星级的随从普通基础复制。');
 hero('athena',1,8,true,'屏障分流','移除一个友方随从的一层屏障，使其相邻随从各获得一层屏障。');
 hero('olivia',1,6,false,'秘法回收','本回合下一次施放法术后，获得一张该法术的复制。');
 hero('bahamut',1,10,false,'等价重构','选择手牌中的一个非金色随从，将其变为同星级的另一个随机随从，保留附加攻击与生命。');
 D.fanfareIds.push('rune22','haven23','blood22','artifact22');D.lastWordEffects.push('guardNest','guardWisp','rebornSkeleton','constructCache','odinRevenge');D.endRecruitEffects.push('comboReserve','spellUpgradeEnd','guardVitals','miner');
 D.abilityIds.fanfare=[...D.fanfareIds];D.abilityIds.lastWords=D.cards.filter(c=>D.lastWordEffects.includes(c.effect)||c.id==='dragon1').map(c=>c.id);D.abilityIds.endRecruit=D.cards.filter(c=>D.endRecruitEffects.includes(c.effect)).map(c=>c.id);
 D.archetypes.rune.support='远古炼金术师在 4 星提供智慧之光；甜点巫师提供导引，克雷格在 5 星一次补充法术。禁忌研究者发现高星法术，被唤醒的禁忌升级手牌法术，学院新生负责低本发现。';
 D.archetypes.forest.support='召唤妖精同时触发军团与蕾妮的相邻强化；整局出牌数由妖精勇者和香风执行者兑现，双种族卡可衔接其他体系。';
 D.archetypes.dragon.support='弃掉龙族新资源牌可以获得翼击或培育酒馆；6 星培冬按整局弃牌次数同时强化酒馆与友方随从。';
 D.archetypes.haven.support='圣骑兵与天狮组成守护套娃，配合守护受击；生命转攻击与最低生命守护培养互相配合。';
 D.archetypes.artifact.support='随机造物的入场与谢幕提供资源；每种衍生物每回合首次打出推进武装，6 星终端同时利用历史种类与武装研习。';
 for(const [t,r,ids]of [['forest',0,['forest23']],['forest',1,['forest16']],['dragon',1,['dragon24','dragon22','dragon23']],['night',0,['night24']],['night',1,['night22']],['rune',0,['rune24']],['haven',1,['haven22','haven23','haven24']],['blood',0,['blood22','blood23','blood24']],['artifact',1,['artifact22','artifact23','artifact24']]])D.archetypes[t].routes[r][2].push(...ids);
 D.archetypes.night.routes[0][2].push('night25');D.archetypes.night.support+=' 死魂射手以复仇（2）将本局战斗入场次数转化为随机炮击。';
 D.expeditionIds=rows.map(r=>r[0]);D.rulesVersion='23.0';
}
root.TavernExpedition={apply};if(typeof module!=='undefined')module.exports={apply};
})(typeof globalThis!=='undefined'?globalThis:this);
