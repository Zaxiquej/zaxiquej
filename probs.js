function calculateProbability() {
    const remainingCards = parseInt(document.getElementById('remaining-cards').value);
    const resultDiv = document.getElementById('result');
    const probabilityDiv = document.getElementById('probability');
    const explanationDiv = document.getElementById('explanation');
    const warningDiv = document.getElementById('warning');

    // 验证输入
    if (isNaN(remainingCards) || remainingCards < 3 || remainingCards > 40) {
        warningDiv.style.display = 'block';
        probabilityDiv.textContent = '无效输入';
        explanationDiv.textContent = '请输入3-40之间的数值';
        return;
    }

    warningDiv.style.display = 'none';

    // 计算概率
    // 已抽卡数 = 40 - 剩余卡数
    const drawnCards = 40 - remainingCards;

    // 使用超几何分布计算
    // 概率 = C(37, drawnCards) / C(40, drawnCards)
    // 其中37是非虫卡数量(40-3=37)

    function combination(n, r) {
        if (r > n || r < 0) return 0;
        if (r === 0 || r === n) return 1;

        let result = 1;
        for (let i = 0; i < r; i++) {
            result = result * (n - i) / (i + 1);
        }
        return result;
    }

    const favorableOutcomes = combination(37, drawnCards); // 从37张非虫卡中抽drawnCards张
    const totalOutcomes = combination(40, drawnCards);     // 从40张总卡中抽drawnCards张

    const probability = favorableOutcomes / totalOutcomes;
    const percentageProb = probability * 100;

    // 格式化显示
    let displayProb;
    if (percentageProb >= 0.01) {
        displayProb = percentageProb.toFixed(2) + '%';
    } else if (percentageProb > 0) {
        // 对于很小的概率，显示更多小数位但至少保证2位有效数字
        let decimals = 2;
        let temp = percentageProb;
        while (temp < 1 && decimals < 10) {
            decimals++;
            temp *= 10;
        }
        displayProb = percentageProb.toFixed(decimals) + '%';
    } else {
        displayProb = '0.00%';
    }

    probabilityDiv.textContent = displayProb;

    // 更新说明
    explanationDiv.textContent = `已抽取${drawnCards}张牌，剩余${remainingCards}张牌中3虫全沉的概率`;

    // 添加颜色指示
    if (percentageProb > 50) {
        resultDiv.style.background = 'linear-gradient(135deg, #00b894, #00cec9)';
    } else if (percentageProb > 20) {
        resultDiv.style.background = 'linear-gradient(135deg, #fdcb6e, #e17055)';
    } else {
        resultDiv.style.background = 'linear-gradient(135deg, #fd79a8, #e84393)';
    }
}

// 监听输入变化
document.getElementById('remaining-cards').addEventListener('input', calculateProbability);

// 初始计算
document.addEventListener('DOMContentLoaded', calculateProbability);
