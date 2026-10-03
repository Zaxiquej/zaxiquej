(function(root){
'use strict';
function apply(D){
 const set=(id,fields,rule)=>Object.assign(D.byId[id],fields,{text:rule(1),goldenText:rule(2)});
 D.tribes.night.name='死灵';D.tribes.night.motto='行军 · 谢幕 · 复生';
 set('night2',{signature:'万骨之王'},m=>`复生。开战：获得等同「本局友方战斗入场数 × ${m}」的生命（仅本场）。`);
 set('night5',{effect:'undyingHounds',signature:'不息冥犬',related:[{id:'hound',count:1,attack:4,health:4,scale:true,reborn:true,when:'谢幕曲召唤'},{id:'coco',count:1,attack:4,health:4,scale:true,reborn:true,when:'谢幕曲召唤'}]},m=>`谢幕曲：召唤各一个 ${4*m}/${4*m}、拥有复生的米米与可可。`);
 set('night12',{attack:2,health:4,effect:'reborn',signature:'守墓不休'},m=>'复生：首次死亡后，以 1 生命重新入场。');
 set('night13',{tier:4,attack:4,health:6,effect:'legionLast',signature:'白骨军势'},m=>`谢幕曲：本局死灵军势永久 +${3*m} 攻击（强化所有当前及以后进入战斗的友方死灵）。`);
 set('night15',{attack:4,health:6,effect:'rebornGrant',signature:'招魂仪式'},m=>`开战：使最左侧 ${m} 名其他未拥有复生的友方死灵获得复生。`);
 set('night17',{effect:'legionEngine',signature:'死者行军'},m=>`每当一个友方随从在战斗中通过召唤、复生或复活入场，本局死灵军势永久 +${m} 攻击。`);
 set('night18',{effect:'marchArmy',signature:'幽想军团',related:[{id:'skeleton',count:2,dynamic:'march',when:'谢幕曲召唤'}]},m=>`谢幕曲：召唤两个骷髅士兵，各拥有「本局友方战斗入场数 × ${m}」的攻击与生命（至少 1）。`);
 D.archetypes.night={routes:[['亡者行军','骸骨兽、冥河引导者与复生冥犬制造连续入场；骨之贵公子与死骸勋爵永久增加死灵军势。骨骸王把累计入场转为生命，菲莉将计数变成终局召唤。',['night0','night12','night14','night13','night17','night18']],['墓场回魂','灵魂向导与安德雷斐斯积累墓场，赛蕾丝和暮光女皇消耗墓场养成阵容。唤灵少女、莫迪凯、奈芙蒂斯让核心与谢幕曲反复发挥作用。',['night8','night9','night15','night10','night16','night7']]],support:'命忒重奏谢幕曲；暗影收割者从友方死亡获得永久成长。两条路线共享召唤、复生与墓场；行军计数包含任何种族的战斗召唤，军势只强化死灵。'};
 D.necromancyRules='亡者行军：本局每有一个友方随从在战斗中通过召唤、复生或复活实际入场，累计 1 次，不限种族。开战初始阵容、备战打牌、加入手牌及满场失败的召唤不计；双方分别累计，跨回合保存。死灵军势：所有当前及以后进入战斗的友方死灵获得记录的额外攻击，不消耗计数；金色随从不额外翻倍，复生和复活不重复叠加同一份军势。';
 D.rulesVersion='14.0';return D;
}
root.TavernNecromancy={apply};if(typeof module!=='undefined')module.exports={apply};
})(typeof globalThis!=='undefined'?globalThis:this);
