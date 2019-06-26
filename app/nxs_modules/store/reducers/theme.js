import * as TYPE from 'actions/actiontypes';
import { filterValidTheme } from 'api/theme';

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.UPDATE_THEME:
      return { ...state, ...filterValidTheme(action.payload) };
    case TYPE.RESET_COLORS:
      const theme = { ...state };
      delete theme.background;
      delete theme.foreground;
      delete theme.primary;
      delete theme.primaryAccent;
      delete theme.danger;
      delete theme.dangerAccent;
      delete theme.globeColor;
      delete theme.globePillarColor;
      delete theme.globeArchColor;

      return theme;
    default:
      return state;
  }
};
