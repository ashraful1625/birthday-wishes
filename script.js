// Countdown Timer
function updateCountdown() {
    const currentYear = new Date().getFullYear();
    let birthday = new Date(currentYear, 3, 6); // October 19
    
    if (new Date() > birthday) {
        birthday = new Date(currentYear + 1, 9, 19);
    }
    
    const now = new Date();
    const difference = birthday - now;
    
    if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        
        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    }
}

setInterval(updateCountdown, 60000);
updateCountdown();

// Add Wish Function
function addWish() {
    const wishInput = document.getElementById('wishInput');
    const wish = wishInput.value.trim();
    
    if (wish === '') {
        alert('Please write a wish!');
        return;
    }
    
    const wishCard = document.createElement('div');
    wishCard.className = 'wish-card';
    wishCard.innerHTML = `
        <p>"${escapeHtml(wish)}"</p>
        <span class="wish-author">- A Friend</span>
    `;
    
    document.getElementById('wishesContainer').appendChild(wishCard);
    wishInput.value = '';
    triggerConfetti();
}

function escapeHtml(text) {
    const map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'};
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Confetti Animation
function triggerConfetti() {
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.top = '0px';
        confetti.style.background = ['#667eea', '#764ba2', '#ffd700', '#ff6b9d'][Math.floor(Math.random() * 4)];
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 3000);
    }
}

// Music Toggle
let audio;
document.getElementById('musicToggle').addEventListener('click', function() {
    if (!audio) {
        audio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
        audio.loop = true;
    }
    
    if (audio.paused) {
        audio.play();
        this.textContent = '⏸️ Stop Music';
    } else {
        audio.pause();
        this.textContent = '🎵 Play Birthday Music';
    }
});

// Allow Enter key to add wish
document.getElementById('wishInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addWish();
    }
});
