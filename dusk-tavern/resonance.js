(function(root){
'use strict';
function apply(D){
 const card=(id,rule)=>Object.assign(D.byId[id],{text:rule(1),goldenText:rule(2)});
 card('forest1',m=>`连击。连携：自身永久获得等同本回合已打出牌数 × ${m} 的攻击与生命。`);
 card('forest4',m=>`连携：其他友方妖精族随从永久获得「6 + 本回合已打出牌数」× ${m} 的攻击与生命。`);
 card('haven13',m=>`每当己方护符倒数归零，本局护符培育 +${2*m}。`);
 card('haven17',m=>`每当己方护符倒数归零，全体友方主教永久获得「4 + 护符共鸣」× ${m} 攻击与生命。`);
 const update=(id,patch)=>Object.assign(D.byId[id],patch);
 for(const id of ['garden','banner','bell','fairyGlade','hourglass','boneRing','summit'])update(id,{count:1,text:D.byId[id].text.replace('倒数 2','倒数 1')});
 update('egg',{text:'倒数 2：使本局当前与未来商店随从永久 +6/+6。护符共鸣增加此属性增益。'});
 update('library',{cost:2,text:'倒数 2：法术研习永久 +4，获得两张智慧之光。共鸣不增加研习或张数。'});
 update('temple',{text:'倒数 2：护符培育永久 +3，然后使全体友方永久 +4/+6（计入新共鸣）。'});
 update('fairyRealm',{text:'倒数 2：妖精军团永久 +6/+6。共鸣不增加军团成长。'});
 update('frontline',{text:'倒数 2：使每个友方皇家分别获得两次永久 +2/+3；每次均计入本局强化次数，并受护符共鸣增强。'});
 update('magicField',{text:'倒数 2：所有友方巫师永久获得「8 + 法术研习」攻击、「4 + 法术研习÷2」生命（向下取整）；另计护符共鸣。'});
 update('dragonCanyon',{count:2,text:'倒数 2：每有一个友方龙族，使本局酒馆永久 +3/+3；护符共鸣仅对总增益追加一次。没有龙族时无收益。'});
 update('deathBanquet',{text:'倒数 2：死灵军势永久 +6 攻击。共鸣不增加军势成长。'});
 update('ancientAmplifier',{cost:2});
 update('bloodMoon',{text:'倒数 2：依次自伤 1，共三次。每次实际受伤后，使生命最低的友方吸血鬼永久 +4 生命（受共鸣增强）。'});
 D.archetypes.forest.routes[0][1]='舞蹈家、柏尔嘉与花漾公主提供打牌资源；破魔虫随本回合牌数加速单体成长，辛西亚将长连携转为全队身材。魔法精灵公主单独积累军团，维尔达负责顺劈收益。';
 D.rulesVersion='19.0';return D;
}
root.TavernResonance={apply};if(typeof module!=='undefined')module.exports={apply};
})(typeof globalThis!=='undefined'?globalThis:this);
