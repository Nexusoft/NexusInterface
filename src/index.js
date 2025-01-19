import { createRoot } from 'react-dom/client';

import { Providers, store } from 'lib/store';
import { startCore } from 'lib/core';
import { prepareWallet } from 'lib/wallet';
import { prepareMenu } from 'lib/appMenu';
import { prepareBootstrap } from 'lib/bootstrap';
import { prepareTransactions } from 'lib/transactions';
import { settingsAtom } from 'lib/settings';
import { prepareModules, prepareWebView } from 'lib/modules';
import { prepareUpdater } from 'lib/updater';
import { prepareSessionInfo } from 'lib/session';
import UT from 'lib/usageTracking';
import App from './App';

async function run() {
  try {
    const { manualDaemon } = store.get(settingsAtom);
    if (!manualDaemon) {
      await startCore();
    }
  } finally {
    prepareWallet();
    prepareModules();

    const domNode = document.getElementById('root');
    const root = createRoot(domNode);
    root.render(
      <Providers>
        <App />
      </Providers>
    );

    prepareMenu();
    prepareBootstrap();
    prepareTransactions();
    prepareUpdater();
    prepareWebView();
    prepareSessionInfo();
    const { sendUsageData } = store.get(settingsAtom);
    if (sendUsageData) {
      UT.StartAnalytics();
    }
  }
}

run();
