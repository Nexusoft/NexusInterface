import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import store, { history } from 'store';
import App from './App';
import setupApp from './setupApp';
import './CSS/app.global.css';

setupApp(store, history);

/**
 *
 *
 * @param {*} Component
 */
function renderApp(Component) {
  render(
    <AppContainer>
      <Component store={store} history={history} />
    </AppContainer>,
    document.getElementById('root')
  );
}

renderApp(App);

if (module.hot) {
  module.hot.accept('./App', () => {
    renderApp(App);
  });
}
