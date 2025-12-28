"use client"

import cn from "classnames";
import { motion } from "motion/react";

const Typing = ({
  userInput,
  words,
  className = "",
}) => {
  const characters = words.split("");
  const typedLength = userInput.length;

  return (
    <div className={className}>
      {characters.map((char, index) => {
        const isTyped = index < typedLength;
        const actual = userInput[index];

        if (isTyped) {
          return (
            <Character
              key={`char_${index}`}
              actual={actual}
              expected={char}
            />
          );
        } else if (index === typedLength) {
          // This is where the caret should be
          return (
            <span key={`char_${index}`} className="relative">
              <Caret />
              <span className="text-gray-500/50">{char}</span>
            </span>
          );
        } else {
          // Untyped character
          return (
            <span key={`char_${index}`} className="text-gray-500/50">
              {char}
            </span>
          );
        }
      })}
    </div>
  );
};

const Caret = () => {
  return (
    <motion.span
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 0] }}
      transition={{
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
      className="absolute left-0 top-0 w-[2px] h-[1.15em] bg-green-500 rounded-full"
    />
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
      className={cn({
        "text-red-500": !isCorrect && !isWhiteSpace,
        "text-green-500": isCorrect && !isWhiteSpace,
        "border-b-2 border-red-500": !isCorrect && isWhiteSpace,
      })}
    >
      {expected}
    </span>
  );
};

export default Typing;