
const game = new Chess();

const board = document.getElementById("board");
const statusText = document.getElementById("status");
const overlay = document.getElementById("checkmate-overlay");
const winnerText = document.getElementById("winner-text");
const confetti = document.getElementById("confetti");

let selectedSquare = null;
let legalMoves = [];
let flipped = false;
let gameFinished = false;

const symbols = {
  wk: "♔",
  wq: "♕",
  wr: "♖",
  wb: "♗",
  wn: "♘",
  wp: "♙",
  bk: "♚",
  bq: "♛",
  br: "♜",
  bb: "♝",
  bn: "♞",
  bp: "♟"
};

function renderBoard() {
  board.replaceChildren();

  const files = flipped
    ? ["h", "g", "f", "e", "d", "c", "b", "a"]
    : ["a", "b", "c", "d", "e", "f", "g", "h"];

  const ranks = flipped
    ? [1, 2, 3, 4, 5, 6, 7, 8]
    : [8, 7, 6, 5, 4, 3, 2, 1];

  for (const rank of ranks) {
    for (const file of files) {
      const squareName = file + rank;
      const square = document.createElement("button");
      const fileIndex = file.charCodeAt(0) - 97;
      const rankIndex = rank - 1;

      square.className =
        "square " +
        ((fileIndex + rankIndex) % 2 === 0 ? "light" : "dark");

      square.dataset.square = squareName;
      square.setAttribute("aria-label", squareName);

      const piece = game.get(squareName);

      if (piece) {
        square.textContent = symbols[piece.color + piece.type];
        square.classList.add(
          piece.color === "w" ? "piece-white" : "piece-black"
        );
        square.setAttribute(
          "aria-label",
          squareName + " " +
          (piece.color === "w" ? "white " : "black ") +
          piece.type
        );
      }

      if (squareName === selectedSquare) {
        square.classList.add("selected");
      }

      const move = legalMoves.find(m => m.to === squareName);

      if (move) {
        square.classList.add(piece ? "capture" : "legal");
      }

      square.addEventListener("click", () => handleSquareClick(squareName));

      board.appendChild(square);
    }
  }

  updateStatus();
}

function handleSquareClick(squareName) {
  if (gameFinished || game.game_over()) return;

  const piece = game.get(squareName);

  if (selectedSquare) {
    const move = legalMoves.find(m => m.to === squareName);

    if (move) {
      makeMove(selectedSquare, squareName);
      return;
    }
  }

  if (piece && piece.color === game.turn()) {
    selectedSquare = squareName;
    legalMoves = game.moves({
      square: squareName,
      verbose: true
    });

    renderBoard();
    return;
  }

  selectedSquare = null;
  legalMoves = [];
  renderBoard();
}

function makeMove(from, to) {
  try {
    const move = game.move({
      from,
      to,
      promotion: "q"
    });

    if (!move) return;

    selectedSquare = null;
    legalMoves = [];

    renderBoard();

    if (game.in_checkmate()) {
      gameFinished = true;
      const winner = game.turn() === "w" ? "Black" : "White";

      statusText.textContent = "Checkmate!";
      showCheckmate(winner);
      return;
    }

    if (game.in_draw()) {
      statusText.textContent = "Draw game";
      gameFinished = true;
      return;
    }

    if (game.in_check()) {
      statusText.textContent =
        (game.turn() === "w" ? "White" : "Black") + " is in check!";
    }
  } catch (error) {
    console.error("Could not make move:", error);
  }
}

function updateStatus() {
  if (gameFinished) return;

  const turn = game.turn();
  const name = turn === "w" ? "White" : "Black";

  statusText.textContent = name + "'s turn";

  document.getElementById("white-player")
    .classList.toggle("active", turn === "w");

  document.getElementById("black-player")
    .classList.toggle("active", turn === "b");

  document.querySelector("#white-player .turn-label").textContent =
    turn === "w" ? "YOUR TURN" : "WAITING";

  document.querySelector("#black-player .turn-label").textContent =
    turn === "b" ? "YOUR TURN" : "WAITING";

  if (game.in_check()) {
    statusText.textContent += " — CHECK!";
  }
}

function showCheckmate(winner) {
  winnerText.textContent = winner + " wins!";
  confetti.replaceChildren();

  for (let i = 0; i < 65; i++) {
    const particle = document.createElement("span");

    particle.style.left = Math.random() * 100 + "%";
    particle.style.animationDelay = Math.random() * 1.8 + "s";
    particle.style.animationDuration =
      2 + Math.random() * 2 + "s";

    particle.style.background = [
      "#f5cb72",
      "#ffffff",
      "#a99aff",
      "#79d9ff"
    ][Math.floor(Math.random() * 4)];

    confetti.appendChild(particle);
  }

  overlay.classList.add("show");
}

function newGame() {
  game.reset();
  selectedSquare = null;
  legalMoves = [];
  gameFinished = false;

  overlay.classList.remove("show");
  confetti.replaceChildren();

  renderBoard();
}

function humanColor(){
  return $('#side').value;
}

function isAIMode(){
  return $('#mode').value === 'ai';
}

document.getElementById("new-game").addEventListener("click", newGame);

document.getElementById("rematch").addEventListener("click", newGame);

document.getElementById("flip-board").addEventListener("click", () => {
  flipped = !flipped;
  renderBoard();
});

renderBoard();
