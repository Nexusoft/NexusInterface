import { createStore } from 'redux';

import createRootReducer from './reducers';

const rootReducer = createRootReducer();

export default function configureStore(initialState) {
  return createStore(rootReducer, initialState);
}
