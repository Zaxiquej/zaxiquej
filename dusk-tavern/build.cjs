'use strict';
const fs=require('node:fs');const path=require('node:path');const D=require('./data.js');
const root=path.resolve(__dirname,'..');
const paths=[...new Set([...D.cards,...(D.retiredCards||[]),...D.spells,...D.retiredSpells,...D.amulets,...D.tokens,...D.heroes,...D.trinkets].map(c=>c.art))];
const assets={};for(const p of paths){const full=path.join(root,p);if(!fs.existsSync(full))throw Error('Missing art: '+p);assets[p]='data:image/'+(p.endsWith('.webp')?'webp':'png')+';base64,'+fs.readFileSync(full).toString('base64');}
let html=fs.readFileSync(path.join(__dirname,'shell.html'),'utf8');
const replacements={STYLE:fs.readFileSync(path.join(__dirname,'style.css'),'utf8'),ASSETS:'window.TAVERN_ASSETS='+JSON.stringify(assets)+';',IDENTITY:fs.readFileSync(path.join(__dirname,'identity.js'),'utf8'),DATA:fs.readFileSync(path.join(__dirname,'data.js'),'utf8'),ENGINE:fs.readFileSync(path.join(__dirname,'engine.js'),'utf8'),APP:fs.readFileSync(path.join(__dirname,'app.js'),'utf8')};
replacements.EXPANSION=fs.readFileSync(path.join(__dirname,'expansion.js'),'utf8');replacements.EFFECTS=fs.readFileSync(path.join(__dirname,'effects.js'),'utf8');replacements.COMBAT=fs.readFileSync(path.join(__dirname,'combat.js'),'utf8');
for(const tag of ['SCALING','BALANCE','DIVERSITY','SYNERGIES','HEROES','TUNING','ARCHETYPES','CONSTRUCTS','ROYAL','MARKET','INJURY','UTILITY','NECROMANCY','FUNCTIONAL','AMULET-EXPANSION','DECISIONS','VITALITY','RESONANCE','BARRIERS','DISTINCTIVE','NEUTRAL-ECHOES','NEUTRAL-SPELLS','COMMERCE','ASCENSION','LEADER-PORTRAITS','ARCANA','REINFORCEMENTS','EXPEDITION','REFORGED','RENEWAL','AI','ECHOES','ANIMATIONS'])replacements[tag]=fs.readFileSync(path.join(__dirname,tag.toLowerCase()+'.js'),'utf8');
for(const [tag,body] of Object.entries(replacements))html=html.replace(`/*__${tag}__*/`,()=>body);
const output=path.join(root,'sv_tavern.html');const pending=output+'.building';fs.writeFileSync(pending,html);fs.renameSync(pending,output);console.log('Built '+output+' ('+(Buffer.byteLength(html)/1024/1024).toFixed(2)+' MiB, '+paths.length+' embedded illustrations)');
