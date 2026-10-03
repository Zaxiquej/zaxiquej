(function(root){
'use strict';
function apply(D,I){
 const rows=[
 ['goblin','neutral0','零钱储蓄',1,false,14,'下回合开始时额外获得 2 金币。'],
 ['angel','neutral1','天使祝福',1,true,22,'使一个友方永久获得 +4 生命。'],
 ['windgod','neutral2','风之号令',2,false,12,'全体友方永久获得 +2 攻击。'],
 ['athena','neutral3','神盾庇护',2,true,16,'使一个友方永久获得 +4 生命与屏障。'],
 ['olivia','neutral4','暗翼研习',1,false,4,'本局法术研习 +1，永久提高后续法术的非零属性增益。'],
 ['bahamut','neutral5','巨龙威势',2,true,8,'使一个友方永久获得「酒馆星级 × 2」攻击与「酒馆星级」生命。']
 ];
 for(const [id,source,power,cost,target,armor,text] of rows)D.heroes.push({...I.cards[source],id,tribe:'neutral',power,cost,target,armor,text,subtitle:text});
 const armor={forest:2,royal:12,dragon:10,night:14,rune:12,haven:8,blood:10,artifact:6,aria:8,roland:18,forte:16,ceres:14,dorothy:4,snow:14,medusa:6,deus:8};
 for(const h of D.heroes)if(armor[h.id]!==undefined)h.armor=armor[h.id];
 D.rulesVersion='8.0';return D;
}
root.TavernHeroes={apply};if(typeof module!=='undefined')module.exports={apply};
})(typeof globalThis!=='undefined'?globalThis:this);
