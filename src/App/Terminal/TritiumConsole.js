// External Dependencies
import { connect } from 'react-redux';
import React, { Component } from 'react';
import styled from '@emotion/styled';
import GA from 'lib/googleAnalytics';
import memoize from 'memoize-one';

// Internal Global Dependencies
import WaitingMessage from 'components/WaitingMessage';
import Button from 'components/Button';
import AutoSuggest from 'components/AutoSuggest';
import { isCoreConnected } from 'selectors';
import rpc from 'lib/rpc';
import * as Tritium from 'lib/tritiumApi';
import {
  switchConsoleTab,
  updateConsoleInput,
  updateTritiumConsoleInput,
  setCommandList,
  commandHistoryUp,
  commandHistoryDown,
  executeCommand,
  printCommandOutput,
  printCommandError,
  resetConsoleOutput,
} from 'actions/ui';

const filterCommands = memoize((commandList, inputValue) => {
  if (!commandList || !inputValue) return [];
  return commandList.filter(
    cmd => !!cmd && cmd.value.toLowerCase().startsWith(inputValue.toLowerCase())
  );
});

const consoleInputSelector = memoize(
  (currentCommand, commandHistory, historyIndex) =>
    historyIndex === -1 ? currentCommand : commandHistory[historyIndex]
);

const mapStateToProps = state => {
  const {
    ui: {
      console: {
        console: {
          currentCommand,
          commandHistory,
          historyIndex,
          commandList,
          output,
          currentTritiumCommand,
        },
      },
    },
  } = state;
  return {
    coreConnected: isCoreConnected(state),
    consoleInput: consoleInputSelector(
      currentCommand,
      commandHistory,
      historyIndex
    ),
    currentTritiumCommand,
    commandList,
    output,
  };
};

const actionCreators = {
  switchConsoleTab,
  setCommandList,
  updateConsoleInput,
  updateTritiumConsoleInput,
  commandHistoryUp,
  commandHistoryDown,
  executeCommand,
  printCommandOutput,
  printCommandError,
  resetConsoleOutput,
};

const TerminalContent = styled.div({
  gridArea: 'content',
  overflow: 'visible',
});

const Console = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

const ConsoleInput = styled.div({
  marginBottom: '1em',
  position: 'relative',
});

const ConsoleOutput = styled.code(({ theme }) => ({
  flexGrow: 1,
  flexBasis: 0,
  fontSize: '75%',
  overflow: 'auto',
  wordBreak: 'break-all',
  whiteSpace: 'pre-wrap',
  background: theme.background,
  border: `1px solid ${theme.mixer(0.125)}`,
}));

const ExecuteButton = styled(Button)(({ theme }) => ({
  borderLeft: `1px solid ${theme.mixer(0.125)}`,
}));

/**
 * Console Page in the Terminal Page
 *
 * @class TerminalConsole
 * @extends {Component}
 */
@connect(
  mapStateToProps,
  actionCreators
)
class TritiumConsole extends Component {
  /**
   *Creates an instance of TerminalConsole.
   * @param {*} props
   * @memberof TerminalConsole
   */
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.outputRef = React.createRef();
    props.switchConsoleTab('Console');
  }

  /**
   *
   *
   * @param {*} prevProps
   * @param {*} PrevState
   * @memberof TerminalConsole
   */
  componentDidUpdate(prevProps, PrevState) {
    // Scroll to bottom
    if (this.outputRef.current && prevProps.output !== this.props.output) {
      const { clientHeight, scrollHeight } = this.outputRef.current;
      this.outputRef.current.scrollTop = scrollHeight - clientHeight;
    }
  }

  /**
   * Execute a Command
   *
   * @memberof TerminalConsole
   */
  execute = async () => {
    const {
      currentTritiumCommand,
      executeCommand,
      commandList,
      printCommandOutput,
      printCommandError,
    } = this.props;
    console.log(currentTritiumCommand);
    if (!currentTritiumCommand || !currentTritiumCommand.trim()) return;

    const cmd = currentTritiumCommand;
    //executeCommand(consoleInput);
    GA.SendEvent('Terminal', 'TritiumConsole', 'UseCommand', 1);
    console.log(cmd);

    // this.inputRef.inputRef.current.blur();

    const tab = ' '.repeat(2);
    let result = null;
    try {
      result = await Tritium.apiGet(cmd);
    } catch (err) {
      console.error(err);
      if (err.message !== undefined) {
        printCommandError(
          `Error: ${err.err.message}(errorcode ${err.err.code})`
        );
      } else {
        // This is the error if the rpc is unavailable
        try {
          printCommandError(tab + err.err.message);
        } catch (e) {
          printCommandError(tab + err);
        }
      }
      return;
    }

    if (typeof result === 'object') {
      const output = [];
      const traverseOutput = (obj, depth) => {
        const tabs = tab.repeat(depth);
        Object.entries(obj).forEach(([key, value]) => {
          if (typeof value === 'object') {
            output.push(`${tabs}${key}:`);
            traverseOutput(value, depth + 1);
          } else {
            output.push(`${tabs}${key}: ${value}`);
          }
        });
      };

      traverseOutput(result, 1);
      printCommandOutput(output);
    } else if (typeof result === 'string') {
      printCommandOutput(
        result
          .split('\n')
          .map(text => tab + (text.startsWith(' ') ? text : '> ' + text + '\n'))
      );
    } else {
      printCommandOutput(tab + result.data);
    }
  };

  /**
   * Take the Autosuggest and updateConsoleInput
   *
   * @memberof TerminalConsole
   */
  formateAutoSuggest = e => {
    this.props.updateConsoleInput(e);
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof TerminalConsole
   */
  render() {
    const {
      coreConnected,
      commandList,
      consoleInput,
      tritiumConsoleInput,
      updateTritiumConsoleInput,
      output,
      resetConsoleOutput,
    } = this.props;

    if (!coreConnected) {
      return (
        <WaitingMessage>
          {__('Connecting to Nexus Core')}
          ...
        </WaitingMessage>
      );
    } else {
      return (
        <TerminalContent>
          <Console>
            <ConsoleInput>
              <AutoSuggest
                suggestions={commandList}
                filterSuggestions={filterCommands}
                onSelect={this.formateAutoSuggest}
                keyControl={false}
                suggestOn="change"
                ref={c => (this.inputRef = c)}
                inputRef={this.inputRef}
                inputProps={{
                  autoFocus: true,
                  skin: 'filled-inverted',
                  value: tritiumConsoleInput,
                  placeholder: __(
                    'Enter console commands here (ex: getinfo, help)'
                  ),
                  onChange: e => {
                    updateTritiumConsoleInput(e.target.value);
                  },
                  onKeyDown: this.handleKeyDown,
                  right: (
                    <ExecuteButton
                      skin="filled-inverted"
                      fitHeight
                      grouped="right"
                      onClick={this.execute}
                    >
                      {__('Execute')}
                    </ExecuteButton>
                  ),
                }}
              />
            </ConsoleInput>

            <ConsoleOutput ref={this.outputRef}>
              {output.map(({ type, content }, i) => {
                switch (type) {
                  case 'command':
                    return (
                      <div key={i}>
                        <span>
                          <span style={{ color: '#0ca4fb' }}>Nexus-Core</span>
                          <span style={{ color: '#00d850' }}>$ </span>
                          {content}
                          <span style={{ color: '#0ca4fb' }}> ></span>
                        </span>
                      </div>
                    );
                  case 'text':
                    return <div key={i}>{content}</div>;
                  case 'error':
                    return (
                      <div key={i} className="error">
                        {content}
                      </div>
                    );
                }
              })}
            </ConsoleOutput>

            <Button
              skin="filled-inverted"
              grouped="bottom"
              onClick={resetConsoleOutput}
            >
              {__('Clear console')}
            </Button>
          </Console>
        </TerminalContent>
      );
    }
  }
}

export default TritiumConsole;
