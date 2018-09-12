import * as TYPE from "../actions/actiontypes";

const initialState = {
  loggedIn: false,
  googleanalytics: null,
  encrypted: false,
  busyFlag: false,
  open: false,
  openSecondModal: false,
  openThirdModal: false,
  modaltype: "",
  confirmation: false,
  actionItem: "",
  modalVisable: false,
  heighestPeerBlock: 0,
  isInSync: false,
  blockDate: "Getting Next Block...",
  portAvailable: false
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.LOCK:
      return {
        ...state,
        loggedIn: false
      };
      break;
    case TYPE.TOGGLE_MODAL_VIS_STATE:
      return {
        ...state,
        modalVisable: !state.modalVisable
      };
      break;
    case TYPE.SET_SYNC_STATUS:
      return { ...state, isInSync: action.payload };
      break;
    case TYPE.TOGGLE_BUSY_FLAG:
      return {
        ...state,
        busyFlag: !state.busyFlag
      };
      break;
    case TYPE.UNLOCK:
      return {
        ...state,
        loggedIn: true
      };
      break;
    case TYPE.UNENCRYPTED:
      return {
        ...state,
        encrypted: false
      };
      break;
    case TYPE.BLOCK_DATE:
      return {
        ...state,
        blockDate: action.payload
      };

    case TYPE.SHOW_MODAL:
      return {
        ...state,
        open: true,
        modaltype: action.payload
      };
      break;
    case TYPE.HIDE_MODAL:
      return {
        ...state,
        open: false
      };
      break;
    case TYPE.SHOW_MODAL2:
      return {
        ...state,
        openSecondModal: true,
        modaltype: action.payload
      };
      break;

    case TYPE.HIDE_MODAL2:
      return {
        ...state,
        openSecondModal: false
      };
      break;
    case TYPE.SHOW_MODAL3:
      return {
        ...state,
        openThirdModal: true,
        modaltype: action.payload
      };
      break;

    case TYPE.HIDE_MODAL3:
      return {
        ...state,
        openThirdModal: false,
        modaltype: action.payload
      };
      break;
    case TYPE.SET_HIGHEST_PEER_BLOCK:
      return {
        ...state,
        heighestPeerBlock: action.payload
      };
    case TYPE.ENCRYPTED:
      return {
        ...state,
        encrypted: true
      };
      break;
    case TYPE.SET_GOOGLEANALYTICS:
      return {
        ...state,
        googleanalytics: action.payload
      };
      break;

    case TYPE.PORT_AVAILABLE:
      return {
        ...state,
        portAvailable: action.payload
      };
      break;

    default:
      return state;
  }
};
