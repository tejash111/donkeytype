import React from 'react'
import {easeInOut, motion} from "motion/react"

const InputBar = () => {
  return (
    <motion.div
    aria-hidden={true}
    className='inline-block bg-yellow-400 w-0.5 h-7 align-top'
    initial={{opacity:1}}
    animate={{opacity:0}}
    exit={{opacity:1}}
    transition={{repeat:Infinity,duration:0.9,ease:easeInOut}}
    />
  )
}

export default InputBar