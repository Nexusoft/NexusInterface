import * as TYPE from 'consts/actionTypes';

const initialState = {
  blockDate: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.UPDATE_BLOCK_DATE:
      return {
        ...state,
        blockDate: action.payload,
      };

    default:
      return state;
  }
};
