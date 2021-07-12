import * as TYPE from 'consts/actionTypes';

const initialState = {
  accountQuery: '',
  tokenQuery: '',
  operation: null,
  timeSpan: null,
  page: 1,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.UPDATE_TRANSACTIONS_FILTER:
      return {
        ...state,
        filter: {
          ...state.filter,
          ...action.payload,
        },
      };

    default:
      return state;
  }
};
