import { UpdateTheme, ResetColors } from 'lib/theme';
import * as TYPE from './actiontypes';

export const updateTheme = updates => dispatch => {
  dispatch({ type: TYPE.UPDATE_THEME, payload: updates });
  UpdateTheme(updates);
};

export const resetColors = () => dispatch => {
  dispatch({ type: TYPE.RESET_COLORS });
  ResetColors();
};
