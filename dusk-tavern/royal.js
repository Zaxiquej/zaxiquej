(function(root){
'use strict';
function apply(D){
 const set=(id,fields,rule)=>{Object.assign(D.byId[id],fields,{text:rule(1),goldenText:rule(2)});};
 set('royal9',{effect:'buffVanguard'},m=>`守护。战斗开始：本局每完成 5 次属性强化，自身获得 +${m}/+${m}（仅限本场战斗）。`);
 set('royal18',{tier:6,effect:'buffCommander'},m=>`回合结束：本局每完成 20 次属性强化，使其他皇家护卫永久获得 +${m}/+${m}（触发时统一计算）。`);
 set('royal17',{},m=>`回合结束：每有一层友方屏障，使所有皇家护卫永久 +${2*m}/+${2*m}。`);
 set('royal15',{},m=>`复仇（2）：为${m===1?'另一名':'至多两名其他'}皇家护卫叠加 1 层屏障，优先选择层数较少者。`);
 set('royal7',{},m=>`屏障。战斗开始：使其他皇家护卫获得 +${8*m}/+${8*m}，并叠加 ${m} 层屏障。`);
 D.byId.shield.text='使一个友方获得 1 层屏障。皇家护卫的屏障可以叠加；每次抵挡伤害只消耗 1 层。';
 for(const key of ['text','goldenText'])D.byId.neutral5[key]=D.byId.neutral5[key].replace('摧毁所有敌方屏障','移除敌方所有屏障（每名随从触发一次破盾）');
 D.archetypes.royal.routes=[
  ['层叠屏障','旗手的法术、白银圣骑士与乙姬可叠盾；莉夏按层数养成，艾蜜莉亚将每次破盾转为全队永久强化。阿尔贝尔负责收割。',['royal13','royal15','royal17','royal6','royal7','royal5']],
  ['强化军团','玛尔斯与亚瑟通过入场曲积累强化次数，将军负责重奏。罗兰按累计次数获得战斗身材，六星榭莉亚把次数转为每回合的全队成长。瓦路兹保留法术研习支线。',['royal14','royal3','royal10','royal9','royal18','royal16']]
 ];
 D.rulesVersion='11.0';return D;
}
root.TavernRoyal={apply};if(typeof module!=='undefined')module.exports={apply};
})(typeof globalThis!=='undefined'?globalThis:this);
