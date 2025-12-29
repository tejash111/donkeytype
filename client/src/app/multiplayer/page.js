"use client"

import React, { useEffect, useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { CustomNavbar } from '@/components/navbar';
import { faker } from '@faker-js/faker';
import useTyping from '@/hooks/usetyping';
import { calculateAccuracyPercentage, calculateWordsPerMinute, countErrors } from '@/services/helper';
import ResultSummary from '@/components/multi/ResultSummary';
import PlayerCard from '@/components/multi/PlayerCard';
import GameSettings from '@/components/multi/GameSettings';
import TypingArea from '@/components/multi/TypingArea';
import Chat from '@/components/multi/Chat';

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
    const playersRef = React.useRef(players); // Ref to track players without re-triggering effects

    useEffect(() => {
        playersRef.current = players;
    }, [players]);

    const [myId, setMyId] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [wordCount, setWordCount] = useState(30);
    const [timeLimit, setTimeLimit] = useState(60);
    const [timeLeft, setTimeLeft] = useState(null);
    const [roomCreator, setRoomCreator] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [gameMode, setGameMode] = useState('time'); // 'time' or 'words'
    const [wpmHistory, setWpmHistory] = useState({}); // { [playerId]: [{ time: '1s', wpm: 10, raw: 10 }] }

    // Set myId whenever socket changes
    useEffect(() => {
        if (socket?.id) {
            setMyId(socket.id);
            console.log("My socket ID set to:", socket.id);
        }
    }, [socket?.id]);

    const { typed, cursor, clearTyped, resetTotalTyped, totalTyped, totalErrors } = useTyping(gameState === 'playing', words);

    useEffect(() => {
        if (!socket) return;

        socket.on('room-state', ({ roomId, players, gameState, words, creator, timeLimit, wordCount, gameMode }) => {
            console.log("Room State Received:", { roomId, players, gameState, creator });
            console.log("My socket ID:", socket.id);
            console.log("Am I creator?", socket.id === creator);
            setPlayers(players);
            setGameState(gameState);
            if (words) setWords(words);
            setRoomCreator(creator);
            if (timeLimit !== undefined) setTimeLimit(timeLimit);
            if (wordCount !== undefined) setWordCount(wordCount);
            if (gameMode !== undefined) setGameMode(gameMode);
            setInRoom(true);
        });

        socket.on('player-joined', ({ players, timeLimit, wordCount, gameMode }) => {
            setPlayers(players);
            if (timeLimit !== undefined) setTimeLimit(timeLimit);
            if (wordCount !== undefined) setWordCount(wordCount);
            if (gameMode !== undefined) setGameMode(gameMode);
        });

        socket.on('player-left', ({ players }) => {
            setPlayers(players);
        });

        socket.on('game-started', ({ words, players, startTime: serverStartTime, timeLimit: serverTimeLimit, wordCount: serverWordCount, gameMode: serverGameMode }) => {
            setWords(words);
            setGameState('playing');
            setPlayers(players);
            setStartTime(serverStartTime);
            if (serverTimeLimit !== undefined) setTimeLimit(serverTimeLimit);
            if (serverWordCount !== undefined) setWordCount(serverWordCount);
            if (serverGameMode !== undefined) setGameMode(serverGameMode);
            setTimeLeft(serverTimeLimit !== undefined ? serverTimeLimit : timeLimit);
            setWpmHistory({}); // Reset history
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

        // Chat message listener
        socket.on('new-chat-message', (message) => {
            setChatMessages((prev) => [...prev, message]);
        });

        socket.on('settings-updated', ({ timeLimit, wordCount, gameMode }) => {
            if (timeLimit !== undefined) setTimeLimit(timeLimit);
            if (wordCount !== undefined) setWordCount(wordCount);
            if (gameMode !== undefined) setGameMode(gameMode);
        });

        return () => {
            socket.off('room-state');
            socket.off('player-joined');
            socket.off('player-left');
            socket.off('game-started');
            socket.off('progress-update');
            socket.off('game-finished');
            socket.off('new-chat-message');
            socket.off('settings-updated');
        };
    }, [socket, clearTyped, resetTotalTyped]);

    // Timer countdown
    useEffect(() => {
        if (gameState !== 'playing' || timeLeft === null || !socket) return;

        if (timeLeft <= 0) {
            // Time's up - emit event to server
            socket.emit('time-up', { roomId });
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev === null || prev <= 0) return 0;
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState, timeLeft, socket, roomId, timeLimit]);

    useEffect(() => {
        if (!socket || gameState !== 'playing' || !inRoom || !startTime) return;

        const elapsedTime = (Date.now() - startTime) / 1000; // seconds
        const progress = (cursor / words.length) * 100;

        // Use totalErrors for accuracy and WPM calculation like solo mode
        const accuracy = calculateAccuracyPercentage(totalErrors, totalTyped);
        const wpm = calculateWordsPerMinute(totalTyped, Math.max(1, elapsedTime), totalErrors);
        const finished = cursor >= words.length;

        socket.emit('update-progress', {
            roomId,
            progress,
            wpm: Math.round(wpm),
            accuracy: Math.round(accuracy),
            finished,
        });

        // When words are finished, generate new ones (don't end the game)
        if (finished && gameState === 'playing') {
            const newWords = generateRandomWords(wordCount);
            setWords(newWords);
            clearTyped();
            resetTotalTyped();
        }
    }, [cursor, typed, socket, gameState, inRoom, roomId, words, totalTyped, startTime, wordCount, clearTyped, resetTotalTyped, totalErrors]);

    // Sample WPM history every second
    useEffect(() => {
        if (gameState !== 'playing' || !startTime) return;

        const interval = setInterval(() => {
            const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
            if (timeElapsed <= 0) return;

            setWpmHistory(prev => {
                const newHistory = { ...prev };
                const currentPlayers = playersRef.current; // Read from ref

                currentPlayers.forEach(player => {
                    if (!newHistory[player.id]) newHistory[player.id] = [];
                    // Avoid duplicate entries for the same second
                    if (!newHistory[player.id].find(h => h.time === `${timeElapsed}s`)) {
                        newHistory[player.id].push({
                            time: `${timeElapsed}s`,
                            wpm: player.wpm || 0,
                            raw: player.wpm || 0
                        });
                    }
                });
                return newHistory;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [gameState, startTime]); // Removed players from dependency

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
        setChatMessages([]);
        clearTyped();
    };

    const sendChatMessage = (message) => {
        if (!socket || !roomId) return;
        socket.emit('chat-message', { roomId, message, username });
    };

    const restart = () => {
        startGame();
    };

    // Generate random 6-character room code
    const generateRoomCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    const [mode, setMode] = useState('create'); // 'create' or 'join'

    const createRoom = () => {
        if (!socket) {
            console.error("Socket not connected");
            return;
        }
        if (!username) {
            console.error("Username required");
            return;
        }
        console.log("Creating room with username:", username);
        const newRoomId = generateRoomCode();
        console.log("Generated Room ID:", newRoomId);
        setRoomId(newRoomId);
        socket.emit('join-room', { roomId: newRoomId, username });
    };

    if (!connected) {
        return (
            <div className="bg-black min-h-screen flex items-center justify-center font-mono">
                <div className="text-center">
                    <div className="animate-pulse text-green-500 text-xl mb-2">Connecting to server...</div>
                    <div className="text-gray-500 text-sm">Please wait</div>
                </div>
            </div>
        );
    }

    if (!inRoom) {
        return (
            <div className="bg-black min-h-screen font-mono text-white">
                <div className="max-w-7xl mx-auto p-4">
                    <CustomNavbar />
                    <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
                        <div className="w-full max-w-md">
                            {/* Title */}
                            <h1 className="text-4xl font-bold text-green-500 mb-8 text-center">
                                multiplayer
                            </h1>

                            {/* Mode Toggle */}
                            <div className="flex mb-6 bg-neutral-900/50 rounded-xl p-1">
                                <button
                                    onClick={() => setMode('create')}
                                    className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${mode === 'create'
                                        ? 'bg-green-500/10 text-green-500'
                                        : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                >
                                    create room
                                </button>
                                <button
                                    onClick={() => setMode('join')}
                                    className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${mode === 'join'
                                        ? 'bg-green-500/10 text-green-500'
                                        : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                >
                                    join room
                                </button>
                            </div>

                            {/* Form Card */}
                            <div className="bg-neutral-900/30 rounded-xl p-6 space-y-5">
                                {/* Username Input */}
                                <div>
                                    <label className="block text-gray-500 text-xs mb-2 uppercase tracking-wider">username</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full px-4 py-3 bg-neutral-800/50 text-white rounded-lg border border-neutral-700/50 focus:outline-none focus:border-green-500/50 transition-colors placeholder:text-gray-600"
                                        placeholder="enter your name"
                                        maxLength={15}
                                    />
                                </div>

                                {/* Room Code Input (only for join mode) */}
                                {mode === 'join' && (
                                    <div>
                                        <label className="block text-gray-500 text-xs mb-2 uppercase tracking-wider">room code</label>
                                        <input
                                            type="text"
                                            value={roomId}
                                            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                                            className="w-full px-4 py-3 bg-neutral-800/50 text-white rounded-lg border border-neutral-700/50 focus:outline-none focus:border-green-500/50 transition-colors placeholder:text-gray-600 uppercase tracking-widest text-center font-bold"
                                            placeholder="XXXXXX"
                                            maxLength={6}
                                        />
                                    </div>
                                )}

                                {/* Action Button */}
                                {mode === 'create' ? (
                                    <button
                                        onClick={createRoom}
                                        disabled={!username}
                                        className="w-full py-4 rounded-lg font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-green-500 text-black hover:bg-green-400"
                                    >
                                        create room
                                    </button>
                                ) : (
                                    <button
                                        onClick={joinRoom}
                                        disabled={!username || roomId.length !== 6}
                                        className="w-full py-4 rounded-lg font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-green-500 text-black hover:bg-green-400"
                                    >
                                        join room
                                    </button>
                                )}
                            </div>

                            {/* Info Text */}
                            <p className="text-center text-gray-600 text-xs mt-6">
                                {mode === 'create'
                                    ? 'A unique 6-character room code will be generated'
                                    : 'Enter the room code shared by your friend'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-black h-screen font-mono overflow-auto p-4">
            <div className="max-w-7xl mx-auto">
                {gameState !== 'playing' && <CustomNavbar />}
                {/* Room Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-2xl text-gray-200 font-medium mb-2">
                            {players.find(p => p.id === roomCreator)?.username || username}&apos;s Room
                            <span className="text-gray-500 mx-2">|</span>
                            <span className="text-green-500">
                                {gameMode === 'time'
                                    ? (timeLimit < 60 ? `${timeLimit}s` : `${timeLimit / 60}m`)
                                    : `${wordCount} words`
                                }
                            </span>
                        </h1>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500"># Room Code:</span>
                            <span className="text-green-500 font-bold tracking-widest">{roomId}</span>
                            <button
                                onClick={() => navigator.clipboard.writeText(roomId)}
                                className="text-gray-500 hover:text-green-500 transition-colors p-1"
                                title="Copy room code"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {gameState === 'waiting' && myId === roomCreator && (
                            <button
                                onClick={startGame}
                                className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-black rounded-lg font-medium hover:bg-green-400 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Start
                            </button>
                        )}
                        <button
                            onClick={leaveRoom}
                            className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                            leave room
                        </button>
                    </div>
                </div>

                {/* Game Settings / Timer - Centered and Narrow */}
                {gameState === 'waiting' && (
                    <div className="flex justify-center mb-4">
                        <div className="bg-[#070606] rounded-xl px-6 py-3 inline-flex">
                            <GameSettings
                                timeLimit={timeLimit}
                                setTimeLimit={(value) => {
                                    setTimeLimit(value);
                                    if (socket && myId === roomCreator) {
                                        socket.emit('update-settings', { roomId, timeLimit: value });
                                    }
                                }}
                                wordCount={wordCount}
                                setWordCount={(value) => {
                                    setWordCount(value);
                                    if (socket && myId === roomCreator) {
                                        socket.emit('update-settings', { roomId, wordCount: value });
                                    }
                                }}
                                gameMode={gameMode}
                                setGameMode={(value) => {
                                    setGameMode(value);
                                    if (socket && myId === roomCreator) {
                                        socket.emit('update-settings', { roomId, gameMode: value });
                                    }
                                }}
                                isCreator={myId === roomCreator}
                            />
                        </div>
                    </div>
                )}

                {/* Typing Area when playing - Full Width */}
                {gameState === 'playing' && (
                    <div className="mb-6">
                        <div className="bg-[#070606] rounded-xl p-4 mb-4 flex justify-center">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-green-500">{timeLeft}</div>
                                <div className="text-gray-500 text-xs">seconds left</div>
                            </div>
                        </div>
                        <div className="bg-[#070606] rounded-xl p-6">
                            <TypingArea
                                words={words}
                                typed={typed}
                                timeLeft={timeLeft}
                                timeLimit={timeLimit}
                            />
                        </div>
                    </div>
                )}



                <ResultSummary
                    players={players}
                    myId={myId}
                    gameState={gameState}
                    onRestart={restart}
                    isCreator={myId === roomCreator}
                    wpmHistory={wpmHistory}
                />

                {/* Chat and Typists - Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Chat Panel - Hidden during gameplay */}
                    {gameState !== 'playing' && (
                        <div className={`${gameState === 'finished' ? 'lg:col-span-2' : ''}`}>
                            <div className="bg-[#070606] rounded-xl p-5 h-[350px]">
                                <Chat
                                    messages={chatMessages}
                                    onSendMessage={sendChatMessage}
                                    username={username}
                                />
                            </div>
                        </div>
                    )}

                    {/* Typists Panel - Hide when finished as ResultSummary has leaderboard */}
                    {gameState !== 'finished' && (
                        <div>
                            <div className="bg-[#070606] rounded-xl p-5 h-[350px]">
                                <div className="flex items-center gap-2 mb-4">
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span className="text-gray-200 font-medium">Dashers ({players.length})</span>
                                </div>
                                <div className="space-y-2 overflow-y-auto max-h-[280px]">
                                    {players
                                        .sort((a, b) => b.wpm - a.wpm)
                                        .map((player, index) => (
                                            <PlayerCard
                                                key={player.id}
                                                player={player}
                                                index={index}
                                                myId={myId}
                                                roomCreator={roomCreator}
                                                gameState={gameState}
                                            />
                                        ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>


            </div>
        </div>
    );
};

export default MultiplayerPage;
