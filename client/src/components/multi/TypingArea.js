"use client"

import React from 'react'
import Typing from '@/components/solo/typing'

const TypingArea = ({ words, typed, timeLeft, timeLimit }) => {
    return (
        <div>
            {/* Timer and instruction - smaller text like solo */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <div className={`font-medium text-sm ${timeLeft <= 10 ? 'text-red-500 animate-pulse' :
                        timeLeft <= 30 ? 'text-orange-400' :
                            'text-green-500'
                        }`}>
                        {timeLeft}s
                    </div>
                    <div className="text-gray-500 text-xs">
                        type as fast as you can
                    </div>
                </div>
                {/* Timer Progress Bar - Green theme */}
                <div className="w-full bg-neutral-800 rounded-full h-1">
                    <div
                        className={`h-1 rounded-full transition-all duration-300 ${timeLeft <= 10 ? 'bg-red-500' :
                            timeLeft <= 30 ? 'bg-orange-400' :
                                'bg-green-500'
                            }`}
                        style={{ width: `${(timeLeft / timeLimit) * 100}%` }}
                    />
                </div>
            </div>

            {/* Typing Area - like solo with bigger text */}
            <div className="relative min-h-[120px]">
                <Typing
                    words={words}
                    className="text-2xl select-none font-mono leading-relaxed"
                    userInput={typed}
                />
            </div>
        </div>
    );
};

export default TypingArea;
