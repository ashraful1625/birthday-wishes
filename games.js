/* ═══════════════════════════════════════════════════════════════
   games.js — 20 Fully Playable Birthday Games for Niharika 🎮
   All games use the wishes theme: cream / rose / gold palette
   Scores are saved to localStorage per game (top 3 kept)
═══════════════════════════════════════════════════════════════ */

/* ── Shared helpers ── */
const R = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const el = id => document.getElementById(id);

/* ── Score storage ── */
function getScores(game) {
    try { return JSON.parse(localStorage.getItem('scores_' + game) || '[]'); }
    catch { return []; }
}
function saveScore(game, score) {
    let scores = getScores(game);
    scores.push(score);
    scores.sort((a, b) => b - a);
    scores = scores.slice(0, 3);
    localStorage.setItem('scores_' + game, JSON.stringify(scores));
    return scores;
}
function scoreboardHTML(game, label = 'pts') {
    const scores = getScores(game);
    if (!scores.length) return '';
    const medals = ['🥇','🥈','🥉'];
    const rows = scores.map((s, i) =>
        `<div class="sb-row">${medals[i]} <span>${s.toLocaleString()} ${label}</span></div>`
    ).join('');
    return `<div class="scoreboard"><div class="sb-title">🏆 Top Scores</div>${rows}</div>`;
}

/* ── Shared CSS injected once ── */
(function injectCSS() {
    if (document.getElementById('gjs-style')) return;
    const style = document.createElement('style');
    style.id = 'gjs-style';
    style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;700&family=Dancing+Script:wght@700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');

    :root { --rose:#c9485b; --gold:#c8963e; --cream:#fdf6ee; --text:#4a2c2a; }

    #gameContent { font-family:'Josefin Sans',sans-serif; color:var(--text); }

    .g-title {
        font-family:'Playfair Display',serif; font-style:italic;
        font-size:clamp(1.2rem,5vw,1.6rem); color:var(--rose);
        text-align:center; margin-bottom:6px;
    }
    .g-sub {
        text-align:center; font-size:0.82rem; color:var(--gold);
        font-style:italic; margin-bottom:16px;
    }
    .g-btn {
        display:inline-block; cursor:pointer;
        background:linear-gradient(135deg,var(--rose),#8b2252);
        color:#fff; font-family:'Josefin Sans',sans-serif;
        font-weight:700; font-size:0.95rem;
        padding:10px 24px; border-radius:50px; border:none;
        box-shadow:0 4px 14px rgba(201,72,91,0.35);
        transition:transform .2s,box-shadow .2s; margin:4px;
    }
    .g-btn:hover { transform:translateY(-2px) scale(1.04); box-shadow:0 8px 20px rgba(201,72,91,0.45); }
    .g-btn:active { transform:scale(0.96); }
    .g-btn.secondary {
        background:linear-gradient(135deg,var(--gold),#a06820);
        box-shadow:0 4px 14px rgba(200,150,62,0.35);
    }
    .g-btn.ghost {
        background:transparent; color:var(--rose);
        border:2px solid var(--rose); box-shadow:none;
    }
    .g-input {
        width:100%; padding:10px 14px; border-radius:12px;
        border:1.5px solid rgba(201,72,91,0.3);
        font-family:'Josefin Sans',sans-serif; font-size:1rem;
        color:var(--text); background:var(--cream);
        box-shadow:0 2px 8px rgba(201,72,91,0.08); outline:none;
        transition:border-color .2s;
    }
    .g-input:focus { border-color:var(--rose); }
    .g-msg {
        text-align:center; padding:10px 14px; border-radius:12px;
        font-weight:700; font-size:0.95rem; margin:10px 0;
    }
    .g-msg.good { background:#f0fdf4; color:#166534; border:1.5px solid #bbf7d0; }
    .g-msg.bad  { background:#fff1f2; color:#9f1239; border:1.5px solid #fecdd3; }
    .g-msg.info { background:linear-gradient(135deg,#fde8ec,#fdf0e0); color:var(--rose); border:1.5px solid rgba(201,72,91,0.2); }
    .g-score-display {
        text-align:center; font-size:clamp(1.4rem,6vw,2rem);
        font-weight:700; color:var(--rose); margin:8px 0;
        font-family:'Playfair Display',serif;
    }
    .scoreboard {
        background:linear-gradient(135deg,#fde8ec,#fdf0e0);
        border:1.5px solid rgba(201,72,91,0.2);
        border-radius:14px; padding:12px 16px; margin-top:14px;
    }
    .sb-title {
        font-family:'Dancing Script',cursive; font-size:1.1rem;
        color:var(--gold); text-align:center; margin-bottom:8px;
    }
    .sb-row {
        display:flex; justify-content:space-between;
        padding:4px 0; font-size:0.88rem; color:var(--text);
        border-bottom:1px solid rgba(201,72,91,0.12);
    }
    .sb-row:last-child { border-bottom:none; }
    .g-grid {
        display:grid; gap:8px; margin:12px 0;
    }
    .g-card-face {
        aspect-ratio:1; border-radius:12px; cursor:pointer;
        display:flex; align-items:center; justify-content:center;
        font-size:clamp(1.2rem,5vw,1.8rem);
        background:linear-gradient(135deg,var(--rose),#8b2252);
        color:transparent; box-shadow:0 3px 10px rgba(201,72,91,0.2);
        transition:transform .15s, background .3s;
        user-select:none; -webkit-user-select:none;
    }
    .g-card-face.revealed { background:white; color:inherit; border:2px solid var(--rose); }
    .g-card-face.matched  { background:linear-gradient(135deg,#fde8ec,#fdf0e0); color:inherit; border:2px solid var(--gold); opacity:0.7; }
    .g-card-face:hover:not(.revealed):not(.matched) { transform:scale(1.06); }
    canvas.g-canvas {
        display:block; margin:0 auto; border-radius:12px;
        max-width:100%; touch-action:none;
    }
    .rps-choice {
        font-size:clamp(2rem,8vw,3rem); cursor:pointer;
        padding:10px; border-radius:50%; border:2px solid transparent;
        transition:transform .2s, border-color .2s;
        display:inline-block;
    }
    .rps-choice:hover { transform:scale(1.2); border-color:var(--rose); }
    .progress-bar-wrap {
        background:rgba(201,72,91,0.12); border-radius:30px;
        height:10px; overflow:hidden; margin:8px 0;
    }
    .progress-bar-fill {
        height:100%; border-radius:30px;
        background:linear-gradient(90deg,var(--rose),var(--gold));
        transition:width .4s ease;
    }
    .tile-grid { display:grid; gap:6px; margin:12px auto; max-width:340px; }
    .tile-btn {
        padding:16px 8px; border-radius:12px; border:none; cursor:pointer;
        font-family:'Josefin Sans',sans-serif; font-weight:700;
        font-size:clamp(0.8rem,3vw,1rem); transition:transform .15s, opacity .15s;
        background:linear-gradient(135deg,#fde8ec,#fdf0e0);
        color:var(--text); box-shadow:0 2px 8px rgba(201,72,91,0.12);
    }
    .tile-btn:hover { transform:scale(1.04); }
    .tile-btn.correct { background:linear-gradient(135deg,#bbf7d0,#d1fae5); color:#166534; }
    .tile-btn.wrong   { background:linear-gradient(135deg,#fecdd3,#ffe4e6); color:#9f1239; }
    .slide-tile {
        display:flex; align-items:center; justify-content:center;
        border-radius:10px; font-size:clamp(1rem,4vw,1.4rem);
        font-weight:700; cursor:pointer; transition:all .2s;
        background:linear-gradient(135deg,var(--rose),#8b2252); color:white;
        box-shadow:0 3px 10px rgba(201,72,91,0.25);
    }
    .slide-tile.empty {
        background:rgba(201,72,91,0.08); cursor:default; box-shadow:none;
    }
    .type-display {
        font-size:clamp(0.9rem,3vw,1.1rem); color:var(--text);
        background:var(--cream); border-radius:10px; padding:12px;
        line-height:1.8; margin:10px 0;
    }
    .type-display .typed { color:var(--gold); }
    .type-display .cursor { animation:blink 0.7s step-end infinite; }
    @keyframes blink { 50% { opacity:0; } }
    .piano-track { display:flex; gap:6px; height:80px; margin:10px 0; }
    .piano-col { flex:1; display:flex; flex-direction:column; gap:4px; }
    .piano-tile {
        flex:1; border-radius:8px; cursor:pointer;
        background:linear-gradient(180deg,var(--rose),#8b2252);
        transition:transform .1s, opacity .15s;
        box-shadow:0 3px 8px rgba(201,72,91,0.25);
    }
    .piano-tile:active { transform:scaleY(0.92); opacity:0.8; }
    .fortune-orb {
        width:100px; height:100px; border-radius:50%;
        background:radial-gradient(circle at 35% 35%, #9060c8, #3a0070);
        margin:16px auto; display:flex; align-items:center; justify-content:center;
        font-size:2.5rem; box-shadow:0 0 30px rgba(120,60,200,0.5);
        cursor:pointer; transition:transform .3s;
    }
    .fortune-orb:hover { transform:scale(1.08) rotate(5deg); }
    .wheel-svg { display:block; margin:0 auto; max-width:240px; }
    `;
    document.head.appendChild(style);
})();

/* ══════════════════════════════════════════════════════
   ROUTER
══════════════════════════════════════════════════════ */
function playGame(name) {
    const modal = el('gameModal');
    const content = el('gameContent');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    const games = {
        guessTheNumber, memoryMatch, speedClicker, quizTime, balloonPop,
        colorMatch, flappyBird, wordSearch, rps, mathChallenge,
        snakeGame, spinTheWheel, typeRacer, emojiMatch, fortuneTeller,
        pianoTiles, diceRoll, jumpGame, puzzleSlide, birthdayTrivia
    };
    content.innerHTML = '';
    if (games[name]) games[name](content);
    else content.innerHTML = `<p class="g-title">Coming Soon! 🎮</p>`;
}

function closeGame() {
    const modal = el('gameModal');
    if (modal) { modal.style.display = 'none'; el('gameContent').innerHTML = ''; }
    document.body.style.overflow = '';
}

/* ══════════════════════════════════════════════════════
   GAME 1 — Guess The Number
══════════════════════════════════════════════════════ */
function guessTheNumber(c) {
    let secret = R(1,100), attempts = 0, maxAtt = 7, gameOver = false;
    c.innerHTML = `
        <h2 class="g-title">🎲 Guess The Number</h2>
        <p class="g-sub">I'm thinking of a number between 1 and 100</p>
        <div class="progress-bar-wrap"><div class="progress-bar-fill" id="gtnProg" style="width:100%"></div></div>
        <p style="text-align:center;font-size:0.82rem;color:var(--gold);margin-bottom:10px">
            Attempts left: <span id="gtnLeft">${maxAtt}</span>
        </p>
        <input class="g-input" id="gtnInput" type="number" min="1" max="100" placeholder="Enter your guess…">
        <div style="text-align:center;margin-top:10px">
            <button class="g-btn" onclick="gtnGuess()">Guess 🎯</button>
            <button class="g-btn ghost" onclick="gtnReset()">New Game</button>
        </div>
        <div id="gtnMsg"></div>
        ${scoreboardHTML('guessTheNumber','pts')}
    `;
    el('gtnInput').addEventListener('keydown', e => { if (e.key==='Enter') gtnGuess(); });
    window.gtnGuess = () => {
        if (gameOver) return;
        const guess = parseInt(el('gtnInput').value);
        if (isNaN(guess)||guess<1||guess>100) { showMsg('gtnMsg','Enter a number 1-100','bad'); return; }
        attempts++;
        const left = maxAtt - attempts;
        el('gtnLeft').textContent = left;
        el('gtnProg').style.width = (left/maxAtt*100) + '%';
        if (guess === secret) {
            const score = Math.max(10, 100 - attempts*10);
            const top = saveScore('guessTheNumber', score);
            gameOver = true;
            showMsg('gtnMsg', `🎉 Correct! It was ${secret}! Score: ${score} pts`, 'good');
        } else if (attempts >= maxAtt) {
            gameOver = true;
            showMsg('gtnMsg', `💔 Out of attempts! It was ${secret}.`, 'bad');
        } else {
            showMsg('gtnMsg', guess < secret ? '📈 Too low! Try higher.' : '📉 Too high! Try lower.', 'info');
        }
        el('gtnInput').value = '';
    };
    window.gtnReset = () => {
        secret = R(1,100); attempts = 0; gameOver = false;
        el('gtnLeft').textContent = maxAtt;
        el('gtnProg').style.width = '100%';
        el('gtnMsg').innerHTML = '';
        el('gtnInput').value = '';
    };
}

/* ══════════════════════════════════════════════════════
   GAME 2 — Memory Match
══════════════════════════════════════════════════════ */
function memoryMatch(c) {
    const emojis = ['🌸','💖','🎂','🌟','💌','🦋','🌙','🎈'];
    let cards = [...emojis,...emojis].sort(()=>Math.random()-0.5);
    let flipped=[], matched=[], locked=false, moves=0;
    c.innerHTML = `
        <h2 class="g-title">🧠 Memory Match</h2>
        <p class="g-sub">Moves: <span id="mmMoves">0</span></p>
        <div class="g-grid" id="mmGrid" style="grid-template-columns:repeat(4,1fr);max-width:320px;margin:0 auto"></div>
        <div id="mmMsg"></div>
        ${scoreboardHTML('memoryMatch','pts')}
    `;
    const grid = el('mmGrid');
    cards.forEach((emoji, i) => {
        const d = document.createElement('div');
        d.className = 'g-card-face';
        d.dataset.i = i;
        d.dataset.e = emoji;
        d.onclick = () => flip(d);
        grid.appendChild(d);
    });
    function flip(d) {
        if (locked || d.classList.contains('revealed') || d.classList.contains('matched')) return;
        d.classList.add('revealed');
        d.textContent = d.dataset.e;
        flipped.push(d);
        if (flipped.length === 2) {
            locked = true; moves++;
            el('mmMoves').textContent = moves;
            if (flipped[0].dataset.e === flipped[1].dataset.e) {
                flipped.forEach(x => x.classList.replace('revealed','matched'));
                matched.push(...flipped);
                flipped = []; locked = false;
                if (matched.length === cards.length) {
                    const score = Math.max(10, 200 - moves*5);
                    saveScore('memoryMatch', score);
                    showMsg('mmMsg', `🎉 All matched in ${moves} moves! Score: ${score}`, 'good');
                }
            } else {
                setTimeout(() => {
                    flipped.forEach(x => { x.classList.remove('revealed'); x.textContent=''; });
                    flipped = []; locked = false;
                }, 900);
            }
        }
    }
}

/* ══════════════════════════════════════════════════════
   GAME 3 — Speed Clicker
══════════════════════════════════════════════════════ */
function speedClicker(c) {
    let clicks=0, running=false, timer=null, timeLeft=10;
    c.innerHTML = `
        <h2 class="g-title">⚡ Speed Clicker</h2>
        <p class="g-sub">Click as many times as you can in 10 seconds!</p>
        <div class="progress-bar-wrap"><div class="progress-bar-fill" id="scProg" style="width:100%"></div></div>
        <p style="text-align:center;color:var(--gold);font-size:0.82rem;margin-bottom:8px">Time: <span id="scTime">10</span>s</p>
        <div class="g-score-display" id="scClicks">0</div>
        <div style="text-align:center">
            <button class="g-btn" id="scBtn" onclick="scClick()">🌸 Click Me!</button>
        </div>
        <div id="scMsg"></div>
        ${scoreboardHTML('speedClicker','clicks')}
    `;
    window.scClick = () => {
        if (!running) {
            running = true;
            timer = setInterval(() => {
                timeLeft--;
                el('scTime').textContent = timeLeft;
                el('scProg').style.width = (timeLeft/10*100)+'%';
                if (timeLeft <= 0) {
                    clearInterval(timer); running = false;
                    el('scBtn').disabled = true;
                    const top = saveScore('speedClicker', clicks);
                    showMsg('scMsg', `🎉 ${clicks} clicks! Score saved!`, 'good');
                }
            }, 1000);
        }
        if (running && timeLeft > 0) {
            clicks++;
            el('scClicks').textContent = clicks;
        }
    };
}

/* ══════════════════════════════════════════════════════
   GAME 4 — Trivia Quiz
══════════════════════════════════════════════════════ */
function quizTime(c) {
    const questions = [
        {q:"What is the capital of France?", opts:["Berlin","Paris","Rome","Madrid"], a:1},
        {q:"Which planet is known as the Red Planet?", opts:["Venus","Jupiter","Mars","Saturn"], a:2},
        {q:"How many sides does a hexagon have?", opts:["5","6","7","8"], a:1},
        {q:"Who painted the Mona Lisa?", opts:["Van Gogh","Picasso","Da Vinci","Rembrandt"], a:2},
        {q:"What is the largest ocean on Earth?", opts:["Atlantic","Indian","Arctic","Pacific"], a:3},
        {q:"Which element has the symbol 'O'?", opts:["Gold","Oxygen","Osmium","Ozone"], a:1},
        {q:"What year did World War II end?", opts:["1943","1944","1945","1946"], a:2},
        {q:"How many bones are in the adult human body?", opts:["186","196","206","216"], a:2},
    ];
    let qi=0, score=0;
    function render() {
        if (qi >= questions.length) {
            const top = saveScore('quizTime', score*10);
            c.innerHTML = `
                <h2 class="g-title">❓ Trivia Quiz</h2>
                <div class="g-score-display">${score}/${questions.length}</div>
                <div class="g-msg info">Score: ${score*10} pts 🎉</div>
                ${scoreboardHTML('quizTime','pts')}
                <div style="text-align:center;margin-top:12px">
                    <button class="g-btn" onclick="quizTime(el('gameContent'))">Play Again</button>
                </div>`;
            return;
        }
        const q = questions[qi];
        c.innerHTML = `
            <h2 class="g-title">❓ Trivia Quiz</h2>
            <p class="g-sub">Question ${qi+1} of ${questions.length} · Score: ${score}</p>
            <div class="g-msg info" style="margin-bottom:12px">${q.q}</div>
            <div class="tile-grid" style="grid-template-columns:1fr 1fr">
                ${q.opts.map((o,i)=>`<button class="tile-btn" onclick="qtAns(${i})">${o}</button>`).join('')}
            </div>
            <div id="qtMsg"></div>`;
    }
    window.qtAns = (i) => {
        const q = questions[qi];
        const btns = document.querySelectorAll('.tile-btn');
        btns.forEach(b => b.disabled = true);
        if (i === q.a) {
            score++; btns[i].classList.add('correct');
            showMsg('qtMsg','✅ Correct!','good');
        } else {
            btns[i].classList.add('wrong');
            btns[q.a].classList.add('correct');
            showMsg('qtMsg','❌ Wrong!','bad');
        }
        setTimeout(() => { qi++; render(); }, 900);
    };
    render();
}

/* ══════════════════════════════════════════════════════
   GAME 5 — Balloon Pop
══════════════════════════════════════════════════════ */
function balloonPop(c) {
    let score=0, timeLeft=20, running=false, timer=null;
    c.innerHTML = `
        <h2 class="g-title">🎈 Balloon Pop</h2>
        <p class="g-sub">Pop as many balloons as you can in 20 seconds!</p>
        <div class="progress-bar-wrap"><div class="progress-bar-fill" id="bpProg" style="width:100%"></div></div>
        <p style="text-align:center;color:var(--gold);font-size:0.82rem">Time: <span id="bpTime">20</span>s · Score: <span id="bpScore">0</span></p>
        <div id="bpArena" style="position:relative;height:220px;background:linear-gradient(180deg,#fde8ec,#fdf0e0);border-radius:16px;overflow:hidden;margin:10px 0;cursor:crosshair;border:1.5px solid rgba(201,72,91,0.2)"></div>
        <div id="bpMsg"></div>
        ${scoreboardHTML('balloonPop','pts')}
    `;
    const arena = el('bpArena');
    function spawnBalloon() {
        if (!running) return;
        const b = document.createElement('div');
        const size = R(36,60);
        const colors = ['#c9485b','#c8963e','#7b4fa6','#2e7d8e','#d4507a','#8b2252'];
        const col = colors[R(0,colors.length-1)];
        b.style.cssText = `position:absolute;width:${size}px;height:${size}px;
            border-radius:50% 50% 50% 50% / 60% 60% 40% 40%;
            background:radial-gradient(circle at 35% 30%,${col}dd,${col}88);
            left:${R(5,85)}%;bottom:-${size}px;cursor:pointer;
            transition:bottom ${R(25,45)*100}ms linear;
            box-shadow:0 2px 10px rgba(0,0,0,0.15);
            display:flex;align-items:center;justify-content:center;
            font-size:${size*0.4}px;`;
        b.textContent = '🎈';
        b.onclick = e => {
            e.stopPropagation();
            if (!running) return;
            score++;
            el('bpScore').textContent = score;
            b.style.transform = 'scale(1.5)';
            b.style.opacity = '0';
            setTimeout(() => b.remove(), 200);
        };
        arena.appendChild(b);
        requestAnimationFrame(() => { b.style.bottom = (arena.clientHeight + size) + 'px'; });
        setTimeout(() => { if (b.parentNode) b.remove(); }, R(2500,4500));
    }
    running = true;
    const spawn = setInterval(() => { if (running) spawnBalloon(); }, 600);
    spawnBalloon(); spawnBalloon();
    timer = setInterval(() => {
        timeLeft--;
        el('bpTime').textContent = timeLeft;
        el('bpProg').style.width = (timeLeft/20*100)+'%';
        if (timeLeft <= 0) {
            clearInterval(timer); clearInterval(spawn); running = false;
            arena.style.pointerEvents = 'none';
            saveScore('balloonPop', score);
            showMsg('bpMsg', `🎉 You popped ${score} balloons!`, 'good');
        }
    }, 1000);
}

/* ══════════════════════════════════════════════════════
   GAME 6 — Color Match
══════════════════════════════════════════════════════ */
function colorMatch(c) {
    const colors = [{n:'Rose',v:'#c9485b'},{n:'Gold',v:'#c8963e'},{n:'Purple',v:'#7b4fa6'},
                    {n:'Teal',v:'#2e7d8e'},{n:'Green',v:'#3a8a50'},{n:'Pink',v:'#d4507a'}];
    let score=0, timeLeft=30, running=true, timer=null;
    function nextRound() {
        if (!running) return;
        const target = colors[R(0,colors.length-1)];
        const opts = [target];
        while (opts.length < 4) {
            const c2 = colors[R(0,colors.length-1)];
            if (!opts.find(o=>o.n===c2.n)) opts.push(c2);
        }
        opts.sort(()=>Math.random()-0.5);
        el('cmTarget').style.background = target.v;
        el('cmOpts').innerHTML = opts.map(o=>
            `<button class="tile-btn" onclick="cmPick('${o.n}','${target.n}')" style="font-weight:700">
                ${o.n}
            </button>`
        ).join('');
        window.cmPick = (picked, correct) => {
            if (!running) return;
            if (picked === correct) { score++; el('cmScore').textContent = score; showMsg('cmMsg','✅ Correct!','good'); }
            else { showMsg('cmMsg',`❌ It was ${correct}!`,'bad'); }
            setTimeout(nextRound, 600);
        };
    }
    c.innerHTML = `
        <h2 class="g-title">🎨 Color Match</h2>
        <p class="g-sub">What color is shown? Score: <span id="cmScore">0</span> · Time: <span id="cmTime">30</span>s</p>
        <div id="cmTarget" style="height:80px;border-radius:14px;margin:10px 0;border:2px solid rgba(201,72,91,0.2);transition:background .3s"></div>
        <div class="tile-grid" id="cmOpts" style="grid-template-columns:1fr 1fr"></div>
        <div id="cmMsg"></div>
        ${scoreboardHTML('colorMatch','pts')}
    `;
    nextRound();
    timer = setInterval(() => {
        timeLeft--;
        el('cmTime').textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer); running = false;
            el('cmOpts').innerHTML = '';
            saveScore('colorMatch', score);
            showMsg('cmMsg', `🎉 Time up! Score: ${score}`, 'good');
        }
    }, 1000);
}

/* ══════════════════════════════════════════════════════
   GAME 7 — Flappy Bird (Canvas)
══════════════════════════════════════════════════════ */
function flappyBird(c) {
    c.innerHTML = `
        <h2 class="g-title">🐦 Flappy Bird</h2>
        <p class="g-sub">Tap / Press Space to fly!</p>
        <canvas class="g-canvas" id="fbCanvas" width="320" height="240"></canvas>
        <div id="fbMsg"></div>
        ${scoreboardHTML('flappyBird','pts')}
    `;
    const canvas = el('fbCanvas');
    const ctx = canvas.getContext('2d');
    const W=320, H=240, GRAVITY=0.28, JUMP=-5.5, PIPE_W=38, GAP=75, PIPE_SPEED=2.2;
    let bird={x:60,y:H/2,vy:0}, pipes=[], score=0, frame=0, running=true, started=false;

    function addPipe() {
        const top = R(30, H-GAP-30);
        pipes.push({x:W, top, bottom:top+GAP});
    }
    function jump() {
        if (!started) { started=true; }
        bird.vy = JUMP;
    }
    canvas.addEventListener('click', jump);
    canvas.addEventListener('touchstart', e => { e.preventDefault(); jump(); }, {passive:false});
    document.addEventListener('keydown', e => { if (e.code==='Space') { e.preventDefault(); jump(); } });

    function loop() {
        if (!running) return;
        ctx.fillStyle='#fde8ec';
        ctx.fillRect(0,0,W,H);
        // ground
        ctx.fillStyle='#c8963e';
        ctx.fillRect(0,H-20,W,20);

        if (started) {
            bird.vy += GRAVITY;
            bird.y += bird.vy;
            if (frame%80===0) addPipe();
            frame++;
            pipes.forEach(p => p.x -= PIPE_SPEED);
            pipes = pipes.filter(p => p.x > -PIPE_W);
            // score
            pipes.forEach(p => { if (p.x+PIPE_W < bird.x && !p.scored) { p.scored=true; score++; } });
        }

        // draw pipes
        pipes.forEach(p => {
            ctx.fillStyle='#3a8a50';
            ctx.beginPath(); ctx.roundRect(p.x,0,PIPE_W,p.top,4); ctx.fill();
            ctx.beginPath(); ctx.roundRect(p.x,p.bottom,PIPE_W,H-p.bottom-20,4); ctx.fill();
        });

        // draw bird
        ctx.font='22px serif';
        ctx.fillText('🐦', bird.x-11, bird.y+8);

        // score
        ctx.fillStyle='#c9485b';
        ctx.font='bold 18px Josefin Sans,sans-serif';
        ctx.fillText(score, 10, 26);

        // collision
        const hit = bird.y<0||bird.y>H-20||pipes.some(p=>
            bird.x+10>p.x&&bird.x-10<p.x+PIPE_W&&(bird.y-10<p.top||bird.y+10>p.bottom));
        if (hit) {
            running=false;
            saveScore('flappyBird', score);
            showMsg('fbMsg',`💔 Game Over! Score: ${score}. Tap to restart.`,'bad');
            canvas.onclick = () => flappyBird(c);
            return;
        }
        if (!started) {
            ctx.fillStyle='rgba(201,72,91,0.8)';
            ctx.font='14px Josefin Sans,sans-serif';
            ctx.textAlign='center';
            ctx.fillText('Tap to start!', W/2, H/2);
            ctx.textAlign='left';
        }
        requestAnimationFrame(loop);
    }
    loop();
}

/* ══════════════════════════════════════════════════════
   GAME 8 — Word Search
══════════════════════════════════════════════════════ */
function wordSearch(c) {
    const words = ['LOVE','NIHARIKA','BIRTHDAY','ROSE','MAGIC','WISH','HEART','DREAM'];
    const SIZE = 9;
    let grid = Array.from({length:SIZE},()=>Array(SIZE).fill(''));
    let found = [], selecting=false, startCell=null, selectedCells=[];

    function placeWord(word) {
        const dirs = [[0,1],[1,0],[1,1],[-1,1],[0,-1],[-1,0],[-1,-1],[1,-1]];
        for (let attempt=0;attempt<100;attempt++) {
            const [dr,dc] = dirs[R(0,dirs.length-1)];
            const r = R(0,SIZE-1), col = R(0,SIZE-1);
            let ok=true, cells=[];
            for (let i=0;i<word.length;i++) {
                const nr=r+dr*i, nc=col+dc*i;
                if (nr<0||nr>=SIZE||nc<0||nc>=SIZE) { ok=false; break; }
                if (grid[nr][nc]!==''&&grid[nr][nc]!==word[i]) { ok=false; break; }
                cells.push([nr,nc]);
            }
            if (ok) { cells.forEach(([r,c],i)=>grid[r][c]=word[i]); return true; }
        }
        return false;
    }
    words.forEach(w=>placeWord(w));
    for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE;c++) {
        if (!grid[r][c]) grid[r][c]='ABCDEFGHIJKLMNOPQRSTUVWXYZ'[R(0,25)];
    }

    c.innerHTML = `
        <h2 class="g-title">🔤 Word Search</h2>
        <p class="g-sub">Find: ${words.map(w=>`<span id="ws_${w}" style="margin:0 3px;color:var(--gold)">${w}</span>`).join('')}</p>
        <div id="wsGrid" style="display:grid;grid-template-columns:repeat(${SIZE},1fr);gap:3px;max-width:300px;margin:10px auto;user-select:none"></div>
        <div id="wsMsg"></div>
        ${scoreboardHTML('wordSearch','words')}
    `;
    const gridEl = el('wsGrid');
    words.forEach(w => placeWord(w));

    const cellEls = [];
    for (let r=0;r<SIZE;r++) for (let col=0;col<SIZE;col++) {
        const td = document.createElement('div');
        td.textContent = grid[r][col];
        td.dataset.r = r; td.dataset.c = col;
        td.style.cssText='aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:6px;font-size:clamp(0.7rem,2.5vw,0.9rem);font-weight:700;cursor:pointer;background:rgba(201,72,91,0.06);transition:background .15s;color:var(--text)';
        td.onmousedown = td.ontouchstart = (e) => { e.preventDefault(); startSel(td); };
        td.onmouseenter = () => { if (selecting) extendSel(td); };
        td.onmouseup = td.ontouchend = () => endSel();
        gridEl.appendChild(td);
        cellEls.push(td);
    }
    document.addEventListener('mouseup', endSel);

    function startSel(td) { selecting=true; startCell=td; selectedCells=[td]; highlightSel(); }
    function extendSel(td) {
        if (!selecting) return;
        const r0=+startCell.dataset.r, c0=+startCell.dataset.c;
        const r1=+td.dataset.r, c1=+td.dataset.c;
        const dr=Math.sign(r1-r0), dc=Math.sign(c1-c0);
        const steps=Math.max(Math.abs(r1-r0),Math.abs(c1-c0));
        selectedCells=[];
        for(let i=0;i<=steps;i++) {
            const nr=r0+dr*i, nc=c0+dc*i;
            const found=cellEls.find(x=>+x.dataset.r===nr&&+x.dataset.c===nc);
            if(found) selectedCells.push(found);
        }
        highlightSel();
    }
    function highlightSel() {
        cellEls.forEach(td=>{ if(!td.dataset.found) td.style.background='rgba(201,72,91,0.06)'; });
        selectedCells.forEach(td=>{ if(!td.dataset.found) td.style.background='rgba(201,72,91,0.25)'; });
    }
    function endSel() {
        if(!selecting) return; selecting=false;
        const word=selectedCells.map(td=>td.textContent).join('');
        const revWord=selectedCells.map(td=>td.textContent).reverse().join('');
        const match=words.find(w=>w===word||w===revWord);
        if(match&&!found.includes(match)) {
            found.push(match);
            selectedCells.forEach(td=>{ td.style.background='rgba(200,150,62,0.35)'; td.dataset.found='1'; });
            const span=document.getElementById('ws_'+match);
            if(span){span.style.textDecoration='line-through';span.style.color='#3a8a50';}
            if(found.length===words.length){ saveScore('wordSearch',words.length); showMsg('wsMsg','🎉 All words found!','good'); }
        } else {
            selectedCells.forEach(td=>{ if(!td.dataset.found) td.style.background='rgba(201,72,91,0.06)'; });
        }
        selectedCells=[];
    }
}

/* ══════════════════════════════════════════════════════
   GAME 9 — Rock Paper Scissors
══════════════════════════════════════════════════════ */
function rps(c) {
    let wins=0,losses=0,draws=0,rounds=0;
    const choices=['✊','✋','✌️'];
    const names=['Rock','Paper','Scissors'];
    c.innerHTML = `
        <h2 class="g-title">✊ Rock Paper Scissors</h2>
        <p class="g-sub">Win: <span id="rpsW">0</span> · Loss: <span id="rpsL">0</span> · Draw: <span id="rpsD">0</span></p>
        <div style="text-align:center;margin:12px 0">
            ${choices.map((ch,i)=>`<span class="rps-choice" onclick="rpsPick(${i})">${ch}</span>`).join('')}
        </div>
        <div id="rpsResult" style="text-align:center;font-size:1.8rem;min-height:50px"></div>
        <div id="rpsMsg"></div>
        ${scoreboardHTML('rps','wins')}
    `;
    window.rpsPick = (i) => {
        const cpu = R(0,2);
        const res = el('rpsResult');
        res.textContent = `You: ${choices[i]} vs CPU: ${choices[cpu]}`;
        rounds++;
        if (i===cpu) { draws++; showMsg('rpsMsg','🤝 Draw!','info'); }
        else if ((i-cpu+3)%3===1) { wins++; showMsg('rpsMsg','🎉 You Win!','good'); }
        else { losses++; showMsg('rpsMsg','💔 CPU Wins!','bad'); }
        el('rpsW').textContent=wins;
        el('rpsL').textContent=losses;
        el('rpsD').textContent=draws;
        if(rounds%5===0) saveScore('rps',wins);
    };
}

/* ══════════════════════════════════════════════════════
   GAME 10 — Math Challenge
══════════════════════════════════════════════════════ */
function mathChallenge(c) {
    let score=0, timeLeft=30, running=true, timer=null, a, b, op, answer;
    function newQ() {
        const ops=['+','-','×'];
        op=ops[R(0,2)];
        if(op==='+'){a=R(1,50);b=R(1,50);answer=a+b;}
        else if(op==='-'){a=R(10,99);b=R(1,a);answer=a-b;}
        else{a=R(1,12);b=R(1,12);answer=a*b;}
        el('mcQ').textContent=`${a} ${op} ${b} = ?`;
        el('mcInp').value='';
        el('mcInp').focus();
    }
    c.innerHTML=`
        <h2 class="g-title">🧮 Math Challenge</h2>
        <p class="g-sub">Score: <span id="mcScore">0</span> · Time: <span id="mcTime">30</span>s</p>
        <div class="g-score-display" id="mcQ"></div>
        <input class="g-input" id="mcInp" type="number" placeholder="Your answer…" style="margin:10px 0">
        <div style="text-align:center"><button class="g-btn" onclick="mcSubmit()">Submit ✓</button></div>
        <div id="mcMsg"></div>
        ${scoreboardHTML('mathChallenge','pts')}
    `;
    newQ();
    el('mcInp').addEventListener('keydown',e=>{if(e.key==='Enter')window.mcSubmit();});
    window.mcSubmit=()=>{
        if(!running)return;
        const val=parseInt(el('mcInp').value);
        if(val===answer){score++;el('mcScore').textContent=score;showMsg('mcMsg','✅ Correct!','good');newQ();}
        else{showMsg('mcMsg',`❌ Answer was ${answer}`,'bad');newQ();}
    };
    timer=setInterval(()=>{
        timeLeft--;el('mcTime').textContent=timeLeft;
        if(timeLeft<=0){clearInterval(timer);running=false;saveScore('mathChallenge',score);showMsg('mcMsg',`🎉 Time up! Score: ${score}`,'info');}
    },1000);
}

/* ══════════════════════════════════════════════════════
   GAME 11 — Snake Game (Canvas)
══════════════════════════════════════════════════════ */
function snakeGame(c) {
    c.innerHTML=`
        <h2 class="g-title">🐍 Snake Game</h2>
        <p class="g-sub">Use arrow keys or swipe to move</p>
        <canvas class="g-canvas" id="snCanvas" width="280" height="280"></canvas>
        <div id="snMsg"></div>
        ${scoreboardHTML('snakeGame','pts')}
    `;
    const canvas=el('snCanvas'), ctx=canvas.getContext('2d');
    const CELL=20, COLS=14, ROWS=14;
    let snake=[{x:7,y:7}], dir={x:1,y:0}, food={x:3,y:3}, score=0, running=true, gameTimer=null;
    let touchStart=null;

    function placeFood(){food={x:R(0,COLS-1),y:R(0,ROWS-1)};}
    function draw(){
        ctx.fillStyle='#fde8ec'; ctx.fillRect(0,0,280,280);
        // grid
        ctx.strokeStyle='rgba(201,72,91,0.06)';
        for(let i=0;i<=COLS;i++){ctx.beginPath();ctx.moveTo(i*CELL,0);ctx.lineTo(i*CELL,280);ctx.stroke();}
        for(let i=0;i<=ROWS;i++){ctx.beginPath();ctx.moveTo(0,i*CELL);ctx.lineTo(280,i*CELL);ctx.stroke();}
        // food
        ctx.font='16px serif'; ctx.fillText('🍓',food.x*CELL+2,food.y*CELL+16);
        // snake
        snake.forEach((seg,i)=>{
            ctx.fillStyle=i===0?'#c9485b':'#8b2252';
            ctx.beginPath(); ctx.roundRect(seg.x*CELL+1,seg.y*CELL+1,CELL-2,CELL-2,4); ctx.fill();
        });
        // score
        ctx.fillStyle='#c9485b'; ctx.font='bold 14px Josefin Sans,sans-serif'; ctx.fillText('Score: '+score,6,16);
    }
    function tick(){
        if(!running)return;
        const head={x:(snake[0].x+dir.x+COLS)%COLS, y:(snake[0].y+dir.y+ROWS)%ROWS};
        if(snake.some(s=>s.x===head.x&&s.y===head.y)){
            running=false; clearInterval(gameTimer);
            saveScore('snakeGame',score);
            showMsg('snMsg',`💔 Game Over! Score: ${score}`,'bad');
            return;
        }
        snake.unshift(head);
        if(head.x===food.x&&head.y===food.y){score++;placeFood();}
        else snake.pop();
        draw();
    }
    draw();
    gameTimer=setInterval(tick,150);
    document.addEventListener('keydown',e=>{
        if(e.key==='ArrowUp'&&dir.y===0)dir={x:0,y:-1};
        else if(e.key==='ArrowDown'&&dir.y===0)dir={x:0,y:1};
        else if(e.key==='ArrowLeft'&&dir.x===0)dir={x:-1,y:0};
        else if(e.key==='ArrowRight'&&dir.x===0)dir={x:1,y:0};
    });
    canvas.addEventListener('touchstart',e=>{touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
    canvas.addEventListener('touchend',e=>{
        if(!touchStart)return;
        const dx=e.changedTouches[0].clientX-touchStart.x, dy=e.changedTouches[0].clientY-touchStart.y;
        if(Math.abs(dx)>Math.abs(dy)){if(dx>0&&dir.x===0)dir={x:1,y:0};else if(dx<0&&dir.x===0)dir={x:-1,y:0};}
        else{if(dy>0&&dir.y===0)dir={x:0,y:1};else if(dy<0&&dir.y===0)dir={x:0,y:-1};}
        touchStart=null;
    },{passive:true});
}

/* ══════════════════════════════════════════════════════
   GAME 12 — Spin The Wheel
══════════════════════════════════════════════════════ */
function spinTheWheel(c) {
    const prizes=['🎁 Gift','💖 Love','🌟 Star','🎂 Cake','💌 Letter','🍀 Luck','🎈 Balloon','✨ Magic'];
    const colors=['#c9485b','#c8963e','#7b4fa6','#2e7d8e','#d4507a','#3a8a50','#8b2252','#1a6e9a'];
    let spinning=false, angle=0, vel=0, spins=0;
    c.innerHTML=`
        <h2 class="g-title">🎡 Spin The Wheel</h2>
        <p class="g-sub">Tap spin and discover your prize!</p>
        <canvas class="g-canvas" id="swCanvas" width="240" height="240"></canvas>
        <div style="text-align:center;margin:10px 0">
            <button class="g-btn" id="swBtn" onclick="swSpin()">🌀 Spin!</button>
        </div>
        <div id="swMsg"></div>
        ${scoreboardHTML('spinTheWheel','spins')}
    `;
    const canvas=el('swCanvas'), ctx=canvas.getContext('2d');
    const cx=120, cy=120, r=110;
    function drawWheel(){
        const slice=2*Math.PI/prizes.length;
        prizes.forEach((prize,i)=>{
            const start=angle+i*slice, end=start+slice;
            ctx.beginPath(); ctx.moveTo(cx,cy);
            ctx.arc(cx,cy,r,start,end); ctx.closePath();
            ctx.fillStyle=colors[i]; ctx.fill();
            ctx.strokeStyle='white'; ctx.lineWidth=2; ctx.stroke();
            ctx.save(); ctx.translate(cx,cy); ctx.rotate(start+slice/2);
            ctx.fillStyle='white'; ctx.font='bold 11px Josefin Sans,sans-serif';
            ctx.textAlign='right'; ctx.fillText(prize.split(' ')[0],r-6,4);
            ctx.restore();
        });
        // pointer
        ctx.beginPath(); ctx.moveTo(cx+r+2,cy); ctx.lineTo(cx+r+14,cy-8); ctx.lineTo(cx+r+14,cy+8);
        ctx.closePath(); ctx.fillStyle='#c9485b'; ctx.fill();
        // center
        ctx.beginPath(); ctx.arc(cx,cy,14,0,2*Math.PI); ctx.fillStyle='white'; ctx.fill();
        ctx.strokeStyle='#c9485b'; ctx.lineWidth=2; ctx.stroke();
    }
    function animate(){
        if(!spinning)return;
        angle+=vel; vel*=0.985;
        ctx.clearRect(0,0,240,240); drawWheel();
        if(vel<0.003){
            spinning=false;
            const norm=((angle%(2*Math.PI))+2*Math.PI)%(2*Math.PI);
            const slice=2*Math.PI/prizes.length;
            const landed=prizes[prizes.length-1-Math.floor(norm/slice)%prizes.length];
            spins++; saveScore('spinTheWheel',spins);
            showMsg('swMsg',`🎉 You got: ${landed}!`,'good');
            el('swBtn').disabled=false;
        } else requestAnimationFrame(animate);
    }
    window.swSpin=()=>{
        if(spinning)return; spinning=true; vel=0.18+Math.random()*0.14;
        el('swBtn').disabled=true; el('swMsg').innerHTML='';
        animate();
    };
    drawWheel();
}

/* ══════════════════════════════════════════════════════
   GAME 13 — Type Racer
══════════════════════════════════════════════════════ */
function typeRacer(c) {
    const sentences=[
        "Happy 20th birthday Niharika you are amazing",
        "Love is the most beautiful feeling in the world",
        "Every moment with you feels like a fairytale",
        "You make every ordinary day extraordinary",
        "Stars shine bright but you shine the brightest",
    ];
    let sentence=sentences[R(0,sentences.length-1)].toUpperCase();
    let typed='', startTime=null, finished=false;
    c.innerHTML=`
        <h2 class="g-title">⌨️ Type Racer</h2>
        <p class="g-sub">Type the text below as fast as you can!</p>
        <div class="type-display" id="trDisplay"></div>
        <input class="g-input" id="trInput" placeholder="Start typing…" autocomplete="off" autocorrect="off" spellcheck="false">
        <div id="trMsg"></div>
        ${scoreboardHTML('typeRacer','WPM')}
    `;
    function render(){
        const d=el('trDisplay');
        d.innerHTML=sentence.split('').map((ch,i)=>{
            if(i<typed.length) return `<span style="color:${typed[i]===ch?'var(--gold)':'#e53e3e'}">${ch}</span>`;
            if(i===typed.length) return `<span class="cursor" style="border-bottom:2px solid var(--rose)">${ch}</span>`;
            return `<span style="color:var(--text)">${ch}</span>`;
        }).join('');
    }
    render();
    el('trInput').addEventListener('input',e=>{
        if(finished)return;
        if(!startTime) startTime=Date.now();
        typed=e.target.value.toUpperCase();
        render();
        if(typed===sentence){
            finished=true;
            const secs=(Date.now()-startTime)/1000;
            const wpm=Math.round((sentence.split(' ').length/secs)*60);
            saveScore('typeRacer',wpm);
            showMsg('trMsg',`🎉 Done in ${secs.toFixed(1)}s! ${wpm} WPM!`,'good');
        }
    });
    el('trInput').focus();
}

/* ══════════════════════════════════════════════════════
   GAME 14 — Emoji Match
══════════════════════════════════════════════════════ */
function emojiMatch(c) {
    // Same as memoryMatch but with a different emoji set and 5x4 grid
    const emojis=['🌸','💖','🎂','🌟','💌','🦋','🌙','🎈','🌺','💎'];
    let cards=[...emojis,...emojis].sort(()=>Math.random()-0.5);
    let flipped=[],matched=[],locked=false,moves=0;
    c.innerHTML=`
        <h2 class="g-title">😊 Emoji Match</h2>
        <p class="g-sub">Moves: <span id="emMoves">0</span></p>
        <div class="g-grid" id="emGrid" style="grid-template-columns:repeat(5,1fr);max-width:320px;margin:0 auto"></div>
        <div id="emMsg"></div>
        ${scoreboardHTML('emojiMatch','pts')}
    `;
    const grid=el('emGrid');
    cards.forEach((emoji,i)=>{
        const d=document.createElement('div');
        d.className='g-card-face'; d.dataset.i=i; d.dataset.e=emoji;
        d.onclick=()=>{
            if(locked||d.classList.contains('revealed')||d.classList.contains('matched'))return;
            d.classList.add('revealed'); d.textContent=emoji; flipped.push(d);
            if(flipped.length===2){
                locked=true; moves++; el('emMoves').textContent=moves;
                if(flipped[0].dataset.e===flipped[1].dataset.e){
                    flipped.forEach(x=>x.classList.replace('revealed','matched'));
                    matched.push(...flipped); flipped=[]; locked=false;
                    if(matched.length===cards.length){
                        const score=Math.max(10,300-moves*6);
                        saveScore('emojiMatch',score);
                        showMsg('emMsg',`🎉 Complete in ${moves} moves! Score: ${score}`,'good');
                    }
                } else {
                    setTimeout(()=>{flipped.forEach(x=>{x.classList.remove('revealed');x.textContent='';});flipped=[];locked=false;},900);
                }
            }
        };
        grid.appendChild(d);
    });
}

/* ══════════════════════════════════════════════════════
   GAME 15 — Fortune Teller
══════════════════════════════════════════════════════ */
function fortuneTeller(c) {
    const fortunes=[
        "💖 Love is heading your way — open your heart wide!",
        "🌟 A beautiful surprise awaits you very soon.",
        "🌸 Someone is thinking of you with a warm smile right now.",
        "✨ Your future is dazzling — trust the journey.",
        "🍀 Luck follows you like a shadow today and always.",
        "💌 A message you've been waiting for will arrive soon.",
        "🌙 Tonight will bring clarity to something that's been on your mind.",
        "🎂 Your birthday wish is closer to coming true than you think.",
        "🦋 Change is coming — and it will be more beautiful than you imagined.",
        "🌺 You are deeply, completely, endlessly loved.",
    ];
    let count=0;
    c.innerHTML=`
        <h2 class="g-title">🔮 Fortune Teller</h2>
        <p class="g-sub">Ask the orb your deepest question…</p>
        <div class="fortune-orb" onclick="revealFortune()">🔮</div>
        <div id="ftFortune" style="text-align:center;font-family:'Dancing Script',cursive;font-size:1.1rem;color:var(--text);min-height:60px;padding:10px"></div>
        <div id="ftMsg"></div>
        ${scoreboardHTML('fortuneTeller','readings')}
    `;
    window.revealFortune=()=>{
        const orb=document.querySelector('.fortune-orb');
        orb.style.transform='scale(1.2) rotate(10deg)';
        setTimeout(()=>orb.style.transform='',400);
        el('ftFortune').textContent=fortunes[R(0,fortunes.length-1)];
        count++; saveScore('fortuneTeller',count);
    };
}

/* ══════════════════════════════════════════════════════
   GAME 16 — Piano Tiles
══════════════════════════════════════════════════════ */
function pianoTiles(c) {
    let score=0, missed=0, running=true, speed=800;
    const cols=4;
    c.innerHTML=`
        <h2 class="g-title">🎹 Piano Tiles</h2>
        <p class="g-sub">Score: <span id="ptScore">0</span> · Miss: <span id="ptMiss">0</span>/3</p>
        <div id="ptTrack" style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;height:180px;overflow:hidden;border-radius:12px;margin:10px 0"></div>
        <div id="ptMsg"></div>
        ${scoreboardHTML('pianoTiles','pts')}
    `;
    const track=el('ptTrack');

    function addRow(active){
        const row=document.createElement('div');
        row.style.cssText=`display:contents`;
        for(let i=0;i<cols;i++){
            const tile=document.createElement('div');
            const isActive=i===active;
            tile.style.cssText=`height:40px;border-radius:8px;cursor:pointer;
                background:${isActive?'linear-gradient(180deg,var(--rose),#8b2252)':'rgba(201,72,91,0.08)'};
                border:${isActive?'none':'1px solid rgba(201,72,91,0.1)'};
                transition:opacity .1s;`;
            tile.dataset.active=isActive?'1':'0';
            tile.onclick=()=>{
                if(!running)return;
                if(isActive){score++;el('ptScore').textContent=score;tile.style.opacity='0';}
                else{missed++;el('ptMiss').textContent=missed;tile.style.background='#fecdd3';
                    if(missed>=3){running=false;saveScore('pianoTiles',score);showMsg('ptMsg',`💔 Game Over! Score: ${score}`,'bad');}
                }
            };
            track.appendChild(tile);
        }
    }

    let interval=setInterval(()=>{
        if(!running){clearInterval(interval);return;}
        addRow(R(0,3));
        // remove old rows
        while(track.children.length>cols*5) track.removeChild(track.firstChild);
        if(score>0&&score%10===0) speed=Math.max(300,speed-50);
    }, speed);
    addRow(R(0,3));
}

/* ══════════════════════════════════════════════════════
   GAME 17 — Dice Roll
══════════════════════════════════════════════════════ */
function diceRoll(c) {
    const faces=['⚀','⚁','⚂','⚃','⚄','⚅'];
    let total=0,rolls=0;
    c.innerHTML=`
        <h2 class="g-title">🎯 Dice Roll</h2>
        <p class="g-sub">Roll the dice and try to get the highest total in 10 rolls!</p>
        <div style="text-align:center;font-size:5rem;min-height:90px" id="drFace">🎲</div>
        <div class="g-score-display" id="drTotal">Total: 0</div>
        <p style="text-align:center;font-size:0.82rem;color:var(--gold)">Rolls left: <span id="drLeft">10</span></p>
        <div style="text-align:center"><button class="g-btn" id="drBtn" onclick="drRoll()">🎲 Roll!</button></div>
        <div id="drMsg"></div>
        ${scoreboardHTML('diceRoll','pts')}
    `;
    window.drRoll=()=>{
        if(rolls>=10)return;
        const val=R(1,6); total+=val; rolls++;
        const left=10-rolls;
        el('drFace').textContent=faces[val-1];
        el('drTotal').textContent=`Total: ${total}`;
        el('drLeft').textContent=left;
        if(rolls>=10){
            el('drBtn').disabled=true;
            saveScore('diceRoll',total);
            showMsg('drMsg',`🎉 Final score: ${total}/60!`,'good');
        }
    };
}

/* ══════════════════════════════════════════════════════
   GAME 18 — Jump Quest (Canvas)
══════════════════════════════════════════════════════ */
function jumpGame(c) {
    c.innerHTML=`
        <h2 class="g-title">🦘 Jump Quest</h2>
        <p class="g-sub">Tap / Space to jump!</p>
        <canvas class="g-canvas" id="jqCanvas" width="320" height="160"></canvas>
        <div id="jqMsg"></div>
        ${scoreboardHTML('jumpGame','pts')}
    `;
    const canvas=el('jqCanvas'), ctx=canvas.getContext('2d');
    const GROUND=130, GRAVITY=0.5, JUMP_F=-10;
    let player={x:50,y:GROUND,vy:0,onGround:true};
    let obstacles=[], score=0, frame=0, speed=3, running=true;

    function jump(e){if(e)e.preventDefault();if(player.onGround){player.vy=JUMP_F;player.onGround=false;}}
    canvas.addEventListener('click',jump);
    canvas.addEventListener('touchstart',e=>{e.preventDefault();jump();},{passive:false});
    document.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();jump();}});

    function loop(){
        if(!running)return;
        ctx.fillStyle='#fde8ec';ctx.fillRect(0,0,320,160);
        // ground
        ctx.fillStyle='#c8963e';ctx.fillRect(0,GROUND+30,320,4);
        // player
        player.vy+=GRAVITY; player.y+=player.vy;
        if(player.y>=GROUND){player.y=GROUND;player.vy=0;player.onGround=true;}
        ctx.font='28px serif';ctx.fillText('🦘',player.x-14,player.y+20);
        // obstacles
        if(frame%70===0){obstacles.push({x:320,h:R(20,40)});}
        obstacles.forEach(o=>{o.x-=speed;});
        obstacles=obstacles.filter(o=>o.x>-20);
        obstacles.forEach(o=>{
            ctx.fillStyle='#c9485b';
            ctx.beginPath();ctx.roundRect(o.x,GROUND+30-o.h,20,o.h,4);ctx.fill();
            ctx.font='18px serif';ctx.fillText('🌵',o.x-2,GROUND+28-o.h);
            if(o.x<player.x+18&&o.x+18>player.x&&player.y+20>GROUND+30-o.h){
                running=false;saveScore('jumpGame',score);
                showMsg('jqMsg',`💔 Game Over! Score: ${score}. Tap to retry.`,'bad');
                canvas.onclick=()=>jumpGame(c);
            }
        });
        frame++; score=Math.floor(frame/6);
        if(frame%300===0)speed+=0.3;
        ctx.fillStyle='#c9485b';ctx.font='bold 14px Josefin Sans,sans-serif';ctx.fillText('Score: '+score,6,18);
        requestAnimationFrame(loop);
    }
    loop();
}

/* ══════════════════════════════════════════════════════
   GAME 19 — Puzzle Slide
══════════════════════════════════════════════════════ */
function puzzleSlide(c) {
    const SIZE=3;
    let tiles=[...Array(SIZE*SIZE-1).keys()].map(i=>i+1);
    tiles.push(0); // 0 = empty
    // shuffle
    for(let i=tiles.length-1;i>0;i--){const j=R(0,i);[tiles[i],tiles[j]]=[tiles[j],tiles[i]];}
    let moves=0;

    function render(){
        const grid=el('psGrid');
        if(!grid)return;
        grid.innerHTML='';
        tiles.forEach((v,i)=>{
            const d=document.createElement('div');
            d.className='slide-tile'+(v===0?' empty':'');
            d.style.cssText=`aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:10px;font-size:clamp(1rem,4vw,1.4rem);font-weight:700;cursor:${v?'pointer':'default'};transition:all .18s;background:${v?'linear-gradient(135deg,var(--rose),#8b2252)':'rgba(201,72,91,0.06)'};color:white;box-shadow:${v?'0 3px 10px rgba(201,72,91,0.25)':'none'};`;
            if(v){
                d.textContent=v;
                d.onclick=()=>{
                    const ei=tiles.indexOf(0);
                    const row=Math.floor(i/SIZE), col=i%SIZE;
                    const er=Math.floor(ei/SIZE), ec=ei%SIZE;
                    if((Math.abs(row-er)===1&&col===ec)||(Math.abs(col-ec)===1&&row===er)){
                        [tiles[i],tiles[ei]]=[tiles[ei],tiles[i]];
                        moves++; el('psMoves').textContent=moves; render();
                        if(tiles.every((v,i)=>v===(i===SIZE*SIZE-1?0:i+1))){
                            const score=Math.max(10,500-moves*10);
                            saveScore('puzzleSlide',score);
                            showMsg('psMsg',`🎉 Solved in ${moves} moves! Score: ${score}`,'good');
                        }
                    }
                };
            }
            grid.appendChild(d);
        });
    }
    c.innerHTML=`
        <h2 class="g-title">🧩 Puzzle Slide</h2>
        <p class="g-sub">Moves: <span id="psMoves">0</span> — Arrange 1–8 in order!</p>
        <div id="psGrid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;max-width:220px;margin:12px auto"></div>
        <div id="psMsg"></div>
        ${scoreboardHTML('puzzleSlide','pts')}
    `;
    render();
}

/* ══════════════════════════════════════════════════════
   GAME 20 — Birthday Trivia about Niharika!
══════════════════════════════════════════════════════ */
function birthdayTrivia(c) {
    const questions=[
        {q:"What milestone birthday is Niharika celebrating?",opts:["18th","19th","20th","21st"],a:2},
        {q:"What does the birthday theme of this website use?",opts:["Blue & Silver","Cream, Rose & Gold","Black & White","Green & Yellow"],a:1},
        {q:"How many love letters are hidden in the wishes section?",opts:["10","15","20","25"],a:2},
        {q:"What special feature does the landing page (index) have?",opts:["3D cake","Poppable balloons","Video player","Photo slideshow"],a:1},
        {q:"What does popping a balloon reveal?",opts:["A score","A birthday wish","A photo","A game"],a:1},
        {q:"How many unique wishes can you find in the balloons?",opts:["50","60","75","100"],a:2},
        {q:"Which 3D element is featured on the cake page?",opts:["A birthday cake","A balloon","A gift","A heart"],a:0},
        {q:"What does the countdown timer count down to?",opts:["New Year","Niharika's Birthday","Christmas","Anniversary"],a:1},
    ];
    let qi=0, score=0;
    function render(){
        if(qi>=questions.length){
            const top=saveScore('birthdayTrivia',score*15);
            c.innerHTML=`
                <h2 class="g-title">🎂 Birthday Trivia</h2>
                <div class="g-score-display">${score}/${questions.length}</div>
                <div class="g-msg info">Score: ${score*15} pts 🎉</div>
                ${scoreboardHTML('birthdayTrivia','pts')}
                <div style="text-align:center;margin-top:12px">
                    <button class="g-btn" onclick="birthdayTrivia(el('gameContent'))">Play Again</button>
                </div>`;
            return;
        }
        const q=questions[qi];
        c.innerHTML=`
            <h2 class="g-title">🎂 Birthday Trivia</h2>
            <p class="g-sub">Question ${qi+1} of ${questions.length} · Score: ${score}</p>
            <div class="g-msg info" style="margin-bottom:12px">${q.q}</div>
            <div class="tile-grid" style="grid-template-columns:1fr 1fr">
                ${q.opts.map((o,i)=>`<button class="tile-btn" onclick="btAns(${i})">${o}</button>`).join('')}
            </div>
            <div id="btMsg"></div>`;
    }
    window.btAns=(i)=>{
        const q=questions[qi];
        const btns=document.querySelectorAll('.tile-btn');
        btns.forEach(b=>b.disabled=true);
        if(i===q.a){score++;btns[i].classList.add('correct');showMsg('btMsg','✅ Correct!','good');}
        else{btns[i].classList.add('wrong');btns[q.a].classList.add('correct');showMsg('btMsg','❌ Wrong!','bad');}
        setTimeout(()=>{qi++;render();},900);
    };
    render();
}

/* ── Utility: show message in element by id ── */
function showMsg(id, text, type) {
    const el2 = el(id);
    if (!el2) return;
    el2.innerHTML = `<div class="g-msg ${type}">${text}</div>`;
}
