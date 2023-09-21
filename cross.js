// 获取DOM元素
const startBox = document.getElementById('startBox');
const gameBox = document.getElementById('gameBox');
const randomSeedButton = document.getElementById('randomSeedButton');
const seedInput = document.getElementById('seedInput');
const useSeedButton = document.getElementById('useSeedButton');
const fourButton = document.getElementById('fourButton');
const buttons = document.getElementById('buttons');
const stepCounter = document.getElementById('stepCounter');
const stepCount = document.getElementById('stepCount');
const options = document.getElementById('options');
const elementsDiv = document.getElementById('elementsDiv');

const suggestionsDiv = document.getElementById('suggestions');
let gradientColor = "lightblue"; // 这里可以根据需要设置默认的渐变颜色

// 全局变量，用于跟踪已有外框的图片信息
let highlightedCards = [];
let outedCards = [];

let cardPool = cardData;//.concat(subCardData.filter(card => card.card_id < 200000000))

let currentSeed = '';
let cardSets = [];
let ruleSets = [];
let num = 5;
let isGameOver = false; // 用于标记游戏是否结束

// 初始化游戏界面
function initGame() {
    startBox.classList.remove('hidden');
    result.classList.add('hidden');
    result.innerHTML = '';
    elementsDiv.innerHTML = '';
    cardSets = [];
    ruleSets = [];
    highlightedCards = [];
    outedCards = [];
}

// 生成今日谜题种子
function generateTodaySeed() {
    const currentDateSeed = generateCurrentDateSeed();
    seedInput.value = currentDateSeed;
    currentSeed = currentDateSeed;
}

// 生成种子按钮点击事件
randomSeedButton.addEventListener('click', generateTodaySeed);

// 使用种子按钮点击事件
useSeedButton.addEventListener('click', () => {
    const enteredSeed = seedInput.value.trim();
    if (enteredSeed) {
        currentSeed = enteredSeed;
    }
    if (currentSeed === "") {
      alert("请输入种子或点击随机种子按钮获取随机种子！");
      return;
    }
    startGame();
});

fourButton.addEventListener('click', () => {
    checkFour();
});

function arrayMatch(arr1, arr2) {
  // 如果数组长度不相等，直接返回 false
  if (arr1.length !== arr2.length) {
    return false;
  }

  // 创建一个临时数组，用于存放已经匹配的元素
  const matchedIndexes = new Array(arr1.length).fill(false);

  // 遍历 arr1 中的元素
  for (let i = 0; i < arr1.length; i++) {
    const element1 = arr1[i];
    const index2 = arr2.indexOf(element1);

    // 如果找到了匹配的元素且未被匹配过，标记为已匹配
    if (index2 !== -1 && !matchedIndexes[index2]) {
      matchedIndexes[index2] = true;
    } else {
      // 如果没有匹配或已经被匹配过，返回 false
      return false;
    }
  }

  // 如果所有元素都匹配了，返回 true
  return matchedIndexes.every(matched => matched);
}

// 创建函数，将所有highlight的cardContainer去除highlight，添加由内向外的渐变背景
function removeHighlightAndChangeBackground() {
  // 获取所有拥有 highlight 类的元素
  const highlightedElements = document.querySelectorAll('.highlight');

  // 遍历所有拥有 highlight 类的元素
  highlightedElements.forEach(element => {
    const imageElement = element.querySelector('.image'); // 获取内部的 .image 元素

    // 取消 .image 元素的点击效果
    if (imageElement) {
      imageElement.style.pointerEvents = 'none';
    }

    // 添加由内向外的渐变背景，调整颜色停止位置来控制深浅
    element.style.background = `radial-gradient(circle, ${gradientColor} 20%, transparent 100%)`;

    // 移除所有元素的 highlight 类
    element.classList.remove('highlight');
  });
}


// 创建函数，在 result 中插入一行字，带浅绿色的渐变背景
function insertTextWithGradientBackground(text, startColor, endColor) {
  // 创建包含文字的元素
  const textElement = document.createElement('div');
  textElement.textContent = text;
  textElement.classList.add('gradient-text'); // 添加样式类

  // 使用指定的渐变颜色
  textElement.style.background = `linear-gradient(to right, ${startColor}, ${endColor})`;

  // 将元素插入到 result 容器中
  result.appendChild(textElement);
}

Element.prototype.insertAfter = function(newElement, targetElement) {
  const parentElement = targetElement.parentNode;

  if (targetElement === parentElement.lastChild) {
    parentElement.appendChild(newElement);
  } else {
    parentElement.insertBefore(newElement, targetElement.nextSibling);
  }
};

function swapDivs(div1, div2) {
  if (div1 == div2){
    return;
  }

  //console.log(div1,div2)
  const parent1 = div1.parentElement;
  const parent2 = div2.parentElement;

  if (div1 == div2.previousSibling){
    parent1.insertBefore(div2, div1);
    return;
  }
  if (div2 == div1.previousSibling){
    parent1.insertBefore(div1, div2);
    return;
  }

  let isLast = false;
  let neighbor2 = div2.nextSibling;
  if (!neighbor2){
    isLast = true;
    neighbor2 = div2.previousSibling;
  }
  //console.log(isLast,neighbor2)

  // 交换两个 div 的位置
  parent1.insertBefore(div2, div1);
  if (!isLast) {
    parent2.insertBefore(div1, neighbor2);
  } else {
    parent2.insertAfter(div1, neighbor2);
  }
}
function checkFour(){
  if (highlightedCards.length < num){
    return;
  }
  const matchingIndex = cardSets.findIndex(set => arrayMatch(set, highlightedCards));
  let cardNames = highlightedCards.map(card => card.card_name);
  if (matchingIndex != -1){
    colors = ["#00CC00","#00CCCC","#CCCC00","#CC0000","#CC00CC"];
    gradientColor = colors[matchingIndex];
    for (let i = 0; i < num; i++){
      let elem1 = Array.from(document.querySelectorAll('.highlight')).filter(elem => {
        const anchorElement = elem.querySelector('a');
        return anchorElement && anchorElement.textContent === highlightedCards[i].card_name;
      })[0];
      //console.log(elementsDiv.children[0].innerText)
      let elem2 = elementsDiv.children[matchingIndex].children[i];
      swapDivs(elem1,elem2)
    }
    removeHighlightAndChangeBackground();
    gradientColor = "green";
    for (let c of highlightedCards){
      outedCards.push(c);
    }
    highlightedCards = [];
    if (ruleSets[matchingIndex].stRand != undefined){
      insertTextWithGradientBackground("连线成功："+cardNames.join('、')+"（"+ruleSets[matchingIndex].title+"："+ruleSets[matchingIndex].stRand+"）。","#ffffff","#00ff00");
    } else {
      insertTextWithGradientBackground("连线成功："+cardNames.join('、')+"（"+ruleSets[matchingIndex].title+"）。","#ffffff","#00ff00");
    }

    if (outedCards.length == num * num) {
        insertTextWithGradientBackground("游戏结束，你胜利了！","#ffffff","#ffff00");
        const restartButton = document.createElement('button');
        restartButton.textContent = '重新开始';
        restartButton.id = 'restartButton'; // 设置按钮的 id
        restartButton.addEventListener('click', () => {
          gameBox.style.display = "none";
            initGame();
        });
        result.appendChild(restartButton);
    }
  } else {
    gradientColor = "red";
    insertTextWithGradientBackground("连线失败："+cardNames.join('、')+"。","#ffffff","#ff0000");
  }
}


// 创建包含卡片信息的容器
function createCardContainer(card, isMini) {
    const cardContainer = document.createElement('div');
    if (isMini){
      cardContainer.classList.add('mini-card-container');
    } else {
      cardContainer.classList.add('card-container');
    }


    // 创建图片元素
    const cardImage = document.createElement('img');
    cardImage.src = `https://shadowverse-portal.com/image/card/phase2/common/C/C_${card.card_id}.png`;
    cardImage.alt = card.card_name;

    // 创建超链接元素
    const cardLink = document.createElement('a');
    cardLink.href = `https://shadowverse-portal.com/card/${card.card_id}?lang=zh-tw`;
    cardLink.target = '_blank';
    cardLink.textContent = card.card_name;

    // 添加点击事件监听器
    cardImage.addEventListener('click', () => {
      // 判断是否已经有外框
      if (!outedCards.includes(card)){
        if (cardContainer.classList.contains('highlight')) {
          // 移除外框
          cardContainer.classList.remove('highlight');
          // 从全局变量中移除卡片信息
          const index = highlightedCards.indexOf(card);
          if (index !== -1) {
            highlightedCards.splice(index, 1);
          }
        } else if (highlightedCards.length < num) {
          // 添加外框，但最多只能有五个
          cardContainer.classList.add('highlight');
          // 将卡片信息添加到全局变量
          highlightedCards.push(card);
        }
      }

    });

    // 将图片和超链接添加到容器中
    cardContainer.appendChild(cardImage);
    cardContainer.appendChild(cardLink);
    cardContainer.card = card;

    return cardContainer;
}

// 开始游戏函数
function startGame() {
    const difficultySelect = document.getElementById('difficultySelect');
    const selectedDifficulty = difficultySelect.value;
    // 根据选择的难度设置投骰子效果
    num = 3;
    if (selectedDifficulty === 'medium') {
      num = 4;
    } else if (selectedDifficulty === 'hard') {
      num = 5;
    }
    startBox.classList.add('hidden');
    buttons.classList.remove('hidden');
    gameBox.style.display = "block";
    result.classList.remove('hidden');
    document.getElementById("cSeed").style.display = "block";
    document.getElementById("currentSeed").textContent = `当前种子：${currentSeed}`;
    // Update the "currentSeed" element with the current seed value
    if (num == 3) {
      var strongElement = document.createElement("p");
      strongElement.textContent = "（简单）";
      strongElement.style.display = "inline"; // 设置为内联元素
      document.getElementById("currentSeed").appendChild(strongElement);
      Math.seedrandom(currentSeed+"1");
    }
    if (num == 4) {
      var strongElement = document.createElement("strong");
      strongElement.textContent = "（标准）";
      document.getElementById("currentSeed").appendChild(strongElement);
      Math.seedrandom(currentSeed+"2");
    }
    if (num == 5) {
      var strongElement = document.createElement("strong");
      strongElement.textContent = "（困难）";
      strongElement.style.color = "red"; // 设置文本颜色为红色
      strongElement.style.fontSize = "larger"; // 设置字号为较大
      document.getElementById("currentSeed").appendChild(strongElement);
      Math.seedrandom(currentSeed+"3");
    }


    // 生成初始选项
    generateSets();

    drawSets();
}

function generateCurrentDateSeed() {
  const now = new Date();

  // 转换为北京时间
  now.setHours(now.getHours() + 8);

  const year = now.getUTCFullYear().toString();
  const month = (now.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = now.getUTCDate().toString().padStart(2, '0');

  // 组合日期
  const dateSeed = year + month + day + "P";

  // 使用 dateSeed 作为种子生成随机数
  Math.seedrandom(dateSeed);

  // 生成8位英文字母种子
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let seed = '';
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * letters.length);
    seed += letters[randomIndex];
  }

  return seed;
}

function findCardByIdR(id) {
  return cardPool.find((card) => card.card_id === id);
}

function findCardByName(name) {
    return cardPool.find((card) => card.card_name === name);
}

function strangeEvo(card,rand){
  if (rand[0] == "eq" && card.evo_atk - card.atk != rand[1]){
    return false;
  }
  if (rand[2] == "eq" && card.evo_life - card.life != rand[3]){
    return false;
  }
  if (rand[0] == "ge" && card.evo_atk - card.atk < rand[1]){
    return false;
  }
  if (rand[2] == "ge" && card.evo_life - card.life < rand[3]){
    return false;
  }
  if (rand[0] == "le" && card.evo_atk - card.atk > rand[1]){
    return false;
  }
  if (rand[2] == "le" && card.evo_life - card.life > rand[3]){
    return false;
  }
  return true;
}

function getTrueDesc(card){
  return (card.skill_disc + card.evo_skill_disc).replaceAll("与进化前能力相同。（入场曲 能力除外）","").replaceAll("与进化前能力相同。","");
}

function minorCard(item1){
  var skillArray = item1.skill.split(",");

  for (var i = 0; i < skillArray.length; i++) {
    if (skillArray[i] === "transform") {
      return findCardById(parseInt(skillArray[i].split("=")[1]),true);
    }
  }
}

function fixeduseKey(key,card,val){
  if (!card || !card.skill){
    return false;
  }
  for (let i = 0; i < card.skill.split(",").length; i++){
    if (card.skill.split(",")[i] == "pp_fixeduse" && card.timing.split(",")[i].includes(key) && card.skill_option.split(",")[i].split("=")[1] == val){
      return true;
    }
  }
  return false;
}


function findKey(key,card,val){
  if (!card || !card.skill){
    return false;
  }
  let key2;
  if (key == "heal"){
    key2 = "healing";
  } else {
    key2 = key;
  }
  for (let i = 0; i < card.skill.split(",").length; i++){
    if (card.skill.split(",")[i] == key && card.skill_option.split(",")[i].includes(key2+"="+val)){
      return true;
    }
  }
  return false;
}
function hasSubName(currentCard){
  for (let j = 0; j < cardData.length; j++) {
    const otherCard = cardData[j];

    // 检查是否两者的 .card_name 包含相同内容且 .clan 不同
    if (currentCard.card_name.includes(otherCard.card_name) && currentCard.clan !== otherCard.clan) {
      return true;
    }
  }
  return false; // 在循环结束后返回 false
}


function matchKey(key,card,val){
  if (!card || !card.skill){
    return false;
  }
  for (let i = 0; i < card.skill.split(",").length; i++){
    if (card.skill.split(",")[i] == key && val.exec(card.skill_target.split(",")[i])){
      return true;
    }
  }
  return false;
}

function mustSelect(card,goal){
  let me = 0;
  let op = 0;
  let num = 0;
  for (let i = 0; i < card.skill.split(",").length; i++){
    if (card.timing.split(",")[i] == "when_play" && card.skill_target.split(",")[i].includes("select_count=")){
      let elems = card.skill_target.split(",")[i].split("&");
      if (elems.includes("character=me")){
        me+=1;
      }
      if (elems.includes("character=op")){
        op+=1;
      }
    }
  }
  if (goal = "me1op1"){
    return me >= 1 && op >= 1;
  }
  return false;
}
const soundDataMap = new Map(soundData.map(card => [card.id, card]));
const flavorDataMap = new Map(cvloreData.map(card => [card.card_id, card]));

function hasVoiceInteract(item1) {
  const id1 = item1.card_id;
  const voiceInfo = soundDataMap.get(""+id1);

  if (!voiceInfo) {
    return false;
  }

  const voices = voiceInfo.sound[0].split(",");
  return voices.some(voice => voice.includes("_7_") || voice.includes("_8_"));
}

function hasCV(item1,cv) {
  const id1 = item1.card_id;
  const cvInfo = flavorDataMap.get(id1);

  if (cvInfo && cvInfo.cv){
    return cvInfo.cv.split("/").includes(cv);
  }
  return false;
}

function hasFlavor(item1) {
  if (item1.char_type != 1){
    return;
  }
  const id1 = item1.card_id;
  let regex = /<br>──(.*?)<br>|<br>──(.*?)$/g;
  for (let card of cvloreData){
    let r1 = regex.exec(card.description);
    let r2 = regex.exec(card.evo_description);
    if (r1 && r1.some(des => des && des.split("与").includes(item1.card_name) || des == item1.card_name)){
      return true;
    }
    if (r2 && r2.some(des => des && des.split("与").includes(item1.card_name) || des == item1.card_name)){
      return true;
    }
  }
  return false;
}



function hasSPEvolveVoice(item1) {
  const id1 = item1.card_id;
  const voiceInfo = soundDataMap.get(""+id1);

  if (!voiceInfo) {
    return false;
  }
  const voices = voiceInfo.sound;
  return voices.some(voiceStr => voiceStr.split(",").some(voice => voice.includes("evo")));
}

function hasEHEvolveVoice(item1) {
  const id1 = item1.card_id;
  const voiceInfo = soundDataMap.get(""+id1);

  if (!voiceInfo) {
    return false;
  }
  const voices = voiceInfo.sound[0].split(",");
  return voices.some(voice => voice.includes("enh"));
}

function isSubArray(mainArray, subArray) {
  const mainCount = {}; // 用于存储主数组元素的计数
  if (!mainArray){
    return false;
  }

  // 遍历主数组，统计每个元素的数量
  for (const element of mainArray) {
    mainCount[element] = (mainCount[element] || 0) + 1;
  }

  // 遍历子数组，逐一减少主数组中对应元素的数量
  for (const element of subArray) {
    if (!mainCount[element]) {
      return false; // 子数组中有主数组没有的元素，返回 false
    }
    mainCount[element]--;
  }

  return true; // 子数组中的元素都在主数组中
}

function uniqueStats(item1) {
  if (item1.char_type != 1){
    return;
  }
  for (let card of cardData){
    if (card.char_type != 1 || card.card_id == item1.card_id){
      continue;
    }
    if (card.atk == item1.atk && card.life == item1.life && card.cost == item1.cost){
      return false;
    }
  }
  return true;
}


function isNToken(item1) {
  const id1 = item1.card_id;
  return cardData.some(card => !item1.skill_option.includes(card.base_card_id) && ((card.skill_option.includes("="+id1) || card.skill_option.includes("&"+id1)) || (minorCard(card) && (minorCard(card).skill_option.includes("="+id1) || minorCard(card).skill_option.includes(":"+id1)))));
}

function hasDiffer(item1) {
  const id1 = item1.card_id;
  return subCardData.some(card => card.card_id >= 700000000 && card.base_card_id == id1 && card.skill == item1.skill  && card.atk == item1.atk && card.cost == item1.cost);
}

function hasReprint(item1) {
  const id1 = item1.card_id;
  return subCardData.some(card => card.card_id < 200000000 && card.base_card_id == id1 && card.skill == item1.skill);
}

function evaRand(rule){
  let rd = rule.rand;
  let rdVal;
  switch (rd[0]){
    case 'num':
      rdVal = rd[1] + Math.floor(Math.random() * (rd[2]-rd[1]));
      rule.stRand = rdVal;
      return rdVal;
    case 'numRange':
      rdVal = rd[1] + Math.floor(Math.random() * (rd[2]-rd[1]));
      rule.stRand = rd[3][rdVal-rd[1]];
      return rdVal;
    case 'key':
      rdVal = Math.floor(Math.random() * (rd[1].length));
      rule.stRand = rd[2][rdVal];
      return rd[1][rdVal];
    case 'str':
      rdVal = Math.floor(Math.random() * (rd[1].length));
      rule.stRand = rd[1][rdVal];
      return rd[1][rdVal];
    default:
      return;
  }
}

Array.prototype.remove = function(elem) {
  let index = this.indexOf(elem);
  if (index > -1) {
    this.splice(index, 1);
  }
};

function generateSets(){
  let rCardPools = [];
  cardSets = [];
  for (let i = 0; i < num; i++){
    cardSets.push([]);
    rCardPools.push([]);
  }
  let rules = [];
  let tempCardPool = cardPool.slice();
  let rand;
  let p = 0;
  while (p < 1 && !(rCardPools.every(arr => arr.length >= num))){
    let tpLow = lowRules.slice();
    let tpHigh = highRules.slice();
    for (let i = 0; i < 2; i++){
      rules[i] = tpLow[Math.floor(Math.random() * tpLow.length)];
      tpLow.remove(rules[i]);
    }
    for (let i = 2; i < num; i++){
      rules[i] = tpHigh[Math.floor(Math.random() * tpHigh.length)];
      tpHigh.remove(rules[i]);
    }
    let ros = [];
    for (let i = 0; i < num; i++){
       ros[i] = rules[i].operation.replaceAll("rand","rands["+i+"]");
    }
    let rands = [];
    for (let i = 0; i < num; i++){
       rands[i] = evaRand(rules[i]);
    }
    console.log(rules[0],rules[1],rules[2],rules[3],rules[4])
    for (let i = 0; i < num; i++){
      rCardPools[i] = tempCardPool.slice();
      for (let j = 0; j < num; j++){
        if (i == j){
          rCardPools[i] = rCardPools[i].filter(card => eval(ros[j]))
        } else {
          rCardPools[i] = rCardPools[i].filter(card => !eval(ros[j]))
        }
      }
    }
    console.log(rCardPools[0],rCardPools[1],rCardPools[2],rCardPools[3],rCardPools[4])
  }
  for (let i = 0; i < num; i++){
     ruleSets.push(rules[i]);
  }

  for (let i = 0; i < num; i++){
    for (let j = 0; j < num; j++){
      let card = rCardPools[j][Math.floor(Math.random() * rCardPools[j].length)];
      rCardPools[j].remove(card);
      cardSets[j].push(card);
    }
  }
  //console.log(cardSets)
}

function drawSets(){
  // 复制 cardSets 到 disCardSets
  const disCardSets = cardSets.map(row => [...row]);
  // Fisher-Yates 洗牌算法
  for (let i = disCardSets.length - 1; i > 0; i--) {
    for (let j = disCardSets[i].length - 1; j > 0; j--) {
      const ri = Math.floor(Math.random() * (i + 1));
      const rj = Math.floor(Math.random() * (j + 1));
      [disCardSets[i][j], disCardSets[ri][rj]] = [disCardSets[ri][rj], disCardSets[i][j]];
    }
  }

  for (let i = 0; i < num; i++) {
    const rowContainer = document.createElement('div');
    rowContainer.classList.add('row');

    for (let j = 0; j < num; j++) {
      const cardContainer = createCardContainer(disCardSets[i][j], true);
      rowContainer.appendChild(cardContainer);
    }

    elementsDiv.appendChild(rowContainer);

    //const lineBreak = document.createElement('br');
    //elementsDiv.appendChild(lineBreak);
  }
}

function countCVStrings(cvloreData) {
  const stringCountMap = new Map();

  // 遍历 cvloreData
  cvloreData.forEach(item => {
    const cvs = item.cv.split("/");

    // 遍历每个 cv
    cvs.forEach(cv => {
      // 统计每个字符串的出现次数
      if (stringCountMap.has(cv)) {
        stringCountMap.set(cv, stringCountMap.get(cv) + 1);
      } else {
        stringCountMap.set(cv, 1);
      }
    });
  });

  // 过滤使用次数在 7 到 1000 之间的字符串
  const filteredStrings = Array.from(stringCountMap.entries())
    .filter(([_, count]) => count >= 7 && count <= 1000)
    .sort((a, b) => b[1] - a[1]);

  // 将结果拆分为两个数组
  const strings = filteredStrings.map(([string, _]) => string);
  const counts = filteredStrings.map(([_, count]) => count);

  return [strings, counts];
}
