// 新手入门
const basic = [
  { id: 201, image: 'bahamut/image/creature201.png', sound: 'bahamut/sound/sound201.mp3' },
  { id: 202, image: 'bahamut/image/creature202.png', sound: 'bahamut/sound/sound202.mp3' },
  { id: 203, image: 'bahamut/image/creature203.png', sound: 'bahamut/sound/sound203.mp3' },
  { id: 204, image: 'bahamut/image/creature204.png', sound: 'bahamut/sound/sound204.mp3' },
  { id: 205, image: 'bahamut/image/creature205.png', sound: 'bahamut/sound/sound205.mp3' },
  { id: 206, image: 'bahamut/image/creature206.png', sound: 'bahamut/sound/sound206.mp3' },
  { id: 207, image: 'bahamut/image/creature207.png', sound: 'bahamut/sound/sound207.mp3' },
  { id: 208, image: 'bahamut/image/creature208.png', sound: 'bahamut/sound/sound208.mp3' },
  { id: 209, image: 'bahamut/image/creature209.png', sound: 'bahamut/sound/sound209.mp3' },
  { id: 210, image: 'bahamut/image/creature210.png', sound: 'bahamut/sound/sound210.mp3' },
  { id: 211, image: 'bahamut/image/creature211.png', sound: 'bahamut/sound/sound211.mp3' },
  { id: 212, image: 'bahamut/image/creature212.png', sound: 'bahamut/sound/sound212.mp3' },
  { id: 213, image: 'bahamut/image/creature213.png', sound: 'bahamut/sound/sound213.mp3' },
  { id: 214, image: 'bahamut/image/creature214.png', sound: 'bahamut/sound/sound214.mp3' },
];

// 创造物数据数组（示例数据）
const creatures = [
  { id: 1, image: 'bahamut/image/creature1.png', sound: 'bahamut/sound/sound1.mp3' },
  { id: 2, image: 'bahamut/image/creature2.png', sound: 'bahamut/sound/sound2.mp3' },
  { id: 3, image: 'bahamut/image/creature3.png', sound: 'bahamut/sound/sound3.mp3' },
  { id: 4, image: 'bahamut/image/creature4.png', sound: 'bahamut/sound/sound4.mp3' },
  { id: 5, image: 'bahamut/image/creature5.png', sound: 'bahamut/sound/sound5.mp3' },
  { id: 6, image: 'bahamut/image/creature6.png', sound: 'bahamut/sound/sound6.mp3' },
  { id: 7, image: 'bahamut/image/creature7.png', sound: 'bahamut/sound/sound7.mp3' },
  { id: 8, image: 'bahamut/image/creature8.png', sound: 'bahamut/sound/sound8.mp3' },
  { id: 9, image: 'bahamut/image/creature9.png', sound: 'bahamut/sound/sound9.mp3' },
  { id: 10, image: 'bahamut/image/creature10.png', sound: 'bahamut/sound/sound10.mp3' },
  { id: 11, image: 'bahamut/image/creature11.png', sound: 'bahamut/sound/sound11.mp3' },
  { id: 12, image: 'bahamut/image/creature12.png', sound: 'bahamut/sound/sound12.mp3' },
  { id: 13, image: 'bahamut/image/creature13.png', sound: 'bahamut/sound/sound13.mp3' },
  { id: 14, image: 'bahamut/image/creature14.png', sound: 'bahamut/sound/sound14.mp3' },
  { id: 15, image: 'bahamut/image/creature15.png', sound: 'bahamut/sound/sound15.mp3' },
  { id: 16, image: 'bahamut/image/creature16.png', sound: 'bahamut/sound/sound16.mp3' },
  { id: 17, image: 'bahamut/image/creature17.png', sound: 'bahamut/sound/sound17.mp3' },
  { id: 18, image: 'bahamut/image/creature18.png', sound: 'bahamut/sound/sound18.mp3' },
  { id: 19, image: 'bahamut/image/creature19.png', sound: 'bahamut/sound/sound19.mp3' },
];

// 创造物进化后的数据（示例数据）
const evolvedCreatures = [
  { id: 101, image: 'bahamut/image/creature101.png', sound: 'bahamut/sound/sound101.mp3' },
  { id: 102, image: 'bahamut/image/creature102.png', sound: 'bahamut/sound/sound102.mp3' },
  { id: 103, image: 'bahamut/image/creature103.png', sound: 'bahamut/sound/sound103.mp3' },
  { id: 104, image: 'bahamut/image/creature104.png', sound: 'bahamut/sound/sound104.mp3' },
  { id: 105, image: 'bahamut/image/creature105.png', sound: 'bahamut/sound/sound105.mp3' },
  { id: 106, image: 'bahamut/image/creature106.png', sound: 'bahamut/sound/sound106.mp3' },
  { id: 107, image: 'bahamut/image/creature107.png', sound: 'bahamut/sound/sound107.mp3' },
  { id: 108, image: 'bahamut/image/creature108.png', sound: 'bahamut/sound/sound108.mp3' },
  { id: 109, image: 'bahamut/image/creature109.png', sound: 'bahamut/sound/sound109.mp3' },
  { id: 110, image: 'bahamut/image/creature110.png', sound: 'bahamut/sound/sound110.mp3' },
  { id: 111, image: 'bahamut/image/creature111.png', sound: 'bahamut/sound/sound111.mp3' },
  { id: 112, image: 'bahamut/image/creature112.png', sound: 'bahamut/sound/sound112.mp3' },
  { id: 113, image: 'bahamut/image/creature113.png', sound: 'bahamut/sound/sound113.mp3' },
  { id: 114, image: 'bahamut/image/creature114.png', sound: 'bahamut/sound/sound114.mp3' },
  { id: 115, image: 'bahamut/image/creature115.png', sound: 'bahamut/sound/sound115.mp3' },
  { id: 116, image: 'bahamut/image/creature116.png', sound: 'bahamut/sound/sound116.mp3' },
  { id: 117, image: 'bahamut/image/creature117.png', sound: 'bahamut/sound/sound117.mp3' },
  { id: 118, image: 'bahamut/image/creature118.png', sound: 'bahamut/sound/sound118.mp3' },
  { id: 119, image: 'bahamut/image/creature119.png', sound: 'bahamut/sound/sound119.mp3' },
  // 依次添加其他进化后的创造物数据
];

// 初始化游戏状态
let score = 0;
let timeLimit = 20; // 初始时间限制（秒）
let gameInterval; // 用于存储游戏倒计时的interval ID
let isPlaying = false; // 表示是否正在播放音乐
let isSoundRepeating = false; // 表示是否允许声音重复播放
let randNum = 0;
let currentcreatures;
let randomCreatures;
let numButtons = 2;

let currentAudio; // 用于存储当前正在播放的音频对象

// 创建游戏按钮
function createGameButtons(num, creaturesArray) {
  const gameButtons = document.getElementById('gameButtons'); // 修改这里的id为gameButtons
  gameButtons.innerHTML = ''; // 清空原有的按钮

  // 随机选择num种创造物图片按钮
  randomCreatures = shuffleArray(creaturesArray).slice(0, num);

  randomCreatures.forEach((creature, index) => {
    const img = document.createElement('img');
    img.src = creature.image;
    img.alt = `创造物${creature.id}`;
    img.addEventListener('click', () => checkAnswer(creature));
    gameButtons.appendChild(img);
  });
}


// 打乱数组的顺序
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

// 播放音乐
function playMusic(sound) {
  if (currentAudio) {
    currentAudio.pause(); // 暂停当前正在播放的音频
    currentAudio.currentTime = 0; // 将音频播放位置重置为0
  }

  const audio = new Audio(sound);
  audio.play().catch(error => {
    // 防止浏览器的自动播放策略导致无法播放声音
    console.error('播放音乐失败：', error);
  });

  currentAudio = audio; // 将当前播放的音频对象保存到全局变量
  isPlaying = true;

  audio.onended = () => {
    isPlaying = false;
    if (isSoundRepeating) {
      playMusic(sound); // 重复播放音乐
    }
  };
}

// 检查答案是否正确
function checkAnswer(selectedCreature) {
  //if (isPlaying) return;

  if (timeLimit > 0) {
    const currentCreature = randomCreatures[randNum];
    if (selectedCreature.id === currentCreature.id) {
      score += 1;
      document.getElementById('score').innerText = `分数: ${score}`;
      increaseDifficulty();
    } else {
      endGame();
    }
  }
}

// 获取当前播放的创造物ID
function getCurrentCreatureId() {
  return randomCreatures[randNum].id;
}

function getRandomInt(n) {
  // 使用 Math.random() 生成一个 [0, 1) 之间的随机浮点数
  // 将其乘以 n，得到 [0, n) 之间的随机浮点数
  // 使用 Math.floor() 向下取整，得到 [0, n-1] 之间的随机整数
  return Math.floor(Math.random() * n);
}

// 增加难度
function increaseDifficulty() {
  if (score <= 11){
    numButtons = Math.min(19, Math.floor(score / 3) + 2);
  } else {
    numButtons = Math.min(19, Math.floor((score-12) / 6) + 6);
  }

  timeLimit = Math.max(6,20 - Math.floor(score / 5)); // 时间减少
  refreshTimeLimit();

  let allCreatures;
  if (score <= 5){
    allCreatures = basic;
  } else {
    if (score >= 18){
      allCreatures = creatures.concat(evolvedCreatures);
    } else {
      allCreatures = creatures;
    }
  }

  createGameButtons(numButtons, allCreatures);
  randNum = getRandomInt(numButtons)

  currentcreatures = randomCreatures[getCurrentCreatureId()];
  playMusic(randomCreatures[randNum].sound)
}
function replaySound(){
  playMusic(randomCreatures[randNum].sound)
}

// 结束游戏
function endGame() {
  clearInterval(gameInterval);
  timeLimit = 0;
  const gameButtons = document.getElementById('gameButtons'); // 修改这里的id为gameButtons
  gameButtons.innerHTML = ''; // 清空原有的按钮
  const Buttons = document.getElementById('Buttons');
  Buttons.innerHTML = `<p>游戏结束，你的得分是：${score}</p><button class="center-button" onclick="restartGame()">重新开始</button>`;
  document.getElementById('startButton').style.display = 'none'; // 不显示"开始游戏"按钮
  document.getElementById('replayButton').style.display = 'none'; // 隐藏"开始游戏"按钮
  document.getElementById('other').style.display = 'block'; // 隐藏"其他"按钮
  // 暂停并重置当前正在播放的音频
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
}

// 重新开始游戏
function restartGame() {
  score = 0;
  timeLimit = 20;
  const initialNumButtons = 2;
  numButtons = 2;

  document.getElementById('score').innerText = '分数: 0';
  document.getElementById('timer').innerText = `剩余时间: ${timeLimit}`;
  gameInterval = setInterval(updateTimeLimit, 1000);
  document.getElementById('startButton').style.display = 'none'; // 隐藏"开始游戏"按钮
  document.getElementById('replayButton').style.display = 'block'; // 隐藏"开始游戏"按钮
  document.getElementById('other').style.display = 'none'; // 隐藏"其他"按钮
  const Buttons = document.getElementById('Buttons');
  Buttons.innerHTML = ``;

  createGameButtons(initialNumButtons, basic);
  randNum = getRandomInt(numButtons)

  currentcreatures = randomCreatures[getCurrentCreatureId()];
  playMusic(randomCreatures[randNum].sound)
}

// 更新倒计时
function updateTimeLimit() {
  if (timeLimit > 0) {
    timeLimit -= 1;
    document.getElementById('timer').innerText = `剩余时间: ${timeLimit}`;
    if (timeLimit <= 0) {
      endGame();
    }
  }
}

// 更新倒计时
function refreshTimeLimit() {
    document.getElementById('timer').innerText = `剩余时间: ${timeLimit}`;
}

// 声音重复播放按钮功能
function toggleSound() {
  isSoundRepeating = !isSoundRepeating;
}

// 全局变量，用于跟踪已加载的素材数量
let loadedCount = 0;
let total

// 预加载图片
function preloadImages(images) {
  return Promise.all(images.map((image) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = image;
      img.onload = () => {
        loadedCount++;
        resolve();
        updateLoadingProgress(total,loadedCount);
      };
      img.onerror = () => reject();
    });
  }));
}

// 预加载声音
function preloadSounds(sounds) {
  return Promise.all(sounds.map((sound) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.src = sound;
      audio.preload = 'auto';
      audio.onloadeddata = () => {
        loadedCount++;
        resolve();
        updateLoadingProgress(total,loadedCount);
      };
      audio.onerror = () => reject();
    });
  }));
}

function updateLoadingProgress(total, loaded) {
  const loadingBar = document.getElementById('loadingBar');
  const progress = (loaded / total) * 100;
  loadingBar.style.width = `${progress}%`;

  if (loaded === total) {
    // 当所有素材加载完成后，隐藏进度条和显示"开始游戏"按钮
    const loadingContainer = document.getElementById('loadingContainer');
    const startButton = document.getElementById('startButton');

    loadingContainer.style.display = 'none';
    startButton.style.display = 'block';
  }
}

// 预加载所有图片和声音
function preloadAll() {
  const allCreatureImages = creatures.map((creature) => creature.image);
  const allEvolvedCreatureImages = evolvedCreatures.map((creature) => creature.image);
  const allBasicCreatureImages = basic.map((creature) => creature.image);
  const allImages = allCreatureImages.concat(allEvolvedCreatureImages).concat(allBasicCreatureImages);

  const allCreatureSounds = creatures.map((creature) => creature.sound);
  const allEvolvedCreatureSounds = evolvedCreatures.map((creature) => creature.sound);
  const allBasicCreatureSounds = basic.map((creature) => creature.sound);
  const allSounds = allCreatureSounds.concat(allEvolvedCreatureSounds).concat(allBasicCreatureSounds);

  total = allImages.length + allSounds.length;

    Promise.all([preloadImages(allImages), preloadSounds(allSounds)]).then(() => {
    // 当所有素材加载完成后，更新进度条状态
    updateLoadingProgress(allImages.length + allSounds.length, allImages.length + allSounds.length);
    document.getElementById('startButton').style.display = 'block'; // 显示"开始游戏"按钮
    document.getElementById('replayButton').style.display = 'none'; // 隐藏"重复播放"按钮
  }).catch(() => {
    console.error('预加载失败！');
  });
}

// 初始化游戏
function initGame() {//
      // 显示加载状态信息和进度条
  const loadingContainer = document.getElementById('loadingContainer');
  loadingContainer.style.display = 'block';
  preloadAll();
}

// 开始游戏
function startGame() {
    restartGame();
    //gameInterval = setInterval(updateTimeLimit, 1000);
    document.getElementById('startButton').style.display = 'none'; // 隐藏"开始游戏"按钮
    document.getElementById('replayButton').style.display = 'block'; // 隐藏"开始游戏"按钮
}

// 初始化游戏
createGameButtons(0, []); // 初始时没有按钮

// 页面加载完成后初始化游戏
window.onload = initGame;