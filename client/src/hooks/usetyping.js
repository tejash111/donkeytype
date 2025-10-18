const { useState, useRef, useEffect } = require("react")

const keyboardCodeAllowed = (code) =>{
    return (
        code.startsWith("Key") ||
        code.startsWith("Digit") ||
        code === "Backspace" ||
        code === "Space"
    );
}

const useTyping = (enabled) => {
    const [cursor,setCursor]=useState(0)
    const [typed,setTyped]=useState("")
    const totalTyped = useRef(0)

    const clearTyped = () => {
        setTyped("");
        setCursor(0);
    }

    const resetTotalTyped = () => {
        totalTyped.current=0;
    }

    
    useEffect(()=>{
        const keydownHandler = (event) => {
            const { key, code } = event;
            
            if (!enabled || !keyboardCodeAllowed(code)){
                return;
            }

            switch(key){
                case "Backspace":
                    setTyped((prev)=> prev.slice(0,-1));
                    setCursor((prev) => Math.max(0, prev - 1));
                    totalTyped.current = Math.max(0, totalTyped.current - 1);
                    break;
                case " ":
                    setTyped((prev)=> prev.concat(" "));
                    setCursor((prev) => prev + 1);
                    totalTyped.current += 1;
                    break;
                default:
                    if (key.length === 1) { // Only single characters
                        setTyped((prev)=> prev.concat(key));
                        setCursor((prev) => prev + 1);
                        totalTyped.current += 1;
                    }
            }
        };

        window.addEventListener("keydown", keydownHandler);
        return ()=>{
            window.removeEventListener("keydown", keydownHandler)
        }
    }, [enabled])

    return{
        typed,
        cursor,
        clearTyped,
        resetTotalTyped,
        totalTyped : totalTyped.current
    }
}

export default useTyping