// Public read-only snapshot, independent of the DIY and popularity datasets.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const source = 'https://shadowverse-wb.com/web/CardList/cardList';
const clean = s => String(s || '').replace(/<hr\s*\/?\s*>/gi, '\n').replace(/<[^>]*>/g, '').replace(/_/g, ' ').trim();
async function get(offset) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(`${source}?include_token=1&offset=${offset}`, {headers:{Lang:'chs'},signal:AbortSignal.timeout(30000)});
      assert(r.ok, `HTTP ${r.status}`); const j = await r.json(); assert.equal(j.data_headers.result_code, 1);
      assert(j.data.card_details && Array.isArray(j.data.sort_card_id_list)); return j.data;
    } catch(e) { if(attempt===2) throw e; await new Promise(r=>setTimeout(r,1500)); }
  }
}
(async()=>{
  const first=await get(0), pages=[first];
  for(let offset=30;offset<first.count;offset+=60) {
    const offsets=[offset,offset+30].filter(n=>n<first.count);
    const batch=await Promise.all(offsets.map(get));
    batch.forEach(p=>assert.equal(p.count,first.count,'Card pool changed while fetching; retry.'));
    pages.push(...batch); console.log(`Cards: ${Math.min(offset+60,first.count)}/${first.count}`);
  }
  const listed=[...new Set(pages.flatMap(p=>p.sort_card_id_list).map(Number))].sort((a,b)=>a-b);
  assert.equal(listed.length,first.count,'Incomplete pagination');
  const details=Object.assign({},...pages.map(p=>p.card_details)), relations=Object.assign({},...pages.map(p=>p.cards));
  const special=Object.assign({},...pages.map(p=>p.specific_effect_card_info));
  const cards=listed.map(id=>{
    const {common:c,evo}=details[id];
    return {id,name:c.name,class:Number(c.class),type:Number(c.type),cost:c.cost,attack:c.atk,health:c.life,rarity:c.rarity,
      tribes:(c.tribes||[]).filter(Number),set:c.card_set_id,token:!!c.is_token,rotation:!!c.is_include_rotation,
      baseId:c.base_card_id,originalId:c.original_card_id||null,text:clean(c.skill_text),evolvedText:clean(evo?.skill_text),
      imageHash:c.card_image_hash,evolvedImageHash:evo?.card_image_hash||null,
      related:relations[id]?.related_card_ids||[],effects:(relations[id]?.specific_effect_card_ids||[]).map(key=>{
        const e=special[key]; return e?{id:Number(key),type:e.specific_effect_type,name:e.name||'',text:clean(e.skill_text)}:null;
      }).filter(Boolean)};
  }).filter(c=>!c.originalId || c.originalId===c.id);
  const snapshot={schema:1,source,retrieved:new Date().toISOString(),listedCount:first.count,tribes:first.tribe_names,sets:first.card_set_names,cards};
  const file=path.join(__dirname,'data.js');
  fs.writeFileSync(file+'.tmp','/* Official WB card snapshot; refresh with node svwb-guess/sync.cjs */\nwindow.SVWB_GUESS_DATA = '+JSON.stringify(snapshot)+';\n');
  fs.renameSync(file+'.tmp',file);
  console.log(JSON.stringify({cards:cards.length,tokens:cards.filter(c=>c.token).length,attachedEffects:cards.filter(c=>c.effects.length).length,types:[...new Set(cards.map(c=>c.type))]}));
})().catch(e=>{console.error(e);process.exitCode=1;});
