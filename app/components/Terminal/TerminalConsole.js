// External Dependencies
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { timingSafeEqual } from 'crypto';
import { FormattedMessage } from 'react-intl';
import styled from '@emotion/styled';
import { css } from '@emotion/core';

// Internal Global Dependencies
import WaitingText from 'components/common/WaitingText';
import Button from 'components/common/Button';
import TextBox from 'components/common/TextBox';
import * as RPC from 'scripts/rpc';
import * as TYPE from 'actions/actiontypes';
import { colors, consts, timing } from 'styles';

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

const Console = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

const ConsoleInput = styled.div({
  display: 'flex',
  alignItems: 'stretch',
  marginBottom: '1em',
  position: 'relative',
});

const AutoComplete = styled.div({
  position: 'absolute',
  top: '100%',
  zIndex: 99,
  background: colors.dark,
});

const AutoCompleteItem = styled.a({
  display: 'block',
  cursor: 'pointer',
  color: colors.lightGray,
  transition: `color ${timing.normal}`,

  '&:hover': {
    color: colors.light,
  },
});

const ConsoleOutput = styled.code({
  flexGrow: 1,
  flexBasis: 0,
  backgroundColor: colors.dark,
  border: `1px solid ${colors.darkGray}`,
  overflow: 'auto',
});

class TerminalConsole extends Component {
  constructor(props) {
    super(props);
    this.inputRef = null;
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

    this.props.googleanalytics.SendEvent(
      'Terminal',
      'Console',
      'UseCommand',
      1
    );
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
    console.log(
      this.props.commandList.some(function(v) {
        return v.indexOf(splitInput[0]) >= 0;
      })
    );
    let termConOut = document.getElementById('terminal-console-output');
    /// Execute the command with the given args
    if (
      this.props.commandList.some(function(v) {
        return v.indexOf(splitInput[0]) >= 0;
      })
    ) {
      RPC.PROMISE(splitInput[0], RPCArguments)
        .then(payload => {
          if (typeof payload === 'string' || typeof payload === 'number') {
            if (typeof payload === 'string') {
              let temppayload = payload;
              temppayload.split('\n').map((item, key) => {
                return tempConsoleOutput.push(item);
              });
              this.props.printToConsole(tempConsoleOutput);
              termConOut.scrollTop = termConOut.scrollHeight;
            } else {
              tempConsoleOutput.push(payload);
              this.props.printToConsole(tempConsoleOutput);
              termConOut.scrollTop = termConOut.scrollHeight;
            }
          } else {
            for (let outputObject in payload) {
              if (typeof payload[outputObject] === 'object') {
                tempConsoleOutput.push(outputObject + ': ');
              } else {
                tempConsoleOutput.push(
                  '       ' + outputObject + ': ' + payload[outputObject]
                );
              }

              if (typeof payload[outputObject] === 'object') {
                for (let interalres in payload[outputObject]) {
                  if (typeof payload[outputObject][interalres] === 'object') {
                    for (let internalmicro in payload[outputObject][
                      interalres
                    ]) {
                      tempConsoleOutput.push(
                        '       ' +
                          internalmicro +
                          ':' +
                          payload[outputObject][interalres][internalmicro]
                      );
                    }
                  } else {
                    tempConsoleOutput.push(
                      '       ' +
                        interalres +
                        ':' +
                        payload[outputObject][interalres]
                    );
                  }
                }
              }
            }
            this.props.printToConsole(tempConsoleOutput);
            termConOut.scrollTop = termConOut.scrollHeight;
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
              tempConsoleOutput.push(error.error.message);
            } catch (e) {
              tempConsoleOutput.push(error);
            }
          }
          this.props.printToConsole(tempConsoleOutput);
          termConOut.scrollTop = termConOut.scrollHeight;
        });
    } else {
      tempConsoleOutput.push([
        this.props.currentInput + ' is a invalid Command',
      ]);
      // tempConsoleOutput.push(['\n  '])
      this.props.printToConsole(tempConsoleOutput);
      termConOut.scrollTop = termConOut.scrollHeight;
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
              //I don't like this but the issue is that the click event fires on the output div which breaks the focus, so using a timer
              this.inputRef.focus();
            }, 100);
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
        <WaitingText>
          <FormattedMessage
            id="transactions.Loading"
            defaultMessage="transactions.Loading"
          />
          ...
        </WaitingText>
      );
    } else {
      return (
        <Console>
          <ConsoleInput>
            <FormattedMessage
              id="Console.CommandsHere"
              defaultMessage="Enter console commands here (ex: getinfo, help)"
            >
              {cch => (
                <TextBox
                  ref={element => (this.inputRef = element)}
                  autoFocus
                  grouped="left"
                  value={this.props.currentInput}
                  placeholder={cch}
                  onChange={e => this.props.onInputfieldChange(e.target.value)}
                  onKeyPress={e => this.handleKeyboardInput(e)}
                  onKeyDown={e => this.handleKeyboardArrows(e)}
                />
              )}
            </FormattedMessage>
            <Button
              filled
              primary
              freeHeight
              grouped="right"
              onClick={() => {
                this.props.removeAutoCompleteDiv();
                this.processInput();
              }}
            >
              <FormattedMessage id="Console.Exe" defaultMessage="Execute" />
            </Button>
            <AutoComplete key="autocomplete">
              {this.autoComplete()}
            </AutoComplete>
          </ConsoleInput>

          <ConsoleOutput ref={el => (this.outputRef = el)}>
            {this.processOutput()}
          </ConsoleOutput>

          <Button
            filled
            darkGray
            grouped="bottom"
            onClick={this.props.resetMyConsole}
          >
            <FormattedMessage
              id="Console.ClearConsole"
              defaultMessage="Clear Console"
            />
          </Button>
        </Console>
      );
    }
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TerminalConsole);
