import * as TYPE from 'actions/actiontypes';

const initialState = {
  lastActiveTab: 'Console',
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SWITCH_CONSOLE_TAB:
      return {
        ...state,
        lastActiveTab: action.payload,
      };

    default:
      return state;
  }
};
