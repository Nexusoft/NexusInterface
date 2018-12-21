import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import Root from './components/Root';
import { configureStore, history } from './store/configureStore';
import './CSS/app.global.css';

const store = configureStore();

function renderApp(Component) {
  render(
    <AppContainer>
      <Component store={store} history={history} />
    </AppContainer>,
    document.getElementById('root')
  );
}

renderApp(Root);

if (module.hot) {
  module.hot.accept('./components/Root', () => {
    renderApp(Root);
  });
}
