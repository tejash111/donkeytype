"use client"

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const Chat = ({ messages = [], onSendMessage, username }) => {
    const [input, setInput] = useState('')
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = (e) => {
        e.preventDefault()
        if (input.trim()) {
            onSendMessage(input.trim())
            setInput('')
        }
    }

    return (
        <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-gray-200 font-medium">Chat</span>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-4 min-h-[200px] max-h-[300px] scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent pr-2">
                <AnimatePresence>
                    {messages.length === 0 ? (
                        <div className="text-gray-600 text-sm text-center py-8">
                            Say hi! 👋 to fellow donkeys
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`flex flex-col ${msg.username === username ? 'items-end' : 'items-start'}`}
                            >
                                <span className="text-xs text-gray-500 mb-1">{msg.username}</span>
                                <div
                                    className={`px-3 py-2 rounded-lg max-w-[80%] break-words text-sm ${msg.username === username
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-neutral-700/50 text-gray-300'
                                        }`}
                                >
                                    {msg.message}
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 bg-neutral-800/50 border border-neutral-700/50 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-green-500/50 transition-colors"
                    maxLength={200}
                />
                <button
                    type="submit"
                    disabled={!input.trim()}
                    className="px-4 py-2.5 bg-green-500 text-black rounded-lg hover:bg-green-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </form>
        </div>
    )
}

export default Chat
