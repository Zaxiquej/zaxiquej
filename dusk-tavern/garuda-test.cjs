'use strict';
const A=require('node:assert/strict'),E=require('./engine'),D=require('./data'),AI=require('./ai');
function state(){const s=E.create('angel',891,'hard',['haven','royal','forest','rune']);s.board=[];s.hand=[];s.amulets=[];s.tribe='haven';s.route=0;return s;}
function expire(s){s.amulets=[{...E.make(s,'fairyRealm'),count:1}];const c=E.make(s,'clock');s.hand.push(c);const r=E.act(s,'play',{uid:c.uid});A(r.ok,r.message);A(E.validate(s));}
for(const ga of [false,true])for(const gb of [false,true])for(const reversed of [false,true]){
 const s=state(),a=E.make(s,'haven18',{health:23,golden:ga}),b=E.make(s,'haven18',{health:31,golden:gb}),target=E.make(s,'haven0'),other=E.make(s,'neutral0');s.board=reversed?[b,target,a,other]:[a,target,b,other];const start=target.health,foreign=other.health,n=7*(ga?2:1)+10*(gb?2:1);
 for(let turn=1;turn<=3;turn++){expire(s);A.equal(a.health,23);A.equal(b.health,31);A.equal(target.health,start+n*turn);A.equal(other.health,foreign);}
}
console.log('PASS two normal/golden Garudas cannot grow each other; other bishops grow linearly regardless of order');
for(const golden of [false,true]){const s=state(),c=E.make(s,'haven18',{golden,health:23}),target=E.make(s,'haven0');s.board=[c,target,E.make(s,'neutral17',{golden:true})];const hp=target.health;expire(s);A.equal(target.health,hp+7*(golden?2:1));A.equal(c.health,23);A.equal(s.progress.prayers,1);A.equal(s.progress.fairy,18);A(E.scaling.formulaText(s,c,golden?D.byId.haven18.goldenText:D.byId.haven18.text).includes('+'+(7*(golden?2:1))+' 生命'));}
console.log('PASS solo Garuda preserves its payload and amulet echo does not duplicate the expiry trigger');
{const s=state(),a=E.make(s,'haven18'),b=E.make(s,'haven18',{golden:true});s.board=[a,b];s.amulets=[{...E.make(s,'fairyRealm'),count:1}];A.equal(AI.synergyValue(s,a),0);s.board.push(E.make(s,'haven0'));A(AI.synergyValue(s,a)>0);}
console.log('PASS AI no longer values a second Garuda as a health recipient; no AI games');
