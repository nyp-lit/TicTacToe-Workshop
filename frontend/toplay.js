// Connect to Socket.IO server
const socket = io("http://localhost:3000");

// Game state
let board = Array(9).fill("");
let currentPlayer = "X";
let gameActive = false;
let players = { X: "Player 1", O: "Player 2" };
let scores = { X: 0, O: 0 };

// DOM elements
const boardEl = document.getElementById("board");
const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");

// Socket.IO Events

// Receive assigned symbols
socket.on("assignSymbols", (data) => {
    players[data.player1.symbol] = data.player1.name;
    players[data.player2.symbol] = data.player2.name;
    currentPlayer = "X";
    gameActive = true;
    renderBoard();
    updateScoreDisplay();
});

// Receive updated board from server
socket.on("updateBoard", (data) => {
    board = data.board;
    currentPlayer = data.currentPlayer;
    renderBoard();
});

// Handle game end
socket.on("gameEnd", (data) => {
    board = data.board;
    renderBoard();
    if (data.winner) {
        alert(`${players[data.winner]} wins!`);
        scores[data.winner]++;
    } else {
        alert("It's a tie!");
    }
    updateScoreDisplay();
    gameActive = false;
});

// Handle opponent disconnect
socket.on("playerLeft", () => {
    alert("Opponent disconnected. Game reset.");
    board = Array(9).fill("");
    gameActive = false;
    renderBoard();
});

// User Actions

function startGame() {
    const player1 = document.getElementById("player1").value || "Player 1";
    const player2 = document.getElementById("player2").value || "Player 2";
    socket.emit("startGame", { player1, player2 });
}

function handleCellClick(index) {
    if (!gameActive || board[index]) return;
    socket.emit("playMove", { index });
}

function resetGame() {
    socket.emit("resetGame");
}

function restartScoreboard() {
    scores = { X: 0, O: 0 };
    updateScoreDisplay();
}

// Render the board on the page
function renderBoard() {
    boardEl.innerHTML = "";

    const xColor = document.getElementById("xColor").value;
    const oColor = document.getElementById("oColor").value;
    const boardBg = document.getElementById("boardColor").value;

    board.forEach((cell, i) => {
        const cellEl = document.createElement("div");
        cellEl.className = "cell";
        cellEl.textContent = cell;
        cellEl.style.backgroundColor = boardBg;
        cellEl.style.color = cell === "X" ? xColor : cell === "O" ? oColor : "#000";
        cellEl.onclick = () => handleCellClick(i);
        boardEl.appendChild(cellEl);
    });
}

// Update the displayed scores
function updateScoreDisplay() {
    scoreXEl.textContent = `${players.X} (X): ${scores.X}`;
    scoreOEl.textContent = `${players.O} (O): ${scores.O}`;
}

// Color change listeners
document.getElementById("xColor").addEventListener("input", renderBoard);
document.getElementById("oColor").addEventListener("input", renderBoard);
document.getElementById("boardColor").addEventListener("input", renderBoard);

// Initial render
renderBoard();
