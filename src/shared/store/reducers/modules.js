import * as TYPE from 'consts/actionTypes';

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.LOAD_MODULES:
      return action.payload;

    case TYPE.ADD_DEV_MODULE:
      return {
        [action.payload.info.name]: action.payload,
        ...state,
      };

    default:
      return state;
  }
};
