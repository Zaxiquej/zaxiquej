(function(root){
'use strict';
const KEY='sv-tavern-audio-v1',manifest=root.TAVERN_VOICES||{cards:{},assets:{}},cache=new Map(),pending=new Map(),active=[];
let enabled=true,volume=.65,context=null,master=null,epoch=0;
try{const p=JSON.parse(localStorage.getItem(KEY));if(p){enabled=p.enabled!==false;if(Number.isFinite(p.volume))volume=Math.max(0,Math.min(1,p.volume));}}catch{}
function persist(){try{localStorage.setItem(KEY,JSON.stringify({enabled,volume}));}catch{}}
function unlock(){if(!enabled)return;try{if(!context){context=new (root.AudioContext||root.webkitAudioContext)();master=context.createGain();master.gain.value=volume;master.connect(context.destination);}if(context.state==='suspended')context.resume().catch(()=>{});}catch{}}
function release(entry){const i=active.indexOf(entry);if(i!==-1)active.splice(i,1);entry.source.disconnect();entry.gain.disconnect();}
function end(entry){try{entry.gain.gain.cancelScheduledValues(context.currentTime);entry.gain.gain.setTargetAtTime(0,context.currentTime,.015);entry.source.stop(context.currentTime+.045);}catch{}const i=active.indexOf(entry);if(i!==-1)active.splice(i,1);}
function stop(){epoch++;for(const entry of [...active])end(entry);}
async function decode(file){if(cache.has(file)){const b=cache.get(file);cache.delete(file);cache.set(file,b);return b;}if(pending.has(file))return pending.get(file);
 const job=(async()=>{const uri=manifest.assets[file];if(!uri)return null;const raw=atob(uri.slice(uri.indexOf(',')+1)),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);const b=await context.decodeAudioData(bytes.buffer);cache.set(file,b);while(cache.size>32)cache.delete(cache.keys().next().value);return b;})();
 pending.set(file,job);try{return await job;}finally{pending.delete(file);}
}
async function play(id,kind='play'){
 if(!enabled||!volume||document.hidden)return false;const file=manifest.cards[id]?.[kind];if(!file)return false;unlock();if(!context)return false;
 const stamp=epoch,requested=performance.now();try{if(context.state==='suspended')await context.resume();if(context.state!=='running')return false;const buffer=await decode(file);if(!buffer||stamp!==epoch||!enabled||document.hidden||performance.now()-requested>700)return false;
  // APM and fast replays never accumulate a voice backlog. Keep at most two voices.
  if(kind==='play')for(const entry of [...active])end(entry);while(active.length>=2)end(active[0]);
  const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffer;gain.gain.value=kind==='play'?.85:.68;source.connect(gain);gain.connect(master);
  const entry={source,gain,id,kind};source.onended=()=>release(entry);active.push(entry);source.start();return true;
 }catch{return false;}
}
function battle(event){const cues=Array.isArray(event?.voices)?event.voices:[];for(const cue of cues.slice(0,2))if(cue)play(cue.id,cue.kind);}
root.TavernVoice={play,battle,stop,unlock,get enabled(){return enabled;},get volume(){return volume;},setEnabled(value){enabled=!!value;if(!enabled)stop();else unlock();persist();},setVolume(value){if(!Number.isFinite(value))return;volume=Math.max(0,Math.min(1,value));if(master)master.gain.setTargetAtTime(volume,context.currentTime,.025);if(!volume)stop();persist();}};
document.addEventListener('pointerdown',unlock,{capture:true,passive:true});document.addEventListener('keydown',unlock,{capture:true});document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});root.addEventListener('pagehide',stop);
})(window);
