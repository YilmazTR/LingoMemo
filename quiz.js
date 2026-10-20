
let vocabulary = [];
let currentQuestion = {};

const questionEl = document.getElementById('question');
const optionsContainer = document.getElementById('options-container');
const feedbackEl = document.getElementById('feedback');
const nextBtn = document.getElementById('next-btn');

chrome.storage.local.get({ vocabulary: [] }, (result) => {
    vocabulary = result.vocabulary;
    if (vocabulary.length < 4) {
        questionEl.innerHTML = "<span style='color:#e74c3c'>⚠️ Add at least 4 words to start!</span>";
    } else {
        startNewQuestion();
    }
});

function startNewQuestion() {
    feedbackEl.innerText = "";
    nextBtn.style.display = "none";
    optionsContainer.innerHTML = "";

    const correctIdx = Math.floor(Math.random() * vocabulary.length);
    currentQuestion = vocabulary[correctIdx];

    questionEl.innerText = `What is the meaning of: "${currentQuestion.word.toUpperCase()}"?`;

    let distractors = [];
    const otherIndices = Array.from(Array(vocabulary.length).keys()).filter(i => i !== correctIdx);
    otherIndices.sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(3, otherIndices.length); i++) {
        distractors.push(vocabulary[otherIndices[i]]);
    }

    let choices = [currentQuestion, ...distractors];
    choices.sort(() => Math.random() - 0.5);

    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = choice.translation;
        btn.onclick = () => checkAnswer(choice.word, btn);
        optionsContainer.appendChild(btn);
    });
}

function checkAnswer(selectedWord, clickedBtn) {
    const allButtons = document.querySelectorAll('.option-btn');
    allButtons.forEach(btn => btn.disabled = true);

    const isCorrect = (selectedWord === currentQuestion.word);

    chrome.runtime.sendMessage({
        action: "RECORD_ATTEMPT",
        payload: {
            word: selectedWord,
            isCorrect: isCorrect
        }
    });

    if (isCorrect) {
        clickedBtn.classList.add('correct');
        feedbackEl.innerText = "Amazing! 🎉";
        feedbackEl.style.color = "#2ecc71";
    } else {
        clickedBtn.classList.add('wrong');
        feedbackEl.innerText = `Wrong! It was: ${currentQuestion.translation}`;
        feedbackEl.style.color = "#e74c3c";
        allButtons.forEach(btn => {
            if (btn.innerText === currentQuestion.translation) {
                btn.classList.add('correct');
            }
        });
    }
    nextBtn.style.display = "inline-block";
}

nextBtn.onclick = startNewQuestion;
