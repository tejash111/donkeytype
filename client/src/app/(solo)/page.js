"use client"
import { CustomNavbar } from '@/components/navbar';
import RestartButton from '@/components/solo/restartButton';
import Result from '@/components/solo/result';
import Typing from '@/components/solo/typing';
import useCountdownTimer from '@/hooks/countdownTimer';
import useTyping from '@/hooks/usetyping';
import { calculateAccuracyPercentage, calculateWordsPerMinute, calculateRawWpm, countErrors } from '@/services/helper';
import { faker } from '@faker-js/faker'
import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from "motion/react"

function generateRandomWords(count = 20) {
  return Array.from({ length: count }, () => faker.word.sample()).join(' ');
}
const Solo = () => {
  const [mode, setMode] = useState('time');
  const [wordCount, setWordCount] = useState(25);
  const [countdownSeconds, setCountdownSeconds] = useState(30);
  const [words, setWords] = useState(() => generateRandomWords(30));
  const [state, setState] = useState("start")
  const [wordsTypedCount, setWordsTypedCount] = useState(0); // Track total words typed in words mode
  const [allWordsTyped, setAllWordsTyped] = useState([]); // Track all words typed for word count calculation

  const { timeLeft, startCountdown, resetCountdown } = useCountdownTimer(countdownSeconds)

  const updateWords = () => {
    setWords(generateRandomWords(30));
  }

  const { typed, cursor, clearTyped, resetTotalTyped, totalTyped, totalKeystrokes, totalErrors } = useTyping(state !== "finish", words)

  const [errors, setErrors] = useState(0)
  const [startTime, setStartTime] = useState(null);
  const starting = state === "start" && cursor > 0;
  const wordsFinished = cursor === words.length

  const restart = () => {
    console.log("restarting...");
    resetCountdown();
    resetTotalTyped();
    setState("start");
    setErrors(0);
    setStartTime(null);
    setWordsTypedCount(0);
    setAllWordsTyped([]);
    updateWords();
    clearTyped();
  }

  useEffect(() => {
    if (starting) {
      setState("run");
      setStartTime(Date.now());
      if (mode === 'time') {
        startCountdown();
      }
    }
  }, [starting, startCountdown, mode])

  useEffect(() => {
    if (!timeLeft && state === "run" && mode === 'time') {
      console.log("time is up..");
      setState("finish");
      const finalErrors = countErrors(typed, words.substring(0, typed.length));
      setErrors(finalErrors);
    }
  }, [timeLeft, state, typed, words, mode])

  useEffect(() => {
    if (wordsFinished && state === "run") {
      console.log("words are finished");

      if (mode === 'words') {
        // Get completed words from current typing session
        const completedWords = typed.trim().split(/\s+/).filter(w => w.length > 0);
        const updatedAllWords = [...allWordsTyped, ...completedWords];
        setAllWordsTyped(updatedAllWords);
        const newWordsTypedCount = updatedAllWords.length;
        setWordsTypedCount(newWordsTypedCount);

        // Check if we've reached the target word count
        if (newWordsTypedCount >= wordCount) {
          const currentErrors = countErrors(typed, words);
          setErrors(currentErrors);
          setState("finish");
        } else {
          // Generate new words and continue
          const currentErrors = countErrors(typed, words);
          setErrors((prev) => prev + currentErrors);
          updateWords();
          clearTyped();
        }
      } else if (mode === 'time') {
        // In time mode, generate new words and keep going
        const currentErrors = countErrors(typed, words);
        setErrors((prev) => prev + currentErrors);
        updateWords();
        clearTyped();
      }
    }
  }, [wordsFinished, state, mode, typed, words, wordsTypedCount, wordCount, allWordsTyped, clearTyped, updateWords])

  // Check if target word count reached while typing
  useEffect(() => {
    if (mode === 'words' && state === 'run') {
      const currentTypedWords = typed.trim().split(/\s+/).filter(w => w.length > 0);
      const totalWords = wordsTypedCount + currentTypedWords.length;
      
      if (totalWords >= wordCount) {
        // Update final state
        const completedWords = typed.trim().split(/\s+/).filter(w => w.length > 0);
        const updatedAllWords = [...allWordsTyped, ...completedWords];
        setAllWordsTyped(updatedAllWords);
        setWordsTypedCount(updatedAllWords.length);
        
        const currentErrors = countErrors(typed, words.substring(0, typed.length));
        setErrors(currentErrors);
        setState("finish");
      }
    }
  }, [typed, mode, state, wordCount, wordsTypedCount, allWordsTyped, words])


  if (state === "finish") {
    return (
      <div className='bg-black min-h-screen flex justify-center items-center font-mono tracking-wider p-4 mx-auto'>
        <div className="w-full max-w-2xl mx-auto">
          <Result
            state={state}
            className={"mt-10"}
            errors={totalErrors}
            wpm={mode === 'time'
              ? calculateWordsPerMinute(totalTyped, countdownSeconds - timeLeft, totalErrors)
              : calculateWordsPerMinute(totalTyped, startTime ? (Date.now() - startTime) / 1000 : 1, totalErrors)
            }
            rawWpm={mode === 'time'
              ? calculateRawWpm(totalTyped, countdownSeconds - timeLeft)
              : calculateRawWpm(totalTyped, startTime ? (Date.now() - startTime) / 1000 : 1)
            }
            total={totalKeystrokes}
            time={mode === 'time' ? countdownSeconds - timeLeft : (startTime ? (Date.now() - startTime) / 1000 : 0)}
          />
          <RestartButton onRestart={restart} className="mt-8" />
        </div>
      </div>
    );
  }

  return (
    <div className='bg-black min-h-screen flex  justify-center font-mono tracking-wider p-4 mx-auto '>
      <div className="w-full max-w-7xl ">
        <CustomNavbar />
        <AnimatePresence>
          {state === "start" && cursor === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bg-neutral-900/30 rounded-xl px-6 py-3 flex items-center justify-center gap-6 mt-10 mx-auto w-fit"
            >
              {/* Mode Selection */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMode('time')}
                  className={`px-4 py-2 text-sm rounded-md transition-all duration-200 ${mode === 'time'
                    ? 'text-green-500 bg-green-500/10'
                    : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                  time
                </button>
                <button
                  onClick={() => setMode('words')}
                  className={`px-4 py-2 text-sm rounded-md transition-all duration-200 ${mode === 'words'
                    ? 'text-green-500 bg-green-500/10'
                    : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                  words
                </button>
              </div>

              {/* Separator */}
              <div className='h-5 w-[2px] bg-gray-600/50 rounded-full' />

              {/* Duration/Count Selection */}
              <div className="flex items-center gap-1">
                {mode === 'time' ? (
                  [15, 30, 60, 120].map((time) => (
                    <button
                      key={time}
                      onClick={() => setCountdownSeconds(time)}
                      className={`px-4 py-2 text-sm rounded-md transition-all duration-200 ${countdownSeconds === time
                        ? 'text-green-500 bg-green-500/10'
                        : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                      {time < 60 ? time : `${time / 60}m`}
                    </button>
                  ))
                ) : (
                  [10, 25, 50, 100].map((count) => (
                    <button
                      key={count}
                      onClick={() => {
                        setWordCount(count);
                        setWords(generateRandomWords(30));
                        setWordsTypedCount(0);
                        setAllWordsTyped([]);
                      }}
                      className={`px-4 py-2 text-sm rounded-md transition-all duration-200 ${wordCount === count
                        ? 'text-green-500 bg-green-500/10'
                        : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                      {count}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className='mt-20'>
          <div className='flex justify-between items-center mb-2 min-h-[44px]'>
            <div className='text-green-700/90 font-medium text-3xl'>
              {mode === 'time' ? (
                <>Time: {timeLeft}s</>
              ) : (
                <>Words: {wordsTypedCount + typed.trim().split(/\s+/).filter(w => w.length > 0).length} / {wordCount}</>
              )}
            </div>

          </div>
          <div className='mt-3 select-none focus:outline-none'>
            <Typing words={words} className={"text-4xl select-none font-mono font-normal tracking-wider leading-relaxed"} userInput={typed} />
          </div>

          <RestartButton onRestart={restart} className="" />


        </div>
      </div>
    </div>
  )
}

export default Solo