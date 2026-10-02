(function(root){
  'use strict';
  const keywords='守护 突进 疾驰 潜行 屏障 灵气 威慑 毁灭 虹吸 必杀 入场曲 谢幕曲 进化时 超进化时 攻击时 交战时 融合 模式 启动 吟唱 连击 协作 唤灵 土之秘术 魔力增幅时 爆能强化 激奏 结晶 瞬念召唤 奥义 解放奥义 觉醒'.split(' ');
  const normalize=s=>String(s||'').normalize('NFKC').trim().toLowerCase();
  const terms=s=>[...new Set(normalize(s).split(/[,，;；\n]+/).map(s=>s.trim()).filter(Boolean))];
  const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const classTerms={
    1:['连击','妖精','森林的奥秘','返回手牌','本回合中已使用'],
    2:['协作','爆能强化','士兵','财宝','骑士','随从进入战场'],
    3:['魔力增幅时','魔力增幅','土之秘术','土之印','天晶魔手','沉溺的实验体','手牌','原始费用'],
    4:['觉醒','能量点最大值','舍弃','受到伤害且没被破坏','海洋'],
    5:['唤灵','亡者召还','墓场','谢幕曲','自己的主战者','生命值','缺少的生命值'],
    6:['吟唱','启动','倒计数','护符','守护','回复','消失'],
    7:['创造物','悬丝傀儡','核心','复制','费用为5或以上','没有重复']
  };
  function suggestions(engine,cls=null){
    const group=(label,items,open=false)=>({label,open,items:[...new Set(items)].map(term=>({label:term,term}))});
    const groups=[group('通用关键词',keywords.slice(0,10),true),
      group('触发时点与能力结构',['入场曲','谢幕曲','进化时','超进化时','攻击时','交战时','融合','模式','启动','爆能强化','激奏','结晶','瞬念召唤','奥义','解放奥义','自己的回合开始时','自己的回合结束时','对手的回合结束时','完成形','纹章','信仰']),
      group('效果与条件',['召唤','抽取','回复','破坏','消失','返回手牌','舍弃','复制','变身','伤害','能量点','手牌','牌堆','战场','墓场','主战者','本次对战中','本回合','进化已解禁','超进化已解禁'])];
    const classes=cls==null?Object.keys(classTerms).map(Number):[Number(cls)];
    groups[2].items.push({label:'附加敌方负面能力',term:'id:enemyCurse'});
    for(const id of classes)if(classTerms[id])groups.push(group(engine.CLASSES[id]+'机制',classTerms[id],cls!=null));
    const tokens=[...(engine.TOKENS||[]),...(engine.SUPPORT_CARDS||[])].filter(t=>cls==null||t.class===0||t.class===Number(cls));
    groups.push({label:'衍生卡（Token）',open:cls!=null,items:[...new Set(tokens.map(t=>t.name))].map(name=>({label:name,term:'『'+name+'』'}))});
    return groups;
  }
  function nodes(card,scope){
    const main=card.abilities||[];
    if(scope!=='all')return main;
    const extra=[...(card.alternateForms||[]),...(card.emblems||[]),...(card.faiths||[]),...(card.tokens||[]).filter(t=>!t.related)];
    return [...main,...extra,...extra.flatMap(n=>n.abilities||[])];
  }
  function compile(options={}){
    const wanted=terms(options.query),excluded=terms(options.exclude);
    if(!wanted.length&&!excluded.length)throw Error('请输入至少一个包含或排除条件。');
    if(wanted.length+excluded.length>24)throw Error('最多使用 24 个检索条件。');
    const condition=term=>{
      if(term.startsWith('id:'))return (_,ids)=>ids.has(term.slice(3));
      const bare=term.replace(/^【|】$/g,'');
      if(keywords.includes(bare)){
        const re=new RegExp('【'+escape(bare)+'(?:\\s+[^】]+)?】');
        return text=>re.test(text);
      }
      return text=>text.includes(term);
    };
    const include=wanted.map(condition),omit=excluded.map(condition);
    return card=>{
      const list=nodes(card,options.scope),text=normalize(list.map(a=>(a.name?'『'+a.name+'』\n':'')+(a.text||'')).join('\n'));
      const ids=new Set(list.flatMap(a=>a.ids||[]).map(normalize));
      return (options.mode==='any'?(!include.length||include.some(test=>test(text,ids))):include.every(test=>test(text,ids)))&&!omit.some(test=>test(text,ids));
    };
  }
  function filterMatches(c,f={}){
    return (f.class==null||c.class===f.class)&&(f.rarity==null||c.rarity===f.rarity)&&(!f.type||c.type===f.type)&&
      (!f.costBand||(f.costBand==='0-3'?c.cost<=3:f.costBand==='4-6'?c.cost>=4&&c.cost<=6:c.cost>=7));
  }
  // Shared by the Worker and file:// fallback; yielding also makes Stop usable.
  function scan(engine,{options,start,step},emit){
    const match=compile(options),limit=Math.min(1000000,Math.max(1,Number(options.limit)||10000)),maxResults=Math.min(100,Math.max(1,Number(options.maxResults)||20));
    let checked=0,generated=0,found=0,cancelled=false,timer;
    function batch(){
      if(cancelled)return;
      try{
        const begin=performance.now(),cards=[];
        while(!cancelled&&checked<limit&&found<maxResults&&performance.now()-begin<12){
          const name='随机卡牌#'+String((start+checked*step)%100000000).padStart(8,'0');checked++;
          if(!filterMatches(engine.header(name,{chaos:options.chaos}),options.filters))continue;
          const card=engine.generate(name,{chaos:options.chaos});generated++;
          if(match(card)){cards.push(card);found++;}
        }
        const done=checked>=limit||found>=maxResults;
        if(!cancelled)emit({cards,checked,generated,found,limit,done,reason:found>=maxResults?'results':'limit'});
        if(!done&&!cancelled)timer=setTimeout(batch,0);
      }catch(e){if(!cancelled)emit({error:e.message});}
    }
    timer=setTimeout(batch,0);
    return ()=>{cancelled=true;clearTimeout(timer);};
  }
  const api={compile,filterMatches,terms,keywords,suggestions,scan};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SVWBSearch=api;
})(typeof globalThis!=='undefined'?globalThis:this);
