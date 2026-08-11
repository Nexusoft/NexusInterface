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

async function bridgeSelfTest() {
  try {
    const status = await window.nexusElectron.core.getStatus();
    console.info('renderer.bridge.selftest.core_get_status.ok', {
      exists: !!status?.exists,
      running: !!status?.running,
    });
  } catch (error) {
    console.error('renderer.bridge.selftest.core_get_status.failed', {
      message: error?.message || String(error),
      code: error?.code,
    });
  }
}

async function run() {
  console.info('renderer.bootstrap.start');
  await bridgeSelfTest();
  try {
    const { manualDaemon } = store.get(settingsAtom);
    if (!manualDaemon) {
      console.info('renderer.bootstrap.startCore.begin');
      try {
        await startCore();
      } catch (error) {
        // startCore already records coreConnectionErrorAtom; keep rendering so
        // the UI can show the concrete failure instead of a blank window.
        console.error('renderer.bootstrap.startCore.error', error);
      }
    }
  } finally {
    console.info('renderer.bootstrap.render.begin');
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
