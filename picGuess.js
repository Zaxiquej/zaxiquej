let score = 0;
let correctClan = 0;
let correctCardN;
let correctId = 0;
let timer;
let clanNames = ["中立","妖精","皇家护卫","巫师","龙族","死灵法师","吸血鬼","主教","复仇者"]
let diceRoll;
let difficulty;
let cardPool = [];
let lastPacket = 10029;

const specifiedModeCheckbox = document.getElementById("specifiedModeCheckbox");
const noTokenModeCheckbox = document.getElementById("noTokenModeCheckbox");

const cardImg = document.getElementById('cardImg');

// 预加载图片
function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// 预先加载的卡牌数量
const numPreloadCards = 10; // 可根据需求调整
// 阻止右键菜单弹出行为
cardImg.addEventListener('contextmenu', (event) => {
  event.preventDefault();
});

// 初始化预加载数组
let preCards = [];
// 生成系列按钮
const clanBtns = document.getElementById('clanBtns');
clanBtns.style.display = 'flex';
for (let i = 0; i <= 8; i++) {
  let btn = document.createElement('button');
  btn.classList.add('clanBtn');
  btn.style.backgroundImage = `url(pics/clan${i}.png)`;
  btn.dataset.clan = i;
  btn.addEventListener('click', () => {
    btn.classList.add('selected');
    checkAnswer(i);
  });
  clanBtns.appendChild(btn);
}

// 开始游戏
const startBtn = document.getElementById('startBtn');
startBtn.addEventListener('click', startGame);

function findCardById(id) {
  return cardData.find((card) => card.card_id === id);
}

function addCardsFromLastPackets() {
  let cardSetIds = Array.from({ length: 5 }, (_, index) => lastPacket - index)
  cardSetIds.push(10000) //基础包

  cardSetIds.forEach(cardSetId => {
    const matchingCards = cardData.filter(card => card.card_set_id === cardSetId && !cardPool.includes(card));

    matchingCards.forEach(card => {
      if (!cardPool.includes(card)) {
        cardPool.push(card);

        // 查找并加入符合条件的技能卡
        if (!noTokenModeCheckbox.checked){
          addSkillOptionCards(card.skill_option);
        }
      }
    });
  });
}

function addSkillOptionCards(skillOption) {
  skillOption.replaceAll("&",",");
  const tokens = skillOption.split(","); // 分割技能选项

  tokens.forEach(token => {
    const matches = token.split("//")[0].split(")")[0].match(/(token_draw|summon_token|card_id)=([^&]+)/); // 从分割的段落中提取 token 信息

    if (matches && matches[2]) {
      const cardIds = matches[2].split(":"); // 分割 card_id

      cardIds.forEach(cardIdToFind => {
        const matchingCard = findCardById(parseInt(cardIdToFind));

        if (matchingCard && (matchingCard.card_id === matchingCard.base_card_id || matchingCard.base_card_id === "900811050")) {
          if (!cardPool.includes(matchingCard)) {
            cardPool.push(matchingCard);
            addSkillOptionCards(matchingCard.skill_option);
          }
        }
      });
    }
  });
}

function startGame() {
  // 隐藏介绍，显示游戏界面
  document.getElementById('intro').style.display = 'none';
  document.getElementById('other').style.display = 'none';
  document.getElementById('game').style.display = 'block';

  const difficultySelect = document.getElementById('difficultySelect');
  const selectedDifficulty = difficultySelect.value;
  // 根据选择的难度设置投骰子效果
  difficulty = 1;
  if (selectedDifficulty === 'medium') {
    difficulty = 2;
  } else if (selectedDifficulty === 'hard') {
    difficulty = 3;
  }

  if (specifiedModeCheckbox.checked) {
    cardPool = [];
    addCardsFromLastPackets();
  } else {
    if (noTokenModeCheckbox.checked){
      cardPool = cardData.filter((card) => card.card_set_id != 90000);
    } else {
      cardPool = cardData;
    }
  }
  // 预先加载卡牌图片
  for (let i = 0; i < numPreloadCards; i++) {
    const cardIndex = Math.floor(Math.random() * cardPool.length);
    const card = cardPool[cardIndex];
    const cardId = card.char_type === 1 ? card.card_id * 10 + (Math.random() < 0.5 ? 1 : 0) : card.card_id * 10;
    const imgSrc = `https://svgdb.me/assets/fullart/${cardId}.png`;
    preCards.push({ card, imgSrc });
    preloadImage(imgSrc);
  }
  // 重置分数
  score = 0;
  document.getElementById('scoreDisplay').textContent = score;

  // 随机选取卡牌
  pickCard();
}

// 从数据中随机选取卡牌
function pickCard() {
  if (preCards.length === 0) {
    return; // 没有预先加载的卡牌了
  }

  const { card, imgSrc } = preCards.shift(); // 获取预先加载的卡牌数据和图片链接
  correctClan = card.clan;
  correctCardN = card.card_name;
  correctId = card.card_id;

  // 隐藏图片
  cardImg.classList.remove('combined'); // 移除灰度效果

  cardImg.style.display = 'none';

  // 图片加载完成事件
  cardImg.onload = () => {
    // 显示图片
    cardImg.style.display = 'block';

    // 更新图片源
    cardImg.src = imgSrc;

    // 重新显示按钮
    document.querySelectorAll('.clanBtn').forEach(btn => {
      btn.disabled = false;
    });
  };

    // 设置图片源
    cardImg.src = imgSrc;

    // 禁用按钮
    document.querySelectorAll('.clanBtn').forEach(btn => {
      btn.disabled = true;
    });

    // 移除已用的卡牌并添加新卡牌
    addPre();
}

function addPre(){
  const cardIndex = Math.floor(Math.random() * cardPool.length);
  const card = cardPool[cardIndex];
  const cardId = card.char_type === 1 ? card.card_id * 10 + (Math.random() < 0.5 ? 1 : 0) : card.card_id * 10;
  const imgSrc = `https://svgdb.me/assets/fullart/${cardId}.png`;
  preCards.push({ card, imgSrc });
  preloadImage(imgSrc);
}

// 加载下一张卡牌
function nextCard() {
  // 隐藏图片
  cardImg.style.display = 'none';

  // 隐藏按钮
  document.querySelectorAll('.clanBtn').forEach(btn => {
    btn.disabled = true;
    btn.classList.remove('selected'); // 移除之前选择的按钮样式
  });

  pickCard(); // 重新选取下一张卡牌
}



// 检查猜测是否正确
function checkAnswer(guess) {
  if (guess === correctClan) {
    score++;
    document.getElementById('scoreDisplay').textContent = score;
    // 根据分数添加遮罩效果
    nextCard(); // 加载下一张卡牌
    initializeFilterParameters();
    if (difficulty == 1){
      return;
    }
    if (score >= 6 || difficulty == 3) {
      let distraction = [0,0,100,100,100];

      if (difficulty == 2){
        for (let i = 0; i <= Math.min(parseInt(score/3) + 2,20); i++){
          const diceRoll = Math.floor(Math.random() * 6) + 1;
          if (diceRoll === 1) {
            distraction[0] += 25;
          } else if (diceRoll === 2) {
            distraction[1] += 1;
          } else if (diceRoll === 3) {
            distraction[2] += 10;
          } else if (diceRoll === 4) {
            distraction[3] += 15;
          } else if (diceRoll === 5) {
            distraction[4] += 20;
          }
        }
        distraction[1] = Math.min(distraction[1],5);
      } else {
        distraction = [100,4,120,140,160]
      }

      applyGrayScaleEffect(distraction[0])
      applyBlurScaleEffect(distraction[1])
      applyBrightScaleEffect(distraction[2])
      applyContrastScaleEffect(distraction[3])
      applySaturateScaleEffect(distraction[4])
      cardImg.classList.add('combined'); // 添加灰度效果
    }
  } else {
    endGame();
  }
}

// 结束游戏
function endGame() {
  clearInterval(timer);
  cardImg.classList.remove('combined'); // 移除灰度效果
  initializeFilterParameters();
  document.getElementById('result').innerHTML = `错误！正确答案是：${clanNames[correctClan]}。该卡牌为 <a href="https://shadowverse-portal.com/card/${correctId}?lang=zh-tw" target="_blank">${correctCardN}</a>。最终得分：${score}`;
  clanBtns.style.display = 'none';
  document.getElementById('restartBtn').style.display = 'block';
}

// 重新开始游戏
const restartBtn = document.getElementById('restartBtn');
restartBtn.addEventListener('click', () => {
  // 重置
  score = 0;
  // 隐藏结果，显示按钮
  document.getElementById('result').textContent = '';
  clanBtns.style.display = 'flex';
  restartBtn.style.display = 'none';
  startGame();
});

function initializeFilterParameters() {
  // 灰度强度
  document.documentElement.style.setProperty('--grayscale-intensity', '100%');
  // 模糊强度
  document.documentElement.style.setProperty('--blur-intensity', '0px');
  // 亮度强度
  document.documentElement.style.setProperty('--brightness-intensity', '100%');
  // 对比度强度
  document.documentElement.style.setProperty('--contrast-intensity', '100%');
  // 饱和度强度
  document.documentElement.style.setProperty('--saturate-intensity', '100%');
}


function applyGrayScaleEffect(intensity) {
  document.documentElement.style.setProperty('--grayscale-intensity', intensity+'%')
}

function applyBlurScaleEffect(intensity) {
  document.documentElement.style.setProperty('--blur-intensity', intensity+'px')
}


function applyBrightScaleEffect(intensity) {
  document.documentElement.style.setProperty('--brightness-intensity', intensity + '%')
}

function applyContrastScaleEffect(intensity) {
  document.documentElement.style.setProperty('--contrast-intensity', intensity + '%')
}

function applySaturateScaleEffect(intensity) {
  document.documentElement.style.setProperty('--saturate-intensity', intensity + '%')
}
