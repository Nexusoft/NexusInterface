import { configureStore } from '@reduxjs/toolkit';

import createRootReducer from './reducers';

export default function createStore(initialState) {
  const rootReducer = createRootReducer();

  const store = configureStore({
    reducer: rootReducer,
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });

  return store;
}
