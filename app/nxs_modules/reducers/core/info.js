import * as TYPE from 'actions/actiontypes';

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.GET_INFO:
      return action.payload;

    case TYPE.CLEAR_CORE_INFO:
      return initialState;

    default:
      return state;
  }
};
