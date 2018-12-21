/*
  Title: Terminal Core
  Description: show what methods have been called to the rpc server
  Last Modified by: Brian Smith
*/
// External Dependencies
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { timingSafeEqual } from 'crypto';
import { connect } from 'react-redux';
// import { Tail } from "tail";

// Internal Dependencies
import styles from './style.css';
import configuration from 'api/configuration';
import * as RPC from 'scripts/rpc';
import * as TYPE from 'actions/actiontypes';
import { Tail } from 'utils/tail';

// React-Redux mandatory methods
const mapStateToProps = state => {
  return { ...state.terminal, ...state.common, ...state.settings };
};
const mapDispatchToProps = dispatch => ({
  printCoreOutput: data =>
    dispatch({ type: TYPE.PRINT_TO_CORE, payload: data }),
});

class TerminalCore extends Component {
  constructor(props) {
    super(props);
  }
  // React Method (Life cycle hook)
  componentDidMount() {
    if (this.props.settings.manualDaemon == true) {
      return;
    }
    let datadir = configuration.GetCoreDataDir();
    const electronapp =
      require('electron').app || require('electron').remote.app;

    var debugfile;
    if (process.platform === 'win32') {
      debugfile = datadir + '\\debug.log';
    } else {
      debugfile = datadir + '/debug.log';
    }
    this.processDeamonOutput(debugfile);
  }

  // todo finish
  componentWillUnmount() {
    if (this.tail != undefined) {
      this.tail.unwatch();
    }
    clearInterval(this.printCoreOutputTimer);
  }

  // React Method (Life cycle hook)
  componentWillReceiveProps(nextProps) {
    if (this.props.rpcCallList.length != nextProps.rpcCallList.length) {
      this.forceUpdate();
    }
  }

  // Class Methods
  processDeamonOutput(debugfile) {
    this.tail = new Tail(debugfile);
    let n = 0;
    let batch = [];
    this.tail.on('line', d => {
      batch.push(d);
    });
    this.printCoreOutputTimer = setInterval(() => {
      if (this.props.coreOutputPaused) {
        return;
      }
      this.props.printCoreOutput(batch);
      batch = [];
      let termoutput = document.getElementById('terminal-core-output');
      termoutput.scrollTop = termoutput.scrollHeight;
    }, 1000);
  }

  // Mandatory React method
  render() {
    return (
      <div
        id="terminal-core-output"
        style={{
          display: 'flex',
          flexDirection: this.props.settings.manualDaemon
            ? 'column'
            : 'column-reverse',
        }}
        onScroll={e => {
          e.preventDefault();
        }}
      >
        {this.props.settings.manualDaemon ? (
          <div>Core in Manual Mode</div>
        ) : (
          this.props.coreOutput.map((d, i) => {
            return <div key={i}>{d}</div>;
          })
        )}
      </div>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TerminalCore);
