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
let burning = 0;
let skilled = false;
let zenxLV = 0;
let zenxActive = false;
let fishTempAtk = 0;
//minions.map(minion => ({
//    ...minion,
//    level: 0,
//    totalDamage: 0,
//    learnedSkills: [],
//}));

function unlockMinion(minion){
  unlockedMinions.push(minion.name);
  minion = {
      ...minion,
      level: 1,
      attack: minion.baseattack,
      totalDamage: 0,
      learnedSkills: [],
  }

  let intervalId = setInterval(() => minionAttack(minion), minion.attackSpeed);
  minion.intervalId = intervalId;
  minionsState = minionsState.concat(minion)
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
    damageEffect.className = 'damage-effect';
    damageEffect.innerText = `-${damage}`;
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
    const healthPercentage = (kmrHealthValue / maxHealth) * 100;
    healthElement.style.width = healthPercentage + '%';
    healthElement.textContent = health.toLocaleString();
}

function updateDisplays() {
    kmrHealth.textContent = kmrHealthValue.toLocaleString();
    coinsDisplay.textContent = coins;
    timePlayedDisplay.textContent = `${timePlayed}s`;
    totalClickDamageDisplay.textContent = totalClickDamage;
    minionDamagesDisplay.innerHTML = Object.keys(minionDamages)
        .map(name => `<li>${name}: ${minionDamages[name]}</li>`).join('');
    if (unlockedMinions.length > 0){
      refreshMinionDetails()
    }

    minionDamagesDisplay.innerHTML = '';
    for (const [minion, damage] of Object.entries(minionDamages)) {
        const li = document.createElement('li');
        li.textContent = `${minion}: ${damage}`;
        minionDamagesDisplay.appendChild(li);
    }
    updateHealth(kmrHealthValue);
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

function clickKmr() {
    if (kmrHealthValue <= 0) return;
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
    coins += 1;
    updateDisplays();
    checkVictory();
}

function damageKmr(dam,minion) {
    if (kmrHealthValue <= 0) return;
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
    const hitSound = new Audio(minion.voice);
    hitSound.play();
    coins += dam;
    updateDisplays();
    checkVictory();
}


function checkVictory() {
    if (kmrHealthValue <= 0) {
      totaltimePlayed = totaltimePlayed + timePlayed;
        victoryMessage.classList.remove('hidden');
        totalTimeDisplay.textContent = timePlayed;
        totalTimeDisplay2.textContent = totaltimePlayed;
        curLevelDisplay.textContent = level;
        finalStatsDisplay.innerHTML = `
            <li>点击伤害: ${totalClickDamage}</li>
            ${minionsState.map(minion => `<li>${minion.name}: ${minion.totalDamage}</li>`).join('')}
        `;
    }
}

function restartGame() {
    level = level +1;
    kmrHealthValue = 500000 * Math.pow(10,level);
    coins = 0;
    timePlayed = 0;
    //totalClickDamage = 0;
    //let rindex = 0;
    //let minionDamages = {};
    //let minionsState = [];
    //let unlockedMinions = [];
    victoryMessage.classList.add('hidden');
    updateDisplays();
    //initMinions(); // Initialize minions again after restarting game
}

function getattack(minion){
  let atk = minion.attack;
  for (let m of minionsState){
    if (m.name != minion.name && m.learnedSkills.includes("苦痛")){
      atk += parseInt(m.attack*0.8);
    }
  }
  if (minion.learnedSkills.includes("素质家族")){
    if (checkLuck(0.1)) {
      atk*=10;
      skilled = true;
      showSkillWord(minion, "素质家族");
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
    atk += parseInt(Math.pow(coins,0.8)/1000*minion.level);
  }
  return atk;
}


function checkLuck(r) {
  if (Math.random() < r) {
    for (let m of minionsState){
      if (m.learnedSkills.includes("运气不如他们") && r <= 0.2){
        showSkillWord(minion, "运气不如他们");
        raiseAtk(m,Math.max(4,parseInt(m.level/10)));
        document.getElementById(`attack-${unlockedMinions.indexOf(m.name)}`).textContent = m.attack;
      }
    }
    return true;
  } else {
    return false;
  }
}

function minionAttack(minion) {
    if (kmrHealthValue <= 0) return;
    skilled = false;
    let dam = getattack(minion)
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
    const hitSound = new Audio(minion.voice);
    hitSound.play();
    coins += minion.attack;

    if (minion.learnedSkills.includes("冲击冠军")){
      if (checkLuck(0.03)) {
        raiseAtk(minion,minion.level);
        skilled = true;
        document.getElementById(`attack-${unlockedMinions.indexOf(minion.name)}`).textContent = minion.attack;
        showSkillWord(minion, "冲击冠军");
      }
    }
    if (minion.learnedSkills.includes("我吃我吃")){
      if (checkLuck(0.06)) {
        skilled = true;
        minion.attack = parseInt(minion.attack*1.125)
        minion.attackSpeed = parseInt(minion.attackSpeed*1.1)
        document.getElementById(`attack-${unlockedMinions.indexOf(minion.name)}`).textContent = minion.attack;
        document.getElementById(`attack-speed-${unlockedMinions.indexOf(minion.name)}`).textContent = (minion.attackSpeed / 1000).toFixed(1)+"s";
        clearInterval(minion.intervalId)
        let intervalId = setInterval(() => minionAttack(minion), minion.attackSpeed);
        minion.intervalId = intervalId;
        showSkillWord(minion, "我吃我吃");
      }
    }
    if (minion.learnedSkills.includes("金牌陪练") && unlockedMinions.length > 1){
      if (checkLuck(0.12)) {
        skilled = true;
        let r = parseInt(Math.random()*(unlockedMinions.length - 1));
        if (r >= unlockedMinions.indexOf(minion.name)){
          r += 1;
        }
        raiseAtk(minionsState[r],parseInt(minion.attack/20));
        document.getElementById(`attack-${unlockedMinions.indexOf(minionsState[r].name)}`).textContent = minionsState[r].attack;
        showSkillWord(minion, "金牌陪练");
      }
    }
    if (minion.learnedSkills.includes("奶1")){
      if (checkLuck(0.33)) {
        skilled = true;
        coins += parseInt(Math.pow(minion.level,1.5));
        showSkillWord(minion, "奶1");
      }
    }
    for (let m of minionsState){
      if (m.name != minion.name && m.learnedSkills.includes("永失吾艾")){
        if (checkLuck(0.08)) {
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
          raiseAtk(m, parseInt(minion.attack*0.01));
          minionAttack(m);
          minionAttack(m);
          minionAttack(m);
          showSkillWord(m, "GN");
        }
      }
      if (m.name != minion.name && m.learnedSkills.includes("无尽连击")){
        m.attack += parseInt(m.addattack/2);
        fishTempAtk += parseInt(m.addattack/2);
        document.getElementById(`attack-${unlockedMinions.indexOf(m.name)}`).textContent = m.attack;
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
            <div>攻击: <span id="attack-${index}">${minion.attack}</span></div>
            <div>攻速: <span id="attack-speed-${index}">${(minion.attackSpeed / 1000).toFixed(1)}s</span></div>
            <button id="cost-${index}" onclick="upgradeMinion(${index})" >升级 (${mupgradeCost(minion)})</button>
        `;
        minionElement.addEventListener('click', () => {
            showMinionDetails(index);
        });
        minionsContainer.appendChild(minionElement);

    });

    document.getElementById(`unlockButton`).textContent = "抽取助战 (金币:" + unlockCost(unlockedMinions.length) +")";
}

function unlockCost(n) {
  if (minions.length == unlockedMinions.length){
    return 99999999;
  }
  return 9 + 12*n + 6*n*n + parseInt(2.5*Math.pow(n,3.25) + Math.pow(2.5,n));
}

function unlockRandMinion() {
    const uCost = unlockCost(unlockedMinions.length)
    if (coins >= uCost) {
      coins -= uCost;
        let r = parseInt(Math.random() * (minions.length - unlockedMinions.length));
        let restMinions = minions.filter((m) => !unlockedMinions.includes(m.name));
        unlockMinion(restMinions[r]);
        refMinions();
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
      <div>攻击: ${minion.attack}</div>
      <div>攻速: ${(minion.attackSpeed / 1000).toFixed(1)}s</div>
      <div>升级+攻击: ${minion.addattack}</div>
      <button onclick="upgradeMinion(${rindex})" >${code} (金币: ${mupgradeCost(minion)})</button>
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
    default:
      return skill.effect
  }

}
function mupgradeCost(minion){
  let cost = (minion.basecost + minion.level * minion.enhancecost + minion.level*minion.level * minion.supEnhancecost);
  cost = Math.pow(cost,1 + minion.level/10000)
  cost = parseInt(cost);
  for (let m of minionsState){
    if (m.learnedSkills.includes("白骨夫人")){
      cost = parseInt(0.8*cost)
    }
  }
  return cost;
}

function zeroCountDown(c) {
  for (let m of minionsState){
    if (m.learnedSkills.includes("电表白转")){
      let luck = 0.2 + 0.01*Math.min(20,parseInt(m.level/50));
      if (checkLuck(luck)){
        return parseInt(c/2);
      }
    }
  }
  return 0;
}
function updateCounts() {
  let need = false;
  for (let m of minionsState){
    if (m.learnedSkills.includes("五种打法")){
      burning ++;
      if (burning >= 20){
        burning = zeroCountDown(20);
        raiseAtk(m,5*unlockedMinions.length);
        need = true;
        showSkillWord(m, "五种打法");
      }
    }
    if (m.learnedSkills.includes("每日饼之诗")){
      if (!m.count){m.count = 0};
      m.count ++;
      if (m.count >= 60){
        m.count = zeroCountDown(60);
        for (let mi of minionsState){
          if (mi.name != m.name){
            raiseAtk(mi,parseInt(m.attack/40));
          }
        }
        showSkillWord(m, "每日饼之诗");
        need = true;
      }
    }
    if (m.learnedSkills.includes("罕见")){
      if (!m.count){m.count = 0};
      m.count ++;
      if (m.count >= 50){
        m.count = zeroCountDown(50);
        coins += parseInt(coins/10);
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
        m.attack -= fishTempAtk;
        m.attack = Math.max(0,m.attack);
        let luck = 0.05 + 0.01*parseInt(m.level/50);
        if (checkLuck(luck)){
          m.raiseAtk(attack,parseInt(fishTempAtk/10));
        }
        fishTempAtk = 0;
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
    if (m.learnedSkills.includes("龙之咆哮")){
      if (!m.count){m.count = 0};
      m.count ++;
      if (m.count >= 24){
        m.count = zeroCountDown(24);
        let dam = parseInt(2*m.attack*m.attackSpeed/1000);
        damageKmr(dam,m);
        showSkillWord(m, "龙之咆哮");
      }
    }
    if (m.learnedSkills.includes("一十九米肃清刀")){
      if (!m.count){m.count = 0};
      m.count ++;
      if (m.count >= 19){
        m.count = zeroCountDown(19);
        let dam = parseInt(m.attack*unlockedMinions.length);
        damageKmr(dam,m);
        showSkillWord(m, "一十九米肃清刀");
      }
    }
    if (m.learnedSkills.includes("次元超越")){
      let c = 30;
      c -= Math.max(0,Math.min(10,parseInt(m.level/100)));
      if (!m.count){m.count = 0};
      m.count ++;
      if (m.count >= c){
        m.count = zeroCountDown(c);
        for (let mi of minionsState){
          if (mi.name != m.name){
            minionAttack(mi);
          }
        }
        showSkillWord(m, "次元超越");
        need = true;
      }

    }
    if (need){
      updateDisplays();
    }
  }
}

function raiseAtk(minion,amount){
  minion.attack += amount;
  for (let m of minionsState){
    if (m.name != minion.name && m.learnedSkills.includes("上帝")){
      m.attack += Math.max(1,parseInt(amount*0.15));
      document.getElementById(`attack-${unlockedMinions.indexOf(m.name)}`).textContent = m.attack;
      showSkillWord(m, "上帝");
    }
  }
}

function autoupgradeMinion(){
  let enough = true;
  while (enough){
    for (let i = 0; i < unlockedMinions.length; i++){
      let enough = upgradeMinion(i,true);
      if (!enough){
        return;
      }
    }
  }
}
function upgradeMinion(index,auto) {
    burning = 0;
    const minion = minionsState[index];
    const upgradeCost = mupgradeCost(minion);
    if (coins >= upgradeCost) {
        coins -= upgradeCost;
        minion.level += 1;
        raiseAtk(minion,minion.addattack); // Increase attack by 2 for each level
        for (let m of minionsState){
          if (m.name != minion.name && m.learnedSkills.includes("构筑带师")){
            raiseAtk(minion,parseInt(m.attack/30));
            showSkillWord(m, "构筑带师");
          }
          if (minion.level%5 == 0 && minion.description.includes("🐷") && m.learnedSkills.includes("双猪的羁绊")){
            raiseAtk(minion,Math.pow(m.level,1.1));
            showSkillWord(m, "双猪的羁绊");
          }
        }
        for (let s of minion.skills){
          if (minion.level == s.level){
            minion.learnedSkills.push(s.name);
            if (s.name == "说书"){
              minion.attackSpeed -= 400;
              clearInterval(minion.intervalId)
              let intervalId = setInterval(() => minionAttack(minion), minion.attackSpeed);
              minion.intervalId = intervalId;
            }
            if (s.name == "鲁智深"){
              raiseAtk(minion,330);
            }
            if (s.name == "阴阳秘法"){
              for (let m of minionsState){
                raiseAtk(m,36);
              }
            }
          }
        }
        if (minion.learnedSkills.includes("虫虫咬他") && minion.level%2 == 1){
          showSkillWord(minion, "虫虫咬他");
          minion.addattack += 1;
        }
        document.getElementById(`level-${index}`).textContent = minion.level;
        document.getElementById(`attack-${index}`).textContent = minion.attack;
        document.getElementById(`attack-speed-${index}`).textContent = (minion.attackSpeed / 1000).toFixed(1)+"s";
        document.getElementById(`cost-${index}`).textContent = "升级 ("+mupgradeCost(minion)+")";

        updateDisplays();
        showMinionDetails(index);
        return true;
    } else {
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
    updateCounts();
    updateDisplays();
}, 1000);

kmr.addEventListener('click', clickKmr);
refMinions();
updateDisplays();
