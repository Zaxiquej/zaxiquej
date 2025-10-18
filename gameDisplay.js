// 图片文件夹路径
const imagePath = 'gameDisplay/';

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
            releaseDate: "2025年第二季度（Demo已公开！）",
            screenshotCount: 7,
            buttons: [
                { text: "Steam Demo", url: "https://store.steampowered.com/app/3377810", type: "steam" }
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
            description: "具有复杂机制的魔塔游戏，建议已有部分魔塔经验的玩家游玩。\n来自贫民窟的姐妹俩莉迪亚和乌娜为了生存，不得不前往下水道去消灭怪物探险。然而，她们没有想到的是，这个魔物丛生的世界，想要活下去，就必须踏进世界的谜团……",
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
            releaseDate: "Q2 2025 (Demo Available!)",
            screenshotCount: 7,
            buttons: [
                { text: "Steam Demo", url: "https://store.steampowered.com/app/3377810", type: "steam" }
            ]
        },
        {
            id: 2,
            title: "Soulestination",
            folder: "game2",
            description: "\"Soulestination\" is a magic tower (fixed-value strategy RPG) game that incorporates meta elements. Players need to control Rovia as the savior, fight the enemy in the process of exploring the world, and gradually see the essence of the world.",
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
            title: "晴空狂想曲",
            folder: "game3",
            description: "具有复杂机制的魔塔游戏，建议已有部分魔塔经验的玩家游玩。\n来自贫民窟的姐妹俩莉迪亚和乌娜为了生存，不得不前往下水道去消灭怪物探险。然而，她们没有想到的是，这个魔物丛生的世界，想要活下去，就必须踏进世界的谜团……",
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

    // 封面
    if (coverImg && coverImg.paths) {
        const cover = document.createElement('img');
        cover.className = 'game-cover';
        cover.alt = game.title;

        // 尝试加载封面（按优先级尝试）
        let pathIndex = 0;

        const tryLoadCover = function() {
            if (pathIndex < coverImg.paths.length) {
                cover.src = coverImg.paths[pathIndex];
            }
        };

        cover.onerror = function() {
            pathIndex++;
            if (pathIndex < coverImg.paths.length) {
                tryLoadCover(); // 尝试下一个路径
            } else {
                // 所有路径都失败，使用占位符
                this.src = `https://via.placeholder.com/1200x400/667eea/ffffff?text=${encodeURIComponent(game.title)}`;
                this.onerror = null; // 防止无限循环
            }
        };

        tryLoadCover(); // 开始加载第一个路径
        card.appendChild(cover);
    }

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
        description.textContent = game.description;
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
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close">&times;</span>
            <img src="${imgSrc}" alt="放大图片" class="modal-image">
        </div>
    `;

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
