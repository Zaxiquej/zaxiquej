(() => {
  'use strict';
  const E=window.WBGuess,S=window.WBGuessSemantics,cards=window.SVWB_GUESS_DATA?.cards;
  if(!E||!S||!cards?.length)return;
  const $=id=>document.getElementById(id),dialog=$('debug-dialog');
  const norm=value=>E.normalize(typeof simplized==='function'?simplized(value):value);
  const all=[...cards].sort((a,b)=>a.id-b.id),byId=new Map(all.map(c=>[c.id,c]));
  let engine=null,filtered=[],sequence='',lastKey=0;
  const el=(tag,text)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;};
  function describe(card,base){
    const body=el('div');body.className='debug-effect';
    body.append(el('p',`${E.classes[card.class]} · ${E.types[card.type]} · ${card.cost} 费 · ID ${card.id}${card.token?' · 衍生卡':''}`),el('p',card.text||'无特殊能力。'));
    if(card.evolvedText&&E.normalize(card.evolvedText)!==E.normalize(card.text))body.append(el('p','进化后：'+card.evolvedText));
    for(const effect of card.effects||[])body.append(el('p',(E.effectTypes[effect.type]||'附属效果')+'：'+effect.text));
    const comparison=base?engine.compare(base,card):null;
    const explanation=engine.explain(card,comparison?.modeMatch?.right);
    if(comparison?.modeMatch)body.append(el('p',`模式比较：测试目标采用${comparison.modeMatch.left}，本卡采用${comparison.modeMatch.right}；分支匹配占 90%，完整结构占 10%。`));
    else if(explanation.modes.length)body.append(el('p','模式按合法的单个分支分别比较，不将所有选项当成同时发动。'));
    const families=new Set(explanation.features.map(f=>f.family).filter(Boolean));
    for(const e of explanation.semantic)if(e.action!=='重复触发')families.add(e.family||S.effectFamily(e));
    body.append(el('strong','效果稀有权重（按非衍生卡池统计，每卡计一次）'),el('pre',[...families].map(f=>{const r=engine.rarityFor(f);return `${f}：${r.count} / ${r.total} 张，×${r.multiplier.toFixed(2)}`;}).join('\n')||'无可统计效果类别。'));
    const parsed=explanation.semantic.map(e=>`${e.source}／${e.timing}${e.event?'／'+e.event:''}：${e.action}${e.reference?'（'+e.reference+'）':''}${e.product?'『'+e.product+'』':''} → ${e.side}方${e.object}／${e.zone}／${e.scope}${e.recipient?'／'+e.recipient:''}${e.numbers.length?'／数值 '+e.numbers.join(','):''}${e.targetRestriction?'／目标限制 '+e.targetRestriction:''}${e.condition?'／条件 '+e.condition:''}${e.upgrade?'／条件升级':''}`);
    body.append(el('strong','识别出的效果'),el('pre',parsed.join('\n')||'未提取到结构化效果，仍参与特征与文字比较。'));
    if(base){
      const left=new Map(engine.explain(base,comparison?.modeMatch?.left).features.map(f=>[f.key,f])),shared=explanation.features.filter(f=>left.has(f.key));
      body.append(el('strong','共同特征（双方权重；数值差异仍影响得分）'),el('pre',shared.map(f=>`${f.key}（${left.get(f.key).w.toFixed(2)} / ${f.w.toFixed(2)}）`).join('\n')||'无完全相同特征；近似效果仍可获得关联分。'));
    }
    return body;
  }
  function render(){
    const card=byId.get(+$('debug-card').value),index=filtered.findIndex(c=>c.id===card?.id);
    $('debug-prev').disabled=index<=0;$('debug-next').disabled=index<0||index>=filtered.length-1;
    $('debug-position').textContent=filtered.length?`${index+1} / ${filtered.length}`:'0 / 0';
    $('debug-results').replaceChildren();$('debug-target-content').replaceChildren();$('debug-target').hidden=!card;
    if(!card){$('debug-status').textContent='没有匹配的卡牌。';return;}
    const pool=$('debug-pool').value==='all'?all:all.filter(c=>!c.token||c.id===card.id);
    const ranking=engine.rank(card,pool).slice(0,100);
    $('debug-status').textContent=`${card.name} · 比较 ${pool.length} 张 · 显示前 ${ranking.length} 名`;
    $('debug-target-title').textContent=card.name+' · 卡牌效果与识别结果';$('debug-target-content').append(describe(card));
    const fragment=document.createDocumentFragment();
    for(const r of ranking){
      const row=el('tr'),name=el('td'),details=el('details');details.append(el('summary',r.card.name));
      details.addEventListener('toggle',()=>{if(details.open&&details.childElementCount===1)details.append(describe(r.card,card));});
      name.append(details);row.append(el('td','#'+r.rank),name,...['score','basic','skill','text'].map(k=>el('td',r[k].toFixed(2))));fragment.append(row);
    }
    $('debug-results').append(fragment);
  }
  function search(){
    const previous=+$('debug-card').value,query=norm($('debug-search').value);
    filtered=all.filter(c=>!query||norm(c.name).includes(query)||String(c.id).includes(query));
    $('debug-card').replaceChildren(...filtered.map(c=>{const option=el('option',`${c.name} · ${c.cost}费 · ${c.id}`);option.value=c.id;return option;}));
    if(filtered.some(c=>c.id===previous))$('debug-card').value=previous;
    render();
  }
  function open(){if(dialog.open)return;engine||=E.createEngine(cards);if(!filtered.length)search();dialog.showModal();$('debug-search').focus();}
  document.addEventListener('keydown',event=>{
    if(event.isComposing||event.repeat||event.ctrlKey||event.altKey||event.metaKey)return;
    // Typing into search fields should remain ordinary input; use the code on the page background.
    if(event.target.closest?.('input,textarea,select,[contenteditable="true"]'))return;
    const now=Date.now();if(now-lastKey>3000)sequence='';lastKey=now;
    sequence=event.key.length===1?(sequence+event.key.toLowerCase()).slice(-6):'';
    if(sequence==='iamkmr'){sequence='';event.preventDefault();open();}
  });
  $('debug-search').addEventListener('input',search);$('debug-card').addEventListener('change',render);$('debug-pool').addEventListener('change',render);
  $('debug-prev').addEventListener('click',()=>{const index=filtered.findIndex(c=>c.id===+$('debug-card').value);if(index>0){$('debug-card').value=filtered[index-1].id;render();}});
  $('debug-next').addEventListener('click',()=>{const index=filtered.findIndex(c=>c.id===+$('debug-card').value);if(index>=0&&index<filtered.length-1){$('debug-card').value=filtered[index+1].id;render();}});
  $('close-debug').addEventListener('click',()=>dialog.close());
})();
