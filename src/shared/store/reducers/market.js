import * as TYPE from 'consts/actionTypes';

const initialState = {
  cryptocompare: {},
};
export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_MKT_AVE_DATA:
      return {
        ...state,
        cryptocompare: {
          displayBTCvalues: action.payload.displayBTC,
          rawBTCvalues: action.payload.rawBTC,
          displayNXSvalues: action.payload.displayNXS,
          rawNXSvalues: action.payload.rawNXS,
        },
      };

    default:
      return state;
  }
};
