const express = require("express");
const app = express();
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
const PORT = process.env.PORT || 2000;
const server = http.createServer(app);
const Player = require("./players");

app.use(cors("*"));

let _admin = null;
let _players = [];
let report = []

const io = new Server(server, {
  cors: {
    origin: "*",
  },
  path: "/myapp/socket.io",
});

const defaultNameSpace = io.on("connection", (socket) => {
  socket.on("roomJoin", (data) => {
    socket.join(data);
  });
  socket.on("sendRoomMessage", ({ roomName, eventName, message }) => {
    io.to(roomName).emit(eventName, message);
  });

  socket.on("calculateResult", (data) => {
    const defender = _players.find((val) => val.id === data.defender);
    const attacker = _players.find((val) => val.id === data.attacker);
    if (data.defenseArray.includes(data.attackNumber)) {
      if (!defender) {
        console.log("No such defender!");
        return;
      }
      defender.incrementPoints();
      if (defender.points == 2) {
        const defenderIndex = _players.findIndex((val) => val.id === data.defender)
        _players[defenderIndex].points = 0
        io.to(data.roomName).emit("winner", defender.name);
      } else {
        io.to(data.roomName).emit("changeAttacker", data.defender);
      }
    } else {
      if (!attacker) {
        console.log("No such attacker!");
        return;
      }
      attacker.incrementPoints();
      if (attacker?.points == 2) {
        const attackerIndex = _players.findIndex((val) => val.id === data.attacker)
        _players[attackerIndex].points = 0
        io.to(data.roomName).emit("winner", attacker.name);
      } else {
        io.to(data.roomName).emit("noChange", "changing");
      }
    }

    io.to(data.roomName).emit("scoreBoard", {
      [attacker.name]: attacker.points,
      [defender.name]: defender.points,
    });
  });
  socket.on("removePlayer", (data) => {
    console.log("Player getting removed: ", data);
    _players = _players.filter((val) => val.id !== data.id);
  });

  socket.on("pJoin", (data) => {
    playerNamespace.emit("pJoin", data)
  })
  socket.on("admin", ({eventName, Message}) => {
    adminNamespace.emit(eventName, Message)
  })

  socket.on("player", ({eventName, Message}) => {
    playerNamespace.emit(eventName, Message)
  })

  socket.on("checkWin", () => {
      setTimeout(() => {
        if(_players.length === 1) {
          playerNamespace.emit("userWon", true);
          report.push(`${_players[0].name} has won the game!`);
          adminNamespace.emit("userWon", {name: _players[0].name, reportData: report})
        }
      }, 1000)
  })

  socket.on("addReport", (message) => {
      report.push(message)
  })
});

const adminNamespace = io.of("/admin").on("connection", (socket) => {
  if (_admin) {
    socket.emit("errMsg", "An admin has already connected!");
    socket.disconnect();
  } else {
    console.log("Admin connected:", socket.id);
    _admin = socket.id;
    setInterval(() => {
      socket.emit("joinedPlayers", _players);
    }, 500);

    socket.on("disconnect", async () => {
      _admin = null;
    });
  }
});

const handlePlayerJoin = (data) => {
  if (!_admin) {
    return false;
  }
  const player = _players.find((val) => val.id == data.id);
  if (!player) {
    _players.push(new Player(data.name, data.id, data.defensiveSetSize));
    console.log("Player connected:", data.id);
  } else {
    console.log("player Already exist")
  }
  return true;
};

const playerNamespace = io.of("/player").on("connection", (socket) => {
  socket.on("pJoin", (data) => {
    if (handlePlayerJoin(data)) {
      socket.emit("waiting", true);
    }else{
      socket.emit("errMsg", "Admin has not joined the room!")
    }
  });

  socket.on("clear", () => {
    _players = []
  })
  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    _players = _players.filter((data) => data.id !== socket.id);
  });
});

const handleStartGame = async () => {
  const roomCnt = _players.length / 2;
  let roomIds = [...Array(roomCnt).keys()].map((data) => `room_${data}`);
  let i = 0;

  for (const roomId of roomIds) {
    const player1 = await io.of("/player").in(_players[i].id).fetchSockets();
    const player2 = await io.of("/player").in(_players[i + 1].id).fetchSockets();
    report.push(`${_players[i].name} vs ${_players[i+1].name}`)
    if (player1[0] && player2[0]) {
      player1[0].emit("joinRoom", {
        id: _players[i].id,
        room: roomId,
        player: _players[i],
        scoreBoard: {
          [_players[i].name]: 0,
          [_players[i + 1].name]: 0,
        },
        attackerId: _players[i].id,
      });

      player2[0].emit("joinRoom", {
        id: _players[i + 1].id,
        room: roomId,
        scoreBoard: {
          [_players[i].name]: 0,
          [_players[i + 1].name]: 0,
        },
        player: _players[i + 1],
      });
    } else {
      console.log(`Unable to find player sockets for players ${_players[i].id} and ${_players[i + 1].id}`);
    }

    i += 2;
  }
};

app.get("/startGame", (req, res) => {
  try {
    handleStartGame();
    return res.send({ status: "working" });
  } catch (err) {
    console.log(err);
  }
});

const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
app.get("/attack", (req, res) => {
  const rand = getRandomNumber(1, 10);
  return res.send({ data: rand });
});

app.get("/defense", (req, res) => {
  const defensiveSet = +req.query.set;
  const array = Array(defensiveSet);
  for (let i = 0; i < defensiveSet; i++) {
    array[i] = getRandomNumber(1, 10);
  }
  return res.send({ data: array });
});

server.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
