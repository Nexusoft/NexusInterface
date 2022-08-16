import * as TYPE from 'consts/actionTypes';

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.LOGIN: {
      const { session, username } = action.payload;
      return {
        ...state,
        [session]: {
          username,
          time: Date.now(),
        },
      };
    }

    default:
      return state;
  }
};
