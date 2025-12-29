"use client"

import React from 'react'
import Image from 'next/image'

const PlayerCard = ({ player, index, myId, roomCreator, gameState }) => {
    const getRankColor = (rank) => {
        switch (rank) {
            case 0: return 'text-yellow-400';
            case 1: return 'text-gray-400';
            case 2: return 'text-orange-400';
            default: return 'text-gray-600';
        }
    };

    const isMe = player.id === myId;
    const isCreator = player.id === roomCreator;

    return (
        <div className="py-2 transition-all">
            <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-200">
                    {(gameState === 'playing' || gameState === 'finished') && (
                        <span className={`inline-block w-5 text-center mr-2 text-sm ${getRankColor(index)}`}>
                            {index + 1}
                        </span>
                    )}
                    {player.username}
                    {isMe && <span className="text-green-500 ml-1">(you)</span>}
                    {isCreator && <img src="/king.svg" alt="Host" className="inline-block w-4 h-4 ml-1" />}
                </span>
                {player.finished && (
                    <span className="text-green-500 text-xs">✓</span>
                )}
            </div>
            {(gameState === 'playing' || gameState === 'finished') && (
                <div>
                    <div className="w-full bg-neutral-700/50 rounded-full h-1.5 mb-2">
                        <div
                            className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${player.progress}%` }}
                        />
                    </div>
                    <div className="flex justify-center gap-6 text-xs text-gray-500">
                        <span>{player.wpm || 0} wpm</span>
                        <span>{player.accuracy || 0}% acc</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayerCard;
