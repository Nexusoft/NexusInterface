import { createStore, compose } from 'redux';

import enhancer from './enhancer';
import createRootReducer from './reducers';

export default function configureStore(initialState) {
  // Redux Configuration

  /* eslint-disable no-underscore-dangle */
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  /* eslint-enable no-underscore-dangle */

  const rootReducer = createRootReducer();

  // Create Store
  const store = createStore(
    rootReducer,
    initialState,
    composeEnhancers(enhancer)
  );

  return store;
}
