import React from 'react';
import * as TYPE from './actiontypes';
import * as RPC from 'scripts/rpc';
import UIController from 'components/UIController';

export const addNewContact = contact => ({
  type: TYPE.ADD_NEW_CONTACT,
  payload: contact,
});

export const updateContact = (name, contact) => ({
  type: TYPE.UPDATE_CONTACT,
  payload: { name, contact },
});

export const searchContact = query => ({
  type: TYPE.CONTACT_SEARCH,
  payload: query,
});

export const deleteContact = name => ({
  type: TYPE.DELETE_CONTACT,
  payload: name,
});

export const selectContact = index => ({
  type: TYPE.SELECT_CONTACT,
  payload: index,
});
