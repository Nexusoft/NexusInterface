import React from 'react';
import * as TYPE from './actiontypes';
import * as RPC from 'scripts/rpc';
import config from 'api/configuration';
import UIController from 'components/UIController';

export const ImportContact = contact => {
  return dispatch => {
    dispatch({ type: TYPE.IMPORT_CONTACT, payload: contact });
  };
};

export const OpenModal = content => {
  return dispatch => {
    dispatch({ type: TYPE.SHOW_MODAL, payload: content });
  };
};

export const CloseModal = () => {
  return dispatch => {
    dispatch({ type: TYPE.HIDE_MODAL });
  };
};
export const SearchName = Search => {
  return dispatch => {
    dispatch({ type: TYPE.SEARCH, payload: Search });
  };
};
export const ContactSearch = contactSearch => {
  return dispatch => {
    dispatch({ type: TYPE.CONTACT_SEARCH, payload: contactSearch });
  };
};

export const clearSearch = () => {
  return dispatch => {
    dispatch({ type: TYPE.CLEAR_SEARCHBAR });
  };
};

export const clearPrototype = () => {
  return dispatch => {
    dispatch({ type: TYPE.CLEAR_PROTOTYPE });
  };
};

export const ToggleModal = () => {
  return dispatch => {
    dispatch({ type: TYPE.TOGGLE_MODAL_VIS_STATE });
  };
};

export const SetModalType = modalType => {
  return dispatch => {
    dispatch({ type: TYPE.SET_MODAL_TYPE, payload: modalType });
  };
};

export const EditProtoName = name => {
  return dispatch => {
    dispatch({ type: TYPE.EDIT_NAME, payload: name });
  };
};

export const EditProtoPhone = phone => {
  return dispatch => {
    dispatch({ type: TYPE.EDIT_PHONE, payload: phone });
  };
};

export const EditProtoNotes = notes => {
  return dispatch => {
    dispatch({ type: TYPE.EDIT_NOTES, payload: notes });
  };
};

export const EditProtoAddress = add => {
  return dispatch => {
    dispatch({ type: TYPE.EDIT_ADDRESS, payload: add });
  };
};

export const EditProtoTZ = TZ => {
  return dispatch => {
    dispatch({ type: TYPE.EDIT_TIMEZONE, payload: TZ });
  };
};

export const EditProtoLabel = label => {
  return dispatch => {
    dispatch({ type: TYPE.EDIT_ADDRESS_LABEL, payload: label });
  };
};

export const SelectedContact = contact => {
  return dispatch => {
    dispatch({ type: TYPE.SELECTED_CONTACT, payload: contact });
  };
};

export const MyAccountsList = list => {
  return dispatch => {
    dispatch({ type: TYPE.MY_ACCOUNTS_LIST, payload: list });
  };
};

export const LabelToggler = (label, address) => {
  return dispatch => {
    dispatch({
      type: TYPE.TOGGLE_ADDRESS_LABEL_EDIT,
      payload: { label: label, address: address },
    });
  };
};

export const SaveLabel = (selected, address, label, mine) => {
  let newEntry = { ismine: mine, address: address, label: label };

  return dispatch => {
    dispatch({
      type: TYPE.SAVE_ADDRESS_LABEL,
      payload: {
        newEntry: newEntry,
        address: address,
        newLabel: label,
        index: selected,
        ismine: mine,
      },
    });
  };
};

export const NotesToggler = notes => {
  return dispatch => {
    dispatch({
      type: TYPE.TOGGLE_NOTES_EDIT,
      payload: notes,
    });
  };
};

export const SaveNotes = (selected, notes) => {
  return dispatch => {
    dispatch({
      type: TYPE.SAVE_NOTES,
      payload: { notes: notes, index: selected },
    });
  };
};

export const TzToggler = TZ => {
  return dispatch => {
    dispatch({
      type: TYPE.TOGGLE_TIMEZONE_EDIT,
      payload: TZ,
    });
  };
};

export const SaveTz = (selected, TZ) => {
  return dispatch => {
    dispatch({
      type: TYPE.SAVE_TIMEZONE,
      payload: { TZ: TZ, index: selected },
    });
  };
};

export const NameToggler = name => {
  return dispatch => {
    dispatch({
      type: TYPE.TOGGLE_NAME_EDIT,
      payload: name,
    });
  };
};

export const SaveName = (selected, name) => {
  return dispatch => {
    dispatch({
      type: TYPE.SAVE_NAME,
      payload: { name: name, index: selected },
    });
  };
};

export const PhoneToggler = phone => {
  return dispatch => {
    dispatch({
      type: TYPE.TOGGLE_PHONE_EDIT,
      payload: phone,
    });
  };
};

export const SavePhone = (selected, Phone) => {
  return dispatch => {
    dispatch({
      type: TYPE.SAVE_PHONE,
      payload: { Phone: Phone, index: selected },
    });
  };
};

export const ChangeContactImage = (path, contact) => {
  return dispatch => {
    dispatch({
      type: TYPE.CONTACT_IMAGE,
      payload: { path: path, contact: contact },
    });
  };
};

export const ToggleSaveFlag = () => {
  return dispatch => {
    dispatch({ type: TYPE.CLEAR_PROTOTYPE });
    dispatch({ type: TYPE.SET_SAVE_FLAG_FALSE });
  };
};

export const SetMousePosition = (type, actionItem) => {
  return dispatch => {
    dispatch({
      type: TYPE.SET_MOUSE_POSITION,
      payload: {
        type: type,
        actionItem: actionItem,
      },
    });
  };
};

export const AddContact = (name, address, num, notes, TZ) => {
  let mine = [];
  let notMine = [];
  return dispatch => {
    RPC.PROMISE('validateaddress', [address])
      .then(payload => {
        if (payload.isvalid) {
          if (payload.ismine) {
            mine.push({
              label: `My Address for `,
              ismine: true,
              address: address,
            });
          } else {
            notMine.push({
              label: `'s Address`,
              ismine: false,
              address: address,
            });
          }
        } else {
          UIController.showNotification(
            <div>Invalid address {address}</div>,
            'error'
          );
        }
        return { mine: mine, notMine: notMine };
      })
      .then(result => {
        dispatch({
          type: TYPE.ADD_NEW_CONTACT,
          payload: {
            name: name,
            mine: result.mine,
            notMine: result.notMine,
            notes: notes,
            timezone: TZ,
            phoneNumber: num,
          },
        });

        dispatch({ type: TYPE.TOGGLE_MODAL_VIS_STATE });
      })
      .catch(e => {
        UIController.showNotification(
          <div>Invalid address {address}</div>,
          'error'
        );
      });
  };
};

// export const OpenErrorModal = type => {
//   return dispatch => {
//     dispatch({ type: TYPE.SHOW_ERROR_MODAL, payload: type });
//   };
// };

export const AddAddress = (name, address, index) => {
  return dispatch => {
    RPC.PROMISE('validateaddress', [address])
      .then(payload => {
        if (payload.isvalid) {
          if (payload.ismine) {
            return {
              label: `My Address for `,
              ismine: true,
              address: address,
            };
          } else {
            return {
              label: `'s Address`,
              ismine: false,
              address: address,
            };
          }
        } else {
          UIController.showNotification(
            <div>Invalid address {address}</div>,
            'error'
          );
        }
      })
      .then(result => {
        dispatch({
          type: TYPE.ADD_NEW_ADDRESS,
          payload: { newAddress: result, index: index },
        });
        dispatch({ type: TYPE.CLEAR_PROTOTYPE });
        dispatch({ type: TYPE.TOGGLE_MODAL_VIS_STATE });
        dispatch({ type: TYPE.SHOW_MODAL, payload: 'Address Added' });
      })
      .catch(e => {
        dispatch({ type: TYPE.CLEAR_PROTOTYPE });
        dispatch({ type: TYPE.TOGGLE_MODAL_VIS_STATE });
        UIController.showNotification(<div>Invalid address {e}</div>, 'error');
      });
  };
};

export const DeleteContact = actionItem => {
  return dispatch => {
    dispatch({
      type: TYPE.DELETE_CONTACT,
      payload: actionItem,
    });
  };
};

export const DeleteAddress = (actionItem, selectedIndex) => {
  return dispatch => {
    dispatch({
      type: TYPE.DELETE_ADDRESS_FROM_CONTACT,
      payload: { ...actionItem, selectedContactIndex: selectedIndex },
    });
  };
};

export const ToggleCreateModal = () => {
  return dispatch => {
    dispatch({
      type: TYPE.TOGGLE_CREATE_ADDRESS,
    });
  };
};
