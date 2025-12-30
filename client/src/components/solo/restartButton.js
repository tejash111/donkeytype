import React, { useRef, useEffect } from 'react'
import { MdRefresh } from "react-icons/md";

const RestartButton = ({onRestart:handleRestart}) => {
    const buttonRef=useRef(null)

     const handleClick = () => {
    buttonRef.current?.blur();
    handleRestart();
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
    
      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault(); 
        handleRestart();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleRestart]);

  return (
    <button
      tabIndex={-1} // to prevent focus
      ref={buttonRef}
      onClick={handleClick}
    className={`block rounded px-8 py-2 hover:bg-slate-700/50 mx-auto mt-4`}>
        <MdRefresh  className='w-6 h-6  text-green-700/80'/>
    </button>
  )
}

export default RestartButton