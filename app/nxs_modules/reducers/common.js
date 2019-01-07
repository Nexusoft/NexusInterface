import * as TYPE from 'actions/actiontypes';

const initialState = {
  loggedIn: false,
  encrypted: false,
  busyFlag: false,
  open: false,
  openSecondModal: false,
  openThirdModal: false,
  openFourthModal: false,
  openErrorDialog: false,
  modaltype: '',
  confirmation: false,
  actionItem: '',
  modalVisable: false,
  heighestPeerBlock: 0,
  isInSync: false,
  blockDate: null,
  portAvailable: false,
  Search: '',
  contactSearch: '',
  rpcCallList: [],
  rawBTCvalues: [],
  rawNXSvalues: [],
  displayBTCvalues: [],
  displayNXSvalues: [],
  BootstrapModal: false,
  encryptionModalShown: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.LOCK:
      return {
        ...state,
        loggedIn: false,
      };
      break;
    case TYPE.TOGGLE_MODAL_VIS_STATE:
      return {
        ...state,
        modalVisable: !state.modalVisable,
      };
      break;
    case TYPE.OPEN_BOOTSTRAP_MODAL:
      return {
        ...state,
        BootstrapModal: action.payload,
      };
      break;
    case TYPE.CLOSE_BOOTSTRAP_MODAL:
      return {
        ...state,
        BootstrapModal: false,
      };
      break;
    case TYPE.SEARCH:
      return {
        ...state,
        Search: action.payload,
      };
      break;
    case TYPE.CONTACT_SEARCH:
      return {
        ...state,
        contactSearch: action.payload,
      };
      break;
    case TYPE.SET_SYNC_STATUS:
      return { ...state, isInSync: action.payload };
      break;
    case TYPE.TOGGLE_BUSY_FLAG:
      return {
        ...state,
        busyFlag: action.payload,
      };
      break;
    case TYPE.UNLOCK:
      return {
        ...state,
        loggedIn: true,
      };
      break;
    case TYPE.UNENCRYPTED:
      return {
        ...state,
        encrypted: false,
      };
      break;
    case TYPE.BLOCK_DATE:
      return {
        ...state,
        blockDate: action.payload,
      };

    case TYPE.SHOW_MODAL:
      return {
        ...state,
        open: true,
        modaltype: action.payload,
      };
      break;
    case TYPE.HIDE_MODAL:
      return {
        ...state,
        open: false,
      };
      break;
    case TYPE.SHOW_MODAL2:
      return {
        ...state,
        openSecondModal: true,
        modaltype: action.payload,
      };
      break;

    case TYPE.HIDE_MODAL2:
      return {
        ...state,
        openSecondModal: false,
      };
      break;
    case TYPE.SHOW_MODAL3:
      return {
        ...state,
        openThirdModal: true,
        modaltype: action.payload,
      };
      break;

    case TYPE.HIDE_MODAL3:
      return {
        ...state,
        openThirdModal: false,
        modaltype: action.payload,
      };
      break;
    case TYPE.SHOW_MODAL4:
      return {
        ...state,
        openFourthModal: true,
        modaltype: action.payload,
      };
      break;

    case TYPE.HIDE_MODAL4:
      return {
        ...state,
        openFourthModal: false,
        modaltype: action.payload,
      };
      break;
    case TYPE.SHOW_ERROR_MODAL:
      return {
        ...state,
        openErrorDialog: true,
        modaltype: action.payload,
      };
      break;

    case TYPE.HIDE_ERROR_MODAL:
      return {
        ...state,
        openErrorDialog: false,
      };
      break;
    case TYPE.SET_HIGHEST_PEER_BLOCK:
      return {
        ...state,
        heighestPeerBlock: action.payload,
      };
      break;
    case TYPE.CLEAR_SEARCHBAR:
      return {
        ...state,
        Search: '',
        contactSearch: '',
      };
      break;
    case TYPE.ENCRYPTED:
      return {
        ...state,
        encrypted: true,
      };
      break;

    case TYPE.PORT_AVAILABLE:
      return {
        ...state,
        portAvailable: action.payload,
      };
      break;
    case TYPE.ADD_RPC_CALL:
      let oldArray = state.rpcCallList;
      oldArray.push(action.payload);
      return {
        ...state,
        rpcCallList: oldArray,
      };
    case TYPE.SET_MKT_AVE_DATA:
      return {
        ...state,
        displayBTCvalues: action.payload.displayBTC,
        rawBTCvalues: action.payload.rawBTC,
        displayNXSvalues: action.payload.displayNXS,
        rawNXSvalues: action.payload.rawNXS,
      };
      break;
    case TYPE.SHOW_ENCRYPTION_MODAL:
      return {
        ...state,
        encryptionModalShown: true,
      };
    default:
      return state;
  }
};
