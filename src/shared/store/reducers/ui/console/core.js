import * as TYPE from 'consts/actionTypes';

const initialState = {
  output: [],
  paused: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.PRINT_CORE_OUTPUT:
      var newOutput = [...action.payload, ...state.output];

      if (newOutput.length > 1000) {
        newOutput = newOutput.slice(0, 1000);
      }

      return {
        ...state,
        output: newOutput,
      };

    case TYPE.PAUSE_CORE_OUTPUT:
      return {
        ...state,
        paused: true,
      };

    case TYPE.UNPAUSE_CORE_OUTPUT:
      return {
        ...state,
        paused: false,
      };
    case TYPE.CLEAR_CORE_OUTPUT:
      return {
        ...state,
        output: [],
      };

    default:
      return state;
  }
};
