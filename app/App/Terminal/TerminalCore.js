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

/**
 * Terminal Core page in the Terminal Page
 *
 * @class TerminalCore
 * @extends {Component}
 */
class TerminalCore extends Component {
  constructor(props) {
    super(props);
  }
  // React Method (Life cycle hook)
  componentDidMount() {
  }

  // todo finish
  componentWillUnmount() {
  }

  // React Method (Life cycle hook)
  componentWillReceiveProps(nextProps) {
    if (this.props.rpcCallList.length != nextProps.rpcCallList.length) {
      this.forceUpdate();
    }
    if (this.props.coreOutput.length != nextProps.coreOutput.length)
    {
      this.outputRef.childNodes[0].scrollTop = this.outputRef.childNodes[0].scrollHeight;
    }
  }

  /**
   * Handle on Scroll
   *
   * @returns
   * @memberof TerminalCore
   */
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

  
  // Mandatory React method
  /**
   * React Render
   *
   * @returns
   * @memberof TerminalCore
   */
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
