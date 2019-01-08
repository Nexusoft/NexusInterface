import * as TYPE from 'actions/actiontypes';
// import messages from '../languages/messages'
import configuration from 'api/configuration';
import { getMessages } from 'utils/language';

const path = require('path');
let defaultWallpaperPath = '';
if (process.env.NODE_ENV === 'development') {
  defaultWallpaperPath = './images/background/starrynight.jpg';
} else {
  defaultWallpaperPath = path.join(
    configuration.GetAppResourceDir(),
    'images',
    'background',
    'starrynight.jpg'
  );
  if (process.platform === 'win32') {
    defaultWallpaperPath = defaultWallpaperPath.replace(/\\/g, '/');
  }
}
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
  manualDaemonModal: false,
  messages: getMessages('en'),
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_SETTINGS:
      return { ...state, settings: { ...state.settings, ...action.payload } };
      break;
    case TYPE.SWITCH_LOCALES:
      return {
        ...state,
        settings: { ...state.settings, locale: action.payload },
      };
      break;
    case TYPE.SWITCH_MESSAGES:
      return { ...state, messages: action.payload };
      break;
    case TYPE.SEE_FOLDER:
      return {
        ...state,
        settings: { ...state.settings, Folder: action.payload },
      };
      break;
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
      break;
    case TYPE.IGNORE_ENCRYPTION_WARNING:
      return {
        ...state,
        settings: { ...state.settings, ignoreEncryptionWarningFlag: true },
      };
      break;
    case TYPE.OPEN_MANUAL_DAEMON_MODAL:
      return { ...state, manualDaemonModal: true };
      break;
    case TYPE.UPDATE_MANUAL_DAEMON_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, manualDaemon: action.payload },
      };
      break;
    case TYPE.CLOSE_MANUAL_DAEMON_MODAL:
      return { ...state, manualDaemonModal: false };
      break;
    case TYPE.ACCEPT_MIT:
      return {
        ...state,
        settings: { ...state.settings, acceptedagreement: true },
        saveSettingsFlag: true,
      };
      break;
    case TYPE.TOGGLE_SAVE_SETTINGS_FLAG:
      return { ...state, saveSettingsFlag: false };
      break;
    case TYPE.SET_WALLPAPER:
      return {
        ...state,
        settings: { ...state.settings, wallpaper: action.payload },
      };
      break;
    case TYPE.CLOSE_BOOTSTRAP_MODAL:
      return { ...state, settings: { ...state.settings, bootstrap: false } };
      break;
    case TYPE.CUSTOMIZE_STYLING:
      return {
        ...state,
        settings: { ...state.settings, customStyling: action.payload },
      };
      break;
    case TYPE.RESET_CUSTOM_STYLING:
      return {
        ...state,
        settings: {
          ...state.settings,
          customStyling: initialState.settings.customStyling,
        },
      };
      break;
    case TYPE.TOGGLE_GLOBE_RENDER:
      return {
        ...state,
        settings: {
          ...state.settings,
          renderGlobe: !state.settings.renderGlobe,
        },
      };
      break;
    case TYPE.UNSET_STYLE_FLAG:
      return { ...state, styleChangeFlag: false };
      break;
    case TYPE.SET_FIAT_CURRENCY:
      return {
        ...state,
        settings: { ...state.settings, fiatCurrency: action.payload },
      };
      break;
    case TYPE.SET_MIN_CONFIRMATIONS:
      return {
        ...state,
        settings: { ...state.settings, minimumconfirmations: action.payload },
      };
      break;
    default:
      return state;
  }
};
