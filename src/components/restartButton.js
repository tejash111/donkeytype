import React, { useRef } from 'react'
import { MdRefresh } from "react-icons/md";

const RestartButton = () => {
    const buttonRef=useRef(null)
  return (
    <button className={`block rounded px-8 py-2 hover:bg-slate-700/50 mx-auto mt-4`}>
        <MdRefresh  className='w-6 h-6  text-yellow-400/80'/>
    </button>
  )
}

export default RestartButton