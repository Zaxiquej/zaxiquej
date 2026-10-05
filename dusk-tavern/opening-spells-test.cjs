'use strict';
const A=require('node:assert/strict'),E=require('./engine'),D=require('./data'),AI=require('./ai');
const fresh=()=>E.create('angel',1723,'hard',['forest','royal','rune','haven']);
const play=(s,id,extra={},target)=>{const c=E.make(s,id,extra);s.hand.push(c);A(E.act(s,'play',{uid:c.uid,target:target?.uid}).ok,id);return c;};
const expected=['growth','guard','marketMeal','coin','rest','recruitNovice'];
A.deepEqual(D.spells.filter(d=>d.tier===1&&d.tribe==='neutral').map(d=>d.id).sort(),expected.sort());
for(let a=0;a<5;a++)for(let b=a+1;b<6;b++)for(let c=b+1;c<7;c++)for(let d=c+1;d<8;d++){
 const s=E.create('angel',123+a*100+b*10+c+d,'hard',[a,b,c,d].map(i=>D.tribeIds[i])),pool=E.pool(s,D.spells).filter(d=>d.tier===1);
 A(expected.every(id=>pool.some(d=>d.id===id)));A.equal(pool.filter(d=>d.effect==='randomRecruit').length,1);A(pool.length>=6);A(!s.shop.some(c=>c.id==='mana'));
}
A(D.byId.mana.token);A.equal(D.byId.mana.cost,0);A(D.tokens.includes(D.byId.mana));A(!D.spells.includes(D.byId.mana));
for(const id of expected.filter(id=>id!=='recruitNovice'))A.equal(D.byId[id].cost,1);
A.equal(D.byId.rich.tier,2);A.equal(D.byId.rich.cost,1);A(D.spells.includes(D.byId.coin));A(!D.tokens.includes(D.byId.coin));
{
 const s=fresh(),coin=E.make(s,'coin');s.shop=[coin];const gold=s.gold;A(E.act(s,'buy',{uid:coin.uid}).ok);A.equal(s.gold,gold-1);A(E.act(s,'play',{uid:coin.uid}).ok);A.equal(s.gold,gold);A.equal(s.shop.length,0);play(s,'coin');A.equal(s.gold,gold+1,'generated coins remain free to play');
}
for(const amp of [0,4]){
 const s=fresh(),target=E.make(s,'neutral0');s.board=[target];s.progress.spellcraft=amp;const atk=target.attack,hp=target.health;const view=E.scaling.spellView(s,D.byId.guard);play(s,'guard',{},target);A.equal(target.attack,atk);A.equal(target.health,hp+3+amp);A(target.keywords.includes('taunt'));A(view.text.includes('守护'));A(view.short.includes(String(3+amp)));A(!view.short.includes('攻击'));
 play(s,'growth',{},target);A.equal(target.attack,atk+2+amp);A.equal(target.health,hp+3+amp+2+amp);s.tribe='royal';s.route=1;A(Number.isFinite(AI.spellValue(s,D.byId.guard)));
}
{
 const s=fresh(),offer=E.make(s,'neutral0',{attack:3,health:4});s.shop=[offer];play(s,'marketMeal');A.equal(offer.attack,5);A.equal(offer.health,6);play(s,'rich');A.equal(s.pendingGold,2);A.equal(s.gold,3);E.startRound(s);A.equal(s.gold,5);
}
{
 const s=fresh();play(s,'rune1');A.equal(s.hand.filter(c=>c.id==='mana').length,1);play(s,'neutral0');const mana=s.hand.find(c=>c.id==='mana'),target=s.board[0],atk=target.attack;A(E.act(s,'play',{uid:mana.uid,target:target.uid}).ok);A.equal(target.attack,atk+2);s.tier=6;for(const id of ['rune22','rune20','seekSpell'])A(!D.discoveryPool(s,D.byId[id]).some(c=>c.id==='mana'));
}
A.equal(D.byId.royal21.tier,4);A.equal(D.byId.royal21.attack,3);A.equal(D.byId.royal21.health,3);
for(const golden of [false,true]){
 const s=fresh();s.tier=6;play(s,'neutral14');play(s,'royal21',{golden});A.equal(s.discover.length,golden?4:2);A(s.discover.every(q=>q.options.every(id=>id!=='royal21'&&D.isTribe(D.byId[id],'royal')&&D.byId[id].tier<=s.tier)));A.equal(E.act(s,'choose',{id:'royal21'}).ok,false);A(E.validate(s));
}
{
 const s=fresh();s.tier=3;delete s.openingPoolRulesVersion;s.shop.push(E.make(s,'mana'));s.hand.push(E.make(s,'mana'));s.discover=[{type:'minion',source:'fanfare',card:'royal21',title:'旧发现',text:'旧描述',options:['royal21','royal0','royal1']},{type:'spell',source:'fanfare',card:'rune22',title:'旧法术',text:'旧描述',options:['mana','growth','guard']}];A(E.validate(s));E.normalize(s);A(!s.shop.some(c=>c.id==='mana'));A(s.hand.some(c=>c.id==='mana'));A(!s.discover[0].options.includes('royal21'));A(!s.discover[1].options.includes('mana'));A.equal(s.discover[0].options.length,3);A.equal(s.discover[1].options.length,3);A(E.validate(s));
}
console.log('PASS six neutral opening spells across all 70 tribe sets, token-only Wisdom generation/play, guard nonzero-only scaling, market buff/deferred gold, 4-star herald normal/golden/Loki no-self discovery, legacy shop and discovery repair.');
