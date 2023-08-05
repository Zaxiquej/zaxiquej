document.addEventListener("DOMContentLoaded", function () {
    const fetchButton = document.getElementById("fetchButton");
    const resultDiv = document.getElementById("result");

    fetchButton.addEventListener("click", function () {
        // 使用XMLHttpRequest来读取本地文件
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'portalcraft.json');

        xhr.onload = function () {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                const cards = data.data.cards;
                const cardInfo = extractCardInfo(cards);
                displayData(cardInfo);
            } else {
                resultDiv.innerHTML = `<p>读取本地文件失败</p>`;
            }
        };

        xhr.onerror = function () {
            resultDiv.innerHTML = `<p>读取本地文件失败</p>`;
        };

        xhr.send();
    });

    // extractCardInfo 和 displayData 函数不变，不需要修改

});
