// 新手入门
const basic = [
  { id: 201, image: 'vania/image/creature201.png', sound: 'vania/sound/sound201.mp3' },
  { id: 202, image: 'vania/image/creature202.png', sound: 'vania/sound/sound202.mp3' },
  { id: 203, image: 'vania/image/creature203.png', sound: 'vania/sound/sound203.mp3' },
  { id: 204, image: 'vania/image/creature204.png', sound: 'vania/sound/sound204.mp3' },
  { id: 205, image: 'vania/image/creature205.png', sound: 'vania/sound/sound205.mp3' },
  { id: 206, image: 'vania/image/creature206.png', sound: 'vania/sound/sound206.mp3' },
  { id: 207, image: 'vania/image/creature207.png', sound: 'vania/sound/sound207.mp3' },
  { id: 208, image: 'vania/image/creature208.png', sound: 'vania/sound/sound208.mp3' },
  { id: 209, image: 'vania/image/creature209.png', sound: 'vania/sound/sound209.mp3' },
  { id: 210, image: 'vania/image/creature210.png', sound: 'vania/sound/sound210.mp3' },
  { id: 211, image: 'vania/image/creature211.png', sound: 'vania/sound/sound211.mp3' },
  { id: 212, image: 'vania/image/creature212.png', sound: 'vania/sound/sound212.mp3' },
  { id: 213, image: 'vania/image/creature213.png', sound: 'vania/sound/sound213.mp3' },
  { id: 214, image: 'vania/image/creature214.png', sound: 'vania/sound/sound214.mp3' },
];

// 创造物数据数组（示例数据）
const creatures = [
  { id: 1, image: 'vania/image/creature1.png', sound: 'vania/sound/sound1.mp3' },
  { id: 2, image: 'vania/image/creature2.png', sound: 'vania/sound/sound2.mp3' },
  { id: 3, image: 'vania/image/creature3.png', sound: 'vania/sound/sound3.mp3' },
  { id: 4, image: 'vania/image/creature4.png', sound: 'vania/sound/sound4.mp3' },
  { id: 5, image: 'vania/image/creature5.png', sound: 'vania/sound/sound5.mp3' },
  { id: 6, image: 'vania/image/creature6.png', sound: 'vania/sound/sound6.mp3' },
  { id: 7, image: 'vania/image/creature7.png', sound: 'vania/sound/sound7.mp3' },
  { id: 8, image: 'vania/image/creature8.png', sound: 'vania/sound/sound8.mp3' },
  { id: 9, image: 'vania/image/creature9.png', sound: 'vania/sound/sound9.mp3' },
  { id: 10, image: 'vania/image/creature10.png', sound: 'vania/sound/sound10.mp3' },
  { id: 11, image: 'vania/image/creature11.png', sound: 'vania/sound/sound11.mp3' },
  { id: 12, image: 'vania/image/creature12.png', sound: 'vania/sound/sound12.mp3' },
  { id: 13, image: 'vania/image/creature13.png', sound: 'vania/sound/sound13.mp3' },
  { id: 14, image: 'vania/image/creature14.png', sound: 'vania/sound/sound14.mp3' },
  { id: 15, image: 'vania/image/creature15.png', sound: 'vania/sound/sound15.mp3' },
  { id: 16, image: 'vania/image/creature16.png', sound: 'vania/sound/sound16.mp3' },
  { id: 17, image: 'vania/image/creature17.png', sound: 'vania/sound/sound17.mp3' },
  { id: 18, image: 'vania/image/creature18.png', sound: 'vania/sound/sound18.mp3' },
  { id: 19, image: 'vania/image/creature19.png', sound: 'vania/sound/sound19.mp3' },
  { id: 20, image: 'vania/image/creature20.png', sound: 'vania/sound/sound20.mp3' },
  { id: 21, image: 'vania/image/creature21.png', sound: 'vania/sound/sound21.mp3' },
  { id: 22, image: 'vania/image/creature22.png', sound: 'vania/sound/sound22.mp3' },
  { id: 23, image: 'vania/image/creature23.png', sound: 'vania/sound/sound23.mp3' },
  { id: 24, image: 'vania/image/creature24.png', sound: 'vania/sound/sound24.mp3' },
];

// 创造物进化后的数据（示例数据）
const evolvedCreatures = [
  { id: 101, image: 'vania/image/creature101.png', sound: 'vania/sound/sound101.mp3' },
  { id: 102, image: 'vania/image/creature102.png', sound: 'vania/sound/sound102.mp3' },
  { id: 103, image: 'vania/image/creature103.png', sound: 'vania/sound/sound103.mp3' },
  { id: 104, image: 'vania/image/creature104.png', sound: 'vania/sound/sound104.mp3' },
  { id: 105, image: 'vania/image/creature105.png', sound: 'vania/sound/sound105.mp3' },
  { id: 106, image: 'vania/image/creature106.png', sound: 'vania/sound/sound106.mp3' },
  { id: 107, image: 'vania/image/creature107.png', sound: 'vania/sound/sound107.mp3' },
  { id: 108, image: 'vania/image/creature108.png', sound: 'vania/sound/sound108.mp3' },
  { id: 109, image: 'vania/image/creature109.png', sound: 'vania/sound/sound109.mp3' },
  { id: 110, image: 'vania/image/creature110.png', sound: 'vania/sound/sound110.mp3' },
  { id: 111, image: 'vania/image/creature111.png', sound: 'vania/sound/sound111.mp3' },
  { id: 112, image: 'vania/image/creature112.png', sound: 'vania/sound/sound112.mp3' },
  { id: 113, image: 'vania/image/creature113.png', sound: 'vania/sound/sound113.mp3' },
  { id: 114, image: 'vania/image/creature114.png', sound: 'vania/sound/sound114.mp3' },
  { id: 115, image: 'vania/image/creature115.png', sound: 'vania/sound/sound115.mp3' },
  { id: 116, image: 'vania/image/creature116.png', sound: 'vania/sound/sound116.mp3' },
  { id: 117, image: 'vania/image/creature117.png', sound: 'vania/sound/sound117.mp3' },
  { id: 118, image: 'vania/image/creature118.png', sound: 'vania/sound/sound118.mp3' },
  { id: 119, image: 'vania/image/creature119.png', sound: 'vania/sound/sound119.mp3' },
  { id: 120, image: 'vania/image/creature120.png', sound: 'vania/sound/sound120.mp3' },
  { id: 121, image: 'vania/image/creature121.png', sound: 'vania/sound/sound121.mp3' },
  { id: 122, image: 'vania/image/creature122.png', sound: 'vania/sound/sound122.mp3' },
  { id: 123, image: 'vania/image/creature123.png', sound: 'vania/sound/sound123.mp3' },
  { id: 124, image: 'vania/image/creature124.png', sound: 'vania/sound/sound124.mp3' },
  // 依次添加其他进化后的创造物数据
];

// 初始化游戏状态
let score = 0;
let timeLimit = 25; // 初始时间限制（秒）
let gameInterval; // 用于存储游戏倒计时的interval ID
let isPlaying = false; // 表示是否正在播放音乐
let isSoundRepeating = false; // 表示是否允许声音重复播放
let randNum = 0;
let currentcreatures;
let randomCreatures;
let numButtons = 2;

let currentAudio; // 用于存储当前正在播放的音频对象

// 增加难度
function increaseDifficulty() {
  if (score <= 11){
    numButtons = Math.min(19, Math.floor(score / 3) + 2);
  } else {
    numButtons = Math.min(19, Math.floor((score-12) / 6) + 6);
  }

  timeLimit = Math.max(10,25 - Math.floor(score / 5)); // 时间减少
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

// 重新开始游戏
function restartGame() {
  score = 0;
  timeLimit = 25;
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

// 全局变量，用于跟踪已加载的素材数量
let loadedCount = 0;
let total;

// 初始化游戏
createGameButtons(0, []); // 初始时没有按钮

// 页面加载完成后初始化游戏
window.onload = initGame;
