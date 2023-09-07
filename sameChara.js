let cardPool;
let lastClan;
let lastCost;
let clanNames = ["中立","妖精","皇家护卫","巫师","龙族","死灵法师","吸血鬼","主教","复仇者"]

function findCardById(id) {
  return cardPool.find((card) => card.card_id === id);
}
function getCardLink(cardId) {
    return `https://shadowverse-portal.com/card/${cardId}?lang=zh-tw`.replace(",","");
}

// 创建包含卡片信息的容器
function createCardContainer(card, isMini) {
    const cardContainer = document.createElement('div');
    if (isMini){
      cardContainer.classList.add('mini-card-container');
    } else {
      cardContainer.classList.add('card-container');
    }


    // 创建图片元素
    const cardImage = document.createElement('img');
    cardImage.src = `https://shadowverse-portal.com/image/card/phase2/common/C/C_${card.card_id}.png`;
    cardImage.alt = card.card_name;

    // 创建超链接元素
    const cardLink = document.createElement('a');
    cardLink.href = `https://shadowverse-portal.com/card/${card.card_id}?lang=zh-tw`;
    cardLink.target = '_blank';
    cardLink.textContent = card.card_name;

    // 将图片和超链接添加到容器中
    cardContainer.appendChild(cardImage);
    cardContainer.appendChild(cardLink);
    cardContainer.card = card;

    return cardContainer;
}

function is_numeric(str){
  return /^\d+$/.test(str);
}

function printSameChara() {
  var resultDiv = document.getElementById("result");
  resultDiv.innerHTML = ''; // 清除现有内容

  // 合并两个数组中的对象
  cardPool = cardData.concat(subCardData);

  for (let line of spellAlt){
    const arrowA = document.createElement('div');
    arrowA.classList.add('arrow');
    arrowA.textContent = ' : ';
    const arrowB = document.createElement('div');
    arrowB.classList.add('arrow');
    arrowB.textContent = ',';
    let fCard = findCardById(line[0]);
    //console.log(line[0],fCard)
    if (fCard.clan != lastClan){
      const h = document.createElement('h2');
      h.textContent = clanNames[fCard.clan];
      h.innerHTML += "<br>";
      resultDiv.appendChild(h);
      let lineBreak = document.createElement('hr');
      resultDiv.appendChild(lineBreak);
      lastClan = fCard.clan;
    }
    if (fCard.cost != lastCost){
      const h = document.createElement('h3');
      h.textContent = fCard.cost +"费";
      h.innerHTML += "<br>";
      resultDiv.appendChild(h);
      let lineBreak = document.createElement('hr');
      resultDiv.appendChild(lineBreak);
      lastCost = fCard.cost;
    }

    let path = document.createElement('div');
    path.classList.add('path');
    path.appendChild(createCardContainer(fCard, false));
    for (let i = 1; i < line.length; i++){
      if (i == 1){
        path.appendChild(arrowA);
      } else {
        path.appendChild(arrowB.cloneNode(true));
      }
      if (line[i]){
        for (let j of line[i]){
          path.appendChild(createCardContainer(findCardById(j), true));
        }
      }
    }
    path.innerHTML += "<br>";
    resultDiv.appendChild(path);
    let lineBreak = document.createElement('hr');
    resultDiv.appendChild(lineBreak);
  }
}

// 在页面加载完毕后运行printSameChara()
document.addEventListener("DOMContentLoaded", function () {
  printSameChara();
});
