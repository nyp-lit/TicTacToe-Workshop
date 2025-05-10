const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, ''))); // To link to frontend 

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    const data = JSON.parse(message);

    if (data.type === "startGame") {
      const player1Symbol = Math.random() < 0.5 ? "X" : "O";
      const player2Symbol = player1Symbol === "X" ? "O" : "X";

      ws.send(JSON.stringify({
        type: "assignSymbols",
        player1: {
          name: data.player1,
          symbol: player1Symbol
        },
        player2: {
          name: data.player2,
          symbol: player2Symbol
        }
      }));
    }
  });
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});