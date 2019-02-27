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
import TextField from 'components/TextField';
import AutoSuggest from 'components/AutoSuggest';
import * as RPC from 'scripts/rpc';
import * as TYPE from 'actions/actiontypes';
import {
  switchConsoleTab,
  updateConsoleInput,
  setCommandList,
  commandHistoryUp,
  commandHistoryDown,
  executeCommand,
  printCommandOutput,
  printCommandError,
} from 'actions/uiActionCreators';
import { consts, timing } from 'styles';

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
        },
      },
    },
  } = state;
  return {
    ...state.terminal,
    ...state.common,
    ...state.overview,
    consoleInput: consoleInputSelector(
      currentCommand,
      commandHistory,
      historyIndex
    ),
    commandList,
    output,
  };
};
const mapDispatchToProps = dispatch => ({
  setCommandList: commandList => dispatch(setCommandList(commandList)),
  updateConsoleInput: value => dispatch(updateConsoleInput(value)),
  commandHistoryUp: () => dispatch(commandHistoryUp()),
  commandHistoryDown: () => dispatch(commandHistoryDown()),
  executeCommand: cmd => dispatch(executeCommand(cmd)),
  printCommandOutput: output => dispatch(printCommandOutput(output)),
  printCommandOutput: msg => dispatch(printCommandOutput(msg)),
  printToConsole: consoleOutput =>
    dispatch({ type: TYPE.PRINT_TO_CONSOLE, payload: consoleOutput }),
  resetMyConsole: () => dispatch({ type: TYPE.RESET_MY_CONSOLE }),
  onInputfieldChange: consoleInput =>
    dispatch({ type: TYPE.ON_INPUT_FIELD_CHANGE, payload: consoleInput }),
  setInputFeild: input =>
    dispatch({ type: TYPE.SET_INPUT_FEILD, payload: input }),
  onAutoCompleteClick: inItem =>
    dispatch({ type: TYPE.ON_AUTO_COMPLETE_CLICK, payload: inItem }),
  //returnAutocomplete: (currentInput) => dispatch({type:TYPE.RETURN_AUTO_COMPLETE, payload: currentInput}), //No longer using
  removeAutoCompleteDiv: () =>
    dispatch({ type: TYPE.REMOVE_AUTO_COMPLETE_DIV }),
  recallPreviousCommand: currentCommandItem =>
    dispatch({
      type: TYPE.RECALL_PREVIOUS_COMMAND,
      payload: currentCommandItem,
    }),
  recallNextCommandOrClear: currentCommandItem =>
    dispatch({
      type: TYPE.RECALL_NEXT_COMMAND_OR_CLEAR,
      payload: currentCommandItem,
    }),
  addToHistory: currentCommandItem =>
    dispatch({ type: TYPE.ADD_TO_HISTORY, payload: currentCommandItem }),
  switchConsoleTab: tab => dispatch(switchConsoleTab(tab)),
  // handleKeyboardInput: (key) => dispatch({type:TYPE.HANDLE_KEYBOARD_INPUT, payload: key})
});

const TerminalContent = styled.div({
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: 0,
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

const AutoComplete = styled.div(({ theme }) => ({
  position: 'absolute',
  top: '100%',
  zIndex: 99,
  background: theme.background,
}));

const AutoCompleteItem = styled.a(({ theme }) => ({
  display: 'block',
  cursor: 'pointer',
  transition: `color ${timing.normal}`,
  color: theme.mixer(0.75),

  '&:hover': {
    color: theme.foreground,
  },
}));

const ConsoleOutput = styled.code(({ theme }) => ({
  flexGrow: 1,
  flexBasis: 0,
  fontSize: '75%',
  overflow: 'auto',
  wordBreak: 'break-all',
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
   *
   *
   * @memberof TerminalConsole
   */
  loadCommandList = async () => {
    const result = await RPC.PROMISE('help', []);
    const commandList = result.split('\n');
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
    if (!this.outputRef) return null;
    const { clientHeight, scrollTop, scrollHeight } = this.outputRef;
    return {
      scrollAtBottom: clientHeight + scrollTop === scrollHeight,
    };
  }

  componentDidUpdate(prevProps, PrevState, beforeUpdate) {
    // If the scroll was at the bottom before the DOM is updated
    if (beforeUpdate && beforeUpdate.scrollAtBottom) {
      // Scroll to bottom
      if (this.outputRef) {
        const { clientHeight, scrollHeight } = this.outputRef;
        this.outputRef.scrollTop = scrollHeight - clientHeight;
      }
    }
  }

  // Class Methods
  /**
   * Process Output
   *
   * @returns
   * @memberof TerminalConsole
   */
  processOutput() {
    return this.props.consoleOutput.map((item, key) => {
      return <div key={key}>{item}</div>;
    });
  }

  renderOutputCommand = command => (
    <span>
      <span style={{ color: '#0ca4fb' }}>{'Nexus-Core'}</span>
      <span style={{ color: '#00d850' }}>{'$ '}</span>
      {command}
      <span style={{ color: '#0ca4fb' }}>{' >'}</span>
    </span>
  );

  /**
   *
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
    if (!commandList.some(c => c.includes(cmd))) {
      printCommandError(`\`${cmd}\` is not a valid command`);
      return;
    }

    executeCommand(consoleInput);
    googleanalytics.SendEvent('Terminal', 'Console', 'UseCommand', 1);

    const args = [];
    chunks.forEach(arg => {
      if (arg) {
        if (!isNaN(parseFloat(arg))) {
          args.push(parseFloat(arg));
        } else {
          args.push(arg);
        }
      }
    });

    const tab = ' '.repeat(7);
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
      printCommandOutput(result.split('\n').map(text => tab + text));
    } else {
      printCommandOutput(result);
    }
  };

  /**
   * Handle keyboard input
   *
   * @memberof TerminalConsole
   */
  handleKeyboardInput = e => {
    if (e.key === 'Enter') {
      this.props.removeAutoCompleteDiv();
      this.processInput();
      currentHistoryIndex = -1;
    }
  };

  /**
   *
   *
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
   * Return Autocomplete
   *
   * @returns
   * @memberof TerminalConsole
   */
  autoComplete() {
    return this.props.filteredCmdList.map((item, key) => {
      return (
        <AutoCompleteItem
          key={key}
          onMouseDown={() => {
            setTimeout(() => {
              this.inputRef.current.focus();
            }, 0);
            this.props.onAutoCompleteClick(item);
          }}
        >
          {item}
          <br />
        </AutoCompleteItem>
      );
    });
  }

  // Mandatory React method
  /**
   * React Render
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
                    onSelect={updateConsoleInput}
                    keyControl={false}
                    suggestOn="change"
                    inputRef={this.inputRef}
                    inputProps={{
                      autoFocus: true,
                      skin: 'filled-dark',
                      value: consoleInput,
                      placeholder: cch,
                      onChange: e => {
                        updateConsoleInput(e.target.value);
                      },
                      onKeyDown: this.handleKeyDown,
                      right: (
                        <ExecuteButton
                          skin="filled-dark"
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

            <ConsoleOutput ref={el => (this.outputRef = el)}>
              {output.map(({ type, content }) => {
                switch (type) {
                  case 'command':
                    return (
                      <div>
                        <span>
                          <span style={{ color: '#0ca4fb' }}>Nexus-Core</span>
                          <span style={{ color: '#00d850' }}>$ </span>
                          {content}
                          <span style={{ color: '#0ca4fb' }}> ></span>
                        </span>
                      </div>
                    );
                  case 'text':
                    return <div>{content}</div>;
                  case 'error':
                    return <div className="error">{content}</div>;
                }
              })}
            </ConsoleOutput>

            <Button
              skin="filled-dark"
              grouped="bottom"
              onClick={this.props.resetMyConsole}
            >
              <Text id="Console.ClearConsole" />
            </Button>
          </Console>
        </TerminalContent>
      );
    }
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TerminalConsole);
