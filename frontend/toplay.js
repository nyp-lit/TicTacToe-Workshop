// toplay.js

// Initialize Socket.IO client
const socket = io();

// DOM elements
const player1Input = document.getElementById('player1');
const player2Input = document.getElementById('player2');
const xColorPicker = document.getElementById('xColor');
const oColorPicker = document.getElementById('oColor');
const boardColorPicker = document.getElementById('boardColor');
const gameBoard = document.getElementById('board');
const scoreXElement = document.getElementById('scoreX'); // Changed ID to avoid conflict with `scores.X`
const scoreOElement = document.getElementById('scoreO'); // Changed ID to avoid conflict with `scores.O`

let currentPlayerLocal = "X"; // This will be updated by gameUpdate from server
let players = { X: "Player 1", O: "Player 2" }; // Default, updated by server
let currentScores = { X: 0, O: 0 }; // Stores scores from the server

// --- Functions to emit events to the server ---

/**
 * Sends a request to the backend to start a new game.
 * Uses player names from the input fields.
 */
function startGame() {
    // Get player names
    const p1Name = player1Input.value || "Player 1 (X)";
    const p2Name = player2Input.value || "Player 2 (O)";

    // Emit the startGame event to the server
    socket.emit('startGame', { player1: p1Name, player2: p2Name });

    // Show popup message
    alert(`Game has started!\n${p1Name} (X) vs ${p2Name} (O)`);
}


/**
 * Sends a player's move to the backend.
 * @param {number} index - The index of the clicked cell (0-8).
 */
function playMove(index) {
    // Emit the playMove event to the server with the cell index and current player
    socket.emit('playMove', { index: index, player: currentPlayerLocal });
}

/**
 * Sends a request to the backend to reset the game board.
 */
function resetGame() {
    socket.emit('resetGame');
}

/**
 * Sends a request to the backend to restart (clear) the scoreboard.
 */
function restartScoreboard() {
    socket.emit('restartScoreboard');
}

/**
 * This function is defined in HTML but isn't strictly necessary for backend interaction.
 * It's more of a local UI update if you were to change player names dynamically.
 */
function setPlayer(playerNum) {
    // The player names are sent to the server via the startGame function.
    // This function can be left as is or adapted if you add client-side dynamic name display.
    console.log(`Player ${playerNum} name input focused.`);
}

// --- Functions to handle events from the server (gameUpdate) ---

/**
 * Handles 'gameUpdate' events from the server, rendering the new game state.
 * @param {object} data - The game state data from the server.
 */
socket.on('gameUpdate', (data) => {
    const { board, currentPlayer, gameActive, winner, draw, players: updatedPlayers, scores: serverScores } = data;

    // Update local state based on server data
    currentPlayerLocal = currentPlayer;
    players = updatedPlayers;
    currentScores = serverScores; // Update scores from the server

    // Update player name placeholders and scoreboard
    player1Input.placeholder = `${players.X} (X)`;
    player2Input.placeholder = `${players.O} (O)`;
    scoreXElement.textContent = `${players.X} (X): ${currentScores.X}`;
    scoreOElement.textContent = `${players.O} (O): ${currentScores.O}`;

    // Apply colors from pickers to CSS variables for dynamic styling
    document.documentElement.style.setProperty('--x-color', xColorPicker.value);
    document.documentElement.style.setProperty('--o-color', oColorPicker.value);
    document.documentElement.style.setProperty('--board-bg', boardColorPicker.value);

    // Render the game board
    gameBoard.innerHTML = ''; // Clear previous board cells
    board.forEach((cell, index) => {
        const cellDiv = document.createElement('div');
        cellDiv.classList.add('cell');
        cellDiv.textContent = cell;

        // Add click listener only if the game is active and the cell is empty
        if (gameActive && !cell) {
            cellDiv.addEventListener('click', () => playMove(index));
        }

        // Set cell background to chosen board color
        cellDiv.style.backgroundColor = boardColorPicker.value;

        // Apply colors to X and O symbols based on current settings
        if (cell === 'X') {
            cellDiv.style.color = xColorPicker.value;
        } else if (cell === 'O') {
            cellDiv.style.color = oColorPicker.value;
        }
        gameBoard.appendChild(cellDiv);
    });

    // Display game status (winner, draw, current player)
    let statusMessage = '';
    if (winner) {
        statusMessage = `${players[winner]} (${winner}) wins! 🎉`;
        // You might want a dedicated element to display this message instead of an alert
        setTimeout(() => alert(statusMessage), 100); // Small delay for alert
    } else if (draw) {
        statusMessage = "It's a draw! 🤝";
        setTimeout(() => alert(statusMessage), 100); // Small delay for alert
    } else if (gameActive) {
        // You might want a dedicated element to display whose turn it is
        statusMessage = `Current Turn: ${players[currentPlayer]} (${currentPlayer})`;
        console.log(statusMessage); // For debugging
    } else {
        statusMessage = "Game not active. Click 'Start Game' to begin!";
        console.log(statusMessage); // For debugging
    }

    // Disable board interaction if game is not active or over
    if (!gameActive || winner || draw) {
        gameBoard.classList.add('disabled'); // Add a CSS class to visually disable interaction
    } else {
        gameBoard.classList.remove('disabled');
    }
});


// --- Initial Setup on Page Load ---
document.addEventListener('DOMContentLoaded', () => {
    // Set initial colors from HTML values to CSS variables
    document.documentElement.style.setProperty('--x-color', xColorPicker.value);
    document.documentElement.style.setProperty('--o-color', oColorPicker.value);
    document.documentElement.style.setProperty('--board-bg', boardColorPicker.value);

    // Add event listeners for color pickers to update styles in real-time
    xColorPicker.addEventListener('input', (event) => {
        document.documentElement.style.setProperty('--x-color', event.target.value);
    });
    oColorPicker.addEventListener('input', (event) => {
        document.documentElement.style.setProperty('--o-color', event.target.value);
    });
    boardColorPicker.addEventListener('input', (event) => {
        document.documentElement.style.setProperty('--board-bg', event.target.value);
    });

    // Initially, fetch the game state from the server when the client connects
    // The backend's 'connection' handler will automatically send a gameUpdate
    // when a new client connects, so we don't need a specific 'requestGameState' event from client.
});
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
