const assert=require('node:assert/strict');
module.exports=function assertNodeEffects(card){
 const nodes=new Map();
 for(const a of card.abilities){
  const node=a.trigger||'基础词条',seen=nodes.get(node)||new Set();
  for(const id of a.ids){assert(!seen.has(id),card.name+' duplicate '+node+':'+id);seen.add(id);}
  nodes.set(node,seen);
 }
};
