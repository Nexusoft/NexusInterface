import * as TYPE from 'consts/actionTypes';

const initialState = { showAdvanced: false };

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.TOGGLE_SHOW_ADVANCED_SEND: {
      return {
        ...state,
        showAdvanced: !state.showAdvanced,
      };
    }

    default:
      return state;
  }
};
