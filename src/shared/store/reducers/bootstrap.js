import * as TYPE from 'consts/actionTypes';

const initialState = {
  step: 'idle',
  details: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.BOOTSTRAP_STATUS:
      return action.payload;

    default:
      return state;
  }
};
