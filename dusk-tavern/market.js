(function(root){
'use strict';
function apply(D){
 const set=(id,fields,rule)=>Object.assign(D.byId[id],fields,{text:rule(1),goldenText:rule(2)});
 set('dragon1',{effect:'tavernLast'},m=>`谢幕曲：本局酒馆随从永久 +${m}/+${m}。战后更新当前商店。`);
 set('dragon8',{effect:'bodyMend'},m=>`备战结束：若本随从生命至少为 10，为英雄恢复 ${4*m} 生命。`);
 set('dragon9',{},m=>`连击。每次攻击后若存活，永久获得「2 + 入场时生命÷10」× ${m} 攻击（向下取整）。`);
 set('dragon11',{attack:2,health:2,effect:'shopCry'},m=>`入场曲：当前商店中的随从 +${m}/+${m}（不影响后续刷新）。`);
 set('dragon12',{tier:3,effect:'tavernSupply'},m=>`备战结束：获得 ${m} 张龙之启示。`);
 set('dragon13',{effect:'tavernFury'},m=>`每当自身受到伤害并存活，本局酒馆随从永久 +${2*m}/+${3*m}。战后更新当前商店。`);
 set('dragon14',{effect:'tavernCry'},m=>`入场曲：本局酒馆随从永久 +${2*m}/+${2*m}。`);
 set('dragon15',{effect:'tavernPlay'},m=>`每当你打出一个龙族随从，本局酒馆随从永久 +${2*m}/+${2*m}（包括自身）。`);
 set('dragon17',{effect:'dragonFeast'},m=>`备战结束：吞噬商店中生命最高的随从，使相邻友方龙族永久获得其攻击与生命 × ${m}。没有相邻龙族时不吞噬。`);
 set('dragon18',{},m=>`每当友方龙族受到伤害并存活，使其永久获得「6 + 入场时生命÷10」× ${m} 攻击，以及两倍该数值的生命（向下取整）。`);
 set('blood13',{tier:3,attack:3,health:5,effect:'bloodTavern'},m=>`每次招募自伤成功后，本局酒馆随从永久 +${m}/+${m}。`);
 set('blood9',{tier:5,effect:'bloodFeast'},m=>`备战结束：若有可吞噬的随从，自伤 2；成功后吞噬商店中攻击最高的随从，自身永久获得其攻击与生命 × ${m}。`);
 Object.assign(D.byId.dragon,{tier:2,cost:2,effect:'tavernSpell',attack:0,health:0,target:false,text:'使本局酒馆随从永久 +2/+2。当前与未来刷新的随从均受益，法术研习可提高数值。'});
 Object.assign(D.heroes.find(h=>h.id==='dragon'),{power:'龙巢培育',cost:1,armor:10,target:false,text:'使本局酒馆随从永久 +1/+1。',subtitle:'使当前与未来的商店随从成长。'});
 D.archetypes.dragon.routes=[
  ['受伤育龙','火焰蜥蜴与守护随从创造受伤机会；驯龙师与勒哈布养成战场，赤怒蛇把受伤转成酒馆成长。购入养大的龙族后，入场生命继续提高收益。',['dragon3','dragon2','dragon4','dragon13','dragon18','dragon5']],
  ['酒馆吞噬','召唤师强化当前商店，艾拉与织术师养大整局酒馆，玛蒂达提供龙之启示。元祖驭龙使吞噬高生命货物喂养相邻龙族，海德拉与法夫纳承接大身材。',['dragon11','dragon1','dragon14','dragon15','dragon12','dragon17','dragon6','dragon7']]
 ];
 D.archetypes.dragon.support='酒馆成长作用于商店中的所有种族。冻结保留当前强化；吞噬移除货物，不花金币、不返资源，也不触发被吞噬牌的效果。';
 D.archetypes.blood.routes[0]=['自伤与吞噬','尤里乌斯与薇拉把自伤转成全队成长，恶夜魔羊负责治疗。银锁的使徒以自伤培养酒馆，血腥玛丽吞噬商店随从养大自身，可借用龙族酒馆成长。',['blood1','blood4','blood18','blood11','blood13','blood9','blood7']];
 D.rulesVersion='12.0';return D;
}
root.TavernMarket={apply};if(typeof module!=='undefined')module.exports={apply};
})(typeof globalThis!=='undefined'?globalThis:this);
