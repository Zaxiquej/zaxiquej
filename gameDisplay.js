// 图片文件夹路径
const imagePath = './gamedisplay/';

// 游戏数据 - 只需要指定有多少张截图
const gamesData = {
  zh: [
          {
              id: 1,
              title: "列乌尼斯的挽歌",
              folder: "game1",
              description: "在《列乌尼斯的挽歌》中，你将扮演少女塔西娅，和同伴们探索失落的遗迹。通过巧妙地选择装备与技能，收集各种资源通过炼金与研究强化自己，你可以安排策略战胜各种各样的强敌。随着游戏深入，你将逐步接触到【灾厄】的真相。",
              community: {
                  qq: "512766472",
                  discord: "https://discord.gg/Jq3va9JAyX"
              },
              releaseDate: "2026年7月15日",
              screenshotCount: 7,
              buttons: [
                  { text: "Steam购买", url: "https://store.steampowered.com/app/3371260/Requiem_of_Reuinis/", type: "steam" },
                  { text: "加入QQ群", url: "https://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=npdlrfnrOBS8MUXESLfRz_nfRI9jQ4Bb&authKey=ziH92EgcDL9OKmTZln9wj893J%2FpeM0%2Bz3mV3c2dBESXv%2BsoOWipL4QA09Lgk7gbn&noverify=0&group_code=512766472", type: "qq" }
              ]
          },
          {
              id: 2,
              title: "魂之归宿",
              folder: "game2",
              description: "\"魂之归宿\"是一款融入了meta元素的魔塔（固定数值策略RPG）游戏，玩家需要操控作为救世主的洛薇，在探索世界的过程中与敌人战斗，逐渐看清世界的本质。拥有300多张精心设计的地图，超过20个独具特色的boss，数十件各具特色的武器与魂器，定能为你带来一场策略盛宴。",
              community: {
                  qq: "713296151",
                  discord: "https://discord.com/invite/GbuAKTXd7P"
              },
              releaseDate: "2021年1月",
              screenshotCount: 13,
              buttons: [
                  { text: "Steam页面", url: "https://store.steampowered.com/app/1477330", type: "steam" }
              ]
          },
          {
              id: 3,
              title: "晴空狂想曲",
              folder: "game3",
              description: "具有复杂机制的魔塔游戏，建议已有部分魔塔经验的玩家游玩。\\n来自贫民窟的姐妹俩莉迪亚和乌娜为了生存，不得不前往下水道去消灭怪物探险。然而，她们没有想到的是，这个魔物丛生的世界，想要活下去，就必须踏进世界的谜团……\\n由于网盘链接经常出错，请加入群聊获取游戏。",
              community: {
                  qq: "369562380"
              },
              releaseDate: "2021年4月",
              screenshotCount: 9,
              buttons: [
                  { text: "游戏本体(提取码7kh6)", url: "https://pan.baidu.com/s/1ZJ2lMdSXG3XCUObiYZw6LA", type: "baidu" },
                  { text: "补丁(提取码quy3)", url: "https://pan.baidu.com/s/13buzo–nCDna6KMBC2hCRg?pwd=quy3", type: "baidu" },
                  { text: "字体", url: "https://pan.baidu.com/s/1hr9KBtU", type: "baidu" }
              ]
          },
          {
              id: 4,
              title: "光明崎岖",
              folder: "game4",
              description: "高层大数据魔塔。\\n这是一个强者为尊的世界，每个人都渴望变强，渴望力量。一位叫阳光的青年也不例外，他也想着如何变强——在族人的不解和震惊中，他迈进了尖角塔的大门……\\n完整版有部分bug，建议先使用第二公测版通关后接档。",
              releaseDate: "2017年10月",
              screenshotCount: 8,
              buttons: [
                  { text: "游戏本体(提取码fgvt)", url: "https://pan.baidu.com/s/163iqn_pHblGW5ODWg13GUQ?pwd=fgvt", type: "baidu" }
              ]
          },
          {
              id: 5,
              title: "影中之影",
              folder: "game5",
              description: "短篇。\\n「只有正面杀来的人怀有恶意吗？身边的同伴是否真的值得信任？」——纯净章\\n「没有任何方法可以逃出囚笼。如要改变结果，唯有将其粉碎。」——囚笼章「\\n既非罪恶、亦非惩罚。这仅是毫无意义的，复仇。」——复仇章\\n「这个██已经毁掉了████，█必须将它██。」 ——真实章\\n██，这██究█能象征着██？ ——██章\\n「██████，████████████」？ ——███",
              releaseDate: "2019年11月",
              screenshotCount: 3,
              buttons: [
                  { text: "游戏本体(提取码ax7h)", url: "https://pan.baidu.com/s/1ykZcy0JydfJgptIRadM7ZA", type: "baidu" }
              ]
          },
          {
              id: 6,
              title: "汉赛尔与格蕾特",
              folder: "game6",
              description: "超短篇加点道具塔。",
              releaseDate: "2018年1月",
              screenshotCount: 3,
              buttons: [
                  { text: "游戏本体", url: "https://pan.baidu.com/s/1bo8DIZ9", type: "baidu" }
              ]
          },
          {
              id: 7,
              title: "梦境结界",
              folder: "game7",
              description: "短篇道具塔。",
              releaseDate: "2017年12月",
              screenshotCount: 1,
              buttons: [
                  { text: "游戏本体", url: "https://pan.baidu.com/s/1pKYDCDH", type: "baidu" }
              ]
          },
          {
              id: 8,
              title: "废魔者与无罪的暗影",
              folder: "game8",
              description: "晴空狂想曲的雏形作品。具有合成、采集、耐久、饥饿等复杂系统。\\n未完成，仅有短篇篇幅。",
              releaseDate: "2016年8月",
              screenshotCount: 3,
              buttons: [
                  { text: "游戏本体", url: "http://pan.baidu.com/s/1jIvxwUU", type: "baidu" },
                  { text: "游戏补丁", url: "http://pan.baidu.com/s/1ctCaT4", type: "baidu" }
              ]
          },
          {
              id: 9,
              title: "塔防魔塔",
              folder: "game9",
              description: "你守家敌人进攻的魔塔，加点塔。\\n未完成，仅有短篇篇幅。",
              releaseDate: "2016年7月",
              screenshotCount: 3,
              buttons: [
                  { text: "游戏本体（提取码cv9s）", url: "https://pan.baidu.com/s/1lZ4rbHe5Cv-fue3q3oiROA?pwd=cv9s", type: "baidu" }
              ]
          },
          {
              id: 10,
              title: "死亡与轮回",
              folder: "game10",
              description: "短篇魔塔，重开塔青春版（）\\n你在死亡后会保留能力返回游戏开始。",
              releaseDate: "2016年7月",
              screenshotCount: 1,
              buttons: [
                  { text: "游戏本体（提取码qsek）", url: "https://pan.baidu.com/s/13IsjJeO9Z8hUVvzYhH8aCg?pwd=qsek", type: "baidu" }
              ]
          },
          {
              id: 11,
              title: "国际象棋魔塔",
              folder: "game11",
              description: "短篇加点魔塔，敌人会像国际象棋一样过来揍你。你问我这和国际象棋到底有多大关系？我也不知道。",
              releaseDate: "2016年3月",
              screenshotCount: 1,
              buttons: [
                  { text: "游戏本体", url: "https://pan.baidu.com/s/1eQTkr4I", type: "baidu" }
              ]
          },
          {
              id: 12,
              title: "混沌时代",
              folder: "game12",
              description: "中篇魔塔。过于古代，不推荐游玩。游戏中有不少古代游戏特有的卡道具和诡异美术，请做好心理准备。",
              releaseDate: "2015年7月",
              screenshotCount: 4,
              buttons: [
                  { text: "游戏本体", url: "http://pan.baidu.com/s/1i3LAHxF", type: "baidu" },
                  { text: "游戏补丁", url: "http://pan.baidu.com/s/1i3q3nwT", type: "baidu" }
              ]
          },
          {
              id: 13,
              title: "噩梦",
              folder: "game13",
              description: "未完成，仅有短篇篇幅。过于古代，不推荐游玩。游戏中有不少古代游戏特有的卡道具，墨迹操作和瞎眼美术。请做好心理准备。",
              releaseDate: "2016年2月",
              screenshotCount: 3,
              buttons: [
                  { text: "游戏本体", url: "http://pan.baidu.com/s/1pJYNxWZ", type: "baidu" }
              ]
          }
      ],
    en: [
        {
            id: 1,
            title: "Requiem of Reuinis",
            folder: "game1",
            description: "Play as the young girl Tasia in \"Requiem of Reuinis\". Explore lost ruins with companions, cleverly choose equipment and skills, collect resources to enhance yourself through alchemy and research. Strategically defeat enemies and gradually uncover the truth behind the \"Calamity\"",
            community: {
                qq: "512766472",
                discord: "https://discord.gg/Jq3va9JAyX"
            },
            releaseDate: "July 15, 2026",
            screenshotCount: 7,
            buttons: [
                { text: "Buy on Steam", url: "https://store.steampowered.com/app/3371260/Requiem_of_Reuinis/", type: "steam" },
                { text: "Join Discord", url: "https://discord.gg/Jq3va9JAyX", type: "discord" }
            ]
        },
        {
            id: 2,
            title: "Soulestination",
            folder: "game2",
            description: "\"Soulestination\" is a magic tower (fixed-value strategy RPG) game that incorporates meta elements. Players need to control Rovia as the savior, fight the enemy in the process of exploring the world, and gradually see the essence of the world. With over 300 carefully designed maps, more than 20 unique bosses, and dozens of distinctive weapons and soul vessels, it will surely bring you a strategic feast.",
            community: {
                qq: "713296151",
                discord: "https://discord.com/invite/GbuAKTXd7P"
            },
            releaseDate: "January 2021",
            screenshotCount: 13,
            buttons: [
                { text: "Steam Page", url: "https://store.steampowered.com/app/1477330", type: "steam" }
            ]
        },
        {
            id: 3,
            title: "Rhapsody of Wonder",
            folder: "game3",
            description: "A magic tower game with complex mechanisms, recommended for players with some experience in magic tower games. Two sisters from the slums, Lydia and Una, have to venture into the sewers to eliminate monsters in order to survive. However, they never expected that in this monster-infested world, to survive, they must step into the mystery of the world... Because Baidu Netdisk links often fail, please join the group chat to get the game.",
            community: {
                qq: "369562380"
            },
            releaseDate: "April 2021",
            screenshotCount: 9,
            buttons: [
                { text: "Game Client(Code:7kh6)", url: "https://pan.baidu.com/s/1ZJ2lMdSXG3XCUObiYZw6LA", type: "baidu" },
                { text: "Patch(Code:quy3)", url: "https://pan.baidu.com/s/13buzo–nCDna6KMBC2hCRg?pwd=quy3", type: "baidu" },
                { text: "Font", url: "https://pan.baidu.com/s/1hr9KBtU", type: "baidu" }
            ]
        },
        {
            id: 4,
            title: "Luminous Struggle",
            folder: "game4",
            description: "High-level big data magic tower. This is a world where the strong are respected, and everyone desires to become stronger and gain power. A young man named Yang Guang is no exception - he also thinks about how to become stronger. Amid the confusion and shock of his clansmen, he steps into the door of the Spire Tower... The full version has some bugs, so it is recommended to use the second beta version to clear the game first and then continue with the full version.",
            releaseDate: "October 2017",
            screenshotCount: 8,
            buttons: [
                { text: "Game Client(Code:qsqr)", url: "https://pan.baidu.com/s/1XNUIcEOYVI1a2CKLlzLKdw?pwd=qsqr", type: "baidu" }
            ]
        },
        {
            id: 5,
            title: "Shadow of the Shadow",
            folder: "game5",
            description: "Short story. \"Are only those who attack head-on malicious? Are the companions by your side really trustworthy?\" — Pure Chapter \"There is no way to escape the cage. To change the outcome, it must be shattered.\" — Cage Chapter \"It is neither sin nor punishment. This is just meaningless revenge.\" — Revenge Chapter \"This ██ has already destroyed ████, █ must ██ it.\" — Truth Chapter ██, what can this ██ ultimately symbolize? — ██ Chapter \"██████, ████████████\"? — ███",
            releaseDate: "November 2019",
            screenshotCount: 3,
            buttons: [
                { text: "Game Client(Code:ax7h)", url: "https://pan.baidu.com/s/1ykZcy0JydfJgptIRadM7ZA", type: "baidu" }
            ]
        },
        {
            id: 6,
            title: "Hansel and Gretel",
            folder: "game6",
            description: "Very short story with attribute points and item tower.",
            releaseDate: "January 2018",
            screenshotCount: 3,
            buttons: [
                { text: "Game Client", url: "https://pan.baidu.com/s/1bo8DIZ9", type: "baidu" }
            ]
        },
        {
            id: 7,
            title: "Dream Boundary",
            folder: "game7",
            description: "Short story item tower.",
            releaseDate: "December 2017",
            screenshotCount: 1,
            buttons: [
                { text: "Game Client", url: "https://pan.baidu.com/s/1pKYDCDH", type: "baidu" }
            ]
        },
        {
            id: 8,
            title: "The Depleted One and the Innocent Shadow",
            folder: "game8",
            description: "The prototype work of Rhapsody of Wonder. Features complex systems such as synthesis, collection, durability, and hunger. Unfinished, only a short story length.",
            releaseDate: "August 2016",
            screenshotCount: 3,
            buttons: [
                { text: "Game Client", url: "http://pan.baidu.com/s/1jIvxwUU", type: "baidu" },
                { text: "Game Patch", url: "http://pan.baidu.com/s/1ctCaT4", type: "baidu" }
            ]
        },
        {
            id: 9,
            title: "Tower Defense Magic Tower",
            folder: "game9",
            description: "A magic tower where you defend your home and enemies attack, with attribute points. Unfinished, only a short story length.",
            releaseDate: "July 2016",
            screenshotCount: 3,
            buttons: [
                { text: "Game Client(Code:cv9s)", url: "https://pan.baidu.com/s/1lZ4rbHe5Cv-fue3q3oiROA?pwd=cv9s", type: "baidu" }
            ]
        },
        {
            id: 10,
            title: "Death and Reincarnation",
            folder: "game10",
            description: "Short magic tower, a lightweight version of restart tower. After death, you retain your abilities and return to the beginning of the game.",
            releaseDate: "July 2016",
            screenshotCount: 1,
            buttons: [
                { text: "Game Client(Code:qsek)", url: "https://pan.baidu.com/s/13IsjJeO9Z8hUVvzYhH8aCg?pwd=qsek", type: "baidu" }
            ]
        },
        {
            id: 11,
            title: "Chess Magic Tower",
            folder: "game11",
            description: "Short magic tower with attribute points, enemies will come to beat you like chess pieces. You ask me how much this has to do with chess? I don't know either.",
            releaseDate: "March 2016",
            screenshotCount: 1,
            buttons: [
                { text: "Game Client", url: "https://pan.baidu.com/s/1eQTkr4I", type: "baidu" }
            ]
        },
        {
            id: 12,
            title: "Age of Chaos",
            folder: "game12",
            description: "Medium-length magic tower. Too ancient, the game has many ancient game-specific designs and weird art, please be prepared.",
            releaseDate: "July 2015",
            screenshotCount: 4,
            buttons: [
                { text: "Game Client", url: "http://pan.baidu.com/s/1i3LAHxF", type: "baidu" },
                { text: "Game Patch", url: "http://pan.baidu.com/s/1i3q3nwT", type: "baidu" }
            ]
        },
        {
            id: 13,
            title: "Nightmare",
            folder: "game13",
            description: "Unfinished, only a short story length. The game has many ancient game-specific designs.",
            releaseDate: "February 2016",
            screenshotCount: 3,
            buttons: [
                { text: "Game Client", url: "http://pan.baidu.com/s/1pJYNxWZ", type: "baidu" }
            ]
        }
    ]
};

// 当前语言
let currentLang = 'zh';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initLanguageSwitcher();
    renderGames();
});

// 初始化语言切换器
function initLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn');

    langButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            switchLanguage(lang);
        });
    });
}

// 切换语言
function switchLanguage(lang) {
    currentLang = lang;

    // 更新按钮状态
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });

    // 更新页面文本
    document.querySelectorAll('[data-zh]').forEach(el => {
        el.textContent = el.getAttribute(`data-${lang}`);
    });

    // 更新HTML语言属性
    document.documentElement.lang = lang;

    // 重新渲染游戏列表
    renderGames();
}

// 根据命名规则生成图片列表
function getGameImages(game) {
    const images = [];
    const prefix = currentLang === 'zh' ? 'ch' : 'en';

    // 添加封面 - 优先使用语言特定的封面，其次使用通用封面
    const coverPriority = [
        `${imagePath}${game.folder}/cover_${prefix}.png`,  // cover_ch.png 或 cover_en.png
        `${imagePath}${game.folder}/cover.png`             // 通用 cover.png
    ];

    images.push({
        type: 'cover',
        paths: coverPriority // 提供多个路径备选
    });

    // 添加截图（按命名规则：ch1.png, ch2.png 或 en1.png, en2.png）
    for (let i = 1; i <= game.screenshotCount; i++) {
        images.push({
            type: 'screenshot',
            path: `${imagePath}${game.folder}/${prefix}${i}.png`
        });
    }

    return images;
}

// 渲染游戏列表
function renderGames() {
    const gamesList = document.getElementById('gamesList');
    const games = gamesData[currentLang];

    gamesList.innerHTML = '';

    games.forEach(game => {
        const gameCard = createGameCard(game);
        gamesList.appendChild(gameCard);
    });
}

// 创建游戏卡片
function createGameCard(game) {
    const card = document.createElement('div');
    card.className = 'game-card';

    // 获取图片
    const images = getGameImages(game);
    const coverImg = images.find(img => img.type === 'cover');
    const screenshots = images.filter(img => img.type === 'screenshot');

    // 创建封面容器
    const coverContainer = document.createElement('div');
    coverContainer.className = 'game-cover-container';

    // 创建封面图片
    if (coverImg && coverImg.paths) {
        const cover = document.createElement('img');
        cover.className = 'game-cover';
        cover.alt = game.title;

        // 尝试加载封面（按优先级尝试）
        let pathIndex = 0;

        const tryLoadCover = function() {
            if (pathIndex < coverImg.paths.length) {
                cover.src = coverImg.paths[pathIndex];
            } else {
                // 所有封面路径都失败，显示备用封面
                showFallbackCover(coverContainer, game.title);
            }
        };

        cover.onerror = function() {
            pathIndex++;
            tryLoadCover(); // 尝试下一个路径
        };

        cover.onload = function() {
            // 封面加载成功，确保备用封面隐藏
            const fallback = coverContainer.querySelector('.fallback-cover');
            if (fallback) {
                fallback.style.display = 'none';
            }
        };

        tryLoadCover(); // 开始加载第一个路径
        coverContainer.appendChild(cover);
    }

    // 创建备用封面（初始隐藏）
    const fallbackCover = document.createElement('div');
    fallbackCover.className = 'fallback-cover';
    fallbackCover.style.display = 'none';
    fallbackCover.innerHTML = `<span>${game.title}</span>`;
    coverContainer.appendChild(fallbackCover);

    card.appendChild(coverContainer);

    // 内容区
    const content = document.createElement('div');
    content.className = 'game-content';

    // 标题
    const title = document.createElement('h2');
    title.className = 'game-title';
    title.textContent = game.title;

    // 游戏信息
    const info = document.createElement('div');
    info.className = 'game-info';

    let infoHTML = `<p><strong>${currentLang === 'zh' ? '发布日期：' : 'Release Date:'}</strong>${game.releaseDate}</p>`;

    // 处理社区信息 - 每个类型一行
    if (game.community) {
        if (game.community.qq) {
            infoHTML += `<p><strong>QQ${currentLang === 'zh' ? '群：' : ' Group: '}</strong>${game.community.qq}</p>`;
        }
        if (game.community.discord) {
            infoHTML += `<p><strong>Discord: </strong><a href="${game.community.discord}" target="_blank" style="color: #667eea; text-decoration: none;">${game.community.discord}</a></p>`;
        }
        if (game.community.wechat) {
            infoHTML += `<p><strong>${currentLang === 'zh' ? '微信：' : 'WeChat: '}</strong>${game.community.wechat}</p>`;
        }
    }

    info.innerHTML = infoHTML;

    content.appendChild(title);
    content.appendChild(info);

    // 截图滚动区
    if (screenshots.length > 0) {
        const screenshotsContainer = document.createElement('div');
        screenshotsContainer.className = 'screenshots-container';

        const screenshotsScroll = document.createElement('div');
        screenshotsScroll.className = 'screenshots-scroll';

        screenshots.forEach((screenshot, index) => {
            const img = document.createElement('img');
            img.className = 'screenshot';
            img.alt = `${game.title} - Screenshot ${index + 1}`;
            img.dataset.fullsize = screenshot.path; // 存储完整路径用于放大

            // 准备备用路径（如果是英文，回退到中文）
            const fallbackPath = currentLang === 'en' ?
                screenshot.path.replace('/en', '/ch') :
                null;

            img.src = screenshot.path;

            img.onerror = function() {
                // 如果当前语言加载失败，尝试中文版本
                if (fallbackPath && this.src !== fallbackPath) {
                    this.src = fallbackPath;
                    this.dataset.fullsize = fallbackPath; // 更新放大时使用的路径
                } else {
                    // 都失败了，显示占位符
                    this.src = `https://via.placeholder.com/300x180/764ba2/ffffff?text=Screenshot+${index + 1}`;
                    this.onerror = null; // 防止无限循环
                }
            };

            screenshotsScroll.appendChild(img);
        });

        screenshotsContainer.appendChild(screenshotsScroll);
        content.appendChild(screenshotsContainer);
    }

    // 游戏介绍
    if (game.description) {
        const description = document.createElement('div');
        description.className = 'game-description';
        // 处理换行符
        const formattedDescription = game.description.replace(/\\n/g, '\n');
        description.textContent = formattedDescription;
        content.appendChild(description);
    }

    // 按钮组
    const buttons = document.createElement('div');
    buttons.className = 'game-buttons';

    game.buttons.forEach(btnData => {
        const btn = document.createElement('a');
        btn.className = `game-btn btn-${btnData.type}`;
        btn.href = btnData.url;
        btn.textContent = btnData.text;
        btn.target = '_blank';
        buttons.appendChild(btn);
    });

    content.appendChild(buttons);
    card.appendChild(content);

    return card;
}

// 显示备用封面
function showFallbackCover(container, title) {
    const cover = container.querySelector('.game-cover');
    const fallback = container.querySelector('.fallback-cover');

    if (cover) {
        cover.style.display = 'none';
    }
    if (fallback) {
        fallback.style.display = 'flex';

        // 添加打字机效果
        typeWriterEffect(fallback.querySelector('span'), title);
    }
}

// 打字机效果
function typeWriterEffect(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

// 图片放大功能
document.addEventListener('click', function(e) {
    // 点击截图放大
    if (e.target.classList.contains('screenshot')) {
        const imgSrc = e.target.dataset.fullsize || e.target.src;
        showImageModal(imgSrc);
    }

    // 点击模态框背景关闭
    if (e.target.classList.contains('image-modal')) {
        closeImageModal();
    }
});

// 显示图片放大模态框
function showImageModal(imgSrc) {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML =
        `<div class="modal-content">
            <span class="modal-close">&times;</span>
            <img src="${imgSrc}" alt="放大图片" class="modal-image">
        </div>`
    ;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden'; // 防止背景滚动

    // 添加淡入动画
    setTimeout(() => modal.classList.add('show'), 10);

    // 关闭按钮点击事件
    modal.querySelector('.modal-close').addEventListener('click', function(e) {
        e.stopPropagation();
        closeImageModal();
    });

    // 防止点击图片本身关闭模态框
    modal.querySelector('.modal-image').addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // ESC键关闭
    document.addEventListener('keydown', handleEscKey);
}

// 关闭图片放大模态框
function closeImageModal() {
    const modal = document.querySelector('.image-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = ''; // 恢复滚动
        }, 300);
    }
    document.removeEventListener('keydown', handleEscKey);
}

// ESC键处理
function handleEscKey(e) {
    if (e.key === 'Escape') {
        closeImageModal();
    }
}
