import * as TYPE from 'consts/actionTypes';

const initialState = [];

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.MY_ACCOUNTS_LIST:
      return action.payload;

    case TYPE.UPDATE_MY_ACCOUNTS:
      const updatedState = Object.keys(action.payload).map((e, index) => {
        if (state[index].account === e) {
          return {
            ...state[index],
            balance: action.payload[e],
          };
        } else {
          //if for any reason they are not in the same order search
          const find = state.find((stateE) => {
            return e === stateE.account;
          });
          return {
            ...find,
            balance: action.payload[e],
          };
        }
      });
      return updatedState;
    default:
      return state;
  }
};
