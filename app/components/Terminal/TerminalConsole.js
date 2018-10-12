import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import { timingSafeEqual } from "crypto";
import * as RPC from "../../script/rpc";

// Added to migrate to Redux
import * as TYPE from "../../actions/actiontypes";
import { connect } from "react-redux";

let currentHistoryIndex = -1;
const mapStateToProps = state => {
  return { ...state.terminal, ...state.common };
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
  componentDidMount() {
    RPC.PROMISE("help", []).then(payload => {
      let CommandList = payload.split("\n");

      this.props.setCommandList(CommandList);
    });
  }

  /// Process Output
  /// Process the consoleoutput and return JSX
  // Called in the renderer so processing what gets put on screen stays here.
  processOutput() {
    // if ( this.props.currentInput != null)
    // {
    //   this.props.currentInput.focus();
    // }
    // let num = 0;
    return this.props.consoleOutput.map((item, key) => {
      // num++;
      return <div key={key}>{item}</div>;
    });
  }

  /// Process Input
  /// Process the input the user types in the rpc command input field
  processInput() {
    /// If Nothing Then just exit
    if (this.props.currentInput == "") {
      return;
    }
    /// This is not a RPC command, so catch this input and clear the console
    if (this.props.currentInput.toLowerCase() == "clear") {
      this.props.resetMyConsole();
      this.props.setInputFeild("");
      return;
    }
    /// remove the command inputed

    /// Get the old console output so we can concat on it.
    let tempConsoleOutput = [...this.props.consoleOutput];

    /// Split the input so that we can get the command and the arguments. THIS MIGHT BE AN ISSUE as I am just checking the US keyboard space
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

    /// Get all the words after the first one and place them into the RPCargs array
    for (let tempindex = 1; tempindex < splitInput.length; tempindex++) {
      let element = splitInput[tempindex];
      /// If this is a number we need to format it an int
      if (element != "" && isNaN(Number(element)) === false) {
        element = parseFloat(element);
      }
      RPCArguments.push(element);
    }

    /// Execute the command with the given args
    if (this.props.commandList.some(function(v){ return v.indexOf(splitInput[0])>=0 }) == true) {
      RPC.PROMISE(splitInput[0], RPCArguments)
        .then(payload => {
          /// If a single object is given back, output it
          if (typeof payload === "string" || typeof payload === "number") {
            if (typeof payload === "string") {
              let temppayload = payload;
              /// If we find there are end line characters then we need to make these line breaks
              temppayload.split("\n").map((item, key) => {
                return tempConsoleOutput.push(item);
              });
              // this is so that you have tha data available to display on the screen
              this.props.printToConsole(tempConsoleOutput);
            } else {
              tempConsoleOutput.push(payload);
              // this is so that you have tha data available to display on the screen
              this.props.printToConsole(tempConsoleOutput);
            }
          }
          /// If it is a object with multi variables then output them on each line
          else {
            for (let outputObject in payload) {
              if (typeof payload[outputObject] === "object") {
                tempConsoleOutput.push(outputObject + ": ");
                // this is so that you have tha data available to display on the screen
                // this.props.printToConsole(tempConsoleOutput);
              } else {
                tempConsoleOutput.push(
                  outputObject + ": " + payload[outputObject]
                );
                // this is so that you have tha data available to display on the screen
                // this.props.printToConsole(tempConsoleOutput);
              }

              //If it is a object then we need to display ever var on a new line.
              if (typeof payload[outputObject] === "object") {
                for (let interalres in payload[outputObject]) {
                  /// Probably need to do this in css but I add a tab to make it look cleaner
                  tempConsoleOutput.push(
                    "       " +
                      interalres +
                      ":" +
                      payload[outputObject][interalres]
                  );
                }
                // this is so that you have tha data available to display on the screen
                // this.props.printToConsole(tempConsoleOutput);
              }
            }
            this.props.printToConsole(tempConsoleOutput);
          }
        })
        .catch(error => {
          /// If there is an error then return that error message and place it in the output.
          this.props.printToConsole(error);
          // tempConsoleOutput.push(error);
          // this.setState(
          //   {
          //     consoleOutput: tempConsoleOutput,
          //     currentInput:""
          //   });
        });
    } else {
      this.props.printToConsole(["Command invalid"]);
    }
  }

  ///Handle enter key being presssed.
  handleKeyboardInput = e => {
    if (e.key === "Enter") {
      this.props.removeAutoCompleteDiv();
      this.processInput();
      currentHistoryIndex = -1;
    }
  };

  handleKeyboardArrows = e => {
    // e.preventDefault();
    // this.props.setInputFeild("arrows being pressed");
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

  /// Return Auto Complete
  autoComplete() {
    return this.props.filteredCmdList.map((item, key) => {
      return (
        <a key={key} onMouseDown={() => this.props.onAutoCompleteClick(item)}>
          {item}
          <br />
        </a>
      );
    });
  }

  render() {
    return (
      <div id="terminal-console">
        <div id="terminal-console-input">
          <input
            id="input-text"
            autoFocus
            type="text"
            value={this.props.currentInput}
            placeholder="Enter console commands here (ex: getinfo, help)"
            onChange={e => this.props.onInputfieldChange(e.target.value)}
            onKeyPress={e => this.handleKeyboardInput(e)}
            onKeyDown={e => this.handleKeyboardArrows(e)}
            // onBlur={this.props.removeAutoCompleteDiv()}
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
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TerminalConsole);
