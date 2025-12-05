import { useEffect, useState } from 'react';

export function useTimer(initialSeconds: number, onTimeUp?: () => void) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0 && onTimeUp) {
      onTimeUp();
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, seconds, onTimeUp]);

  return { seconds, isActive, setIsActive };
}
