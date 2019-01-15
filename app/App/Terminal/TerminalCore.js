// External Dependencies
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { timingSafeEqual } from 'crypto';
import { connect } from 'react-redux';
import styled from '@emotion/styled';
import fs from 'fs';

// Internal Global Dependencies
import * as RPC from 'scripts/rpc';
import * as TYPE from 'actions/actiontypes';
import { Tail } from 'utils/tail';
import configuration from 'api/configuration';
import Button from 'components/Button';

// React-Redux mandatory methods
const mapStateToProps = state => {
  return { ...state.terminal, ...state.common, ...state.settings };
};
const mapDispatchToProps = dispatch => ({
  printCoreOutput: data =>
    dispatch({ type: TYPE.PRINT_TO_CORE, payload: data }),
    setCoreOutputPaused: isPaused =>
    dispatch({ type: TYPE.SET_PAUSE_CORE_OUTPUT, payload: isPaused }),
});

const TerminalContent = styled.div({
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: 0,
  overflow: 'hidden',
});

const TerminalCoreComponent = styled.div(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  border: `1px solid ${theme.darkerGray}`,
}));

const Output = styled.div(
  ({ theme }) => ({
    overflowY: 'auto',
    wordBreak:'break-all',
    flexGrow: 1,
    display: 'flex',
    background: theme.dark,
    borderBottom: `1px solid ${theme.darkerGray}`,
  }),
  ({ reverse }) => ({
    flexDirection: reverse ? 'column-reverse' : 'column',
  })
);

const OutputLine = styled.code(({ theme }) => ({
  background: theme.dark,
  borderColor: theme.dark,
}));

class TerminalCore extends Component {
  constructor(props) {
    super(props);
    this.debugFileLocation = '';
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
    fs.watchFile(debugfile, (curr, prev) => {});
    this.debugFileLocation = debugfile;
    this.processDeamonOutput(debugfile);
  }

  // todo finish
  componentWillUnmount() {
    if (this.tail != undefined) {
      this.tail.unwatch();
    }
    fs.unwatchFile(this.debugFileLocation);
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
      this.outputRef.scrollTop = this.outputRef.scrollHeight;
    }, 1000);
  }

  // Mandatory React method
  render() {
    return (
      <TerminalContent>
        <TerminalCoreComponent ref={el => (this.outputRef = el)}>
          {this.props.settings.manualDaemon ? (
            <div className="dim">Core in Manual Mode</div>
          ) : (
            <>
              <Output reverse={!this.props.settings.manualDaemon}>
                {this.props.coreOutput.map((d, i) => (
                  <OutputLine key={i}>{d}</OutputLine>
                ))}
              </Output>
              <Button
                skin="filled-dark"
                fullWidth
                onClick={() => {
                  console.log(this.props);
                  this.props.setCoreOutputPaused(!this.props.coreOutputPaused);
                }}
                style={{ flexShrink: 0 }}
              >
                {this.props.coreOutputPaused ? 'Unpause' : 'Pause'}
              </Button>
            </>
          )}
        </TerminalCoreComponent>
      </TerminalContent>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TerminalCore);
