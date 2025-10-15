"use client"
import RestartButton from '@/components/restartButton';
import Result from '@/components/result';
import Typing from '@/components/typing';
import useCountdownTimer from '@/hooks/countdownTimer';
import useTyping from '@/hooks/usetyping';
import { calculateAccuracyPercentage, calculateWordsPerMinute, countErrors } from '@/services/helper';
import { faker } from '@faker-js/faker'
import React, { useEffect, useState } from 'react'

function generateRandomWords(count = 20) {
  return Array.from({ length: count }, () => faker.word.sample()).join(' ');
}
const Solo = () => {
  const [words,setWords] = useState(() => generateRandomWords());
  const [state,setState]=useState("start")

  const countdownSeconds=10;

  const {timeLeft,startCountdown,resetCountdown}=useCountdownTimer(countdownSeconds)

   const updateWords = () => {
    setWords(generateRandomWords());
  }

  const {typed,cursor,clearTyped,resetTotalTyped,totalTyped} = useTyping(state !== "finish")

  const [errors,setErrors]=useState(0)
  const starting = state === "start" && cursor>0;
  const wordsFinished = cursor ===words.length

    const restart = () => {
    console.log("restarting...");
    resetCountdown();
    resetTotalTyped();
    setState("start");
    setErrors(0);
    updateWords();
    clearTyped();
  }

  useEffect(()=>{
    if (starting){
      setState("run");
      startCountdown();
    }
  },[starting,startCountdown])

    useEffect(()=>{
    if (!timeLeft && state === "run"){
      console.log("time is up..");
      setState("finish");
      const finalErrors = countErrors(typed, words.substring(0, typed.length));
      setErrors(finalErrors);
    }
  },[timeLeft, state, typed, words])

  useEffect(()=>{
    if (wordsFinished && state === "run"){
      console.log("words are finished");
      const currentErrors = countErrors(typed, words);
      setErrors(currentErrors);
      updateWords();
      clearTyped();
    }
  },[wordsFinished, state])

  

  return (
    <div className='bg-neutral-800 min-h-screen flex items-center justify-center font-mono tracking-wider p-4 mx-auto'>
      <div>
      <div className='text-yellow-500/90 font-medium '>
      Time : {timeLeft}
      </div>
      <div className='relative max-w-5xl mt-3 select-none focus:outline-none'>
        <p className='text-lg text-gray-100/80 select-none'>{words}</p>
        <Typing words={words} className={"absolute inset-0 text-lg select-none font-mono"} userInput={typed}/>
      </div>
      
      <RestartButton  onRestart={restart}  className=""/>

      <Result
      state={state}
      className={"mt-10"}
      errors={errors}
      wpm={calculateWordsPerMinute(totalTyped,10)}
      total={totalTyped}
      />
      </div>
    </div>
  )
}

export default Solo