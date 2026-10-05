'use strict';
const S=require('./selfplay'),fs=require('node:fs'),path=require('node:path');
const seed=Number(process.argv[2]||48120),count=Math.max(1,Math.min(100,Number(process.argv[3]||1))),mode=process.argv[4]||'fair',reports=[];
for(let i=0;i<count;i++){const r=S.run({seed:seed+i,mode},row=>console.log('game',i+1,'round',row.round,'alive',row.players.filter(p=>p.hpAfter>0).length));reports.push(r);fs.writeFileSync(path.join(__dirname,'qa/selfplay-results.json'),JSON.stringify({format:'sv-tavern-selfplay-batch-v1',reports,aggregate:S.aggregate(reports)},null,2));console.log(JSON.stringify({seed:r.seed,status:r.status,rounds:r.rounds,ranking:r.players.map(p=>({rank:p.rank,name:p.name,build:p.aiSummary?.buildName,power:p.board.reduce((n,c)=>n+c.attack+c.health,0)}))}));}
