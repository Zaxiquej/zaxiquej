(function(root){
'use strict';
function apply(D,I){
 // Keep the extra resolution on a separate generated card, so ordinary Growth is unchanged.
 const dessert={...D.byId.growth,id:'doubleGrowth',token:true,cost:0,buffRepeats:2,signature:'双重强化',text:'使一个友方随从永久 +2/+2，重复 2 次。',related:[]};
 D.tokens.push(dessert);D.byId[dessert.id]=dessert;
 const sweet=D.byId.rune14;
 sweet.text='备战结束：获得 2 张大自然的导引，其效果各结算两次。';
 sweet.goldenText='备战结束：获得 4 张大自然的导引，其效果各结算两次。';
 sweet.related=[{id:'doubleGrowth',count:2,scaleCount:true,when:'备战结束加入手牌 · 双重强化'}];
 const researcher={...I.cards.rune20,id:'rune20',type:'minion',tribe:'rune',tier:5,cost:3,attack:4,health:6,keywords:[],effect:'discoverHighSpell',discoverKind:'highSpell',synergy:true,signature:'禁忌秘典',text:'入场曲：发现一张 5～6 星酒馆法术。',goldenText:'入场曲：发现两张 5～6 星酒馆法术。',related:[{pool:'functionalDiscover',when:'从本局牌池的 5～6 星酒馆法术中发现'}]};
 D.cards.push(researcher);D.byId[researcher.id]=researcher;D.fanfareIds.push(researcher.id);D.abilityIds.fanfare.push(researcher.id);
 const previousPool=D.discoveryPool;
 D.discoveryPool=(s,d)=>d.discoverKind==='highSpell'?D.spells.filter(c=>!c.retired&&!c.token&&c.tier>=5&&c.tier<=6&&(c.poolTribes?c.poolTribes.some(t=>(s.activeTribes||D.tribeIds).includes(t)):(c.poolTribe||c.tribe)==='neutral'||(s.activeTribes||D.tribeIds).includes(c.poolTribe||c.tribe))):previousPool(s,d);
 D.archetypes.rune.support='远古炼金术师提供更多施法次数；甜点巫师的双重导引让每次强化分别受益于法术研习。禁忌的研究者发现高星法术，配合梅林扩散强化。';
}
root.TavernArcana={apply};if(typeof module!=='undefined')module.exports={apply};
})(typeof globalThis!=='undefined'?globalThis:this);
