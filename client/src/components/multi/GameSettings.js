"use client"

import React from 'react'

const GameSettings = ({
    timeLimit,
    setTimeLimit,
    wordCount,
    setWordCount,
    gameMode,
    setGameMode,
    isCreator
}) => {
    return (
        <div className="flex flex-wrap items-center justify-center gap-3 py-2">
            {/* Mode Selector */}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => setGameMode('time')}
                    disabled={!isCreator}
                    className={`px-4 py-1.5 text-sm rounded-lg transition-all ${gameMode === 'time'
                            ? 'bg-green-500/20 text-green-500'
                            : 'text-gray-500 hover:text-gray-300'
                        } ${!isCreator ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    time
                </button>
                <button
                    onClick={() => setGameMode('words')}
                    disabled={!isCreator}
                    className={`px-4 py-1.5 text-sm rounded-lg transition-all ${gameMode === 'words'
                            ? 'bg-green-500/20 text-green-500'
                            : 'text-gray-500 hover:text-gray-300'
                        } ${!isCreator ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    words
                </button>
            </div>

            <span className="text-gray-700">|</span>

            {/* Time/Word Options based on mode */}
            <div className="flex items-center gap-1">
                {gameMode === 'time' ? (
                    // Time options
                    [15, 30, 60, 120].map((time) => (
                        <button
                            key={time}
                            onClick={() => setTimeLimit(time)}
                            disabled={!isCreator}
                            className={`px-3 py-1.5 text-sm rounded-lg transition-all ${timeLimit === time
                                    ? 'bg-green-500/20 text-green-500'
                                    : 'text-gray-500 hover:text-gray-300'
                                } ${!isCreator ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {time < 60 ? time : `${time / 60}m`}
                        </button>
                    ))
                ) : (
                    // Word count options
                    [10, 25, 50, 100].map((count) => (
                        <button
                            key={count}
                            onClick={() => setWordCount(count)}
                            disabled={!isCreator}
                            className={`px-3 py-1.5 text-sm rounded-lg transition-all ${wordCount === count
                                    ? 'bg-green-500/20 text-green-500'
                                    : 'text-gray-500 hover:text-gray-300'
                                } ${!isCreator ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {count}
                        </button>
                    ))
                )}
            </div>

            {!isCreator && (
                <span className="text-gray-600 text-xs ml-2">waiting for host...</span>
            )}
        </div>
    );
};

export default GameSettings;
