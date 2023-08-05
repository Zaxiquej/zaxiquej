// 定义API地址
const apiUrl = "https://shadowverse-portal.com/api/v1/cards";

// 获取卡牌信息并展示
fetch(apiUrl)
    .then((response) => {
        if (!response.ok) {
            throw new Error("请求失败：" + response.status);
        }
        return response.json();
    })
    .then((data) => {
        displayCardInfo(data);
    })
    .catch((error) => {
        console.error(error);
    });

function displayCardInfo(cardsData) {
    // 在上面的HTML中定义的容器元素
    const container = document.getElementById("card-info-container");

    // 循环遍历每张卡牌，并在容器中显示信息
    for (const card of cardsData.data.cards) {
        const cardInfo = document.createElement("div");
        cardInfo.innerHTML = `<h2>${card.name}</h2>
                              <p>PP消耗：${card.cost}</p>
                              <p>攻击力：${card.atk}</p>
                              <p>生命值：${card.life}</p>
                              <hr>`;

        container.appendChild(cardInfo);
    }
}
