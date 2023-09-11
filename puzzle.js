// 获取DOM元素
const startBox = document.getElementById('startBox');
const gameBox = document.getElementById('gameBox');
const randomSeedButton = document.getElementById('randomSeedButton');
const seedInput = document.getElementById('seedInput');
const useSeedButton = document.getElementById('useSeedButton');
const reverseButton = document.getElementById('reverseButton');
const buttons = document.getElementById('buttons');
const stepCounter = document.getElementById('stepCounter');
const stepCount = document.getElementById('stepCount');
const options = document.getElementById('options');
const path = document.getElementById('path');
const result = document.getElementById('result');
const suggestionsDiv = document.getElementById('suggestions');

let cardPool = cardData.concat(subCardData.filter(card => card.card_id < 200000000))

let currentSeed = '';
let startCard;
let endCard;
let answer;
let currentStCard; // 新增：用于记录当前卡片
let currentEdCard; // 新增：用于记录当前卡片
let currentCardelems = [];
let direction = 1; //顺推
let questionMark = 0;
let isGameOver = false; // 用于标记游戏是否结束

// 初始化游戏界面
function initGame() {
    startBox.classList.remove('hidden');
    result.classList.add('hidden');
    path.innerHTML = ''; // 清空路径信息
    currentCardelems = [];
    direction = 1; //顺推
    answer = undefined;
    //document.getElementById("bestMove").textContent = `最佳步数：计算中`;

    // 初始时，当前卡片为起始卡
    currentStCard = startCard;
    currentEdCard = endCard;
}

// 生成随机的3个选项按钮
//,5
function generateRandomOptions() {
    options.innerHTML = '';
    for (let i of [0,1,4,6]) {
        let buttonInfo = buttonInfoArray[i];
        const button = createOptionButton(buttonInfo);
        options.appendChild(button);
    }
}

function createOptionButton(buttonInfo) {
    const { title, content, bgColor, operation } = buttonInfo;
    const button = new CustomButton(title, content, bgColor, () => generateRelatedCardButtons(operation));
    return button.getButtonElement();
}

Element.prototype.insertAfter = function(newElement, targetElement) {
  const parentElement = targetElement.parentNode;

  if (targetElement === parentElement.lastChild) {
    parentElement.appendChild(newElement);
  } else {
    parentElement.insertBefore(newElement, targetElement.nextSibling);
  }
};
// 更新路径信息
function updatePath(selectedCard) {
  if (direction == 1){
    currentStCard = selectedCard;
  } else {
    currentEdCard = selectedCard;
  }

    const arrow = document.createElement('div');
    arrow.classList.add('arrow');
    arrow.textContent = '→';
    if (direction == 1){
      if (currentStCard === currentEdCard) {
          path.removeChild(questionMark);
      } else {
        const newCardContainer = createCardContainer(currentStCard, true);
        const arrow = document.createElement('div');
        arrow.classList.add('arrow');
        arrow.textContent = '→';
        path.insertBefore(newCardContainer,questionMark);
        path.insertBefore(arrow,questionMark);
        currentCardelems[direction].classList.remove("highlight");
        currentCardelems[direction] = newCardContainer;
        currentCardelems[direction].classList.add("highlight");
      }
    } else {
      if (currentStCard === currentEdCard) {
          path.removeChild(questionMark);
      } else {
        const newCardContainer = createCardContainer(currentEdCard, true);
        const arrow = document.createElement('div');
        arrow.classList.add('arrow');
        arrow.textContent = '→';
        path.insertAfter(arrow,questionMark);
        path.insertAfter(newCardContainer,questionMark);
        currentCardelems[direction].classList.remove("highlight");
        currentCardelems[direction] = newCardContainer;
        currentCardelems[direction].classList.add("highlight");
      }
    }
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

reverseButton.addEventListener('click', () => {
    flipDirection();
});

function flipDirection(){
  if (direction == 1){
    currentCardelems[direction].classList.remove("highlight");
    direction = 0;
    currentCardelems[direction].classList.add("highlight");
  } else {
    currentCardelems[direction].classList.remove("highlight");
    direction = 1;
    currentCardelems[direction].classList.add("highlight");
  }
  suggestionsDiv.innerHTML = '';
}

undoButton.addEventListener('click', () => {
    undoDirection();
});

function undoDirection(){
  if (direction == 1){
    if (currentStCard.special){
      alert("你不可以撤回起始卡！")
      return;
    }
    currentCardelems[direction] = currentCardelems[direction].previousSibling.previousSibling;
    currentStCard = currentCardelems[direction].card;
    currentCardelems[direction].classList.add("highlight");
    path.removeChild(currentCardelems[direction].nextSibling);
    path.removeChild(currentCardelems[direction].nextSibling);
    const currentStep = parseInt(stepCount.textContent) - 1;
    stepCount.textContent = currentStep;
  } else {
    if (currentEdCard.special){
      alert("你不可以撤回终止卡！")
      return;
    }
    currentCardelems[direction] = currentCardelems[direction].nextSibling.nextSibling;
    currentEdCard = currentCardelems[direction].card;
    currentCardelems[direction].classList.add("highlight");
    path.removeChild(currentCardelems[direction].previousSibling);
    path.removeChild(currentCardelems[direction].previousSibling);
    const currentStep = parseInt(stepCount.textContent) - 1;
    stepCount.textContent = currentStep;
  }
  suggestionsDiv.innerHTML = '';
}

//calcButton.addEventListener('click', () => {
//    findAndSetBestMove(startCard,endCard);
//});

function findAndSetBestMove(startCard, endCard) {
  // 创建一个新的Worker实例
  answer = findShortestPath(startCard,endCard);
  if (answer){
    const bestMoveText = `最佳步数：${answer.length - 1}`;
    document.getElementById("bestMove").textContent = bestMoveText;
  } else {
    const bestMoveText = `最佳步数：无解`;
    document.getElementById("bestMove").textContent = bestMoveText;
  }

}

function findShortestPath(startCard, endCard) {
  const visited = new Set();
  const queue = [[startCard]];

  while (queue.length > 0) {
      const path = queue.shift();
      const currentCard = path[path.length - 1];

      if (currentCard === endCard) {
        //console.log(path)
          return path; // 找到最短路径，使用 resolve 返回结果
      }

      if (!visited.has(currentCard)) {
          visited.add(currentCard);

          // 获取当前卡片的相关卡片，这里需要根据您的实际需求获取相关卡片
          const relatedCards = getRelatedCards("同一卡包同职业", currentCard).concat(getRelatedCards("衍生或被衍生", currentCard)).concat(getRelatedCards("重印", currentCard)).concat(getRelatedCards("特殊身材", currentCard)); // 自定义函数

          for (const relatedCard of relatedCards) {
              if (!visited.has(relatedCard)) {
                  const newPath = [...path, relatedCard];
                  queue.push(newPath);
              }
          }
      }
  }
}

function minorToken(item1,item2){
  var skillArray = item1.skill.split(",");
  var skillOArray = item1.skill_option.split(",");

  for (var i = 0; i < skillArray.length; i++) {
    if (skillArray[i] === "transform") {
      if (skillOArray[i].includes(item2.card_id)) {
        return true;
      }
    }
  }
}

function unOutable(card){
  return card.clan == 6 && card.card_set_id == 10019; //十天鬼
  return card.clan == 0 && card.card_set_id == 10022; //中立
  return false;
}

function getRelatedCards(operation,currentCard) {
  if (!currentCard){
    if (direction == 1){
      currentCard = currentStCard;
    } else {
      currentCard = currentEdCard;
    }
  }
    switch (operation) {
        case '同一卡包同职业':
            return cardPool.filter(card => currentCard.card_set_id != 90000 && card.card_set_id === currentCard.card_set_id && card.clan === currentCard.clan && card.card_id !== currentCard.card_id);
        case '衍生或被衍生':
            return cardPool.filter(card => (card.skill_option.includes(currentCard.card_id) || card.skill_target.includes(currentCard.card_id)) || (currentCard.skill_option.includes(card.card_id) || currentCard.skill_target.includes(card.card_id) || minorToken(card,currentCard) || minorToken(currentCard,card)) && card.card_id !== currentCard.card_id);
        case '同身材稀有度':
            return cardPool.filter(card => card.char_type == 1 && currentCard.char_type == 1 && card.atk == currentCard.atk && card.life == currentCard.life && card.cost == currentCard.cost && card.rarity == currentCard.rarity && card.card_id !== currentCard.card_id);
        case '描述相似过75':
            return cardPool.filter(card => (getTrueDesc(card) == "" && getTrueDesc(currentCard) == "") || calculateLevenshteinDistance(getTrueDesc(card),getTrueDesc(currentCard)) < Math.min(getTrueDesc(card).length,getTrueDesc(currentCard).length) * 0.25);
        case '技能相似过75':
            return cardPool.filter(card => (calculateSkillScore(card,currentCard) >= 75 && card.card_id !== currentCard.card_id) );
        case '特殊身材':
            let pool = cardPool.filter(card => card.char_type == 1 && currentCard.char_type == 1 && card.atk == currentCard.atk && card.life == currentCard.life && card.cost == currentCard.cost && card.card_id !== currentCard.card_id);
            console.log(pool)
            return pool//.length > 20 ? [] : pool;
        default:
            return [];
    }
}

// 生成随机的起始卡和终止卡
function generateRandomStartEndCards(seed) {
    // 使用种子生成随机数
    Math.seedrandom(seed);

    let fcardPool = cardPool//.filter(card => card && card.clan == 0);
    const startIndex = Math.floor(Math.random() * fcardPool.length);
    while (unOutable(fcardPool[startIndex]) ){
        startIndex = Math.floor(Math.random() * fcardPool.length);
    }
    let endIndex = Math.floor(Math.random() * fcardPool.length);

    while (endIndex === startIndex || unOutable(fcardPool[endIndex])) {
        endIndex = Math.floor(Math.random() * fcardPool.length);
    }

    startCard = fcardPool[startIndex];
    endCard = fcardPool[endIndex];
    startCard.special = true;
    endCard.special = true;

    // 显示起始卡和终止卡信息
    const startCardContainer = createCardContainer(startCard, false);
    const endCardContainer = createCardContainer(endCard, false);

    const arrow = document.createElement('div');
    arrow.classList.add('arrow');
    arrow.textContent = '→';

    path.innerHTML = '';
    path.appendChild(startCardContainer);
    path.appendChild(arrow);
    questionMark = document.createElement('div');
    questionMark.classList.add('arrow');
    questionMark.textContent =(' ??? →');
    path.appendChild(questionMark);
    path.appendChild(endCardContainer);
    currentCardelems[1] = startCardContainer;
    currentCardelems[0] = endCardContainer;
    currentCardelems[1].classList.add("highlight");

    // 初始时，当前卡片为起始卡
    currentStCard = startCard;
    currentEdCard = endCard;
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

    // 将图片和超链接添加到容器中
    cardContainer.appendChild(cardImage);
    cardContainer.appendChild(cardLink);
    cardContainer.card = card;

    return cardContainer;
}

// 开始游戏函数
function startGame() {
    startBox.classList.add('hidden');
    buttons.classList.remove('hidden');
    gameBox.style.display = "block";
    stepCount.textContent = '0';
    result.classList.add('hidden');
    document.getElementById("cSeed").style.display = "block";
    document.getElementById("currentSeed").textContent = `当前种子：${currentSeed}`;

    // 生成初始选项
    generateRandomOptions();

    // 根据种子生成起始卡和终止卡
    generateRandomStartEndCards(currentSeed);
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

class CustomButton {
    constructor(title, content, bgColor, clickHandler) {
        this.title = title;
        this.content = content; // 新增内容
        this.bgColor = bgColor;
        this.clickHandler = clickHandler;
    }

    getButtonElement() {
        const button = document.createElement('button');
        button.classList.add('custom-button');
        button.style.backgroundColor = this.bgColor;
        button.addEventListener('click', this.clickHandler);

        // 添加标题
        const titleDiv = document.createElement('div');
        titleDiv.classList.add('button-title');
        titleDiv.textContent = this.title;
        button.appendChild(titleDiv);

        // 添加内容
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('button-content');
        contentDiv.textContent = this.content;
        button.appendChild(contentDiv);

        return button;
    }
}

function findCardByIdR(id) {
  return cardPool.find((card) => card.card_id === id);
}

function findCardByName(name) {
    return cardPool.find((card) => card.card_name === name);
}
// 示例：生成与操作相关的卡片按钮
function generateRelatedCardButtons(operation) {
    // 根据操作获取相关的卡片数据
    const cards = getRelatedCards(operation);

    // 清空相关卡片区域
     suggestionsDiv.innerHTML = '';

     // 创建相关卡片按钮
     cards.forEach((card) => {
         const button = document.createElement('button');
         button.classList.add('suggestionBtn');
         button.setAttribute('data-suggestion', card.card_name);
         button.textContent = card.card_name;
         button.cid = card.card_id;

         // 鼠标悬停事件
         button.addEventListener('mouseover', async function () {
             const suggestion = button.getAttribute('data-suggestion');
             const tCard = await findCardByIdR(button.cid);
             const imageURL = `https://shadowverse-portal.com/image/card/phase2/common/C/C_${tCard.card_id}.png`;

             button.style.backgroundImage = `url(${imageURL})`;
         });

         // 鼠标移出事件
         button.addEventListener('mouseout', function () {
             button.style.backgroundImage = 'none'; // 清空背景图
         });

         // 点击事件
         button.addEventListener('click', function () {
             suggestionsDiv.innerHTML = '';
             let selectedCard = findCardByIdR(button.cid);
             // 更新步数
             const currentStep = parseInt(stepCount.textContent) + 1;
             stepCount.textContent = currentStep;

             // 更新当前卡片
             updatePath(selectedCard); // 更新路径信息

             // 判断是否游戏结束
             if (currentStCard == currentEdCard) {
                 isGameOver = true;
                 currentCardelems[direction].classList.remove("highlight");
                 result.textContent = '游戏结束，你胜利了！';
                 result.classList.remove('hidden');
                 buttons.classList.add('hidden');
                 document.getElementById("cSeed").style.display = "none";
                 options.innerHTML = '';
                 // 添加重新开始按钮
                 const restartButton = document.createElement('button');
                 restartButton.textContent = '重新开始';
                 restartButton.id = 'restartButton'; // 设置按钮的 id
                 restartButton.addEventListener('click', () => {
                   gameBox.style.display = "none";

                     initGame();
                     generateRandomOptions();
                 });
                 result.appendChild(restartButton);
             }
         });

         // 将按钮添加到相关卡片区域
         suggestionsDiv.appendChild(button);
     });

     // 设置按钮组样式
     const rows = Math.ceil(cards.length / 5); // 总共需要的行数
     const cols = Math.min(5, cards.length); // 每行最多按钮数

     const gapBetweenButtons = "2px"; // 根据需要调整此值

     suggestionsDiv.style.display = "grid";
     suggestionsDiv.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
     suggestionsDiv.style.gridTemplateRows = `repeat(${rows}, auto)`;
     suggestionsDiv.style.justifyItems = "center"; // 每个按钮水平居中
     suggestionsDiv.style.alignItems = "center"; // 每个按钮垂直居中
     suggestionsDiv.style.gap = "5px"; // 按钮之间的空隙
     // 整体居中
     suggestionsDiv.style.textAlign = "center";
     // 限制最大宽度
     suggestionsDiv.style.maxWidth = "800px";
     suggestionsDiv.style.margin = "0 auto"; // 居中显示
     suggestionsDiv.style.marginTop = "10px";
}
function getTrueDesc(card){
  return (card.skill_disc + card.evo_skill_disc).replaceAll("与进化前能力相同。（入场曲 能力除外）","").replaceAll("与进化前能力相同。","");
}

function minorToken(item1,item2){
  var skillArray = item1.skill.split(",");
  var skillOArray = item1.skill_option.split(",");

  for (var i = 0; i < skillArray.length; i++) {
    if (skillArray[i] === "transform") {
      if (findCardById(parseInt(skillOArray[i].split("=")[1]),true) && findCardById(parseInt(skillOArray[i].split("=")[1]),true).skill_option.includes(item2.card_id)) {
        return true;
      }
    }
  }
}

const soundDataMap = new Map(soundData.map(card => [card.id, card]));

function voiceInteract(item1, item2) {
  const id1 = item1.card_id;
  const id2 = item2.card_id;
  const voiceInfo = soundDataMap.get(""+id1);

  if (!voiceInfo) {
    return false;
  }

  const voices = voiceInfo.sound.split(",");
  return voices.some(voice => voice.includes("" + id2));
}

function getRelatedCards(operation,currentCard) {
  if (!currentCard){
    if (direction == 1){
      currentCard = currentStCard;
    } else {
      currentCard = currentEdCard;
    }
  }

    switch (operation) {
        case '同一卡包同职业':
            return cardPool.filter(card => currentCard.card_set_id != 90000 && card.card_set_id === currentCard.card_set_id && card.clan === currentCard.clan &&card.card_id !== currentCard.card_id);
        case '衍生或被衍生':
            return cardPool.filter(card => card.card_id !== currentCard.card_id && (card.skill_option.includes(currentCard.card_id) || card.skill_target.includes(currentCard.card_id) || card.skill_condition.includes(currentCard.card_id) || currentCard.skill_option.includes(card.card_id) || currentCard.skill_target.includes(card.card_id) || currentCard.skill_condition.includes(card.card_id) || minorToken(card,currentCard) || minorToken(currentCard,card) ) );
        case '同身材稀有度':
            return cardPool.filter(card => card.char_type == 1 && currentCard.char_type == 1 && card.atk == currentCard.atk && card.life == currentCard.life && card.cost == currentCard.cost && card.rarity == currentCard.rarity && card.card_id !== currentCard.card_id);
        case '描述相似过75':
            return cardPool.filter(card => (getTrueDesc(card) == "" && getTrueDesc(currentCard) == "") || calculateLevenshteinDistance(getTrueDesc(card),getTrueDesc(currentCard)) < Math.min(getTrueDesc(card).length,getTrueDesc(currentCard).length) * 0.25);
        case '技能相似过75':
            return cardPool.filter(card => (calculateSkillScore(card,currentCard) >= 75 && card.card_id !== currentCard.card_id) );
        case '重印':
            return cardPool.filter(card => card.card_name === currentCard.card_name && card.card_id !== currentCard.card_id);
        case '语音联动':
            return cardPool.filter(card => card.char_type == 1 && currentCard.char_type == 1 && card.card_id !== currentCard.card_id && (voiceInteract(card,currentCard) || voiceInteract(currentCard,card)));
        case '特殊身材':
            let pool = cardPool.filter(card => card.char_type == 1 && currentCard.char_type == 1 && card.atk == currentCard.atk && card.life == currentCard.life && card.cost == currentCard.cost && card.card_id !== currentCard.card_id);
            //console.log(pool)
            return pool.length > 11 ? [] : pool;
        case '特殊进化':
            return cardPool.filter(card => card.char_type == 1 && currentCard.char_type == 1 && card.atk == currentCard.atk && card.evo_atk == currentCard.evo_atk && card.life == currentCard.life && card.evo_life == currentCard.evo_life && !(card.evo_atk - card.atk == 2 && card.evo_life - card.life == 2) && card.card_id !== currentCard.card_id);
        case '特殊进化2':
            return cardPool.filter(card => card.char_type == 1 && currentCard.char_type == 1 && (card.evo_atk - card.atk == currentCard.evo_atk - currentCard.atk) && (card.evo_life - card.life == currentCard.evo_life - currentCard.life) && !(card.evo_atk - card.atk == 2 && card.evo_life - card.life == 2) && card.card_id !== currentCard.card_id);
        default:
            return [];
    }
}

// 示例：清空现有的卡片按钮
function clearCardButtons() {
    options.innerHTML = '';
}
