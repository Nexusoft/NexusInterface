// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route, Redirect, Switch } from 'react-router';
import styled from '@emotion/styled';
import GA from 'lib/googleAnalytics';

// Internal Global
import Panel from 'components/Panel';
import Tab from 'components/Tab';
import { legacyMode } from 'consts/misc';

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

let SettingsRedirect = ({ lastActiveTab, match }) => (
  <Redirect
    exact
    from={`${match.path}/`}
    to={`${match.path}/${lastActiveTab}`}
  />
);
SettingsRedirect = connect(({ ui: { settings: { lastActiveTab } } }) => ({
  lastActiveTab,
}))(SettingsRedirect);

/**
 * Settings Page
 *
 * @export
 * @class Settings
 * @extends {Component}
 */
export default class Settings extends Component {
  /**
   * Component Mount Callback
   *
   * @memberof Settings
   */
  componentDidMount() {
    GA.SendScreen('Settings');
  }

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof Settings
   */
  render() {
    const { match } = this.props;

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
            <Tab
              link={`${match.url}/Style`}
              icon={leafIcon}
              text={__('Style')}
            />
            <Tab
              link={`${match.url}/Modules`}
              icon={legoIcon}
              text={__('Modules')}
            />
          </SettingsTabBar>

          <SettingsContent>
            <SettingsContainer>
              <Switch>
                <Route path={`${match.path}/App`} component={SettingsApp} />
                <Route path={`${match.path}/Core`} component={SettingsCore} />
                {legacyMode && (
                  <Route
                    path={`${match.path}/Security`}
                    component={SettingsSecurity}
                  />
                )}
                <Route path={`${match.path}/Style`} component={SettingsStyle} />
                <Route
                  path={`${match.path}/Modules`}
                  component={SettingsModules}
                />
                <SettingsRedirect match={match} />
              </Switch>
            </SettingsContainer>
          </SettingsContent>
        </SettingsComponent>
      </Panel>
    );
  }
}
