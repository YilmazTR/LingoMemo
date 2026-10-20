
document.addEventListener('DOMContentLoaded', () => {
    const list = document.getElementById('word-list');
    
    chrome.storage.local.get({ vocabulary: [] }, (result) => {
        if (result.vocabulary.length === 0) {
            list.innerHTML = '<li class="empty">No words saved yet.</li>';
            return;
        }
        
        // Tersten sırala (En yeni en üstte)
        const sortedList = [...result.vocabulary].reverse();

        sortedList.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="word-item">
                    <span class="word">${item.word}</span>
                    <span class="tr-meaning">(${item.translation})</span>
                </div>
                <div class="def">${item.definition.substring(0, 50)}...</div>
            `;
            list.appendChild(li);
        });
    });
});
