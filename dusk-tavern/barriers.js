(function(root){
'use strict';
function apply(D){
 const set=(id,fields,rule)=>Object.assign(D.byId[id],fields,{text:rule(1),goldenText:rule(2)});
 set('royal2',{attack:4,health:8,effect:'layeredGuard',keywords:['taunt','shield'],stackShield:true,signature:'层叠壁垒'},()=> '守护。屏障。自身的屏障可以叠加；每层分别抵挡一次伤害。');
 set('royal12',{tier:3,attack:3,health:5,effect:'shieldMentor',signature:'破盾援护'},m=>`每当其他友方随从失去一层屏障，使其永久 +${2*m}/+${2*m}。`);
 set('royal14',{effect:'shieldChampion',signature:'不屈战意'},m=>`每当友方随从失去一层屏障，自身永久 +${4*m}/+${4*m}。`);
 set('royal16',{effect:'shieldResearch',signature:'魔导回收'},m=>`每当友方随从失去一层屏障，本局法术研习永久 +${2*m}。`);
 set('royal0',{},m=>`屏障。自身失去一层屏障时，永久 +${m}/+${m}。`);
 set('royal6',{},m=>`每当友方随从失去一层屏障，所有存活的友方皇家永久 +${2*m}/+${2*m}。`);
 set('royal15',{},m=>`复仇（2）：为${m===1?'另一名':'至多两名其他'}皇家随从补充 1 层屏障，优先无屏障者。已有屏障且不能叠加的随从不会被选中。`);
 set('royal7',{},m=>`屏障。开战：其他皇家护卫获得 +${8*m}/+${8*m}；仅相邻友方皇家获得屏障${m>1?'（可叠盾随从获得 2 层）':''}。`);
 D.byId.shield.text='使一个友方获得屏障。仅具有叠盾能力的随从能保留多层屏障。';
 D.fanfareIds=D.fanfareIds.filter(id=>!['royal12','royal16'].includes(id));D.abilityIds.fanfare=[...D.fanfareIds];
 D.archetypes.royal.routes=[['屏障轮转','守护骑士是能叠盾的专门承载者。白银圣骑士与乙姬补盾，阿尔贝尔击杀后自补盾；剑术教官养失盾队友，玛尔斯成长自身，瓦路兹培养法术，艾蜜莉亚强化皇家全队。',['royal2','royal12','royal14','royal16','royal15','royal6','royal7','royal5']],['强化军团','勇猛的骑士与入场曲随从积累强化次数，白银将军重奏，亚瑟将入场曲转为全队成长。罗兰与榭莉亚读取累计强化次数，莉夏利用现有屏障养成。',['royal1','royal8','royal3','royal10','royal9','royal18','royal19','royal17']]];
 D.archetypes.royal.support='叠盾不是皇家种族被动，当前仅守护骑士拥有。失去屏障的触发可以由其他种族提供；一次移除全部屏障仍只触发一次。勇战旗手提供武装强化与守护，法术研习增强后续法术。';
 D.barrierIds=['royal2','royal12','royal14','royal16','royal0','royal6','royal15','royal7'];return D;
}
root.TavernBarriers={apply};if(typeof module!=='undefined')module.exports={apply};
})(typeof globalThis!=='undefined'?globalThis:this);
