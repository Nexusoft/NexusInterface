import * as TYPE from 'actions/actiontypes';
import { defaultTheme } from 'api/theme';

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.UPDATE_THEME:
      return {
        ...state,
        ...action.payload,
      };
    case TYPE.RESET_COLORS:
      return {
        ...defaultTheme,
        wallpaper: state.wallpaper,
      };
    default:
      return state;
  }
};
