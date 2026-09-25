const fs=require('node:fs'),S=require('./engine'),R=require('./reference.json');
const printed=R.cards.filter(c=>!c.token);
const stats={version:S.VERSION,samples:8000,types:{},costs:{},rainbows:{},rush:0,rushEvolve:0,evolutionGrowth:0,cheapHeal:[],late:[],start:[],simpleRainbow:0};
const special=a=>a.kind==='mode'||a.condition&&a.condition!=='none'||['emblem','signature','fusion','invocation','handTrigger','progressTransform','cycle','ongoing'].includes(a.kind)||a.ids.some(id=>/tribe|faith|Evolve|Transform|doubleAttack|tripleAttack|damageCap|combat|resurrect|rare|Entry|Link|Engine|Grant/.test(id));
for(let i=0;i<stats.samples;i++){
 const c=S.generate('设计审计499-'+i),text=c.abilities.map(a=>a.text).join('\n');
 stats.types[c.type]=(stats.types[c.type]||0)+1;stats.costs[c.cost]=(stats.costs[c.cost]||0)+1;
 if(c.rarity===3){stats.rainbows[c.type]=(stats.rainbows[c.type]||0)+1;if(!c.abilities.some(special))stats.simpleRainbow++;}
 if(c.abilities.some(a=>a.kind==='keyword'&&a.ids.includes('突进'))){stats.rush++;if(c.abilities.some(a=>['进化时','超进化时'].includes(a.trigger)))stats.rushEvolve++;}
 if(c.evolutionBodyTrade&&c.abilities.some(a=>a.kind==='evolutionSacrifice'&&a.ids.includes('buff')))stats.evolutionGrowth++;
 if(c.cost<=2&&c.type!=='follower'&&/回复自己的主战者/.test(text)){const max=Math.max(...[...text.matchAll(/回复自己的主战者(\d+)点/g)].map(m=>+m[1]));if(max>=4||/造成[4-9]点伤害/.test(text))stats.cheapHeal.push({name:c.name,type:c.type,cost:c.cost,text});}
 if(c.type==='follower'&&c.cost>=7)stats.late.push({name:c.name,cost:c.cost,readiness:S.highCostReadiness(c),nodes:c.abilities.filter(a=>a.kind!=='keyword').length,strongest:Math.max(0,...c.abilities.filter(a=>a.trigger==='入场曲').map(a=>a.raw))});
 if(c.type==='follower'&&c.abilities.some(a=>a.trigger==='自己的回合开始时'))stats.start.push({name:c.name,protected:c.abilities.some(a=>a.ids.some(id=>['潜行','威慑','屏障','damageCap','abilityDestructionImmune'].includes(id))),text});
}
const official={retrieved:R.retrieved,source:R.source,total:R.cards.length,printed:printed.length,types:{},rush:0,rushEvolve:0};
for(const [name,types]of Object.entries({follower:[1],spell:[4],amulet:[2,3]})){const rows=printed.filter(c=>types.includes(c.type));official.types[name]={count:rows.length,rarities:[1,2,3,4].map(n=>rows.filter(c=>c.rarity===n).length),costs:Array.from({length:19},(_,i)=>rows.filter(c=>c.cost===i).length)};}
const rush=printed.filter(c=>c.type===1&&/^【突进】/m.test(c.text));official.rush=rush.length;official.rushEvolve=rush.filter(c=>/【(?:超)?进化时】/.test(c.text)).length;
stats.official=official;
const file=process.argv[2]||'design-audit-499.json';fs.writeFileSync(__dirname+'/'+file,JSON.stringify(stats,null,2));
console.log(JSON.stringify({...stats,cheapHeal:stats.cheapHeal.length,late:{count:stats.late.length,meanNodes:stats.late.reduce((n,c)=>n+c.nodes,0)/stats.late.length,meanStrongest:stats.late.reduce((n,c)=>n+c.strongest,0)/stats.late.length},start:{count:stats.start.length,protected:stats.start.filter(c=>c.protected).length}},null,2));
