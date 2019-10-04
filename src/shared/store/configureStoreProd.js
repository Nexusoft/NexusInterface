import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import createRootReducer from './reducers';

const rootReducer = createRootReducer();
const enhancer = applyMiddleware(thunk);

function configureStore(initialState) {
  return createStore(rootReducer, initialState, enhancer);
}

export default { configureStore };
