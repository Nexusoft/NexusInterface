import { createStore } from 'redux';

import createRootReducer from './reducers';

export default function configureStore(initialState) {
  // Redux Configuration

  /* eslint-disable no-underscore-dangle */
  const enhancer =
    window.__REDUX_DEVTOOLS_EXTENSION__ &&
    window.__REDUX_DEVTOOLS_EXTENSION__();
  /* eslint-enable no-underscore-dangle */

  const rootReducer = createRootReducer();

  // Create Store
  const store = createStore(rootReducer, initialState, enhancer);

  return store;
}
