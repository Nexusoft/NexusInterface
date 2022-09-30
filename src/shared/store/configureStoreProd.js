import { createStore } from 'redux';

import enhancer from './enhancer';
import createRootReducer from './reducers';

const rootReducer = createRootReducer();

export default function configureStore(initialState) {
  return createStore(rootReducer, initialState, enhancer);
}
