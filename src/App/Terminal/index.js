// External Dependencies
import React, { Component } from 'react';
import { Route, Redirect, Switch } from 'react-router';
import styled from '@emotion/styled';
import { connect } from 'react-redux';

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

let ConsoleRedirect = ({ lastActiveTab, match }) => (
  <Redirect
    exact
    from={`${match.path}/`}
    to={`${match.path}/${lastActiveTab}`}
  />
);
ConsoleRedirect = connect(({ ui: { console: { lastActiveTab } } }) => ({
  lastActiveTab,
}))(ConsoleRedirect);

/**
 * Terminal Page
 *
 * @class Terminal
 * @extends {Component}
 */
class Terminal extends Component {
  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof Terminal
   */
  render() {
    const { match } = this.props;
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

          <Switch>
            <Route
              path={`${match.path}/Console`}
              component={legacyMode ? TerminalConsole : NexusApiConsole}
            />
            <Route path={`${match.path}/Core`} component={TerminalCore} />
            <ConsoleRedirect match={match} />
          </Switch>
        </TerminalComponent>
      </Panel>
    );
  }
}

// Mandatory React-Redux method
export default Terminal;
