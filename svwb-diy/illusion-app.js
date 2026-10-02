(function(){
'use strict';
const get=id=>document.getElementById(id),Engine=window.SVIllusion;
let current=null;
function node(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
function richLine(text){const p=node('p',undefined,'ability');for(const part of text.split(/(【[^】]+】)/g))p.append(node(part.startsWith('【')?'b':'span',part));return p;}
function lines(parent,values){for(const s of values)parent.append(richLine(s));}
function render(){
 const name=get('illusion-name').value.trim()||'设计师您辛苦了';get('illusion-name').value=name;
 current=Engine.generate(name);
 const c=current,card=get('illusion-card');card.replaceChildren(node('h2',c.name));
 const meta=node('p',undefined,'card-meta');
   const cls=Engine.Data.classes.find(x=>x.id===c.cls);meta.append(node('span',cls.name,'class-label class-'+cls.color),document.createTextNode(' / 影之幻境随从 · 原创 DIY'));card.append(meta);
   const stats=node('div',undefined,'stats');for(const [label,value] of [['星级',c.star],['攻击',c.attack],['生命',c.health]]){const s=node('span',label+' ');s.append(node('b',String(value)));stats.append(s);}card.append(stats);
   const grid=node('div',undefined,'illusion-skill-grid');for(const [label,abilities] of [['进化前技能',c.pre],['进化后技能',c.post]]){const s=node('section');s.append(node('h3',label));lines(s,abilities);grid.append(s);}card.append(grid);
   if(c.evolution.length||c.superEvolution.length){const extra=node('section',undefined,'illusion-extra');lines(extra,[...c.evolution,...c.superEvolution]);card.append(extra);}
 const tokens=get('illusion-tokens');tokens.replaceChildren();
 if(c.tokens.length){tokens.append(node('h3','附属卡'));for(const t of c.tokens){const block=node('div',undefined,'token');block.append(node('h4',t.name),node('p',`${t.star} 星 · ${t.attack}/${t.health} · 幻境衍生物`,'token-meta'));block.append(node('p','进化前：'+(t.pre.join(' ')||'无能力')),node('p','进化后：'+(t.post.join(' ')||'无能力')));tokens.append(block);}}
 get('illusion-status').textContent='';
}
const tabs=[get('standard-tab'),get('illusion-tab')];
function activate(index,focus=false){tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;get(tab.getAttribute('aria-controls')).hidden=i!==index;});if(index===1&&!current)render();if(focus)tabs[index].focus();}
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>activate(i));tab.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();activate(e.key==='Home'?0:e.key==='End'?1:1-i,true);}});});
get('illusion-form').addEventListener('submit',e=>{e.preventDefault();render();});
function number(){const a=new Uint32Array(1);crypto.getRandomValues(a);return String(a[0]%100000000).padStart(8,'0');}
function randomize(variant){
 const filters={cls:get('illusion-class').value,star:get('illusion-star').value};
 const base=variant?(get('illusion-name').value.trim().replace(/#\d{4,8}$/,'')||'设计师您辛苦了'):'随机卡牌';
 // Keep the suffix even for maximum-length input, so every variant remains reproducible.
 const stem=base.slice(0,39);
 for(let i=0;i<20000;i++){const name=stem+'#'+number();if(name!==get('illusion-name').value&&Engine.matches(Engine.header(name),filters)){get('illusion-name').value=name;render();return;}}
 get('illusion-status').textContent='这次未命中筛选，请再试一次。';
}
get('illusion-random').addEventListener('click',()=>randomize(false));get('illusion-variant').addEventListener('click',()=>randomize(true));
get('illusion-copy').addEventListener('click',async()=>{if(!current)return;const text=Engine.toText(current);try{await navigator.clipboard.writeText(text);}catch(e){const area=node('textarea',text);document.body.append(area);area.select();const ok=document.execCommand('copy');area.remove();if(!ok){get('illusion-status').textContent='复制失败，请选中卡文手动复制。';return;}}get('illusion-status').textContent='已复制。';});
})();
