import * as TYPE from 'actions/actiontypes';

let BackupDir = process.env.HOME + '/NexusBackups';
if (process.platform === 'win32') {
  BackupDir = process.env.USERPROFILE + '/NexusBackups';
  BackupDir = BackupDir.replace(/\\/g, '/');
}
const initialState = {
  settings: {
    manualDaemon: false,
    verbose: '2',
    acceptedagreement: false,
    experimentalWarning: true,
    bootstrap: true,
    windowWidth: 1600,
    windowHeight: 1388,
    devMode: false,
    wallpaper: '',
    renderGlobe: true,
    fiatCurrency: 'USD',
    locale: 'en',
    Folder: BackupDir,
    verboseLevel: '2',
    mapPortUsingUpnp: true,
    customStyling: {},
    NXSlogoRGB: 'rgb(0,174,239)',
    footerRGB: 'rgb(0,174,239)',
    footerActiveRGB: 'rgb(0,174,239)',
    footerHoverRGB: 'rgb(0,174,239)',
    iconMenuRGB: 'rgb(0,174,239)',
    ignoreEncryptionWarningFlag: false,
    experimentalOpen: true,
    saveSettings: false,
    styleChangeFlag: false,
    selectedColorProp: 'MC1',
    minimumconfirmations: 3,
  },
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.UPDATE_SETTINGS:
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case TYPE.SWITCH_LOCALES:
      return {
        ...state,
        settings: { ...state.settings, locale: action.payload },
      };
    case TYPE.SWITCH_MESSAGES:
      return { ...state, messages: action.payload };
    case TYPE.SEE_FOLDER:
      return {
        ...state,
        settings: { ...state.settings, Folder: action.payload },
      };
    case TYPE.SET_EXPERIMENTAL_WARNING:
      if (action.payload) {
        return {
          ...state,
          settings: { ...state.settings, experimentalWarning: false },
          saveSettingsFlag: true,
        };
      } else {
        return { ...state, experimentalOpen: false };
      }
    case TYPE.IGNORE_ENCRYPTION_WARNING:
      return {
        ...state,
        settings: { ...state.settings, ignoreEncryptionWarningFlag: true },
      };
    case TYPE.OPEN_MANUAL_DAEMON_MODAL:
      return { ...state, manualDaemonModal: true };
    case TYPE.UPDATE_MANUAL_DAEMON_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, manualDaemon: action.payload },
      };
    case TYPE.CLOSE_MANUAL_DAEMON_MODAL:
      return { ...state, manualDaemonModal: false };
    case TYPE.ACCEPT_MIT:
      return {
        ...state,
        settings: { ...state.settings, acceptedagreement: true },
        saveSettingsFlag: true,
      };
    case TYPE.TOGGLE_SAVE_SETTINGS_FLAG:
      return { ...state, saveSettingsFlag: false };
    case TYPE.SET_WALLPAPER:
      return {
        ...state,
        settings: { ...state.settings, wallpaper: action.payload },
      };
    case TYPE.CLOSE_BOOTSTRAP_MODAL:
      return { ...state, settings: { ...state.settings, bootstrap: false } };
    case TYPE.CUSTOMIZE_STYLING:
      return {
        ...state,
        settings: { ...state.settings, customStyling: action.payload },
      };
    case TYPE.RESET_CUSTOM_STYLING:
      return {
        ...state,
        settings: {
          ...state.settings,
          customStyling: initialState.settings.customStyling,
        },
      };
    case TYPE.TOGGLE_GLOBE_RENDER:
      return {
        ...state,
        settings: {
          ...state.settings,
          renderGlobe: !state.settings.renderGlobe,
        },
      };
    case TYPE.UNSET_STYLE_FLAG:
      return { ...state, styleChangeFlag: false };
    case TYPE.SET_FIAT_CURRENCY:
      return {
        ...state,
        settings: { ...state.settings, fiatCurrency: action.payload },
      };
    case TYPE.SET_MIN_CONFIRMATIONS:
      return {
        ...state,
        settings: { ...state.settings, minimumconfirmations: action.payload },
      };
    default:
      return state;
  }
};
