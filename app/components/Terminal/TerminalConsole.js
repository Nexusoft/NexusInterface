/*
  Title: Terminal Console page
  Description: 
  Last Modified by: Brian Smith
*/
// External Dependencies
import { connect } from "react-redux";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { timingSafeEqual } from "crypto";

// Internal Dependencies
import styles from "./style.css";
import * as RPC from "../../script/rpc";
import * as TYPE from "../../actions/actiontypes";

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
      payload: currentCommandItem
    }),
  recallNextCommandOrClear: currentCommandItem =>
    dispatch({
      type: TYPE.RECALL_NEXT_COMMAND_OR_CLEAR,
      payload: currentCommandItem
    }),
  addToHistory: currentCommandItem =>
    dispatch({ type: TYPE.ADD_TO_HISTORY, payload: currentCommandItem })
  // handleKeyboardInput: (key) => dispatch({type:TYPE.HANDLE_KEYBOARD_INPUT, payload: key})
});

class TerminalConsole extends Component {
  constructor(props) {
    super(props);
    this.inputRef = null;
  }
  // React Method (Life cycle hook)
  componentDidMount() {
    RPC.PROMISE("help", []).then(payload => {
      let CommandList = payload.split("\n");
      this.props.setCommandList(CommandList);
    });
  }

  // Class Methods
  processOutput() {
    return this.props.consoleOutput.map((item, key) => {
      return <div key={key}>{item}</div>;
    });
  }

  processInput() {
    if (this.props.currentInput == "") {
      return;
    }
    if (this.props.currentInput.toLowerCase() == "clear") {
      this.props.resetMyConsole();
      this.props.setInputFeild("");
      return;
    }

    this.props.googleanalytics.SendEvent(
      "Terminal",
      "Console",
      "UseCommand",
      1
    );

    let tempConsoleOutput = [...this.props.consoleOutput];
    let splitInput = this.props.currentInput.split(" ");
    let preSanatized = splitInput[0].replace(/[^a-zA-Z0-9]/g, "");
    splitInput[0] = preSanatized;

    for (let index = 1; index < splitInput.length; index++) {
      //splitInput[index] = splitInput[index].replace(/['"`]/g,"");
    }

    //console.log(splitInput);
    /// this is the argument array
    let RPCArguments = [];
    this.props.addToHistory(splitInput[0]);
    this.props.setInputFeild("");

    for (let tempindex = 1; tempindex < splitInput.length; tempindex++) {
      let element = splitInput[tempindex];
      /// If this is a number we need to format it an int
      if (element != "" && isNaN(Number(element)) === false) {
        element = parseFloat(element);
      }
      RPCArguments.push(element);
    }

    /// Execute the command with the given args
    if (
      this.props.commandList.some(function(v) {
        return v.indexOf(splitInput[0]) >= 0;
      }) == true
    ) {
      RPC.PROMISE(splitInput[0], RPCArguments)
        .then(payload => {
          if (typeof payload === "string" || typeof payload === "number") {
            if (typeof payload === "string") {
              let temppayload = payload;
              temppayload.split("\n").map((item, key) => {
                return tempConsoleOutput.push(item);
              });
              this.props.printToConsole(tempConsoleOutput);
            } else {
              tempConsoleOutput.push(payload);
              this.props.printToConsole(tempConsoleOutput);
            }
          } else {
            for (let outputObject in payload) {
              if (typeof payload[outputObject] === "object") {
                tempConsoleOutput.push(outputObject + ": ");
              } else {
                tempConsoleOutput.push(
                  outputObject + ": " + payload[outputObject]
                );
              }

              if (typeof payload[outputObject] === "object") {
                for (let interalres in payload[outputObject]) {
                  tempConsoleOutput.push(
                    "       " +
                      interalres +
                      ":" +
                      payload[outputObject][interalres]
                  );
                }
              }
            }
            this.props.printToConsole(tempConsoleOutput);
          }
        })
        .catch(error => {
          tempConsoleOutput.push([error]);
          this.props.printToConsole(tempConsoleOutput);
        });
    } else {
      tempConsoleOutput.push([
        this.props.currentInput + " is a Command invalid"
      ]);
      this.props.printToConsole(tempConsoleOutput);
    }
  }

  handleKeyboardInput = e => {
    if (e.key === "Enter") {
      this.props.removeAutoCompleteDiv();
      this.processInput();
      currentHistoryIndex = -1;
    }
  };

  handleKeyboardArrows = e => {
    if (e.key === "ArrowUp") {
      currentHistoryIndex++;

      if (this.props.commandHistory[currentHistoryIndex]) {
        this.props.setInputFeild(
          this.props.commandHistory[currentHistoryIndex]
        );
      } else {
        this.props.setInputFeild("");
        currentHistoryIndex = -1;
      }
    } else if (e.key === "ArrowDown") {
      currentHistoryIndex--;
      if (currentHistoryIndex <= -1) {
        currentHistoryIndex = -1;
        this.props.setInputFeild("");
      } else {
        this.props.setInputFeild(
          this.props.commandHistory[currentHistoryIndex]
        );
      }
    } else if (e.key === "ArrowRight") {
    }
  };

  autoComplete() {
    return this.props.filteredCmdList.map((item, key) => {
      return (
        <a
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
        </a>
      );
    });
  }

  // Mandatory React method
  render() {
    if (this.props.connections === undefined) {
      return <h2>Please wait for the daemon to load</h2>;
    } else {
      return (
        <div id="terminal-console">
          <div id="terminal-console-input">
            <input
              id="input-text"
              ref={element => (this.inputRef = element)}
              autoFocus
              type="text"
              value={this.props.currentInput}
              placeholder="Enter console commands here (ex: getinfo, help)"
              onChange={e => this.props.onInputfieldChange(e.target.value)}
              onKeyPress={e => this.handleKeyboardInput(e)}
              onKeyDown={e => this.handleKeyboardArrows(e)}
            />
            <button
              id="input-submit"
              className="button primary"
              value="Execute"
              onClick={() => this.processInput()}
            >
              Execute
            </button>

            <div
              key="autocomplete"
              style={{
                position: "absolute",
                top: "100%",
                zIndex: 99,
                background: "black"
              }}
            >
              {this.autoComplete()}{" "}
            </div>
          </div>

          <div id="terminal-console-output">{this.processOutput()}</div>

          <button
            id="terminal-console-reset"
            className="button"
            onClick={() => this.props.resetMyConsole()}
          >
            Clear Console
          </button>
        </div>
      );
    }
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TerminalConsole);
