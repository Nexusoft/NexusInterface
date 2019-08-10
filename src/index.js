import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import store, { history } from 'store';
import App from './App';
import { preRender, postRender } from './setupApp';

preRender();

render(
  <Provider store={store}>
    <App history={history} />
  </Provider>,
  document.getElementById('root')
);

postRender();
