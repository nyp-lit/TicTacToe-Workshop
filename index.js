const express = require("express");
const http = require("http");
const path = require("path");   
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;

app.use(express.static(path.join(__dirname, "..", "frontend")));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "..", "frontend", "toplay.html"));
});

let players = { X: "", O: "" };
let board = Array(9).fill("");
let currentPlayer = "X";
let gameActive = false;
let scores = { X: 0, O: 0 };

io.on("connection", (socket) => {
    console.log("A player connected:", socket.id);

    socket.emit("gameUpdate", {
        board,
        currentPlayer,
        gameActive,
        players,
        winner: checkWinner(),
        draw: board.every(cell => cell !== "") && !checkWinner(),
        scores
    });

    console.log("Initial game state sent to:", socket.id);

    socket.on("startGame", ({ player1, player2 }) => {
        players.X = player1 || "Player 1";
        players.O = player2 || "Player 2";
        board = Array(9).fill("");
        currentPlayer = "X";
        gameActive = true;

        console.log(`Game started: ${players.X} (X) vs ${players.O} (O)`);

        io.emit("gameUpdate", {
            board,
            currentPlayer,
            gameActive,
            players,
            winner: null,
            draw: false,
            scores
        });

        console.log("Game update emitted after startGame.");
    });

    socket.on("playMove", ({ index, player }) => {
        console.log(`playMove received from ${player} at index ${index}`);

        if (!gameActive || board[index] || player !== currentPlayer) {
            console.log("Invalid move or game not active. Ignored.");
            return;
        }

        board[index] = currentPlayer;
        const winner = checkWinner();
        const draw = board.every(cell => cell !== "") && !winner;

        gameActive = !(winner || draw);

        if (winner) {
            scores[winner]++;
            console.log(`Player ${winner} wins!`);
        } else if (draw) {
            console.log("Game ended in a draw.");
        }

        io.emit("gameUpdate", {
            board,
            currentPlayer: gameActive ? switchPlayer(currentPlayer) : currentPlayer,
            gameActive,
            winner,
            draw,
            players,
            scores
        });

        console.log("Game update emitted after playMove.");

        if (gameActive) {
            currentPlayer = switchPlayer(currentPlayer);
        }
    });

    socket.on("resetGame", () => {
        board = Array(9).fill("");
        currentPlayer = "X";
        gameActive = false;

        console.log("Game reset by", socket.id);

        io.emit("gameUpdate", {
            board,
            currentPlayer,
            gameActive,
            players,
            winner: null,
            draw: false,
            scores
        });

        console.log("Game update emitted after resetGame.");
    });

    socket.on("restartScoreboard", () => {
        scores = { X: 0, O: 0 };

        console.log("Scoreboard reset by", socket.id);

        io.emit("gameUpdate", {
            board,
            currentPlayer,
            gameActive,
            players,
            winner: null,
            draw: false,
            scores
        });

        console.log("Game update emitted after restartScoreboard.");
    });

    socket.on("disconnect", () => {
        console.log("A player disconnected:", socket.id);
    });
});

function checkWinner() {
    const winCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (let [a, b, c] of winCombos) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

function switchPlayer(player) {
    return player === "X" ? "O" : "X";
}

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
