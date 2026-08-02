const QUESTION_ORDER = ["follower", "summon", "evolve", "damage", "damageDetail", "buff", "draw", "clear", "clearDetail"];
const CONDITIONAL_RULES = {
    evolve: { question: "follower", value: "A" },
    damageDetail: { question: "damage", value: "A" },
    clearDetail: { question: "clear", value: "A" }
};

// 增加结果时，只需要照着这个格式新增一条。
// key 格式：固定9位，对应页面上的9道题；条件题未出现时用 - 占位。
// 例如：随从 + 摇人 + 进化时效果 + 无伤害 - buff + 无过牌 + 单体去除
const CARD_RESULTS = {
    "AAAB-ABAA": {
        name: "宽严的音帅·塞扎尔",
        url: "https://shadowverse-wb.com/chs/deck/cardslist/card/?card_id=10724120",
        image: "https://shadowverse-wb.com/uploads/card_image/chs/card/6a3b15a06e53486ead210152693c792b.png"
    }
};

const form = document.getElementById("designerForm");
const result = document.getElementById("result");
const resetButton = document.getElementById("resetButton");
const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");
const submitButton = document.getElementById("submitButton");
let currentStep = 0;

function getCheckedValue(question) {
    const input = form.querySelector(`input[name="${question}"]:checked`);
    return input ? input.value : "";
}

function shouldShowQuestion(question) {
    const rule = CONDITIONAL_RULES[question];
    return !rule || getCheckedValue(rule.question) === rule.value;
}

function syncConditionalQuestions() {
    form.querySelectorAll(".conditional").forEach((fieldset) => {
        const question = fieldset.dataset.question;
        const visible = shouldShowQuestion(question);

        if (!visible) {
            fieldset.querySelectorAll("input").forEach((input) => {
                input.checked = false;
            });
        }
    });
}

function getActiveQuestions() {
    return QUESTION_ORDER.filter(shouldShowQuestion);
}

function renderCurrentQuestion() {
    syncConditionalQuestions();

    const activeQuestions = getActiveQuestions();
    currentStep = Math.min(currentStep, activeQuestions.length - 1);
    currentStep = Math.max(currentStep, 0);
    const currentQuestion = activeQuestions[currentStep];

    form.querySelectorAll(".question-card").forEach((fieldset) => {
        fieldset.hidden = fieldset.dataset.question !== currentQuestion;
    });

    previousButton.hidden = currentStep === 0;
    nextButton.hidden = currentStep === activeQuestions.length - 1;
    submitButton.hidden = currentStep !== activeQuestions.length - 1;
}

function getResultKey() {
    return QUESTION_ORDER
        .map((question) => shouldShowQuestion(question) ? getCheckedValue(question) : "-")
        .join("");
}

function showResult() {
    syncConditionalQuestions();

    const unanswered = getActiveQuestions().filter((question) => !getCheckedValue(question));
    result.hidden = false;

    if (unanswered.length > 0) {
        result.innerHTML = `
            <h2>还不能结算</h2>
            <p class="warning">还有 ${unanswered.length} 题没有选择。命运可以含糊，表单不可以。</p>
        `;
        return;
    }

    const key = getResultKey();
    const card = CARD_RESULTS[key];

    if (!card) {
        result.innerHTML = `
            <h2>恭喜！</h2>
            <p>这类卡似乎还没有被设计出来（但只是暂时！）。看来你的水平已经超越了设计师。</p>
            <p>结果 key：<code>${key}</code></p>
        `;
        return;
    }

    result.innerHTML = `
        <h2>你是这张卡</h2>
        <div class="result-content">
            <img src="${card.image}" alt="${card.name}">
            <div>
                <a href="${card.url}" target="_blank" rel="noopener noreferrer">${card.name}</a>
                <p>结果 key：<code>${key}</code></p>
            </div>
        </div>
    `;
}

form.addEventListener("change", () => {
    renderCurrentQuestion();
    result.hidden = true;
    result.innerHTML = "";
});

previousButton.addEventListener("click", () => {
    currentStep -= 1;
    renderCurrentQuestion();
    result.hidden = true;
    result.innerHTML = "";
});

nextButton.addEventListener("click", () => {
    const activeQuestions = getActiveQuestions();
    const question = activeQuestions[currentStep];

    if (!getCheckedValue(question)) {
        result.hidden = false;
        result.innerHTML = `
            <h2>先选一个答案</h2>
            <p class="warning">心理测试也要先亮明态度，才能进入下一题。</p>
        `;
        return;
    }

    currentStep += 1;
    renderCurrentQuestion();
    result.hidden = true;
    result.innerHTML = "";
});

form.addEventListener("submit", (event) => {
    event.preventDefault();
    showResult();
    result.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

resetButton.addEventListener("click", () => {
    form.reset();
    currentStep = 0;
    renderCurrentQuestion();
    result.hidden = true;
    result.innerHTML = "";
});

renderCurrentQuestion();
