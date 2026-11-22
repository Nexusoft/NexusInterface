import { useEffect } from 'react';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import Panel from 'components/Panel';
import RequireLoggedIn from 'components/RequireLoggedIn';
import GridTracers, { modernGridBackground } from 'components/GridTracers';
import walletIcon from 'icons/wallet.svg';
import { moduleLayout } from 'utils/moduleStyles';
import UT from 'lib/usageTracking';
import Accounts from '../UserPage/Accounts';

__ = __context('Wallets');

const Surface = styled.section(({ theme }) => ({
  width: '100%', height: '100%', minWidth: 0, minHeight: 0,
  position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'auto',
  ...modernGridBackground(theme),
  color: theme.foreground,
}));

const Content = styled.div({
  position: 'relative', zIndex: 1, flex: '1 0 auto', minWidth: 0,
  display: 'flex', flexDirection: 'column', padding: moduleLayout.pagePadding,
});

export default function Wallets() {
  const { modern } = useTheme();

  useEffect(() => {
    UT.SendScreen('Wallets');
  }, []);

  return modern ? (
    <Surface>
      <GridTracers />
      <Content><RequireLoggedIn><Accounts /></RequireLoggedIn></Content>
    </Surface>
  ) : (
    <Panel icon={walletIcon} title={__('Wallets')}>
      <RequireLoggedIn><Accounts /></RequireLoggedIn>
    </Panel>
  );
}
