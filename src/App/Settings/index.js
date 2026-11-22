import { moduleLayout, modulePanel, moduleTabs, moduleTab } from 'utils/moduleStyles';
// External
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import GridTracers, { modernGridBackground } from 'components/GridTracers';
import { fade } from 'utils/color';
import UT from 'lib/usageTracking';

// Internal Global
import Panel from 'components/Panel';
import RouterHorizontalTab from 'components/RouterHorizontalTab';
import { selectModuleUpdateCount } from 'selectors';

// Internal Local
import SettingsApp from './App';
import SettingsCore from './Core';
import SettingsStyle from './Style';
import SettingsModules from './Modules';

// Images
import settingsIcon from 'icons/settings.svg';
import coreIcon from 'icons/core.svg';
import logoIcon from 'icons/logo.svg';
import leafIcon from 'icons/leaf.svg';
import legoIcon from 'icons/lego-block.svg';

__ = __context('Settings');

const ModernPage = styled.section(({ theme }) => ({
  position: 'relative', width: '100%', height: '100%', minWidth: 0,
  display: 'flex', flexDirection: 'column', overflow: 'hidden',
  color: theme.foreground, ...modernGridBackground(theme),
}));

function SettingsFrame({ children }) {
  const { modern } = useTheme();
  if (!modern) return <Panel bodyScrollable={false} icon={settingsIcon} title={__('Settings')}>{children}</Panel>;
  return (
    <ModernPage>
      <GridTracers />
      {children}
    </ModernPage>
  );
}

const SettingsComponent = styled.div({
  height: '100%',
  display: 'grid',
  gridTemplateAreas: '"tab-bar" "content"',
  gridTemplateRows: 'min-content 1fr',
  position: 'relative',
}, ({ theme }) => theme.modern && ({
  height: 'auto', flex: 1, minHeight: 0, minWidth: 0, zIndex: 1,
  padding: moduleLayout.pagePadding,
  gridTemplateRows: 'auto minmax(0, 1fr)', gap: moduleLayout.gap,
}));

const SettingsTabBar = styled(RouterHorizontalTab.TabBar)({
  gridArea: 'tab-bar',
}, ({ theme }) => theme.modern && ({
  ...moduleTabs(theme),
  '& > a': moduleTab(theme),
}));

const SettingsContent = styled.div({
  gridArea: 'content',
  overflow: 'auto',
  margin: '0 -30px',
  padding: '0 30px',
}, ({ theme }) => theme.modern && ({
  minHeight: 0, minWidth: 0, margin: 0, padding: moduleLayout.panelPadding,
  ...modulePanel(theme),
  '@media (max-width: 700px)': { padding: 14 },
}));

const SettingsContainer = styled.div({
  maxWidth: 750,
  margin: '0 auto',
}, ({ theme }) => theme.modern && ({ maxWidth: 1100, paddingBottom: 12 }));

const Badge = styled.div(({ theme }) => ({
  background: theme.primary,
  color: theme.primaryAccent,
  fontSize: '0.8em',
  height: '1.4em',
  width: '1.4em',
  lineHeight: '1em',
  borderRadius: '50%',
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  verticalAlign: 'middle',
}));

function SettingsRedirect() {
  const lastActiveTab = useSelector((state) => state.ui.settings.lastActiveTab);
  return <Navigate to={lastActiveTab} replace />;
}

/**
 * Settings Page
 *
 * @export
 * @class Settings
 * @extends {Component}
 */
export default function Settings() {
  useEffect(() => {
    UT.SendScreen('Settings');
  }, []);
  const updateCount = useSelector(selectModuleUpdateCount);

  return (
    <SettingsFrame>
      <SettingsComponent>
        <SettingsTabBar>
          <RouterHorizontalTab
            link="App"
            icon={logoIcon}
            text={__('Application')}
          />
          <RouterHorizontalTab link="Core" icon={coreIcon} text={__('Core')} />
          <RouterHorizontalTab
            link="Style"
            icon={leafIcon}
            text={__('Style')}
          />
          <RouterHorizontalTab
            link="Modules"
            icon={legoIcon}
            text={
              <>
                <span className="v-align">{__('Modules')}</span>
                {!!updateCount && (
                  <Badge className="ml0_4">{updateCount}</Badge>
                )}
              </>
            }
          />
        </SettingsTabBar>

        <SettingsContent>
          <SettingsContainer>
            <Routes>
              <Route path="App" element={<SettingsApp />} />
              <Route path="Core" element={<SettingsCore />} />
              <Route path="Style" element={<SettingsStyle />} />
              <Route path="Modules" element={<SettingsModules />} />
              <Route path="*" element={<SettingsRedirect />} />
            </Routes>
          </SettingsContainer>
        </SettingsContent>
      </SettingsComponent>
    </SettingsFrame>
  );
}
