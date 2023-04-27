import { useRef, useEffect } from 'react';

// Execute a callback function and return the result before the first render
export default function useFirstRender(callback) {
  const firstTime = useRef(true);

  useEffect(() => {
    firstTime.current = false;
  }, []);

  if (firstTime.current) {
    return callback();
  }
}
