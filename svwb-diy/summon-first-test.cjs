const assert=require('node:assert/strict'),S=require('./engine');
const selected=['守护者巨像','圣炎猛虎','巨翼飞龙','神圣猎鹰','壮丽大神隼','乙姬近卫队'].map(name=>S.TOKENS.find(t=>t.name===name));
for(const t of selected){
 let allowed=0;
 for(let seed=0;seed<1000;seed++){
  const offer=S.tokenHandOffer(t,seed);if(!offer)continue;allowed++;
  assert(offer.discount>=1&&t.cost-offer.discount>=2);
  assert.equal(offer.unitPrice,S.tokenValue(t,'hand')+offer.discount*1.4);
  assert(offer.text(2).includes(`费用-${offer.discount}`));
 }
 assert(allowed>100&&allowed<220,'Discounted hand route should remain rare: '+t.name);
}
for(const name of ['妖精','沉溺的实验体','天晶魔手','攻击创造物','城堡创造物'])assert.equal(S.tokenHandOffer(S.TOKENS.find(t=>t.name===name),0).discount,0);
const counts=Object.fromEntries(selected.map(t=>[t.name,{hand:0,summon:0}]));
const check=require('./assert-node-effects.cjs');
for(let i=0;i<10000;i++){
 const opts={chaos:i%3===0},c=S.generate('召唤优先507-'+i,opts);check(c);
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 const nodes=[...c.abilities,...c.emblems,...c.alternateForms,...c.tokens.filter(t=>t.custom)];
 for(const a of nodes){
  for(const t of selected){
   const re=new RegExp(`将[0-9X]+张『${t.name}』加入手牌`,'g');
   for(const m of (a.text||'').matchAll(re)){
    counts[t.name].hand++;
    assert(/^，使这些卡牌的费用-[12]。/.test(a.text.slice(m.index+m[0].length)),c.name+' unadjusted hand token: '+a.text);
   }
   if(new RegExp(`召唤[0-9X]+[个张]『${t.name}』`).test(a.text||''))counts[t.name].summon++;
  }
  if(a.tokenDelivery?.discount){const d=a.tokenDelivery;assert(!a.acquisitionDiscount,'Do not stack discounts');assert(d.unitPrice*d.count<=a.raw+1e-8);}
 }
 if(i<80)assert.deepEqual(c,S.generate(c.name,opts));
}
for(const name of ['守护者巨像','圣炎猛虎'])assert(counts[name].summon>counts[name].hand);
console.log({version:S.VERSION,samples:10000,counts});
