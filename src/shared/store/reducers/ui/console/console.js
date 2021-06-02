import * as TYPE from 'consts/actionTypes';

const initialState = {
  currentCommand: '',
  currentTritiumCommand: '',
  historyIndex: -1,
  commandList: [],
  commandHistory: [],
  output: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_CONSOLE_INPUT:
      return {
        ...state,
        currentCommand: action.payload,
        historyIndex: initialState.historyIndex,
      };
    case TYPE.SET_COMMAND_LIST:
      return {
        ...state,
        commandList: action.payload,
      };

    case TYPE.COMMAND_HISTORY_UP:
      return state.historyIndex < state.commandHistory.length - 1
        ? {
            ...state,
            historyIndex: state.historyIndex + 1,
            currentCommand: state.commandHistory[state.historyIndex + 1] || '',
          }
        : state;

    case TYPE.COMMAND_HISTORY_DOWN:
      return state.historyIndex > -1
        ? {
            ...state,
            historyIndex: state.historyIndex - 1,
            currentCommand: state.commandHistory[state.historyIndex - 1] || '',
          }
        : state;

    case TYPE.EXECUTE_COMMAND:
      return {
        ...state,
        historyIndex: initialState.historyIndex,
        currentCommand: initialState.currentCommand,
        commandHistory: [action.payload, ...state.commandHistory],
        output: [...state.output, { type: 'command', content: action.payload }],
      };

    case TYPE.PRINT_COMMAND_OUTPUT: {
      const newOutput = Array.isArray(action.payload)
        ? action.payload.map((content) => ({
            type: 'text',
            content,
          }))
        : [{ type: 'text', content: action.payload }];
      return {
        ...state,
        output: [...state.output, ...newOutput],
      };
    }

    case TYPE.PRINT_COMMAND_ERROR: {
      return {
        ...state,
        output: [...state.output, { type: 'error', content: action.payload }],
      };
    }

    case TYPE.RESET_CONSOLE:
      return {
        ...state,
        output: initialState.output,
        commandHistory: [],
        historyIndex: -1,
      };

    default:
      return state;
  }
};
