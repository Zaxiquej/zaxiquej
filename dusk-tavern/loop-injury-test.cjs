'use strict';
const A=require('node:assert/strict'),E=require('./engine'),D=require('./data');
const fresh=()=>{const s=E.create('angel',894,'hard',['dragon','haven','royal','blood']);s.board=[];s.hand=[];s.amulets=[];return s;};
const quiet=(s,id,extra={})=>E.make(s,id,{attack:0,health:100,keywords:['cannotAttack'],...extra});
for(const golden of [false,true])for(const shield of [false,true]){
 const s=fresh(),m=golden?2:1,n=shield?2:3,c=quiet(s,'dragon13',{golden,dragonPings:3,keywords:shield?['cannotAttack','shield']:['cannotAttack']});
 const r=E.combat(s,[c],[]);A.equal(r.progress[0].tavernAttack,4*m*n);A.equal(r.progress[0].tavernHealth,6*m*n);A.equal(c.health,100);
 const fly=quiet(s,'dragon2',{golden,dragonPings:3}),trainer=quiet(s,'dragon4',{golden});const rr=E.combat(s,[fly,trainer],[]);
 A.deepEqual(rr.permanent[0][fly.uid],{attack:3*m,health:6*m});A.deepEqual(rr.permanent[0][trainer.uid],{attack:15*m,health:15*m});
 const dead=E.combat(s,[quiet(s,'dragon13',{health:1,dragonPings:1})],[]);A.equal(dead.progress[0].tavernAttack,0);
}
{
 const s=fresh(),fly=quiet(s,'dragon2',{dragonPings:3}),six=quiet(s,'dragon18');const r=E.combat(s,[fly,six],[]);
 // Six-star injury aura still uses entry health: (6 + 100/10), three times.
 A.deepEqual(r.permanent[0][fly.uid],{attack:51,health:102});A.equal(D.byId.dragon18.tier,6);A.equal(D.byId.dragon26.tier,4);
}
const audit=[];
for(const [name,id,taunt] of [['two golden foxes','haven4',false],['two golden guard healers','haven24',true]]){
 const s=fresh();s.board=[quiet(s,id,{golden:true,keywords:taunt?['taunt']:[]}),quiet(s,id,{golden:true,keywords:taunt?['taunt']:[]}),quiet(s,'neutral16',{golden:true,health:1})];
 const rounds=[];for(let i=0;i<3;i++){delete s.recruitEnded;E.endRecruit(s);rounds.push(s.board.slice(0,2).map(c=>c.health));A(E.validate(s));}
 A.deepEqual(rounds,id==='haven4'?[[100,100],[100,100],[100,100]]:[[496,496],[2476,2476],[12376,12376]]);
 audit.push({name,start:[100,100],endOfRounds:rounds});
}
{
 const s=fresh(),avatar=quiet(s,'haven16'),memory=quiet(s,'haven20'),r=E.combat(s,[avatar,memory],[]);
 A.deepEqual(r.permanent[0][avatar.uid],{attack:100,health:0});audit.push({name:'avatar + normal memory aura',startHealth:100,permanentHealth:100});
}
{
 const s=fresh(),a=quiet(s,'royal24'),b=quiet(s,'royal24'),w=quiet(s,'royal23');s.board=[a,b,w];const spell=E.make(s,'growth');s.hand=[spell];A(E.act(s,'play',{uid:spell.uid,target:a.uid}).ok);A(E.validate(s));A(s.board.every(c=>c.health<110));
}
for(const golden of [false,true])for(const reversed of [false,true]){
 const s=fresh(),m=golden?2:1,fox=quiet(s,'haven4',{golden}),fox2=quiet(s,'haven4',{health:80}),guard=quiet(s,'haven0',{health:10,keywords:['taunt']}),foreign=quiet(s,'neutral0',{health:10,keywords:['taunt']}),echo=quiet(s,'neutral16',{golden:true,health:1});
 s.board=reversed?[echo,foreign,guard,fox2,fox]:[fox,fox2,guard,foreign,echo];E.endRecruit(s);
 A.equal(fox.health,100);A.equal(fox2.health,80);A.equal(guard.health,10+3*(27*m+22));A.equal(foreign.health,10);
}
for(const golden of [false,true])for(const reversed of [false,true]){
 const s=fresh(),m=golden?2:1,fox=quiet(s,'haven4'),guard=quiet(s,'haven24',{golden,health:10,keywords:['taunt']}),foreign=quiet(s,'neutral0',{health:10,keywords:['taunt']}),echo=quiet(s,'neutral16',{golden:true,health:1});
 s.board=reversed?[echo,foreign,guard,fox]:[fox,guard,foreign,echo];const frames=E.endRecruit(s,true);
 A.equal(guard.health,10+81+99*m);A.equal(foreign.health,10+99*m);A.equal(fox.health,100);
 A(frames.every(f=>f.state.guardVitalsBaseHealth===100));for(const f of frames)A(E.scaling.formulaText(f.state,guard,D.byId.haven24.text).includes('+'+33*m+' 生命'));
 A.equal(s.guardVitalsBaseHealth,undefined);A(E.validate(E.normalize(E.copy(s))));const before=guard.health;delete s.recruitEnded;E.endRecruit(s);A.equal(guard.health,before+81+3*Math.floor(before/3)*m);
}
console.log(JSON.stringify(audit,null,2));console.log('PASS injury buffs, unchanged six-star aura, fox same-effect exclusion, shared guard snapshot across repeats/order, animation preview, next-round rebasing and no recursive royal buffs. No AI games.');
