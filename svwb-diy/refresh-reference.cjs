// Read-only public official API. Never includes starter variants in the main pool.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const file=n=>path.join(__dirname,n),source='https://shadowverse-wb.com/web/CardList/cardList';
const clean=s=>(s||'').replace(/<hr\s*\/?\s*>/g,'\n').replace(/<[^>]*>/g,'').replace(/_/g,' ').trim();
(async()=>{
 const get=async offset=>{const res=await fetch(source+'?offset='+offset+'&include_token=1',{headers:{Lang:'chs'}});assert(res.ok);const j=await res.json();assert.equal(j.data_headers.result_code,1);return j.data;};
 const first=await get(0),pages=[first];
 for(let offset=30;offset<first.count;offset+=120){
  const offsets=Array.from({length:4},(_,i)=>offset+i*30).filter(n=>n<first.count);
  pages.push(...await Promise.all(offsets.map(get)));
 }
 const listed=new Set(pages.flatMap(p=>p.sort_card_id_list).map(Number)),details=Object.assign({},...pages.map(p=>p.card_details));
 assert.equal(listed.size,first.count,'Pagination must cover all listed IDs');
 const cards=[...listed].sort((a,b)=>a-b).map(id=>{const {common:c,evo}=details[id];return {id,name:c.name,class:c.class,type:c.type,tribes:c.tribes,cost:c.cost,rarity:c.rarity,attack:c.atk,health:c.life,token:c.is_token,set:c.card_set_id,text:clean(c.skill_text),evolvedText:clean(evo?.skill_text)};});
 const rawEffects=Object.assign({},...pages.map(p=>p.specific_effect_card_info)),links=Object.assign({},...pages.map(p=>p.cards));
 const specialEffects=Object.entries(rawEffects).map(([id,e])=>({id:Number(id),type:e.specific_effect_type,text:clean(e.skill_text),sourceCardIds:Object.entries(links).filter(([,v])=>v.specific_effect_card_ids?.includes(Number(id))).map(([key])=>Number(key)).sort((a,b)=>a-b)})).sort((a,b)=>a.id-b.id);
 const old=JSON.parse(fs.readFileSync(file('reference.json'),'utf8')),changes=cards.filter(c=>{const p=old.cards.find(v=>v.id===c.id);return !p||['text','evolvedText','cost','attack','health','class','rarity','type'].some(k=>String(p[k]||'').replace(/\s/g,'')!==String(c[k]||'').replace(/\s/g,''));}).map(c=>({id:c.id,name:c.name}));
 const result={retrieved:new Date().toISOString(),source,listedCount:first.count,cards,specialEffects};
 fs.writeFileSync(file('reference-latest.json'),JSON.stringify(result,null,2)+'\n');
 fs.writeFileSync(file('reference-refresh-report.json'),JSON.stringify({retrieved:result.retrieved,source,listed:first.count,unique:listed.size,specialEffects:specialEffects.length,changes},null,2)+'\n');
 console.log(JSON.stringify({listed:first.count,unique:listed.size,specialEffects:specialEffects.length,changes}));
})().catch(e=>{console.error(e);process.exitCode=1;});
