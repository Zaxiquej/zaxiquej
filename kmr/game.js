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
    initMinions(); // Initialize minions again after restarting game
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
    }
  }
  if (minion.learnedSkills.includes("开播！")){
    atk += parseInt(Math.pow(coins,0.8)/1000*minion.level);
  }
  return atk;
}


function checkLuck(r) {
  if (Math.random() < r) {
    for (let m of minionsState){
      if (m.learnedSkills.includes("运气不如他们") && r <= 0.2){
        m.attack += 4;
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
        minion.attack += minion.level;
        document.getElementById(`attack-${unlockedMinions.indexOf(minion.name)}`).textContent = minion.attack;
      }
    }
    if (minion.learnedSkills.includes("我吃我吃")){
      if (checkLuck(0.06)) {
        minion.attack = parseInt(minion.attack*1.125)
        minion.attackSpeed = parseInt(minion.attackSpeed*1.1)
        document.getElementById(`attack-${unlockedMinions.indexOf(minion.name)}`).textContent = minion.attack;
        document.getElementById(`attack-speed-${unlockedMinions.indexOf(minion.name)}`).textContent = (minion.attackSpeed / 1000).toFixed(1)+"s";
        clearInterval(minion.intervalId)
        let intervalId = setInterval(() => minionAttack(minion), minion.attackSpeed);
        minion.intervalId = intervalId;
      }
    }
    if (minion.learnedSkills.includes("金牌陪练") && unlockedMinions.length > 1){
      if (checkLuck(0.12)) {
        let r = parseInt(Math.random()*(unlockedMinions.length - 1));
        if (r >= unlockedMinions.indexOf(minion.name)){
          r += 1;
        }
        minionsState[r].attack += parseInt(minion.attack/20);
        document.getElementById(`attack-${unlockedMinions.indexOf(minionsState[r].name)}`).textContent = minionsState[r].attack;
      }
    }
    if (minion.learnedSkills.includes("奶1")){
      if (checkLuck(0.33)) {
        coins += parseInt(Math.pow(minion.level,1.5));
      }
    }
    for (let m of minionsState){
      if (m.name != minion.name && m.learnedSkills.includes("永失吾艾")){
        if (checkLuck(0.08)) {
          minionAttack(m);
        }
      }
    }
    updateDisplays();
    checkVictory();
}

function refMinions() {
    const minionsContainer = document.getElementById('minions-container');
    minionsContainer.innerHTML = ''; // Clear existing minions

    minionsState.forEach((minion, index) => {
        const minionElement = document.createElement('div');
        minionElement.className = 'minion';
        minionElement.innerHTML = `
            <img src="${minion.image}" alt="${minion.name}">
            <div>${minion.name}</div>
            <div>等级: <span id="level-${index}">${minion.level}</span></div>
            <div>攻击: <span id="attack-${index}">${minion.attack}</span></div>
            <div>攻速: <span id="attack-speed-${index}">${(minion.attackSpeed / 1000).toFixed(1)}s</span></div>
            <button id="cost-${index}" onclick="upgradeMinion(${index})" >升级 (金币: ${mupgradeCost(minion)})</button>
        `;
        minionElement.addEventListener('click', () => {
            showMinionDetails(index);
        });
        minionsContainer.appendChild(minionElement);

    });

    const minionElement = document.createElement('div');
    minionElement.innerHTML = `
        <button onclick="unlockRandMinion(${rindex})" >抽取助战 (金币: ${unlockCost(unlockedMinions.length)})</button>
    `;
    minionsContainer.appendChild(minionElement);
}

function unlockCost(n) {
  if (minions.length == unlockedMinions.length){
    return 99999999;
  }
  return 9 + 12*n + 6*n*n + parseInt(2*Math.pow(n,3.25) + Math.pow(2.5,n));
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
        alert('金币不足!');
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
          ${minion.skills.map(skill => `<li>等级 ${skill.level}: ${skill.name} - ${skill.effect}</li>`).join('')}
      </ul>
  `;
}

function mupgradeCost(minion){
  let cost = parseInt(minion.basecost + minion.level * minion.enhancecost + minion.level*minion.level * minion.supEnhancecost);
  for (let m of minionsState){
    if (m.learnedSkills.includes("白骨夫人")){
      cost = parseInt(0.8*cost)
    }
  }
  return cost;
}

function updateCounts() {
  for (let m of minionsState){
    if (m.learnedSkills.includes("五种打法")){
      burning ++;
      if (burning >= 20){
        burning = 0;
        m.attack += 5*unlockedMinions.length;
        updateDisplays();
      }
    }
    if (m.learnedSkills.includes("每日饼之诗")){
      if (!m.count){m.count = 0};
      m.count ++;
      if (m.count >= 60){
        m.count = 0;
        for (let mi of minionsState){
          if (mi.name != m.name){
            mi.attack += parseInt(m.attack/40);
          }
        }
        updateDisplays();
      }
    }
    if (m.learnedSkills.includes("猪之力")){
      if (!m.count){m.count = 0};
      m.count ++;
      if (m.count >= 24){
        let dam = parseInt(m.attack*m.attackSpeed/1000);
        damageKmr(dam,m);
        updateDisplays();
      }
    }
    if (m.learnedSkills.includes("次元超越")){
      if (!m.count){m.count = 0};
      m.count ++;
      if (m.count >= 30){
        m.count = 0;
        for (let mi of minionsState){
          if (mi.name != m.name){
            minionAttack(mi);
          }
        }
        updateDisplays();
      }
    }
  }
}
function upgradeMinion(index) {
    burning = 0;
    const minion = minionsState[index];
    const upgradeCost = mupgradeCost(minion);
    if (coins >= upgradeCost) {
        coins -= upgradeCost;
        minion.level += 1;
        minion.attack += minion.addattack; // Increase attack by 2 for each level
        for (let m of minionsState){
          if (m.name != minion.name && m.learnedSkills.includes("构筑带师")){
            minion.attack += parseInt(m.attack/30);
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
              minion.attack += 280;
            }
            if (s.name == "阴阳秘法"){
              for (let m of minionsState){
                m.attack += 27;
              }
            }
          }
        }
        document.getElementById(`level-${index}`).textContent = minion.level;
        document.getElementById(`attack-${index}`).textContent = minion.attack;
        document.getElementById(`attack-speed-${index}`).textContent = (minion.attackSpeed / 1000).toFixed(1)+"s";
        document.getElementById(`cost-${index}`).textContent = "升级 (金币: "+mupgradeCost(minion);

        updateDisplays();
        showMinionDetails(index);
    } else {
        alert('金币不足!');
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
