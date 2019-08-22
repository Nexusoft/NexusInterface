import * as TYPE from 'consts/actionTypes';

const initialState = false;

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.LEGACY_MODE_ON:
      return true;

    case TYPE.LEGACY_MODE_OFF:
      return false;

    default:
      return state;
  }
};
