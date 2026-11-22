import { moduleLayout, moduleTabs, moduleTab, moduleAction } from 'utils/moduleStyles';
// External Dependencies
import { useEffect } from 'react';
import { Routes, Route, Navigate, useMatch } from 'react-router-dom';
import styled from '@emotion/styled';
import { useSelector } from 'react-redux';
import { keyframes, useTheme } from '@emotion/react';
import GridTracers, { modernGridBackground } from 'components/GridTracers';
import { fade } from 'utils/color';
import { isCoreConnected } from 'selectors';

// Internal Global Dependencies
import Panel from 'components/Panel';
import Button from 'components/Button';
import { resetConsole, pauseCoreOutput, unpauseCoreOutput } from 'lib/ui';
import RouterHorizontalTab from 'components/RouterHorizontalTab';
import UT from 'lib/usageTracking';

// Internal Local Dependencies
import NexusApiConsole from './NexusApiConsole';
import TerminalCore from './TerminalCore';

// Images
import consoleIcon from 'icons/console.svg';
import logoIcon from 'icons/logo.svg';
import coreIcon from 'icons/core.svg';

__ = __context('Console');

const TerminalComponent = styled.div(({ theme }) => ({
  height: '100%',
  display: 'grid',
  gridTemplateAreas: '"tab-bar" "content"',
  gridTemplateRows: 'min-content 1fr',
  ...(theme.modern && {
    position: 'relative', zIndex: 1, flex: 1, minHeight: 0, minWidth: 0,
    height: 'auto', gridTemplateRows: 'auto minmax(0, 1fr)', gap: moduleLayout.gap,
    padding: moduleLayout.pagePadding,
  }),
}));

const TerminalTabBar = styled(RouterHorizontalTab.TabBar)(({ theme }) => ({
  gridArea: 'tab-bar',
  ...(theme.modern && {
    ...moduleTabs(theme),
    'a': moduleTab(theme),
  }),
}));

const ConsolePage = styled.section(({ theme }) => ({
  position: 'relative', width: '100%', height: '100%', minWidth: 0, minHeight: 0,
  display: 'flex', flexDirection: 'column', overflow: 'hidden', color: theme.foreground,
  ...modernGridBackground(theme),
}));

const statusPulse = keyframes`
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(2.4); opacity: 0; }
`;

const StatusDot = styled.span(({ status }) => ({
  position: 'relative',
  width: 8,
  height: 8,
  flexShrink: 0,
  borderRadius: '50%',
  color: status === 'connected' ? '#36d984' : status === 'connecting' ? '#f5c542' : '#f26363',
  background: 'currentColor',
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    background: 'currentColor',
    animation: `${statusPulse} 1.6s ease-out infinite`,
  },
  '@media (prefers-reduced-motion: reduce)': {
    '&::after': { animation: 'none', opacity: 0 },
  },
}));

const ConnectionStatus = styled.div(({ theme }) => ({
  display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 14px',
  borderRadius: 24, fontSize: 11, border: `1px solid ${fade(theme.primary, 0.7)}`,
  background: fade(theme.background, 0.35), justifySelf: 'start',
}));

const ConsoleFooter = styled.div(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  flexShrink: 0,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
  alignItems: 'center',
  gap: 16,
  padding: '0 clamp(16px, 2vw, 28px) 12px',
  '> button': {
    gridColumn: 3, justifySelf: 'end',
    ...moduleAction,
    border: `1px solid ${fade(theme.primary, 0.75)}`,
  },
  '@media (max-width: 600px)': {
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    '> button': { gridColumn: 2, gridRow: 1 },
    '> .core-version': { gridColumn: '1 / -1', gridRow: 2 },
  },
}));

const CoreVersion = styled.div({
  color: 'gray',
  opacity: 0.5,
  fontSize: 10,
  lineHeight: 1.6,
  gridColumn: 2,
  textAlign: 'center',
});

function ConsoleFrame({ children }) {
  const { modern } = useTheme();
  const connected = useSelector(isCoreConnected);
  const apiConsoleActive = useMatch('/Terminal/Console');
  const coreOutputActive = useMatch('/Terminal/Core');
  const paused = useSelector((state) => state.ui.console.core.paused);
  const coreVersion = useSelector((state) => state.core.systemInfo?.version);
  const manualDaemon = useSelector((state) => state.settings.manualDaemon);
  const autoConnect = useSelector((state) => state.core.autoConnect);
  const status = connected ? 'connected' : !manualDaemon && autoConnect ? 'connecting' : 'disconnected';
  if (!modern) return <Panel icon={consoleIcon} title={__('Console')} bodyScrollable={false}>{children}</Panel>;
  return (
    <ConsolePage>
      <GridTracers />
      {children}
      <ConsoleFooter>
        <ConnectionStatus role="status">
          <StatusDot status={status} aria-hidden="true" />
          {status === 'connected' ? __('Core connected') : status === 'connecting' ? __('Connecting to Core') : __('Core disconnected')}
        </ConnectionStatus>
        <CoreVersion className="core-version">{__('Core version')}: {coreVersion || __('Unavailable')}</CoreVersion>
        {apiConsoleActive && connected && (
          <Button skin="filled-inverted" onClick={resetConsole}>
            {__('Clear Output')}
          </Button>
        )}
        {coreOutputActive && !manualDaemon && (
          <Button skin="filled-inverted" onClick={paused ? unpauseCoreOutput : pauseCoreOutput}>
            {paused ? 'Resume' : 'Pause'}
          </Button>
        )}
      </ConsoleFooter>
    </ConsolePage>
  );
}

function ConsoleRedirect() {
  const lastActiveTab = useSelector((state) => state.ui.console.lastActiveTab);
  return <Navigate to={lastActiveTab} replace />;
}

export default function Terminal() {
  useEffect(() => {
    UT.SendScreen('Terminal');
  }, []);
  return (
    <ConsoleFrame>
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
    </ConsoleFrame>
  );
}
