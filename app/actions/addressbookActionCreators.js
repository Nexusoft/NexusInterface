import * as TYPE from "./actiontypes";
import * as RPC from "../script/rpc";
import config from "../api/configuration";

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

export const SelectedContact = contact => {
  return dispatch => {
    dispatch({ type: TYPE.SELECTED_CONTACT, payload: contact });
  };
};

export const AddContact = (name, address, num, notes, TZ) => {
  let mine = [];
  let notMine = [];
  return dispatch => {
    RPC.PROMISE("validateaddress", [address])
      .then(payload => {
        if (payload.isvalid) {
          if (payload.ismine) {
            mine.push({
              label: `My Address for ${name}`,
              ismine: true,
              address: address
            });
          } else {
            notMine.push({
              label: `${name}'s Address`,
              ismine: false,
              address: address
            });
          }
        } else alert("Invalid address: ", address);
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
            phoneNumber: num
          }
        });
        dispatch({ type: TYPE.TOGGLE_MODAL_VIS_STATE });
      })
      .catch(e => {
        console.log(e);
      });
  };
};
