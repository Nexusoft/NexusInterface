// External Dependencies
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

// Internal Global Dependencies
import GA from 'lib/googleAnalytics';
import Icon from 'components/Icon';
import Panel from 'components/Panel';
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import RequireCoreConnected from 'components/RequireCoreConnected';
import { openModal } from 'lib/ui';
import { isCoreConnected } from 'selectors';

// Internal Local Dependencies
import MoveBetweenAccountsModal from './MoveBetweenAccountsModal';
import SendForm from './SendForm';

// Resources
import sendIcon from 'icons/send.svg';
import swapIcon from 'icons/swap.svg';

__ = __context('Send');

const moveBetweenAccounts = () => {
  openModal(MoveBetweenAccountsModal);
};

export default function Send() {
  useEffect(() => {
    GA.SendScreen('Send');
  }, []);
  const coreConnected = useSelector(isCoreConnected);

  return (
    <Panel
      icon={sendIcon}
      title={__('Send NXS')}
      controls={
        coreConnected && (
          <Tooltip.Trigger tooltip={__('Move NXS between accounts')}>
            <Button
              square
              skin="primary"
              className="relative"
              onClick={moveBetweenAccounts}
            >
              <Icon icon={swapIcon} />
            </Button>
          </Tooltip.Trigger>
        )
      }
    >
      <RequireCoreConnected>
        <SendForm />
      </RequireCoreConnected>
    </Panel>
  );
}
