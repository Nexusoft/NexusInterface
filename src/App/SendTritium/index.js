import { useEffect } from 'react';

import GA from 'lib/googleAnalytics';
import Panel from 'components/Panel';
import RequireLoggedIn from 'components/RequireLoggedIn';
import sendIcon from 'icons/send.svg';

import SendForm from './SendForm';

__ = __context('Send');

export default function Send() {
  useEffect(() => {
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
