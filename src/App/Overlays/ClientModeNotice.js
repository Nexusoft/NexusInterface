import React from 'react';

import Button from 'components/Button';
import { updateSettings } from 'lib/settings';
import { restartCore } from 'lib/core';

import FullScreen from './FullScreen';

async function enableClientMode() {
  updateSettings({ clientMode: true, clientModeNoticeDisabled: true });
  await restartCore();
}

function ignore() {
  updateSettings({ clientModeNoticeDisabled: true });
}

const ClientModeNotice = () => (
  <FullScreen header={__('Client Mode')} width={600} style={{ fontSize: 18 }}>
    <div className="mt1">
      {__('Client mode is now available on Nexus Wallet!')}
    </div>

    <div className="mt2">
      <div>
        <strong>{__('Why you should enable client mode')}</strong>
      </div>
      <div className="mt0_4">
        {__('Nexus Core would take less resources (memory and storage) to run')}
      </div>
      <div className="mt0_4">{__('Synchronization would be much faster')}</div>
    </div>

    <div className="mt2">
      <div>
        <strong>{__('Why you should NOT enable client mode')}</strong>
      </div>
      <div className="mt0_4">
        {__('You would NOT be able to mine or stake')}
      </div>
      <div className="mt0_4">{__('Legacy Mode would be disabled')}</div>
    </div>

    <div className="mt3 flex center" style={{ justifyContent: 'flex-end' }}>
      <Button skin="default" onClick={ignore} className="space-right">
        {__('Ignore')}
      </Button>
      <Button skin="primary" onClick={enableClientMode} className="space-left">
        {__('Enable client mode')}
      </Button>
    </div>
  </FullScreen>
);

export default ClientModeNotice;
