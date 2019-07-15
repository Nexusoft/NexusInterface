import * as TYPE from './actionTypes';
import { SaveAddressBook } from 'lib/addressBook';

export const addNewContact = contact => (dispatch, getState) => {
  const result = dispatch({
    type: TYPE.ADD_NEW_CONTACT,
    payload: contact,
  });
  const { addressBook } = getState();
  SaveAddressBook(addressBook);
  return result;
};

export const updateContact = (name, contact) => (dispatch, getState) => {
  const result = dispatch({
    type: TYPE.UPDATE_CONTACT,
    payload: { name, contact },
  });
  const { addressBook } = getState();
  SaveAddressBook(addressBook);
  return result;
};

export const deleteContact = name => (dispatch, getState) => {
  const result = dispatch({
    type: TYPE.DELETE_CONTACT,
    payload: name,
  });
  const { addressBook } = getState();
  SaveAddressBook(addressBook);
  return result;
};

export const searchContact = query => ({
  type: TYPE.CONTACT_SEARCH,
  payload: query,
});

export const selectContact = index => ({
  type: TYPE.SELECT_CONTACT,
  payload: index,
});
