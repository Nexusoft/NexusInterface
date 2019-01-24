// External Dependencies
import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { remote } from 'electron';
import { Route, Redirect, Switch } from 'react-router';
import styled from '@emotion/styled';
import { connect } from 'react-redux';
import * as TYPE from 'actions/actiontypes';

// Internal Global Dependencies
import ContextMenuBuilder from 'contextmenu';
import Icon from 'components/Icon';
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
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
});

const TerminalTabBar = styled(Tab.Bar)({
  flexShrink: 0,
});

// React-Redux mandatory methods
const mapStateToProps = state => {
  return { ...state.terminal, ...state.common };
};
const mapDispatchToProps = dispatch => ({
  setCoreOutputPaused: isPaused =>
    dispatch({ type: TYPE.SET_PAUSE_CORE_OUTPUT, payload: isPaused }),
});

class Terminal extends Component {
  // React Method (Life cycle hook)
  componentDidMount() {
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
    return (
      <Panel
        icon={consoleIcon}
        title={<Text id="Console.Console" />}
        bodyScrollable={false}
      >
        <TerminalComponent>
          <TerminalTabBar>
            <Tab
              link={`${this.props.match.url}/Console`}
              icon={logoIcon}
              text={<Text id="Console.Console" />}
            />
            <Tab
              link={`${this.props.match.url}/Core`}
              icon={coreIcon}
              text={<Text id="Console.CoreOutput" />}
            />
          </TerminalTabBar>

          <Switch>
            <Redirect
              exact
              from={`${this.props.match.path}/`}
              to={`${this.props.match.path}/Console`}
            />
            <Route
              path={`${this.props.match.path}/Console`}
              component={TerminalConsole}
            />
            <Route
              path={`${this.props.match.path}/Core`}
              component={TerminalCore}
            />
          </Switch>
        </TerminalComponent>
      </Panel>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Terminal);
