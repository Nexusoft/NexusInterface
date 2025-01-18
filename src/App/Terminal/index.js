// External Dependencies
import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useAtomValue } from 'jotai';

// Internal Global Dependencies
import Panel from 'components/Panel';
import RouterHorizontalTab from 'components/RouterHorizontalTab';
import UT from 'lib/usageTracking';

// Internal Local Dependencies
import { lastActiveTabAtom } from './atoms';
import NexusApiConsole from './NexusApiConsole';
import TerminalCore from './TerminalCore';

// Images
import consoleIcon from 'icons/console.svg';
import logoIcon from 'icons/logo.svg';
import coreIcon from 'icons/core.svg';

__ = __context('Console');

const TerminalComponent = styled.div({
  height: '100%',
  display: 'grid',
  gridTemplateAreas: '"tab-bar" "content"',
  gridTemplateRows: 'min-content 1fr',
});

const TerminalTabBar = styled(RouterHorizontalTab.TabBar)({
  gridArea: 'tab-bar',
});

function ConsoleRedirect() {
  const lastActiveTab = useAtomValue(lastActiveTabAtom);
  return <Navigate to={lastActiveTab} replace />;
}

export default function Terminal() {
  useEffect(() => {
    UT.SendScreen('Terminal');
  }, []);
  return (
    <Panel icon={consoleIcon} title={__('Console')} bodyScrollable={false}>
      <TerminalComponent>
        <TerminalTabBar>
          <RouterHorizontalTab
            link="Console"
            icon={logoIcon}
            text={'Nexus API'}
          />
          <RouterHorizontalTab
            link="Core"
            icon={coreIcon}
            text={__('Core output')}
          />
        </TerminalTabBar>

        <Routes>
          <Route path="Console" element={<NexusApiConsole />} />
          <Route path="Core" element={<TerminalCore />} />
          <Route path="*" element={<ConsoleRedirect />} />
        </Routes>
      </TerminalComponent>
    </Panel>
  );
}
