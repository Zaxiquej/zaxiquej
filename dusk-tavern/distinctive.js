(function(root){
'use strict';
function apply(D){
 const set=(id,fields,rule)=>Object.assign(D.byId[id],fields,{text:rule(1),goldenText:rule(2)});
 set('artifact9',{effect:'artifactHunter',signature:'残骸突击'},m=>`攻击时无视守护，优先攻击可被选中的攻击力最高的敌方。开战：获得「本局残骸 × ${m}」攻击（仅本场）。`);
 set('dragon10',{effect:'tavernLegacy',signature:'龙骸沃土'},m=>`谢幕曲：酒馆随从永久获得「本随从攻击与最大生命各八分之一 × ${m}」（先向下取整）。`);
 set('blood19',{effect:'batAvenge',signature:'血裔再临',related:[{id:'bat',count:1,dynamic:'blood',when:'复仇（2）召唤'}]},m=>`复仇（2）：召唤一个蝙蝠，基础攻击和生命均为「（4 + 本局累计自伤）× ${m}」，再获得蝙蝠军团加成。`);
 D.lastWordEffects=D.lastWordEffects.filter(e=>!['dragonLegacy','batCrown'].includes(e));D.lastWordEffects.push('tavernLegacy');
 D.abilityIds.lastWords=D.cards.filter(c=>D.lastWordEffects.includes(c.effect)||c.id==='dragon1').map(c=>c.id);
 D.archetypes.artifact.routes[1][1]+='纱妃拉用残骸提高攻击，绕过守护突击敌方高攻击随从。';
 D.archetypes.dragon.routes[1][1]+='贾巴沃克将养成的身材转为永久酒馆肥料，后续购买与吞噬继续受益。';
 D.archetypes.dragon.routes[1][2].push('dragon10');
 D.archetypes.blood.routes[1][1]='拜特、午夜吸血鬼与斑比提供前中期战斗召唤，瓦妮亚负责永久成长，女王把蝙蝠攻击变成炮击。暗夜公主·斑比通过复仇反复召唤大蝙蝠，身材取决于本局累计自伤。';
 D.distinctiveIds=['artifact9','dragon10','blood19'];return D;
}
root.TavernDistinctive={apply};if(typeof module!=='undefined')module.exports={apply};
})(typeof globalThis!=='undefined'?globalThis:this);
