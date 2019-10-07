import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import store from 'store';
import { walletEvents } from 'lib/wallet';
import App from './App';

walletEvents.emit('pre-render');

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

walletEvents.emit('post-render');
