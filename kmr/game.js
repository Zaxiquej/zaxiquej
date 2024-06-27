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

let version = "3.0.3";
let kmrHealthValue = new Decimal('500000');
let level = 0;
let coins = new Decimal('0');
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
let yggdam = new Decimal('322');
let upgrading = false;
let xxjjj = 0;
let curjjj = 0;
let xxBuff = false;
let zheluck = 3;
let zheluck2 = 3;
let zhedam = new Decimal('2600');
let maxdamZ =  new Decimal('0');
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
let ynAttackCount = 0;
let xuyuTarget = 0;
let completedBonds = [];
let weakauto = false;

let canAutoUpgrade = false;

function toggleAutoUpgrade() {
    canAutoUpgrade = !canAutoUpgrade;
    checkAutoUpgradeButton()
}

function checkAutoUpgradeButton(){
  const button = document.getElementById('autoUpgradeButton');
  if (canAutoUpgrade) {
      button.textContent = '自动升级：ON';
      button.classList.add('on');
  } else {
      button.textContent = '自动升级：OFF';
      button.classList.remove('on');
  }
}
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
      obtainedBonds,
      ynAttackCount,
      completedBonds,
      canAutoUpgrade
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
  if (gameState.version != undefined) version = gameState.version;
  if (gameState.kmrHealthValue != undefined) kmrHealthValue = new Decimal(gameState.kmrHealthValue);
  if (gameState.level != undefined) level = gameState.level;
  if (gameState.coins != undefined) coins = new Decimal(gameState.coins);
  if (gameState.dps != undefined) dps = gameState.dps;
  if (gameState.timePlayed != undefined) timePlayed = gameState.timePlayed;
  if (gameState.totalClickDamage != undefined) totalClickDamage = gameState.totalClickDamage;
  if (gameState.rindex != undefined) rindex = gameState.rindex;
  if (gameState.minionsState != undefined) minionsState = gameState.minionsState;
  if (gameState.unlockedMinions != undefined) unlockedMinions = gameState.unlockedMinions;
  if (gameState.totaltimePlayed != undefined) totaltimePlayed = gameState.totaltimePlayed;
  if (gameState.burning != undefined) burning = gameState.burning;
  if (gameState.skilled != undefined) skilled = gameState.skilled;
  if (gameState.zenxLV != undefined) zenxLV = gameState.zenxLV;
  if (gameState.zenxActive != undefined) zenxActive = gameState.zenxActive;
  if (gameState.autoing != undefined) autoing = gameState.autoing;
  if (gameState.remluck != undefined) remluck = gameState.remluck;
  if (gameState.buffs != undefined) buffs = gameState.buffs;
  if (gameState.reroll != undefined) reroll = gameState.reroll;
  if (gameState.freeReroll != undefined) freeReroll = gameState.freeReroll;
  if (gameState.freeUp != undefined) freeUp = gameState.freeUp;
  if (gameState.yggdam != undefined) yggdam = new Decimal(gameState.yggdam);
  if (gameState.upgrading != undefined) upgrading = gameState.upgrading;
  if (gameState.xxjjj != undefined) xxjjj = gameState.xxjjj;
  if (gameState.curjjj != undefined) curjjj = gameState.curjjj;
  if (gameState.xxBuff != undefined) xxBuff = gameState.xxBuff;
  if (gameState.zheluck != undefined) zheluck = gameState.zheluck;
  if (gameState.zheluck2 != undefined) zheluck2 = gameState.zheluck2;
  if (gameState.zhedam != undefined) zhedam = new Decimal(gameState.zhedam);
  if (gameState.maxdamZ != undefined) maxdamZ = new Decimal(gameState.maxdamZ);
  if (gameState.daZhaiQiYue != undefined) daZhaiQiYue = gameState.daZhaiQiYue;
  if (gameState.chongMing != undefined) chongMing = gameState.chongMing;
  if (gameState.cangSkill != undefined) cangSkill = gameState.cangSkill;
  if (gameState.lastBuffs != undefined) lastBuffs = gameState.lastBuffs;
  if (gameState.marriage != undefined) marriage = gameState.marriage;
  if (gameState.victory != undefined) victory = gameState.victory;
  if (gameState.kmrquickHit != undefined) kmrquickHit = gameState.kmrquickHit;
  if (gameState.coolAnim != undefined) victory = gameState.coolAnim;
  if (gameState.lostXYZ != undefined) lostXYZ = gameState.lostXYZ;
  if (gameState.lostTeam != undefined) lostTeam = gameState.lostTeam;
  if (gameState.ethers != undefined) ethers = gameState.ethers;
  if (gameState.totalEthers != undefined) totalEthers = gameState.totalEthers;
  if (gameState.obtainedBonds != undefined) obtainedBonds = gameState.obtainedBonds;
  if (gameState.ynAttackCount != undefined) ynAttackCount = gameState.ynAttackCount;
  if (gameState.canAutoUpgrade != undefined) canAutoUpgrade = gameState.canAutoUpgrade;
  if (Number(zheluck)!== zheluck) zheluck = 3;
  if (Number(zheluck2)!== zheluck2) zheluck2 = 3;
  refreshBondCompletion();
  checkAutoUpgradeButton();
  for (let m of minionsState){
    m.attack = new Decimal(m.attack);
    m.tempAtk = new Decimal(m.tempAtk);
    m.totalDamage = new Decimal(m.totalDamage);
    m.addattack = new Decimal(m.addattack);
  }
  for (let m of minionsState){
  	if (m.totalDamage.isNaN()){console.log(1); m.totalDamage = new Decimal(0)}
  }
  if (kmrHealthValue.isNaN()){
    kmrHealthValue = new Decimal('500000').times(new Decimal('10').pow(level))
  }
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
        for (let minion of minionsState){
          clearInterval(minion.intervalId)
        }
        victoryMessage.classList.add('hidden');
        loadGameState(encodedGameState);
        const detailsContainer = document.getElementById('selected-minion-details');
        detailsContainer.innerHTML = '';
        victory = false;
        checkVictory();
        updateSkills();
        autoing = false;
    };
    reader.readAsText(file);
    refreshMinionDetails()
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
  version = "3.0.3";
  kmrHealthValue = new Decimal('500000');
  level = 0;
  coins = new Decimal('0');
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
  yggdam = new Decimal('322');
  upgrading = false;
  xxjjj = 0;
  curjjj = 0;
  xxBuff = false;
  zheluck = 3;
  zheluck2 = 3;
  zhedam = new Decimal('2600');
  maxdamZ = new Decimal('0');
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
  ynAttackCount = 0;
  completedBonds = [];
  canAutoUpgrade = false;
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
  let amount = level - 5;
  let prod = 1;
  for (let bond of bondData){
    if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.moreEther){
      prod *= 1 + bond.moreEther * obtainedBonds[bond.name].level;
    }
  }
  amount = Math.floor(amount * prod);
  return amount;
}

function prestigeGainEther(){
  let amount = gainEtherAmount();
  ethers += amount;
  totalEthers += amount;
}

function gainEther(amount){
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
      prestigeGainEther();
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
  let ref = false;
  for (let i = buffs.length - 1; i >= 0; i--) {
    buffs[i][2]--; // 减少length
    if (buffs[i][2] <= 0) {
      if (["xuyu"].includes(buffs[i][0])){
        ref = true;
      }
      buffs.splice(i, 1); // 删除length为0的项目
    }
  }
  if (ref){
    refMinions()
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

function unlockMinion(minion, temp) {
  unlockedMinions.push(minion.name);
  minion = {
    ...minion,
    level: 1,
    attack: new Decimal(minion.baseattack),
    tempAtk: new Decimal(0),
    reroll: 2,
    totalDamage: new Decimal(0),
    learnedSkills: [],
  }
  minion.addattack = new Decimal(minion.addattack);

  let intervalId = setInterval(() => minionAttack(minion), minion.attackSpeed);
  minion.intervalId = intervalId;
  minionsState = minionsState.concat(minion);
  minion.reroll = temp - 1;
  refreshBondCompletion();
  refMinions();

  for (let m of minionsState) {
    if (m.learnedSkills.includes("中速导师")) {
      autoing = true;
      for (let i = 1; i < Math.floor(m.level / 2); i++) {
        upgradeMinion(minionsState.indexOf(minion), undefined, true, true);
      }
      autoing = false;
      minion.level = 1;
      refMinions();
      refreshMinionDetails()
      showSkillWord(m, "中速导师");
    }
    if (m.learnedSkills.includes("知名皇黑")) {
      addBuff("huanghei", 60, 30, false);
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
  if (autoing) {
    return;
  }

  const damageEffect = document.createElement('div');
  const damageValue = new Decimal(damage);

  if (damageValue.comparedTo(0) > 0) {
    damageEffect.className = 'damage-effect';
    damageEffect.innerText = `-${damageValue.toString()}`;
  } else {
    damageEffect.className = 'heal-effect';
    damageEffect.innerText = `${damageValue.negated().toString()}`;
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

const wordEffectsCount = {}; // Object to keep track of wordEffect counts for each minion

function showSkillWord(minion, word) {
  if (autoing && !weakauto) {
    return;
  }

  let im = document.getElementById(`image-${unlockedMinions.indexOf(minion.name)}`);
  if (!im) {
    return;
  }

  // Initialize the wordEffectsCount for this minion if it doesn't exist
  if (!wordEffectsCount[minion.name]) {
    wordEffectsCount[minion.name] = 0;
  }

  // Check if the number of word effects exceeds the limit
  if (wordEffectsCount[minion.name] >= 10) {
    return;
  }

  var position = im.getBoundingClientRect();
  let x = position.left + (Math.random() * position.width);
  let y = position.top + (Math.random() * position.height);
  const wordEffect = document.createElement('div');
  wordEffect.className = 'word-effect';
  wordEffect.innerText = `${word}`;
  wordEffect.style.left = `${x - 10}px`;
  wordEffect.style.top = `${y - 20}px`;

  if (coolAnim) {
    let rand = Math.random();
    if (rand < 0.5) {
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
  wordEffectsCount[minion.name]++; // Increment the count

  setTimeout(() => {
    wordEffect.remove();
    wordEffectsCount[minion.name]--; // Decrement the count when the effect is removed
  }, 1000);
}

function updateHealth(health) {
    const healthElement = document.getElementById('kmr-health');
    const maxHealth = new Decimal('500000').times(Decimal(10).pow(level));
    kmrHealthValue = new Decimal(kmrHealthValue).toDecimalPlaces(0) ; // 确保 kmrHealthValue 为整数
    const healthPercentage = kmrHealthValue.dividedBy(maxHealth).times(100);
    healthElement.style.width = healthPercentage.toFixed(2) + '%';
    healthElement.textContent = formatNumber2(health);
}

function updateDisplays() {
  if (autoing){
    return;
  }
    kmrHealth.textContent = formatNumber2(kmrHealthValue);
    coinsDisplay.textContent = formatNumber(coins);
    ethersDisplay.textContent = ethers + "("+ totalEthers+")";
    document.getElementById('phase-level').textContent = level;
    timePlayedDisplay.textContent = `${timePlayed}s`;
    totalClickDamageDisplay.textContent = totalClickDamage;
    minionDamagesDisplay.innerHTML = `
        ${[...minionsState] // 创建 minionsState 的副本
            .sort((a, b) => b.totalDamage.comparedTo(a.totalDamage)) // 按 totalDamage 从大到小排序
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

function gainCoin(c,minion){
  let runnerUpPlus = [0,0];
  for (let bond of bondData) {
      if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.runnerUpPlus) {
          runnerUpPlus[0] = bond.runnerUpPlus[0]*obtainedBonds[bond.name].level;
          runnerUpPlus[0] = bond.runnerUpPlus[1]*obtainedBonds[bond.name].level;
      }
  }
  if (runnerUpPlus[0] > 0){
    let sortedMs = [...minionsState].sort((a, b) => b.totalDamage.comparedTo(a.totalDamage))
    let rank = 2;
    while (sortedMs.length < rank){
      if (minion.name == sortedMs[rank-1].name){
        if (rank == 2){
          c = c.times(runnerUpPlus[1]);
        } else {
          c = c.times(runnerUpPlus[0]);
        }
      }
      rank *= 2;
    }
  }
  if (getBuffPower("ykd").length > 0){
    let buffPower = new Decimal(getBuffPower("ykd")[0]);
    c = c.times(buffPower).toDecimalPlaces(0) .toNumber();
  }
  coins = coins.plus(c);
}

function clickKmr() {
    burning = 0;
    let dam = new Decimal(1); // 使用 Decimal 初始化伤害值
    dam = dam.times(etherPlusDam()); // 计算增加的伤害值
    dam = dam.toDecimalPlaces(0); // 将 Decimal 转换为整数值
    kmrTakeDam(dam); // 将 Decimal 转换为普通数值后应用伤害
    victory = false;
    totalClickDamage = totalClickDamage + dam.toNumber(); // 使用 Decimal 累加总点击伤害

    var position = kmr.getBoundingClientRect();
    let x = position.left + (Math.random() * kmr.width);
    let y = position.top + (Math.random() * kmr.height);
    showEffect(x, y, 'hit-effect');
    showDamage(x, y, dam.toNumber()); // 将 Decimal 转换为普通数值后显示伤害

    const hitSound = new Audio('kmr/hit.ogg');
    hitSound.play();

    gainCoin(dam); // 将 Decimal 转换为普通数值后增加金币

    kmrquickHit += 1;
    for (let m of minionsState) {
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

function kmrTakeDam(dam) {
    dam = new Decimal(dam);
    if (getBuffPower("huanghei").length > 0) {
        let huanghei = getBuffPower("huanghei")[0];
        dam = dam.times(1 + huanghei * 0.01).toDecimalPlaces(0); // 使用 Decimal 处理增益效果
    }

    for (let m of minionsState) {
        if (m.learnedSkills.includes("素材奖励")) {
            let maxHealth = new Decimal('500000').times(Decimal(10).pow(level)); // 使用 Decimal 处理最大生命值
            let twoThirdsMaxHealth = maxHealth.times(2).dividedBy(3).toDecimalPlaces(0);
            let oneThirdMaxHealth = maxHealth.dividedBy(3).toDecimalPlaces(0);

            if (kmrHealthValue.comparedTo(twoThirdsMaxHealth) >= 0 && kmrHealthValue.minus(dam).comparedTo(twoThirdsMaxHealth) <= 0) {
                refreshCangSkill();
            }
            if (kmrHealthValue.comparedTo(oneThirdMaxHealth) >= 0 && kmrHealthValue.minus(dam).comparedTo(oneThirdMaxHealth) <= 0) {
                refreshCangSkill();
            }
        }
    }

    kmrHealthValue = kmrHealthValue.minus(dam); // 使用 Decimal 处理减法

    if (dam.comparedTo(maxdamZ) > 0) {
        maxdamZ = dam;
    }
}

function damageKmr(dam, minion) {
    if (kmrHealthValue.comparedTo(0) <= 0) return;

    // 处理护国神橙技能
    for (let m of minionsState) {
        if (m.learnedSkills.includes("护国神橙")) {
            dam = dam.times(1 + 0.2 + 0.01 * Math.floor(Math.pow(m.level, 0.6)));
        }
    }

    // 计算额外伤害比例
    dam = dam.times(extraDamRatio(minion)).toDecimalPlaces(0);

    // 扣除伤害
    kmrTakeDam(dam);

    // 处理其他技能效果
    for (let m of minionsState) {
        if (m.learnedSkills.includes("大地之子")) {
            if (checkLuck(0.01)) {
                skilled = true;
                addBuff("earth", 0.01, 5, true);
                showSkillWord(minion, "大地之子");
            }
        }
        if (m.learnedSkills.includes("比武招亲")) {
            if (checkLuck(0.05)) {
                let bonusDamage = m.attack.times(0.02).times(Math.sqrt(timePlayed + totaltimePlayed)).toDecimalPlaces(0);
                damageKmr(bonusDamage, m);
                showSkillWord(m, "比武招亲");
            }
        }
        if (m.learnedSkills.includes("雷维翁之力")) {
            let raiseAmount = dam.div(dam.fifthrt()).times(0.002).toDecimalPlaces(0);
            raiseAtk(minion, raiseAmount);
            showSkillWord(minion, "雷维翁之力");
        }
    }

    // 更新总伤害记录
    minion.totalDamage = minion.totalDamage.plus(dam);

    // 显示伤害效果
    var position = kmr.getBoundingClientRect();
    let x = position.left + (Math.random() * kmr.width);
    let y = position.top + (Math.random() * kmr.height);
    showEffect(x, y, 'hit-effect');
    showDamage(x, y, dam);

    // 播放声音
    if (Math.random() < 0.1) {
        const hitSound = new Audio(minion.voice);
        hitSound.play();
    }

    // 获得金币
    gainCoin(dam,minion);

    // 更新显示
    updateDisplays();

    // 检查游戏胜利条件
    checkVictory();
}

function formatNumberSmall(num) {
    if (!num.isFinite()) {
        return num.toString();
    }

    const units = ['万', '亿', '兆', '京', '垓', '秭', '穰', '沟', '涧', '正', '载', '极', '恒河沙', '阿僧祗', '那由他', '不可思议', '无量', '大数'];
    const threshold = 10000; // 万的阈值

    if (num.comparedTo(threshold) < 0) {
        return num.toString(); // 小于万，直接返回数字的字符串形式
    }

    let unitIndex = 0;
    let formattedNum = num;

    while (formattedNum>=threshold && unitIndex < units.length) {
        formattedNum = formattedNum/(threshold);
        unitIndex++;
    }

    unitIndex--; // 因为上一个循环多执行了一次

    if (unitIndex < units.length) {
        return `${formattedNum.toFixed(2)}${units[unitIndex]}`;
    } else {
        return num.toExponential(2); // 超过最大单位，使用科学计数法
    }
}

function formatNumber(num) {
    if (!num.isFinite()) {
        return num.toString();
    }

    const units = ['万', '亿', '兆', '京', '垓', '秭', '穰', '沟', '涧', '正', '载', '极', '恒河沙', '阿僧祗', '那由他', '不可思议', '无量', '大数'];
    const threshold = new Decimal(10000); // 万的阈值

    if (num.comparedTo(threshold) < 0) {
        return num.toString(); // 小于万，直接返回数字的字符串形式
    }

    let unitIndex = 0;
    let formattedNum = num;

    while (formattedNum.comparedTo(threshold) >= 0 && unitIndex < units.length) {
        formattedNum = formattedNum.dividedBy(threshold);
        unitIndex++;
    }

    unitIndex--; // 因为上一个循环多执行了一次

    if (unitIndex < units.length && formattedNum.comparedTo(threshold) <= 0) {
        return `${formattedNum.toFixed(2)}${units[unitIndex]}`;
    } else {
        return num.toExponential(2); // 超过最大单位，使用科学计数法
    }
}

function formatNumber2(num) {
    const units = ['','万', '亿', '兆', '京', '垓', '秭', '穰', '沟', '涧', '正', '载', '极', '恒河沙', '阿僧祗', '那由他', '不可思议', '无量', '大数'];
    const threshold = new Decimal(10000); // 万的阈值

    if (num < 10000) {
        return num.toString(); // 小于万，直接返回数字
    }

    let unitIndex = 0;
    let formattedNum = new Decimal(num);

    while (formattedNum.gte(threshold) && unitIndex < units.length) {
        formattedNum = formattedNum.div(threshold);
        unitIndex++;
    }

    if (unitIndex < units.length) {
        let result = [];
        for (let i = unitIndex; i >= 0; i--) {
            const unitValue = new Decimal(num).div(new Decimal(threshold).pow(i)).floor();
            if (unitValue.gt(0) || result.length > 0) { // 跳过高位的零
                if (result.length > 0){
                    let paddedUnitValue = unitValue.toFixed(0).padStart(4, '0');
                    result.push(`${paddedUnitValue}${units[i]}`);
                } else {
                    result.push(`${unitValue}${units[i]}`);
                }

                num -= unitValue.times(new Decimal(threshold).pow(i)).toNumber();
            }
        }

        return result.slice(0, 4).join(''); // 只取最大的3个单位
    } else {
        return new Decimal(num).toExponential(12); // 超过最大单位，使用科学计数法，保留12位小数
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
                .sort((a, b) => b.totalDamage.comparedTo(a.totalDamage)) // 按 totalDamage 从大到小排序
                .map(minion => `<li>${minion.name}: ${formatNumber(minion.totalDamage)}</li>`)
                .join('')}
        `;
        timePlayed = 0;

    }
}

function phaseUpGame() {
    victory = false;
    level = level + 1;
    document.getElementById('phase-level').textContent = level;
    kmrHealthValue = new Decimal('500000').times(new Decimal('10').pow(level)); // 更新血量使用 Decimal
    timePlayed = 0;
    if (level % 3 == 0){
      for (let bond of bondData){
        if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.threeGainEther){
          gainEther(bond.threeGainEther * obtainedBonds[bond.name].level);
        }
      }
    }

    victoryMessage.classList.add('hidden');
    updateDisplays();
    saveGame(true);

    // 检查并执行技能相关逻辑
    for (let m of minionsState) {
        if (m.learnedSkills.includes("马纳利亚时刻")) {
            refreshCangSkill();
        }
    }
}

function getattack(minion, master) {
    let atk = new Decimal(minion.attack);
    let extraDam = new Decimal(0);

    if (minion.learnedSkills.includes("鸭皇旋风斩！") && buffs.length > 0) {
        if (checkLuck(0.25)) {
            const maxAttackMinion = minionsState.reduce((max, m) => {
                return (m.attack.comparedTo(max.attack) > 0) ? m : max;
            }, { attack: new Decimal(-Infinity) });

            atk = atk.plus(maxAttackMinion.attack.times(0.1).times(buffs.length));
            showSkillWord(minion, "鸭皇旋风斩！");
        }
    }

    for (let m of minionsState) {
        if (m.name !== minion.name && m.learnedSkills.includes("苦痛")) {
            atk = atk.plus(m.attack.times(0.5));
        }
        if (m.learnedSkills.includes("祥瑞") && Math.abs(minionsState.indexOf(minion) - minionsState.indexOf(m))<=1 ){
          let low = Math.max(0, 0.5 - 0.01 * Math.floor(m.level/10));
          let high = Math.min(10,2 + 0.04 * Math.floor(m.level/10));
          let rd = Math.random()* (high - low) + low;
            atk = atk.times(rd);
        }
    }

    if (minion.learnedSkills.includes("素质家族")) {
        if (checkLuck(0.08)) {
            atk = atk.times(20);
            skilled = true;
            showSkillWord(minion, "素质家族");
        }
    }

    if (minion.learnedSkills.includes("乾坤一掷")) {
        if (checkLuck(zheluck*(0.01), 1)) {
            extraDam = extraDam.plus(zhedam);
            skilled = true;
            zheluck = 3;
            showSkillWord(minion, "乾坤一掷");

            if (checkLuck(zheluck2*(0.01), 2)) {
                zhedam = Decimal.max(zhedam,(Math.floor(maxdamZ.div(11))) );
                zheluck2 = 3;
                showSkillWord(minion, "伤害提升！");
            }
        }
    }
    if (minion.learnedSkills.includes("打个教先")){
       if (xxBuff && !master && minion.learnedSkills.includes("魔咒")){
         atk = atk.times(new Decimal(1).plus(Math.pow(xxjjj,2.5)));
         skilled = true;
         xxBuff = false;
       } else {
         let luck = Math.max(0.2, 0.7 - 0.01* Math.floor(minion.level/15));
         if (checkLuck(luck)) {
           atk = atk.times(Math.min(10,2 + 0.1*0.01* Math.floor(minion.level/15)));
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
    if (minion.learnedSkills.includes("皇室荣耀")) {
        if (checkLuck(0.1)) {
            atk = atk.plus(yggdam);
            skilled = true;
            showSkillWord(minion, "皇室荣耀");
        }
    }

    if (minion.learnedSkills.includes("复仇")) {
        const maxHealth = new Decimal('500000').times(new Decimal('10').pow(level)); // Decimal 处理最大血量
        const healthPercentage = kmrHealthValue.div(maxHealth).times(100);

        if (healthPercentage.comparedTo(50) <= 0) {
            atk = atk.times(new Decimal(1).plus(new Decimal(0.5).plus(new Decimal(0.01).times(Math.floor(new Decimal(minion.level).pow(0.75))))));
            showSkillWord(minion, "复仇");
        }
    }

    if (minion.learnedSkills.includes("掌控") && zenxActive) {
        zenxActive = false;
        atk = atk.times(new Decimal(8).plus(zenxLV * 4));
        zenxLV = zenxLV + 1;
        skilled = true;
    }

    if (minion.learnedSkills.includes("开播！")) {
        skilled = true;
        atk = atk.plus(new Decimal(Math.floor(Math.pow(Math.abs(coins), 0.66) / 1000 * minion.level)));
    }

    if (getBuffPower("idol").length > 0) {
        for (let i of getBuffPower("idol")) {
            atk = atk.times(i);
        }
    }
    if (getBuffPower("xuyu").length > 0){
      for (let i of getBuffPower("xuyu")) {
          if (unlockedMinions.indexOf(minion.name) == i[0]){
            atk = atk.times(i[1]);
          }
      }
    }

    if (getBuffPower("earth").length > 0) {
        let aa = 1;

        for (let i of getBuffPower("earth")) {
            aa = aa * (1 + i);
            plusBuffPower("earth", i, 0.01);
        }

        aa = Math.min(aa,1000);
        atk = atk.times(aa);
    }

    if (getBuffPower("ya").length > 0 && minion.learnedSkills.includes("弹幕机器人")) {
        let exbl = new Decimal(0);
        let exNum = 0;

        for (let i of getBuffPower("ya")) {
            if (checkLuck(0.25)) {
                exbl = exbl.plus(i);
                exNum += 1;
            }
        }

        atk = atk.times(new Decimal(1).plus(exbl));

        if (exNum > 0) {
            showSkillWord(minion, `弹幕指点*${exNum}`);
        }
    }

    if (getBuffPower("saki").length > 0 && minion.learnedSkills.includes("终轮常客")) {
        let exbl = new Decimal(0);
        let sp = [];

        for (let i = 0; i < getBuffPower("saki").length; i++) {
            exbl = exbl.plus(new Decimal(0.01).times(getBuffPower("saki")[i]));

            if (checkLuck(0.02)) {
                sp.push(getBuffPower("saki"));
            }
        }

        atk = atk.times(new Decimal(1).plus(exbl));

        for (let i = sp.length - 1; i >= 0; i--) {
            killBuff("saki", sp[i]);
            raiseAtk(minion, new Decimal(2).times(minion.attack.div(minion.attack.fifthrt().sqrt())));
            showSkillWord(minion, "必可活用于下一次……");
        }
    }

    // 沉底
    atk = atk.plus(extraDam);

    for (let m of minionsState) {
        if (minion.description.includes("🐷") && m.learnedSkills.includes("老实猪猪")) {
            atk = atk.times(1.2);
        }
    }

    atk = atk.toDecimalPlaces(0) ; // 取整数部分

    return atk;
}

function incrementRandomDigit(num) {
    let originalNum = Decimal.floor(num);

    // 判断原始数字的符号
    let isNegative = originalNum.isNegative();

    // 如果是负数，先转换为正数进行处理
    let absNum = originalNum.absoluteValue();

    // 计算位数
    let numDigits = absNum.toFixed().length;

    // 随机选择一位
    let randomIndex = Math.floor(Math.random() * numDigits);

    // 计算该位的值
    let factor = new Decimal(10).pow(randomIndex);
    let currentDigit = absNum.dividedBy(factor).toDecimalPlaces(0) .mod(10).toNumber();

    let result;
    if (randomIndex === numDigits - 1) {
        // 首位特殊处理
        result = absNum.plus(factor);
    } else {
        if (currentDigit === 9) {
            result = absNum.minus(new Decimal(9).times(factor)).plus(new Decimal(10).times(factor));
        } else {
            result = absNum.plus(factor);
        }
    }

    // 如果原数是负数，则结果也应为负数
    if (isNegative) {
        result = result.negated();
    }
    return result;
}

function checkLuck(r, fromZhe) {
    let re = new Decimal(0);
    let rand = new Decimal(Math.random());
    let pass = rand < r;

    if (r < 0.2 && remluck > 0) {
        remluck = remluck - 1;
        pass = rand < r*4;
    }

    if (fromZhe) {
        for (let minion of minionsState) {
            if (minion.learnedSkills.includes("终将降临的肃清")) {
                let luck = new Decimal(Math.min(1, 0.3 + 0.01 * Math.floor(minion.level / 50)));
                if (Math.random() < luck) {
                    pass = Math.random() < r;
                    if (!pass) {
                        if (fromZhe === 1) {
                            zheluck = zheluck + 0.3;
                        }
                        if (fromZhe === 2) {
                            zheluck2 = zheluck2 + 0.3;
                        }
                        r = r + 0.003
                        showSkillWord(minion, "终将降临的肃清");
                    }
                }
            }
        }
    }

    for (let m of minionsState) {
        if (m.learnedSkills.includes("重返赛场") && !pass && r < 0.2) {
            let luck = new Decimal(Math.min(0.5, 0.21 + 0.01 * Math.floor(m.level / 25)));
            if (Math.random() < luck) {
                showSkillWord(m, "重返赛场");
                pass = Math.random() < r;
                if (fromZhe && !pass) {
                    for (let minion of minionsState) {
                        if (minion.learnedSkills.includes("终将降临的肃清")) {
                            if (fromZhe === 1) {
                                zheluck = zheluck + 0.3;
                            }
                            if (fromZhe === 2) {
                                zheluck2 = zheluck2 + 0.3;
                            }
                            r = r + 0.003
                            showSkillWord(minion, "终将降临的肃清");
                        }
                    }
                }
            }
        }
    }

    if (pass) {
        for (let m of minionsState) {
            if (m.learnedSkills.includes("运气不如他们") && r < 0.2) {
                showSkillWord(m, "运气不如他们");
                raiseAtk(m,Decimal.floor(m.attack.div(m.attack.fifthrt().pow(2)).div(10) ));
            }
        }
        return true;
    } else {
        return false;
    }
}

function getDigit(num) {
    const absNum = new Decimal(Math.abs(num));
    const numDigits = absNum.dp() > 0 ? absNum.toDecimalPlaces(0).toFixed().length : absNum.toFixed().length;
    return numDigits;
}
function minionAttack(minion, master) {
    if (firstAnnounce) return;
    if (kmrHealthValue.comparedTo(0) <= 0) return; // 使用 Decimal 的 lte 方法比较

    skilled = false;
    let dam = getattack(minion, master); // 获取攻击力
    let gainC = dam;
    dam = dam.times(extraDamRatio(minion)); // 乘以额外伤害比例
    dam = dam.toDecimalPlaces(0); // 向下取整

    if (minion.learnedSkills.includes("下饭")) {
        if (checkLuck(0.1)) {
            gainC = dam.times(getDigit(minion.attack)); // gainC 根据攻击力和 getDigit 函数计算
            dam = dam.negated(); // dam 取负值
            showSkillWord(minion, "下饭");
            if (checkLuck(0.1)) {
                addBuff("ykd", 3, getDigit(minion.attack), false); // 添加 buff
                showSkillWord(minion, "进入下饭状态！");
            }
        }
    }

    kmrTakeDam(dam); // 执行伤害

    if (master) {
        master.totalDamage = master.totalDamage.plus(dam); // 累加总伤害
    } else {
        minion.totalDamage = minion.totalDamage.plus(dam); // 累加总伤害
    }
    var position = kmr.getBoundingClientRect();
    let x = position.left + (Math.random() * kmr.width);
    let y = position.top + (Math.random() * kmr.height);
    showEffect(x, y, 'hit-effect'); // 显示效果
    showDamage(x, y, dam); // 显示伤害

    if (Math.random() < 0.1) {
        const hitSound = new Audio(minion.voice);
        hitSound.play(); // 播放音效
    }
    if (master){
      gainCoin(gainC,master); // 获得金币
    } else {
      gainCoin(gainC,minion); // 获得金币
    }


    if (minion.learnedSkills.includes("冲击冠军")) {
        if (checkLuck(0.04)) {

            raiseAtk(minion, Decimal.floor( (minion.attack.fifthrt().pow(3)).times(minion.level).times(0.1)) ); // 升级攻击力
            skilled = true;
            showSkillWord(minion, "冲击冠军");
        }
    }
    if (minion.learnedSkills.includes("大梦仙尊")) {
        let luck = Decimal.min(0.02, 0.005 + 0.0005 * Decimal.max(0, getBaseLog(2, Math.abs(minion.attack)) - 10));
        if (checkLuck(luck)) {
            skilled = true;
            freeUp += 5;
            showSkillWord(minion, "大梦仙尊");
            refMinions();
        }
    }
    if (minion.learnedSkills.includes("+1+1")) {
        if (checkLuck(0.06)) {
            skilled = true;
            minion.attack = minion.attack.times(1.1).toDecimalPlaces(0) ; // 攻击力乘以1.1并向下取整
            minion.attackSpeed = Math.floor(minion.attackSpeed * 1.08); // 攻击速度乘以1.08并向下取整
            document.getElementById(`attack-${unlockedMinions.indexOf(minion.name)}`).textContent = formatNumber(minion.attack);
            document.getElementById(`attack-speed-${unlockedMinions.indexOf(minion.name)}`).textContent = (minion.attackSpeed/(1000)).toFixed(1) + "s"; // 更新攻击速度
            clearInterval(minion.intervalId);
            let intervalId = setInterval(() => minionAttack(minion), minion.attackSpeed);
            minion.intervalId = intervalId;
            showSkillWord(minion, "+1+1");
        }
    }
    if (minion.learnedSkills.includes("金牌陪练") && unlockedMinions.length > 1) {
        if (checkLuck(0.18)) {
            skilled = true;
            let r = Math.floor(Math.random() * (unlockedMinions.length - 1));
            if (r >= unlockedMinions.indexOf(minion.name)) {
                r += 1;
            }
            raiseAtk(minionsState[r], minion.attack.div(15).toDecimalPlaces(0) ); // 升级攻击力
            minionAttack(minionsState[r], minion);
            showSkillWord(minion, "金牌陪练");
        }
    }
    if (minion.learnedSkills.includes("黄油品鉴")) {
        if (checkLuck(0.1)) {
            let unlockedCD = 0;
            for (let m of minionsState) {
                if (m.count != undefined) {
                    unlockedCD++;
                }
            }
            skilled = true;
            let r = Math.floor(Math.random() * (unlockedCD - 1)) + 1;
            for (let m of minionsState) {
                if (m.count != undefined) {
                    r -= 1;
                    if (r == 0) {
                        m.count = m.count + (Math.min(8, 3 + Math.floor(minion.level/100)));
                    }
                }
            }
            showSkillWord(minion, "黄油品鉴");
        }
    }
    if (minion.learnedSkills.includes("奶1")) {
        if (checkLuck(0.33)) {
            skilled = true;
            gainCoin(new Decimal(minion.level).pow(2).toDecimalPlaces(0),minion); // 获得金币
            showSkillWord(minion, "奶1");
        }
    }
    if (minion.learnedSkills.includes("理解不行")) {
        let luck = Math.min(0.25, 0.05 + 0.01 * getDigit(minion.attack));
        for (let bond of bondData) {
            if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.skillPlus && bond.skillPlus[0] == '理解不行') {
                let c = bond.skillPlus[1];
                luck = luck+(loglevel(obtainedBonds[bond.name].level, c[0], c[1], [2]));
            }
        }
        if (checkLuck(luck)) {
            skilled = true;
            gainCoin(new Decimal(minion.level).pow(2).times(10).toDecimalPlaces(0),luck); // 获得金币
            minusLevel(minion, 1); // 减少等级
            showSkillWord(minion, "理解不行");
        }
    }
    if (minion.learnedSkills.includes("偶像")) {
        if (checkLuck(0.07)) {
            skilled = true;
            addBuff("idol", 1.2 + 0.02 * getDigit(dam), 10, true); // 添加 buff
            showSkillWord(minion, "偶像");
        }
    }

    if (minion.learnedSkills.includes("人偶使") && unlockedMinions.length > 1) {
        if (checkLuck(0.08)) {
            skilled = true;
            let t = 3 + getBuffPower("idol").length * 3;

            const filteredMinions = unlockedMinions.filter(m => !minionsState[unlockedMinions.indexOf(m)].learnedSkills.includes("人偶使"));

            for (let i = 0; i < t; i++) {
                if (filteredMinions.length === 0) break; // 如果没有可选的角色，提前退出循环
                let r = Math.floor(Math.random() * filteredMinions.length);
                minionAttack(minionsState[unlockedMinions.indexOf(filteredMinions[r])], minion);
            }
            showSkillWord(minion, "人偶使");
        }
    }

    for (let m of minionsState) {
        if (getBuffPower("nao").length > 0) {
            if (minion.description.includes("🐷") && m.learnedSkills.includes("闹系列")) {
                m.count = 999;
                showSkillWord(m, "闹系列发威！");
            }
        }
        if (m.name != minion.name && m.learnedSkills.includes("永失吾艾")) {
            if (checkLuck(0.08)) {
                minionAttack(m);
                showSkillWord(m, "永失吾艾");
            }
        }
        if (m.learnedSkills.includes("卡场绝杰")) {
            ynAttackCount += 1;
        }

        if (minion.description.includes("🐷") && m.learnedSkills.includes("身外化身")) {
          if (checkLuck(0.1)) {
            skilled = true;
            let r = Math.floor(Math.random() * (unlockedMinions.length - 1));
            if (r >= unlockedMinions.indexOf(minion.name)) {
                r += 1;
            }
            minionAttack(minionsState[r], minion);
            showSkillWord(minion, "身外化身");
        }
      }
      if (skilled && m.name != minion.name && m.learnedSkills.includes("GN")){
        if (checkLuck(0.1)) {
          raiseAtk(m, Decimal.floor(minion.attack.times(0.03)));
          for (let i = 0; i < 3; i++){
            minionAttack(m);
          }
          showSkillWord(m, "GN");
        }
      }
      if (m.name != minion.name && m.learnedSkills.includes("无尽连击")){
        m.attack = m.attack.plus(Decimal.floor(m.addattack.div(2)));
        m.tempAtk = m.tempAtk.plus(Decimal.floor(m.addattack.div(2)));
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
    minionsContainer.innerHTML = ''; // 清空现有的小怪物信息
    let minionsSubs = [];
    minionsState.forEach((minion, index) => {
        const minionElement = document.createElement('div');
        minionElement.className = 'minion';
        const colors = [];

        if (marriage.includes(minion.name)) {
            colors.push('pink');
        }

        if (lostTeam.includes(minion.name)) {
            colors.push('red');
        }

        for (let i of getBuffPower("xuyu")) {
            if (unlockedMinions.indexOf(minion.name) == i[0]){
              colors.push('blue');
              break;
            }
        }

        let nameStyle = '';
        if (colors.length > 1) {
            nameStyle = `style="background: linear-gradient(to right, ${colors.join(', ')}); -webkit-background-clip: text; color: transparent; font-weight: bold;"`;
        } else if (colors.length === 1) {
            nameStyle = `style="color: ${colors[0]}; font-weight: bold;"`;
        }

        minionElement.innerHTML = `
            <img id="image-${index}" src="${minion.image}" alt="${minion.name}">
            <div ${nameStyle}>${minion.name}</div>
            <div>等级: <span id="level-${index}">${minion.level}</span></div>
            <div>攻击: <span id="attack-${index}">${formatNumber(minion.attack)}</span></div>
            <div>攻速: <span id="attack-speed-${index}">${(minion.attackSpeed /1000).toFixed(1)}s</span></div>
            <button id="cost-${index}" onclick="upgradeMinionClick(${index})" >升级 (${formatNumber(mupgradeCost(minion))})</button>
        `;

        // 添加重抽按钮
        if (minion.reroll > 0 && unlockedMinions.length < minions.length) {
            minionElement.innerHTML += `<button id="reroll-${index}" onclick="rerollMinion(${index})" >重抽 (剩余${minion.reroll}次) (${formatNumber(rerollCost(unlockedMinions.length))})</button>`;
        }

        minionElement.addEventListener('click', () => {
            showMinionDetails(index);
        });
        minionsContainer.appendChild(minionElement);
    });

    document.getElementById(`unlockButton`).textContent = "抽取助战 (金币:" + formatNumber(unlockCost(unlockedMinions.length)) + ")";
}

function unlockCost(n) {
  if (minions.length === unlockedMinions.length) {
    return Decimal(Infinity);
  }

  let cost = Decimal(9).plus(10*n).plus(4*n*n).plus(Decimal(2.7).times(Decimal(n).pow(3.25)).plus(Decimal(2.75).pow(n)));
  cost = cost.times(Decimal(unlockedMinions.length + 1).sqrt()).toDecimalPlaces(0);

  if (unlockedMinions.length >= 10) {
    cost = cost.times(unlockedMinions.length - 8);
  }

  for (let m of minionsState) {
    if (m.learnedSkills.includes("小猪存钱罐")) {
      cost = cost.times(0.6).toDecimalPlaces(0);
    }
  }

  for (let bond of bondData) {
    if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.unlockMinusCost) {
      let c = bond.unlockMinusCost;
      let minrate = loglevel(obtainedBonds[bond.name].level, c[0], c[1], [2]);
      cost = cost.times(1 - minrate);
    }
  }

  return cost.toDecimalPlaces(0);
}

function rerollCost(n) {
  if (freeReroll > 0) {
    return Decimal(0);
  }

  return unlockCost(n - 1).div(2).toDecimalPlaces(0);
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

function rerollMinion(index) {
  if (kmrHealthValue <= 0) {
    return;
  }
  burning = 0; // Assuming burning is handled as a regular number

  const uCost = new Decimal(rerollCost(unlockedMinions.length));

  if (coins.comparedTo(uCost) >= 0) {
    coins = coins.minus(uCost);
    if (uCost.eq(0)) {
      freeReroll--;
    }
    let temp = minionsState[index].reroll;
    let r = Math.floor(Math.random() * (minions.length - unlockedMinions.length));
    let restMinions = minions.filter((m) => !unlockedMinions.includes(m.name));
    clearInterval(minionsState[index].intervalId);
    unlockedMinions.splice(index, 1);
    minionsState.splice(index, 1);
    unlockMinion(restMinions[r], temp);
    updateDisplays();
  } else {
    const mi = document.getElementById(`reroll-${index}`);
    var position = mi.getBoundingClientRect();
    let x = position.left + (0.5 * position.width);
    let y = position.top + (0.5 * position.height);
    showWord(x, y, "金币不足！");
  }
}

function unlockRandMinion() {
  if (kmrHealthValue <= 0) {
    return;
  }
  burning = 0;
  const uCost = new Decimal(unlockCost(unlockedMinions.length));
  if (coins.comparedTo(uCost) >= 0) {
    coins = coins.minus(uCost);
    let r = Math.floor(Math.random() * (minions.length - unlockedMinions.length));
    let restMinions = minions.filter((m) => !unlockedMinions.includes(m.name));
    let n = new Decimal(rerollTime()).plus(1);
    unlockMinion(restMinions[r], n);
    updateDisplays();
  } else {
    const mi = document.getElementById(`unlockButton`);
    var position = mi.getBoundingClientRect();
    let x = position.left + (0.5 * position.width);
    let y = position.top + (0.5 * position.height);
    showWord(x, y, "金币不足！");
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

  if (minion.level == 0) {
    code = "解锁";
  }

  const mCost = new Decimal(mupgradeCost(minion));

  detailsContainer.innerHTML = `
    <h3>${minion.name}</h3>
    <img src="${minion.image}" alt="${minion.name}">
    <p>${minion.description}</p>
    <div>等级: ${minion.level}</div>
    <div>攻击: ${formatNumber(minion.attack)}</div>
    <div>攻速: ${(minion.attackSpeed / 1000).toFixed(1)}s</div>
    <div>成长: ${formatNumber(minion.addattack)}</div>
    <button onclick="upgradeMinionClick(${rindex})">${code} (金币: ${formatNumber(mCost)})</button>
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
      return "每48s，使你下一次攻击不再判定前一技能，而是改为额外造成[本局游戏前一技能最高连续失败次数^2.5]倍的伤害。（目前最高连续失败次数为"+xxjjj+"）。";
    case "乾坤一掷":
      return "攻击后，有"+Math.floor(zheluck*100)/100+"%概率附加"+formatNumber(zhedam)+"点伤害；在此基础上，"+Math.floor(zheluck2*100)/100+"%概率将本技能的伤害转变为[kmr单次受到的最高伤害/11]点伤害。（不会低于原本伤害，目前最高单次伤害为"+formatNumber(maxdamZ)+");"
    case "卓绝的契约":
      if (daZhaiQiYue){
        return "每局游戏仅限一次，主动将一个助战升到2级时，如果你的助战数为7以上，使其攻击速度永久减少20%，升级时攻击力增加量变为原本的^2，并且攻击力永久增加[该助战的攻击力]的数值。（契约已签订——"+daZhaiQiYue+"）";
      } else {
        return "每局游戏仅限一次，主动将一个助战升到2级时，如果你的助战数为7以上，使其攻击速度永久减少20%，升级时攻击力增加量变为原本的^2，并且攻击力永久增加[该助战的攻击力]的数值。（契约尚未签订）";
      }
    case "虫法之王":
      return "每当一个倒计时技能触发后，使一个随机助战获得"+chongMing+"*[该助战攻击力^(0.4)]点攻击力。每次触发，使倍率+1。";
    case "马纳利亚时刻":
      return `该技能为一个随机其他技能，与其共享各种变量。进入新周目后，切换随机技能。<br>当前技能：<br><span style="font-size: smaller;">${cangSkill} - ${getdesc(cangSkill)}</span>`;
    case "红娘":
      if (marriage.length < 2){
        return skill.effect + "（尚未连结红线！）";
      } else {
        return skill.effect + "（已连结红线：["+marriage[0]+"]与["+marriage[1]+"]）";
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
    case "卡场绝杰":
      return skill.effect + "（目前攻击次数："+ynAttackCount+"）";
    case "南梁的祝福":
      return skill.effect + "（下一个目标："+minionsState[xuyuTarget].name+"）";
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
    if (m.learnedSkills.includes("马纳利亚时刻")) {

      for (let s of m.learnedSkills){
        if (!["马纳利亚时刻","素材奖励"].includes(s)){
          m.learnedSkills.splice(m.learnedSkills.indexOf(s), 1);
          break;
        }
      }

      let valid = false;
      let s;
      while (!valid) {
        let r = Math.floor(Math.random()*(minions.length - 1));
        if (r >= 33){ //仓仓是33
          r += 1;
        }
        s = minions[r].skills[Math.floor(Math.random() * 2)];
        valid = !(["说书","不稳定的传送门","卓绝的契约","红娘"].includes(s.name));
      }

      m.learnedSkills.push(s.name);
      if (m.tempAtk > 0){
        m.attack = Decimal(m.attack).minus(m.tempAtk);
        m.tempAtk = new Decimal(0);
      }
      cangSkill = s.name;
      showSkillWord(m, "马纳利亚时刻！");
      if (m.learnedSkills.includes("素材奖励")){
        for (let mi of minionsState){
          if (m.name != mi.name && mi.learnedSkills.includes(s.name)){
            raiseAtk(mi, Decimal(m.attack).times(0.2).toDecimalPlaces(0) );
            showSkillWord(m, "素材奖励");
          }
        }
      }
    }
  }
}

function zeroCountDown(c) {
  for (let m of minionsState) {
    if (m.learnedSkills.includes("死灵艺术")) {
      if (checkLuck(0.15)) {
        m.count = zeroCountDown(19);
        let dam = Decimal(m.attack).times(Math.sqrt(level + 1)).toDecimalPlaces(0);
        damageKmr(dam, m);
        showSkillWord(m, "死灵艺术");
      }
    }
    if (m.learnedSkills.includes("弹幕机器人")) {
      if (checkLuck(0.08)) {
        addBuff("ya", 3, 8, true);
        showSkillWord(m, "弹幕机器人");
      }
    }
    if (m.learnedSkills.includes("虫法之王")) {
      let r = Math.floor(Math.random() * (unlockedMinions.length));
      raiseAtk(minionsState[r], m.attack.fifthrt().pow(2).times(chongMing));
      chongMing = chongMing+1;
      showSkillWord(m, "虫法之王");
    }
    if (m.learnedSkills.includes("新春会")){
      if (checkLuck(0.05)){
        for (let mi of minionsState){
          if (mi.name != m.name){
            let amount = Decimal.max((m.addattack).div(24), new Decimal(1));
            raiseGrowth(mi, Decimal.floor(amount));
          }
        }
        showSkillWord(m, "新春会");
      }
    }
  }

  for (let m of minionsState) {
    if (m.learnedSkills.includes("电表白转")) {
      let luck = 0.15 + 0.01 * Math.min(25, Math.floor(m.level / 50));
      if (checkLuck(luck)) {
        return Math.floor(c / 2);
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
          for (let bond of bondData) {
            if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.skillPlus && bond.skillPlus[0] == '太上皇') { //
              let c = bond.skillPlus[1];
              let totalAtk = new Decimal(0);
              for (let miN of lostTeam){
                let n = unlockedMinions.indexOf(miN);
                totalAtk = totalAtk.plus(minionsState[n].attack);
              }
              totalAtk = totalAtk.div(totalAtk.fifthrt().sqrt());
              let am = Decimal.floor(totalAtk.times(c * obtainedBonds[bond.name].level));
              raiseAtk(m, am, false, false);
            }
          }
          lostTeam = [];
          showSkillWord(m, "解散！");
        }
      }
    }
  }

  return { X, Y, Z };
}

function completedBond(bond){
    return completedBonds.includes(bond);
}

function completedSingleBond(bond){
    for (let c of bond.characters){
      if (!unlockedMinions.includes(c)){
        return false;
      }
    }
    return true;
}

function refreshBondCompletion(){
    completedBonds = [];
    for (let bond of bondData){
      if (completedSingleBond(bond)){
        completedBonds.push(bond.name);
      }
    }
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
        amount = amount.plus(bond.upgradeExtraA * obtainedBonds[bond.name].level);
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
  if (new Decimal(kmrHealthValue).comparedTo(0) <= 0){ return; }
  let need = false;
  let ref = false;
  buffCountDown();
  for (let m of minionsState){
    if (m.learnedSkills.includes("五种打法")){
      burning++;
      if (burning >= 20){
        burning = zeroCountDown(20);
        raiseAtk(m, new Decimal(5).times(unlockedMinions.length).times(level+1));
        need = true;
        showSkillWord(m, "五种打法");
      }
    }
    if (m.learnedSkills.includes("操纵命运")){
      if (!m.count){ m.count = 0; }
      m.count++;
      if (m.count >= 35){
        m.count = zeroCountDown(35);
        let remluck = Math.min(12, 2 + Math.floor(m.level / 100));
        showSkillWord(m, "操纵命运");
        need = true;
      }
    }
    if (m.learnedSkills.includes("鼙鼓时间！")){
      if (!m.count){ m.count = 0; }
      m.count++;
      let time = Math.max(36, 48 - Math.floor(m.level / 100));
      if (m.count >= time){
        m.count = zeroCountDown(time);
        addBuff("pigu", 5, 6, false);
        showSkillWord(m, "鼙鼓时间！");
        need = true;
      }
    }
    if (m.learnedSkills.includes("南梁的祝福")){
      if (!m.count){ m.count = 0; }
      m.count++;
      let lasting = Math.min(30, 15 + Math.floor(m.level / 50));
      if (m.count >= 60){
        m.count = zeroCountDown(60);
        addBuff("xuyu", [xuyuTarget,4], lasting, false);
        xuyuTarget = (xuyuTarget + 1) % unlockedMinions.length;
        showSkillWord(m, "南梁的祝福");
        need = true;
      }
    }
    if (m.learnedSkills.includes("魔咒")){
      if (!m.count){ m.count = 0; }
      m.count++;
      if (m.count >= 48){
        m.count = zeroCountDown(48);
        xxBuff = true;
        showSkillWord(m, "魔咒");
        need = true;
      }
    }
    if (m.learnedSkills.includes("汲取兄弟")){
      if (!m.count){ m.count = 0; }
      m.count++;
      if (m.count >= 25){
        m.count = zeroCountDown(25);
        let unlockedPigs = 0;
        for (let mi of minionsState){
          if (mi.description.includes("🐷")){
            unlockedPigs++;
          }
        }
        let luck = 0.15;
        if (getBuffPower("nao") > 0){
          luck = 0.45;
        }
        if (unlockedPigs > 1 && checkLuck(luck)) {
          skilled = true;
          let r = Math.floor(Math.random() * (unlockedPigs - 1)) + 1;
          for (let mi of minionsState){
            if (mi.description.includes("🐷") && mi.name != m.name){
              r -= 1;
              if (r == 0){
                raiseAtk(m, Decimal.max(1, new Decimal(mi.attack).times(0.02)));
                minusLevel(mi, 3);
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
      if (!m.count){ m.count = 0; }
      m.count++;
      if (m.count >= 60){
        m.count = zeroCountDown(60);
        let r = Math.floor(Math.random() * (unlockedMinions.length - 1));
        if (r >= unlockedMinions.indexOf(m.name)){
          r += 1;
        }
        minusLevel(minionsState[r], Math.max(1,Math.floor(minionsState[r].level*0.01)));
        minusLevel(m, Math.max(1,Math.floor(m.level*0.01)));
        showSkillWord(m, "成熟!");
        ref = true;
        need = true;
      }
    }
    if (m.learnedSkills.includes("造谣")){
      if (!m.count){ m.count = 0; }
      m.count++;
      if (m.count >= 14){
        m.count = zeroCountDown(14);
        let times = 1 + Math.floor(m.level / 50);
        for (let t = 0; t < times; t++){
          let r = Math.floor(Math.random() * unlockedMinions.length);
          minionsState[r].attack = new Decimal(incrementRandomDigit(minionsState[r].attack));
        }
        showSkillWord(m, "造谣");
        ref = true;
        need = true;
      }
    }
    if (m.learnedSkills.includes("每日饼之诗")){
      if (!m.count){ m.count = 0; }
      m.count++;
      if (m.count >= 90){
        m.count = zeroCountDown(90);
        for (let mi of minionsState){
          if (mi.name != m.name){
            let amount = (m.attack).div(25);
            for (let bond of bondData){
              if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.skillPlus && bond.skillPlus[0] == '每日饼之诗'){
                let c = bond.skillPlus[1] * obtainedBonds[bond.name].level;
                amount = amount.times(1 + c);
              }
            }
            raiseAtk(mi, Decimal.floor(amount));
          }
        }
        showSkillWord(m, "每日饼之诗");
        need = true;
      }
    }
    if (m.learnedSkills.includes("炎孕恐怖分子")){
      if (!m.count){ m.count = 0; }
      m.count++;
      if (m.count >= 28){
        m.count = zeroCountDown(28);
        for (let mi of minionsState){
          if (mi.name != m.name){
            let amount = mi.addattack;
            raiseAtk(mi, Decimal.floor(amount));
          }
        }
        showSkillWord(m, "炎孕恐怖分子");
        need = true;
      }
    }
    if (m.learnedSkills.includes("硬实力冠军")){
      if (!m.count){ m.count = 0; }
      m.count++;
      if (m.count >= 40){
        m.count = zeroCountDown(40);
        let addatk = [];
        for (let mi of minionsState){
          if (mi.name != m.name && new Decimal(mi.attack).comparedTo(m.attack) >= 0){
            addatk.push(new Decimal(mi.attack).minus(m.attack).pow(0.9).times(0.1).toDecimalPlaces(0) );
          }
        }
        for (let a of addatk){
          raiseAtk(m, a);
        }
        showSkillWord(m, "硬实力冠军");
        need = true;
      }
    }
    if (m.learnedSkills.includes("终轮常客")){
      if (!m.count){ m.count = 0; }
      m.count++;
      if (m.count >= 40){
        m.count = zeroCountDown(40);
        addBuff("saki", new Decimal(100).plus(new Decimal(m.level).sqrt()).toDecimalPlaces(0) , 20, false);
        showSkillWord(m, "终轮常客");
      }
    }
    if (m.learnedSkills.includes("记忆殿堂")){
      if (!m.count){ m.count = 0; }
      m.count++;
      if (m.count >= 72){
        m.count = zeroCountDown(72);
        for (let b of Object.keys(lastBuffs)){
          let binfo = lastBuffs[b];
          addBuff(b, binfo[0], binfo[1], binfo[2]);
        }
        showSkillWord(m, "记忆殿堂");
        need = true;
      }
    }
    if (m.learnedSkills.includes("法神的宣告")){
      if (!m.count){ m.count = 0; }
      m.count++;
      if (m.count >= 60){
        m.count = zeroCountDown(60);
        let prob = generateXYZ(unlockedMinions.length);
        damageKmr(new Decimal(prob.X).times(m.attack), m);
        let unlockedCD = 0;
        for (let mi of minionsState){
          if (mi.count !== undefined){
            unlockedCD++;
          }
        }
        for (let i = 0; i < prob.Y; i++){
          let r = Math.floor(Math.random() * unlockedCD);
          for (let mi of minionsState){
            if (m.name != mi.name && mi.count !== undefined){
              r--;
              if (r === 0){
                mi.count++;
              }
            }
          }
        }
        for (let i = 0; i < prob.Z; i++){
          let r = Math.floor(Math.random() * unlockedMinions.length);
          let kagaMulti = 1;
          let amount = new Decimal(chongMing).times(m.level).div(3);
          for (let bond of bondData){
            if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.skillPlus && bond.skillPlus[0] == '虫法之王'){
              let c = bond.skillPlus[1] * obtainedBonds[bond.name].level;
              kagaMulti *= 1 + c;
              chongMing += obtainedBonds[bond.name].level;
            }
          }
          if (minionsState[r].name === 'kaga'){
            amount = amount.times(kagaMulti);
          }
          raiseAtk(minionsState[r], amount.toDecimalPlaces(0) );
          chongMing++;
          showSkillWord(m, "虫法之王");
        }
        showSkillWord(m, `法神的宣告：X=${prob.X}, Y=${prob.Y}, Z=${prob.Z}`);
        need = true;
      }
    }
    if (m.learnedSkills.includes("行为艺术")){
      if (!m.count){ m.count = 0; }
      if (!m.maxCount){ m.maxCount = Math.floor(10 + 60 * Math.random()); }
      m.count++;
      if (m.count >= m.maxCount){
        m.maxCount = Math.floor(10 + 60 * Math.random());
        m.count = zeroCountDown(m.maxCount);
        let prob = generateXYZ(lostXYZ);
        for (let i = 0; i < prob.X; i++){
          minionAttack(m);
        }
        m.count += prob.Y;
        if (prob.Z > 0){
          addBuff("lost", 114, prob.Z, false);
        }
        if (prob.X === 0 || prob.Y === 0 || prob.Z === 0){
          lostXYZ++;
        }
        showSkillWord(m, `行为艺术：X=${prob.X}, Y=${prob.Y}, Z=${prob.Z}`);
        need = true;
      }
    }
    if (m.learnedSkills.includes("逆境被动")){
      if (!m.count){ m.count = 0; }
      m.count++;
      if (m.count >= 12){
        m.count = zeroCountDown(12);
        let rank = 0;
        for (let mi of minionsState) {
          if (mi.name !== m.name && mi.totalDamage.comparedTo(m.totalDamage)>=0) {
            rank++;
          }
        }
        let luck = 0.02 * rank;
        if (checkLuck(luck)){
          let atkp = 0;
          for (let mi of minionsState) {
            if (mi.name !== m.name && new Decimal(mi.attack).div(mi.attackSpeed).comparedTo(atkp) >= 0) {
              atkp = new Decimal(mi.attack).div(mi.attackSpeed).times(1000).div(10).toDecimalPlaces(0) ;
            }
          }
          raiseAtk(m, atkp);
          for (let i = 0; i < rank * 2; i++){
            minionAttack(m);
          }
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
           let amount = coins.div(10);
           for (let bond of bondData){
             if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.skillPlus && bond.skillPlus[0] == '罕见'){
               let c = bond.skillPlus[1] * obtainedBonds[bond.name].level;
               amount = amount.times(1 + c);
             }
           }
           amount = amount.toDecimalPlaces(0);
           amount = Decimal.min(maxdamZ, amount);
           gainCoin(amount,m);
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
           m.attack = m.attack.minus(m.tempAtk);
           m.attack = Decimal.max(new Decimal(0), m.attack);
           let luck = 0.05 + 0.01 * Math.floor(m.level / 50);
           if (checkLuck(luck)) {
             let atkIncrease = m.tempAtk.dividedBy(10).toDecimalPlaces(0);
             raiseAtk(m, atkIncrease);
           }
           m.tempAtk = new Decimal(0);
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
           let dam = m.attack.times(m.attackSpeed).dividedBy(1000).toDecimalPlaces(0);
           damageKmr(dam, m);
           showSkillWord(m, "饿龙咆哮");
         }
       }
       if (m.learnedSkills.includes("铁犀冲锋")){
         if (!m.count){m.count = 0};
         m.count ++;
         if (m.count >= 8){
           m.count = zeroCountDown(8);
           if (checkLuck(0.04)){
             let dam = m.attack.times(Math.pow(m.level,0.6)).toDecimalPlaces(0);
              damageKmr(dam, m);
             showSkillWord(m, "铁犀冲锋");
           }
         }
       }
       if (m.learnedSkills.includes("一十九米肃清刀")){
         if (!m.count){m.count = 0};
         m.count ++;
         if (m.count >= 19){
           m.count = zeroCountDown(19);
           let dam = m.attack.times(unlockedMinions.length).dividedBy(2).toDecimalPlaces(0);
           damageKmr(dam, m);
           showSkillWord(m, "一十九米肃清刀");
         }
       }
       if (m.learnedSkills.includes("卡场绝杰")){
         if (!m.count){m.count = 0};
         m.count ++;
         if (m.count >= 49){
           m.count = zeroCountDown(49);
           let yn = new Decimal(ynAttackCount)
           let dam = Decimal.floor(m.attack.times(yn.times(yn.fifthrt() )).times(0.2) );
           ynAttackCount = 0;
           damageKmr(dam, m);
           showSkillWord(m, "卡场绝杰");
         }
       }
       if (m.learnedSkills.includes("巨人")){
         if (!m.count){m.count = 0};
         m.count ++;
         if (m.count >= 32){
           m.count = zeroCountDown(32);
           let dam = new Decimal(0);
           let zPlus = 0;
           for (let bond of bondData){
             if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.skillPlus && bond.skillPlus[0] == '巨人'){
               let c = bond.skillPlus[1] * obtainedBonds[bond.name].level;
               zPlus += c;
             }
           }
           for (let mi of minionsState) {
             dam = dam.plus(mi.attack);
             if (mi.name === "ZenX") {
               dam = dam.plus(mi.attack.times(zPlus));
             }
           }
           dam = Decimal.floor(dam.times(getDigit(m.attack)).dividedBy(2));
           damageKmr(dam, m);
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
 x = new Decimal(x);
 y = new Decimal(y);
 let logX = y.div(x).log();
 return logX.toNumber();
}

function raiseGrowth(minion, amount, norepeat, fromUpgrade) {
  minion.addattack = new Decimal(minion.addattack.plus(amount));
}


function raiseAtk(minion, amount, norepeat, fromUpgrade) {
  if (!norepeat){
    norepeat = [];
  }
  //console.log(minion, amount)
  for (let m of minionsState) {
   if (m.name != minion.name && m.learnedSkills.includes("做法") && amount.comparedTo(m.attack.times(0.01)) < 0) {
     if (checkLuck(0.2)) {
       amount = Decimal.min(amount.times(4), (m.attack.times(0.01)).toDecimalPlaces(0) );
       showSkillWord(m, "做法");
     }
   }
 }
 if (fromUpgrade) {
   for (let bond of bondData) {
     if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.upgradeAllAPlusl) {
       amount = amount.plus(amount.times(bond.upgradeAllAPlus).times(obtainedBonds[bond.name].level));
     }
   }
   if (minion.learnedSkills.includes("虫虫咬他")) {
     for (let bond of bondData) {
       if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.skillPlus && bond.skillPlus[0] == '虫虫咬他') {
         let c = bond.skillPlus[1];
         let am = amount.times(c * obtainedBonds[bond.name].level);
         showSkillWord(minion, "虫虫咬他");
         raiseGrowth(minion, Decimal.max(new Decimal(1), Decimal.floor(am) ), false, true);
       }
     }
   }
 }
 for (let bond of bondData){
   if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.extraAtkGain && bond.characters.includes(minion.name)){
     amount = amount.plus(amount.times(bond.extraAtkGain).times(obtainedBonds[bond.name].level));
   }
 }


 // Increase minion's attack using Decimal operations
 minion.attack = Decimal.floor(minion.attack.plus(amount));

 if (minion.learnedSkills.includes("亚军传承")) {
   raiseGrowth(minion, Decimal.floor(Decimal.max(amount.div(amount.fifthrt()).times(0.06),1 ) ));
   showSkillWord(minion, "亚军传承");
 }

 // Recursively raise attack for marriage-related minions
 if (marriage[0] == minion.name && fromUpgrade) {
   raiseAtk(minionsState[unlockedMinions.indexOf(marriage[1])], Decimal.floor(amount.times(0.2)));
 }
 if (marriage[1] == minion.name && fromUpgrade) {
   raiseAtk(minionsState[unlockedMinions.indexOf(marriage[0])], Decimal.floor(amount.times(0.2)));
 }

 // Process additional upgrades using Decimal operations
 if (fromUpgrade) {
   for (let bond of bondData) {
     if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.upBond) {
       let c = bond.upBond;
       let ratio = new Decimal(loglevel(obtainedBonds[bond.name].level, c[0], c[1], [2]));
       if (bond.characters[0] == minion.name) {
         raiseAtk(minionsState[unlockedMinions.indexOf(bond.characters[1])], Decimal.max(1, Decimal.floor(ratio.times(amount)) ));
       }
       if (bond.characters[1] == minion.name) {
         raiseAtk(minionsState[unlockedMinions.indexOf(bond.characters[0])], Decimal.max(1, Decimal.floor(ratio.times(amount)) ));
       }
     }
   }
 }

 // Process "上帝" skill for other minions
 for (let m of minionsState) {
   if (m.name != minion.name && m.learnedSkills.includes("上帝") && !norepeat.includes("上帝")) {
     let ratio = new Decimal(0.12);
     for (let bond of bondData) {
       if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.skillPlus && bond.skillPlus[0] == '上帝') {
         let c = bond.skillPlus[1];
         ratio = ratio.plus(loglevel(obtainedBonds[bond.name].level, c[0], c[1], [2]));
       }
     }
     norepeat.push("上帝")
     raiseAtk(m, Decimal.floor(Decimal.max(1, (amount.times(ratio))) ), norepeat);
     showSkillWord(m, "上帝");
   }
   if (upgrading && m.learnedSkills.includes("皇室荣耀")) {
     let am = amount;
     for (let bond of bondData) {
       if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.skillPlus && bond.skillPlus[0] == '皇室荣耀') {
         let c = bond.skillPlus[1] * obtainedBonds[bond.name].level;
         am = am.times(1 + c);
       }
     }
     am =  Decimal.floor(am);
     yggdam = yggdam.plus(am);
     showSkillWord(m, "皇室荣耀");
   }
 }
 for (let m of minionsState) {
  if (m.name != minion.name && m.learnedSkills.includes("虽强但弱") && !norepeat.includes("虽强但弱")) {
    let sortedMs = [...minionsState.filter(b => b.name != m.name)].sort((a, b) => b.attack.comparedTo(a.attack));

    if (minion.name == sortedMs[0].name){
       let ratio = new Decimal(0.2);
       norepeat.push("虽强但弱");
       raiseAtk(m, Decimal.max(1, Decimal.floor(amount.times(ratio)) ), norepeat);
       raiseAtk(sortedMs[sortedMs.length - 1], Decimal.max(1, Decimal.floor(amount.times(ratio)) ), norepeat);
       showSkillWord(m, "虽强但弱");
    }
  }
}
 if (!autoing){
   document.getElementById(`attack-${unlockedMinions.indexOf(minion.name)}`).textContent = formatNumber(minion.attack);
   if (rindex == unlockedMinions.indexOf(minion.name)){refreshMinionDetails()}
 }
}

function autoupgradeMinion(max) {
    autoing = true;
    let enough = true;
    let upgradeCount = 0;
    let minCost, minIndex;
    if (!max){
      max = 999999;
    } else {
      weakauto = true;
    }

    // 创建一个数组来存储所有随从的升级成本
    let upgradeCosts = [];
    for (let i = 0; i < unlockedMinions.length; i++) {
        upgradeCosts[i] = mupgradeCost(minionsState[i]);
    }

    let p = 0;
    minCost = new Decimal(Infinity);
    while (enough) {
        p += 1;
        //console.log(p);
        enough = false;

        minIndex = -1;

        // 找到升级花费最小的随从
        for (let i = 0; i < unlockedMinions.length; i++) {
            const cost = upgradeCosts[i];
            if (cost.comparedTo(minCost) <= 0) {
                minCost = cost;
                minIndex = i;
            }
        }

        // 如果找到的最小花费随从可以升级，则升级它
        if (minIndex !== -1 && upgradeMinion(minIndex, true, undefined, undefined, minCost)) {
            enough = true;
            // 更新已升级随从的成本
            upgradeCosts[minIndex] = mupgradeCost(minionsState[minIndex]);
            minCost = upgradeCosts[minIndex];
        } else {
            break;
        }
        if (p == max){
          break;
        }
    }

    autoing = false;
    refMinions();
    updateDisplays(); // 最后刷新一次界面
    refreshMinionDetails();
    weakauto = false;
    return enough;
}

function mupgradeCost(minion) {
  if (freeUp > 0) {
    return new Decimal(0);
  }

  let baseCost = new Decimal(minion.basecost)
    .plus(minion.level * minion.enhancecost)
    .plus(minion.level * minion.level * minion.supEnhancecost);

  let levelFactor = minion.level > 100 ? Math.floor(Math.pow(minion.level / 100, 0.5)) : 1;
  baseCost = baseCost.times(levelFactor);

  // 使用多个整数次幂近似非整数次幂
  let exp = 1 + minion.level / 2000;
  let intExp = Math.floor(exp);
  let fracExp = exp - intExp;
  let fracCost = new Decimal(1);
  let fracC = 0;
  let po = Math.floor(fracExp/0.009);
  let sub = baseCost.cbrt().cbrt().cbrt().sqrt().sqrt();
  fracCost = fracCost.times(sub.pow(po));

  baseCost = baseCost.pow(intExp).times(fracCost)//.times(baseCost.pow(fracExp)); // 近似计算

  let bondDiscount = new Decimal(1);
  for (let bond of bondData) {
    if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond)) {
      if (bond.upgradeMinusCost && bond.characters.includes(minion.name)) {
        let c = bond.upgradeMinusCost;
        let minrate = loglevel(obtainedBonds[bond.name].level, c[0], c[1], [2]);
        bondDiscount = bondDiscount.times(1 - minrate);
      }
      if (bond.upgradeAllMinusCost) {
        let c = bond.upgradeAllMinusCost;
        let minrate = loglevel(obtainedBonds[bond.name].level, c[0], c[1], [2]);
        bondDiscount = bondDiscount.times(1 - minrate);
      }
    }
  }

  // 预计算技能减少成本的部分
  let skillDiscount = new Decimal(1);
  for (let m of minionsState) {
    if (m.learnedSkills.includes("白骨夫人")) {
      skillDiscount = skillDiscount.times(0.8 - Math.min(0.1, 0.01 * Math.floor(m.level / 100)));
    }
  }

  // 应用所有折扣
  let finalCost = baseCost.times(bondDiscount).times(skillDiscount);

  for (let m of minionsState) {
    if (minion.description.includes("🐷") && m.learnedSkills.includes("管人痴")) {
      finalCost  = finalCost.div(finalCost.sqrt().sqrt().fifthrt());
    }
  }

  // 将结果取整
  finalCost =  Decimal.floor(finalCost);
  return finalCost;
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
    refMinions();
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

function upgradeMinion(index, auto, free, noskill, givenCost) {
    if (Decimal(kmrHealthValue).comparedTo(0) <= 0 && !free) { // 使用 Decimal 处理 kmrHealthValue
        return false;
    }
    upgrading = true;
    burning = 0;
    const minion = minionsState[index];
    let upgradeCost;
    if (!givenCost){
      upgradeCost = mupgradeCost(minion); // 使用 Decimal 处理升级成本
    } else {
      upgradeCost = givenCost;
    }
    if (free) {
        upgradeCost = Decimal(0);
    }

    if (coins.comparedTo(upgradeCost) >= 0) { // 使用 Decimal 处理金币比较
        coins = coins.minus(upgradeCost); // 使用 Decimal 处理金币减法
        if (upgradeCost.eq(0) && !free) {
            freeUp -= 1;
            if (freeUp === 0) {
                refMinions();
            }
        }

        if (!noskill) {
            minion.reroll = 0;
        }

        minion.level += 1;
        raiseAtk(minion, Decimal(getAddattack(minion)), undefined, true); // 使用 Decimal 处理攻击提升
        for (let m of minionsState) {
            if (m.name !== minion.name && m.learnedSkills.includes("构筑带师")) {
                raiseAtk(minion, Decimal.floor(m.attack.div(m.attack.sqrt().fifthrt()).div(30) ), undefined, true); // 使用 Decimal 处理攻击提升
                showSkillWord(m, "构筑带师");
            }
            if (m.name !== minion.name && m.learnedSkills.includes("红娘")) {
                if (marriage.length < 2 && !autoing && !free && !auto && !noskill && !marriage.includes(minion.name)) {
                    marriage.push(minion.name);
                    showSkillWord(m, "红娘");
                    showSkillWord(minion, "结婚(" + marriage.length + "/2)");
                    refMinions();
                }
            }
            if (minion.level % 5 === 0 && minion.description.includes("🐷") && m.learnedSkills.includes("双猪的羁绊")) {
                raiseAtk(minion, Decimal.floor(Decimal(m.level).times(m.attack.div(m.attack.fifthrt().pow(2))).div(10), undefined, true)); // 使用 Decimal 处理攻击提升
                showSkillWord(m, "双猪的羁绊");
            }
        }

        if (!noskill) {
            for (let s of minion.skills) {
                if (minion.level === s.level && !minion.learnedSkills.includes(s.name)) {
                    minion.learnedSkills.push(s.name);
                    if (s.name === "说书") {
                        minion.attackSpeed -= 400;
                        clearInterval(minion.intervalId);
                        let intervalId = setInterval(() => minionAttack(minion), minion.attackSpeed);
                        minion.intervalId = intervalId;
                    }
                    if (s.name === "不稳定的传送门") {
                        freeReroll += 3;
                    }
                    if (s.name === "马纳利亚时刻") {
                        refreshCangSkill();
                    }
                    if (s.name === "太上皇") {
                        let filteredMinions = unlockedMinions.filter(mi =>
                            !lostTeam.includes(mi) && mi !== minion.name
                        );
                        let r = Math.floor(Math.random() * (filteredMinions.length - 1));
                        let rname = filteredMinions[r];
                        let n = unlockedMinions.indexOf(rname);
                        lostTeam.push(rname);
                        showSkillWord(minion, "太上皇招募：" + rname);
                        if (lostTeam.length > Math.floor(Math.pow(unlockedMinions.length, 0.5))) {
                            lostTeam = [];
                            showSkillWord(minion, "解散！");
                        }
                    }
                    if (s.name =="小说家") {
                        coolAnim = true;
                    }
                }
            }
        }

        if (minion.learnedSkills.includes("鲁智深") && (minion.level === 5 || minion.level % 25 === 0)) {
            raiseAtk(minion, Decimal(40 * minion.level), undefined, true); // 使用 Decimal 处理攻击提升
            if (minion.level === 5) {
                raiseAtk(minion, Decimal(40 * minion.level), undefined, true); // 使用 Decimal 处理攻击提升
            }
        }
        if (minion.learnedSkills.includes("阴阳秘法") && (minion.level === 6 || minion.level % 36 === 0)) {
          let mm = 0;
          for (let bond of bondData) {
              if (Object.keys(obtainedBonds).includes(bond.name) && completedBond(bond) && bond.skillPlus && bond.skillPlus[0] == '阴阳秘法') {
                  mm += bond.skillPlus[1]* obtainedBonds[bond.name].level;
              }
          }
            for (let m of minionsState) {
                raiseAtk(m, Decimal(3 * minion.level).times(mm + 1),undefined,true); // 使用 Decimal 处理攻击提升
                raiseGrowth(m, Decimal(minion.level).times(mm),undefined,true);
            }
            if (minion.level === 6) {
                for (let m of minionsState) {
                  raiseAtk(m, Decimal(3 * minion.level).times(mm + 1),undefined,true); // 使用 Decimal 处理攻击提升
                  raiseGrowth(m, Decimal(minion.level).times(mm),undefined,true);
                }
            }
        }
        if (minion.learnedSkills.includes("虫虫咬他")) {
            showSkillWord(minion, "虫虫咬他");
            raiseGrowth(minion, new Decimal(minion.level))
        }

        if (minion.learnedSkills.includes("双猪齐力")) {
            let unlockedPigs = 0;
            for (let m of minionsState) {
                if (m.description.includes("🐷")) {
                    unlockedPigs++;
                }
            }
            if (unlockedPigs > 1 && checkLuck(0.5)) {
                skilled = true;
                let r = Math.floor(Math.random() * (unlockedPigs - 1)) + 1;
                for (let m of minionsState) {
                    if (m.description.includes("🐷") && m.name !== minion.name) {
                        r -= 1;
                        if (r === 0) {
                            upgradeMinion(unlockedMinions.indexOf(m.name), undefined, true);
                        }
                    }
                }
                showSkillWord(minion, "双猪齐力");
            }
        }
        if (minion.learnedSkills.includes("闹系列") && isPrime(minion.level)) {
            addBuff("nao", 1, 8, false);
            showSkillWord(minion, "闹系列");
        }

        for (let m of minionsState) {
            if (m.name !== minion.name && m.learnedSkills.includes("光速上分")) {
                if (checkLuck(0.1)) {
                    gainCoin(Decimal(upgradeCost).times(Math.floor(Math.min(1, 0.3 + 0.01 * Math.floor(m.level / 10)))),m); // 使用 Decimal 处理金币增加
                    showSkillWord(m, "光速上分");
                }
            }

            if (m.name !== minion.name && m.learnedSkills.includes("日一皇")) {
                let tlv = 0;
                for (let mi of minionsState) {
                    tlv += mi.level;
                }
                if (tlv % 100 === 0) {
                    for (let mi of minionsState) {
                        raiseAtk(mi, Decimal(tlv / 10),undefined,true); // 使用 Decimal 处理攻击提升
                        raiseGrowth(mi, Decimal(tlv / 10),undefined,true);
                    }
                    showSkillWord(m, "日一皇");
                }
            }
            if (m.learnedSkills.includes("卓绝的契约") && !noskill && minion.level === 2 && unlockedMinions.length >= 7 && daZhaiQiYue === false) {
                minion.attack = minion.attack.plus(m.attack);
                minion.attackSpeed = Math.floor(0.8 * minion.attackSpeed);
                minion.addattack = minion.addattack.times(10);
                daZhaiQiYue = minion.name;
                showSkillWord(m, "卓绝的契约");
            }
        }

        if (!auto && !noskill){
          document.getElementById(`level-${index}`).textContent = minion.level;
          document.getElementById(`attack-${index}`).textContent = formatNumber(minion.attack);
          document.getElementById(`attack-speed-${index}`).textContent = (minion.attackSpeed / 1000).toFixed(1) + "s";
          document.getElementById(`cost-${index}`).textContent = "升级 (" + formatNumber(mupgradeCost(minion)) + ")";
        }

        if (!auto && !noskill && !free) {
            updateDisplays();
            showMinionDetails(index);
        }

        if (minion.level === 2) {
            refMinions();
        }

        upgrading = false;
        return true;
    } else {
        upgrading = false;
        if (auto) {
            return false;
        }

        const mi = document.getElementById(`cost-${index}`);
        var position = mi.getBoundingClientRect();
        let x = position.left + (0.5 * position.width);
        let y = position.top + (0.5 * position.height);
        showWord(x, y, "金币不足！");
        return false;
    }
}

const originalClearInterval = window.clearInterval;

// 重写 clearInterval 函数
window.clearInterval = function(intervalId) {
    if (intervalId !== globalintervalID) {
        originalClearInterval(intervalId);
    } else {
        console.log("Attempted to clear interval with ID global , which is not allowed.");
    }
};

// Update game state every second
let globalintervalID = 0;

// Get the modal
const modal = document.getElementById("helpModal");

// Get the button that opens the modal
const helpButton = document.getElementById("helpButton");

// Get the <span> element that closes the modal
const closeSpan = document.getElementsByClassName("close")[0];

document.getElementById('bondsButton').onclick = toggleBondsModal;

function toggleBondsModal() {
   const modal = document.getElementById('bondsModal');
   if (modal.style.display != 'block'){
     modal.style.display = 'block';
   } else {
     modal.style.display = 'none';
   }
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
       if (obtainedBonds[bond.name].have >= obtainedBonds[bond.name].require && obtainedBonds[bond.name].level < 20){
         obtainedBonds[bond.name].level += 1;
         obtainedBonds[bond.name].require += obtainedBonds[bond.name].level + 1;
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

let annClose = document.getElementById("annClose");
let announceModal = document.getElementById("AnnounceModal");
let firstAnnounce = true;

// 关闭公告窗口的函数
function closeAnnounceModal() {
    announceModal.style.display = "none";
    if (firstAnnounce){
        firstAnnounce = false;
        globalintervalID = setInterval(() => {
            timePlayed += 1;
            let t = timePlayed + totaltimePlayed;
            if (t > 0 && t%60 == 0 && !victory){
                saveGame(true);
            }
            if (victory && timePlayed == 30){
                phaseUpGame();
            }
            kmrquickHit = 0;
            if (canAutoUpgrade){
              if (!autoupgradeMinion(100)){
                toggleAutoUpgrade();
              }
            }
            updateCounts();
            updateDisplays();
        }, 1000);
    }
}

// 点击关闭按钮关闭公告窗口
annClose.onclick = function() {
    closeAnnounceModal();
};

// 按下键盘事件监听器
document.addEventListener('keydown', function(event) {
    // 按下 Esc 键或 Enter 键时关闭公告窗口
    if (event.key === "Escape" || event.key === "Enter") {
        if (announceModal.style.display !== "none") {
            closeAnnounceModal();
        }
    }
});



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
