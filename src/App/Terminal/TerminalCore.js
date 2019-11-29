// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal Global Dependencies
import 'lib/coreOutput';
import { switchConsoleTab, pauseCoreOutput, unpauseCoreOutput } from 'lib/ui';
import Button from 'components/Button';

__ = __context('Console.CoreOutput');

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

const TerminalContent = styled.div({
  gridArea: 'content',
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
    padding: '.5em',
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
  outputRef = React.createRef();

  /**
   *Creates an instance of TerminalCore.
   * @param {*} props
   * @memberof TerminalCore
   */
  constructor(props) {
    super(props);
    switchConsoleTab('Core');
  }

  /**
   * Component Received New Props Callback
   *
   * @param {*} nextProps
   * @memberof TerminalCore
   */
  componentDidUpdate(prevProps) {
    if (this.props.output.length != prevProps.output.length) {
      const outputElem = this.outputRef.current;
      outputElem.scrollTop = outputElem.scrollHeight;
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
      this.outputRef.current.scrollHeight -
      this.outputRef.current.clientHeight -
      2; // found a issue where the numbers would be plus or minus this do to floating point error. Just stepped back 2 it catch it.
    const currentPos = parseInt(this.outputRef.current.scrollTop);
    if (currentPos >= bottomPos) {
      return;
    }
    if (!this.props.paused) {
      pauseCoreOutput(true);
    }
  }

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof TerminalCore
   */
  render() {
    const { output, paused, settings } = this.props;
    return (
      <TerminalContent>
        <TerminalCoreComponent>
          {settings.manualDaemon ? (
            <div className="dim">{__('Core is in Manual Mode')}</div>
          ) : (
            <>
              <Output
                ref={this.outputRef}
                reverse={!settings.manualDaemon}
                onScroll={() => this.onScrollEvent()}
              >
                {output.map((d, i) => (
                  <OutputLine key={i}>{d}</OutputLine>
                ))}
              </Output>
              <Button
                skin="filled-inverted"
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
export default connect(mapStateToProps)(TerminalCore);
