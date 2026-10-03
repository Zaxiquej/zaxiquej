(function(root){
'use strict';
function apply(D,I){
 const rows={
 forest:[
 [2,3,4,'tokenDance','妖精舞步',m=>`每当你打出衍生随从，使相邻友方永久 +${2*m}/+${2*m}。`],
 [4,5,7,'ancientCombo','远古连携',m=>`守护。入场曲：本回合每已打出一张牌，自身永久 +${3*m}/+${3*m}。`,'taunt'],
 [6,8,10,'fairyMentor','风之引导',m=>`战斗中，每当你召唤妖精衍生物，使其获得等同本随从一半攻击 × ${m} 的攻击与生命（向下取整）。`]],
 royal:[
 [2,4,3,'cavalryCry','骑兵号令',m=>`入场曲：相邻友方永久获得 +${4*m} 攻击。`],
 [4,4,10,'durandal','不灭之盾',m=>`守护。开战：相邻友方获得等同自身一半最大生命 × ${m} 的生命（向下取整）。`,'taunt'],
 [6,8,9,'rallyCry','骑士圆桌',m=>`每当其他友方触发入场曲，全体友方皇家永久 +${3*m}/+${3*m}。`]],
 dragon:[
 [2,3,5,'dragonMend','水龙祈愿',m=>`备战结束：若酒馆达到 4 星，为英雄恢复 ${4*m} 生命。`],
 [4,7,6,'dragonRaid','漆黑突袭',m=>`连击。每次攻击后若存活，永久获得「酒馆星级 × ${m}」攻击。`],
 [6,10,12,'dragonLegacy','天穹遗产',m=>`谢幕曲：使最左侧的友方龙族获得本随从攻击与最大生命的 ${m} 倍（仅本场）。`]],
 night:[
 [2,3,4,'graveLast','死者的书页',m=>`谢幕曲：获得 ${6*m} 墓场。`],
 [4,5,8,'graveFeast','永夜茶会',m=>`备战结束：消耗 3 墓场，使全体友方死灵永久 +${4*m}/+${4*m}。`],
 [6,9,12,'reborn','不死决斗',m=>`复生：首次死亡后，以${m===1?'完整':'两倍'}最大生命复活。`]],
 rune:[
 [2,2,5,'owlStudy','魔法授业',m=>`每当你施放法术，使攻击最低的其他友方永久 +${3*m}/+${m}。`],
 [4,5,6,'spellBundle','异界书页',m=>`入场曲：获得 ${2*m} 张随机法术（不高于酒馆星级，遵循本局牌池）。`],
 [6,7,10,'dimensionBoost','次元增幅',m=>`每当你施放有目标的法术，目标额外永久获得「1 + 本局施法数÷3」× ${m} 攻击与生命（向下取整，计入本次施法）。`]],
 haven:[
 [2,2,5,'blessingSupply','治愈祈祷',m=>`备战结束：获得 ${m} 张「${D.byId.bless.name}」。`],
 [4,6,7,'reborn','雪白新生',m=>'屏障。复生：首次死亡后以 1 生命复活。','shield'],
 [6,7,14,'prayerBastion','神盾祝祷',m=>`每当己方护符倒数归零，使生命最高的友方永久 +${6*m}/+${12*m}。`]],
 blood:[
 [2,3,4,'batNest','贵公子的眷属',m=>`谢幕曲：召唤两个 ${3*m}/${3*m} 丛林蝙蝠。`],
 [4,5,8,'bloodChorus','绯红合唱',m=>`每次招募自伤成功后，全体友方吸血鬼永久获得 +${3*m} 攻击。`],
 [6,10,10,'petrify','毒牙凝视',m=>`开战：使攻击最高的敌方失去等同本随从攻击 × ${m} 的攻击（最低降至 0）。`]],
 artifact:[
 [2,3,4,'salvageGift','遗物回收',m=>`入场曲：获得 ${3*m} 残骸。`],
 [4,6,7,'scrapBlade','遗物之刃',m=>`连击。开战：获得「本局残骸 × ${3*m}」攻击。`],
 [6,7,12,'forgeLegacy','创造循环',m=>`每当其他友方造物死亡，武装研习进度永久 +${3*m}（每 3 点使武装品质 +1/+1）。`]]
 };
 for(const [tribe,rs] of Object.entries(rows))rs.forEach((r,i)=>{const id=tribe+(i+8),c={id,type:'minion',tribe,tier:r[0],attack:r[1],health:r[2],effect:r[3],signature:r[4],text:r[5](1).replace(/ × 1/g,''),goldenText:r[5](2),keywords:(r[6]||'').split(' ').filter(Boolean),cost:3,...I.cards[id]};D.cards.push(c);D.byId[id]=c;});
 D.fanfareIds.push('forest9','royal8','rune9','artifact8');
 for(const [id,tribe,effect,signature,rule] of [
 ['forest11','forest','spendFairy','森林的回响',m=>`在场时每花费 5 金币，获得 ${2*m} 张妖精；进度跨回合保留。`],
 ['blood11','blood','bloodMend','血色回甘',m=>`每次招募自伤成功后，为你的英雄恢复 ${m} 生命。`]
 ]){const c={id,type:'minion',tribe,tier:3,attack:3,health:5,effect,signature,text:rule(1),goldenText:rule(2),keywords:[],cost:3,...I.cards[id]};D.cards.push(c);D.byId[id]=c;}
 D.byId.forest11.related=[{id:'fairy',count:2,scaleCount:true,when:'每花费 5 金币加入手牌'}];
 Object.assign(D.byId.forest8,{effect:'fairySupply',text:'入场曲：获得两张妖精。每当你打出衍生随从，使相邻友方永久 +2/+2。',goldenText:'入场曲：获得四张妖精。每当你打出衍生随从，使相邻友方永久 +4/+4。',related:[{id:'fairy',count:2,scaleCount:true,when:'入场曲加入手牌'}]});
 D.fanfareIds.push('forest8');
 D.byId.blood8.related=[{id:'bat',count:2,attack:3,health:3,scale:true,when:'谢幕曲召唤'}];
 D.byId.rune9.related=[{pool:'spell',when:'随机法术遵循本局牌池与当前酒馆星级'}];
 D.byId.haven8.related=[{id:'bless',count:1,scaleCount:true,when:'备战结束加入手牌'}];
 for(const h of D.heroes)h.tribe=h.id;
 const heroes=[
 ['aria','forest','风之军团',1,false,'妖精军团永久 +2/+2，强化本局所有战斗中的妖精衍生物。'],
 ['roland','royal','杜兰达尔',1,true,'使一个友方永久获得「酒馆星级 × 2」生命。'],
 ['forte','dragon','黑龙骑袭',1,true,'使一个友方永久获得「酒馆星级 × 2」攻击。'],
 ['ceres','night','永夜邀约',1,true,'消耗 3 墓场，使一个友方永久 +4/+4，并为英雄恢复 3 生命。'],
 ['dorothy','rune','次元书页',1,false,`获得两张「${D.byId.mana.name}」。`],
 ['snow','haven','纯白祝福',1,true,'使一个友方永久获得「2 + 当前护符共鸣」攻击与生命。'],
 ['medusa','blood','血蛇之吻',1,true,'自伤 2（最低降至 1 生命），成功后使一个友方永久获得等同本局累计自伤的攻击。'],
 ['deus','artifact','机械降神',1,false,'武装研习进度永久 +3，使本局后续武装的品质 +1/+1。']
 ];
 for(const [id,tribe,power,cost,target,text] of heroes)D.heroes.push({...I.heroes[id],id,tribe,power,cost,target,text,subtitle:text});
 D.heroes.find(h=>h.id==='dorothy').related=[{id:'mana',count:2,when:'主动技能加入手牌'}];
 // Guard is a positioning decision. Automatic effects never paint the whole board.
 const b=D.byId;
 D.legacyTrinkets=D.trinkets;D.trinkets=[];
 Object.assign(b.rich,{cost:1,tier:2,effect:'deferGold',text:'使你在下回合开始时额外获得 2 金币。'});
 Object.assign(b.bloodPact,{purchaseSelfHarm:1,text:'购买时自伤 1（最低降至 1 生命）。施放：使一个友方永久 +3/+3；不再自伤。'});
 // Retain definitions for already-owned cards in legacy saves, never offer them again.
 D.retiredSpells=D.spells.filter(c=>['evo','team'].includes(c.id));
 for(const c of D.retiredSpells){c.retired=true;c.text+=' 旧版法术，已退出新牌池。';}
 D.spells=D.spells.filter(c=>!c.retired);
 b.haven3.text='每当己方护符倒数归零，使最左侧友方永久 +4/+6。';b.haven3.goldenText='每当己方护符倒数归零，使最左侧友方永久 +8/+12。';
 b.temple.text='倒数 3：所有友方永久 +3/+5。共鸣。';
 b.haven6.text=b.haven6.text.replace('，并给予守护','');b.haven6.goldenText=b.haven6.goldenText.replace('，并给予守护','');
 b.rune5.text='每当你施放有目标的法术，将其属性强化额外施加给目标的相邻友方（不复制关键词）。';b.rune5.goldenText='每当你施放有目标的法术，将其属性强化额外施加给目标的相邻友方两次（不复制关键词）。';
 D.archetypes.haven.support='圣之光棱牧师集中养成最左侧前排；天狐将过量治疗转换为全队生命。守护由原生随从与单体法术提供。';
 const support={forest:'舞蹈家奖励衍生物交易；远古精灵承接连携爆发，阿丽雅养大新召唤的妖精。',royal:'铁骑兵强化相邻攻击；罗兰保护相邻随从，亚瑟把每次入场曲转成军团成长。',dragon:'水龙神巫女提供续航；法露特靠攻击永久成长，天穹龙神传递巨兽身材。',night:'安德雷斐斯补充墓场；赛蕾丝消耗墓场养成军团，莫迪凯提供完整身材复生。',rune:'猫头鹰补齐低攻击位；奥兹提供施法燃料，桃乐丝将整局施法数转成单体强化。',haven:'兔耳治愈师提供法术；白雪公主以屏障和复生承接传承，布罗蒂雅集中养成最高生命主力。',blood:'拜特补充蝙蝠；玛丽扩大自伤攻击收益，美杜莎以自身攻击削弱敌方主力。',artifact:'米莉亚姆提前积累残骸；纱妃拉以残骸强化连击，机械降神把死亡转为武装研习。'};
 for(const [tribe,text] of Object.entries(support))D.archetypes[tribe].support+=' '+text;
 D.archetypes.forest.support+=' 妖精舞蹈家的入场曲与柏尔嘉的消费返牌，支持大连击。';
 D.archetypes.blood.support+=' 恶夜魔羊在自伤成功后回血；血契法术购买时支付生命，施放时只强化。';
 D.rulesVersion='6.1';return D;
}
root.TavernDiversity={apply};if(typeof module!=='undefined')module.exports={apply};
})(typeof globalThis!=='undefined'?globalThis:this);
