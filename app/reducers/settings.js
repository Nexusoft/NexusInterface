import * as TYPE from "../actions/actiontypes";

const initialState = {
  settings: {
    manualDaemon: true,
    acceptedagreement: false,
    experimentalWarning: true,
    windowWidth: 1600,
    windowHeight: 1388,
    devMode: false
  },
  customStyling: {
    MC1: "#111111",
    MC2: "#0ca4fb",
    MC3: "#556070",
    MC4: "#34495e",
    MC5: "#ffffff"
  },
  ignoreEncryptionWarningFlag: false,
  experimentalOpen: true,
  saveSettings: false,
  styleChangeFlag: false
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.GET_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
      break;
    case TYPE.SET_EXPERIMENTAL_WARNING:
      if (action.payload) {
        return {
          ...state,
          settings: {
            ...state.settings,
            experimentalWarning: false
          },
          saveSettingsFlag: true
        };
      } else {
        return {
          ...state,
          experimentalOpen: false
        };
      }
      break;
    case TYPE.IGNORE_ENCRYPTION_WARNING:
      return {
        ...state,
        ignoreEncryptionWarningFlag: true
      };
      break;
    case TYPE.ACCEPT_MIT:
      return {
        ...state,
        settings: {
          ...state.settings,
          acceptedagreement: true
        },
        saveSettingsFlag: true
      };
      break;
    case TYPE.TOGGLE_SAVE_SETTINGS_FLAG:
      return {
        ...state,
        saveSettingsFlag: false
      };
      break;
    case TYPE.CHANGE_COLOR_1:
      return {
        ...state,
        customStyling: {
          ...state.customStyling,
          MC1: action.payload
        },
        styleChangeFlag: true
      };
      break;
    case TYPE.UNSET_STYLE_FLAG:
      return {
        ...state,
        styleChangeFlag: false
      };
      break;
    default:
      return state;
  }
};
