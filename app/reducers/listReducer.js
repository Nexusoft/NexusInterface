import * as TYPE from "../actiontypes";
import Immutable from "immutable";

const initialState = Immutable.fromJS({
  trustList: []
});

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.GET_TRUST_LIST:
      return state.set("trustList", Immutable.List.of(action.payload));
    default:
      return state;
  }
};
