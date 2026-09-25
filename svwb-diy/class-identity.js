(function(root){
  'use strict';
  // Literal official-card features, not mutually exclusive archetypes.
  const rules={
    1:{combo:/连击|本回合.*使用.*张/,supply:/『妖精』|森林的奥秘/,return:/自己的[^。]*返回手牌/},
    2:{board:/召唤|士兵|骑士|随从进入战场/,buff:/\+\d+\/\+\d+/,enhance:/爆能强化/,treasure:/财宝|金币|海盗旗|黄金短剑|黄金项链/,rally:/协作/},
    3:{boost:/魔力增幅/,earth:/土之/,hands:/天晶魔手/,experiment:/沉溺的实验体/,truth:/费用.*原始|手牌[^。]*费用\+|费用不为/},
    4:{ramp:/能量点最大值\+/,overflow:/觉醒|能量点最大值为10/,discard:/舍弃/,hurt:/受到伤害且没被破坏/,ocean:/海洋|大海虎鲸|乙姬近卫兵/},
    5:{death:/谢幕曲|亡者召还|唤灵|墓场|腐臭的僵尸|亡者·/,blood:/自己的主战者[^。]*生命值为\d+或以下|对自己的主战者造成|对所有主战者造成|缺少的生命值/},
    6:{amulet:/护符|倒计数|吟唱|启动/,ward:/守护/,heal:/回复自己的主战者|自己的主战者回复/,banish:/消失/},
    7:{artifact:/创造物|核心/,puppet:/悬丝傀儡/,high:/费用为5或以上/,copy:/复制/,singleton:/没有重复/}
  };
  function families(cls,{ids=[],tokens=[],trigger='',condition='none',engineSpec,progression}={}){
    const result=new Set(),all=[...ids.map(id=>id.replace(/^fusionEvent:/,'')),condition,engineSpec?.eventId,progression?.eventId].filter(Boolean);
    const has=re=>all.some(id=>re.test(id)),token=re=>tokens.some(t=>re.test(t.name||''));
    const put=(name,yes)=>{if(yes)result.add(name);};
    if(cls===1){put('combo',has(/^(combo|forestHistory|fairy|play|leave)$/));put('supply',token(/妖精|森林的奥秘/)&&has(/Supply|^(tokenHand|tokenSummon|summon|commonSupply)$/));put('return',has(/^bounce$/));}
    if(cls===2){put('board',has(/^(tokenSummon|summon|selfCopy|recruit|tribe|rally)/));put('buff',has(/^(allyBuff|teamBuff|buff|handBuff|tribeBuff|summonGrowth)$/));put('enhance',trigger==='爆能强化'||has(/^enhance/));put('treasure',has(/^(treasure|coin|flag)/)||token(/海盗旗|黄金短剑|黄金项链|金币/));put('rally',has(/^rally/));}
    if(cls===3){put('boost',has(/^(boost|spellboost|spells|costReduction)/));put('earth',has(/^earth/));put('hands',has(/^crystalHand/)||trigger.includes('天晶魔手')||token(/天晶魔手/));put('experiment',has(/^experiment/)||trigger.includes('沉溺的实验体')||token(/沉溺的实验体/));put('truth',has(/^(handCostUp|costChanged|truthTransform)/));}
    if(cls===4){put('ramp',has(/^ramp$/));put('overflow',has(/^(overflow|ppFull)$/));put('discard',has(/^discard/));put('hurt',has(/^(hurt|allyPing|allBoardDamage)/)||trigger.includes('受到伤害且没被破坏'));put('ocean',token(/大海虎鲸|乙姬近卫兵/)||has(/^tribe/));}
    if(cls===5){put('death',trigger==='谢幕曲'||has(/^(grave|necromancy|reanimate|resurrectSelf|tribe)/)||token(/腐臭的僵尸|怨灵/));put('blood',has(/^(blood|selfDamage|lowHealth|missingHealth|lowestLeader|highestLeader)/));}
    if(cls===6){put('amulet',has(/^(amulet|activeAmulet|activate|havenHighCost)/));put('ward',has(/^(ward|守护|grantWard|summonWard)/));put('heal',has(/^heal/));put('banish',has(/^banish/));}
    if(cls===7){put('artifact',has(/^(artifact|coreSupply|corePair|fusionArtifact)/)||tokens.some(t=>t.tribe==='创造物'));put('puppet',token(/悬丝傀儡/));put('high',has(/^(portalHighCost|highCostEnter)$/));put('copy',has(/^(artifactCopy|selfCopy|opponent.*Copy)/));put('singleton',has(/^singleton$/));}
    return [...result];
  }
  function cardFamilies(card){
    const tags=new Set();
    const visit=a=>{families(card.class,a).forEach(t=>tags.add(t));(a.modeBranches||[]).forEach(visit);};
    (card.abilities||[]).filter(a=>a.kind!=='alternate').forEach(visit);
    for(const e of card.emblems||[])families(card.class,{ids:e.supportTags||[],condition:e.conditionId,trigger:e.eventText||''}).forEach(t=>tags.add(t));
    for(const f of card.faiths||[])for(const g of f.gainRules||[])families(card.class,{ids:[g.eventId]}).forEach(t=>tags.add(t));
    if(card.handTrigger)families(card.class,{ids:[card.handTrigger.eventId]}).forEach(t=>tags.add(t));
    return [...tags];
  }
  function compile(reference){
    const rows=reference.cards.filter(c=>c.type===1&&!c.token&&c.class!==0).map(c=>({...c,features:Object.entries(rules[c.class]).filter(([,re])=>re.test(c.text)).map(([id])=>id)}));
    const profiles={},classes={};
    for(let cls=1;cls<=7;cls++){
      const all=rows.filter(c=>c.class===cls);
      classes[cls]={cards:all.length,highRarity:all.filter(c=>c.rarity>=3).length,features:Object.fromEntries(Object.keys(rules[cls]).map(id=>[id,{all:all.filter(c=>c.features.includes(id)).length,highRarity:all.filter(c=>c.rarity>=3&&c.features.includes(id)).length,cardIds:all.filter(c=>c.features.includes(id)).map(c=>c.id)}]))};
      for(let b=0;b<3;b++)for(let rarity=0;rarity<4;rarity++){
        const br=all.filter(c=>(c.cost<=3?0:c.cost<=6?1:2)===b),local=br.filter(c=>c.rarity===rarity+1);
        profiles[`${b}:${cls}:${rarity}`]=Object.fromEntries(Object.keys(rules[cls]).map(id=>{
          const base=(all.filter(c=>c.features.includes(id)).length+.5)/(all.length+1);
          const parent=(br.filter(c=>c.features.includes(id)).length+base*8)/(br.length+8);
          return [id,+((local.filter(c=>c.features.includes(id)).length+parent*6)/(local.length+6)).toFixed(5)];
        }));
      }
    }
    return {source:reference.source,retrieved:reference.retrieved,method:'Non-token follower text; overlapping features, six-card local shrinkage within each class; counts are design priors, not deck inclusion rates.',classes,profiles};
  }
  const api={rules,families,cardFamilies,compile};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SVWBClassIdentity=api;
})(typeof globalThis!=='undefined'?globalThis:this);
