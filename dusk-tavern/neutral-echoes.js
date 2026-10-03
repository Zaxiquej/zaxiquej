(function(root){
'use strict';
function apply(D,I){
 const set=(id,fields,rule)=>Object.assign(D.byId[id],fields,{text:rule(1),goldenText:rule(2)});
 const rows=[
  ['neutral14',5,4,6,'fanfareEcho','诡计重奏',m=>`其他友方随从的入场曲额外触发 ${m} 次。`],
  ['neutral15',5,3,7,'lastWordsEcho','命运回响',m=>`其他友方随从的谢幕曲额外触发 ${m} 次。`],
  ['neutral16',5,4,8,'endEcho','时序回响',m=>`其他友方随从的备战结束效果额外触发 ${m} 次。`],
  ['neutral17',6,7,12,'prayerEcho','圣物回响',m=>`己方护符倒数归零时，额外结算 ${m} 次该护符效果。`]
 ];
 for(const [id,tier,attack,health,effect,signature,rule]of rows){const c={...I.cards[id],id,type:'minion',tribe:'neutral',tier,cost:3,attack,health,effect,signature,keywords:[],text:rule(1),goldenText:rule(2)};D.cards.push(c);D.byId[id]=c;}
 set('royal3',{attack:5,health:7,effect:'royalDrill',signature:'军团整训'},m=>`每当你打出其他皇家随从，使其永久获得「4 + 本局强化次数÷10」× ${m} 攻击与生命（向下取整）。`);
 set('night4',{effect:'rebirthLegion',signature:'灵魂归阵'},m=>`每当其他友方随从在战斗中成功复生或复活，本局死灵军势永久 +${3*m} 攻击。普通召唤不触发。`);
 set('haven18',{effect:'healthReliquary',signature:'圣翼赐福'},m=>`每当己方护符倒数归零，使其他友方主教永久获得「本随从生命 × ${m}」生命。`);
 const royal=D.heroes.find(h=>h.id==='royal');royal.tribe='neutral';
 D.archetypes.royal.routes[1][1]='白银将军按本局强化次数培养新打出的皇家，亚瑟将入场曲转为全队成长；罗兰与榭莉亚读取累计强化次数。通用入场曲复读由中立洛基提供。';
 D.archetypes.night.support='命忒将成功复生、复活转为额外死灵军势；暗影收割者从友方死亡获得永久成长。中立乌尔德提供通用谢幕曲复读，军势只强化死灵。';
 D.archetypes.haven.routes[0][1]='护符培育与倒数积累永久身材，迦楼罗将自身生命给予其他主教，天狐读取自身生命继续培育队友，峰顶的教会把高生命转为攻击。';
 D.archetypes.haven.support+='中立撒哈利尔重复护符效果，倒数归零的共鸣计数、复制及随从响应仍只触发一次。';
 D.archetypes.night.routes[1][2].push('night4');
 D.neutralEchoIds=rows.map(r=>r[0]);D.echoRules='通用复读集中于中立：洛基增加入场曲次数，乌尔德增加谢幕曲次数，柯罗诺斯增加随从备战结束效果次数，撒哈利尔增加护符效果次数。多个普通或金色来源的额外次数相加，不相乘；费用与空位按每次实际结算检查。备战按随从从左到右逐次结算，护符倒数每回合只自然推进一次。';
 return D;
}
root.TavernNeutralEchoes={apply};if(typeof module!=='undefined')module.exports={apply};
})(typeof globalThis!=='undefined'?globalThis:this);
