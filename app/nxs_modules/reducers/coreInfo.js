import * as TYPE from 'actions/actiontypes';

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.GET_INFO_DUMP:
      return action.payload;

    default:
      return state;
  }
};
