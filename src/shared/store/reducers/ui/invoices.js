import * as TYPE from 'consts/actionTypes';

const initialState = {
  referenceQuery: '',
  status: null,
  timeSpan: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_INVOICE_REFERENCE_QUERY:
      return {
        ...state,
        referenceQuery: action.payload,
      };

    case TYPE.SET_INVOICE_STATUS_FILTER:
      return {
        ...state,
        status: action.payload,
      };

    case TYPE.SET_INVOICE_TIME_FILTER:
      return {
        ...state,
        timeSpan: action.payload,
      };

    default:
      return state;
  }
};
