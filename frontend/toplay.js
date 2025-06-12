// Game state
let board = Array(9).fill("");
let currentPlayer = "X";
let gameActive = false;
let players = { X: "Player 1", O: "Player 2" };
let scores = { X: 0, O: 0 };

// Elements
const boardEl = document.getElementById("board");
const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");

// Initialize the game board
function initializeBoard() {
  boardEl.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.index = i;
    cell.addEventListener("click", () => handleCellClick(i));
    boardEl.appendChild(cell);
  }
}

function renderBoard() {
  const cells = document.querySelectorAll(".cell");
  const xColor = document.getElementById("xColor").value;
  const oColor = document.getElementById("oColor").value;
  const boardBg = document.getElementById("boardColor").value;
  
  // Remove this line that sets board background
  // boardEl.style.backgroundColor = boardBg;
  
  board.forEach((cell, i) => {
    cells[i].textContent = cell;
    cells[i].style.color = cell === "X" ? xColor : cell === "O" ? oColor : "transparent";
    // Set the background color for each cell
    cells[i].style.backgroundColor = boardBg;
  });
}
// Player naming
function setPlayer(num) {
  const input = document.getElementById(`player${num}`);
  players[num === 1 ? "X" : "O"] = input.value.trim() || (num === 1 ? "Player 1" : "Player 2");
  updateScoreDisplay();
}

// Control buttons
function startGame() {
  board.fill("");
  currentPlayer = "X";
  gameActive = true;
  renderBoard();
}

function resetGame() {
  board.fill("");
  gameActive = false;
  renderBoard();
}

function restartScoreboard() {
  scores.X = scores.O = 0;
  updateScoreDisplay();
}

function updateScoreDisplay() {
  scoreXEl.textContent = `${players.X} (X): ${scores.X}`;
  scoreOEl.textContent = `${players.O} (O): ${scores.O}`;
}

// Game interaction
function handleCellClick(idx) {
  if (!gameActive || board[idx]) return;
  
  board[idx] = currentPlayer;
  renderBoard();

  if (checkWinner()) {
    setTimeout(() => {
      alert(`${players[currentPlayer]} wins!`);
      scores[currentPlayer]++;
      gameActive = false;
      updateScoreDisplay();
    }, 10);
    return;
  }
  
  if (board.every(c => c)) {
    setTimeout(() => {
      alert("It's a tie!");
      gameActive = false;
    }, 10);
    return;
  }
  
  currentPlayer = currentPlayer === "X" ? "O" : "X";
}

function checkWinner() {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];

  return winPatterns.some(pattern => {
    const [a, b, c] = pattern;
    return board[a] && board[a] === board[b] && board[a] === board[c];
  });
}

// Floating background symbols
function createFloatingSymbols() {
  const container = document.getElementById('floating-container');
  container.innerHTML = '';
  
  for (let i = 0; i < 10; i++) {
    const symbol = Math.random() > 0.5 ? 'X' : 'O';
    const div = document.createElement('div');
    div.textContent = symbol;
    div.className = `floating floating-${symbol.toLowerCase()}`;
    div.style.top = `${Math.random() * 90}%`;
    div.style.left = `${Math.random() * 95}%`;
    div.style.animationDuration = `${3 + Math.random() * 4}s`;
    container.appendChild(div);
  }
}

// Initialize the game
initializeBoard();
createFloatingSymbols();
updateScoreDisplay();