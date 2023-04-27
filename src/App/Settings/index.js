// External
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import styled from '@emotion/styled';
import GA from 'lib/googleAnalytics';

// Internal Global
import Panel from 'components/Panel';
import RouterHorizontalTab from 'components/RouterHorizontalTab';
import { legacyMode } from 'consts/misc';
import { selectModuleUpdateCount } from 'selectors';

// Internal Local
import SettingsApp from './App';
import SettingsCore from './Core';
import SettingsStyle from './Style';
import SettingsSecurity from './Security';
import SettingsModules from './Modules';

// Images
import settingsIcon from 'icons/settings.svg';
import coreIcon from 'icons/core.svg';
import logoIcon from 'icons/logo.svg';
import lockIcon from 'icons/padlock.svg';
import leafIcon from 'icons/leaf.svg';
import legoIcon from 'icons/lego-block.svg';

__ = __context('Settings');

const SettingsComponent = styled.div({
  height: '100%',
  display: 'grid',
  gridTemplateAreas: '"tab-bar" "content"',
  gridTemplateRows: 'min-content 1fr',
  position: 'relative',
});

const SettingsTabBar = styled(RouterHorizontalTab.TabBar)({
  gridArea: 'tab-bar',
});

const SettingsContent = styled.div({
  gridArea: 'content',
  overflow: 'auto',
  margin: '0 -30px',
  padding: '0 30px',
});

const SettingsContainer = styled.div({
  maxWidth: 750,
  margin: '0 auto',
});

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
    GA.SendScreen('Settings');
  }, []);
  const updateCount = useSelector(selectModuleUpdateCount);

  return (
    <Panel bodyScrollable={false} icon={settingsIcon} title={__('Settings')}>
      <SettingsComponent>
        <SettingsTabBar>
          <RouterHorizontalTab
            link="App"
            icon={logoIcon}
            text={__('Application')}
          />
          <RouterHorizontalTab link="Core" icon={coreIcon} text={__('Core')} />
          {legacyMode && (
            <RouterHorizontalTab
              link="Security"
              icon={lockIcon}
              text={__('Security')}
            />
          )}
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
              {legacyMode && (
                <Route path="Security" element={<SettingsSecurity />} />
              )}
              <Route path="Style" element={<SettingsStyle />} />
              <Route path="Modules" element={<SettingsModules />} />
              <Route path="*" element={<SettingsRedirect />} />
            </Routes>
          </SettingsContainer>
        </SettingsContent>
      </SettingsComponent>
    </Panel>
  );
}
