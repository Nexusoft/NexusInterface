import { moduleLayout } from 'utils/moduleStyles';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';

import Panel from 'components/Panel';
import RequireLoggedIn from 'components/RequireLoggedIn';
import GridTracers, { modernGridBackground } from 'components/GridTracers';
import stakingIcon from 'icons/staking.svg';
import StakingControls from './StakingControls';

__ = __context('User');

const Surface = styled.section(({ theme }) => ({
  width: '100%',
  height: '100%',
  minWidth: 0,
  minHeight: 0,
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  ...modernGridBackground(theme),
  color: theme.foreground,
}));

const Content = styled.div({
  position: 'relative',
  zIndex: 1,
  flex: 1,
  minHeight: 0,
  overflow: 'auto',
  padding: moduleLayout.pagePadding,
});

export default function Staking() {
  const { modern } = useTheme();
  const controls = <RequireLoggedIn><StakingControls /></RequireLoggedIn>;

  return modern ? (
    <Surface>
      <GridTracers />
      <Content>
        {controls}
      </Content>
    </Surface>
  ) : (
    <Panel icon={stakingIcon} title={__('Staking')}>
      {controls}
    </Panel>
  );
}
