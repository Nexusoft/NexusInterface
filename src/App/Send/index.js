import { moduleLayout } from 'utils/moduleStyles';
import { useEffect } from 'react';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import GridTracers, { modernGridBackground } from 'components/GridTracers';

import UT from 'lib/usageTracking';
import Panel from 'components/Panel';
import RequireLoggedIn from 'components/RequireLoggedIn';
import sendIcon from 'icons/send.svg';

import SendForm from './SendForm';

__ = __context('Send');

const SendPage = styled.section(({ theme }) => ({
  position: 'relative', width: '100%', height: '100%', minWidth: 0, minHeight: 0,
  display: 'flex', flexDirection: 'column', overflow: 'hidden', color: theme.foreground,
  ...modernGridBackground(theme),
}));

const Body = styled.div({
  position: 'relative', zIndex: 1, flex: 1, minHeight: 0,
  display: 'flex', flexDirection: 'column',
  overflow: 'auto', padding: moduleLayout.pagePadding,
});

export default function Send() {
  const { modern } = useTheme();
  useEffect(() => {
    UT.SendScreen('Send');
  }, []);
  if (modern) return (
    <SendPage>
      <GridTracers />
      <Body data-send-viewport><RequireLoggedIn><SendForm /></RequireLoggedIn></Body>
    </SendPage>
  );
  return (
    <Panel icon={sendIcon} title={__('Send')}>
      <RequireLoggedIn>
        <SendForm />
      </RequireLoggedIn>
    </Panel>
  );
}
