// Refresh public reference data; no credentials or browser session required.
const fs = require('node:fs');
const endpoint = 'https://shadowverse-wb.com/web/CardList/cardList';
const clean = s => (s || '').replace(/<hr\s*\/?>/g, '\n').replace(/<[^>]*>/g, '').replace(/_/g, ' ');
async function main() {
  const response = await fetch(`${endpoint}?include_token=1`, {headers:{Lang:'chs'}});
  if (!response.ok) throw Error(`HTTP ${response.status}`);
  const first = (await response.json()).data;
  const all = {...first.card_details};
  const special = {...first.specific_effect_card_info};
  const relations = {...first.cards};
  const ids = new Set(first.sort_card_id_list.map(String));
  const offsets = Array.from({length: Math.ceil(first.count / 30) - 1}, (_,i)=>(i+1)*30);
  for (let i=0; i<offsets.length; i+=4) {
    const pages = await Promise.all(offsets.slice(i,i+4).map(async offset => {
      const response = await fetch(`${endpoint}?include_token=1&offset=${offset}`, {headers:{Lang:'chs'}});
      if (!response.ok) throw Error(`HTTP ${response.status}`);
      const json = await response.json();
      if (!json.data?.card_details) throw Error('Missing card data');
      return json.data;
    }));
    pages.forEach(d=>{ Object.assign(all,d.card_details);Object.assign(special,d.specific_effect_card_info);Object.assign(relations,d.cards);d.sort_card_id_list.forEach(id=>ids.add(String(id))); });
  }
  if (ids.size !== first.count) throw Error(`Incomplete snapshot: ${ids.size}/${first.count}`);
  const cards = Object.values(all).map(({common:c,evo})=>({id:c.card_id,name:c.name,class:c.class,type:c.type,tribes:c.tribes||[],cost:c.cost,rarity:c.rarity,attack:c.atk,health:c.life,token:c.is_token,set:c.card_set_id,text:clean(c.skill_text),evolvedText:clean(evo?.skill_text)}));
  fs.mkdirSync('svwb-diy',{recursive:true});
  const specialEffects=Object.entries(special).map(([id,e])=>({id:Number(id),type:e.specific_effect_type,text:clean(e.skill_text),sourceCardIds:Object.entries(relations).filter(([,v])=>(v.specific_effect_card_ids||[]).includes(Number(id))).map(([k])=>Number(k))}));
  fs.writeFileSync('svwb-diy/reference.json',JSON.stringify({retrieved:new Date().toISOString(),source:endpoint,listedCount:first.count,cards,specialEffects},null,2));
  console.log('Saved',cards.length,'reference cards; list coverage',ids.size+'/'+first.count);
  console.log('Saved separate special effects:',specialEffects.length);
  const followers=cards.filter(c=>c.type===1&&!c.token);
  for(let c=0;c<8;c++) {
    const group=followers.filter(x=>x.class===c);
    const keys=['入场曲','进化时','超进化时','谢幕曲','连击','爆能强化','唤灵','觉醒','模式','魔力增幅','土之秘术','信仰'];
    console.log(c,group.length,Object.fromEntries(keys.map(k=>[k,group.filter(x=>(x.text+' '+x.evolvedText).includes(k)).length])));
  }
  console.log('Simple tokens',cards.filter(c=>c.token&&c.type===1&&c.cost<=2).map(c=>[c.id,c.name,c.class,c.cost,c.attack,c.health,c.text]));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
