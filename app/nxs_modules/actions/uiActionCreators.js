import * as TYPE from './actiontypes';

export const searchContact = query => ({
  type: TYPE.CONTACT_SEARCH,
  payload: query,
});

export const selectContact = index => ({
  type: TYPE.SELECT_CONTACT,
  payload: index,
});

export const switchSettingsTab = tab => ({
  type: TYPE.SWITCH_SETTINGS_TAB,
  payload: tab,
});

export const switchConsoleTab = tab => ({
  type: TYPE.SWITCH_CONSOLE_TAB,
  payload: tab,
});

export const updateConsoleInput = value => ({
  type: TYPE.SET_CONSOLE_INPUT,
  payload: value,
});

export const setCommandList = commandList => ({
  type: TYPE.SET_COMMAND_LIST,
  payload: commandList,
});
