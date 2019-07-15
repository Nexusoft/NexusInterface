import * as TYPE from 'consts/actionTypes';

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.UPDATE_MODULE_STATE:
      return {
        ...state,
        [action.payload.moduleName]: action.payload.moduleState,
      };

    default:
      return state;
  }
};
