import * as TYPE from 'consts/actionTypes';

const initialState = {
  addressQuery: '',
  operation: null,
  timeSpan: null,
  page: 1,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.UPDATE_TRANSACTIONS_FILTER:
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
};
