// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal Global Dependencies
import {
  switchConsoleTab,
  printCoreOutput,
  pauseCoreOutput,
  unpauseCoreOutput,
} from 'actions/uiActionCreators';
import Button from 'components/Button';

// React-Redux mandatory methods
const mapStateToProps = ({
  settings,
  common: { rpcCallList },
  ui: {
    console: {
      core: { output, paused },
    },
  },
}) => ({
  settings,
  rpcCallList,
  output,
  paused,
});
const actionCreators = {
  switchConsoleTab,
  printCoreOutput,
  pauseCoreOutput,
  unpauseCoreOutput,
};

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
    fontSize: '75%',
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
    props.switchConsoleTab('Core');
  }

  // React Method (Life cycle hook)
  componentWillReceiveProps(nextProps) {
    if (this.props.rpcCallList.length != nextProps.rpcCallList.length) {
      this.forceUpdate();
    }
    if (this.props.output.length != nextProps.output.length) {
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
    if (!this.props.paused) {
      this.props.pauseCoreOutput(true);
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
    const {
      output,
      paused,
      pauseCoreOutput,
      unpauseCoreOutput,
      settings,
    } = this.props;
    return (
      <TerminalContent>
        <TerminalCoreComponent ref={el => (this.outputRef = el)}>
          {settings.manualDaemon ? (
            <div className="dim">Core in Manual Mode</div>
          ) : (
            <>
              <Output
                reverse={!settings.manualDaemon}
                onScroll={() => this.onScrollEvent()}
              >
                {output.map((d, i) => (
                  <OutputLine key={i}>{d}</OutputLine>
                ))}
              </Output>
              <Button
                skin="filled-dark"
                fullWidth
                onClick={paused ? unpauseCoreOutput : pauseCoreOutput}
                style={{ flexShrink: 0 }}
              >
                {paused ? 'Unpause' : 'Pause'}
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
  actionCreators
)(TerminalCore);
