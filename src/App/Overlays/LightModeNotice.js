import React from 'react';
import styled from '@emotion/styled';

import Button from 'components/Button';
import { updateSettings } from 'lib/settings';
import { restartCore } from 'lib/core';

import FullScreen from './FullScreen';

const ListItem = styled.li({
  listStyle: 'disc',
});

async function enableLightMode() {
  updateSettings({ lightMode: true, lightModeNoticeDisabled: true });
  await restartCore();
}

function ignore() {
  updateSettings({ lightModeNoticeDisabled: true });
}

const LightModeNotice = () => (
  <FullScreen header={__('Light mode')} width={600} style={{ fontSize: 18 }}>
    <div className="mt1">
      {__('Light mode is now available for Nexus Core!')}
    </div>

    <div className="mt2">
      <div>
        <strong>{__('Why you should enable light mode')}</strong>
      </div>
      <ul>
        <ListItem className="mt0_4">
          {__(
            'Nexus Core would take less resources (memory and storage) to run'
          )}
        </ListItem>
        <ListItem className="mt0_4">
          {__('Synchronization would be much faster')}
        </ListItem>
      </ul>
    </div>

    <div className="mt2">
      <div>
        <strong>{__('Why you should NOT enable light mode')}</strong>
      </div>
      <ul>
        <ListItem className="mt0_4">
          {__('You would NOT be able to mine or stake')}
        </ListItem>
        <ListItem className="mt0_4">
          {__('Legacy Mode would be disabled')}
        </ListItem>
      </ul>
    </div>

    <div className="mt3 flex center" style={{ justifyContent: 'flex-end' }}>
      <Button skin="default" onClick={ignore} className="space-right">
        {__('Ignore')}
      </Button>
      <Button skin="primary" onClick={enableLightMode} className="space-left">
        {__('Enable light mode')}
      </Button>
    </div>
  </FullScreen>
);

export default LightModeNotice;
