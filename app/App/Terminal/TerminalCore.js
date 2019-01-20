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
  return { ...state.terminal, ...state.common, settings: state.settings };
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
  border: `1px solid ${theme.mixer(0.125)}`,
}));

const Output = styled.div(
  ({ theme }) => ({
    overflowY: 'auto',
    wordBreak: 'break-all',
    flexGrow: 1,
    display: 'flex',
    background: theme.background,
    borderBottom: `1px solid ${theme.mixer(0.125)}`,
  }),
  ({ reverse }) => ({
    flexDirection: reverse ? 'column-reverse' : 'column',
  })
);

const OutputLine = styled.code(({ theme }) => ({
  background: theme.background,
  borderColor: theme.background,
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
    this.debugFileLocation = debugfile;
    fs.stat(this.debugFileLocation, this.checkDebugFileExists.bind(this));
    this.checkIfFileExistsInterval = setInterval(() => {
      if (this.tail != undefined) {
        clearInterval(this.checkIfFileExistsInterval);
        return;
      }
      fs.stat(this.debugFileLocation, this.checkDebugFileExists.bind(this));
    }, 5000);
  }

  // todo finish
  componentWillUnmount() {
    if (this.tail != undefined) {
      this.tail.unwatch();
    }
    clearInterval(this.printCoreOutputTimer);
    clearInterval(this.checkIfFileExistsInterval);
  }

  // React Method (Life cycle hook)
  componentWillReceiveProps(nextProps) {
    if (this.props.rpcCallList.length != nextProps.rpcCallList.length) {
      this.forceUpdate();
    }
  }

  checkDebugFileExists(err, stat) {
    console.log(this);
    if (err == null) {
      this.processDeamonOutput(this.debugFileLocation);
      clearInterval(this.checkIfFileExistsInterval);
    } else {
    }
  }

  onScrollEvent() {
    const bottomPos =
      this.outputRef.childNodes[0].scrollHeight -
      this.outputRef.childNodes[0].clientHeight -
      2; // found a issue where the numbers would be plus or minus this do to floating point error. Just stepped back 2 it catch it.
    const currentPos = parseInt(this.outputRef.childNodes[0].scrollTop);
    if (currentPos >= bottomPos) {
      return;
    }
    if (!this.props.coreOutputPaused) {
      this.props.setCoreOutputPaused(true);
    }
  }

  // Class Methods
  processDeamonOutput(debugfile) {
    const tailOptions = {
      useWatchFile: true,
    };
    this.tail = new Tail(debugfile, tailOptions);
    let n = 0;
    let batch = [];
    this.tail.on('line', d => {
      batch.push(d);
    });
    this.printCoreOutputTimer = setInterval(() => {
      if (this.props.coreOutputPaused) {
        return;
      }
      if (batch.length == 0) {
        return;
      }
      this.props.printCoreOutput(batch);
      batch = [];
      this.outputRef.childNodes[0].scrollTop = this.outputRef.childNodes[0].scrollHeight;
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
              <Output
                reverse={!this.props.settings.manualDaemon}
                onScroll={() => this.onScrollEvent()}
              >
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
