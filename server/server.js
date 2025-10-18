import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});


const rooms = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);


  socket.on("join-room", (data) => {
  
    if (!data || typeof data !== 'object') {
      console.error("Invalid join-room data:", data);
      socket.emit("error", { message: "Invalid room data" });
      return;
    }

    const { roomId, username } = data;

    if (!roomId) {
      console.error("Missing roomId");
      socket.emit("error", { message: "Room ID is required" });
      return;
    }

    socket.join(roomId);

    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        players: new Map(),
        gameState: "waiting", 
        words: null,
        startTime: null,
      });
    }

    const room = rooms.get(roomId);

    // Add player to room
    room.players.set(socket.id, {
      id: socket.id,
      username: username || `Player${socket.id.slice(0, 4)}`,
      progress: 0,
      wpm: 0,
      accuracy: 0,
      finished: false,
      ready: false,
    });

    console.log(`${username} (${socket.id}) joined room ${roomId}`);


    socket.emit("room-state", {
      roomId,
      players: Array.from(room.players.values()),
      gameState: room.gameState,
      words: room.words,
    });

    socket.to(roomId).emit("player-joined", {
      player: room.players.get(socket.id),
      players: Array.from(room.players.values()),
    });
  });

  // Start the game
  socket.on("start-game", (data) => {
    if (!data || !data.roomId) {
      console.error("Invalid start-game data:", data);
      return;
    }

    const { roomId, words } = data;
    const room = rooms.get(roomId);
    if (!room) return;

    room.gameState = "playing";
    room.words = words;
    room.startTime = Date.now();


    room.players.forEach((player) => {
      player.progress = 0;
      player.wpm = 0;
      player.accuracy = 0;
      player.finished = false;
    });

    console.log(`Game started in room ${roomId}`);

    io.to(roomId).emit("game-started", {
      words,
      startTime: room.startTime,
      players: Array.from(room.players.values()),
    });
  });


  socket.on("update-progress", (data) => {
    if (!data || !data.roomId) {
      return;
    }

    const { roomId, progress, wpm, accuracy, finished } = data;
    const room = rooms.get(roomId);
    if (!room || !room.players.has(socket.id)) return;

    const player = room.players.get(socket.id);
    player.progress = progress;
    player.wpm = wpm;
    player.accuracy = accuracy;
    player.finished = finished;


    io.to(roomId).emit("progress-update", {
      playerId: socket.id,
      progress,
      wpm,
      accuracy,
      finished,
      players: Array.from(room.players.values()),
    });

    const allFinished = Array.from(room.players.values()).every(p => p.finished);
    if (allFinished && room.gameState === "playing") {
      room.gameState = "finished";
      io.to(roomId).emit("game-finished", {
        players: Array.from(room.players.values()),
      });
    }
  });


  socket.on("player-ready", (data) => {
    if (!data || !data.roomId) {
      return;
    }

    const { roomId, ready } = data;
    const room = rooms.get(roomId);
    if (!room || !room.players.has(socket.id)) return;

    const player = room.players.get(socket.id);
    player.ready = ready;

    io.to(roomId).emit("player-ready-update", {
      playerId: socket.id,
      ready,
      players: Array.from(room.players.values()),
    });
  });

 
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

  
    rooms.forEach((room, roomId) => {
      if (room.players.has(socket.id)) {
        const player = room.players.get(socket.id);
        room.players.delete(socket.id);

     
        socket.to(roomId).emit("player-left", {
          playerId: socket.id,
          username: player.username,
          players: Array.from(room.players.values()),
        });


        if (room.players.size === 0) {
          rooms.delete(roomId);
          console.log(`Room ${roomId} deleted (empty)`);
        }
      }
    });
  });


  socket.on("leave-room", (roomId) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const player = room.players.get(socket.id);
    room.players.delete(socket.id);
    socket.leave(roomId);

    socket.to(roomId).emit("player-left", {
      playerId: socket.id,
      username: player?.username,
      players: Array.from(room.players.values()),
    });

    if (room.players.size === 0) {
      rooms.delete(roomId);
    }
  });
});

const PORT = 4000;
server.listen(PORT, () => console.log(`✅ Socket.IO server running on port ${PORT}`));
