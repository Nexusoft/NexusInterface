// External Dependencies
import { useRouteMatch, Routes, Route, Navigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useSelector } from 'react-redux';

// Internal Global Dependencies
import Panel from 'components/Panel';
import Tab from 'components/Tab';
import { legacyMode } from 'consts/misc';

// Internal Local Dependencies
import TerminalConsole from './TerminalConsole';
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

const TerminalTabBar = styled(Tab.Bar)({
  gridArea: 'tab-bar',
});

function ConsoleRedirect({ match }) {
  const lastActiveTab = useSelector((state) => state.ui.console.lastActiveTab);
  return <Navigate to={`${match.path}/${lastActiveTab}`} replace />;
}

export default function Terminal() {
  const match = useRouteMatch();
  return (
    <Panel icon={consoleIcon} title={__('Console')} bodyScrollable={false}>
      <TerminalComponent>
        <TerminalTabBar>
          <Tab
            link={`${match.url}/Console`}
            icon={logoIcon}
            text={legacyMode ? __('Console') : 'Nexus API'}
          />
          <Tab
            link={`${match.url}/Core`}
            icon={coreIcon}
            text={__('Core output')}
          />
        </TerminalTabBar>

        <Routes>
          <Route
            path="Console"
            element={legacyMode ? <TerminalConsole /> : <NexusApiConsole />}
          />
          <Route path="Core" element={<TerminalCore />} />
          <Route element={<ConsoleRedirect match={match} />} />
        </Routes>
      </TerminalComponent>
    </Panel>
  );
}
