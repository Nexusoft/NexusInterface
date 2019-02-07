import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import App from './App';
import { configureStore, history } from './store/configureStore';
import setupApp from './setupApp';
import './CSS/app.global.css';

const store = configureStore();


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
