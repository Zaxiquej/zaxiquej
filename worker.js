// 导入你需要的函数和数据
importScripts('library/database.js','library/subdatabase.js','similarity.js');

// 示例：根据操作获取相关的卡片数据
function findShortestPath(startCard, endCard) {
  const visited = new Set();
  const queue = [[startCard]];

  while (queue.length > 0) {
      const path = queue.shift();
      const currentCard = path[path.length - 1];

      if (currentCard === endCard) {
          return path; // 找到最短路径，使用 resolve 返回结果
      }

      if (!visited.has(currentCard)) {
          visited.add(currentCard);

          // 获取当前卡片的相关卡片，这里需要根据您的实际需求获取相关卡片
          const relatedCards = getRelatedCards("同一卡包同职业", currentCard).concat(getRelatedCards("衍生或被衍生", currentCard)); // 自定义函数

          for (const relatedCard of relatedCards) {
              if (!visited.has(relatedCard)) {
                  const newPath = [...path, relatedCard];
                  queue.push(newPath);
              }
          }
      }
  }
}

function minorToken(item1,item2){
  var skillArray = item1.skill.split(",");
  var skillOArray = item1.skill_option.split(",");

  for (var i = 0; i < skillArray.length; i++) {
    if (skillArray[i] === "transform") {
      if (skillOArray[i].includes(item2.card_id)) {
        return true;
      }
    }
  }
}

function getRelatedCards(operation,currentCard) {
  if (!currentCard){
    if (direction == 1){
      currentCard = currentStCard;
    } else {
      currentCard = currentEdCard;
    }
  }

    switch (operation) {
        case '同一卡包同职业':
            return cardData.filter(card => currentCard.card_set_id != 90000 && card.card_set_id === currentCard.card_set_id && card.clan === currentCard.clan &&card.card_id !== currentCard.card_id);
        case '衍生或被衍生':
            return cardData.filter(card => (card.skill_option.includes(currentCard.card_id) || card.skill_target.includes(currentCard.card_id)) || (currentCard.skill_option.includes(card.card_id) || currentCard.skill_target.includes(card.card_id) || minorToken(card,currentCard) || minorToken(currentCard,card)) && card.card_id !== currentCard.card_id);
        case '同身材稀有度':
            return cardData.filter(card => card.char_type == 1 && currentCard.char_type == 1 && card.atk == currentCard.atk && card.life == currentCard.life && card.cost == currentCard.cost && card.rarity == currentCard.rarity && card.card_id !== currentCard.card_id);
        case '描述相似过75':
            return cardData.filter(card => (getTrueDesc(card) == "" && getTrueDesc(currentCard) == "") || calculateLevenshteinDistance(getTrueDesc(card),getTrueDesc(currentCard)) < Math.min(getTrueDesc(card).length,getTrueDesc(currentCard).length) * 0.25);
        case '技能相似过75':
            return cardData.filter(card => (calculateSkillScore(card,currentCard) >= 75 && card.card_id !== currentCard.card_id) );
        default:
            return [];
    }
}

onmessage = function (e) {
  const { startCard, endCard } = e.data;
  findShortestPath(startCard, endCard)
    .then((path) => {
      postMessage({ path });
    })
    .catch((error) => {
      postMessage({ error: "未找到路径" });
    });
};
