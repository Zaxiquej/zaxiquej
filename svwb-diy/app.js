'use strict';
const $=id=>document.getElementById(id);
let current;
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
function rich(text){const p=el('p',undefined,'ability');text.split(/(【[^】]+】)/g).forEach(t=>p.append(el(t.startsWith('【')?'b':'span',t)));return p;}
function displayAbilities(c){
  const order={'与本卡牌融合时':-.5,'法术':2,'入场曲':2,'爆能强化':2.5,'启动':3,'攻击时':3,'交战时':3.1,'在牌组中发动':1.1,'本卡牌被【瞬念召唤】时':1.2,'谢幕曲':4,'进化时':5,'本随从进化时':5.1,'超进化时':6};
  const rank=a=>a.kind==='fusion'?-1:a.kind==='keyword'?0:!a.trigger?1:(order[a.trigger]??4.5);
  // Move complete clauses, retaining conditions and mode branches as one unit.
  // This presentation is shared by the page and clipboard; seeded data stays intact.
  const targeted=a=>/选择[^。\n]*?(?:随从|护符|卡牌|手牌|主战者)/.test(a.text);
  const mergeable=['入场曲','进化时','超进化时'];
  function effectParts(text){
    // Split independent effects, keeping quoted card names, conditional tails,
    // and follow-up references together so sorting cannot detach their scope.
    const sentences=text.match(/(?:『[^』]*』|[^。])+。?/g)||[],parts=[];
    for(let i=0;i<sentences.length;i++){
      const sentence=sentences[i].trimStart();
      if(parts.length&&/^若(?:以此|因本能力)/.test(sentence)){
        parts[parts.length-1].text+=sentences.slice(i).join('');break;
      }
      if(/^(?:若|如果|每当|每次|【(?:连击|协作|唤灵|土之秘术|奥义|解放奥义|觉醒|爆能强化))/.test(sentence)){
        const tail=sentences.slice(i).join(''),scope=tail.match(/^(?:\s*(?:若|如果)[^。]*?则|\s*【(?:连击|协作|唤灵|土之秘术|奥义|解放奥义|觉醒|爆能强化)[^】]*】)/);
        const body=scope?effectParts(tail.slice(scope[0].length)).sort((a,b)=>Number(targeted(b))-Number(targeted(a))).map(a=>a.text).join(''):null;
        parts.push({text:scope?scope[0]+body:tail});break;
      }
      if(parts.length&&/^(?:X|Y|该|其|使其|使以此|这些|然后|否则|重复|此效果|此能力|此时|直到|并使|并将)/.test(sentence))parts[parts.length-1].text+=sentences[i];
      else parts.push({text:sentences[i]});
    }
    return parts;
  }
  let abilities=c.abilities.filter(a=>a.kind!=='alternate').flatMap(a=>{
    if(a.kind!=='fusion')return [a];
    const boundary=a.text.indexOf('\n');
    if(boundary<0)return [a];
    return [{kind:'fusion',text:a.text.slice(0,boundary)},
      {...a,kind:'effect',text:a.text.slice(boundary+1)}];
  });
  for(const trigger of mergeable){
    // Mode blocks retain their own trigger label and cannot absorb other effects.
    const candidates=abilities.filter(a=>a.trigger===trigger&&!a.orderedEffects&&!a.mode&&a.kind!=='mode'&&!a.text.includes('【模式】'));
    // Keep each original conditional scope separate, including paid follow-ups.
    // Equal condition IDs alone do not imply equal thresholds or one shared payment.
    const conditional=a=>a.condition&&a.condition!=='none'||/若|如果|【(?:连击|协作|唤灵|土之秘术|奥义|解放奥义|觉醒)/.test(a.text.replace(/『[^』]*』/g,''));
    const unconditional=candidates.filter(a=>!conditional(a));
    const groups=[unconditional,...candidates.filter(conditional).map(a=>[a])];
    for(const group of groups){
      if(!group.length)continue;
      const prefix=`【${trigger}】`;
      const parts=group.flatMap(a=>effectParts(a.text.startsWith(prefix)?a.text.slice(prefix.length).trimStart():a.text))
        .sort((a,b)=>Number(targeted(b))-Number(targeted(a)));
      const merged={...group[0],text:prefix+parts.map(a=>a.text).join('')};
      const first=abilities.indexOf(group[0]);
      abilities=abilities.filter((a,i)=>!group.includes(a)||i===first).map(a=>a===group[0]?merged:a);
    }
  }
  return abilities.sort((a,b)=>rank(a)-rank(b)||(a.trigger===b.trigger&&mergeable.includes(a.trigger)?Number(targeted(b))-Number(targeted(a)):0));
}
const tokenType=t=>t.type||'follower';
const tokenMeta=t=>`${t.cost}费 · ${SVWB.TYPES[tokenType(t)]}${tokenType(t)==='follower'?` · ${t.attack}/${t.health}`:''}`;
const tokenText=t=>t.upgrade&&t.abilities?displayAbilities(t).map(a=>a.text).join('\n'):t.text;
function cardText(c){
  const alternate=c.alternateForms.map(f=>`【${f.kind} ${f.cost}】\n${f.text}`).join('\n\n---\n\n');
  const body=displayAbilities(c).map(a=>a.text).join('\n')||'无能力';
  const parts=[`${c.name}\n${SVWB.CLASSES[c.class]} · ${SVWB.RARITIES[c.rarity]} · ${SVWB.TYPES[c.type]}\n${c.cost}费${c.type==='follower'?` ${c.attack}/${c.health}`:''}\n${alternate?alternate+'\n\n---\n\n':''}${body}`];
  if(c.tokens.length)parts.push('附属卡：\n'+c.tokens.map(t=>`${t.name}（${t.upgrade?'强化形态':t.custom?'原创':t.related?'官方 · 融合后续':'官方'}${t.tribe?' · '+t.tribe+'·'+SVWB.TYPES[tokenType(t)]:''}）\n${tokenMeta(t)}\n${tokenText(t)||'无能力'}`).join('\n\n'));
  if(c.emblems.length)parts.push('纹章：\n'+c.emblems.map(e=>(e.owner==='opponent'?'对手获得 · ':'')+e.name+'\n'+e.text).join('\n\n'));
  if(c.faiths.length)parts.push('信仰：\n'+c.faiths.map(f=>f.name+'\n'+f.text).join('\n\n'));
  parts.push(`同人设计${c.chaos?' · 究极混乱':''} · 规则 v${c.version}`);return parts.join('\n\n');
}
function render(){
  try{current=SVWB.generate($('name').value,{chaos:$('chaos').checked});}catch(e){$('status').textContent=e.message;$('name').focus();return;}
  const c=current;
  $('name').value=c.name;$('card-name').textContent=c.name;$('cost').textContent=c.cost;$('attack').textContent=c.attack;$('health').textContent=c.health;
  $('attack').parentElement.hidden=c.type!=='follower';$('health').parentElement.hidden=c.type!=='follower';
  $('class-rarity').replaceChildren(el('span',SVWB.CLASSES[c.class],`class-label class-${c.class}`),document.createTextNode(' / '),el('span',SVWB.RARITIES[c.rarity],`rarity-label rarity-${c.rarity}`),document.createTextNode(' / '+SVWB.TYPES[c.type]));
  $('abilities').replaceChildren(...(c.abilities.length?displayAbilities(c).map(a=>rich(a.text)):[el('p','无能力。','ability')]));
  $('tokens').replaceChildren();$('tokens').hidden=!c.tokens.length;
  if(c.tokens.length)$('tokens').append(el('h3','附属卡'));
  c.tokens.forEach(t=>{const box=el('div',undefined,'token');box.append(el('h4',t.name),el('div',`${t.upgrade?'强化形态':t.custom?'原创 token':t.related?'融合后续卡牌':'官方卡牌'}${t.tribe?' · '+t.tribe+'·'+SVWB.TYPES[tokenType(t)]:''} · ${tokenMeta(t)}`,'token-meta'),el('p',tokenText(t)||'无能力。'));if(!t.custom){const a=el('a','在官方图鉴中查看 ↗');a.href=`https://shadowverse-wb.com/chs/deck/cardslist/card/?card_id=${t.id}`;a.target='_blank';a.rel='noopener';box.append(a);} $('tokens').append(box);});
  $('emblems').replaceChildren();$('emblems').hidden=!c.emblems.length;
  if(c.emblems.length)$('emblems').append(el('h3','纹章'));
  c.emblems.forEach(e=>{const box=el('div',undefined,'token');box.append(el('h4',(e.owner==='opponent'?'对手获得 · ':'')+e.name),rich(e.text));$('emblems').append(box);});
  $('faiths').replaceChildren();$('faiths').hidden=!c.faiths.length;
  if(c.faiths.length)$('faiths').append(el('h3','信仰'));
  c.faiths.forEach(f=>{const box=el('div',undefined,'token');box.append(el('h4',f.name),rich(f.text));$('faiths').append(box);});
  $('alternate-forms').replaceChildren();$('alternate-forms').hidden=!c.alternateForms.length;
  c.alternateForms.forEach(f=>{$('alternate-forms').append(rich(`【${f.kind} ${f.cost}】\n${f.text}`),el('hr',undefined,'ability-divider'));});
  $('status').textContent='已生成'+(c.chaos?' · 究极混乱':'');
}
$('forge-form').addEventListener('submit',e=>{e.preventDefault();render();});
$('chaos').addEventListener('change',render);
SVWB.CLASSES.forEach((label,i)=>{const option=el('option',label);option.value=i;$('filter-class').append(option);});
SVWB.RARITIES.forEach((label,i)=>{const option=el('option',label);option.value=i;$('filter-rarity').append(option);});
function randomFilters(){return {type:$('filter-type').value||null,class:$('filter-class').value===''?null:Number($('filter-class').value),rarity:$('filter-rarity').value===''?null:Number($('filter-rarity').value),costBand:$('filter-cost').value||null};}
function filteredRandom(variant=false){
  try{$('name').value=SVWB.randomMatchingName(randomFilters(),{variantOf:variant?$('name').value:undefined,excludeName:$('name').value,chaos:$('chaos').checked});render();if(variant)$('card').scrollIntoView({block:'nearest'});}
  catch(e){$('status').textContent=e.message;}
}
$('random').addEventListener('click',()=>filteredRandom());
$('variant').addEventListener('click',()=>filteredRandom(true));
$('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(cardText(current));$('status').textContent='已复制卡牌及附属卡文本';}catch{const area=el('textarea',cardText(current));area.setAttribute('aria-label','复制卡牌文本');area.style.cssText='width:100%;height:180px;margin-top:12px';$('status').replaceChildren(el('span','请选中下方文本并复制。'),area);area.focus();area.select();}});
render();
