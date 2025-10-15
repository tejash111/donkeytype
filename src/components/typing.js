"use client"

import cn from "classnames";
import InputBar from "./InputBar";

const Typing = ({
  userInput,
  words,
  className = "",
}) => {
  const typedCharacters = userInput.split("");

  return (
    <div className={className}>
      {typedCharacters.map((char, index) => (
        <Character
          key={`${char}_${index}`}
          actual={char}
          expected={words[index]}
        />
      ))}
      <InputBar />
    </div>
  );
};

const Character = ({
  actual,
  expected,
}) => {
  const isCorrect = actual === expected;
  const isWhiteSpace = expected === " ";

  return (
    <span
      className={cn("bg-neutral-800", {
        "text-red-500": !isCorrect && !isWhiteSpace,
        "text-yellow-400": isCorrect && !isWhiteSpace,
        "bg-red-500": !isCorrect && isWhiteSpace,
      })}
    >
      {expected}
    </span>
  );
};

export default Typing;