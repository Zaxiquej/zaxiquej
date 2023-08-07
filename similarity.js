  function calculateBasicScore(card1, card2) {
    const weights = {
        clan: 2,
        tribe_name: 1,
        char_type: 4,
    };

    const costweight = 2;

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

    // 计算费用的相似分数
    if ("cost" in card1 && "cost" in card2) {
        const cost1 = card1["cost"];
        const cost2 = card2["cost"];
        if (cost1 && cost2) {
            basicScore += costweight/(1 + Math.abs(cost1 - cost2));
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
      const longestCommonSubstring = findLongestCommonSubstring(description1, description2);
      const minDescriptionLength = Math.min(description1.length, description2.length);
      const maxDescriptionLength = Math.max(description1.length, description2.length);
      const fixingRate = (longestCommonSubstring.length+1)/(minDescriptionLength+1);
      const fixingConst = 0.3; //根据公共子串占比，最多抬高50%的描述分(50分)
      const descriptionScore = (1 - levenshteinDistance / maxDescriptionLength) * 100;
      const descriptionScoreFixed = (1-fixingConst)*descriptionScore + fixingConst*(fixingRate*100 + (1-fixingRate)*descriptionScore)
      return descriptionScoreFixed;
  }

  function findLongestCommonSubstring(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;

    // 创建一个二维数组用于记录子问题的解
    const dp = new Array(len1 + 1).fill(0).map(() => new Array(len2 + 1).fill(0));

    let maxLength = 0; // 记录最长公共子串的长度
    let endIndex = 0; // 记录最长公共子串的结束索引

    // 填充 dp 数组
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;

          if (dp[i][j] > maxLength) {
            maxLength = dp[i][j];
            endIndex = i - 1;
          }
        } else {
          dp[i][j] = 0;
        }
      }
    }

    // 提取最长公共子串
    const longestCommonSubstring = str1.slice(endIndex - maxLength + 1, endIndex + 1);

    return longestCommonSubstring;
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

  function parseItem(item) {
    const matches = item.match(/(.+)([><=]+)(.+)/);
    if (matches && matches.length === 4) {
      const [_, A, sign, B] = matches;
      const parsedB = parseValue(B);
      return [A, sign, parsedB];
    } else if (item === "none") {
      return ["none", "none", 0];
    }
    throw new Error(`Invalid format for item: ${item}`);
  }

  function parseValue(value) {
    const numbers = value.split(":").map(parseFloat);
    if (numbers.length === 2 && numbers.every((num) => !isNaN(num))) {
      return numbers;
    } else if (!isNaN(parseFloat(value)) && parseFloat(value) >= 100000000) {
      return [parseFloat(value)];
    } else {
      return value;
    }
  }

  function mapNumbersToLetters(numbers, cardId, sharedMap) {
    let nextLetterCode = 65; // ASCII code for 'A'
    const map = sharedMap || new Map();

    return numbers.map((num) => {
      if (num === cardId) {
        return "X";
      } else if (map.has(num)) {
        return map.get(num);
      } else {
        const letter = String.fromCharCode(nextLetterCode);
        map.set(num, letter);
        nextLetterCode++;
        return letter;
      }
    });
  }

  function extractLargeNumbersFromString(inputString) {
    const regex = /\b(?:100000000|[1-9]\d{8,})\b/g;
    const largeNumbers = inputString.match(regex) || [];
    return largeNumbers.map(Number);
  }

  function calculateConditionScore(card1,card2,array1, array2) {
    let weirdKeys = ["none","save_target","burial_rite","save_burial_rite_target"];
    function findClosestMatchingIndex(index, targetArray, excludeIndices) {
      let closestIndex = -1;
      let minDifference = Number.MAX_VALUE;

      for (let i = 0; i < targetArray.length; i++) {
        if (excludeIndices.includes(i)) continue;

        const targetItem = targetArray[i];
        const [targetA, targetSign, targetB] = parseItem(targetItem);
        const [currentA, currentSign, currentB] = parseItem(array1[index]);

        if (targetA === currentA) {
          if (targetSign === currentSign) {
            let difference;
            if (typeof targetB === "number" && typeof currentB === "number") {
              difference = Math.abs(targetB - currentB);
            } else if (typeof targetB === "string" && typeof currentB === "string") {
              difference = calculateLevenshteinDistance(targetB, currentB);
            } else {
              continue;
            }

            if (difference < minDifference) {
              minDifference = difference;
              closestIndex = i;
            }
          } else {
            let difference;
            if (typeof targetB === "number" && typeof currentB === "number") {
              difference = Math.abs(targetB - currentB);
            } else if (typeof targetB === "string" && typeof currentB === "string") {
              difference = calculateLevenshteinDistance(targetB, currentB);
            } else {
              continue;
            }

            if (difference < minDifference) {
              minDifference = difference;
              closestIndex = i;
            }
          }
        }
      }

      return closestIndex;
    }

    function parseItem(item) {
      const matches = item.match(/(.+)([><=]+)(.+)/);
      if (matches && matches.length === 4) {
        const [_, A, sign, B] = matches;
        return [A, sign, isNaN(B) ? B : parseFloat(B)];;
      }
      for (let key of weirdKeys){
        if (item === key) {
          return [key,key,0];
        };
      }
      throw new Error(`Invalid format for item: ${item}`);
    }

    let totalScore = 0;
    const visitedIndices = new Set();

    for (let i = 0; i < array1.length; i++) {
      const closestIndex = findClosestMatchingIndex(i, array2, Array.from(visitedIndices));
      if (closestIndex !== -1) {
        visitedIndices.add(closestIndex);

        const [A1, sign1, B1] = parseItem(array1[i]);
        const [A2, sign2, B2] = parseItem(array2[closestIndex]);

        let score = 0;
        if (A1 === A2 && weirdKeys.includes(A1)) {
          score = 1;
        } else if (A1 === A2) {
          if (sign1 === sign2) {
            if (typeof B1 === "array" && typeof B2 === "array"){
              const sharedMap = new Map();
              const mappedB1 = mapNumbersToLetters(array1[2], card1.card_id, sharedMap);
              const mappedB2 = mapNumbersToLetters(array2[2], card2.card_id, sharedMap);
              score = 1 / (calculateLevenshteinDistance(mappedB2, mappedB1) + 1);
            }
            if (typeof B1 === "number" && typeof B2 === "number") {
              score = 1 / (Math.abs(B2 - B1) + 1);
            } else if (typeof B1 === "string" && typeof B2 === "string") {
              score = 1 / (calculateLevenshteinDistance(B2, B1) + 1);
            }
          } else {
            if (typeof B1 === "number" && typeof B2 === "number") {
              score = 1 / (2 * (Math.abs(B2 - B1)/50000000 + 1));
            } else if (typeof B1 === "string" && typeof B2 === "string") {
              score = 1 / (2 * (calculateLevenshteinDistance(B2, B1) + 1));
            }
          }
        } else if (typeof B1 === "array" && typeof B2 === "array"){
          const sharedMap = new Map();
          const mappedB1 = mapNumbersToLetters(array1[2], card1.card_id, sharedMap);
          const mappedB2 = mapNumbersToLetters(array2[2], card2.card_id, sharedMap);
          score = 1 / (calculateLevenshteinDistance(mappedB2, mappedB1) + 1) * (3/4);
        }

        totalScore += score;
      }
    }

    const maxArrayLength = Math.max(array1.length, array2.length);
    const finalScore = (totalScore+1) / (maxArrayLength+1);
    return finalScore;
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
      let chosen = [];
      for (let i = 0; i < skills1.length; i++){
        let skill = skills1[i];
        let nb = 0;
        let id = -1;
        for (let j = 0; j < skills2.length; j++){
          if (chosen.includes(j)){
            continue;
          }
          if (skills2[j] == skill){ //|| (["token_draw","summon_token"].includes(skill) && ["token_draw","summon_token"].includes(skills2[j]))) {
              let base = 1;
              if (!skillso2[j]){skillso2[j] = ""};
              if (!skillsc2[j]){skillsc2[j] = ""};
              if (!skillso1[i]){skillso1[i] = ""};
              if (!skillsc1[i]){skillsc1[i] = ""};
              skillso1[i] = skillso1[i].replaceAll("&&","占")
              skillso2[j] = skillso2[j].replaceAll("&&","占")
              let skillsoArr1 = skillso1[i].split("&");
              let skillsoArr2 = skillso2[j].split("&");
              skillso1[i] = skillso1[i].replaceAll("占","&&")
              skillso2[j] = skillso2[j].replaceAll("占","&&")
              const ol = (1 - 0.5 * (1 - calculateConditionScore(card1, card2, skillsoArr1,skillsoArr2)));

              //const ol = (1 - 0.5 * calculateLevenshteinDistance(skillso1[i], skillso2[j]) / Math.max(skillso1[i].length, skillso2[j].length));

              skillsc1[i] = skillsc1[i].replaceAll("&&","占")
              skillsc2[j] = skillsc2[j].replaceAll("&&","占")
              let skillscArr1 = skillsc1[i].split("&");
              let skillscArr2 = skillsc2[j].split("&");
              skillsc1[i] = skillsc1[i].replaceAll("占","&&")
              skillsc2[j] = skillsc2[j].replaceAll("占","&&")
              const cl = (1 - 0.5 * (1 - calculateConditionScore(card1, card2, skillscArr1,skillscArr2)));

              //const cl = (1 - 0.5 * calculateLevenshteinDistance(skillsc1[i], skillsc2[j]) / Math.max(skillsc1[i].length, skillsc2[j].length));
              base *= ol;
              base *= cl;
              if (base > nb){
                nb = base;
                id = j;
              }
          }
        }
        commonSkills += nb;
        if (id != -1){
          chosen.push(id);
        }
      }

      // Calculate the maximum possible similarity score based on the longer skill array
      const maxLength = Math.max(skills1.length, skills2.length);
      let similarity = (commonSkills / maxLength) * 100;
      return similarity;
  }

  function calculateTokenRate(card1,card2,similarity){
    const sharedMap = new Map();
    const mappedB1 = mapNumbersToLetters(extractLargeNumbersFromString(card1.skill_option), card1.card_id, sharedMap);
    const mappedB2 = mapNumbersToLetters(extractLargeNumbersFromString(card2.skill_option), card2.card_id, sharedMap);

    if (mappedB1.length > 0 && mappedB2.length > 0){
      let rate = 1 / Math.max(mappedB1.length,mappedB2.length)
      let tokenscore = 1 / (calculateLevenshteinDistance(mappedB2, mappedB1) + 1);
      return rate*similarity + (1-rate) *(1 - (1-similarity)*(1-tokenscore));
    }
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
