// 获取DOM元素
const startBox = document.getElementById('startBox');
const gameBox = document.getElementById('gameBox');
const randomSeedButton = document.getElementById('randomSeedButton');
const seedInput = document.getElementById('seedInput');
const useSeedButton = document.getElementById('useSeedButton');
const stepCounter = document.getElementById('stepCounter');
const stepCount = document.getElementById('stepCount');
const options = document.getElementById('options');
const path = document.getElementById('path');
const result = document.getElementById('result');
const suggestionsDiv = document.getElementById('suggestions');

let currentSeed = '';
let startCard;
let endCard;
let currentCard; // 新增：用于记录当前卡片
let step = 0;
let questionMark = 0;
let isGameOver = false; // 用于标记游戏是否结束

// 初始化游戏界面
function initGame() {
    startBox.classList.add('hidden');
    result.classList.add('hidden');
    path.innerHTML = ''; // 清空路径信息
    step = 0;

    // 初始时，当前卡片为起始卡
    currentCard = startCard;
}

// 生成随机的3个选项按钮
function generateRandomOptions() {
    options.innerHTML = '';
    for (let i = 0; i <= 1; i++) {
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

// 更新路径信息
function updatePath(selectedCard) {
    currentCard = selectedCard;
    const arrow = document.createElement('div');
    arrow.classList.add('arrow');
    arrow.textContent = '→';

    if (currentCard === endCard) {
        path.removeChild(questionMark);
    } else {
      const newCardContainer = createCardContainer(currentCard, true);
      const arrow = document.createElement('div');
      arrow.classList.add('arrow');
      arrow.textContent = '→';
      path.insertBefore(newCardContainer,questionMark);
      path.insertBefore(arrow,questionMark);
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
    startGame();
});

// 生成随机的起始卡和终止卡
function generateRandomStartEndCards(seed) {
    // 使用种子生成随机数
    Math.seedrandom(seed);

    const startIndex = Math.floor(Math.random() * cardData.length);
    let endIndex = Math.floor(Math.random() * cardData.length);
    while (endIndex === startIndex) {
        endIndex = Math.floor(Math.random() * cardData.length);
    }

    startCard = cardData[startIndex];
    endCard = cardData[endIndex];

    // 显示起始卡和终止卡信息
    const startCardContainer = createCardContainer(startCard, false);
    const endCardContainer = createCardContainer(endCard, false);

    const arrow = document.createElement('div');
    arrow.classList.add('arrow');
    arrow.textContent = '→';

    path.innerHTML = '';
    path.appendChild(startCardContainer);
    path.appendChild(arrow);
    questionMark = document.createTextNode(' ??? →');
    path.appendChild(questionMark);
    path.appendChild(endCardContainer);

    // 初始时，当前卡片为起始卡
    currentCard = startCard;
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

    return cardContainer;
}

// 开始游戏函数
function startGame() {
    startBox.classList.add('hidden');
    gameBox.classList.remove('hidden');
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

function findCardByName(name) {
    return cardData.find((card) => card.card_name === name);
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

         // 鼠标悬停事件
         button.addEventListener('mouseover', async function () {
             const suggestion = button.getAttribute('data-suggestion');
             const cardData = await findCardByName(suggestion);
             const imageURL = `https://shadowverse-portal.com/image/card/phase2/common/C/C_${cardData.card_id}.png`;

             button.style.backgroundImage = `url(${imageURL})`;
         });

         // 鼠标移出事件
         button.addEventListener('mouseout', function () {
             button.style.backgroundImage = 'none'; // 清空背景图
         });

         // 点击事件
         button.addEventListener('click', function () {
             suggestionsDiv.innerHTML = '';
             let selectedCard = findCardByName(button.textContent);
             // 更新步数
             const currentStep = parseInt(stepCount.textContent) + 1;
             stepCount.textContent = currentStep;

             // 更新当前卡片
             updatePath(selectedCard); // 更新路径信息

             // 判断是否游戏结束
             if (currentCard === endCard) {
                 isGameOver = true;
                 result.textContent = '游戏结束，你胜利了！';
                 result.classList.remove('hidden');
                 document.getElementById("cSeed").style.display = "none";
                 options.innerHTML = '';
                 // 添加重新开始按钮
                 const restartButton = document.createElement('button');
                 restartButton.textContent = '重新开始';
                 restartButton.id = 'restartButton'; // 设置按钮的 id
                 restartButton.addEventListener('click', () => {
                   gameBox.classList.add('hidden');
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
// 示例：根据操作获取相关的卡片数据
function getRelatedCards(operation) {
    switch (operation) {
        case '同一卡包同职业':
            return cardData.filter(card => currentCard.card_set_id != 90000 && card.card_set_id === currentCard.card_set_id && card.clan === currentCard.clan &&card.card_id !== currentCard.card_id);
        case '衍生或被衍生':
            return cardData.filter(card => (card.skill_option.includes(currentCard.card_id) || card.skill_target.includes(currentCard.card_id)) || (currentCard.skill_option.includes(card.card_id) || currentCard.skill_target.includes(card.card_id) ) && card.card_id !== currentCard.card_id);
        case '同身材稀有度':
            return cardData.filter(card => card.char_type == 1 && currentCard.char_type == 1 && card.atk == currentCard.atk && card.life == currentCard.life && card.cost == currentCard.cost && card.rarity == currentCard.rarity && card.card_id !== currentCard.card_id);
        case '描述相似过75':
            return cardData.filter(card => (getTrueDesc(card) == "" && getTrueDesc(currentCard) == "") || calculateLevenshteinDistance(getTrueDesc(card),getTrueDesc(currentCard)) < Math.min(getTrueDesc(card).length,getTrueDesc(currentCard).length) * 0.25);
        case '技能相似过75':
            return cardData.filter(card => (calculateSkillScore(card,currentCard) >= 75 && card.card_id !== currentCard.card_id) );
        default:
            return [];
    }
}

// 示例：清空现有的卡片按钮
function clearCardButtons() {
    options.innerHTML = '';
}
