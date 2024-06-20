const kmr = document.getElementById('kmr');
const kmrHealth = document.getElementById('kmr-health');
//const hitSound = document.getElementById('hit-sound');
const coinsDisplay = document.getElementById('coins');

const timePlayedDisplay = document.getElementById('time-played');
const totalClickDamageDisplay = document.getElementById('total-click-damage');
const minionDamagesDisplay = document.getElementById('minion-damages');
const victoryMessage = document.getElementById('victory-message');
const totalTimeDisplay = document.getElementById('total-time');
const totalTimeDisplay2 = document.getElementById('total-time2');
const curLevelDisplay = document.getElementById('total-level');
const finalStatsDisplay = document.getElementById('final-stats');

let version = "2.3.1";
let kmrHealthValue = 500000;
let level = 0;
let coins = 0;
let dps = 0;
let timePlayed = 0;
let totalClickDamage = 0;
let rindex = 0;
let minionDamages = {};
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
//minions.map(minion => ({
//    ...minion,
//    level: 0,
//    totalDamage: 0,
//    learnedSkills: [],
//}));

function utf8_to_b64(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

function b64_to_utf8(str) {
    return decodeURIComponent(escape(atob(str)));
}


function saveGame(auto) {
    const gameState = {
        version,
        kmrHealthValue,
        level,
        coins,
        dps,
        timePlayed,
        totalClickDamage,
        rindex,
        minionDamages,
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
        xxBuff
    };

    const gameStateStr = JSON.stringify(gameState);
    const encodedGameState = utf8_to_b64(gameStateStr); // Base64 encode the game state

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
        const gameStateStr = b64_to_utf8(encodedGameState); // Base64 decode the game state
        const gameState = JSON.parse(gameStateStr);
        version = gameState.version;
        kmrHealthValue = gameState.kmrHealthValue;
        level = gameState.level;
        coins = gameState.coins;
        dps = gameState.dps;
        timePlayed = gameState.timePlayed;
        totalClickDamage = gameState.totalClickDamage;
        rindex = gameState.rindex;
        minionDamages = gameState.minionDamages;
        minionsState = gameState.minionsState;
        unlockedMinions = gameState.unlockedMinions;
        totaltimePlayed = gameState.totaltimePlayed;
        burning = gameState.burning;
        skilled = gameState.skilled;
        zenxLV = gameState.zenxLV;
        zenxActive = gameState.zenxActive;
        autoing = gameState.autoing;
        remluck = gameState.remluck;
        buffs = gameState.buffs;
        reroll = gameState.reroll;
        freeReroll = gameState.freeReroll;
        freeUp = gameState.freeUp;
        yggdam = gameState.yggdam;
        upgrading = gameState.upgrading;
        xxjjj = gameState.xxjjj;
        curjjj = gameState.curjjj;
        xxBuff = gameState.xxBuff;


        // Restore intervals (assuming you have functions to set them)
        restoreIntervals();
        updateDisplays();
        refMinions();
    } else {

    }
}

// Function to reset all game variables
function resetGame() {
    version = "2.3.1";
    kmrHealthValue = 500000;
    level = 0;
    coins = 0;
    dps = 0;
    timePlayed = 0;
    totalClickDamage = 0;
    rindex = 0;
    minionDamages = {};
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
    for (let minion of minionsState){
      clearInterval(minion.intervalId);
    }
    minionsState = [];
    refMinions();
    updateDisplays();

    const detailsContainer = document.getElementById('selected-minion-details');
    detailsContainer.innerHTML = ``;
}

// Function to handle hard reset confirmation
function hardResetGame() {
    if (confirm("你确定要重置游戏吗？这将清除所有进度。")) {
        if (confirm("再次确认：你真的要重置游戏吗？这将无法撤销。")) {
            resetGame();
        }
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
  buffs.push([name,power,length]);
}

function getBuffPower(name){
  let pow = [];
  for (let buff of buffs){
    pow.push(buff[1]);
  }
  return pow;
}

function getBuffLength(name){
  let pow = [];
  for (let buff of buffs){
    pow.push(buff[2]);
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
    }
  }
}

function showEffect(x, y, effectClass) {
    const effect = document.createElement('div');
    effect.className = effectClass;
    effect.style.left = `${x - 10}px`;
    effect.style.top = `${y - 10}px`;
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 1000);
}

function showDamage(x, y, damage) {
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

function showSkillWord(minion, word) {
  if (autoing){
    return;
  }
    let im = document.getElementById(`image-${unlockedMinions.indexOf(minion.name)}`);
    var position = im.getBoundingClientRect();

    let x = position.left + (Math.random()*position.width);
    let y = position.top + (Math.random()*position.height);
    const wordEffect = document.createElement('div');
    wordEffect.className = 'word-effect';
    wordEffect.innerText = `${word}`;
    wordEffect.style.left = `${x - 10}px`;
    wordEffect.style.top = `${y - 20}px`;
    document.body.appendChild(wordEffect);
    setTimeout(() => wordEffect.remove(), 1000);
}

function updateHealth(health) {
    const healthElement = document.getElementById('kmr-health');
    const maxHealth = 500000*Math.pow(10,level); // 假设最大血量为500,000
    kmrHealthValue = Math.floor(kmrHealthValue)
    const healthPercentage = (kmrHealthValue / maxHealth) * 100;
    healthElement.style.width = healthPercentage + '%';
    healthElement.textContent = health.toLocaleString();
}

function updateDisplays() {
  if (autoing){
    return;
  }
    kmrHealth.textContent = kmrHealthValue.toLocaleString();
    coinsDisplay.textContent = formatNumber(coins);
    timePlayedDisplay.textContent = `${timePlayed}s`;
    totalClickDamageDisplay.textContent = totalClickDamage;
    minionDamagesDisplay.innerHTML = Object.keys(minionDamages)
        .map(name => `<li>${name}: ${minionDamages[name]}</li>`).join('');
    if (unlockedMinions.length > 0){
      refreshMinionDetails()
    }

    minionDamagesDisplay.innerHTML = '';

    // 将 Object.entries(minionDamages) 转换为数组，并按 damage 从大到小排序
    const sortedMinionDamages = Object.entries(minionDamages)
        .sort(([, damageA], [, damageB]) => damageB - damageA);

    for (const [minion, damage] of sortedMinionDamages) {
        const li = document.createElement('li');
        li.textContent = `${minion}: ${formatNumber(damage)}`;
        minionDamagesDisplay.appendChild(li);
    }
    updateHealth(kmrHealthValue);
    document.getElementById(`unlockButton`).textContent = "抽取助战 (金币:" + formatNumber(unlockCost(unlockedMinions.length)) +")";
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
    kmrHealthValue -= 1;
    totalClickDamage += 1;
    var position = kmr.getBoundingClientRect();
    let x = position.left + (Math.random()*kmr.width);
    let y = position.top + (Math.random()*kmr.height);
    showEffect(x,y, 'hit-effect');
    showDamage(x,y, 1);
    const hitSound = new Audio('kmr/hit.ogg');
    hitSound.play();
    gainCoin(1);
    updateDisplays();
    checkVictory();
}

function damageKmr(dam,minion) {
    if (kmrHealthValue <= 0) return;
    for (let m of minionsState){
      if (m.name != minion.name && m.learnedSkills.includes("护国神橙")){
        dam = Math.floor(dam*(1 + 0.2 + 0.01*Math.floor(Math.pow(m.level,0.6)));
      }
    }
    kmrHealthValue -= dam;
    minion.totalDamage += dam;
    if (!minionDamages[minion.name]){
      minionDamages[minion.name] = 0;
    }
    var position = kmr.getBoundingClientRect();
    let x = position.left + (Math.random()*kmr.width);
    let y = position.top + (Math.random()*kmr.height);
    showEffect(x,y, 'hit-effect');
    showDamage(x,y, dam);
    minionDamages[minion.name] += dam;
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

function checkVictory() {
    if (kmrHealthValue <= 0) {
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

    }
}

function phaseUpGame() {
    level = level +1;
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
    //initMinions(); // Initialize minions again after restarting game
}

function getattack(minion){
  let atk = minion.attack;
  for (let m of minionsState){
    if (m.name != minion.name && m.learnedSkills.includes("苦痛")){
      atk += Math.floor(m.attack*0.5);
    }
    if (m.learnedSkills.includes("祥瑞") && Math.abs(minionsState.indexOf(minion) - minionsState.indexOf(m))<=1 ){
      let low = Math.max(0, 0.5 - 0.01 * Math.floor(m.level/10));
      let high = 2 + 0.04 * Math.floor(m.level/10);
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
  if (minion.learnedSkills.includes("打个教先")){
    if (xxBuff && !master && minion.learnedSkills.includes("魔咒")){
      atk*= Math.floor(1 + Math.pow(xxjjj,2.25));
      skilled = true;
      xxBuff = false;
    } else {
      let luck = Math.max(0.2, 0.7 - 0.01* Math.floor(minion.level/15));
      if (checkLuck(luck)) {
        atk*= 2 + 0.1*0.01* Math.floor(minion.level/15);
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
    atk += Math.floor(Math.pow(Math.abs(coins),0.7)/1000*minion.level);
  }
  if (getBuffPower("idol").length > 0){
    for (let i of getBuffPower("idol")){
      atk *= i;
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

function checkLuck(r) {
  let re = 0;
  let pass = Math.random() < r;
  if (r < 0.2 && remluck > 0){
    remluck--;
    pass = true;
  }
  for (let m of minionsState){
    if (m.learnedSkills.includes("重返赛场") && !pass && r < 0.2){
      let luck = Math.min(0.5,0.21 + 0.01*Math.floor(m.level/25));
      if (Math.random() < luck){
        showSkillWord(m, "重返赛场");
        pass = Math.random() < r;
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
    let dam = getattack(minion)
    let gainC = dam;

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
    kmrHealthValue -= dam;
    if (master){
      if (!minionDamages[master.name]){
        minionDamages[master.name] = 0;
      }
      master.totalDamage += dam;
      minionDamages[master.name] += dam;
    } else {
      if (!minionDamages[minion.name]){
        minionDamages[minion.name] = 0;
      }
      minion.totalDamage += dam;
      minionDamages[minion.name] += dam;
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
        raiseAtk(minion,minion.level);
        skilled = true;
        document.getElementById(`attack-${unlockedMinions.indexOf(minion.name)}`).textContent = formatNumber(minion.attack);
        showSkillWord(minion, "冲击冠军");
      }
    }
    if (minion.learnedSkills.includes("大梦仙尊")){
      let luck = Math.min(0.03,0.01 + 0.001 * Math.max(0,getBaseLog(2,Math.abs(minion.attack)) - 10));
      if (checkLuck(luck)) {
        skilled = true;
        freeUp += 5;
        showSkillWord(minion, "大梦仙尊");
      }
    }
    if (minion.learnedSkills.includes("+1+1")){
      if (checkLuck(0.04)) {
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
    if (minion.learnedSkills.includes("偶像")){
      if (checkLuck(0.07)) {
        skilled = true;
        addBuff("idol",1.2 + 0.02*getDigit(dam),10,true)
        showSkillWord(minion, "偶像");
      }
    }
    if (minion.learnedSkills.includes("人偶使") && unlockedMinions.length > 1){
      if (checkLuck(0.08)) {
        skilled = true;
        let t = 3 + getBuffPower("idol").length * 3;
        for (let i = 0; i < t; i++){
          let r = Math.floor(Math.random()*(unlockedMinions.length - 1));
          if (r >= unlockedMinions.indexOf(minion.name)){
            r += 1;
          }
          minionAttack(minionsState[r],minion);
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
        if (checkLuck(0.09)) {
          minionAttack(m);
          showSkillWord(m, "永失吾艾");
        }
      }
      if (minion.description.includes("🐷") && m.learnedSkills.includes("身外化身")){
        if (checkLuck(0.1)) {
          minionAttack(minion);
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
        minionElement.innerHTML = `
            <img id="image-${index}" src="${minion.image}" alt="${minion.name}">
            <div>${minion.name}</div>
            <div>等级: <span id="level-${index}">${minion.level}</span></div>
            <div>攻击: <span id="attack-${index}">${formatNumber(minion.attack)}</span></div>
            <div>攻速: <span id="attack-speed-${index}">${(minion.attackSpeed / 1000).toFixed(1)}s</span></div>
            <button id="cost-${index}" onclick="upgradeMinion(${index})" >升级 (${formatNumber(mupgradeCost(minion))})</button>
        `;
        if (minion.reroll > 0 && unlockCost(unlockedMinions.length) < Infinity){
          minionElement.innerHTML += `<button id="reroll-${index}" onclick="rerollMinion(${index})" >重抽 (剩余${minion.reroll}次) (${formatNumber(rerollCost(unlockedMinions.length))})</button>`
        }
        minionElement.addEventListener('click', () => {
            showMinionDetails(index);
        });
        minionsContainer.appendChild(minionElement);

    });

    document.getElementById(`unlockButton`).textContent = "抽取助战 (金币:" + unlockCost(unlockedMinions.length) +")";
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
    if (m.learnedSkills.includes("连协之力")){
      cost = Math.floor(0.75*cost)
    }
  }
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
      <button onclick="upgradeMinion(${rindex})" >${code} (金币: ${formatNumber(mupgradeCost(minion))})</button>
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
    default:
      return skill.effect;
  }

}
function mupgradeCost(minion){
  if (freeUp > 0){
    return 0;
  }
  let cost = (minion.basecost + minion.level * minion.enhancecost + minion.level*minion.level * minion.supEnhancecost);
  if (minion.level > 100){
    cost *= minion.level/100;
  }
  cost = Math.pow(cost,1 + minion.level/5000)
  cost = Math.floor(cost);
  for (let m of minionsState){
    if (m.learnedSkills.includes("白骨夫人")){
      cost = Math.floor((0.8 - Math.min(0.1,0.01*Math.floor(m.level/100)))*cost)
    }
  }
  return cost;
}

function zeroCountDown(c) {
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
      if (m.count >= 25){
        m.count = zeroCountDown(45);
        remluck = Math.min(8,2 + Math.floor(m.level/100))
        showSkillWord(m, "操纵命运");
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
          for (let m of minionsState){
            if (m.description.includes("🐷") && m.name != minion.name){
              r -= 1;
              if (r == 0){
                m.raiseAtk(Math.max(1,Math.floor(minionsState[r].attack*0.02)))
                minionsState[r].level -= 3;
                minionsState[r].level = Math.max(1,minionsState[r].level);
              }
            }
          }
          showSkillWord(minion, "汲取兄弟");
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
        minionsState[r].level -= Math.max(1,Math.floor(minionsState[r].level*0.01));
        m.level -= Math.max(1,Math.floor(m.level*0.01));
        minionsState[r].level = Math.max(1,minionsState[r].level);
        m.level = Math.max(1,m.level);
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
        let times = 1 + Math.floor(m.level/50);
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
      if (m.count >= 60){
        m.count = zeroCountDown(60);
        for (let mi of minionsState){
          if (mi.name != m.name){
            raiseAtk(mi,Math.floor(m.attack/40));
            document.getElementById(`attack-${unlockedMinions.indexOf(mi.name)}`).textContent = formatNumber(mi.attack);
          }
        }
        showSkillWord(m, "每日饼之诗");
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
        gainCoin(Math.floor(coins/10));
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
        for (let mi of minionsState){
          dam += mi.attack;
        }
        dam*= getDigit(m.attack);
        dam = Math.floor(dam/2)
        damageKmr(dam,m);
        showSkillWord(m, "巨人");
      }
    }
    if (m.learnedSkills.includes("次元超越")){
      let c = 30;
      c -= Math.max(0,Math.min(10,Math.floor(m.level/100)));
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

function raiseAtk(minion,amount){
  minion.attack += amount;
  for (let m of minionsState){
    if (m.name != minion.name && m.learnedSkills.includes("上帝")){
      m.attack += Math.max(1,Math.floor(amount*0.12));
      document.getElementById(`attack-${unlockedMinions.indexOf(m.name)}`).textContent = formatNumber(m.attack);
      showSkillWord(m, "上帝");
    }
    if (upgrading && m.learnedSkills.includes("皇室荣耀")){
      yggdam += amount;
      showSkillWord(m, "皇室荣耀");
    }
  }
}

function autoupgradeMinion(){
  autoing = true;
  let enough = true;
  while (enough){
    enough = false;
    for (let i = 0; i < unlockedMinions.length; i++){
      if (upgradeMinion(i,true)){
        enough = true;
      }
    }
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
        }
        if (!noskill){
          minion.reroll = 0;
        }

        minion.level += 1;
        raiseAtk(minion,minion.addattack); // Increase attack by 2 for each level
        for (let m of minionsState){
          if (m.name != minion.name && m.learnedSkills.includes("构筑带师")){
            raiseAtk(minion,Math.floor(m.attack/30));
            showSkillWord(m, "构筑带师");
          }
          if (minion.level%5 == 0 && minion.description.includes("🐷") && m.learnedSkills.includes("双猪的羁绊")){
            raiseAtk(minion,Math.floor(Math.pow(m.level,1.1)));
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
            }
          }
        }

        if (minion.learnedSkills.includes("鲁智深") && (minion.level==5 || minion.level%25 == 0)){
          raiseAtk(minion,40*minion.level);
          if (minion.level == 5){raiseAtk(minion,40*minion.level)}
        }
        if (minion.learnedSkills.includes("阴阳秘法") && (minion.level==6 || minion.level%36 == 0)){
          for (let m of minionsState){
            raiseAtk(m,3*minion.level);
          }
          if (minion.level == 6){
            for (let m of minionsState){
              raiseAtk(m,3*minion.level);
            }
          }
        }
        if (minion.learnedSkills.includes("虫虫咬他") && minion.level%2 == 1){
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
        document.getElementById(`level-${index}`).textContent = minion.level;
        document.getElementById(`attack-${index}`).textContent = formatNumber(minion.attack);
        document.getElementById(`attack-speed-${index}`).textContent = (minion.attackSpeed / 1000).toFixed(1)+"s";
        document.getElementById(`cost-${index}`).textContent = "升级 ("+formatNumber(mupgradeCost(minion))+")";
        for (let m of minionsState){
          if (m.name != minion.name && m.learnedSkills.includes("光速上分")){
            if (checkLuck(0.1)){
              gainCoin(Math.floor(upgradeCost * Math.min(1,0.3 + 0.01*Math.floor(m.level/10))));
              showSkillWord(m, "光速上分");
            }
          }
          if (m.name != minion.name && m.learnedSkills.includes("杀出重围")){
            let tlv = 0;
            for (let mi of minionsState){
              tlv += mi.level;
            }
            if (tlv%100 == 0){
              for (let mi of minionsState){
                raiseAtk(mi,tlv/5);
              }
              showSkillWord(m, "杀出重围");
            }
          }
        }
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

// Update game state every second
setInterval(() => {
    timePlayed += 1;
    let t = timePlayed + totaltimePlayed
    if (t > 0 && t%60 == 0){
      saveGame(true);
    }
    updateCounts();
    updateDisplays();
}, 1000);

kmr.addEventListener('click', clickKmr);
refMinions();
updateDisplays();
loadGame();
