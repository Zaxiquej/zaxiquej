const RANKS = {
    emerald: { name: '绿宝石', multiplier: 1.0, index: 0, class: 'emerald' },
    topaz: { name: '黄宝石', multiplier: 1.2, index: 1, class: 'topaz' },
    ruby: { name: '红宝石', multiplier: 1.5, index: 2, class: 'ruby' },
    sapphire: { name: '蓝宝石', multiplier: 1.8, index: 3, class: 'sapphire' },
    diamond: { name: '钻石', multiplier: 2.0, index: 4, class: 'diamond' } // 修复：倍率改为2.0
};

const RANK_ORDER = ['emerald', 'topaz', 'ruby', 'sapphire', 'diamond'];

function toggleAdvanced() {
    const content = document.getElementById('advancedContent');
    const button = document.querySelector('.toggle-advanced');

    if (content.classList.contains('show')) {
        content.classList.remove('show');
        button.textContent = '高级设置 ▼';
    } else {
        content.classList.add('show');
        button.textContent = '高级设置 ▲';
    }
}

function getWinRate(rank, baseRate, adjustment, emotionalMod = 0) {
    const rankIndex = RANKS[rank].index;
    const adjustedRate = (baseRate / 100) + (4 - rankIndex) * (adjustment / 100) + emotionalMod;
    return Math.max(0.1, Math.min(0.9, adjustedRate));
}

// 修复：升级判定逻辑，考虑最近N把游戏和最低胜场要求
function shouldPromote(rank, recentGames) {
    const total = recentGames.length;
    const wins = recentGames.filter(game => game === 'W').length;

    switch(rank) {
        case 'emerald':
            // 需要至少10把游戏，且最近10把中至少6胜
            if (total < 10) return false;
            const recent10 = recentGames.slice(-10);
            return recent10.filter(game => game === 'W').length >= 6;

        case 'topaz':
            // 需要至少15把游戏，且最近15把中至少9胜
            if (total < 15) return false;
            const recent15 = recentGames.slice(-15);
            return recent15.filter(game => game === 'W').length >= 9;

        case 'ruby':
            // 需要至少20把游戏，且最近20把中至少12胜
            if (total < 20) return false;
            const recent20 = recentGames.slice(-20);
            return recent20.filter(game => game === 'W').length >= 12;

        case 'sapphire':
            // 需要至少20把游戏，且最近20把中至少13胜
            if (total < 20) return false;
            const recent20Sapphire = recentGames.slice(-20);
            return recent20Sapphire.filter(game => game === 'W').length >= 13;

        case 'diamond':
            return false; // 钻石不能升级

        default:
            return false;
    }
}

// 修复：降级判定逻辑，考虑最近N把游戏和最低负场要求
function shouldDemote(rank, recentGames) {
    const total = recentGames.length;
    const losses = recentGames.filter(game => game === 'L').length;

    switch(rank) {
        case 'emerald':
            return false; // 绿宝石不能降级

        case 'topaz':
            // 需要至少15把游戏，且最近15把中至少12负
            if (total < 15) return false;
            const recent15 = recentGames.slice(-15);
            return recent15.filter(game => game === 'L').length >= 12;

        case 'ruby':
            // 需要至少20把游戏，且最近20把中至少13负
            if (total < 20) return false;
            const recent20 = recentGames.slice(-20);
            return recent20.filter(game => game === 'L').length >= 13;

        case 'sapphire':
            // 需要至少20把游戏，且最近20把中至少12负
            if (total < 20) return false;
            const recent20Sapphire = recentGames.slice(-20);
            return recent20Sapphire.filter(game => game === 'L').length >= 12;

        case 'diamond':
            // 需要至少20把游戏，且最近20把中至少11负
            if (total < 20) return false;
            const recent20Diamond = recentGames.slice(-20);
            return recent20Diamond.filter(game => game === 'L').length >= 11;

        default:
            return false;
    }
}

function calculateScore(isWin, winStreak, rank) {
    const baseScore = isWin ? 100 : 0;

    let streakBonus = 0;
    if (winStreak >= 2 && winStreak <= 5) streakBonus = 30;
    else if (winStreak <= 10) streakBonus = 60;
    else if (winStreak > 10) streakBonus = 100;

    const operationBonus = 15; // 操作分
    const totalScore = (baseScore + streakBonus + operationBonus) * RANKS[rank].multiplier;

    return totalScore;
}

function runSimulation() {
    const totalGames = parseInt(document.getElementById('totalGames').value);
    const startLevel = document.getElementById('startLevel').value;
    const baseWinRate = parseFloat(document.getElementById('baseWinRate').value);
    const levelAdjustment = parseFloat(document.getElementById('levelAdjustment').value);
    const emotionalToggle = document.getElementById('emotionalToggle').value === 'true';
    const emotionalStrength = parseInt(document.getElementById('emotionalStrength').value);

    let currentRank = startLevel;
    let gameHistory = [];
    let rankStartIndex = 0;
    let winStreak = 0;
    let totalWins = 0;
    let totalLosses = 0;
    let scoresByRank = {
        emerald: 0,
        topaz: 0,
        ruby: 0,
        sapphire: 0,
        diamond: 0
    };

    for (let i = 0; i < totalGames; i++) {
        let emotionalMod = 0;

        if (emotionalToggle && i >= 10) {
            const recentWins = gameHistory.slice(i - 10, i).filter(game => game === 'W').length;
            emotionalMod = (recentWins - 5) / emotionalStrength;
        }

        const winRate = getWinRate(currentRank, baseWinRate, levelAdjustment, emotionalMod);
        const isWin = Math.random() < winRate;

        gameHistory.push(isWin ? 'W' : 'L');

        if (isWin) {
            winStreak++;
            totalWins++;
        } else {
            winStreak = 0;
            totalLosses++;
        }

        const score = calculateScore(isWin, winStreak, currentRank);
        scoresByRank[currentRank] += score;

        // 修复：检查升级/降级时使用当前段位开始后的所有游戏记录
        const recentGames = gameHistory.slice(rankStartIndex);

        let rankChanged = false;

        if (shouldPromote(currentRank, recentGames)) {
            const currentIndex = RANK_ORDER.indexOf(currentRank);
            if (currentIndex < RANK_ORDER.length - 1) {
                currentRank = RANK_ORDER[currentIndex + 1];
                rankStartIndex = i + 1;
                rankChanged = true;
                // 修复：升级/降级不会打断连胜，所以不重置winStreak
            }
        } else if (shouldDemote(currentRank, recentGames)) {
            const currentIndex = RANK_ORDER.indexOf(currentRank);
            if (currentIndex > 0) {
                currentRank = RANK_ORDER[currentIndex - 1];
                rankStartIndex = i + 1;
                rankChanged = true;
                // 修复：升级/降级不会打断连胜，所以不重置winStreak
            }
        }
    }

    displayResults(scoresByRank, totalGames, totalWins, totalLosses);
}

function displayResults(scoresByRank, totalGames, totalWins, totalLosses) {
    const totalScore = Object.values(scoresByRank).reduce((sum, score) => sum + score, 0);
    const results = document.getElementById('results');
    const resultContent = document.getElementById('resultContent');

    let html = '';

    // 按等级从高到低显示
    const sortedRanks = [...RANK_ORDER].reverse();

    for (const rank of sortedRanks) {
        const score = Math.round(scoresByRank[rank]);
        const percentage = ((scoresByRank[rank] / totalScore) * 100).toFixed(1);
        const rankInfo = RANKS[rank];

        html += `
            <div class="rank-result">
                <span class="rank-name ${rankInfo.class}">${rankInfo.name}</span>
                <span class="rank-percentage ${rankInfo.class}">${score} 分 (${percentage}%)</span>
            </div>
        `;
    }

    const netWins = totalWins - totalLosses;
    const actualWinRate = ((totalWins / totalGames) * 100).toFixed(1);

    html += `
        <div class="summary">
            <strong>模拟总场数：${totalGames}</strong><br>
            <strong>实际胜场：${totalWins} | 负场：${totalLosses}</strong><br>
            <strong>净胜场：${netWins > 0 ? '+' : ''}${netWins}</strong><br>
            <strong>实际胜率：${actualWinRate}%</strong><br>
            <strong>总积分：${Math.round(totalScore)}</strong>
        </div>
    `;

    resultContent.innerHTML = html;
    results.classList.add('show');
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
