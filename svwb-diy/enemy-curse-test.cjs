const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),S=require('./engine'),Q=require('./inspector-search');
const ui={};vm.runInNewContext(fs.readFileSync(__dirname+'/app.js','utf8').split('const tokenType=')[0],ui);
const counts={cards:0,automatic:0,multiple:0,compound:0},events=new Set(),payloads=new Set(),examples={};
let generated=0;
function inspect(c,main=c){
 const marked=c.abilities.filter(a=>a.ids.includes('enemyCurse'));if(!marked.length)return;
 assert([1,5,7].includes(main.class));assert(main.rarity>=2);assert(c.spent<=c.budget+.011);
 assert(Q.compile({query:'id:enemyCurse'})(c));
 for(const a of marked){
  const quote=a.text.match(/「[^」]*」/);assert(quote,a.text);assert(!quote[0].includes('选择'));
  assert(!/对对手的主战者|对对手的战场/.test(quote[0]),'Quoted effect uses recipient ownership');
  const display=ui.displayAbilities(c).map(a=>a.text).join('\n');assert(display.includes(quote[0]),'Do not split the granted ability while merging triggers');
  if(a.trigger==='谢幕曲'){counts.automatic++;assert(!a.text.includes('选择对手'));}
  const spec=a.enemyCurse;if(!spec)continue;
  assert.equal(spec.owner,'recipient');events.add(spec.eventId);examples[spec.eventId]??={name:main.name,chaos:!!main.chaos};
  if(spec.count>1)counts.multiple++;
  if(spec.parts.length>1)counts.compound++;
  assert.equal(spec.count,Math.floor(spec.count));assert(spec.count>=1&&spec.count<=2);
  const expected=spec.count*(.6+spec.parts.reduce((n,p)=>n+p.raw,0)*spec.repeats);
  assert(Math.abs(expected-a.raw)<1e-7);
  for(const p of spec.parts){payloads.add(p.id);if(spec.eventId==='lastWords')assert.equal(p.id,'leaderDamage');}
 }
}
for(let i=0;i<24000;i++){
 const name='敌方附加'+i,options={chaos:i%2===1},h=S.header(name,options);
 if(h.rarity<2||h.cost<3||![1,5,7].includes(h.class))continue;
 const c=S.generate(name,options);generated++;
 if(c.abilities.some(a=>a.ids.includes('enemyCurse'))){counts.cards++;assert.deepEqual(c,S.generate(name,options));inspect(c);}
 for(const f of c.alternateForms)if(f.abilities)inspect(f,c);
}
assert(counts.cards>=12&&counts.cards/generated<.12);assert(counts.automatic>0&&counts.multiple>0&&counts.compound>0);
assert.equal(events.size,4);assert.equal(payloads.size,3);
const curse='选择对手的战场上的1个随从，使其获得「回合结束时，对自己的主战者造成1点伤害。对本随从造成2点伤害」。';
const merged=ui.displayAbilities({abilities:[{kind:'effect',trigger:'入场曲',condition:'none',ids:[],text:'【入场曲】抽取1张卡牌。'+curse},{kind:'effect',trigger:'入场曲',ids:[],text:'【入场曲】选择自己的1张手牌，使其返回牌组。'}]}).map(a=>a.text).join('');
assert(merged.includes(curse));assert(merged.indexOf(curse)<merged.indexOf('抽取1张卡牌'));
const report={version:S.VERSION,generated,counts,events:[...events],payloads:[...payloads],examples};
fs.writeFileSync(__dirname+'/enemy-curse-validation.json',JSON.stringify(report,null,2)+'\n');console.log('PASS: rare modular enemy abilities, recipient perspective, pricing, trigger safety, deterministic generation and quoted text merging.',report);
