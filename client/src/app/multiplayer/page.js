"use client"

import React, { useEffect, useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { faker } from '@faker-js/faker';
import Typing from '@/components/solo/typing';
import useTyping from '@/hooks/usetyping';
import { calculateAccuracyPercentage, calculateWordsPerMinute, countErrors } from '@/services/helper';
import RestartButton from '@/components/solo/restartButton';

function generateRandomWords(count = 30) {
    return Array.from({ length: count }, () => faker.word.sample()).join(' ');
}

const MultiplayerPage = () => {
    const { socket, connected } = useSocket();
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    const [inRoom, setInRoom] = useState(false);
    const [gameState, setGameState] = useState('waiting'); // waiting, playing, finished
    const [words, setWords] = useState('');
    const [players, setPlayers] = useState([]);
    const [myId, setMyId] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [wordCount, setWordCount] = useState(30);
    const [timeLimit, setTimeLimit] = useState(60); // in seconds
    const [timeLeft, setTimeLeft] = useState(null);

    const { typed, cursor, clearTyped, resetTotalTyped, totalTyped } = useTyping(gameState === 'playing');

    useEffect(() => {
        if (!socket) return;

        setMyId(socket.id);


        socket.on('room-state', ({ roomId, players, gameState, words }) => {
            setPlayers(players);
            setGameState(gameState);
            if (words) setWords(words);
            setInRoom(true);
        });

        socket.on('player-joined', ({ players }) => {
            setPlayers(players);
        });


        socket.on('player-left', ({ players }) => {
            setPlayers(players);
        });

        socket.on('game-started', ({ words, players, startTime: serverStartTime }) => {
            setWords(words);
            setGameState('playing');
            setPlayers(players);
            setStartTime(serverStartTime);
            setTimeLeft(timeLimit);
            clearTyped();
            resetTotalTyped();
        });

        socket.on('progress-update', ({ players }) => {
            setPlayers(players);
        });


        socket.on('game-finished', ({ players }) => {
            setGameState('finished');
            setPlayers(players);
        });

        return () => {
            socket.off('room-state');
            socket.off('player-joined');
            socket.off('player-left');
            socket.off('game-started');
            socket.off('progress-update');
            socket.off('game-finished');
        };
    }, [socket, clearTyped, resetTotalTyped]);

    // Timer countdown
    useEffect(() => {
        if (gameState !== 'playing' || timeLeft === null) return;

        if (timeLeft <= 0) {
            setGameState('finished');
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setGameState('finished');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState, timeLeft]);


    useEffect(() => {
        if (!socket || gameState !== 'playing' || !inRoom || !startTime) return;

        const elapsedTime = (Date.now() - startTime) / 1000; // seconds
        const progress = (cursor / words.length) * 100;
        const errors = countErrors(typed, words.substring(0, typed.length));
        const accuracy = calculateAccuracyPercentage(errors, totalTyped);
        const wpm = calculateWordsPerMinute(totalTyped, Math.max(1, elapsedTime));
        const finished = cursor >= words.length;

        socket.emit('update-progress', {
            roomId,
            progress,
            wpm: Math.round(wpm),
            accuracy: Math.round(accuracy),
            finished,
        });

        if (finished && gameState === 'playing') {
            setGameState('finished');
        }
    }, [cursor, typed, socket, gameState, inRoom, roomId, words, totalTyped, startTime]);

    const joinRoom = () => {
        if (!socket || !roomId || !username) return;
        socket.emit('join-room', { roomId, username });
    };

    const startGame = () => {
        if (!socket) return;
        const newWords = generateRandomWords(wordCount);
        socket.emit('start-game', { roomId, words: newWords });
    };

    const leaveRoom = () => {
        if (!socket) return;
        socket.emit('leave-room', roomId);
        setInRoom(false);
        setGameState('waiting');
        setPlayers([]);
        setWords('');
        clearTyped();
    };

    const restart = () => {
        startGame();
    };

    if (!connected) {
        return (
            <div className="bg-neutral-800 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-yellow-500 text-xl mb-2">Connecting to server...</div>
                </div>
            </div>
        );
    }

    if (!inRoom) {
        return (
            <div className="bg-neutral-800 min-h-screen flex items-center justify-center font-mono">
                <div className="bg-neutral-900 p-8 rounded-lg shadow-xl max-w-md w-full">
                    <h1 className="text-3xl font-bold text-yellow-500 mb-6 text-center">Multiplayer Mode</h1>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-300 mb-2">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 bg-neutral-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                placeholder="Enter your username"
                                onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2">Room ID</label>
                            <input
                                type="text"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                className="w-full px-4 py-2 bg-neutral-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                placeholder="Enter or create room ID"
                                onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
                            />
                        </div>

                        <button
                            onClick={joinRoom}
                            disabled={!username || !roomId}
                            className="w-full bg-yellow-500 text-neutral-900 py-3 rounded font-bold hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Join Room
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-neutral-800 min-h-screen p-4 font-mono">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-yellow-500">Room: {roomId}</h1>
                        <p className="text-gray-400">Players: {players.length}</p>
                    </div>
                    <button
                        onClick={leaveRoom}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                        Leave Room
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Typing Area */}
                    <div className="lg:col-span-2">
                        <div className="bg-neutral-900 p-6 rounded-lg">
                            {gameState === 'waiting' && (
                                <div className="text-center py-8">
                                    <p className="text-gray-400 mb-6">Configure game settings</p>

                                    <div className="space-y-6 mb-6">
                                        <div>
                                            <label className="block text-gray-300 mb-3">Time (seconds)</label>
                                            <div className="flex gap-3 justify-center flex-wrap">
                                                {[15, 30, 60, 120].map((time) => (
                                                    <button
                                                        key={time}
                                                        onClick={() => setTimeLimit(time)}
                                                        className={`px-6 py-3 rounded-lg font-bold transition ${timeLimit === time
                                                                ? 'bg-yellow-500 text-neutral-900'
                                                                : 'bg-neutral-800 text-gray-300 hover:bg-neutral-700'
                                                            }`}
                                                    >
                                                        {time < 60 ? time : `${time / 60}m`}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-gray-300 mb-3">Number of Words</label>
                                            <div className="flex gap-3 justify-center flex-wrap">
                                                {[10, 25, 50, 100].map((count) => (
                                                    <button
                                                        key={count}
                                                        onClick={() => setWordCount(count)}
                                                        className={`px-6 py-3 rounded-lg font-bold transition ${wordCount === count
                                                                ? 'bg-yellow-500 text-neutral-900'
                                                                : 'bg-neutral-800 text-gray-300 hover:bg-neutral-700'
                                                            }`}
                                                    >
                                                        {count}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={startGame}
                                        className="px-6 py-3 bg-yellow-500 text-neutral-900 rounded font-bold hover:bg-yellow-400 transition"
                                    >
                                        Start Game
                                    </button>
                                </div>
                            )}

                            {gameState === 'playing' && (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="text-yellow-500 font-bold text-xl">
                                            Time: {timeLeft}s
                                        </div>
                                        <div className="text-gray-400">
                                            {wordCount} words
                                        </div>
                                    </div>
                                    <div className="relative mb-4 min-h-[200px]">
                                        <p className="text-lg text-gray-100/80 select-none">{words}</p>
                                        <Typing
                                            words={words}
                                            className="absolute inset-0 text-lg select-none"
                                            userInput={typed}
                                        />
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-yellow-500">
                                            Progress: {Math.round((cursor / words.length) * 100)}%
                                        </span>
                                        <span className="text-gray-400">
                                            {cursor} / {words.length} characters
                                        </span>
                                    </div>
                                </div>
                            )}

                            {gameState === 'finished' && (
                                <div className="text-center py-12">
                                    <h2 className="text-3xl font-bold text-yellow-500 mb-4">Game Finished!</h2>
                                    <p className="text-gray-400 mb-6">Check the leaderboard on the right</p>
                                    <RestartButton onRestart={restart} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Players List */}
                    <div className="lg:col-span-1">
                        <div className="bg-neutral-900 p-6 rounded-lg">
                            <h2 className="text-xl font-bold text-yellow-500 mb-4">
                                {gameState === 'finished' ? 'Leaderboard' : 'Players'}
                            </h2>
                            <div className="space-y-3">
                                {players
                                    .sort((a, b) => {
                                        if (gameState === 'finished') {
                                            // Sort by finish order, then by WPM
                                            if (a.finished && b.finished) return b.wpm - a.wpm;
                                            if (a.finished) return -1;
                                            if (b.finished) return 1;
                                        }
                                        return b.progress - a.progress;
                                    })
                                    .map((player, index) => (
                                        <div
                                            key={player.id}
                                            className={`p-3 rounded ${player.id === myId ? 'bg-yellow-500/20 border border-yellow-500' : 'bg-neutral-800'
                                                }`}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-bold text-white">
                                                    {gameState === 'finished' && `#${index + 1} `}
                                                    {player.username}
                                                    {player.id === myId && ' (You)'}
                                                </span>
                                                {player.finished && (
                                                    <span className="text-green-500 text-sm">✓ Finished</span>
                                                )}
                                            </div>
                                            {(gameState === 'playing' || gameState === 'finished') && (
                                                <div>
                                                    <div className="w-full bg-neutral-700 rounded-full h-2 mb-1">
                                                        <div
                                                            className="bg-yellow-500 h-2 rounded-full transition-all"
                                                            style={{ width: `${player.progress}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between text-xs text-gray-400">
                                                        <span>WPM: {player.wpm || 0}</span>
                                                        <span>Acc: {player.accuracy || 0}%</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MultiplayerPage;
