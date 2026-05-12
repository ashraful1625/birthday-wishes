// ==================== EASY TO CHANGE ====================
const TARGET_DATE = {
    year: 2026,     // ← Change year here
    month: 5,       // ← Month (1 = January, 5 = May)
    day: 14,        // ← Day
    hour: 10,       // ← Hour (24-hour format)
    minute: 45      // ← Minute
};
// =======================================================

function updateCountdown() {
    const target = new Date(
        TARGET_DATE.year,
        TARGET_DATE.month - 1,   // JavaScript months are 0-based
        TARGET_DATE.day,
        TARGET_DATE.hour,
        TARGET_DATE.minute
    );

    const now = new Date();
    const difference = target - now;

    if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        
        if (document.getElementById('seconds')) {
            document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
        }
    } else {
        // Timer finished
        document.getElementById('redirectContainer').style.display = 'block';
        document.querySelector('.countdown-timer').style.display = 'none';

        document.getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        if (document.getElementById('seconds')) {
            document.getElementById('seconds').textContent = '00';
        }
    }
}

setInterval(updateCountdown, 1000);
updateCountdown();
