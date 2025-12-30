const React = require("react")
const { useState, useRef, useEffect } = React

const keyboardCodeAllowed = (code) => {
    return (
        code.startsWith("Key") ||
        code.startsWith("Digit") ||
        code === "Backspace" ||
        code === "Space" ||
        code === "Minus"
    );
}

const useTyping = (enabled, words = "") => {
    const [cursor, setCursor] = useState(0)
    const [typed, setTyped] = useState("")
    const totalTyped = useRef(0)
    const totalKeystrokes = useRef(0) 
    const totalErrors = useRef(0) 

    const clearTyped = React.useCallback(() => {
        setTyped("");
        setCursor(0);
    }, [])

    const resetTotalTyped = React.useCallback(() => {
        totalTyped.current = 0;
        totalKeystrokes.current = 0;
        totalErrors.current = 0;
    }, [])


    useEffect(() => {
        const keydownHandler = (event) => {
            const { key, code } = event;

            if (!enabled || !keyboardCodeAllowed(code)) {
                return;
            }

            switch (key) {
                case "Backspace":
                    setTyped((prev) => prev.slice(0, -1));
                    setCursor((prev) => Math.max(0, prev - 1));
                    totalTyped.current = Math.max(0, totalTyped.current - 1);
                    break;
                case " ":
                    setTyped((prev) => {
                        const newTyped = prev.concat(" ");
                       
                        const expectedChar = words[prev.length];
                        totalKeystrokes.current += 1;
                        if (expectedChar !== " ") {
                            totalErrors.current += 1;
                        }
                        return newTyped;
                    });
                    setCursor((prev) => prev + 1);
                    totalTyped.current += 1;
                    break;
                default:
                 
                    if (key.length === 1 && /^[a-zA-Z0-9-]$/.test(key)) {
                        setTyped((prev) => {
                            const newTyped = prev.concat(key);
                        
                            const expectedChar = words[prev.length];
                            totalKeystrokes.current += 1;
                            if (expectedChar !== key) {
                                totalErrors.current += 1;
                            }
                            return newTyped;
                        });
                        setCursor((prev) => prev + 1);
                        totalTyped.current += 1;
                    }
            }
        };

        window.addEventListener("keydown", keydownHandler);
        return () => {
            window.removeEventListener("keydown", keydownHandler)
        }
    }, [enabled, words])

    return {
        typed,
        cursor,
        clearTyped,
        resetTotalTyped,
        totalTyped: totalTyped.current,
        totalKeystrokes: totalKeystrokes.current,
        totalErrors: totalErrors.current
    }
}

export default useTyping