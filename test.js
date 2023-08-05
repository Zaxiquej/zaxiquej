// 定义API地址
const apiUrl = "https://shadowverse-portal.com/api/v1/cards";

// 创建一个新的XMLHttpRequest对象
var xhr = new XMLHttpRequest();

// 配置GET请求
xhr.open("GET", apiUrl, true);

// 设置API响应的数据类型为JSON
xhr.responseType = "json";

// 监听请求完成的事件
xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
            // 成功接收到API响应，处理数据并展示
            displayCardInfo(xhr.response);
        } else {
            // 请求失败，处理错误
            console.error("请求失败：" + xhr.status);
        }
    }
};

// 发送请求
xhr.send();

function displayCardInfo(cardsData) {
    // 在上面的HTML中定义的容器元素
    const container = document.getElementById("card-info-container");

    // 循环遍历每张卡牌，并在容器中显示信息
    for (const card of cardsData.cards) {
        const cardInfo = document.createElement("div");
        cardInfo.innerHTML = `<h2>${card.card_name}</h2>
                              <p>id：${card.card_id}</p>
                              <hr>`;

        container.appendChild(cardInfo);
    }
}
