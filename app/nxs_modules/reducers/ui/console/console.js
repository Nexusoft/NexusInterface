import * as TYPE from 'actions/actiontypes';

const initialState = {
  input: '',
  commandList: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_CONSOLE_INPUT:
      return {
        ...state,
        input: action.payload,
      };

    case TYPE.SET_COMMAND_LIST:
      return {
        ...state,
        commandList: action.payload,
      };

    default:
      return state;
  }
};
