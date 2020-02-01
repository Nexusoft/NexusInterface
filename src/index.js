import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import 'appMenu';
import store from 'store';
import { walletEvents } from 'lib/wallet';
import { startCore } from 'lib/core';
import App from './App';

startCore();
walletEvents.emit('pre-render');

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

walletEvents.emit('post-render');
