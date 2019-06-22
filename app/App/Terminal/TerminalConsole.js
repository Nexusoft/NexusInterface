// External Dependencies
import { connect } from 'react-redux';
import React, { Component } from 'react';
import Text from 'components/Text';
import styled from '@emotion/styled';
import googleanalytics from 'scripts/googleanalytics';
import memoize from 'memoize-one';

// Internal Global Dependencies
import WaitingMessage from 'components/WaitingMessage';
import Button from 'components/Button';
import AutoSuggest from 'components/AutoSuggest';
import * as RPC from 'scripts/rpc';
import {
  switchConsoleTab,
  updateConsoleInput,
  setCommandList,
  commandHistoryUp,
  commandHistoryDown,
  executeCommand,
  printCommandOutput,
  printCommandError,
  resetConsoleOutput,
} from 'actions/uiActionCreators';

const filterCommands = memoize((commandList, inputValue) => {
  if (!commandList || inputValue == '') return [];
  const query = inputValue;
  return commandList.filter(
    cmd => !!cmd && cmd.toLowerCase().startsWith(query.toLowerCase())
  );
});

const consoleInputSelector = memoize(
  (currentCommand, commandHistory, historyIndex) =>
    historyIndex === -1 ? currentCommand : commandHistory[historyIndex]
);

const mapStateToProps = ({
  ui: {
    console: {
      console: {
        currentCommand,
        commandHistory,
        historyIndex,
        commandList,
        output,
      },
    },
  },
  core: {
    info: { connections },
  },
}) => ({
  consoleInput: consoleInputSelector(
    currentCommand,
    commandHistory,
    historyIndex
  ),
  commandList,
  output,
  connections,
});

const actionCreators = {
  switchConsoleTab,
  setCommandList,
  updateConsoleInput,
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
  border: `1px solid ${theme.mixer(0.25)}`,
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
class TerminalConsole extends Component {
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

    if (!this.props.commandList.length) {
      this.loadCommandList();
    }
  }

  /**
   * Loadin all the usable RPC commands
   *
   * @memberof TerminalConsole
   */
  loadCommandList = async () => {
    const result = await RPC.PROMISE('help', []);
    const commandList = result
      .split('\n')
      .filter(c => c !== 'please enable -richlist to use this command')
      .filter(c => !c.startsWith(' ')); // Tritium added some extra comments that are not commands so filter them out
    this.props.setCommandList(commandList);
  };

  // Pass before update values to componentDidUpdate
  /**
   * Before component Did Update
   *
   * @returns
   * @memberof TerminalConsole
   */
  getSnapshotBeforeUpdate() {
    if (!this.outputRef.current) return null;
    const { clientHeight, scrollTop, scrollHeight } = this.outputRef.current;
    return {
      scrollAtBottom: clientHeight + scrollTop === scrollHeight,
    };
  }

  /**
   *
   *
   * @param {*} prevProps
   * @param {*} PrevState
   * @param {*} beforeUpdate
   * @memberof TerminalConsole
   */
  componentDidUpdate(prevProps, PrevState, beforeUpdate) {
    // If the scroll was at the bottom before the DOM is updated
    if (beforeUpdate && beforeUpdate.scrollAtBottom) {
      // Scroll to bottom
      if (this.outputRef.current) {
        const { clientHeight, scrollHeight } = this.outputRef.current;
        this.outputRef.current.scrollTop = scrollHeight - clientHeight;
      }
    }
  }

  /**
   * Execute a Command
   *
   * @memberof TerminalConsole
   */
  execute = async () => {
    const {
      consoleInput,
      executeCommand,
      commandList,
      printCommandOutput,
      printCommandError,
    } = this.props;
    if (!consoleInput || !consoleInput.trim()) return;

    const [cmd, ...chunks] = consoleInput.split(' ');
    executeCommand(consoleInput);
    googleanalytics.SendEvent('Terminal', 'Console', 'UseCommand', 1);
    if (!commandList.some(c => c.includes(cmd))) {
      printCommandError(`\`${cmd}\` is not a valid command`);
      return;
    }

    const args = chunks
      .filter(arg => arg)
      .map(arg => (isNaN(Number(arg)) ? arg : Number(arg)));

    this.inputRef.inputRef.current.blur();

    const tab = ' '.repeat(2);
    let result = null;
    try {
      result = await RPC.PROMISE(cmd, args);
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
      printCommandOutput(tab + result);
    }
  };

  /**
   * Handle Key Down Event
   * @param {*} e
   * @memberof TerminalConsole
   */
  handleKeyDown = e => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.props.commandHistoryDown();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.props.commandHistoryUp();
        break;
      case 'Enter':
        this.execute();
        break;
    }
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof TerminalConsole
   */
  render() {
    const {
      connections,
      commandList,
      consoleInput,
      updateConsoleInput,
      output,
      resetConsoleOutput,
    } = this.props;

    if (connections === undefined) {
      return (
        <WaitingMessage>
          <Text id="transactions.Loading" />
          ...
        </WaitingMessage>
      );
    } else {
      return (
        <TerminalContent>
          <Console>
            <ConsoleInput>
              <Text id="Console.CommandsHere">
                {cch => (
                  <AutoSuggest
                    suggestions={commandList}
                    filterSuggestions={filterCommands}
                    onSelect={updateConsoleInput}
                    keyControl={false}
                    suggestOn="change"
                    ref={c => (this.inputRef = c)}
                    inputRef={this.inputRef}
                    inputProps={{
                      autoFocus: true,
                      skin: 'filled-inverted',
                      value: consoleInput,
                      placeholder: cch,
                      onChange: e => {
                        updateConsoleInput(e.target.value);
                      },
                      onKeyDown: this.handleKeyDown,
                      right: (
                        <ExecuteButton
                          skin="filled-inverted"
                          fitHeight
                          grouped="right"
                          onClick={this.execute}
                        >
                          <Text id="Console.Exe" />
                        </ExecuteButton>
                      ),
                    }}
                  />
                )}
              </Text>
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
              <Text id="Console.ClearConsole" />
            </Button>
          </Console>
        </TerminalContent>
      );
    }
  }
}

export default TerminalConsole;
