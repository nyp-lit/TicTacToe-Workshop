const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;


// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "frontend")));

// Game state
let players = { X: "", O: "" };
let board = Array(9).fill("");
let currentPlayer = "X";
let gameActive = false;

// Listen for socket connections
io.on("connection", (socket) => {
    console.log("A player connected:", socket.id);

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
            draw: false
        });
    });

    // Handle move
    socket.on("playMove", ({ index, player }) => {
        if (!gameActive || board[index] || player !== currentPlayer) return;

        board[index] = currentPlayer;
        const winner = checkWinner();
        const draw = board.every(cell => cell !== "");

        gameActive = !(winner || draw);

        io.emit("gameUpdate", {
            board,
            currentPlayer: gameActive ? switchPlayer(currentPlayer) : currentPlayer,
            gameActive,
            winner,
            draw,
            players
        });

        if (gameActive) {
            currentPlayer = switchPlayer(currentPlayer);
        }
    });

    socket.on("resetGame", () => {
        board = Array(9).fill("");
        currentPlayer = "X";
        gameActive = false;

        io.emit("gameUpdate", {
            board,
            currentPlayer,
            gameActive,
            players,
            winner: null,
            draw: false
        });
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

