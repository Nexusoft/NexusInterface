import * as TYPE from 'actions/actiontypes';

const initialState = {
  settings: {},
  theme: {
    globePillarColor: '#00ffff',
    globeArchColor: '#00ffff',
    globeColor: '#0097e4',
  },
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
        theme: { ...state.theme, ...action.payload.theme },
      };
    case TYPE.SET_WALLPAPER:
      return {
        ...state,
        theme: { ...state.theme, wallpaper: action.payload },
      };
    case TYPE.CUSTOMIZE_STYLING:
      return {
        ...state,
        theme: action.payload,
      };
    case TYPE.RESET_CUSTOM_STYLING:
      return {
        ...state,
        theme: initialState.theme,
      };
    default:
      return state;
  }
};
