import * as TYPE from 'consts/actionTypes';

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.LOAD_MODULES:
      return action.payload;

    case TYPE.ADD_DEV_MODULE:
      return {
        [action.payload.info.name]: action.payload,
        ...state,
      };

    case TYPE.UPDATE_MODULES_LATEST: {
      const newState = { ...state };
      const updates = action.payload;
      Object.values(newState).forEach((module) => {
        const update = updates[module.info.name];
        if (update) {
          newState[module.info.name] = {
            ...module,
            hasNewVersion: true,
            latestVersion: update.version,
            latestRelease: update.release,
          };
        } else {
          newState[module.info.name] = { ...module, hasNewVersion: false };
        }
      });
      return newState;
    }

    default:
      return state;
  }
};
