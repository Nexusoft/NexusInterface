// External
import React, { Component } from 'react';
import { Route, Redirect, Switch } from 'react-router';
import { remote } from 'electron';
import Text from 'components/Text';
import styled from '@emotion/styled';
import googleanalytics from 'scripts/googleanalytics';

// Internal Global
import ContextMenuBuilder from 'contextmenu';
import Panel from 'components/Panel';
import Tab from 'components/Tab';

// Internal Local
import SettingsApp from './App';
import SettingsCore from './Core';
import SettingsStyle from './Style';
import Security from './Security';

// Images
import settingsIcon from 'images/settings.sprite.svg';
import coreIcon from 'images/core.sprite.svg';
import logoIcon from 'images/logo.sprite.svg';
import lockIcon from 'images/padlock.sprite.svg';
import developerIcon from 'images/developer.sprite.svg';

const SettingsComponent = styled.div({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
});

const SettingsTabBar = styled(Tab.Bar)({
  flexShrink: 0,
});

const SettingsContent = styled.div({
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: 0,
  overflow: 'auto',
});

/**
 * Settings Page
 *
 * @export
 * @class Settings
 * @extends {Component}
 */
export default class Settings extends Component {
  componentDidMount() {
    googleanalytics.SendScreen('Settings');
    window.addEventListener('contextmenu', this.setupcontextmenu, false);
  }
  componentWillUnmount() {
    window.removeEventListener('contextmenu', this.setupcontextmenu);
  }

  /**
   * Set up context menu
   *
   * @param {*} e
   * @memberof Settings
   */
  setupcontextmenu(e) {
    e.preventDefault();
    const contextmenu = new ContextMenuBuilder().defaultContext;
    //build default
    let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
    defaultcontextmenu.popup(remote.getCurrentWindow());
  }

  /**
   * React Render
   *
   * @returns
   * @memberof Settings
   */
  render() {
    const { match } = this.props;

    return (
      <Panel
        bodyScrollable={false}
        icon={settingsIcon}
        title={<Text id="Settings.Settings" />}
      >
        <SettingsComponent>
          <SettingsTabBar>
            <Tab
              link={`${match.url}/App`}
              icon={logoIcon}
              text={<Text id="Settings.Application" />}
            />
            <Tab
              link={`${match.url}/Core`}
              icon={coreIcon}
              text={<Text id="Settings.Core" />}
            />
            <Tab
              link={`${match.url}/Security`}
              icon={lockIcon}
              text={<Text id="Settings.Security" />}
            />
            <Tab
              link={`${match.url}/Style`}
              icon={developerIcon}
              text={<Text id="Settings.Style" />}
            />
          </SettingsTabBar>

          <SettingsContent>
            <Switch>
              <Redirect
                exact
                from={`${match.path}/`}
                to={`${match.path}/App`}
              />
              <Route
                path={`${match.path}/App`}
                render={props => <SettingsApp {...this.props} />}
              />
              <Route path={`${match.path}/Core`} component={SettingsCore} />
              <Route path={`${match.path}/Style`} component={SettingsStyle} />
              <Route path={`${match.path}/Security`} component={Security} />
            </Switch>
          </SettingsContent>
        </SettingsComponent>
      </Panel>
    );
  }
}
