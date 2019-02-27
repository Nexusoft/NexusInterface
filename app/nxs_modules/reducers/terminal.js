import * as TYPE from 'actions/actiontypes';

// These be props! On with the show.
const initialState = {
  //vars go here
  coreOutput: [],
  coreOutputPaused: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.PRINT_TO_CORE:
      var newOutput = [...action.payload, ...state.coreOutput];

      if (newOutput.length > 1000) {
        newOutput = newOutput.slice(0, 1000);
      }

      return {
        ...state,
        coreOutput: newOutput,
      };
      break;

    case TYPE.SET_PAUSE_CORE_OUTPUT:
      return {
        ...state,
        coreOutputPaused: action.payload,
      };
      break;
    default:
      return state;
  }
};
