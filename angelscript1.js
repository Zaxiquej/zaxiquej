
// 创造物数据数组（示例数据）
const creatures = [
  { id: 1, image: 'angel/image/creature1.png', sound: 'angel/sound/sound1.mp3' },
  { id: 2, image: 'angel/image/creature2.png', sound: 'angel/sound/sound2.mp3' },
  { id: 3, image: 'angel/image/creature3.png', sound: 'angel/sound/sound3.mp3' },
  { id: 4, image: 'angel/image/creature4.png', sound: 'angel/sound/sound4.mp3' },
  { id: 5, image: 'angel/image/creature5.png', sound: 'angel/sound/sound5.mp3' },
  { id: 6, image: 'angel/image/creature6.png', sound: 'angel/sound/sound6.mp3' },
  { id: 7, image: 'angel/image/creature7.png', sound: 'angel/sound/sound7.mp3' },
  { id: 8, image: 'angel/image/creature8.png', sound: 'angel/sound/sound8.mp3' },
  { id: 9, image: 'angel/image/creature9.png', sound: 'angel/sound/sound9.mp3' },
  { id: 10, image: 'angel/image/creature10.png', sound: 'angel/sound/sound10.mp3' },
  { id: 11, image: 'angel/image/creature11.png', sound: 'angel/sound/sound11.mp3' },
  { id: 12, image: 'angel/image/creature12.png', sound: 'angel/sound/sound12.mp3' },
  { id: 13, image: 'angel/image/creature13.png', sound: 'angel/sound/sound13.mp3' },
  { id: 14, image: 'angel/image/creature14.png', sound: 'angel/sound/sound14.mp3' },
  { id: 15, image: 'angel/image/creature15.png', sound: 'angel/sound/sound15.mp3' },
  { id: 16, image: 'angel/image/creature16.png', sound: 'angel/sound/sound16.mp3' },
  { id: 17, image: 'angel/image/creature17.png', sound: 'angel/sound/sound17.mp3' },
  { id: 18, image: 'angel/image/creature18.png', sound: 'angel/sound/sound18.mp3' },
  { id: 19, image: 'angel/image/creature19.png', sound: 'angel/sound/sound19.mp3' },
  { id: 20, image: 'angel/image/creature20.png', sound: 'angel/sound/sound20.mp3' },
  { id: 21, image: 'angel/image/creature21.png', sound: 'angel/sound/sound21.mp3' },
  { id: 22, image: 'angel/image/creature22.png', sound: 'angel/sound/sound22.mp3' },
  { id: 23, image: 'angel/image/creature23.png', sound: 'angel/sound/sound23.mp3' },
  { id: 24, image: 'angel/image/creature24.png', sound: 'angel/sound/sound24.mp3' },
  { id: 25, image: 'angel/image/creature25.png', sound: 'angel/sound/sound25.mp3' },
  { id: 26, image: 'angel/image/creature26.png', sound: 'angel/sound/sound26.mp3' },
  { id: 27, image: 'angel/image/creature27.png', sound: 'angel/sound/sound27.mp3' },
  { id: 28, image: 'angel/image/creature28.png', sound: 'angel/sound/sound28.mp3' },
  { id: 29, image: 'angel/image/creature29.png', sound: 'angel/sound/sound29.mp3' },
  { id: 30, image: 'angel/image/creature30.png', sound: 'angel/sound/sound30.mp3' },
  { id: 31, image: 'angel/image/creature31.png', sound: 'angel/sound/sound31.mp3' },
  { id: 32, image: 'angel/image/creature32.png', sound: 'angel/sound/sound32.mp3' },
  { id: 33, image: 'angel/image/creature33.png', sound: 'angel/sound/sound33.mp3' },
  { id: 34, image: 'angel/image/creature34.png', sound: 'angel/sound/sound34.mp3' },
  { id: 35, image: 'angel/image/creature35.png', sound: 'angel/sound/sound35.mp3' },
  { id: 36, image: 'angel/image/creature36.png', sound: 'angel/sound/sound36.mp3' },
  { id: 37, image: 'angel/image/creature37.png', sound: 'angel/sound/sound37.mp3' },
  { id: 38, image: 'angel/image/creature38.png', sound: 'angel/sound/sound38.mp3' },
  { id: 39, image: 'angel/image/creature39.png', sound: 'angel/sound/sound39.mp3' },
  { id: 40, image: 'angel/image/creature40.png', sound: 'angel/sound/sound40.mp3' },
  { id: 41, image: 'angel/image/creature41.png', sound: 'angel/sound/sound41.mp3' },
];

// 创造物进化后的数据（示例数据）
const evolvedCreatures = [
  { id: 101, image: 'angel/image/creature101.png', sound: 'angel/sound/sound101.mp3' },
  { id: 102, image: 'angel/image/creature102.png', sound: 'angel/sound/sound102.mp3' },
  { id: 103, image: 'angel/image/creature103.png', sound: 'angel/sound/sound103.mp3' },
  { id: 104, image: 'angel/image/creature104.png', sound: 'angel/sound/sound104.mp3' },
  { id: 105, image: 'angel/image/creature105.png', sound: 'angel/sound/sound105.mp3' },
  { id: 106, image: 'angel/image/creature106.png', sound: 'angel/sound/sound106.mp3' },
  { id: 107, image: 'angel/image/creature107.png', sound: 'angel/sound/sound107.mp3' },
  { id: 108, image: 'angel/image/creature108.png', sound: 'angel/sound/sound108.mp3' },
  { id: 109, image: 'angel/image/creature109.png', sound: 'angel/sound/sound109.mp3' },
  { id: 110, image: 'angel/image/creature110.png', sound: 'angel/sound/sound110.mp3' },
  { id: 111, image: 'angel/image/creature111.png', sound: 'angel/sound/sound111.mp3' },
  { id: 112, image: 'angel/image/creature112.png', sound: 'angel/sound/sound112.mp3' },
  { id: 113, image: 'angel/image/creature113.png', sound: 'angel/sound/sound113.mp3' },
  { id: 114, image: 'angel/image/creature114.png', sound: 'angel/sound/sound114.mp3' },
  { id: 115, image: 'angel/image/creature115.png', sound: 'angel/sound/sound115.mp3' },
  { id: 116, image: 'angel/image/creature116.png', sound: 'angel/sound/sound116.mp3' },
  { id: 117, image: 'angel/image/creature117.png', sound: 'angel/sound/sound117.mp3' },
  { id: 118, image: 'angel/image/creature118.png', sound: 'angel/sound/sound118.mp3' },
  { id: 119, image: 'angel/image/creature119.png', sound: 'angel/sound/sound119.mp3' },
  { id: 120, image: 'angel/image/creature120.png', sound: 'angel/sound/sound120.mp3' },
  { id: 121, image: 'angel/image/creature121.png', sound: 'angel/sound/sound121.mp3' },
  { id: 122, image: 'angel/image/creature122.png', sound: 'angel/sound/sound122.mp3' },
  { id: 123, image: 'angel/image/creature123.png', sound: 'angel/sound/sound123.mp3' },
  { id: 124, image: 'angel/image/creature124.png', sound: 'angel/sound/sound124.mp3' },
  { id: 125, image: 'angel/image/creature125.png', sound: 'angel/sound/sound125.mp3' },
  { id: 126, image: 'angel/image/creature126.png', sound: 'angel/sound/sound126.mp3' },
  { id: 127, image: 'angel/image/creature127.png', sound: 'angel/sound/sound127.mp3' },
  { id: 128, image: 'angel/image/creature128.png', sound: 'angel/sound/sound128.mp3' },
  { id: 129, image: 'angel/image/creature129.png', sound: 'angel/sound/sound129.mp3' },
  { id: 130, image: 'angel/image/creature130.png', sound: 'angel/sound/sound130.mp3' },
  { id: 131, image: 'angel/image/creature131.png', sound: 'angel/sound/sound131.mp3' },
  { id: 132, image: 'angel/image/creature132.png', sound: 'angel/sound/sound132.mp3' },
  { id: 133, image: 'angel/image/creature133.png', sound: 'angel/sound/sound133.mp3' },
  { id: 134, image: 'angel/image/creature134.png', sound: 'angel/sound/sound134.mp3' },
  { id: 135, image: 'angel/image/creature135.png', sound: 'angel/sound/sound135.mp3' },
  { id: 136, image: 'angel/image/creature136.png', sound: 'angel/sound/sound136.mp3' },
  { id: 137, image: 'angel/image/creature137.png', sound: 'angel/sound/sound137.mp3' },
  { id: 138, image: 'angel/image/creature138.png', sound: 'angel/sound/sound138.mp3' },
  { id: 139, image: 'angel/image/creature139.png', sound: 'angel/sound/sound139.mp3' },
  { id: 140, image: 'angel/image/creature140.png', sound: 'angel/sound/sound140.mp3' },
  { id: 141, image: 'angel/image/creature141.png', sound: 'angel/sound/sound141.mp3' },
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
    numButtons = Math.min(20, Math.floor(score / 3) + 3);
  } else {
    numButtons = Math.min(20, Math.floor((score-12) / 6) + 7);
  }

  timeLimit = Math.max(10,25 - Math.floor(score / 5)); // 时间减少
  refreshTimeLimit();

  let allCreatures;
  if (score >= 15){
    allCreatures = creatures.concat(evolvedCreatures);
  } else {
    allCreatures = creatures;
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
  const initialNumButtons = 3;
  numButtons = 3;

  document.getElementById('score').innerText = '分数: 0';
  document.getElementById('timer').innerText = `剩余时间: ${timeLimit}`;
  gameInterval = setInterval(updateTimeLimit, 1000);
  document.getElementById('startButton').style.display = 'none'; // 隐藏"开始游戏"按钮
  document.getElementById('replayButton').style.display = 'block'; // 隐藏"开始游戏"按钮
  document.getElementById('other').style.display = 'none'; // 隐藏"其他"按钮
  const Buttons = document.getElementById('Buttons');
  Buttons.innerHTML = ``;

  createGameButtons(initialNumButtons, creatures);
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
