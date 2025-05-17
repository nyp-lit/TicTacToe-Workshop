const socket = new WebSocket("ws://localhost:3000"); // Establish a WebSocket connection to the backend server at the given address

socket.onopen = () => {
    console.log("WebSocket connection opened.");
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "assignSymbols") {
        players[data.player1.symbol] = data.player1.name;
        players[data.player2.symbol] = data.player2.name;
        currentPlayer = "X";  // Always start with X
        gameActive = true; // Enable the game so players can interact with the board
        renderBoard();
        updateScoreDisplay();
    }
};


// DOM references
const boardEl = document.getElementById("board");
const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");

// Game state variables
let board = Array(9).fill(""); // 9-cell empty board
let currentPlayer = "X"; // X starts
let gameActive = false; // Prevent play until game starts

// Player names
let players = { X: "Player 1", O: "Player 2" };

// Score tracking
let scores = { X: 0, O: 0 };

// Function to render (draw) the board UI
function renderBoard() {
    boardEl.innerHTML = ""; // Clear previous cells

    // Get current color values from color pickers
    const xColor = document.getElementById("xColor").value;
    const oColor = document.getElementById("oColor").value;
    const boardBg = document.getElementById("boardColor").value;

    // Loop through board cells and render each one
    board.forEach((cell, i) => {
        const cellEl = document.createElement("div");
        cellEl.className = "cell";
        cellEl.textContent = cell; // Show X or O

        // Set cell background to chosen board color
        cellEl.style.backgroundColor = boardBg;

        // Set X or O text color depending on current player
        cellEl.style.color = cell === "X" ? xColor : cell === "O" ? oColor : "#000";

        // When a cell is clicked, attempt to play
        cellEl.onclick = () => handleCellClick(i);

        boardEl.appendChild(cellEl); // Add cell to the board
    });
}

// Function to set a player's name
function setPlayer(num) {
    const input = document.getElementById(`player${num}`);
    if (num === 1) players.X = input.value || "Player 1";
    if (num === 2) players.O = input.value || "Player 2";
    updateScoreDisplay();
}

// Start new game
function startGame() {
    // Send player names to backend for symbol assignment
    const player1Name = document.getElementById("player1").value || "Player 1";
    const player2Name = document.getElementById("player2").value || "Player 2";

    socket.send(JSON.stringify({
        type: "startGame",
        player1: player1Name,
        player2: player2Name
    }));
}

// Reset game (same as start, but disables play)
function resetGame() {
    board = Array(9).fill("");
    currentPlayer = "X";
    gameActive = false;
    renderBoard();
}

// Restart scoreboard
function restartScoreboard() {
    scores.X = 0;
    scores.O = 0;
    updateScoreDisplay();
}

// Handle click on a cell
function handleCellClick(index) {
    // Ignore click if game is off or cell already filled
    if (!gameActive || board[index]) return;

    board[index] = currentPlayer; // Set symbol
    renderBoard(); // Redraw board

    // Check if current player won
    if (checkWinner()) {
        alert(`${players[currentPlayer]} wins!`);
        scores[currentPlayer]++;
        gameActive = false;
        updateScoreDisplay();
        return;
    }

    // Check for draw
    if (board.every(cell => cell !== "")) {
        alert("It's a tie!");
        gameActive = false;
        return;
    }

    // Switch turns
    currentPlayer = currentPlayer === "X" ? "O" : "X";
}

// Check for win condition
function checkWinner() {
    const winCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]          // diagonals
    ];

    // If any combo has same non-empty values, return true
    return winCombos.some(([a, b, c]) =>
        board[a] && board[a] === board[b] && board[a] === board[c]
    );
}

// Update scoreboard
function updateScoreDisplay() {
    scoreXEl.textContent = `${players.X} (X): ${scores.X}`;
    scoreOEl.textContent = `${players.O} (O): ${scores.O}`;
}

// Live update for color changes
document.getElementById("xColor").addEventListener("input", renderBoard);
document.getElementById("oColor").addEventListener("input", renderBoard);
document.getElementById("boardColor").addEventListener("input", renderBoard);

renderBoard(); // Initial render on load


const container = document.getElementById('floating-container');
const symbols = ['X', 'O'];
const total = 20; // Number of floating elements

for (let i = 0; i < total; i++) {
  const span = document.createElement('div');
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  span.textContent = symbol;
  span.classList.add('floating');
  span.classList.add(symbol === 'X' ? 'floating-x' : 'floating-o');

  // Random position within viewport
  const top = Math.random() * 90; // top: 0% to 90%
  const left = Math.random() * 95; // left: 0% to 95%
  span.style.top = `${top}%`;
  span.style.left = `${left}%`;

  // Random animation duration and delay
  span.style.animationDuration = `${3 + Math.random() * 3}s`;
  span.style.animationDelay = `${Math.random() * 2}s`;

  container.appendChild(span);
}
