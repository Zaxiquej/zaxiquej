function calculateBasicScore(card1, card2) {
    const weights = {
        cost: 2,
        clan: 2,
        tribe_name: 1,
        char_type: 4,
    };

    const attributeWeights = {
        atk: 0.8,
        life: 0.8,
        evo_atk: 0.8,
        evo_life: 0.8,
    };

    const rarityWeights = {
        1: 1,
        2: 2,
        3: 3,
        4: 4,
    };

    const attributes = ["atk", "life", "evo_atk", "evo_life"];

    let basicScore = 0;
    let attributeScore = 0;

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

    // 计算稀有度的相似分数
    if ("rarity" in card1 && "rarity" in card2) {
        const rarity1 = card1["rarity"];
        const rarity2 = card2["rarity"];
        if (rarity1 in rarityWeights && rarity2 in rarityWeights) {
            const rarityScore = Math.abs(rarityWeights[rarity1] - rarityWeights[rarity2]);
            basicScore += 1/(rarityScore+1);
        }
    }

    // 计算随从属性的相似分数
    if (card1.char_type == 1 && card2.char_type == 1){ //都是随从，额外考虑身材
      for (const attribute of attributes) {
          if (attribute in card1 && attribute in card2) {
              const value1 = card1[attribute];
              const value2 = card2[attribute];
              // 简单的对比方式，可以根据实际需求进行更复杂的对比
              if (value1 && value2) {
                  attributeScore -= attributeWeights[attribute]; //补正
                  attributeScore += attributeWeights[attribute]/(1 + Math.abs(value1 - value2));
              }
          }
      }
    }

    // 将随从属性的相似分数加入基础分数
    basicScore += attributeScore;

    return basicScore * 10;
}
  function calculateDescriptionScore(card1, card2) {
      // Calculate description similarity
      let description1 = card1.skill_disc || '';
      let description2 = card2.skill_disc || '';

      let misc = ["与进化前能力相同。（入场曲 能力除外）", "与进化前能力相同。",""];
      if (!misc.includes(card1.evo_skill_disc)){
        description1 += card1.evo_skill_disc;
      }
      if (!misc.includes(card2.evo_skill_disc)){
        description2 += card2.evo_skill_disc;
      }

      if (description1.length === 0 && description2.length === 0) {
          return 100; // Both are empty descriptions, consider them as similar
      }

      const levenshteinDistance = calculateLevenshteinDistance(description1, description2);
      const maxDescriptionLength = Math.max(description1.length, description2.length);
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

function calculateSkillScore(card1, card2) {
    let cskill1 = card1.skill.replace("//",",");
    let cskill2 = card2.skill.replace("//",",");
    const skills1 = cskill1 ? cskill1.split(",") : [];
    const skills2 = cskill2 ? cskill2.split(",") : [];

    let cskillo1 = card1.skill_option.replace("//",",");
    let cskillo2 = card2.skill_option.replace("//",",");
    const skillso1 = cskillo1 ? cskillo1.split(",") : [];
    const skillso2 = cskillo2 ? cskillo2.split(",") : [];

    let cskillc1 = card1.skill_condition.replace("//",",");
    let cskillc2 = card2.skill_condition.replace("//",",");
    const skillsc1 = cskillc1 ? cskillc1.split(",") : [];
    const skillsc2 = cskillc2 ? cskillc2.split(",") : [];

    if (skills1.length === 0 || skills2.length === 0) {
        return 0;
    }

    // Calculate the number of common skills
    let commonSkills = 0;
    for (let i = 0; i < skills1.length; i++){
      let skill = skills1[i];
      for (let j = 0; j < skills2.length; j++){
        if (skills2[j] == skill) {
            let base = 1;
            const ol = (1 - 0.5 * calculateLevenshteinDistance(skillso1[i], skillso2[j]) / Math.max(skillso1[i].length, skillso2[j].length));
            const cl = (1 - 0.5 * calculateLevenshteinDistance(skillsc1[i], skillsc2[j]) / Math.max(skillsc1[i].length, skillsc2[j].length));
            base *= ol;
            base *= cl;

            commonSkills += base;
        }
      }
    }

    // Calculate the maximum possible similarity score based on the longer skill array
    const maxLength = Math.max(skills1.length, skills2.length);
    const similarity = (commonSkills / maxLength) * 100;

    return similarity;
}

function calculateSimilarityScore(card1, card2) {
    const basicScore = calculateBasicScore(card1, card2);
    const skillScore = calculateSkillScore(card1, card2);
    const descriptionScore = calculateDescriptionScore(card1, card2);

    // 设置基础分和描述分占比
    const basicScoreWeight = 0.2;
    const skillScoreWeight = 0.4;
    const descriptionScoreWeight = 0.4;

    // 计算综合相似度分数
    const totalScore = basicScore * basicScoreWeight + skillScore * skillScoreWeight + descriptionScore * descriptionScoreWeight;

    // 对相似度分数进行百分比压缩，使得与自身的相似度为100
    const similarityScore = (totalScore / (basicScoreWeight + skillScoreWeight + descriptionScoreWeight));

    return similarityScore;
}
