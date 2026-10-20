
document.addEventListener('click', async (event) => {
    const target = event.target;
    // Temizleme: Noktalama işaretlerini ve boşlukları temizle
    const selectedText = target.innerText.trim().split(/\s+/)[0].replace(/[.,!?;:()"']/g, "");

    if (selectedText.length > 1 && selectedText.length < 30) {
        showTooltip(event.pageX, event.pageY, selectedText);
    }
});

async function fetchTranslation(word) {
    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|tr`);
        const data = await response.json();
        return data.responseData.translatedText;
    } catch (err) {
        return "Çeviri bulunamadı";
    }
}

async function showTooltip(x, y, word) {
    const existing = document.getElementById('lingomemo-tooltip');
    if (existing) existing.remove();

    const tooltip = document.createElement('div');
    tooltip.id = 'lingomemo-tooltip';
    // Ekran sınırlarını kontrol et (Tooltip pencere dışına taşmasın)
    const maxX = window.innerWidth - 300;
    const finalX = x > maxX ? x - 300 : x;
    
    tooltip.style.left = `${finalX}px`;
    tooltip.style.top = `${y + 20}px`;
    tooltip.innerHTML = `
        <div class="lmemo-loader-container">
            <div class="lmemo-spinner"></div>
            <p>Searching...</p>
        </div>
    `;
    document.body.appendChild(tooltip);

    try {
        const dictResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        if (!dictResponse.ok) throw new Error('Word not found');
        const dictData = await dictResponse.json();
        const entry = dictData[0];
        const definition = entry.meanings[0].definitions[0].definition;
        const example = entry.meanings[0].definitions[0].example || "No example available.";

        const translation = await fetchTranslation(word);

        tooltip.innerHTML = `
            <div class="lmemo-card">
                <div class="lmemo-header">
                    <span class="lmemo-title">${word.toUpperCase()}</span>
                    <button id="lmemo-close">&times;</button>
                </div>
                <div class="lmemo-content">
                    <div class="lmemo-row tr">
                        <span class="lmemo-tag">TR</span>
                        <span class="lmemo-val">${translation}</span>
                    </div>
                    <div class="lmemo-divider"></div>
                    <div class="lmemo-row def">
                        <span class="lmemo-tag">DEF</span>
                        <span class="lmemo-val">${definition}</span>
                    </div>
                    <div class="lmemo-ex">"${example}"</div>
                </div>
                <div class="lmemo-footer">
                    <button id="lmemo-save">
                        <span class="icon">💾</span> Save to Notebook
                    </button>
                </div>
            </div>
        `;

        tooltip.querySelector('#lmemo-close').onclick = () => tooltip.remove();
        tooltip.querySelector('#lmemo-save').onclick = () => {
            chrome.runtime.sendMessage({
                action: "SAVE_WORD",
                payload: {
                    word: word,
                    definition: definition,
                    example: example,
                    translation: translation,
                    date_added: new Date().toISOString()
                }
            });
            tooltip.innerHTML = `
                <div class="lmemo-success-card">
                    <div class="success-icon">✅</div>
                    <p>Saved to your notebook!</p>
                </div>
            `;
            setTimeout(() => tooltip.remove(), 1200);
        };

    } catch (err) {
        tooltip.innerHTML = `<div class="lmemo-error-card"><p>⚠️ Not found</p><button id="lmemo-close">Close</button></div>`;
        tooltip.querySelector('#lmemo-close').onclick = () => tooltip.remove();
    }
}
