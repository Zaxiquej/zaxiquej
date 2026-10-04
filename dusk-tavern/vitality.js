(function(root){
'use strict';
function apply(D){
 const set=(id,fields,rule)=>Object.assign(D.byId[id],fields,{text:rule(1),goldenText:rule(2)});
 set('haven3',{effect:'guardWitness',signature:'守护援护'},m=>`每当其他友方守护受到攻击后，使生命最低的友方主教永久 +${2*m}/+${4*m}。只强化存活随从；技能伤害不触发。`);
 set('haven4',{effect:'healthChoir',signature:'生命祝福'},m=>`备战结束：使其他友方主教永久获得「2 + 自身生命÷4」× ${m} 生命（向下取整）。`);
 set('haven8',{effect:'lifeNurse',signature:'生命培育'},m=>`备战结束：使生命最低的其他友方主教永久 +${3*m} 生命。`);
 set('haven12',{effect:'guardNurse',signature:'圣护祷告'},m=>`每当你放置护符，使最左侧其他友方主教永久 +${3*m} 生命，并赋予守护。`);
 set('haven16',{effect:'healthAvatar',keywords:['taunt'],signature:'生命化身'},m=>`守护。开战：获得等同自身当时生命 × ${m} 的攻击与生命（仅本场）。`);
 set('dragon8',{effect:'bodyVitality',signature:'龙脉滋养'},m=>`备战结束：若自身生命至少为 10，使最左侧其他友方龙族永久 +${2*m}/+${4*m}。`);
 set('blood5',{effect:'bloodEdge',signature:'绯色锋刃'},m=>`攻击对主目标造成未被屏障阻挡的伤害后，若自身存活，永久 +${2*m}/+${2*m}。`);
 set('neutral7',{effect:'vitalityCry'},m=>`入场曲：相邻友方随从永久 +${3*m} 生命。`);
 Object.assign(D.byId.rest,{effect:'buff',attack:0,health:5,target:true,text:'使一个友方随从永久 +5 生命。受法术研习增强。'});
 Object.assign(D.byId.bell,{text:'倒数 2：所有友方随从永久 +3 生命。受护符共鸣增强。'});
 Object.assign(D.byId.bloodMoon,{tier:3,cost:2,text:'倒数 2：依次自伤 1，共三次。每次实际受伤后，使生命最低的友方吸血鬼永久 +2 生命（受共鸣增强）。'});
 D.byId.dragonResolve.text='抉择：使本局酒馆永久 +3/+3；或使所有友方龙族永久 +6 生命。两项属性增益均受法术研习增强。';
 // Keep the old option ID so saves waiting on this modal remain loadable.
 D.byId.dragonResolve.modes[1]={id:'heal',name:'龙鳞护体',kind:'tribeBuff',tribe:'dragon',attack:0,health:6,spellAmp:true};
 const angel=D.heroes.find(h=>h.id==='angel');Object.assign(angel,{power:'圣堂庇护',target:true,armor:16,text:'使一个友方随从永久 +1/+5。'});angel.subtitle=angel.text;
 const ceres=D.heroes.find(h=>h.id==='ceres');ceres.text='消耗 3 墓场，使一个友方随从永久 +5/+5。';ceres.subtitle=ceres.text;
 D.tribes.haven.motto='护符 · 生命 · 守护';
 D.archetypes.haven={routes:[['护符生命','护符培育与倒数为全队积累永久身材；天狐读取自身生命继续培育其他主教，峰顶的教会把高生命转为攻击。',['haven13','haven5','haven4','haven10','haven17','haven18']],['守护传承','兔耳治愈师培育生命，圣护的女修士定向赋予守护；光棱牧师在守护受攻击后提供永久成长，魔神像按自身生命同时增加战斗攻击与生命，贞德与勒碧丝传递身材。',['haven8','haven12','haven2','haven3','haven16','haven6','haven7']]],support:'圣女智者与见习修女加速倒数；祈愿的烛台培养共鸣。生命指随从生命，守护援护可以由其他种族的守护触发；主教不再提供英雄回血或过量治疗收益。'};
 D.archetypes.blood.support=D.archetypes.blood.support.replace('分别执行三次自伤与回血','分别执行三次自伤并培育吸血鬼生命');
 D.endRecruitEffects=D.endRecruitEffects.filter(e=>!['bodyMend','heroMend','prayerHealer'].includes(e));D.endRecruitEffects.push('bodyVitality','lifeNurse','healthChoir');D.abilityIds.endRecruit=D.cards.filter(c=>D.endRecruitEffects.includes(c.effect)).map(c=>c.id);
 D.vitalityIds=['haven3','haven4','haven8','haven12','haven16','dragon8','blood5','neutral7','rest','bell','bloodMoon','dragonResolve'];D.rulesVersion='18.0';return D;
}
root.TavernVitality={apply};if(typeof module!=='undefined')module.exports={apply};
})(typeof globalThis!=='undefined'?globalThis:this);
