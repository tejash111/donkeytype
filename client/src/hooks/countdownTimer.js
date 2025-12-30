import React, { useEffect, useRef, useState } from 'react'

const useCountdownTimer = (seconds) => {
    const [timeLeft, setTimeLeft] = useState(seconds)
    const intervalRef = useRef(null)

  
    useEffect(() => {
        setTimeLeft(seconds);
    }, [seconds]);

    const startCountdown = () => {
        console.log("starting countdown..");
   
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        intervalRef.current = setInterval(() => {
            setTimeLeft((timeLeft) => timeLeft - 1);
        }, 1000);

    }

    const resetCountdown = () => {
        console.log("resetting countdown..");
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        setTimeLeft(seconds);
    }

    //wehren the countdonw reaches 0
    useEffect(() => {
        if (!timeLeft && intervalRef.current) {
            console.log("clearing timer");

            clearInterval(intervalRef.current)

        }
    }, [timeLeft, intervalRef])
    return { timeLeft, startCountdown, resetCountdown }
}

export default useCountdownTimer