function calculateProbability() {
    const keyCards = parseInt(document.getElementById('key-cards').value);
    const remainingCards = parseInt(document.getElementById('remaining-cards').value);
    const resultDiv = document.getElementById('result');
    const probabilityDiv = document.getElementById('probability');
    const explanationDiv = document.getElementById('explanation');
    const comparisonDiv = document.getElementById('comparison');
    const comparisonTextDiv = document.getElementById('comparison-text');
    const warningDiv = document.getElementById('warning');

    // 验证输入
    if (isNaN(keyCards) || isNaN(remainingCards) ||
        keyCards < 1 || keyCards > 39 ||
        remainingCards < keyCards || remainingCards > 40) {
        warningDiv.style.display = 'block';
        probabilityDiv.textContent = '无效输入';
        explanationDiv.textContent = '请检查输入参数：Key牌数量1-39张，剩余张数不少于Key牌数量';
        comparisonDiv.style.display = 'none';
        return;
    }

    warningDiv.style.display = 'none';

    // 计算概率
    const drawnCards = 40 - remainingCards;
    const nonKeyCards = 40 - keyCards;

    // 超几何分布计算
    function combination(n, r) {
        if (r > n || r < 0) return 0;
        if (r === 0 || r === n) return 1;
        let result = 1;
        for (let i = 0; i < r; i++) {
            result = result * (n - i) / (i + 1);
        }
        return result;
    }

    const favorableOutcomes = combination(nonKeyCards, drawnCards);
    const totalOutcomes = combination(40, drawnCards);
    const probability = favorableOutcomes / totalOutcomes;
    const percentageProb = probability * 100;

    // 格式化显示
    let displayProb;
    if (percentageProb >= 0.01) {
        displayProb = percentageProb.toFixed(2) + '%';
    } else if (percentageProb > 0) {
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
    explanationDiv.textContent = `已抽取${drawnCards}张牌，剩余${remainingCards}张牌中${keyCards}张Key牌全沉的概率`;

    // 计算影之诗异画概率对比
    const targetProb = probability; // 目标概率
    const holoProb = 0.0006; // 单张卡异画概率 0.06%
    const cardsPerPack = 8; // 每包8张卡
    const noHoloPerPack = Math.pow(1 - holoProb, cardsPerPack); // 单包不出异画概率
    const holoPerPack = 1 - noHoloPerPack; // 单包出异画概率 ≈ 0.48%

    let comparisonText = '';

    if (targetProb > 0.0001) {
        // 计算连续多少包不出异画的概率接近目标概率
        const packsForNoHolo = Math.log(targetProb) / Math.log(noHoloPerPack);

        if (packsForNoHolo >= 1) {
            const X = Math.round(packsForNoHolo);

            // 修复：计算什么样的成功概率会让第一次成功的期望包数等于某个值
            // 如果我们想要 P(抽Y包获得1张异画) = targetProb
            // 那么 P(前Y-1包都没有异画，第Y包有异画) = (1-p)^(Y-1) * p = targetProb
            // 这个方程比较复杂，我们换个思路：
            // 计算有多少包的累积概率会达到目标概率
            // P(在前Y包中至少获得1张异画) = 1 - (1-p)^Y = targetProb
            // 解得：Y = ln(1-targetProb) / ln(1-p)

            let Y = 0;
            if (targetProb < 1) {
                Y = Math.round(Math.log(1 - targetProb) / Math.log(1 - holoPerPack));
            }

            // 只有当Y是合理数值时才显示第二部分
            if (Y > 0 && Y <= 1000) {
                comparisonText = `这个概率相当于连续${X}包没有开出一张异画，或者抽${Y}包就获得了至少1张异画！`;
            } else {
                comparisonText = `这个概率相当于连续${X}包没有开出一张异画！`;
            }
        } else {
            // 高概率情况
            let Y = 0;
            if (targetProb < 1) {
                Y = Math.round(Math.log(1 - targetProb) / Math.log(1 - holoPerPack));
            }
            if (Y > 0 && Y <= 1000) {
                comparisonText = `这是一个较高的概率，相当于抽${Y}包时就获得了至少1张异画！`;
            } else {
                comparisonText = `这是一个较高的概率！`;
            }
        }
    } else {
        comparisonText = '这个概率极低，比连续1000包都不出异画还要小！';
    }

    comparisonTextDiv.textContent = comparisonText;
    comparisonDiv.style.display = 'block';

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
document.getElementById('key-cards').addEventListener('input', calculateProbability);
document.getElementById('remaining-cards').addEventListener('input', calculateProbability);

// 初始计算
document.addEventListener('DOMContentLoaded', calculateProbability);
