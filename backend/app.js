const express = require("express");
const http = require("http");
const path = require("path");   
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;

// Serve static files from the "frontend" folder
// This path now correctly navigates UP one directory (..) from 'backend'
// and then INTO the 'frontend' directory.
app.use(express.static(path.join(__dirname, "..", "frontend")));

// Add a route to specifically serve toplay.html for the root URL
// This path also needs to be adjusted to go UP one directory (..)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "..", "frontend", "toplay.html"));
});

// Game state
let players = { X: "", O: "" };
let board = Array(9).fill("");
let currentPlayer = "X";
let gameActive = false;
let scores = { X: 0, O: 0 }; // Added for server-side scorekeeping

// Listen for socket connections
io.on("connection", (socket) => {
    console.log("A player connected:", socket.id);

    // When a new client connects, send them the current game state
    socket.emit("gameUpdate", {
        board,
        currentPlayer,
        gameActive,
        players,
        winner: checkWinner(), // Check if a game is already won
        draw: board.every(cell => cell !== "") && !checkWinner(), // Check for draw
        scores // Send current scores
    });

    // Start game with player names
    socket.on("startGame", ({ player1, player2 }) => {
        players.X = player1 || "Player 1";
        players.O = player2 || "Player 2";
        board = Array(9).fill("");
        currentPlayer = "X";
        gameActive = true;

        io.emit("gameUpdate", {
            board,
            currentPlayer,
            gameActive,
            players,
            winner: null,
            draw: false,
            scores // Include scores
        });
    });

    // Handle move
    socket.on("playMove", ({ index, player }) => {
        if (!gameActive || board[index] || player !== currentPlayer) return;

        board[index] = currentPlayer;
        const winner = checkWinner();
        const draw = board.every(cell => cell !== "") && !winner; // Ensure not a draw if there's a winner

        gameActive = !(winner || draw);

        if (winner) {
            scores[winner]++; // Increment score for the winner
        }

        io.emit("gameUpdate", {
            board,
            currentPlayer: gameActive ? switchPlayer(currentPlayer) : currentPlayer,
            gameActive,
            winner,
            draw,
            players,
            scores // Include scores
        });

        if (gameActive) {
            currentPlayer = switchPlayer(currentPlayer);
        }
    });

    socket.on("resetGame", () => {
        board = Array(9).fill("");
        currentPlayer = "X";
        gameActive = false; // Game is not active until 'Start Game' is clicked again

        io.emit("gameUpdate", {
            board,
            currentPlayer,
            gameActive,
            players,
            winner: null,
            draw: false,
            scores // Include scores
        });
    });

    // Handle restart scoreboard (clears scores on the server)
    socket.on("restartScoreboard", () => {
        scores = { X: 0, O: 0 };
        io.emit("gameUpdate", {
            board,
            currentPlayer,
            gameActive,
            players,
            winner: null,
            draw: false,
            scores // Send updated (cleared) scores
        });
    });

    socket.on("disconnect", () => {
        console.log("A player disconnected:", socket.id);
    });
});

// Helpers
function checkWinner() {
    const winCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (let [a, b, c] of winCombos) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a]; // Return "X" or "O"
        }
    }
    return null;
}

function switchPlayer(player) {
    return player === "X" ? "O" : "X";
}

// Start server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
