// External Dependencies
import { useEffect } from 'react';

// Internal Global Dependencies
import GA from 'lib/googleAnalytics';
import Panel from 'components/Panel';
import RequireLoggedIn from 'components/RequireLoggedIn';
import { loadAccounts, loadOwnedTokens } from 'lib/user';

// Internal Local Dependencies
import SendForm from './SendForm';

// Resources
import sendIcon from 'icons/send.svg';

__ = __context('Send');

export default function Send() {
  useEffect(() => {
    loadAccounts();
    loadOwnedTokens();
    GA.SendScreen('Send');
  }, []);
  return (
    <Panel icon={sendIcon} title={__('Send')}>
      <RequireLoggedIn>
        <SendForm />
      </RequireLoggedIn>
    </Panel>
  );
}
