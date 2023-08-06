// 计算基础信息的相似分
function calculateBasicScore(card1, card2) {
    const weights = {
        cost: 1,
        clan: 1,
        tribe_name: 2,
        rarity: 1,
        char_type: 1,
        atk: 1,
        life: 1,
        evo_atk: 1,
        evo_life: 1,
    };

    let basicScore = 0;

    // 对比基础信息，并根据权重计算基础分数
    for (const key in weights) {
        if (key in card1 && key in card2) {
            const value1 = card1[key];
            const value2 = card2[key];
            // 简单的对比方式，可以根据实际需求进行更复杂的对比
            if (value1 === value2) {
                basicScore += weights[key];
            }
        }
    }

    return Math.pow(basicScore,2);
  }

function calculateDescriptionScore(card1, card2) {
    const description1 = card1.skill_disc;
    const description2 = card2.skill_disc;

    // 计算 Levenshtein 距离
    const levenshteinDistance = calculateLevenshteinDistance(description1, description2);
    const maxDescriptionLength = Math.max(description1.length, description2.length);

    // 计算描述分数，距离越小表示描述越相似，距离越大表示描述越不相似
    const descriptionScore = (1 - levenshteinDistance / maxDescriptionLength) * 100;

    return descriptionScore;
}

function calculateLevenshteinDistance(s1, s2) {
    const m = s1.length;
    const n = s2.length;
    const dp = new Array(m + 1).fill(null).map(() => new Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) {
        dp[i][0] = i;
    }

    for (let j = 0; j <= n; j++) {
        dp[0][j] = j;
    }

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (s1[i - 1] === s2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
            }
        }
    }

    return dp[m][n];
}

function calculateSimilarityScore(card1, card2) {
    const basicScore = calculateBasicScore(card1, card2);
    const descriptionScore = calculateDescriptionScore(card1, card2);

    // 设置基础分和描述分占比
    const basicScoreWeight = 0.3;
    const descriptionScoreWeight = 0.7;

    // 计算综合相似度分数
    const totalScore = basicScore * basicScoreWeight + descriptionScore * descriptionScoreWeight;

    // 对相似度分数进行百分比压缩，使得与自身的相似度为100
    const similarityScore = (totalScore / (basicScoreWeight + descriptionScoreWeight));

    return similarityScore;
}
