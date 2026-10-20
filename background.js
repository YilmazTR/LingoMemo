
chrome.runtime.onInstalled.addListener(() => {
    console.log("LingoMemo Engine Started.");
    chrome.alarms.create("dailyQuiz", { periodInMinutes: 1440 }); 
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "dailyQuiz") {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: '📚 LingoMemo Quiz Time!',
            message: 'Ready to test your vocabulary?',
            buttons: [{ title: 'Let\'s Go!' }],
            priority: 2
        });
    }
});

chrome.notifications.onClicked.addListener((notificationId) => {
    chrome.tabs.create({ url: 'quiz.html' });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "SAVE_WORD") {
        const newWord = request.payload;
        chrome.storage.local.get({ vocabulary: [] }, (result) => {
            const vocab = result.vocabulary;
            if (!vocab.find(item => item.word.toLowerCase() === newWord.word.toLowerCase())) {
                vocab.push({
                    ...newWord,
                    correct_count: 0,
                    wrong_count: 0
                });
                chrome.storage.local.set({ vocabulary: vocab });
            }
        });
    }

    if (request.action === "RECORD_ATTEMPT") {
        const { word, isCorrect } = request.payload;
        chrome.storage.local.get({ vocabulary: [] }, (result) => {
            const vocab = result.vocabulary;
            const item = vocab.find(w => w.word === word);
            if (item) {
                if (isCorrect) {
                    item.correct_count = (item.correct_count || 0) + 1;
                } else {
                    item.wrong_count = (item.wrong_count || 0) + 1;
                }
                chrome.storage.local.set({ vocabulary: vocab });
            }
        });
    }
});
