import * as TYPE from 'actions/actiontypes';

const initialState = 'Console';

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SWITCH_CONSOLE_TAB:
      return action.payload;

    default:
      return state;
  }
};
