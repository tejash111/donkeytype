"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000"); 

export default function Home({ roomId }) {
  const [progress, setProgress] = useState(0);
  const [players, setPlayers] = useState({});

  useEffect(() => {
    socket.emit("join-room", roomId);

    socket.on("user-joined", (id) => {
      console.log("User joined:", id);
    });

    socket.on("progress-update", ({ userId, progress }) => {
      setPlayers((prev) => ({ ...prev, [userId]: progress }));
    });

    socket.on("game-started", () => {
      alert("Game started!");
    });

    return () => socket.disconnect();
  }, [roomId]);

  const handleProgress = (value) => {
    setProgress(value);
    socket.emit("progress", { roomId, progress: value });
  };

  return (
    <div className="p-4">
      <h2>Room: {roomId}</h2>
      <p>Your progress: {progress}%</p>
      <input
        type="range"
        min="0"
        max="100"
        value={progress}
        onChange={(e) => handleProgress(e.target.value)}
      />
      <div className="mt-4">
        <h3>Players:</h3>
        {Object.entries(players).map(([id, p]) => (
          <p key={id}>{id}: {p}%</p>
        ))}
      </div>
      <button
        onClick={() => socket.emit("start-game", roomId)}
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Start Game
      </button>
    </div>
  );
}
