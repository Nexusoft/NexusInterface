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
import Icon from 'components/common/Icon';
import Panel from 'components/common/Panel';
import { Tabs, TabItem } from 'components/common/Tabs';

// Internal Local Dependencies
import TerminalConsole from './TerminalConsole';
import TerminalCore from './TerminalCore';

// Images
import consoleIcon from 'images/console.sprite.svg';
import logoIcon from 'images/logo.sprite.svg';
import coreIcon from 'images/core.sprite.svg';
import { FormattedMessage } from 'react-intl';

const TerminalWrapper = styled.div({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
});

const TerminalTabs = styled(Tabs)({
  flexShrink: 0,
});

// React-Redux mandatory methods
const mapStateToProps = state => {
  return { ...state.terminal, ...state.common, ...state.settings };
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
        title={
          <FormattedMessage id="Console.Console" defaultMessage="Console" />
        }
        bodyScrollable={false}
      >
        <TerminalWrapper>
          <TerminalTabs>
            <TabItem
              link={`${this.props.match.url}/Console`}
              icon={logoIcon}
              text={
                <FormattedMessage
                  id="Console.Console"
                  defaultMessage="Console"
                />
              }
            />
            <TabItem
              link={`${this.props.match.url}/Core`}
              icon={coreIcon}
              text={
                <FormattedMessage
                  id="Console.CoreOutput"
                  defaultMessage="Console"
                />
              }
            />
          </TerminalTabs>

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
        </TerminalWrapper>
      </Panel>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Terminal);
