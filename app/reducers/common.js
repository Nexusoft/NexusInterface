import * as TYPE from "../actiontypes";
import Immutable from "immutable";

const initialState = Immutable.fromJS({
  getinfo: {}
});

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.GET_INFO_DUMP:
      return state.set("getinfo", action.payload);
    default:
      return state;
  }
};
