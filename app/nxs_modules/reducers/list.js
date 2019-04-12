import * as TYPE from 'actions/actiontypes';

const initialState = {
  acc: true,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.GET_TRUST_LIST:
      console.log(action.payload);
      return {
        ...state,
        trustlist: [...action.payload],
      };
      break;
    case TYPE.TOGGLE_SORT_DIRECTION:
      return {
        ...state,
        acc: !state.acc,
      };
      break;
    default:
      return state;
  }
};
