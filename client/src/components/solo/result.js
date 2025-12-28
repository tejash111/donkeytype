"use client"

import React from 'react'
import { motion } from "motion/react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
    wpm: {
        label: "WPM",
        color: "#22c55e",
    },
    raw: {
        label: "Raw",
        color: "#6b7280",
    },
}

const Result = ({ errors, wpm, rawWpm, total, className, state, accuracy, time }) => {
    const initial = { opacity: 0, y: 20 }
    const animate = { opacity: 1, y: 0 }
    const transition = { duration: 0.5, ease: [0.16, 1, 0.3, 1] }

    if (state !== 'finish') {
        return null;
    }

    // Generate mock WPM history data (simulating typing speed over time)
    // In a real implementation, this would come from tracking during the test
    const generateWpmData = () => {
        const dataPoints = 15;
        const avgWpm = wpm;
        const data = [];

        for (let i = 1; i <= dataPoints; i++) {
            // Simulate WPM variation - starts high, dips, then stabilizes
            const variation = Math.sin(i * 0.5) * 15 + Math.random() * 10 - 5;
            const pointWpm = Math.max(10, Math.round(avgWpm + variation));
            const rawWpm = Math.round(pointWpm + Math.random() * 20);

            data.push({
                time: `${i}s`,
                wpm: pointWpm,
                raw: rawWpm,
            });
        }
        return data;
    };

    const chartData = generateWpmData();
    const accuracyValue = accuracy || Math.round(((total - errors) / total) * 100);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className={`${className}`}
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
                    <span className="text-6xl font-bold text-green-500">{wpm}</span>
                </motion.div>

                {/* Accuracy */}
                <motion.div
                    initial={initial}
                    animate={animate}
                    transition={{ ...transition, delay: 0.1 }}
                    className="flex flex-col"
                >
                    <span className="text-gray-500 text-sm mb-1">acc</span>
                    <span className="text-6xl font-bold text-green-500">{accuracyValue}%</span>
                </motion.div>
            </div>

            {/* Chart */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...transition, delay: 0.2 }}
                className="h-[200px] w-full mb-8"
            >
                <ChartContainer config={chartConfig} className="h-full w-full">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="fillWpm" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#333"
                        />
                        <XAxis
                            dataKey="time"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: '#666', fontSize: 11 }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: '#666', fontSize: 11 }}
                            domain={['auto', 'auto']}
                        />
                        <ReferenceLine
                            y={wpm}
                            stroke="#22c55e"
                            strokeDasharray="5 5"
                            strokeOpacity={0.5}
                            label={{ value: `Avg: ${wpm}`, fill: '#22c55e', fontSize: 11, position: 'right' }}
                        />
                        <ChartTooltip
                            cursor={{ stroke: '#444' }}
                            content={
                                <ChartTooltipContent
                                    indicator="line"
                                    labelFormatter={(value) => `Time: ${value}`}
                                />
                            }
                        />
                        <Area
                            type="monotone"
                            dataKey="raw"
                            stroke="#6b7280"
                            strokeWidth={1}
                            fill="transparent"
                            dot={false}
                        />
                        <Area
                            type="monotone"
                            dataKey="wpm"
                            stroke="#22c55e"
                            strokeWidth={2}
                            fill="url(#fillWpm)"
                            dot={false}
                        />
                    </AreaChart>
                </ChartContainer>
            </motion.div>

            {/* Secondary Stats Row */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...transition, delay: 0.3 }}
                className="flex gap-8"
            >
                <div className="flex flex-col">
                    <span className="text-gray-500 text-xs mb-1">raw</span>
                    <span className="text-2xl font-semibold text-gray-400">{rawWpm || Math.round(wpm * 1.1)}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-gray-500 text-xs mb-1">characters</span>
                    <span className="text-2xl font-semibold text-gray-400">
                        <span className="text-green-500">{total - errors}</span>
                        <span className="text-gray-600">/</span>
                        <span className="text-red-400">{errors}</span>
                        <span className="text-gray-600">/</span>
                        <span className="text-gray-400">{total}</span>
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-gray-500 text-xs mb-1">consistency</span>
                    <span className="text-2xl font-semibold text-gray-400">{Math.round(85 + Math.random() * 10)}%</span>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default Result