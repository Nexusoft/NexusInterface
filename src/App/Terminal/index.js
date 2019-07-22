// External Dependencies
import React, { Component } from 'react';
import { remote } from 'electron';
import { Route, Redirect, Switch } from 'react-router';
import styled from '@emotion/styled';
import { connect } from 'react-redux';

// Internal Global Dependencies
import ContextMenuBuilder from 'contextmenu';
import Panel from 'components/Panel';
import Tab from 'components/Tab';

// Internal Local Dependencies
import TerminalConsole from './TerminalConsole';
import TerminalCore from './TerminalCore';

// Images
import consoleIcon from 'images/console.sprite.svg';
import logoIcon from 'images/logo.sprite.svg';
import coreIcon from 'images/core.sprite.svg';
import Text from 'components/Text';

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
   * Component Mount Callback
   *
   * @memberof Terminal
   */
  componentDidMount() {
    window.addEventListener('contextmenu', this.setupcontextmenu, false);
  }

  /**
   * Component Unmount Callback
   *
   * @memberof Terminal
   */
  componentWillUnmount() {
    window.removeEventListener('contextmenu', this.setupcontextmenu);
  }

  /**
   * Set up context menu
   *
   * @param {*} e
   * @memberof Terminal
   */
  setupcontextmenu(e) {
    e.preventDefault();
    const contextmenu = new ContextMenuBuilder().defaultContext;
    //build default
    let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
    defaultcontextmenu.popup(remote.getCurrentWindow());
  }

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof Terminal
   */
  render() {
    const { match } = this.props;
    return (
      <Panel
        icon={consoleIcon}
        title={_`Console`}
        bodyScrollable={false}
      >
        <TerminalComponent>
          <TerminalTabBar>
            <Tab
              link={`${match.url}/Console`}
              icon={logoIcon}
              text={_`Console`}
            />
            <Tab
              link={`${match.url}/Core`}
              icon={coreIcon}
              text={_`Core output`}
            />
          </TerminalTabBar>

          <Switch>
            <Route path={`${match.path}/Console`} component={TerminalConsole} />
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
