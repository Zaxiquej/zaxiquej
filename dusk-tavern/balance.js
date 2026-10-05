(function(root){
'use strict';
// 5.0: one focused engine or two closely connected effects per minion.
function apply(D){const b=D.byId,rules={
 forest0:m=>`谢幕曲：召唤一个 ${m}/${m} 妖精。出售时：获得 ${m} 张妖精。`,
 forest1:m=>`连击。连携：永久获得「4 + 妖精军团÷2」× ${m} 的攻击与生命（向下取整）。`,
 forest2:m=>`入场曲：获得 ${m} 张「大自然的导引」。每打出一个衍生随从，获得 ${m} 金币。`,
 forest3:m=>`顺劈。开战：本回合每打出一张牌，获得「1 + 妖精军团」× ${m} 的攻击。`,
 forest4:m=>`连携：妖精军团永久 +${2*m}/+${2*m}，其他妖精族随从永久获得「2 + 更新后军团÷4」× ${m} 的攻击与生命（向下取整）。`,
 forest5:m=>`谢幕曲：召唤两个妖精，各为 ${3*m}/${3*m}，并额外继承本体一半攻击与最大生命（向下取整）。`,
 forest6:m=>`战斗中每召唤一个友方妖精族随从，妖精军团永久 +${2*m}/+${2*m}。`,
 forest7:m=>`开战：其他友方妖精族随从获得屏障和「友方妖精族数量 × 2 + 妖精军团」× ${m} 的攻击与生命。`,
 royal0:m=>`屏障。自身屏障破裂时，永久 +${3*m}/+${3*m}。`,
 royal1:m=>`入场曲：获得 ${m} 张 1/1 骑士。招募阶段打出其他皇家随从时，自身永久 +${2*m}/+${2*m}。`,
 royal2:m=>`守护。每次被攻击时，相邻友方获得屏障和 +${2*m} 生命。`,
 royal3:m=>`其他友方的入场曲额外触发 ${m} 次。`,
 royal4:()=>`守护。复生：以一半最大生命复活，并获得屏障。`,
 royal5:()=>`屏障。连击。攻击击杀目标后，恢复自身屏障。`,
 royal6:m=>`每当友方屏障破裂，所有存活的友方皇家永久 +${2*m}/+${2*m}。`,
 royal7:m=>`开战：其他友方皇家获得屏障与 +${8*m}/+${8*m}。`,
 dragon0:m=>`备战结束：永久获得「酒馆星级 × ${m}」攻击与生命。`,
 dragon1:m=>`入场曲与谢幕曲：本次酒馆升级费用各减少 ${m}。`,
 dragon2:m=>`守护。受到伤害且存活时，永久 +${3*m}/+${3*m}。`,
 dragon3:()=>`开战：对相邻友方各造成两次 1 点伤害。`,
 dragon4:m=>`友方龙族受到伤害且存活时，另一个随机友方龙族永久 +${3*m}/+${3*m}。`,
 dragon5:()=>`守护。每第 3 次受到伤害且存活时，恢复自身屏障。`,
 dragon6:()=>`顺劈。连击。`,
 dragon7:m=>`开战：对所有敌方造成「自身攻击 × ${m}」伤害。`,
 night0:m=>`谢幕曲：召唤一个 ${2*m}/${m} 骷髅士兵。`,
 night1:m=>`入场曲：获得 ${6*m} 墓场。其他友方触发复生时，获得 ${4*m} 墓场。`,
 night2:m=>`复生。复仇（2）：永久 +${5*m}/+${5*m}。`,
 night3:m=>`每当其他友方死亡，自身永久 +${2*m}/+${2*m}。`,
 night4:m=>`其他友方的谢幕曲额外触发 ${m} 次。`,
 night5:m=>`谢幕曲：召唤 ${2*m}/${m} 米米与 ${m}/${2*m} 可可。米米额外继承本体一半攻击，可可额外继承本体一半最大生命（向下取整）。`,
 night6:m=>`谢幕曲：将攻击最高的 ${m} 个敌方的当前生命变为 1。`,
 night7:m=>`其他非衍生友方死亡时，消耗等同其星级的墓场，使其以${m===1?'全部':'两倍'}最大生命复活。同一本体只能被此能力复活一次。`,
 rune0:m=>`每施放一个法术，自身永久 +${2*m}/+${2*m}。`,
 rune1:m=>`入场曲与出售时：各获得 ${m} 张「智慧之光」。`,
 rune2:m=>`守护。每施放一个法术，自身永久获得 +${2*m} 生命，并获得屏障，持续到下回合开始。`,
 rune3:m=>`备战结束：获得 ${3*m} 张「智慧之光」。`,
 rune4:m=>`开战：发射「2 + 本局施法数÷10」束雷光，每束对随机敌方造成「2 + 本局施法数÷2」× ${m} 伤害（除法向下取整）。`,
 rune5:m=>`你的定向法术会将其属性强化及新增守护、屏障额外施加给目标的相邻友方 ${m} 次。`,
 rune6:m=>`每施放一个法术，全体友方永久 +${2*m}/+${2*m}。`,
 rune7:m=>`每当一个己方随从攻击前，对随机敌方造成「本局施法数 × ${m}」伤害。`,
 haven0:m=>`每放置一个护符，自身永久 +${2*m}/+${2*m}。`,
 haven1:m=>`入场曲：获得 ${m} 张「慈爱福音」，并使倒数最少的一个己方护符倒数减少 ${m}。`,
 haven2:()=>`守护。屏障。复仇（2）：恢复自身屏障。`,
 haven3:m=>`每当己方护符倒数归零，全体友方永久获得 +${2*m} 生命与守护。`,
 haven4:m=>`备战结束：英雄恢复 ${3*m} 生命。每点过量治疗使全体友方永久获得 +${m} 生命。`,
 haven5:m=>`每当己方护符倒数归零，获得 ${m} 张该护符的复制，其初始倒数为 1。`,
 haven6:m=>`开战：相邻友方获得遗愿，死亡时将自身一半攻击与最大生命 × ${m} 赋予随机友方，并给予守护（先向下取整）。`,
 haven7:m=>`每当其他友方死亡，将其${m===1?'一半':'全部'}攻击与最大生命赋予最右侧友方（向下取整）。`,
 blood0:m=>`入场曲：自伤 1，成功后获得 ${m} 张 1/1 丛林蝙蝠。`,
 blood1:m=>`每次招募自伤成功后，自身永久 +${3*m}/+${2*m}。备战结束：自伤 1。`,
 blood2:m=>`谢幕曲：召唤两个丛林蝙蝠，各为 ${2*m}/${m}，并额外继承本体一半攻击与最大生命（向下取整）。`,
 blood3:m=>`入场曲：自伤 2，成功后获得 ${3*m} 金币。`,
 blood4:m=>`每次招募自伤成功后，全体友方吸血鬼永久获得「1 + 累计自伤÷7」× ${m} 的攻击与生命（向下取整）。`,
 blood5:m=>`攻击对目标造成生命伤害时，在战斗结束、伤害结算前为英雄恢复 ${m} 生命。`,
 blood6:m=>`每当友方蝙蝠死亡，对随机敌方造成「该蝙蝠攻击 × ${m}」伤害。`,
 blood7:m=>`开战：全体友方吸血鬼获得「本局累计自伤 × ${m}」攻击与生命。`,
 artifact0:m=>`入场曲：获得 ${m} 张「机械的解放」。`,
 artifact1:m=>`谢幕曲：召唤一个 ${2*m}/${2*m} 解析的创造物。`,
 artifact2:m=>`守护。每次对自身使用武装时，额外永久 +${2*m}/+${3*m}。`,
 artifact3:m=>`备战结束：获得 ${2*m} 张「机械的解放」。`,
 artifact4:m=>`谢幕曲：召唤 ${m} 个古老的创造物，身材各为「3 + 本局残骸」× ${m}。`,
 artifact5:m=>`其他友方造物死亡时，一个其他存活的初始造物永久 +${3*m}/+${3*m}。`,
 artifact6:m=>`顺劈。每次对自身使用武装时，将该武装的基础属性强化额外施加给相邻友方造物 ${m} 次。`,
 artifact7:m=>`开战：全体友方造物获得「本局残骸 × ${m}」攻击与生命。`,
 neutral0:m=>`出售时额外获得 ${m} 金币。`,
 neutral1:m=>`入场曲：相邻友方永久 +${3*m}/+${3*m}。`,
 neutral2:m=>`备战结束：每个非中立种族各一个随机友方永久 +${3*m}/+${3*m}。`,
 neutral3:m=>`守护。屏障。友方屏障破裂时，使该随从的相邻友方 +${2*m}/+${2*m}（本场）。`,
 neutral4:m=>`入场曲：其他友方永久 +${3*m}/+${3*m}。`,
 neutral5:m=>`开战：摧毁所有敌方屏障；每有一个不同的友方非中立种族，全体友方 +${4*m}/+${4*m}。`
 };
 for(const c of D.cards){const rule=rules[c.id];if(!rule)throw Error('Missing 5.0 rule: '+c.id);c.text=rule(1).replace(/ × 1/g,'');c.goldenText=rule(2);}
 // Baseline combat keywords stay visible beside the focused triggered ability.
 for(const id of ['forest4','forest7','night6','haven6','haven7']){b[id].text='守护。'+b[id].text;b[id].goldenText='守护。'+b[id].goldenText;}
 b.royal7.text='屏障。'+b.royal7.text;b.royal7.goldenText='屏障。'+b.royal7.goldenText;
 b.haven6.effect='vowAura';b.rune6.signature='太阳恩赐';b.blood7.signature='鲜血加冕';
 D.heroes.find(h=>h.id==='blood').text='自伤 1，成功后获得一张丛林蝙蝠。自伤最低降至 1 生命；累计自伤持续提高血翼军团。';
 D.heroes.find(h=>h.id==='artifact').text='获得一张「机械的解放」，按当前武装品质强化友方造物并触发武装效果。';
 D.fanfareIds=D.fanfareIds.filter(id=>id!=='royal3'&&id!=='blood2');
 b.forest5.related=[{id:'fairy',attack:3,health:3,count:2,scale:true,inheritAttack:true,inheritHealth:true,when:'谢幕曲召唤'}];
 delete b.royal7.related;
 b.blood2.related=[{id:'bat',attack:2,health:1,count:2,scale:true,inheritAttack:true,inheritHealth:true,when:'谢幕曲召唤'}];
 b.rune3.related=[{id:'mana',count:3,scaleCount:true,when:'备战结束加入手牌'}];
 b.artifact3.related=[{id:'module',count:2,scaleCount:true,when:'备战结束加入手牌'}];
 b.haven5.related=[{pool:'amulet',when:'每次倒数归零后复制，初始倒数1'}];
 b.artifact4.related=[{id:'ancientArtifact',count:1,scaleCount:true,dynamic:'scrap',scale:true,when:'谢幕曲召唤，按当前残骸预览；本体死亡也计入残骸'}];
 b.ritual.text='消耗全部墓场，使一个友方永久获得等量的攻击与生命。';
 b.module.text='武装：使一个友方造物永久获得当前武装品质的攻击与生命。';
 b.fairy.text='军团。衍生随从。';b.bat.text='血翼军团。衍生随从。';
 for(const a of D.amulets)a.text=a.text.replace(/\s*共鸣：.*$/,'')+' 共鸣。';
 const paths={
 forest:[['连携养成','辛西亚积累整局军团并强化妖精族，破魔虫以连携养成承接连击。',['forest1','forest4','forest3']],['衍生物涌潮','养大妖精公主，让衍生物继承身材；莉莎以召唤继续提高军团。',['forest5','forest6','forest7']],'妖精贸易提供资源循环，远古树精为妖精族阵容赋予屏障。'],
 royal:[['屏障军团','近卫反复保护相邻友方，艾蜜莉亚把每次破盾转成全队皇家永久成长。',['royal0','royal2','royal6']],['入场曲循环','白银将军重奏所有其他入场曲，循环资源与养成牌建立强大军团。',['royal1','royal3','neutral4']],'乙姬提供开战屏障；阿尔贝尔以连击和击杀回盾收割。'],
 dragon:[['逆鳞养成','火焰蜥蜴点燃相邻龙族，远古飞龙和驯龙师将每次受伤变成永久成长。',['dragon2','dragon3','dragon4']],['升星巨兽','用艾拉加速升星，以银白幼龙积累身材，养大海德拉与法夫纳完成收割。',['dragon0','dragon1','dragon7']],'海德拉连击顺劈，利维坦反复恢复屏障，为成长核心争取时间。'],
 night:[['谢幕曲重奏','命忒重奏每个其他谢幕曲；养大冥犬传递身材，巴罗尔处理高攻击敌人。',['night4','night5','night6']],['复生墓场','复生与死亡累积墓场，奈芙蒂斯消耗墓场复活每个原始随从。',['night1','night2','night7']],'暗影收割者把每次其他友方死亡变成永久养成。'],
 rune:[['施法养成','产出并循环法术，由帕梅拉强化全队、梅林向相邻目标扩散强化。',['rune1','rune5','rune6']],['法术炮击','积累施法次数，同时增加雷光弹数与伤害，再由秘银巨像持续轰击。',['rune3','rune4','rune7']],'宝石巨像承接法术生命成长与屏障，睿智的术士提供前期主力。'],
 haven:[['护符循环','每次护符结算都复制倒数1的护符；持续提高共鸣，反复养成全队。',['haven0','haven1','haven5']],['守护传承','贞德赋予遗愿，勒碧丝将每次阵亡者的身材交给最右侧主力。',['haven2','haven6','haven7']],'圣之光棱牧师为全队赋予守护，天狐将过量治疗转换为全队生命。'],
 blood:[['血契养成','自伤同时养成魔狼、尤里乌斯与整局血翼，女帝把累计自伤转成开战军团。',['blood1','blood4','blood7']],['蝙蝠吸血','养大斑比让蝙蝠继承身材，女王将每次蝙蝠死亡转为完整攻击炮击。',['blood2','blood6','blood5']],'贝尔芬格以生命换金币；绯色剑士在战后回复生命以继续自伤。'],
 artifact:[['武装锻造','机械随从产出武装，提高整局武装品质；戴恩将每次武装扩散到相邻造物。',['artifact0','artifact3','artifact6']],['残骸重构','每次造物死亡累积残骸，提高新召唤物与创造主的开战军团；丝碧涅带回永久成长。',['artifact1','artifact4','artifact5']],'机巧枪手承接单体武装成长，贝尔弗特把残骸转换为全队身材。']
 };
 for(const [tribe,p] of Object.entries(paths))D.archetypes[tribe]={routes:p.slice(0,2),support:p[2]};
 D.rulesVersion='5.0';return D;
}
root.TavernBalance={apply};if(typeof module!=='undefined')module.exports={apply};
})(typeof globalThis!=='undefined'?globalThis:this);
