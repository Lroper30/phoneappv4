/* =========================================================
   SLOT PHONE X
   MAIN JAVASCRIPT
   ========================================================= */


/* =========================================================
   SAVE DATA
   ========================================================= */

const SAVE_KEY = "slotPhoneXSave";

const defaultState = {
    coins: 0,
    xp: 0,
    clickPower: 1,
    autoCoins: 0,
    highScores: {},
    installedGames: [],
    gameIcons: {},
    blockBlastImage: "",
    installedApps: null,
    notes: "",
    noteTitle: "",
    dark: true,
    neon: false,
    sound: true,
    notifications: true,

    owned: {
        double: false,
        neon: false,
        badge: false,
        coinBoost: false
    },

    achievements: [],
    streak: 0,
    lastDaily: "",
    questCoins: 0,

    favorites: [],
    lastSong: 0,
    shuffle: false,
    repeat: false,
    volume: 0.70
};

function $(id) {
    return document.getElementById(id);
}

function setText(id, value) {
    const element = $(id);
    if (element) element.textContent = String(value);
}

function toast(message) {
    let element = $("toast");
    if (!element) {
        element = document.createElement("div");
        element.id = "toast";
        element.setAttribute("role", "status");
        element.setAttribute("aria-live", "polite");
        document.body.appendChild(element);
    }

    element.textContent = String(message);
    element.classList.add("toast-show");
    clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => element.classList.remove("toast-show"), 1800);
}

function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function createDefaultState() {
    return {
        ...defaultState,
        highScores: {},
        gameIcons: {},
        installedGames: [],
        installedApps: null,
        owned: { ...defaultState.owned },
        achievements: [],
        favorites: []
    };
}


/* =========================================================
   LOAD / SAVE
   ========================================================= */

function loadState() {
    try {
        const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
        if (!isRecord(saved)) {
            throw new TypeError("Saved game data must be an object");
        }

        const defaults = createDefaultState();
        return {
            ...defaults,
            ...saved,
            owned: { ...defaults.owned, ...(isRecord(saved.owned) ? saved.owned : {}) },
            highScores: { ...defaults.highScores, ...(isRecord(saved.highScores) ? saved.highScores : {}) },
            gameIcons: { ...defaults.gameIcons, ...(isRecord(saved.gameIcons) ? saved.gameIcons : {}) },
            blockBlastImage: typeof saved.blockBlastImage === "string" ? saved.blockBlastImage : defaults.blockBlastImage,
            installedGames: Array.isArray(saved.installedGames) ? saved.installedGames : defaults.installedGames,
            installedApps: Array.isArray(saved.installedApps) ? saved.installedApps : defaults.installedApps,
            achievements: Array.isArray(saved.achievements) ? saved.achievements : defaults.achievements,
            favorites: Array.isArray(saved.favorites) ? saved.favorites : defaults.favorites
        };
    } catch (error) {
        console.error("Could not load saved game data:", error);
        return createDefaultState();
    }
}

let state = loadState();

function save() {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error("Could not save game data:", error);
        toast("Couldn’t save progress on this device");
    }
}

function buildTicTacToe(stage) {
    stage.innerHTML = `
        <div class="ttt-toolbar">
            <div class="ttt-levels" role="group" aria-label="Opponent difficulty">
                <button type="button" data-ttt-level="easy">Easy</button>
                <button type="button" data-ttt-level="classic" class="active">Classic</button>
                <button type="button" data-ttt-level="hard">Hard</button>
            </div>
            <button type="button" class="game-button" id="ttt-restart">New game</button>
        </div>
        <p class="game-message" id="ttt-status" aria-live="polite">Your move · X</p>
        <div class="tictactoe-grid" role="group" aria-label="Tic-Tac-Toe board"></div>
    `;

    const grid = stage.querySelector(".tictactoe-grid");
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    let board = Array(9).fill("");
    let level = "classic";
    let finished = false;
    let cells = [];

    const winningLine = (position, mark, positions = board) =>
        lines.find(line => line.includes(position) && line.every(index => positions[index] === mark));

    const availableMoves = positions =>
        positions.flatMap((mark, index) => mark ? [] : [index]);

    const chooseMove = () => {
        const available = availableMoves(board);
        if (level === "easy") return available[Math.floor(Math.random() * available.length)];

        const winningMove = mark => available.find(index => {
            const next = [...board];
            next[index] = mark;
            return Boolean(lines.find(line => line.every(cell => next[cell] === mark)));
        });
        const attack = winningMove("o");
        if (attack !== undefined) return attack;
        const block = winningMove("x");
        if (block !== undefined) return block;
        if (level === "classic") {
            if (available.includes(4)) return 4;
            const corners = available.filter(index => [0, 2, 6, 8].includes(index));
            if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
            return available[Math.floor(Math.random() * available.length)];
        }

        const minimax = (positions, isMaximizing, depth) => {
            if (lines.some(line => line.every(index => positions[index] === "o"))) return 10 - depth;
            if (lines.some(line => line.every(index => positions[index] === "x"))) return depth - 10;
            const moves = availableMoves(positions);
            if (!moves.length) return 0;
            const scores = moves.map(index => {
                const next = [...positions];
                next[index] = isMaximizing ? "o" : "x";
                return minimax(next, !isMaximizing, depth + 1);
            });
            return isMaximizing ? Math.max(...scores) : Math.min(...scores);
        };

        let bestMove = available[0];
        let bestScore = -Infinity;
        available.forEach(index => {
            const next = [...board];
            next[index] = "o";
            const score = minimax(next, false, 0);
            if (score > bestScore) {
                bestScore = score;
                bestMove = index;
            }
        });
        return bestMove;
    };

    const finish = (winner, line = []) => {
        finished = true;
        renderBoard();
        line.forEach(index => cells[index].classList.add("winner"));
        const status = $("ttt-status");
        if (winner === "x") {
            status.textContent = "You win! Tap New game to play again.";
            recordScore("tictactoe", 1, 1);
        } else if (winner === "o") {
            status.textContent = "The phone wins this round. Try again!";
            recordScore("tictactoe", 0, 0);
        } else {
            status.textContent = "It's a draw. Try another round!";
            recordScore("tictactoe", 0, 0);
        }
    };

    const renderBoard = () => {
        cells.forEach((cell, index) => {
            const mark = board[index];
            cell.textContent = mark.toUpperCase();
            cell.classList.toggle("x", mark === "x");
            cell.classList.toggle("o", mark === "o");
            cell.disabled = Boolean(mark) || finished;
            cell.setAttribute("aria-label", `Square ${index + 1}${mark ? `, ${mark.toUpperCase()}` : ", empty"}`);
            cell.setAttribute("aria-pressed", String(Boolean(mark)));
        });
    };

    const playComputer = () => {
        if (finished) return;
        const move = chooseMove();
        if (move === undefined) {
            finish("");
            return;
        }
        board[move] = "o";
        const line = winningLine(move, "o");
        renderBoard();
        if (line) finish("o", line);
        else if (!availableMoves(board).length) finish("");
        else $("ttt-status").textContent = "Your move · X";
    };

    const startRound = () => {
        clearTimeout(window.tictactoeTimer);
        window.tictactoeTimer = null;
        board = Array(9).fill("");
        finished = false;
        $("ttt-status").textContent = "Your move · X";
        renderBoard();
    };

    cells = Array.from({ length: 9 }, (_, index) => {
        const cell = document.createElement("button");
        cell.type = "button";
        cell.addEventListener("click", () => {
            if (finished || board[index]) return;
            board[index] = "x";
            const line = winningLine(index, "x");
            renderBoard();
            if (line) {
                finish("x", line);
                return;
            }
            if (!availableMoves(board).length) {
                finish("");
                return;
            }
            $("ttt-status").textContent = "Phone is thinking…";
            window.tictactoeTimer = setTimeout(() => {
                window.tictactoeTimer = null;
                playComputer();
            }, 240);
        });
        grid.appendChild(cell);
        return cell;
    });

    $("ttt-restart").addEventListener("click", startRound);
    stage.querySelectorAll("[data-ttt-level]").forEach(button => {
        button.addEventListener("click", () => {
            level = button.dataset.tttLevel;
            stage.querySelectorAll("[data-ttt-level]").forEach(item => {
                item.classList.toggle("active", item === button);
            });
            startRound();
        });
    });
    startRound();
}

function buildWhack(stage) {
    stage.innerHTML = '<div class="whack-toolbar"><div class="whack-levels" role="group" aria-label="Target speed"><button type="button" data-whack-level="easy">Easy</button><button type="button" data-whack-level="classic" class="active">Classic</button><button type="button" data-whack-level="blitz">Blitz</button></div><button type="button" class="game-button" id="whack-restart">Restart</button></div><div class="whack-scoreboard"><div><small>TIME</small><strong id="whack-time">30</strong></div><div><small>SCORE</small><strong id="whack-score">0</strong></div><div><small>STREAK</small><strong id="whack-streak">0×</strong></div></div><p class="game-message" id="whack-status">Hit the glowing target. Misses break your streak.</p><div class="whack-grid" id="whack-grid"></div>';
    const grid = $("whack-grid");
    let level = "classic";
    const settings = { easy: { time: 30, speed: 1150 }, classic: { time: 30, speed: 820 }, blitz: { time: 25, speed: 560 } };
    const start = () => {
        clearInterval(window.whackTimer);
        clearInterval(window.whackTargetTimer);
        let time = settings[level].time;
        let score = 0;
        let streak = 0;
        let bestStreak = 0;
        let target = -1;
        let targetHit = false;
        grid.replaceChildren();
        const cells = Array.from({ length: 9 }, (_, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.setAttribute("aria-label", `Whack tile ${index + 1}`);
            button.addEventListener("click", () => {
                if (time <= 0) return;
                if (index !== target || targetHit) {
                    streak = 0;
                    $("whack-streak").textContent = "0×";
                    $("whack-status").textContent = "Miss. Find the next target.";
                    return;
                }
                targetHit = true;
                streak++;
                bestStreak = Math.max(bestStreak, streak);
                score += 1 + Math.floor((streak - 1) / 5);
                $("whack-score").textContent = score;
                $("whack-streak").textContent = `${streak}×`;
                $("whack-status").textContent = streak > 1 ? `${streak} in a row. Keep it going!` : "Nice hit!";
            });
            grid.appendChild(button);
            return button;
        });
        const moveTarget = () => {
            if (time <= 0) return;
            if (target >= 0 && !targetHit) {
                streak = 0;
                $("whack-streak").textContent = "0×";
            }
            const previous = target;
            do { target = Math.floor(Math.random() * cells.length); } while (target === previous);
            targetHit = false;
            cells.forEach((cell, index) => {
                const active = index === target;
                cell.classList.toggle("active", active);
                cell.setAttribute("aria-label", active ? `Whack target ${index + 1}` : `Empty tile ${index + 1}`);
            });
        };
        $("whack-score").textContent = "0";
        $("whack-streak").textContent = "0×";
        $("whack-time").textContent = `${time}s`;
        $("whack-status").textContent = "Hit the glowing target. Misses break your streak.";
        moveTarget();
        window.whackTargetTimer = setInterval(moveTarget, settings[level].speed);
        window.whackTimer = setInterval(() => {
            time--;
            $("whack-time").textContent = `${time}s`;
            if (time <= 0) {
                clearInterval(window.whackTimer);
                clearInterval(window.whackTargetTimer);
                cells.forEach(cell => { cell.disabled = true; });
                $("whack-status").textContent = `Time! Best streak: ${bestStreak}. Tap Restart for another round.`;
                recordScore("whack", score, score);
            }
        }, 1000);
    };
    $("whack-restart").addEventListener("click", start);
    stage.querySelectorAll("[data-whack-level]").forEach(button => button.addEventListener("click", () => {
        level = button.dataset.whackLevel;
        stage.querySelectorAll("[data-whack-level]").forEach(item => item.classList.toggle("active", item === button));
        start();
    }));
    start();
}

function buildTrivia(stage) {
    const bank = [
        { category: "Science", q: "Which planet is known as the Red Planet?", a: ["Mars", "Venus", "Neptune"], correct: 0 },
        { category: "Science", q: "What is the chemical symbol for gold?", a: ["Ag", "Au", "Fe"], correct: 1 },
        { category: "Science", q: "Which gas do plants absorb from the air?", a: ["Oxygen", "Carbon dioxide", "Helium"], correct: 1 },
        { category: "Science", q: "How many chambers are in the human heart?", a: ["Two", "Three", "Four"], correct: 2 },
        { category: "Science", q: "What is the closest star to Earth?", a: ["Sirius", "The Sun", "Proxima Centauri"], correct: 1 },
        { category: "Science", q: "Which force keeps planets in orbit?", a: ["Magnetism", "Gravity", "Friction"], correct: 1 },
        { category: "World", q: "Which ocean is the largest?", a: ["Atlantic", "Indian", "Pacific"], correct: 2 },
        { category: "World", q: "What is the capital of Japan?", a: ["Kyoto", "Tokyo", "Osaka"], correct: 1 },
        { category: "World", q: "Which river flows through Egypt?", a: ["Amazon", "Nile", "Danube"], correct: 1 },
        { category: "World", q: "Which continent has the most countries?", a: ["Africa", "Europe", "South America"], correct: 0 },
        { category: "World", q: "The city of Petra is in which country?", a: ["Jordan", "Greece", "Morocco"], correct: 0 },
        { category: "World", q: "What is the currency of the United Kingdom?", a: ["Euro", "Pound sterling", "Franc"], correct: 1 },
        { category: "Culture", q: "Who wrote Frankenstein?", a: ["Mary Shelley", "Jane Austen", "Virginia Woolf"], correct: 0 },
        { category: "Culture", q: "Who painted the Mona Lisa?", a: ["Claude Monet", "Leonardo da Vinci", "Vincent van Gogh"], correct: 1 },
        { category: "Culture", q: "What is the official language of Brazil?", a: ["Spanish", "Portuguese", "French"], correct: 1 },
        { category: "Culture", q: "Which instrument usually has 88 keys?", a: ["Piano", "Harp", "Accordion"], correct: 0 },
        { category: "Culture", q: "In which sport would you perform a slam dunk?", a: ["Tennis", "Basketball", "Volleyball"], correct: 1 },
        { category: "Culture", q: "What is the name of the toy cowboy in Toy Story?", a: ["Buzz", "Woody", "Rex"], correct: 1 }
    ];
    let category = "Mixed";
    let questions = [];
    let index = 0;
    let score = 0;
    let streak = 0;
    let locked = false;
    const startRound = () => {
        const pool = category === "Mixed" ? [...bank] : bank.filter(item => item.category === category);
        for (let position = pool.length - 1; position > 0; position--) {
            const swap = Math.floor(Math.random() * (position + 1));
            [pool[position], pool[swap]] = [pool[swap], pool[position]];
        }
        questions = pool.slice(0, Math.min(10, pool.length));
        index = 0;
        score = 0;
        streak = 0;
        render();
    };
    const render = () => {
        if (index >= questions.length) {
            const percent = Math.round(score / questions.length * 100);
            stage.innerHTML = `<div class="trivia-finish"><span class="trivia-finish-icon">${percent >= 80 ? "🏆" : percent >= 50 ? "⭐" : "🎯"}</span><p class="eyebrow">ROUND COMPLETE</p><h3>${score} / ${questions.length}</h3><p>${percent}% correct · ${category}</p><button type="button" class="game-button" id="trivia-again">Play another round</button></div>`;
            recordScore("trivia", score, score);
            $("trivia-again").addEventListener("click", startRound);
            return;
        }
        locked = false;
        const item = questions[index];
        stage.innerHTML = `<div class="trivia-toolbar"><div class="trivia-categories" role="group" aria-label="Trivia category">${["Mixed", "Science", "World", "Culture"].map(name => `<button type="button" data-trivia-category="${name}" class="${category === name ? "active" : ""}">${name}</button>`).join("")}</div><span class="trivia-progress-label">${index + 1} / ${questions.length}</span></div><div class="trivia-progress"><span style="width:${index / questions.length * 100}%"></span></div><div class="trivia-round-score"><span>Score <b>${score}</b></span><span>Streak <b>${streak}×</b></span></div><span class="trivia-category-tag">${item.category}</span><h3 class="trivia-question">${item.q}</h3><div class="trivia-options"></div><p class="trivia-feedback" aria-live="polite">Choose your answer</p>`;
        stage.querySelectorAll("[data-trivia-category]").forEach(button => button.addEventListener("click", () => {
            category = button.dataset.triviaCategory;
            startRound();
        }));
        const options = stage.querySelector(".trivia-options");
        item.a.forEach((answer, answerIndex) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "trivia-option";
            button.textContent = answer;
            button.addEventListener("click", () => {
                if (locked) return;
                locked = true;
                const correct = answerIndex === item.correct;
                if (correct) { score++; streak++; }
                else streak = 0;
                options.querySelectorAll("button").forEach((option, position) => {
                    option.disabled = true;
                    if (position === item.correct) option.classList.add("correct");
                    else if (position === answerIndex) option.classList.add("incorrect");
                });
                stage.querySelector(".trivia-round-score").innerHTML = `<span>Score <b>${score}</b></span><span>Streak <b>${streak}×</b></span>`;
                stage.querySelector(".trivia-feedback").textContent = correct ? (streak > 1 ? `Correct! ${streak} in a row.` : "Correct!") : `Not quite. The answer is ${item.a[item.correct]}.`;
                const next = document.createElement("button");
                next.type = "button";
                next.className = "game-button trivia-next";
                next.textContent = index === questions.length - 1 ? "See results" : "Next question →";
                next.addEventListener("click", () => { index++; render(); });
                stage.appendChild(next);
            });
            options.appendChild(button);
        });
    };
    startRound();
}


/* =========================================================
   COINS / XP
   ========================================================= */

function addCoins(amount) {

    let gain = Number(amount) || 0;

    if (state.owned.coinBoost) {
        gain *= 2;
    }

    state.coins += gain;
    state.questCoins += gain;

    addXP(
        Math.max(
            1,
            Math.floor(gain / 2)
        )
    );

    checkAchievements();

    save();
    updateUI();

}


function addXP(amount) {

    state.xp += Number(amount) || 0;

    while (state.xp >= 100) {
        state.xp -= 100;
    }

}


function level() {

    return Math.floor(
        state.coins / 100
    ) + 1;

}


/* =========================================================
   GAMES
   ========================================================= */

const games = [

    {
        id: "clicker",
        name: "Mega Clicker",
        icon: "🖱️",
        cat: "arcade",
        desc: "Build a giant coin pile."
    },

    {
        id: "snake",
        name: "Snake",
        icon: "🐍",
        cat: "arcade",
        desc: "Eat apples, grow longer, and avoid the walls and your tail."
    },

    {
        id: "bricks",
        name: "Brick Breaker",
        icon: "🧱",
        cat: "arcade",
        desc: "Clear every brick."
    },

    {
        id: "pong",
        name: "Pong",
        icon: "🏓",
        cat: "arcade",
        desc: "Beat the computer."
    },

    {
        id: "reaction",
        name: "Reaction Test",
        icon: "⚡",
        cat: "arcade",
        desc: "Test your reaction speed."
    },

    {
        id: "memory",
        name: "Memory Match",
        icon: "🧠",
        cat: "puzzle",
        desc: "Find every matching pair."
    },

    {
        id: "2048",
        name: "2048",
        icon: "🔢",
        cat: "puzzle",
        desc: "Drop matching number blocks, merge them, and keep the stack from reaching the top."
    },

    {
        id: "block-blast",
        name: "Block Blast",
        icon: "🧩",
        cat: "puzzle",
        desc: "Fit colorful blocks, clear full rows and columns, and keep the board open."
    },

    {
        id: "number",
        name: "Number Guess",
        icon: "🎯",
        cat: "puzzle",
        desc: "Find the secret number."
    },

    {
        id: "color",
        name: "Color Switch",
        icon: "🎨",
        cat: "puzzle",
        desc: "Pick the correct color."
    },

    {
        id: "stack",
        name: "Stacker",
        icon: "🏗️",
        cat: "arcade",
        desc: "Build the tallest tower."
    },

    {
        id: "target",
        name: "Target Tap",
        icon: "🎯",
        cat: "arcade",
        desc: "Hit targets before time runs out."
    },

    {
        id: "dodge",
        name: "Dodge",
        icon: "💨",
        cat: "action",
        desc: "Survive the falling blocks."
    },

    {
        id: "road",
        name: "Road Rush",
        icon: "🚗",
        cat: "action",
        desc: "Dodge traffic and go farther."
    },

    {
        id: "space",
        name: "Space Defender",
        icon: "🚀",
        cat: "action",
        desc: "Defend your ship."
    },

    {
        id: "coins",
        name: "Coin Catcher",
        icon: "🪙",
        cat: "action",
        desc: "Catch coins, avoid hazards."
    },

    {
        id: "mines",
        name: "Minesweeper",
        icon: "💣",
        cat: "puzzle",
        desc: "Clear the field without clicking a mine."
    },

    {
        id: "sudoku",
        name: "Sudoku",
        icon: "🔢",
        cat: "puzzle",
        desc: "Fill every row, column, and 3×3 box with the numbers 1 to 9."
    },

    {
        id: "typing",
        name: "Speed Type",
        icon: "⌨️",
        cat: "arcade",
        desc: "Type the words quickly."
    },

    {
        id: "math",
        name: "Math Rush",
        icon: "➗",
        cat: "puzzle",
        desc: "Solve quick math questions."
    },
    {
        id: "tictactoe",
        name: "Tic-Tac-Toe",
        icon: "⭕",
        cat: "puzzle",
        desc: "Take on a quick three-in-a-row match."
    },
    {
        id: "whack",
        name: "Whack-a-Spot",
        icon: "🔨",
        cat: "arcade",
        desc: "Tap the lit tile before it moves."
    },
    {
        id: "trivia",
        name: "Quick Trivia",
        icon: "🧩",
        cat: "puzzle",
        desc: "Answer five rapid-fire questions."
    },
    {
        id: "letterlock",
        name: "Letter Lock",
        icon: "🔤",
        cat: "puzzle",
        desc: "Crack the five-letter word in six guesses."
    },
    {
        id: "simon",
        name: "Simon Says",
        icon: "🎛️",
        cat: "arcade",
        desc: "Repeat a growing sequence of color signals."
    },
    {
        id: "lightsout",
        name: "Lights Out",
        icon: "💡",
        cat: "puzzle",
        desc: "Switch off every light with the fewest moves."
    },
    {
        id: "tetris",
        name: "Tetris",
        icon: "🧱",
        cat: "arcade",
        desc: "Clear lines, chain combos, and beat your high score."
    },
    {
        id: "sand-tetris",
        name: "Sand Tetris",
        icon: "🏖️",
        iconImage: "images/tetrissang.png",
        cat: "arcade",
        desc: "Drop colorful pixel pieces, then watch thousands of grains tumble and clear lines."
    }

];

const gameGuides = {
    clicker: { goal: "Grow your coin stash, then reinvest in stronger taps and passive income.", controls: "Tap the coin · spend coins on upgrades" },
    snake: { goal: "Eat apples to grow longer and faster. Avoid the walls and your tail.", controls: "Swipe the board · use the D-pad or arrow keys · press P to pause" },
    bricks: { goal: "Break every brick before the ball slips past your paddle.", controls: "Drag or touch the paddle to move it" },
    pong: { goal: "Keep the ball in play and return it past the phone’s paddle.", controls: "Drag or touch to move your paddle" },
    reaction: { goal: "Wait for the signal, then react as quickly as you can.", controls: "Tap the screen when it turns green" },
    memory: { goal: "Find all eight matching pairs in as few turns as possible.", controls: "Tap two cards to reveal a pair" },
    "2048": { goal: "Drop matching number blocks to merge them and keep the stack below the top.", controls: "Drag the block to aim and release to drop. Use the arrow buttons or keyboard to aim, then tap Drop." },
    "block-blast": { goal: "Place all three blocks, clear full rows and columns, and keep going until no piece fits.", controls: "Drag a piece onto the board, or tap a piece and then a board cell. Add a picture to use it on your blocks." },
    number: { goal: "Crack the secret number using the fewest guesses.", controls: "Enter a guess with the number pad" },
    color: { goal: "Match the color prompt before the round changes.", controls: "Tap the matching color" },
    stack: { goal: "Drop each moving block neatly to build the tallest tower.", controls: "Tap or press Space to drop a block" },
    target: { goal: "Hit as many moving targets as you can before time runs out.", controls: "Tap each target" },
    dodge: { goal: "Keep moving to survive the falling blocks and chase a new best.", controls: "Use the left/right controls or arrow keys" },
    road: { goal: "Weave through traffic and see how far your run can go.", controls: "Steer with the on-screen controls or arrow keys" },
    space: { goal: "Clear incoming waves and protect your ship from the invaders.", controls: "Move and fire with the on-screen controls" },
    coins: { goal: "Catch falling coins and dodge hazards for a bigger score.", controls: "Move with the on-screen controls or arrow keys" },
    mines: { goal: "Reveal every safe square without triggering a mine.", controls: "Tap to reveal · use Flag mode or right-click to mark a mine" },
    sudoku: { goal: "Fill every row, column, and 3×3 box with the numbers 1 to 9.", controls: "Select an empty square, then tap a number · use Hint if you get stuck" },
    typing: { goal: "Type each word accurately before the countdown ends.", controls: "Type the highlighted word, then press Enter" },
    math: { goal: "Solve as many quick-fire math questions as you can.", controls: "Enter your answer or tap a choice" },
    tictactoe: { goal: "Get three marks in a row before the phone’s opponent.", controls: "Tap a square · choose your opponent level" },
    whack: { goal: "Hit the glowing spots before they disappear.", controls: "Tap the lit spot · choose a round speed" },
    trivia: { goal: "Answer five quick questions and beat your best score.", controls: "Tap an answer · pick a trivia category" },
    letterlock: { goal: "Find the hidden five-letter word in six guesses. Green is right, gold is misplaced.", controls: "Type or tap letters · submit each guess" },
    simon: { goal: "Repeat the color sequence as it grows one signal at a time.", controls: "Watch the pattern · tap the same colors in order" },
    lightsout: { goal: "Turn off every light. Each move also flips its neighboring lights.", controls: "Tap a tile · reset for a fresh solvable board" },
    tetris: { goal: "Complete horizontal lines to score and level up before the stack reaches the top.", controls: "← → move · ↑ rotate · ↓ soft drop · Space hard drop · P pause" },
    "sand-tetris": { goal: "Drop colorful pieces and connect matching sand from the left edge to the right edge to clear it.", controls: "← → move · ↑ rotate · ↓ soft drop · Space hard drop · P pause" }
};

const standaloneGames = [
    { id: "ap-world-empire-quest", name: "AP World: Empire Quest", icon: "🌍", path: "games/AP_World_Unit3_Study_Quest/index.html" },
    { id: "little-bean-cafe", name: "Little Bean Café", icon: "☕", path: "games/Little_Bean_Cafe_3D/index.html" },
    { id: "apex-racing-3d", name: "Apex Racing 3D", icon: "🏎️", iconImage: "images/racelogo.png", path: "games/apex_latest%207/index.html" },
    { id: "chess-arena-3d", name: "Chess Arena 3D", icon: "♟️", path: "games/chess/index.html" },
    { id: "black-jack", name: "Black Jack", icon: "🃏", path: "games/game/index.html" },
    {
        id: "game-v2",
        name: "Game V2",
        icon: "🪙",
        path: "games/gamev2-main/project/index.html",
        subtitle: "Coin Collector · platform adventure",
        description: "Jump across six colorful worlds, collect coins and stars, and dodge bouncing DVD logos."
    }
];


/* =========================================================
   NAVIGATION
   ========================================================= */

let activeGameId = null;

function openView(name) {

    if (name !== "external-game") {
        const frame = $("external-game-frame");
        if (frame) frame.src = "about:blank";
        $("external-game")?.classList.remove("external-game-fullscreen");
    }

    document
        .querySelectorAll(".view")
        .forEach(view => {
            view.classList.remove("active");
        });

    const target = $(name);

    if (target) {
        target.classList.add("active");
    }
    const fullscreenExternalGame = name === "external-game" && $("external-game")?.classList.contains("external-game-fullscreen");
    const phone = document.querySelector(".phone");
    phone?.classList.toggle("external-game-open", Boolean(fullscreenExternalGame));
    phone?.classList.toggle("game-session-open", name === "game");

    if (name !== "game") {
        activeGameId = null;
        clearGameTimers();
        $("games")?.classList.remove("playing-game");
        $("game-stage")?.replaceChildren();
        if ($("game-title")) $("game-title").textContent = "Choose a game";
        if ($("game-icon")) {
            $("game-icon").classList.remove("game-icon-image");
            $("game-icon").replaceChildren(document.createTextNode("🎮"));
        }
        if ($("game-session-tools")) $("game-session-tools").hidden = true;
        if ($("game-session-guide")) $("game-session-guide").hidden = true;
        if (window.gameAnimationFrame) {
            cancelAnimationFrame(window.gameAnimationFrame);
            window.gameAnimationFrame = null;
        }
    }

    updateUI();

}


function home() {

    openView("home");

}


document.addEventListener(
    "click",
    event => {

        const openButton =
            event.target.closest("[data-open]");

        const gameApp = event.target.closest("[data-game-app]");
        const standaloneGameApp = event.target.closest("[data-standalone-game]");

        if (standaloneGameApp) {
            openStandaloneGame(standaloneGameApp.dataset.standaloneGame);
            return;
        }

        if (gameApp) {
            startGame(gameApp.dataset.gameApp);
            return;
        }

        if (openButton) {

            openView(
                openButton.dataset.open
            );

            return;

        }


        if (
            event.target.closest("[data-home]")
        ) {

            home();

            return;

        }


        const filter =
            event.target.closest("[data-filter]");

        if (filter) {

            document
                .querySelectorAll(".filter")
                .forEach(button => {

                    button.classList.remove(
                        "active"
                    );

                });

            filter.classList.add("active");

            renderGames(
                filter.dataset.filter
            );

            return;

        }


        const note =
            event.target.closest("[data-note]");

        if (note) {

            noteAction(
                note.dataset.note
            );

            return;

        }


        const calc =
            event.target.closest("[data-calc]");

        if (calc) {

            calcAction(
                calc.dataset.calc
            );

            return;

        }


        const preset =
            event.target.closest("[data-seconds]");

        if (preset) {

            setTimer(
                Number(
                    preset.dataset.seconds
                )
            );

            return;

        }


        const musicFilter =
            event.target.closest(
                "[data-music-filter]"
            );

        if (musicFilter) {

            document
                .querySelectorAll(
                    "[data-music-filter]"
                )
                .forEach(button => {

                    button.classList.remove(
                        "active"
                    );

                });

            musicFilter.classList.add(
                "active"
            );

            musicFilterMode =
                musicFilter.dataset.musicFilter;

            renderPlaylist();

        }

    }
);


/* =========================================================
   CLOCK
   ========================================================= */

function updateClock() {

    const date = new Date();

    const time =
        date.toLocaleTimeString(
            [],
            {
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit"
            }
        );

    if ($("status-time")) {

        $("status-time").textContent =
            new Intl.DateTimeFormat([], {
                hour: "numeric",
                minute: "2-digit"
            }).formatToParts(date)
                .filter(part => part.type !== "dayPeriod")
                .map(part => part.value)
                .join("")
                .trim();

    }

    if ($("clock-time")) {

        $("clock-time").textContent =
            time;

    }

    if ($("big-clock")) {

        $("big-clock").textContent =
            time;

    }

    if ($("home-date")) {

        $("home-date").textContent =
            date
                .toLocaleDateString(
                    [],
                    {
                        weekday: "long",
                        month: "long",
                        day: "numeric"
                    }
                )
                .toUpperCase();

    }

    if ($("home-greeting")) {
        const hour = date.getHours();
        $("home-greeting").textContent = hour < 12
            ? "Good morning"
            : hour < 18
                ? "Good afternoon"
                : "Good evening";
    }

    if ($("clock-date")) {

        $("clock-date").textContent =
            date.toLocaleDateString(
                [],
                {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                }
            );

    }

}


setInterval(
    updateClock,
    1000
);

updateClock();


/* =========================================================
   GAME LIST
   ========================================================= */

function updateGameCenterStats() {
    const recordCount = games.filter(game => Number(state.highScores[game.id]) > 0).length;
    const topScore = Math.max(0, ...Object.values(state.highScores).map(Number).filter(Number.isFinite));
    if ($("game-total-count")) $("game-total-count").textContent = games.length + 1;
    if ($("game-record-count")) $("game-record-count").textContent = recordCount;
    if ($("game-top-score")) $("game-top-score").textContent = topScore;
}

function renderGames(filter = "all") {

    const list = $("game-list");

    if (!list) return;

    list.innerHTML = "";
    const dayIndex = Math.floor(Date.now() / 86400000) % games.length;
    const featuredGame = games[dayIndex];
    if ($("game-daily-name")) $("game-daily-name").textContent = featuredGame.name;
    if ($("game-daily-desc")) $("game-daily-desc").textContent = featuredGame.desc;
    if ($("game-daily-play")) $("game-daily-play").onclick = () => startGame(featuredGame.id);
    updateGameCenterStats();

    const matchingGames = games
        .filter(game => {
            const query = $("game-search")?.value.trim().toLowerCase();
            return (
                filter === "all" ||
                game.cat === filter
            ) && (!query || game.name.toLowerCase().includes(query) || game.desc.toLowerCase().includes(query));

        });

    const gameV2 = standaloneGames.find(game => game.id === "game-v2");
    const searchQuery = $("game-search")?.value.trim().toLowerCase() || "";
    const showGameV2 = gameV2 &&
        (filter === "all" || filter === "arcade") &&
        (!searchQuery || `${gameV2.name} ${gameV2.subtitle} ${gameV2.description}`.toLowerCase().includes(searchQuery));

    if (!matchingGames.length && !showGameV2) {
        const empty = document.createElement("div");
        empty.className = "game-empty";
        empty.textContent = "No games match that search. Try another title or category.";
        list.appendChild(empty);
    }

    matchingGames.forEach(game => {

            const best =
                state.highScores[game.id] || 0;

            const card =
                document.createElement("div");

            card.className = "game-card";

            const icon = state.gameIcons[game.id];
            const installed = state.installedGames.includes(game.id);
            const iconImage = icon || game.iconImage;
            card.innerHTML = `

                <div class="game-icon downloaded-app-icon${iconImage ? " has-app-image" : ""}" data-game-theme="${game.id}" style="--downloaded-app-hue:${downloadedAppHue(game.id)}">${iconImage ? `<img src="${iconImage}" alt="${game.name} icon">` : game.icon}</div>

                <div class="game-info">

                    <h3>${game.name}</h3>

                    <p>${game.desc}</p>

                    <div class="game-card-meta">
                        <span class="game-category">${game.cat}</span>
                        <span class="best">${best ? `PERSONAL BEST ${best}` : "NO RECORD YET"}</span>
                    </div>

                </div>

                <div class="game-card-controls">
                    <button class="play" data-play="${game.id}">PLAY</button>
                    <a class="game-new-tab" href="${gameNewTabUrl(game.id)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${game.name} in a new tab" title="Open in a new tab">↗</a>
                    <button type="button" class="game-install" data-game-install="${game.id}" aria-pressed="${installed}">${installed ? "Remove" : "Install"}</button>
                    <label class="game-icon-upload" title="Choose a profile picture for ${game.name}">Set icon<input type="file" accept="image/*" data-game-icon="${game.id}" hidden></label>
                </div>

            `;

            list.appendChild(card);

        });

    if (showGameV2) {
        const installed = state.installedApps.includes(`external:${gameV2.id}`);
        const card = document.createElement("article");
        card.className = "game-card";
        card.innerHTML = `
            <div class="game-icon downloaded-app-icon" data-game-theme="${gameV2.id}" style="--downloaded-app-hue:${downloadedAppHue(gameV2.id)}">${gameV2.icon}</div>
            <div class="game-info">
                <h3>${gameV2.name}</h3>
                <p>${gameV2.subtitle}</p>
                <div class="game-card-meta">
                    <span class="game-category">platform adventure</span>
                    <span class="best">6 WORLDS</span>
                </div>
            </div>
            <div class="game-card-controls">
                <button class="play" type="button" data-standalone-play="${gameV2.id}">PLAY</button>
                <a class="game-new-tab" href="${new URL(gameV2.path, location.href).href}" target="_blank" rel="noopener noreferrer" aria-label="Open ${gameV2.name} in a new tab" title="Open in a new tab">↗</a>
                <button type="button" class="game-install" data-standalone-install="${gameV2.id}" aria-pressed="${installed}">${installed ? "Remove" : "Install"}</button>
            </div>`;
        list.appendChild(card);
    }

    list.querySelectorAll("[data-standalone-play]").forEach(button => {
        button.addEventListener("click", () => openStandaloneGame(button.dataset.standalonePlay));
    });

    list.querySelectorAll("[data-standalone-install]").forEach(button => {
        button.addEventListener("click", () => {
            const appId = `external:${button.dataset.standaloneInstall}`;
            const index = state.installedApps.indexOf(appId);
            if (index >= 0) state.installedApps.splice(index, 1);
            else state.installedApps.push(appId);
            save();
            renderStandaloneGameApps();
            renderGames(filter);
            toast(index >= 0 ? "Game removed from your home screen" : "Game added to your home screen");
        });
    });

    list
        .querySelectorAll("[data-play]")
        .forEach(button => {

            button.onclick = () => {

                startGame(
                    button.dataset.play
                );

            };

        });

    list.querySelectorAll("[data-game-install]").forEach(button => {
        button.addEventListener("click", () => {
            const id = button.dataset.gameInstall;
            const index = state.installedGames.indexOf(id);
            if (index >= 0) state.installedGames.splice(index, 1);
            else state.installedGames.push(id);
            save();
            renderGameApps();
            renderGames(filter);
            toast(index >= 0 ? "Game removed from your home screen" : "Game added to your home screen");
        });
    });

    list.querySelectorAll("[data-game-icon]").forEach(input => {
        input.addEventListener("change", async () => {
            const file = input.files?.[0];
            if (!file?.type.startsWith("image/")) return;
            try {
                const icon = await resizeGameIcon(file);
                state.gameIcons[input.dataset.gameIcon] = icon;
                save();
                renderGames(filter);
                renderGameApps();
                toast("Game profile picture updated");
            } catch {
                toast("Couldn’t use that image");
            }
        });
    });

}

function renderGameApps() {
    const grid = $("home-app-grid");
    if (!grid) return;
    grid.querySelectorAll("[data-game-app]").forEach(tile => tile.remove());
    state.installedGames.forEach(id => {
        const game = games.find(item => item.id === id);
        if (!game) return;
        const tile = document.createElement("button");
        tile.type = "button";
        tile.className = "app-tile ios-app-tile";
        tile.dataset.gameApp = game.id;
        tile.dataset.name = game.name.toLowerCase();
        const icon = document.createElement("span");
        const image = state.gameIcons[game.id] || game.iconImage;
        icon.className = `app-icon ios-icon game-home-icon downloaded-app-icon${image ? " has-app-image" : ""}`;
        icon.dataset.gameTheme = game.id;
        icon.style.setProperty("--downloaded-app-hue", downloadedAppHue(game.id));
        if (image) {
            const img = document.createElement("img");
            img.src = image;
            img.alt = "";
            icon.appendChild(img);
        } else {
            icon.textContent = game.icon;
        }
        const name = document.createElement("b");
        name.textContent = game.name;
        tile.append(icon, name);
        grid.appendChild(tile);
    });
    updateHomePageDots();
}

function downloadedAppHue(id) {
    const appIds = [...games.map(game => game.id), ...standaloneGames.map(game => game.id)];
    const index = Math.max(0, appIds.indexOf(id));
    return Math.round(index * 137.508) % 360;
}

function renderStandaloneGameApps() {
    const grid = $("home-app-grid");
    if (!grid) return;
    grid.querySelectorAll("[data-standalone-game]").forEach(tile => tile.remove());
    standaloneGames.forEach(game => {
        if (!state.installedApps.includes(`external:${game.id}`)) return;
        const tile = document.createElement("button");
        tile.type = "button";
        tile.className = "app-tile ios-app-tile";
        tile.dataset.standaloneGame = game.id;
        tile.dataset.name = game.name.toLowerCase();
        const icon = document.createElement("span");
        icon.className = `app-icon ios-icon game-home-icon downloaded-app-icon${game.iconImage ? " has-app-image" : ""}`;
        icon.dataset.gameTheme = game.id;
        icon.style.setProperty("--downloaded-app-hue", downloadedAppHue(game.id));
        if (game.iconImage) {
            const image = document.createElement("img");
            image.src = game.iconImage;
            image.alt = "";
            icon.appendChild(image);
        } else {
            icon.textContent = game.icon;
        }
        const name = document.createElement("b");
        name.textContent = game.name;
        tile.append(icon, name);
        grid.appendChild(tile);
    });
    updateHomePageDots();
}

function updateHomePageDots() {
    const grid = $("home-app-grid");
    const dots = document.querySelector(".home-page-dots");
    if (!grid || !dots) return;

    const pageCount = Math.max(1, Math.ceil((grid.scrollWidth - 1) / grid.clientWidth));
    const activePage = Math.min(pageCount - 1, Math.round(grid.scrollLeft / grid.clientWidth));
    dots.replaceChildren();
    for (let page = 0; page < pageCount; page++) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.classList.toggle("active", page === activePage);
        dot.setAttribute("aria-label", `Home screen page ${page + 1}`);
        dot.setAttribute("aria-current", page === activePage ? "page" : "false");
        dot.addEventListener("click", () => grid.scrollTo({ left: page * grid.clientWidth, behavior: "smooth" }));
        dots.appendChild(dot);
    }

    if (!grid.dataset.pageDotsReady) {
        grid.scrollLeft = 0;
        grid.addEventListener("scroll", updateHomePageDots, { passive: true });
        window.addEventListener("resize", updateHomePageDots);
        grid.dataset.pageDotsReady = "true";
    }
}

function openStandaloneGame(id) {
    const game = standaloneGames.find(item => item.id === id);
    const frame = $("external-game-frame");
    const title = $("external-game-title");
    if (!game || !frame || !title) return;
    setExternalGameFullscreen(id === "game-v2");
    title.textContent = game.name;
    frame.title = game.name;
    frame.src = game.path;
    const newTab = $("external-game-new-tab");
    if (newTab) {
        newTab.href = new URL(game.path, location.href).href;
        newTab.setAttribute("aria-label", `Open ${game.name} in a new tab`);
    }
    openView("external-game");
}

function setExternalGameFullscreen(isFullscreen) {
    const panel = $("external-game");
    panel?.classList.toggle("external-game-fullscreen", isFullscreen);
    const isOpen = panel?.classList.contains("active") || false;
    document.querySelector(".phone")?.classList.toggle("external-game-open", isOpen && isFullscreen);
    const button = $("external-game-fullscreen");
    if (button) {
        button.textContent = isFullscreen ? "⛶ Exit" : "⛶ Fullscreen";
        button.setAttribute("aria-label", isFullscreen ? "Exit fullscreen" : "Enter fullscreen");
        button.setAttribute("aria-pressed", String(isFullscreen));
    }
}

document.getElementById("external-game-fullscreen")?.addEventListener("click", () => {
    const isFullscreen = $("external-game")?.classList.contains("external-game-fullscreen") || false;
    setExternalGameFullscreen(!isFullscreen);
});

function gameNewTabUrl(id) {
    const builtInGame = games.find(game => game.id === id);
    const standaloneGame = standaloneGames.find(game => game.id === id);
    if (!builtInGame && !standaloneGame) return "#";

    const url = builtInGame
        ? new URL(location.href)
        : new URL(standaloneGame.path, location.href);
    if (builtInGame) url.searchParams.set("playGame", builtInGame.id);
    return url.href;
}

function resizeGameIcon(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
            const image = new Image();
            image.onerror = reject;
            image.onload = () => {
                const scale = Math.min(1, 512 / Math.max(image.width, image.height));
                const canvas = document.createElement("canvas");
                canvas.width = Math.max(1, Math.round(image.width * scale));
                canvas.height = Math.max(1, Math.round(image.height * scale));
                canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL("image/jpeg", 0.8));
            };
            image.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}


/* =========================================================
   SCORE
   ========================================================= */

function recordScore(
    id,
    score,
    reward = Math.max(
        1,
        Math.floor(score / 10)
    )
) {

    if (
        score >
        (
            state.highScores[id] || 0
        )
    ) {

        state.highScores[id] = score;

        toast("🏆 New high score!");

    }

    if (reward > 0) {
        addCoins(reward);
    } else {
        updateUI();
    }

    save();
    updateGameCenterStats();
    if (id === activeGameId && $("game-session-best")) {
        $("game-session-best").textContent = `PERSONAL BEST ${state.highScores[id] || 0}`;
    }

}


/* =========================================================
   GAME START
   ========================================================= */

function startGame(id) {

    const game =
        games.find(
            item => item.id === id
        );

    if (!game) return;

    clearGameTimers();

    openView("game");
    $("games")?.classList.add("playing-game");
    document.querySelector(".phone")?.classList.add("game-session-open");

    $("game-title").textContent =
        game.name;

    const gameIcon = $("game-icon");
    const gameLogo = state.gameIcons[id] || game.iconImage;
    gameIcon.replaceChildren();
    if (gameLogo) {
        const image = document.createElement("img");
        image.src = gameLogo;
        image.alt = "";
        gameIcon.appendChild(image);
        gameIcon.classList.add("game-icon-image");
    } else {
        gameIcon.classList.remove("game-icon-image");
        gameIcon.textContent = game.icon;
    }
    gameIcon.dataset.gameTheme = game.id;

    const stage =
        $("game-stage");

    if (!stage) return;

    activeGameId = id;
    stage.dataset.gameId = id;
    const guide = gameGuides[id];
    if ($("game-session-meta")) $("game-session-meta").textContent = `${game.cat.toUpperCase()} · GAME CENTER`;
    if ($("game-session-goal")) $("game-session-goal").textContent = `GOAL  ${guide?.goal || game.desc}`;
    if ($("game-session-controls")) $("game-session-controls").textContent = `HOW TO PLAY  ${guide?.controls || "Follow the on-screen prompts."}`;
    if ($("game-session-best")) $("game-session-best").textContent = `PERSONAL BEST ${state.highScores[id] || 0}`;
    if ($("game-session-tools")) $("game-session-tools").hidden = false;
    if ($("game-session-guide")) $("game-session-guide").hidden = false;
    const newTab = $("game-open-new-tab");
    if (newTab) newTab.href = gameNewTabUrl(id);

    stage.innerHTML = "";

    const builders = {

        clicker: buildClicker,
        snake: buildSnake,
        bricks: buildBricks,
        pong: buildPong,
        reaction: buildReaction,
        memory: buildMemory,
        "2048": build2048,
        "block-blast": buildBlockBlast,
        sudoku: buildSudoku,
        number: buildNumber,
        color: buildColor,
        stack: buildStack,
        target: buildTarget,
        dodge: buildDodge,
        road: buildRoad,
        space: buildSpace,
        coins: buildCoins,
        mines: buildMines,
        typing: buildTyping,
        math: buildMath,
        tictactoe: buildTicTacToe,
        whack: buildWhack,
        trivia: buildTrivia,
        letterlock: buildLetterLock,
        simon: buildSimon,
        lightsout: buildLightsOut,
        tetris: buildTetris,
        "sand-tetris": buildSandTetris

    };

    if (builders[id]) {
        builders[id](stage);
    }

    stage.scrollIntoView({ behavior: "smooth", block: "nearest" });

}

document.getElementById("game-restart")?.addEventListener("click", () => {
    if (activeGameId) startGame(activeGameId);
});

document.getElementById("game-fullscreen")?.addEventListener("click", async () => {
    const phone = document.getElementById("phone");
    if (!phone) return;

    try {
        if (document.fullscreenElement) {
            await document.exitFullscreen();
        } else if (phone.requestFullscreen) {
            await phone.requestFullscreen();
        } else {
            toast("Fullscreen isn’t available in this browser.");
        }
    } catch (error) {
        console.error("Could not change fullscreen mode:", error);
        toast("Couldn’t change fullscreen mode. Check your browser permissions.");
    }
});

document.addEventListener("fullscreenchange", () => {
    const button = document.getElementById("game-fullscreen");
    if (!button) return;
    const isFullscreen = document.fullscreenElement === document.getElementById("phone");
    button.textContent = isFullscreen ? "⛶ Exit fullscreen" : "⛶ Fullscreen";
    button.setAttribute("aria-pressed", String(isFullscreen));
});


function clearGameTimers() {

    const timers = [
        "clickerAuto",
        "snakeTimer",
        "brickTimer",
        "pongTimer",
        "reactionTimer",
        "memoryTimer",
        "numberTimer",
        "colorTimer",
        "targetTimer",
        "dodgeTimer",
        "roadTimer",
        "spaceTimer",
        "catchTimer",
        "stackTimer",
        "mineTimer",
        "typingTimer",
        "mathTimer",
        "tictactoeTimer",
        "whackTimer",
        "whackTargetTimer",
        "simonTimer",
        "tetrisTimer",
        "sandTetrisTimer",
        "fall2048Timer"
    ];

    timers.forEach(timerName => {

        if (window[timerName]) {

            clearInterval(
                window[timerName]
            );

            window[timerName] = null;

        }

    });

}

function buildLetterLock(stage) {
    stage.innerHTML = `
        <div class="game-score">Guesses <span id="letterlock-count">0</span> / 6</div>
        <p class="game-message" id="letterlock-status" aria-live="polite">Guess any five-letter word.</p>
        <div class="letterlock-board" id="letterlock-board" aria-label="Word guess board"></div>
        <div class="letterlock-keyboard" id="letterlock-keyboard" aria-label="On-screen keyboard"></div>
        <button class="game-button" id="letterlock-new" type="button">New word</button>
    `;

    const keyboard = stage.querySelector("#letterlock-keyboard");
    ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"].forEach((row, rowIndex) => {
        const rowElement = document.createElement("div");
        rowElement.className = "letterlock-key-row";
        if (rowIndex === 2) {
            rowElement.appendChild(createLetterLockKey("Enter", "enter"));
        }
        for (const letter of row) rowElement.appendChild(createLetterLockKey(letter, letter));
        if (rowIndex === 2) rowElement.appendChild(createLetterLockKey("⌫", "backspace"));
        keyboard.appendChild(rowElement);
    });

    keyboard.addEventListener("click", event => {
        const key = event.target.closest("[data-letterlock-key]");
        if (key) handleLetterLockKey(key.dataset.letterlockKey);
    });
    stage.querySelector("#letterlock-new").addEventListener("click", () => startLetterLock());
    startLetterLock();
}

function createLetterLockKey(label, value) {
    const key = document.createElement("button");
    key.type = "button";
    key.className = "letterlock-key";
    key.dataset.letterlockKey = value;
    key.textContent = label;
    key.setAttribute("aria-label", value === "backspace" ? "Delete letter" : label);
    return key;
}

function startLetterLock() {
    const words = ["apple", "beach", "brain", "bread", "candy", "chair", "chess", "cloud", "dance", "dream", "earth", "flame", "fruit", "grape", "green", "house", "light", "magic", "music", "night", "ocean", "peace", "phone", "plant", "queen", "smile", "space", "train", "water", "world"];
    window.letterLockState = {
        answer: words[Math.floor(Math.random() * words.length)],
        guesses: [],
        current: "",
        finished: false,
        keyboard: {}
    };
    renderLetterLock();
    const status = document.getElementById("letterlock-status");
    if (status) status.textContent = "Guess any five-letter word.";
}

function renderLetterLock() {
    const state = window.letterLockState;
    const board = document.getElementById("letterlock-board");
    const keyboard = document.getElementById("letterlock-keyboard");
    if (!state || !board || !keyboard) return;

    board.replaceChildren();
    for (let row = 0; row < 6; row++) {
        const guess = state.guesses[row];
        const letters = guess || (row === state.guesses.length ? state.current : "");
        const marks = [];
        if (guess) {
            const remaining = {};
            for (let column = 0; column < 5; column++) {
                if (guess[column] === state.answer[column]) {
                    marks[column] = "correct";
                } else {
                    remaining[state.answer[column]] = (remaining[state.answer[column]] || 0) + 1;
                }
            }
            for (let column = 0; column < 5; column++) {
                if (marks[column] === "correct") continue;
                if (remaining[guess[column]]) {
                    marks[column] = "present";
                    remaining[guess[column]]--;
                } else {
                    marks[column] = "absent";
                }
            }
        }
        const rowElement = document.createElement("div");
        rowElement.className = "letterlock-row";
        for (let column = 0; column < 5; column++) {
            const cell = document.createElement("span");
            cell.className = "letterlock-cell";
            cell.textContent = letters[column] || "";
            if (guess) {
                const mark = marks[column];
                cell.classList.add(mark);
                if (mark === "correct") {
                    state.keyboard[guess[column]] = "correct";
                } else if (mark === "present") {
                    if (state.keyboard[guess[column]] !== "correct") state.keyboard[guess[column]] = "present";
                } else {
                    if (!state.keyboard[guess[column]]) state.keyboard[guess[column]] = "absent";
                }
            } else if (letters[column]) {
                cell.classList.add("filled");
            }
            rowElement.appendChild(cell);
        }
        board.appendChild(rowElement);
    }

    keyboard.querySelectorAll("[data-letterlock-key]").forEach(key => {
        key.classList.remove("correct", "present", "absent");
        const status = state.keyboard[key.dataset.letterlockKey];
        if (status) key.classList.add(status);
    });
    const count = document.getElementById("letterlock-count");
    if (count) count.textContent = state.guesses.length;
}

function handleLetterLockKey(key) {
    const state = window.letterLockState;
    if (!state || state.finished) return;
    if (key === "backspace") {
        state.current = state.current.slice(0, -1);
    } else if (key === "enter") {
        if (state.current.length !== 5) {
            document.getElementById("letterlock-status").textContent = "Add five letters before you submit.";
            return;
        }
        const guess = state.current;
        state.guesses.push(guess);
        state.current = "";
        const won = guess === state.answer;
        const lost = !won && state.guesses.length === 6;
        renderLetterLock();
        const status = document.getElementById("letterlock-status");
        if (won) {
            state.finished = true;
            status.textContent = `Cracked in ${state.guesses.length} ${state.guesses.length === 1 ? "guess" : "guesses"}!`;
            const score = 7 - state.guesses.length;
            recordScore("letterlock", score, score);
            return;
        }
        if (lost) {
            state.finished = true;
            status.textContent = `Out of guesses. The word was ${state.answer.toUpperCase()}.`;
            return;
        }
        status.textContent = "Not quite. Green is right, gold is in the word.";
        return;
    } else if (/^[a-z]$/i.test(key) && state.current.length < 5) {
        state.current += key.toLowerCase();
    }
    renderLetterLock();
}

document.addEventListener("keydown", event => {
    if (activeGameId !== "letterlock") return;
    if (event.key === "Enter" || event.key === "Backspace" || /^[a-z]$/i.test(event.key)) {
        event.preventDefault();
        handleLetterLockKey(event.key === "Backspace" ? "backspace" : event.key === "Enter" ? "enter" : event.key);
    }
});

function buildSimon(stage) {
    stage.innerHTML = `
        <div class="game-score">ROUND <span id="simon-round">0</span></div>
        <p class="game-message" id="simon-status" aria-live="polite">Watch the lights, then repeat them.</p>
        <div class="simon-board" id="simon-board" aria-label="Simon color pads">
            <button type="button" class="simon-pad simon-green" data-simon="0" aria-label="Green"></button>
            <button type="button" class="simon-pad simon-red" data-simon="1" aria-label="Red"></button>
            <button type="button" class="simon-pad simon-yellow" data-simon="2" aria-label="Yellow"></button>
            <button type="button" class="simon-pad simon-blue" data-simon="3" aria-label="Blue"></button>
        </div>
        <button class="game-button" id="simon-start" type="button">Start sequence</button>
    `;

    window.simonState = { sequence: [], round: 0, inputIndex: 0, phase: "ready", ticks: 0 };
    stage.querySelectorAll("[data-simon]").forEach(pad => {
        pad.addEventListener("click", () => playSimonPad(Number(pad.dataset.simon)));
    });
    stage.querySelector("#simon-start").addEventListener("click", startSimonRound);
}

function startSimonRound() {
    const state = window.simonState;
    if (!state || state.phase !== "ready") return;
    state.sequence.push(Math.floor(Math.random() * 4));
    state.inputIndex = 0;
    state.ticks = 0;
    state.phase = "playback";
    document.getElementById("simon-start").disabled = true;
    document.getElementById("simon-status").textContent = "Watch the sequence…";
    window.simonTimer = setInterval(() => {
        const tick = ++state.ticks;
        if (tick % 2 === 1) {
            const padIndex = (tick - 1) / 2;
            document.querySelectorAll(".simon-pad").forEach((pad, index) => {
                pad.classList.toggle("lit", index === state.sequence[padIndex]);
            });
        } else {
            document.querySelectorAll(".simon-pad").forEach(pad => pad.classList.remove("lit"));
            if (tick / 2 >= state.sequence.length) {
                clearInterval(window.simonTimer);
                window.simonTimer = null;
                state.phase = "input";
                document.getElementById("simon-status").textContent = "Your turn — repeat the pattern.";
            }
        }
    }, 420);
}

function playSimonPad(index) {
    const state = window.simonState;
    if (!state || state.phase !== "input") return;
    const pad = document.querySelector(`.simon-pad[data-simon="${index}"]`);
    pad?.classList.add("lit");
    window.setTimeout(() => pad?.classList.remove("lit"), 160);
    if (state.sequence[state.inputIndex] !== index) {
        const score = state.round;
        const failedRound = state.round + 1;
        state.phase = "ready";
        state.round = 0;
        state.sequence = [];
        document.getElementById("simon-round").textContent = "0";
        document.getElementById("simon-status").textContent = `Sequence broken at round ${failedRound}.`;
        document.getElementById("simon-start").textContent = "Play again";
        document.getElementById("simon-start").disabled = false;
        recordScore("simon", score, score * 2);
        return;
    }
    state.inputIndex++;
    if (state.inputIndex === state.sequence.length) {
        state.round++;
        state.phase = "ready";
        document.getElementById("simon-round").textContent = state.round;
        document.getElementById("simon-status").textContent = "Nice! Ready for a longer pattern?";
        document.getElementById("simon-start").textContent = "Next round";
        document.getElementById("simon-start").disabled = false;
        addCoins(2);
    }
}

function buildLightsOut(stage) {
    stage.innerHTML = `
        <div class="game-score">MOVES <span id="lightsout-moves">0</span></div>
        <p class="game-message" id="lightsout-status" aria-live="polite">Turn off all 25 lights.</p>
        <div class="lightsout-board" id="lightsout-board" aria-label="Lights Out puzzle"></div>
        <button class="game-button" id="lightsout-new" type="button">New puzzle</button>
    `;
    stage.querySelector("#lightsout-new").addEventListener("click", startLightsOut);
    stage.querySelector("#lightsout-board").addEventListener("click", event => {
        const cell = event.target.closest("[data-lightsout]");
        if (cell) toggleLightsOut(Number(cell.dataset.lightsout));
    });
    startLightsOut();
}

function startLightsOut() {
    const size = 5;
    window.lightsOutState = { size, moves: 0, solved: false, board: Array(size * size).fill(false) };
    for (let move = 0; move < 14; move++) {
        toggleLightsOut(Math.floor(Math.random() * size * size), false);
    }
    if (!window.lightsOutState.board.some(Boolean)) toggleLightsOut(12, false);
    window.lightsOutState.moves = 0;
    document.getElementById("lightsout-status").textContent = "Turn off all 25 lights.";
    drawLightsOut();
}

function toggleLightsOut(index, countMove = true) {
    const state = window.lightsOutState;
    if (!state || state.solved) return;
    const row = Math.floor(index / state.size);
    const column = index % state.size;
    [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([rowOffset, columnOffset]) => {
        const nextRow = row + rowOffset;
        const nextColumn = column + columnOffset;
        if (nextRow >= 0 && nextRow < state.size && nextColumn >= 0 && nextColumn < state.size) {
            const nextIndex = nextRow * state.size + nextColumn;
            state.board[nextIndex] = !state.board[nextIndex];
        }
    });
    if (countMove) state.moves++;
    drawLightsOut();
    if (countMove && state.board.every(light => !light)) {
        state.solved = true;
        document.getElementById("lightsout-status").textContent = `All clear in ${state.moves} ${state.moves === 1 ? "move" : "moves"}!`;
        const score = Math.max(1, 101 - state.moves);
        recordScore("lightsout", score, Math.ceil(score / 10));
    }
}

function drawLightsOut() {
    const state = window.lightsOutState;
    const board = document.getElementById("lightsout-board");
    if (!state || !board) return;
    board.replaceChildren();
    state.board.forEach((on, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `lightsout-cell${on ? " on" : ""}`;
        button.dataset.lightsout = index;
        button.disabled = state.solved;
        button.setAttribute("aria-label", `Row ${Math.floor(index / state.size) + 1}, column ${index % state.size + 1}, ${on ? "on" : "off"}`);
        board.appendChild(button);
    });
    document.getElementById("lightsout-moves").textContent = state.moves;
}

function buildTetris(stage) {
    stage.innerHTML = `
        <div class="game-score tetris-stats">
            <span>Score <b id="tetris-score">0</b></span>
            <span>Lines <b id="tetris-lines">0</b></span>
            <span>Level <b id="tetris-level">1</b></span>
        </div>
        <div class="tetris-layout">
            <canvas id="tetris-board" class="tetris-board" width="240" height="480" aria-label="Tetris game board"></canvas>
            <aside class="tetris-side">
                <div class="tetris-next-card"><small>NEXT</small><canvas id="tetris-next" width="96" height="96" aria-label="Next Tetris piece"></canvas></div>
                <div class="tetris-best-card"><small>BEST</small><b id="tetris-best">0</b></div>
            </aside>
        </div>
        <p class="game-message" id="tetris-status" aria-live="polite">Complete lines to clear the stack.</p>
        <div class="tetris-controls" aria-label="Tetris controls">
            <button type="button" data-tetris="left" aria-label="Move left">←</button>
            <button type="button" data-tetris="rotate" aria-label="Rotate piece">↻</button>
            <button type="button" data-tetris="down" aria-label="Soft drop">↓</button>
            <button type="button" data-tetris="right" aria-label="Move right">→</button>
            <button type="button" data-tetris="drop" aria-label="Hard drop">⬇ Drop</button>
        </div>
        <button class="game-button" id="tetris-pause" type="button">Pause</button>
    `;
    stage.querySelector(".tetris-controls").addEventListener("click", event => {
        const button = event.target.closest("[data-tetris]");
        if (button) tetrisAction(button.dataset.tetris);
    });
    stage.querySelector("#tetris-pause").addEventListener("click", toggleTetrisPause);
    startTetris();
}

const TETRIS_SHAPES = [
    { color: "#47d7ff", cells: [[0, 1], [1, 1], [2, 1], [3, 1]] },
    { color: "#6285ff", cells: [[0, 0], [0, 1], [1, 1], [2, 1]] },
    { color: "#ff9f43", cells: [[2, 0], [0, 1], [1, 1], [2, 1]] },
    { color: "#bd78ff", cells: [[1, 0], [2, 0], [1, 1], [2, 1]] },
    { color: "#54df91", cells: [[1, 0], [2, 0], [0, 1], [1, 1]] },
    { color: "#ff607d", cells: [[1, 0], [0, 1], [1, 1], [2, 1]] },
    { color: "#ffe064", cells: [[0, 0], [1, 0], [1, 1], [2, 1]] }
];

const SAND_TETRIS_SCALE = 6;
const SAND_TETRIS_COLUMNS = 60;
const SAND_TETRIS_ROWS = 108;
const SAND_TETRIS_PIXEL_SIZE = 4;

function startTetris() {
    clearInterval(window.tetrisTimer);
    const state = window.tetrisState = {
        board: Array.from({ length: 20 }, () => Array(10).fill(null)),
        bag: [],
        current: null,
        next: null,
        score: 0,
        lines: 0,
        level: 1,
        paused: false,
        over: false,
        lastDrop: 0
    };
    state.next = nextTetrisShape();
    spawnTetrisPiece();
    renderTetris();
    if (!state.over) window.tetrisTimer = setInterval(tetrisTick, 50);
}

function nextTetrisShape() {
    const state = window.tetrisState;
    if (!state.bag.length) {
        state.bag = TETRIS_SHAPES.map((_, index) => index).sort(() => Math.random() - .5);
    }
    return TETRIS_SHAPES[state.bag.pop()];
}

function spawnTetrisPiece() {
    const state = window.tetrisState;
    const shape = state.next;
    state.next = nextTetrisShape();
    state.current = {
        cells: shape.cells.map(([x, y]) => [x, y]),
        color: shape.color,
        x: 3,
        y: 0
    };
    if (tetrisCollides(state.current, 0, 0)) endTetris();
}

function tetrisCollides(piece, dx, dy, cells = piece.cells) {
    const board = window.tetrisState.board;
    return cells.some(([x, y]) => {
        const nextX = piece.x + x + dx;
        const nextY = piece.y + y + dy;
        return nextX < 0 || nextX >= 10 || nextY >= 20 || (nextY >= 0 && board[nextY][nextX]);
    });
}

function moveTetris(dx, dy) {
    const state = window.tetrisState;
    if (!state || state.paused || state.over) return false;
    if (tetrisCollides(state.current, dx, dy)) return false;
    state.current.x += dx;
    state.current.y += dy;
    if (dy > 0) state.score += 1;
    renderTetris();
    return true;
}

function rotateTetris() {
    const state = window.tetrisState;
    if (!state || state.paused || state.over) return;
    const rotated = state.current.cells.map(([x, y]) => [2 - y, x]);
    const minX = Math.min(...rotated.map(([x]) => x));
    const minY = Math.min(...rotated.map(([, y]) => y));
    const normalized = rotated.map(([x, y]) => [x - minX, y - minY]);
    for (const kick of [0, -1, 1, -2, 2]) {
        if (!tetrisCollides(state.current, kick, 0, normalized)) {
            state.current.cells = normalized;
            state.current.x += kick;
            renderTetris();
            return;
        }
    }
}

function hardDropTetris() {
    const state = window.tetrisState;
    if (!state || state.paused || state.over) return;
    let distance = 0;
    while (!tetrisCollides(state.current, 0, 1)) {
        state.current.y++;
        distance++;
    }
    state.score += distance * 2;
    lockTetrisPiece();
}

function tetrisAction(action) {
    const state = window.tetrisState;
    if (!state || state.paused || state.over) return;
    if (action === "left") moveTetris(-1, 0);
    else if (action === "right") moveTetris(1, 0);
    else if (action === "down") {
        if (!moveTetris(0, 1)) lockTetrisPiece();
    } else if (action === "rotate") rotateTetris();
    else if (action === "drop") hardDropTetris();
}

function tetrisTick() {
    const state = window.tetrisState;
    if (!state || state.paused || state.over) return;
    state.lastDrop += 50;
    const interval = Math.max(90, 720 - (state.level - 1) * 55);
    if (state.lastDrop >= interval) {
        state.lastDrop = 0;
        if (!moveTetris(0, 1)) lockTetrisPiece();
    }
}

function lockTetrisPiece() {
    const state = window.tetrisState;
    if (!state || state.over) return;
    state.current.cells.forEach(([x, y]) => {
        const boardY = state.current.y + y;
        const boardX = state.current.x + x;
        if (boardY < 0) return endTetris();
        state.board[boardY][boardX] = state.current.color;
    });
    if (state.over) return;

    let cleared = 0;
    for (let row = state.board.length - 1; row >= 0;) {
        if (state.board[row].every(Boolean)) {
            state.board.splice(row, 1);
            state.board.unshift(Array(10).fill(null));
            cleared++;
        } else {
            row--;
        }
    }
    if (cleared) {
        state.lines += cleared;
        state.score += [0, 100, 300, 500, 800][cleared] * state.level;
        state.level = Math.floor(state.lines / 10) + 1;
        const status = document.getElementById("tetris-status");
        if (status) status.textContent = ["", "Single!", "Double!", "Triple!", "Tetris!"][cleared];
    }
    spawnTetrisPiece();
    renderTetris();
}

function endTetris() {
    const state = window.tetrisState;
    if (!state || state.over) return;
    state.over = true;
    clearInterval(window.tetrisTimer);
    window.tetrisTimer = null;
    const status = document.getElementById("tetris-status");
    if (status) status.textContent = `Game over · ${state.lines} lines cleared`;
    recordScore("tetris", state.score, Math.floor(state.score / 100));
    renderTetris();
}

function toggleTetrisPause() {
    const state = window.tetrisState;
    if (!state || state.over) return;
    state.paused = !state.paused;
    const button = document.getElementById("tetris-pause");
    if (button) button.textContent = state.paused ? "Resume" : "Pause";
    const status = document.getElementById("tetris-status");
    if (status) status.textContent = state.paused ? "Game paused" : "Complete lines to clear the stack.";
    renderTetris();
}

function drawTetrisCell(context, x, y, size, color) {
    if (!color) return;
    context.fillStyle = color;
    context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
    context.fillStyle = "rgba(255,255,255,.22)";
    context.fillRect(x * size + 3, y * size + 3, size - 6, 3);
}

function renderTetris() {
    const gameState = window.tetrisState;
    const canvas = document.getElementById("tetris-board");
    const nextCanvas = document.getElementById("tetris-next");
    if (!gameState || !canvas || !nextCanvas) return;

    const context = canvas.getContext("2d");
    context.fillStyle = "#0b1020";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "rgba(255,255,255,.055)";
    for (let x = 0; x <= 10; x++) {
        context.beginPath();
        context.moveTo(x * 24, 0);
        context.lineTo(x * 24, 480);
        context.stroke();
    }
    for (let y = 0; y <= 20; y++) {
        context.beginPath();
        context.moveTo(0, y * 24);
        context.lineTo(240, y * 24);
        context.stroke();
    }
    gameState.board.forEach((row, y) => row.forEach((color, x) => drawTetrisCell(context, x, y, 24, color)));
    if (gameState.current && !gameState.over) {
        gameState.current.cells.forEach(([x, y]) => {
            drawTetrisCell(context, gameState.current.x + x, gameState.current.y + y, 24, gameState.current.color);
        });
    }

    const nextContext = nextCanvas.getContext("2d");
    nextContext.clearRect(0, 0, 96, 96);
    gameState.next.cells.forEach(([x, y]) => drawTetrisCell(nextContext, x + 1, y + 1, 18, gameState.next.color));
    document.getElementById("tetris-score").textContent = gameState.score;
    document.getElementById("tetris-lines").textContent = gameState.lines;
    document.getElementById("tetris-level").textContent = gameState.level;
    document.getElementById("tetris-best").textContent = Math.max(state.highScores.tetris || 0, gameState.score);
}

document.addEventListener("keydown", event => {
    if (activeGameId === "sand-tetris") {
        const action = {
            ArrowLeft: "left",
            ArrowRight: "right",
            ArrowDown: "down",
            ArrowUp: "rotate",
            " ": "drop",
            p: "pause",
            P: "pause"
        }[event.key];
        if (!action) return;
        event.preventDefault();
        if (action === "pause") toggleSandTetrisPause();
        else sandTetrisAction(action);
        return;
    }
    if (activeGameId !== "tetris") return;
    const action = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowDown: "down",
        ArrowUp: "rotate",
        " ": "drop",
        p: "pause",
        P: "pause"
    }[event.key];
    if (!action) return;
    event.preventDefault();
    if (action === "pause") toggleTetrisPause();
    else tetrisAction(action);
});

function buildSandTetris(stage) {
    stage.innerHTML = `
        <div class="game-score tetris-stats">
            <span>Score <b id="sand-tetris-score">0</b></span>
            <span>Links <b id="sand-tetris-lines">0</b></span>
            <span>Level <b id="sand-tetris-level">1</b></span>
        </div>
        <div class="tetris-layout">
            <canvas id="sand-tetris-board" class="tetris-board sand-tetris-board" width="240" height="432" aria-label="Sand Tetris board with individually falling pixel grains"></canvas>
            <aside class="tetris-side">
                <div class="tetris-next-card"><small>NEXT</small><canvas id="sand-tetris-next" width="96" height="96" aria-label="Next sand piece"></canvas></div>
                <div class="tetris-best-card"><small>BEST</small><b id="sand-tetris-best">0</b></div>
            </aside>
        </div>
        <p class="game-message" id="sand-tetris-status" aria-live="polite">Connect one color from the left edge to the right edge.</p>
        <div class="tetris-controls" aria-label="Sand Tetris controls">
            <button type="button" data-sand-tetris="left" aria-label="Move left">←</button>
            <button type="button" data-sand-tetris="rotate" aria-label="Rotate piece">↻</button>
            <button type="button" data-sand-tetris="down" aria-label="Soft drop">↓</button>
            <button type="button" data-sand-tetris="right" aria-label="Move right">→</button>
            <button type="button" data-sand-tetris="drop" aria-label="Hard drop">⬇ Drop</button>
        </div>
        <button class="game-button" id="sand-tetris-pause" type="button">Pause</button>
    `;
    stage.querySelector(".tetris-controls").addEventListener("click", event => {
        const button = event.target.closest("[data-sand-tetris]");
        if (button) sandTetrisAction(button.dataset.sandTetris);
    });
    stage.querySelector("#sand-tetris-pause").addEventListener("click", toggleSandTetrisPause);
    startSandTetris();
}

function startSandTetris() {
    clearInterval(window.sandTetrisTimer);
    const gameState = window.sandTetrisState = {
        board: Array.from({ length: SAND_TETRIS_ROWS }, () => Array(SAND_TETRIS_COLUMNS).fill(null)),
        bag: [],
        current: null,
        next: null,
        score: 0,
        lines: 0,
        level: 1,
        paused: false,
        over: false,
        lastDrop: 0,
        gravityStep: 0
    };
    gameState.next = nextSandTetrisShape();
    spawnSandTetrisPiece();
    renderSandTetris();
    if (!gameState.over) window.sandTetrisTimer = setInterval(sandTetrisTick, 70);
}

function nextSandTetrisShape() {
    const gameState = window.sandTetrisState;
    if (!gameState.bag.length) {
        gameState.bag = TETRIS_SHAPES.map((_, index) => index).sort(() => Math.random() - .5);
    }
    return TETRIS_SHAPES[gameState.bag.pop()];
}

function spawnSandTetrisPiece() {
    const gameState = window.sandTetrisState;
    const shape = gameState.next;
    gameState.next = nextSandTetrisShape();
    gameState.current = {
        cells: shape.cells.map(([x, y]) => [x, y]),
        color: shape.color,
        x: Math.floor(SAND_TETRIS_COLUMNS / SAND_TETRIS_SCALE / 2) - 1,
        y: 0
    };
    if (sandTetrisCollides(gameState.current, 0, 0)) endSandTetris();
}

function sandTetrisCollides(piece, dx, dy, cells = piece.cells) {
    const board = window.sandTetrisState.board;
    return cells.some(([x, y]) => {
        const left = (piece.x + x + dx) * SAND_TETRIS_SCALE;
        const top = (piece.y + y + dy) * SAND_TETRIS_SCALE;
        for (let grainY = 0; grainY < SAND_TETRIS_SCALE; grainY++) {
            for (let grainX = 0; grainX < SAND_TETRIS_SCALE; grainX++) {
                const nextX = left + grainX;
                const nextY = top + grainY;
                if (nextX < 0 || nextX >= SAND_TETRIS_COLUMNS || nextY >= SAND_TETRIS_ROWS ||
                    (nextY >= 0 && board[nextY][nextX])) return true;
            }
        }
        return false;
    });
}

function sandTetrisAction(action) {
    const gameState = window.sandTetrisState;
    if (!gameState || gameState.paused || gameState.over) return;
    if (action === "left") moveSandTetris(-1, 0);
    else if (action === "right") moveSandTetris(1, 0);
    else if (action === "down") {
        if (!moveSandTetris(0, 1)) settleSandTetrisPiece();
    } else if (action === "rotate") rotateSandTetris();
    else if (action === "drop") hardDropSandTetris();
}

function moveSandTetris(dx, dy) {
    const gameState = window.sandTetrisState;
    if (!gameState || gameState.paused || gameState.over || sandTetrisCollides(gameState.current, dx, dy)) return false;
    gameState.current.x += dx;
    gameState.current.y += dy;
    if (dy > 0) gameState.score++;
    renderSandTetris();
    return true;
}

function rotateSandTetris() {
    const gameState = window.sandTetrisState;
    if (!gameState || gameState.paused || gameState.over) return;
    const rotated = gameState.current.cells.map(([x, y]) => [2 - y, x]);
    const minX = Math.min(...rotated.map(([x]) => x));
    const minY = Math.min(...rotated.map(([, y]) => y));
    const cells = rotated.map(([x, y]) => [x - minX, y - minY]);
    for (const kick of [0, -1, 1, -2, 2]) {
        if (!sandTetrisCollides(gameState.current, kick, 0, cells)) {
            gameState.current.cells = cells;
            gameState.current.x += kick;
            renderSandTetris();
            return;
        }
    }
}

function hardDropSandTetris() {
    const gameState = window.sandTetrisState;
    if (!gameState || gameState.paused || gameState.over) return;
    let distance = 0;
    while (!sandTetrisCollides(gameState.current, 0, 1)) {
        gameState.current.y++;
        distance++;
    }
    gameState.score += distance * 2;
    settleSandTetrisPiece();
}

function sandTetrisTick() {
    const gameState = window.sandTetrisState;
    if (!gameState || gameState.paused || gameState.over) return;
    gameState.lastDrop += 70;
    gameState.gravityStep++;
    const interval = Math.max(100, 800 - (gameState.level - 1) * 55);
    if (gameState.lastDrop >= interval) {
        gameState.lastDrop = 0;
        if (!moveSandTetris(0, 1)) settleSandTetrisPiece();
    }
    if (gameState.gravityStep % 2 === 0) {
        const moved = simulateSandPhysics(gameState.board);
        if (moved) {
            checkSandTetrisLines();
            renderSandTetris();
        }
    }
}

function settleSandTetrisPiece() {
    const gameState = window.sandTetrisState;
    if (!gameState || gameState.over) return;
    gameState.current.cells.forEach(([x, y]) => {
        const top = (gameState.current.y + y) * SAND_TETRIS_SCALE;
        const left = (gameState.current.x + x) * SAND_TETRIS_SCALE;
        for (let grainY = 0; grainY < SAND_TETRIS_SCALE; grainY++) {
            for (let grainX = 0; grainX < SAND_TETRIS_SCALE; grainX++) {
                const row = top + grainY;
                if (row < 0) return endSandTetris();
                gameState.board[row][left + grainX] = gameState.current.color;
            }
        }
    });
    if (gameState.over) return;
    checkSandTetrisLines();
    spawnSandTetrisPiece();
    renderSandTetris();
}

function simulateSandPhysics(board) {
    let moved = false;
    for (let row = board.length - 2; row >= 0; row--) {
        const reverse = Math.random() < .5;
        for (let step = 0; step < board[row].length; step++) {
            const column = reverse ? board[row].length - 1 - step : step;
            const grain = board[row][column];
            if (!grain) continue;
            if (!board[row + 1][column]) {
                board[row + 1][column] = grain;
                board[row][column] = null;
                moved = true;
                continue;
            }
            const directions = Math.random() < .5 ? [-1, 1] : [1, -1];
            const direction = directions.find(offset => {
                const nextColumn = column + offset;
                return nextColumn >= 0 && nextColumn < board[row].length && !board[row + 1][nextColumn];
            });
            if (direction !== undefined) {
                board[row + 1][column + direction] = grain;
                board[row][column] = null;
                moved = true;
            }
        }
    }
    return moved;
}

function checkSandTetrisLines() {
    const gameState = window.sandTetrisState;
    const board = gameState.board;
    const visited = new Uint8Array(SAND_TETRIS_ROWS * SAND_TETRIS_COLUMNS);
    const matched = new Uint8Array(visited.length);
    let matchedLinks = 0;
    let clearedGrains = 0;

    for (let row = 0; row < SAND_TETRIS_ROWS; row++) {
        for (let column = 0; column < SAND_TETRIS_COLUMNS; column++) {
            const color = board[row][column];
            const start = row * SAND_TETRIS_COLUMNS + column;
            if (!color || visited[start]) continue;

            const component = [start];
            visited[start] = 1;
            let reachesLeftEdge = column === 0;
            let reachesRightEdge = column === SAND_TETRIS_COLUMNS - 1;

            for (let index = 0; index < component.length; index++) {
                const cell = component[index];
                const cellRow = Math.floor(cell / SAND_TETRIS_COLUMNS);
                const cellColumn = cell % SAND_TETRIS_COLUMNS;
                const neighbors = [];
                if (cellRow > 0) neighbors.push(cell - SAND_TETRIS_COLUMNS);
                if (cellRow + 1 < SAND_TETRIS_ROWS) neighbors.push(cell + SAND_TETRIS_COLUMNS);
                if (cellColumn > 0) neighbors.push(cell - 1);
                if (cellColumn + 1 < SAND_TETRIS_COLUMNS) neighbors.push(cell + 1);

                for (const neighbor of neighbors) {
                    if (visited[neighbor]) continue;
                    const neighborRow = Math.floor(neighbor / SAND_TETRIS_COLUMNS);
                    const neighborColumn = neighbor % SAND_TETRIS_COLUMNS;
                    if (board[neighborRow][neighborColumn] !== color) continue;
                    visited[neighbor] = 1;
                    component.push(neighbor);
                    if (neighborColumn === 0) reachesLeftEdge = true;
                    if (neighborColumn === SAND_TETRIS_COLUMNS - 1) reachesRightEdge = true;
                }
            }

            if (!reachesLeftEdge || !reachesRightEdge) continue;
            matchedLinks++;
            component.forEach(cell => {
                matched[cell] = 1;
                clearedGrains++;
            });
        }
    }

    if (!matchedLinks) return;
    for (let cell = 0; cell < matched.length; cell++) {
        if (matched[cell]) {
            const row = Math.floor(cell / SAND_TETRIS_COLUMNS);
            const column = cell % SAND_TETRIS_COLUMNS;
            board[row][column] = null;
        }
    }
    gameState.lines += matchedLinks;
    gameState.score += clearedGrains * 10 * gameState.level;
    gameState.level = Math.floor(gameState.lines / 10) + 1;
    const status = document.getElementById("sand-tetris-status");
    if (status) status.textContent = `${matchedLinks} color ${matchedLinks === 1 ? "link" : "links"} cleared!`;
}

function toggleSandTetrisPause() {
    const gameState = window.sandTetrisState;
    if (!gameState || gameState.over) return;
    gameState.paused = !gameState.paused;
    document.getElementById("sand-tetris-pause").textContent = gameState.paused ? "Resume" : "Pause";
    document.getElementById("sand-tetris-status").textContent = gameState.paused ? "Game paused" : "Connect one color from the left edge to the right edge.";
    renderSandTetris();
}

function endSandTetris() {
    const gameState = window.sandTetrisState;
    if (!gameState || gameState.over) return;
    gameState.over = true;
    clearInterval(window.sandTetrisTimer);
    window.sandTetrisTimer = null;
    document.getElementById("sand-tetris-status").textContent = `Game over · ${gameState.lines} color links cleared`;
    recordScore("sand-tetris", gameState.score, Math.floor(gameState.score / 100));
    renderSandTetris();
}

function renderSandTetris() {
    const gameState = window.sandTetrisState;
    const canvas = document.getElementById("sand-tetris-board");
    const nextCanvas = document.getElementById("sand-tetris-next");
    if (!gameState || !canvas || !nextCanvas) return;
    const context = canvas.getContext("2d");
    context.fillStyle = "#0b1020";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "rgba(255,255,255,.055)";
    for (let x = 0; x <= SAND_TETRIS_COLUMNS; x += SAND_TETRIS_SCALE) {
        context.beginPath();
        context.moveTo(x * SAND_TETRIS_PIXEL_SIZE, 0);
        context.lineTo(x * SAND_TETRIS_PIXEL_SIZE, canvas.height);
        context.stroke();
    }
    for (let y = 0; y <= SAND_TETRIS_ROWS; y += SAND_TETRIS_SCALE) {
        context.beginPath();
        context.moveTo(0, y * SAND_TETRIS_PIXEL_SIZE);
        context.lineTo(canvas.width, y * SAND_TETRIS_PIXEL_SIZE);
        context.stroke();
    }
    const drawGrain = (column, row, color) => {
        context.fillStyle = color;
        const x = column * SAND_TETRIS_PIXEL_SIZE;
        const y = row * SAND_TETRIS_PIXEL_SIZE;
        context.fillRect(x, y, SAND_TETRIS_PIXEL_SIZE, SAND_TETRIS_PIXEL_SIZE);
        context.fillStyle = "rgba(255,255,255,.2)";
        context.fillRect(x, y, SAND_TETRIS_PIXEL_SIZE, 1);
    };
    gameState.board.forEach((row, y) => row.forEach((color, x) => color && drawGrain(x, y, color)));
    if (gameState.current && !gameState.over) {
        gameState.current.cells.forEach(([x, y]) => {
            const left = (gameState.current.x + x) * SAND_TETRIS_SCALE;
            const top = (gameState.current.y + y) * SAND_TETRIS_SCALE;
            for (let grainY = 0; grainY < SAND_TETRIS_SCALE; grainY++) {
                for (let grainX = 0; grainX < SAND_TETRIS_SCALE; grainX++) {
                    drawGrain(left + grainX, top + grainY, gameState.current.color);
                }
            }
        });
    }
    const nextContext = nextCanvas.getContext("2d");
    nextContext.clearRect(0, 0, 96, 96);
    gameState.next.cells.forEach(([x, y]) => drawTetrisCell(nextContext, x + 1, y + 1, 18, gameState.next.color));
    document.getElementById("sand-tetris-score").textContent = gameState.score;
    document.getElementById("sand-tetris-lines").textContent = gameState.lines;
    document.getElementById("sand-tetris-level").textContent = gameState.level;
    document.getElementById("sand-tetris-best").textContent = Math.max(state.highScores["sand-tetris"] || 0, gameState.score);
}

document.addEventListener("keydown", event => {
    if (activeGameId !== "sand-tetris") return;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "p", "P"].includes(event.key)) event.preventDefault();
});


/* =========================================================
   CLICKER
   ========================================================= */

function buildClicker(stage) {

    let local = 0;

    stage.innerHTML = `

        <div class="game-score">
            🪙
            <span id="click-score">0</span>
        </div>

        <p class="game-message">
            Tap for coins.
        </p>

        <button
            class="big-click"
            id="big-click"
        >
            🪙
        </button>

        <button
            class="game-button"
            id="power-up"
        >
            Upgrade Click Power — 25 🪙
        </button>

        <button
            class="game-button game-secondary"
            id="auto-up"
        >
            Auto Coins — 75 🪙
        </button>

        <p
            class="game-message"
            id="click-info"
        >
            +${state.clickPower}
            per tap · Auto:
            ${state.autoCoins}/sec
        </p>

    `;

    $("big-click").onclick = () => {

        local += state.clickPower;

        addCoins(state.clickPower);

        $("click-score").textContent =
            local;

    };


    $("power-up").onclick = () => {

        if (state.coins < 25) {

            toast("Need 25 coins");

            return;

        }

        state.coins -= 25;

        state.clickPower++;

        save();
        updateUI();

        toast("⚡ Click power upgraded!");

    };


    $("auto-up").onclick = () => {

        if (state.coins < 75) {

            toast("Need 75 coins");

            return;

        }

        state.coins -= 75;

        state.autoCoins++;

        save();
        updateUI();

        toast("🤖 Auto coins upgraded!");

    };


    clearInterval(window.clickerAuto);

    window.clickerAuto =
        setInterval(() => {

            if (state.autoCoins) {

                addCoins(
                    state.autoCoins
                );

            }

        }, 1000);

}


/* =========================================================
   SNAKE
   ========================================================= */

function buildSnake(stage) {

    stage.innerHTML = `

        <div class="game-score">
            Score:
            <span id="snake-score">0</span>
        </div>

        <canvas
            class="game-canvas"
            id="snake-canvas"
            width="300"
            height="300"
        ></canvas>

        <div class="controls">

            <button onclick="snakeMove('up')">↑</button>
            <button onclick="snakeMove('left')">←</button>
            <button onclick="snakeMove('down')">↓</button>
            <button onclick="snakeMove('right')">→</button>

        </div>

        <button
            class="game-button"
            onclick="startSnakeGame()"
        >
            Restart
        </button>

    `;

    startSnakeGame();

}


function startSnakeGame() {

    clearInterval(
        window.snakeTimer
    );

    window.snake = [
        {x: 7, y: 7},
        {x: 6, y: 7},
        {x: 5, y: 7}
    ];

    window.snakeDir = {
        x: 1,
        y: 0
    };

    window.snakeFood = {
        x: 10,
        y: 10
    };

    window.snakeScore = 0;

    drawSnake();

    window.snakeTimer =
        setInterval(() => {

            const next = {

                x:
                    snake[0].x +
                    snakeDir.x,

                y:
                    snake[0].y +
                    snakeDir.y

            };


            if (

                next.x < 0 ||
                next.x >= 15 ||
                next.y < 0 ||
                next.y >= 15 ||

                snake.some(
                    part =>
                        part.x === next.x &&
                        part.y === next.y
                )

            ) {

                clearInterval(
                    snakeTimer
                );

                recordScore(
                    "snake",
                    snakeScore,
                    Math.floor(
                        snakeScore / 10
                    )
                );

                return;

            }


            snake.unshift(next);


            if (
                next.x === snakeFood.x &&
                next.y === snakeFood.y
            ) {

                snakeScore += 10;

                snakeFood = {

                    x:
                        Math.floor(
                            Math.random() * 15
                        ),

                    y:
                        Math.floor(
                            Math.random() * 15
                        )

                };

            } else {

                snake.pop();

            }

            drawSnake();

        }, 120);

}


function drawSnake() {

    const canvas =
        $("snake-canvas");

    if (!canvas) return;

    const context =
        canvas.getContext("2d");

    context.fillStyle = "#080c14";

    context.fillRect(
        0,
        0,
        300,
        300
    );

    context.fillStyle = "#ff5575";

    context.fillRect(
        snakeFood.x * 20,
        snakeFood.y * 20,
        17,
        17
    );

    context.fillStyle = "#39d98a";

    snake.forEach(part => {

        context.fillRect(
            part.x * 20,
            part.y * 20,
            17,
            17
        );

    });

    if ($("snake-score")) {

        $("snake-score").textContent =
            snakeScore;

    }

}


function snakeMove(direction) {

    if (
        direction === "up" &&
        snakeDir.y === 0
    ) {

        snakeDir = {x: 0, y: -1};

    }

    if (
        direction === "down" &&
        snakeDir.y === 0
    ) {

        snakeDir = {x: 0, y: 1};

    }

    if (
        direction === "left" &&
        snakeDir.x === 0
    ) {

        snakeDir = {x: -1, y: 0};

    }

    if (
        direction === "right" &&
        snakeDir.x === 0
    ) {

        snakeDir = {x: 1, y: 0};

    }

}


/* =========================================================
   MEMORY
   ========================================================= */

function buildMemory(stage) {

    const cards = [

        "🍎", "🍎",
        "🍋", "🍋",
        "🍇", "🍇",
        "🍉", "🍉",
        "⭐", "⭐",
        "🚀", "🚀",
        "🎮", "🎮",
        "🎵", "🎵"

    ].sort(
        () => Math.random() - .5
    );


    stage.innerHTML = `

        <div class="game-score">
            Matches
            <span id="memory-score">0</span>
            /8
        </div>

        <div
            class="memory-grid"
            id="memory-grid"
        ></div>

        <p
            class="game-message"
            id="memory-msg"
        >
            Find all pairs.
        </p>

    `;


    let first = null;
    let locked = false;
    let matches = 0;


    cards.forEach(value => {

        const button =
            document.createElement("button");

        button.className =
            "memory-card";

        button.textContent = "?";


        button.onclick = () => {

            if (
                locked ||
                button === first ||
                button.classList.contains("revealed")
            ) {
                return;
            }


            button.textContent = value;

            button.classList.add("revealed");


            if (!first) {

                first = button;

                button.dataset.value =
                    value;

                return;

            }


            locked = true;


            if (
                first.dataset.value ===
                value
            ) {

                matches++;

                $("memory-score").textContent =
                    matches;

                first = null;
                locked = false;

                addCoins(3);


                if (matches === 8) {

                    $("memory-msg")
                        .textContent =
                        "You cleared the board! 🎉";

                    recordScore(
                        "memory",
                        matches,
                        20
                    );

                }

            } else {

                const old = first;

                setTimeout(() => {

                    old.textContent = "?";

                    old.classList.remove(
                        "revealed"
                    );

                    button.textContent = "?";

                    button.classList.remove(
                        "revealed"
                    );

                    first = null;

                    locked = false;

                }, 600);

            }

        };


        $("memory-grid")
            .appendChild(button);

    });

}


/* =========================================================
   TARGET
   ========================================================= */

function buildTarget(stage) {

    stage.innerHTML = `

        <div class="game-score">

            Time
            <span id="target-time">20</span>

            ·

            Score
            <span id="target-score">0</span>

        </div>

        <div
            class="target-area"
            id="target-area"
        ></div>

        <button
            class="game-button"
            onclick="startTarget()"
        >
            Restart
        </button>

    `;

    startTarget();

}


function startTarget() {

    clearInterval(
        window.targetTimer
    );

    let time = 20;
    let score = 0;

    const area =
        $("target-area");

    area.innerHTML = "";


    function spawnTarget() {

        const target =
            document.createElement("button");

        target.className = "target";

        target.style.left =
            Math.random() * 250 + "px";

        target.style.top =
            Math.random() * 390 + "px";

        target.onclick = () => {

            score++;

            $("target-score").textContent =
                score;

            target.remove();

            spawnTarget();

        };

        area.appendChild(target);

    }


    spawnTarget();


    window.targetTimer =
        setInterval(() => {

            time--;

            $("target-time").textContent =
                time;

            if (time <= 0) {

                clearInterval(
                    targetTimer
                );

                area.innerHTML = `
                    <p
                        style="
                        text-align:center;
                        padding-top:190px;
                        "
                    >
                        Finished!
                        ${score}
                        targets 🎯
                    </p>
                `;

                recordScore(
                    "target",
                    score,
                    score
                );

            }

        }, 1000);

}


/* =========================================================
   REACTION
   ========================================================= */

function buildReaction(stage) {

    stage.innerHTML = `

        <div class="game-score">
            Reaction Test
        </div>

        <div
            class="reaction-box"
            id="reaction-box"
        >
            Click to start
        </div>

        <p
            class="game-message"
            id="reaction-result"
        >
            Wait for green.
        </p>

    `;


    const box =
        $("reaction-box");

    let waiting = false;
    let ready = false;
    let start = 0;


    box.onclick = () => {

        if (!waiting) {

            waiting = true;
            ready = false;

            box.className =
                "reaction-box wait";

            box.textContent =
                "Wait...";


            setTimeout(() => {

                ready = true;

                start =
                    performance.now();

                box.className =
                    "reaction-box ready";

                box.textContent =
                    "CLICK!";

            }, 800 + Math.random() * 2400);

            return;
        }


        if (ready) {

            const milliseconds =
                Math.round(
                    performance.now() - start
                );

            $("reaction-result")
                .textContent =
                `${milliseconds} ms`;

            recordScore(
                "reaction",
                Math.max(
                    1,
                    1000 - milliseconds
                ),
                Math.max(
                    1,
                    Math.floor(
                        1000 /
                        Math.max(
                            1,
                            milliseconds
                        )
                    )
                )
            );

            waiting = false;
            ready = false;

            box.className =
                "reaction-box";

            box.textContent =
                "Click to try again";

        }

    };

}


/* =========================================================
   NUMBER GUESS
   ========================================================= */

function buildNumber(stage) {

    stage.innerHTML = `

        <div class="game-score">
            Number Guess
        </div>

        <p class="game-message">
            I'm thinking of 1–50.
        </p>

        <input
            class="number-input"
            id="guess-input"
            type="number"
            min="1"
            max="50"
            placeholder="Enter guess"
        >

        <button
            class="game-button"
            onclick="guessNumber()"
        >
            Guess
        </button>

        <p
            class="game-message"
            id="guess-msg"
        ></p>

        <button
            class="game-button game-secondary"
            onclick="newNumber()"
        >
            New Number
        </button>

    `;

    newNumber();

}


function newNumber() {

    window.secret =
        Math.floor(
            Math.random() * 50
        ) + 1;

    window.attempts = 0;

    if ($("guess-input")) {
        $("guess-input").value = "";
    }

    if ($("guess-msg")) {
        $("guess-msg").textContent =
            "Good luck!";
    }

}


function guessNumber() {

    const number =
        Number(
            $("guess-input").value
        );

    window.attempts++;


    if (number === secret) {

        $("guess-msg")
            .textContent =
            `Correct in ${attempts} guesses! 🎉`;

        recordScore(
            "number",
            Math.max(
                1,
                50 - attempts
            ),
            Math.max(
                2,
                30 - attempts
            )
        );

    } else {

        $("guess-msg")
            .textContent =
            number < secret
                ? "Too low!"
                : "Too high!";

    }

}


/* =========================================================
   COLOR
   ========================================================= */

function buildColor(stage) {

    stage.innerHTML = `

        <div class="game-score">
            Score
            <span id="color-score">0</span>
        </div>

        <p
            class="game-message"
            id="color-word"
            style="
            font-size:32px;
            font-weight:900;
            "
        >
            RED
        </p>

        <div id="color-buttons"></div>

        <p
            class="game-message"
            id="color-msg"
        >
            Match the word.
        </p>

    `;

    colorRound();

}


function colorRound() {

    const colors = [
        "red",
        "blue",
        "green",
        "yellow",
        "purple"
    ];

    const word =
        colors[
            Math.floor(
                Math.random() *
                colors.length
            )
        ];

    $("color-word")
        .textContent =
        word.toUpperCase();

    const box =
        $("color-buttons");

    box.innerHTML = "";

    colors.forEach(color => {

        const button =
            document.createElement("button");

        button.className =
            "game-button";

        button.textContent =
            color.toUpperCase();

        button.style.background =
            color;

        if (color === "yellow") {
            button.style.color = "#111";
        }

        button.onclick = () => {

            if (color === word) {

                $("color-score")
                    .textContent =
                    Number(
                        $("color-score")
                            .textContent
                    ) + 1;

                addCoins(2);

                colorRound();

            } else {

                $("color-msg")
                    .textContent =
                    "Nope — try again!";

            }

        };

        box.appendChild(button);

    });

}


/* =========================================================
   STACK
   ========================================================= */

function buildStack(stage) {

    stage.innerHTML = `

        <div class="game-score tetris-stats">
            <span>Height <b id="stack-score">0</b></span>
            <span>Best <b id="stack-best">0</b></span>
        </div>
        <div class="stack-area" id="stack-area" role="button" tabindex="0" aria-label="Tap to drop the moving block"></div>
        <button class="game-button" type="button" id="stack-drop">DROP BLOCK</button>
        <p class="game-message" id="stack-status" aria-live="polite">Let it fall and trim the overhang to build a steady tower.</p>
        <button class="game-button" type="button" id="stack-restart">New tower</button>
    `;

    stage.querySelector("#stack-drop").addEventListener("click", dropStack);
    stage.querySelector("#stack-restart").addEventListener("click", startStack);
    const area = stage.querySelector("#stack-area");
    area.addEventListener("pointerdown", event => {
        event.preventDefault();
        dropStack();
    });
    area.addEventListener("keydown", event => {
        if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            dropStack();
        }
    });
    startStack();
}

function startStack() {
    clearInterval(window.stackTimer);
    const area = $("stack-area");
    if (!area) return;
    const width = area.clientWidth;
    const height = area.clientHeight;
    window.stackHeight = 0;
    window.stackBlocks = [];
    window.stackDebris = [];
    window.stackState = {
        width,
        height,
        blockHeight: 24,
        initialWidth: Math.min(130, width * .46),
        x: 0,
        y: 0,
        vx: 175,
        vy: 0,
        gravity: 1500,
        moveDirection: 1,
        dropping: false,
        over: false,
        lastTick: performance.now()
    };
    area.replaceChildren();
    const base = document.createElement("div");
    base.className = "stack-block stack-base";
    base.style.left = `${(width - window.stackState.initialWidth) / 2}px`;
    base.style.top = `${height - window.stackState.blockHeight}px`;
    base.style.width = `${window.stackState.initialWidth}px`;
    area.appendChild(base);
    window.stackBlocks.push({
        element: base,
        x: (width - window.stackState.initialWidth) / 2,
        y: height - window.stackState.blockHeight,
        width: window.stackState.initialWidth
    });
    stackSpawn();
    setText("stack-score", "0");
    setText("stack-best", state.highScores.stack || 0);
    setText("stack-status", "Let it fall and trim the overhang to build a steady tower.");
    const dropButton = $("stack-drop");
    if (dropButton) dropButton.disabled = false;
    const restartButton = $("stack-restart");
    if (restartButton) restartButton.hidden = false;
    window.stackTimer = setInterval(tickStack, 16);
}

function stackSpawn() {
    const state = window.stackState;
    const area = $("stack-area");
    const previous = window.stackBlocks?.at(-1);
    if (!state || !area || !previous || state.over) return;
    if (previous.y <= state.blockHeight) {
        endStack();
        return;
    }
    const block = document.createElement("div");
    block.className = "stack-block";
    block.style.width = `${previous.width}px`;
    block.style.left = `${previous.x}px`;
    block.style.top = "0px";
    area.appendChild(block);
    state.x = 0;
    state.y = 0;
    state.moveDirection = 1;
    state.vy = 0;
    state.dropping = false;
    state.lastTick = performance.now();
    const speed = Math.min(380, 175 + window.stackHeight * 9);
    state.vx = speed;
    window.currentStack = block;
    setText("stack-status", "Tap DROP or the moving block to let gravity do the rest.");
    renderStack();
}

function tickStack() {
    const state = window.stackState;
    if (!state || state.over) return;
    const now = performance.now();
    const delta = Math.min(.04, Math.max(.001, (now - state.lastTick) / 1000));
    state.lastTick = now;

    state.stackDebris = window.stackDebris || [];
    state.stackDebris.forEach(piece => {
        piece.vy += state.gravity * delta;
        piece.x += piece.vx * delta;
        piece.y += piece.vy * delta;
        piece.rotation += piece.spin * delta;
        piece.element.style.left = `${piece.x}px`;
        piece.element.style.top = `${piece.y}px`;
        piece.element.style.transform = `rotate(${piece.rotation}rad)`;
    });
    window.stackDebris = state.stackDebris.filter(piece => {
        if (piece.y < state.height + 30) return true;
        piece.element.remove();
        return false;
    });

    if (!state.dropping) {
        const width = window.currentStack?.offsetWidth || 0;
        state.x += state.vx * state.moveDirection * delta;
        const maximum = state.width - width;
        if (state.x >= maximum) {
            state.x = maximum;
            state.moveDirection = -1;
        } else if (state.x <= 0) {
            state.x = 0;
            state.moveDirection = 1;
        }
    } else {
        state.vy += state.gravity * delta;
        state.y += state.vy * delta;
        const previous = window.stackBlocks.at(-1);
        const targetY = previous.y - state.blockHeight;
        if (state.y >= targetY) {
            state.y = targetY;
            stackLand();
        }
    }
    renderStack();
}

function renderStack() {
    const state = window.stackState;
    if (!state || !window.currentStack) return;
    window.currentStack.style.left = `${state.x}px`;
    window.currentStack.style.top = `${state.y}px`;
    $("stack-area")?.classList.toggle("stack-dropping", state.dropping);
}

function dropStack() {
    const state = window.stackState;
    if (!state || state.over || state.dropping || !window.currentStack) return;
    state.dropping = true;
    state.vy = 0;
    setText("stack-status", "Block falling…");
}

function stackLand() {
    const stack = window.stackState;
    const moving = window.currentStack;
    const previous = window.stackBlocks.at(-1);
    if (!stack || !moving || !previous) return;

    const left = Math.max(stack.x, previous.x);
    const right = Math.min(stack.x + previous.width, previous.x + previous.width);
    const overlap = right - left;
    if (overlap < 10) {
        moving.style.top = `${stack.height}px`;
        moving.classList.add("stack-falling");
        setText("stack-status", "The block missed the tower. Start a new tower.");
        window.stackBlocks.push({ element: moving, x: stack.x, y: stack.y, width: moving.offsetWidth });
        endStack();
        return;
    }

    const overhangLeft = Math.max(0, previous.x - stack.x);
    const overhangRight = Math.max(0, stack.x + previous.width - (previous.x + previous.width));
    if (overhangLeft > 1) stackCreateDebris(stack.x, stack.y, overhangLeft, overhangLeft / 80);
    if (overhangRight > 1) stackCreateDebris(right, stack.y, overhangRight, overhangRight / 80);
    moving.style.left = `${left}px`;
    moving.style.top = `${stack.y}px`;
    moving.style.width = `${overlap}px`;
    moving.classList.add("stack-landed");
    window.stackBlocks.push({ element: moving, x: left, y: stack.y, width: overlap });
    window.stackHeight++;
    setText("stack-score", window.stackHeight);
    setText("stack-best", Math.max(state.highScores.stack || 0, window.stackHeight));
    if (window.stackHeight > (state.highScores.stack || 0)) {
        state.highScores.stack = window.stackHeight;
        save();
        updateGameCenterStats();
    }
    addCoins(1);
    window.currentStack = null;
    if (overlap <= 18 || stack.y <= stack.blockHeight) {
        endStack();
        return;
    }
    stackSpawn();
}

function stackCreateDebris(x, y, width, scale) {
    if (width <= 0) return;
    const state = window.stackState;
    const piece = document.createElement("div");
    piece.className = "stack-block stack-debris";
    piece.style.width = `${width}px`;
    piece.style.top = `${y}px`;
    piece.style.left = `${x}px`;
    $("stack-area")?.appendChild(piece);
    window.stackDebris.push({
        element: piece,
        x,
        y,
        vx: (x < state.x + (window.currentStack?.offsetWidth || 0) / 2 ? -1 : 1) * (90 + scale * 80),
        vy: -25,
        spin: (x < state.x + (window.currentStack?.offsetWidth || 0) / 2 ? -1 : 1) * 1.4,
        rotation: 0
    });
}

function endStack() {
    const stack = window.stackState;
    if (!stack || stack.over) return;
    stack.over = true;
    clearInterval(window.stackTimer);
    window.stackTimer = null;
    window.stackDebris?.forEach(piece => piece.element.classList.add("stack-falling"));
    const dropButton = $("stack-drop");
    if (dropButton) dropButton.disabled = true;
    const restartButton = $("stack-restart");
    if (restartButton) restartButton.hidden = false;
    recordScore("stack", window.stackHeight, Math.floor(window.stackHeight / 2));
    setText("stack-best", state.highScores.stack || 0);
}


/* =========================================================
   DODGE
   ========================================================= */

function buildDodge(stage) {

    stage.innerHTML = `

        <div class="game-score">

            Score
            <span id="dodge-score">0</span>

        </div>

        <canvas
            class="game-canvas"
            id="dodge-canvas"
            width="300"
            height="400"
        ></canvas>

        <div class="controls">

            <button onclick="moveDodge(-1)">←</button>
            <button onclick="moveDodge(1)">→</button>

        </div>

        <button
            class="game-button"
            onclick="startDodge()"
        >
            Restart
        </button>

    `;

    startDodge();

}


function startDodge() {

    clearInterval(
        window.dodgeTimer
    );

    const canvas =
        $("dodge-canvas");

    const context =
        canvas.getContext("2d");

    window.dp = 130;
    window.db = [];
    window.ds = 0;

    window.dodgeTimer =
        setInterval(() => {

            context.fillStyle =
                "#080c14";

            context.fillRect(
                0,
                0,
                300,
                400
            );


            if (Math.random() < .05) {

                db.push({

                    x:
                        Math.random() *
                        270,

                    y: -30,

                    v:
                        3 +
                        Math.random() * 3

                });

            }


            db.forEach(object => {

                object.y += object.v;

            });


            context.fillStyle =
                "#38bdf8";

            context.fillRect(
                dp,
                360,
                40,
                22
            );


            context.fillStyle =
                "#ff5575";

            db.forEach(object => {

                context.fillRect(
                    object.x,
                    object.y,
                    30,
                    30
                );


                if (

                    object.x < dp + 40 &&
                    object.x + 30 > dp &&
                    object.y < 382 &&
                    object.y + 30 > 360

                ) {

                    clearInterval(
                        dodgeTimer
                    );

                    recordScore(
                        "dodge",
                        Math.floor(
                            ds / 10
                        ),
                        Math.floor(
                            ds / 100
                        )
                    );

                }

            });


            ds++;

            $("dodge-score")
                .textContent =
                Math.floor(
                    ds / 10
                );

        }, 30);

}


function moveDodge(direction) {

    window.dp =
        Math.max(
            0,
            Math.min(
                260,
                dp + direction * 30
            )
        );

}


/* =========================================================
   ROAD RUSH
   ========================================================= */

function buildRoad(stage) {

    stage.innerHTML = `

        <div class="game-score">

            Distance
            <span id="road-score">0</span>

        </div>

        <canvas
            class="game-canvas"
            id="road-canvas"
            width="300"
            height="400"
        ></canvas>

        <div class="controls">

            <button onclick="moveRoad(-1)">←</button>
            <button onclick="moveRoad(1)">→</button>

        </div>

        <button
            class="game-button"
            onclick="startRoad()"
        >
            Restart
        </button>

    `;

    startRoad();

}


function startRoad() {

    clearInterval(
        window.roadTimer
    );

    const canvas =
        $("road-canvas");

    const context =
        canvas.getContext("2d");

    window.rl = 1;
    window.rc = [];
    window.rs = 0;

    const car =
        new Image();

    car.src =
        "images/car.png";

    window.roadTimer =
        setInterval(() => {

            context.fillStyle =
                "#273238";

            context.fillRect(
                0,
                0,
                300,
                400
            );


            context.strokeStyle =
                "#ffffff";

            for (
                let y = 0;
                y < 400;
                y += 50
            ) {

                context.beginPath();

                context.moveTo(
                    100,
                    y
                );

                context.lineTo(
                    100,
                    y + 25
                );

                context.stroke();


                context.beginPath();

                context.moveTo(
                    200,
                    y
                );

                context.lineTo(
                    200,
                    y + 25
                );

                context.stroke();

            }


            if (Math.random() < .035) {

                rc.push({

                    l:
                        Math.floor(
                            Math.random() * 3
                        ),

                    y: -60

                });

            }


            rc.forEach(object => {

                object.y += 4;

            });


            context.fillStyle =
                "#ff5575";

            rc.forEach(object => {

                context.fillRect(
                    object.l * 100 + 25,
                    object.y,
                    50,
                    70
                );


                if (
                    object.l === rl &&
                    object.y > 315 &&
                    object.y < 390
                ) {

                    clearInterval(
                        roadTimer
                    );

                    recordScore(
                        "road",
                        Math.floor(
                            rs / 10
                        ),
                        Math.floor(
                            rs / 100
                        )
                    );

                }

            });


            if (car.complete) {

                context.drawImage(
                    car,
                    rl * 100 + 25,
                    325,
                    50,
                    70
                );

            } else {

                context.fillStyle =
                    "#38bdf8";

                context.fillRect(
                    rl * 100 + 25,
                    325,
                    50,
                    70
                );

            }


            rs++;

            $("road-score")
                .textContent =
                Math.floor(
                    rs / 10
                );

        }, 30);

}


function moveRoad(direction) {

    window.rl =
        Math.max(
            0,
            Math.min(
                2,
                rl + direction
            )
        );

}


/* =========================================================
   SPACE
   ========================================================= */

function buildSpace(stage) {

    stage.innerHTML = `

        <div class="game-score">

            Score
            <span id="space-score">0</span>

        </div>

        <canvas
            class="game-canvas"
            id="space-canvas"
            width="300"
            height="400"
        ></canvas>

        <div class="controls">

            <button onclick="moveSpace(-1)">←</button>
            <button onclick="shootSpace()">🚀</button>
            <button onclick="moveSpace(1)">→</button>

        </div>

        <button
            class="game-button"
            onclick="startSpace()"
        >
            Restart
        </button>

    `;

    startSpace();

}


function startSpace() {

    clearInterval(
        window.spaceTimer
    );

    const canvas =
        $("space-canvas");

    const context =
        canvas.getContext("2d");

    window.sp = 135;
    window.bullets = [];
    window.enemies = [];
    window.ss = 0;

    window.spaceTimer =
        setInterval(() => {

            context.fillStyle =
                "#050812";

            context.fillRect(
                0,
                0,
                300,
                400
            );


            if (Math.random() < .035) {

                enemies.push({

                    x:
                        Math.random() *
                        270,

                    y: -20

                });

            }


            bullets.forEach(
                bullet => {
                    bullet.y -= 7;
                }
            );


            enemies.forEach(
                enemy => {
                    enemy.y += 2;
                }
            );


            bullets.forEach(bullet => {

                enemies.forEach(enemy => {

                    if (

                        bullet.x > enemy.x &&
                        bullet.x < enemy.x + 30 &&
                        bullet.y > enemy.y &&
                        bullet.y < enemy.y + 20

                    ) {

                        enemy.dead = true;
                        bullet.dead = true;

                        ss += 10;

                    }

                });

            });


            bullets =
                bullets.filter(
                    bullet =>
                        !bullet.dead &&
                        bullet.y > 0
                );


            enemies =
                enemies.filter(
                    enemy =>
                        !enemy.dead &&
                        enemy.y < 420
                );


            context.fillStyle =
                "#38bdf8";

            context.fillRect(
                sp,
                365,
                30,
                20
            );


            context.fillStyle =
                "#ffd166";

            bullets.forEach(bullet => {

                context.fillRect(
                    bullet.x,
                    bullet.y,
                    4,
                    12
                );

            });


            context.fillStyle =
                "#ff5575";

            enemies.forEach(enemy => {

                context.fillRect(
                    enemy.x,
                    enemy.y,
                    30,
                    20
                );

            });


            $("space-score")
                .textContent =
                ss;

        }, 30);

}


function moveSpace(direction) {

    window.sp =
        Math.max(
            0,
            Math.min(
                270,
                sp + direction * 25
            )
        );

}


function shootSpace() {

    if (!window.bullets) return;

    bullets.push({

        x: sp + 13,

        y: 360

    });

}


/* =========================================================
   COIN CATCHER
   ========================================================= */

function buildCoins(stage) {

    stage.innerHTML = `

        <div class="game-score">

            Caught
            <span id="catch-score">0</span>

        </div>

        <canvas
            class="game-canvas"
            id="catch-canvas"
            width="300"
            height="400"
        ></canvas>

        <div class="controls">

            <button onclick="moveCatcher(-1)">←</button>
            <button onclick="moveCatcher(1)">→</button>

        </div>

        <button
            class="game-button"
            onclick="startCoins()"
        >
            Restart
        </button>

    `;

    startCoins();

}


function startCoins() {

    clearInterval(
        window.catchTimer
    );

    const canvas =
        $("catch-canvas");

    const context =
        canvas.getContext("2d");

    window.cp = 130;
    window.co = [];
    window.cs = 0;

    window.catchTimer =
        setInterval(() => {

            context.fillStyle =
                "#09101b";

            context.fillRect(
                0,
                0,
                300,
                400
            );


            if (Math.random() < .05) {

                co.push({

                    x:
                        Math.random() *
                        280,

                    y: -20,

                    type:
                        Math.random() < .8
                            ? "coin"
                            : "hazard"

                });

            }


            co.forEach(object => {

                object.y += 4;

            });


            co.forEach(object => {

                if (

                    object.y > 350 &&
                    object.y < 400 &&
                    object.x > cp - 20 &&
                    object.x < cp + 60

                ) {

                    object.hit = true;


                    if (
                        object.type === "coin"
                    ) {

                        cs += 5;

                        addCoins(1);

                    } else {

                        cs =
                            Math.max(
                                0,
                                cs - 10
                            );

                    }

                }

            });


            co =
                co.filter(
                    object =>
                        !object.hit &&
                        object.y < 420
                );


            context.font =
                "22px Arial";

            co.forEach(object => {

                context.fillText(
                    object.type === "coin"
                        ? "🪙"
                        : "💣",
                    object.x,
                    object.y
                );

            });


            context.fillStyle =
                "#38bdf8";

            context.fillRect(
                cp,
                370,
                60,
                20
            );


            $("catch-score")
                .textContent =
                cs;

        }, 30);

}


function moveCatcher(direction) {

    window.cp =
        Math.max(
            0,
            Math.min(
                240,
                cp + direction * 25
            )
        );

}


/* =========================================================
   MINESWEEPER
   ========================================================= */

const MINE_ROWS = 9;
const MINE_COLUMNS = 9;
const MINE_COUNT = 10;

function buildMines(stage) {
    stage.innerHTML = `
        <div class="game-score tetris-stats minesweeper-stats">
            <span>Mines <b id="mine-count">${MINE_COUNT}</b></span>
            <span>Time <b id="mine-time">0</b></span>
            <span>Best <b id="mine-best">0</b></span>
        </div>
        <div class="minesweeper-toolbar">
            <button type="button" class="game-button" id="mine-flag-mode" aria-pressed="false">⚑ Flag mode off</button>
            <button type="button" class="game-button" id="mine-new-game">New board</button>
        </div>
        <div class="minesweeper-board" id="mine-grid" role="grid" aria-label="Minesweeper board, 9 by 9"></div>
        <p class="game-message" id="mine-msg" aria-live="polite">Find all 10 mines. Your first square is always safe.</p>
    `;
    stage.querySelector("#mine-new-game").addEventListener("click", startMinesweeper);
    stage.querySelector("#mine-flag-mode").addEventListener("click", () => {
        const game = window.mineGame;
        if (!game || game.over || game.won) return;
        game.flagMode = !game.flagMode;
        renderMinesweeper();
    });
    startMinesweeper();
}

function startMinesweeper() {
    clearInterval(window.mineTimer);
    window.mineGame = {
        board: Array.from({ length: MINE_ROWS * MINE_COLUMNS }, () => ({
            mine: false,
            adjacent: 0,
            revealed: false,
            flagged: false
        })),
        placed: false,
        over: false,
        won: false,
        flagMode: false,
        flags: 0,
        revealed: 0,
        elapsed: 0
    };
    renderMinesweeper();
    setText("mine-msg", "Find all 10 mines. Your first square is always safe.");
}

function getMineNeighbors(index) {
    const row = Math.floor(index / MINE_COLUMNS);
    const column = index % MINE_COLUMNS;
    const neighbors = [];
    for (let y = Math.max(0, row - 1); y <= Math.min(MINE_ROWS - 1, row + 1); y++) {
        for (let x = Math.max(0, column - 1); x <= Math.min(MINE_COLUMNS - 1, column + 1); x++) {
            const neighbor = y * MINE_COLUMNS + x;
            if (neighbor !== index) neighbors.push(neighbor);
        }
    }
    return neighbors;
}

function placeMines(firstIndex) {
    const game = window.mineGame;
    if (!game || game.placed) return;
    const excluded = new Set([firstIndex, ...getMineNeighbors(firstIndex)]);
    const candidates = game.board.map((_, index) => index).filter(index => !excluded.has(index));
    for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    candidates.slice(0, MINE_COUNT).forEach(index => { game.board[index].mine = true; });
    game.board.forEach((cell, index) => {
        if (!cell.mine) cell.adjacent = getMineNeighbors(index).filter(neighbor => game.board[neighbor].mine).length;
    });
    game.placed = true;
    window.mineTimer = setInterval(() => {
        if (!window.mineGame || window.mineGame.over || window.mineGame.won) return;
        window.mineGame.elapsed++;
        setText("mine-time", window.mineGame.elapsed);
    }, 1000);
}

function revealMine(index) {
    const game = window.mineGame;
    const cell = game?.board[index];
    if (!game || !cell || game.over || game.won || cell.revealed || cell.flagged) return;
    if (!game.placed) placeMines(index);

    if (cell.mine) {
        game.over = true;
        clearInterval(window.mineTimer);
        game.board.forEach(item => { if (item.mine) item.revealed = true; });
        setText("mine-msg", "Boom! You hit a mine. Try another board.");
        renderMinesweeper();
        return;
    }

    const queue = [index];
    while (queue.length) {
        const nextIndex = queue.pop();
        const nextCell = game.board[nextIndex];
        if (!nextCell || nextCell.revealed || nextCell.flagged || nextCell.mine) continue;
        nextCell.revealed = true;
        game.revealed++;
        if (nextCell.adjacent === 0) queue.push(...getMineNeighbors(nextIndex));
    }

    if (game.revealed === game.board.length - MINE_COUNT) {
        game.won = true;
        clearInterval(window.mineTimer);
        setText("mine-msg", `Field cleared in ${game.elapsed} seconds!`);
        recordScore("mines", Math.max(1, 1000 - game.elapsed * 5), 10);
    }
    renderMinesweeper();
}

function toggleMineFlag(index) {
    const game = window.mineGame;
    const cell = game?.board[index];
    if (!game || game.over || game.won || !cell || cell.revealed) return;
    if (!cell.flagged && game.flags >= MINE_COUNT) {
        setText("mine-msg", "You can only place 10 flags.");
        return;
    }
    cell.flagged = !cell.flagged;
    game.flags += cell.flagged ? 1 : -1;
    renderMinesweeper();
}

function renderMinesweeper() {
    const game = window.mineGame;
    const grid = $("mine-grid");
    if (!game || !grid) return;
    grid.replaceChildren();
    game.board.forEach((cell, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "minesweeper-cell";
        button.setAttribute("role", "gridcell");
        button.setAttribute("aria-label", cell.revealed
            ? cell.mine ? `Square ${index + 1}, mine` : `Square ${index + 1}, ${cell.adjacent || "empty"}`
            : `Hidden square ${index + 1}${cell.flagged ? ", flagged" : ""}`);
        if (cell.revealed) {
            button.classList.add("revealed");
            if (cell.mine) {
                button.classList.add("mine-hit");
                button.textContent = "💣";
            } else if (cell.adjacent) {
                button.textContent = String(cell.adjacent);
                button.dataset.number = String(cell.adjacent);
            }
        } else if (cell.flagged) {
            button.classList.add("flagged");
            button.textContent = "⚑";
        } else {
            button.textContent = "";
        }
        button.disabled = game.over || game.won || cell.revealed;
        button.addEventListener("click", () => {
            if (game.flagMode) toggleMineFlag(index);
            else revealMine(index);
        });
        button.addEventListener("contextmenu", event => {
            event.preventDefault();
            toggleMineFlag(index);
        });
        grid.appendChild(button);
    });
    setText("mine-count", MINE_COUNT - game.flags);
    setText("mine-time", game.elapsed);
    setText("mine-best", state.highScores.mines || 0);
    const flagButton = $("mine-flag-mode");
    if (flagButton) {
        flagButton.textContent = game.flagMode ? "⚑ Flag mode on" : "⚑ Flag mode off";
        flagButton.setAttribute("aria-pressed", String(game.flagMode));
    }
}

/* =========================================================
   SUDOKU
   ========================================================= */

function shuffleSudoku(values) {
    const shuffled = [...values];
    for (let index = shuffled.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }
    return shuffled;
}

function createSudokuPuzzle() {
    const sourcePuzzle = "530070000600195000098000060800060003400803001700020006060000280000419005000080079";
    const sourceSolution = "534678912672195348198342567859761423426853791713924856961537284287419635345286179";
    const groups = [0, 1, 2];
    const rows = shuffleSudoku(groups).flatMap(group => shuffleSudoku([0, 1, 2]).map(offset => group * 3 + offset));
    const columns = shuffleSudoku(groups).flatMap(group => shuffleSudoku([0, 1, 2]).map(offset => group * 3 + offset));
    const digits = shuffleSudoku([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const solution = rows.flatMap(row => columns.map(column => digits[Number(sourceSolution[row * 9 + column]) - 1]));
    const puzzle = rows.flatMap(row => columns.map(column => {
        const value = Number(sourcePuzzle[row * 9 + column]);
        return value ? digits[value - 1] : 0;
    }));
    return { solution, puzzle };
}

function buildSudoku(stage) {
    stage.innerHTML = `
        <div class="game-score tetris-stats sudoku-stats">
            <span>Mistakes <b id="sudoku-mistakes">0</b></span>
            <span>Best <b id="sudoku-best">0</b></span>
        </div>
        <div class="sudoku-board" id="sudoku-board" role="grid" aria-label="Sudoku board, 9 by 9"></div>
        <p class="game-message" id="sudoku-status" aria-live="polite">Select an empty square, then choose a number.</p>
        <div class="sudoku-keypad" role="group" aria-label="Sudoku numbers">
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => `<button type="button" data-sudoku-number="${number}" aria-label="Enter ${number}">${number}</button>`).join("")}
            <button type="button" data-sudoku-erase aria-label="Erase selected square">⌫</button>
        </div>
        <div class="sudoku-actions">
            <button class="game-button" type="button" id="sudoku-check">Check board</button>
            <button class="game-button" type="button" id="sudoku-hint">Hint</button>
            <button class="game-button" type="button" id="sudoku-new">New puzzle</button>
        </div>
    `;
    stage.querySelectorAll("[data-sudoku-number]").forEach(button => button.addEventListener("click", () => enterSudokuNumber(Number(button.dataset.sudokuNumber))));
    stage.querySelector("[data-sudoku-erase]").addEventListener("click", () => enterSudokuNumber(0));
    stage.querySelector("#sudoku-check").addEventListener("click", checkSudoku);
    stage.querySelector("#sudoku-hint").addEventListener("click", giveSudokuHint);
    stage.querySelector("#sudoku-new").addEventListener("click", startSudoku);
    startSudoku();
}

function startSudoku() {
    const { solution, puzzle } = createSudokuPuzzle();
    window.sudokuGame = {
        solution,
        puzzle,
        board: [...puzzle],
        selected: puzzle.findIndex(value => value === 0),
        mistakes: 0,
        markedMistakes: new Set(),
        hints: 0,
        checked: false,
        over: false
    };
    renderSudoku();
    setText("sudoku-status", "Select an empty square, then choose a number.");
}

function sudokuConflicts(index, value, board = window.sudokuGame?.board) {
    if (!value || !board) return false;
    const row = Math.floor(index / 9);
    const column = index % 9;
    for (let offset = 0; offset < 9; offset++) {
        const rowIndex = row * 9 + offset;
        const columnIndex = offset * 9 + column;
        if ((rowIndex !== index && board[rowIndex] === value) || (columnIndex !== index && board[columnIndex] === value)) return true;
    }
    const boxRow = Math.floor(row / 3) * 3;
    const boxColumn = Math.floor(column / 3) * 3;
    for (let y = boxRow; y < boxRow + 3; y++) {
        for (let x = boxColumn; x < boxColumn + 3; x++) {
            const boxIndex = y * 9 + x;
            if (boxIndex !== index && board[boxIndex] === value) return true;
        }
    }
    return false;
}

function enterSudokuNumber(value) {
    const game = window.sudokuGame;
    if (!game || game.over || game.selected < 0 || game.puzzle[game.selected]) return;
    game.board[game.selected] = value;
    game.checked = false;
    if (completeSudokuIfSolved()) {
        renderSudoku();
        return;
    }
    renderSudoku();
    setText("sudoku-status", value ? "Number entered. Check for row, column, and box conflicts." : "Square erased.");
}

function completeSudokuIfSolved() {
    const game = window.sudokuGame;
    if (!game || game.over || !game.board.every((number, index) => number === game.solution[index])) return false;
    game.over = true;
    const score = Math.max(1, 1000 - game.mistakes * 50 - game.hints * 25);
    setText("sudoku-status", `Puzzle solved! Score ${score}.`);
    recordScore("sudoku", score, 10);
    return true;
}

function checkSudoku() {
    const game = window.sudokuGame;
    if (!game || game.over) return;
    game.checked = true;
    const wrongIndexes = game.board
        .map((value, index) => value && value !== game.solution[index] ? index : -1)
        .filter(index => index >= 0);
    wrongIndexes.forEach(index => game.markedMistakes.add(index));
    game.mistakes = game.markedMistakes.size;
    const wrong = wrongIndexes.length;
    if (wrong) {
        setText("sudoku-status", `${wrong} ${wrong === 1 ? "number needs" : "numbers need"} a correction.`);
    } else if (game.board.every(Boolean)) {
        setText("sudoku-status", "All numbers are correct!");
    } else {
        setText("sudoku-status", "So far, every filled square is correct.");
    }
    renderSudoku();
    setText("sudoku-mistakes", game.mistakes);
}

function giveSudokuHint() {
    const game = window.sudokuGame;
    if (!game || game.over) return;
    const empty = game.board.map((value, index) => value === game.solution[index] ? -1 : index).filter(index => index >= 0);
    const index = empty[Math.floor(Math.random() * empty.length)];
    if (index === undefined) return;
    game.board[index] = game.solution[index];
    game.selected = index;
    game.hints++;
    game.checked = false;
    setText("sudoku-status", `Hint: placed ${game.solution[index]} in row ${Math.floor(index / 9) + 1}.`);
    completeSudokuIfSolved();
    renderSudoku();
}

function renderSudoku() {
    const game = window.sudokuGame;
    const board = $("sudoku-board");
    if (!game || !board) return;
    board.replaceChildren();
    game.board.forEach((value, index) => {
        const cell = document.createElement("button");
        const row = Math.floor(index / 9);
        const column = index % 9;
        cell.type = "button";
        cell.className = "sudoku-cell";
        cell.setAttribute("role", "gridcell");
        if (game.puzzle[index]) cell.classList.add("given");
        if (index === game.selected) cell.classList.add("selected");
        if (game.selected >= 0 && value && game.board[game.selected] === value) cell.classList.add("same-number");
        if (game.checked && value && value !== game.solution[index]) cell.classList.add("incorrect");
        if (sudokuConflicts(index, value)) cell.classList.add("conflict");
        if (column === 2 || column === 5) cell.classList.add("box-right");
        if (row === 2 || row === 5) cell.classList.add("box-bottom");
        cell.textContent = value ? String(value) : "";
        cell.disabled = game.over;
        cell.setAttribute("aria-label", `Row ${row + 1}, column ${column + 1}${value ? `, ${value}` : ", empty"}${game.puzzle[index] ? ", given" : ""}`);
        cell.addEventListener("click", () => {
            if (game.puzzle[index] || game.over) return;
            game.selected = index;
            renderSudoku();
        });
        board.appendChild(cell);
    });
    setText("sudoku-mistakes", game.mistakes);
    setText("sudoku-best", state.highScores.sudoku || 0);
    board.setAttribute("aria-label", `Sudoku board, ${game.board.filter(Boolean).length} of 81 squares filled`);
    const keypad = document.querySelector(".sudoku-keypad");
    if (keypad) keypad.querySelectorAll("button").forEach(button => { button.disabled = game.over || game.selected < 0; });
}

document.addEventListener("keydown", event => {
    if (activeGameId !== "sudoku" || !window.sudokuGame || window.sudokuGame.over) return;
    if (/^[1-9]$/.test(event.key)) {
        event.preventDefault();
        enterSudokuNumber(Number(event.key));
    } else if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        enterSudokuNumber(0);
    } else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
        const current = window.sudokuGame.selected;
        const delta = event.key === "ArrowUp" ? -9 : event.key === "ArrowDown" ? 9 : event.key === "ArrowLeft" ? -1 : 1;
        let next = current;
        for (let tries = 0; tries < 81; tries++) {
            next = (next + delta + 81) % 81;
            if (!window.sudokuGame.puzzle[next]) break;
        }
        window.sudokuGame.selected = next;
        renderSudoku();
    }
});


/* =========================================================
   SPEED TYPE
   ========================================================= */

function buildTyping(stage) {

    const words = [

        "pixel",
        "phone",
        "rocket",
        "coffee",
        "sunset",
        "game",
        "music",
        "purple",
        "castle",
        "dragon",
        "future",
        "button"

    ];


    const word =
        words[
            Math.floor(
                Math.random() *
                words.length
            )
        ];


    let start = 0;


    stage.innerHTML = `

        <div class="game-score">
            Speed Type
        </div>

        <p class="game-message">
            Type the word exactly.
        </p>

        <h1
            style="
            text-align:center;
            margin:30px;
            "
        >
            ${word}
        </h1>

        <input
            class="number-input"
            id="type-input"
            placeholder="Type here"
        >

        <button
            class="game-button"
            id="type-submit"
        >
            Submit
        </button>

        <p
            class="game-message"
            id="type-msg"
        ></p>

    `;


    $("type-input").focus();


    $("type-input").oninput = () => {

        if (!start) {

            start =
                performance.now();

        }

    };


    $("type-submit").onclick = () => {

        if (
            $("type-input").value === word
        ) {

            const seconds =
                (
                    (
                        performance.now() -
                        start
                    ) /
                    1000
                ).toFixed(2);


            $("type-msg")
                .textContent =
                `Correct in ${seconds}s!`;


            recordScore(
                "typing",
                Math.max(
                    1,
                    Math.round(
                        100 /
                        Math.max(
                            .01,
                            seconds
                        )
                    )
                ),
                Math.max(
                    2,
                    Math.round(
                        20 /
                        Math.max(
                            .01,
                            seconds
                        )
                    )
                )
            );

        } else {

            $("type-msg")
                .textContent =
                "Not quite!";

        }

    };

}


/* =========================================================
   MATH RUSH
   ========================================================= */

function buildMath(stage) {

    stage.innerHTML = `

        <div class="game-score">

            Score
            <span id="math-score">0</span>

        </div>

        <p
            class="game-message"
            id="math-question"
        ></p>

        <input
            class="number-input"
            id="math-input"
            type="number"
            placeholder="Answer"
        >

        <button
            class="game-button"
            onclick="answerMath()"
        >
            Answer
        </button>

        <p
            class="game-message"
            id="math-msg"
        ></p>

    `;

    newMath();

}


function newMath() {

    window.ma =
        Math.floor(
            Math.random() * 12
        ) + 2;

    window.mb =
        Math.floor(
            Math.random() * 12
        ) + 2;

    window.mop =
        Math.random() < .5
            ? "+"
            : "×";

    $("math-question")
        .textContent =
        `${ma} ${mop} ${mb} = ?`;

    $("math-input").value = "";

}


function answerMath() {

    const answer =
        mop === "+"
            ? ma + mb
            : ma * mb;


    if (
        Number(
            $("math-input").value
        ) === answer
    ) {

        $("math-score")
            .textContent =
            Number(
                $("math-score")
                    .textContent
            ) + 1;

        addCoins(3);

        $("math-msg")
            .textContent =
            "Correct!";

        newMath();

    } else {

        $("math-msg")
            .textContent =
            "Try again.";

    }

}


/* =========================================================
   BRICK BREAKER
   ========================================================= */

function buildBricks(stage) {

    stage.innerHTML = `

        <div class="game-score">

            Score
            <span id="brick-score">0</span>

        </div>

        <canvas
            class="game-canvas"
            id="brick-canvas"
            width="300"
            height="300"
        ></canvas>

        <button
            class="game-button"
            onclick="startBricks()"
        >
            Restart
        </button>

    `;

    startBricks();

}


function startBricks() {

    clearInterval(
        window.brickTimer
    );

    const canvas =
        $("brick-canvas");

    if (!canvas) return;

    const context =
        canvas.getContext("2d");

    let ballX = 150;
    let ballY = 260;

    let dx = 2.5;
    let dy = -2.5;

    let paddle = 115;
    let score = 0;

    const bricks = [];


    for (
        let row = 0;
        row < 4;
        row++
    ) {

        for (
            let column = 0;
            column < 6;
            column++
        ) {

            bricks.push({

                x:
                    10 +
                    column * 47,

                y:
                    30 +
                    row * 25,

                active: true

            });

        }

    }


    canvas.onmousemove =
        event => {

            const rect =
                canvas.getBoundingClientRect();

            paddle =
                event.clientX -
                rect.left -
                35;

            paddle =
                Math.max(
                    0,
                    Math.min(
                        230,
                        paddle
                    )
                );

        };


    window.brickTimer =
        setInterval(() => {

            context.fillStyle =
                "#080c14";

            context.fillRect(
                0,
                0,
                300,
                300
            );


            context.fillStyle =
                "#765cff";

            bricks.forEach(brick => {

                if (brick.active) {

                    context.fillRect(
                        brick.x,
                        brick.y,
                        40,
                        17
                    );

                }

            });


            context.fillStyle =
                "#ffffff";

            context.fillRect(
                paddle,
                280,
                70,
                8
            );


            context.beginPath();

            context.arc(
                ballX,
                ballY,
                6,
                0,
                Math.PI * 2
            );

            context.fill();


            ballX += dx;
            ballY += dy;


            if (
                ballX < 6 ||
                ballX > 294
            ) {

                dx *= -1;

            }


            if (ballY < 6) {

                dy *= -1;

            }


            if (
                ballY > 270 &&
                ballX > paddle &&
                ballX < paddle + 70
            ) {

                dy =
                    -Math.abs(dy);

            }


            bricks.forEach(brick => {

                if (

                    brick.active &&

                    ballX > brick.x &&
                    ballX < brick.x + 40 &&
                    ballY > brick.y &&
                    ballY < brick.y + 17

                ) {

                    brick.active = false;

                    dy *= -1;

                    score += 10;

                    addCoins(1);

                    $("brick-score")
                        .textContent =
                        score;

                }

            });


            if (ballY > 300) {

                clearInterval(
                    brickTimer
                );

                recordScore(
                    "bricks",
                    score,
                    Math.floor(
                        score / 10
                    )
                );

            }

        }, 16);

}


/* =========================================================
   PONG
   ========================================================= */

function buildPong(stage) {

    stage.innerHTML = `

        <div class="game-score">

            Score
            <span id="pong-score">0</span>

        </div>

        <canvas
            class="game-canvas"
            id="pong-canvas"
            width="300"
            height="300"
        ></canvas>

        <p class="game-message">
            Move the mouse to control your paddle.
        </p>

        <button
            class="game-button"
            onclick="startPong()"
        >
            Restart
        </button>

    `;

    startPong();

}


function startPong() {

    clearInterval(
        window.pongTimer
    );

    const canvas =
        $("pong-canvas");

    if (!canvas) return;

    const context =
        canvas.getContext("2d");

    let playerY = 120;
    let enemyY = 120;

    let ballX = 150;
    let ballY = 150;

    let dx = 3;
    let dy = 2;

    let score = 0;


    canvas.onmousemove =
        event => {

            const rect =
                canvas.getBoundingClientRect();

            playerY =
                event.clientY -
                rect.top -
                30;

            playerY =
                Math.max(
                    0,
                    Math.min(
                        240,
                        playerY
                    )
                );

        };


    window.pongTimer =
        setInterval(() => {

            context.fillStyle =
                "#080c14";

            context.fillRect(
                0,
                0,
                300,
                300
            );


            enemyY +=
                (
                    ballY -
                    (enemyY + 30)
                ) * .04;


            ballX += dx;
            ballY += dy;


            if (
                ballY < 5 ||
                ballY > 295
            ) {

                dy *= -1;

            }


            if (
                ballX < 20 &&
                ballY > playerY &&
                ballY < playerY + 60
            ) {

                dx =
                    Math.abs(dx);

                score++;

            }


            if (
                ballX > 280 &&
                ballY > enemyY &&
                ballY < enemyY + 60
            ) {

                dx =
                    -Math.abs(dx);

            }


            if (
                ballX < 0 ||
                ballX > 300
            ) {

                ballX = 150;
                ballY = 150;

            }


            context.fillStyle =
                "#ffffff";

            context.fillRect(
                8,
                playerY,
                8,
                60
            );

            context.fillRect(
                284,
                enemyY,
                8,
                60
            );


            context.beginPath();

            context.arc(
                ballX,
                ballY,
                6,
                0,
                Math.PI * 2
            );

            context.fill();


            $("pong-score")
                .textContent =
                score;

        }, 16);

}


/* =========================================================
   2048
   ========================================================= */

function build2048(stage) {

    stage.innerHTML = `

        <div class="game-score tetris-stats">
            <span>Score <b id="s2048">0</b></span>
            <span>Best <b id="best2048">0</b></span>
        </div>

        <div class="drop2048-launcher">
            <p class="drop2048-label">AIM BEFORE IT LANDS · DROP ANYTIME</p>
            <button class="drop2048-current" id="piece2048" type="button" aria-label="Current number block"></button>
        </div>

        <div class="grid2048 drop2048-board" id="grid2048" role="grid" aria-label="2048 Drop board, 5 columns by 8 rows"></div>

        <p class="game-message" id="status2048" aria-live="polite">Line up the number, then drop it into a column.</p>

        <div class="controls game-2048-controls" aria-label="Aim and drop number block">
            <button type="button" data-2048="left" aria-label="Aim left">←</button>
            <button type="button" data-2048="drop" aria-label="Drop number block">Drop</button>
            <button type="button" data-2048="right" aria-label="Aim right">→</button>
        </div>

        <button class="game-button" id="restart2048" type="button">New game</button>

    `;

    start2048();
    stage.querySelectorAll("[data-2048]").forEach(button => {
        button.addEventListener("click", () => move2048(button.dataset["2048"]));
    });
    stage.querySelector("#restart2048").addEventListener("click", start2048);
    const grid = stage.querySelector("#grid2048");
    const piece = stage.querySelector("#piece2048");
    let dragging = false;
    let dragged = false;
    let pointerStart = null;
    grid.addEventListener("pointermove", event => {
        const bounds = grid.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right) return;
        const column = Math.max(0, Math.min(4, Math.floor((event.clientX - bounds.left) / bounds.width * 5)));
        aim2048(column);
    });
    piece.addEventListener("pointerdown", event => {
        if (window.over2048) return;
        dragging = true;
        dragged = false;
        pointerStart = { x: event.clientX, y: event.clientY };
        piece.setPointerCapture(event.pointerId);
    });
    piece.addEventListener("pointermove", event => {
        if (!dragging) return;
        if (pointerStart && Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 8) dragged = true;
        const bounds = grid.getBoundingClientRect();
        if (event.clientX >= bounds.left && event.clientX <= bounds.right) {
            aim2048(Math.max(0, Math.min(4, Math.floor((event.clientX - bounds.left) / bounds.width * 5))));
        }
    });
    piece.addEventListener("pointerup", event => {
        if (!dragging) return;
        dragging = false;
        const bounds = grid.getBoundingClientRect();
        if (dragged && event.clientY >= bounds.top && event.clientY <= bounds.bottom &&
            event.clientX >= bounds.left && event.clientX <= bounds.right) drop2048();
        pointerStart = null;
    });
    piece.addEventListener("pointercancel", () => { dragging = false; pointerStart = null; });
    grid.addEventListener("click", event => {
        const cell = event.target.closest("[data-col]");
        if (!cell) return;
        aim2048(Number(cell.dataset.col));
        drop2048();
    });
}


function start2048() {

    window.b2048 = Array(40).fill(0);

    window.sc2048 =
        0;
    window.won2048 = false;
    window.over2048 = false;
    window.aim2048Column = 2;
    window.current2048 = next2048Value();
    window.next2048 = next2048Value();
    window.fall2048Row = 0;

    draw2048();
    start2048Fall();

}


function next2048Value() {
    const roll = Math.random();
    return roll < .72 ? 2 : roll < .96 ? 4 : 8;
}


function draw2048() {
    const grid =
        $("grid2048");
    if (!grid) return;
    grid.replaceChildren();

    const landing = get2048Landing(window.b2048, window.aim2048Column, window.current2048);
    window.b2048.forEach((value, index) => {
        const row = Math.floor(index / 5);
        const column = index % 5;
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "tile2048";
        cell.setAttribute("role", "gridcell");
        cell.dataset.col = String(column);
        cell.dataset.value = String(value || 0);
        cell.classList.toggle("aimed", column === window.aim2048Column);
        if (landing && landing.index === index) {
            cell.textContent = String(landing.value);
            cell.dataset.value = String(landing.value);
            cell.classList.add("drop2048-preview");
            cell.setAttribute("aria-label", `Preview: ${landing.value} will land here in column ${column + 1}${value ? " after merging" : ""}`);
        } else if (value) {
            cell.textContent = String(value);
            cell.setAttribute("aria-label", `Row ${row + 1}, column ${column + 1}, ${value}`);
        } else {
            cell.setAttribute("aria-label", `Row ${row + 1}, column ${column + 1}, empty`);
        }
        cell.disabled = window.over2048;
        grid.appendChild(cell);
    });

    $("s2048").textContent = String(window.sc2048);
    $("best2048").textContent = Math.max(state.highScores["2048"] || 0, sc2048);
    const status = $("status2048");
    const piece = $("piece2048");
    if (piece) {
        piece.textContent = String(window.current2048);
        piece.dataset.value = String(window.current2048);
        piece.disabled = window.over2048;
        piece.setAttribute("aria-label", `Drag to aim and release to drop ${window.current2048}`);
    }
    if (status && !window.over2048 && !window.won2048) {
        status.textContent = landing
            ? `Column ${window.aim2048Column + 1} · ${landing.value} lands on row ${Math.floor(landing.index / 5) + 1}`
            : "That column is full. Aim for another column.";
    }
    render2048FallingBlock();
}

function get2048DropRow(column) {
    if (!Array.isArray(window.b2048) || !Number.isInteger(column) || column < 0 || column >= 5) return null;
    let row = 0;
    while (row < 7 && !window.b2048[(row + 1) * 5 + column]) row++;
    return window.b2048[row * 5 + column] ? null : row;
}

function render2048FallingBlock() {
    const grid = $("grid2048");
    if (!grid || window.over2048) return;
    let block = grid.querySelector(".drop2048-falling-block");
    if (!block) {
        block = document.createElement("div");
        block.className = "drop2048-falling-block";
        block.setAttribute("aria-hidden", "true");
        grid.appendChild(block);
    }

    const landingRow = get2048DropRow(window.aim2048Column);
    if (landingRow === null) {
        block.hidden = true;
        return;
    }
    const row = Math.min(window.fall2048Row || 0, landingRow);
    const cell = grid.children[row * 5 + window.aim2048Column];
    if (!cell) return;
    block.hidden = false;
    block.textContent = String(window.current2048);
    block.dataset.value = String(window.current2048);
    block.style.left = `${cell.offsetLeft}px`;
    block.style.top = `${cell.offsetTop}px`;
    block.style.width = `${cell.offsetWidth}px`;
    block.style.height = `${cell.offsetHeight}px`;
}

function start2048Fall() {
    clearInterval(window.fall2048Timer);
    if (!$("grid2048") || window.over2048) return;
    window.fall2048Timer = setInterval(tick2048Fall, 280);
}

function tick2048Fall() {
    if (!$("grid2048") || window.over2048) {
        clearInterval(window.fall2048Timer);
        window.fall2048Timer = null;
        return;
    }
    const landingRow = get2048DropRow(window.aim2048Column);
    if (landingRow === null) {
        update2048Aim();
        return;
    }
    if (window.fall2048Row >= landingRow) {
        drop2048();
        return;
    }
    window.fall2048Row++;
    update2048Aim();
}


function aim2048(column) {
    if (window.over2048) return;
    const nextColumn = Math.max(0, Math.min(4, column));
    if (nextColumn === window.aim2048Column) return;
    window.aim2048Column = nextColumn;
    const landingRow = get2048DropRow(nextColumn);
    if (landingRow !== null && window.fall2048Row >= landingRow) {
        drop2048();
        return;
    }
    update2048Aim();
}

function update2048Aim() {
    const grid = $("grid2048");
    if (!grid) return;
    [...grid.children].forEach((cell, index) => {
        const row = Math.floor(index / 5);
        const column = index % 5;
        cell.classList.toggle("aimed", column === window.aim2048Column);
        if (cell.classList.contains("drop2048-preview")) {
            const value = window.b2048[index];
            cell.classList.remove("drop2048-preview");
            cell.dataset.value = String(value || 0);
            cell.textContent = value ? String(value) : "";
            cell.setAttribute("aria-label", value
                ? `Row ${row + 1}, column ${column + 1}, ${value}`
                : `Row ${row + 1}, column ${column + 1}, empty`);
        }
    });
    const landing = get2048Landing(window.b2048, window.aim2048Column, window.current2048);
    if (landing) {
        const cell = grid.children[landing.index];
        cell.textContent = String(landing.value);
        cell.dataset.value = String(landing.value);
        cell.classList.add("drop2048-preview");
        cell.setAttribute("aria-label", `Preview: ${landing.value} will land here in column ${window.aim2048Column + 1}`);
    }
    const status = $("status2048");
    if (status && !window.over2048 && !window.won2048) {
        status.textContent = landing
            ? `Column ${window.aim2048Column + 1} · ${landing.value} lands on row ${Math.floor(landing.index / 5) + 1}`
            : "That column is full. Aim for another column.";
    }
    render2048FallingBlock();
}

function move2048(direction) {
    if (direction === "drop" || direction === "down" || direction === "up") {
        drop2048();
        return;
    }
    if (direction === "left") shift2048Aim(-1);
    if (direction === "right") shift2048Aim(1);
}

function shift2048Aim(offset) {
    aim2048((window.aim2048Column + offset + 5) % 5);
}

function get2048Landing(board, column, value) {
    if (!Array.isArray(board) || board.length !== 40 || !Number.isInteger(column) || column < 0 || column >= 5 ||
        !Number.isInteger(value) || value < 2 || (value & (value - 1)) !== 0) return null;
    const cells = board.map((number, index) => number ? { value: number, id: `tile-${index}` } : null);
    const falling = { value, id: "falling" };
    let row = 7;
    while (row >= 0 && cells[row * 5 + column]) row--;
    if (row < 0) return null;
    cells[row * 5 + column] = falling;
    let score = 0;
    let merges = 0;

    const settle = () => {
        for (let x = 0; x < 5; x++) {
            const stack = [];
            for (let y = 7; y >= 0; y--) {
                const tile = cells[y * 5 + x];
                if (tile) stack.push(tile);
            }
            for (let y = 7; y >= 0; y--) cells[y * 5 + x] = stack[7 - y] || null;
        }
    };

    while (true) {
        const index = cells.indexOf(falling);
        const x = index % 5;
        const y = Math.floor(index / 5);
        const neighbors = [
            [x, y + 1], [x - 1, y], [x + 1, y], [x, y - 1]
        ];
        const match = neighbors
            .filter(([nx, ny]) => nx >= 0 && nx < 5 && ny >= 0 && ny < 8)
            .map(([nx, ny]) => ny * 5 + nx)
            .find(neighborIndex => cells[neighborIndex]?.value === falling.value);
        if (match === undefined) break;
        cells[match] = null;
        falling.value *= 2;
        score += falling.value;
        merges++;
        settle();
    }
    return {
        board: cells.map(tile => tile?.value || 0),
        value: falling.value,
        index: cells.indexOf(falling),
        score,
        merges
    };
}

function drop2048() {
    if (!window.b2048 || window.over2048) return;
    const landing = get2048Landing(window.b2048, window.aim2048Column, window.current2048);
    if (!landing) {
        $("status2048").textContent = "That column is full. Aim for another column.";
        return;
    }
    clearInterval(window.fall2048Timer);
    window.fall2048Timer = null;
    window.b2048 = landing.board;
    window.sc2048 += landing.score;
    if (window.sc2048 > (state.highScores["2048"] || 0)) {
        state.highScores["2048"] = window.sc2048;
        save();
        updateGameCenterStats();
    }
    window.current2048 = window.next2048;
    window.next2048 = next2048Value();

    if (window.b2048.some(value => value >= 2048) && !window.won2048) {
        window.won2048 = true;
        addCoins(100);
        toast("🏆 2048 reached!");
    }
    if (is2048GameOver()) {
        window.over2048 = true;
        $("status2048").textContent = `The stack reached the top · game over · ${window.sc2048} points`;
        recordScore("2048", window.sc2048);
    } else if (window.won2048) {
        $("status2048").textContent = "2048! Keep going and build an even bigger block.";
    }
    window.fall2048Row = 0;
    draw2048();
    if (!window.over2048) start2048Fall();
}

const BLOCK_BLAST_SHAPES = [
    { cells: [[0, 0]], color: "#51c9ff" },
    { cells: [[0, 0], [1, 0]], color: "#ff71a7" },
    { cells: [[0, 0], [0, 1]], color: "#ffc94a" },
    { cells: [[0, 0], [1, 0], [2, 0]], color: "#a77aff" },
    { cells: [[0, 0], [0, 1], [0, 2]], color: "#53e19b" },
    { cells: [[0, 0], [1, 0], [0, 1], [1, 1]], color: "#ff8b4d" },
    { cells: [[0, 0], [1, 0], [2, 0], [0, 1]], color: "#58d6ce" },
    { cells: [[0, 0], [1, 0], [2, 0], [1, 1]], color: "#ff6d68" },
    { cells: [[0, 0], [1, 0], [1, 1], [2, 1]], color: "#82a4ff" },
    { cells: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]], color: "#ed75d2" },
    { cells: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]], color: "#82d45b" }
];

function buildBlockBlast(stage) {
    stage.innerHTML = `
        <div class="block-blast-hud">
            <div class="block-blast-best">♛ <b id="block-blast-best">0</b></div>
            <div class="block-blast-score"><b id="block-blast-score">0</b><span>SCORE</span></div>
            <label class="block-blast-photo-button" for="block-blast-image" aria-label="Choose a picture for your blocks">▧</label>
        </div>
        <div id="block-blast-board" class="block-blast-board" role="group" aria-label="Block Blast 8 by 8 board"></div>
        <p id="block-blast-status" class="game-message block-blast-status" aria-live="polite">Drag a shape onto the board, or tap it and choose a spot.</p>
        <div id="block-blast-pieces" class="block-blast-pieces" role="group" aria-label="Available block shapes"></div>
        <div class="block-blast-image-controls">
            <input id="block-blast-image" type="file" accept="image/*" hidden>
            <button id="block-blast-image-clear" class="block-blast-image-clear" type="button" ${state.blockBlastImage ? "" : "hidden"}>Remove picture</button>
        </div>
        <div class="block-blast-footer">
            <span><b id="block-blast-clears">0</b> lines cleared</span>
            <button id="block-blast-restart" type="button">↻ New game</button>
        </div>
    `;
    stage.querySelector("#block-blast-restart").addEventListener("click", startBlockBlast);
    stage.querySelector("#block-blast-image").addEventListener("change", async event => {
        const [file] = event.target.files;
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            $("block-blast-status").textContent = "Choose an image file to decorate your blocks.";
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            $("block-blast-status").textContent = "Choose an image smaller than 10 MB.";
            return;
        }
        try {
            state.blockBlastImage = await resizeBlockBlastImage(file);
            save();
            renderBlockBlast();
            $("block-blast-status").textContent = "Your picture will appear on every block you place.";
        } catch (error) {
            console.error("Could not load Block Blast picture:", error);
            $("block-blast-status").textContent = "That picture could not be loaded. Try a different image.";
        }
    });
    stage.querySelector("#block-blast-image-clear").addEventListener("click", () => {
        state.blockBlastImage = "";
        save();
        renderBlockBlast();
        $("block-blast-status").textContent = "Picture removed. Blocks are back to their colors.";
    });
    stage.querySelector("#block-blast-pieces").addEventListener("pointerdown", event => {
        const piece = event.target.closest(".block-blast-piece:not(:disabled)");
        if (piece) window.blockBlastDraggingSlot = [...piece.parentElement.children].indexOf(piece);
    });
    if (!window.blockBlastDragReady) {
        window.blockBlastDragReady = true;
        document.addEventListener("pointerup", event => {
            const slot = window.blockBlastDraggingSlot;
            window.blockBlastDraggingSlot = null;
            clearBlockBlastPreview();
            if (slot === null || slot === undefined) return;
            const cell = document.elementFromPoint(event.clientX, event.clientY)?.closest(".block-blast-cell");
            if (!cell) return;
            const game = window.blockBlastState;
            if (!game || game.over || game.pieces[slot] === null) return;
            game.selected = slot;
            placeBlockBlastPiece(Number(cell.dataset.x), Number(cell.dataset.y));
        });
        document.addEventListener("pointercancel", () => {
            window.blockBlastDraggingSlot = null;
            clearBlockBlastPreview();
        });
        document.addEventListener("pointermove", event => {
            const game = window.blockBlastState;
            const slot = window.blockBlastDraggingSlot ?? game?.selected;
            if (slot === null || slot === undefined || !game || game.over || game.pieces[slot] === null) {
                clearBlockBlastPreview();
                return;
            }
            const target = document.elementFromPoint(event.clientX, event.clientY)?.closest(".block-blast-cell");
            if (!target) {
                clearBlockBlastPreview();
                return;
            }
            setBlockBlastPreview(slot, Number(target.dataset.x), Number(target.dataset.y));
        });
    }
    startBlockBlast();
}

function resizeBlockBlastImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(reader.error || new Error("Could not read the selected image"));
        reader.onload = () => {
            const image = new Image();
            image.onerror = () => reject(new Error("The selected file is not a usable image"));
            image.onload = () => {
                const scale = Math.min(1, 256 / Math.max(image.width, image.height));
                const canvas = document.createElement("canvas");
                canvas.width = Math.max(1, Math.round(image.width * scale));
                canvas.height = Math.max(1, Math.round(image.height * scale));
                const context = canvas.getContext("2d");
                if (!context) {
                    reject(new Error("Could not prepare the selected image"));
                    return;
                }
                context.drawImage(image, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL("image/jpeg", 0.78));
            };
            image.src = String(reader.result);
        };
        reader.readAsDataURL(file);
    });
}

function startBlockBlast() {
    window.blockBlastState = {
        board: Array.from({ length: 8 }, () => Array(8).fill(null)),
        pieces: [],
        selected: null,
        score: 0,
        clears: 0,
        over: false
    };
    refillBlockBlastPieces();
    renderBlockBlast();
}

function refillBlockBlastPieces() {
    const game = window.blockBlastState;
    game.pieces = Array.from({ length: 3 }, () => Math.floor(Math.random() * BLOCK_BLAST_SHAPES.length));
    game.selected = null;
    game.preview = null;
}

function clearBlockBlastPreview() {
    const game = window.blockBlastState;
    if (!game?.preview) return;
    game.preview = null;
    document.querySelectorAll(".block-blast-cell.preview-ghost, .block-blast-cell.preview-invalid")
        .forEach(cell => cell.classList.remove("preview-ghost", "preview-invalid"));
}

function setBlockBlastPreview(slot, anchorX, anchorY) {
    const game = window.blockBlastState;
    if (!game || game.over || game.pieces[slot] === null) return;
    const preview = { slot, anchorX, anchorY };
    if (game.preview && game.preview.slot === slot && game.preview.anchorX === anchorX && game.preview.anchorY === anchorY) return;
    clearBlockBlastPreview();
    game.preview = preview;
    const shape = BLOCK_BLAST_SHAPES[game.pieces[slot]];
    const valid = blockBlastCanPlace(game.board, shape, anchorX, anchorY);
    shape.cells.forEach(([x, y]) => {
        const target = document.querySelector(`.block-blast-cell[data-x="${anchorX + x}"][data-y="${anchorY + y}"]`);
        if (target) target.classList.add(valid ? "preview-ghost" : "preview-invalid");
    });
}

function blockBlastCanPlace(board, shape, anchorX, anchorY) {
    return shape.cells.every(([x, y]) => {
        const targetX = anchorX + x;
        const targetY = anchorY + y;
        return targetX >= 0 && targetX < 8 && targetY >= 0 && targetY < 8 && !board[targetY][targetX];
    });
}

function hasBlockBlastMove(game) {
    return game.pieces.some(shapeIndex => {
        if (shapeIndex === null) return false;
        const shape = BLOCK_BLAST_SHAPES[shapeIndex];
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (blockBlastCanPlace(game.board, shape, x, y)) return true;
            }
        }
        return false;
    });
}

function placeBlockBlastPiece(anchorX, anchorY) {
    const game = window.blockBlastState;
    if (!game || game.over || game.selected === null) return;
    const slot = game.selected;
    const shapeIndex = game.pieces[slot];
    const shape = BLOCK_BLAST_SHAPES[shapeIndex];
    if (!shape || !blockBlastCanPlace(game.board, shape, anchorX, anchorY)) {
        clearBlockBlastPreview();
        $("block-blast-status").textContent = "That shape does not fit there. Try another spot.";
        return;
    }

    clearBlockBlastPreview();
    shape.cells.forEach(([x, y]) => {
        game.board[anchorY + y][anchorX + x] = { color: shape.color };
    });
    game.score += shape.cells.length;
    game.pieces[slot] = null;
    game.selected = null;

    const fullRows = game.board.map((row, index) => row.every(Boolean) ? index : -1).filter(index => index >= 0);
    const fullColumns = Array.from({ length: 8 }, (_, column) => column)
        .filter(column => game.board.every(row => row[column]));
    const cleared = new Set();
    fullRows.forEach(row => {
        for (let column = 0; column < 8; column++) cleared.add(row * 8 + column);
    });
    fullColumns.forEach(column => {
        for (let row = 0; row < 8; row++) cleared.add(row * 8 + column);
    });
    if (cleared.size) {
        cleared.forEach(index => {
            game.board[Math.floor(index / 8)][index % 8] = null;
        });
        const lines = fullRows.length + fullColumns.length;
        game.clears += lines;
        game.score += lines * 10 + Math.max(0, lines - 1) * 5;
        $("block-blast-status").textContent = `${lines} ${lines === 1 ? "line" : "lines"} cleared!`;
    } else {
        $("block-blast-status").textContent = "Nice placement. Choose another block.";
    }

    if (game.score > (state.highScores["block-blast"] || 0)) {
        state.highScores["block-blast"] = game.score;
        save();
        updateGameCenterStats();
    }

    if (game.pieces.every(piece => piece === null)) refillBlockBlastPieces();
    if (!hasBlockBlastMove(game)) {
        game.over = true;
        $("block-blast-status").textContent = `No more moves · game over · ${game.score} points`;
        recordScore("block-blast", game.score);
    }
    renderBlockBlast();
}

function renderBlockBlast() {
    const game = window.blockBlastState;
    const board = $("block-blast-board");
    const tray = $("block-blast-pieces");
    if (!game || !board || !tray) return;
    const preview = game.preview;
    game.preview = null;

    board.replaceChildren();
    game.board.forEach((row, y) => row.forEach((cell, x) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "block-blast-cell";
        button.dataset.x = String(x);
        button.dataset.y = String(y);
        button.setAttribute("aria-label", `Row ${y + 1}, column ${x + 1}${cell ? ", occupied" : ", empty"}`);
        if (cell) {
            button.classList.add("filled");
            button.style.setProperty("--block-blast-color", cell.color);
            if (state.blockBlastImage) {
                button.classList.add("has-custom-image");
                button.style.backgroundImage = `linear-gradient(rgba(12, 20, 35, .18), rgba(12, 20, 35, .18)), url("${state.blockBlastImage}")`;
            }
        }
        button.disabled = game.over;
        button.addEventListener("click", () => placeBlockBlastPiece(x, y));
        board.appendChild(button);
    }));

    tray.replaceChildren();
    game.pieces.forEach((shapeIndex, slot) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "block-blast-piece";
        button.classList.toggle("selected", game.selected === slot);
        button.disabled = game.over || shapeIndex === null;
        button.setAttribute("aria-label", shapeIndex === null ? `Piece ${slot + 1} used` : `Select piece ${slot + 1}`);
        button.addEventListener("click", () => {
            game.selected = slot;
            $("block-blast-status").textContent = "Move over the board to preview, then tap to place.";
            renderBlockBlast();
        });
        if (shapeIndex !== null) {
            const shape = BLOCK_BLAST_SHAPES[shapeIndex];
            const width = Math.max(...shape.cells.map(([x]) => x)) + 1;
            const height = Math.max(...shape.cells.map(([, y]) => y)) + 1;
            const mini = document.createElement("span");
            mini.className = "block-blast-mini";
            mini.style.setProperty("--shape-width", width);
            mini.style.setProperty("--shape-height", height);
            shape.cells.forEach(([x, y]) => {
                const cell = document.createElement("i");
                cell.style.setProperty("--block-blast-color", shape.color);
                cell.style.setProperty("--shape-x", x + 1);
                cell.style.setProperty("--shape-y", y + 1);
                mini.appendChild(cell);
            });
            button.appendChild(mini);
        }
        tray.appendChild(button);
    });
    $("block-blast-score").textContent = game.score;
    $("block-blast-clears").textContent = game.clears;
    $("block-blast-best").textContent = Math.max(state.highScores["block-blast"] || 0, game.score);
    if (preview) setBlockBlastPreview(preview.slot, preview.anchorX, preview.anchorY);
    const clearImage = $("block-blast-image-clear");
    if (clearImage) clearImage.hidden = !state.blockBlastImage;
}

function is2048GameOver() {
    return window.b2048?.slice(0, 5).some(Boolean) || false;
}


document.addEventListener(
    "keydown",
    event => {

        if (
            ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key) &&
            window.b2048 &&
            $("games")?.classList.contains("playing-game") &&
            $("game-stage")?.dataset.gameId === "2048"
        ) {
            event.preventDefault();
            if (event.key === "ArrowLeft") move2048("left");
            else if (event.key === "ArrowRight") move2048("right");
            else move2048("drop");
        }


        if (
            event.key === "ArrowLeft" &&
            activeGameId === "dodge" &&
            typeof moveDodge === "function"
        ) {

            moveDodge(-1);

        }


        if (
            event.key === "ArrowRight" &&
            activeGameId === "dodge" &&
            typeof moveDodge === "function"
        ) {

            moveDodge(1);

        }


        if (
            event.code === "Space" &&
            $("game-title") &&
            $("game-title").textContent ===
            "Space Defender"
        ) {

            event.preventDefault();

            shootSpace();

        }

    }
);


/* =========================================================
   STORE
   ========================================================= */

const products = [

    {
        id: "double",
        icon: "⚡",
        name: "Double Clicker",
        desc: "Double clicker rewards.",
        price: 100
    },

    {
        id: "neon",
        icon: "🌈",
        name: "Neon Theme",
        desc: "Unlock the glowing theme.",
        price: 250
    },

    {
        id: "badge",
        icon: "⭐",
        name: "Pro Badge",
        desc: "Become a Pro player.",
        price: 500
    },

    {
        id: "coinBoost",
        icon: "🪙",
        name: "Coin Booster",
        desc: "Double all coin rewards.",
        price: 750
    }

];


function renderStore() {

    const box =
        $("store-list");

    if (!box) return;

    box.innerHTML = "";


    products.forEach(product => {

        const owned =
            state.owned[product.id];

        const item =
            document.createElement("div");

        item.className =
            "store-item";

        item.innerHTML = `

            <div class="store-icon">
                ${product.icon}
            </div>

            <div class="store-info">

                <b>${product.name}</b>

                <p>${product.desc}</p>

            </div>

            <button class="buy">
                ${
                    owned
                        ? "OWNED"
                        : product.price + " 🪙"
                }
            </button>

        `;


        item
            .querySelector(".buy")
            .onclick = () => {

                if (owned) return;


                if (
                    state.coins <
                    product.price
                ) {

                    toast(
                        "Not enough coins"
                    );

                    return;

                }


                state.coins -=
                    product.price;

                state.owned[
                    product.id
                ] = true;


                if (
                    product.id === "neon"
                ) {

                    state.neon = true;

                }


                save();
                applySettings();
                updateUI();

                toast(
                    "🛍️ Purchase complete!"
                );

            };


        box.appendChild(item);

    });

}


/* =========================================================
   ACHIEVEMENTS
   ========================================================= */

const achievements = [

    {
        id: "first",
        icon: "🌱",
        name: "First Coins",
        desc: "Earn your first coin.",
        ok: () => state.coins >= 1
    },

    {
        id: "hundred",
        icon: "💯",
        name: "Coin Century",
        desc: "Reach 100 coins.",
        ok: () => state.coins >= 100
    },

    {
        id: "level5",
        icon: "⭐",
        name: "Level 5",
        desc: "Reach level 5.",
        ok: () => level() >= 5
    },

    {
        id: "gamer",
        icon: "🎮",
        name: "Gamer",
        desc: "Play 5 different games.",
        ok: () =>
            Object.keys(
                state.highScores
            ).length >= 5
    },

    {
        id: "memory",
        icon: "🧠",
        name: "Memory Master",
        desc: "Clear Memory Match.",
        ok: () =>
            state.highScores.memory >= 8
    },

    {
        id: "tower",
        icon: "🏗️",
        name: "Tower Builder",
        desc: "Stack 10 blocks.",
        ok: () =>
            state.highScores.stack >= 10
    },

    {
        id: "two048",
        icon: "🔢",
        name: "Big Number",
        desc: "Reach 2048.",
        ok: () =>
            state.highScores["2048"] >= 2048
    },

    {
        id: "rich",
        icon: "💎",
        name: "Digital Rich",
        desc: "Reach 1,000 coins.",
        ok: () =>
            state.coins >= 1000
    }

];


function checkAchievements() {

    achievements.forEach(achievement => {

        if (

            !state.achievements.includes(
                achievement.id
            ) &&

            achievement.ok()

        ) {

            state.achievements.push(
                achievement.id
            );

            toast(
                "🏆 " +
                achievement.name +
                " unlocked!"
            );

        }

    });

}


function renderAchievements() {

    const box =
        $("achievements");

    if (!box) return;

    box.innerHTML = "";


    achievements.forEach(achievement => {

        const unlocked =
            state.achievements.includes(
                achievement.id
            );

        const item =
            document.createElement("div");

        item.className =
            "achievement" +
            (
                unlocked
                    ? ""
                    : " locked"
            );

        item.innerHTML = `

            <span>${achievement.icon}</span>

            <b>${achievement.name}</b>

            <small>${achievement.desc}</small>

        `;

        box.appendChild(item);

    });


    if ($("achievement-count")) {

        $("achievement-count")
            .textContent =
            `${state.achievements.length}/${achievements.length}`;

    }

}


/* =========================================================
   UI
   ========================================================= */

function updateUI() {

    const currentLevel =
        level();


    [
        "home-coins",
        "games-coins",
        "store-coins"
    ].forEach(id => {

        if ($(id)) {

            $(id).textContent =
                Math.floor(
                    state.coins
                );

        }

    });


    if ($("home-level")) {

        $("home-level").textContent =
            currentLevel;

    }


    if ($("hero-level")) {

        $("hero-level").textContent =
            currentLevel;

    }


    if ($("games-level")) {

        $("games-level").textContent =
            currentLevel;

    }


    if ($("profile-level")) {

        $("profile-level").textContent =
            currentLevel;

    }


    if ($("home-xp")) {

        $("home-xp").textContent =
            state.xp;

    }


    if ($("profile-xp")) {

        $("profile-xp").textContent =
            `${state.xp} / 100 XP`;

    }


    if ($("profile-progress")) {

        $("profile-progress")
            .style.width =
            state.xp + "%";

    }


    if ($("quest-progress")) {

        $("quest-progress")
            .style.width =
            Math.min(
                100,
                state.questCoins
            ) + "%";

    }


    if ($("streak")) {

        $("streak").textContent =
            state.streak;

    }


    if ($("profile-badge")) {

        $("profile-badge")
            .textContent =
            state.owned.badge
                ? "SlotPhone Pro"
                : "Rookie";

    }


    if ($("games-best")) {

        const scores =
            Object.values(
                state.highScores
            );

        $("games-best")
            .textContent =
            scores.length
                ? Math.max(...scores)
                : 0;

    }


    if ($("note-count")) {

        $("note-count")
            .textContent =
            state.notes.length +
            " characters";

    }


    updateSettingButton(
        "dark-toggle",
        state.dark
    );

    updateSettingButton(
        "neon-toggle",
        state.neon
    );

    updateSettingButton(
        "sound-toggle",
        state.sound
    );

    updateSettingButton(
        "notify-toggle",
        state.notifications
    );


    renderStore();
    renderAchievements();


    renderGames(
        document
            .querySelector(".filter.active")
            ?.dataset.filter ||
        "all"
    );

    renderGameApps();


    applySettings();

}


function updateSettingButton(
    id,
    enabled
) {

    const button =
        $(id);

    if (!button) return;

    button.textContent =
        enabled
            ? "ON"
            : "OFF";

    button.className =
        enabled
            ? "on"
            : "";

}


function applySettings() {

    document.body.classList.toggle(
        "light",
        !state.dark
    );

    document.body.classList.toggle(
        "neon",
        state.neon
    );

}


/* =========================================================
   SETTINGS
   ========================================================= */

if ($("dark-toggle")) {

    $("dark-toggle").onclick = () => {

        state.dark =
            !state.dark;

        save();
        updateUI();

    };

}


if ($("neon-toggle")) {

    $("neon-toggle").onclick = () => {

        state.neon =
            !state.neon;

        save();
        updateUI();

    };

}


if ($("sound-toggle")) {

    $("sound-toggle").onclick = () => {

        state.sound =
            !state.sound;

        save();
        updateUI();

    };

}


if ($("notify-toggle")) {

    $("notify-toggle").onclick = () => {

        state.notifications =
            !state.notifications;

        save();
        updateUI();

    };

}


if ($("reset-data")) {

    $("reset-data").onclick = () => {

        if (
            confirm(
                "Reset all SlotPhone progress?"
            )
        ) {

            localStorage.removeItem(
                SAVE_KEY
            );

            location.reload();

        }

    };

}


/* =========================================================
   NOTES
   ========================================================= */

if ($("notes-area")) {

    $("notes-area").value =
        state.notes;
    $("notes-title").value =
        state.noteTitle || "";

    const updateNotesStatus = () => {
        const status = $("notes-save-status");
        const count = $("notes-character-count");
        if (status) {
            status.textContent = `Saved · ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
        }
        if (count) {
            const characters = $("notes-area").value.length;
            count.textContent = `${characters} ${characters === 1 ? "character" : "characters"}`;
        }
    };

    const saveNotes = () => {
        state.notes = $("notes-area").value;
        state.noteTitle = $("notes-title").value;
        save();
        updateNotesStatus();
    };

    $("notes-area").addEventListener("input", saveNotes);
    $("notes-title").addEventListener("input", saveNotes);
    updateNotesStatus();

}


function noteAction(action) {
    const notes = $("notes-area");
    if (!notes) return;

    if (action === "clear") {
        if (!notes.value && !$("notes-title").value) return;
        if (!confirm("Clear this note?")) return;
        notes.value = "";
        $("notes-title").value = "";
    } else {
        const insertion = action === "date"
            ? new Date().toLocaleDateString()
            : action === "checklist"
                ? "☐ "
                : action === "star"
                    ? "⭐ "
                    : action === "bold"
                        ? "** "
                        : "";
        if (!insertion) return;
        const start = notes.selectionStart ?? notes.value.length;
        const end = notes.selectionEnd ?? start;
        notes.setRangeText(insertion, start, end, "end");
    }

    notes.dispatchEvent(new Event("input", { bubbles: true }));
    notes.focus();
}


/* =========================================================
   CALCULATOR
   ========================================================= */

let calculation = "";


function calcAction(value) {

    if (value === "clear") {

        calculation = "";

    }

    else if (value === "delete" || value === "back") {

        calculation =
            calculation.slice(
                0,
                -1
            );

    }

    else if (value === "=") {

        try {

            if (
                !/^[0-9+\-*/%.() ]+$/
                    .test(
                        calculation
                    )
            ) {

                throw new Error();

            }

            calculation =
                String(
                    Function(
                        '"use strict";return(' +
                        calculation +
                        ')'
                    )()
                );

        } catch {

            calculation =
                "Error";

        }

    }

    else {

        if (calculation === "Error") {
            calculation = "";
        }

        calculation +=
            value;

    }


    if ($("calc-display")) {

        $("calc-display")
            .value =
            calculation ||
            "0";

    }

}


/* =========================================================
   SLOTIFY
   ========================================================= */

const songs = [

    {
        title: "Midnight Drive",
        artist: "SlotPhone Studios",
        file: "music/1.mp3",
        image: "images/1.jpg"
    },

    {
        title: "Pixel Dreams",
        artist: "Digital Waves",
        file: "music/2.mp3",
        image: "images/2.jpg"
    },

    {
        title: "Cloud Nine",
        artist: "Skyline",
        file: "music/3.mp3",
        image: "images/3.jpg"
    },

    {
        title: "Sunset Loop",
        artist: "Neon Nights",
        file: "music/4.mp3",
        image: "images/4.jpg"
    },

    {
        title: "Space Station",
        artist: "Orbit Music",
        file: "music/5.mp3",
        image: "images/5.jpg"
    },

    {
        title: "Electric Highway",
        artist: "Future Sound",
        file: "music/6.mp3",
        image: "images/6.jpg"
    }

];


let song =
    state.lastSong || 0;

let playing = false;

let musicFilterMode =
    "all";

let musicSearch =
    "";

const audio =
    $("music-audio");


if (audio) {

    audio.volume =
        state.volume;

}


/* =========================================================
   MUSIC HELPERS
   ========================================================= */

function formatTime(seconds) {

    if (
        !Number.isFinite(seconds)
    ) {

        return "0:00";

    }


    const minutes =
        Math.floor(
            seconds / 60
        );

    const remaining =
        Math.floor(
            seconds % 60
        );

    return (
        minutes +
        ":" +
        String(
            remaining
        ).padStart(
            2,
            "0"
        )
    );

}


function loadSong(
    index,
    autoplay = false
) {

    if (!songs[index]) {
        index = 0;
    }

    song = index;

    const current =
        songs[song];

    state.lastSong =
        song;

    save();


    if ($("song-name")) {

        $("song-name")
            .textContent =
            current.title;

    }


    if ($("song-artist")) {

        $("song-artist")
            .textContent =
            current.artist;

    }


    if ($("song-image")) {

        $("song-image").src =
            current.image;

        $("song-image").alt =
            current.title +
            " album artwork";

    }


    if (audio) {

        audio.src =
            current.file;

        audio.load();

    }


    updateFavoriteButton();
    renderPlaylist();


    if (autoplay) {

        playMusic();

    } else {

        setMusicPlayingUI(false);

    }


    if ($("music-status")) {

        $("music-status")
            .textContent =
            autoplay
                ? "Playing"
                : "Ready to play";

    }

}


async function playMusic() {

    if (!audio) return;

    try {

        await audio.play();

        playing = true;

        setMusicPlayingUI(true);

        if ($("music-status")) {

            $("music-status")
                .textContent =
                "Now playing";

        }

    } catch {

        if ($("music-status")) {

            $("music-status")
                .textContent =
                "Add an MP3 to the music folder";

        }

        playing = false;

        setMusicPlayingUI(false);

    }

}


function pauseMusic() {

    if (!audio) return;

    audio.pause();

    playing = false;

    setMusicPlayingUI(false);

    if ($("music-status")) {

        $("music-status")
            .textContent =
            "Paused";

    }

}


function toggleMusic() {

    if (playing) {

        pauseMusic();

    } else {

        playMusic();

    }

}


function setMusicPlayingUI(isPlaying) {

    playing =
        isPlaying;


    const button =
        $("play-song");

    if (button) {

        button.textContent =
            isPlaying
                ? "⏸"
                : "▶";

    }


    const bars =
        $("playing-bars");

    if (bars) {

        bars.classList.toggle(
            "active",
            isPlaying
        );

    }


    const image =
        $("song-image");

    if (image) {

        image.classList.toggle(
            "playing",
            isPlaying
        );

    }

}


/* =========================================================
   MUSIC NEXT / PREVIOUS
   ========================================================= */

function nextSong() {

    if (state.shuffle) {

        let randomIndex;

        do {

            randomIndex =
                Math.floor(
                    Math.random() *
                    songs.length
                );

        } while (
            songs.length > 1 &&
            randomIndex === song
        );

        loadSong(
            randomIndex,
            true
        );

        return;

    }


    song++;

    if (
        song >= songs.length
    ) {

        song = 0;

    }

    loadSong(
        song,
        true
    );

}


function previousSong() {

    if (
        audio &&
        audio.currentTime > 3
    ) {

        audio.currentTime = 0;

        return;

    }


    song--;

    if (song < 0) {

        song =
            songs.length - 1;

    }

    loadSong(
        song,
        true
    );

}


/* =========================================================
   FAVORITES
   ========================================================= */

function isFavorite(index) {

    return state.favorites.includes(
        index
    );

}


function updateFavoriteButton() {

    const button =
        $("favorite-song-button");

    if (!button) return;

    const favorite =
        isFavorite(song);

    button.textContent =
        favorite
            ? "♥"
            : "♡";

    button.classList.toggle(
        "active",
        favorite
    );

}


function toggleFavorite() {

    const position =
        state.favorites.indexOf(
            song
        );


    if (position >= 0) {

        state.favorites.splice(
            position,
            1
        );

        toast(
            "Removed from favorites"
        );

    } else {

        state.favorites.push(
            song
        );

        toast(
            "❤️ Added to favorites"
        );

    }


    save();

    updateFavoriteButton();
    renderPlaylist();

}


/* =========================================================
   MUSIC SEARCH
   ========================================================= */

function filteredSongs() {

    return songs

        .map(
            (item, index) => ({
                ...item,
                index
            })
        )

        .filter(item => {

            const matchesSearch =
                (
                    item.title +
                    " " +
                    item.artist
                )
                    .toLowerCase()
                    .includes(
                        musicSearch
                            .toLowerCase()
                    );


            const matchesFavorite =
                musicFilterMode === "all" ||
                isFavorite(
                    item.index
                );


            return (
                matchesSearch &&
                matchesFavorite
            );

        });

}


/* =========================================================
   PLAYLIST
   ========================================================= */

function renderPlaylist() {

    const playlist =
        $("playlist");

    if (!playlist) return;

    playlist.innerHTML = "";


    const visibleSongs =
        filteredSongs();


    if ($("playlist-count")) {

        $("playlist-count")
            .textContent =
            `${visibleSongs.length} ${
                visibleSongs.length === 1
                    ? "song"
                    : "songs"
            }`;

    }


    if (
        visibleSongs.length === 0
    ) {

        playlist.innerHTML = `

            <div class="music-empty">

                <div>🎵</div>

                <h3>No songs found</h3>

                <p>
                    Try another search
                    or favorite a song.
                </p>

            </div>

        `;

        return;

    }


    visibleSongs.forEach(item => {

        const button =
            document.createElement("button");

        button.className =
            "playlist-song";


        if (
            item.index === song
        ) {

            button.classList.add(
                "active"
            );

        }


        button.innerHTML = `

            <span class="playlist-number">
                ${item.index + 1}
            </span>

            <img
                class="playlist-image"
                src="${item.image}"
                alt=""
            >

            <span class="playlist-song-info">

                <b>${item.title}</b>

                <small>${item.artist}</small>

            </span>

            ${
                isFavorite(item.index)
                    ? `
                        <span class="playlist-heart">
                            ♥
                        </span>
                    `
                    : ""
            }

            <span class="playlist-play">
                ${
                    item.index === song &&
                    playing
                        ? "♫"
                        : "▶"
                }
            </span>

        `;


        button.onclick = () => {

            loadSong(
                item.index,
                true
            );

        };


        playlist.appendChild(
            button
        );

    });

}


function playAll() {

    const visible =
        filteredSongs();

    if (!visible.length) {

        toast(
            "No songs to play"
        );

        return;

    }

    loadSong(
        visible[0].index,
        true
    );

}


function toggleShuffle() {

    state.shuffle =
        !state.shuffle;

    save();

    $("shuffle-song")
        ?.classList.toggle(
            "active",
            state.shuffle
        );

    toast(
        state.shuffle
            ? "🔀 Shuffle on"
            : "Shuffle off"
    );

}


function toggleRepeat() {

    state.repeat =
        !state.repeat;

    save();

    $("repeat-song")
        ?.classList.toggle(
            "active",
            state.repeat
        );

    toast(
        state.repeat
            ? "🔁 Repeat on"
            : "Repeat off"
    );

}


/* =========================================================
   MUSIC EVENTS
   ========================================================= */

if ($("music-search")) {

    $("music-search").addEventListener(
        "input",
        event => {

            musicSearch =
                event.target.value;

            renderPlaylist();

        }
    );

}


if ($("clear-music-search")) {

    $("clear-music-search").onclick =
        () => {

            $("music-search").value =
                "";

            musicSearch = "";

            renderPlaylist();

        };

}


if ($("favorite-song-button")) {

    $("favorite-song-button").onclick =
        toggleFavorite;

}


if ($("play-song")) {

    $("play-song").onclick =
        toggleMusic;

}


if ($("prev-song")) {

    $("prev-song").onclick =
        previousSong;

}


if ($("next-song")) {

    $("next-song").onclick =
        nextSong;

}


if ($("shuffle-song")) {

    $("shuffle-song").onclick =
        toggleShuffle;

}


if ($("repeat-song")) {

    $("repeat-song").onclick =
        toggleRepeat;

}


if ($("play-all")) {

    $("play-all").onclick =
        playAll;

}


/* =========================================================
   AUDIO EVENTS
   ========================================================= */

if (audio) {

    audio.addEventListener(
        "loadedmetadata",
        () => {

            if ($("music-duration")) {

                $("music-duration")
                    .textContent =
                    formatTime(
                        audio.duration
                    );

            }

        }
    );


    audio.addEventListener(
        "timeupdate",
        () => {

            if (
                !audio.duration
            ) return;


            const percent =
                (
                    audio.currentTime /
                    audio.duration
                ) * 100;


            if ($("music-seek")) {

                $("music-seek").value =
                    percent;

            }


            if ($("music-current")) {

                $("music-current")
                    .textContent =
                    formatTime(
                        audio.currentTime
                    );

            }

        }
    );


    audio.addEventListener(
        "play",
        () => {

            setMusicPlayingUI(true);
            renderPlaylist();

        }
    );


    audio.addEventListener(
        "pause",
        () => {

            setMusicPlayingUI(false);
            renderPlaylist();

        }
    );


    audio.addEventListener(
        "ended",
        () => {

            if (state.repeat) {

                audio.currentTime = 0;

                playMusic();

            } else {

                nextSong();

            }

        }
    );


    audio.addEventListener(
        "error",
        () => {

            setMusicPlayingUI(false);

            if ($("music-status")) {

                $("music-status")
                    .textContent =
                    "Couldn't load this MP3";

            }

        }
    );

}


/* =========================================================
   SEEK
   ========================================================= */

if ($("music-seek")) {

    $("music-seek").addEventListener(
        "input",
        event => {

            if (
                !audio ||
                !audio.duration
            ) return;

            audio.currentTime =
                (
                    Number(
                        event.target.value
                    ) / 100
                ) *
                audio.duration;

        }
    );

}


/* =========================================================
   VOLUME
   ========================================================= */

if ($("music-volume")) {

    $("music-volume").value =
        state.volume;

    $("music-volume").addEventListener(
        "input",
        event => {

            state.volume =
                Number(
                    event.target.value
                );

            if (audio) {

                audio.volume =
                    state.volume;

            }

            save();

        }
    );

}


/* =========================================================
   MUSIC MENU
   ========================================================= */

if ($("music-menu-button")) {

    $("music-menu-button").onclick =
        () => {

            $("music-menu")
                .classList.toggle(
                    "hidden"
                );

        };

}


if ($("clear-favorites")) {

    $("clear-favorites").onclick =
        () => {

            state.favorites = [];

            save();

            updateFavoriteButton();
            renderPlaylist();

            toast(
                "Favorites cleared"
            );

        };

}


if ($("reset-music")) {

    $("reset-music").onclick =
        () => {

            state.favorites = [];
            state.lastSong = 0;
            state.shuffle = false;
            state.repeat = false;
            state.volume = .70;

            song = 0;

            if (audio) {
                audio.volume = .70;
            }

            save();

            loadSong(
                0,
                false
            );

            $("shuffle-song")
                ?.classList.remove(
                    "active"
                );

            $("repeat-song")
                ?.classList.remove(
                    "active"
                );

            if ($("music-volume")) {

                $("music-volume").value =
                    .70;

            }

            toast(
                "Music settings reset"
            );

        };

}


/* =========================================================
   TIMER
   ========================================================= */

let timerSeconds = 300;
let timerRunning = false;
let timerInterval = null;


function updateTimer() {

    if (!$("timer-display")) return;

    const minutes =
        Math.floor(
            timerSeconds / 60
        );

    const seconds =
        timerSeconds % 60;


    $("timer-display")
        .textContent =
        `${String(
            minutes
        ).padStart(
            2,
            "0"
        )}:${String(
            seconds
        ).padStart(
            2,
            "0"
        )}`;

}


function setTimer(seconds) {

    timerSeconds =
        seconds;

    timerRunning =
        false;

    clearInterval(
        timerInterval
    );

    updateTimer();

}


if ($("timer-start")) {

    $("timer-start").onclick =
        () => {

            if (timerRunning) return;

            timerRunning = true;

            timerInterval =
                setInterval(
                    () => {

                        if (
                            timerSeconds <= 0
                        ) {

                            clearInterval(
                                timerInterval
                            );

                            timerRunning =
                                false;

                            toast(
                                "⏰ Timer finished!"
                            );

                            return;

                        }

                        timerSeconds--;

                        updateTimer();

                    },
                    1000
                );

        };

}


if ($("timer-pause")) {

    $("timer-pause").onclick =
        () => {

            timerRunning =
                false;

            clearInterval(
                timerInterval
            );

        };

}


if ($("timer-reset")) {

    $("timer-reset").onclick =
        () => {

            timerRunning =
                false;

            clearInterval(
                timerInterval
            );

            timerSeconds =
                300;

            updateTimer();

        };

}


/* =========================================================
   DAILY QUEST
   ========================================================= */

function updateDailyQuest() {

    const today =
        new Date()
            .toISOString()
            .slice(0, 10);


    if (
        state.lastDaily !== today
    ) {

        state.lastDaily =
            today;

        state.questCoins = 0;

        state.streak++;

        save();

    }


    if ($("quest-text")) {

        if (state.questCoins >= 100) {

            $("quest-text")
                .textContent =
                "Quest complete! 🎉";

        } else {

            $("quest-text")
                .textContent =
                `Earn ${
                    Math.max(
                        0,
                        100 - state.questCoins
                    )
                } more coins today.`;

        }

    }

}


/* =========================================================
   START EVERYTHING
   ========================================================= */

updateDailyQuest();

loadSong(
    song,
    false
);


if ($("shuffle-song")) {

    $("shuffle-song")
        .classList.toggle(
            "active",
            state.shuffle
        );

}


if ($("repeat-song")) {

    $("repeat-song")
        .classList.toggle(
            "active",
            state.repeat
        );

}


updateTimer();

updateUI();




/* =========================================================
   SLOT PHONE X — GAMEPLAY POLISH PACK
   These upgraded builders intentionally keep the existing
   game names, rewards, controls, and save system.
   ========================================================= */


/* =========================================================
   CANVAS BACKGROUND
   ========================================================= */

function gameCanvasFrame(ctx, w, h) {

    const g =
        ctx.createLinearGradient(
            0,
            0,
            w,
            h
        );

    g.addColorStop(
        0,
        "#070914"
    );

    g.addColorStop(
        .55,
        "#101525"
    );

    g.addColorStop(
        1,
        "#05070d"
    );

    ctx.fillStyle = g;

    ctx.fillRect(
        0,
        0,
        w,
        h
    );


    ctx.strokeStyle =
        "rgba(255,255,255,.045)";

    ctx.lineWidth = 1;


    for (
        let x = 0;
        x < w;
        x += 25
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            h
        );

        ctx.stroke();

    }


    for (
        let y = 0;
        y < h;
        y += 25
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            w,
            y
        );

        ctx.stroke();

    }

}


/* =========================================================
   ROUNDED CANVAS RECTANGLE
   ========================================================= */

function roundedCanvasRect(
    ctx,
    x,
    y,
    w,
    h,
    r
) {

    const radius =
        Math.min(
            r,
            w / 2,
            h / 2
        );


    ctx.beginPath();

    ctx.moveTo(
        x + radius,
        y
    );

    ctx.arcTo(
        x + w,
        y,
        x + w,
        y + h,
        radius
    );

    ctx.arcTo(
        x + w,
        y + h,
        x,
        y + h,
        radius
    );

    ctx.arcTo(
        x,
        y + h,
        x,
        y,
        radius
    );

    ctx.arcTo(
        x,
        y,
        x + w,
        y,
        radius
    );

    ctx.closePath();

}


/* =========================================================
   SNAKE PRO
   ========================================================= */

const SNAKE_GRID_SIZE = 20;

function buildSnake(stage) {

    stage.innerHTML = `
        <div class="game-score tetris-stats">
            <span>Apples <b id="snake-score">0</b></span>
            <span>Best <b id="snake-best">0</b></span>
            <span>Level <b id="snake-level">1</b></span>
        </div>
        <canvas class="game-canvas snake-canvas" id="snake-canvas" width="360" height="360"
            aria-label="Snake game board, 20 by 20 grid"></canvas>
        <div class="controls snake-controls" role="group" aria-label="Snake directions">
            <button type="button" aria-label="Turn up" onclick="snakeMove('up')">▲</button>
            <button type="button" aria-label="Turn left" onclick="snakeMove('left')">◀</button>
            <button type="button" aria-label="Turn down" onclick="snakeMove('down')">▼</button>
            <button type="button" aria-label="Turn right" onclick="snakeMove('right')">▶</button>
        </div>
        <p class="game-message" id="snake-status" aria-live="polite">Eat apples to grow. Avoid the walls and your tail.</p>
        <button class="game-button" type="button" id="snake-pause">Pause</button>
        <button class="game-button" type="button" id="snake-restart">New game</button>
    `;
    stage.querySelector("#snake-restart").addEventListener("click", startSnakeGame);
    stage.querySelector("#snake-pause").addEventListener("click", toggleSnakePause);
    const canvas = stage.querySelector("#snake-canvas");
    let swipeStart = null;
    canvas.addEventListener("pointerdown", event => {
        swipeStart = { x: event.clientX, y: event.clientY };
    });
    canvas.addEventListener("pointerup", event => {
        if (!swipeStart) return;
        const dx = event.clientX - swipeStart.x;
        const dy = event.clientY - swipeStart.y;
        swipeStart = null;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
        snakeMove(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : (dy < 0 ? "up" : "down"));
    });
    canvas.addEventListener("pointercancel", () => { swipeStart = null; });
    startSnakeGame();
}


function startSnakeGame() {
    clearInterval(window.snakeTimer);
    const canvas = $("snake-canvas");
    if (!canvas) return;
    window.snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
        { x: 7, y: 10 }
    ];
    window.snakeDir = { x: 1, y: 0 };
    window.snakeNextDir = { x: 1, y: 0 };
    window.snakeScore = 0;
    window.overSnake = false;
    window.snakePaused = false;
    window.snakeSpeed = 120;
    window.snakeFood = createSnakeFood(SNAKE_GRID_SIZE);
    const status = $("snake-status");
    if (status) status.textContent = "Eat apples to grow. Avoid the walls and your tail.";
    drawSnake();
    window.snakeTimer = setInterval(stepSnake, window.snakeSpeed);
}

function stepSnake() {
    if (!window.snake?.length || window.overSnake || window.snakePaused) return;
    window.snakeDir = { ...window.snakeNextDir };
    const head = window.snake[0];
    const next = { x: head.x + snakeDir.x, y: head.y + snakeDir.y };
    const eating = window.snakeFood && next.x === snakeFood.x && next.y === snakeFood.y;
    const hitWall = next.x < 0 || next.x >= SNAKE_GRID_SIZE || next.y < 0 || next.y >= SNAKE_GRID_SIZE;
    const collisionBody = eating ? snake : snake.slice(0, -1);
    const hitSelf = collisionBody.some(part => part.x === next.x && part.y === next.y);
    if (hitWall || hitSelf) {
        clearInterval(window.snakeTimer);
        window.overSnake = true;
        recordScore("snake", snakeScore, Math.floor(snakeScore / 10));
        if ($("snake-status")) $("snake-status").textContent = `Game over · ${snakeScore} apples · tap New game to play again`;
        showSnakeGameOver();
        return;
    }

    snake.unshift(next);
    if (eating) {
        snakeScore += 1;
        addCoins(1);
        if (snakeScore > (state.highScores.snake || 0)) {
            state.highScores.snake = snakeScore;
            save();
            updateGameCenterStats();
        }
        if (snake.length === SNAKE_GRID_SIZE * SNAKE_GRID_SIZE) {
            clearInterval(window.snakeTimer);
            window.overSnake = true;
            recordScore("snake", snakeScore, Math.floor(snakeScore / 10));
            if ($("snake-status")) $("snake-status").textContent = "Board cleared! You win!";
        } else {
            snakeFood = createSnakeFood(SNAKE_GRID_SIZE);
            if (snakeScore % 5 === 0) {
                window.snakeSpeed = Math.max(58, window.snakeSpeed - 8);
                clearInterval(window.snakeTimer);
                window.snakeTimer = setInterval(stepSnake, window.snakeSpeed);
            }
        }
    } else {
        snake.pop();
    }
    drawSnake();
}

function createSnakeFood(
    grid
) {
    const available = [];
    for (let y = 0; y < grid; y++) {
        for (let x = 0; x < grid; x++) {
            if (!window.snake?.some(part => part.x === x && part.y === y)) available.push({ x, y });
        }
    }
    return available.length ? available[Math.floor(Math.random() * available.length)] : null;
}


function drawSnake() {

    const canvas =
        $("snake-canvas");


    if (!canvas) return;


    const ctx =
        canvas.getContext("2d");


    const grid = 22;

    const cell =
        canvas.width / grid;


    gameCanvasFrame(

        ctx,

        canvas.width,

        canvas.height

    );


    /* Food */

    const fx =
        snakeFood.x *
        cell +
        cell / 2;


    const fy =
        snakeFood.y *
        cell +
        cell / 2;


    ctx.save();


    ctx.shadowBlur = 18;

    ctx.shadowColor =
        "#ff5575";


    ctx.fillStyle =
        "#ff5575";


    ctx.beginPath();

    ctx.arc(

        fx,

        fy,

        cell * .34,

        0,

        Math.PI * 2

    );

    ctx.fill();


    ctx.restore();


    /* Snake */

    snake.forEach(

        (part, index) => {

            const x =
                part.x * cell + 2;

            const y =
                part.y * cell + 2;


            const size =
                cell - 4;


            const gradient =

                ctx.createLinearGradient(

                    x,

                    y,

                    x + size,

                    y + size

                );


            if (
                index === 0
            ) {

                gradient.addColorStop(
                    0,
                    "#8cffc1"
                );

                gradient.addColorStop(
                    1,
                    "#20c77a"
                );

            } else {

                gradient.addColorStop(
                    0,
                    "#42e89b"
                );

                gradient.addColorStop(
                    1,
                    "#168b5c"
                );

            }


            ctx.fillStyle =
                gradient;


            ctx.shadowBlur =
                index === 0
                    ? 15
                    : 5;


            ctx.shadowColor =
                "#28e08b";


            roundedCanvasRect(

                ctx,

                x,

                y,

                size,

                size,

                6

            );


            ctx.fill();


            ctx.shadowBlur = 0;


            if (
                index === 0
            ) {

                ctx.fillStyle =
                    "#06100c";


                let eye1x =
                    x + size * .68;

                let eye1y =
                    y + size * .30;


                let eye2x =
                    x + size * .68;

                let eye2y =
                    y + size * .68;


                if (
                    snakeDir.x < 0
                ) {

                    eye1x =
                        x + size * .30;

                    eye2x =
                        x + size * .30;

                }


                if (
                    snakeDir.y < 0
                ) {

                    eye1x =
                        x + size * .30;

                    eye1y =
                        y + size * .30;

                    eye2x =
                        x + size * .68;

                    eye2y =
                        y + size * .30;

                }


                if (
                    snakeDir.y > 0
                ) {

                    eye1x =
                        x + size * .30;

                    eye1y =
                        y + size * .68;

                    eye2x =
                        x + size * .68;

                    eye2y =
                        y + size * .68;

                }


                ctx.beginPath();

                ctx.arc(
                    eye1x,
                    eye1y,
                    2,
                    0,
                    Math.PI * 2
                );

                ctx.fill();


                ctx.beginPath();

                ctx.arc(
                    eye2x,
                    eye2y,
                    2,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

            }

        }

    );


    const score =
        $("snake-score");


    if (score) {

        score.textContent =
            snakeScore;

    }

}

function drawSnake() {
    const canvas = $("snake-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cell = canvas.width / SNAKE_GRID_SIZE;

    for (let y = 0; y < SNAKE_GRID_SIZE; y++) {
        for (let x = 0; x < SNAKE_GRID_SIZE; x++) {
            ctx.fillStyle = (x + y) % 2 ? "#aad751" : "#a2d149";
            ctx.fillRect(x * cell, y * cell, cell, cell);
        }
    }

    if (snakeFood) {
        const fx = snakeFood.x * cell + cell / 2;
        const fy = snakeFood.y * cell + cell / 2;
        ctx.fillStyle = "#e84838";
        ctx.beginPath();
        ctx.arc(fx, fy, cell * .34, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#69452d";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(fx, fy - cell * .25);
        ctx.lineTo(fx + 2, fy - cell * .47);
        ctx.stroke();
        ctx.fillStyle = "#3e9b46";
        ctx.beginPath();
        ctx.ellipse(fx + cell * .16, fy - cell * .37, cell * .14, cell * .07, -.5, 0, Math.PI * 2);
        ctx.fill();
    }

    snake?.forEach((part, index) => {
        const inset = index ? 1.5 : 1;
        const x = part.x * cell + inset;
        const y = part.y * cell + inset;
        const size = cell - inset * 2;
        ctx.fillStyle = index ? "#4c9f27" : "#397d20";
        roundedCanvasRect(ctx, x, y, size, size, cell * .2);
        ctx.fill();
        if (index === 0) {
            ctx.fillStyle = "#fff";
            const eyeOffset = cell * .28;
            let eyes;
            if (snakeDir.x) {
                const ex = snakeDir.x > 0 ? x + size * .72 : x + size * .28;
                eyes = [[ex, y + size * .3], [ex, y + size * .7]];
            } else {
                const ey = snakeDir.y > 0 ? y + size * .72 : y + size * .28;
                eyes = [[x + size * .3, ey], [x + size * .7, ey]];
            }
            eyes.forEach(([ex, ey]) => {
                ctx.beginPath();
                ctx.arc(ex, ey, eyeOffset * .24, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    });

    const score = $("snake-score");
    if (score) score.textContent = String(snakeScore || 0);
    const best = $("snake-best");
    if (best) best.textContent = String(Math.max(state.highScores.snake || 0, snakeScore || 0));
    const level = $("snake-level");
    if (level) level.textContent = String(Math.floor((snakeScore || 0) / 5) + 1);
    const pauseButton = $("snake-pause");
    if (pauseButton) {
        pauseButton.textContent = window.snakePaused ? "Resume" : "Pause";
        pauseButton.disabled = Boolean(window.overSnake);
    }
    if (window.snakePaused) {
        ctx.fillStyle = "rgba(10, 18, 12, .68)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.font = "800 28px system-ui";
        ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
        ctx.font = "14px system-ui";
        ctx.fillText("Tap Resume or press P", canvas.width / 2, canvas.height / 2 + 25);
    }
}

function toggleSnakePause() {
    if (activeGameId !== "snake" || window.overSnake) return;
    window.snakePaused = !window.snakePaused;
    const status = $("snake-status");
    if (status) {
        status.textContent = window.snakePaused
            ? "Paused · tap Resume or press P to continue."
            : "Eat apples to grow. Avoid the walls and your tail.";
    }
    drawSnake();
}


function showSnakeGameOver() {

    const canvas =
        $("snake-canvas");


    if (!canvas) return;


    const ctx =
        canvas.getContext("2d");


    ctx.fillStyle =
        "rgba(3,5,10,.75)";


    ctx.fillRect(

        0,

        0,

        canvas.width,

        canvas.height

    );


    ctx.textAlign =
        "center";


    ctx.fillStyle =
        "#ffffff";


    ctx.font =
        "bold 28px Arial";


    ctx.fillText(

        "GAME OVER",

        canvas.width / 2,

        canvas.height / 2 - 10

    );


    ctx.font =
        "16px Arial";


    ctx.fillStyle =
        "#aeb7c9";


    ctx.fillText(

        `Score: ${snakeScore}`,

        canvas.width / 2,

        canvas.height / 2 + 22

    );

}


function snakeMove(
    direction
) {
    const directions = {
        up: { x: 0, y: -1 },
        down: { x: 0, y: 1 },
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 }
    };
    const next = directions[direction];
    if (!next || window.overSnake || !window.snake?.length) return;
    const current = window.snakeDir;
    if (next.x === -current.x && next.y === -current.y) return;
    window.snakeNextDir = next;

}


/* =========================================================
   BRICK BREAKER PRO
   ========================================================= */

function buildBricks(stage) {

    stage.innerHTML = `

        <div class="game-score">

            Score
            <span id="brick-score">
                0
            </span>

            · Lives
            <span id="brick-lives">
                3
            </span>

        </div>


        <canvas
            class="game-canvas"
            id="brick-canvas"
            width="360"
            height="460"
        ></canvas>


        <p class="game-message">

            Move your mouse or finger
            to control the paddle.

        </p>


        <button
            class="game-button"
            onclick="startBricks()"
        >

            Restart

        </button>

    `;


    startBricks();

}


function startBricks() {

    clearInterval(
        window.brickTimer
    );


    const canvas =
        $("brick-canvas");


    if (!canvas) return;


    const ctx =
        canvas.getContext("2d");


    const W =
        canvas.width;


    const H =
        canvas.height;


    window.brickState = {

        x: W / 2,

        y: H - 70,

        dx: 3.2,

        dy: -3.2,

        radius: 8,

        paddleX:
            W / 2 - 55,

        paddleWidth: 110,

        paddleHeight: 13,

        score: 0,

        lives: 3,

        bricks: []

    };


    const rows = 6;

    const cols = 7;

    const gap = 7;

    const side = 17;

    const bw =
        (W -
            side * 2 -
            gap * (cols - 1))
        / cols;


    for (
        let row = 0;
        row < rows;
        row++
    ) {

        for (
            let col = 0;
            col < cols;
            col++
        ) {

            brickState.bricks.push({

                x:
                    side +
                    col *
                    (bw + gap),

                y:
                    55 +
                    row * 28,

                width:
                    bw,

                height:
                    20,

                alive: true,

                hp:
                    row < 2
                        ? 2
                        : 1

            });

        }

    }


    const movePaddle =
        event => {

            const rect =
                canvas.getBoundingClientRect();


            const scaleX =
                W / rect.width;


            brickState.paddleX =

                (event.clientX -
                    rect.left) *
                scaleX -
                brickState.paddleWidth / 2;


            brickState.paddleX =

                Math.max(

                    0,

                    Math.min(

                        W -
                        brickState.paddleWidth,

                        brickState.paddleX

                    )

                );

        };


    canvas.onmousemove =
        movePaddle;


    canvas.ontouchmove =
        event => {

            if (
                event.touches.length
            ) {

                const touch =
                    event.touches[0];


                movePaddle({

                    clientX:
                        touch.clientX

                });

            }


            event.preventDefault();

        };


    window.brickTimer =

        setInterval(

            () => {

                updateBricks();

                drawBricks();

            },

            16

        );

}


function updateBricks() {

    const s =
        brickState;


    s.x += s.dx;

    s.y += s.dy;


    if (
        s.x + s.radius >= 360 ||
        s.x - s.radius <= 0
    ) {

        s.dx *= -1;

    }


    if (
        s.y - s.radius <= 0
    ) {

        s.dy *= -1;

    }


    const paddleY =
        460 - 55;


    if (

        s.y + s.radius >=
            paddleY &&

        s.y - s.radius <=
            paddleY +
            s.paddleHeight &&

        s.x >=
            s.paddleX &&

        s.x <=
            s.paddleX +
            s.paddleWidth &&

        s.dy > 0

    ) {

        const hit =
            (
                s.x -
                (
                    s.paddleX +
                    s.paddleWidth / 2
                )
            ) /
            (
                s.paddleWidth / 2
            );


        s.dx =
            hit * 5;


        s.dy =
            -Math.abs(
                s.dy
            );

    }


    s.bricks.forEach(

        brick => {

            if (
                !brick.alive
            ) return;


            if (

                s.x + s.radius >
                brick.x &&

                s.x - s.radius <
                brick.x +
                brick.width &&

                s.y + s.radius >
                brick.y &&

                s.y - s.radius <
                brick.y +
                brick.height

            ) {

                brick.hp--;


                if (
                    brick.hp <= 0
                ) {

                    brick.alive =
                        false;

                    s.score += 10;

                    addCoins(1);

                } else {

                    s.score += 5;

                }


                s.dy *= -1;

            }

        }

    );


    if (
        s.y >
        460 +
        s.radius
    ) {

        s.lives--;


        if (
            s.lives <= 0
        ) {

            clearInterval(
                window.brickTimer
            );


            recordScore(

                "bricks",

                s.score,

                Math.floor(
                    s.score / 10
                )

            );


            return;

        }


        s.x =
            180;

        s.y =
            390;

        s.dx =
            3;

        s.dy =
            -3;

    }


    const remaining =
        s.bricks.filter(
            b => b.alive
        ).length;


    if (
        remaining === 0
    ) {

        clearInterval(
            window.brickTimer
        );


        recordScore(

            "bricks",

            s.score,

            s.score + 20

        );

    }

}


function drawBricks() {

    const canvas =
        $("brick-canvas");


    if (!canvas) return;


    const ctx =
        canvas.getContext("2d");


    gameCanvasFrame(

        ctx,

        360,

        460

    );


    const s =
        brickState;


    /* Bricks */

    s.bricks.forEach(

        brick => {

            if (
                !brick.alive
            ) return;


            const gradient =

                ctx.createLinearGradient(

                    brick.x,

                    brick.y,

                    brick.x +
                        brick.width,

                    brick.y +
                        brick.height

                );


            gradient.addColorStop(
                0,
                brick.hp === 2
                    ? "#a970ff"
                    : "#4c9cff"
            );


            gradient.addColorStop(
                1,
                brick.hp === 2
                    ? "#6944d7"
                    : "#2163ca"
            );


            ctx.fillStyle =
                gradient;


            ctx.shadowBlur = 9;

            ctx.shadowColor =
                brick.hp === 2
                    ? "#8f5cff"
                    : "#3287ff";


            roundedCanvasRect(

                ctx,

                brick.x,

                brick.y,

                brick.width,

                brick.height,

                5

            );


            ctx.fill();


            ctx.shadowBlur = 0;

        }

    );


    /* Paddle */

    const py =
        460 - 55;


    ctx.fillStyle =
        "#ffffff";


    ctx.shadowBlur = 15;

    ctx.shadowColor =
        "#ffffff";


    roundedCanvasRect(

        ctx,

        s.paddleX,

        py,

        s.paddleWidth,

        s.paddleHeight,

        7

    );


    ctx.fill();


    ctx.shadowBlur = 0;


    /* Ball */

    ctx.fillStyle =
        "#ffde6b";


    ctx.shadowBlur =
        18;


    ctx.shadowColor =
        "#ffcc33";


    ctx.beginPath();

    ctx.arc(

        s.x,

        s.y,

        s.radius,

        0,

        Math.PI * 2

    );

    ctx.fill();


    ctx.shadowBlur = 0;


    if (
        $("brick-score")
    ) {

        $("brick-score").textContent =
            s.score;

    }


    if (
        $("brick-lives")
    ) {

        $("brick-lives").textContent =
            s.lives;

    }

}


/* =========================================================
   PONG PRO
   ========================================================= */

function buildPong(stage) {

    stage.innerHTML = `

        <div class="game-score">

            You
            <span id="pong-player">
                0
            </span>

            —

            CPU
            <span id="pong-cpu">
                0
            </span>

        </div>


        <canvas
            class="game-canvas"
            id="pong-canvas"
            width="360"
            height="460"
        ></canvas>


        <p class="game-message">

            Move your paddle with your mouse,
            finger, or arrow keys.

        </p>


        <button
            class="game-button"
            onclick="startPong()"
        >

            Restart

        </button>

    `;


    startPong();

}


function startPong() {

    clearInterval(
        window.pongTimer
    );


    const canvas =
        $("pong-canvas");


    if (!canvas) return;


    window.pongState = {

        playerY:
            200,

        cpuY:
            200,

        paddleHeight:
            80,

        paddleWidth:
            12,

        ballX:
            180,

        ballY:
            230,

        ballDX:
            3.6,

        ballDY:
            2.2,

        playerScore:
            0,

        cpuScore:
            0

    };


    canvas.onmousemove =
        event => {

            const rect =
                canvas.getBoundingClientRect();


            pongState.playerY =

                (
                    event.clientY -
                    rect.top
                ) -
                pongState.paddleHeight / 2;


            pongState.playerY =

                Math.max(

                    0,

                    Math.min(

                        460 -
                        pongState.paddleHeight,

                        pongState.playerY

                    )

                );

        };


    canvas.ontouchmove =
        event => {

            if (
                event.touches.length
            ) {

                const touch =
                    event.touches[0];


                const rect =
                    canvas.getBoundingClientRect();


                pongState.playerY =

                    (
                        touch.clientY -
                        rect.top
                    ) -
                    pongState.paddleHeight / 2;


                pongState.playerY =

                    Math.max(

                        0,

                        Math.min(

                            460 -
                            pongState.paddleHeight,

                            pongState.playerY

                        )

                    );

            }


            event.preventDefault();

        };


    window.pongTimer =

        setInterval(

            updatePong,

            16

        );

}


function updatePong() {

    const s =
        pongState;


    s.ballX +=
        s.ballDX;


    s.ballY +=
        s.ballDY;


    if (

        s.ballY < 8 ||

        s.ballY > 452

    ) {

        s.ballDY *= -1;

    }


    const cpuTarget =
        s.ballY -
        s.paddleHeight / 2;


    s.cpuY +=
        (
            cpuTarget -
            s.cpuY
        ) *
        .055;


    s.cpuY =

        Math.max(

            0,

            Math.min(

                460 -
                s.paddleHeight,

                s.cpuY

            )

        );


    /* Player paddle */

    if (

        s.ballX < 42 &&

        s.ballX > 25 &&

        s.ballY >
            s.playerY &&

        s.ballY <
            s.playerY +
            s.paddleHeight &&

        s.ballDX < 0

    ) {

        s.ballDX =
            Math.abs(
                s.ballDX
            ) + .08;


        const offset =

            (
                s.ballY -
                (
                    s.playerY +
                    s.paddleHeight / 2
                )
            ) /
            (
                s.paddleHeight / 2
            );


        s.ballDY =
            offset * 5;

    }


    /* CPU paddle */

    if (

        s.ballX > 318 &&

        s.ballX < 335 &&

        s.ballY >
            s.cpuY &&

        s.ballY <
            s.cpuY +
            s.paddleHeight &&

        s.ballDX > 0

    ) {

        s.ballDX =
            -Math.abs(
                s.ballDX
            ) - .08;

    }


    if (
        s.ballX < -20
    ) {

        s.cpuScore++;

        resetPongBall(
            1
        );

    }


    if (
        s.ballX > 380
    ) {

        s.playerScore++;

        addCoins(2);

        resetPongBall(
            -1
        );

    }


    if (
        s.playerScore >= 7 ||
        s.cpuScore >= 7
    ) {

        clearInterval(
            window.pongTimer
        );


        recordScore(

            "pong",

            s.playerScore,

            s.playerScore * 5

        );

    }


    drawPong();

}


function resetPongBall(
    direction
) {

    const s =
        pongState;


    s.ballX =
        180;


    s.ballY =
        230;


    s.ballDX =
        direction *
        3.6;


    s.ballDY =
        (
            Math.random() *
            4
        ) - 2;

}


function drawPong() {

    const canvas =
        $("pong-canvas");


    if (!canvas) return;


    const ctx =
        canvas.getContext("2d");


    const s =
        pongState;


    gameCanvasFrame(

        ctx,

        360,

        460

    );


    /* Center line */

    ctx.strokeStyle =
        "rgba(255,255,255,.15)";


    ctx.setLineDash(
        [8, 12]
    );


    ctx.beginPath();

    ctx.moveTo(
        180,
        0
    );

    ctx.lineTo(
        180,
        460
    );

    ctx.stroke();


    ctx.setLineDash([]);


    /* Player */

    ctx.fillStyle =
        "#66aaff";


    ctx.shadowBlur =
        15;

    ctx.shadowColor =
        "#4e9cff";


    roundedCanvasRect(

        ctx,

        25,

        s.playerY,

        s.paddleWidth,

        s.paddleHeight,

        6

    );


    ctx.fill();


    /* CPU */

    ctx.fillStyle =
        "#ff5575";


    ctx.shadowColor =
        "#ff5575";


    roundedCanvasRect(

        ctx,

        323,

        s.cpuY,

        s.paddleWidth,

        s.paddleHeight,

        6

    );


    ctx.fill();


    /* Ball */

    ctx.fillStyle =
        "#ffffff";


    ctx.shadowColor =
        "#ffffff";


    ctx.beginPath();

    ctx.arc(

        s.ballX,

        s.ballY,

        8,

        0,

        Math.PI * 2

    );


    ctx.fill();


    ctx.shadowBlur = 0;


    setText(
        "pong-player",
        s.playerScore
    );


    setText(
        "pong-cpu",
        s.cpuScore
    );

}


/* =========================================================
   SPACE DEFENDER PRO
   ========================================================= */

function buildSpace(stage) {

    stage.innerHTML = `

        <div class="game-score">

            Score
            <span id="space-score">
                0
            </span>

            · Lives
            <span id="space-lives">
                3
            </span>

        </div>


        <canvas
            class="game-canvas"
            id="space-canvas"
            width="360"
            height="500"
        ></canvas>


        <div class="controls">

            <button
                onclick="moveSpace(-1)"
            >
                ◀
            </button>

            <button
                onclick="shootSpace()"
            >
                🔥
            </button>

            <button
                onclick="moveSpace(1)"
            >
                ▶
            </button>

        </div>


        <p class="game-message">

            Arrow keys move.
            Space shoots.

        </p>


        <button
            class="game-button"
            onclick="startSpace()"
        >

            Restart

        </button>

    `;


    startSpace();

}


function startSpace() {

    clearInterval(
        window.spaceTimer
    );


    const canvas =
        $("space-canvas");


    if (!canvas) return;


    window.spaceState = {

        player: {

            x: 180,

            y: 450,

            width: 36,

            height: 24

        },

        bullets: [],

        enemies: [],

        stars: [],

        score: 0,

        lives: 3,

        frame: 0

    };


    for (
        let i = 0;
        i < 70;
        i++
    ) {

        spaceState.stars.push({

            x:
                Math.random() *
                canvas.width,

            y:
                Math.random() *
                canvas.height,

            speed:
                .5 +
                Math.random() * 2,

            size:
                Math.random() * 2 + 1

        });

    }


    window.spaceTimer =

        setInterval(

            () => {

                updateSpace();

                drawSpace();

            },

            16

        );

}


function moveSpace(
    amount
) {

    if (
        !window.spaceState
    ) return;


    spaceState.player.x +=
        amount * 28;


    spaceState.player.x =

        Math.max(

            20,

            Math.min(

                340,

                spaceState.player.x

            )

        );

}


function shootSpace() {

    if (
        !window.spaceState
    ) return;


    spaceState.bullets.push({

        x:
            spaceState.player.x,

        y:
            spaceState.player.y -
            20,

        speed:
            8

    });

}


function updateSpace() {

    const s =
        spaceState;


    s.frame++;


    s.stars.forEach(

        star => {

            star.y +=
                star.speed;


            if (
                star.y > 500
            ) {

                star.y = 0;

                star.x =
                    Math.random() *
                    360;

            }

        }

    );


    if (
        s.frame % 55 === 0
    ) {

        s.enemies.push({

            x:
                25 +
                Math.random() *
                310,

            y:
                -30,

            width:
                30,

            height:
                24,

            speed:
                1.2 +
                Math.random() *
                1.5

        });

    }


    s.bullets.forEach(

        bullet => {

            bullet.y -=
                bullet.speed;

        }

    );


    s.bullets =
        s.bullets.filter(

            bullet =>
                bullet.y > -20

        );


    s.enemies.forEach(

        enemy => {

            enemy.y +=
                enemy.speed;

        }

    );


    s.enemies =
        s.enemies.filter(

            enemy => {

                if (
                    enemy.y > 520
                ) {

                    s.lives--;

                    return false;

                }

                return true;

            }

        );


    s.bullets.forEach(

        bullet => {

            s.enemies.forEach(

                enemy => {

                    if (

                        bullet.x >
                            enemy.x -
                            enemy.width / 2 &&

                        bullet.x <
                            enemy.x +
                            enemy.width / 2 &&

                        bullet.y >
                            enemy.y -
                            enemy.height / 2 &&

                        bullet.y <
                            enemy.y +
                            enemy.height / 2

                    ) {

                        enemy.destroyed =
                            true;

                        bullet.destroyed =
                            true;

                        s.score +=
                            10;

                        addCoins(1);

                    }

                }

            );

        }

    );


    s.enemies =
        s.enemies.filter(
            enemy =>
                !enemy.destroyed
        );


    s.bullets =
        s.bullets.filter(
            bullet =>
                !bullet.destroyed
        );


    s.enemies.forEach(

        enemy => {

            const p =
                s.player;


            if (

                enemy.x >
                    p.x -
                    p.width / 2 &&

                enemy.x <
                    p.x +
                    p.width / 2 &&

                enemy.y +
                    enemy.height / 2 >
                    p.y -
                    p.height / 2 &&

                enemy.y -
                    enemy.height / 2 <
                    p.y +
                    p.height / 2

            ) {

                enemy.destroyed =
                    true;

                s.lives--;

            }

        }

    );


    s.enemies =
        s.enemies.filter(
            enemy =>
                !enemy.destroyed
        );


    if (
        s.lives <= 0
    ) {

        clearInterval(
            window.spaceTimer
        );


        recordScore(

            "space",

            s.score,

            Math.floor(
                s.score / 10
            )

        );

    }

}


function drawSpace() {

    const canvas =
        $("space-canvas");


    if (!canvas) return;


    const ctx =
        canvas.getContext("2d");


    const s =
        spaceState;


    ctx.fillStyle =
        "#03050c";


    ctx.fillRect(

        0,

        0,

        360,

        500

    );


    /* Stars */

    s.stars.forEach(

        star => {

            ctx.fillStyle =
                `rgba(255,255,255,${
                    .3 +
                    Math.random() * .6
                })`;


            ctx.fillRect(

                star.x,

                star.y,

                star.size,

                star.size

            );

        }

    );


    /* Player */

    ctx.save();


    ctx.translate(

        s.player.x,

        s.player.y

    );


    ctx.fillStyle =
        "#55b8ff";


    ctx.shadowBlur =
        20;


    ctx.shadowColor =
        "#3ca8ff";


    ctx.beginPath();

    ctx.moveTo(
        0,
        -18
    );

    ctx.lineTo(
        -18,
        15
    );

    ctx.lineTo(
        0,
        8
    );

    ctx.lineTo(
        18,
        15
    );

    ctx.closePath();

    ctx.fill();


    ctx.fillStyle =
        "#d9f4ff";


    ctx.beginPath();

    ctx.arc(

        0,

        -5,

        5,

        0,

        Math.PI * 2

    );

    ctx.fill();


    ctx.restore();


    /* Bullets */

    s.bullets.forEach(

        bullet => {

            ctx.fillStyle =
                "#fff36a";


            ctx.shadowBlur =
                14;


            ctx.shadowColor =
                "#ffe94a";


            roundedCanvasRect(

                ctx,

                bullet.x - 3,

                bullet.y - 9,

                6,

                18,

                3

            );


            ctx.fill();

        }

    );


    /* Enemies */

    s.enemies.forEach(

        enemy => {

            ctx.save();


            ctx.translate(

                enemy.x,

                enemy.y

            );


            ctx.fillStyle =
                "#ff4f72";


            ctx.shadowBlur =
                16;


            ctx.shadowColor =
                "#ff3d67";


            ctx.beginPath();

            ctx.moveTo(
                0,
                15
            );

            ctx.lineTo(
                -17,
                -10
            );

            ctx.lineTo(
                -5,
                -7
            );

            ctx.lineTo(
                0,
                -17
            );

            ctx.lineTo(
                5,
                -7
            );

            ctx.lineTo(
                17,
                -10
            );

            ctx.closePath();

            ctx.fill();


            ctx.restore();

        }

    );


    ctx.shadowBlur = 0;


    setText(
        "space-score",
        s.score
    );


    setText(
        "space-lives",
        s.lives
    );

}


/* =========================================================
   COIN CATCHER PRO
   ========================================================= */

function buildCoins(stage) {

    stage.innerHTML = `

        <div class="game-score">

            Coins
            <span id="catch-score">
                0
            </span>

            · Lives
            <span id="catch-lives">
                3
            </span>

        </div>


        <canvas
            class="game-canvas"
            id="catch-canvas"
            width="360"
            height="460"
        ></canvas>


        <div class="controls">

            <button
                onclick="moveCatcher(-1)"
            >
                ◀
            </button>

            <button
                onclick="moveCatcher(1)"
            >
                ▶
            </button>

        </div>


        <button
            class="game-button"
            onclick="startCoins()"
        >

            Restart

        </button>

    `;


    startCoins();

}


function startCoins() {

    clearInterval(
        window.catchTimer
    );


    const canvas =
        $("catch-canvas");


    if (!canvas) return;


    window.catchState = {

        playerX:
            180,

        playerY:
            420,

        score:
            0,

        lives:
            3,

        objects: [],

        frame:
            0

    };


    canvas.onmousemove =
        event => {

            const rect =
                canvas.getBoundingClientRect();


            catchState.playerX =

                (
                    event.clientX -
                    rect.left
                ) *
                (
                    360 /
                    rect.width
                );

        };


    canvas.ontouchmove =
        event => {

            if (
                event.touches.length
            ) {

                const rect =
                    canvas.getBoundingClientRect();


                catchState.playerX =

                    (
                        event.touches[0].clientX -
                        rect.left
                    ) *
                    (
                        360 /
                        rect.width
                    );

            }


            event.preventDefault();

        };


    window.catchTimer =

        setInterval(

            () => {

                updateCatcher();

                drawCatcher();

            },

            16

        );

}


function moveCatcher(
    amount
) {

    if (
        !window.catchState
    ) return;


    catchState.playerX +=
        amount * 30;


    catchState.playerX =

        Math.max(

            25,

            Math.min(

                335,

                catchState.playerX

            )

        );

}


function updateCatcher() {

    const s =
        catchState;


    s.frame++;


    if (
        s.frame % 45 === 0
    ) {

        const good =
            Math.random() > .25;


        s.objects.push({

            x:
                20 +
                Math.random() *
                320,

            y:
                -20,

            speed:
                2 +
                Math.random() * 2,

            good

        });

    }


    s.objects.forEach(

        obj => {

            obj.y +=
                obj.speed;

        }

    );


    s.objects.forEach(

        obj => {

            if (
                obj.hit
            ) return;


            const distance =

                Math.abs(
                    obj.x -
                    s.playerX
                );


            if (

                obj.y >
                    s.playerY -
                    25 &&

                obj.y <
                    s.playerY +
                    25 &&

                distance <
                    35

            ) {

                obj.hit =
                    true;


                if (
                    obj.good
                ) {

                    s.score += 10;

                    addCoins(1);

                } else {

                    s.lives--;

                }

            }

        }

    );


    s.objects =
        s.objects.filter(

            obj => {

                if (
                    obj.y > 490
                ) {

                    if (
                        obj.good &&
                        !obj.hit
                    ) {

                        s.lives--;

                    }

                    return false;

                }

                return !obj.hit;

            }

        );


    if (
        s.lives <= 0
    ) {

        clearInterval(
            window.catchTimer
        );


        recordScore(

            "coins",

            s.score,

            Math.floor(
                s.score / 10
            )

        );

    }

}


function drawCatcher() {

    const canvas =
        $("catch-canvas");


    if (!canvas) return;


    const ctx =
        canvas.getContext("2d");


    const s =
        catchState;


    gameCanvasFrame(

        ctx,

        360,

        460

    );


    /* Player */

    ctx.fillStyle =
        "#64b5ff";


    ctx.shadowBlur =
        18;


    ctx.shadowColor =
        "#4b9fff";


    roundedCanvasRect(

        ctx,

        s.playerX - 28,

        s.playerY - 12,

        56,

        24,

        10

    );


    ctx.fill();


    ctx.shadowBlur = 0;


    /* Objects */

    s.objects.forEach(

        obj => {

            if (
                obj.good
            ) {

                ctx.fillStyle =
                    "#ffd54f";


                ctx.shadowBlur =
                    18;


                ctx.shadowColor =
                    "#ffc928";


                ctx.beginPath();

                ctx.arc(

                    obj.x,

                    obj.y,

                    11,

                    0,

                    Math.PI * 2

                );

                ctx.fill();

            } else {

                ctx.fillStyle =
                    "#ff5575";


                ctx.shadowBlur =
                    14;


                ctx.shadowColor =
                    "#ff3c61";


                ctx.beginPath();

                ctx.moveTo(
                    obj.x,
                    obj.y - 12
                );

                ctx.lineTo(
                    obj.x + 11,
                    obj.y
                );

                ctx.lineTo(
                    obj.x,
                    obj.y + 12
                );

                ctx.lineTo(
                    obj.x - 11,
                    obj.y
                );

                ctx.closePath();

                ctx.fill();

            }

        }

    );


    ctx.shadowBlur = 0;


    setText(
        "catch-score",
        s.score
    );


    setText(
        "catch-lives",
        s.lives
    );

}


/* =========================================================
   DODGE PRO
   ========================================================= */

function buildDodge(stage) {

    stage.innerHTML = `

        <div class="game-score">

            Score
            <span id="dodge-score">
                0
            </span>

            · Lives
            <span id="dodge-lives">
                3
            </span>

        </div>


        <canvas
            class="game-canvas"
            id="dodge-canvas"
            width="360"
            height="500"
        ></canvas>


        <div class="controls">

            <button
                onclick="moveDodge(-1)"
            >
                ◀
            </button>

            <button
                onclick="moveDodge(1)"
            >
                ▶
            </button>

        </div>


        <button
            class="game-button"
            onclick="startDodge()"
        >

            Restart

        </button>

    `;


    startDodge();

}


function startDodge() {

    clearInterval(
        window.dodgeTimer
    );


    window.dodgeState = {

        x:
            180,

        y:
            440,

        score:
            0,

        lives:
            3,

        blocks:
            [],

        frame:
            0

    };


    window.dodgeTimer =

        setInterval(

            () => {

                updateDodge();

                drawDodge();

            },

            16

        );

}


function moveDodge(
    amount
) {

    if (
        !window.dodgeState
    ) return;


    dodgeState.x +=
        amount * 30;


    dodgeState.x =

        Math.max(

            25,

            Math.min(

                335,

                dodgeState.x

            )

        );

}


function updateDodge() {

    const s =
        dodgeState;


    s.frame++;


    if (
        s.frame % 38 === 0
    ) {

        s.blocks.push({

            x:
                15 +
                Math.random() *
                330,

            y:
                -25,

            size:
                22 +
                Math.random() *
                20,

            speed:
                2 +
                Math.random() * 3

        });

    }


    s.blocks.forEach(

        block => {

            block.y +=
                block.speed;

        }

    );


    s.blocks.forEach(

        block => {

            if (
                block.hit
            ) return;


            if (

                Math.abs(
                    block.x -
                    s.x
                ) <

                block.size / 2 +
                18 &&

                Math.abs(
                    block.y -
                    s.y
                ) <

                block.size / 2 +
                18

            ) {

                block.hit =
                    true;

                s.lives--;

            }

        }

    );


    s.blocks =
        s.blocks.filter(

            block =>
                block.y <
                    540 &&
                !block.hit

        );


    s.score += .05;


    if (
        s.lives <= 0
    ) {

        clearInterval(
            window.dodgeTimer
        );


        const finalScore =
            Math.floor(
                s.score
            );


        recordScore(

            "dodge",

            finalScore,

            Math.floor(
                finalScore / 10
            )

        );

    }

}


function drawDodge() {

    const canvas =
        $("dodge-canvas");


    if (!canvas) return;


    const ctx =
        canvas.getContext("2d");


    const s =
        dodgeState;


    gameCanvasFrame(

        ctx,

        360,

        500

    );


    /* Player */

    ctx.fillStyle =
        "#62c8ff";


    ctx.shadowBlur =
        20;


    ctx.shadowColor =
        "#42baff";


    roundedCanvasRect(

        ctx,

        s.x - 18,

        s.y - 18,

        36,

        36,

        9

    );


    ctx.fill();


    ctx.shadowBlur = 0;


    /* Falling blocks */

    s.blocks.forEach(

        block => {

            ctx.fillStyle =
                "#ff526f";


            ctx.shadowBlur =
                14;


            ctx.shadowColor =
                "#ff405f";


            roundedCanvasRect(

                ctx,

                block.x -
                    block.size / 2,

                block.y -
                    block.size / 2,

                block.size,

                block.size,

                6

            );


            ctx.fill();

        }

    );


    ctx.shadowBlur = 0;


    setText(

        "dodge-score",

        Math.floor(
            s.score
        )

    );


    setText(
        "dodge-lives",
        s.lives
    );

}


/* =========================================================
   ROAD RUSH PRO
   ========================================================= */

function buildRoad(stage) {

    stage.innerHTML = `
        <div class="game-score tetris-stats road-hud">
            <span>Score <b id="road-score">0</b></span>
            <span>Near misses <b id="road-near">0</b></span>
            <span>Best <b id="road-best">0</b></span>
            <span>Lives <b id="road-lives">3</b></span>
        </div>
        <canvas
            class="game-canvas road-canvas"
            id="road-canvas"
            width="360"
            height="500"
            aria-label="Road Rush race track"
        ></canvas>
        <div class="controls road-controls" role="group" aria-label="Steer car">
            <button type="button" aria-label="Steer left" onclick="moveRoad(-1)">◀</button>
            <button type="button" aria-label="Steer right" onclick="moveRoad(1)">▶</button>
        </div>
        <p class="game-message" id="road-status" aria-live="polite">Dodge traffic. Near misses add bonus points.</p>
        <button class="game-button" type="button" id="road-restart">New race</button>
    `;
    stage.querySelector("#road-restart").addEventListener("click", startRoad);
    const canvas = stage.querySelector("#road-canvas");
    let swipeStart = null;
    canvas.addEventListener("pointerdown", event => {
        swipeStart = { x: event.clientX, y: event.clientY };
    });
    canvas.addEventListener("pointerup", event => {
        if (!swipeStart) return;
        const dx = event.clientX - swipeStart.x;
        swipeStart = null;
        if (Math.abs(dx) < 18) return;
        moveRoad(dx < 0 ? -1 : 1);
    });
    canvas.addEventListener("pointercancel", () => { swipeStart = null; });
    startRoad();
}


function startRoad() {
    clearInterval(window.roadTimer);
    window.roadState = {
        lane: 1,
        score: 0,
        lives: 3,
        traffic: [],
        frame: 0,
        nearMisses: 0,
        invulnerable: 0,
        collisionFlash: 0,
        over: false
    };
    setText("road-status", "Dodge traffic. Near misses add bonus points.");
    setText("road-near", "0");
    window.roadTimer = setInterval(() => {
        updateRoad();
        drawRoad();
    }, 1000 / 60);
    drawRoad();
}


function moveRoad(
    amount
) {
    const game = window.roadState;
    if (!game || game.over) return;
    game.lane = Math.max(0, Math.min(2, game.lane + Math.sign(amount)));
}


function updateRoad() {
    const s = window.roadState;
    if (!s || s.over) return;
    s.frame++;
    const spawnEvery = Math.max(30, 66 - Math.floor(s.score / 120) * 5);
    if (s.frame % spawnEvery === 0) {
        const openLanes = [0, 1, 2].filter(lane =>
            !s.traffic.some(car => car.lane === lane && car.y < -70 && car.y > -260)
        );
        if (openLanes.length) {
            const lane = openLanes[Math.floor(Math.random() * openLanes.length)];
            const isTruck = Math.random() < .18;
            s.traffic.push({
                lane,
                y: -82,
                speed: 3.1 + Math.min(3.2, s.score / 260) + Math.random() * .8,
                color: ["#ff526f", "#ffb84d", "#55c8ff", "#ad83ff"][Math.floor(Math.random() * 4)],
                width: isTruck ? 48 : 42,
                height: isTruck ? 78 : 68,
                hit: false,
                passed: false
            });
        }
    }

    s.traffic.forEach(car => {
        if (s.over) return;
        car.y += car.speed;
        const verticalOverlap = car.y + car.height > 410 && car.y < 482;
        if (!car.hit && verticalOverlap && car.lane === s.lane && s.invulnerable === 0) {
            car.hit = true;
            s.lives--;
            s.invulnerable = 55;
            s.collisionFlash = 16;
            setText("road-status", s.lives ? "Crash! Watch the traffic and keep going." : "Race over · tap New race to try again.");
            if (s.lives <= 0) {
                s.over = true;
                clearInterval(window.roadTimer);
                const finalScore = Math.floor(s.score);
                recordScore("road", finalScore, Math.floor(finalScore / 8));
            }
        }
        if (!car.passed && car.y > 482) {
            car.passed = true;
            if (!car.hit && Math.abs(car.lane - s.lane) === 1) {
                s.nearMisses++;
                s.score += 25;
                setText("road-status", "Close one! Near miss bonus +25");
            }
        }
    });
    s.traffic = s.traffic.filter(car => car.y < 560 && !car.hit);
    if (s.invulnerable > 0) s.invulnerable--;
    if (s.collisionFlash > 0) s.collisionFlash--;
    s.score += .035;
}


function drawRoad() {

    const canvas =
        $("road-canvas");


    if (!canvas) return;


    const ctx =
        canvas.getContext("2d");


    const s = window.roadState;
    if (!s) return;


    /* Road */

    const bg =
        ctx.createLinearGradient(

            0,
            0,
            0,
            500

        );


    bg.addColorStop(
        0,
        "#171b24"
    );


    bg.addColorStop(
        1,
        "#080a0e"
    );


    ctx.fillStyle =
        bg;


    ctx.fillRect(

        0,
        0,
        360,
        500

    );


    /* Grass */

    ctx.fillStyle =
        "#0d291d";


    ctx.fillRect(
        0,
        0,
        35,
        500
    );


    ctx.fillRect(
        325,
        0,
        35,
        500
    );

    ctx.fillStyle = "#1a1e27";
    ctx.fillRect(40, 0, 280, 500);

    ctx.fillStyle = "rgba(255,255,255,.82)";
    for (let y = -40; y < 520; y += 70) {
        const stripeY = (y + s.frame * 4) % 560;
        ctx.fillRect(42, stripeY, 4, 28);
        ctx.fillRect(314, stripeY, 4, 28);
    }


    /* Road edges */

    ctx.fillStyle =
        "#aab0ba";


    ctx.fillRect(
        35,
        0,
        5,
        500
    );


    ctx.fillRect(
        320,
        0,
        5,
        500
    );


    /* Lane markers */

    ctx.setLineDash(
        [28, 28]
    );


    ctx.lineDashOffset =
        -s.frame * 3;


    ctx.strokeStyle =
        "rgba(255,255,255,.55)";


    ctx.lineWidth =
        4;


    ctx.beginPath();


    ctx.moveTo(
        130,
        0
    );


    ctx.lineTo(
        130,
        500
    );


    ctx.moveTo(
        230,
        0
    );


    ctx.lineTo(
        230,
        500
    );


    ctx.stroke();


    ctx.setLineDash([]);


    /* Player */

    const playerX =

        80 +
        s.lane * 100;


    ctx.globalAlpha = s.invulnerable > 0 && s.frame % 8 < 4 ? .35 : 1;
    ctx.fillStyle = "#2995f5";


    ctx.shadowBlur =
        18;


    ctx.shadowColor =
        "#4c9eff";


    roundedCanvasRect(

        ctx,

        playerX - 22,

        410,

        44,

        72,

        9

    );


    ctx.fill();


    ctx.fillStyle =
        "#dff4ff";


    roundedCanvasRect(

        ctx,

        playerX - 15,

        420,

        30,

        22,

        5

    );


    ctx.fill();


    ctx.fillStyle =
        "#121722";


    ctx.fillRect(

        playerX - 25,

        418,

        6,

        18

    );


    ctx.fillRect(

        playerX + 19,

        418,

        6,

        18

    );


    ctx.fillRect(

        playerX - 25,

        458,

        6,

        18

    );


    ctx.fillRect(
        playerX + 19,
        458,
        6,
        18
    );

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;


    /* Traffic */

    s.traffic.forEach(

        car => {

            const x = 80 + car.lane * 100;
            const width = car.width || 42;
            const height = car.height || 68;


            ctx.fillStyle =
                car.color;


            ctx.shadowBlur =
                14;


            ctx.shadowColor =
                car.color;


            roundedCanvasRect(

                ctx,

                x - width / 2,

                car.y,

                width,
                height,

                8

            );


            ctx.fill();


            ctx.shadowBlur = 0;


            ctx.fillStyle =
                "#dff4ff";


            roundedCanvasRect(

                ctx,

                x - width * .32,

                car.y + 10,

                width * .64,
                18,

                5

            );


            ctx.fill();


            ctx.fillStyle =
                "#161b25";


            ctx.fillRect(

                x - 24,

                car.y + 12,

                5,

                15

            );


            ctx.fillRect(

                x + 19,

                car.y + 12,

                5,

                15

            );


            ctx.fillRect(

                x - 24,

                car.y + 45,

                5,

                15

            );


            ctx.fillRect(

                x + 19,

                car.y + 45,

                5,

                15

            );

        }

    );


    setText(

        "road-score",

        Math.floor(
            s.score
        )

    );


    setText(
        "road-lives",
        s.lives
    );

    setText("road-near", s.nearMisses);
    setText("road-best", Math.max(state.highScores.road || 0, Math.floor(s.score)));
    if (s.over) {
        ctx.fillStyle = "rgba(6, 9, 15, .76)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = "center";
        ctx.fillStyle = "#fff";
        ctx.font = "bold 30px Arial";
        ctx.fillText("RACE OVER", canvas.width / 2, canvas.height / 2 - 12);
        ctx.font = "16px Arial";
        ctx.fillStyle = "#c8d2e0";
        ctx.fillText(`Score ${Math.floor(s.score)} · ${s.nearMisses} near misses`, canvas.width / 2, canvas.height / 2 + 20);
    }

}


/* =========================================================
   GLOBAL KEYBOARD CONTROLS
   ========================================================= */

document.addEventListener(

    "keydown",

    event => {

        const key =
            event.key.toLowerCase();

        if (key === "p" && activeGameId === "snake") {
            event.preventDefault();
            toggleSnakePause();
        }

        if (activeGameId === "snake" && ["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
            event.preventDefault();
        }
        if (key === "arrowup" && activeGameId === "snake") {
            snakeMove("up");
        }


        if (key === "arrowdown" && activeGameId === "snake") {

            snakeMove("down");

        }


        if (key === "arrowleft") {
            if (activeGameId === "snake") snakeMove("left");
            if (activeGameId === "dodge") moveDodge(-1);
            if (activeGameId === "road") {
                event.preventDefault();
                moveRoad(-1);
            }
            if (activeGameId === "coins") moveCatcher(-1);

        }


        if (key === "arrowright") {
            if (activeGameId === "snake") snakeMove("right");
            if (activeGameId === "dodge") moveDodge(1);
            if (activeGameId === "road") {
                event.preventDefault();
                moveRoad(1);
            }
            if (activeGameId === "coins") moveCatcher(1);

        }


        if (key === " " && activeGameId === "space") {

            shootSpace();

        }

    }

);


/* =========================================================
   SLOTIFY PLAYING ANIMATION HOOK
   ========================================================= */

(function setupMusicAnimation() {

    const oldFunction =
        window.setMusicPlayingUI;


    if (
        typeof oldFunction !==
        "function"
    ) {

        return;

    }


    window.setMusicPlayingUI =

        function(isPlaying) {

            oldFunction(
                isPlaying
            );


            document.body.classList.toggle(

                "music-playing",

                !!isPlaying

            );


            const logo =
                document.querySelector(
                    ".slotify-logo"
                );


            if (logo) {

                logo.classList.toggle(

                    "is-playing",

                    !!isPlaying

                );

            }

        };

})();
/* =========================================================
   SLOT PHONE X — PERSONALIZATION + MUSIC IMPORT
   ========================================================= */

(function SlotPhoneUpgrade() {

    "use strict";

    /* -----------------------------------------------------
       HOME SCREEN WALLPAPER
       ----------------------------------------------------- */

    const WALLPAPER_KEY =
        "slotphone_custom_wallpaper";
    const WALLPAPER_PRESET_KEY = "slotphone_wallpaper_preset";
    const WALLPAPER_TINT_KEY = "slotphone_wallpaper_tint";

    const screen =
        document.querySelector(".screen");

    const wallpaperPresets = {
        aurora: "radial-gradient(ellipse at 20% 18%, rgba(68, 190, 180, .85), transparent 42%), linear-gradient(145deg, #172c48, #10151f 62%, #412c45)",
        sunset: "radial-gradient(ellipse at 78% 15%, rgba(255, 188, 113, .85), transparent 38%), linear-gradient(155deg, #773d58, #392b4b 60%, #151a31)",
        ocean: "radial-gradient(ellipse at 30% 10%, rgba(75, 162, 220, .8), transparent 42%), linear-gradient(150deg, #164758, #152f43 62%, #172331)"
    };

    function applyWallpaperTint(value) {
        if (!screen || !value) return;
        const red = parseInt(value.slice(1, 3), 16);
        const green = parseInt(value.slice(3, 5), 16);
        const blue = parseInt(value.slice(5, 7), 16);
        screen.style.setProperty("--wallpaper-tint", `rgba(${red}, ${green}, ${blue}, .28)`);
    }

    function applyWallpaperPreset(name) {
        if (!screen || !wallpaperPresets[name]) return;
        screen.classList.remove("custom-wallpaper");
        screen.classList.add("preset-wallpaper");
        screen.style.backgroundImage = wallpaperPresets[name];
        localStorage.setItem(WALLPAPER_PRESET_KEY, name);
        localStorage.removeItem(WALLPAPER_KEY);
    }

    function applyCustomWallpaper(data) {

        if (!screen) return;

        if (!data) {

            screen.classList.remove(
                "custom-wallpaper"
            );

            screen.style.backgroundImage = "";
            screen.classList.remove("preset-wallpaper");

            return;
        }

        screen.classList.add(
            "custom-wallpaper"
        );
        screen.classList.remove("preset-wallpaper");

        screen.style.backgroundImage =
            `url("${data}")`;
    }


    /* LOAD SAVED WALLPAPER */

    try {

        const savedWallpaper =
            localStorage.getItem(
                WALLPAPER_KEY
            );

        if (savedWallpaper) {

            applyCustomWallpaper(
                savedWallpaper
            );

        } else {
            const savedPreset = localStorage.getItem(WALLPAPER_PRESET_KEY);
            if (savedPreset) applyWallpaperPreset(savedPreset);

        }

        applyWallpaperTint(localStorage.getItem(WALLPAPER_TINT_KEY) || "#263c68");

    } catch (error) {

        console.warn(
            "Could not load saved wallpaper.",
            error
        );

    }


    /* -----------------------------------------------------
       CREATE WALLPAPER SETTINGS
       ----------------------------------------------------- */

    function createWallpaperSettings() {

        const settings =
            document.getElementById(
                "settings"
            );

        if (!settings) return;

        if (
            document.getElementById(
                "wallpaper-settings"
            )
        ) {

            return;

        }


        const card =
            document.createElement("div");

        card.id =
            "wallpaper-settings";

        card.className =
            "wallpaper-settings";


        card.innerHTML = `

            <h3>
                Home Screen
            </h3>

            <p>Pick a backdrop, upload a photo, and add a color wash.</p>

            <div class="wallpaper-presets" aria-label="Wallpaper presets">
                <button type="button" data-wallpaper-preset="aurora" aria-label="Aurora wallpaper">Aurora</button>
                <button type="button" data-wallpaper-preset="sunset" aria-label="Sunset wallpaper">Sunset</button>
                <button type="button" data-wallpaper-preset="ocean" aria-label="Ocean wallpaper">Ocean</button>
            </div>

            <label class="wallpaper-tint-control" for="wallpaper-tint">Color wash <input id="wallpaper-tint" type="color" value="#263c68"></label>

            <div class="wallpaper-buttons">

                <button
                    class="wallpaper-button"
                    id="choose-wallpaper"
                    type="button"
                >
                    🖼️ Choose Wallpaper
                </button>

                <button
                    class="wallpaper-reset"
                    id="reset-wallpaper"
                    type="button"
                >
                    Reset
                </button>

            </div>

            <input
                id="wallpaper-file"
                type="file"
                accept="image/*"
                hidden
            >

        `;


        settings.appendChild(card);


        const choose =
            document.getElementById(
                "choose-wallpaper"
            );

        const input =
            document.getElementById(
                "wallpaper-file"
            );

        const reset =
            document.getElementById(
                "reset-wallpaper"
            );


        if (choose && input) {

            choose.onclick =
                function() {

                    input.click();

                };

        }


        if (input) {

            input.addEventListener(
                "change",
                function(event) {

                    const file =
                        event.target.files &&
                        event.target.files[0];

                    if (!file) return;


                    if (
                        !file.type.startsWith(
                            "image/"
                        )
                    ) {

                        alert(
                            "Please choose an image."
                        );

                        return;

                    }


                    const reader =
                        new FileReader();


                    reader.onload =
                        function(loadEvent) {

                            const imageData =
                                loadEvent.target.result;


                            applyCustomWallpaper(
                                imageData
                            );
                            localStorage.removeItem(WALLPAPER_PRESET_KEY);


                            try {

                                localStorage.setItem(
                                    WALLPAPER_KEY,
                                    imageData
                                );

                            } catch (error) {

                                console.warn(
                                    "The image was too large to save.",
                                    error
                                );

                                alert(
                                    "The wallpaper works now, but the image was too large to save permanently. Try a smaller image."
                                );

                            }

                        };


                    reader.readAsDataURL(
                        file
                    );

                }
            );

        }


        card.querySelectorAll("[data-wallpaper-preset]").forEach(button => {
            button.addEventListener("click", () => {
                applyWallpaperPreset(button.dataset.wallpaperPreset);
                toast(`${button.textContent} wallpaper applied`);
            });
        });

        const tint = document.getElementById("wallpaper-tint");
        if (tint) {
            tint.value = localStorage.getItem(WALLPAPER_TINT_KEY) || "#263c68";
            applyWallpaperTint(tint.value);
            tint.addEventListener("input", () => {
                applyWallpaperTint(tint.value);
                localStorage.setItem(WALLPAPER_TINT_KEY, tint.value);
            });
        }

        if (reset) {

            reset.onclick =
                function() {

                    localStorage.removeItem(
                        WALLPAPER_KEY
                    );
                    localStorage.removeItem(WALLPAPER_PRESET_KEY);
                    localStorage.removeItem(WALLPAPER_TINT_KEY);

                    applyCustomWallpaper(
                        null
                    );
                    screen.style.removeProperty("--wallpaper-tint");

                    if (input) {
                        input.value = "";
                    }

                };

        }

    }


    /*
       Settings is already in the HTML,
       so create the wallpaper controls
       once the page is ready.
    */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            createWallpaperSettings
        );

    } else {

        createWallpaperSettings();

    }


    /* -----------------------------------------------------
       MUSIC IMPORT
       ----------------------------------------------------- */

    let importedSongs = [];


    function createMusicImporter() {

        const slotify =
            document.getElementById(
                "slotify"
            );

        if (!slotify) return;


        if (
            document.getElementById(
                "music-import"
            )
        ) {

            return;

        }


        const playlistTitle =
            slotify.querySelector(
                ".playlist-title-row"
            );


        if (!playlistTitle) return;


        const importer =
            document.createElement(
                "div"
            );

        importer.id =
            "music-import";

        importer.className =
            "music-import";


        importer.innerHTML = `

            <button
                type="button"
                class="music-import-button"
                id="choose-music"
            >
                🎵 Add Your MP3s
            </button>

            <input
                id="music-file-picker"
                type="file"
                accept="audio/mpeg,audio/mp3,audio/*"
                multiple
            >

        `;


        playlistTitle.after(
            importer
        );


        const chooseMusic =
            document.getElementById(
                "choose-music"
            );

        const musicPicker =
            document.getElementById(
                "music-file-picker"
            );


        if (
            chooseMusic &&
            musicPicker
        ) {

            chooseMusic.onclick =
                function() {

                    musicPicker.click();

                };

        }


        if (musicPicker) {

            musicPicker.addEventListener(
                "change",
                function(event) {

                    const files =
                        Array.from(
                            event.target.files || []
                        );


                    if (!files.length) {
                        return;
                    }


                    files.forEach(
                        function(file) {

                            if (
                                !file.type.startsWith(
                                    "audio/"
                                )
                            ) {

                                return;

                            }


                            const url =
                                URL.createObjectURL(
                                    file
                                );


                            importedSongs.push({

                                title:
                                    file.name
                                        .replace(
                                            /\.[^/.]+$/,
                                            ""
                                        ),

                                artist:
                                    "My Music",

                                file:
                                    url,

                                image:
                                    ""

                            });

                        }
                    );


                    renderImportedSongs();

                    event.target.value =
                        "";

                }
            );

        }

    }


    function renderImportedSongs() {

        const playlist =
            document.getElementById(
                "playlist"
            );

        if (!playlist) return;


        /*
           Put imported tracks ABOVE
           the original playlist.
        */

        importedSongs
            .slice()
            .reverse()
            .forEach(
                function(item) {

                    const button =
                        document.createElement(
                            "button"
                        );

                    button.type =
                        "button";

                    button.className =
                        "playlist-song imported-song";


                    button.innerHTML = `

                        <span
                            class="playlist-number"
                        >
                            ♪
                        </span>

                        <span
                            class="playlist-image"
                            style="
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                background:linear-gradient(135deg,#0a84ff,#7b2cff);
                                font-size:20px;
                            "
                        >
                            🎵
                        </span>

                        <span
                            class="playlist-song-info"
                        >

                            <b>
                                ${escapeMusicText(
                                    item.title
                                )}
                            </b>

                            <small>
                                My Music
                            </small>

                        </span>

                    `;


                    button.addEventListener(
                        "click",
                        function() {

                            playImportedSong(
                                item
                            );

                        }
                    );


                    playlist.prepend(
                        button
                    );

                }
            );

    }


    function escapeMusicText(text) {

        return String(text)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    function playImportedSong(
        imported
    ) {

        const player =
            document.getElementById(
                "music-audio"
            );

        if (!player) return;


        player.src =
            imported.file;


        player.volume =
            Number(
                document.getElementById(
                    "music-volume"
                )?.value || .7
            );


        const title =
            document.getElementById(
                "song-name"
            );

        const artist =
            document.getElementById(
                "song-artist"
            );

        const image =
            document.getElementById(
                "song-image"
            );


        if (title) {

            title.textContent =
                imported.title;

        }


        if (artist) {

            artist.textContent =
                imported.artist;

        }


        /*
           Don't try to load an image
           if the imported MP3 doesn't
           have album artwork.
        */

        if (image) {

            image.style.display =
                "block";

            image.src =
                "data:image/svg+xml;charset=UTF-8," +
                encodeURIComponent(`

                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="600"
                        height="600"
                        viewBox="0 0 600 600"
                    >

                        <defs>

                            <linearGradient
                                id="g"
                                x1="0"
                                y1="0"
                                x2="1"
                                y2="1"
                            >

                                <stop
                                    offset="0"
                                    stop-color="#0a84ff"
                                />

                                <stop
                                    offset="1"
                                    stop-color="#7b2cff"
                                />

                            </linearGradient>

                        </defs>

                        <rect
                            width="600"
                            height="600"
                            rx="90"
                            fill="url(#g)"
                        />

                        <text
                            x="300"
                            y="340"
                            text-anchor="middle"
                            font-size="180"
                        >
                            🎵
                        </text>

                    </svg>

                `);

        }


        player.play()
            .then(
                function() {

                    if (
                        typeof setMusicPlayingUI ===
                        "function"
                    ) {

                        setMusicPlayingUI(
                            true
                        );

                    }

                    const status =
                        document.getElementById(
                            "music-status"
                        );

                    if (status) {

                        status.textContent =
                            "Now playing";

                    }

                }
            )
            .catch(
                function(error) {

                    console.error(
                        "Music playback failed:",
                        error
                    );

                    const status =
                        document.getElementById(
                            "music-status"
                        );

                    if (status) {

                        status.textContent =
                            "Click Play to start this song";

                    }

                }
            );

    }


    /* -----------------------------------------------------
       MAKE EXISTING ALBUM IMAGES MORE RELIABLE
       ----------------------------------------------------- */

    function fixImages() {

        const images =
            document.querySelectorAll(
                "img"
            );


        images.forEach(
            function(image) {

                image.addEventListener(
                    "error",
                    function() {

                        /*
                           Don't leave a broken
                           image icon on screen.
                        */

                        image.style.background =
                            "linear-gradient(135deg,#24265f,#10152f)";

                        image.style.objectFit =
                            "cover";

                        image.src =
                            "data:image/svg+xml;charset=UTF-8," +
                            encodeURIComponent(`

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="500"
                                    height="500"
                                >

                                    <defs>

                                        <linearGradient
                                            id="g"
                                            x1="0"
                                            y1="0"
                                            x2="1"
                                            y2="1"
                                        >

                                            <stop
                                                offset="0"
                                                stop-color="#30336b"
                                            />

                                            <stop
                                                offset="1"
                                                stop-color="#11152d"
                                            />

                                        </linearGradient>

                                    </defs>

                                    <rect
                                        width="500"
                                        height="500"
                                        fill="url(#g)"
                                    />

                                    <text
                                        x="250"
                                        y="280"
                                        text-anchor="middle"
                                        font-size="130"
                                    >
                                        🎵
                                    </text>

                                </svg>

                            `);

                    }

                );

            }
        );

    }


    /* -----------------------------------------------------
       START UPGRADE
       ----------------------------------------------------- */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            function() {

                createMusicImporter();

                fixImages();

            }
        );

    } else {

        createMusicImporter();

        fixImages();

    }

})();
/* =========================================================
   SLOT PHONE X — SHORTCUT DOCK + GAME EXIT
   ========================================================= */

(function FinalPhoneControls() {

    "use strict";


    /* =====================================================
       REBUILD THE BOTTOM SHORTCUT BAR
       ===================================================== */

    function setupShortcutDock() {

        const dock =
            document.querySelector(
                ".ios-dock"
            );

        if (!dock) return;


        dock.innerHTML = `

            <button
                class="dock-button"
                type="button"
                onclick="openView('home')"
                aria-label="Home"
            >

                <span
                    class="dock-app-icon dock-home"
                >
                    🏠
                </span>

            </button>


            <button
                class="dock-button"
                type="button"
                onclick="openView('slotify')"
                aria-label="Music"
            >

                <span
                    class="dock-app-icon dock-music"
                >
                    🎵
                </span>

            </button>


            <button
                class="dock-button"
                type="button"
                onclick="openView('settings')"
                aria-label="Settings"
            >

                <span
                    class="dock-app-icon dock-settings"
                >
                    ⚙️
                </span>

            </button>

        `;

    }


    /* =====================================================
       EXIT CURRENT GAME
       ===================================================== */

    window.exitGame =
        function() {

            /*
               Stop all timers created by
               the games.
            */

            if (
                typeof clearGameTimers ===
                "function"
            ) {

                clearGameTimers();

            }


            /*
               Stop any game-specific
               animation frames.
            */

            if (
                window.gameAnimationFrame
            ) {

                cancelAnimationFrame(
                    window.gameAnimationFrame
                );

                window.gameAnimationFrame =
                    null;

            }


            /*
               Stop common game timers.
            */

            const timerNames = [

                "clickerAuto",
                "snakeTimer",
                "brickTimer",
                "pongTimer",
                "reactionTimer",
                "memoryTimer",
                "numberTimer",
                "colorTimer",
                "stackTimer",
                "targetTimer",
                "dodgeTimer",
                "roadTimer",
                "spaceTimer",
                "catchTimer",
                "mineTimer",
                "typingTimer",
                "mathTimer"

            ];


            timerNames.forEach(
                function(name) {

                    if (
                        window[name]
                    ) {

                        clearInterval(
                            window[name]
                        );

                        window[name] =
                            null;

                    }

                }
            );


            /*
               Return to Game Center.
            */

            if (
                typeof openView ===
                "function"
            ) {

                openView("games");

            }


            /*
               Clear the game stage
               so nothing keeps running.
            */

            const stage =
                document.getElementById(
                    "game-stage"
                );

            if (stage) {

                stage.innerHTML = "";

            }


            const title =
                document.getElementById(
                    "game-title"
                );

            if (title) {

                title.textContent =
                    "Choose a game";

            }


            const icon =
                document.getElementById(
                    "game-icon"
                );

            if (icon) {

                icon.textContent =
                    "🎮";

            }

        };


    /* =====================================================
       ADD EXIT BUTTON TO EVERY GAME
       ===================================================== */

    function addExitButton() {

        const stage =
            document.getElementById(
                "game-stage"
            );

        if (!stage) return;


        /*
           Watch the game stage because
           startGame() replaces its HTML
           every time a game starts.
        */

        const observer =
            new MutationObserver(
                function() {

                    if (
                        !stage.children.length
                    ) {

                        return;

                    }


                    /*
                       Don't add it twice.
                    */

                    if (
                        stage.querySelector(
                            ".exit-game-button"
                        )
                    ) {

                        return;

                    }


                    const exit =
                        document.createElement(
                            "button"
                        );


                    exit.type =
                        "button";

                    exit.className =
                        "exit-game-button";

                    exit.innerHTML =
                        "✕  Exit Game";


                    exit.addEventListener(
                        "click",
                        function() {

                            window.exitGame();

                        }
                    );


                    stage.appendChild(
                        exit
                    );

                }
            );


        observer.observe(
            stage,
            {
                childList: true
            }
        );

    }


    /* =====================================================
       SET EVERYTHING UP
       ===================================================== */

    function setup() {

        setupShortcutDock();

        addExitButton();

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            setup
        );

    } else {

        setup();

    }

})();
/* =========================================================
   FIX GAME CENTER NAVIGATION
   ========================================================= */

(function FixGameNavigation() {

    const originalOpenView = window.openView;

    window.openView = function(name) {

        /*
           The Games page is actually called
           "games" in the HTML.

           Some of the older game code uses
           "game", so redirect it correctly.
        */

        if (name === "game") {
            name = "games";
        }

        return originalOpenView(name);

    };

})();

/* =========================================================
   APP INTERACTIONS
   ========================================================= */

(function setupAppInteractions() {
    const readLocal = (key, fallback) => {
        try {
            return JSON.parse(localStorage.getItem(key)) ?? fallback;
        } catch {
            return fallback;
        }
    };

    const writeLocal = (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            toast("Storage is full. Remove saved items and try again.");
            return false;
        }
    };

    const byId = id => document.getElementById(id);
    const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);

    function setupAppSearch() {
        const input = byId("app-search");
        const home = byId("home");
        if (input && home) {
            input.readOnly = true;
            input.placeholder = "Swipe down to unlock search";
            let startY = null;
            let startX = null;
            const unlock = () => {
                if (!input.readOnly) return;
                input.readOnly = false;
                input.placeholder = "Search apps";
                home.classList.add("search-unlocked");
                input.focus();
            };
            home.addEventListener("touchstart", event => {
                const touch = event.touches[0];
                if (touch.clientY <= 180) {
                    startY = touch.clientY;
                    startX = touch.clientX;
                }
            }, { passive: true });
            home.addEventListener("touchend", event => {
                const touch = event.changedTouches[0];
                if (startY !== null && touch.clientY - startY > 64 && Math.abs(touch.clientX - startX) < 60) unlock();
                startY = null;
                startX = null;
            }, { passive: true });
            let pointerStartY = null;
            home.addEventListener("pointerdown", event => {
                if (event.pointerType !== "touch" && event.clientY <= 180) pointerStartY = event.clientY;
            });
            home.addEventListener("pointerup", event => {
                if (pointerStartY !== null && event.clientY - pointerStartY > 64) unlock();
                pointerStartY = null;
            });
        }
        input?.addEventListener("input", () => {
            const query = input.value.trim().toLowerCase();
            document.querySelectorAll("#home-app-grid [data-name]").forEach(tile => {
                tile.hidden = !tile.dataset.name.toLowerCase().includes(query);
            });
        });
        const gameSearch = byId("game-search");
        gameSearch?.addEventListener("input", () => {
            renderGames(document.querySelector(".filter.active")?.dataset.filter || "all");
        });
    }

    function openCameraDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("slotPhoneCameraMedia", 1);
            request.onupgradeneeded = () => {
                if (!request.result.objectStoreNames.contains("videos")) {
                    request.result.createObjectStore("videos", { keyPath: "id", autoIncrement: true });
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async function saveCameraVideo(blob, name) {
        const database = await openCameraDatabase();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction("videos", "readwrite");
            transaction.objectStore("videos").add({ blob, name, createdAt: Date.now() });
            transaction.oncomplete = () => { database.close(); resolve(); };
            transaction.onerror = () => { database.close(); reject(transaction.error); };
        });
    }

    function setupMessages() {
        const list = byId("message-list");
        const input = byId("message-input");
        const send = byId("send-message");
        if (!list || !input || !send) return;
        const key = "slotPhoneMessages";
        const recipient = byId("message-recipient");
        const sms = byId("send-sms");
        const contactName = byId("message-contact-name");
        const contactAvatar = byId("message-avatar");
        const contactStatus = byId("message-contact-status");
        let conversations = readLocal(key, null);
        if (Array.isArray(conversations)) conversations = { Jamie: conversations };
        if (!conversations || typeof conversations !== "object") {
            conversations = {
                Jamie: [...list.querySelectorAll(".message")].map(bubble => ({
                    text: bubble.textContent.trim(),
                    sent: bubble.classList.contains("sent")
                }))
            };
        }

        const currentThread = () => recipient?.value || "Jamie";
        const updateHeader = () => {
            const thread = currentThread();
            const contact = readLocal("slotPhoneContacts", []).find(item => item.phone === thread);
            const name = thread === "Jamie" ? "Jamie" : contact?.name || thread;
            if (contactName) contactName.textContent = name;
            if (contactAvatar) contactAvatar.textContent = name.charAt(0).toUpperCase() || "?";
            if (contactStatus) {
                contactStatus.textContent = thread === "Jamie"
                    ? "Demo conversation · saved here"
                    : `${contact?.phone || thread} · saved here`;
            }
        };
        const updateActions = () => {
            const hasMessage = Boolean(input.value.trim());
            send.disabled = !hasMessage;
            if (sms) {
                sms.disabled = !hasMessage || currentThread() === "Jamie";
                sms.title = currentThread() === "Jamie"
                    ? "Choose a phone contact to send an SMS"
                    : hasMessage ? "Open your phone’s SMS app" : "Write a message first";
            }
        };
        const refreshRecipients = preferredThread => {
            if (!recipient) return;
            const selectedThread = preferredThread || currentThread();
            const contacts = readLocal("slotPhoneContacts", []);
            recipient.replaceChildren();
            const jamie = document.createElement("option");
            jamie.value = "Jamie";
            jamie.textContent = "Jamie · demo thread";
            recipient.appendChild(jamie);
            contacts.forEach(contact => {
                const option = document.createElement("option");
                option.value = contact.phone;
                option.textContent = `${contact.name} · ${contact.phone}`;
                recipient.appendChild(option);
            });
            recipient.value = [...recipient.options].some(option => option.value === selectedThread)
                ? selectedThread
                : "Jamie";
            updateHeader();
            updateActions();
        };
        const render = () => {
            list.replaceChildren();
            const messages = conversations[currentThread()] || [];
            messages.forEach(message => {
                const bubble = document.createElement("div");
                bubble.className = `message ${message.sent ? "sent" : "received"}`;
                bubble.textContent = message.text;
                if (Number.isFinite(message.time)) {
                    const time = document.createElement("time");
                    time.className = "message-time";
                    time.dateTime = new Date(message.time).toISOString();
                    time.textContent = new Date(message.time).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
                    bubble.appendChild(time);
                }
                list.appendChild(bubble);
            });
            if (!messages.length) {
                const empty = document.createElement("p");
                empty.className = "message-empty";
                empty.textContent = "No messages yet. Say hello!";
                list.appendChild(empty);
            }
            list.scrollTop = list.scrollHeight;
        };
        const persist = () => {
            if (writeLocal(key, conversations)) {
                channel?.postMessage({ thread: currentThread(), messages: conversations[currentThread()] });
            }
        };
        const channel = "BroadcastChannel" in window ? new BroadcastChannel("slotPhoneMessages") : null;
        if (!conversations.Jamie) conversations.Jamie = [];
        refreshRecipients();
        recipient?.addEventListener("change", () => {
            updateHeader();
            updateActions();
            render();
        });
        render();

        const sendMessage = () => {
            const text = input.value.trim();
            if (!text) return;
            (conversations[currentThread()] ||= []).push({ text, sent: true, time: Date.now() });
            input.value = "";
            render();
            persist();
            updateActions();
        };

        send.addEventListener("click", sendMessage);
        input.addEventListener("input", updateActions);
        input.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                sendMessage();
            }
        });
        sms?.addEventListener("click", () => {
            const phone = currentThread();
            const text = input.value.trim();
            if (phone === "Jamie") return toast("Choose one of your contacts first");
            if (!text) return toast("Write a message first");
            window.location.href = `sms:${encodeURIComponent(phone)}?&body=${encodeURIComponent(text)}`;
        });
        channel?.addEventListener("message", event => {
            if (!event.data?.thread || !Array.isArray(event.data.messages)) return;
            conversations[event.data.thread] = event.data.messages;
            if (event.data.thread === currentThread()) render();
        });
        document.addEventListener("slotphone:contacts-updated", () => refreshRecipients(currentThread()));
        window.addEventListener("storage", event => {
            if (event.key === "slotPhoneContacts") refreshRecipients(currentThread());
        });
        window.addEventListener("storage", event => {
            if (event.key !== key || !event.newValue) return;
            const latest = JSON.parse(event.newValue);
            if (latest && !Array.isArray(latest)) {
                conversations = latest;
                render();
            }
        });
    }

    function calculateAssistantMath(question) {
        let expression = question
            .toLowerCase()
            .replace(/,/g, "")
            .replace(/[?=]/g, " ")
            .replace(/^(?:please\s+)?(?:what(?:'s| is)|calculate|compute|solve|evaluate|how much is)\s+/i, "")
            .replace(/\bmultiplied\s+by\b|\btimes\b|\binto\b/g, "*")
            .replace(/\bdivided\s+by\b|\bover\b/g, "/")
            .replace(/\bplus\b/g, "+")
            .replace(/\bminus\b/g, "-")
            .replace(/\bto\s+the\s+power\s+of\b|\bpower\s+of\b/g, "^")
            .replace(/\bsquared\b/g, "^2")
            .replace(/\bcubed\b/g, "^3")
            .replace(/(\d)\s*x\s*(?=\d|\()/g, "$1 * ")
            .replace(/(\d+(?:\.\d+)?)\s*%\s+of\s+(\d+(?:\.\d+)?)/g, "($1 / 100) * ($2)")
            .replace(/[×·]/g, "*")
            .replace(/÷/g, "/")
            .trim();

        if (!expression || expression.length > 120 || /[a-z]/i.test(expression)) return null;
        const tokens = expression.match(/\d+(?:\.\d+)?|[()+\-*/^%]/g);
        if (!tokens || tokens.join("") !== expression.replace(/\s+/g, "")) return null;

        let cursor = 0;
        const parseExpression = () => {
            let value = parseTerm();
            while (tokens[cursor] === "+" || tokens[cursor] === "-") {
                const operator = tokens[cursor++];
                const right = parseTerm();
                value = operator === "+" ? value + right : value - right;
            }
            return value;
        };
        const parseTerm = () => {
            let value = parseUnary();
            while (tokens[cursor] === "*" || tokens[cursor] === "/") {
                const operator = tokens[cursor++];
                const right = parseUnary();
                if (operator === "/" && right === 0) throw new RangeError("Division by zero");
                value = operator === "*" ? value * right : value / right;
            }
            return value;
        };
        const parseUnary = () => {
            if (tokens[cursor] === "+") {
                cursor++;
                return parseUnary();
            }
            if (tokens[cursor] === "-") {
                cursor++;
                return -parseUnary();
            }
            let value = parsePower();
            if (tokens[cursor] === "%") {
                cursor++;
                value /= 100;
            }
            return value;
        };
        const parsePower = () => {
            let value = parsePrimary();
            if (tokens[cursor] === "^") {
                cursor++;
                value **= parseUnary();
            }
            return value;
        };
        const parsePrimary = () => {
            const token = tokens[cursor++];
            if (token === "(") {
                const value = parseExpression();
                if (tokens[cursor++] !== ")") throw new SyntaxError("Unclosed parenthesis");
                return value;
            }
            if (!token || !/^\d+(?:\.\d+)?$/.test(token)) throw new SyntaxError("Expected a number");
            return Number(token);
        };

        try {
            const value = parseExpression();
            if (cursor !== tokens.length || !Number.isFinite(value)) return null;
            const rounded = Number(value.toPrecision(12));
            return Number.isFinite(rounded) ? rounded : null;
        } catch (error) {
            if (error instanceof RangeError && /division by zero/i.test(error.message)) return "Division by zero is undefined.";
            return null;
        }
    }

    function setupAssistant() {
        const list = byId("assistant-messages");
        const form = byId("assistant-form");
        const input = byId("assistant-input");
        if (!list || !form || !input) return;
        const key = "slotPhoneAssistantChat";
        let messages = readLocal(key, []);
        if (!Array.isArray(messages)) messages = [];
        if (!messages.length) messages.push({ role: "assistant", text: "Hi! I can help with quick questions, simple math, and general reference lookups." });

        const render = () => {
            list.replaceChildren();
            messages.forEach(message => {
                const bubble = document.createElement("p");
                bubble.className = `assistant-message ${message.role}`;
                bubble.textContent = message.text;
                list.appendChild(bubble);
            });
            list.scrollTop = list.scrollHeight;
        };
        const persist = () => writeLocal(key, messages);
        const respond = async question => {
            const clean = question.trim();
            const mathAnswer = calculateAssistantMath(clean);
            if (mathAnswer !== null) {
                return typeof mathAnswer === "string" ? mathAnswer : `${clean.replace(/[?]+$/, "")} = ${mathAnswer}`;
            }
            if (/\b(hello|hi|hey)\b/i.test(clean)) return "Hello! What would you like to know?";
            if (/\b(time|date|day)\b/i.test(clean)) return `It is ${new Date().toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}.`;
            const topic = clean.replace(/^(who|what|where|when|why|how)\s+(is|are|was|were|do|does|did)\s+/i, "").replace(/[?!.]+$/, "").trim();
            if (!topic) return "Try asking a question or entering a calculation such as 18 * 7.";
            try {
                const params = new URLSearchParams({ action: "query", list: "search", srsearch: topic, srlimit: "1", format: "json", origin: "*" });
                const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
                if (!response.ok) throw new Error("Lookup failed");
                const data = await response.json();
                const result = data.query.search[0];
                if (!result) return `I couldn't find a reference result for “${topic}”. Try rephrasing it.`;
                const detailParams = new URLSearchParams({ action: "query", prop: "extracts", exintro: "1", explaintext: "1", exsentences: "3", titles: result.title, format: "json", origin: "*" });
                const detailResponse = await fetch(`https://en.wikipedia.org/w/api.php?${detailParams}`);
                if (!detailResponse.ok) throw new Error("Lookup failed");
                const detail = await detailResponse.json();
                const page = Object.values(detail.query.pages)[0];
                return `${page.extract || result.snippet.replace(/<[^>]*>/g, "") || result.title}\nSource: Wikipedia · ${result.title}`;
            } catch {
                return "I’m offline, so I can’t look up that topic right now. I can still help with greetings, the current date and time, and simple arithmetic.";
            }
        };
        render();
        form.addEventListener("submit", async event => {
            event.preventDefault();
            const question = input.value.trim();
            if (!question) return;
            messages.push({ role: "user", text: question });
            input.value = "";
            render();
            const pending = document.createElement("p");
            pending.className = "assistant-message assistant";
            pending.textContent = "Thinking…";
            list.appendChild(pending);
            list.scrollTop = list.scrollHeight;
            const answer = await respond(question);
            messages.push({ role: "assistant", text: answer });
            persist();
            render();
        });
        byId("assistant-clear")?.addEventListener("click", () => {
            messages = [{ role: "assistant", text: "Conversation cleared. What would you like to ask?" }];
            persist();
            render();
        });
        persist();
    }

    function resizeImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = reject;
            reader.onload = () => {
                const image = new Image();
                image.onerror = reject;
                image.onload = () => {
                    const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
                    const canvas = document.createElement("canvas");
                    canvas.width = Math.max(1, Math.round(image.width * scale));
                    canvas.height = Math.max(1, Math.round(image.height * scale));
                    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL("image/jpeg", 0.78));
                };
                image.src = reader.result;
            };
            reader.readAsDataURL(file);
        });
    }

    function setupPhotos() {
        const view = byId("photos");
        const grid = view?.querySelector(".photo-grid");
        if (!view || !grid) return;
        const controls = document.createElement("div");
        controls.className = "photo-actions";
        controls.innerHTML = '<button type="button" id="add-photo">＋ Add Photos</button><input id="photo-picker" type="file" accept="image/*" multiple hidden>';
        view.querySelector(".page-head").after(controls);
        const picker = byId("photo-picker");

        const addVideo = record => {
            const card = document.createElement("div");
            card.className = "photo-card recorded-video";
            card.dataset.videoUrl = URL.createObjectURL(record.blob);
            card.dataset.videoName = record.name;
            const preview = document.createElement("video");
            preview.src = card.dataset.videoUrl;
            preview.muted = true;
            preview.playsInline = true;
            preview.preload = "metadata";
            const label = document.createElement("span");
            label.textContent = `▶ ${record.name}`;
            card.append(preview, label);
            grid.prepend(card);
        };

        openCameraDatabase().then(database => {
            const request = database.transaction("videos", "readonly").objectStore("videos").getAll();
            request.onsuccess = () => {
                request.result.sort((left, right) => right.createdAt - left.createdAt).forEach(addVideo);
                database.close();
            };
        }).catch(() => {});
        window.addEventListener("slotphone:video-saved", event => addVideo(event.detail));

        function addPhoto(photo, persist) {
            const card = document.createElement("button");
            card.type = "button";
            card.className = "photo-card imported-photo";
            card.dataset.photo = photo.data;
            card.setAttribute("aria-label", `Open ${photo.name}`);
            const image = document.createElement("img");
            image.src = photo.data;
            image.alt = photo.name;
            const label = document.createElement("span");
            label.textContent = photo.name;
            card.append(image, label);
            grid.prepend(card);
            if (persist) {
                const photos = readLocal("slotPhonePhotos", []);
                photos.unshift(photo);
                writeLocal("slotPhonePhotos", photos);
            }
        }

        const renderSavedPhotos = () => [...readLocal("slotPhonePhotos", [])].reverse().forEach(photo => addPhoto(photo, false));
        renderSavedPhotos();
        window.addEventListener("slotphone:photos-updated", () => {
            grid.querySelectorAll(".imported-photo").forEach(card => card.remove());
            renderSavedPhotos();
        });
        byId("add-photo").addEventListener("click", () => picker.click());
        picker.addEventListener("change", async () => {
            for (const file of [...picker.files]) {
                if (!file.type.startsWith("image/")) continue;
                try {
                    addPhoto({ data: await resizeImage(file), name: file.name }, true);
                } catch {
                    toast(`Couldn't add ${file.name}`);
                }
            }
            picker.value = "";
        });

        grid.addEventListener("click", event => {
            const card = event.target.closest(".photo-card");
            if (!card) return;
            if (card.dataset.videoUrl) {
                const viewer = document.createElement("div");
                viewer.className = "photo-viewer";
                const video = document.createElement("video");
                video.src = card.dataset.videoUrl;
                video.controls = true;
                video.autoplay = true;
                video.playsInline = true;
                const close = document.createElement("button");
                close.type = "button";
                close.className = "photo-viewer-close";
                close.setAttribute("aria-label", "Close");
                close.textContent = "×";
                close.addEventListener("click", () => { video.pause(); viewer.remove(); });
                viewer.append(close, video);
                viewer.addEventListener("click", closeEvent => {
                    if (closeEvent.target === viewer) { video.pause(); viewer.remove(); }
                });
                document.body.appendChild(viewer);
                return;
            }
            const image = card.querySelector("img");
            const viewer = document.createElement("div");
            viewer.className = "photo-viewer";
            viewer.innerHTML = `<button type="button" class="photo-viewer-close" aria-label="Close">×</button>${image ? `<img src="${image.src}" alt="${escapeHTML(image.alt)}">` : `<div class="photo-emoji">${escapeHTML(card.textContent.trim())}</div>`}`;
            if (card.dataset.photo) {
                const preview = viewer.querySelector("img");
                const editor = document.createElement("div");
                editor.className = "photo-editor";
                let rotation = 0;
                const adjustments = { brightness: 100, contrast: 100, saturation: 100 };
                const updatePreview = () => {
                    preview.style.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`;
                    preview.style.transform = `rotate(${rotation}deg)`;
                };
                Object.keys(adjustments).forEach(name => {
                    const label = document.createElement("label");
                    label.textContent = `${name[0].toUpperCase()}${name.slice(1)} `;
                    const value = document.createElement("span");
                    value.textContent = "100%";
                    const slider = document.createElement("input");
                    slider.type = "range";
                    slider.min = "50";
                    slider.max = "150";
                    slider.value = "100";
                    slider.setAttribute("aria-label", name);
                    slider.addEventListener("input", () => {
                        adjustments[name] = Number(slider.value);
                        value.textContent = `${slider.value}%`;
                        updatePreview();
                    });
                    label.append(value, slider);
                    editor.appendChild(label);
                });
                const actions = document.createElement("div");
                actions.className = "photo-editor-actions";
                const rotate = document.createElement("button");
                rotate.type = "button";
                rotate.textContent = "Rotate";
                rotate.addEventListener("click", () => { rotation = (rotation + 90) % 360; updatePreview(); });
                const download = document.createElement("button");
                download.type = "button";
                download.textContent = "Download";
                const saveEdit = document.createElement("button");
                saveEdit.type = "button";
                saveEdit.textContent = "Save changes";
                const exportImage = () => new Promise((resolve, reject) => {
                    const source = new Image();
                    source.onerror = reject;
                    source.onload = () => {
                        const sideways = Math.abs(rotation % 180) === 90;
                        const canvas = document.createElement("canvas");
                        canvas.width = sideways ? source.naturalHeight : source.naturalWidth;
                        canvas.height = sideways ? source.naturalWidth : source.naturalHeight;
                        const context = canvas.getContext("2d");
                        context.translate(canvas.width / 2, canvas.height / 2);
                        context.rotate(rotation * Math.PI / 180);
                        context.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`;
                        context.drawImage(source, -source.naturalWidth / 2, -source.naturalHeight / 2);
                        resolve(canvas.toDataURL("image/jpeg", 0.92));
                    };
                    source.src = card.dataset.photo;
                });
                download.addEventListener("click", async () => {
                    try {
                        const link = document.createElement("a");
                        link.href = await exportImage();
                        link.download = `edited-${(image.alt || "photo").replace(/[^\w.-]+/g, "-")}.jpg`;
                        link.click();
                    } catch {
                        toast("Couldn’t export this photo");
                    }
                });
                saveEdit.addEventListener("click", async () => {
                    try {
                        const data = await exportImage();
                        const photos = readLocal("slotPhonePhotos", []);
                        const record = photos.find(photo => photo.data === card.dataset.photo);
                        if (!record) return toast("This photo is no longer in your library");
                        record.data = data;
                        if (writeLocal("slotPhonePhotos", photos)) {
                            card.dataset.photo = data;
                            image.src = data;
                            preview.src = data;
                            toast("Photo changes saved");
                        }
                    } catch {
                        toast("Couldn’t save this photo");
                    }
                });
                actions.append(rotate, download, saveEdit);
                editor.appendChild(actions);
                viewer.appendChild(editor);
                const remove = document.createElement("button");
                remove.type = "button";
                remove.className = "photo-delete";
                remove.textContent = "Delete Photo";
                remove.addEventListener("click", () => {
                    const photos = readLocal("slotPhonePhotos", []).filter(photo => photo.data !== card.dataset.photo);
                    if (writeLocal("slotPhonePhotos", photos)) {
                        card.remove();
                        viewer.remove();
                    }
                });
                viewer.appendChild(remove);
            }
            viewer.addEventListener("click", closeEvent => {
                if (closeEvent.target === viewer || closeEvent.target.closest(".photo-viewer-close")) viewer.remove();
            });
            document.body.appendChild(viewer);
        });
    }

    let cameraStream;
    let cameraFacingMode = "environment";
    let cameraRecorder;
    let cameraRecordingStarted = 0;
    let cameraChunks = [];

    function stopCamera() {
        if (cameraRecorder?.state === "recording") cameraRecorder.stop();
        cameraStream?.getTracks().forEach(track => track.stop());
        cameraStream = null;
        const video = byId("camera-video");
        if (video) video.srcObject = null;
        const recordButton = byId("camera-record");
        recordButton?.classList.remove("recording");
        if (recordButton) recordButton.textContent = "● REC";
    }

    async function startCamera() {
        const video = byId("camera-video");
        const status = byId("camera-status");
        if (!video || !navigator.mediaDevices?.getUserMedia) return;
        stopCamera();
        try {
            let hasMicrophone = true;
            try {
                cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: cameraFacingMode }, audio: true });
            } catch {
                hasMicrophone = false;
                cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: cameraFacingMode }, audio: false });
            }
            video.srcObject = cameraStream;
            video.play().catch(() => {});
            if (status) status.textContent = hasMicrophone ? "Camera and microphone ready" : "Camera ready · microphone unavailable";
        } catch {
            if (status) status.textContent = "Allow camera access, or add pictures in Photos.";
        }
    }

    function setupCamera() {
        const video = byId("camera-video");
        const status = byId("camera-status");
        if (!video) return;
        if (!navigator.mediaDevices?.getUserMedia) {
            if (status) status.textContent = "Camera access isn't available here. Add pictures in Photos instead.";
            return;
        }
        if (!video.dataset.controlsReady) {
            video.dataset.controlsReady = "true";
            byId("camera-stop")?.addEventListener("click", () => {
                stopCamera();
                if (status) status.textContent = "Camera paused";
            });
            byId("camera-switch")?.addEventListener("click", () => {
                cameraFacingMode = cameraFacingMode === "environment" ? "user" : "environment";
                startCamera();
            });
            byId("camera-capture")?.addEventListener("click", () => {
                if (!video.videoWidth) return toast("Start the camera before taking a photo");
                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext("2d").drawImage(video, 0, 0);
                const photos = readLocal("slotPhonePhotos", []);
                photos.unshift({ data: canvas.toDataURL("image/jpeg", 0.8), name: `Camera ${new Date().toLocaleString()}` });
                if (writeLocal("slotPhonePhotos", photos)) {
                    window.dispatchEvent(new Event("slotphone:photos-updated"));
                    toast("Saved to Photos");
                }
            });
            byId("camera-record")?.addEventListener("click", async event => {
                const button = event.currentTarget;
                if (cameraRecorder?.state === "recording") {
                    cameraRecorder.stop();
                    button.textContent = "● REC";
                    button.classList.remove("recording");
                    if (status) status.textContent = "Saving video to Photos…";
                    return;
                }
                if (!video.videoWidth || !cameraStream) return toast("Start the camera before recording");
                if (!window.MediaRecorder) return toast("Video recording isn’t supported in this browser");
                cameraChunks = [];
                const mimeType = ["video/mp4;codecs=h264,aac", "video/webm;codecs=vp9,opus", "video/webm"]
                    .find(type => MediaRecorder.isTypeSupported(type));
                try {
                    cameraRecorder = new MediaRecorder(cameraStream, mimeType ? { mimeType } : undefined);
                    cameraRecorder.addEventListener("dataavailable", recordingEvent => {
                        if (recordingEvent.data.size) cameraChunks.push(recordingEvent.data);
                    });
                    cameraRecorder.addEventListener("stop", async () => {
                        const blob = new Blob(cameraChunks, { type: cameraRecorder.mimeType || "video/webm" });
                        const extension = blob.type.includes("mp4") ? "mp4" : "webm";
                        const record = { blob, name: `Camera ${new Date(cameraRecordingStarted).toLocaleString()}.${extension}` };
                        try {
                            await saveCameraVideo(blob, record.name);
                            window.dispatchEvent(new CustomEvent("slotphone:video-saved", { detail: record }));
                            if (status) status.textContent = "Video saved to Photos";
                            toast("Video saved to Photos");
                        } catch {
                            if (status) status.textContent = "Couldn’t save the recording. Check device storage.";
                            toast("Couldn’t save the video");
                        }
                    });
                    cameraRecorder.start(500);
                    cameraRecordingStarted = Date.now();
                    button.textContent = "■ STOP";
                    button.classList.add("recording");
                    if (status) status.textContent = cameraStream.getAudioTracks().length ? "Recording video with audio…" : "Recording video without microphone audio…";
                } catch {
                    toast("Couldn’t start video recording");
                }
            });
            document.addEventListener("click", event => {
                if (event.target.closest("[data-home]") || event.target.closest('[data-open]:not([data-open="camera"])')) stopCamera();
            });
        }
        startCamera();
    }

    function setupPhoneAndContacts() {
        let number = "";
        const display = byId("phone-number");
        const telURI = value => `tel:${String(value).replace(/[^\d+*#]/g, "").replace(/#/g, "%23").replace(/\*/g, "%2A")}`;
        document.querySelectorAll("[data-dial]").forEach(button => button.addEventListener("click", () => {
            number += button.dataset.dial;
            if (display) display.textContent = number;
        }));
        byId("dial-clear")?.addEventListener("click", () => {
            number = number.slice(0, -1);
            if (display) display.textContent = number || "Enter number";
        });
        byId("dial-delete")?.addEventListener("click", () => {
            number = "";
            if (display) display.textContent = "Enter number";
        });
        byId("dial-call")?.addEventListener("click", () => {
            const callableNumber = number.replace(/[^\d+*#]/g, "");
            if (!callableNumber) return toast("Enter a number first");
            window.location.href = telURI(callableNumber);
        });

        const search = byId("contact-search");
        const list = byId("contact-list");
        const addForm = byId("contact-add-form");

        const addContactRow = (name, phone) => {
            const row = document.createElement("div");
            row.className = "contact-row";
            const avatar = document.createElement("div");
            avatar.className = "contact-avatar";
            avatar.textContent = name.trim().charAt(0).toUpperCase();
            const info = document.createElement("div");
            const nameLabel = document.createElement("b");
            nameLabel.textContent = name;
            const phoneLabel = document.createElement("small");
            phoneLabel.textContent = phone;
            info.append(nameLabel, phoneLabel);
            row.append(avatar, info);
            list.appendChild(row);
        };

        readLocal("slotPhoneContacts", []).forEach(contact => addContactRow(contact.name, contact.phone));
        list?.querySelectorAll(".contact-row").forEach(row => {
            const name = row.querySelector("b")?.textContent.trim() || "contact";
            const phone = row.querySelector("small")?.textContent.trim();
            if (!phone) return;
            const call = document.createElement("a");
            call.className = "contact-call";
            call.href = telURI(phone);
            call.textContent = "Call";
            call.setAttribute("aria-label", `Call ${name}`);
            row.appendChild(call);
        });
        addForm?.addEventListener("submit", event => {
            event.preventDefault();
            const nameInput = byId("contact-name-input");
            const phoneInput = byId("contact-phone-input");
            const name = nameInput.value.trim();
            const phone = phoneInput.value.trim();
            const normalized = phone.replace(/[\s().-]/g, "");
            if (!name || !/^\+?[\d*#]{3,}$/.test(normalized)) {
                toast("Enter a name and a valid phone number");
                return;
            }
            const contacts = readLocal("slotPhoneContacts", []);
            contacts.push({ name, phone });
            if (!writeLocal("slotPhoneContacts", contacts)) return;
            addContactRow(name, phone);
            const row = list.lastElementChild;
            const call = document.createElement("a");
            call.className = "contact-call";
            call.href = telURI(normalized);
            call.textContent = "Call";
            call.setAttribute("aria-label", `Call ${name}`);
            row.appendChild(call);
            document.dispatchEvent(new CustomEvent("slotphone:contacts-updated"));
            nameInput.value = "";
            phoneInput.value = "";
        });
        search?.addEventListener("input", () => {
            const query = search.value.trim().toLowerCase();
            list?.querySelectorAll(".contact-row").forEach(row => { row.hidden = !row.textContent.toLowerCase().includes(query); });
        });
        list?.addEventListener("click", event => {
            if (event.target.closest(".contact-call")) return;
            const row = event.target.closest(".contact-row");
            const phone = row?.querySelector("small")?.textContent.trim();
            if (!phone) return;
            openView("phone");
            number = phone.replace(/\D/g, "");
            if (display) display.textContent = number;
        });
    }

    function setupWeather() {
        const weatherCodes = {
            0: ["Clear sky", "☀️"], 1: ["Mainly clear", "🌤️"], 2: ["Partly cloudy", "⛅"], 3: ["Overcast", "☁️"],
            45: ["Fog", "🌫️"], 48: ["Rime fog", "🌫️"], 51: ["Light drizzle", "🌦️"], 53: ["Drizzle", "🌦️"], 55: ["Heavy drizzle", "🌧️"],
            61: ["Light rain", "🌦️"], 63: ["Rain", "🌧️"], 65: ["Heavy rain", "🌧️"], 71: ["Light snow", "🌨️"], 73: ["Snow", "❄️"], 75: ["Heavy snow", "❄️"],
            80: ["Rain showers", "🌦️"], 81: ["Showers", "🌧️"], 82: ["Heavy showers", "🌧️"], 95: ["Thunderstorm", "⛈️"], 96: ["Thunder and hail", "⛈️"], 99: ["Severe thunderstorm", "⛈️"]
        };
        const getWeather = async (latitude, longitude, location) => {
            const params = new URLSearchParams({
                latitude: String(latitude), longitude: String(longitude),
                current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m",
                daily: "weather_code,temperature_2m_max,temperature_2m_min",
                temperature_unit: "fahrenheit", wind_speed_unit: "mph", forecast_days: "5", timezone: "auto"
            });
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
            if (!response.ok) throw new Error("Weather service unavailable");
            const data = await response.json();
            const current = data.current;
            const description = weatherCodes[current.weather_code] || ["Current conditions", "🌡️"];
            const round = value => `${Math.round(value)}°`;
            const label = $("home-weather-label");
            if (label) label.textContent = location;
            if ($("weather-temp")) $("weather-temp").textContent = round(current.temperature_2m);
            if ($("home-weather-temp")) $("home-weather-temp").textContent = round(current.temperature_2m);
            if ($("weather-condition")) $("weather-condition").textContent = description[0];
            if ($("weather-feels")) $("weather-feels").textContent = `Feels like ${round(current.apparent_temperature)}`;
            if ($("home-weather-summary")) $("home-weather-summary").textContent = `${description[0]} · feels ${round(current.apparent_temperature)}`;
            if ($("weather-humidity")) $("weather-humidity").textContent = `💧 ${current.relative_humidity_2m}%`;
            if ($("weather-wind")) $("weather-wind").textContent = `💨 ${Math.round(current.wind_speed_10m)} mph`;
            if ($("weather-high")) $("weather-high").textContent = `⬆️ ${round(data.daily.temperature_2m_max[0])}`;
            if ($("weather-low")) $("weather-low").textContent = `⬇️ ${round(data.daily.temperature_2m_min[0])}`;
            const icon = document.querySelector("#weather .page-head > span");
            if (icon) icon.textContent = description[1];
            const forecast = $("weather-forecast");
            if (forecast) {
                forecast.replaceChildren();
                data.daily.time.forEach((day, index) => {
                    const [condition, symbol] = weatherCodes[data.daily.weather_code[index]] || ["Forecast", "🌡️"];
                    const row = document.createElement("div");
                    const weekday = document.createElement("b");
                    weekday.textContent = index === 0 ? "Today" : new Date(`${day}T12:00:00`).toLocaleDateString(undefined, { weekday: "short" });
                    const weatherIcon = document.createElement("span");
                    weatherIcon.textContent = symbol;
                    weatherIcon.setAttribute("aria-label", condition);
                    const range = document.createElement("strong");
                    range.textContent = `${Math.round(data.daily.temperature_2m_max[index])}° / ${Math.round(data.daily.temperature_2m_min[index])}°`;
                    row.append(weekday, weatherIcon, range);
                    forecast.appendChild(row);
                });
            }
        };
        const load = () => {
            const status = $("weather-condition");
            if (status) status.textContent = "Finding local forecast…";
            const fallback = () => getWeather(40.7128, -74.006, "New York · sample location").catch(() => {
                if (status) status.textContent = "Weather needs an internet connection";
                if ($("home-weather-summary")) $("home-weather-summary").textContent = "Forecast unavailable · tap to retry";
            });
            if (!navigator.geolocation) return fallback();
            navigator.geolocation.getCurrentPosition(
                position => getWeather(position.coords.latitude, position.coords.longitude, "Your location").catch(fallback),
                fallback,
                { timeout: 6000, maximumAge: 600000 }
            );
        };
        $("weather-refresh")?.addEventListener("click", load);
        load();
    }

    function setupBrowserAndMaps() {
        const browser = byId("browser");
        const input = byId("browser-url");
        const go = byId("browser-go");
        const results = byId("browser-results");
        if (browser && input && go && results) {
            let currentFrame;
            const pageHistory = [];
            let pageHistoryIndex = -1;
            const recent = readLocal("slotSearchRecent", []);
            const renderRecent = () => {
                browser.querySelector(".browser-shortcuts")?.querySelectorAll("[data-recent]").forEach(button => button.remove());
                recent.slice(0, 4).forEach(query => {
                    const button = document.createElement("button");
                    button.type = "button";
                    button.dataset.recent = query;
                    button.textContent = query;
                    button.addEventListener("click", () => search(query));
                    browser.querySelector(".browser-shortcuts")?.appendChild(button);
                });
            };

            async function openArticle(title) {
                results.innerHTML = '<p class="search-loading">Opening article…</p>';
                const params = new URLSearchParams({
                    action: "query", prop: "extracts|pageimages", exintro: "1", explaintext: "1",
                    pithumbsize: "480", titles: title, format: "json", origin: "*"
                });
                try {
                    const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
                    if (!response.ok) throw new Error("Search unavailable");
                    const data = await response.json();
                    const page = Object.values(data.query.pages)[0];
                    const article = document.createElement("article");
                    article.className = "search-article";
                    const back = document.createElement("button");
                    back.type = "button";
                    back.className = "search-back";
                    back.textContent = "‹ Results";
                    back.addEventListener("click", () => search(input.value, false));
                    const heading = document.createElement("h2");
                    heading.textContent = page.title;
                    article.append(back, heading);
                    if (page.thumbnail?.source) {
                        const image = document.createElement("img");
                        image.src = page.thumbnail.source;
                        image.alt = "";
                        article.appendChild(image);
                    }
                    const extract = document.createElement("p");
                    extract.textContent = page.extract || "No article summary is available.";
                    article.appendChild(extract);
                    const source = document.createElement("small");
                    source.textContent = "Article text from Wikipedia";
                    article.appendChild(source);
                    results.replaceChildren(article);
                } catch {
                    results.innerHTML = '<div class="search-empty"><strong>Can’t load this article right now</strong><p>Check your connection and try the search again.</p></div>';
                }
            }

            async function search(value = input.value, remember = true, fromHistory = false) {
                const query = value.trim();
                if (!query) {
                    results.innerHTML = '<div class="search-empty"><strong>What are you curious about?</strong><p>Type a topic, person, place, or question above.</p></div>';
                    input.focus();
                    return;
                }
                input.value = query;
                if (remember) {
                    const next = [query, ...recent.filter(item => item.toLowerCase() !== query.toLowerCase())].slice(0, 4);
                    recent.splice(0, recent.length, ...next);
                    writeLocal("slotSearchRecent", recent);
                    renderRecent();
                }
                const hasWhitespace = /\s/.test(query);
                const looksLikeUrl = /^(https?:\/\/|www\.)/i.test(query) || (!hasWhitespace && /^[\w-]+(?:\.[\w-]+)+(?:[/:?#].*)?$/i.test(query));
                if (looksLikeUrl) {
                    let url;
                    try {
                        url = new URL(/^https?:\/\//i.test(query) ? query : `https://${query}`);
                        if (!/^https?:$/.test(url.protocol)) throw new Error("Unsupported scheme");
                    } catch {
                        results.innerHTML = '<div class="search-empty"><strong>Enter a valid website address</strong></div>';
                        return;
                    }
                    browser.querySelector(".browser-home").hidden = true;
                    if (!fromHistory) {
                        pageHistory.splice(pageHistoryIndex + 1);
                        pageHistory.push(url.href);
                        pageHistoryIndex = pageHistory.length - 1;
                    }
                    input.value = url.href;
                    results.replaceChildren();
                    const toolbar = document.createElement("div");
                    toolbar.className = "browser-page-toolbar";
                    const label = document.createElement("span");
                    label.textContent = url.href;
                    const limitation = document.createElement("small");
                    limitation.textContent = "Some websites block in-app display. YouTube video links play here; other blocked pages may need a new tab.";
                    toolbar.append(label, limitation);
                    results.appendChild(toolbar);

                    if (/\.(avif|gif|jpe?g|png|svg|webp)(?:$|[?#])/i.test(url.href)) {
                        const image = document.createElement("img");
                        image.className = "browser-image";
                        image.src = url.href;
                        image.alt = url.pathname.split("/").pop() || "Web image";
                        image.addEventListener("error", () => {
                            image.replaceWith(Object.assign(document.createElement("p"), { textContent: "This image could not be loaded." }));
                        }, { once: true });
                        results.appendChild(image);
                    } else {
                        const youtubeId = url.hostname.match(/(?:^|\.)youtu(?:\.be|be\.com)$/i)
                            ? (url.hostname.endsWith("youtu.be") ? url.pathname.slice(1).split("/")[0] : url.searchParams.get("v") || url.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1])
                            : null;
                        const frame = document.createElement("iframe");
                        frame.className = "browser-frame";
                        frame.title = `Website: ${url.hostname}`;
                        frame.referrerPolicy = "strict-origin-when-cross-origin";
                        frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
                        frame.allowFullscreen = true;
                        frame.src = youtubeId ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}` : url.href;
                        currentFrame = frame;
                        results.appendChild(frame);
                        const blockedMessage = document.createElement("p");
                        blockedMessage.className = "browser-frame-blocked";
                        blockedMessage.textContent = "This site does not allow its page to appear inside another app. Use the link below to open it in a browser tab.";
                        blockedMessage.hidden = true;
                        frame.addEventListener("error", () => { blockedMessage.hidden = false; });
                        window.setTimeout(() => {
                            try {
                                if (currentFrame === frame && !frame.contentDocument?.body?.childElementCount) blockedMessage.hidden = false;
                            } catch {
                                if (currentFrame === frame) blockedMessage.hidden = false;
                            }
                        }, 2500);
                        results.appendChild(blockedMessage);
                        const openLink = document.createElement("a");
                        openLink.className = "browser-external-link";
                        openLink.href = url.href;
                        openLink.target = "_blank";
                        openLink.rel = "noopener noreferrer";
                        openLink.textContent = "Open this website in a browser tab ↗";
                        results.appendChild(openLink);
                    }
                    return;
                }
                browser.querySelector(".browser-home").hidden = false;
                results.innerHTML = '<p class="search-loading">Searching…</p>';
                const params = new URLSearchParams({ action: "query", list: "search", srsearch: query, srlimit: "8", format: "json", origin: "*" });
                try {
                    const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
                    if (!response.ok) throw new Error("Search unavailable");
                    const data = await response.json();
                    const items = data.query.search || [];
                    if (!items.length) {
                        results.innerHTML = '<div class="search-empty"><strong>No matching pages</strong><p>Try a shorter or different search.</p></div>';
                        return;
                    }
                    const header = document.createElement("p");
                    header.className = "search-count";
                    header.textContent = `${data.query.searchinfo.totalhits.toLocaleString()} results`;
                    const list = document.createElement("div");
                    list.className = "search-result-list";
                    items.forEach(item => {
                        const card = document.createElement("article");
                        card.className = "search-result";
                        const title = document.createElement("button");
                        title.type = "button";
                        title.className = "search-result-title";
                        title.textContent = item.title;
                        title.addEventListener("click", () => openArticle(item.title));
                        const snippet = document.createElement("p");
                        const parsed = new DOMParser().parseFromString(item.snippet, "text/html");
                        snippet.textContent = parsed.body.textContent;
                        const open = document.createElement("button");
                        open.type = "button";
                        open.className = "search-result-open";
                        open.textContent = "Read summary →";
                        open.addEventListener("click", () => openArticle(item.title));
                        card.append(title, snippet, open);
                        list.appendChild(card);
                    });
                    results.replaceChildren(header, list);
                } catch {
                    results.innerHTML = '<div class="search-empty"><strong>Search needs an internet connection</strong><p>Your search stays in Safari. Try again when you’re online.</p><button type="button" id="search-retry">Try again</button></div>';
                    byId("search-retry")?.addEventListener("click", () => search(query, false));
                }
            }

            go.addEventListener("click", () => search());
            input.addEventListener("keydown", event => { if (event.key === "Enter") search(); });
            browser.querySelectorAll("[data-search-term]").forEach(button => button.addEventListener("click", () => search(button.dataset.searchTerm)));
            byId("browser-back")?.addEventListener("click", () => {
                if (pageHistoryIndex > 0) search(pageHistory[--pageHistoryIndex], false, true);
                else {
                    browser.querySelector(".browser-home").hidden = false;
                    results.replaceChildren();
                    currentFrame = null;
                }
            });
            byId("browser-forward")?.addEventListener("click", () => {
                if (pageHistoryIndex < pageHistory.length - 1) search(pageHistory[++pageHistoryIndex], false, true);
            });
            byId("browser-reload")?.addEventListener("click", () => {
                if (currentFrame) currentFrame.src = currentFrame.src;
                else search(input.value, false);
            });
            renderRecent();
        }
        byId("open-real-maps")?.addEventListener("click", () => window.open("https://maps.google.com/?q=SlotPhone+City", "_blank", "noopener,noreferrer"));
    }

    function setupCalendar() {
        const grid = byId("calendar-grid");
        const monthLabel = byId("cal-month");
        if (!grid || !monthLabel) return;
        let month = new Date();
        month = new Date(month.getFullYear(), month.getMonth(), 1);
        let selected = new Date();
        const eventLabel = byId("cal-selected-date");
        const eventInput = byId("calendar-event-input");
        const eventList = byId("calendar-events");
        const events = readLocal("slotPhoneCalendarEvents", {});
        const dateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        const render = () => {
            monthLabel.textContent = month.toLocaleDateString(undefined, { month: "long", year: "numeric" });
            grid.replaceChildren();
            const offset = (month.getDay() + 6) % 7;
            const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
            for (let blank = 0; blank < offset; blank++) grid.appendChild(document.createElement("span"));
            for (let day = 1; day <= days; day++) {
                const button = document.createElement("button");
                button.type = "button";
                button.textContent = day;
                button.dataset.day = day;
                const date = new Date(month.getFullYear(), month.getMonth(), day);
                if (date.toDateString() === new Date().toDateString()) button.classList.add("today");
                if (date.toDateString() === selected.toDateString()) button.classList.add("selected-day");
                grid.appendChild(button);
            }
        };
        const renderEvents = () => {
            if (eventLabel) eventLabel.textContent = selected.toLocaleDateString(undefined, { month: "short", day: "numeric" });
            if (!eventList) return;
            eventList.replaceChildren();
            (events[dateKey(selected)] || []).forEach((text, index) => {
                const row = document.createElement("div");
                row.className = "calendar-event";
                row.innerHTML = `<span>${escapeHTML(text)}</span><button type="button" data-calendar-delete="${index}" aria-label="Delete event">×</button>`;
                eventList.appendChild(row);
            });
            if (!(events[dateKey(selected)] || []).length) eventList.innerHTML = '<p class="calendar-empty">No events for this day</p>';
        };
        const moveMonth = amount => {
            month.setMonth(month.getMonth() + amount);
            const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
            selected = new Date(month.getFullYear(), month.getMonth(), Math.min(selected.getDate(), lastDay));
            render();
            renderEvents();
        };
        byId("cal-prev")?.addEventListener("click", () => moveMonth(-1));
        byId("cal-next")?.addEventListener("click", () => moveMonth(1));
        grid.addEventListener("click", event => {
            const day = event.target.closest("[data-day]");
            if (!day) return;
            selected = new Date(month.getFullYear(), month.getMonth(), Number(day.dataset.day));
            render();
            renderEvents();
            toast(selected.toLocaleDateString(undefined, { dateStyle: "long" }));
        });
        const addEvent = () => {
            const text = eventInput?.value.trim();
            if (!text) return;
            (events[dateKey(selected)] ||= []).push(text);
            writeLocal("slotPhoneCalendarEvents", events);
            eventInput.value = "";
            renderEvents();
        };
        byId("calendar-event-add")?.addEventListener("click", addEvent);
        eventInput?.addEventListener("keydown", event => { if (event.key === "Enter") addEvent(); });
        eventList?.addEventListener("click", event => {
            const remove = event.target.closest("[data-calendar-delete]");
            if (!remove) return;
            events[dateKey(selected)].splice(Number(remove.dataset.calendarDelete), 1);
            writeLocal("slotPhoneCalendarEvents", events);
            renderEvents();
        });
        render();
        renderEvents();
    }

    function setupReminders() {
        const list = byId("reminder-list");
        const input = byId("reminder-input");
        const add = byId("add-reminder");
        if (!list || !input || !add) return;
        const key = "slotPhoneReminders";
        let reminders = readLocal(key, []);
        const render = () => {
            list.replaceChildren();
            reminders.forEach((reminder, index) => {
                const row = document.createElement("div");
                row.className = `reminder-row${reminder.done ? " done" : ""}`;
                row.innerHTML = `<button class="check-circle" data-reminder-check="${index}" aria-label="Toggle reminder">${reminder.done ? "✓" : ""}</button><span>${escapeHTML(reminder.text)}</span><button data-reminder-delete="${index}" aria-label="Delete reminder">×</button>`;
                list.appendChild(row);
            });
            if (!reminders.length) list.innerHTML = '<p class="empty-state">No reminders yet</p>';
        };
        const create = () => {
            const text = input.value.trim();
            if (!text) return;
            reminders.push({ text, done: false });
            input.value = "";
            writeLocal(key, reminders);
            render();
        };
        add.addEventListener("click", create);
        input.addEventListener("keydown", event => { if (event.key === "Enter") create(); });
        list.addEventListener("click", event => {
            const check = event.target.closest("[data-reminder-check]");
            const remove = event.target.closest("[data-reminder-delete]");
            if (check) reminders[Number(check.dataset.reminderCheck)].done = !reminders[Number(check.dataset.reminderCheck)].done;
            if (remove) reminders.splice(Number(remove.dataset.reminderDelete), 1);
            if (check || remove) { writeLocal(key, reminders); render(); }
        });
        render();
    }

    function setupFiles() {
        const picker = byId("file-picker");
        const list = byId("file-list");
        const search = byId("file-search");
        if (!picker || !list) return;
        picker.addEventListener("change", () => {
            [...picker.files].forEach(file => {
                const row = document.createElement("a");
                row.className = "file-row user-file";
                row.href = URL.createObjectURL(file);
                row.target = "_blank";
                row.rel = "noopener";
                row.innerHTML = `<span>${file.type.startsWith("image/") ? "🖼️" : file.type.startsWith("audio/") ? "🎵" : "📄"}</span><div><b>${escapeHTML(file.name)}</b><small>${(file.size / 1024).toFixed(1)} KB · Open file</small></div><strong>↗</strong>`;
                list.appendChild(row);
            });
            picker.value = "";
        });
        search?.addEventListener("input", () => {
            const query = search.value.trim().toLowerCase();
            list.querySelectorAll(".file-row").forEach(row => { row.hidden = !row.textContent.toLowerCase().includes(query); });
        });
    }

    function setupMail() {
        document.querySelectorAll(".mail-item").forEach(item => {
            item.tabIndex = 0;
            item.setAttribute("role", "button");
            const openMail = () => {
                const sender = item.querySelector("b")?.textContent.trim() || "Message";
                const subject = item.querySelector("strong")?.textContent.trim() || "";
                const body = item.querySelector("p")?.textContent.trim() || "";
                const dialog = document.createElement("dialog");
                dialog.className = "mail-dialog";
                dialog.innerHTML = `<form method="dialog"><button class="photo-viewer-close" aria-label="Close">×</button></form><p class="eyebrow">${escapeHTML(sender)}</p><h2>${escapeHTML(subject)}</h2><p>${escapeHTML(body)}</p>`;
                const reply = document.createElement("form");
                reply.className = "mail-reply-form";
                reply.innerHTML = '<input type="email" name="to" placeholder="Recipient email" autocomplete="email" required><textarea name="body" placeholder="Write your reply…" required></textarea><button class="game-button" type="submit">Open Email App</button>';
                reply.addEventListener("submit", event => {
                    event.preventDefault();
                    const recipient = reply.querySelector('[name="to"]').value.trim();
                    const message = reply.querySelector('[name="body"]').value.trim();
                    const replySubject = /^re:/i.test(subject) ? subject : `Re: ${subject}`;
                    const replyBody = `${message}\n\n--- Original message ---\n${body}`;
                    const address = encodeURIComponent(recipient).replace(/%40/gi, "@");
                    window.location.href = `mailto:${address}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyBody)}`;
                });
                dialog.appendChild(reply);
                dialog.addEventListener("close", () => dialog.remove());
                document.body.appendChild(dialog);
                dialog.showModal();
            };
            item.addEventListener("click", openMail);
            item.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openMail(); } });
        });
    }

    function setupSettingsAndStore() {
        document.querySelectorAll("[data-setting]").forEach(button => {
            const setting = button.dataset.setting;
            button.classList.toggle("active", Boolean(state[setting]));
            button.setAttribute("aria-pressed", String(Boolean(state[setting])));
            button.addEventListener("click", () => {
                state[setting] = !state[setting];
                button.classList.toggle("active", state[setting]);
                button.setAttribute("aria-pressed", String(state[setting]));
                save();
                applySettings();
            });
        });
        byId("reset-phone")?.addEventListener("click", () => {
            if (!confirm("Reset SlotPhone and clear its saved app data from this device?")) return;
            [SAVE_KEY, "slotPhoneMessages", "slotPhonePhotos", "slotPhoneReminders", "slotPhoneContacts", "slotPhoneSocialAuthor", "slotPhoneShortsLiked", "slotPhoneShortsSaved", "slotSearchRecent", "slotphone_custom_wallpaper", "slotphone_wallpaper_preset", "slotphone_wallpaper_tint"].forEach(key => localStorage.removeItem(key));
            const finishReset = () => location.reload();
            if (!window.indexedDB) return finishReset();
            let remaining = 2;
            ["slotPhoneShorts", "slotPhoneCameraMedia"].forEach(databaseName => {
                const deletion = indexedDB.deleteDatabase(databaseName);
                const complete = () => { if (--remaining === 0) finishReset(); };
                deletion.onsuccess = complete;
                deletion.onerror = complete;
                deletion.onblocked = complete;
            });
        });
        const prices = { double: 100, neon: 250, badge: 500, coinBoost: 750 };
        document.querySelectorAll("[data-buy]").forEach(button => {
            const product = button.dataset.buy;
            const render = () => {
                button.disabled = Boolean(state.owned[product]);
                button.textContent = state.owned[product] ? "Owned" : `Buy · ${prices[product]} coins`;
            };
            render();
            button.addEventListener("click", () => {
                if (state.owned[product]) return;
                if (state.coins < prices[product]) return toast("Not enough coins");
                state.coins -= prices[product];
                state.owned[product] = true;
                if (product === "neon") state.neon = true;
                save();
                applySettings();
                updateUI();
                render();
                toast("Purchase complete");
            });
        });
        setupAppCatalog();
    }

    function setupAppCatalog() {
        const catalog = byId("app-catalog");
        const search = byId("app-store-search");
        const clearSearch = byId("app-store-clear");
        const feature = document.querySelector(".app-store-feature");
        const categoryShelf = document.querySelector(".app-store-shelf");
        const listHeading = byId("app-store-list-title");
        const listKicker = byId("app-store-kicker");
        const appCount = byId("app-store-count");
        const detail = byId("app-store-detail");
        const detailIcon = byId("app-store-detail-icon");
        const detailName = byId("app-store-detail-name");
        const detailSubtitle = byId("app-store-detail-subtitle");
        const detailDescription = byId("app-store-detail-description");
        const detailAction = byId("app-store-detail-action");
        const detailRemove = byId("app-store-detail-remove");
        const detailStats = document.querySelector(".app-store-detail-stats");
        const detailPreview = document.querySelector(".app-store-preview");
        const detailPreviewCopy = byId("app-store-preview-copy");
        const detailPreviewScene = byId("app-store-preview-scene");
        const detailPlay = byId("app-store-detail-play");
        const detailNewTab = byId("app-store-detail-new-tab");
        const tiles = [...document.querySelectorAll("#home-app-grid .app-tile[data-open]")];
        const gamePreviewSamples = {
            clicker: ["MEGA CLICKER", "1,280 COINS", ["🪙", "🪙", "✨", "🪙", "⚡", "🪙", "🪙", "💰"]],
            snake: ["SNAKE", "SCORE 08", ["🟩", "🟩", "🟩", "🍎", "⬛", "⬛", "🟩", "⬛"]],
            bricks: ["BRICK BREAKER", "LEVEL 03", ["🟥", "🟧", "🟨", "🟩", "🟦", "🟪", "⬛", "⚪"]],
            pong: ["PONG", "YOU 04  ·  CPU 02", ["▮", "⬛", "⬛", "⚪", "⬛", "⬛", "⬛", "▮"]],
            reaction: ["REACTION TEST", "READY…", ["⬛", "⬛", "🟢", "⬛", "⬛", "⬛", "⬛", "⬛"]],
            memory: ["MEMORY MATCH", "PAIRS 2 / 6", ["🌙", "❔", "⭐", "❔", "⭐", "🌙", "❔", "❔"]],
            "2048": ["2048 DROP", "SCORE 128 · NEXT 4", ["2", "2", "4", "·", "·", "8", "·", "16"]],
            "block-blast": ["BLOCK BLAST", "CLEAR ROWS + COLUMNS", ["🟦", "🟦", "🟦", "🟦", "🟪", "🟪", "🟪", "🟪"]],
            number: ["NUMBER GUESS", "4 TRIES LEFT", ["1", "2", "3", "4", "5", "6", "7", "8"]],
            color: ["COLOR SWITCH", "PICK BLUE", ["🔵", "🟡", "🔴", "🟣", "🟢", "🟠", "🔵", "🟣"]],
            stack: ["STACKER", "HEIGHT 12", ["🟪", "🟪", "🟦", "🟦", "🟩", "🟩", "🟨", "🟨"]],
            target: ["TARGET TAP", "TIME 00:18", ["🎯", "·", "·", "·", "·", "🎯", "·", "·"]],
            dodge: ["DODGE", "SCORE 240", ["⬛", "🟥", "⬛", "⬛", "⬛", "⬛", "🔵", "⬛"]],
            road: ["ROAD RUSH", "DISTANCE 1.2 KM", ["🚙", "⬛", "🚗", "⬛", "⬛", "🏎️", "🔵", "⬛"]],
            space: ["SPACE DEFENDER", "WAVE 04", ["👾", "·", "👾", "·", "·", "🚀", "·", "·"]],
            coins: ["COIN CATCHER", "COINS 16", ["🪙", "💎", "·", "💣", "·", "🧺", "·", "🪙"]],
            mines: ["MINESWEEPER", "MINES 10 · TIME 00:28", ["1", "1", "·", "💣", "1", "1", "·", "·"]],
            sudoku: ["SUDOKU", "PUZZLE 01 · 30 CLUES", ["5", "3", "·", "·", "7", "·", "·", "·"]],
            typing: ["SPEED TYPE", "WPM 42", ["T", "Y", "P", "E", "·", "F", "A", "S"]],
            math: ["MATH RUSH", "7 + 5 = ?", ["9", "10", "11", "12", "13", "14", "15", "16"]],
            tictactoe: ["TIC-TAC-TOE", "YOUR MOVE", ["×", "·", "○", "·", "×", "·", "○", "·", "×"]],
            whack: ["WHACK-A-SPOT", "HITS 09", ["·", "🔨", "·", "·", "·", "·", "🔨", "·"]],
            trivia: ["QUICK TRIVIA", "QUESTION 3 / 5", ["A", "B", "C", "D", "✓", "·", "·", "·"]],
            letterlock: ["LETTER LOCK", "GUESSES 3 / 6", ["L", "E", "T", "T", "E", "R", "·", "·", "·", "·"]],
            simon: ["SIMON SAYS", "ROUND 05", ["🟢", "🔴", "🟡", "🔵", "🟢", "·", "·", "·"]],
            lightsout: ["LIGHTS OUT", "MOVES 12", ["🟡", "·", "🟡", "·", "🟡", "🟡", "🟡", "·"]],
            tetris: ["TETRIS", "SCORE 1,240 · LEVEL 03", ["🟪", "🟪", "🟦", "🟦", "🟦", "🟩", "🟩", "🟧"]],
            "sand-tetris": ["SAND TETRIS", "LINK YELLOW · CLEAR", ["🟡", "🟡", "🟡", "🟡", "🟡", "🟡", "🟡", "🟡"]],
            "ap-world-empire-quest": ["EMPIRE QUEST", "YOUR EMPIRE AWAITS", ["🌍", "🏛️", "📜", "🧭", "🏺", "⚔️", "🗺️", "✨"]],
            "little-bean-cafe": ["LITTLE BEAN CAFÉ", "TODAY'S ORDERS", ["☕", "🥐", "🧋", "🍰", "🫘", "🍪", "🥛", "✨"]],
            "apex-racing-3d": ["APEX RACING 3D", "RACE READY", ["🏁", "🏎️", "🏎️", "🏆", "⚡", "🛞", "🌆", "🏁"]],
            "chess-arena-3d": ["CHESS ARENA 3D", "WHITE TO MOVE", ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"]],
            "black-jack": ["BLACK JACK", "DEALER  ·  17", ["🂡", "🂱", "🂾", "🃁", "🃏", "🂭", "🂫", "🂷"]],
            "game-v2": ["GAME V2 · COIN COLLECTOR", "WORLD 1  ·  0 / 40 COINS", ["🪙", "🟩", "🪙", "🟦", "⭐", "🟩", "💿", "🪙"]]
        };
        const appDetails = {
            weather: ["Live forecasts for wherever you are.", "Weather"],
            slotify: ["Find a soundtrack for every moment.", "Entertainment"],
            messages: ["Stay close with conversations and quick replies.", "Social"],
            phone: ["A simple dial pad and your favorite contacts.", "Communication"],
            camera: ["Capture photos and videos right from your phone.", "Photo & video"],
            photos: ["A home for your favorite moments.", "Photo & video"],
            shorts: ["Watch, save, and share short videos.", "Entertainment"],
            maps: ["Explore the map and find your way around.", "Navigation"],
            calendar: ["Keep your plans and events in one place.", "Productivity"],
            reminders: ["Make a list. Check things off. Feel good.", "Productivity"],
            notes: ["Catch an idea before it gets away.", "Productivity"],
            mail: ["A tidy inbox for the notes that matter.", "Productivity"],
            browser: ["Search the web and revisit your favorite places.", "Utilities"],
            files: ["Keep your documents and downloads together.", "Utilities"],
            contacts: ["Keep the important people close.", "Communication"],
            calculator: ["Quick calculations, whenever you need them.", "Utilities"],
            clock: ["World time, alarms, and a handy timer.", "Utilities"],
            settings: ["Make this phone feel like yours.", "Utilities"],
            assistant: ["Get quick answers from your on-device helper.", "Productivity"]
        };
        const appNames = new Set();
        const apps = tiles.map(tile => {
            const id = tile.dataset.open;
            const name = tile.querySelector("b")?.textContent.trim() || tile.dataset.name;
            const [description, category] = appDetails[id] || ["A helpful app for your phone.", "Utilities"];
            return {
                id,
                name,
                icon: tile.querySelector(".app-icon")?.textContent.trim() || "◉",
                iconClass: tile.querySelector(".app-icon")?.className || "",
                tile,
                category,
                description,
                subtitle: description,
                developer: "SlotPhone",
                size: "12 MB",
                isGame: false
            };
        }).filter(app => {
            if (app.id === "games" || app.id === "store" || appNames.has(app.id)) return false;
            appNames.add(app.id);
            return true;
        });
        const gameApps = games.map(game => ({
            id: `game:${game.id}`,
            name: game.name,
            icon: game.icon,
            iconImage: game.iconImage,
            iconHue: downloadedAppHue(game.id),
            gameTheme: game.id,
            category: "Games",
            subtitle: game.desc,
            description: `${game.desc} Jump in for a quick round, then try to beat your best score.`,
            developer: "SlotPhone Games",
            size: "18 MB",
            isGame: true,
            game
        }));
        const standaloneGameApps = standaloneGames.map(game => ({
            id: `external:${game.id}`,
            name: game.name,
            icon: game.icon,
            iconImage: game.iconImage,
            iconHue: downloadedAppHue(game.id),
            gameTheme: game.id,
            category: "Games",
            subtitle: game.subtitle || "A new game to explore.",
            description: game.description || `${game.name} is ready to play on your phone. Install it to add a shortcut to your home screen.`,
            developer: "SlotPhone Games",
            size: "24 MB",
            isGame: true,
            standaloneGame: game
        }));
        if (!Array.isArray(state.installedApps)) state.installedApps = apps.map(app => app.id);

        const allApps = [...apps, ...gameApps, ...standaloneGameApps];
        let activeTab = "today";
        let activeCategory = "";
        let selectedApp = null;

        const installed = app => app.game
            ? state.installedGames.includes(app.game.id)
            : app.standaloneGame
                ? state.installedApps.includes(app.id)
                : state.installedApps.includes(app.id);

        const setActionLabel = (button, app) => {
            const isInstalled = installed(app);
            button.textContent = isInstalled ? "Open" : "Get";
            button.setAttribute("aria-label", `${isInstalled ? "Open" : "Get"} ${app.name}`);
            button.classList.toggle("installed", isInstalled);
        };

        const updateDetail = app => {
            if (!app || !detail) return;
            detailIcon.replaceChildren();
            detailIcon.className = `app-store-detail-icon ${app.iconClass || ""}`;
            detailIcon.classList.toggle("downloaded-app-icon", app.iconHue !== undefined);
            detailIcon.classList.toggle("has-app-image", Boolean(app.iconImage));
            if (app.gameTheme) detailIcon.dataset.gameTheme = app.gameTheme;
            else delete detailIcon.dataset.gameTheme;
            if (app.iconHue !== undefined) detailIcon.style.setProperty("--downloaded-app-hue", app.iconHue);
            else detailIcon.style.removeProperty("--downloaded-app-hue");
            if (app.iconImage) {
                const image = document.createElement("img");
                image.src = app.iconImage;
                image.alt = "";
                detailIcon.appendChild(image);
            } else {
                detailIcon.textContent = app.icon;
            }
            detailName.textContent = app.name;
            detailSubtitle.textContent = app.subtitle;
            detailDescription.textContent = app.description;
            detailStats.replaceChildren();
            [
                ["CATEGORY", app.category],
                ["DEVELOPER", app.developer],
                ["SIZE", app.size]
            ].forEach(([label, value]) => {
                const stat = document.createElement("div");
                const valueElement = document.createElement("b");
                const labelElement = document.createElement("small");
                valueElement.textContent = value;
                labelElement.textContent = label;
                stat.append(valueElement, labelElement);
                detailStats.appendChild(stat);
            });
            detailPreview.classList.toggle("games-preview", app.isGame);
            detailPreviewCopy.replaceChildren();
            detailPreviewScene.replaceChildren();
            if (app.isGame) {
                const gameId = app.game?.id || app.standaloneGame?.id;
                const [sampleTitle, sampleStatus, tiles] = gamePreviewSamples[gameId] || [
                    app.name.toUpperCase(),
                    "READY TO PLAY",
                    [app.icon, "✨", "🎮", "🏆", "·", app.icon, "·", "⚡"]
                ];
                const caption = document.createElement("div");
                caption.className = "game-preview-caption";
                const title = document.createElement("b");
                title.textContent = sampleTitle;
                const status = document.createElement("small");
                status.textContent = sampleStatus;
                caption.append(title, status);
                const board = document.createElement("div");
                board.className = `game-preview-board game-preview-${gameId}`;
                tiles.forEach((value, index) => {
                    const tile = document.createElement("span");
                    tile.className = "game-preview-tile";
                    tile.classList.toggle("highlight", index % 3 === 0);
                    tile.textContent = value;
                    board.appendChild(tile);
                });
                detailPreviewCopy.textContent = "A look inside";
                detailPreviewScene.append(caption, board);
            } else {
                const text = document.createElement("span");
                text.className = "app-preview-icon";
                if (app.iconImage) {
                    const image = document.createElement("img");
                    image.src = app.iconImage;
                    image.alt = "";
                    text.appendChild(image);
                } else {
                    text.textContent = app.icon;
                }
                detailPreviewCopy.textContent = "Made for your everyday";
                detailPreviewScene.appendChild(text);
            }
            detailPlay.hidden = !app.isGame;
            detailNewTab.hidden = !app.isGame;
            if (app.isGame) {
                detailNewTab.href = gameNewTabUrl(app.game?.id || app.standaloneGame?.id);
            }
            setActionLabel(detailAction, app);
            detailRemove.hidden = !installed(app);
            detailRemove.textContent = app.game || app.standaloneGame ? "Uninstall app" : "Remove from Home Screen";
            detailRemove.setAttribute("aria-label", app.game || app.standaloneGame
                ? `Uninstall ${app.name}`
                : `Remove ${app.name} from Home Screen`);
        };

        const showDetail = app => {
            selectedApp = app;
            updateDetail(app);
            detail.hidden = false;
            catalog.hidden = true;
            byId("app-store-detail-back").focus();
            if (feature) feature.hidden = true;
            if (categoryShelf) categoryShelf.hidden = true;
            document.querySelector(".app-store-list-heading").hidden = true;
            document.querySelector(".app-store-extras").hidden = true;
            document.querySelector(".app-store-tabs").hidden = true;
            document.querySelector(".app-store-search").hidden = true;
            byId("store").scrollTop = 0;
        };

        const hideDetail = () => {
            selectedApp = null;
            detail.hidden = true;
            catalog.hidden = false;
            document.querySelector(".app-store-list-heading").hidden = false;
            document.querySelector(".app-store-extras").hidden = false;
            document.querySelector(".app-store-tabs").hidden = false;
            document.querySelector(".app-store-search").hidden = false;
            byId("store").scrollTop = 0;
            render();
        };

        const launch = app => {
            if (app.game) {
                startGame(app.game.id);
            } else if (app.standaloneGame) {
                openStandaloneGame(app.standaloneGame.id);
            } else {
                openView(app.id);
            }
        };

        detailPlay?.addEventListener("click", () => {
            if (selectedApp?.isGame) launch(selectedApp);
        });

        const installOrOpen = app => {
            if (installed(app)) {
                launch(app);
                return;
            }
            if (app.game) {
                state.installedGames.push(app.game.id);
                renderGameApps();
            } else if (app.standaloneGame) {
                state.installedApps.push(app.id);
                renderStandaloneGameApps();
            } else {
                state.installedApps.push(app.id);
                tiles.filter(tile => tile.dataset.open === app.id).forEach(tile => { tile.hidden = false; });
            }
            save();
            render();
            if (selectedApp) updateDetail(selectedApp);
            toast(`${app.name} is ready on your home screen`);
        };

        const removeFromHome = app => {
            if (app.game) {
                state.installedGames = state.installedGames.filter(id => id !== app.game.id);
                renderGameApps();
            } else if (app.standaloneGame) {
                state.installedApps = state.installedApps.filter(id => id !== app.id);
                renderStandaloneGameApps();
            } else {
                state.installedApps = state.installedApps.filter(id => id !== app.id);
                tiles.filter(tile => tile.dataset.open === app.id).forEach(tile => { tile.hidden = true; });
            }
            save();
            render();
            if (selectedApp) updateDetail(selectedApp);
            toast(app.game || app.standaloneGame
                ? `${app.name} uninstalled`
                : `${app.name} removed from your home screen`);
        };

        const render = () => {
            if (!catalog) return;
            const query = search?.value.trim().toLowerCase() || "";
            const searched = Boolean(query);
            const tabButtons = document.querySelectorAll("[data-store-tab]");
            tabButtons.forEach(button => {
                const active = button.dataset.storeTab === activeTab;
                button.classList.toggle("active", active);
                button.setAttribute("aria-pressed", String(active));
            });
            document.querySelectorAll("[data-store-category]").forEach(button => {
                button.classList.toggle("active", button.dataset.storeCategory === activeCategory);
            });
            if (clearSearch) clearSearch.hidden = !searched;
            if (feature) feature.hidden = activeTab !== "today" || searched;
            if (categoryShelf) categoryShelf.hidden = activeTab !== "today" || searched;
            document.querySelector(".app-store-extras").hidden = activeTab !== "today" || searched;

            const source = searched
                ? allApps
                : activeTab === "apps"
                    ? apps
                    : activeTab === "games"
                        ? allApps.filter(app => app.isGame)
                        : [...apps.slice(0, 5), ...gameApps.slice(0, 5)];
            const results = source.filter(app => {
                const matchesQuery = !query || `${app.name} ${app.subtitle} ${app.category} ${app.developer}`.toLowerCase().includes(query);
                const matchesCategory = !activeCategory
                    || (activeCategory === "games" ? app.isGame : app.category.toLowerCase() === activeCategory);
                return matchesQuery && matchesCategory;
            });
            if (listHeading) {
                listHeading.textContent = searched
                    ? "Search results"
                    : activeTab === "games"
                        ? "Popular games"
                        : activeTab === "apps"
                            ? "Explore apps"
                            : "Apps worth a look";
            }
            if (listKicker) listKicker.textContent = searched ? "SEARCH" : activeTab === "games" ? "GAMES" : activeTab === "apps" ? "APPS" : "TODAY'S PICKS";
            if (appCount) appCount.textContent = `${results.length} ${results.length === 1 ? "app" : "apps"}`;
            catalog.replaceChildren();
            results.forEach(app => {
                const row = document.createElement("article");
                row.className = "app-catalog-item";
                row.classList.toggle("has-uninstall", app.isGame && installed(app));
                const icon = document.createElement("span");
                icon.className = `app-catalog-icon ${app.iconClass || ""}`;
                if (app.iconHue !== undefined) {
                    icon.classList.add("downloaded-app-icon");
                    icon.style.setProperty("--downloaded-app-hue", app.iconHue);
                }
                if (app.iconImage) icon.classList.add("has-app-image");
                if (app.gameTheme) icon.dataset.gameTheme = app.gameTheme;
                if (app.iconImage) {
                    const image = document.createElement("img");
                    image.src = app.iconImage;
                    image.alt = "";
                    icon.appendChild(image);
                } else {
                    icon.textContent = app.icon;
                }
                const details = document.createElement("div");
                details.className = "app-catalog-details";
                const name = document.createElement("b");
                name.textContent = app.name;
                const type = document.createElement("small");
                type.textContent = app.subtitle;
                const meta = document.createElement("small");
                meta.className = "app-catalog-meta";
                meta.textContent = `${app.developer} · ${app.category}`;
                details.append(name, type, meta);

                const info = document.createElement("button");
                info.type = "button";
                info.className = "app-catalog-info";
                info.append(icon, details);
                info.setAttribute("aria-label", `View ${app.name} details`);
                info.addEventListener("click", () => showDetail(app));

                const button = document.createElement("button");
                button.type = "button";
                button.className = "app-catalog-action";
                setActionLabel(button, app);
                button.addEventListener("click", () => installOrOpen(app));
                const uninstall = document.createElement("button");
                uninstall.type = "button";
                uninstall.className = "app-catalog-uninstall";
                uninstall.textContent = "Uninstall";
                uninstall.setAttribute("aria-label", `Uninstall ${app.name}`);
                uninstall.hidden = !app.isGame || !installed(app);
                uninstall.addEventListener("click", () => removeFromHome(app));
                row.append(info, button, uninstall);
                catalog.appendChild(row);
            });
            if (!results.length) {
                const empty = document.createElement("p");
                empty.className = "app-store-empty";
                empty.textContent = query ? `No results for “${search.value.trim()}”. Try another search.` : "No apps in this category yet.";
                catalog.appendChild(empty);
            }
        };

        tiles.filter(tile => tile.dataset.open !== "games" && tile.dataset.open !== "store").forEach(tile => {
            tile.hidden = !state.installedApps.includes(tile.dataset.open);
        });
        renderStandaloneGameApps();
        search?.addEventListener("input", render);

        document.querySelectorAll("[data-store-tab]").forEach(button => button.addEventListener("click", () => {
            activeTab = button.dataset.storeTab;
            activeCategory = "";
            byId("store").scrollTop = 0;
            render();
        }));
        document.querySelectorAll("[data-store-category]").forEach(button => button.addEventListener("click", () => {
            activeTab = button.dataset.storeCategory === "games" ? "games" : "apps";
            activeCategory = button.dataset.storeCategory === "games" ? "games" : button.dataset.storeCategory;
            byId("store").scrollTop = 0;
            render();
        }));
        document.querySelectorAll('[data-open="store"]').forEach(button => button.addEventListener("click", () => {
            hideDetail();
            byId("store").scrollTop = 0;
        }));
        document.querySelector("[data-store-featured]")?.addEventListener("click", () => {
            activeTab = "games";
            activeCategory = "";
            byId("store").scrollTop = 0;
            render();
            catalog.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        byId("app-store-detail-back")?.addEventListener("click", hideDetail);
        detailAction?.addEventListener("click", () => {
            if (selectedApp) installOrOpen(selectedApp);
        });
        byId("app-store-detail-remove")?.addEventListener("click", () => {
            if (selectedApp) removeFromHome(selectedApp);
        });
        clearSearch?.addEventListener("click", () => {
            search.value = "";
            search.focus();
            render();
        });
        search?.addEventListener("focus", () => {
            if (search.value.trim()) {
                activeCategory = "";
                render();
            }
        });
        byId("app-store-account")?.addEventListener("click", () => {
            toast("Your app downloads are saved on this device");
        });
        render();
    }

    function setupSocialFeed() {
        const form = byId("social-post-form");
        const feed = byId("social-post-feed");
        const status = byId("social-feed-status");
        const authorInput = byId("social-post-author");
        const bodyInput = byId("social-post-body");
        const fileInput = byId("social-post-file");
        const fileName = byId("social-post-file-name");
        const submit = byId("social-post-submit");
        const refresh = byId("social-feed-refresh");
        if (!form || !feed || !status || !authorInput || !bodyInput || !fileInput || !submit) return;

        const config = window.SLOTPHONE_SUPABASE;
        const projectUrl = typeof config?.url === "string" ? config.url.trim().replace(/\/+$/, "") : "";
        const publicKey = typeof config?.anonKey === "string" ? config.anonKey.trim() : "";
        const configured = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(projectUrl) && Boolean(publicKey);
        const authorKey = "slotPhoneSocialAuthor";
        const storedAuthor = readLocal(authorKey, "");
        const authorId = storedAuthor || `friend-${Math.random().toString(36).slice(2, 8)}`;
        if (!storedAuthor) writeLocal(authorKey, authorId);
        authorInput.value = authorId;
        authorInput.addEventListener("change", () => writeLocal(authorKey, authorInput.value.trim().slice(0, 32)));
        authorInput.addEventListener("blur", () => {
            authorInput.value = authorInput.value.trim().slice(0, 32);
            writeLocal(authorKey, authorInput.value);
        });
        fileInput.addEventListener("change", () => {
            fileName.textContent = fileInput.files?.[0]?.name || "No attachment";
        });

        const headers = () => {
            const result = { apikey: publicKey };
            if (publicKey.startsWith("eyJ")) result.Authorization = `Bearer ${publicKey}`;
            return result;
        };
        const apiError = async response => {
            const detail = (await response.text()).slice(0, 240);
            throw new Error(`Community service error (${response.status})${detail ? `: ${detail}` : ""}`);
        };
        const setStatus = (message, isError = false) => {
            status.textContent = message;
            status.classList.toggle("error", isError);
        };
        const renderPosts = posts => {
            feed.replaceChildren();
            if (!posts.length) {
                const empty = document.createElement("p");
                empty.className = "social-feed-empty";
                empty.textContent = "No posts yet. Share the first update with your friends.";
                feed.appendChild(empty);
                return;
            }
            posts.forEach(post => {
                const card = document.createElement("article");
                card.className = "social-post-card";
                const head = document.createElement("div");
                head.className = "social-post-card-head";
                const author = document.createElement("b");
                author.textContent = post.author;
                const date = document.createElement("time");
                const createdAt = new Date(post.created_at);
                if (!Number.isNaN(createdAt.getTime())) {
                    date.dateTime = createdAt.toISOString();
                    date.textContent = createdAt.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
                }
                head.append(author, date);
                card.appendChild(head);
                if (post.body) {
                    const body = document.createElement("p");
                    body.className = "social-post-body";
                    body.textContent = post.body;
                    card.appendChild(body);
                }
                if (post.media_path) {
                    const media = document.createElement(post.media_type === "video" ? "video" : "img");
                    media.className = "social-post-media";
                    media.src = `${projectUrl}/storage/v1/object/public/slotphone-posts/${post.media_path.split("/").map(encodeURIComponent).join("/")}`;
                    if (media instanceof HTMLVideoElement) {
                        media.controls = true;
                        media.playsInline = true;
                        media.preload = "metadata";
                    } else {
                        media.alt = `Photo shared by ${post.author}`;
                        media.loading = "lazy";
                    }
                    card.appendChild(media);
                }
                feed.appendChild(card);
            });
        };
        let loading = false;
        const loadPosts = async () => {
            if (!configured || loading || document.visibilityState === "hidden") return;
            loading = true;
            try {
                const response = await fetch(`${projectUrl}/rest/v1/social_posts?select=id,author,body,media_path,media_type,created_at&order=created_at.desc&limit=50`, {
                    headers: headers()
                });
                if (!response.ok) await apiError(response);
                const posts = await response.json();
                if (!Array.isArray(posts)) throw new TypeError("The community feed returned an invalid response");
                renderPosts(posts);
                setStatus(`${posts.length} shared ${posts.length === 1 ? "post" : "posts"} · refreshes automatically`);
            } catch (error) {
                console.error("Could not load shared posts:", error);
                setStatus(error.message || "Could not load community posts. Try refreshing.", true);
            } finally {
                loading = false;
            }
        };

        if (!configured) {
            submit.disabled = true;
            refresh.disabled = true;
            setStatus("Shared posts are not connected yet. Set your Supabase URL and public anon key in supabase-config.js.");
            const empty = document.createElement("p");
            empty.className = "social-feed-empty";
            empty.textContent = "Connect a Supabase project to share posts across devices.";
            feed.appendChild(empty);
            return;
        }

        refresh?.addEventListener("click", loadPosts);
        window.addEventListener("focus", loadPosts);
        document.addEventListener("visibilitychange", loadPosts);
        window.setInterval(loadPosts, 15000);
        loadPosts();

        form.addEventListener("submit", async event => {
            event.preventDefault();
            const author = authorInput.value.trim();
            const body = bodyInput.value.trim();
            const file = fileInput.files?.[0];
            if (!author || author.length > 32) return setStatus("Choose a name up to 32 characters.", true);
            if (!body && !file) return setStatus("Write a post or attach a photo/video first.", true);
            if (body.length > 1000) return setStatus("Posts must be 1,000 characters or fewer.", true);
            if (file && file.size > 20 * 1024 * 1024) return setStatus("Photos and videos must be 20 MB or smaller.", true);
            const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm", "video/quicktime"]);
            if (file && !allowedTypes.has(file.type)) return setStatus("Choose a JPG, PNG, WebP, GIF, MP4, WebM, or QuickTime video.", true);

            submit.disabled = true;
            setStatus(file ? "Uploading media and sharing your post…" : "Sharing your post…");
            try {
                let mediaPath = null;
                let mediaType = null;
                if (file) {
                    const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
                    mediaPath = `${crypto.randomUUID()}.${extension}`;
                    mediaType = file.type.startsWith("video/") ? "video" : "image";
                    const upload = await fetch(`${projectUrl}/storage/v1/object/slotphone-posts/${encodeURIComponent(mediaPath)}`, {
                        method: "POST",
                        headers: { ...headers(), "Content-Type": file.type, "x-upsert": "false" },
                        body: file
                    });
                    if (!upload.ok) await apiError(upload);
                }
                const response = await fetch(`${projectUrl}/rest/v1/social_posts`, {
                    method: "POST",
                    headers: { ...headers(), "Content-Type": "application/json", Prefer: "return=minimal" },
                    body: JSON.stringify({ author, body, media_path: mediaPath, media_type: mediaType })
                });
                if (!response.ok) await apiError(response);
                bodyInput.value = "";
                fileInput.value = "";
                fileName.textContent = "No attachment";
                writeLocal(authorKey, author);
                setStatus("Post shared with your friends.");
                await loadPosts();
            } catch (error) {
                console.error("Could not publish shared post:", error);
                setStatus(error.message || "Could not publish your post. Try again.", true);
            } finally {
                submit.disabled = false;
            }
        });
    }

    async function setupShorts() {
        const feed = byId("shorts-feed");
        const picker = byId("shorts-picker");
        const upload = byId("shorts-upload");
        const storageStatus = byId("shorts-storage-status");
        if (!feed || !picker || !upload) return;

        const clipURL = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
        const clips = [
            { key: "seed-0", title: "A little color for your day", creator: "@slotphone", src: clipURL, poster: "images/1.jpg" },
            { key: "seed-1", title: "Golden hour, on repeat", creator: "@dailyframes", src: clipURL, poster: "images/2.jpg" },
            { key: "seed-2", title: "Somewhere between here and home", creator: "@weekendroll", src: clipURL, poster: "images/3.jpg" },
            { key: "seed-3", title: "Press play. Take a breath.", creator: "@smallmoments", src: clipURL, poster: "images/4.jpg" }
        ];
        const liked = readLocal("slotPhoneShortsLiked", []);
        const saved = readLocal("slotPhoneShortsSaved", []);
        const memoryVideos = [];
        let database;
        let cursor = 0;
        let observer;

        const setStatus = count => {
            if (storageStatus) storageStatus.textContent = `${count} uploaded ${count === 1 ? "video" : "videos"} · saved on this device`;
        };

        const openDatabase = () => new Promise((resolve, reject) => {
            if (!window.indexedDB) return reject(new Error("IndexedDB unavailable"));
            const request = indexedDB.open("slotPhoneShorts", 1);
            request.onupgradeneeded = () => {
                if (!request.result.objectStoreNames.contains("videos")) {
                    request.result.createObjectStore("videos", { keyPath: "id", autoIncrement: true });
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        const readVideos = db => new Promise((resolve, reject) => {
            const request = db.transaction("videos", "readonly").objectStore("videos").getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        const storeVideo = (db, record) => new Promise((resolve, reject) => {
            const transaction = db.transaction("videos", "readwrite");
            const request = transaction.objectStore("videos").add(record);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        const deleteVideo = id => new Promise((resolve, reject) => {
            if (!database || typeof id !== "number") return resolve();
            const transaction = database.transaction("videos", "readwrite");
            transaction.objectStore("videos").delete(id);
            transaction.oncomplete = resolve;
            transaction.onerror = () => reject(transaction.error);
        });

        const createCard = clip => {
            const card = document.createElement("article");
            card.className = "short-card";
            card.dataset.shortKey = clip.key;
            const poster = document.createElement("img");
            poster.className = "short-poster";
            poster.src = clip.poster || "images/1.jpg";
            poster.alt = "";
            const video = document.createElement("video");
            video.poster = clip.poster || "images/1.jpg";
            video.dataset.src = clip.src;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.preload = "none";
            video.hidden = true;
            const shade = document.createElement("div");
            shade.className = "short-shade";
            const copy = document.createElement("div");
            copy.className = "short-copy";
            const creator = document.createElement("small");
            creator.textContent = clip.creator;
            const title = document.createElement("h3");
            title.textContent = clip.title;
            const play = document.createElement("button");
            play.type = "button";
            play.dataset.shortPlay = "";
            play.textContent = "▶ Play clip";
            copy.append(creator, title, play);
            const actions = document.createElement("div");
            actions.className = "short-actions";
            const like = document.createElement("button");
            like.type = "button";
            like.dataset.shortLike = "";
            like.setAttribute("aria-label", "Like");
            like.setAttribute("aria-pressed", String(liked.includes(clip.key)));
            like.textContent = liked.includes(clip.key) ? "♥" : "♡";
            const save = document.createElement("button");
            save.type = "button";
            save.dataset.shortSave = "";
            save.setAttribute("aria-label", "Save video");
            save.setAttribute("aria-pressed", String(saved.includes(clip.key)));
            save.textContent = saved.includes(clip.key) ? "✓" : "＋";
            actions.append(like, save);
            const audio = document.createElement("button");
            audio.type = "button";
            audio.dataset.shortAudio = "";
            audio.setAttribute("aria-label", "Turn clip audio on");
            audio.setAttribute("aria-pressed", "false");
            audio.textContent = "🔇";
            actions.appendChild(audio);
            if (clip.uploaded) {
                const remove = document.createElement("button");
                remove.type = "button";
                remove.dataset.shortDelete = "";
                remove.setAttribute("aria-label", "Delete uploaded video");
                remove.textContent = "×";
                actions.appendChild(remove);
            }
            card.append(poster, video, shade, copy, actions);
            feed.appendChild(card);
            observer?.observe(card);
            return card;
        };

        const appendBatch = (count = 4) => {
            if (!clips.length) return;
            for (let index = 0; index < count; index++) {
                createCard(clips[cursor % clips.length]);
                cursor++;
            }
        };

        const stopCard = card => {
            const video = card.querySelector("video");
            video.pause();
            video.hidden = true;
            card.querySelector(".short-poster").hidden = false;
            card.querySelector("[data-short-play]").textContent = "▶ Play clip";
            card.classList.remove("playing");
        };

        const playCard = (card, audible = true) => {
            feed.querySelectorAll(".short-card.playing").forEach(other => {
                if (other !== card) stopCard(other);
            });
            const video = card.querySelector("video");
            if (!video.src) video.src = video.dataset.src;
            video.muted = !audible;
            const audioButton = card.querySelector("[data-short-audio]");
            audioButton.textContent = audible ? "🔊" : "🔇";
            audioButton.setAttribute("aria-label", audible ? "Turn clip audio off" : "Turn clip audio on");
            audioButton.setAttribute("aria-pressed", String(audible));
            video.hidden = false;
            video.play().then(() => {
                card.classList.add("playing");
                delete card.dataset.playFailed;
                card.querySelector(".short-poster").hidden = true;
                card.querySelector("[data-short-play]").textContent = "Ⅱ Pause";
            }).catch(() => {
                stopCard(card);
                card.dataset.playFailed = "true";
                toast("This clip can’t play here. Upload a video from your device.");
            });
        };

        if ("IntersectionObserver" in window) {
            observer = new IntersectionObserver(entries => entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.72 && !entry.target.dataset.playFailed) {
                    playCard(entry.target, false);
                } else {
                    stopCard(entry.target);
                }
            }), { root: feed, threshold: [0, 0.72, 1] });
        }

        feed.tabIndex = 0;
        feed.addEventListener("scroll", () => {
            if (feed.scrollTop + feed.clientHeight >= feed.scrollHeight - feed.clientHeight * 1.5) appendBatch();
        }, { passive: true });
        feed.addEventListener("keydown", event => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                feed.scrollBy({ top: (event.key === "ArrowDown" ? 1 : -1) * feed.clientHeight, behavior: "smooth" });
            }
        });
        feed.addEventListener("click", async event => {
            const card = event.target.closest(".short-card");
            if (!card) return;
            const clip = clips.find(item => item.key === card.dataset.shortKey);
            if (!clip) return;
            const like = event.target.closest("[data-short-like]");
            const save = event.target.closest("[data-short-save]");
            const audio = event.target.closest("[data-short-audio]");
            const play = event.target.closest("[data-short-play]");
            const remove = event.target.closest("[data-short-delete]");
            if (like || save) {
                const list = like ? liked : saved;
                const storageKey = like ? "slotPhoneShortsLiked" : "slotPhoneShortsSaved";
                const index = list.indexOf(clip.key);
                if (index >= 0) list.splice(index, 1);
                else list.push(clip.key);
                const active = list.includes(clip.key);
                (like || save).textContent = like ? (active ? "♥" : "♡") : (active ? "✓" : "＋");
                (like || save).setAttribute("aria-pressed", String(active));
                writeLocal(storageKey, list);
            } else if (remove && clip.uploaded) {
                try {
                    await deleteVideo(clip.databaseId);
                    clips.splice(clips.indexOf(clip), 1);
                    URL.revokeObjectURL(clip.src);
                    feed.replaceChildren();
                    cursor = 0;
                    appendBatch(8);
                    setStatus(clips.filter(item => item.uploaded).length);
                } catch {
                    toast("Couldn’t remove this video");
                }
            } else if (audio) {
                const video = card.querySelector("video");
                if (!video.src) video.src = video.dataset.src;
                if (video.paused) {
                    playCard(card, video.muted);
                } else {
                    video.muted = !video.muted;
                    audio.textContent = video.muted ? "🔇" : "🔊";
                    audio.setAttribute("aria-pressed", String(!video.muted));
                    audio.setAttribute("aria-label", video.muted ? "Turn clip audio on" : "Turn clip audio off");
                }
            } else if (play) {
                const video = card.querySelector("video");
                if (video.paused) playCard(card, true);
                else if (video.muted) {
                    video.muted = false;
                    card.querySelector("[data-short-audio]").textContent = "🔊";
                    card.querySelector("[data-short-audio]").setAttribute("aria-pressed", "true");
                    card.querySelector("[data-short-audio]").setAttribute("aria-label", "Turn clip audio off");
                } else stopCard(card);
            } else if (card.classList.contains("playing")) {
                stopCard(card);
            } else {
                playCard(card, true);
            }
        });

        appendBatch(8);

        const loadPromise = (async () => {
            try {
                database = await openDatabase();
                database.onversionchange = () => database.close();
                const stored = await readVideos(database);
                stored.forEach(record => {
                    const blob = record.blob;
                    const clip = {
                        key: `upload-${record.id}`,
                        databaseId: record.id,
                        title: record.title,
                        creator: "@you",
                        src: URL.createObjectURL(blob),
                        poster: "images/5.jpg",
                        uploaded: true
                    };
                    clips.push(clip);
                    createCard(clip);
                    cursor++;
                });
                setStatus(stored.length);
            } catch {
                if (storageStatus) storageStatus.textContent = "Uploads stay available in this tab";
            }
        })();

        upload.addEventListener("click", () => picker.click());
        picker.addEventListener("change", async () => {
            await loadPromise;
            for (const file of [...picker.files]) {
                if (!file.type.startsWith("video/")) {
                    toast(`${file.name} isn’t a video`);
                    continue;
                }
                const title = file.name.replace(/\.[^.]+$/, "") || "Untitled video";
                const record = { title, type: file.type, blob: file, createdAt: Date.now() };
                try {
                    if (database) record.id = await storeVideo(database, record);
                    else {
                        record.id = `memory-${Date.now()}-${memoryVideos.length}`;
                        memoryVideos.push(record);
                    }
                    const clip = {
                        key: `upload-${record.id}`,
                        databaseId: record.id,
                        title,
                        creator: "@you",
                        src: URL.createObjectURL(file),
                        poster: "images/5.jpg",
                        uploaded: true
                    };
                    clips.push(clip);
                    createCard(clip);
                    cursor++;
                    setStatus(clips.filter(item => item.uploaded).length);
                    toast(`Added ${title}`);
                } catch {
                    toast("Couldn’t save this video. Try a smaller file.");
                }
            }
            picker.value = "";
        });
    }

    document.addEventListener("click", event => {
        if (event.target.closest('[data-open="camera"]')) setupCamera();
    });

    document.querySelectorAll("[data-timer]").forEach(button => {
        button.addEventListener("click", () => setTimer(Number(button.dataset.timer)));
    });
    byId("timer-reset")?.addEventListener("click", () => setTimer(300));

    setupAppSearch();
    setupMessages();
    setupAssistant();
    setupPhotos();
    setupPhoneAndContacts();
    setupWeather();
    setupBrowserAndMaps();
    setupCalendar();
    setupReminders();
    setupFiles();
    setupMail();
    setupSettingsAndStore();
    setupShorts();
    setupSocialFeed();

    const requestedGame = new URLSearchParams(location.search).get("playGame");
    if (games.some(game => game.id === requestedGame)) {
        startGame(requestedGame);
    }
})();