(function(root){
'use strict';
function apply(D){
 const changes=[];
 function card(id,stats,rule){const c=D.byId[id],before={tier:c.tier,attack:c.attack,health:c.health,text:c.text};Object.assign(c,stats);if(rule){c.text=rule(1);c.goldenText=rule(2);}changes.push({id,name:c.name,before,after:{tier:c.tier,attack:c.attack,health:c.health,text:c.text}});}
 function brood(id,stats,token,count,attack,health,inheritHealth=false){card(id,{...stats,effect:'battleBrood',brood:{id:token,count,attack,health,inheritHealth},related:[{id:token,count,attack,health,inheritHealth,scale:true,when:'谢幕曲召唤'}]},m=>`${stats.keywords?.includes('taunt')?'守护。':''}谢幕曲：召唤 ${count} 个 ${attack*m}/${health*m} ${D.byId[token].name}${inheritHealth?'，额外继承本体一半最大生命（向下取整）':''}。`);D.fanfareIds=D.fanfareIds.filter(x=>x!==id);}
 // Forest: recruitment fuel, army training and army payoffs occupy separate slots.
 card('forest1',{},m=>`连击。连携：自身永久 +${3*m}/+${3*m}。`);
 card('forest3',{tier:5,attack:6,health:6},m=>`顺劈。开战：获得等同「妖精军团 × ${m}」的攻击（仅本场）。`);
 card('forest4',{tier:5,attack:5,health:7,keywords:[]},m=>`连携：其他友方妖精族随从永久 +${4*m}/+${4*m}。`);
 brood('forest13',{tier:2,attack:2,health:3,signature:'林间伙伴'},'fairy',2,1,1);
 brood('forest9',{tier:3,attack:3,health:5,keywords:['taunt'],signature:'森林援军'},'fairy',2,2,2);
 card('forest15',{tier:4,attack:4,health:6});
 card('forest16',{},m=>`每当你打出妖精，使相邻友方妖精族永久 +${2*m}/+${2*m}。`);
 card('forest6',{},m=>`战斗中每召唤一个友方妖精族随从，妖精军团永久 +${3*m}/+${3*m}。`);
 card('forest17',{tier:4,attack:4,health:6},m=>`每当友方妖精衍生物死亡，使存活的友方妖精族永久 +${2*m}/+${2*m}。`);
 card('forest18',{tier:4,attack:5,health:7});
 card('forest10',{tier:5,attack:6,health:8});
 card('forest19',{},m=>`谢幕曲：召唤三个妖精，各继承本随从 ${m} 倍攻击和${m===1?'一半最大生命（向下取整）':'一半最大生命的两倍（先向下取整）'}。`);D.byId.forest19.related[0].count=3;
 // Royal: protection needs a separate body; the finisher no longer starts shielded.
 card('royal2',{},m=>`守护。受到攻击后若存活，使 ${m===1?'一个':'两个'}没有屏障的相邻友方皇家获得屏障。`);
 card('royal5',{health:7,keywords:[]},m=>`连击。攻击击杀目标后，恢复自身屏障。`);
 card('royal14',{tier:4,attack:4,health:6},m=>`每当其他友方触发入场曲，自身永久 +${4*m}/+${4*m}。`);
 card('royal10',{},m=>`每当其他友方触发入场曲，全体友方皇家永久 +${5*m}/+${5*m}。`);
 card('royal18',{tier:5,attack:6,health:8});
 // Dragons: expose the injury trigger early; high-tier trainers supply the growth.
 card('dragon3',{tier:2,attack:3,health:4});
 D.tuning.dragonTrainer=4;
 card('dragon4',{tier:4,attack:4,health:7},m=>`友方龙族受到伤害且存活时，另一个随机友方龙族永久 +${4*m}/+${4*m}。`);
 card('dragon16',{},m=>`每次攻击后若存活，相邻友方龙族永久 +${3*m}/+${6*m}。`);
 card('dragon10',{tier:5,attack:8,health:10});
 // Necromancy: more bodies at three stars; large permanent death growth spends graves.
 brood('night14',{tier:3,attack:3,health:5,signature:'冥河渡魂'},'skeleton',2,2,2);
 card('night16',{tier:5,attack:5,health:7},m=>`谢幕曲：消耗 6 墓场，使存活的友方死灵永久 +${12*m}/+${12*m}。`);
 // Rune: spell count scales damage, not damage and projectile count simultaneously.
 card('rune4',{},m=>`开战：发射两束雷光，每束对随机敌方造成「2 + 本局施法数÷4」× ${m} 伤害（向下取整）。`);
 card('rune13',{tier:4,attack:3,health:6});
 card('rune15',{tier:5,attack:5,health:7},m=>`每当你施放法术，相邻友方永久获得「法术研习÷2」× ${m} 攻击与生命（向上取整）。`);
 card('rune17',{},m=>`备战结束：本局法术研习 +${6*m}。`);
 // Haven: healing and its payoff are separate; copies retain their printed countdown.
 card('haven4',{tier:5,attack:5,health:7,effect:'overflowPayoff'},m=>`过量治疗时，全体友方主教永久获得「过量治疗点数 × ${m}」攻击与生命。`);
 card('haven8',{tier:2,attack:2,health:4,effect:'heroMend',related:[]},m=>`备战结束：为英雄恢复 ${3*m} 生命。`);
 card('haven5',{tier:5,attack:5,health:8},m=>`每当己方护符倒数归零，获得 ${m} 张该护符的复制，保留其原始倒数。`);
 card('haven13',{tier:4},m=>`每当己方护符倒数归零，本局护符培育 +${m}。`);
 card('haven9',{tier:3,attack:4,health:5});
 card('haven16',{tier:5,effect:'prayerHealer'},m=>`备战结束：为英雄恢复「2 + 自身攻击÷5」× ${m} 生命（向下取整）。`);
 // Blood: self-harm trains a fixed team increment; scaling health is a different card.
 card('blood4',{},m=>`每次招募自伤成功后，全体友方吸血鬼永久 +${2*m}/+${2*m}。`);
 card('blood11',{tier:4,health:6});
 brood('blood16',{tier:3,attack:3,health:5,keywords:['taunt'],signature:'夜翼护卫'},'bat',1,2,1,true);
 // Artifacts: weapon echo and cleave are two different investments.
 card('artifact6',{effect:'moduleEcho'},m=>`每次对自身使用武装时，将该武装的属性强化额外施加给相邻友方造物 ${m} 次。`);
 card('artifact9',{tier:5,effect:'cleave'},m=>`顺劈。开战：获得「本局残骸 × ${m}」攻击（仅本场）。`);
 card('artifact13',{tier:4,health:7});
 card('artifact14',{tier:4,attack:4,health:8});
 card('artifact17',{},m=>`每当你施放武装，使其他友方造物永久 +${4*m}/+${4*m}。`);
 brood('artifact16',{tier:3,attack:3,health:4,signature:'遗物档案'},'analyzer',2,2,2);
 const routes={
 forest:[['连携养成','舞蹈家与柏尔嘉提供打牌资源，辛西亚负责固定队伍成长；公主单独积累军团，维尔达负责顺劈收益。',['forest8','forest11','forest4','forest2','forest3','forest16']],['战斗召唤','吟游诗人与远古精灵承接前中期，妖精公主与舞夜妖精继承身材；莉莎养军团，阿丽雅强化召唤，邱贝雷提供永久成长。',['forest13','forest9','forest5','forest6','forest10','forest17','forest19']]],
 royal:[['屏障军团','旗手与圣骑士负责补盾，艾蜜莉亚负责永久成长；阿尔贝尔需要队友保护，靠连击与击杀回盾收割。',['royal13','royal15','royal2','royal6','royal5','royal17']],['入场曲军团','迅捷的剑士提供资源，玛尔斯负责单体成长，将军重奏入场曲；亚瑟强化军团，榭莉亚培养法术。',['royal11','royal14','royal3','royal10','royal18','royal16']]],
 dragon:[['逆鳞养成','火焰蜥蜴提供受伤触发，四星驯龙师负责早期队伍成长；赤怒蛇与勒哈布承担高星收益。',['dragon3','dragon2','dragon4','dragon5','dragon13','dragon18']],['升星巨兽','艾拉辅助升级，织术师培养法术，元祖驭龙使培养队伍；海德拉收割，贾巴沃克在阵亡后传递巨兽身材。',['dragon1','dragon14','dragon15','dragon17','dragon6','dragon10','dragon7']]],
 night:[['谢幕曲军团','冥河引导者与冥犬提供战斗召唤，命忒重奏谢幕曲；暮光女皇消费墓场提供固定队伍成长。',['night0','night14','night5','night4','night16','night18']],['复生墓场','安德雷斐斯与守墓人提供墓场，死骸勋爵负责长期养成，莫迪凯与奈芙蒂斯承接复生。',['night8','night12','night17','night10','night7','night15']]],
 rune:[['施法军团','炼金术师与萨米提供施法次数，帕梅拉负责队伍养成；雷光射手仅按施法数提高伤害，秘银巨像在所有友方攻击前持续炮击。',['rune3','rune11','rune6','rune4','rune7','rune8']],['研习强化','克拉克与马纳历亚培养法术，梅林扩散定向强化；费洛与露妮将研习转成队伍身材。',['rune12','rune13','rune17','rune5','rune15','rune18']]],
 haven:[['护符培育','智者加速倒数，巫女培养共鸣，高阶牧师提供原始倒数的复制；合唱与迦楼罗放大收益。',['haven14','haven13','haven5','haven17','haven18','haven15']],['治疗传承','兔耳治愈师负责前期治疗，魔神像将攻击转为治疗，天狐只负责过量治疗收益；白雪公主承接成长，贞德与勒碧丝传递身材。',['haven8','haven4','haven16','haven9','haven6','haven7','haven10']]],
 blood:[['自伤养成','魔狼触发自伤，尤里乌斯提供固定全队成长，玛丽强化攻击；摩耳摩培养法术，薇拉单独提供累计自伤的生命收益。',['blood1','blood4','blood9','blood15','blood18','blood11']],['蝙蝠军团','拜特、午夜吸血鬼与斑比提供前中期战斗召唤，瓦妮亚负责永久成长，女王把蝙蝠攻击变成炮击。',['blood8','blood16','blood2','blood17','blood6','blood19']]],
 artifact:[['武装锻造','机械士提供武装，库库璐与帕拉塞尔苏斯提高品质；戴恩只负责相邻扩散，四郎负责队伍养成。',['artifact3','artifact13','artifact15','artifact6','artifact17','artifact2']],['残骸重构','机械犬与史学家提供战斗召唤，伊卡洛斯与遗物承接残骸；纱妃拉单独承担顺劈收割。',['artifact1','artifact16','artifact4','artifact18','artifact9','artifact7','artifact5']]]
 };
 for(const t of D.tribeIds)D.archetypes[t]={routes:routes[t],support:'资源供给、永久养成与战斗收益需要不同随从配合；战斗召唤不会加入手牌，延迟资源仍在下回合领取。'};
 D.archetypeChanges=changes;D.rulesVersion='9.0';return D;
}
root.TavernArchetypes={apply};if(typeof module!=='undefined')module.exports={apply};
})(typeof globalThis!=='undefined'?globalThis:this);
