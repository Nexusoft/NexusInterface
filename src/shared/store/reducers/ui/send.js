import * as TYPE from 'consts/actionTypes';

const initialState = { advancedOptions: false };

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.TOGGLE_ADVANCED_SEND_OPTIONS: {
      return {
        ...state,
        advancedOptions: !state.advancedOptions,
      };
    }

    default:
      return state;
  }
};
