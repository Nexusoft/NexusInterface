// External
import { useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { Route, Redirect, Switch } from 'react-router';
import { useRouteMatch, Routes } from 'react-router-dom';
import styled from '@emotion/styled';
import GA from 'lib/googleAnalytics';

// Internal Global
import Panel from 'components/Panel';
import Tab from 'components/Tab';
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

const SettingsTabBar = styled(Tab.Bar)({
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

let SettingsRedirect = ({ lastActiveTab, match }) => (
  <Redirect
    exact
    from={`${match.path}/`}
    to={`${match.path}/${lastActiveTab}`}
  />
);
SettingsRedirect = connect((state) => ({
  lastActiveTab: state.ui.settings.lastActiveTab,
}))(SettingsRedirect);

/**
 * Settings Page
 *
 * @export
 * @class Settings
 * @extends {Component}
 */
export default function Settings() {
  const match = useRouteMatch();
  useEffect(() => {
    GA.SendScreen('Settings');
  }, []);
  const updateCount = useSelector(selectModuleUpdateCount);

  return (
    <Panel bodyScrollable={false} icon={settingsIcon} title={__('Settings')}>
      <SettingsComponent>
        <SettingsTabBar>
          <Tab
            link={`${match.url}/App`}
            icon={logoIcon}
            text={__('Application')}
          />
          <Tab link={`${match.url}/Core`} icon={coreIcon} text={__('Core')} />
          {legacyMode && (
            <Tab
              link={`${match.url}/Security`}
              icon={lockIcon}
              text={__('Security')}
            />
          )}
          <Tab link={`${match.url}/Style`} icon={leafIcon} text={__('Style')} />
          <Tab
            link={`${match.url}/Modules`}
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
              <Route element={<SettingsRedirect match={match} />} />
            </Routes>
          </SettingsContainer>
        </SettingsContent>
      </SettingsComponent>
    </Panel>
  );
}
