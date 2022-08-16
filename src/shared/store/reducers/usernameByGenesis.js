import * as TYPE from 'consts/actionTypes';

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.LOGIN: {
      const { genesis, username } = action.payload;
      return {
        ...state,
        [genesis]: username,
      };
    }

    default:
      return state;
  }
};
