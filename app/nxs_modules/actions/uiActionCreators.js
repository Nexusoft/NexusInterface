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
