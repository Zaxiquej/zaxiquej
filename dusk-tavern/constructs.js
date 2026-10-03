(function(root){
'use strict';
function apply(D,I){
 const rows=[
 ['mysticArtifact',2,5,'','taunt',m=>'守护。衍生随从。'],
 ['radiantArtifact',4,1,'radiantLast','',m=>`谢幕曲：对随机敌方造成自身攻击 × ${m} 的伤害。`],
 ['bifurcatingArtifact',2,2,'reborn','',m=>'复生：首次死亡后以 1 生命复活。'],
 ['spinariaArtifact',1,3,'researchLast','',m=>`谢幕曲：武装研习永久 +${3*m}（提高后续武装品质，不获得手牌）。`]
 ];
 for(const [id,attack,health,effect,keyword,rule] of rows){const c={...I.cards[id],id,type:'minion',tribe:'artifact',tier:1,cost:3,attack,health,effect,keywords:keyword?[keyword]:[],token:true,text:rule(1),goldenText:rule(2)};D.tokens.push(c);D.byId[id]=c;}
 D.constructCycle=['analyzer','mysticArtifact','bifurcatingArtifact','spinariaArtifact','ancientArtifact','radiantArtifact'];
 Object.assign(D.byId.ancientArtifact,{effect:'double',text:'连击：每次行动攻击两次。',goldenText:'连击：每次行动攻击两次。'});
 Object.assign(D.byId.artifact8,{effect:'replicaGift',text:'入场曲：获得一张增殖的创造物。',goldenText:'入场曲：获得两张增殖的创造物。',related:[{id:'bifurcatingArtifact',count:1,scaleCount:true,when:'入场曲加入手牌'}]});
 Object.assign(D.byId.artifact16,{effect:'constructPair',text:'谢幕曲：召唤一个 2/5 神秘的创造物和一个 1/3 丝碧涅的创造物。',goldenText:'谢幕曲：召唤一个 4/10 神秘的创造物和一个 2/6 丝碧涅的创造物。',related:[{id:'mysticArtifact',count:1,scale:true,when:'谢幕曲召唤'},{id:'spinariaArtifact',count:1,scale:true,when:'谢幕曲召唤'}]});delete D.byId.artifact16.brood;
 const crown=D.byId.artifact18;crown.text='谢幕曲：召唤绚烂的创造物与神秘的创造物，各获得「本随从一半攻击 / 最大生命 + 当前残骸」的身材（向下取整）。';crown.goldenText='谢幕曲：召唤绚烂的创造物与神秘的创造物，各获得「本随从一半攻击 / 最大生命 + 当前残骸」× 2 的身材（先向下取整）。';crown.related=['radiantArtifact','mysticArtifact'].map(id=>({id,count:1,inherit:true,scale:true,when:'谢幕曲召唤'}));
 const changes=[
 ['royal','战术重奏',1,false,8,'本回合你下一个随从的入场曲额外触发一次。'],
 ['roland','不灭阵线',1,true,18,'使一个友方永久获得 +4 生命与守护。'],
 ['forte','突袭指令',1,true,10,'使一个友方仅在下一场战斗获得连击（每次行动攻击两次，不与已有连击叠加）。'],
 ['snow','镜中重生',2,true,10,'使一个友方仅在下一场战斗获得复生：首次死亡后以 1 生命复活。不与已有复生叠加。'],
 ['angel','圣疗祈愿',1,false,18,'为英雄恢复 4 生命；使用时若已满血，改为获得 2 护甲。'],
 ['deus','创造物编织',1,false,12,'获得当前轮换的创造物，然后切换到下一种。顺序：解析、神秘、增殖、丝碧涅、古老、绚烂。']
 ];
 D.heroReworks=[];for(const [id,power,cost,target,armor,text]of changes){const h=D.heroes.find(h=>h.id===id);D.heroReworks.push({id,name:h.name,before:h.text,after:text});Object.assign(h,{power,cost,target,armor,text,subtitle:text,related:[]});}
 D.heroes.find(h=>h.id==='deus').related=D.constructCycle.map(id=>({id,count:1,when:'按技能轮换顺序加入手牌'}));
 D.archetypes.artifact.routes[1]=['残骸重构','古老负责连击，神秘负责守护，绚烂负责谢幕炮击，增殖提供复生次数，丝碧涅培养武装。机械犬、米莉亚姆、史学家与神伟的遗物分别供给不同创造物。',['artifact1','artifact8','artifact16','artifact4','artifact18','artifact9','artifact7','artifact5']];
 D.rulesVersion='10.0';return D;
}
root.TavernConstructs={apply};if(typeof module!=='undefined')module.exports={apply};
})(typeof globalThis!=='undefined'?globalThis:this);
