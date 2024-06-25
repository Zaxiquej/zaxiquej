const kmr = document.getElementById('kmr');
const kmrHealth = document.getElementById('kmr-health');
//const hitSound = document.getElementById('hit-sound');
const coinsDisplay = document.getElementById('coins');
const ethersDisplay = document.getElementById('ethers');

const timePlayedDisplay = document.getElementById('time-played');
const totalClickDamageDisplay = document.getElementById('total-click-damage');
const minionDamagesDisplay = document.getElementById('minion-damages');
const victoryMessage = document.getElementById('victory-message');
const totalTimeDisplay = document.getElementById('total-time');
const totalTimeDisplay2 = document.getElementById('total-time2');
const curLevelDisplay = document.getElementById('total-level');
const finalStatsDisplay = document.getElementById('final-stats');

let version = "3.0.0";
let kmrHealthValue = 500000;
let level = 0;
let coins = 0;
let dps = 0;
let timePlayed = 0;
let totalClickDamage = 0;
let rindex = 0;
let minionsState = [];
let unlockedMinions = [];
let totaltimePlayed = 0;
let buffs = [];
let states = {};
let burning = 0;
let skilled = false;
let zenxLV = 0;
let zenxActive = false;
let autoing = false;
let remluck = 0;
let reroll = 0;
let freeReroll = 2;
let freeUp = 0;
let yggdam = 322;
let upgrading = false;
let xxjjj = 0;
let curjjj = 0;
let xxBuff = false;
let zheluck = 3;
let zheluck2 = 3;
let zhedam = 2600;
let maxdamZ = 0;
let daZhaiQiYue = false;
let chongMing = 1;
let cangSkill = "";
let lastBuffs = {};
let marriage = [];
let victory = false;
let kmrquickHit = 0;
let coolAnim = false;
let lostXYZ = 3;
let lostTeam = [];
let obtainedBonds = {};

//全局区
let ethers = 0;
let totalEthers = 0;

function utf8_to_b64(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

function b64_to_utf8(str) {
    return decodeURIComponent(escape(atob(str)));
}

function encodeGameState(){
  const gameState = {
      version,
      kmrHealthValue,
      level,
      coins,
      dps,
      timePlayed,
      totalClickDamage,
      rindex,
      minionsState,
      unlockedMinions,
      totaltimePlayed,
      burning,
      skilled,
      zenxLV,
      zenxActive,
      autoing,
      remluck,
      buffs,
      reroll,
      freeReroll,
      freeUp,
      yggdam,
      upgrading,
      xxjjj,
      curjjj,
      xxBuff,
      zheluck,
      zheluck2,
      zhedam,
      maxdamZ,
      daZhaiQiYue,
      chongMing,
      cangSkill,
      lastBuffs,
      marriage,
      victory,
      kmrquickHit,
      coolAnim,
      lostXYZ,
      lostTeam,
      ethers,
      totalEthers,
      obtainedBonds
  };

  const gameStateStr = JSON.stringify(gameState);
  const encodedGameState = utf8_to_b64(gameStateStr); // Base64 encode the game state
  return encodedGameState;
}

function exportGame() {
    let encodedGameState = encodeGameState();

    // Get current date and time in Beijing Time (UTC+8)
    const date = new Date();
    const beijingOffset = 8 * 60 * 60 * 1000; // Beijing is UTC+8
    const beijingDate = new Date(date.getTime() + beijingOffset);

    const formattedDate = beijingDate.toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
    const fileName = `kmrsb_save_${formattedDate}.txt`;

    const blob = new Blob([encodedGameState], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

document.getElementById('exportButton').addEventListener('click', exportGame);

function saveGame(auto) {
    let encodedGameState = encodeGameState();

    localStorage.setItem('savedGame', encodedGameState);
    const mi = document.getElementById(`saveButton`);
    var position = mi.getBoundingClientRect();
    let x = position.left + (0.5*position.width);
    let y = position.top + (0.5*position.height);
    if (auto){
      showWord(x,y, "自动保存成功！");
    } else {
      showWord(x,y, "保存成功！");
    }
}
document.getElementById('saveButton').addEventListener('click', () => {
    saveGame();
});

function loadGame() {
    const encodedGameState = localStorage.getItem('savedGame');
    if (encodedGameState) {
        loadGameState(encodedGameState);
        victory = false;
        checkVictory();
        updateSkills();
        autoing = false;
    } else {

    }
}

function loadGameState(encodedGameState){
  hardResetVars();
  resetVars();
  const gameStateStr = b64_to_utf8(encodedGameState); // Base64 decode the game state
  const gameState = JSON.parse(gameStateStr);
  if (gameState.version) version = gameState.version;
  if (gameState.kmrHealthValue) kmrHealthValue = gameState.kmrHealthValue;
  if (gameState.level) level = gameState.level;
  if (gameState.coins) coins = gameState.coins;
  if (gameState.dps) dps = gameState.dps;
  if (gameState.timePlayed) timePlayed = gameState.timePlayed;
  if (gameState.totalClickDamage) totalClickDamage = gameState.totalClickDamage;
  if (gameState.rindex) rindex = gameState.rindex;
  if (gameState.minionsState) minionsState = gameState.minionsState;
  if (gameState.unlockedMinions) unlockedMinions = gameState.unlockedMinions;
  if (gameState.totaltimePlayed) totaltimePlayed = gameState.totaltimePlayed;
  if (gameState.burning) burning = gameState.burning;
  if (gameState.skilled) skilled = gameState.skilled;
  if (gameState.zenxLV) zenxLV = gameState.zenxLV;
  if (gameState.zenxActive) zenxActive = gameState.zenxActive;
  if (gameState.autoing) autoing = gameState.autoing;
  if (gameState.remluck) remluck = gameState.remluck;
  if (gameState.buffs) buffs = gameState.buffs;
  if (gameState.reroll) reroll = gameState.reroll;
  if (gameState.freeReroll) freeReroll = gameState.freeReroll;
  if (gameState.freeUp) freeUp = gameState.freeUp;
  if (gameState.yggdam) yggdam = gameState.yggdam;
  if (gameState.upgrading) upgrading = gameState.upgrading;
  if (gameState.xxjjj) xxjjj = gameState.xxjjj;
  if (gameState.curjjj) curjjj = gameState.curjjj;
  if (gameState.xxBuff) xxBuff = gameState.xxBuff;
  if (gameState.zheluck) zheluck = gameState.zheluck;
  if (gameState.zheluck2) zheluck2 = gameState.zheluck2;
  if (gameState.zhedam) zhedam = gameState.zhedam;
  if (gameState.maxdamZ) maxdamZ = gameState.maxdamZ;
  if (gameState.daZhaiQiYue) daZhaiQiYue = gameState.daZhaiQiYue;
  if (gameState.chongMing) chongMing = gameState.chongMing;
  if (gameState.cangSkill) cangSkill = gameState.cangSkill;
  if (gameState.lastBuffs) lastBuffs = gameState.lastBuffs;
  if (gameState.marriage) marriage = gameState.marriage;
  if (gameState.victory) victory = gameState.victory;
  if (gameState.kmrquickHit) kmrquickHit = gameState.kmrquickHit;
  if (gameState.coolAnim) victory = gameState.coolAnim;
  if (gameState.lostXYZ) lostXYZ = gameState.lostXYZ;
  if (gameState.lostTeam) lostTeam = gameState.lostTeam;
  if (gameState.ethers) ethers = gameState.ethers;
  if (gameState.totalEthers) totalEthers = gameState.totalEthers;
  if (gameState.obtainedBonds) obtainedBonds = gameState.obtainedBonds;

  // Restore intervals (assuming you have functions to set them)
  restoreIntervals();
  updateDisplays();
  refMinions();
}

function updateSkills(){
  for (let minion of minions){
    let r = unlockedMinions.indexOf(minion.name);
    if (r > -1){
      minionsState[r].skills = minion.skills;
      if (minionsState[r].learnedSkills[0]){
        minionsState[r].learnedSkills[0] = minion.skills[0].name;
      }
      if (minionsState[r].learnedSkills[0]!="马纳利亚时刻" && minionsState[r].learnedSkills[1]){
        minionsState[r].learnedSkills[1] = minion.skills[1].name;
      }
    }
  }
}
function importGame(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const encodedGameState = e.target.result;
        loadGameState(encodedGameState);
        victory = false;
        checkVictory();
        updateSkills();
        autoing = false;
    };
    reader.readAsText(file);
}

document.getElementById('importInput').addEventListener('change', importGame);

document.getElementById('importButton').addEventListener('click', () => {
    document.getElementById('importInput').click();
});

function hardResetVars() {
    ethers = 0;
    totalEthers = 0;
    obtainedBonds = {};
}

function resetVars() {
  version = "3.0.0"
  kmrHealthValue = 500000;
  level = 0;
  coins = 0;
  dps = 0;
  timePlayed = 0;
  totalClickDamage = 0;
  rindex = 0;
  unlockedMinions = [];
  totaltimePlayed = 0;
  burning = 0;
  skilled = false;
  zenxLV = 0;
  zenxActive = false;
  autoing = false;
  remluck = 0;
  buffs = [];
  reroll = 0;
  freeReroll = 2;
  freeUp = 0;
  yggdam = 322;
  upgrading = false;
  xxjjj = 0;
  curjjj = 0;
  xxBuff = false;
  zheluck = 3;
  zheluck2 = 3;
  zhedam = 2600;
  maxdamZ = 0;
  daZhaiQiYue = false;
  chongMing = 1;
  cangSkill = "";
  lastBuffs = {};
  marriage = [];
  victory = false;
  kmrquickHit = 0;
  coolAnim = false;
  lostXYZ = 3;
  lostTeam = [];
}

function resetGame() {
    resetVars();

    for (let minion of minionsState){
      clearInterval(minion.intervalId);
    }
    minionsState = [];
    refMinions();
    updateDisplays();

    const detailsContainer = document.getElementById('selected-minion-details');
    detailsContainer.innerHTML = ``;
}

function gainEtherAmount(){
  return level;
}

function gainEther(){
  let amount = gainEtherAmount();
  ethers += amount;
  totalEthers += amount;
}

function etherPlusDam(){
  return 1 + 0.025 * totalEthers;
}

// Function to handle hard reset confirmation
function hardResetGame() {
    if (confirm("你确定要重置游戏吗？这将清除所有进度。")) {
        if (confirm("再次确认：你真的要重置游戏吗？这将无法撤销。")) {
            hardResetVars();
            resetGame();
        }
    }
}

// Function to handle hard reset confirmation
function softReset() {
    if (confirm("你确定要转生吗？这将清除所有进度，但你可以获得+"+gainEtherAmount()+"以太奖励。")) {
      gainEther();
      resetGame();
    }
}

document.getElementById('rsButton').addEventListener('click', hardResetGame);

function restoreIntervals() {
  for (let minion of minionsState){
    clearInterval(minion.intervalId)
    let intervalId = setInterval(() => minionAttack(minion), minion.attackSpeed);
    minion.intervalId = intervalId;
  }
}

function addBuff(name,power,length,stackable){
  if (!stackable){
    for (let buff of buffs){
      if (buff[0] == name){
        buff[2] += length;
        return;
      }
    }
  }
  lastBuffs[name] = [power,length,stackable];
  buffs.push([name,power,length]);
}

function getBuffPower(name){
  let pow = [];
  for (let buff of buffs){
    if (buff[0] == name){
      pow.push(buff[1]);
    }
  }
  return pow;
}

function plusBuffPower(name,power,amount){
  let pow = [];
  for (let buff of buffs){
    if (buff[0] == name && buff[1] == power){
      buff[1] += amount;
      return;
    }
  }

}

function getBuffLength(name){
  let pow = [];
  for (let buff of buffs){
    if (buff[0] == name){
      pow.push(buff[2]);
    }
  }
  return pow;
}

function buffCountDown() {
  for (let i = buffs.length - 1; i >= 0; i--) {
    buffs[i][2]--; // 减少length
    if (buffs[i][2] <= 0) {
      buffs.splice(i, 1); // 删除length为0的项目
    }
  }
}

function buffExtend(time) {
  for (let i = buffs.length - 1; i >= 0; i--) {
    buffs[i][2]+=time;
  }
}

function killBuff(name,power) {
  for (let i = buffs.length - 1; i >= 0; i--) {
    if (buffs[i][0] == name && buffs[i][1] == power){
      buffs.splice(i, 1)
    }
  }
}

function unlockMinion(minion,temp){
  unlockedMinions.push(minion.name);
  minion = {
      ...minion,
      level: 1,
      attack: minion.baseattack,
      tempAtk: 0,
      reroll: 2,
      totalDamage: 0,
      learnedSkills: [],
  }

  let intervalId = setInterval(() => minionAttack(minion), minion.attackSpeed);
  minion.intervalId = intervalId;
  minionsState = minionsState.concat(minion)
  minion.reroll = temp - 1;
  refMinions();

  for (let m of minionsState){
    if (m.learnedSkills.includes("中速导师")){
      autoing = true;
      for (let i = 1; i < Math.floor(m.level/2); i++){
        upgradeMinion(minionsState.indexOf(minion),undefined,true,true);
      }
      autoing = false;
      minion.level = 1;
      refMinions();
      showSkillWord(m, "中速导师");
    }
    if (m.learnedSkills.includes("知名皇黑")){
      addBuff("huanghei", 34, 18, false);
      showSkillWord(m, "知名皇黑");
    }

  }
}

function showEffect(x, y, effectClass) {
  if (autoing){
    return;
  }
  if (getBuffPower("lost").length > 0){
    const effects = [
      'lightning-effect',
      'flame-effect',
      'particle-explosion-effect',
      'freeze-effect',
      'poison-effect',
      'flash-effect',
    ];
    effectClass = effects[Math.floor(Math.random() * effects.length)];
  }


    const effect = document.createElement('div');
    effect.className = effectClass;
    effect.style.left = `${x - 10}px`;
    effect.style.top = `${y - 10}px`;

    if (effectClass == "particle-explosion-effect"){
      for (let i = 0; i < 10; i++) {
          const particle = document.createElement('div');
          particle.className = 'particle';
          particle.style.setProperty('--x', `${Math.random() * 100 - 50}px`);
          particle.style.setProperty('--y', `${Math.random() * 100 - 50}px`);
          effect.appendChild(particle);
      }
    }

    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 1000);
}


function showDamage(x, y, damage) {
  if (autoing){
    return;
  }
    const damageEffect = document.createElement('div');
    if (damage > 0){
      damageEffect.className = 'damage-effect';
      damageEffect.innerText = `-${damage}`;
    } else {
      damageEffect.className = 'heal-effect';
      damageEffect.innerText = `${-damage}`;
    }

    damageEffect.style.left = `${x - 10}px`;
    damageEffect.style.top = `${y - 20}px`;
    document.body.appendChild(damageEffect);
    setTimeout(() => damageEffect.remove(), 1000);
}

function showWord(x, y, word) {
    const wordEffect = document.createElement('div');
    wordEffect.className = 'gold-effect';
    wordEffect.innerText = `${word}`;
    wordEffect.style.left = `${x - 10}px`;
    wordEffect.style.top = `${y - 20}px`;
    document.body.appendChild(wordEffect);
    setTimeout(() => wordEffect.remove(), 1000);
}

function generateRainbowText(text) {
  const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
  let coloredText = '';
  for (let i = 0; i < text.length; i++) {
    const color = colors[i % colors.length];
    coloredText += `<span style="color: ${color};">${text[i]}</span>`;
  }
  return coloredText;
}

function showSkillWord(minion, word) {
  if (autoing){
    return;
  }
    let im = document.getElementById(`image-${unlockedMinions.indexOf(minion.name)}`);
    if (!im){
      return;
    }
    var position = im.getBoundingClientRect();

    let x = position.left + (Math.random()*position.width);
    let y = position.top + (Math.random()*position.height);
    const wordEffect = document.createElement('div');
    wordEffect.className = 'word-effect';
    wordEffect.innerText = `${word}`;
    wordEffect.style.left = `${x - 10}px`;
    wordEffect.style.top = `${y - 20}px`;

    if (coolAnim) {
      let rand = Math.random();

      if (rand < 0.5){
        wordEffect.innerHTML = generateRainbowText(word);
      }

      rand = Math.random();
      if (rand < 0.5) {
        const effects = [
          'rotate-effect',
          'blink-effect',
          'color-change-effect',
          'slide-effect',
          'jump-effect',
          'twist-effect',
          'bounce-effect',
        ];
        const randomEffect = effects[Math.floor(Math.random() * effects.length)];
        wordEffect.classList.add(randomEffect);
      }

    }

    document.body.appendChild(wordEffect);
    setTimeout(() => wordEffect.remove(), 1000);
}

function updateHealth(health) {
    const healthElement = document.getElementById('kmr-health');
    const maxHealth = 500000*Math.pow(10,level); // 假设最大血量为500,000
    kmrHealthValue = Math.floor(kmrHealthValue)
    const healthPercentage = (kmrHealthValue / maxHealth) * 100;
    healthElement.style.width = healthPercentage + '%';
    healthElement.textContent = formatNumber2(health)
}

function updateDisplays() {
  if (autoing){
    return;
  }
    kmrHealth.textContent = formatNumber2(kmrHealthValue);
    coinsDisplay.textContent = formatNumber(coins);
    ethersDisplay.textContent = formatNumber(ethers) + "("+ formatNumber(totalEthers)+")";
    document.getElementById('phase-level').textContent = level;
    timePlayedDisplay.textContent = `${timePlayed}s`;
    totalClickDamageDisplay.textContent = totalClickDamage;
    minionDamagesDisplay.innerHTML = `
        ${[...minionsState] // 创建 minionsState 的副本
            .sort((a, b) => b.totalDamage - a.totalDamage) // 按 totalDamage 从大到小排序
            .map(minion => `<li>${minion.name}: ${formatNumber(minion.totalDamage)}</li>`)
            .join('')}
    `;
    updateHealth(kmrHealthValue);
    document.getElementById(`unlockButton`).textContent = "抽取助战 (金币:" + formatNumber(unlockCost(unlockedMinions.length)) +")";
    const etherContainer = document.getElementById('ether-container');
    if (totalEthers > 0) {
        etherContainer.style.display = 'block';
        document.getElementById('bondsButton').style.display = 'block';
    } else {
        etherContainer.style.display = 'none';
        document.getElementById('bondsButton').style.display = 'none';
    }
    const prestige = document.getElementById('softRsButton');
    if (level > 10) {
        prestige.style.display = 'block';
    } else {
        prestige.style.display = 'none';
    }
    prestige.innerHTML = "转生(+"+gainEtherAmount()+"以太)"
}

// 创建伤害数字动画
function createDamageNumber(damage) {
    const damageNumber = document.createElement('div');
    damageNumber.className = 'damage-number';
    damageNumber.textContent = `-${damage}`;
    damageNumber.style.left = `${Math.random() * 100}%`;
    damageNumber.style.top = `${Math.random() * 100}%`;
    kmr.parentElement.appendChild(damageNumber);

    setTimeout(() => {
        damageNumber.remove();
    }, 1000);
}

function gainCoin(c){
  if (getBuffPower("ykd").length > 0){
    let c = getBuffPower("ykd")[0];
    c = Math.floor(c * 2);
  }
  coins += c;
}

function clickKmr() {
    burning = 0;
    let dam = 1;
    dam = dam * etherPlusDam();
    dam = Math.floor(dam);
    kmrTakeDam(dam);
    victory = false;
    totalClickDamage += dam;
    var position = kmr.getBoundingClientRect();
    let x = position.left + (Math.random()*kmr.width);
    let y = position.top + (Math.random()*kmr.height);
    showEffect(x,y, 'hit-effect');
    showDamage(x,y, dam);
    const hitSound = new Audio('kmr/hit.ogg');
    hitSound.play();
    gainCoin(dam);
    kmrquickHit += 1;
    for (let m of minionsState){
      if (m.learnedSkills.includes("小说家") && kmrquickHit >= 3){
        kmrquickHit = 0;
        if (coolAnim){
          coolAnim = false;
          const mi = document.getElementById(`kmr`);
          var position = mi.getBoundingClientRect();
          let x = position.left + (0.5*position.width);
          let y = position.top + (0.5*position.height);
          showWord(x,y, "小说家：特效已关闭");
        } else {
          coolAnim = true;
          const mi = document.getElementById(`kmr`);
          var position = mi.getBoundingClientRect();
          let x = position.left + (0.5*position.width);
          let y = position.top + (0.5*position.height);
          showWord(x,y, "小说家：特效已开启");
        }
      }
    }
    updateDisplays();
    checkVictory();
}

function kmrTakeDam(dam){
  if (getBuffPower("huanghei").length > 0){
    let huanghei = getBuffPower("huanghei")[0];
    dam = Math.floor(dam * (1 + 0.01*huanghei))
  }
  for (let m of minionsState){
    if (m.learnedSkills.includes("素材奖励")){
      let maxHealth = 500000 * Math.pow(10,level);
      if (kmrHealthValue > Math.floor(2/3*maxHealth) && (kmrHealthValue - dam) < Math.floor(2/3*maxHealth)){
        refreshCangSkill();
      }
      if (kmrHealthValue > Math.floor(1/3*maxHealth) && (kmrHealthValue - dam) < Math.floor(1/3*maxHealth)){
        refreshCangSkill();
      }
    }
  }
  kmrHealthValue -= dam;
  if (dam > maxdamZ){
    maxdamZ = dam;
  }
}
function damageKmr(dam,minion) {
    if (kmrHealthValue <= 0) return;
    for (let m of minionsState){
      if (m.learnedSkills.includes("护国神橙")){
        dam = (dam*(1 + 0.2 + 0.01*Math.floor(Math.pow(m.level,0.6))));
      }
    }
    dam = dam * extraDamRatio(minion);
    dam = Math.floor(dam);
    kmrTakeDam(dam);

    for (let m of minionsState){

      if (m.learnedSkills.includes("大地之子")){
        if (checkLuck(0.01)) {
          skilled = true;
          addBuff("earth",0.01,5,true)
          showSkillWord(minion, "大地之子");
        }
      }
      if (m.learnedSkills.includes("比武招亲")){
        if (checkLuck(0.05)){
          let dam = Math.floor(m.attack*0.02*Math.pow(timePlayed + totaltimePlayed,0.5));
          damageKmr(dam,m);
          showSkillWord(m, "比武招亲");
        }
      }
      if (m.learnedSkills.includes("雷维翁之力")){
        raiseAtk(minion, Math.floor(Math.pow(dam,0.85)*0.002));
        showSkillWord(minion, "雷维翁之力");
      }
    }

    minion.totalDamage += dam;
    var position = kmr.getBoundingClientRect();
    let x = position.left + (Math.random()*kmr.width);
    let y = position.top + (Math.random()*kmr.height);
    showEffect(x,y, 'hit-effect');
    showDamage(x,y, dam);

    if (Math.random() < 0.1){
      const hitSound = new Audio(minion.voice);
      hitSound.play();
    }

    gainCoin(dam);
    updateDisplays();
    checkVictory();
}

function formatNumber(num) {
    if (num == Infinity){
      return num;
    }
    const units = ['万', '亿', '兆', '京', '垓', '秭', '穰', '沟', '涧', '正', '载', '极', '恒河沙', '阿僧祗', '那由他', '不可思议', '无量', '大数'];
    const threshold = 10000; // 万的阈值

    if (num < threshold) {
        return num.toString(); // 小于万，直接返回数字
    }

    let unitIndex = -1;
    let formattedNum = num;

    while (formattedNum >= threshold && unitIndex < units.length) {
        formattedNum /= threshold;
        unitIndex++;
    }

    if (unitIndex < units.length) {
        return `${formattedNum.toFixed(2)}${units[unitIndex]}`;
    } else {
        return num.toExponential(2); // 超过最大单位，使用科学计数法
    }
}

function formatNumber2(num) {
    if (num == Infinity){
        return num.toString();
    }
    const units = ['','万', '亿', '兆', '京', '垓', '秭', '穰', '沟', '涧', '正', '载', '极', '恒河沙', '阿僧祗', '那由他', '不可思议', '无量', '大数'];
    const threshold = 10000; // 万的阈值

    if (num < threshold) {
        return num.toString(); // 小于万，直接返回数字
    }

    let unitIndex = 0;
    let formattedNum = num;

    while (formattedNum >= threshold && unitIndex < units.length) {
        formattedNum /= threshold;
        unitIndex++;
    }

    if (unitIndex < units.length) {
        let result = [];
        for (let i = unitIndex; i >= 0; i--) {
            const unitValue = Math.floor(num / Math.pow(threshold, i));
            if (unitValue > 0 || result.length > 0) { // 跳过高位的零
                if (result.length > 0){
                  let paddedUnitValue = unitValue.toString().padStart(4, '0');
                  result.push(`${paddedUnitValue}${units[i]}`);
                } else {
                  result.push(`${unitValue}${units[i]}`);
                }

                num -= unitValue * Math.pow(threshold, i);
            }
        }

        return result.slice(0, 4).join(''); // 只取最大的3个单位
    } else {
        return num.toExponential(12); // 超过最大单位，使用科学计数法，保留12位小数
    }
}

function checkVictory() {
    if (kmrHealthValue <= 0 && !victory) {
      victory = true;
      autoing = false;
      totaltimePlayed = totaltimePlayed + timePlayed;
        victoryMessage.classList.remove('hidden');
        totalTimeDisplay.textContent = timePlayed;
        totalTimeDisplay2.textContent = totaltimePlayed;
        curLevelDisplay.textContent = level;
        finalStatsDisplay.innerHTML = `
            <li>点击伤害: ${totalClickDamage}</li>
            ${[...minionsState] // 创建 minionsState 的副本
                .sort((a, b) => b.totalDamage - a.totalDamage) // 按 totalDamage 从大到小排序
                .map(minion => `<li>${minion.name}: ${formatNumber(minion.totalDamage)}</li>`)
                .join('')}
        `;
        timePlayed = 0;

    }
}

function phaseUpGame() {
  victory = false;
    level = level +1;
    document.getElementById('phase-level').textContent = level;
    kmrHealthValue = 500000 * Math.pow(10,level);
    timePlayed = 0;
    //totalClickDamage = 0;
    //let rindex = 0;
    //let minionDamages = {};
    //let minionsState = [];
    //let unlockedMinions = [];
    victoryMessage.classList.add('hidden');
    updateDisplays();
    saveGame(true);
    for (let m of minionsState){
      if (m.learnedSkills.includes("马纳利亚时刻")){
        refreshCangSkill();
      }
    }

    //initMinions(); // Initialize minions again after restarting game
}

function getattack(minion,master){
  let atk = minion.attack;
  let extraDam = 0;
  if (minion.learnedSkills.includes("鸭皇旋风斩！") && buffs.length > 0){
    if (checkLuck(0.25)){
      const maxAttackMinion = minionsState.reduce((max, minion) => {
        return (minion.attack > max.attack) ? minion : max;
      }, { attack: -Infinity }); // 初始化时假设最大的 attack 值非常小
      atk += Math.floor(maxAttackMinion.attack * (0.1* buffs.length));
      showSkillWord(minion, "鸭皇旋风斩！");
    }

  }
  for (let m of minionsState){
    if (m.name != minion.name && m.learnedSkills.includes("苦痛")){
      atk += Math.floor(m.attack*0.5);
    }
    if (m.learnedSkills.includes("祥瑞") && Math.abs(minionsState.indexOf(minion) - minionsState.indexOf(m))<=1 ){
      let low = Math.max(0, 0.5 - 0.01 * Math.floor(m.level/10));
      let high = Math.min(10,2 + 0.04 * Math.floor(m.level/10));
      let rd = Math.random()* (high - low) + low;
      atk = Math.floor(atk * rd);
    }
  }
  if (minion.learnedSkills.includes("素质家族")){
    if (checkLuck(0.08)) {
      atk*=20;
      skilled = true;
      showSkillWord(minion, "素质家族");
    }
  }
  if (minion.learnedSkills.includes("乾坤一掷")){
    if (checkLuck(zheluck*0.01,1)) {
      extraDam+=zhedam;
      skilled = true;
      zheluck = 3;
      showSkillWord(minion, "乾坤一掷");
      if (checkLuck(zheluck2*0.01,2)) {
        zhedam = Math.max(zhedam,Math.floor(maxdamZ/11));
        zheluck2 = 3;
        showSkillWord(minion, "伤害提升！");
      }
    }
  }
  if (minion.learnedSkills.includes("打个教先")){
    if (xxBuff && !master && minion.learnedSkills.includes("魔咒")){
      atk*= Math.floor(1 + Math.pow(xxjjj,2.25));
      skilled = true;
      xxBuff = false;
    } else {
      let luck = Math.max(0.2, 0.7 - 0.01* Math.floor(minion.level/15));
      if (checkLuck(luck)) {
        atk*= Math.min(10,2 + 0.1*0.01* Math.floor(minion.level/15));
        skilled = true;
        showSkillWord(minion, "结晶教胜利！");
        curjjj = 0;
      } else {
        curjjj += 1;
        if (xxjjj < curjjj){
          xxjjj = curjjj;
        }
        showSkillWord(minion, "小心结晶教！*"+curjjj);
      }
    }
  }
  if (minion.learnedSkills.includes("皇室荣耀")){
    if (checkLuck(0.1)) {
      atk += yggdam;
      skilled = true;
      showSkillWord(minion, "皇室荣耀");
    }
  }
  if (minion.learnedSkills.includes("复仇")){
    const maxHealth = 500000*Math.pow(10,level); // 假设最大血量为500,000
    const healthPercentage = (kmrHealthValue / maxHealth) * 100;
    if (healthPercentage <= 50) {
      atk*= 1 + 0.5 + 0.01*Math.floor(Math.pow(minion.level,0.75));
      showSkillWord(minion, "复仇");
    }
  }
  if (minion.learnedSkills.includes("掌控") && zenxActive){
    zenxActive = false;
    atk*= 8 + zenxLV*4;
    zenxLV = zenxLV + 1;
    skilled = true;
  }
  if (minion.learnedSkills.includes("开播！")){
    skilled = true;
    atk += Math.floor(Math.pow(Math.abs(coins),0.66)/1000*minion.level);
  }
  if (getBuffPower("idol").length > 0){
    for (let i of getBuffPower("idol")){
      atk *= i;
    }
  }

  if (getBuffPower("earth").length > 0){
    let aa = 1;
    for (let i of getBuffPower("earth")){
      aa *= (1 + i);
      plusBuffPower("earth",i,0.01);
    }
    aa = Math.min(1000,aa);
    atk *= aa;
  }
  if (getBuffPower("ya").length > 0 && minion.learnedSkills.includes("弹幕机器人")){
    let exbl = 0;
    let exNum = 0;
    for (let i of getBuffPower("ya")){
      if (checkLuck(0.25)){
        exbl += i;
        exNum += 1;
      }
    }
    atk *= 1 + exbl;
    if (exNum > 0){
      showSkillWord(minion, "弹幕指点*"+exNum);
    }
  }
  if (getBuffPower("saki").length > 0 && minion.learnedSkills.includes("终轮常客")){
    let exbl = 0;
    let sp = [];
    for (let i = 0; i < getBuffPower("saki").length; i++){
      exbl += 0.01*getBuffPower("saki")[i];
      if (checkLuck(0.02)){
        sp.push(getBuffPower("saki"));
      }
    }
    atk *= 1 + exbl;
    for (let i = sp.length - 1; i >= 0; i--) {
      killBuff("saki",sp[i])
      raiseAtk(minion,Math.floor(10*Math.pow(minion.attack,0.8)));
      showSkillWord(minion, "必可活用于下一次……");
    }
  }

  //沉底
  atk += extraDam;

  for (let m of minionsState){
    if (minion.description.includes("🐷") && m.learnedSkills.includes("老实猪猪")){
      atk *= 1.2;
    }
  }
  atk = Math.floor(atk);
  return atk;
}

function incrementRandomDigit(num) {
    // 将输入转换为数字
    let originalNum = Number(num);
    let isNegative = originalNum < 0;
    let absNum = Math.abs(originalNum);

    // 计算位数
    let numDigits = Math.floor(Math.log10(absNum)) + 1;

    // 随机选择一位
    let randomIndex = Math.floor(Math.random() * numDigits);

    // 计算该位的值
    let factor = Math.pow(10, randomIndex);
    let currentDigit = Math.floor((absNum / factor) % 10);

    let result;
    if (randomIndex === numDigits - 1) {
        // 首位特殊处理
        result = absNum + factor;
    } else {
        if (currentDigit === 9) {
            result = absNum - 9 * factor + 10 * factor;
        } else {
            result = absNum + factor;
        }
    }

    // 如果原数是负数，则结果也应为负数
    if (isNegative) {
        result = -result;
    }

    return result;
}

function checkLuck(r,fromZhe) {
  let re = 0;
  let rand = Math.random();
  let pass = rand < r;
  if (r < 0.2 && remluck > 0){
    remluck--;
    pass = rand < (r * 4);
  }
  if (fromZhe){
    for (let minion of minionsState){
      if (minion.learnedSkills.includes("终将降临的肃清")){
        let luck = Math.min(1,0.3 + 0.01 * Math.floor(minion.level/50));
        if (Math.random() < luck) {
          pass = Math.random() < r;
          if (!pass) {
            if (fromZhe == 1){zheluck += 0.3;}
            if (fromZhe == 2){zheluck2 += 0.3;}
            r += 0.003;
            showSkillWord(minion, "终将降临的肃清");
          }
        }
      }
    }
  }

  for (let m of minionsState){
    if (m.learnedSkills.includes("重返赛场") && !pass && r < 0.2){
      let luck = Math.min(0.5,0.21 + 0.01*Math.floor(m.level/25));
      if (Math.random() < luck){
        showSkillWord(m, "重返赛场");
        pass = Math.random() < r;
        if (fromZhe && !pass){
          for (let minion of minionsState){
            if (minion.learnedSkills.includes("终将降临的肃清")){
              if (fromZhe == 1){zheluck += 0.3;}
              if (fromZhe == 2){zheluck2 += 0.3;}
              r += 0.003;
              showSkillWord(minion, "终将降临的肃清");
            }
          }
        }
      }
    }
  }
  if (pass) {
    for (let m of minionsState){
      if (m.learnedSkills.includes("运气不如他们") && r < 0.2){
        showSkillWord(m, "运气不如他们");
        raiseAtk(m,Math.max(3,Math.floor(m.level/12)));
        document.getElementById(`attack-${unlockedMinions.indexOf(m.name)}`).textContent = formatNumber(m.attack);
      }
    }
    return true;
  } else {
    return false;
  }
}

function getDigit(num){
  return Math.floor(getBaseLog(10,Math.abs(num)));
}
function minionAttack(minion,master) {
    if (kmrHealthValue <= 0) return;

    skilled = false;
    let dam = getattack(minion,master)
    let gainC = dam;
    dam = dam * extraDamRatio(minion);
    dam = Math.floor(dam);

    if (minion.learnedSkills.includes("下饭")){
      if (checkLuck(0.1)) {
        gainC = dam*(getDigit(minion.attack));
        dam = - dam;
        showSkillWord(minion, "下饭");
        if (checkLuck(0.1)) {
          addBuff("ykd", 3, getDigit(minion.attack), false);
          showSkillWord(minion, "进入下饭状态！");
        }
      }
    }

    kmrTakeDam(dam);

    if (master){
      master.totalDamage += dam;
    } else {
      minion.totalDamage += dam;
    }
    var position = kmr.getBoundingClientRect();
    let x = position.left + (Math.random()*kmr.width);
    let y = position.top + (Math.random()*kmr.height);
    showEffect(x,y, 'hit-effect');
    showDamage(x,y, dam);

    if (Math.random() < 0.1){
      const hitSound = new Audio(minion.voice);
      hitSound.play();
    }
    gainCoin(gainC);

    if (minion.learnedSkills.includes("冲击冠军")){
      if (checkLuck(0.04)) {
        raiseAtk(minion,Math.floor(Math.pow(minion.level,1.1)));
        skilled = true;
        document.getElementById(`attack-${unlockedMinions.indexOf(minion.name)}`).textContent = formatNumber(minion.attack);
        showSkillWord(minion, "冲击冠军");
      }
    }
    if (minion.learnedSkills.includes("大梦仙尊")){
      let luck = Math.min(0.02,0.005 + 0.0005 * Math.max(0,getBaseLog(2,Math.abs(minion.attack)) - 10));
      if (checkLuck(luck)) {
        skilled = true;
        freeUp += 5;
        showSkillWord(minion, "大梦仙尊");
        refMinions();
      }
    }
    if (minion.learnedSkills.includes("咲夜的怀表")){
      if (checkLuck(0.01)) {
        skilled = true;
        let t = 2;
        if (getBuffPower("saki").length > 0){
          t = 4;
        }
        buffExtend(t);
        showSkillWord(minion, "咲夜的怀表");
      }
    }
    if (minion.learnedSkills.includes("+1+1")){
      if (checkLuck(0.06)) {
        skilled = true;
        minion.attack = Math.floor(minion.attack*1.1)
        minion.attackSpeed = Math.floor(minion.attackSpeed*1.08)
        document.getElementById(`attack-${unlockedMinions.indexOf(minion.name)}`).textContent = formatNumber(minion.attack);
        document.getElementById(`attack-speed-${unlockedMinions.indexOf(minion.name)}`).textContent = (minion.attackSpeed / 1000).toFixed(1)+"s";
        clearInterval(minion.intervalId)
        let intervalId = setInterval(() => minionAttack(minion), minion.attackSpeed);
        minion.intervalId = intervalId;
        showSkillWord(minion, "+1+1");
      }
    }
    if (minion.learnedSkills.includes("金牌陪练") && unlockedMinions.length > 1){
      if (checkLuck(0.18)) {
        skilled = true;
        let r = Math.floor(Math.random()*(unlockedMinions.length - 1));
        if (r >= unlockedMinions.indexOf(minion.name)){
          r += 1;
        }
        raiseAtk(minionsState[r],Math.floor(minion.attack/15));
        document.getElementById(`attack-${unlockedMinions.indexOf(minionsState[r].name)}`).textContent = formatNumber(minionsState[r].attack);
        minionAttack(minionsState[r],minion);
        showSkillWord(minion, "金牌陪练");
      }
    }
    if (minion.learnedSkills.includes("黄油品鉴")){
      if (checkLuck(0.1)){
        let unlockedCD = 0;
        for (let m of minionsState){
          if (m.count != undefined){
            unlockedCD++;
          }
        }
        skilled = true;
        let r = Math.floor(Math.random()*(unlockedCD - 1)) + 1;
        for (let m of minionsState){
          if (m.count != undefined){
            r -= 1;
            if (r == 0){
              m.count += Math.min(8,3+Math.floor(minion.level/100));
            }
          }
        }
        showSkillWord(minion, "黄油品鉴");
      }
    }
    if (minion.learnedSkills.includes("奶1")){
      if (checkLuck(0.33)) {
        skilled = true;
        gainCoin(Math.floor(Math.pow(minion.level,1.5)));
        showSkillWord(minion, "奶1");
      }
    }
    if (minion.learnedSkills.includes("理解不行")){
      let luck = Math.min(0,25,0.05 + 0.01 * getDigit(minion.attack));
      for (let bond of bondData){
        if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.skillPlus && bond.skillPlus[0] == '理解不行'){
          let c = bond.skillPlus[1];
          luck += loglevel(obtainedBonds[bond.name].level,c[0],c[1],[2]);
        }
      }
      if (checkLuck(luck)) {
        skilled = true;
        gainCoin(10*Math.floor(Math.pow(minion.level,2)));
        minusLevel(minion,1);
        showSkillWord(minion, "理解不行");
      }
    }
    if (minion.learnedSkills.includes("偶像")){
      if (checkLuck(0.07)) {
        skilled = true;
        addBuff("idol",1.2 + 0.02*getDigit(dam),10,true)
        showSkillWord(minion, "偶像");
      }
    }

    if (minion.learnedSkills.includes("人偶使") && unlockedMinions.length > 1) {
        if (checkLuck(0.08)) {
            skilled = true;
            let t = 3 + getBuffPower("idol").length * 3;

            // 过滤掉所有learnedSkills中有“人偶使”的角色
            const filteredMinions = unlockedMinions.filter(m => !minionsState[unlockedMinions.indexOf(m)].learnedSkills.includes("人偶使"));

            for (let i = 0; i < t; i++) {
                if (filteredMinions.length === 0) break; // 如果没有可选的角色，提前退出循环
                let r = Math.floor(Math.random() * filteredMinions.length);
                minionAttack(minionsState[unlockedMinions.indexOf(filteredMinions[r])], minion);
            }

            showSkillWord(minion, "人偶使");
        }
    }

    for (let m of minionsState){
      if (getBuffPower("nao").length > 0){
        if (minion.description.includes("🐷") && m.learnedSkills.includes("闹系列")){
          m.count = 999;
          showSkillWord(m, "闹系列发威！");
        }
      }
      if (m.name != minion.name && m.learnedSkills.includes("永失吾艾")){
        if (checkLuck(0.08)) {
          minionAttack(m);
          showSkillWord(m, "永失吾艾");
        }
      }
      if (minion.description.includes("🐷") && m.learnedSkills.includes("身外化身")){
        if (checkLuck(0.1)) {
          minionAttack(minion,m);
          showSkillWord(m, "身外化身");
        }
      }
      if (skilled && m.name != minion.name && m.learnedSkills.includes("GN")){
        if (checkLuck(0.1)) {
          raiseAtk(m, Math.floor(minion.attack*0.03));
          for (let i = 0; i < 3; i++){
            minionAttack(m);
          }
          showSkillWord(m, "GN");
        }
      }
      if (m.name != minion.name && m.learnedSkills.includes("无尽连击")){
        m.attack += Math.floor(m.addattack/2);
        m.tempAtk += Math.floor(m.addattack/2);
        document.getElementById(`attack-${unlockedMinions.indexOf(m.name)}`).textContent = formatNumber(m.attack);
        showSkillWord(m, "无尽连击");
      }
    }
    if (getBuffPower("pigu").length > 0){
      if (checkLuck(0.01*getBuffPower("pigu")[0])){
        minionAttack(minion,master);
        showSkillWord(minion, "鼙鼓！");
      }
    }
    updateDisplays();
    checkVictory();
}

function refMinions() {
    const minionsContainer = document.getElementById('minions-container');
    minionsContainer.innerHTML = ''; // Clear existing minions
    let minionsSubs = [];
    minionsState.forEach((minion, index) => {
        const minionElement = document.createElement('div');
        minionElement.className = 'minion';
        const nameStyle = marriage.includes(minion.name) && lostTeam.includes(minion.name)
            ? 'style="background: linear-gradient(to right, pink, red); -webkit-background-clip: text; color: transparent; font-weight: bold;"'
            : marriage.includes(minion.name)
                ? 'style="color: pink; font-weight: bold;"'
                : lostTeam.includes(minion.name)
                    ? 'style="color: red; font-weight: bold;"'
                    : '';

        minionElement.innerHTML = `
            <img id="image-${index}" src="${minion.image}" alt="${minion.name}">
            <div ${nameStyle}>${minion.name}</div>
            <div>等级: <span id="level-${index}">${minion.level}</span></div>
            <div>攻击: <span id="attack-${index}">${formatNumber(minion.attack)}</span></div>
            <div>攻速: <span id="attack-speed-${index}">${(minion.attackSpeed / 1000).toFixed(1)}s</span></div>
            <button id="cost-${index}" onclick="upgradeMinionClick(${index})" >升级 (${formatNumber(mupgradeCost(minion))})</button>
        `;
        if (minion.reroll > 0 && unlockCost(unlockedMinions.length) < Infinity){
          minionElement.innerHTML += `<button id="reroll-${index}" onclick="rerollMinion(${index})" >重抽 (剩余${minion.reroll}次) (${formatNumber(rerollCost(unlockedMinions.length))})</button>`
        }
        minionElement.addEventListener('click', () => {
            showMinionDetails(index);
        });
        minionsContainer.appendChild(minionElement);

    });

    document.getElementById(`unlockButton`).textContent = "抽取助战 (金币:" + formatNumber(unlockCost(unlockedMinions.length)) +")";
}

function unlockCost(n) {
  if (minions.length == unlockedMinions.length){
    return Infinity;
  }
  let cost = 9 + 10*n + 4*n*n + Math.floor(2.7*Math.pow(n,3.25) + Math.pow(2.75,n));
  cost = Math.floor(cost * Math.pow(unlockedMinions.length + 1,0.5));
  if (unlockedMinions.length >= 10){
    cost *= (unlockedMinions.length - 8);
  }
  for (let m of minionsState){
    if (m.learnedSkills.includes("小猪存钱罐")){
      cost = 0.75*cost;
    }
  }
  for (let bond of bondData){
    if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.unlockMinusCost){
      let c = bond.unlockMinusCost;
      let minrate = loglevel(obtainedBonds[bond.name].level,c[0],c[1],[2]);
      cost *= (1 - minrate);
    }
  }
  cost = Math.floor(cost)
  return cost;
}

function rerollCost(n) {
  if (freeReroll > 0){
    return 0;
  }
  return Math.floor(unlockCost(n-1)/2);
}

function rerollTime() {
  let t = 2;
  for (let m of minionsState){
    if (m.learnedSkills.includes("不稳定的传送门")){
      t += 1;
    }
  }
  return t;
}

function rerollMinion(index){
  if (kmrHealthValue <= 0){return;}
  burning = 0;
    const uCost = rerollCost(unlockedMinions.length)
    if (coins >= uCost) {
      coins -= uCost;
      if (uCost == 0){
        freeReroll --;
      }
        let temp = minionsState[index].reroll;
        let r = Math.floor(Math.random() * (minions.length - unlockedMinions.length));
        let restMinions = minions.filter((m) => !unlockedMinions.includes(m.name));
        clearInterval(minionsState[index].intervalId);
        unlockedMinions.splice(index, 1);
        minionsState.splice(index, 1);
        unlockMinion(restMinions[r],temp);
        updateDisplays();
    } else {
      const mi = document.getElementById(`reroll-`+index);
      var position = mi.getBoundingClientRect();
      let x = position.left + (0.5*position.width);
      let y = position.top + (0.5*position.height);
      showWord(x,y, "金币不足！");
    }
}

function unlockRandMinion() {
  if (kmrHealthValue <= 0){return;}
  burning = 0;
    const uCost = unlockCost(unlockedMinions.length)
    if (coins >= uCost) {
      coins -= uCost;
        let r = Math.floor(Math.random() * (minions.length - unlockedMinions.length));
        let restMinions = minions.filter((m) => !unlockedMinions.includes(m.name));
        let n = rerollTime();
        unlockMinion(restMinions[r],n+1);
        updateDisplays();
    } else {
      const mi = document.getElementById(`unlockButton`);
      var position = mi.getBoundingClientRect();
      let x = position.left + (0.5*position.width);
      let y = position.top + (0.5*position.height);
      showWord(x,y, "金币不足！");
    }
}


function showMinionDetails(index) {
    rindex = index;
    refreshMinionDetails();
}

function refreshMinionDetails() {
  const minion = minionsState[rindex];
  const detailsContainer = document.getElementById('selected-minion-details');
  let code = "升级";

  if (minion.level == 0){
    code = "解锁"
  }
  detailsContainer.innerHTML = `
      <h3>${minion.name}</h3>
      <img src="${minion.image}" alt="${minion.name}">
      <p>${minion.description}</p>
      <div>等级: ${minion.level}</div>
      <div>攻击: ${formatNumber(minion.attack)}</div>
      <div>攻速: ${(minion.attackSpeed / 1000).toFixed(1)}s</div>
      <div>升级+攻击: ${minion.addattack}</div>
      <button onclick="upgradeMinionClick(${rindex})" >${code} (金币: ${formatNumber(mupgradeCost(minion))})</button>
      <h4>技能</h4>
      <ul>
          ${minion.skills.map(skill => `<li>等级 ${skill.level}: ${skill.name} - ${getEff(skill)}</li>`).join('')}
      </ul>
  `;
}

function getEff(skill){
  switch (skill.name){
    case "掌控":
      return "每11s，有12.5%的概率使下一次攻击造成的伤害变为"+(8+4*zenxLV)+"倍。每次触发，使倍率增加4。";
    case "皇室荣耀":
      return "攻击时8%概率额外造成"+formatNumber(yggdam)+"点伤害。每当助战在升级时提升攻击力，该技能的伤害提升等量数值。";
    case "魔咒":
      return "每48s，使你下一次攻击不再判定前一技能，而是改为额外造成[本局游戏前一技能最高连续失败次数^2.25]倍的伤害。（目前最高连续失败次数为"+xxjjj+"）。";
    case "乾坤一掷":
      return "攻击后，有"+Math.floor(zheluck*100)/100+"%概率附加"+formatNumber(zhedam)+"点伤害；在此基础上，"+Math.floor(zheluck2*100)/100+"%概率将本技能的伤害转变为[kmr单次受到的最高伤害/11]点伤害。（不会低于原本伤害，目前最高单次伤害为"+formatNumber(maxdamZ)+");"
    case "卓绝的契约":
      if (daZhaiQiYue){
        return "每局游戏仅限一次，主动将一个助战升到2级时，如果你的助战数为7以上，使其攻击速度永久减少20%，升级时攻击力增加量变为原本的^2，并且攻击力永久增加[该助战的攻击力]的数值。（契约已签订——"+daZhaiQiYue+"）";
      } else {
        return "每局游戏仅限一次，主动将一个助战升到2级时，如果你的助战数为7以上，使其攻击速度永久减少20%，升级时攻击力增加量变为原本的^2，并且攻击力永久增加[该助战的攻击力]的数值。（契约尚未签订）";
      }
    case "虫法之王":
      return "每当一个倒计时技能触发后，使一个随机助战获得"+chongMing+"*[该助战等级/3]点攻击力。每次触发，使倍率+1。";
    case "马纳利亚时刻":
      return `该技能为一个随机其他技能，与其共享各种变量。进入新周目后，切换随机技能。<br>当前技能：<br><span style="font-size: smaller;">${cangSkill} - ${getdesc(cangSkill)}</span>`;
    case "红娘":
      if (marriage.length < 2){
        return "每局游戏仅限一次，下2个你手动升级的助战将结婚。结婚的助战其中一方由于升级增加攻击力时，另一方也会提升等量攻击力。（尚未连结红线！）";
      } else {
        return "每局游戏仅限一次，下2个你手动升级的助战将结婚。结婚的助战其中一方由于升级增加攻击力时，另一方也会提升等量攻击力。（已连结红线：["+marriage[0]+"]与["+marriage[1]+"]）";
      }
    case "小说家":
      if (coolAnim){
        return skill.effect + "（已开启）";
      } else {
        return skill.effect + "（已关闭）";
      }
    case "行为艺术":
      return "每随机10s~70s，攻击X次，加速下一个该技能Ys，接下来Zs你的攻击将会造成酷炫的特效（不叠加，复数延长时长）。XYZ的数值为随机指定，其和为"+lostXYZ+"。每当任意一项为0，永久增加本技能XYZ的和1点。";
    case "太上皇":
      return skill.effect + "（当前战队成员："+(lostTeam.length > 0 ? lostTeam.join('、') : '无')+"）";
    default:
      return skill.effect;
  }

}

function getdesc(skillName){
  if (skillName == ''){
    return "暂无";
  }
  for (let m of minions){
    for (let s of m.skills){
      if (s.name == skillName){
        return getEff(s);
      }
    }
  }
}
function mupgradeCost(minion){
  if (freeUp > 0){
    return 0;
  }
  let cost = (minion.basecost + minion.level * minion.enhancecost + minion.level*minion.level * minion.supEnhancecost);
  if (minion.level > 100){
    cost *= Math.floor(Math.pow(minion.level/100,0.5));
  }
  cost = Math.pow(cost,1 + minion.level/5000)

  for (let bond of bondData){
    if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.upgradeMinusCost && bond.characters.includes(minion.name)){
      let c = bond.upgradeMinusCost;
      let minrate = loglevel(obtainedBonds[bond.name].level,c[0],c[1],[2]);
      cost *= (1 - minrate);
    }
    if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.upgradeAllMinusCost ){
      let c = bond.upgradeAllMinusCost;
      let minrate = loglevel(obtainedBonds[bond.name].level,c[0],c[1],[2]);
      cost *= (1 - minrate);
    }
  }

  for (let m of minionsState){
    if (minion.description.includes("🐷") && m.learnedSkills.includes("管人痴")){
      cost = Math.floor(Math.pow(cost,0.95));
    }
  }

  for (let m of minionsState){
    if (m.learnedSkills.includes("白骨夫人")){
      cost = Math.floor((0.8 - Math.min(0.1,0.01*Math.floor(m.level/100)))*cost)
    }
  }

  cost = Math.floor(cost);
  return cost;
}

function minusLevel(minion,l){
  minion.level -= l;
  minion.level = Math.max(1,minion.level);
  for (let m of minionsState){
    if (m.learnedSkills.includes("恭顺")){
      let unlockedCD = 0;
      let maxCount = -1;
      let maxCountMinion = null;

      for (let m of minionsState) {
        if (m.count != undefined) {
          if (m.count > maxCount) {
            maxCount = m.count;
            maxCountMinion = m;
          }
        }
      }

      if (maxCountMinion != null) {
        maxCountMinion.count += 2;
      }

      showSkillWord(m, "恭顺");
    }
  }
}

function refreshCangSkill() {
  for (let m of minionsState){
    if (m.learnedSkills.includes("马纳利亚时刻")){

      for (let s of m.learnedSkills){
        if (!["马纳利亚时刻","素材奖励"].includes(s)){
          m.learnedSkills.splice(m.learnedSkills.indexOf(s));
          break;
        }
      }

      let valid = false;
      let s;
      while (!valid){
        let r = Math.floor(Math.random()*(minions.length - 1));
        if (r >= 33){ //仓仓是33
          r += 1;
        }
        s = minions[r].skills[Math.floor(Math.random() * 2)];
        valid = !(["说书","不稳定的传送门","卓绝的契约","红娘"].includes(s));
      }

      m.learnedSkills.push(s.name);
      if (m.tempAtk > 0){
        m.attack -= m.tempAtk;
        m.tempAtk = 0;
      }
      cangSkill = s.name;
      showSkillWord(m, "马纳利亚时刻！");
      if (m.learnedSkills.includes("素材奖励")){
        for (let mi of minionsState){
          if (m.name != mi.name && mi.learnedSkills.includes(s.name)){
            raiseAtk(mi,Math.floor(m.attack*0.05));
            showSkillWord(m, "素材奖励");
          }
        }
      }
    }
  }
}

function zeroCountDown(c) {
  for (let m of minionsState){
    if (m.learnedSkills.includes("死灵艺术")){
      if (checkLuck(0.15)){
        m.count = zeroCountDown(19);
        let dam = Math.floor(m.attack*Math.pow(level+1,0.5));
        damageKmr(dam,m);
        showSkillWord(m, "死灵艺术");
      }
    }
    if (m.learnedSkills.includes("弹幕机器人")){
      if (checkLuck(0.08)) {
        addBuff("ya",3,8,true)
        showSkillWord(m, "弹幕机器人");
      }
    }
    if (m.learnedSkills.includes("虫法之王")){
      let r = Math.floor(Math.random()*(unlockedMinions.length));
      raiseAtk(minionsState[r],Math.floor(chongMing*m.level/3));
      chongMing += 1;
      showSkillWord(m, "虫法之王");
    }
  }
  for (let m of minionsState){
    if (m.learnedSkills.includes("电表白转")){
      let luck = 0.15 + 0.01*Math.min(25,Math.floor(m.level/50));
      if (checkLuck(luck)){
        return Math.floor(c/2);
      }
    }
  }
  return 0;
}

function generateXYZ(totalAllies) {
  // 用于生成符合二项分布的随机整数
  const randomMultinomial = (n, pArray) => {
    const results = Array(pArray.length).fill(0);
    for (let i = 0; i < n; i++) {
      let r = Math.random();
      for (let j = 0; j < pArray.length; j++) {
        if (r < pArray[j]) {
          results[j]++;
          break;
        }
        r -= pArray[j];
      }
    }
    return results;
  };

  // 概率可以均匀分布，意味着 pX = pY = pZ = 1/3
  const probabilities = [1/3, 1/3, 1/3];

  // 调用 randomMultinomial 生成 X, Y, Z
  const [X, Y, Z] = randomMultinomial(totalAllies, probabilities);

  for (let m of minionsState){
    if (m.learnedSkills.includes("太上皇")){
      if (Z >= X + Y){
        let filteredMinions = unlockedMinions.filter(mi =>
            !lostTeam.includes(mi) && mi !== m.name
        );
        let r = Math.floor(Math.random()*(filteredMinions.length - 1));
        let rname = filteredMinions[r];
        let n = unlockedMinions.indexOf(rname);
        lostTeam.push(rname);
        showSkillWord(m, "太上皇招募："+rname);
        if (lostTeam.length > Math.floor(Math.pow(unlockedMinions.length,0.5))){
          lostTeam = [];
          showSkillWord(m, "解散！");
        }
      }
    }
  }

  return { X, Y, Z };
}

function completedBond(bond){
    for (let c of bond.characters){
      if (!unlockedMinions.includes(c)){
        return false;
      }
    }
    return true;
}

function extraDamRatio(minion){
  let dam = 1;
  if (lostTeam.includes(minion.name)){
    dam = dam * 3;
  }
  dam = dam * etherPlusDam();
  for (let bond of bondData){
    if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.extraDam && bond.characters.includes(minion.name)){
      dam *= 1 + bond.extraDam * obtainedBonds[bond.name].level;
    }
  }
  for (let bond of bondData){
    if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.extraDamAll){
      dam *= 1 + bond.extraDamAll * obtainedBonds[bond.name].level;
    }
  }

  return dam;
}
function getAddattack(minion){
    let amount = minion.addattack;
    for (let bond of bondData){
      if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.upgradeExtraA && bond.characters.includes(minion.name)){
        amount += bond.upgradeExtraA * obtainedBonds[bond.name].level;
      }
    }
    return amount;
}

function loglevel(level,base,thres,decayRate,max) {
    let reductionRate = 0;

    if (level <= thres) {
        reductionRate = base * level;
    } else {
        reductionRate = base * thres;

        const excessLevels = level - thres;
        const logDecay = Math.log(1 + excessLevels*base) * decayRate;

        reductionRate += logDecay;
    }

    return reductionRate;
}


function updateCounts() {
  if (kmrHealthValue <= 0){return;}
  let need = false;
  let ref = false;
  buffCountDown();
  for (let m of minionsState){
    if (m.learnedSkills.includes("五种打法")){
      burning ++;
      if (burning >= 20){
        burning = zeroCountDown(20);
        raiseAtk(m,5*unlockedMinions.length*(level+1));
        document.getElementById(`attack-${unlockedMinions.indexOf(m.name)}`).textContent = formatNumber(m.attack);
        need = true;
        showSkillWord(m, "五种打法");
      }
    }
    if (m.learnedSkills.includes("操纵命运")){
      if (!m.count){m.count = 0};
      m.count ++;
      if (m.count >= 35){
        m.count = zeroCountDown(35);
        remluck = Math.min(12,2 + Math.floor(m.level/100))
        showSkillWord(m, "操纵命运");
        need = true;
      }
    }
    if (m.learnedSkills.includes("鼙鼓时间！")){
      if (!m.count){m.count = 0};
      m.count ++;
      let time = Math.max(36,48 - Math.floor(m.level/100));
      if (m.count >= time){
        m.count = zeroCountDown(time);
        addBuff("pigu",5,6,false);
        showSkillWord(m, "鼙鼓时间！");
        need = true;
      }
    }
    if (m.learnedSkills.includes("魔咒")){
      if (!m.count){m.count = 0};
      m.count ++;
      if (m.count >= 48){
        m.count = zeroCountDown(48);
        xxBuff = true;
        showSkillWord(m, "魔咒");
        need = true;
      }
    }
    if (m.learnedSkills.includes("汲取兄弟")){
      if (!m.count){m.count = 0};
      m.count ++;
      if (m.count >= 25){
        m.count = zeroCountDown(25);
        let unlockedPigs = 0;
        for (let m of minionsState){
          if (m.description.includes("🐷")){
            unlockedPigs++;
          }
        }
        let luck = 0.15;
        if (getBuffPower("nao") > 0){
          luck = 0.45;
        }
        if (unlockedPigs > 1 && checkLuck(luck)) {
          skilled = true;
          let r = Math.floor(Math.random()*(unlockedPigs - 1)) + 1;
          for (let mi of minionsState){
            if (mi.description.includes("🐷") && mi.name != m.name){
              r -= 1;
              if (r == 0){
                raiseAtk(m,Math.max(1,Math.floor(mi.attack*0.02)))
                minusLevel(mi,3);
              }
            }
          }
          showSkillWord(m, "汲取兄弟");
          ref = true;
          need = true;
        }
      }
    }
    if (m.learnedSkills.includes("成熟")){
      if (!m.count){m.count = 0};
      m.count ++;
      if (m.count >= 30){
        m.count = zeroCountDown(30);
        let r = Math.floor(Math.random()*(unlockedMinions.length - 1));
        if (r >= unlockedMinions.indexOf(m.name)){
          r += 1;
        }
        minusLevel(minionsState[r],Math.max(1,Math.floor(minionsState[r].level*0.01)));
        minusLevel(m.level, Math.max(1,Math.floor(m.level*0.01)));
        showSkillWord(m, "成熟!");
        ref = true;
        need = true;
      }
    }
    if (m.learnedSkills.includes("造谣")){
      if (!m.count){m.count = 0};
      m.count ++;
      if (m.count >= 14){
        m.count = zeroCountDown(14);
        let times = 1 + Math.floor(Math.pow(m.level,0.8)/50);
        for (let t = 0; t < times; t++){
          let r = Math.floor(Math.random()*(unlockedMinions.length));
          minionsState[r].attack = incrementRandomDigit(minionsState[r].attack);
        }

        showSkillWord(m, "造谣");
        ref = true;
        need = true;
      }
    }
    if (m.learnedSkills.includes("每日饼之诗")){
      if (!m.count){m.count = 0};
      m.count ++;
      if (m.count >= 90){
        m.count = zeroCountDown(90);
        for (let mi of minionsState){
          if (mi.name != m.name){
            let amount = m.attack/25;
            for (let bond of bondData){
              if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.skillPlus && bond.skillPlus[0] == '每日饼之诗'){
                let c = bond.skillPlus[1] * obtainedBonds[bond.name].level;
                amount *= 1 + c;
              }
            }
            raiseAtk(mi,Math.floor(amount));
            document.getElementById(`attack-${unlockedMinions.indexOf(mi.name)}`).textContent = formatNumber(mi.attack);
          }
        }
        showSkillWord(m, "每日饼之诗");
        need = true;
      }
    }

    if (m.learnedSkills.includes("硬实力冠军")){
      if (!m.count){m.count = 0};
      m.count ++;
      if (m.count >= 30){
        m.count = zeroCountDown(30);
        let addatk = [];
        for (let mi of minionsState){
          if (mi.name != m.name && mi.attack > m.attack){
            addatk.push(Math.floor(Math.pow(Math.abs(mi.attack - m.attack),0.9) * 0.1) );
          }
        }
        for (let a of addatk){
          raiseAtk(m,a);
        }
        document.getElementById(`attack-${unlockedMinions.indexOf(m.name)}`).textContent = formatNumber(m.attack);
        showSkillWord(m, "硬实力冠军");
        need = true;
      }
    }
    if (m.learnedSkills.includes("终轮常客")){
      if (!m.count){m.count = 0};
      m.count ++;
      if (m.count >= 40){
        m.count = zeroCountDown(40);
        addBuff("saki", Math.floor(100 + Math.pow(m.level,0.5)), 20, false);
        showSkillWord(m, "终轮常客");
      }
    }

    if (m.learnedSkills.includes("记忆殿堂")){
      if (!m.count){m.count = 0};
      m.count ++;
      if (m.count >= 72){
        m.count = zeroCountDown(72);
        for (let b of Object.keys(lastBuffs)){
          let binfo = lastBuffs[b];
          addBuff(b,binfo[0],binfo[1],binfo[2]);
        }
        showSkillWord(m, "记忆殿堂");
        need = true;
      }
    }

    if (m.learnedSkills.includes("法神的宣告")){
      if (!m.count){m.count = 0};
      m.count ++;
      if (m.count >= 60){
        m.count = zeroCountDown(60);
        let prob = generateXYZ(unlockedMinions.length);
        damageKmr(prob.X*m.attack,m);
        let unlockedCD = 0;
        for (let m of minionsState){
          if (m.count != undefined){
            unlockedCD++;
          }
        }
        for (let i = 0; i < prob.Y; i++){
          let r = Math.floor(Math.random()*(unlockedCD - 1));
          for (let mi of minionsState){
            if (m.name != mi.name && mi.count != undefined){
              r -= 1;
              if (r == 0){
                mi.count += 1;
              }
            }
          }
        }
        for (let i = 0; i < prob.Z; i++){
          let r = Math.floor(Math.random()*(unlockedMinions.length));
          let kagaMulti = 1;
          let amount = chongMing*m.level/3

          for (let bond of bondData){
            if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.skillPlus && bond.skillPlus[0] == '虫法之王'){
              let c = bond.skillPlus[1] * obtainedBonds[bond.name].level;
              kagaMulti *= 1 + c;
              chongMing += obtainedBonds[bond.name].level;
            }
          }

          if (minionsState[r].name == 'kaga'){
            amount *= kagaMulti;
          }
          raiseAtk(minionsState[r],Math.floor(amount));
          chongMing += 1;
          showSkillWord(m, "虫法之王");
        }
        showSkillWord(m, "法神的宣告：X="+prob.X+", Y="+prob.Y+", Z="+prob.Z);
        need = true;
      }
    }

    if (m.learnedSkills.includes("行为艺术")){
      if (!m.count){m.count = 0};
      if (!m.maxCount){m.maxCount = Math.floor(10 + 60*Math.random())};
      m.count ++;
      if (m.count >= m.maxCount){
        m.maxCount = Math.floor(10 + 60*Math.random());
        m.count = zeroCountDown(m.maxCount);
        let prob = generateXYZ(lostXYZ);
        for (let i = 0; i < prob.X; i++){
          minionAttack(m);
        }
        m.count += prob.Y;
        if (prob.Z > 0){
          addBuff("lost",114,prob.Z,false)
        }
        if (prob.X == 0 || prob.Y == 0 || prob.Z == 0){
          lostXYZ += 1;
        }
        showSkillWord(m, "行为艺术：X="+prob.X+", Y="+prob.Y+", Z="+prob.Z);
        need = true;
      }
    }

    if (m.learnedSkills.includes("逆境被动")){
      if (!m.count){m.count = 0};
      m.count ++;
      if (m.count >= 12){
        m.count = zeroCountDown(12);
        let rank = 0;
        for (let mi of minionsState) {
            if (mi.name != m.name && mi.totalDamage > m.totalDamage) {
                rank++;
            }
        }
        let luck = 0.02*rank;
        if (checkLuck(luck)){
          let atkp = 0;
          for (let mi of minionsState) {
              if (mi.name != m.name && mi.attack/mi.attackSpeed > atkp) {
                  atkp = Math.floor(mi.attack/(mi.attackSpeed/1000)/10);
              }
          }
          raiseAtk(m,atkp);
          for (let i = 0; i < rank*2; i++){
              minionAttack(m);
          }
          document.getElementById(`attack-${unlockedMinions.indexOf(m.name)}`).textContent = formatNumber(m.attack);
          showSkillWord(m, "逆境被动");
        }

        need = true;
      }
    }

    if (m.learnedSkills.includes("罕见")){
      if (!m.count){m.count = 0};
      m.count ++;
      if (m.count >= 50){
        m.count = zeroCountDown(50);
        let amount = coins/10;
        for (let bond of bondData){
          if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.skillPlus && bond.skillPlus[0] == '罕见'){
            let c = bond.skillPlus[1] * obtainedBonds[bond.name].level;
            amount *= 1 + c;
          }
        }
        amount = Math.floor(amount);
        gainCoin(Math.min(maxdamZ,amount));
        skilled = true;
        showSkillWord(m, "罕见");
        need = true;
      }
    }
    if (m.learnedSkills.includes("无尽连击")){
      if (!m.count){m.count = 0};
      m.count ++;
      if (m.count >= 30){
        m.count = zeroCountDown(30);
        m.attack -= m.tempAtk;
        m.attack = Math.max(0,m.attack);
        let luck = 0.05 + 0.01*Math.floor(m.level/50);
        if (checkLuck(luck)){
          raiseAtk(m,Math.floor(m.tempAtk/10));
          document.getElementById(`attack-${unlockedMinions.indexOf(m.name)}`).textContent = formatNumber(m.attack);
        }
        m.tempAtk = 0;
        showSkillWord(m, "无尽连击");
        need = true;
      }
    }
    if (m.learnedSkills.includes("掌控")){
      if (!m.count){m.count = 0};
      m.count ++;
      if (m.count >= 11){
        m.count = zeroCountDown(11);
        if (checkLuck(0.125)){
          zenxActive = true;
          showSkillWord(m, "掌控");
        }
      }
    }
    if (m.learnedSkills.includes("饿龙咆哮")){
      if (!m.count){m.count = 0};
      m.count ++;
      if (m.count >= 24){
        m.count = zeroCountDown(24);
        let dam = Math.floor(m.attack*m.attackSpeed/1000);
        damageKmr(dam,m);
        showSkillWord(m, "饿龙咆哮");
      }
    }
    if (m.learnedSkills.includes("铁犀冲锋")){
      if (!m.count){m.count = 0};
      m.count ++;
      if (m.count >= 8){
        m.count = zeroCountDown(8);
        if (checkLuck(0.04)){
          let dam = Math.floor(m.attack*Math.pow(m.level,0.6));
          damageKmr(dam,m);
          showSkillWord(m, "铁犀冲锋");
        }
      }
    }
    if (m.learnedSkills.includes("一十九米肃清刀")){
      if (!m.count){m.count = 0};
      m.count ++;
      if (m.count >= 19){
        m.count = zeroCountDown(19);
        let dam = Math.floor(m.attack*unlockedMinions.length/2);
        damageKmr(dam,m);
        showSkillWord(m, "一十九米肃清刀");
      }
    }
    if (m.learnedSkills.includes("巨人")){
      if (!m.count){m.count = 0};
      m.count ++;
      if (m.count >= 32){
        m.count = zeroCountDown(32);
        let dam = 0;
        let zPlus = 0;
        for (let bond of bondData){
          if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.skillPlus && bond.skillPlus[0] == '巨人'){
            let c = bond.skillPlus[1] * obtainedBonds[bond.name].level;
            zPlus += c;
          }
        }
        for (let mi of minionsState){
          dam += mi.attack;
          if (mi.name == "ZenX"){
            dam += mi.attack * zPlus;
          }
        }
        dam*= getDigit(m.attack);
        dam = Math.floor(dam/2)
        damageKmr(dam,m);
        showSkillWord(m, "巨人");
      }
    }
    if (m.learnedSkills.includes("次元超越")){
      let c = 40;
      c -= Math.max(0,Math.min(15,Math.floor(Math.pow(m.level,0.8)/100)));
      if (!m.count){m.count = 0};
      m.count ++;
      if (m.count >= c){
        m.count = zeroCountDown(c);
        for (let mi of minionsState){
          if (mi.name != m.name){
            minionAttack(mi,m);
          }
        }
        showSkillWord(m, "次元超越");
        need = true;
      }

    }
  }
  if (ref){
    refMinions();
  }
  if (need){
    updateDisplays();
  }
}

function getBaseLog(x, y) {
  return Math.log(y) / Math.log(x);
}

function raiseAtk(minion,amount,norepeat,fromUpgrade){
  if (fromUpgrade){
    for (let bond of bondData){
      if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.upgradeAllAPlusl){
        amount += Math.max(1,amount * (1 +bond.upgradeAllAPlus * obtainedBonds[bond.name].level));
      }
    }
  }
  for (let m of minionsState){
    if (m.name != minion.name && m.learnedSkills.includes("做法") && amount < 0.01 * m.attack){
      if (checkLuck(0.15)){
        amount = Math.min(amount * 4, Math.floor(0.01 * m.attack));
        showSkillWord(m, "做法");
      }
    }
  }
  minion.attack += amount;
  if (marriage[0] == minion.name && fromUpgrade){
    raiseAtk(minionsState(unlockedMinions.indexOf(marriage[1])),amount);
  }
  if (marriage[1] == minion.name && fromUpgrade){
    raiseAtk(minionsState(unlockedMinions.indexOf(marriage[0])),amount);
  }

  if (fromUpgrade){
    for (let bond of bondData){
      if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.upBond){
        let c = bond.upBond;
        let ratio = loglevel(obtainedBonds[bond.name].level,c[0],c[1],[2]);
        if (bond.characters[0] == minion.name){
          raiseAtk(minionsState(unlockedMinions.indexOf(bond.characters[1])),Math.max(1,Math.floor(ratio * amount)));
        }
        if (bond.characters[1] == minion.name){
          raiseAtk(minionsState(unlockedMinions.indexOf(mbond.characters[0])),Math.max(1,Math.floor(ratio * amount)));
        }
      }
    }
  }

  for (let m of minionsState){
    if (m.name != minion.name && m.learnedSkills.includes("上帝") && !norepeat){
      let ratio = 0.12;
      for (let bond of bondData){
        if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.skillPlus && bond.skillPlus[0] == '上帝'){
          let c = bond.skillPlus[1];
          ratio += loglevel(obtainedBonds[bond.name].level,c[0],c[1],[2]);
        }
      }
      raiseAtk(m,Math.max(1,Math.floor(amount*ratio)),true);
      document.getElementById(`attack-${unlockedMinions.indexOf(m.name)}`).textContent = formatNumber(m.attack);
      showSkillWord(m, "上帝");
    }
    if (upgrading && m.learnedSkills.includes("皇室荣耀")){
      let am = amount;
      for (let bond of bondData){
        if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.skillPlus && bond.skillPlus[0] == '皇室荣耀'){
          let c = bond.skillPlus[1] * obtainedBonds[bond.name].level;
          am *= 1 + c;
        }
      }
      am = Math.floor(am);
      yggdam += am;
      showSkillWord(m, "皇室荣耀");
    }
  }
}

function autoupgradeMinion(){
    autoing = true;
    let enough = true;
    while (enough) {
        enough = false;
        let minCost = Infinity;
        let minIndex = -1;

        // 找到升级花费最小的随从
        for (let i = 0; i < unlockedMinions.length; i++) {
            const cost = mupgradeCost(minionsState[i]);
            if (cost < minCost) {
                minCost = cost;
                minIndex = i;
            }
        }

        // 如果找到的最小花费随从可以升级，则升级它
        if (minIndex !== -1 && upgradeMinion(minIndex, true)) {
            enough = true;
        }
    }
    autoing = false;
    updateDisplays();
}


function upgradeMinionClick(index) {
    if (event.ctrlKey) {
        return autoupgradeOneMinion(index);
    } else {
        return upgradeMinion(index);
    }
}


function autoupgradeOneMinion(index){
    autoing = true;
    let enough = true;
    while (enough) {
        enough = upgradeMinion(index, true)
    }
    autoing = false;
    updateDisplays();
}

function isPrime(num) {
    // 质数必须大于1
    if (num <= 1) {
        return false;
    }

    // 2和3是质数
    if (num <= 3) {
        return true;
    }

    // 如果可以被2或3整除，不是质数
    if (num % 2 === 0 || num % 3 === 0) {
        return false;
    }

    // 在6的倍数的两侧才可能是质数
    let i = 5;
    while (i * i <= num) {
        if (num % i === 0 || num % (i + 2) === 0) {
            return false;
        }
        i += 6;
    }

    return true;
}

function upgradeMinion(index,auto,free,noskill) {
  if (kmrHealthValue <= 0 && !free){return;}
    upgrading = true;
    burning = 0;
    const minion = minionsState[index];
    let upgradeCost = mupgradeCost(minion);
    if (free){
      upgradeCost = 0;
    }
    if (coins >= upgradeCost) {
        coins -= upgradeCost;
        if (upgradeCost == 0 && !free){
          freeUp -= 1;
          if (freeUp == 0){
            refMinions();
          }
        }
        if (!noskill){
          minion.reroll = 0;
        }

        minion.level += 1;
        raiseAtk(minion,getAddattack(minion),true); // Increase attack by 2 for each level
        for (let m of minionsState){
          if (m.name != minion.name && m.learnedSkills.includes("构筑带师")){
            raiseAtk(minion,Math.floor(Math.pow(m.attack,0.95)/30),true);
            showSkillWord(m, "构筑带师");
          }
          if (m.name != minion.name && m.learnedSkills.includes("红娘")){
            if (marriage.length < 2 && (!autoing) && (!free) && (!auto) && (!noskill) && (!marriage.includes(minion.name))){
              marriage.push(minion.name);
              showSkillWord(m, "红娘");
              showSkillWord(minion, "结婚(" + marriage.length + "/2)");
              refMinions();
            }
          }
          if (minion.level%5 == 0 && minion.description.includes("🐷") && m.learnedSkills.includes("双猪的羁绊")){
            raiseAtk(minion,Math.floor(Math.pow(m.level,1.1)),true);
            showSkillWord(m, "双猪的羁绊");
          }
        }
        if (!noskill){
          for (let s of minion.skills){
            if (minion.level == s.level && !minion.learnedSkills.includes(s.name)){
              minion.learnedSkills.push(s.name);
              if (s.name == "说书"){
                minion.attackSpeed -= 400;
                clearInterval(minion.intervalId)
                let intervalId = setInterval(() => minionAttack(minion), minion.attackSpeed);
                minion.intervalId = intervalId;
              }
              if (s.name == "不稳定的传送门"){
                freeReroll += 3;
              }
              if (s.name == "马纳利亚时刻"){
                refreshCangSkill();
              }
              if (s.name == ("太上皇")){
                let filteredMinions = unlockedMinions.filter(mi =>
                    !lostTeam.includes(mi) && mi !== minion.name
                );
                let r = Math.floor(Math.random()*(filteredMinions.length - 1));
                let rname = filteredMinions[r];
                let n = unlockedMinions.indexOf(rname);
                lostTeam.push(rname);
                showSkillWord(minion, "太上皇招募："+rname);
                if (lostTeam.length > Math.floor(Math.pow(unlockedMinions.length,0.5))){
                  lostTeam = [];
                  showSkillWord(minion, "解散！");
                }
              }
            }
          }
        }

        if (minion.learnedSkills.includes("鲁智深") && (minion.level==5 || minion.level%25 == 0)){
          raiseAtk(minion,40*minion.level);
          if (minion.level == 5){raiseAtk(minion,40*minion.level,true)}
        }
        if (minion.learnedSkills.includes("小说家")){
          coolAnim = true;
        }
        if (minion.learnedSkills.includes("阴阳秘法") && (minion.level==6 || minion.level%36 == 0)){
          for (let m of minionsState){
            raiseAtk(m,3*minion.level,true);
          }
          if (minion.level == 6){
            for (let m of minionsState){
              raiseAtk(m,3*minion.level,true);
            }
          }
        }
        if (minion.learnedSkills.includes("虫虫咬他")){
          showSkillWord(minion, "虫虫咬他");
          minion.addattack += 1;
        }

        if (minion.learnedSkills.includes("双猪齐力")){
          let unlockedPigs = 0;
          for (let m of minionsState){
            if (m.description.includes("🐷")){
              unlockedPigs++;
            }
          }
          if (unlockedPigs > 1 && checkLuck(0.5)) {
            skilled = true;
            let r = Math.floor(Math.random()*(unlockedPigs - 1)) + 1;
            for (let m of minionsState){
              if (m.description.includes("🐷") && m.name != minion.name){
                r -= 1;
                if (r == 0){
                  upgradeMinion(unlockedMinions.indexOf(m.name),undefined,true);
                }
              }
            }
            showSkillWord(minion, "双猪齐力");
          }
        }
        if (minion.learnedSkills.includes("闹系列") && isPrime(minion.level)){
          addBuff("nao",1,8,false)
          showSkillWord(minion, "闹系列");
        }

        for (let m of minionsState){
          if (m.name != minion.name && m.learnedSkills.includes("光速上分")){
            if (checkLuck(0.1)){
              gainCoin(Math.floor(upgradeCost * Math.min(1,0.3 + 0.01*Math.floor(m.level/10))));
              showSkillWord(m, "光速上分");
            }
          }

          if (m.name != minion.name && m.learnedSkills.includes("日一皇")){
            let tlv = 0;
            for (let mi of minionsState){
              tlv += mi.level;
            }
            if (tlv%100 == 0){
              for (let mi of minionsState){
                raiseAtk(mi,tlv/5,true);
              }
              showSkillWord(m, "日一皇");
            }
          }
          if (m.learnedSkills.includes("卓绝的契约") && !noskill && minion.level == 2 && unlockedMinions.length >= 7 && daZhaiQiYue==false){
            minion.attack += m.attack;
            minion.attackSpeed = Math.floor(0.8*minion.attackSpeed);
            minion.addattack = Math.pow(minion.addattack,2);
            daZhaiQiYue = minion.name;
            showSkillWord(m, "卓绝的契约");
          }
        }

        document.getElementById(`level-${index}`).textContent = minion.level;
        document.getElementById(`attack-${index}`).textContent = formatNumber(minion.attack);
        document.getElementById(`attack-speed-${index}`).textContent = (minion.attackSpeed / 1000).toFixed(1)+"s";
        document.getElementById(`cost-${index}`).textContent = "升级 ("+formatNumber(mupgradeCost(minion))+")";
        if (!auto){
          updateDisplays();
          showMinionDetails(index);
        }
        if (minion.level == 2){
          refMinions();
        }
        upgrading = false;
        return true;
    } else {
      upgrading = false;
      if (auto){
        return false;
      }
      const mi = document.getElementById(`cost-${index}`);
      var position = mi.getBoundingClientRect();
      let x = position.left + (0.5*position.width);
      let y = position.top + (0.5*position.height);
      showWord(x,y, "金币不足！");
      return false;
    }
}

const originalClearInterval = window.clearInterval;

// 重写 clearInterval 函数
window.clearInterval = function(intervalId) {
    if (intervalId !== gloablintervalID) {
        originalClearInterval(intervalId);
    } else {
        console.log("Attempted to clear interval with ID global , which is not allowed.");
    }
};

// Update game state every second
let gloablintervalID = setInterval(() => {
    timePlayed += 1;
    let t = timePlayed + totaltimePlayed;
    if (t > 0 && t%60 == 0 && !victory){
      saveGame(true);
    }
    if (victory && timePlayed == 30){
      phaseUpGame()
    }
    kmrquickHit = 0;
    updateCounts();
    updateDisplays();
}, 1000);

// Get the modal
const modal = document.getElementById("helpModal");

// Get the button that opens the modal
const helpButton = document.getElementById("helpButton");

// Get the <span> element that closes the modal
const closeSpan = document.getElementsByClassName("close")[0];

document.getElementById('bondsButton').onclick = toggleBondsModal;

function toggleBondsModal() {
   const modal = document.getElementById('bondsModal');
   modal.style.display = modal.style.display === 'none' ? 'block' : 'none';
   if (modal.style.display === 'block') {
       updateBondsList();
   }
}

function drawBond(times) {
   if (ethers < times) {
       const mi = document.getElementById(`draw-`+times);
       var position = mi.getBoundingClientRect();
       let x = position.left + (0.5*position.width);
       let y = position.top + (0.5*position.height);
       showWord(x,y, "以太不足！");
       return;
   }
   ethers -= times;

   for (let i = 0; i < times; i++) {
       const rarity = getRandomRarity();
       const bond = getRandomBond(rarity);
       showDrawEffect(bond);
       if (!obtainedBonds[bond.name]) {
           obtainedBonds[bond.name] = {level:0, require: 1, have: 0};
       }
       obtainedBonds[bond.name].have += 1;
       if (obtainedBonds[bond.name].have >= obtainedBonds[bond.name].require){
         obtainedBonds[bond.name].level += 1;
         obtainedBonds[bond.name].require += obtainedBonds[bond.name].level + 1;
         if (obtainedBonds[bond.name].level == 20){
           obtainedBonds[bond.name].require = Math.Infinity;
         }
       }
   }

       // 获取所有羁绊名称
    const bondNames = Object.keys(obtainedBonds);

    // 定义稀有度顺序
    const rarityOrder = ['rainbow', 'gold', 'silver', 'bronze'];

    // 根据稀有度排序羁绊
    bondNames.sort((bondName1, bondName2) => {
        const rarity1 = bondData.find(bond => bond.name === bondName1).rarity;
        const rarity2 = bondData.find(bond => bond.name === bondName2).rarity;

        return rarityOrder.indexOf(rarity1) - rarityOrder.indexOf(rarity2);
    });

    // 根据排序后的羁绊名称更新 obtainedBonds
    const sortedObtainedBonds = {};
    bondNames.forEach(bondName => {
        sortedObtainedBonds[bondName] = obtainedBonds[bondName];
    });

    // 更新 obtainedBonds 为排序后的结果
    obtainedBonds = sortedObtainedBonds;
   updateBondsList();
}

function showDrawEffect(bond) {
    let effectClass;

    switch (bond.rarity) {
        case 'bronze':
            effectClass = 'bronze-effect'; // Bronze rarity animation
            break;
        case 'silver':
            effectClass = 'silver-effect'; // Silver rarity animation
            break;
        case 'gold':
            effectClass = 'goldy-effect'; // Gold rarity animation
            break;
        case 'rainbow':
            effectClass = 'rainbow-effect'; // Rainbow rarity animation
            break;
        default:
            effectClass = 'bronze-effect'; // Default to bronze if unknown rarity
    }

    const x = (0.25 + 0.5 * Math.random()) * window.innerWidth;
    const y = (0.25 + 0.5 * Math.random()) * window.innerHeight;

    playDrawAnimation(x, y, effectClass, bond.name);
}

function playDrawAnimation(x, y, effectClass, bondName) {
    const animationElement = document.createElement('div');
    animationElement.className = effectClass;
    animationElement.style.left = `${x}px`;
    animationElement.style.top = `${y}px`;
    animationElement.textContent = bondName; // Display bond name within the animation

    document.body.appendChild(animationElement);

    setTimeout(() => {
        animationElement.remove();
    }, 2000); // Adjust animation duration as needed
}

function getRandomRarity() {
   const rand = Math.random();
   if (rand < 0.5) return 'bronze';
   if (rand < 0.8) return 'silver';
   if (rand < 0.95) return 'gold';
   return 'rainbow';
}

function getRandomBond(rarity) {
   const bonds = bondData.filter(b => b.rarity === rarity);
   const bond = bonds[Math.floor(Math.random() * bonds.length)];
   return bond;
}

function updateBondsList() {
    const bondsList = document.getElementById('bondsList');
    bondsList.innerHTML = '';

    Object.keys(obtainedBonds).forEach(bondName => {
        let bond = bondData.filter(m => m.name == bondName)[0];
        let bondInfo = obtainedBonds[bondName];
        const bondItem = document.createElement('div');
        bondItem.className = `bond-item bond-rarity-${bond.rarity}`;

        // 修改部分开始
        const bondContainer = document.createElement('div');
        bondContainer.className = 'bond-container';

        const bondCharacters = document.createElement('div');
        bondCharacters.className = 'bond-characters';

        bond.characters.forEach(characterName => {
            const character = minions.find(m => m.name === characterName);
            const bondCharacter = document.createElement('div');
            bondCharacter.className = `bond-character ${obtainedBonds[bond.name] && unlockedMinions.includes(characterName) ? 'unlocked' : 'locked'}`;
            bondCharacter.innerHTML = `<div>${character.name}</div><img src="${character.image}" alt="${character.name}">`;
            bondCharacters.appendChild(bondCharacter);
        });

        const bondInfoContainer = document.createElement('div');
        bondInfoContainer.className = 'bond-info-container';

        const bondHeader = document.createElement('div');
        bondHeader.className = 'bond-header';

        const bondNameD = document.createElement('div');
        bondNameD.className = 'bond-name';
        bondNameD.textContent = `${bond.name} 等级 ${bondInfo.level} (${bondInfo.have}/${bondInfo.require})`;
        bondHeader.appendChild(bondNameD);

        const bondBenefit = document.createElement('div');
        bondBenefit.className = 'bond-benefit';
        bondBenefit.textContent = '收益: ' + bond.benefit;

        bondInfoContainer.appendChild(bondHeader);
        bondInfoContainer.appendChild(bondBenefit);

        bondContainer.appendChild(bondCharacters);
        bondContainer.appendChild(bondInfoContainer);
        // 修改部分结束

        bondItem.appendChild(bondContainer);
        bondsList.appendChild(bondItem);
    });

}
// When the user clicks the button, open the modal and pause the game
helpButton.onclick = function() {
    modal.style.display = "block";
    //pauseGame();
}

// When the user clicks on <span> (x), close the modal and continue the game
closeSpan.onclick = function() {
    modal.style.display = "none";
    //continueGame();
}

// When the user clicks anywhere outside of the modal, close it and continue the game
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        continueGame();
    }
}

kmr.addEventListener('click', clickKmr);
refMinions();
updateDisplays();
loadGame();
