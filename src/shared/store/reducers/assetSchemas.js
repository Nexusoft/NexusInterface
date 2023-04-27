import * as TYPE from 'consts/actionTypes';

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_ASSET_SCHEMA:
      return {
        ...state,
        [action.payload.address]: action.payload.schema,
      };

    case TYPE.DISCONNECT_CORE:
    case TYPE.CLEAR_USER:
      return initialState;

    default:
      return state;
  }
};
