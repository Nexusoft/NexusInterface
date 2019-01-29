// External Dependencies
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { timingSafeEqual } from 'crypto';
import Text from 'components/Text';
import styled from '@emotion/styled';
import { css } from '@emotion/core';
import googleanalytics from 'scripts/googleanalytics';

// Internal Global Dependencies
import WaitingMessage from 'components/WaitingMessage';
import Button from 'components/Button';
import TextField from 'components/TextField';
import * as RPC from 'scripts/rpc';
import * as TYPE from 'actions/actiontypes';
import { consts, timing } from 'styles';

let currentHistoryIndex = -1;

// React-Redux mandatory methods
const mapStateToProps = state => {
  return { ...state.terminal, ...state.common, ...state.overview };
};
const mapDispatchToProps = dispatch => ({
  setCommandList: commandList =>
    dispatch({ type: TYPE.SET_COMMAND_LIST, payload: commandList }),
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
  overflow: 'auto',
  wordBreak: 'break-all',
  background: theme.background,
  border: `1px solid ${theme.mixer(0.25)}`,
}));

const ExecuteButton = styled(Button)(({ theme }) => ({
  borderLeft: `1px solid ${theme.mixer(0.125)}`,
}));

class TerminalConsole extends Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.outputRef = React.createRef();
  }
  // React Method (Life cycle hook)
  componentDidMount() {
    RPC.PROMISE('help', []).then(payload => {
      let CommandList = payload.split('\n');
      this.props.setCommandList(CommandList);
    });
  }

  // Pass before update values to componentDidUpdate
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
      const { clientHeight, scrollHeight } = this.outputRef;
      this.outputRef.scrollTop = scrollHeight - clientHeight;
    }
  }

  // Class Methods
  processOutput() {
    return this.props.consoleOutput.map((item, key) => {
      return <div key={key}>{item}</div>;
    });
  }

  processInput() {
    if (this.props.currentInput == '') {
      return;
    }
    if (this.props.currentInput.toLowerCase() == 'clear') {
      this.props.resetMyConsole();
      this.props.setInputFeild('');
      return;
    }

    googleanalytics.SendEvent('Terminal', 'Console', 'UseCommand', 1);
    //
    let tempConsoleOutput = [...this.props.consoleOutput];
    let splitInput = this.props.currentInput.split(' ');

    let daemonInputMessage = (
      <span>
        <span style={{ color: '#0ca4fb' }}>{'Nexus-Core'}</span>
        <span style={{ color: '#00d850' }}>{'$ '}</span>
        {this.props.currentInput}
        <span style={{ color: '#0ca4fb' }}>{' >'}</span>
      </span>
    );
    tempConsoleOutput.push(daemonInputMessage);

    /// this is the argument array
    let RPCArguments = [];
    this.props.addToHistory(this.props.currentInput);
    this.props.setInputFeild('');

    for (let tempindex = 1; tempindex < splitInput.length; tempindex++) {
      let element = splitInput[tempindex];
      /// If this is a number we need to format it an int
      if (element != '' && isNaN(Number(element)) === false) {
        element = parseFloat(element);
      }
      RPCArguments.push(element);
    }

    // let termConOut = document.getElementById('terminal-console-output');
    /// Execute the command with the given args
    if (
      this.props.commandList.some(function(v) {
        return v.indexOf(splitInput[0]) >= 0;
      })
    ) {
      RPC.PROMISE(splitInput[0], RPCArguments)
        .then(payload => {
          console.log(payload);
          if (typeof payload === 'string' || typeof payload === 'number') {
            if (typeof payload === 'string') {
              let temppayload = payload;

              temppayload.split('\n').map((item, key) => {
                return tempConsoleOutput.push('       ' + item);
              });

              this.props.printToConsole(tempConsoleOutput);
              // // termConOut.scrollTop = termConOut.scrollHeight;
            } else {
              tempConsoleOutput.push(payload);
              this.props.printToConsole(tempConsoleOutput);
              // // termConOut.scrollTop = termConOut.scrollHeight;
            }
          } else {
            function tabMaker(y) {
              let count = y;
              let tempTab = '';
              while (count != 0) {
                tempTab += '       ';
                count--;
              }
              return tempTab;
            }
            function outputLoop(incomingObj, numOfTabs) {
              var keys = Object.keys(incomingObj);
              if (true) {
                if (keys.length) {
                  return keys.forEach(aElement => {
                    if (typeof incomingObj[aElement] === 'object') {
                      tempConsoleOutput.push(
                        tabMaker(numOfTabs) + aElement + ':'
                      );
                      outputLoop(incomingObj[aElement], numOfTabs + 1);
                    } else {
                      tempConsoleOutput.push(
                        tabMaker(numOfTabs) +
                          aElement +
                          ':' +
                          incomingObj[aElement]
                      );
                    }
                  });
                }
              }
            }
            outputLoop(payload, 1);

            this.props.printToConsole(tempConsoleOutput);
            // // termConOut.scrollTop = termConOut.scrollHeight;
          }
        })
        .catch(error => {
          console.log(error);
          if (error.message !== undefined) {
            tempConsoleOutput.push(
              'Error: ' +
                [error.error.message] +
                '(errorcode ' +
                error.error.code +
                ')'
            );
          } else {
            //This is the error if the rpc is unavailable
            try {
              tempConsoleOutput.push('       ' + error.error.message);
            } catch (e) {
              tempConsoleOutput.push('       ' + error);
            }
          }
          this.props.printToConsole(tempConsoleOutput);
          // // termConOut.scrollTop = termConOut.scrollHeight;
        });
    } else {
      tempConsoleOutput.push([
        '       ' + this.props.currentInput + ' is a invalid Command',
      ]);
      // tempConsoleOutput.push(['\n  '])
      this.props.printToConsole(tempConsoleOutput);
      // // termConOut.scrollTop = termConOut.scrollHeight;
    }
  }

  handleKeyboardInput = e => {
    if (e.key === 'Enter') {
      this.props.removeAutoCompleteDiv();
      this.processInput();
      currentHistoryIndex = -1;
    }
  };

  handleKeyboardArrows = e => {
    if (e.key === 'ArrowUp') {
      currentHistoryIndex++;

      if (this.props.commandHistory[currentHistoryIndex]) {
        this.props.setInputFeild(
          this.props.commandHistory[currentHistoryIndex]
        );
      } else {
        this.props.setInputFeild('');
        currentHistoryIndex = -1;
      }
    } else if (e.key === 'ArrowDown') {
      currentHistoryIndex--;
      if (currentHistoryIndex <= -1) {
        currentHistoryIndex = -1;
        this.props.setInputFeild('');
      } else {
        this.props.setInputFeild(
          this.props.commandHistory[currentHistoryIndex]
        );
      }
    } else if (e.key === 'ArrowRight') {
    }
  };

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
  render() {
    if (this.props.connections === undefined) {
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
                  <TextField
                    inputRef={this.inputRef}
                    autoFocus
                    skin="filled-dark"
                    value={this.props.currentInput}
                    placeholder={cch}
                    onChange={e =>
                      this.props.onInputfieldChange(e.target.value)
                    }
                    onKeyPress={e => this.handleKeyboardInput(e)}
                    onKeyDown={e => this.handleKeyboardArrows(e)}
                    style={{ flexGrow: 1 }}
                    right={
                      <ExecuteButton
                        skin="filled-dark"
                        fitHeight
                        grouped="right"
                        onClick={() => {
                          this.props.removeAutoCompleteDiv();
                          this.processInput();
                        }}
                      >
                        <Text id="Console.Exe" />
                      </ExecuteButton>
                    }
                  />
                )}
              </Text>

              <AutoComplete key="autocomplete">
                {this.autoComplete()}
              </AutoComplete>
            </ConsoleInput>

            <ConsoleOutput ref={el => (this.outputRef = el)}>
              {this.processOutput()}
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
