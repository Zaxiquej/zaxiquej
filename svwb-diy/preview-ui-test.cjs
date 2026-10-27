const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const S=require('./engine'),examples=require('./preview-mechanics-validation.json').showcases;
class Element{
 constructor(tag,text=''){this.tagName=tag;this.textContent=text;this.children=[];this.value='';this.checked=false;this.parentElement={};this.style={};}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this.children=nodes;}
 addEventListener(){} setAttribute(){} focus(){} select(){} scrollIntoView(){}
}
const elements=new Map(),get=id=>{if(!elements.has(id))elements.set(id,new Element('div'));return elements.get(id);};
get('name').value='设计师您辛苦了';
const context={SVWB:S,document:{getElementById:get,createElement:tag=>new Element(tag),createTextNode:text=>new Element('#text',text)},navigator:{},console};
vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'app.js'),'utf8'),context);
get('name').value=examples.evidenceSummon.name;vm.runInContext('render()',context);
assert.equal(get('status').textContent,'已生成');
const flat=e=>[e,...e.children.flatMap(flat)],nodes=flat(get('tokens'));
assert(nodes.some(e=>e.textContent.includes('官方')));
assert(!nodes.some(e=>e.textContent.includes('暂译')));
const link=nodes.find(e=>e.tagName==='a'&&e.href.endsWith('card_id=90001210'));
assert.equal(link.textContent,'在官方图鉴中查看 ↗');
assert.match(vm.runInContext('cardText(current)',context),/官方/);
get('name').value=examples.evidenceCarrier.name;vm.runInContext('render()',context);
assert.equal(get('attack').parentElement.hidden,true);
assert(flat(get('abilities')).some(e=>e.textContent==='【证据】'));
assert.equal(get('status').textContent,'已生成');
const systems=require('./preview-systems-validation.json');
get('name').value=systems.samples.rabbitSupplied.name;vm.runInContext('render()',context);
assert(flat(get('tokens')).some(e=>e.textContent===S.PREVIEW.rabbit.name));
assert(flat(get('tokens')).some(e=>e.textContent.includes('本随从进入战场时')));
assert(flat(get('tokens')).some(e=>e.tagName==='a'&&e.href.endsWith('card_id=90061140')));
console.log('Preview rendering, source link, clipboard text and amulet fields passed (DOM harness).');
