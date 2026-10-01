'use strict';
(()=>{
  const dialog=$('inspector'),results=$('inspector-results');
  let worker=null,cards=[],runOptions=null,last={checked:0,generated:0,found:0},lastStatusTime=0;
  for(const [key,label] of [['type','类型'],['class','职业'],['rarity','稀有度'],['cost','费用段']]){
    const select=$('filter-'+key).cloneNode(true);select.id='inspector-'+key;
    const field=el('label',label);field.htmlFor=select.id;field.append(select);$('inspector-filters').append(field);
  }
  function updateChips(){
    const cls=$('inspector-class').value,container=$('inspector-chips');container.replaceChildren();
    for(const group of SVWBSearch.suggestions(SVWB,cls===''?null:Number(cls))){
      const detail=el('details'),list=el('div',undefined,'inspector-chip-list');detail.open=group.open;
      detail.append(el('summary',group.label+'（'+group.items.length+'）'),list);
      for(const {label,term} of group.items){
        const button=el('button',label,'secondary');button.type='button';
        button.addEventListener('click',()=>{
          const target=$( $('inspector-chip-target').value),terms=SVWBSearch.terms(target.value);
          if(!terms.includes(SVWBSearch.terms(term)[0]))terms.push(term);
          target.value=terms.join('，');target.focus();
        });list.append(button);
      }
      container.append(detail);
    }
  }
  $('inspector-class').addEventListener('change',updateChips);updateChips();
  function localWorker(){
    let cancel=null;
    const active={terminate(){if(cancel)cancel();},postMessage(data){cancel=SVWBSearch.scan(SVWB,data,result=>active.onmessage?.({data:result}));}};
    return active;
  }
  const status=prefix=>prefix+`已检查 ${last.checked.toLocaleString()} 个种子，生成 ${last.generated.toLocaleString()} 张，命中 ${cards.length} 张。`;
  function stop(prefix='已停止。'){
    if(worker){worker.terminate();worker=null;}
    $('inspector-start').disabled=false;$('inspector-stop').disabled=true;
    $('inspector-export').disabled=!cards.length;
    if(prefix)$('inspector-status').textContent=status(prefix);
  }
  function open(){
    if(dialog.open)return;
    if(!runOptions){for(const key of ['type','class','rarity','cost'])$('inspector-'+key).value=$('filter-'+key).value;$('inspector-chaos').checked=$('chaos').checked;}
    updateChips();dialog.showModal();$('inspector-query').focus();
  }
  function addResult(card){
    cards.push(card);
    const box=el('div',undefined,'inspector-result'),heading=el('div',undefined,'inspector-heading');
    heading.append(el('strong',card.name));
    const load=el('button','载入卡牌','secondary');load.type='button';
    load.addEventListener('click',()=>{stop();$('name').value=card.name;$('chaos').checked=!!card.chaos;render();dialog.close();$('card').scrollIntoView({block:'start'});});
    heading.append(load);box.append(heading,el('p',`${SVWB.CLASSES[card.class]} / ${SVWB.RARITIES[card.rarity]} / ${SVWB.TYPES[card.type]} · ${card.cost}费${card.type==='follower'?` · ${card.attack}/${card.health}`:''}`,'token-meta'));
    const detail=el('details');detail.append(el('summary','查看完整卡文'),el('pre',cardText(card)));box.append(detail);results.append(box);
  }
  $('inspector-form').addEventListener('submit',e=>{
    e.preventDefault();stop(null);
    const options={query:$('inspector-query').value,exclude:$('inspector-exclude').value,mode:$('inspector-mode').value,scope:$('inspector-scope').value,
      limit:Number($('inspector-limit').value),maxResults:Number($('inspector-count').value),chaos:$('inspector-chaos').checked,
      filters:{type:$('inspector-type').value||null,class:$('inspector-class').value===''?null:Number($('inspector-class').value),rarity:$('inspector-rarity').value===''?null:Number($('inspector-rarity').value),costBand:$('inspector-cost').value||null}};
    try{SVWBSearch.compile(options);}catch(err){$('inspector-status').textContent=err.message;return;}
    const bytes=new Uint32Array(2);crypto.getRandomValues(bytes);
    const start=bytes[0]%100000000;let step=bytes[1]%100000000|1;if(step%5===0)step+=2;
    runOptions={...options,start,step,version:SVWB.VERSION};cards=[];results.replaceChildren();last={checked:0,generated:0,found:0};lastStatusTime=0;
    $('inspector-progress').max=options.limit;$('inspector-progress').value=0;
    $('inspector-status').textContent='正在扫描…';$('inspector-start').disabled=true;$('inspector-stop').disabled=false;$('inspector-export').disabled=true;
    function beginScan(local=location.protocol==='file:'){
     try{
      const active=local?localWorker():new Worker('svwb-diy/inspector-worker.js?v=5.17');worker=active;
      active.onmessage=({data})=>{
        if(worker!==active)return;
        if(data.error){stop(null);$('inspector-status').textContent='检索失败：'+data.error;return;}
        last=data;data.cards.forEach(addResult);$('inspector-progress').value=data.checked;$('inspector-export').disabled=!cards.length;
        if(performance.now()-lastStatusTime>400){$('inspector-status').textContent=status('检索中。');lastStatusTime=performance.now();}
        if(data.done)stop(data.reason==='results'?'已达到结果上限。':cards.length?'本轮扫描完成。':'本轮未命中，可放宽条件或提高种子上限。');
      };
      active.onerror=e=>{
        if(worker!==active)return;e.preventDefault?.();active.terminate();
        // Discard any partial run before retrying the identical scan locally.
        cards=[];results.replaceChildren();last={checked:0,generated:0,found:0};$('inspector-progress').value=0;
        beginScan(true);
      };
      active.postMessage({options,start,step});
     }catch(err){
       if(!local){beginScan(true);return;}
       stop(null);$('inspector-status').textContent='检索无法启动：'+err.message;
     }
    }
    beginScan();
  });
  $('inspector-stop').addEventListener('click',()=>stop());
  $('inspector-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{if(worker)stop();});
  $('inspector-export').addEventListener('click',()=>{
    const blob=new Blob([JSON.stringify({search:runOptions,checked:last.checked,generated:last.generated,cards},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download='svwb-model-search.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  let sequence='',typedAt=0;
  document.addEventListener('keydown',e=>{
    if(e.ctrlKey||e.altKey||e.metaKey||e.isComposing||e.repeat||e.key.length!==1||dialog.open)return;
    if(e.target.closest('input,textarea,select,[contenteditable]')){sequence='';return;}
    const now=performance.now();if(now-typedAt>2000)sequence='';typedAt=now;
    sequence=(sequence+e.key.toLowerCase()).slice(-6);if(sequence==='iamkmr'){sequence='';open();}
  });
  $('name').addEventListener('input',()=>{if($('name').value.toLowerCase()==='iamkmr'){$('name').value=current?.name||'设计师您辛苦了';open();}});
  window.iamkmr=open;
  window.SVWBInspector=Object.freeze({open,stop,getResults:()=>structuredClone(cards)});
})();
