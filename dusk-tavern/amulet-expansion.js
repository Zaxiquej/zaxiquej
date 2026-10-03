(function(root){
'use strict';
function apply(D,I){
 const update=(id,patch)=>Object.assign(D.byId[id],patch);
 update('egg',{tier:3,cost:3,count:2,text:'倒数 2：使本局当前与未来商店随从永久 +4/+4。护符共鸣增加此属性增益。',related:[]});
 update('library',{tier:3,cost:3,count:2,text:'倒数 2：法术研习永久 +2，获得两张智慧之光。共鸣不增加研习或张数。',related:[{id:'mana',count:2,when:'倒数归零加入手牌'}]});
 update('temple',{tier:4,cost:3,count:2,text:'倒数 2：护符培育永久 +2，然后使全体友方永久 +3/+5（计入新共鸣）。',related:[]});
 update('hourglass',{text:'倒数 2：随机获得一个恰好高于当前酒馆 1 星的本局随从，最高 6 星。获得基础卡，共鸣不改变身材或星级。'});
 const rows=[
  ['fairyGlade','forest',2,2,2,'fairyGlade','获得两张妖精，其基础身材各额外获得护符共鸣。'],
  ['fairyRealm','forest',4,3,2,'fairyRealm','妖精军团永久 +3/+3。共鸣不增加军团成长。'],
  ['frontline','royal',3,3,2,'frontline','使每个友方皇家分别获得两次永久 +1/+2；每次均计入本局强化次数，并受护符共鸣增强。'],
  ['magicField','rune',4,3,2,'magicField','使所有友方巫师永久获得 +(4＋法术研习) 攻击、+2 生命；另计护符共鸣。'],
  ['dragonCanyon','dragon',5,3,3,'dragonCanyon','每有一个友方龙族，使本局酒馆永久 +2/+2；护符共鸣仅对总增益追加一次。没有龙族时无收益。'],
  ['deathBanquet','night',3,3,2,'deathBanquet','死灵军势永久 +3 攻击。共鸣不增加军势成长。'],
  ['boneRing','night',5,3,2,'boneRing','使最左侧友方死灵永久获得等同本局战斗入场次数一半（向下取整，至少 1）的攻击与生命；另计护符共鸣。'],
  ['bloodMoon','blood',4,3,2,'bloodMoon','依次执行三次：自伤 1；若实际受伤，为你的英雄恢复 1 生命。分别触发自伤收益；共鸣不增加伤害、治疗或次数。'],
  ['ancientAmplifier','artifact',4,3,2,'ancientAmplifier','使所有友方造物永久获得 +(3＋残骸的一半，向下取整)/+(3＋残骸的一半，向下取整)；另计护符共鸣。'],
  ['summit','haven',5,3,2,'summit','使最左侧友方主教永久获得等同其当前生命的攻击；另计护符共鸣。不增加生命或赋予屏障。']
 ];
 for(const [id,tribe,tier,cost,count,effect,text]of rows){const d={...I.cards[id],id,type:'amulet',tribe,poolTribe:tribe,tier,cost,count,effect,text:`倒数 ${count}：${text}`,attack:0,health:0,keywords:[]};D.amulets.push(d);D.byId[id]=d;}
 D.byId.fairyGlade.related=[{id:'fairy',count:2,when:'倒数归零加入手牌'}];
 const support={forest:'妖精的乐园提供手牌妖精支持连携，提泰妮娅的妖精乡强化妖精军团；两项收益分别由不同护符提供。',royal:'战场最前线使每名皇家获得两次强化，推进先锋与统帅的本局强化计数，不额外赋予屏障。',rune:'诺诺的秘密研究室培养研习并提供智慧之光，魔导力场把研习转为全体巫师的攻击。',dragon:'龙之卵提供稳定酒馆成长，龙之峡谷奖励龙族阵容密度；两者均可供吞噬体系使用。',night:'死灵之宴提高军势攻击，头骨戒指把累计战斗入场数转为最左侧死灵的永久身材。',blood:'血红之月分别执行三次自伤与回血，配合尤里乌斯、薇拉、恶夜魔羊及银锁的使徒；1 生命时不能触发。',artifact:'加速装置提供武装，古代增幅器把积累的残骸转为全队造物身材。',haven:'祈愿的烛台持续培育护符，峰顶的教会将最左侧主教的生命转为攻击；迦楼罗可重复护符效果，高阶牧师提供完整倒数的复制牌。'};
 for(const [tribe,text]of Object.entries(support))D.archetypes[tribe].support+=' '+text;
 D.amuletExpansionIds=rows.map(r=>r[0]);D.rulesVersion='16.0';return D;
}
root.TavernAmuletExpansion={apply};if(typeof module!=='undefined')module.exports={apply};
})(typeof globalThis!=='undefined'?globalThis:this);
