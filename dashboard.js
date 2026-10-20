
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get({ vocabulary: [] }, (result) => {
        const vocab = result.vocabulary;
        let totalCorrect = 0;
        let totalWrong = 0;
        let masteredCount = 0;

        vocab.forEach(item => {
            totalCorrect += (item.correct_count || 0);
            totalWrong += (item.wrong_count || 0);
            if (item.correct_count >= 10) masteredCount++;
        });

        const totalAttempts = totalCorrect + totalWrong;
        const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

        document.getElementById('stat-total').innerText = vocab.length;
        document.getElementById('stat-accuracy').innerText = accuracy + "%";
        document.getElementById('stat-mastery').innerText = masteredCount;

        const struggleList = [...vocab]
            .filter(item => (item.wrong_count || 0) > 0)
            .sort((a, b) => (b.wrong_count || 0) - (a.wrong_count || 0))
            .slice(0, 5);

        const tbody = document.querySelector('#struggle-table tbody');
        if (struggleList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#BDC3C7; padding:20px;">No struggles yet!</td></tr>';
        } else {
            struggleList.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `<td><strong>${item.word}</strong></td><td>${item.translation}</td><td><span class="badge badge-error">${item.wrong_count}</span></td><td><span class="badge badge-success">${item.correct_count}</span></td>`;
                tbody.appendChild(row);
            });
        }
    });
});
