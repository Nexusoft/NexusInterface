import { useState } from 'react';
import { newUID } from 'utils/misc';

export default function useUID() {
  // Passing a function into `useState` as `initialState`
  // It will only be executed in the first render
  const [ref] = useState(newUID);
  return ref;
}
