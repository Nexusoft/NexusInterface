import styled from '@emotion/styled';

import Button from 'components/Button';
import Modal from 'components/Modal';
import { updateSettings } from 'lib/settings';
import { restartCore } from 'lib/core';

import potImg from './potcoin.png';

__ = __context('LiteModeNotice');

async function enableLiteMode() {
  updateSettings({ liteMode: true, liteModeNoticeDisabled: true });
  await restartCore();
}

function ignore() {
  updateSettings({ liteModeNoticeDisabled: true });
}

const PotThemeModal = () => (
  <Modal maxWidth={600}>
    <Modal.Header>{__('Introducing POT theme')}</Modal.Header>
    <Modal.Body>
      <div className="text-center">
        <img src={potImg} width={100} height={100} />
      </div>

      <div className="mt1">
        {__(
          "To celebrate PotCoin's migration to Nexus ecosystem, we would like to introduce a new integrated theme named POT, in addition to the current default Dark theme and Light theme."
        )}
      </div>

      <div className="mt1">
        {__(
          'You can always change your theme setting later under Settings/Style tab.'
        )}
      </div>

      <div className="mt3 flex space-between">
        <Button skin="primary">{__('Try out POT theme')}</Button>
        <Button skin="default" onClick={enableLiteMode}>
          {__('Done')}
        </Button>
      </div>
    </Modal.Body>
  </Modal>
);

export default PotThemeModal;
