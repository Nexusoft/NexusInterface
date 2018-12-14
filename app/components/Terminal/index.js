/*
  Title: 
  Description: 
  Last Modified by: Brian Smith
*/
// External Dependencies
import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { remote } from 'electron';
import { Route, Redirect } from 'react-router';
import { connect } from 'react-redux';
import * as TYPE from 'actions/actiontypes';

// Internal Dependencies
import TerminalConsole from './TerminalConsole';
import TerminalCore from './TerminalCore';
import ContextMenuBuilder from 'contextmenu';
import styles from './style.css';

// Images
import consoleimg from 'images/console.svg';
import mainlogo from 'images/logo.svg';
import coreImg from 'images/core.svg';
import { FormattedMessage } from 'react-intl';

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
    // Redirect to application settings if the pathname matches the url (eg: /Terminal = /Terminal)
    if (this.props.location.pathname === this.props.match.url) {
      console.log('Redirecting to Terminal Console');

      return <Redirect to={`${this.props.match.url}/Console`} />;
    }

    return (
      <div id="terminal" className="animated fadeIn">
        <h2>
          <img src={consoleimg} className="hdr-img" />
          <FormattedMessage id="Console.Console" defaultMessage="Console" />
        </h2>

        <div className="panel">
          <ul className="tabs">
            <li>
              <NavLink to={`${this.props.match.url}/Console`}>
                <img src={mainlogo} alt="Console" />
                <FormattedMessage
                  id="Console.Console"
                  defaultMessage="Console"
                />
              </NavLink>
            </li>
            <li>
              <NavLink to={`${this.props.match.url}/Core`}>
                <img src={coreImg} alt="Core Output" />
                <FormattedMessage
                  id="Console.CoreOutput"
                  defaultMessage="Console"
                />
              </NavLink>
            </li>
            {this.props.history.location.pathname === '/Terminal/Core' ? (
              <button
                className="button primary"
                style={{
                  position: 'absolute',
                  right: '10px',
                  bottom: '5px',
                  marginBottom: '0px',
                }}
                onClick={() => {
                  console.log(this.props);
                  this.props.setCoreOutputPaused(!this.props.coreOutputPaused);
                }}
              >
                {this.props.coreOutputPaused ? 'UnPause' : 'Pause'}
              </button>
            ) : null}
          </ul>

          <div id="terminal-content">
            <Route
              exact
              path={`${this.props.match.path}/`}
              component={TerminalConsole}
            />
            <Route
              path={`${this.props.match.path}/Console`}
              component={TerminalConsole}
            />
            <Route
              path={`${this.props.match.path}/Core`}
              component={TerminalCore}
            />
          </div>
        </div>
      </div>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Terminal);
