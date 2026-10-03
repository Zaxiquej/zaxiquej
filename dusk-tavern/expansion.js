(function(root){
'use strict';
function apply(D,I){
 Object.assign(D.tribes,{blood:{name:'吸血鬼',color:'#ed839c',icon:'♥',motto:'狂乱 · 蝙蝠 · 吸血'},artifact:{name:'造物',color:'#74d5dc',icon:'⚙',motto:'武装 · 残骸 · 重构'}});
 D.tribeIds=['forest','royal','dragon','night','rune','haven','blood','artifact'];
 D.tribes.neutral.name='中立';
 // Two deliberate engines per tribe; support effects are explicitly secondary.
 const rows={blood:[
 [1,2,3,'bloodGift','血契使者',m=>`入场曲：自伤 1，成功后获得 ${m} 张 1/1 丛林蝙蝠。`],
 [1,2,3,'bloodGrow','嗜血生长',m=>`每当你在招募阶段自伤，自身永久 +${2*m}/+${m}。备战结束：自伤 1。`],
 [2,3,4,'batDeath','蝙蝠眷属',m=>`入场曲：自伤 1。谢幕曲：召唤两个 ${2*m}/${m} 丛林蝙蝠。`],
 [3,4,5,'bloodGold','危险交易',m=>`入场曲：自伤 2，成功后获得 ${2*m} 金币。狂乱时，自身再永久 +${3*m}/+${3*m}。`],
 [3,3,7,'bloodTeam','鲜血共鸣',m=>`每回合前 3 次招募阶段自伤，使全体友方吸血鬼永久 +${m}/+${m}。`],
 [4,7,7,'bloodDrain','绯色汲取',m=>`攻击对目标造成生命伤害时，在战斗结束、伤害结算前为英雄恢复 ${m} 生命（每场此能力合计至多 6）。狂乱时，开战获得屏障与 +${4*m} 攻击。`],
 [5,6,9,'batQueen','血翼夜宴',m=>`战斗中召唤的丛林蝙蝠获得 +${4*m}/+${4*m}。友方蝙蝠死亡时，对随机敌方造成 ${2*m} 伤害（每场至多 6 次）。`],
 [6,9,12,'bloodEmpress','狂乱加冕',m=>`开战：狂乱时，全体友方吸血鬼 +${6*m}/+${6*m}，自身获得连击；否则自身 +${3*m}/+${3*m}。`]
 ],artifact:[
 [1,2,3,'moduleGift','武装工程',m=>`入场曲：获得 ${m} 张「机械的解放」。`],
 [1,2,2,'analyzerDeath','解析回收',m=>`谢幕曲：召唤一个 ${2*m}/${2*m} 解析的创造物。`],
 [2,3,6,'moduleGuard','装甲改造',m=>`守护。每次对自身使用武装，额外永久 +${m}/+${2*m}；每回合首次获得屏障。`,'taunt'],
 [3,4,6,'moduleSmith','工厂流水线',m=>`备战结束：获得 ${m} 张「机械的解放」。每次对友方造物使用武装，使目标额外永久 +${m}/+${m}。`],
 [3,4,4,'artifactDeath','残骸重构',m=>`谢幕曲：召唤两个 ${3*m}/${3*m} 古老的创造物；每个额外获得「本局己方造物死亡数 × ${m}」身材，至多 +${8*m}/+${8*m}。`],
 [4,5,8,'scrapGrow','遗物传承',m=>`其他友方造物死亡时，一个其他存活的初始造物永久 +${2*m}/+${m}（每场至多 6 次）。`],
 [5,8,8,'cleave','双剑武装',m=>`顺劈。每回合前 2 次对自身使用武装时，相邻友方造物各永久 +${m}/+${2*m}。`],
 [6,8,12,'artifactLord','创造主领域',m=>`开战：本局每有 2 个己方造物死亡，全体友方造物 +${m}/+${m}（至多 +${15*m}/+${15*m}）。战斗中召唤的造物获得 +${3*m}/+${3*m}。`]
 ]};
 for(const [tribe,rs] of Object.entries(rows))rs.forEach((r,i)=>{const id=tribe+i,c={id,type:'minion',tribe,tier:r[0],attack:r[1],health:r[2],effect:r[3],signature:r[4],text:r[5](1),goldenText:r[5](2),keywords:(r[6]||'').split(' ').filter(Boolean),cost:3,...I.cards[id]};D.cards.push(c);D.byId[id]=c;});
 const add=(list,c)=>{Object.assign(c,I.cards[c.id]);D[list].push(c);D.byId[c.id]=c;};
 add('tokens',{id:'bat',type:'minion',tribe:'blood',tier:1,cost:3,attack:1,health:1,effect:'',text:'衍生随从；可触发吸血鬼女王的召唤与死亡效果。',token:true,keywords:[]});
 add('tokens',{id:'analyzer',type:'minion',tribe:'artifact',tier:1,cost:3,attack:2,health:2,effect:'analyzerLast',text:'谢幕曲：使一个随机友方造物 +1/+1（仅本场）。',token:true,keywords:[]});
 add('tokens',{id:'ancientArtifact',type:'minion',tribe:'artifact',tier:1,cost:3,attack:3,health:3,effect:'',text:'衍生随从；死亡计入残骸，可触发遗物传承。',token:true,keywords:[]});
 add('spells',{id:'module',type:'spell',tribe:'artifact',tier:1,cost:1,effect:'module',attack:1,health:2,target:true,text:'武装：使一个友方造物永久 +1/+2，并触发它的武装效果。只能以造物为目标。'});
 add('spells',{id:'bloodPact',type:'spell',tribe:'blood',tier:1,cost:1,effect:'bloodPact',attack:0,health:0,target:true,text:'自伤 1，成功后使一个友方永久 +3/+3。可用于任何种族。'});
 add('amulets',{id:'bloodGarden',type:'amulet',tribe:'blood',tier:1,cost:2,count:2,effect:'bloodGarden',text:'倒数 2：自伤 2，成功后使全体友方吸血鬼永久 +3/+3，并获得一张丛林蝙蝠。'});
 add('amulets',{id:'accelerator',type:'amulet',tribe:'artifact',tier:1,cost:2,count:2,effect:'accelerator',text:'倒数 2：获得两张「机械的解放」，全体友方造物永久 +1/+2。'});
 D.heroes.push({...I.heroes.blood,id:'blood',subtitle:'以鲜血，唤醒沉睡的力量。',power:'鲜血盟约',cost:1,text:'自伤 1，成功后获得一张丛林蝙蝠。自伤最低降至 1 生命；本局累计自伤 7 生命进入狂乱。'});
 D.heroes.push({...I.heroes.artifact,id:'artifact',subtitle:'让每块残骸，重获新生。',power:'人偶工坊',cost:1,text:'获得一张「机械的解放」，可为造物永久 +1/+2 并触发武装。'});
 const b=D.byId;
 b.blood0.related=[{id:'bat',count:1,scaleCount:true,when:'成功自伤后加入手牌'}];b.blood2.related=[{id:'bat',attack:2,health:1,count:2,scale:true,when:'谢幕曲召唤'}];
 b.artifact0.related=[{id:'module',count:1,scaleCount:true,when:'入场曲加入手牌'}];b.artifact3.related=[{id:'module',count:1,scaleCount:true,when:'备战结束加入手牌'}];
 b.artifact1.related=[{id:'analyzer',attack:2,health:2,count:1,scale:true,when:'谢幕曲召唤'}];b.artifact4.related=[{id:'ancientArtifact',count:2,dynamic:'scrap',scale:true,when:'谢幕曲召唤，按当前残骸计算'}];
 b.bloodGarden.related=[{id:'bat',count:1,when:'倒数归零且成功自伤后加入手牌'}];b.accelerator.related=[{id:'module',count:2,when:'倒数归零加入手牌'}];
 D.heroes.find(h=>h.id==='blood').related=[{id:'bat',count:1,when:'成功自伤后加入手牌'}];D.heroes.find(h=>h.id==='artifact').related=[{id:'module',count:1,when:'主动技能加入手牌'}];
 D.fanfareIds.push('blood0','blood2','blood3','artifact0');
 D.archetypes={
 forest:{routes:[['连携养成','循环妖精与低费法术，每三张牌推进成长；六连携让破魔虫连击。',['forest0','forest1','forest4']],['衍生物涌潮','妖精公主补充战场，莉莎将召唤变成永久养成。',['forest5','forest6','forest7']]],support:'妖精贸易补充经济；维尔达用连携积累顺劈攻击。'},
 royal:{routes:[['屏障军团','让屏障反复破裂和恢复，艾蜜莉亚把破盾变成全队战斗增益。',['royal0','royal6','royal7']],['入场曲循环','白银将军重奏入场曲，骑士与资源随从反复进出酒馆。',['royal1','royal3','neutral4']]],support:'近卫的相邻保护和乙姬的屏障骑士为主线补充战场。'},
 dragon:{routes:[['逆鳞养成','用火焰蜥蜴的相邻伤害启动龙血培育，把战斗伤害转为永久身材。',['dragon2','dragon3','dragon4']],['升星巨兽','用艾拉降低升级费用，尽早找到海德拉和法夫纳。',['dragon0','dragon1','dragon6']]],support:'利维坦的再生屏障争取时间；法夫纳提供开战清场。'},
 night:{routes:[['谢幕曲重奏','养大凯尔贝洛斯，命忒重复谢幕曲，冥犬继承本体身材。',['night4','night5','night6']],['复生墓场','复生积累墓场与复仇次数，奈芙蒂斯让关键随从再次作战。',['night1','night2','night7']]],support:'暗影收割者吸收友方死亡；骷髅和墓场法术提供过渡。'},
 rune:{routes:[['施法养成','产出低费法术，经梅林扩散强化，再用帕梅拉的第三次施法倍增。',['rune1','rune5','rune6']],['法术炮击','积累整局施法次数，让雷光和秘银轰击直接削弱敌方战场。',['rune3','rune4','rune7']]],support:'宝石巨像吸收法术成长并保护核心；可借用其他种族的生成法术。'},
 haven:{routes:[['护符循环','加速倒数、复制初始倒数 1 的护符，用连续结算永久养成。',['haven0','haven1','haven5']],['守护传承','把高生命守护放在前排，贞德赋予遗愿，勒碧丝转移阵亡者身材。',['haven2','haven6','haven7']]],support:'天狐将过量治疗变为生命；圣之光棱牧师补充守护目标。'},
 blood:{routes:[['狂乱养成','招募自伤推动魔狼和尤里乌斯成长，累计 7 点自伤后开启女帝的狂乱。',['blood1','blood4','blood7']],['蝙蝠吸血','斑比补充蝙蝠，女王强化召唤并连锁伤害，绯色剑士战后回血。',['blood2','blood5','blood6']]],support:'蠢动的恶鬼提供衍生物；贝尔芬格以生命换金币，注意保留血量。'},
 artifact:{routes:[['武装锻造','机械技师和铁杖机械士产出武装，养大守护与顺劈主力。',['artifact0','artifact3','artifact6']],['残骸重构','造物死亡积累整局残骸，伊卡洛斯重构大身材，丝碧涅带回永久成长。',['artifact1','artifact4','artifact5']]],support:'贝尔弗特强化造物召唤；武装也能为残骸核心补充身材。'}
 };
 // Spell/amulet offers belong to the same four tribes; universal tools remain available.
 for(const id of ['evo','rich','bless'])D.byId[id].poolTribe='neutral';
 D.byId.bell.poolTribe='neutral';D.byId.bell.tier=1;
 D.rulesVersion='3.1';
}
root.TavernExpansion={apply};if(typeof module!=='undefined')module.exports={apply};
})(typeof globalThis!=='undefined'?globalThis:this);
