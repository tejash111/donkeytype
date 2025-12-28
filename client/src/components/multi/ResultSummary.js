"use client"

import React from 'react'
import { motion } from "motion/react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ReferenceLine, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

// Helper function to generate distinct colors
const getPlayerColor = (index, isMe) => {
    if (isMe) return "#22c55e"; // Green for me
    const colors = [
        "#eab308", // Yellow
        "#3b82f6", // Blue
        "#ef4444", // Red
        "#a855f7", // Purple
        "#f97316", // Orange
        "#06b6d4", // Cyan
        "#ec4899", // Pink
    ];
    return colors[index % colors.length];
};

const ResultSummary = ({ players, myId, gameState, onRestart, isCreator, wpmHistory }) => {
    const initial = { opacity: 0, y: 20 }
    const animate = { opacity: 1, y: 0 }
    const transition = { duration: 0.5, ease: [0.16, 1, 0.3, 1] }

    if (gameState !== 'finished') {
        return null;
    }

    const myPlayer = players.find(p => p.id === myId);
    const sortedPlayers = [...players].sort((a, b) => b.wpm - a.wpm);
    const myRank = sortedPlayers.findIndex(p => p.id === myId) + 1;

    // Process wpmHistory into chart friendly format
    // Expected: [{ time: '1s', player1Id: 20, player2Id: 30 }, ...]
    const processChartData = () => {
        if (!wpmHistory || Object.keys(wpmHistory).length === 0) return [];

        // Find the player with the longest history to determine time points
        let maxTimePoints = 0;
        let maxTimePointsPlayerId = null;

        Object.entries(wpmHistory).forEach(([pid, history]) => {
            if (history.length > maxTimePoints) {
                maxTimePoints = history.length;
                maxTimePointsPlayerId = pid;
            }
        });

        if (!maxTimePointsPlayerId) return [];

        // Create base array of time points
        const chartData = wpmHistory[maxTimePointsPlayerId].map(h => ({ time: h.time }));

        // Fill in data for each player at each time point
        players.forEach(player => {
            const playerHistory = wpmHistory[player.id] || [];
            playerHistory.forEach((point, index) => {
                if (chartData[index]) {
                    chartData[index][player.id] = point.wpm;
                }
            });
        });

        return chartData;
    };

    const chartData = processChartData();

    // Dynamically generate chart config and gradients
    const chartConfig = {};
    players.forEach((p, idx) => {
        chartConfig[p.id] = {
            label: p.username,
            color: getPlayerColor(idx, p.id === myId)
        };
    });

    const getRankSuffix = (rank) => {
        if (rank === 1) return 'st';
        if (rank === 2) return 'nd';
        if (rank === 3) return 'rd';
        return 'th';
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="py-8"
        >
            {/* Main Stats Row */}
            <div className="flex items-start gap-12 mb-8">
                {/* WPM - Large Display */}
                <motion.div
                    initial={initial}
                    animate={animate}
                    transition={{ ...transition, delay: 0 }}
                    className="flex flex-col"
                >
                    <span className="text-gray-500 text-sm mb-1">wpm</span>
                    <span className="text-6xl font-bold text-green-500">{myPlayer?.wpm || 0}</span>
                </motion.div>

                {/* Accuracy */}
                <motion.div
                    initial={initial}
                    animate={animate}
                    transition={{ ...transition, delay: 0.1 }}
                    className="flex flex-col"
                >
                    <span className="text-gray-500 text-sm mb-1">acc</span>
                    <span className="text-6xl font-bold text-green-500">{myPlayer?.accuracy || 0}%</span>
                </motion.div>

                {/* Rank */}
                <motion.div
                    initial={initial}
                    animate={animate}
                    transition={{ ...transition, delay: 0.2 }}
                    className="flex flex-col"
                >
                    <span className="text-gray-500 text-sm mb-1">rank</span>
                    <span className="text-6xl font-bold text-yellow-400">
                        {myRank}<span className="text-2xl">{getRankSuffix(myRank)}</span>
                    </span>
                </motion.div>
            </div>

            {/* Chart - Multi-User */}
            <motion.div
                initial={initial}
                animate={animate}
                transition={{ ...transition, delay: 0.3 }}
                className="mb-8"
            >
                {/* Custom Legend */}
                <div className="flex flex-wrap gap-4 mb-2 justify-end text-xs">
                    {players.map((p, idx) => (
                        <div key={p.id} className="flex items-center gap-1.5">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: getPlayerColor(idx, p.id === myId) }}
                            />
                            <span className={p.id === myId ? "text-white font-medium" : "text-gray-500"}>
                                {p.username} {p.id === myId && "(you)"}
                            </span>
                        </div>
                    ))}
                </div>

                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            {players.map((p, idx) => (
                                <linearGradient key={p.id} id={`fill_${p.id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={getPlayerColor(idx, p.id === myId)} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={getPlayerColor(idx, p.id === myId)} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid vertical={false} stroke="#333" strokeDasharray="3 3" />
                        <XAxis
                            dataKey="time"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fill: '#6b7280', fontSize: 11 }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fill: '#6b7280', fontSize: 11 }}
                            domain={['dataMin - 10', 'dataMax + 10']}
                        />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-[#070606] border border-neutral-800 p-3 rounded-lg shadow-xl">
                                            <p className="text-gray-400 text-xs mb-2">{label}</p>
                                            {payload.map((entry) => {
                                                const player = players.find(p => p.id === entry.dataKey);
                                                if (!player) return null;
                                                return (
                                                    <div key={entry.dataKey} style={{ color: entry.stroke }} className="text-sm font-mono mb-1">
                                                        {player.username}: {entry.value} wpm
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        {/* Reference line for my average */}
                        <ReferenceLine
                            y={myPlayer?.wpm || 0}
                            stroke="#22c55e"
                            strokeDasharray="5 5"
                            strokeOpacity={0.3}
                        />

                        {/* Render Areas for each player */}
                        {players.map((p, idx) => (
                            <Area
                                key={p.id}
                                dataKey={p.id}
                                type="monotone"
                                fill={`url(#fill_${p.id})`}
                                stroke={getPlayerColor(idx, p.id === myId)}
                                strokeWidth={p.id === myId ? 3 : 2}
                                strokeOpacity={p.id === myId ? 1 : 0.6}
                                fillOpacity={p.id === myId ? 1 : 0.6}
                                activeDot={{ r: 4, strokeWidth: 0 }}
                            />
                        ))}
                    </AreaChart>
                </ChartContainer>
            </motion.div>

            {/* Additional Stats Row */}
            <motion.div
                initial={initial}
                animate={animate}
                transition={{ ...transition, delay: 0.4 }}
                className="flex gap-8 text-sm mb-8"
            >
                <div className="flex flex-col">
                    <span className="text-gray-500 mb-1">progress</span>
                    <span className="text-xl text-gray-300">{myPlayer?.progress?.toFixed(0) || 0}%</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-gray-500 mb-1">players</span>
                    <span className="text-xl text-gray-300">{players.length}</span>
                </div>
            </motion.div>

            {/* Leaderboard - Compact */}
            <motion.div
                initial={initial}
                animate={animate}
                transition={{ ...transition, delay: 0.5 }}
                className="mb-6"
            >
                <span className="text-gray-500 text-sm mb-3 block">leaderboard</span>
                <div className="space-y-2">
                    {sortedPlayers.slice(0, 5).map((player, index) => (
                        <div
                            key={player.id}
                            className={`flex items-center justify-between py-2 ${player.id === myId ? 'text-green-500' : 'text-gray-400'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`w-5 text-center ${index === 0 ? 'text-yellow-400' :
                                        index === 1 ? 'text-gray-300' :
                                            index === 2 ? 'text-orange-400' : 'text-gray-500'
                                    }`}>
                                    {index + 1}
                                </span>
                                <span>{player.username}{player.id === myId && ' (you)'}</span>
                            </div>
                            <div className="flex gap-4 text-sm">
                                <span>{player.wpm} wpm</span>
                                <span>{player.accuracy}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Action Button */}
            {isCreator && (
                <motion.div
                    initial={initial}
                    animate={animate}
                    transition={{ ...transition, delay: 0.6 }}
                >
                    <button
                        onClick={onRestart}
                        className="px-6 py-2 bg-green-500 text-black rounded-lg font-medium hover:bg-green-400 transition-all"
                    >
                        play again
                    </button>
                </motion.div>
            )}
            {!isCreator && (
                <motion.p
                    initial={initial}
                    animate={animate}
                    transition={{ ...transition, delay: 0.6 }}
                    className="text-gray-500 text-sm"
                >
                    waiting for host to start next game...
                </motion.p>
            )}
        </motion.div>
    )
}

export default ResultSummary
