'use strict';
const fs=require('node:fs'),path=require('node:path'),D=require('./data');
const dir=path.join(__dirname,'assets','voices'),cacheFile=path.join(dir,'metadata.json');
fs.mkdirSync(dir,{recursive:true});
const cache=fs.existsSync(cacheFile)?JSON.parse(fs.readFileSync(cacheFile,'utf8')):{};
const cards=[...D.cards,...(D.retiredCards||[]),...D.tokens].filter(c=>c.type==='minion');
const ids=[...new Set(cards.map(c=>c.sourceId).filter(Boolean))],manifest={},errors=[];
async function request(url){for(let attempt=0;attempt<3;attempt++){try{const r=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error('HTTP '+r.status);return r;}catch(e){if(attempt===2)throw e;}}}
async function worker(){while(ids.length){const id=ids.shift();try{
 const metadata=cache[id]||await(await request('https://svgdb.me/api/voices/'+id)).json();cache[id]=metadata;
 const entries={};for(const [kind,key] of Object.entries({play:'plays',attack:'attacks',death:'deaths'})){
  const options=(metadata[key]||[]).filter(f=>/^vo_[\w]+\.mp3$/.test(f)&&!/_7_|_8_|evo|enh/.test(f));
  const file=options.find(f=>f===`vo_${id}_${{play:1,attack:2,death:4}[kind]}.mp3`)||options[0];if(!file)continue;
  const out=path.join(dir,file);if(!fs.existsSync(out)){
   const r=await request('https://svgdb.me/assets/audio/jp/'+file),b=Buffer.from(await r.arrayBuffer());
   if(b.length<100||!(b.toString('ascii',0,3)==='ID3'||b[0]===255&&(b[1]&224)===224))throw Error('Not MP3: '+file);
   fs.writeFileSync(out,b);
  }entries[kind]=file;
 }manifest[id]=entries;
 }catch(e){errors.push({id,error:e.message});}if(Object.keys(manifest).length%30===0)console.log('Voice cards:',Object.keys(manifest).length);
}}
(async()=>{await Promise.all(Array.from({length:4},worker));fs.writeFileSync(cacheFile,JSON.stringify(cache,null,2));
const mapped={};for(const c of cards)if(manifest[c.sourceId])mapped[c.id]={sourceId:c.sourceId,...manifest[c.sourceId]};
const files=[...new Set(Object.values(manifest).flatMap(Object.values))];
const report={language:'jp',source:'https://svgdb.me',cards:mapped,files:files.length,bytes:files.reduce((n,f)=>n+fs.statSync(path.join(dir,f)).size,0),missing:cards.filter(c=>!manifest[c.sourceId]?.play||!manifest[c.sourceId]?.attack||!manifest[c.sourceId]?.death).map(c=>({id:c.id,name:c.name,available:manifest[c.sourceId]||{}})),errors};
fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({cards:cards.length,files:report.files,bytes:report.bytes,missing:report.missing,errors}));if(errors.length)process.exitCode=1;
})();
