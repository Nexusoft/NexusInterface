import 'react-hot-loader';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
// import { AppContainer } from 'react-hot-loader';

import store, { history } from 'store';
import App from './App';
import setupApp from './setupApp';
import './CSS/app.global.css';

setupApp(store, history);

/**
 * Main App Entry Point
 *
 * @param {*} Component
 */
function renderApp(Component) {
  render(
    // <AppContainer>
    <Provider store={store}>
      <Component store={store} history={history} />
    </Provider>,
    // </AppContainer>,
    document.getElementById('root')
  );
}

renderApp(App);

// if (module.hot) {
//   module.hot.accept('./App', () => {
//     renderApp(App);
//   });
// }
