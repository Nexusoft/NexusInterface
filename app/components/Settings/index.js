// External Dependencies
import React, { Component } from 'react';
import { Route, Redirect, Switch } from 'react-router';
import { connect } from 'react-redux';
import { remote } from 'electron';
import { FormattedMessage } from 'react-intl';
import styled from '@emotion/styled';
import googleanalytics from 'scripts/googleanalytics';

// Internal Global Dependencies
import * as RPC from 'scripts/rpc';
import ContextMenuBuilder from 'contextmenu';
import Panel from 'components/common/Panel';
import Icon from 'components/common/Icon';
import Tab from 'components/common/Tab';

// Internal Local Dependencies
import styles from './style.css';
import SettingsApp from './SettingsApp';
import SettingsCore from './SettingsCore';
import SettingsMarket from './SettingsMarket';
import SettingsStyle from './SettingsStyle';
import Security from './Security/Security';
import Login from './Security/Login';
import Unencrypted from './Security/Unencrypted';

// Images
import settingsIcon from 'images/settings.sprite.svg';
import coreIcon from 'images/core.sprite.svg';
import logoIcon from 'images/logo.sprite.svg';
import lockIcon from 'images/lock-minting.sprite.svg';
import marketImg from 'images/marketstats.svg';
import developerIcon from 'images/developer.sprite.svg';

const SettingsWrapper = styled.div({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
});

const SettingsTabBar = styled(Tab.Bar)({
  flexShrink: 0,
});

const SettingsContent = styled.div({
  padding: '0 1em',
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: 0,
  overflow: 'auto',
});

// React-Redux mandatory methods
const mapStateToProps = state => {
  return {
    ...state.common,
    ...state.intl,
  };
};
//const mapDispatchToProps = dispatch => {};

class Settings extends Component {
  // React Method (Life cycle hook)
  componentDidMount() {
    googleanalytics.SendScreen('Settings');
    window.addEventListener('contextmenu', this.setupcontextmenu, false);
  }
  // React Method (Life cycle hook)
  componentWillUnmount() {
    window.removeEventListener('contextmenu', this.setupcontextmenu);
  }

  // Class Methods
  setupcontextmenu(e) {
    e.preventDefault();
    const contextmenu = new ContextMenuBuilder().defaultContext;
    //build default
    let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
    defaultcontextmenu.popup(remote.getCurrentWindow());
  }

  // Mandatory React method
  render() {
    const { encrypted, match, loggedIn } = this.props;

    return (
      <Panel
        bodyScrollable={false}
        icon={settingsIcon}
        title={
          <FormattedMessage id="Settings.Settings" defaultMessage="Settings" />
        }
      >
        <SettingsWrapper>
          <SettingsTabBar>
            <Tab
              link={`${match.url}/App`}
              icon={logoIcon}
              text={
                <FormattedMessage
                  id="Settings.Application"
                  defaultMessage="Application"
                />
              }
            />
            <Tab
              link={`${match.url}/Core`}
              icon={coreIcon}
              text={
                <FormattedMessage id="Settings.Core" defaultMessage="Core" />
              }
            />
            <Tab
              link={`${match.url}/${encrypted ? 'Security' : 'Unencrypted'}`}
              isActive={(m, location) =>
                [
                  `${match.url}/Security`,
                  `${match.url}/Login`,
                  `${match.url}/Unencrypted`,
                ].includes(location.pathname)
              }
              icon={lockIcon}
              text={
                <FormattedMessage
                  id="Settings.Security"
                  defaultMessage="Security"
                />
              }
            />
            <Tab
              link={`${match.url}/Style`}
              icon={developerIcon}
              text={
                <FormattedMessage id="Settings.Style" defaultMessage="Style" />
              }
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
              <Route path={`${match.path}/Market`} component={SettingsMarket} />
              <Route path={`${match.path}/Style`} component={SettingsStyle} />
              <Route
                path={`${match.path}/Security`}
                render={props =>
                  loggedIn ? (
                    <Security {...props} />
                  ) : (
                    <Redirect to={`${match.path}/Login`} />
                  )
                }
              />
              <Route
                path={`${match.path}/Unencrypted`}
                component={Unencrypted}
              />
              <Route path={`${match.path}/Login`} component={Login} />
            </Switch>
          </SettingsContent>
        </SettingsWrapper>
      </Panel>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps
  //  mapDispatchToProps
)(Settings);
