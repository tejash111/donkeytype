"use client"
import RestartButton from '@/components/restartButton';
import Result from '@/components/result';
import Typing from '@/components/typing';
import { faker } from '@faker-js/faker'
import React, { useState } from 'react'

function generateRandomWords(count = 20) {
  return Array.from({ length: count }, () => faker.word.sample()).join(' ');
}



const Solo = () => {
  const [words,setWords] = useState(() => generateRandomWords());
  const [state,setState]=useState("start")
  

  return (
    <div className='bg-slate-800 min-h-screen flex items-center justify-center font-mono tracking-wider p-4 mx-auto'>
      <div>
      <div className='text-yellow-500/90 font-medium '>
      Time : 
      </div>
      <div className='relative max-w-5xl mt-3'>
        <p className='text-lg text-gray-100/80 '>{words}</p>
        <Typing className={"absolute inset-0 text-lg"} userInput={"solace modulo"}/>
      </div>
      
      <RestartButton className=""/>

      <Result
      className={"mt-10"}
      errors={10}
      accuracyPercentage={90}
      total={200}
      />
      </div>
    </div>
  )
}

export default Solo