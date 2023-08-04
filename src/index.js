import { render } from 'react-dom';
import { Provider } from 'react-redux';

import store from 'store';
import { startCore } from 'lib/core';
import { prepareWallet } from 'lib/wallet';
import { prepareMenu } from 'lib/appMenu';
import { prepareBootstrap } from 'lib/bootstrap';
import { prepareCoreInfo } from 'lib/coreInfo';
import { prepareCoreOutput } from 'lib/coreOutput';
import { prepareMarket } from 'lib/market';
import { prepareTransactions } from 'lib/tritiumTransactions';
import { prepareModules, prepareWebView } from 'lib/modules';
import { prepareUpdater } from 'lib/updater';
import initialSettings from 'data/initialSettings';
import App from './App';

async function run() {
  try {
    if (!initialSettings.manualDaemon) {
      await startCore();
    }
  } finally {
    prepareWallet();
    prepareCoreInfo();
    prepareMarket();
    prepareModules();

    render(
      <Provider store={store}>
        <App />
      </Provider>,
      document.getElementById('root')
    );

    prepareMenu();
    prepareBootstrap();
    prepareTransactions();
    prepareUpdater();
    prepareWebView();
    prepareCoreOutput();
  }
}

run();
