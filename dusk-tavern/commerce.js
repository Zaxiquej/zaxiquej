(function(root){
'use strict';
function apply(D,I){
 const set=(id,p)=>Object.assign(D.byId[id],p),rule=(id,f)=>set(id,{text:f(1),goldenText:f(2)});
 const coin={...I.cards.coin,id:'coin',name:'铸币',type:'spell',tribe:'neutral',tier:1,cost:0,effect:'coin',token:true,target:false,attack:0,health:0,keywords:[],text:'本回合获得 1 金币。'};
 D.tokens.push(coin);D.byId.coin=coin;D.functionalSpellIds.push('coin');
 const thief={...I.cards.royal20,id:'royal20',type:'minion',tribe:'royal',tier:3,cost:3,effect:'coinGift',synergy:true,attack:3,health:4,keywords:[],related:[{id:'coin',count:1,scaleCount:true,when:'入场曲加入手牌'}]};
 D.cards.push(thief);D.byId.royal20=thief;rule('royal20',m=>`入场曲：获得 ${m} 张铸币。`);D.fanfareIds.push('royal20');D.abilityIds.fanfare.push('royal20');
 const vault={...I.cards.coinVault,id:'coinVault',type:'amulet',tribe:'neutral',tier:3,cost:2,count:2,effect:'coinVault',attack:0,health:0,keywords:[],text:'倒数 2：获得 3 张铸币。',related:[{id:'coin',count:3,when:'倒数归零加入手牌'}]};
 D.amulets.push(vault);D.byId.coinVault=vault;
 const remaps=[['forest15','花漾公主'],['forest16','妖精使役者'],['rune19','精通咒法的女巫'],['egg','龙之卵']];
 for(const [id,old]of remaps){set(id,I.cards[id]);for(const a of Object.values(D.archetypes)){a.support=a.support.split(old).join(D.byId[id].name);for(const r of a.routes)r[1]=r[1].split(old).join(D.byId[id].name);}}
 rule('forest6',m=>`每当友方衍生随从攻击前，使其本场 +${3*m}/+${3*m}，妖精军团永久 +${3*m}/+${3*m}。`);
 rule('forest4',m=>`连携：其他友方随从永久获得「6 + 本回合已打出牌数」× ${m} 的攻击与生命。`);
 rule('forest16',m=>`每当你打出妖精，使相邻友方随从永久 +${2*m}/+${2*m}。`);
 rule('night15',m=>`开战：使最左侧 ${m} 名其他未拥有复生的友方随从获得复生。`);
 set('tomb',{count:1,text:'倒数 1：获得 6 墓场与一个 3/3 骷髅士兵。共鸣。'});
 set('bloodGarden',{count:1,text:'倒数 1：自伤 2，成功后使全体友方随从永久 +3/+3，并获得一张丛林蝙蝠。共鸣。'});
 set('accelerator',{count:1,text:'倒数 1：获得两张机械的解放，所有友方造物永久 +1/+2。共鸣。'});
 set('frontline',{count:1,text:'倒数 1：使每个友方随从分别获得两次永久 +1/+2。共鸣。'});
 set('magicField',{text:'倒数 2：使攻击最低的两个友方随从永久获得「8 + 法术研习」攻击、「4 + 法术研习÷2」生命（向下取整）。共鸣。'});
 set('boneRing',{text:'倒数 1：使最左侧友方随从永久获得等同本局战斗入场次数一半（向下取整，至少 1）的攻击与生命。共鸣。'});
 set('summit',{text:'倒数 1：使最左侧友方随从永久获得等同其当前生命的攻击。共鸣。'});
 set('bloodMoon',{text:'倒数 2：依次自伤 1，共三次。每次实际受伤后，使生命最低的友方随从永久 +4 生命。共鸣。'});
 set('deathBanquet',{text:'倒数 2：获得 6 墓场，死灵军势永久 +6 攻击。'});
 set('library',{text:'倒数 2：法术研习永久 +4，获得两张智慧之光。'});
 set('fairyRealm',{text:'倒数 2：妖精军团永久 +6/+6。'});
 set('egg',{text:'倒数 2：使本局当前与未来商店随从永久 +6/+6。共鸣。'});
 D.archetypes.forest.support+=' 辛西亚的连携与蕾妮的相邻强化可培养其他种族；妖精召唤侧重继承本体身材与军团的攻防成长。';
 D.archetypes.night.support+=' 战斗入场数、墓场与复生构成不同资源；唤灵少女可给其他种族复生，头骨戒指可培养任意最左侧随从。';
 D.archetypes.royal.support+=' 高雅的盗贼提供铸币；战场最前线可强化混合阵容并积累强化次数。';
 D.archetypes.royal.support=D.archetypes.royal.support.replace('使每名皇家获得两次强化','使每名友方随从获得两次强化');
 D.archetypes.rune.support=D.archetypes.rune.support.replace('把研习转为全体巫师的攻击','把研习转为攻击最低的两个友方随从的身材');
 D.archetypes.night.support=D.archetypes.night.support.replace('最左侧死灵的永久身材','最左侧随从的永久身材');
 D.archetypes.haven.support=D.archetypes.haven.support.replace('最左侧主教的生命','最左侧随从的生命');
 D.archetypes.blood.support=D.archetypes.blood.support.replace('分别执行三次自伤与回血','通过三次自伤强化低生命友方随从');
 const recruiter={...I.cards.royal21,id:'royal21',type:'minion',tribe:'royal',tier:4,cost:3,effect:'discoverRoyal',discoverKind:'royal',synergy:true,attack:3,health:5,keywords:[],related:[{pool:'functionalDiscover',when:'从以下皇家随从中发现'}]};
 D.cards.push(recruiter);D.byId.royal21=recruiter;
 rule('royal21',m=>`入场曲：发现 ${m} 个皇家随从，不高于当前酒馆星级。`);
 D.fanfareIds.push('royal21');D.abilityIds.fanfare.push('royal21');
 const discoveryPool=D.discoveryPool;D.discoveryPool=(s,d)=>d.discoverKind==='royal'?D.cards.filter(c=>c.tribe==='royal'&&!c.retired&&c.tier<=s.tier&&(s.activeTribes||D.tribeIds).includes('royal')):discoveryPool(s,d);
 set('royal14',{effect:'cryChampion',signature:'入场指挥'});
 rule('royal14',m=>`每当其他友方触发入场曲，自身永久 +${4*m}/+${4*m}。`);
 set('royal12',{signature:'屏障援护'});
 D.barrierIds=D.barrierIds.filter(id=>id!=='royal14');
 D.archetypes.royal.routes=[
  ['屏障联动','守护骑士可叠加屏障，白银圣骑士与乙姬补盾；失去屏障时，剑术教官强化该随从，瓦路兹积累法术研习，艾蜜莉亚强化皇家队伍。',['royal2','royal12','royal16','royal15','royal6','royal7','royal5']],
  ['入场曲军团','鼯鼠传令兵发现皇家随从，高雅的盗贼提供铸币；玛尔斯从各族入场曲成长，亚瑟强化皇家全队。洛基增加入场曲次数，白银将军培养新兵，榭莉亚利用累计强化次数。',['royal21','royal20','royal14','royal10','neutral14','royal3','royal18','royal19']]
 ];
 D.archetypes.royal.support='战地铁骑兵强化相邻随从，旗手提供守护法术，战场最前线强化全队。玛尔斯与亚瑟可由其他种族的入场曲触发；罗兰和榭莉亚读取本局强化次数。';
 for(const id of ['smallWard','tierBlessing','bless']){const c=D.byId[id];c.retired=true;if(!D.retiredSpells.includes(c))D.retiredSpells.push(c);}D.spells=D.spells.filter(c=>!c.retired);
 set('growth',{tier:2,cost:1,tribe:'neutral',poolTribe:'neutral'});
 D.rulesVersion='21.0';return D;
}
root.TavernCommerce={apply};if(typeof module!=='undefined')module.exports={apply};
})(typeof globalThis!=='undefined'?globalThis:this);
