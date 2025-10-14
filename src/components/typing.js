import React from 'react'
import InputBar from './InputBar';

const Typing = ({userInput,className}) => {
    const typedCharacters=userInput.split("");
  return (
    <div className={className}>
        {typedCharacters.map((char,index)=>{
            return <span key={`${char}_${index}`} className='text-yellow-400/90 '>
                {char}
            </span>
})}
<InputBar/>
    </div>
  )
}

export default Typing