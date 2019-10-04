import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

import createRootReducer from './reducers';

const configureStore = initialState => {
  // Redux Configuration
  const middleware = [];
  const enhancers = [];

  middleware.push(thunk);

  // Redux DevTools Configuration
  // const actionCreators = {
  //   ...counterActions,
  //   ...routerActions
  // };
  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Options: http://zalmoxisus.github.io/redux-devtools-extension/API/Arguments.html
        // actionCreators
      })
    : compose;
  /* eslint-enable no-underscore-dangle */

  // Apply Middleware & Compose Enhancers
  enhancers.push(applyMiddleware(...middleware));
  const enhancer = composeEnhancers(...enhancers);

  const rootReducer = createRootReducer();

  // Create Store
  const store = createStore(rootReducer, initialState, enhancer);

  return store;
};

export default { configureStore };
