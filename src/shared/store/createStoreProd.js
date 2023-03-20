import { configureStore } from '@reduxjs/toolkit';

import createRootReducer from './reducers';

export default function createStore(initialState) {
  const rootReducer = createRootReducer();
  return configureStore({ reducer: rootReducer, preloadedState: initialState });
}
