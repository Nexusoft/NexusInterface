import * as TYPE from 'actions/actiontypes';

// import { intlReducer } from "react-intl-redux";
const initialState = {
  defaultLocale: 'en',

  // messages: messages
};
export default (state = initialState, action) => {
  switch (action.type) {
    // case TYPE.UPDATE_LOCALES:
    //   return {
    //     ...state,
    //     locale: state.tempStorage,
    //   };
    //   break;
    // case TYPE.SWITCH_LOCALES:
    //   return {
    //     ...state,
    //     tempStorage: action.payload,
    //   };
    //   break;
    default:
      return state;
  }
};
