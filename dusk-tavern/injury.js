(function(root){
'use strict';
function apply(D,I){
 const set=(id,fields,rule)=>Object.assign(D.byId[id],fields,{text:rule(1),goldenText:rule(2)});
 D.cynthiaCombo=8;
 set('forest4',{},m=>`连携：其他友方妖精族随从永久 +${D.cynthiaCombo*m}/+${D.cynthiaCombo*m}。`);
 set('dragon16',{},m=>`每次攻击后若存活，使相邻友方龙族永久 +${3*m}/+${6*m}，随后分别对其造成 ${m} 次 1 点伤害。`);
 set('blood12',{effect:'pactPainGift'},m=>`入场曲：自伤 1；成功后获得 ${m} 张鲜血的吻唇。`);
 const unit={...I.cards.dragon19,id:'dragon19',type:'minion',tribe:'dragon',tier:3,cost:3,attack:4,health:4,keywords:[],effect:'wingGift',synergy:true,text:'入场曲：获得一张龙之翼击。',goldenText:'入场曲：获得两张龙之翼击。',related:[{id:'dragonWing',count:1,scaleCount:true,when:'入场曲加入手牌'}]};
 D.cards.push(unit);D.byId[unit.id]=unit;D.fanfareIds.push(unit.id);
 const spells=[
  {...I.cards.dragonWing,id:'dragonWing',tribe:'dragon',effect:'dragonWing',tier:3,cost:1,target:true,attack:2,health:2,text:'使一个友方随从永久 +2/+2。下一场战斗开始时，对其造成三次 1 点伤害；多张可累积，受伤后存活才触发受伤效果。'},
  {...I.cards.bloodContract,id:'bloodContract',tribe:'blood',effect:'bloodContract',tier:3,cost:2,target:false,attack:0,health:0,purchaseSelfHarm:2,text:'购买时：自伤 2（最低保留 1 生命）。使用时：获得两张鲜血的吻唇。生成的吻唇不触发购买自伤。',related:[{id:'bloodPact',count:2,when:'使用后加入手牌'}]}
 ];
 for(const c of spells){c.type='spell';c.keywords=[];D.spells.push(c);D.byId[c.id]=c;}
 D.archetypes.dragon.routes[0]=['受伤育龙','半龙人魔法师提供龙之翼击，指定下场受伤对象；火焰蜥蜴开战点燃，龙技达人攻击后持续刺激相邻龙族。驯龙师与勒哈布养成战场，赤怒蛇把受伤转成酒馆成长。',['dragon19','dragonWing','dragon3','dragon16','dragon4','dragon13','dragon18','dragon5']];
 D.archetypes.blood.support='蠢动的恶鬼与莉莉姆提供入场自伤；购买鲜血的吻唇、血之契约也会自伤。恶夜魔羊在实际失血后治疗，1 生命时不会空触发。血之契约只生成法术，不返还金币。';
 D.rulesVersion='12.1';return D;
}
root.TavernInjury={apply};if(typeof module!=='undefined')module.exports={apply};
})(typeof globalThis!=='undefined'?globalThis:this);
