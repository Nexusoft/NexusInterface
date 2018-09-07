import * as TYPE from "../actions/actiontypes";

// These be props! On with the show.
const initialState = {
  //vars go here
  consoleOutput: [],
  currentInput: "",
  inputfield: null,
  commandList:[],
  autoComplete:[],
  testnum: 99999,
  commandHistory:[]
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_COMMAND_LIST:
      return {
        ...state,
        commandList: [...action.payload]
      };
    case TYPE.PRINT_TO_CONSOLE:
      var payloadCopy = action.payload;
      for(var i; i < state.consoleOutput.length; i++) { 
        payloadCopy.push(state.consoleOutput[i]);
      }
      return {
        ...state,
        consoleOutput: payloadCopy
      };
    case TYPE.RESET_MY_CONSOLE:
      return {
        ...state,
        consoleOutput : []
      };
    default:
      return state;
  }
};
