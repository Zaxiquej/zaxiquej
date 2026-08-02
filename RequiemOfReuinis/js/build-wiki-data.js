'use strict';

const fs = require('fs');
const path = require('path');
const source = path.resolve(process.argv[2] || 'E:/列乌尼斯/000XK/再启的新坑 - 副本');
const output = path.resolve(process.argv[3] || path.join(__dirname, 'wiki-data.js'));
const readJson = rel => { let value = fs.readFileSync(path.join(source, rel), 'utf8'); if (value.charCodeAt(0) === 0xFEFF) value = value.slice(1); return JSON.parse(value); };
const exists = rel => fs.existsSync(path.join(source, rel));

const lang = { zh: readJson('ch.json'), en: readJson('en.json'), ja: readJson('jp.json') };
const armors = readJson('data/Armors.json');
const skillsDb = readJson('data/Skills.json');
const enemiesDb = readJson('data/Enemies.json');
const itemsDb = readJson('data/Items.json');
const mapInfos = readJson('data/MapInfos.json');
const commonEvents = readJson('data/CommonEvents.json');
const researchJs = fs.readFileSync(path.join(source, 'js/plugins/Research.js'), 'utf8');
const buildingSetupJs = fs.readFileSync(path.join(source, 'js/plugins/BuildingSetup.js'), 'utf8');
const fastTravelJs = fs.readFileSync(path.join(source, 'js/plugins/FastTravel.js'), 'utf8');
const exStatSourceJs = fs.readFileSync(path.join(source, 'js/plugins/ExStat.js'), 'utf8');

const numericKeys = object => Object.keys(object || {}).filter(key => /^\d+$/.test(key)).map(Number);
const nonBlank = value => value !== undefined && value !== null && String(value).trim() !== '';
const rawFallback = value => String(value || '').replace(/^#\{[^}]+\}$/, '');
const resolveLanguageText = (code, value, seen) => {
  const visited = seen || new Set();
  return String(value || '').replace(/#\{([^.}]+)\.([^}]+)\}/g, function(match, nestedGroup, nestedKey) {
    const token = nestedGroup + '.' + nestedKey;
    if (visited.has(token)) return match;
    const sourceGroup = lang[code] && lang[code][nestedGroup];
    const fallbackGroup = lang.zh && lang.zh[nestedGroup];
    const nested = sourceGroup && sourceGroup[nestedKey] !== undefined ? sourceGroup[nestedKey] : fallbackGroup && fallbackGroup[nestedKey];
    if (!nonBlank(nested)) return match;
    const next = new Set(visited); next.add(token);
    return resolveLanguageText(code, nested, next);
  });
};
const localized = (group, key, fallback) => {
  const out = {};
  for (const code of ['zh', 'en', 'ja']) {
    const value = lang[code] && lang[code][group] && lang[code][group][key];
    out[code] = resolveLanguageText(code, nonBlank(value) ? value : rawFallback(fallback || ''));
  }
  return out;
};
const localizedSkillDescription = (baseId, tier, fallback) => {
  const base = localized('mskill', 'd' + baseId, fallback);
  if (!tier) return base;
  const variant = localized('mskill', 'd' + baseId + '_' + tier, '');
  for (const code of ['zh', 'en', 'ja']) if (!nonBlank(variant[code])) variant[code] = base[code];
  return variant;
};
const localizedSkillUpgrade = (baseId, tier) => localized('mskill', 'u' + baseId + '_' + tier, '');
const parseTags = note => {
  const tags = {};
  const regex = /<([^:>\r\n]+)(?::([^>\r\n]*))?>/g;
  let match;
  while ((match = regex.exec(String(note || '')))) {
    const key = match[1].trim();
    const value = match[2] === undefined ? true : match[2].trim();
    if (tags[key] === undefined) tags[key] = value;
    else if (Array.isArray(tags[key])) tags[key].push(value);
    else tags[key] = [tags[key], value];
  }
  return tags;
};
const firstTag = (tags, ...keys) => {
  for (const key of keys) if (tags[key] !== undefined) return Array.isArray(tags[key]) ? tags[key][0] : tags[key];
  return '';
};
const numberTag = (tags, ...keys) => {
  const value = Number(firstTag(tags, ...keys));
  return Number.isFinite(value) ? value : 0;
};

function parseAcquisition(rel) {
  if (!exists(rel)) return {};
  const result = {};
  for (const line of fs.readFileSync(path.join(source, rel), 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*(\d+)\.\s*([^｜|]+)[｜|](.+?)\s*$/);
    if (match) result[Number(match[1])] = { name: match[2].trim(), text: match[3].trim() };
  }
  return result;
}
const armorAcquisition = parseAcquisition('装备获取方式清单.txt');
const skillAcquisition = parseAcquisition('技能获取方式清单.txt');

const acquisitionNameGroups = ['armorname','itemname','mskill','research','enemyname','bossShow','mapdesc','extraGame','actorname'];
const acquisitionNameLookup = { en: new Map(), ja: new Map() };
for (const group of acquisitionNameGroups) {
  const sourceGroup = lang.zh[group] || {};
  for (const key of Object.keys(sourceGroup)) {
    const zhText = resolveLanguageText('zh', sourceGroup[key]).trim();
    if (!zhText || zhText.includes('\\') || zhText.includes('#{')) continue;
    for (const code of ['en','ja']) {
      const targetGroup = lang[code][group] || {};
      const target = resolveLanguageText(code, targetGroup[key]).trim();
      if (target && !target.includes('#{') && (!acquisitionNameLookup[code].has(zhText) || target !== zhText)) {
        acquisitionNameLookup[code].set(zhText, target);
      }
    }
  }
}
const acquisitionFixedTerms = {
  en: {
    '西风商会':'Westwind Guild','月桂商路':'Laurel Trade Route','拾荒者的物资':"Scavenger's Supplies",
    '春节':'Lunar New Year','金币':'money','雕像':'Statue','研究点':'research point','玫瑰':'a rose','瓶装物品':'a bottled item'
  },
  ja: {
    '西风商会':'西風商会','月桂商路':'月桂交易路','拾荒者的物资':'スカベンジャーの物資',
    '春节':'春節','金币':'お金','雕像':'石像','研究点':'研究ポイント','玫瑰':'バラ','瓶装物品':'瓶入りの品'
  }
};
function acquisitionTerm(value, code) {
  const text = String(value || '').trim();
  if (acquisitionFixedTerms[code][text]) return acquisitionFixedTerms[code][text];
  if (acquisitionNameLookup[code].has(text)) return acquisitionNameLookup[code].get(text);
  const equip = text.match(/^装备：(.+)$/);
  if (equip) return (code === 'en' ? 'Equipment: ' : '装備：') + acquisitionTerm(equip[1], code);
  return text;
}
const acquisitionQuote = (value, code) => code === 'en' ? '“' + value + '”' : '「' + value + '」';
function translateAcquisition(text, code) {
  const sourceText = String(text || '').trim();
  if (!sourceText || code === 'zh') return sourceText;
  const q = value => acquisitionTerm(value, code);
  const qt = value => acquisitionQuote(q(value), code);
  let m;

  m = sourceText.match(/^首次获得(.+)和(.+)，分别完成「(.+)」「(.+)」→「(.+)」→「(.+)」，解锁并完成「装备：(.+)」$/);
  if (m) return code === 'en'
    ? 'Obtain ' + q(m[1]) + ' and ' + q(m[2]) + ' for the first time; complete ' + qt(m[3]) + ' and ' + qt(m[4]) + ', followed by ' + qt(m[5]) + ' and ' + qt(m[6]) + '; then unlock and complete ' + qt('装备：' + m[7]) + '.'
    : q(m[1]) + 'と' + q(m[2]) + 'を初めて入手し、' + qt(m[3]) + 'と' + qt(m[4]) + '、続けて' + qt(m[5]) + 'と' + qt(m[6]) + 'を完了してから、' + qt('装备：' + m[7]) + 'を解放・完了する。';

  m = sourceText.match(/^完成开局已解锁的「(.+)」，再完成随之解锁的「装备：(.+)」$/);
  if (m) return code === 'en'
    ? 'Complete the initially unlocked ' + qt(m[1]) + ' research, then complete the newly unlocked ' + qt('装备：' + m[2]) + ' research.'
    : 'ゲーム開始時から解放されている' + qt(m[1]) + 'を完了し、続いて解放される' + qt('装备：' + m[2]) + 'を完了する。';

  m = sourceText.match(/^首次获得(.+)，完成「(.+)」，再完成随之解锁的「装备：(.+)」$/);
  if (m) return code === 'en'
    ? 'Obtain ' + q(m[1]) + ' for the first time, complete ' + qt(m[2]) + ', then complete the newly unlocked ' + qt('装备：' + m[3]) + ' research.'
    : q(m[1]) + 'を初めて入手し、' + qt(m[2]) + 'を完了してから、続いて解放される' + qt('装备：' + m[3]) + 'を完了する。';

  m = sourceText.match(/^首次获得(.+)时解锁「装备：(.+)」，再完成该研究$/);
  if (m) return code === 'en'
    ? 'Obtain ' + q(m[1]) + ' for the first time to unlock ' + qt('装备：' + m[2]) + ', then complete the research.'
    : q(m[1]) + 'を初めて入手すると' + qt('装备：' + m[2]) + 'が解放される。その研究を完了する。';

  m = sourceText.match(/^在「(.+)」的研究点解锁「装备：(.+)」，再完成该研究$/);
  if (m) return code === 'en'
    ? 'Unlock ' + qt('装备：' + m[2]) + ' at a research point in ' + qt(m[1]) + ', then complete the research.'
    : qt(m[1]) + 'の研究ポイントで' + qt('装备：' + m[2]) + 'を解放し、その研究を完了する。';

  m = sourceText.match(/^在「(.+)」取得并完成「(.+)」研究后，(.+)进货并可购买$/);
  if (m) return code === 'en'
    ? 'Obtain and complete the ' + qt(m[2]) + ' research in ' + qt(m[1]) + '; it will then become available from the ' + q(m[3]) + '.'
    : qt(m[1]) + 'で' + qt(m[2]) + 'の研究を入手・完了すると、' + q(m[3]) + 'に入荷する。';

  m = sourceText.match(/^在「(.+)」触发(.+)进货，之后在该商店购买$/);
  if (m) return code === 'en'
    ? 'Trigger new stock for the ' + q(m[2]) + ' in ' + qt(m[1]) + ', then purchase it there.'
    : qt(m[1]) + 'で' + q(m[2]) + 'への入荷を発生させ、その店で購入する。';

  if (sourceText === '据点剧情开放市场时自动进货，之后在西风商会购买') return code === 'en'
    ? 'Automatically stocked when the market opens during the base story; purchase it from the Westwind Guild afterward.'
    : '拠点の物語で市場が解放されると自動的に入荷し、以後は西風商会で購入できる。';

  if (sourceText === '在废弃矿坑与拾荒者交谈，开启拾荒者的物资并进货后购买') return code === 'en'
    ? "Speak with the Scavenger in “Abandoned Mine” to open the Scavenger's Supplies and stock the item, then purchase it."
    : '「廃鉱」でスカベンジャーと会話し、スカベンジャーの物資を開放して入荷させた後に購入する。';

  m = sourceText.match(/^(.+)宝箱（击败(.+)后出现）$/);
  if (m) return code === 'en'
    ? 'Found in a chest in ' + qt(m[1]) + ' that appears after defeating ' + q(m[2]) + '.'
    : q(m[2]) + 'を倒すと出現する、' + qt(m[1]) + 'の宝箱から入手。';

  m = sourceText.match(/^(.+)宝箱$/);
  if (m) return code === 'en' ? 'Found in a chest in ' + qt(m[1]) + '.' : qt(m[1]) + 'の宝箱から入手。';

  m = sourceText.match(/^(.+)区域谜题奖励$/);
  if (m) return code === 'en' ? 'Puzzle reward in the ' + qt(m[1]) + ' area.' : qt(m[1]) + 'エリアの謎解き報酬。';

  m = sourceText.match(/^战胜(.+)奖励$/);
  if (m) return code === 'en' ? 'Reward for defeating ' + q(m[1]) + '.' : q(m[1]) + 'の撃破報酬。';

  m = sourceText.match(/^收藏家收集(\d+)件装备奖励$/);
  if (m) return code === 'en' ? 'Reward from the Collector for collecting ' + m[1] + ' pieces of equipment.' : '装備を' + m[1] + '個収集した際のコレクター報酬。';

  m = sourceText.match(/^食火者(\d+)次火焰奖励$/);
  if (m) return code === 'en' ? "Reward for triggering the Fire Eater's flame " + m[1] + ' times.' : '食火者の炎を' + m[1] + '回発動した報酬。';

  m = sourceText.match(/^解锁收藏家并持有至少(\d+)金币后加入西风商会商店$/);
  if (m) return code === 'en' ? 'Added to the Westwind Guild after unlocking the Collector and holding at least ' + m[1] + ' money.' : 'コレクターを解放し、所持金が' + m[1] + '以上になると西風商会に入荷する。';

  m = sourceText.match(/^到达(.+)并持有至少(\d+)金币后加入西风商会商店$/);
  if (m) return code === 'en' ? 'Added to the Westwind Guild after reaching ' + qt(m[1]) + ' and holding at least ' + m[2] + ' money.' : qt(m[1]) + 'に到達し、所持金が' + m[2] + '以上になると西風商会に入荷する。';

  m = sourceText.match(/^持有至少(\d+)金币后加入西风商会商店$/);
  if (m) return code === 'en' ? 'Added to the Westwind Guild after holding at least ' + m[1] + ' money.' : '所持金が' + m[1] + '以上になると西風商会に入荷する。';

  if (sourceText === '春节期间加入西风商会商店') return code === 'en'
    ? 'Available from the Westwind Guild during Lunar New Year.'
    : '春節の期間中、西風商会に入荷する。';

  if (sourceText === '佩戴剧毒蛛眼、玫瑰与瓶装物品，完成对应谜题') return code === 'en'
    ? 'Equip ' + q('剧毒蛛眼') + ', ' + q('玫瑰') + ', and ' + q('瓶装物品') + ', then complete the corresponding puzzle.'
    : q('剧毒蛛眼') + '、' + q('玫瑰') + '、' + q('瓶装物品') + 'を装備し、対応する謎を解く。';

  m = sourceText.match(/^(?!装备收集数达到)(.+)奖励$/);
  if (m) return code === 'en' ? 'Reward from ' + q(m[1]) + '.' : q(m[1]) + 'の報酬。';

  if (sourceText === '开局剧情中自动习得') return code === 'en' ? 'Learned automatically during the opening story.' : '序盤の物語で自動的に習得する。';

  m = sourceText.match(/^在「(.+)」触发事件，之后在雕像学习$/);
  if (m) return code === 'en' ? 'Trigger the event in ' + qt(m[1]) + ', then learn it at the Statue.' : qt(m[1]) + 'でイベントを発生させた後、石像で習得する。';

  m = sourceText.match(/^在「(.+)」的剧情中习得$/);
  if (m) return code === 'en' ? 'Learned during the story in ' + qt(m[1]) + '.' : qt(m[1]) + 'の物語で習得する。';

  m = sourceText.match(/^在「(.+)」取得「(.+)」后，在雕像学习$/);
  if (m) return code === 'en' ? 'Obtain ' + qt(m[2]) + ' in ' + qt(m[1]) + ', then learn it at the Statue.' : qt(m[1]) + 'で' + qt(m[2]) + 'を入手した後、石像で習得する。';

  m = sourceText.match(/^装备收集数达到(\d+)后，从收藏家处领取装备收藏奖励$/);
  if (m) return code === 'en' ? 'Collect ' + m[1] + ' pieces of equipment, then claim the collection reward from the Collector.' : '装備を' + m[1] + '個収集し、コレクターから収集報酬を受け取る。';

  m = sourceText.match(/^解锁「(.+)」时随剧情习得$/);
  if (m) return code === 'en' ? 'Learned during the story when ' + qt(m[1]) + ' is unlocked.' : qt(m[1]) + 'を解放する物語で習得する。';

  m = sourceText.match(/^在「(.+)」战胜(.+)后习得$/);
  if (m) return code === 'en' ? 'Learned after defeating ' + q(m[2]) + ' in ' + qt(m[1]) + '.' : qt(m[1]) + 'で' + q(m[2]) + 'を倒すと習得する。';

  m = sourceText.match(/^解锁并启用额外模式「(.+)」后，在游戏开始时习得$/);
  if (m) return code === 'en' ? 'Unlock and enable the extra mode ' + qt(m[1]) + ' to learn it at the start of the game.' : '追加モード' + qt(m[1]) + 'を解放・有効化すると、ゲーム開始時に習得する。';

  throw new Error('Unsupported acquisition text: ' + sourceText);
}
const localizedAcquisition = text => ({ zh:String(text || '').trim(), en:translateAcquisition(text,'en'), ja:translateAcquisition(text,'ja') });

const itemName = id => { const item = itemsDb[id]; const raw = String(item && item.name || ''); const dot = raw.indexOf('.'); return raw.startsWith('#{') && raw.endsWith('}') && dot > 2 ? localized(raw.slice(2, dot), raw.slice(dot + 1, -1), raw) : localized('itemname', id, raw || 'Item ' + id); };
const itemIcon = id => itemsDb[id] ? (itemsDb[id].iconIndex || 0) : 0;

const equipment = numericKeys(lang.zh.armorname)
  .filter(id => id > 0 && armors[id] && armors[id].iconIndex > 0 && nonBlank(lang.zh.armorname[id]))
  .map(id => {
    const armor = armors[id];
    const tags = parseTags(armor.note);
    return {
      id: id,
      name: localized('armorname', id, armor.name),
      description: localized('armordesc', id, armor.description),
      upgrades: { plus: localized('armordesc', 'U' + id, ''), max: localized('armordesc', 'D' + id, '') },
      icon: armor.iconIndex,
      slots: numberTag(tags, 'cost') || 0,
      price: armor.price || 0,
      params: { hp: armor.params && armor.params[0] || 0, mp: armor.params && armor.params[1] || 0, atk: armor.params && armor.params[2] || 0, def: armor.params && armor.params[3] || 0 },
      tags: tags,
      tagNames: Object.keys(tags),
      acquisition: armorAcquisition[id] ? localizedAcquisition(armorAcquisition[id].text) : { zh:'', en:'', ja:'' },
      sourceKnown: Boolean(armorAcquisition[id])
    };
  });

const skills = [];
for (let id = 1; id <= 160; id++) {
  const base = skillsDb[id];
  if (!base || base.iconIndex <= 0 || !nonBlank(lang.zh.mskill && lang.zh.mskill[id]) || !String(base.note || '').trim()) continue;
  const variants = [id, id + 160, id + 320].map((variantId, tier) => {
    const data = skillsDb[variantId];
    if (!data || !String(data.note || '').trim()) return null;
    const tags = parseTags(data.note);
    const costs = {};
    for (const key of ['iron', 'copper', 'silver', 'gold']) {
      const value = numberTag(tags, key);
      if (value) costs[key] = value;
    }
    return { id: variantId, tier: tier, icon: data.iconIndex || base.iconIndex, mpCost: data.mpCost || 0, pp: numberTag(tags, 'pp'), range: firstTag(tags, 'range'), target: firstTag(tags, 'target'), type: firstTag(tags, 'type'), costs: costs, tags: tags, description: localizedSkillDescription(id, tier, data.description), upgradeDescription: tier ? localizedSkillUpgrade(id, tier) : { zh:'', en:'', ja:'' } };
  }).filter(Boolean);
  const tags = parseTags(base.note);
  const actorId = Number(firstTag(tags, 'actorIconId')) || 0;
  skills.push({
    id: id,
    name: localized('mskill', id, base.name),
    description: localized('mskill', 'd' + id, base.description),
    flavor: localized('mskill', 's' + id, ''),
    icon: base.iconIndex,
    actorId: actorId,
    actor: localized('actorname', actorId, actorId ? 'Actor ' + actorId : ''),
    type: firstTag(tags, 'type') || 'other',
    target: firstTag(tags, 'target') || 'other',
    range: firstTag(tags, 'range') || '',
    variants: variants,
    acquisition: skillAcquisition[id] ? localizedAcquisition(skillAcquisition[id].text) : { zh:'', en:'', ja:'' },
    sourceKnown: Boolean(skillAcquisition[id]),
    tags: tags,
    tagNames: Object.keys(tags)
  });
}

function safeExpression(block, field) {
  const match = block.match(new RegExp('this\\._' + field + '\\s*=\\s*([^;]+);'));
  if (!match) return undefined;
  const expression = match[1].trim();
  if (!/^[\s\dA-Za-z_\[\],."'+\-]+$/.test(expression)) return undefined;
  try { return Function('"use strict"; return (' + expression + ');')(); } catch (error) { return undefined; }
}
const setupStart = researchJs.indexOf('Game_Research.prototype.setup');
const setupEnd = researchJs.indexOf('Game_GlobalBuilding.prototype.checkResearch', setupStart);
const setupBody = researchJs.slice(setupStart, setupEnd);
const researchCases = {};
const caseRegex = /case\s+(\d+)\s*:\s*([\s\S]*?)(?=\n\s*case\s+\d+\s*:|\n\s*default\s*:)/g;
let caseMatch;
while ((caseMatch = caseRegex.exec(setupBody))) researchCases[Number(caseMatch[1])] = caseMatch[2];

const officialAreaByMapId = new Map();
const teleportStart = fastTravelJs.indexOf('Scene_FastTravel.prototype.teleportMap');
const teleportBody = fastTravelJs.slice(teleportStart, fastTravelJs.indexOf('//  if ($gameSwitches.value(199))', teleportStart));
for (const match of teleportBody.matchAll(/if\s*\(id\s*==\s*(\d+)\)\s*\{[\s\S]*?this\._relatedMaps\s*=\s*\[([^\]]*)\]/g)) {
  const areaCode = String(Number(match[1]));
  if (!lang.zh.mapdesc || !nonBlank(lang.zh.mapdesc['t' + areaCode + 'a'])) continue;
  for (const mapId of match[2].split(',').map(Number).filter(Number.isFinite)) officialAreaByMapId.set(mapId, areaCode);
}

const internalMapIds = new Set([1, 2, 5, 8, 13, 19, 20, 21, 22]);
const internalNamePattern = /(仓库地图|备用地图|开始地图|市场地图备份|市场地图$|建筑地图|据点剧情|教会剧情|测试|废案|临时|片头|结局动画|^废弃$)/i;
const areaRules = [
  { code: '1', re: /(幽暗.*洞窟|洞窟炼金室)/ }, { code: '2', re: /朝圣者山穴/ },
  { code: '3', re: /瘴气林地/ }, { code: '4', re: /精灵王庭/ },
  { code: '5', re: /白石之城/ }, { code: '7', re: /废弃矿坑/ },
  { code: '8', re: /边陲雪线/ }, { code: '9', re: /失落圣地/ },
  { code: '10', re: /遗珠歌剧院/ }, { code: '11', re: /熔岩工厂/ },
  { code: '20', re: /王都外围/ }, { code: '21', re: /天穹观星塔/ },
  { code: '22', re: /魔导图书馆/ }, { code: '23', re: /列乌尼斯/ },
  { code: '24', re: /巴别塔/ }
];
const areaCodeFor = name => {
  const result = areaRules.find(rule => rule.re.test(name || ''));
  return result ? result.code : '';
};
const areaLocalizedName = (name, code) => code ? localized('mapdesc', 't' + code + 'a', name) : { zh: name, en: name, ja: name };
const mapLocalizedName = (name, code) => {
  if (!code) return { zh: name, en: name, ja: name };
  const official = localized('mapdesc', 't' + code + 'a', name);
  const base = String(lang.zh.mapdesc && lang.zh.mapdesc['t' + code + 'a'] || '');
  const normalizedName = String(name || '').replace(/的/g, '');
  const normalizedBase = base.replace(/的/g, '');
  const at = normalizedBase ? normalizedName.indexOf(normalizedBase) : -1;
  if (at < 0) return { zh: name, en: name, ja: name };
  const suffix = normalizedName.slice(at + normalizedBase.length).trim();
  return { zh: name, en: official.en + (suffix ? ' · ' + suffix : ''), ja: official.ja + (suffix ? '・' + suffix : '') };
};
const areaDescription = code => code ? localized('mapdesc', code, '') : { zh: '', en: '', ja: '' };

const mapCache = {};
for (const info of mapInfos.filter(Boolean)) {
  const filename = 'data/Map' + String(info.id).padStart(3, '0') + '.json';
  if (!exists(filename)) continue;
  try { mapCache[info.id] = readJson(filename); } catch (error) {}
}
const parentOf = id => mapInfos[id] ? (mapInfos[id].parentId || 0) : 0;
function rootMap(id) {
  const seen = new Set();
  let current = id;
  while (parentOf(current) && !seen.has(current)) {
    seen.add(current);
    current = parentOf(current);
  }
  return mapInfos[current] || mapInfos[id];
}
function scriptsForEvent(event) {
  const chunks = [];
  for (const page of event.pages || []) {
    let current = '';
    for (const command of page.list || []) {
      if (command.code === 355) {
        if (current) chunks.push(current);
        current = String(command.parameters && command.parameters[0] || '');
      } else if (command.code === 655) current += '\n' + String(command.parameters && command.parameters[0] || '');
      else if (current) { chunks.push(current); current = ''; }
    }
    if (current) chunks.push(current);
  }
  return chunks.join('\n');
}

function researchIdsFromScript(script) {
  const ids = new Set();
  for (const match of String(script || '').matchAll(/(?:Game_GlobalResearch\.prototype\.)?learn\s*\(\s*(\d+)\s*\)/g)) ids.add(Number(match[1]));
  for (const match of String(script || '').matchAll(/for\s*\(\s*let\s+(\w+)\s*=\s*(\d+)\s*;\s*\1\s*<=\s*(\d+)[\s\S]{0,180}?learn\s*\(\s*\1\s*\)/g)) {
    for (let id = Number(match[2]); id <= Number(match[3]); id++) ids.add(id);
  }
  return ids;
}
function scriptsForCommandList(list) {
  return scriptsForEvent({ pages: [{ list: list || [] }] });
}
const commonEventResearch = new Map();
for (const common of commonEvents.filter(Boolean)) commonEventResearch.set(common.id, researchIdsFromScript(scriptsForCommandList(common.list)));

const enemyAppearances = new Map();
const bossEnemyIds = new Set();
const researchEventMaps = new Map();
const mapRecords = [];
for (const info of mapInfos.filter(Boolean)) {
  const map = mapCache[info.id];
  if (!map) continue;
  const internal = internalMapIds.has(info.id) || internalNamePattern.test(info.name || '');
  const root = rootMap(info.id);
  const combinedName = (info.name || '') + ' ' + (root && root.name || '');
  const areaCode = officialAreaByMapId.get(info.id) || areaCodeFor(combinedName);
  const markers = {};
  const localEnemyIds = new Set();
  const researchIds = new Set();
  const transfers = new Set();
  const mapEventById = Object.fromEntries((map.events || []).filter(Boolean).map(event => [event.id, event]));
  for (const event of (map.events || []).filter(Boolean)) {
    const marker = String(event.name || '').match(/【([^】]+)】/);
    if (marker) markers[marker[1]] = (markers[marker[1]] || 0) + 1;
    const enemyMatch = String(event.name || '').match(/【敌人】\s*(\d+)/);
    if (enemyMatch && !internal) localEnemyIds.add(Number(enemyMatch[1]));
    const script = scriptsForEvent(event);
    for (const match of script.matchAll(/addBossGauge\s*\(\s*(\d+)\s*\)/g)) {
      const bossEvent = mapEventById[Number(match[1])];
      const bossMatch = bossEvent && String(bossEvent.name || '').match(/【敌人】\s*(\d+)/);
      if (bossMatch) bossEnemyIds.add(Number(bossMatch[1]));
    }
    for (const researchId of researchIdsFromScript(script)) researchIds.add(researchId);
    for (const page of event.pages || []) for (const command of page.list || []) {
      if (command.code === 117) for (const researchId of (commonEventResearch.get(Number(command.parameters && command.parameters[0])) || [])) researchIds.add(researchId);
      if (command.code === 201 && Number(command.parameters && command.parameters[0]) === 0 && Number(command.parameters && command.parameters[1]) > 0) transfers.add(Number(command.parameters[1]));
    }
  }
  for (const id of localEnemyIds) {
    if (!enemyAppearances.has(id)) enemyAppearances.set(id, new Set());
    enemyAppearances.get(id).add(info.id);
  }
  for (const id of researchIds) {
    if (internal) continue;
    if (!researchEventMaps.has(id)) researchEventMaps.set(id, new Set());
    researchEventMaps.get(id).add(info.id);
  }
  mapRecords.push({
    id: info.id,
    name: mapLocalizedName(info.name || 'Map ' + info.id, areaCode),
    rawName: info.name || '',
    areaCode: areaCode,
    areaName: areaLocalizedName(root && root.name || info.name || '', areaCode),
    description: areaDescription(areaCode),
    parentId: info.parentId || 0,
    rootId: root && root.id || info.id,
    type: internal ? 'internal' : 'gameplay',
    width: map.width || 0,
    height: map.height || 0,
    tilesetId: map.tilesetId || 0,
    encounterSteps: map.encounterStep || 0,
    events: (map.events || []).filter(Boolean).length,
    markers: markers,
    enemyIds: [...localEnemyIds].sort((a, b) => a - b),
    researchIds: [...researchIds].sort((a, b) => a - b),
    transfers: [...transfers].filter(id => mapInfos[id]).sort((a, b) => a - b)
  });
}
const mapById = Object.fromEntries(mapRecords.map(map => [map.id, map]));
for (const common of commonEvents.filter(Boolean)) {
  const researchIds = commonEventResearch.get(common.id) || [];
  if (!researchIds.size) continue;
  const publicMapIds = new Set();
  for (const match of JSON.stringify(common.list || []).matchAll(/plotM(\d+)/g)) {
    const mapId = Number(match[1]);
    if (mapById[mapId] && mapById[mapId].areaCode) publicMapIds.add(mapId);
  }
  for (const researchId of researchIds) for (const mapId of publicMapIds) {
    if (!researchEventMaps.has(researchId)) researchEventMaps.set(researchId, new Set());
    researchEventMaps.get(researchId).add(mapId);
  }
}
const derivedEnemyReferenceIndexes = {
  deathSummon: 1,
  quickSummon: 2,
  reviveAura: 3,
  masterSummon: 2,
  upgrade: 2,
  deathDrop: 1
};
const enemyAppearanceQueue = [...enemyAppearances.keys()];
const processedEnemyReferences = new Set();
while (enemyAppearanceQueue.length) {
  const sourceId = enemyAppearanceQueue.shift();
  if (processedEnemyReferences.has(sourceId)) continue;
  processedEnemyReferences.add(sourceId);
  const sourceEnemy = enemiesDb[sourceId];
  if (!sourceEnemy) continue;
  const sourceMaps = enemyAppearances.get(sourceId) || new Set();
  const sourceTags = parseTags(sourceEnemy.note);
  for (const key of Object.keys(derivedEnemyReferenceIndexes)) {
    if (!sourceTags[key]) continue;
    const values = String(sourceTags[key]).split(',');
    const targetId = Number.parseInt(values[derivedEnemyReferenceIndexes[key]]);
    const targetEnemy = enemiesDb[targetId];
    if (!(targetId > 0) || !targetEnemy || !nonBlank(lang.zh.enemyname && lang.zh.enemyname[targetId]) || !(targetEnemy.params || []).some(Number)) continue;
    const targetMaps = enemyAppearances.get(targetId) || new Set();
    const wasKnown = enemyAppearances.has(targetId);
    for (const mapId of sourceMaps) targetMaps.add(mapId);
    enemyAppearances.set(targetId, targetMaps);
    if (!wasKnown) enemyAppearanceQueue.push(targetId);
  }
}

const enemies = [...enemyAppearances.entries()]
  .filter(pair => {
    const id = pair[0], enemy = enemiesDb[id];
    return enemy && nonBlank(lang.zh.enemyname && lang.zh.enemyname[id]) && (enemy.params || []).some(Number);
  })
  .map(pair => {
    const id = pair[0], mapIds = pair[1], enemy = enemiesDb[id], tags = parseTags(enemy.note);
    const appearances = [...mapIds].sort((a, b) => a - b);
    const hp = enemy.params && enemy.params[0] || 0;
    const isBoss = bossEnemyIds.has(id) || Object.keys(tags).some(key => /boss/i.test(key));
    const isElite = Number(enemy.params && enemy.params[6]) !== 999;
    const isSummon = Boolean(tags.summon);
    const categories = [];
    if (isBoss) categories.push('boss');
    if (isElite) categories.push('elite');
    if (isSummon) categories.push('summon');
    if (!categories.length) categories.push('common');
    const seenAreas = new Set();
    const appearanceAreas = [];
    for (const mapId of appearances) {
      const record = mapById[mapId];
      if (!record || !record.areaCode) continue;
      const key = String(record.areaCode);
      if (seenAreas.has(key)) continue;
      seenAreas.add(key);
      appearanceAreas.push({
        id: Number(record.areaCode),
        name: localized('mapdesc', 't' + record.areaCode + 'a', '')
      });
    }
    return {
      id: id, name: localized('enemyname', id, enemy.name), hp: hp,
      atk: enemy.params && enemy.params[2] || 0, def: enemy.params && enemy.params[3] || 0,
      escapeTurns: isElite ? Number(enemy.params[6]) : null,
      gold: enemy.gold || 0, exp: enemy.exp || 0,
      category: categories[0], categories: categories,
      tags: tags, tagNames: Object.keys(tags),
      maps: appearanceAreas,
      note: String(enemy.note || '')
    };
  }).sort((a, b) => a.id - b.id);

function publicAreasForMapIds(mapIds) {
  const seen = new Set();
  const result = [];
  for (const mapId of mapIds || []) {
    const record = mapById[mapId];
    if (!record || !record.areaCode || seen.has(String(record.areaCode))) continue;
    seen.add(String(record.areaCode));
    result.push({
      id: Number(record.areaCode),
      name: localized('mapdesc', 't' + record.areaCode + 'a', '')
    });
  }
  return result.sort((a, b) => a.id - b.id);
}

const buildingProductById = new Map();
const buildingSetupStart = buildingSetupJs.indexOf('Game_Building.prototype.setup');
const buildingSetupBody = buildingSetupJs.slice(buildingSetupStart);
for (const match of buildingSetupBody.matchAll(/case\s+(\d+)\s*:\s*([\s\S]*?)(?=\n\s*case\s+\d+\s*:|\n\s*default\s*:|\n\s*}\s*\n\s*};)/g)) {
  const product = match[2].match(/this\._product\s*=\s*(\d+)/);
  if (product) buildingProductById.set(Number(match[1]), Number(product[1]));
}

const officialRelatedByItem = new Map();
const relationStart = researchJs.indexOf('Game_GlobalBuilding.prototype.checkResearchA');
const relationBody = researchJs.slice(relationStart);
for (const match of relationBody.matchAll(/case\s+(\d+)\s*:[\s\S]*?return\s*\[([^\]]*)\]/g)) {
  const itemId = buildingProductById.get(Number(match[1]));
  if (!itemId) continue;
  const ids = match[2].split(',').map(Number).filter(Number.isFinite);
  if (!officialRelatedByItem.has(itemId)) officialRelatedByItem.set(itemId, new Set());
  for (const researchId of ids) officialRelatedByItem.get(itemId).add(researchId);
}

function balancedBlock(sourceText, openBrace) {
  let depth = 0;
  for (let i = openBrace; i < sourceText.length; i++) {
    if (sourceText[i] === '{') depth++;
    else if (sourceText[i] === '}' && --depth === 0) return sourceText.slice(openBrace + 1, i);
  }
  return '';
}
const unlockItemsByResearch = new Map();
for (const match of exStatSourceJs.matchAll(/if\s*\(\s*item\.id\s*={2,3}\s*(\d+)\s*\)\s*\{/g)) {
  const itemId = Number(match[1]);
  const block = balancedBlock(exStatSourceJs, match.index + match[0].lastIndexOf('{'));
  for (const researchId of researchIdsFromScript(block)) {
    if (!unlockItemsByResearch.has(researchId)) unlockItemsByResearch.set(researchId, new Set());
    unlockItemsByResearch.get(researchId).add(itemId);
  }
}

const initialResearchIds = commonEventResearch.get(34) || new Set();
const relatedItemIdsByResearch = new Map();
function relateItem(researchId, itemId) {
  researchId = Number(researchId); itemId = Number(itemId);
  if (!researchCases[researchId] || !itemsDb[itemId]) return;
  if (!relatedItemIdsByResearch.has(researchId)) relatedItemIdsByResearch.set(researchId, new Set());
  relatedItemIdsByResearch.get(researchId).add(itemId);
}
for (const [itemId, researchIds] of officialRelatedByItem) for (const researchId of researchIds) relateItem(researchId, itemId);

const researchRaw = Object.keys(researchCases).map(Number).sort((a, b) => a - b).map(id => {
  const block = researchCases[id];
  const costs = safeExpression(block, 'basecost') || [];
  const max = safeExpression(block, 'maxlevel');
  const description = localized('research', 'd' + id, '');
  const gainItems = safeExpression(block, 'gainItems') || [];
  const learnItem = Number(safeExpression(block, 'learnItem')) || 0;
  for (const pair of Array.isArray(costs) ? costs : []) relateItem(id, Number(pair[0]));
  for (const pair of Array.isArray(gainItems) ? gainItems : []) relateItem(id, Number(Array.isArray(pair) ? pair[0] : pair.itemId || pair.id));
  if (learnItem) relateItem(id, learnItem);
  for (const code of ['zh', 'en', 'ja']) for (const match of String(description[code] || '').matchAll(/\\II\[(\d+)\]/g)) relateItem(id, Number(match[1]));
  return {
    id: id, name: localized('research', 'n' + id, 'Research ' + id), description: description,
    icon: Number(safeExpression(block, 'icon')) || 0, type: safeExpression(block, 'type') || 'other',
    maxLevel: max === Infinity ? '\u221e' : (Number(max) || 1),
    costs: Array.isArray(costs) ? costs.map(pair => ({ itemId: Number(pair[0]), amount: Number(pair[1]), name: itemName(Number(pair[0])), icon: itemIcon(Number(pair[0])) })) : [],
    unlockResearch: safeExpression(block, 'unlockResearch') || [],
    addEquip: Number(safeExpression(block, 'addEquip')) || 0,
    learnItem: learnItem,
    extraSkill: Number(safeExpression(block, 'extraSkill')) || 0,
    relatedCommon: Number(safeExpression(block, 'relatedCommon')) || 0,
    relatedVariable: Number(safeExpression(block, 'relatedVariable')) || 0,
    gainItems: gainItems,
    gainGold: Number(safeExpression(block, 'gainGold')) || 0,
    eventMaps: publicAreasForMapIds(researchEventMaps.get(id) || [])
  };
});
const researchParents = new Map();
function addResearchParent(child, parent) {
  child = Number(child); parent = Number(parent);
  if (!researchCases[child] || !researchCases[parent]) return;
  if (!researchParents.has(child)) researchParents.set(child, new Set());
  researchParents.get(child).add(parent);
}
for (const record of researchRaw) {
  for (const child of record.unlockResearch) addResearchParent(child, record.id);
  for (const child of (commonEventResearch.get(record.relatedCommon) || [])) addResearchParent(child, record.id);
}
const researchChildren = new Map();
for (const [child, parents] of researchParents) for (const parent of parents) {
  if (!researchChildren.has(parent)) researchChildren.set(parent, new Set());
  researchChildren.get(parent).add(child);
}
const supremeAlchemyIds = new Set([552, 553, 554, 555, 556]);
const research = researchRaw.map(record => Object.assign({}, record, {
  prerequisites: [...(researchParents.get(record.id) || [])].sort((a, b) => a - b).map(id => ({ id: id, name: localized('research', 'n' + id, 'Research ' + id), icon: Number(safeExpression(researchCases[id], 'icon')) || 0 })),
  unlocksResearch: [...(researchChildren.get(record.id) || [])].sort((a, b) => a - b).map(id => ({ id: id, name: localized('research', 'n' + id, 'Research ' + id), icon: Number(safeExpression(researchCases[id], 'icon')) || 0 })),
  unlockItems: [...(unlockItemsByResearch.get(record.id) || [])].sort((a, b) => a - b).map(id => ({ id: id, name: itemName(id), icon: itemIcon(id) })),
  initialUnlock: initialResearchIds.has(record.id),
  milestone: supremeAlchemyIds.has(record.id) ? { researchLevel: 3000 } : null,
  relatedItems: [...(relatedItemIdsByResearch.get(record.id) || [])].sort((a, b) => a - b).map(id => ({ itemId: id, name: itemName(id), icon: itemIcon(id) })),
  rewardEquipName: record.addEquip ? localized('armorname', record.addEquip, armors[record.addEquip] ? armors[record.addEquip].name : '') : null,
  rewardEquipIcon: record.addEquip && armors[record.addEquip] ? armors[record.addEquip].iconIndex || 0 : 0,
  rewardSkillName: record.extraSkill ? localized('mskill', record.extraSkill, skillsDb[record.extraSkill] ? skillsDb[record.extraSkill].name : '') : null,
  rewardSkillIcon: record.extraSkill && skillsDb[record.extraSkill] ? skillsDb[record.extraSkill].iconIndex || 0 : 0,
  rewardItemName: record.learnItem ? itemName(record.learnItem) : null,
  rewardItemIcon: record.learnItem ? itemIcon(record.learnItem) : 0
}));// ---- Wiki presentation data (v2) ----
const resolveNestedText = (code, value) => String(value || '').replace(/#\{([^.}]+)\.([^}]+)\}/g, function(_, group, key) {
  const local = lang[code] && lang[code][group] && lang[code][group][key];
  const fallback = lang.zh && lang.zh[group] && lang.zh[group][key];
  return nonBlank(local) ? String(local) : nonBlank(fallback) ? String(fallback) : '';
});
const localEnemyName = (code, id) => {
  const value = lang[code] && lang[code].enemyname && lang[code].enemyname[id];
  return nonBlank(value) ? String(value) : String(lang.zh.enemyname && lang.zh.enemyname[id] || 'Enemy ' + id);
};
const wikiAssetRoot = path.dirname(path.dirname(output));
const actorAssetDir = path.join(wikiAssetRoot, 'images', 'actors');
const enemyAssetDir = path.join(wikiAssetRoot, 'images', 'enemies');
fs.mkdirSync(actorAssetDir, { recursive: true });
fs.mkdirSync(enemyAssetDir, { recursive: true });

const actors = [0, 1, 2, 3].map(id => {
  const filename = 'ActorCircle' + id + '.png';
  const sourceFile = path.join(source, 'img', 'system', filename);
  if (fs.existsSync(sourceFile)) fs.copyFileSync(sourceFile, path.join(actorAssetDir, filename));
  return { id: id, name: localized('actorname', id, 'Actor ' + id), image: 'images/actors/' + filename };
});

const enemySpriteCandidates = new Map();
let enemySpriteOrder = 0;
for (const mapRecord of mapRecords) {
  if (mapRecord.type !== 'gameplay') continue;
  const map = mapCache[mapRecord.id];
  for (const event of (map && map.events || []).filter(Boolean)) {
    const enemyMatch = String(event.name || '').match(/【敌人】\s*(\d+)/);
    if (!enemyMatch) continue;
    const enemyId = Number(enemyMatch[1]);
    let image = null;
    for (const page of event.pages || []) {
      if (page.image && page.image.characterName) { image = page.image; break; }
    }
    if (!image) continue;
    const characterName = String(image.characterName);
    const sourceFile = path.join(source, 'img', 'characters', characterName + '.png');
    if (!fs.existsSync(sourceFile)) continue;
    if (!enemySpriteCandidates.has(enemyId)) enemySpriteCandidates.set(enemyId, []);
    enemySpriteCandidates.get(enemyId).push({
      image: image,
      characterName: characterName,
      sourceFile: sourceFile,
      mapId: mapRecord.id,
      areaCode: String(mapRecord.areaCode || ''),
      officialArea: officialAreaByMapId.has(mapRecord.id),
      order: enemySpriteOrder++
    });
  }
}

const chooseEnemySprite = enemy => {
  const candidates = enemySpriteCandidates.get(enemy.id) || [];
  if (!candidates.length) return null;
  const publicAreas = new Set((enemy.maps || []).map(map => String(map.id)));
  const matchingArea = candidates.filter(candidate => publicAreas.has(candidate.areaCode));
  const officialMatching = matchingArea.filter(candidate => candidate.officialArea);
  const pool = officialMatching.length ? officialMatching : matchingArea.length ? matchingArea : candidates;
  const groups = new Map();
  for (const candidate of pool) {
    const signature = candidate.characterName + '\0' + (Number(candidate.image.characterIndex) || 0);
    if (!groups.has(signature)) groups.set(signature, []);
    groups.get(signature).push(candidate);
  }
  const chosenGroup = [...groups.values()].sort((left, right) =>
    right.length - left.length || left[0].order - right[0].order
  )[0];
  return chosenGroup.slice().sort((left, right) => left.order - right.order)[0];
};

for (const enemy of enemies) {
  const selected = chooseEnemySprite(enemy);
  if (!selected) { enemy.sprite = null; continue; }
  const safeFile = Buffer.from(selected.characterName, 'utf8').toString('base64url') + '.png';
  fs.copyFileSync(selected.sourceFile, path.join(enemyAssetDir, safeFile));
  enemy.sprite = {
    file: 'images/enemies/' + safeFile,
    index: Number(selected.image.characterIndex) || 0,
    direction: Number(selected.image.direction) || 2,
    pattern: 0,
    big: selected.characterName.indexOf('$') >= 0,
    object: selected.characterName.charAt(0) === '!'
  };
}

const exStatJs = fs.readFileSync(path.join(source, 'js', 'plugins', 'ExStat.js'), 'utf8');
const chartFunction = exStatJs.indexOf('function atChart()');
const chartReturn = exStatJs.indexOf('return', chartFunction);
const chartStart = exStatJs.indexOf('{', chartReturn);
const chartEnd = exStatJs.indexOf('};', chartStart) + 1;
const abilityChart = {};
const chartSlice = exStatJs.slice(chartStart, exStatJs.indexOf('function alchemySettle', chartStart));
for (const match of chartSlice.matchAll(/"([^"]+)"\s*:\s*(\d+)/g)) abilityChart[match[1]] = Number(match[2]);

const enemyAbilityArgs = (key, value, code) => {
  const p = String(value === true ? '' : value || '').split(',');
  const radius = n => String((Number.parseInt(n) || 0) * 2 + 1);
  const enemyRef = n => localEnemyName(code, Number.parseInt(n) || 0);
  const term = name => String(lang[code] && lang[code].term && lang[code].term[name] || lang.zh.term && lang.zh.term[name] || name);
  const statList = data => {
    const result = [];
    if ((Number.parseInt(data[0]) || 0) > 0) result.push(data[0] + term('hp'));
    if ((Number.parseInt(data[1]) || 0) > 0) result.push(data[1] + term('atk'));
    if ((Number.parseInt(data[2]) || 0) > 0) result.push(data[2] + term('def'));
    return result.join(String(lang[code] && lang[code].term && lang[code].term.comma || ', '));
  };
  switch (key) {
    case 'joint': return [p[0], '—'];
    case 'revenge':
    case 'single': return [statList(p)];
    case 'attackAura':
    case 'defenceAura':
    case 'elementResonance':
    case 'drainAura':
    case 'lifeAura':
    case 'deathAura':
    case 'circulate': return [radius(p[0]), radius(p[0]), p[1]];
    case 'fairyAura': return [radius(p[0]), radius(p[0]), p[1], p[2]];
    case 'deathSummon': return [enemyRef(p[1])];
    case 'nourish': return [radius(p[0]), radius(p[0]), p[1], p[2]];
    case 'deathLightning': return [radius(p[0]), radius(p[0]), p[2], p[1]];
    case 'quickSummon': return [radius(p[0]), radius(p[0]), enemyRef(p[2])];
    case 'beacon':
    case 'frozen':
    case 'flash':
    case 'Outerexplode':
    case 'teachAura': return [radius(p[0]), radius(p[0])];
    case 'reviveAura': return [radius(p[0]), radius(p[0]), enemyRef(p[3])];
    case 'jointMaster': return [p[0], p[1], '—'];
    case 'suicide': return [p[0], radius(p[1]), radius(p[1]), p[2]];
    case 'spread': return [radius(p[0]), radius(p[0]), statList([p[1], p[2], p[3]])];
    case 'rollExplode': return [radius(p[0]), radius(p[0]), p[1]];
    case 'masterSummon': return [enemyRef(p[2]), p[0]];
    case 'ElecSuicide':
    case 'FrostBall': return [p[0], p[1], '0'];
    case 'barrier': return [String((Number.parseInt(p[0]) || 0) + 1), p[0]];
    case 'upgrade': return [p[0], enemyRef(p[2])];
    case 'deathDrop': return [enemyRef(p[1])];
    case 'diseaseAura': return [radius(p[0]), radius(p[0]), p[2]];
    case 'outAura': return [radius(p[0]), radius(p[0]), p[1]];
    case 'regenerate': return [p[1], p[0]];
    case 'flameSuicide': return [p[0], radius(p[1]), radius(p[1]), p[2], p[3]];
    case 'final': return ['—', '—', p[0]];
    case 'perfect': return ['—', '—', p[0]];
    case 'blossomAura': return [radius(p[0]), radius(p[0]), p[1], p[2]];
    default: return p;
  }
};
const bossAbilityAliases = {
  1013: [1013, 1015],
  1014: [1014, 1016]
};
const bossAbilityKeys = abilityId => {
  const ids = bossAbilityAliases[abilityId] || [abilityId];
  const result = [];
  for (const id of ids) {
    const zh = lang.zh.eskill || {};
    const exactName = nonBlank(zh[id]);
    const variantNames = Object.keys(zh).filter(k => new RegExp('^' + id + '_[^d]').test(k) && nonBlank(zh[k])).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    if (exactName && nonBlank(zh['d' + id])) result.push({ id: id, nameKey: String(id), descriptionKey: 'd' + id });
    for (const nameKey of variantNames) {
      const descriptionKey = 'd' + nameKey;
      if (nonBlank(zh[descriptionKey])) result.push({ id: id, nameKey: nameKey, descriptionKey: descriptionKey });
    }
    if (exactName && !variantNames.length) {
      const variantDescriptions = Object.keys(zh).filter(k => new RegExp('^d' + id + '_').test(k) && !/_charge$/.test(k) && nonBlank(zh[k])).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      for (const descriptionKey of variantDescriptions) result.push({ id: id, nameKey: String(id), descriptionKey: descriptionKey });
    }
  }
  const seen = new Set();
  return result.filter(spec => {
    const signature = String(lang.zh.eskill[spec.nameKey] || '') + '\u0000' + String(lang.zh.eskill[spec.descriptionKey] || '');
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
};
const buildEnemyAbility = (key, value) => {
  const abilityId = abilityChart[key];
  if (!abilityId) return [];
  if (abilityId >= 1000) {
    return bossAbilityKeys(abilityId).map(spec => {
      const name = {};
      const description = {};
      for (const code of ['zh', 'en', 'ja']) {
        const strings = lang[code].eskill || {};
        name[code] = resolveNestedText(code, strings[spec.nameKey] || lang.zh.eskill[spec.nameKey] || '');
        const template = strings[spec.descriptionKey] || lang.zh.eskill[spec.descriptionKey] || '';
        description[code] = resolveNestedText(code, String(template).replace(/%v\d+/g, '\\V[0]'));
      }
      return { id: spec.id, key: key, value: value, name: name, description: description };
    }).filter(ability => nonBlank(ability.name.zh) && nonBlank(ability.description.zh));
  }
  const name = {};
  const description = {};
  for (const code of ['zh', 'en', 'ja']) {
    name[code] = resolveNestedText(code, lang[code].eskill && lang[code].eskill[abilityId] || key);
    let template = lang[code].eskill && lang[code].eskill['d' + abilityId] || '';
    const args = enemyAbilityArgs(key, value, code);
    template = String(template).replace(/%v(\d+)/g, function(_, index) {
      const replacement = args[Number(index) - 1];
      return replacement === undefined ? '—' : String(replacement);
    });
    description[code] = resolveNestedText(code, template);
  }
  return [{ id: abilityId, key: key, value: value, name: name, description: description }];
};
for (const enemy of enemies) {
  enemy.abilities = Object.keys(enemy.tags).flatMap(key => buildEnemyAbility(key, enemy.tags[key]));
}

const enemyById = new Map(enemies.map(enemy => [enemy.id, enemy]));
const enemyRelationIndexes = derivedEnemyReferenceIndexes;
const enemyLink = enemy => ({ id: enemy.id, name: enemy.name });
for (const enemy of enemies) {
  const targetIds = new Set();
  for (const key of Object.keys(enemyRelationIndexes)) {
    if (!enemy.tags[key]) continue;
    const values = String(enemy.tags[key]).split(',');
    const targetId = Number.parseInt(values[enemyRelationIndexes[key]]);
    if (targetId > 0 && targetId !== enemy.id && enemyById.has(targetId)) targetIds.add(targetId);
  }
  enemy.derivedEnemies = [...targetIds].map(id => enemyLink(enemyById.get(id)));
  enemy.derivedFrom = [];
}
for (const enemy of enemies) {
  for (const target of enemy.derivedEnemies) {
    const derived = enemyById.get(target.id);
    if (derived && !derived.derivedFrom.some(sourceEnemy => sourceEnemy.id === enemy.id)) derived.derivedFrom.push(enemyLink(enemy));
  }
}

const relationKeys = ['chooseOne', 'trinity', 'skLink', 'Diy'];
const derivedBaseIds = new Set();
for (let id = 1; id <= 160; id++) {
  const tags = parseTags(skillsDb[id] && skillsDb[id].note);
  if (tags.ppMain) derivedBaseIds.add(id);
  for (const key of relationKeys) {
    if (!tags[key]) continue;
    for (const raw of String(tags[key]).split(',')) {
      const value = Number.parseInt(raw.trim());
      if (value > 0 && value <= 160) {
        if (key === 'Diy') for (let offset = 0; offset < 12; offset++) derivedBaseIds.add(value + offset);
        else derivedBaseIds.add(value);
      }
    }
  }
}
const makeDerivedSkill = actualId => {
  const data = skillsDb[actualId];
  if (!data || !data.iconIndex) return null;
  const baseId = actualId <= 480 ? ((actualId - 1) % 160) + 1 : actualId;
  const tier = actualId <= 480 ? Math.floor((actualId - 1) / 160) : 0;
  return {
    kind: 'skill', id: actualId, baseId: baseId, icon: data.iconIndex,
    name: localized('mskill', baseId, data.name),
    description: localizedSkillDescription(baseId, tier, data.description),
    tags: parseTags(data.note),
    sourceKnown: Boolean(skillAcquisition[baseId])
  };
};
const makeDerivedEquip = armorId => {
  const data = armors[armorId];
  if (!data || !data.iconIndex) return null;
  return {
    kind: 'equipment', id: armorId, icon: data.iconIndex,
    name: localized('armorname', armorId, data.name),
    description: localized('armordesc', armorId, data.description),
    upgradedDescription: localized('armordesc', 'U' + armorId, ''),
    slots: numberTag(parseTags(data.note), 'cost'),
    sourceKnown: Boolean(armorAcquisition[armorId])
  };
};
const derivedAcquisition = parentName => ({
  zh: String(parentName.zh || '') + '\u7684\u884d\u751f',
  en: 'Derived from ' + String(parentName.en || parentName.zh || ''),
  ja: String(parentName.ja || parentName.zh || '') + '\u306e\u6d3e\u751f'
});
function pushDerived(target, parentName, entry) {
  if (!entry || entry.sourceKnown || target.some(item => item.kind === entry.kind && item.id === entry.id)) return;
  target.push(Object.assign({}, entry, { acquisition: derivedAcquisition(parentName) }));
}

const ppChildrenByMain = new Map();
for (let id = 1; id <= 160; id++) {
  const tags = parseTags(skillsDb[id] && skillsDb[id].note);
  const mainId = Number.parseInt(tags.ppMain);
  if (!mainId) continue;
  if (!ppChildrenByMain.has(mainId)) ppChildrenByMain.set(mainId, []);
  ppChildrenByMain.get(mainId).push(id);
}

for (const record of equipment) {
  record.derived = [];
  const tags = parseTags(armors[record.id] && armors[record.id].note);
  if (tags.eqLink) for (const raw of String(tags.eqLink).split(',')) {
    pushDerived(record.derived, record.name, makeDerivedEquip(Math.abs(Number.parseInt(raw.trim()) || 0)));
  }
  if (tags.skLink) for (const raw of String(tags.skLink).split(',')) {
    pushDerived(record.derived, record.name, makeDerivedSkill(Math.abs(Number.parseInt(raw.trim()) || 0)));
  }
}
for (const child of equipment) {
  if (child.sourceKnown) continue;
  const originalId = Math.abs(Number.parseInt(parseTags(armors[child.id] && armors[child.id].note).original) || 0);
  const parent = originalId ? equipment.find(record => record.id === originalId && record.sourceKnown) : null;
  if (parent) pushDerived(parent.derived, parent.name, makeDerivedEquip(child.id));
}

for (const skill of skills) {
  skill.actorImage = 'images/actors/ActorCircle' + skill.actorId + '.png';
  for (const variant of skill.variants) {
    variant.derived = [];
    const relationTags = parseTags(skillsDb[variant.id] && skillsDb[variant.id].note);
    const fallbackTags = parseTags(skillsDb[skill.id] && skillsDb[skill.id].note);
    for (const childBaseId of (ppChildrenByMain.get(skill.id) || [])) {
      const actualId = childBaseId + variant.tier * 160;
      pushDerived(variant.derived, skill.name, makeDerivedSkill(actualId));
    }
    for (const key of relationKeys) {
      const relation = relationTags[key] || fallbackTags[key];
      if (!relation) continue;
      for (const raw of String(relation).split(',')) {
        const relationId = Number.parseInt(raw.trim());
        if (!relationId) continue;
        if (key === 'Diy') {
          for (let offset = 0; offset < 12; offset++) {
            pushDerived(variant.derived, skill.name, makeDerivedSkill(relationId + offset));
          }
        } else {
          let actualId = relationId;
          if (actualId <= 160 && variant.tier > 0) actualId += variant.tier * 160;
          pushDerived(variant.derived, skill.name, makeDerivedSkill(actualId));
        }
      }
    }
    const equipRelation = relationTags.eqLink || fallbackTags.eqLink;
    if (equipRelation) for (const raw of String(equipRelation).split(',')) {
      pushDerived(variant.derived, skill.name, makeDerivedEquip(Math.abs(Number.parseInt(raw.trim()) || 0)));
    }
  }
}
const visibleEquipment = equipment.filter(record => record.sourceKnown);
const visibleSkills = skills.filter(skill => skill.sourceKnown);

for (const record of research) {
  const block = researchCases[record.id] || '';
  record.costExtra = safeExpression(block, 'costextramaterial') || [];
  record.costMultiplier = Number(safeExpression(block, 'costmultiplicity')) || 1;
  record.productPerLevel = Number(safeExpression(block, 'basemultiproduct')) || 0;
}

const refs = { items: {}, armors: {}, skills: {}, buffs: {} };
for (const item of itemsDb.filter(Boolean)) if (item.iconIndex || item.name) refs.items[item.id] = { icon: item.iconIndex || 0, name: itemName(item.id) };
for (const armor of armors.filter(Boolean)) if (armor.iconIndex || armor.name) refs.armors[armor.id] = { icon: armor.iconIndex || 0, name: localized('armorname', armor.id, armor.name) };
for (const skill of skillsDb.filter(Boolean)) if (skill.iconIndex || skill.name) {
  const baseId = skill.id <= 480 ? ((skill.id - 1) % 160) + 1 : skill.id;
  refs.skills[skill.id] = { icon: skill.iconIndex || 0, name: localized('mskill', baseId, skill.name) };
}
for (const key of Object.keys(lang.zh.buff || {})) refs.buffs[key] = localized('buff', key, key);
const statuses = Array.from({ length: 28 }, (_, index) => {
  const id = index + 1;
  return { id: id, name: localized('buff', id, 'State ' + id), description: localized('buff', 'd' + id, '') };
});
const statusSheetSource = path.join(source, 'img', 'pictures', 'buff.png');
if (fs.existsSync(statusSheetSource)) fs.copyFileSync(statusSheetSource, path.join(wikiAssetRoot, 'images', 'buff.png'));
const lzStringSource = path.join(source, 'js', 'libs', 'lz-string.js');
if (fs.existsSync(lzStringSource)) fs.copyFileSync(lzStringSource, path.join(path.dirname(output), 'lz-string.js'));
const summary = {
  generatedAt: new Date().toISOString(), equipment: visibleEquipment.length, skills: visibleSkills.length,
  research: research.length, enemies: enemies.length, statuses: statuses.length
};
const data = { summary: summary, equipment: visibleEquipment, skills: visibleSkills, research: research, enemies: enemies, statuses: statuses, actors: actors, refs: refs };
fs.writeFileSync(output, 'window.ROR_WIKI_DATA = ' + JSON.stringify(data) + ';\n', 'utf8');
console.log(JSON.stringify(summary, null, 2));
