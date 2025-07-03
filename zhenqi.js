const RANKS = {
            emerald: { name: '绿宝石', multiplier: 1.0, index: 0, class: 'emerald' },
            topaz: { name: '黄宝石', multiplier: 1.2, index: 1, class: 'topaz' },
            ruby: { name: '红宝石', multiplier: 1.5, index: 2, class: 'ruby' },
            sapphire: { name: '蓝宝石', multiplier: 1.8, index: 3, class: 'sapphire' },
            diamond: { name: '钻石', multiplier:2, index: 4, class: 'diamond' }
        };

        const RANK_ORDER = ['emerald', 'topaz', 'ruby', 'sapphire', 'diamond'];
        let currentMode = 'single';
        let isSimulating = false;

        function setSimulationMode(mode) {
            currentMode = mode;
            document.querySelectorAll('.mode-option').forEach(option => {
                option.classList.remove('active');
            });
            event.target.classList.add('active');

            const multiControls = document.getElementById('multiSimControls');
            if (mode === 'multi') {
                multiControls.classList.add('show');
            } else {
                multiControls.classList.remove('show');
            }
        }

        function toggleAdvanced() {
            const content = document.getElementById('advancedContent');
            const button = document.querySelector('.toggle-advanced');

            if (content.classList.contains('show')) {
                content.classList.remove('show');
                button.textContent = '高级设置 ▼';
            } else {
                content.classList.add('show');
                button.textContent = '高级设置 ▲';
            }
        }

        function getWinRate(rank, baseRate, adjustment, emotionalMod = 0) {
            const rankIndex = RANKS[rank].index;
            const adjustedRate = (baseRate / 100) + (4 - rankIndex) * (adjustment / 100) + emotionalMod;
            return Math.max(0.1, Math.min(0.9, adjustedRate));
        }

        function shouldPromote(rank, recentGames) {
            const total = recentGames.length;
            const wins = recentGames.filter(game => game === 'W').length;

            switch(rank) {
                case 'emerald':
                    const recent10 = recentGames.slice(-10);
                    return recent10.filter(game => game === 'W').length >= 6;
                case 'topaz':
                    const recent15 = recentGames.slice(-15);
                    return recent15.filter(game => game === 'W').length >= 9;
                case 'ruby':
                    const recent20 = recentGames.slice(-20);
                    return recent20.filter(game => game === 'W').length >= 12;
                case 'sapphire':
                    const recent20Sapphire = recentGames.slice(-20);
                    return recent20Sapphire.filter(game => game === 'W').length >= 13;
                case 'diamond':
                    return false;
                default:
                    return false;
            }
        }

        function shouldDemote(rank, recentGames) {
            const total = recentGames.length;
            const losses = recentGames.filter(game => game === 'L').length;

            switch(rank) {
                case 'emerald':
                    return false;
                case 'topaz':
                    const recent15 = recentGames.slice(-15);
                    return recent15.filter(game => game === 'L').length >= 12;
                case 'ruby':
                    const recent20 = recentGames.slice(-20);
                    return recent20.filter(game => game === 'L').length >= 13;
                case 'sapphire':
                    const recent20Sapphire = recentGames.slice(-20);
                    return recent20Sapphire.filter(game => game === 'L').length >= 12;
                case 'diamond':
                    const recent20Diamond = recentGames.slice(-20);
                    return recent20Diamond.filter(game => game === 'L').length >= 11;
                default:
                    return false;
            }
        }

        function calculateScore(isWin, winStreak, rank) {
            const baseScore = isWin ? 100 : 0;

            let streakBonus = 0;
            if (winStreak >= 2 && winStreak <= 5) streakBonus = 30;
            else if (winStreak > 5 && winStreak <= 10) streakBonus = 60;
            else if (winStreak > 10) streakBonus = 100;

            const operationBonus = isWin ? 15 : 10;
            const totalScore = (baseScore + streakBonus + operationBonus) * RANKS[rank].multiplier;
            return totalScore;
        }

        function runSingleSimulation() {
            const totalGames = parseInt(document.getElementById('totalGames').value);
            const startLevel = document.getElementById('startLevel').value;
            const baseWinRate = parseFloat(document.getElementById('baseWinRate').value);
            const levelAdjustment = parseFloat(document.getElementById('levelAdjustment').value);
            const emotionalToggle = document.getElementById('emotionalToggle').value === 'true';
            const emotionalStrength = parseInt(document.getElementById('emotionalStrength').value);

            let currentRank = startLevel;
            let gameHistory = [];
            let rankStartIndex = 0;
            let winStreak = 0;
            let totalWins = 0;
            let totalLosses = 0;
            let scoresByRank = {
                emerald: 0,
                topaz: 0,
                ruby: 0,
                sapphire: 0,
                diamond: 0
            };

            for (let i = 0; i < totalGames; i++) {
                let emotionalMod = 0;

                if (emotionalToggle && i >= 10) {
                    const recentWins = gameHistory.slice(i - 10, i).filter(game => game === 'W').length;
                    emotionalMod = (recentWins - 5) / emotionalStrength;
                }

                const winRate = getWinRate(currentRank, baseWinRate, levelAdjustment, emotionalMod);
                const isWin = Math.random() < winRate;

                gameHistory.push(isWin ? 'W' : 'L');

                if (isWin) {
                    winStreak++;
                    totalWins++;
                } else {
                    winStreak = 0;
                    totalLosses++;
                }

                const score = calculateScore(isWin, winStreak, currentRank);
                scoresByRank[currentRank] += score;

                const recentGames = gameHistory.slice(rankStartIndex);
                let rankChanged = false;

                if (shouldPromote(currentRank, recentGames)) {
                    const currentIndex = RANK_ORDER.indexOf(currentRank);
                    if (currentIndex < RANK_ORDER.length - 1) {
                        currentRank = RANK_ORDER[currentIndex + 1];
                        rankStartIndex = i + 1;
                        rankChanged = true;
                    }
                } else if (shouldDemote(currentRank, recentGames)) {
                    const currentIndex = RANK_ORDER.indexOf(currentRank);
                    if (currentIndex > 0) {
                        currentRank = RANK_ORDER[currentIndex - 1];
                        rankStartIndex = i + 1;
                        rankChanged = true;
                    }
                }
            }

            return {
                scoresByRank,
                totalGames,
                totalWins,
                totalLosses
            };
        }

        async function runMultipleSimulations() {
            const simulationCount = parseInt(document.getElementById('simulationCount').value);
            const progressBar = document.getElementById('progressBar');
            const progressFill = document.getElementById('progressFill');
            const simulateBtn = document.getElementById('simulateBtn');

            progressBar.style.display = 'block';
            simulateBtn.disabled = true;
            simulateBtn.textContent = '模拟中...';

            let allResults = [];
            let aggregatedScores = {
                emerald: [],
                topaz: [],
                ruby: [],
                sapphire: [],
                diamond: []
            };

            for (let i = 0; i < simulationCount; i++) {
                const result = runSingleSimulation();
                allResults.push(result);

                // 收集每次模拟的分数分布
                Object.keys(aggregatedScores).forEach(rank => {
                    const totalScore = Object.values(result.scoresByRank).reduce((sum, score) => sum + score, 0);
                    const percentage = (result.scoresByRank[rank] / totalScore) * 100;
                    aggregatedScores[rank].push(percentage);
                });

                // 更新进度条
                const progress = ((i + 1) / simulationCount) * 100;
                progressFill.style.width = `${progress}%`;

                // 每100次模拟后暂停一下，让UI更新
                if (i % 100 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 1));
                }
            }

            progressBar.style.display = 'none';
            simulateBtn.disabled = false;
            simulateBtn.textContent = '开始模拟';

            return { allResults, aggregatedScores };
        }

        function calculateStatistics(data) {
            const sorted = [...data].sort((a, b) => a - b);
            const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
            const median = sorted.length % 2 === 0
                ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
                : sorted[Math.floor(sorted.length / 2)];
            const min = Math.min(...data);
            const max = Math.max(...data);
            const std = Math.sqrt(data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length);

            return { mean, median, min, max, std };
        }

        function createChart(aggregatedScores) {
            const chart = document.getElementById('chart');
            const yAxis = document.getElementById('yAxis');

            // 清空现有内容
            chart.innerHTML = '<div class="y-axis" id="yAxis"></div>';

            // 计算每个阶位的平均百分比
            const averages = {};
            let maxAverage = 0;

            Object.keys(aggregatedScores).forEach(rank => {
                const stats = calculateStatistics(aggregatedScores[rank]);
                averages[rank] = stats.mean;
                maxAverage = Math.max(maxAverage, stats.mean);
            });

            // 创建Y轴标签
            const yAxisDiv = document.getElementById('yAxis');
            yAxisDiv.innerHTML = '';
            for (let i = 0; i <= 5; i++) {
                const label = document.createElement('div');
                label.textContent = `${Math.round((maxAverage * i) / 5)}%`;
                yAxisDiv.appendChild(label);
            }

            // 创建柱状图
            const sortedRanks = [...RANK_ORDER].reverse();
            sortedRanks.forEach(rank => {
                const bar = document.createElement('div');
                const rankInfo = RANKS[rank];
                const percentage = averages[rank];
                const height = (percentage / maxAverage) * 100;

                bar.className = `bar ${rankInfo.class}`;
                bar.style.height = `${height}%`;
                bar.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue(`--${rankInfo.class}-color`) ||
                    (rankInfo.class === 'emerald' ? '#50c878' :
                     rankInfo.class === 'topaz' ? '#ffc649' :
                     rankInfo.class === 'ruby' ? '#e0115f' :
                     rankInfo.class === 'sapphire' ? '#0f52ba' : '#b9f2ff');

                const label = document.createElement('div');
                label.className = 'bar-label';
                label.textContent = rankInfo.name;

                const value = document.createElement('div');
                value.className = 'bar-value';
                value.textContent = `${percentage.toFixed(1)}%`;

                bar.appendChild(label);
                bar.appendChild(value);
                chart.appendChild(bar);
            });
        }

        function displaySingleResult(result) {
            const { scoresByRank, totalGames, totalWins, totalLosses } = result;
            const totalScore = Object.values(scoresByRank).reduce((sum, score) => sum + score, 0);
            const results = document.getElementById('results');
            const resultContent = document.getElementById('resultContent');
            const resultsTitle = document.getElementById('resultsTitle');
            const chartContainer = document.getElementById('chartContainer');

            resultsTitle.textContent = '单次模拟结果';
            chartContainer.style.display = 'none';

            let html = '';
            const sortedRanks = [...RANK_ORDER].reverse();

            for (const rank of sortedRanks) {
                const score = Math.round(scoresByRank[rank]);
                const percentage = ((scoresByRank[rank] / totalScore) * 100).toFixed(1);
                const rankInfo = RANKS[rank];

                html += `
                    <div class="rank-result">
                        <span class="rank-name ${rankInfo.class}">${rankInfo.name}</span>
                        <span class="rank-percentage ${rankInfo.class}">${score} 分 (${percentage}%)</span>
                    </div>
                `;
            }

            const netWins = totalWins - totalLosses;
            const actualWinRate = ((totalWins / totalGames) * 100).toFixed(1);

            html += `
                <div class="summary">
                    <strong>模拟总场数：${totalGames}</strong><br>
                    <strong>实际胜场：${totalWins} | 负场：${totalLosses}</strong><br>
                    <strong>净胜场：${netWins > 0 ? '+' : ''}${netWins}</strong><br>
                    <strong>实际胜率：${actualWinRate}%</strong><br>
                    <strong>总积分：${Math.round(totalScore)}</strong>
                </div>
            `;

            resultContent.innerHTML = html;
            results.classList.add('show');
            results.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function displayMultipleResults(data) {
            const { allResults, aggregatedScores } = data;
            const results = document.getElementById('results');
            const resultContent = document.getElementById('resultContent');
            const resultsTitle = document.getElementById('resultsTitle');
            const chartContainer = document.getElementById('chartContainer');
            const simulationCount = allResults.length;

            resultsTitle.textContent = `多次模拟分析结果 (${simulationCount}次)`;
            chartContainer.style.display = 'block';

            // 计算统计数据
            const stats = {};
            Object.keys(aggregatedScores).forEach(rank => {
                stats[rank] = calculateStatistics(aggregatedScores[rank]);
            });

            // 计算总体统计
            const totalWinsList = allResults.map(r => r.totalWins);
            const totalLossesList = allResults.map(r => r.totalLosses);
            const winRatesList = allResults.map(r => (r.totalWins / r.totalGames) * 100);

            const totalWinsStats = calculateStatistics(totalWinsList);
            const winRatesStats = calculateStatistics(winRatesList);

            let html = `
                <div class="multi-results">
                    <h4 style="color: #2e7d32; margin-bottom: 15px;">📊 综合统计分析</h4>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-value">${simulationCount}</div>
                            <div class="stat-label">模拟次数</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${winRatesStats.mean.toFixed(1)}%</div>
                            <div class="stat-label">平均胜率</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">±${winRatesStats.std.toFixed(1)}%</div>
                            <div class="stat-label">胜率标准差</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${winRatesStats.min.toFixed(1)}% - ${winRatesStats.max.toFixed(1)}%</div>
                            <div class="stat-label">胜率范围</div>
                        </div>
                    </div>
                </div>
            `;

            // 显示各阶位详细统计
            html += '<h4 style="margin: 25px 0 15px 0; color: #333;">🏆 各阶位分数占比统计</h4>';

            const sortedRanks = [...RANK_ORDER].reverse();
            for (const rank of sortedRanks) {
                const rankInfo = RANKS[rank];
                const stat = stats[rank];

                html += `
                    <div class="rank-result">
                        <span class="rank-name ${rankInfo.class}">${rankInfo.name}</span>
                        <div style="text-align: right;">
                            <div class="rank-percentage ${rankInfo.class}">
                                平均 ${stat.mean.toFixed(1)}% (±${stat.std.toFixed(1)}%)
                            </div>
                            <small style="color: #666;">
                                范围: ${stat.min.toFixed(1)}% - ${stat.max.toFixed(1)}%
                            </small>
                        </div>
                    </div>
                `;
            }

            // 添加解读说明
            html += `
                <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #2196f3;">
                    <h5 style="color: #1976d2; margin-bottom: 10px;">📈 数据解读</h5>
                    <ul style="margin: 0; padding-left: 20px; color: #555;">
                        <li>平均值代表该阶位分数占比的期望值</li>
                        <li>标准差越小说明结果越稳定，随机性影响越小</li>
                        <li>范围展示了在所有模拟中该阶位占比的最小值和最大值</li>
                        <li>多次模拟可以有效减少单次随机性带来的偏差</li>
                    </ul>
                </div>
            `;

            resultContent.innerHTML = html;

            // 创建图表
            createChart(aggregatedScores);

            results.classList.add('show');
            results.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        async function startSimulation() {
            if (isSimulating) return;

            isSimulating = true;

            try {
                if (currentMode === 'single') {
                    const result = runSingleSimulation();
                    displaySingleResult(result);
                } else {
                    const results = await runMultipleSimulations();
                    displayMultipleResults(results);
                }
            } catch (error) {
                console.error('模拟过程中出现错误:', error);
                alert('模拟过程中出现错误，请检查参数设置');
            } finally {
                isSimulating = false;
            }
        }

        // 初始化
        document.addEventListener('DOMContentLoaded', function() {
            // 设置默认的CSS变量用于图表颜色
            const style = document.createElement('style');
            style.textContent = `
                :root {
                    --emerald-color: #50c878;
                    --topaz-color: #ffc649;
                    --ruby-color: #e0115f;
                    --sapphire-color: #0f52ba;
                    --diamond-color: #b9f2ff;
                }
            `;
            document.head.appendChild(style);
        });
