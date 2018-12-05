import { createStore, applyMiddleware, compose } from 'redux'
import { createHashHistory } from 'history'
import thunk from 'redux-thunk'
import { routerMiddleware, routerActions } from 'connected-react-router'
import { createLogger } from 'redux-logger'
import createRootReducer from 'reducers'

import { FormattedMessage, addLocaleData } from 'react-intl'
import { Provider } from 'react-intl-redux'
import itLocaleData from 'react-intl/locale-data/it'
import enLocaleData from 'react-intl/locale-data/en'
import { updateIntl } from 'react-intl-redux'
import zhLocaleData from 'react-intl/locale-data/zh'
const UPDATE_LOCALES = 'UPDATE_LOCALES'
// import * as counterActions from "actions/counter";
// import type { counterStateType } from "reducers/counter";
addLocaleData([...itLocaleData, ...zhLocaleData])

const history = createHashHistory()

const configureStore = () => {
  // Redux Configuration
  const middleware = []
  const enhancers = []

  middleware.push(thunk)
  // Logging Middleware
  // const logger = createLogger({
  //   level: "info",
  //   collapsed: true
  // });
  // middleware.push(logger);

  // Router Middleware
  const router = routerMiddleware(history)
  middleware.push(router)

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
    : compose
  /* eslint-enable no-underscore-dangle */

  // Apply Middleware & Compose Enhancers
  enhancers.push(applyMiddleware(...middleware))
  const enhancer = composeEnhancers(...enhancers)

  // Create Store
  const store = createStore(createRootReducer(history), enhancer)

  if (module.hot) {
    module.hot.accept(
      'reducers',
      () => store.replaceReducer(require('reducers').default) // eslint-disable-line global-require
    )
  }

  return store
}

export default { configureStore, history }
