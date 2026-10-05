'use strict';
const A=require('node:assert/strict'),E=require('./engine'),D=require('./data');
const quiet=(s,id,extra={})=>E.make(s,id,{attack:0,health:100,keywords:['cannotAttack'],...extra});
for(const golden of [false,true]){
 const s=E.create('night',73,'hard',['night','forest','royal','dragon']),m=golden?2:1;
 const enemies=[100,60,20].map(attack=>quiet(s,'neutral0',{attack,keywords:['cannotAttack','shield']}));
 const r=E.combat(s,[quiet(s,'night6',{golden,health:1,dragonPings:1})],enemies);
 A.equal(r.events.filter(e=>e.text.includes('魔眼终幕')).length,1);
 enemies.forEach((c,i)=>{const actual=r.survivors[1].find(x=>x.uid===c.uid);A(actual);A.equal(actual.health,i<m?1:100);A(actual.keywords.includes('shield'),'no incidental shield removal');});
 A(!(golden?D.byId.night6.goldenText:D.byId.night6.text).includes('造成'));
 const source=quiet(s,'night15',{golden}),already=quiet(s,'neutral0',{heroReborn:true}),targets=[0,1,2].map(()=>quiet(s,'neutral0'));
 const revived=E.combat(s,[already,source,...targets],[quiet(s,'neutral0')]);
 A.equal(revived.events.filter(e=>e.text.includes('招魂仪式')).length,m);
 const board=revived.survivors[0];A(board.find(c=>c.uid===already.uid).reborn);A(!board.find(c=>c.uid===source.uid).reborn);
 targets.forEach((c,i)=>A.equal(!!board.find(x=>x.uid===c.uid).reborn,i<m));
 A((golden?D.byId.night15.goldenText:D.byId.night15.text).includes('最左侧 '+m+' 名'));
}
A.equal(D.byId.night15.tier,4);
console.log('PASS Balor only sets highest-attack enemy health (normal/golden), preserves other health and shields; reborn grants 1/2 leftmost eligible allies, excludes self/existing reborn.');
