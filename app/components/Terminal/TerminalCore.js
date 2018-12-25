// External Dependencies
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { timingSafeEqual } from 'crypto';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal Global Dependencies
import * as RPC from 'scripts/rpc';
import * as TYPE from 'actions/actiontypes';
import { Tail } from 'utils/tail';
import configuration from 'api/configuration';
import Button from 'components/Button';
import { colors } from 'styles';

// React-Redux mandatory methods
const mapStateToProps = state => {
  return { ...state.terminal, ...state.common, ...state.settings };
};
const mapDispatchToProps = dispatch => ({
  printCoreOutput: data =>
    dispatch({ type: TYPE.PRINT_TO_CORE, payload: data }),
});

const TerminalContent = styled.div({
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: 0,
  overflow: 'hidden',
});

const TerminalCoreWrapper = styled.div({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  border: `1px solid ${colors.darkerGray}`,
});

const Output = styled.div(
  {
    overflowY: 'auto',
    flexGrow: 1,
    display: 'flex',
    background: colors.dark,
    borderBottom: `1px solid ${colors.darkerGray}`,
  },
  ({ reverse }) => ({
    flexDirection: reverse ? 'column-reverse' : 'column',
  })
);

const OutputLine = styled.code({
  background: colors.dark,
  borderColor: colors.dark,
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
      this.outputRef.scrollTop = this.outputRef.scrollHeight;
    }, 1000);
  }

  // Mandatory React method
  render() {
    return (
      <TerminalContent>
        <TerminalCoreWrapper ref={el => (this.outputRef = el)}>
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
                {this.props.coreOutputPaused ? 'UnPause' : 'Pause'}
              </Button>
            </>
          )}
        </TerminalCoreWrapper>
      </TerminalContent>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TerminalCore);
