(function(root){
'use strict';
function apply(D,I){
 const rows={
 forest:[
 [1,1,2,'fairyGift',m=>`入场曲：获得 ${m} 张妖精。`],
 [2,2,4,'forestTrade',m=>`出售时，获得 ${2*m} 张大自然的导引。`],
 [3,3,5,'comboStudy',m=>`每打出第 3 张牌，使本局法术研习 +${m}。`],
 [3,4,4,'fairyEnd',m=>`备战结束：获得 ${2*m} 张妖精。`],
 [4,4,7,'fairyRally',m=>`每当你打出妖精，使其他友方妖精族永久 +${2*m}/+${3*m}。`],
 [4,5,6,'fairyMemorial',m=>`每当友方妖精衍生物死亡，使友方妖精族永久 +${3*m}/+${m}。`],
 [5,6,8,'comboHarvest',m=>`备战结束：本回合每打出一张牌，自身永久 +${2*m}/+${2*m}。`],
 [6,9,10,'fairyCrown',m=>`谢幕曲：召唤两个妖精，各继承本随从 ${m} 倍攻击和一半最大生命（向下取整）。`]],
 royal:[
 [1,2,1,'knightGift',m=>`入场曲：获得 ${m} 张骑士。`],
 [2,2,4,'guardCry',m=>`入场曲：相邻友方永久获得 +${4*m} 生命。`],
 [3,4,5,'shieldSupply',m=>`备战结束：获得 ${m} 张守护之力（给予一个友方屏障）。`],
 [3,3,6,'cryChampion',m=>`每当其他友方触发入场曲，自身永久 +${3*m}/+${3*m}。`],
 [4,4,8,'shieldRelay',m=>`复仇（2）：随机使 ${m} 个没有屏障的其他友方皇家获得屏障。`],
 [4,5,6,'royalStudy',m=>`入场曲：本局法术研习 +${2*m}。`],
 [5,6,9,'shieldMarshal',m=>`备战结束：每有一个友方拥有屏障，全体友方皇家永久 +${2*m}/+${2*m}。`],
 [6,7,10,'cryAcademy',m=>`每当其他友方触发入场曲，本局法术研习 +${2*m}。`]],
 dragon:[
 [1,1,2,'tierCry',m=>`入场曲：永久获得「酒馆星级 × ${m}」攻击与生命。`],
 [2,3,4,'dragonSupply',m=>`备战结束：若酒馆达到 4 星，获得 ${m} 张龙之启示。`],
 [3,3,7,'tierFury',m=>`每次受到伤害并存活，永久获得「酒馆星级 × ${2*m}」攻击与生命。`],
 [3,4,5,'dragonDiscount',m=>`入场曲：酒馆升级优惠 +${2*m}。`],
 [4,4,8,'dragonStudy',m=>`备战结束：本局法术研习增加「酒馆星级÷2」× ${m}（向下取整）。`],
 [4,6,7,'dragonDrill',m=>`每次攻击后若存活，相邻友方龙族永久获得「酒馆星级 + 本随从攻击÷10」× ${m} 攻击与生命（向下取整）。`],
 [5,7,10,'dragonBrood',m=>`备战结束：其他友方龙族永久获得「酒馆星级 + 本随从攻击÷5」× ${m} 攻击与生命（向下取整）。`],
 [6,8,12,'dragonVitality',m=>`每当友方龙族受到伤害并存活，使其永久获得「酒馆星级 + 其入场时生命÷10」× ${m} 攻击，以及两倍该数值的生命（向下取整）。`]],
 night:[
 [1,2,1,'skeletonGift',m=>`入场曲：获得 ${m} 张骷髅士兵。`],
 [2,2,5,'graveEnd',m=>`备战结束：获得 ${4*m} 墓场。`],
 [3,3,6,'deathStudy',m=>`复仇（2）：本局法术研习 +${2*m}。`],
 [3,4,5,'graveSupply',m=>`入场曲：消耗 3 墓场，获得 ${2*m} 张灵魂转移。`],
 [4,4,8,'graveStudy',m=>`备战结束：消耗 6 墓场，本局法术研习 +${4*m}。`],
 [4,5,6,'graveLegacy',m=>`谢幕曲：全体友方死灵永久获得「2 + 墓场÷5」× ${m} 攻击与生命（向下取整）。`],
 [5,6,9,'graveLord',m=>`备战结束：消耗 6 墓场，全体友方死灵永久获得「3 + 剩余墓场÷5」× ${m} 攻击与生命（向下取整）。`],
 [6,8,10,'graveArmy',m=>`谢幕曲：召唤两个骷髅士兵，各获得「本随从一半攻击 / 最大生命 + 当前墓场」× ${m} 的身材（向下取整）。`]],
 rune:[
 [4,4,6,'spellTrade',m=>`每当你出售另一个随从，获得 ${m} 张智慧之光。`],
 [2,2,4,'studyCry',m=>`入场曲：本局法术研习 +${m}。`],
 [3,3,5,'thirdStudy',m=>`在场时每施放 3 个法术，本局法术研习 +${2*m}；进度跨回合保留。`],
 [3,4,4,'growthSupply',m=>`备战结束：获得 ${2*m} 张大自然的导引。`],
 [4,4,7,'studyEcho',m=>`每当你施放法术，相邻友方永久获得等同「法术研习 × ${m}」的攻击与生命。`],
 [4,5,6,'manaBundle',m=>`入场曲：获得 ${3*m} 张智慧之光。`],
 [5,6,8,'studyEnd',m=>`备战结束：本局法术研习 +${3*m}。`],
 [6,7,10,'studyRally',m=>`在场时每施放 3 个法术，全体友方永久获得「法术研习 × ${m}」攻击与生命；进度跨回合保留。`]],
 haven:[
 [1,1,2,'bellGift',m=>`入场曲：获得 ${m} 张咏唱：神圣祈愿。`],
 [2,2,5,'prayerNurse',m=>`每当你放置护符，使其他友方主教永久获得 +${2*m} 生命。`],
 [3,3,6,'prayerStudy',m=>`每当己方护符倒数归零，本局护符培育 +${2*m}。`],
 [3,3,5,'clockSupply',m=>`备战结束：获得 ${m} 张崇高的教义。`],
 [4,4,7,'prayerCry',m=>`入场曲：本局护符培育 +${3*m}。`],
 [4,4,9,'prayerGiant',m=>`备战结束：自身永久获得「护符共鸣 × ${2*m}」攻击与生命。`],
 [5,6,10,'prayerChoir',m=>`每当己方护符倒数归零，全体友方主教永久获得「2 + 护符共鸣」× ${m} 攻击与生命。`],
 [6,7,12,'prayerEcho',m=>`己方护符倒数归零时，额外结算 ${m} 次该护符效果（不重复触发倒数归零）。`]],
 blood:[
 [1,2,2,'pactGift',m=>`入场曲：获得 ${m} 张鲜血的吻唇。生成的法术不支付购买自伤。`],
 [2,2,5,'bloodBud',m=>`每次招募自伤成功后，自身永久 +${m}/+${2*m}。`],
 [3,3,6,'pactEnd',m=>`备战结束：自伤 1，成功后获得 ${m} 张鲜血的吻唇。`],
 [3,3,5,'bloodStudy',m=>`每次招募自伤成功后，本局法术研习 +${m}。`],
 [4,4,8,'batSupply',m=>`备战结束：获得 ${2*m} 张丛林蝙蝠。`],
 [4,5,7,'batMemorial',m=>`每当友方蝙蝠死亡，全体友方吸血鬼永久 +${3*m}/+${2*m}。`],
 [5,6,10,'bloodVein',m=>`每次招募自伤成功后，全体友方吸血鬼永久获得「2 + 累计自伤÷5」× ${m} 生命（向下取整）。`],
 [6,9,10,'batCrown',m=>`谢幕曲：召唤三个蝙蝠，各继承本随从一半攻击与最大生命 × ${m}（向下取整）。`]],
 artifact:[
 [1,1,2,'analyzerGift',m=>`入场曲：获得 ${m} 张解析的创造物。`],
 [2,2,4,'moduleBundle',m=>`入场曲：获得 ${2*m} 张机械的解放。`],
 [3,3,6,'moduleStudy',m=>`每当你施放武装，武装研习额外 +${2*m}。`],
 [3,3,7,'scrapVeteran',m=>`每当其他友方造物死亡，自身永久获得「2 + 残骸÷5」× ${m} 攻击与生命（向下取整）。`],
 [4,4,8,'forgeEnd',m=>`备战结束：武装研习 +${6*m}。`],
 [4,5,6,'scrapCry',m=>`入场曲：获得 ${6*m} 残骸。`],
 [5,6,9,'moduleRally',m=>`每当你施放武装，使其他友方造物永久获得「2 + 残骸÷3」× ${m} 攻击与生命（向下取整）。`],
 [6,8,12,'scrapCrown',m=>`谢幕曲：召唤两个古老的创造物，各获得「本随从一半攻击 / 最大生命 + 当前残骸」× ${m} 的身材（向下取整）。`]]
 };
 const entries=new Set(['fairyGift','knightGift','guardCry','royalStudy','tierCry','dragonDiscount','skeletonGift','graveSupply','spellGift','studyCry','manaBundle','bellGift','prayerCry','pactGift','analyzerGift','moduleBundle','scrapCry']);
 for(const [tribe,rs] of Object.entries(rows))rs.forEach((r,i)=>{
  const id=tribe+(i+(['forest','blood'].includes(tribe)?12:11));
  if(!I.cards[id])throw Error('Missing verified identity '+id);
  const c={id,type:'minion',tribe,tier:r[0],attack:r[1],health:r[2],effect:r[3],text:r[4](1),goldenText:r[4](2),keywords:[],cost:3,synergy:true,...I.cards[id]};
  D.cards.push(c);D.byId[id]=c;if(entries.has(c.effect))D.fanfareIds.push(id);
 });
 const related={fairyGift:['fairy',1],fairyEnd:['fairy',2],forestTrade:['growth',2],knightGift:['knight',1],shieldSupply:['shield',1],dragonSupply:['dragon',1],skeletonGift:['skeleton',1],graveSupply:['bones',2],spellTrade:['mana',1],growthSupply:['growth',2],manaBundle:['mana',3],bellGift:['bell',1],clockSupply:['clock',1],pactGift:['bloodPact',1],pactEnd:['bloodPact',1],batSupply:['bat',2],analyzerGift:['analyzer',1],moduleBundle:['module',2]};
 for(const c of D.cards.filter(c=>c.synergy)){const r=related[c.effect];if(r)c.related=[{id:r[0],count:r[1],scaleCount:true,when:c.effect==='spellTrade'?'每出售另一个随从时加入手牌':c.effect==='forestTrade'?'出售时加入手牌':D.fanfareIds.includes(c.id)?'入场曲加入手牌':'备战结束加入手牌'}];}
 D.byId.rune11.signature='魔法交换';
 for(const [id,token,count] of [['forest19','fairy',2],['night18','skeleton',2],['blood19','bat',3],['artifact18','ancientArtifact',2]])D.byId[id].related=[{id:token,count,inherit:true,when:'谢幕曲召唤'}];
 Object.assign(D.byId.royal0,{attack:2,health:2,text:'屏障。失去屏障时，永久获得 +1/+1。',goldenText:'屏障。失去屏障时，永久获得 +2/+2。'});
 D.byId.shield.poolTribes=['royal','haven'];
 for(const [tribe,extra] of Object.entries({forest:'妖精交易、连击研习与谢幕军团均可独立构筑。',royal:'屏障军团与入场曲研习，分别养成随从与法术。',dragon:'受伤成长与高星养成；升级、施法和攻击都能提供永久收益。',night:'墓场转化与谢幕军团；墓场也能投入法术研习。',rune:'施法军团与法术研习；研习永久提高后续法术的属性效果。',haven:'护符培育与传承军团；培育提高共鸣，额外结算扩大护符收益。',blood:'自伤研习与蝙蝠军团；自伤提供成长，蝙蝠死亡养成全队。',artifact:'武装研习与残骸重构；施法、死亡和备战结束均可积累成长。'}))D.archetypes[tribe].support=extra;
 const routes={forest:[['forest14','forest16','forest18'],['forest17','forest19','forest15']],royal:[['royal15','royal17'],['royal14','royal16','royal18']],dragon:[['dragon13','dragon16','dragon18'],['dragon12','dragon15','dragon17']],night:[['night13','night16','night18'],['night12','night15','night17']],rune:[['rune13','rune15','rune18'],['rune12','rune16','rune17']],haven:[['haven13','haven17','haven18'],['haven15','haven16','haven14']],blood:[['blood14','blood15','blood18'],['blood16','blood17','blood19']],artifact:[['artifact12','artifact13','artifact17'],['artifact14','artifact16','artifact18']]};
 for(const [tribe,rs] of Object.entries(routes))rs.forEach((ids,i)=>D.archetypes[tribe].routes[i][2].push(...ids));
 D.archetypes.royal.routes[0][1]='勇战的旗手提供贴盾法术，白银圣骑士通过复仇补盾；艾蜜莉亚把反复破盾转成皇家军团的永久成长。';
 D.archetypes.royal.routes[0][2].push('royal13');
 D.archetypes.rune.support='企鹅提供入场与出售的即时法术，萨米留场把随从交易转为法术；远古炼金术师供给更多施法次数，甜点巫师供给双属性强化。';
 D.rulesVersion='7.1';return D;
}
root.TavernSynergies={apply};if(typeof module!=='undefined')module.exports={apply};
})(typeof globalThis!=='undefined'?globalThis:this);
