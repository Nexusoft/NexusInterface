import { useEffect } from 'react';

import UT from 'lib/usageTracking';
import Panel from 'components/Panel';
import RequireLoggedIn from 'components/RequireLoggedIn';
import sendIcon from 'icons/send.svg';

import SendForm from './SendForm';

__ = __context('Send');

export default function Send() {
  useEffect(() => {
    UT.SendScreen('Send');
  }, []);
  return (
    <Panel icon={sendIcon} title={__('Send')}>
      <RequireLoggedIn>
        <SendForm />
      </RequireLoggedIn>
    </Panel>
  );
}
