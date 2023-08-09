let skillRates = keyNameStats();
let skillMaxNum = Math.max(...Object.values(skillRates));

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
        basicScore += costweight/(1 + Math.abs(cost1 - cost2));
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

  let weirdKeys = ["none","save_target","burial_rite","save_burial_rite_target","fromAttach","not_unique_base_card_id_card"];
  function parseItem(item) {
    const matches = item.match(/(.+?)([<>]?=|<|>)(.+)/);
    if (matches && matches.length === 4) {
      const [_, A, sign, B] = matches;
      const parsedB = parseValue(B);
      return [A, sign, parsedB];
    }
    for (let key of weirdKeys){
      if (item === key) {
        return [key,key,0];
      };
    }
    throw new Error(`Invalid format for item: ${item}`);
  }

  function parseValue(value) {
    const numbers = value.split(":").map(parseFloat);
    if (numbers.length === 2 && numbers.every((num) => !isNaN(num))) {
      return numbers;
    } else if (!isNaN(parseFloat(value))) {
      if (parseFloat(value) >= 100000000){
        return [parseFloat(value)];
      } else {
        return parseFloat(value);
      }
    } else {
      return value;
    }
  }

  function mapNumbersToLetters(numbers, cardId, sharedMap) {
    let nextLetterCode = 65; // ASCII code for 'A'
    if (sharedMap["code"] != undefined){
      nextLetterCode = sharedMap["code"];
    }
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
        sharedMap["code"] = nextLetterCode;
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
            if (Array.isArray(targetB) && Array.isArray(currentB)){
              const sharedMap = new Map();
              const mappedB1 = mapNumbersToLetters(targetB, card1.card_id, sharedMap);
              const mappedB2 = mapNumbersToLetters(currentB, card2.card_id, sharedMap);
              difference = calculateLevenshteinDistance(mappedB2, mappedB1);
            }
            else if (typeof targetB === "number" && typeof currentB === "number") {
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
            if (Array.isArray(targetB) && Array.isArray(currentB)){
              const sharedMap = new Map();
              const mappedB1 = mapNumbersToLetters(targetB, card1.card_id, sharedMap);
              const mappedB2 = mapNumbersToLetters(currentB, card2.card_id, sharedMap);
              difference = calculateLevenshteinDistance(targetB, currentB) / Math.max(targetB.length,currentB.length);
            }
            else if (typeof targetB === "number" && typeof currentB === "number") {
              difference = Math.abs(targetB - currentB);
            } else if (typeof targetB === "string" && typeof currentB === "string") {
              difference = calculateLevenshteinDistance(targetB, currentB) / Math.max(targetB.length,currentB.length);
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
            if (Array.isArray(B1) && Array.isArray(B2)){
              const sharedMap = new Map();
              const mappedB1 = mapNumbersToLetters(B1, card1.card_id, sharedMap);
              const mappedB2 = mapNumbersToLetters(B2, card2.card_id, sharedMap);
              score = 1 / (calculateLevenshteinDistance(mappedB2, mappedB1)*4 + 1); //待改
            }
            if (typeof B1 === "number" && typeof B2 === "number") {
              score = 1 / (Math.abs(B2 - B1) + 1);
            } else if (typeof B1 === "string" && typeof B2 === "string") {
              score = 1 - calculateLevenshteinDistance(B2, B1) / Math.max(B1.length,B2.length);
            }
          } else {
            if (typeof B1 === "number" && typeof B2 === "number") {
              score = 1 / (2 * (Math.abs(B2 - B1) + 1));
            } else if (typeof B1 === "string" && typeof B2 === "string") {
              score = (1 - calculateLevenshteinDistance(B2, B1) / Math.max(B1.length,B2.length))/2;
            }
          }
        } else if (Array.isArray(B1) && Array.isArray(B2)){
          const sharedMap = new Map();
          const mappedB1 = mapNumbersToLetters(B1, card1.card_id, sharedMap);
          const mappedB2 = mapNumbersToLetters(B2, card2.card_id, sharedMap);
          score = 1 / (calculateLevenshteinDistance(mappedB2, mappedB1)*2 + 1) * (1/2);
        }
        totalScore += score;
      }
    }

    const maxArrayLength = Math.max(array1.length, array2.length);
    if (maxArrayLength == 0){
      return 1;
    }
    const finalScore = (totalScore) / (maxArrayLength);
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

      let cskillT1 = card1.timing.replace("//",",");
      let cskillT2 = card2.timing.replace("//",",");
      const skillsT1 = cskillT1 ? cskillT1.split(",") : [];
      const skillsT2 = cskillT2 ? cskillT2.split(",") : [];

      //将部分cost加入skill
      let cskillp1 = card1.skill_preprocess.replace("//",",").replaceAll("&",",");
      let cskillp2 = card2.skill_preprocess.replace("//",",").replaceAll("&",",");

      cskillp1 = cskillp1.replaceAll("destroy_tribe=white_ritual:","ritual=");
      cskillp1 = cskillp1.replaceAll("destroy_tribe=white_ritual_all","ritual=X")
      cskillp1 = cskillp1.replaceAll("destroy_tribe=white_ritual","ritual=1");

      cskillp2 = cskillp2.replaceAll("destroy_tribe=white_ritual:","ritual=");
      cskillp2 = cskillp2.replaceAll("destroy_tribe=white_ritual_all","ritual=X")
      cskillp2 = cskillp2.replaceAll("destroy_tribe=white_ritual","ritual=1");

      const skillp1 = cskillp1 ? cskillp1.split(",") : [];
      const skillp2 = cskillp2 ? cskillp2.split(",") : [];

      let cskillt1 = card1.skill_target.replace("//",",");
      let cskillt2 = card2.skill_target.replace("//",",");
      const skillst1 = cskillt1 ? cskillt1.split(",") : [];
      const skillst2 = cskillt2 ? cskillt2.split(",") : [];

      for (let i = 0; i < skills1.length; i++){
        if (skills1[i] == 'attach_skill' && skillso1[i].includes("skill=")){
          let skillObject = parseAttachSkillString(skillso1[i]);
          skills1.push(skillObject.skill);
          if (skillObject.option && skillObject.option!='none'){
            skillso1.push(skillObject.option+'&fromAttach');
          } else {
            skillso1.push('fromAttach');
          }
          if (!skillObject.condition.includes("=")){
            skillObject.condition = 'character=' + skillObject.condition
          }
          skillsc1.push(skillObject.condition);
          if (skillObject.preprocess){
            skillp1.push(skillObject.preprocess)
          } else {
            skillp1.push('none')
          }
          skillst1.push(skillObject.target);
          if (skillObject.timing){
            skillsT1.push(skillObject.timing)
          } else {
            skillsT1.push('none')
          }
          skillso1[i] = 'none';
          if (skillst1[i] == "character=me&target=inplay&card_type=class"){
            //贴主战者
            skills1[i] = 'leader_attach_skill'
          }
        }
      }

      for (let i = 0; i < skills2.length; i++){
        if (skills2[i] == 'attach_skill' && skillso2[i].includes("skill=")){
          let skillObject = parseAttachSkillString(skillso2[i]);
          skills2.push(skillObject.skill);
          if (skillObject.option && skillObject.option!='none'){
            skillso2.push(skillObject.option+'&fromAttach');
          } else {
            skillso2.push('fromAttach');
          }
          if (!skillObject.condition.includes("=")){
            skillObject.condition = 'character=' + skillObject.condition;
          }
          skillsc2.push(skillObject.condition);
          if (skillObject.preprocess){
            skillp2.push(skillObject.preprocess)
          } else {
            skillp2.push('none')
          }
          skillst2.push(skillObject.target);
          if (skillObject.timing){
            skillsT2.push(skillObject.timing)
          } else {
            skillsT2.push('none')
          }
          skillso2[i] = 'none';
          if (skillst2[i] == "character=me&target=inplay&card_type=class"){
            //贴主战者
            skills2[i] = 'leader_attach_skill'
          }
        }
      }

      let keyPros = ["ritual","burial_rite","necromance","use_pp","use_ep","open_card","evolution_end_stop","per_turn"];
      let lkeyPros = ["turn_end_period_of_stop_time","turn_start_skill_after_stop","preprocess_condition"]; //后面跟的一定是字母的
      let repPros = ["turn_end_stop","turn_start_stop","turn_end_remove","only_random_index","remove_from_inplay_stop","per_game","per_turn"]; //容易复读的
      let hasRep = [];

      for (let highItem of skillp1){
        for (let item of customSplit(highItem,'&')){
          let name = item.split("=")[0];
          if (keyPros.includes(name)){
            let cost = item.split(":")[0];
            if (!is_numeric(cost)){
              cost = 'X';
            }
            skills1.push(name);
            if (!cost){
              skillso1.push('none')
            } else {
              skillso1.push("value="+cost)
            }
            skillsc1.push('none');
            skillst1.push('none');
            skillsT1.push('none');
          } else if (lkeyPros.includes(name)){
            let cost = item.split(":")[0];
            skills1.push(name);
            if (!cost){
              skillso1.push('none')
            } else {
              skillso1.push("value="+cost)
            }
            skillsc1.push('none');
            skillst1.push('none');
            skillsT1.push('none');
          } else if (repPros.includes(name) && !hasRep.includes(name)){
            hasRep.push(name)
            let cost = item.split(":")[0];
            skills1.push(name);
            if (!cost){
              skillso1.push('none')
            } else {
              skillso1.push("value="+cost)
            }
            skillsc1.push('none');
            skillst1.push('none');
            skillsT1.push('none');
          } else {
            continue;
          }
        }
      }
      hasRep = [];
      for (let highItem of skillp2){
        for (let item of customSplit(highItem,'&')){
          let name = item.split("=")[0];
          if (keyPros.includes(name)){
            let cost = item.split(":")[0];
            if (!is_numeric(cost)){
              cost = 'X';
            }
            skills2.push(name);
            if (!cost){
              skillso2.push('none')
            } else {
              skillso2.push("value="+cost)
            }
            skillsc2.push('none');
            skillst2.push('none');
            skillsT2.push('none');
          } else if (lkeyPros.includes(name)){
            let cost = item.split(":")[0];
            skills2.push(name);
            if (!cost){
              skillso2.push('none')
            } else {
              skillso2.push("value="+cost)
            }
            skillsc2.push('none');
            skillst2.push('none');
            skillsT2.push('none');
          } else if (repPros.includes(name) && !hasRep.includes(name)){
            hasRep.push(name)
            let cost = item.split(":")[0];
            skills2.push(name);
            if (!cost){
              skillso2.push('none')
            } else {
              skillso2.push("value="+cost)
            }
            skillsc2.push('none');
            skillst2.push('none');
            skillsT2.push('none');
          } else {
            continue;
          }
        }
      }

      let keyProsC = ["cemetery_count","play_count","berserk","wrath","avarice","awake","{me.inplay.class.max_pp}","{self.charge_count}","{op.inplay.unit.count}"]
      let repProsC = ["{me.inplay.class.pp}"];
      let hasRepC = [];

      for (let highItem of skillsc1){
        for (let item of customSplit(highItem,'&')){
          let pattern = /(\{[^}]+\}|[\w]+)\s*([><=]+)\s*(\w+)/;
          let matches = item.match(pattern);
          if (matches){
            let name = matches[1];
            if (name == "pp_count"){
              name = "{me.inplay.class.pp}"
            }
            if (keyProsC.includes(name)){
              if (name == "cemetery_count" && matches[2] != ">="){
                continue;
              }
              let cost = matches[3];
              if (!is_numeric(cost)){
                cost = 'X';
              }
              skills1.push(name);
              if (!cost){
                skillso1.push('none')
              } else {
                skillso1.push("value="+cost)
              }
              skillsc1.push('none');
              skillst1.push('none');
              skillsT1.push('none');
            } else if (repProsC.includes(name) && !hasRepC.includes(name)){
              if (name == "{me.inplay.class.pp}" && skillsT1[skillsc1.indexOf(highItem)] != "self_turn_end"){
                continue;
              }
              hasRepC.push(name)
              let cost = matches[3];
              if (!is_numeric(cost)){
                cost = 'X';
              }
              skills1.push(name);
              if (!cost){
                skillso1.push('none')
              } else {
                skillso1.push("value="+cost)
              }
              skillsc1.push('none');
              skillst1.push('none');
              skillsT1.push('none');
            } else {
              continue;
            }
          }
        }
      }

      hasRepC = [];
      for (let highItem of skillsc2){
        for (let item of customSplit(highItem,'&')){
          let pattern = /(\{[^}]+\}|[\w]+)\s*([><=]+)\s*(\w+)/;
          let matches = item.match(pattern);
          if (matches){
            let name = matches[1];
            if (name == "pp_count"){
              name = "{me.inplay.class.pp}"
            }
            if (keyProsC.includes(name)){
              if (name == "cemetery_count" && matches[2] != ">="){
                continue;
              }
              let cost = matches[3];
              if (!is_numeric(cost)){
                cost = 'X';
              }
              skills2.push(name);
              if (!cost){
                skillso2.push('none')
              } else {
                skillso2.push("value="+cost)
              }
              skillsc2.push('none');
              skillst2.push('none');
              skillsT2.push('none');
            } else if (repProsC.includes(name) && !hasRepC.includes(name)){
              if (name == "{me.inplay.class.pp}" && skillsT2[skillsc2.indexOf(highItem)] != "self_turn_end"){
                continue;
              }
              hasRepC.push(name)
              let cost = matches[3];
              if (!is_numeric(cost)){
                cost = 'X';
              }
              skills2.push(name);
              if (!cost){
                skillso2.push('none')
              } else {
                skillso2.push("value="+cost)
              }
              skillsc2.push('none');
              skillst2.push('none');
              skillsT2.push('none');
            } else {
              continue;
            }
          }
        }
      }

      let wholeKeyProsT = ["character=both"];

      for (let highItem of skillst1){
        for (let item of customSplit(highItem,'&')){
          if (wholeKeyProsT.includes(item)){
            skills1.push(item);
            skillso1.push('none')
            skillsc1.push('none');
            skillst1.push('none');
            skillsT1.push('none');
          }
        }
      }

      for (let highItem of skillst2){
        for (let item of customSplit(highItem,'&')){
          if (wholeKeyProsT.includes(item)){
            skills2.push(item);
            skillso2.push('none')
            skillsc2.push('none');
            skillst2.push('none');
            skillsT2.push('none');
          }
        }
      }
      //特殊判断消除
      for (let i = 0; i < skills1.length; i++){
        if (skills1[i].includes('@')){
          skills1[i] = skills1[i].split('@')[0];
        }
      }
      for (let i = 0; i < skills2.length; i++){
        if (skills2[i].includes('@')){
          skills2[i] = skills2[i].split('@')[0];
        }
      }
      //自残特殊判断
      for (let i = 0; i < skills1.length; i++){
        if (skills1[i] == 'damage' && (skillst1[i] == 'character=me&target=inplay&card_type=class' || skillst1[i] == 'character=both&target=inplay&card_type=class') ){
          skills1[i] = "selfDamage";
        }
      }

      for (let i = 0; i < skills2.length; i++){
        if (skills2[i] == 'damage' && (skillst2[i] == 'character=me&target=inplay&card_type=class' || skillst2[i] == 'character=both&target=inplay&card_type=class') ){
          skills2[i] = "selfDamage";
        }
      }

      //自杀特殊判断

      for (let i = 0; i < skills1.length; i++){
        if (skills1[i] == 'destroy' && skillst1[i].includes('character=me&target=inplay&card_type=unit')){
          skills1[i] = "selfDestroy";
        }
      }

      for (let i = 0; i < skills2.length; i++){
        if (skills2[i] == 'destroy' && skillst2[i].includes('character=me&target=inplay&card_type=unit')){
          skills2[i] = "selfDestroy";
        }
      }


      //跳/扣特殊判断
      for (let i = 0; i < skills1.length; i++){
        if (skills1[i] == 'pp_modifier' && skillso1[i].includes("add_pptotal=")){
          skills1[i] = "ramp";
        }
      }

      for (let i = 0; i < skills2.length; i++){
        if (skills2[i] == 'pp_modifier' && skillso2[i].includes("add_pptotal=")){
          skills2[i] = "ramp";
        }
      }

      //瞬念特殊判断
      for (let i = 0; i < skills1.length; i++){
        if (skills1[i] == 'summon_card' && skillst1[i].includes('character=me&target=deck_self') ){
          skills1[i] = "invocation";
        }
      }

      for (let i = 0; i < skills2.length; i++){
        if (skills2[i] == 'summon_card' && skillst2[i].includes('character=me&target=deck_self') ){
          skills2[i] = "invocation";
        }
      }

      //区分伟大的意志和项链
      for (let i = 0; i < skills1.length; i++){
        if (skills1[i] == 'damage_modifier' && skillso1[i].includes('set_damage=') ){
          skills1[i] = "damage_zero";
        }
      }

      for (let i = 0; i < skills2.length; i++){
        if (skills2[i] == 'damage_modifier' && skillso2[i].includes('set_damage=') ){
          skills2[i] = "damage_zero";
        }
      }

      //区分炸牌库
      for (let i = 0; i < skills1.length; i++){
        if (skills1[i] == 'banish' && skillst1[i].includes('target=deck') ){
          skills1[i] = "banish_deck";
        }
      }

      for (let i = 0; i < skills2.length; i++){
        if (skills2[i] == 'banish' && skillst2[i].includes('target=deck') ){
          skills2[i] = "banish_deck";
        }
      }


      //宇宙词条
      for (let i = 0; i < skills1.length; i++){
        if (containsCosmos(skillso1[i]) || containsCosmos(skillsc1[i])){
          skills1.push("cosmos");
          skillso1.push('none');
          skillsc1.push('none');
          skillst1.push('none');
          skillsT1.push('none');
          break;
        }
      }

      for (let i = 0; i < skills2.length; i++){
        if (containsCosmos(skillso2[i]) || containsCosmos(skillsc2[i])){
          skills2.push("cosmos");
          skillso2.push('none');
          skillsc2.push('none');
          skillst2.push('none');
          skillsT2.push('none');
          break;
        }
      }

      //亡召特殊判断
      for (let i = 0; i < skills1.length; i++){
        if (skills1[i] == 'summon_token' && skillst1[i].includes('character=me&target=destroyed_this_turn_card_list&card_type=unit') ){
          skills1[i] = "revive";
          if (skillso1[i] == 'none'){
            skillso1[i] = "thisTurn=1";
          } else {
            skillso1[i] += "&thisTurn=1";
          }
        }
        if (skills1[i] == 'summon_token' && skillst1[i].includes('character=me&target=destroyed_card_list&card_type=unit') ){
          skills1[i] = "revive";
          let arr = customSplit(skillst1[i],"&");
          let str = "";
          for (let k of arr){
            if (k.includes("status_cost<:=")){
              if (str != ""){str += '&'}
              str += "cost<=" + k.split("status_cost<:=")[1];
            }
            if (k.includes("status_cost<:=")){
              if (str != ""){str += '&'}
              let cost = k.split("status_cost<:=")[1];
              if (is_numeric(cost)){
                str += "cost<=" + cost;
              } else {
                str += "cost<=X";
              }
            }
            if (k.includes("status_cost=")){
              if (str != ""){str += '&'}
              str += "cost<=X";
            }
            if (k.includes("tribe=")){
              if (str != ""){str += '&'}
              str += k;
            }
            if (k.includes("id_no_duplication_random_count=")){
              if (str != ""){str += '&'}
              str += k;
            }
            if (k.includes("clan!=")){
              if (str != ""){str += '&'}
              let cost = k.split("clan!=")[1];
              str += "Nclan"+cost;
            }
            skillso1[i] += str;
          }
        }
      }
      for (let i = 0; i < skills2.length; i++){
        if (skills2[i] == 'summon_token' && skillst2[i].includes('character=me&target=destroyed_this_turn_card_list&card_type=unit') ){
          skills2[i] = "revive";
          if (skillso2[i] == 'none'){
            skillso2[i] = "thisTurn=1";
          } else {
            skillso2[i] += "&thisTurn=1";
          }
        }
        if (skills2[i] == 'summon_token' && skillst2[i].includes('character=me&target=destroyed_card_list&card_type=unit') ){
          skills2[i] = "revive";
          let arr = customSplit(skillst2[i],"&");
          let str = "";
          for (let k of arr){
            if (k.includes("status_cost<:=")){
              if (str != ""){str += '&'}
              str += "cost<=" + k.split("status_cost<:=")[1];
            }
            if (k.includes("status_cost<:=")){
              if (str != ""){str += '&'}
              let cost = k.split("status_cost<:=")[1];
              if (is_numeric(cost)){
                str += "cost<=" + cost;
              } else {
                str += "cost<=X";
              }
            }
            if (k.includes("status_cost=")){
              if (str != ""){str += '&'}
              str += "cost<=X";
            }
            if (k.includes("tribe=")){
              if (str != ""){str += '&'}
              str += k;
            }
            if (k.includes("id_no_duplication_random_count=")){
              if (str != ""){str += '&'}
              str += k;
            }
            if (k.includes("clan!=")){
              if (str != ""){str += '&'}
              let cost = k.split("clan!=")[1];
              str += "Nclan"+cost;
            }
            skillso2[i] += str;
          }
        }
      }

      //套娃特殊词条
      for (let i = 0; i < skills1.length; i++){
        if (skills1[i] == 'summon_token' || skills1[i] == 'token_draw'){
          if (!skillso1[i].includes(skills1[i]) && !skillso1[i].includes('repeat_count')){
            if (skillso1[i] == 'none'){
              if (skills1[i] == 'summon_token'){
                skillso1[i] = "type=summ"
              } else {
                skillso1[i] = "type=draw"
              }
            } else {
              if (skills1[i] == 'summon_token'){
                skillso1[i] += "&type=summ"
              } else {
                skillso1[i] += "&type=draw"
              }
            }

            skills1[i] = 'recycle';
          }
          let arr = skillso1[i].split('&');
          let newStr = [];
          let change = false;
          for (let s of arr){
            if (!s.split(skills1[i]+"=")[1]){
              continue;
            }
            let p = s.split(skills1[i]+"=")[1].split(":");
            if (p.length == 1 && p[0] == card1.card_id){
              change = true;
              if (skills1[i] == 'summon_token'){
                newStr.push("type=summ")
              } else {
                newStr.push("type=draw")
              }
              skills1[i] = 'obtain_self';
            } else if (findCardById(parseInt(p[0]),true)){ //假面，三头犬
              let cName = findCardById(parseInt(p[0]),true).card_name;
              if (cName == card1.card_name){
                change = true;
                if (skills1[i] == 'summon_token'){
                  newStr.push("type=summXX")
                } else {
                  newStr.push("type=drawXX")
                }
                skills1[i] = 'obtain_self';
              } else if (card1.card_parentName && cName == card1.card_parentName){
                change = true;
                if (skills1[i] == 'summon_token'){
                  newStr.push("type=summXX")
                } else {
                  newStr.push("type=drawXX")
                }
                skills1[i] = 'obtain_self_diff';
              }
            } else {
              newStr.push(s)
            }
          }
          if (change){
            skillso1[i] = newStr.join('&');
          }
        }
      }
      for (let i = 0; i < skills2.length; i++){
        if (skills2[i] == 'summon_token' || skills2[i] == 'token_draw'){
          if (!skillso2[i].includes(skills2[i]) && !skillso2[i].includes('repeat_count')){
            if (skillso2[i] == 'none'){
              if (skills2[i] == 'summon_token'){
                skillso2[i] = "type=summ"
              } else {
                skillso2[i] = "type=draw"
              }
            } else {
              if (skills2[i] == 'summon_token'){
                skillso2[i] += "&type=summ"
              } else {
                skillso2[i] += "&type=draw"
              }
            }
            skills2[i] = 'recycle';
          }
          let arr = skillso2[i].split('&');
          let newStr = [];
          let change = false;
          for (let s of arr){
            if (!s.split(skills2[i]+"=")[1]){
              continue;
            }
            let p = s.split(skills2[i]+"=")[1].split(":");
            if (p.length == 1 && p[0] == card2.card_id){
              change = true;
              if (skills2[i] == 'summon_token'){
                newStr.push("type=summ")
              } else {
                newStr.push("type=draw")
              }
              skills2[i] = 'obtain_self';
            } else if (findCardById(parseInt(p[0]),true)){ //假面，三头犬
              let cName = findCardById(parseInt(p[0]),true).card_name;
              if (cName == card2.card_name){
                change = true;
                if (skills2[i] == 'summon_token'){
                  newStr.push("type=summXX")
                } else {
                  newStr.push("type=drawXX")
                }
                skills2[i] = 'obtain_self';
              } else if (card2.card_parentName && cName == card2.card_parentName){
                change = true;
                if (skills2[i] == 'summon_token'){
                  newStr.push("type=summXX")
                } else {
                  newStr.push("type=drawXX")
                }
                skills2[i] = 'obtain_self_diff';
              }
            } else {
              newStr.push(s)
            }
          }
          if (change){
            skillso2[i] = newStr.join('&');
          }
        }
      }

      for (let i = 0; i < skills1.length; i++){
        if (skills1[i] == 'update_deck'){
          let arr = skillso1[i].split('&');
          let newStr = [];
          let change = false;
          for (let s of arr){
            if (!s.split("token_draw=")[1]){
              continue;
            }
            let p = s.split("token_draw=")[1].split(":");
            if (p[0] == card1.card_id){
              change = true;
              newStr.push("type=deck")
              skills1[i] = 'obtain_self';
            } else if (findCardById(parseInt(p[0]),true)){ //假面，三头犬
              let cName = findCardById(parseInt(p[0]),true).card_name;
              if (cName == card1.card_name){
                change = true;
                newStr.push("type=deckXX");
                skills1[i] = 'obtain_self';
              } else if (card1.card_parentName && cName == card1.card_parentName){
                change = true;
                newStr.push("type=deckXX");
                skills1[i] = 'obtain_self_diff';
              }
          }
          if (change){
            skillso1[i] = newStr.join('&');
          }
        }
      }
      }
      for (let i = 0; i < skills2.length; i++){
        if (skills2[i] == 'update_deck'){
          let arr = skillso2[i].split('&');
          let newStr = [];
          let change = false;
          for (let s of arr){
            if (!s.split("token_draw=")[1]){
              continue;
            }
            let p = s.split("token_draw=")[1].split(":");
            if (p[0] == card2.card_id){
              change = true;
              newStr.push("type=deck")
              skills2[i] = 'obtain_self';
            } else if (findCardById(parseInt(p[0]),true)){ //假面，三头犬
              let cName = findCardById(parseInt(p[0]),true).card_name;
              if (cName == card2.card_name){
                change = true;
                newStr.push("type=deckXX");
                skills2[i] = 'obtain_self';
              } else if (card2.card_parentName && cName == card2.card_parentName){
                change = true;
                newStr.push("type=deckXX");
                skills2[i] = 'obtain_self_diff';
              }
          }
          if (change){
            skillso2[i] = newStr.join('&');
          }
        }
      }
      }

      //长随机token
      for (let i = 0; i < skillso1.length; i++){
        if (skillso1[i].includes('token_draw=') && skillso1[i].split(":").length>=4){
          skills1.push("long_token_draw");
          if (skillso1[i].includes("?")){
            skillso1.push('random=2');
          } else {
            skillso1.push('random=0');
          }
          skillsc1.push('none');
          skillst1.push('none');
          skillsT1.push('none');
          break;
        }
      }

      for (let i = 0; i < skillso2.length; i++){
        if (skillso2[i].includes('token_draw=') && skillso2[i].split(":").length>=4){
          skills2.push("long_token_draw");
          if (skillso2[i].includes("?")){
            skillso2.push('random=2');
          } else {
            skillso2.push('random=0');
          }
          skillsc2.push('none');
          skillst2.push('none');
          skillsT2.push('none');
          break;
        }
      }

    //  if (card2.card_name == card1.card_name){
    //    console.log(skills1,skillsc1,skillst1,skillsT1,skillso1)
    //    console.log(skills2,skillsc2,skillst2,skillsT2,skillso2)
    //  }
      //移除变身
      for (let i = 0; i < skills1.length; i++){
        if (skills1[i] == 'transform'){
          skills1.splice(i,1);
          skillso1.splice(i,1);
          skillst1.splice(i,1);
          skillsc1.splice(i,1);
          skillsT1.splice(i,1);
          i--;
        }
      }

      for (let i = 0; i < skills2.length; i++){
        if (skills2[i] == 'transform'){
          skills2.splice(i,1);
          skillso2.splice(i,1);
          skillst2.splice(i,1);
          skillsc2.splice(i,1);
          skillsT2.splice(i,1);
          i--;
        }
      }

      //激奏结晶
      for (let i = 0; i < skills1.length; i++){
        if (skills1[i] == 'pp_fixeduse' && (skillsT1[i] == 'when_accelerate' || skillsT1[i] == 'when_crystallize')){
          skills1[i] = 'accelerateORcrystallize';
        }
      }

      for (let i = 0; i < skills2.length; i++){
        if (skills2[i] == 'pp_fixeduse' && (skillsT2[i] == 'when_accelerate' || skillsT2[i] == 'when_crystallize')){
          skills2[i] = 'accelerateORcrystallize';
        }
      }

      if (skills1.length === 0 || skills2.length === 0) {
          return 0;
      }

      // Calculate the number of common skills
      let commonSkills = 0;
      let chosen = [];
      let ex = 0;
      for (let i = 0; i < skills1.length; i++){
        let skill = skills1[i];
        let nb = 0;
        let id = -1;
        let r = 1;
        let sr = 1;
        let ar = 1;
        for (let j = 0; j < skills2.length; j++){
          if (chosen.includes(j)){
            continue;
          }
          if (skills2[j] == skill){ //|| (["token_draw","summon_token"].includes(skill) && ["token_draw","summon_token"].includes(skills2[j]))) {
              let base = 1;
              let ratio = 1;
              let sRatio = 1;
              let aRatio = 1;

              if (['leader_attach_skill'].includes(skill)){
                sRatio *= 0.4;
              }

              if (['accelerateORcrystallize'].includes(skill)){
                sRatio *= 0.8;
              }

              ratio = Math.sqrt(ratioTable[skill]);

              if (skillso1[i].includes('fromAttach') && skillso2[j].includes('fromAttach')){
                //主战者能力对上有增权
                aRatio = 6;
              } else if (skillso1[i].includes('fromAttach') || skillso2[j].includes('fromAttach')){
                //主战者能力对上有增权
                aRatio = 2;
              }

              aRatio *= Math.pow(ratioTable[skill],0.25);

              let oRate = 1/Math.pow(Math.min(skills1.length, skills2.length) + 1,0.7);
              let cRate = (1/Math.pow(Math.min(skills1.length, skills2.length) + 1,0.7))/1.25;
              let tRate = (1/Math.pow(Math.min(skills1.length, skills2.length) + 1,0.7))/1.25;
              let timingRate = (1/Math.pow(Math.min(skills1.length, skills2.length) + 1,0.7))/1.1;

              if (["summon_token","token_draw"].includes(skill)){
                oRate = 1 - (1-oRate)/2;
              }

              if (["powerup","damage","power_down"].includes(skill)){
                tRate = 1 - (1-tRate)*0.9;
              }

              if (!skillso2[j]){skillso2[j] = ""};
              if (!skillsc2[j]){skillsc2[j] = ""};
              if (!skillso1[i]){skillso1[i] = ""};
              if (!skillsc1[i]){skillsc1[i] = ""};
              skillso1[i] = skillso1[i].replaceAll("&&","占")
              skillso2[j] = skillso2[j].replaceAll("&&","占")
              let skillsoArr1 = customSplit(skillso1[i],"&");
              let skillsoArr2 = customSplit(skillso2[j],"&");
              skillso1[i] = skillso1[i].replaceAll("占","&&")
              skillso2[j] = skillso2[j].replaceAll("占","&&")
              const ol = (1 - oRate * (1 - calculateConditionScore(card1, card2, skillsoArr1,skillsoArr2)));

              //const ol = (1 - 0.5 * calculateLevenshteinDistance(skillso1[i], skillso2[j]) / Math.max(skillso1[i].length, skillso2[j].length));

              skillsc1[i] = skillsc1[i].replaceAll("&&","占")
              skillsc2[j] = skillsc2[j].replaceAll("&&","占")
              let skillscArr1 = customSplit(skillsc1[i],"&");
              let skillscArr2 = customSplit(skillsc2[j],"&");;
              skillsc1[i] = skillsc1[i].replaceAll("占","&&")
              skillsc2[j] = skillsc2[j].replaceAll("占","&&")
              //condition 里无cd和cd自己基本上等同
              skillscArr1 = skillscArr1.map(item => (item === "none" ? "character=me" : item));
              skillscArr2 = skillscArr2.map(item => (item === "none" ? "character=me" : item));
              const cl = (1 - cRate * (1 - calculateConditionScore(card1, card2, skillscArr1,skillscArr2)));

              skillst1[i] = skillst1[i].replace(/\{([^}]+)\}/g, 'character=$1');
              skillst2[j] = skillst2[j].replace(/\{([^}]+)\}/g, 'character=$1');

              skillst1[i] = skillst1[i].replaceAll("&&","占")
              skillst2[j] = skillst2[j].replaceAll("&&","占")
              let skillstArr1 = customSplit(skillst1[i],"&");
              let skillstArr2 = customSplit(skillst2[j],"&");
              skillst1[i] = skillst1[i].replaceAll("占","&&")
              skillst2[j] = skillst2[j].replaceAll("占","&&")

              const tl = (1 - tRate * (1 - calculateConditionScore(card1, card2, skillstArr1,skillstArr2)));

            //  skillsT1[i] = skillsT1[i].replaceAll("&&","占")
            //  skillsT2[j] = skillsT2[j].replaceAll("&&","占")
            //  let skillsTArr1 = customSplit(skillsT1[i],"&");
            //  let skillsTArr2 = customSplit(skillsT2[j],"&");
            //  skillsT1[i] = skillsT1[i].replaceAll("占","&&")
            //  skillsT2[j] = skillsT2[j].replaceAll("占","&&")
              const timingl = (1 - timingRate * (calculateLevenshteinDistance(skillsT1[i], skillsT2[j]) / Math.max(skillsT1[i].length, skillsT2[j].length)));

              base *= ol;
              base *= cl;
              base *= tl;
              base *= timingl;

              //const cl = (1 - 0.5 * calculateLevenshteinDistance(skillsc1[i], skillsc2[j]) / Math.max(skillsc1[i].length, skillsc2[j].length));
              if (base > nb){
                nb = base;
                id = j;
                r = ratio;
                sr = sRatio;
                ar = aRatio;
              }
          }
        }
        commonSkills += nb*sr + ar*(r-1);
        ex += (ar-1)*(r-1) + sr - 1;
        if (id != -1){
          chosen.push(id);
        }
      }

      // Calculate the maximum possible similarity score based on the longer skill array
      let skills1Sum = 0;
      for (let skill of skills1){
        skills1Sum += Math.sqrt(ratioTable[skill]);
      }
      let skills2Sum = 0;
      for (let skill of skills2){
        skills2Sum += Math.sqrt(ratioTable[skill]);
      }

      const maxLength = Math.max(skills1Sum,skills2Sum) + ex;
      let similarity = Math.pow((commonSkills / maxLength),2/3) * 100;
      return similarity;
  }

  function is_numeric(str){
    return /^\d+$/.test(str);
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

  function calculateSimilarityScore(card1, card2, midR) {
      let basicScore = calculateBasicScore(card1, card2);
      let skillScore = calculateSkillScore(card1, card2);
      const descriptionScore = calculateDescriptionScore(card1, card2);

      // 设置基础分和描述分占比
      const basicScoreWeight = 0.2;
      const skillScoreWeight = 0.5;
      const descriptionScoreWeight = 0.3;
      //处理卡牌变形（结晶、激奏、抉择）

      let cskill1 = card1.skill.replace("//",",");
      let cskill2 = card2.skill.replace("//",",");
      const skills1 = cskill1 ? cskill1.split(",") : [];
      const skills2 = cskill2 ? cskill2.split(",") : [];
      let cskillo1 = card1.skill_option.replace("//",",");
      let cskillo2 = card2.skill_option.replace("//",",");
      const skillso1 = cskillo1 ? cskillo1.split(",") : [];
      const skillso2 = cskillo2 ? cskillo2.split(",") : [];

      let transSub1 = [];

      for (let i = 0; i < skills1.length; i++){
        if (skills1[i] == 'transform' && skillso1[i].includes('card_id=') ){
          transSub1.push(parseInt(skillso1[i].split('card_id=')[1]));
        }
        if (i >= 1 && skills1[i] == 'transform' && skillso1[i].includes('repeat_count=1&summon_side=me') && skills1[i-1] == 'choice' && skillso1[i-1].includes('card_id=')){
          let sub = skillso1[i-1].split('card_id=')[1].split(":");
          for (let cardId of sub){
            transSub1.push(parseInt(cardId));
          }
        }
      }

      let transSub2 = [];

      for (let i = 0; i < skills2.length; i++){
        if (skills2[i] == 'transform' && skillso2[i].includes('card_id=') ){
          transSub2.push(parseInt(skillso2[i].split('card_id=')[1]));
        }
        if (i >= 1 && skills2[i] == 'transform' && skillso2[i].includes('repeat_count=1&summon_side=me') && skills2[i-1] == 'choice' && skillso2[i-1].includes('card_id=')){
          let sub = skillso2[i-1].split('card_id=')[1].split(":");
          for (let cardId of sub){
            transSub2.push(parseInt(cardId));
          }
        }
      }

      if (transSub1.length > 0 || transSub2.length > 0){
          transSub1.push(card1.card_id);
          transSub2.push(card2.card_id);
          let occupied = [];
          let scores = [];
          let switched = false;
          if (transSub1.length > transSub2.length){
            switched = true;
            swapArrays(transSub1,transSub2);
          }

          basicScore = 0;
          for (let i = 0; i < transSub1.length; i++){
            cid1 = transSub1[i];
            for (let j = 0; j < transSub2.length; j++){
              cid2 = transSub2[j];
              const strNumber1 = cid1.toString();
              const strNumber2 = cid2.toString();
              let nCard1;
              let nCard2;
              nCard1 = findCardById(parseInt(cid1),strNumber1.charAt(0) === "8");
              nCard2 = findCardById(parseInt(cid2),strNumber2.charAt(0) === "8");
              let newBasicScore = calculateBasicScore(nCard1, nCard2);
              if (newBasicScore > basicScore){
                basicScore = newBasicScore;
              }
            }
          }

          for (let i = 0; i < transSub1.length; i++){
            cid1 = transSub1[i];
            let max = 0;
            let maxId = -1;
            for (let j = 0; j < transSub2.length; j++){
              if (!occupied.includes(j)){
                cid2 = transSub2[j];
                const strNumber1 = cid1.toString();
                const strNumber2 = cid2.toString();
                let nCard1;
                let nCard2;
                nCard1 = findCardById(parseInt(cid1),strNumber1.charAt(0) === "8");
                nCard2 = findCardById(parseInt(cid2),strNumber2.charAt(0) === "8");
                if (transSub1[i] != card1.card_id){
                  nCard1.card_parentName = card1.card_name;
                }
                if (transSub2[j] != card2.card_id){
                  nCard2.card_parentName = card2.card_name;
                }
                let newSkillScore = calculateSkillScore(nCard1, nCard2);
                if (newSkillScore > max){
                  max = newSkillScore;
                  maxId = j;
                }
              }
            }
            occupied[i] = maxId;
            scores[i] = max;
          }
          skillScore = 0;

          let zeroCab = 1 + 1/Math.max(transSub1.length,transSub2.length)/2.5;
          let selfBonus = 1.5;
          for (let i = 0; i < transSub1.length; i++){
            if (scores[i]!=undefined){
              if ((transSub1[i] == card1.card_id && transSub2[occupied[i]] == card2.card_id) || (transSub1[i] == card2.card_id && transSub2[occupied[i]] == card1.card_id && switched)){ //本体对上加成
                skillScore += scores[i]*selfBonus;
              } else {
                skillScore += scores[i];
              }
            }
          }
          //basicScore /= (Math.abs(transSub1.length - transSub2.length) / zeroCab) + Math.min(transSub1.length,transSub2.length) + (selfBonus-1);
          skillScore /= (Math.abs(transSub1.length - transSub2.length) / zeroCab) + Math.min(transSub1.length,transSub2.length) + (selfBonus-1);
      }

      if (midR == 1){
        return basicScore;
      }
      if (midR == 2){
        return skillScore;
      }

      // 计算综合相似度分数
      const totalScore = basicScore * basicScoreWeight + skillScore * skillScoreWeight + descriptionScore * descriptionScoreWeight;

      // 对相似度分数进行百分比压缩，使得与自身的相似度为100
      const similarityScore = (totalScore / (basicScoreWeight + skillScoreWeight + descriptionScoreWeight));

      return similarityScore;
  }

  function parseAttachSkillString(skillString) {
    const matches = skillString.match(/\(([^:]+):([^)]+)\)/g);
    const skillObject = {};

    if (matches) {
      for (let match of matches) {
        const parts = match.match(/\(([^:]+):([^)]+)\)/);
        if (parts && parts.length === 3) {
          const key = parts[1];
          const value = parts[2];
          skillObject[key] = value;
        }
      }
    }

    return skillObject;
  }

function customSplit(input,token) {
  if (!input){
    return [];
  }
  const parts = [];
  let currentPart = '';
  let openBrackets = 0;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (char === token && openBrackets === 0) {
      parts.push(currentPart);
      currentPart = '';
    } else {
      currentPart += char;
      if (char === '(' || char === '[' || char === '{') {
        openBrackets++;
      } else if (char === ')' || char === ']' || char === '}') {
        openBrackets = Math.max(openBrackets - 1, 0);
      }
    }
  }

  if (currentPart !== '') {
    parts.push(currentPart);
  }

  return parts;
}

  function findCardById(id,isSub) {
    if (isSub){
      return subCardData.find((card) => card.card_id === id);
    } else {
      return cardData.find((card) => card.card_id === id);
    }
  }

  function swapArrays(arr1, arr2) {
    const tempArray = [...arr1]; // 创建 arr1 的副本
    arr1.length = 0; // 清空 arr1
    arr1.push(...arr2); // 将 arr2 中的元素复制到 arr1
    arr2.length = 0; // 清空 arr2
    arr2.push(...tempArray); // 将 tempArray 中的元素复制到 arr2
  }

  function containsCosmos(input) {
    const regex1 = /me\.deck\.(?:base_card_id!=\d{9}\.)?unique_base_card_id_card\.count/;
    const regex2 = /me\.deck\.tribe!=(\w+)\.unique_base_card_id_card\.count={me\.deck\.tribe!=(\w+)\.count}/
    return regex1.test(input) || regex2.test(input);
  }

  function keyNameStats(){
    let keyStats = {};
    for (let card1 of cardData){
      let skills1 = generateSkills(card1)
      for (let sk of skills1){
        if (!keyStats[sk]){
          keyStats[sk] = 0;
        }
        keyStats[sk]++;
      }
    }
    return keyStats;
  }


  function generateSkills(card1){
    let cskill1 = card1.skill.replace("//",",");
    let skills1 = cskill1 ? cskill1.split(",") : [];

    let cskillo1 = card1.skill_option.replace("//",",");
    const skillso1 = cskillo1 ? cskillo1.split(",") : [];

    let cskillc1 = card1.skill_condition.replace("//",",");
    const skillsc1 = cskillc1 ? cskillc1.split(",") : [];

    let cskillT1 = card1.timing.replace("//",",");
    const skillsT1 = cskillT1 ? cskillT1.split(",") : [];

    //将部分cost加入skill
    let cskillp1 = card1.skill_preprocess.replace("//",",").replaceAll("&",",");

    cskillp1 = cskillp1.replaceAll("destroy_tribe=white_ritual:","ritual=");
    cskillp1 = cskillp1.replaceAll("destroy_tribe=white_ritual_all","ritual=X")
    cskillp1 = cskillp1.replaceAll("destroy_tribe=white_ritual","ritual=1");

    let transSub1 = [];

    for (let i = 0; i < skills1.length; i++){
      if (skills1[i] == 'transform' && skillso1[i].includes('card_id=') ){
        transSub1.push(parseInt(skillso1[i].split('card_id=')[1]));
      }
      if (i >= 1 && skills1[i] == 'transform' && skillso1[i].includes('repeat_count=1&summon_side=me') && skills1[i-1] == 'choice' && skillso1[i-1].includes('card_id=')){
        let sub = skillso1[i-1].split('card_id=')[1].split(":");
        for (let cardId of sub){
          transSub1.push(parseInt(cardId));
        }
      }
    }

    const skillp1 = cskillp1 ? cskillp1.split(",") : [];

    let cskillt1 = card1.skill_target.replace("//",",");
    const skillst1 = cskillt1 ? cskillt1.split(",") : [];

    for (let i = 0; i < skills1.length; i++){
      if (skills1[i] == 'attach_skill' && skillso1[i].includes("skill=")){
        let skillObject = parseAttachSkillString(skillso1[i]);
        skills1.push(skillObject.skill);
        if (skillObject.option && skillObject.option!='none'){
          skillso1.push(skillObject.option+'&fromAttach');
        } else {
          skillso1.push('fromAttach');
        }
        if (!skillObject.condition.includes("=")){
          skillObject.condition = 'character=' + skillObject.condition;
        }
        skillsc1.push(skillObject.condition);
        if (skillObject.preprocess){
          skillp1.push(skillObject.preprocess)
        } else {
          skillp1.push('none')
        }
        skillst1.push(skillObject.target);
        skillso1[i] = 'none';
        if (skillst1[i] == "character=me&target=inplay&card_type=class"){
          //贴主战者
          skills1[i] = 'leader_attach_skill'
        }
        if (skillObject.timing){
          skillsT1.push(skillObject.timing)
        } else {
          skillsT1.push('none')
        }
      }
    }
    let keyPros = ["ritual","burial_rite","necromance","use_pp","use_ep","open_card","evolution_end_stop","per_turn"];
    let lkeyPros = ["turn_end_period_of_stop_time","turn_start_skill_after_stop","preprocess_condition"]; //后面跟的一定是字母的
    let repPros = ["turn_end_stop","turn_start_stop","turn_end_remove","only_random_index","remove_from_inplay_stop","per_game","per_turn"]; //容易复读的
    let hasRep = [];

    for (let highItem of skillp1){
      for (let item of customSplit(highItem,'&')){
        let name = item.split("=")[0];
        if (keyPros.includes(name)){
          let cost = item.split(":")[0];
          if (!is_numeric(cost)){
            cost = 'X';
          }
          skills1.push(name);
          if (!cost){
            skillso1.push('none')
          } else {
            skillso1.push("value="+cost)
          }
          skillsc1.push('none');
          skillst1.push('none');
          skillsT1.push('none');
        } else if (lkeyPros.includes(name)){
          let cost = item.split(":")[0];
          skills1.push(name);
          if (!cost){
            skillso1.push('none')
          } else {
            skillso1.push("value="+cost)
          }
          skillsc1.push('none');
          skillst1.push('none');
          skillsT1.push('none');
        } else if (repPros.includes(name) && !hasRep.includes(name)){
          hasRep.push(name)
          let cost = item.split(":")[0];
          skills1.push(name);
          if (!cost){
            skillso1.push('none')
          } else {
            skillso1.push("value="+cost)
          }
          skillsc1.push('none');
          skillst1.push('none');
          skillsT1.push('none');
        } else {
          continue;
        }
      }
    }

    let keyProsC = ["cemetery_count","play_count","berserk","wrath","avarice","awake","{me.inplay.class.max_pp}","{self.charge_count}","{op.inplay.unit.count}"]
    let repProsC = ["{me.inplay.class.pp}"];
    let hasRepC = [];

    for (let highItem of skillsc1){
      for (let item of customSplit(highItem,'&')){
        let pattern = /(\{[^}]+\}|[\w]+)\s*([><=]+)\s*(\w+)/;
        let matches = item.match(pattern);
        if (matches){
          let name = matches[1];
          if (name == "pp_count"){
            name = "{me.inplay.class.pp}"
          }
          if (keyProsC.includes(name)){
            if (name == "cemetery_count" && matches[2] != ">="){
              continue;
            }
            let cost = matches[3];
            if (!is_numeric(cost)){
              cost = 'X';
            }
            skills1.push(name);
            if (!cost){
              skillso1.push('none')
            } else {
              skillso1.push("value="+cost)
            }
            skillsc1.push('none');
            skillst1.push('none');
            skillsT1.push('none');
          } else if (repProsC.includes(name) && !hasRepC.includes(name)){
            if (name == "{me.inplay.class.pp}" && skillsT1[skillsc1.indexOf(highItem)] != "self_turn_end"){
              continue;
            }
            hasRepC.push(name)
            let cost = matches[3];
            if (!is_numeric(cost)){
              cost = 'X';
            }
            skills1.push(name);
            if (!cost){
              skillso1.push('none')
            } else {
              skillso1.push("value="+cost)
            }
            skillsc1.push('none');
            skillst1.push('none');
            skillsT1.push('none');
          } else {
            continue;
          }
        }
      }
    }

    let wholeKeyProsT = ["character=both"];

    for (let highItem of skillst1){
      for (let item of customSplit(highItem,'&')){
        if (wholeKeyProsT.includes(item)){
          skills1.push(item);
          skillso1.push('none')
          skillsc1.push('none');
          skillst1.push('none');
          skillsT1.push('none');
        }
      }
    }

    //特殊判断消除
    for (let i = 0; i < skills1.length; i++){
      if (skills1[i].includes('@')){
        skills1[i] = skills1[i].split('@')[0];
      }
    }
    //自残特殊判断
    for (let i = 0; i < skills1.length; i++){
      if (skills1[i] == 'damage' && (skillst1[i] == 'character=me&target=inplay&card_type=class' || skillst1[i] == 'character=both&target=inplay&card_type=class') ){
        skills1[i] = "selfDamage";
      }
    }

    //自杀特殊判断
    for (let i = 0; i < skills1.length; i++){
      if (skills1[i] == 'destroy' && skillst1[i].includes('character=me&target=inplay&card_type=unit')){
        skills1[i] = "selfDestroy";
      }
    }

    //跳/扣特殊判断
    for (let i = 0; i < skills1.length; i++){
      if (skills1[i] == 'pp_modifier' && skillso1[i].includes("add_pptotal=")){
        skills1[i] = "ramp";
      }
    }

    //瞬念特殊判断
    for (let i = 0; i < skills1.length; i++){
      if (skills1[i] == 'summon_card' && skillst1[i].includes('character=me&target=deck_self') ){
        skills1[i] = "invocation";
      }
    }

    //区分伟大的意志和项链
    for (let i = 0; i < skills1.length; i++){
      if (skills1[i] == 'damage_modifier' && skillso1[i].includes('set_damage=') ){
        skills1[i] = "damage_zero";
      }
    }

    //区分炸牌库
    for (let i = 0; i < skills1.length; i++){
      if (skills1[i] == 'banish' && skillst1[i].includes('target=deck') ){
        skills1[i] = "banish_deck";
      }
    }

    //宇宙词条
    for (let i = 0; i < skills1.length; i++){
      if (containsCosmos(skillso1[i]) || containsCosmos(skillsc1[i])){
        skills1.push("cosmos");
        skillso1.push('none');
        skillsc1.push('none');
        skillst1.push('none');
        skillsT1.push('none');
        break;
      }
    }


        //亡召

        for (let i = 0; i < skills1.length; i++){
          if (skills1[i] == 'summon_token' && skillst1[i].includes('character=me&target=destroyed_this_turn_card_list&card_type=unit') ){
            skills1[i] = "revive";
            if (skillso1[i] == 'none'){
              skillso1[i] = "thisTurn=1";
            } else {
              skillso1[i] += "&thisTurn=1";
            }
          }
          if (skills1[i] == 'summon_token' && skillst1[i].includes('character=me&target=destroyed_card_list&card_type=unit') ){
            skills1[i] = "revive";
            let arr = customSplit(skillst1[i],"&");
            let str = "";
            for (let k of arr){
              if (k.includes("status_cost<:=")){
                if (str != ""){str += '&'}
                str += "cost<=" + k.split("status_cost<:=")[1];
              }
              if (k.includes("status_cost<:=")){
                if (str != ""){str += '&'}
                let cost = k.split("status_cost<:=")[1];
                if (is_numeric(cost)){
                  str += "cost<=" + cost;
                } else {
                  str += "cost<=X";
                }
              }
              if (k.includes("status_cost=")){
                if (str != ""){str += '&'}
                str += "cost<=X";
              }
              if (k.includes("tribe=")){
                if (str != ""){str += '&'}
                str += k;
              }
              if (k.includes("id_no_duplication_random_count=")){
                if (str != ""){str += '&'}
                str += k;
              }
              if (k.includes("clan!=")){
                if (str != ""){str += '&'}
                let cost = k.split("clan!=")[1];
                str += "Nclan"+cost;
              }
              skillso1[i] += str;
            }
          }
        }

    //套娃特殊词条
    for (let i = 0; i < skills1.length; i++){
      if (skills1[i] == 'summon_token' || skills1[i] == 'token_draw'){
        if (!skillso1[i].includes(skills1[i]) && !skillso1[i].includes('repeat_count')){
          if (skillso1[i] == 'none'){
            if (skills1[i] == 'summon_token'){
              skillso1[i] = "type=summ"
            } else {
              skillso1[i] = "type=draw"
            }
          } else {
            if (skills1[i] == 'summon_token'){
              skillso1[i] += "&type=summ"
            } else {
              skillso1[i] += "&type=draw"
            }
          }

          skills1[i] = 'recycle';
        }
        let arr = skillso1[i].split('&');
        let newStr = [];
        let change = false;
        for (let s of arr){
          if (!s.split(skills1[i]+"=")[1]){
            continue;
          }
          let p = s.split(skills1[i]+"=")[1].split(":");
          if (p.length == 1 && p[0] == card1.card_id){
            change = true;
            if (skills1[i] == 'summon_token'){
              newStr.push("type=summ")
            } else {
              newStr.push("type=draw")
            }
            skills1[i] = 'obtain_self';
          } else if (findCardById(parseInt(p[0]),true) && findCardById(parseInt(p[0]),true).card_name == card1.card_name){ //假面，三头犬
            change = true;
            if (skills1[i] == 'summon_token'){
              newStr.push("type=summXX")
            } else {
              newStr.push("type=drawXX")
            }
            skills1[i] = 'obtain_self';
          } else {
            newStr.push(s)
          }
        }
        if (change){
          skillso1[i] = newStr.join('&');
        }
      }
    }

    for (let i = 0; i < skills1.length; i++){
      if (skills1[i] == 'update_deck'){
        let arr = skillso1[i].split('&');
        let newStr = [];
        let change = false;
        for (let s of arr){
          if (!s.split("token_draw=")[1]){
            continue;
          }
          let p = s.split("token_draw=")[1].split(":");
          if (p[0] == card1.card_id){
            change = true;
            newStr.push("type=deck")
            skills1[i] = 'obtain_self';
          } else if (findCardById(parseInt(p[0]),true) && findCardById(parseInt(p[0]),true).card_name == card1.card_name){ //假面，三头犬
            change = true;
            newStr.push("type=deckXX")
            skills1[i] = 'obtain_self';
          } else {
            newStr.push(s)
          }
        }
        if (change){
          skillso1[i] = newStr.join('&');
        }
      }
    }

    //长随机token
    for (let i = 0; i < skillso1.length; i++){
      if (skillso1[i].includes('token_draw=') && skillso1[i].split(":").length>=4){
        skills1.push("long_token_draw");
        if (skillso1[i].includes("?")){
          skillso1.push('random=2');
        } else {
          skillso1.push('random=0');
        }
        skillsc1.push('none');
        skillst1.push('none');
        skillsT1.push('none');
        break;
      }
    }

    //移除变身
    for (let i = 0; i < skills1.length; i++){
      if (skills1[i] == 'transform'){
        skills1.splice(i,1);
        skillso1.splice(i,1);
        skillst1.splice(i,1);
        skillsT1.splice(i,1);
        i--;
      }
    }

    //激奏结晶
    for (let i = 0; i < skills1.length; i++){
      if (skills1[i] == 'pp_fixeduse' && (skillsT1[i] == 'when_accelerate' || skillsT1[i] == 'when_crystallize')){
        skills1[i] = 'accelerateORcrystallize';
      }
    }

    //额外录入激奏
    for (let i = 0; i < transSub1.length; i++){
      cid1 = transSub1[i];
      const strNumber1 = cid1.toString();
      if (strNumber1.charAt(0) === "8"){
        let nCard1 = findCardById(parseInt(cid1),strNumber1.charAt(0) === "8");
        skills1 = skills1.concat(generateSkills(nCard1));
      }
    }
    return skills1;
  }
