import { LoadTheme, UpdateTheme, ResetColors } from 'api/theme';
import * as TYPE from './actiontypes';

export const loadThemeFromFile = () => dispatch => {
  const theme = LoadTheme();
  dispatch({ type: TYPE.UPDATE_THEME, payload: theme });
};

export const updateTheme = updates => dispatch => {
  dispatch({ type: TYPE.UPDATE_THEME, payload: updates });
  UpdateTheme(updates);
};

export const resetColors = () => dispatch => {
  dispatch({ type: TYPE.RESET_COLORS });
  ResetColors();
};
