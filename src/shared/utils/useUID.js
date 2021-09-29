import { useRef, useMemo } from 'react';
import { newUID } from 'utils/misc';

export default function useUID() {
  const ref = useRef();
  // Use useMemo to generate newUID before the first render, useEffect only run after the first render
  // But we can't rely solely on useMemo because it doesn't ensure memoization https://reactjs.org/docs/hooks-reference.html#usememo
  // So we still have to use a ref to keep the UID value consistent
  const uid = useMemo(() => ref.current || newUID(), []);
  return uid;
}
