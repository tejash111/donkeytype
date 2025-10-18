"use client"
import RestartButton from '@/components/solo/restartButton';
import Result from '@/components/solo/result';
import Typing from '@/components/solo/typing';
import useCountdownTimer from '@/hooks/countdownTimer';
import useTyping from '@/hooks/usetyping';
import { calculateAccuracyPercentage, calculateWordsPerMinute, countErrors } from '@/services/helper';
import { faker } from '@faker-js/faker'
import React, { useEffect, useState } from 'react'

function generateRandomWords(count = 20) {
  return Array.from({ length: count }, () => faker.word.sample()).join(' ');
}
const Solo = () => {
  const [mode, setMode] = useState('time'); // 'time' or 'words'
  const [wordCount, setWordCount] = useState(25);
  const [countdownSeconds, setCountdownSeconds] = useState(30);
  const [words, setWords] = useState(() => generateRandomWords(wordCount));
  const [state, setState] = useState("start")

  const { timeLeft, startCountdown, resetCountdown } = useCountdownTimer(countdownSeconds)

  const updateWords = () => {
    setWords(generateRandomWords(wordCount));
  }

  const { typed, cursor, clearTyped, resetTotalTyped, totalTyped } = useTyping(state !== "finish")

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
        // In words mode, finish immediately when all words are typed
        const currentErrors = countErrors(typed, words);
        setErrors(currentErrors);
        setState("finish");
      } else if (mode === 'time') {
        // In time mode, generate new words and keep going
        const currentErrors = countErrors(typed, words);
        setErrors((prev) => prev + currentErrors);
        updateWords();
        clearTyped();
      }
    }
  }, [wordsFinished, state, mode, typed, words])



  return (
    <div className='bg-neutral-800 min-h-screen flex items-center justify-center font-mono tracking-wider p-4 mx-auto'>
      <div className="w-full max-w-5xl">
        {state === "start" && cursor === 0 && (
          <div className="bg-neutral-900 p-8 rounded-lg mb-6">
            <h2 className="text-2xl font-bold text-yellow-500 mb-6 text-center">Game Settings</h2>

            {/* Mode Selection */}
            <div className="mb-8">
              <label className="block text-gray-300 mb-3 text-center text-lg">Mode</label>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setMode('time')}
                  className={`px-8 py-4 rounded-lg font-bold transition ${mode === 'time'
                      ? 'bg-yellow-500 text-neutral-900'
                      : 'bg-neutral-800 text-gray-300 hover:bg-neutral-700'
                    }`}
                >
                  Time Mode
                </button>
                <button
                  onClick={() => setMode('words')}
                  className={`px-8 py-4 rounded-lg font-bold transition ${mode === 'words'
                      ? 'bg-yellow-500 text-neutral-900'
                      : 'bg-neutral-800 text-gray-300 hover:bg-neutral-700'
                    }`}
                >
                  Words Mode
                </button>
              </div>
              <p className="text-gray-400 text-center mt-2 text-sm">
                {mode === 'time'
                  ? 'Type as many words as possible before time runs out'
                  : 'Complete all words as fast as you can'}
              </p>
            </div>

            <div className="space-y-6">
              {mode === 'time' && (
                <div>
                  <label className="block text-gray-300 mb-3 text-center">Time (seconds)</label>
                  <div className="flex gap-3 justify-center flex-wrap">
                    {[15, 30, 60, 120].map((time) => (
                      <button
                        key={time}
                        onClick={() => setCountdownSeconds(time)}
                        className={`px-6 py-3 rounded-lg font-bold transition ${countdownSeconds === time
                            ? 'bg-yellow-500 text-neutral-900'
                            : 'bg-neutral-800 text-gray-300 hover:bg-neutral-700'
                          }`}
                      >
                        {time < 60 ? time : `${time / 60}m`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mode === 'words' && (
                <div>
                  <label className="block text-gray-300 mb-3 text-center">Number of Words</label>
                  <div className="flex gap-3 justify-center flex-wrap">
                    {[10, 25, 50, 100].map((count) => (
                      <button
                        key={count}
                        onClick={() => {
                          setWordCount(count);
                          setWords(generateRandomWords(count));
                        }}
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
              )}
            </div>
            <p className="text-gray-400 text-center mt-6">Start typing to begin...</p>
          </div>
        )}

        <div>
          <div className='flex justify-between items-center mb-2'>
            <div className='text-yellow-500/90 font-medium text-xl'>
              {mode === 'time' ? (
                <>Time: {timeLeft}s</>
              ) : (
                <>Words: {cursor} / {words.split(' ').length}</>
              )}
            </div>
            <div className='text-gray-400'>
              {mode === 'time' ? 'Type as many words as you can!' : `Complete ${wordCount} words`}
            </div>
          </div>
          <div className='relative max-w-5xl mt-3 select-none focus:outline-none'>
            <p className='text-lg text-gray-100/80 select-none'>{words}</p>
            <Typing words={words} className={"absolute inset-0 text-lg select-none font-mono"} userInput={typed} />
          </div>

          <RestartButton onRestart={restart} className="" />

          <Result
            state={state}
            className={"mt-10"}
            errors={errors}
            wpm={mode === 'time'
              ? calculateWordsPerMinute(totalTyped, countdownSeconds - timeLeft)
              : calculateWordsPerMinute(totalTyped, startTime ? (Date.now() - startTime) / 1000 : 1)
            }
            total={totalTyped}
          />
        </div>
      </div>
    </div>
  )
}

export default Solo