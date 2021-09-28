import styled from '@emotion/styled';

import Button from 'components/Button';
import { updateSettings } from 'lib/settings';
import { restartCore } from 'lib/core';

import FullScreen from './FullScreen';

__ = __context('LiteModeNotice');

const ListItem = styled.li({
  listStyle: 'disc',
});

async function enableLiteMode() {
  updateSettings({ liteMode: true, liteModeNoticeDisabled: true });
  await restartCore();
}

function ignore() {
  updateSettings({ liteModeNoticeDisabled: true });
}

export default function LiteModeNotice() {
  return (
    <FullScreen header={__('Lite mode')} width={600} style={{ fontSize: 18 }}>
      <div className="mt1">
        {__(
          'Lite mode is now available on Nexus Wallet! You can choose to enable lite mode now or just ignore it. You can change your decision anytime under Settings/Core.'
        )}
      </div>

      <div className="mt2">
        <div>
          <strong>{__('Why you might want to enable lite mode')}</strong>
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
          <strong>{__('Why you might NOT want to enable lite mode')}</strong>
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
        <Button skin="default" onClick={ignore} className="mr0_4">
          {__('Ignore')}
        </Button>
        <Button skin="primary" onClick={enableLiteMode} className="ml0_4">
          {__('Enable lite mode')}
        </Button>
      </div>
    </FullScreen>
  );
}
