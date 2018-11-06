import * as TYPE from "../actions/actiontypes";

// These be props! On with the show.
const initialState = {
  //vars go here
  consoleOutput: [],
  coreOutput: [],
  currentInput: "",
  commandList: [],
  autoComplete: [],
  testnum: 99999,
  commandHistory: [],
  currentHistoryIndex: 0,
  filteredCmdList: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_COMMAND_LIST:
      return {
        ...state,
        commandList: [...action.payload]
      };
      break;
    case TYPE.PRINT_TO_CONSOLE:
      var payloadCopy = action.payload;

      for (var i = 0; i < state.consoleOutput.length; i++) {
        payloadCopy.push(state.consoleOutput[i]);
      }
      payloadCopy.push("\n  ");
      return {
        ...state,
        consoleOutput: payloadCopy
      };
      break;

    case TYPE.PRINT_TO_CORE:
      var payloadCopy = [];

      if (state.coreOutput.length < 1000) {
        payloadCopy = [...action.payload, ...state.coreOutput];
      } else if (action.payload.length <= 1) {
        payloadCopy = [...state.coreOutput];
      } else {
        payloadCopy = [...action.payload];
      }

      return {
        ...state,
        coreOutput: payloadCopy
      };
      break;

    case TYPE.RESET_MY_CONSOLE:
      return {
        ...state,
        consoleOutput: []
      };
      break;
    case TYPE.ON_INPUT_FIELD_CHANGE:
      let filteredCmdListTmp = [];
      for (var i = 0; i < state.commandList.length; i++) {
        let element = state.commandList[i];
        if (element.indexOf(action.payload) != -1) {
          if (action.payload != "" && element.startsWith(action.payload)) {
            filteredCmdListTmp.push(element);
          }
        }
      }

      return {
        ...state,
        currentInput: action.payload,
        filteredCmdList: filteredCmdListTmp
      };
      break;
    case TYPE.SET_INPUT_FEILD:
      return {
        ...state,
        currentInput: action.payload
      };
      break;
    case TYPE.ON_AUTO_COMPLETE_CLICK:
      return {
        ...state,
        currentInput: action.payload,
        autoComplete: [],
        filteredCmdList: []
      };
      break;
    case TYPE.RETURN_AUTO_COMPLETE:
      // foreach commandlist starts with current input push into string aray
      // needs commandlist, a copy of the ones that go into it, and a returned array of commandlist that is less.

      //No longer using this as I combined this action with setting input

      let filteredCmdListTmp2 = [];
      for (var i = 0; i < commandList.length; i++) {
        if (commandList[i].indexOf(action.payload) != -1) {
          filteredCmdList2.push(commandList[i]);
        }
      }
      return {
        ...state,
        filteredCmdList: filteredCmdListTmp2
      };
      break;
    case TYPE.REMOVE_AUTO_COMPLETE_DIV:
      return {
        ...state,
        autoComplete: [],
        filteredCmdList: []
      };
      break;
    case TYPE.RECALL_PREVIOUS_COMMAND:
      return {
        ...state,
        commandHistory: action.payload
      };
      break;
    case TYPE.RECALL_NEXT_COMMAND_OR_CLEAR:
      return {
        ...state,
        currentInput: action.payload
      };
      break;
    case TYPE.ADD_TO_HISTORY:
      return {
        ...state,
        commandHistory: [...state.commandHistory, action.payload]
      };
      break;

    default:
      return state;
  }
};

// export const SET_COMMAND_LIST = "SET_COMMAND_LIST";
// export const PRINT_TO_CONSOLE = "PRINT_TO_CONSOLE";
// export const RESET_MY_CONSOLE = "RESET_MY_CONSOLE";
// export const RECALL_PREVIOUS_COMMAND = "RECALL_PREVIOUS_COMMAND";
// export const ON_INPUT_FIELD_CHANGE = "ON_INPUT_FIELD_CHANGE";
// export const SET_INPUT_FEILD = "SET_INPUT_FEILD";
// export const ON_AUTO_COMPLETE_CLICK = "ON_AUTO_COMPLETE_CLICK";
// export const RETURN_AUTO_COMPLETE = "RETURN_AUTO_COMPLETE";
// export const REMOVE_AUTO_COMPLETE_DIV = "REMOVE_AUTO_COMPLETE_DIV";
// export const HANDLE_KEYBOARD_INPUT = "HANDLE_KEYBOARD_INPUT";
// export const RECALL_NEXT_COMMAND_OR_CLEAR = "RECALL_NEXT_COMMAND_OR_CLEAR";
